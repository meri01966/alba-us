"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, ChevronRight, Sparkles, Music, Globe, Dumbbell, Monitor, BookOpen } from "lucide-react"

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

function getLunesSemana(): Date {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function formatearFecha(fecha: string): string {
  if (!fecha) return ""
  const [, m, d] = fecha.split("-")
  return `${d}/${m}`
}

function esHoy(fecha: string): boolean {
  const hoy = new Date().toISOString().split("T")[0]
  return fecha === hoy
}

interface Props {
  sala: string
  onAbrirCompleto: () => void
}

export function CronogramaInlinePreview({ sala, onAbrirCompleto }: Props) {
  const [cronograma, setCronograma] = useState<Record<string, DiaData>>({})
  const [clasesEspeciales, setClasesEspeciales] = useState<ClaseEspecial[]>([])
  const [loading, setLoading] = useState(true)
  const [diaExpandido, setDiaExpandido] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    try {
      const [resCron, resClases] = await Promise.all([
        fetch(`${base}/api/cronograma-maternal?sala=${encodeURIComponent(sala)}`, { cache: "no-store" }),
        fetch(`${base}/api/clases-especiales-maternal?sala=${encodeURIComponent(sala)}`, { cache: "no-store" }),
      ])

      if (resCron.ok) {
        const data = await resCron.json()
        if (data.ok && data.cronograma && Object.keys(data.cronograma).length > 0) {
          setCronograma(data.cronograma)
        } else {
          // Inicializar con fechas de la semana actual
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
          setClasesEspeciales(dataC.clases.map((c: { tipo: TipoClase; dia: string }) => ({ tipo: c.tipo, dia: c.dia })))
        }
      }
    } catch (e) {
      console.error("[v0] Error cargando cronograma inline:", e)
    } finally {
      setLoading(false)
    }
  }, [sala])

  useEffect(() => { cargar() }, [cargar])

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b border-slate-100"
        style={{ backgroundColor: "#1e3a5f" }}
      >
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white" />
          <span className="text-sm font-bold text-white">Cronograma Semanal</span>
        </div>
        <button
          type="button"
          onClick={onAbrirCompleto}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          Editar semana
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid de 5 dias */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
          <span className="ml-2 text-xs text-slate-400">Cargando...</span>
        </div>
      ) : (
        <div className="grid grid-cols-5 divide-x divide-slate-100">
          {DIAS.map((dia) => {
            const data = cronograma[dia]
            const fecha = data?.fecha || ""
            const hoy = esHoy(fecha)
            const clasesDelDia = clasesEspeciales.filter(c => c.dia === dia)
            const actividades = data?.actividades?.filter(a => a.nombre?.trim()) || []
            const actAlfa = actividades.find(a => a.alfabetizacion)
            const actDocente = actividades.find(a => !a.alfabetizacion)
            const expandido = diaExpandido === dia

            return (
              <div
                key={dia}
                className={`flex flex-col min-h-[140px] transition-colors ${hoy ? "bg-blue-50/60" : "bg-white"}`}
              >
                {/* Cabecera del dia */}
                <div className={`px-2 py-2 border-b border-slate-100 ${hoy ? "bg-blue-600" : "bg-slate-50"}`}>
                  <p className={`text-[11px] font-bold text-center ${hoy ? "text-white" : "text-slate-600"}`}>
                    {dia.substring(0, 3).toUpperCase()}
                  </p>
                  <p className={`text-[10px] text-center ${hoy ? "text-blue-100" : "text-slate-400"}`}>
                    {formatearFecha(fecha)}
                  </p>
                </div>

                {/* Contenido del dia */}
                <div className="flex-1 px-1.5 py-2 space-y-1.5">
                  {/* Actividad de ALBA */}
                  {actAlfa ? (
                    <div className="rounded-lg overflow-hidden border border-violet-200">
                      <div className="flex items-center gap-1 px-1.5 py-1 bg-violet-100">
                        <Sparkles className="w-3 h-3 text-violet-600 flex-shrink-0" />
                        <span className="text-[9px] font-bold text-violet-700 truncate">ALBA</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setDiaExpandido(expandido ? null : dia)}
                        className="w-full text-left px-1.5 py-1 hover:bg-violet-50 transition-colors"
                      >
                        <p className="text-[10px] font-medium text-slate-700 leading-tight line-clamp-2">
                          {actAlfa.nombre}
                        </p>
                        <span className="text-[9px] text-violet-500 font-medium">
                          {expandido ? "Cerrar" : "Abrir"}
                        </span>
                      </button>

                      {/* Detalle expandido */}
                      {expandido && (
                        <div className="px-2 py-2 bg-white border-t border-violet-100 space-y-1.5">
                          {actAlfa.objetivo && (
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Objetivo</p>
                              <p className="text-[10px] text-slate-600 leading-snug">{actAlfa.objetivo}</p>
                            </div>
                          )}
                          {actAlfa.desarrollo && (
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Desarrollo</p>
                              <p className="text-[10px] text-slate-600 leading-snug">{actAlfa.desarrollo}</p>
                            </div>
                          )}
                          {actAlfa.materiales && (
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Materiales</p>
                              <p className="text-[10px] text-slate-600 leading-snug">{actAlfa.materiales}</p>
                            </div>
                          )}
                          {actAlfa.capacidades && (
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">Capacidades</p>
                              <p className="text-[10px] text-slate-600 leading-snug">{actAlfa.capacidades}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-violet-200 px-1.5 py-1.5 text-center">
                      <p className="text-[9px] text-violet-400">Sin actividad ALBA</p>
                    </div>
                  )}

                  {/* Actividad docente */}
                  {actDocente && (
                    <div className="rounded-lg border border-slate-200 overflow-hidden">
                      <div className="flex items-center gap-1 px-1.5 py-1 bg-slate-100">
                        <BookOpen className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <span className="text-[9px] font-bold text-slate-600 truncate">Docente</span>
                      </div>
                      <div className="px-1.5 py-1">
                        <p className="text-[10px] font-medium text-slate-700 leading-tight line-clamp-2">
                          {actDocente.nombre}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Clases especiales */}
                  {clasesDelDia.map((c) => {
                    const cfg = CONFIG_CLASES[c.tipo]
                    const Icon = cfg.icon
                    return (
                      <div key={c.tipo} className={`rounded-lg px-1.5 py-1 flex items-center gap-1 ${cfg.bg}`}>
                        <Icon className={`w-3 h-3 flex-shrink-0 ${cfg.color}`} />
                        <span className={`text-[9px] font-medium ${cfg.color} truncate`}>{cfg.label}</span>
                      </div>
                    )
                  })}

                  {/* Sin contenido */}
                  {!actAlfa && !actDocente && clasesDelDia.length === 0 && (
                    <button
                      type="button"
                      onClick={onAbrirCompleto}
                      className="w-full rounded-lg border border-dashed border-slate-200 px-1.5 py-3 text-center hover:border-slate-300 hover:bg-slate-50 transition-colors"
                    >
                      <p className="text-[9px] text-slate-400">Agregar</p>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
