"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
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
  { value: "green",  label: "Logrado",               color: "bg-status-green"  },
  { value: "yellow", label: "En proceso",             color: "bg-status-yellow" },
  { value: "red",    label: "Requiere intervención",  color: "bg-status-red"    },
]

const FIELD_MAP: Record<FieldKey, string> = { cf: "CF", rl: "RL", o: "O" }

interface ActiveCell {
  studentId: string
  field: FieldKey
}

function StatusDot({
  status,
  saving,
  onClick,
}: {
  status: StatusLevel
  saving: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      title={STATUS_LABELS[status]}
      aria-label={`Estado: ${STATUS_LABELS[status]}. Clic para cambiar.`}
      className={`
        inline-flex items-center justify-center
        w-7 h-7 rounded-full
        ${STATUS_COLORS[status]}
        shadow-sm transition-all duration-150
        hover:scale-110 hover:ring-2 hover:ring-offset-2 hover:ring-primary/40
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
        disabled:opacity-50 disabled:cursor-not-allowed
        cursor-pointer
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
  onClose,
}: {
  current: StatusLevel
  onSelect: (s: StatusLevel) => void
  onClose: () => void
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-10"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Popover */}
      <div className="absolute z-20 top-full mt-1.5 left-1/2 -translate-x-1/2 bg-card border border-border rounded-xl shadow-lg p-2 flex flex-col gap-1 min-w-[11rem]">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSelect(opt.value)}
            className={`
              flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left
              transition-colors hover:bg-muted
              ${current === opt.value ? "bg-muted font-semibold" : "font-normal"}
            `}
          >
            <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${opt.color}`} />
            {opt.label}
          </button>
        ))}
      </div>
    </>
  )
}

export function HeatMap() {
  const { data, isLoading } = useSWR<StudentsResponse>("/api/students", fetcher, {
    revalidateOnFocus: false,
  })

  const [activeCell, setActiveCell]   = useState<ActiveCell | null>(null)
  const [savingCell, setSavingCell]   = useState<string | null>(null) // "id-field"

  const students = data?.students ?? []
  const source   = data?.source ?? null

  async function handleStatusChange(student: Student, field: FieldKey, newStatus: StatusLevel) {
    setActiveCell(null)
    const cellKey = `${student.id}-${field}`
    setSavingCell(cellKey)

    // Optimistic update — paint the dot immediately
    mutate(
      "/api/students",
      (current: StudentsResponse | undefined) => {
        if (!current) return current
        return {
          ...current,
          students: current.students.map((s) =>
            s.id === student.id ? { ...s, [field]: newStatus } : s
          ),
        }
      },
      { revalidate: false }
    )

    try {
      const res = await fetch("/api/registrar-actividad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          field: FIELD_MAP[field],
          status: newStatus,
        }),
      })

      if (!res.ok) throw new Error("Error al guardar")

      // Revalidate after save to sync real server state
      mutate("/api/students")
    } catch (err) {
      console.error("[v0] Error guardando estado:", err)
      // Revert to real data on error
      mutate("/api/students")
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
            <div className="overflow-x-auto">
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
                        const cellKey   = `${student.id}-${field}`
                        const isOpen    = activeCell?.studentId === student.id && activeCell?.field === field
                        const isSaving  = savingCell === cellKey
                        return (
                          <td key={field} className="py-2.5 px-3 text-center">
                            <div className="relative flex justify-center">
                              <StatusDot
                                status={student[field]}
                                saving={isSaving}
                                onClick={() =>
                                  setActiveCell(
                                    isOpen ? null : { studentId: student.id, field }
                                  )
                                }
                              />
                              {isOpen && (
                                <StatusPopover
                                  current={student[field]}
                                  onSelect={(newStatus) =>
                                    handleStatusChange(student, field, newStatus)
                                  }
                                  onClose={() => setActiveCell(null)}
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
