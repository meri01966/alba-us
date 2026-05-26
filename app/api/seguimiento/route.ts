import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { alumno_id, eje, estado, sala, actividad } = body

    if (!alumno_id || !eje || !estado || !sala) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const now   = new Date().toISOString()
    const today = now.split("T")[0]

    // Un registro por alumno+eje por dia — upsert segun rango de fecha
    const { data: existing } = await supabase
      .from("seguimiento")
      .select("id")
      .eq("alumno_id", alumno_id)
      .eq("eje", eje)
      .gte("fecha", `${today}T00:00:00`)
      .lte("fecha", `${today}T23:59:59`)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from("seguimiento")
        .update({ estado, actividad: actividad ?? null, fecha: now })
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
        actividad: actividad ?? null,
        fecha: now,
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
