// ALBA — Actividades de la docente
// La maestra pega texto libre (de su cuaderno, de una colega, de otra IA).
// ALBA lo lee, lo ordena y lo clasifica en un eje. Ella confirma o corrige.
// El texto original NUNCA se pisa: es la autoria de la docente.
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { generateText } from "ai"

const SUPABASE_URL = "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

const TABLA = "actividades_docentes"

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

export const dynamic = "force-dynamic"
export const revalidate = 0

// Vocabulario UNICO de ejes para esta tabla: CF / CT / O / E.
// Si alguna vez hay que hablarle a otra parte del sistema que usa "Escritura" o "EA",
// se traduce en el borde, no se guarda distinto.
const EJES_VALIDOS = ["CF", "CT", "O", "E"] as const

function normalizarEje(valor: string): "CF" | "CT" | "O" | "E" | null {
  const e = (valor || "").trim().toUpperCase()
  if (e === "CF") return "CF"
  if (e === "CT") return "CT"
  if (e === "O" || e === "ORALIDAD") return "O"
  if (e === "E" || e === "EA" || e === "LE" || e === "ESCRITURA") return "E"
  return null
}

// ── GET: actividades de una sala ────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala")
  if (!sala) return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from(TABLA)
    .select("*")
    .eq("sala", sala)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error leyendo actividades_docentes:", error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, actividades: data || [] })
}

// ── POST: la maestra pega texto, ALBA lo ordena y lo clasifica ──────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sala, texto, proyecto } = body

    if (!sala || !texto || String(texto).trim().length < 10) {
      return NextResponse.json(
        { ok: false, error: "Falta la sala o el texto de la actividad." },
        { status: 400 }
      )
    }

    const textoOriginal = String(texto).trim()

    // Valores de respaldo: si la IA falla, la actividad se guarda igual sin clasificar.
    let nombre = ""
    let eje: string | null = null
    let objetivo = ""
    let desarrollo = ""
    let materiales = ""

    const prompt = `Sos ALBA, asistente pedagogico de alfabetizacion inicial (salas de 4 y 5 anos, Buenos Aires, DC CABA 2025).

Una maestra pego el texto de una actividad que ella misma usa en su sala. Tu tarea es ORDENARLA, no reescribirla ni mejorarla: respetá su propuesta y su intencion. Si el texto es breve, completá lo minimo indispensable para que otra maestra pueda darla sin preguntarle nada.

${proyecto ? `Proyecto en curso de la sala: "${proyecto}"` : ""}

EJES POSIBLES (elegi exactamente uno):
- CF: Conciencia Fonologica (sonidos, rimas, silabas, fonemas)
- CT: Comprension de Textos (cuentos, lectura dialogica, secuencias, preguntas sobre el texto)
- O: Oralidad (conversacion, escucha, vocabulario, narracion oral, argumentacion)
- E: Escritura (escribir el nombre, rotular, listas, frases, hipotesis de escritura)

TEXTO DE LA MAESTRA:
"""
${textoOriginal}
"""

Respondé SOLO con este JSON, sin texto adicional ni backticks:
{
  "nombre": "titulo corto y claro de la actividad, maximo 6 palabras",
  "eje": "CF | CT | O | E",
  "objetivo": "que se busca que los ninos logren, una oracion",
  "desarrollo": "pasos concretos para darla en el aula, 2 a 4 pasos numerados",
  "materiales": "lista breve separada por comas"
}`

    try {
      const result = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        maxOutputTokens: 700,
        temperature: 0.4,
      })

      const texto2 = result.text.trim()
      const jsonStr = texto2.startsWith("{")
        ? texto2
        : texto2.slice(texto2.indexOf("{"), texto2.lastIndexOf("}") + 1)
      const parsed = JSON.parse(jsonStr)

      nombre = String(parsed.nombre || "").trim().slice(0, 120)
      eje = normalizarEje(String(parsed.eje || ""))
      objetivo = String(parsed.objetivo || "").trim()
      desarrollo = String(parsed.desarrollo || "").trim()
      materiales = String(parsed.materiales || "").trim()
    } catch (errIA) {
      console.error("[v0] Error clasificando actividad docente:", errIA)
      // Sin clasificar: se guarda igual y la maestra completa a mano.
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from(TABLA)
      .insert([{
        sala,
        texto_original: textoOriginal,
        nombre: nombre || null,
        eje: eje,
        objetivo: objetivo || null,
        desarrollo: desarrollo || null,
        materiales: materiales || null,
        estado: "propia",
        confirmada: false,
      }])
      .select()
      .single()

    if (error) {
      console.error("[v0] Error guardando actividad docente:", error.message)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, actividad: data, clasificada: !!eje })
  } catch (e) {
    console.error("[v0] Error en actividades-docentes POST:", e)
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
  }
}

// ── PATCH: la maestra confirma o corrige la clasificacion de ALBA ───────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, nombre, eje, objetivo, desarrollo, materiales, confirmada } = body

    if (!id) return NextResponse.json({ ok: false, error: "Falta id" }, { status: 400 })

    const cambios: Record<string, unknown> = {}
    if (typeof nombre === "string") cambios.nombre = nombre.trim().slice(0, 120)
    if (typeof objetivo === "string") cambios.objetivo = objetivo.trim()
    if (typeof desarrollo === "string") cambios.desarrollo = desarrollo.trim()
    if (typeof materiales === "string") cambios.materiales = materiales.trim()
    if (typeof confirmada === "boolean") cambios.confirmada = confirmada

    if (typeof eje === "string") {
      const ejeOk = normalizarEje(eje)
      if (!ejeOk) {
        return NextResponse.json(
          { ok: false, error: `Eje invalido. Valores: ${EJES_VALIDOS.join(", ")}` },
          { status: 400 }
        )
      }
      cambios.eje = ejeOk
    }

    if (Object.keys(cambios).length === 0) {
      return NextResponse.json({ ok: false, error: "Nada para actualizar" }, { status: 400 })
    }

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from(TABLA)
      .update(cambios)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error actualizando actividad docente:", error.message)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, actividad: data })
  } catch (e) {
    console.error("[v0] Error en actividades-docentes PATCH:", e)
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
  }
}
