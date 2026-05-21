import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { alumno_id, eje, estado, sala } = body

    if (!alumno_id || !eje || !estado || !sala) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const today = new Date().toISOString().split("T")[0]

    // Verificar si ya existe un registro para hoy
    const { data: existing } = await supabase
      .from("seguimiento")
      .select("id")
      .eq("alumno_id", alumno_id)
      .eq("eje", eje)
      .eq("fecha", today)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from("seguimiento")
        .update({ estado })
        .eq("id", existing.id)

      if (error) {
        console.error("[v0] Error actualizando seguimiento:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      const { error } = await supabase.from("seguimiento").insert([{
        alumno_id,
        eje,
        estado,
        sala,
        fecha: today,
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
