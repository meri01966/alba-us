"use client"

// ─────────────────────────────────────────────────────────────────────────────
// ALBA US · la pantalla de la maestra
//
// Una sola vista. Arriba el saludo, a la izquierda lo que da hoy, a la derecha
// lo unico que ALBA le pide. Nada se calcula aca adentro: todo lo que se ve
// viene de tres endpoints que ya deciden con la evidencia del aula.
//
//   /api/us-lesson     que clase toca hoy   (secuencia + lo que ya dio)
//   /api/coaching      que capacitacion le toca a ESTA aula hoy
//   /api/small-groups  quienes necesitan grupo chico, por habilidad
//
// Este archivo es presentacion. Si algo pedagogico esta mal, esta mal en una
// tabla o en un endpoint, no aca.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url, { cache: "no-store" }).then((r) => r.json())

type Vista = "today" | "record" | "groups"

// ── Paleta. Los mismos valores del diseno aprobado. ────────────────────────
const C = {
  paper: "#FBF7F0",
  ink: "#1E3A5F",
  body: "#3D4657",
  muted: "#8891A3",
  soft: "#9AA1B0",
  line: "#EAE7E0",
  verde: "#3FA98A",
  verdeBg: "#EAF7F2",
  ambar: "#F2A93B",
  ambarBg: "#FEF6E9",
  coral: "#EE7B5D",
  coralBg: "#FDEDE8",
  azul: "#2B5788",
  azulBg: "#EEF4FB",
  arena: "#F6F2EA",
}

function saludo(): string {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

function fechaLarga(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

// ── Piezas chicas ──────────────────────────────────────────────────────────

function Eyebrow({ children, color = C.soft }: { children: React.ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: ".09em",
        textTransform: "uppercase",
        color,
      }}
    >
      {children}
    </div>
  )
}

function Card({
  children,
  style = {},
}: {
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 2px 14px rgba(44,52,68,.06)",
        ...style,
      }}
    >
      {children}
    </div>
  )
}

function Pill({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span
      style={{
        background: bg,
        color,
        borderRadius: 999,
        padding: "6px 13px",
        fontSize: 13.5,
        fontWeight: 600,
        display: "inline-block",
      }}
    >
      {children}
    </span>
  )
}

// ── Header ─────────────────────────────────────────────────────────────────

function Header({
  sala,
  vista,
  setVista,
  nombre,
  totalAlumnos,
  gruposEsperando,
}: {
  sala: string
  vista: Vista
  setVista: (v: Vista) => void
  nombre: string | null
  totalAlumnos: number
  gruposEsperando: number
}) {
  const tabs: { id: Vista; label: string; badge?: number }[] = [
    { id: "today", label: "Today" },
    { id: "record", label: "Record" },
    { id: "groups", label: "Small Groups", badge: gruposEsperando },
  ]

  return (
    <div
      style={{
        background: "linear-gradient(103deg,#1E3A5F 0%,#2B5788 62%,#31688F 100%)",
        padding: "20px 34px 26px",
        borderRadius: "0 0 28px 28px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 22,
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "rgba(255,255,255,.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#F5C877" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1 }}>ALBA</div>
            <div style={{ fontSize: 11.5, color: "#A8C2DD", marginTop: 3, fontWeight: 600 }}>{sala}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 7 }}>
          {tabs.map((t) => {
            const on = vista === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setVista(t.id)}
                style={{
                  padding: "9px 18px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 14,
                  fontFamily: "inherit",
                  fontWeight: on ? 700 : 600,
                  background: on ? "#fff" : "transparent",
                  color: on ? C.ink : "#CBDBEB",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>{t.label}</span>
                {!!t.badge && t.badge > 0 && (
                  <span
                    style={{
                      background: C.coral,
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 800,
                      padding: "2px 7px",
                      borderRadius: 999,
                    }}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 999,
            background: "#F5C877",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 800,
            color: C.ink,
          }}
        >
          {(nombre || sala).slice(0, 2).toUpperCase()}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-.01em" }}>
            {saludo()}
            {nombre ? `, ${nombre}` : ""}
          </div>
          <div style={{ fontSize: 15, color: "#B9CFE5", marginTop: 5, fontWeight: 500 }}>
            {fechaLarga()}
            {totalAlumnos > 0 ? ` · ${totalAlumnos} students` : ""}
          </div>
        </div>
        {gruposEsperando > 0 && (
          <div
            style={{
              background: "rgba(255,255,255,.13)",
              borderRadius: 14,
              padding: "9px 16px",
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: 999, background: C.coral }} />
            <span style={{ fontSize: 13.5, color: "#fff", fontWeight: 600 }}>
              {gruposEsperando} {gruposEsperando === 1 ? "group is" : "groups are"} waiting for you
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── La clase de hoy ────────────────────────────────────────────────────────

function LessonCard({ leccion }: { leccion: any }) {
  return (
    <Card style={{ overflow: "hidden" }}>
      <div
        style={{
          background: C.azulBg,
          padding: "20px 26px 19px",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <Eyebrow color="#5C82AC">Today you are teaching</Eyebrow>
          <div
            style={{
              fontSize: 27,
              fontWeight: 800,
              letterSpacing: "-.015em",
              lineHeight: 1.15,
              color: C.ink,
              marginTop: 9,
            }}
          >
            {leccion.titulo}
          </div>
          {!!leccion.objetivo && (
            <div style={{ fontSize: 15.5, color: "#5A6478", marginTop: 7, fontWeight: 500 }}>
              {leccion.objetivo}
            </div>
          )}
        </div>
        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 9 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 800,
              color: C.azul,
            }}
          >
            {leccion.ccss_code}
          </div>
          <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600 }}>
            {leccion.seq} of {leccion.totalEnEje} · whole class
          </div>
        </div>
      </div>

      <div style={{ padding: "19px 26px 22px", display: "flex", flexDirection: "column", gap: 20 }}>
        {!!leccion.standardTexto && (
          <div>
            <Eyebrow>The standard behind it</Eyebrow>
            <div style={{ fontSize: 15, lineHeight: 1.55, color: C.body, fontWeight: 500, marginTop: 8 }}>
              {leccion.standardTexto}
            </div>
          </div>
        )}

        {!!leccion.descripcion && (
          <div>
            <Eyebrow>How it goes</Eyebrow>
            <div style={{ fontSize: 15, lineHeight: 1.6, color: C.body, fontWeight: 500, marginTop: 8 }}>
              {leccion.descripcion}
            </div>
          </div>
        )}

        {leccion.materiales?.length > 0 && (
          <div>
            <Eyebrow>You will need</Eyebrow>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
              {leccion.materiales.map((m: string, i: number) => (
                <Pill key={i} bg={C.arena} color="#6B6255">
                  {m}
                </Pill>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

// ── Before you teach · la capa de coaching de ESTA aula ────────────────────

function CoachingCard({ coaching, englishLearners }: { coaching: any; englishLearners: number }) {
  const capa = coaching?.capa

  if (!capa) {
    return (
      <Card style={{ padding: "22px 26px" }}>
        <Eyebrow color="#A78A48">Before you teach</Eyebrow>
        <div style={{ fontSize: 15.5, lineHeight: 1.6, color: C.body, fontWeight: 500, marginTop: 10 }}>
          {coaching?.mensaje || "Record a class and the coaching starts from your own evidence."}
        </div>
      </Card>
    )
  }

  return (
    <Card style={{ overflow: "hidden" }}>
      <div
        style={{
          background: C.ambarBg,
          padding: "16px 26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 11,
              background: "#F5C877",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#8A6410" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18h6" />
              <path d="M10 22h4" />
              <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#7A5A0D" }}>Before you teach</div>
            <div style={{ fontSize: 12.5, color: "#A78A48", fontWeight: 600, marginTop: 1 }}>
              {capa.trigger_human}
            </div>
          </div>
        </div>
        <div
          style={{
            background: "#fff",
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: 12.5,
            fontWeight: 700,
            color: "#A78A48",
            whiteSpace: "nowrap",
          }}
        >
          2 min
        </div>
      </div>

      <div style={{ padding: "22px 26px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: C.ink, marginBottom: 9, lineHeight: 1.25 }}>
            {capa.titulo}
          </div>
          <Eyebrow>Why this one matters</Eyebrow>
          <div style={{ fontSize: 16, lineHeight: 1.6, color: C.body, fontWeight: 500, marginTop: 8 }}>
            {capa.why_it_matters}
          </div>
        </div>

        <div>
          <Eyebrow>Do this</Eyebrow>
          <div style={{ fontSize: 16, lineHeight: 1.6, color: C.body, fontWeight: 500, marginTop: 8 }}>
            {capa.do_this}
          </div>
        </div>

        {capa.watch_for?.length > 0 && (
          <div style={{ background: "#F9FAFC", borderRadius: 16, padding: "18px 20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 13,
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <Eyebrow color="#5C82AC">
                {capa.watch_for.length === 3 ? "Three things to watch for today" : "What to watch for today"}
              </Eyebrow>
              <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, fontStyle: "italic" }}>
                these are the same ones you will tap after class
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {capa.watch_for.map((w: string, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      background: "#DCEBFA",
                      color: C.azul,
                      fontSize: 12,
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 15, color: C.body, lineHeight: 1.45, fontWeight: 500 }}>{w}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!!capa.el_note && englishLearners > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 13,
              background: C.azulBg,
              borderRadius: 16,
              padding: "16px 19px",
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.azul} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 8 6 6" />
                <path d="m4 14 6-6 2-3" />
                <path d="M2 5h12" />
                <path d="M7 2h1" />
                <path d="m22 22-5-10-5 10" />
                <path d="M14 18h6" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.azul, marginBottom: 5 }}>
                For your {englishLearners} English {englishLearners === 1 ? "learner" : "learners"}
              </div>
              <div style={{ fontSize: 14.5, lineHeight: 1.55, color: C.body, fontWeight: 500 }}>{capa.el_note}</div>
            </div>
          </div>
        )}

        {!!capa.source && (
          <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: C.soft, fontWeight: 600 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B9BFCA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>{capa.source}</span>
          </div>
        )}
      </div>
    </Card>
  )
}

// ── Columna derecha ────────────────────────────────────────────────────────

function RecordCta({ onClick }: { onClick: () => void }) {
  return (
    <div
      style={{
        background: "linear-gradient(160deg,#3FA98A 0%,#359075 100%)",
        borderRadius: 20,
        padding: "23px 24px",
        boxShadow: "0 4px 18px rgba(63,169,138,.24)",
      }}
    >
      <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", lineHeight: 1.3 }}>
        When class is over,
        <br />
        tell me who got there.
      </div>
      <div style={{ fontSize: 14, color: "#D6F0E8", marginTop: 10, lineHeight: 1.55, fontWeight: 500 }}>
        One tap per child. Thirty seconds. It is the only thing ALBA ever asks of you.
      </div>
      <button
        type="button"
        onClick={onClick}
        style={{
          width: "100%",
          background: "#fff",
          color: "#2E8A70",
          fontSize: 16,
          fontWeight: 800,
          fontFamily: "inherit",
          textAlign: "center",
          padding: 14,
          borderRadius: 14,
          marginTop: 17,
          border: "none",
          cursor: "pointer",
        }}
      >
        Record today&rsquo;s class
      </button>
    </div>
  )
}

function LastTimeCard({ resumen, estado }: { resumen: any; estado: string | null }) {
  if (!resumen || !resumen.registros) return null
  const total = resumen.registros || 1
  const verdes = resumen.verdes || 0
  const rojos = resumen.rojos || 0
  const medios = Math.max(total - verdes - rojos, 0)
  const pct = (n: number) => `${Math.round((n / total) * 100)}%`

  return (
    <Card style={{ padding: "21px 23px" }}>
      <Eyebrow>Your last three weeks</Eyebrow>
      <div style={{ fontSize: 14, color: C.muted, fontWeight: 600, margin: "5px 0 15px" }}>
        {resumen.registros} records{estado ? ` · ${estado}` : ""}
      </div>
      <div style={{ display: "flex", height: 11, borderRadius: 999, overflow: "hidden", gap: 3, marginBottom: 16 }}>
        {verdes > 0 && <div style={{ width: pct(verdes), background: C.verde, borderRadius: 999 }} />}
        {medios > 0 && <div style={{ width: pct(medios), background: C.ambar, borderRadius: 999 }} />}
        {rojos > 0 && <div style={{ width: pct(rojos), background: C.coral, borderRadius: 999 }} />}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {[
          { label: "Got there", n: verdes, c: C.verde },
          { label: "Almost", n: medios, c: C.ambar },
          { label: "Not yet", n: rojos, c: C.coral },
        ].map((r) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14.5, color: "#4A5364", fontWeight: 600 }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: r.c }} />
              {r.label}
            </span>
            <span style={{ fontSize: 17, fontWeight: 800, color: "#2C3444" }}>{r.n}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function GroupsPreview({ grupos, onOpen }: { grupos: any[]; onOpen: () => void }) {
  if (!grupos || grupos.length === 0) {
    return (
      <Card style={{ padding: "21px 23px" }}>
        <Eyebrow color="#2E8A70">Small groups</Eyebrow>
        <div style={{ fontSize: 14.5, lineHeight: 1.55, color: C.body, fontWeight: 500, marginTop: 9 }}>
          No small groups needed right now: everyone is meeting the target.
        </div>
      </Card>
    )
  }

  return (
    <Card style={{ overflow: "hidden" }}>
      <div
        style={{
          padding: "19px 23px 15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Eyebrow>Small groups waiting</Eyebrow>
        <span
          style={{
            background: C.coralBg,
            color: "#C4643F",
            fontSize: 12,
            fontWeight: 800,
            padding: "3px 10px",
            borderRadius: 999,
          }}
        >
          {grupos.length}
        </span>
      </div>
      <div style={{ padding: "0 23px 6px", display: "flex", flexDirection: "column", gap: 9 }}>
        {grupos.slice(0, 3).map((g: any, i: number) => {
          const alta = g.urgencia === "alta"
          return (
            <div key={i} style={{ background: alta ? C.coralBg : C.ambarBg, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: alta ? C.coral : C.ambar, flexShrink: 0 }} />
                <span style={{ fontSize: 15, fontWeight: 800, color: C.body }}>{g.habilidad || g.actividad}</span>
              </div>
              <div style={{ fontSize: 13.5, color: alta ? "#8E7A70" : "#95835F", fontWeight: 600, paddingLeft: 17 }}>
                {g.chicos.map((c: any) => c.nombre).filter(Boolean).join(", ")}
                {alta ? " · do not wait" : ""}
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ padding: "15px 23px 19px" }}>
        <button
          type="button"
          onClick={onOpen}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 14.5,
            fontWeight: 800,
            color: C.azul,
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          Open Small Groups
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.azul} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>
    </Card>
  )
}

// ── Record · la evaluacion de treinta segundos ─────────────────────────────
//
// Todos arrancan en "Got there" y la maestra baja al que hace falta. Es la
// diferencia entre catorce decisiones y tres. El chico ausente NO se guarda:
// una ausencia no es evidencia, y si se guardara como rojo lo mandaria a un
// grupo por no haber venido.

type EstadoChico = "green" | "yellow" | "red" | "absent"

const CICLO: Record<EstadoChico, EstadoChico> = {
  green: "yellow",
  yellow: "red",
  red: "absent",
  absent: "green",
}

const ETIQUETA: Record<EstadoChico, string> = {
  green: "GOT THERE",
  yellow: "ALMOST",
  red: "NOT YET",
  absent: "ABSENT",
}

const COLORES: Record<EstadoChico, { bg: string; borde: string; nombre: string; estado: string }> = {
  green: { bg: "#EAF7F2", borde: "#B7E3D3", nombre: "#276B58", estado: C.verde },
  yellow: { bg: "#FEF6E9", borde: "#F3DCA8", nombre: "#7A5A0D", estado: "#D19420" },
  red: { bg: "#FDEDE8", borde: "#F6C7B6", nombre: "#8F4227", estado: C.coral },
  absent: { bg: "#F4F2ED", borde: "#E2DED5", nombre: "#8B8578", estado: "#A8A296" },
}

function RecordView({
  sala,
  leccion,
  alumnos,
  watchFor,
  onListo,
}: {
  sala: string
  leccion: any
  alumnos: { id: string; nombre: string }[]
  watchFor: string[]
  onListo: () => void
}) {
  const [estados, setEstados] = useState<Record<string, EstadoChico>>({})
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guardado, setGuardado] = useState(false)

  // Todos empiezan en verde. Se arma una sola vez, cuando llega la lista.
  useEffect(() => {
    setEstados((prev) => {
      const base: Record<string, EstadoChico> = { ...prev }
      alumnos.forEach((a) => {
        if (!base[a.id]) base[a.id] = "green"
      })
      return base
    })
  }, [alumnos])

  const cuenta = (e: EstadoChico) => alumnos.filter((a) => (estados[a.id] ?? "green") === e).length

  async function guardar() {
    setGuardando(true)
    setError(null)
    try {
      const evaluaciones = alumnos
        .filter((a) => (estados[a.id] ?? "green") !== "absent")
        .map((a) => ({ alumno_id: a.id, estado: estados[a.id] ?? "green" }))

      const res = await fetch("/api/seguimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sala,
          eje: leccion.eje,
          actividad: leccion.titulo,
          evaluaciones,
        }),
      })
      const data = await res.json()
      if (!res.ok || data?.error) throw new Error(data?.error || "No se pudo guardar")
      setGuardado(true)
      setTimeout(onListo, 900)
    } catch (e: any) {
      setError(e?.message || "Something went wrong. Your taps are still here, try again.")
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div style={{ padding: "24px 34px 34px" }}>
      {watchFor.length > 0 && (
        <Card
          style={{
            padding: "18px 24px",
            marginBottom: 18,
            background: "#F9FAFC",
            boxShadow: "none",
            border: `1.5px solid ${C.line}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Eyebrow color="#5C82AC">
              {watchFor.length === 1 ? "What you said you would watch for" : "The ones you said you would watch for"}
            </Eyebrow>
            <div style={{ fontSize: 12.5, color: C.muted, fontWeight: 600, fontStyle: "italic" }}>
              from this morning&rsquo;s card
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${Math.min(watchFor.length, 3)},minmax(0,1fr))`,
              gap: 14,
            }}
          >
            {watchFor.map((w, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: "#DCEBFA",
                    color: C.azul,
                    fontSize: 11.5,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ fontSize: 14, color: C.body, fontWeight: 500, lineHeight: 1.4 }}>{w}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card style={{ padding: "22px 24px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
          {alumnos.map((a) => {
            const e = estados[a.id] ?? "green"
            const col = COLORES[e]
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => setEstados((p) => ({ ...p, [a.id]: CICLO[p[a.id] ?? "green"] }))}
                style={{
                  borderRadius: 15,
                  padding: "11px 9px",
                  textAlign: "center",
                  background: col.bg,
                  border: `2px solid ${col.borde}`,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2, color: col.nombre }}>{a.nombre}</div>
                <div style={{ fontSize: 11, fontWeight: 800, marginTop: 5, letterSpacing: ".03em", color: col.estado }}>
                  {ETIQUETA[e]}
                </div>
              </button>
            )
          })}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 22,
            paddingTop: 20,
            borderTop: `1.5px solid #F0EDE6`,
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
            {(["green", "yellow", "red", "absent"] as EstadoChico[]).map((e) => (
              <div key={e} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 11, height: 11, borderRadius: 999, background: COLORES[e].estado }} />
                <span style={{ fontSize: 14.5, fontWeight: 600, color: "#4A5364", textTransform: "capitalize" }}>
                  {ETIQUETA[e].toLowerCase()}
                </span>
                <span style={{ fontSize: 17, fontWeight: 800, color: "#2C3444" }}>{cuenta(e)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ fontSize: 13.5, color: C.muted, fontWeight: 600 }}>
              {error ? error : "This is what builds tomorrow's groups."}
            </div>
            <button
              type="button"
              onClick={guardar}
              disabled={guardando || guardado || alumnos.length === 0}
              style={{
                background: guardado ? "#2E8A70" : C.verde,
                color: "#fff",
                fontSize: 15.5,
                fontWeight: 800,
                fontFamily: "inherit",
                padding: "13px 30px",
                borderRadius: 14,
                border: "none",
                cursor: guardando || guardado ? "default" : "pointer",
                boxShadow: "0 3px 12px rgba(63,169,138,.3)",
                opacity: guardando ? 0.7 : 1,
              }}
            >
              {guardado ? "Saved" : guardando ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}

// ── Small Groups · el Tier 2, tal cual lo devuelve el endpoint ─────────────

function BloqueTexto({ label, texto, color }: { label: string; texto: string; color?: string }) {
  if (!texto) return null
  return (
    <div>
      <Eyebrow color={color}>{label}</Eyebrow>
      <div style={{ fontSize: 15, lineHeight: 1.55, color: C.body, fontWeight: 500, marginTop: 6 }}>{texto}</div>
    </div>
  )
}

function GrupoCard({ g }: { g: any }) {
  const alta = g.urgencia === "alta"
  const borde = alta ? C.coral : C.ambar
  const fondo = alta ? C.coralBg : C.ambarBg
  const tinte = alta ? "#8F4227" : "#7A5A0D"
  const label = alta ? "#C4643F" : "#B08512"

  return (
    <Card style={{ overflow: "hidden", border: `2px solid ${borde}` }}>
      <div style={{ background: fondo, padding: "18px 24px 16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ minWidth: 0 }}>
            <Eyebrow color={label}>
              {alta ? "Do not wait" : "Watch this week"} · {g.enRojo} not yet
            </Eyebrow>
            <div style={{ fontSize: 21, fontWeight: 800, color: tinte, lineHeight: 1.2, marginTop: 7 }}>
              {g.habilidad || g.actividad}
            </div>
          </div>
          {!!g.estandar && (
            <div
              style={{
                background: "#fff",
                borderRadius: 999,
                padding: "6px 14px",
                fontSize: 13,
                fontWeight: 800,
                color: label,
                flexShrink: 0,
              }}
            >
              {g.estandar}
            </div>
          )}
        </div>
        {!!g.estandarTexto && (
          <div style={{ fontSize: 14, color: alta ? "#8E6252" : "#95835F", marginTop: 9, fontWeight: 500, lineHeight: 1.5 }}>
            {g.estandarTexto}
          </div>
        )}
      </div>

      <div style={{ padding: "18px 24px 22px", display: "flex", flexDirection: "column", gap: 17 }}>
        <div>
          <Eyebrow>Who, and where each one is</Eyebrow>
          <div style={{ marginTop: 9 }}>
            {g.chicos.map((c: any) => {
              const rojo = c.estado === "red"
              return (
                <span
                  key={c.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    borderRadius: 999,
                    padding: "5px 11px",
                    fontSize: 13,
                    fontWeight: 700,
                    margin: "0 5px 6px 0",
                    background: rojo ? C.coralBg : C.ambarBg,
                    color: rojo ? "#8F4227" : "#7A5A0D",
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: rojo ? C.coral : C.ambar }} />
                  {c.nombre}
                  {c.fase ? ` · ${c.fase}` : ""}
                </span>
              )
            })}
          </div>
        </div>

        <BloqueTexto label="Why this one matters" texto={g.porQueImporta} />

        {(g.errorTipico || g.trampaDocente) && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            {!!g.errorTipico && (
              <div style={{ background: "#FDF0EC", borderRadius: 15, padding: "14px 16px" }}>
                <Eyebrow color="#C4643F">What they get wrong</Eyebrow>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: "#4A4038", fontWeight: 500, marginTop: 6 }}>
                  {g.errorTipico}
                </div>
              </div>
            )}
            {!!g.trampaDocente && (
              <div style={{ background: C.verdeBg, borderRadius: 15, padding: "14px 16px" }}>
                <Eyebrow color="#2E8A70">Where we slip</Eyebrow>
                <div style={{ fontSize: 14, lineHeight: 1.5, color: "#38443F", fontWeight: 500, marginTop: 6 }}>
                  {g.trampaDocente}
                </div>
              </div>
            )}
          </div>
        )}

        {g.refuerzo && (
          <div style={{ background: "#F9FAFC", borderRadius: 15, padding: "16px 18px" }}>
            <Eyebrow color="#5C82AC">Do this with them</Eyebrow>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: "8px 0 6px" }}>{g.refuerzo.titulo}</div>
            <div style={{ fontSize: 14.5, lineHeight: 1.55, color: C.body, fontWeight: 500 }}>
              {g.refuerzo.desarrollo || g.refuerzo.objetivo}
            </div>
            {g.refuerzo.materiales?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
                {g.refuerzo.materiales.map((m: string, i: number) => (
                  <Pill key={i} bg={C.arena} color="#6B6255">
                    {m}
                  </Pill>
                ))}
              </div>
            )}
          </div>
        )}

        {!!g.cuandoIntervenir && <BloqueTexto label="When to intervene" texto={g.cuandoIntervenir} />}

        {!!g.cautelaEL && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              background: C.azulBg,
              borderRadius: 15,
              padding: "14px 17px",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 9,
                background: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.azul} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 8 6 6" />
                <path d="m4 14 6-6 2-3" />
                <path d="M2 5h12" />
                <path d="M7 2h1" />
                <path d="m22 22-5-10-5 10" />
                <path d="M14 18h6" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: C.azul, marginBottom: 4 }}>
                If any of them is an English learner
              </div>
              <div style={{ fontSize: 14, lineHeight: 1.5, color: C.body, fontWeight: 500 }}>{g.cautelaEL}</div>
            </div>
          </div>
        )}

        {!!g.refuerzo?.referencia && (
          <div style={{ fontSize: 12.5, color: C.soft, fontWeight: 600 }}>{g.refuerzo.referencia}</div>
        )}
      </div>
    </Card>
  )
}

function GroupsView({ data }: { data: any }) {
  const grupos: any[] = data?.grupos ?? []
  const individuales: any[] = data?.individuales ?? []
  const listos: any[] = data?.listosParaEnriquecer ?? []

  if (grupos.length === 0 && individuales.length === 0) {
    return (
      <Aviso
        titulo="No small groups needed right now"
        texto={data?.mensaje || "Everyone is meeting the target in what you have recorded."}
      />
    )
  }

  return (
    <div
      style={{
        padding: "24px 34px 34px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(420px,1fr))",
        gap: 20,
        alignItems: "start",
      }}
    >
      {grupos.map((g, i) => (
        <GrupoCard key={i} g={g} />
      ))}

      {individuales.length > 0 && (
        <Card style={{ padding: "19px 23px" }}>
          <Eyebrow>On their own, so not a group</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
            {individuales.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 999,
                    background: s.estado === "red" ? C.coral : C.ambar,
                    flexShrink: 0,
                    marginTop: 6,
                  }}
                />
                <div>
                  <div style={{ fontSize: 15.5, fontWeight: 800, color: C.body }}>
                    {s.nombre} · {s.actividad}
                  </div>
                  <div style={{ fontSize: 13.5, color: C.muted, fontWeight: 600, marginTop: 2 }}>
                    Nobody else is here. Two minutes with them, not a group.
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {listos.length > 0 && (
        <Card style={{ padding: "19px 23px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
            <Eyebrow color="#2E8A70">Ready for more</Eyebrow>
            <span
              style={{
                background: C.verdeBg,
                color: "#2E8A70",
                fontSize: 12,
                fontWeight: 800,
                padding: "3px 10px",
                borderRadius: 999,
              }}
            >
              {listos.length}
            </span>
          </div>
          <div style={{ marginBottom: 11 }}>
            {listos.map((s) => (
              <span
                key={s.id}
                style={{
                  display: "inline-block",
                  borderRadius: 999,
                  padding: "5px 11px",
                  fontSize: 13,
                  fontWeight: 700,
                  margin: "0 5px 6px 0",
                  background: C.verdeBg,
                  color: "#276B58",
                }}
              >
                {s.nombre}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 14.5, lineHeight: 1.55, color: C.body, fontWeight: 500 }}>
            Nothing below target in three weeks. They work on their own while you take the first group.
          </div>
          <div style={{ fontSize: 12.5, color: C.soft, fontWeight: 600, marginTop: 10 }}>
            Advanced phoneme manipulation looks like a result of reading, not a cause. ALBA does not send you there.
          </div>
        </Card>
      )}
    </div>
  )
}

// ── Estados de carga y vacio ───────────────────────────────────────────────

function Aviso({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div style={{ padding: "26px 34px" }}>
      <Card style={{ padding: "30px 32px" }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: C.ink }}>{titulo}</div>
        <div style={{ fontSize: 15.5, lineHeight: 1.6, color: C.body, fontWeight: 500, marginTop: 9 }}>{texto}</div>
      </Card>
    </div>
  )
}

// ── La pantalla ────────────────────────────────────────────────────────────

export default function TodayScreen({ sala }: { sala: string }) {
  const [vista, setVista] = useState<Vista>("today")
  const [nombre, setNombre] = useState<string | null>(null)

  // El nombre se lee DESPUES del montaje. En el servidor no existe localStorage
  // y leerlo durante el render rompe la hidratacion de React.
  useEffect(() => {
    try {
      setNombre(localStorage.getItem("alba_us_teacher_name"))
    } catch {}
  }, [])

  const q = encodeURIComponent(sala)
  const {
    data: lessonData,
    isLoading: cargandoLeccion,
    mutate: mutarLeccion,
  } = useSWR(`/api/us-lesson?sala=${q}`, fetcher, { revalidateOnFocus: true })
  const { data: coachingData, mutate: mutarCoaching } = useSWR(`/api/coaching?sala=${q}`, fetcher, {
    revalidateOnFocus: true,
  })
  const { data: groupsData, mutate: mutarGrupos } = useSWR(`/api/small-groups?sala=${q}`, fetcher, {
    revalidateOnFocus: true,
  })

  const leccion = lessonData?.leccion ?? null
  const totalAlumnos = lessonData?.totalAlumnos ?? 0
  const englishLearners = lessonData?.englishLearners ?? 0
  const grupos: any[] = groupsData?.grupos ?? []

  return (
    <div style={{ background: C.paper, minHeight: "100vh", color: "#2C3444" }}>
      <Header
        sala={sala}
        vista={vista}
        setVista={setVista}
        nombre={nombre}
        totalAlumnos={totalAlumnos}
        gruposEsperando={grupos.length}
      />

      {cargandoLeccion && <Aviso titulo="One moment" texto="Reading what this classroom has recorded." />}

      {!cargandoLeccion && totalAlumnos === 0 && (
        <Aviso
          titulo="This classroom has no students yet"
          texto="Add your class list and ALBA starts from the first lesson of the sequence."
        />
      )}

      {!cargandoLeccion && totalAlumnos > 0 && !leccion && (
        <Aviso
          titulo="No lessons loaded for this grade yet"
          texto={lessonData?.mensaje || "The sequence for this grade and skill area is empty."}
        />
      )}

      {!cargandoLeccion && vista === "today" && leccion && (
        <div
          style={{
            padding: "26px 34px 34px",
            display: "grid",
            gridTemplateColumns: "minmax(0,1.95fr) minmax(0,1fr)",
            gap: 22,
            alignItems: "start",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <LessonCard leccion={leccion} />
            <CoachingCard coaching={coachingData} englishLearners={englishLearners} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <RecordCta onClick={() => setVista("record")} />
            <LastTimeCard resumen={coachingData?.resumen} estado={coachingData?.estado ?? null} />
            <GroupsPreview grupos={grupos} onOpen={() => setVista("groups")} />
          </div>
        </div>
      )}

      {vista === "record" && leccion && (
        <RecordView
          sala={sala}
          leccion={leccion}
          alumnos={lessonData?.alumnos ?? []}
          watchFor={coachingData?.capa?.watch_for ?? []}
          onListo={() => {
            mutarLeccion()
            mutarCoaching()
            mutarGrupos()
            setVista("today")
          }}
        />
      )}

      {vista === "groups" && <GroupsView data={groupsData} />}
    </div>
  )
}
