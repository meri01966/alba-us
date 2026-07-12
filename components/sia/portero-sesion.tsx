"use client"

import { useState, useEffect } from "react"
import { LoginPin, leerSesion, type SesionAlba } from "@/components/sia/login-pin"

// El Portero envuelve toda la app. Decide:
//   - Sin sesion  -> muestra la pantalla de PIN
//   - Con sesion  -> muestra la app (children)
// Es liviano: la validacion real del PIN vive en login-pin.tsx.
export function PorteroSesion({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<SesionAlba | null>(null)
  const [listo, setListo] = useState(false)

  // Al montar, leer si ya hay sesion guardada en el navegador
  useEffect(() => {
    setSesion(leerSesion())
    setListo(true)
  }, [])

  // Mientras lee la sesion (un instante), no mostrar nada para evitar parpadeo
  if (!listo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e3a5f]">
        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  // Sin sesion -> pedir PIN
  if (!sesion) {
    return <LoginPin onIngreso={(s) => setSesion(s)} />
  }

  // Con sesion -> mostrar la app normal
  return <>{children}</>
}
