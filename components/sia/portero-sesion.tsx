"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { LoginPin, leerSesion, cerrarSesion, type SesionAlba } from "@/components/sia/login-pin"

// El Portero envuelve toda la app. Decide segun rol:
//   - Sin sesion  -> pantalla de PIN
//   - Maestra     -> su sala (fijada por URL ?sala=), sin acceso a /directora
//   - Direccion   -> tablero institucional /directora
//   - Admin        -> acceso total: entra a las salas con dropdown libre y al tablero
// El boton "Cerrar sesion" esta disponible con sesion activa.
export function PorteroSesion({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<SesionAlba | null>(null)
  const [listo, setListo] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setSesion(leerSesion())
    setListo(true)
  }, [])

  // Redirecciones segun rol y ruta
  useEffect(() => {
    if (!listo || !sesion) return
    const enDireccion = pathname?.startsWith("/directora")

    // Direccion: siempre a su tablero
    if (sesion.rol === "direccion" && !enDireccion) {
      router.replace("/directora")
      return
    }
    // Maestra: no puede ver /directora
    if (sesion.rol === "maestra" && enDireccion) {
      router.replace("/")
      return
    }
    // Maestra: asegurar que la URL lleve su sala (fija la sala en el dashboard)
    if (sesion.rol === "maestra" && sesion.sala && !enDireccion) {
      const params = new URLSearchParams(window.location.search)
      if (params.get("sala") !== sesion.sala) {
        router.replace(`/?sala=${encodeURIComponent(sesion.sala)}`)
      }
    }
    // Admin: no se redirige. Acceso libre a donde quiera.
  }, [listo, sesion, pathname, router])

  const handleCerrar = () => {
    cerrarSesion()
    setSesion(null)
    router.replace("/")
  }

  if (!listo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1e3a5f]">
        <div className="w-8 h-8 border-3 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!sesion) {
    return <LoginPin onIngreso={(s) => setSesion(s)} />
  }

  return (
    <>
      {children}
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
