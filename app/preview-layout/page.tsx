"use client"

import { useState } from "react"
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
  Globe,
} from "lucide-react"

// ── datos ficticios solo para el mockup ─────────────────────────────────────
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

// Secuencia real de ALBA — la misma que corre en el brain
const SECUENCIA_ALBA = [
  {
    titulo: "Juego con el lenguaje: canciones y rimas",
    eje: "CF",
    numero: 1,
    objetivo: "Identificar la rima como relacion sonora entre palabras. Desarrollar atencion auditiva.",
    descripcion: "La docente presenta 3 canciones cortas con rimas marcadas. Los ninos escuchan, repiten y luego identifican las palabras que riman.",
  },
  {
    titulo: "Identificacion de fonema inicial",
    eje: "CF",
    numero: 2,
    objetivo: "Reconocer el sonido inicial de palabras del vocabulario cotidiano.",
    descripcion: "Se trabaja con imagenes de objetos del aula. La docente dice el nombre lentamente y los ninos identifican el primer sonido.",
  },
  {
    titulo: "Ronda de cuentos: La tortuga y la liebre",
    eje: "CT",
    numero: 3,
    objetivo: "Comprender la secuencia narrativa y los personajes del cuento.",
    descripcion: "Lectura en voz alta seguida de preguntas de comprension literal y reordenamiento de escenas.",
  },
  {
    titulo: "Escritura del nombre propio",
    eje: "EA",
    numero: 4,
    objetivo: "Reconocer y escribir el nombre propio como primer texto significativo.",
    descripcion: "Cada nino busca su tarjeta nombre y copia su nombre en papel. Se trabaja letra por letra con la tarjeta como modelo.",
  },
  {
    titulo: "Conteo de silabas con palmas",
    eje: "CF",
    numero: 5,
    objetivo: "Segmentar palabras en silabas utilizando el propio cuerpo.",
    descripcion: "Juego grupal: la docente dice una palabra y los ninos palmean la cantidad de silabas. Luego cuentan y comparan.",
  },
  {
    titulo: "Dictado al docente: texto colectivo",
    eje: "EA",
    numero: 6,
    objetivo: "Participar en la produccion de un texto colectivo.",
    descripcion: "El grupo dicta una historia y la docente escribe en el pizarron verbalizando cada decision.",
  },
]

const CRONOGRAMA_DIAS: Record<string, { titulo: string; tipo: "docente" | "alba" | "especial"; eje?: string } | null> = {
  Lunes:     { titulo: "Juego con el lenguaje: canciones y rimas", tipo: "alba",     eje: "CF" },
  Martes:    { titulo: "Ronda de cuentos con titeres",              tipo: "docente" },
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
  const [proyectoAbierto, setProyectoAbierto]     = useState(false)
  const [actividadAbierta, setActividadAbierta]   = useState<string | null>(null)
  const [registros, setRegistros]                 = useState<Record<string, "EP" | "R" | "A" | null>>({})
  const [albIdx, setAlbIdx]                       = useState(0)
  const [jornadaFinalizada, setJornadaFinalizada] = useState(false)
  const [audioPlaying, setAudioPlaying]           = useState(false)

  const actividadAlba = SECUENCIA_ALBA[albIdx]

  function toggleRegistro(alumno: string, valor: "EP" | "R" | "A") {
    setRegistros(prev => ({ ...prev, [alumno]: prev[alumno] === valor ? null : valor }))
  }

  function handleFinalizarJornada() {
    setJornadaFinalizada(true)
    setTimeout(() => {
      setAlbIdx(prev => Math.min(prev + 1, SECUENCIA_ALBA.length - 1))
      setJornadaFinalizada(false)
      setRegistros({})
    }, 1400)
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
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold cursor-pointer">
            M
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-5 space-y-4">

        {/* ── FILA 1: CRONOGRAMA SEMANAL ─────────────────────────────────────── */}
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

          {/* 5 columnas — una por dia */}
          <div className="grid grid-cols-5 divide-x divide-slate-100">
            {DIAS.map((dia, i) => {
              const act = CRONOGRAMA_DIAS[dia]
              const key = `crono-${dia}`
              const abierto = actividadAbierta === key
              return (
                <div key={dia} className="flex flex-col">
                  {/* Header del dia */}
                  <div className="px-3 py-2 text-center" style={{ background: "#1e3a5f" }}>
                    <p className="text-white font-bold text-xs">{dia}</p>
                    <p className="text-white/60 text-[10px]">{FECHAS[i]}</p>
                  </div>

                  <div className="p-2.5 bg-slate-50/50 flex-1 space-y-1.5 min-h-[80px]">

                    {/* Dia vacio */}
                    {!act && (
                      <button className="w-full text-[10px] text-slate-400 border border-dashed border-slate-200 rounded-lg py-4 hover:border-slate-300 transition-colors">
                        + Agregar
                      </button>
                    )}

                    {/* Clase especial — badge fijo sin boton abrir */}
                    {act?.tipo === "especial" && (
                      <div className={`flex items-center gap-1.5 px-2 py-2 rounded-lg border text-[10px] font-semibold ${
                        act.titulo.includes("Musica")  ? "bg-pink-50 border-pink-200 text-pink-700" :
                        act.titulo.includes("Fisica")  ? "bg-orange-50 border-orange-200 text-orange-700" :
                        "bg-blue-50 border-blue-200 text-blue-700"
                      }`}>
                        {act.titulo.includes("Musica")  ? <Music    className="w-3 h-3 flex-shrink-0" /> :
                         act.titulo.includes("Fisica")  ? <Dumbbell className="w-3 h-3 flex-shrink-0" /> :
                         act.titulo.includes("Ingles")  ? <Globe    className="w-3 h-3 flex-shrink-0" /> :
                                                          <Monitor  className="w-3 h-3 flex-shrink-0" />}
                        {act.titulo}
                      </div>
                    )}

                    {/* Actividad docente o ALBA — titulo visible + boton Abrir */}
                    {act && act.tipo !== "especial" && (
                      <div className={`rounded-lg border overflow-hidden ${
                        act.tipo === "alba" ? "border-violet-200 bg-violet-50" : "border-slate-200 bg-white"
                      }`}>

                        {/* Fila compacta: icono + titulo + boton ABRIR */}
                        <div className="flex items-start gap-1.5 px-2 pt-2 pb-1">
                          {act.tipo === "alba" && (
                            <Sparkles className="w-3 h-3 text-violet-500 flex-shrink-0 mt-0.5" />
                          )}
                          <p className={`text-[10px] font-semibold leading-snug flex-1 ${
                            act.tipo === "alba" ? "text-violet-800" : "text-slate-700"
                          }`}>
                            {act.titulo}
                          </p>
                        </div>

                        {act.eje && (
                          <div className="px-2 pb-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${EJE_COLOR[act.eje]}`}>
                              {EJE_LABEL[act.eje]}
                            </span>
                          </div>
                        )}

                        {/* Boton ABRIR siempre visible */}
                        <button
                          onClick={() => setActividadAbierta(abierto ? null : key)}
                          className={`w-full flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold border-t transition-colors ${
                            abierto
                              ? "border-slate-200 bg-slate-100 text-slate-600"
                              : act.tipo === "alba"
                                ? "border-violet-200 text-violet-600 hover:bg-violet-100"
                                : "border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          {abierto ? (
                            <><ChevronUp className="w-3 h-3" /> Cerrar</>
                          ) : (
                            <><ChevronDown className="w-3 h-3" /> Abrir</>
                          )}
                        </button>

                        {/* Detalle expandible — todos los campos */}
                        {abierto && (
                          <div className="border-t border-slate-200/60 px-2 pb-2.5 pt-2 space-y-2 bg-white">
                            {[
                              { label: "Capacidades", rows: 2 },
                              { label: "Contenidos",  rows: 2 },
                              { label: "Objetivo",    rows: 2 },
                              { label: "Desarrollo",  rows: 3 },
                              { label: "Materiales",  rows: 2 },
                            ].map(({ label, rows }) => (
                              <div key={label}>
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block mb-0.5">
                                  {label}
                                </label>
                                <textarea
                                  placeholder={label}
                                  rows={rows}
                                  className="w-full text-[10px] p-1.5 border border-slate-200 rounded resize-none focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
                                />
                              </div>
                            ))}
                            <button className="w-full py-1.5 bg-[#1e3a5f] text-white text-[10px] font-bold rounded-lg hover:bg-[#16304f] transition-colors">
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

        {/* ── FILA 2: Proyecto + Actividad ALBA ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* PROYECTO */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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
              {!proyectoAbierto && (
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Desarrollar el disfrute de la lectura literaria y ampliar el vocabulario a traves de cuentos.
                </p>
              )}
            </div>

            {/* Campos editables — solo cuando esta abierto */}
            {proyectoAbierto && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Titulo del proyecto
                  </label>
                  <input
                    type="text"
                    defaultValue="Batido de Cuentos"
                    className="w-full text-sm p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Objetivos de aprendizaje
                  </label>
                  <textarea
                    defaultValue="Desarrollar el disfrute de la lectura literaria. Ampliar el vocabulario y la comprension. Explorar la estructura del cuento."
                    rows={3}
                    className="w-full text-sm p-2 border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                    Duracion
                  </label>
                  <div className="flex gap-2">
                    <input type="date" defaultValue="2025-06-02" className="flex-1 text-xs p-2 border border-slate-200 rounded-lg focus:outline-none" />
                    <input type="date" defaultValue="2025-07-11" className="flex-1 text-xs p-2 border border-slate-200 rounded-lg focus:outline-none" />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 text-xs py-2 bg-[#1e3a5f] text-white rounded-lg font-semibold hover:bg-[#16304f] transition-colors">
                    Guardar
                  </button>
                  <button className="flex-1 text-xs py-2 border border-amber-300 text-amber-700 bg-amber-50 rounded-lg font-semibold hover:bg-amber-100 transition-colors flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Finalizar proyecto
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVIDAD DE ALBA — la actividad actual de la secuencia */}
          <div className="bg-white rounded-2xl border border-violet-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-violet-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-600" />
                <span className="text-sm font-bold text-violet-700">Actividad de hoy · ALBA</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${EJE_COLOR[actividadAlba.eje]}`}>
                {EJE_LABEL[actividadAlba.eje]}
              </span>
            </div>

            <div className="px-4 py-4 flex-1 space-y-3">
              {/* Numero en secuencia */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-violet-100 rounded-full h-1.5">
                  <div
                    className="bg-violet-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${((albIdx) / (SECUENCIA_ALBA.length - 1)) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-violet-600 font-semibold flex-shrink-0">
                  {albIdx + 1} / {SECUENCIA_ALBA.length} en secuencia
                </span>
              </div>

              {/* Titulo de la actividad */}
              <div>
                <p className="text-base font-bold text-slate-800 leading-snug">{actividadAlba.titulo}</p>
              </div>

              {/* Objetivo */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Objetivo</p>
                <p className="text-xs text-slate-600 leading-relaxed">{actividadAlba.objetivo}</p>
              </div>

              {/* Descripcion */}
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Descripcion</p>
                <p className="text-xs text-slate-600 leading-relaxed">{actividadAlba.descripcion}</p>
              </div>

              {albIdx < SECUENCIA_ALBA.length - 1 && (
                <div className="bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-violet-600">
                    Proxima actividad: <strong>{SECUENCIA_ALBA[albIdx + 1].titulo}</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── FILA 3: REGISTRO DEL AULA (lista completa alumnos) ─────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#1e3a5f]" />
              <span className="text-sm font-bold text-[#1e3a5f]">Registro del Aula</span>
              <span className="text-[10px] text-slate-400">{ALUMNOS.length} alumnos · Viernes 6/6</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">
                {Object.values(registros).filter(Boolean).length} / {ALUMNOS.length} registrados
              </span>
            </div>
          </div>

          {/* Lista en 3 columnas — todos visibles sin scroll */}
          <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0.5">
            {ALUMNOS.map((alumno) => {
              const reg = registros[alumno]
              return (
                <div
                  key={alumno}
                  className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      reg === "A" ? "bg-green-400" :
                      reg === "R" ? "bg-amber-400" :
                      reg === "EP" ? "bg-blue-400" :
                      "bg-slate-200"
                    }`} />
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
                            : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
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

          {/* Finalizar Jornada */}
          <div className="px-5 py-3 border-t border-slate-100">
            <button
              onClick={handleFinalizarJornada}
              disabled={jornadaFinalizada}
              className={`w-full py-2.5 text-white text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                jornadaFinalizada ? "bg-green-500" : "bg-[#1e3a5f] hover:bg-[#16304f]"
              }`}
            >
              {jornadaFinalizada ? (
                <><CheckCircle2 className="w-4 h-4" /> Guardando... ALBA avanza a la siguiente actividad</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Finalizar Jornada <ArrowRight className="w-3.5 h-3.5 opacity-60" /></>
              )}
            </button>
          </div>
        </div>

        {/* ── FILA 4: Sugerencias ALBA + Capacitacion ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* SUGERENCIAS ALBA — lo mismo que hoy: consejos y resumen de semana */}
          <div className="bg-white rounded-2xl border border-violet-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-bold text-violet-700">Sugerencias de ALBA</span>
            </div>
            <div className="space-y-2">
              <div className="bg-violet-50 rounded-lg px-3 py-2 border border-violet-100">
                <p className="text-[10px] font-bold text-violet-600 uppercase mb-0.5">Esta semana</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Trabajaste <strong>Conciencia Fonologica</strong> en 2 jornadas con promedio <strong>78%</strong>. El grupo consolida bien la rima.
                </p>
              </div>
              <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">Proxima semana</p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  ALBA sugiere avanzar a <strong>identificacion de fonema inicial</strong>. 3 ninos necesitan refuerzo en segmentacion silabica.
                </p>
              </div>
            </div>
          </div>

          {/* CAPACITACION — igual a la de 4/5 actual: texto + audio */}
          <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-blue-700">Capacitacion</span>
            </div>

            <p className="text-xs font-semibold text-slate-700 mb-1">
              DC CABA 2025 — Conciencia Fonologica
            </p>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              La conciencia fonologica es la capacidad de identificar y manipular los sonidos del habla.
              Se desarrolla progresivamente: primero rimas, luego silabas y finalmente fonemas.
              El juego y la cancion son los vehiculos principales en el nivel inicial.
            </p>

            {/* Reproductor de audio — igual al actual */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
              <button
                onClick={() => setAudioPlaying(!audioPlaying)}
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  audioPlaying
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-blue-300 text-blue-600 hover:bg-blue-100"
                }`}
              >
                {audioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-800 truncate">
                  Conciencia Fonologica en el aula
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-blue-200 rounded-full h-1">
                    <div
                      className={`bg-blue-500 h-1 rounded-full transition-all duration-700 ${
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

        {/* Nota preview */}
        <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-center">
          <p className="text-xs text-amber-700 font-semibold">
            PREVIEW — Datos ficticios. Toca Abrir en el cronograma para ver el detalle.
            Toca Finalizar Jornada para ver como ALBA avanza en la secuencia.
            Aprobado este diseno, implementamos con los datos reales.
          </p>
        </div>

      </main>
    </div>
  )
}
