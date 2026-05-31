"use client"

interface Student {
  id: string
  nombre: string
  apellido?: string
}

interface Actividad {
  semana: number
  resultado: string
}

interface SalaMapProps {
  students: Student[]
  progress: Record<string, Record<string, { porcentaje: number; actividades: Actividad[] }>>
  evaluaciones?: Record<string, string>
  onStudentClick: (id: string) => void
}

const EJES = [
  { key: "CF" as const, label: "Conciencia Fonologica" },
  { key: "CT" as const, label: "Comprension de Textos" },
  { key: "O"  as const, label: "Oralidad" },
]

const ZONAS = [
  { key: "verde",    label: "Logrado",    bg: "#16a34a" },
  { key: "amarillo", label: "En proceso", bg: "#ca8a04" },
  { key: "rojo",     label: "Refuerzo",   bg: "#dc2626" },
  { key: "azul",     label: "Ausente/Sin datos",  bg: "#2563eb" },
] as const

// Obtener la ultima evaluacion de un alumno en un eje
function getUltimaEvaluacion(actividades: Actividad[] | undefined): string {
  if (!actividades || actividades.length === 0) return "azul" // Sin evaluaciones = azul
  const ultima = actividades[actividades.length - 1]
  // Mapear el resultado a la zona
  if (ultima.resultado === "green") return "verde"
  if (ultima.resultado === "yellow") return "amarillo"
  if (ultima.resultado === "red") return "rojo"
  if (ultima.resultado === "blue") return "azul"
  return "verde" // Default para resultados desconocidos
}

export default function SalaMap({ students, progress, onStudentClick }: SalaMapProps) {
  return (
    <div className="p-3 h-full flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-bold text-slate-800">Mapa de Progreso</h2>
        <p className="text-xs text-slate-400">Estado de cada alumno segun ultima evaluacion por eje</p>
      </div>

      {/* 3 torres */}
      <div className="flex gap-2 flex-1 min-h-0">
        {EJES.map(({ key, label }) => {
          const grupos: Record<string, { id: string; nombre: string }[]> = {
            verde: [], amarillo: [], rojo: [], azul: [],
          }
          for (const s of students) {
            const ejeData = progress[s.id]?.[key]
            const zona = getUltimaEvaluacion(ejeData?.actividades)
            grupos[zona].push({ id: s.id, nombre: s.nombre })
          }

          return (
            <div key={key} className="flex-1 flex flex-col rounded-xl overflow-hidden border border-slate-200">

              {/* Titulo de la torre */}
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
                      <p className="text-[9px] font-bold uppercase tracking-widest text-white/60 mb-1">
                        {zlabel}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {lista.map(({ id, nombre }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => onStudentClick(id)}
                            className="text-black font-semibold text-[13px] bg-white/30 hover:bg-white/50 rounded px-1.5 py-0.5 transition-colors leading-tight"
                          >
                            {nombre.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}

                {/* Si no hay evaluaciones: todos en verde por default */}
                {students.length > 0 && grupos.verde.length === 0 && grupos.amarillo.length === 0 && grupos.rojo.length === 0 && grupos.azul.length === 0 && (
                  <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: "#16a34a" }}>
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
