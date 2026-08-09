"use client"

import type { ChangeEvent } from "react"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Sparkles, Trash2, ChevronDown, ChevronUp, BookOpen } from "lucide-react"

// Vocabulario UNICO de ejes. Mismo que usa la tabla actividades_docentes.
const EJES: { key: string; nombre: string; corto: string; color: string; bg: string }[] = [
  { key: "CF", nombre: "Conciencia Fonologica", corto: "Fonologica", color: "#3b82f6", bg: "#eff6ff" },
  { key: "CT", nombre: "Comprension de Textos", corto: "Textos",     color: "#10b981", bg: "#ecfdf5" },
  { key: "O",  nombre: "Oralidad",              corto: "Oralidad",   color: "#f59e0b", bg: "#fffbeb" },
  { key: "E",  nombre: "Escritura",             corto: "Escritura",  color: "#8b5cf6", bg: "#f5f3ff" },
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
  capacidad: string | null
  objetivo: string | null
  desarrollo: string | null
  materiales: string | null
  estado: string
  created_at: string
}

export function ActividadesDocentes({ sala, proyecto }: { sala: string; proyecto?: string }) {
  const [lista, setLista]         = useState<ActividadDocente[]>([])
  const [cargando, setCargando]   = useState(true)
  const [abierto, setAbierto]     = useState(false)
  const [texto, setTexto]         = useState("")
  const [guardando, setGuardando] = useState(false)
  const [expandida, setExpandida] = useState<string | null>(null)
  const [aviso, setAviso]         = useState("")
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
    if (texto.trim().length < 15) {
      setError("Pegá al menos una actividad para que ALBA pueda leerla.")
      return
    }
    setError("")
    setAviso("")
    setGuardando(true)
    try {
      const r = await fetch("/api/actividades-docentes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala, texto, proyecto: proyecto || "" }),
      })
      const d = await r.json()
      if (d?.ok) {
        setTexto("")
        setAbierto(false)
        setAviso(
          d.cantidad === 1
            ? "ALBA sumó 1 actividad a tu repertorio."
            : `ALBA sumó ${d.cantidad} actividades a tu repertorio.`
        )
        await cargar()
      } else {
        setError(d?.error || "No se pudo guardar. Proba de nuevo.")
      }
    } catch (e) {
      console.error("[v0] Error guardando actividades:", e)
      setError("No se pudo guardar. Proba de nuevo.")
    }
    setGuardando(false)
  }

  async function cambiarEje(id: string, eje: string) {
    setLista((prev: ActividadDocente[]) => prev.map((a: ActividadDocente) => (a.id === id ? { ...a, eje } : a)))
    try {
      await fetch("/api/actividades-docentes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, eje }),
      })
    } catch (e) {
      console.error("[v0] Error cambiando eje:", e)
      await cargar()
    }
  }

  async function borrar(id: string) {
    
    try {
      await fetch(`/api/actividades-docentes?id=${encodeURIComponent(id)}`, { method: "DELETE" })
      setLista((prev: ActividadDocente[]) => prev.filter((a: ActividadDocente) => a.id !== id))
    } catch (e) {
      console.error("[v0] Error borrando actividad:", e)
    }
  }

  const pendientes = lista.filter((a: ActividadDocente) => a.estado === "propia").length

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Mis actividades
            {lista.length > 0 && (
              <span className="text-xs font-normal text-slate-400">
                {pendientes} sin usar de {lista.length}
              </span>
            )}
          </CardTitle>
          {!abierto && (
            <button
              onClick={() => { setAbierto(true); setError(""); setAviso("") }}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
              style={{ backgroundColor: "#1e3a5f" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Agregar
            </button>
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Pegá tu listado de actividades. ALBA las separa, les asigna eje y capacidad, y las suma a sus sugerencias.
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        {error && (
          <div className="mb-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {aviso && (
          <div className="mb-3 text-xs text-teal-800 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2">
            {aviso}
          </div>
        )}

        {abierto && (
          <div className="mb-4">
            <textarea
              value={texto}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTexto(e.target.value)}
              rows={7}
              autoFocus
              placeholder={"Pegá acá tu listado, una actividad por parrafo. Por ejemplo:\n\nBuscamos objetos de la sala que empiecen con la misma letra que su nombre y los anotamos en un afiche.\n\nArmamos la lista de los materiales que necesitamos para la huerta.\n\nJugamos al veo veo con sonidos iniciales."}
              className="w-full text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Hasta 8 actividades por vez. Si tenés mas, cargalas en dos tandas.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={enviar}
                disabled={guardando}
                className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg text-white disabled:opacity-50"
                style={{ backgroundColor: "#0f766e" }}
              >
                {guardando ? <Spinner className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {guardando ? "ALBA esta leyendo..." : "Ordenar con ALBA"}
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

        {cargando ? (
          <div className="flex items-center gap-2 py-6 justify-center">
            <Spinner className="w-4 h-4 text-primary" />
            <span className="text-sm text-slate-500">Cargando...</span>
          </div>
        ) : lista.length === 0 && !abierto ? (
          <p className="text-sm text-slate-400 py-4 text-center">
            Todavia no cargaste actividades propias.
          </p>
        ) : (
          <ul className="space-y-2">
            {lista.map((a: ActividadDocente) => {
              const info = ejeInfo(a.eje)
              const abiertaEsta = expandida === a.id
              const usada = a.estado !== "propia"
              return (
                <li key={a.id} className="rounded-lg border border-slate-200 overflow-hidden">
                  <div className="px-3 py-2 flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {a.nombre || "Actividad sin titulo"}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={
                            info
                              ? { backgroundColor: info.bg, color: info.color }
                              : { backgroundColor: "#f1f5f9", color: "#64748b" }
                          }
                        >
                          {info ? info.corto : "Sin eje"}
                        </span>
                        {usada && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Ya sugerida
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandida(abiertaEsta ? null : a.id)}
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0"
                    >
                      {abiertaEsta ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      Ver
                    </button>
                    <button
                      onClick={() => borrar(a.id)}
                      title="Borrar"
                      className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {abiertaEsta && (
                    <div className="px-3 pb-3 pt-1 bg-slate-50 border-t border-slate-200 space-y-2">
                      {a.capacidad && (
                        <p className="text-xs text-slate-700">
                          <span className="font-semibold">Capacidad: </span>{a.capacidad}
                        </p>
                      )}
                      {a.objetivo && (
                        <p className="text-xs text-slate-600">
                          <span className="font-semibold">Objetivo: </span>{a.objetivo}
                        </p>
                      )}
                      {a.desarrollo && (
                        <p className="text-xs text-slate-600 whitespace-pre-line">
                          <span className="font-semibold">Desarrollo: </span>{a.desarrollo}
                        </p>
                      )}
                      {a.materiales && (
                        <p className="text-xs text-slate-600">
                          <span className="font-semibold">Materiales: </span>{a.materiales}
                        </p>
                      )}

                      <div>
                        <p className="text-[11px] font-semibold text-slate-500 mb-1">
                          Si el eje no corresponde, tocá el correcto:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {EJES.map((e) => {
                            const activo = a.eje === e.key
                            return (
                              <button
                                key={e.key}
                                onClick={() => cambiarEje(a.id, e.key)}
                                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all"
                                style={
                                  activo
                                    ? { backgroundColor: e.color, color: "#fff", borderColor: e.color }
                                    : { backgroundColor: "#fff", color: e.color, borderColor: `${e.color}55` }
                                }
                              >
                                {e.corto}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <details>
                        <summary className="text-[11px] text-slate-400 cursor-pointer">
                          Ver lo que escribiste
                        </summary>
                        <p className="text-[11px] text-slate-500 mt-1 whitespace-pre-line">
                          {a.texto_original}
                        </p>
                      </details>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
