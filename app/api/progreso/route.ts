import { NextResponse } from "next/server"

// Esta API ya no devuelve datos demo
// La unica fuente de verdad es Supabase (manejado en page.tsx)
export async function GET() {
  return NextResponse.json({
    ok: true,
    source: "empty",
    alumnos: [],
    progreso: {},
    message: "Use Supabase como fuente de datos"
  })
}
