"use client"

import { useState, useEffect, useRef } from "react"
import useSWR from "swr"
import {
  Brain, Users, CheckCircle, AlertCircle, X,
  Calendar, BookOpen, Layers, BarChart2, Info, Save,
  ThumbsUp, Minus
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip,
} from "recharts"

// ── Types ──────────────────────────────────────────────────────────────────

type StatusLevel = "green" | "yellow" | "red"
type FieldKey    = "cf" | "rl" | "o"

interface Student {
  id:   string
  name: string
  cf:   StatusLevel
  rl:   StatusLevel
  o:    StatusLevel
}

interface StudentsResponse {
  students: Student[]
  source:   string
}

interface BrainResponse {
  titulo:   string
  objetivo: string
  dia:      number
  source:   string
}

// ── Constants ──────────────────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUS_TO_VALUE: Record<StatusLevel, number> = { green: 95, yellow: 55, red: 15 }
const STATUS_HEX:      Record<StatusLevel, string>  = { green: "#4ade80", yellow: "#fbbf24", red: "#f87171" }

const STATUS_BG: Record<StatusLevel, string> = {
  green:  "bg-green-400",
  yellow: "bg-yellow-400",
  red:    "bg-red-400",
}

const STATUS_LABELS: Record<StatusLevel, string> = {
  green:  "Logrado",
  yellow: "En proceso",
  red:    "Requiere intervención",
}

const FIELD_HEADERS: FieldKey[] = ["cf", "rl", "o"]
const FIELD_LABELS: Record<FieldKey, string> = {
  cf: "Conciencia Fono",
  rl: "Recon. Letras",
  o:  "Oralidad",
}
const FIELD_COLS = ["Conciencia Fono", "Oralidad", "Recon. Letras"]

const ANNUAL_SEQUENCE = [
  { mes: "Marzo",      actividad: "Conciencia Silábica",        hito: "CF" },
  { mes: "Abril",      actividad: "Sonido Inicial /p/ /m/",     hito: "CF" },
  { mes: "Mayo",       actividad: "Reconocimiento de Grafemas",  hito: "RL" },
  { mes: "Junio",      actividad: "Narración Oral",              hito: "O"  },
  { mes: "Julio",      actividad: "Dictado de sílabas",          hito: "RL" },
  { mes: "Agosto",     actividad: "Lectura de palabras",         hito: "RL" },
  { mes: "Septiembre", actividad: "Escritura espontánea",        hito: "CF" },
]

// ── Helpers ────────────────────────────────────────────────────────────────

function getSuggestion(s: Student): string {
  if (s.cf === "red" || s.rl === "red")
    return "Reforzar discriminación auditiva antes de avanzar a grafemas."
  if (s.cf === "yellow" || s.rl === "yellow")
    return "Alumno en progreso. Continuar con actividades de consolidación."
  return "Alumno listo para combinar con vocales y nuevos fonemas."
}

function getStatusBadge(s: Student): string {
  const vals = [s.cf, s.rl, s.o]
  if (vals.every((v) => v === "green")) return "Listo para avanzar"
  if (vals.some((v) => v === "red"))    return "Necesita refuerzo"
  return "En progreso"
}

// ── Drawer ─────────────────────────────────────────────────────────────────

function SequenceDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-8 overflow-y-auto flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-indigo-600 flex items-center gap-2">
            <BookOpen size={22} /> Secuencia Anual
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition"
            aria-label="Cerrar"
          >
            <X size={22} />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {ANNUAL_SEQUENCE.map((item, i) => (
            <div
              key={i}
              className="flex gap-4 p-4 border border-slate-100 rounded-2xl hover:border-indigo-200 transition"
            >
              <div className="text-indigo-600 font-black text-sm w-24 shrink-0 pt-0.5">
                {item.mes}
              </div>
              <div>
                <div className="font-bold text-slate-800 text-sm">{item.actividad}</div>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-black text-slate-500 uppercase">
                  {item.hito}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Chart ──────────────────────────────────────────────────────────────────

function StudentChart({ student }: { student: Student }) {
  const data = [
    { hito: "FONO (CF)",  valor: STATUS_TO_VALUE[student.cf], status: student.cf },
    { hito: "ORALIDAD",   valor: STATUS_TO_VALUE[student.o],  status: student.o  },
    { hito: "LETRAS (RL)", valor: STATUS_TO_VALUE[student.rl], status: student.rl },
  ]
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis
            dataKey="hito"
            type="category"
            width={90}
            tick={{ fontWeight: 900, fontSize: 10, fill: "#64748b" }}
          />
          <Tooltip
            formatter={(_: number, __: string, props: { payload?: { status: StatusLevel } }) =>
              [STATUS_LABELS[props.payload?.status ?? "green"], "Estado"]
            }
            contentStyle={{
              borderRadius: 16,
              border: "none",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              fontSize: 12,
            }}
            cursor={{ fill: "transparent" }}
          />
          <Bar dataKey="valor" radius={[0, 12, 12, 0]} barSize={40}>
            {data.map((entry, i) => (
              <Cell key={i} fill={STATUS_HEX[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

export default function ALBADashboard() {
  const { data: studentsData, isLoading } = useSWR<StudentsResponse>(
    "/api/students", fetcher, { revalidateOnFocus: false }
  )
  const { data: brainData } = useSWR<BrainResponse>(
    "/api/brain", fetcher, { revalidateOnFocus: false }
  )

  const [localStatus, setLocalStatus]       = useState<Record<string, StatusLevel>>({})
  const [savingCell, setSavingCell]         = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isSequenceOpen, setIsSequenceOpen] = useState(false)
  const [activeCell, setActiveCell]         = useState<{ studentId: string; field: FieldKey } | null>(null)
  const [closeFeedback, setCloseFeedback]   = useState<string | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setActiveCell(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const rawStudents = studentsData?.students ?? []

  const students: Student[] = rawStudents.map((s) => ({
    ...s,
    cf: (localStatus[`${s.id}-cf`] as StatusLevel) ?? s.cf,
    rl: (localStatus[`${s.id}-rl`] as StatusLevel) ?? s.rl,
    o:  (localStatus[`${s.id}-o`]  as StatusLevel) ?? s.o,
  }))

  const resolvedSelected = selectedStudent
    ? students.find((s) => s.id === selectedStudent.id) ?? null
    : null

  useEffect(() => {
    if (students.length > 0 && !selectedStudent) {
      setSelectedStudent(students[0])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students.length])

  async function handleEval(student: Student, field: FieldKey, status: StatusLevel) {
    const key = `${student.id}-${field}`
    setLocalStatus((prev) => ({ ...prev, [key]: status }))
    setActiveCell(null)
    setSavingCell(key)
    try {
      await fetch("/api/registrar-actividad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, field: field.toUpperCase(), status }),
      })
    } catch {
      // Keep local change even if Airtable fails
    } finally {
      setSavingCell(null)
    }
  }

  const todayLabel = brainData?.titulo ?? "Sonido /p/"
  const source     = studentsData?.source ?? null

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-x-hidden">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">

          <button
            onClick={() => setIsSequenceOpen(true)}
            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-5 py-2.5 rounded-2xl transition-all shadow-lg shadow-indigo-200 group shrink-0"
          >
            <div className="bg-indigo-400/60 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
              <Brain size={20} />
            </div>
            <div className="text-left">
              <span className="block text-[10px] uppercase font-black opacity-70 leading-none">
                Cerebro Central
              </span>
              <span className="text-lg font-black tracking-tight">ALBA</span>
            </div>
          </button>

          <div className="flex items-center gap-3 sm:gap-5 flex-wrap justify-end">
            <div className="flex items-center gap-2 bg-slate-100 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-500">
              <Calendar size={14} />
              <span>Hoy: {todayLabel}</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm font-bold text-slate-500">
              <Layers size={14} />
              <span>Sala 5 / 1er Grado</span>
            </div>
            {source && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium hidden sm:inline ${
                source === "airtable"
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-500"
              }`}>
                {source === "airtable" ? "Airtable" : "Demo"}
              </span>
            )}
          </div>
        </div>
      </nav>

      {/* ── DRAWER ──────────────────────────────────────────────────────── */}
      {isSequenceOpen && <SequenceDrawer onClose={() => setIsSequenceOpen(false)} />}

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* ── COL IZQ: Registro de clase ─────────────────────────────── */}
        <section className="md:col-span-5 space-y-0">
          <div className="bg-white rounded-[28px] shadow-sm border border-slate-100 p-5 sm:p-6">

            <h3 className="font-black text-base mb-5 flex items-center gap-2 text-slate-700 uppercase tracking-tight">
              <Users size={18} className="text-indigo-500" />
              Registro de Clase
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-slate-400 text-sm gap-2">
                <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                Cargando alumnos...
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {students.map((student) => {
                  const isSelected = resolvedSelected?.id === student.id
                  return (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudent(isSelected ? null : student)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? "border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-100"
                          : "border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-slate-700 text-sm block truncate">
                          {student.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {getStatusBadge(student)}
                        </span>
                      </div>

                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEval(student, "cf", "green") }}
                          className={`p-2 bg-green-500 text-white rounded-xl shadow-md shadow-green-100 transition hover:scale-105 active:scale-95 ${
                            student.cf === "green" ? "ring-2 ring-offset-1 ring-slate-300" : "opacity-70 hover:opacity-100"
                          }`}
                          title="Logrado"
                        >
                          <CheckCircle size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEval(student, "cf", "yellow") }}
                          className={`p-2 bg-yellow-400 text-white rounded-xl shadow-md shadow-yellow-100 transition hover:scale-105 active:scale-95 ${
                            student.cf === "yellow" ? "ring-2 ring-offset-1 ring-slate-300" : "opacity-70 hover:opacity-100"
                          }`}
                          title="En proceso"
                        >
                          <Info size={15} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEval(student, "cf", "red") }}
                          className={`p-2 bg-red-400 text-white rounded-xl shadow-md shadow-red-100 transition hover:scale-105 active:scale-95 ${
                            student.cf === "red" ? "ring-2 ring-offset-1 ring-slate-300" : "opacity-70 hover:opacity-100"
                          }`}
                          title="Requiere intervención"
                        >
                          <AlertCircle size={15} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── Cierre de clase ── */}
            {!isLoading && students.length > 0 && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                  Cierre de clase
                </p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { label: "Funcionó bien",  icon: ThumbsUp,    color: "bg-green-500",  value: "good"    },
                    { label: "Parcialmente",   icon: Minus,       color: "bg-yellow-400", value: "partial" },
                    { label: "Necesita ajuste", icon: AlertCircle, color: "bg-red-400",    value: "adjust"  },
                  ] as const).map(({ label, icon: Icon, color, value }) => (
                    <button
                      key={value}
                      onClick={() => setCloseFeedback(closeFeedback === value ? null : value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-bold shadow-sm hover:opacity-90 transition flex-1 justify-center ${color} ${
                        closeFeedback === value ? "ring-2 ring-offset-1 ring-slate-400" : "opacity-75 hover:opacity-100"
                      }`}
                    >
                      <Icon size={13} />
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  disabled={!closeFeedback}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-2xl transition text-sm shadow-md shadow-indigo-100"
                >
                  <Save size={15} />
                  Guardar registro
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── COL DER: Diagnostico individual ────────────────────────── */}
        <section className="md:col-span-7">
          <div className="bg-white rounded-[28px] shadow-sm border border-slate-100 p-5 sm:p-8 h-full flex flex-col">
            {resolvedSelected ? (
              <>
                <div className="flex justify-between items-start mb-6 gap-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-500 tracking-widest block mb-0.5">
                      Diagnostico Actual
                    </span>
                    <h3 className="font-black text-2xl sm:text-3xl text-slate-800">
                      {resolvedSelected.name}
                    </h3>
                  </div>
                  <div className="bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 shrink-0">
                    <span className="text-xs font-bold text-indigo-600 italic">
                      &ldquo;{getStatusBadge(resolvedSelected)}&rdquo;
                    </span>
                  </div>
                </div>

                <StudentChart student={resolvedSelected} />

                <p className="mt-4 text-xs text-slate-500 italic bg-slate-50 rounded-2xl px-4 py-3 leading-relaxed border border-slate-100">
                  ALBA sugiere: {getSuggestion(resolvedSelected)}
                </p>

                {/* Fine-grained eval for all fields */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                    Actualizar evaluacion
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {FIELD_HEADERS.map((field) => (
                      <div key={field} className="flex flex-col gap-1.5 items-center">
                        <span className="text-[10px] font-black uppercase text-slate-500">
                          {field.toUpperCase()}
                        </span>
                        <div className="flex gap-1">
                          {(["green", "yellow", "red"] as StatusLevel[]).map((status) => (
                            <button
                              key={status}
                              onClick={() => handleEval(resolvedSelected, field, status)}
                              title={STATUS_LABELS[status]}
                              className={`w-6 h-6 rounded-lg transition-all hover:scale-110 ${STATUS_BG[status]} ${
                                resolvedSelected[field] === status
                                  ? "ring-2 ring-offset-1 ring-slate-400 opacity-100"
                                  : "opacity-35 hover:opacity-80"
                              } ${savingCell === `${resolvedSelected.id}-${field}` ? "animate-pulse" : ""}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                <BarChart2 size={40} strokeWidth={1.5} />
                <p className="text-sm font-medium">
                  Selecciona un alumno para ver su diagnostico
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── MAPA DE CALOR ───────────────────────────────────────────── */}
        <section className="md:col-span-12" ref={tableRef}>
          <div className="bg-white rounded-[28px] shadow-sm border border-slate-100 p-5 sm:p-8">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
              <h3 className="font-black text-2xl sm:text-3xl text-slate-800 tracking-tighter">
                Mapa de Calor del Aula
              </h3>
              <div className="flex gap-4 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 flex-wrap">
                {(["green", "yellow", "red"] as StatusLevel[]).map((s) => (
                  <div key={s} className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                    <div className={`w-3 h-3 rounded-full ${STATUS_BG[s]}`} />
                    {STATUS_LABELS[s]}
                  </div>
                ))}
              </div>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-4 gap-4 mb-4 px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
              <div className="text-left">Alumno</div>
              {FIELD_COLS.map((col) => <div key={col}>{col}</div>)}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-slate-400 text-sm gap-2">
                <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                Cargando...
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {students.map((student) => {
                  const isSelected = resolvedSelected?.id === student.id
                  return (
                    <div
                      key={student.id}
                      className={`grid grid-cols-4 gap-4 items-center group cursor-pointer rounded-2xl px-2 py-1 transition-colors ${
                        isSelected ? "bg-indigo-50/50" : "hover:bg-slate-50"
                      }`}
                      onClick={() => setSelectedStudent(isSelected ? null : student)}
                    >
                      <div className={`font-black text-sm truncate transition-colors ${
                        isSelected ? "text-indigo-600" : "text-slate-700 group-hover:text-indigo-500"
                      }`}>
                        {student.name}
                      </div>

                      {/* CF, O, RL — matches column header order */}
                      {(["cf", "o", "rl"] as FieldKey[]).map((field) => {
                        const cellKey  = `${student.id}-${field}`
                        const isOpen   = activeCell?.studentId === student.id && activeCell?.field === field
                        const isSaving = savingCell === cellKey
                        return (
                          <div key={field} className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveCell(isOpen ? null : { studentId: student.id, field })
                              }}
                              title={STATUS_LABELS[student[field]]}
                              className={`
                                w-full h-11 rounded-[14px] shadow-inner transition-all
                                ${STATUS_BG[student[field]]}
                                ${isOpen ? "ring-2 ring-offset-2 ring-slate-400 scale-[1.03]" : "opacity-80 hover:opacity-100 hover:scale-[1.02] group-hover:opacity-95"}
                                ${isSaving ? "animate-pulse" : ""}
                                cursor-pointer flex items-center justify-center
                              `}
                            >
                              {isSaving && (
                                <span className="w-3 h-3 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                              )}
                            </button>

                            {isOpen && (
                              <div className="absolute z-30 top-full mt-2 left-1/2 -translate-x-1/2 bg-white border border-slate-100 rounded-2xl shadow-xl p-1.5 flex flex-col gap-0.5 min-w-[13rem]">
                                {(["green", "yellow", "red"] as StatusLevel[]).map((opt) => (
                                  <button
                                    key={opt}
                                    onMouseDown={(e) => {
                                      e.preventDefault()
                                      handleEval(student, field, opt)
                                    }}
                                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-left w-full transition-colors hover:bg-slate-50 ${
                                      student[field] === opt ? "bg-slate-50 font-bold" : "font-normal"
                                    }`}
                                  >
                                    <span className={`w-3 h-3 rounded-full shrink-0 ${STATUS_BG[opt]}`} />
                                    {STATUS_LABELS[opt]}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

      </main>

      <footer className="text-center text-[11px] text-slate-400 py-6 pb-8">
        ALBA · Alfabetización con Acompañamiento · Nivel Inicial
      </footer>
    </div>
  )
}
