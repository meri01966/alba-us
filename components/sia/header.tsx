"use client"

import { useState } from "react"
import { User, Calendar, BookOpen, Database, Home, FileText, X } from "lucide-react"

type ViewType = "clase" | "evaluar" | "mapa" | "perfil"

// Registro de actividad por dia
export interface DiaActividad {
  fecha: string
  eje: "CF" | "CT" | "O" | null
  actividad: string | null
  completado: boolean
}

interface HeaderProps {
  activeView?: ViewType
  onNavigate?: (view: ViewType) => void
  onSintesis?: () => void
  salaActual?: string
  historialSemana?: DiaActividad[]
  onDiaClick?: (dia: DiaActividad) => void
}

// Colores por eje
const EJE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CF: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
  CT: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
  O: { bg: "#dcfce7", text: "#166534", border: "#22c55e" },
}

export function Header({ activeView = "clase", onNavigate, onSintesis, salaActual = "Manzanos", historialSemana = [], onDiaClick }: HeaderProps) {
  const [selectedDia, setSelectedDia] = useState<DiaActividad | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)

  // Dias de la semana actual
  const diasSemana = ["L", "M", "X", "J", "V"]
  const hoy = new Date()
  const diaActual = hoy.getDay() // 0=Dom, 1=Lun...

  // Generar dias de la semana con datos
  const getSemanaConDatos = () => {
    const inicio = new Date(hoy)
    inicio.setDate(hoy.getDate() - (diaActual === 0 ? 6 : diaActual - 1))
    
    return diasSemana.map((nombre, i) => {
      const fecha = new Date(inicio)
      fecha.setDate(inicio.getDate() + i)
      const fechaStr = fecha.toISOString().split("T")[0]
      
      const registro = historialSemana.find(h => h.fecha === fechaStr)
      const esHoy = fecha.toDateString() === hoy.toDateString()
      const esPasado = fecha < hoy && !esHoy
      
      return {
        nombre,
        fecha: fechaStr,
        diaNum: fecha.getDate(),
        esHoy,
        esPasado,
        eje: registro?.eje || null,
        actividad: registro?.actividad || null,
        completado: registro?.completado || false,
      }
    })
  }

  const semana = getSemanaConDatos()

  const handleDiaClick = (dia: typeof semana[0]) => {
    if (dia.completado) {
      setSelectedDia({
        fecha: dia.fecha,
        eje: dia.eje,
        actividad: dia.actividad,
        completado: dia.completado,
      })
      setShowCalendar(true)
    }
    if (onDiaClick && dia.completado) {
      onDiaClick({
        fecha: dia.fecha,
        eje: dia.eje,
        actividad: dia.actividad,
        completado: dia.completado,
      })
    }
  }

  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="px-4 py-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">ALBA</h1>
              <p className="text-xs sm:text-sm text-primary-foreground/70 font-medium">
                Alfabetizacion con Acompanamiento
              </p>
            </div>
          </div>

          {/* Navigation buttons */}
          {onNavigate && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate("clase")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: activeView === "clase" ? "rgba(212,135,14,0.15)" : "transparent",
                  border: activeView === "clase" ? "1px solid #D4870E" : "1px solid rgba(255,255,255,0.2)",
                  color: activeView === "clase" ? "#D4870E" : "rgba(255,255,255,0.7)",
                }}
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clase</span>
              </button>

              <button
                onClick={() => onNavigate("mapa")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: activeView === "mapa" || activeView === "perfil" ? "rgba(212,135,14,0.15)" : "transparent",
                  border: activeView === "mapa" || activeView === "perfil" ? "1px solid #D4870E" : "1px solid rgba(255,255,255,0.2)",
                  color: activeView === "mapa" || activeView === "perfil" ? "#D4870E" : "rgba(255,255,255,0.7)",
                }}
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Datos</span>
              </button>
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-3 sm:gap-4 text-sm">
            {/* Boton Sintesis Pedagogica */}
            {onSintesis && (
              <button
                onClick={onSintesis}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sintesis</span>
              </button>
            )}
            {/* Classroom */}
            <div className="flex items-center gap-2">
              <span className="text-primary-foreground/60 text-xs hidden sm:inline">Sala:</span>
              <span className="font-semibold px-2.5 py-1 bg-white/10 rounded-lg text-sm">
                {salaActual}
              </span>
            </div>

            {/* Calendario semanal interactivo */}
            <div className="flex items-center gap-1.5">
              {semana.map((dia) => (
                <button
                  key={dia.fecha}
                  onClick={() => handleDiaClick(dia)}
                  className="flex flex-col items-center transition-all"
                  style={{
                    opacity: dia.completado ? 1 : 0.5,
                    cursor: dia.completado ? "pointer" : "default",
                  }}
                  disabled={!dia.completado}
                >
                  <span className="text-[10px] text-primary-foreground/60">{dia.nombre}</span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all"
                    style={{
                      backgroundColor: dia.completado && dia.eje
                        ? EJE_COLORS[dia.eje]?.bg || "rgba(156,163,175,0.3)"
                        : dia.esHoy
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(255,255,255,0.05)",
                      color: dia.completado && dia.eje
                        ? EJE_COLORS[dia.eje]?.text || "#6b7280"
                        : dia.esHoy
                        ? "#fff"
                        : "rgba(255,255,255,0.4)",
                      border: dia.esHoy
                        ? "2px solid #D4870E"
                        : dia.completado && dia.eje
                        ? `1px solid ${EJE_COLORS[dia.eje]?.border || "#9ca3af"}`
                        : "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {dia.diaNum}
                  </div>
                  {dia.completado && dia.eje && (
                    <span className="text-[8px] font-semibold mt-0.5" style={{ color: EJE_COLORS[dia.eje]?.border }}>
                      {dia.eje}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <User className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xs text-primary-foreground/60">Docente:</span>
                <span className="font-medium ml-1">Mariana</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de detalle del dia */}
      {showCalendar && selectedDia && (
        <div className="absolute top-20 right-4 z-50 bg-white rounded-xl shadow-2xl border p-4 w-72">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-gray-800">
              {new Date(selectedDia.fecha + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "short" })}
            </h3>
            <button onClick={() => setShowCalendar(false)} className="p-1 hover:bg-gray-100 rounded">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          {selectedDia.eje && (
            <div 
              className="rounded-lg p-3 mb-3"
              style={{ 
                backgroundColor: EJE_COLORS[selectedDia.eje]?.bg,
                border: `1px solid ${EJE_COLORS[selectedDia.eje]?.border}`,
              }}
            >
              <span 
                className="text-xs font-bold uppercase"
                style={{ color: EJE_COLORS[selectedDia.eje]?.text }}
              >
                Eje: {selectedDia.eje === "CF" ? "Conciencia Fonologica" : selectedDia.eje === "CT" ? "Comprension de Textos" : "Oralidad"}
              </span>
            </div>
          )}
          
          {selectedDia.actividad && (
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs text-gray-500 uppercase font-semibold">Actividad realizada:</span>
              <p className="text-sm text-gray-800 font-medium mt-1">{selectedDia.actividad}</p>
            </div>
          )}
          
          {!selectedDia.actividad && (
            <p className="text-sm text-gray-400 italic">Sin registro de actividad</p>
          )}
        </div>
      )}
    </header>
  )
}
