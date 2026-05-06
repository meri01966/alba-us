"use client"

import { useState, useEffect, useRef } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

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

const STATUS_COLORS: Record<StatusLevel, string> = {
  green:  "bg-status-green",
  yellow: "bg-status-yellow",
  red:    "bg-status-red",
}

const STATUS_LABELS: Record<StatusLevel, string> = {
  green:  "Logrado",
  yellow: "En proceso",
  red:    "Requiere intervención",
}

const STATUS_OPTIONS: { value: StatusLevel; label: string; color: string }[] = [
  { value: "green",  label: "Logrado",              color: "bg-status-green"  },
  { value: "yellow", label: "En proceso",            color: "bg-status-yellow" },
  { value: "red",    label: "Requiere intervención", color: "bg-status-red"    },
]

const FIELD_MAP: Record<FieldKey, string> = { cf: "CF", rl: "RL", o: "O" }

interface ActiveCell {
  studentId: string
  field: FieldKey
}

function StatusDot({
  status,
  saving,
  isOpen,
  onClick,
}: {
  status: StatusLevel
  saving: boolean
  isOpen: boolean
  onClick: (e: React.MouseEvent) => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      title={STATUS_LABELS[status]}
      aria-label={`Estado: ${STATUS_LABELS[status]}. Clic para cambiar.`}
      className={`
        inline-flex items-center justify-center
        w-7 h-7 rounded-full shrink-0
        ${STATUS_COLORS[status]}
        shadow-sm transition-all duration-150
        hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-primary/40
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
        ${isOpen ? "ring-2 ring-offset-2 ring-primary/60 scale-110" : ""}
      `}
    >
      {saving && (
        <span className="w-3 h-3 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
      )}
    </button>
  )
}

function StatusPopover({
  current,
  onSelect,
}: {
  current: StatusLevel
  onSelect: (s: StatusLevel) => void
}) {
  return (
    <div className="absolute z-30 top-full mt-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl shadow-xl p-1.5 flex flex-col gap-0.5 min-w-[12rem]">
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onMouseDown={(e) => {
            // Use onMouseDown so it fires before the blur that closes the popover
            e.preventDefault()
            onSelect(opt.value)
          }}
          className={`
            flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left w-full
            transition-colors hover:bg-muted
            ${current === opt.value ? "bg-muted font-semibold" : "font-normal"}
          `}
        >
          <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${opt.color}`} />
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function HeatMap() {
  const { data, isLoading } = useSWR<StudentsResponse>("/api/students", fetcher, {
    revalidateOnFocus: false,
  })

  // Local override map: { "studentId-field": StatusLevel }
  const [localStatus, setLocalStatus] = useState<Record<string, StatusLevel>>({})
  const [activeCell, setActiveCell]   = useState<ActiveCell | null>(null)
  const [savingCell, setSavingCell]   = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close popover when clicking outside the table
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

  // Merge server data with local overrides so dots update instantly
  const students: Student[] = rawStudents.map((s) => ({
    ...s,
    cf: (localStatus[`${s.id}-cf`] as StatusLevel) ?? s.cf,
    rl: (localStatus[`${s.id}-rl`] as StatusLevel) ?? s.rl,
    o:  (localStatus[`${s.id}-o`]  as StatusLevel) ?? s.o,
  }))

  async function handleStatusChange(student: Student, field: FieldKey, newStatus: StatusLevel) {
    const cellKey = `${student.id}-${field}`

    // 1. Update local state immediately — dot changes color right away
    setLocalStatus((prev) => ({ ...prev, [cellKey]: newStatus }))
    setActiveCell(null)
    setSavingCell(cellKey)

    // 2. Persist to Airtable in background
    try {
      await fetch("/api/registrar-actividad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          field: FIELD_MAP[field],
          status: newStatus,
        }),
      })
    } catch (err) {
      console.error("[v0] Error guardando en Airtable:", err)
      // Keep the local change — don't revert so the UI stays consistent
    } finally {
      setSavingCell(null)
    }
  }

  return (
    <Card className="shadow-md h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold text-primary">
            Mapa de calor del aula
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
      </CardHeader>

      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10">
            <Spinner className="text-primary" />
            <span className="text-sm text-muted-foreground">Cargando...</span>
          </div>
        ) : students.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Sin registros disponibles
          </p>
        ) : (
          <>
            <div className="overflow-x-auto" ref={containerRef}>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                      Alumno
                    </th>
                    {(["CF", "RL", "O"] as const).map((col) => (
                      <th
                        key={col}
                        className="text-center py-2 px-3 font-medium text-muted-foreground w-16"
                        title={
                          col === "CF" ? "Conciencia Fonológica"
                          : col === "RL" ? "Reconocimiento de Letras"
                          : "Oralidad"
                        }
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, i) => (
                    <tr
                      key={student.id}
                      className={i !== students.length - 1 ? "border-b border-border/40" : ""}
                    >
                      <td className="py-2.5 pr-4 font-medium text-foreground whitespace-nowrap">
                        {student.name}
                      </td>
                      {(["cf", "rl", "o"] as FieldKey[]).map((field) => {
                        const cellKey  = `${student.id}-${field}`
                        const isOpen   = activeCell?.studentId === student.id && activeCell?.field === field
                        const isSaving = savingCell === cellKey
                        return (
                          <td key={field} className="py-2.5 px-3 text-center">
                            <div className="relative flex justify-center">
                              <StatusDot
                                status={student[field]}
                                saving={isSaving}
                                isOpen={isOpen}
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
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
              {STATUS_OPTIONS.map((opt) => (
                <div key={opt.value} className="flex items-center gap-1.5">
                  <span className={`inline-block w-3 h-3 rounded-full ${opt.color}`} />
                  {opt.label}
                </div>
              ))}
              <span className="ml-auto italic">Toca un punto para editar</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
