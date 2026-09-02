import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// ─────────────────────────────────────────────────────────────────────────────
// SMALL GROUPS · Tier 2
//
// En California el apoyo se organiza como MTSS, en tres niveles: Tier 1 es la
// instruccion para todos, Tier 2 es apoyo focalizado para los que no responden,
// y Tier 3 es intervencion intensiva. Esta pantalla ES el Tier 2.
//
// La guia oficial (Resource Guide to the Foundational Skills, CDE) dice dos
// cosas que definen como agrupa este endpoint:
//
//   "Small groups of children with similar phonological awareness skills"
//   -> se agrupa por la HABILIDAD que falta, no por el nivel general del chico
//
//   "Students who are not progressing as expected should be provided additional
//    targeted instruction and support without delay"
//   -> por eso se mira la ultima evaluacion de cada actividad, no el promedio
//
// Nada de esto lo decide la IA: los grupos salen de la evidencia que cargo la
// maestra, y la guia pedagogica sale de tablas. La IA no interviene aca.
// ─────────────────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ehwlulqcwimatxmnajra.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_q-qtEDnI0QxcrTt3pQIh8w_vbmnQZS1"
)

// Cuantos dias hacia atras se mira. Mas de tres semanas y el dato ya no
// describe al chico de hoy.
const VENTANA_DIAS = 21
// Un grupo de uno no es un grupo: es una conversacion individual, y va aparte.
const MINIMO_POR_GRUPO = 2

type Estado = "green" | "yellow" | "red"

interface ChicoEnGrupo {
  id: string
  nombre: string
  estado: Estado
  fase?: string | null       // fase de Ehri
  hebra?: string | null      // hebra de Scarborough donde necesita apoyo
  esEL?: boolean
}

interface Grupo {
  estandar: string
  estandarTexto: string
  habilidad: string
  actividad: string
  eje: string
  urgencia: "alta" | "media"
  chicos: ChicoEnGrupo[]
  enRojo: number
  // lo que ALBA le da a la maestra para trabajar con este grupo
  porQueImporta: string | null
  errorTipico: string | null
  trampaDocente: string | null
  comoAgrupar: string | null
  cuandoIntervenir: string | null
  cautelaEL: string | null
  queObservar: string[]
  refuerzo: {
    titulo: string
    objetivo: string
    desarrollo: string
    materiales: string[]
    microCapacitacion: string | null
    tips: string[]
    referencia: string | null
    observar: string[]
  } | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sala = searchParams.get("sala")

  if (!sala) {
    return NextResponse.json({ error: "Falta parametro sala" }, { status: 400 })
  }

  try {
    // ── 1. Los chicos del aula ────────────────────────────────────────────
    const { data: alumnos, error: errAl } = await supabase
      .from("alumnos")
      .select("id, nombre, sala, grade_level")
      .eq("sala", sala)

    if (errAl) return NextResponse.json({ error: errAl.message }, { status: 500 })
    if (!alumnos || alumnos.length === 0) {
      return NextResponse.json({ ok: true, grupos: [], mensaje: "No students in this classroom yet" })
    }

    const ids = alumnos.map((a) => a.id)
    const nombrePorId: Record<string, string> = {}
    alumnos.forEach((a) => { nombrePorId[a.id] = a.nombre })
    const nivel = alumnos[0]?.grade_level ?? null

    // ── 2. La evidencia de las ultimas tres semanas ───────────────────────
    const desde = new Date(Date.now() - VENTANA_DIAS * 24 * 60 * 60 * 1000).toISOString()
    const { data: seg, error: errSeg } = await supabase
      .from("seguimiento")
      .select("alumno_id, actividad, eje, estado, fecha")
      .in("alumno_id", ids)
      .gte("fecha", desde)
      .order("fecha", { ascending: false })

    if (errSeg) return NextResponse.json({ error: errSeg.message }, { status: 500 })

    // ── 3. Solo la ULTIMA evaluacion de cada chico en cada actividad ──────
    // Si el chico ya lo remonto, no tiene que seguir apareciendo en el grupo.
    const ultima = new Map<string, { alumno_id: string; actividad: string; eje: string; estado: Estado }>()
    for (const r of seg || []) {
      const clave = `${r.alumno_id}||${r.actividad}`
      if (!ultima.has(clave)) {
        ultima.set(clave, { alumno_id: r.alumno_id, actividad: r.actividad, eje: r.eje, estado: r.estado as Estado })
      }
    }

    // ── 4. Agrupar por actividad: los que comparten la misma dificultad ───
    const porActividad = new Map<string, { eje: string; chicos: { id: string; estado: Estado }[] }>()
    for (const r of ultima.values()) {
      if (r.estado === "green") continue
      if (!porActividad.has(r.actividad)) porActividad.set(r.actividad, { eje: r.eje, chicos: [] })
      porActividad.get(r.actividad)!.chicos.push({ id: r.alumno_id, estado: r.estado })
    }

    const actividadesConGrupo = [...porActividad.entries()]
      .filter(([, g]) => g.chicos.length >= MINIMO_POR_GRUPO)
      .map(([titulo]) => titulo)

    if (actividadesConGrupo.length === 0) {
      return NextResponse.json({
        ok: true, sala, nivel, grupos: [], individuales: [],
        mensaje: "No small groups needed right now: everyone is meeting the target.",
      })
    }

    // ── 5. Traer lo pedagogico. Nada de esto se genera: se lee. ───────────
    const { data: acts } = await supabase
      .from("activities")
      .select("titulo, objetivo, descripcion, materiales, ccss_code, eje, mc_contenido, mc_tips, mc_referencia, mc_observar")
      .in("titulo", actividadesConGrupo)

    const actPorTitulo: Record<string, any> = {}
    ;(acts || []).forEach((a) => { actPorTitulo[a.titulo] = a })

    const codigos = [...new Set((acts || []).map((a) => a.ccss_code).filter(Boolean))]

    const { data: stds } = await supabase
      .from("standards")
      .select("code, descripcion, cluster")
      .in("code", codigos)
    const stdPorCodigo: Record<string, any> = {}
    ;(stds || []).forEach((s) => { stdPorCodigo[s.code] = s })

    // La guia de enseñanza se busca por el estandar: una guia cubre varios.
    const { data: guias } = await supabase
      .from("teaching_guidance")
      .select("skill_area, applies_to, why_it_matters, common_error, teacher_pitfall, look_for, el_caution, when_to_intervene, grouping")
    const guiaDe = (code: string) =>
      (guias || []).find((g: any) => Array.isArray(g.applies_to) && g.applies_to.includes(code)) || null

    // ── 6. El diagnostico de cada chico, para enriquecer el grupo ─────────
    const { data: diag } = await supabase
      .from("us_foundational_assessments")
      .select("student_id, orthographic_phase, scarborough_strand")
      .in("student_id", ids)
    const diagPorChico: Record<string, any> = {}
    ;(diag || []).forEach((d) => { diagPorChico[d.student_id] = d })

    // ── 7. Armar los grupos ───────────────────────────────────────────────
    const grupos: Grupo[] = []
    for (const [titulo, g] of porActividad.entries()) {
      if (g.chicos.length < MINIMO_POR_GRUPO) continue
      const act = actPorTitulo[titulo]
      const code = act?.ccss_code ?? ""
      const std = stdPorCodigo[code]
      const guia: any = code ? guiaDe(code) : null
      const enRojo = g.chicos.filter((c) => c.estado === "red").length

      grupos.push({
        estandar: code,
        estandarTexto: std?.descripcion ?? "",
        habilidad: guia?.skill_area ?? std?.cluster ?? "",
        actividad: titulo,
        eje: g.eje,
        // Alta si hay dos o mas en rojo: son los que la guia manda atender sin demora.
        urgencia: enRojo >= 2 ? "alta" : "media",
        enRojo,
        chicos: g.chicos
          .map((c) => ({
            id: c.id,
            nombre: nombrePorId[c.id] ?? "",
            estado: c.estado,
            fase: diagPorChico[c.id]?.orthographic_phase ?? null,
            hebra: diagPorChico[c.id]?.scarborough_strand ?? null,
          }))
          .sort((a, b) => (a.estado === b.estado ? a.nombre.localeCompare(b.nombre) : a.estado === "red" ? -1 : 1)),
        porQueImporta: guia?.why_it_matters ?? null,
        errorTipico: guia?.common_error ?? null,
        trampaDocente: guia?.teacher_pitfall ?? null,
        comoAgrupar: guia?.grouping ?? null,
        cuandoIntervenir: guia?.when_to_intervene ?? null,
        cautelaEL: guia?.el_caution ?? null,
        queObservar: Array.isArray(guia?.look_for) ? guia.look_for : [],
        refuerzo: act
          ? {
              titulo: act.titulo,
              objetivo: act.objetivo ?? "",
              desarrollo: act.descripcion ?? "",
              materiales: Array.isArray(act.materiales) ? act.materiales : [],
              microCapacitacion: act.mc_contenido ?? null,
              tips: Array.isArray(act.mc_tips) ? act.mc_tips : [],
              referencia: act.mc_referencia ?? null,
              observar: Array.isArray(act.mc_observar) ? act.mc_observar : [],
            }
          : null,
      })
    }

    // Primero los que tienen mas chicos en rojo: es donde la demora cuesta mas.
    grupos.sort((a, b) => (b.enRojo - a.enRojo) || (b.chicos.length - a.chicos.length))

    // ── 8. Los que quedaron solos: no son grupo, son seguimiento individual ─
    const individuales = [...porActividad.entries()]
      .filter(([, g]) => g.chicos.length === 1)
      .map(([titulo, g]) => ({
        actividad: titulo,
        alumnoId: g.chicos[0].id,
        nombre: nombrePorId[g.chicos[0].id] ?? "",
        estado: g.chicos[0].estado,
        estandar: actPorTitulo[titulo]?.ccss_code ?? "",
      }))

    // ── 9. Los que ya llegaron: candidatos a enriquecimiento ──────────────
    const conDificultad = new Set(grupos.flatMap((g) => g.chicos.map((c) => c.id)))
    const listos = alumnos
      .filter((a) => !conDificultad.has(a.id))
      .map((a) => ({
        id: a.id,
        nombre: a.nombre,
        fase: diagPorChico[a.id]?.orthographic_phase ?? null,
        hebra: diagPorChico[a.id]?.scarborough_strand ?? null,
      }))

    return NextResponse.json({
      ok: true,
      sala,
      nivel,
      generado: new Date().toISOString(),
      ventanaDias: VENTANA_DIAS,
      resumen: {
        totalChicos: alumnos.length,
        enTier2: conDificultad.size,
        gruposUrgentes: grupos.filter((g) => g.urgencia === "alta").length,
        totalGrupos: grupos.length,
      },
      grupos,
      individuales,
      listosParaEnriquecer: listos,
    })
  } catch (e: any) {
    console.error("[small-groups] error:", e?.message)
    return NextResponse.json({ error: "No se pudo armar los grupos" }, { status: 500 })
  }
}
