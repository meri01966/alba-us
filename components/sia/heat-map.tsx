"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, AlertCircle, BookOpen, X, RotateCcw, Edit3, Check, Send, Star } from "lucide-react"

type StatusLevel = "green" | "yellow" | "red"

interface Student {
  id: string
  name?: string
  nombre?: string
}

export interface RegistroCierre {
  actividadALBA: string
  actividadDocente: string
  eje: string
  evaluacionGeneral: "excelente" | "buena" | "regular" | "necesita_mejora"
  observaciones: string
  sugerenciaParaIA: string
  stats: { green: number; yellow: number; red: number }
}

// Colores por eje
const EJE_COLORS: Record<string, { color: string; bgColor: string; nombre: string }> = {
  CF: { color: "#3b82f6", bgColor: "#eff6ff", nombre: "Conciencia Fonologica" },
  CT: { color: "#10b981", bgColor: "#ecfdf5", nombre: "Comprension de Textos" },
  O: { color: "#f59e0b", bgColor: "#fffbeb", nombre: "Oralidad" },
}

interface HeatMapProps {
  students: Student[]
  evaluaciones?: Record<string, StatusLevel>
  onEvaluacion?: (studentId: string, status: StatusLevel, actividad: string, eje: string) => void
  onClearEvaluacion?: (studentId: string) => void
  onClearAllEvaluaciones?: () => void
  onActividadChange?: (actividad: string, eje: string) => void
  onRegistroCierre?: (registro: RegistroCierre) => void
  actividadSugeridaALBA?: string
  ejeDeALBA?: string // Eje decidido por ALBA
  isLoading?: boolean
}

// Actividades sugeridas por eje (de la secuencia ALBA)
const ACTIVIDADES_SUGERIDAS: Record<string, string[]> = {
  CF: [
    "Reconocimiento de Sonido Inicial /M/",
    "Segmentacion silabica con palmadas",
    "Rimas y canciones",
    "Sonido inicial /A/",
    "Sonido inicial /E/",
  ],
  CT: [
    "Lectura Dialogica: Antes de leer",
    "Cruz de Comprension: QUIEN",
    "Cruz de Comprension: QUE",
    "Lectura Dialogica: Durante",
    "Cruz de Comprension: POR QUE",
  ],
  O: [
    "ECO: Escucha de instrucciones",
    "ECO: Comprension literal oral",
    "ECO: Narrar con secuencia",
    "ECO: Describir con estructura",
    "ECO: Vocabulario receptivo",
  ],
}

const EVAL_OPTIONS: {
  value: StatusLevel
  label: string
  nivelCompetencia: string
  icon: React.ElementType
  activeStyle: React.CSSProperties
  inactiveStyle: React.CSSProperties
}[] = [
  {
    value: "green",
    label: "Logrado",
    nivelCompetencia: "Nivel Avanzado",
    icon: CheckCircle2,
    activeStyle: { backgroundColor: "#10b981", color: "#fff", borderColor: "#10b981" },
    inactiveStyle: { backgroundColor: "#d1fae5", color: "#10b981", borderColor: "#6ee7b7" },
  },
  {
    value: "yellow",
    label: "En proceso",
    nivelCompetencia: "Nivel Intermedio",
    icon: Clock,
    activeStyle: { backgroundColor: "#fbbf24", color: "#fff", borderColor: "#fbbf24" },
    inactiveStyle: { backgroundColor: "#fef3c7", color: "#d97706", borderColor: "#fcd34d" },
  },
  {
    value: "red",
    label: "Refuerzo",
    nivelCompetencia: "Requiere Apoyo",
    icon: AlertCircle,
    activeStyle: { backgroundColor: "#ef4444", color: "#fff", borderColor: "#ef4444" },
    inactiveStyle: { backgroundColor: "#fee2e2", color: "#ef4444", borderColor: "#fca5a5" },
  },
]

// Obtener color del estado
function getStatusColor(status: StatusLevel | null): string {
  if (status === "green") return "#10b981"
  if (status === "yellow") return "#fbbf24"
  if (status === "red") return "#ef4444"
  return "#94a3b8" // gris para sin evaluar
}

function getStatusBg(status: StatusLevel | null): string {
  if (status === "green") return "#ecfdf5"
  if (status === "yellow") return "#fef3c7"
  if (status === "red") return "#fef2f2"
  return "#f1f5f9" // gris claro para sin evaluar
}

function StudentRow({
  student,
  currentStatus,
  saving,
  onEval,
  onClear,
}: {
  student: Student
  currentStatus: StatusLevel | null
  saving: boolean
  onEval: (status: StatusLevel) => void
  onClear?: () => void
}) {
  const studentName = student.name || student.nombre || "Sin nombre"
  const statusColor = getStatusColor(currentStatus)
  const statusBg = getStatusBg(currentStatus)
  
  return (
    <li 
      className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors"
      style={{ 
        backgroundColor: statusBg,
        border: `2px solid ${statusColor}40`
      }}
    >
      {/* Indicador de estado */}
      <div 
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: statusColor }}
        title={currentStatus ? `Estado: ${currentStatus}` : "Sin evaluar"}
      />
      <span className="text-sm font-semibold text-foreground flex-1 truncate">
        {studentName}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        {EVAL_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isChosen = currentStatus === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onEval(opt.value)}
              disabled={saving}
              title={`${opt.label} - ${opt.nivelCompetencia}`}
              style={isChosen ? opt.activeStyle : opt.inactiveStyle}
              className="flex items-center justify-center w-8 h-8 rounded-lg border transition-all hover:scale-110 disabled:opacity-50"
            >
              <Icon className="w-4 h-4" />
            </button>
          )
        })}
        {/* Boton para quitar evaluacion */}
        {currentStatus && onClear && (
          <button
            onClick={onClear}
            disabled={saving}
            title="Quitar evaluacion"
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all hover:scale-110 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {saving && <Spinner className="w-4 h-4 text-primary" />}
      </div>
    </li>
  )
}

export function HeatMap({ students = [], evaluaciones = {}, onEvaluacion, onClearEvaluacion, onClearAllEvaluaciones, onActividadChange, onRegistroCierre, actividadSugeridaALBA = "", ejeDeALBA = "CF", isLoading = false }: HeatMapProps) {
  const [savingId, setSavingId] = useState<string | null>(null)
  const [actividadDelDia, setActividadDelDia] = useState(actividadSugeridaALBA || ACTIVIDADES_SUGERIDAS.CF[0])
  const [editandoActividad, setEditandoActividad] = useState(false)
  const [actividadTemporal, setActividadTemporal] = useState("")
  
  // El eje viene de ALBA (no se selecciona manualmente)
  const selectedEje = ejeDeALBA
  
  // Estado para Registro de Cierre
  const [mostrarCierre, setMostrarCierre] = useState(false)
  const [cierreEvaluacion, setCierreEvaluacion] = useState<"excelente" | "buena" | "regular" | "necesita_mejora" | null>(null)
  const [cierreObservaciones, setCierreObservaciones] = useState("")
  const [cierreSugerencia, setCierreSugerencia] = useState("")
  const [enviandoCierre, setEnviandoCierre] = useState(false)
  
  // Actualizar actividad cuando cambia la sugerida por ALBA
  useEffect(() => {
    if (actividadSugeridaALBA && !editandoActividad) {
      setActividadDelDia(actividadSugeridaALBA)
    }
  }, [actividadSugeridaALBA, editandoActividad])
  
  // Guardar actividad personalizada
  const guardarActividad = () => {
    if (actividadTemporal.trim()) {
      setActividadDelDia(actividadTemporal.trim())
      if (onActividadChange) {
        onActividadChange(actividadTemporal.trim(), selectedEje)
      }
    }
    setEditandoActividad(false)
  }
  
  // Seleccionar actividad sugerida
  const seleccionarActividadSugerida = (actividad: string) => {
    setActividadDelDia(actividad)
    setEditandoActividad(false)
    if (onActividadChange) {
      onActividadChange(actividad, selectedEje)
    }
  }
  
  // Calcular stats actuales
  const calcularStats = () => {
    let green = 0, yellow = 0, red = 0
    students.forEach(s => {
      const status = evaluaciones[s.id]
      if (status === "green") green++
      else if (status === "yellow") yellow++
      else if (status === "red") red++
    })
    return { green, yellow, red }
  }
  
  // Enviar registro de cierre
  const enviarRegistroCierre = async () => {
    if (!cierreEvaluacion) return
    
    setEnviandoCierre(true)
    const stats = calcularStats()
    
    const registro: RegistroCierre = {
      actividadALBA: actividadSugeridaALBA || "",
      actividadDocente: actividadDelDia,
      eje: selectedEje,
      evaluacionGeneral: cierreEvaluacion,
      observaciones: cierreObservaciones,
      sugerenciaParaIA: cierreSugerencia,
      stats,
    }
    
    if (onRegistroCierre) {
      await onRegistroCierre(registro)
    }
    
    // Limpiar formulario
    setMostrarCierre(false)
    setCierreEvaluacion(null)
    setCierreObservaciones("")
    setCierreSugerencia("")
    setEnviandoCierre(false)
  }

  // Si no hay estudiantes y no esta cargando, retornar null
  if (!isLoading && (!students || students.length === 0)) {
    return null
  }

  async function handleEval(student: Student, status: StatusLevel) {
    setSavingId(student.id)

    if (onEvaluacion) {
      // Enviar actividad Y eje al guardar la evaluacion
      onEvaluacion(student.id, status, actividadDelDia, selectedEje)
    }
    
    setSavingId(null)
  }

  function handleClear(studentId: string) {
    if (onClearEvaluacion) {
      onClearEvaluacion(studentId)
    }
  }

  function handleClearAll() {
    if (confirm("Estas seguro de borrar todas las evaluaciones de hoy?")) {
      if (onClearAllEvaluaciones) {
        onClearAllEvaluaciones()
      }
    }
  }

  const getStudentStatus = (studentId: string): StatusLevel | null => {
    return evaluaciones[studentId] || null
  }
  
  const evaluadosCount = students.filter(s => getStudentStatus(s.id) !== null).length

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <CardTitle className="text-base font-semibold text-primary">
            Registro del aula
          </CardTitle>
          <div className="flex items-center gap-2">
            {evaluadosCount > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
                title="Borrar todas las evaluaciones"
              >
                <RotateCcw className="w-3 h-3" />
                Limpiar
              </button>
            )}
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: "#ecfdf5", color: "#065f46" }}
            >
              {evaluadosCount}/{students.length}
            </span>
          </div>
        </div>

        {/* Banner de actividad del dia - El eje viene de ALBA */}
        <div
          className="rounded-xl p-3 flex flex-col gap-2"
          style={{ backgroundColor: EJE_COLORS[selectedEje]?.color || "#1e3a5f", color: "#fff" }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 shrink-0 text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Actividad del dia
              </span>
            </div>
            {!editandoActividad && (
              <button
                onClick={() => {
                  setActividadTemporal(actividadDelDia)
                  setEditandoActividad(true)
                }}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="Editar actividad"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              </button>
            )}
          </div>
          
          {editandoActividad ? (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={actividadTemporal}
                  onChange={(e) => setActividadTemporal(e.target.value)}
                  placeholder="Escribe tu actividad..."
                  className="flex-1 h-8 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  autoFocus
                />
                <button
                  onClick={guardarActividad}
                  className="p-2 rounded-lg bg-amber-400 hover:bg-amber-500 transition-colors"
                  title="Guardar"
                >
                  <Check className="w-4 h-4 text-slate-900" />
                </button>
                <button
                  onClick={() => setEditandoActividad(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="Cancelar"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
              {/* Sugerencias de actividades */}
              <div className="space-y-1">
                <p className="text-xs text-amber-300/70">Sugerencias para {selectedEje}:</p>
                <div className="flex flex-wrap gap-1">
                  {ACTIVIDADES_SUGERIDAS[selectedEje]?.map((act, idx) => (
                    <button
                      key={idx}
                      onClick={() => seleccionarActividadSugerida(act)}
                      className="text-xs px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/90 transition-colors"
                    >
                      {act}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">
                {actividadDelDia}
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20"
              >
                {EJE_COLORS[selectedEje]?.nombre || selectedEje}
              </span>
              <span className="text-xs text-white/70 italic">
                (Eje sugerido por ALBA)
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-2">
          {EVAL_OPTIONS.map((opt) => {
            const Icon = opt.icon
            return (
              <div key={opt.value} className="flex items-center gap-1 text-xs text-muted-foreground">
                <Icon className="w-3.5 h-3.5" style={{ color: opt.activeStyle.backgroundColor as string }} />
                {opt.label}
              </div>
            )
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10">
            <Spinner className="text-primary" />
            <span className="text-sm text-muted-foreground">Cargando alumnos...</span>
          </div>
        ) : (
          <ul className="space-y-2">
            {students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                currentStatus={getStudentStatus(student.id)}
                saving={savingId === student.id}
                onEval={(status) => handleEval(student, status)}
                onClear={() => handleClear(student.id)}
              />
            ))}
          </ul>
        )}
      </CardContent>
      
      {/* Boton para abrir Registro de Cierre */}
      {evaluadosCount > 0 && !mostrarCierre && (
        <div className="p-3 border-t border-slate-100">
          <Button
            onClick={() => setMostrarCierre(true)}
            className="w-full"
            style={{ backgroundColor: EJE_COLORS[selectedEje]?.color }}
          >
            <Send className="w-4 h-4 mr-2" />
            Registro de Cierre
          </Button>
        </div>
      )}
      
      {/* Panel de Registro de Cierre */}
      {mostrarCierre && (
        <div 
          className="p-4 border-t-2 space-y-4"
          style={{ borderColor: EJE_COLORS[selectedEje]?.color, backgroundColor: EJE_COLORS[selectedEje]?.bgColor }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5" style={{ color: EJE_COLORS[selectedEje]?.color }} />
              <h3 className="font-bold text-sm" style={{ color: EJE_COLORS[selectedEje]?.color }}>
                Registro de Cierre - {selectedEje}
              </h3>
            </div>
            <button
              onClick={() => setMostrarCierre(false)}
              className="p-1 rounded-lg hover:bg-white/50 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          
          {/* Resumen de actividades */}
          <div className="bg-white rounded-lg p-3 space-y-2 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Actividad evaluada:</span>
              <span className="font-medium text-slate-700">{actividadDelDia}</span>
            </div>
            {actividadSugeridaALBA && actividadSugeridaALBA !== actividadDelDia && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Sugerida por ALBA:</span>
                <span className="font-medium text-slate-700">{actividadSugeridaALBA}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-slate-500">Resultados:</span>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">{calcularStats().green} logrado</span>
                <span className="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">{calcularStats().yellow} proceso</span>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700">{calcularStats().red} refuerzo</span>
              </div>
            </div>
          </div>
          
          {/* Evaluacion general de la actividad */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Como evaluas esta actividad?</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "excelente", label: "Excelente", color: "#10b981" },
                { value: "buena", label: "Buena", color: "#3b82f6" },
                { value: "regular", label: "Regular", color: "#f59e0b" },
                { value: "necesita_mejora", label: "Necesita mejora", color: "#ef4444" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCierreEvaluacion(opt.value as typeof cierreEvaluacion)}
                  className="px-3 py-2 text-xs font-medium rounded-lg border-2 transition-all"
                  style={
                    cierreEvaluacion === opt.value
                      ? { backgroundColor: opt.color, color: "#fff", borderColor: opt.color }
                      : { backgroundColor: "#fff", color: opt.color, borderColor: opt.color + "40" }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Observaciones */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Observaciones (opcional)
            </label>
            <Textarea
              value={cierreObservaciones}
              onChange={(e) => setCierreObservaciones(e.target.value)}
              placeholder="Que observaste durante la actividad?"
              className="text-sm h-16 resize-none"
            />
          </div>
          
          {/* Sugerencia para IA */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">
              Sugerencia para proximas actividades (opcional)
            </label>
            <Textarea
              value={cierreSugerencia}
              onChange={(e) => setCierreSugerencia(e.target.value)}
              placeholder="Ej: Repetir con material concreto, avanzar al siguiente nivel..."
              className="text-sm h-16 resize-none"
            />
          </div>
          
          {/* Botones */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setMostrarCierre(false)}
              className="flex-1"
              disabled={enviandoCierre}
            >
              Cancelar
            </Button>
            <Button
              onClick={enviarRegistroCierre}
              disabled={!cierreEvaluacion || enviandoCierre}
              className="flex-1"
              style={{ backgroundColor: EJE_COLORS[selectedEje]?.color }}
            >
              {enviandoCierre ? (
                <Spinner className="w-4 h-4 mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Enviar Cierre
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
