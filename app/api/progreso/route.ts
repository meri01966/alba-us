import { NextResponse } from "next/server"
import { getServerClient } from "@/lib/supabase"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala") || "Manzanos"

  try {
    const supabase = getServerClient()

    const { data: alumnos } = await supabase
      .from("alumnos")
      .select("id, nombre")
      .eq("sala", sala)

    if (!alumnos || alumnos.length === 0) {
      return NextResponse.json({ alumnos: [], progreso: {} })
    }

    const ids = alumnos.map(a => a.id)
    const { data: regs } = await supabase
      .from("seguimiento")
      .select("*")
      .in("alumno_id", ids)
      .order("fecha", { ascending: true })

    const progreso: Record<string, { CF: number; CT: number; O: number }> = {}
    for (const al of alumnos) {
      const mios = (regs || []).filter(r => r.alumno_id === al.id)
      const getUlt = (eje: string) => {
        const e = mios.filter(r => r.eje === eje).pop()
        if (!e) return 0
        if (e.resultado === "green") return 100
        if (e.resultado === "yellow") return 50
        return 10
      }
      progreso[al.id] = { CF: getUlt("CF"), CT: getUlt("CT"), O: getUlt("O") }
    }

    return NextResponse.json({ alumnos, progreso })
  } catch (err) {
    console.error("Error en progreso:", err)
    return NextResponse.json({ alumnos: [], progreso: {} })
  }
}
