"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Users, BookOpen, Calendar, Sparkles, FileText, Save, GraduationCap, Pencil, Check, Plus, X, Music, Dumbbell, Globe } from "lucide-react"

// Salas de maternal disponibles (2 y 3 años)
const SALAS_MATERNAL = [
  "Naranjos TM",      // 3 años turno mañana
  "Naranjos TT",      // 3 años turno tarde
  "PINITOS TM",       // 2 años turno mañana
  "PINITOS TT",       // 2 años turno tarde
  "Sala de prueba"
]

// Dias de la semana
const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"] as const

// Estructura de una actividad
interface Actividad {
  nombre: string
  capacidades: string
  contenidos: string
  objetivo: string
  desarrollo: string
  materiales: string
}

// Estructura de un dia - con VARIAS actividades
interface DiaData {
  fecha: string
  recibimiento: string
  intercambio: string
  actividades: Actividad[]
  // Bloques fijos (maestras especiales)
  edFisica: string
  musica: string
  ingles: string
}

// Actividad vacia
const actividadVacia: Actividad = {
  nombre: "",
  capacidades: "",
  contenidos: "",
  objetivo: "",
  desarrollo: "",
  materiales: ""
}

// Obtener lunes de la semana actual
function getLunesSemana(): Date {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

// Obtener fecha formateada
function formatearFecha(fecha: string): string {
  if (!fecha) return ""
  const d = new Date(fecha + "T12:00:00")
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" })
}

export function DashboardMaternal() {
  const [salaActual, setSalaActual] = useState("Naranjos TM")
  const [showSalaDropdown, setShowSalaDropdown] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensajeGuardado, setMensajeGuardado] = useState("")
  const [loading, setLoading] = useState(true)
  
  // Cronograma semanal - con varias actividades por dia
  const [cronograma, setCronograma] = useState<Record<string, DiaData>>({})
  const [showCronogramaModal, setShowCronogramaModal] = useState(false)
  
  // Proyecto/Unidad Didactica
  const [proyecto, setProyecto] = useState({
    titulo: "",
    objetivoGeneral: "",
    duracion: "",
  })
  const [showProyectoModal, setShowProyectoModal] = useState(false)
  
  // Sugerencias de ALBA
  const [sugerenciasALBA, setSugerenciasALBA] = useState<string[]>([])
  const [loadingSugerencias, setLoadingSugerencias] = useState(false)
  
  // Alumnos de la sala
  const [alumnos, setAlumnos] = useState<any[]>([])
  
  // Cargar datos de la sala
  useEffect(() => {
    const savedSala = localStorage.getItem("maternal-sala-activa")
    if (savedSala && SALAS_MATERNAL.includes(savedSala)) {
      setSalaActual(savedSala)
    }
  }, [])
  
  // Cargar cronograma y proyecto cuando cambia la sala
  useEffect(() => {
    cargarDatos()
  }, [salaActual])
  
  // Inicializar cronograma vacio
  function inicializarCronograma() {
    const lunes = getLunesSemana()
    const nuevo: Record<string, DiaData> = {}
    DIAS.forEach((dia, idx) => {
      const fecha = new Date(lunes)
      fecha.setDate(fecha.getDate() + idx)
      nuevo[dia] = {
        fecha: fecha.toISOString().split("T")[0],
        recibimiento: "",
        intercambio: "",
        actividades: [{ ...actividadVacia }],
        edFisica: "",
        musica: "",
        ingles: ""
      }
    })
    return nuevo
  }
  
  async function cargarDatos() {
    setLoading(true)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    
    // Cargar cronograma
    try {
      const res = await fetch(`${base}/api/cronograma-maternal?sala=${encodeURIComponent(salaActual)}`, { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        if (data.ok && data.cronograma && Object.keys(data.cronograma).length > 0) {
          setCronograma(data.cronograma)
        } else {
          setCronograma(inicializarCronograma())
        }
      } else {
        setCronograma(inicializarCronograma())
      }
    } catch (e) {
      console.error("[v0] Error cargando cronograma:", e)
      setCronograma(inicializarCronograma())
    }
    
    // Cargar proyecto
    try {
      const res = await fetch(`${base}/api/proyecto-maternal?sala=${encodeURIComponent(salaActual)}`, { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        if (data.ok && data.proyecto) {
          setProyecto({
            titulo: data.proyecto.titulo || "",
            objetivoGeneral: data.proyecto.objetivo_general || "",
            duracion: data.proyecto.duracion || ""
          })
        } else {
          setProyecto({ titulo: "", objetivoGeneral: "", duracion: "" })
        }
      }
    } catch (e) {
      console.error("[v0] Error cargando proyecto:", e)
    }
    
    setLoading(false)
  }
  
  // Guardar cronograma
  async function guardarCronograma() {
    setGuardando(true)
    setLoadingSugerencias(true)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    
    try {
      const res = await fetch(`${base}/api/cronograma-maternal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala: salaActual, cronograma })
      })
      
      if (res.ok) {
        // ALBA genera sugerencias basadas en el cronograma y proyecto
        const textoCompleto = Object.values(cronograma).map(d => 
          `${d.recibimiento} ${d.intercambio} ${d.actividades.map(a => `${a.nombre} ${a.desarrollo}`).join(" ")}`
        ).join(" ").toLowerCase()
        
        const sugerencias: string[] = []
        
        if (textoCompleto.includes("matematica") || textoCompleto.includes("cantidad") || textoCompleto.includes("dado")) {
          sugerencias.push("Para reforzar Matematica: Juego de correspondencia uno a uno con objetos cotidianos")
        }
        if (textoCompleto.includes("cuento") || textoCompleto.includes("lectura") || textoCompleto.includes("libro")) {
          sugerencias.push("Para reforzar Lengua: Lectura dialogica con pausas para preguntas abiertas")
        }
        if (textoCompleto.includes("arte") || textoCompleto.includes("dibujo") || textoCompleto.includes("pintura")) {
          sugerencias.push("Para Lenguajes Expresivos: Explorar texturas con materiales naturales")
        }
        if (proyecto.titulo) {
          sugerencias.push(`Relacionar con el proyecto "${proyecto.titulo}": Actividad de indagacion del ambiente`)
        }
        if (sugerencias.length === 0) {
          sugerencias.push("Guarda mas actividades para recibir sugerencias personalizadas de ALBA")
        }
        
        setSugerenciasALBA(sugerencias)
        setMensajeGuardado("Cronograma guardado")
        setTimeout(() => setMensajeGuardado(""), 3000)
      }
    } catch (e) {
      console.error("[v0] Error guardando cronograma:", e)
    }
    
    setGuardando(false)
    setLoadingSugerencias(false)
    setShowCronogramaModal(false)
  }
  
  // Finalizar semana
  async function finalizarSemana() {
    if (!confirm("Finalizar esta semana? El cronograma se blanqueara para la semana siguiente.")) return
    
    setGuardando(true)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    
    try {
      await fetch(`${base}/api/cronograma-maternal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala: salaActual })
      })
      
      setCronograma(inicializarCronograma())
      setSugerenciasALBA([])
      setMensajeGuardado("Semana finalizada - Cronograma listo para la nueva semana")
      setTimeout(() => setMensajeGuardado(""), 3000)
    } catch (e) {
      console.error("[v0] Error finalizando semana:", e)
    }
    
    setGuardando(false)
  }

  async function guardarProyecto() {
    setGuardando(true)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    
    try {
      await fetch(`${base}/api/proyecto-maternal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sala: salaActual,
          titulo: proyecto.titulo,
          duracion: proyecto.duracion,
          objetivo_general: proyecto.objetivoGeneral
        })
      })
      
      setMensajeGuardado("Proyecto guardado")
      setTimeout(() => setMensajeGuardado(""), 3000)
    } catch (e) {
      console.error("[v0] Error guardando proyecto:", e)
    }
    
    setGuardando(false)
    setShowProyectoModal(false)
  }
  
  // Finalizar proyecto
  async function finalizarProyecto() {
    if (!confirm("Finalizar este proyecto?")) return
    
    setGuardando(true)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    
    try {
      await fetch(`${base}/api/proyecto-maternal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala: salaActual })
      })
      
      setProyecto({ titulo: "", objetivoGeneral: "", duracion: "" })
      setMensajeGuardado("Proyecto finalizado")
      setTimeout(() => setMensajeGuardado(""), 3000)
    } catch (e) {
      console.error("[v0] Error finalizando proyecto:", e)
    }
    
    setGuardando(false)
    setShowProyectoModal(false)
  }
  
  // Actualizar campo del cronograma
  function actualizarCampo(dia: string, campo: keyof DiaData, valor: string) {
    setCronograma(prev => ({
      ...prev,
      [dia]: { ...prev[dia], [campo]: valor }
    }))
  }
  
  // Actualizar actividad especifica
  function actualizarActividad(dia: string, index: number, campo: keyof Actividad, valor: string) {
    setCronograma(prev => {
      const nuevasActividades = [...prev[dia].actividades]
      nuevasActividades[index] = { ...nuevasActividades[index], [campo]: valor }
      return {
        ...prev,
        [dia]: { ...prev[dia], actividades: nuevasActividades }
      }
    })
  }
  
  // Agregar actividad a un dia
  function agregarActividad(dia: string) {
    setCronograma(prev => ({
      ...prev,
      [dia]: { 
        ...prev[dia], 
        actividades: [...prev[dia].actividades, { ...actividadVacia }]
      }
    }))
  }
  
  // Eliminar actividad de un dia
  function eliminarActividad(dia: string, index: number) {
    if (cronograma[dia].actividades.length <= 1) return
    setCronograma(prev => {
      const nuevasActividades = prev[dia].actividades.filter((_, i) => i !== index)
      return {
        ...prev,
        [dia]: { ...prev[dia], actividades: nuevasActividades }
      }
    })
  }

  // Contar actividades cargadas en la semana
  const actividadesCargadas = Object.values(cronograma).filter(d => 
    d?.recibimiento || d?.intercambio || d?.actividades?.some(a => a.nombre)
  ).length

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header azul */}
      <header className="bg-[#1e3a5f] text-white px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">ALBA Maternal</h1>
              <p className="text-xs text-white/70">Salas de 2 y 3 anos</p>
            </div>
          </div>
          
          {/* Selector de Sala */}
          <div className="relative">
            <button
              onClick={() => setShowSalaDropdown(!showSalaDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <span className="text-sm font-medium">{salaActual}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showSalaDropdown && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                {SALAS_MATERNAL.map((sala) => (
                  <button
                    key={sala}
                    onClick={() => {
                      setSalaActual(sala)
                      localStorage.setItem("maternal-sala-activa", sala)
                      setShowSalaDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors ${
                      sala === salaActual ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700"
                    }`}
                  >
                    {sala}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Mensaje de guardado */}
      {mensajeGuardado && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2">
          <Check className="w-5 h-5" />
          {mensajeGuardado}
        </div>
      )}
      
      {/* Contenido principal */}
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Fila superior: Proyecto + Registro del Aula */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Tarjeta Proyecto - DESTACADA */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg border-2 border-amber-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="px-5 py-4 border-b border-amber-200/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shadow-md">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800 text-lg">Proyecto</h2>
                      <p className="text-xs text-amber-600">Unidad Didactica</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProyectoModal(true)}
                    className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-700 font-medium transition-colors shadow-sm border border-amber-200"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                </div>
                <div className="p-5">
                  {proyecto.titulo ? (
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-800 text-lg">{proyecto.titulo}</h3>
                      {proyecto.duracion && <p className="text-sm text-amber-600 font-medium">Duracion: {proyecto.duracion}</p>}
                      <p className="text-sm text-slate-600 line-clamp-3">{proyecto.objetivoGeneral}</p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                        <BookOpen className="w-7 h-7 text-amber-400" />
                      </div>
                      <p className="text-slate-500 mb-3">Aun no hay proyecto cargado</p>
                      <button
                        type="button"
                        onClick={() => setShowProyectoModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors shadow-md text-sm"
                      >
                        <BookOpen className="w-4 h-4" />
                        Cargar proyecto
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tarjeta Registro del Aula - DESTACADA */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg border-2 border-blue-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="px-5 py-4 border-b border-blue-200/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-md">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800 text-lg">Registro del Aula</h2>
                      <p className="text-xs text-blue-600">Lista de alumnos</p>
                    </div>
                  </div>
                  <span className="text-sm px-4 py-1.5 rounded-full bg-white text-blue-600 font-bold shadow-sm border border-blue-200">
                    {alumnos.length} alumnos
                  </span>
                </div>
                <div className="p-5">
                  <div className="text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-7 h-7 text-blue-400" />
                    </div>
                    <p className="text-slate-500 mb-3">Proximamente</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Badges de clases especiales */}
            <div className="flex flex-wrap gap-3 mb-4">
              {/* Ed. Fisica */}
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border-l-4 border-orange-500">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Ed. Fisica</p>
                  <p className="text-[10px] text-slate-500">Horario a definir</p>
                </div>
              </div>
              
              {/* Musica */}
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border-l-4 border-purple-500">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Musica</p>
                  <p className="text-[10px] text-slate-500">Horario a definir</p>
                </div>
              </div>
              
              {/* Ingles */}
              <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-sm border-l-4 border-blue-500">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Ingles</p>
                  <p className="text-[10px] text-slate-500">Horario a definir</p>
                </div>
              </div>
            </div>
            
            {/* Tarjeta Cronograma Semanal - DESTACADA */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="px-5 py-4 border-b border-green-200/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shadow-md">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 text-lg">Cronograma Semanal</h2>
                    <p className="text-sm text-green-600 font-medium">{actividadesCargadas} dias con actividades</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCronogramaModal(true)}
                    className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-white hover:bg-green-100 text-green-700 font-medium transition-colors shadow-sm border border-green-200"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={finalizarSemana}
                    disabled={guardando}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-50 shadow-md"
                  >
                    Finalizar Semana
                  </button>
                </div>
              </div>
              
              {/* Vista resumida del cronograma */}
              <div className="p-5">
                <div className="grid grid-cols-5 gap-3">
                  {DIAS.map((dia) => (
                    <div key={dia} className="flex flex-col">
                      <div className="text-center py-2 px-2 bg-green-500 rounded-t-xl font-bold text-sm text-white shadow-sm">
                        {dia} {cronograma[dia]?.fecha && <span className="font-normal text-xs opacity-80">{formatearFecha(cronograma[dia].fecha)}</span>}
                      </div>
                      <div className="flex-1 border-2 border-t-0 border-green-200 rounded-b-xl p-3 min-h-[120px] bg-white">
                        {cronograma[dia] && (cronograma[dia].recibimiento || cronograma[dia].actividades?.some(a => a.nombre)) ? (
                          <div className="space-y-1">
                            {cronograma[dia].recibimiento && (
                              <p className="text-[10px] text-slate-600 truncate"><span className="font-semibold">Rec:</span> {cronograma[dia].recibimiento}</p>
                            )}
                            {cronograma[dia].intercambio && (
                              <p className="text-[10px] text-slate-600 truncate"><span className="font-semibold">Int:</span> {cronograma[dia].intercambio}</p>
                            )}
                            {cronograma[dia].actividades?.filter(a => a.nombre).map((act, i) => (
                              <p key={i} className="text-[10px] text-green-700 font-medium truncate">Act {i+1}: {act.nombre}</p>
                            ))}
                            {cronograma[dia].edFisica && <p className="text-[10px] text-orange-600 truncate"><Dumbbell className="w-2 h-2 inline" /> Ed.Fis</p>}
                            {cronograma[dia].musica && <p className="text-[10px] text-purple-600 truncate"><Music className="w-2 h-2 inline" /> Musica</p>}
                            {cronograma[dia].ingles && <p className="text-[10px] text-blue-600 truncate"><Globe className="w-2 h-2 inline" /> Ingles</p>}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-300 text-center mt-8">Sin actividades</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Fila inferior: Sugerencias ALBA + Capacitacion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Tarjeta Sugerencias de ALBA - DESTACADA */}
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl shadow-lg border-2 border-purple-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="px-5 py-4 border-b border-purple-200/50 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center shadow-md">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 text-lg">Sugerencias de ALBA</h2>
                    <p className="text-xs text-purple-600">Ideas para tu planificacion</p>
                  </div>
                </div>
                <div className="p-5">
                  {loadingSugerencias ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-3 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                      <span className="ml-3 text-sm text-slate-500">ALBA esta analizando...</span>
                    </div>
                  ) : sugerenciasALBA.length > 0 ? (
                    <ul className="space-y-3">
                      {sugerenciasALBA.map((sug, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-700 bg-white p-3 rounded-xl border border-purple-100">
                          <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                          {sug}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-7 h-7 text-purple-400" />
                      </div>
                      <p className="text-slate-500">Guarda el cronograma para recibir sugerencias</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tarjeta Capacitacion - DESTACADA */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl shadow-lg border-2 border-teal-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="px-5 py-4 border-b border-teal-200/50 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center shadow-md">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 text-lg">Capacitacion</h2>
                    <p className="text-xs text-teal-600">Recursos Just-in-Time</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-7 h-7 text-teal-400" />
                    </div>
                    <p className="text-slate-500">Recursos y guias apareceran segun las actividades</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        )}
      </main>
      
      {/* Modal Cronograma Semanal - TODA LA SEMANA VISIBLE */}
      {showCronogramaModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl my-4">
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-green-500 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Cronograma Semanal</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={guardarCronograma}
                  disabled={guardando}
                  className="flex items-center gap-2 px-5 py-2 bg-white text-green-700 rounded-xl font-medium hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  {guardando ? (
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Guardar
                </button>
                <button
                  onClick={() => setShowCronogramaModal(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Contenido - Los 5 dias */}
            <div className="p-4 grid grid-cols-5 gap-3 max-h-[80vh] overflow-y-auto">
              {DIAS.map((dia) => (
                <div key={dia} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  {/* Header del dia */}
                  <div className="bg-green-500 text-white px-3 py-2 text-center">
                    <div className="font-bold">{dia}</div>
                    <div className="text-xs opacity-80">{cronograma[dia]?.fecha && formatearFecha(cronograma[dia].fecha)}</div>
                  </div>
                  
                  <div className="p-3 space-y-3">
                    {/* Recibimiento */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Recibimiento</label>
                      <textarea
                        value={cronograma[dia]?.recibimiento || ""}
                        onChange={(e) => actualizarCampo(dia, "recibimiento", e.target.value)}
                        placeholder="Juego en la alfombra..."
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg resize-none h-12 focus:outline-none focus:ring-1 focus:ring-green-300"
                      />
                    </div>
                    
                    {/* Intercambio */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Intercambio</label>
                      <textarea
                        value={cronograma[dia]?.intercambio || ""}
                        onChange={(e) => actualizarCampo(dia, "intercambio", e.target.value)}
                        placeholder="Tema del dia..."
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg resize-none h-12 focus:outline-none focus:ring-1 focus:ring-green-300"
                      />
                    </div>
                    
                    {/* Bloques fijos - Especiales */}
                    <div className="grid grid-cols-3 gap-1">
                      <div>
                        <label className="text-[8px] font-bold text-orange-600 flex items-center gap-0.5"><Dumbbell className="w-2 h-2" /> ED.FIS</label>
                        <input
                          type="text"
                          value={cronograma[dia]?.edFisica || ""}
                          onChange={(e) => actualizarCampo(dia, "edFisica", e.target.value)}
                          placeholder="-"
                          className="w-full text-[10px] p-1 border border-orange-200 rounded bg-orange-50 focus:outline-none focus:ring-1 focus:ring-orange-300"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-purple-600 flex items-center gap-0.5"><Music className="w-2 h-2" /> MUSICA</label>
                        <input
                          type="text"
                          value={cronograma[dia]?.musica || ""}
                          onChange={(e) => actualizarCampo(dia, "musica", e.target.value)}
                          placeholder="-"
                          className="w-full text-[10px] p-1 border border-purple-200 rounded bg-purple-50 focus:outline-none focus:ring-1 focus:ring-purple-300"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-bold text-blue-600 flex items-center gap-0.5"><Globe className="w-2 h-2" /> INGLES</label>
                        <input
                          type="text"
                          value={cronograma[dia]?.ingles || ""}
                          onChange={(e) => actualizarCampo(dia, "ingles", e.target.value)}
                          placeholder="-"
                          className="w-full text-[10px] p-1 border border-blue-200 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-300"
                        />
                      </div>
                    </div>
                    
                    {/* Actividades - multiples */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-green-700 uppercase">Actividades</label>
                        <button
                          type="button"
                          onClick={() => agregarActividad(dia)}
                          className="text-[10px] text-green-600 hover:text-green-700 font-medium flex items-center gap-0.5"
                        >
                          <Plus className="w-3 h-3" /> Agregar
                        </button>
                      </div>
                      
                      {cronograma[dia]?.actividades?.map((act, idx) => (
                        <div key={idx} className="bg-white border border-green-200 rounded-lg p-2 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-green-600">Actividad {idx + 1}</span>
                            {cronograma[dia].actividades.length > 1 && (
                              <button
                                type="button"
                                onClick={() => eliminarActividad(dia, idx)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={act.nombre}
                            onChange={(e) => actualizarActividad(dia, idx, "nombre", e.target.value)}
                            placeholder="Nombre de la actividad"
                            className="w-full text-[10px] p-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-green-300 font-medium"
                          />
                          <textarea
                            value={act.capacidades}
                            onChange={(e) => actualizarActividad(dia, idx, "capacidades", e.target.value)}
                            placeholder="Capacidades"
                            className="w-full text-[10px] p-1.5 border border-slate-200 rounded resize-none h-8 focus:outline-none focus:ring-1 focus:ring-green-300"
                          />
                          <textarea
                            value={act.contenidos}
                            onChange={(e) => actualizarActividad(dia, idx, "contenidos", e.target.value)}
                            placeholder="Contenidos"
                            className="w-full text-[10px] p-1.5 border border-slate-200 rounded resize-none h-8 focus:outline-none focus:ring-1 focus:ring-green-300"
                          />
                          <textarea
                            value={act.objetivo}
                            onChange={(e) => actualizarActividad(dia, idx, "objetivo", e.target.value)}
                            placeholder="Objetivo"
                            className="w-full text-[10px] p-1.5 border border-slate-200 rounded resize-none h-8 focus:outline-none focus:ring-1 focus:ring-green-300"
                          />
                          <textarea
                            value={act.desarrollo}
                            onChange={(e) => actualizarActividad(dia, idx, "desarrollo", e.target.value)}
                            placeholder="Desarrollo"
                            className="w-full text-[10px] p-1.5 border border-slate-200 rounded resize-none h-12 focus:outline-none focus:ring-1 focus:ring-green-300"
                          />
                          <textarea
                            value={act.materiales}
                            onChange={(e) => actualizarActividad(dia, idx, "materiales", e.target.value)}
                            placeholder="Materiales"
                            className="w-full text-[10px] p-1.5 border border-slate-200 rounded resize-none h-8 focus:outline-none focus:ring-1 focus:ring-green-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Proyecto */}
      {showProyectoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-500 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Proyecto / Unidad Didactica</h2>
              </div>
              <button
                onClick={() => setShowProyectoModal(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700">Titulo del Proyecto</label>
                <input
                  type="text"
                  value={proyecto.titulo}
                  onChange={(e) => setProyecto({ ...proyecto, titulo: e.target.value })}
                  placeholder="Ej: Conocemos los animales de la granja"
                  className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
              
              <div>
                <label className="text-sm font-semibold text-slate-700">Duracion</label>
                <input
                  type="text"
                  value={proyecto.duracion}
                  onChange={(e) => setProyecto({ ...proyecto, duracion: e.target.value })}
                  placeholder="Ej: 3 semanas"
                  className="w-full mt-1 p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
              
              <div>
                <label className="text-sm font-semibold text-slate-700">Objetivo General</label>
                <textarea
                  value={proyecto.objetivoGeneral}
                  onChange={(e) => setProyecto({ ...proyecto, objetivoGeneral: e.target.value })}
                  placeholder="Describir el objetivo principal del proyecto..."
                  rows={4}
                  className="w-full mt-1 p-3 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              {proyecto.titulo && (
                <button
                  onClick={finalizarProyecto}
                  disabled={guardando}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  Finalizar Proyecto
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setShowProyectoModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={guardarProyecto}
                  disabled={guardando}
                  className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 shadow-md"
                >
                  {guardando ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
