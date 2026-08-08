import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

// Desde esta fecha empezo el registro real con las maestras. Antes hay datos de prueba.
const FECHA_CORTE = "2026-08-03"

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

// Ejes que devuelve la Trayectoria. Escritura incluida (lee datos "E", "LE" y "Escritura").
const EJES = ["CF", "CT", "O", "E"] as const
type EjeKey = (typeof EJES)[number]

// Normaliza el valor del campo "eje" de la base a una de las claves de EJES.
// Escritura hoy puede venir como "E", "LE" o "Escritura" -> todo se unifica a "E".
function normalizarEje(ejeRaw: string): EjeKey | null {
  const e = (ejeRaw || "").trim().toUpperCase()
  if (e === "CF") return "CF"
  if (e === "CT") return "CT"
  if (e === "O" || e === "ORALIDAD") return "O"
  if (e === "E" || e === "LE" || e === "ESCRITURA" || e === "EA") return "E"
  return null
}

// Estado individual: green / yellow / red son evidencia real; blue = ausente (no evidencia)
type EstadoEval = "green" | "yellow" | "red" | "blue"

function normalizarEstado(estadoRaw: string): EstadoEval {
  const s = (estadoRaw || "").trim().toLowerCase()
  if (s === "green" || s === "yellow" || s === "red" || s === "blue") return s as EstadoEval
  if (s === "ausente" || s === "absent") return "blue"
  if (!s) return "blue"
  return "red"
}

// Devuelve la fecha en formato YYYY-MM-DD segun hora de Argentina.
// Si el valor ya viene como fecha sola ("2026-08-03") se usa tal cual, sin convertir:
// pasarla por new Date() la leeria como medianoche UTC y en Argentina restaria un dia.
function fechaISOAR(valor: any): string {
  if (!valor) return ""
  const s = String(valor).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const d = new Date(s)
  if (isNaN(d.getTime())) return s.slice(0, 10)
  return d.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
}

// "2026-08-03" -> "03/08". Sin usar Date, para no arrastrar el corrimiento de huso.
function formatFechaCorta(iso: string): string {
  const m = (iso || "").match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return ""
  return `${m[3]}/${m[2]}`
}

interface ActividadEvaluada {
  semana: number
  titulo: string
  fecha: string
  resultado: EstadoEval
  promedio: number
}

// Actividad que ALBA propuso, la maestra planifico, y quedo sin registro de evaluacion.
// Es un dato de SALA (registro_cierre no tiene alumno_id): aplica a todo el grupo.
interface NoRealizada {
  eje: EjeKey
  titulo: string
  fecha: string
  fechaISO: string
}

interface ProgresoEje {
  logradas: number[]
  porcentaje: number
  actividades: ActividadEvaluada[]
  tendencia: "mejorando" | "estable" | "bajando"
  semanaActual: number
  evaluadasReales: number
  ausentes: number
  sinRegistro: number
}

// Promedio SOLO con evidencia real (excluye ausentes "blue"). green=100, yellow=50, red=0
function calcularPromedio(actividades: Array<{ resultado: EstadoEval }>): number {
  const reales = actividades.filter((a) => a.resultado !== "blue")
  if (reales.length === 0) return 0
  const puntos = reales.reduce((acc, a) => {
    if (a.resultado === "green") return acc + 100
    if (a.resultado === "yellow") return acc + 50
    return acc + 0
  }, 0)
  return Math.round(puntos / reales.length)
}

function calcularTendencia(
  actividades: Array<{ resultado: EstadoEval; fecha: string }>
): "mejorando" | "estable" | "bajando" {
  const reales = actividades.filter((a) => a.resultado !== "blue")
  if (reales.length < 6) return "estable"

  const ordenadas = [...reales].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  )
  const recientes = ordenadas.slice(0, 3)
  const anteriores = ordenadas.slice(3, 6)
  const promedioReciente = calcularPromedio(recientes)
  const promedioAnterior = calcularPromedio(anteriores)

  if (promedioReciente > promedioAnterior + 10) return "mejorando"
  if (promedioReciente < promedioAnterior - 10) return "bajando"
  return "estable"
}

function calcularSemanaActual(evaluadasReales: number, promedio: number): number {
  if (evaluadasReales === 0) return 1
  if (promedio >= 70) return Math.min(25, Math.floor(evaluadasReales / 3) + 1)
  if (promedio >= 50) return Math.min(25, Math.floor(evaluadasReales / 5) + 1)
  return Math.min(25, Math.floor(evaluadasReales / 7) + 1)
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ alumnoId: string }> }
) {
  const { alumnoId } = await params
  const supabase = getSupabase()

  try {
    const { data: alumnoData, error: alumnoError } = await supabase
      .from("alumnos")
      .select("*")
      .eq("id", alumnoId)
      .single()

    if (alumnoError && alumnoError.code !== "PGRST116") {
      console.error("[v0] Error fetching alumno:", alumnoError)
    }

    const { data: evaluaciones, error: evalError } = await supabase
      .from("seguimiento")
      .select("*")
      .eq("alumno_id", alumnoId)
      .order("created_at", { ascending: true })

    if (evalError) {
      console.error("[v0] Error fetching evaluaciones:", evalError)
    }

    const evaluacionesPorEje: Record<EjeKey, Array<{
      semana: number
      titulo: string
      fecha: string
      resultado: EstadoEval
      actividad: string
    }>> = { CF: [], CT: [], O: [], E: [] }

    const contadorSemana: Record<EjeKey, number> = { CF: 1, CT: 1, O: 1, E: 1 }

    // Claves "YYYY-MM-DD|EJE" de los dias que ESTE alumno ya tiene evaluados.
    // Sirven para no mostrar en rojo algo que para el si quedo registrado.
    const diasConEvidencia = new Set<string>()

    ;(evaluaciones || []).forEach((ev: any) => {
      const eje = normalizarEje(ev.eje)
      if (!eje) return

      const iso = fechaISOAR(ev.fecha || ev.created_at)
      if (iso) diasConEvidencia.add(`${iso}|${eje}`)

      const n = contadorSemana[eje]++
      evaluacionesPorEje[eje].push({
        semana: n,
        titulo: ev.actividad || `Clase ${n}`,
        fecha: ev.created_at
          ? new Date(ev.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" })
          : "",
        resultado: normalizarEstado(ev.estado),
        actividad: ev.actividad || "",
      })
    })

    // ---- Actividades sin registro de evaluacion (tabla registro_cierre) ----
    // Bloque aislado a proposito: si algo falla aca, la ficha sigue funcionando
    // igual que antes y simplemente no se muestran tarjetas rojas.
    const noRealizadas: NoRealizada[] = []

    try {
      const sala = (alumnoData as any)?.sala

      if (sala) {
        const { data: cierres, error: cierreError } = await supabase
          .from("registro_cierre")
          .select("*")
          .eq("sala", sala)
          .eq("evaluacion_general", "no_realizada")
          .gte("fecha", FECHA_CORTE)

        if (cierreError) {
          console.error("[v0] Error fetching registro_cierre:", cierreError)
        }

        const vistas = new Set<string>()

        ;(cierres || []).forEach((rc: any) => {
          const eje = normalizarEje(rc.eje)
          if (!eje) return

          const iso = fechaISOAR(rc.fecha)
          if (!iso) return

          const clave = `${iso}|${eje}`

          // Si el alumno tiene evaluacion ese dia y ese eje, gana la evidencia real.
          if (diasConEvidencia.has(clave)) return

          // Evita duplicados si el cierre dejo mas de una fila para el mismo dia/eje.
          if (vistas.has(clave)) return
          vistas.add(clave)

          noRealizadas.push({
            eje,
            titulo: rc.actividad_alba || rc.actividad_docente || "Actividad sin registro",
            fecha: formatFechaCorta(iso),
            fechaISO: iso,
          })
        })

        noRealizadas.sort((a, b) => a.fechaISO.localeCompare(b.fechaISO))
      }
    } catch (errCierre) {
      console.error("[v0] Error procesando registro_cierre:", errCierre)
    }

    const progreso: Record<string, ProgresoEje> = {}

    for (const eje of EJES) {
      const actividades = evaluacionesPorEje[eje]
      const reales = actividades.filter((a) => a.resultado !== "blue")
      const ausentes = actividades.length - reales.length
      const promedio = calcularPromedio(actividades)
      const tendencia = calcularTendencia(actividades)
      const semanaActual = calcularSemanaActual(reales.length, promedio)

      const logradas = actividades
        .map((a, idx) => ({ a, idx }))
        .filter(({ a }) => a.resultado === "green")
        .map(({ idx }) => idx + 1)

      progreso[eje] = {
        logradas,
        porcentaje: promedio,
        actividades: actividades.map((a) => ({
          semana: a.semana,
          titulo: a.titulo,
          fecha: a.fecha,
          resultado: a.resultado,
          promedio: a.resultado === "green" ? 100 : a.resultado === "yellow" ? 50 : 0,
        })),
        tendencia,
        semanaActual,
        evaluadasReales: reales.length,
        ausentes,
        sinRegistro: noRealizadas.filter((n) => n.eje === eje).length,
      }
    }

    return NextResponse.json({
      ok: true,
      source: "supabase",
      alumno: alumnoData
        ? { ...(alumnoData as any), apellido: (alumnoData as any).apellido ?? "" }
        : { id: alumnoId, nombre: "Alumno", apellido: "" },
      progreso,
      noRealizadas,
    })
  } catch (error) {
    console.error("[v0] Error in progreso API:", error)
    const vacio = (): ProgresoEje => ({
      logradas: [], porcentaje: 0, actividades: [], tendencia: "estable", semanaActual: 1, evaluadasReales: 0, ausentes: 0, sinRegistro: 0,
    })
    return NextResponse.json({
      ok: false,
      error: String(error),
      progreso: { CF: vacio(), CT: vacio(), O: vacio(), E: vacio() },
      noRealizadas: [],
    }, { status: 500 })
  }
}
