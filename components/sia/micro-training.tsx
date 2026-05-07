"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Clock, Lightbulb, BookOpen } from "lucide-react"

// Contenido de micro-formacion segun el eje de la actividad del dia
const MICRO_FORMACION: Record<string, {
  titulo: string
  descripcion: string
  duracion: string
  puntosClave: string[]
  recurso?: string
}> = {
  CF: {
    titulo: "Como trabajar el sonido inicial",
    descripcion: "Tecnicas para que los ninos identifiquen el primer sonido de las palabras de forma ludica.",
    duracion: "2 min",
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
  
  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Micro-formacion
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "#f8fafc" }}>
          {/* Actividad del dia */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Para la actividad de hoy:</span>
          </div>
          
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-sm font-semibold leading-tight" style={{ color: "#1e3a5f" }}>
              {contenido.titulo}
            </h4>
            <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
              <Clock className="w-3 h-3" />
              <span>{contenido.duracion}</span>
            </div>
          </div>
          
          <p className="text-sm text-slate-600 leading-relaxed">
            {contenido.descripcion}
          </p>
          
          {/* Video placeholder */}
          <div className="relative aspect-video rounded-lg overflow-hidden flex items-center justify-center border"
               style={{ backgroundColor: "#1e3a5f10", borderColor: "#1e3a5f20" }}>
            <Button 
              size="lg" 
              className="relative z-10 rounded-full w-12 h-12 p-0 shadow-lg text-white"
              style={{ backgroundColor: "#1e3a5f" }}
              aria-label="Reproducir video"
            >
              <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
            </Button>
          </div>

          {/* Puntos clave */}
          <div className="pt-1 space-y-2">
            <h5 className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              Puntos clave
            </h5>
            <ul className="text-xs text-slate-700 space-y-1.5">
              {contenido.puntosClave.map((punto, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: "#f59e0b" }} />
                  <span>{punto}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
