import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

// POST: Guardar registro de cierre que nutre a la IA
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      actividadALBA,
      actividadDocente,
      eje,
      sala = "Girasoles",
      evaluacionGeneral,
      observaciones,
      sugerenciaParaIA,
      stats = { green: 0, yellow: 0, red: 0, ausentes: 0 },
    } = body

    // Calcular promedio del dia (con fallback si stats no viene)
    const safeStats = stats || { green: 0, yellow: 0, red: 0 }
    const total = (safeStats.green || 0) + (safeStats.yellow || 0) + (safeStats.red || 0)
    const promedio = total > 0 
      ? Math.round((((safeStats.green || 0) * 100) + ((safeStats.yellow || 0) * 50) + ((safeStats.red || 0) * 10)) / total)
      : 0

    // Determinar si la actividad fue efectiva
    const actividadEfectiva = evaluacionGeneral === "excelente" || evaluacionGeneral === "buena"
    const noRealizada = evaluacionGeneral === "no_realizada"
    const usarEnFuturo = actividadEfectiva && promedio >= 60

    const registro = {
      fecha: new Date().toISOString().split("T")[0],
      actividad_alba: actividadALBA,
      actividad_docente: actividadDocente,
      eje,
      sala,
      evaluacion_general: evaluacionGeneral,
      observaciones,
      sugerencia_ia: sugerenciaParaIA,
      stats: safeStats,
      no_realizada: noRealizada,      // flag para que ALBA la vuelva a sugerir
    }

    const supabase = getSupabase()

    // Siempre insertar — cada Finalizar Jornada es un nuevo registro independiente.
    // El brain usa cierres.length para avanzar la secuencia: 1 cierre = actividad siguiente.
    const { error } = await supabase
      .from("registro_cierre")
      .insert([registro])

    if (error) {
      console.error("[v0] Error guardando registro:", error.message)
    }

    // Generar feedback para el docente
    let feedback = ""
    if (noRealizada) {
      feedback = `Actividad "${actividadDocente}" registrada como no realizada. ALBA la volvera a sugerir en la proxima planificacion.`
    } else if (actividadEfectiva) {
      feedback = `Excelente! La actividad "${actividadDocente}" ha sido registrada como efectiva para ${eje}. `
      if (usarEnFuturo) {
        feedback += "ALBA la considerara para futuras recomendaciones de esta sala."
      }
    } else {
      feedback = `Gracias por tu retroalimentacion. ALBA ajustara las proximas sugerencias considerando que "${actividadDocente}" necesita adaptaciones para este grupo.`
    }

    // Guardar insights para la IA
    const insights = {
      eje,
      actividadEvaluada: actividadDocente,
      esActividadALBA: actividadDocente === actividadALBA,
      promedio,
      evaluacionDocente: evaluacionGeneral,
      sugerenciaDocente: sugerenciaParaIA,
      recomendaciones: [] as string[],
    }

    // Generar recomendaciones basadas en el cierre
    if (promedio < 50) {
      insights.recomendaciones.push("Reforzar con actividades mas simples")
      insights.recomendaciones.push("Considerar trabajo en grupos pequenos")
    } else if (promedio < 70) {
      insights.recomendaciones.push("Repetir actividad con variaciones")
      insights.recomendaciones.push("Agregar apoyo visual o concreto")
    } else {
      insights.recomendaciones.push("Puede avanzar a siguiente nivel")
      insights.recomendaciones.push("Considerar actividades de extension")
    }

    if (sugerenciaParaIA) {
      insights.recomendaciones.push(`Sugerencia docente: ${sugerenciaParaIA}`)
    }

    return NextResponse.json({
      success: true,
      feedback,
      insights,
      registro: {
        ...registro,
        id: Date.now().toString(),
      },
    })
  } catch (err) {
    console.error("[v0] Error en registro de cierre:", err)
    return NextResponse.json(
      { success: false, error: "Error al procesar el registro" },
      { status: 500 }
    )
  }
}

// GET: Obtener registros de cierre para analisis de IA
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eje = searchParams.get("eje")
    const limit = parseInt(searchParams.get("limit") || "50")

    const supabase = getSupabase()
    if (!supabase) {
      return NextResponse.json({ registros: [], message: "Supabase no configurado" })
    }

    let query = supabase
      .from("registro_cierre")
      .select("*")
      .order("fecha", { ascending: false })
      .limit(limit)

    if (eje) {
      query = query.eq("eje", eje)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Error obteniendo registros:", error)
      return NextResponse.json({ registros: [] })
    }

    // Calcular estadisticas para la IA
    const estadisticas = {
      totalRegistros: data?.length || 0,
      actividadesEfectivas: data?.filter(r => r.actividad_efectiva).length || 0,
      promedioGeneral: data?.length 
        ? Math.round(data.reduce((acc, r) => acc + r.promedio_logro, 0) / data.length)
        : 0,
      porEje: {} as Record<string, { count: number; promedio: number; efectivas: number }>,
    }

    // Agrupar por eje
    data?.forEach(r => {
      if (!estadisticas.porEje[r.eje]) {
        estadisticas.porEje[r.eje] = { count: 0, promedio: 0, efectivas: 0 }
      }
      estadisticas.porEje[r.eje].count++
      estadisticas.porEje[r.eje].promedio += r.promedio_logro
      if (r.actividad_efectiva) estadisticas.porEje[r.eje].efectivas++
    })

    // Calcular promedios por eje
    Object.keys(estadisticas.porEje).forEach(eje => {
      estadisticas.porEje[eje].promedio = Math.round(
        estadisticas.porEje[eje].promedio / estadisticas.porEje[eje].count
      )
    })

    return NextResponse.json({
      registros: data || [],
      estadisticas,
    })
  } catch (err) {
    console.error("[v0] Error en GET registro-cierre:", err)
    return NextResponse.json({ registros: [], error: "Error al obtener registros" })
  }
}
