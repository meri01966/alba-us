import { NextRequest, NextResponse } from "next/server"

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID || "appvmkxMrMWhGbclm"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Support both old format (studentId, field, status) and new format (eje, actividad, lograron, refuerzo)
    if (body.studentId) {
      // Old format - PATCH single student
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

    // New format - batch create records
    const { eje, actividad, actividadIndex, lograron, refuerzo, fecha } = body

    if (!AIRTABLE_TOKEN) {
      return NextResponse.json({
        ok: true,
        source: "demo",
        lograron: lograron?.length || 0,
        refuerzo: refuerzo?.length || 0,
      })
    }

    const records = [
      ...(lograron || []).map((aid: string) => ({
        fields: {
          alumno_id: [aid],
          eje,
          actividad,
          actividad_index: actividadIndex,
          resultado: "logrado",
          fecha: fecha || new Date().toISOString().split("T")[0],
        },
      })),
      ...(refuerzo || []).map((aid: string) => ({
        fields: {
          alumno_id: [aid],
          eje,
          actividad,
          actividad_index: actividadIndex,
          resultado: "refuerzo",
          fecha: fecha || new Date().toISOString().split("T")[0],
        },
      })),
    ]

    // Send in batches of 10 (Airtable limit)
    for (let i = 0; i < records.length; i += 10) {
      const batch = records.slice(i, i + 10)
      await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/Registros`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records: batch }),
      })
    }

    return NextResponse.json({
      ok: true,
      source: "airtable",
      lograron: lograron?.length || 0,
      refuerzo: refuerzo?.length || 0,
    })
  } catch (error) {
    console.error("[v0] Error en registrar-actividad:", error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
