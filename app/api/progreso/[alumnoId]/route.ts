import { NextRequest, NextResponse } from "next/server"

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const AIRTABLE_BASE = process.env.AIRTABLE_BASE_ID || "appvmkxMrMWhGbclm"
const TOTALES: Record<string, number> = { CF: 40, CT: 20, O: 40 }

// Demo data
const DEMO_ALUMNO = {
  id: "demo1",
  nombre: "Lucia",
  apellido: "Garcia",
  mesa: "Manzanas",
}

const DEMO_PROGRESO = {
  CF: { logradas: [1, 2, 3, 5, 8, 10, 12, 15, 18, 20, 22, 25, 28, 30], porcentaje: 35 },
  CT: { logradas: [1, 2, 4, 6, 8, 10, 12], porcentaje: 35 },
  O: { logradas: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 32], porcentaje: 40 },
}

const DEMO_HISTORIAL = {
  CF: [
    { actividad: "Rimas", actividadIndex: 1, resultado: "logrado", fecha: "2024-05-01" },
    { actividad: "Sonido inicial", actividadIndex: 2, resultado: "logrado", fecha: "2024-05-02" },
  ],
  CT: [
    { actividad: "Partes del libro", actividadIndex: 1, resultado: "logrado", fecha: "2024-05-01" },
  ],
  O: [
    { actividad: "Presentacion personal", actividadIndex: 1, resultado: "logrado", fecha: "2024-05-01" },
    { actividad: "Descripcion de imagen", actividadIndex: 2, resultado: "refuerzo", fecha: "2024-05-03" },
  ],
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ alumnoId: string }> }
) {
  const { alumnoId } = await params

  // Demo mode
  if (!AIRTABLE_TOKEN || alumnoId.startsWith("demo")) {
    return NextResponse.json({
      ok: true,
      source: "demo",
      alumno: { ...DEMO_ALUMNO, id: alumnoId },
      progreso: DEMO_PROGRESO,
      historial: DEMO_HISTORIAL,
    })
  }

  try {
    // Fetch student data
    const aRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/Alumnos/${alumnoId}`,
      { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }, cache: "no-store" }
    )
    const aData = await aRes.json()

    // Fetch student records
    const formula = encodeURIComponent(`FIND("${alumnoId}",ARRAYJOIN({alumno_id}))`)
    const rRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE}/Registros?filterByFormula=${formula}&sort%5B0%5D%5Bfield%5D=fecha&sort%5B0%5D%5Bdirection%5D=desc&pageSize=100`,
      { headers: { Authorization: `Bearer ${AIRTABLE_TOKEN}` }, cache: "no-store" }
    )
    const rData = await rRes.json()

    // Organize data
    const historial: Record<string, any[]> = { CF: [], CT: [], O: [] }
    const logradas: Record<string, Set<number>> = { CF: new Set(), CT: new Set(), O: new Set() }

    rData.records?.forEach((r: any) => {
      const eje = r.fields.eje
      if (!eje || !historial[eje]) return
      historial[eje].push({
        actividad: r.fields.actividad,
        actividadIndex: r.fields.actividad_index,
        resultado: r.fields.resultado,
        fecha: r.fields.fecha,
      })
      if (r.fields.resultado === "logrado") {
        logradas[eje].add(r.fields.actividad_index)
      }
    })

    const progreso: Record<string, { logradas: number[]; porcentaje: number }> = {}
    Object.keys(TOTALES).forEach((eje) => {
      progreso[eje] = {
        logradas: Array.from(logradas[eje]),
        porcentaje: Math.round((logradas[eje].size / TOTALES[eje]) * 100),
      }
    })

    return NextResponse.json({
      ok: true,
      source: "airtable",
      alumno: {
        id: aData.id,
        nombre: aData.fields?.nombre || "",
        apellido: aData.fields?.apellido || "",
        mesa: aData.fields?.mesa || "",
      },
      progreso,
      historial,
    })
  } catch (error) {
    console.error("[v0] Error fetching student profile:", error)
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 })
  }
}
