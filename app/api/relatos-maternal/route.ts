// ALBA — Relatos guardados de maternal
// Cada relato del grupo queda con su fecha. Asi se acumula la historia de la
// sala y el relato siguiente puede comparar contra el anterior y contar que
// cambio. Antes era una foto que se generaba y se perdia.
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sala = searchParams.get("sala")
    if (!sala) return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

    const { data, error } = await supabase
      .from("relatos_maternal")
      .select("id, fecha, contenido, created_at")
      .eq("sala", sala)
      .eq("tipo", "grupo")
      .order("created_at", { ascending: false })
      .limit(20)

    if (error) {
      console.error("[v0] Error leyendo relatos:", error.message)
      return NextResponse.json({ ok: true, ultimo: null, historia: [] })
    }

    const lista = data || []

    return NextResponse.json({
      ok: true,
      ultimo: lista[0] || null,   // el mas reciente, para comparar
      historia: lista,            // los ultimos 20, para leer para atras
    })
  } catch (e) {
    console.error("[v0] Error en relatos-maternal:", e)
    return NextResponse.json({ ok: true, ultimo: null, historia: [] })
  }
}
