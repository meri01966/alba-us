import { NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { studentId, alumno_id, field, eje, status, resultado, actividad } = body

    const id = studentId || alumno_id
    const ejeVal = field || eje || "CF"
    const resVal = status || resultado || "green"
    const actVal = actividad || ""

    if (!id) {
      return NextResponse.json({ ok: false, error: "Falta alumno_id" }, { status: 400 })
    }

    const supabase = getServerClient()
    const hoy = new Date().toISOString().split("T")[0]

    const { data: existing } = await supabase
      .from("seguimiento")
      .select("id")
      .eq("alumno_id", id)
      .eq("eje", ejeVal)
      .gte("fecha", `${hoy}T00:00:00`)
      .lte("fecha", `${hoy}T23:59:59`)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from("seguimiento")
        .update({ resultado: resVal, actividad: actVal, fecha: new Date().toISOString() })
        .eq("id", existing.id)

      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    } else {
      const { error } = await supabase
        .from("seguimiento")
        .insert([{ alumno_id: id, eje: ejeVal, resultado: resVal, actividad: actVal, fecha: new Date().toISOString() }])

      if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("Error en registrar-actividad:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
