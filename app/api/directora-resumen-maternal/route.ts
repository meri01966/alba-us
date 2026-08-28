import { NextResponse } from "next/server"
// La misma conexion que el resto del proyecto.
import { supabase } from "@/lib/supabase"

// ── RESUMEN DE MATERNAL PARA DIRECCION ────────────────────────────────────
// Archivo SEPARADO del de jardin a proposito. Maternal se sigue por las cinco
// CAPACIDADES del Diseno y por AREAS DE EXPERIENCIA; jardin por los ejes de
// alfabetizacion. Mezclarlos en un solo endpoint obligaria a condicionales por
// todos lados y cada arreglo de maternal pondria en riesgo a jardin.

const SALAS_MATERNAL = ["PINITOS TM", "PINITOS TT", "NARANJOS TM", "NARANJOS TT", "PRUEBA MATERNAL"]

const CAPACIDADES = [
  { key: "COM", nombre: "Comunicacion" },
  { key: "AUT", nombre: "Autonomia para aprender" },
  { key: "RES", nombre: "Resolucion de problemas" },
  { key: "COL", nombre: "Compromiso y colaboracion" },
  { key: "REF", nombre: "Pensamiento reflexivo y critico" },
]

// Las areas del Diseno segun la edad. El eje de la actividad dice a que area
// pertenece: asi la directora ve si la sala recorre todo el Diseno o se quedo
// en lenguaje.
const AREA_DEL_EJE: Record<string, string> = {
  // Sala de 2 — DC de Jardin Maternal
  USO: "Comunicacion y expresion", ORA: "Comunicacion y expresion",
  VOC: "Comunicacion y expresion", ESC: "Comunicacion y expresion",
  JUE: "Juego", COR: "Desarrollo corporal",
  AMB: "Exploracion del ambiente", PER: "Desarrollo personal y social",
  // Sala de 3 — DC de Sala de 3
  COMP: "Lengua", PROD: "Lengua", PREC: "Lengua",
  MAT: "Matematica", IND: "Indagacion del ambiente",
  EFI: "Educacion Fisica", EXP: "Lenguajes expresivos",
}

const AREAS_SALA2 = ["Comunicacion y expresion", "Juego", "Desarrollo corporal", "Exploracion del ambiente", "Desarrollo personal y social"]
const AREAS_SALA3 = ["Lengua", "Matematica", "Indagacion del ambiente", "Educacion Fisica", "Lenguajes expresivos"]

const esSalaDe3 = (sala: string) => sala.toUpperCase().includes("NARANJOS")

const DIAS_SIN_EVALUAR_ALERTA = 15

function hoyAR(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
}

function lunesDeEstaSemana(): string {
  const ahora = new Date()
  const ba = new Date(ahora.getTime() + ahora.getTimezoneOffset() * 60000 - 3 * 60 * 60 * 1000)
  const dia = ba.getDay()
  const diff = ba.getDate() - dia + (dia === 0 ? -6 : 1)
  const lunes = new Date(ba)
  lunes.setDate(diff)
  lunes.setHours(0, 0, 0, 0)
  return lunes.toISOString().split("T")[0]
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const semana = lunesDeEstaSemana()
    const hoy = hoyAR()

    const [alumnosRes, registrosRes, cronoRes, proyectosRes] = await Promise.all([
      supabase.from("alumnos").select("id, nombre, sala").in("sala", SALAS_MATERNAL),
      supabase.from("registro_maternal").select("*").in("sala", SALAS_MATERNAL),
      // La columna se llama "finalizado" en maternal, no "dia_finalizado" como en
      // jardin. Pedir una columna que no existe hace fallar la consulta ENTERA.
      supabase.from("cronograma_maternal").select("sala, dia, fecha, actividades, finalizado, semana_inicio").in("sala", SALAS_MATERNAL),
      supabase.from("proyectos_maternal").select("sala, titulo, estado, duracion, objetivo_general, created_at").in("sala", SALAS_MATERNAL),
    ])

    // Si una consulta falla, se registra: antes devolvia vacio en silencio y
    // la directora veia "todavia no hay semanas cargadas" con datos en la base.
    ;[["alumnos", alumnosRes], ["registros", registrosRes], ["cronograma", cronoRes], ["proyectos", proyectosRes]]
      .forEach(([nombre, res]: any) => {
        if (res?.error) console.error(`[v0] directora-resumen-maternal, ${nombre}:`, res.error.message)
      })

    const alumnos = alumnosRes.data || []
    const registros = registrosRes.data || []
    const crono = cronoRes.data || []
    const proyectos = proyectosRes.data || []

    const salas = SALAS_MATERNAL.map((sala) => {
      const alumnosSala = alumnos.filter((a: any) => a.sala === sala)
      const regsSala = registros.filter((r: any) => r.sala === sala)
      const cronoSala = crono.filter((c: any) => c.sala === sala)
      const cronoSemana = cronoSala.filter((c: any) => c.semana_inicio === semana)

      // ── 1. Ultima evaluacion y dias sin evaluar ───────────────────────
      let ultimaFecha = ""
      regsSala.forEach((r: any) => {
        const f = String(r.fecha || r.created_at || "").slice(0, 10)
        if (f && f > ultimaFecha) ultimaFecha = f
      })
      const diasSinEvaluar = ultimaFecha
        ? Math.floor((new Date(hoy).getTime() - new Date(ultimaFecha).getTime()) / 86400000)
        : null

      // ── 2. Estado de cada capacidad ───────────────────────────────────
      const porCapacidad = CAPACIDADES.map((cap) => {
        const deCap = regsSala
          .filter((r: any) => r.capacidad === cap.key)
          .sort((a: any, b: any) => String(b.fecha || b.created_at).localeCompare(String(a.fecha || a.created_at)))

        if (deCap.length === 0) {
          return { key: cap.key, nombre: cap.nombre, evaluada: false }
        }

        const indicador = deCap[0].paso || ""
        const delMismoPaso = deCap.filter((r: any) => r.paso === indicador)
        const yaLoHacen = delMismoPaso.filter((r: any) => r.estado === "ya_lo_hace").length
        const empezando = delMismoPaso.filter((r: any) => r.estado === "empezando").length
        const acompanar = delMismoPaso.filter((r: any) => r.estado === "acompanar")
        const nombrePorId: Record<string, string> = {}
        alumnosSala.forEach((a: any) => { nombrePorId[a.id] = a.nombre })

        return {
          key: cap.key,
          nombre: cap.nombre,
          evaluada: true,
          indicador,
          yaLoHacen,
          empezando,
          acompanar: acompanar.length,
          necesitanAcompanamiento: acompanar.map((r: any) => nombrePorId[r.alumno_id]).filter(Boolean),
          fecha: String(deCap[0].fecha || deCap[0].created_at || "").slice(0, 10),
        }
      })

      const sinEvaluar = porCapacidad.filter((c) => !c.evaluada).length

      // ── 3. Areas trabajadas esta semana ───────────────────────────────
      const areasDelNivel = esSalaDe3(sala) ? AREAS_SALA3 : AREAS_SALA2
      const areasTrabajadas = new Set<string>()
      let diasPlanificados = 0

      cronoSemana.forEach((c: any) => {
        const acts = Array.isArray(c.actividades) ? c.actividades : []
        const conNombre = acts.filter((a: any) => (a?.nombre || "").trim() !== "")
        if (conNombre.length > 0) diasPlanificados++
        conNombre.forEach((a: any) => {
          const area = AREA_DEL_EJE[String(a?.eje || "").toUpperCase()]
          if (area) areasTrabajadas.add(area)
        })
      })

      // ── 4. Actividades de la semana, agrupadas por capacidad ──────────
      const actividadesSemana: any[] = []
      cronoSemana.forEach((c: any) => {
        const acts = Array.isArray(c.actividades) ? c.actividades : []
        acts.forEach((a: any) => {
          if (!(a?.nombre || "").trim()) return
          actividadesSemana.push({
            dia: c.dia,
            fecha: c.fecha,
            nombre: a.nombre,
            eje: a.eje || "",
            ejeNombre: a.ejeNombre || "",
            area: AREA_DEL_EJE[String(a?.eje || "").toUpperCase()] || "",
            capacidadDC: a.capacidadDC || "",
            capacidades: a.capacidades || "",
            realizada: a.realizada === true,
            origen: a.origen || "docente",
          })
        })
      })

      // ── 5. Cronogramas: el activo y el historial ──────────────────────
      const semanasSet = new Set<string>()
      cronoSala.forEach((c: any) => { if (c.semana_inicio) semanasSet.add(c.semana_inicio) })
      const historial = [...semanasSet]
        .sort((a, b) => b.localeCompare(a))
        .map((sem) => {
          const dias = cronoSala.filter((c: any) => c.semana_inicio === sem)
          const conActividades = dias.filter((c: any) =>
            Array.isArray(c.actividades) && c.actividades.some((a: any) => (a?.nombre || "").trim() !== "")
          )
          return {
            semana: sem,
            activa: sem === semana,
            diasPlanificados: conActividades.length,
            finalizada: dias.length > 0 && dias.every((c: any) => c.finalizado === true),
          }
        })

      // ── 6. Proyectos, con su estado ───────────────────────────────────
      const proyectosSala = proyectos
        .filter((p: any) => p.sala === sala)
        .sort((a: any, b: any) => String(b.created_at).localeCompare(String(a.created_at)))
        .map((p: any) => ({
          titulo: p.titulo,
          objetivo: p.objetivo_general || "",
          duracion: p.duracion || "",
          estado: p.estado === "finalizado" ? "finalizado" : "activo",
          fecha: String(p.created_at || "").slice(0, 10),
        }))

      // ── 7. Alertas ────────────────────────────────────────────────────
      const alertas: { tipo: string; mensaje: string }[] = []
      if (diasSinEvaluar === null) {
        alertas.push({ tipo: "sin_registros", mensaje: "Todavia no hay evaluaciones en esta sala" })
      } else if (diasSinEvaluar >= DIAS_SIN_EVALUAR_ALERTA) {
        alertas.push({ tipo: "sin_evaluar", mensaje: `Hace ${diasSinEvaluar} dias que no se registra una evaluacion` })
      }
      if (sinEvaluar > 0 && diasSinEvaluar !== null) {
        alertas.push({ tipo: "capacidades", mensaje: `${sinEvaluar} de las cinco capacidades todavia sin evaluar` })
      }
      // Chicos que necesitan acompanamiento en mas de una capacidad
      const conteoAcompanar: Record<string, number> = {}
      porCapacidad.forEach((c: any) => {
        (c.necesitanAcompanamiento || []).forEach((n: string) => {
          conteoAcompanar[n] = (conteoAcompanar[n] || 0) + 1
        })
      })
      const variasCapacidades = Object.entries(conteoAcompanar).filter(([, n]) => n >= 2).map(([n]) => n)
      if (variasCapacidades.length > 0) {
        alertas.push({
          tipo: "acompanamiento",
          mensaje: `Necesitan acompanamiento en varias capacidades: ${variasCapacidades.join(", ")}`,
        })
      }
      if (diasPlanificados === 0) {
        alertas.push({ tipo: "sin_planificar", mensaje: "La semana todavia no esta planificada" })
      }

      return {
        sala,
        nivel: esSalaDe3(sala) ? "3" : "2",
        totalAlumnos: alumnosSala.length,
        ultimaEvaluacion: ultimaFecha || null,
        diasSinEvaluar,
        porCapacidad,
        capacidadesSinEvaluar: sinEvaluar,
        diasPlanificados,
        areasDelNivel,
        areasTrabajadas: [...areasTrabajadas],
        actividadesSemana,
        historial,
        proyectos: proyectosSala,
        alertas,
      }
    })

    return NextResponse.json({ ok: true, semana, salas })
  } catch (err) {
    console.error("[v0] Error en directora-resumen-maternal:", err)
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
  }
}
