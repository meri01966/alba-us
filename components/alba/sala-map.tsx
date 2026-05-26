"use client"

interface Student {
  id: string
  nombre: string
  apellido?: string
}

interface SalaMapProps {
  students: Student[]
  progress: Record<string, { CF: number | null; CT: number | null; O: number | null }>
  evaluaciones?: Record<string, string>
  onStudentClick: (id: string) => void
}

const EJES = [
  { key: "CF" as const, label: "Conciencia Fonologica" },
  { key: "CT" as const, label: "Comprension de Textos" },
  { key: "O"  as const, label: "Oralidad" },
]

const ZONAS = [
  { key: "verde",    label: "Logrado",    bg: "#16a34a", min: 70  },
  { key: "amarillo", label: "En proceso", bg: "#d97706", min: 40  },
  { key: "rojo",     label: "Refuerzo",   bg: "#dc2626", min: 0   },
  { key: "azul",     label: "Sin datos",  bg: "#2563eb", min: null },
] as const

function zona(val: number | null): string {
  if (val === null) return "azul"
  if (val >= 70) return "verde"
  if (val >= 40) return "amarillo"
  return "rojo"
}

export default function SalaMap({ students, progress, onStudentClick }: SalaMapProps) {
  return (
    <div className="p-3 h-full flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-bold text-slate-800">Mapa de Progreso</h2>
        <p className="text-xs text-slate-400">Promedio acumulado por eje — clase a clase</p>
      </div>

      {/* 3 torres */}
      <div className="flex gap-2 flex-1 min-h-0">
        {EJES.map(({ key, label }) => {
          const grupos: Record<string, { id: string; nombre: string; val: number | null }[]> = {
            verde: [], amarillo: [], rojo: [], azul: [],
          }
          for (const s of students) {
            const val = progress[s.id]?.[key] ?? null
            grupos[zona(val)].push({ id: s.id, nombre: s.nombre, val })
          }

          return (
            <div key={key} className="flex-1 flex flex-col rounded-xl overflow-hidden border border-slate-200">

              {/* Titulo de la torre — sin color */}
              <div className="bg-white px-2 py-2 border-b border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-800">{key}</p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{label}</p>
              </div>

              {/* Zonas apiladas: verde → amarillo → rojo → azul */}
              <div className="flex flex-col flex-1 overflow-y-auto">
                {ZONAS.map(({ key: z, label: zlabel, bg }) => {
                  const lista = grupos[z]
                  if (lista.length === 0) return null
                  return (
                    <div
                      key={z}
                      className="px-2 py-2 flex-shrink-0"
                      style={{ backgroundColor: bg }}
                    >
                      {/* Etiqueta de zona muy pequeña */}
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/60 mb-1">
                        {zlabel}
                      </p>
                      {/* Nombres de alumnos */}
                      <div className="flex flex-wrap gap-1">
                        {lista.map(({ id, nombre, val }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => onStudentClick(id)}
                            className="text-white font-semibold text-[11px] bg-white/20 hover:bg-white/30 rounded px-1.5 py-0.5 transition-colors leading-tight"
                            title={val !== null ? `${nombre} — ${val}%` : nombre}
                          >
                            {nombre.split(" ")[0]}
                            {val !== null && (
                              <span className="ml-1 text-[9px] opacity-60">{val}%</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Si todos sin datos: mostrar zona azul vacía */}
                {students.length > 0 && Object.values(grupos).every(g => g.length === 0) && (
                  <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "#2563eb" }}>
                    <p className="text-[10px] text-white/50">Sin evaluaciones</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-3 flex-wrap border-t border-slate-100 pt-1">
        {ZONAS.map(({ key: z, label, bg }) => (
          <div key={z} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: bg }} />
            <span className="text-[10px] text-slate-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
