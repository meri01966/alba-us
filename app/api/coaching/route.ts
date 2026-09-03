import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// ─────────────────────────────────────────────────────────────────────────────
// COACHING · la capacitacion que avanza
//
// Devuelve UNA capa de capacitacion para un aula. Nunca la misma dos veces.
// Cual sale no lo decide una lista: lo decide la evidencia que cargo la maestra.
//
// Cuatro estados del aula, en este orden de precedencia:
//
//   start    pocos registros todavia. Da la base, una sola vez.
//   pattern  algo concreto se repite en la evidencia. Interrumpe la secuencia
//            y va a eso. Es el estado que ninguna capacitacion generica puede dar.
//   green    el aula llego. Empuja hacia enriquecimiento en vez de callarse.
//   mixed    la semana normal. Avanza una capa de profundidad por vez.
//
// CERO llamadas a IA. Los estados salen de contar registros y los textos salen
// de la tabla coaching_layers. Si manana hay que auditar por que ALBA le mostro
// esto a esta maestra, la respuesta esta en coaching_served.motivo.
// ─────────────────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ehwlulqcwimatxmnajra.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_q-qtEDnI0QxcrTt3pQIh8w_vbmnQZS1"
)

// Mas de tres semanas y el dato ya no describe al aula de hoy.
const VENTANA_DIAS = 21
const VENTANA_DIAS_TEXTO = "tres semanas"
// Ventana mas larga solo para el chico que quedo solo: ese patron se define
// justamente por sostenerse en el tiempo.
const VENTANA_SOLO = 30

// Debajo de esto no hay evidencia suficiente para decir nada.
const MINIMO_PARA_OPINAR = 3
// Y para declarar un aula verde hace falta mas que tres registros buenos.
const MINIMO_PARA_VERDE = 10
const UMBRAL_VERDE = 0.8

// Orden en que se evaluan los patrones. Arriba lo que mas cuesta si se pasa por
// alto: un chico que nadie ve, y un chico al que se le lee mal la lengua.
const PRECEDENCIA_PATRONES = [
  "lone_student",
  "el_gap",
  "syllable_not_secure",
  "medial_vowel",
] as const

type Estado = "green" | "yellow" | "red"

interface Capa {
  id: string
  skill_area: string
  state: string
  ord: number | null
  trigger_key: string | null
  trigger_human: string
  titulo: string
  why_it_matters: string
  do_this: string
  watch_for: string[]
  el_note: string | null
  source: string | null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sala = searchParams.get("sala")
  const area = searchParams.get("area") || "Phonological Awareness"

  if (!sala) {
    return NextResponse.json({ error: "Falta parametro sala" }, { status: 400 })
  }

  try {
    const hoy = new Date().toISOString().split("T")[0]

    // ── 1. Si ya se le sirvio una capa hoy, es esa ────────────────────────
    // Recargar la pantalla no puede quemar una capa. La capacitacion es la del
    // dia, no la de cada visita.
    const { data: yaHoy } = await supabase
      .from("coaching_served")
      .select("layer_id, motivo")
      .eq("sala", sala)
      .eq("fecha", hoy)
      .maybeSingle()

    if (yaHoy?.layer_id) {
      const { data: capa } = await supabase
        .from("coaching_layers").select("*").eq("id", yaHoy.layer_id).maybeSingle()
      if (capa) {
        return NextResponse.json({
          ok: true, sala, area,
          estado: capa.state,
          motivo: yaHoy.motivo,
          yaServidaHoy: true,
          capa: formatear(capa),
        })
      }
    }

    // ── 2. Los chicos del aula ────────────────────────────────────────────
    const { data: alumnos, error: errAl } = await supabase
      .from("alumnos")
      .select("id, nombre, english_learner")
      .eq("sala", sala)

    if (errAl) return NextResponse.json({ error: errAl.message }, { status: 500 })
    if (!alumnos?.length) {
      return NextResponse.json({ ok: true, sala, capa: null, mensaje: "No students in this classroom yet" })
    }
    const ids = alumnos.map((a) => a.id)
    const esEL: Record<string, boolean> = {}
    alumnos.forEach((a) => { esEL[a.id] = !!a.english_learner })

    // ── 3. Que actividades pertenecen a esta area, y con que etiquetas ────
    // Se resuelve por tabla: actividad -> estandar -> cluster y etiquetas.
    // La IA no clasifica nada aca.
    const { data: acts } = await supabase
      .from("activities").select("titulo, ccss_code")
    const { data: stds } = await supabase
      .from("standards").select("code, cluster, pattern_tags")

    const stdPorCodigo: Record<string, { cluster: string; pattern_tags: string[] }> = {}
    ;(stds || []).forEach((s: any) => {
      stdPorCodigo[s.code] = { cluster: s.cluster, pattern_tags: s.pattern_tags || [] }
    })

    const infoActividad: Record<string, { code: string; tags: string[] }> = {}
    ;(acts || []).forEach((a: any) => {
      const st = stdPorCodigo[a.ccss_code]
      if (st && st.cluster === area) infoActividad[a.titulo] = { code: a.ccss_code, tags: st.pattern_tags }
    })

    // ── 4. La evidencia, quedandose con la ULTIMA de cada chico y actividad ─
    const desde = new Date(Date.now() - VENTANA_SOLO * 24 * 3600 * 1000).toISOString()
    const { data: seg, error: errSeg } = await supabase
      .from("seguimiento")
      .select("alumno_id, actividad, estado, fecha")
      .in("alumno_id", ids)
      .gte("fecha", desde)
      .order("fecha", { ascending: false })

    if (errSeg) return NextResponse.json({ error: errSeg.message }, { status: 500 })

    const corte21 = Date.now() - VENTANA_DIAS * 24 * 3600 * 1000
    const ultima = new Map<string, { alumno_id: string; actividad: string; estado: Estado }>()
    const rojosPorChico: Record<string, number> = {}   // ventana larga, para el chico solo
    const actividadesPorChico: Record<string, Set<string>> = {}

    for (const r of seg || []) {
      const info = infoActividad[r.actividad]
      if (!info) continue                                  // no es de esta area
      if (r.estado === "red") {
        rojosPorChico[r.alumno_id] = (rojosPorChico[r.alumno_id] || 0) + 1
        ;(actividadesPorChico[r.alumno_id] ||= new Set()).add(r.actividad)
      }
      if (new Date(r.fecha).getTime() < corte21) continue  // fuera de la ventana corta
      const clave = `${r.alumno_id}||${r.actividad}`
      if (!ultima.has(clave)) {
        ultima.set(clave, { alumno_id: r.alumno_id, actividad: r.actividad, estado: r.estado as Estado })
      }
    }

    const registros = [...ultima.values()]
    const total = registros.length
    const verdes = registros.filter((r) => r.estado === "green").length
    const rojos = registros.filter((r) => r.estado === "red").length
    const pctVerde = total ? verdes / total : 0

    // Cuantos registros tiene esta aula EN ESTA AREA en toda su historia, no
    // solo en la ventana. Es lo que distingue a una maestra que nunca trabajo
    // esta area de una que dejo de cargar tres semanas: a la primera hay que
    // darle la base, a la segunda seria un insulto.
    // Filtrar por area importa: un aula de Grade 2 puede tener cientos de
    // registros y ninguno en conciencia fonologica.
    const titulosDelArea = Object.keys(infoActividad)
    const { count: historicos } = titulosDelArea.length
      ? (await supabase
          .from("seguimiento")
          .select("id", { count: "exact", head: true })
          .in("alumno_id", ids)
          .in("actividad", titulosDelArea))
      : { count: 0 }

    // ── 5. Que estado es este aula ────────────────────────────────────────
    let estado: "start" | "pattern" | "green" | "mixed"
    let triggerKey: string | null = null
    let motivo = ""

    if ((historicos ?? 0) < MINIMO_PARA_OPINAR) {
      estado = "start"
      motivo = `${historicos ?? 0} registros en total: todavia no hay evidencia para decir nada`
    } else if (total < MINIMO_PARA_OPINAR) {
      // Tiene historia pero nada reciente. No se le reinicia la formacion.
      return NextResponse.json({
        ok: true, sala, area, capa: null, estado: "stale",
        motivo: `sin registros en ${area} en las ultimas ${VENTANA_DIAS_TEXTO}`,
        mensaje: "Nothing recorded in this area for three weeks. Record a class and the coaching picks up where it left off.",
      })
    } else {
      const patron = detectarPatron(registros, infoActividad, esEL, rojosPorChico, actividadesPorChico)
      if (patron) {
        estado = "pattern"
        triggerKey = patron.key
        motivo = patron.motivo
      } else if (total >= MINIMO_PARA_VERDE && pctVerde >= UMBRAL_VERDE && rojos === 0) {
        estado = "green"
        motivo = `${Math.round(pctVerde * 100)}% en verde sobre ${total} registros, ningun rojo`
      } else {
        estado = "mixed"
        motivo = `${Math.round(pctVerde * 100)}% en verde, ${rojos} en rojo sobre ${total} registros`
      }
    }

    // ── 6. Elegir la capa: la que corresponde y todavia no recibio ─────────
    const { data: servidas } = await supabase
      .from("coaching_served").select("layer_id").eq("sala", sala)
    const yaVistas = new Set((servidas || []).map((s: any) => s.layer_id))

    const buscar = async (st: string, key: string | null) => {
      let q = supabase
        .from("coaching_layers").select("*")
        .eq("skill_area", area).eq("state", st).eq("computable", true)
      if (key) q = q.eq("trigger_key", key)
      else q = q.order("ord", { ascending: true })
      const { data } = await q
      return (data || []).find((c: any) => !yaVistas.has(c.id)) || null
    }

    let capa = await buscar(estado, estado === "pattern" ? triggerKey : null)
    let repliegue: string | null = null

    // Si ya recibio la capa de este patron, el patron sigue ahi pero no hay
    // nada nuevo que decirle sobre el. Antes de quedarse muda una semana
    // entera, ALBA sigue con la formacion de fondo y le recuerda el patron.
    if (!capa && estado === "pattern") {
      capa = await buscar("mixed", null)
      if (capa) repliegue = `Ya tuviste la formacion de este patron y sigue presente: ${motivo}`
    }

    // ── 7. Si no queda ninguna nueva, se dice. No se repite. ──────────────
    if (!capa) {
      return NextResponse.json({
        ok: true, sala, area, estado, motivo, capa: null,
        mensaje: estado === "pattern"
          ? "You have already had the coaching for this pattern, and it is still here."
          : "No new coaching for this state yet.",
        agotado: true,
      })
    }

    // ── 8. Registrar que se sirvio, con el motivo ─────────────────────────
    // El motivo es la auditoria: por que ESTA capa y no otra, en palabras.
    await supabase.from("coaching_served").insert([{ sala, layer_id: capa.id, fecha: hoy, motivo }])

    return NextResponse.json({
      ok: true, sala, area, estado, motivo, repliegue,
      yaServidaHoy: false,
      resumen: { registros: total, verdes, rojos, porcentajeVerde: Math.round(pctVerde * 100) },
      capa: formatear(capa),
    })
  } catch (e: any) {
    console.error("[coaching] error:", e?.message)
    return NextResponse.json({ error: "No se pudo armar la capacitacion" }, { status: 500 })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Deteccion de patrones. Cada funcion devuelve la clave y el motivo en palabras.
// Se evaluan en el orden de PRECEDENCIA_PATRONES: gana el de arriba.
// ─────────────────────────────────────────────────────────────────────────────
function detectarPatron(
  registros: { alumno_id: string; actividad: string; estado: Estado }[],
  infoActividad: Record<string, { code: string; tags: string[] }>,
  esEL: Record<string, boolean>,
  rojosPorChico: Record<string, number>,
  actividadesPorChico: Record<string, Set<string>>,
): { key: string; motivo: string } | null {

  const tags = (act: string) => infoActividad[act]?.tags || []
  const code = (act: string) => infoActividad[act]?.code || ""

  for (const key of PRECEDENCIA_PATRONES) {

    // Un solo chico sostenido en rojo, sin nadie que comparta la dificultad.
    // No forma grupo, asi que no aparece en ninguna pantalla de agrupamiento:
    // es el chico que el sistema pierde.
    if (key === "lone_student") {
      const sostenidos = Object.entries(rojosPorChico).filter(([, n]) => n >= 3)
      if (sostenidos.length === 1) {
        const [chico] = sostenidos[0]
        const suyas = actividadesPorChico[chico] || new Set()
        const alguienMas = registros.some(
          (r) => r.alumno_id !== chico && r.estado !== "green" && suyas.has(r.actividad)
        )
        if (!alguienMas) {
          return { key, motivo: `un solo chico con ${rojosPorChico[chico]} rojos sostenidos y nadie que comparta la dificultad` }
        }
      }
    }

    // Dos o mas English learners trabados donde los que hablan ingles en casa
    // no lo estan. Casi nunca es una dificultad fonologica.
    if (key === "el_gap") {
      const porCodigo: Record<string, { elMal: number; noElBien: number; noElMal: number }> = {}
      for (const r of registros) {
        const c = code(r.actividad); if (!c) continue
        const b = (porCodigo[c] ||= { elMal: 0, noElBien: 0, noElMal: 0 })
        if (esEL[r.alumno_id]) { if (r.estado !== "green") b.elMal++ }
        else if (r.estado === "green") b.noElBien++
        else b.noElMal++
      }
      const hit = Object.entries(porCodigo).find(([, b]) => b.elMal >= 2 && b.noElBien > 0 && b.noElMal === 0)
      if (hit) return { key, motivo: `${hit[1].elMal} English learners trabados en ${hit[0]} donde los demas estan en verde` }
    }

    // Rojos a nivel fonema en chicos que tampoco estan verdes a nivel silaba:
    // se les esta pidiendo un escalon que todavia no tienen.
    if (key === "syllable_not_secure") {
      const rojoFonema = new Set(registros.filter((r) => r.estado === "red" && tags(r.actividad).includes("phoneme")).map((r) => r.alumno_id))
      const flojoSilaba = new Set(registros.filter((r) => r.estado !== "green" && tags(r.actividad).includes("syllable")).map((r) => r.alumno_id))
      const ambos = [...rojoFonema].filter((id) => flojoSilaba.has(id))
      if (ambos.length >= 2) return { key, motivo: `${ambos.length} chicos en rojo a nivel fonema que tampoco estan firmes en silaba` }
    }

    // La vocal media, que es la posicion mas dificil y donde se traba todo el mundo.
    if (key === "medial_vowel") {
      const chicos = new Set(registros.filter((r) => r.estado !== "green" && tags(r.actividad).includes("medial_vowel")).map((r) => r.alumno_id))
      if (chicos.size >= 2) return { key, motivo: `${chicos.size} chicos sin llegar en la vocal media` }
    }
  }

  return null
}

function formatear(c: any): Capa {
  return {
    id: c.id,
    skill_area: c.skill_area,
    state: c.state,
    ord: c.ord ?? null,
    trigger_key: c.trigger_key ?? null,
    trigger_human: c.trigger_human,
    titulo: c.titulo,
    why_it_matters: c.why_it_matters,
    do_this: c.do_this,
    watch_for: Array.isArray(c.watch_for) ? c.watch_for : [],
    el_note: c.el_note ?? null,
    source: c.source ?? null,
  }
}
