"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, X, Plus, Check, Save, Sparkles, Dumbbell, Music, Globe, Monitor, BookOpen, CheckCircle } from "lucide-react"

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"] as const
// Las 3 actividades de alfabetizacion sugeridas por ALBA van en estos dias
const DIAS_ALFABETIZACION = ["Lunes", "Martes", "Viernes"] as const

// Salas de 5 anos (Musica, Ed. Fisica, Computacion) vs salas de 4 (Musica, Ingles, Ed. Fisica)
const SALAS_5 = ["Girasoles", "Manzanos", "Alamos"]

type TipoClase = "musica" | "ingles" | "edFisica" | "computacion"

interface ConfigClase {
  tipo: TipoClase
  label: string
  icon: typeof Music
  color: string // clases tailwind base del color
}

const CONFIG_CLASES: Record<TipoClase, ConfigClase> = {
  musica:      { tipo: "musica",      label: "Musica",     icon: Music,    color: "purple" },
  ingles:      { tipo: "ingles",      label: "Ingles",     icon: Globe,    color: "blue" },
  edFisica:    { tipo: "edFisica",    label: "Ed. Fisica", icon: Dumbbell, color: "orange" },
  computacion: { tipo: "computacion", label: "Computacion",icon: Monitor,  color: "teal" },
}

function clasesPorSala(sala: string): TipoClase[] {
  return SALAS_5.includes(sala)
    ? ["musica", "edFisica", "computacion"]
    : ["musica", "ingles", "edFisica"]
}

function colorBadge(tipo: TipoClase, mode: "panel" | "dia"): string {
  const c = CONFIG_CLASES[tipo].color
  const map: Record<string, string> = {
    purple: "border-purple-500 text-purple-700 bg-purple-100",
    blue: "border-blue-500 text-blue-700 bg-blue-100",
    orange: "border-orange-500 text-orange-700 bg-orange-100",
    teal: "border-teal-500 text-teal-700 bg-teal-100",
  }
  return map[c]
}

interface Actividad {
  nombre: string
  capacidades: string
  contenidos: string
  objetivo: string
  desarrollo: string
  materiales: string
  alfabetizacion?: boolean // marcada como actividad de alfabetizacion (sugerida por ALBA o cargada por la maestra)
  origen?: "alba" | "docente"
}

interface DiaData {
  fecha: string
  recibimiento: string
  intercambio: string
  actividades: Actividad[]
  edFisica: string
  musica: string
  ingles: string
}

interface ClaseEspecial {
  tipo: TipoClase
  dia: string
}

interface SugerenciaAlba {
  dia: string
  actividad: Actividad
}

const actividadVacia: Actividad = {
  nombre: "",
  capacidades: "",
  contenidos: "",
  objetivo: "",
  desarrollo: "",
  materiales: "",
}

function getLunesSemana(): Date {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

function formatearFecha(fecha: string): string {
  if (!fecha) return ""
  const [y, m, d] = fecha.split("-")
  return `${d}/${m}`
}

interface CronogramaSemanalProps {
  isOpen: boolean
  onClose: () => void
  sala: string
  students?: { id: string; nombre: string }[]
}

export function CronogramaSemanal({ isOpen, onClose, sala, students = [] }: CronogramaSemanalProps) {
  const [cronograma, setCronograma] = useState<Record<string, DiaData>>({})
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardadoOk, setGuardadoOk] = useState(false)

  // Clases especiales (badges arrastrables)
  const [clasesEspeciales, setClasesEspeciales] = useState<ClaseEspecial[]>([])
  const [editandoClases, setEditandoClases] = useState(false)
  const [draggingClase, setDraggingClase] = useState<TipoClase | null>(null)

  // Sugerencias de ALBA para alfabetizacion (Lun/Mar/Vie)
  const [sugerenciasAlba, setSugerenciasAlba] = useState<SugerenciaAlba[]>([])
  const [generandoSugerencias, setGenerandoSugerencias] = useState(false)
  const [actividadesYaSugeridas, setActividadesYaSugeridas] = useState<string[]>([])
  const [proyectoTitulo, setProyectoTitulo] = useState("")
  const [proyectoObjetivo, setProyectoObjetivo] = useState("")

  // Calificacion al finalizar semana
  const [showCalificacionModal, setShowCalificacionModal] = useState(false)
  const [calificaciones, setCalificaciones] = useState<Record<string, string>>({})

  const tiposDisponibles = clasesPorSala(sala)

  const inicializarCronograma = useCallback(() => {
    const lunes = getLunesSemana()
    const nuevo: Record<string, DiaData> = {}
    DIAS.forEach((dia, idx) => {
      const fecha = new Date(lunes)
      fecha.setDate(fecha.getDate() + idx)
      nuevo[dia] = {
        fecha: fecha.toISOString().split("T")[0],
        recibimiento: "",
        intercambio: "",
        actividades: [{ ...actividadVacia }],
        edFisica: "",
        musica: "",
        ingles: "",
      }
    })
    return nuevo
  }, [])

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    try {
      // Cronograma
      const res = await fetch(`${base}/api/cronograma-maternal?sala=${encodeURIComponent(sala)}`, { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        if (data.ok && data.cronograma && Object.keys(data.cronograma).length > 0) {
          setCronograma(data.cronograma)
        } else {
          setCronograma(inicializarCronograma())
        }
      } else {
        setCronograma(inicializarCronograma())
      }

      // Clases especiales
      const resClases = await fetch(`${base}/api/clases-especiales-maternal?sala=${encodeURIComponent(sala)}`, { cache: "no-store" })
      if (resClases.ok) {
        const dataC = await resClases.json()
        if (dataC.ok && Array.isArray(dataC.clases)) {
          setClasesEspeciales(dataC.clases.map((c: any) => ({ tipo: c.tipo, dia: c.dia })))
        } else {
          setClasesEspeciales([])
        }
      }

      // Proyecto activo (para que ALBA sugiera en contexto)
      const resProy = await fetch(`${base}/api/proyecto-maternal?sala=${encodeURIComponent(sala)}`, { cache: "no-store" })
      if (resProy.ok) {
        const dataP = await resProy.json()
        if (dataP.ok && dataP.proyecto) {
          setProyectoTitulo(dataP.proyecto.titulo || "")
          setProyectoObjetivo(dataP.proyecto.objetivo_general || "")
        }
      }
    } catch (e) {
      console.error("[v0] Error cargando cronograma 4/5:", e)
      setCronograma(inicializarCronograma())
    }
    setLoading(false)
  }, [sala, inicializarCronograma])

  useEffect(() => {
    if (isOpen) {
      cargarDatos()
      setSugerenciasAlba([])
      setEditandoClases(false)
    }
  }, [isOpen, cargarDatos])

  async function guardarCronograma() {
    setGuardando(true)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    try {
      const res = await fetch(`${base}/api/cronograma-maternal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala, cronograma }),
      })
      if (res.ok) {
        setGuardadoOk(true)
        setTimeout(() => setGuardadoOk(false), 2500)
      }
    } catch (e) {
      console.error("[v0] Error guardando cronograma 4/5:", e)
    }
    setGuardando(false)
  }

  // ── Clases especiales ──────────────────────────────────────────────
  async function guardarClasesEspeciales() {
    const base = typeof window !== "undefined" ? window.location.origin : ""
    try {
      await fetch(`${base}/api/clases-especiales-maternal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala, clases: clasesEspeciales }),
      })
    } catch (e) {
      console.error("[v0] Error guardando clases especiales:", e)
    }
    setEditandoClases(false)
    setDraggingClase(null)
  }

  function agregarClaseADia(tipo: TipoClase, dia: string) {
    // Maximo 2 de cada tipo por semana
    if (clasesEspeciales.filter((c) => c.tipo === tipo).length >= 2) return
    setClasesEspeciales([...clasesEspeciales, { tipo, dia }])
  }

  function eliminarClaseEspecial(tipo: TipoClase, dia: string) {
    const idx = clasesEspeciales.findIndex((c) => c.tipo === tipo && c.dia === dia)
    if (idx >= 0) {
      const nuevas = [...clasesEspeciales]
      nuevas.splice(idx, 1)
      setClasesEspeciales(nuevas)
    }
  }

  // ── Red de insumos ─────────────────────────────────────────────────
  // Toda actividad cargada por la maestra se incorpora a la red para que ALBA la redistribuya
  async function incorporarARed(actividad: Actividad, dia: string) {
    if (!actividad?.nombre?.trim()) return
    const base = typeof window !== "undefined" ? window.location.origin : ""
    const fecha = cronograma[dia]?.fecha || getLunesSemana().toISOString().split("T")[0]
    try {
      await fetch(`${base}/api/actividad-planificada`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha,
          actividad: `${actividad.nombre}${actividad.objetivo ? " — " + actividad.objetivo : ""}`,
          eje: actividad.alfabetizacion ? "Alfabetizacion" : "General",
          sala,
        }),
      })
    } catch (e) {
      console.error("[v0] Error incorporando actividad a la red:", e)
    }
  }

  // ── ALBA sugiere 3 actividades de alfabetizacion (Lun/Mar/Vie) ──────
  async function generarSugerenciasAlba() {
    setGenerandoSugerencias(true)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    try {
      const res = await fetch(`${base}/api/brain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sugerir_actividades_semana",
          proyecto: {
            titulo: proyectoTitulo || "Alfabetizacion inicial",
            objetivoGeneral: proyectoObjetivo || "Aproximacion a la lengua escrita: reconocimiento de su nombre, sonidos iniciales y escritura espontanea",
          },
          sala,
          dias: [...DIAS_ALFABETIZACION],
          actividadesYaSugeridas,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.sugerencias && Array.isArray(data.sugerencias)) {
          // Marcar como actividades de alfabetizacion sugeridas por ALBA
          setSugerenciasAlba(
            data.sugerencias.map((s: SugerenciaAlba) => ({
              dia: s.dia,
              actividad: { ...s.actividad, alfabetizacion: true, origen: "alba" as const },
            })),
          )
        }
      }
    } catch (e) {
      console.error("[v0] Error generando sugerencias ALBA:", e)
    }
    setGenerandoSugerencias(false)
  }

  // Aceptar sugerencia: se inserta en el cronograma como actividad de alfabetizacion fija
  async function aceptarSugerenciaAlba(dia: string) {
    const sugerencia = sugerenciasAlba.find((s) => s.dia === dia)
    if (!sugerencia) return

    setActividadesYaSugeridas([...actividadesYaSugeridas, sugerencia.actividad.nombre])

    const nuevo = { ...cronograma }
    if (!nuevo[dia]) return
    const acts = (nuevo[dia].actividades || []).filter((a) => a.nombre.trim() !== "")
    nuevo[dia] = { ...nuevo[dia], actividades: [...acts, { ...sugerencia.actividad }] }
    setCronograma(nuevo)
    setSugerenciasAlba(sugerenciasAlba.filter((s) => s.dia !== dia))

    const base = typeof window !== "undefined" ? window.location.origin : ""
    try {
      await fetch(`${base}/api/cronograma-maternal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala, cronograma: nuevo }),
      })
    } catch (e) {
      console.error("[v0] Error guardando sugerencia aceptada:", e)
    }
    // La actividad aceptada tambien se incorpora a la red de insumos
    incorporarARed(sugerencia.actividad, dia)
  }

  // Cambiar/rechazar sugerencia: el lugar queda vacio para que la maestra cargue la suya.
  // Se agrega un slot de alfabetizacion vacio marcado para la maestra.
  function cambiarSugerenciaAlba(dia: string) {
    const sugerencia = sugerenciasAlba.find((s) => s.dia === dia)
    if (sugerencia) {
      setActividadesYaSugeridas([...actividadesYaSugeridas, sugerencia.actividad.nombre])
    }
    setSugerenciasAlba(sugerenciasAlba.filter((s) => s.dia !== dia))

    // Insertar slot vacio de alfabetizacion para que la maestra lo complete
    setCronograma((prev) => {
      if (!prev[dia]) return prev
      const acts = prev[dia].actividades || []
      // Evitar duplicar slots de alfabetizacion vacios
      const yaTieneSlotVacio = acts.some((a) => a.alfabetizacion && a.origen === "docente" && !a.nombre.trim())
      if (yaTieneSlotVacio) return prev
      return {
        ...prev,
        [dia]: {
          ...prev[dia],
          actividades: [...acts.filter((a) => a.nombre.trim() !== "" || !a.alfabetizacion), { ...actividadVacia, alfabetizacion: true, origen: "docente" }],
        },
      }
    })
  }

  // ── Actividades ────────────────────────────────────────────────────
  function actualizarCampo(dia: string, campo: keyof DiaData, valor: string) {
    setCronograma((prev) => ({ ...prev, [dia]: { ...prev[dia], [campo]: valor } }))
  }

  function actualizarActividad(dia: string, index: number, campo: keyof Actividad, valor: string) {
    setCronograma((prev) => {
      const nuevasActividades = [...prev[dia].actividades]
      nuevasActividades[index] = { ...nuevasActividades[index], [campo]: valor }
      return { ...prev, [dia]: { ...prev[dia], actividades: nuevasActividades } }
    })
  }

  // Al salir del campo nombre, si es actividad de la maestra, incorporar a la red
  function onBlurActividad(dia: string, index: number) {
    const act = cronograma[dia]?.actividades?.[index]
    if (act && act.origen !== "alba" && act.nombre.trim()) {
      incorporarARed(act, dia)
    }
  }

  function agregarActividad(dia: string) {
    setCronograma((prev) => ({
      ...prev,
      [dia]: { ...prev[dia], actividades: [...prev[dia].actividades, { ...actividadVacia }] },
    }))
  }

  function eliminarActividad(dia: string, index: number) {
    setCronograma((prev) => {
      const nuevasActividades = prev[dia].actividades.filter((_, i) => i !== index)
      return {
        ...prev,
        [dia]: { ...prev[dia], actividades: nuevasActividades.length ? nuevasActividades : [{ ...actividadVacia }] },
      }
    })
  }

  // ── Finalizar semana (calificar) ───────────────────────────────────
  // Reune todas las actividades de alfabetizacion cargadas en la semana
  function actividadesAlfabetizacion(): { dia: string; idx: number; act: Actividad }[] {
    const out: { dia: string; idx: number; act: Actividad }[] = []
    DIAS.forEach((dia) => {
      cronograma[dia]?.actividades?.forEach((act, idx) => {
        if (act.alfabetizacion && act.nombre.trim()) out.push({ dia, idx, act })
      })
    })
    return out
  }

  async function finalizarSemana() {
    if (!confirm("Finalizar esta semana? El cronograma se blanqueara para la semana siguiente.")) return
    setGuardando(true)
    const base = typeof window !== "undefined" ? window.location.origin : ""
    try {
      await fetch(`${base}/api/cronograma-maternal`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala }),
      })
      setCronograma(inicializarCronograma())
      setSugerenciasAlba([])
      setCalificaciones({})
    } catch (e) {
      console.error("[v0] Error finalizando semana:", e)
    }
    setGuardando(false)
    setShowCalificacionModal(false)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-7xl my-4 max-h-[92vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between rounded-t-2xl flex-shrink-0" style={{ background: "#1e3a5f" }}>
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-bold text-white">Cronograma Semanal</h2>
              <p className="text-xs text-white/70">Sala {sala} {SALAS_5.includes(sala) ? "(5 anos)" : "(4 anos)"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={generarSugerenciasAlba}
              disabled={generandoSugerencias}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
              title="ALBA sugiere 3 actividades de alfabetizacion (Lunes, Martes y Viernes)"
            >
              {generandoSugerencias ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              ALBA sugiere
            </button>
            {editandoClases ? (
              <button
                type="button"
                onClick={guardarClasesEspeciales}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
              >
                <Check className="w-4 h-4" /> Listo
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setEditandoClases(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-medium transition-colors"
              >
                <Dumbbell className="w-4 h-4" /> Editar clases
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowCalificacionModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
            >
              <CheckCircle className="w-4 h-4" /> Finalizar Semana
            </button>
            <button
              type="button"
              onClick={guardarCronograma}
              disabled={guardando}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {guardando ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : guardadoOk ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {guardadoOk ? "Guardado" : "Guardar"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
            >
              <X className="w-4 h-4" /> Cerrar
            </button>
          </div>
        </div>

        {/* Panel de badges arrastrables */}
        {editandoClases && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 flex-shrink-0">
            <p className="text-xs text-blue-700 mb-2 font-medium">
              Arrastra los badges al dia correspondiente (2 de cada uno maximo). Una vez cargados quedan fijos.
            </p>
            <div className="flex flex-wrap gap-2">
              {tiposDisponibles.map((tipo) =>
                [1, 2].map((n) => {
                  const cfg = CONFIG_CLASES[tipo]
                  const Icon = cfg.icon
                  const usado = clasesEspeciales.filter((c) => c.tipo === tipo).length >= n
                  return (
                    <div
                      key={`${tipo}-${n}`}
                      draggable={!usado}
                      onDragStart={() => !usado && setDraggingClase(tipo)}
                      onDragEnd={() => setDraggingClase(null)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-l-4 ${colorBadge(tipo, "panel").split(" ")[0]} ${usado ? "bg-gray-100 opacity-50" : "bg-white cursor-grab active:cursor-grabbing shadow-sm hover:shadow"}`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="text-xs font-medium text-slate-700">{cfg.label} {n}</span>
                    </div>
                  )
                }),
              )}
            </div>
          </div>
        )}

        {/* Contenido - 5 dias */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-slate-300 border-t-[#1e3a5f] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 overflow-y-auto flex-1">
            {DIAS.map((dia) => {
              const sugerencia = sugerenciasAlba.find((s) => s.dia === dia)
              const clasesDelDia = clasesEspeciales.filter((c) => c.dia === dia)
              return (
                <div
                  key={dia}
                  className={`bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col ${editandoClases && draggingClase ? "ring-2 ring-blue-300 ring-dashed" : ""}`}
                  onDragOver={editandoClases ? (e) => e.preventDefault() : undefined}
                  onDrop={editandoClases ? () => {
                    if (draggingClase) {
                      agregarClaseADia(draggingClase, dia)
                      setDraggingClase(null)
                    }
                  } : undefined}
                >
                  {/* Header del dia */}
                  <div className="text-white px-3 py-2 text-center" style={{ background: "#1e3a5f" }}>
                    <div className="font-bold">{dia}</div>
                    <div className="text-xs opacity-80">{cronograma[dia]?.fecha && formatearFecha(cronograma[dia].fecha)}</div>
                  </div>

                  <div className="p-3 space-y-3">
                    {/* Sugerencia de ALBA (alfabetizacion) */}
                    {sugerencia && (
                      <div className="p-2 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3 text-violet-600" />
                          <span className="text-[9px] font-bold text-violet-600 uppercase">Alfabetizacion · ALBA</span>
                        </div>
                        <p className="text-[10px] font-medium text-slate-700 mb-1">{sugerencia.actividad.nombre}</p>
                        <p className="text-[9px] text-slate-500 mb-2 line-clamp-2">{sugerencia.actividad.objetivo}</p>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => aceptarSugerenciaAlba(dia)}
                            className="flex-1 text-[9px] px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded font-medium transition-colors"
                          >
                            Aceptar
                          </button>
                          <button
                            type="button"
                            onClick={() => cambiarSugerenciaAlba(dia)}
                            className="flex-1 text-[9px] px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded font-medium transition-colors"
                          >
                            Cambiar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Recibimiento */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Recibimiento</label>
                      <textarea
                        value={cronograma[dia]?.recibimiento || ""}
                        onChange={(e) => actualizarCampo(dia, "recibimiento", e.target.value)}
                        placeholder="Rutina de inicio..."
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg resize-none h-12 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40"
                      />
                    </div>

                    {/* Intercambio */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase">Intercambio</label>
                      <textarea
                        value={cronograma[dia]?.intercambio || ""}
                        onChange={(e) => actualizarCampo(dia, "intercambio", e.target.value)}
                        placeholder="Tema del dia..."
                        className="w-full text-xs p-2 border border-slate-200 rounded-lg resize-none h-12 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40"
                      />
                    </div>

                    {/* Clases especiales del dia */}
                    <div className="space-y-1">
                      {clasesDelDia.map((clase, idx) => {
                        const cfg = CONFIG_CLASES[clase.tipo]
                        const Icon = cfg.icon
                        return (
                          <div
                            key={`${clase.tipo}-${idx}`}
                            className={`relative group flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border-l-3 ${colorBadge(clase.tipo, "dia")}`}
                          >
                            <Icon className="w-3 h-3" /> {cfg.label}
                            {editandoClases && (
                              <button
                                type="button"
                                onClick={() => eliminarClaseEspecial(clase.tipo, dia)}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        )
                      })}
                      {clasesDelDia.length === 0 && (
                        <p className="text-[10px] text-slate-400 italic">Sin clases especiales</p>
                      )}
                    </div>

                    {/* Actividades */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase" style={{ color: "#1e3a5f" }}>Actividades</label>
                        <button
                          type="button"
                          onClick={() => agregarActividad(dia)}
                          className="text-[10px] font-medium flex items-center gap-0.5 hover:opacity-70"
                          style={{ color: "#1e3a5f" }}
                        >
                          <Plus className="w-3 h-3" /> Agregar
                        </button>
                      </div>

                      {cronograma[dia]?.actividades?.map((act, idx) => (
                        <div
                          key={idx}
                          className={`border rounded-lg p-2 space-y-1.5 ${act.alfabetizacion ? "bg-violet-50 border-violet-200" : "bg-white border-slate-200"}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold flex items-center gap-1" style={{ color: act.alfabetizacion ? "#7c3aed" : "#1e3a5f" }}>
                              {act.alfabetizacion && <BookOpen className="w-3 h-3" />}
                              {act.alfabetizacion ? "Alfabetizacion" : `Actividad ${idx + 1}`}
                            </span>
                            {cronograma[dia].actividades.length > 1 && (
                              <button
                                type="button"
                                onClick={() => eliminarActividad(dia, idx)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                          <input
                            type="text"
                            value={act.nombre}
                            onChange={(e) => actualizarActividad(dia, idx, "nombre", e.target.value)}
                            onBlur={() => onBlurActividad(dia, idx)}
                            placeholder="Nombre de la actividad"
                            className="w-full text-[10px] p-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40 font-medium"
                          />
                          <textarea
                            value={act.capacidades}
                            onChange={(e) => actualizarActividad(dia, idx, "capacidades", e.target.value)}
                            placeholder="Capacidades"
                            className="w-full text-[10px] p-1.5 border border-slate-200 rounded resize-none h-8 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40"
                          />
                          <textarea
                            value={act.contenidos}
                            onChange={(e) => actualizarActividad(dia, idx, "contenidos", e.target.value)}
                            placeholder="Contenidos"
                            className="w-full text-[10px] p-1.5 border border-slate-200 rounded resize-none h-8 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40"
                          />
                          <textarea
                            value={act.objetivo}
                            onChange={(e) => actualizarActividad(dia, idx, "objetivo", e.target.value)}
                            placeholder="Objetivo"
                            className="w-full text-[10px] p-1.5 border border-slate-200 rounded resize-none h-8 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40"
                          />
                          <textarea
                            value={act.desarrollo}
                            onChange={(e) => actualizarActividad(dia, idx, "desarrollo", e.target.value)}
                            placeholder="Desarrollo"
                            className="w-full text-[10px] p-1.5 border border-slate-200 rounded resize-none h-12 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40"
                          />
                          <textarea
                            value={act.materiales}
                            onChange={(e) => actualizarActividad(dia, idx, "materiales", e.target.value)}
                            placeholder="Materiales"
                            className="w-full text-[10px] p-1.5 border border-slate-200 rounded resize-none h-8 focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Calificar Actividades de Alfabetizacion al Finalizar Semana */}
      {showCalificacionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowCalificacionModal(false) }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-600 flex-shrink-0">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-white" />
                <h2 className="text-xl font-bold text-white">Calificar Actividades de Alfabetizacion</h2>
              </div>
              <button onClick={() => setShowCalificacionModal(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-sm text-slate-600 mb-4">
                Califica las actividades de alfabetizacion realizadas esta semana (sugeridas por ALBA o escritas por la maestra). Esto ayuda a ALBA a mejorar sus sugerencias.
              </p>

              {actividadesAlfabetizacion().length === 0 && (
                <p className="text-center text-slate-500 py-8">No hay actividades de alfabetizacion cargadas esta semana.</p>
              )}

              {actividadesAlfabetizacion().map(({ dia, idx, act }) => {
                const key = `${dia}-${idx}`
                return (
                  <div key={key} className="mb-4 bg-slate-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-violet-600" />
                      <p className="font-semibold text-slate-800">{act.nombre}</p>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 ml-auto">
                        {dia} · {act.origen === "alba" ? "ALBA" : "Maestra"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">Calificacion:</span>
                      {["Excelente", "Buena", "Regular"].map((cal) => (
                        <button
                          key={cal}
                          type="button"
                          onClick={() => setCalificaciones({ ...calificaciones, [key]: cal })}
                          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                            calificaciones[key] === cal
                              ? cal === "Excelente" ? "bg-green-500 text-white"
                                : cal === "Buena" ? "bg-blue-500 text-white"
                                : "bg-amber-500 text-white"
                              : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {cal}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              <button onClick={() => setShowCalificacionModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors">
                Cancelar
              </button>
              <button
                onClick={finalizarSemana}
                disabled={guardando}
                className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 shadow-md"
              >
                {guardando ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Confirmar y Finalizar Semana
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
