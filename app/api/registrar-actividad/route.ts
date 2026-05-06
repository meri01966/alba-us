import { NextResponse } from "next/server"

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const BASE_ID        = process.env.AIRTABLE_BASE_ID || "appvmkxMrMWhGbclm"
// Uses the same students table — updates CF, RL or O on the existing record
const TABLE_ID       = process.env.AIRTABLE_TABLE_NAME_REGISTRO || "tbllr0ae0dLj1VIfN"

type ValidField  = "CF" | "RL" | "O"
type ValidStatus = "green" | "yellow" | "red"

const VALID_FIELDS:  ValidField[]  = ["CF", "RL", "O"]
const VALID_STATUSES: ValidStatus[] = ["green", "yellow", "red"]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, field, status } = body as {
      studentId: string
      field: string
      status: string
    }

    // Validate input
    if (!studentId || !field || !status) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: studentId, field, status" },
        { status: 400 }
      )
    }
    if (!VALID_FIELDS.includes(field as ValidField)) {
      return NextResponse.json(
        { error: `Campo inválido. Debe ser uno de: ${VALID_FIELDS.join(", ")}` },
        { status: 400 }
      )
    }
    if (!VALID_STATUSES.includes(status as ValidStatus)) {
      return NextResponse.json(
        { error: `Estado inválido. Debe ser: green, yellow o red` },
        { status: 400 }
      )
    }

    // If no token, return mock success so the UI still works in demo mode
    if (!AIRTABLE_TOKEN) {
      return NextResponse.json({ success: true, source: "demo" })
    }

    // PATCH the record in Airtable
    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${studentId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            [field]: status,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[v0] Airtable PATCH error:", response.status, errorData)
      return NextResponse.json(
        { error: "Error al actualizar en Airtable", details: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, record: data, source: "airtable" })

  } catch (error) {
    console.error("[v0] Error en registrar-actividad:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
