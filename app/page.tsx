"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, X, ListChecks } from "lucide-react"
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

// Actividad del dia para el reporte
const ACTIVIDAD_DEL_DIA = "Reconocimiento de Sonido Inicial /M/"

// ── Sintesis Pedagogica Modal ──────────────────────────────────────────────
function SintesisPedagogicaModal({ 
  evaluaciones,
  totalStudents,
  onClose 
}: { 
  evaluaciones: Record<string, StatusLevel>
  totalStudents: number
  onClose: () => void 
}) {
  const [bulletMode, setBulletMode] = useState(false)
  
  // Contar por nivel
  const counts = { green: 0, yellow: 0, red: 0 }
  Object.values(evaluaciones).forEach(status => {
    if (status in counts) counts[status as keyof typeof counts]++
  })
  
  const evaluados = Object.keys(evaluaciones).length
  const porcentajeAvanzado = evaluados > 0 ? Math.round((counts.green / evaluados) * 100) : 0
  const porcentajeProceso = evaluados > 0 ? Math.round((counts.yellow / evaluados) * 100) : 0
  const porcentajeRefuerzo = evaluados > 0 ? Math.round((counts.red / evaluados) * 100) : 0

  const propositos = `Durante este periodo, nuestro foco principal fue la estimulacion de la conciencia fonologica, especificamente la identificacion de fonemas base para iniciar el proceso de alfabetizacion. Trabajamos con la actividad "${ACTIVIDAD_DEL_DIA}" para fortalecer el reconocimiento auditivo y la asociacion sonido-palabra.`

  const logros = porcentajeAvanzado >= 50
    ? `Hemos observado un avance consolidado en el ${porcentajeAvanzado}% de los evaluados, quienes ya logran discriminar sonidos con autonomia. El grupo muestra una maduracion notable en la escucha atenta y la asociacion fonema-grafema.`
    : porcentajeProceso >= 30
    ? `El ${porcentajeProceso}% de los evaluados esta en proceso de consolidacion, mostrando avances graduales en la discriminacion de sonidos. El ${porcentajeAvanzado}% ya domina estas habilidades con autonomia.`
    : `Identificamos que el ${porcentajeRefuerzo}% de los evaluados requiere acompanamiento adicional. Estamos implementando estrategias diferenciadas para fortalecer estas habilidades fundamentales.`

  const estrategias = `Implementamos dinamicas de rimas, juegos sonoros grupales y el uso de nuestras fichas diagnosticas para personalizar el apoyo segun la necesidad de cada nino. Utilizamos canciones con repeticion de fonemas, imagenes asociativas y actividades de segmentacion silabica.`

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          backgroundImage: "linear-gradient(to bottom, #fefefe 0%, #f9f9f9 100%)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#1e3a5f" }}>
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "#1e3a5f", fontFamily: "Georgia, serif" }}>
                  Sintesis Pedagogica
                </h2>
                <p className="text-sm text-slate-500">Sala Manzanos · Dia 37 · {evaluados} evaluados</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              type="button"
              className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6" style={{ fontFamily: "Georgia, serif" }}>
          
          {/* Bloque 1: Propositos */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#1e3a5f" }}>1</div>
              <h3 className="font-bold text-lg" style={{ color: "#1e3a5f" }}>Que nos propusimos</h3>
            </div>
            {bulletMode ? (
              <ul className="list-disc list-inside text-slate-700 leading-relaxed space-y-1 ml-8">
                <li>Foco en conciencia fonologica</li>
                <li>Identificacion de fonemas base</li>
                <li>Actividad: {ACTIVIDAD_DEL_DIA}</li>
                <li>Reconocimiento auditivo y asociacion sonido-palabra</li>
              </ul>
            ) : (
              <p className="text-slate-700 leading-relaxed ml-8">{propositos}</p>
            )}
          </section>

          {/* Bloque 2: Logros */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#6366f1" }}>2</div>
              <h3 className="font-bold text-lg" style={{ color: "#6366f1" }}>Que logramos</h3>
            </div>
            {bulletMode ? (
              <ul className="list-disc list-inside text-slate-700 leading-relaxed space-y-1 ml-8">
                <li>{counts.green} alumnos avanzados ({porcentajeAvanzado}%)</li>
                <li>{counts.yellow} alumnos en proceso ({porcentajeProceso}%)</li>
                <li>{counts.red} alumnos requieren refuerzo ({porcentajeRefuerzo}%)</li>
              </ul>
            ) : (
              <p className="text-slate-700 leading-relaxed ml-8">{logros}</p>
            )}
            {/* Mini grafico - usa tonos de azul/violeta para no confundir con semaforo */}
            <div className="flex gap-1 mt-3 ml-8 h-3 rounded-full overflow-hidden bg-slate-100">
              <div style={{ width: `${porcentajeAvanzado}%`, backgroundColor: "#1e3a5f" }} />
              <div style={{ width: `${porcentajeProceso}%`, backgroundColor: "#6366f1" }} />
              <div style={{ width: `${porcentajeRefuerzo}%`, backgroundColor: "#c7d2fe" }} />
            </div>
            <div className="flex gap-4 mt-2 ml-8 text-xs text-slate-500">
              <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: "#1e3a5f" }} />Avanzado</span>
              <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: "#6366f1" }} />En proceso</span>
              <span><span className="inline-block w-2 h-2 rounded-full mr-1" style={{ backgroundColor: "#c7d2fe" }} />Refuerzo</span>
            </div>
          </section>

          {/* Bloque 3: Estrategias */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "#8b5cf6" }}>3</div>
              <h3 className="font-bold text-lg" style={{ color: "#8b5cf6" }}>Como lo hicimos</h3>
            </div>
            {bulletMode ? (
              <ul className="list-disc list-inside text-slate-700 leading-relaxed space-y-1 ml-8">
                <li>Dinamicas de rimas</li>
                <li>Juegos sonoros grupales</li>
                <li>Fichas diagnosticas personalizadas</li>
                <li>Canciones con repeticion de fonemas</li>
              </ul>
            ) : (
              <p className="text-slate-700 leading-relaxed ml-8">{estrategias}</p>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 italic">
              Sintesis del recorrido grupal registrado en ALBA.
            </p>
            <button
              onClick={() => setBulletMode(!bulletMode)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all hover:scale-105"
              style={{ 
                backgroundColor: bulletMode ? "#1e3a5f" : "#f1f5f9", 
                color: bulletMode ? "#fff" : "#1e3a5f" 
              }}
            >
              <ListChecks className="w-4 h-4" />
              {bulletMode ? "Ver narrativa" : "Preparar para Reunion"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ALBADashboard() {
  const [activeView, setActiveView] = useState<ViewType>("clase")
  const [students, setStudents] = useState<any[]>([])
  const [progress, setProgress] = useState<Record<string, { CF: number; CT: number; O: number }>>({})
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [showSintesis, setShowSintesis] = useState(false)
  
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
    }
  }, [evaluaciones])

  // Guardar progreso en localStorage cuando cambie
  useEffect(() => {
    if (Object.keys(progress).length > 0) {
      localStorage.setItem(STORAGE_PROGRESS_KEY, JSON.stringify(progress))
    }
  }, [progress])

  const fetchProgreso = useCallback(async () => {
    try {
      const res = await fetch("/api/progreso")
      const data = await res.json()
      if (data.ok) {
        setStudents(data.alumnos)
        // Solo cargar progreso de API si no hay guardado local
        const savedProgress = localStorage.getItem(STORAGE_PROGRESS_KEY)
        if (!savedProgress) {
          setProgress(data.progreso)
        }
      }
    } catch (err) {
      console.error("Error fetching progreso:", err)
    }
  }, [])

  useEffect(() => {
    fetchProgreso()
  }, [fetchProgreso])

  const handleNavigate = (view: ViewType) => {
    setActiveView(view)
    if (view !== "perfil") {
      setSelectedStudent(null)
    }
  }

  // Callback cuando se evalua un alumno en HeatMap
  // Actualiza el progreso en tiempo real sin recargar
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

    // Persistir en API
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

  if (activeView === "evaluar") {
    return (
      <div className="min-h-screen bg-background">
        <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} />
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
            evaluaciones={evaluaciones}
            totalStudents={students.length}
            onClose={() => setShowSintesis(false)}
          />
        )}
      </div>
    )
  }

  if (activeView === "mapa") {
    return (
      <div className="min-h-screen bg-background">
        <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} />
        <SalaMap
          students={students}
          progress={progress}
          onStudentClick={(id) => {
            setSelectedStudent(id)
            setActiveView("perfil")
          }}
        />
        {showSintesis && (
          <SintesisPedagogicaModal
            evaluaciones={evaluaciones}
            totalStudents={students.length}
            onClose={() => setShowSintesis(false)}
          />
        )}
      </div>
    )
  }

  if (activeView === "perfil" && selectedStudent) {
    return (
      <div className="min-h-screen bg-background">
        <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} />
        <StudentProfile
          alumnoId={selectedStudent}
          onBack={() => {
            setSelectedStudent(null)
            setActiveView("mapa")
          }}
        />
        {showSintesis && (
          <SintesisPedagogicaModal
            evaluaciones={evaluaciones}
            totalStudents={students.length}
            onClose={() => setShowSintesis(false)}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} />
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <HeatMap 
                evaluaciones={evaluaciones}
                onEvaluacion={handleEvaluacion}
              />
            </div>
            <div className="lg:col-span-8">
              <DayPlanning />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MicroTraining />
            <AlertsPanel />
            <QuickRegister />
          </div>
        </div>
      </main>
      <footer className="py-2 px-4 text-center text-xs text-muted-foreground border-t border-border">
        ALBA · Alfabetizacion con Acompanamiento · Nivel Inicial
      </footer>

      {/* Sintesis Pedagogica Modal */}
      {showSintesis && (
        <SintesisPedagogicaModal
          evaluaciones={evaluaciones}
          totalStudents={students.length}
          onClose={() => setShowSintesis(false)}
        />
      )}
    </div>
  )
}
