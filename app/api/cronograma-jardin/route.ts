import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// API EXCLUSIVA para el tablero de Jardin 4/5 años
// Usa la tabla cronograma_jardin — NO toca cronograma_maternal (que es de Maternal)

const supabase = createClient(
  "https://oairchbitlanpzywncua.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"
)

const TABLA = "cronograma_jardin"
const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]

function getLunesSemana(fecha: Date): Date {
  const d = new Date(fecha)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// El servidor de Vercel corre en UTC; el jardin vive en Buenos Aires (UTC-3).
// Sin esto, un domingo a las 21hs de Argentina el servidor ya cree que es lunes.
function hoyEnBuenosAires(): Date {
  const ahora = new Date()
  const utcMs = ahora.getTime() + ahora.getTimezoneOffset() * 60000
  return new Date(utcMs - 3 * 60 * 60 * 1000)
}

// LA SEMANA LA DECIDE EL CALENDARIO, no los botones ni los dias pendientes.
// Lunes a viernes -> semana actual. Sabado y domingo -> semana siguiente.
function lunesDeLaSemanaAMostrar(): Date {
  const hoy = hoyEnBuenosAires()
  const lunes = getLunesSemana(hoy)
  const dia = hoy.getDay() // 0=Domingo, 6=Sabado
  if (dia === 0 || dia === 6) lunes.setDate(lunes.getDate() + 7)
  return lunes
}

const normSala = (s: string) => s.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9]/g, "")

// GET - Obtener cronograma de la semana actual, o historial de semanas finalizadas
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala")
  const historial = searchParams.get("historial") === "true"

  if (!sala) return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })

  const salaKey = normSala(sala)

  // Semana que corresponde mostrar segun el calendario (se usa en todo el GET)
  const lunesObjetivo = lunesDeLaSemanaAMostrar()
  const semanaObjetivo = lunesObjetivo.toISOString().split("T")[0]

  // ── CIERRE AUTOMATICO DE SEMANAS VENCIDAS ──────────────────────────
  // Dias sin finalizar de semanas ANTERIORES a la que toca mostrar se cierran solos.
  // Las actividades de ALBA no evaluadas quedan como "no_realizada" para que
  // el brain las pueda reofrecer. Solo desde el 03/08/2026 en adelante.
  const FECHA_CORTE = "2026-08-03"

  const { data: todosParaCierre } = await supabase
    .from(TABLA)
    .select("id, sala, dia, fecha, semana_inicio, actividades, dia_finalizado")

  const vencidos = (todosParaCierre || []).filter((r: any) =>
    normSala(r.sala || "") === salaKey &&
    r.dia_finalizado !== true &&
    (r.semana_inicio || "") < semanaObjetivo
  )

  for (const reg of vencidos) {
    if ((reg.semana_inicio || "") >= FECHA_CORTE) {
      const acts = Array.isArray(reg.actividades) ? reg.actividades : []
      const actAlba = acts.find(
        (a: any) => (a?.alfabetizacion === true || a?.origen === "alba") && (a?.nombre || "").trim().length > 0
      )
      if (actAlba) {
        const { data: yaExiste } = await supabase
          .from("registro_cierre")
          .select("id")
          .eq("sala", reg.sala)
          .eq("actividad_alba", actAlba.nombre)
          .eq("fecha", reg.fecha)
          .maybeSingle()

        if (!yaExiste) {
          await supabase.from("registro_cierre").insert([{
            fecha: reg.fecha,
            sala: reg.sala,
            eje: actAlba.eje || "CF",
            actividad_alba: actAlba.nombre,
            actividad_docente: actAlba.nombre,
            evaluacion_general: "no_realizada",
            observaciones: "Cierre automatico: la semana termino sin registro de la jornada.",
            stats: { green: 0, yellow: 0, red: 0, ausentes: 0 },
          }])
        }
      }
    }

    await supabase
      .from(TABLA)
      .update({ dia_finalizado: true, updated_at: new Date().toISOString() })
      .eq("id", reg.id)
  }

  // HISTORIAL: semanas YA COMPLETADAS de la sala (todos sus dias finalizados).
  // No dependemos del flag "finalizado" (que solo se marca al usar "Finalizar Semana"):
  // una semana cuenta como historial si todos sus dias estan finalizados dia por dia.
  if (historial) {
    const { data: todos } = await supabase
      .from(TABLA)
      .select("id, sala, dia, semana_inicio, fecha, actividades, recibimiento, intercambio, dia_finalizado, finalizado")
      .order("semana_inicio", { ascending: false })
      .limit(500)

    // Filtrar por sala normalizada en memoria
    const deSala = (todos || []).filter((r: any) => normSala(r.sala || "") === salaKey)

    // Agrupar por semana
    const mapa: Record<string, any> = {}
    for (const r of deSala) {
      if (!mapa[r.semana_inicio]) {
        mapa[r.semana_inicio] = { semana_inicio: r.semana_inicio, dias: {}, _filas: [] as any[] }
      }
      mapa[r.semana_inicio].dias[r.dia] = {
        fecha: r.fecha,
        actividades: r.actividades || [],
        recibimiento: r.recibimiento || "",
        intercambio: r.intercambio || "",
      }
      mapa[r.semana_inicio]._filas.push(r)
    }

    // ── Marcar cada actividad como evaluada o sin evaluar ────────────────
    // Se cruza con seguimiento: si algun chico tiene evaluacion de esa actividad
    // ese dia, la actividad quedo registrada. Si no, se dio sin registrar o no se dio.
    const alumnosIds: string[] = []
    try {
      const { data: alumnosSala } = await supabase.from("alumnos").select("id").eq("sala", sala)
      ;(alumnosSala || []).forEach((a: any) => alumnosIds.push(a.id))
    } catch (e) {
      console.error("[v0] Error leyendo alumnos para el historial:", e)
    }

    // Se cruza por SEMANA, no por dia exacto: la maestra suele evaluar al dia
    // siguiente de dar la actividad, y exigir que coincida el dia marcaba como
    // no evaluadas actividades que si se habian registrado.
    const lunesDe = (fechaStr: string): string => {
      const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(fechaStr || ""))
      if (!m) return ""
      const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
      const dia = d.getDay()
      d.setDate(d.getDate() - (dia === 0 ? 6 : dia - 1))
      const y = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, "0")
      const dd = String(d.getDate()).padStart(2, "0")
      return `${y}-${mm}-${dd}`
    }

    const evaluadas = new Set<string>()
    if (alumnosIds.length > 0) {
      const { data: regsSeg } = await supabase
        .from("seguimiento")
        .select("actividad, fecha, created_at")
        .in("alumno_id", alumnosIds)
      ;(regsSeg || []).forEach((r: any) => {
        if (!r.actividad) return
        const bruto = String(r.fecha || r.created_at || "")
        const f = /^\d{4}-\d{2}-\d{2}/.test(bruto)
          ? bruto.slice(0, 10)
          : new Date(bruto).toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
        const semanaDeLaEval = lunesDe(f)
        if (!semanaDeLaEval) return
        evaluadas.add(`${semanaDeLaEval}::${String(r.actividad).trim().toLowerCase()}`)
      })
    }

    Object.values(mapa).forEach((sem: any) => {
      Object.values(sem.dias).forEach((d: any) => {
        d.actividades = (d.actividades || []).map((a: any) => {
          const nombre = String(a?.nombre || "").trim()
          if (!nombre) return a
          return { ...a, evaluada: evaluadas.has(`${sem.semana_inicio}::${nombre.toLowerCase()}`) }
        })
      })
    })

    // Una semana es "historial" si TODOS sus dias estan finalizados (o el flag finalizado=true).
    // Las semanas que aun tienen dias sin finalizar son "activas" y no van al historial.
    const semanas = Object.values(mapa)
      .filter((sem: any) => {
        const filas = sem._filas as any[]
        const todosFinalizados = filas.every((f) => f.dia_finalizado === true)
        const algunFlagFinalizado = filas.some((f) => f.finalizado === true)
        return todosFinalizados || algunFlagFinalizado
      })
      .map((sem: any) => ({ semana_inicio: sem.semana_inicio, dias: sem.dias }))
      .sort((a: any, b: any) => b.semana_inicio.localeCompare(a.semana_inicio))

    return NextResponse.json({ ok: true, historial: semanas })
  }

  // SEMANA A MOSTRAR: la decide EL CALENDARIO.
  // Lunes a viernes -> semana actual. Sabado y domingo -> semana siguiente.
  // Las semanas ya no tienen estado: si estan cargadas se muestran, si no,
  // la grilla aparece en blanco lista para planificar. Lo unico que queda
  // pendiente son las ACTIVIDADES no realizadas (en registro_cierre).
  const { data: todosSala, error } = await supabase
    .from(TABLA)
    .select("*")

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  // Filtrar por sala normalizada en memoria
  const data = (todosSala || []).filter((r: any) => normSala(r.sala || "") === salaKey)

  const semanaUsada = semanaObjetivo
  const lunesUsado = lunesObjetivo

  const cronograma: Record<string, any> = {}
  DIAS.forEach((dia, idx) => {
    const fecha = new Date(lunesUsado)
    fecha.setDate(fecha.getDate() + idx)
    const registro = data.find((d: any) => d.semana_inicio === semanaUsada && d.dia === dia)
    cronograma[dia] = {
      fecha: fecha.toISOString().split("T")[0],
      recibimiento: registro?.recibimiento || "",
      intercambio: registro?.intercambio || "",
      actividades: registro?.actividades || [{ nombre: "", capacidades: "", contenidos: "", objetivo: "", desarrollo: "", materiales: "" }],
      edFisica: registro?.ed_fisica || "",
      musica: registro?.musica || "",
      ingles: registro?.ingles || "",
    }
  })

  const hayRegistros =
    data.some((r: any) =>
      r.semana_inicio === semanaUsada &&
      Array.isArray(r.actividades) && r.actividades.some((a: any) => (a.nombre || "").trim().length > 0)
    )

  return NextResponse.json({ ok: true, cronograma, semanaInicio: semanaUsada, hayRegistros })
}

// POST - Guardar cronograma de la semana
export async function POST(req: Request) {
  const body = await req.json()
  const { sala, cronograma, semana_inicio } = body
  // Dias que se vacian A PROPOSITO (por ejemplo al mover una actividad a otro dia).
  // Sin esto, la PROTECCION 3 los rechaza y la actividad queda duplicada.
  const diasForzados: string[] = Array.isArray(body.diasForzados) ? body.diasForzados : []
  if (!sala || !cronograma) return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 })

  // PROTECCIÓN 1 — Si el cronograma entero llega SIN contenido, rechazar.
  // Evita que un guardado vacío borre el contenido existente de toda la semana.
  const tieneContenido = DIAS.some((dia) => {
    const d = cronograma[dia]
    if (!d) return false
    const acts = Array.isArray(d.actividades) ? d.actividades : []
    const hayActividad = acts.some((a: any) => (a?.nombre || "").trim().length > 0)
    return hayActividad || (d.recibimiento || "").trim() || (d.intercambio || "").trim()
  })
  if (!tieneContenido) {
    return NextResponse.json(
      { ok: false, error: "El cronograma está vacío. No se guardó para no borrar el contenido existente." },
      { status: 400 }
    )
  }

  // Usar la semana que manda el cliente (la que tiene en pantalla)
  // Si no la manda, calcular el proximo lunes
  const lunes = semana_inicio ? new Date(semana_inicio + "T00:00:00") : lunesDeLaSemanaAMostrar()
  const lunesStr = semana_inicio || lunes.toISOString().split("T")[0]

  for (let idx = 0; idx < DIAS.length; idx++) {
    const dia = DIAS[idx]
    const datosDia = cronograma[dia]
    if (!datosDia) continue

    const fecha = new Date(lunes)
    fecha.setDate(fecha.getDate() + idx)

    // Traemos tambien el contenido del dia existente para poder compararlo (PROTECCION 3)
    const { data: existente } = await supabase
      .from(TABLA)
      .select("id, actividades, recibimiento, intercambio, finalizado, dia_finalizado")
      .eq("sala", sala)
      .eq("semana_inicio", lunesStr)
      .eq("dia", dia)
      .maybeSingle()

    // PROTECCIÓN 3 — no pisar un día con contenido con uno vacío
    const actsNuevas = Array.isArray(datosDia.actividades) ? datosDia.actividades : []
    const nuevoTieneContenido =
      actsNuevas.some((a: any) => (a?.nombre || "").trim().length > 0) ||
      (datosDia.recibimiento || "").trim() || (datosDia.intercambio || "").trim()
    const actsViejas = Array.isArray(existente?.actividades) ? existente.actividades : []
    const viejoTeniaContenido =
      actsViejas.some((a: any) => (a?.nombre || "").trim().length > 0) ||
      (existente?.recibimiento || "").trim() || (existente?.intercambio || "").trim()
    if (!nuevoTieneContenido && viejoTeniaContenido && !diasForzados.includes(dia)) {
      continue // no tocar este día: lo nuevo está vacío y lo viejo tenía contenido
    }

    const registro = {
      sala,
      semana_inicio: lunesStr,
      dia,
      fecha: fecha.toISOString().split("T")[0],
      recibimiento: datosDia.recibimiento || "",
      intercambio: datosDia.intercambio || "",
      actividades: datosDia.actividades || [],
      ed_fisica: datosDia.edFisica || "",
      musica: datosDia.musica || "",
      ingles: datosDia.ingles || "",
      // NO se reabre un dia ya cerrado. Antes esto ponia false siempre, asi que
      // cualquier edicion del cronograma reabria todas las jornadas finalizadas.
      finalizado: existente?.finalizado ?? false,
      dia_finalizado: existente?.dia_finalizado ?? false,
      updated_at: new Date().toISOString(),
    }

    if (existente?.id) {
      await supabase.from(TABLA).update(registro).eq("id", existente.id)
    } else {
      await supabase.from(TABLA).insert(registro)
    }
  }

  return NextResponse.json({ ok: true })
}

// PATCH - Finalizar Jornada: marca el DÍA ACTIVO (el primer día NO finalizado que
// tiene una actividad de ALBA). Esto garantiza que la jornada avanza en la misma
// secuencia que ALBA sugiere en el dashboard (Lunes → Martes → ... → Viernes),
// sin depender del día real del calendario.
export async function PATCH(req: Request) {
  const body = await req.json()
  const { sala } = body
  if (!sala) return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })

  const salaKey = normSala(sala)
  const ORDEN_DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]

  // Traer TODOS los registros de esta sala (cualquier semana)
  const { data: registros } = await supabase
    .from(TABLA)
    .select("id, sala, dia, semana_inicio, actividades, dia_finalizado")

  const deSala = (registros || []).filter((r: any) => normSala(r.sala || "") === salaKey)
  if (deSala.length === 0) return NextResponse.json({ ok: false, error: "Sin cronograma" }, { status: 404 })

  // Tomar TODOS los días NO finalizados y ordenarlos por semana + día.
  const pendientes = deSala
    .filter((r: any) => r.dia_finalizado !== true)
    .sort((a: any, b: any) => {
      const semanaCmp = (a.semana_inicio || "").localeCompare(b.semana_inicio || "")
      if (semanaCmp !== 0) return semanaCmp
      return ORDEN_DIAS.indexOf(a.dia) - ORDEN_DIAS.indexOf(b.dia)
    })

  if (pendientes.length === 0) {
    return NextResponse.json({ ok: true, sinPendientes: true })
  }

  // El día que la maestra ve activo es el que sugiere ALBA: el PRIMER pendiente que
  // tiene una actividad de ALBA con nombre (mismo criterio que el brain). Finalizamos
  // ese día y, de paso, los días vacíos anteriores (sin actividad de ALBA), para que
  // la jornada avance siempre y la sugerencia de ALBA pase a la siguiente actividad.
  const tieneAlba = (r: any) =>
    Array.isArray(r.actividades) &&
    r.actividades.some(
      (a: any) => (a.alfabetizacion === true || a.origen === "alba") && (a.nombre || "").trim().length > 0
    )

  const idxAlba = pendientes.findIndex(tieneAlba)

  // Si hay un día con actividad de ALBA, finalizar hasta ese día inclusive
  // (saltando/finalizando los vacíos anteriores). Si no hay ninguno con ALBA,
  // finalizar solo el primer pendiente (saltear día vacío y avanzar igual).
  const corte = idxAlba >= 0 ? idxAlba : 0
  const aFinalizar = pendientes.slice(0, corte + 1)
  const ids = aFinalizar.map((r: any) => r.id)

  const { error } = await supabase
    .from(TABLA)
    .update({ dia_finalizado: true, updated_at: new Date().toISOString() })
    .in("id", ids)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, diaFinalizado: aFinalizar[aFinalizar.length - 1].dia, diasFinalizados: aFinalizar.length })
}

// PUT - Finalizar semana completa. Marca como finalizada la semana ACTIVA de la sala
// (la última semana cargada que todavía tiene días sin finalizar), sin depender del
// calendario. Al quedar todo finalizado, el GET mostrará una semana en blanco para
// cargar el próximo cronograma.
export async function PUT(req: Request) {
  const body = await req.json()
  const { sala } = body
  if (!sala) return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })

  const salaKey = normSala(sala)

  // Traer todos los registros de esta sala (cualquier semana)
  const { data: registros } = await supabase
    .from(TABLA)
    .select("id, sala, semana_inicio, dia_finalizado")

  const registrosDeSala = (registros || []).filter((r: any) => normSala(r.sala || "") === salaKey)

  // Identificar la semana activa: la semana_inicio más reciente que aún tenga días
  // pendientes. Solo finalizamos esa (no tocamos semanas históricas).
  const semanasPendientes = Array.from(
    new Set(
      registrosDeSala
        .filter((r: any) => r.dia_finalizado !== true)
        .map((r: any) => r.semana_inicio as string)
    )
  ).sort((a, b) => a.localeCompare(b))

  if (semanasPendientes.length === 0) {
    return NextResponse.json({ ok: true, actualizados: 0, sinPendientes: true })
  }

  const semanaActiva = semanasPendientes[0]
  const aFinalizar = registrosDeSala.filter((r: any) => r.semana_inicio === semanaActiva)

  for (const r of aFinalizar) {
    await supabase
      .from(TABLA)
      .update({ dia_finalizado: true, finalizado: true, updated_at: new Date().toISOString() })
      .eq("id", r.id)
  }

  return NextResponse.json({ ok: true, actualizados: aFinalizar.length, semana: semanaActiva })
}
