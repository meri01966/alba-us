// ALBA — Registro de maternal
// La docente evalua UNA capacidad por vez y marca SOLO a los que se apartan.
// Los que no toca quedan en "ya lo hace": se guardan igual, porque si no,
// despues no habria forma de saber si un chico avanzo o si ese dia no se evaluo.
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

const TABLA = "registro_maternal"

// Las cinco capacidades, con su nombre para mostrar
const CAPACIDADES = [
  { key: "COM", nombre: "Comunicacion" },
  { key: "AUT", nombre: "Autonomia para aprender" },
  { key: "RES", nombre: "Resolucion de problemas" },
  { key: "COL", nombre: "Compromiso y colaboracion" },
  { key: "REF", nombre: "Pensamiento reflexivo y critico" },
]

export const dynamic = "force-dynamic"
export const revalidate = 0

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

// ── GET: que capacidad toca evaluar y como quedo la ultima vez ──────────────
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sala = searchParams.get("sala")
    if (!sala) return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })

    const supabase = getSupabase()

    const { data: alumnos } = await supabase
      .from("alumnos").select("id, nombre").eq("sala", sala).order("nombre")

    const { data: registros } = await supabase
      .from(TABLA).select("*").eq("sala", sala).order("fecha", { ascending: false }).limit(600)

    const regs = registros || []

    // Ultima vez que se evaluo cada capacidad. La que hace mas que no se mira
    // es la que toca: misma logica de necesidad que usa el cronograma.
    const ultimaPorCapacidad: Record<string, string> = {}
    regs.forEach((r: any) => {
      const f = String(r.fecha || "")
      if (!ultimaPorCapacidad[r.capacidad] || f > ultimaPorCapacidad[r.capacidad]) {
        ultimaPorCapacidad[r.capacidad] = f
      }
    })

    const sugerida = [...CAPACIDADES].sort((a, b) => {
      const fa = ultimaPorCapacidad[a.key] || ""
      const fb = ultimaPorCapacidad[b.key] || ""
      return fa.localeCompare(fb)   // la mas vieja (o nunca evaluada) primero
    })[0]

    // Fecha del ultimo registro de la sala, para mostrar hace cuanto fue
    let ultimoRegistro = ""
    regs.forEach((r: any) => {
      const f = String(r.fecha || "")
      if (f > ultimoRegistro) ultimoRegistro = f
    })

    let diasSinRegistrar: number | null = null
    if (ultimoRegistro) {
      const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
      diasSinRegistrar = Math.max(
        0,
        Math.round((new Date(hoy).getTime() - new Date(ultimoRegistro).getTime()) / 86400000)
      )
    }

    // Como quedo cada chico la ultima vez que se evaluo ESTA capacidad
    const ultimoEstado: Record<string, string> = {}
    const fechaCap = ultimaPorCapacidad[sugerida.key]
    if (fechaCap) {
      regs
        .filter((r: any) => r.capacidad === sugerida.key && String(r.fecha) === fechaCap)
        .forEach((r: any) => { ultimoEstado[r.alumno_id] = r.estado })
    }

    return NextResponse.json({
      ok: true,
      alumnos: alumnos || [],
      capacidades: CAPACIDADES,
      capacidadSugerida: sugerida,
      ultimoRegistro: ultimoRegistro || null,
      diasSinRegistrar,
      ultimoEstado,
    })
  } catch (e) {
    console.error("[v0] Error en registro-maternal GET:", e)
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
  }
}

// ── POST: guardar la evaluacion de una capacidad ────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sala, capacidad, paso, marcados } = body

    if (!sala || !capacidad) {
      return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 })
    }

    const supabase = getSupabase()

    const { data: alumnos } = await supabase.from("alumnos").select("id").eq("sala", sala)
    if (!alumnos || alumnos.length === 0) {
      return NextResponse.json({ ok: false, error: "La sala no tiene alumnos" }, { status: 400 })
    }

    const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
    const porAlumno: Record<string, string> = marcados && typeof marcados === "object" ? marcados : {}

    // Se guarda a TODOS: los marcados con su estado y el resto en "ya lo hace"
    const filas = alumnos.map((a: any) => ({
      sala,
      alumno_id: a.id,
      capacidad,
      paso: paso || "",
      estado: porAlumno[a.id] || "ya_lo_hace",
      fecha: hoy,
    }))

    // Si ya se evaluo hoy esta capacidad, se reemplaza en vez de duplicar
    await supabase
      .from(TABLA).delete()
      .eq("sala", sala).eq("capacidad", capacidad).eq("fecha", hoy)

    const { error } = await supabase.from(TABLA).insert(filas)
    if (error) {
      console.error("[v0] Error guardando registro maternal:", error.message)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, guardados: filas.length })
  } catch (e) {
    console.error("[v0] Error en registro-maternal POST:", e)
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
  }
}
