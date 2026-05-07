"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, ThumbsUp, Minus, AlertCircle, CheckCircle2, ClipboardList, Pencil } from "lucide-react"

type FeedbackType = "bien" | "parcial" | "ajustar" | null

interface QuickRegisterProps {
  actividadDelDia?: string
  evaluados?: number
  totalAlumnos?: number
  onGuardar?: (registro: { feedback: FeedbackType; observaciones: string }) => void
}

const STORAGE_KEY = "alba_registro_cierre"

export function QuickRegister({ 
  actividadDelDia = "Reconocimiento de Sonido Inicial /M/",
  evaluados = 0,
  totalAlumnos = 0,
  onGuardar
}: QuickRegisterProps) {
  const [feedback, setFeedback] = useState<FeedbackType>(null)
  const [observaciones, setObservaciones] = useState("")
  const [guardado, setGuardado] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(true)

  // Cargar registro guardado del dia
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.fecha === new Date().toDateString()) {
          setFeedback(parsed.feedback)
          setObservaciones(parsed.observaciones || "")
          setGuardado(true)
          setModoEdicion(false)
        }
      } catch {
        // Ignorar errores
      }
    }
  }, [])

  const feedbackOptions = [
    { value: "bien" as const, label: "Bien", icon: ThumbsUp, bgColor: "#10b981" },
    { value: "parcial" as const, label: "Parcial", icon: Minus, bgColor: "#f59e0b" },
    { value: "ajustar" as const, label: "Ajustar", icon: AlertCircle, bgColor: "#ef4444" },
  ]

  const guardar = () => {
    if (!feedback) {
      alert("Selecciona como funciono la actividad")
      return
    }
    
    const registro = {
      fecha: new Date().toDateString(),
      actividad: actividadDelDia,
      feedback,
      observaciones,
      evaluados,
      totalAlumnos
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registro))
    setGuardado(true)
    setModoEdicion(false)
    onGuardar?.(registro)
  }

  const editar = () => {
    setModoEdicion(true)
    setGuardado(false)
  }

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
            <ClipboardList className="w-4 h-4" />
            Registro de cierre
          </CardTitle>
          {!modoEdicion && (
            <button 
              type="button"
              className="text-xs px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center gap-1"
              onClick={editar}
            >
              <Pencil className="w-3 h-3" />
              Editar
            </button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex flex-col gap-3 flex-1">
        {/* Actividad del dia */}
        <div className="p-2.5 rounded-lg text-xs" style={{ backgroundColor: "#f8fafc" }}>
          <span className="text-slate-500">Actividad:</span>
          <span className="ml-1 font-medium text-slate-700">{actividadDelDia}</span>
          {totalAlumnos > 0 && (
            <span className="ml-2 text-slate-400">
              ({evaluados}/{totalAlumnos} evaluados)
            </span>
          )}
        </div>

        {/* Feedback buttons - siempre visibles */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500">
            Como funciono la actividad?
          </label>
          <div className="flex gap-2">
            {feedbackOptions.map((option) => {
              const Icon = option.icon
              const isSelected = feedback === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={!modoEdicion}
                  className={`flex-1 h-12 text-xs flex flex-col items-center justify-center rounded-lg border-2 transition-all
                    ${isSelected ? "text-white" : "bg-white text-slate-600 border-slate-200"}
                    ${modoEdicion ? "hover:border-slate-400 cursor-pointer" : "cursor-default"}
                  `}
                  style={isSelected ? { 
                    backgroundColor: option.bgColor, 
                    borderColor: option.bgColor
                  } : {}}
                  onClick={() => {
                    if (modoEdicion) {
                      setFeedback(option.value)
                    }
                  }}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Observaciones */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-medium text-slate-500">
            Observaciones (opcional)
          </label>
          <textarea
            placeholder="Algo que quieras recordar..."
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            disabled={!modoEdicion}
            className="flex-1 min-h-[60px] text-sm resize-none p-2 rounded-lg border border-slate-200 focus:border-slate-400 focus:outline-none disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>

        {/* Boton guardar */}
        {modoEdicion ? (
          <button
            type="button"
            onClick={guardar}
            className="w-full h-10 text-sm font-medium rounded-lg text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            <Save className="w-4 h-4" />
            Guardar cierre del dia
          </button>
        ) : (
          <div 
            className="w-full h-10 text-sm font-medium rounded-lg text-white flex items-center justify-center gap-2"
            style={{ backgroundColor: "#10b981" }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Registro guardado
          </div>
        )}
      </CardContent>
    </Card>
  )
}
