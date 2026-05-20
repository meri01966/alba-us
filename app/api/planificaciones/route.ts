import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// GET - Obtener planificaciones de una sala
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sala = searchParams.get("sala")

    if (!sala) {
      return NextResponse.json({ error: "Sala requerida" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("planificaciones")
      .select("*")
      .eq("sala", sala)
      .order("fecha", { ascending: false })
      .limit(30)

    if (error) {
      console.error("[v0] Error obteniendo planificaciones:", error.message)
      return NextResponse.json({ planificaciones: [] })
    }

    return NextResponse.json({ planificaciones: data || [] })
  } catch (e) {
    console.error("[v0] Error en GET planificaciones:", e)
    return NextResponse.json({ planificaciones: [] })
  }
}

// POST - Crear nueva planificacion
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sala, contenido_maestra, sugerencia_alba } = body

    if (!sala || !contenido_maestra) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar si ya existe planificacion para hoy en esta sala
    const today = new Date().toISOString().split("T")[0]
    const { data: existing } = await supabase
      .from("planificaciones")
      .select("id")
      .eq("sala", sala)
      .gte("fecha", `${today}T00:00:00`)
      .lte("fecha", `${today}T23:59:59`)
      .single()

    if (existing) {
      // Actualizar existente
      const { error } = await supabase
        .from("planificaciones")
        .update({
          contenido_maestra,
          sugerencia_alba: sugerencia_alba || "",
        })
        .eq("id", existing.id)

      if (error) {
        console.error("[v0] Error actualizando planificacion:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      // Insertar nueva
      const { error } = await supabase.from("planificaciones").insert([
        {
          fecha: new Date().toISOString(),
          sala,
          contenido_maestra,
          sugerencia_alba: sugerencia_alba || "",
          estado: "pendiente",
        },
      ])

      if (error) {
        console.error("[v0] Error creando planificacion:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[v0] Error en POST planificaciones:", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// PATCH - Actualizar estado de planificacion
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, estado } = body

    if (!id || !estado) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const { error } = await supabase
      .from("planificaciones")
      .update({ estado })
      .eq("id", id)

    if (error) {
      console.error("[v0] Error actualizando estado:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[v0] Error en PATCH planificaciones:", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
