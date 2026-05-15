"use client"

import { useState } from "react"
import { User, Send, CheckCircle2, X } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

interface Student {
  id: string
  nombre: string
  apellido: string
  mesa?: string
}

type StatusLevel = "green" | "yellow" | "red"

interface SalaMapProps {
  students: Student[]
  progress: Record<string, { CF: number; CT: number; O: number }>
  evaluaciones?: Record<string, StatusLevel>  // Evaluaciones del dia
  onStudentClick: (id: string) => void
}

// Genera el mensaje de reporte para la familia basado en el progreso - SIN porcentajes
function generarReporteFamilia(nombre: string, progress: { CF: number; CT: number; O: number }): string {
  const getNivel = (percent: number) => {
    if (percent >= 70) return "avanza muy bien"
    if (percent >= 40) return "esta progresando"
    return "necesita un poco mas de practica"
  }

  const cf = getNivel(progress.CF)
  const ct = getNivel(progress.CT)
  const o = getNivel(progress.O)

  let mensaje = `Hola! Les comparto como viene ${nombre} en el aula:\n\n`
  mensaje += `En Conciencia Fonologica (reconocer sonidos): ${cf}.\n`
  mensaje += `En Conocimiento de Textos (entender cuentos): ${ct}.\n`
  mensaje += `En Oralidad (expresarse): ${o}.\n`

  const apoyo = []
  if (progress.CF < 40) apoyo.push("jugar con rimas y sonidos")
  if (progress.CT < 40) apoyo.push("leer cuentos juntos")
  if (progress.O < 40) apoyo.push("conversar sobre el dia")

  if (apoyo.length > 0) {
    mensaje += `\nEn casa pueden ayudar con: ${apoyo.join(", ")}.`
  }

  mensaje += "\n\nSaludos!"

  return mensaje
}

// Modal de reporte
function ReportModal({
  nombre,
  mensaje,
  onClose,
  onSend,
  sending,
}: {
  nombre: string
  mensaje: string
  onClose: () => void
  onSend: () => void
  sending: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: "#1e3a5f" }}>
            Reporte para familia de {nombre}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div
          className="rounded-xl p-4 mb-4 text-sm leading-relaxed whitespace-pre-line"
          style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
        >
          {mensaje}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onSend}
            disabled={sending}
            className="flex-1 py-2.5 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            {sending ? (
              <>
                <Spinner className="w-4 h-4" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function getColor(percent: number): string {
  if (percent >= 70) return "#10b981" // verde
  if (percent >= 40) return "#f59e0b" // amarillo
  return "#ef4444" // rojo
}

function getAverage(p: { CF: number; CT: number; O: number }): number {
  return Math.round((p.CF + p.CT + p.O) / 3)
}

export default function SalaMap({ students, progress, evaluaciones = {}, onStudentClick }: SalaMapProps) {
  const [reportsSent, setReportsSent] = useState<Record<string, boolean>>({})
  const [reportModal, setReportModal] = useState<{ student: Student; mensaje: string } | null>(null)
  const [sendingReport, setSendingReport] = useState(false)

  // SEMAFORO INTELIGENTE: Los no marcados = Logrado (verde)
  // Solo amarillo, rojo y azul son evaluaciones explicitas
  const grupos: { label: string; color: string; bgLight: string; alumnos: Student[] }[] = [
    { label: "Ausente",           color: "#6366f1", bgLight: "#e0e7ff", alumnos: [] },
    { label: "Necesita refuerzo", color: "#ef4444", bgLight: "#fef2f2", alumnos: [] },
    { label: "En proceso",        color: "#f59e0b", bgLight: "#fffbeb", alumnos: [] },
    { label: "Logrado",           color: "#10b981", bgLight: "#ecfdf5", alumnos: [] },
  ]

  students.forEach((s) => {
    const evalHoy = evaluaciones[s.id]
    
    // IMPORTANTE: Sin marca = verde (logrado por defecto)
    if (evalHoy === "blue") {
      grupos[0].alumnos.push(s) // Ausente
    } else if (evalHoy === "red") {
      grupos[1].alumnos.push(s) // Refuerzo
    } else if (evalHoy === "yellow") {
      grupos[2].alumnos.push(s) // En proceso
    } else {
      // Sin marca O green explícito = Logrado
      grupos[3].alumnos.push(s)
    }
  })

  function handleOpenReport(student: Student, e: React.MouseEvent) {
    e.stopPropagation() // Evitar que se abra el perfil
    const p = progress[student.id] || { CF: 100, CT: 100, O: 100 } // Default verde
    const mensaje = generarReporteFamilia(student.nombre, p)
    setReportModal({ student, mensaje })
  }

  async function handleSendReport() {
    if (!reportModal) return
    setSendingReport(true)
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setReportsSent((prev) => ({ ...prev, [reportModal.student.id]: true }))
    setSendingReport(false)
    setReportModal(null)
  }

  return (
    <>
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>Mapa de Progreso</h2>
          <p className="text-sm text-gray-500">Alumnos agrupados por nivel de avance</p>
        </div>

        {/* Grupos por color */}
        <div className="space-y-4">
          {grupos.map((grupo) => (
            <div
              key={grupo.label}
              className="rounded-2xl p-4"
              style={{ backgroundColor: grupo.bgLight, border: `2px solid ${grupo.color}30` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: grupo.color }}
                />
                <h3 className="text-sm font-bold" style={{ color: grupo.color }}>
                  {grupo.label}
                </h3>
                <span className="text-xs text-gray-500">
                  ({grupo.alumnos.length} alumno{grupo.alumnos.length !== 1 ? "s" : ""})
                </span>
              </div>

              {grupo.alumnos.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Sin alumnos en este nivel</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {grupo.alumnos.map((student) => {
                    const isReportSent = reportsSent[student.id] || false

                    return (
                      <div
                        key={student.id}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white border-2 transition-all hover:scale-105"
                        style={{ borderColor: grupo.color }}
                      >
                        <button
                          onClick={() => onStudentClick(student.id)}
                          className="flex flex-col items-center gap-1"
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: grupo.color }}
                          >
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-xs font-medium text-gray-700 truncate w-full text-center">
                            {student.nombre}
                          </span>
                        </button>
                        
                        {/* Boton enviar reporte - azul con check cuando enviado */}
                        <button
                          onClick={(e) => handleOpenReport(student, e)}
                          title={isReportSent ? "Reporte enviado" : "Enviar reporte a familia"}
                          className="mt-1 w-full py-1 rounded-lg flex items-center justify-center gap-1 text-white text-[10px] font-medium transition-all hover:scale-105"
                          style={{ backgroundColor: "#1e3a5f" }}
                        >
                          {isReportSent ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Enviado
                            </>
                          ) : (
                            <>
                              <Send className="w-3 h-3" />
                              Reporte
                            </>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal de reporte */}
      {reportModal && (
        <ReportModal
          nombre={reportModal.student.nombre}
          mensaje={reportModal.mensaje}
          onClose={() => setReportModal(null)}
          onSend={handleSendReport}
          sending={sendingReport}
        />
      )}
    </>
  )
}
