"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ChevronRight, X, Lightbulb, CheckCircle2 } from "lucide-react"

interface Alert {
  id: string
  mensaje: string
  tipo: "atencion" | "urgente"
  sugerencia: string
  alumnos?: string[]
}

type StatusLevel = "green" | "yellow" | "red"

interface AlertsPanelProps {
  students?: { id: string; nombre: string }[]
  evaluaciones?: Record<string, StatusLevel>
}

// Genera alertas basadas SOLO en evaluaciones reales (no datos por defecto)
function generarAlertas(
  evaluaciones: Record<string, StatusLevel>,
  students: { id: string; nombre: string }[]
): Alert[] {
  const alertas: Alert[] = []
  
  // Solo generar alertas si hay evaluaciones reales
  const alumnosEvaluados = Object.keys(evaluaciones)
  if (alumnosEvaluados.length === 0) {
    return [] // Sin evaluaciones = sin alertas
  }
  
  // Contar alumnos que necesitan refuerzo (solo los que fueron evaluados HOY como rojo)
  const necesitanRefuerzo: string[] = []
  
  students.forEach(s => {
    const evaluacion = evaluaciones[s.id]
    // Solo considerar si tiene evaluacion real (no undefined)
    if (evaluacion === "red") {
      necesitanRefuerzo.push(s.nombre)
    }
  })
  
  // Alerta solo si hay alumnos evaluados en rojo
  if (necesitanRefuerzo.length >= 1) {
    const nombres = necesitanRefuerzo.slice(0, 4).join(", ")
    const yMas = necesitanRefuerzo.length > 4 ? ` y ${necesitanRefuerzo.length - 4} mas` : ""
    alertas.push({
      id: "refuerzo-hoy",
      mensaje: `${nombres}${yMas} necesita${necesitanRefuerzo.length > 1 ? "n" : ""} refuerzo adicional hoy`,
      tipo: necesitanRefuerzo.length >= 3 ? "urgente" : "atencion",
      sugerencia: "Considera hacer una actividad de refuerzo en grupo pequeno o acompanamiento individual en la proxima clase.",
      alumnos: necesitanRefuerzo
    })
  }
  
  // Alerta si hay muchos en proceso (amarillo)
  const enProceso: string[] = []
  students.forEach(s => {
    if (evaluaciones[s.id] === "yellow") {
      enProceso.push(s.nombre)
    }
  })
  
  if (enProceso.length >= 3) {
    alertas.push({
      id: "en-proceso-grupo",
      mensaje: `${enProceso.length} alumnos en proceso - considera repetir la actividad`,
      tipo: "atencion",
      sugerencia: "Un grupo considerable esta en proceso. Puede ser util repetir la actividad con variaciones o trabajar en grupos mas pequenos.",
      alumnos: enProceso
    })
  }
  
  return alertas
}

export function AlertsPanel({ students = [], evaluaciones = {} }: AlertsPanelProps) {
  const [sugerenciaAbierta, setSugerenciaAbierta] = useState<string | null>(null)
  const [alertasResueltas, setAlertasResueltas] = useState<string[]>([])
  
  // Generar alertas basadas SOLO en evaluaciones reales del dia
  // Las alertas se actualizan automaticamente cuando evaluaciones cambia (incluyendo cancelaciones)
  const alertas = generarAlertas(evaluaciones, students)
  const alertasVisibles = alertas.filter(a => !alertasResueltas.includes(a.id))
  
  // Contar evaluaciones reales
  const totalEvaluados = Object.keys(evaluaciones).length
  
  const marcarResuelta = (id: string) => {
    setAlertasResueltas(prev => [...prev, id])
    setSugerenciaAbierta(null)
  }
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Alertas pedagogicas
          {alertasVisibles.length > 0 && (
            <span className="ml-auto text-xs font-normal text-slate-500">
              {alertasVisibles.length} pendiente{alertasVisibles.length !== 1 ? "s" : ""}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {alertasVisibles.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            {totalEvaluados === 0 ? (
              <>
                <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-slate-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">Sin datos evaluados</p>
                <p className="text-xs mt-1 text-slate-300">Las alertas apareceran cuando evalues alumnos</p>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">Sin alertas por ahora</p>
                <p className="text-xs mt-1">El grupo avanza bien ({totalEvaluados} evaluados)</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {alertasVisibles.map((alerta) => (
              <div key={alerta.id}>
                <div
                  className={`flex items-center justify-between gap-2 p-3 rounded-lg border ${
                    alerta.tipo === "urgente"
                      ? "bg-red-50 border-red-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        alerta.tipo === "urgente" ? "bg-red-500" : "bg-amber-500"
                      }`}
                    />
                    <p className="text-sm text-slate-700">{alerta.mensaje}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 text-xs h-7 px-2"
                    onClick={() => setSugerenciaAbierta(sugerenciaAbierta === alerta.id ? null : alerta.id)}
                  >
                    {sugerenciaAbierta === alerta.id ? "Cerrar" : "Sugerencia"}
                    <ChevronRight className={`w-3 h-3 ml-1 transition-transform ${sugerenciaAbierta === alerta.id ? "rotate-90" : ""}`} />
                  </Button>
                </div>
                
                {/* Panel de sugerencia expandido */}
                {sugerenciaAbierta === alerta.id && (
                  <div className="mt-2 p-3 rounded-lg border bg-white" style={{ borderColor: "#1e3a5f20" }}>
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-700">{alerta.sugerencia}</p>
                        {alerta.alumnos && alerta.alumnos.length <= 5 && (
                          <p className="text-xs text-slate-500 mt-2">
                            Alumnos: {alerta.alumnos.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-3 text-xs"
                      style={{ backgroundColor: "#1e3a5f" }}
                      onClick={() => marcarResuelta(alerta.id)}
                    >
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Marcar como atendida
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
