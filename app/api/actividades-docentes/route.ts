// ALBA — Actividades de la docente (v2: carga por lote)
// La maestra pega su listado completo (del Drive, del cuaderno, de otra IA).
// ALBA lo desarma en actividades separadas y a cada una le asigna eje y capacidad.
// El texto original de cada una se guarda intacto: es la autoria de la docente.
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { generateText } from "ai"

const SUPABASE_URL = "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

const TABLA = "actividades_docentes"
const MAX_POR_LOTE = 8

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

export const dynamic = "force-dynamic"
export const revalidate = 0

// Vocabulario UNICO de ejes: CF / CT / O / E. Si otra parte del sistema usa
// "Escritura" o "EA", se traduce en el borde — aca se guarda siempre asi.
function normalizarEje(valor: string): "CF" | "CT" | "O" | "E" | null {
  const e = (valor || "").trim().toUpperCase()
  if (e === "CF") return "CF"
  if (e === "CT") return "CT"
  if (e === "O" || e === "ORALIDAD") return "O"
  if (e === "E" || e === "EA" || e === "LE" || e === "ESCRITURA") return "E"
  return null
}

// ── GET: actividades de una sala ────────────────────────────────────────────
// ?sala=X            -> todas
// ?sala=X&pendientes=1 -> solo las que ALBA todavia no uso
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala")
  const soloPendientes = searchParams.get("pendientes") === "1"

  if (!sala) return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })

  const supabase = getSupabase()
  let query = supabase
    .from(TABLA)
    .select("*")
    .eq("sala", sala)
    .order("created_at", { ascending: false })

  if (soloPendientes) query = query.eq("estado", "propia")

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error leyendo actividades_docentes:", error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, actividades: data || [] })
}

// ── POST: la maestra pega un listado, ALBA lo desarma ───────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sala, texto, proyecto } = body

    if (!sala || !texto || String(texto).trim().length < 15) {
      return NextResponse.json(
        { ok: false, error: "Falta la sala o el texto de las actividades." },
        { status: 400 }
      )
    }

    const textoCompleto = String(texto).trim().slice(0, 12000)

    const prompt = `Sos ALBA, asistente pedagogico de alfabetizacion inicial para salas de 4 y 5 anos (Diseno Curricular de Educacion Inicial, Ciudad de Buenos Aires).

Una maestra pego un LISTADO con varias actividades que ella ya usa en su sala. Tu tarea es SEPARARLAS y ORDENAR cada una. No las reescribas ni las "mejores": respetá su propuesta, su intencion y su nivel de detalle. Si una actividad viene muy escueta, completá solo lo minimo para que otra maestra pueda darla sin preguntarle nada.

${proyecto ? `Proyecto en curso de la sala: "${proyecto}"` : ""}

EJES (elegi exactamente uno por actividad):
- CF: Conciencia Fonologica — sonidos, rimas, silabas, fonemas
- CT: Comprension de Textos — cuentos, lectura dialogica, secuencias, preguntas sobre el texto
- O: Oralidad — conversacion, escucha, vocabulario, narracion oral, argumentacion
- E: Escritura — escribir el nombre, rotular, listas, frases, hipotesis de escritura

CAPACIDAD: una sola capacidad por actividad, redactada como ACCION OBSERVABLE que la maestra pueda evaluar mirando al nino. Empezá con un verbo en tercera persona del singular.
Ejemplos correctos: "Identifica el sonido inicial de una palabra", "Escribe su nombre con letras convencionales", "Reconstruye oralmente la secuencia de un cuento", "Anticipa el contenido de un texto a partir de las imagenes".
Ejemplos INCORRECTOS (no uses este estilo): "Trabajar la escritura", "Desarrollar el lenguaje", "Estimular la conciencia fonologica".

Devolve como MAXIMO ${MAX_POR_LOTE} actividades. Si el listado trae mas, quedate con las ${MAX_POR_LOTE} primeras.

LISTADO DE LA MAESTRA:
"""
${textoCompleto}
"""

Respondé SOLO con un array JSON, sin texto adicional ni backticks:
[
  {
    "nombre": "titulo corto y claro, maximo 6 palabras",
    "eje": "CF | CT | O | E",
    "capacidad": "accion observable que empieza con verbo",
    "objetivo": "que se busca que los ninos logren, una oracion",
    "desarrollo": "pasos concretos para darla en el aula, 2 a 4 pasos",
    "materiales": "lista breve separada por comas",
    "texto_original": "el fragmento exacto del listado que corresponde a esta actividad"
  }
]`

    let propuestas: Record<string, unknown>[] = []

    try {
      const result = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        maxOutputTokens: 3000,
        temperature: 0.3,
      })

      const t = result.text.trim()
      const jsonStr = t.startsWith("[") ? t : t.slice(t.indexOf("["), t.lastIndexOf("]") + 1)
      const parsed = JSON.parse(jsonStr)
      if (Array.isArray(parsed)) propuestas = parsed
    } catch (errIA) {
      console.error("[v0] Error desarmando listado:", errIA)
      return NextResponse.json(
        { ok: false, error: "ALBA no pudo leer el listado. Proba con menos actividades o revisá el formato." },
        { status: 502 }
      )
    }

    if (propuestas.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No se reconocio ninguna actividad en el texto." },
        { status: 422 }
      )
    }

    const filas = propuestas.slice(0, MAX_POR_LOTE).map((p) => {
      const nombre = String(p.nombre || "").trim().slice(0, 120)
      const original = String(p.texto_original || "").trim()
      return {
        sala,
        // Si la IA no devolvio el fragmento, guardamos el listado entero:
        // preferimos texto de mas antes que perder lo que escribio la maestra.
        texto_original: original.length > 5 ? original : textoCompleto,
        nombre: nombre || "Actividad sin titulo",
        eje: normalizarEje(String(p.eje || "")),
        capacidad: String(p.capacidad || "").trim() || null,
        objetivo: String(p.objetivo || "").trim() || null,
        desarrollo: String(p.desarrollo || "").trim() || null,
        materiales: String(p.materiales || "").trim() || null,
        estado: "propia",
        confirmada: true,
      }
    })

    const supabase = getSupabase()
    const { data, error } = await supabase.from(TABLA).insert(filas).select()

    if (error) {
      console.error("[v0] Error guardando actividades docentes:", error.message)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, cantidad: (data || []).length, actividades: data || [] })
  } catch (e) {
    console.error("[v0] Error en actividades-docentes POST:", e)
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
  }
}

// ── PATCH: corregir el eje, o marcar como usada cuando ALBA la toma ─────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, eje, estado } = body

    if (!id) return NextResponse.json({ ok: false, error: "Falta id" }, { status: 400 })

    const cambios: Record<string, unknown> = {}

    if (typeof eje === "string") {
      const ejeOk = normalizarEje(eje)
      if (!ejeOk) return NextResponse.json({ ok: false, error: "Eje invalido" }, { status: 400 })
      cambios.eje = ejeOk
    }

    // "usada" = ALBA ya la sugirio. Sale de la lista de pendientes pero NO se
    // borra: su evidencia es lo que despues permite indexarla y ruteo a la red.
    if (estado === "propia" || estado === "usada" || estado === "red") {
      cambios.estado = estado
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

// ── DELETE: la maestra borra una actividad de su repertorio ─────────────────
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ ok: false, error: "Falta id" }, { status: 400 })

  const supabase = getSupabase()
  const { error } = await supabase.from(TABLA).delete().eq("id", id)

  if (error) {
    console.error("[v0] Error borrando actividad docente:", error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
