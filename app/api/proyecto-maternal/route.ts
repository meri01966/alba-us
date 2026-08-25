import { NextResponse } from "next/server"
// La MISMA conexion que usa el resto del proyecto. Con una clave escrita a
// mano aca, este endpoint quedaba fuera de la familia de arreglos que ya se
// hicieron en registro-maternal, relatos-maternal, directora-resumen y
// sintesis-grupal — la misma inconsistencia que ya causo bugs silenciosos.
import { supabase } from "@/lib/supabase"

// GET - Obtener el proyecto de la sala.
//
// NO depende de que "estado" este bien marcado como "activo": si por
// cualquier motivo los proyectos de una sala quedaron todos en otro estado
// (paso en PRUEBA MATERNAL: los dos terminaron "finalizado" sin que nada
// quedara "activo"), la consulta vieja devolvia CERO FILAS y el endpoint
// respondia null, como si la sala no tuviera proyecto. Ahora se trae el mas
// reciente que NO este finalizado, sin exigir un valor exacto en "estado".
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala")

  if (!sala) {
    return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("proyectos_maternal")
    .select("*")
    .eq("sala", sala)
    .neq("estado", "finalizado")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("[v0] Error leyendo proyecto-maternal:", error.message, "| sala:", sala)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, proyecto: data || null })
}

// POST - Guardar proyecto.
// Actualiza el mas reciente no finalizado si existe; si no, inserta uno
// nuevo. Mismo criterio que el GET, para que los dos siempre coincidan.
export async function POST(req: Request) {
  const body = await req.json()
  const { sala, titulo, duracion, objetivo_general } = body

  if (!sala || !titulo) {
    return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 })
  }

  const { data: existente, error: errBuscar } = await supabase
    .from("proyectos_maternal")
    .select("id")
    .eq("sala", sala)
    .neq("estado", "finalizado")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (errBuscar) {
    console.error("[v0] Error buscando proyecto existente:", errBuscar.message)
  }

  const registro = {
    sala,
    titulo,
    duracion: duracion || "",
    objetivo_general: objetivo_general || "",
    updated_at: new Date().toISOString(),
  }

  let resultado
  if (existente?.id) {
    resultado = await supabase.from("proyectos_maternal").update(registro).eq("id", existente.id)
  } else {
    resultado = await supabase.from("proyectos_maternal").insert({ ...registro, estado: "activo" })
  }

  if (resultado.error) {
    console.error("[v0] Error guardando proyecto-maternal:", resultado.error.message)
    return NextResponse.json({ ok: false, error: resultado.error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

// PUT - Finalizar el proyecto en curso de la sala
export async function PUT(req: Request) {
  const body = await req.json()
  const { sala } = body

  if (!sala) {
    return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })
  }

  const { error } = await supabase
    .from("proyectos_maternal")
    .update({ estado: "finalizado", finalizado_at: new Date().toISOString() })
    .eq("sala", sala)
    .neq("estado", "finalizado")

  if (error) {
    console.error("[v0] Error finalizando proyecto-maternal:", error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
