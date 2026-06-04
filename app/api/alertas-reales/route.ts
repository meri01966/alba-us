import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// API que genera alertas SOLO basadas en datos reales de seguimiento
// No hace inferencias ni estimaciones - solo lee lo que la maestra registro

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oairchbitlanpzywncua.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"
)

interface Alerta {
  tipo: "rojo_consecutivo" | "mayoria_rojo" | "sin_evaluaciones"
  urgencia: "alta" | "media" | "baja"
  mensaje: string
  alumnoId?: string
  alumnoNombre?: string
  eje?: string
  datos: {
    totalEvaluaciones?: number
    rojosConsecutivos?: number
    totalRojos?: number
    porcentajeRojo?: number
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sala = searchParams.get("sala")

  if (!sala) {
    return NextResponse.json({ error: "Falta parametro sala" }, { status: 400 })
  }

  try {
    // Obtener alumnos de la sala
    const { data: alumnos, error: errAlumnos } = await supabase
      .from("alumnos")
      .select("id, nombre")
      .eq("sala", sala)

    if (errAlumnos || !alumnos || alumnos.length === 0) {
      return NextResponse.json({ ok: true, alertas: [], mensaje: "Sin alumnos en esta sala" })
    }

    const alumnosIds = alumnos.map(a => a.id)
    const alumnosMap = Object.fromEntries(alumnos.map(a => [a.id, a.nombre]))

    // Obtener seguimiento ordenado por fecha
    const { data: seguimiento, error: errSeg } = await supabase
      .from("seguimiento")
      .select("alumno_id, eje, estado, fecha")
      .in("alumno_id", alumnosIds)
      .order("fecha", { ascending: true })

    if (errSeg) {
      console.error("[alertas-reales] Error seguimiento:", errSeg)
      return NextResponse.json({ error: errSeg.message }, { status: 500 })
    }

    const alertas: Alerta[] = []

    // Agrupar por alumno
    const porAlumno: Record<string, { eje: string, estado: string, fecha: string }[]> = {}
    for (const s of seguimiento || []) {
      if (!porAlumno[s.alumno_id]) porAlumno[s.alumno_id] = []
      porAlumno[s.alumno_id].push({ eje: s.eje, estado: s.estado, fecha: s.fecha })
    }

    // Analizar cada alumno
    for (const alumnoId of alumnosIds) {
      const registros = porAlumno[alumnoId] || []
      const nombre = alumnosMap[alumnoId] || "Alumno"

      // Si no tiene evaluaciones, no hay alerta (puede ser nuevo)
      if (registros.length === 0) continue

      // Contar rojos totales
      const totalRojos = registros.filter(r => r.estado === "red" || r.estado === "refuerzo").length
      const porcentajeRojo = Math.round((totalRojos / registros.length) * 100)

      // Verificar rojos consecutivos (ultimas evaluaciones)
      const ultimas = registros.slice(-5) // ultimas 5 evaluaciones
      let rojosConsecutivos = 0
      for (let i = ultimas.length - 1; i >= 0; i--) {
        if (ultimas[i].estado === "red" || ultimas[i].estado === "refuerzo") {
          rojosConsecutivos++
        } else {
          break
        }
      }

      // ALERTA ALTA: 3+ rojos consecutivos
      if (rojosConsecutivos >= 3) {
        alertas.push({
          tipo: "rojo_consecutivo",
          urgencia: "alta",
          mensaje: `${nombre} tiene ${rojosConsecutivos} evaluaciones en rojo consecutivas`,
          alumnoId,
          alumnoNombre: nombre,
          datos: {
            totalEvaluaciones: registros.length,
            rojosConsecutivos,
            totalRojos,
            porcentajeRojo
          }
        })
      }
      // ALERTA MEDIA: 2 rojos consecutivos
      else if (rojosConsecutivos === 2) {
        alertas.push({
          tipo: "rojo_consecutivo",
          urgencia: "media",
          mensaje: `${nombre} tiene 2 evaluaciones en rojo consecutivas`,
          alumnoId,
          alumnoNombre: nombre,
          datos: {
            totalEvaluaciones: registros.length,
            rojosConsecutivos,
            totalRojos,
            porcentajeRojo
          }
        })
      }
      // ALERTA MEDIA: Mayoria de evaluaciones en rojo (>50% con al menos 4 evaluaciones)
      else if (registros.length >= 4 && porcentajeRojo > 50) {
        alertas.push({
          tipo: "mayoria_rojo",
          urgencia: "media",
          mensaje: `${nombre} tiene ${porcentajeRojo}% de evaluaciones en rojo (${totalRojos} de ${registros.length})`,
          alumnoId,
          alumnoNombre: nombre,
          datos: {
            totalEvaluaciones: registros.length,
            totalRojos,
            porcentajeRojo
          }
        })
      }
    }

    // Ordenar: alta primero, luego media
    alertas.sort((a, b) => {
      if (a.urgencia === "alta" && b.urgencia !== "alta") return -1
      if (a.urgencia !== "alta" && b.urgencia === "alta") return 1
      return 0
    })

    return NextResponse.json({
      ok: true,
      sala,
      totalAlumnos: alumnos.length,
      totalAlertas: alertas.length,
      alertas
    })

  } catch (e: any) {
    console.error("[alertas-reales] Error:", e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
