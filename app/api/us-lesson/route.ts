import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// ─────────────────────────────────────────────────────────────────────────────
// TODAY'S LESSON · la clase del dia de ALBA US
//
// Este endpoint contesta una sola pregunta: que da hoy esta aula.
//
// Y la contesta SIN IA. La secuencia esta en la tabla activities, ordenada por
// seq dentro de cada eje y cada grado, y cada actividad esta atada por foreign
// key a un estandar real (activities.ccss_code references standards.code). Lo
// unico que hace este codigo es elegir cual toca, y la regla es:
//
//   1. El grado sale de los alumnos del aula (alumnos.grade_level).
//   2. El eje lo decide el motor de coaching, que mira la evidencia. Si no se
//      pasa ninguno, arranca por Phonological Awareness, que es el eje que
//      California pone primero en las Foundational Skills.
//   3. Dentro de ese eje y ese grado, la que toca es la de menor seq que el
//      aula NO dio en las ultimas tres semanas.
//   4. Si ya las dio todas, vuelve a la primera y lo dice (ciclo: true). No se
//      queda sin clase.
//
// Nada de esto lo decide un modelo. La secuencia es de las tablas, el filtro es
// de la evidencia que cargo la maestra, y el estandar viene de la foreign key.
// ─────────────────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ehwlulqcwimatxmnajra.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_q-qtEDnI0QxcrTt3pQIh8w_vbmnQZS1"
)

// Tres semanas. Mas atras que eso y la actividad ya se puede volver a dar.
const VENTANA_DIAS = 21

const EJE_POR_DEFECTO = "Phonological Awareness"

interface Lesson {
  titulo: string
  objetivo: string
  descripcion: string
  materiales: string[]
  ccss_code: string
  standardTexto: string
  framework: string | null
  eje: string
  seq: number
  totalEnEje: number
  // la micro capacitacion que viaja con la actividad, no con el aula
  mcContenido: string | null
  mcTips: string[]
  mcReferencia: string | null
  mcObservar: string[]
  // English Language Development, los tres niveles del marco de California
  eldEmerging: string | null
  eldExpanding: string | null
  eldBridging: string | null
  fuente: string | null
}

function comoArray(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : []
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sala = searchParams.get("sala")
  const eje = searchParams.get("eje") || EJE_POR_DEFECTO

  if (!sala) {
    return NextResponse.json({ error: "Falta parametro sala" }, { status: 400 })
  }

  try {
    // ── 1. El aula ────────────────────────────────────────────────────────
    const { data: alumnos, error: errAl } = await supabase
      .from("alumnos")
      .select("id, nombre, sala, grade_level, english_learner")
      .eq("sala", sala)

    if (errAl) return NextResponse.json({ error: errAl.message }, { status: 500 })

    if (!alumnos || alumnos.length === 0) {
      return NextResponse.json({
        ok: true,
        sala,
        nivel: null,
        totalAlumnos: 0,
        englishLearners: 0,
        leccion: null,
        mensaje: "No students in this classroom yet",
      })
    }

    const ids = alumnos.map((a) => a.id)
    const nivel: string | null = alumnos[0]?.grade_level ?? null
    const englishLearners = alumnos.filter((a) => a.english_learner === true).length

    if (!nivel) {
      return NextResponse.json({
        ok: true,
        sala,
        nivel: null,
        totalAlumnos: alumnos.length,
        englishLearners,
        leccion: null,
        mensaje: "This classroom has no grade level set yet",
      })
    }

    // ── 2. Los estandares de esa area y ese grado ─────────────────────────
    //
    // OJO, esto se hace por el ESTANDAR y no por activities.eje, y la razon
    // importa: activities.eje guarda el codigo corto heredado de Argentina
    // (CF, CT, O, EA). El area de California vive en standards.cluster
    // ("Phonological Awareness", "Print Concepts", ...), que es exactamente el
    // mismo vocabulario que usan coaching_layers.skill_area y
    // teaching_guidance.skill_area. Filtrando por el estandar, la clase del
    // dia y la capacitacion hablan del mismo eje siempre, y no depende de que
    // diga una columna heredada.
    const { data: stdsArea, error: errStd } = await supabase
      .from("standards")
      .select("code, cluster, seq")
      .eq("grade_level", nivel)
      .eq("cluster", eje)
      .order("seq", { ascending: true })

    if (errStd) return NextResponse.json({ error: errStd.message }, { status: 500 })

    const codigosDelArea = (stdsArea || []).map((s: any) => s.code)

    if (codigosDelArea.length === 0) {
      return NextResponse.json({
        ok: true,
        sala,
        nivel,
        totalAlumnos: alumnos.length,
        englishLearners,
        eje,
        leccion: null,
        mensaje: `No standards loaded for ${nivel} in ${eje}`,
      })
    }

    // ── 3. La secuencia de actividades atadas a esos estandares ───────────
    //
    // NO se filtra por activities.grade_level a proposito. El grado ya viene
    // decidido por el estandar: los codigos que salieron del paso 2 son los de
    // ESTE grado (RF.K.2b es de Kindergarten por definicion, PTKLF es de TK), y
    // el foreign key garantiza que la actividad cuelga de uno de ellos.
    // Filtrar ademas por la columna grade_level de activities era pedir dos
    // veces lo mismo, y cuando esa columna no coincidia con alumnos.grade_level
    // el aula se quedaba sin clase: eso es exactamente lo que pasaba en
    // Kindergarten, que tenia estandares y actividades y devolvia null igual.
    // Una sola fuente de verdad para el grado, y es el estandar.
    const { data: acts, error: errAct } = await supabase
      .from("activities")
      .select(
        "titulo, objetivo, descripcion, materiales, ccss_code, eje, seq, fuente, " +
          "mc_contenido, mc_tips, mc_referencia, mc_observar, " +
          "eld_emerging, eld_expanding, eld_bridging"
      )
      .in("ccss_code", codigosDelArea)
      .eq("activa", true)
      .order("seq", { ascending: true })

    if (errAct) return NextResponse.json({ error: errAct.message }, { status: 500 })

    if (!acts || acts.length === 0) {
      return NextResponse.json({
        ok: true,
        sala,
        nivel,
        totalAlumnos: alumnos.length,
        englishLearners,
        eje,
        leccion: null,
        mensaje: `No activities loaded yet for ${nivel} in ${eje}`,
      })
    }

    // ── 4. Que dio esta aula en las ultimas tres semanas ──────────────────
    const desde = new Date(Date.now() - VENTANA_DIAS * 24 * 60 * 60 * 1000).toISOString()
    const { data: seg } = await supabase
      .from("seguimiento")
      .select("actividad, fecha")
      .in("alumno_id", ids)
      .gte("fecha", desde)

    const yaDadas = new Set<string>((seg || []).map((r: any) => String(r.actividad)))

    // ── 5. La que toca ────────────────────────────────────────────────────
    // La primera de la secuencia que todavia no dio. Si dio todas, vuelve a
    // empezar: una maestra nunca abre ALBA y no encuentra clase.
    const pendiente = acts.find((a: any) => !yaDadas.has(a.titulo))
    const ciclo = !pendiente
    const elegida: any = pendiente ?? acts[0]

    // ── 6. El estandar. Sale de la foreign key, no de un texto suelto. ────
    const { data: std } = await supabase
      .from("standards")
      .select("code, descripcion, framework, strand_name, cluster")
      .eq("code", elegida.ccss_code)
      .maybeSingle()

    const leccion: Lesson = {
      titulo: elegida.titulo,
      objetivo: elegida.objetivo ?? "",
      descripcion: elegida.descripcion ?? "",
      materiales: comoArray(elegida.materiales),
      ccss_code: elegida.ccss_code,
      standardTexto: std?.descripcion ?? "",
      framework: std?.framework ?? null,
      eje: elegida.eje,
      seq: elegida.seq,
      totalEnEje: acts.length,
      mcContenido: elegida.mc_contenido ?? null,
      mcTips: comoArray(elegida.mc_tips),
      mcReferencia: elegida.mc_referencia ?? null,
      mcObservar: comoArray(elegida.mc_observar),
      eldEmerging: elegida.eld_emerging ?? null,
      eldExpanding: elegida.eld_expanding ?? null,
      eldBridging: elegida.eld_bridging ?? null,
      fuente: elegida.fuente ?? null,
    }

    return NextResponse.json({
      ok: true,
      sala,
      nivel,
      totalAlumnos: alumnos.length,
      englishLearners,
      eje,
      ciclo,
      dadasEnLaVentana: acts.filter((a: any) => yaDadas.has(a.titulo)).length,
      leccion,
      // La lista va en la misma respuesta para que la pantalla de registro no
      // tenga que pedir los alumnos por separado: se abre con los datos puestos.
      alumnos: alumnos
        .map((a) => ({
          id: a.id,
          nombre: a.nombre,
          englishLearner: a.english_learner === true,
        }))
        .sort((x, y) => x.nombre.localeCompare(y.nombre)),
    })
  } catch (err) {
    console.error("Error en GET /api/us-lesson:", err)
    return NextResponse.json({ error: "No se pudo armar la clase del dia" }, { status: 500 })
  }
}
