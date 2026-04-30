"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Printer, List } from "lucide-react"

export function DayPlanning() {
  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-primary">
            Planificación del día
          </CardTitle>
          <span className="text-sm font-medium px-3 py-1 bg-accent/10 text-accent rounded-full">
            Sonido /p/
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {/* Objective */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Objetivo del día</h4>
          <p className="text-sm text-foreground">
            Identificar y producir el sonido /p/ en posición inicial de palabra.
          </p>
        </div>

        {/* Activity */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Actividad sugerida</h4>
          <ol className="space-y-2 text-sm text-foreground">
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">1</span>
              <span>Mostrar imágenes de objetos que empiezan con /p/ (pato, pelota, pera).</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">2</span>
              <span>Practicar el sonido articulando frente al espejo.</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">3</span>
              <span>Juego de aplausos: aplaudir cuando escuchan una palabra con /p/.</span>
            </li>
          </ol>
        </div>

        {/* Teacher script */}
        <div className="bg-secondary/50 rounded-lg p-3">
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Para decir en clase</h4>
          <p className="text-sm text-foreground italic">
            {'"Hoy vamos a conocer un sonido muy especial: el sonido /p/. Miren cómo junto mis labios y soplo suavemente: ppp. ¡Ahora ustedes!"'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button className="flex-1 h-11" size="lg">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir fichas
          </Button>
          <Button variant="outline" className="flex-1 h-11" size="lg">
            <List className="w-4 h-4 mr-2" />
            Ver secuencia
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
