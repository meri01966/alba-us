import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

interface Planning {
  id: string
  titulo: string
  objetivo: string
  actividad: string
  recursos: string
  fecha: string
  sala?: string
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sala = searchParams.get("sala") || "Manzanos"

    const { data, error } = await supabase
      .from("planificaciones")
      .select("*")
      .eq("sala", sala)
      .order("fecha", { ascending: false })
      .limit(1)

    if (error) {
      console.error("[v0] Error fetching planning from Supabase:", error.message)
      return NextResponse.json({ planning: null, source: "error" })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ planning: null, source: "supabase" })
    }

    const record = data[0]
    return NextResponse.json({
      planning: {
        id: record.id,
        titulo: record.contenido_maestra?.split("\n")[0] || "Mi planificacion",
        objetivo: "",
        actividad: record.contenido_maestra || "",
        recursos: "",
        fecha: record.fecha?.split("T")[0] || new Date().toISOString().split("T")[0],
        sala: record.sala,
      } as Planning,
      source: "supabase",
    })
  } catch (error) {
    console.error("[v0] Error fetching planning:", error)
    return NextResponse.json({ planning: null, source: "error" })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { titulo, objetivo, actividad, recursos, sala = "Manzanos" } = body

    // Combinar titulo, objetivo, actividad y recursos en contenido_maestra
    const contenidoCompleto = [
      titulo,
      objetivo && `Objetivo: ${objetivo}`,
      actividad,
      recursos && `Recursos: ${recursos}`,
    ].filter(Boolean).join("\n\n")

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
      const { data, error } = await supabase
        .from("planificaciones")
        .update({
          contenido_maestra: contenidoCompleto,
        })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        console.error("[v0] Error updating planning:", error.message)
        return NextResponse.json({ error: "Error al guardar la planificacion" }, { status: 500 })
      }

      return NextResponse.json({
        planning: {
          id: data.id,
          titulo: titulo || contenidoCompleto.split("\n")[0],
          objetivo: objetivo || "",
          actividad: actividad || "",
          recursos: recursos || "",
          fecha: data.fecha?.split("T")[0] || today,
          sala: data.sala,
        },
        success: true,
      })
    }

    // Insertar nuevo
    const { data, error } = await supabase
      .from("planificaciones")
      .insert([{
        fecha: new Date().toISOString(),
        sala,
        contenido_maestra: contenidoCompleto,
        sugerencia_alba: "",
        estado: "pendiente",
      }])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error saving planning:", error.message)
      return NextResponse.json({ error: "Error al guardar la planificacion" }, { status: 500 })
    }

    return NextResponse.json({
      planning: {
        id: data.id,
        titulo: titulo || contenidoCompleto.split("\n")[0],
        objetivo: objetivo || "",
        actividad: actividad || "",
        recursos: recursos || "",
        fecha: data.fecha?.split("T")[0] || today,
        sala: data.sala,
      },
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error saving planning:", error)
    return NextResponse.json({ error: "Error al guardar la planificacion" }, { status: 500 })
  }
}
