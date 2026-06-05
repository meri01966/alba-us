"use client"

import { useState } from "react"
import { User, Calendar, BookOpen, Home, FileText, X, ChevronLeft, ChevronRight, NotebookPen, AlertTriangle } from "lucide-react"

type ViewType = "clase" | "evaluar" | "mapa" | "perfil"

// Registro de actividad por dia
export interface DiaActividad {
  fecha: string
  eje: "CF" | "CT" | "O" | null
  actividadDocente: string | null
  actividadALBA: string | null
  completado: boolean
}

interface HeaderProps {
  activeView?: ViewType
  onNavigate?: (view: ViewType) => void
  onSintesis?: () => void
  onPlanificacion?: () => void
  onAlertas?: () => void
  alertasPendientes?: number
  salaActual?: string
  historialMes?: DiaActividad[]
}

// Colores por eje
const EJE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CF: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
  CT: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
  O: { bg: "#dcfce7", text: "#166534", border: "#22c55e" },
}

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]

export function Header({ activeView = "clase", onNavigate, onSintesis, onPlanificacion, onAlertas, alertasPendientes = 0, salaActual = "Manzanos", historialMes = [] }: HeaderProps) {
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [mesActual, setMesActual] = useState(new Date().getMonth())
  const [anioActual, setAnioActual] = useState(new Date().getFullYear())
  const [selectedDia, setSelectedDia] = useState<DiaActividad | null>(null)

  const hoy = new Date()

  // Generar dias del mes
  const getDiasDelMes = () => {
    const primerDia = new Date(anioActual, mesActual, 1)
    const ultimoDia = new Date(anioActual, mesActual + 1, 0)
    const diasEnMes = ultimoDia.getDate()
    const primerDiaSemana = primerDia.getDay()
    
    const dias: Array<{
      fecha: string
      diaNum: number
      esDelMes: boolean
      esHoy: boolean
      esPasado: boolean
      esFinde: boolean
      registro: DiaActividad | null
    }> = []

    // Dias del mes anterior para rellenar
    const mesAnterior = new Date(anioActual, mesActual, 0)
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const diaNum = mesAnterior.getDate() - i
      const fecha = new Date(anioActual, mesActual - 1, diaNum)
      dias.push({
        fecha: fecha.toISOString().split("T")[0],
        diaNum,
        esDelMes: false,
        esHoy: false,
        esPasado: true,
        esFinde: fecha.getDay() === 0 || fecha.getDay() === 6,
        registro: null,
      })
    }

    // Dias del mes actual
    for (let i = 1; i <= diasEnMes; i++) {
      const fecha = new Date(anioActual, mesActual, i)
      const fechaStr = fecha.toISOString().split("T")[0]
      const registro = historialMes.find(h => h.fecha === fechaStr) || null
      
      dias.push({
        fecha: fechaStr,
        diaNum: i,
        esDelMes: true,
        esHoy: fecha.toDateString() === hoy.toDateString(),
        esPasado: fecha < hoy && fecha.toDateString() !== hoy.toDateString(),
        esFinde: fecha.getDay() === 0 || fecha.getDay() === 6,
        registro,
      })
    }

    // Dias del mes siguiente para completar la grilla
    const diasRestantes = 42 - dias.length
    for (let i = 1; i <= diasRestantes; i++) {
      const fecha = new Date(anioActual, mesActual + 1, i)
      dias.push({
        fecha: fecha.toISOString().split("T")[0],
        diaNum: i,
        esDelMes: false,
        esHoy: false,
        esPasado: false,
        esFinde: fecha.getDay() === 0 || fecha.getDay() === 6,
        registro: null,
      })
    }

    return dias
  }

  const dias = getDiasDelMes()

  const handleMesAnterior = () => {
    if (mesActual === 0) {
      setMesActual(11)
      setAnioActual(anioActual - 1)
    } else {
      setMesActual(mesActual - 1)
    }
    setSelectedDia(null)
  }

  const handleMesSiguiente = () => {
    if (mesActual === 11) {
      setMesActual(0)
      setAnioActual(anioActual + 1)
    } else {
      setMesActual(mesActual + 1)
    }
    setSelectedDia(null)
  }

  const handleDiaClick = (dia: typeof dias[0]) => {
    if (!dia.esDelMes || dia.esFinde) return
    
    if (dia.registro) {
      setSelectedDia(dia.registro)
    } else {
      setSelectedDia(null)
    }
  }

  // Contar actividades por eje en el mes visible
  const conteoEjes = historialMes.reduce((acc, h) => {
    if (h.eje) acc[h.eje] = (acc[h.eje] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <header className="bg-gradient-to-r from-[#1e3a5f] via-[#244a73] to-[#1e3a5f] text-primary-foreground shadow-lg relative">
      <div className="px-4 py-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/15 backdrop-blur shadow-inner">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">ALBA</h1>
              <p className="text-xs sm:text-sm text-primary-foreground/70 font-medium">
                Sala de 4 y 5 anos · Alfabetizacion
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
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Alumnos</span>
              </button>
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-3 sm:gap-4 text-sm">
            {/* Boton Alertas Pedagogicas - SIEMPRE VISIBLE */}
            <button
              onClick={onAlertas}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105 relative bg-red-500/20 border border-red-400/50"
            >
              <AlertTriangle className="w-4 h-4 text-red-300" />
              <span className="text-red-200">Alertas</span>
              {alertasPendientes > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {alertasPendientes}
                </span>
              )}
            </button>

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

            {/* Boton Mi Planificacion */}
            {onPlanificacion && (
              <button
                onClick={onPlanificacion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.5)", color: "#10b981" }}
              >
                <NotebookPen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mi Planificacion</span>
              </button>
            )}
            
            {/* Classroom */}
            <div className="flex items-center gap-2">
              <span className="text-primary-foreground/60 text-xs hidden sm:inline">Sala:</span>
              <span className="font-semibold px-2.5 py-1 bg-white/10 rounded-lg text-sm">
                {salaActual}
              </span>
            </div>

            {/* Icono Calendario - abre modal de visualizacion */}
            <button
              onClick={() => setShowCalendarModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-semibold hidden sm:inline">Recorrido</span>
            </button>

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <User className="w-4 h-4 text-accent-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Calendario de Recorrido - SOLO VISUALIZACION */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={handleMesAnterior} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold">
                  {MESES[mesActual]} {anioActual}
                </h2>
                <button onClick={handleMesSiguiente} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              {/* Resumen de ejes completados */}
              <div className="flex items-center gap-3">
                <span className="text-xs opacity-70 mr-2">Actividades:</span>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: EJE_COLORS.CF.bg }}>
                  <span className="text-xs font-bold" style={{ color: EJE_COLORS.CF.text }}>CF: {conteoEjes.CF || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: EJE_COLORS.CT.bg }}>
                  <span className="text-xs font-bold" style={{ color: EJE_COLORS.CT.text }}>CT: {conteoEjes.CT || 0}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ backgroundColor: EJE_COLORS.O.bg }}>
                  <span className="text-xs font-bold" style={{ color: EJE_COLORS.O.text }}>O: {conteoEjes.O || 0}</span>
                </div>
              </div>
              
              <button 
                onClick={() => { setShowCalendarModal(false); setSelectedDia(null) }} 
                className="p-2 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex">
              {/* Calendario */}
              <div className="flex-1 p-4">
                {/* Dias de la semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DIAS_SEMANA.map(dia => (
                    <div key={dia} className="text-center text-xs font-semibold text-gray-500 py-2">
                      {dia}
                    </div>
                  ))}
                </div>

                {/* Dias del mes */}
                <div className="grid grid-cols-7 gap-1">
                  {dias.map((dia, i) => {
                    // LOGICA DE COLORES:
                    // Pasado (sin actividad): gris suave
                    // Pasado (con actividad): color del eje
                    // Futuro (sin actividad): blanco
                    // Hoy: borde naranja
                    
                    const tieneActividad = !!dia.registro?.eje
                    
                    let bgColor = "#ffffff" // Blanco por defecto (futuro)
                    let textColor = "#374151"
                    let borderStyle = "1px solid #e5e7eb"
                    
                    if (!dia.esDelMes) {
                      bgColor = "#f9fafb"
                      textColor = "#9ca3af"
                    } else if (dia.esFinde) {
                      bgColor = "#f3f4f6"
                      textColor = "#9ca3af"
                    } else if (dia.esPasado && !tieneActividad) {
                      // Pasado sin actividad: gris suave
                      bgColor = "#f1f5f9"
                      textColor = "#94a3b8"
                    } else if (tieneActividad && dia.registro?.eje) {
                      // Con actividad: color del eje
                      bgColor = EJE_COLORS[dia.registro.eje].bg
                      textColor = EJE_COLORS[dia.registro.eje].text
                      borderStyle = `2px solid ${EJE_COLORS[dia.registro.eje].border}`
                    }
                    
                    if (dia.esHoy) {
                      borderStyle = "2px solid #D4870E"
                    }
                    
                    return (
                      <button
                        key={i}
                        onClick={() => handleDiaClick(dia)}
                        disabled={!dia.esDelMes || dia.esFinde}
                        className="aspect-square p-1 rounded-lg transition-all relative"
                        style={{
                          backgroundColor: bgColor,
                          border: borderStyle,
                          opacity: dia.esDelMes ? 1 : 0.3,
                          cursor: dia.esDelMes && !dia.esFinde && tieneActividad ? "pointer" : "default",
                        }}
                      >
                        <span 
                          className="text-sm font-semibold"
                          style={{ color: textColor }}
                        >
                          {dia.diaNum}
                        </span>
                        
                        {/* Indicador de eje */}
                        {tieneActividad && dia.registro?.eje && (
                          <div 
                            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-bold px-1 rounded"
                            style={{ 
                              backgroundColor: EJE_COLORS[dia.registro.eje].border,
                              color: "#fff",
                            }}
                          >
                            {dia.registro.eje}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Leyenda */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: "#f1f5f9" }} />
                      <span>Sin actividad</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: EJE_COLORS.CF.bg, border: `1px solid ${EJE_COLORS.CF.border}` }} />
                      <span>CF</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: EJE_COLORS.CT.bg, border: `1px solid ${EJE_COLORS.CT.border}` }} />
                      <span>CT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: EJE_COLORS.O.bg, border: `1px solid ${EJE_COLORS.O.border}` }} />
                      <span>O</span>
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-2">
                    Las actividades se cargan automaticamente desde la pantalla de Clase
                  </p>
                </div>
              </div>

              {/* Panel lateral - detalle del dia seleccionado */}
              <div className="w-80 border-l bg-gray-50 p-4">
                {selectedDia ? (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-4 capitalize">
                      {new Date(selectedDia.fecha + "T12:00:00").toLocaleDateString("es-AR", { 
                        weekday: "long", 
                        day: "numeric", 
                        month: "long" 
                      })}
                    </h3>
                    
                    {selectedDia.eje && (
                      <div 
                        className="rounded-xl p-4 mb-4"
                        style={{ 
                          backgroundColor: EJE_COLORS[selectedDia.eje]?.bg,
                          border: `2px solid ${EJE_COLORS[selectedDia.eje]?.border}`,
                        }}
                      >
                        <span 
                          className="text-sm font-bold uppercase"
                          style={{ color: EJE_COLORS[selectedDia.eje]?.text }}
                        >
                          {selectedDia.eje === "CF" ? "Conciencia Fonologica" : 
                           selectedDia.eje === "CT" ? "Comprension de Textos" : "Oralidad"}
                        </span>
                      </div>
                    )}
                    
                    {selectedDia.actividadALBA && (
                      <div className="bg-white rounded-xl p-4 mb-3 border shadow-sm">
                        <span className="text-xs text-primary font-bold uppercase flex items-center gap-1 mb-2">
                          <BookOpen className="w-3 h-3" /> Sugerencia ALBA
                        </span>
                        <p className="text-sm text-gray-700">{selectedDia.actividadALBA}</p>
                      </div>
                    )}
                    
                    {selectedDia.actividadDocente && (
                      <div className="bg-white rounded-xl p-4 border-2 border-accent shadow-sm">
                        <span className="text-xs text-accent font-bold uppercase flex items-center gap-1 mb-2">
                          <User className="w-3 h-3" /> Actividad Realizada
                        </span>
                        <p className="text-sm text-gray-700">{selectedDia.actividadDocente}</p>
                      </div>
                    )}
                    
                    {selectedDia.completado && (
                      <div className="mt-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                          Clase completada
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                    <Calendar className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm font-medium">Selecciona un dia</p>
                    <p className="text-xs mt-1">con actividad registrada<br />para ver los detalles</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
