import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
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
      // Tabla puede no existir aun - devuelve vacio sin error
      return NextResponse.json({ registros: [] })
    }

    return NextResponse.json({ registros: registros || [] })
  } catch (err) {
    console.error("[v0] Error en historial-semana:", err)
    return NextResponse.json({ registros: [] })
  }
}
