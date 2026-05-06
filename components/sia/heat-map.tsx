"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"

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

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const FIELDS: { key: FieldKey; label: string; short: string }[] = [
  { key: "cf", label: "Conciencia Fonológica", short: "CF" },
  { key: "o",  label: "Oralidad",              short: "O"  },
  { key: "rl", label: "Reconocimiento Letras", short: "RL" },
]

const STATUS_OPTIONS: {
  value: StatusLevel
  label: string
  icon: React.ElementType
  activeStyle: React.CSSProperties
  inactiveStyle: React.CSSProperties
}[] = [
  {
    value: "green",
    label: "Logrado",
    icon: CheckCircle2,
    activeStyle:   { backgroundColor: "#10b981", color: "#fff", borderColor: "#10b981" },
    inactiveStyle: { backgroundColor: "#d1fae5", color: "#10b981", borderColor: "#6ee7b7" },
  },
  {
    value: "yellow",
    label: "En proceso",
    icon: Clock,
    activeStyle:   { backgroundColor: "#fbbf24", color: "#fff", borderColor: "#fbbf24" },
    inactiveStyle: { backgroundColor: "#fef3c7", color: "#d97706", borderColor: "#fcd34d" },
  },
  {
    value: "red",
    label: "Necesita refuerzo",
    icon: AlertCircle,
    activeStyle:   { backgroundColor: "#ef4444", color: "#fff", borderColor: "#ef4444" },
    inactiveStyle: { backgroundColor: "#fee2e2", color: "#ef4444", borderColor: "#fca5a5" },
  },
]

const BAR_WIDTH: Record<StatusLevel, string> = {
  green:  "100%",
  yellow: "60%",
  red:    "25%",
}

const BAR_COLOR: Record<StatusLevel, string> = {
  green:  "#10b981",
  yellow: "#fbbf24",
  red:    "#ef4444",
}

const STATUS_LABEL: Record<StatusLevel, string> = {
  green:  "Logrado",
  yellow: "En proceso",
  red:    "Necesita refuerzo",
}

function getReadiness(student: Student): "advance" | "reinforce" {
  const reds = [student.cf, student.rl, student.o].filter((s) => s === "red").length
  return reds >= 2 ? "reinforce" : "advance"
}

// ── Panel de detalle individual ──────────────────────────────────────────────
function StudentDetailPanel({
  student,
  activeField,
  onSelectField,
  onEval,
  savingField,
}: {
  student: Student
  activeField: FieldKey | null
  onSelectField: (f: FieldKey) => void
  onEval: (field: FieldKey, status: StatusLevel) => void
  savingField: FieldKey | null
}) {
  const readiness = getReadiness(student)

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-4">

      {/* Barras por area */}
      <div className="space-y-3">
        {FIELDS.map(({ key, label, short }) => {
          const status  = student[key]
          const isActive = activeField === key
          return (
            <div key={key}>
              {/* Fila: label + badge + boton selector */}
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={() => onSelectField(key)}
                  className="flex items-center gap-1.5 text-xs font-semibold group"
                  style={{ color: isActive ? "#1e3a5f" : "#6b7280" }}
                >
                  <span
                    className="px-1.5 py-0.5 rounded font-bold text-[10px]"
                    style={{
                      backgroundColor: isActive ? "#1e3a5f" : "#e5e7eb",
                      color: isActive ? "#fff" : "#6b7280",
                    }}
                  >
                    {short}
                  </span>
                  {label}
                  {isActive && (
                    <span className="text-[10px] font-normal ml-1" style={{ color: "#10b981" }}>
                      evaluando ahora
                    </span>
                  )}
                </button>
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: status === "green" ? "#d1fae5" : status === "yellow" ? "#fef3c7" : "#fee2e2",
                    color:           status === "green" ? "#065f46" : status === "yellow" ? "#92400e" : "#991b1b",
                  }}
                >
                  {STATUS_LABEL[status]}
                </span>
              </div>

              {/* Barra de progreso */}
              <div
                className="h-2.5 w-full rounded-full overflow-hidden"
                style={{ backgroundColor: "#e5e7eb" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: BAR_WIDTH[status],
                    backgroundColor: BAR_COLOR[status],
                    boxShadow: isActive ? `0 0 6px ${BAR_COLOR[status]}88` : "none",
                  }}
                />
              </div>

              {/* Botones de evaluacion — solo visibles cuando este area esta activa */}
              {isActive && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-gray-400 mr-1">Marcar:</span>
                  {STATUS_OPTIONS.map((opt) => {
                    const Icon     = opt.icon
                    const isChosen = student[key] === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onEval(key, opt.value)}
                        disabled={savingField === key}
                        title={opt.label}
                        aria-label={opt.label}
                        style={isChosen ? opt.activeStyle : opt.inactiveStyle}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition-all disabled:opacity-50"
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        {opt.label}
                      </button>
                    )
                  })}
                  {savingField === key && <Spinner className="w-3.5 h-3.5 text-primary ml-1" />}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Leyenda global del alumno */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold"
        style={{
          backgroundColor: readiness === "advance" ? "#ecfdf5" : "#fef2f2",
          color:           readiness === "advance" ? "#065f46" : "#991b1b",
        }}
      >
        {readiness === "advance"
          ? <CheckCircle2 className="w-4 h-4 shrink-0" />
          : <AlertCircle  className="w-4 h-4 shrink-0" />}
        {readiness === "advance" ? "Listo para avanzar" : "Necesita refuerzo"}
      </div>
    </div>
  )
}

// ── Fila de alumno ───────────────────────────────────────────────────────────
function StudentRow({
  student,
  saving,
  onEval,
}: {
  student: Student
  saving: FieldKey | null
  onEval: (field: FieldKey, status: StatusLevel) => void
}) {
  const [expanded, setExpanded]       = useState(false)
  const [activeField, setActiveField] = useState<FieldKey | null>(null)

  function handleSelectField(f: FieldKey) {
    if (!expanded) setExpanded(true)
    setActiveField((prev) => (prev === f ? null : f))
  }

  return (
    <li className="border border-border rounded-xl overflow-hidden">
      {/* Cabecera de fila */}
      <div className="flex items-center gap-3 px-3 py-2.5">

        {/* Nombre — toca para expandir detalle */}
        <button
          onClick={() => {
            setExpanded((v) => !v)
            if (!expanded) setActiveField(null)
          }}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left group"
          aria-expanded={expanded}
        >
          <span className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
            {student.name}
          </span>
          {expanded
            ? <ChevronUp   className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
        </button>

        {/* Chips de area — tocar selecciona el area activa y expande */}
        <div className="flex items-center gap-1 shrink-0">
          {FIELDS.map(({ key, short }) => {
            const status    = student[key]
            const isActive  = activeField === key && expanded
            return (
              <button
                key={key}
                onClick={() => handleSelectField(key)}
                title={`Evaluar ${short}`}
                style={{
                  backgroundColor: isActive
                    ? BAR_COLOR[status]
                    : status === "green"  ? "#d1fae5"
                    : status === "yellow" ? "#fef3c7"
                    : "#fee2e2",
                  color: isActive
                    ? "#fff"
                    : status === "green"  ? "#065f46"
                    : status === "yellow" ? "#92400e"
                    : "#991b1b",
                  borderColor: BAR_COLOR[status],
                }}
                className="flex items-center justify-center w-7 h-7 rounded-lg border text-[11px] font-bold transition-all hover:scale-105"
              >
                {short}
              </button>
            )
          })}
        </div>
      </div>

      {/* Detalle expandible */}
      {expanded && (
        <div className="px-3 pb-3">
          <StudentDetailPanel
            student={student}
            activeField={activeField}
            onSelectField={setActiveField}
            onEval={onEval}
            savingField={saving}
          />
        </div>
      )}
    </li>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────
export function HeatMap() {
  const { data, isLoading } = useSWR<StudentsResponse>("/api/students", fetcher, {
    revalidateOnFocus: false,
  })

  const [localStatus, setLocalStatus] = useState<Record<string, StatusLevel>>({})
  const [savingCell, setSavingCell]   = useState<string | null>(null) // "studentId-field"

  const rawStudents = data?.students ?? []
  const source      = data?.source ?? null

  const students: Student[] = rawStudents.map((s) => ({
    ...s,
    cf: (localStatus[`${s.id}-cf`] as StatusLevel) ?? s.cf,
    rl: (localStatus[`${s.id}-rl`] as StatusLevel) ?? s.rl,
    o:  (localStatus[`${s.id}-o`]  as StatusLevel) ?? s.o,
  }))

  async function handleEval(student: Student, field: FieldKey, status: StatusLevel) {
    const cellKey = `${student.id}-${field}`
    setSavingCell(cellKey)

    // Actualiza solo el campo evaluado
    setLocalStatus((prev) => ({ ...prev, [cellKey]: status }))

    try {
      await fetch("/api/registrar-actividad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          field: field.toUpperCase(),
          status,
        }),
      })
    } catch {
      // Mantiene el estado local aunque falle Airtable
    } finally {
      setSavingCell(null)
    }
  }

  return (
    <Card className="shadow-md h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold text-primary">
            Registro del aula
          </CardTitle>
          {!isLoading && source && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: source === "airtable" ? "#ecfdf5" : "#f3f4f6",
                color:           source === "airtable" ? "#065f46" : "#6b7280",
              }}
            >
              {source === "airtable" ? "Airtable" : "Demo"}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Toca el nombre para ver el detalle. Toca <strong>CF</strong>, <strong>O</strong> o <strong>RL</strong> para evaluar esa area.
        </p>
      </CardHeader>

      <CardContent className="pt-0">
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
          <ul className="space-y-2">
            {students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                saving={savingCell?.startsWith(student.id) ? savingCell.replace(`${student.id}-`, "") as FieldKey : null}
                onEval={(field, status) => handleEval(student, field, status)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
