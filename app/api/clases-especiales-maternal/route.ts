import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

// GET - obtener clases especiales de una sala
export async function GET(request: Request) {
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const sala = searchParams.get("sala")

  if (!sala) {
    return NextResponse.json({ ok: false, error: "Sala requerida" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("clases_especiales_maternal")
    .select("*")
    .eq("sala", sala)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, clases: data || [] })
}

// POST - guardar/actualizar clases especiales
export async function POST(request: Request) {
  try {
    const supabase = getSupabase()
    
    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ ok: false, error: "JSON invalido" }, { status: 400 })
    }
    
    const { sala, clases } = body

    if (!sala) {
      return NextResponse.json({ ok: false, error: "Sala requerida" }, { status: 400 })
    }
    
    if (!Array.isArray(clases)) {
      return NextResponse.json({ ok: false, error: "Clases debe ser un array" }, { status: 400 })
    }

    // Borrar las clases anteriores de la sala
    const { error: deleteError } = await supabase
      .from("clases_especiales_maternal")
      .delete()
      .eq("sala", sala)
      
    if (deleteError) {
      return NextResponse.json({ ok: false, error: "Error borrando: " + deleteError.message }, { status: 500 })
    }

    // Insertar las nuevas
    if (clases.length > 0) {
      const { error: insertError } = await supabase
        .from("clases_especiales_maternal")
        .insert(clases.map((c: any) => ({
          sala,
          tipo: c.tipo,
          dia: c.dia
        })))

      if (insertError) {
        return NextResponse.json({ ok: false, error: "Error insertando: " + insertError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true, saved: clases.length })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "Error interno" }, { status: 500 })
  }
}

// DELETE - borrar una clase especial
export async function DELETE(request: Request) {
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ ok: false, error: "ID requerido" }, { status: 400 })
  }

  const { error } = await supabase
    .from("clases_especiales_maternal")
    .delete()
    .eq("id", id)

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
