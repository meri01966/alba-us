"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Save, ThumbsUp, Minus, AlertCircle, CheckCircle2, ClipboardList } from "lucide-react"

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
        }
      } catch {
        // Ignorar errores de parsing
      }
    }
  }, [])

  const feedbackOptions = [
    { value: "bien" as const, label: "Funciono bien", icon: ThumbsUp, bgColor: "#10b981" },
    { value: "parcial" as const, label: "Parcialmente", icon: Minus, bgColor: "#f59e0b" },
    { value: "ajustar" as const, label: "Ajustar", icon: AlertCircle, bgColor: "#ef4444" },
  ]

  const handleGuardar = () => {
    if (!feedback) return
    
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
    onGuardar?.(registro)
  }

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
          <ClipboardList className="w-4 h-4" />
          Registro de cierre
        </CardTitle>
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

        {/* Feedback buttons */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500">
            Como funciono la actividad?
          </label>
          <div className="flex gap-2">
            {feedbackOptions.map((option) => {
              const Icon = option.icon
              const isSelected = feedback === option.value
              return (
                <Button
                  key={option.value}
                  variant="outline"
                  size="sm"
                  className={`flex-1 h-10 text-xs gap-1 transition-all ${
                    isSelected ? "ring-2 ring-offset-1" : ""
                  }`}
                  style={isSelected ? { 
                    backgroundColor: option.bgColor, 
                    color: "#fff",
                    borderColor: option.bgColor,
                    ringColor: option.bgColor
                  } : {}}
                  onClick={() => {
                    setFeedback(option.value)
                    setGuardado(false)
                  }}
                  disabled={guardado}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{option.label}</span>
                </Button>
              )
            })}
          </div>
        </div>

        {/* Observaciones */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-xs font-medium text-slate-500">
            Observaciones (opcional)
          </label>
          <Textarea
            placeholder="Algo que quieras recordar para manana..."
            value={observaciones}
            onChange={(e) => {
              setObservaciones(e.target.value)
              setGuardado(false)
            }}
            className="flex-1 min-h-[60px] text-sm resize-none"
            disabled={guardado}
          />
        </div>

        {/* Save button */}
        <Button
          className="w-full h-10 text-sm font-medium"
          style={{ backgroundColor: guardado ? "#10b981" : "#1e3a5f" }}
          disabled={!feedback || guardado}
          onClick={handleGuardar}
        >
          {guardado ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Registro guardado
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar cierre del dia
            </>
          )}
        </Button>
        
        {guardado && (
          <button 
            className="text-xs text-slate-500 hover:text-slate-700 underline"
            onClick={() => setGuardado(false)}
          >
            Editar registro
          </button>
        )}
      </CardContent>
    </Card>
  )
}
