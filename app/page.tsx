"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Users, CheckCircle2 } from "lucide-react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"
import { Header } from "@/components/sia/header"
import { HeatMap } from "@/components/sia/heat-map"
import { DayPlanning } from "@/components/sia/day-planning"
import { MicroTraining } from "@/components/sia/micro-training"
import { AlertsPanel } from "@/components/sia/alerts-panel"
import { QuickRegister } from "@/components/sia/quick-register"

// Datos demo cuando Supabase no esta configurado
const DEMO_STUDENTS = [
  { id: "1", nombre: "Sofia Martinez", name: "Sofia Martinez" },
  { id: "2", nombre: "Martin Lopez", name: "Martin Lopez" },
  { id: "3", nombre: "Lucia Fernandez", name: "Lucia Fernandez" },
  { id: "4", nombre: "Tomas Garcia", name: "Tomas Garcia" },
  { id: "5", nombre: "Valentina Rodriguez", name: "Valentina Rodriguez" },
  { id: "6", nombre: "Mateo Gonzalez", name: "Mateo Gonzalez" },
  { id: "7", nombre: "Emma Sanchez", name: "Emma Sanchez" },
  { id: "8", nombre: "Benjamin Diaz", name: "Benjamin Diaz" },
]

type StatusLevel = "green" | "yellow" | "red"

export default function ALBADashboard() {
  const [activeView, setActiveView] = useState("clase")
  const [selectedSala, setSelectedSala] = useState("Manzanos")
  const [students, setStudents] = useState<any[]>([])
  const [nuevoAlumno, setNuevoAlumno] = useState("")
  const [loading, setLoading] = useState(false)
  const [evaluaciones, setEvaluaciones] = useState<Record<string, StatusLevel>>({})
  const [mensaje, setMensaje] = useState("")
  const [progress, setProgress] = useState<Record<string, { CF: number; CT: number; O: number }>>({})

  // Cargar alumnos
  const fetchStudents = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      // Cargar desde Supabase
      const { data, error } = await supabase
        .from('alumnos')
        .select('*')
        .eq('sala', selectedSala)
        .order('nombre')

      if (data && !error) {
        setStudents(data.map(s => ({ ...s, name: s.nombre })))
      } else {
        // Fallback a demo si hay error
        setStudents(DEMO_STUDENTS)
      }
    } else {
      // Usar datos demo
      setStudents(DEMO_STUDENTS)
    }
  }, [selectedSala])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  // Agregar alumno
  const agregarAlumno = async () => {
    if (!nuevoAlumno.trim()) return
    setLoading(true)
    
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('alumnos')
        .insert([{ nombre: nuevoAlumno.trim(), sala: selectedSala }])
      
      if (!error) {
        setNuevoAlumno("")
        setMensaje("Alumno cargado!")
        setTimeout(() => setMensaje(""), 3000)
        fetchStudents()
      }
    } else {
      // Demo mode: agregar localmente
      const newStudent = {
        id: Date.now().toString(),
        nombre: nuevoAlumno.trim(),
        name: nuevoAlumno.trim()
      }
      setStudents(prev => [...prev, newStudent])
      setNuevoAlumno("")
      setMensaje("Alumno cargado (modo demo)")
      setTimeout(() => setMensaje(""), 3000)
    }
    setLoading(false)
  }

  // Guardar evaluacion
  const handleEvaluacion = async (studentId: string, status: StatusLevel, actividad?: string) => {
    setEvaluaciones(prev => ({ ...prev, [studentId]: status }))
    
    // Actualizar progreso
    const statusToProgress = (s: StatusLevel) => s === "green" ? 100 : s === "yellow" ? 50 : 10
    setProgress(prev => ({
      ...prev,
      [studentId]: {
        CF: statusToProgress(status),
        CT: prev[studentId]?.CT || 50,
        O: prev[studentId]?.O || 50,
      }
    }))
    
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('seguimiento')
        .insert([{
          alumno_id: studentId,
          resultado: status,
          actividad: actividad || "Evaluacion Diaria",
          fecha: new Date().toISOString()
        }])
      
      if (error) console.error("Error al guardar:", error)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Header 
        activeView={activeView} 
        onNavigate={setActiveView} 
        onSintesis={() => {}}
      />
      
      <main className="flex-1 p-2 lg:p-3 overflow-hidden">
        <div className="max-w-[1600px] mx-auto h-full flex flex-col gap-2">
          
          {/* Banner: Supabase no configurado */}
          {!isSupabaseConfigured && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
              Modo demo: Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para conectar con tu base de datos.
            </div>
          )}

          {/* Panel de carga de alumnos */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Users className="w-4 h-4 text-blue-600" /> 
                Sala {selectedSala}
              </div>
              <input 
                className="flex-1 border-slate-200 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Nombre del alumno..."
                value={nuevoAlumno}
                onChange={(e) => setNuevoAlumno(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && agregarAlumno()}
              />
              <button 
                onClick={agregarAlumno}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> 
                {loading ? '...' : 'Agregar'}
              </button>
              {mensaje && (
                <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {mensaje}
                </span>
              )}
            </div>
          </div>

          {/* Fila superior: HeatMap + DayPlanning */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-4">
              <HeatMap 
                evaluaciones={evaluaciones}
                onEvaluacion={handleEvaluacion}
                students={students}
              />
            </div>
            <div className="col-span-8">
              <DayPlanning />
            </div>
          </div>
          
          {/* Fila inferior: 3 paneles */}
          <div className="grid grid-cols-3 gap-2 flex-1 min-h-0">
            <MicroTraining ejeDelDia="CF" />
            <AlertsPanel 
              progress={progress}
              students={students}
            />
            <QuickRegister 
              actividadDelDia="Conciencia Fonologica"
              evaluados={Object.keys(evaluaciones).length}
              totalAlumnos={students.length}
            />
          </div>
        </div>
      </main>

      <footer className="py-1 px-4 text-center text-xs text-slate-400 border-t bg-white">
        ALBA · Alfabetizacion con Acompanamiento · Nivel Inicial
      </footer>
    </div>
  )
}
