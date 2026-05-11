"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
import { Printer, List, Plus, BookOpen, BrainCircuit } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────

type StatusLevel = "green" | "yellow" | "red"

interface DayPlanningProps {
  evaluaciones?: Record<string, StatusLevel>
  ejeActual?: string
  totalAlumnos?: number
}

interface BrainActivity {
  id:          string
  dia:         number
  titulo:      string
  descripcion: string
  objetivo:    string
  source:      "airtable" | "demo" | "alba"
  ejeRecomendado?: string
  razon?: string
}

interface Planning {
  id:        string
  titulo:    string
  objetivo:  string
  actividad: string
  recursos:  string
  fecha:     string
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseSteps(text: string): string[] {
  if (!text) return []
  return text
    .split(/\n|(?=\d+\.)/)
    .map(s => s.replace(/^\d+\.\s*/, "").trim())
    .filter(s => s.length > 0)
}

// ── Sub-components ─────────────────────────────────────────────────────────

function BrainColumn({ activity, isLoading, stats }: { 
  activity: BrainActivity | null; 
  isLoading: boolean;
  stats?: { green: number; yellow: number; red: number; sinEvaluar: number };
}) {
  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <BrainCircuit className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-primary leading-tight">Sugerencia de ALBA</p>
        </div>
        {activity && (
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
            {activity.source === "alba" ? "Basado en datos" : activity.source === "demo" ? "Demo" : `Día ${activity.dia}`}
          </span>
        )}
      </div>
      
      {/* Stats del dia si hay */}
      {stats && stats.green + stats.yellow + stats.red > 0 && (
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">{stats.green} logrado</span>
          <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">{stats.yellow} proceso</span>
          <span className="px-2 py-1 rounded-full bg-red-100 text-red-700">{stats.red} refuerzo</span>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center flex-1 min-h-[120px]">
          <Spinner className="text-primary" />
        </div>
      ) : !activity ? (
        <div className="flex-1 flex items-center justify-center text-center text-muted-foreground text-sm py-6">
          Sin actividad disponible
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {activity.razon && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700">
              {activity.razon}
            </div>
          )}
          <div>
            <p className="text-base font-semibold text-foreground leading-snug">{activity.titulo}</p>
            {activity.ejeRecomendado && (
              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
                Eje: {activity.ejeRecomendado === "CF" ? "Conciencia Fonologica" : activity.ejeRecomendado === "CT" ? "Conocimiento del Texto" : "Oralidad"}
              </span>
            )}
          </div>
          {activity.objetivo && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Objetivo</p>
              <p className="text-sm text-foreground leading-relaxed">{activity.objetivo}</p>
            </div>
          )}
          {activity.descripcion && (
            <div className="bg-primary/5 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Actividad</p>
              <p className="text-sm text-foreground leading-relaxed">{activity.descripcion}</p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" className="flex-1 h-9 text-xs">
          <Printer className="w-3.5 h-3.5 mr-1.5" />
          Imprimir fichas
        </Button>
        <Button variant="outline" size="sm" className="flex-1 h-9 text-xs">
          <List className="w-3.5 h-3.5 mr-1.5" />
          Ver secuencia
        </Button>
      </div>
    </div>
  )
}

function MyPlanningColumn({
  planning,
  isLoading,
  onSaved,
}: {
  planning: Planning | null
  isLoading: boolean
  onSaved: (p: Planning) => void
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving]       = useState(false)
  const [saveError, setSaveError]     = useState<string | null>(null)
  const [formData, setFormData] = useState({
    titulo:    "",
    objetivo:  "",
    actividad: "",
    recursos:  "",
  })

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveError(null)
    try {
      const response = await fetch("/api/planning", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success && data.planning) {
        onSaved(data.planning)
        setIsModalOpen(false)
        setFormData({ titulo: "", objetivo: "", actividad: "", recursos: "" })
      } else {
        setSaveError(data.error || "Error al guardar")
      }
    } catch {
      setSaveError("Error al guardar la planificación")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4 h-4 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold text-accent leading-tight">Mi Planificación</p>
          <p className="text-xs text-muted-foreground">Carga del docente</p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="ml-auto h-7 text-xs px-2.5">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Nueva
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
                    onChange={e => handleInputChange("titulo", e.target.value)}
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="objetivo">Objetivo del día</FieldLabel>
                  <Textarea
                    id="objetivo"
                    placeholder="Ej: Identificar y producir el sonido /p/ en posición inicial de palabra."
                    value={formData.objetivo}
                    onChange={e => handleInputChange("objetivo", e.target.value)}
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
                    onChange={e => handleInputChange("actividad", e.target.value)}
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
                    onChange={e => handleInputChange("recursos", e.target.value)}
                    rows={2}
                  />
                </Field>
              </FieldGroup>
              {saveError && (
                <p className="text-sm text-destructive mb-3">{saveError}</p>
              )}
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

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center flex-1 min-h-[120px]">
          <Spinner className="text-accent" />
        </div>
      ) : !planning ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6 gap-2">
          <BookOpen className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No hay planificación cargada para hoy.</p>
          <p className="text-xs text-muted-foreground/70">
            Usá el botón <strong>Nueva</strong> para agregar una.
          </p>
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          <p className="text-base font-semibold text-foreground leading-snug">{planning.titulo}</p>
          {planning.objetivo && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Objetivo</p>
              <p className="text-sm text-foreground leading-relaxed">{planning.objetivo}</p>
            </div>
          )}
          {parseSteps(planning.actividad).length > 0 && (
            <div className="bg-accent/5 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Actividad</p>
              <ol className="space-y-1.5 text-sm text-foreground">
                {parseSteps(planning.actividad).map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-medium">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {planning.recursos && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Recursos</p>
              <p className="text-sm text-foreground leading-relaxed">{planning.recursos}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export function DayPlanning({ evaluaciones = {}, ejeActual = "CF", totalAlumnos = 0 }: DayPlanningProps) {
  const [brain,         setBrain]         = useState<BrainActivity | null>(null)
  const [isBrainLoading, setIsBrainLoading] = useState(true)

  const [planning,         setPlanning]         = useState<Planning | null>(null)
  const [isPlanningLoading, setIsPlanningLoading] = useState(true)

  // Calcular stats de las evaluaciones del dia
  const stats = useMemo(() => {
    const values = Object.values(evaluaciones)
    return {
      green: values.filter(v => v === "green").length,
      yellow: values.filter(v => v === "yellow").length,
      red: values.filter(v => v === "red").length,
      sinEvaluar: totalAlumnos - values.length,
    }
  }, [evaluaciones, totalAlumnos])

  // Fetch Cerebro Central con datos de evaluaciones
  const fetchBrain = useCallback(async () => {
    setIsBrainLoading(true)
    try {
      const res = await fetch("/api/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          evaluaciones, 
          ejeActual,
          stats 
        }),
      })
      const data = await res.json()
      setBrain(data.activity ?? null)
    } catch {
      // Fallback a GET si POST falla
      try {
        const res  = await fetch("/api/brain")
        const data = await res.json()
        setBrain(data.activity ?? null)
      } catch {
        setBrain(null)
      }
    } finally {
      setIsBrainLoading(false)
    }
  }, [evaluaciones, ejeActual, stats])

  // Fetch Mi Planificacion
  const fetchPlanning = useCallback(async () => {
    setIsPlanningLoading(true)
    try {
      const res  = await fetch("/api/planning")
      const data = await res.json()
      setPlanning(data.planning ?? null)
    } catch {
      setPlanning(null)
    } finally {
      setIsPlanningLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBrain()
    fetchPlanning()
  }, [fetchBrain, fetchPlanning])

  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary">
          Planificación del día
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {/* Left: Sugerencia SIA */}
          <div className="pb-4 sm:pb-0 sm:pr-4">
            <BrainColumn activity={brain} isLoading={isBrainLoading} stats={stats} />
          </div>
          {/* Right: Mi Planificacion */}
          <div className="pt-4 sm:pt-0 sm:pl-4">
            <MyPlanningColumn
              planning={planning}
              isLoading={isPlanningLoading}
              onSaved={setPlanning}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
