import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase-server"

export const dynamic = "force-dynamic"

// ── Types ──────────────────────────────────────────────────────────────────
export interface ActividadProyecto {
  id: string
  titulo: string
  objetivo: string
  desarrollo: string
  materiales: string
}

export interface Proyecto {
  id?: string
  sala: string
  titulo: string
  objetivo_general: string
  actividades: ActividadProyecto[]
  estado: "activo" | "finalizado"
  created_at?: string
  finalizado_at?: string | null
}

// ── GET — proyecto activo + historial ─────────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sala = searchParams.get("sala")
  if (!sala) return NextResponse.json({ error: "Sala requerida" }, { status: 400 })

  // Proyecto activo
  const { data: activo } = await supabaseServer
    .from("proyectos")
    .select("*")
    .eq("sala", sala)
    .eq("estado", "activo")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  // Historial finalizados (max 20)
  const { data: historial } = await supabaseServer
    .from("proyectos")
    .select("*")
    .eq("sala", sala)
    .eq("estado", "finalizado")
    .order("finalizado_at", { ascending: false })
    .limit(20)

  return NextResponse.json({
    activo: activo ?? null,
    historial: historial ?? [],
  })
}

// ── POST — guardar / actualizar proyecto activo ────────────────────────────
export async function POST(request: Request) {
  try {
    const body: Proyecto = await request.json()
    const { sala, titulo, objetivo_general, actividades, id } = body

    if (!sala || !titulo) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    if (id) {
      // Actualizar existente
      const { error } = await supabaseServer
        .from("proyectos")
        .update({ titulo, objetivo_general, actividades })
        .eq("id", id)
        .eq("sala", sala)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      // Insertar nuevo — primero marcar cualquier activo anterior como finalizado por seguridad
      await supabaseServer
        .from("proyectos")
        .update({ estado: "finalizado", finalizado_at: new Date().toISOString() })
        .eq("sala", sala)
        .eq("estado", "activo")

      const { error } = await supabaseServer
        .from("proyectos")
        .insert([{
          sala,
          titulo,
          objetivo_general: objetivo_general || "",
          actividades: actividades || [],
          estado: "activo",
          created_at: new Date().toISOString(),
        }])
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Devolver proyecto activo actualizado
    const { data: activo } = await supabaseServer
      .from("proyectos")
      .select("*")
      .eq("sala", sala)
      .eq("estado", "activo")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({ ok: true, activo })
  } catch (e) {
    console.error("[v0] Error en POST proyectos:", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}

// ── PATCH — finalizar proyecto activo ─────────────────────────────────────
export async function PATCH(request: Request) {
  try {
    const { sala, id } = await request.json()
    if (!sala || !id) return NextResponse.json({ error: "Faltan campos" }, { status: 400 })

    const { error } = await supabaseServer
      .from("proyectos")
      .update({ estado: "finalizado", finalizado_at: new Date().toISOString() })
      .eq("id", id)
      .eq("sala", sala)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[v0] Error en PATCH proyectos:", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
