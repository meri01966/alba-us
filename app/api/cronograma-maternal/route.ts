import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://oairchbitlanpzywncua.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"
)

// Obtener lunes de la semana actual
// Hora de Argentina. Vercel corre en UTC: sin esto, despues de las 21 el
// servidor cree que ya es el dia siguiente.
function hoyEnBuenosAires(): Date {
  const ahora = new Date()
  const utcMs = ahora.getTime() + ahora.getTimezoneOffset() * 60000
  return new Date(utcMs - 3 * 60 * 60 * 1000)
}

// LA SEMANA LA DECIDE EL CALENDARIO, no las semanas pendientes.
// Lunes a viernes -> semana actual. Sabado y domingo -> semana siguiente.
// Misma regla que jardin: antes maternal saltaba a la semana siguiente cuando
// no encontraba pendientes, y como nunca cerraba semanas, se descontrolaba.
function lunesDeLaSemanaAMostrar(): Date {
  const hoy = hoyEnBuenosAires()
  const lunes = getLunesSemana(hoy)
  const dia = hoy.getDay()
  if (dia === 0 || dia === 6) lunes.setDate(lunes.getDate() + 7)
  return lunes
}

function getLunesSemana(fecha: Date): Date {
  const d = new Date(fecha)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]
const normSala = (s: string) => s.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9]/g, "")

// GET - Obtener cronograma de la semana actual, o historial de semanas finalizadas
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala")
  const historial = searchParams.get("historial") === "true"

  if (!sala) {
    return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })
  }

  // ── HISTORIAL: devuelve semanas finalizadas agrupadas por semana_inicio ────
  if (historial) {
    const normalizarSala = (s: string) => s.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9]/g, "")
    const salaKey = normalizarSala(sala)

    const { data: todos } = await supabase
      .from("cronograma_maternal")
      .select("id, sala, dia, semana_inicio, fecha, actividades, recibimiento, intercambio, finalizado")
      .eq("finalizado", true)
      .order("semana_inicio", { ascending: false })
      .limit(200)

    // Filtrar por sala normalizada en memoria
    const deSala = (todos || []).filter((r: any) => normalizarSala(r.sala || "") === salaKey)

    // Agrupar por semana_inicio
    const mapa: Record<string, any> = {}
    for (const r of deSala) {
      if (!mapa[r.semana_inicio]) {
        mapa[r.semana_inicio] = { id: r.semana_inicio, semana_inicio: r.semana_inicio, dias: {} }
      }
      mapa[r.semana_inicio].dias[r.dia] = {
        fecha: r.fecha,
        actividades: r.actividades || [],
        recibimiento: r.recibimiento || "",
        intercambio: r.intercambio || "",
      }
    }

    const semanas = Object.values(mapa).sort((a: any, b: any) =>
      b.semana_inicio.localeCompare(a.semana_inicio)
    )

    return NextResponse.json({ ok: true, historial: semanas })
  }
  
  // SEMANA A MOSTRAR (desacoplado del calendario):
  // Se busca la primera semana cargada de la sala que todavía NO esté finalizada.
  // Esa es la semana "activa" que ve la maestra. Si todas están finalizadas (o no hay
  // ninguna), se muestra una semana en blanco para cargar el próximo cronograma.
  const salaKey = normSala(sala)
  const { data: todosSala, error } = await supabase
    .from("cronograma_maternal")
    .select("*")

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  // Filtrar por sala normalizada en memoria
  const data = (todosSala || []).filter((r: any) => normSala(r.sala || "") === salaKey)

  // Semanas que aún tienen al menos un día sin finalizar
  const semanasPendientes = Array.from(
    new Set(
      data
        .filter((r: any) => r.finalizado !== true)
        .map((r: any) => r.semana_inicio as string)
    )
  ).sort((a, b) => a.localeCompare(b))

  let semanaUsada: string
  let lunesUsado: Date
  let mostrarEnBlanco = false

  // La semana la decide el calendario, siempre
  lunesUsado = lunesDeLaSemanaAMostrar()
  semanaUsada = lunesUsado.toISOString().split("T")[0]

  // ── CIERRE AUTOMATICO de las semanas que ya vencieron ─────────────────
  // Se dispara cuando alguien entra despues del corte, igual que jardin.
  // Lo que no se marco como realizado queda registrado como no hecho.
  try {
    const vencidas = (data || [])
      .filter((r: any) => r.finalizado !== true && String(r.semana_inicio) < semanaUsada)
      .map((r: any) => String(r.semana_inicio))
    const semanasACerrar = Array.from(new Set(vencidas))

    for (const sem of semanasACerrar) {
      const filasSem = (data || []).filter((r: any) => String(r.semana_inicio) === sem)

      for (const fila of filasSem) {
        const acts = Array.isArray(fila.actividades) ? fila.actividades : []
        const sinHacer = acts.filter(
          (a: any) => (a?.nombre || "").trim().length > 0 && a?.realizada !== true
        )
        for (const a of sinHacer) {
          const { data: yaEsta } = await supabase
            .from("registro_cierre")
            .select("id")
            .eq("sala", sala)
            .eq("actividad_alba", a.nombre)
            .eq("fecha", fila.fecha)
            .maybeSingle()
          if (yaEsta) continue

          await supabase.from("registro_cierre").insert([{
            fecha: fila.fecha,
            sala,
            eje: a.capacidadKey || a.eje || "COM",
            actividad_alba: a.nombre,
            actividad_docente: a.nombre,
            evaluacion_general: "no_realizada",
            observaciones: "Cierre automatico: la actividad no se marco como realizada.",
            stats: { green: 0, yellow: 0, red: 0, ausentes: 0 },
          }])
        }
      }

      await supabase
        .from("cronograma_maternal")
        .update({ finalizado: true, updated_at: new Date().toISOString() })
        .eq("sala", sala)
        .eq("semana_inicio", sem)
    }
  } catch (errCierre) {
    console.error("[v0] Error en el cierre automatico de maternal:", errCierre)
  }

  // Organizar por dia
  const cronograma: Record<string, any> = {}

  DIAS.forEach((dia, idx) => {
    const fecha = new Date(lunesUsado)
    fecha.setDate(fecha.getDate() + idx)
    const registro = mostrarEnBlanco
      ? undefined
      : data.find((d: any) => d.semana_inicio === semanaUsada && d.dia === dia)

    // Actividad vacia por defecto
    const actividadVacia = {
      nombre: "",
      capacidades: "",
      contenidos: "",
      objetivo: "",
      desarrollo: "",
      materiales: ""
    }

    cronograma[dia] = {
      fecha: fecha.toISOString().split("T")[0],
      recibimiento: registro?.recibimiento || "",
      intercambio: registro?.intercambio || "",
      actividades: registro?.actividades || [actividadVacia],
      edFisica: registro?.ed_fisica || "",
      musica: registro?.musica || "",
      ingles: registro?.ingles || ""
    }
  })

  // hayRegistros = true si al menos un dia tiene actividad real guardada
  const hayRegistros = !mostrarEnBlanco && data.some(
    (r: any) => r.semana_inicio === semanaUsada &&
      Array.isArray(r.actividades) && r.actividades.some((a: any) => (a.nombre || "").trim().length > 0)
  )

  return NextResponse.json({ ok: true, cronograma, semanaInicio: semanaUsada, hayRegistros })
}

// POST - Guardar cronograma
export async function POST(req: Request) {
  const body = await req.json()
  const { sala, cronograma } = body
  
  if (!sala || !cronograma) {
    return NextResponse.json({ ok: false, error: "Faltan datos" }, { status: 400 })
  }

  // PROTECCION: si el cronograma entero llega SIN contenido, se rechaza.
  // Evita que un guardado vacio —por una carga fallida en la pantalla— borre
  // toda la semana. Jardin ya tenia esta proteccion; maternal no.
  const tieneAlgo = DIAS.some((d) => {
    const dia = cronograma[d]
    if (!dia) return false
    if ((dia.intercambio || "").trim()) return true
    return Array.isArray(dia.actividades) && dia.actividades.some((a: any) => (a?.nombre || "").trim())
  })
  if (!tieneAlgo && !body.permitirVacio) {
    return NextResponse.json({ ok: true, ignorado: "cronograma vacio" })
  }

  // Determinar la semana ACTIVA de la sala (desacoplado del calendario):
  // se guarda en la primera semana cargada que aún no esté finalizada. Si no hay
  // ninguna pendiente, se crea una semana nueva a partir del próximo lunes.
  const salaKey = normSala(sala)
  const { data: todosSala } = await supabase.from("cronograma_maternal").select("semana_inicio, finalizado, sala")
  const deSala = (todosSala || []).filter((r: any) => normSala(r.sala || "") === salaKey)
  const pendientes = Array.from(
    new Set(deSala.filter((r: any) => r.finalizado !== true).map((r: any) => r.semana_inicio as string))
  ).sort((a, b) => a.localeCompare(b))

  // Se guarda en la MISMA semana que muestra el GET: la del calendario.
  // Antes el POST podia escribir en una semana distinta a la que se veia.
  const lunesSemana: Date = body.semana_inicio
    ? new Date(String(body.semana_inicio) + "T00:00:00")
    : lunesDeLaSemanaAMostrar()
  const lunesStr: string = lunesSemana.toISOString().split("T")[0]

  const dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]
  
  // Guardar cada dia
  for (let idx = 0; idx < dias.length; idx++) {
    const dia = dias[idx]
    const datosDia = cronograma[dia]
    if (!datosDia) continue
    
    const fecha = new Date(lunesSemana)
    fecha.setDate(fecha.getDate() + idx)
    
    // Buscar si ya existe
    const { data: existente } = await supabase
      .from("cronograma_maternal")
      .select("id, actividades")
      .eq("sala", sala)
      .eq("semana_inicio", lunesStr)
      .eq("dia", dia)
      .maybeSingle()
    
    // No pisar un dia que tiene contenido con uno vacio, salvo que se
    // este vaciando a proposito (borrar o mover una actividad).
    const nuevoTieneAlgo =
      (datosDia.intercambio || "").trim() ||
      (Array.isArray(datosDia.actividades) && datosDia.actividades.some((a: any) => (a?.nombre || "").trim()))
    const viejoTeniaAlgo =
      Array.isArray(existente?.actividades) &&
      existente.actividades.some((a: any) => (a?.nombre || "").trim())
    if (!nuevoTieneAlgo && viejoTeniaAlgo && !body.permitirVacio) continue

    const registro = {
      sala,
      semana_inicio: lunesStr,
      dia,
      fecha: fecha.toISOString().split("T")[0],
      recibimiento: datosDia.recibimiento || "",
      intercambio: datosDia.intercambio || "",
      actividades: datosDia.actividades || [],
      ed_fisica: datosDia.edFisica || "",
      musica: datosDia.musica || "",
      ingles: datosDia.ingles || "",
      finalizado: false,
      updated_at: new Date().toISOString()
    }
    
    if (existente?.id) {
      await supabase.from("cronograma_maternal").update(registro).eq("id", existente.id)
    } else {
      await supabase.from("cronograma_maternal").insert(registro)
    }
  }
  
  return NextResponse.json({ ok: true })
}

// PUT - Finalizar semana
export async function PUT(req: Request) {
  const body = await req.json()
  const { sala } = body
  
  if (!sala) {
    return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })
  }

  // Finalizar la semana ACTIVA de la sala (la primera sin finalizar), no la de hoy.
  const salaKey = normSala(sala)
  const { data: todosSala } = await supabase.from("cronograma_maternal").select("semana_inicio, finalizado, sala")
  const deSala = (todosSala || []).filter((r: any) => normSala(r.sala || "") === salaKey)
  const pendientes = Array.from(
    new Set(deSala.filter((r: any) => r.finalizado !== true).map((r: any) => r.semana_inicio as string))
  ).sort((a, b) => a.localeCompare(b))

  if (pendientes.length === 0) {
    return NextResponse.json({ ok: true, sinSemanaActiva: true })
  }

  const semanaActiva = pendientes[0]

  // Marcar como finalizado (queda en el historial) por sala normalizada
  const idsAFinalizar = (todosSala || [])
    .filter((r: any) => normSala(r.sala || "") === salaKey && r.semana_inicio === semanaActiva)

  await supabase
    .from("cronograma_maternal")
    .update({ finalizado: true })
    .eq("semana_inicio", semanaActiva)
    .in("sala", Array.from(new Set(idsAFinalizar.map((r: any) => r.sala))))
  
  return NextResponse.json({ ok: true, semanaFinalizada: semanaActiva })
}
