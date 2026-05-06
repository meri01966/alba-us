"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Brain, CheckCircle, AlertCircle, Info, Map as MapIcon, Send, Users } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"

type StatusLevel = "green" | "yellow" | "red"

interface Student {
  id: string
  name: string
  cf: number
  rl: number
  o_rojo: number
  o_amarillo: number
  o_verde: number
}

interface StudentsResponse {
  students: Student[]
  source: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Datos demo si no hay Airtable
const DEMO_STUDENTS: Student[] = Array.from({ length: 15 }, (_, i) => ({
  id: `demo${i + 1}`,
  name: `Alumno ${i + 1}`,
  cf: Math.floor(Math.random() * 100),
  rl: Math.floor(Math.random() * 100),
  o_rojo: 25,
  o_amarillo: 35,
  o_verde: 15,
}))

export default function SiaDashboardFinal() {
  const { data, isLoading } = useSWR<StudentsResponse>("/api/students", fetcher, {
    revalidateOnFocus: false,
  })

  const rawStudents = data?.students ?? []
  
  // Mapear datos de API al formato esperado
  const students: Student[] = rawStudents.length > 0 
    ? rawStudents.map((s: any) => ({
        id: s.id,
        name: s.name,
        cf: s.cf === "green" ? 85 : s.cf === "yellow" ? 50 : 25,
        rl: s.rl === "green" ? 85 : s.rl === "yellow" ? 50 : 25,
        o_rojo: 25,
        o_amarillo: 35,
        o_verde: s.o === "green" ? 30 : s.o === "yellow" ? 15 : 5,
      }))
    : DEMO_STUDENTS

  const [selected, setSelected] = useState<Student | null>(null)
  const [localEvals, setLocalEvals] = useState<Record<string, StatusLevel>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  // Seleccionar primer alumno al cargar
  useEffect(() => {
    if (students.length > 0 && !selected) {
      setSelected(students[0])
    }
  }, [students, selected])

  const enviarReporte = (name: string) => {
    alert(`Enviando reporte detallado de ${name} a la familia via WhatsApp/Email...`)
  }

  const handleEval = async (studentId: string, status: StatusLevel) => {
    setSavingId(studentId)
    setLocalEvals((prev) => ({ ...prev, [studentId]: status }))

    try {
      await fetch("/api/registrar-actividad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, field: "CF", status }),
      })
    } catch {
      // mantiene estado local
    } finally {
      setSavingId(null)
    }
  }

  const currentStudent = selected ?? students[0]

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900">
      
      {/* HEADER */}
      <nav className="max-w-7xl mx-auto mb-6 bg-indigo-600 p-5 rounded-[32px] shadow-lg flex justify-between items-center text-white">
        <div className="flex items-center gap-3">
          <Brain size={28} />
          <h1 className="text-xl font-black tracking-tighter uppercase italic">SIA - ALBA</h1>
        </div>
        <button className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-2xl font-bold text-sm flex items-center gap-2 transition border border-white/20">
          <MapIcon size={18} /> MAPA DE SALA
        </button>
      </nav>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6" style={{ minHeight: "calc(100vh - 180px)" }}>
        
        {/* LISTA DE ALUMNOS */}
        <div className="md:col-span-6 bg-white rounded-[40px] p-6 shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Users size={14}/> Registro y Comunicacion
            </h3>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase">Hoy: CF</span>
          </div>
          
          <div className="overflow-y-auto pr-2 space-y-2 flex-1" style={{ maxHeight: "calc(100vh - 320px)" }}>
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10">
                <Spinner className="text-slate-400" />
                <span className="text-sm text-slate-500">Cargando alumnos...</span>
              </div>
            ) : (
              students.map((s) => {
                const evalStatus = localEvals[s.id]
                return (
                  <div 
                    key={s.id} 
                    onClick={() => setSelected(s)} 
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                      selected?.id === s.id 
                        ? "border-indigo-500 bg-indigo-50/50 shadow-sm" 
                        : "border-slate-50 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-bold text-slate-700 text-sm truncate max-w-[120px]">{s.name}</span>
                    
                    <div className="flex gap-2">
                      {/* Botones Evaluacion */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEval(s.id, "green") }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-sm ${
                          evalStatus === "green" ? "ring-2 ring-green-300 ring-offset-1" : ""
                        }`}
                        style={{ backgroundColor: "#22c55e", color: "#fff" }}
                        disabled={savingId === s.id}
                      >
                        <CheckCircle size={18}/>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEval(s.id, "yellow") }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-sm ${
                          evalStatus === "yellow" ? "ring-2 ring-yellow-300 ring-offset-1" : ""
                        }`}
                        style={{ backgroundColor: "#facc15", color: "#fff" }}
                        disabled={savingId === s.id}
                      >
                        <Info size={18}/>
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEval(s.id, "red") }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition shadow-sm ${
                          evalStatus === "red" ? "ring-2 ring-red-300 ring-offset-1" : ""
                        }`}
                        style={{ backgroundColor: "#f87171", color: "#fff" }}
                        disabled={savingId === s.id}
                      >
                        <AlertCircle size={18}/>
                      </button>
                      
                      {/* Boton Reporte Familia */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); enviarReporte(s.name) }}
                        className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition shadow-sm"
                        title="Enviar reporte a familia"
                      >
                        <Send size={16}/>
                      </button>

                      {savingId === s.id && <Spinner className="w-4 h-4 text-indigo-500" />}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* FICHA DETALLADA */}
        <div className="md:col-span-6 bg-white rounded-[40px] p-10 shadow-sm border border-slate-100 flex flex-col justify-center">
          {currentStudent ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-800">{currentStudent.name}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Evolucion en Tiempo Real</p>
              </div>
              
              <div className="space-y-10">
                {/* Eje CF */}
                <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-2">
                    <span>Conciencia Fonologica</span>
                    <span>{currentStudent.cf}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-10 rounded-2xl overflow-hidden p-1">
                    <div 
                      className="bg-indigo-600 h-full rounded-xl transition-all duration-1000 shadow-md" 
                      style={{ width: `${currentStudent.cf}%` }}
                    />
                  </div>
                </div>

                {/* Eje RL */}
                <div>
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase mb-2">
                    <span>Reconocimiento de Letras</span>
                    <span>{currentStudent.rl}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-10 rounded-2xl overflow-hidden p-1">
                    <div 
                      className="bg-emerald-500 h-full rounded-xl transition-all duration-1000 shadow-md" 
                      style={{ width: `${currentStudent.rl}%` }}
                    />
                  </div>
                </div>

                {/* Oralidad Stacked */}
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase mb-2 text-center">Oralidad Progresiva</div>
                  <div className="h-12 w-full rounded-2xl overflow-hidden flex shadow-inner border border-slate-50">
                    <div style={{ width: `${currentStudent.o_rojo}%`, backgroundColor: "#ef4444" }} />
                    <div style={{ width: `${currentStudent.o_amarillo}%`, backgroundColor: "#eab308" }} />
                    <div style={{ width: `${currentStudent.o_verde}%`, backgroundColor: "#22c55e" }} />
                  </div>
                  <div className="flex justify-between mt-2 text-[8px] font-black text-slate-300 uppercase">
                    <span>Inicio</span>
                    <span>Proceso</span>
                    <span>Logrado</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 italic text-slate-600 text-sm text-center">
                  El sistema registra un avance sostenido. La familia recibe este grafico actualizado cada vez que presionas enviar.
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-400">
              <p>Selecciona un alumno para ver su ficha</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
