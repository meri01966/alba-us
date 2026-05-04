import { NextResponse } from "next/server"

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const BASE_ID = process.env.AIRTABLE_BASE_ID || "appvmkxMrMWhGbclm"
const TABLE_ID = "tbllr0ae0dLj1VIfN"

const FALLBACK_STUDENTS = [
  { id: "demo-1", name: "Valentina G.", cf: "green",  rl: "green",  o: "green"  },
  { id: "demo-2", name: "Tomás R.",     cf: "yellow", rl: "green",  o: "yellow" },
  { id: "demo-3", name: "Sofía M.",     cf: "red",    rl: "yellow", o: "green"  },
  { id: "demo-4", name: "Mateo P.",     cf: "green",  rl: "green",  o: "yellow" },
  { id: "demo-5", name: "Lucía F.",     cf: "yellow", rl: "red",    o: "yellow" },
  { id: "demo-6", name: "Emilio C.",    cf: "green",  rl: "yellow", o: "green"  },
  { id: "demo-7", name: "Isabella D.",  cf: "red",    rl: "red",    o: "yellow" },
  { id: "demo-8", name: "Benjamín A.",  cf: "yellow", rl: "green",  o: "green"  },
]

function normalizeStatus(value: string | undefined): "green" | "yellow" | "red" {
  if (!value) return "yellow"
  const v = value.toLowerCase().trim()
  if (v === "green" || v === "verde" || v === "logrado") return "green"
  if (v === "red" || v === "rojo" || v === "requiere intervención" || v === "requiere intervencion") return "red"
  return "yellow"
}

export async function GET() {
  // If no token, return fallback data silently — never block the UI
  if (!AIRTABLE_TOKEN) {
    return NextResponse.json({ students: FALLBACK_STUDENTS, source: "demo" })
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
      // Airtable returned an error — fall back to demo data instead of crashing
      console.error("[v0] Airtable error status:", response.status)
      return NextResponse.json({ students: FALLBACK_STUDENTS, source: "demo" })
    }

    const data = await response.json()

    const students = (data.records || []).map(
      (record: { id: string; fields: Record<string, string> }) => ({
        id: record.id,
        name: record.fields["Alumno"] || "Sin nombre",
        cf: normalizeStatus(record.fields["CF"]),
        rl: normalizeStatus(record.fields["RL"]),
        o:  normalizeStatus(record.fields["O"]),
      })
    )

    // If Airtable returned no records, still show demo data
    return NextResponse.json({
      students: students.length > 0 ? students : FALLBACK_STUDENTS,
      source: students.length > 0 ? "airtable" : "demo",
    })
  } catch (error) {
    console.error("[v0] Error fetching from Airtable:", error)
    return NextResponse.json({ students: FALLBACK_STUDENTS, source: "demo" })
  }
}
