"use client"

import type { ChangeEvent } from "react"
import { useState, useEffect, useRef } from "react"
import { Send, CheckCircle2, Pencil, MessageSquare } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface QuickRegisterProps {
  actividadDelDia?: string
  evaluados?: number
  totalAlumnos?: number
  statsVerdes?: number
  statsAmarillos?: number
  statsRojos?: number
  statsAusentes?: number
  onGuardar?: (data: {
    evaluacion: string
    observaciones: string
    sugerencia: string
    repetir: boolean | null
  }) => void
}

export function QuickRegister({
  actividadDelDia = "",
  evaluados = 0,
  totalAlumnos = 0,
  statsVerdes = 0,
  statsAmarillos = 0,
  statsRojos = 0,
  statsAusentes = 0,
  onGuardar,
}: QuickRegisterProps) {
  const [mostrarModal, setMostrarModal]   = useState(false)
  const [evaluacion, setEvaluacion]       = useState<"excelente" | "buena" | "regular" | "necesita_mejora" | null>(null)
  const [repetir, setRepetir]             = useState<boolean | null>(null)
  const [observaciones, setObservaciones] = useState("")
  const [guardado, setGuardado]           = useState(false)
  const prevActividad = useRef(actividadDelDia)

  // Cuando ALBA sugiere una nueva actividad, resetear el boton para la proxima jornada
  useEffect(() => {
    if (prevActividad.current !== actividadDelDia) {
      prevActividad.current = actividadDelDia
      setGuardado(false)
      setEvaluacion(null)
      setRepetir(null)
      setObservaciones("")
    }
  }, [actividadDelDia])

  function handleGuardar() {
    if (!evaluacion) return
    // sugerencia se mantiene por compatibilidad con quien consume este callback
    onGuardar?.({ evaluacion, observaciones, sugerencia: "", repetir })
    setGuardado(true)
    setMostrarModal(false)
  }

  function handleEditar() {
    setGuardado(false)
    setMostrarModal(true)
  }

  return (
    <>
      {/* Bloque visible en el dashboard */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 flex flex-col gap-3">
        <h3 className="text-base font-semibold" style={{ color: "#1e3a5f" }}>
          Finalizar Jornada
        </h3>

        {guardado ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Jornada registrada
            </div>
            <button
              onClick={handleEditar}
              className="text-xs px-2 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-700 flex items-center gap-1"
            >
              <Pencil className="w-3 h-3" />
              Editar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setMostrarModal(true)}
            className="w-full h-10 text-sm font-semibold text-white rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-all"
            style={{ backgroundColor: "#1e40af" }}
          >
            <Send className="w-4 h-4" />
            Finalizar Jornada
          </button>
        )}
      </div>

      {/* Modal Finalizar Jornada */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Header azul */}
            <div
              className="p-4 flex items-center justify-between sticky top-0"
              style={{ backgroundColor: "#1e40af" }}
            >
              <h3 className="font-bold text-white text-base">Finalizar Jornada</h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg text-white"
                aria-label="Cerrar"
              >
                <span className="text-lg leading-none">✕</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {/* Actividad del dia */}
              {actividadDelDia ? (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                  <span className="text-slate-500 font-medium">Actividad:</span>
                  <span className="ml-1 text-slate-700">{actividadDelDia}</span>
                  {totalAlumnos > 0 && (
                    <span className="ml-2 text-slate-400 text-xs">
                      ({evaluados}/{totalAlumnos} evaluados)
                    </span>
                  )}
                </div>
              ) : null}

              {/* Como resulto */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Como resulto?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "excelente",       label: "Excelente",       color: "#10b981" },
                    { value: "buena",           label: "Buena",           color: "#3b82f6" },
                    { value: "regular",         label: "Regular",         color: "#f59e0b" },
                    { value: "necesita_mejora", label: "Necesita mejora", color: "#ef4444" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setEvaluacion(opt.value as typeof evaluacion)}
                      className="px-3 py-2.5 text-sm font-medium rounded-lg border-2 transition-all"
                      style={
                        evaluacion === opt.value
                          ? { backgroundColor: opt.color, color: "#fff", borderColor: opt.color }
                          : { backgroundColor: "#fff", color: opt.color, borderColor: opt.color + "50" }
                      }
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Volvemos sobre este contenido — decide si ALBA repite el paso o avanza */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">
                  Volvemos sobre este contenido?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setRepetir(true)}
                    className="px-3 py-2.5 text-sm font-medium rounded-lg border-2 transition-all"
                    style={
                      repetir === true
                        ? { backgroundColor: "#7c3aed", color: "#fff", borderColor: "#7c3aed" }
                        : { backgroundColor: "#fff", color: "#7c3aed", borderColor: "#7c3aed50" }
                    }
                  >
                    Si, necesitan mas
                  </button>
                  <button
                    onClick={() => setRepetir(false)}
                    className="px-3 py-2.5 text-sm font-medium rounded-lg border-2 transition-all"
                    style={
                      repetir === false
                        ? { backgroundColor: "#0f766e", color: "#fff", borderColor: "#0f766e" }
                        : { backgroundColor: "#fff", color: "#0f766e", borderColor: "#0f766e50" }
                    }
                  >
                    No, seguimos
                  </button>
                </div>
              </div>

              {/* Comentarios */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Comentarios (opcional)
                </label>
                <Textarea
                  placeholder="Algo que quieras dejar anotado de esta jornada"
                  value={observaciones}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setObservaciones(e.target.value)}
                  className="min-h-[70px] text-sm resize-none"
                />
              </div>

              {/* Resumen chico, como referencia */}
              <p className="text-xs text-slate-400 text-center">
                {statsVerdes} logrado · {statsAmarillos} en proceso · {statsRojos} refuerzo · {statsAusentes} ausentes
              </p>

              {/* Boton Guardar */}
              <button
                onClick={handleGuardar}
                disabled={!evaluacion}
                className="w-full h-11 text-sm font-semibold text-white rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40 hover:opacity-90"
                style={{ backgroundColor: "#1e40af" }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
