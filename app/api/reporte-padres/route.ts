import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

const NOMBRE_EJE: Record<string, string> = {
  CF: "Conciencia Fonologica",
  CT: "Comprension de Textos",
  O: "Oralidad",
}

const DESCRIPCION_EJE: Record<string, string> = {
  CF: "capacidad para identificar y manipular sonidos del lenguaje",
  CT: "comprension de textos leidos en voz alta y vocabulario",
  O: "expresion oral, narracion y comunicacion en oracion completa",
}

function nivelLogro(promedio: number): "Muy bien" | "En proceso" | "Necesita refuerzo" | null {
  if (promedio >= 70) return "Muy bien"
  if (promedio >= 40) return "En proceso"
  if (promedio > 0) return "Necesita refuerzo"
  return null
}

function mensajeNivel(eje: string, promedio: number, totalActividades: number): string {
  const nombre = NOMBRE_EJE[eje] || eje
  const desc = DESCRIPCION_EJE[eje] || ""

  if (promedio >= 70) {
    return `Tu hijo/a muestra muy buen avance en ${nombre} (${desc}). En las ${totalActividades} actividades trabajadas, logro los objetivos propuestos en la mayoria de las oportunidades. Sigue adelante con entusiasmo.`
  }
  if (promedio >= 40) {
    return `Tu hijo/a esta avanzando en ${nombre} (${desc}). En las ${totalActividades} actividades realizadas, muestra progreso sostenido. Con continuidad y estimulacion en casa, seguira mejorando.`
  }
  return `Tu hijo/a esta trabajando en ${nombre} (${desc}). En las ${totalActividades} actividades realizadas, necesita mas practica para consolidar los aprendizajes. Te recomendamos conversar con la docente para recibir orientaciones.`
}

function sugerenciaParaCasa(eje: string, promedio: number): string {
  if (eje === "CF") {
    if (promedio >= 70) return "Pueden jugar a rimar palabras, contar silabas con palmadas o buscar palabras que empiecen con el mismo sonido."
    return "Te sugerimos jugar a contar silabas en las palabras del dia a dia (por ejemplo: ma-mi-ta, za-pa-to) o buscar objetos de la casa que empiecen con un sonido."
  }
  if (eje === "CT") {
    if (promedio >= 70) return "Continua leyendole en voz alta cada dia. Puedan hacerse preguntas sobre el cuento antes, durante y despues de leerlo."
    return "Te sugerimos leer un cuento corto cada noche y hacer preguntas simples: de que crees que trata? quien aparece en la historia? que paso al final?"
  }
  if (eje === "O") {
    if (promedio >= 70) return "Pide a tu hijo/a que cuente su dia usando las palabras primero, luego y al final."
    return "Te sugerimos pedirle a tu hijo/a que te cuente lo que hizo en el jardin usando oraciones completas. Si responde con una sola palabra, modela vos la oracion completa y pedile que la repita."
  }
  return ""
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const alumnoId = searchParams.get("alumnoId")
  const sala = searchParams.get("sala")

  const supabase = getSupabase()

  try {
    // Si no se pasa sala ni alumnoId no se puede generar reporte
    if (!alumnoId && !sala) {
      return NextResponse.json({
        ok: true,
        sinDatos: true,
        mensaje: "No se especifico sala ni alumno. El reporte requiere al menos uno de los dos parametros.",
        ejes: [],
      })
    }

    let query = supabase
      .from("seguimiento")
      .select("*")
      .order("fecha", { ascending: true })

    if (alumnoId) {
      query = query.eq("alumno_id", alumnoId)
    } else if (sala) {
      // Filtra por el nombre de sala guardado en el campo "sala"
      query = query.eq("sala", sala)
    }

    const { data: evaluaciones, error } = await query

    if (error) {
      console.error("[v0] Error fetching evaluaciones para reporte:", error)
    }

    const registros = evaluaciones || []

    // Agrupar por eje - SOLO ejes con actividades realmente registradas
    const porEje: Record<string, { resultados: string[]; actividades: string[]; fechas: string[] }> = {}

    for (const r of registros) {
      const eje = r.eje as string
      if (!eje) continue
      if (!porEje[eje]) {
        porEje[eje] = { resultados: [], actividades: [], fechas: [] }
      }
      porEje[eje].resultados.push(r.estado || r.resultado || "red")
      if (r.actividad && !porEje[eje].actividades.includes(r.actividad)) {
        porEje[eje].actividades.push(r.actividad)
      }
      if (r.fecha) {
        porEje[eje].fechas.push(r.fecha)
      }
    }

    // Solo los ejes que tienen evaluaciones reales
    const ejesConDatos = Object.keys(porEje).filter(eje => porEje[eje].resultados.length > 0)

    if (ejesConDatos.length === 0) {
      return NextResponse.json({
        ok: true,
        sinDatos: true,
        mensaje: "Todavia no hay actividades registradas. El reporte se generara automaticamente cuando la docente evalúe actividades en el aula.",
        ejes: [],
      })
    }

    const ejesReporte = ejesConDatos.map(eje => {
      const datos = porEje[eje]
      const total = datos.resultados.length
      const verdes   = datos.resultados.filter(r => r === "green"  || r === "logrado").length
      const amarillos = datos.resultados.filter(r => r === "yellow" || r === "proceso").length
      const rojos    = datos.resultados.filter(r => r === "red"    || r === "refuerzo").length

      const promedio = Math.round(((verdes * 100) + (amarillos * 50) + (rojos * 10)) / total)

      const nivel = nivelLogro(promedio)
      const fechaInicio = datos.fechas.length > 0
        ? new Date(datos.fechas[0]).toLocaleDateString("es-AR", { day: "2-digit", month: "long" })
        : null
      const fechaUltima = datos.fechas.length > 0
        ? new Date(datos.fechas[datos.fechas.length - 1]).toLocaleDateString("es-AR", { day: "2-digit", month: "long" })
        : null

      return {
        eje,
        nombre: NOMBRE_EJE[eje] || eje,
        promedio,
        nivel,
        totalActividades: total,
        actividadesUnicas: datos.actividades.length,
        verdes,
        amarillos,
        rojos,
        fechaInicio,
        fechaUltima,
        mensaje: mensajeNivel(eje, promedio, total),
        sugerenciaCasa: sugerenciaParaCasa(eje, promedio),
      }
    })

    // Ordenar: primero el eje mas fuerte
    ejesReporte.sort((a, b) => b.promedio - a.promedio)

    return NextResponse.json({
      ok: true,
      sinDatos: false,
      totalRegistros: registros.length,
      ejesConDatos: ejesConDatos.length,
      ejes: ejesReporte,
    })
  } catch (err) {
    console.error("[v0] Error en reporte-padres:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
