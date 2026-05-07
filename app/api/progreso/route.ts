import { NextResponse } from "next/server"

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID || "appvmkxMrMWhGbclm"

const TOTALES: Record<string, number> = { CF: 40, CT: 20, O: 40 }

// 25 nombres reales con progreso inicial aleatorio
const DEMO_ALUMNOS = [
  { id: "demo-1",  nombre: "Bautista",   apellido: "Mendez" },
  { id: "demo-2",  nombre: "Catalina",   apellido: "Fernandez" },
  { id: "demo-3",  nombre: "Santino",    apellido: "Villar" },
  { id: "demo-4",  nombre: "Martina",    apellido: "Lopez" },
  { id: "demo-5",  nombre: "Thiago",     apellido: "Rodriguez" },
  { id: "demo-6",  nombre: "Emma",       apellido: "Sanchez" },
  { id: "demo-7",  nombre: "Benicio",    apellido: "Alvarez" },
  { id: "demo-8",  nombre: "Olivia",     apellido: "Perez" },
  { id: "demo-9",  nombre: "Felipe",     apellido: "Gomez" },
  { id: "demo-10", nombre: "Valentina",  apellido: "Diaz" },
  { id: "demo-11", nombre: "Mateo",      apellido: "Hernandez" },
  { id: "demo-12", nombre: "Delfina",    apellido: "Castro" },
  { id: "demo-13", nombre: "Lautaro",    apellido: "Blanco" },
  { id: "demo-14", nombre: "Mia",        apellido: "Torres" },
  { id: "demo-15", nombre: "Joaquin",    apellido: "Espinoza" },
  { id: "demo-16", nombre: "Sofia",      apellido: "Navarro" },
  { id: "demo-17", nombre: "Nicolas",    apellido: "Ortiz" },
  { id: "demo-18", nombre: "Isabella",   apellido: "Kramer" },
  { id: "demo-19", nombre: "Benjamin",   apellido: "Zapata" },
  { id: "demo-20", nombre: "Lucia",      apellido: "Weiss" },
  { id: "demo-21", nombre: "Tomas",      apellido: "Quiroga" },
  { id: "demo-22", nombre: "Emilia",     apellido: "Juarez" },
  { id: "demo-23", nombre: "Agustin",    apellido: "Ibarra" },
  { id: "demo-24", nombre: "Alma",       apellido: "Uribe" },
  { id: "demo-25", nombre: "Franco",     apellido: "Yamal" },
]

const DEMO_PROGRESO: Record<string, Record<string, number>> = {
  "demo-1":  { CF: 85, CT: 70, O: 90 },
  "demo-2":  { CF: 60, CT: 55, O: 65 },
  "demo-3":  { CF: 15, CT: 10, O: 25 },
  "demo-4":  { CF: 75, CT: 80, O: 70 },
  "demo-5":  { CF: 40, CT: 35, O: 45 },
  "demo-6":  { CF: 90, CT: 85, O: 88 },
  "demo-7":  { CF: 20, CT: 15, O: 18 },
  "demo-8":  { CF: 65, CT: 70, O: 72 },
  "demo-9":  { CF: 95, CT: 90, O: 92 },
  "demo-10": { CF: 50, CT: 45, O: 55 },
  "demo-11": { CF: 30, CT: 25, O: 35 },
  "demo-12": { CF: 80, CT: 75, O: 78 },
  "demo-13": { CF: 25, CT: 20, O: 22 },
  "demo-14": { CF: 70, CT: 65, O: 75 },
  "demo-15": { CF: 55, CT: 50, O: 60 },
  "demo-16": { CF: 10, CT: 15, O: 20 },
  "demo-17": { CF: 88, CT: 82, O: 85 },
  "demo-18": { CF: 45, CT: 50, O: 48 },
  "demo-19": { CF: 35, CT: 30, O: 40 },
  "demo-20": { CF: 78, CT: 72, O: 80 },
  "demo-21": { CF: 42, CT: 38, O: 45 },
  "demo-22": { CF: 82, CT: 78, O: 85 },
  "demo-23": { CF: 58, CT: 55, O: 62 },
  "demo-24": { CF: 12, CT: 18, O: 15 },
  "demo-25": { CF: 92, CT: 88, O: 95 },
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
