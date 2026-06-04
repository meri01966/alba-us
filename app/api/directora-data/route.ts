import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    const [{ data: alumnos, error: errAlumnos }, { data: registros, error: errRegistros }, { data: cierres, error: errCierres }] = await Promise.all([
      supabase.from("alumnos").select("*").order("nombre"),
      supabase.from("seguimiento").select("*").order("fecha", { ascending: true }),
      supabase.from("registro_cierre").select("sala,eje,fecha").order("fecha", { ascending: true }),
    ])

    if (errAlumnos) console.error("[v0] directora-data alumnos error:", errAlumnos)
    if (errRegistros) console.error("[v0] directora-data registros error:", errRegistros)
    if (errCierres) console.error("[v0] directora-data cierres error:", errCierres)

    const alumnosMap = new Map((alumnos || []).map(a => [a.id, a]))
    const registrosEnriquecidos = (registros || []).map(r => ({
      ...r,
      alumno_nombre: alumnosMap.get(r.alumno_id)?.nombre || "",
      sala: r.sala || alumnosMap.get(r.alumno_id)?.sala || "",
    }))

    return NextResponse.json(
      {
        ok: true,
        alumnos: alumnos || [],
        registros: registrosEnriquecidos,
        cierres: cierres || [],
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    )
  } catch (err) {
    console.error("[v0] directora-data catch error:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
