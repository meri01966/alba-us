import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ehwlulqcwimatxmnajra.supabase.co"
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_q-qtEDnI0QxcrTt3pQIh8w_vbmnQZS1"

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { fecha, actividad, eje, sala } = body

    if (!fecha || !actividad || !eje || !sala) {
      return NextResponse.json({ error: "Faltan parametros" }, { status: 400 })
    }

    // Insertar como un registro de cierre planificado (sin evaluacion todavia)
    const registro = {
      fecha: fecha + "T12:00:00.000Z",
      actividad_docente: actividad,
      actividad_alba: `Actividad planificada por docente: ${actividad}`,
      eje,
      sala,
      evaluacion_general: null,
      observaciones: "Actividad planificada desde calendario",
      sugerencia_ia: null,
      promedio_logro: 0,
      stats_green: 0,
      stats_yellow: 0,
      stats_red: 0,
      actividad_efectiva: false,
      usar_en_futuro: false,
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from("registro_cierre")
      .insert([registro])
      .select()

    if (error) {
      console.error("Error insertando actividad planificada:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      mensaje: "Actividad agregada a la secuencia",
      registro: data?.[0]
    })
  } catch (err) {
    console.error("Error en actividad-planificada:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
