"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Users, Save, CheckCircle2, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
// Importaciones simplificadas para evitar errores de ruta
import { Header } from "@/components/sia/header"
import { HeatMap } from "@/components/sia/heat-map"
import { DayPlanning } from "@/components/sia/day-planning"
import { QuickRegister } from "@/components/sia/quick-register"

export default function ALBADashboard() {
  const [activeView, setActiveView] = useState("clase")
  const [selectedSala, setSelectedSala] = useState("Manzanos")
  const [students, setStudents] = useState([])
  const [nuevoAlumno, setNuevoAlumno] = useState("")
  const [loading, setLoading] = useState(false)
  const [evaluaciones, setEvaluaciones] = useState({})
  const [mensaje, setMensaje] = useState("")

  // VERIFICACIÓN DE SEGURIDAD: ¿Están las llaves configuradas?
  const isSupabaseReady = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const fetchStudents = useCallback(async () => {
    // Si no hay llaves, cargamos alumnos de "mentira" para que v0 no se vea blanco
    if (!isSupabaseReady) {
      setStudents([
        { id: "1", nombre: "Alumno de Prueba (Modo Diseño)", sala: "Manzanos", name: "Alumno de Prueba" }
      ])
      return
    }

    try {
      const { data, error } = await supabase
        .from('alumnos')
        .select('*')
        .eq('sala', selectedSala)
        .order('nombre')

      if (data) setStudents(data.map(s => ({ ...s, name: s.nombre })))
    } catch (e) {
      console.log("Esperando conexión con Supabase...")
    }
  }, [selectedSala, isSupabaseReady])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const agregarAlumno = async () => {
    if (!nuevoAlumno.trim()) return
    if (!isSupabaseReady) {
      setMensaje("⚠️ Error: Llaves no configuradas en v0")
      return
    }
    
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

  const handleEvaluacion = async (studentId, status) => {
    setEvaluaciones(prev => ({ ...prev, [studentId]: status }))
    
    if (isSupabaseReady) {
      await supabase.from('seguimiento').insert([{
        alumno_id: studentId,
        resultado: status,
        actividad: "Evaluación Diaria",
        fecha: new Date().toISOString()
      }])
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {!isSupabaseReady && (
        <div className="bg-amber-100 text-amber-800 text-xs p-2 text-center flex items-center justify-center gap-2">
          <AlertCircle className="w-3 h-3" /> 
          Estás en modo "Vista Previa". Los datos se guardarán cuando lo veas en el link de Vercel.
        </div>
      )}
      
      <Header 
        activeView={activeView} 
        onNavigate={setActiveView} 
        selectedSala={selectedSala}
        onSalaChange={setSelectedSala} 
      />
      
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full space-y-6">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Cargar Alumnos
          </h3>
          <div className="flex gap-3">
            <input 
              className="flex-1 border border-slate-200 rounded-xl px-4 py-2"
              placeholder="Nombre..."
              value={nuevoAlumno}
              onChange={(e) => setNuevoAlumno(e.target.value)}
            />
            <button onClick={agregarAlumno} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">
              {loading ? '...' : 'Cargar'}
            </button>
          </div>
          {mensaje && <p className="text-sm mt-2 text-blue-600">{mensaje}</p>}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <HeatMap evaluaciones={evaluaciones} onEvaluacion={handleEvaluacion} students={students} />
          </div>
          <div className="lg:col-span-8">
            <DayPlanning sala={selectedSala} />
            <QuickRegister actividadDelDia="Prueba" evaluados={0} totalAlumnos={students.length} />
          </div>
        </div>
      </main>
    </div>
  )
}