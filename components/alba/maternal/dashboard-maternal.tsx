"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Users, BookOpen, Calendar, Sparkles, FileText, Save, GraduationCap, Pencil } from "lucide-react"

// Salas de maternal disponibles
const SALAS_MATERNAL = ["Patitos", "Ositos", "Conejitos", "SALA_MATERNAL_PRUEBA"]

// Dias de la semana
const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"] as const

export function DashboardMaternal() {
  const [salaActual, setSalaActual] = useState("Patitos")
  const [showSalaDropdown, setShowSalaDropdown] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensajeGuardado, setMensajeGuardado] = useState("")
  
  // Cronograma semanal - texto libre por dia
  const [cronograma, setCronograma] = useState<Record<string, string>>({
    Lunes: "",
    Martes: "",
    Miercoles: "",
    Jueves: "",
    Viernes: "",
  })
  const [showCronogramaModal, setShowCronogramaModal] = useState(false)
  
  // Proyecto/Unidad Didactica
  const [proyecto, setProyecto] = useState({
    titulo: "",
    objetivoGeneral: "",
    duracion: "",
    fundamentacion: "",
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
  
  // Guardar cronograma y generar sugerencias
  async function guardarCronograma() {
    setGuardando(true)
    setLoadingSugerencias(true)
    
    await new Promise(r => setTimeout(r, 1500))
    
    // ALBA genera sugerencias basadas en el cronograma y proyecto
    const textoCompleto = Object.values(cronograma).join(" ").toLowerCase()
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
    
    setGuardando(false)
    setLoadingSugerencias(false)
  }

  async function guardarProyecto() {
    setGuardando(true)
    await new Promise(r => setTimeout(r, 1000))
    setMensajeGuardado("Proyecto guardado")
    setTimeout(() => setMensajeGuardado(""), 3000)
    setGuardando(false)
    setShowProyectoModal(false)
  }

  // Contar actividades cargadas en la semana
  const actividadesCargadas = Object.values(cronograma).filter(t => t.trim().length > 0).length

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
          
          {/* Fila superior: Proyecto + Registro del Aula */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Tarjeta Proyecto/Unidad Didactica */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                  </div>
                  <h2 className="font-semibold text-slate-800">Proyecto / Unidad Didactica</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProyectoModal(true)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </button>
              </div>
              <div className="p-4">
                {proyecto.titulo ? (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-slate-800">{proyecto.titulo}</h3>
                    {proyecto.duracion && <p className="text-xs text-slate-500">Duracion: {proyecto.duracion}</p>}
                    <p className="text-sm text-slate-600 line-clamp-3">{proyecto.objetivoGeneral}</p>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 mb-3">Aun no hay proyecto cargado</p>
                    <button
                      type="button"
                      onClick={() => setShowProyectoModal(true)}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      + Cargar proyecto
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Tarjeta Registro del Aula */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="font-semibold text-slate-800">Registro del Aula</h2>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">
                  {alumnos.length} alumnos
                </span>
              </div>
              <div className="p-4">
                {alumnos.length > 0 ? (
                  <div className="text-sm text-slate-600">
                    Lista de alumnos cargada
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 mb-3">Aun no hay alumnos cargados</p>
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      + Cargar lista
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tarjeta Cronograma Semanal */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800">Cronograma Semanal</h2>
                  <p className="text-xs text-slate-400">{actividadesCargadas} dias con actividades</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCronogramaModal(true)}
                  className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={guardarCronograma}
                  disabled={guardando}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e3a5f] hover:bg-[#2a4a6f] text-white text-sm font-medium transition-colors disabled:opacity-50"
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
            
            {/* Vista resumida del cronograma */}
            <div className="p-4">
              <div className="grid grid-cols-5 gap-2">
                {DIAS.map((dia) => (
                  <div key={dia} className="flex flex-col">
                    <div className="text-center py-1.5 px-2 bg-slate-100 rounded-t-lg font-medium text-xs text-slate-600">
                      {dia}
                    </div>
                    <div className="flex-1 border border-t-0 border-slate-200 rounded-b-lg p-2 min-h-[80px] bg-slate-50">
                      {cronograma[dia] ? (
                        <p className="text-[10px] text-slate-600 line-clamp-4">{cronograma[dia]}</p>
                      ) : (
                        <p className="text-[10px] text-slate-300 text-center">Sin actividades</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Fila inferior: Sugerencias ALBA + Capacitacion */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Tarjeta Sugerencias de ALBA */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="font-semibold text-slate-800">Sugerencias de ALBA</h2>
              </div>
              <div className="p-4">
                {loadingSugerencias ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                    <span className="ml-3 text-sm text-slate-500">ALBA esta analizando...</span>
                  </div>
                ) : sugerenciasALBA.length > 0 ? (
                  <ul className="space-y-2">
                    {sugerenciasALBA.map((sug, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                        {sug}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6">
                    <Sparkles className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">Guarda el cronograma para recibir sugerencias</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Tarjeta Capacitacion Just-in-Time */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-teal-600" />
                </div>
                <h2 className="font-semibold text-slate-800">Capacitacion Just-in-Time</h2>
              </div>
              <div className="p-4">
                <div className="text-center py-6">
                  <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Recursos y guias apareceran segun las actividades planificadas</p>
                </div>
              </div>
            </div>
          </div>
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
                <label className="block text-sm font-medium text-slate-700 mb-1">Fundamentacion</label>
                <textarea
                  value={proyecto.fundamentacion}
                  onChange={(e) => setProyecto({ ...proyecto, fundamentacion: e.target.value })}
                  placeholder="Por que elegiste este proyecto..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Objetivo de aprendizaje</label>
                <textarea
                  value={proyecto.objetivoGeneral}
                  onChange={(e) => setProyecto({ ...proyecto, objetivoGeneral: e.target.value })}
                  placeholder="Que se espera lograr..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button type="button" onClick={() => setShowProyectoModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cancelar</button>
              <button type="button" onClick={guardarProyecto} disabled={guardando} className="px-4 py-2 text-sm text-white bg-[#1e3a5f] hover:bg-[#2a4a6f] rounded-xl transition-colors disabled:opacity-50">
                {guardando ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Cronograma */}
      {showCronogramaModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-green-50">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-slate-800">Cronograma Semanal</h3>
              </div>
              <button type="button" onClick={() => setShowCronogramaModal(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {DIAS.map((dia) => (
                  <div key={dia} className="flex flex-col">
                    <div className="text-center py-2 px-3 bg-green-100 rounded-t-xl font-semibold text-sm text-green-800">
                      {dia}
                    </div>
                    <div className="flex-1 border border-t-0 border-slate-200 rounded-b-xl p-2 bg-white">
                      {/* Bloques fijos */}
                      <div className="space-y-1 mb-2">
                        <div className="text-[10px] px-2 py-1 rounded bg-purple-100 text-purple-700 font-medium">🎵 Musica</div>
                        <div className="text-[10px] px-2 py-1 rounded bg-orange-100 text-orange-700 font-medium">⚽ Ed. Fisica</div>
                        <div className="text-[10px] px-2 py-1 rounded bg-blue-100 text-blue-700 font-medium">🌎 Ingles</div>
                      </div>
                      
                      {/* Textarea para contenido */}
                      <textarea
                        value={cronograma[dia]}
                        onChange={(e) => setCronograma({ ...cronograma, [dia]: e.target.value })}
                        placeholder={`Recibimiento:\n\nIntercambio:\n\nACTIVIDAD:\nAREA:\nOBJETIVOS:\nDESARROLLO:\n\nDespedida.`}
                        className="w-full h-48 text-xs p-2 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2 bg-slate-50">
              <button type="button" onClick={() => setShowCronogramaModal(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Cerrar</button>
              <button
                type="button"
                onClick={() => { guardarCronograma(); setShowCronogramaModal(false) }}
                disabled={guardando}
                className="px-4 py-2 text-sm text-white bg-[#1e3a5f] hover:bg-[#2a4a6f] rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {guardando ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
