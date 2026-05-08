"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Brain, Sparkles, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface AIInsightsProps {
  sala: string
  totalEvaluaciones: number
}

export function AIInsights({ sala, totalEvaluaciones }: AIInsightsProps) {
  const [loading, setLoading] = useState(false)
  const [insight, setInsight] = useState<string | null>(null)
  const [estadisticas, setEstadisticas] = useState<{
    total: number
    green: number
    yellow: number
    red: number
    alumnosConDificultad?: [string, number][]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalisis = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/analyze-trends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sala })
      })
      
      const data = await res.json()
      
      if (!data.ok) {
        setError(data.error || "Error al analizar")
        return
      }
      
      if (data.analisis) {
        setInsight(data.analisis)
        setEstadisticas(data.estadisticas)
      } else {
        setError(data.mensaje || "No hay suficientes datos")
      }
    } catch (err) {
      setError("Error de conexion")
    } finally {
      setLoading(false)
    }
  }

  // Calcular tendencia
  const getTendencia = () => {
    if (!estadisticas) return null
    const total = estadisticas.green + estadisticas.yellow + estadisticas.red
    if (total === 0) return null
    
    const porcentajeVerde = (estadisticas.green / total) * 100
    if (porcentajeVerde >= 60) return { icon: TrendingUp, color: "#10b981", texto: "Tendencia positiva" }
    if (porcentajeVerde >= 40) return { icon: Minus, color: "#f59e0b", texto: "Tendencia estable" }
    return { icon: TrendingDown, color: "#ef4444", texto: "Requiere atencion" }
  }

  const tendencia = getTendencia()

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Brain className="w-4 h-4 text-indigo-600" />
            </div>
            <CardTitle className="text-base font-semibold text-indigo-900">
              Analisis IA
            </CardTitle>
          </div>
          <button
            onClick={fetchAnalisis}
            disabled={loading || totalEvaluaciones < 5}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <Spinner className="w-3 h-3" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            {loading ? "Analizando..." : "Analizar"}
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-2">
        {totalEvaluaciones < 5 && !insight && (
          <p className="text-sm text-slate-500 text-center py-4">
            Se necesitan al menos 5 evaluaciones para generar un analisis.
            <br />
            <span className="text-xs">Evaluaciones actuales: {totalEvaluaciones}</span>
          </p>
        )}

        {error && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {insight && (
          <div className="space-y-3">
            {/* Tendencia */}
            {tendencia && (
              <div 
                className="flex items-center gap-2 p-2 rounded-lg"
                style={{ backgroundColor: `${tendencia.color}15` }}
              >
                <tendencia.icon className="w-4 h-4" style={{ color: tendencia.color }} />
                <span className="text-sm font-medium" style={{ color: tendencia.color }}>
                  {tendencia.texto}
                </span>
              </div>
            )}

            {/* Estadisticas rapidas */}
            {estadisticas && (
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{estadisticas.green}</p>
                  <p className="text-xs text-green-700">Logrado</p>
                </div>
                <div className="text-center p-2 bg-yellow-50 rounded-lg">
                  <p className="text-lg font-bold text-yellow-600">{estadisticas.yellow}</p>
                  <p className="text-xs text-yellow-700">En proceso</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded-lg">
                  <p className="text-lg font-bold text-red-600">{estadisticas.red}</p>
                  <p className="text-xs text-red-700">Refuerzo</p>
                </div>
              </div>
            )}

            {/* Insight de la IA */}
            <div className="p-3 bg-white rounded-lg border border-indigo-100">
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {insight}
              </p>
            </div>

            {/* Alumnos prioritarios */}
            {estadisticas?.alumnosConDificultad && estadisticas.alumnosConDificultad.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-xs font-semibold text-amber-800 mb-2">
                  Atencion prioritaria:
                </p>
                <div className="flex flex-wrap gap-1">
                  {estadisticas.alumnosConDificultad.map(([nombre, count]) => (
                    <span 
                      key={nombre}
                      className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full"
                    >
                      {nombre} ({count})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Boton actualizar */}
            <button
              onClick={fetchAnalisis}
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Actualizar analisis
            </button>
          </div>
        )}

        {!insight && !error && totalEvaluaciones >= 5 && (
          <p className="text-sm text-slate-500 text-center py-4">
            Haz clic en &quot;Analizar&quot; para que la IA revise las tendencias del grupo.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
