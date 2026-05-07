"use client"

import { useState, useEffect } from "react"
import { Save, ThumbsUp, Minus, AlertCircle, CheckCircle2, ClipboardList, Pencil } from "lucide-react"

interface QuickRegisterProps {
  actividadDelDia?: string
  evaluados?: number
  totalAlumnos?: number
}

const STORAGE_KEY = "alba_registro_cierre"

export function QuickRegister({ 
  actividadDelDia = "Reconocimiento de Sonido Inicial /M/",
  evaluados = 0,
  totalAlumnos = 0
}: QuickRegisterProps) {
  const [feedback, setFeedback] = useState<"bien" | "parcial" | "ajustar" | null>(null)
  const [observaciones, setObservaciones] = useState("")
  const [guardado, setGuardado] = useState(false)

  // Cargar registro guardado del dia
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.fecha === new Date().toDateString()) {
          setFeedback(parsed.feedback)
          setObservaciones(parsed.observaciones || "")
          setGuardado(true)
        }
      }
    } catch {
      // Ignorar errores
    }
  }, [])

  function handleGuardar() {
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
  }

  function handleEditar() {
    setGuardado(false)
  }

  function handleSelectFeedback(valor: "bien" | "parcial" | "ajustar") {
    if (!guardado) {
      setFeedback(valor)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md h-full flex flex-col border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
            <ClipboardList className="w-4 h-4" />
            Registro de cierre
          </h3>
          {guardado && (
            <button 
              type="button"
              onClick={handleEditar}
              className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center gap-0.5"
            >
              <Pencil className="w-2.5 h-2.5" />
              Editar
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-2 flex flex-col gap-2 flex-1 overflow-auto">
        {/* Actividad del dia */}
        <div className="p-2 rounded-lg text-[11px] bg-slate-50">
          <span className="text-slate-500">Actividad:</span>
          <span className="ml-1 font-medium text-slate-700">{actividadDelDia}</span>
          {totalAlumnos > 0 && (
            <span className="ml-1 text-slate-400">({evaluados}/{totalAlumnos})</span>
          )}
        </div>

        {/* Feedback buttons */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-slate-500">
            Como funciono?
          </label>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => handleSelectFeedback("bien")}
              disabled={guardado}
              className={`flex-1 h-9 text-[10px] flex flex-col items-center justify-center rounded-lg border transition-all
                ${feedback === "bien" ? "text-white bg-green-500 border-green-500" : "bg-white text-slate-600 border-slate-200"}
                ${guardado ? "opacity-60" : "cursor-pointer"}
              `}
            >
              <ThumbsUp className="w-3 h-3" />
              <span>Bien</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectFeedback("parcial")}
              disabled={guardado}
              className={`flex-1 h-9 text-[10px] flex flex-col items-center justify-center rounded-lg border transition-all
                ${feedback === "parcial" ? "text-white bg-amber-500 border-amber-500" : "bg-white text-slate-600 border-slate-200"}
                ${guardado ? "opacity-60" : "cursor-pointer"}
              `}
            >
              <Minus className="w-3 h-3" />
              <span>Parcial</span>
            </button>
            <button
              type="button"
              onClick={() => handleSelectFeedback("ajustar")}
              disabled={guardado}
              className={`flex-1 h-9 text-[10px] flex flex-col items-center justify-center rounded-lg border transition-all
                ${feedback === "ajustar" ? "text-white bg-red-500 border-red-500" : "bg-white text-slate-600 border-slate-200"}
                ${guardado ? "opacity-60" : "cursor-pointer"}
              `}
            >
              <AlertCircle className="w-3 h-3" />
              <span>Ajustar</span>
            </button>
          </div>
        </div>

        {/* Observaciones */}
        <div className="flex flex-col gap-1 flex-1 min-h-0">
          <label className="text-[10px] font-medium text-slate-500">Observaciones</label>
          <textarea
            placeholder="Algo que quieras recordar..."
            value={observaciones}
            onChange={(e) => !guardado && setObservaciones(e.target.value)}
            readOnly={guardado}
            className={`flex-1 min-h-[40px] text-xs resize-none p-2 rounded-lg border border-slate-200 focus:outline-none ${guardado ? "bg-slate-50 text-slate-500" : ""}`}
          />
        </div>

        {/* Boton guardar */}
        {guardado ? (
          <div className="w-full h-8 text-xs font-medium rounded-lg text-white flex items-center justify-center gap-1.5 bg-green-500">
            <CheckCircle2 className="w-3 h-3" />
            Guardado
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGuardar}
            className="w-full h-8 text-xs font-medium rounded-lg text-white flex items-center justify-center gap-1.5 hover:opacity-90"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            <Save className="w-3 h-3" />
            Guardar cierre
          </button>
        )}
      </div>
    </div>
  )
}
