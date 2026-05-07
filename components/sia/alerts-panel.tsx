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

interface AlertsPanelProps {
  progress?: Record<string, { CF: number; CT: number; O: number }>
  students?: { id: string; nombre: string }[]
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
  
  // Alerta por grupo en CF - muestra cantidad
  if (necesitanRefuerzoCF.length >= 1) {
    alertas.push({
      id: "cf-grupo",
      mensaje: `${necesitanRefuerzoCF.length} alumno${necesitanRefuerzoCF.length > 1 ? "s" : ""} necesita${necesitanRefuerzoCF.length > 1 ? "n" : ""} refuerzo en Conciencia Fonologica`,
      tipo: "atencion",
      sugerencia: "Considera hacer grupos pequenos para trabajar rimas y sonidos iniciales. Usa juegos de aplaudir silabas.",
      alumnos: necesitanRefuerzoCF
    })
  }
  
  // Alerta por grupo en CT - muestra cantidad
  if (necesitanRefuerzoCT.length >= 1) {
    alertas.push({
      id: "ct-grupo",
      mensaje: `${necesitanRefuerzoCT.length} alumno${necesitanRefuerzoCT.length > 1 ? "s" : ""} necesita${necesitanRefuerzoCT.length > 1 ? "n" : ""} refuerzo en Conocimiento de Textos`,
      tipo: "atencion",
      sugerencia: "Lee cuentos en voz alta y haz preguntas sobre la historia. Usa imagenes para que anticipen que pasara.",
      alumnos: necesitanRefuerzoCT
    })
  }
  
  // Alerta por grupo en O - muestra cantidad
  if (necesitanRefuerzoO.length >= 1) {
    alertas.push({
      id: "o-grupo",
      mensaje: `${necesitanRefuerzoO.length} alumno${necesitanRefuerzoO.length > 1 ? "s" : ""} necesita${necesitanRefuerzoO.length > 1 ? "n" : ""} mas oportunidades de expresion oral`,
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

export function AlertsPanel({ progress = {}, students = [] }: AlertsPanelProps) {
  const [sugerenciaAbierta, setSugerenciaAbierta] = useState<string | null>(null)
  const [alertasResueltas, setAlertasResueltas] = useState<string[]>([])
  
  const alertas = generarAlertas(progress, students)
  const alertasVisibles = alertas.filter(a => !alertasResueltas.includes(a.id))
  
  const marcarResuelta = (id: string) => {
    setAlertasResueltas(prev => [...prev, id])
    setSugerenciaAbierta(null)
  }
  
  return (
    <Card className="shadow-md h-full flex flex-col overflow-hidden">
      <CardHeader className="pb-1 pt-2 px-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Alertas pedagogicas
          {alertasVisibles.length > 0 && (
            <span className="ml-auto text-[10px] font-normal text-slate-500">
              {alertasVisibles.length} pendiente{alertasVisibles.length !== 1 ? "s" : ""}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 px-3 pb-2 flex-1 overflow-auto">
        {alertasVisibles.length === 0 ? (
          <div className="text-center py-4 text-slate-500">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <p className="text-xs">Sin alertas</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {alertasVisibles.map((alerta) => (
              <div key={alerta.id}>
                <div
                  className={`flex items-center justify-between gap-1 p-2 rounded-lg border text-xs ${
                    alerta.tipo === "urgente"
                      ? "bg-red-50 border-red-200"
                      : "bg-amber-50 border-amber-200"
                  }`}
                >
                  <div className="flex items-start gap-1.5 flex-1 min-w-0">
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${
                        alerta.tipo === "urgente" ? "bg-red-500" : "bg-amber-500"
                      }`}
                    />
                    <p className="text-slate-700 leading-tight">{alerta.mensaje}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 text-[10px] h-6 px-1.5"
                    onClick={() => setSugerenciaAbierta(sugerenciaAbierta === alerta.id ? null : alerta.id)}
                  >
                    {sugerenciaAbierta === alerta.id ? "X" : "Ver"}
                    <ChevronRight className={`w-2.5 h-2.5 ml-0.5 transition-transform ${sugerenciaAbierta === alerta.id ? "rotate-90" : ""}`} />
                  </Button>
                </div>
                
                {/* Panel de sugerencia expandido */}
                {sugerenciaAbierta === alerta.id && (
                  <div className="mt-1 p-2 rounded-lg border bg-white text-xs" style={{ borderColor: "#1e3a5f20" }}>
                    <div className="flex items-start gap-1.5">
                      <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-slate-700 leading-tight">{alerta.sugerencia}</p>
                        {alerta.alumnos && alerta.alumnos.length > 0 && (
                          <div className="mt-2 pt-1.5 border-t border-slate-100">
                            <p className="text-[10px] font-medium text-slate-600">Alumnos: {alerta.alumnos.join(", ")}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="w-full mt-2 text-[10px] h-6"
                      style={{ backgroundColor: "#1e3a5f" }}
                      onClick={() => marcarResuelta(alerta.id)}
                    >
                      <CheckCircle2 className="w-2.5 h-2.5 mr-1" />
                      Atendida
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
