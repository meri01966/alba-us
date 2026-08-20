// ALBA — Sintesis grupal por sala
// Se calcula en vivo cada vez que se abre: no hay nada precomputado ni cacheado.
// Segundo cuatrimestre solamente (desde el 3/8/2026).
// Sin porcentajes: cuenta CHICOS, que es lo que la directora necesita leer.
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"


const INICIO_CUATRIMESTRE = "2026-08-03"

const EJES = [
  { key: "CF", nombre: "Conciencia Fonologica" },
  { key: "CT", nombre: "Comprension de Textos" },
  { key: "O",  nombre: "Oralidad" },
  { key: "E",  nombre: "Escritura" },
] as const

export const dynamic = "force-dynamic"
export const revalidate = 0

// Supabase corta en 1000 filas por consulta: esto trae todo, de a mil por vez.
async function traerTodo(query: any): Promise<any[]> {
  const PAGINA = 1000
  const acumulado: any[] = []
  for (let desde = 0; desde < 50000; desde += PAGINA) {
    const { data, error } = await query.range(desde, desde + PAGINA - 1)
    if (error) {
      console.error("[v0] Error paginando:", error.message)
      break
    }
    const filas = data || []
    acumulado.push(...filas)
    if (filas.length < PAGINA) break
  }
  return acumulado
}

function normalizarEje(valor: string): "CF" | "CT" | "O" | "E" {
  const e = (valor || "").trim().toUpperCase()
  if (e === "CT") return "CT"
  if (e === "O" || e === "ORALIDAD") return "O"
  if (e === "E" || e === "EA" || e === "LE" || e === "ESCRITURA") return "E"
  return "CF"
}

function fechaAR(valor: any): string {
  if (!valor) return ""
  const s = String(valor).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const d = new Date(s)
  if (isNaN(d.getTime())) return s.slice(0, 10)
  return d.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
}

function ddmm(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "")
  return m ? `${m[3]}/${m[2]}` : ""
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sala = searchParams.get("sala")
    if (!sala) return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })


    // Actividades que quedaron sin realizar en el cuatrimestre, por eje
    const noRealizadasPorEje: Record<string, string[]> = { CF: [], CT: [], O: [], E: [] }
    const fechasNoRealizadas: Record<string, string> = {}
    try {
      const cierres = await traerTodo(
        supabase
          .from("registro_cierre")
          .select("eje, actividad_alba, evaluacion_general, fecha")
          .eq("sala", sala)
          .eq("evaluacion_general", "no_realizada")
          .gte("fecha", INICIO_CUATRIMESTRE)
      )
      const vistos = new Set<string>()
      cierres.forEach((c: any) => {
        const nom = String(c.actividad_alba || "").trim()
        if (!nom) return
        const e = normalizarEje(c.eje)
        const k = `${e}::${nom.toLowerCase()}`
        if (vistos.has(k)) return
        vistos.add(k)
        noRealizadasPorEje[e].push(nom)
        fechasNoRealizadas[k] = fechaAR(c.fecha)
      })
    } catch (e) {
      console.error("[v0] Error leyendo no realizadas:", e)
    }

    const { data: alumnos } = await supabase.from("alumnos").select("id, nombre").eq("sala", sala)
    const listaAlumnos = alumnos || []

    if (listaAlumnos.length === 0) {
      return NextResponse.json({
        ok: true, sala, sinDatos: true,
        mensaje: "Esta sala todavia no tiene alumnos cargados.",
      })
    }

    const registros = await traerTodo(
      supabase
        .from("seguimiento")
        .select("alumno_id, eje, estado, actividad, fecha, created_at")
        .in("alumno_id", listaAlumnos.map((a: any) => a.id))
        .gte("fecha", INICIO_CUATRIMESTRE)
    )

    if (registros.length === 0) {
      return NextResponse.json({
        ok: true, sala, sinDatos: true,
        totalAlumnos: listaAlumnos.length,
        mensaje: "Todavia no hay evaluaciones registradas en este cuatrimestre.",
      })
    }

    // Rango real de fechas con registro
    let desde = "9999-99-99"
    let hasta = ""
    registros.forEach((r: any) => {
      const f = fechaAR(r.fecha || r.created_at)
      if (!f) return
      if (f < desde) desde = f
      if (f > hasta) hasta = f
    })

    const nombrePorAlumno: Record<string, string> = {}
    listaAlumnos.forEach((a: any) => { nombrePorAlumno[a.id] = a.nombre })

    const ejes = EJES.map((eje) => {
      const delEje = registros.filter((r: any) => normalizarEje(r.eje) === eje.key)

      // Que trabajamos: los nombres reales de las actividades dadas
      const actividades: string[] = []
      const vistas = new Set<string>()
      delEje.forEach((r: any) => {
        if (!r.actividad) return
        const n = String(r.actividad).trim()
        const k = n.toLowerCase()
        if (!vistas.has(k)) { vistas.add(k); actividades.push(n) }
      })

      // Como esta cada chico: se toma su estado predominante en el eje,
      // ignorando las ausencias. Un chico cuenta una sola vez.
      const porAlumno: Record<string, { green: number; yellow: number; red: number }> = {}
      delEje.forEach((r: any) => {
        const est = String(r.estado || "").toLowerCase()
        if (est !== "green" && est !== "yellow" && est !== "red") return
        if (!porAlumno[r.alumno_id]) porAlumno[r.alumno_id] = { green: 0, yellow: 0, red: 0 }
        porAlumno[r.alumno_id][est as "green" | "yellow" | "red"]++
      })

      let logrado = 0, enProceso = 0, refuerzo = 0
      const necesitanApoyo: string[] = []

      Object.entries(porAlumno).forEach(([alumnoId, c]) => {
        const max = Math.max(c.green, c.yellow, c.red)
        if (c.red === max) {
          refuerzo++
          necesitanApoyo.push(nombrePorAlumno[alumnoId] || "Sin nombre")
        } else if (c.yellow === max) {
          enProceso++
        } else {
          logrado++
        }
      })

      const evaluados = logrado + enProceso + refuerzo

      // Frase de estado, en conteos y sin porcentajes
      let comoEsta = ""
      if (evaluados === 0) {
        comoEsta = "Todavia no hay evaluaciones registradas en este eje."
      } else if (refuerzo === 0 && enProceso === 0) {
        comoEsta = `Los ${logrado} chicos evaluados vienen logrando lo trabajado.`
      } else if (refuerzo === 0) {
        comoEsta = `${logrado} de ${evaluados} chicos vienen logrando lo trabajado y ${enProceso} estan en proceso.`
      } else {
        comoEsta = `${logrado} de ${evaluados} chicos vienen logrando lo trabajado, ${enProceso} estan en proceso y ${refuerzo} necesitan refuerzo.`
      }

      const sinRealizar = noRealizadasPorEje[eje.key] || []

      return {
        eje: eje.key,
        nombre: eje.nombre,
        clases: actividades.length,
        actividades,
        sinRealizar,
        cantidadSinRealizar: sinRealizar.length,
        logrado,
        enProceso,
        refuerzo,
        evaluados,
        necesitanApoyo: necesitanApoyo.sort(),
        comoEsta,
      }
    })

    // ── Linea de tiempo: todas las clases del cuatrimestre, en orden ──────
    // Una mirada y se entiende como viene: verde lo trabajado, rojo lo que
    // quedo sin realizar. Sin segmentar por eje, que se lee en cada tarjeta.
    const clasesMapa: Record<string, { nombre: string; eje: string; fecha: string; realizada: boolean }> = {}

    registros.forEach((r: any) => {
      const nom = String(r.actividad || "").trim()
      if (!nom) return
      const e = normalizarEje(r.eje)
      const f = fechaAR(r.fecha || r.created_at)
      const k = `${e}::${nom.toLowerCase()}`
      if (!clasesMapa[k] || f < clasesMapa[k].fecha) {
        clasesMapa[k] = { nombre: nom, eje: e, fecha: f, realizada: true }
      }
    })

    Object.entries(noRealizadasPorEje).forEach(([e, nombres]) => {
      nombres.forEach((nom: string) => {
        const k = `${e}::${nom.toLowerCase()}`
        if (clasesMapa[k]) return   // si tambien se evaluo, gana la evidencia
        clasesMapa[k] = { nombre: nom, eje: e, fecha: fechasNoRealizadas[k] || "", realizada: false }
      })
    })

    const clases = Object.values(clasesMapa)
      .sort((a, b) => (a.fecha || "").localeCompare(b.fecha || ""))
      .map((c) => ({ ...c, fechaCorta: ddmm(c.fecha) }))

    const totalRealizadas = clases.filter((c) => c.realizada).length
    const totalSinRealizar = clases.length - totalRealizadas

    const todasActividades = new Set<string>()
    registros.forEach((r: any) => {
      if (r.actividad) todasActividades.add(String(r.actividad).trim().toLowerCase())
    })

    return NextResponse.json({
      ok: true,
      sala,
      sinDatos: false,
      periodo: "Segundo cuatrimestre",
      totalAlumnos: listaAlumnos.length,
      totalClases: todasActividades.size,
      clases,
      totalRealizadas,
      totalSinRealizar,
      periodoDesde: ddmm(desde === "9999-99-99" ? "" : desde),
      periodoHasta: ddmm(hasta),
      ejes,
    })
  } catch (e) {
    console.error("[v0] Error en sintesis-grupal:", e)
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
  }
}
