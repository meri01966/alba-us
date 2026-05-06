"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp, BookOpen } from "lucide-react"

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
  { key: "rl", label: "Reconocimiento Letras", short: "RL" },
  { key: "o",  label: "Oralidad",              short: "O"  },
]

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

// Cuanto ocupa la barra segun el estado (para CF y RL)
const BAR_PERCENT: Record<StatusLevel, number> = {
  green:  82,
  yellow: 50,
  red:    20,
}

const EVAL_OPTIONS: {
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

// ── Barra normal (CF / RL) ───────────────────────────────────────────────────
function StandardBar({ status, highlight }: { status: StatusLevel; highlight: boolean }) {
  const pct = BAR_PERCENT[status]
  return (
    <div
      className="h-2.5 w-full rounded-full overflow-hidden"
      style={{ backgroundColor: "#e5e7eb" }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${pct}%`,
          backgroundColor: BAR_COLOR[status],
          boxShadow: highlight ? `0 0 6px ${BAR_COLOR[status]}99` : "none",
        }}
      />
    </div>
  )
}

// ── Barra segmentada de Oralidad ─────────────────────────────────────────────
// Tres segmentos (rojo / amarillo / verde) que crecen progresivamente.
// Nunca llega al 100% porque la oralidad es un proceso constante.
function OralidadBar({ status }: { status: StatusLevel }) {
  // Proporciones fijas de cada segmento sobre el total visible (max 88%)
  const segments: { color: string; maxPct: number }[] = [
    { color: "#ef4444", maxPct: 28 }, // rojo  — base siempre presente
    { color: "#fbbf24", maxPct: 32 }, // amarillo — proceso
    { color: "#10b981", maxPct: 28 }, // verde  — logro parcial
  ]

  // Cuantos segmentos se muestran llenos segun el estado del alumno
  const filledSegments =
    status === "red"    ? 1 :
    status === "yellow" ? 2 : 3

  return (
    <div className="flex gap-0.5 h-2.5 w-full">
      {segments.map((seg, i) => {
        const isFilled = i < filledSegments
        return (
          <div
            key={i}
            className="rounded-full transition-all duration-500 overflow-hidden"
            style={{
              flex: seg.maxPct,
              backgroundColor: "#e5e7eb",
            }}
          >
            <div
              className="h-full transition-all duration-500"
              style={{
                width: isFilled ? "100%" : "0%",
                backgroundColor: seg.color,
              }}
            />
          </div>
        )
      })}
      {/* Gap visual al final para enfatizar que nunca llega al 100% */}
      <div style={{ flex: 12, backgroundColor: "transparent" }} />
    </div>
  )
}

// ── Panel de detalle individual ──────────────────────────────────────────────
function StudentDetailPanel({
  student,
  ejeDia,
  onEval,
  savingField,
}: {
  student: Student
  ejeDia: FieldKey
  onEval: (field: FieldKey, status: StatusLevel) => void
  savingField: FieldKey | null
}) {
  const readiness = [student.cf, student.rl, student.o].filter((s) => s === "red").length >= 2
    ? "reinforce" : "advance"

  return (
    <div className="mt-3 pt-3 border-t border-border space-y-4">

      {/* Barras por area — solo muestra el eje del dia */}
      <div className="space-y-3">
        {FIELDS.filter(({ key }) => key === ejeDia).map(({ key, label, short }) => {
          const status     = student[key]
          const isEjeActivo = true

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="px-1.5 py-0.5 rounded font-bold text-[10px]"
                    style={{
                      backgroundColor: isEjeActivo ? "#1e3a5f" : "#e5e7eb",
                      color:           isEjeActivo ? "#fff"    : "#6b7280",
                    }}
                  >
                    {short}
                  </span>
                  <span className="text-xs font-medium" style={{ color: isEjeActivo ? "#1e3a5f" : "#6b7280" }}>
                    {label}
                  </span>
                  {isEjeActivo && (
                    <span
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: "#1e3a5f22", color: "#1e3a5f" }}
                    >
                      eje del dia
                    </span>
                  )}
                </div>
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

              {/* Barra */}
              {key === "o"
                ? <OralidadBar status={status} />
                : <StandardBar status={status} highlight={isEjeActivo} />
              }

              {/* Botones de evaluacion — solo en el eje del dia */}
              {isEjeActivo && (
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-gray-400">Marcar:</span>
                  {EVAL_OPTIONS.map((opt) => {
                    const Icon     = opt.icon
                    const isChosen = student[key] === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => onEval(key, opt.value)}
                        disabled={savingField === key}
                        title={opt.label}
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

      {/* Leyenda global */}
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
  ejeDia,
  saving,
  onEval,
}: {
  student: Student
  ejeDia: FieldKey
  saving: FieldKey | null
  onEval: (field: FieldKey, status: StatusLevel) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const ejeStatus = student[ejeDia]

  return (
    <li className="border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 px-3 py-2.5">

        {/* Nombre */}
        <button
          onClick={() => setExpanded((v) => !v)}
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

        {/* Tres botones de evaluacion — impactan SOLO el eje del dia */}
        <div className="flex items-center gap-1 shrink-0">
          {EVAL_OPTIONS.map((opt) => {
            const Icon     = opt.icon
            const isChosen = ejeStatus === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => onEval(ejeDia, opt.value)}
                disabled={saving === ejeDia}
                title={opt.label}
                style={isChosen ? opt.activeStyle : opt.inactiveStyle}
                className="flex items-center justify-center w-8 h-8 rounded-lg border transition-all hover:scale-105 disabled:opacity-50"
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          })}
          {saving === ejeDia && <Spinner className="w-3.5 h-3.5 text-primary" />}
        </div>
      </div>

      {/* Detalle expandible */}
      {expanded && (
        <div className="px-3 pb-3">
          <StudentDetailPanel
            student={student}
            ejeDia={ejeDia}
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

  // Eje del dia: el docente selecciona cual area se evalua hoy
  const [ejeDia, setEjeDia]           = useState<FieldKey>("rl")
  const [localStatus, setLocalStatus] = useState<Record<string, StatusLevel>>({})
  const [savingCell, setSavingCell]   = useState<string | null>(null)

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
    setLocalStatus((prev) => ({ ...prev, [cellKey]: status }))

    try {
      await fetch("/api/registrar-actividad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, field: field.toUpperCase(), status }),
      })
    } catch {
      // Estado local se mantiene aunque falle Airtable
    } finally {
      setSavingCell(null)
    }
  }

  const ejeInfo = FIELDS.find((f) => f.key === ejeDia)!

  return (
    <Card className="shadow-md h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
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

        {/* Selector del Eje del Dia */}
        <div className="mt-2 p-2.5 rounded-xl border-2 flex flex-col gap-2" style={{ borderColor: "#1e3a5f33", backgroundColor: "#1e3a5f08" }}>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: "#1e3a5f" }} />
            <span className="text-xs font-semibold" style={{ color: "#1e3a5f" }}>
              Eje del dia:
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#1e3a5f", color: "#fff" }}
            >
              {ejeInfo.label}
            </span>
          </div>
          <div className="flex gap-1.5">
            {FIELDS.map(({ key, short, label }) => (
              <button
                key={key}
                onClick={() => setEjeDia(key)}
                title={label}
                className="flex-1 py-1 rounded-lg border text-xs font-bold transition-all hover:scale-105"
                style={ejeDia === key
                  ? { backgroundColor: "#1e3a5f", color: "#fff", borderColor: "#1e3a5f" }
                  : { backgroundColor: "#fff", color: "#6b7280", borderColor: "#d1d5db" }
                }
              >
                {short}
              </button>
            ))}
          </div>
        </div>
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
                ejeDia={ejeDia}
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
