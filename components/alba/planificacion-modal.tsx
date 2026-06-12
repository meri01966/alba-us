"use client"

import { useState } from "react"
import useSWR from "swr"
import {
  X, NotebookPen, FolderOpen, ChevronDown, ChevronRight,
  Calendar, Loader2, CheckCircle2, Clock
} from "lucide-react"

interface PlanificacionModalProps {
  isOpen: boolean
  onClose: () => void
  sala: string
}

// ── Tipos ──────────────────────────────────────────────────────────────────
interface Actividad {
  id?: string
  titulo?: string
  objetivo?: string
  desarrollo?: string
  materiales?: string
}

interface Proyecto {
  id: string
  titulo: string
  objetivo_general: string
  estado: "activo" | "finalizado"
  actividades: Actividad[]
  created_at: string
  finalizado_at?: string | null
}

interface DiaData {
  fecha: string
  actividades: { nombre?: string; objetivo?: string; desarrollo?: string; materiales?: string[]; origen?: string }[]
}

interface CronogramaArchivado {
  id: string
  semana_inicio: string
  dias: Record<string, DiaData>
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const fetcher = (url: string) => fetch(url).then(r => r.json())

function formatFecha(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-AR", {
    day: "numeric", month: "short", year: "numeric"
  })
}

// ── Componente proyecto ──────────────────────────────────────────────────────
function ProyectoCard({ proyecto }: { proyecto: Proyecto }) {
  const [abierto, setAbierto] = useState(false)
  const esActivo = proyecto.estado === "activo"
  const inicio = formatFecha(proyecto.created_at.split("T")[0])
  const fin = proyecto.finalizado_at ? formatFecha(proyecto.finalizado_at.split("T")[0]) : null
  const acts = (proyecto.actividades || []).filter(a => a.titulo || a.objetivo)

  return (
    <div className={`rounded-xl border overflow-hidden ${esActivo ? "border-blue-300 ring-1 ring-blue-100" : "border-slate-200"}`}>
      <button
        type="button"
        onClick={() => setAbierto(v => !v)}
        className={`w-full flex items-center justify-between p-4 text-left transition ${esActivo ? "bg-blue-50 hover:bg-blue-100" : "bg-slate-50 hover:bg-slate-100"}`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${esActivo ? "bg-blue-100" : "bg-slate-100"}`}>
            <FolderOpen className={`w-4 h-4 ${esActivo ? "text-blue-600" : "text-slate-500"}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-slate-800">{proyecto.titulo}</p>
              {esActivo && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wide">
                  Activo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {esActivo ? `Desde ${inicio}` : `${inicio} — ${fin}`}
              {acts.length > 0 && ` · ${acts.length} actividad${acts.length !== 1 ? "es" : ""}`}
            </p>
          </div>
        </div>
        {abierto
          ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        }
      </button>

      {abierto && (
        <div className="p-4 space-y-3 border-t border-slate-100 bg-white">
          {proyecto.objetivo_general && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Objetivo general</p>
              <p className="text-sm text-slate-700 leading-relaxed">{proyecto.objetivo_general}</p>
            </div>
          )}
          {acts.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Actividades</p>
              <div className="space-y-2">
                {acts.map((a, i) => (
                  <div key={i} className="bg-slate-50 rounded-lg border border-slate-100 p-3">
                    {a.titulo && <p className="text-xs font-semibold text-blue-700 mb-1">{i + 1}. {a.titulo}</p>}
                    {a.objetivo && <p className="text-xs text-slate-600 mb-1"><span className="font-medium">Objetivo:</span> {a.objetivo}</p>}
                    {a.desarrollo && <p className="text-xs text-slate-700 leading-relaxed mb-1">{a.desarrollo}</p>}
                    {a.materiales && <p className="text-xs text-slate-500"><span className="font-medium">Materiales:</span> {a.materiales}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Componente cronograma archivado ──────────────────────────────────────────
const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]

function CronogramaArchivadoCard({ cron }: { cron: CronogramaArchivado }) {
  const [abierto, setAbierto] = useState(false)
  const lunes = formatFecha(cron.semana_inicio)
  const totalActs = DIAS.reduce((acc, d) => acc + ((cron.dias[d]?.actividades || []).filter(a => (a.nombre || "").trim()).length), 0)

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <button
        type="button"
        onClick={() => setAbierto(v => !v)}
        className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Semana del {lunes}</p>
            <p className="text-xs text-slate-500">{totalActs} actividad{totalActs !== 1 ? "es" : ""} planificada{totalActs !== 1 ? "s" : ""}</p>
          </div>
        </div>
        {abierto
          ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        }
      </button>

      {abierto && (
        <div className="border-t border-slate-100 bg-white divide-y divide-slate-50">
          {DIAS.map(dia => {
            const diaData = cron.dias[dia]
            const acts = (diaData?.actividades || []).filter(a => (a.nombre || "").trim())
            if (acts.length === 0) return null
            return (
              <div key={dia} className="p-4">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-2">
                  {dia} {diaData?.fecha ? `· ${formatFecha(diaData.fecha)}` : ""}
                </p>
                <div className="space-y-2">
                  {acts.map((a, i) => (
                    <div key={i} className={`rounded-lg p-3 ${a.origen === "alba" ? "bg-violet-50 border border-violet-100" : "bg-slate-50 border border-slate-100"}`}>
                      <p className={`text-xs font-semibold mb-1 ${a.origen === "alba" ? "text-violet-700" : "text-slate-700"}`}>
                        {a.origen === "alba" && "ALBA · "}{a.nombre}
                      </p>
                      {a.objetivo && <p className="text-xs text-slate-600"><span className="font-medium">Objetivo:</span> {a.objetivo}</p>}
                      {a.desarrollo && <p className="text-xs text-slate-600 mt-1 leading-relaxed">{a.desarrollo}</p>}
                      {a.materiales && a.materiales.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1"><span className="font-medium">Materiales:</span> {Array.isArray(a.materiales) ? a.materiales.join(", ") : a.materiales}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Modal principal ──────────────────────────────────────────────────────────
type Tab = "proyectos" | "cronogramas"

export function PlanificacionModal({ isOpen, onClose, sala }: PlanificacionModalProps) {
  const [tab, setTab] = useState<Tab>("proyectos")

  const proyKey = isOpen && sala ? `/api/proyectos?sala=${encodeURIComponent(sala)}` : null
  const cronKey = isOpen && sala ? `/api/cronograma-jardin?sala=${encodeURIComponent(sala)}&historial=true` : null

  const { data: proyData, isLoading: proyLoading } = useSWR(proyKey, fetcher, { revalidateOnFocus: false })
  const { data: cronData, isLoading: cronLoading } = useSWR(cronKey, fetcher, { revalidateOnFocus: false })

  const proyectoActivo: Proyecto | null = proyData?.activo ?? null
  const historialProyectos: Proyecto[] = proyData?.historial ?? []
  const todosProyectos: Proyecto[] = [
    ...(proyectoActivo ? [proyectoActivo] : []),
    ...historialProyectos,
  ]

  // Cronogramas finalizados — la API devuelve cronograma de la semana actual,
  // pero con historial=true devuelve todos los finalizados agrupados por semana
  const cronogramasArchivados: CronogramaArchivado[] = cronData?.historial ?? []

  const loading = tab === "proyectos" ? proyLoading : cronLoading

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[88vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between flex-shrink-0" style={{ background: "#1e3a5f" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <NotebookPen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Mi Planificacion</h2>
              <p className="text-xs text-white/70">Sala {sala} · {new Date().getFullYear()}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-full hover:bg-white/20 transition">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 flex-shrink-0">
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-medium transition ${tab === "proyectos" ? "text-blue-700 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"}`}
            onClick={() => setTab("proyectos")}
          >
            Proyectos
          </button>
          <button
            type="button"
            className={`flex-1 py-3 text-sm font-medium transition ${tab === "cronogramas" ? "text-blue-700 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"}`}
            onClick={() => setTab("cronogramas")}
          >
            Semanas archivadas
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : tab === "proyectos" ? (
            <div className="space-y-3">
              {todosProyectos.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium text-slate-600">No hay proyectos todavia</p>
                  <p className="text-xs mt-1">Los proyectos se crean desde el tablero principal</p>
                </div>
              ) : (
                todosProyectos.map(p => <ProyectoCard key={p.id} proyecto={p} />)
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {cronogramasArchivados.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-medium text-slate-600">No hay semanas archivadas todavia</p>
                  <p className="text-xs mt-1">Cuando finalizas una semana en el cronograma, queda guardada aqui</p>
                </div>
              ) : (
                cronogramasArchivados.map(c => <CronogramaArchivadoCard key={c.id} cron={c} />)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
