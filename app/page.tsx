"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Users, CheckCircle2, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/sia/header"
import { HeatMap } from "@/components/sia/heat-map"
import { DayPlanning } from "@/components/sia/day-planning"
import { MicroTraining } from "@/components/sia/micro-training"
import { AlertsPanel } from "@/components/sia/alerts-panel"
import { QuickRegister } from "@/components/sia/quick-register"
import ClassEvaluation from "@/components/alba/class-evaluation"
import SalaMap from "@/components/alba/sala-map"
import StudentProfile from "@/components/alba/student-profile"

export default function ALBADashboard() {
  const [activeView, setActiveView] = useState("clase")
  const [selectedSala, setSelectedSala] = useState("Manzanos")
  const [students, setStudents] = useState([])
  const [nuevoAlumno, setNuevoAlumno] = useState("")
  const [loading, setLoading] = useState(false)
  const [evaluaciones, setEvaluaciones] = useState({})
  const [mensaje, setMensaje] = useState("")

  const isSupabaseReady = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const fetchStudents = useCallback(async () => {
    if (!isSupabaseReady) {
      setStudents([{ id: "1", nombre: "Alumno de Prueba", sala: "Manzanos", name: "Alumno de Prueba" }])
      return
    }
    const { data } = await supabase.from('alumnos').select('*').eq('sala', selectedSala).order('nombre')
    if (data) setStudents(data.map(s => ({ ...s, name: s.nombre })))
  }, [selectedSala, isSupabaseReady])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const agregarAlumno = async () => {
    if (!nuevoAlumno.trim() || !isSupabaseReady) return
    setLoading(true)
    await supabase.from('alumnos').insert([{ nombre: nuevoAlumno.trim(), sala: selectedSala }])
    setNuevoAlumno(""); fetchStudents(); setLoading(false)
  }

  const handleEvaluacion = async (id, status) => {
    setEvaluaciones(prev => ({ ...prev, [id]: status }))
    if (isSupabaseReady) {
      await supabase.from('seguimiento').insert([{ alumno_id: id, resultado: status, actividad: "Evaluación Diaria" }])
    }
  }

  // VISTAS ESPECIALES (Mapas y Perfiles)
  if (activeView === "mapa") return (
    <div className="min-h-screen bg-background">
      <Header activeView={activeView} onNavigate={setActiveView} selectedSala={selectedSala} onSalaChange={setSelectedSala} />
      <SalaMap students={students} onStudentClick={() => setActiveView("perfil")} />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header activeView={activeView} onNavigate={setActiveView} selectedSala={selectedSala} onSalaChange={setSelectedSala} />
      
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full space-y-6">
        {/* Sección de Carga */}
        <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex gap-2">
            <input className="flex-1 border rounded-lg px-3 py-2 text-sm" placeholder="Nuevo alumno..." value={nuevoAlumno} onChange={(e) => setNuevoAlumno(e.target.value)} />
            <button onClick={agregarAlumno} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Cargar</button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <HeatMap evaluaciones={evaluaciones} onEvaluacion={handleEvaluacion} students={students} />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <DayPlanning sala={selectedSala} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MicroTraining ejeDelDia="CF" actividadDelDia="Sonidos" />
              <AlertsPanel students={students} progress={evaluaciones} />
              <QuickRegister actividadDelDia="Alfabetización" evaluados={Object.keys(evaluaciones).length} totalAlumnos={students.length} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Users, LayoutDashboard, Map as MapIcon, ClipboardList, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

// Importación de todos tus componentes originales
import { Header } from "@/components/sia/header"
import { HeatMap } from "@/components/sia/heat-map"
import { DayPlanning } from "@/components/sia/day-planning"
import { MicroTraining } from "@/components/sia/micro-training"
import { AlertsPanel } from "@/components/sia/alerts-panel"
import { QuickRegister } from "@/components/sia/quick-register"

// Estos son los que se habían "perdido"
import SalaMap from "@/components/alba/sala-map" 
import { QuarterlyReport } from "@/components/sia/quarterly-report" 

export default function ALBADashboard() {
  const [activeView, setActiveView] = useState("clase") // "clase", "mapa", "registro"
  const [selectedSala, setSelectedSala] = useState("Manzanos")
  const [students, setStudents] = useState([])
  const [nuevoAlumno, setNuevoAlumno] = useState("")
  const [loading, setLoading] = useState(false)
  const [evaluaciones, setEvaluaciones] = useState({})

  const isSupabaseReady = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const fetchStudents = useCallback(async () => {
    if (!isSupabaseReady) {
      // Datos de relleno para que no se vea vacío en v0
      setStudents([{ id: "1", nombre: "Alumno de Prueba", sala: selectedSala, name: "Alumno de Prueba" }])
      return
    }
    const { data } = await supabase.from('alumnos').select('*').eq('sala', selectedSala).order('nombre')
    if (data) setStudents(data.map(s => ({ ...s, name: s.nombre })))
  }, [selectedSala, isSupabaseReady])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const handleEvaluacion = async (id, status) => {
    setEvaluaciones(prev => ({ ...prev, [id]: status }))
    if (isSupabaseReady) {
      await supabase.from('seguimiento').insert([{ alumno_id: id, resultado: status, actividad: "Control Diario" }])
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* El Header ahora controla la navegación de nuevo */}
      <Header 
        activeView={activeView} 
        onNavigate={setActiveView} 
        selectedSala={selectedSala} 
        onSalaChange={setSelectedSala} 
      />
      
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
        
        {/* VISTA 1: DASHBOARD DE CLASE (Lo que ves siempre) */}
        {activeView === "clase" && (
          <div className="space-y-6">
            {/* Panel de Carga (Solo para maestras al inicio) */}
            <section className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex gap-3 items-center">
              <Users className="w-5 h-5 text-blue-500" />
              <input 
                className="flex-1 border-none bg-slate-50 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Nombre del alumno nuevo..." 
                value={nuevoAlumno} 
                onChange={(e) => setNuevoAlumno(e.target.value)} 
              />
              <button 
                onClick={async () => {
                  if(!nuevoAlumno || !isSupabaseReady) return
                  await supabase.from('alumnos').insert([{ nombre: nuevoAlumno, sala: selectedSala }])
                  setNuevoAlumno(""); fetchStudents()
                }} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Cargar
              </button>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <HeatMap evaluaciones={evaluaciones} onEvaluacion={handleEvaluacion} students={students} />
              </div>
              <div className="lg:col-span-8 space-y-6">
                <DayPlanning sala={selectedSala} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MicroTraining ejeDelDia="Conciencia Fonológica" actividadDelDia="Rimas" />
                  <AlertsPanel students={students} progress={evaluaciones} />
                  <QuickRegister actividadDelDia="Alfabetización" evaluados={Object.keys(evaluaciones).length} totalAlumnos={students.length} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 2: MAPA DE SALA (Si el botón de mapas no cargaba, esto lo arregla) */}
        {activeView === "mapa" && (
          <SalaMap students={students} onStudentClick={() => setActiveView("perfil")} />
        )}

        {/* VISTA 3: REGISTRO CUATRIMESTRAL */}
        {activeView === "registro" && (
          <QuarterlyReport selectedSala={selectedSala} />
        )}
      </main>
    </div>
  )
}