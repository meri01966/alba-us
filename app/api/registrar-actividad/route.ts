import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID || "appvmkxMrMWhGbclm"

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // ── Formato viejo: PATCH individual de Airtable ────────────────────────
    if (body.studentId && body.field && body.status) {
      const { studentId, field, status } = body
      if (!AIRTABLE_TOKEN) {
        return NextResponse.json({ success: true, source: "demo" })
      }
      const TABLE_ID = process.env.AIRTABLE_TABLE_NAME_REGISTRO || "tbllr0ae0dLj1VIfN"
      const response = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE}/${TABLE_ID}/${studentId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${AIRTABLE_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields: { [field]: status } }),
        }
      )
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        return NextResponse.json({ error: "Error Airtable", details: errorData }, { status: response.status })
      }
      return NextResponse.json({ success: true, source: "airtable" })
    }

    // ── Formato nuevo: batch de evaluaciones con semaforo ──────────────────
    // Campos: eje, actividad, actividadIndex, sala, lograron, refuerzo, pendiente, fecha
    const {
      eje,
      actividad,
      actividadIndex,
      sala,
      lograron = [],
      refuerzo = [],
      pendiente = [],
      fecha,
    } = body

    const fechaHoy = fecha || new Date().toISOString().split("T")[0]
    const supabase = getSupabase()

    // Buscar los alumno_id reales desde Supabase si se pasan nombres/ids
    // El formato puede traer ids directamente o nombres - normalizamos
    type RowInsert = {
      alumno_id: string
      eje: string
      actividad: string
      actividad_index: number | null
      resultado: string
      fecha: string
      sala: string | null
    }

    const rows: RowInsert[] = [
      ...lograron.map((id: string) => ({
        alumno_id: id,
        eje,
        actividad,
        actividad_index: actividadIndex ?? null,
        resultado: "green",
        fecha: fechaHoy,
        sala: sala || null,
      })),
      ...refuerzo.map((id: string) => ({
        alumno_id: id,
        eje,
        actividad,
        actividad_index: actividadIndex ?? null,
        resultado: "red",
        fecha: fechaHoy,
        sala: sala || null,
      })),
      ...pendiente.map((id: string) => ({
        alumno_id: id,
        eje,
        actividad,
        actividad_index: actividadIndex ?? null,
        resultado: "yellow",
        fecha: fechaHoy,
        sala: sala || null,
      })),
    ]

    let supabaseOk = false
    let supabaseError: string | null = null

    if (rows.length > 0) {
      const { error } = await supabase.from("seguimiento").insert(rows)
      if (error) {
        supabaseError = error.message
        console.error("[v0] Error guardando en Supabase seguimiento:", error.message)
      } else {
        supabaseOk = true
      }
    }

    return NextResponse.json({
      ok: true,
      source: supabaseOk ? "supabase" : "fallback",
      registros: rows.length,
      lograron: lograron.length,
      refuerzo: refuerzo.length,
      pendiente: pendiente.length,
      ...(supabaseError ? { warning: supabaseError } : {}),
    })
  } catch (error) {
    console.error("[v0] Error en registrar-actividad:", error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
