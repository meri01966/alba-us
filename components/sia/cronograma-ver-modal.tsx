"use client"

import { X, Sparkles, BookOpen, Music, Globe, Dumbbell, Monitor, Calendar } from "lucide-react"

const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"] as const

type TipoClase = "musica" | "ingles" | "edFisica" | "computacion"

const CONFIG_CLASES: Record<TipoClase, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  musica:      { label: "Musica",      icon: Music,    color: "text-purple-700", bg: "bg-purple-100" },
  ingles:      { label: "Ingles",      icon: Globe,    color: "text-blue-700",   bg: "bg-blue-100" },
  edFisica:    { label: "Ed. Fisica",  icon: Dumbbell, color: "text-orange-700", bg: "bg-orange-100" },
  computacion: { label: "Computacion", icon: Monitor,  color: "text-teal-700",   bg: "bg-teal-100" },
}

const EJE_COLOR: Record<string, { bg: string; text: string; border: string; tag: string }> = {
  CF:        { bg: "bg-violet-50",  text: "text-violet-800", border: "border-violet-200", tag: "bg-violet-100 text-violet-700" },
  CT:        { bg: "bg-sky-50",     text: "text-sky-800",    border: "border-sky-200",    tag: "bg-sky-100 text-sky-700" },
  Escritura: { bg: "bg-emerald-50", text: "text-emerald-800",border: "border-emerald-200",tag: "bg-emerald-100 text-emerald-700" },
}

interface Actividad {
  nombre: string
  capacidades?: string
  contenidos?: string
  objetivo?: string
  desarrollo?: string
  materiales?: string
  alfabetizacion?: boolean
  origen?: "alba" | "docente"
  eje?: string
}

interface DiaData {
  fecha: string
  recibimiento?: string
  intercambio?: string
  actividades: Actividad[]
}

interface ClaseEspecial {
  tipo: TipoClase
  dia: string
}

function formatearFecha(fecha: string): string {
  if (!fecha) return ""
  const [y, m, d] = fecha.split("-")
  const meses = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"]
  return `${parseInt(d)} ${meses[parseInt(m) - 1]}`
}

function esHoy(fecha: string): boolean {
  return fecha === new Date().toISOString().split("T")[0]
}

interface Props {
  open: boolean
  onClose: () => void
  sala: string
  cronograma: Record<string, DiaData>
  clasesEspeciales: ClaseEspecial[]
  // Opcional: si se provee, muestra un boton "Visto" en el header (uso de la directora)
  onVisto?: () => void
  vistoLabel?: string
  vistoLoading?: boolean
  vistoConfirmado?: boolean
  rangoSemana?: string
}

function SeccionDetalle({ label, texto }: { label: string; texto: string }) {
  if (!texto?.trim()) return null
  return (
    <div className="mt-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-slate-700 leading-relaxed">{texto}</p>
    </div>
  )
}

function CardActividad({ act, origen }: { act: Actividad; origen: "alba" | "docente" }) {
  const ejeColor = act.eje ? (EJE_COLOR[act.eje] || EJE_COLOR.CF) : EJE_COLOR.CF
  const esAlba = origen === "alba"

  return (
    <div className={`rounded-2xl border ${esAlba ? ejeColor.border : "border-slate-200"} overflow-hidden`}>
      {/* Header de la card */}
      <div className={`flex items-center gap-2 px-4 py-3 ${esAlba ? ejeColor.bg : "bg-slate-50"}`}>
        {esAlba
          ? <Sparkles className={`w-4 h-4 flex-shrink-0 ${ejeColor.text}`} />
          : <BookOpen className="w-4 h-4 flex-shrink-0 text-slate-500" />
        }
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${esAlba ? ejeColor.text : "text-slate-500"}`}>
              {esAlba ? `ALBA — ${act.eje || "Alfabetizacion"}` : "Actividad docente"}
            </span>
            {act.eje && esAlba && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${ejeColor.tag}`}>
                {act.eje}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nombre / titulo */}
      <div className="px-4 pt-3 pb-1">
        <h3 className="text-base font-bold text-slate-900 leading-snug">{act.nombre}</h3>
      </div>

      {/* Detalles completos */}
      <div className="px-4 pb-4">
        <SeccionDetalle label="Capacidades" texto={act.capacidades || ""} />
        <SeccionDetalle label="Contenidos" texto={act.contenidos || ""} />
        <SeccionDetalle label="Objetivo" texto={act.objetivo || ""} />
        <SeccionDetalle label="Desarrollo" texto={act.desarrollo || ""} />
        <SeccionDetalle label="Materiales" texto={act.materiales || ""} />
      </div>
    </div>
  )
}

export function CronogramaVerModal({ open, onClose, sala, cronograma, clasesEspeciales, onVisto, vistoLabel, vistoLoading, vistoConfirmado, rangoSemana }: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex-1 overflow-hidden flex flex-col bg-white m-4 rounded-2xl shadow-2xl max-h-[calc(100vh-2rem)]">

        {/* Header fijo */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ backgroundColor: "#1e3a5f" }}
        >
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-white" />
            <div>
              <p className="text-white font-bold text-base leading-none">Cronograma Semanal</p>
              <p className="text-white/60 text-xs mt-0.5">
                Sala {sala}{rangoSemana ? ` — ${rangoSemana}` : " — solo lectura"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onVisto && (
              <button
                type="button"
                onClick={onVisto}
                disabled={vistoLoading || vistoConfirmado}
                className={`h-9 px-4 flex items-center gap-2 rounded-xl text-sm font-semibold transition-colors ${
                  vistoConfirmado
                    ? "bg-emerald-500 text-white cursor-default"
                    : "bg-white text-[#1e3a5f] hover:bg-white/90"
                } disabled:opacity-70`}
              >
                {vistoConfirmado ? "Visto ✓" : vistoLoading ? "Enviando..." : (vistoLabel || "Marcar como visto")}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Leyenda ejes */}
        <div className="flex items-center gap-3 px-6 py-2 border-b border-slate-100 flex-shrink-0 flex-wrap">
          {Object.entries(EJE_COLOR).map(([eje, c]) => (
            <span key={eje} className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c.tag}`}>{eje}</span>
          ))}
          <span className="text-[10px] text-slate-400 ml-auto">Actividades de ALBA — alfabetizacion inicial</span>
        </div>

        {/* Contenido — 5 columnas con scroll */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-5 divide-x divide-slate-100 min-h-full" style={{ minWidth: "900px" }}>
            {DIAS.map((dia) => {
              const data = cronograma[dia]
              const fecha = data?.fecha || ""
              const hoy = esHoy(fecha)
              const clasesDelDia = clasesEspeciales.filter(c => c.dia === dia)
              const actividades = data?.actividades?.filter(a => a.nombre?.trim()) || []
              const actAlba = actividades.find(a => a.origen === "alba" || a.alfabetizacion)
              const actDocente = actividades.filter(a => a.origen !== "alba" && !a.alfabetizacion)

              return (
                <div key={dia} className={`flex flex-col ${hoy ? "bg-blue-50/30" : ""}`}>
                  {/* Cabecera del dia */}
                  <div
                    className={`sticky top-0 z-10 px-4 py-3 text-center border-b ${hoy ? "border-blue-300" : "border-slate-100"}`}
                    style={{ backgroundColor: hoy ? "#1e3a5f" : "#f8fafc" }}
                  >
                    <p className={`text-xs font-bold tracking-wider ${hoy ? "text-white" : "text-slate-600"}`}>
                      {dia.toUpperCase()}
                    </p>
                    <p className={`text-[11px] mt-0.5 ${hoy ? "text-blue-200" : "text-slate-400"}`}>
                      {formatearFecha(fecha)}
                    </p>
                  </div>

                  {/* Clases especiales del dia */}
                  {clasesDelDia.length > 0 && (
                    <div className="flex flex-wrap gap-1 px-3 pt-3">
                      {clasesDelDia.map((c) => {
                        const cfg = CONFIG_CLASES[c.tipo]
                        const Icon = cfg.icon
                        return (
                          <div key={c.tipo} className={`flex items-center gap-1 px-2 py-1 rounded-lg ${cfg.bg}`}>
                            <Icon className={`w-3 h-3 ${cfg.color}`} />
                            <span className={`text-[10px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Recibimiento e Intercambio del dia */}
                  {(data?.recibimiento?.trim() || data?.intercambio?.trim()) && (
                    <div className="px-3 pt-3 pb-3 space-y-1 border-b border-slate-100">
                      <SeccionDetalle label="Recibimiento" texto={data?.recibimiento || ""} />
                      <SeccionDetalle label="Intercambio" texto={data?.intercambio || ""} />
                    </div>
                  )}
                  {/* Actividades — con todos los detalles */}
                  <div className="flex-1 px-3 py-3 space-y-3">
                    {actAlba && <CardActividad act={actAlba} origen="alba" />}

                    {actDocente.map((act, i) => (
                      <CardActividad key={i} act={act} origen="docente" />
                    ))}

                    {!actAlba && actDocente.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <p className="text-xs text-slate-400">Sin actividad cargada</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
