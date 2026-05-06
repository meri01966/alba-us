"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Printer, List, Plus, BookOpen } from "lucide-react"

interface Planning {
  id: string
  titulo: string
  objetivo: string
  actividad: string
  recursos: string
  fecha: string
}

export function DayPlanning() {
  const [planning, setPlanning] = useState<Planning | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    titulo: "",
    objetivo: "",
    actividad: "",
    recursos: "",
  })

  const fetchPlanning = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/planning")
      const data = await response.json()
      
      if (data.error) {
        setError(data.error)
      } else {
        setPlanning(data.planning)
        setError(null)
      }
    } catch {
      setError("Error al cargar la planificación")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlanning()
  }, [fetchPlanning])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    try {
      const response = await fetch("/api/planning", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
      
      const data = await response.json()
      
      if (data.success) {
        setPlanning(data.planning)
        setIsModalOpen(false)
        setFormData({ titulo: "", objetivo: "", actividad: "", recursos: "" })
      } else {
        setError(data.error || "Error al guardar")
      }
    } catch {
      setError("Error al guardar la planificación")
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Parse activity steps (split by newlines or numbered list)
  const parseActivitySteps = (actividad: string): string[] => {
    if (!actividad) return []
    return actividad
      .split(/\n|(?=\d+\.)/)
      .map(s => s.replace(/^\d+\.\s*/, "").trim())
      .filter(s => s.length > 0)
  }

  if (isLoading) {
    return (
      <Card className="h-full shadow-md">
        <CardContent className="flex items-center justify-center h-full min-h-[300px]">
          <Spinner className="text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-primary">
            Planificación del día
          </CardTitle>
          <div className="flex items-center gap-2">
            {planning && (
              <span className="text-sm font-medium px-3 py-1 bg-accent/10 text-accent rounded-full">
                {planning.titulo || "Sin título"}
              </span>
            )}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="h-8">
                  <Plus className="w-4 h-4 mr-1" />
                  Nueva Planificación
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Nueva Planificación
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <FieldGroup className="py-4">
                    <Field>
                      <FieldLabel htmlFor="titulo">Título de la actividad</FieldLabel>
                      <Input
                        id="titulo"
                        placeholder="Ej: Sonido /p/"
                        value={formData.titulo}
                        onChange={(e) => handleInputChange("titulo", e.target.value)}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="objetivo">Objetivo del día</FieldLabel>
                      <Textarea
                        id="objetivo"
                        placeholder="Ej: Identificar y producir el sonido /p/ en posición inicial de palabra."
                        value={formData.objetivo}
                        onChange={(e) => handleInputChange("objetivo", e.target.value)}
                        rows={2}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="actividad">Actividad sugerida</FieldLabel>
                      <Textarea
                        id="actividad"
                        placeholder="Escribí los pasos de la actividad (uno por línea o numerados)"
                        value={formData.actividad}
                        onChange={(e) => handleInputChange("actividad", e.target.value)}
                        rows={4}
                        required
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="recursos">Recursos</FieldLabel>
                      <Textarea
                        id="recursos"
                        placeholder="Ej: Imágenes de objetos, espejo, fichas imprimibles"
                        value={formData.recursos}
                        onChange={(e) => handleInputChange("recursos", e.target.value)}
                        rows={2}
                      />
                    </Field>
                  </FieldGroup>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                      disabled={isSaving}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Spinner className="w-4 h-4 mr-2" />
                          Guardando...
                        </>
                      ) : (
                        "Guardar"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            {error}
          </div>
        )}
        
        {!planning ? (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay planificación para hoy.</p>
            <p className="text-xs mt-1">Creá una nueva usando el botón de arriba.</p>
          </div>
        ) : (
          <>
            {/* Objective */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Objetivo del día</h4>
              <p className="text-sm text-foreground">
                {planning.objetivo || "Sin objetivo definido"}
              </p>
            </div>

            {/* Activity */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Actividad sugerida</h4>
              {parseActivitySteps(planning.actividad).length > 0 ? (
                <ol className="space-y-2 text-sm text-foreground">
                  {parseActivitySteps(planning.actividad).map((step, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted-foreground italic">Sin actividad definida</p>
              )}
            </div>

            {/* Resources */}
            {planning.recursos && (
              <div className="bg-secondary/50 rounded-lg p-3">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Recursos</h4>
                <p className="text-sm text-foreground">
                  {planning.recursos}
                </p>
              </div>
            )}

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
          </>
        )}
      </CardContent>
    </Card>
  )
}
