"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, User, Lightbulb, Clock, TrendingUp, TrendingDown, Minus, BookOpen, MessageCircle, Music, ChevronDown, ChevronRight, Printer, Target } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StudentProfileProps {
  alumnoId: string
  alumnoNombre?: string
  progressData?: Record<string, { porcentaje: number; actividades: Array<{ semana: number; resultado: string }> }>
  onBack: () => void
}

interface Alumno {
  id: string
  nombre: string
  apellido: string
}

interface ActividadEvaluada {
  semana: number
  titulo: string
  fecha: string
  resultado: "green" | "yellow" | "red" | "blue"
  promedio: number
}

interface ProgresoEje {
  logradas: number[]
  porcentaje: number
  actividades: ActividadEvaluada[]
  tendencia: "mejorando" | "estable" | "bajando"
  semanaActual: number
}

const EJES = [
  { key: "CF", label: "Conciencia Fonologica", icon: Music, color: "#3b82f6", bgColor: "#eff6ff" },
  { key: "CT", label: "Comprension de Textos", icon: BookOpen, color: "#10b981", bgColor: "#ecfdf5" },
  { key: "O", label: "Oralidad", icon: MessageCircle, color: "#f59e0b", bgColor: "#fffbeb" },
]

// Secuencia ALBA resumida para mapeo
const SECUENCIA_ALBA: Record<string, { semana: number; titulo: string }[]> = {
  CF: [
    { semana: 1, titulo: "Sonidos del entorno" },
    { semana: 2, titulo: "Rimas y canciones" },
    { semana: 3, titulo: "Segmentacion silabica" },
    { semana: 4, titulo: "Sonido inicial /a/" },
    { semana: 5, titulo: "Sonido inicial /e/" },
    { semana: 6, titulo: "Sonido inicial /i/" },
    { semana: 7, titulo: "Sonido inicial /o/" },
    { semana: 8, titulo: "Sonido inicial /u/" },
    { semana: 9, titulo: "Vocales - Repaso" },
    { semana: 10, titulo: "Sonido inicial /m/" },
    { semana: 11, titulo: "Sonido inicial /p/" },
    { semana: 12, titulo: "Sonido inicial /s/" },
    { semana: 13, titulo: "Sonido inicial /l/" },
    { semana: 14, titulo: "Sonido inicial /t/" },
    { semana: 15, titulo: "Sonido inicial /n/" },
    { semana: 16, titulo: "Consonantes - Repaso" },
    { semana: 17, titulo: "Sonido final" },
    { semana: 18, titulo: "Sonidos medios" },
    { semana: 19, titulo: "Sintesis de fonemas" },
    { semana: 20, titulo: "Analisis de fonemas" },
    { semana: 21, titulo: "Sustitucion de fonemas" },
    { semana: 22, titulo: "Omision de fonemas" },
    { semana: 23, titulo: "Adicion de fonemas" },
    { semana: 24, titulo: "Manipulacion avanzada" },
    { semana: 25, titulo: "Evaluacion CF" },
  ],
  CT: [
    { semana: 1, titulo: "LD: Exploracion del libro" },
    { semana: 2, titulo: "LD: Predicciones" },
    { semana: 3, titulo: "LD: Pausas dialogicas" },
    { semana: 4, titulo: "LD: Vocabulario en contexto" },
    { semana: 5, titulo: "LD: Recontar" },
    { semana: 6, titulo: "LD: Conexiones" },
    { semana: 7, titulo: "LD: Ciclo completo I" },
    { semana: 8, titulo: "LD: Ciclo completo II" },
    { semana: 9, titulo: "Cruz: QUIEN" },
    { semana: 10, titulo: "Cruz: QUE" },
    { semana: 11, titulo: "Cruz: DONDE" },
    { semana: 12, titulo: "Cruz: CUANDO" },
    { semana: 13, titulo: "Cruz: Integracion literal" },
    { semana: 14, titulo: "Cruz: POR QUE" },
    { semana: 15, titulo: "Cruz: COMO" },
    { semana: 16, titulo: "Cruz: PARA QUE" },
    { semana: 17, titulo: "Cruz: QUE PASARIA SI" },
    { semana: 18, titulo: "Cruz: Integracion inferencial" },
    { semana: 19, titulo: "Cruz: QUE OPINAS" },
    { semana: 20, titulo: "Cruz: ESTA BIEN O MAL" },
    { semana: 21, titulo: "Cruz: QUE HARIAS TU" },
    { semana: 22, titulo: "Cruz: Integracion critica" },
    { semana: 23, titulo: "Integracion: LD + Cruz Literal" },
    { semana: 24, titulo: "Integracion: LD + Cruz Completa" },
    { semana: 25, titulo: "Evaluacion CT" },
  ],
  O: [
    { semana: 1, titulo: "ECO-E: Escucha de sonidos" },
    { semana: 2, titulo: "ECO-E: Escucha de voces" },
    { semana: 3, titulo: "ECO-E: Instrucciones simples" },
    { semana: 4, titulo: "ECO-E: Instrucciones complejas" },
    { semana: 5, titulo: "ECO-E: Cuentos cortos" },
    { semana: 6, titulo: "ECO-E: Cuentos largos" },
    { semana: 7, titulo: "ECO-E: Escucha selectiva" },
    { semana: 8, titulo: "ECO-E: Escucha critica" },
    { semana: 9, titulo: "ECO-C: Vocabulario receptivo I" },
    { semana: 10, titulo: "ECO-C: Vocabulario receptivo II" },
    { semana: 11, titulo: "ECO-C: Comprension literal" },
    { semana: 12, titulo: "ECO-C: Comprension inferencial" },
    { semana: 13, titulo: "ECO-C: Secuencia temporal" },
    { semana: 14, titulo: "ECO-C: Causa y efecto" },
    { semana: 15, titulo: "ECO-C: Idea principal" },
    { semana: 16, titulo: "ECO-C: Detalles de apoyo" },
    { semana: 17, titulo: "ECO-O: Nombrar y etiquetar" },
    { semana: 18, titulo: "ECO-O: Describir con estructura" },
    { semana: 19, titulo: "ECO-O: Narrar con secuencia" },
    { semana: 20, titulo: "ECO-O: Explicar procesos" },
    { semana: 21, titulo: "ECO-O: Argumentar simple" },
    { semana: 22, titulo: "ECO-O: Dialogar con turnos" },
    { semana: 23, titulo: "ECO-O: Exponer oralmente" },
    { semana: 24, titulo: "ECO-O: Recontar elaborado" },
    { semana: 25, titulo: "Evaluacion ECO" },
  ],
}

// Nivel segun porcentaje
function getNivel(porcentaje: number): { texto: string; color: string; bg: string } {
  if (porcentaje >= 70) return { texto: "Avanzado", color: "#10b981", bg: "#ecfdf5" }
  if (porcentaje >= 40) return { texto: "En Proceso", color: "#f59e0b", bg: "#fffbeb" }
  return { texto: "Necesita Apoyo", color: "#ef4444", bg: "#fef2f2" }
}

// Sugerencias inteligentes basadas en el patron de evaluaciones
function getSugerenciaInteligente(
  eje: string, 
  actividades: Array<{ semana: number; resultado: string }>, 
  porcentaje: number
): { sugerencia: string; urgencia: "alta" | "media" | "baja" } {
  const verdes = actividades.filter(a => a.resultado === "green").length
  const amarillos = actividades.filter(a => a.resultado === "yellow").length
  const rojos = actividades.filter(a => a.resultado === "red").length
  const total = actividades.length
  
  // Patron: mayoria rojos = urgencia alta
  if (rojos >= 2 || (total > 0 && rojos / total > 0.5)) {
    const sugerencias: Record<string, string> = {
      CF: `ATENCION: ${rojos} actividades en rojo. Reforzar con juegos de rimas y palmadas. Reducir complejidad y aumentar repeticion. Trabajo individual 10 min diarios.`,
      CT: `ATENCION: ${rojos} actividades en rojo. Volver a lectura dialogica basica con pausas frecuentes. Usar cuentos mas cortos y preguntas literales (Quien, Que, Donde).`,
      O: `ATENCION: ${rojos} actividades en rojo. Practicar escucha activa con instrucciones de un paso. Ampliar vocabulario con objetos concretos. Evitar presion verbal.`
    }
    return { sugerencia: sugerencias[eje] || "Requiere refuerzo individual urgente.", urgencia: "alta" }
  }
  
  // Patron: mayoria amarillos = en proceso, necesita consolidar
  if (amarillos >= 2 || (total > 0 && amarillos / total > 0.4)) {
    const sugerencias: Record<string, string> = {
      CF: `En proceso: ${amarillos} actividades en amarillo. Consolidar con mas practica de sonidos iniciales. Usar material concreto (letras moviles) y juegos de memoria fonologica.`,
      CT: `En proceso: ${amarillos} actividades en amarillo. Reforzar preguntas inferenciales (Por que, Como). Conectar historias con experiencias personales del nino.`,
      O: `En proceso: ${amarillos} actividades en amarillo. Practicar narracion usando secuenciadores (primero, despues, al final). Modelar descripciones estructuradas.`
    }
    return { sugerencia: sugerencias[eje] || "Continuar practicando para consolidar.", urgencia: "media" }
  }
  
  // Patron: mayoria verdes = avanzado
  if (verdes >= 2 || porcentaje >= 70) {
    const sugerencias: Record<string, string> = {
      CF: `Excelente: ${verdes} actividades logradas. Avanzar a manipulacion de fonemas (sustitucion, omision). Introducir sintesis de palabras mas largas.`,
      CT: `Excelente: ${verdes} actividades logradas. Desarrollar pensamiento critico con preguntas de opinion. Integrar Cruz de Comprension completa.`,
      O: `Excelente: ${verdes} actividades logradas. Fomentar exposicion oral y argumentacion simple. Participar en dialogos con turnos extendidos.`
    }
    return { sugerencia: sugerencias[eje] || "Continuar desafiando con actividades mas complejas.", urgencia: "baja" }
  }
  
  // Sin evaluaciones o pocas
  const sugerencias: Record<string, string> = {
    CF: "Comenzar con identificacion de rimas y segmentacion silabica. Observar respuesta inicial.",
    CT: "Iniciar con lectura dialogica y preguntas literales basicas. Evaluar nivel de comprension.",
    O: "Evaluar escucha activa con instrucciones simples. Observar vocabulario receptivo."
  }
  return { sugerencia: sugerencias[eje] || "Realizar evaluacion inicial.", urgencia: "media" }
}

// Sugerencias por eje y nivel (fallback)
const SUGERENCIAS: Record<string, Record<string, string>> = {
  CF: {
    "Necesita Apoyo": "Reforzar con juegos de rimas y canciones. Practicar segmentacion silabica con palmadas.",
    "En Proceso": "Continuar con identificacion de sonidos iniciales. Juegos de veo-veo fonologico.",
    "Avanzado": "Avanzar a manipulacion de fonemas. Sintesis y analisis de palabras cortas.",
  },
  CT: {
    "Necesita Apoyo": "Practicar lectura dialogica con mas pausas. Enfocarse en preguntas literales (Quien, Que).",
    "En Proceso": "Trabajar preguntas inferenciales (Por que, Como). Conectar con experiencias personales.",
    "Avanzado": "Desarrollar pensamiento critico. Integrar lectura dialogica con Cruz de Comprension completa.",
  },
  O: {
    "Necesita Apoyo": "Fortalecer escucha activa con instrucciones simples. Ampliar vocabulario receptivo.",
    "En Proceso": "Practicar narracion con secuenciadores. Describir usando marcos estructurados.",
    "Avanzado": "Desarrollar argumentacion y exposicion oral. Participar en dialogos complejos.",
  },
}

// Mensajes para la familia segun nivel y eje
const MENSAJES_DOCENTE: Record<string, Record<string, { titulo: string; mensaje: string; actividades: string[] }>> = {
  CF: {
    "Necesita Apoyo": {
      titulo: "Conciencia Fonologica: requiere refuerzo",
      mensaje: "El alumno esta iniciando el trabajo con los sonidos del lenguaje. Conviene reforzar con actividades ludicas y frecuentes en la sala.",
      actividades: [
        "Trabajar rimas y canciones con apoyo de palmas",
        "Juegos de sonido inicial con objetos concretos",
        "Segmentar silabas de nombres con aplausos",
        "Repetir secuencias sonoras cortas de forma diaria",
      ],
    },
    "En Proceso": {
      titulo: "Conciencia Fonologica: en desarrollo",
      mensaje: "El alumno reconoce sonidos con creciente autonomia. Consolidar con practica sistematica en la sala.",
      actividades: [
        "'Veo veo' con sonidos iniciales",
        "Clasificar palabras largas y cortas por silabas",
        "Identificar objetos por su sonido inicial",
        "Juegos de memoria fonologica con material concreto",
      ],
    },
    "Avanzado": {
      titulo: "Conciencia Fonologica: buen dominio",
      mensaje: "El alumno muestra buen dominio segun la evidencia registrada. Proponer actividades de mayor complejidad.",
      actividades: [
        "Manipulacion de fonemas (sustitucion y omision)",
        "Sintesis de palabras mas largas",
        "Adivinanzas basadas en sonidos",
        "Creacion de trabalenguas en grupo",
      ],
    },
  },
  CT: {
    "Necesita Apoyo": {
      titulo: "Comprension de Textos: requiere refuerzo",
      mensaje: "El alumno esta iniciando la comprension de historias. Priorizar lectura dialogica con preguntas literales.",
      actividades: [
        "Lectura de cuentos cortos con preguntas Quien/Que/Donde",
        "Anticipacion a partir de las imagenes",
        "Pausas para recuperar lo sucedido en el relato",
        "Relectura de textos conocidos",
      ],
    },
    "En Proceso": {
      titulo: "Comprension de Textos: en desarrollo",
      mensaje: "El alumno comprende historias basicas y esta listo para profundizar. Incorporar preguntas inferenciales.",
      actividades: [
        "Preguntas de inferencia (Por que, Como)",
        "Conexion del texto con experiencias del grupo",
        "Renarracion del cuento por parte del alumno",
        "Anticipacion de finales alternativos",
      ],
    },
    "Avanzado": {
      titulo: "Comprension de Textos: destacado",
      mensaje: "El alumno evidencia buena comprension lectora. Avanzar hacia textos mas complejos y pensamiento critico.",
      actividades: [
        "Lectura de textos mas extensos por partes",
        "Preguntas de opinion y valoracion del personaje",
        "Comparacion de versiones de un mismo cuento",
        "Produccion de historias propias",
      ],
    },
  },
  O: {
    "Necesita Apoyo": {
      titulo: "Oralidad: requiere refuerzo",
      mensaje: "El alumno esta desarrollando su expresion verbal. Generar situaciones frecuentes de intercambio oral en la sala.",
      actividades: [
        "Rondas de intercambio sobre experiencias cotidianas",
        "Descripcion de objetos y sus caracteristicas",
        "Canciones y rimas de repeticion",
        "Escucha activa con consignas de un paso",
      ],
    },
    "En Proceso": {
      titulo: "Oralidad: en desarrollo",
      mensaje: "El alumno se expresa cada vez mejor. Ampliar situaciones de habla estructurada.",
      actividades: [
        "Narracion con secuenciadores (primero, despues, al final)",
        "Juegos de descripcion para adivinar",
        "Preguntas abiertas que requieran explicacion",
        "Construccion colectiva de relatos por turnos",
      ],
    },
    "Avanzado": {
      titulo: "Oralidad: destacado",
      mensaje: "El alumno evidencia buenas habilidades de comunicacion oral. Proponer instancias de argumentacion y exposicion.",
      actividades: [
        "Argumentacion sobre temas simples con turnos de habla",
        "Explicacion de procesos (una receta, un juego)",
        "Produccion de audiocuentos",
        "Breves exposiciones sobre temas de interes",
      ],
    },
  },
}
export default function StudentProfile({ alumnoId, alumnoNombre, progressData, onBack }: StudentProfileProps) {
  const [loading, setLoading] = useState(true)
  const [alumno, setAlumno] = useState<Alumno | null>(
    alumnoNombre ? { id: alumnoId, nombre: alumnoNombre, apellido: "" } : null
  )
  const [progreso, setProgreso] = useState<Record<string, ProgresoEje>>({})
  const [vistaActiva, setVistaActiva] = useState<"progreso" | "sintesis">("progreso")

  // Fetch datos del alumno desde Supabase
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const res = await fetch(`/api/progreso/${alumnoId}`)
        const data = await res.json()
        
        if (data.ok && data.progreso) {
          setProgreso(data.progreso)
          // Solo actualizar alumno si el API devuelve nombre real, sino mantener alumnoNombre del prop
          if (data.alumno && data.alumno.nombre && data.alumno.nombre !== "Alumno") {
            setAlumno(data.alumno)
          }
        } else if (progressData) {
          // Usar datos del padre directamente con actividades reales
          const progresoFromParent: Record<string, ProgresoEje> = {}
          for (const eje of ["CF", "CT", "O"]) {
            const ejeData = progressData[eje]
            progresoFromParent[eje] = {
              logradas: [],
              porcentaje: ejeData?.porcentaje ?? 0,
              actividades: (ejeData?.actividades || []).map((a, idx) => ({
                semana: a.semana || idx + 1,
                titulo: "",
                fecha: "",
                resultado: a.resultado as "green" | "yellow" | "red",
                promedio: 0
              })),
              tendencia: "estable",
              semanaActual: (ejeData?.actividades?.length || 0) + 1
            }
          }
          setProgreso(progresoFromParent)
        }
      } catch (err) {
        console.error("Error fetching student profile:", err)
        // Fallback
        if (progressData) {
          const progresoFromParent: Record<string, ProgresoEje> = {}
          for (const eje of ["CF", "CT", "O"]) {
            const ejeData = progressData[eje]
            progresoFromParent[eje] = {
              logradas: [],
              porcentaje: ejeData?.porcentaje ?? 0,
              actividades: (ejeData?.actividades || []).map((a, idx) => ({
                semana: a.semana || idx + 1,
                titulo: "",
                fecha: "",
                resultado: a.resultado as "green" | "yellow" | "red",
                promedio: 0
              })),
              tendencia: "estable",
              semanaActual: (ejeData?.actividades?.length || 0) + 1
            }
          }
          setProgreso(progresoFromParent)
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [alumnoId, progressData])

  // Calcular sintesis cuatrimestral
  // MIN_EVIDENCIA: minimo de actividades evaluadas en un eje para dar un veredicto
  // confiable. Con menos, no se afirma fortaleza/area de mejora (evita decir
  // "excelente" con 1 sola actividad).
  const MIN_EVIDENCIA = 3
  const calcularSintesis = () => {
    const promedioGeneral = EJES.reduce((acc, eje) => {
      const p = progreso[eje.key]?.porcentaje || 0
      return acc + p
    }, 0) / 3

    const nivelGeneral = getNivel(promedioGeneral)

    // Cada eje con su porcentaje Y su cantidad de actividades evaluadas (evidencia)
    const ejesConDatos = EJES.map(e => ({
      ...e,
      porcentaje: progreso[e.key]?.porcentaje || 0,
      nEvaluadas: progreso[e.key]?.actividades?.length || 0,
    }))

    // Solo los ejes con evidencia suficiente pueden recibir un veredicto
    const ejesConEvidencia = ejesConDatos.filter(e => e.nEvaluadas >= MIN_EVIDENCIA)
    const evidenciaSuficiente = ejesConEvidencia.length > 0

    // Fortaleza/area de mejora se calculan SOLO entre los ejes con evidencia
    const ordenados = [...ejesConEvidencia].sort((a, b) => b.porcentaje - a.porcentaje)
    const fortaleza = ordenados[0] || null
    const areaMejora = ordenados.length > 1 ? ordenados[ordenados.length - 1] : null

    // Total de actividades evaluadas en todo el cuatrimestre (para el aviso)
    const totalEvaluadas = ejesConDatos.reduce((acc, e) => acc + e.nEvaluadas, 0)

    return { promedioGeneral, nivelGeneral, fortaleza, areaMejora, evidenciaSuficiente, totalEvaluadas, ejesConDatos }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!alumno) {
    return (
      <div className="p-4 text-center text-gray-500">
        No se encontro el alumno
        <button onClick={onBack} className="block mx-auto mt-4 text-primary underline">
          Volver
        </button>
      </div>
    )
  }

  const sintesis = calcularSintesis()
  
  // Verificar si hay datos evaluados (si todos los ejes tienen 0% significa sin evaluar)
  const tieneEvaluaciones = EJES.some(eje => {
    const p = progreso[eje.key]
    return p && (p.porcentaje > 0 || p.actividades.length > 0)
  })
  
  const totalClasesEvaluadas = EJES.reduce((sum, eje) => {
    return sum + (progreso[eje.key]?.actividades?.length || 0)
  }, 0)

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1e3a5f" }}>
          <User className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
            {alumno.nombre} {alumno.apellido}
          </h2>
          <p className="text-sm text-gray-500">Reporte de Alfabetizacion Inicial</p>
        </div>
        <Button variant="outline" size="sm">
          <Printer className="w-4 h-4 mr-1" />
          Imprimir
        </Button>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-800">Trayectoria</h2>
        <p className="text-xs text-slate-400">Evidencia registrada por eje a lo largo del cuatrimestre</p>
      </div>

          {/* Fortalezas y Areas de mejora - solo si hay evidencia suficiente */}
          {sintesis.evidenciaSuficiente ? (
            <div className="grid grid-cols-2 gap-3">
              {sintesis.fortaleza && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <p className="text-xs font-medium text-green-700 mb-2">Fortaleza</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = EJES.find(e => e.key === sintesis.fortaleza!.key)?.icon || BookOpen
                      return <Icon className="w-5 h-5 text-green-600" />
                    })()}
                    <span className="font-semibold text-green-800">{sintesis.fortaleza.label}</span>
                  </div>
                </div>
              )}
              {sintesis.areaMejora && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <p className="text-xs font-medium text-amber-700 mb-2">Area de Mejora</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const Icon = EJES.find(e => e.key === sintesis.areaMejora!.key)?.icon || BookOpen
                      return <Icon className="w-5 h-5 text-amber-600" />
                    })()}
                    <span className="font-semibold text-amber-800">{sintesis.areaMejora.label}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-sm text-slate-600">
                Aun no hay evidencia suficiente para una valoracion por eje. Se necesitan al menos {sintesis && (3)} actividades evaluadas en un eje (con Finalizar Jornada) para dar un veredicto confiable.
              </p>
            </div>
          )}


      {/* Mensaje cuando no hay evaluaciones */}
      {!tieneEvaluaciones && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Sin evaluaciones registradas</h3>
          <p className="text-sm text-blue-700 mb-4">
            Este alumno aun no tiene evaluaciones en el Registro del Aula. 
            El reporte se completara automaticamente a medida que se registren las clases.
          </p>
          <p className="text-xs text-blue-500">
            Utiliza el panel de &quot;Registro del Aula&quot; para evaluar a los alumnos durante las actividades diarias.
          </p>
        </div>
      )}

      {(
        /* VISTA: Progreso por Eje */
        <div className="space-y-4">
          {!tieneEvaluaciones ? (
            <div className="text-center py-8 text-gray-400">
              <p>Los datos de progreso apareceran aqui cuando se realicen evaluaciones.</p>
            </div>
          ) : EJES.map((eje) => {
            const p = progreso[eje.key] || { porcentaje: 0, actividades: [], tendencia: "estable", semanaActual: 1 }
            const nivel = getNivel(p.porcentaje)
            // Evaluaciones REALES: excluye ausentes ("blue"). Un ausente no es evidencia
            // de desempeno. Se exige un minimo de 3 evaluaciones reales para recomendar.
            const MIN_EVAL_REAL = 3
            const evaluacionesReales = (p.actividades || []).filter((a: ActividadEvaluada) => a.resultado !== "blue").length
            const hayEvidenciaEje = evaluacionesReales >= MIN_EVAL_REAL
            const { sugerencia, urgencia } = getSugerenciaInteligente(eje.key, p.actividades || [], p.porcentaje)
            const secuencia = SECUENCIA_ALBA[eje.key] || []
            const EjeIcon = eje.icon
            const isExpanded = true // siempre desplegado
            
            return (
              <div 
                key={eje.key}
                className="rounded-2xl overflow-hidden border"
                style={{ borderColor: `${eje.color}40` }}
              >
                {/* Encabezado del eje (siempre visible) */}
                <div
                  className="w-full flex items-center px-4 py-3"
                  style={{ backgroundColor: eje.bgColor }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: eje.color }}
                    >
                      <EjeIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-gray-700">{eje.label}</span>
                    </div>
                  </div>
                </div>

                {/* Contenido expandido */}
                {isExpanded && (
                  <div className="bg-white border-t" style={{ borderColor: `${eje.color}20` }}>
                    {/* Evaluaciones REALES de la maestra */}
                    <div className="px-4 py-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">Evaluacion por clase ({evaluacionesReales} evaluadas{(p.actividades || []).some((a: ActividadEvaluada) => a.resultado === "blue") ? ` + ${(p.actividades || []).filter((a: ActividadEvaluada) => a.resultado === "blue").length} ausente(s)` : ""}):</p>
                      <div className="flex flex-wrap gap-1">
                        {(p.actividades || []).length > 0 ? (
                          (p.actividades || []).map((act, idx) => {
                            let bgColor = "#e2e8f0"
                            let textColor = "#64748b"
                            let isAlert = false
                            let statusText = "Pendiente"
                            
                            if (act.resultado === "green") {
                              bgColor = "#10b981"
                              textColor = "#fff"
                              statusText = "Logrado"
                            } else if (act.resultado === "yellow") {
                              bgColor = "#f59e0b"
                              textColor = "#fff"
                              statusText = "En proceso"
                            } else if (act.resultado === "blue") {
                              bgColor = "#3b82f6"
                              textColor = "#fff"
                              statusText = "Ausente"
                            } else if (act.resultado === "red") {
                              bgColor = "#ef4444"
                              textColor = "#fff"
                              isAlert = true
                              statusText = "Necesita refuerzo"
                            }
                            
                            return (
                              <div
                                key={idx}
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold relative ${isAlert ? 'ring-2 ring-red-300 ring-offset-1' : ''}`}
                                style={{ backgroundColor: bgColor, color: textColor }}
                                title={`Clase ${idx + 1} - ${statusText}`}
                              >
                                {idx + 1}
                                {isAlert && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                              </div>
                            )
                          })
                        ) : (
                          <span className="text-xs text-gray-400 italic">Sin evaluaciones todavia en este eje</span>
                        )}
                      </div>
                      <div className="flex gap-3 mt-2 text-xs flex-wrap">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-green-500"></span> Logrado
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-yellow-500"></span> En proceso
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-red-500"></span> Refuerzo
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 rounded-full bg-blue-500"></span> Ausente
                        </span>
                      </div>
                    </div>

                    {/* Sugerencia inteligente de ALBA */}
                    <div className="px-4 pb-4">
                      {/* Alerta si urgencia alta */}
                      {hayEvidenciaEje && urgencia === "alta" && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 mb-3">
                          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">!</span>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-red-700">ALERTA PEDAGOGICA - REQUIERE ATENCION</p>
                            <p className="text-sm text-red-600 mt-0.5">{sugerencia}</p>
                          </div>
                        </div>
                      )}
                      {/* Sugerencia media (amarillo) */}
                      {hayEvidenciaEje && urgencia === "media" && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                          <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                          <div>
                            <p className="text-xs font-medium text-amber-700">Recomendacion de ALBA:</p>
                            <p className="text-sm text-amber-800 mt-0.5">{sugerencia}</p>
                          </div>
                        </div>
                      )}
                      {/* Aviso: sin evidencia suficiente para recomendar (ausentes no cuentan) */}
                      {!hayEvidenciaEje && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                          <div>
                            <p className="text-xs font-medium text-slate-500">Aun sin evidencia suficiente</p>
                            <p className="text-sm text-slate-600 mt-0.5">Se necesitan al menos 3 clases evaluadas (sin contar ausentes) para una recomendacion en este eje.</p>
                          </div>
                        </div>
                      )}
                      {/* Sugerencia baja (verde - avanzado) */}
                      {hayEvidenciaEje && urgencia === "baja" && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                          <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                          <div>
                            <p className="text-xs font-medium text-emerald-700">Para seguir avanzando:</p>
                            <p className="text-sm text-emerald-800 mt-0.5">{sugerencia}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Historial reciente */}
                    {(p.actividades || []).length > 0 && (
                      <div className="px-4 pb-4 border-t" style={{ borderColor: `${eje.color}10` }}>
                        <p className="text-xs font-medium text-gray-500 mt-3 mb-2">Ultimas actividades evaluadas:</p>
                        <div className="space-y-1">
                          {(p.actividades || []).slice(0, 3).map((act, i) => (
                            <div 
                              key={i}
                              className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50"
                            >
                              <div className="flex items-center gap-2">
                                <span 
                                  className="w-2 h-2 rounded-full"
                                  style={{ 
                                    backgroundColor: act.resultado === "green" ? "#10b981" : 
                                                    act.resultado === "yellow" ? "#f59e0b" : "#ef4444"
                                  }}
                                />
                                <span className="text-gray-700">{act.titulo}</span>
                              </div>
                              <span className="text-gray-400">{act.fecha}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {(
        /* VISTA: Sintesis Cuatrimestral (continuacion) */
        <div className="space-y-4">
          {!tieneEvaluaciones ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <Target className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Sintesis no disponible</h3>
              <p className="text-sm text-amber-700 mb-4">
                La sintesis cuatrimestral se genera a partir de las evaluaciones realizadas en el Registro del Aula.
              </p>
              <p className="text-xs text-amber-500">
                Una vez que se registren evaluaciones, podras ver aqui el analisis completo del proceso 
                de alfabetizacion incluyendo los tres ejes: CF, CT y O.
              </p>
            </div>
          ) : (
            <>
              {/* Info de clases evaluadas */}
              <div className="bg-slate-100 rounded-xl p-3 flex items-center justify-between text-sm">
                <span className="text-slate-600">Clases evaluadas:</span>
                <span className="font-bold text-slate-700">{totalClasesEvaluadas}</span>
              </div>


          {/* Recomendaciones para el cuatrimestre - solo con evidencia suficiente */}
          {sintesis.evidenciaSuficiente && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                <p className="font-medium text-gray-700">Recomendaciones para el proximo cuatrimestre</p>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                {sintesis.fortaleza && (
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                    <span>
                      <strong>Continuar fortaleciendo {sintesis.fortaleza.label}</strong>: el alumno muestra buen desempeno segun la evidencia registrada.
                      Proponer actividades mas complejas en este eje.
                    </span>
                  </li>
                )}
                {sintesis.areaMejora && (
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                    <span>
                      <strong>Priorizar {sintesis.areaMejora.label}</strong>: {SUGERENCIAS[sintesis.areaMejora.key][getNivel(sintesis.areaMejora.porcentaje).texto]}
                    </span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                  <span>
                    <strong>Integracion de ejes</strong>: proponer actividades que combinen los ejes trabajados para un abordaje mas integral.
                  </span>
                </li>
              </ul>
            </div>
          )}

          {/* MENSAJES PARA LA FAMILIA */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <p className="font-bold text-blue-900">Sintesis para el Docente</p>
            </div>
            
            <div className="space-y-4">
              {EJES.map((eje) => {
                // Evidencia real del eje: clases evaluadas sin contar ausentes ("blue")
                const actsEje = progreso[eje.key]?.actividades || []
                const evalRealesEje = actsEje.filter((a: ActividadEvaluada) => a.resultado !== "blue").length
                const hayEvidenciaDocente = evalRealesEje >= 3
                const p = progreso[eje.key]?.porcentaje || 0
                const nivel = getNivel(p)
                const mensajeDocente = MENSAJES_DOCENTE[eje.key]?.[nivel.texto]

                return (
                  <div 
                    key={eje.key}
                    className="bg-white rounded-xl p-4 border"
                    style={{ borderColor: `${eje.color}40` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <eje.icon className="w-4 h-4" style={{ color: eje.color }} />
                      <h4 className="font-semibold text-sm" style={{ color: eje.color }}>
                        {eje.label}
                      </h4>
                    </div>
                    {hayEvidenciaDocente && mensajeDocente ? (
                      <>
                        <p className="text-sm text-gray-600 mb-3">{mensajeDocente.mensaje}</p>
                        <div className="bg-slate-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-slate-500 mb-2">Estrategias sugeridas para el aula:</p>
                          <ul className="space-y-1.5">
                            {mensajeDocente.actividades.map((act, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                                <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                                  {idx + 1}
                                </span>
                                {act}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Aun sin evidencia suficiente para una sintesis en este eje (se necesitan al menos 3 clases evaluadas).</p>
                    )}
                  </div>
                )
              })}
            </div>
            

          </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
