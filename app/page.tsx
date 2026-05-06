"use client"

import { useState, useRef, useEffect } from "react"
import useSWR from "swr"
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip,
} from "recharts"
import {
  Brain, PlayCircle, BookOpen, Users, CheckCircle,
  AlertCircle, Info, Save, ThumbsUp, Minus, X, BarChart2,
} from "lucide-react"

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

const STATUS_BG: Record<StatusLevel, string> = {
  green:  "bg-green-400",
  yellow: "bg-yellow-400",
  red:    "bg-red-400",
}

const STATUS_HEX: Record<StatusLevel, string> = {
  green:  "#4ade80",
  yellow: "#fbbf24",
  red:    "#f87171",
}

const STATUS_LABELS: Record<StatusLevel, string> = {
  green:  "Logrado",
  yellow: "En proceso",
  red:    "Requiere intervención",
}

const STATUS_TO_VALUE: Record<StatusLevel, number> = {
  green: 90, yellow: 50, red: 15,
}

const FIELD_HEADERS: FieldKey[] = ["cf", "rl", "o"]
const FIELD_LABELS: Record<FieldKey, string> = {
  cf: "Fonología (CF)",
  rl: "Letras (RL)",
  o:  "Oralidad",
}

const ANNUAL_SEQUENCE = [
  { mes: "Marzo",      actividad: "Conciencia Silábica",       hito: "CF" },
  { mes: "Abril",      actividad: "Sonido Inicial /p/ /m/",    hito: "CF" },
  { mes: "Mayo",       actividad: "Reconocimiento de Grafemas", hito: "RL" },
  { mes: "Junio",      actividad: "Narración Oral",             hito: "O"  },
  { mes: "Julio",      actividad: "Dictado de sílabas",         hito: "RL" },
  { mes: "Agosto",     actividad: "Lectura de palabras",        hito: "RL" },
  { mes: "Septiembre", actividad: "Escritura espontánea",       hito: "CF" },
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

function calcPie(students: Student[], field: FieldKey) {
  const total = students.length || 1
  const green  = students.filter((s) => s[field] === "green").length
  const yellow = students.filter((s) => s[field] === "yellow").length
  const red    = students.filter((s) => s[field] === "red").length
  return {
    green: Math.round((green  / total) * 100),
    yellow:Math.round((yellow / total) * 100),
    red:   Math.round((red    / total) * 100),
    data: [
      { name: "Logrado",   value: green  || 0.01, color: "#4ade80" },
      { name: "En proceso", value: yellow || 0.01, color: "#fbbf24" },
      { name: "Inicio",    value: red    || 0.01, color: "#f87171" },
    ],
  }
}

// ── Sequence Drawer ────────────────────────────────────────────────────────

function SequenceDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-8 overflow-y-auto flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-indigo-600 flex items-center gap-2">
            <BookOpen size={22} /> Secuencia Anual
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition" aria-label="Cerrar">
            <X size={22} />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {ANNUAL_SEQUENCE.map((item, i) => (
            <div key={i} className="flex gap-4 p-4 border border-slate-100 rounded-2xl hover:border-indigo-200 transition">
              <div className="text-indigo-600 font-black text-sm w-24 shrink-0 pt-0.5">{item.mes}</div>
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

// ── Student Bar Chart ──────────────────────────────────────────────────────

function StudentChart({ student }: { student: Student }) {
  const data = [
    { hito: "FONO (CF)",  valor: STATUS_TO_VALUE[student.cf], status: student.cf },
    { hito: "LETRAS (RL)", valor: STATUS_TO_VALUE[student.rl], status: student.rl },
    { hito: "ORALIDAD",   valor: STATUS_TO_VALUE[student.o],  status: student.o  },
  ]
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis dataKey="hito" type="category" width={88} tick={{ fontWeight: 700, fontSize: 10, fill: "#64748b" }} />
          <Tooltip
            formatter={(_: number, __: string, props: { payload?: { status: StatusLevel } }) =>
              [STATUS_LABELS[props.payload?.status ?? "green"], "Estado"]
            }
            contentStyle={{ borderRadius: 16, border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0/0.1)", fontSize: 12 }}
            cursor={{ fill: "transparent" }}
          />
          <Bar dataKey="valor" radius={[0, 12, 12, 0]} barSize={32}>
            {data.map((entry, i) => <Cell key={i} fill={STATUS_HEX[entry.status]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Pie Widget ─────────────────────────────────────────────────────────────

function PieWidget({ field, students }: { field: FieldKey; students: Student[] }) {
  const stats = calcPie(students, field)
  return (
    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
      <div className="w-20 h-20 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={stats.data} innerRadius={22} outerRadius={34} paddingAngle={4} dataKey="value" strokeWidth={0}>
              {stats.data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <h4 className="font-black text-slate-700 text-sm">{FIELD_LABELS[field]}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{stats.green}% del aula en verde</p>
        <div className="flex gap-2 mt-1.5">
          {(["green", "yellow", "red"] as StatusLevel[]).map((s) => (
            <div key={s} className="flex items-center gap-1 text-[10px] text-slate-400">
              <span className={`w-2 h-2 rounded-full ${STATUS_BG[s]}`} />
              {stats[s]}%
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function ALBADashboard() {
  const { data: studentsData, isLoading } = useSWR<StudentsResponse>(
    "/api/students", fetcher, { revalidateOnFocus: false }
  )
  const { data: brainData } = useSWR<BrainResponse>(
    "/api/brain", fetcher, { revalidateOnFocus: false }
  )

  const [localStatus, setLocalStatus]         = useState<Record<string, StatusLevel>>({})
  const [savingCell, setSavingCell]           = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isSequenceOpen, setIsSequenceOpen]   = useState(false)
  const [showJIT, setShowJIT]                 = useState(false)
  const [closeFeedback, setCloseFeedback]     = useState<string | null>(null)
  const [activeCell, setActiveCell]           = useState<{ studentId: string; field: FieldKey } | null>(null)
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
    if (students.length > 0 && !selectedStudent) setSelectedStudent(students[0])
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

  const titulo   = brainData?.titulo   ?? "Sonido /p/"
  const objetivo = brainData?.objetivo ?? "Reconocer el sonido /p/ en posición inicial, medial y final."
  const source   = studentsData?.source ?? null

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-4 md:p-8">

      {/* ── 1. ALBA BRAIN HERO ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto mb-6 space-y-3">
        <div className="bg-indigo-600 rounded-[32px] p-7 text-white shadow-xl shadow-indigo-200/50 relative overflow-hidden">
          {/* decorative blur */}
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-indigo-500/40 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md shrink-0">
                <Brain size={36} className="text-white" />
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-0.5">
                  Cerebro Central · ALBA
                </p>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                  {titulo}
                </h1>
                <p className="text-indigo-100 text-sm mt-1 max-w-md leading-relaxed">
                  {objetivo}
                </p>
              </div>
            </div>

            <div className="flex gap-3 shrink-0 flex-wrap">
              <button
                onClick={() => setShowJIT(!showJIT)}
                className="bg-white text-indigo-600 px-5 py-3 rounded-2xl font-black flex items-center gap-2 hover:bg-indigo-50 transition shadow-md text-sm"
              >
                <PlayCircle size={18} />
                Capacitacion JIT
              </button>
              <button
                onClick={() => setIsSequenceOpen(true)}
                className="bg-indigo-500 text-white px-5 py-3 rounded-2xl font-black border border-indigo-400 hover:bg-indigo-400 transition text-sm"
              >
                Ver Secuencia
              </button>
              {source && (
                <span className={`self-center text-[10px] px-2.5 py-1 rounded-full font-bold ${
                  source === "airtable"
                    ? "bg-white/20 text-white"
                    : "bg-white/10 text-indigo-200"
                }`}>
                  {source === "airtable" ? "Airtable" : "Demo"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── JIT ACCORDION ── */}
        {showJIT && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-[24px] p-6">
            <h3 className="text-amber-800 font-black flex items-center gap-2 mb-2 text-base">
              <BookOpen size={18} /> Como ensenar el sonido /P/ hoy
            </h3>
            <p className="text-amber-700 text-sm mb-4 leading-relaxed">
              Evita decir &ldquo;Pe&rdquo;, di el sonido explosivo /p...p...p/. Usa el espejo con los nenes para ver la posicion de los labios.
            </p>
            <div className="aspect-video bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 font-bold text-sm">
              [Video Micro-Capacitacion 60&ldquo;]
            </div>
          </div>
        )}
      </section>

      {/* ── DRAWER ──────────────────────────────────────────────────────────── */}
      {isSequenceOpen && <SequenceDrawer onClose={() => setIsSequenceOpen(false)} />}

      {/* ── 2. ACCION Y DATOS ─────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* ── REGISTRO DE CLASE (izq) ── */}
        <section className="md:col-span-7 bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col">

          <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
            <Users size={15} /> Registro de Clase en Tiempo Real
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
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer gap-3 ${
                      isSelected
                        ? "border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-100"
                        : "border-slate-100 bg-slate-50 hover:border-indigo-200"
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-slate-700 block truncate">{student.name}</span>
                      <span className="text-[11px] text-slate-400">{getStatusBadge(student)}</span>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEval(student, "cf", "green") }}
                        className={`p-2.5 bg-green-500 text-white rounded-xl shadow-sm hover:scale-105 active:scale-95 transition ${
                          student.cf === "green" ? "ring-2 ring-offset-1 ring-green-300" : "opacity-75 hover:opacity-100"
                        } ${savingCell === `${student.id}-cf` ? "animate-pulse" : ""}`}
                        title="Logrado"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEval(student, "cf", "yellow") }}
                        className={`p-2.5 bg-yellow-400 text-white rounded-xl shadow-sm hover:scale-105 active:scale-95 transition ${
                          student.cf === "yellow" ? "ring-2 ring-offset-1 ring-yellow-300" : "opacity-75 hover:opacity-100"
                        }`}
                        title="En proceso"
                      >
                        <Info size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEval(student, "cf", "red") }}
                        className={`p-2.5 bg-red-400 text-white rounded-xl shadow-sm hover:scale-105 active:scale-95 transition ${
                          student.cf === "red" ? "ring-2 ring-offset-1 ring-red-300" : "opacity-75 hover:opacity-100"
                        }`}
                        title="Requiere intervencion"
                      >
                        <AlertCircle size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Diagnostico individual al seleccionar ── */}
          {resolvedSelected && (
            <div className="mt-5 pt-5 border-t border-slate-100">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-3">
                Diagnostico: {resolvedSelected.name}
              </p>
              <StudentChart student={resolvedSelected} />
              <p className="mt-3 text-xs text-slate-500 italic bg-slate-50 rounded-2xl px-4 py-3 leading-relaxed border border-slate-100">
                ALBA sugiere: {getSuggestion(resolvedSelected)}
              </p>
              {/* Fine-grained eval */}
              <div className="mt-3 grid grid-cols-3 gap-2">
                {FIELD_HEADERS.map((field) => (
                  <div key={field} className="flex flex-col items-center gap-1.5 bg-slate-50 rounded-xl p-2 border border-slate-100">
                    <span className="text-[9px] font-black uppercase text-slate-400">{field.toUpperCase()}</span>
                    <div className="flex gap-1">
                      {(["green", "yellow", "red"] as StatusLevel[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleEval(resolvedSelected, field, s)}
                          title={STATUS_LABELS[s]}
                          className={`w-5 h-5 rounded-md transition-all hover:scale-110 ${STATUS_BG[s]} ${
                            resolvedSelected[field] === s
                              ? "ring-2 ring-offset-1 ring-slate-300 opacity-100"
                              : "opacity-30 hover:opacity-70"
                          } ${savingCell === `${resolvedSelected.id}-${field}` ? "animate-pulse" : ""}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Cierre de clase ── */}
          {!isLoading && students.length > 0 && (
            <div className="mt-5 pt-5 border-t border-slate-100 mt-auto">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                Cierre de clase
              </p>
              <div className="flex flex-wrap gap-2">
                {([
                  { label: "Funciono bien",  icon: ThumbsUp,    color: "bg-green-500",  value: "good"    },
                  { label: "Parcialmente",   icon: Minus,       color: "bg-yellow-400", value: "partial" },
                  { label: "Necesita ajuste", icon: AlertCircle, color: "bg-red-400",   value: "adjust"  },
                ] as const).map(({ label, icon: Icon, color, value }) => (
                  <button
                    key={value}
                    onClick={() => setCloseFeedback(closeFeedback === value ? null : value)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-bold transition flex-1 justify-center min-w-[7rem] ${color} ${
                      closeFeedback === value ? "ring-2 ring-offset-1 ring-slate-400" : "opacity-70 hover:opacity-100"
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
                <Save size={14} />
                Guardar registro
              </button>
            </div>
          )}
        </section>

        {/* ── ESTADO DEL AULA — 3 TORTAS (der) ── */}
        <section className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-5 text-center">
              Estado del Aula (Hitos)
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-slate-400 text-sm gap-2">
                <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                Cargando...
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                <BarChart2 size={32} strokeWidth={1.5} />
                <p className="text-sm">Sin datos disponibles</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {FIELD_HEADERS.map((field) => (
                  <PieWidget key={field} field={field} students={students} />
                ))}
              </div>
            )}
          </div>

          {/* ── Mapa de calor compacto ── */}
          <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100" ref={tableRef}>
            <h3 className="font-black text-slate-400 text-xs uppercase tracking-widest mb-4">
              Mapa por Alumno
            </h3>

            {!isLoading && students.length > 0 && (
              <>
                <div className="grid grid-cols-4 gap-2 mb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center px-1">
                  <div className="text-left">Alumno</div>
                  {FIELD_HEADERS.map((f) => <div key={f}>{f.toUpperCase()}</div>)}
                </div>
                <div className="flex flex-col gap-2">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className={`grid grid-cols-4 gap-2 items-center cursor-pointer rounded-xl px-1 py-0.5 transition-colors ${
                        resolvedSelected?.id === student.id ? "bg-indigo-50" : "hover:bg-slate-50"
                      }`}
                      onClick={() => setSelectedStudent(student)}
                    >
                      <span className={`text-[11px] font-bold truncate ${
                        resolvedSelected?.id === student.id ? "text-indigo-600" : "text-slate-600"
                      }`}>
                        {student.name.split(" ")[0]}
                      </span>
                      {FIELD_HEADERS.map((field) => {
                        const cellKey = `${student.id}-${field}`
                        const isOpen  = activeCell?.studentId === student.id && activeCell?.field === field
                        return (
                          <div key={field} className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveCell(isOpen ? null : { studentId: student.id, field })
                              }}
                              className={`w-full h-8 rounded-xl transition-all ${STATUS_BG[student[field]]} ${
                                isOpen ? "ring-2 ring-offset-1 ring-slate-400 scale-105" : "opacity-75 hover:opacity-100 hover:scale-[1.03]"
                              } ${savingCell === cellKey ? "animate-pulse" : ""}`}
                              title={STATUS_LABELS[student[field]]}
                            />
                            {isOpen && (
                              <div className="absolute z-30 top-full mt-1.5 left-1/2 -translate-x-1/2 bg-white border border-slate-100 rounded-2xl shadow-xl p-1 flex flex-col gap-0.5 min-w-[12rem]">
                                {(["green", "yellow", "red"] as StatusLevel[]).map((opt) => (
                                  <button
                                    key={opt}
                                    onMouseDown={(e) => { e.preventDefault(); handleEval(student, field, opt) }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left w-full hover:bg-slate-50 transition-colors ${
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
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

      </main>

      <footer className="text-center text-[11px] text-slate-400 py-8 max-w-6xl mx-auto">
        ALBA · Alfabetizacion con Acompanamiento · Nivel Inicial
      </footer>
    </div>
  )
}
