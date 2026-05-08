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
  progress?: Record<string, { CF: number; CT: number; O: number }>
  students?: { id: string; nombre: string }[]
  evaluaciones?: Record<string, StatusLevel>  // Evaluaciones del dia
}

// Genera alertas basadas en el progreso real
function generarAlertas(
  progress: Record<string, { CF: number; CT: number; O: number }>,
  students: { id: string; nombre: string }[]
): Alert[] {
  const alertas: Alert[] = []
  
  // Contar alumnos que necesitan refuerzo por eje
  const necesitanRefuerzoCF: string[] = []
  const necesitanRefuerzoCT: string[] = []
  const necesitanRefuerzoO: string[] = []
  const dosRojosSeguidos: string[] = []
  
  students.forEach(s => {
    const p = progress[s.id]
    if (!p) return
    
    if (p.CF < 40) necesitanRefuerzoCF.push(s.nombre)
    if (p.CT < 40) necesitanRefuerzoCT.push(s.nombre)
    if (p.O < 40) necesitanRefuerzoO.push(s.nombre)
    
    // Si tiene 2 o mas ejes en rojo
    const ejesEnRojo = [p.CF, p.CT, p.O].filter(v => v < 40).length
    if (ejesEnRojo >= 2) dosRojosSeguidos.push(s.nombre)
  })
  
  // Alerta por grupo en CF - muestra nombres
  if (necesitanRefuerzoCF.length >= 1) {
    const nombres = necesitanRefuerzoCF.slice(0, 4).join(", ")
    const yMas = necesitanRefuerzoCF.length > 4 ? ` y ${necesitanRefuerzoCF.length - 4} mas` : ""
    alertas.push({
      id: "cf-grupo",
      mensaje: `${nombres}${yMas} necesita${necesitanRefuerzoCF.length > 1 ? "n" : ""} refuerzo en Conciencia Fonologica`,
      tipo: "atencion",
      sugerencia: "Considera hacer grupos pequenos para trabajar rimas y sonidos iniciales. Usa juegos de aplaudir silabas.",
      alumnos: necesitanRefuerzoCF
    })
  }
  
  // Alerta por grupo en CT - muestra nombres
  if (necesitanRefuerzoCT.length >= 1) {
    const nombres = necesitanRefuerzoCT.slice(0, 4).join(", ")
    const yMas = necesitanRefuerzoCT.length > 4 ? ` y ${necesitanRefuerzoCT.length - 4} mas` : ""
    alertas.push({
      id: "ct-grupo",
      mensaje: `${nombres}${yMas} necesita${necesitanRefuerzoCT.length > 1 ? "n" : ""} refuerzo en Conocimiento de Textos`,
      tipo: "atencion",
      sugerencia: "Lee cuentos en voz alta y haz preguntas sobre la historia. Usa imagenes para que anticipen que pasara.",
      alumnos: necesitanRefuerzoCT
    })
  }
  
  // Alerta por grupo en O - muestra nombres
  if (necesitanRefuerzoO.length >= 1) {
    const nombres = necesitanRefuerzoO.slice(0, 4).join(", ")
    const yMas = necesitanRefuerzoO.length > 4 ? ` y ${necesitanRefuerzoO.length - 4} mas` : ""
    alertas.push({
      id: "o-grupo",
      mensaje: `${nombres}${yMas} necesita${necesitanRefuerzoO.length > 1 ? "n" : ""} mas oportunidades de expresion oral`,
      tipo: "atencion",
      sugerencia: "Incluye rondas de conversacion donde cada nino cuente algo. Haz preguntas abiertas durante las actividades.",
      alumnos: necesitanRefuerzoO
    })
  }
  
  // Alerta urgente por alumnos con multiples ejes en rojo - muestra nombres
  if (dosRojosSeguidos.length > 0) {
    alertas.push({
      id: "multiples-rojos",
      mensaje: `${dosRojosSeguidos.join(", ")} necesita${dosRojosSeguidos.length > 1 ? "n" : ""} atencion especial (varios ejes)`,
      tipo: "urgente",
      sugerencia: "Estos ninos requieren acompanamiento individualizado. Considera hablar con la familia y planificar actividades especificas.",
      alumnos: dosRojosSeguidos
    })
  }
  
  return alertas
}

export function AlertsPanel({ progress = {}, students = [], evaluaciones = {} }: AlertsPanelProps) {
  const [sugerenciaAbierta, setSugerenciaAbierta] = useState<string | null>(null)
  const [alertasResueltas, setAlertasResueltas] = useState<string[]>([])
  
  // Convertir evaluaciones del dia a formato progress para el calculo de alertas
  // Rojo = 10%, Amarillo = 50%, Verde = 100%
  const progressConEvaluaciones = { ...progress }
  Object.entries(evaluaciones).forEach(([studentId, status]) => {
    const valorCF = status === "green" ? 100 : status === "yellow" ? 50 : 10
    progressConEvaluaciones[studentId] = {
      CF: valorCF,
      CT: progress[studentId]?.CT || 0,
      O: progress[studentId]?.O || 0,
    }
  })
  
  const alertas = generarAlertas(progressConEvaluaciones, students)
  const alertasVisibles = alertas.filter(a => !alertasResueltas.includes(a.id))
  
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
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">Sin alertas por ahora</p>
            <p className="text-xs mt-1">El grupo avanza bien</p>
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
