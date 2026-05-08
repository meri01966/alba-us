"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, Clock, AlertCircle, BookOpen } from "lucide-react"

type StatusLevel = "green" | "yellow" | "red"

interface Student {
  id: string
  name?: string
  nombre?: string
}

interface HeatMapProps {
  students: Student[]
  evaluaciones?: Record<string, StatusLevel>
  onEvaluacion?: (studentId: string, status: StatusLevel, actividad: string) => void
  isLoading?: boolean
}

// Actividad del dia (mapea a CF segun las reglas de ALBA)
const ACTIVIDAD_DEL_DIA = "Reconocimiento de Sonido Inicial /M/"

const EVAL_OPTIONS: {
  value: StatusLevel
  label: string
  nivelCompetencia: string
  icon: React.ElementType
  activeStyle: React.CSSProperties
  inactiveStyle: React.CSSProperties
}[] = [
  {
    value: "green",
    label: "Logrado",
    nivelCompetencia: "Nivel Avanzado",
    icon: CheckCircle2,
    activeStyle: { backgroundColor: "#10b981", color: "#fff", borderColor: "#10b981" },
    inactiveStyle: { backgroundColor: "#d1fae5", color: "#10b981", borderColor: "#6ee7b7" },
  },
  {
    value: "yellow",
    label: "En proceso",
    nivelCompetencia: "Nivel Intermedio",
    icon: Clock,
    activeStyle: { backgroundColor: "#fbbf24", color: "#fff", borderColor: "#fbbf24" },
    inactiveStyle: { backgroundColor: "#fef3c7", color: "#d97706", borderColor: "#fcd34d" },
  },
  {
    value: "red",
    label: "Refuerzo",
    nivelCompetencia: "Requiere Apoyo",
    icon: AlertCircle,
    activeStyle: { backgroundColor: "#ef4444", color: "#fff", borderColor: "#ef4444" },
    inactiveStyle: { backgroundColor: "#fee2e2", color: "#ef4444", borderColor: "#fca5a5" },
  },
]

function StudentRow({
  student,
  currentStatus,
  saving,
  onEval,
}: {
  student: Student
  currentStatus: StatusLevel | null
  saving: boolean
  onEval: (status: StatusLevel) => void
}) {
  const studentName = student.name || student.nombre || "Sin nombre"
  
  return (
    <li className="flex items-center gap-2 px-3 py-2.5 border border-border rounded-xl bg-card">
      <span className="text-sm font-semibold text-foreground flex-1 truncate">
        {studentName}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        {EVAL_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isChosen = currentStatus === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onEval(opt.value)}
              disabled={saving}
              title={`${opt.label} - ${opt.nivelCompetencia}`}
              style={isChosen ? opt.activeStyle : opt.inactiveStyle}
              className="flex items-center justify-center w-8 h-8 rounded-lg border transition-all hover:scale-110 disabled:opacity-50"
            >
              <Icon className="w-4 h-4" />
            </button>
          )
        })}
        {saving && <Spinner className="w-4 h-4 text-primary" />}
      </div>
    </li>
  )
}

export function HeatMap({ students = [], evaluaciones = {}, onEvaluacion, isLoading = false }: HeatMapProps) {
  const [localStatus, setLocalStatus] = useState<Record<string, StatusLevel>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  // Si no hay estudiantes y no esta cargando, retornar null
  if (!isLoading && (!students || students.length === 0)) {
    return null
  }

  async function handleEval(student: Student, status: StatusLevel) {
    const cellKey = `${student.id}-cf`
    setSavingId(student.id)
    setLocalStatus((prev) => ({ ...prev, [cellKey]: status }))

    if (onEvaluacion) {
      onEvaluacion(student.id, status, ACTIVIDAD_DEL_DIA)
    }
    
    setSavingId(null)
  }

  const getStudentStatus = (studentId: string): StatusLevel | null => {
    return evaluaciones[studentId] || (localStatus[`${studentId}-cf`] as StatusLevel) || null
  }

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <CardTitle className="text-base font-semibold text-primary">
            Registro del aula
          </CardTitle>
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: "#ecfdf5", color: "#065f46" }}
          >
            {students.length} alumnos
          </span>
        </div>

        {/* Banner de actividad del dia */}
        <div
          className="rounded-xl p-3 flex flex-col gap-2"
          style={{ backgroundColor: "#1e3a5f", color: "#fff" }}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 shrink-0 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Evaluando hoy
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold">
              {ACTIVIDAD_DEL_DIA}
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#fbbf24", color: "#1e3a5f" }}
            >
              Eje: Conciencia Fonologica
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-2">
          {EVAL_OPTIONS.map((opt) => {
            const Icon = opt.icon
            return (
              <div key={opt.value} className="flex items-center gap-1 text-xs text-muted-foreground">
                <Icon className="w-3.5 h-3.5" style={{ color: opt.activeStyle.backgroundColor as string }} />
                {opt.label}
              </div>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10">
            <Spinner className="text-primary" />
            <span className="text-sm text-muted-foreground">Cargando alumnos...</span>
          </div>
        ) : (
          <ul className="space-y-2">
            {students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                currentStatus={getStudentStatus(student.id)}
                saving={savingId === student.id}
                onEval={(status) => handleEval(student, status)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
