import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sala = searchParams.get("sala") || "Kindergarten"
    const fecha = searchParams.get("fecha") || new Date().toISOString().split("T")[0]

    // Obtener alumnos de la sala
    const { data: alumnos } = await supabase
      .from("alumnos")
      .select("id")
      .eq("sala", sala)

    if (!alumnos || alumnos.length === 0) {
      return NextResponse.json({ evaluaciones: {} })
    }

    const alumnoIds = alumnos.map(a => a.id)

    // Obtener seguimiento de hoy para estos alumnos
    const { data: seguimiento } = await supabase
      .from("seguimiento")
      .select("alumno_id, estado")
      .in("alumno_id", alumnoIds)
      .eq("fecha", fecha)

    if (!seguimiento || seguimiento.length === 0) {
      return NextResponse.json({ evaluaciones: {} })
    }

    // Convertir a mapa de evaluaciones
    const evaluaciones: Record<string, string> = {}
    for (const s of seguimiento) {
      evaluaciones[s.alumno_id] = s.estado
    }

    return NextResponse.json({ evaluaciones })
  } catch (e) {
    console.error("[v0] Error en evaluaciones-hoy:", e)
    return NextResponse.json({ evaluaciones: {} })
  }
}
