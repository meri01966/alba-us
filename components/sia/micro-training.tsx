"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, RefreshCw, Lightbulb } from "lucide-react"
import Image from "next/image"

// ========================================================================
// VIDEOS DE ALBA - Cuando los tengas de Canva, agregalos aca
// Formato: { id: "cf-1", url: "/videos/alba-cf-1.mp4" }
// ========================================================================
const VIDEOS_ALBA: Record<string, { url: string; poster?: string }[]> = {
  CF: [
    // { url: "/videos/alba-cf-1.mp4", poster: "/images/alba-saludando.jpg" },
    // { url: "/videos/alba-cf-2.mp4", poster: "/images/alba-pensando.jpg" },
  ],
  CT: [],
  O: []
}

// Consejos de ALBA segun el eje - en tono argentino, amigable
// ESTOS SON LOS TEXTOS PARA GRABAR EN CANVA
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

// Imagenes de ALBA segun el indice del consejo
const IMAGENES_ALBA = [
  "/images/alba-saludando.jpg",
  "/images/alba-pensando.jpg", 
  "/images/alba-entusiasmada.jpg",
  "/images/alba-personaje.jpg",
  "/images/alba-saludando.jpg"
]

interface MicroTrainingProps {
  ejeDelDia?: "CF" | "CT" | "O"
  actividadDelDia?: string
}

export function MicroTraining({ ejeDelDia = "CF" }: MicroTrainingProps) {
  const consejos = CONSEJOS_ALBA[ejeDelDia]
  const videos = VIDEOS_ALBA[ejeDelDia]
  const aprendizajes = QUE_DEBEN_APRENDER[ejeDelDia]
  
  const [consejoIndex, setConsejoIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showAprendizajes, setShowAprendizajes] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const consejoActual = consejos[consejoIndex]
  const videoActual = videos[consejoIndex]
  const imagenActual = IMAGENES_ALBA[consejoIndex % IMAGENES_ALBA.length]
  
  // Hay video disponible para este consejo?
  const tieneVideo = videoActual && videoActual.url

  // Refrescar consejo
  const handleRefresh = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    setIsPlaying(false)
    setConsejoIndex((prev) => (prev + 1) % consejos.length)
  }

  // Play/Pause video
  const handlePlayPause = () => {
    if (!videoRef.current) return
    
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  // Cuando termina el video
  const handleVideoEnd = () => {
    setIsPlaying(false)
  }
  
  return (
    <Card className="h-full shadow-md overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Micro capacitacion just in time
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#1e3a5f" }}>
          
          {/* Area del video o imagen */}
          <div className="relative">
            {tieneVideo ? (
              // VIDEO DE CANVA
              <div className="relative aspect-video bg-slate-900">
                <video
                  ref={videoRef}
                  src={videoActual.url}
                  poster={videoActual.poster || imagenActual}
                  onEnded={handleVideoEnd}
                  className="w-full h-full object-cover"
                  playsInline
                />
                {/* Boton play overlay */}
                {!isPlaying && (
                  <button
                    onClick={handlePlayPause}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 transition-all hover:bg-black/40"
                  >
                    <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center">
                      <Play className="w-8 h-8 text-slate-800 ml-1" fill="currentColor" />
                    </div>
                  </button>
                )}
              </div>
            ) : (
              // IMAGEN + TEXTO (fallback hasta que tengas los videos)
              <div className="p-4">
                <div className="flex gap-3">
                  {/* Avatar de ALBA */}
                  <div className="relative flex-shrink-0">
                    <div 
                      className="w-16 h-16 rounded-full overflow-hidden"
                      style={{ borderColor: "#fbbf24", borderWidth: "3px" }}
                    >
                      <Image 
                        src={imagenActual}
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
            )}
            
            {/* Botones de control */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50">
              <div className="flex gap-2">
                {tieneVideo && (
                  <Button 
                    size="sm"
                    onClick={handlePlayPause}
                    className="rounded-full px-3 text-xs"
                    style={{ backgroundColor: "#fbbf24", color: "#1e3a5f" }}
                  >
                    {isPlaying ? (
                      <><Pause className="w-3.5 h-3.5 mr-1" fill="currentColor" />Pausar</>
                    ) : (
                      <><Play className="w-3.5 h-3.5 mr-1" fill="currentColor" />Ver</>
                    )}
                  </Button>
                )}
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
