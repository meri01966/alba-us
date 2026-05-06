"use client"

import Link from "next/link"
import { BookOpen, Users, LayoutDashboard, ArrowLeft } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import useSWR from "swr"

type StatusLevel = "green" | "yellow" | "red"

interface Student {
  id: string
  name: string
  cf: StatusLevel
  rl: StatusLevel
  o: StatusLevel
}

interface StudentsResponse {
  students: Student[]
  source: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUS_COLORS: Record<StatusLevel, string> = {
  green: "#4ade80",
  yellow: "#fbbf24",
  red: "#f87171",
}

const STATUS_LABELS: Record<StatusLevel, string> = {
  green: "Logrado",
  yellow: "En proceso",
  red: "Inicio",
}

function buildPieData(students: Student[], field: "cf" | "rl" | "o") {
  const counts: Record<StatusLevel, number> = { green: 0, yellow: 0, red: 0 }
  students.forEach((s) => counts[s[field]]++)
  const total = students.length || 1
  return (["green", "yellow", "red"] as StatusLevel[]).map((level) => ({
    name: STATUS_LABELS[level],
    value: Math.round((counts[level] / total) * 100),
    count: counts[level],
    color: STATUS_COLORS[level],
  }))
}

function TortaHito({
  title,
  data,
  total,
}: {
  title: string
  data: { name: string; value: number; count: number; color: string }[]
  total: number
}) {
  return (
    <div className="bg-slate-50 rounded-3xl border border-slate-100 p-6 flex-1 min-w-[260px]">
      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 text-center">
        {title}
      </h4>
      <p className="text-center text-xs text-slate-400 mb-4">{total} alumnos</p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [
                `${value}% (${props.payload.count} alumnos)`,
                name,
              ]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {data.map((entry) => (
          <div key={entry.name} className="text-center">
            <span
              className="block text-lg font-black"
              style={{ color: entry.color }}
            >
              {entry.value}%
            </span>
            <span className="block text-[10px] text-slate-400 font-medium leading-tight">
              {entry.name}
              <br />
              ({entry.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AlertaCard({
  students,
}: {
  students: Student[]
}) {
  const enRiesgo = students.filter(
    (s) => s.cf === "red" || s.rl === "red" || s.o === "red"
  )
  const enProceso = students.filter(
    (s) =>
      (s.cf === "yellow" || s.rl === "yellow" || s.o === "yellow") &&
      s.cf !== "red" &&
      s.rl !== "red" &&
      s.o !== "red"
  )

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
      <h3 className="font-black text-2xl text-slate-800 tracking-tight mb-6">
        Alumnos que necesitan atención
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* En riesgo */}
        <div className="bg-red-50 rounded-2xl p-5 border border-red-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-red-400 shrink-0" />
            <span className="text-sm font-black text-red-700 uppercase tracking-wider">
              Requieren intervención ({enRiesgo.length})
            </span>
          </div>
          {enRiesgo.length === 0 ? (
            <p className="text-sm text-red-400 italic">Ninguno — excelente!</p>
          ) : (
            <ul className="space-y-2">
              {enRiesgo.map((s) => (
                <li key={s.id} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                  <div className="flex gap-1">
                    {(["cf", "rl", "o"] as const).map((f) => (
                      <span
                        key={f}
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
                        style={{
                          backgroundColor:
                            s[f] === "red"
                              ? "#fecaca"
                              : s[f] === "yellow"
                              ? "#fef9c3"
                              : "#dcfce7",
                          color:
                            s[f] === "red"
                              ? "#dc2626"
                              : s[f] === "yellow"
                              ? "#ca8a04"
                              : "#16a34a",
                        }}
                      >
                        {f.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* En proceso */}
        <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-3 h-3 rounded-full bg-yellow-400 shrink-0" />
            <span className="text-sm font-black text-yellow-700 uppercase tracking-wider">
              En proceso ({enProceso.length})
            </span>
          </div>
          {enProceso.length === 0 ? (
            <p className="text-sm text-yellow-500 italic">
              Todos en logrado o intervención directa
            </p>
          ) : (
            <ul className="space-y-2">
              {enProceso.map((s) => (
                <li key={s.id} className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                  <div className="flex gap-1">
                    {(["cf", "rl", "o"] as const).map((f) => (
                      <span
                        key={f}
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
                        style={{
                          backgroundColor:
                            s[f] === "red"
                              ? "#fecaca"
                              : s[f] === "yellow"
                              ? "#fef9c3"
                              : "#dcfce7",
                          color:
                            s[f] === "red"
                              ? "#dc2626"
                              : s[f] === "yellow"
                              ? "#ca8a04"
                              : "#16a34a",
                        }}
                      >
                        {f.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MacroDashboard() {
  const { data, isLoading } = useSWR<StudentsResponse>("/api/students", fetcher, {
    revalidateOnFocus: false,
  })

  const students = data?.students ?? []
  const source = data?.source ?? null

  const cfData      = buildPieData(students, "cf")
  const rlData      = buildPieData(students, "rl")
  const oralidadData = buildPieData(students, "o")

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Volver al aula</span>
            </Link>

            <div className="w-px h-6 bg-slate-200" />

            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-xl text-primary-foreground">
                <LayoutDashboard size={18} />
              </div>
              <div>
                <span className="block text-[10px] uppercase font-black text-slate-400 leading-none">
                  Vision Macro del Aula
                </span>
                <h1 className="text-xl font-black text-primary tracking-tight">ALBA</h1>
              </div>
            </div>
          </div>

          <div className="flex gap-3 text-sm font-semibold text-slate-600">
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl">
              <Users size={14} />
              <span>{students.length} alumnos</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl">
              <BookOpen size={14} />
              <span>Sala: Manzanos</span>
            </div>
            {source && (
              <span
                className={`flex items-center px-3 py-1.5 rounded-xl text-xs font-bold ${
                  source === "airtable"
                    ? "bg-green-50 text-green-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {source === "airtable" ? "Airtable" : "Demo"}
              </span>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-screen-xl mx-auto p-6 md:p-10 space-y-8">

        {/* Tortas */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
            <h3 className="font-black text-2xl text-slate-800 tracking-tight">
              Estado de Alfabetizacion del Aula
            </h3>
            <div className="flex gap-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                Logrado
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full">
                <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
                Proceso
              </div>
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-full">
                <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                Inicio
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20 text-slate-400 text-sm">
              Cargando datos del aula...
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-center">
              <TortaHito
                title="Conciencia Fonologica (CF)"
                data={cfData}
                total={students.length}
              />
              <TortaHito
                title="Reconocimiento de Letras (RL)"
                data={rlData}
                total={students.length}
              />
              <TortaHito
                title="Oralidad (O)"
                data={oralidadData}
                total={students.length}
              />
            </div>
          )}
        </section>

        {/* Alertas por alumno */}
        {!isLoading && students.length > 0 && (
          <AlertaCard students={students} />
        )}

      </main>
    </div>
  )
}
