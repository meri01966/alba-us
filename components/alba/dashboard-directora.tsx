"use client"

import { useState, useEffect } from "react"

type Eje = "CF" | "CT" | "O"
type Estado = "green" | "yellow" | "red"

interface Registro {
  id: string
  alumno_id: string
  alumno_nombre?: string
  eje: string
  resultado: string
  actividad: string
  fecha: string
  sala?: string
}

interface Alumno {
  id: string
  nombre: string
  sala: string
}

const EJES: Record<Eje, { label: string; color: string }> = {
  CF: { label: "Conciencia Fonologica", color: "#3b82f6" },
  CT: { label: "Comprension de Textos", color: "#10b981" },
  O:  { label: "Oralidad", color: "#f59e0b" },
}

const SALAS = ["Manzanos", "Girasoles", "Álamos", "Nogales TT", "Nogales TM", "SALADEPRUEBA"]
const COLORES: Record<Estado, string> = { green: "#22c55e", yellow: "#eab308", red: "#ef4444" }

function Torta({ pct, color, size = 110 }: { pct: number; color: string; size?: number }) {
  const r = size * 0.38
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const cx = size / 2
  const cy = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e2e8f0" strokeWidth={size * 0.12} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={size * 0.12}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="butt" transform={`rotate(-90 ${cx} ${cy})`} />
      <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.2} fontWeight="600" fill={color}>{pct}%</text>
    </svg>
  )
}

export default function DashboardDirectora() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)
  const [ultimaAct, setUltimaAct] = useState("")
  const [salaSeleccionada, setSalaSeleccionada] = useState<string | null>(null)
  const [alumnoModal, setAlumnoModal] = useState<Alumno | null>(null)
  const [ejeFiltro, setEjeFiltro] = useState<"todos" | Eje>("todos")

  async function cargarDatos() {
    try {
      const base = typeof window !== "undefined" ? window.location.origin : ""
      const res = await fetch(`${base}/api/directora-data`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })
      if (!res.ok) {
        console.log("[v0] directora-data status:", res.status, res.statusText)
        setLoading(false)
        return
      }
      const json = await res.json()
      console.log("[v0] directora-data ok:", json.ok, "alumnos:", json.alumnos?.length, "regs:", json.registros?.length)
      if (json.ok) {
        setAlumnos(json.alumnos || [])
        setRegistros(json.registros || [])
        setUltimaAct(new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }))
      }
    } catch (e) {
      console.log("[v0] Error cargando datos directora:", e)
    }
    setLoading(false)
  }

  useEffect(() => {
    cargarDatos()
    const interval = setInterval(cargarDatos, 5000)
    return () => clearInterval(interval)
  }, [])

  function getUltimoResultado(alumnoId: string, eje?: string): Estado | null {
    let regs = registros.filter(r => r.alumno_id === alumnoId)
    if (eje) regs = regs.filter(r => r.eje === eje)
    if (regs.length === 0) return null
    return regs[regs.length - 1].resultado as Estado
  }

  function getPct(alumnoId: string, eje: string): number {
    const regs = registros.filter(r => r.alumno_id === alumnoId && r.eje === eje)
    if (regs.length === 0) return 0
    const v = regs.filter(r => r.resultado === "green").length
    return Math.round((v / regs.length) * 100)
  }

  function getEstadoGeneral(alumnoId: string): Estado | null {
    if (ejeFiltro !== "todos") return getUltimoResultado(alumnoId, ejeFiltro)
    const cf = getPct(alumnoId, "CF")
    const ct = getPct(alumnoId, "CT")
    const o = getPct(alumnoId, "O")
    if (cf === 0 && ct === 0 && o === 0) return null
    const prom = (cf + ct + o) / 3
    if (prom >= 65) return "green"
    if (prom >= 35) return "yellow"
    return "red"
  }

  function statsSala(sala: string, eje?: string) {
    const idsSala = alumnos.filter(a => a.sala === sala).map(a => a.id)
    if (idsSala.length === 0) return null
    const regs = eje
      ? registros.filter(r => idsSala.includes(r.alumno_id) && r.eje === eje)
      : registros.filter(r => idsSala.includes(r.alumno_id))
    if (regs.length === 0) return null
    const v = regs.filter(r => r.resultado === "green").length
    const am = regs.filter(r => r.resultado === "yellow").length
    const ro = regs.filter(r => r.resultado === "red").length
    return { total: regs.length, v, am, ro, pct: Math.round((v / regs.length) * 100) }
  }

  // KPIs globales
  const conDatos = alumnos.filter(a => registros.some(r => r.alumno_id === a.id))
  const totalV = conDatos.filter(a => getEstadoGeneral(a.id) === "green").length
  const totalAm = conDatos.filter(a => getEstadoGeneral(a.id) === "yellow").length
  const totalR = conDatos.filter(a => getEstadoGeneral(a.id) === "red").length
  const pctGlobal = registros.length > 0
    ? Math.round((registros.filter(r => r.resultado === "green").length / registros.length) * 100)
    : 0

  // Alertas basadas en datos reales
  const alertas: { sala: string; eje?: string; msg: string; urgencia: "alta" | "media" }[] = []
  SALAS.forEach(sala => {
    const ejes: Eje[] = ["CF", "CT", "O"]
    ejes.forEach(eje => {
      const s = statsSala(sala, eje)
      if (!s || s.total < 3) return
      if (s.pct < 35) alertas.push({ sala, eje, msg: `Solo ${s.pct}% de logro en ${EJES[eje].label}.`, urgencia: "alta" })
      if (s.ro >= 3 && s.ro > s.total * 0.4) alertas.push({ sala, eje, msg: `${s.ro} alumnos en rojo en ${EJES[eje].label}.`, urgencia: "alta" })
    })
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Cargando datos institucionales...</p>
        </div>
      </div>
    )
  }

  // Vista detalle de sala
  if (salaSeleccionada) {
    const alumnosSala = alumnos.filter(a => a.sala === salaSeleccionada)
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSalaSeleccionada(null)} className="text-sm font-medium flex items-center gap-1" style={{ color: "#D4870E" }}>
            ← Volver
          </button>
          <span className="text-sm font-semibold" style={{ color: "#1e3a5f" }}>Sala {salaSeleccionada}</span>
        </div>
        <div className="max-w-3xl mx-auto p-4 space-y-4">
          {/* Promedios por eje */}
          <div className="grid grid-cols-3 gap-3">
            {(["CF", "CT", "O"] as Eje[]).map(eje => {
              const s = statsSala(salaSeleccionada, eje)
              return (
                <div key={eje} className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded text-white mb-1" style={{ backgroundColor: EJES[eje].color }}>{eje}</span>
                  <p className="text-2xl font-bold" style={{ color: EJES[eje].color }}>{s ? s.pct : 0}%</p>
                  <p className="text-[10px] text-slate-400">{EJES[eje].label}</p>
                </div>
              )
            })}
          </div>
          {/* Lista alumnos */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {alumnosSala.length === 0 ? (
              <p className="p-4 text-sm text-slate-400 text-center">Sin alumnos registrados en esta sala.</p>
            ) : alumnosSala.map(al => {
              const estado = getEstadoGeneral(al.id)
              return (
                <div key={al.id} onClick={() => setAlumnoModal(al)} className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: estado ? COLORES[estado] : "#d1d5db" }} />
                  <span className="text-sm font-medium flex-1 text-slate-700">{al.nombre}</span>
                  <div className="flex gap-1.5">
                    {(["CF", "CT", "O"] as Eje[]).map(eje => {
                      const pct = getPct(al.id, eje)
                      if (pct === 0) return null
                      return (
                        <span key={eje} className="text-[9px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: EJES[eje].color }}>
                          {eje} {pct}%
                        </span>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        {/* Modal historial */}
        {alumnoModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setAlumnoModal(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">{alumnoModal.nombre}</p>
                  <p className="text-xs text-slate-400">{alumnoModal.sala}</p>
                </div>
                <button onClick={() => setAlumnoModal(null)} className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-xs">✕</button>
              </div>
              <div className="p-4 space-y-4">
                {(["CF", "CT", "O"] as Eje[]).map(eje => {
                  const regs = registros.filter(r => r.alumno_id === alumnoModal.id && r.eje === eje)
                  return (
                    <div key={eje}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: EJES[eje].color }}>{eje}</span>
                        <span className="text-xs text-slate-500">{EJES[eje].label}</span>
                        <span className="text-[10px] text-slate-300 ml-auto">{regs.length} registros</span>
                      </div>
                      {regs.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {regs.slice(-12).map((r, i) => (
                            <div key={i} title={r.actividad} className="w-6 h-6 rounded"
                              style={{ backgroundColor: COLORES[r.resultado as Estado] || "#d1d5db" }} />
                          ))}
                        </div>
                      ) : <p className="text-xs text-slate-300">Sin datos</p>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Vista principal
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#1e3a5f" }}>D</div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#1e3a5f" }}>ALBA — Vista Direccion</p>
            <p className="text-[10px] text-slate-400">Toda la escuela en tiempo real</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {ultimaAct && <span className="text-[10px] text-slate-400">Actualizado {ultimaAct}</span>}
          <div className="flex gap-1">
            {(["todos", "CF", "CT", "O"] as const).map(e => (
              <button key={e} onClick={() => setEjeFiltro(e)}
                className="text-[10px] font-bold px-2 py-1 rounded transition-all"
                style={{
                  backgroundColor: ejeFiltro === e ? (e === "todos" ? "#1e3a5f" : EJES[e]?.color) : "#f1f5f9",
                  color: ejeFiltro === e ? "#fff" : "#64748b"
                }}>
                {e === "todos" ? "Todo" : e}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 space-y-5">

        {/* Alertas */}
        {alertas.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
            <p className="text-xs font-semibold text-red-700 mb-2">Situaciones que requieren atencion</p>
            <div className="space-y-1">
              {alertas.slice(0, 6).map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-red-700 bg-red-100 rounded-lg px-3 py-1.5">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  <span><b>{a.sala}</b>{a.eje && <span className="ml-1 bg-white px-1 rounded text-[10px] font-bold" style={{ color: EJES[a.eje as Eje]?.color }}>{a.eje}</span>} — {a.msg}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Alumnos", value: conDatos.length, color: "#1e3a5f" },
            { label: "Logrado", value: totalV, color: "#22c55e" },
            { label: "En proceso", value: totalAm, color: "#eab308" },
            { label: "Refuerzo", value: totalR, color: "#ef4444" },
          ].map(k => (
            <div key={k.label} className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
              <p className="text-2xl font-bold" style={{ color: k.color }}>{k.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{k.label}</p>
            </div>
          ))}
        </div>

        {registros.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-100 p-10 text-center shadow-sm">
            <p className="text-slate-400 text-sm">Sin evaluaciones registradas todavia.</p>
            <p className="text-slate-300 text-xs mt-1">Las docentes deben evaluar actividades para que aparezcan los datos aqui.</p>
          </div>
        )}

        {/* Tabla por sala */}
        {registros.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <p className="px-4 py-3 text-sm font-semibold border-b border-slate-100" style={{ color: "#1e3a5f" }}>Estado por sala — click para ver detalle</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs text-slate-400">
                    <th className="text-left px-4 py-2 font-medium">Sala</th>
                    {(["CF", "CT", "O"] as Eje[]).map(eje => (
                      <th key={eje} className="text-center px-3 py-2 font-medium">
                        <span className="inline-block px-2 py-0.5 rounded text-white text-[10px] font-bold" style={{ backgroundColor: EJES[eje].color }}>{eje}</span>
                      </th>
                    ))}
                    <th className="text-center px-3 py-2 font-medium">General</th>
                  </tr>
                </thead>
                <tbody>
                  {SALAS.map(sala => {
                    const s = statsSala(sala)
                    if (!s) return null
                    return (
                      <tr key={sala} onClick={() => setSalaSeleccionada(sala)} className="border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                        <td className="px-4 py-3 font-medium text-slate-700">{sala}</td>
                        {(["CF", "CT", "O"] as Eje[]).map(eje => {
                          const se = statsSala(sala, eje)
                          if (!se) return <td key={eje} className="px-3 py-3 text-center text-slate-200 text-xs">—</td>
                          return (
                            <td key={eje} className="px-3 py-3">
                              <div className="flex items-center gap-1 justify-center">
                                <div className="w-14 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                  <div className="h-full rounded-full" style={{ width: `${se.pct}%`, backgroundColor: EJES[eje].color }} />
                                </div>
                                <span className="text-xs text-slate-500">{se.pct}%</span>
                              </div>
                            </td>
                          )
                        })}
                        <td className="px-3 py-3 text-center">
                          <span className="text-xs font-bold" style={{ color: s.pct >= 65 ? "#22c55e" : s.pct >= 35 ? "#eab308" : "#ef4444" }}>{s.pct}%</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tortas */}
        {registros.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <p className="text-sm font-semibold mb-4" style={{ color: "#1e3a5f" }}>Distribucion institucional por eje</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 justify-items-center">
              {(["CF", "CT", "O"] as Eje[]).map(eje => {
                const regs = registros.filter(r => r.eje === eje)
                if (regs.length === 0) return (
                  <div key={eje} className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-full border-4 border-slate-100 flex items-center justify-center">
                      <span className="text-xs text-slate-300">Sin datos</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: EJES[eje].color }}>{eje}</span>
                  </div>
                )
                const pct = Math.round((regs.filter(r => r.resultado === "green").length / regs.length) * 100)
                return (
                  <div key={eje} className="flex flex-col items-center gap-1">
                    <Torta pct={pct} color={EJES[eje].color} />
                    <p className="text-xs font-semibold text-center" style={{ color: EJES[eje].color }}>{EJES[eje].label}</p>
                    <p className="text-[10px] text-slate-400">{regs.length} evaluaciones</p>
                  </div>
                )
              })}
              <div className="flex flex-col items-center gap-1">
                <div className="relative">
                  <Torta pct={pctGlobal} color="#1e3a5f" />
                  <span className="absolute -top-1 -right-1 bg-amber-400 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">TOTAL</span>
                </div>
                <p className="text-xs font-semibold text-center" style={{ color: "#1e3a5f" }}>Alfabetizacion General</p>
                <p className="text-[10px] text-slate-400">{registros.length} evaluaciones totales</p>
              </div>
            </div>
          </div>
        )}

        {/* Top alumnos en riesgo */}
        {registros.length > 0 && (() => {
          const enRiesgo = registros.filter(r => r.resultado === "red")
          const unicos = Array.from(new Map(enRiesgo.map(r => [`${r.alumno_id}-${r.eje}`, r])).values()).slice(0, 10)
          if (unicos.length === 0) return null
          return (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <p className="text-sm font-semibold text-red-700">Alumnos que necesitan atencion</p>
              </div>
              <div className="divide-y divide-slate-50">
                {unicos.map((r, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-slate-700">{r.alumno_nombre || "Alumno"}</span>
                      <span className="ml-2 text-xs text-slate-400">{r.sala}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: EJES[r.eje as Eje]?.color || "#94a3b8" }}>{r.eje}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}

      </div>
    </div>
  )
}
// Sun May 17 23:21:22 UTC 2026
