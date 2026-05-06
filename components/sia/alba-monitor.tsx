// components/sia/alba-monitor.tsx
// Pantalla de evaluación rápida + mapa de progreso
// Integrar en tu page.tsx existente
"use client";

import { useState, useEffect, useCallback } from "react";

// ═══ TIPOS ═══

interface Alumno {
  id: string;
  nombre: string;
  apellido: string;
}

interface ProgresoAlumno {
  [alumnoId: string]: {
    CF: number; // porcentaje 0-100
    CT: number;
    O: number;
  };
}

interface AlbaMonitorProps {
  // Si ya tenés los alumnos cargados en tu app, pasalos como prop:
  alumnosExternos?: Alumno[];
  // Si querés que cargue de tu API:
  apiUrl?: string;
  // Callback cuando se guarda un registro:
  onRegistroGuardado?: () => void;
}

// ═══ CONSTANTES ═══

const EJES: Record<string, { nombre: string; sigla: string; color: string; icon: string; total: number }> = {
  CF: { nombre: "Conciencia Fonológica", sigla: "CF", color: "#6366F1", icon: "🔊", total: 40 },
  CT: { nombre: "Comprensión de Textos", sigla: "CT", color: "#0D9488", icon: "📖", total: 20 },
  O:  { nombre: "Oralidad", sigla: "O", color: "#D97706", icon: "🗣️", total: 40 },
};

const ACTIVIDADES: Record<string, string[]> = {
  CF: [
    "Reconocimiento de letras","Identificar rimas","Producir rimas",
    "Segmentar sílabas (2)","Segmentar sílabas (3)","Contar sílabas",
    "Sonido inicial /m/","Sonido inicial /s/","Sonido inicial /p/",
    "Sonido final","Aislar primer fonema","Aislar último fonema",
    "Segmentar fonemas CVC","Segmentar fonemas CVCV",
    "Síntesis fonémica (3)","Síntesis fonémica (4)",
    "Omitir sílaba inicial","Omitir sílaba final","Sustituir sonidos",
    "Juego del espía","Lotería de sonidos","Robot que habla lento",
    "Tren de sonidos","Caja de rimas","Dominó silábico",
    "Saltos silábicos","Canción vocálica",
    "Reconocer A","Reconocer E","Reconocer I","Reconocer O","Reconocer U",
    "Escritura A","Escritura E","Escritura I","Escritura O","Escritura U",
    "Correspondencia M","Correspondencia L","Correspondencia S"
  ],
  CT: [
    "Identificar personaje","Identificar escenario",
    "Identificar conflicto (guiado)","Identificar conflicto (autónomo)",
    "Identificar resolución","Cruz de Análisis completa",
    "Secuencia temporal (3)","Secuencia temporal (5)",
    "Inferencia simple","Predicción narrativa",
    "Vocabulario Tier 2 (5)","Vocabulario Tier 2 (10)",
    "Renarración guiada","Renarración autónoma",
    "Comprensión texto informativo","Comparar dos cuentos",
    "Mapa previo","Veo-Pienso-Me pregunto",
    "Antes pensaba / Ahora pienso","¿Qué te hace decir eso?"
  ],
  O: [
    "Eco: S+V","Eco: S+V+P","Eco: con adjetivo",
    "Oración completa (guiado)","Oración completa (autónomo)",
    "Describir imagen","Narrar experiencia",
    "Conector 'porque'","Conector 'entonces'","Conector 'pero'",
    "Conector 'después'","Conector 'primero/luego'",
    "Vocab: emociones","Vocab: naturaleza","Vocab: cuerpo",
    "Vocab: alimentos","Vocab: acciones",
    "Explicar regla","Dar instrucciones","Argumentar preferencia",
    "Pensar-Compartir-Conversar","Escucha activa",
    "Pregunta sobre cuento","Pregunta a un par",
    "Narrar cuento","Inventar final","Describir sin nombrar",
    "Comparar objetos","Explicar causalidad",
    "Tiempo pasado","Tiempo futuro",
    "Plurales regulares","Plurales irregulares",
    "Concordancia género","Concordancia número",
    "Pronombres","Artículos","Preposiciones",
    "Exposición oral","Debate simple"
  ],
};

const AVATAR_COLORS = [
  "#6366F1","#0D9488","#D97706","#DC2626","#7C3AED",
  "#2563EB","#059669","#CA8A04","#BE185D","#4F46E5",
  "#0891B2","#B45309","#9333EA","#1D4ED8","#15803D",
  "#A16207","#BE123C","#6D28D9","#0284C7","#047857",
  "#92400E","#86198F","#1E40AF","#166534","#854D0E"
];

// ═══ HELPERS ═══

function getEstado(pct: number) {
  if (pct >= 75) return { texto: "Avanzando", color: "#059669", bg: "#ECFDF5", order: 3 };
  if (pct >= 40) return { texto: "En proceso", color: "#6366F1", bg: "#EEF2FF", order: 2 };
  return { texto: "Necesita acompañamiento", color: "#DC2626", bg: "#FEF2F2", order: 1 };
}

function getAvgPct(progreso: ProgresoAlumno, id: string): number {
  const p = progreso[id];
  if (!p) return 0;
  return Math.round((p.CF + p.CT + p.O) / 3);
}

function getColor(idx: number): string {
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

// ═══ COMPONENTE PRINCIPAL ═══

export default function AlbaMonitor({ alumnosExternos, apiUrl, onRegistroGuardado }: AlbaMonitorProps) {
  // Estado
  const [alumnos, setAlumnos] = useState<Alumno[]>(alumnosExternos || []);
  const [progreso, setProgreso] = useState<ProgresoAlumno>({});
  const [loading, setLoading] = useState(!alumnosExternos);

  // Evaluación
  const [eje, setEje] = useState("CF");
  const [actIdx, setActIdx] = useState(0);
  const [marcados, setMarcados] = useState<Set<string>>(new Set());
  const [showActs, setShowActs] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Mapa
  const [mapaEje, setMapaEje] = useState("todos");
  const [selectedKid, setSelectedKid] = useState<string | null>(null);

  // ═══ CARGAR DATOS ═══

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(apiUrl || "/api/progreso");
      const data = await res.json();
      if (data.ok) {
        if (data.alumnos) setAlumnos(data.alumnos);
        if (data.progreso) setProgreso(data.progreso);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ═══ GUARDAR REGISTRO ═══

  const toggleMark = (id: string) => {
    setMarcados(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setSaved(false);
  };

  const guardar = async () => {
    setSaving(true);
    try {
      const lograron = alumnos.filter(a => !marcados.has(a.id)).map(a => a.id);
      const refuerzo = alumnos.filter(a => marcados.has(a.id)).map(a => a.id);

      const res = await fetch("/api/registrar-actividad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eje,
          actividad: ACTIVIDADES[eje][actIdx],
          actividadIndex: actIdx,
          lograron,
          refuerzo,
          fecha: new Date().toISOString().split("T")[0],
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setSaved(true);
        // Refrescar progreso
        await fetchData();
        onRegistroGuardado?.();
        // Limpiar marcados después de 2 segundos
        setTimeout(() => {
          setMarcados(new Set());
          setSaved(false);
        }, 2500);
      }
    } catch (err) {
      console.error("Error guardando:", err);
    } finally {
      setSaving(false);
    }
  };

  // ═══ CÁLCULOS PARA MAPA ═══

  const getKidPct = (id: string): number => {
    if (mapaEje === "todos") return getAvgPct(progreso, id);
    return progreso[id]?.[mapaEje as keyof typeof EJES] || 0;
  };

  const groups: Record<number, Alumno[]> = { 1: [], 2: [], 3: [] };
  alumnos.forEach(a => {
    const est = getEstado(getKidPct(a.id));
    groups[est.order].push(a);
  });

  // ═══ LOADING ═══

  if (loading && alumnos.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>Cargando sala...</div>
      </div>
    );
  }

  // ═══ RENDER ═══

  return (
    <div style={{ padding: "20px", maxWidth: 800, margin: "0 auto" }}>

      {/* ═══════════════════════════════════
          SECCIÓN 1: REGISTRAR ACTIVIDAD
          ═══════════════════════════════════ */}
      <div style={{ marginBottom: 28 }}>

        {/* Selector de eje */}
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {Object.entries(EJES).map(([k, v]) => (
            <button
              key={k}
              onClick={() => { setEje(k); setActIdx(0); setMarcados(new Set()); setSaved(false); }}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: 12, cursor: "pointer",
                textAlign: "center", transition: "all 0.15s", border: "none",
                borderWidth: 2, borderStyle: "solid",
                borderColor: eje === k ? v.color : "rgba(255,255,255,0.04)",
                background: eje === k ? v.color + "15" : "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ fontSize: 18 }}>{v.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: eje === k ? v.color : "rgba(255,255,255,0.35)", marginTop: 2 }}>
                {v.sigla}
              </div>
            </button>
          ))}
        </div>

        {/* Actividad actual */}
        <div
          onClick={() => setShowActs(!showActs)}
          style={{
            padding: "12px 16px", borderRadius: showActs ? "12px 12px 0 0" : 12,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
            marginBottom: showActs ? 0 : 12,
          }}
        >
          <div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: EJES[eje].color, textTransform: "uppercase", marginBottom: 2 }}>Actividad</div>
            <div style={{ fontSize: 14, color: "#F0EAE0" }}>{ACTIVIDADES[eje][actIdx]}</div>
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", transform: showActs ? "rotate(180deg)" : "none", transition: "0.2s" }}>▼</div>
        </div>

        {/* Dropdown actividades */}
        {showActs && (
          <div style={{
            maxHeight: 200, overflowY: "auto",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            borderTop: "none", borderRadius: "0 0 12px 12px", marginBottom: 12,
          }}>
            {ACTIVIDADES[eje].map((a, i) => (
              <div
                key={i}
                onClick={() => { setActIdx(i); setShowActs(false); setMarcados(new Set()); setSaved(false); }}
                style={{
                  padding: "10px 16px", fontSize: 13, cursor: "pointer",
                  color: actIdx === i ? EJES[eje].color : "rgba(255,255,255,0.4)",
                  fontWeight: actIdx === i ? 500 : 300,
                  background: actIdx === i ? EJES[eje].color + "10" : "transparent",
                  borderBottom: "1px solid rgba(255,255,255,0.02)",
                }}
              >
                {a}
              </div>
            ))}
          </div>
        )}

        {/* Instrucción */}
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", marginBottom: 10 }}>
          Tocá los que <strong style={{ color: "#DC2626" }}>necesitan refuerzo</strong>. El resto queda como logrado.
        </div>

        {/* Grilla de niños */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
          {alumnos.map((n, idx) => {
            const m = marcados.has(n.id);
            return (
              <div
                key={n.id}
                onClick={() => toggleMark(n.id)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 4, padding: "10px 4px", borderRadius: 12, cursor: "pointer",
                  transition: "all 0.12s",
                  background: m ? "rgba(220,38,38,0.15)" : "rgba(255,255,255,0.02)",
                  border: `2px solid ${m ? "#DC2626" : "rgba(255,255,255,0.03)"}`,
                  transform: m ? "scale(0.95)" : "scale(1)",
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: m ? "#DC2626" : getColor(idx),
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 600, color: "#fff", transition: "0.15s",
                }}>
                  {m ? "✗" : `${n.nombre[0]}${n.apellido[0]}`}
                </div>
                <div style={{ fontSize: 10, color: m ? "#FCA5A5" : "rgba(255,255,255,0.4)", textAlign: "center" }}>
                  {n.nombre}
                </div>
              </div>
            );
          })}
        </div>

        {/* Botón guardar */}
        {saved ? (
          <div style={{ textAlign: "center", padding: 14, marginTop: 10, borderRadius: 12, background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.2)" }}>
            <span style={{ color: "#10B981", fontSize: 14, fontWeight: 500 }}>
              ✅ Registrado · {alumnos.length - marcados.size} lograron · {marcados.size} refuerzo
            </span>
          </div>
        ) : (
          <button
            onClick={guardar}
            disabled={saving}
            style={{
              width: "100%", marginTop: 10, padding: 14, borderRadius: 12,
              border: "none", background: saving ? "#666" : "#D4870E",
              color: "#fff", fontSize: 15, fontWeight: 600,
              cursor: saving ? "wait" : "pointer", transition: "0.2s",
            }}
          >
            {saving ? "Guardando..." : `Guardar (${alumnos.length - marcados.size} lograron${marcados.size > 0 ? ` · ${marcados.size} refuerzo` : ""})`}
          </button>
        )}
      </div>

      {/* ═══ SEPARADOR ═══ */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0 24px" }} />

      {/* ═══════════════════════════════════
          SECCIÓN 2: MAPA DE PROGRESO
          ═══════════════════════════════════ */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 300, color: "#F0EAE0" }}>
            Mapa de progreso
          </div>
        </div>

        {/* Filtro por eje */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          <button
            onClick={() => setMapaEje("todos")}
            style={{
              padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 600,
              cursor: "pointer", border: `1px solid ${mapaEje === "todos" ? "#D4870E" : "rgba(255,255,255,0.06)"}`,
              background: mapaEje === "todos" ? "rgba(212,135,14,0.12)" : "transparent",
              color: mapaEje === "todos" ? "#D4870E" : "rgba(255,255,255,0.3)",
            }}
          >
            Todos
          </button>
          {Object.entries(EJES).map(([k, v]) => (
            <button
              key={k}
              onClick={() => setMapaEje(k)}
              style={{
                padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                cursor: "pointer", border: `1px solid ${mapaEje === k ? v.color : "rgba(255,255,255,0.06)"}`,
                background: mapaEje === k ? v.color + "12" : "transparent",
                color: mapaEje === k ? v.color : "rgba(255,255,255,0.3)",
              }}
            >
              {v.icon} {v.sigla}
            </button>
          ))}
        </div>

        {/* Resumen */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          {[
            { label: "Necesita acompañamiento", n: groups[1].length, c: "#DC2626", bg: "rgba(220,38,38,0.06)" },
            { label: "En proceso", n: groups[2].length, c: "#6366F1", bg: "rgba(99,102,241,0.06)" },
            { label: "Avanzando", n: groups[3].length, c: "#059669", bg: "rgba(5,150,105,0.06)" },
          ].map(g => (
            <div key={g.label} style={{ background: g.bg, border: `1px solid ${g.c}15`, borderRadius: 12, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 300, color: g.c }}>{g.n}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2, lineHeight: 1.2 }}>{g.label}</div>
            </div>
          ))}
        </div>

        {/* Grupos por rendimiento */}
        {[
          { order: 1, label: "Necesita acompañamiento", color: "#DC2626", kids: groups[1] },
          { order: 2, label: "En proceso", color: "#6366F1", kids: groups[2] },
          { order: 3, label: "Avanzando", color: "#059669", kids: groups[3] },
        ].filter(g => g.kids.length > 0).map(group => (
          <div key={group.order} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: group.color, textTransform: "uppercase", marginBottom: 8, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: group.color }} />
              {group.label} ({group.kids.length})
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 8 }}>
              {group.kids
                .sort((a, b) => getKidPct(a.id) - getKidPct(b.id))
                .map((n, idx) => {
                  const p = getKidPct(n.id);
                  const isSelected = selectedKid === n.id;
                  const alumnoIdx = alumnos.findIndex(a => a.id === n.id);

                  return (
                    <div
                      key={n.id}
                      onClick={() => setSelectedKid(isSelected ? null : n.id)}
                      style={{
                        padding: 12, borderRadius: 14, cursor: "pointer",
                        transition: "all 0.15s",
                        background: isSelected ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isSelected ? "#D4870E40" : "rgba(255,255,255,0.04)"}`,
                      }}
                    >
                      {/* Nombre y % */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 26, height: 26, borderRadius: "50%",
                            background: getColor(alumnoIdx >= 0 ? alumnoIdx : idx),
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, fontWeight: 600, color: "#fff",
                          }}>
                            {n.nombre[0]}{n.apellido[0]}
                          </div>
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>{n.nombre}</span>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 300, color: group.color, fontFamily: "Georgia, serif" }}>{p}%</span>
                      </div>

                      {/* 3 mini-barras */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {Object.entries(EJES).map(([k, v]) => {
                          const kp = progreso[n.id]?.[k as keyof typeof EJES] || 0;
                          return (
                            <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span style={{ fontSize: 8, color: v.color, fontWeight: 700, width: 16 }}>{v.sigla}</span>
                              <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                                <div style={{ width: `${kp}%`, height: "100%", borderRadius: 2, background: v.color, transition: "width 0.4s ease" }} />
                              </div>
                              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", width: 24, textAlign: "right" }}>{kp}%</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Detalle expandido */}
                      {isSelected && (
                        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                          {Object.entries(EJES).map(([k, v]) => {
                            const kp = progreso[n.id]?.[k as keyof typeof EJES] || 0;
                            const est = getEstado(kp);
                            return (
                              <div key={k} style={{ marginBottom: 8 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                  <span style={{ fontSize: 11, color: v.color, fontWeight: 500 }}>{v.icon} {v.nombre}</span>
                                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{Math.round(kp * v.total / 100)}/{v.total}</span>
                                </div>
                                <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden", marginBottom: 4 }}>
                                  <div style={{ width: `${kp}%`, height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${v.color}90, ${v.color})`, transition: "width 0.5s" }} />
                                </div>
                                <span style={{ fontSize: 9, fontWeight: 600, color: est.color, background: est.bg, padding: "2px 6px", borderRadius: 10 }}>
                                  {est.texto}
                                </span>
                              </div>
                            );
                          })}
                          {/* Foco sugerido */}
                          {(() => {
                            const scores = Object.entries(EJES).map(([k]) => ({
                              k,
                              p: progreso[n.id]?.[k as keyof typeof EJES] || 0,
                            }));
                            const peor = scores.reduce((a, b) => a.p < b.p ? a : b);
                            return (
                              <div style={{ marginTop: 6, padding: "8px 10px", borderRadius: 8, background: "rgba(212,135,14,0.06)", border: "1px solid rgba(212,135,14,0.1)" }}>
                                <span style={{ fontSize: 10, color: "#D4870E" }}>
                                  Foco sugerido: <strong>{EJES[peor.k].nombre}</strong> ({peor.p}%)
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}