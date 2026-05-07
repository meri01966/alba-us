"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RefreshCw, Lightbulb, Volume2 } from "lucide-react"
import Image from "next/image"

// Consejos de ALBA segun el eje - en tono argentino, amigable
const CONSEJOS_ALBA: Record<string, string[]> = {
  CF: [
    "Dale, vamos con el sonido inicial. Cuando digas la palabra, alarga ese primer sonido: 'Mmmmmanzana'. Los chicos van a captar enseguida que todas empiezan igual.",
    "Un tip que funciona barbaro: usa objetos del aula que empiecen con el mismo sonido. Si trabajas la M, junta una mochila, un muneco, una manzana. Los nenes lo ven y lo entienden al toque.",
    "Acorda que lo importante es que asocien el dibujo de la letra con el sonido. Cuando vean la M, tienen que pensar 'Mmmmm'. Eso es la base de todo.",
    "Proba con rimas cortitas. 'Sol, caracol, girasol'. Los chicos se enganchan con la musicalidad y sin darse cuenta estan trabajando conciencia fonologica.",
    "Si un nene no lo agarra de una, tranqui. Repetilo de forma divertida, con juegos. Nada de presion, que esto es jardin y tienen que pasarla bien."
  ],
  CT: [
    "Antes de leer el cuento, mostrales la tapa y preguntales de que creen que se trata. Eso los mete en la historia antes de empezar.",
    "Mientras lees, para cada tanto y pregunta: 'Que les parece que va a pasar ahora?'. Eso los mantiene atentos y activa la imaginacion.",
    "Relaciona el cuento con cosas que ellos conocen. Si el personaje tiene un perro, pregunta quien tiene mascota en casa. Asi conectan la historia con su vida.",
    "Despues de leer, pedidles que cuenten la historia con sus palabras. No importa si se saltean partes, lo que importa es que comprendan la secuencia.",
    "Usa distintos tonos de voz para los personajes. A los chicos les encanta y les ayuda a distinguir quien habla en la historia."
  ],
  O: [
    "Hace preguntas abiertas, no de si o no. En vez de '¿Te gusto?', pregunta '¿Que parte te gusto mas?'. Asi los obligas a pensar y expresarse.",
    "Cuando un nene dice algo cortito como 'Vi perro', vos amplias: 'Ah, viste un perro! Era grande o chiquito? De que color era?'. Asi van sumando vocabulario.",
    "Dale tiempo para que piensen. A veces los apuramos y los ponemos nerviosos. Espera unos segundos antes de pasar a otro nene.",
    "La ronda de intercambio es clave. Que cada uno cuente algo de su fin de semana, de su familia. Escucharse entre ellos tambien es aprender.",
    "Si un nene es timido, no lo fuerces adelante de todos. Acercate y charlale de a poquito, que agarre confianza de a poco."
  ]
}

// Lo que deben aprender los ninos - tips pedagogicos
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

interface MicroTrainingProps {
  ejeDelDia?: "CF" | "CT" | "O"
  actividadDelDia?: string
}

export function MicroTraining({ ejeDelDia = "CF", actividadDelDia }: MicroTrainingProps) {
  const consejos = CONSEJOS_ALBA[ejeDelDia]
  const aprendizajes = QUE_DEBEN_APRENDER[ejeDelDia]
  
  const [consejoIndex, setConsejoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTalking, setIsTalking] = useState(false)
  const [showAprendizajes, setShowAprendizajes] = useState(false)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  const consejoActual = consejos[consejoIndex]

  // Refrescar consejo
  const handleRefresh = () => {
    // Parar audio si esta sonando
    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setIsTalking(false)
    }
    setConsejoIndex((prev) => (prev + 1) % consejos.length)
  }

  // Reproducir audio con voz femenina dulce tipo maestra de jardin
  const handlePlayAudio = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setIsTalking(false)
    } else {
      const utterance = new SpeechSynthesisUtterance(consejoActual)
      utterance.lang = "es-AR"
      utterance.rate = 0.9  // Un poco mas lento para que sea claro
      utterance.pitch = 1.3 // Mas agudo para voz femenina dulce
      
      // Buscar una voz femenina en espanol
      const voices = window.speechSynthesis.getVoices()
      const vozFemenina = voices.find(v => 
        (v.lang.includes("es") || v.lang.includes("ES")) && 
        (v.name.toLowerCase().includes("female") || 
         v.name.toLowerCase().includes("mujer") ||
         v.name.toLowerCase().includes("paulina") ||
         v.name.toLowerCase().includes("monica") ||
         v.name.toLowerCase().includes("lucia") ||
         v.name.toLowerCase().includes("elena") ||
         v.name.toLowerCase().includes("google") ||
         v.name.toLowerCase().includes("microsoft"))
      ) || voices.find(v => v.lang.includes("es"))
      
      if (vozFemenina) {
        utterance.voice = vozFemenina
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
    }
  }
  
  // Cargar voces cuando esten disponibles
  useEffect(() => {
    const loadVoices = () => {
      window.speechSynthesis.getVoices()
    }
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])
  
  return (
    <Card className="h-full shadow-md overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
          <Lightbulb className="w-4 h-4 text-amber-500" />
          ALBA te cuenta
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#1e3a5f" }}>
          
          {/* Area del personaje ALBA */}
          <div className="relative p-4">
            <div className="flex gap-3">
              {/* Avatar de ALBA con animacion */}
              <div className="relative flex-shrink-0">
                <div 
                  className={`w-16 h-16 rounded-full overflow-hidden border-3 transition-all duration-300 ${
                    isTalking ? "animate-pulse scale-105" : ""
                  }`}
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
                {/* Indicador de hablando */}
                {isTalking && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                    <Volume2 className="w-3 h-3 text-slate-800 animate-pulse" />
                  </div>
                )}
              </div>
              
              {/* Burbuja de dialogo */}
              <div className="flex-1 relative">
                <div 
                  className="bg-white rounded-xl rounded-tl-none p-3 text-sm text-slate-700 leading-relaxed"
                  style={{ minHeight: "80px" }}
                >
                  {consejoActual}
                </div>
                {/* Triangulo de la burbuja */}
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
            
            {/* Botones de control */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={handlePlayAudio}
                  className="rounded-full px-3 text-xs"
                  style={{ 
                    backgroundColor: isPlaying ? "#f59e0b" : "#fbbf24", 
                    color: "#1e3a5f" 
                  }}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 mr-1" fill="currentColor" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 mr-1" fill="currentColor" />
                      Escuchar
                    </>
                  )}
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                  className="rounded-full px-3 text-xs border-white/30 text-white hover:bg-white/10"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  Otro tip
                </Button>
              </div>
              <span className="text-xs text-white/60">
                {consejoIndex + 1} / {consejos.length}
              </span>
            </div>
          </div>

          {/* Lo que deben aprender - colapsable */}
          <div className="bg-slate-50 px-4 py-3">
            <button 
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
        </div>
      </CardContent>
    </Card>
  )
}
