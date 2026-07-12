"use client"

import { useState, useEffect, isValidElement, cloneElement } from "react"
import { LogOut } from "lucide-react"
import { LoginPin, leerSesion, cerrarSesion, type SesionAlba } from "@/components/sia/login-pin"

// El Portero envuelve toda la app. Decide:
//   - Sin sesion         -> muestra la pantalla de PIN
//   - Sesion de maestra  -> muestra la app fijando su sala (forzarSala)
//   - Sesion de direccion-> muestra la app tal cual (acceso completo)
// Ademas ofrece el boton "Cerrar sesion" cuando hay sesion activa.
export function PorteroSesion({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<SesionAlba | null>(null)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    setSesion(leerSesion())
    setListo(true)
  }, [])

  const handleCerrar = () => {
    cerrarSesion()
    setSesion(null)
  }

  // Mientras lee la sesion (un instante), spinner para evitar parpadeo
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

  // Con sesion de maestra: inyectar forzarSala en la pagina hija.
  // Esto fija la sala y desactiva el dropdown (el dashboard ya lo hace cuando
  // recibe forzarSala). Para direccion no se inyecta nada: ve todo.
  let contenido = children
  if (sesion.rol === "maestra" && sesion.sala && isValidElement(children)) {
    contenido = cloneElement(children as React.ReactElement, { forzarSala: sesion.sala })
  }

  return (
    <>
      {contenido}
      {/* Boton flotante de cerrar sesion */}
      <button
        type="button"
        onClick={handleCerrar}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 px-3 py-2 rounded-full bg-white/90 backdrop-blur border border-slate-200 shadow-lg text-xs font-semibold text-slate-600 hover:bg-white hover:text-slate-800 transition-all"
        title="Cerrar sesión"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Salir</span>
      </button>
    </>
  )
}
