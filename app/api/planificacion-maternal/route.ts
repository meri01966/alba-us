import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://oairchbitlanpzywncua.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"
)

const normSala = (s: string) => s.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9]/g, "")
const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]

// GET - Historial completo de planificacion (proyectos + semanas con actividades)
// Reune TODO lo planificado en la sala: tanto lo que sube la maestra como lo que
// sugiere ALBA, agrupado por semana, mas el historial de proyectos.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala")

  if (!sala) {
    return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })
  }

  const salaKey = normSala(sala)

  // 1. Proyectos (activos + finalizados), mas nuevo primero
  const { data: proyectosRaw } = await supabase
    .from("proyectos_maternal")
    .select("*")
    .order("created_at", { ascending: false })
  const proyectos = (proyectosRaw || [])
    .filter((p: any) => normSala(p.sala || "") === salaKey)
    .map((p: any) => ({
      id: p.id,
      titulo: p.titulo || "",
      objetivoGeneral: p.objetivo_general || "",
      duracion: p.duracion || "",
      estado: p.estado || "activo",
      creado: p.created_at || null,
      finalizado: p.finalizado_at || null,
    }))

  // 2. Cronogramas (todas las filas de la sala), agrupados por semana
  const { data: cronoRaw } = await supabase
    .from("cronograma_maternal")
    .select("*")
  const cronoSala = (cronoRaw || []).filter((r: any) => normSala(r.sala || "") === salaKey)

  const mapaSemanas: Record<string, any> = {}
  for (const r of cronoSala) {
    if (!mapaSemanas[r.semana_inicio]) {
      mapaSemanas[r.semana_inicio] = {
        semana_inicio: r.semana_inicio,
        finalizada: false,
        dias: {},
        _filas: [] as any[],
      }
    }
    mapaSemanas[r.semana_inicio].dias[r.dia] = {
      fecha: r.fecha,
      recibimiento: r.recibimiento || "",
      intercambio: r.intercambio || "",
      actividades: Array.isArray(r.actividades) ? r.actividades : [],
      edFisica: r.ed_fisica || "",
      musica: r.musica || "",
      ingles: r.ingles || "",
    }
    mapaSemanas[r.semana_inicio]._filas.push(r)
  }

  const semanas = Object.values(mapaSemanas)
    .map((sem: any) => {
      const filas = sem._filas as any[]
      const finalizada = filas.length > 0 && filas.every((f) => f.finalizado === true)
      // Contar actividades reales (con nombre) de la semana
      let totalActividades = 0
      for (const dia of DIAS) {
        const d = sem.dias[dia]
        if (!d) continue
        totalActividades += (d.actividades || []).filter((a: any) => (a?.nombre || "").trim().length > 0).length
      }
      return {
        semana_inicio: sem.semana_inicio,
        finalizada,
        totalActividades,
        dias: sem.dias,
      }
    })
    // Solo semanas que tienen al menos una actividad cargada
    .filter((s: any) => s.totalActividades > 0)
    .sort((a: any, b: any) => b.semana_inicio.localeCompare(a.semana_inicio))

  return NextResponse.json({
    ok: true,
    proyectos,
    semanas,
    totalProyectos: proyectos.length,
    totalSemanas: semanas.length,
  })
}
