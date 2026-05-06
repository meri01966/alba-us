"use client"

import { useState, useEffect } from "react"
import { Header }         from "@/components/sia/header"
import { HeatMap }        from "@/components/sia/heat-map"
import { DayPlanning }    from "@/components/sia/day-planning"
import { MicroTraining }  from "@/components/sia/micro-training"
import { AlertsPanel }    from "@/components/sia/alerts-panel"
import { QuickRegister }  from "@/components/sia/quick-register"
import ClassEvaluation    from "@/components/alba/class-evaluation"
import SalaMap            from "@/components/alba/sala-map"
import StudentProfile     from "@/components/alba/student-profile"

type ViewType = "clase" | "evaluar" | "mapa" | "perfil"

export default function ALBADashboard() {
  const [activeView, setActiveView] = useState<ViewType>("clase")
  const [students, setStudents] = useState<any[]>([])
  const [progress, setProgress] = useState<Record<string, any>>({})
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)

  const fetchProgreso = async () => {
    try {
      const res = await fetch("/api/progreso")
      const data = await res.json()
      if (data.ok) {
        setStudents(data.alumnos)
        setProgress(data.progreso)
      }
    } catch (err) {
      console.error("Error fetching progreso:", err)
    }
  }

  useEffect(() => {
    fetchProgreso()
  }, [])

  const handleNavigate = (view: ViewType) => {
    setActiveView(view)
    if (view !== "perfil") {
      setSelectedStudent(null)
    }
  }

  if (activeView === "evaluar") {
    return (
      <div className="min-h-screen bg-background">
        <Header activeView={activeView} onNavigate={handleNavigate} />
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
      </div>
    )
  }

  if (activeView === "mapa") {
    return (
      <div className="min-h-screen bg-background">
        <Header activeView={activeView} onNavigate={handleNavigate} />
        <SalaMap
          students={students}
          progress={progress}
          onStudentClick={(id) => {
            setSelectedStudent(id)
            setActiveView("perfil")
          }}
        />
      </div>
    )
  }

  if (activeView === "perfil" && selectedStudent) {
    return (
      <div className="min-h-screen bg-background">
        <Header activeView={activeView} onNavigate={handleNavigate} />
        <StudentProfile
          alumnoId={selectedStudent}
          onBack={() => {
            setSelectedStudent(null)
            setActiveView("mapa")
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header activeView={activeView} onNavigate={handleNavigate} />
      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-4">
              <HeatMap />
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
    </div>
  )
}
