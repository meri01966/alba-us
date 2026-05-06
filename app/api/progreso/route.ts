import { NextResponse } from "next/server"

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID || "appvmkxMrMWhGbclm"

const TOTALES: Record<string, number> = { CF: 40, CT: 20, O: 40 }

// Demo data when no Airtable token
const DEMO_ALUMNOS = [
  { id: "demo1", nombre: "Lucia", apellido: "Garcia", mesa: "Manzanas" },
  { id: "demo2", nombre: "Mateo", apellido: "Lopez", mesa: "Manzanas" },
  { id: "demo3", nombre: "Sofia", apellido: "Martinez", mesa: "Peras" },
  { id: "demo4", nombre: "Benjamin", apellido: "Rodriguez", mesa: "Peras" },
  { id: "demo5", nombre: "Valentina", apellido: "Fernandez", mesa: "Naranjas" },
  { id: "demo6", nombre: "Thiago", apellido: "Gonzalez", mesa: "Naranjas" },
]

const DEMO_PROGRESO: Record<string, Record<string, number>> = {
  demo1: { CF: 75, CT: 60, O: 80 },
  demo2: { CF: 45, CT: 50, O: 55 },
  demo3: { CF: 30, CT: 25, O: 40 },
  demo4: { CF: 85, CT: 70, O: 90 },
  demo5: { CF: 20, CT: 15, O: 35 },
  demo6: { CF: 60, CT: 55, O: 65 },
}

export async function GET() {
  // Demo mode
  if (!AIRTABLE_TOKEN) {
    return NextResponse.json({
      ok: true,
      source: "demo",
      alumnos: DEMO_ALUMNOS,
      progreso: DEMO_PROGRESO,
    })
  }

  try {
    // Fetch students
    const aRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/Alumnos?pageSize=100`,
      {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
        cache: "no-store",
      }
    )
    const aData = await aRes.json()

    const alumnos = aData.records?.map((r: any) => ({
      id: r.id,
      nombre: r.fields.nombre || "",
      apellido: r.fields.apellido || "",
      mesa: r.fields.mesa || "General",
    })) || []

    // Fetch completed records
    const rRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/Registros?filterByFormula={resultado}="logrado"&pageSize=100`,
      {
        headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` },
        cache: "no-store",
      }
    )
    const rData = await rRes.json()

    // Calculate progress
    const logradas: Record<string, Set<string>> = {}

    rData.records?.forEach((r: any) => {
      const aid = r.fields.alumno_id?.[0] || r.fields.alumno_id
      const eje = r.fields.eje
      const idx = String(r.fields.actividad_index)
      if (!aid || !eje) return
      const key = `${aid}-${eje}`
      if (!logradas[key]) logradas[key] = new Set()
      logradas[key].add(idx)
    })

    const progreso: Record<string, Record<string, number>> = {}
    alumnos.forEach((a: any) => {
      progreso[a.id] = { CF: 0, CT: 0, O: 0 }
      Object.keys(TOTALES).forEach((eje) => {
        const key = `${a.id}-${eje}`
        const count = logradas[key]?.size || 0
        progreso[a.id][eje] = Math.round((count / TOTALES[eje]) * 100)
      })
    })

    return NextResponse.json({ ok: true, source: "airtable", alumnos, progreso })
  } catch (error) {
    console.error("[v0] Error fetching progreso:", error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
