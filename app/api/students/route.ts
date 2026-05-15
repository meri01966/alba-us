import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

// GET: Obtener todos los alumnos
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sala = searchParams.get("sala")
  
  let query = supabaseServer.from("alumnos").select("*")
  
  if (sala) {
    query = query.eq("sala", sala)
  }
  
  const { data, error } = await query.order("nombre")
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ students: data || [] })
}

// POST: Agregar un alumno
export async function POST(request: Request) {
  const body = await request.json()
  const { nombre, sala } = body
  
  if (!nombre || !sala) {
    return NextResponse.json({ error: "Nombre y sala son requeridos" }, { status: 400 })
  }
  
  const { data, error } = await supabaseServer
    .from("alumnos")
    .insert({ nombre, sala })
    .select()
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ student: data })
}

// DELETE: Eliminar un alumno
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (!id) {
    return NextResponse.json({ error: "ID es requerido" }, { status: 400 })
  }
  
  const { error } = await supabaseServer
    .from("alumnos")
    .delete()
    .eq("id", id)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ success: true })
}
