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

// ── Sintesis Pedagogica Cuatrimestral ──────────────────────────────────────
function SintesisPedagogicaModal({ 
  progress,
  totalStudents,
  onClose 
}: { 
  progress: Record<string, { CF: number; CT: number; O: number }>
  totalStudents: number
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
              <p className="text-sm text-slate-500">Sala Manzanos · Primer Cuatrimestre 2025 · {totalEvaluados} alumnos</p>
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
            progress={progress}
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
            progress={progress}
            totalStudents={students.length}
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
        <Header activeView={activeView} onNavigate={handleNavigate} onSintesis={() => setShowSintesis(true)} />
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
            <MicroTraining 
              ejeDelDia="CF" 
              actividadDelDia={ACTIVIDAD_DEL_DIA} 
            />
            <AlertsPanel 
              progress={progress}
              students={students}
            />
            <QuickRegister 
              actividadDelDia={ACTIVIDAD_DEL_DIA}
              evaluados={Object.keys(evaluaciones).length}
              totalAlumnos={students.length}
            />
          </div>
        </div>
      </main>
      <footer className="py-2 px-4 text-center text-xs text-muted-foreground border-t border-border">
        ALBA · Alfabetizacion con Acompanamiento · Nivel Inicial
      </footer>

      {/* Sintesis Pedagogica Modal */}
      {showSintesis && (
        <SintesisPedagogicaModal
          progress={progress}
          totalStudents={students.length}
          onClose={() => setShowSintesis(false)}
        />
      )}
    </div>
  )
}
