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

// Traduccion de color a porcentaje de avance
function statusToProgress(status: StatusLevel): number {
  switch (status) {
    case "blue": return 0     // Presente (solo asistencia, no evalua)
    case "green": return 100  // Logrado
    case "yellow": return 50  // En proceso
    case "red": return 10     // Requiere apoyo
    default: return 0
  }
}

// Key para localStorage
const STORAGE_KEY = "alba_evaluaciones_dia"
const STORAGE_PROGRESS_KEY = "alba_progreso"
const STORAGE_STUDENTS_KEY = "alba_students" // Para modo demo sin Supabase

// Actividad del dia para el reporte
const ACTIVIDAD_DEL_DIA = "Reconocimiento de Sonido Inicial /M/"

// ── Sintesis Pedagogica Cuatrimestral ──────────────────────────────────────
function SintesisPedagogicaModal({ 
  progress,
  totalStudents,
  salaName,
  onClose 
}: { 
  progress: Record<string, { CF: number; CT: number; O: number }>
  totalStudents: number
  salaName: string
  onClose: () => void 
}) {
  const [loading, setLoading] = useState(true)
  const [datosALBA, setDatosALBA] = useState<{
    promedios: { CF: number; CT: number; O: number }
    totalClases: number
    semanaActual: number
    clasesCompletadasPorEje: { CF: number; CT: number; O: number }
  } | null>(null)

  // Cargar datos reales de ALBA
  useEffect(() => {
    async function fetchDatosALBA() {
      try {
        const res = await fetch("/api/brain")
        const data = await res.json()
        
        if (data.historial?.promediosPorEje || data.progreso) {
          setDatosALBA({
            promedios: {
              CF: data.historial?.promediosPorEje?.CF || 0,
              CT: data.historial?.promediosPorEje?.CT || 0,
              O: data.historial?.promediosPorEje?.O || 0,
            },
            totalClases: data.progreso?.totalClasesCompletadas || 0,
            semanaActual: data.progreso?.semanaActual || 1,
            clasesCompletadasPorEje: data.progreso?.clasesCompletadasPorEje || { CF: 0, CT: 0, O: 0 },
          })
        }
      } catch (err) {
        console.error("Error fetching sintesis data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDatosALBA()
  }, [])

  // Verificar si hay datos suficientes para generar la sintesis
  const hayDatos = datosALBA && datosALBA.totalClases > 0

  // Funciones de analisis
  const getNivelTexto = (promedio: number) => {
    if (promedio >= 70) return "muy buen avance"
    if (promedio >= 40) return "avance sostenido"
    if (promedio > 0) return "en desarrollo"
    return null
  }

  const getEjeMasFuerte = () => {
    if (!datosALBA) return null
    const { CF, CT, O } = datosALBA.promedios
    if (CF >= CT && CF >= O && CF > 0) return { nombre: "Conciencia Fonologica", promedio: CF }
    if (CT >= CF && CT >= O && CT > 0) return { nombre: "Comprension de Textos", promedio: CT }
    if (O > 0) return { nombre: "Oralidad", promedio: O }
    return null
  }

  const getEjeAReforzar = () => {
    if (!datosALBA) return null
    const { CF, CT, O } = datosALBA.promedios
    const ejesConDatos = [
      { nombre: "Conciencia Fonologica", promedio: CF },
      { nombre: "Comprension de Textos", promedio: CT },
      { nombre: "Oralidad", promedio: O },
    ].filter(e => e.promedio > 0)
    if (ejesConDatos.length === 0) return null
    return ejesConDatos.reduce((min, e) => e.promedio < min.promedio ? e : min)
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
                Sintesis Pedagogica Cuatrimestral
              </h2>
              <p className="text-sm text-slate-500">Sala {salaName} · Primer Cuatrimestre 2025</p>
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
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
              <span className="ml-2 text-sm text-slate-500">Analizando datos de ALBA...</span>
            </div>
          )}
          
          {!loading && !hayDatos && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <h3 className="font-semibold text-slate-600 mb-2">Sin datos para generar sintesis</h3>
              <p className="text-sm text-slate-500">
                La sintesis se generara cuando haya clases registradas en el sistema.
                Utiliza el Registro del Aula para evaluar actividades y ALBA recopilara los datos.
              </p>
            </div>
          )}
          
          {!loading && hayDatos && datosALBA && (
            <>
              {/* Resumen de datos */}
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-blue-800">Analisis basado en datos de ALBA</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-2xl font-bold text-blue-600">{datosALBA.totalClases}</p>
                    <p className="text-xs text-slate-500">Clases registradas</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-2xl font-bold text-blue-600">{datosALBA.semanaActual}</p>
                    <p className="text-xs text-slate-500">Semana actual</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <p className="text-2xl font-bold text-blue-600">{totalStudents}</p>
                    <p className="text-xs text-slate-500">Alumnos</p>
                  </div>
                </div>
              </div>

              {/* QUE SE ENSENO */}
              <section>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "#1e3a5f" }}>
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                  Que se enseno
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Conciencia Fonologica</span>
                    <span className="text-sm text-slate-500">{datosALBA.clasesCompletadasPorEje.CF || 0} clases</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Comprension de Textos</span>
                    <span className="text-sm text-slate-500">{datosALBA.clasesCompletadasPorEje.CT || 0} clases</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-700">Oralidad</span>
                    <span className="text-sm text-slate-500">{datosALBA.clasesCompletadasPorEje.O || 0} clases</span>
                  </div>
                </div>
              </section>

              {/* COMO SE HIZO */}
              <section>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "#1e3a5f" }}>
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">2</span>
                  Como se trabajo
                </h3>
                <p className="text-sm">
                  Se utilizo la metodologia ALBA con 3 estimulos semanales (uno por eje), 
                  evaluando el desempeno grupal mediante el semaforo pedagogico. 
                  Las actividades fueron ajustadas segun la retroalimentacion diaria 
                  del Registro de Cierre.
                </p>
              </section>

              {/* QUE LOGRARON */}
              <section>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "#1e3a5f" }}>
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm">3</span>
                  Que lograron los alumnos
                </h3>
                
                <div className="space-y-3">
                  {/* CF */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium" style={{ color: "#3b82f6" }}>Conciencia Fonologica</span>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                        datosALBA.promedios.CF >= 70 ? "bg-green-100 text-green-700" :
                        datosALBA.promedios.CF >= 40 ? "bg-yellow-100 text-yellow-700" :
                        datosALBA.promedios.CF > 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {datosALBA.promedios.CF > 0 ? `${datosALBA.promedios.CF}%` : "Sin datos"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all" 
                        style={{ 
                          width: `${datosALBA.promedios.CF}%`,
                          backgroundColor: datosALBA.promedios.CF >= 70 ? "#10b981" : datosALBA.promedios.CF >= 40 ? "#fbbf24" : "#ef4444"
                        }}
                      />
                    </div>
                    {getNivelTexto(datosALBA.promedios.CF) && (
                      <p className="text-xs text-slate-500 mt-1">El grupo muestra {getNivelTexto(datosALBA.promedios.CF)}</p>
                    )}
                  </div>
                  
                  {/* CT */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium" style={{ color: "#10b981" }}>Comprension de Textos</span>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                        datosALBA.promedios.CT >= 70 ? "bg-green-100 text-green-700" :
                        datosALBA.promedios.CT >= 40 ? "bg-yellow-100 text-yellow-700" :
                        datosALBA.promedios.CT > 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {datosALBA.promedios.CT > 0 ? `${datosALBA.promedios.CT}%` : "Sin datos"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all" 
                        style={{ 
                          width: `${datosALBA.promedios.CT}%`,
                          backgroundColor: datosALBA.promedios.CT >= 70 ? "#10b981" : datosALBA.promedios.CT >= 40 ? "#fbbf24" : "#ef4444"
                        }}
                      />
                    </div>
                    {getNivelTexto(datosALBA.promedios.CT) && (
                      <p className="text-xs text-slate-500 mt-1">El grupo muestra {getNivelTexto(datosALBA.promedios.CT)}</p>
                    )}
                  </div>
                  
                  {/* O */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium" style={{ color: "#f59e0b" }}>Oralidad</span>
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                        datosALBA.promedios.O >= 70 ? "bg-green-100 text-green-700" :
                        datosALBA.promedios.O >= 40 ? "bg-yellow-100 text-yellow-700" :
                        datosALBA.promedios.O > 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {datosALBA.promedios.O > 0 ? `${datosALBA.promedios.O}%` : "Sin datos"}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all" 
                        style={{ 
                          width: `${datosALBA.promedios.O}%`,
                          backgroundColor: datosALBA.promedios.O >= 70 ? "#10b981" : datosALBA.promedios.O >= 40 ? "#fbbf24" : "#ef4444"
                        }}
                      />
                    </div>
                    {getNivelTexto(datosALBA.promedios.O) && (
                      <p className="text-xs text-slate-500 mt-1">El grupo muestra {getNivelTexto(datosALBA.promedios.O)}</p>
                    )}
                  </div>
                </div>
              </section>

              {/* CONCLUSION */}
              <section>
                <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "#1e3a5f" }}>
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">4</span>
                  Conclusion y proyecciones
                </h3>
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 space-y-3">
                  {getEjeMasFuerte() && (
                    <p className="text-sm">
                      <strong>Fortaleza del grupo:</strong> {getEjeMasFuerte()?.nombre} con {getEjeMasFuerte()?.promedio}% de logro.
                    </p>
                  )}
                  {getEjeAReforzar() && getEjeAReforzar()?.promedio !== getEjeMasFuerte()?.promedio && (
                    <p className="text-sm">
                      <strong>Area a reforzar:</strong> {getEjeAReforzar()?.nombre} ({getEjeAReforzar()?.promedio}%). 
                      Se recomienda priorizar este eje en el proximo cuatrimestre.
                    </p>
                  )}
                </div>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <p className="text-xs text-slate-400 text-center">
            {hayDatos 
              ? "Informe generado por ALBA a partir de los datos registrados en el sistema."
              : "Registra clases para generar la sintesis automaticamente."
            }
          </p>
        </div>
      </div>
    </div>
  )
}

// Salas disponibles
const SALAS_DISPONIBLES = ["Manzanos", "Girasoles", "Alamos", "Nogales TM"]

export default function ALBADashboard() {
  const [activeView, setActiveView] = useState<ViewType>("clase")
  const [students, setStudents] = useState<any[]>([])
  const [progress, setProgress] = useState<Record<string, { CF: number; CT: number; O: number }>>({})
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [showSintesis, setShowSintesis] = useState(false)
  
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
  
  // Callback cuando el docente cambia la actividad del dia
  const handleActividadChange = useCallback((actividad: string, eje: string) => {
    setActividadActual(actividad)
    setEjeActual(eje)
  }, [])
  
  // Callback para el registro de cierre
  const handleRegistroCierre = useCallback(async (registro: RegistroCierre) => {
    try {
      const response = await fetch("/api/registro-cierre", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registro),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Mostrar feedback al docente (podria ser un toast)
        console.log("[v0] Registro de cierre guardado:", data.feedback)
      }
    } catch (err) {
      console.error("[v0] Error guardando registro de cierre:", err)
    }
  }, [])

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
  }, [fetchProgreso])

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
    setProgress(prev => {
      const current = prev[studentId] || { CF: 0, CT: 0, O: 0 }
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
              fecha: new Date().toISOString()
            }])

          if (error) {
            console.error("Error insertando en Supabase:", error)
          }
        }
        return // Salir si guardamos en Supabase
      } catch (err) {
        console.error("Error con Supabase:", err)
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
        <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} salaActual={salaActual} />
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
            progress={progress}
            totalStudents={students.length}
            salaName={salaActual}
            onClose={() => setShowSintesis(false)}
          />
        )}
      </div>
    )
  }

  if (activeView === "mapa") {
    return (
      <div className="min-h-screen bg-background">
        <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} salaActual={salaActual} />
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
            progress={progress}
            totalStudents={students.length}
            salaName={salaActual}
            onClose={() => setShowSintesis(false)}
          />
        )}
      </div>
    )
  }

  if (activeView === "perfil" && selectedStudent) {
    const student = students.find(s => s.id === selectedStudent)
    const studentProgress = progress[selectedStudent] || { CF: 0, CT: 0, O: 0 }
    
    return (
      <div className="min-h-screen bg-background">
        <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} salaActual={salaActual} />
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
            progress={progress}
            totalStudents={students.length}
            salaName={salaActual}
            onClose={() => setShowSintesis(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} salaActual={salaActual} />
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
                <div className="lg:col-span-4">
<HeatMap
                    students={students}
                    evaluaciones={evaluaciones}
                    onEvaluacion={handleEvaluacion}
                    onClearEvaluacion={handleClearEvaluacion}
                    onClearAllEvaluaciones={handleClearAllEvaluaciones}
                    onRegistroCierre={handleRegistroCierre}
                    actividadSugeridaALBA={actividadSugeridaALBA}
                    ejeDeALBA={ejeActual}
                    isLoading={isLoading}
                  />
                </div>
                <div className="lg:col-span-8">
                  <DayPlanning 
                    evaluaciones={evaluaciones}
                    ejeActual={ejeActual}
                    actividadActual={actividadActual}
                    totalAlumnos={students.length}
                    onActividadALBA={setActividadSugeridaALBA}
                    onEjeALBA={setEjeActual}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MicroTraining 
                  ejeDelDia="CF" 
                  actividadDelDia={ACTIVIDAD_DEL_DIA} 
                />
<AlertsPanel
                  students={students}
                  evaluaciones={evaluaciones}
                />
                <QuickRegister 
                  actividadDelDia={ACTIVIDAD_DEL_DIA}
                  evaluados={Object.keys(evaluaciones).length}
                  totalAlumnos={students.length}
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
          progress={progress}
          totalStudents={students.length}
          salaName={salaActual}
          onClose={() => setShowSintesis(false)}
        />
      )}
    </div>
  )
}
