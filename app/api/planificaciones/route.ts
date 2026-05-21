import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// GET - Obtener historial de planificaciones (desde registro_cierre)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sala = searchParams.get("sala")

    if (!sala) {
      return NextResponse.json({ error: "Sala requerida" }, { status: 400 })
    }

    // Usar registro_cierre que SI existe
    const { data, error } = await supabase
      .from("registro_cierre")
      .select("id, fecha, actividad_docente, actividad_alba, observaciones, sugerencia_ia, evaluacion_general")
      .eq("sala", sala)
      .order("fecha", { ascending: false })
      .limit(30)

    if (error) {
      console.error("[v0] Error obteniendo planificaciones:", error.message)
      return NextResponse.json({ planificaciones: [] })
    }

    // Mapear a formato esperado
    const planificaciones = (data || []).map(r => ({
      id: r.id,
      fecha: r.fecha,
      contenido_maestra: r.actividad_docente || r.observaciones || "",
      sugerencia_alba: r.actividad_alba || "",
      estado: r.evaluacion_general ? "completada" : "pendiente"
    }))

    return NextResponse.json({ planificaciones })
  } catch (e) {
    console.error("[v0] Error en GET planificaciones:", e)
    return NextResponse.json({ planificaciones: [] })
  }
}

// POST - Guardar planificacion de la maestra
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { sala, contenido_maestra, sugerencia_alba } = body

    if (!sala || !contenido_maestra) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Verificar si ya existe para hoy
    const { data: existing } = await supabase
      .from("registro_cierre")
      .select("id")
      .eq("sala", sala)
      .eq("fecha", today)
      .maybeSingle()

    if (existing) {
      // Actualizar
      const { error } = await supabase
        .from("registro_cierre")
        .update({
          actividad_docente: contenido_maestra,
          sugerencia_ia: sugerencia_alba || "",
        })
        .eq("id", existing.id)

      if (error) {
        console.error("[v0] Error actualizando planificacion:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      // Insertar nuevo
      const { error } = await supabase.from("registro_cierre").insert([{
        fecha: today,
        sala,
        actividad_docente: contenido_maestra,
        actividad_alba: sugerencia_alba || "",
        sugerencia_ia: sugerencia_alba || "",
      }])

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
