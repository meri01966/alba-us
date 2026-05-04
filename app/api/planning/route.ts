import { NextResponse } from "next/server"

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const BASE_ID = process.env.AIRTABLE_BASE_ID || "appvmkxMrMWhGbclm"
const TABLE_ID = "tblPlanificaciones"

interface AirtableRecord {
  id: string
  fields: Record<string, string>
}

function recordToPlanning(record: AirtableRecord) {
  return {
    id: record.id,
    titulo:   record.fields["Titulo"]   || "",
    objetivo: record.fields["Objetivo"] || "",
    actividad: record.fields["Actividad"] || "",
    recursos:  record.fields["Recursos"]  || "",
    fecha:     record.fields["Fecha"]     || new Date().toISOString().split("T")[0],
  }
}

export async function GET() {
  if (!AIRTABLE_TOKEN) {
    return NextResponse.json({ planning: null, source: "no-token" })
  }

  try {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?maxRecords=1&sort%5B0%5D%5Bfield%5D=Fecha&sort%5B0%5D%5Bdirection%5D=desc`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("[v0] Airtable planning GET error:", response.status)
      return NextResponse.json({ planning: null, source: "error" })
    }

    const data = await response.json()

    if (!data.records || data.records.length === 0) {
      return NextResponse.json({ planning: null, source: "airtable" })
    }

    return NextResponse.json({
      planning: recordToPlanning(data.records[0]),
      source: "airtable",
    })
  } catch (error) {
    console.error("[v0] Error fetching planning:", error)
    return NextResponse.json({ planning: null, source: "error" })
  }
}

export async function POST(request: Request) {
  if (!AIRTABLE_TOKEN) {
    return NextResponse.json({ error: "AIRTABLE_TOKEN no configurado" }, { status: 500 })
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
                Titulo:    titulo,
                Objetivo:  objetivo,
                Actividad: actividad,
                Recursos:  recursos,
                Fecha:     new Date().toISOString().split("T")[0],
              },
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Airtable POST error:", errorData)
      return NextResponse.json(
        { error: "Error al guardar en Airtable", details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({
      planning: recordToPlanning(data.records[0]),
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error saving planning:", error)
    return NextResponse.json({ error: "Error al guardar la planificación" }, { status: 500 })
  }
}
