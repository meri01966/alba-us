"use client"

import { useState, useEffect, useCallback } from "react"
import useSWR from "swr"
import { 
  BookOpen, Calendar, User, CheckCircle2, Clock, AlertCircle, 
  Send, X, BrainCircuit, ChevronRight, FileText, ListChecks
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

// ── Types ──────────────────────────────────────────────────────────────────
type StatusLevel = "green" | "yellow" | "red"

interface Student {
  id: string
  name: string
  cf: StatusLevel
  rl: StatusLevel
  o: StatusLevel
}

// ── Constants ──────────────────────────────────────────────────────────────
const ACTIVIDAD_DEL_DIA = "Reconocimiento de Sonido Inicial /M/"
const EJE_DEL_DIA = "CF"

const EVAL_OPTIONS = [
  { value: "green" as StatusLevel, label: "Logrado", icon: CheckCircle2, color: "#10b981", bgLight: "#d1fae5" },
  { value: "yellow" as StatusLevel, label: "En proceso", icon: Clock, color: "#fbbf24", bgLight: "#fef3c7" },
  { value: "red" as StatusLevel, label: "Refuerzo", icon: AlertCircle, color: "#ef4444", bgLight: "#fee2e2" },
]

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// ── Helper Functions ───────────────────────────────────────────────────────
function statusToProgress(status: StatusLevel): number {
  if (status === "green") return 100
  if (status === "yellow") return 50
  return 10
}

function getProgressColor(percent: number): string {
  if (percent >= 70) return "#10b981"
  if (percent >= 40) return "#f59e0b"
  return "#ef4444"
}

function generarReporteFamilia(nombre: string, progress: { CF: number; CT: number; O: number }): string {
  const getNivel = (p: number) => p >= 70 ? "avanza muy bien" : p >= 40 ? "esta progresando" : "necesita apoyo"
  let msg = `Hola! Les comparto el avance de ${nombre}:\n\n`
  msg += `Conciencia Fonologica: ${getNivel(progress.CF)} (${progress.CF}%)\n`
  msg += `Conocimiento de Textos: ${getNivel(progress.CT)} (${progress.CT}%)\n`
  msg += `Oralidad: ${getNivel(progress.O)} (${progress.O}%)\n`
  const apoyo = []
  if (progress.CF < 40) apoyo.push("sonidos y letras")
  if (progress.CT < 40) apoyo.push("lectura de cuentos")
  if (progress.O < 40) apoyo.push("conversacion")
  if (apoyo.length > 0) msg += `\nPracticar en casa: ${apoyo.join(", ")}.`
  msg += "\n\nSaludos, Seño"
  return msg
}

// ── Sintesis Pedagogica Modal ──────────────────────────────────────────────
function SintesisPedagogicaModal({ 
  counts, 
  totalStudents,
  actividad,
  onClose 
}: { 
  counts: { red: number; yellow: number; green: number }
  totalStudents: number
  actividad: string
  onClose: () => void 
}) {
  const [bulletMode, setBulletMode] = useState(false)
  const porcentajeAvanzado = totalStudents > 0 ? Math.round((counts.green / totalStudents) * 100) : 0
  const porcentajeProceso = totalStudents > 0 ? Math.round((counts.yellow / totalStudents) * 100) : 0
  const porcentajeRefuerzo = totalStudents > 0 ? Math.round((counts.red / totalStudents) * 100) : 0

  const propositos = `Durante este periodo, nuestro foco principal fue la estimulacion de la conciencia fonologica, especificamente la identificacion de fonemas base para iniciar el proceso de alfabetizacion. Trabajamos con la actividad "${actividad}" para fortalecer el reconocimiento auditivo y la asociacion sonido-palabra.`

  const logros = porcentajeAvanzado >= 50
    ? `Hemos observado un avance consolidado en el ${porcentajeAvanzado}% de la sala, quienes ya logran discriminar sonidos con autonomia. El grupo muestra una maduracion notable en la escucha atenta y la asociacion fonema-grafema.`
    : porcentajeProceso >= 30
    ? `El ${porcentajeProceso}% de la sala esta en proceso de consolidacion, mostrando avances graduales en la discriminacion de sonidos. El ${porcentajeAvanzado}% ya domina estas habilidades con autonomia.`
    : `Identificamos que el ${porcentajeRefuerzo}% de la sala requiere acompanamiento adicional. Estamos implementando estrategias diferenciadas para fortalecer estas habilidades fundamentales.`

  const estrategias = `Implementamos dinamicas de rimas, juegos sonoros grupales y el uso de nuestras fichas diagnosticas para personalizar el apoyo segun la necesidad de cada nino. Utilizamos canciones con repeticion de fonemas, imagenes asociativas y actividades de segmentacion silabica.`

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8"
        style={{ 
          backgroundImage: "linear-gradient(to bottom, #fefefe 0%, #f9f9f9 100%)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        }}
      >
        {/* Header elegante */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#1e3a5f" }}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "#1e3a5f", fontFamily: "Georgia, serif" }}>
                  Sintesis Pedagogica
                </h2>
                <p className="text-sm text-slate-500">Sala Manzanos · Dia 37</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Contenido del reporte */}
        <div className="p-6 space-y-6" style={{ fontFamily: "Georgia, serif" }}>
          
          {/* Bloque 1: Propositos */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#1e3a5f" }}>1</div>
              <h3 className="font-bold text-lg" style={{ color: "#1e3a5f" }}>Que nos propusimos</h3>
            </div>
            {bulletMode ? (
              <ul className="list-disc list-inside text-slate-700 leading-relaxed space-y-1 ml-8">
                <li>Foco en conciencia fonologica</li>
                <li>Identificacion de fonemas base</li>
                <li>Actividad: {actividad}</li>
                <li>Reconocimiento auditivo y asociacion sonido-palabra</li>
              </ul>
            ) : (
              <p className="text-slate-700 leading-relaxed ml-8">{propositos}</p>
            )}
          </section>

          {/* Bloque 2: Logros */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#10b981" }}>2</div>
              <h3 className="font-bold text-lg" style={{ color: "#10b981" }}>Que logramos</h3>
            </div>
            {bulletMode ? (
              <ul className="list-disc list-inside text-slate-700 leading-relaxed space-y-1 ml-8">
                <li>{counts.green} alumnos avanzados ({porcentajeAvanzado}%)</li>
                <li>{counts.yellow} alumnos en proceso ({porcentajeProceso}%)</li>
                <li>{counts.red} alumnos requieren refuerzo ({porcentajeRefuerzo}%)</li>
                <li>El grupo muestra maduracion en escucha atenta</li>
              </ul>
            ) : (
              <p className="text-slate-700 leading-relaxed ml-8">{logros}</p>
            )}
            {/* Mini grafico */}
            <div className="flex gap-1 mt-3 ml-8 h-3 rounded-full overflow-hidden bg-slate-100">
              <div style={{ width: `${porcentajeAvanzado}%`, backgroundColor: "#10b981" }} />
              <div style={{ width: `${porcentajeProceso}%`, backgroundColor: "#f59e0b" }} />
              <div style={{ width: `${porcentajeRefuerzo}%`, backgroundColor: "#ef4444" }} />
            </div>
          </section>

          {/* Bloque 3: Estrategias */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#f59e0b" }}>3</div>
              <h3 className="font-bold text-lg" style={{ color: "#f59e0b" }}>Como lo hicimos</h3>
            </div>
            {bulletMode ? (
              <ul className="list-disc list-inside text-slate-700 leading-relaxed space-y-1 ml-8">
                <li>Dinamicas de rimas</li>
                <li>Juegos sonoros grupales</li>
                <li>Fichas diagnosticas personalizadas</li>
                <li>Canciones con repeticion de fonemas</li>
                <li>Actividades de segmentacion silabica</li>
              </ul>
            ) : (
              <p className="text-slate-700 leading-relaxed ml-8">{estrategias}</p>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 italic">
              Este informe es una sintesis del recorrido grupal registrado en ALBA.
            </p>
            <button
              onClick={() => setBulletMode(!bulletMode)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all hover:scale-105"
              style={{ 
                backgroundColor: bulletMode ? "#1e3a5f" : "#f1f5f9", 
                color: bulletMode ? "#fff" : "#1e3a5f" 
              }}
            >
              <ListChecks className="w-4 h-4" />
              {bulletMode ? "Ver narrativa" : "Preparar para Reunion"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Report Modal ───────────────────────────────────────────────────────────
function ReportModal({ nombre, mensaje, onClose, onSend, sending }: {
  nombre: string; mensaje: string; onClose: () => void; onSend: () => void; sending: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold" style={{ color: "#1e3a5f" }}>Reporte: {nombre}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="rounded-xl p-4 mb-4 text-sm leading-relaxed whitespace-pre-line bg-slate-50 border border-slate-200">
          {mensaje}
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50">
            Cancelar
          </button>
          <button onClick={onSend} disabled={sending} className="flex-1 py-2.5 rounded-xl font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50" style={{ backgroundColor: "#1e3a5f" }}>
            {sending ? <><Spinner className="w-4 h-4" /> Enviando...</> : <><Send className="w-4 h-4" /> Enviar</>}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function ALBADashboard() {
  const { data: studentsData, isLoading } = useSWR<{ students: Student[]; source: string }>("/api/students", fetcher)
  const { data: brainData } = useSWR<{ activity: { titulo: string; descripcion: string; objetivo: string } }>("/api/brain", fetcher)

  const [evaluaciones, setEvaluaciones] = useState<Record<string, StatusLevel>>({})
  const [progress, setProgress] = useState<Record<string, { CF: number; CT: number; O: number }>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [reportsSent, setReportsSent] = useState<Record<string, boolean>>({})
  const [reportModal, setReportModal] = useState<{ nombre: string; mensaje: string; id: string } | null>(null)
  const [sendingReport, setSendingReport] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [showSintesis, setShowSintesis] = useState(false)

  const students = studentsData?.students ?? []
  const activity = brainData?.activity

  // Load initial progress
  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch("/api/progreso")
        const data = await res.json()
        if (data.ok) setProgress(data.progreso)
      } catch {}
    }
    loadProgress()
  }, [])

  // Handle evaluation
  const handleEval = useCallback(async (student: Student, status: StatusLevel) => {
    setSavingId(student.id)
    setEvaluaciones(prev => ({ ...prev, [student.id]: status }))
    setProgress(prev => ({
      ...prev,
      [student.id]: { ...(prev[student.id] || { CF: 0, CT: 0, O: 0 }), [EJE_DEL_DIA]: statusToProgress(status) }
    }))
    try {
      await fetch("/api/registrar-actividad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, field: EJE_DEL_DIA, status, actividad: ACTIVIDAD_DEL_DIA }),
      })
    } catch {}
    setSavingId(null)
  }, [])

  // Handle report
  const handleOpenReport = (student: Student) => {
    const p = progress[student.id] || { CF: 0, CT: 0, O: 0 }
    const nombre = student.name.split(" ")[0]
    setReportModal({ nombre, mensaje: generarReporteFamilia(nombre, p), id: student.id })
  }

  const handleSendReport = async () => {
    if (!reportModal) return
    setSendingReport(true)
    await new Promise(r => setTimeout(r, 1000))
    setReportsSent(prev => ({ ...prev, [reportModal.id]: true }))
    setSendingReport(false)
    setReportModal(null)
  }

  // Get student progress
  const getStudentProgress = (id: string) => progress[id] || { CF: 0, CT: 0, O: 0 }
  const getAvg = (p: { CF: number; CT: number; O: number }) => Math.round((p.CF + p.CT + p.O) / 3)

  // Count by level
  const counts = { red: 0, yellow: 0, green: 0 }
  students.forEach(s => {
    const avg = getAvg(getStudentProgress(s.id))
    if (avg >= 70) counts.green++
    else if (avg >= 40) counts.yellow++
    else counts.red++
  })

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f8fafc" }}>
      {/* Header compacto */}
      <header className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "#1e3a5f" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
            <BookOpen className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">ALBA</h1>
            <p className="text-xs text-white/60">Sala Manzanos</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-white text-sm">
          {/* Boton Sintesis Pedagogica */}
          <button
            onClick={() => setShowSintesis(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sintesis</span>
          </button>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-white/60" />
            <span className="font-semibold">Dia 37</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:inline">Mariana</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-3 sm:p-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* LEFT: Registro del aula */}
          <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col" style={{ maxHeight: "calc(100vh - 140px)" }}>
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-base" style={{ color: "#1e3a5f" }}>Registro del aula</h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {students.length} alumnos
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: "#1e3a5f08" }}>
                <BrainCircuit className="w-4 h-4" style={{ color: "#1e3a5f" }} />
                <span className="text-xs font-medium" style={{ color: "#1e3a5f" }}>{ACTIVIDAD_DEL_DIA}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">CF</span>
              </div>
              <div className="flex gap-4 mt-2">
                {EVAL_OPTIONS.map(opt => (
                  <div key={opt.value} className="flex items-center gap-1 text-xs text-slate-500">
                    <opt.icon className="w-3.5 h-3.5" style={{ color: opt.color }} />
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              {isLoading ? (
                <div className="flex items-center justify-center py-10"><Spinner /></div>
              ) : (
                <ul className="space-y-1.5">
                  {students.map(student => {
                    const currentStatus = evaluaciones[student.id] || null
                    const p = getStudentProgress(student.id)
                    const avg = getAvg(p)
                    const isSelected = selectedStudent === student.id
                    return (
                      <li 
                        key={student.id} 
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all cursor-pointer ${isSelected ? "border-blue-400 bg-blue-50" : "border-slate-100 hover:border-slate-200 bg-white"}`}
                        onClick={() => setSelectedStudent(isSelected ? null : student.id)}
                      >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: getProgressColor(avg) }}>
                          {avg}
                        </div>
                        <span className="flex-1 text-sm font-medium text-slate-700 truncate">{student.name}</span>
                        <div className="flex items-center gap-1">
                          {EVAL_OPTIONS.map(opt => {
                            const Icon = opt.icon
                            const isChosen = currentStatus === opt.value
                            return (
                              <button
                                key={opt.value}
                                onClick={(e) => { e.stopPropagation(); handleEval(student, opt.value) }}
                                disabled={savingId === student.id}
                                className="w-7 h-7 rounded-lg border flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
                                style={{ 
                                  backgroundColor: isChosen ? opt.color : opt.bgLight, 
                                  borderColor: opt.color,
                                  color: isChosen ? "#fff" : opt.color 
                                }}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </button>
                            )
                          })}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleOpenReport(student) }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-white transition-all hover:scale-110"
                          style={{ backgroundColor: "#1e3a5f" }}
                          title="Enviar reporte"
                        >
                          {reportsSent[student.id] ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                        </button>
                        {savingId === student.id && <Spinner className="w-4 h-4" />}
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* CENTER: Actividad + Detalle alumno */}
          <div className="lg:col-span-4 space-y-4">
            {/* Actividad del dia */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1e3a5f15" }}>
                  <BrainCircuit className="w-4 h-4" style={{ color: "#1e3a5f" }} />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: "#1e3a5f" }}>Actividad del dia</h3>
                  <p className="text-xs text-slate-500">Sugerencia ALBA</p>
                </div>
              </div>
              {activity ? (
                <div className="space-y-3">
                  <p className="font-semibold text-slate-800">{activity.titulo}</p>
                  {activity.objetivo && (
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                      <p className="text-xs font-medium text-emerald-700 mb-1">Objetivo</p>
                      <p className="text-sm text-emerald-800">{activity.objetivo}</p>
                    </div>
                  )}
                  {activity.descripcion && (
                    <div className="p-3 rounded-lg bg-slate-50">
                      <p className="text-xs font-medium text-slate-500 mb-1">Pasos</p>
                      <p className="text-sm text-slate-700 whitespace-pre-line">{activity.descripcion}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-4">Cargando actividad...</p>
              )}
            </div>

            {/* Detalle alumno seleccionado */}
            {selectedStudent && (
              <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-4">
                {(() => {
                  const student = students.find(s => s.id === selectedStudent)
                  if (!student) return null
                  const p = getStudentProgress(student.id)
                  return (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: getProgressColor(getAvg(p)) }}>
                          {getAvg(p)}%
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">{student.name}</h3>
                          <p className="text-xs text-slate-500">Sala Manzanos</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {[
                          { key: "CF", label: "Conciencia Fonologica", color: "#10b981" },
                          { key: "CT", label: "Conocimiento Textos", color: "#3b82f6" },
                          { key: "O", label: "Oralidad", color: "#f59e0b" },
                        ].map(eje => (
                          <div key={eje.key}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium" style={{ color: eje.color }}>{eje.label}</span>
                              <span className="text-slate-600">{p[eje.key as keyof typeof p]}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${p[eje.key as keyof typeof p]}%`, backgroundColor: eje.color }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )
                })()}
              </div>
            )}
          </div>

          {/* RIGHT: Mapa de progreso compacto */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 p-4" style={{ maxHeight: "calc(100vh - 140px)" }}>
            <h3 className="font-bold text-sm mb-3" style={{ color: "#1e3a5f" }}>Mapa de Sala</h3>
            
            {/* Resumen */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center p-2 rounded-lg bg-red-50 border border-red-100">
                <div className="text-lg font-bold text-red-600">{counts.red}</div>
                <div className="text-[10px] text-red-500">Refuerzo</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-amber-50 border border-amber-100">
                <div className="text-lg font-bold text-amber-600">{counts.yellow}</div>
                <div className="text-[10px] text-amber-500">Proceso</div>
              </div>
              <div className="text-center p-2 rounded-lg bg-emerald-50 border border-emerald-100">
                <div className="text-lg font-bold text-emerald-600">{counts.green}</div>
                <div className="text-[10px] text-emerald-500">Avanzado</div>
              </div>
            </div>

            {/* Lista compacta */}
            <div className="space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
              {students.sort((a, b) => getAvg(getStudentProgress(a.id)) - getAvg(getStudentProgress(b.id))).map(student => {
                const p = getStudentProgress(student.id)
                const avg = getAvg(p)
                const color = getProgressColor(avg)
                return (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student.id === selectedStudent ? null : student.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all text-left ${selectedStudent === student.id ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50"}`}
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: color }}>
                      {avg}
                    </div>
                    <span className="flex-1 text-xs text-slate-700 truncate">{student.name.split(" ")[0]}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                )
              })}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="py-2 px-4 text-center text-xs text-slate-400 border-t border-slate-100">
        ALBA · Alfabetizacion con Acompanamiento · Nivel Inicial
      </footer>

      {/* Report Modal */}
      {reportModal && (
        <ReportModal
          nombre={reportModal.nombre}
          mensaje={reportModal.mensaje}
          onClose={() => setReportModal(null)}
          onSend={handleSendReport}
          sending={sendingReport}
        />
      )}

      {/* Sintesis Pedagogica Modal */}
      {showSintesis && (
        <SintesisPedagogicaModal
          counts={counts}
          totalStudents={students.length}
          actividad={ACTIVIDAD_DEL_DIA}
          onClose={() => setShowSintesis(false)}
        />
      )}
    </div>
  )
}
