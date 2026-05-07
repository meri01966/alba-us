"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, User, Lightbulb, Clock } from "lucide-react"

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
  { key: "CF", label: "Conciencia Fonologica" },
  { key: "CT", label: "Conocimiento de Textos" },
  { key: "O", label: "Oralidad" },
]

// Nivel segun porcentaje - sin mostrar el numero
function getNivel(porcentaje: number): { texto: string; color: string; bg: string } {
  if (porcentaje >= 70) return { texto: "Avanzado", color: "#10b981", bg: "#ecfdf5" }
  if (porcentaje >= 40) return { texto: "En Proceso", color: "#f59e0b", bg: "#fffbeb" }
  return { texto: "Necesita Apoyo", color: "#ef4444", bg: "#fef2f2" }
}

// Sugerencias cortas por eje y nivel
const SUGERENCIAS: Record<string, Record<string, string>> = {
  CF: {
    "Necesita Apoyo": "Jugar con rimas y canciones. Aplaudir silabas.",
    "En Proceso": "Identificar sonidos iniciales. Juego del veo-veo.",
    "Avanzado": "Asociar sonido con letra. Armar palabras cortas.",
  },
  CT: {
    "Necesita Apoyo": "Leer cuentos con imagenes. Preguntar: Quien? Donde?",
    "En Proceso": "Secuenciar la historia. Que paso primero?",
    "Avanzado": "Predecir que pasara. Inventar finales.",
  },
  O: {
    "Necesita Apoyo": "Conversar con preguntas abiertas. Usar titeres.",
    "En Proceso": "Describir objetos. Contar que hizo ayer.",
    "Avanzado": "Contar una historia propia. Exponer al grupo.",
  },
}

// Historial demo
const HISTORIAL_DEMO: Record<string, string[]> = {
  CF: ["Silabas con palmas", "Rimas con animales", "Sonido inicial /M/"],
  CT: ["Cuento del patito", "Secuencia de imagenes"],
  O: ["Descripcion de familia", "Contar el fin de semana"],
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

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1e3a5f" }}>
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
            {alumno.nombre}
          </h2>
          <p className="text-sm text-gray-500">Sala Manzanos</p>
        </div>
      </div>

      {/* 3 TARJETAS - una por eje */}
      <div className="space-y-4">
        {EJES.map((eje) => {
          const p = progreso[eje.key] || { porcentaje: 0 }
          const nivel = getNivel(p.porcentaje)
          const sugerencia = SUGERENCIAS[eje.key][nivel.texto]
          const historial = HISTORIAL_DEMO[eje.key] || []
          
          return (
            <div 
              key={eje.key}
              className="rounded-2xl overflow-hidden border"
              style={{ borderColor: `${nivel.color}40` }}
            >
              {/* Encabezado con nombre y semaforo */}
              <div 
                className="flex items-center justify-between px-4 py-3"
                style={{ backgroundColor: nivel.bg }}
              >
                <span className="font-semibold text-gray-700">{eje.label}</span>
                <span 
                  className="px-3 py-1 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: nivel.color }}
                >
                  {nivel.texto}
                </span>
              </div>

              {/* Contenido */}
              <div className="p-4 bg-white space-y-3">
                {/* Sugerencia */}
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
                  <p className="text-sm text-gray-600">{sugerencia}</p>
                </div>

                {/* Historial reciente */}
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                  <div className="flex flex-wrap gap-1">
                    {historial.map((act, i) => (
                      <span 
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                      >
                        {act}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
