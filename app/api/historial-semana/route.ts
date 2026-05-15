import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://oairchbitlanpzywncua.supabase.co"
const supabaseServiceKey = "sb_secret_LyML0Qjo3eDXzjHe0EGaxA_2xpSabDX"
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sala = searchParams.get("sala") || "Girasoles"
    const desde = searchParams.get("desde")
    const hasta = searchParams.get("hasta")
    
    if (!desde) {
      return NextResponse.json({ error: "Falta parametro desde" }, { status: 400 })
    }
    
    // Obtener registros de cierre para esta sala en el rango de fechas
    let query = supabase
      .from("registros_cierre")
      .select("fecha, eje, actividad_docente, actividad_alba, evaluacion_general")
      .eq("sala", sala)
      .gte("fecha", desde)
    
    if (hasta) {
      query = query.lte("fecha", hasta)
    }
    
    const { data: registros, error } = await query.order("fecha", { ascending: true })
    
    if (error) {
      console.error("Error obteniendo historial:", error)
      return NextResponse.json({ registros: [] })
    }
    
    return NextResponse.json({ registros: registros || [] })
  } catch (err) {
    console.error("Error en historial-semana:", err)
    return NextResponse.json({ registros: [] })
  }
}
