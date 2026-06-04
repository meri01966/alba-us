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
  actividadesPorEje: { CF: number; CT: number; O: number }
  evaluacionesPorEje: { 
    CF: { green: number; yellow: number; red: number; total: number }
    CT: { green: number; yellow: number; red: number; total: number }
    O: { green: number; yellow: number; red: number; total: number }
  }
  alertasCount: number
  alertas: BrainAlerta[]
}

const EJES: Record<Eje, { label: string; color: string }> = {
  CF: { label: "Conciencia Fonologica", color: "#3b82f6" },
  CT: { label: "Comprension de Textos", color: "#10b981" },
  O:  { label: "Oralidad", color: "#f59e0b" },
}

const SALAS = ["Manzanos", "Girasoles", "Alamos", "Nogales TT", "Nogales TM", "SALADEPRUEBA"]
const COLORES: Record<Estado, string> = { green: "#22c55e", yellow: "#eab308", red: "#ef4444" }

// Grafico de barras mini para los 3 ejes - clickeable
function MiniBarChart({ 
  cf, ct, o, 
  actCF, actCT, actO,
  onClickEje 
}: { 
  cf: number; ct: number; o: number
  actCF: number; actCT: number; actO: number
  onClickEje: (eje: Eje) => void
}) {
  // Las barras muestran actividades realizadas, altura proporcional a cantidad
  const maxAct = Math.max(actCF, actCT, actO, 10) // minimo 10 para escala
  return (
    <div className="flex items-end gap-1.5 h-16">
      <button 
        onClick={() => onClickEje("CF")}
        className="flex flex-col items-center gap-0.5 group cursor-pointer hover:opacity-80 transition-opacity"
        title={`CF: ${actCF} actividades - ${cf}% logrado`}
      >
        <div className="relative">
          <div 
            className="w-6 rounded-t transition-all group-hover:ring-2 ring-blue-300" 
            style={{ height: `${Math.max((actCF / maxAct) * 44, 8)}px`, backgroundColor: EJES.CF.color }} 
          />
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-600">{actCF}</span>
        </div>
        <span className="text-[9px] font-bold text-slate-500">CF</span>
      </button>
      <button 
        onClick={() => onClickEje("CT")}
        className="flex flex-col items-center gap-0.5 group cursor-pointer hover:opacity-80 transition-opacity"
        title={`CT: ${actCT} actividades - ${ct}% logrado`}
      >
        <div className="relative">
          <div 
            className="w-6 rounded-t transition-all group-hover:ring-2 ring-emerald-300" 
            style={{ height: `${Math.max((actCT / maxAct) * 44, 8)}px`, backgroundColor: EJES.CT.color }} 
          />
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-600">{actCT}</span>
        </div>
        <span className="text-[9px] font-bold text-slate-500">CT</span>
      </button>
      <button 
        onClick={() => onClickEje("O")}
        className="flex flex-col items-center gap-0.5 group cursor-pointer hover:opacity-80 transition-opacity"
        title={`O: ${actO} actividades - ${o}% logrado`}
      >
        <div className="relative">
          <div 
            className="w-6 rounded-t transition-all group-hover:ring-2 ring-amber-300" 
            style={{ height: `${Math.max((actO / maxAct) * 44, 8)}px`, backgroundColor: EJES.O.color }} 
          />
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-600">{actO}</span>
        </div>
        <span className="text-[9px] font-bold text-slate-500">O</span>
      </button>
    </div>
  )
}

export default function DashboardDirectora() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [registros, setRegistros] = useState<Registro[]>([])
  const [cierres, setCierres] = useState<{ sala: string; eje: string; fecha: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [salasData, setSalasData] = useState<Record<string, SalaData>>({})
  
  // Modales
  const [modalSala, setModalSala] = useState<string | null>(null)
  const [modalTipo, setModalTipo] = useState<"planificacion" | "sintesis" | "alertas" | "proyectos" | "detalle_eje" | null>(null)
  const [loadingModal, setLoadingModal] = useState(false)
  const [sintesisData, setSintesisData] = useState<any>(null)
  const [planificacionData, setPlanificacionData] = useState<any>(null)
  const [ejeSeleccionado, setEjeSeleccionado] = useState<Eje | null>(null)

  async function cargarDatos() {
    try {
      const base = typeof window !== "undefined" ? window.location.origin : ""
      const res = await fetch(`${base}/api/directora-data`, { cache: "no-store" })
      if (res.ok) {
        const json = await res.json()
        if (json.ok) {
          setAlumnos(json.alumnos || [])
          setRegistros(json.registros || [])
          setCierres(json.cierres || [])
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
      
      // Calcular evaluaciones por eje (verdes, amarillos, rojos) - columna correcta es "estado"
      const calcEvaluaciones = (eje: string) => {
        const regs = regsSala.filter(r => r.eje === eje)
        return {
          green: regs.filter(r => r.estado === "green" || r.estado === "logrado").length,
          yellow: regs.filter(r => r.estado === "yellow" || r.estado === "proceso").length,
          red: regs.filter(r => r.estado === "red" || r.estado === "refuerzo").length,
          total: regs.length
        }
      }
      
      const evalCF = calcEvaluaciones("CF")
      const evalCT = calcEvaluaciones("CT")
      const evalO = calcEvaluaciones("O")
      
      // Calcular promedios (porcentaje de verdes)
      const calcProm = (eval_: { green: number; total: number }) => {
        if (eval_.total === 0) return 0
        return Math.round((eval_.green / eval_.total) * 100)
      }
      
      const cf = calcProm(evalCF)
      const ct = calcProm(evalCT)
      const o = calcProm(evalO)
      const promGen = (evalCF.total + evalCT.total + evalO.total) > 0 ? Math.round((cf + ct + o) / 3) : 0
      
      // Contar CLASES CERRADAS por eje (de registro_cierre) - esto define la altura de las barras
      const cierresSala = cierres.filter(c => c.sala === sala)
      const clasesCF = cierresSala.filter(c => c.eje === "CF").length
      const clasesCT = cierresSala.filter(c => c.eje === "CT").length
      const clasesO = cierresSala.filter(c => c.eje === "O").length
      
      // Cargar alertas REALES basadas en datos de seguimiento (no del brain)
      let alertas: BrainAlerta[] = []
      try {
        const alertasRes = await fetch(`${base}/api/alertas-reales?sala=${encodeURIComponent(sala)}`, { cache: "no-store" })
        if (alertasRes.ok) {
          const alertasData = await alertasRes.json()
          alertas = (alertasData.alertas || []).map((a: any) => ({
            tipo: a.tipo,
            urgencia: a.urgencia,
            mensaje: a.mensaje,
            alumno: a.alumnoNombre
          }))
        }
      } catch {}
      
      data[sala] = {
        nombre: sala,
        totalAlumnos: alumnosSala.length,
        promedioGeneral: promGen,
        promediosPorEje: { CF: cf, CT: ct, O: o },
        actividadesPorEje: { CF: clasesCF, CT: clasesCT, O: clasesO },
        evaluacionesPorEje: { CF: evalCF, CT: evalCT, O: evalO },
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
  }, [alumnos, registros, cierres])

  async function abrirModal(sala: string, tipo: "planificacion" | "sintesis" | "alertas" | "proyectos") {
    setModalSala(sala)
    setModalTipo(tipo)
    setLoadingModal(true)
    setSintesisData(null)
    setPlanificacionData(null)
    
    const base = typeof window !== "undefined" ? window.location.origin : ""
    
    if (tipo === "sintesis") {
      try {
        const res = await fetch(`${base}/api/reporte-grupal?sala=${encodeURIComponent(sala)}`, { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setSintesisData(data)
        }
      } catch {}
    }
    
    if (tipo === "planificacion") {
      try {
        const res = await fetch(`${base}/api/planificacion-sala?sala=${encodeURIComponent(sala)}`, { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          setPlanificacionData(data)
        }
      } catch {}
    }
    
    setLoadingModal(false)
  }

  function cerrarModal() {
    setModalSala(null)
    setModalTipo(null)
    setSintesisData(null)
    setPlanificacionData(null)
    setEjeSeleccionado(null)
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
                  </div>
                  
                  {/* Grafico de barras por eje - clickeable para ver detalle */}
                  <div className="flex items-center justify-between">
                    <MiniBarChart 
                      cf={data.promediosPorEje.CF} 
                      ct={data.promediosPorEje.CT} 
                      o={data.promediosPorEje.O}
                      actCF={data.actividadesPorEje?.CF || 0}
                      actCT={data.actividadesPorEje?.CT || 0}
                      actO={data.actividadesPorEje?.O || 0}
                      onClickEje={(eje) => {
                        setModalSala(sala)
                        setEjeSeleccionado(eje)
                        setModalTipo("detalle_eje")
                      }}
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
                  {modalTipo === "detalle_eje" && ejeSeleccionado && `Detalle ${EJES[ejeSeleccionado].label}`}
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
                      {!planificacionData || planificacionData.totalActividades === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                          <p className="text-sm text-amber-800">No hay actividades registradas en esta sala todavia.</p>
                        </div>
                      ) : (
                        <>
                          {/* Resumen */}
                          <div className="flex items-center justify-between bg-muted rounded-lg p-3">
                            <div className="text-sm">
                              <span className="font-semibold text-foreground">{planificacionData.totalActividades}</span>
                              <span className="text-muted-foreground"> actividades en </span>
                              <span className="font-semibold text-foreground">{planificacionData.totalDias}</span>
                              <span className="text-muted-foreground"> dias</span>
                            </div>
                          </div>
                          
                          {/* Lista por dia */}
                          {planificacionData.planificacion?.map((dia: any) => (
                            <div key={dia.fecha} className="border border-border rounded-lg overflow-hidden">
                              {/* Cabecera del dia */}
                              <div className="bg-primary/10 px-4 py-2 border-b border-border">
                                <p className="text-sm font-semibold text-foreground">{dia.fechaFormateada}</p>
                              </div>
                              
                              {/* Actividades del dia */}
                              <div className="divide-y divide-border">
                                {dia.actividades.map((act: any) => (
                                  <div key={act.id} className="px-4 py-3 flex items-start gap-3">
                                    {/* Tilde verde o circulo gris */}
                                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${act.completa ? "bg-green-500" : "bg-gray-200"}`}>
                                      {act.completa && (
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                      )}
                                    </div>
                                    
                                    {/* Contenido */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: EJES[act.eje as Eje]?.color || "#6b7280" }}>
                                          {act.eje}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{act.ejeNombre}</span>
                                        {act.hora && <span className="text-[10px] text-muted-foreground ml-auto">{act.hora}</span>}
                                      </div>
                                      
                                      {/* Actividad ALBA o Docente */}
                                      {act.actividadAlba && (
                                        <p className="text-sm text-foreground mb-1">
                                          <span className="text-muted-foreground">ALBA: </span>
                                          {act.actividadAlba}
                                        </p>
                                      )}
                                      {act.actividadDocente && (
                                        <p className="text-sm text-foreground mb-1">
                                          <span className="text-muted-foreground">Docente: </span>
                                          {act.actividadDocente}
                                        </p>
                                      )}
                                      
                                      {/* Evaluacion general */}
                                      {act.evaluacionGeneral && (
                                        <p className="text-xs text-muted-foreground mb-1">
                                          <span className="font-medium">Evaluacion: </span>
                                          {act.evaluacionGeneral}
                                        </p>
                                      )}
                                      
                                      {/* Observaciones */}
                                      {act.observaciones && (
                                        <p className="text-xs text-muted-foreground italic">
                                          {act.observaciones}
                                        </p>
                                      )}
                                      
                                      {/* Si no hay info, mostrar placeholder */}
                                      {!act.actividadAlba && !act.actividadDocente && !act.evaluacionGeneral && (
                                        <p className="text-xs text-muted-foreground italic">Actividad registrada sin descripcion</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                  
                  {/* Sintesis Grupal - informacion clara para la directora */}
                  {modalTipo === "sintesis" && sintesisData && (
                    <div className="space-y-4">
                      {sintesisData.sinDatos ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                          <p className="text-sm text-amber-800">{sintesisData.mensaje}</p>
                        </div>
                      ) : (
                        <>
                          {/* Resumen simple */}
                          <div className="bg-muted rounded-lg p-4">
                            <p className="text-sm text-foreground mb-2">
                              <span className="font-semibold">{sintesisData.totalAlumnos} alumnos</span>
                              <span className="text-muted-foreground"> trabajaron en </span>
                              <span className="font-semibold">{sintesisData.totalClases} clases</span>
                            </p>
                            {sintesisData.periodoDesde && (
                              <p className="text-xs text-muted-foreground">
                                Desde {sintesisData.periodoDesde} hasta {sintesisData.periodoHasta}
                              </p>
                            )}
                          </div>
                          
                          {/* Ejes - informacion clara sin porcentajes */}
                          {sintesisData.ejes?.map((eje: any) => {
                            // Determinar estado visual
                            const estado = eje.pctLogrado >= 70 ? "bien" : eje.pctLogrado >= 50 ? "avanzando" : eje.pctRefuerzo >= 40 ? "atencion" : "proceso"
                            const colorBorde = estado === "bien" ? "border-green-300" : estado === "atencion" ? "border-red-300" : "border-amber-300"
                            const colorFondo = estado === "bien" ? "bg-green-50" : estado === "atencion" ? "bg-red-50" : "bg-amber-50"
                            
                            return (
                              <div key={eje.eje} className={`border-2 ${colorBorde} rounded-lg overflow-hidden`}>
                                {/* Cabecera del eje */}
                                <div className="px-4 py-3 border-b border-border flex items-center gap-2" style={{ backgroundColor: `${EJES[eje.eje as Eje]?.color}15` }}>
                                  <span className="text-xs font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: EJES[eje.eje as Eje]?.color }}>{eje.eje}</span>
                                  <span className="text-sm font-semibold text-foreground">{eje.nombre}</span>
                                  <span className="text-xs text-muted-foreground ml-auto">{eje.totalClases} actividades</span>
                                </div>
                                
                                <div className="p-4 space-y-3">
                                  {/* Que trabajamos */}
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Que trabajamos:</p>
                                    <p className="text-sm text-foreground">{eje.txt_queTrabajaamos}</p>
                                  </div>
                                  
                                  {/* Como lo trabajamos */}
                                  {eje.metodologias?.length > 0 && (
                                    <div>
                                      <p className="text-xs font-semibold text-muted-foreground mb-1">Como lo trabajamos:</p>
                                      <p className="text-sm text-foreground">{eje.txt_comoLoTrabajaamos}</p>
                                    </div>
                                  )}
                                  
                                  {/* Estado del grupo - mensaje claro */}
                                  <div className={`${colorFondo} rounded-lg p-3`}>
                                    <p className="text-xs font-semibold text-muted-foreground mb-1">Como esta el grupo:</p>
                                    <p className="text-sm text-foreground">{eje.txt_queAprendioElGrupo}</p>
                                  </div>
                                  
                                  {/* Sugerencias de ALBA solo si hay situaciones importantes */}
                                  {(eje.pctRefuerzo >= 25 || eje.tendencia === "necesita_apoyo") && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                      <p className="text-xs font-semibold text-blue-800 mb-1">Sugerencia de ALBA:</p>
                                      <ul className="text-xs text-blue-700 space-y-1">
                                        {eje.sugerenciasContinuacion?.slice(0, 2).map((s: string, i: number) => (
                                          <li key={i}>• {s}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
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
                  
                  {/* Detalle de Eje - informacion clara y util, no numeros crudos */}
                  {modalTipo === "detalle_eje" && ejeSeleccionado && salasData[modalSala] && (
                    <div className="space-y-4">
                      {(() => {
                        const eval_ = salasData[modalSala].evaluacionesPorEje?.[ejeSeleccionado] || { green: 0, yellow: 0, red: 0, total: 0 }
                        const clases = salasData[modalSala].actividadesPorEje?.[ejeSeleccionado] || 0
                        const totalAlumnos = salasData[modalSala].totalAlumnos
                        const total = eval_.total
                        
                        // Calcular situacion del grupo
                        const pctGreen = total > 0 ? (eval_.green / total) * 100 : 0
                        const pctYellow = total > 0 ? (eval_.yellow / total) * 100 : 0
                        const pctRed = total > 0 ? (eval_.red / total) * 100 : 0
                        
                        // Generar mensaje claro basado en evidencia
                        let estadoGrupo = ""
                        let colorEstado = ""
                        let sugerencia = ""
                        
                        if (clases === 0) {
                          estadoGrupo = "Sin actividades registradas"
                          colorEstado = "text-muted-foreground"
                          sugerencia = "Aun no se realizaron actividades en este eje."
                        } else if (pctGreen >= 70) {
                          estadoGrupo = "El grupo avanza muy bien"
                          colorEstado = "text-green-600"
                          sugerencia = `La mayoria de los ninos logra los objetivos de ${EJES[ejeSeleccionado].label}.`
                        } else if (pctGreen >= 50) {
                          estadoGrupo = "El grupo avanza con algunos a reforzar"
                          colorEstado = "text-amber-600"
                          if (eval_.red > 0) {
                            sugerencia = `${eval_.red} evaluaciones necesitan refuerzo. Considerar estrategias alternativas para esos ninos.`
                          } else {
                            sugerencia = "Algunos ninos estan en proceso. Continuar con las actividades planificadas."
                          }
                        } else if (pctRed >= 40) {
                          estadoGrupo = "Atencion: varios ninos necesitan refuerzo"
                          colorEstado = "text-red-600"
                          sugerencia = "Revisar si la actividad es adecuada para el grupo o si hay factores externos afectando. Considerar hablar con las familias de los ninos con mas dificultad."
                        } else {
                          estadoGrupo = "El grupo esta en proceso"
                          colorEstado = "text-amber-600"
                          sugerencia = "Continuar observando la evolucion en las proximas actividades."
                        }
                        
                        return (
                          <>
                            {/* Cabecera del eje */}
                            <div className="flex items-center gap-3 pb-3 border-b border-border">
                              <div 
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: EJES[ejeSeleccionado].color }}
                              >
                                {ejeSeleccionado}
                              </div>
                              <div>
                                <h3 className="font-bold text-foreground">{EJES[ejeSeleccionado].label}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {clases} {clases === 1 ? "actividad realizada" : "actividades realizadas"}
                                </p>
                              </div>
                            </div>
                            
                            {/* Estado del grupo - mensaje claro */}
                            <div className="bg-muted rounded-lg p-4">
                              <p className={`font-semibold ${colorEstado}`}>{estadoGrupo}</p>
                              <p className="text-sm text-muted-foreground mt-1">{sugerencia}</p>
                            </div>
                            
                            {/* Resumen visual simple */}
                            {clases > 0 && (
                              <div className="grid grid-cols-3 gap-2">
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                                  <p className="text-lg font-bold text-green-700">{eval_.green}</p>
                                  <p className="text-[10px] text-green-600">Logrado</p>
                                </div>
                                <div className="bg-amber-50 rounded-lg p-3 text-center">
                                  <div className="w-3 h-3 bg-amber-500 rounded-full mx-auto mb-1"></div>
                                  <p className="text-lg font-bold text-amber-700">{eval_.yellow}</p>
                                  <p className="text-[10px] text-amber-600">En proceso</p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-3 text-center">
                                  <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
                                  <p className="text-lg font-bold text-red-700">{eval_.red}</p>
                                  <p className="text-[10px] text-red-600">Refuerzo</p>
                                </div>
                              </div>
                            )}
                            
                            {/* Inferencias de ALBA si hay patrones preocupantes */}
                            {pctRed >= 30 && clases >= 2 && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-xs font-semibold text-blue-800 mb-1">Sugerencias de ALBA:</p>
                                <ul className="text-xs text-blue-700 space-y-1">
                                  {pctRed >= 50 && <li>• Considerar una reunion con las familias de los ninos con mas dificultad</li>}
                                  {pctRed >= 30 && <li>• Evaluar si hay factores emocionales o de atencion afectando el desempeno</li>}
                                  <li>• Probar estrategias alternativas para las proximas actividades de este eje</li>
                                </ul>
                              </div>
                            )}
                          </>
                        )
                      })()}
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
