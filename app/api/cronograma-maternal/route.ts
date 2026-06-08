import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://oairchbitlanpzywncua.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"
)

// Obtener lunes de la semana actual
function getLunesSemana(fecha: Date): Date {
  const d = new Date(fecha)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]
const normSala = (s: string) => s.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9]/g, "")

// GET - Obtener cronograma de la semana actual, o historial de semanas finalizadas
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala")
  const historial = searchParams.get("historial") === "true"

  if (!sala) {
    return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })
  }

  // ── HISTORIAL: devuelve semanas finalizadas agrupadas por semana_inicio ────
  if (historial) {
    const normalizarSala = (s: string) => s.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9]/g, "")
    const salaKey = normalizarSala(sala)

    const { data: todos } = await supabase
      .from("cronograma_maternal")
      .select("id, sala, dia, semana_inicio, fecha, actividades, recibimiento, intercambio, finalizado")
      .eq("finalizado", true)
      .order("semana_inicio", { ascending: false })
      .limit(200)

    // Filtrar por sala normalizada en memoria
    const deSala = (todos || []).filter((r: any) => normalizarSala(r.sala || "") === salaKey)

    // Agrupar por semana_inicio
    const mapa: Record<string, any> = {}
    for (const r of deSala) {
      if (!mapa[r.semana_inicio]) {
        mapa[r.semana_inicio] = { id: r.semana_inicio, semana_inicio: r.semana_inicio, dias: {} }
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
  
  // SEMANA A MOSTRAR (desacoplado del calendario):
  // Se busca la primera semana cargada de la sala que todavía NO esté finalizada.
  // Esa es la semana "activa" que ve la maestra. Si todas están finalizadas (o no hay
  // ninguna), se muestra una semana en blanco para cargar el próximo cronograma.
  const salaKey = normSala(sala)
  const { data: todosSala, error } = await supabase
    .from("cronograma_maternal")
    .select("*")

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  // Filtrar por sala normalizada en memoria
  const data = (todosSala || []).filter((r: any) => normSala(r.sala || "") === salaKey)

  // Semanas que aún tienen al menos un día sin finalizar
  const semanasPendientes = Array.from(
    new Set(
      data
        .filter((r: any) => r.finalizado !== true)
        .map((r: any) => r.semana_inicio as string)
    )
  ).sort((a, b) => a.localeCompare(b))

  let semanaUsada: string
  let lunesUsado: Date
  let mostrarEnBlanco = false

  if (semanasPendientes.length > 0) {
    // Primera semana pendiente (la más antigua sin finalizar)
    semanaUsada = semanasPendientes[0]
    lunesUsado = new Date(semanaUsada + "T00:00:00")
  } else {
    // No hay semana pendiente: mostrar semana en blanco para el próximo cronograma
    mostrarEnBlanco = true
    const lunesSig = getLunesSemana(new Date())
    lunesSig.setDate(lunesSig.getDate() + 7)
    semanaUsada = lunesSig.toISOString().split("T")[0]
    lunesUsado = lunesSig
  }

  // Organizar por dia
  const cronograma: Record<string, any> = {}

  DIAS.forEach((dia, idx) => {
    const fecha = new Date(lunesUsado)
    fecha.setDate(fecha.getDate() + idx)
    const registro = mostrarEnBlanco
      ? undefined
      : data.find((d: any) => d.semana_inicio === semanaUsada && d.dia === dia)

    // Actividad vacia por defecto
    const actividadVacia = {
      nombre: "",
      capacidades: "",
      contenidos: "",
      objetivo: "",
      desarrollo: "",
      materiales: ""
    }

    cronograma[dia] = {
      fecha: fecha.toISOString().split("T")[0],
      recibimiento: registro?.recibimiento || "",
      intercambio: registro?.intercambio || "",
      actividades: registro?.actividades || [actividadVacia],
      edFisica: registro?.ed_fisica || "",
      musica: registro?.musica || "",
      ingles: registro?.ingles || ""
    }
  })

  // hayRegistros = true si al menos un dia tiene actividad real guardada
  const hayRegistros = !mostrarEnBlanco && data.some(
    (r: any) => r.semana_inicio === semanaUsada &&
      Array.isArray(r.actividades) && r.actividades.some((a: any) => (a.nombre || "").trim().length > 0)
  )

  return NextResponse.json({ ok: true, cronograma, semanaInicio: semanaUsada, hayRegistros })
}

// POST - Guardar cronograma
export async function POST(req: Request) {
  const body = await req.json()
  const { sala, cronograma } = body
  
  if (!sala || !cronograma) {
    return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 })
  }
  
  const lunesSemana = getLunesSemana(new Date())
  const lunesStr = lunesSemana.toISOString().split("T")[0]
  const dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]
  
  // Guardar cada dia
  for (let idx = 0; idx < dias.length; idx++) {
    const dia = dias[idx]
    const datosDia = cronograma[dia]
    if (!datosDia) continue
    
    const fecha = new Date(lunesSemana)
    fecha.setDate(fecha.getDate() + idx)
    
    // Buscar si ya existe
    const { data: existente } = await supabase
      .from("cronograma_maternal")
      .select("id")
      .eq("sala", sala)
      .eq("semana_inicio", lunesStr)
      .eq("dia", dia)
      .single()
    
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
      updated_at: new Date().toISOString()
    }
    
    if (existente?.id) {
      await supabase.from("cronograma_maternal").update(registro).eq("id", existente.id)
    } else {
      await supabase.from("cronograma_maternal").insert(registro)
    }
  }
  
  return NextResponse.json({ ok: true })
}

// PUT - Finalizar semana
export async function PUT(req: Request) {
  const body = await req.json()
  const { sala } = body
  
  if (!sala) {
    return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })
  }
  
  const lunesSemana = getLunesSemana(new Date())
  const lunesStr = lunesSemana.toISOString().split("T")[0]
  
  // Marcar como finalizado
  await supabase
    .from("cronograma_maternal")
    .update({ finalizado: true })
    .eq("sala", sala)
    .eq("semana_inicio", lunesStr)
  
  return NextResponse.json({ ok: true })
}
