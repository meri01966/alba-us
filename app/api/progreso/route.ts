import { NextResponse } from "next/server"

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID || "appvmkxMrMWhGbclm"

const TOTALES: Record<string, number> = { CF: 40, CT: 20, O: 40 }

// Demo data when no Airtable token
const DEMO_ALUMNOS = [
  { id: "demo1",  nombre: "Lucia",     apellido: "Garcia" },
  { id: "demo2",  nombre: "Mateo",     apellido: "Lopez" },
  { id: "demo3",  nombre: "Sofia",     apellido: "Martinez" },
  { id: "demo4",  nombre: "Benjamin",  apellido: "Rodriguez" },
  { id: "demo5",  nombre: "Valentina", apellido: "Fernandez" },
  { id: "demo6",  nombre: "Thiago",    apellido: "Gonzalez" },
  { id: "demo7",  nombre: "Emma",      apellido: "Perez" },
  { id: "demo8",  nombre: "Lautaro",   apellido: "Diaz" },
  { id: "demo9",  nombre: "Martina",   apellido: "Sanchez" },
  { id: "demo10", nombre: "Felipe",    apellido: "Ruiz" },
  { id: "demo11", nombre: "Catalina",  apellido: "Torres" },
  { id: "demo12", nombre: "Santiago",  apellido: "Flores" },
  { id: "demo13", nombre: "Mia",       apellido: "Acosta" },
  { id: "demo14", nombre: "Nicolas",   apellido: "Romero" },
  { id: "demo15", nombre: "Julieta",   apellido: "Alvarez" },
]

const DEMO_PROGRESO: Record<string, Record<string, number>> = {
  demo1:  { CF: 75, CT: 60, O: 80 },
  demo2:  { CF: 45, CT: 50, O: 55 },
  demo3:  { CF: 30, CT: 25, O: 40 },
  demo4:  { CF: 85, CT: 70, O: 90 },
  demo5:  { CF: 20, CT: 15, O: 35 },
  demo6:  { CF: 60, CT: 55, O: 65 },
  demo7:  { CF: 90, CT: 85, O: 88 },
  demo8:  { CF: 35, CT: 40, O: 30 },
  demo9:  { CF: 55, CT: 48, O: 62 },
  demo10: { CF: 72, CT: 68, O: 75 },
  demo11: { CF: 18, CT: 22, O: 28 },
  demo12: { CF: 82, CT: 78, O: 85 },
  demo13: { CF: 42, CT: 38, O: 45 },
  demo14: { CF: 65, CT: 58, O: 70 },
  demo15: { CF: 50, CT: 45, O: 52 },
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
