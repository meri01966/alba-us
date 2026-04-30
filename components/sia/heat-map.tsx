"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type StatusLevel = "green" | "yellow" | "red"

interface Student {
  name: string
  cf: StatusLevel // Conciencia Fonológica
  rl: StatusLevel // Reconocimiento de Letras
  o: StatusLevel  // Oralidad
}

const students: Student[] = [
  { name: "Santi", cf: "red", rl: "yellow", o: "green" },
  { name: "Valen", cf: "green", rl: "green", o: "green" },
  { name: "Mora", cf: "yellow", rl: "green", o: "yellow" },
  { name: "Benja", cf: "green", rl: "yellow", o: "green" },
  { name: "Juana", cf: "green", rl: "green", o: "green" },
  { name: "Tomi", cf: "yellow", rl: "red", o: "yellow" },
  { name: "Emma", cf: "green", rl: "green", o: "green" },
  { name: "Fran", cf: "red", rl: "yellow", o: "green" },
]

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
  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary">
          Mapa de calor del aula
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
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
                  key={student.name} 
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
      </CardContent>
    </Card>
  )
}
