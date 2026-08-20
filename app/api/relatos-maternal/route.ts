// ALBA — Relatos guardados de maternal
// Cada relato del grupo queda con su fecha. Asi se acumula la historia de la
// sala y el relato siguiente puede comparar contra el anterior y contar que
// cambio. Antes era una foto que se generaba y se perdia.
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"


export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sala = searchParams.get("sala")
    if (!sala) return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })

    // tipo: "grupo" (por defecto) o "alumnos"
    const tipo = searchParams.get("tipo") || "grupo"

    const { data, error } = await supabase
      .from("relatos_maternal")
      .select("id, fecha, contenido, created_at")
      .eq("sala", sala)
      .eq("tipo", tipo)
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
