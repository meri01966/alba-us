"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle, X, ChevronDown, ChevronUp, Lightbulb } from "lucide-react"

export interface AlertaPedagogica {
  id: string
  alumnoId: string
  alumnoNombre: string
  eje: "CF" | "CT" | "O"
  mensaje: string
  sugerencia: string
  fecha: string
  atendida: boolean
}

interface AlertasPedagogicasProps {
  alertas: AlertaPedagogica[]
  onMarcarAtendida: (id: string) => void
  onClose: () => void
}

const EJE_LABELS: Record<string, string> = {
  CF: "Conciencia Fonologica",
  CT: "Comprension de Textos",
  O: "Oralidad",
}

const EJE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CF: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
  CT: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
  O: { bg: "#dcfce7", text: "#166534", border: "#22c55e" },
}

export function AlertasPedagogicas({ alertas, onMarcarAtendida, onClose }: AlertasPedagogicasProps) {
  const [showAtendidas, setShowAtendidas] = useState(false)
  
  const pendientes = alertas.filter(a => !a.atendida)
  const atendidas = alertas.filter(a => a.atendida)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Alertas Pedagogicas</h2>
              <p className="text-xs text-white/70">Alumnos que necesitan atencion especial</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Alertas Pendientes */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Pendientes ({pendientes.length})
            </h3>
            
            {pendientes.length === 0 ? (
              <div className="text-center py-8 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-green-700 font-medium">No hay alertas pendientes</p>
                <p className="text-xs text-green-600">Todos los alumnos estan progresando bien</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendientes.map(alerta => (
                  <div 
                    key={alerta.id}
                    className="bg-red-50 border border-red-200 rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-800">{alerta.alumnoNombre}</span>
                          <span 
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{ 
                              backgroundColor: EJE_COLORS[alerta.eje].bg, 
                              color: EJE_COLORS[alerta.eje].text 
                            }}
                          >
                            {alerta.eje}
                          </span>
                        </div>
                        <p className="text-sm text-red-700 mb-3">{alerta.mensaje}</p>
                        
                        {/* Sugerencia de ALBA */}
                        <div className="bg-white rounded-lg p-3 border border-red-100">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
                            <Lightbulb className="w-3.5 h-3.5" />
                            Sugerencia de ALBA:
                          </div>
                          <p className="text-sm text-gray-600">{alerta.sugerencia}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => onMarcarAtendida(alerta.id)}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Atendida
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">Detectada: {alerta.fecha}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alertas Atendidas (colapsable) */}
          {atendidas.length > 0 && (
            <div>
              <button
                onClick={() => setShowAtendidas(!showAtendidas)}
                className="w-full flex items-center justify-between text-sm font-bold text-gray-500 mb-3 hover:text-gray-700 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Atendidas ({atendidas.length})
                </span>
                {showAtendidas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showAtendidas && (
                <div className="space-y-2">
                  {atendidas.map(alerta => (
                    <div 
                      key={alerta.id}
                      className="bg-gray-50 border border-gray-200 rounded-xl p-3 opacity-70"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="font-medium text-gray-700">{alerta.alumnoNombre}</span>
                        <span 
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: EJE_COLORS[alerta.eje].bg, 
                            color: EJE_COLORS[alerta.eje].text 
                          }}
                        >
                          {alerta.eje}
                        </span>
                        <span className="text-xs text-gray-400 ml-auto">{alerta.fecha}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
