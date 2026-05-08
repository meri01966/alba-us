"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, X, UserPlus, ChevronDown, Users, Sparkles, Pencil, Trash2, Check } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { Header } from "@/components/sia/header"
import { HeatMap } from "@/components/sia/heat-map"
import { DayPlanning } from "@/components/sia/day-planning"
import { MicroTraining } from "@/components/sia/micro-training"
import { AlertsPanel } from "@/components/sia/alerts-panel"
import { QuickRegister } from "@/components/sia/quick-register"
import ClassEvaluation from "@/components/alba/class-evaluation"
import SalaMap from "@/components/alba/sala-map"
import StudentProfile from "@/components/alba/student-profile"

type ViewType = "clase" | "evaluar" | "mapa" | "perfil"
type StatusLevel = "green" | "yellow" | "red"

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
  // Calcular promedios por eje de todo el grupo
  const estudiantes = Object.values(progress)
  const totalEvaluados = estudiantes.length

  const promedios = {
    CF: totalEvaluados > 0 ? Math.round(estudiantes.reduce((sum, s) => sum + s.CF, 0) / totalEvaluados) : 0,
    CT: totalEvaluados > 0 ? Math.round(estudiantes.reduce((sum, s) => sum + s.CT, 0) / totalEvaluados) : 0,
    O: totalEvaluados > 0 ? Math.round(estudiantes.reduce((sum, s) => sum + s.O, 0) / totalEvaluados) : 0,
  }

  // Contar ninos por nivel en cada eje
  const contarNiveles = (eje: "CF" | "CT" | "O") => {
    let avanzados = 0, enProceso = 0, necesitanApoyo = 0
    estudiantes.forEach(s => {
      if (s[eje] >= 70) avanzados++
      else if (s[eje] >= 40) enProceso++
      else necesitanApoyo++
    })
    return { avanzados, enProceso, necesitanApoyo }
  }

  const nivelesCF = contarNiveles("CF")
  const nivelesCT = contarNiveles("CT")
  const nivelesO = contarNiveles("O")

  // Determinar el eje mas fuerte y el que necesita mas trabajo
  const getNivelTexto = (promedio: number) => {
    if (promedio >= 70) return "muy buen avance"
    if (promedio >= 40) return "avance sostenido"
    return "necesita mas trabajo"
  }

  const getEjeMasFuerte = () => {
    if (promedios.CF >= promedios.CT && promedios.CF >= promedios.O) return "Conciencia Fonologica"
    if (promedios.CT >= promedios.CF && promedios.CT >= promedios.O) return "Conocimiento de Textos"
    return "Oralidad"
  }

  const getEjeAReforzar = () => {
    if (promedios.CF <= promedios.CT && promedios.CF <= promedios.O) return "Conciencia Fonologica"
    if (promedios.CT <= promedios.CF && promedios.CT <= promedios.O) return "Conocimiento de Textos"
    return "Oralidad"
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
              <p className="text-sm text-slate-500">Sala {salaName} · Primer Cuatrimestre 2025 · {totalEvaluados} alumnos</p>
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

        {/* Contenido narrativo */}
        <div className="p-5 space-y-5 text-slate-700 leading-relaxed">
          
          <section>
            <h3 className="font-semibold mb-2" style={{ color: "#1e3a5f" }}>
              Que nos propusimos
            </h3>
            <p>
              Durante este cuatrimestre trabajamos los tres ejes fundamentales de la alfabetizacion inicial: 
              <strong> Conciencia Fonologica</strong> (reconocimiento de sonidos y rimas), 
              <strong> Conocimiento de Textos</strong> (comprension de cuentos y narraciones), y 
              <strong> Oralidad</strong> (expresion verbal y vocabulario). 
              El objetivo fue sentar las bases para que cada nino avance en su proceso de alfabetizacion 
              respetando sus tiempos y necesidades.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2" style={{ color: "#1e3a5f" }}>
              Como lo hicimos
            </h3>
            <p>
              A traves del registro diario, fuimos identificando que actividades funcionaron mejor 
              con este grupo: cuales captaron su atencion, cuales generaron mayor participacion, 
              y cuales necesitaron ajustes. ALBA nos permitio descubrir patrones y tecnicas que 
              enriquecieron nuestra planificacion, nutriendose de la experiencia real del aula. 
              Cada docente aporto su mirada y creatividad, haciendo crecer este proceso junto con los ninos.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2" style={{ color: "#1e3a5f" }}>
              Que logramos
            </h3>
            
            <div className="space-y-3 mt-3">
              <div className="p-3 rounded-xl" style={{ backgroundColor: "#f8fafc" }}>
                <p className="font-medium" style={{ color: "#1e3a5f" }}>Conciencia Fonologica</p>
                <p className="text-sm mt-1">
                  {nivelesCF.avanzados > 0 && `${nivelesCF.avanzados} ninos logran identificar sonidos con autonomia. `}
                  {nivelesCF.enProceso > 0 && `${nivelesCF.enProceso} estan consolidando esta habilidad. `}
                  {nivelesCF.necesitanApoyo > 0 && `${nivelesCF.necesitanApoyo} necesitan mas acompanamiento.`}
                  {totalEvaluados === 0 && "Sin datos registrados aun."}
                </p>
              </div>
              
              <div className="p-3 rounded-xl" style={{ backgroundColor: "#f8fafc" }}>
                <p className="font-medium" style={{ color: "#1e3a5f" }}>Conocimiento de Textos</p>
                <p className="text-sm mt-1">
                  {nivelesCT.avanzados > 0 && `${nivelesCT.avanzados} ninos comprenden y recuerdan las historias. `}
                  {nivelesCT.enProceso > 0 && `${nivelesCT.enProceso} estan desarrollando la comprension. `}
                  {nivelesCT.necesitanApoyo > 0 && `${nivelesCT.necesitanApoyo} requieren mas practica con cuentos.`}
                  {totalEvaluados === 0 && "Sin datos registrados aun."}
                </p>
              </div>
              
              <div className="p-3 rounded-xl" style={{ backgroundColor: "#f8fafc" }}>
                <p className="font-medium" style={{ color: "#1e3a5f" }}>Oralidad</p>
                <p className="text-sm mt-1">
                  {nivelesO.avanzados > 0 && `${nivelesO.avanzados} ninos se expresan con fluidez y vocabulario amplio. `}
                  {nivelesO.enProceso > 0 && `${nivelesO.enProceso} estan ampliando su expresion verbal. `}
                  {nivelesO.necesitanApoyo > 0 && `${nivelesO.necesitanApoyo} necesitan mas oportunidades de hablar.`}
                  {totalEvaluados === 0 && "Sin datos registrados aun."}
                </p>
              </div>
            </div>

            {totalEvaluados > 0 && (
              <p className="mt-4">
                En general, el grupo muestra <strong>{getNivelTexto(promedios.CF)}</strong> en Conciencia Fonologica, 
                <strong> {getNivelTexto(promedios.CT)}</strong> en Conocimiento de Textos, y 
                <strong> {getNivelTexto(promedios.O)}</strong> en Oralidad. 
                El eje mas consolidado es <strong>{getEjeMasFuerte()}</strong>.
              </p>
            )}
          </section>

          <section>
            <h3 className="font-semibold mb-2" style={{ color: "#1e3a5f" }}>
              Proyecciones para el proximo cuatrimestre
            </h3>
            <p>
              Para el segundo cuatrimestre, nos proponemos profundizar el trabajo en <strong>{getEjeAReforzar()}</strong>, 
              que es el eje que muestra mayor necesidad de acompanamiento. Continuaremos con estrategias 
              diferenciadas para los ninos que requieren apoyo adicional, mientras avanzamos con quienes 
              estan listos para nuevos desafios en su proceso de alfabetizacion.
            </p>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <p className="text-xs text-slate-400 text-center">
            Generado automaticamente por ALBA a partir del registro cuatrimestral.
          </p>
        </div>
      </div>
    </div>
  )
}

// Salas disponibles
const SALAS_DISPONIBLES = ["Manzanos", "Girasoles", "Alamos"]

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
    
    // Si Supabase esta configurado, cargar de ahi
    if (isSupabaseConfigured() && supabase) {
      try {
        // Cargar alumnos filtrados por sala
        const { data: alumnosData, error: alumnosError } = await supabase
          .from('alumnos')
          .select('*')
          .eq('sala', salaActual)
          .order('nombre')

        if (alumnosError) {
          console.error("Error cargando alumnos de Supabase:", alumnosError)
          // Continuar - lista vacia es valido
        }
        
        // Siempre setear los alumnos (puede ser array vacio)
        const mappedStudents = (alumnosData || []).map((al: any) => ({
          id: al.id,
          name: al.nombre,
          nombre: al.nombre,
          sala: al.sala,
        }))
        setStudents(mappedStudents)

        // Cargar seguimiento/evaluaciones si hay alumnos
        if (alumnosData && alumnosData.length > 0) {
          const alumnoIds = alumnosData.map((al: any) => al.id)
          const { data: seguimientoData } = await supabase
            .from('seguimiento')
            .select('*')
            .in('alumno_id', alumnoIds)

          const savedProgress = localStorage.getItem(STORAGE_PROGRESS_KEY)
          if (!savedProgress && seguimientoData) {
            const newProgress: Record<string, { CF: number; CT: number; O: number }> = {}
            alumnosData.forEach((al: any) => {
              const registros = seguimientoData.filter((s: any) => s.alumno_id === al.id)
              const getAverage = (eje: string) => {
                const ejeRegs = registros.filter((r: any) => r.eje === eje)
                if (ejeRegs.length === 0) return 0
                const last = ejeRegs[ejeRegs.length - 1]
                if (last.resultado === 'green') return 100
                if (last.resultado === 'yellow') return 50
                return 10
              }
              newProgress[al.id] = {
                CF: getAverage('CF'),
                CT: getAverage('CT'),
                O: getAverage('O'),
              }
            })
            setProgress(newProgress)
          }
        }
        
        setIsLoading(false)
        return // Salir - usamos Supabase (aunque sea vacio)
      } catch (err) {
        console.error("Error con Supabase:", err)
      }
    }

    // Sin Supabase configurado: cargar de localStorage (modo demo)
    try {
      const savedStudents = localStorage.getItem(STORAGE_STUDENTS_KEY)
      if (savedStudents) {
        const allStudents = JSON.parse(savedStudents)
        // Filtrar por sala actual
        const salaStudents = allStudents.filter((s: any) => s.sala === salaActual)
        setStudents(salaStudents)
      } else {
        setStudents([])
      }
    } catch {
      setStudents([])
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
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from('alumnos')
          .insert([{ nombre: nombreEstandarizado, sala: salaActual }])

        if (error) {
          console.error("Error agregando alumno:", error)
          alert("Error al agregar alumno: " + error.message)
        } else {
          // Re-fetch automatico para sincronizar con la base de datos
          setNewStudentName("")
          setShowAddStudent(false)
          await fetchProgreso()
        }
      } else {
        // Demo mode - guardar en localStorage
        const newId = `demo-${Date.now()}`
        const newStudent = {
          id: newId,
          name: nombreEstandarizado,
          nombre: nombreEstandarizado,
          sala: salaActual,
        }
        
        // Actualizar estado local
        setStudents(prev => [...prev, newStudent])
        
        // Persistir en localStorage
        try {
          const savedStudents = localStorage.getItem(STORAGE_STUDENTS_KEY)
          const allStudents = savedStudents ? JSON.parse(savedStudents) : []
          allStudents.push(newStudent)
          localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(allStudents))
        } catch (err) {
          console.error("Error guardando en localStorage:", err)
        }
        
        setNewStudentName("")
        setShowAddStudent(false)
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
      if (isSupabaseConfigured() && supabase) {
        const inserts = nombres.map(nombre => ({ nombre, sala: salaActual }))
        const { error } = await supabase
          .from('alumnos')
          .insert(inserts)

        if (error) {
          console.error("Error agregando alumnos:", error)
          alert("Error al agregar alumnos: " + error.message)
        } else {
          // Re-fetch automatico para sincronizar con la base de datos
          setBulkNames("")
          setShowConfigSala(false)
          await fetchProgreso()
        }
      } else {
        // Demo mode - guardar en localStorage
        const newStudents = nombres.map((nombre, i) => ({
          id: `demo-${Date.now()}-${i}`,
          name: nombre,
          nombre: nombre,
          sala: salaActual,
        }))
        
        // Actualizar estado local
        setStudents(prev => [...prev, ...newStudents])
        
        // Persistir en localStorage
        try {
          const savedStudents = localStorage.getItem(STORAGE_STUDENTS_KEY)
          const allStudents = savedStudents ? JSON.parse(savedStudents) : []
          allStudents.push(...newStudents)
          localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(allStudents))
        } catch (err) {
          console.error("Error guardando en localStorage:", err)
        }
        
        setBulkNames("")
        setShowConfigSala(false)
      }
    } catch (err) {
      console.error("Error agregando alumnos:", err)
    } finally {
      setAddingBulk(false)
    }
  }

  // Eliminar alumno
  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Estas seguro de eliminar este alumno?")) return
    
    try {
      if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase
          .from('alumnos')
          .delete()
          .eq('id', studentId)

        if (error) {
          console.error("Error eliminando alumno:", error)
          alert("Error al eliminar: " + error.message)
          return
        }
      }
      
      // Actualizar estado local
      setStudents(prev => prev.filter(s => s.id !== studentId))
      
      // Actualizar localStorage en modo demo
      if (!isSupabaseConfigured()) {
        try {
          const savedStudents = localStorage.getItem(STORAGE_STUDENTS_KEY)
          if (savedStudents) {
            const allStudents = JSON.parse(savedStudents)
            const filtered = allStudents.filter((s: any) => s.id !== studentId)
            localStorage.setItem(STORAGE_STUDENTS_KEY, JSON.stringify(filtered))
          }
        } catch (err) {
          console.error("Error actualizando localStorage:", err)
        }
      }
      
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
  const handleEvaluacion = useCallback(async (studentId: string, status: StatusLevel, actividadDelDia: string) => {
    // Determinar el eje segun la actividad
    const eje = ACTIVIDAD_EJE_MAP[actividadDelDia] || "CF"
    
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

  // Limpiar evaluacion de un alumno (corregir error del docente)
  const handleClearEvaluacion = useCallback(async (studentId: string) => {
    // Actualizar estado local inmediatamente
    setEvaluaciones(prev => {
      const newEval = { ...prev }
      delete newEval[studentId]
      return newEval
    })
    
    // Eliminar registro de hoy en Supabase (para corregir error)
    if (isSupabaseConfigured() && supabase) {
      try {
        const today = new Date().toISOString().split('T')[0]
        const { error } = await supabase
          .from('seguimiento')
          .delete()
          .eq('alumno_id', studentId)
          .gte('fecha', `${today}T00:00:00`)
          .lte('fecha', `${today}T23:59:59`)

        if (error) {
          console.error("Error eliminando registro de Supabase:", error)
        }
      } catch (err) {
        console.error("Error con Supabase:", err)
      }
    }
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
                    isLoading={isLoading}
                  />
                </div>
                <div className="lg:col-span-8">
                  <DayPlanning />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MicroTraining 
                  ejeDelDia="CF" 
                  actividadDelDia={ACTIVIDAD_DEL_DIA} 
                />
                <AlertsPanel 
                  progress={progress}
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
