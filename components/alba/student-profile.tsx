"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, User, TrendingUp, TrendingDown, Minus } from "lucide-react"

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

// Colores de EJES - tonos neutros/frios para diferenciar del semaforo
const EJES = [
  { key: "CF", label: "Conciencia Fonologica", abbr: "CF", color: "#1e3a5f", lightBg: "#e8eef4", total: 40 },
  { key: "CT", label: "Conocimiento de Textos", abbr: "CT", color: "#374151", lightBg: "#f3f4f6", total: 20 },
  { key: "O", label: "Oralidad", abbr: "O", color: "#4b5563", lightBg: "#f9fafb", total: 40 },
]

// Funcion para obtener nivel y color del semaforo
function getNivelLogro(porcentaje: number): { nivel: string; color: string; bgColor: string; icon: "up" | "mid" | "down" } {
  if (porcentaje >= 70) {
    return { nivel: "Avanzado", color: "#10b981", bgColor: "#d1fae5", icon: "up" }
  } else if (porcentaje >= 40) {
    return { nivel: "En Proceso", color: "#f59e0b", bgColor: "#fef3c7", icon: "mid" }
  } else {
    return { nivel: "Necesita Apoyo", color: "#ef4444", bgColor: "#fee2e2", icon: "down" }
  }
}

// Sugerencias breves
const SUGERENCIAS: Record<string, { rojo: string; amarillo: string; verde: string }> = {
  CF: {
    rojo: "Juegos de rimas y canciones con fonemas",
    amarillo: "Segmentacion silabica y fonemas en posicion media",
    verde: "Iniciar asociacion sonido-letra",
  },
  CT: {
    rojo: "Cuentos cortos con imagenes",
    amarillo: "Secuencias temporales en narraciones",
    verde: "Predicciones y causa-efecto",
  },
  O: {
    rojo: "Conversaciones guiadas con titeres",
    amarillo: "Descripciones y vocabulario",
    verde: "Narraciones propias y exposiciones",
  },
}

function getSugerencia(eje: string, porcentaje: number): string {
  const sugs = SUGERENCIAS[eje]
  if (!sugs) return ""
  if (porcentaje < 40) return sugs.rojo
  if (porcentaje < 70) return sugs.amarillo
  return sugs.verde
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
  const nivelGeneral = getNivelLogro(avgPercent)

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header compacto */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: "#1e3a5f" }}>
              {alumno.nombre} {alumno.apellido}
            </h2>
            <p className="text-xs text-gray-500">Sala Manzanos</p>
          </div>
        </div>
        {/* Nivel general con semaforo */}
        <div 
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ backgroundColor: nivelGeneral.bgColor }}
        >
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: nivelGeneral.color }}
          >
            {nivelGeneral.icon === "up" && <TrendingUp className="w-4 h-4 text-white" />}
            {nivelGeneral.icon === "mid" && <Minus className="w-4 h-4 text-white" />}
            {nivelGeneral.icon === "down" && <TrendingDown className="w-4 h-4 text-white" />}
          </div>
          <div className="text-right">
            <div className="text-lg font-bold" style={{ color: nivelGeneral.color }}>{avgPercent}%</div>
            <div className="text-[10px] font-medium" style={{ color: nivelGeneral.color }}>{nivelGeneral.nivel}</div>
          </div>
        </div>
      </div>

      {/* Leyenda del semaforo */}
      <div className="flex justify-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#10b981" }} />
          <span className="text-gray-600">70%+ Avanzado</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
          <span className="text-gray-600">40-69% En Proceso</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }} />
          <span className="text-gray-600">&lt;40% Necesita Apoyo</span>
        </div>
      </div>

      {/* 3 COLUMNAS - un eje por columna */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {EJES.map((eje) => {
          const p = progreso[eje.key] || { logradas: [], porcentaje: 0 }
          const nivel = getNivelLogro(p.porcentaje)
          const sugerencia = getSugerencia(eje.key, p.porcentaje)
          const items = historial[eje.key] || []

          return (
            <div 
              key={eje.key} 
              className="rounded-2xl border-2 overflow-hidden"
              style={{ borderColor: eje.color }}
            >
              {/* Encabezado del eje */}
              <div 
                className="px-4 py-3 text-center"
                style={{ backgroundColor: eje.color }}
              >
                <h3 className="text-white font-bold text-sm">{eje.label}</h3>
              </div>

              {/* Contenido */}
              <div className="p-4 space-y-3" style={{ backgroundColor: eje.lightBg }}>
                {/* Porcentaje y nivel (semaforo) */}
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold" style={{ color: eje.color }}>
                    {p.porcentaje}%
                  </div>
                  <div 
                    className="px-2 py-1 rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: nivel.color }}
                  >
                    {nivel.nivel}
                  </div>
                </div>

                {/* Barra de progreso (color neutro del eje) */}
                <div className="h-3 rounded-full overflow-hidden bg-white">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${p.porcentaje}%`, backgroundColor: eje.color }}
                  />
                </div>

                {/* Actividades */}
                <div className="text-xs text-gray-600 text-center">
                  {p.logradas.length} de {eje.total} actividades
                </div>

                {/* Indicador semaforo visual */}
                <div 
                  className="rounded-lg p-2 text-center"
                  style={{ backgroundColor: nivel.bgColor }}
                >
                  <div className="flex justify-center mb-1">
                    {nivel.icon === "up" && <TrendingUp className="w-5 h-5" style={{ color: nivel.color }} />}
                    {nivel.icon === "mid" && <Minus className="w-5 h-5" style={{ color: nivel.color }} />}
                    {nivel.icon === "down" && <TrendingDown className="w-5 h-5" style={{ color: nivel.color }} />}
                  </div>
                </div>

                {/* Sugerencia */}
                <div className="bg-white rounded-lg p-2">
                  <p className="text-xs text-gray-600 font-medium mb-1">Sugerencia:</p>
                  <p className="text-xs text-gray-700">{sugerencia}</p>
                </div>

                {/* Historial compacto */}
                {items.length > 0 && (
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xs text-gray-600 font-medium mb-1">Reciente:</p>
                    {items.slice(0, 2).map((item, i) => (
                      <div key={i} className="text-[10px] text-gray-500 truncate">
                        {item.actividad}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
