"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, ChevronRight, Sparkles, Music, Globe, Dumbbell, Monitor, BookOpen, Eye, Pencil, MessageSquare } from "lucide-react"
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
  origen?: "alba" | "docente"
  eje?: string
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

const EJE_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  CF:        { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200" },
  CT:        { bg: "bg-sky-50",     text: "text-sky-700",     border: "border-sky-200" },
  Escritura: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
}

function getLunesSemana(): Date {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function formatearFechaCompleta(fecha: string): string {
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
  const [cronograma, setCronograma] = useState<Record<string, DiaData>>({})
  const [clasesEspeciales, setClasesEspeciales] = useState<ClaseEspecial[]>([])
  const [loading, setLoading] = useState(true)
  const [hayDatos, setHayDatos] = useState(false)
  const [verModalOpen, setVerModalOpen] = useState(false)

  const cargar = useCallback(async () => {
    if (!sala) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [resCron, resClases] = await Promise.all([
        fetch(`/api/cronograma-maternal?sala=${encodeURIComponent(sala)}`, { cache: "no-store" }),
        fetch(`/api/clases-especiales-maternal?sala=${encodeURIComponent(sala)}`, { cache: "no-store" }),
      ])

      if (resCron.ok) {
        const data = await resCron.json()
        if (data.ok && data.cronograma && Object.keys(data.cronograma).length > 0) {
          setCronograma(data.cronograma)
          // Usar hayRegistros del servidor si está disponible, sino calcular localmente
          if (typeof data.hayRegistros === "boolean") {
            setHayDatos(data.hayRegistros)
          } else {
            const tieneActividades = Object.values(data.cronograma as Record<string, DiaData>).some(
              (d) => (d.actividades || []).some((a) => (a.nombre || "").trim().length > 0)
            )
            setHayDatos(tieneActividades)
          }
        } else {
          const lunes = getLunesSemana()
          const nuevo: Record<string, DiaData> = {}
          DIAS.forEach((dia, idx) => {
            const fecha = new Date(lunes)
            fecha.setDate(fecha.getDate() + idx)
            nuevo[dia] = { fecha: fecha.toISOString().split("T")[0], recibimiento: "", intercambio: "", actividades: [] }
          })
          setCronograma(nuevo)
        }
      }

      if (resClases.ok) {
        const dataC = await resClases.json()
        if (dataC.ok && Array.isArray(dataC.clases)) {
          setClasesEspeciales(
            dataC.clases.map((c: { tipo: TipoClase; dia: string }) => ({ tipo: c.tipo, dia: c.dia }))
          )
        }
      }
    } catch (e) {
      console.error("[v0] Error cargando cronograma inline:", e)
    } finally {
      setLoading(false)
    }
  }, [sala])

  useEffect(() => { cargar() }, [cargar])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center py-8 gap-2">
        <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Cargando cronograma...</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: "#1e3a5f" }}
      >
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
          {hayDatos && (
            <button
              type="button"
              onClick={() => setVerModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/15 hover:bg-white/25 text-white transition-colors"
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

      {/* 5 dias — solo titulos. Para ver detalles usar boton "Ver" */}
      <div className="grid grid-cols-5 divide-x divide-slate-100">
        {DIAS.map((dia) => {
          const data = cronograma[dia]
          const fecha = data?.fecha || ""
          const hoy = esHoy(fecha)
          const clasesDelDia = clasesEspeciales.filter((c) => c.dia === dia)
          const actividades = data?.actividades?.filter((a) => a.nombre?.trim()) || []
          const actAlba = actividades.find((a) => a.origen === "alba" || a.alfabetizacion)
          const actDocente = actividades.filter((a) => a.origen !== "alba" && !a.alfabetizacion)
          const ejeColor = actAlba?.eje ? (EJE_COLOR[actAlba.eje] || EJE_COLOR.CF) : EJE_COLOR.CF

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
                  {formatearFechaCompleta(fecha)}
                </p>
              </div>

              {/* Clases especiales */}
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

              {/* Actividades — SOLO TITULO */}
              <div className="flex-1 px-2 py-2 space-y-1.5">
                {actAlba ? (
                  <button
                    type="button"
                    onClick={() => setVerModalOpen(true)}
                    className={`w-full text-left rounded-xl border ${ejeColor.border} ${ejeColor.bg} px-2 py-2 hover:opacity-80 transition-opacity`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles className={`w-2.5 h-2.5 flex-shrink-0 ${ejeColor.text}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wide ${ejeColor.text}`}>
                        ALBA{actAlba.eje ? ` — ${actAlba.eje}` : ""}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-800 leading-snug">{actAlba.nombre}</p>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onAbrirCompleto}
                    className="w-full rounded-xl border border-dashed border-violet-200 px-2 py-2.5 text-center hover:border-violet-300 hover:bg-violet-50/50 transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-violet-300 mx-auto mb-0.5" />
                    <p className="text-[9px] text-violet-400 font-medium">Planificar con ALBA</p>
                  </button>
                )}

                {actDocente.map((act, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setVerModalOpen(true)}
                    className="w-full text-left rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <BookOpen className="w-2.5 h-2.5 flex-shrink-0 text-slate-400" />
                      <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Docente</span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-700 leading-snug">{act.nombre}</p>
                  </button>
                ))}

                {!actAlba && actDocente.length === 0 && clasesDelDia.length === 0 && (
                  <button
                    type="button"
                    onClick={onAbrirCompleto}
                    className="w-full rounded-xl border border-dashed border-slate-200 px-2 py-4 text-center hover:border-slate-300 hover:bg-slate-50 transition-colors"
                  >
                    <p className="text-[9px] text-slate-400">Sin actividad</p>
                    <p className="text-[9px] text-slate-300">Planificar semana</p>
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Ver — cronograma completo con todos los detalles */}
      <CronogramaVerModal
        open={verModalOpen}
        onClose={() => setVerModalOpen(false)}
        sala={sala}
        cronograma={cronograma}
        clasesEspeciales={clasesEspeciales}
      />
    </div>
  )
}
