"use client"

import { useState } from "react"
import useSWR from "swr"
import { Spinner } from "@/components/ui/spinner"
import { BookOpen, ChevronDown } from "lucide-react"

type StatusLevel = "green" | "yellow" | "red"
type FieldKey = "cf" | "rl"

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

const EJES: { key: FieldKey; label: string; short: string }[] = [
  { key: "cf", label: "Conciencia Fonologica", short: "CF" },
  { key: "rl", label: "Reconocimiento de Letras", short: "RL" },
]

const COLOR_CONFIG = {
  green:  { bg: "#10b981", light: "#d1fae5", text: "#065f46" },
  yellow: { bg: "#f59e0b", light: "#fef3c7", text: "#92400e" },
  red:    { bg: "#ef4444", light: "#fee2e2", text: "#991b1b" },
}

// Boton circular grande tactil con animacion
function ColorButton({
  color,
  isActive,
  onClick,
  disabled,
}: {
  color: StatusLevel
  isActive: boolean
  onClick: () => void
  disabled: boolean
}) {
  const cfg = COLOR_CONFIG[color]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center rounded-full border-2 transition-all duration-150 active:scale-95 hover:scale-110 disabled:opacity-50"
      style={{
        width: 44,
        height: 44,
        backgroundColor: isActive ? cfg.bg : cfg.light,
        borderColor: cfg.bg,
        boxShadow: isActive ? `0 0 0 3px ${cfg.bg}33` : "none",
      }}
      aria-label={color === "green" ? "Logrado" : color === "yellow" ? "En proceso" : "Refuerzo"}
    />
  )
}

// Fila ultra-delgada: nombre + 3 botones circulares
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
    <li
      className="flex items-center justify-between px-4 py-2 bg-white rounded-2xl"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <span className="text-sm font-medium text-slate-700 truncate pr-3">
        {student.name}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        {(["red", "yellow", "green"] as StatusLevel[]).map((color) => (
          <ColorButton
            key={color}
            color={color}
            isActive={currentStatus === color}
            onClick={() => onEval(color)}
            disabled={saving}
          />
        ))}
        {saving && <Spinner className="w-4 h-4 ml-1" />}
      </div>
    </li>
  )
}

// Barra apilada de Oralidad (3 colores, nunca llena al 100%)
function OralidadStackedBar({ student }: { student: Student }) {
  // Simula progreso incremental en cada color — nunca suma 100%
  const redPct = 25
  const yellowPct = 35
  const greenPct = 30
  // Total ~90% maximo, representando que oralidad siempre esta en desarrollo

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-6 shrink-0">O</span>
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
        <div style={{ width: `${redPct}%`, backgroundColor: COLOR_CONFIG.red.bg }} />
        <div style={{ width: `${yellowPct}%`, backgroundColor: COLOR_CONFIG.yellow.bg }} />
        <div style={{ width: `${greenPct}%`, backgroundColor: COLOR_CONFIG.green.bg }} />
      </div>
    </div>
  )
}

// Mini grilla de calor por alumno
function HeatGrid({ students }: { students: Student[] }) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 mt-4">
      {students.map((s) => {
        // Promedio simple para color de celda
        const vals = { green: 3, yellow: 2, red: 1 }
        const avg = (vals[s.cf] + vals[s.rl] + vals[s.o]) / 3
        const cellColor = avg >= 2.5 ? COLOR_CONFIG.green.bg : avg >= 1.8 ? COLOR_CONFIG.yellow.bg : COLOR_CONFIG.red.bg

        return (
          <div
            key={s.id}
            title={s.name}
            className="aspect-square rounded-xl flex items-center justify-center text-[10px] text-white font-bold cursor-default transition-transform hover:scale-105"
            style={{ backgroundColor: cellColor }}
          >
            {s.name.slice(0, 2).toUpperCase()}
          </div>
        )
      })}
    </div>
  )
}

// Componente principal
export function HeatMap() {
  const { data, isLoading, mutate } = useSWR<StudentsResponse>("/api/students", fetcher, {
    revalidateOnFocus: false,
  })

  const [ejeDia, setEjeDia] = useState<FieldKey>("rl")
  const [localStatus, setLocalStatus] = useState<Record<string, StatusLevel>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [showEjeSelector, setShowEjeSelector] = useState(false)

  const rawStudents = data?.students ?? []
  const source = data?.source ?? null

  // Merge con estado local
  const students: Student[] = rawStudents.map((s) => ({
    ...s,
    cf: (localStatus[`${s.id}-cf`] as StatusLevel) ?? s.cf,
    rl: (localStatus[`${s.id}-rl`] as StatusLevel) ?? s.rl,
    o: (localStatus[`${s.id}-o`] as StatusLevel) ?? s.o,
  }))

  async function handleEval(student: Student, status: StatusLevel) {
    const cellKey = `${student.id}-${ejeDia}`
    setSavingId(student.id)
    setLocalStatus((prev) => ({ ...prev, [cellKey]: status }))

    try {
      await fetch("/api/registrar-actividad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.id, field: ejeDia.toUpperCase(), status }),
      })
      mutate()
    } catch {
      // mantiene estado local
    } finally {
      setSavingId(null)
    }
  }

  const ejeActual = EJES.find((e) => e.key === ejeDia)!

  return (
    <div
      className="rounded-3xl p-4 h-full flex flex-col"
      style={{ backgroundColor: "#F8FAFC", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-slate-800">Evaluacion del aula</h2>
        {!isLoading && source && (
          <span
            className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: source === "airtable" ? "#d1fae5" : "#f1f5f9",
              color: source === "airtable" ? "#065f46" : "#64748b",
            }}
          >
            {source === "airtable" ? "Airtable" : "Demo"}
          </span>
        )}
      </div>

      {/* Selector de eje */}
      <div className="relative mb-3">
        <button
          onClick={() => setShowEjeSelector(!showEjeSelector)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700"
          style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.03)" }}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Evaluando: <strong>{ejeActual.label}</strong></span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showEjeSelector ? "rotate-180" : ""}`} />
        </button>

        {showEjeSelector && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
            {EJES.map((eje) => (
              <button
                key={eje.key}
                onClick={() => { setEjeDia(eje.key); setShowEjeSelector(false) }}
                className={`w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 transition-colors ${ejeDia === eje.key ? "bg-slate-100 font-semibold" : "hover:bg-slate-50"}`}
              >
                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: "#1e3a5f" }}>
                  {eje.short}
                </span>
                {eje.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_CONFIG.red.bg }} />
          Refuerzo
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_CONFIG.yellow.bg }} />
          En proceso
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_CONFIG.green.bg }} />
          Logrado
        </div>
      </div>

      {/* Lista de alumnos */}
      <div className="flex-1 overflow-y-auto -mx-1 px-1">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10">
            <Spinner className="text-slate-400" />
            <span className="text-sm text-slate-500">Cargando...</span>
          </div>
        ) : students.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-10">Sin alumnos</p>
        ) : (
          <ul className="space-y-1.5">
            {students.map((student) => {
              const currentStatus = (localStatus[`${student.id}-${ejeDia}`] as StatusLevel) ?? student[ejeDia]
              return (
                <StudentRow
                  key={student.id}
                  student={student}
                  currentStatus={currentStatus}
                  saving={savingId === student.id}
                  onEval={(status) => handleEval(student, status)}
                />
              )
            })}
          </ul>
        )}
      </div>

      {/* Mapa de calor mini */}
      {!isLoading && students.length > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200">
          <p className="text-xs font-medium text-slate-600 mb-2">Mapa de calor</p>
          <HeatGrid students={students} />
        </div>
      )}
    </div>
  )
}
