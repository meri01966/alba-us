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
    <div className="bg-white rounded-xl shadow-md h-full flex flex-col border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
            <ClipboardList className="w-4 h-4" />
            Registro de cierre
          </h3>
          {guardado && (
            <button 
              type="button"
              onClick={handleEditar}
              className="text-xs px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" />
              Editar
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Actividad del dia */}
        <div className="p-2.5 rounded-lg text-xs bg-slate-50">
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
            {/* Boton BIEN */}
            <button
              type="button"
              onClick={() => handleSelectFeedback("bien")}
              disabled={guardado}
              className={`flex-1 h-12 text-xs flex flex-col items-center justify-center rounded-lg border-2 transition-all
                ${feedback === "bien" ? "text-white bg-green-500 border-green-500" : "bg-white text-slate-600 border-slate-200 hover:border-green-300"}
                ${guardado ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <ThumbsUp className="w-4 h-4 mb-0.5" />
              <span>Bien</span>
            </button>

            {/* Boton PARCIAL */}
            <button
              type="button"
              onClick={() => handleSelectFeedback("parcial")}
              disabled={guardado}
              className={`flex-1 h-12 text-xs flex flex-col items-center justify-center rounded-lg border-2 transition-all
                ${feedback === "parcial" ? "text-white bg-amber-500 border-amber-500" : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"}
                ${guardado ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <Minus className="w-4 h-4 mb-0.5" />
              <span>Parcial</span>
            </button>

            {/* Boton AJUSTAR */}
            <button
              type="button"
              onClick={() => handleSelectFeedback("ajustar")}
              disabled={guardado}
              className={`flex-1 h-12 text-xs flex flex-col items-center justify-center rounded-lg border-2 transition-all
                ${feedback === "ajustar" ? "text-white bg-red-500 border-red-500" : "bg-white text-slate-600 border-slate-200 hover:border-red-300"}
                ${guardado ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <AlertCircle className="w-4 h-4 mb-0.5" />
              <span>Ajustar</span>
            </button>
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
            onChange={(e) => !guardado && setObservaciones(e.target.value)}
            readOnly={guardado}
            className={`flex-1 min-h-[60px] text-sm resize-none p-2 rounded-lg border border-slate-200 focus:border-slate-400 focus:outline-none ${guardado ? "bg-slate-50 text-slate-500" : ""}`}
          />
        </div>

        {/* Boton guardar o estado guardado */}
        {guardado ? (
          <div className="w-full h-10 text-sm font-medium rounded-lg text-white flex items-center justify-center gap-2 bg-green-500">
            <CheckCircle2 className="w-4 h-4" />
            Registro guardado
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGuardar}
            className="w-full h-10 text-sm font-medium rounded-lg text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            <Save className="w-4 h-4" />
            Guardar cierre del dia
          </button>
        )}
      </div>
    </div>
  )
}
