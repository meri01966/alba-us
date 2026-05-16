"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, AlertCircle, BookOpen, X, RotateCcw, Send, Star, UserX, MessageSquare } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

type StatusLevel = "green" | "yellow" | "red" | "blue"

interface Student {
  id: string
  name?: string
  nombre?: string
}

export interface RegistroCierre {
  actividadALBA: string
  actividadDocente: string
  eje: string
  sala: string
  evaluacionGeneral: "excelente" | "buena" | "regular" | "necesita_mejora"
  observaciones: string
  sugerenciaParaIA: string
  stats: { green: number; yellow: number; red: number; blue: number }
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
  onRegistroCierre?: (registro: RegistroCierre) => void
  actividadSugeridaALBA?: string
  ejeDeALBA?: string
  sala?: string
  isLoading?: boolean
}

// LOGICA DEL SEMAFORO INTELIGENTE:
// - Por defecto todos empiezan en GRIS (sin evaluar)
// - El docente SOLO marca: Amarillo (en proceso), Rojo (refuerzo), Azul (ausente)
// - Al finalizar jornada, los no marcados quedan automaticamente en Verde

const EVAL_OPTIONS: {
  value: StatusLevel
  label: string
  descripcion: string
  icon: React.ElementType
  activeStyle: React.CSSProperties
  inactiveStyle: React.CSSProperties
}[] = [
  {
    value: "yellow",
    label: "En proceso",
    descripcion: "Requiere mas practica",
    icon: Clock,
    activeStyle: { backgroundColor: "#fbbf24", color: "#fff", borderColor: "#fbbf24" },
    inactiveStyle: { backgroundColor: "#fef3c7", color: "#d97706", borderColor: "#fcd34d" },
  },
  {
    value: "red",
    label: "Refuerzo",
    descripcion: "Necesita apoyo adicional",
    icon: AlertCircle,
    activeStyle: { backgroundColor: "#ef4444", color: "#fff", borderColor: "#ef4444" },
    inactiveStyle: { backgroundColor: "#fee2e2", color: "#ef4444", borderColor: "#fca5a5" },
  },
  {
    value: "blue",
    label: "Ausente",
    descripcion: "No asistio hoy",
    icon: UserX,
    activeStyle: { backgroundColor: "#6366f1", color: "#fff", borderColor: "#6366f1" },
    inactiveStyle: { backgroundColor: "#e0e7ff", color: "#6366f1", borderColor: "#a5b4fc" },
  },
]

function getStatusColor(status: StatusLevel | null): string {
  if (status === "blue") return "#6366f1"
  if (status === "green") return "#10b981"
  if (status === "yellow") return "#fbbf24"
  if (status === "red") return "#ef4444"
  return "#10b981" // Verde por defecto (logrado)
}

function getStatusBg(status: StatusLevel | null): string {
  if (status === "blue") return "#e0e7ff"
  if (status === "green") return "#ecfdf5"
  if (status === "yellow") return "#fef3c7"
  if (status === "red") return "#fef2f2"
  return "#ecfdf5" // Verde claro por defecto
}

// Generar reporte para padres basado en el estado
function generarReportePadre(
  nombreAlumno: string, 
  estado: StatusLevel | null, 
  actividad: string
): string {
  const nombre = nombreAlumno.split(" ")[0] // Solo primer nombre
  
  if (estado === "blue") {
    return `${nombre} no asistio a clase hoy. Sin actividad por inasistencia.`
  }
  
  // Verde (por defecto o explicito)
  if (!estado || estado === "green") {
    return `Hoy trabajamos "${actividad}". ${nombre} lo logro con exito. Felicitaciones!`
  }
  
  if (estado === "yellow") {
    return `Hoy trabajamos "${actividad}". ${nombre} esta en proceso de aprendizaje. Sugerimos seguir practicando en casa.`
  }
  
  if (estado === "red") {
    return `Hoy trabajamos "${actividad}". ${nombre} requiere seguir practicando en casa. Por favor dedicar tiempo extra a esta actividad.`
  }
  
  return ""
}

function StudentRow({
  student,
  currentStatus,
  saving,
  onMark,
  onClear,
}: {
  student: Student
  currentStatus: StatusLevel | null
  saving: boolean
  onMark: (status: StatusLevel) => void
  onClear?: () => void
}) {
  const studentName = student.name || student.nombre || "Sin nombre"
  const statusColor = getStatusColor(currentStatus)
  const statusBg = getStatusBg(currentStatus)
  
  // Si no tiene marca, esta en verde por defecto
  const estaEnVerde = !currentStatus || currentStatus === "green"
  
  return (
    <li 
      className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all"
      style={{ 
        backgroundColor: statusBg,
        border: `2px solid ${statusColor}40`
      }}
    >
      {/* Indicador de estado */}
      <div 
        className="w-3 h-3 rounded-full shrink-0 transition-all"
        style={{ 
          backgroundColor: statusColor,
          opacity: estaEnVerde ? 0.5 : 1 // Tenue si esta en verde por defecto
        }}
        title={currentStatus ? currentStatus : "Logrado (por defecto)"}
      />
      
      <span className="text-sm font-medium text-foreground flex-1 truncate">
        {studentName}
      </span>
      
      {/* Estado actual si no es verde */}
      {currentStatus && currentStatus !== "green" && (
        <span 
          className="text-[10px] font-bold px-2 py-0.5 rounded-full mr-1"
          style={{ backgroundColor: statusColor, color: "#fff" }}
        >
          {currentStatus === "yellow" ? "En proceso" : currentStatus === "red" ? "Refuerzo" : "Ausente"}
        </span>
      )}
      
      <div className="flex items-center gap-1 shrink-0">
        {EVAL_OPTIONS.map((opt) => {
          const Icon = opt.icon
          const isChosen = currentStatus === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onMark(opt.value)}
              disabled={saving}
              title={`${opt.label} - ${opt.descripcion}`}
              style={isChosen ? opt.activeStyle : opt.inactiveStyle}
              className="flex items-center justify-center w-7 h-7 rounded-lg border transition-all hover:scale-110 disabled:opacity-50"
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          )
        })}
        
        {/* Boton para volver a verde (quitar marca) */}
        {currentStatus && (
          <button
            onClick={onClear}
            disabled={saving}
            title="Volver a Logrado"
            className="flex items-center justify-center w-7 h-7 rounded-lg border border-green-300 bg-green-50 hover:bg-green-100 text-green-600 transition-all hover:scale-110 disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>
        )}
        
        {saving && <Spinner className="w-4 h-4 text-primary" />}
      </div>
    </li>
  )
}

export function HeatMap({ 
  students = [], 
  evaluaciones = {}, 
  onEvaluacion, 
  onClearEvaluacion, 
  onClearAllEvaluaciones, 
  onRegistroCierre, 
  actividadSugeridaALBA = "", 
  ejeDeALBA = "CF", 
  sala = "Girasoles", 
  isLoading = false 
}: HeatMapProps) {
  const [savingId, setSavingId] = useState<string | null>(null)
  const [mostrarCierre, setMostrarCierre] = useState(false)
  const [mostrarReportes, setMostrarReportes] = useState(false)
  const [cierreEvaluacion, setCierreEvaluacion] = useState<"excelente" | "buena" | "regular" | "necesita_mejora" | null>(null)
  const [cierreObservaciones, setCierreObservaciones] = useState("")
  const [cierreSugerencia, setCierreSugerencia] = useState("")
  const [enviandoCierre, setEnviandoCierre] = useState(false)
  
  const selectedEje = ejeDeALBA
  const actividadDelDia = actividadSugeridaALBA || "Cargando sugerencia de ALBA..."
  
  // Calcular stats - los no marcados cuentan como verde
  const calcularStats = useMemo(() => {
    let green = 0, yellow = 0, red = 0, blue = 0
    students.forEach(s => {
      const status = evaluaciones[s.id]
      if (status === "blue") blue++
      else if (status === "yellow") yellow++
      else if (status === "red") red++
      else green++ // Sin marca = verde (logrado)
    })
    return { green, yellow, red, blue }
  }, [students, evaluaciones])
  
  // Generar reportes para todos los alumnos
  const reportes = useMemo(() => {
    return students.map(s => ({
      id: s.id,
      nombre: s.name || s.nombre || "Sin nombre",
      estado: evaluaciones[s.id] || "green",
      reporte: generarReportePadre(
        s.name || s.nombre || "Alumno",
        evaluaciones[s.id] || null,
        actividadDelDia
      )
    }))
  }, [students, evaluaciones, actividadDelDia])
  
  // Enviar registro de cierre - automaticamente marca verde a los no marcados
  const enviarRegistroCierre = async () => {
    if (!cierreEvaluacion) return
    
    setEnviandoCierre(true)
    
    // Primero, guardar verde para todos los alumnos sin marca
    students.forEach(s => {
      if (!evaluaciones[s.id] && onEvaluacion) {
        onEvaluacion(s.id, "green", actividadDelDia, selectedEje)
      }
    })
    
    const registro: RegistroCierre = {
      actividadALBA: actividadDelDia,
      actividadDocente: actividadDelDia,
      eje: selectedEje,
      sala: sala,
      evaluacionGeneral: cierreEvaluacion,
      observaciones: cierreObservaciones,
      sugerenciaParaIA: cierreSugerencia,
      stats: calcularStats,
    }
    
    if (onRegistroCierre) {
      await onRegistroCierre(registro)
    }
    
    setMostrarCierre(false)
    setCierreEvaluacion(null)
    setCierreObservaciones("")
    setCierreSugerencia("")
    setEnviandoCierre(false)
  }

  if (!isLoading && (!students || students.length === 0)) {
    return null
  }

  async function handleMark(student: Student, status: StatusLevel) {
    setSavingId(student.id)
    if (onEvaluacion) {
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
    if (confirm("Esto volvera a todos los alumnos a Logrado (verde). Continuar?")) {
      if (onClearAllEvaluaciones) {
        onClearAllEvaluaciones()
      }
    }
  }

  const getStudentStatus = (studentId: string): StatusLevel | null => {
    return evaluaciones[studentId] || null
  }
  
  const marcadosCount = students.filter(s => getStudentStatus(s.id) !== null).length

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <CardTitle className="text-base font-semibold text-primary">
            Registro del aula
          </CardTitle>
          <div className="flex items-center gap-2">
            {marcadosCount > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 transition-colors"
                title="Reiniciar todo a Logrado"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
              {calcularStats.green} logrado
            </span>
            {calcularStats.yellow > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">
                {calcularStats.yellow}
              </span>
            )}
            {calcularStats.red > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                {calcularStats.red}
              </span>
            )}
            {calcularStats.blue > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700">
                {calcularStats.blue} aus.
              </span>
            )}
          </div>
        </div>

        {/* Banner de actividad ALBA */}
        <div
          className="rounded-xl p-3 flex flex-col gap-2"
          style={{ backgroundColor: EJE_COLORS[selectedEje]?.color || "#1e3a5f", color: "#fff" }}
        >
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-5 h-5 shrink-0 text-white/80" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/70">
              Actividad de hoy
            </span>
          </div>
          <span className="text-sm font-bold">{actividadDelDia}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 self-start">
            {EJE_COLORS[selectedEje]?.nombre || selectedEje}
          </span>
        </div>

        {/* Instruccion del semaforo */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mt-2">
          <p className="text-xs text-slate-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Marca rojo, amarillo o ausente. Al finalizar la jornada, los sin marcar se registran como logrado.</span>
          </p>
        </div>

        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
          {EVAL_OPTIONS.map((opt) => {
            const Icon = opt.icon
            return (
              <div key={opt.value} className="flex items-center gap-1">
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
          <ul className="space-y-1.5">
            {students.map((student) => (
              <StudentRow
                key={student.id}
                student={student}
                currentStatus={getStudentStatus(student.id)}
                saving={savingId === student.id}
                onMark={(status) => handleMark(student, status)}
                onClear={() => handleClear(student.id)}
              />
            ))}
          </ul>
        )}
      </CardContent>
      
      {/* Botones de accion */}
      <div className="p-3 border-t border-slate-100">
        {/* Finalizar jornada */}
        <Button
          onClick={() => setMostrarCierre(true)}
          className="w-full font-semibold text-white"
          style={{ backgroundColor: "#1e40af" }}
        >
          <Send className="w-4 h-4 mr-2" />
          Finalizar Jornada
        </Button>
      </div>

      {/* Modal Vista Previa de Reportes */}
      {mostrarReportes && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <h2 className="font-bold">Vista Previa de Reportes para Padres</h2>
              </div>
              <button onClick={() => setMostrarReportes(false)} className="p-2 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[60vh] space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-xs text-blue-700">
                  <strong>Actividad de hoy:</strong> {actividadDelDia}
                </p>
              </div>
              
              {reportes.map((r) => (
                <div 
                  key={r.id} 
                  className="p-3 rounded-xl border"
                  style={{ 
                    backgroundColor: getStatusBg(r.estado as StatusLevel),
                    borderColor: getStatusColor(r.estado as StatusLevel) + "40"
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: getStatusColor(r.estado as StatusLevel) }}
                    />
                    <span className="font-semibold text-sm">{r.nombre}</span>
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto"
                      style={{ 
                        backgroundColor: getStatusColor(r.estado as StatusLevel),
                        color: "#fff"
                      }}
                    >
                      {r.estado === "green" ? "Logrado" : 
                       r.estado === "yellow" ? "En proceso" : 
                       r.estado === "red" ? "Refuerzo" : "Ausente"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 italic">
                    &quot;{r.reporte}&quot;
                  </p>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                Estos reportes se generan automaticamente basados en la actividad y el estado de cada alumno
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal Finalizar Jornada */}
      {mostrarCierre && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 flex items-center justify-between" style={{ backgroundColor: "#1e40af" }}>
              <div className="flex items-center gap-2 text-white">
                <Star className="w-5 h-5" />
                <h3 className="font-bold">Finalizar Jornada</h3>
              </div>
              <button onClick={() => setMostrarCierre(false)} className="p-2 hover:bg-white/10 rounded-lg text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Resumen */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Resumen de la jornada:</p>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-green-100 rounded-lg p-2">
                    <div className="text-xl font-bold text-green-700">{calcularStats.green}</div>
                    <div className="text-[10px] text-green-600">Logrado</div>
                  </div>
                  <div className="bg-yellow-100 rounded-lg p-2">
                    <div className="text-xl font-bold text-yellow-700">{calcularStats.yellow}</div>
                    <div className="text-[10px] text-yellow-600">En proceso</div>
                  </div>
                  <div className="bg-red-100 rounded-lg p-2">
                    <div className="text-xl font-bold text-red-700">{calcularStats.red}</div>
                    <div className="text-[10px] text-red-600">Refuerzo</div>
                  </div>
                  <div className="bg-indigo-100 rounded-lg p-2">
                    <div className="text-xl font-bold text-indigo-700">{calcularStats.blue}</div>
                    <div className="text-[10px] text-indigo-600">Ausentes</div>
                  </div>
                </div>
                
                {/* Promedio */}
                {(() => {
                  const total = calcularStats.green + calcularStats.yellow + calcularStats.red
                  if (total === 0) return null
                  const promedio = Math.round(((calcularStats.green * 100) + (calcularStats.yellow * 50) + (calcularStats.red * 10)) / total)
                  return (
                    <div className={`mt-3 px-4 py-2 rounded-lg text-center font-bold text-white ${
                      promedio >= 70 ? "bg-green-500" : promedio >= 40 ? "bg-yellow-500" : "bg-red-500"
                    }`}>
                      Promedio del grupo: {promedio}%
                    </div>
                  )
                })()}
              </div>
              
              {/* Evaluacion de la actividad */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Como fue la actividad?</label>
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
                      className="px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all"
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
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Observaciones (opcional)
                </label>
                <Textarea
                  value={cierreObservaciones}
                  onChange={(e) => setCierreObservaciones(e.target.value)}
                  placeholder="Que observaste durante la actividad?"
                  className="text-sm h-20 resize-none"
                />
              </div>
              
              {/* Sugerencia */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Sugerencia para ALBA (opcional)
                </label>
                <Textarea
                  value={cierreSugerencia}
                  onChange={(e) => setCierreSugerencia(e.target.value)}
                  placeholder="Ej: Repetir con mas imagenes, usar musica..."
                  className="text-sm h-16 resize-none"
                />
              </div>
              
              {/* Boton enviar */}
              <Button
                onClick={enviarRegistroCierre}
                disabled={!cierreEvaluacion || enviandoCierre}
                className="w-full font-semibold text-white"
                style={{ backgroundColor: "#1e40af" }}
              >
                {enviandoCierre ? (
                  <Spinner className="w-4 h-4 mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Enviar
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
