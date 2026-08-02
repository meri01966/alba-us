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
  { key: "O" as const, label: "Oralidad" },
]

// Minimo de clases evaluadas REALES (sin ausentes) para mostrar un nivel.
// Con menos evidencia, la barra queda vacia: no se inventa una valoracion.
const MIN_EVIDENCIA = 3

// Calcula, para un eje, la evidencia real y el nivel de logro.
// - nReales: evaluaciones que NO son ausente ("blue")
// - nivel: promedio 0-100 (green=100, yellow=50, red=0), solo valido si hay evidencia
function calcularEje(actividades: Actividad[] | undefined): { nReales: number; nivel: number; hayEvidencia: boolean } {
  if (!actividades || actividades.length === 0) {
    return { nReales: 0, nivel: 0, hayEvidencia: false }
  }
  const reales = actividades.filter((a) => a.resultado !== "blue")
  const nReales = reales.length
  if (nReales < MIN_EVIDENCIA) {
    return { nReales, nivel: 0, hayEvidencia: false }
  }
  const suma = reales.reduce((acc, a) => {
    if (a.resultado === "green") return acc + 100
    if (a.resultado === "yellow") return acc + 50
    if (a.resultado === "red") return acc + 0
    return acc // cualquier otro no suma
  }, 0)
  const nivel = Math.round(suma / nReales)
  return { nReales, nivel, hayEvidencia: true }
}

// Color de la barra segun el nivel de logro
function colorNivel(nivel: number): string {
  if (nivel >= 70) return "#10b981" // verde - logrado
  if (nivel >= 40) return "#f59e0b" // amarillo - en proceso
  return "#ef4444" // rojo - refuerzo
}

function iniciales(nombre: string): string {
  const limpio = (nombre || "").trim()
  if (!limpio) return "?"
  return limpio.slice(0, 2).toUpperCase()
}

export default function SalaMap({ students, progress, onStudentClick }: SalaMapProps) {
  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-bold text-slate-800">Mapa de Progreso</h2>
        <p className="text-xs text-slate-400">Tocá un alumno para ver su perfil completo</p>
      </div>

      {/* Grilla de tarjetas de alumno */}
      <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
        {students.map((s) => {
          const totalReales = EJES.reduce((acc, eje) => {
            return acc + calcularEje(progress[s.id]?.[eje.key]?.actividades).nReales
          }, 0)

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onStudentClick(s.id)}
              className="bg-white border border-slate-200 rounded-xl p-2.5 text-left hover:border-[#1e3a5f] hover:shadow-md transition-all"
            >
              {/* Cabecera: avatar + nombre */}
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-6 h-6 rounded-full bg-[#1e3a5f] text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                  {iniciales(s.nombre)}
                </div>
                <span className="text-[11px] font-bold text-slate-700 truncate">
                  {s.nombre.split(" ")[0]}
                </span>
              </div>

              {/* Barras por eje */}
              <div className="flex items-end justify-around gap-1.5 h-[46px] px-1">
                {EJES.map((eje) => {
                  const { nivel, hayEvidencia } = calcularEje(progress[s.id]?.[eje.key]?.actividades)
                  const alturaPx = hayEvidencia ? Math.max(5, Math.round((nivel / 100) * 36)) : 0
                  return (
                    <div key={eje.key} className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-full max-w-[20px] h-9 bg-slate-100 rounded flex items-end overflow-hidden relative">
                        {hayEvidencia ? (
                          <div
                            className="w-full rounded-t transition-all"
                            style={{ height: `${alturaPx}px`, backgroundColor: colorNivel(nivel) }}
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-[11px] text-slate-300 font-bold">–</span>
                        )}
                      </div>
                      <span className="text-[8px] font-bold text-slate-400">{eje.key}</span>
                    </div>
                  )
                })}
              </div>

              {/* Pie: cantidad de evidencia */}
              <p className="text-[8px] text-slate-400 text-center mt-1.5">
                {totalReales === 0 ? "Sin evaluaciones aun" : `${totalReales} clases evaluadas`}
              </p>
            </button>
          )
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-3 flex-wrap border-t border-slate-100 pt-2">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: "#10b981" }} />
          <span className="text-[10px] text-slate-500">Logrado</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: "#f59e0b" }} />
          <span className="text-[10px] text-slate-500">En proceso</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: "#ef4444" }} />
          <span className="text-[10px] text-slate-500">Refuerzo</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block bg-slate-100 border border-slate-200 flex items-center justify-center text-[8px] text-slate-300 font-bold leading-none">–</span>
          <span className="text-[10px] text-slate-500">Sin evidencia suficiente</span>
        </div>
      </div>
    </div>
  )
}
