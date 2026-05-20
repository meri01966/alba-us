"use client"

import { useState, useEffect } from "react"
import { X, NotebookPen, Calendar, Loader2, Sparkles } from "lucide-react"

interface PlanificacionModalProps {
  isOpen: boolean
  onClose: () => void
  sala: string
}

interface Planificacion {
  id?: string
  fecha: string
  contenido_maestra: string
  sugerencia_alba: string
  estado: "pendiente" | "completada"
}

// Este modal muestra el historial de planificaciones + sugerencia inteligente de ALBA
export function PlanificacionModal({ isOpen, onClose, sala }: PlanificacionModalProps) {
  const [planificaciones, setPlanificaciones] = useState<Planificacion[]>([])
  const [loading, setLoading] = useState(false)
  const [sugerenciaAlba, setSugerenciaAlba] = useState<string>("")
  const [loadingSugerencia, setLoadingSugerencia] = useState(false)

  useEffect(() => {
    if (isOpen) {
      cargarPlanificaciones()
      cargarSugerenciaAlba()
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

  async function cargarSugerenciaAlba() {
    setLoadingSugerencia(true)
    try {
      const res = await fetch(`/api/brain?sala=${encodeURIComponent(sala)}`)
      if (res.ok) {
        const data = await res.json()
        // Construir sugerencia basada en datos de la sala
        if (data.actividadSugerida) {
          const sugerencia = `Para hoy te sugiero: "${data.actividadSugerida}". ${data.microCapacitacion || ""}`
          setSugerenciaAlba(sugerencia)
        } else {
          setSugerenciaAlba("")
        }
      }
    } catch (e) {
      console.error("Error cargando sugerencia ALBA:", e)
      setSugerenciaAlba("")
    }
    setLoadingSugerencia(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <NotebookPen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Mi Planificacion</h2>
              <p className="text-xs text-white/80">Historial de actividades</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Sugerencia inteligente de ALBA */}
          {loadingSugerencia ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center gap-3">
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
              <span className="text-sm text-amber-700">Cargando sugerencia de ALBA...</span>
            </div>
          ) : sugerenciaAlba && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">Sugerencia de ALBA</span>
              </div>
              <p className="text-sm text-amber-700">{sugerenciaAlba}</p>
            </div>
          )}

          {/* Historial */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : planificaciones.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No hay planificaciones guardadas todavia</p>
                <p className="text-xs text-gray-400 mt-1">Usa la tarjeta &quot;Mi Planificacion&quot; en el tablero para agregar actividades</p>
              </div>
            ) : (
              planificaciones.map((p, i) => (
                <div
                  key={p.id || i}
                  className={`border rounded-xl p-4 ${
                    p.estado === "completada" ? "bg-gray-50 border-gray-200" : "bg-white border-emerald-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">
                          {new Date(p.fecha).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })}
                        </span>
                        {p.estado === "completada" && (
                          <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                            Completada
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800">{p.contenido_maestra}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
