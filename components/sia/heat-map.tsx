"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

type StatusLevel = "green" | "yellow" | "red"

interface Student {
  id: string
  name: string
  cf: StatusLevel // Conciencia Fonológica
  rl: StatusLevel // Reconocimiento de Letras
  o: StatusLevel  // Oralidad
}

function StatusIndicator({ status }: { status: StatusLevel }) {
  const colors = {
    green: "bg-status-green",
    yellow: "bg-status-yellow",
    red: "bg-status-red",
  }

  return (
    <div
      className={`w-4 h-4 rounded-full ${colors[status]} shadow-sm`}
      aria-label={status === "green" ? "Logrado" : status === "yellow" ? "En proceso" : "Requiere intervención"}
    />
  )
}

export function HeatMap() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStudents() {
      try {
        const response = await fetch("/api/students")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Error al cargar alumnos")
        }

        setStudents(data.students)
      } catch (err) {
        console.error("[v0] Error fetching students:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
          Mapa de calor del aula
          <span className="text-xs font-normal text-muted-foreground">
            (Airtable)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="text-primary" />
            <span className="ml-2 text-sm text-muted-foreground">Cargando alumnos...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-destructive">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-primary underline hover:no-underline"
            >
              Reintentar
            </button>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No hay alumnos registrados</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-3 font-medium text-muted-foreground">Alumno</th>
                    <th className="text-center py-2 px-2 font-medium text-muted-foreground" title="Conciencia Fonológica">CF</th>
                    <th className="text-center py-2 px-2 font-medium text-muted-foreground" title="Reconocimiento de Letras">RL</th>
                    <th className="text-center py-2 px-2 font-medium text-muted-foreground" title="Oralidad">O</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => (
                    <tr 
                      key={student.id} 
                      className={index !== students.length - 1 ? "border-b border-border/50" : ""}
                    >
                      <td className="py-2.5 pr-3 font-medium text-foreground">{student.name}</td>
                      <td className="py-2.5 px-2">
                        <div className="flex justify-center">
                          <StatusIndicator status={student.cf} />
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex justify-center">
                          <StatusIndicator status={student.rl} />
                        </div>
                      </td>
                      <td className="py-2.5 px-2">
                        <div className="flex justify-center">
                          <StatusIndicator status={student.o} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-status-green" />
                <span>Logrado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-status-yellow" />
                <span>En proceso</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-status-red" />
                <span>Requiere intervención</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
