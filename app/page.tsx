"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, X, UserPlus, ChevronDown, Users, Sparkles, Pencil, Trash2, Check } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { Header } from "@/components/sia/header"
import { HeatMap, type RegistroCierre } from "@/components/sia/heat-map"
import { DayPlanning } from "@/components/sia/day-planning"
import { MicroTraining } from "@/components/sia/micro-training"
import { AlertsPanel } from "@/components/sia/alerts-panel"
import { QuickRegister } from "@/components/sia/quick-register"
import ClassEvaluation from "@/components/alba/class-evaluation"
import SalaMap from "@/components/alba/sala-map"
import StudentProfile from "@/components/alba/student-profile"
import { PlanificacionModal } from "@/components/alba/planificacion-modal"

type ViewType = "clase" | "evaluar" | "mapa" | "perfil"
type StatusLevel = "green" | "yellow" | "red" | "blue"

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

// ── Reporte para Padres - generado desde datos reales de Supabase
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
    totalRegistros?: number
    ejesConDatos?: number
    ejes: Array<{
      eje: string
      nombre: string
      promedio: number
      nivel: string | null
      totalActividades: number
      actividadesUnicas: number
      verdes: number
      amarillos: number
      rojos: number
      fechaInicio: string | null
      fechaUltima: string | null
      mensaje: string
      sugerenciaCasa: string
    }>
  } | null>(null)

  useEffect(() => {
    async function fetchReporte() {
      try {
        const res = await fetch(`/api/reporte-padres?sala=${encodeURIComponent(salaName)}`)
        const data = await res.json()
        setReporte(data)
      } catch (err) {
        console.error("[v0] Error fetching reporte padres:", err)
        setReporte({ sinDatos: true, ejes: [], mensaje: "Error al cargar el reporte. Intenta nuevamente." })
      } finally {
        setLoading(false)
      }
    }
    fetchReporte()
  }, [])

  const nivelColor = (nivel: string | null) => {
    if (nivel === "Muy bien") return "bg-green-100 text-green-700"
    if (nivel === "En proceso") return "bg-yellow-100 text-yellow-700"
    if (nivel === "Necesita refuerzo") return "bg-red-100 text-red-700"
    return "bg-slate-100 text-slate-500"
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
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold" style={{ color: "#1e3a5f" }}>
                Reporte para Familias
              </h2>
              <p className="text-sm text-slate-500">
                Sala {salaName} · {totalStudents} alumnos · Generado desde datos reales de ALBA
              </p>
            </div>
            <button 
              onClick={onClose}
              type="button"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-5 text-slate-700 leading-relaxed max-h-[70vh] overflow-y-auto">
          
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              <span className="ml-3 text-sm text-slate-500">Leyendo datos del aula desde ALBA...</span>
            </div>
          )}

          {!loading && reporte?.sinDatos && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="font-semibold text-slate-600 mb-2">Aun no hay actividades registradas</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {reporte.mensaje || "El reporte se generara automaticamente cuando la docente registre evaluaciones en el aula."}
              </p>
              <p className="text-xs text-slate-400 mt-3">
                Solo se generan reportes de los ejes que ya fueron trabajados en el aula.
              </p>
            </div>
          )}

          {!loading && reporte && !reporte.sinDatos && reporte.ejes.length > 0 && (
            <>
              {/* Resumen */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-semibold text-blue-800">
                    Este reporte refleja lo que realmente sucedio en el aula
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xl font-bold text-blue-600">{reporte.totalRegistros}</p>
                    <p className="text-xs text-slate-500">Evaluaciones registradas</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xl font-bold text-blue-600">{reporte.ejesConDatos}</p>
                    <p className="text-xs text-slate-500">{reporte.ejesConDatos === 1 ? "Eje trabajado" : "Ejes trabajados"}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-xl font-bold text-blue-600">{totalStudents}</p>
                    <p className="text-xs text-slate-500">Alumnos</p>
                  </div>
                </div>
              </div>

              {/* Un bloque por eje trabajado */}
              {reporte.ejes.map((eje, idx) => (
                <section key={eje.eje} className="rounded-xl border overflow-hidden" style={{ borderColor: COLOR_EJE[eje.eje] + "40" }}>
                  {/* Cabecera del eje */}
                  <div className="px-4 py-3 flex items-center justify-between" style={{ backgroundColor: BG_EJE[eje.eje] }}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: COLOR_EJE[eje.eje] }}>
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-sm" style={{ color: COLOR_EJE[eje.eje] }}>{eje.nombre}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {eje.nivel && (
                        <span className={"text-xs font-bold px-2 py-0.5 rounded-full " + nivelColor(eje.nivel)}>
                          {eje.nivel}
                        </span>
                      )}
                      <span className="text-xs text-slate-500">{eje.totalActividades} clases</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 bg-white">
                    {/* Barra de progreso */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-500">Nivel de logro grupal</span>
                        <span className="text-xs font-bold text-slate-700">{eje.promedio}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: eje.promedio + "%",
                            backgroundColor: eje.promedio >= 70 ? "#10b981" : eje.promedio >= 40 ? "#fbbf24" : "#ef4444"
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-green-600">{eje.verdes} logrado</span>
                        <span className="text-xs text-yellow-600">{eje.amarillos} en proceso</span>
                        <span className="text-xs text-red-500">{eje.rojos} refuerzo</span>
                      </div>
                    </div>

                    {/* Fechas */}
                    {eje.fechaInicio && (
                      <p className="text-xs text-slate-400">
                        Trabajado desde el {eje.fechaInicio}
                        {eje.fechaUltima && eje.fechaUltima !== eje.fechaInicio ? " hasta el " + eje.fechaUltima : ""}
                      </p>
                    )}

                    {/* Mensaje para la familia */}
                    <p className="text-sm text-slate-700 leading-relaxed">{eje.mensaje}</p>

                    {/* Sugerencia para casa */}
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Para hacer en casa</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{eje.sugerenciaCasa}</p>
                    </div>
                  </div>
                </section>
              ))}

              {/* Nota sobre ejes no reportados */}
              {reporte.ejesConDatos && reporte.ejesConDatos < 3 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-700">
                    <strong>Nota:</strong> Este reporte incluye solo los ejes trabajados hasta la fecha.
                    Los ejes de {["Conciencia Fonologica", "Comprension de Textos", "Oralidad"]
                      .filter(n => !reporte.ejes.find(e => e.nombre === n))
                      .join(" y ")} aun no tienen actividades registradas y se incluiran cuando la docente los trabaje en el aula.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <p className="text-xs text-slate-400 text-center">
            Reporte generado automaticamente por ALBA a partir de los datos registrados en el aula.
            Solo se reportan los ejes efectivamente trabajados.
          </p>
        </div>
      </div>
    </div>
  )
}

// Salas disponibles
const SALAS_DISPONIBLES = ["Manzanos", "Girasoles", "Alamos", "Nogales TM", "Nogales TT", "SALADEPRUEBA"]

export default function ALBADashboard() {
  const [activeView, setActiveView] = useState<ViewType>("clase")
  const [students, setStudents] = useState<any[]>([])
  const [progress, setProgress] = useState<Record<string, { CF: number; CT: number; O: number }>>({})
  const [brainKey, setBrainKey] = useState(0)  // incrementar fuerza re-fetch de ALBA

  // Inicializar progreso de alumno con null (sin datos) - solo se actualiza con evaluacion explicita de Supabase
  function initProgress(_studentId: string) {
    return { CF: null as number | null, CT: null as number | null, O: null as number | null }
  }  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [showSintesis, setShowSintesis] = useState(false)
  const [showPlanificacion, setShowPlanificacion] = useState(false)
  const [sugerenciaAlba, setSugerenciaAlba] = useState("")
  
  // Gestion de sala
  const [salaActual, setSalaActual] = useState("Manzanos")
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
  
  
  
  // Callback cuando el docente cambia la actividad del dia
  const handleActividadChange = useCallback((actividad: string, eje: string) => {
    setActividadActual(actividad)
    setEjeActual(eje)
  }, [])
  
  // Callback para el registro de cierre del dia
  // Al guardar cierre: los alumnos SIN evaluacion se marcan automaticamente como verde (logrado)
  const handleRegistroCierre = useCallback(async (registro: RegistroCierre) => {
    // 1. Marcar como verde todos los alumnos sin evaluacion explicita
    const sinEvaluar = students.filter(s => !evaluaciones[s.id])
    if (sinEvaluar.length > 0) {
      const nuevasEvals = { ...evaluaciones }
      const nuevosProgress = { ...progress }
      sinEvaluar.forEach(s => {
        nuevasEvals[s.id] = "green"
        nuevosProgress[s.id] = {
          ...(nuevosProgress[s.id] || initProgress(s.id)),
          [ejeActual]: 100,
        }
      })
      setEvaluaciones(nuevasEvals)
      setProgress(nuevosProgress)
    }

    try {
      const response = await fetch("/api/registro-cierre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registro),
      })
      const data = await response.json()
      if (data.success) {
        fetchHistorialMes()
        // ALBA re-analiza y sugiere la siguiente actividad
        setBrainKey(k => k + 1)
      }
    } catch (err) {
      console.error("[v0] Error guardando registro de cierre:", err)
    }
  }, [fetchHistorialMes, students, evaluaciones, progress, ejeActual])

  // Cargar evaluaciones guardadas de localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Verificar que sea del mismo dia
        const today = new Date().toDateString()
        if (parsed.fecha === today) {
          setEvaluaciones(parsed.evaluaciones || {})
        } else {
          // Limpiar si es de otro dia
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    
    // Cargar progreso guardado
    const savedProgress = localStorage.getItem(STORAGE_PROGRESS_KEY)
    if (savedProgress) {
      try {
        setProgress(JSON.parse(savedProgress))
      } catch {
        localStorage.removeItem(STORAGE_PROGRESS_KEY)
      }
    }
  }, [])

// Guardar evaluaciones en localStorage cuando cambien
  useEffect(() => {
    if (Object.keys(evaluaciones).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        fecha: new Date().toDateString(),
        evaluaciones,
      }))
    } else {
      // Si no hay evaluaciones, limpiar localStorage
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [evaluaciones])

  // Guardar progreso en localStorage cuando cambie
  useEffect(() => {
    if (Object.keys(progress).length > 0) {
      localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(progress))
    }
  }, [progress])

  const fetchProgreso = useCallback(async () => {
    setIsLoading(true)
    
    try {
      // Cargar alumnos via API (usa service_role en el servidor)
      const res = await fetch(`/api/students?sala=${encodeURIComponent(salaActual)}`)
      const data = await res.json()
      
      if (data.error) {
        console.error("Error cargando alumnos:", data.error)
      }
      
      // Mapear alumnos
      const mappedStudents = (data.students || []).map((al: any) => ({
        id: al.id,
        name: al.nombre,
        nombre: al.nombre,
        sala: al.sala,
      }))
      setStudents(mappedStudents)

        // Cargar progreso desde localStorage si existe
      const savedProgress = localStorage.getItem(STORAGE_PROGRESS_KEY)
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress))
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
  // Actualiza el progreso en tiempo real y guarda en Supabase
  // Ahora recibe el eje directamente desde HeatMap junto con la actividad
  const handleEvaluacion = useCallback(async (studentId: string, status: StatusLevel, actividadDelDia: string, eje: string = "CF") => {
    // El eje ahora viene directamente del HeatMap (ya no necesitamos el map)
    
    // Actualizar estado local inmediatamente (optimistic update)
    setEvaluaciones(prev => ({ ...prev, [studentId]: status }))
    
    // Actualizar progreso en tiempo real
    // Los no marcados empiezan en 100 (verde), solo se actualiza si hay evaluacion explicita
    setProgress(prev => {
      const current = prev[studentId] || initProgress(studentId)
      const newProgress = statusToProgress(status)
      return {
        ...prev,
        [studentId]: {
          ...current,
          [eje]: newProgress,
        }
      }
    })

    // Guardar en Supabase si esta configurado (upsert para evitar duplicados del mismo dia)
    if (isSupabaseConfigured() && supabase) {
      try {
        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
        
        // Primero verificar si ya existe un registro para hoy
        const { data: existing } = await supabase
          .from('seguimiento')
          .select('id')
          .eq('alumno_id', studentId)
          .eq('eje', eje)
          .gte('fecha', `${today}T00:00:00`)
          .lte('fecha', `${today}T23:59:59`)
          .single()

        if (existing) {
          // Actualizar registro existente
          const { error } = await supabase
            .from('seguimiento')
            .update({
              resultado: status,
              actividad: actividadDelDia,
              sala: salaActual,
              fecha: new Date().toISOString()
            })
            .eq('id', existing.id)

          if (error) {
            console.error("Error actualizando en Supabase:", error)
          }
        } else {
          // Insertar nuevo registro
          const { error } = await supabase
            .from('seguimiento')
            .insert([{
              alumno_id: studentId,
              eje: eje,
              resultado: status,
              actividad: actividadDelDia,
              fecha: new Date().toISOString(),
              sala: salaActual,
            }])

          if (error) {
            // Tabla 'seguimiento' puede no existir aun - continua con estado local
          }
        }
        return // Salir si guardamos en Supabase
      } catch {
        // Supabase no disponible - continua con estado local
      }
    }

    // Fallback a API local
    try {
      await fetch("/api/registrar-actividad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          studentId, 
          field: eje,
          status,
          actividad: actividadDelDia 
        }),
      })
    } catch (err) {
      console.error("Error guardando evaluacion:", err)
    }
  }, [])

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
        <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} onPlanificacion={() => setShowPlanificacion(true)} salaActual={salaActual} historialMes={historialMes} />
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
        <PlanificacionModal isOpen={showPlanificacion} onClose={() => setShowPlanificacion(false)} sala={salaActual} sugerenciaAlba={sugerenciaAlba} />
      </div>
    )
  }

  if (activeView === "mapa") {
    return (
      <div className="min-h-screen bg-background">
        <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} onPlanificacion={() => setShowPlanificacion(true)} salaActual={salaActual} historialMes={historialMes} />
        <SalaMap
          students={students}
          progress={progress}
          evaluaciones={evaluaciones}
          onStudentClick={(id) => {
            setSelectedStudent(id)
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
        <PlanificacionModal isOpen={showPlanificacion} onClose={() => setShowPlanificacion(false)} sala={salaActual} sugerenciaAlba={sugerenciaAlba} />
      </div>
    )
  }

  if (activeView === "perfil" && selectedStudent) {
    const student = students.find(s => s.id === selectedStudent)
    const studentProgress = progress[selectedStudent] || { CF: null, CT: null, O: null }
    
    return (
      <div className="min-h-screen bg-background">
        <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} onPlanificacion={() => setShowPlanificacion(true)} salaActual={salaActual} historialMes={historialMes} />
        <StudentProfile
          alumnoId={selectedStudent}
          alumnoNombre={student?.nombre}
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
        <PlanificacionModal isOpen={showPlanificacion} onClose={() => setShowPlanificacion(false)} sala={salaActual} sugerenciaAlba={sugerenciaAlba} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} onPlanificacion={() => setShowPlanificacion(true)} salaActual={salaActual} historialMes={historialMes} />
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Barra de gestion de sala */}
          <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              {/* Selector de sala */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSalaDropdown(!showSalaDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-sm font-medium"
                  style={{ color: "#1e3a5f" }}
                >
                  <span>Sala: {salaActual}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showSalaDropdown ? "rotate-180" : ""}`} />
                </button>
                {showSalaDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20 min-w-[160px]">
                    {SALAS_DISPONIBLES.map((sala) => (
                      <button
                        key={sala}
                        type="button"
                        onClick={() => {
                          setSalaActual(sala)
                          setBrainKey(k => k + 1) // Forzar re-fetch de ALBA al cambiar sala
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
            
            {/* Botones de gestion */}
            <div className="flex items-center gap-2">
              {showAddStudent ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Nombre del alumno"
                    className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-400 w-40"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddStudent()
                      if (e.key === "Escape") {
                        setShowAddStudent(false)
                        setNewStudentName("")
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddStudent}
                    disabled={addingStudent || !newStudentName.trim()}
                    className="px-3 py-1.5 text-sm text-white rounded-lg disabled:opacity-50"
                    style={{ backgroundColor: "#1e3a5f" }}
                  >
                    {addingStudent ? "..." : "Agregar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddStudent(false)
                      setNewStudentName("")
                    }}
                    className="px-2 py-1.5 text-sm text-slate-500 hover:text-slate-700"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowConfigSala(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                    style={{ color: "#1e3a5f" }}
                  >
                    <Users className="w-4 h-4" />
                    Cargar Lista
                  </button>
                  {students.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowEditList(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                      style={{ color: "#1e3a5f" }}
                    >
                      <Pencil className="w-4 h-4" />
                      Editar Lista
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowAddStudent(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white rounded-lg hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: "#1e3a5f" }}
                  >
                    <UserPlus className="w-4 h-4" />
                    + Alumno
                  </button>
                </>
              )}
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
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-4 flex flex-col gap-3">
                  <HeatMap
                    students={students}
                    evaluaciones={evaluaciones}
                    onEvaluacion={handleEvaluacion}
                    onClearEvaluacion={handleClearEvaluacion}
                    onClearAllEvaluaciones={handleClearAllEvaluaciones}
                    onRegistroCierre={handleRegistroCierre}
                    actividadSugeridaALBA={actividadSugeridaALBA}
                    ejeDeALBA={ejeActual}
                    sala={salaActual}
                    isLoading={isLoading}
                  />
                </div>
                <div className="lg:col-span-8">
                  <DayPlanning 
                    key={brainKey}
                    evaluaciones={evaluaciones as Record<string, "green" | "yellow" | "red" | "blue">}
                    ejeActual={ejeActual as "CF" | "CT" | "O"}
                    actividadActual={actividadActual}
                    totalAlumnos={students.length}
                    sala={salaActual}
                    onActividadALBA={setActividadSugeridaALBA}
                    onEjeALBA={setEjeActual}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MicroTraining 
                  ejeDelDia={ejeActual as "CF" | "CT" | "O"} 
                  actividadDelDia={actividadSugeridaALBA || actividadActual} 
                />
<AlertsPanel
                  students={students}
                  evaluaciones={evaluaciones}
                />
                <QuickRegister 
                  actividadDelDia={actividadSugeridaALBA || ACTIVIDAD_DEL_DIA}
                  evaluados={Object.keys(evaluaciones).filter(id => evaluaciones[id]).length}
                  totalAlumnos={students.length}
                  statsVerdes={students.filter(s => evaluaciones[s.id] === "green").length}
                  statsAmarillos={students.filter(s => evaluaciones[s.id] === "yellow").length}
                  statsRojos={students.filter(s => evaluaciones[s.id] === "red").length}
                  statsAusentes={students.filter(s => evaluaciones[s.id] === "blue").length}
                  onGuardar={handleRegistroCierre as any}
                />
              </div>
            </>
          )}
        </div>
      </main>
      <footer className="py-2 px-4 text-center text-xs text-muted-foreground border-t border-border">
        ALBA · Alfabetizacion con Acompanamiento · Nivel Inicial
      </footer>

      {/* Modal de Configuracion de Sala - Carga masiva */}
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
                    Cargar Alumnos
                  </h2>
                  <p className="text-sm text-slate-500">Sala {salaActual}</p>
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

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nombres de los alumnos
                </label>
                <textarea
                  value={bulkNames}
                  onChange={(e) => setBulkNames(e.target.value)}
                  placeholder={"Escribi un nombre por linea:\n\nSofia Garcia\nMartin Lopez\nLucia Fernandez\nBenjamin Rodriguez"}
                  className="w-full h-48 p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 resize-none"
                />
                <p className="text-xs text-slate-400 mt-2">
                  Escribe un nombre por linea. Se guardaran todos al hacer clic en &quot;Cargar Alumnos&quot;.
                </p>
              </div>
              
              <button
                type="button"
                onClick={handleBulkAddStudents}
                disabled={addingBulk || !bulkNames.trim()}
                className="w-full py-3 text-white rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: "#1e3a5f" }}
              >
                {addingBulk ? (
                  <>Guardando...</>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Cargar Alumnos ({bulkNames.split('\n').filter(n => n.trim()).length})
                  </>
                )}
              </button>
              
              {!isSupabaseConfigured() && (
                <p className="text-xs text-amber-600 text-center p-2 bg-amber-50 rounded-lg">
                  Modo Demo: Los alumnos se guardaran solo en esta sesion. Conecta Supabase para persistir los datos.
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
      <PlanificacionModal isOpen={showPlanificacion} onClose={() => setShowPlanificacion(false)} sala={salaActual} sugerenciaAlba={sugerenciaAlba} />
    </div>
  )
}
