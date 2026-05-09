"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, AlertCircle, BookOpen, ChevronDown, ChevronUp, RotateCcw } from "lucide-react"

type StatusLevel = "green" | "yellow" | "red"
type FieldKey = "CF" | "CT" | "O"

interface Student {
  id: string
  name?: string
  nombre?: string
}

interface HeatMapProps {
  students: Student[]
  evaluaciones: Record<string, StatusLevel>
  onEvaluacion: (studentId: string, status: StatusLevel, actividadDelDia: string) => void
  onClearEvaluacion: (studentId: string) => void
  onClearAllEvaluaciones: () => void
  isLoading: boolean
}

const EJES: { key: FieldKey; label: string; short: string; color: string }[] = [
  { key: "CF", label: "Conciencia Fonológica", short: "CF", color: "#6366F1" },
  { key: "CT", label: "Comprensión de Textos", short: "CT", color: "#0D9488" },
  { key: "O",  label: "Oralidad",              short: "O",  color: "#D97706" },
]

const ACTIVIDADES: Record<FieldKey, string[]> = {
  CF: [
    "Reconocimiento de Sonido Inicial /M/",
    "Reconocimiento de Sonido Inicial /S/",
    "Reconocimiento de Sonido Inicial /P/",
    "Identificar rimas",
    "Producir rimas",
    "Segmentar sílabas (2)",
    "Segmentar sílabas (3)",
    "Contar sílabas con palmeo",
    "Sonido final",
    "Aislar primer fonema",
    "Segmentar fonemas CVC",
    "Síntesis fonémica (3)",
    "Juego del espía",
    "Robot que habla lento",
    "Caja de rimas",
    "Dominó silábico",
    "Reconocer vocales",
    "Escritura de vocales",
    "Correspondencia M",
    "Correspondencia L",
    "Correspondencia S",
  ],
  CT: [
    "Identificar personaje",
    "Identificar escenario",
    "Identificar conflicto",
    "Identificar resolución",
    "Cruz de Análisis completa",
    "Secuencia temporal (3 escenas)",
    "Inferencia simple",
    "Predicción narrativa",
    "Vocabulario Tier 2",
    "Renarración guiada",
    "Renarración autónoma",
    "Mapa previo (anticipación)",
    "Veo-Pienso-Me pregunto",
    "Antes pensaba / Ahora pienso",
  ],
  O: [
    "Eco estructurado: S+V",
    "Eco: S+V+P",
    "Eco: con adjetivo",
    "Oración completa (guiado)",
    "Oración completa (autónomo)",
    "Describir imagen",
    "Narrar experiencia",
    "Conector 'porque'",
    "Conector 'entonces'",
    "Vocabulario: emociones",
    "Vocabulario: naturaleza",
    "Explicar regla de juego",
    "Argumentar preferencia",
    "Pensar-Compartir-Conversar",
    "Exposición oral",
  ],
}

const EVAL_OPTIONS: {
  value: StatusLevel
  label: string
  icon: React.ElementType
  activeStyle: React.CSSProperties
  inactiveStyle: React.CSSProperties
}[] = [
  {
    value: "green",
    label: "Logrado",
    icon: CheckCircle2,
    activeStyle:   { backgroundColor: "#10b981", color: "#fff", borderColor: "#10b981" },
    inactiveStyle: { backgroundColor: "#d1fae5", color: "#10b981", borderColor: "#6ee7b7" },
  },
  {
    value: "yellow",
    label: "En proceso",
    icon: Clock,
    activeStyle:   { backgroundColor: "#fbbf24", color: "#fff", borderColor: "#fbbf24" },
    inactiveStyle: { backgroundColor: "#fef3c7", color: "#d97706", borderColor: "#fcd34d" },
  },
  {
    value: "red",
    label: "Refuerzo",
    icon: AlertCircle,
    activeStyle:   { backgroundColor: "#ef4444", color: "#fff", borderColor: "#ef4444" },
    inactiveStyle: { backgroundColor: "#fee2e2", color: "#ef4444", borderColor: "#fca5a5" },
  },
]

export function HeatMap({
  students,
  evaluaciones,
  onEvaluacion,
  onClearEvaluacion,
  onClearAllEvaluaciones,
  isLoading,
}: HeatMapProps) {
  const [ejeDia, setEjeDia] = useState<FieldKey>("CF")
  const [actIdx, setActIdx] = useState(0)
  const [showActs, setShowActs] = useState(false)

  const ejeInfo = EJES.find((f) => f.key === ejeDia)!
  const actividadActual = ACTIVIDADES[ejeDia][actIdx]
  const evaluados = Object.keys(evaluaciones).length
  const totalAlumnos = students.length

  return (
    <Card className="shadow-md h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <CardTitle className="text-base font-semibold" style={{ color: "#1e3a5f" }}>
            Registro del aula
          </CardTitle>
          {evaluados > 0 && (
            <button
              type="button"
              onClick={onClearAllEvaluaciones}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
              title="Limpiar evaluaciones del día"
            >
              <RotateCcw className="w-3 h-3" />
              Limpiar
            </button>
          )}
        </div>

        {/* Selector de eje */}
        <div className="flex gap-1.5 mb-2">
          {EJES.map(({ key, short, label, color }) => (
            <button
              key={key}
              onClick={() => { setEjeDia(key); setActIdx(0); setShowActs(false) }}
              title={label}
              className="flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all"
              style={{
                backgroundColor: ejeDia === key ? color + "18" : "transparent",
                borderColor: ejeDia === key ? color : "#e5e7eb",
                color: ejeDia === key ? color : "#9ca3af",
              }}
            >
              {short}
            </button>
          ))}
        </div>

        {/* Actividad actual + dropdown */}
        <div
          onClick={() => setShowActs(!showActs)}
          className="rounded-xl p-2.5 flex items-center gap-1.5 cursor-pointer"
          style={{ backgroundColor: ejeInfo.color + "08", border: `1.5px solid ${ejeInfo.color}22` }}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: ejeInfo.color }} />
          <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: ejeInfo.color }}>
            Evaluando:
          </span>
          <span
            className="ml-1 text-[11px] font-semibold px-2 py-0.5 rounded-full flex-1 truncate"
            style={{ backgroundColor: ejeInfo.color, color: "#fff" }}
          >
            {actividadActual}
          </span>
          {showActs
            ? <ChevronUp className="w-3.5 h-3.5 shrink-0" style={{ color: ejeInfo.color }} />
            : <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: ejeInfo.color }} />
          }
        </div>

        {/* Dropdown de actividades */}
        {showActs && (
          <div
            className="mt-1 rounded-xl border overflow-y-auto"
            style={{ maxHeight: 180, borderColor: ejeInfo.color + "30" }}
          >
            {ACTIVIDADES[ejeDia].map((act, i) => (
              <div
                key={i}
                onClick={() => { setActIdx(i); setShowActs(false) }}
                className="px-3 py-2 text-xs cursor-pointer border-b border-border/50 transition-colors"
                style={{
                  backgroundColor: actIdx === i ? ejeInfo.color + "10" : "transparent",
                  color: actIdx === i ? ejeInfo.color : "#6b7280",
                  fontWeight: actIdx === i ? 600 : 400,
                }}
              >
                {act}
              </div>
            ))}
          </div>
        )}

        {/* Leyenda + contador */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-3">
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
          {totalAlumnos > 0 && (
            <span className="text-[10px] text-slate-400">
              {evaluados}/{totalAlumnos}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-10">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Cargando alumnos...</span>
          </div>
        ) : students.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            Cargá alumnos para comenzar a evaluar
          </p>
        ) : (
          <ul className="space-y-2">
            {students.map((student) => {
              const currentStatus = evaluaciones[student.id] || null
              const studentName = student.name || student.nombre || "Sin nombre"

              return (
                <li
                  key={student.id}
                  className="flex items-center gap-3 px-3 py-2.5 border border-border rounded-xl bg-card"
                >
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
                          onClick={() => {
                            if (isChosen) {
                              onClearEvaluacion(student.id)
                            } else {
                              onEvaluacion(student.id, opt.value, actividadActual)
                            }
                          }}
                          title={opt.label}
                          style={isChosen ? opt.activeStyle : opt.inactiveStyle}
                          className="flex items-center justify-center w-9 h-9 rounded-lg border transition-all hover:scale-110"
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      )
                    })}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
