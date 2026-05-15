"use client"

import { useState, useEffect, useRef } from "react"
import { RefreshCw, Lightbulb } from "lucide-react"
import Image from "next/image"

// Consejos de ALBA segun el eje - en tono argentino, amigable
const CONSEJOS_ALBA: Record<string, string[]> = {
  CF: [
    "Hola! Hoy vamos con el sonido inicial. Cuando digas la palabra, alarga ese primer sonido: 'Mmmmmanzana'. Los chicos van a captar enseguida que todas empiezan igual.",
    "Un tip que funciona barbaro: usa objetos del aula que empiecen con el mismo sonido. Si trabajas la M, junta una mochila, un muneco, una manzana. Los nenes lo ven y lo entienden al toque.",
    "Acorda que lo importante es que asocien el dibujo de la letra con el sonido. Cuando vean la M, tienen que pensar 'Mmmmm'. Eso es la base de todo.",
    "Proba con rimas cortitas. 'Sol, caracol, girasol'. Los chicos se enganchan con la musicalidad y sin darse cuenta estan trabajando conciencia fonologica.",
    "Si un nene no lo agarra de una, tranqui. Repetilo de forma divertida, con juegos. Nada de presion, que esto es jardin y tienen que pasarla bien."
  ],
  CT: [
    "Hola! Antes de leer el cuento, mostrales la tapa y preguntales de que creen que se trata. Eso los mete en la historia antes de empezar.",
    "Mientras lees, para cada tanto y pregunta: Que les parece que va a pasar ahora? Eso los mantiene atentos y activa la imaginacion.",
    "Relaciona el cuento con cosas que ellos conocen. Si el personaje tiene un perro, pregunta quien tiene mascota en casa. Asi conectan la historia con su vida.",
    "Despues de leer, pedidles que cuenten la historia con sus palabras. No importa si se saltean partes, lo que importa es que comprendan la secuencia.",
    "Usa distintos tonos de voz para los personajes. A los chicos les encanta y les ayuda a distinguir quien habla en la historia."
  ],
  O: [
    "Hola! Hace preguntas abiertas, no de si o no. En vez de Te gusto, pregunta Que parte te gusto mas. Asi los obligas a pensar y expresarse.",
    "Cuando un nene dice algo cortito como Vi perro, vos amplias: Ah, viste un perro! Era grande o chiquito? De que color era? Asi van sumando vocabulario.",
    "Dale tiempo para que piensen. A veces los apuramos y los ponemos nerviosos. Espera unos segundos antes de pasar a otro nene.",
    "La ronda de intercambio es clave. Que cada uno cuente algo de su fin de semana, de su familia. Escucharse entre ellos tambien es aprender.",
    "Si un nene es timido, no lo fuerces adelante de todos. Acercate y charlale de a poquito, que agarre confianza de a poco."
  ]
}

// Lo que deben aprender los ninos
const QUE_DEBEN_APRENDER: Record<string, string[]> = {
  CF: [
    "Asociar el dibujo de la letra con su sonido",
    "Reconocer que las palabras estan formadas por sonidos",
    "Identificar el sonido inicial de una palabra",
    "Encontrar palabras que empiezan igual",
    "Separar palabras en silabas con palmadas"
  ],
  CT: [
    "Entender que los textos cuentan historias",
    "Anticipar que puede pasar en un cuento",
    "Recordar la secuencia: inicio, desarrollo, final",
    "Conectar la historia con sus propias experiencias",
    "Reconocer personajes principales"
  ],
  O: [
    "Expresar ideas con oraciones completas",
    "Ampliar su vocabulario con palabras nuevas",
    "Escuchar a los demas cuando hablan",
    "Contar experiencias en orden",
    "Hacer preguntas cuando no entienden"
  ]
}

// Fundamento pedagogico por eje
const FUNDAMENTO_PEDAGOGICO: Record<string, { teoria: string; autor: string; descripcion: string }> = {
  CF: {
    teoria: "Conciencia Fonologica",
    autor: "Marilyn Adams, 1990 / Defior, 1996",
    descripcion: "La conciencia fonologica es la capacidad de reconocer y manipular los sonidos del lenguaje hablado. Es el predictor mas fuerte del exito en la lectura inicial. Los ninos que desarrollan esta habilidad antes de aprender a leer tienen ventajas significativas porque comprenden que las palabras estan compuestas por unidades de sonido (fonemas) que se corresponden con letras."
  },
  CT: {
    teoria: "Comprension Lectora Emergente",
    autor: "Sulzby & Teale, 1991 / Scarborough, 2001",
    descripcion: "La comprension de textos en nivel inicial se construye a traves de la lectura compartida y dialogica. Los ninos desarrollan esquemas narrativos (inicio, desarrollo, cierre) que les permiten anticipar, inferir y conectar historias con sus experiencias. Esta capacidad de construir significado es la base de la comprension lectora futura."
  },
  O: {
    teoria: "Desarrollo del Lenguaje Oral",
    autor: "Vygotsky, 1978 / Bruner, 1983",
    descripcion: "El lenguaje oral es el andamiaje fundamental para el desarrollo cognitivo y la alfabetizacion. A traves de la interaccion social y el dialogo, los ninos amplian su vocabulario, estructuran su pensamiento y desarrollan habilidades comunicativas. El adulto actua como mediador, expandiendo y enriqueciendo las expresiones infantiles."
  }
}

interface MicroTrainingProps {
  ejeDelDia?: "CF" | "CT" | "O"
  actividadDelDia?: string
}

export function MicroTraining({ ejeDelDia = "CF" }: MicroTrainingProps) {
  const consejos = CONSEJOS_ALBA[ejeDelDia]
  const aprendizajes = QUE_DEBEN_APRENDER[ejeDelDia]
  const fundamento = FUNDAMENTO_PEDAGOGICO[ejeDelDia]
  
  const [consejoIndex, setConsejoIndex] = useState(0)
  const [showAprendizajes, setShowAprendizajes] = useState(false)
  const [showFundamento, setShowFundamento] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTalking, setIsTalking] = useState(false)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  const consejoActual = consejos[consejoIndex]

  // Cargar voces del navegador
  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices()
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  // Detener audio al cambiar de consejo
  useEffect(() => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsTalking(false)
  }, [consejoIndex])

  // Un solo boton: cambia tip y reproduce audio automaticamente
  const handleOtroTip = () => {
    // Detener audio actual
    window.speechSynthesis.cancel()
    
    // Cambiar al siguiente consejo
    const nextIndex = (consejoIndex + 1) % consejos.length
    setConsejoIndex(nextIndex)
    
    // Reproducir el nuevo consejo despues de un momento
    setTimeout(() => {
      const nuevoConsejo = consejos[nextIndex]
      const utterance = new SpeechSynthesisUtterance(nuevoConsejo)
      
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1
      
      const voices = window.speechSynthesis.getVoices()
      const vozNatural = 
        voices.find(v => v.name.includes("Google español")) ||
        voices.find(v => v.name.includes("Google Spanish")) ||
        voices.find(v => v.name === "Paulina") ||
        voices.find(v => v.name === "Monica") ||
        voices.find(v => v.name.includes("Microsoft") && v.lang.includes("es")) ||
        voices.find(v => v.lang === "es-MX") ||
        voices.find(v => v.lang === "es-AR") ||
        voices.find(v => v.lang.startsWith("es"))
      
      if (vozNatural) {
        utterance.voice = vozNatural
        utterance.lang = vozNatural.lang
      } else {
        utterance.lang = "es-MX"
      }
      
      utterance.onstart = () => setIsTalking(true)
      utterance.onend = () => {
        setIsPlaying(false)
        setIsTalking(false)
      }
      utterance.onerror = () => {
        setIsPlaying(false)
        setIsTalking(false)
      }
      
      speechRef.current = utterance
      window.speechSynthesis.speak(utterance)
      setIsPlaying(true)
    }, 100)
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md h-full flex flex-col border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Micro capacitacion just in time
        </h3>
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <div className="rounded-xl overflow-hidden m-4" style={{ backgroundColor: "#1e3a5f" }}>
          {/* Avatar + Burbuja */}
          <div className="p-4">
            <div className="flex gap-3">
              {/* Avatar de ALBA con animacion */}
              <div className="relative flex-shrink-0">
                <div 
                  className={`w-16 h-16 rounded-full overflow-hidden transition-transform ${isTalking ? "animate-pulse scale-105" : ""}`}
                  style={{ borderColor: "#fbbf24", borderWidth: "3px" }}
                >
                  <Image 
                    src="/images/alba-personaje.jpg"
                    alt="ALBA"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              
              {/* Burbuja de dialogo */}
              <div className="flex-1 relative">
                <div 
                  className="bg-white rounded-xl rounded-tl-none p-3 text-sm text-slate-700 leading-relaxed"
                  style={{ minHeight: "80px" }}
                >
                  {consejoActual}
                </div>
                <div 
                  className="absolute top-3 -left-2 w-0 h-0"
                  style={{
                    borderTop: "8px solid transparent",
                    borderBottom: "8px solid transparent",
                    borderRight: "8px solid white"
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Un solo boton: Otro tip (cambia y reproduce) */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50">
            <button 
              type="button"
              onClick={handleOtroTip}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-amber-500 text-white hover:bg-amber-600 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isTalking ? "animate-spin" : ""}`} />
              Otro tip
            </button>
            <span className="text-xs text-white/60">
              {consejoIndex + 1} / {consejos.length}
            </span>
          </div>
        </div>

        {/* Lo que deben aprender - colapsable */}
        <div className="mx-4 mb-2 bg-slate-50 rounded-lg px-4 py-3">
          <button 
            type="button"
            onClick={() => setShowAprendizajes(!showAprendizajes)}
            className="w-full text-left flex items-center justify-between text-xs font-semibold"
            style={{ color: "#1e3a5f" }}
          >
            <span>Que deben aprender los ninos</span>
            <span className="text-slate-400">{showAprendizajes ? "−" : "+"}</span>
          </button>
          
          {showAprendizajes && (
            <ul className="mt-2 text-xs text-slate-600 space-y-1.5">
              {aprendizajes.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-amber-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Fundamento Pedagogico - colapsable */}
        <div className="mx-4 mb-4 bg-blue-50 rounded-lg px-4 py-3 border border-blue-100">
          <button 
            type="button"
            onClick={() => setShowFundamento(!showFundamento)}
            className="w-full text-left flex items-center justify-between text-xs font-semibold"
            style={{ color: "#1e3a5f" }}
          >
            <span>Fundamento pedagogico</span>
            <span className="text-slate-400">{showFundamento ? "−" : "+"}</span>
          </button>
          
          {showFundamento && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700">{fundamento.teoria}</span>
              </div>
              <p className="text-xs text-blue-600 italic">
                {fundamento.autor}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {fundamento.descripcion}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
