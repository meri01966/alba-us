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

const COLOR: Record<StatusLevel, string> = {
  green:  "#10b981",
  yellow: "#fbbf24",
  red:    "#ef4444",
}

const STATUS_LABEL: Record<StatusLevel, string> = {
  green:  "Logrado",
  yellow: "En proceso",
  red:    "Necesita refuerzo",
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

// ── Torta SVG grande (ficha individual) ─────────────────────────────────────
// 3 sectores de 120° c/u. Sector activo (eje del dia) levemente mas grande.
function PieChart({
  cf, rl, o, ejeDia, size = 56,
}: {
  cf: StatusLevel; rl: StatusLevel; o: StatusLevel
  ejeDia: FieldKey; size?: number
}) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 2

  // Angulos: CF 270°-390°, RL 30°-150°, O 150°-270°
  const sectors: { key: FieldKey; startDeg: number; endDeg: number; status: StatusLevel }[] = [
    { key: "cf", startDeg: 270, endDeg: 390, status: cf },
    { key: "rl", startDeg:  30, endDeg: 150, status: rl },
    { key: "o",  startDeg: 150, endDeg: 270, status: o  },
  ]

  function polarToXY(deg: number, radius: number) {
    const rad = (deg * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) }
  }

  function sectorPath(startDeg: number, endDeg: number, radius: number) {
    const start = polarToXY(startDeg, radius)
    const end   = polarToXY(endDeg,   radius)
    return `M${cx},${cy} L${start.x},${start.y} A${radius},${radius} 0 0,1 ${end.x},${end.y} Z`
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {sectors.map(({ key, startDeg, endDeg, status }) => {
        const isActive = key === ejeDia
        const radius   = isActive ? r : r - 2
        return (
          <path
            key={key}
            d={sectorPath(startDeg, endDeg, radius)}
            fill={COLOR[status]}
            stroke="#fff"
            strokeWidth="1.5"
            opacity={isActive ? 1 : 0.75}
          />
        )
      })}
      {/* Centro hueco */}
      <circle cx={cx} cy={cy} r={r * 0.38} fill="#fff" />
    </svg>
  )
}

// ── Mini torta (fila de alumno) ──────────────────────────────────────────────
function MiniPie({ cf, rl, o }: { cf: StatusLevel; rl: StatusLevel; o: StatusLevel }) {
  return (
    <PieChart cf={cf} rl={rl} o={o} ejeDia="cf" size={28} />
  )
}

// ── Panel expandido individual ───────────────────────────────────────────────
function StudentDetailPanel({
  student,
  ejeDia,
  onEval,
  saving,
}: {
  student: Student
  ejeDia: FieldKey
  onEval: (field: FieldKey, status: StatusLevel) => void
  saving: boolean
}) {
  const redCount  = [student.cf, student.rl, student.o].filter((s) => s === "red").length
  const readiness = redCount >= 2 ? "reinforce" : "advance"

  return (
    <div className="px-3 pb-3 pt-2 border-t border-border">
      {/* Torta grande + estados de cada eje */}
      <div className="flex gap-4 items-center mb-3">
        <PieChart cf={student.cf} rl={student.rl} o={student.o} ejeDia={ejeDia} size={64} />
        <div className="flex flex-col gap-1.5 flex-1">
          {FIELDS.map(({ key, short, label }) => {
            const status   = student[key]
            const isActive = key === ejeDia
            return (
              <div key={key} className="flex items-center gap-2">
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded w-6 text-center shrink-0"
                  style={{
                    backgroundColor: isActive ? "#1e3a5f" : "#e5e7eb",
                    color:           isActive ? "#fff"    : "#6b7280",
                  }}
                >
                  {short}
                </span>
                <span className="text-[11px] text-gray-500 flex-1 truncate">{label}</span>
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: COLOR[status] + "22",
                    color:           status === "green" ? "#065f46" : status === "yellow" ? "#92400e" : "#991b1b",
                  }}
                >
                  {STATUS_LABEL[status]}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Botones de evaluacion para el eje del dia */}
      <div
        className="rounded-xl p-2.5"
        style={{ backgroundColor: "#1e3a5f08", border: "1.5px dashed #1e3a5f44" }}
      >
        <p className="text-[10px] font-semibold mb-1.5" style={{ color: "#1e3a5f" }}>
          Evaluar {FIELDS.find((f) => f.key === ejeDia)?.label}:
        </p>
        <div className="flex gap-2 flex-wrap">
          {EVAL_OPTIONS.map((opt) => {
            const Icon     = opt.icon
            const isChosen = student[ejeDia] === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => onEval(ejeDia, opt.value)}
                disabled={saving}
                style={isChosen ? opt.activeStyle : opt.inactiveStyle}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50 flex-1 justify-center"
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                {opt.label}
              </button>
            )
          })}
          {saving && <Spinner className="w-3.5 h-3.5 text-primary self-center" />}
        </div>
      </div>

      {/* Leyenda global */}
      <div
        className="flex items-center gap-2 mt-2.5 px-3 py-2 rounded-lg text-xs font-semibold"
        style={{
          backgroundColor: readiness === "advance" ? "#ecfdf5" : "#fef2f2",
          color:           readiness === "advance" ? "#065f46" : "#991b1b",
        }}
      >
        {readiness === "advance"
          ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          : <AlertCircle  className="w-3.5 h-3.5 shrink-0" />}
        {readiness === "advance" ? "Listo para avanzar" : "Necesita refuerzo en varios ejes"}
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
  saving: boolean
  onEval: (field: FieldKey, status: StatusLevel) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const ejeStatus = student[ejeDia]

  return (
    <li className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Fila principal */}
      <div className="flex items-center gap-2 px-2.5 py-2">

        {/* Mini torta + nombre — toca para expandir */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left group"
          aria-expanded={expanded}
        >
          <MiniPie cf={student.cf} rl={student.rl} o={student.o} />
          <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {student.name}
          </span>
          {expanded
            ? <ChevronUp   className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
        </button>

        {/* Botones rapidos — impactan SOLO el eje del dia */}
        <div className="flex items-center gap-1 shrink-0">
          {EVAL_OPTIONS.map((opt) => {
            const Icon     = opt.icon
            const isChosen = ejeStatus === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => onEval(ejeDia, opt.value)}
                disabled={saving}
                title={opt.label}
                style={isChosen ? opt.activeStyle : opt.inactiveStyle}
                className="flex items-center justify-center w-8 h-8 rounded-lg border transition-all hover:scale-110 disabled:opacity-50"
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Detalle expandible */}
      {expanded && (
        <StudentDetailPanel
          student={student}
          ejeDia={ejeDia}
          onEval={onEval}
          saving={saving}
        />
      )}
    </li>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────
export function HeatMap() {
  const { data, isLoading } = useSWR<StudentsResponse>("/api/students", fetcher, {
    revalidateOnFocus: false,
  })

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
      // mantiene estado local
    } finally {
      setSavingCell(null)
    }
  }

  const ejeInfo = FIELDS.find((f) => f.key === ejeDia)!

  return (
    <Card className="shadow-md h-full flex flex-col">
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

        {/* Selector eje del dia */}
        <div
          className="mt-3 rounded-xl p-2.5 flex flex-col gap-2"
          style={{ backgroundColor: "#1e3a5f08", border: "1.5px solid #1e3a5f22" }}
        >
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: "#1e3a5f" }} />
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#1e3a5f" }}>
              Eje del dia
            </span>
            <span
              className="ml-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
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
                className="flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all hover:scale-105"
                style={ejeDia === key
                  ? { backgroundColor: "#1e3a5f", color: "#fff", borderColor: "#1e3a5f" }
                  : { backgroundColor: "#fff",    color: "#6b7280", borderColor: "#d1d5db" }
                }
              >
                {short}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10">
            <Spinner className="text-primary" />
            <span className="text-sm text-muted-foreground">Cargando alumnos...</span>
          </div>
        ) : students.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">Sin registros disponibles</p>
        ) : (
          <ul className="space-y-2">
            {students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                ejeDia={ejeDia}
                saving={savingCell?.startsWith(student.id) ?? false}
                onEval={(field, status) => handleEval(student, field, status)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
