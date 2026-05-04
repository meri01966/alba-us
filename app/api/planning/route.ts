import { NextResponse } from "next/server"

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const BASE_ID = "appvmkxMrMWhGbclm"
const TABLE_ID = "tblPlanificaciones" // Tabla de planificaciones

interface PlanningFields {
  Titulo?: string
  Objetivo?: string
  Actividad?: string
  Recursos?: string
  Fecha?: string
}

export async function GET() {
  if (!AIRTABLE_TOKEN) {
    return NextResponse.json(
      { error: "AIRTABLE_TOKEN no configurado" },
      { status: 500 }
    )
  }

  try {
    // Get the most recent planning
    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?maxRecords=1&sort%5B0%5D%5Bfield%5D=Fecha&sort%5B0%5D%5Bdirection%5D=desc`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: "Error al conectar con Airtable", details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    if (data.records.length === 0) {
      return NextResponse.json({ planning: null })
    }

    const record = data.records[0]
    const planning = {
      id: record.id,
      titulo: record.fields["Titulo"] || "",
      objetivo: record.fields["Objetivo"] || "",
      actividad: record.fields["Actividad"] || "",
      recursos: record.fields["Recursos"] || "",
      fecha: record.fields["Fecha"] || new Date().toISOString().split("T")[0],
    }

    return NextResponse.json({ planning })
  } catch (error) {
    console.error("[v0] Error fetching planning:", error)
    return NextResponse.json(
      { error: "Error de conexión con Airtable" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  if (!AIRTABLE_TOKEN) {
    return NextResponse.json(
      { error: "AIRTABLE_TOKEN no configurado" },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()
    const { titulo, objetivo, actividad, recursos } = body

    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          records: [
            {
              fields: {
                Titulo: titulo,
                Objetivo: objetivo,
                Actividad: actividad,
                Recursos: recursos,
                Fecha: new Date().toISOString().split("T")[0],
              } as PlanningFields,
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: "Error al guardar en Airtable", details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const record = data.records[0]
    
    const planning = {
      id: record.id,
      titulo: record.fields["Titulo"] || "",
      objetivo: record.fields["Objetivo"] || "",
      actividad: record.fields["Actividad"] || "",
      recursos: record.fields["Recursos"] || "",
      fecha: record.fields["Fecha"] || new Date().toISOString().split("T")[0],
    }

    return NextResponse.json({ planning, success: true })
  } catch (error) {
    console.error("[v0] Error saving planning:", error)
    return NextResponse.json(
      { error: "Error al guardar la planificación" },
      { status: 500 }
    )
  }
}
