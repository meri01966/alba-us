import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://oairchbitlanpzywncua.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"
)

// GET - Obtener proyecto activo
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala")
  
  if (!sala) {
    return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })
  }
  
  const { data, error } = await supabase
    .from("proyectos_maternal")
    .select("*")
    .eq("sala", sala)
    .eq("estado", "activo")
    .order("created_at", { ascending: false })
    .limit(1)
    .single()
  
  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ ok: true, proyecto: data || null })
}

// POST - Guardar proyecto
export async function POST(req: Request) {
  const body = await req.json()
  const { sala, titulo, duracion, objetivo_general } = body
  
  if (!sala || !titulo) {
    return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 })
  }
  
  // Buscar proyecto activo existente
  const { data: existente } = await supabase
    .from("proyectos_maternal")
    .select("id")
    .eq("sala", sala)
    .eq("estado", "activo")
    .single()
  
  const registro = {
    sala,
    titulo,
    duracion: duracion || "",
    objetivo_general: objetivo_general || "",
    updated_at: new Date().toISOString()
  }
  
  if (existente?.id) {
    await supabase.from("proyectos_maternal").update(registro).eq("id", existente.id)
  } else {
    await supabase.from("proyectos_maternal").insert({ ...registro, estado: "activo" })
  }
  
  return NextResponse.json({ ok: true })
}

// PUT - Finalizar proyecto
export async function PUT(req: Request) {
  const body = await req.json()
  const { sala } = body
  
  if (!sala) {
    return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })
  }
  
  await supabase
    .from("proyectos_maternal")
    .update({ estado: "finalizado", finalizado_at: new Date().toISOString() })
    .eq("sala", sala)
    .eq("estado", "activo")
  
  return NextResponse.json({ ok: true })
}
