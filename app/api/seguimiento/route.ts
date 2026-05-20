import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { alumno_id, eje, estado, sala } = body

    if (!alumno_id || !eje || !estado) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Verificar si ya existe un registro para hoy
    const { data: existing } = await supabase
      .from("seguimiento")
      .select("id")
      .eq("alumno_id", alumno_id)
      .eq("eje", eje)
      .gte("fecha", `${today}T00:00:00`)
      .lte("fecha", `${today}T23:59:59`)
      .maybeSingle()

    if (existing) {
      // Actualizar existente - solo campos que existen en la tabla
      const { error } = await supabase
        .from("seguimiento")
        .update({ resultado: estado })
        .eq("id", existing.id)

      if (error) {
        console.error("[v0] Error actualizando seguimiento:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      // Insertar nuevo - solo campos que existen en la tabla
      const { error } = await supabase.from("seguimiento").insert([{
        alumno_id,
        eje,
        resultado: estado,
        fecha: new Date().toISOString(),
      }])

      if (error) {
        console.error("[v0] Error insertando seguimiento:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[v0] Error en seguimiento:", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
