"use client"

interface Student {
  id: string
  nombre: string
  apellido: string
}

type StatusLevel = "green" | "yellow" | "red" | "blue"

interface SalaMapProps {
  students: Student[]
  progress: Record<string, { CF: number | null; CT: number | null; O: number | null }>
  evaluaciones?: Record<string, StatusLevel>
  onStudentClick: (id: string) => void
}

const EJES: { key: "CF" | "CT" | "O"; label: string; color: string }[] = [
  { key: "CF", label: "Conciencia Fonologica", color: "#1d4ed8" },
  { key: "CT", label: "Comprension de Textos", color: "#059669" },
  { key: "O",  label: "Oralidad",              color: "#d97706" },
]

// Zonas de color de arriba hacia abajo: verde, amarillo, rojo, azul (sin datos)
const ZONAS = [
  {
    key: "verde",
    label: "Logrado",
    bg: "#dcfce7",
    border: "#86efac",
    text: "#166534",
    dot: "#16a34a",
    min: 70,
    max: 100,
  },
  {
    key: "amarillo",
    label: "En proceso",
    bg: "#fef9c3",
    border: "#fde047",
    text: "#854d0e",
    dot: "#ca8a04",
    min: 40,
    max: 69,
  },
  {
    key: "rojo",
    label: "Apoyo",
    bg: "#fee2e2",
    border: "#fca5a5",
    text: "#991b1b",
    dot: "#dc2626",
    min: 0,
    max: 39,
  },
  {
    key: "sin",
    label: "Sin iniciar",
    bg: "#eff6ff",
    border: "#bfdbfe",
    text: "#1e40af",
    dot: "#60a5fa",
    min: null,
    max: null,
  },
]

function clasificar(val: number | null | undefined): string {
  if (val === null || val === undefined) return "sin"
  if (val >= 70) return "verde"
  if (val >= 40) return "amarillo"
  return "rojo"
}

export default function SalaMap({ students, progress, onStudentClick }: SalaMapProps) {
  return (
    <div className="p-3 h-full flex flex-col gap-3">
      {/* Titulo */}
      <div>
        <h2 className="text-sm font-bold" style={{ color: "#1e3a5f" }}>
          Mapa de Progreso
        </h2>
        <p className="text-xs text-slate-400">
          Promedio acumulado por eje — clase a clase
        </p>
      </div>

      {/* 3 torres en fila */}
      <div className="flex gap-2 flex-1 min-h-0">
        {EJES.map(({ key, label, color }) => {
          // Clasificar y ordenar alumnos para esta torre
          const porZona: Record<string, { s: Student; val: number | null }[]> = {
            verde: [], amarillo: [], rojo: [], sin: [],
          }

          students.forEach((s) => {
            const val = progress[s.id]?.[key] ?? null
            const zona = clasificar(val)
            porZona[zona].push({ s, val })
          })

          // Dentro de cada zona: ordenar de mayor a menor (los mejores arriba)
          Object.keys(porZona).forEach((z) => {
            porZona[z].sort((a, b) => (b.val ?? -1) - (a.val ?? -1))
          })

          const total = students.length
          const nVerde    = porZona.verde.length
          const nAmarillo = porZona.amarillo.length
          const nRojo     = porZona.rojo.length
          const nSin      = porZona.sin.length

          return (
            <div
              key={key}
              className="flex-1 flex flex-col rounded-xl overflow-hidden"
              style={{ border: `1.5px solid ${color}30` }}
            >
              {/* Header de la torre */}
              <div
                className="px-2 py-2 text-center"
                style={{ backgroundColor: color, color: "#fff" }}
              >
                <p className="text-xs font-bold leading-tight">{key}</p>
                <p className="text-[10px] leading-tight opacity-80 mt-0.5 hidden sm:block">{label}</p>
              </div>

              {/* Barra de densidad proporcional */}
              <div className="flex h-1.5">
                {nVerde > 0 && (
                  <div style={{ width: `${(nVerde / total) * 100}%`, backgroundColor: "#16a34a" }} />
                )}
                {nAmarillo > 0 && (
                  <div style={{ width: `${(nAmarillo / total) * 100}%`, backgroundColor: "#ca8a04" }} />
                )}
                {nRojo > 0 && (
                  <div style={{ width: `${(nRojo / total) * 100}%`, backgroundColor: "#dc2626" }} />
                )}
                {nSin > 0 && (
                  <div style={{ width: `${(nSin / total) * 100}%`, backgroundColor: "#bfdbfe" }} />
                )}
              </div>

              {/* Zonas apiladas */}
              <div className="flex flex-col flex-1 divide-y divide-slate-100 overflow-y-auto">
                {ZONAS.map((zona) => {
                  const alumnos = porZona[zona.key] || []
                  return (
                    <div
                      key={zona.key}
                      className="px-2 py-1.5 flex-1"
                      style={{ backgroundColor: zona.bg, minHeight: 40 }}
                    >
                      {/* Label de zona */}
                      <p
                        className="text-[9px] font-bold uppercase tracking-widest mb-1 opacity-70"
                        style={{ color: zona.text }}
                      >
                        {zona.label} {alumnos.length > 0 && `(${alumnos.length})`}
                      </p>

                      {/* Etiquetas de alumnos */}
                      <div className="flex flex-wrap gap-1">
                        {alumnos.length === 0 ? (
                          <span
                            className="text-[10px] opacity-30"
                            style={{ color: zona.text }}
                          >
                            —
                          </span>
                        ) : (
                          alumnos.map(({ s, val }) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => onStudentClick(s.id)}
                              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium transition-all hover:brightness-95 hover:scale-[1.03] active:scale-[0.98]"
                              style={{
                                backgroundColor: "#fff",
                                color: zona.text,
                                border: `1px solid ${zona.border}`,
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                              }}
                              title={`${s.nombre} — ${val !== null ? val + "%" : "Sin datos"}`}
                            >
                              <span
                                className="w-1.5 h-1.5 rounded-full shrink-0"
                                style={{ backgroundColor: zona.dot }}
                              />
                              <span className="truncate max-w-[56px]">{s.nombre}</span>
                              {val !== null && (
                                <span className="opacity-50 text-[9px] shrink-0">{val}%</span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center flex-wrap gap-3 pt-1 border-t border-slate-100">
        {ZONAS.map((z) => (
          <div key={z.key} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: z.dot }} />
            <span className="text-[10px] text-slate-500">{z.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
