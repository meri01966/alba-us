"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, X, Plus, Check, Save, Sparkles, Dumbbell, Music, Globe, Monitor, BookOpen, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

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
  origen?: "alba" | "docente" | "red"
  origenTexto?: string
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
  const [semanaInicioActual, setSemanaInicioActual] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardadoOk, setGuardadoOk] = useState(false)

  // Clases especiales (badges arrastrables)
  const [clasesEspeciales, setClasesEspeciales] = useState<ClaseEspecial[]>([])
  const [editandoClases, setEditandoClases] = useState(false)
  const [draggingClase, setDraggingClase] = useState<TipoClase | null>(null)

  // Accordion: solo el dia de hoy abierto por defecto
  const diaHoyNombre = (() => {
    const n = new Date().getDay()
    return n === 0 || n === 6 ? "Lunes" : ["", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes"][n]
  })()
  const [diasAbiertos, setDiasAbiertos] = useState<Record<string, boolean>>(
    Object.fromEntries(DIAS.map((d) => [d, d === diaHoyNombre]))
  )
  const toggleDia = (dia: string) => setDiasAbiertos((prev) => ({ ...prev, [dia]: !prev[dia] }))

  // Sugerencias de ALBA para alfabetizacion (Lun/Mar/Vie)
  const [sugerenciasAlba, setSugerenciasAlba] = useState<SugerenciaAlba[]>([])
  const [generandoSugerencias, setGenerandoSugerencias] = useState(false)
  const [actividadesYaSugeridas, setActividadesYaSugeridas] = useState<string[]>([])
  const [proyectoTitulo, setProyectoTitulo] = useState("")
  const [proyectoObjetivo, setProyectoObjetivo] = useState("")

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
    try {
      const res = await fetch(`/api/cronograma-jardin?sala=${encodeURIComponent(sala)}`, { cache: "no-store" })
      if (res.ok) {
        const data = await res.json()
        if (data.ok && data.cronograma && Object.keys(data.cronograma).length > 0) {
          // Guardar la semana que devolvio el servidor para usarla al guardar
          if (data.semanaInicio) setSemanaInicioActual(data.semanaInicio)
          const cronogramaBase = inicializarCronograma()
          const cronogramaCargado: Record<string, DiaData> = {}
          DIAS.forEach((dia) => {
            const diaGuardado = data.cronograma[dia]
            const diaBase = cronogramaBase[dia]
            // Normalizar cada actividad para que todos los campos string requeridos existan
            const actividadesNormalizadas: Actividad[] =
              diaGuardado?.actividades?.map((a: any) => ({
                nombre:         a?.nombre         ?? "",
                capacidades:    a?.capacidades     ?? "",
                contenidos:     a?.contenidos      ?? "",
                objetivo:       a?.objetivo        ?? "",
                desarrollo:     a?.desarrollo      ?? "",
                materiales:     a?.materiales      ?? "",
                alfabetizacion: a?.alfabetizacion  ?? false,
                origen:         a?.origen          ?? "docente",
                eje:            a?.eje             ?? undefined,
              })) ?? []
            cronogramaCargado[dia] = {
              fecha:       diaGuardado?.fecha       || diaBase.fecha,
              recibimiento:diaGuardado?.recibimiento|| "",
              intercambio: diaGuardado?.intercambio || "",
              actividades: actividadesNormalizadas.length > 0 ? actividadesNormalizadas : [{ ...actividadVacia }],
              edFisica:    diaGuardado?.edFisica     || "",
              musica:      diaGuardado?.musica       || "",
              ingles:      diaGuardado?.ingles       || "",
            }
          })
          setCronograma(cronogramaCargado)
        } else {
          setCronograma(inicializarCronograma())
        }
      } else {
        setCronograma(inicializarCronograma())
      }

      const resClases = await fetch(`/api/clases-especiales-maternal?sala=${encodeURIComponent(sala)}`, { cache: "no-store" })
      if (resClases.ok) {
        const dataC = await resClases.json()
        if (dataC.ok && Array.isArray(dataC.clases)) {
          setClasesEspeciales(dataC.clases.map((c: any) => ({ tipo: c.tipo, dia: c.dia })))
        } else {
          setClasesEspeciales([])
        }
      }

      const resProy = await fetch(`/api/proyecto-maternal?sala=${encodeURIComponent(sala)}`, { cache: "no-store" })
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
    try {
      const res = await fetch(`/api/cronograma-jardin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Mandar la semana que tiene en pantalla para que guarde en la semana correcta
        body: JSON.stringify({ sala, cronograma, semana_inicio: semanaInicioActual || undefined }),
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
    try {
      await fetch(`/api/clases-especiales-maternal`, {
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
    const fecha = cronograma[dia]?.fecha || getLunesSemana().toISOString().split("T")[0]
    try {
      await fetch(`/api/actividad-planificada`, {
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
    try {
      const res = await fetch(`/api/brain`, {
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
              // El origen lo decide el brain: puede ser de ALBA, del repertorio
              // de esta sala ("docente") o de otra sala de la red ("red").
              // Antes se pisaba siempre con "alba" y se perdia esa informacion.
              actividad: { ...s.actividad, alfabetizacion: true, origen: s.actividad?.origen || "alba" },
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
    const acts = (nuevo[dia].actividades || []).filter((a) => (a.nombre || "").trim() !== "")
    nuevo[dia] = { ...nuevo[dia], actividades: [...acts, { ...sugerencia.actividad }] }
    setCronograma(nuevo)
    setSugerenciasAlba(sugerenciasAlba.filter((s) => s.dia !== dia))

    try {
      await fetch(`/api/cronograma-jardin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala, cronograma: nuevo, semana_inicio: semanaInicioActual || undefined }),
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

  // Mover una actividad al dia anterior o al siguiente.
  // La maestra ordena la semana como le queda mejor sin tener que rehacer nada.
  async function moverActividad(dia: string, idx: number, direccion: -1 | 1) {
    const i = DIAS.indexOf(dia as (typeof DIAS)[number])
    const destino = DIAS[i + direccion]
    if (!destino) return

    const actual = cronograma
    if (!actual[dia] || !actual[destino]) return
    const act = actual[dia].actividades?.[idx]
    if (!act) return

    const origenActs = actual[dia].actividades.filter((_, n) => n !== idx)
    const destinoActs = (actual[destino].actividades || []).filter((a) => (a.nombre || "").trim() !== "")

    const nuevo = {
      ...actual,
      [dia]: { ...actual[dia], actividades: origenActs.length ? origenActs : [{ ...actividadVacia }] },
      [destino]: { ...actual[destino], actividades: [...destinoActs, { ...act }] },
    }
    setCronograma(nuevo)

    try {
      await fetch(`/api/cronograma-jardin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala, cronograma: nuevo, semana_inicio: semanaInicioActual || undefined }),
      })
    } catch (e) {
      console.error("[v0] Error moviendo actividad de dia:", e)
    }
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

  // Estado para actividad expandida: "dia-idx" o null
  const [actividadAbierta, setActividadAbierta] = useState<string | null>(null)

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

        {/* Contenido - 5 columnas, una por dia */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-3 border-slate-300 border-t-[#1e3a5f] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto flex-1 p-4">
            <div className="grid grid-cols-5 gap-3 min-w-[900px]">
              {DIAS.map((dia) => {
                const sugerencia = sugerenciasAlba.find((s) => s.dia === dia)
                const clasesDelDia = clasesEspeciales.filter((c) => c.dia === dia)
                const esHoyDia = cronograma[dia]?.fecha === new Date().toISOString().split("T")[0]
                return (
                  <div
                    key={dia}
                    className={`flex flex-col rounded-xl border overflow-hidden ${esHoyDia ? "border-blue-300 ring-1 ring-blue-200" : "border-slate-200"} ${editandoClases && draggingClase ? "ring-2 ring-blue-300 ring-dashed" : ""}`}
                    onDragOver={editandoClases ? (e) => e.preventDefault() : undefined}
                    onDrop={editandoClases ? () => {
                      if (draggingClase) { agregarClaseADia(draggingClase, dia); setDraggingClase(null) }
                    } : undefined}
                  >
                    {/* Header del dia */}
                    <div
                      className="px-3 py-2.5 flex items-center justify-between flex-shrink-0"
                      style={{ background: esHoyDia ? "#1e3a5f" : "#334155" }}
                    >
                      <div>
                        <span className="font-bold text-sm text-white">{dia}</span>
                        <span className="text-[10px] text-white/60 block">{cronograma[dia]?.fecha && formatearFecha(cronograma[dia].fecha)}</span>
                      </div>
                      {clasesDelDia.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {clasesDelDia.map(c => {
                            const cfg = CONFIG_CLASES[c.tipo]; const Icon = cfg.icon
                            return (
                              <div key={c.tipo} className={`relative group flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${colorBadge(c.tipo, "dia")}`}>
                                <Icon className="w-2.5 h-2.5"/>{cfg.label}
                                {editandoClases && (
                                  <button type="button" onClick={() => eliminarClaseEspecial(c.tipo, dia)} className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex">
                                    <X className="w-2 h-2"/>
                                  </button>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Cuerpo del dia — scrolleable internamente */}
                    <div className="flex-1 p-2.5 space-y-2 overflow-y-auto bg-slate-50" style={{ minHeight: "420px" }}>

                     

                      {/* Intercambio */}
                      <div>
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block mb-0.5">Intercambio</label>
                        <textarea
                          value={cronograma[dia]?.intercambio || ""}
                          onChange={(e) => actualizarCampo(dia, "intercambio", e.target.value)}
                          placeholder="Tema del dia..."
                          className="w-full text-[11px] p-1.5 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40 bg-white"
                          rows={2}
                        />
                      </div>

                      {/* Sugerencia de ALBA */}
                      {sugerencia && (
                        <div className="p-2 bg-violet-50 border border-violet-200 rounded-lg">
                          <div className="flex items-center gap-1 mb-1">
                            <Sparkles className="w-3 h-3 text-violet-600" />
                            <span className="text-[9px] font-bold text-violet-600 uppercase tracking-wide">
                              {sugerencia.actividad.origen === "docente"
                                ? "Mi actividad"
                                : sugerencia.actividad.origen === "red"
                                ? "De la red"
                                : "Sugerida por ALBA"}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-violet-900 mb-1 leading-tight">{sugerencia.actividad.nombre}</p>
                          {sugerencia.actividad.origen === "red" && (
                            <p className="text-[9px] text-violet-700 italic mb-1 leading-snug">
                              {sugerencia.actividad.origenTexto || "Otra docente la uso con buenos resultados"}
                            </p>
                          )}
                          {sugerencia.actividad.capacidades && (
                            <p className="text-[9px] text-violet-800 mb-1 leading-snug"><span className="font-semibold">Capacidades: </span>{sugerencia.actividad.capacidades}</p>
                          )}
                          {sugerencia.actividad.contenidos && (
                            <p className="text-[9px] text-violet-800 mb-1 leading-snug"><span className="font-semibold">Contenidos: </span>{sugerencia.actividad.contenidos}</p>
                          )}
                          {sugerencia.actividad.desarrollo && (
                            <p className="text-[9px] text-violet-800 mb-1 leading-snug"><span className="font-semibold">Desarrollo: </span>{sugerencia.actividad.desarrollo}</p>
                          )}
                          {sugerencia.actividad.materiales && (
                            <p className="text-[9px] text-violet-800 mb-1.5 leading-snug"><span className="font-semibold">Materiales: </span>{sugerencia.actividad.materiales}</p>
                          )}
                          <div className="flex gap-1">
                            <button type="button" onClick={() => aceptarSugerenciaAlba(dia)} className="flex-1 text-[9px] px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded font-semibold transition-colors">Aceptar</button>
                            <button type="button" onClick={() => cambiarSugerenciaAlba(dia)} className="flex-1 text-[9px] px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded font-semibold transition-colors">Cambiar</button>
                          </div>
                        </div>
                      )}

                      {/* Actividades */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-wide" style={{ color: "#1e3a5f" }}>Actividades</span>
                          <button type="button" onClick={() => agregarActividad(dia)} className="text-[9px] font-semibold flex items-center gap-0.5 hover:opacity-70" style={{ color: "#1e3a5f" }}>
                            <Plus className="w-3 h-3" /> Agregar
                          </button>
                        </div>

                        {cronograma[dia]?.actividades?.map((act, idx) => {
                          const key = `${dia}-act-${idx}`
                          const abierta = actividadAbierta === key
                          const esAlfa = act.alfabetizacion
                          return (
                            <div key={idx} className={`rounded-lg border overflow-hidden ${esAlfa ? "border-violet-200 bg-violet-50" : "border-slate-200 bg-white"}`}>
                              {/* Fila nombre */}
                              <div className="flex items-center justify-between px-2 py-1.5 cursor-pointer hover:bg-black/5" onClick={() => setActividadAbierta(abierta ? null : key)}>
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {esAlfa && <BookOpen className="w-3 h-3 text-violet-500 flex-shrink-0" />}
                                  <span className={`text-[10px] font-semibold truncate ${esAlfa ? "text-violet-700" : "text-slate-700"}`}>
                                    {act.nombre || <span className="text-slate-400 italic">{esAlfa ? "Alfabetizacion" : "Sin nombre"}</span>}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {DIAS.indexOf(dia as (typeof DIAS)[number]) > 0 && (act.nombre || "").trim() !== "" && (
                                    <button type="button" title="Mover al dia anterior" onClick={(e) => { e.stopPropagation(); moverActividad(dia, idx, -1) }} className="text-slate-400 hover:text-slate-700">
                                      <ChevronLeft className="w-3 h-3" />
                                    </button>
                                  )}
                                  {DIAS.indexOf(dia as (typeof DIAS)[number]) < DIAS.length - 1 && (act.nombre || "").trim() !== "" && (
                                    <button type="button" title="Mover al dia siguiente" onClick={(e) => { e.stopPropagation(); moverActividad(dia, idx, 1) }} className="text-slate-400 hover:text-slate-700">
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  )}
                                  {cronograma[dia].actividades.length > 1 && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); eliminarActividad(dia, idx) }} className="text-red-400 hover:text-red-600">
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${abierta ? "rotate-180" : ""}`} />
                                </div>
                              </div>

                              {/* Detalle expandible */}
                            {abierta && ( <div className="px-2 pb-2 space-y-1.5 border-t border-slate-200/80">
                                <input
                                  type="text"
                                  value={act.nombre}
                                  onChange={(e) => actualizarActividad(dia, idx, "nombre", e.target.value)}
                                  onBlur={() => onBlurActividad(dia, idx)}
                                  placeholder="Nombre de la actividad"
                                  className="w-full mt-1.5 text-[10px] p-1.5 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40 font-semibold"
                                />
                                {[
                                  { campo: "capacidades" as keyof Actividad, label: "Capacidades" },
                                  { campo: "contenidos" as keyof Actividad, label: "Contenidos" },
                                  { campo: "desarrollo" as keyof Actividad, label: "Desarrollo", tall: true },
                                  { campo: "materiales" as keyof Actividad, label: "Materiales" },
                                ].map(({ campo, label, tall }) => (
                                  <div key={campo}>
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">{label}</label>
                                    <textarea
                                      value={(act[campo] as string) || ""}
                                      onChange={(e) => actualizarActividad(dia, idx, campo, e.target.value)}
                                      placeholder={label}
                                      className="w-full text-[10px] p-1.5 border border-slate-200 rounded resize-none focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/40"
                                      rows={tall ? 3 : 2}
                                    />
                                  </div>
                                ))}
                              </div>
                                )}         
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
