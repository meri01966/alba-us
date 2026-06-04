import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sala = searchParams.get("sala")

  if (!sala) {
    return NextResponse.json({ ok: false, error: "Falta parametro sala" }, { status: 400 })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Cargar proyectos de la sala
    const { data: proyectos, error } = await supabase
      .from("proyectos")
      .select("*")
      .eq("sala", sala)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error cargando proyectos:", error)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    // Formatear proyectos para la respuesta
    const proyectosFormateados = (proyectos || []).map(p => {
      const actividades = Array.isArray(p.actividades) ? p.actividades : []
      const actividadesConDatos = actividades.filter((a: any) => a.titulo || a.objetivo || a.desarrollo)
      
      return {
        id: p.id,
        titulo: p.titulo || "Sin titulo",
        objetivoGeneral: p.objetivo_general || "",
        estado: p.estado || "activo",
        finalizado: p.estado === "finalizado" || p.finalizado_at !== null,
        finalizadoAt: p.finalizado_at,
        creadoAt: p.created_at,
        cantidadActividades: actividadesConDatos.length,
        actividades: actividadesConDatos.map((a: any, idx: number) => ({
          id: a.id || idx,
          titulo: a.titulo || `Actividad ${idx + 1}`,
          objetivo: a.objetivo || "",
          desarrollo: a.desarrollo || "",
          materiales: a.materiales || ""
        }))
      }
    })

    return NextResponse.json({
      ok: true,
      sala,
      totalProyectos: proyectosFormateados.length,
      proyectosActivos: proyectosFormateados.filter(p => !p.finalizado).length,
      proyectosFinalizados: proyectosFormateados.filter(p => p.finalizado).length,
      proyectos: proyectosFormateados
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache"
      }
    })

  } catch (err) {
    console.error("[v0] Error en proyectos-sala:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
