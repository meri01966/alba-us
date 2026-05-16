import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala") || "Manzanos"

  try {
    // 1. Cargar alumnos de la sala
    const { data: alumnos } = await supabase
      .from("alumnos")
      .select("id, nombre")
      .eq("sala", sala)

    if (!alumnos || alumnos.length === 0) {
      return NextResponse.json({
        sugerencia: { eje: "CF", actividad: "Reconocimiento de Sonido Inicial /M/", razon: "Sin datos todavía. Empezamos con conciencia fonológica." },
        alertas: [],
        historial: { promediosPorEje: { CF: 0, CT: 0, O: 0 } },
        progreso: { totalClasesCompletadas: 0, semanaActual: 1, clasesCompletadasPorEje: { CF: 0, CT: 0, O: 0 } },
      })
    }

    const ids = alumnos.map((a) => a.id)

    // 2. Cargar TODA la evidencia acumulada
    const { data: registros } = await supabase
      .from("seguimiento")
      .select("*")
      .in("alumno_id", ids)
      .order("fecha", { ascending: true })

    const regs = registros || []

    // 3. ANALIZAR PATRONES POR EJE
    const ejes = ["CF", "CT", "O"] as const
    const analisis: Record<string, {
      total: number
      verdes: number
      amarillos: number
      rojos: number
      promedio: number
      alumnosEnRojo: string[]
      actividadesExitosas: { actividad: string; tasa: number }[]
      tendencia: "mejorando" | "estancado" | "empeorando"
    }> = {} as any

    for (const eje of ejes) {
      const regsEje = regs.filter((r) => r.eje === eje)
      const verdes = regsEje.filter((r) => r.resultado === "green").length
      const amarillos = regsEje.filter((r) => r.resultado === "yellow").length
      const rojos = regsEje.filter((r) => r.resultado === "red").length
      const total = regsEje.length
      const promedio = total > 0 ? Math.round(((verdes * 100 + amarillos * 50 + rojos * 10) / total)) : 0

      // Alumnos actualmente en rojo (ultimo registro)
      const alumnosEnRojo: string[] = []
      for (const al of alumnos) {
        const ultReg = regsEje.filter((r) => r.alumno_id === al.id).pop()
        if (ultReg && ultReg.resultado === "red") {
          alumnosEnRojo.push(al.nombre)
        }
      }

      // Actividades que mas veces dieron verde (ALBA APRENDE)
      const actMap: Record<string, { total: number; verdes: number }> = {}
      for (const r of regsEje) {
        if (!r.actividad) continue
        if (!actMap[r.actividad]) actMap[r.actividad] = { total: 0, verdes: 0 }
        actMap[r.actividad].total++
        if (r.resultado === "green") actMap[r.actividad].verdes++
      }
      const actividadesExitosas = Object.entries(actMap)
        .map(([actividad, d]) => ({ actividad, tasa: d.total > 2 ? Math.round((d.verdes / d.total) * 100) : 0 }))
        .filter((a) => a.tasa > 0)
        .sort((a, b) => b.tasa - a.tasa)
        .slice(0, 5)

      // Tendencia: comparar ultima semana vs anterior
      const ahora = new Date()
      const hace7 = new Date(ahora.getTime() - 7 * 86400000)
      const hace14 = new Date(ahora.getTime() - 14 * 86400000)
      const semActual = regsEje.filter((r) => new Date(r.fecha) >= hace7)
      const semAnterior = regsEje.filter((r) => new Date(r.fecha) >= hace14 && new Date(r.fecha) < hace7)
      const promSemActual = semActual.length > 0 ? semActual.filter((r) => r.resultado === "green").length / semActual.length : 0
      const promSemAnterior = semAnterior.length > 0 ? semAnterior.filter((r) => r.resultado === "green").length / semAnterior.length : 0
      let tendencia: "mejorando" | "estancado" | "empeorando" = "estancado"
      if (promSemActual > promSemAnterior + 0.1) tendencia = "mejorando"
      if (promSemActual < promSemAnterior - 0.1) tendencia = "empeorando"

      analisis[eje] = { total, verdes, amarillos, rojos, promedio, alumnosEnRojo, actividadesExitosas, tendencia }
    }

    // 4. DECIDIR SUGERENCIA INTELIGENTE
    // Priorizar eje con mas alumnos en rojo + peor tendencia
    let ejeSugerido = "CF"
    let peorScore = 999
    for (const eje of ejes) {
      const a = analisis[eje]
      const score = a.promedio - (a.alumnosEnRojo.length * 10) - (a.tendencia === "empeorando" ? 20 : 0)
      if (score < peorScore) {
        peorScore = score
        ejeSugerido = eje
      }
    }

    // Buscar actividad que mejor funciono en ese eje (ALBA APRENDE DE LA EXPERIENCIA)
    const mejorActividad = analisis[ejeSugerido].actividadesExitosas[0]
    const razonBase = analisis[ejeSugerido].alumnosEnRojo.length > 0
      ? `${analisis[ejeSugerido].alumnosEnRojo.length} alumno${analisis[ejeSugerido].alumnosEnRojo.length > 1 ? "s" : ""} necesita${analisis[ejeSugerido].alumnosEnRojo.length > 1 ? "n" : ""} refuerzo en ${ejeSugerido === "CF" ? "conciencia fonológica" : ejeSugerido === "CT" ? "comprensión de textos" : "oralidad"}.`
      : `Es el eje con menor avance (${analisis[ejeSugerido].promedio}%).`

    const razonAprendida = mejorActividad
      ? ` La actividad "${mejorActividad.actividad}" tuvo ${mejorActividad.tasa}% de éxito en esta sala.`
      : ""

    // 5. ALERTAS BASADAS EN EVIDENCIA
    const alertas: { tipo: string; mensaje: string; urgencia: "alta" | "media" | "info" }[] = []

    for (const eje of ejes) {
      const a = analisis[eje]
      const ejeNombre = eje === "CF" ? "Conciencia Fonológica" : eje === "CT" ? "Comprensión de Textos" : "Oralidad"

      // Patron grupal: 30%+ en rojo
      if (a.alumnosEnRojo.length >= alumnos.length * 0.3) {
        alertas.push({
          tipo: "patron_grupal",
          mensaje: `${a.alumnosEnRojo.length} de ${alumnos.length} alumnos en rojo en ${ejeNombre}. Revisar estrategia grupal.`,
          urgencia: "alta",
        })
      }

      // Persistencia: alumnos en rojo 3+ registros seguidos
      for (const al of alumnos) {
        const regsAl = regs.filter((r) => r.alumno_id === al.id && r.eje === eje).slice(-3)
        if (regsAl.length >= 3 && regsAl.every((r) => r.resultado === "red")) {
          alertas.push({
            tipo: "persistencia",
            mensaje: `${al.nombre} lleva 3+ registros en rojo en ${ejeNombre}. Considerar intervención diferenciada.`,
            urgencia: "alta",
          })
        }
      }

      // Regresion: paso de verde/amarillo a rojo
      for (const al of alumnos) {
        const regsAl = regs.filter((r) => r.alumno_id === al.id && r.eje === eje).slice(-2)
        if (regsAl.length === 2 && regsAl[0].resultado !== "red" && regsAl[1].resultado === "red") {
          alertas.push({
            tipo: "regresion",
            mensaje: `${al.nombre} retrocedió en ${ejeNombre}. Algo cambió.`,
            urgencia: "media",
          })
        }
      }

      // Mejora extraordinaria: rojo a verde
      for (const al of alumnos) {
        const regsAl = regs.filter((r) => r.alumno_id === al.id && r.eje === eje).slice(-2)
        if (regsAl.length === 2 && regsAl[0].resultado === "red" && regsAl[1].resultado === "green") {
          alertas.push({
            tipo: "mejora",
            mensaje: `🌟 ${al.nombre} pasó de rojo a verde en ${ejeNombre}. Documentar qué funcionó.`,
            urgencia: "info",
          })
        }
      }

      // Tendencia negativa del eje
      if (a.tendencia === "empeorando") {
        alertas.push({
          tipo: "tendencia",
          mensaje: `${ejeNombre} muestra tendencia negativa esta semana.`,
          urgencia: "media",
        })
      }
    }

    // 6. CALCULAR PROGRESO GENERAL
    const totalClases = new Set(regs.map((r) => r.fecha?.split("T")[0])).size
    const primerRegistro = regs.length > 0 ? new Date(regs[0].fecha) : new Date()
    const semanaActual = Math.max(1, Math.ceil((Date.now() - primerRegistro.getTime()) / (7 * 86400000)))

    return NextResponse.json({
      sugerencia: {
        eje: ejeSugerido,
        actividad: mejorActividad?.actividad || "Actividad exploratoria",
        razon: razonBase + razonAprendida,
        alumnosEnRiesgo: analisis[ejeSugerido].alumnosEnRojo.length,
        totalAlumnos: alumnos.length,
        tendencia: analisis[ejeSugerido].tendencia,
        aprendidoDeLaRed: !!mejorActividad,
      },
      alertas: alertas.slice(0, 8),
      historial: {
        promediosPorEje: {
          CF: analisis.CF.promedio,
          CT: analisis.CT.promedio,
          O: analisis.O.promedio,
        },
        tendencias: {
          CF: analisis.CF.tendencia,
          CT: analisis.CT.tendencia,
          O: analisis.O.tendencia,
        },
        actividadesExitosas: {
          CF: analisis.CF.actividadesExitosas,
          CT: analisis.CT.actividadesExitosas,
          O: analisis.O.actividadesExitosas,
        },
      },
      progreso: {
        totalClasesCompletadas: totalClases,
        semanaActual,
        clasesCompletadasPorEje: {
          CF: analisis.CF.total,
          CT: analisis.CT.total,
          O: analisis.O.total,
        },
      },
    })
  } catch (err) {
    console.error("Error en /api/brain:", err)
    return NextResponse.json({
      sugerencia: { eje: "CF", actividad: "Reconocimiento de Sonido Inicial /M/", razon: "Error cargando datos." },
      alertas: [],
      historial: { promediosPorEje: { CF: 0, CT: 0, O: 0 } },
      progreso: { totalClasesCompletadas: 0, semanaActual: 1, clasesCompletadasPorEje: { CF: 0, CT: 0, O: 0 } },
    })
  }
}
