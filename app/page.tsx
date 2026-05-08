"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Users } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Header } from "@/components/sia/header"
import { HeatMap } from "@/components/sia/heat-map"
import { DayPlanning } from "@/components/sia/day-planning"
import { MicroTraining } from "@/components/sia/micro-training"
import { AlertsPanel } from "@/components/sia/alerts-panel"
import { QuickRegister } from "@/components/sia/quick-register"

export default function ALBADashboard() {
  const [activeView, setActiveView] = useState("clase")
  const [selectedSala, setSelectedSala] = useState("Manzanos")
  const [students, setStudents] = useState<any[]>([])
  const [nuevoAlumno, setNuevoAlumno] = useState("")
  const [evaluaciones, setEvaluaciones] = useState<Record<string, string>>({})

  const isSupabaseReady = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const fetchStudents = useCallback(async () => {
    if (!isSupabaseReady) {
      // Datos demo cuando Supabase no esta configurado
      setStudents([
        { id: "1", nombre: "Sofia Martinez", name: "Sofia Martinez" },
        { id: "2", nombre: "Martin Lopez", name: "Martin Lopez" },
        { id: "3", nombre: "Lucia Fernandez", name: "Lucia Fernandez" },
        { id: "4", nombre: "Juan Rodriguez", name: "Juan Rodriguez" },
        { id: "5", nombre: "Valentina Garcia", name: "Valentina Garcia" },
        { id: "6", nombre: "Mateo Gonzalez", name: "Mateo Gonzalez" },
        { id: "7", nombre: "Camila Perez", name: "Camila Perez" },
        { id: "8", nombre: "Benjamin Diaz", name: "Benjamin Diaz" },
      ])
      return
    }
    const { data } = await supabase.from('alumnos').select('*').eq('sala', selectedSala).order('nombre')
    if (data) setStudents(data.map(s => ({ ...s, name: s.nombre })))
  }, [selectedSala, isSupabaseReady])

  useEffect(() => { fetchStudents() }, [fetchStudents])

  const handleEvaluacion = async (id: string, status: string) => {
    setEvaluaciones(prev => ({ ...prev, [id]: status }))
    if (isSupabaseReady) {
      await supabase.from('seguimiento').insert([{ alumno_id: id, resultado: status, actividad: "Evaluacion Diaria" }])
    }
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <Header activeView={activeView} onNavigate={setActiveView} />
      
      <main className="flex-1 p-2 lg:p-3 overflow-hidden">
        <div className="max-w-[1600px] mx-auto h-full grid grid-rows-[auto_1fr] gap-2">
          
          {/* Panel de carga rapida */}
          {isSupabaseReady && (
            <section className="bg-white px-3 py-2 rounded-lg border border-blue-100 shadow-sm flex gap-2 items-center">
              <Users className="w-4 h-4 text-blue-500" />
              <input 
                className="flex-1 bg-slate-50 rounded-lg px-3 py-1.5 text-sm outline-none" 
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
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Cargar
              </button>
            </section>
          )}

          {/* Fila superior: HeatMap + DayPlanning */}
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-4">
              <HeatMap evaluaciones={evaluaciones} onEvaluacion={handleEvaluacion} students={students} />
            </div>
            <div className="col-span-8">
              <DayPlanning />
            </div>
          </div>
          
          {/* Fila inferior: 3 paneles */}
          <div className="grid grid-cols-3 gap-2 min-h-0">
            <MicroTraining ejeDelDia="CF" actividadDelDia="Rimas y sonidos" />
            <AlertsPanel students={students} progress={evaluaciones} />
            <QuickRegister actividadDelDia="Alfabetizacion" evaluados={Object.keys(evaluaciones).length} totalAlumnos={students.length} />
          </div>
        </div>
      </main>
      
      <footer className="py-1 px-4 text-center text-xs text-slate-400 border-t border-slate-200">
        ALBA - Alfabetizacion con Acompanamiento - Nivel Inicial
      </footer>
    </div>
  )
}
