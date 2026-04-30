"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Clock } from "lucide-react"

export function MicroTraining() {
  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary">
          Micro-formación Just-in-Time
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-secondary/30 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <h4 className="text-sm font-semibold text-foreground leading-tight">
              Cómo modelar el sonido /p/
            </h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
              <Clock className="w-3 h-3" />
              <span>90 seg</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            Antes de iniciar la clase, repasá la técnica de articulación y mediación fonológica.
          </p>
          
          {/* Video placeholder */}
          <div className="relative aspect-video bg-primary/5 rounded-lg overflow-hidden flex items-center justify-center border border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10" />
            <Button 
              size="lg" 
              className="relative z-10 rounded-full w-14 h-14 p-0 shadow-lg bg-accent hover:bg-accent/90"
              aria-label="Reproducir video"
            >
              <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
            </Button>
          </div>

          {/* Tips section */}
          <div className="pt-2 space-y-2">
            <h5 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Puntos clave
            </h5>
            <ul className="text-xs text-foreground space-y-1">
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                <span>Labios juntos, luego abrir con un pequeño soplo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                <span>Sin vibración en las cuerdas vocales</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                <span>Usar espejo para que los niños vean la articulación</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
