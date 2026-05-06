"use client"

import AlbaMonitor from "@/components/sia/alba-monitor"

export default function ALBADashboard() {
  return (
    <div 
      className="min-h-screen"
      style={{ 
        background: "linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)",
        color: "#F0EAE0"
      }}
    >
      {/* Header simple */}
      <header 
        style={{ 
          padding: "16px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div 
            style={{ 
              width: 36, 
              height: 36, 
              borderRadius: "50%", 
              background: "linear-gradient(135deg, #D4870E 0%, #B8860B 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff"
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, fontFamily: "Georgia, serif" }}>ALBA</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Alfabetizacion con Acompanamiento</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          Sala Manzanos · Dia 37
        </div>
      </header>

      {/* Componente principal */}
      <AlbaMonitor 
        apiUrl="/api/progreso"
        onRegistroGuardado={() => {
          // Callback opcional cuando se guarda
        }}
      />

      {/* Footer */}
      <footer 
        style={{ 
          padding: "12px 20px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          textAlign: "center",
          fontSize: 10,
          color: "rgba(255,255,255,0.25)"
        }}
      >
        ALBA · Nivel Inicial · 2024
      </footer>
    </div>
  )
}
