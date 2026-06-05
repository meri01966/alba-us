"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, X, Plus, Check, Save } from "lucide-react"

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"] as const

interface Actividad {
  nombre: string
  capacidades: string
  contenidos: string
  objetivo: string
  desarrollo: string
  materiales: string
}

interface DiaData {
  fecha: string
  recibimiento: string
  intercambio: string
  actividades: Actividad[]
  edFisica: string
  musica: string
  ingles: string
}

const actividadVacia: Actividad = {
  nombre: "",
  capacidades: "",
  contenidos: "",
  objetivo: "",
  desarrollo: "",
  materiales: "",
}

function getLunesSemana(): Date {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function formatearFecha(fecha: string): string {
  if (!fecha) return ""
  const [y, m, d] = fecha.split("-")
  return `${d}/${m}`
}

interface CronogramaSemanalProps {
  isOpen: boolean
  onClose: () => void
  sala: string
}

export function CronogramaSemanal({ isOpen, onClose, sala }: CronogramaSemanalProps) {
  const [cronograma, setCronograma] = useState<Record<string, DiaData>>({})
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardadoOk, setGuardadoOk] = useState(false)

  const inicializarCronograma = useCallback(() => {
    const lunes = getLunesSemana()
    const nuevo: Record<string, DiaData> = {}
    DIAS.forEach((dia, idx) => {
      const fecha = new Date(lunes)
      fecha.setDate(fecha.getDate() + idx)
      nuevo[dia] = {
        fecha: fecha.toISOString().split("T")[0],
        recibimiento: "",
        intercambio: "",
        actividades: [{ ...actividadVacia }],
        edFisica: "",
        musica: "",
        ingles: "",
      }
    })
    return nuevo
  }, [])

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    try {
      const res = await fetch(`${base}/api/cronograma-maternal?sala=${encodeURIComponent(sala)}`, { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        if (data.ok && data.cronograma && Object.keys(data.cronograma).length > 0) {
          setCronograma(data.cronograma)
        } else {
          setCronograma(inicializarCronograma())
        }
      } else {
        setCronograma(inicializarCronograma())
      }
    } catch (e) {
      console.error("[v0] Error cargando cronograma 4/5:", e)
      setCronograma(inicializarCronograma())
    }
    setLoading(false)
  }, [sala, inicializarCronograma])

  useEffect(() => {
    if (isOpen) {
      cargarDatos()
    }
  }, [isOpen, cargarDatos])

  async function guardarCronograma() {
    setGuardando(true)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    try {
      const res = await fetch(`${base}/api/cronograma-maternal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala, cronograma }),
      })
      if (res.ok) {
        setGuardadoOk(true)
        setTimeout(() => setGuardadoOk(false), 2500)
      }
    } catch (e) {
      console.error("[v0] Error guardando cronograma 4/5:", e)
    }
    setGuardando(false)
  }

  function actualizarCampo(dia: string, campo: keyof DiaData, valor: string) {
    setCronograma((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], [campo]: valor },
    }))
  }

  function actualizarActividad(dia: string, index: number, campo: keyof Actividad, valor: string) {
    setCronograma((prev) => {
      const nuevasActividades = [...prev[dia].actividades]
      nuevasActividades[index] = { ...nuevasActividades[index], [campo]: valor }
      return { ...prev, [dia]: { ...prev[dia], actividades: nuevasActividades } }
    })
  }

  function agregarActividad(dia: string) {
    setCronograma((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], actividades: [...prev[dia].actividades, { ...actividadVacia }] },
    }))
  }

  function eliminarActividad(dia: string, index: number) {
    setCronograma((prev) => {
      const nuevasActividades = prev[dia].actividades.filter((_, i) => i !== index)
      return { ...prev, [dia]: { ...prev[dia], actividades: nuevasActividades.length ? nuevasActividades : [{ ...actividadVacia }] } }
    })
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl my-4 max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between rounded-t-2xl flex-shrink-0" style={{ background: "#1e3a5f" }}>
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Cronograma Semanal</h2>
              <p className="text-xs text-white/70">Sala {sala}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={guardarCronograma}
              disabled={guardando}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {guardando ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : guardadoOk ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {guardadoOk ? "Guardado" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              Cerrar
            </button>
          </div>
        </div>

        {/* Contenido - 5 dias */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-slate-300 border-t-[#1e3a5f] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 overflow-y-auto flex-1">
            {DIAS.map((dia) => (
              <div key={dia} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col">
                {/* Header del dia */}
                <div className="text-white px-3 py-2 text-center" style={{ background: "#1e3a5f" }}>
                  <div className="font-bold">{dia}</div>
                  <div className="text-xs opacity-80">{cronograma[dia]?.fecha && formatearFecha(cronograma[dia].fecha)}</div>
                </div>

                <div className="p-3 space-y-3">
                  {/* Recibimiento */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Recibimiento</label>
                    <textarea
                      value={cronograma[dia]?.recibimiento || ""}
                      onChange={(e) => actualizarCampo(dia, "recibimiento", e.target.value)}
                      placeholder="Rutina de inicio..."
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg resize-none h-12 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40"
                    />
                  </div>

                  {/* Intercambio */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase">Intercambio</label>
                    <textarea
                      value={cronograma[dia]?.intercambio || ""}
                      onChange={(e) => actualizarCampo(dia, "intercambio", e.target.value)}
                      placeholder="Tema del dia..."
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg resize-none h-12 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40"
                    />
                  </div>

                  {/* Actividades */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase" style={{ color: "#1e3a5f" }}>Actividades</label>
                      <button
                        type="button"
                        onClick={() => agregarActividad(dia)}
                        className="text-[10px] font-medium flex items-center gap-0.5 hover:opacity-70"
                        style={{ color: "#1e3a5f" }}
                      >
                        <Plus className="w-3 h-3" /> Agregar
                      </button>
                    </div>

                    {cronograma[dia]?.actividades?.map((act, idx) => (
                      <div key={idx} className="bg-white border border-slate-200 rounded-lg p-2 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold" style={{ color: "#1e3a5f" }}>Actividad {idx + 1}</span>
                          {cronograma[dia].actividades.length > 1 && (
                            <button
                              type="button"
                              onClick={() => eliminarActividad(dia, idx)}
                              className="text-red-400 hover:text-red-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <input
                          type="text"
                          value={act.nombre}
                          onChange={(e) => actualizarActividad(dia, idx, "nombre", e.target.value)}
                          placeholder="Nombre de la actividad"
                          className="w-full text-[10px] p-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40 font-medium"
                        />
                        <textarea
                          value={act.objetivo}
                          onChange={(e) => actualizarActividad(dia, idx, "objetivo", e.target.value)}
                          placeholder="Objetivo"
                          className="w-full text-[10px] p-1.5 border border-slate-200 rounded resize-none h-8 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40"
                        />
                        <textarea
                          value={act.contenidos}
                          onChange={(e) => actualizarActividad(dia, idx, "contenidos", e.target.value)}
                          placeholder="Contenidos"
                          className="w-full text-[10px] p-1.5 border border-slate-200 rounded resize-none h-8 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40"
                        />
                        <textarea
                          value={act.desarrollo}
                          onChange={(e) => actualizarActividad(dia, idx, "desarrollo", e.target.value)}
                          placeholder="Desarrollo"
                          className="w-full text-[10px] p-1.5 border border-slate-200 rounded resize-none h-12 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40"
                        />
                        <textarea
                          value={act.materiales}
                          onChange={(e) => actualizarActividad(dia, idx, "materiales", e.target.value)}
                          placeholder="Materiales"
                          className="w-full text-[10px] p-1.5 border border-slate-200 rounded resize-none h-8 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
