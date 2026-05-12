import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({
      ok: false,
      error: "Variables de entorno no configuradas",
      NEXT_PUBLIC_SUPABASE_URL: url ? "OK" : "FALTA",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: key ? "OK" : "FALTA",
    })
  }

  try {
    const client = createClient(url, key)
    const { data, error } = await client.from("alumnos").select("count").single()

    if (error) {
      return NextResponse.json({
        ok: false,
        error: error.message,
        hint: error.hint || null,
        code: error.code,
      })
    }

    return NextResponse.json({
      ok: true,
      mensaje: "Conexion exitosa con Supabase",
      alumnos: data,
    })
  } catch (err: unknown) {
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : "Error desconocido",
    })
  }
}
