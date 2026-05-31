"use client"

import { useState, useEffect } from "react"
import { X, NotebookPen, Calendar, Loader2, FolderOpen, ChevronDown, ChevronRight } from "lucide-react"

interface PlanificacionModalProps {
  isOpen: boolean
  onClose: () => void
  sala: string
}

interface Planificacion {
  id?: string
  fecha: string
  contenido_maestra: string
  eje: string
  estado: "pendiente" | "completada"
}

interface ActividadProyecto {
  id: string
  titulo: string
  objetivo: string
  desarrollo: string
  materiales: string
}

interface ProyectoFinalizado {
  id: string
  titulo: string
  objetivo_general: string
  actividades: ActividadProyecto[]
  created_at: string
  finalizado_at: string
}

const EJE_STYLES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  CF: { color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", label: "Conciencia Fonologica" },
  CT: { color: "#10b981", bg: "#ecfdf5", border: "#6ee7b7", label: "Comprension de Textos" },
  O:  { color: "#f59e0b", bg: "#fffbeb", border: "#fcd34d", label: "Oralidad" },
}

function ProyectoCard({ proyecto }: { proyecto: ProyectoFinalizado }) {
  const [expandido, setExpandido] = useState(false)
  const inicio = new Date(proyecto.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "short" })
  const fin    = new Date(proyecto.finalizado_at).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition text-left"
        onClick={() => setExpandido(v => !v)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{proyecto.titulo}</p>
            <p className="text-xs text-slate-500">{inicio} — {fin} &middot; {proyecto.actividades.length} actividad{proyecto.actividades.length !== 1 ? "es" : ""}</p>
          </div>
        </div>
        {expandido
          ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        }
      </button>

      {expandido && (
        <div className="p-4 space-y-3 border-t border-slate-100">
          {proyecto.objetivo_general && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Objetivo general</p>
              <p className="text-sm text-slate-700 leading-relaxed">{proyecto.objetivo_general}</p>
            </div>
          )}
          {proyecto.actividades.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Actividades</p>
              <div className="space-y-2">
                {proyecto.actividades.map((act, i) => (
                  <div key={act.id} className="bg-white rounded-lg border border-slate-100 p-3">
                    <p className="text-xs font-semibold text-primary mb-1">
                      {i + 1}. {act.titulo || `Actividad ${i + 1}`}
                    </p>
                    {act.objetivo && <p className="text-xs text-slate-600 mb-1"><span className="font-medium">Objetivo:</span> {act.objetivo}</p>}
                    {act.desarrollo && <p className="text-xs text-slate-700 leading-relaxed mb-1">{act.desarrollo}</p>}
                    {act.materiales && <p className="text-xs text-slate-500"><span className="font-medium">Materiales:</span> {act.materiales}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

type Tab = "proyectos" | "actividades"

export function PlanificacionModal({ isOpen, onClose, sala }: PlanificacionModalProps) {
  const [tab, setTab] = useState<Tab>("proyectos")
  const [planificaciones, setPlanificaciones]   = useState<Planificacion[]>([])
  const [proyectos, setProyectos]               = useState<ProyectoFinalizado[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) cargarDatos()
  }, [isOpen, sala])

  async function cargarDatos() {
    setLoading(true)
    try {
      const [resPlan, resProj] = await Promise.all([
        fetch(`/api/planificaciones?sala=${encodeURIComponent(sala)}`),
        fetch(`/api/proyectos?sala=${encodeURIComponent(sala)}`),
      ])
      if (resPlan.ok) {
        const d = await resPlan.json()
        setPlanificaciones(d.planificaciones || [])
      }
      if (resProj.ok) {
        const d = await resProj.json()
        setProyectos(d.historial || [])
      }
    } catch (e) {
      console.error("Error cargando planificaciones:", e)
    }
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ background: "#1e3a5f" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <NotebookPen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Mi Planificacion</h2>
              <p className="text-xs text-white/70">Proyectos y actividades registradas</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            className={`flex-1 py-3 text-sm font-medium transition ${tab === "proyectos" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700"}`}
            onClick={() => setTab("proyectos")}
          >
            Proyectos / Unidades
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium transition ${tab === "actividades" ? "text-primary border-b-2 border-primary" : "text-slate-500 hover:text-slate-700"}`}
            onClick={() => setTab("actividades")}
          >
            Actividades diarias
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : tab === "proyectos" ? (
            <div className="space-y-3">
              {proyectos.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No hay proyectos finalizados todavia</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Los proyectos aparecen aqui cuando los finalizas desde el tablero
                  </p>
                </div>
              ) : (
                proyectos.map(p => <ProyectoCard key={p.id} proyecto={p} />)
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Leyenda ejes */}
              <div className="flex gap-2 flex-wrap mb-1">
                {Object.entries(EJE_STYLES).map(([eje, s]) => (
                  <span
                    key={eje}
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                    style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                  >
                    {eje} — {s.label}
                  </span>
                ))}
              </div>
              {planificaciones.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium">No hay actividades guardadas todavia</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Las actividades aparecen aqui cuando guardas el cierre de jornada
                  </p>
                </div>
              ) : (
                planificaciones.map((p, i) => {
                  const estilo = EJE_STYLES[p.eje] || EJE_STYLES.CF
                  return (
                    <div
                      key={p.id || i}
                      className="rounded-xl p-4"
                      style={{ backgroundColor: estilo.bg, border: `2px solid ${estilo.border}` }}
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: estilo.color, color: "#fff" }}
                        >
                          {p.eje}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(p.fecha).toLocaleDateString("es-AR", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "#1e293b" }}>
                        {p.contenido_maestra}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

