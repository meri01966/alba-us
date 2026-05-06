"use client"

import { useState } from "react"
import { X, Check, AlertTriangle, Zap } from "lucide-react"

interface Student {
  id: string
  nombre: string
  apellido: string
}

interface ClassEvaluationProps {
  students: Student[]
  onSave: (data: {
    eje: string
    actividad: string
    actividadIndex: number
    lograron: string[]
    refuerzo: string[]
    fecha: string
  }) => Promise<void>
  onClose: () => void
}

const EJES = [
  { key: "CF", label: "Conciencia Fonológica", color: "#10b981" },
  { key: "CT", label: "Conocimiento de Textos", color: "#3b82f6" },
  { key: "O", label: "Oralidad", color: "#f59e0b" },
]

const ACTIVIDADES: Record<string, { nombre: string; index: number }[]> = {
  CF: [
    { nombre: "Rimas", index: 1 },
    { nombre: "Sonido inicial", index: 2 },
    { nombre: "Segmentación silábica", index: 3 },
    { nombre: "Sonido /p/", index: 4 },
    { nombre: "Sonido /m/", index: 5 },
  ],
  CT: [
    { nombre: "Partes del libro", index: 1 },
    { nombre: "Dirección de lectura", index: 2 },
    { nombre: "Título y autor", index: 3 },
  ],
  O: [
    { nombre: "Presentación personal", index: 1 },
    { nombre: "Descripción de imagen", index: 2 },
    { nombre: "Narración de cuento", index: 3 },
    { nombre: "Conversación guiada", index: 4 },
  ],
}

export default function ClassEvaluation({ students, onSave, onClose }: ClassEvaluationProps) {
  const [selectedEje, setSelectedEje] = useState<string | null>(null)
  const [selectedActividad, setSelectedActividad] = useState<{ nombre: string; index: number } | null>(null)
  const [refuerzo, setRefuerzo] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  const toggleRefuerzo = (id: string) => {
    setRefuerzo((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSave = async () => {
    if (!selectedEje || !selectedActividad) return
    setSaving(true)

    const lograron = students.filter((s) => !refuerzo.has(s.id)).map((s) => s.id)
    const refuerzoIds = Array.from(refuerzo)

    await onSave({
      eje: selectedEje,
      actividad: selectedActividad.nombre,
      actividadIndex: selectedActividad.index,
      lograron,
      refuerzo: refuerzoIds,
      fecha: new Date().toISOString().split("T")[0],
    })

    setSaving(false)
    onClose()
  }

  const ejeInfo = EJES.find((e) => e.key === selectedEje)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between" style={{ backgroundColor: "#1e3a5f" }}>
          <div className="flex items-center gap-2 text-white">
            <Zap className="w-5 h-5" />
            <h2 className="text-lg font-bold">Registro Relampago</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Paso 1: Elegir eje */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">1. Elegir eje</p>
            <div className="flex gap-2">
              {EJES.map((eje) => (
                <button
                  key={eje.key}
                  onClick={() => {
                    setSelectedEje(eje.key)
                    setSelectedActividad(null)
                  }}
                  className="flex-1 py-2 px-3 rounded-lg text-sm font-semibold border-2 transition-all"
                  style={{
                    borderColor: selectedEje === eje.key ? eje.color : "#e5e7eb",
                    backgroundColor: selectedEje === eje.key ? `${eje.color}15` : "white",
                    color: selectedEje === eje.key ? eje.color : "#6b7280",
                  }}
                >
                  {eje.key}
                </button>
              ))}
            </div>
          </div>

          {/* Paso 2: Elegir actividad */}
          {selectedEje && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">2. Elegir actividad</p>
              <div className="grid grid-cols-2 gap-2">
                {ACTIVIDADES[selectedEje]?.map((act) => (
                  <button
                    key={act.index}
                    onClick={() => setSelectedActividad(act)}
                    className="py-2 px-3 rounded-lg text-sm border-2 transition-all text-left"
                    style={{
                      borderColor: selectedActividad?.index === act.index ? ejeInfo?.color : "#e5e7eb",
                      backgroundColor: selectedActividad?.index === act.index ? `${ejeInfo?.color}15` : "white",
                      color: selectedActividad?.index === act.index ? ejeInfo?.color : "#374151",
                    }}
                  >
                    {act.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paso 3: Marcar refuerzo */}
          {selectedActividad && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                3. Toca los que necesitan refuerzo (el resto queda como logrado)
              </p>
              <div className="space-y-1">
                {students.map((student) => {
                  const needsRefuerzo = refuerzo.has(student.id)
                  return (
                    <button
                      key={student.id}
                      onClick={() => toggleRefuerzo(student.id)}
                      className="w-full flex items-center justify-between py-2 px-3 rounded-lg border transition-all"
                      style={{
                        borderColor: needsRefuerzo ? "#ef4444" : "#e5e7eb",
                        backgroundColor: needsRefuerzo ? "#fef2f2" : "white",
                      }}
                    >
                      <span className="text-sm font-medium" style={{ color: needsRefuerzo ? "#dc2626" : "#374151" }}>
                        {student.nombre} {student.apellido}
                      </span>
                      {needsRefuerzo ? (
                        <AlertTriangle className="w-4 h-4" style={{ color: "#ef4444" }} />
                      ) : (
                        <Check className="w-4 h-4" style={{ color: "#10b981" }} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedActividad && (
          <div className="p-4 border-t bg-gray-50">
            <div className="flex items-center justify-between mb-3 text-sm">
              <span className="text-gray-600">
                Logrado: <strong className="text-emerald-600">{students.length - refuerzo.size}</strong>
              </span>
              <span className="text-gray-600">
                Refuerzo: <strong className="text-red-600">{refuerzo.size}</strong>
              </span>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all disabled:opacity-50"
              style={{ backgroundColor: "#1e3a5f" }}
            >
              {saving ? "Guardando..." : "Guardar Registro"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
