import { NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala") || "TK"

  try {
    const supabase = getServerClient()
    const hace7 = new Date(Date.now() - 7 * 86400000).toISOString()

    const { data: alumnos } = await supabase
      .from("alumnos")
      .select("id, nombre")
      .eq("sala", sala)

    if (!alumnos || alumnos.length === 0) {
      return NextResponse.json({ historial: [], resumen: {} })
    }

    const ids = alumnos.map(a => a.id)
    const { data: regs } = await supabase
      .from("seguimiento")
      .select("*")
      .in("alumno_id", ids)
      .gte("fecha", hace7)
      .order("fecha", { ascending: true })

    return NextResponse.json({ historial: regs || [], alumnos, resumen: { total: alumnos.length, registros: (regs || []).length } })
  } catch (err) {
    console.error("Error en historial-semana:", err)
    return NextResponse.json({ historial: [], resumen: {} })
  }
}
