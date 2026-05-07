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

// Colores de EJES distintos al sistema de semaforo (verde/amarillo/rojo)
// para evitar confusion entre eje de aprendizaje y nivel de logro
const EJES = [
  { key: "CF", label: "Conciencia Fonologica", color: "#6366f1", total: 40 },  // Indigo
  { key: "CT", label: "Conocimiento de Textos", color: "#8b5cf6", total: 20 }, // Violeta
  { key: "O", label: "Oralidad", color: "#06b6d4", total: 40 },                // Cyan
]

// Sugerencias pedagogicas segun el nivel de progreso
const SUGERENCIAS: Record<string, { rojo: string; amarillo: string; verde: string }> = {
  CF: {
    rojo: "Reforzar con juegos de rimas simples y sonidos onomatopeyicos. Usar canciones con repeticion de fonemas.",
    amarillo: "Bien encaminado. Introducir palabras con el fonema en posicion media. Practicar segmentacion silabica.",
    verde: "Hito logrado! Pasar a la identificacion de la grafia correspondiente (RL). Comenzar asociacion sonido-letra.",
  },
  CT: {
    rojo: "Leer cuentos cortos con imagenes. Hacer preguntas simples: Quien? Donde? Usar libros con texturas.",
    amarillo: "Aumentar complejidad de las narraciones. Introducir secuencias temporales: Que paso primero?",
    verde: "Excelente comprension! Comenzar con predicciones y relaciones causa-efecto en los textos.",
  },
  O: {
    rojo: "Fomentar conversaciones guiadas con preguntas abiertas. Usar titeres para motivar la expresion.",
    amarillo: "Expandir vocabulario con categorias semanticas. Practicar descripciones de objetos y personas.",
    verde: "Gran desarrollo oral! Introducir narraciones propias y exposiciones breves frente al grupo.",
  },
}

function getSugerencia(eje: string, porcentaje: number): { nivel: string; texto: string; color: string } {
  const sugs = SUGERENCIAS[eje]
  if (!sugs) return { nivel: "", texto: "", color: "" }
  
  if (porcentaje < 40) {
    return { nivel: "Requiere Apoyo", texto: sugs.rojo, color: "#ef4444" }
  } else if (porcentaje < 70) {
    return { nivel: "En Proceso", texto: sugs.amarillo, color: "#f59e0b" }
  } else {
    return { nivel: "Avanzado", texto: sugs.verde, color: "#10b981" }
  }
}

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
            <p className="text-sm text-gray-500">Sala Manzanos</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>
            {avgPercent}%
          </div>
          <div className="text-xs text-gray-500">Promedio</div>
        </div>
      </div>

      {/* Barras de progreso con sugerencias pedagogicas */}
      <div className="space-y-4">
        {EJES.map((eje) => {
          const p = progreso[eje.key] || { logradas: [], porcentaje: 0 }
          const sugerencia = getSugerencia(eje.key, p.porcentaje)
          return (
            <div key={eje.key} className="space-y-2">
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
              {/* Sugerencia pedagogica */}
              <div
                className="rounded-lg p-3 text-sm"
                style={{ backgroundColor: `${sugerencia.color}10`, borderLeft: `3px solid ${sugerencia.color}` }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: sugerencia.color, color: "#fff" }}
                  >
                    {sugerencia.nivel}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{sugerencia.texto}</p>
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
                      backgroundColor: item.resultado === "logrado" ? "#e0e7ff" : "#f1f5f9",
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
