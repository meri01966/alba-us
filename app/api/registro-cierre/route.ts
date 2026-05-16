import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key)
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
      stats,
    } = body

    // Calcular promedio del dia
    const total = stats.green + stats.yellow + stats.red
    const promedio = total > 0 
      ? Math.round(((stats.green * 100) + (stats.yellow * 50) + (stats.red * 10)) / total)
      : 0

    // Determinar si la actividad fue efectiva
    const actividadEfectiva = evaluacionGeneral === "excelente" || evaluacionGeneral === "buena"
    const usarEnFuturo = actividadEfectiva && promedio >= 60

    const registro = {
      fecha: new Date().toISOString(),
      actividad_alba: actividadALBA,
      actividad_docente: actividadDocente,
      eje,
      sala, // Sala para filtrar registros por grupo
      evaluacion_general: evaluacionGeneral,
      observaciones,
      sugerencia_ia: sugerenciaParaIA,
      promedio_logro: promedio,
      stats_green: stats.green,
      stats_yellow: stats.yellow,
      stats_red: stats.red,
      actividad_efectiva: actividadEfectiva,
      usar_en_futuro: usarEnFuturo,
    }

    // Guardar en Supabase si esta disponible
    if (supabase) {
      const { error } = await supabase
        .from("registro_cierre")
        .insert([registro])

      if (error) {
        console.error("[v0] Error guardando registro de cierre:", error)
        // Continuar aunque falle Supabase
      }
    }

    // Generar feedback para el docente
    let feedback = ""
    if (actividadEfectiva) {
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
