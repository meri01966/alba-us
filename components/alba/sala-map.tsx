"use client"

import { useState } from "react"

interface Student {
  id: string
  nombre: string
  apellido: string
  mesa?: string
}

type StatusLevel = "green" | "yellow" | "red" | "blue"

interface SalaMapProps {
  students: Student[]
  progress: Record<string, { CF: number | null; CT: number | null; O: number | null }>
  evaluaciones?: Record<string, StatusLevel>
  onStudentClick: (id: string) => void
}

const EJES: { key: "CF" | "CT" | "O"; label: string; short: string }[] = [
  { key: "CF", label: "Conciencia Fonologica", short: "CF" },
  { key: "CT", label: "Comprension de Textos", short: "CT" },
  { key: "O",  label: "Oralidad",              short: "O"  },
]

const NIVELES: {
  key: "rojo" | "amarillo" | "verde" | "sin"
  label: string
  color: string
  bg: string
  border: string
  textColor: string
  range: [number, number] | null
}[] = [
  { key: "rojo",     label: "Apoyo prioritario", color: "#ef4444", bg: "#fef2f2", border: "#fca5a5", textColor: "#b91c1c", range: [0, 39] },
  { key: "amarillo", label: "En proceso",         color: "#f59e0b", bg: "#fffbeb", border: "#fcd34d", textColor: "#92400e", range: [40, 69] },
  { key: "verde",    label: "Logrado",            color: "#10b981", bg: "#ecfdf5", border: "#6ee7b7", textColor: "#065f46", range: [70, 100] },
  { key: "sin",      label: "Sin evaluar",        color: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0", textColor: "#475569", range: null },
]

// Clasifica a un alumno en un nivel para un eje dado
function clasificar(val: number | null | undefined): "rojo" | "amarillo" | "verde" | "sin" {
  if (val === null || val === undefined) return "sin"
  if (val >= 70) return "verde"
  if (val >= 40) return "amarillo"
  return "rojo"
}

// Cuenta alumnos por nivel para mostrar el resumen de la tarjeta de eje
function contarPorNivel(
  students: Student[],
  progress: SalaMapProps["progress"],
  eje: "CF" | "CT" | "O"
): Record<string, number> {
  const counts: Record<string, number> = { rojo: 0, amarillo: 0, verde: 0, sin: 0 }
  students.forEach((s) => {
    const nivel = clasificar(progress[s.id]?.[eje])
    counts[nivel]++
  })
  return counts
}

export default function SalaMap({ students, progress, onStudentClick }: SalaMapProps) {
  const [ejeExpandido, setEjeExpandido] = useState<"CF" | "CT" | "O" | null>(null)

  // Totales generales para el header
  const totalConDatos = students.filter((s) => {
    const p = progress[s.id]
    return p && [p.CF, p.CT, p.O].some((v) => v !== null)
  }).length

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold" style={{ color: "#1e3a5f" }}>
          Mapa de Progreso del Grupo
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          {totalConDatos} de {students.length} alumnos con historial registrado &middot; Promedio acumulado por eje
        </p>
      </div>

      {/* Una tarjeta por eje */}
      {EJES.map(({ key, label }) => {
        const counts = contarPorNivel(students, progress, key)
        const expanded = ejeExpandido === key

        // Alumnos ordenados por valor del eje: rojos primero, luego amarillo, luego verde, luego sin datos
        const alumnosOrdenados = [...students].sort((a, b) => {
          const orden = { rojo: 0, amarillo: 1, verde: 2, sin: 3 }
          const nivelA = clasificar(progress[a.id]?.[key])
          const nivelB = clasificar(progress[b.id]?.[key])
          if (nivelA !== nivelB) return orden[nivelA] - orden[nivelB]
          // Dentro del mismo nivel, ordenar por valor ascendente (el mas bajo primero)
          const valA = progress[a.id]?.[key] ?? -1
          const valB = progress[b.id]?.[key] ?? -1
          return valA - valB
        })

        return (
          <div
            key={key}
            className="rounded-2xl overflow-hidden"
            style={{ border: "1.5px solid #e2e8f0" }}
          >
            {/* Cabecera de la tarjeta de eje */}
            <button
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
              style={{ backgroundColor: "#f8fafc" }}
              onClick={() => setEjeExpandido(expanded ? null : key)}
              type="button"
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: "#1e3a5f" }}
                >
                  {key}
                </span>
                <span className="text-sm font-semibold text-slate-700">{label}</span>
              </div>

              {/* Pills de conteo: rojo | amarillo | verde */}
              <div className="flex items-center gap-1.5">
                {NIVELES.filter((n) => n.key !== "sin").map((n) => (
                  <span
                    key={n.key}
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: n.bg, color: n.textColor, border: `1px solid ${n.border}` }}
                  >
                    {counts[n.key]}
                  </span>
                ))}
                {counts.sin > 0 && (
                  <span className="text-xs text-slate-400 ml-1">{counts.sin} sin datos</span>
                )}
                <span className="text-slate-400 text-xs ml-1">{expanded ? "▲" : "▼"}</span>
              </div>
            </button>

            {/* Cuerpo expandible: 3 columnas semaforo */}
            {expanded && (
              <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white">
                {NIVELES.filter((n) => n.key !== "sin").map((nivel) => {
                  const alumnosDeNivel = alumnosOrdenados.filter(
                    (s) => clasificar(progress[s.id]?.[key]) === nivel.key
                  )
                  return (
                    <div key={nivel.key} className="p-3">
                      {/* Header columna */}
                      <div
                        className="text-center text-xs font-bold py-1 px-2 rounded-lg mb-2"
                        style={{ backgroundColor: nivel.bg, color: nivel.textColor }}
                      >
                        {nivel.label}
                        <span className="ml-1 opacity-60">({alumnosDeNivel.length})</span>
                      </div>

                      {/* Etiquetas de alumnos */}
                      <div className="flex flex-col gap-1.5">
                        {alumnosDeNivel.length === 0 ? (
                          <p className="text-xs text-slate-300 text-center py-2">—</p>
                        ) : (
                          alumnosDeNivel.map((s) => {
                            const val = progress[s.id]?.[key]
                            return (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => onStudentClick(s.id)}
                                className="text-left w-full rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:scale-[1.02] hover:shadow-sm flex items-center justify-between"
                                style={{
                                  backgroundColor: nivel.bg,
                                  color: nivel.textColor,
                                  border: `1px solid ${nivel.border}`,
                                }}
                              >
                                <span className="truncate">{s.nombre}</span>
                                {val !== null && val !== undefined && (
                                  <span className="ml-1 opacity-60 shrink-0 font-normal">{val}%</span>
                                )}
                              </button>
                            )
                          })
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Vista colapsada: barra de densidad visual */}
            {!expanded && (
              <div className="px-4 pb-3 bg-white">
                <div className="flex rounded-full overflow-hidden h-2 mt-1">
                  {NIVELES.filter((n) => n.key !== "sin").map((n) => {
                    const pct = students.length > 0 ? (counts[n.key] / students.length) * 100 : 0
                    return pct > 0 ? (
                      <div
                        key={n.key}
                        style={{ width: `${pct}%`, backgroundColor: n.color }}
                        title={`${n.label}: ${counts[n.key]}`}
                      />
                    ) : null
                  })}
                  {counts.sin > 0 && (
                    <div
                      style={{ width: `${(counts.sin / students.length) * 100}%`, backgroundColor: "#e2e8f0" }}
                      title={`Sin evaluar: ${counts.sin}`}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-4 pt-1">
        {NIVELES.filter((n) => n.key !== "sin").map((n) => (
          <div key={n.key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: n.color }} />
            <span className="text-xs text-slate-500">{n.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
