"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, Clock, AlertCircle, BookOpen } from "lucide-react"

type StatusLevel = "green" | "yellow" | "red"

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

interface HeatMapProps {
  evaluaciones?: Record<string, StatusLevel>
  onEvaluacion?: (studentId: string, status: StatusLevel, actividad: string) => void
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Actividad del dia (mapea a CF segun las reglas)
const ACTIVIDAD_DEL_DIA = "Reconocimiento de Letras"

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
  return (
    <li className="flex items-center gap-3 px-3 py-2.5 border border-border rounded-xl bg-card">
      <span className="text-sm font-semibold text-foreground flex-1 truncate">
        {student.name}
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
              className="flex items-center justify-center w-9 h-9 rounded-lg border transition-all hover:scale-110 disabled:opacity-50"
            >
              <Icon className="w-4.5 h-4.5" />
            </button>
          )
        })}
        {saving && <Spinner className="w-4 h-4 text-primary" />}
      </div>
    </li>
  )
}

export function HeatMap({ evaluaciones = {}, onEvaluacion }: HeatMapProps) {
  const { data, isLoading } = useSWR<StudentsResponse>("/api/students", fetcher, {
    revalidateOnFocus: false,
  })

  const [localStatus, setLocalStatus] = useState<Record<string, StatusLevel>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const rawStudents = data?.students ?? []
  const source = data?.source ?? null

  const students: Student[] = rawStudents.map((s) => ({
    ...s,
    cf: (localStatus[`${s.id}-cf`] as StatusLevel) ?? s.cf,
    rl: (localStatus[`${s.id}-rl`] as StatusLevel) ?? s.rl,
    o: (localStatus[`${s.id}-o`] as StatusLevel) ?? s.o,
  }))

  async function handleEval(student: Student, status: StatusLevel) {
    // Actualizar estado local inmediatamente (optimistic UI)
    const cellKey = `${student.id}-cf` // CF porque "Reconocimiento de Letras" mapea a CF
    setSavingId(student.id)
    setLocalStatus((prev) => ({ ...prev, [cellKey]: status }))

    // Notificar al padre para sincronizar con el Mapa de Sala
    if (onEvaluacion) {
      onEvaluacion(student.id, status, ACTIVIDAD_DEL_DIA)
    } else {
      // Fallback: guardar directamente si no hay callback
      try {
        await fetch("/api/registrar-actividad", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            studentId: student.id, 
            field: "CF", // Reconocimiento de Letras -> CF
            status,
            actividad: ACTIVIDAD_DEL_DIA
          }),
        })
      } catch {
        // mantiene estado local
      }
    }
    
    setSavingId(null)
  }

  // Combinar evaluaciones del padre con estado local
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
          {!isLoading && source && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: source === "airtable" ? "#ecfdf5" : "#f3f4f6",
                color: source === "airtable" ? "#065f46" : "#6b7280",
              }}
            >
              {source === "airtable" ? "Airtable" : "Demo"}
            </span>
          )}
        </div>

        <div
          className="rounded-xl p-2.5 flex items-center gap-1.5"
          style={{ backgroundColor: "#1e3a5f08", border: "1.5px solid #1e3a5f22" }}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: "#1e3a5f" }} />
          <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#1e3a5f" }}>
            Evaluando hoy:
          </span>
          <span
            className="ml-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "#1e3a5f", color: "#fff" }}
          >
            {ACTIVIDAD_DEL_DIA}
          </span>
          <span
            className="ml-1 text-[10px] px-1.5 py-0.5 rounded"
            style={{ backgroundColor: "#10b98120", color: "#10b981" }}
          >
            → CF
          </span>
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
        ) : students.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">Sin registros disponibles</p>
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
