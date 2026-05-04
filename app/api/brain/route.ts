import { NextResponse } from "next/server"

const AIRTABLE_TOKEN  = process.env.AIRTABLE_TOKEN
const BASE_ID         = process.env.AIRTABLE_BASE_ID || "appvmkxMrMWhGbclm"
// Tabla del Cerebro Central — secuencia diaria predefinida
const TABLE_ID        = "tbllr0ae0dLj1VIfN"

interface AirtableRecord {
  id: string
  fields: Record<string, string | number>
}

// Actividad de demo para cuando no hay token o la API falla
const DEMO_BRAIN: BrainActivity = {
  id:          "demo",
  dia:         37,
  titulo:      "Sonido /p/",
  descripcion: "Presentar el fonema /p/ con imágenes de palabras que empiecen con ese sonido: pelota, pez, pato.",
  objetivo:    "Que los niños identifiquen y reproduzcan el sonido /p/ en posición inicial de palabra.",
  source:      "demo",
}

export interface BrainActivity {
  id:          string
  dia:         number
  titulo:      string
  descripcion: string
  objetivo:    string
  source:      "airtable" | "demo"
}

function recordToBrain(record: AirtableRecord): BrainActivity {
  const f = record.fields
  return {
    id:          record.id,
    dia:         typeof f["Dia"] === "number" ? f["Dia"] : Number(f["Dia"]) || 0,
    titulo:      String(f["Titulo"]      || f["titulo"]      || ""),
    descripcion: String(f["Descripcion"] || f["descripcion"] || f["Actividad"] || ""),
    objetivo:    String(f["Objetivo"]    || f["objetivo"]    || ""),
    source:      "airtable",
  }
}

export async function GET() {
  // Si no hay token, devolver demo silenciosamente
  if (!AIRTABLE_TOKEN) {
    return NextResponse.json({ activity: DEMO_BRAIN })
  }

  try {
    // Calcular el día actual (número de día del año, ajustable)
    const dayOfYear = Math.ceil(
      (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) /
        (1000 * 60 * 60 * 24)
    )

    // Intentar traer el registro que corresponde al día actual por campo "Dia"
    // Si no existe ese campo, traer el primer registro
    const filterFormula = encodeURIComponent(`{Dia}=${dayOfYear}`)
    const urlByDay = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?filterByFormula=${filterFormula}&maxRecords=1`

    let response = await fetch(urlByDay, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("[v0] Brain GET error:", response.status)
      return NextResponse.json({ activity: DEMO_BRAIN })
    }

    let data = await response.json()

    // Si no encontró para este día, traer el primer registro disponible
    if (!data.records || data.records.length === 0) {
      const urlFirst = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?maxRecords=1`
      const fallbackResp = await fetch(urlFirst, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })
      if (fallbackResp.ok) {
        data = await fallbackResp.json()
      }
    }

    if (!data.records || data.records.length === 0) {
      return NextResponse.json({ activity: DEMO_BRAIN })
    }

    return NextResponse.json({ activity: recordToBrain(data.records[0]) })
  } catch (err) {
    console.error("[v0] Error fetching brain activity:", err)
    return NextResponse.json({ activity: DEMO_BRAIN })
  }
}
