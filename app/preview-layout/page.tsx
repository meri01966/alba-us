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
  BrainCircuit,
  Printer,
  Eye,
  RefreshCw,
  Lightbulb,
  Network,
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

// ── datos MicroTraining mock ──────────────────────────────────────────────────
const MICRO_TIPS = [
  "Hola! Las rimas con nombres son geniales porque cada nene se siente protagonista. Maria-sandia, Juan-pan. Busca las rimas antes para tener opciones.",
  "Si un nombre es dificil de rimar, inventalo! Los nenes se rien mucho con rimas graciosas como 'Valentina-mandarina'.",
  "Hace una ronda: cada nene dice su nombre y entre todos buscamos algo que rime. Lo importante es el sonido.",
  "Un tip: usa una pelota. El que la tiene dice su nombre, la tira a otro que tiene que decir la rima. Movimiento + sonido.",
  "Arma un cartel con los nombres y sus rimas. Lo pueden decorar y queda para el aula toda la semana.",
]
const QUE_APRENDEN = [
  "Reconocer palabras que terminan con el mismo sonido",
  "Producir palabras que riman",
  "Disfrutar del juego con los sonidos del lenguaje",
]
const FUNDAMENTO = {
  teoria: "Conciencia Fonemica — Nivel de Rima",
  autor: "Adams (1990) · Phonemic Awareness in Young Children",
  descripcion: "La sensibilidad a las rimas es el primer peldano de la conciencia fonemica. Los ninos que reconocen y producen rimas muestran mejor desempeno lector posterior. El juego con nombres propios maximiza la motivacion.",
}

// ── materiales por actividad mock ─────────────────────────────────────────────
const MATERIALES_ACT: Record<string, string[]> = {
  "Juego con el lenguaje: canciones y rimas": ["Letras de 3 canciones impresas", "Parlante o reproductor", "Carteles con las palabras que riman"],
  "Identificacion de fonema inicial": ["Tarjetas con imagenes de objetos", "Caja decorada 'caja de sonidos'", "Marcadores"],
  "Ronda de cuentos: La tortuga y la liebre": ["Libro o cuento impreso", "Tarjetas de secuencia narrativa"],
  "Escritura del nombre propio": ["Tarjetas nombre de cada nino", "Hojas rayadas", "Lapices"],
  "Conteo de silabas con palmas": ["Lista de palabras del proyecto", "Dados numericos"],
  "Dictado al docente: texto colectivo": ["Pizarron o afiche grande", "Marcadores gruesos"],
}

// ─────────────────────────────────────────────────────────────────────────────
export default function PreviewLayout() {
  const [proyectoAbierto, setProyectoAbierto]     = useState(false)
  const [actividadAbierta, setActividadAbierta]   = useState<string | null>(null)
  const [registros, setRegistros]                 = useState<Record<string, "EP" | "R" | "A" | null>>({})
  const [albIdx, setAlbIdx]                       = useState(0)
  const [jornadaFinalizada, setJornadaFinalizada] = useState(false)
  const [audioPlaying, setAudioPlaying]           = useState(false)
  const [tipIdx, setTipIdx]                       = useState(0)
  const [showAprendizajes, setShowAprendizajes]   = useState(false)
  const [showFundamento, setShowFundamento]       = useState(false)

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

          {/* ACTIVIDAD SUGERIDA POR ALBA — igual a BrainColumn */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100">
              {/* Header identico a BrainColumn */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#eff6ff" }}>
                  <BrainCircuit className="w-4 h-4" style={{ color: "#1e3a5f" }} />
                </div>
                <p className="text-sm font-semibold" style={{ color: "#1e3a5f" }}>Sugerencia de ALBA</p>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-medium">
                  Semana {albIdx + 3}/25
                </span>
              </div>
              {/* Badges: clase#, estimulo X/3, eje */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">
                  Clase #{albIdx + 4}
                </span>
                <span className="text-xs px-2 py-1 rounded-lg bg-purple-100 text-purple-700 font-medium">
                  Estimulo {(albIdx % 3) + 1}/3
                </span>
                <span
                  className="text-xs px-2 py-1 rounded-lg font-bold text-white"
                  style={{
                    backgroundColor: actividadAlba.eje === "CF" ? "#3b82f6"
                      : actividadAlba.eje === "CT" ? "#10b981"
                      : actividadAlba.eje === "EA" ? "#6366f1"
                      : "#f59e0b"
                  }}
                >
                  {actividadAlba.eje}: {EJE_LABEL[actividadAlba.eje]}
                </span>
              </div>
            </div>

            <div className="px-4 py-3 flex-1 space-y-3">
              {/* Titulo */}
              <p className="text-base font-semibold text-slate-800 leading-snug">{actividadAlba.titulo}</p>

              {/* Descripcion — igual a BrainColumn "Desarrollo de la actividad" */}
              <div className="bg-blue-50/60 rounded-lg p-3">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1">Desarrollo de la actividad</p>
                <p className="text-sm text-slate-700 leading-relaxed">{actividadAlba.descripcion}</p>
              </div>

              {/* Objetivo */}
              <div>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mb-1">Objetivo</p>
                <p className="text-sm text-slate-700 leading-relaxed">{actividadAlba.objetivo}</p>
              </div>

              {/* Materiales */}
              {(MATERIALES_ACT[actividadAlba.titulo] ?? []).length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-[10px] font-medium text-amber-700 uppercase tracking-wide mb-2">Materiales</p>
                  <ul className="text-sm text-amber-800 space-y-1">
                    {(MATERIALES_ACT[actividadAlba.titulo] ?? []).map((m, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{m}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Proyecto activo contextualizado */}
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                <FolderOpen className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span className="text-xs text-emerald-800">
                  <span className="font-semibold">Proyecto activo:</span> Batido de Cuentos. La actividad esta contextualizada a este tema.
                </span>
              </div>

              {/* Proxima actividad */}
              {albIdx < SECUENCIA_ALBA.length - 1 && (
                <div className="bg-violet-50 border border-violet-100 rounded-lg px-3 py-2">
                  <p className="text-[10px] text-violet-600">
                    Proxima actividad: <strong>{SECUENCIA_ALBA[albIdx + 1].titulo}</strong>
                  </p>
                </div>
              )}

              {/* Botones — igual a BrainColumn */}
              <div className="flex gap-2 pt-1">
                <button type="button" className="flex-1 h-9 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5">
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir fichas
                </button>
                <button type="button" className="flex-1 h-9 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Ver secuencia
                </button>
              </div>
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

          {/* CAPACITACION — igual a MicroTraining del 4/5 real */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-semibold" style={{ color: "#1e3a5f" }}>Micro capacitacion just in time</p>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 truncate">
                Actividad: <span className="font-medium text-slate-700">{actividadAlba.titulo}</span>
              </p>
            </div>

            <div className="flex-1 p-4 space-y-3">
              {/* Imagen ALBA + burbuja de tip — fondo azul marino igual al real */}
              <div className="rounded-xl overflow-hidden" style={{ backgroundColor: "#1e3a5f" }}>
                <div className="p-4">
                  <div className="flex gap-3">
                    {/* Avatar ALBA */}
                    <div className="flex-shrink-0">
                      <div
                        className="w-16 h-16 rounded-full overflow-hidden"
                        style={{ border: "3px solid #fbbf24" }}
                      >
                        <div className="w-full h-full bg-amber-200 flex items-center justify-center text-amber-700 font-bold text-xl">
                          A
                        </div>
                      </div>
                    </div>
                    {/* Burbuja de tip */}
                    <div className="flex-1 relative">
                      <div
                        className="bg-white rounded-xl rounded-tl-none p-3 text-sm text-slate-700 leading-relaxed"
                        style={{ minHeight: "80px" }}
                      >
                        {MICRO_TIPS[tipIdx]}
                      </div>
                      <div
                        className="absolute top-3 -left-2 w-0 h-0"
                        style={{
                          borderTop: "8px solid transparent",
                          borderBottom: "8px solid transparent",
                          borderRight: "8px solid white",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Barra inferior: Otro tip + Play + contador */}
                <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: "rgba(0,0,0,0.25)" }}>
                  <button
                    type="button"
                    onClick={() => setTipIdx((tipIdx + 1) % MICRO_TIPS.length)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-amber-500 text-white hover:bg-amber-600 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Otro tip
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudioPlaying(!audioPlaying)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm bg-white/20 text-white hover:bg-white/30 transition-all"
                  >
                    {audioPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {audioPlaying ? "Pausar" : "Escuchar"}
                  </button>
                  <span className="text-xs text-white/60">{tipIdx + 1} / {MICRO_TIPS.length}</span>
                </div>
              </div>

              {/* Que deben aprender los ninos — desplegable */}
              <div className="bg-slate-50 rounded-lg px-4 py-3">
                <button
                  type="button"
                  onClick={() => setShowAprendizajes(!showAprendizajes)}
                  className="w-full text-left flex items-center justify-between text-xs font-semibold"
                  style={{ color: "#1e3a5f" }}
                >
                  <span>Que deben aprender los ninos</span>
                  <span className="text-slate-400 text-base leading-none">{showAprendizajes ? "−" : "+"}</span>
                </button>
                {showAprendizajes && (
                  <ul className="mt-2 text-xs text-slate-600 space-y-1.5">
                    {QUE_APRENDEN.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-amber-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Fundamento pedagogico — desplegable */}
              <div className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-100">
                <button
                  type="button"
                  onClick={() => setShowFundamento(!showFundamento)}
                  className="w-full text-left flex items-center justify-between text-xs font-semibold"
                  style={{ color: "#1e3a5f" }}
                >
                  <span>Fundamento pedagogico</span>
                  <span className="text-slate-400 text-base leading-none">{showFundamento ? "−" : "+"}</span>
                </button>
                {showFundamento && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-bold text-blue-700">{FUNDAMENTO.teoria}</p>
                    <p className="text-xs text-blue-600 italic">{FUNDAMENTO.autor}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{FUNDAMENTO.descripcion}</p>
                  </div>
                )}
              </div>
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
