import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sala = searchParams.get("sala") || "Girasoles"
    const desde = searchParams.get("desde")
    const hasta = searchParams.get("hasta")

    if (!desde) {
      return NextResponse.json({ error: "Falta parametro desde" }, { status: 400 })
    }

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ registros: [] })
    }

    let query = supabase
      .from("registro_cierre")
      .select("fecha, eje, actividad_docente, actividad_alba, evaluacion_general")
      .eq("sala", sala)
      .gte("fecha", desde)

    if (hasta) {
      query = query.lte("fecha", hasta)
    }

    const { data: registros, error } = await query.order("fecha", { ascending: true })

    if (error) {
      console.error("[v0] Error obteniendo historial:", error)
      return NextResponse.json({ registros: [] })
    }

    return NextResponse.json({ registros: registros || [] })
  } catch (err) {
    console.error("[v0] Error en historial-semana:", err)
    return NextResponse.json({ registros: [] })
  }
}
