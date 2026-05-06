"use client"

import { useState, useEffect, useRef } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle, AlertCircle, XCircle, BarChart2, X } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from "recharts"

// ── Types ──────────────────────────────────────────────────────────────────

type StatusLevel = "green" | "yellow" | "red"
type FieldKey    = "cf" | "rl" | "o"

interface Student {
  id: string
  name: string
  cf: StatusLevel
  rl: StatusLevel
  o:  StatusLevel
}

interface StudentsResponse {
  students: Student[]
  source: string
}

// ── Constants ──────────────────────────────────────────────────────────────

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUS_TO_VALUE: Record<StatusLevel, number> = {
  green:  100,
  yellow: 50,
  red:    10,
}

const STATUS_COLORS: Record<StatusLevel, string> = {
  green:  "bg-status-green",
  yellow: "bg-status-yellow",
  red:    "bg-status-red",
}

const STATUS_HEX: Record<StatusLevel, string> = {
  green:  "#22c55e",
  yellow: "#eab308",
  red:    "#ef4444",
}

const STATUS_LABELS: Record<StatusLevel, string> = {
  green:  "Logrado",
  yellow: "En proceso",
  red:    "Requiere intervención",
}

const STATUS_OPTIONS: { value: StatusLevel; label: string; color: string }[] = [
  { value: "green",  label: "Logrado",              color: "bg-status-green"  },
  { value: "yellow", label: "En proceso",            color: "bg-status-yellow" },
  { value: "red",    label: "Requiere intervención", color: "bg-status-red"    },
]

const FIELD_MAP: Record<FieldKey, string> = { cf: "CF", rl: "RL", o: "O" }
const FIELD_LABELS: Record<FieldKey, string> = {
  cf: "Conciencia Fonológica",
  rl: "Reconocimiento de Letras",
  o:  "Oralidad",
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusDot({
  status,
  saving,
  isOpen,
  onClick,
}: {
  status: StatusLevel
  saving: boolean
  isOpen: boolean
  onClick: (e: React.MouseEvent) => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      title={STATUS_LABELS[status]}
      aria-label={`Estado: ${STATUS_LABELS[status]}. Clic para cambiar.`}
      className={`
        inline-flex items-center justify-center w-7 h-7 rounded-full shrink-0
        ${STATUS_COLORS[status]} shadow-sm transition-all duration-150
        hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-primary/40
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
        disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
        ${isOpen ? "ring-2 ring-offset-2 ring-primary/60 scale-110" : ""}
      `}
    >
      {saving && (
        <span className="w-3 h-3 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  )
}

function StatusPopover({
  current,
  onSelect,
}: {
  current: StatusLevel
  onSelect: (s: StatusLevel) => void
}) {
  return (
    <div className="absolute z-30 top-full mt-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl shadow-xl p-1.5 flex flex-col gap-0.5 min-w-[12rem]">
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(opt.value)
          }}
          className={`
            flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left w-full
            transition-colors hover:bg-muted
            ${current === opt.value ? "bg-muted font-semibold" : "font-normal"}
          `}
        >
          <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${opt.color}`} />
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// Quick eval buttons: green check / yellow alert / red X
function QuickEvalButtons({
  student,
  activeField,
  onEval,
}: {
  student: Student
  activeField: FieldKey
  onEval: (student: Student, field: FieldKey, status: StatusLevel) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        title="Logrado"
        onMouseDown={(e) => { e.preventDefault(); onEval(student, activeField, "green") }}
        className={`p-1.5 rounded-lg transition-colors
          ${student[activeField] === "green"
            ? "bg-green-100 text-green-700"
            : "text-muted-foreground hover:bg-green-50 hover:text-green-600"}`}
      >
        <CheckCircle size={16} />
      </button>
      <button
        title="En proceso"
        onMouseDown={(e) => { e.preventDefault(); onEval(student, activeField, "yellow") }}
        className={`p-1.5 rounded-lg transition-colors
          ${student[activeField] === "yellow"
            ? "bg-yellow-100 text-yellow-700"
            : "text-muted-foreground hover:bg-yellow-50 hover:text-yellow-600"}`}
      >
        <AlertCircle size={16} />
      </button>
      <button
        title="Requiere intervención"
        onMouseDown={(e) => { e.preventDefault(); onEval(student, activeField, "red") }}
        className={`p-1.5 rounded-lg transition-colors
          ${student[activeField] === "red"
            ? "bg-red-100 text-red-700"
            : "text-muted-foreground hover:bg-red-50 hover:text-red-600"}`}
      >
        <XCircle size={16} />
      </button>
    </div>
  )
}

// Horizontal bar chart for one student
function StudentDetailChart({ student }: { student: Student }) {
  const chartData: { hito: string; valor: number; status: StatusLevel }[] = [
    { hito: "CF",       valor: STATUS_TO_VALUE[student.cf], status: student.cf },
    { hito: "RL",       valor: STATUS_TO_VALUE[student.rl], status: student.rl },
    { hito: "Oralidad", valor: STATUS_TO_VALUE[student.o],  status: student.o  },
  ]

  return (
    <div className="h-36">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 8 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis dataKey="hito" type="category" width={68} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value: number, name: string, props: { payload?: { status: StatusLevel } }) =>
              [STATUS_LABELS[props.payload?.status ?? "green"], "Estado"]
            }
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={22}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={STATUS_HEX[entry.status]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

interface ActiveCell {
  studentId: string
  field: FieldKey
}

export function HeatMap() {
  const { data, isLoading } = useSWR<StudentsResponse>("/api/students", fetcher, {
    revalidateOnFocus: false,
  })

  const [localStatus, setLocalStatus]     = useState<Record<string, StatusLevel>>({})
  const [activeCell, setActiveCell]       = useState<ActiveCell | null>(null)
  const [savingCell, setSavingCell]       = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  // Which field the quick-eval buttons act on (default: cf)
  const [evalField, setEvalField]         = useState<FieldKey>("cf")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActiveCell(null)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const rawStudents = data?.students ?? []
  const source      = data?.source ?? null

  const students: Student[] = rawStudents.map((s) => ({
    ...s,
    cf: (localStatus[`${s.id}-cf`] as StatusLevel) ?? s.cf,
    rl: (localStatus[`${s.id}-rl`] as StatusLevel) ?? s.rl,
    o:  (localStatus[`${s.id}-o`]  as StatusLevel) ?? s.o,
  }))

  // Keep selectedStudent in sync with local changes
  const resolvedSelected = selectedStudent
    ? students.find((s) => s.id === selectedStudent.id) ?? null
    : null

  async function handleStatusChange(student: Student, field: FieldKey, newStatus: StatusLevel) {
    const cellKey = `${student.id}-${field}`
    setLocalStatus((prev) => ({ ...prev, [cellKey]: newStatus }))
    setActiveCell(null)
    setSavingCell(cellKey)
    try {
      await fetch("/api/registrar-actividad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          field:     FIELD_MAP[field],
          status:    newStatus,
        }),
      })
    } catch (err) {
      console.error("[v0] Error guardando en Airtable:", err)
    } finally {
      setSavingCell(null)
    }
  }

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold text-primary">
            Mapa de calor del aula
          </CardTitle>
          <div className="flex items-center gap-2">
            {!isLoading && source && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  source === "airtable"
                    ? "bg-accent/15 text-accent"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {source === "airtable" ? "Airtable" : "Demo"}
              </span>
            )}
          </div>
        </div>

        {/* Quick-eval field selector */}
        {!isLoading && students.length > 0 && (
          <div className="flex gap-1 mt-2">
            {(["cf", "rl", "o"] as FieldKey[]).map((f) => (
              <button
                key={f}
                onClick={() => setEvalField(f)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                  evalField === f
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {FIELD_MAP[f]}
              </button>
            ))}
            <span className="ml-1 text-xs text-muted-foreground self-center">
              Evaluando: <span className="font-medium text-foreground">{FIELD_LABELS[evalField]}</span>
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 flex flex-col gap-4 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10">
            <Spinner className="text-primary" />
            <span className="text-sm text-muted-foreground">Cargando alumnos...</span>
          </div>
        ) : students.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Sin registros disponibles
          </p>
        ) : (
          <>
            {/* ── Student list with quick-eval ── */}
            <div ref={containerRef} className="flex flex-col gap-1">
              {students.map((student) => {
                const isSelected = resolvedSelected?.id === student.id
                return (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border transition-colors ${
                      isSelected
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    {/* Name + detail toggle */}
                    <button
                      className="text-sm font-medium text-foreground text-left flex-1 flex items-center gap-2"
                      onClick={() =>
                        setSelectedStudent(isSelected ? null : student)
                      }
                    >
                      <BarChart2
                        size={14}
                        className={isSelected ? "text-primary" : "text-muted-foreground"}
                      />
                      {student.name}
                    </button>

                    {/* All three status dots */}
                    <div className="flex items-center gap-1.5">
                      {(["cf", "rl", "o"] as FieldKey[]).map((field) => {
                        const cellKey = `${student.id}-${field}`
                        const isOpen  = activeCell?.studentId === student.id && activeCell?.field === field
                        const isSaving = savingCell === cellKey
                        return (
                          <div key={field} className="relative flex justify-center">
                            <StatusDot
                              status={student[field]}
                              saving={isSaving}
                              isOpen={isOpen}
                              onClick={(e) => {
                                e.stopPropagation()
                                setActiveCell(isOpen ? null : { studentId: student.id, field })
                              }}
                            />
                            {isOpen && (
                              <StatusPopover
                                current={student[field]}
                                onSelect={(newStatus) =>
                                  handleStatusChange(student, field, newStatus)
                                }
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Quick-eval buttons for active field */}
                    <QuickEvalButtons
                      student={student}
                      activeField={evalField}
                      onEval={handleStatusChange}
                    />
                  </div>
                )
              })}
            </div>

            {/* ── Column headers for the dots ── */}
            <div className="flex items-center justify-end gap-0 pr-1 -mt-2">
              <div className="flex gap-5 mr-[6.5rem]">
                {(["CF", "RL", "O"] as const).map((col) => (
                  <span key={col} className="text-xs text-muted-foreground font-medium w-7 text-center">
                    {col}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Detail chart for selected student ── */}
            {resolvedSelected && (
              <div className="border border-border rounded-xl p-3 bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-foreground">
                    {resolvedSelected.name}
                  </p>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Cerrar detalle"
                  >
                    <X size={14} />
                  </button>
                </div>
                <StudentDetailChart student={resolvedSelected} />
              </div>
            )}

            {/* ── Legend ── */}
            <div className="pt-2 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground mt-auto">
              {STATUS_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center gap-1.5">
                  <span className={`inline-block w-3 h-3 rounded-full ${opt.color}`} />
                  {opt.label}
                </div>
              ))}
              <span className="ml-auto italic hidden sm:inline">Toca un punto para editar</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
