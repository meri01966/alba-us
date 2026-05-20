"use client"

import { useState, useEffect } from "react"
import { X, NotebookPen, Sparkles, Calendar, Check, Loader2 } from "lucide-react"

interface PlanificacionModalProps {
  isOpen: boolean
  onClose: () => void
  sala: string
  sugerenciaAlba?: string
}

interface Planificacion {
  id?: string
  fecha: string
  contenido_maestra: string
  sugerencia_alba: string
  estado: "pendiente" | "completada"
}

export function PlanificacionModal({ isOpen, onClose, sala, sugerenciaAlba }: PlanificacionModalProps) {
  const [planificaciones, setPlanificaciones] = useState<Planificacion[]>([])
  const [contenido, setContenido] = useState("")
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)

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

  async function guardarPlanificacion() {
    if (!contenido.trim()) return
    setGuardando(true)
    try {
      const res = await fetch("/api/planificaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sala,
          contenido_maestra: contenido,
          sugerencia_alba: sugerenciaAlba || "",
        }),
      })
      if (res.ok) {
        setContenido("")
        cargarPlanificaciones()
        setActiveTab("historial")
      }
    } catch (e) {
      console.error("Error guardando planificacion:", e)
    }
    setGuardando(false)
  }

  async function marcarCompletada(id: string) {
    try {
      await fetch("/api/planificaciones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, estado: "completada" }),
      })
      cargarPlanificaciones()
    } catch (e) {
      console.error("Error actualizando planificacion:", e)
    }
  }

  if (!isOpen) return null

  const hoy = new Date().toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })

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
              <p className="text-xs text-white/80">{hoy}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content - siempre muestra input + historial */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Campo para escribir la planificacion del dia */}
          <div className="space-y-4 mb-6">
              {/* Sugerencia de ALBA */}
              {sugerenciaAlba && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-semibold text-amber-800">Sugerencia de ALBA</span>
                  </div>
                  <p className="text-sm text-amber-700">{sugerenciaAlba}</p>
                </div>
              )}

              {/* Input de la maestra */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Que tenes planeado para hoy?
                </label>
                <textarea
                  value={contenido}
                  onChange={(e) => setContenido(e.target.value)}
                  placeholder="Ej: Voy a trabajar rimas con animales, usando tarjetas ilustradas..."
                  className="w-full h-32 px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <button
                onClick={guardarPlanificacion}
                disabled={!contenido.trim() || guardando}
                className="w-full py-3 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {guardando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Guardar Planificacion
                  </>
                )}
              </button>

              {/* Separador y titulo historial */}
              {planificaciones.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-3">Historial de planificaciones</p>
                </div>
              )}
            </div>

          {/* Historial - siempre visible */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : planificaciones.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Todavia no guardaste ninguna planificacion</p>
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
                      {p.sugerencia_alba && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {p.sugerencia_alba}
                        </p>
                      )}
                    </div>
                    {p.estado !== "completada" && p.id && (
                      <button
                        onClick={() => marcarCompletada(p.id!)}
                        className="p-2 rounded-lg hover:bg-emerald-100 text-emerald-600"
                        title="Marcar como completada"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
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
