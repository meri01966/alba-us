import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// Usamos registro_cierre para guardar planificaciones temporalmente
// hasta que se cree la tabla planificaciones en Supabase

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sala = searchParams.get("sala") || "Manzanos"

    // Por ahora retornamos null ya que no hay tabla planificaciones
    // Las planificaciones se muestran desde el modal que usa /api/planificaciones
    return NextResponse.json({ planning: null, source: "none" })
  } catch (error) {
    console.error("[v0] Error fetching planning:", error)
    return NextResponse.json({ planning: null, source: "error" })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { titulo, objetivo, actividad, recursos, sala = "Manzanos", eje = "CF" } = body

    const today = new Date().toISOString().split("T")[0]

    // Guardar planificacion en registro_cierre usando columnas que existen
    const { data, error } = await supabase
      .from("registro_cierre")
      .insert([{
        fecha: today,
        sala,
        eje,
        actividad_alba: titulo || "Planificacion docente",
        actividad_docente: actividad || titulo,
        observaciones: objetivo ? `Objetivo: ${objetivo}\n${recursos ? `Recursos: ${recursos}` : ""}` : "",
        sugerencia_ia: recursos || "",
        evaluacion_general: "pendiente",
      }])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error saving planning:", error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      planning: {
        id: data.id,
        titulo: titulo || actividad,
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
