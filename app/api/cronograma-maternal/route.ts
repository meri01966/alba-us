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
  return new Date(d.setDate(diff))
}

// GET - Obtener cronograma de la semana actual
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala")
  
  if (!sala) {
    return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })
  }
  
  const lunesSemana = getLunesSemana(new Date())
  const lunesStr = lunesSemana.toISOString().split("T")[0]
  
  const { data, error } = await supabase
    .from("cronograma_maternal")
    .select("*")
    .eq("sala", sala)
    .eq("semana_inicio", lunesStr)
    .eq("finalizado", false)
  
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
  
  // Organizar por dia
  const cronograma: Record<string, any> = {}
  const dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]
  
  dias.forEach((dia, idx) => {
    const fecha = new Date(lunesSemana)
    fecha.setDate(fecha.getDate() + idx)
    const registro = data?.find(d => d.dia === dia)
    
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
  
  return NextResponse.json({ ok: true, cronograma, semanaInicio: lunesStr })
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
