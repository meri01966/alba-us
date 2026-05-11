import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Mapeo de actividades a semanas de la secuencia ALBA
const SECUENCIA_SEMANAS = {
  CF: 25,
  CT: 25,
  O: 25,
}

interface ActividadEvaluada {
  semana: number
  titulo: string
  fecha: string
  resultado: "green" | "yellow" | "red"
  promedio: number
}

interface ProgresoEje {
  logradas: number[]
  porcentaje: number
  actividades: ActividadEvaluada[]
  tendencia: "mejorando" | "estable" | "bajando"
  semanaActual: number
}

// Calcular promedio ponderado: green=100, yellow=50, red=10
function calcularPromedio(actividades: Array<{ resultado: string }>): number {
  if (actividades.length === 0) return 0
  const puntos = actividades.reduce((acc, a) => {
    if (a.resultado === "green") return acc + 100
    if (a.resultado === "yellow") return acc + 50
    return acc + 10
  }, 0)
  return Math.round(puntos / actividades.length)
}

// Calcular tendencia basada en ultimas evaluaciones
function calcularTendencia(actividades: Array<{ resultado: string; fecha: string }>): "mejorando" | "estable" | "bajando" {
  if (actividades.length < 6) return "estable"
  
  const ordenadas = [...actividades].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  )
  
  const recientes = ordenadas.slice(0, 3)
  const anteriores = ordenadas.slice(3, 6)
  
  const promedioReciente = calcularPromedio(recientes)
  const promedioAnterior = calcularPromedio(anteriores)
  
  if (promedioReciente > promedioAnterior + 10) return "mejorando"
  if (promedioReciente < promedioAnterior - 10) return "bajando"
  return "estable"
}

// Calcular semana actual basada en promedio y cantidad de evaluaciones
function calcularSemanaActual(actividades: Array<{ resultado: string }>, promedio: number): number {
  const diasEvaluados = actividades.length
  
  if (diasEvaluados === 0) return 1
  
  // Avance basado en promedio
  if (promedio >= 70) {
    return Math.min(25, Math.floor(diasEvaluados / 3) + 1)
  } else if (promedio >= 50) {
    return Math.min(25, Math.floor(diasEvaluados / 5) + 1)
  } else {
    return Math.min(25, Math.floor(diasEvaluados / 7) + 1)
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ alumnoId: string }> }
) {
  const { alumnoId } = await params

  // Si no hay Supabase, devolver datos vacios (sin evaluar)
  if (!supabase) {
    return NextResponse.json({
      ok: true,
      source: "demo",
      alumno: { id: alumnoId, nombre: "Sin", apellido: "Datos" },
      progreso: {
        CF: { logradas: [], porcentaje: 0, actividades: [], tendencia: "estable", semanaActual: 1 },
        CT: { logradas: [], porcentaje: 0, actividades: [], tendencia: "estable", semanaActual: 1 },
        O: { logradas: [], porcentaje: 0, actividades: [], tendencia: "estable", semanaActual: 1 },
      },
    })
  }

  try {
    // Buscar datos del alumno
    const { data: alumnoData, error: alumnoError } = await supabase
      .from("alumnos")
      .select("id, nombre, apellido")
      .eq("id", alumnoId)
      .single()

    if (alumnoError && alumnoError.code !== "PGRST116") {
      console.error("[v0] Error fetching alumno:", alumnoError)
    }

    // Buscar todas las evaluaciones del alumno
    const { data: evaluaciones, error: evalError } = await supabase
      .from("seguimiento")
      .select("*")
      .eq("alumno_id", alumnoId)
      .order("fecha", { ascending: false })

    if (evalError) {
      console.error("[v0] Error fetching evaluaciones:", evalError)
    }

    // Organizar evaluaciones por eje
    const evaluacionesPorEje: Record<string, Array<{
      semana: number
      titulo: string
      fecha: string
      resultado: "green" | "yellow" | "red"
      actividad: string
    }>> = { CF: [], CT: [], O: [] }

    const contadorSemana: Record<string, number> = { CF: 1, CT: 1, O: 1 }

    ;(evaluaciones || []).forEach((ev: any) => {
      const eje = ev.eje as "CF" | "CT" | "O"
      if (!evaluacionesPorEje[eje]) return

      evaluacionesPorEje[eje].push({
        semana: contadorSemana[eje]++,
        titulo: ev.actividad || `Actividad ${contadorSemana[eje]}`,
        fecha: new Date(ev.fecha).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
        resultado: ev.resultado as "green" | "yellow" | "red",
        actividad: ev.actividad || "",
      })
    })

    // Calcular progreso por eje
    const progreso: Record<string, ProgresoEje> = {}

    for (const eje of ["CF", "CT", "O"]) {
      const actividades = evaluacionesPorEje[eje]
      const promedio = calcularPromedio(actividades)
      const tendencia = calcularTendencia(actividades)
      const semanaActual = calcularSemanaActual(actividades, promedio)
      
      // Actividades logradas (green)
      const logradas = actividades
        .filter(a => a.resultado === "green")
        .map((_, idx) => idx + 1)

      progreso[eje] = {
        logradas,
        porcentaje: promedio,
        actividades: actividades.slice(0, 10).map(a => ({
          semana: a.semana,
          titulo: a.titulo,
          fecha: a.fecha,
          resultado: a.resultado,
          promedio: a.resultado === "green" ? 100 : a.resultado === "yellow" ? 50 : 10,
        })),
        tendencia,
        semanaActual,
      }
    }

    return NextResponse.json({
      ok: true,
      source: "supabase",
      alumno: alumnoData || { id: alumnoId, nombre: "Alumno", apellido: "" },
      progreso,
    })
  } catch (error) {
    console.error("[v0] Error in progreso API:", error)
    return NextResponse.json({ 
      ok: false, 
      error: String(error),
      progreso: {
        CF: { logradas: [], porcentaje: 0, actividades: [], tendencia: "estable", semanaActual: 1 },
        CT: { logradas: [], porcentaje: 0, actividades: [], tendencia: "estable", semanaActual: 1 },
        O: { logradas: [], porcentaje: 0, actividades: [], tendencia: "estable", semanaActual: 1 },
      },
    }, { status: 500 })
  }
}
