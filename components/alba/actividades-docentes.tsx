"use client"

import type { ChangeEvent } from "react"
import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Sparkles, Trash2, ChevronDown, ChevronUp, BookOpen, Star } from "lucide-react"

// Vocabulario UNICO de ejes. Mismo que usa la tabla actividades_docentes.
const EJES: { key: string; nombre: string; corto: string; color: string; bg: string }[] = [
  { key: "CF", nombre: "Conciencia Fonologica", corto: "Fonologica", color: "#3b82f6", bg: "#eff6ff" },
  { key: "CT", nombre: "Comprension de Textos", corto: "Textos",     color: "#10b981", bg: "#ecfdf5" },
  { key: "O",  nombre: "Oralidad",              corto: "Oralidad",   color: "#f59e0b", bg: "#fffbeb" },
  { key: "E",  nombre: "Escritura",             corto: "Escritura",  color: "#8b5cf6", bg: "#f5f3ff" },
  // Maternal se clasifica por CAPACIDAD, con los colores propios de cada una
  { key: "COM", nombre: "Comunicacion",              corto: "Comunicacion", color: "#1d4ed8", bg: "#eff6ff" },
  { key: "AUT", nombre: "Autonomia para aprender",   corto: "Autonomia",    color: "#6d28d9", bg: "#f5f3ff" },
  { key: "RES", nombre: "Resolucion de problemas",   corto: "Resolucion",   color: "#0f766e", bg: "#f0fdfa" },
  { key: "COL", nombre: "Compromiso y colaboracion", corto: "Colaboracion", color: "#c2410c", bg: "#fff7ed" },
  { key: "REF", nombre: "Pensamiento reflexivo",     corto: "Reflexivo",    color: "#be185d", bg: "#fdf2f8" },
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
  elegida?: boolean
  created_at: string
}

export function ActividadesDocentes({
  sala,
  proyecto,
  proyectoObjetivo,
  proyectoDuracion,
}: {
  sala: string
  proyecto?: string
  proyectoObjetivo?: string
  proyectoDuracion?: string
}) {
  const [lista, setLista]         = useState<ActividadDocente[]>([])
  const [cargando, setCargando]   = useState(true)
  const [abierto, setAbierto]     = useState(false)
  const [texto, setTexto]         = useState("")
  const [guardando, setGuardando] = useState(false)
  const [expandida, setExpandida] = useState<string | null>(null)
  const [aviso, setAviso]         = useState("")
  const [error, setError]         = useState("")

  // El proyecto le dice a ALBA por donde quiere ir la maestra. Si el componente
  // no lo recibe —en jardin no se lo pasan— lo busca solo.
  const [proy, setProy] = useState<{ titulo: string; objetivo: string; duracion: string }>({
    titulo: "", objetivo: "", duracion: "",
  })

  useEffect(() => {
    if (!sala || proyecto) return
    // Se LIMPIA al cambiar de sala. Antes solo se reemplazaba si la sala nueva
    // tenia proyecto: si no tenia, quedaba el de la sala anterior y ALBA
    // proponia actividades del proyecto equivocado.
    setProy({ titulo: "", objetivo: "", duracion: "" })
    let cancelado = false
    ;(async () => {
      try {
        const r = await fetch(`/api/proyecto-maternal?sala=${encodeURIComponent(sala)}`, { cache: "no-store" })
        const d = await r.json()
        if (cancelado) return
        setProy({
          titulo: d?.proyecto?.titulo || "",
          objetivo: d?.proyecto?.objetivo_general || "",
          duracion: d?.proyecto?.duracion || "",
        })
      } catch (e) {
        console.error("[v0] Error trayendo el proyecto:", e)
      }
    })()
    return () => { cancelado = true }
  }, [sala, proyecto])

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

  useEffect(() => {
    // Limpiar antes de traer: si no, se ven las actividades de la sala anterior
    setLista([])
    setTexto("")
    setError("")
    cargar()
  }, [cargar])

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
        // El proyecto COMPLETO: le dice a ALBA por donde quiere ir la maestra
        body: JSON.stringify({
          sala,
          texto,
          proyecto: proyecto || "",
          proyectoObjetivo: proyectoObjetivo || "",
          proyectoDuracion: proyectoDuracion || "",
        }),
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

  // Sin uso: el eje lo decide ALBA
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

  // Marca las actividades que ALBA tiene que usar esta semana. Puede marcar
  // VARIAS: si armo una secuencia tiene sentido darla junta. ALBA las pone en
  // el cronograma y las tres que caen en lunes, martes y viernes son las que
  // se evaluan. La pantalla cambia al instante y el guardado viaja despues,
  // para que con internet mala no haya espera.
  async function marcarSemana(id: string, valor: boolean) {
    const antes = lista
    setLista((prev: ActividadDocente[]) =>
      prev.map((a: ActividadDocente) => (a.id === id ? { ...a, elegida: valor } : a))
    )
    try {
      const res = await fetch("/api/actividades-docentes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, elegida: valor }),
      })
      if (!res.ok) throw new Error("no se guardo")
    } catch (e) {
      console.error("[v0] Error marcando la actividad de la semana:", e)
      setLista(antes)   // se revierte: no queda marcada si no se guardo
      setError("No se pudo marcar. Proba de nuevo.")
      setTimeout(() => setError(""), 4000)
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
                {pendientes} para usar
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
          Tu espacio de trabajo con ALBA. Pedile lo que necesites o pegá tus propias actividades para que las ordene. Después marcá con la estrella las que querés que use esta semana.
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
              placeholder={"Pedile a ALBA lo que necesites. Por ejemplo:\n\n· Dame 3 actividades de oralidad para el proyecto de la huerta\n· Armame 4 que vayan de menos a mas para trabajar rimas\n· La de las semillas anduvo barbaro, dame dos parecidas pero de conciencia fonologica\n\nO pegá tus propias actividades, una por parrafo, y ALBA las ordena."}
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
          <div className="space-y-4">
            {/* Agrupadas por capacidad: cada grupo con su encabezado, para que
                se vea de un vistazo que trabaja cada actividad. */}
            {(() => {
              const grupos: { key: string; items: ActividadDocente[] }[] = []
              // Solo las que ALBA todavia no uso. Las usadas van plegadas
              // abajo: siguen disponibles para volver a proponerse, pero no
              // ocupan lugar en la lista de trabajo.
              lista.filter((x: ActividadDocente) => x.estado === "propia").forEach((a: ActividadDocente) => {
                const k = a.eje || "sin"
                const g = grupos.find((x) => x.key === k)
                if (g) g.items.push(a)
                else grupos.push({ key: k, items: [a] })
              })
              return grupos.map((g) => {
                const info = ejeInfo(g.key)
                return (
                  <div key={g.key}>
                    <p
                      className="text-[11px] font-bold uppercase tracking-wide mb-1.5"
                      style={{ color: info ? info.color : "#94a3b8" }}
                    >
                      {info ? info.nombre : "Sin clasificar"} · {g.items.length}
                    </p>
                    <ul className="space-y-2">
                      {g.items.map((a: ActividadDocente) => {
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
                    {/* La maestra elige cual quiere que ALBA use esta semana */}
                    <button
                      onClick={() => marcarSemana(a.id, !a.elegida)}
                      title={a.elegida ? "Quitar de esta semana" : "Que ALBA use esta actividad esta semana"}
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border shrink-0 transition-colors ${
                        a.elegida
                          ? "bg-amber-100 border-amber-400 text-amber-800"
                          : "bg-white border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-600"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${a.elegida ? "fill-amber-500 text-amber-500" : ""}`} />
                      Esta semana
                    </button>
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
                      {/* Mismo orden que en el cronograma: Eje, Capacidad,
                          Observa si, Contenidos, Desarrollo, Materiales.
                          El objetivo no va: ya esta dicho en la capacidad. */}
                      {(a as any).capacidad_dc && (
                        <p className="text-xs text-slate-700">
                          <span className="font-semibold">Capacidad: </span>{(a as any).capacidad_dc}
                        </p>
                      )}
                      {a.capacidad && (
                        <p className="text-xs text-violet-800 bg-violet-50 border border-violet-200 rounded px-2 py-1">
                          <span className="font-semibold">Observa si: </span>{a.capacidad}
                        </p>
                      )}
                      {(a as any).contenidos && (
                        <p className="text-xs text-slate-600">
                          <span className="font-semibold">Contenidos: </span>{(a as any).contenidos}
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

                      {/* El eje lo decide ALBA: la docente no necesita corregirlo */}
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
                  </div>
                )
              })
            })()}
            {/* Las que ALBA ya propuso: plegadas, para no alargar la lista */}
            {lista.some((a: ActividadDocente) => a.estado !== "propia") && (
              <details className="pt-2 border-t border-slate-100">
                <summary className="text-xs font-semibold text-slate-500 cursor-pointer py-1">
                  Ya sugeridas · {lista.filter((a: ActividadDocente) => a.estado !== "propia").length}
                </summary>
                <ul className="space-y-1.5 mt-2">
                  {lista.filter((a: ActividadDocente) => a.estado !== "propia").map((a: ActividadDocente) => {
                    const info = ejeInfo(a.eje)
                    return (
                      <li key={a.id} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5">
                        <span className="flex-1 text-xs text-slate-600 truncate">{a.nombre || "Actividad sin titulo"}</span>
                        {info && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                                style={{ backgroundColor: info.bg, color: info.color }}>
                            {info.corto}
                          </span>
                        )}
                        <button
                          onClick={() => borrar(a.id)}
                          title="Borrar"
                          className="text-slate-300 hover:text-red-500 shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
