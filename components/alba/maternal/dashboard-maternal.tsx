"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Users, BookOpen, Calendar, Sparkles, FileText, Save, GraduationCap, Pencil, Check } from "lucide-react"

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

// Estructura de un dia
interface DiaData {
  fecha: string
  recibimiento: string
  intercambio: string
  actividad_nombre: string
  actividad_capacidades: string
  actividad_contenidos: string
  actividad_objetivo: string
  actividad_desarrollo: string
  actividad_materiales: string
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
  
  // Cronograma semanal - campos estructurados por dia
  const [cronograma, setCronograma] = useState<Record<string, DiaData>>({})
  const [showCronogramaModal, setShowCronogramaModal] = useState(false)
  const [diaEditando, setDiaEditando] = useState<string | null>(null)
  
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
  
  async function cargarDatos() {
    setLoading(true)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    
    // Cargar cronograma
    try {
      const res = await fetch(`${base}/api/cronograma-maternal?sala=${encodeURIComponent(salaActual)}`, { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        if (data.ok && data.cronograma) {
          setCronograma(data.cronograma)
        } else {
          // Inicializar cronograma vacio con fechas
          const lunes = getLunesSemana()
          const nuevo: Record<string, DiaData> = {}
          DIAS.forEach((dia, idx) => {
            const fecha = new Date(lunes)
            fecha.setDate(fecha.getDate() + idx)
            nuevo[dia] = {
              fecha: fecha.toISOString().split("T")[0],
              recibimiento: "",
              intercambio: "",
              actividad_nombre: "",
              actividad_capacidades: "",
              actividad_contenidos: "",
              actividad_objetivo: "",
              actividad_desarrollo: "",
              actividad_materiales: ""
            }
          })
          setCronograma(nuevo)
        }
      }
    } catch (e) {
      console.error("[v0] Error cargando cronograma:", e)
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
  
  // Guardar cronograma y generar sugerencias
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
          `${d.recibimiento} ${d.intercambio} ${d.actividad_nombre} ${d.actividad_desarrollo}`
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
  }
  
  // Finalizar semana
  async function finalizarSemana() {
    if (!confirm("¿Finalizar esta semana? El cronograma se blanqueara para la semana siguiente.")) return
    
    setGuardando(true)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    
    try {
      await fetch(`${base}/api/cronograma-maternal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala: salaActual })
      })
      
      // Recargar datos (traera semana nueva vacia)
      await cargarDatos()
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
    if (!confirm("¿Finalizar este proyecto?")) return
    
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
  function actualizarCronograma(dia: string, campo: keyof DiaData, valor: string) {
    setCronograma(prev => ({
      ...prev,
      [dia]: { ...prev[dia], [campo]: valor }
    }))
  }

  // Contar actividades cargadas en la semana
  const actividadesCargadas = Object.values(cronograma).filter(d => 
    d.recibimiento || d.intercambio || d.actividad_nombre
  ).length
  
  // Verificar si es viernes para mostrar boton finalizar
  const hoy = new Date()
  const esViernes = hoy.getDay() === 5

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
          
          {/* Selector de sala */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSalaDropdown(!showSalaDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              <span className="font-medium">Sala: {salaActual}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showSalaDropdown ? "rotate-180" : ""}`} />
            </button>
            {showSalaDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-20 min-w-[180px]">
                {SALAS_MATERNAL.map((sala) => (
                  <button
                    key={sala}
                    type="button"
                    onClick={() => {
                      setSalaActual(sala)
                      localStorage.setItem("maternal-sala-activa", sala)
                      setShowSalaDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 ${sala === salaActual ? "font-semibold bg-slate-50" : ""}`}
                  >
                    {sala}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Mensaje de guardado */}
          {mensajeGuardado && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm text-center font-medium">
              {mensajeGuardado}
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Fila superior: Proyecto + Registro del Aula */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Tarjeta Proyecto/Unidad Didactica */}
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
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                          <BookOpen className="w-8 h-8 text-amber-400" />
                        </div>
                        <p className="text-slate-500 mb-4">Aun no hay proyecto cargado</p>
                        <button
                          type="button"
                          onClick={() => setShowProyectoModal(true)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors shadow-md"
                        >
                          <BookOpen className="w-4 h-4" />
                          Cargar proyecto
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Tarjeta Registro del Aula */}
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
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-blue-400" />
                      </div>
                      <p className="text-slate-500 mb-4">Proximamente: Carga de alumnos</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tarjeta Cronograma Semanal */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden hover:shadow-xl transition-shadow">
                <div className="px-5 py-4 border-b border-green-200/50 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shadow-md">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800 text-lg">Cronograma Semanal</h2>
                      <p className="text-sm text-green-600 font-medium">{actividadesCargadas} dias con actividades</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={guardarCronograma}
                      disabled={guardando}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white font-medium transition-colors disabled:opacity-50 shadow-md"
                    >
                      {guardando ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Guardar
                    </button>
                    {esViernes && (
                      <button
                        type="button"
                        onClick={finalizarSemana}
                        disabled={guardando}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:opacity-50 shadow-md"
                      >
                        <Check className="w-4 h-4" />
                        Finalizar Semana
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Vista del cronograma con campos */}
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {DIAS.map((dia) => {
                      const datosDia = cronograma[dia] || {} as DiaData
                      const tieneContenido = datosDia.recibimiento || datosDia.intercambio || datosDia.actividad_nombre
                      
                      return (
                        <div key={dia} className="flex flex-col">
                          <div className="text-center py-2 px-2 bg-green-500 rounded-t-xl font-bold text-sm text-white shadow-sm">
                            {dia} {datosDia.fecha && <span className="font-normal text-green-100">({formatearFecha(datosDia.fecha)})</span>}
                          </div>
                          <div 
                            className="flex-1 border-2 border-t-0 border-green-200 rounded-b-xl p-3 min-h-[150px] bg-white cursor-pointer hover:bg-green-50 transition-colors"
                            onClick={() => { setDiaEditando(dia); setShowCronogramaModal(true) }}
                          >
                            {tieneContenido ? (
                              <div className="space-y-2 text-xs">
                                {datosDia.recibimiento && (
                                  <div>
                                    <span className="font-semibold text-green-700">Recibimiento:</span>
                                    <p className="text-slate-600 line-clamp-2">{datosDia.recibimiento}</p>
                                  </div>
                                )}
                                {datosDia.intercambio && (
                                  <div>
                                    <span className="font-semibold text-green-700">Intercambio:</span>
                                    <p className="text-slate-600 line-clamp-2">{datosDia.intercambio}</p>
                                  </div>
                                )}
                                {datosDia.actividad_nombre && (
                                  <div>
                                    <span className="font-semibold text-green-700">Actividad:</span>
                                    <p className="text-slate-600 line-clamp-2">{datosDia.actividad_nombre}</p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <p className="text-xs text-slate-300 text-center">Click para agregar</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              
              {/* Fila inferior: Sugerencias ALBA + Capacitacion */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Tarjeta Sugerencias de ALBA */}
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
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                          <Sparkles className="w-8 h-8 text-purple-400" />
                        </div>
                        <p className="text-slate-500">Guarda el cronograma para recibir sugerencias</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Tarjeta Capacitacion */}
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
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-teal-400" />
                      </div>
                      <p className="text-slate-500">Recursos y guias apareceran segun las actividades planificadas</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      {/* Modal Proyecto */}
      {showProyectoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-amber-50">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-slate-800">Proyecto / Unidad Didactica</h3>
              </div>
              <button type="button" onClick={() => setShowProyectoModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Titulo del proyecto</label>
                <input
                  type="text"
                  value={proyecto.titulo}
                  onChange={(e) => setProyecto({ ...proyecto, titulo: e.target.value })}
                  placeholder="Ej: Los animales de la granja"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duracion</label>
                <input
                  type="text"
                  value={proyecto.duracion}
                  onChange={(e) => setProyecto({ ...proyecto, duracion: e.target.value })}
                  placeholder="Ej: 3 semanas"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo General</label>
                <textarea
                  value={proyecto.objetivoGeneral}
                  onChange={(e) => setProyecto({ ...proyecto, objetivoGeneral: e.target.value })}
                  placeholder="Describe el objetivo general del proyecto..."
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex justify-between">
              {proyecto.titulo && (
                <button
                  type="button"
                  onClick={finalizarProyecto}
                  disabled={guardando}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
                >
                  Finalizar proyecto
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowProyectoModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={guardarProyecto}
                  disabled={guardando}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {guardando ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Cronograma - Edicion por dia */}
      {showCronogramaModal && diaEditando && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-green-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-slate-800">
                  {diaEditando} {cronograma[diaEditando]?.fecha && `(${formatearFecha(cronograma[diaEditando].fecha)})`}
                </h3>
              </div>
              <button type="button" onClick={() => { setShowCronogramaModal(false); setDiaEditando(null) }} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              
              {/* Recibimiento */}
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-1">Recibimiento</label>
                <textarea
                  value={cronograma[diaEditando]?.recibimiento || ""}
                  onChange={(e) => actualizarCronograma(diaEditando, "recibimiento", e.target.value)}
                  placeholder="Ej: Juego en la alfombra con bloques y maderitas..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>
              
              {/* Intercambio */}
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-1">Intercambio</label>
                <textarea
                  value={cronograma[diaEditando]?.intercambio || ""}
                  onChange={(e) => actualizarCronograma(diaEditando, "intercambio", e.target.value)}
                  placeholder="Ej: Hablamos sobre animales domesticos..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>
              
              {/* Separador ACTIVIDAD */}
              <div className="border-t-2 border-green-200 pt-4">
                <h4 className="font-bold text-green-700 mb-3">ACTIVIDAD</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la actividad</label>
                    <input
                      type="text"
                      value={cronograma[diaEditando]?.actividad_nombre || ""}
                      onChange={(e) => actualizarCronograma(diaEditando, "actividad_nombre", e.target.value)}
                      placeholder="Ej: Juego con dados y cantidades"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Capacidades</label>
                    <textarea
                      value={cronograma[diaEditando]?.actividad_capacidades || ""}
                      onChange={(e) => actualizarCronograma(diaEditando, "actividad_capacidades", e.target.value)}
                      placeholder="Ej: Autonomia para aprender, Resolucion de problemas..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contenidos</label>
                    <textarea
                      value={cronograma[diaEditando]?.actividad_contenidos || ""}
                      onChange={(e) => actualizarCronograma(diaEditando, "actividad_contenidos", e.target.value)}
                      placeholder="Ej: Agrupacion y clasificacion de objetos..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo</label>
                    <textarea
                      value={cronograma[diaEditando]?.actividad_objetivo || ""}
                      onChange={(e) => actualizarCronograma(diaEditando, "actividad_objetivo", e.target.value)}
                      placeholder="Ej: Anticipar y explorar distintas acciones..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Desarrollo</label>
                    <textarea
                      value={cronograma[diaEditando]?.actividad_desarrollo || ""}
                      onChange={(e) => actualizarCronograma(diaEditando, "actividad_desarrollo", e.target.value)}
                      placeholder="Describe como se desarrolla la actividad..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-200"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Materiales</label>
                    <textarea
                      value={cronograma[diaEditando]?.actividad_materiales || ""}
                      onChange={(e) => actualizarCronograma(diaEditando, "actividad_materiales", e.target.value)}
                      placeholder="Ej: Dados, tapitas, hojas..."
                      rows={2}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-200"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowCronogramaModal(false); setDiaEditando(null) }}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
