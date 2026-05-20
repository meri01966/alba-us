import { NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala") || "Manzanos"

  try {
    const supabase = getServerClient()

    const { data: alumnos } = await supabase
      .from("alumnos")
      .select("id, nombre")
      .eq("sala", sala)

    if (!alumnos || alumnos.length === 0) {
      return NextResponse.json({
        sugerencia: { eje: "CF", actividad: "Reconocimiento de Sonido Inicial /M/", razon: "Sin datos. Empezamos con conciencia fonologica." },
        alertas: [],
        historial: { promediosPorEje: { CF: 0, CT: 0, O: 0 } },
        progreso: { totalClasesCompletadas: 0, semanaActual: 1, clasesCompletadasPorEje: { CF: 0, CT: 0, O: 0 } },
      })
    }

    const ids = alumnos.map((a) => a.id)
    const { data: registros } = await supabase
      .from("seguimiento")
      .select("*")
      .in("alumno_id", ids)
      .order("fecha", { ascending: true })

    const regs = registros || []
    const ejes = ["CF", "CT", "O"]
    const analisis: any = {}

    for (const eje of ejes) {
      const regsEje = regs.filter((r) => r.eje === eje)
      const verdes = regsEje.filter((r) => r.resultado === "green").length
      const amarillos = regsEje.filter((r) => r.resultado === "yellow").length
      const rojos = regsEje.filter((r) => r.resultado === "red").length
      const total = regsEje.length
      const promedio = total > 0 ? Math.round((verdes * 100 + amarillos * 50 + rojos * 10) / total) : 0

      const alumnosEnRojo: string[] = []
      for (const al of alumnos) {
        const ultReg = regsEje.filter((r) => r.alumno_id === al.id).pop()
        if (ultReg && ultReg.resultado === "red") alumnosEnRojo.push(al.nombre)
      }

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

      const ahora = new Date()
      const hace7 = new Date(ahora.getTime() - 7 * 86400000)
      const hace14 = new Date(ahora.getTime() - 14 * 86400000)
      const semActual = regsEje.filter((r) => new Date(r.fecha) >= hace7)
      const semAnterior = regsEje.filter((r) => new Date(r.fecha) >= hace14 && new Date(r.fecha) < hace7)
      const promSA = semActual.length > 0 ? semActual.filter((r) => r.resultado === "green").length / semActual.length : 0
      const promSB = semAnterior.length > 0 ? semAnterior.filter((r) => r.resultado === "green").length / semAnterior.length : 0
      let tendencia = "estancado"
      if (promSA > promSB + 0.1) tendencia = "mejorando"
      if (promSA < promSB - 0.1) tendencia = "empeorando"

      analisis[eje] = { total, verdes, amarillos, rojos, promedio, alumnosEnRojo, actividadesExitosas, tendencia }
    }

    let ejeSugerido = "CF"
    let peorScore = 999
    for (const eje of ejes) {
      const a = analisis[eje]
      const score = a.promedio - (a.alumnosEnRojo.length * 10) - (a.tendencia === "empeorando" ? 20 : 0)
      if (score < peorScore) { peorScore = score; ejeSugerido = eje }
    }

    const mejorAct = analisis[ejeSugerido].actividadesExitosas[0]
    const razon = analisis[ejeSugerido].alumnosEnRojo.length > 0
      ? `${analisis[ejeSugerido].alumnosEnRojo.length} alumno(s) necesitan refuerzo.`
      : `Eje con menor avance (${analisis[ejeSugerido].promedio}%).`
    const razonExtra = mejorAct ? ` "${mejorAct.actividad}" tuvo ${mejorAct.tasa}% de exito.` : ""

    const alertas: any[] = []
    for (const eje of ejes) {
      const a = analisis[eje]
      const nombre = eje === "CF" ? "Conciencia Fonologica" : eje === "CT" ? "Comprension de Textos" : "Oralidad"
      if (a.alumnosEnRojo.length >= alumnos.length * 0.3) {
        alertas.push({ tipo: "patron_grupal", mensaje: `${a.alumnosEnRojo.length} de ${alumnos.length} en rojo en ${nombre}. Revisar estrategia.`, urgencia: "alta" })
      }
      for (const al of alumnos) {
        const regsAl = regs.filter((r) => r.alumno_id === al.id && r.eje === eje).slice(-3)
        if (regsAl.length >= 3 && regsAl.every((r) => r.resultado === "red")) {
          alertas.push({ tipo: "persistencia", mensaje: `${al.nombre} lleva 3+ registros en rojo en ${nombre}.`, urgencia: "alta" })
        }
      }
    }

    const totalClases = new Set(regs.map((r) => r.fecha?.split("T")[0])).size
    const primerReg = regs.length > 0 ? new Date(regs[0].fecha) : new Date()
    const semanaActual = Math.max(1, Math.ceil((Date.now() - primerReg.getTime()) / (7 * 86400000)))

    return NextResponse.json({
      sugerencia: { eje: ejeSugerido, actividad: mejorAct?.actividad || "Actividad exploratoria", razon: razon + razonExtra, alumnosEnRiesgo: analisis[ejeSugerido].alumnosEnRojo.length, totalAlumnos: alumnos.length },
      alertas: alertas.slice(0, 8),
      historial: { promediosPorEje: { CF: analisis.CF.promedio, CT: analisis.CT.promedio, O: analisis.O.promedio }, actividadesExitosas: { CF: analisis.CF.actividadesExitosas, CT: analisis.CT.actividadesExitosas, O: analisis.O.actividadesExitosas } },
      progreso: { totalClasesCompletadas: totalClases, semanaActual, clasesCompletadasPorEje: { CF: analisis.CF.total, CT: analisis.CT.total, O: analisis.O.total } },
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
