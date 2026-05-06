"use client"

import { useState, useRef, useEffect } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronUp } from "lucide-react"

type StatusLevel = "green" | "yellow" | "red"
type FieldKey = "cf" | "rl" | "o"

interface Student {
  id: string
  name: string
  cf: StatusLevel
  rl: StatusLevel
  o: StatusLevel
}

interface StudentsResponse {
  students: Student[]
  source: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const FIELD_LABELS: Record<FieldKey, string> = {
  cf: "Conciencia Fonológica",
  rl: "Reconocimiento de Letras",
  o:  "Oralidad",
}

const STATUS_BAR: Record<StatusLevel, { bg: string; width: string; label: string }> = {
  green:  { bg: "bg-emerald-500",  width: "w-full",    label: "Logrado" },
  yellow: { bg: "bg-amber-400",    width: "w-2/3",     label: "En proceso" },
  red:    { bg: "bg-red-500",      width: "w-1/3",     label: "Requiere refuerzo" },
}

// Determine overall readiness for a student
function getReadiness(student: Student): "advance" | "reinforce" {
  const scores = [student.cf, student.rl, student.o]
  const reds = scores.filter((s) => s === "red").length
  return reds >= 2 ? "reinforce" : "advance"
}

// Daily activity evaluation buttons
const DAY_OPTIONS: {
  value: StatusLevel
  label: string
  icon: React.ElementType
  activeStyle: React.CSSProperties
  inactiveStyle: React.CSSProperties
  activeClass: string
  inactiveClass: string
}[] = [
  {
    value: "green",
    label: "Logrado",
    icon: CheckCircle2,
    activeStyle:   { backgroundColor: "#10b981", color: "#fff", borderColor: "#10b981" },
    inactiveStyle: { backgroundColor: "#d1fae5", color: "#10b981", borderColor: "#6ee7b7" },
    activeClass:   "shadow-md scale-105",
    inactiveClass: "",
  },
  {
    value: "yellow",
    label: "En proceso",
    icon: Clock,
    activeStyle:   { backgroundColor: "#fbbf24", color: "#fff", borderColor: "#fbbf24" },
    inactiveStyle: { backgroundColor: "#fef3c7", color: "#d97706", borderColor: "#fcd34d" },
    activeClass:   "shadow-md scale-105",
    inactiveClass: "",
  },
  {
    value: "red",
    label: "Necesita refuerzo",
    icon: AlertCircle,
    activeStyle:   { backgroundColor: "#ef4444", color: "#fff", borderColor: "#ef4444" },
    inactiveStyle: { backgroundColor: "#fee2e2", color: "#ef4444", borderColor: "#fca5a5" },
    activeClass:   "shadow-md scale-105",
    inactiveClass: "",
  },
]

function StudentDetailPanel({ student }: { student: Student }) {
  const readiness = getReadiness(student)
  return (
    <div className="mt-3 pt-3 border-t border-border space-y-3">
      {/* Bars per hito */}
      {(["cf", "rl", "o"] as FieldKey[]).map((field) => {
        const status = student[field]
        const bar = STATUS_BAR[status]
        return (
          <div key={field} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">{FIELD_LABELS[field]}</span>
              <span className={`
                px-2 py-0.5 rounded-full font-medium
                ${status === "green"  ? "bg-emerald-100 text-emerald-700" : ""}
                ${status === "yellow" ? "bg-amber-100 text-amber-700"     : ""}
                ${status === "red"    ? "bg-red-100 text-red-700"         : ""}
              `}>
                {bar.label}
              </span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${bar.bg} ${bar.width}`} />
            </div>
          </div>
        )
      })}

      {/* Individual readiness legend */}
      <div className={`
        flex items-center gap-2 mt-2 px-3 py-2 rounded-lg text-sm font-semibold
        ${readiness === "advance"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"}
      `}>
        {readiness === "advance"
          ? <CheckCircle2 className="w-4 h-4 shrink-0" />
          : <AlertCircle className="w-4 h-4 shrink-0" />}
        {readiness === "advance" ? "Listo para avanzar" : "Necesita refuerzo"}
      </div>
    </div>
  )
}

function StudentRow({
  student,
  dayStatus,
  saving,
  onDayStatus,
}: {
  student: Student
  dayStatus: StatusLevel | null
  saving: boolean
  onDayStatus: (s: StatusLevel) => void
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <li className="border border-border rounded-xl overflow-hidden">
      {/* Row header */}
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Name — tap to expand detail */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left group"
          aria-expanded={expanded}
        >
          <span className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
            {student.name}
          </span>
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
        </button>

        {/* Day evaluation buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {saving && <Spinner className="w-4 h-4 text-primary" />}
          {DAY_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const isActive = dayStatus === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => onDayStatus(opt.value)}
                disabled={saving}
                title={opt.label}
                aria-label={`Marcar ${student.name}: ${opt.label}`}
                style={isActive ? opt.activeStyle : opt.inactiveStyle}
                className={`
                  flex items-center justify-center w-8 h-8 rounded-lg border transition-all text-sm
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${isActive ? opt.activeClass : opt.inactiveClass}
                `}
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          })}
        </div>
      </div>

      {/* Expandable detail */}
      {expanded && (
        <div className="px-3 pb-3">
          <StudentDetailPanel student={student} />
        </div>
      )}
    </li>
  )
}

export function HeatMap() {
  const { data, isLoading, mutate } = useSWR<StudentsResponse>("/api/students", fetcher, {
    revalidateOnFocus: false,
  })

  // Local day-activity evaluations: { studentId: StatusLevel }
  const [dayEvals, setDayEvals] = useState<Record<string, StatusLevel>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const students = data?.students ?? []
  const source   = data?.source ?? null

  async function handleDayEval(student: Student, status: StatusLevel) {
    setSavingId(student.id)
    setDayEvals((prev) => ({ ...prev, [student.id]: status }))

    try {
      await fetch("/api/registrar-actividad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          field: "DIA",
          status,
        }),
      })
    } catch (err) {
      // Keep local state even if API fails — don't revert
    } finally {
      setSavingId(null)
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
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              source === "airtable"
                ? "bg-accent/15 text-accent"
                : "bg-muted text-muted-foreground"
            }`}>
              {source === "airtable" ? "Airtable" : "Demo"}
            </span>
          )}
        </div>

        {/* Button legend */}
        <div className="flex flex-wrap gap-3 mt-1">
          {DAY_OPTIONS.map((opt) => {
            const Icon = opt.icon
            return (
              <div key={opt.value} className="flex items-center gap-1 text-xs text-muted-foreground">
                <Icon className="w-3.5 h-3.5" style={{ color: (opt.activeStyle as React.CSSProperties).backgroundColor as string }} />
                {opt.label}
              </div>
            )
          })}
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
                dayStatus={dayEvals[student.id] ?? null}
                saving={savingId === student.id}
                onDayStatus={(status) => handleDayEval(student, status)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
