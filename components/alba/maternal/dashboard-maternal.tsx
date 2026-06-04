"use client"

import { useState, useEffect } from "react"

// Dias de la semana
const DIAS = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"] as const
type Dia = typeof DIAS[number]

// Bloques fijos (maestras especiales)
const BLOQUES_FIJOS = {
  MUSICA: { titulo: "MUSICA", color: "#8B5CF6" },
  ED_FISICA: { titulo: "EDUCACION FISICA", color: "#F97316" },
  INGLES: { titulo: "INGLES", color: "#3B82F6" }
}

interface CronogramaData {
  [dia: string]: {
    bloqueLibre: string // Texto libre de la maestra de sala
    musica?: string
    edFisica?: string
    ingles?: string
  }
}

interface ProyectoData {
  titulo: string
  objetivoGeneral: string
  duracion: string
  fundamentacion: string
}

export function DashboardMaternal() {
  const [sala, setSala] = useState("")
  const [salas, setSalas] = useState<string[]>([])
  const [seccion, setSeccion] = useState<"registro" | "cronograma" | "proyecto">("cronograma")
  
  // Cronograma semanal
  const [cronograma, setCronograma] = useState<CronogramaData>({
    LUNES: { bloqueLibre: "" },
    MARTES: { bloqueLibre: "" },
    MIERCOLES: { bloqueLibre: "" },
    JUEVES: { bloqueLibre: "" },
    VIERNES: { bloqueLibre: "" }
  })
  
  // Proyecto/Unidad Didactica
  const [proyecto, setProyecto] = useState<ProyectoData>({
    titulo: "",
    objetivoGeneral: "",
    duracion: "",
    fundamentacion: ""
  })
  
  // Sugerencias de ALBA
  const [sugerenciasALBA, setSugerenciasALBA] = useState<string[]>([])
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false)
  
  // Guardado
  const [guardando, setGuardando] = useState(false)
  const [mensajeGuardado, setMensajeGuardado] = useState("")

  // Cargar salas de maternal al inicio
  useEffect(() => {
    cargarSalas()
  }, [])

  async function cargarSalas() {
    // Por ahora salas de ejemplo - despues conectamos a Supabase
    setSalas(["Sala Celeste (2 años)", "Sala Verde (3 años)", "SALADEPRUEBA_MATERNAL"])
    setSala("SALADEPRUEBA_MATERNAL")
  }

  function actualizarCronograma(dia: Dia, campo: string, valor: string) {
    setCronograma(prev => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor
      }
    }))
  }

  async function guardarCronograma() {
    setGuardando(true)
    setMensajeGuardado("")
    
    try {
      // TODO: Guardar en Supabase
      // Por ahora simulo el guardado
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generar sugerencias de ALBA
      setCargandoSugerencias(true)
      await generarSugerenciasALBA()
      setCargandoSugerencias(false)
      
      setMensajeGuardado("Cronograma guardado")
      setTimeout(() => setMensajeGuardado(""), 3000)
    } catch (e) {
      console.error("[v0] Error guardando cronograma:", e)
      setMensajeGuardado("Error al guardar")
    }
    
    setGuardando(false)
  }

  async function generarSugerenciasALBA() {
    // ALBA lee el cronograma y el proyecto para sugerir actividades
    // Por ahora sugerencias de ejemplo - despues conectamos al API con el DC de 2/3 años
    const sugerencias = []
    
    // Analizar que areas se trabajaron
    const textoCompleto = Object.values(cronograma).map(d => d.bloqueLibre).join(" ").toLowerCase()
    
    if (textoCompleto.includes("matematica") || textoCompleto.includes("cantidad") || textoCompleto.includes("dado")) {
      sugerencias.push("Para reforzar Matematica: Juego de correspondencia uno a uno con objetos cotidianos")
    }
    if (textoCompleto.includes("lengua") || textoCompleto.includes("cuento") || textoCompleto.includes("lectura")) {
      sugerencias.push("Para reforzar Lengua: Lectura dialogica con pausas para preguntas abiertas")
    }
    if (textoCompleto.includes("arte") || textoCompleto.includes("expresivo") || textoCompleto.includes("dibujo")) {
      sugerencias.push("Para Lenguajes Expresivos: Explorar texturas con materiales naturales")
    }
    if (proyecto.titulo) {
      sugerencias.push(`Relacionado con el proyecto "${proyecto.titulo}": Actividad de indagacion del ambiente`)
    }
    
    if (sugerencias.length === 0) {
      sugerencias.push("Completa mas actividades en el cronograma para recibir sugerencias de ALBA")
    }
    
    setSugerenciasALBA(sugerencias)
  }

  async function guardarProyecto() {
    setGuardando(true)
    setMensajeGuardado("")
    
    try {
      // TODO: Guardar en Supabase
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMensajeGuardado("Proyecto guardado")
      setTimeout(() => setMensajeGuardado(""), 3000)
    } catch (e) {
      console.error("[v0] Error guardando proyecto:", e)
      setMensajeGuardado("Error al guardar")
    }
    
    setGuardando(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Barra azul superior */}
      <header className="bg-blue-600 text-white px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold">ALBA</h1>
              <p className="text-xs text-white/80">Maternal - Salas de 2 y 3 años</p>
            </div>
          </div>
          
          {/* Selector de sala */}
          <select
            value={sala}
            onChange={(e) => setSala(e.target.value)}
            className="bg-white/20 border border-white/30 rounded-lg px-3 py-1.5 text-sm text-white"
          >
            {salas.map(s => (
              <option key={s} value={s} className="text-gray-900">{s}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Navegacion de secciones */}
      <nav className="bg-white border-b border-border px-4 py-2">
        <div className="max-w-7xl mx-auto flex gap-2">
          <button
            onClick={() => setSeccion("registro")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              seccion === "registro" 
                ? "bg-blue-100 text-blue-700" 
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Registro del Aula
          </button>
          <button
            onClick={() => setSeccion("cronograma")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              seccion === "cronograma" 
                ? "bg-blue-100 text-blue-700" 
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Cronograma Semanal
          </button>
          <button
            onClick={() => setSeccion("proyecto")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              seccion === "proyecto" 
                ? "bg-blue-100 text-blue-700" 
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Proyecto / Unidad Didactica
          </button>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto p-4">
        
        {/* REGISTRO DEL AULA */}
        {seccion === "registro" && (
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Registro del Aula</h2>
            <p className="text-sm text-muted-foreground">
              Igual que el de salas de 4/5 años - proximamente
            </p>
          </div>
        )}

        {/* CRONOGRAMA SEMANAL */}
        {seccion === "cronograma" && (
          <div className="space-y-4">
            {/* Mensaje de guardado */}
            {mensajeGuardado && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm text-center">
                {mensajeGuardado}
              </div>
            )}
            
            {/* Grilla del cronograma */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-5 divide-x divide-border">
                {DIAS.map(dia => (
                  <div key={dia} className="flex flex-col">
                    {/* Cabecera del dia */}
                    <div className="bg-blue-600 text-white px-3 py-2 text-center font-bold text-sm">
                      {dia}
                    </div>
                    
                    {/* Area de texto libre para la maestra de sala */}
                    <div className="p-2 flex-1 min-h-[400px] flex flex-col">
                      <textarea
                        value={cronograma[dia]?.bloqueLibre || ""}
                        onChange={(e) => actualizarCronograma(dia, "bloqueLibre", e.target.value)}
                        placeholder={`Recibimiento:\n\nIntercambio:\n\nPatio.\n\nDesayuno.\n\nACTIVIDAD:\nAREA:\nCAPACIDADES:\nOBJETIVOS:\nCONTENIDOS:\nDESARROLLO:\n\nDespedida.`}
                        className="flex-1 w-full p-2 text-xs border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      
                      {/* Bloques fijos */}
                      <div className="mt-2 space-y-1">
                        <div className="bg-purple-100 border border-purple-300 rounded px-2 py-1">
                          <p className="text-[10px] font-bold text-purple-700">MUSICA</p>
                          <input
                            type="text"
                            value={cronograma[dia]?.musica || ""}
                            onChange={(e) => actualizarCronograma(dia, "musica", e.target.value)}
                            placeholder="(Maestra especial)"
                            className="w-full text-[10px] bg-transparent border-none outline-none text-purple-600 placeholder:text-purple-400"
                          />
                        </div>
                        <div className="bg-orange-100 border border-orange-300 rounded px-2 py-1">
                          <p className="text-[10px] font-bold text-orange-700">ED. FISICA</p>
                          <input
                            type="text"
                            value={cronograma[dia]?.edFisica || ""}
                            onChange={(e) => actualizarCronograma(dia, "edFisica", e.target.value)}
                            placeholder="(Maestra especial)"
                            className="w-full text-[10px] bg-transparent border-none outline-none text-orange-600 placeholder:text-orange-400"
                          />
                        </div>
                        <div className="bg-blue-100 border border-blue-300 rounded px-2 py-1">
                          <p className="text-[10px] font-bold text-blue-700">INGLES</p>
                          <input
                            type="text"
                            value={cronograma[dia]?.ingles || ""}
                            onChange={(e) => actualizarCronograma(dia, "ingles", e.target.value)}
                            placeholder="(Maestra especial)"
                            className="w-full text-[10px] bg-transparent border-none outline-none text-blue-600 placeholder:text-blue-400"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Boton guardar y sugerencias de ALBA */}
            <div className="flex gap-4">
              {/* Boton guardar */}
              <button
                onClick={guardarCronograma}
                disabled={guardando}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
              >
                {guardando ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Guardar Cronograma
              </button>
              
              {/* Sugerencias de ALBA */}
              {sugerenciasALBA.length > 0 && (
                <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
                    <p className="text-sm font-semibold text-blue-800">Sugerencias de ALBA:</p>
                  </div>
                  {cargandoSugerencias ? (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Analizando actividades...
                    </div>
                  ) : (
                    <ul className="text-sm text-blue-700 space-y-1">
                      {sugerenciasALBA.map((s, i) => (
                        <li key={i}>• {s}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROYECTO / UNIDAD DIDACTICA */}
        {seccion === "proyecto" && (
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Proyecto / Unidad Didactica</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Carga el proyecto. Las actividades se cargan en el Cronograma Semanal.
            </p>
            
            {/* Titulo */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Titulo del Proyecto</label>
              <input
                type="text"
                value={proyecto.titulo}
                onChange={(e) => setProyecto({ ...proyecto, titulo: e.target.value })}
                placeholder="Ej: Conocemos los animales de la granja"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Duracion */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Duracion</label>
              <input
                type="text"
                value={proyecto.duracion}
                onChange={(e) => setProyecto({ ...proyecto, duracion: e.target.value })}
                placeholder="Ej: 3 semanas"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Fundamentacion */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Fundamentacion</label>
              <textarea
                value={proyecto.fundamentacion}
                onChange={(e) => setProyecto({ ...proyecto, fundamentacion: e.target.value })}
                placeholder="Por que elegiste este proyecto..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Objetivo General */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Objetivo General</label>
              <textarea
                value={proyecto.objetivoGeneral}
                onChange={(e) => setProyecto({ ...proyecto, objetivoGeneral: e.target.value })}
                placeholder="Que se espera lograr con este proyecto..."
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Mensaje de guardado */}
            {mensajeGuardado && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm text-center">
                {mensajeGuardado}
              </div>
            )}
            
            {/* Boton guardar */}
            <button
              onClick={guardarProyecto}
              disabled={guardando}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {guardando ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              Guardar Proyecto
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
