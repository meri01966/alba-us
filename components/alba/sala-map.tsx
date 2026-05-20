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

// blue = ausente (marcado explicitamente)
// undefined = sin evaluar aun (gris - dia 0 o clase sin marcar)
// green/yellow/red = marcado explicitamente por la docente
type StatusLevel = "green" | "yellow" | "red" | "blue"

interface SalaMapProps {
  students: Student[]
  progress: Record<string, { CF: number | null; CT: number | null; O: number | null }>
  evaluaciones?: Record<string, StatusLevel>
  onStudentClick: (id: string) => void
}

// Genera el mensaje de reporte para la familia basado en el progreso - SIN porcentajes
// Solo incluye ejes que tienen datos reales (no null)
function generarReporteFamilia(nombre: string, progress: { CF: number | null; CT: number | null; O: number | null }): string {
  const getNivel = (percent: number) => {
    if (percent >= 70) return "avanza muy bien"
    if (percent >= 40) return "esta progresando"
    return "necesita un poco mas de practica"
  }

  const lineas: string[] = []
  const apoyo: string[] = []

  if (progress.CF !== null) {
    lineas.push(`En Conciencia Fonologica (reconocer sonidos): ${getNivel(progress.CF)}.`)
    if (progress.CF < 40) apoyo.push("jugar con rimas y sonidos")
  }
  if (progress.CT !== null) {
    lineas.push(`En Comprension de Textos (entender cuentos): ${getNivel(progress.CT)}.`)
    if (progress.CT < 40) apoyo.push("leer cuentos juntos")
  }
  if (progress.O !== null) {
    lineas.push(`En Oralidad (expresarse): ${getNivel(progress.O)}.`)
    if (progress.O < 40) apoyo.push("conversar sobre el dia")
  }

  if (lineas.length === 0) {
    return ""
  }

  let mensaje = `Hola! Les comparto como viene ${nombre} en el aula:\n\n`
  mensaje += lineas.join("\n") + "\n"

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

        {mensaje ? (
          <>
            <div
              className="rounded-xl p-4 mb-4 text-sm leading-relaxed whitespace-pre-line"
              style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0" }}
            >
              {mensaje}
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50">
                Cancelar
              </button>
              <button
                onClick={onSend}
                disabled={sending}
                className="flex-1 py-2.5 rounded-xl font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: "#1e3a5f" }}
              >
                {sending ? <><Spinner className="w-4 h-4" /> Enviando...</> : <><Send className="w-4 h-4" /> Enviar</>}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="rounded-xl p-5 mb-4 text-center bg-slate-50 border border-slate-200">
              <p className="text-sm font-semibold text-slate-600 mb-1">Sin datos todavia</p>
              <p className="text-xs text-slate-400">El reporte se generara cuando la docente marque al alumno durante la clase.</p>
            </div>
            <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50">
              Cerrar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function getColor(percent: number): string {
  if (percent >= 70) return "#10b981" // verde
  if (percent >= 40) return "#f59e0b" // amarillo
  return "#ef4444" // rojo
}

function getAverage(p: { CF: number | null; CT: number | null; O: number | null }): number {
  const vals = [p.CF, p.CT, p.O].filter(v => v !== null) as number[]
  if (vals.length === 0) return 0
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

export default function SalaMap({ students, progress, evaluaciones = {}, onStudentClick }: SalaMapProps) {
  const [reportsSent, setReportsSent] = useState<Record<string, boolean>>({})
  const [reportModal, setReportModal] = useState<{ student: Student; mensaje: string } | null>(null)
  const [sendingReport, setSendingReport] = useState(false)

  // 4 grupos - los no marcados van directo a Logrado (verde)
  const grupos: { label: string; color: string; bgLight: string; borderColor: string; alumnos: Student[] }[] = [
    { label: "Ausente",           color: "#6366f1", bgLight: "#f5f3ff", borderColor: "#c4b5fd", alumnos: [] },
    { label: "Necesita refuerzo", color: "#ef4444", bgLight: "#fef2f2", borderColor: "#fca5a5", alumnos: [] },
    { label: "En proceso",        color: "#f59e0b", bgLight: "#fffbeb", borderColor: "#fcd34d", alumnos: [] },
    { label: "Logrado",           color: "#10b981", bgLight: "#ecfdf5", borderColor: "#6ee7b7", alumnos: [] },
  ]

  // ALBA: los alumnos no marcados (ni rojo ni amarillo ni ausente) se consideran verdes automaticamente
  students.forEach((s) => {
    const eval_ = evaluaciones[s.id]
    if      (eval_ === "blue")   grupos[0].alumnos.push(s)  // Ausente
    else if (eval_ === "red")    grupos[1].alumnos.push(s)  // Refuerzo
    else if (eval_ === "yellow") grupos[2].alumnos.push(s)  // En proceso
    else                         grupos[3].alumnos.push(s)  // Logrado (verde por defecto o marcado)
  })

  function handleOpenReport(student: Student, e: React.MouseEvent) {
    e.stopPropagation()
    const p = progress[student.id] || { CF: null, CT: null, O: null }
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
          <p className="text-sm text-gray-500">Los alumnos se ubican al marcarlos durante la clase</p>
        </div>

        {/* Grupos por color */}
        <div className="space-y-4">
          {grupos.map((grupo) => (
            <div
              key={grupo.label}
              className="rounded-2xl p-4"
              style={{ backgroundColor: grupo.bgLight, border: `2px solid ${grupo.borderColor}` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: grupo.color }} />
                <h3 className="text-sm font-bold" style={{ color: grupo.color }}>{grupo.label}</h3>
                <span className="text-xs text-gray-400">({grupo.alumnos.length})</span>
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
                        style={{ borderColor: grupo.borderColor }}
                      >
                        <button onClick={() => onStudentClick(student.id)} className="flex flex-col items-center gap-1">
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
                        <button
                          onClick={(e) => handleOpenReport(student, e)}
                          title={isReportSent ? "Reporte enviado" : "Enviar reporte a familia"}
                          className="mt-1 w-full py-1 rounded-lg flex items-center justify-center gap-1 text-white text-[10px] font-medium transition-all hover:scale-105"
                          style={{ backgroundColor: "#1e3a5f" }}
                        >
                          {isReportSent ? (
                            <><CheckCircle2 className="w-3 h-3" /> Enviado</>
                          ) : (
                            <><Send className="w-3 h-3" /> Reporte</>
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
