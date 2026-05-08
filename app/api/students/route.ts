import { NextResponse } from "next/server"

// Esta API ya no devuelve datos demo.
// Los alumnos se cargan directamente desde Supabase en page.tsx
// Esta ruta se mantiene por compatibilidad pero devuelve array vacio.

export async function GET() {
  return NextResponse.json({ 
    students: [], 
    source: "supabase",
    message: "Los alumnos ahora se cargan desde Supabase. Use la tabla 'alumnos'."
  })
}
