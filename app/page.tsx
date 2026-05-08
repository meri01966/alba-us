"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Users, Save, Trash2, CheckCircle2 } from "lucide-react"
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
  const [students, setStudents] = useState([])
  const [nuevoAlumno, setNuevoAlumno] = useState("")
  const [loading, setLoading] = useState(false)
  const [evaluaciones, setEvaluaciones] = useState({})
  const [mensaje, setMensaje] = useState("")

  // 1. Cargar alumnos de la sala seleccionada desde Supabase
  const fetchStudents = useCallback(async () => {
    const { data, error } = await supabase
      .from('alumnos')
      .select('*')
      .eq('sala', selectedSala)
      .order('nombre')

    if (data) {
      setStudents(data.map(s => ({ ...s, name: s.nombre })))
    }
  }, [selectedSala])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  // 2. Función para que la maestra cargue un alumno nuevo
  const agregarAlumno = async () => {
    if (!nuevoAlumno.trim()) return
    setLoading(true)
    const { error } = await supabase
      .from('alumnos')
      .insert([{ nombre: nuevoAlumno.trim(), sala: selectedSala }])
    
    if (!error) {
      setNuevoAlumno("")
      setMensaje("¡Alumno cargado!")
      setTimeout(() => setMensaje(""), 3000)
      fetchStudents()
    }
    setLoading(false)
  }

  // 3. Función para guardar evaluaciones (los círculos de colores)
  const handleEvaluacion = async (studentId, status) => {
    setEvaluaciones(prev => ({ ...prev, [studentId]: status }))
    
    const { error } = await supabase
      .from('seguimiento')
      .insert([{
        alumno_id: studentId,
        resultado: status,
        actividad: "Evaluación Diaria",
        fecha: new Date().toISOString()
      }])
    
    if (error) console.error("Error al guardar:", error)
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header 
        activeView={activeView} 
        onNavigate={setActiveView} 
        selectedSala={selectedSala}
        onSalaChange={setSelectedSala} 
      />
      
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full space-y-6">
        
        {/* PANEL DE CARGA DE ALUMNOS (Para principio de año) */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <Users className="w-5 h-5 text-blue-600" /> 
              Cargar Alumnos en Sala {selectedSala}
            </h3>
            {mensaje && <span className="text-green-600 text-sm font-medium flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> {mensaje}
            </span>}
          </div>
          
          <div className="flex gap-3">
            <input 
              className="flex-1 border-slate-200 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="Nombre y Apellido del niño/a..."
              value={nuevoAlumno}
              onChange={(e) => setNuevoAlumno(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && agregarAlumno()}
            />
            <button 
              onClick={agregarAlumno}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
            >
              <Plus className="w-5 h-5" /> 
              {loading ? 'Cargando...' : 'Cargar'}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-3 italic">
            * Los alumnos cargados aquí aparecerán automáticamente en el Dashboard de esta sala.
          </p>
        </section>

        {/* DASHBOARD PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* MAPA DE CALOR / LISTA DE ALUMNOS */}
          <div className="lg:col-span-4">
            {students.length > 0 ? (
              <HeatMap 
                evaluaciones={evaluaciones}
                onEvaluacion={handleEvaluacion}
                students={students}
              />
            ) : (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No hay alumnos en la Sala {selectedSala}</p>
                <p className="text-slate-400 text-sm">Usá el buscador de arriba para empezar la lista.</p>
              </div>
            )}
          </div>
          
          {/* PLANIFICACIÓN Y ALERTAS */}
          <div className="lg:col-span-8 space-y-6">
            <DayPlanning sala={selectedSala} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <QuickRegister 
                actividadDelDia="Alfabetización Inicial"
                evaluados={Object.keys(evaluaciones).length}
                totalAlumnos={students.length}
              />
              <AlertsPanel 
                students={students}
                progress={evaluaciones}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 border-t bg-white">
        ALBA · Sistema de Acompañamiento Pedagógico · v2.0
      </footer>
    </div>
  )
}