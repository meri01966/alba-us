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

  // HISTORIAL: semanas con finalizado = true ordenadas por fecha desc
  if (historial) {
    const { data: todos } = await supabase
      .from(TABLA)
      .select("id, sala, dia, semana_inicio, fecha, actividades, recibimiento, intercambio, finalizado")
      .eq("finalizado", true)
      .order("semana_inicio", { ascending: false })
      .limit(200)

    // Filtrar por sala normalizada en memoria
    const deSala = (todos || []).filter((r: any) => normSala(r.sala || "") === salaKey)

    const mapa: Record<string, any> = {}
    for (const r of deSala) {
      if (!mapa[r.semana_inicio]) {
        mapa[r.semana_inicio] = { semana_inicio: r.semana_inicio, dias: {} }
      }
      mapa[r.semana_inicio].dias[r.dia] = {
        fecha: r.fecha,
        actividades: r.actividades || [],
        recibimiento: r.recibimiento || "",
        intercambio: r.intercambio || "",
      }
    }
    const semanas = Object.values(mapa).sort((a: any, b: any) =>
      b.semana_inicio.localeCompare(a.semana_inicio)
    )
    return NextResponse.json({ ok: true, historial: semanas })
  }

  // SEMANA A MOSTRAR:
  // 1. Si hay datos en la semana actual → usar semana actual
  // 2. Si hay datos en la semana anterior (cronograma cargado la semana pasada) → usar semana anterior
  // 3. Si no hay datos → mostrar la semana que viene (proximo lunes)
  // En sala de prueba: no depender de fechas reales, permitir simular cualquier día
  const lunes = getLunesSemana(new Date())
  const lunesAnt = new Date(lunes); lunesAnt.setDate(lunesAnt.getDate() - 7)
  const lunesSig = new Date(lunes); lunesSig.setDate(lunesSig.getDate() + 7)
  const lunesStr = lunes.toISOString().split("T")[0]
  const lunesAntStr = lunesAnt.toISOString().split("T")[0]
  const lunesSigStr = lunesSig.toISOString().split("T")[0]

  const esSalaPrueba = salaKey.includes("prueba")
  
  // En sala de prueba: buscar solo semana actual + siguiente (no pasada)
  // En otras salas: buscar pasada + actual
  const semanasABuscar = esSalaPrueba 
    ? [lunesStr, lunesSigStr]
    : [lunesStr, lunesAntStr]

  const { data: todos, error } = await supabase
    .from(TABLA)
    .select("*")
    .in("semana_inicio", semanasABuscar)
    .or("finalizado.eq.false,finalizado.is.null")

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  // Filtrar por sala normalizada en memoria
  const data = (todos || []).filter((r: any) => normSala(r.sala || "") === salaKey)

  // Determinar semana y lunes a usar
  let semanaUsada: string
  let lunesUsado: Date
  if (data.some((r: any) => r.semana_inicio === lunesStr)) {
    // Hay datos esta semana
    semanaUsada = lunesStr
    lunesUsado = lunes
  } else if (data.some((r: any) => r.semana_inicio === lunesAntStr)) {
    // Hay datos de la semana anterior (cronograma cargado antes)
    semanaUsada = lunesAntStr
    lunesUsado = lunesAnt
  } else {
    // Sin datos — mostrar semana que viene para que la maestra cargue el proximo cronograma
    semanaUsada = lunesSigStr
    lunesUsado = lunesSig
  }

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

  const hayRegistros = data.length > 0 &&
    data.some((r: any) =>
      Array.isArray(r.actividades) && r.actividades.some((a: any) => (a.nombre || "").trim().length > 0)
    )

  return NextResponse.json({ ok: true, cronograma, semanaInicio: semanaUsada, hayRegistros })
}

// POST - Guardar cronograma de la semana
export async function POST(req: Request) {
  const body = await req.json()
  const { sala, cronograma, semana_inicio } = body
  if (!sala || !cronograma) return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 })

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

    const { data: existente } = await supabase
      .from(TABLA)
      .select("id")
      .eq("sala", sala)
      .eq("semana_inicio", lunesStr)
      .eq("dia", dia)
      .maybeSingle()

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

// PATCH - Marcar un dia especifico como finalizado (se llama al Finalizar Jornada)
export async function PATCH(req: Request) {
  const body = await req.json()
  const { sala, dia, semana_inicio } = body
  if (!sala || !dia) return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 })

  const salaKey = normSala(sala)

  // Buscar el registro buscando por sala normalizada en memoria
  // Buscar en las ultimas 2 semanas para tolerar desfase
  const lunes = getLunesSemana(new Date())
  const lunesAnt = new Date(lunes); lunesAnt.setDate(lunesAnt.getDate() - 7)
  const semanasABuscar = semana_inicio
    ? [semana_inicio]
    : [lunes.toISOString().split("T")[0], lunesAnt.toISOString().split("T")[0]]

  const { data: registros } = await supabase
    .from(TABLA)
    .select("id, sala, semana_inicio")
    .in("semana_inicio", semanasABuscar)
    .eq("dia", dia)

  // Filtrar por sala normalizada
  const registro = (registros || []).find((r: any) => normSala(r.sala || "") === salaKey)
  if (!registro) return NextResponse.json({ ok: false, error: "Registro no encontrado" }, { status: 404 })

  const { error } = await supabase
    .from(TABLA)
    .update({ dia_finalizado: true, updated_at: new Date().toISOString() })
    .eq("id", registro.id)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// PUT - Finalizar semana completa (marca todos los días como dia_finalizado: true)
export async function PUT(req: Request) {
  const body = await req.json()
  const { sala } = body
  if (!sala) return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })

  const salaKey = normSala(sala)
  
  // Buscar en las últimas 3 semanas (para encontrar cualquier semana no finalizada)
  const lunes = getLunesSemana(new Date())
  const lunesAnt = new Date(lunes); lunesAnt.setDate(lunesAnt.getDate() - 7)
  const lunesSig = new Date(lunes); lunesSig.setDate(lunesSig.getDate() + 7)
  
  const semanasABuscar = [
    lunesAnt.toISOString().split("T")[0],
    lunes.toISOString().split("T")[0],
    lunesSig.toISOString().split("T")[0],
  ]

  // Buscar todos los registros de esta sala en cualquiera de las 3 semanas
  const { data: registros } = await supabase
    .from(TABLA)
    .select("id, sala, semana_inicio")
    .in("semana_inicio", semanasABuscar)

  // Filtrar por sala normalizada y actualizar todos
  const registrosDeSala = (registros || []).filter((r: any) => normSala(r.sala || "") === salaKey)
  for (const r of registrosDeSala) {
    await supabase
      .from(TABLA)
      .update({ dia_finalizado: true, updated_at: new Date().toISOString() })
      .eq("id", r.id)
  }

  return NextResponse.json({ ok: true, actualizados: registrosDeSala.length })
}
