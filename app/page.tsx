"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import useSWR, { mutate as globalMutate } from "swr"
import { FileText, X, UserPlus, ChevronDown, Users, Sparkles, Pencil, Trash2, Check, CalendarDays, MessageSquare, Settings } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { Header } from "@/components/sia/header"
import { HeatMap } from "@/components/sia/heat-map"
import { DayPlanning, type DayPlanningHandle } from "@/components/sia/day-planning"
import { MicroTraining } from "@/components/sia/micro-training"
import { QuickRegister } from "@/components/sia/quick-register"
import { CronogramaSemanal } from "@/components/sia/cronograma-semanal"
import { CronogramaInlinePreview } from "@/components/sia/cronograma-inline-preview"
import ClassEvaluation from "@/components/alba/class-evaluation"
import SalaMap from "@/components/alba/sala-map"
import StudentProfile from "@/components/alba/student-profile"
import { PlanificacionModal } from "@/components/alba/planificacion-modal"
import { AlertasPedagogicas, type AlertaPedagogica } from "@/components/alba/alertas-pedagogicas"

type ViewType = "clase" | "evaluar" | "mapa" | "perfil"
type StatusLevel = "green" | "yellow" | "red" | "blue"

// Progreso por eje: null = sin datos, number = promedio acumulado 0-100
type EjeProgress = { CF: number | null; CT: number | null; O: number | null }

// Mapeo de actividad a eje pedagogico
// "Reconocimiento de Letras" -> CF (Conciencia Fonologica)
const ACTIVIDAD_EJE_MAP: Record<string, "CF" | "CT" | "O"> = {
  "Reconocimiento de Letras": "CF",
  "Sonidos de Letras": "CF",
  "Rimas": "CF",
  "Lectura Compartida": "CT",
  "Narracion Oral": "O",
}

// default (sin evaluar) = 0 -> gris en el mapa hasta que la docente marque
function statusToProgress(status: StatusLevel | undefined): number {
  switch (status) {
    case "blue":   return 0    // Ausente
    case "red":    return 10   // Necesita refuerzo
    case "yellow": return 50   // En proceso
    case "green":  return 100  // Logrado
    default:       return 0    // Sin evaluar = gris
  }
}

// Key para localStorage
const STORAGE_KEY = "alba_evaluaciones_dia"
const STORAGE_PROGRESS_KEY = "alba_progreso"
const STORAGE_STUDENTS_KEY = "alba_students" // Para modo demo sin Supabase
// Alertas marcadas como atendidas — se guardan por sala para que no reaparezcan al recargar
const STORAGE_ALERTAS_ATENDIDAS_KEY = "alba_alertas_atendidas"
const getAlertasAtendidas = (sala: string): string[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_ALERTAS_ATENDIDAS_KEY}_${sala}`)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}
const addAlertaAtendida = (sala: string, id: string) => {
  try {
    const actuales = getAlertasAtendidas(sala)
    if (!actuales.includes(id)) {
      localStorage.setItem(`${STORAGE_ALERTAS_ATENDIDAS_KEY}_${sala}`, JSON.stringify([...actuales, id]))
    }
  } catch { /* noop */ }
}

// Actividad del dia para el reporte
const ACTIVIDAD_DEL_DIA = "Reconocimiento de Sonido Inicial /M/"

// ── Colores por eje
const COLOR_EJE: Record<string, string> = {
  CF: "#3b82f6",
  CT: "#10b981",
  O: "#f59e0b",
}
const BG_EJE: Record<string, string> = {
  CF: "#eff6ff",
  CT: "#f0fdf4",
  O: "#fffbeb",
}
const NOMBRE_EJE_SHORT: Record<string, string> = {
  CF: "Conciencia Fonologica",
  CT: "Comprension de Textos",
  O:  "Oralidad",
}

// ── Sintesis Pedagogica Grupal - informe para reunion de padres
function SintesisPedagogicaModal({ 
  totalStudents,
  salaName,
  onClose 
}: { 
  totalStudents: number
  salaName: string
  onClose: () => void 
}) {
  const [loading, setLoading] = useState(true)
  const [reporte, setReporte] = useState<{
    sinDatos: boolean
    mensaje?: string
    sala?: string
    totalAlumnos?: number
    totalClases?: number
    periodoDesde?: string | null
    periodoHasta?: string | null
    ejes: Array<{
      eje: string
      nombre: string
      totalClases: number
      actividadesUnicas: string[]
      periodoDesde: string | null
      periodoHasta: string | null
      pctLogrado: number
      pctProceso: number
      pctRefuerzo: number
      promedioGrupal: number
      tendencia: "mejorando" | "estable" | "necesita_apoyo"
      txt_queTrabajaamos: string
      txt_comoLoTrabajaamos: string
      txt_queAprendioElGrupo: string
      sugerenciasContinuacion: string[]
    }>
  } | null>(null)

  useEffect(() => {
    async function fetchReporte() {
      try {
        const res = await fetch(`/api/reporte-grupal?sala=${encodeURIComponent(salaName)}`)
        const data = await res.json()
        setReporte(data)
      } catch (err) {
        console.error("[v0] Error fetching reporte grupal:", err)
        setReporte({ sinDatos: true, ejes: [], mensaje: "Error al cargar el reporte. Intenta nuevamente." })
      } finally {
        setLoading(false)
      }
    }
    fetchReporte()
  }, [salaName])

  const tendenciaLabel = (t: string) => {
    if (t === "mejorando") return { label: "Mejorando", color: "#10b981", bg: "#ecfdf5" }
    if (t === "necesita_apoyo") return { label: "Necesita apoyo", color: "#ef4444", bg: "#fef2f2" }
    return { label: "Estable", color: "#f59e0b", bg: "#fffbeb" }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100" style={{ background: "#1e3a5f" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">
                Sintesis Pedagogica Grupal
              </h2>
              <p className="text-sm text-white/70">
                Sala {salaName} &middot; {totalStudents} alumnos &middot; Informe para reunion de padres
              </p>
            </div>
            <button 
              onClick={onClose}
              type="button"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-5 text-slate-700 leading-relaxed max-h-[75vh] overflow-y-auto">
          
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-6 h-6 border-2 border-slate-300 border-t-slate-700 rounded-full" />
              <span className="ml-3 text-sm text-slate-500">ALBA esta analizando los datos de la sala...</span>
            </div>
          )}

          {!loading && reporte?.sinDatos && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="font-semibold text-slate-600 mb-2">Aun no hay actividades evaluadas</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {reporte.mensaje || "El informe grupal se generara automaticamente cuando la docente registre evaluaciones en el aula."}
              </p>
            </div>
          )}

          {!loading && reporte && !reporte.sinDatos && reporte.ejes.length > 0 && (
            <>
              {/* Resumen cabecera */}
              <div className="rounded-xl p-4 border border-slate-200 bg-slate-50">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>{reporte.totalAlumnos ?? totalStudents}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Alumnos del grupo</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>{reporte.totalClases ?? "—"}</p>
                    <p className="text-xs text-slate-500 mt-0.5">Clases con evaluacion</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: "#1e3a5f" }}>{reporte.ejes.length}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{reporte.ejes.length === 1 ? "Eje trabajado" : "Ejes trabajados"}</p>
                  </div>
                </div>
                {reporte.periodoDesde && (
                  <p className="text-xs text-center text-slate-400 mt-3">
                    Periodo: {reporte.periodoDesde}{reporte.periodoHasta && reporte.periodoHasta !== reporte.periodoDesde ? " al " + reporte.periodoHasta : ""}
                  </p>
                )}
              </div>

              {/* Un bloque por eje */}
              {reporte.ejes.map((eje) => {
                const tend = tendenciaLabel(eje.tendencia)
                return (
                  <section key={eje.eje} className="rounded-xl border overflow-hidden" style={{ borderColor: COLOR_EJE[eje.eje] + "50" }}>
                    {/* Cabecera eje */}
                    <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: BG_EJE[eje.eje] }}>
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: COLOR_EJE[eje.eje] }}>
                          {eje.eje}
                        </span>
                        <span className="font-bold text-sm" style={{ color: COLOR_EJE[eje.eje] }}>{eje.nombre}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: tend.bg, color: tend.color }}
                        >
                          {tend.label}
                        </span>
                        <span className="text-xs text-slate-500">{eje.totalClases} {eje.totalClases === 1 ? "clase" : "clases"}</span>
                      </div>
                    </div>

                    <div className="bg-white divide-y divide-slate-100">
                      {/* Barra de progreso grupal */}
                      <div className="px-4 py-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Nivel grupal acumulado</span>
                          <span className="text-sm font-bold" style={{ color: eje.promedioGrupal >= 70 ? "#10b981" : eje.promedioGrupal >= 40 ? "#f59e0b" : "#ef4444" }}>
                            {eje.promedioGrupal}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full transition-all"
                            style={{
                              width: eje.promedioGrupal + "%",
                              backgroundColor: eje.promedioGrupal >= 70 ? "#10b981" : eje.promedioGrupal >= 40 ? "#f59e0b" : "#ef4444",
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1.5 text-xs">
                          <span style={{ color: "#10b981" }}>{eje.pctLogrado}% logrado</span>
                          <span style={{ color: "#f59e0b" }}>{eje.pctProceso}% en proceso</span>
                          <span style={{ color: "#ef4444" }}>{eje.pctRefuerzo}% refuerzo</span>
                        </div>
                      </div>

                      {/* Seccion 1: Que trabajamos */}
                      <div className="px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: COLOR_EJE[eje.eje] }}>
                          Que trabajamos
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">{eje.txt_queTrabajaamos}</p>
                        {eje.actividadesUnicas.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {eje.actividadesUnicas.map((act, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-0.5 rounded-full"
                                style={{ backgroundColor: BG_EJE[eje.eje], color: COLOR_EJE[eje.eje], border: `1px solid ${COLOR_EJE[eje.eje]}30` }}
                              >
                                {act}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Seccion 2: Como lo trabajamos */}
                      <div className="px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: COLOR_EJE[eje.eje] }}>
                          Como lo trabajamos
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">{eje.txt_comoLoTrabajaamos}</p>
                      </div>

                      {/* Seccion 3: Que aprendio el grupo */}
                      <div className="px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: COLOR_EJE[eje.eje] }}>
                          Que aprendio el grupo
                        </p>
                        <p className="text-sm text-slate-700 leading-relaxed">{eje.txt_queAprendioElGrupo}</p>
                      </div>

                      {/* Seccion 4: Para seguir trabajando */}
                      <div className="px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: COLOR_EJE[eje.eje] }}>
                          Para seguir trabajando
                        </p>
                        <ul className="space-y-1.5">
                          {eje.sugerenciasContinuacion.map((sug, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLOR_EJE[eje.eje] }} />
                              {sug}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </section>
                )
              })}

              {/* Nota al pie */}
              {reporte.ejes.length < 3 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-700">
                    Este informe incluye solo los ejes evaluados hasta la fecha.{" "}
                    {["CF", "CT", "O"]
                      .filter(e => !reporte.ejes.find(r => r.eje === e))
                      .map(e => NOMBRE_EJE_SHORT[e])
                      .join(" y ")}{" "}
                    se incluira cuando la docente registre evaluaciones en esos ejes.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <p className="text-xs text-slate-400 text-center">
            Informe grupal generado por ALBA a partir de los datos evaluados en el aula. Solo se reportan los ejes efectivamente trabajados.
          </p>
        </div>
      </div>
    </div>
  )
}

// Salas disponibles
const SALAS_DISPONIBLES = ["Manzanos", "Girasoles", "Alamos", "Nogales TM", "Nogales TT", "SALADEPRUEBA"]

export default function ALBADashboard({ forzarSala }: { forzarSala?: string } = {}) {
  const [activeView, setActiveView] = useState<ViewType>("clase")
  const [students, setStudents] = useState<any[]>([])
  const [progress, setProgress] = useState<Record<string, EjeProgress>>({})
  // Ref al componente DayPlanning para llamar fetchBrain directamente con timing correcto
  const dayPlanningRef = useRef<DayPlanningHandle>(null)

  // Inicializar progreso de alumno con null (sin datos) - solo se actualiza con evaluacion explicita
  function initProgress(_studentId: string): EjeProgress {
    return { CF: null, CT: null, O: null }
  }

  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [selectedStudentName, setSelectedStudentName] = useState<string>("")
  const [showSintesis, setShowSintesis] = useState(false)
  const [showPlanificacion, setShowPlanificacion] = useState(false)
  const [showAlertas, setShowAlertas] = useState(false)
  const [showCronograma, setShowCronograma] = useState(false)
  const [cronogramaRefreshKey, setCronogramaRefreshKey] = useState(0)
  const [alertasPedagogicas, setAlertasPedagogicas] = useState<AlertaPedagogica[]>([])
  // sugerenciaAlba ya no se usa para texto - la actividad viene via onActividadALBA
  const [_sugerenciaAlba, _setSugerenciaAlba] = useState("")
  // Toast de confirmacion al finalizar jornada (reemplaza alert)
  const [jornadaToast, setJornadaToast] = useState<{ tipo: "ok" | "error"; mensaje: string } | null>(null)
  
  // Gestion de sala — persiste en localStorage para no volver al inicio al recargar
  const [salaActual, setSalaActual] = useState(forzarSala || "Manzanos")
  const [salaHydrated, setSalaHydrated] = useState(false)
  const esMaestra = typeof window !== "undefined" && localStorage.getItem("alba_sesion_rol") === "maestra"
  
  // Cargar sala: el parametro ?sala=X de la URL tiene prioridad (links directos
  // para cada maestra). Si no hay, se usa la ultima sala guardada en localStorage.
  useEffect(() => {
    // Modo demo: si la sala viene forzada por prop, fijarla y no permitir cambios
    if (forzarSala) {
      setSalaActual(forzarSala)
      setSalaHydrated(true)
      return
    }
    const params = new URLSearchParams(window.location.search)
    const salaParam = params.get("sala")
    // Buscar coincidencia sin distinguir mayusculas/acentos para ser tolerante
    const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    const salaFromUrl = salaParam
      ? SALAS_DISPONIBLES.find((s) => norm(s) === norm(salaParam))
      : undefined

    if (salaFromUrl) {
      setSalaActual(salaFromUrl)
      localStorage.setItem("sia-sala-activa", salaFromUrl)
    } else {
      const savedSala = localStorage.getItem("sia-sala-activa")
      if (savedSala && SALAS_DISPONIBLES.includes(savedSala)) {
        setSalaActual(savedSala)
      }
    }
    setSalaHydrated(true)
  }, [])
  const [showSalaDropdown, setShowSalaDropdown] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showConfigSala, setShowConfigSala] = useState(false)
  const [newStudentName, setNewStudentName] = useState("")
  const [addingStudent, setAddingStudent] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [bulkNames, setBulkNames] = useState("")
  const [addingBulk, setAddingBulk] = useState(false)
  const [showEditList, setShowEditList] = useState(false)
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  
  // Estado centralizado de evaluaciones del dia (persistido en localStorage)
  const [evaluaciones, setEvaluaciones] = useState<Record<string, StatusLevel>>({})
  
  // Eje actual seleccionado en el HeatMap (para conectar con DayPlanning)
  const [ejeActual, setEjeActual] = useState<string>("CF")
  
  // Actividad actual que esta evaluando el docente
  const [actividadActual, setActividadActual] = useState<string>("Reconocimiento de Sonido Inicial /M/")
  
  // Actividad sugerida por ALBA (para comparar en el cierre)
  const [actividadSugeridaALBA, setActividadSugeridaALBA] = useState<string>("")
  
  // Historial del mes para el calendario completo
  const [historialMes, setHistorialMes] = useState<Array<{
    fecha: string
    eje: "CF" | "CT" | "O" | null
    actividadDocente: string | null
    actividadALBA: string | null
    completado: boolean
  }>>([])

  // Mensajes de la directora hacia la maestra
  const [marcandoLeido, setMarcandoLeido] = useState<string | null>(null)  // Cargar evaluaciones de hoy desde Supabase para la sala actual
  // Los botones del Registro de Clase arrancan siempre vacios al cargar la pagina.
  // Son el "pizarron del dia" — se usan solo durante la clase en curso.
  // Solo se persisten en el historial (Mapa de Progreso) al presionar Finalizar Jornada.
  const cargarEvaluacionesDeSala = useCallback(async (_sala: string) => {
    // Intencional: no restaurar evaluaciones del dia anterior.
    // El pizarron empieza limpio siempre.
    setEvaluaciones({})
  }, [])
  
  // Cargar historial del mes al cambiar de sala
  const fetchHistorialMes = useCallback(async () => {
    try {
      const hoy = new Date()
      // Cargar desde hace 2 meses hasta 1 mes adelante
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth() - 2, 1)
      const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0)
      
      const res = await fetch(`/api/historial-semana?sala=${encodeURIComponent(salaActual)}&desde=${inicio.toISOString().split("T")[0]}&hasta=${fin.toISOString().split("T")[0]}`)
      const data = await res.json()
      
      if (data.registros) {
        setHistorialMes(data.registros.map((r: { fecha: string; eje: string; actividad_docente: string; actividad_alba: string }) => ({
          fecha: r.fecha.split("T")[0],
          eje: r.eje as "CF" | "CT" | "O",
          actividadDocente: r.actividad_docente,
          actividadALBA: r.actividad_alba,
          completado: true,
        })))
      }
    } catch (err) {
      console.error("Error cargando historial mes:", err)
    }
  }, [salaActual])
  
  
  
  // Callback cuando ALBA cambia la actividad sugerida
  // Limpia los botones del dia (pizarron nuevo) pero NO toca el Mapa de Progreso
  const handleActividadChange = useCallback((actividad: string, eje: string) => {
    setActividadActual(actividad)
    setEjeActual(eje)
    setEvaluaciones({})
    localStorage.removeItem(STORAGE_KEY)
  }, [])
  
  // Finalizar semana completa (solo sala de prueba, sin confirmación)
  // Finalizar jornada: guarda evaluaciones y avanza a siguiente día
  const handleRegistroCierre = useCallback(async (datos: { evaluacion: string; observaciones: string; sugerencia: string }) => {
    const ejeDelDia = ejeActual
    const actividadDelDia = actividadSugeridaALBA || actividadActual

    // Si la actividad no se realizo, solo registrar el cierre
    if (datos.evaluacion === "no_realizada") {
      try {
        await fetch("/api/registro-cierre", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            actividadALBA: actividadDelDia,
            actividadDocente: actividadDelDia,
            eje: ejeDelDia,
            sala: salaActual,
            evaluacionGeneral: "no_realizada",
            observaciones: datos.observaciones,
            sugerenciaParaIA: datos.sugerencia,
            stats: { green: 0, yellow: 0, red: 0, ausentes: students.length },
          }),
        })
      } catch (e) {
        console.error("[v0] Error guardando no_realizada:", e)
      }
      setJornadaToast({ tipo: "ok", mensaje: "Registrado. ALBA volvera a sugerir esta actividad en la proxima planificacion." })
      setTimeout(() => setJornadaToast(null), 4000)
      return
    }

    // Marcar como verde a todos los sin evaluacion explicita
    const sinEvaluar = students.filter(s => !evaluaciones[s.id])
    const evaluacionesFinales = { ...evaluaciones }
    const nuevoProgress = { ...progress }

    for (const s of sinEvaluar) {
      evaluacionesFinales[s.id] = "green"
      const anterior = nuevoProgress[s.id]?.[ejeDelDia as "CF" | "CT" | "O"] ?? null
      nuevoProgress[s.id] = {
        ...(nuevoProgress[s.id] || initProgress(s.id)),
        [ejeDelDia]: anterior !== null ? Math.round((anterior + 100) / 2) : 100,
      }
      try {
        await fetch("/api/seguimiento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alumno_id: s.id, eje: ejeDelDia, estado: "green", sala: salaActual, actividad: actividadDelDia }),
        })
      } catch (e) {
        console.error("[v0] Error guardando verde:", e)
      }
    }

    setEvaluaciones(evaluacionesFinales)

    // Calcular stats
    const statsVerdes  = Object.values(evaluacionesFinales).filter(e => e === "green").length
    const statsAmarillos = Object.values(evaluacionesFinales).filter(e => e === "yellow").length
    const statsRojos   = Object.values(evaluacionesFinales).filter(e => e === "red").length
    const statsAusentes = Object.values(evaluacionesFinales).filter(e => e === "blue").length

    // Guardar registro de cierre
    try {
      const response = await fetch("/api/registro-cierre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actividadALBA: actividadDelDia,
          actividadDocente: actividadDelDia,
          eje: ejeDelDia,
          sala: salaActual,
          evaluacionGeneral: datos.evaluacion,
          observaciones: datos.observaciones,
          sugerenciaParaIA: datos.sugerencia,
          stats: { green: statsVerdes, yellow: statsAmarillos, red: statsRojos, ausentes: statsAusentes },
        }),
      })
      const data = await response.json()

      if (data.success) {
        // Finalizar la jornada: el backend marca el DÍA ACTIVO del cronograma
        // (el primer día pendiente con actividad de ALBA), garantizando que
        // avanza en la misma secuencia que se muestra en el dashboard.
        try {
          const patchRes = await fetch("/api/cronograma-jardin", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sala: salaActual }),
          })
          await patchRes.json()
        } catch (err) {
          console.error("[v0] Error en PATCH:", err)
        }

        // Refrescar brain para obtener siguiente actividad
        fetchHistorialMes()
        globalMutate((key: string) => typeof key === "string" && key.includes("/api/brain"), undefined, { revalidate: true })
        
        setTimeout(() => {
          dayPlanningRef.current?.fetchBrain?.()
          globalMutate((key: string) => typeof key === "string" && key.includes("/api/brain"), undefined, { revalidate: true })
        }, 2000)

        // Limpiar evaluaciones para la nueva clase
        setEvaluaciones({})
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(STORAGE_PROGRESS_KEY)

        setJornadaToast({ tipo: "ok", mensaje: "Jornada finalizada. Proxima actividad sugerida por ALBA." })
        setTimeout(() => setJornadaToast(null), 3000)
      }
    } catch (e) {
      console.error("[v0] Error guardando registro de cierre:", e)
      setJornadaToast({ tipo: "error", mensaje: "Error al guardar. Intenta nuevamente." })
      setTimeout(() => setJornadaToast(null), 3000)
    }
  }, [salaActual, ejeActual, actividadActual, actividadSugeridaALBA, students, evaluaciones, progress])

  // Guardar evaluaciones en localStorage cuando cambie
  useEffect(() => {
    if (Object.keys(progress).length > 0) {
      localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(progress))
    }
  }, [progress])

  // SWR para mensajes: se revalida al volver al tab y cada 30 segundos automaticamente
  // Los mensajes NO leidos persisten hasta que la docente los marca leidos en Supabase
  const mensajesKey = salaActual ? `/api/mensajes-directora?sala=${encodeURIComponent(salaActual)}` : null
  const { data: mensajesData, mutate: mutateMensajes } = useSWR(
    mensajesKey,
    (url: string) => fetch(url).then(r => r.json()),
    { revalidateOnFocus: true, revalidateOnReconnect: true, refreshInterval: 30000 }
  )
  const mensajesDirectora: Array<{ id: string; sala: string; mensaje: string; autor?: string; leido: boolean; created_at: string; leido_at?: string }> =
    mensajesData?.ok ? (mensajesData.mensajes || []) : []

  // Mensajes que la MAESTRA ya envio hacia direccion (autor = nombre de su sala)
  const mensajesEnviadosPorMaestra = mensajesDirectora.filter(m => m.autor === salaActual)
  // Mensajes de direccion pendientes de leer (autor = "directora" o sin autor, por mensajes viejos)
  const mensajesPendientesDeDireccion = mensajesDirectora.filter(m => !m.leido && m.autor !== salaActual)

  const [nuevoMensajeMaestra, setNuevoMensajeMaestra] = useState("")
  const [enviandoMensajeMaestra, setEnviandoMensajeMaestra] = useState(false)
  const [chatMaestraAbierto, setChatMaestraAbierto] = useState(false)

  const enviarMensajeADireccion = async () => {
    if (!nuevoMensajeMaestra.trim() || !salaActual) return
    setEnviandoMensajeMaestra(true)
    try {
      const res = await fetch("/api/mensajes-directora", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala: salaActual, mensaje: nuevoMensajeMaestra.trim(), autor: salaActual }),
      })
      const data = await res.json()
      if (data.ok) {
        setNuevoMensajeMaestra("")
        mutateMensajes()
      }
    } catch (e) {
      console.error("[v0] Error enviando mensaje a direccion:", e)
    } finally {
      setEnviandoMensajeMaestra(false)
    }
  }

  const marcarLeido = async (id: string) => {
    setMarcandoLeido(id)
    try {
      const res = await fetch("/api/mensajes-directora", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (data.ok) {
        // Actualizar SWR optimistamente para que el badge se actualice al instante
        mutateMensajes(
          (prev: any) => prev ? { ...prev, mensajes: prev.mensajes.map((m: any) => m.id === id ? { ...m, leido: true, leido_at: new Date().toISOString() } : m) } : prev,
          { revalidate: false }
        )
      }
    } catch (e) {
      console.error("[v0] Error marcando leido:", e)
    } finally {
      setMarcandoLeido(null)
    }
  }

  const fetchProgreso = useCallback(async () => {
    setIsLoading(true)
    // Limpiar alertas antes de recalcular para no duplicar ni mezclar entre salas
    setAlertasPedagogicas([])
    
    try {
      // Cargar alumnos via API
      const res = await fetch(`/api/students?sala=${encodeURIComponent(salaActual)}`)
      const data = await res.json()
      
      if (data.error) {
        console.error("Error cargando alumnos:", data.error)
      }
      
      const mappedStudents = (data.students || []).map((al: any) => ({
        id: al.id,
        name: al.nombre,
        nombre: al.nombre,
        sala: al.sala,
      }))
      setStudents(mappedStudents)

      // Cargar progreso acumulado por eje desde Supabase
      if (isSupabaseConfigured() && supabase && mappedStudents.length > 0) {
        const ids = mappedStudents.map((s: { id: string }) => s.id)
        const STATUS_TO_VAL: Record<string, number> = { green: 100, yellow: 50, red: 10, blue: 0 }
        
        const { data: seguimientos } = await supabase
          .from('seguimiento')
          .select('alumno_id, eje, estado, created_at')
          .in('alumno_id', ids)
          .order('created_at', { ascending: true })
        
        if (seguimientos && seguimientos.length > 0) {
          // Agrupar por alumno+eje con actividades individuales
          const agrupado: Record<string, Record<string, Array<{ semana: number; resultado: string }>>> = {}
          const contadores: Record<string, Record<string, number>> = {}
          
          for (const row of seguimientos) {
            if (!agrupado[row.alumno_id]) agrupado[row.alumno_id] = {}
            if (!agrupado[row.alumno_id][row.eje]) agrupado[row.alumno_id][row.eje] = []
            if (!contadores[row.alumno_id]) contadores[row.alumno_id] = {}
            if (!contadores[row.alumno_id][row.eje]) contadores[row.alumno_id][row.eje] = 0
            
            contadores[row.alumno_id][row.eje]++
            agrupado[row.alumno_id][row.eje].push({
              semana: contadores[row.alumno_id][row.eje],
              resultado: row.estado // green, yellow, red, blue
            })
          }
          
          const progresoCalculado: Record<string, Record<string, { porcentaje: number; actividades: Array<{ semana: number; resultado: string }> }>> = {}
          for (const [alumnoId, ejes] of Object.entries(agrupado)) {
            progresoCalculado[alumnoId] = {}
            for (const [eje, actividades] of Object.entries(ejes)) {
              const valores = actividades.map(a => STATUS_TO_VAL[a.resultado] ?? 0)
              const promedio = valores.length > 0 ? Math.round(valores.reduce((a, b) => a + b, 0) / valores.length) : 0
              progresoCalculado[alumnoId][eje] = {
                porcentaje: promedio,
                actividades: actividades
              }
            }
          }
          setProgress(progresoCalculado)
          
          // ALBA INTELIGENTE: Generar alertas pedagogicas con analisis de patrones
          const nuevasAlertas: AlertaPedagogica[] = []
          
          // Sugerencias especificas por eje y tipo de problema
          const SUGERENCIAS_ALBA: Record<string, Record<string, string>> = {
            CF: {
              persistente: "Este alumno necesita intervencion individual en conciencia fonologica. Sugerencia: 5 minutos diarios de juegos de rimas con su nombre y palabras familiares. Usar material concreto (fichas, cubos) para representar sonidos.",
              descendente: "Se detecta una tendencia a la baja. Antes de que empeore, reforzar con actividades de discriminacion auditiva: sonidos del entorno, juegos de escucha activa. Volver a silabas antes de fonemas.",
              preventiva: "Atencion: 2 amarillos seguidos. Para evitar que pase a rojo, dedicar tiempo extra en la proxima clase con actividades de palmeo silabico y reconocimiento de vocales."
            },
            CT: {
              persistente: "Dificultad sostenida en comprension. Sugerencia: lectura dialogica 1 a 1 con cuentos muy cortos (3-4 paginas). Hacer pausas frecuentes con preguntas literales simples (quien, donde). No avanzar a inferencias hasta consolidar lo literal.",
              descendente: "La comprension esta bajando. Revisar si el nivel de los textos es adecuado. Volver a cuentos con mas imagenes y menos texto. Reforzar vocabulario en contexto antes de cada lectura.",
              preventiva: "Posible dificultad emergente. Antes de la proxima lectura, activar conocimientos previos con la portada. Hacer predicciones. Verificar comprension con recontar la historia usando imagenes."
            },
            O: {
              persistente: "Dificultad persistente en oralidad. Sugerencia: crear oportunidades de habla en contextos seguros. Empezar con respuestas de una palabra, luego frases, luego oraciones. No corregir pronunciacion frente al grupo.",
              descendente: "La participacion oral esta disminuyendo. Verificar si hay factores emocionales. Ofrecer opciones de respuesta (esto o esto?) antes de preguntas abiertas. Celebrar cada intento de participacion.",
              preventiva: "Se nota menor participacion. Incluir al alumno en actividades de coro y respuestas grupales para que gane confianza antes de participar individualmente."
            }
          }
          
          // Analisis grupal para detectar patrones de sala
          const analisisGrupal: Record<string, { rojos: number; amarillos: number; verdes: number; total: number }> = {
            CF: { rojos: 0, amarillos: 0, verdes: 0, total: 0 },
            CT: { rojos: 0, amarillos: 0, verdes: 0, total: 0 },
            O: { rojos: 0, amarillos: 0, verdes: 0, total: 0 }
          }
          
          for (const [alumnoId, ejes] of Object.entries(progresoCalculado)) {
            const alumno = mappedStudents.find((s: {id: string; nombre: string}) => s.id === alumnoId)
            if (!alumno) continue
            
            for (const [eje, data] of Object.entries(ejes)) {
              const actividades = data.actividades || []
              if (actividades.length === 0) continue
              
              // Contar para analisis grupal (ultima evaluacion de cada alumno)
              const ultimaEval = actividades[actividades.length - 1]?.resultado
              if (ultimaEval === "red") analisisGrupal[eje].rojos++
              else if (ultimaEval === "yellow") analisisGrupal[eje].amarillos++
              else if (ultimaEval === "green") analisisGrupal[eje].verdes++
              analisisGrupal[eje].total++
              
              // Analisis individual inteligente
              const ultimasEvals = actividades.slice(-4)
              const rojosRecientes = ultimasEvals.filter(a => a.resultado === "red").length
              const amarillosRecientes = ultimasEvals.filter(a => a.resultado === "yellow").length
              
              // Verificar si ya existe alerta para este alumno/eje
              const alertaExistente = alertasPedagogicas.find(
                a => a.alumnoId === alumnoId && a.eje === eje as "CF" | "CT" | "O" && !a.atendida
              )
              if (alertaExistente) continue
              
              const ejeNombre = eje === "CF" ? "Conciencia Fonologica" : eje === "CT" ? "Comprension de Textos" : "Oralidad"
              
              // ALERTA TIPO 1: Persistencia en rojo (3+ rojos)
              if (rojosRecientes >= 3) {
                nuevasAlertas.push({
                  id: `${alumnoId}-${eje}-persistente`,
                  alumnoId,
                  alumnoNombre: alumno.nombre,
                  eje: eje as "CF" | "CT" | "O",
                  mensaje: `URGENTE: ${alumno.nombre} lleva ${rojosRecientes} clases en rojo en ${ejeNombre}. Requiere intervencion inmediata.`,
                  sugerencia: SUGERENCIAS_ALBA[eje]?.persistente || "Revisar estrategia pedagogica individual.",
                  fecha: new Date().toLocaleDateString("es-AR"),
                  atendida: false
                })
              }
              // ALERTA TIPO 2: Tendencia descendente (paso de verde/amarillo a rojo)
              else if (actividades.length >= 3) {
                const penultima = actividades[actividades.length - 2]?.resultado
                const ultima = actividades[actividades.length - 1]?.resultado
                if ((penultima === "green" || penultima === "yellow") && ultima === "red") {
                  nuevasAlertas.push({
                    id: `${alumnoId}-${eje}-descendente`,
                    alumnoId,
                    alumnoNombre: alumno.nombre,
                    eje: eje as "CF" | "CT" | "O",
                    mensaje: `${alumno.nombre} bajo de ${penultima === "green" ? "logrado" : "en proceso"} a necesita refuerzo en ${ejeNombre}.`,
                    sugerencia: SUGERENCIAS_ALBA[eje]?.descendente || "Ajustar nivel de actividades.",
                    fecha: new Date().toLocaleDateString("es-AR"),
                    atendida: false
                  })
                }
              }
              // ALERTA TIPO 3: Preventiva (2 amarillos seguidos)
              else if (amarillosRecientes >= 2 && rojosRecientes === 0) {
                const ultimas2 = actividades.slice(-2)
                if (ultimas2.every(a => a.resultado === "yellow")) {
                  nuevasAlertas.push({
                    id: `${alumnoId}-${eje}-preventiva`,
                    alumnoId,
                    alumnoNombre: alumno.nombre,
                    eje: eje as "CF" | "CT" | "O",
                    mensaje: `PREVENTIVA: ${alumno.nombre} tiene 2 clases seguidas en proceso en ${ejeNombre}. Actuar antes de que baje.`,
                    sugerencia: SUGERENCIAS_ALBA[eje]?.preventiva || "Reforzar antes de que baje a rojo.",
                    fecha: new Date().toLocaleDateString("es-AR"),
                    atendida: false
                  })
                }
              }
            }
          }
          
          // ALERTA GRUPAL: Si mas del 40% de la sala esta en rojo en un eje
          for (const [eje, stats] of Object.entries(analisisGrupal)) {
            if (stats.total >= 3 && stats.rojos / stats.total >= 0.4) {
              const ejeNombre = eje === "CF" ? "Conciencia Fonologica" : eje === "CT" ? "Comprension de Textos" : "Oralidad"
              const alertaGrupalExiste = alertasPedagogicas.find(
                a => a.alumnoId === "GRUPAL" && a.eje === eje as "CF" | "CT" | "O" && !a.atendida
              )
              if (!alertaGrupalExiste) {
                nuevasAlertas.push({
                  id: `GRUPAL-${eje}`,
                  alumnoId: "GRUPAL",
                  alumnoNombre: "ALERTA GRUPAL",
                  eje: eje as "CF" | "CT" | "O",
                  mensaje: `${Math.round(stats.rojos / stats.total * 100)}% de la sala (${stats.rojos} de ${stats.total} alumnos) necesita refuerzo en ${ejeNombre}. Revisar estrategia grupal.`,
                  sugerencia: `Considerar: 1) Bajar el nivel de dificultad de las actividades de ${ejeNombre}. 2) Dividir el grupo para atencion diferenciada. 3) Repetir actividades anteriores que funcionaron bien.`,
                  fecha: new Date().toLocaleDateString("es-AR"),
                  atendida: false
                })
              }
            }
          }
          
          if (nuevasAlertas.length > 0) {
            // Filtrar las alertas que la maestra ya marco como atendidas (persistido por sala)
            const atendidasGuardadas = getAlertasAtendidas(salaActual)
            const alertasFiltradas = nuevasAlertas.filter(a => !atendidasGuardadas.includes(a.id))
            if (alertasFiltradas.length > 0) {
              setAlertasPedagogicas(prev => [...prev, ...alertasFiltradas])
            }
          }
        }
      } else {
        // Fallback a localStorage si no hay Supabase
        const savedProgress = localStorage.getItem(STORAGE_PROGRESS_KEY)
        if (savedProgress) {
          setProgress(JSON.parse(savedProgress))
        }
      }
    } catch (err) {
      console.error("Error cargando datos:", err)
    }
    setIsLoading(false)
  }, [salaActual])

useEffect(() => {
  fetchProgreso()
  fetchHistorialMes()
  }, [fetchProgreso, fetchHistorialMes])

  const handleNavigate = (view: ViewType) => {
    setActiveView(view)
    if (view !== "perfil") {
      setSelectedStudent(null)
    }
  }

  // Agregar nuevo alumno a Supabase (nombre en MAYUSCULAS para estandarizar)
  const handleAddStudent = async () => {
    if (!newStudentName.trim()) return
    
    const nombreEstandarizado = newStudentName.trim().toUpperCase()
    
    setAddingStudent(true)
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: nombreEstandarizado, sala: salaActual }),
      })
      const data = await res.json()
      
      if (data.error) {
        alert("Error al agregar alumno: " + data.error)
      } else {
        setNewStudentName("")
        setShowAddStudent(false)
        await fetchProgreso()
      }
    } catch (err) {
      console.error("Error agregando alumno:", err)
    } finally {
      setAddingStudent(false)
    }
  }

  // Agregar multiples alumnos de una vez (nombres en MAYUSCULAS)
  const handleBulkAddStudents = async () => {
    const nombres = bulkNames
      .split('\n')
      .map(n => n.trim().toUpperCase())
      .filter(n => n.length > 0)
    
    if (nombres.length === 0) return
    
    setAddingBulk(true)
    try {
      // Agregar cada alumno via API
      for (const nombre of nombres) {
        await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, sala: salaActual }),
        })
      }
      setBulkNames("")
      setShowConfigSala(false)
      await fetchProgreso()
    } catch (err) {
      console.error("Error agregando alumnos:", err)
      alert("Error al agregar alumnos")
    } finally {
      setAddingBulk(false)
    }
  }

  // Eliminar alumno
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Estas seguro de eliminar este alumno?")) return
    
    try {
      const res = await fetch(`/api/students?id=${studentId}`, { method: "DELETE" })
      const data = await res.json()
      
      if (data.error) {
        alert("Error al eliminar: " + data.error)
        return
      }
      
      // Actualizar estado local
      setStudents(prev => prev.filter(s => s.id !== studentId))
      
      // Limpiar progreso y evaluaciones del alumno eliminado
      setProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[studentId]
        return newProgress
      })
      setEvaluaciones(prev => {
        const newEval = { ...prev }
        delete newEval[studentId]
        return newEval
      })
    } catch (err) {
      console.error("Error eliminando alumno:", err)
    }
  }

  // Editar nombre de alumno
  const handleEditStudent = async (studentId: string, newName: string) => {
    const nombreEstandarizado = newName.trim().toUpperCase()
    if (!nombreEstandarizado) return
    
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from('alumnos')
          .update({ nombre: nombreEstandarizado })
          .eq('id', studentId)

        if (error) {
          console.error("Error editando alumno:", error)
          alert("Error al editar: " + error.message)
          return
        }
      }
      
      // Actualizar estado local
      setStudents(prev => prev.map(s => 
        s.id === studentId 
          ? { ...s, name: nombreEstandarizado, nombre: nombreEstandarizado }
          : s
      ))
      
      // Actualizar localStorage en modo demo
      if (!isSupabaseConfigured()) {
        try {
          const savedStudents = localStorage.getItem(STORAGE_STUDENTS_KEY)
          if (savedStudents) {
            const allStudents = JSON.parse(savedStudents)
            const updated = allStudents.map((s: any) => 
              s.id === studentId 
                ? { ...s, name: nombreEstandarizado, nombre: nombreEstandarizado }
                : s
            )
            localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(updated))
          }
        } catch (err) {
          console.error("Error actualizando localStorage:", err)
        }
      }
      
      setEditingStudentId(null)
      setEditingName("")
    } catch (err) {
      console.error("Error editando alumno:", err)
    }
  }

  // Callback cuando se evalua un alumno en HeatMap
  // Actualiza el progreso como promedio acumulado por eje (NO sobreescribe el mapa)
  const handleEvaluacion = useCallback(async (studentId: string, status: StatusLevel, actividadDelDia: string, eje: string = "CF") => {
    // Actualizar estado local inmediatamente (optimistic update)
    setEvaluaciones(prev => ({ ...prev, [studentId]: status }))
    
    const valorNuevo = statusToProgress(status)

    // Guardar en Supabase si esta configurado
    if (isSupabaseConfigured() && supabase) {
      try {
        const today = new Date().toISOString().split('T')[0]
        
        // Verificar si ya existe registro de hoy para este alumno y eje
        const { data: existing } = await supabase
          .from('seguimiento')
          .select('id')
          .eq('alumno_id', studentId)
          .eq('eje', eje)
          .gte('fecha', `${today}T00:00:00`)
          .lte('fecha', `${today}T23:59:59`)
          .single()

        if (existing) {
          await supabase
            .from('seguimiento')
            .update({ estado: status, actividad: actividadDelDia, sala: salaActual, fecha: new Date().toISOString() })
            .eq('id', existing.id)
        } else {
          await supabase
            .from('seguimiento')
            .insert([{ alumno_id: studentId, eje, estado: status, actividad: actividadDelDia, fecha: new Date().toISOString(), sala: salaActual }])
        }

        // Calcular promedio acumulado por eje desde todos los registros historicos
        const { data: todos } = await supabase
          .from('seguimiento')
          .select('estado')
          .eq('alumno_id', studentId)
          .eq('eje', eje)
          .order('fecha', { ascending: false })

        if (todos && todos.length > 0) {
          const STATUS_TO_VAL: Record<string, number> = { green: 100, yellow: 50, red: 10, blue: 0 }
          const sum = todos.reduce((acc: number, r: { estado: string }) => acc + (STATUS_TO_VAL[r.estado] ?? 0), 0)
          const promedio = Math.round(sum / todos.length)
          setProgress(prev => ({
            ...prev,
            [studentId]: { ...(prev[studentId] || initProgress(studentId)), [eje]: promedio }
          }))
        }
        return
      } catch {
        // Supabase no disponible - continua con estado local
      }
    }

    // Fallback sin Supabase: promedio simple acumulando con valor anterior
    setProgress(prev => {
      const current = prev[studentId] || initProgress(studentId)
      const anterior = (current[eje as "CF" | "CT" | "O"] as number | null) ?? null
      // Si hay valor previo, promediar; si no, usar el valor nuevo directamente
      const promedio = anterior !== null ? Math.round((anterior + valorNuevo) / 2) : valorNuevo
      return { ...prev, [studentId]: { ...current, [eje]: promedio } }
    })

    // Fallback a API local
    try {
      await fetch("/api/registrar-actividad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, field: eje, status, actividad: actividadDelDia }),
      })
    } catch (err) {
      console.error("Error guardando evaluacion:", err)
    }
  }, [salaActual])

  // Limpiar evaluacion de un alumno
  const handleClearEvaluacion = useCallback((studentId: string) => {
    setEvaluaciones(prev => {
      const newEval = { ...prev }
      delete newEval[studentId]
      return newEval
    })
  }, [])

  // Limpiar todas las evaluaciones del dia
  const handleClearAllEvaluaciones = useCallback(() => {
    setEvaluaciones({})
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  if (activeView === "evaluar") {
    return (
      <div className="min-h-screen bg-background">
        <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} onPlanificacion={() => setShowPlanificacion(true)} onAlertas={() => setShowAlertas(true)} alertasPendientes={alertasPedagogicas.filter(a => !a.atendida).length} salaActual={salaActual} historialMes={historialMes} />
        <ClassEvaluation
          students={students}
          onSave={async (evalData) => {
            await fetch("/api/registrar-actividad", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(evalData),
            })
            await fetchProgreso()
          }}
          onClose={() => setActiveView("clase")}
        />
        {showSintesis && (
          <SintesisPedagogicaModal
            totalStudents={students.length}
            salaName={salaActual}
            onClose={() => setShowSintesis(false)}
          />
        )}
        <PlanificacionModal isOpen={showPlanificacion} onClose={() => setShowPlanificacion(false)} sala={salaActual} />
        {showAlertas && (
          <AlertasPedagogicas 
            alertas={alertasPedagogicas} 
            onMarcarAtendida={(id) => { addAlertaAtendida(salaActual, id); setAlertasPedagogicas(prev => prev.map(a => a.id === id ? {...a, atendida: true} : a)) }}
            onClose={() => setShowAlertas(false)} 
          />
        )}
      </div>
    )
  }

  if (activeView === "mapa") {
    return (
      <div className="min-h-screen bg-background">
        <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} onPlanificacion={() => setShowPlanificacion(true)} onAlertas={() => setShowAlertas(true)} alertasPendientes={alertasPedagogicas.filter(a => !a.atendida).length} salaActual={salaActual} historialMes={historialMes} />
        <SalaMap
          students={students}
          progress={progress}
          evaluaciones={evaluaciones}
          onStudentClick={(id) => {
            const student = students.find(s => s.id === id)
            setSelectedStudent(id)
            setSelectedStudentName(student?.nombre || "")
            setActiveView("perfil")
          }}
        />
        {showSintesis && (
          <SintesisPedagogicaModal
            totalStudents={students.length}
            salaName={salaActual}
            onClose={() => setShowSintesis(false)}
          />
        )}
        <PlanificacionModal isOpen={showPlanificacion} onClose={() => setShowPlanificacion(false)} sala={salaActual} />
        {showAlertas && (
          <AlertasPedagogicas 
            alertas={alertasPedagogicas} 
            onMarcarAtendida={(id) => { addAlertaAtendida(salaActual, id); setAlertasPedagogicas(prev => prev.map(a => a.id === id ? {...a, atendida: true} : a)) }}
            onClose={() => setShowAlertas(false)} 
          />
        )}
      </div>
    )
  }

  if (activeView === "perfil" && selectedStudent) {
    const student = students.find(s => s.id === selectedStudent)
    const studentProgress = progress[selectedStudent] || {}
    
    return (
      <div className="min-h-screen bg-background">
        <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} onPlanificacion={() => setShowPlanificacion(true)} onAlertas={() => setShowAlertas(true)} alertasPendientes={alertasPedagogicas.filter(a => !a.atendida).length} salaActual={salaActual} historialMes={historialMes} />
        <StudentProfile
          alumnoId={selectedStudent}
          alumnoNombre={selectedStudentName || student?.nombre || "Alumno"}
          progressData={studentProgress}
          onBack={() => {
            setSelectedStudent(null)
            setActiveView("mapa")
          }}
        />
        {showSintesis && (
          <SintesisPedagogicaModal
            totalStudents={students.length}
            salaName={salaActual}
            onClose={() => setShowSintesis(false)}
          />
        )}
        <PlanificacionModal isOpen={showPlanificacion} onClose={() => setShowPlanificacion(false)} sala={salaActual} />
        {showAlertas && (
          <AlertasPedagogicas 
            alertas={alertasPedagogicas} 
            onMarcarAtendida={(id) => { addAlertaAtendida(salaActual, id); setAlertasPedagogicas(prev => prev.map(a => a.id === id ? {...a, atendida: true} : a)) }}
            onClose={() => setShowAlertas(false)} 
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} onPlanificacion={() => setShowPlanificacion(true)} onAlertas={() => setShowAlertas(true)} alertasPendientes={alertasPedagogicas.filter(a => !a.atendida).length} salaActual={salaActual} historialMes={historialMes} />
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Barra de gestion de sala */}
          <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              {/* Selector de sala (oculto en modo demo) */}

              
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { if (!forzarSala && !esMaestra) setShowSalaDropdown(!showSalaDropdown) }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium"
                  style={{ color: "#1e3a5f" }}
                >
                  <span>Sala: {salaActual}</span>
                  {!forzarSala && !esMaestra && <ChevronDown className={`w-4 h-4 transition-transform ${showSalaDropdown ? "rotate-180" : ""}`} />}
                </button>
                {showSalaDropdown && !forzarSala && !esMaestra && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20 min-w-[160px]">
                    {SALAS_DISPONIBLES.map((sala) => (
                      <button
                        key={sala}
                        type="button"
                        onClick={() => {
                          setSalaActual(sala)
                          localStorage.setItem("sia-sala-activa", sala)
                          cargarEvaluacionesDeSala(sala) // Cargar evaluaciones de la nueva sala desde Supabase
                          dayPlanningRef.current?.fetchBrain()
                          setShowSalaDropdown(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 ${sala === salaActual ? "font-semibold bg-slate-50" : ""}`}
                      >
                        {sala}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <span className="text-sm text-slate-500">
                {students.length} alumno{students.length !== 1 ? "s" : ""}
              </span>
              
              {!isSupabaseConfigured() && (
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                  Modo Demo
                </span>
              )}
            </div>

            {/* Boton unico de gestion + chat con Direccion */}
            <div className="flex items-center gap-2">
              {salaActual && (
                <button
                  type="button"
                  onClick={() => setChatMaestraAbierto(true)}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-green-200 bg-green-50 hover:bg-green-100 transition-colors text-green-700"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Direccion
                  {mensajesPendientesDeDireccion.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {mensajesPendientesDeDireccion.length}
                    </span>
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowConfigSala(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                style={{ color: "#1e3a5f" }}
              >
                <Settings className="w-4 h-4" />
                Gestionar sala
              </button>
            </div>
          </div>

          {/* Estado vacio - cuando no hay alumnos */}
          {!isLoading && students.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center max-w-lg mx-auto">
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-5">
                <Users className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ color: "#1e3a5f" }}>
                Esta sala aun no tiene alumnos
              </h2>
              <p className="text-slate-500 mb-6">
                Empeza cargando tu lista de alumnos para comenzar a registrar el progreso de alfabetizacion.
              </p>
              <button
                type="button"
                onClick={() => setShowConfigSala(true)}
                className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: "#1e3a5f" }}
              >
                <Sparkles className="w-5 h-5" />
                Configurar Sala / Cargar Alumnos
              </button>
              <p className="text-xs text-slate-400 mt-4">
                Podes agregar los nombres uno por uno o varios a la vez
              </p>
            </div>
          ) : (
            <>
              {/* Fila 1: Cronograma Semanal inline — 5 dias con titulos y boton Abrir */}
              <CronogramaInlinePreview
                key={cronogramaRefreshKey}
                sala={salaActual}
                onAbrirCompleto={() => setShowCronograma(true)}
                mensajesPendientes={mensajesDirectora.filter(m => !m.leido).length}
              />

              {/* Fila 2: Proyecto (izq) + Sugerencia ALBA (der) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DayPlanning
                  ref={dayPlanningRef}
                  section="proyecto"
                  sala={salaActual}
                  onActividadALBA={setActividadSugeridaALBA}
                  onEjeALBA={setEjeActual}
                />
                <DayPlanning
                  section="sugerencia"
                  sala={salaActual}
                  onActividadALBA={setActividadSugeridaALBA}
                  onEjeALBA={setEjeActual}
                />
              </div>

              {/* Fila 3: Registro del Aula — ancho completo */}
              <HeatMap
                students={students}
                evaluaciones={evaluaciones}
                onEvaluacion={handleEvaluacion}
                onClearEvaluacion={handleClearEvaluacion}
                onClearAllEvaluaciones={handleClearAllEvaluaciones}
                actividadSugeridaALBA={actividadSugeridaALBA}
                ejeDeALBA={ejeActual}
                sala={salaActual}
                isLoading={isLoading}
              />

              {/* Fila 4: Finalizar Jornada */}
              <QuickRegister
                actividadDelDia={actividadSugeridaALBA || actividadActual}
                evaluados={Object.keys(evaluaciones).length}
                totalAlumnos={students.length}
                statsVerdes={students.filter(s => evaluaciones[s.id] === "green" || !evaluaciones[s.id]).length}
                statsAmarillos={students.filter(s => evaluaciones[s.id] === "yellow").length}
                statsRojos={students.filter(s => evaluaciones[s.id] === "red").length}
                statsAusentes={students.filter(s => evaluaciones[s.id] === "blue").length}
                onGuardar={handleRegistroCierre}
              />

              {/* Fila 5: Micro capacitacion */}
              <MicroTraining
                ejeDelDia={ejeActual as "CF" | "CT" | "O"}
                actividadDelDia={actividadSugeridaALBA || actividadActual}
              />
            </>
          )}
        </div>
      </main>
      <footer className="py-2 px-4 text-center text-xs text-muted-foreground border-t border-border">
        ALBA · Alfabetizacion con Acompanamiento · Nivel Inicial
      </footer>

      {/* Toast de confirmacion - Finalizar Jornada */}
      {jornadaToast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold text-white flex items-center gap-2 transition-all ${
            jornadaToast.tipo === "ok" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {jornadaToast.tipo === "ok" ? (
            <Check className="w-4 h-4 shrink-0" />
          ) : (
            <X className="w-4 h-4 shrink-0" />
          )}
          {jornadaToast.mensaje}
        </div>
      )}

      {/* Modal de Configuracion de Sala */}
      {showConfigSala && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfigSala(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "#1e3a5f" }}>
                    Gestionar Sala
                  </h2>
                  <p className="text-sm text-slate-500">Sala {salaActual} — {students.length} alumnos</p>
                </div>
                <button
                  onClick={() => setShowConfigSala(false)}
                  type="button"
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowConfigSala(false); setShowEditList(true) }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  style={{ color: "#1e3a5f" }}
                >
                  <Pencil className="w-4 h-4" />
                  Editar Lista
                </button>
                <button
                  type="button"
                  onClick={() => { setShowConfigSala(false); setShowAddStudent(true) }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm text-white rounded-lg hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: "#1e3a5f" }}
                >
                  <UserPlus className="w-4 h-4" />
                  + Alumno
                </button>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cargar lista completa (un nombre por linea)
                </label>
                <textarea
                  value={bulkNames}
                  onChange={(e) => setBulkNames(e.target.value)}
                  placeholder={"Sofia Garcia\nMartin Lopez\nLucia Fernandez"}
                  className="w-full h-36 p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 resize-none"
                />
                <button
                  type="button"
                  onClick={handleBulkAddStudents}
                  disabled={addingBulk || !bulkNames.trim()}
                  className="w-full mt-2 py-2.5 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  style={{ backgroundColor: "#1e3a5f" }}
                >
                  {addingBulk ? "Guardando..." : (
                    <>
                      <Users className="w-4 h-4" />
                      Cargar Alumnos ({bulkNames.split('\n').filter(n => n.trim()).length})
                    </>
                  )}
                </button>
              </div>

              {!isSupabaseConfigured() && (
                <p className="text-xs text-amber-600 text-center p-2 bg-amber-50 rounded-lg">
                  Modo Demo: Los alumnos se guardaran solo en esta sesion.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Lista de Alumnos */}
      {showEditList && (
        <div 
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowEditList(false)
            setEditingStudentId(null)
            setEditingName("")
          }}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "#1e3a5f" }}>
                    Editar Lista de Alumnos
                  </h2>
                  <p className="text-sm text-slate-500">Sala {salaActual} - {students.length} alumnos</p>
                </div>
                <button 
                  onClick={() => {
                    setShowEditList(false)
                    setEditingStudentId(null)
                    setEditingName("")
                  }}
                  type="button"
                  className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {students.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No hay alumnos en esta sala</p>
              ) : (
                <ul className="space-y-2">
                  {students.map((student) => (
                    <li 
                      key={student.id}
                      className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50"
                    >
                      {editingStudentId === student.id ? (
                        <>
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-blue-400"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleEditStudent(student.id, editingName)
                              if (e.key === "Escape") {
                                setEditingStudentId(null)
                                setEditingName("")
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleEditStudent(student.id, editingName)}
                            className="w-8 h-8 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-600"
                            title="Guardar"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStudentId(null)
                              setEditingName("")
                            }}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm font-medium text-slate-700">
                            {student.name || student.nombre}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStudentId(student.id)
                              setEditingName(student.name || student.nombre || "")
                            }}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                            title="Editar nombre"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(student.id)}
                            className="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center text-red-600"
                            title="Eliminar alumno"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => {
                  setShowEditList(false)
                  setEditingStudentId(null)
                  setEditingName("")
                }}
                className="w-full py-2.5 text-sm font-medium rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
                style={{ color: "#1e3a5f" }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sintesis Pedagogica Modal */}
      {showSintesis && (
        <SintesisPedagogicaModal
          totalStudents={students.length}
          salaName={salaActual}
          onClose={() => setShowSintesis(false)}
        />
      )}

      {/* Planificacion Modal */}
      <PlanificacionModal isOpen={showPlanificacion} onClose={() => setShowPlanificacion(false)} sala={salaActual} />
      
      {/* Alertas Pedagogicas Modal */}
      {showAlertas && (
        <AlertasPedagogicas 
          alertas={alertasPedagogicas} 
          onMarcarAtendida={(id) => { addAlertaAtendida(salaActual, id); setAlertasPedagogicas(prev => prev.map(a => a.id === id ? {...a, atendida: true} : a)) }}
          onClose={() => setShowAlertas(false)} 
        />
      )}
      {/* Cronograma Semanal Modal */}
      <CronogramaSemanal isOpen={showCronograma} onClose={() => {
        setShowCronograma(false)
        setCronogramaRefreshKey(k => k + 1)
        // Invalidar SWR del cronograma y del brain para que ambos refetcheen automaticamente
        globalMutate((key: string) => typeof key === "string" && (key.includes("/api/cronograma-maternal") || key.includes("/api/brain")), undefined, { revalidate: true })
      }} sala={salaActual} students={students} />



      {/* Modal de chat con Direccion */}
      {chatMaestraAbierto && salaActual && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-green-500 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <div>
                  <h3 className="font-bold">Mensaje a Direccion</h3>
                  <p className="text-xs opacity-80">Direccion lo vera en su panel</p>
                </div>
              </div>
              <button onClick={() => setChatMaestraAbierto(false)} className="p-1 hover:bg-white/20 rounded">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mensajes anteriores (de direccion y de la maestra, mezclados por fecha) */}
            <div className="p-4 max-h-60 overflow-y-auto bg-muted/30">
              {mensajesDirectora.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No hay mensajes anteriores</p>
              ) : (
                <div className="space-y-2">
                  {[...mensajesDirectora].reverse().map((m) => {
                    const esMio = m.autor === salaActual
                    return (
                      <div key={m.id} className={`rounded-lg p-3 shadow-sm ${esMio ? "bg-emerald-100 ml-6" : "bg-white mr-6"}`}>
                        <p className="text-[10px] font-semibold mb-0.5" style={{ color: esMio ? "#047857" : "#1e40af" }}>
                          {esMio ? "Vos" : "Direccion"}
                        </p>
                        <p className="text-sm text-foreground">{m.mensaje}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(m.created_at).toLocaleDateString("es-AR")} {new Date(m.created_at).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {!esMio && !m.leido && (
                            <button
                              type="button"
                              onClick={() => marcarLeido(m.id)}
                              disabled={marcandoLeido === m.id}
                              className="text-[10px] font-semibold text-white px-2 py-0.5 rounded disabled:opacity-50"
                              style={{ backgroundColor: "#1e3a5f" }}
                            >
                              {marcandoLeido === m.id ? "..." : "Marcar leido"}
                            </button>
                          )}
                          {m.leido && (
                            <span className="text-[10px] text-blue-500 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Leido
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Input para nuevo mensaje */}
            <div className="p-4 border-t border-border">
              <textarea
                value={nuevoMensajeMaestra}
                onChange={(e) => setNuevoMensajeMaestra(e.target.value)}
                placeholder="Escribi tu mensaje para Direccion..."
                className="w-full p-3 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="button"
                  onClick={enviarMensajeADireccion}
                  disabled={enviandoMensajeMaestra || !nuevoMensajeMaestra.trim()}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  {enviandoMensajeMaestra ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
