"use client"

import { useState, useEffect } from "react"
import { User, Calendar, BookOpen, Home, FileText, X, ChevronLeft, ChevronRight, Plus } from "lucide-react"

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
  salaActual?: string
  historialMes?: DiaActividad[]
  onAgregarActividad?: (fecha: string, actividad: string, eje: string) => void
}

// Colores por eje
const EJE_COLORS: Record<string, { bg: string; text: string; border: string; light: string }> = {
  CF: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6", light: "#eff6ff" },
  CT: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b", light: "#fffbeb" },
  O: { bg: "#dcfce7", text: "#166534", border: "#22c55e", light: "#f0fdf4" },
}

const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"]

export function Header({ activeView = "clase", onNavigate, onSintesis, salaActual = "Manzanos", historialMes = [], onAgregarActividad }: HeaderProps) {
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [mesActual, setMesActual] = useState(new Date().getMonth())
  const [anioActual, setAnioActual] = useState(new Date().getFullYear())
  const [selectedDia, setSelectedDia] = useState<DiaActividad | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [nuevaActividad, setNuevaActividad] = useState("")
  const [nuevoEje, setNuevoEje] = useState<"CF" | "CT" | "O">("CF")
  const [fechaSeleccionada, setFechaSeleccionada] = useState("")

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
  }

  const handleMesSiguiente = () => {
    if (mesActual === 11) {
      setMesActual(0)
      setAnioActual(anioActual + 1)
    } else {
      setMesActual(mesActual + 1)
    }
  }

  const handleDiaClick = (dia: typeof dias[0]) => {
    if (!dia.esDelMes || dia.esFinde) return
    
    if (dia.registro) {
      setSelectedDia(dia.registro)
      setShowAddForm(false)
    } else if (!dia.esPasado || dia.esHoy) {
      // Permitir agregar actividad en dias presentes/futuros
      setFechaSeleccionada(dia.fecha)
      setSelectedDia(null)
      setShowAddForm(true)
    }
  }

  const handleAgregarActividad = () => {
    if (nuevaActividad.trim() && onAgregarActividad) {
      onAgregarActividad(fechaSeleccionada, nuevaActividad, nuevoEje)
      setNuevaActividad("")
      setShowAddForm(false)
    }
  }

  // Contar actividades por eje en el mes
  const conteoEjes = historialMes.reduce((acc, h) => {
    if (h.eje) acc[h.eje] = (acc[h.eje] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <header className="bg-primary text-primary-foreground shadow-lg relative">
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
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Alumnos</span>
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

            {/* Icono Calendario - abre modal */}
            <button
              onClick={() => setShowCalendarModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-semibold hidden sm:inline">Calendario</span>
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

      {/* Modal Calendario Mensual */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={handleMesAnterior} className="p-2 hover:bg-white/10 rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold">
                  {MESES[mesActual]} {anioActual}
                </h2>
                <button onClick={handleMesSiguiente} className="p-2 hover:bg-white/10 rounded-lg">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              {/* Resumen de ejes */}
              <div className="flex items-center gap-3">
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
              
              <button onClick={() => { setShowCalendarModal(false); setSelectedDia(null); setShowAddForm(false) }} className="p-2 hover:bg-white/10 rounded-lg">
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
                  {dias.map((dia, i) => (
                    <button
                      key={i}
                      onClick={() => handleDiaClick(dia)}
                      disabled={!dia.esDelMes || dia.esFinde}
                      className="aspect-square p-1 rounded-lg transition-all relative group"
                      style={{
                        backgroundColor: dia.registro?.eje
                          ? EJE_COLORS[dia.registro.eje]?.light
                          : dia.esHoy
                          ? "#fef3c7"
                          : dia.esDelMes && !dia.esFinde
                          ? "#fff"
                          : "#f9fafb",
                        border: dia.esHoy
                          ? "2px solid #D4870E"
                          : dia.registro?.eje
                          ? `2px solid ${EJE_COLORS[dia.registro.eje]?.border}`
                          : "1px solid #e5e7eb",
                        opacity: dia.esDelMes ? 1 : 0.3,
                        cursor: dia.esDelMes && !dia.esFinde ? "pointer" : "default",
                      }}
                    >
                      <span 
                        className="text-sm font-semibold"
                        style={{ 
                          color: dia.registro?.eje 
                            ? EJE_COLORS[dia.registro.eje]?.text 
                            : dia.esFinde ? "#9ca3af" : "#374151" 
                        }}
                      >
                        {dia.diaNum}
                      </span>
                      
                      {/* Indicador de eje */}
                      {dia.registro?.eje && (
                        <div 
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{ 
                            backgroundColor: EJE_COLORS[dia.registro.eje]?.bg,
                            color: EJE_COLORS[dia.registro.eje]?.text,
                          }}
                        >
                          {dia.registro.eje}
                        </div>
                      )}
                      
                      {/* Hover para dias sin actividad */}
                      {dia.esDelMes && !dia.esFinde && !dia.registro && !dia.esPasado && (
                        <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center">
                          <Plus className="w-4 h-4 text-primary/40" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Leyenda */}
                <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: EJE_COLORS.CF.bg, border: `1px solid ${EJE_COLORS.CF.border}` }} />
                    <span>Conciencia Fonologica</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: EJE_COLORS.CT.bg, border: `1px solid ${EJE_COLORS.CT.border}` }} />
                    <span>Comprension de Textos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: EJE_COLORS.O.bg, border: `1px solid ${EJE_COLORS.O.border}` }} />
                    <span>Oralidad</span>
                  </div>
                </div>
              </div>

              {/* Panel lateral - detalle del dia */}
              <div className="w-80 border-l bg-gray-50 p-4">
                {selectedDia ? (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-4">
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
                      <div className="bg-white rounded-xl p-4 mb-3 border">
                        <span className="text-xs text-primary font-bold uppercase flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> Sugerencia ALBA
                        </span>
                        <p className="text-sm text-gray-700 mt-2">{selectedDia.actividadALBA}</p>
                      </div>
                    )}
                    
                    {selectedDia.actividadDocente && (
                      <div className="bg-white rounded-xl p-4 border border-accent">
                        <span className="text-xs text-accent font-bold uppercase flex items-center gap-1">
                          <User className="w-3 h-3" /> Actividad Realizada
                        </span>
                        <p className="text-sm text-gray-700 mt-2">{selectedDia.actividadDocente}</p>
                      </div>
                    )}
                  </div>
                ) : showAddForm ? (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-4">
                      Agregar Actividad
                      <span className="block text-sm font-normal text-gray-500 mt-1">
                        {new Date(fechaSeleccionada + "T12:00:00").toLocaleDateString("es-AR", { 
                          weekday: "long", 
                          day: "numeric", 
                          month: "long" 
                        })}
                      </span>
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">Eje</label>
                        <div className="flex gap-2 mt-2">
                          {(["CF", "CT", "O"] as const).map(eje => (
                            <button
                              key={eje}
                              onClick={() => setNuevoEje(eje)}
                              className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                              style={{
                                backgroundColor: nuevoEje === eje ? EJE_COLORS[eje].bg : "#f3f4f6",
                                border: nuevoEje === eje ? `2px solid ${EJE_COLORS[eje].border}` : "1px solid #e5e7eb",
                                color: nuevoEje === eje ? EJE_COLORS[eje].text : "#6b7280",
                              }}
                            >
                              {eje}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-gray-600 uppercase">Actividad</label>
                        <textarea
                          value={nuevaActividad}
                          onChange={(e) => setNuevaActividad(e.target.value)}
                          placeholder="Describe la actividad planificada..."
                          className="w-full mt-2 p-3 border rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                          rows={4}
                        />
                      </div>
                      
                      <button
                        onClick={handleAgregarActividad}
                        disabled={!nuevaActividad.trim()}
                        className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Agregar a la Secuencia
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                    <Calendar className="w-12 h-12 mb-3 opacity-30" />
                    <p className="text-sm">Selecciona un dia para ver los detalles o agregar una actividad</p>
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
