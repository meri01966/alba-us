"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Users, BookOpen, Calendar, Sparkles, FileText, Save, GraduationCap, Pencil, Check, Plus, X, Music, Dumbbell, Globe, CheckCircle } from "lucide-react"

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
  
  // Clases especiales (Ed Fisica, Musica, Ingles) - drag & drop
  const [clasesEspeciales, setClasesEspeciales] = useState<{ tipo: string; dia: string }[]>([])
  const [editandoClases, setEditandoClases] = useState(false)
  const [draggingClase, setDraggingClase] = useState<string | null>(null)
  
  // Vistas de lectura (sin edicion)
  const [showCronogramaLectura, setShowCronogramaLectura] = useState(false)
  const [showProyectoLectura, setShowProyectoLectura] = useState(false)
  
  // Calificacion de actividades al finalizar semana
  const [showCalificacionModal, setShowCalificacionModal] = useState(false)
  const [calificaciones, setCalificaciones] = useState<{ [key: string]: string }>({})
  
  // Sugerencias de ALBA basadas en el proyecto
  const [sugerenciasAlba, setSugerenciasAlba] = useState<{ dia: string; actividad: { nombre: string; capacidades: string; contenidos: string; objetivo: string; desarrollo: string; materiales: string } }[]>([])
  const [generandoSugerencias, setGenerandoSugerencias] = useState(false)
  const [actividadesYaSugeridas, setActividadesYaSugeridas] = useState<string[]>([]) // Nombres de actividades ya sugeridas para no repetir
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
    
    // Cargar clases especiales
    try {
      const res = await fetch(`${base}/api/clases-especiales-maternal?sala=${encodeURIComponent(salaActual)}`, { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        if (data.ok && data.clases && data.clases.length > 0) {
          setClasesEspeciales(data.clases.map((c: any) => ({ tipo: c.tipo, dia: c.dia })))
        } else if (data.ok) {
          setClasesEspeciales([])
        }
      }
    } catch (e) {
      // Error silencioso - las clases especiales no son criticas
    }
    
    setLoading(false)
  }
  
  // Guardar clases especiales
  async function guardarClasesEspeciales() {
    const base = typeof window !== "undefined" ? window.location.origin : ""
    try {
      const res = await fetch(`${base}/api/clases-especiales-maternal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala: salaActual, clases: clasesEspeciales })
      })
      await res.json()
      setEditandoClases(false)
    } catch (e) {
      // Error silencioso
    }
  }
  
  // Agregar clase especial a un dia
  function agregarClaseADia(tipo: string, dia: string) {
    // Verificar que no haya mas de 2 de cada tipo
    const cantidadTipo = clasesEspeciales.filter(c => c.tipo === tipo).length
    if (cantidadTipo >= 2) return
    
    setClasesEspeciales([...clasesEspeciales, { tipo, dia }])
  }
  
  // Eliminar clase especial
  function eliminarClaseEspecial(tipo: string, dia: string) {
    const idx = clasesEspeciales.findIndex(c => c.tipo === tipo && c.dia === dia)
    if (idx >= 0) {
      const nuevas = [...clasesEspeciales]
      nuevas.splice(idx, 1)
      setClasesEspeciales(nuevas)
    }
  }
  
  // Generar tips didacticos de ALBA basados en el proyecto
  function generarTipsALBA() {
    if (!proyecto.titulo) {
      setSugerenciasALBA([])
      return
    }
    
    setLoadingSugerencias(true)
    
    const titulo = proyecto.titulo.toLowerCase()
    const objetivo = proyecto.objetivoGeneral?.toLowerCase() || ""
    
    // Tips basados en teorias pedagogicas: Vigotsky, Perkins, Montessori, Reggio Emilia
    const tipsGenerales = [
      // Vigotsky - Zona de Desarrollo Proximo
      "Vigotsky: Ofrece andamiaje - ayuda inicial que vas retirando a medida que el nino gana confianza",
      "Vigotsky: Promueve el trabajo entre pares - los ninos aprenden unos de otros en su ZDP",
      "Vigotsky: El lenguaje guia el pensamiento - verbaliza en voz alta mientras modelas la actividad",
      // Perkins - Ensenanza para la Comprension
      "Perkins: Comienza con preguntas abiertas que despierten curiosidad genuina",
      "Perkins: Conecta con lo que ya saben - construye sobre conocimientos previos",
      "Perkins: Haz visible el pensamiento - pregunta 'Como lo pensaste?' 'Que te hizo elegir eso?'",
      // Montessori
      "Montessori: Prepara el ambiente - todo al alcance del nino, ordenado y atractivo",
      "Montessori: Sigue al nino - observa sus intereses y adapta la propuesta",
      "Montessori: Un material, un proposito - evita sobrecargar con demasiadas opciones",
      "Montessori: Respeta la concentracion - no interrumpas cuando estan absortos en una tarea",
      // Reggio Emilia
      "Reggio Emilia: Documenta el proceso - fotos, frases de los ninos, producciones",
      "Reggio Emilia: El ambiente es el tercer maestro - cuida la estetica y la organizacion",
      "Reggio Emilia: Ofrece provocaciones - materiales dispuestos de forma atractiva que inviten a explorar",
      "Reggio Emilia: Los 100 lenguajes - ofrece multiples formas de expresion (dibujo, cuerpo, palabras)",
      // Tips practicos de didactica
      "Comienza cada actividad con una cancion o rima para captar la atencion del grupo",
      "Respeta los tiempos de atencion: 10-15 minutos de actividad dirigida en maternal",
      "Incorpora momentos de movimiento entre actividades para liberar energia",
      "Cierra cada actividad con una reflexion grupal: Que hicimos? Que aprendimos?",
      "Usa el juego como vehiculo principal de aprendizaje - todo se aprende mejor jugando"
    ]
    
    // Tips especificos segun el tema del proyecto con fundamentos teoricos
    const tipsEspecificos: { [key: string]: string[] } = {
      animales: [
        "Vigotsky: Construyan conocimiento juntos investigando que comen los animales del proyecto",
        "Montessori: Usa animales de goma realistas para explorar caracteristicas (patas, alas, escamas)",
        "Reggio Emilia: Crea un rincon de investigacion con libros, imagenes y elementos naturales",
        "Perkins: Plantea un misterio - 'Por que este animal tiene esas orejas tan grandes?'",
        "Invita a un familiar que tenga mascota a compartir su experiencia con el grupo",
        "Usa sonidos de animales reales para ejercicios de escucha activa y reconocimiento"
      ],
      naturaleza: [
        "Montessori: Usa materiales sensoriales reales - hojas, cortezas, semillas, tierra",
        "Reggio Emilia: Documenta el crecimiento de plantas con dibujos semanales de los ninos",
        "Vigotsky: Guia la observacion con preguntas que amplien lo que ven espontaneamente",
        "Perkins: Conecta con experiencias previas - 'Vieron plantas en su casa? Como son?'",
        "Organiza una salida al patio o jardin para observar elementos naturales in situ",
        "Registra el clima diariamente en un calendario grupal como rutina"
      ],
      familia: [
        "Reggio Emilia: Crea un mural de pertenencia con fotos de todas las familias",
        "Vigotsky: Valora lo que cada nino trae de su familia como conocimiento previo",
        "Montessori: Respeta los tiempos de cada nino para hablar de su familia",
        "Perkins: Reflexiona sobre diversidad - todas las familias son diferentes y valiosas",
        "Invita a familiares a compartir oficios, tradiciones, musica o comidas tipicas",
        "Propone actividades de cocina con recetas sencillas traidas de las familias"
      ],
      cuerpo: [
        "Montessori: Usa espejos grandes para que exploren su imagen corporal",
        "Vigotsky: Nombra las partes del cuerpo mientras las tocan - el lenguaje construye conocimiento",
        "Reggio Emilia: Crea siluetas a tamano real como documentacion del crecimiento",
        "Perkins: Conecta con lo cotidiano - 'Para que usamos las manos? Y los pies?'",
        "Incorpora circuitos motores con diferentes desafios de movimiento",
        "Trabaja la relajacion y respiracion como cierre de jornada - cuida el bienestar emocional"
      ],
      colores: [
        "Montessori: Usa tabletas de color para gradaciones y emparejamiento",
        "Reggio Emilia: Explora con mesa de luz y acetatos para descubrir mezclas",
        "Vigotsky: Nombra los colores constantemente en contexto - 'Veo que elegiste el rojo!'",
        "Perkins: Pregunta por decisiones - 'Por que elegiste ese color para el cielo?'",
        "Propone un dia de cada color donde todo gira en torno a ese tono",
        "Usa elementos traslucidos y luz natural para explorar como cambian los colores"
      ]
    }
    
    // Detectar tema
    let tema = ""
    if (titulo.includes("animal") || objetivo.includes("animal") || titulo.includes("granja")) {
      tema = "animales"
    } else if (titulo.includes("natural") || objetivo.includes("planta") || titulo.includes("ambiente")) {
      tema = "naturaleza"
    } else if (titulo.includes("familia") || objetivo.includes("familia")) {
      tema = "familia"
    } else if (titulo.includes("cuerpo") || objetivo.includes("cuerpo") || titulo.includes("movimiento")) {
      tema = "cuerpo"
    } else if (titulo.includes("color") || objetivo.includes("color") || titulo.includes("arte")) {
      tema = "colores"
    }
    
    // Combinar tips generales con especificos
    const tips: string[] = []
    
    // Agregar 2 tips generales aleatorios
    const shuffledGenerales = [...tipsGenerales].sort(() => Math.random() - 0.5)
    tips.push(shuffledGenerales[0], shuffledGenerales[1])
    
    // Agregar tips especificos si hay tema detectado
    if (tema && tipsEspecificos[tema]) {
      const shuffledEspecificos = [...tipsEspecificos[tema]].sort(() => Math.random() - 0.5)
      tips.push(shuffledEspecificos[0], shuffledEspecificos[1])
    } else {
      tips.push(shuffledGenerales[2], shuffledGenerales[3])
    }
    
    setTimeout(() => {
      setSugerenciasALBA(tips)
      setLoadingSugerencias(false)
    }, 500)
  }
  
  // Llamar a generarTipsALBA cuando cambia el proyecto
  useEffect(() => {
    generarTipsALBA()
  }, [proyecto.titulo])
  
  // Generar sugerencias de ALBA basadas en el proyecto
  async function generarSugerenciasAlba() {
    if (!proyecto.titulo || !proyecto.objetivoGeneral) return
    
    setGenerandoSugerencias(true)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    
    try {
      const res = await fetch(`${base}/api/brain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sugerir_actividades_semana",
          proyecto: {
            titulo: proyecto.titulo,
            objetivoGeneral: proyecto.objetivoGeneral,
            duracion: proyecto.duracion
          },
          sala: salaActual,
          dias: DIAS,
          actividadesYaSugeridas // Enviar actividades ya aceptadas/rechazadas para no repetir
        })
      })
      
      if (res.ok) {
        const data = await res.json()
        if (data.sugerencias && Array.isArray(data.sugerencias)) {
          setSugerenciasAlba(data.sugerencias)
        }
      }
    } catch (e) {
      // Error silencioso
    }
    
    setGenerandoSugerencias(false)
  }
  
  // Aceptar sugerencia de ALBA (agregar al cronograma y guardar)
  async function aceptarSugerenciaAlba(dia: string) {
    const sugerencia = sugerenciasAlba.find(s => s.dia === dia)
    if (!sugerencia) return
    
    // Registrar actividad aceptada para no repetirla
    setActividadesYaSugeridas([...actividadesYaSugeridas, sugerencia.actividad.nombre])
    
    const nuevoCronograma = { ...cronograma }
    if (!nuevoCronograma[dia].actividades) {
      nuevoCronograma[dia].actividades = [{ nombre: "", capacidades: "", contenidos: "", objetivo: "", desarrollo: "", materiales: "" }]
    }
    
    // Agregar la sugerencia como nueva actividad
    nuevoCronograma[dia].actividades.push(sugerencia.actividad)
    setCronograma(nuevoCronograma)
    
    // Remover la sugerencia
    setSugerenciasAlba(sugerenciasAlba.filter(s => s.dia !== dia))
    
    // Guardar en Supabase inmediatamente
    const base = typeof window !== "undefined" ? window.location.origin : ""
    try {
      await fetch(`${base}/api/cronograma-maternal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala: salaActual, cronograma: nuevoCronograma })
      })
    } catch (e) {
      // Error silencioso
    }
  }
  
  // Rechazar sugerencia de ALBA (tambien la registramos para no repetirla)
  function rechazarSugerenciaAlba(dia: string) {
    const sugerencia = sugerenciasAlba.find(s => s.dia === dia)
    if (sugerencia) {
      setActividadesYaSugeridas([...actividadesYaSugeridas, sugerencia.actividad.nombre])
    }
    setSugerenciasAlba(sugerenciasAlba.filter(s => s.dia !== dia))
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
                    <button
                      type="button"
                      onClick={() => proyecto.titulo && setShowProyectoLectura(true)}
                      className={`w-12 h-12 rounded-2xl bg-amber-400 flex items-center justify-center shadow-md transition-colors ${proyecto.titulo ? "hover:bg-amber-500 cursor-pointer" : ""}`}
                      title={proyecto.titulo ? "Ver proyecto completo" : ""}
                    >
                      <BookOpen className="w-6 h-6 text-white" />
                    </button>
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
            
            {/* Tarjeta Cronograma Semanal - DESTACADA */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg border-2 border-green-200 overflow-hidden hover:shadow-xl transition-shadow">
              <div className="px-5 py-4 border-b border-green-200/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCronogramaLectura(true)}
                    className="w-12 h-12 rounded-2xl bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-md transition-colors cursor-pointer"
                    title="Ver cronograma completo"
                  >
                    <Calendar className="w-6 h-6 text-white" />
                  </button>
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
                    onClick={() => setShowCalificacionModal(true)}
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
                    <div 
                      key={dia} 
                      className="flex flex-col"
                    >
                      <div className="text-center py-2 px-2 bg-green-500 rounded-t-xl font-bold text-sm text-white shadow-sm">
                        {dia} {cronograma[dia]?.fecha && <span className="font-normal text-xs opacity-80">{formatearFecha(cronograma[dia].fecha)}</span>}
                      </div>
                      <div className="flex-1 border-2 border-t-0 border-green-200 rounded-b-xl p-3 min-h-[140px] bg-white">
                        {/* Clases especiales del dia */}
                        <div className="space-y-1 mb-2">
                          {clasesEspeciales.filter(c => c.dia === dia).map((clase, idx) => (
                            <div 
                              key={`${clase.tipo}-${idx}`} 
                              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium ${
                                clase.tipo === "edFisica" ? "bg-orange-100 text-orange-700 border-l-2 border-orange-500" :
                                clase.tipo === "musica" ? "bg-purple-100 text-purple-700 border-l-2 border-purple-500" :
                                "bg-blue-100 text-blue-700 border-l-2 border-blue-500"
                              }`}
                            >
                              {clase.tipo === "edFisica" && <><Dumbbell className="w-2.5 h-2.5" /> Ed. Fisica</>}
                              {clase.tipo === "musica" && <><Music className="w-2.5 h-2.5" /> Musica</>}
                              {clase.tipo === "ingles" && <><Globe className="w-2.5 h-2.5" /> Ingles</>}
                            </div>
                          ))}
                        </div>
                        
                        {/* Contenido del dia */}
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
                          </div>
                        ) : (
                          <p className="text-xs text-slate-300 text-center mt-6">Sin actividades</p>
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
                <div className="px-5 py-4 border-b border-purple-200/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center shadow-md">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-800 text-lg">Sugerencias de ALBA</h2>
                      <p className="text-xs text-purple-600">Tips para tu planificacion</p>
                    </div>
                  </div>
                  {proyecto.titulo && (
                    <button
                      type="button"
                      onClick={generarTipsALBA}
                      disabled={loadingSugerencias}
                      className="text-xs px-3 py-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 font-medium transition-colors disabled:opacity-50"
                    >
                      Nuevos tips
                    </button>
                  )}
                </div>
                <div className="p-5">
                  {loadingSugerencias ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="w-6 h-6 border-3 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                      <span className="ml-3 text-sm text-slate-500">ALBA esta pensando...</span>
                    </div>
                  ) : sugerenciasALBA.length > 0 ? (
                    <ul className="space-y-3">
                      {sugerenciasALBA.map((sug, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-700 bg-white p-3 rounded-xl border border-purple-100">
                          <Sparkles className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                          {sug}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-7 h-7 text-purple-400" />
                      </div>
                      <p className="text-slate-500 text-sm">Carga un proyecto para recibir tips didacticos personalizados</p>
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
                {/* Boton ALBA sugiere */}
                {proyecto.titulo && (
                  <button
                    type="button"
                    onClick={generarSugerenciasAlba}
                    disabled={generandoSugerencias}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
                    title="ALBA sugiere actividades basadas en tu proyecto"
                  >
                    {generandoSugerencias ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    ALBA sugiere
                  </button>
                )}
                {/* Boton Editar clases especiales */}
                {editandoClases ? (
                  <button
                    type="button"
                    onClick={guardarClasesEspeciales}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Listo
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditandoClases(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium transition-colors"
                  >
                    <Dumbbell className="w-4 h-4" />
                    Editar clases
                  </button>
                )}
                <button
                  type="button"
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
                  type="button"
                  onClick={() => setShowCronogramaModal(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Badges arrastrables cuando esta en modo edicion */}
            {editandoClases && (
              <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
                <p className="text-xs text-blue-700 mb-2 font-medium">Arrastra los badges al dia correspondiente (2 de cada uno maximo):</p>
                <div className="flex flex-wrap gap-2">
                  {[1, 2].map(n => {
                    const usado = clasesEspeciales.filter(c => c.tipo === "edFisica").length >= n
                    return (
                      <div
                        key={`ef-${n}`}
                        draggable={!usado}
                        onDragStart={() => !usado && setDraggingClase("edFisica")}
                        onDragEnd={() => setDraggingClase(null)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-l-4 border-orange-500 ${usado ? "bg-gray-100 opacity-50" : "bg-white cursor-grab active:cursor-grabbing shadow-sm hover:shadow"}`}
                      >
                        <Dumbbell className="w-3 h-3 text-orange-600" />
                        <span className="text-xs font-medium text-slate-700">Ed. Fisica {n}</span>
                      </div>
                    )
                  })}
                  {[1, 2].map(n => {
                    const usado = clasesEspeciales.filter(c => c.tipo === "musica").length >= n
                    return (
                      <div
                        key={`mu-${n}`}
                        draggable={!usado}
                        onDragStart={() => !usado && setDraggingClase("musica")}
                        onDragEnd={() => setDraggingClase(null)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-l-4 border-purple-500 ${usado ? "bg-gray-100 opacity-50" : "bg-white cursor-grab active:cursor-grabbing shadow-sm hover:shadow"}`}
                      >
                        <Music className="w-3 h-3 text-purple-600" />
                        <span className="text-xs font-medium text-slate-700">Musica {n}</span>
                      </div>
                    )
                  })}
                  {[1, 2].map(n => {
                    const usado = clasesEspeciales.filter(c => c.tipo === "ingles").length >= n
                    return (
                      <div
                        key={`in-${n}`}
                        draggable={!usado}
                        onDragStart={() => !usado && setDraggingClase("ingles")}
                        onDragEnd={() => setDraggingClase(null)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-l-4 border-blue-500 ${usado ? "bg-gray-100 opacity-50" : "bg-white cursor-grab active:cursor-grabbing shadow-sm hover:shadow"}`}
                      >
                        <Globe className="w-3 h-3 text-blue-600" />
                        <span className="text-xs font-medium text-slate-700">Ingles {n}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* Contenido - Los 5 dias */}
            <div className="p-4 grid grid-cols-5 gap-3 max-h-[80vh] overflow-y-auto">
              {DIAS.map((dia) => (
                <div 
                  key={dia} 
                  className={`bg-slate-50 rounded-xl border border-slate-200 overflow-hidden ${editandoClases && draggingClase ? "ring-2 ring-blue-300 ring-dashed" : ""}`}
                  onDragOver={editandoClases ? (e) => e.preventDefault() : undefined}
                  onDrop={editandoClases ? () => {
                    if (draggingClase) {
                      agregarClaseADia(draggingClase, dia)
                      setDraggingClase(null)
                    }
                  } : undefined}
                >
                  {/* Header del dia */}
                  <div className="bg-green-500 text-white px-3 py-2 text-center">
                    <div className="font-bold">{dia}</div>
                    <div className="text-xs opacity-80">{cronograma[dia]?.fecha && formatearFecha(cronograma[dia].fecha)}</div>
                  </div>
                  
                  <div className="p-3 space-y-3">
                    {/* Sugerencia de ALBA para este dia */}
                    {sugerenciasAlba.find(s => s.dia === dia) && (
                      <div className="p-2 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3 text-violet-600" />
                          <span className="text-[9px] font-bold text-violet-600 uppercase">Sugerencia ALBA</span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-700 mb-1">{sugerenciasAlba.find(s => s.dia === dia)?.actividad.nombre}</p>
                        <p className="text-[9px] text-slate-500 mb-2 line-clamp-2">{sugerenciasAlba.find(s => s.dia === dia)?.actividad.objetivo}</p>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => aceptarSugerenciaAlba(dia)}
                            className="flex-1 text-[9px] px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors"
                          >
                            Aceptar
                          </button>
                          <button
                            type="button"
                            onClick={() => rechazarSugerenciaAlba(dia)}
                            className="flex-1 text-[9px] px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded font-medium transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    )}
                    
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
                    
                    {/* Badges de clases especiales del dia */}
                    <div className="space-y-1">
                      {clasesEspeciales.filter(c => c.dia === dia).map((clase, idx) => (
                        <div 
                          key={`${clase.tipo}-${idx}`} 
                          className={`relative group flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                            clase.tipo === "edFisica" ? "bg-orange-100 text-orange-700 border-l-3 border-orange-500" :
                            clase.tipo === "musica" ? "bg-purple-100 text-purple-700 border-l-3 border-purple-500" :
                            "bg-blue-100 text-blue-700 border-l-3 border-blue-500"
                          }`}
                        >
                          {clase.tipo === "edFisica" && <><Dumbbell className="w-3 h-3" /> Ed. Fisica</>}
                          {clase.tipo === "musica" && <><Music className="w-3 h-3" /> Musica</>}
                          {clase.tipo === "ingles" && <><Globe className="w-3 h-3" /> Ingles</>}
                          {editandoClases && (
                            <button
                              type="button"
                              onClick={() => eliminarClaseEspecial(clase.tipo, dia)}
                              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      {clasesEspeciales.filter(c => c.dia === dia).length === 0 && (
                        <p className="text-[10px] text-slate-400 italic">Sin clases especiales</p>
                      )}
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
      
      {/* Modal Vista de Lectura del Cronograma */}
      {showCronogramaLectura && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-green-500 to-emerald-600">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Cronograma Semanal - {salaActual}</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCronogramaLectura(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-5 gap-4">
                {DIAS.map((dia) => (
                  <div key={dia} className="border border-slate-200 rounded-xl overflow-hidden">
                    <div className="bg-green-500 text-white text-center py-2 font-bold">
                      {dia}
                      {cronograma[dia]?.fecha && (
                        <span className="block text-xs font-normal opacity-80">{formatearFecha(cronograma[dia].fecha)}</span>
                      )}
                    </div>
                    <div className="p-3 space-y-3 bg-white min-h-[300px]">
                      {/* Clases especiales */}
                      {clasesEspeciales.filter(c => c.dia === dia).map((clase, idx) => (
                        <div 
                          key={`${clase.tipo}-${idx}`} 
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-xs font-medium ${
                            clase.tipo === "edFisica" ? "bg-orange-100 text-orange-700 border-l-3 border-orange-500" :
                            clase.tipo === "musica" ? "bg-purple-100 text-purple-700 border-l-3 border-purple-500" :
                            "bg-blue-100 text-blue-700 border-l-3 border-blue-500"
                          }`}
                        >
                          {clase.tipo === "edFisica" && <><Dumbbell className="w-3 h-3" /> Ed. Fisica</>}
                          {clase.tipo === "musica" && <><Music className="w-3 h-3" /> Musica</>}
                          {clase.tipo === "ingles" && <><Globe className="w-3 h-3" /> Ingles</>}
                        </div>
                      ))}
                      
                      {cronograma[dia]?.recibimiento && (
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Recibimiento</p>
                          <p className="text-xs text-slate-700">{cronograma[dia].recibimiento}</p>
                        </div>
                      )}
                      
                      {cronograma[dia]?.intercambio && (
                        <div className="bg-slate-50 p-2 rounded-lg">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">Intercambio</p>
                          <p className="text-xs text-slate-700">{cronograma[dia].intercambio}</p>
                        </div>
                      )}
                      
                      {cronograma[dia]?.actividades?.filter(a => a.nombre).map((act, i) => (
                        <div key={i} className="bg-green-50 p-2 rounded-lg border-l-3 border-green-500">
                          <p className="text-[10px] font-bold text-green-600 uppercase">Actividad {i+1}</p>
                          <p className="text-xs font-semibold text-slate-800">{act.nombre}</p>
                          {act.capacidades && <p className="text-[10px] text-slate-600 mt-1"><span className="font-semibold">Capacidades:</span> {act.capacidades}</p>}
                          {act.objetivo && <p className="text-[10px] text-slate-600"><span className="font-semibold">Objetivo:</span> {act.objetivo}</p>}
                          {act.desarrollo && <p className="text-[10px] text-slate-600"><span className="font-semibold">Desarrollo:</span> {act.desarrollo}</p>}
                          {act.materiales && <p className="text-[10px] text-slate-600"><span className="font-semibold">Materiales:</span> {act.materiales}</p>}
                        </div>
                      ))}
                      
                      {!cronograma[dia]?.recibimiento && !cronograma[dia]?.actividades?.some(a => a.nombre) && clasesEspeciales.filter(c => c.dia === dia).length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-8">Sin actividades</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Vista de Lectura del Proyecto */}
      {showProyectoLectura && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-400 to-orange-500">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Proyecto - {salaActual}</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowProyectoLectura(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase">Titulo</p>
                <h3 className="text-2xl font-bold text-slate-800">{proyecto.titulo}</h3>
              </div>
              {proyecto.duracion && (
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase">Duracion</p>
                  <p className="text-lg text-slate-700">{proyecto.duracion}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase">Objetivo General</p>
                <p className="text-slate-700 whitespace-pre-wrap">{proyecto.objetivoGeneral}</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowProyectoLectura(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Calificacion de Actividades antes de Finalizar Semana */}
      {showCalificacionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-red-500 to-rose-600">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Calificar Actividades de la Semana</h2>
              </div>
              <button
                onClick={() => setShowCalificacionModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
              <p className="text-sm text-slate-600 mb-4">Califica cada actividad realizada esta semana. Esto ayuda a ALBA a mejorar sus sugerencias.</p>
              
              {DIAS.map((dia) => {
                const actividadesDia = cronograma[dia]?.actividades?.filter(a => a.nombre) || []
                if (actividadesDia.length === 0) return null
                
                return (
                  <div key={dia} className="mb-6">
                    <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      {dia} {cronograma[dia]?.fecha && <span className="text-sm font-normal text-slate-500">({formatearFecha(cronograma[dia].fecha)})</span>}
                    </h3>
                    <div className="space-y-3">
                      {actividadesDia.map((act, idx) => {
                        const key = `${dia}-${idx}`
                        return (
                          <div key={key} className="bg-slate-50 p-4 rounded-xl">
                            <p className="font-semibold text-slate-800 mb-2">{act.nombre}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-slate-600">Calificacion:</span>
                              {["Excelente", "Buena", "Regular"].map((cal) => (
                                <button
                                  key={cal}
                                  type="button"
                                  onClick={() => setCalificaciones({ ...calificaciones, [key]: cal })}
                                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                    calificaciones[key] === cal
                                      ? cal === "Excelente" ? "bg-green-500 text-white" 
                                        : cal === "Buena" ? "bg-blue-500 text-white"
                                        : "bg-amber-500 text-white"
                                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                  }`}
                                >
                                  {cal}
                                </button>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              
              {!DIAS.some(dia => cronograma[dia]?.actividades?.some(a => a.nombre)) && (
                <p className="text-center text-slate-500 py-8">No hay actividades cargadas esta semana</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setShowCalificacionModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowCalificacionModal(false)
                  finalizarSemana()
                }}
                disabled={guardando}
                className="flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 shadow-md"
              >
                {guardando ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Confirmar y Finalizar Semana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
