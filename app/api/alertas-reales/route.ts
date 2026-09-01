import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// API que genera alertas SOLO basadas en datos reales de seguimiento
// No hace inferencias ni estimaciones - solo lee lo que la maestra registro

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ehwlulqcwimatxmnajra.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_q-qtEDnI0QxcrTt3pQIh8w_vbmnQZS1"
)

interface Alerta {
  tipo: "rojo_consecutivo" | "rojo_acumulado" | "mayoria_rojo" | "amarillo_sostenido" | "sin_evaluaciones"
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
    amarillos?: number
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

    const EJE_NOMBRE: Record<string, string> = {
      CF: "Conciencia Fonologica",
      CT: "Comprension de Textos",
      O: "Oralidad",
      EA: "Escritura",
    }

    // Agrupar por alumno
    const porAlumno: Record<string, { eje: string, estado: string, fecha: string }[]> = {}
    for (const s of seguimiento || []) {
      if (!porAlumno[s.alumno_id]) porAlumno[s.alumno_id] = []
      porAlumno[s.alumno_id].push({ eje: s.eje, estado: s.estado, fecha: s.fecha })
    }

    const esRojo = (e: string) => e === "red" || e === "refuerzo"
    const esAmarillo = (e: string) => e === "yellow" || e === "proceso"
    const esVerde = (e: string) => e === "green" || e === "logrado"

    // Analizar cada alumno
    for (const alumnoId of alumnosIds) {
      const registros = porAlumno[alumnoId] || []
      const nombre = alumnosMap[alumnoId] || "Alumno"

      // Si no tiene evaluaciones, no hay alerta (puede ser nuevo)
      if (registros.length === 0) continue

      const totalRojos = registros.filter(r => esRojo(r.estado)).length
      const porcentajeRojo = Math.round((totalRojos / registros.length) * 100)

      // Rojos consecutivos recientes (las ultimas 3 evaluaciones, en cualquier eje)
      const ultimas3 = registros.slice(-3)
      const rojosConsecutivos = ultimas3.filter(r => esRojo(r.estado)).length

      // Analisis POR EJE: para detectar rojos acumulados y amarillos sostenidos
      const porEje: Record<string, string[]> = {}
      for (const r of registros) {
        if (!porEje[r.eje]) porEje[r.eje] = []
        porEje[r.eje].push(r.estado)
      }

      // Encontrar el eje con mas rojos acumulados y el eje con mas amarillos sin avanzar
      let ejeMasRojos = ""; let maxRojosEje = 0
      let ejeMasAmarillos = ""; let maxAmarillosEje = 0
      for (const [eje, estados] of Object.entries(porEje)) {
        const rojosEje = estados.filter(esRojo).length
        if (rojosEje > maxRojosEje) { maxRojosEje = rojosEje; ejeMasRojos = eje }
        // Amarillos sostenidos: cuenta amarillos solo si el alumno NO logro verde despues
        const amarillosEje = estados.filter(esAmarillo).length
        const tieneVerde = estados.some(esVerde)
        if (amarillosEje > maxAmarillosEje && !tieneVerde) { maxAmarillosEje = amarillosEje; ejeMasAmarillos = eje }
      }

      // --- PRIORIDAD DE ALERTAS (una por alumno, la mas urgente) ---

      // ALERTA ALTA: 3 rojos consecutivos recientes
      if (rojosConsecutivos >= 3) {
        alertas.push({
          tipo: "rojo_consecutivo", urgencia: "alta",
          mensaje: `${nombre} tiene ${rojosConsecutivos} evaluaciones en rojo seguidas. Necesita apoyo prioritario.`,
          alumnoId, alumnoNombre: nombre,
          datos: { totalEvaluaciones: registros.length, rojosConsecutivos, totalRojos, porcentajeRojo }
        })
      }
      // ALERTA ALTA: 3+ rojos acumulados en un mismo eje (aunque no sean seguidos)
      else if (maxRojosEje >= 3) {
        alertas.push({
          tipo: "rojo_acumulado", urgencia: "alta",
          mensaje: `${nombre} acumula ${maxRojosEje} evaluaciones en rojo en ${EJE_NOMBRE[ejeMasRojos] || ejeMasRojos}. Conviene reforzar ese eje.`,
          alumnoId, alumnoNombre: nombre, eje: ejeMasRojos,
          datos: { totalEvaluaciones: registros.length, totalRojos, porcentajeRojo }
        })
      }
      // ALERTA MEDIA: 2 rojos consecutivos recientes
      else if (rojosConsecutivos === 2) {
        alertas.push({
          tipo: "rojo_consecutivo", urgencia: "media",
          mensaje: `${nombre} tiene 2 evaluaciones en rojo seguidas. Conviene seguir de cerca.`,
          alumnoId, alumnoNombre: nombre,
          datos: { totalEvaluaciones: registros.length, rojosConsecutivos, totalRojos, porcentajeRojo }
        })
      }
      // ALERTA MEDIA: mayoria de evaluaciones en rojo
      else if (registros.length >= 4 && porcentajeRojo > 50) {
        alertas.push({
          tipo: "mayoria_rojo", urgencia: "media",
          mensaje: `${nombre} tiene ${porcentajeRojo}% de evaluaciones en rojo (${totalRojos} de ${registros.length}).`,
          alumnoId, alumnoNombre: nombre,
          datos: { totalEvaluaciones: registros.length, totalRojos, porcentajeRojo }
        })
      }
      // ALERTA MEDIA: 2+ rojos acumulados en un eje
      else if (maxRojosEje >= 2) {
        alertas.push({
          tipo: "rojo_acumulado", urgencia: "media",
          mensaje: `${nombre} tiene ${maxRojosEje} rojos en ${EJE_NOMBRE[ejeMasRojos] || ejeMasRojos}. Conviene reforzar.`,
          alumnoId, alumnoNombre: nombre, eje: ejeMasRojos,
          datos: { totalEvaluaciones: registros.length, totalRojos, porcentajeRojo }
        })
      }
      // ALERTA BAJA: amarillo sostenido (3+ amarillos en un eje sin llegar a verde)
      else if (maxAmarillosEje >= 3) {
        alertas.push({
          tipo: "amarillo_sostenido", urgencia: "baja",
          mensaje: `${nombre} sigue en amarillo en ${EJE_NOMBRE[ejeMasAmarillos] || ejeMasAmarillos} (${maxAmarillosEje} veces en proceso sin consolidar). Conviene darle un empujon.`,
          alumnoId, alumnoNombre: nombre, eje: ejeMasAmarillos,
          datos: { totalEvaluaciones: registros.length, totalRojos, porcentajeRojo, amarillos: maxAmarillosEje }
        })
      }
    }

    // Ordenar: alta > media > baja
    const pesoUrg: Record<string, number> = { alta: 0, media: 1, baja: 2 }
    alertas.sort((a, b) => (pesoUrg[a.urgencia] ?? 9) - (pesoUrg[b.urgencia] ?? 9))

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
