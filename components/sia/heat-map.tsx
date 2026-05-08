"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, Clock, AlertCircle, BookOpen, X, RotateCcw } from "lucide-react"

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
  onClearEvaluacion?: (studentId: string) => void
  onClearAllEvaluaciones?: () => void
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

// Obtener color del estado
function getStatusColor(status: StatusLevel | null): string {
  if (status === "green") return "#10b981"
  if (status === "yellow") return "#fbbf24"
  if (status === "red") return "#ef4444"
  return "#94a3b8" // gris para sin evaluar
}

function getStatusBg(status: StatusLevel | null): string {
  if (status === "green") return "#ecfdf5"
  if (status === "yellow") return "#fef3c7"
  if (status === "red") return "#fef2f2"
  return "#f1f5f9" // gris claro para sin evaluar
}

function StudentRow({
  student,
  currentStatus,
  saving,
  onEval,
  onClear,
}: {
  student: Student
  currentStatus: StatusLevel | null
  saving: boolean
  onEval: (status: StatusLevel) => void
  onClear?: () => void
}) {
  const studentName = student.name || student.nombre || "Sin nombre"
  const statusColor = getStatusColor(currentStatus)
  const statusBg = getStatusBg(currentStatus)
  
  return (
    <li 
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors"
      style={{ 
        backgroundColor: statusBg,
        border: `2px solid ${statusColor}40`
      }}
    >
      {/* Indicador de estado */}
      <div 
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: statusColor }}
        title={currentStatus ? `Estado: ${currentStatus}` : "Sin evaluar"}
      />
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
        {/* Boton para quitar evaluacion */}
        {currentStatus && onClear && (
          <button
            onClick={onClear}
            disabled={saving}
            title="Quitar evaluacion"
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all hover:scale-110 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {saving && <Spinner className="w-4 h-4 text-primary" />}
      </div>
    </li>
  )
}

export function HeatMap({ students = [], evaluaciones = {}, onEvaluacion, onClearEvaluacion, onClearAllEvaluaciones, isLoading = false }: HeatMapProps) {
  const [savingId, setSavingId] = useState<string | null>(null)

  // Si no hay estudiantes y no esta cargando, retornar null
  if (!isLoading && (!students || students.length === 0)) {
    return null
  }

  async function handleEval(student: Student, status: StatusLevel) {
    setSavingId(student.id)

    if (onEvaluacion) {
      onEvaluacion(student.id, status, ACTIVIDAD_DEL_DIA)
    }
    
    setSavingId(null)
  }

  function handleClear(studentId: string) {
    if (onClearEvaluacion) {
      onClearEvaluacion(studentId)
    }
  }

  function handleClearAll() {
    if (confirm("Estas seguro de borrar todas las evaluaciones de hoy?")) {
      if (onClearAllEvaluaciones) {
        onClearAllEvaluaciones()
      }
    }
  }

  const getStudentStatus = (studentId: string): StatusLevel | null => {
    return evaluaciones[studentId] || null
  }
  
  const evaluadosCount = students.filter(s => getStudentStatus(s.id) !== null).length

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <CardTitle className="text-base font-semibold text-primary">
            Registro del aula
          </CardTitle>
          <div className="flex items-center gap-2">
            {evaluadosCount > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
                title="Borrar todas las evaluaciones"
              >
                <RotateCcw className="w-3 h-3" />
                Limpiar
              </button>
            )}
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: "#ecfdf5", color: "#065f46" }}
            >
              {evaluadosCount}/{students.length}
            </span>
          </div>
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
                onClear={() => handleClear(student.id)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
