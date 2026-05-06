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
  // Agrupar por nivel de progreso
  const grupos: { label: string; color: string; bgLight: string; alumnos: Student[] }[] = [
    { label: "Necesita refuerzo", color: "#ef4444", bgLight: "#fef2f2", alumnos: [] },
    { label: "En proceso",        color: "#f59e0b", bgLight: "#fffbeb", alumnos: [] },
    { label: "Avanzado",          color: "#10b981", bgLight: "#ecfdf5", alumnos: [] },
  ]

  students.forEach((s) => {
    const p = progress[s.id] || { CF: 0, CT: 0, O: 0 }
    const avg = getAverage(p)
    if (avg >= 70) grupos[2].alumnos.push(s)
    else if (avg >= 40) grupos[1].alumnos.push(s)
    else grupos[0].alumnos.push(s)
  })

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>Mapa de Progreso</h2>
        <p className="text-sm text-gray-500">Alumnos agrupados por nivel de avance</p>
      </div>

      {/* Grupos por color */}
      <div className="space-y-4">
        {grupos.map((grupo) => (
          <div
            key={grupo.label}
            className="rounded-2xl p-4"
            style={{ backgroundColor: grupo.bgLight, border: `2px solid ${grupo.color}30` }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: grupo.color }}
              />
              <h3 className="text-sm font-bold" style={{ color: grupo.color }}>
                {grupo.label}
              </h3>
              <span className="text-xs text-gray-500">
                ({grupo.alumnos.length} alumno{grupo.alumnos.length !== 1 ? "s" : ""})
              </span>
            </div>

            {grupo.alumnos.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Sin alumnos en este nivel</p>
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {grupo.alumnos.map((student) => {
                  const p = progress[student.id] || { CF: 0, CT: 0, O: 0 }
                  const avg = getAverage(p)

                  return (
                    <button
                      key={student.id}
                      onClick={() => onStudentClick(student.id)}
                      className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white border-2 transition-all hover:scale-105"
                      style={{ borderColor: grupo.color }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: grupo.color }}
                      >
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-medium text-gray-700 truncate w-full text-center">
                        {student.nombre}
                      </span>
                      <span className="text-[10px] font-bold" style={{ color: grupo.color }}>
                        {avg}%
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
