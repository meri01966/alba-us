"use client"

import { useState, useEffect, useCallback } from "react"
import { FileText, X } from "lucide-react"
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
  // Contar por nivel para generar texto descriptivo
  const counts = { green: 0, yellow: 0, red: 0 }
  Object.values(evaluaciones).forEach(status => {
    if (status in counts) counts[status as keyof typeof counts]++
  })
  
  const evaluados = Object.keys(evaluaciones).length

  // Textos descriptivos sin porcentajes
  const getMayoria = () => {
    if (counts.green >= counts.yellow && counts.green >= counts.red) return "la mayoria"
    if (counts.yellow >= counts.green && counts.yellow >= counts.red) return "varios ninos"
    return "algunos ninos"
  }

  const getLogrosTexto = () => {
    if (counts.green > counts.red && counts.green > 0) {
      return `Observamos que ${getMayoria()} del grupo ya logra identificar el sonido inicial con autonomia. Muestran maduracion en la escucha atenta y comienzan a asociar sonido con palabra de forma espontanea.`
    } else if (counts.yellow > counts.red) {
      return `El grupo esta en un momento de transicion. Varios ninos estan consolidando la habilidad de discriminar sonidos, aunque todavia necesitan acompanamiento para hacerlo de forma autonoma.`
    } else {
      return `Identificamos que el grupo necesita mas tiempo y acompanamiento para fortalecer estas habilidades. Seguiremos trabajando con estrategias diferenciadas.`
    }
  }

  const getProximosPasos = () => {
    if (counts.red > 0) {
      return `Para los ninos que necesitan mas apoyo, continuaremos con juegos de rimas mas simples y repeticion de fonemas en contextos ludicos.`
    }
    return `Avanzaremos hacia la identificacion de otros fonemas y comenzaremos a introducir la asociacion con la letra escrita.`
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header simple */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold" style={{ color: "#1e3a5f" }}>
                Sintesis Pedagogica
              </h2>
              <p className="text-sm text-slate-500">Sala Manzanos · Dia 37</p>
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

        {/* Contenido narrativo limpio */}
        <div className="p-5 space-y-5 text-slate-700 leading-relaxed">
          
          <section>
            <h3 className="font-semibold mb-2" style={{ color: "#1e3a5f" }}>
              Que nos propusimos
            </h3>
            <p>
              Trabajamos con la actividad <strong>{ACTIVIDAD_DEL_DIA}</strong>, 
              enfocados en que los ninos puedan reconocer el sonido inicial de las palabras. 
              El objetivo fue fortalecer la conciencia fonologica como base para la alfabetizacion.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2" style={{ color: "#1e3a5f" }}>
              Como lo hicimos
            </h3>
            <p>
              Usamos imagenes de objetos que empiezan con el mismo sonido, 
              jugamos a aplaudir cuando escuchaban el fonema, 
              y cantamos canciones que repiten el sonido de forma divertida.
              Cada nino tuvo oportunidad de participar y practicar.
            </p>
          </section>

          <section>
            <h3 className="font-semibold mb-2" style={{ color: "#1e3a5f" }}>
              Que logramos
            </h3>
            <p>{getLogrosTexto()}</p>
            {evaluados > 0 && (
              <p className="mt-2 text-sm text-slate-500 italic">
                Se evaluaron {evaluados} ninos en esta actividad.
              </p>
            )}
          </section>

          <section>
            <h3 className="font-semibold mb-2" style={{ color: "#1e3a5f" }}>
              Proximos pasos
            </h3>
            <p>{getProximosPasos()}</p>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <p className="text-xs text-slate-400 text-center">
            Generado automaticamente por ALBA a partir del registro diario.
          </p>
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
