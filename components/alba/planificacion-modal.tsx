"use client"

import { useState, useEffect } from "react"
import { X, NotebookPen, Calendar, Loader2 } from "lucide-react"

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

const EJE_STYLES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  CF: { color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe", label: "Conciencia Fonologica" },
  CT: { color: "#10b981", bg: "#ecfdf5", border: "#6ee7b7", label: "Comprension de Textos" },
  O:  { color: "#f59e0b", bg: "#fffbeb", border: "#fcd34d", label: "Oralidad" },
}

// Solo muestra las planificaciones que escribio la docente, coloreadas por eje
export function PlanificacionModal({ isOpen, onClose, sala }: PlanificacionModalProps) {
  const [planificaciones, setPlanificaciones] = useState<Planificacion[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      cargarPlanificaciones()
    }
  }, [isOpen, sala])

  async function cargarPlanificaciones() {
    setLoading(true)
    try {
      const res = await fetch(`/api/planificaciones?sala=${encodeURIComponent(sala)}`)
      if (res.ok) {
        const data = await res.json()
        setPlanificaciones(data.planificaciones || [])
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
              <p className="text-xs text-white/70">Actividades registradas por la docente</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Leyenda de ejes */}
        <div className="px-5 pt-4 pb-2 flex gap-3 flex-wrap border-b border-slate-100">
          {Object.entries(EJE_STYLES).map(([eje, s]) => (
            <span
              key={eje}
              className="text-xs font-semibold px-3 py-1 rounded-full"
              style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
            >
              {eje} — {s.label}
            </span>
          ))}
        </div>

        {/* Lista de planificaciones */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : planificaciones.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">No hay planificaciones guardadas todavia</p>
                <p className="text-xs text-gray-400 mt-1">
                  Usa la tarjeta &quot;Mi Planificacion&quot; en el tablero para agregar actividades
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
        </div>
      </div>
    </div>
  )
}

