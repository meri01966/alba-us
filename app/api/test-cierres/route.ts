// Test endpoint to debug cierres query - DO NOT DELETE
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala") || "SALADEPRUEBA"

  const { data, error } = await supabase
    .from("registro_cierre")
    .select("id, sala, eje, fecha")
    .eq("sala", sala)

  const { data: all } = await supabase
    .from("registro_cierre")
    .select("sala")

  const salas = [...new Set(all?.map(r => r.sala))]

  return NextResponse.json({
    sala,
    cierres: data?.length ?? 0,
    error: error?.message ?? null,
    muestra: data?.slice(0, 3) ?? [],
    todasLasSalas: salas,
  })
}
