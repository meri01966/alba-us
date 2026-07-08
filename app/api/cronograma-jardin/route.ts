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

const normSala = (s: string) => s.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9]/g, "")

// GET - Obtener cronograma de la semana actual, o historial de semanas finalizadas
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala")
  const historial = searchParams.get("historial") === "true"

  if (!sala) return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })

  const salaKey = normSala(sala)

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

  // SEMANA A MOSTRAR (desacoplado del calendario):
  // Se busca la ÚLTIMA semana cargada de la sala que todavía tenga algún día sin
  // finalizar (dia_finalizado !== true). Esa es la semana "activa" que ve la maestra
  // y sobre la que ALBA sugiere. Si todas las semanas están finalizadas (o no hay
  // ninguna), se muestra una semana en blanco para que la maestra cargue el próximo
  // cronograma. NO se calcula nada por fecha real.
  const { data: todosSala, error } = await supabase
    .from(TABLA)
    .select("*")

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  // Filtrar por sala normalizada en memoria
  const data = (todosSala || []).filter((r: any) => normSala(r.sala || "") === salaKey)

  // Agrupar por semana_inicio y detectar cuáles tienen días pendientes
  const semanasPendientes = Array.from(
    new Set(
      data
        .filter((r: any) => r.dia_finalizado !== true)
        .map((r: any) => r.semana_inicio as string)
    )
  ).sort((a, b) => a.localeCompare(b))

  // Determinar semana y lunes a usar
  let semanaUsada: string
  let lunesUsado: Date
  let mostrarEnBlanco = false

  if (semanasPendientes.length > 0) {
    // Tomar la PRIMERA semana pendiente (la más antigua sin finalizar). Esto coincide
    // exactamente con el criterio del brain (buscarActividadCronograma), garantizando
    // que la grilla que ve la maestra = la actividad que sugiere ALBA.
    semanaUsada = semanasPendientes[0]
    lunesUsado = new Date(semanaUsada + "T00:00:00")
  } else {
    // No hay semana pendiente: mostrar una semana en blanco para cargar el próximo
    // cronograma. Usamos el próximo lunes solo para etiquetar las fechas de la grilla.
    mostrarEnBlanco = true
    const lunesSig = getLunesSemana(new Date())
    lunesSig.setDate(lunesSig.getDate() + 7)
    semanaUsada = lunesSig.toISOString().split("T")[0]
    lunesUsado = lunesSig
  }

  const cronograma: Record<string, any> = {}
  DIAS.forEach((dia, idx) => {
    const fecha = new Date(lunesUsado)
    fecha.setDate(fecha.getDate() + idx)
    const registro = mostrarEnBlanco
      ? undefined
      : data.find((d: any) => d.semana_inicio === semanaUsada && d.dia === dia)
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

  const hayRegistros = !mostrarEnBlanco &&
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
  const lunes = semana_inicio ? new Date(semana_inicio + "T00:00:00") : getLunesSemana(new Date())
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
      .select("id, actividades, recibimiento, intercambio")
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
    if (!nuevoTieneContenido && viejoTeniaContenido) {
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
      finalizado: false,
      dia_finalizado: false,
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
