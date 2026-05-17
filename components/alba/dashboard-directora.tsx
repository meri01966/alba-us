"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, TrendingUp, TrendingDown, Eye, Users, ChevronDown, ArrowLeft, BarChart3, Sparkles } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

// ═══ TIPOS ═══
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
}

interface SalaResumen {
  nombre: string
  nivel: string
  total: number
  verdes: number
  amarillos: number
  rojos: number
  sinDatos: number
  promedios: { CF: number; CT: number; O: number }
}

interface AlumnoEnRiesgo {
  nombre: string
  sala: string
  eje: string
  semanas: number
  promedio: number
}

// ═══ CONSTANTES ═══
const SALAS = [
  { nombre: "Manzanos", nivel: "5 años" },
  { nombre: "Girasoles", nivel: "5 años" },
  { nombre: "Álamos", nivel: "5 años" },
  { nombre: "Nogales TT", nivel: "4 años" },
  { nombre: "Nogales TM", nivel: "4 años" },
]

const EJES: Record<Eje, { label: string; color: string; icon: string }> = {
  CF: { label: "Conciencia Fonológica", color: "#6366F1", icon: "🔊" },
  CT: { label: "Comprensión de Textos", color: "#0D9488", icon: "📖" },
  O:  { label: "Oralidad", color: "#D97706", icon: "🗣️" },
}

const COLORES = { green: "#22c55e", yellow: "#eab308", red: "#ef4444" }

// ═══ TORTA SVG — sin dependencias externas ═══
function TortaSVG({
  segmentos,
  promedio,
  color,
  size = 112,
}: {
  segmentos: { pct: number; color: string; label: string; n: number }[]
  promedio: number
  color: string
  size?: number
}) {
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.42
  const stroke = size * 0.13

  // Generar arcos SVG
  function describeArc(startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle - 90)
    const end = polarToCartesian(cx, cy, r, startAngle - 90)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
  }

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = (angleDeg * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  let currentAngle = 0
  const arcs = segmentos
    .filter(s => s.pct > 0)
    .map(s => {
      const sweep = s.pct * 360
      const path = describeArc(currentAngle, currentAngle + sweep)
      currentAngle += sweep
      return { ...s, path }
    })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Fondo gris */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      {/* Arcos de datos */}
      {arcs.map((arc, i) => (
        <path
          key={i}
          d={arc.path}
          fill="none"
          stroke={arc.color}
          strokeWidth={stroke}
          strokeLinecap="butt"
        />
      ))}
      {/* Texto central: porcentaje */}
      <text x={cx} y={cy - size * 0.04} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.2} fontWeight="300" fill={color}>
        {promedio}
      </text>
      <text x={cx} y={cy + size * 0.16} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.09} fill="#94a3b8">
        %
      </text>
    </svg>
  )
}

// ═══ COMPONENTE PRINCIPAL ═══
export default function DashboardDirectora() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [ejeFiltro, setEjeFiltro] = useState<"todos" | Eje>("todos")
  const [salaSeleccionada, setSalaSeleccionada] = useState<string | null>(null)
  const [alumnoModal, setAlumnoModal] = useState<string | null>(null)
  const [showEjeDropdown, setShowEjeDropdown] = useState(false)

  // Cargar datos de toda la escuela
  useEffect(() => {
    async function fetchData() {
      if (!isSupabaseConfigured() || !supabase) {
        setLoading(false)
        return
      }
      try {
        const { data: als } = await supabase.from("alumnos").select("*").order("nombre")
        const { data: regs } = await supabase.from("seguimiento").select("*").order("fecha", { ascending: true })
        setAlumnos(als || [])
        setRegistros(regs || [])
      } catch (err) {
        console.error("Error cargando datos:", err)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // ═══ CÁLCULOS ═══
  function getUltimoEstado(alumnoId: string, eje?: string): Estado | null {
    let regs = registros.filter(r => r.alumno_id === alumnoId)
    if (eje) regs = regs.filter(r => r.eje === eje)
    if (regs.length === 0) return null
    const ultimo = regs[regs.length - 1]
    return ultimo.resultado as Estado
  }

  function getPromedio(alumnoId: string, eje: string): number {
    const regs = registros.filter(r => r.alumno_id === alumnoId && r.eje === eje)
    if (regs.length === 0) return 0
    const ultimo = regs[regs.length - 1]
    if (ultimo.resultado === "green") return 100
    if (ultimo.resultado === "yellow") return 50
    return 10
  }

  function getEstadoGeneral(alumnoId: string): Estado | null {
    if (ejeFiltro !== "todos") return getUltimoEstado(alumnoId, ejeFiltro)
    const cf = getPromedio(alumnoId, "CF")
    const ct = getPromedio(alumnoId, "CT")
    const o = getPromedio(alumnoId, "O")
    const prom = (cf + ct + o) / 3
    if (prom === 0) return null
    if (prom >= 70) return "green"
    if (prom >= 40) return "yellow"
    return "red"
  }

  // Resumen por sala
  function calcularResumenSala(salaNombre: string): SalaResumen {
    const sala = SALAS.find(s => s.nombre === salaNombre)
    const alumnosSala = alumnos.filter(a => a.sala === salaNombre)
    let verdes = 0, amarillos = 0, rojos = 0, sinDatos = 0

    alumnosSala.forEach(a => {
      const estado = getEstadoGeneral(a.id)
      if (estado === "green") verdes++
      else if (estado === "yellow") amarillos++
      else if (estado === "red") rojos++
      else sinDatos++
    })

    const promedios = { CF: 0, CT: 0, O: 0 }
    if (alumnosSala.length > 0) {
      const ejes: Eje[] = ["CF", "CT", "O"]
      ejes.forEach(eje => {
        const sum = alumnosSala.reduce((acc, a) => acc + getPromedio(a.id, eje), 0)
        promedios[eje] = Math.round(sum / alumnosSala.length)
      })
    }

    return {
      nombre: salaNombre,
      nivel: sala?.nivel || "",
      total: alumnosSala.length,
      verdes, amarillos, rojos, sinDatos,
      promedios,
    }
  }

  // Top 10 alumnos en riesgo
  function getAlumnosEnRiesgo(): AlumnoEnRiesgo[] {
    const riesgo: AlumnoEnRiesgo[] = []
    const ejes: Eje[] = ejeFiltro === "todos" ? ["CF", "CT", "O"] : [ejeFiltro]

    alumnos.forEach(a => {
      ejes.forEach(eje => {
        const regs = registros.filter(r => r.alumno_id === a.id && r.eje === eje)
        const ultimos3 = regs.slice(-3)
        const enRojo = ultimos3.filter(r => r.resultado === "red").length
        if (enRojo >= 2) {
          riesgo.push({
            nombre: a.nombre,
            sala: a.sala,
            eje,
            semanas: enRojo,
            promedio: getPromedio(a.id, eje),
          })
        }
      })
    })

    return riesgo.sort((a, b) => a.promedio - b.promedio).slice(0, 10)
  }

  // Historial de un alumno
  function getHistorial(alumnoId: string) {
    const regs = registros.filter(r => r.alumno_id === alumnoId)
    return {
      CF: regs.filter(r => r.eje === "CF").map(r => ({ fecha: r.fecha, resultado: r.resultado, actividad: r.actividad })),
      CT: regs.filter(r => r.eje === "CT").map(r => ({ fecha: r.fecha, resultado: r.resultado, actividad: r.actividad })),
      O: regs.filter(r => r.eje === "O").map(r => ({ fecha: r.fecha, resultado: r.resultado, actividad: r.actividad })),
    }
  }

  // KPIs globales
  const totalAlumnos = alumnos.length
  const totalRojos = alumnos.filter(a => getEstadoGeneral(a.id) === "red").length
  const totalVerdes = alumnos.filter(a => getEstadoGeneral(a.id) === "green").length
  const totalAmarillos = alumnos.filter(a => getEstadoGeneral(a.id) === "yellow").length
  const resumenSalas = SALAS.map(s => calcularResumenSala(s.nombre)).filter(s => s.total > 0)
  const alumnosEnRiesgo = getAlumnosEnRiesgo()
  const totalRegistros = registros.length

  // ═══ RENDER ═══
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F8FAFC" }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Cargando datos de la escuela...</p>
        </div>
      </div>
    )
  }

  // Vista detalle de sala
  if (salaSeleccionada) {
    const resumen = calcularResumenSala(salaSeleccionada)
    const alumnosSala = alumnos.filter(a => a.sala === salaSeleccionada)

    return (
      <div className="min-h-screen p-4" style={{ background: "#F8FAFC" }}>
        <div className="max-w-4xl mx-auto">
          <button onClick={() => setSalaSeleccionada(null)} className="flex items-center gap-1.5 text-sm font-medium mb-4" style={{ color: "#D4870E" }}>
            <ArrowLeft className="w-4 h-4" /> Volver a vista escuela
          </button>

          <Card className="shadow-md mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold" style={{ color: "#1e3a5f" }}>
                Sala {resumen.nombre} <span className="text-sm font-normal text-slate-400">· {resumen.nivel} · {resumen.total} alumnos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {(["CF", "CT", "O"] as Eje[]).map(eje => (
                  <div key={eje} className="rounded-xl p-3 text-center border" style={{ borderColor: EJES[eje].color + "30", backgroundColor: EJES[eje].color + "08" }}>
                    <div className="text-lg">{EJES[eje].icon}</div>
                    <div className="text-2xl font-light" style={{ color: EJES[eje].color }}>{resumen.promedios[eje]}%</div>
                    <div className="text-[10px] text-slate-500">{EJES[eje].label}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                {alumnosSala.sort((a, b) => {
                  const pa = getPromedio(a.id, "CF") + getPromedio(a.id, "CT") + getPromedio(a.id, "O")
                  const pb = getPromedio(b.id, "CF") + getPromedio(b.id, "CT") + getPromedio(b.id, "O")
                  return pa - pb
                }).map(al => {
                  const estado = getEstadoGeneral(al.id)
                  const cf = getPromedio(al.id, "CF")
                  const ct = getPromedio(al.id, "CT")
                  const o = getPromedio(al.id, "O")
                  return (
                    <div key={al.id} onClick={() => setAlumnoModal(al.id)} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white cursor-pointer hover:border-slate-300 transition-all">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: estado ? COLORES[estado] : "#d1d5db" }} />
                      <span className="text-sm font-medium flex-1">{al.nombre}</span>
                      <div className="flex gap-2">
                        {(["CF", "CT", "O"] as Eje[]).map(eje => (
                          <span key={eje} className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: EJES[eje].color + "15", color: EJES[eje].color }}>
                            {eje} {eje === "CF" ? cf : eje === "CT" ? ct : o}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {alumnoModal && renderModalAlumno()}
      </div>
    )
  }

  // Modal historial alumno
  function renderModalAlumno() {
    if (!alumnoModal) return null
    const al = alumnos.find(a => a.id === alumnoModal)
    if (!al) return null
    const hist = getHistorial(alumnoModal)

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setAlumnoModal(null)}>
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold" style={{ color: "#1e3a5f" }}>{al.nombre}</h3>
              <p className="text-xs text-slate-500">Sala {al.sala}</p>
            </div>
            <button onClick={() => setAlumnoModal(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">✕</button>
          </div>
          <div className="p-4 space-y-3">
            {(["CF", "CT", "O"] as Eje[]).map(eje => {
              const regs = hist[eje]
              return (
                <div key={eje}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{EJES[eje].icon}</span>
                    <span className="text-xs font-bold" style={{ color: EJES[eje].color }}>{EJES[eje].label}</span>
                    <span className="text-xs text-slate-400 ml-auto">{regs.length} registros</span>
                  </div>
                  {regs.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                      {regs.slice(-10).map((r, i) => (
                        <div key={i} title={`${r.actividad} - ${new Date(r.fecha).toLocaleDateString()}`} className="w-6 h-6 rounded" style={{ backgroundColor: COLORES[r.resultado as Estado] || "#d1d5db" }} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Sin registros</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ═══ VISTA PRINCIPAL: ESCUELA ═══
  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 style={{ fontFamily: "Georgia, serif" }} className="text-xl">
              <span style={{ color: "#D4870E", fontWeight: 700 }}>A</span>
              <span style={{ color: "#1e3a5f" }}>LBA</span>
            </h1>
            <div className="w-px h-5 bg-slate-200" />
            <span className="text-sm font-medium" style={{ color: "#1e3a5f" }}>Vista Dirección</span>
          </div>

          {/* Filtro de eje */}
          <div className="relative">
            <button onClick={() => setShowEjeDropdown(!showEjeDropdown)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
              <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
              <span>{ejeFiltro === "todos" ? "Todos los ejes" : EJES[ejeFiltro].icon + " " + EJES[ejeFiltro].label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {showEjeDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-20 min-w-[180px]">
                <button onClick={() => { setEjeFiltro("todos"); setShowEjeDropdown(false) }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50">Todos los ejes</button>
                {(["CF", "CT", "O"] as Eje[]).map(eje => (
                  <button key={eje} onClick={() => { setEjeFiltro(eje); setShowEjeDropdown(false) }} className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50">
                    {EJES[eje].icon} {EJES[eje].label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-4">

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 text-slate-400" />
              <div className="text-2xl font-light" style={{ color: "#1e3a5f" }}>{totalAlumnos}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Alumnos</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-5 h-5 rounded-full mx-auto mb-1" style={{ backgroundColor: "#22c55e" }} />
              <div className="text-2xl font-light" style={{ color: "#22c55e" }}>{totalVerdes}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Logrado</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="w-5 h-5 rounded-full mx-auto mb-1" style={{ backgroundColor: "#eab308" }} />
              <div className="text-2xl font-light" style={{ color: "#eab308" }}>{totalAmarillos}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">En proceso</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-red-100">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-red-500" />
              <div className="text-2xl font-light text-red-500">{totalRojos}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wide">Refuerzo</div>
            </CardContent>
          </Card>
        </div>

        {/* Barras por sala */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold" style={{ color: "#1e3a5f" }}>
              Estado por sala {ejeFiltro !== "todos" && <span className="text-sm font-normal text-slate-400">· {EJES[ejeFiltro].icon} {EJES[ejeFiltro].label}</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {resumenSalas.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Sin datos. Cargá alumnos en las salas para ver resultados.</p>
            ) : (
              <div className="space-y-3">
                {resumenSalas.map(sala => {
                  const total = sala.verdes + sala.amarillos + sala.rojos + sala.sinDatos
                  const pctV = total > 0 ? (sala.verdes / total) * 100 : 0
                  const pctA = total > 0 ? (sala.amarillos / total) * 100 : 0
                  const pctR = total > 0 ? (sala.rojos / total) * 100 : 0
                  return (
                    <div key={sala.nombre} onClick={() => setSalaSeleccionada(sala.nombre)} className="cursor-pointer hover:bg-slate-50 rounded-xl p-3 transition-all border border-transparent hover:border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm font-semibold" style={{ color: "#1e3a5f" }}>{sala.nombre}</span>
                          <span className="text-xs text-slate-400 ml-2">{sala.nivel} · {sala.total} alumnos</span>
                        </div>
                        <div className="flex gap-2 text-[10px]">
                          <span style={{ color: "#22c55e" }}>{sala.verdes}V</span>
                          <span style={{ color: "#eab308" }}>{sala.amarillos}A</span>
                          <span style={{ color: "#ef4444" }}>{sala.rojos}R</span>
                        </div>
                      </div>
                      <div className="h-4 rounded-full bg-slate-100 overflow-hidden flex">
                        {pctV > 0 && <div style={{ width: `${pctV}%`, backgroundColor: "#22c55e" }} className="h-full transition-all" />}
                        {pctA > 0 && <div style={{ width: `${pctA}%`, backgroundColor: "#eab308" }} className="h-full transition-all" />}
                        {pctR > 0 && <div style={{ width: `${pctR}%`, backgroundColor: "#ef4444" }} className="h-full transition-all" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Foco de atención */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
              <Eye className="w-4 h-4 text-red-500" />
              Foco de atención
              {alumnosEnRiesgo.length > 0 && <span className="text-xs font-normal text-red-400">· {alumnosEnRiesgo.length} alumnos requieren acompañamiento</span>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alumnosEnRiesgo.length === 0 ? (
              <div className="text-center py-6">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-emerald-400" />
                <p className="text-sm text-emerald-600 font-medium">Sin alertas críticas</p>
                <p className="text-xs text-slate-400">Todos los alumnos avanzan dentro de los parámetros esperados.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {alumnosEnRiesgo.map((al, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl border border-red-100 bg-red-50/50">
                    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-500 text-[10px] font-bold shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: "#1e3a5f" }}>{al.nombre}</div>
                      <div className="text-[10px] text-slate-500">Sala {al.sala} · {EJES[al.eje as Eje]?.icon} {al.eje} · {al.semanas}+ registros en rojo</div>
                    </div>
                    <span className="text-sm font-bold text-red-500">{al.promedio}%</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen rápido por eje */}
        <div className="grid grid-cols-3 gap-3">
          {(["CF", "CT", "O"] as Eje[]).map(eje => {
            const totalConDatos = alumnos.filter(a => getPromedio(a.id, eje) > 0).length
            const promGlobal = totalConDatos > 0
              ? Math.round(alumnos.reduce((sum, a) => sum + getPromedio(a.id, eje), 0) / totalConDatos)
              : 0
            return (
              <Card key={eje} className="shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-lg mb-1">{EJES[eje].icon}</div>
                  <div className="text-2xl font-light" style={{ color: EJES[eje].color }}>{promGlobal}%</div>
                  <div className="text-[10px] text-slate-500">{EJES[eje].label}</div>
                  <div className="text-[9px] text-slate-400 mt-1">{totalConDatos} alumnos evaluados</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

      </div>

      {/* ═══ TORTAS: porcentaje por eje y alfabetizacion general ═══ */}
      <div className="max-w-5xl mx-auto px-4 pb-4">
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
              <BarChart3 className="w-4 h-4" style={{ color: "#D4870E" }} />
              Comparacion por eje — distribucion institucional
            </CardTitle>
            <p className="text-xs text-slate-400">Porcentaje de alumnos en cada nivel de logro por eje y promedio general de alfabetizacion</p>
          </CardHeader>
          <CardContent>
            {registros.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Sin datos registrados. Las tortas apareceran cuando la docente evalúe actividades.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-start justify-items-center">
                {/* Torta por cada eje */}
                {(["CF", "CT", "O"] as Eje[]).map(eje => {
                  const alumnosConDatos = alumnos.filter(a => registros.some(r => r.alumno_id === a.id && r.eje === eje))
                  const total = alumnosConDatos.length
                  if (total === 0) return (
                    <div key={eje} className="flex flex-col items-center gap-2">
                      <div className="w-28 h-28 rounded-full border-4 border-slate-100 flex items-center justify-center">
                        <span className="text-xs text-slate-400">Sin datos</span>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: EJES[eje].color }}>{EJES[eje].label}</span>
                    </div>
                  )
                  const v = alumnosConDatos.filter(a => getUltimoEstado(a.id, eje) === "green").length
                  const am = alumnosConDatos.filter(a => getUltimoEstado(a.id, eje) === "yellow").length
                  const r = alumnosConDatos.filter(a => getUltimoEstado(a.id, eje) === "red").length
                  const promedio = total > 0 ? Math.round(((v * 100) + (am * 50) + (r * 10)) / total) : 0
                  const segmentos = [
                    { pct: v / total, color: "#22c55e", label: "Logrado", n: v },
                    { pct: am / total, color: "#eab308", label: "En proceso", n: am },
                    { pct: r / total, color: "#ef4444", label: "Refuerzo", n: r },
                  ]
                  return (
                    <div key={eje} className="flex flex-col items-center gap-3">
                      <TortaSVG segmentos={segmentos} promedio={promedio} color={EJES[eje].color} />
                      <div className="text-center">
                        <p className="text-xs font-bold" style={{ color: EJES[eje].color }}>{EJES[eje].label}</p>
                        <p className="text-[10px] text-slate-400">{total} evaluados</p>
                        <div className="flex gap-2 mt-1 justify-center flex-wrap">
                          {segmentos.map(s => s.n > 0 && (
                            <span key={s.label} className="text-[9px] flex items-center gap-0.5">
                              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                              {s.n}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Torta global de alfabetizacion */}
                {(() => {
                  const alumnosConAlgunDato = alumnos.filter(a => registros.some(r => r.alumno_id === a.id))
                  const total = alumnosConAlgunDato.length
                  if (total === 0) return null
                  const v = alumnosConAlgunDato.filter(a => getEstadoGeneral(a.id) === "green").length
                  const am = alumnosConAlgunDato.filter(a => getEstadoGeneral(a.id) === "yellow").length
                  const r = alumnosConAlgunDato.filter(a => getEstadoGeneral(a.id) === "red").length
                  const promedio = total > 0 ? Math.round(((v * 100) + (am * 50) + (r * 10)) / total) : 0
                  const segmentos = [
                    { pct: v / total, color: "#22c55e", label: "Logrado", n: v },
                    { pct: am / total, color: "#eab308", label: "En proceso", n: am },
                    { pct: r / total, color: "#ef4444", label: "Refuerzo", n: r },
                  ]
                  return (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <TortaSVG segmentos={segmentos} promedio={promedio} color="#1e3a5f" size={116} />
                        <div className="absolute -top-1 -right-1 bg-amber-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                          GENERAL
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold" style={{ color: "#1e3a5f" }}>Alfabetizacion General</p>
                        <p className="text-[10px] text-slate-400">Promedio de los 3 ejes</p>
                        <div className="flex gap-2 mt-1 justify-center flex-wrap">
                          {segmentos.map(s => s.n > 0 && (
                            <span key={s.label} className="text-[9px] flex items-center gap-0.5">
                              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: s.color }} />
                              {s.n}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <footer className="py-3 px-4 text-center text-xs text-slate-400 border-t border-slate-200 mt-6">
        ALBA · Vista Dirección · {totalRegistros} registros acumulados
      </footer>

      {alumnoModal && renderModalAlumno()}
    </div>
  )
}
