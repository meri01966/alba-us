"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Users, BookOpen, Calendar, Sparkles, FileText, Save, GraduationCap, Pencil, Check, Plus, X, Music, Dumbbell, Globe, CheckCircle, FolderClock, ChevronRight, Eye } from "lucide-react"

// Salas de maternal disponibles (2 y 3 años)
// Color de cada capacidad. IDENTIDAD, no estado: ninguno es verde ni rojo,
// para que nunca se confundan con "realizada" o "sin hacer".
const COLOR_CAPACIDAD: Record<string, { bg: string; border: string; text: string }> = {
  COM: { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8" },  // Comunicacion — azul
  AUT: { bg: "#f5f3ff", border: "#c4b5fd", text: "#6d28d9" },  // Autonomia — violeta
  RES: { bg: "#f0fdfa", border: "#5eead4", text: "#0f766e" },  // Resolucion — turquesa
  COL: { bg: "#fff7ed", border: "#fdba74", text: "#c2410c" },  // Colaboracion — naranja
  REF: { bg: "#fdf2f8", border: "#f9a8d4", text: "#be185d" },  // Reflexivo — rosa
}
const NOMBRE_CAPACIDAD: Record<string, string> = {
  COM: "Comunicacion", AUT: "Autonomia", RES: "Resolucion", COL: "Colaboracion", REF: "Reflexivo",
}

// Un dia se considera pasado si su fecha es anterior a hoy (hora de Argentina)
function diaYaPaso(fecha: string): boolean {
  if (!fecha) return false
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" })
  return fecha < hoy
}

const SALAS_MATERNAL = [
  "NARANJOS TM",      // 3 años turno mañana
  "NARANJOS TT",      // 3 años turno tarde
  "PINITOS TM",       // 2 años turno mañana
  "PINITOS TT",       // 2 años turno tarde
  "PRUEBA MATERNAL"
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

export function DashboardMaternal({ forzarSala }: { forzarSala?: string } = {}) {
  const [salaActual, setSalaActual] = useState(forzarSala || "Naranjos TM")
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

  // Mi Planificacion: historial completo (proyectos + semanas con actividades)
  const [showPlanificacion, setShowPlanificacion] = useState(false)
  const [planificacion, setPlanificacion] = useState<{ proyectos: any[]; semanas: any[] } | null>(null)
  const [loadingPlanificacion, setLoadingPlanificacion] = useState(false)
  const [semanaAbierta, setSemanaAbierta] = useState<string | null>(null)
  
  // Calificacion de actividades al finalizar semana
  const [showCalificacionModal, setShowCalificacionModal] = useState(false)
  const [calificaciones, setCalificaciones] = useState<{ [key: string]: string }>({})
  
  // Sugerencias de ALBA basadas en el proyecto
  const [sugerenciasAlba, setSugerenciasAlba] = useState<{ dia: string; actividad: { nombre: string; capacidades: string; contenidos: string; objetivo: string; desarrollo: string; materiales: string } }[]>([])
  const [generandoSugerencias, setGenerandoSugerencias] = useState(false)
  const [actividadesYaSugeridas, setActividadesYaSugeridas] = useState<string[]>([]) // Nombres de actividades ya sugeridas para no repetir
  
  // Recursos de capacitacion basados en las actividades planificadas
  const [recursosCapacitacion, setRecursosCapacitacion] = useState<{ titulo: string; autor: string; descripcion: string; tipo: string }[]>([])
  // Gestion de alumnos: usa el mismo endpoint que jardin (/api/students)
  const [showGestionSala, setShowGestionSala] = useState(false)
  const [bulkNames, setBulkNames] = useState("")
  const [cargandoAlumnos, setCargandoAlumnos] = useState(false)

  async function traerAlumnos() {
    if (!salaActual) return
    try {
      const res = await fetch(`/api/students?sala=${encodeURIComponent(salaActual)}`, { cache: "no-store" })
      const data = await res.json()
      setAlumnos(Array.isArray(data?.students) ? data.students : Array.isArray(data) ? data : [])
    } catch (e) {
      console.error("[v0] Error trayendo alumnos:", e)
    }
  }

  async function cargarListaAlumnos() {
    const nombres = bulkNames.split("\n").map((n) => n.trim().toUpperCase()).filter((n) => n.length > 0)
    if (nombres.length === 0) return
    setCargandoAlumnos(true)
    try {
      for (const nombre of nombres) {
        await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, sala: salaActual }),
        })
      }
      setBulkNames("")
      setShowGestionSala(false)
      await traerAlumnos()
    } catch (e) {
      console.error("[v0] Error cargando alumnos:", e)
    }
    setCargandoAlumnos(false)
  }

  async function borrarAlumno(id: string) {
    try {
      await fetch(`/api/students?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      await traerAlumnos()
    } catch (e) {
      console.error("[v0] Error borrando alumno:", e)
    }
  }

  // Registro de maternal: se evalua UNA capacidad por vez, la que hace mas
  // que no se mira. La docente marca solo a los que se apartan.
  const [showEvaluar, setShowEvaluar] = useState(false)
  const [datosEval, setDatosEval] = useState<any>(null)
  const [marcados, setMarcados] = useState<Record<string, string>>({})
  const [guardandoEval, setGuardandoEval] = useState(false)
  const [ultimoRegistro, setUltimoRegistro] = useState<{ fecha: string | null; dias: number | null }>({ fecha: null, dias: null })

  const [resumenEval, setResumenEval] = useState<any>(null)
  const [showSintesis, setShowSintesis] = useState(false)

  // Se trae al entrar: la tarjeta tiene que mostrar algo sin abrir nada
  async function traerResumenEval() {
    if (!salaActual) return
    try {
      const res = await fetch(`/api/registro-maternal?sala=${encodeURIComponent(salaActual)}`, { cache: "no-store" })
      const data = await res.json()
      if (data?.ok) {
        setResumenEval(data)
        setUltimoRegistro({ fecha: data.ultimoRegistro, dias: data.diasSinRegistrar })
      }
    } catch (e) {
      console.error("[v0] Error trayendo el resumen:", e)
    }
  }

  async function abrirEvaluar() {
    setShowEvaluar(true)
    setMarcados({})
    try {
      const res = await fetch(`/api/registro-maternal?sala=${encodeURIComponent(salaActual)}`, { cache: "no-store" })
      const data = await res.json()
      if (data?.ok) {
        setDatosEval(data)
        setUltimoRegistro({ fecha: data.ultimoRegistro, dias: data.diasSinRegistrar })
      }
    } catch (e) {
      console.error("[v0] Error abriendo el registro:", e)
    }
  }

  async function guardarEvaluacion() {
    if (!datosEval?.capacidadSugerida) return
    setGuardandoEval(true)
    try {
      await fetch("/api/registro-maternal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sala: salaActual,
          capacidad: datosEval.capacidadSugerida.key,
          paso: datosEval.indicador || datosEval.capacidadSugerida.nombre,
          marcados,
        }),
      })
      setShowEvaluar(false)
      await traerResumenEval()
    } catch (e) {
      console.error("[v0] Error guardando la evaluacion:", e)
    }
    setGuardandoEval(false)
  }

  // Micro capacitacion situada: anclada al proyecto y a la actividad del dia
  const [capacitacion, setCapacitacion] = useState<{ titulo: string; contenido: string; autor: string; tips: string[] } | null>(null)
  const [cargandoCap, setCargandoCap] = useState(false)
  const [capVistas, setCapVistas] = useState<string[]>([])
  
  // Cargar datos de la sala
  useEffect(() => {
    // Modo demo: sala forzada por prop, no leer ni guardar en localStorage
    if (forzarSala) {
      setSalaActual(forzarSala)
      return
    }
    const savedSala = localStorage.getItem("maternal-sala-activa")
    if (savedSala && SALAS_MATERNAL.includes(savedSala)) {
      setSalaActual(savedSala)
    }
  }, [])
  
  // Cargar cronograma y proyecto cuando cambia la sala
  useEffect(() => {
    cargarDatos()
    traerAlumnos()
    traerResumenEval()
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
    
    // Tips practicos de ALBA para la planificacion (sin teoria, concretos)
    const tipsGenerales = [
      "Comienza cada actividad con una cancion o rima para captar la atencion del grupo",
      "Respeta los tiempos de atencion: 10-15 minutos de actividad dirigida en maternal",
      "Incorpora momentos de movimiento entre actividades para liberar energia",
      "Prepara todos los materiales antes de que lleguen los ninos",
      "Cierra cada actividad con una reflexion grupal: Que hicimos? Que aprendimos?",
      "Ofrece opciones para respetar los diferentes ritmos de aprendizaje",
      "Documenta con fotos el proceso, no solo el resultado final",
      "Usa el juego como vehiculo principal - todo se aprende mejor jugando",
      "Involucra los 5 sentidos en las experiencias de exploracion",
      "Anticipa posibles dificultades y ten un plan B preparado"
    ]
    
    // Tips especificos segun el tema del proyecto
    const tipsEspecificos: { [key: string]: string[] } = {
      animales: [
        "Invita a un familiar que tenga mascota a compartir su experiencia",
        "Crea un rincon de observacion con imagenes y elementos de animales",
        "Usa sonidos reales de animales para ejercicios de escucha",
        "Propone dramatizaciones donde imiten comportamientos animales",
        "Arma una granja con animales de goma para juego libre"
      ],
      naturaleza: [
        "Organiza una salida al patio para observar elementos naturales",
        "Crea un sector de ciencias con lupas y recipientes para explorar",
        "Registra el clima diariamente en un calendario grupal",
        "Inicia germinadores para observar el ciclo de vida de las plantas",
        "Recolecta hojas, semillas y piedras para clasificar"
      ],
      familia: [
        "Solicita fotos familiares para crear un mural de pertenencia",
        "Invita a familiares a compartir oficios o tradiciones",
        "Respeta la diversidad de conformaciones familiares",
        "Propone cocinar recetas sencillas traidas de las familias",
        "Arma un rincon de casita con elementos del hogar"
      ],
      cuerpo: [
        "Usa espejos grandes para explorar la imagen corporal",
        "Incorpora circuitos motores con diferentes desafios",
        "Trabaja relajacion y respiracion al cierre de jornada",
        "Crea siluetas corporales en papel afiche",
        "Juega a estatuas musicales para trabajar control corporal"
      ],
      colores: [
        "Propone un dia de cada color donde todo gire en torno a ese tono",
        "Usa elementos traslucidos y luz para explorar mezclas",
        "Crea un rincon de arte con materiales ordenados por color",
        "Realiza busquedas del tesoro de objetos de un color",
        "Mezcla temperas para descubrir colores nuevos"
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
  
  // Generar recursos de capacitacion basados en las actividades del cronograma
  // Mueve una actividad al dia anterior o al siguiente.
  async function moverActividadDia(dia: string, idx: number, dir: -1 | 1) {
    const i = DIAS.indexOf(dia)
    const destino = DIAS[i + dir]
    if (!destino || !cronograma[dia] || !cronograma[destino]) return
    const act = cronograma[dia].actividades?.[idx]
    if (!act) return

    const origen = cronograma[dia].actividades.filter((_, n) => n !== idx)
    const dest = (cronograma[destino].actividades || []).filter((a) => (a.nombre || "").trim() !== "")
    const nuevo = {
      ...cronograma,
      [dia]: { ...cronograma[dia], actividades: origen.length ? origen : [{ nombre: "", capacidades: "", contenidos: "", objetivo: "", desarrollo: "", materiales: "" }] },
      [destino]: { ...cronograma[destino], actividades: [...dest, { ...act }] },
    }
    setCronograma(nuevo)
    try {
      const base = typeof window !== "undefined" ? window.location.origin : ""
      await fetch(`${base}/api/cronograma-maternal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala: salaActual, cronograma: nuevo }),
      })
    } catch (e) {
      console.error("[v0] Error moviendo la actividad:", e)
    }
  }

  // Marca una actividad como realizada. Un toque y listo: es lo que le dice a
  // ALBA que ese paso se trabajo y puede proponer el siguiente.
  async function marcarRealizada(dia: string, idx: number) {
    const nuevo = { ...cronograma }
    const acts = [...(nuevo[dia]?.actividades || [])]
    if (!acts[idx]) return
    acts[idx] = { ...acts[idx], realizada: true } as any
    nuevo[dia] = { ...nuevo[dia], actividades: acts }
    setCronograma(nuevo)
    try {
      const base = typeof window !== "undefined" ? window.location.origin : ""
      await fetch(`${base}/api/cronograma-maternal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala: salaActual, cronograma: nuevo }),
      })
    } catch (e) {
      console.error("[v0] Error marcando la actividad como realizada:", e)
    }
  }

  // Pide un consejo pedagogico situado. "otro" evita repetir los ya vistos.
  async function pedirCapacitacion(otro = false) {
    const primeraAct = DIAS.map((d) => cronograma[d]?.actividades?.find((a) => (a.nombre || "").trim()))
      .find((a) => a)?.nombre || ""
    setCargandoCap(true)
    try {
      const res = await fetch("/api/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "micro_capacitacion",
          sala: salaActual,
          proyecto: { titulo: proyecto.titulo || "" },
          actividad: primeraAct,
          evitar: otro ? capVistas : [],
        }),
      })
      const data = await res.json()
      if (data?.ok && data.capacitacion) {
        setCapacitacion(data.capacitacion)
        setCapVistas((prev) => [...prev, data.capacitacion.titulo].slice(-6))
      }
    } catch (e) {
      console.error("[v0] Error pidiendo capacitacion:", e)
    }
    setCargandoCap(false)
  }

  function generarRecursosCapacitacion() {
    const actividadesNombres: string[] = []
    DIAS.forEach(dia => {
      cronograma[dia]?.actividades?.forEach(act => {
        if (act.nombre) actividadesNombres.push(act.nombre.toLowerCase())
      })
    })
    
    if (actividadesNombres.length === 0) {
      setRecursosCapacitacion([])
      return
    }
    
    // Banco de recursos pedagogicos por tema/tipo de actividad
    const bancoPedagogico = [
      // Vigotsky
      { titulo: "Zona de Desarrollo Proximo (ZDP)", autor: "Lev Vigotsky", descripcion: "El aprendizaje ocurre en la brecha entre lo que el nino puede hacer solo y lo que puede lograr con ayuda. Ofrece andamiaje gradual.", tipo: "teoria", keywords: ["construir", "colabor", "juntos", "ayuda", "guia"] },
      { titulo: "El lenguaje como herramienta del pensamiento", autor: "Lev Vigotsky", descripcion: "Verbaliza en voz alta mientras modelas. El lenguaje guia y organiza el pensamiento infantil.", tipo: "teoria", keywords: ["nombr", "conversa", "lenguaje", "palabr", "canta"] },
      // Montessori
      { titulo: "Ambiente preparado", autor: "Maria Montessori", descripcion: "Todo al alcance del nino, ordenado y atractivo. El ambiente es el primer maestro.", tipo: "teoria", keywords: ["rincon", "sector", "explor", "material", "sensorial"] },
      { titulo: "Periodos sensibles", autor: "Maria Montessori", descripcion: "Respeta los intereses espontaneos del nino. Hay momentos optimos para cada tipo de aprendizaje.", tipo: "teoria", keywords: ["observ", "interes", "atencion", "concentra"] },
      { titulo: "Vida practica", autor: "Maria Montessori", descripcion: "Las actividades cotidianas desarrollan autonomia, concentracion y motricidad fina.", tipo: "teoria", keywords: ["trasvas", "verter", "cocin", "orden", "limpi"] },
      // Reggio Emilia
      { titulo: "Los 100 lenguajes del nino", autor: "Loris Malaguzzi", descripcion: "Ofrece multiples formas de expresion: dibujo, cuerpo, palabras, construccion, dramatizacion.", tipo: "teoria", keywords: ["expresi", "dibuj", "crea", "art", "dramatiz"] },
      { titulo: "Documentacion pedagogica", autor: "Reggio Emilia", descripcion: "Registra el proceso con fotos, frases de los ninos, producciones. Hace visible el aprendizaje.", tipo: "teoria", keywords: ["document", "foto", "registr", "proces"] },
      { titulo: "Provocaciones", autor: "Reggio Emilia", descripcion: "Materiales dispuestos de forma atractiva que invitan a explorar sin instrucciones directas.", tipo: "teoria", keywords: ["provocac", "invita", "dispon", "atractiv"] },
      // Perkins
      { titulo: "Ensenanza para la Comprension", autor: "David Perkins", descripcion: "Comienza con preguntas genuinas, conecta con conocimientos previos, haz visible el pensamiento.", tipo: "teoria", keywords: ["pregunt", "comprend", "piensa", "reflexion", "por que"] },
      // Piaget
      { titulo: "Estadio preoperacional", autor: "Jean Piaget", descripcion: "Los ninos de 2-7 anos aprenden a traves del juego simbolico, la imitacion y la exploracion sensorial.", tipo: "teoria", keywords: ["juego", "simbolic", "imita", "explor", "sensorial"] },
      // Pikler
      { titulo: "Movimiento libre", autor: "Emmi Pikler", descripcion: "Respeta el desarrollo motor autonomo. No forzar posturas ni movimientos que el nino no logra solo.", tipo: "teoria", keywords: ["movimient", "motor", "cuerpo", "gatear", "caminar", "trepar"] },
      // Gardner
      { titulo: "Inteligencias multiples", autor: "Howard Gardner", descripcion: "Existen diferentes formas de ser inteligente. Ofrece actividades que estimulen diversas inteligencias.", tipo: "teoria", keywords: ["musical", "corporal", "visual", "logica", "inteligenc"] },
    ]
    
    // Encontrar recursos relevantes segun las actividades
    const recursosRelevantes: typeof bancoPedagogico = []
    
    bancoPedagogico.forEach(recurso => {
      const esRelevante = recurso.keywords.some(keyword => 
        actividadesNombres.some(act => act.includes(keyword))
      )
      if (esRelevante && !recursosRelevantes.includes(recurso)) {
        recursosRelevantes.push(recurso)
      }
    })
    
    // Si no hay coincidencias, mostrar recursos generales
    if (recursosRelevantes.length === 0) {
      setRecursosCapacitacion([
        bancoPedagogico[0], // ZDP
        bancoPedagogico[2], // Ambiente preparado
        bancoPedagogico[5], // 100 lenguajes
      ])
    } else {
      setRecursosCapacitacion(recursosRelevantes.slice(0, 4))
    }
  }
  
  // Actualizar recursos cuando cambia el cronograma
  useEffect(() => {
    generarRecursosCapacitacion()
  }, [cronograma])
  
  // Generar sugerencias de ALBA basadas en el proyecto
  async function generarSugerenciasAlba() {
    // Sin proyecto cargado ALBA sugiere igual: el proyecto es contexto que
    // enriquece la sugerencia, no un requisito para pedirla.
    setGenerandoSugerencias(true)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    
    try {
      const res = await fetch(`${base}/api/brain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sugerir_actividades_semana",
          proyecto: {
            titulo: proyecto.titulo || "Alfabetizacion en el jardin maternal",
            objetivoGeneral: proyecto.objetivoGeneral || "Desarrollo del lenguaje y la comunicacion en situaciones cotidianas y de juego",
            duracion: proyecto.duracion || ""
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
    
    // Agregar la sugerencia marcada como de ALBA: asi queda FIJA en la vista
    // (se lee, no se edita) y se distingue de las que carga la maestra.
    nuevoCronograma[dia].actividades.push({
      ...sugerencia.actividad,
      origen: "alba",
      alfabetizacion: true,
      capacidadKey: (sugerencia.actividad as any).capacidadKey || "",
    } as any)

    // Si el dia tenia una actividad vacia de relleno, se saca
    nuevoCronograma[dia].actividades = nuevoCronograma[dia].actividades.filter(
      (a: any, i: number, arr: any[]) => (a?.nombre || "").trim() !== "" || arr.length === 1
    )
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
  
  // Abrir Mi Planificacion: carga el historial completo de la sala
  async function abrirPlanificacion() {
    setShowPlanificacion(true)
    setLoadingPlanificacion(true)
    setSemanaAbierta(null)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    try {
      const res = await fetch(`${base}/api/planificacion-maternal?sala=${encodeURIComponent(salaActual)}`, { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        if (data.ok) {
          setPlanificacion({ proyectos: data.proyectos || [], semanas: data.semanas || [] })
        }
      }
    } catch (e) {
      console.error("[v0] Error cargando planificacion:", e)
    }
    setLoadingPlanificacion(false)
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
    d?.intercambio || d?.actividades?.some(a => a.nombre)
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
          
          {/* Acciones del header */}
          <div className="flex items-center gap-2">
            <button
              onClick={abrirPlanificacion}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              <FolderClock className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">Mi Planificación</span>
            </button>

            {/* Selector de Sala (oculto en modo demo) */}
            <div className="relative">
              <button
                onClick={() => { if (!forzarSala) setShowSalaDropdown(!showSalaDropdown) }}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <span className="text-sm font-medium">{salaActual}</span>
                {!forzarSala && <ChevronDown className="w-4 h-4" />}
              </button>
              
              {showSalaDropdown && !forzarSala && (
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
                      <h2 className="font-bold text-slate-800 text-lg">Evaluar</h2>
                      <p className="text-xs text-blue-600">Como viene cada nino</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGestionSala(true)}
                    className="text-sm px-4 py-1.5 rounded-full bg-white text-blue-600 font-bold shadow-sm border border-blue-200 hover:bg-blue-50 transition-colors"
                    title="Cargar o editar los alumnos de la sala"
                  >
                    {alumnos.length} alumnos
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-sm text-slate-600 mb-3">
                    Ultimo registro:{" "}
                    {ultimoRegistro.dias === null ? (
                      <span className="font-semibold text-red-600">todavia sin registros</span>
                    ) : ultimoRegistro.dias > 15 ? (
                      <span className="font-semibold text-red-600">hace {ultimoRegistro.dias} dias</span>
                    ) : (
                      <span className="font-semibold text-slate-800">
                        {ultimoRegistro.dias === 0 ? "hoy" : `hace ${ultimoRegistro.dias} dias`}
                      </span>
                    )}
                  </p>
                  {resumenEval?.ultimo && (
                    <div className="mb-3 bg-white rounded-xl border border-blue-200 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">
                        {resumenEval.ultimo.capacidad}
                      </p>
                      <p className="text-sm font-semibold text-slate-800 leading-snug mt-0.5">
                        {resumenEval.ultimo.indicador}
                      </p>
                      <p className="text-sm text-slate-700 mt-2">
                        <span className="font-bold text-green-700">{resumenEval.ultimo.yaLoHacen}</span> ya lo hacen
                        {resumenEval.ultimo.empezando > 0 && <> · <span className="font-bold text-amber-600">{resumenEval.ultimo.empezando}</span> empezando</>}
                        {resumenEval.ultimo.acompanar > 0 && <> · <span className="font-bold text-red-600">{resumenEval.ultimo.acompanar}</span> acompanar</>}
                      </p>
                      {resumenEval.ultimo.necesitanAcompanamiento?.length > 0 && (
                        <p className="text-xs text-red-700 mt-1.5">
                          Necesitan acompanamiento: {resumenEval.ultimo.necesitanAcompanamiento.join(", ")}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={abrirEvaluar}
                      disabled={alumnos.length === 0}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-40"
                    >
                      Evaluar la sala
                    </button>
                    {resumenEval?.ultimo && (
                      <button
                        type="button"
                        onClick={() => setShowSintesis(true)}
                        className="px-4 py-2.5 rounded-xl border border-blue-300 text-blue-700 text-sm font-semibold hover:bg-blue-50 transition-colors"
                      >
                        Sintesis
                      </button>
                    )}
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
                    onClick={() => setShowCronogramaLectura(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-green-300 text-green-700 hover:bg-green-50 text-sm font-medium transition-colors"
                    title="Ver la semana completa"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCronogramaModal(true)}
                    className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-xl bg-white hover:bg-green-100 text-green-700 font-medium transition-colors shadow-sm border border-green-200"
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
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
                        
                        {/* Contenido del dia — tarjetas, como en jardin.
                            Verde si se hizo, rojo si el dia paso sin marcarla,
                            y el color de la capacidad si todavia no llego. */}
                        {cronograma[dia] && cronograma[dia].actividades?.some(a => a.nombre) ? (
                          <div className="space-y-1.5">
                            {cronograma[dia].intercambio && (
                              <p className="text-[10px] text-slate-500 truncate">{cronograma[dia].intercambio}</p>
                            )}
                            {cronograma[dia].actividades?.filter(a => a.nombre).map((act, i) => {
                              const cap = (act as any).capacidadKey || ""
                              const col = COLOR_CAPACIDAD[cap]
                              const hecha = (act as any).realizada === true
                              const vencida = !hecha && diaYaPaso(cronograma[dia].fecha)
                              const idxReal = cronograma[dia].actividades.findIndex((x) => x === act)
                              const iDia = DIAS.indexOf(dia)
                              return (
                                <div
                                  key={i}
                                  className="rounded-lg border-2 px-2 py-1.5"
                                  style={
                                    hecha
                                      ? { backgroundColor: "#dcfce7", borderColor: "#22c55e" }
                                      : vencida
                                      ? { backgroundColor: "#fee2e2", borderColor: "#f87171" }
                                      : col
                                      ? { backgroundColor: col.bg, borderColor: col.border }
                                      : { backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }
                                  }
                                >
                                  <div className="flex items-start gap-1">
                                    <div className="flex-1 min-w-0">
                                      {cap && (
                                        <p className="text-[9px] font-bold uppercase tracking-wide" style={{ color: hecha ? "#15803d" : vencida ? "#b91c1c" : col?.text }}>
                                          {NOMBRE_CAPACIDAD[cap] || cap}
                                        </p>
                                      )}
                                      <p className="text-[11px] font-semibold text-slate-800 leading-snug">{act.nombre}</p>
                                      {hecha && <p className="text-[9px] font-bold text-green-700 mt-0.5">Realizada</p>}
                                    </div>
                                    {!hecha && (
                                      <div className="flex flex-col gap-0.5 shrink-0">
                                        {iDia > 0 && (
                                          <button type="button" onClick={() => moverActividadDia(dia, idxReal, -1)} title="Al dia anterior"
                                            className="w-4 h-4 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 text-[9px] leading-none">‹</button>
                                        )}
                                        {iDia < DIAS.length - 1 && (
                                          <button type="button" onClick={() => moverActividadDia(dia, idxReal, 1)} title="Al dia siguiente"
                                            className="w-4 h-4 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 text-[9px] leading-none">›</button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
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
                  {capacitacion ? (
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded-xl border border-teal-200">
                        <h4 className="font-bold text-slate-800 text-base leading-snug">{capacitacion.titulo}</h4>
                        <p className="text-sm text-slate-700 leading-relaxed mt-1.5">{capacitacion.contenido}</p>
                        {capacitacion.tips?.length > 0 && (
                          <ul className="mt-2 space-y-0.5">
                            {capacitacion.tips.map((t, i) => (
                              <li key={i} className="text-xs text-slate-600">· {t}</li>
                            ))}
                          </ul>
                        )}
                        {capacitacion.autor && (
                          <p className="text-xs text-teal-700 font-medium mt-2.5 italic">{capacitacion.autor}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => pedirCapacitacion(true)}
                        disabled={cargandoCap}
                        className="w-full text-xs font-semibold py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-50"
                      >
                        {cargandoCap ? "Buscando..." : "Otro consejo"}
                      </button>
                    </div>
                  ) : recursosCapacitacion.length > 0 ? (
                    <div className="space-y-3">
                      {recursosCapacitacion.map((recurso, i) => (
                        <div key={i} className="bg-white p-3 rounded-xl border border-teal-100 hover:border-teal-300 transition-colors">
                          <div className="flex items-start gap-2">
                            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-4 h-4 text-teal-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-slate-800 text-sm">{recurso.titulo}</h4>
                              <p className="text-[10px] text-teal-600 font-medium">{recurso.autor}</p>
                              <p className="text-xs text-slate-600 mt-1 line-clamp-2">{recurso.descripcion}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
                        <FileText className="w-7 h-7 text-teal-400" />
                      </div>
                      <p className="text-slate-500 text-sm mb-3">Un consejo para dar mejor la actividad de esta semana</p>
                      <button
                        type="button"
                        onClick={() => pedirCapacitacion(false)}
                        disabled={cargandoCap}
                        className="text-xs font-semibold px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-50"
                      >
                        {cargandoCap ? "Buscando..." : "Pedir consejo"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        )}
      </main>
      
      {/* Modal Cronograma Semanal - TODA LA SEMANA VISIBLE */}
      {showCronogramaModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCronogramaModal(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl my-4" onClick={(e) => e.stopPropagation()}>
            {/* Header del modal */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-green-500 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Cronograma Semanal</h2>
              </div>
              <div className="flex items-center gap-2">
                {/* Boton ALBA sugiere - siempre visible */}
                <button
                  type="button"
                  onClick={generarSugerenciasAlba}
                  disabled={generandoSugerencias}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title={proyecto.titulo ? "ALBA sugiere actividades basadas en tu proyecto" : "Carga un proyecto primero"}
                >
                  {generandoSugerencias ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  ALBA sugiere
                </button>
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
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cerrar
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
                    {/* Intercambio: una sola vez, arriba */}
                    <input
                      type="text"
                      value={cronograma[dia]?.intercambio || ""}
                      onChange={(e) => actualizarCampo(dia, "intercambio", e.target.value)}
                      placeholder="Tema del dia"
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-300"
                    />

                    {/* Sugerencia de ALBA: la actividad completa, para aceptar o cambiar.
                        Al aceptar queda fija; si no la acepta, escribe la suya abajo. */}
                    {sugerenciasAlba.find(s => s.dia === dia) && (() => {
                      const sug = sugerenciasAlba.find(s => s.dia === dia)!
                      return (
                        <div className="bg-violet-50 border-2 border-violet-300 rounded-xl p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                            <span className="text-[11px] font-bold uppercase tracking-wide text-violet-700">ALBA sugiere</span>
                          </div>

                          <p className="text-sm font-bold text-slate-800 leading-snug mb-1.5">
                            {sug.actividad.nombre}
                          </p>

                          {sug.actividad.desarrollo && (
                            <p className="text-xs text-slate-700 leading-relaxed mb-2 whitespace-pre-line">
                              {sug.actividad.desarrollo}
                            </p>
                          )}

                          {sug.actividad.capacidades && (
                            <p className="text-xs bg-white border border-violet-300 rounded-lg px-2 py-1.5 mb-2.5">
                              <span className="font-bold text-violet-700">Mira si: </span>
                              <span className="text-slate-800">{sug.actividad.capacidades}</span>
                            </p>
                          )}

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => aceptarSugerenciaAlba(dia)}
                              className="flex-1 text-xs font-semibold py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                            >
                              Aceptar
                            </button>
                            <button
                              type="button"
                              onClick={() => rechazarSugerenciaAlba(dia)}
                              className="flex-1 text-xs font-semibold py-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                              Cambiar
                            </button>
                          </div>
                        </div>
                      )
                    })()}

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
                      
                      {cronograma[dia]?.actividades?.map((act, idx) => {
                        // Una actividad de ALBA ya aceptada queda FIJA: se lee, no se edita.
                        // Si no le sirve, la borra con la cruz y escribe la suya.
                        const esDeAlba = (act as any).origen === "alba" && (act.nombre || "").trim() !== ""
                        if (esDeAlba) {
                          return (
                            <div key={idx} className={`rounded-xl p-3 border-2 ${(act as any).realizada ? "bg-green-100 border-green-500" : "bg-white border-green-300"}`}>
                              <div className="flex items-start justify-between gap-2 mb-1.5">
                                <p className="text-sm font-bold text-slate-800 leading-snug">{act.nombre}</p>
                                <button
                                  type="button"
                                  onClick={() => eliminarActividad(dia, idx)}
                                  className="text-slate-300 hover:text-red-500 shrink-0"
                                  title="Quitar"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              {act.desarrollo && (
                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-2">{act.desarrollo}</p>
                              )}
                              {act.capacidades && (
                                <p className="text-xs bg-violet-50 border border-violet-300 rounded-lg px-2 py-1.5">
                                  <span className="font-bold text-violet-700">Mira si: </span>
                                  <span className="text-slate-800">{act.capacidades}</span>
                                </p>
                              )}
                              {(act as any).realizada ? (
                                <p className="mt-2 text-xs font-bold text-green-700 flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> Realizada
                                </p>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => marcarRealizada(dia, idx)}
                                  className="mt-2 w-full text-xs font-semibold py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                                >
                                  Marcar como realizada
                                </button>
                              )}
                            </div>
                          )
                        }

                        return (
                          <div key={idx} className="bg-white border border-slate-200 rounded-xl p-2.5 space-y-2">
                            <div className="flex items-center justify-end">
                              {cronograma[dia].actividades.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => eliminarActividad(dia, idx)}
                                  className="text-slate-300 hover:text-red-500"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <input
                              type="text"
                              value={act.nombre}
                              onChange={(e) => actualizarActividad(dia, idx, "nombre", e.target.value)}
                              placeholder="Nombre de la actividad"
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-300 font-medium"
                            />
                            <textarea
                              value={act.desarrollo}
                              onChange={(e) => actualizarActividad(dia, idx, "desarrollo", e.target.value)}
                              placeholder="Que van a hacer los ninos"
                              className="w-full text-xs p-2 border border-slate-200 rounded-lg resize-none h-16 focus:outline-none focus:ring-1 focus:ring-green-300"
                            />
                          </div>
                        )
                      })}
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
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowProyectoModal(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-amber-500 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Proyecto / Unidad Didactica</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowProyectoModal(false)}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
              >
                <X className="w-4 h-4" />
                Cerrar
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
                          {act.capacidades && (
                            <p className="text-[10px] text-violet-700 bg-violet-50 border border-violet-200 rounded px-1.5 py-1 mt-1">
                              <span className="font-bold">Mira si:</span> {act.capacidades}
                            </p>
                          )}
                          {act.desarrollo && <p className="text-[10px] text-slate-600"><span className="font-semibold">Desarrollo:</span> {act.desarrollo}</p>}
                          {act.materiales && <p className="text-[10px] text-slate-600"><span className="font-semibold">Materiales:</span> {act.materiales}</p>}
                        </div>
                      ))}
                      
                      {!cronograma[dia]?.actividades?.some(a => a.nombre) && clasesEspeciales.filter(c => c.dia === dia).length === 0 && (
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
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowProyectoLectura(false) }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-400 to-orange-500 flex-shrink-0">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Proyecto - {salaActual}</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowProyectoLectura(false)}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
                Cerrar
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
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
            <div className="px-6 py-4 border-t border-slate-200 flex justify-end flex-shrink-0">
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
      {/* Modal Mi Planificacion: historial completo (proyectos + semanas) */}
      {showPlanificacion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] overflow-hidden flex flex-col">
            {/* Header del modal */}
            <div className="bg-[#1e3a5f] text-white px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  <FolderClock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">Mi Planificación</h2>
                  <p className="text-xs text-white/70">{salaActual} — Historial de proyectos y actividades</p>
                </div>
              </div>
              <button onClick={() => setShowPlanificacion(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {loadingPlanificacion ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* PROYECTOS */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-800">Proyectos</h3>
                      <span className="text-xs text-slate-400">({planificacion?.proyectos.length || 0})</span>
                    </div>
                    {(planificacion?.proyectos.length || 0) === 0 ? (
                      <p className="text-sm text-slate-400 italic">Todavía no hay proyectos cargados.</p>
                    ) : (
                      <div className="space-y-2">
                        {planificacion?.proyectos.map((p: any) => (
                          <div key={p.id} className="border border-slate-200 rounded-xl p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-800">{p.titulo || "Sin título"}</p>
                              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.estado === "activo" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                                {p.estado === "activo" ? "Activo" : "Finalizado"}
                              </span>
                            </div>
                            {p.objetivoGeneral && <p className="text-xs text-slate-600 mt-1">{p.objetivoGeneral}</p>}
                            {p.duracion && <p className="text-[11px] text-slate-400 mt-1">Duración: {p.duracion}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* SEMANAS CON ACTIVIDADES */}
                  <section>
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold text-slate-800">Cronogramas y actividades realizadas</h3>
                      <span className="text-xs text-slate-400">({planificacion?.semanas.length || 0})</span>
                    </div>
                    {(planificacion?.semanas.length || 0) === 0 ? (
                      <p className="text-sm text-slate-400 italic">Todavía no hay actividades guardadas.</p>
                    ) : (
                      <div className="space-y-2">
                        {planificacion?.semanas.map((sem: any) => {
                          const abierta = semanaAbierta === sem.semana_inicio
                          return (
                            <div key={sem.semana_inicio} className="border border-slate-200 rounded-xl overflow-hidden">
                              <button
                                onClick={() => setSemanaAbierta(abierta ? null : sem.semana_inicio)}
                                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                              >
                                <div className="flex items-center gap-2">
                                  {abierta ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                                  <span className="text-sm font-semibold text-slate-800">Semana del {formatearFecha(sem.semana_inicio)}</span>
                                  {sem.finalizada && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">Finalizada</span>}
                                </div>
                                <span className="text-xs text-slate-400">{sem.totalActividades} actividad{sem.totalActividades === 1 ? "" : "es"}</span>
                              </button>

                              {abierta && (
                                <div className="p-3 space-y-3">
                                  {DIAS.map((dia) => {
                                    const d = sem.dias[dia]
                                    if (!d) return null
                                    const acts = (d.actividades || []).filter((a: any) => (a?.nombre || "").trim().length > 0)
                                    const tieneAlgo = acts.length > 0 || d.recibimiento || d.intercambio
                                    if (!tieneAlgo) return null
                                    return (
                                      <div key={dia} className="border-l-2 border-blue-200 pl-3">
                                        <p className="text-xs font-bold text-slate-700">{dia} <span className="font-normal text-slate-400">{formatearFecha(d.fecha)}</span></p>
                                        {d.recibimiento && <p className="text-xs text-slate-600 mt-1"><span className="font-medium">Recibimiento:</span> {d.recibimiento}</p>}
                                        {d.intercambio && <p className="text-xs text-slate-600"><span className="font-medium">Intercambio:</span> {d.intercambio}</p>}
                                        {acts.map((a: any, i: number) => (
                                          <div key={i} className="mt-1.5 bg-slate-50 rounded-lg p-2">
                                            <p className="text-xs font-semibold text-slate-800">{a.nombre}</p>
                                            {a.objetivo && <p className="text-[11px] text-slate-600 mt-0.5"><span className="font-medium">Objetivo:</span> {a.objetivo}</p>}
                                            {a.desarrollo && <p className="text-[11px] text-slate-600"><span className="font-medium">Desarrollo:</span> {a.desarrollo}</p>}
                                            {a.materiales && <p className="text-[11px] text-slate-500"><span className="font-medium">Materiales:</span> {a.materiales}</p>}
                                          </div>
                                        ))}
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Sintesis de la sala: las cinco capacidades y la trayectoria ── */}
      {showSintesis && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSintesis(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: "#1e40af" }}>
              <div>
                <p className="text-white font-bold text-base leading-none">Como viene la sala</p>
                <p className="text-white/70 text-xs mt-1">{salaActual} — {alumnos.length} alumnos</p>
              </div>
              <button type="button" onClick={() => setShowSintesis(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {/* Las cinco capacidades */}
              {(resumenEval?.porCapacidad || []).map((c: any) => (
                <div key={c.key} className={`rounded-xl border-2 p-3 ${!c.evaluada ? "border-slate-200 bg-slate-50" : c.acompanar > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800">{c.nombre}</p>
                    <span className="text-[11px] text-slate-500">
                      {c.indicadoresTrabajados} de {c.totalIndicadores} miradas
                    </span>
                  </div>
                  {c.evaluada ? (
                    <>
                      <p className="text-xs text-slate-600 mt-0.5">{c.indicador}</p>
                      <p className="text-sm text-slate-700 mt-1.5">
                        <span className="font-bold text-green-700">{c.yaLoHacen}</span> ya lo hacen
                        {c.empezando > 0 && <> · <span className="font-bold text-amber-600">{c.empezando}</span> empezando</>}
                        {c.acompanar > 0 && <> · <span className="font-bold text-red-600">{c.acompanar}</span> acompanar</>}
                      </p>
                      {c.necesitanAcompanamiento?.length > 0 && (
                        <p className="text-xs text-red-700 mt-1">{c.necesitanAcompanamiento.join(", ")}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 mt-1">Todavia sin evaluar</p>
                  )}
                </div>
              ))}

              {/* Trayectoria de cada chico */}
              {(resumenEval?.porAlumno || []).length > 0 && (
                <div className="pt-2">
                  <p className="text-sm font-bold text-slate-800 mb-2">Cada nino</p>
                  <div className="space-y-1">
                    {resumenEval.porAlumno.map((a: any) => (
                      <div key={a.id} className="flex items-center gap-2 py-1.5 border-b border-slate-100">
                        <span className="flex-1 text-sm text-slate-800">{a.nombre}</span>
                        {a.acompanar > 0 && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                            {a.acompanar} acompanar
                          </span>
                        )}
                        {a.empezando > 0 && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            {a.empezando} empezando
                          </span>
                        )}
                        {a.acompanar === 0 && a.empezando === 0 && (
                          <span className="text-[11px] text-green-700">viene bien</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Gestionar sala: cargar y borrar alumnos ─────────────────── */}
      {showGestionSala && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowGestionSala(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Gestionar Sala</h2>
                <p className="text-sm text-slate-500">Sala {salaActual} — {alumnos.length} alumnos</p>
              </div>
              <button
                type="button"
                onClick={() => setShowGestionSala(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cargar lista completa (un nombre por linea)
              </label>
              <textarea
                value={bulkNames}
                onChange={(e) => setBulkNames(e.target.value)}
                placeholder={"Sofia Garcia\nMartin Lopez\nLucia Fernandez"}
                className="w-full h-32 p-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-blue-400 resize-none"
              />
              <button
                type="button"
                onClick={cargarListaAlumnos}
                disabled={cargandoAlumnos || !bulkNames.trim()}
                className="w-full mt-2 py-2.5 text-white rounded-xl font-medium disabled:opacity-50 text-sm bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                {cargandoAlumnos ? "Guardando..." : `Cargar Alumnos (${bulkNames.split("\n").filter((n) => n.trim()).length})`}
              </button>

              {alumnos.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-sm font-medium text-slate-700 mb-2">Alumnos de la sala</p>
                  <ul className="space-y-1">
                    {alumnos.map((al: any) => (
                      <li key={al.id} className="flex items-center justify-between text-sm text-slate-700 py-1.5 border-b border-slate-50">
                        <span>{al.nombre}</span>
                        <button
                          type="button"
                          onClick={() => borrarAlumno(al.id)}
                          className="text-slate-300 hover:text-red-500"
                          title="Quitar"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Ventana de evaluacion ────────────────────────────────────────
          Una capacidad por vez. La docente marca SOLO a los que se apartan;
          el resto queda en "ya lo hace" sin tocar nada. */}
      {showEvaluar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowEvaluar(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>

            <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: "#1e40af" }}>
              <div>
                <p className="text-white/70 text-[11px] font-semibold uppercase tracking-wide">
                  {datosEval?.capacidadSugerida?.nombre || "Evaluar"}
                </p>
                <p className="text-white font-bold text-base leading-snug mt-0.5">
                  {datosEval?.indicador || ""}
                </p>
              </div>
              <button type="button" onClick={() => setShowEvaluar(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
              <p className="text-xs text-slate-600">
                Marca solo los que estan empezando o necesitan acompanamiento.
                El resto queda en <span className="font-semibold">ya lo hace</span>.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-2">
              {(datosEval?.alumnos || []).map((al: any) => {
                const estado = marcados[al.id]
                return (
                  <div key={al.id} className="flex items-center gap-2 py-2 border-b border-slate-100">
                    <span className="flex-1 text-sm text-slate-800">{al.nombre}</span>
                    <button
                      type="button"
                      onClick={() => setMarcados((p) => {
                        const n = { ...p }
                        if (n[al.id] === "empezando") delete n[al.id]
                        else n[al.id] = "empezando"
                        return n
                      })}
                      className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors"
                      style={estado === "empezando"
                        ? { backgroundColor: "#fef3c7", borderColor: "#f59e0b", color: "#92400e" }
                        : { backgroundColor: "#fff", borderColor: "#e2e8f0", color: "#64748b" }}
                    >
                      Empezando
                    </button>
                    <button
                      type="button"
                      onClick={() => setMarcados((p) => {
                        const n = { ...p }
                        if (n[al.id] === "acompanar") delete n[al.id]
                        else n[al.id] = "acompanar"
                        return n
                      })}
                      className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border transition-colors"
                      style={estado === "acompanar"
                        ? { backgroundColor: "#fee2e2", borderColor: "#ef4444", color: "#991b1b" }
                        : { backgroundColor: "#fff", borderColor: "#e2e8f0", color: "#64748b" }}
                    >
                      Acompanar
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="px-5 py-3 border-t border-slate-200 flex items-center justify-between gap-3">
              {/* Hasta que no se guarda no se afirma que el resto "ya lo hace":
                  todavia no hay evaluacion. Solo se cuenta lo que ella marco. */}
              <p className="text-[11px] text-slate-500">
                {Object.keys(marcados).length === 0
                  ? "Marca solo los que se apartan"
                  : [
                      Object.values(marcados).filter((v) => v === "empezando").length > 0
                        ? `${Object.values(marcados).filter((v) => v === "empezando").length} empezando`
                        : "",
                      Object.values(marcados).filter((v) => v === "acompanar").length > 0
                        ? `${Object.values(marcados).filter((v) => v === "acompanar").length} acompanar`
                        : "",
                      `${(datosEval?.alumnos?.length || 0) - Object.keys(marcados).length} sin marcar`,
                    ].filter(Boolean).join(" · ")}
              </p>
              <button
                type="button"
                onClick={guardarEvaluacion}
                disabled={guardandoEval}
                className="px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-semibold disabled:opacity-50"
              >
                {guardandoEval ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
