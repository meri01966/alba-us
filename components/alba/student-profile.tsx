"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, User } from "lucide-react"

interface StudentProfileProps {
  alumnoId: string
  onBack: () => void
}

interface Alumno {
  id: string
  nombre: string
  apellido: string
  mesa: string
}

interface ProgresoEje {
  logradas: number[]
  porcentaje: number
}

interface HistorialItem {
  actividad: string
  actividadIndex: number
  resultado: string
  fecha: string
}

const EJES = [
  { key: "CF", label: "Conciencia Fonologica", color: "#10b981", total: 40 },
  { key: "CT", label: "Conocimiento de Textos", color: "#3b82f6", total: 20 },
  { key: "O", label: "Oralidad", color: "#f59e0b", total: 40 },
]

export default function StudentProfile({ alumnoId, onBack }: StudentProfileProps) {
  const [loading, setLoading] = useState(true)
  const [alumno, setAlumno] = useState<Alumno | null>(null)
  const [progreso, setProgreso] = useState<Record<string, ProgresoEje>>({})
  const [historial, setHistorial] = useState<Record<string, HistorialItem[]>>({})

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`/api/progreso/${alumnoId}`)
        const data = await res.json()
        if (data.ok) {
          setAlumno(data.alumno)
          setProgreso(data.progreso)
          setHistorial(data.historial)
        }
      } catch (err) {
        console.error("Error fetching student profile:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [alumnoId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!alumno) {
    return (
      <div className="p-4 text-center text-gray-500">
        No se encontro el alumno
        <button onClick={onBack} className="block mx-auto mt-4 text-primary underline">
          Volver
        </button>
      </div>
    )
  }

  const avgPercent = Math.round(
    EJES.reduce((sum, e) => sum + (progreso[e.key]?.porcentaje || 0), 0) / EJES.length
  )

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "#1e3a5f" }}
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            <User className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
              {alumno.nombre} {alumno.apellido}
            </h2>
            <p className="text-sm text-gray-500">Mesa: {alumno.mesa || "General"}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>
            {avgPercent}%
          </div>
          <div className="text-xs text-gray-500">Promedio</div>
        </div>
      </div>

      {/* Barras de progreso */}
      <div className="space-y-4">
        {EJES.map((eje) => {
          const p = progreso[eje.key] || { logradas: [], porcentaje: 0 }
          return (
            <div key={eje.key} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold" style={{ color: eje.color }}>
                  {eje.label}
                </span>
                <span className="text-gray-600">
                  {p.logradas.length} / {eje.total} actividades ({p.porcentaje}%)
                </span>
              </div>
              <div className="h-4 rounded-full overflow-hidden" style={{ backgroundColor: "#e5e7eb" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${p.porcentaje}%`,
                    backgroundColor: eje.color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Historial reciente */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Historial reciente</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {EJES.map((eje) => {
            const items = historial[eje.key] || []
            if (items.length === 0) return null
            return (
              <div key={eje.key}>
                <p className="text-xs font-semibold mb-1" style={{ color: eje.color }}>
                  {eje.key}
                </p>
                {items.slice(0, 5).map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between py-1 px-2 rounded text-xs"
                    style={{
                      backgroundColor: item.resultado === "logrado" ? "#d1fae5" : "#fee2e2",
                    }}
                  >
                    <span>{item.actividad}</span>
                    <span className="text-gray-500">{item.fecha}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
