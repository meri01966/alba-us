"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, User, Lightbulb, Clock, TrendingUp, TrendingDown, Minus, BookOpen, MessageCircle, Music, ChevronDown, ChevronRight, Printer, Target } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StudentProfileProps {
  alumnoId: string
  alumnoNombre?: string
  progressData?: { CF: number; CT: number; O: number }
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
  resultado: "green" | "yellow" | "red"
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

// Sugerencias por eje y nivel
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
const MENSAJES_FAMILIA: Record<string, Record<string, { titulo: string; mensaje: string; actividades: string[] }>> = {
  CF: {
    "Necesita Apoyo": {
      titulo: "Conciencia Fonologica: Trabajando juntos",
      mensaje: "Su hijo/a esta comenzando a descubrir los sonidos del lenguaje. En casa pueden ayudar con actividades simples y divertidas.",
      actividades: [
        "Cantar canciones con rimas (ej: 'Arroz con leche')",
        "Jugar a encontrar cosas que empiecen con el mismo sonido",
        "Aplaudir las silabas de los nombres de la familia",
        "Leer cuentos rimados antes de dormir",
      ],
    },
    "En Proceso": {
      titulo: "Conciencia Fonologica: Avanzando bien",
      mensaje: "Su hijo/a esta desarrollando la habilidad de reconocer sonidos. Pueden seguir practicando en casa de forma ludica.",
      actividades: [
        "Jugar 'Veo veo' con sonidos iniciales (ej: 'Veo algo que empieza con /m/')",
        "Inventar rimas tontas con nombres de la familia",
        "Identificar palabras largas y cortas aplaudiendo silabas",
        "Buscar objetos en casa que empiecen con una letra especifica",
      ],
    },
    "Avanzado": {
      titulo: "Conciencia Fonologica: Excelente progreso",
      mensaje: "Su hijo/a muestra muy buen dominio de los sonidos del lenguaje. Pueden desafiarlo con actividades mas complejas.",
      actividades: [
        "Jugar a cambiar sonidos en palabras (ej: si a 'pato' le cambio /p/ por /g/, que queda?)",
        "Inventar palabras nuevas combinando sonidos",
        "Jugar a las adivinanzas con sonidos",
        "Crear trabalenguas familiares",
      ],
    },
  },
  CT: {
    "Necesita Apoyo": {
      titulo: "Comprension de Textos: Explorando juntos",
      mensaje: "Su hijo/a esta aprendiendo a comprender historias. La lectura compartida en casa es fundamental.",
      actividades: [
        "Leer cuentos cortos y preguntar 'Quien aparece en el cuento?'",
        "Mirar las imagenes antes de leer y adivinar de que tratara",
        "Hacer pausas y preguntar 'Que paso hasta ahora?'",
        "Releer los cuentos favoritos varias veces",
      ],
    },
    "En Proceso": {
      titulo: "Comprension de Textos: Progresando",
      mensaje: "Su hijo/a comprende historias basicas y esta listo para profundizar. Sigan disfrutando la lectura juntos.",
      actividades: [
        "Preguntar 'Por que crees que el personaje hizo eso?'",
        "Conectar el cuento con experiencias propias ('Te paso algo parecido?')",
        "Pedir que cuente el cuento a otro familiar",
        "Imaginar finales alternativos para las historias",
      ],
    },
    "Avanzado": {
      titulo: "Comprension de Textos: Destacado",
      mensaje: "Su hijo/a tiene excelente comprension lectora. Pueden explorar textos mas complejos y conversaciones profundas.",
      actividades: [
        "Leer cuentos mas largos en capitulos",
        "Discutir 'Esta bien o mal lo que hizo el personaje? Por que?'",
        "Comparar diferentes versiones de un mismo cuento",
        "Crear historias propias inspiradas en los cuentos leidos",
      ],
    },
  },
  O: {
    "Necesita Apoyo": {
      titulo: "Oralidad: Encontrando su voz",
      mensaje: "Su hijo/a esta desarrollando su expresion verbal. Cada conversacion en casa es una oportunidad de aprendizaje.",
      actividades: [
        "Hablar sobre el dia: 'Que hiciste hoy? Con quien jugaste?'",
        "Nombrar objetos y describir sus caracteristicas",
        "Cantar canciones y repetir rimas juntos",
        "Escuchar con atencion cuando habla, sin interrumpir",
      ],
    },
    "En Proceso": {
      titulo: "Oralidad: Creciendo en expresion",
      mensaje: "Su hijo/a se expresa cada vez mejor. Sigan conversando y dando oportunidades para hablar.",
      actividades: [
        "Pedir que cuente historias con inicio, desarrollo y final",
        "Jugar a describir objetos para que otros adivinen",
        "Hacer preguntas abiertas que requieran explicaciones",
        "Inventar cuentos juntos, turnandose para agregar partes",
      ],
    },
    "Avanzado": {
      titulo: "Oralidad: Comunicador nato",
      mensaje: "Su hijo/a tiene excelentes habilidades de comunicacion oral. Pueden desafiarlo con actividades mas complejas.",
      actividades: [
        "Debatir opiniones sobre temas simples ('Que es mejor, perros o gatos? Por que?')",
        "Pedir que explique como hacer algo (receta, juego, etc.)",
        "Grabar audiocuentos inventados por el/ella",
        "Practicar presentaciones sobre temas que le interesen",
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
  const [ejeExpandido, setEjeExpandido] = useState<string | null>(null)
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
          if (data.alumno) setAlumno(data.alumno)
        } else if (progressData) {
          // Fallback a datos del padre si API falla
          setProgreso({
            CF: { logradas: [], porcentaje: progressData.CF, actividades: [], tendencia: "estable", semanaActual: 1 },
            CT: { logradas: [], porcentaje: progressData.CT, actividades: [], tendencia: "estable", semanaActual: 1 },
            O: { logradas: [], porcentaje: progressData.O, actividades: [], tendencia: "estable", semanaActual: 1 },
          })
        }
      } catch (err) {
        console.error("Error fetching student profile:", err)
        // Fallback
        if (progressData) {
          setProgreso({
            CF: { logradas: [], porcentaje: progressData.CF, actividades: [], tendencia: "estable", semanaActual: 1 },
            CT: { logradas: [], porcentaje: progressData.CT, actividades: [], tendencia: "estable", semanaActual: 1 },
            O: { logradas: [], porcentaje: progressData.O, actividades: [], tendencia: "estable", semanaActual: 1 },
          })
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [alumnoId, progressData])

  // Calcular sintesis cuatrimestral
  const calcularSintesis = () => {
    const promedioGeneral = EJES.reduce((acc, eje) => {
      const p = progreso[eje.key]?.porcentaje || 0
      return acc + p
    }, 0) / 3

    const nivelGeneral = getNivel(promedioGeneral)
    
    // Determinar fortalezas y areas de mejora
    const ejesOrdenados = EJES.map(e => ({
      ...e,
      porcentaje: progreso[e.key]?.porcentaje || 0
    })).sort((a, b) => b.porcentaje - a.porcentaje)

    const fortaleza = ejesOrdenados[0]
    const areaMejora = ejesOrdenados[2]

    return { promedioGeneral, nivelGeneral, fortaleza, areaMejora }
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
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setVistaActiva("progreso")}
          className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
            vistaActiva === "progreso"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Progreso por Eje
        </button>
        <button
          onClick={() => setVistaActiva("sintesis")}
          className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
            vistaActiva === "sintesis"
              ? "bg-slate-900 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Sintesis Cuatrimestral
        </button>
      </div>

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

      {vistaActiva === "progreso" ? (
        /* VISTA: Progreso por Eje */
        <div className="space-y-4">
          {!tieneEvaluaciones ? (
            <div className="text-center py-8 text-gray-400">
              <p>Los datos de progreso apareceran aqui cuando se realicen evaluaciones.</p>
            </div>
          ) : EJES.map((eje) => {
            const p = progreso[eje.key] || { porcentaje: 0, actividades: [], tendencia: "estable", semanaActual: 1 }
            const nivel = getNivel(p.porcentaje)
            const sugerencia = SUGERENCIAS[eje.key][nivel.texto]
            const secuencia = SECUENCIA_ALBA[eje.key] || []
            const EjeIcon = eje.icon
            const isExpanded = ejeExpandido === eje.key
            
            return (
              <div 
                key={eje.key}
                className="rounded-2xl overflow-hidden border"
                style={{ borderColor: `${eje.color}40` }}
              >
                {/* Encabezado clickeable */}
                <button
                  onClick={() => setEjeExpandido(isExpanded ? null : eje.key)}
                  className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:opacity-90"
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
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Semana {p.semanaActual || 1}/25</span>
                        {p.tendencia === "mejorando" && <TrendingUp className="w-3 h-3 text-green-500" />}
                        {p.tendencia === "bajando" && <TrendingDown className="w-3 h-3 text-red-500" />}
                        {p.tendencia === "estable" && <Minus className="w-3 h-3 text-gray-400" />}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-3 py-1 rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: nivel.color }}
                    >
                      {p.porcentaje}%
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Contenido expandido */}
                {isExpanded && (
                  <div className="bg-white border-t" style={{ borderColor: `${eje.color}20` }}>
                    {/* Barra de progreso visual */}
                    <div className="px-4 pt-4">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progreso en la secuencia</span>
                        <span>{p.semanaActual || 1} de 25 semanas</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ 
                            width: `${((p.semanaActual || 1) / 25) * 100}%`,
                            backgroundColor: eje.color 
                          }}
                        />
                      </div>
                    </div>

                    {/* Mapeo de actividades en la secuencia */}
                    <div className="px-4 py-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">Secuencia de actividades:</p>
                      <div className="flex flex-wrap gap-1">
                        {secuencia.slice(0, 12).map((act, idx) => {
                          const actividadEvaluada = (p.actividades || []).find(a => a.semana === act.semana)
                          let bgColor = "#e2e8f0" // gris - no evaluada
                          let textColor = "#64748b"
                          
                          if (actividadEvaluada) {
                            if (actividadEvaluada.resultado === "green") {
                              bgColor = "#10b981"
                              textColor = "#fff"
                            } else if (actividadEvaluada.resultado === "yellow") {
                              bgColor = "#f59e0b"
                              textColor = "#fff"
                            } else {
                              bgColor = "#ef4444"
                              textColor = "#fff"
                            }
                          } else if (idx < (p.semanaActual || 1)) {
                            // Actividad pasada sin evaluar
                            bgColor = "#cbd5e1"
                          }
                          
                          return (
                            <div
                              key={idx}
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ backgroundColor: bgColor, color: textColor }}
                              title={act.titulo}
                            >
                              {act.semana}
                            </div>
                          )
                        })}
                        {secuencia.length > 12 && (
                          <span className="text-xs text-gray-400 self-center ml-1">+{secuencia.length - 12} mas</span>
                        )}
                      </div>
                      <div className="flex gap-3 mt-2 text-xs">
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
                          <span className="w-3 h-3 rounded-full bg-slate-300"></span> Pendiente
                        </span>
                      </div>
                    </div>

                    {/* Sugerencia */}
                    <div className="px-4 pb-4">
                      <div className="flex items-start gap-2 p-3 rounded-xl" style={{ backgroundColor: eje.bgColor }}>
                        <Lightbulb className="w-4 h-4 mt-0.5 shrink-0" style={{ color: eje.color }} />
                        <div>
                          <p className="text-xs font-medium" style={{ color: eje.color }}>Recomendacion ALBA:</p>
                          <p className="text-sm text-gray-600 mt-0.5">{sugerencia}</p>
                        </div>
                      </div>
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
      ) : (
        /* VISTA: Sintesis Cuatrimestral */
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

              {/* Resumen General */}
              <div 
                className="rounded-2xl p-5 text-center"
                style={{ backgroundColor: sintesis.nivelGeneral.bg }}
              >
                <p className="text-sm text-gray-500 mb-2">Nivel General de Alfabetizacion</p>
                <div 
                  className="text-4xl font-bold mb-2"
                  style={{ color: sintesis.nivelGeneral.color }}
                >
                  {Math.round(sintesis.promedioGeneral)}%
                </div>
                <span 
                  className="inline-block px-4 py-1.5 rounded-full text-white font-bold"
                  style={{ backgroundColor: sintesis.nivelGeneral.color }}
                >
                  {sintesis.nivelGeneral.texto}
                </span>
              </div>

          {/* Grafico de barras por eje */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-4">Desempeno por Eje</p>
            <div className="space-y-4">
              {EJES.map((eje) => {
                const p = progreso[eje.key]?.porcentaje || 0
                const EjeIcon = eje.icon
                return (
                  <div key={eje.key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <EjeIcon className="w-4 h-4" style={{ color: eje.color }} />
                        <span className="text-sm text-gray-600">{eje.label}</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: eje.color }}>{p}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ width: `${p}%`, backgroundColor: eje.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Fortalezas y Areas de mejora */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-xs font-medium text-green-700 mb-2">Fortaleza</p>
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = EJES.find(e => e.key === sintesis.fortaleza.key)?.icon || BookOpen
                  return <Icon className="w-5 h-5 text-green-600" />
                })()}
                <span className="font-semibold text-green-800">{sintesis.fortaleza.label}</span>
              </div>
              <p className="text-lg font-bold text-green-600 mt-1">{sintesis.fortaleza.porcentaje}%</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <p className="text-xs font-medium text-amber-700 mb-2">Area de Mejora</p>
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = EJES.find(e => e.key === sintesis.areaMejora.key)?.icon || BookOpen
                  return <Icon className="w-5 h-5 text-amber-600" />
                })()}
                <span className="font-semibold text-amber-800">{sintesis.areaMejora.label}</span>
              </div>
              <p className="text-lg font-bold text-amber-600 mt-1">{sintesis.areaMejora.porcentaje}%</p>
            </div>
          </div>

          {/* Recomendaciones para el cuatrimestre */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <p className="font-medium text-gray-700">Recomendaciones para el proximo cuatrimestre</p>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                <span>
                  <strong>Continuar fortaleciendo {sintesis.fortaleza.label}</strong>: El alumno muestra buen desempeno. 
                  Avanzar en la secuencia ALBA hacia actividades mas complejas.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                <span>
                  <strong>Priorizar {sintesis.areaMejora.label}</strong>: {SUGERENCIAS[sintesis.areaMejora.key][getNivel(sintesis.areaMejora.porcentaje).texto]}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                <span>
                  <strong>Integracion de ejes</strong>: Buscar actividades que combinen los tres ejes para un aprendizaje mas integral.
                </span>
              </li>
            </ul>
          </div>

          {/* MENSAJES PARA LA FAMILIA */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-600" />
              <p className="font-bold text-blue-900">Mensaje para la Familia</p>
            </div>
            
            <div className="space-y-4">
              {EJES.map((eje) => {
                const p = progreso[eje.key]?.porcentaje || 0
                const nivel = getNivel(p)
                const mensajeFamilia = MENSAJES_FAMILIA[eje.key]?.[nivel.texto]
                
                if (!mensajeFamilia) return null
                
                return (
                  <div 
                    key={eje.key}
                    className="bg-white rounded-xl p-4 border"
                    style={{ borderColor: `${eje.color}40` }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <eje.icon className="w-4 h-4" style={{ color: eje.color }} />
                      <h4 className="font-semibold text-sm" style={{ color: eje.color }}>
                        {mensajeFamilia.titulo}
                      </h4>
                      <span 
                        className="ml-auto text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: nivel.color }}
                      >
                        {p}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{mensajeFamilia.mensaje}</p>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-slate-500 mb-2">Actividades sugeridas para hacer en casa:</p>
                      <ul className="space-y-1.5">
                        {mensajeFamilia.actividades.map((act, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            {act}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )
              })}
            </div>
            
<p className="text-xs text-blue-600 mt-4 text-center italic">
              Estos mensajes pueden compartirse con las familias para acompanar el proceso de alfabetizacion en casa.
            </p>
          </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
