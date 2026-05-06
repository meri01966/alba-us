"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

type StatusLevel = "green" | "yellow" | "red"

interface Student {
  id: string
  name: string
  cf: StatusLevel
  rl: StatusLevel
  o: StatusLevel
}

function StatusDot({ status }: { status: StatusLevel }) {
  const styles: Record<StatusLevel, string> = {
    green:  "bg-status-green",
    yellow: "bg-status-yellow",
    red:    "bg-status-red",
  }
  const labels: Record<StatusLevel, string> = {
    green:  "Logrado",
    yellow: "En proceso",
    red:    "Requiere intervención",
  }
  return (
    <span
      className={`inline-block w-4 h-4 rounded-full ${styles[status]} shadow-sm`}
      aria-label={labels[status]}
      title={labels[status]}
    />
  )
}

export function HeatMap() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading]   = useState(true)
  const [source, setSource]     = useState<string | null>(null)

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res  = await fetch("/api/students")
        const data = await res.json()
        setStudents(data.students || [])
        setSource(data.source || null)
      } catch {
        // Silent fail — UI never blocks
        setStudents([])
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [])

  return (
    <Card className="shadow-md h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold text-primary">
            Mapa de calor del aula
          </CardTitle>
          {!loading && source && (
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
        {loading ? (
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
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Alumno</th>
                    <th className="text-center py-2 px-2 font-medium text-muted-foreground" title="Conciencia Fonológica">CF</th>
                    <th className="text-center py-2 px-2 font-medium text-muted-foreground" title="Reconocimiento de Letras">RL</th>
                    <th className="text-center py-2 px-2 font-medium text-muted-foreground" title="Oralidad">O</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, i) => (
                    <tr
                      key={student.id}
                      className={i !== students.length - 1 ? "border-b border-border/40" : ""}
                    >
                      <td className="py-2.5 pr-4 font-medium text-foreground">{student.name}</td>
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex justify-center"><StatusDot status={student.cf} /></div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex justify-center"><StatusDot status={student.rl} /></div>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <div className="flex justify-center"><StatusDot status={student.o} /></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-status-green" />
                Logrado
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-status-yellow" />
                En proceso
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-status-red" />
                Requiere intervención
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
