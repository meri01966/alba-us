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
}

interface ProgresoEje {
  logradas: number[]
  porcentaje: number
}

const EJES = [
  { key: "CF", label: "Conciencia Fonologica", short: "CF" },
  { key: "CT", label: "Conocimiento de Textos", short: "CT" },
  { key: "O", label: "Oralidad", short: "O" },
]

// Color del semaforo segun porcentaje
function getSemaforoColor(porcentaje: number): string {
  if (porcentaje >= 70) return "#10b981" // Verde
  if (porcentaje >= 40) return "#f59e0b" // Amarillo
  return "#ef4444" // Rojo
}

export default function StudentProfile({ alumnoId, onBack }: StudentProfileProps) {
  const [loading, setLoading] = useState(true)
  const [alumno, setAlumno] = useState<Alumno | null>(null)
  const [progreso, setProgreso] = useState<Record<string, ProgresoEje>>({})

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`/api/progreso/${alumnoId}`)
        const data = await res.json()
        if (data.ok) {
          setAlumno(data.alumno)
          setProgreso(data.progreso)
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
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header minimo */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1e3a5f" }}>
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
            {alumno.nombre}
          </h2>
          <p className="text-sm text-gray-500">Promedio {avgPercent}%</p>
        </div>
      </div>

      {/* 3 TARJETAS SIMPLES - solo nombre, numero y semaforo */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {EJES.map((eje) => {
          const p = progreso[eje.key] || { porcentaje: 0 }
          const color = getSemaforoColor(p.porcentaje)
          
          return (
            <div 
              key={eje.key}
              className="bg-white rounded-2xl p-4 text-center shadow-sm border border-slate-100"
            >
              {/* Nombre del eje */}
              <p className="text-xs text-gray-500 font-medium mb-2">{eje.label}</p>
              
              {/* Numero grande con color semaforo */}
              <div 
                className="text-4xl font-bold mb-2"
                style={{ color }}
              >
                {p.porcentaje}%
              </div>
              
              {/* Circulo semaforo */}
              <div 
                className="w-4 h-4 rounded-full mx-auto"
                style={{ backgroundColor: color }}
              />
            </div>
          )
        })}
      </div>

      {/* Leyenda simple */}
      <div className="flex justify-center gap-6 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#10b981" }} />
          <span>Avanzado</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
          <span>En Proceso</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#ef4444" }} />
          <span>Refuerzo</span>
        </div>
      </div>
    </div>
  )
}
