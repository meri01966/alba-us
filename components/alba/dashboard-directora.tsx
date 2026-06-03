"use client"

import { useState, useEffect } from "react"

type Eje = "CF" | "CT" | "O"
type Estado = "green" | "yellow" | "red"

interface Alumno {
  id: string
  nombre: string
  sala: string
}

interface Registro {
  id: string
  alumno_id: string
  eje: string
  resultado: string
  actividad: string
  fecha: string
  sala?: string
}

interface BrainAlerta {
  tipo: string
  mensaje: string
  urgencia: "alta" | "media" | "info"
  alumnoNombre?: string
}

interface SalaData {
  nombre: string
  totalAlumnos: number
  promedioGeneral: number
  promediosPorEje: { CF: number; CT: number; O: number }
  alertasCount: number
  alertas: BrainAlerta[]
}

const EJES: Record<Eje, { label: string; color: string }> = {
  CF: { label: "Conciencia Fonologica", color: "#3b82f6" },
  CT: { label: "Comprension de Textos", color: "#10b981" },
  O:  { label: "Oralidad", color: "#f59e0b" },
}

const SALAS = ["Manzanos", "Girasoles", "Álamos", "Nogales TT", "Nogales TM"]
const COLORES: Record<Estado, string> = { green: "#22c55e", yellow: "#eab308", red: "#ef4444" }

// Grafico de barras mini para los 3 ejes
function MiniBarChart({ cf, ct, o }: { cf: number; ct: number; o: number }) {
  const max = Math.max(cf, ct, o, 1)
  return (
    <div className="flex items-end gap-1.5 h-12">
      <div className="flex flex-col items-center gap-0.5">
        <div 
          className="w-5 rounded-t transition-all" 
          style={{ height: `${(cf / 100) * 40}px`, backgroundColor: EJES.CF.color, minHeight: "4px" }} 
        />
        <span className="text-[8px] font-bold text-slate-400">CF</span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <div 
          className="w-5 rounded-t transition-all" 
          style={{ height: `${(ct / 100) * 40}px`, backgroundColor: EJES.CT.color, minHeight: "4px" }} 
        />
        <span className="text-[8px] font-bold text-slate-400">CT</span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <div 
          className="w-5 rounded-t transition-all" 
          style={{ height: `${(o / 100) * 40}px`, backgroundColor: EJES.O.color, minHeight: "4px" }} 
        />
        <span className="text-[8px] font-bold text-slate-400">O</span>
      </div>
    </div>
  )
}

// Indicador circular de progreso general
function ProgressRing({ value, size = 56 }: { value: number; size?: number }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  const color = value >= 65 ? "#22c55e" : value >= 35 ? "#eab308" : "#ef4444"
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
        className="transform rotate-90 origin-center" style={{ fontSize: size * 0.28, fontWeight: 700, fill: color }}>
        {value}%
      </text>
    </svg>
  )
}

export default function DashboardDirectora() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [salasData, setSalasData] = useState<Record<string, SalaData>>({})
  
  // Modales
  const [modalSala, setModalSala] = useState<string | null>(null)
  const [modalTipo, setModalTipo] = useState<"planificacion" | "sintesis" | "alertas" | "proyectos" | null>(null)
  const [loadingModal, setLoadingModal] = useState(false)
  const [sintesisData, setSintesisData] = useState<any>(null)

  async function cargarDatos() {
    try {
      const base = typeof window !== "undefined" ? window.location.origin : ""
      const res = await fetch(`${base}/api/directora-data`, { cache: "no-store" })
      if (res.ok) {
        const json = await res.json()
        if (json.ok) {
          setAlumnos(json.alumnos || [])
          setRegistros(json.registros || [])
        }
      }
    } catch (e) {
      console.error("[v0] Error cargando datos:", e)
    }
    setLoading(false)
  }

  async function cargarDataPorSala() {
    const base = typeof window !== "undefined" ? window.location.origin : ""
    const data: Record<string, SalaData> = {}
    
    for (const sala of SALAS) {
      const alumnosSala = alumnos.filter(a => a.sala === sala)
      const regsSala = registros.filter(r => alumnosSala.some(a => a.id === r.alumno_id))
      
      // Calcular promedios por eje
      const calcProm = (eje: string) => {
        const regs = regsSala.filter(r => r.eje === eje)
        if (regs.length === 0) return 0
        const verdes = regs.filter(r => r.resultado === "green").length
        return Math.round((verdes / regs.length) * 100)
      }
      
      const cf = calcProm("CF")
      const ct = calcProm("CT")
      const o = calcProm("O")
      const promGen = regsSala.length > 0 ? Math.round((cf + ct + o) / 3) : 0
      
      // Cargar alertas del brain
      let alertas: BrainAlerta[] = []
      try {
        const brainRes = await fetch(`${base}/api/brain?sala=${encodeURIComponent(sala)}`, { cache: "no-store" })
        if (brainRes.ok) {
          const brainData = await brainRes.json()
          alertas = (brainData.alertas || []).filter((a: BrainAlerta) => a.urgencia === "alta" || a.urgencia === "media")
        }
      } catch {}
      
      data[sala] = {
        nombre: sala,
        totalAlumnos: alumnosSala.length,
        promedioGeneral: promGen,
        promediosPorEje: { CF: cf, CT: ct, O: o },
        alertasCount: alertas.length,
        alertas
      }
    }
    
    setSalasData(data)
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  useEffect(() => {
    if (alumnos.length > 0 || registros.length > 0) {
      cargarDataPorSala()
    }
  }, [alumnos, registros])

  async function abrirModal(sala: string, tipo: "planificacion" | "sintesis" | "alertas" | "proyectos") {
    setModalSala(sala)
    setModalTipo(tipo)
    setLoadingModal(true)
    setSintesisData(null)
    
    if (tipo === "sintesis") {
      try {
        const base = typeof window !== "undefined" ? window.location.origin : ""
        const res = await fetch(`${base}/api/reporte-grupal?sala=${encodeURIComponent(sala)}`, { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setSintesisData(data)
        }
      } catch {}
    }
    
    setLoadingModal(false)
  }

  function cerrarModal() {
    setModalSala(null)
    setModalTipo(null)
    setSintesisData(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Cargando datos institucionales...</p>
        </div>
      </div>
    )
  }

  // KPIs globales
  const totalAlumnos = alumnos.length
  const totalRegistros = registros.length
  const alertasTotal = Object.values(salasData).reduce((acc, s) => acc + s.alertasCount, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-primary text-primary-foreground px-4 py-3 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="text-lg font-bold">D</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">ALBA — Vista Direccion</h1>
              <p className="text-xs opacity-80">Panel de seguimiento institucional</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {alertasTotal > 0 && (
              <div className="flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium">{alertasTotal} alertas</span>
              </div>
            )}
            <div className="text-right">
              <p className="text-xs opacity-70">{totalAlumnos} alumnos</p>
              <p className="text-xs opacity-70">{totalRegistros} evaluaciones</p>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto p-4 space-y-4">
        {/* Grid de tarjetas por sala */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SALAS.map(sala => {
            const data = salasData[sala]
            if (!data) return null
            
            return (
              <div key={sala} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                {/* Contenido de la tarjeta */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-foreground">{sala}</h3>
                      <p className="text-xs text-muted-foreground">{data.totalAlumnos} alumnos</p>
                    </div>
                    <ProgressRing value={data.promedioGeneral} />
                  </div>
                  
                  {/* Grafico de barras por eje */}
                  <div className="flex items-center justify-between">
                    <MiniBarChart 
                      cf={data.promediosPorEje.CF} 
                      ct={data.promediosPorEje.CT} 
                      o={data.promediosPorEje.O} 
                    />
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground">CF: {data.promediosPorEje.CF}%</p>
                      <p className="text-[10px] text-muted-foreground">CT: {data.promediosPorEje.CT}%</p>
                      <p className="text-[10px] text-muted-foreground">O: {data.promediosPorEje.O}%</p>
                    </div>
                  </div>
                  
                  {/* Indicador de alertas */}
                  {data.alertasCount > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      {data.alertasCount} alerta{data.alertasCount > 1 ? "s" : ""} pedagogica{data.alertasCount > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
                
                {/* Barra azul con botones */}
                <div className="bg-primary px-3 py-2 flex items-center justify-between gap-2">
                  <button 
                    onClick={() => abrirModal(sala, "planificacion")}
                    className="flex-1 text-[10px] font-medium text-primary-foreground/90 hover:text-primary-foreground py-1.5 px-2 rounded hover:bg-white/10 transition-colors"
                  >
                    Planificacion
                  </button>
                  <div className="w-px h-4 bg-white/20" />
                  <button 
                    onClick={() => abrirModal(sala, "sintesis")}
                    className="flex-1 text-[10px] font-medium text-primary-foreground/90 hover:text-primary-foreground py-1.5 px-2 rounded hover:bg-white/10 transition-colors"
                  >
                    Sintesis Grupal
                  </button>
                  <div className="w-px h-4 bg-white/20" />
                  <button 
                    onClick={() => abrirModal(sala, "alertas")}
                    className="flex-1 text-[10px] font-medium text-primary-foreground/90 hover:text-primary-foreground py-1.5 px-2 rounded hover:bg-white/10 transition-colors relative"
                  >
                    Alertas
                    {data.alertasCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center">
                        {data.alertasCount}
                      </span>
                    )}
                  </button>
                  <div className="w-px h-4 bg-white/20" />
                  <button 
                    onClick={() => abrirModal(sala, "proyectos")}
                    className="flex-1 text-[10px] font-medium text-primary-foreground/90 hover:text-primary-foreground py-1.5 px-2 rounded hover:bg-white/10 transition-colors"
                  >
                    Proyectos
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Modal */}
      {modalSala && modalTipo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={cerrarModal}>
          <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Header del modal */}
            <div className="bg-primary text-primary-foreground px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">{modalSala}</h2>
                <p className="text-xs opacity-80">
                  {modalTipo === "planificacion" && "Planificacion semanal"}
                  {modalTipo === "sintesis" && "Sintesis Grupal Cuatrimestral"}
                  {modalTipo === "alertas" && "Alertas Pedagogicas"}
                  {modalTipo === "proyectos" && "Proyectos de la Sala"}
                </p>
              </div>
              <button onClick={cerrarModal} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                <span className="text-sm">X</span>
              </button>
            </div>
            
            {/* Contenido del modal */}
            <div className="p-5 overflow-y-auto max-h-[calc(85vh-80px)]">
              {loadingModal ? (
                <div className="py-12 text-center">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Cargando...</p>
                </div>
              ) : (
                <>
                  {/* Planificacion */}
                  {modalTipo === "planificacion" && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">La planificacion semanal de esta sala se muestra aqui. Proximamente podras ver las actividades programadas por la maestra.</p>
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-xs text-muted-foreground text-center">Funcionalidad en desarrollo</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Sintesis Grupal */}
                  {modalTipo === "sintesis" && sintesisData && (
                    <div className="space-y-4">
                      {sintesisData.sinDatos ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                          <p className="text-sm text-amber-800">{sintesisData.mensaje}</p>
                        </div>
                      ) : (
                        <>
                          {/* Resumen */}
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-muted rounded-lg p-3">
                              <p className="text-2xl font-bold text-foreground">{sintesisData.totalAlumnos}</p>
                              <p className="text-[10px] text-muted-foreground">Alumnos</p>
                            </div>
                            <div className="bg-muted rounded-lg p-3">
                              <p className="text-2xl font-bold text-foreground">{sintesisData.totalClases}</p>
                              <p className="text-[10px] text-muted-foreground">Clases</p>
                            </div>
                            <div className="bg-muted rounded-lg p-3">
                              <p className="text-xs text-muted-foreground">{sintesisData.periodoDesde || "—"}</p>
                              <p className="text-xs text-muted-foreground">a {sintesisData.periodoHasta || "—"}</p>
                            </div>
                          </div>
                          
                          {/* Ejes */}
                          {sintesisData.ejes?.map((eje: any) => (
                            <div key={eje.eje} className="border border-border rounded-lg overflow-hidden">
                              <div className="px-4 py-2 border-b border-border flex items-center gap-2" style={{ backgroundColor: `${EJES[eje.eje as Eje]?.color}15` }}>
                                <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: EJES[eje.eje as Eje]?.color }}>{eje.eje}</span>
                                <span className="text-sm font-medium text-foreground">{eje.nombre}</span>
                              </div>
                              <div className="p-4 space-y-3">
                                <div>
                                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Que trabajamos</p>
                                  <p className="text-sm text-foreground">{eje.txt_queTrabajaamos}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Como lo trabajamos</p>
                                  <p className="text-sm text-foreground">{eje.txt_comoLoTrabajaamos}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-semibold text-muted-foreground uppercase mb-1">Que aprendio el grupo</p>
                                  <p className="text-sm text-foreground">{eje.txt_queAprendioElGrupo}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Alertas */}
                  {modalTipo === "alertas" && (
                    <div className="space-y-3">
                      {salasData[modalSala]?.alertas.length === 0 ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                          <p className="text-sm text-green-800">No hay alertas pedagogicas en esta sala</p>
                        </div>
                      ) : (
                        salasData[modalSala]?.alertas.map((alerta, i) => (
                          <div key={i} className={`rounded-lg p-3 border ${alerta.urgencia === "alta" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
                            <div className="flex items-start gap-2">
                              <span className={`w-2 h-2 rounded-full mt-1.5 ${alerta.urgencia === "alta" ? "bg-red-500" : "bg-amber-500"}`} />
                              <div>
                                <p className="text-xs font-semibold text-foreground">{alerta.tipo}</p>
                                <p className="text-sm text-muted-foreground">{alerta.mensaje}</p>
                                {alerta.alumnoNombre && <p className="text-xs text-muted-foreground mt-1">Alumno: {alerta.alumnoNombre}</p>}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  
                  {/* Proyectos */}
                  {modalTipo === "proyectos" && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">Los proyectos pedagogicos de esta sala se mostraran aqui.</p>
                      <div className="bg-muted rounded-lg p-4">
                        <p className="text-xs text-muted-foreground text-center">Funcionalidad en desarrollo</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
