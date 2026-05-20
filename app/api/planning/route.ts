import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// Usamos registro_cierre para guardar planificaciones temporalmente
// hasta que se cree la tabla planificaciones en Supabase

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sala = searchParams.get("sala") || "Manzanos"

    // Buscar en registro_cierre con tipo "planificacion"
    const { data, error } = await supabase
      .from("registro_cierre")
      .select("*")
      .eq("sala", sala)
      .eq("tipo", "planificacion")
      .order("fecha", { ascending: false })
      .limit(1)

    if (error) {
      console.error("[v0] Error fetching planning:", error.message)
      return NextResponse.json({ planning: null, source: "error" })
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ planning: null, source: "supabase" })
    }

    const record = data[0]
    return NextResponse.json({
      planning: {
        id: record.id,
        titulo: record.observaciones?.split("\n")[0] || "Mi planificacion",
        objetivo: "",
        actividad: record.observaciones || "",
        recursos: "",
        fecha: record.fecha?.split("T")[0] || new Date().toISOString().split("T")[0],
        sala: record.sala,
      },
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

    const contenidoCompleto = [
      titulo,
      objetivo && `Objetivo: ${objetivo}`,
      actividad,
      recursos && `Recursos: ${recursos}`,
    ].filter(Boolean).join("\n\n")

    const today = new Date().toISOString().split("T")[0]

    // Verificar si ya existe planificacion para hoy
    const { data: existing } = await supabase
      .from("registro_cierre")
      .select("id")
      .eq("sala", sala)
      .eq("tipo", "planificacion")
      .gte("fecha", `${today}T00:00:00`)
      .lte("fecha", `${today}T23:59:59`)
      .single()

    if (existing) {
      const { data, error } = await supabase
        .from("registro_cierre")
        .update({ observaciones: contenidoCompleto })
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        console.error("[v0] Error updating planning:", error.message)
        return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
      }

      return NextResponse.json({
        planning: {
          id: data.id,
          titulo: titulo || contenidoCompleto.split("\n")[0],
          objetivo: objetivo || "",
          actividad: actividad || "",
          recursos: recursos || "",
          fecha: today,
          sala,
        },
        success: true,
      })
    }

    // Insertar nuevo
    const { data, error } = await supabase
      .from("registro_cierre")
      .insert([{
        fecha: new Date().toISOString(),
        sala,
        eje: "planificacion",
        tipo: "planificacion",
        clase_completada: "",
        observaciones: contenidoCompleto,
        logrados: 0,
        en_proceso: 0,
        necesita_refuerzo: 0,
      }])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error saving planning:", error.message)
      return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
    }

    return NextResponse.json({
      planning: {
        id: data.id,
        titulo: titulo || contenidoCompleto.split("\n")[0],
        objetivo: objetivo || "",
        actividad: actividad || "",
        recursos: recursos || "",
        fecha: today,
        sala,
      },
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error saving planning:", error)
    return NextResponse.json({ error: "Error al guardar" }, { status: 500 })
  }
}
