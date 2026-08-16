// ALBA — Registro de maternal
// La docente evalua UNA capacidad por vez y marca SOLO a los que se apartan.
// Los que no toca quedan en "ya lo hace": se guardan igual, porque si no,
// despues no habria forma de saber si un chico avanzo o si ese dia no se evaluo.
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

const TABLA = "registro_maternal"

// Segundo cuatrimestre: no se mira mas atras
const INICIO_CUATRIMESTRE = "2026-08-03"

// Las cinco capacidades, con su nombre para mostrar
// Cada capacidad se evalua por un INDICADOR OBSERVABLE concreto, no en abstracto.
// Son los mismos pasos que trabaja la secuencia del cronograma, sacados de los
// objetivos de aprendizaje del DC de CABA para sala de 2.
const CAPACIDADES = [
  {
    key: "COM", nombre: "Comunicacion",
    indicadores: [
      "Responde a su nombre, a preguntas y a instrucciones simples",
      "Expresa lo que quiere con palabras: saluda, nombra, pide",
      "Incorpora palabras nuevas del entorno cotidiano",
      "Participa de intercambios respetando turnos",
      "Comprende y produce oraciones de dos o tres palabras",
      "Participa cuando se lee, se narra o se canta",
      "Reconoce que lo escrito dice algo",
    ],
  },
  {
    key: "AUT", nombre: "Autonomia para aprender",
    indicadores: [
      "Explora libremente objetos y materiales",
      "Elige entre dos propuestas",
      "Sostiene una actividad breve hasta terminarla",
      "Anticipa la rutina y la nombra",
    ],
  },
  {
    key: "RES", nombre: "Resolucion de problemas",
    indicadores: [
      "Descubre que sus acciones tienen efecto",
      "Ensaya otra manera cuando algo no sale",
      "Pide ayuda con palabras",
      "Busca el modo de alcanzar lo que quiere",
    ],
  },
  {
    key: "COL", nombre: "Compromiso y colaboracion",
    indicadores: [
      "Comparte el espacio y los materiales con otros",
      "Espera y respeta su turno",
      "Participa de una propuesta grupal",
      "Ayuda a un companero o a la docente",
    ],
  },
  {
    key: "REF", nombre: "Pensamiento reflexivo y critico",
    indicadores: [
      "Explora y descubre efectos de sus acciones",
      "Anticipa lo que va a pasar",
      "Expresa lo que le gusta y lo que no",
      "Reconoce lo conocido en algo nuevo",
    ],
  },
]

export const dynamic = "force-dynamic"
export const revalidate = 0

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

// ── GET: que capacidad toca evaluar y como quedo la ultima vez ──────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sala = searchParams.get("sala")
    if (!sala) return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })

    const supabase = getSupabase()

    const { data: alumnos } = await supabase
      .from("alumnos").select("id, nombre").eq("sala", sala).order("nombre")

    const { data: registros } = await supabase
      .from(TABLA).select("*").eq("sala", sala).order("fecha", { ascending: false }).limit(600)

    const regs = registros || []

    // Ultima vez que se evaluo cada capacidad. La que hace mas que no se mira
    // es la que toca: misma logica de necesidad que usa el cronograma.
    const ultimaPorCapacidad: Record<string, string> = {}
    regs.forEach((r: any) => {
      const f = String(r.fecha || "")
      if (!ultimaPorCapacidad[r.capacidad] || f > ultimaPorCapacidad[r.capacidad]) {
        ultimaPorCapacidad[r.capacidad] = f
      }
    })

    const sugerida = [...CAPACIDADES].sort((a, b) => {
      const fa = ultimaPorCapacidad[a.key] || ""
      const fb = ultimaPorCapacidad[b.key] || ""
      return fa.localeCompare(fb)   // la mas vieja (o nunca evaluada) primero
    })[0]

    // Fecha del ultimo registro de la sala, para mostrar hace cuanto fue
    let ultimoRegistro = ""
    regs.forEach((r: any) => {
      const f = String(r.fecha || "")
      if (f > ultimoRegistro) ultimoRegistro = f
    })

    let diasSinRegistrar: number | null = null
    if (ultimoRegistro) {
      const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
      diasSinRegistrar = Math.max(
        0,
        Math.round((new Date(hoy).getTime() - new Date(ultimoRegistro).getTime()) / 86400000)
      )
    }

    // ── QUE SE EVALUA: solo lo que efectivamente SE TRABAJO ───────────────
    // Antes ALBA elegia el indicador que hacia mas tiempo que no se miraba, sin
    // fijarse en que hizo la sala: podia pedir que se evaluara algo que nunca
    // se dio, y ese dato no significa nada. Ahora sale de las actividades
    // marcadas como realizadas, con su propio "Observa si".
    const yaEvaluados = new Set(regs.map((r: any) => String(r.paso || "").trim().toLowerCase()))

    const trabajadas: { habilidad: string; capacidad: string; actividad: string; fecha: string }[] = []
    try {
      const { data: crono } = await supabase
        .from("cronograma_maternal")
        .select("fecha, actividades")
        .eq("sala", sala)
        .gte("fecha", INICIO_CUATRIMESTRE)
        .order("fecha", { ascending: false })
        .limit(60)

      ;(crono || []).forEach((fila: any) => {
        const acts = Array.isArray(fila.actividades) ? fila.actividades : []
        acts.forEach((a: any) => {
          if (a?.realizada !== true) return
          const hab = String(a.capacidades || "").trim()
          if (!hab) return
          if (yaEvaluados.has(hab.toLowerCase())) return
          if (trabajadas.some((t) => t.habilidad.toLowerCase() === hab.toLowerCase())) return
          trabajadas.push({
            habilidad: hab,
            capacidad: String(a.capacidadKey || a.eje || ""),
            actividad: String(a.nombre || ""),
            fecha: String(fila.fecha || ""),
          })
        })
      })
    } catch (e) {
      console.error("[v0] Error leyendo lo trabajado:", e)
    }

    // La mas vieja sin evaluar: se evalua en el orden en que se trabajo
    const pendiente = trabajadas[trabajadas.length - 1] || null

    const indicador = pendiente
      ? pendiente.habilidad
      : (sugerida.indicadores.find((i: string) => !yaEvaluados.has(i.toLowerCase())) || sugerida.indicadores[0])

    // Si viene de una actividad, la capacidad es la de esa actividad
    const capacidadDelIndicador = pendiente?.capacidad
      ? CAPACIDADES.find((c) => c.key === pendiente.capacidad) || sugerida
      : sugerida

    // Como quedo cada chico la ultima vez que se evaluo ESTA capacidad
    const ultimoEstado: Record<string, string> = {}
    const fechaCap = ultimaPorCapacidad[capacidadDelIndicador.key]
    if (fechaCap) {
      regs
        .filter((r: any) => r.capacidad === capacidadDelIndicador.key && String(r.fecha) === fechaCap)
        .forEach((r: any) => { ultimoEstado[r.alumno_id] = r.estado })
    }

    // ── Resumen de la ULTIMA evaluacion, para la tarjeta ──────────────────
    // No es un promedio: es como quedo el grupo la ultima vez que se miro.
    const nombrePorAlumno: Record<string, string> = {}
    ;(alumnos || []).forEach((a: any) => { nombrePorAlumno[a.id] = a.nombre })

    let ultimo: any = null
    if (ultimoRegistro) {
      const delDia = regs.filter((r: any) => String(r.fecha) === ultimoRegistro)
      const cap = delDia[0]?.capacidad || ""
      const delaCap = delDia.filter((r: any) => r.capacidad === cap)
      const nombres = delaCap
        .filter((r: any) => r.estado === "acompanar")
        .map((r: any) => nombrePorAlumno[r.alumno_id] || "")
        .filter(Boolean)
        .sort()

      ultimo = {
        capacidad: CAPACIDADES.find((c) => c.key === cap)?.nombre || cap,
        indicador: delaCap[0]?.paso || "",
        yaLoHacen: delaCap.filter((r: any) => r.estado === "ya_lo_hace").length,
        empezando: delaCap.filter((r: any) => r.estado === "empezando").length,
        acompanar: delaCap.filter((r: any) => r.estado === "acompanar").length,
        necesitanAcompanamiento: nombres,
      }
    }

    // ── Sintesis de la sala: las cinco capacidades y la trayectoria ────────
    const porCapacidad = CAPACIDADES.map((c) => {
      const deLaCap = regs.filter((r: any) => r.capacidad === c.key)
      const fechaUlt = deLaCap.reduce((f: string, r: any) => (String(r.fecha) > f ? String(r.fecha) : f), "")
      const ult = deLaCap.filter((r: any) => String(r.fecha) === fechaUlt)
      return {
        key: c.key,
        nombre: c.nombre,
        evaluada: !!fechaUlt,
        fecha: fechaUlt || null,
        indicador: ult[0]?.paso || "",
        indicadoresTrabajados: Array.from(new Set(deLaCap.map((r: any) => String(r.paso || "")).filter(Boolean))).length,
        totalIndicadores: c.indicadores.length,
        yaLoHacen: ult.filter((r: any) => r.estado === "ya_lo_hace").length,
        empezando: ult.filter((r: any) => r.estado === "empezando").length,
        acompanar: ult.filter((r: any) => r.estado === "acompanar").length,
        necesitanAcompanamiento: ult
          .filter((r: any) => r.estado === "acompanar")
          .map((r: any) => nombrePorAlumno[r.alumno_id] || "")
          .filter(Boolean).sort(),
      }
    })

    // Cada chico, con su estado POR CAPACIDAD: "3 empezando" suelto no dice
    // nada; lo que la maestra necesita saber es en QUE capacidad esta flojo.
    const porAlumno = (alumnos || []).map((a: any) => {
      const suyos = regs.filter((r: any) => r.alumno_id === a.id)
      const capacidades = CAPACIDADES.map((c) => {
        const deLaCap = suyos.filter((r: any) => r.capacidad === c.key)
        if (deLaCap.length === 0) return { key: c.key, nombre: c.nombre, estado: null, indicador: "" }
        const ultimaF = deLaCap.reduce((f: string, r: any) => (String(r.fecha) > f ? String(r.fecha) : f), "")
        const ult = deLaCap.find((r: any) => String(r.fecha) === ultimaF)
        return { key: c.key, nombre: c.nombre, estado: ult?.estado || null, indicador: ult?.paso || "" }
      }).filter((c) => c.estado !== null)

      return {
        id: a.id,
        nombre: a.nombre,
        capacidades,
        acompanar: capacidades.filter((c) => c.estado === "acompanar").length,
        empezando: capacidades.filter((c) => c.estado === "empezando").length,
        yaLoHacen: capacidades.filter((c) => c.estado === "ya_lo_hace").length,
      }
    }).sort((x: any, y: any) => (y.acompanar - x.acompanar) || (y.empezando - x.empezando))

    return NextResponse.json({
      ok: true,
      alumnos: alumnos || [],
      capacidades: CAPACIDADES,
      capacidadSugerida: capacidadDelIndicador,
      indicador,
      // De que actividad sale lo que se va a evaluar
      actividadDeOrigen: pendiente?.actividad || null,
      hayQueEvaluar: !!pendiente,
      pendientesDeEvaluar: trabajadas.length,
      // Los indicadores de cada capacidad: son las HABILIDADES observables que
      // hay que estimular para que la capacidad se adquiera. Sin esto, ALBA
      // habla en general ("ayudalo en su comunicacion") y eso no se puede mirar.
      indicadoresPorCapacidad: CAPACIDADES.map((c) => ({
        key: c.key, nombre: c.nombre, indicadores: c.indicadores,
      })),
      ultimoRegistro: ultimoRegistro || null,
      diasSinRegistrar,
      ultimoEstado,
      ultimo,
      porCapacidad,
      porAlumno,
    })
  } catch (e) {
    console.error("[v0] Error en registro-maternal GET:", e)
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
  }
}

// ── POST: guardar la evaluacion de una capacidad ────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sala, capacidad, paso, marcados } = body

    if (!sala || !capacidad) {
      return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data: alumnos } = await supabase.from("alumnos").select("id").eq("sala", sala)
    if (!alumnos || alumnos.length === 0) {
      return NextResponse.json({ ok: false, error: "La sala no tiene alumnos" }, { status: 400 })
    }

    const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
    const porAlumno: Record<string, string> = marcados && typeof marcados === "object" ? marcados : {}

    // Se guarda a TODOS: los marcados con su estado y el resto en "ya lo hace"
    const filas = alumnos.map((a: any) => ({
      sala,
      alumno_id: a.id,
      capacidad,
      paso: paso || "",
      estado: porAlumno[a.id] || "ya_lo_hace",
      fecha: hoy,
    }))

    // Si ya se evaluo hoy esta capacidad, se reemplaza en vez de duplicar
    await supabase
      .from(TABLA).delete()
      .eq("sala", sala).eq("capacidad", capacidad).eq("fecha", hoy)

    const { error } = await supabase.from(TABLA).insert(filas)
    if (error) {
      console.error("[v0] Error guardando registro maternal:", error.message)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, guardados: filas.length })
  } catch (e) {
    console.error("[v0] Error en registro-maternal POST:", e)
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
  }
}
