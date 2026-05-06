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
  yellow: 55,
  red:    15,
}

const STATUS_HEX: Record<StatusLevel, string> = {
  green:  "#22c55e",
  yellow: "#eab308",
  red:    "#ef4444",
}

const STATUS_BG: Record<StatusLevel, string> = {
  green:  "bg-status-green",
  yellow: "bg-status-yellow",
  red:    "bg-status-red",
}

const STATUS_LABELS: Record<StatusLevel, string> = {
  green:  "Logrado",
  yellow: "En proceso",
  red:    "Requiere intervención",
}

const FIELD_MAP: Record<FieldKey, string> = { cf: "CF", rl: "RL", o: "O" }
const FIELD_LABELS: Record<FieldKey, string> = {
  cf: "Conciencia Fono",
  rl: "Letras (RL)",
  o:  "Oralidad",
}

const STATUS_OPTIONS: { value: StatusLevel; label: string }[] = [
  { value: "green",  label: "Logrado"              },
  { value: "yellow", label: "En proceso"            },
  { value: "red",    label: "Requiere intervención" },
]

// ── Sub-components ─────────────────────────────────────────────────────────

// Wide color cell — the main heat map element
function HeatCell({
  status,
  saving,
  onClick,
}: {
  status: StatusLevel
  saving: boolean
  onClick: (e: React.MouseEvent) => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      title={STATUS_LABELS[status]}
      aria-label={`Estado: ${STATUS_LABELS[status]}. Clic para cambiar.`}
      className={`
        w-full h-9 rounded-xl transition-all duration-200
        ${STATUS_BG[status]} opacity-85
        hover:opacity-100 hover:scale-[1.03]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
        disabled:cursor-not-allowed
        cursor-pointer flex items-center justify-center
      `}
    >
      {saving && (
        <span className="w-3.5 h-3.5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  )
}

// Popover to pick a new status
function StatusPopover({
  current,
  onSelect,
}: {
  current: StatusLevel
  onSelect: (s: StatusLevel) => void
}) {
  return (
    <div className="absolute z-30 top-full mt-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl shadow-xl p-1.5 flex flex-col gap-0.5 min-w-[13rem]">
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
          <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${STATUS_BG[opt.value]}`} />
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// Quick eval buttons — check / alert / X
function QuickEvalButtons({
  student,
  activeField,
  onEval,
}: {
  student: Student
  activeField: FieldKey
  onEval: (student: Student, field: FieldKey, status: StatusLevel) => void
}) {
  const current = student[activeField]
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        title="Logrado"
        onMouseDown={(e) => { e.preventDefault(); onEval(student, activeField, "green") }}
        className={`p-1.5 rounded-lg transition-colors ${current === "green" ? "bg-green-100 text-green-700" : "text-muted-foreground hover:bg-green-50 hover:text-green-600"}`}
      >
        <CheckCircle size={15} />
      </button>
      <button
        title="En proceso"
        onMouseDown={(e) => { e.preventDefault(); onEval(student, activeField, "yellow") }}
        className={`p-1.5 rounded-lg transition-colors ${current === "yellow" ? "bg-yellow-100 text-yellow-700" : "text-muted-foreground hover:bg-yellow-50 hover:text-yellow-600"}`}
      >
        <AlertCircle size={15} />
      </button>
      <button
        title="Requiere intervención"
        onMouseDown={(e) => { e.preventDefault(); onEval(student, activeField, "red") }}
        className={`p-1.5 rounded-lg transition-colors ${current === "red" ? "bg-red-100 text-red-700" : "text-muted-foreground hover:bg-red-50 hover:text-red-600"}`}
      >
        <XCircle size={15} />
      </button>
    </div>
  )
}

// Horizontal bar chart for individual student detail
function StudentDetailChart({ student }: { student: Student }) {
  const chartData = [
    { hito: FIELD_LABELS.cf, valor: STATUS_TO_VALUE[student.cf], status: student.cf },
    { hito: FIELD_LABELS.rl, valor: STATUS_TO_VALUE[student.rl], status: student.rl },
    { hito: FIELD_LABELS.o,  valor: STATUS_TO_VALUE[student.o],  status: student.o  },
  ]

  const suggestion =
    student.cf === "red" || student.rl === "red"
      ? "Reforzar discriminación auditiva antes de avanzar a grafemas."
      : student.cf === "yellow" || student.rl === "yellow"
      ? "Alumno en progreso. Continuar con actividades de consolidación."
      : "Alumno listo para combinar con vocales y nuevos fonemas."

  return (
    <div className="space-y-2">
      <div className="h-28">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              dataKey="hito"
              type="category"
              width={90}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(_: number, __: string, props: { payload?: { status: StatusLevel } }) =>
                [STATUS_LABELS[props.payload?.status ?? "green"], "Estado"]
              }
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <Bar dataKey="valor" radius={[0, 6, 6, 0]} barSize={20}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={STATUS_HEX[entry.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-muted-foreground italic bg-muted/40 rounded-lg px-3 py-2 leading-relaxed">
        ALBA sugiere: {suggestion}
      </p>
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

  const [localStatus, setLocalStatus]         = useState<Record<string, StatusLevel>>({})
  const [activeCell, setActiveCell]           = useState<ActiveCell | null>(null)
  const [savingCell, setSavingCell]           = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [evalField, setEvalField]             = useState<FieldKey>("cf")
  const containerRef = useRef<HTMLDivElement>(null)

  // Close popover on outside click
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

  // Merge server data with local overrides for instant feedback
  const students: Student[] = rawStudents.map((s) => ({
    ...s,
    cf: (localStatus[`${s.id}-cf`] as StatusLevel) ?? s.cf,
    rl: (localStatus[`${s.id}-rl`] as StatusLevel) ?? s.rl,
    o:  (localStatus[`${s.id}-o`]  as StatusLevel) ?? s.o,
  }))

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
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold text-primary">
            Mapa de Calor del Aula
          </CardTitle>
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

        {/* Quick-eval field selector tabs */}
        {!isLoading && students.length > 0 && (
          <div className="flex items-center gap-1 mt-2 flex-wrap">
            <span className="text-xs text-muted-foreground mr-1">Evaluar:</span>
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
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 flex flex-col gap-3 flex-1">
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
          <div ref={containerRef} className="flex flex-col gap-2">

            {/* Column headers */}
            <div className="grid grid-cols-[1fr_repeat(3,_minmax(0,_56px))_auto] gap-2 items-center px-1">
              <span className="text-xs font-medium text-muted-foreground">Alumno</span>
              {(["cf", "rl", "o"] as FieldKey[]).map((f) => (
                <span key={f} className="text-xs font-bold text-muted-foreground uppercase text-center">
                  {FIELD_MAP[f]}
                </span>
              ))}
              <span className="text-xs font-medium text-muted-foreground text-center w-20">
                {FIELD_MAP[evalField]}
              </span>
            </div>

            {/* Student rows */}
            {students.map((student) => {
              const isSelected = resolvedSelected?.id === student.id
              return (
                <div key={student.id} className="flex flex-col gap-1">
                  <div
                    className={`grid grid-cols-[1fr_repeat(3,_minmax(0,_56px))_auto] gap-2 items-center px-1 py-1 rounded-xl transition-colors ${
                      isSelected ? "bg-primary/5" : ""
                    }`}
                  >
                    {/* Name */}
                    <button
                      className="text-sm font-medium text-foreground text-left flex items-center gap-1.5 min-w-0"
                      onClick={() => setSelectedStudent(isSelected ? null : student)}
                    >
                      <BarChart2
                        size={13}
                        className={`shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <span className="truncate">{student.name}</span>
                    </button>

                    {/* Heat cells — CF, RL, O */}
                    {(["cf", "rl", "o"] as FieldKey[]).map((field) => {
                      const cellKey  = `${student.id}-${field}`
                      const isOpen   = activeCell?.studentId === student.id && activeCell?.field === field
                      const isSaving = savingCell === cellKey
                      return (
                        <div key={field} className="relative">
                          <HeatCell
                            status={student[field]}
                            saving={isSaving}
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

                    {/* Quick-eval buttons for selected field */}
                    <div className="w-20 flex justify-center">
                      <QuickEvalButtons
                        student={student}
                        activeField={evalField}
                        onEval={handleStatusChange}
                      />
                    </div>
                  </div>

                  {/* Expandable detail chart */}
                  {isSelected && (
                    <div className="mx-1 mb-1 border border-border rounded-xl p-3 bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-foreground">
                          Diagnostico: {student.name}
                        </p>
                        <button
                          onClick={() => setSelectedStudent(null)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Cerrar detalle"
                        >
                          <X size={13} />
                        </button>
                      </div>
                      <StudentDetailChart student={resolvedSelected!} />
                    </div>
                  )}
                </div>
              )
            })}

            {/* Legend */}
            <div className="pt-2 mt-auto border-t border-border flex flex-wrap gap-3 text-xs text-muted-foreground">
              {STATUS_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center gap-1.5">
                  <span className={`inline-block w-3 h-3 rounded-full ${STATUS_BG[opt.value]}`} />
                  {opt.label}
                </div>
              ))}
              <span className="ml-auto italic hidden sm:inline">Toca una celda para editar</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
