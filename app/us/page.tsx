"use client"

// ─────────────────────────────────────────────────────────────────────────────
// /us · la pantalla nueva de ALBA US
//
// Ruta aparte a proposito. No toca ni un archivo de la pantalla que ya existe:
// si algo de esto falla, la app de hoy sigue funcionando igual. Cuando esta
// pantalla este aprobada, pasa a ser la principal.
//
// La sala sale, en este orden: ?sala= en la URL, la sesion del PIN, y por
// ultimo Kindergarten. Todo se lee DESPUES del montaje: leer localStorage
// durante el render devuelve distinto en el servidor y en el navegador y
// rompe la hidratacion de React.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react"
import TodayScreen from "@/components/us/today-screen"

const SALA_POR_DEFECTO = "Kindergarten"

export default function UsPage() {
  const [sala, setSala] = useState<string | null>(null)

  useEffect(() => {
    let elegida = SALA_POR_DEFECTO
    try {
      const url = new URLSearchParams(window.location.search).get("sala")
      const sesion = localStorage.getItem("alba_sesion_sala")
      const activa = localStorage.getItem("sia-sala-activa")
      elegida = url || sesion || activa || SALA_POR_DEFECTO
    } catch {}
    setSala(elegida)
  }, [])

  if (!sala) {
    return (
      <div
        style={{
          background: "#FBF7F0",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#8891A3",
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        One moment.
      </div>
    )
  }

  return <TodayScreen sala={sala} />
}
