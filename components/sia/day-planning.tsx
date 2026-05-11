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
  actividadActual?: string
  totalAlumnos?: number
  onActividadALBA?: (actividad: string) => void
}

interface BrainActivity {
  id:          string
  dia:         number
  semana?:     number
  titulo:      string
  descripcion: string
  objetivo:    string
  source:      "secuencia" | "alba-ia" | "demo"
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
    nombre: "Conocimiento del Texto - Lectura Dialogica y Cruz de Comprension",
    color: "#10b981",
    bgColor: "#ecfdf5",
    metodologia: "Lectura Dialogica + Cruz de Comprension",
    actividades: [
      // BLOQUE 1: Lectura Dialogica - Fundamentos (Semanas 1-8)
      { semana: 1, titulo: "LD: Antes de leer - Exploracion del libro", objetivo: "Activar conocimientos previos observando portada, titulo e ilustraciones", metodologia: "Lectura Dialogica - Antes" },
      { semana: 2, titulo: "LD: Antes de leer - Predicciones", objetivo: "Formular hipotesis sobre el contenido a partir de elementos paratextuales", metodologia: "Lectura Dialogica - Antes" },
      { semana: 3, titulo: "LD: Durante la lectura - Pausas dialogicas", objetivo: "Participar activamente con preguntas durante la lectura en voz alta", metodologia: "Lectura Dialogica - Durante" },
      { semana: 4, titulo: "LD: Durante la lectura - Vocabulario en contexto", objetivo: "Inferir significado de palabras nuevas usando el contexto", metodologia: "Lectura Dialogica - Durante" },
      { semana: 5, titulo: "LD: Despues de leer - Recontar", objetivo: "Recontar la historia usando sus propias palabras", metodologia: "Lectura Dialogica - Despues" },
      { semana: 6, titulo: "LD: Despues de leer - Conexiones", objetivo: "Conectar el texto con experiencias personales", metodologia: "Lectura Dialogica - Despues" },
      { semana: 7, titulo: "LD: Ciclo completo I", objetivo: "Aplicar las tres fases de lectura dialogica con un cuento", metodologia: "Lectura Dialogica - Ciclo Completo" },
      { semana: 8, titulo: "LD: Ciclo completo II", objetivo: "Aplicar lectura dialogica con texto informativo", metodologia: "Lectura Dialogica - Ciclo Completo" },
      // BLOQUE 2: Cruz de Comprension - Nivel Literal (Semanas 9-13)
      { semana: 9, titulo: "Cruz: Quien - Identificar personajes", objetivo: "Responder QUIEN usando evidencia del texto (comprension literal)", metodologia: "Cruz de Comprension - Literal" },
      { semana: 10, titulo: "Cruz: Que - Identificar acciones", objetivo: "Responder QUE sucede usando informacion explicita del texto", metodologia: "Cruz de Comprension - Literal" },
      { semana: 11, titulo: "Cruz: Donde - Identificar lugar", objetivo: "Responder DONDE ocurre la historia con evidencia textual", metodologia: "Cruz de Comprension - Literal" },
      { semana: 12, titulo: "Cruz: Cuando - Identificar tiempo", objetivo: "Responder CUANDO suceden los eventos del texto", metodologia: "Cruz de Comprension - Literal" },
      { semana: 13, titulo: "Cruz: Integracion literal", objetivo: "Usar las 4 preguntas de la cruz para comprension literal completa", metodologia: "Cruz de Comprension - Literal" },
      // BLOQUE 3: Cruz de Comprension - Nivel Inferencial (Semanas 14-18)
      { semana: 14, titulo: "Cruz: Por que - Causas", objetivo: "Inferir POR QUE suceden las cosas (causa-efecto)", metodologia: "Cruz de Comprension - Inferencial" },
      { semana: 15, titulo: "Cruz: Como - Procesos", objetivo: "Inferir COMO suceden las acciones y procesos", metodologia: "Cruz de Comprension - Inferencial" },
      { semana: 16, titulo: "Cruz: Para que - Propositos", objetivo: "Inferir PARA QUE se realizan las acciones (intencion)", metodologia: "Cruz de Comprension - Inferencial" },
      { semana: 17, titulo: "Cruz: Que pasaria si - Hipotesis", objetivo: "Formular hipotesis sobre situaciones alternativas", metodologia: "Cruz de Comprension - Inferencial" },
      { semana: 18, titulo: "Cruz: Integracion inferencial", objetivo: "Combinar preguntas inferenciales para comprension profunda", metodologia: "Cruz de Comprension - Inferencial" },
      // BLOQUE 4: Cruz de Comprension - Nivel Critico (Semanas 19-22)
      { semana: 19, titulo: "Cruz: Que opinas - Valoracion", objetivo: "Expresar opinion fundamentada sobre el texto", metodologia: "Cruz de Comprension - Critico" },
      { semana: 20, titulo: "Cruz: Esta bien o mal - Juicio", objetivo: "Emitir juicios eticos sobre acciones de personajes", metodologia: "Cruz de Comprension - Critico" },
      { semana: 21, titulo: "Cruz: Que harias tu - Aplicacion", objetivo: "Aplicar lo aprendido a situaciones propias", metodologia: "Cruz de Comprension - Critico" },
      { semana: 22, titulo: "Cruz: Integracion critica", objetivo: "Desarrollar pensamiento critico completo sobre textos", metodologia: "Cruz de Comprension - Critico" },
      // BLOQUE 5: Integracion LD + Cruz (Semanas 23-25)
      { semana: 23, titulo: "Integracion: LD + Cruz Literal", objetivo: "Combinar lectura dialogica con preguntas literales de la cruz", metodologia: "Integracion LD + Cruz" },
      { semana: 24, titulo: "Integracion: LD + Cruz Completa", objetivo: "Aplicar ambas metodologias en secuencia completa", metodologia: "Integracion LD + Cruz" },
      { semana: 25, titulo: "Evaluacion CT", objetivo: "Evaluar comprension usando Lectura Dialogica y Cruz de Comprension", metodologia: "Evaluacion" },
    ],
  },
  O: {
    nombre: "Oralidad - ECO Estructurado",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    metodologia: "ECO Estructurado (Escuchar-Comprender-Oralizar)",
    actividades: [
      // BLOQUE 1: ESCUCHAR - Desarrollo de la escucha activa (Semanas 1-8)
      { semana: 1, titulo: "ECO-E: Escucha de sonidos", objetivo: "Identificar y discriminar sonidos del entorno con atencion sostenida", metodologia: "ECO - Escuchar" },
      { semana: 2, titulo: "ECO-E: Escucha de voces", objetivo: "Reconocer voces familiares y sus caracteristicas", metodologia: "ECO - Escuchar" },
      { semana: 3, titulo: "ECO-E: Escucha de instrucciones simples", objetivo: "Seguir instrucciones de un paso con atencion", metodologia: "ECO - Escuchar" },
      { semana: 4, titulo: "ECO-E: Escucha de instrucciones complejas", objetivo: "Seguir instrucciones de dos o mas pasos", metodologia: "ECO - Escuchar" },
      { semana: 5, titulo: "ECO-E: Escucha de cuentos cortos", objetivo: "Mantener atencion durante narraciones breves", metodologia: "ECO - Escuchar" },
      { semana: 6, titulo: "ECO-E: Escucha de cuentos largos", objetivo: "Mantener atencion durante narraciones extensas", metodologia: "ECO - Escuchar" },
      { semana: 7, titulo: "ECO-E: Escucha selectiva", objetivo: "Identificar informacion especifica en un mensaje oral", metodologia: "ECO - Escuchar" },
      { semana: 8, titulo: "ECO-E: Escucha critica", objetivo: "Distinguir hechos de opiniones en mensajes orales", metodologia: "ECO - Escuchar" },
      // BLOQUE 2: COMPRENDER - Procesamiento del mensaje (Semanas 9-16)
      { semana: 9, titulo: "ECO-C: Vocabulario receptivo I", objetivo: "Comprender palabras nuevas en contexto oral", metodologia: "ECO - Comprender" },
      { semana: 10, titulo: "ECO-C: Vocabulario receptivo II", objetivo: "Ampliar vocabulario de categorias semanticas", metodologia: "ECO - Comprender" },
      { semana: 11, titulo: "ECO-C: Comprension literal oral", objetivo: "Responder preguntas sobre informacion explicita escuchada", metodologia: "ECO - Comprender" },
      { semana: 12, titulo: "ECO-C: Comprension inferencial oral", objetivo: "Inferir informacion no dicha explicitamente", metodologia: "ECO - Comprender" },
      { semana: 13, titulo: "ECO-C: Secuencia temporal", objetivo: "Ordenar eventos escuchados cronologicamente", metodologia: "ECO - Comprender" },
      { semana: 14, titulo: "ECO-C: Causa y efecto", objetivo: "Identificar relaciones causales en lo escuchado", metodologia: "ECO - Comprender" },
      { semana: 15, titulo: "ECO-C: Idea principal", objetivo: "Identificar el tema central de un mensaje oral", metodologia: "ECO - Comprender" },
      { semana: 16, titulo: "ECO-C: Detalles de apoyo", objetivo: "Identificar detalles que apoyan la idea principal", metodologia: "ECO - Comprender" },
      // BLOQUE 3: ORALIZAR - Produccion oral estructurada (Semanas 17-24)
      { semana: 17, titulo: "ECO-O: Nombrar y etiquetar", objetivo: "Producir vocabulario preciso para nombrar objetos y acciones", metodologia: "ECO - Oralizar" },
      { semana: 18, titulo: "ECO-O: Describir con estructura", objetivo: "Usar marcos de descripcion (es..., tiene..., sirve para...)", metodologia: "ECO - Oralizar" },
      { semana: 19, titulo: "ECO-O: Narrar con secuencia", objetivo: "Contar eventos usando primero, luego, despues, al final", metodologia: "ECO - Oralizar" },
      { semana: 20, titulo: "ECO-O: Explicar procesos", objetivo: "Explicar como hacer algo paso a paso con claridad", metodologia: "ECO - Oralizar" },
      { semana: 21, titulo: "ECO-O: Argumentar simple", objetivo: "Dar razones para apoyar una opinion (porque...)", metodologia: "ECO - Oralizar" },
      { semana: 22, titulo: "ECO-O: Dialogar con turnos", objetivo: "Participar en conversaciones respetando turnos y tema", metodologia: "ECO - Oralizar" },
      { semana: 23, titulo: "ECO-O: Exponer oralmente", objetivo: "Presentar un tema con introduccion, desarrollo y cierre", metodologia: "ECO - Oralizar" },
      { semana: 24, titulo: "ECO-O: Recontar elaborado", objetivo: "Recontar historias agregando detalles y emociones", metodologia: "ECO - Oralizar" },
      // BLOQUE 4: Integracion ECO (Semana 25)
      { semana: 25, titulo: "Evaluacion O: Ciclo ECO completo", objetivo: "Evaluar Escuchar-Comprender-Oralizar en actividad integrada", metodologia: "Evaluacion ECO" },
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
  const [ejeExpandido, setEjeExpandido] = useState<string | null>(null)
  const [tabActivo, setTabActivo] = useState<"CF" | "CT" | "O">("CF")

  if (!isOpen) return null

  const ejeActual = SECUENCIA_ANUAL[tabActivo]

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
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
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
          
          {/* Tabs de Ejes */}
          <div className="flex gap-2">
            {(Object.entries(SECUENCIA_ANUAL) as [string, typeof SECUENCIA_ANUAL.CF][]).map(([ejeId, eje]) => (
              <button
                key={ejeId}
                onClick={() => setTabActivo(ejeId as "CF" | "CT" | "O")}
                className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  tabActivo === ejeId 
                    ? "text-white shadow-lg" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                style={tabActivo === ejeId ? { backgroundColor: eje.color } : {}}
              >
                <span className="font-bold">{ejeId}</span>
                <span className="hidden sm:inline ml-1">
                  {ejeId === "CF" ? "- Conciencia Fonologica" : ejeId === "CT" ? "- Comprension de Textos" : "- Oralidad"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Info del eje seleccionado */}
        <div 
          className="px-5 py-3 border-b"
          style={{ backgroundColor: ejeActual.bgColor, borderColor: ejeActual.color + "30" }}
        >
          <p className="font-semibold text-sm" style={{ color: ejeActual.color }}>
            {ejeActual.nombre}
          </p>
          {ejeActual.metodologia && (
            <p className="text-xs mt-1" style={{ color: ejeActual.color + "cc" }}>
              Metodologia: {ejeActual.metodologia}
            </p>
          )}
        </div>

        {/* Content - Lista de actividades del eje seleccionado */}
        <div className="flex-1 overflow-y-auto">
          {ejeActual.actividades.map((act, idx) => {
            const esNuevoBloque = idx === 0 || 
              (act.metodologia && ejeActual.actividades[idx - 1]?.metodologia !== act.metodologia)
            
            return (
              <div key={idx}>
                {/* Separador de bloque/metodologia */}
                {esNuevoBloque && act.metodologia && (
                  <div 
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider border-t border-b"
                    style={{ 
                      backgroundColor: ejeActual.color + "10", 
                      color: ejeActual.color,
                      borderColor: ejeActual.color + "20"
                    }}
                  >
                    {act.metodologia}
                  </div>
                )}
                <div 
                  className="flex items-start gap-3 px-5 py-3 border-b hover:bg-slate-50 transition-colors"
                  style={{ borderColor: "#f1f5f9" }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: ejeActual.color }}
                  >
                    {act.semana}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800">{act.titulo}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{act.objetivo}</p>
                  </div>
                </div>
              </div>
            )
          })}
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
            {activity.source === "alba-ia" ? "Analisis IA" : activity.source === "secuencia" ? `Semana ${activity.semana || activity.dia}/25` : "Demo"}
          </span>
        )}
      </div>
      
      {/* Stats del dia con promedio */}
      {stats && stats.green + stats.yellow + stats.red > 0 && (
        <div className="space-y-2">
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">{stats.green} logrado</span>
            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">{stats.yellow} proceso</span>
            <span className="px-2 py-1 rounded-full bg-red-100 text-red-700">{stats.red} refuerzo</span>
          </div>
          {/* Promedio del dia */}
          {(() => {
            const total = stats.green + stats.yellow + stats.red
            const promedio = Math.round(((stats.green * 100) + (stats.yellow * 50) + (stats.red * 10)) / total)
            const colorPromedio = promedio >= 70 ? "text-green-600 bg-green-50" : promedio >= 40 ? "text-yellow-600 bg-yellow-50" : "text-red-600 bg-red-50"
            return (
              <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${colorPromedio}`}>
                Promedio de hoy: {promedio}% {promedio >= 70 ? "(Listo para avanzar)" : promedio >= 40 ? "(Consolidando)" : "(Necesita refuerzo)"}
              </div>
            )
          })()}
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

export function DayPlanning({ evaluaciones = {}, ejeActual = "CF", actividadActual = "", totalAlumnos = 0, onActividadALBA }: DayPlanningProps) {
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
          actividadActual,
          stats
        }),
      })
      const data = await res.json()
      setBrain(data.activity ?? null)
      // Notificar la actividad sugerida por ALBA al componente padre
      if (data.activity?.titulo && onActividadALBA) {
        onActividadALBA(data.activity.titulo)
      }
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
  }, [evaluaciones, ejeActual, actividadActual, stats, onActividadALBA])

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
