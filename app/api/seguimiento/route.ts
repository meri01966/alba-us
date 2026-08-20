import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // ── GUARDADO EN LOTE ──────────────────────────────────────────────────
    // Antes la pantalla mandaba UNA llamada por alumno: con 27 chicos eran 27
    // llamadas en fila, y con internet mala cada una podia fallar en silencio.
    // Ahora vienen todas juntas y se responde cuantas se guardaron.
    if (Array.isArray(body.evaluaciones)) {
      const { sala, eje, actividad, evaluaciones } = body
      // Fecha opcional: cuando se evalua una actividad de un dia que ya paso,
      // el registro tiene que quedar con LA FECHA DE ESE DIA, no la de hoy.
      const fechaPedida = typeof body.fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.fecha)
        ? body.fecha
        : null
      if (!sala || !eje || evaluaciones.length === 0) {
        return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
      }

      const now = fechaPedida ? `${fechaPedida}T12:00:00.000Z` : new Date().toISOString()
      const today = now.split("T")[0]
      const ids = evaluaciones.map((e: any) => e.alumno_id).filter(Boolean)

      // Los que ya tienen registro hoy en este eje: se actualizan
      const { data: yaEstan } = await supabase
        .from("seguimiento")
        .select("id, alumno_id")
        .in("alumno_id", ids)
        .eq("eje", eje)
        .gte("fecha", `${today}T00:00:00`)
        .lte("fecha", `${today}T23:59:59`)

      const idPorAlumno: Record<string, string> = {}
      ;(yaEstan || []).forEach((r: any) => { idPorAlumno[r.alumno_id] = r.id })

      let guardadas = 0
      const fallidas: string[] = []

      // Los nuevos, todos en una sola insercion
      const nuevos = evaluaciones
        .filter((e: any) => e.alumno_id && !idPorAlumno[e.alumno_id])
        .map((e: any) => ({
          alumno_id: e.alumno_id,
          eje,
          estado: e.estado,
          sala,
          actividad: actividad ?? null,
          fecha: now,
        }))

      if (nuevos.length > 0) {
        const { error } = await supabase.from("seguimiento").insert(nuevos)
        if (error) {
          console.error("[v0] Error insertando el lote:", error.message)
          nuevos.forEach((n: any) => fallidas.push(n.alumno_id))
        } else {
          guardadas += nuevos.length
        }
      }

      // Los que ya existian, se actualizan uno por uno (son pocos)
      for (const e of evaluaciones) {
        const id = idPorAlumno[e.alumno_id]
        if (!id) continue
        const { error } = await supabase
          .from("seguimiento")
          .update({ estado: e.estado, actividad: actividad ?? null, fecha: now })
          .eq("id", id)
        if (error) fallidas.push(e.alumno_id)
        else guardadas += 1
      }

      return NextResponse.json({
        ok: fallidas.length === 0,
        guardadas,
        fallidas,
        total: evaluaciones.length,
      })
    }

    const { alumno_id, eje, estado, sala, actividad } = body

    if (!alumno_id || !eje || !estado || !sala) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const now   = new Date().toISOString()
    const today = now.split("T")[0]

    // Un registro por alumno+eje por dia — upsert segun rango de fecha
    const { data: existing } = await supabase
      .from("seguimiento")
      .select("id")
      .eq("alumno_id", alumno_id)
      .eq("eje", eje)
      .gte("fecha", `${today}T00:00:00`)
      .lte("fecha", `${today}T23:59:59`)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from("seguimiento")
        .update({ estado, actividad: actividad ?? null, fecha: now })
        .eq("id", existing.id)
      if (error) {
        console.error("[v0] Error actualizando seguimiento:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    } else {
      const { error } = await supabase.from("seguimiento").insert([{
        alumno_id,
        eje,
        estado,
        sala,
        actividad: actividad ?? null,
        fecha: now,
      }])
      if (error) {
        console.error("[v0] Error insertando seguimiento:", error.message)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[v0] Error en seguimiento:", e)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
