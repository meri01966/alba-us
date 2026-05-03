import { NextResponse } from "next/server"

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const BASE_ID = "appvmkxMrMWhGbclm"
const TABLE_ID = "tbllr0ae0dLj1VIfN"

export async function GET() {
  if (!AIRTABLE_TOKEN) {
    return NextResponse.json(
      { error: "AIRTABLE_TOKEN no configurado" },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`,
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
      console.error("[v0] Airtable API error:", errorData)
      return NextResponse.json(
        { error: "Error al conectar con Airtable", details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Map Airtable records to our Student format
    const students = data.records.map((record: { id: string; fields: Record<string, string> }) => ({
      id: record.id,
      name: record.fields["Alumno"] || "Sin nombre",
      cf: normalizeStatus(record.fields["CF"]),
      rl: normalizeStatus(record.fields["RL"]),
      o: normalizeStatus(record.fields["O"]),
    }))

    return NextResponse.json({ students })
  } catch (error) {
    console.error("[v0] Error fetching from Airtable:", error)
    return NextResponse.json(
      { error: "Error de conexión con Airtable" },
      { status: 500 }
    )
  }
}

// Normalize status values from Airtable to our format
function normalizeStatus(value: string | undefined): "green" | "yellow" | "red" {
  if (!value) return "yellow"
  
  const normalized = value.toLowerCase().trim()
  
  // Support various formats
  if (normalized === "green" || normalized === "verde" || normalized === "logrado") {
    return "green"
  }
  if (normalized === "red" || normalized === "rojo" || normalized === "requiere intervención" || normalized === "requiere intervencion") {
    return "red"
  }
  // Default to yellow for "yellow", "amarillo", "en proceso", or any other value
  return "yellow"
}
