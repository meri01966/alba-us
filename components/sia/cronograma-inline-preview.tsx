"use client"

import { useState, useEffect } from "react"
import useSWR, { mutate as globalMutate } from "swr"
import { Calendar, ChevronRight, Sparkles, Music, Globe, Dumbbell, Monitor, BookOpen, Eye, Pencil, MessageSquare, X } from "lucide-react"
import { CronogramaVerModal } from "./cronograma-ver-modal"

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"] as const

type TipoClase = "musica" | "ingles" | "edFisica" | "computacion"

interface Actividad {
  nombre: string
  capacidades?: string
  contenidos?: string
  objetivo?: string
  desarrollo?: string
  materiales?: string
  alfabetizacion?: boolean
  origen?: "alba" | "docente" | "red"
  eje?: string
  evaluada?: boolean
}

interface DiaData {
  fecha: string
  recibimiento: string
  intercambio: string
  actividades: Actividad[]
  edFisica?: string
  musica?: string
  ingles?: string
}

interface ClaseEspecial {
  tipo: TipoClase
  dia: string
}

const CONFIG_CLASES: Record<TipoClase, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  musica:      { label: "Musica",      icon: Music,    color: "text-purple-700", bg: "bg-purple-100" },
  ingles:      { label: "Ingles",      icon: Globe,    color: "text-blue-700",   bg: "bg-blue-100" },
  edFisica:    { label: "Ed. Fisica",  icon: Dumbbell, color: "text-orange-700", bg: "bg-orange-100" },
  computacion: { label: "Computacion", icon: Monitor,  color: "text-teal-700",   bg: "bg-teal-100" },
}

// Los cuatro ejes con los colores que ya usa el resto de la app.
// Este color es IDENTIDAD del eje. El estado (evaluada / sin evaluar) se muestra
// aparte, en el fondo y el borde de la tarjeta.
const EJE_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  CF:        { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200" },
  CT:        { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  O:         { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
  Oralidad:  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
  E:         { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200" },
  EA:        { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200" },
  Escritura: { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200" },
}

// Un dia se considera pasado si su fecha es anterior a hoy (hora de Argentina)
function yaPaso(fecha: string): boolean {
  if (!fecha) return false
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
  return fecha < hoy
}

function getLunesSemana(): Date {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function formatearFechaCorta(fecha: string): string {
  if (!fecha) return ""
  const parts = fecha.split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${parseInt(parts[2])} ${meses[parseInt(parts[1]) - 1]}`
}

function esHoy(fecha: string): boolean {
  return fecha === new Date().toISOString().split("T")[0]
}

interface Props {
  sala: string
  onAbrirCompleto: () => void
  mensajesPendientes?: number
}

export function CronogramaInlinePreview({ sala, onAbrirCompleto, mensajesPendientes = 0 }: Props) {
  const [verModalOpen, setVerModalOpen] = useState(false)

  // Evaluar una actividad de un dia que ya paso y quedo sin evaluar.
  // Es una ventana propia: no toca el panel de evaluacion del dia de hoy.
  const [pendienteEval, setPendienteEval] = useState<{ nombre: string; eje: string; fecha: string; dia: string } | null>(null)
  const [alumnosEval, setAlumnosEval] = useState<any[]>([])
  const [marcasEval, setMarcasEval] = useState<Record<string, string>>({})
  const [guardandoEval, setGuardandoEval] = useState(false)
  const [errorEval, setErrorEval] = useState("")

  async function abrirEvaluarPasada(act: any, fechaDia: string, nombreDia: string) {
    setPendienteEval({ nombre: act.nombre, eje: act.eje || "CF", fecha: fechaDia, dia: nombreDia })
    setMarcasEval({})
    setErrorEval("")
    try {
      const r = await fetch(`/api/students?sala=${encodeURIComponent(sala)}`, { cache: "no-store" })
      const d = await r.json()
      setAlumnosEval(Array.isArray(d?.students) ? d.students : [])
    } catch (e) {
      console.error("[v0] Error trayendo alumnos:", e)
    }
  }

  async function guardarEvaluacionPasada() {
    if (!pendienteEval) return
    setGuardandoEval(true)
    setErrorEval("")
    const evaluaciones = alumnosEval.map((a: any) => ({
      alumno_id: a.id,
      estado: marcasEval[a.id] || "green",
    }))
    try {
      const res = await fetch("/api/seguimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sala,
          eje: pendienteEval.eje,
          actividad: pendienteEval.nombre,
          fecha: pendienteEval.fecha,   // la fecha del dia que corresponde
          evaluaciones,
        }),
      })
      const data = await res.json()
      if (!data?.ok) throw new Error("no se guardo")
      setPendienteEval(null)
      mutateCron()
    } catch (e) {
      console.error("[v0] Error guardando la evaluacion:", e)
      setErrorEval("No se pudo guardar. Revisa la conexion y proba de nuevo.")
    }
    setGuardandoEval(false)
  }

  // SWR: revalida automaticamente al volver a pestaña y al reconectar
  const cronKey = sala ? `/api/cronograma-jardin?sala=${encodeURIComponent(sala)}` : null
  const clasesKey = sala ? `/api/clases-especiales-maternal?sala=${encodeURIComponent(sala)}` : null
  const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then(r => r.json())

  const { data: cronData, isLoading: cronLoading, mutate: mutateCron } = useSWR(cronKey, fetcher, { revalidateOnFocus: true, revalidateOnReconnect: true })
  const { data: clasesData } = useSWR(clasesKey, fetcher, { revalidateOnFocus: true })

  // Derivar datos del SWR
  const lunes = getLunesSemana()
  const esViernes = new Date().getDay() === 5
  const cronogramaVacio: Record<string, DiaData> = Object.fromEntries(
    DIAS.map((dia, idx) => {
      const fecha = new Date(lunes); fecha.setDate(fecha.getDate() + idx)
      return [dia, { fecha: fecha.toISOString().split("T")[0], recibimiento: "", intercambio: "", actividades: [] }]
    })
  )

  const cronograma: Record<string, DiaData> =
    cronData?.ok && cronData?.cronograma && Object.keys(cronData.cronograma).length > 0
      ? cronData.cronograma
      : cronogramaVacio

  const hayDatos: boolean =
    typeof cronData?.hayRegistros === "boolean"
      ? cronData.hayRegistros
      : Object.values(cronograma).some(d => (d.actividades || []).some(a => (a.nombre || "").trim().length > 0))

  const clasesEspeciales: ClaseEspecial[] =
    clasesData?.ok && Array.isArray(clasesData.clases)
      ? clasesData.clases.map((c: { tipo: TipoClase; dia: string }) => ({ tipo: c.tipo, dia: c.dia }))
      : []

  const loading = cronLoading

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center py-8 gap-2">
        <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Cargando cronograma...</span>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: "#1e3a5f" }}>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">Cronograma Semanal</span>
            <span className="text-xs text-white/60 ml-1">— Sala {sala}</span>
          </div>
          <div className="flex items-center gap-2">
            {mensajesPendientes > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400 text-white text-xs font-bold">
                <MessageSquare className="w-3.5 h-3.5" />
                {mensajesPendientes}
              </div>
            )}
            {esViernes && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-400 text-white text-xs font-bold">
                <span className="animate-pulse">⭐️</span>
                Viernes: no olvides finalizar semana
              </div>
            )}
            {/* Boton VER — aparece solo cuando hay actividades guardadas */}
            {hayDatos && (
              <button
                type="button"
                onClick={() => setVerModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/15 hover:bg-white/25 text-white transition-colors"
                title="Ver planificacion completa de la semana"
              >
                <Eye className="w-3.5 h-3.5" />
                Ver
              </button>
            )}
            <button
              type="button"
              onClick={onAbrirCompleto}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              {hayDatos ? "Editar semana" : "Planificar semana"}
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 5 dias — SOLO TITULO de cada actividad */}
        {/* El detalle completo (desarrollo, materiales, objetivo, etc.) se ve solo al apretar "Ver" */}
        <div className="grid grid-cols-5 divide-x divide-slate-100">
          {DIAS.map((dia) => {
            const data = cronograma[dia]
            const fecha = data?.fecha || ""
            const hoy = esHoy(fecha)
            const clasesDelDia = clasesEspeciales.filter((c) => c.dia === dia)
            const actividades = (data?.actividades || []).filter((a) => (a.nombre || "").trim())
            const actAlba = actividades.find((a) => a.origen === "alba" || a.alfabetizacion)
            const actDocente = actividades.filter((a) => !(a.origen === "alba" || a.alfabetizacion))
            const ejeColor = actAlba?.eje ? (EJE_COLOR[actAlba.eje] ?? EJE_COLOR.CF) : EJE_COLOR.CF

            return (
              <div key={dia} className={`flex flex-col ${hoy ? "bg-blue-50/40" : "bg-white"}`}>
                {/* Cabecera del dia */}
                <div
                  className={`px-2 py-2 text-center border-b ${hoy ? "border-blue-300" : "border-slate-100"}`}
                  style={hoy ? { backgroundColor: "#1e3a5f" } : { backgroundColor: "#f8fafc" }}
                >
                  <p className={`text-[11px] font-bold tracking-wide ${hoy ? "text-white" : "text-slate-600"}`}>
                    {dia.substring(0, 3).toUpperCase()}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${hoy ? "text-blue-200" : "text-slate-400"}`}>
                    {formatearFechaCorta(fecha)}
                  </p>
                </div>

                {/* Clases especiales — iconos compactos */}
                {clasesDelDia.length > 0 && (
                  <div className="flex flex-wrap gap-1 px-2 pt-1.5">
                    {clasesDelDia.map((c) => {
                      const cfg = CONFIG_CLASES[c.tipo]
                      const Icon = cfg.icon
                      return (
                        <div key={c.tipo} className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${cfg.bg}`}>
                          <Icon className={`w-2.5 h-2.5 ${cfg.color}`} />
                          <span className={`text-[9px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Actividades — SOLO EL TITULO, sin ningun otro dato */}
                <div className="flex-1 px-2 py-2 space-y-1.5">
                  {/* Actividad de ALBA / alfabetizacion */}
                  {actAlba ? (
                    <button
                      type="button"
                      onClick={() => setVerModalOpen(true)}
                      className={`w-full text-left rounded-xl border-2 px-2 py-2 hover:opacity-80 transition-opacity ${
                        actAlba.evaluada === true
                          ? "border-green-500 bg-green-200"
                          : yaPaso(fecha)
                          ? "border-red-400 bg-red-200"
                          : "border-slate-200 bg-slate-50"
                      }`}
                      title={
                        actAlba.evaluada === true
                          ? "Evaluada"
                          : yaPaso(fecha)
                          ? "Ya paso y quedo sin evaluar"
                          : ""
                      }
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <Sparkles className={`w-2.5 h-2.5 flex-shrink-0 ${ejeColor.text}`} />
                        <span className={`text-[9px] font-bold uppercase tracking-wide ${ejeColor.text}`}>
                          {actAlba.eje ? actAlba.eje : "ALBA"}
                        </span>
                      </div>
                      {/* Solo nombre */}
                      <p className={`text-[11px] font-semibold leading-snug line-clamp-2 ${
                        actAlba.evaluada === true ? "text-green-900" : yaPaso(fecha) ? "text-red-900" : "text-slate-800"
                      }`}>
                        {actAlba.nombre}
                      </p>
                    </button>
                  ) : null}

                  {/* Quedo sin evaluar y el dia ya paso: se puede evaluar
                      ahora, y el registro queda con la fecha de ESE dia. */}
                  {actAlba && actAlba.evaluada !== true && yaPaso(fecha) && (
                    <button
                      type="button"
                      onClick={() => abrirEvaluarPasada(actAlba, fecha, dia)}
                      className="w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold py-1.5 transition-colors"
                    >
                      Evaluar ahora
                    </button>
                  )}

                  {!actAlba ? (
                    <button
                      type="button"
                      onClick={onAbrirCompleto}
                      className="w-full rounded-xl border border-dashed border-violet-200 px-2 py-2.5 text-center hover:border-violet-300 hover:bg-violet-50/50 transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-violet-300 mx-auto mb-0.5" />
                      <p className="text-[9px] text-violet-400 font-medium">Sin actividad ALBA</p>
                    </button>
                  ) : null}

                  {/* Actividades de la docente — solo titulo */}
                  {actDocente.map((act, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setVerModalOpen(true)}
                      className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <BookOpen className="w-2.5 h-2.5 flex-shrink-0 text-slate-400" />
                        <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Docente</span>
                      </div>
                      {/* Solo nombre */}
                      <p className="text-[11px] font-semibold text-slate-700 leading-snug line-clamp-2">
                        {act.nombre}
                      </p>
                    </button>
                  ))}

                  {/* Sin nada planificado */}
                  {!actAlba && actDocente.length === 0 && clasesDelDia.length === 0 && (
                    <button
                      type="button"
                      onClick={onAbrirCompleto}
                      className="w-full rounded-xl border border-dashed border-slate-200 px-2 py-4 text-center hover:border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      <p className="text-[9px] text-slate-400">Sin actividad</p>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Sin datos aun — invitacion a planificar */}
        {!hayDatos && (
          <div className="px-4 py-3 text-center border-t border-slate-100">
            <p className="text-xs text-slate-400">
              No hay actividades planificadas para esta semana.{" "}
              <button type="button" onClick={onAbrirCompleto} className="text-[#1e3a5f] font-semibold hover:underline">
                Planificar ahora
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Modal Ver — abre con todo el detalle completo, se cierra con X */}
      <CronogramaVerModal
        open={verModalOpen}
        onClose={() => setVerModalOpen(false)}
        sala={sala}
        cronograma={cronograma}
        clasesEspeciales={clasesEspeciales}
      />

      {/* Evaluar una actividad de un dia que ya paso. Ventana propia: guarda
          directo con la fecha de ese dia y no toca el panel de hoy. */}
      {pendienteEval && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setPendienteEval(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 flex items-start justify-between gap-3" style={{ backgroundColor: "#1e40af" }}>
              <div>
                <p className="text-white font-bold text-base leading-snug">{pendienteEval.nombre}</p>
                <p className="text-white/65 text-xs mt-1">
                  {pendienteEval.eje} · {pendienteEval.dia} {pendienteEval.fecha.slice(8,10)}/{pendienteEval.fecha.slice(5,7)}
                </p>
              </div>
              <button type="button" onClick={() => setPendienteEval(null)} className="text-white/80 hover:text-white shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
              <p className="text-xs text-slate-600">
                Marca solo a los que necesitaron apoyo o faltaron. El resto queda en logrado.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2">
              {alumnosEval.map((al: any) => {
                const m = marcasEval[al.id]
                const boton = (valor: string, texto: string, activo: any) => (
                  <button
                    type="button"
                    onClick={() => setMarcasEval((p) => {
                      const n = { ...p }
                      if (n[al.id] === valor) delete n[al.id]
                      else n[al.id] = valor
                      return n
                    })}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors"
                    style={m === valor ? activo : { backgroundColor: "#fff", borderColor: "#e2e8f0", color: "#64748b" }}
                  >
                    {texto}
                  </button>
                )
                return (
                  <div key={al.id} className="flex items-center gap-1.5 py-2 border-b border-slate-100">
                    <span className="flex-1 text-sm text-slate-800">{al.nombre}</span>
                    {boton("yellow", "En proceso", { backgroundColor: "#fef3c7", borderColor: "#f59e0b", color: "#92400e" })}
                    {boton("red", "Refuerzo", { backgroundColor: "#fee2e2", borderColor: "#ef4444", color: "#991b1b" })}
                    {boton("blue", "Ausente", { backgroundColor: "#dbeafe", borderColor: "#3b82f6", color: "#1e40af" })}
                  </div>
                )
              })}
            </div>

            {errorEval && (
              <p className="px-5 py-2 text-xs text-red-600 bg-red-50 border-t border-red-200">{errorEval}</p>
            )}

            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-3">
              <p className="text-[11px] text-slate-500">
                {alumnosEval.length - Object.keys(marcasEval).length} logrado
                {Object.values(marcasEval).filter((v) => v === "yellow").length > 0 && ` · ${Object.values(marcasEval).filter((v) => v === "yellow").length} en proceso`}
                {Object.values(marcasEval).filter((v) => v === "red").length > 0 && ` · ${Object.values(marcasEval).filter((v) => v === "red").length} refuerzo`}
                {Object.values(marcasEval).filter((v) => v === "blue").length > 0 && ` · ${Object.values(marcasEval).filter((v) => v === "blue").length} ausente`}
              </p>
              <button
                type="button"
                onClick={guardarEvaluacionPasada}
                disabled={guardandoEval || alumnosEval.length === 0}
                className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-50"
              >
                {guardandoEval ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
