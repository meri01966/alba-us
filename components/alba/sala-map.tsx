"use client"

import { User } from "lucide-react"

interface Student {
  id: string
  nombre: string
  apellido: string
  mesa?: string
}

interface SalaMapProps {
  students: Student[]
  progress: Record<string, { CF: number; CT: number; O: number }>
  onStudentClick: (id: string) => void
}

function getColor(percent: number): string {
  if (percent >= 70) return "#10b981" // verde
  if (percent >= 40) return "#f59e0b" // amarillo
  return "#ef4444" // rojo
}

function getAverage(p: { CF: number; CT: number; O: number }): number {
  return Math.round((p.CF + p.CT + p.O) / 3)
}

export default function SalaMap({ students, progress, onStudentClick }: SalaMapProps) {
  // Agrupar por mesa
  const mesas: Record<string, Student[]> = {}
  students.forEach((s) => {
    const mesa = s.mesa || "General"
    if (!mesas[mesa]) mesas[mesa] = []
    mesas[mesa].push(s)
  })

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>Mapa de la Sala</h2>
        <p className="text-sm text-gray-500">Toca un alumno para ver su perfil completo</p>
      </div>

      {/* Leyenda */}
      <div className="flex justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#10b981" }} />
          <span>70%+ Avanzado</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f59e0b" }} />
          <span>40-69% En proceso</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#ef4444" }} />
          <span>&lt;40% Refuerzo</span>
        </div>
      </div>

      {/* Mesas */}
      <div className="space-y-6">
        {Object.entries(mesas).map(([mesaNombre, alumnos]) => (
          <div key={mesaNombre}>
            <h3 className="text-sm font-semibold text-gray-600 mb-2">Mesa: {mesaNombre}</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {alumnos.map((student) => {
                const p = progress[student.id] || { CF: 0, CT: 0, O: 0 }
                const avg = getAverage(p)
                const color = getColor(avg)

                return (
                  <button
                    key={student.id}
                    onClick={() => onStudentClick(student.id)}
                    className="flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all hover:scale-105"
                    style={{ borderColor: color, backgroundColor: `${color}10` }}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 truncate w-full text-center">
                      {student.nombre}
                    </span>
                    <span className="text-[10px] font-bold" style={{ color }}>
                      {avg}%
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
