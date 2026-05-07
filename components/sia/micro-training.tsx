"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Pause, Clock, Lightbulb, BookOpen, Volume2, Mic } from "lucide-react"
import Image from "next/image"

// Contenido de micro-formacion segun el eje de la actividad del dia
const MICRO_FORMACION: Record<string, {
  titulo: string
  descripcion: string
  duracion: string
  puntosClave: string[]
  imagen: string
  audioTexto: string
}> = {
  CF: {
    titulo: "Como trabajar el sonido inicial",
    descripcion: "Tecnicas para que los ninos identifiquen el primer sonido de las palabras de forma ludica.",
    duracion: "2 min",
    imagen: "/images/micro-formacion-cf.jpg",
    audioTexto: "Para trabajar el sonido inicial, exagera el primer sonido cuando digas la palabra. Por ejemplo, di 'Mmmmmanzana' alargando la M. Usa imagenes de objetos que empiecen igual y juega a 'Veo veo algo que empieza con M'. Los ninos aprenden mejor cuando el sonido se destaca de forma divertida.",
    puntosClave: [
      "Exagerar el sonido inicial al pronunciar la palabra",
      "Usar imagenes de objetos que empiecen igual",
      "Jugar a 'Veo veo algo que empieza con...'"
    ]
  },
  CT: {
    titulo: "Lectura compartida efectiva",
    descripcion: "Como leer cuentos para desarrollar comprension y vocabulario.",
    duracion: "3 min",
    imagen: "/images/micro-formacion-ct.jpg",
    audioTexto: "Durante la lectura compartida, muestra las imagenes mientras lees para que los ninos conecten la historia con lo visual. Haz pausas y pregunta que creen que pasara, esto activa su imaginacion. Relaciona la historia con sus experiencias: si el cuento habla de un perro, pregunta quien tiene mascota en casa.",
    puntosClave: [
      "Mostrar las imagenes mientras lees",
      "Hacer pausas para preguntar que creen que pasara",
      "Relacionar la historia con experiencias de los ninos"
    ]
  },
  O: {
    titulo: "Estimular la expresion oral",
    descripcion: "Estrategias para que los ninos se expresen con confianza.",
    duracion: "2 min",
    imagen: "/images/micro-formacion-o.jpg",
    audioTexto: "Para estimular la oralidad, haz preguntas abiertas en lugar de preguntas de si o no. En vez de preguntar 'Te gusto el cuento?', pregunta 'Que parte te gusto mas?'. Da tiempo para que piensen antes de responder y amplía lo que dicen: si un nino dice 'Vi perro', tu responde 'Ah, viste un perro grande! Donde lo viste?'",
    puntosClave: [
      "Hacer preguntas abiertas, no de si/no",
      "Dar tiempo para que piensen antes de responder",
      "Ampliar lo que dicen: 'Ah, viste un perro grande!'"
    ]
  }
}

interface MicroTrainingProps {
  ejeDelDia?: "CF" | "CT" | "O"
  actividadDelDia?: string
}

export function MicroTraining({ ejeDelDia = "CF", actividadDelDia = "Reconocimiento de Sonido Inicial /M/" }: MicroTrainingProps) {
  const contenido = MICRO_FORMACION[ejeDelDia]
  const [isPlaying, setIsPlaying] = useState(false)
  const [showText, setShowText] = useState(false)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  const handlePlayAudio = () => {
    if (isPlaying) {
      // Detener
      window.speechSynthesis.cancel()
      setIsPlaying(false)
    } else {
      // Reproducir usando Web Speech API
      const utterance = new SpeechSynthesisUtterance(contenido.audioTexto)
      utterance.lang = "es-AR"
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.onend = () => setIsPlaying(false)
      speechRef.current = utterance
      window.speechSynthesis.speak(utterance)
      setIsPlaying(true)
    }
  }
  
  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Micro-formacion
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#f8fafc" }}>
          
          {/* Imagen con overlay de audio */}
          <div className="relative aspect-video">
            <Image 
              src={contenido.imagen} 
              alt={contenido.titulo}
              fill
              className="object-cover"
            />
            {/* Overlay oscuro */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            
            {/* Contenido sobre la imagen */}
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Tip para hoy</span>
              </div>
              <h4 className="text-white font-semibold text-sm leading-tight mb-3">
                {contenido.titulo}
              </h4>
              
              {/* Boton de audio */}
              <div className="flex items-center gap-2">
                <Button 
                  size="sm"
                  onClick={handlePlayAudio}
                  className="rounded-full px-4 text-white flex items-center gap-2"
                  style={{ backgroundColor: isPlaying ? "#f59e0b" : "#1e3a5f" }}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" fill="currentColor" />
                      <span className="text-xs">Pausar</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span className="text-xs">Escuchar</span>
                    </>
                  )}
                </Button>
                <span className="text-white/70 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {contenido.duracion}
                </span>
              </div>
            </div>
          </div>

          {/* Puntos clave colapsables */}
          <div className="p-3">
            <button 
              onClick={() => setShowText(!showText)}
              className="w-full text-left flex items-center justify-between text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              <span className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5" />
                {showText ? "Ocultar puntos clave" : "Ver puntos clave"}
              </span>
              <span className="text-slate-400">{showText ? "−" : "+"}</span>
            </button>
            
            {showText && (
              <ul className="mt-3 text-xs text-slate-700 space-y-2">
                {contenido.puntosClave.map((punto, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: "#f59e0b" }} />
                    <span>{punto}</span>
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
