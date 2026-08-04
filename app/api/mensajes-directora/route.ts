import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const SUPABASE_URL = "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

// GET - Obtener mensajes de una sala o todos los mensajes
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const { searchParams } = new URL(req.url)
    const sala = searchParams.get("sala")

    let query = supabase.from("mensajes_directora").select("*").order("created_at", { ascending: false })

    if (sala) {
      query = query.eq("sala", sala)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error obteniendo mensajes:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, mensajes: data || [] })
  } catch (err) {
    console.error("[v0] Error en GET mensajes:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

// POST - Enviar nuevo mensaje
// autor: "directora" (mensaje de direccion a la sala) o el nombre de la sala
// (mensaje de la maestra hacia direccion). Se completa solo, sin pedirselo al usuario.
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const body = await req.json()
    const { sala, mensaje, autor } = body

    if (!sala || !mensaje) {
      return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 })
    }

    const { data, error } = await supabase.from("mensajes_directora").insert({
      sala,
      mensaje,
      autor: autor || "directora", // compatibilidad: si no llega autor, se asume directora (comportamiento previo)
      leido: false,
      created_at: new Date().toISOString()
    }).select().single()

    if (error) {
      console.error("[v0] Error enviando mensaje:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, mensaje: data })
  } catch (err) {
    console.error("[v0] Error en POST mensaje:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

// PATCH - Marcar mensaje como leido
export async function PATCH(req: NextRequest) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    const body = await req.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ ok: false, error: "Falta id" }, { status: 400 })
    }

    const { data, error } = await supabase.from("mensajes_directora")
      .update({ leido: true, leido_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error marcando leido:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, mensaje: data })
  } catch (err) {
    console.error("[v0] Error en PATCH mensaje:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
