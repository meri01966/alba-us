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
import { Printer, List, Plus, BookOpen, BrainCircuit, X, ChevronDown, ChevronRight } from "lucide-react"

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

// ── Secuencia Anual de Actividades por Eje ─────────────────────────────────

const SECUENCIA_ANUAL = {
  CF: {
    nombre: "Conciencia Fonologica",
    color: "#3b82f6",
    bgColor: "#eff6ff",
    actividades: [
      { semana: 1, titulo: "Sonidos del entorno", objetivo: "Discriminar sonidos ambientales y asociarlos a su fuente" },
      { semana: 2, titulo: "Rimas y canciones", objetivo: "Identificar palabras que riman en canciones conocidas" },
      { semana: 3, titulo: "Segmentacion silabica", objetivo: "Separar palabras en silabas usando palmadas" },
      { semana: 4, titulo: "Sonido inicial /a/", objetivo: "Identificar palabras que comienzan con el sonido /a/" },
      { semana: 5, titulo: "Sonido inicial /e/", objetivo: "Identificar palabras que comienzan con el sonido /e/" },
      { semana: 6, titulo: "Sonido inicial /i/", objetivo: "Identificar palabras que comienzan con el sonido /i/" },
      { semana: 7, titulo: "Sonido inicial /o/", objetivo: "Identificar palabras que comienzan con el sonido /o/" },
      { semana: 8, titulo: "Sonido inicial /u/", objetivo: "Identificar palabras que comienzan con el sonido /u/" },
      { semana: 9, titulo: "Vocales - Repaso", objetivo: "Consolidar identificacion de sonidos vocalicos iniciales" },
      { semana: 10, titulo: "Sonido inicial /m/", objetivo: "Identificar palabras que comienzan con el sonido /m/" },
      { semana: 11, titulo: "Sonido inicial /p/", objetivo: "Identificar palabras que comienzan con el sonido /p/" },
      { semana: 12, titulo: "Sonido inicial /s/", objetivo: "Identificar palabras que comienzan con el sonido /s/" },
      { semana: 13, titulo: "Sonido inicial /l/", objetivo: "Identificar palabras que comienzan con el sonido /l/" },
      { semana: 14, titulo: "Sonido inicial /t/", objetivo: "Identificar palabras que comienzan con el sonido /t/" },
      { semana: 15, titulo: "Sonido inicial /n/", objetivo: "Identificar palabras que comienzan con el sonido /n/" },
      { semana: 16, titulo: "Consonantes - Repaso", objetivo: "Consolidar identificacion de sonidos consonanticos" },
      { semana: 17, titulo: "Sonido final", objetivo: "Identificar el sonido final de palabras cortas" },
      { semana: 18, titulo: "Sonidos medios", objetivo: "Identificar sonidos en posicion media de palabras" },
      { semana: 19, titulo: "Sintesis de fonemas", objetivo: "Unir fonemas para formar palabras simples" },
      { semana: 20, titulo: "Analisis de fonemas", objetivo: "Descomponer palabras en sus fonemas individuales" },
      { semana: 21, titulo: "Sustitucion de fonemas", objetivo: "Cambiar un fonema para crear palabras nuevas" },
      { semana: 22, titulo: "Omision de fonemas", objetivo: "Identificar que palabra queda al quitar un fonema" },
      { semana: 23, titulo: "Adicion de fonemas", objetivo: "Agregar fonemas para crear palabras nuevas" },
      { semana: 24, titulo: "Manipulacion avanzada", objetivo: "Realizar operaciones complejas con fonemas" },
      { semana: 25, titulo: "Evaluacion CF", objetivo: "Evaluar el dominio de la conciencia fonologica" },
    ],
  },
  CT: {
    nombre: "Conocimiento del Texto",
    color: "#10b981",
    bgColor: "#ecfdf5",
    actividades: [
      { semana: 1, titulo: "El libro como objeto", objetivo: "Explorar las partes del libro (tapa, contratapa, lomo)" },
      { semana: 2, titulo: "Direccionalidad", objetivo: "Comprender que leemos de izquierda a derecha y arriba a abajo" },
      { semana: 3, titulo: "Titulo y autor", objetivo: "Identificar el titulo y autor de un libro" },
      { semana: 4, titulo: "Portada e ilustraciones", objetivo: "Relacionar imagenes con el contenido del texto" },
      { semana: 5, titulo: "Diferencia texto/imagen", objetivo: "Distinguir entre lo que se lee y lo que se mira" },
      { semana: 6, titulo: "Funcion del texto", objetivo: "Comprender que el texto transmite un mensaje" },
      { semana: 7, titulo: "Tipos de texto: cuento", objetivo: "Reconocer caracteristicas de los cuentos" },
      { semana: 8, titulo: "Tipos de texto: poesia", objetivo: "Reconocer caracteristicas de las poesias" },
      { semana: 9, titulo: "Tipos de texto: receta", objetivo: "Reconocer caracteristicas de las recetas" },
      { semana: 10, titulo: "Tipos de texto: carta", objetivo: "Reconocer caracteristicas de las cartas" },
      { semana: 11, titulo: "Tipos de texto: noticia", objetivo: "Reconocer caracteristicas de las noticias" },
      { semana: 12, titulo: "Tipos de texto: instructivo", objetivo: "Reconocer caracteristicas de los instructivos" },
      { semana: 13, titulo: "Palabra y oracion", objetivo: "Diferenciar palabras de oraciones" },
      { semana: 14, titulo: "Espacios entre palabras", objetivo: "Reconocer que las palabras se separan con espacios" },
      { semana: 15, titulo: "Signos de puntuacion", objetivo: "Identificar punto, coma y signos de pregunta" },
      { semana: 16, titulo: "Mayusculas", objetivo: "Reconocer el uso de mayusculas al inicio" },
      { semana: 17, titulo: "Lectura compartida I", objetivo: "Participar activamente en lectura guiada" },
      { semana: 18, titulo: "Lectura compartida II", objetivo: "Anticipar contenido a partir del titulo" },
      { semana: 19, titulo: "Lectura compartida III", objetivo: "Hacer predicciones durante la lectura" },
      { semana: 20, titulo: "Comprension literal", objetivo: "Responder preguntas sobre informacion explicita" },
      { semana: 21, titulo: "Comprension inferencial", objetivo: "Inferir informacion no explicita del texto" },
      { semana: 22, titulo: "Secuencia narrativa", objetivo: "Ordenar eventos de una historia" },
      { semana: 23, titulo: "Personajes", objetivo: "Identificar personajes principales y secundarios" },
      { semana: 24, titulo: "Ambiente y tiempo", objetivo: "Identificar donde y cuando ocurre la historia" },
      { semana: 25, titulo: "Evaluacion CT", objetivo: "Evaluar el conocimiento del texto impreso" },
    ],
  },
  O: {
    nombre: "Oralidad",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    actividades: [
      { semana: 1, titulo: "Presentacion personal", objetivo: "Presentarse diciendo nombre y algo que les gusta" },
      { semana: 2, titulo: "Escucha activa", objetivo: "Practicar escuchar sin interrumpir" },
      { semana: 3, titulo: "Turnos de habla", objetivo: "Respetar turnos en una conversacion" },
      { semana: 4, titulo: "Vocabulario cotidiano", objetivo: "Ampliar vocabulario de objetos del aula" },
      { semana: 5, titulo: "Vocabulario: familia", objetivo: "Ampliar vocabulario relacionado con la familia" },
      { semana: 6, titulo: "Vocabulario: cuerpo", objetivo: "Ampliar vocabulario de partes del cuerpo" },
      { semana: 7, titulo: "Vocabulario: alimentos", objetivo: "Ampliar vocabulario de alimentos" },
      { semana: 8, titulo: "Vocabulario: animales", objetivo: "Ampliar vocabulario de animales" },
      { semana: 9, titulo: "Descripcion de objetos", objetivo: "Describir objetos usando adjetivos simples" },
      { semana: 10, titulo: "Descripcion de personas", objetivo: "Describir personas usando caracteristicas fisicas" },
      { semana: 11, titulo: "Descripcion de lugares", objetivo: "Describir lugares usando vocabulario espacial" },
      { semana: 12, titulo: "Narracion de experiencias", objetivo: "Contar una experiencia personal con secuencia" },
      { semana: 13, titulo: "Recontar un cuento", objetivo: "Recontar un cuento escuchado con sus propias palabras" },
      { semana: 14, titulo: "Crear finales alternativos", objetivo: "Inventar finales diferentes para cuentos" },
      { semana: 15, titulo: "Dialogos", objetivo: "Participar en dialogos simples con compañeros" },
      { semana: 16, titulo: "Preguntas y respuestas", objetivo: "Formular y responder preguntas" },
      { semana: 17, titulo: "Expresion de emociones", objetivo: "Expresar como se sienten usando palabras" },
      { semana: 18, titulo: "Expresion de opiniones", objetivo: "Dar opiniones simples sobre temas conocidos" },
      { semana: 19, titulo: "Instrucciones orales", objetivo: "Dar y seguir instrucciones simples" },
      { semana: 20, titulo: "Explicar procedimientos", objetivo: "Explicar como hacer algo paso a paso" },
      { semana: 21, titulo: "Recitar poesias", objetivo: "Memorizar y recitar poesias cortas" },
      { semana: 22, titulo: "Dramatizacion", objetivo: "Participar en dramatizaciones simples" },
      { semana: 23, titulo: "Exposicion oral", objetivo: "Hacer una breve exposicion sobre un tema" },
      { semana: 24, titulo: "Debate guiado", objetivo: "Participar en debates simples con argumentos" },
      { semana: 25, titulo: "Evaluacion O", objetivo: "Evaluar las habilidades de comunicacion oral" },
    ],
  },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseSteps(text: string): string[] {
  if (!text) return []
  return text
    .split(/\n|(?=\d+\.)/)
    .map(s => s.replace(/^\d+\.\s*/, "").trim())
    .filter(s => s.length > 0)
}

// ── Secuencia Modal Component ──────────────────────────────────────────────

function SecuenciaModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [ejeExpandido, setEjeExpandido] = useState<string | null>("CF")

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
              Secuencia Anual ALBA
            </h2>
            <p className="text-sm text-slate-500">25 semanas de actividades por eje</p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-4">
            {Object.entries(SECUENCIA_ANUAL).map(([ejeId, eje]) => (
              <div 
                key={ejeId} 
                className="border rounded-xl overflow-hidden"
                style={{ borderColor: eje.color + "40" }}
              >
                {/* Eje Header - Clickeable */}
                <button
                  onClick={() => setEjeExpandido(ejeExpandido === ejeId ? null : ejeId)}
                  className="w-full p-4 flex items-center gap-3 transition-colors hover:opacity-90"
                  style={{ backgroundColor: eje.bgColor }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: eje.color }}
                  >
                    {ejeId}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold" style={{ color: eje.color }}>{eje.nombre}</p>
                    <p className="text-xs text-slate-500">{eje.actividades.length} actividades</p>
                  </div>
                  {ejeExpandido === ejeId ? (
                    <ChevronDown className="w-5 h-5" style={{ color: eje.color }} />
                  ) : (
                    <ChevronRight className="w-5 h-5" style={{ color: eje.color }} />
                  )}
                </button>

                {/* Lista de Actividades */}
                {ejeExpandido === ejeId && (
                  <div className="border-t" style={{ borderColor: eje.color + "20" }}>
                    <div className="max-h-80 overflow-y-auto">
                      {eje.actividades.map((act, idx) => (
                        <div 
                          key={idx}
                          className="flex items-start gap-3 p-3 border-b last:border-b-0 hover:bg-slate-50 transition-colors"
                          style={{ borderColor: eje.color + "10" }}
                        >
                          <div 
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                            style={{ backgroundColor: eje.color }}
                          >
                            {act.semana}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-slate-800">{act.titulo}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{act.objetivo}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cerrar
            </Button>
            <Button className="flex-1" style={{ backgroundColor: "#1e3a5f" }}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Secuencia
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function BrainColumn({ activity, isLoading, stats }: { 
  activity: BrainActivity | null; 
  isLoading: boolean;
  stats?: { green: number; yellow: number; red: number; sinEvaluar: number };
}) {
  const [showSecuencia, setShowSecuencia] = useState(false)
  
  return (
    <>
    <SecuenciaModal isOpen={showSecuencia} onClose={() => setShowSecuencia(false)} />
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
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 h-9 text-xs"
          onClick={() => setShowSecuencia(true)}
        >
          <List className="w-3.5 h-3.5 mr-1.5" />
          Ver secuencia
        </Button>
      </div>
    </div>
    </>
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
