"use client"

import { useState, useRef } from "react"
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Calendar,
  Users,
  Sparkles,
  CheckCircle2,
  FolderOpen,
  Music,
  Dumbbell,
  Monitor,
  Play,
  Pause,
  Volume2,
  ArrowRight,
} from "lucide-react"

// ── datos ficticios solo para el mockup ──────────────────────────────────────
const DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]
const FECHAS = ["2/6", "3/6", "4/6", "5/6", "6/6"]

const ALUMNOS = [
  "Ambar Lipman",       "Ana Vassena",        "Astor Worthalter",
  "Benjamin Marchetti", "Cala Urteaga",       "Caterina Gorbach",
  "Clara Carballo",     "Delfina Pereyra",    "Emma Goldstein",
  "Franco Diaz",        "Gonzalo Herrera",    "Iara Molina",
  "Ignacio Perez",      "Julian Soto",        "Lara Benitez",
  "Lucas Fernandez",    "Luna Torres",        "Martina Ruiz",
  "Mateo Lopez",        "Nicolas Alvarez",    "Olivia Romero",
  "Pedro Gimenez",      "Pilar Sandoval",     "Santiago Medina",
  "Sofia Vargas",       "Tomas Acosta",       "Valentina Cruz",
]

// Secuencia de alfabetizacion que ALBA recorre — igual a la SECUENCIA real del brain
const SECUENCIA_ALBA = [
  { titulo: "Juego con el lenguaje: canciones y rimas",         eje: "CF", numero: 1 },
  { titulo: "Identificacion de fonema inicial",                  eje: "CF", numero: 2 },
  { titulo: "Conteo de silabas con palmas",                      eje: "CF", numero: 3 },
  { titulo: "Ronda de cuentos: La tortuga y la liebre",          eje: "CT", numero: 4 },
  { titulo: "Comprension literal: personajes y acciones",        eje: "CT", numero: 5 },
  { titulo: "Escritura del nombre propio",                       eje: "EA", numero: 6 },
]

const CRONOGRAMA_DIAS: Record<string, { titulo: string; tipo: "docente" | "alba" | "especial"; eje?: string } | null> = {
  Lunes:     { titulo: "Juego con el lenguaje: canciones y rimas", tipo: "alba",     eje: "CF" },
  Martes:    { titulo: "Ronda de cuentos: La tortuga y la liebre", tipo: "docente" },
  Miercoles: { titulo: "Educacion Fisica",                          tipo: "especial" },
  Jueves:    { titulo: "Juego en sectores libres",                  tipo: "docente" },
  Viernes:   { titulo: "Escritura del nombre propio",               tipo: "alba",     eje: "EA" },
}

const EJE_COLOR: Record<string, string> = {
  CF: "bg-violet-100 text-violet-700 border-violet-200",
  EA: "bg-blue-100 text-blue-700 border-blue-200",
  CT: "bg-amber-100 text-amber-700 border-amber-200",
  O:  "bg-green-100 text-green-700 border-green-200",
}

const EJE_LABEL: Record<string, string> = {
  CF: "Conciencia Fonologica",
  EA: "Aprox. a la Escritura",
  CT: "Comprension de Textos",
  O:  "Oralidad",
}

// ─────────────────────────────────────────────────────────────────────────────
export default function PreviewLayout() {
  const [proyectoAbierto, setProyectoAbierto]   = useState(false)
  const [diaAbierto, setDiaAbierto]             = useState<string | null>(null)
  const [registros, setRegistros]               = useState<Record<string, "EP" | "R" | "A" | null>>({})
  // Indice de la actividad actual de ALBA en la secuencia
  const [albIdx, setAlbIdx]                     = useState(0)
  const [jornadaFinalizada, setJornadaFinalizada] = useState(false)
  // Audio mockup
  const [audioPlaying, setAudioPlaying]         = useState(false)

  const actividadAlba = SECUENCIA_ALBA[albIdx]

  function toggleRegistro(alumno: string, valor: "EP" | "R" | "A") {
    setRegistros(prev => ({ ...prev, [alumno]: prev[alumno] === valor ? null : valor }))
  }

  function handleFinalizarJornada() {
    setJornadaFinalizada(true)
    // Simula avance a la siguiente actividad de ALBA
    setTimeout(() => {
      setAlbIdx(prev => Math.min(prev + 1, SECUENCIA_ALBA.length - 1))
      setJornadaFinalizada(false)
      setRegistros({})
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9]" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="bg-[#1e3a5f] text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">ALBA · Nivel Inicial</p>
            <p className="text-[11px] text-white/70">Alfabetizacion 4 y 5 anos</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select className="text-xs bg-white/10 border border-white/20 text-white rounded-lg px-3 py-1.5 focus:outline-none">
            <option>Sala Manzanos (5 anos)</option>
            <option>Sala Girasoles (5 anos)</option>
            <option>Sala Alamos (5 anos)</option>
            <option>Sala Nogales TT (4 anos)</option>
            <option>Sala Nogales TM (4 anos)</option>
          </select>
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
            M
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-5 space-y-4">

        {/* ── FILA 1: Proyecto (izq) + Registro del Aula (der) ──────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* PROYECTO — 2/5 del ancho */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#1e3a5f]" />
                <span className="text-sm font-bold text-[#1e3a5f]">Proyecto</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold border border-green-200">
                  Activo
                </span>
              </div>
              <button
                onClick={() => setProyectoAbierto(!proyectoAbierto)}
                className="flex items-center gap-1 text-xs font-semibold text-[#1e3a5f] bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors"
              >
                {proyectoAbierto ? "Cerrar" : "Abrir"}
                {proyectoAbierto ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Nombre siempre visible */}
            <div className="px-4 py-3">
              <p className="font-bold text-base text-slate-800">Batido de Cuentos</p>
              <p className="text-xs text-slate-400 mt-0.5">Literatura · Jun — Jul 2025</p>
            </div>

            {/* --- ESTADO CERRADO: preview de objetivos --- */}
            {!proyectoAbierto && (
              <div className="px-4 pb-4">
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  Desarrollar el disfrute de la lectura literaria. Ampliar el vocabulario
                  y la comprension de textos narrativos.
                </p>
              </div>
            )}

            {/* --- ESTADO ABIERTO: todos los campos editables --- */}
            {proyectoAbierto && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    Titulo del proyecto
                  </label>
                  <input
                    type="text"
                    defaultValue="Batido de Cuentos"
                    className="w-full mt-1 text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    Objetivos de aprendizaje
                  </label>
                  <textarea
                    defaultValue="Desarrollar el disfrute de la lectura literaria. Ampliar el vocabulario y la comprension de textos narrativos. Explorar la estructura del cuento."
                    rows={3}
                    className="w-full mt-1 text-sm p-2 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                    Duracion
                  </label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="date"
                      defaultValue="2025-06-02"
                      className="flex-1 text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                    <input
                      type="date"
                      defaultValue="2025-07-11"
                      className="flex-1 text-xs p-2 border border-slate-200 rounded-lg focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 text-xs py-2 bg-[#1e3a5f] text-white rounded-lg font-semibold hover:bg-[#16304f] transition-colors">
                    Guardar
                  </button>
                  <button className="flex-1 text-xs py-2 border border-amber-300 text-amber-700 bg-amber-50 rounded-lg font-semibold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Finalizar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* REGISTRO DEL AULA — 3/5 del ancho */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#1e3a5f]" />
                <span className="text-sm font-bold text-[#1e3a5f]">Registro del Aula</span>
                <span className="text-[10px] text-slate-400">{ALUMNOS.length} alumnos</span>
              </div>
              <span className="text-[10px] text-slate-400">Viernes 6/6/2025</span>
            </div>

            {/* Banner actividad ALBA — actividad actual de la secuencia */}
            <div className="mx-4 mt-3 px-3 py-2.5 bg-violet-50 border border-violet-200 rounded-xl flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wide">
                    Actividad de hoy · ALBA
                  </p>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${EJE_COLOR[actividadAlba.eje]}`}>
                    {EJE_LABEL[actividadAlba.eje]}
                  </span>
                </div>
                <p className="text-sm font-semibold text-violet-900 leading-tight mt-0.5">
                  {actividadAlba.titulo}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex-1 bg-violet-200 rounded-full h-1">
                    <div
                      className="bg-violet-500 h-1 rounded-full transition-all"
                      style={{ width: `${(albIdx / (SECUENCIA_ALBA.length - 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-violet-600">
                    {albIdx + 1}/{SECUENCIA_ALBA.length} en secuencia
                  </span>
                </div>
              </div>
            </div>

            {/* Lista de alumnos — siempre visible en 2 columnas */}
            <div className="flex-1 overflow-y-auto px-4 py-3" style={{ maxHeight: 240 }}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
                {ALUMNOS.map((alumno) => {
                  const reg = registros[alumno]
                  return (
                    <div
                      key={alumno}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${reg ? "bg-green-400" : "bg-slate-200"}`} />
                        <span className="text-xs text-slate-700 truncate">{alumno}</span>
                      </div>
                      <div className="flex gap-1 flex-shrink-0 ml-2">
                        {(["EP", "R", "A"] as const).map((v) => (
                          <button
                            key={v}
                            onClick={() => toggleRegistro(alumno, v)}
                            className={`w-7 h-6 text-[10px] font-bold rounded border transition-all ${
                              reg === v
                                ? v === "EP" ? "bg-blue-500 border-blue-500 text-white"
                                  : v === "R"  ? "bg-amber-400 border-amber-400 text-white"
                                  :              "bg-green-500 border-green-500 text-white"
                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Finalizar Jornada */}
            <div className="px-4 py-3 border-t border-slate-100">
              <button
                onClick={handleFinalizarJornada}
                disabled={jornadaFinalizada}
                className={`w-full py-2.5 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  jornadaFinalizada
                    ? "bg-green-500"
                    : "bg-[#1e3a5f] hover:bg-[#16304f]"
                }`}
              >
                {jornadaFinalizada ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Guardando... ALBA avanza a la siguiente actividad
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Finalizar Jornada
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </>
                )}
              </button>
              {albIdx > 0 && !jornadaFinalizada && (
                <p className="text-[10px] text-center text-slate-400 mt-1.5">
                  Proxima actividad: <strong>{SECUENCIA_ALBA[albIdx]?.titulo}</strong>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── FILA 2: CRONOGRAMA SEMANAL ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#1e3a5f]" />
              <span className="text-sm font-bold text-[#1e3a5f]">Cronograma Semanal</span>
              <span className="text-[11px] text-slate-400">2 — 6 Jun 2025</span>
            </div>
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition-colors">
                Editar semana
              </button>
              <button className="text-xs px-3 py-1.5 bg-[#1e3a5f] text-white rounded-lg font-semibold hover:bg-[#16304f] transition-colors">
                Finalizar semana
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 divide-x divide-slate-100">
            {DIAS.map((dia, i) => {
              const act = CRONOGRAMA_DIAS[dia]
              const abierto = diaAbierto === dia
              return (
                <div key={dia} className="flex flex-col">
                  {/* Header del dia */}
                  <div className="px-3 py-2 text-center" style={{ background: "#1e3a5f" }}>
                    <p className="text-white font-bold text-xs">{dia}</p>
                    <p className="text-white/60 text-[10px]">{FECHAS[i]}</p>
                  </div>

                  <div className="p-2.5 bg-slate-50/50 flex-1 space-y-1.5">
                    {/* Dia vacio */}
                    {act === null && (
                      <button className="w-full text-[10px] text-slate-400 border border-dashed border-slate-200 rounded-lg py-3 hover:border-slate-300 hover:text-slate-500 transition-colors">
                        + Agregar actividad
                      </button>
                    )}

                    {/* Clase especial — solo badge, sin abrir */}
                    {act?.tipo === "especial" && (
                      <div className={`flex items-center gap-1.5 px-2 py-2 rounded-lg border text-[10px] font-semibold ${
                        act.titulo.includes("Musica")  ? "bg-pink-50 border-pink-200 text-pink-700" :
                        act.titulo.includes("Fisica")  ? "bg-orange-50 border-orange-200 text-orange-700" :
                        "bg-blue-50 border-blue-200 text-blue-700"
                      }`}>
                        {act.titulo.includes("Musica")  ? <Music className="w-3 h-3" /> :
                         act.titulo.includes("Fisica")  ? <Dumbbell className="w-3 h-3" /> :
                         <Monitor className="w-3 h-3" />}
                        {act.titulo}
                      </div>
                    )}

                    {/* Actividad normal o ALBA — titulo visible + Abrir */}
                    {act && act.tipo !== "especial" && (
                      <div className={`rounded-lg border overflow-hidden ${
                        act.tipo === "alba" ? "border-violet-200 bg-violet-50" : "border-slate-200 bg-white"
                      }`}>
                        {/* Fila titulo + boton abrir */}
                        <button
                          onClick={() => setDiaAbierto(abierto ? null : dia)}
                          className="w-full flex items-start justify-between px-2 py-2 hover:bg-black/5 transition-colors text-left gap-1"
                        >
                          <div className="flex items-start gap-1.5 min-w-0">
                            {act.tipo === "alba" && (
                              <Sparkles className="w-3 h-3 text-violet-500 flex-shrink-0 mt-0.5" />
                            )}
                            <span className={`text-[10px] font-semibold leading-snug ${
                              act.tipo === "alba" ? "text-violet-800" : "text-slate-700"
                            }`}>
                              {act.titulo}
                            </span>
                          </div>
                          <ChevronDown className={`w-3 h-3 flex-shrink-0 text-slate-400 transition-transform mt-0.5 ${abierto ? "rotate-180" : ""}`} />
                        </button>

                        {/* Badge eje */}
                        {act.eje && (
                          <div className="px-2 pb-1.5">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${EJE_COLOR[act.eje]}`}>
                              {EJE_LABEL[act.eje]}
                            </span>
                          </div>
                        )}

                        {/* Detalle expandible — todos los campos de planificacion */}
                        {abierto && (
                          <div className="border-t border-slate-200/80 px-2 pb-2.5 space-y-2 pt-2">
                            {[
                              { label: "Capacidades", rows: 2 },
                              { label: "Contenidos",  rows: 2 },
                              { label: "Objetivo",    rows: 2 },
                              { label: "Desarrollo",  rows: 3 },
                              { label: "Materiales",  rows: 2 },
                            ].map(({ label, rows }) => (
                              <div key={label}>
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                                  {label}
                                </label>
                                <textarea
                                  placeholder={label}
                                  rows={rows}
                                  className="w-full mt-0.5 text-[10px] p-1.5 border border-slate-200 rounded resize-none focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30 bg-white"
                                />
                              </div>
                            ))}
                            <button className="w-full mt-1 py-1.5 bg-[#1e3a5f] text-white text-[10px] font-bold rounded-lg hover:bg-[#16304f] transition-colors">
                              Guardar actividad
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── FILA 3: Sugerencias ALBA + Capacitacion ────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* SUGERENCIAS ALBA */}
          <div className="bg-white rounded-2xl border border-violet-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-bold text-violet-700">Sugerencias de ALBA</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              Esta semana trabajaste <strong>Conciencia Fonologica</strong> en 2 jornadas
              con promedio <strong>78%</strong>. El grupo avanza bien.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Para la semana que viene ALBA sugiere continuar con rimas y agregar
              identificacion de fonemas iniciales.
            </p>
          </div>

          {/* CAPACITACION — con reproductor de audio */}
          <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-700">Capacitacion</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              <strong>Recurso sugerido:</strong> DC CABA 2025 — Eje Conciencia Fonologica.
              Estrategia clave: juegos de segmentacion silabica con aplausos antes de
              introducir fonemas iniciales.
            </p>

            {/* Reproductor de audio */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
              <button
                onClick={() => setAudioPlaying(!audioPlaying)}
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  audioPlaying
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-blue-300 text-blue-600 hover:bg-blue-100"
                }`}
              >
                {audioPlaying
                  ? <Pause className="w-4 h-4" />
                  : <Play  className="w-4 h-4 ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-800 truncate">
                  Audio: Conciencia Fonologica en el aula
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-blue-200 rounded-full h-1">
                    <div
                      className={`bg-blue-500 h-1 rounded-full transition-all duration-300 ${
                        audioPlaying ? "w-1/3" : "w-0"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] text-blue-500 flex-shrink-0">4:32</span>
                </div>
              </div>
              <Volume2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Nota de preview */}
        <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-center">
          <p className="text-xs text-amber-700 font-semibold">
            PREVIEW — Layout propuesto con datos ficticios. No modifica nada del sistema real.
            Aproba este diseno y arrancamos la implementacion con los datos reales.
          </p>
        </div>

      </main>
    </div>
  )
}
