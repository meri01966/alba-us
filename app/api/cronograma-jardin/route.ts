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

// GET - Obtener cronograma de la semana actual, o historial de semanas finalizadas
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala")
  const historial = searchParams.get("historial") === "true"

  if (!sala) return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })

  // HISTORIAL: semanas con finalizado = true ordenadas por fecha desc
  if (historial) {
    const { data: todos } = await supabase
      .from(TABLA)
      .select("id, sala, dia, semana_inicio, fecha, actividades, recibimiento, intercambio, finalizado")
      .eq("sala", sala)
      .eq("finalizado", true)
      .order("semana_inicio", { ascending: false })
      .limit(200)

    const mapa: Record<string, any> = {}
    for (const r of todos || []) {
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

  // SEMANA ACTUAL: busca registros no finalizados
  const lunes = getLunesSemana(new Date())
  const lunesStr = lunes.toISOString().split("T")[0]

  const { data, error } = await supabase
    .from(TABLA)
    .select("*")
    .eq("sala", sala)
    .eq("semana_inicio", lunesStr)
    .or("finalizado.eq.false,finalizado.is.null")

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  const cronograma: Record<string, any> = {}
  DIAS.forEach((dia, idx) => {
    const fecha = new Date(lunes)
    fecha.setDate(fecha.getDate() + idx)
    const registro = data?.find((d: any) => d.dia === dia)
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

  const hayRegistros = (data?.length ?? 0) > 0 &&
    (data ?? []).some((r: any) =>
      Array.isArray(r.actividades) && r.actividades.some((a: any) => (a.nombre || "").trim().length > 0)
    )

  return NextResponse.json({ ok: true, cronograma, semanaInicio: lunesStr, hayRegistros })
}

// POST - Guardar cronograma de la semana
export async function POST(req: Request) {
  const body = await req.json()
  const { sala, cronograma } = body
  if (!sala || !cronograma) return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 })

  const lunes = getLunesSemana(new Date())
  const lunesStr = lunes.toISOString().split("T")[0]

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

  const lunes = getLunesSemana(new Date())
  const semana = semana_inicio || lunes.toISOString().split("T")[0]

  const { error } = await supabase
    .from(TABLA)
    .update({ dia_finalizado: true, updated_at: new Date().toISOString() })
    .eq("sala", sala)
    .eq("semana_inicio", semana)
    .eq("dia", dia)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// PUT - Finalizar semana completa
export async function PUT(req: Request) {
  const body = await req.json()
  const { sala } = body
  if (!sala) return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })

  const lunes = getLunesSemana(new Date())
  const lunesStr = lunes.toISOString().split("T")[0]

  await supabase.from(TABLA).update({ finalizado: true }).eq("sala", sala).eq("semana_inicio", lunesStr)
  return NextResponse.json({ ok: true })
}
