"use client"

import type { ChangeEvent } from "react"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Sparkles, Check, X, BookOpen } from "lucide-react"

// Vocabulario UNICO de ejes. Mismo que usa la tabla actividades_docentes.
const EJES: { key: string; nombre: string; color: string; bg: string }[] = [
  { key: "CF", nombre: "Conciencia Fonologica", color: "#3b82f6", bg: "#eff6ff" },
  { key: "CT", nombre: "Comprension de Textos", color: "#10b981", bg: "#ecfdf5" },
  { key: "O",  nombre: "Oralidad",              color: "#f59e0b", bg: "#fffbeb" },
  { key: "E",  nombre: "Escritura",             color: "#8b5cf6", bg: "#f5f3ff" },
]

function ejeInfo(key: string | null) {
  return EJES.find((e) => e.key === key) || null
}

interface ActividadDocente {
  id: string
  sala: string
  texto_original: string
  nombre: string | null
  eje: string | null
  objetivo: string | null
  desarrollo: string | null
  materiales: string | null
  estado: string
  confirmada: boolean
  created_at: string
}

const ESTADO_LABEL: Record<string, { texto: string; color: string; bg: string }> = {
  propia:    { texto: "En mi sala",      color: "#475569", bg: "#f1f5f9" },
  candidata: { texto: "Sumando evidencia", color: "#b45309", bg: "#fef3c7" },
  red:       { texto: "En la red",       color: "#047857", bg: "#d1fae5" },
}

export function ActividadesDocentes({ sala, proyecto }: { sala: string; proyecto?: string }) {
  const [lista, setLista]         = useState<ActividadDocente[]>([])
  const [cargando, setCargando]   = useState(true)
  const [abierto, setAbierto]     = useState(false)
  const [texto, setTexto]         = useState("")
  const [guardando, setGuardando] = useState(false)
  const [propuesta, setPropuesta] = useState<ActividadDocente | null>(null)
  const [error, setError]         = useState("")

  const cargar = useCallback(async () => {
    if (!sala) return
    setCargando(true)
    try {
      const r = await fetch(`/api/actividades-docentes?sala=${encodeURIComponent(sala)}`)
      const d = await r.json()
      if (d?.ok) setLista(d.actividades || [])
    } catch (e) {
      console.error("[v0] Error cargando actividades docentes:", e)
    }
    setCargando(false)
  }, [sala])

  useEffect(() => { cargar() }, [cargar])

  async function enviar() {
    if (texto.trim().length < 10) {
      setError("Contame un poco mas de la actividad para poder ordenarla.")
      return
    }
    setError("")
    setGuardando(true)
    try {
      const r = await fetch("/api/actividades-docentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala, texto, proyecto: proyecto || "" }),
      })
      const d = await r.json()
      if (d?.ok) {
        setPropuesta(d.actividad)
        setTexto("")
        setAbierto(false)
      } else {
        setError(d?.error || "No se pudo guardar. Proba de nuevo.")
      }
    } catch (e) {
      console.error("[v0] Error guardando actividad docente:", e)
      setError("No se pudo guardar. Proba de nuevo.")
    }
    setGuardando(false)
  }

  async function confirmar(id: string, eje: string | null) {
    if (!eje) { setError("Elegi un eje antes de confirmar."); return }
    setGuardando(true)
    try {
      await fetch("/api/actividades-docentes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, eje, confirmada: true }),
      })
      setPropuesta(null)
      await cargar()
    } catch (e) {
      console.error("[v0] Error confirmando actividad:", e)
    }
    setGuardando(false)
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Mis actividades
          </CardTitle>
          {!abierto && !propuesta && (
            <button
              onClick={() => { setAbierto(true); setError("") }}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
              style={{ backgroundColor: "#1e3a5f" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Pega o escribi una actividad tuya. ALBA la ordena y te dice a que eje corresponde.
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        {error && (
          <div className="mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Carga de texto libre */}
        {abierto && (
          <div className="mb-4">
            <textarea
              value={texto}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTexto(e.target.value)}
              rows={5}
              autoFocus
              placeholder="Ej: Jugamos a buscar objetos de la sala que empiecen con la misma letra que su nombre y despues los anotamos en un afiche."
              className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={enviar}
                disabled={guardando}
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
                style={{ backgroundColor: "#0f766e" }}
              >
                {guardando ? <Spinner className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                Ordenar con ALBA
              </button>
              <button
                onClick={() => { setAbierto(false); setTexto(""); setError("") }}
                className="text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Propuesta de ALBA para confirmar */}
        {propuesta && (
          <PropuestaALBA
            actividad={propuesta}
            guardando={guardando}
            onConfirmar={confirmar}
            onDescartar={() => setPropuesta(null)}
          />
        )}

        {/* Listado */}
        {cargando ? (
          <div className="flex items-center gap-2 py-6 justify-center">
            <Spinner className="w-4 h-4 text-primary" />
            <span className="text-sm text-slate-500">Cargando...</span>
          </div>
        ) : lista.length === 0 && !abierto && !propuesta ? (
          <p className="text-sm text-slate-400 py-4 text-center">
            Todavia no cargaste ninguna actividad propia.
          </p>
        ) : (
          <ul className="space-y-2">
            {lista.map((a: ActividadDocente) => {
              const info = ejeInfo(a.eje)
              const est = ESTADO_LABEL[a.estado] || ESTADO_LABEL.propia
              return (
                <li
                  key={a.id}
                  className="rounded-lg border border-slate-200 px-3 py-2 flex items-center gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {a.nombre || a.texto_original.slice(0, 60)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      {info && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: info.bg, color: info.color }}
                        >
                          {info.nombre}
                        </span>
                      )}
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: est.bg, color: est.color }}
                      >
                        {est.texto}
                      </span>
                      {!a.confirmada && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                          Sin confirmar
                        </span>
                      )}
                    </div>
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

// ── Propuesta de ALBA: la maestra revisa el eje y confirma ──────────────────
function PropuestaALBA({
  actividad,
  guardando,
  onConfirmar,
  onDescartar,
}: {
  actividad: ActividadDocente
  guardando: boolean
  onConfirmar: (id: string, eje: string | null) => void
  onDescartar: () => void
}) {
  const [ejeElegido, setEjeElegido] = useState<string | null>(actividad.eje)

  return (
    <div className="mb-4 rounded-xl border-2 border-teal-200 bg-teal-50/50 p-3">
      <p className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">
        ALBA la ordeno asi
      </p>

      <p className="text-sm font-semibold text-slate-800">
        {actividad.nombre || "Sin titulo"}
      </p>

      {actividad.objetivo && (
        <p className="text-xs text-slate-600 mt-1">
          <span className="font-semibold">Objetivo: </span>{actividad.objetivo}
        </p>
      )}
      {actividad.desarrollo && (
        <p className="text-xs text-slate-600 mt-1 whitespace-pre-line">
          <span className="font-semibold">Desarrollo: </span>{actividad.desarrollo}
        </p>
      )}
      {actividad.materiales && (
        <p className="text-xs text-slate-600 mt-1">
          <span className="font-semibold">Materiales: </span>{actividad.materiales}
        </p>
      )}

      <p className="text-xs font-semibold text-slate-700 mt-3 mb-1.5">
        Eje: tocá otro si no coincide
      </p>
      <div className="flex flex-wrap gap-1.5">
        {EJES.map((e) => {
          const activo = ejeElegido === e.key
          return (
            <button
              key={e.key}
              onClick={() => setEjeElegido(e.key)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"
              style={
                activo
                  ? { backgroundColor: e.color, color: "#fff", borderColor: e.color }
                  : { backgroundColor: e.bg, color: e.color, borderColor: `${e.color}55` }
              }
            >
              {e.nombre}
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => onConfirmar(actividad.id, ejeElegido)}
          disabled={guardando}
          className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
          style={{ backgroundColor: "#047857" }}
        >
          {guardando ? <Spinner className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          Confirmar
        </button>
        <button
          onClick={onDescartar}
          className="flex items-center gap-1 text-sm px-3 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <X className="w-4 h-4" />
          Despues
        </button>
      </div>
    </div>
  )
}
