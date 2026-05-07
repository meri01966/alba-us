import { NextResponse } from "next/server"

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const BASE_ID = process.env.AIRTABLE_BASE_ID || "appvmkxMrMWhGbclm"
const TABLE_ID = "tbllr0ae0dLj1VIfN"

// 25 nombres reales con progreso inicial aleatorio
const FALLBACK_STUDENTS = [
  { id: "demo-1",  name: "Bautista M.",   cf: "green",  rl: "green",  o: "green"  },
  { id: "demo-2",  name: "Catalina F.",   cf: "yellow", rl: "green",  o: "yellow" },
  { id: "demo-3",  name: "Santino V.",    cf: "red",    rl: "red",    o: "yellow" },
  { id: "demo-4",  name: "Martina L.",    cf: "green",  rl: "green",  o: "yellow" },
  { id: "demo-5",  name: "Thiago R.",     cf: "yellow", rl: "red",    o: "yellow" },
  { id: "demo-6",  name: "Emma S.",       cf: "green",  rl: "yellow", o: "green"  },
  { id: "demo-7",  name: "Benicio A.",    cf: "red",    rl: "yellow", o: "red"    },
  { id: "demo-8",  name: "Olivia P.",     cf: "yellow", rl: "green",  o: "green"  },
  { id: "demo-9",  name: "Felipe G.",     cf: "green",  rl: "green",  o: "green"  },
  { id: "demo-10", name: "Valentina D.",  cf: "yellow", rl: "yellow", o: "yellow" },
  { id: "demo-11", name: "Mateo H.",      cf: "red",    rl: "yellow", o: "green"  },
  { id: "demo-12", name: "Delfina C.",    cf: "green",  rl: "green",  o: "yellow" },
  { id: "demo-13", name: "Lautaro B.",    cf: "yellow", rl: "red",    o: "red"    },
  { id: "demo-14", name: "Mia T.",        cf: "green",  rl: "yellow", o: "green"  },
  { id: "demo-15", name: "Joaquin E.",    cf: "yellow", rl: "green",  o: "yellow" },
  { id: "demo-16", name: "Sofia N.",      cf: "red",    rl: "red",    o: "yellow" },
  { id: "demo-17", name: "Nicolas O.",    cf: "green",  rl: "green",  o: "green"  },
  { id: "demo-18", name: "Isabella K.",   cf: "yellow", rl: "yellow", o: "green"  },
  { id: "demo-19", name: "Benjamin Z.",   cf: "red",    rl: "yellow", o: "yellow" },
  { id: "demo-20", name: "Lucia W.",      cf: "green",  rl: "green",  o: "yellow" },
  { id: "demo-21", name: "Tomas Q.",      cf: "yellow", rl: "red",    o: "green"  },
  { id: "demo-22", name: "Emilia J.",     cf: "green",  rl: "yellow", o: "green"  },
  { id: "demo-23", name: "Agustin I.",    cf: "yellow", rl: "green",  o: "yellow" },
  { id: "demo-24", name: "Alma U.",       cf: "red",    rl: "yellow", o: "red"    },
  { id: "demo-25", name: "Franco Y.",     cf: "green",  rl: "green",  o: "green"  },
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
