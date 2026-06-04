import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

// GET - obtener clases especiales de una sala
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sala = searchParams.get("sala")

  if (!sala) {
    return NextResponse.json({ ok: false, error: "Sala requerida" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("clases_especiales_maternal")
    .select("*")
    .eq("sala", sala)
    .order("orden", { ascending: true })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, clases: data || [] })
}

// POST - guardar/actualizar clases especiales
export async function POST(request: Request) {
  const body = await request.json()
  const { sala, clases } = body

  if (!sala || !clases) {
    return NextResponse.json({ ok: false, error: "Datos incompletos" }, { status: 400 })
  }

  // Borrar las clases anteriores de la sala
  await supabase
    .from("clases_especiales_maternal")
    .delete()
    .eq("sala", sala)

  // Insertar las nuevas
  if (clases.length > 0) {
    const { error } = await supabase
      .from("clases_especiales_maternal")
      .insert(clases.map((c: any, idx: number) => ({
        sala,
        tipo: c.tipo,
        dia: c.dia,
        orden: idx
      })))

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true })
}

// DELETE - borrar una clase especial
export async function DELETE(request: Request) {
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
