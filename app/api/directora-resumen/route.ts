// ALBA — Resumen para Direccion
// UNA sola fuente de verdad para el tablero. Reemplaza el cruce de ocho endpoints
// que se contradecian entre si.
// Muestra SOLO el segundo cuatrimestre (desde el 3/8/2026): los datos anteriores
// quedan intactos en la base pero no se mezclan, porque arrastran errores viejos.
// Devuelve CONTEOS, no porcentajes: numeros que se leen de un vistazo.
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

// Arranque del segundo cuatrimestre: el lunes en que las maestras empezaron a
// registrar en ALBA. Todo lo anterior queda en la base pero no se muestra.
const INICIO_CUATRIMESTRE = "2026-08-03"

const SALAS = ["Manzanos", "Girasoles", "Alamos", "Nogales TM", "Nogales TT"]
const EJES = ["CF", "CT", "O", "E"] as const

export const dynamic = "force-dynamic"
export const revalidate = 0

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

function normalizarEje(valor: string): "CF" | "CT" | "O" | "E" {
  const e = (valor || "").trim().toUpperCase()
  if (e === "CT") return "CT"
  if (e === "O" || e === "ORALIDAD") return "O"
  if (e === "E" || e === "EA" || e === "LE" || e === "ESCRITURA") return "E"
  return "CF"
}

// Fecha YYYY-MM-DD en hora de Argentina, sin corrimiento de huso
function fechaAR(valor: any): string {
  if (!valor) return ""
  const s = String(valor).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const d = new Date(s)
  if (isNaN(d.getTime())) return s.slice(0, 10)
  return d.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
}

// Lunes de la semana en curso (sabado y domingo miran la semana siguiente,
// misma regla que usa el cronograma)
function lunesDeLaSemana(): string {
  const ahora = new Date()
  const ar = new Date(ahora.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }))
  const dia = ar.getDay()
  const diff = dia === 0 ? 1 : dia === 6 ? 2 : 1 - dia
  ar.setDate(ar.getDate() + diff)
  const y = ar.getFullYear()
  const m = String(ar.getMonth() + 1).padStart(2, "0")
  const d = String(ar.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

interface ResumenEje {
  clases: number        // actividades distintas trabajadas
  necesitanApoyo: number // chicos con refuerzo en ese eje
}

export async function GET(_req: NextRequest) {
  try {
    const supabase = getSupabase()
    const semana = lunesDeLaSemana()

    const [alumnosRes, seguimientoRes, cronoRes, cierresRes] = await Promise.all([
      supabase.from("alumnos").select("id, nombre, sala"),
      supabase.from("seguimiento").select("alumno_id, sala, eje, estado, actividad, fecha, created_at").gte("fecha", INICIO_CUATRIMESTRE),
      supabase.from("cronograma_jardin").select("sala, dia, fecha, actividades, dia_finalizado, semana_inicio").gte("fecha", INICIO_CUATRIMESTRE),
      supabase.from("registro_cierre").select("sala, eje, actividad_alba, evaluacion_general, fecha").gte("fecha", INICIO_CUATRIMESTRE),
    ])

    const alumnos = alumnosRes.data || []
    const seguimiento = seguimientoRes.data || []
    const crono = cronoRes.data || []
    const cierres = cierresRes.data || []

    const salas = SALAS.map((sala) => {
      const alumnosSala = alumnos.filter((a: any) => a.sala === sala)
      const regsSala = seguimiento.filter((r: any) => r.sala === sala)

      // ── 1. ¿Esta usando ALBA? ────────────────────────────────────────
      let ultimaFecha = ""
      regsSala.forEach((r: any) => {
        const f = fechaAR(r.fecha || r.created_at)
        if (f > ultimaFecha) ultimaFecha = f
      })

      const cronoSemana = crono.filter((c: any) => c.sala === sala && c.semana_inicio === semana)
      const diasPlanificados = cronoSemana.filter((c: any) => {
        const acts = Array.isArray(c.actividades) ? c.actividades : []
        return acts.some((a: any) => (a?.nombre || "").trim().length > 0)
      }).length
      const jornadasCerradas = cronoSemana.filter((c: any) => c.dia_finalizado === true).length

      // ── 2. ¿Como viene cada eje? ─────────────────────────────────────
      const porEje: Record<string, ResumenEje> = {}
      EJES.forEach((e) => { porEje[e] = { clases: 0, necesitanApoyo: 0 } })

      const actividadesPorEje: Record<string, Set<string>> = {}
      const chicosEnRojoPorEje: Record<string, Set<string>> = {}
      EJES.forEach((e) => { actividadesPorEje[e] = new Set(); chicosEnRojoPorEje[e] = new Set() })

      regsSala.forEach((r: any) => {
        const e = normalizarEje(r.eje)
        if (r.actividad) actividadesPorEje[e].add(String(r.actividad).trim().toLowerCase())
        if (String(r.estado || "").toLowerCase() === "red") chicosEnRojoPorEje[e].add(r.alumno_id)
      })

      EJES.forEach((e) => {
        porEje[e].clases = actividadesPorEje[e].size
        porEje[e].necesitanApoyo = chicosEnRojoPorEje[e].size
      })

      // ── 3. ¿Quienes necesitan apoyo? ─────────────────────────────────
      // Un chico entra en la lista si tiene 2 o mas evaluaciones en refuerzo
      const rojosPorAlumno: Record<string, number> = {}
      regsSala.forEach((r: any) => {
        if (String(r.estado || "").toLowerCase() !== "red") return
        rojosPorAlumno[r.alumno_id] = (rojosPorAlumno[r.alumno_id] || 0) + 1
      })
      const necesitanApoyo = alumnosSala
        .filter((a: any) => (rojosPorAlumno[a.id] || 0) >= 2)
        .map((a: any) => ({ id: a.id, nombre: a.nombre, refuerzos: rojosPorAlumno[a.id] }))
        .sort((x: any, y: any) => y.refuerzos - x.refuerzos)

      // ── 4. ¿Que quedo sin evaluar? ───────────────────────────────────
      const sinEvaluar = cierres.filter(
        (c: any) => c.sala === sala && c.evaluacion_general === "no_realizada"
      ).length

      return {
        sala,
        alumnos: alumnosSala.length,
        ultimaVezQueRegistro: ultimaFecha || null,
        diasPlanificados,
        jornadasCerradas,
        porEje,
        necesitanApoyo,
        sinEvaluar,
      }
    })

    return NextResponse.json({
      ok: true,
      desde: INICIO_CUATRIMESTRE,
      periodo: "Segundo cuatrimestre",
      semanaEnCurso: semana,
      salas,
    })
  } catch (e) {
    console.error("[v0] Error en directora-resumen:", e)
    return NextResponse.json({ ok: false, error: "Error interno", salas: [] }, { status: 500 })
  }
}
