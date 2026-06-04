import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// API para obtener la planificacion dia por dia de una sala
// Muestra actividades realizadas con fecha, eje, descripcion y estado

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oairchbitlanpzywncua.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"
)

const EJES_NOMBRES: Record<string, string> = {
  CF: "Conciencia Fonologica",
  CT: "Comprension de Textos",
  O: "Oralidad"
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sala = searchParams.get("sala")

  if (!sala) {
    return NextResponse.json({ error: "Falta parametro sala" }, { status: 400 })
  }

  try {
    // Obtener todos los cierres de la sala ordenados por fecha descendente
    const { data: cierres, error } = await supabase
      .from("registro_cierre")
      .select("*")
      .eq("sala", sala)
      .order("fecha", { ascending: false })

    if (error) {
      console.error("[planificacion-sala] Error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Agrupar por fecha
    const porFecha: Record<string, any[]> = {}
    for (const cierre of cierres || []) {
      const fecha = cierre.fecha || "sin-fecha"
      if (!porFecha[fecha]) porFecha[fecha] = []
      
      // Determinar si esta completa (tiene evaluacion o actividad registrada)
      const completa = !!(cierre.actividad_alba || cierre.actividad_docente || cierre.evaluacion_general)
      
      porFecha[fecha].push({
        id: cierre.id,
        eje: cierre.eje,
        ejeNombre: EJES_NOMBRES[cierre.eje] || cierre.eje,
        actividadAlba: cierre.actividad_alba,
        actividadDocente: cierre.actividad_docente,
        evaluacionGeneral: cierre.evaluacion_general,
        observaciones: cierre.observaciones,
        sugerenciaIA: cierre.sugerencia_ia,
        stats: cierre.stats,
        completa,
        hora: cierre.created_at ? new Date(cierre.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) : null
      })
    }

    // Convertir a array ordenado por fecha descendente
    const fechasOrdenadas = Object.keys(porFecha).sort((a, b) => b.localeCompare(a))
    const planificacion = fechasOrdenadas.map(fecha => ({
      fecha,
      fechaFormateada: formatearFecha(fecha),
      actividades: porFecha[fecha]
    }))

    return NextResponse.json({
      ok: true,
      sala,
      totalDias: planificacion.length,
      totalActividades: cierres?.length || 0,
      planificacion
    })

  } catch (e: any) {
    console.error("[planificacion-sala] Error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

function formatearFecha(fecha: string): string {
  if (!fecha || fecha === "sin-fecha") return "Sin fecha"
  
  try {
    const d = new Date(fecha + "T12:00:00")
    const dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    
    return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}`
  } catch {
    return fecha
  }
}
