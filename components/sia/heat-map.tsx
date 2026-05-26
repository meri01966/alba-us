"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { CheckCircle2, Clock, AlertCircle, BookOpen, RotateCcw, UserX } from "lucide-react"

type StatusLevel = "green" | "yellow" | "red" | "blue"

interface Student {
  id: string
  name?: string
  nombre?: string
}

export interface RegistroCierre {
  actividadALBA: string
  actividadDocente: string
  eje: string
  sala: string
  evaluacionGeneral: "excelente" | "buena" | "regular" | "necesita_mejora"
  observaciones: string
  sugerenciaParaIA: string
  stats: { green: number; yellow: number; red: number; blue: number }
}

const EJE_COLORS: Record<string, { color: string; bgColor: string; nombre: string }> = {
  CF: { color: "#3b82f6", bgColor: "#eff6ff", nombre: "Conciencia Fonologica" },
  CT: { color: "#10b981", bgColor: "#ecfdf5", nombre: "Comprension de Textos" },
  O:  { color: "#f59e0b", bgColor: "#fffbeb", nombre: "Oralidad" },
}

interface HeatMapProps {
  students: Student[]
  evaluaciones?: Record<string, StatusLevel>
  onEvaluacion?: (studentId: string, status: StatusLevel, actividad: string, eje: string) => void
  onClearEvaluacion?: (studentId: string) => void
  onClearAllEvaluaciones?: () => void
  onRegistroCierre?: (registro: RegistroCierre) => void
  actividadSugeridaALBA?: string
  ejeDeALBA?: string
  sala?: string
  isLoading?: boolean
}

const EVAL_OPTIONS: {
  value: StatusLevel
  label: string
  icon: React.ElementType
  activeStyle: React.CSSProperties
  inactiveStyle: React.CSSProperties
}[] = [
  {
    value: "yellow",
    label: "En proceso",
    icon: Clock,
    activeStyle:   { backgroundColor: "#fbbf24", color: "#fff", borderColor: "#fbbf24" },
    inactiveStyle: { backgroundColor: "#fef3c7", color: "#d97706", borderColor: "#fcd34d" },
  },
  {
    value: "red",
    label: "Refuerzo",
    icon: AlertCircle,
    activeStyle:   { backgroundColor: "#ef4444", color: "#fff", borderColor: "#ef4444" },
    inactiveStyle: { backgroundColor: "#fee2e2", color: "#ef4444", borderColor: "#fca5a5" },
  },
  {
    value: "blue",
    label: "Ausente",
    icon: UserX,
    activeStyle:   { backgroundColor: "#6366f1", color: "#fff", borderColor: "#6366f1" },
    inactiveStyle: { backgroundColor: "#e0e7ff", color: "#6366f1", borderColor: "#a5b4fc" },
  },
]

function getStatusColor(status: StatusLevel | null): string {
  if (status === "blue")   return "#6366f1"
  if (status === "green")  return "#10b981"
  if (status === "yellow") return "#fbbf24"
  if (status === "red")    return "#ef4444"
  return "#94a3b8" // gris: sin evaluar
}

function getStatusBg(status: StatusLevel | null): string {
  if (status === "blue")   return "#e0e7ff"
  if (status === "green")  return "#ecfdf5"
  if (status === "yellow") return "#fef3c7"
  if (status === "red")    return "#fef2f2"
  return "#f8fafc" // gris claro: sin evaluar
}

function StudentRow({
  student,
  currentStatus,
  saving,
  onMark,
  onClear,
}: {
  student: Student
  currentStatus: StatusLevel | null
  saving: boolean
  onMark: (status: StatusLevel) => void
  onClear: () => void
}) {
  const studentName = student.name || student.nombre || "Sin nombre"
  const statusColor = getStatusColor(currentStatus)
  const statusBg    = getStatusBg(currentStatus)

  return (
    <li
      className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
      style={{ backgroundColor: statusBg, border: `2px solid ${statusColor}40` }}
    >
      <div
        className="w-3 h-3 rounded-full shrink-0 transition-all"
        style={{ backgroundColor: statusColor }}
      />
      <span className="text-sm font-medium text-foreground flex-1 truncate">{studentName}</span>

      {currentStatus && currentStatus !== "green" && (
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full mr-1"
          style={{ backgroundColor: statusColor, color: "#fff" }}
        >
          {currentStatus === "yellow" ? "En proceso" : currentStatus === "red" ? "Refuerzo" : "Ausente"}
        </span>
      )}

      <div className="flex items-center gap-1 shrink-0">
        {EVAL_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isChosen = currentStatus === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onMark(opt.value)}
              disabled={saving}
              title={opt.label}
              style={isChosen ? opt.activeStyle : opt.inactiveStyle}
              className="flex items-center justify-center w-7 h-7 rounded-lg border transition-all hover:scale-110 disabled:opacity-50"
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          )
        })}
        {currentStatus && (
          <button
            onClick={onClear}
            disabled={saving}
            title="Quitar marca"
            className="flex items-center justify-center w-7 h-7 rounded-lg border border-green-300 bg-green-50 hover:bg-green-100 text-green-600 transition-all hover:scale-110 disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        )}
        {saving && <Spinner className="w-4 h-4 text-primary" />}
      </div>
    </li>
  )
}

export function HeatMap({
  students = [],
  evaluaciones = {},
  onEvaluacion,
  onClearEvaluacion,
  onClearAllEvaluaciones,
  actividadSugeridaALBA = "",
  ejeDeALBA = "CF",
  isLoading = false,
}: HeatMapProps) {
  const [savingId, setSavingId] = useState<string | null>(null)

  const actividadDelDia = actividadSugeridaALBA || "Cargando sugerencia..."

  const stats = {
    sinEvaluar: students.filter(s => !evaluaciones[s.id]).length,
    green:  students.filter(s => evaluaciones[s.id] === "green").length,
    yellow: students.filter(s => evaluaciones[s.id] === "yellow").length,
    red:    students.filter(s => evaluaciones[s.id] === "red").length,
    blue:   students.filter(s => evaluaciones[s.id] === "blue").length,
  }

  const marcadosCount = students.filter(s => !!evaluaciones[s.id]).length

  if (!isLoading && students.length === 0) return null

  async function handleMark(student: Student, status: StatusLevel) {
    setSavingId(student.id)
    onEvaluacion?.(student.id, status, actividadDelDia, ejeDeALBA)
    setSavingId(null)
  }

  function handleClear(studentId: string) {
    onClearEvaluacion?.(studentId)
  }

  function handleClearAll() {
    if (confirm("Volver a todos los alumnos a Sin evaluar. Continuar?")) {
      onClearAllEvaluaciones?.()
    }
  }

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="pb-2">
        {/* Titulo y contadores */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <CardTitle className="text-base font-semibold text-primary">Registro del aula</CardTitle>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {marcadosCount > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500"
                title="Reiniciar todo"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
            {stats.green > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                {stats.green} logrado
              </span>
            )}
            {stats.yellow > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">
                {stats.yellow}
              </span>
            )}
            {stats.red > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                {stats.red}
              </span>
            )}
            {stats.blue > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700">
                {stats.blue} aus.
              </span>
            )}
          </div>
        </div>

        {/* Banner actividad ALBA */}
        <div
          className="rounded-xl p-3 flex flex-col gap-1"
          style={{ backgroundColor: EJE_COLORS[ejeDeALBA]?.color || "#1e3a5f", color: "#fff" }}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-white/80 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/70">Actividad de hoy</span>
          </div>
          <span className="text-sm font-bold leading-snug">{actividadDelDia}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 self-start font-semibold">
            {EJE_COLORS[ejeDeALBA]?.nombre || ejeDeALBA}
          </span>
        </div>

        {/* Instruccion */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mt-2">
          <p className="text-xs text-slate-600">
            Marca solo los que estan en proceso, refuerzo o ausentes. Al finalizar la jornada, los sin marcar quedan como logrado.
          </p>
        </div>

        {/* Leyenda */}
        <div className="flex gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
          {EVAL_OPTIONS.map((opt) => {
            const Icon = opt.icon
            return (
              <div key={opt.value} className="flex items-center gap-1">
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
          <ul className="space-y-1.5">
            {students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                currentStatus={evaluaciones[student.id] || null}
                saving={savingId === student.id}
                onMark={(status) => handleMark(student, status)}
                onClear={() => handleClear(student.id)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
