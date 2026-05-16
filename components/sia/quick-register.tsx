"use client"

import { useState } from "react"
import { Send, ThumbsUp, Minus, AlertCircle, CheckCircle2, Pencil } from "lucide-react"

interface QuickRegisterProps {
  actividadDelDia?: string
  evaluados?: number
  totalAlumnos?: number
}

export function QuickRegister({
  actividadDelDia = "Reconocimiento de Sonido Inicial /M/",
  evaluados = 0,
  totalAlumnos = 0,
}: QuickRegisterProps) {
  const [mostrarModal, setMostrarModal] = useState(false)
  const [feedback, setFeedback] = useState<"bien" | "parcial" | "ajustar" | null>(null)
  const [observaciones, setObservaciones] = useState("")
  const [enviado, setEnviado] = useState(false)

  function handleEnviar() {
    if (!feedback) return
    setEnviado(true)
    setMostrarModal(false)
  }

  function handleEditar() {
    setEnviado(false)
    setMostrarModal(true)
  }

  return (
    <>
      {/* Bloque visible en el dashboard */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-4 flex flex-col gap-3">
        <h3 className="text-base font-semibold" style={{ color: "#1e3a5f" }}>
          Finalizar Jornada
        </h3>

        {enviado ? (
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

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Header azul */}
            <div className="p-4 flex items-center justify-between" style={{ backgroundColor: "#1e40af" }}>
              <h3 className="font-bold text-white text-base">Finalizar Jornada</h3>
              <button
                onClick={() => setMostrarModal(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              {/* Actividad del dia */}
              <div className="p-3 rounded-lg bg-slate-50 text-sm">
                <span className="text-slate-500">Actividad:</span>
                <span className="ml-1 font-medium text-slate-700">{actividadDelDia}</span>
                {totalAlumnos > 0 && (
                  <span className="ml-2 text-slate-400">({evaluados}/{totalAlumnos} evaluados)</span>
                )}
              </div>

              {/* Como funciono */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-600">
                  Como funciono la actividad?
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFeedback("bien")}
                    className={`flex-1 h-12 text-xs flex flex-col items-center justify-center rounded-lg border-2 transition-all
                      ${feedback === "bien" ? "text-white bg-green-500 border-green-500" : "bg-white text-slate-600 border-slate-200 hover:border-green-300"}`}
                  >
                    <ThumbsUp className="w-4 h-4 mb-0.5" />
                    Bien
                  </button>
                  <button
                    onClick={() => setFeedback("parcial")}
                    className={`flex-1 h-12 text-xs flex flex-col items-center justify-center rounded-lg border-2 transition-all
                      ${feedback === "parcial" ? "text-white bg-amber-500 border-amber-500" : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"}`}
                  >
                    <Minus className="w-4 h-4 mb-0.5" />
                    Parcial
                  </button>
                  <button
                    onClick={() => setFeedback("ajustar")}
                    className={`flex-1 h-12 text-xs flex flex-col items-center justify-center rounded-lg border-2 transition-all
                      ${feedback === "ajustar" ? "text-white bg-red-500 border-red-500" : "bg-white text-slate-600 border-slate-200 hover:border-red-300"}`}
                  >
                    <AlertCircle className="w-4 h-4 mb-0.5" />
                    Ajustar
                  </button>
                </div>
              </div>

              {/* Observaciones */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-600">Observaciones (opcional)</label>
                <textarea
                  placeholder="Algo que quieras recordar..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="min-h-[70px] text-sm resize-none p-2.5 rounded-lg border border-slate-200 focus:border-blue-400 focus:outline-none"
                />
              </div>

              {/* Boton Enviar */}
              <button
                onClick={handleEnviar}
                disabled={!feedback}
                className="w-full h-11 text-sm font-semibold text-white rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                style={{ backgroundColor: "#1e40af" }}
              >
                <Send className="w-4 h-4" />
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
