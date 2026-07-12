"use client"

import { useState, useEffect, isValidElement, cloneElement } from "react"
import { usePathname, useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { LoginPin, leerSesion, cerrarSesion, type SesionAlba } from "@/components/sia/login-pin"

// El Portero envuelve toda la app. Decide:
//   - Sin sesion  -> muestra la pantalla de PIN
//   - Maestra     -> app fijada a su sala; NO puede entrar a /directora
//   - Direccion   -> la lleva a su tablero institucional /directora
// Ademas ofrece el boton "Cerrar sesion" cuando hay sesion activa.
export function PorteroSesion({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<SesionAlba | null>(null)
  const [listo, setListo] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    setSesion(leerSesion())
    setListo(true)
  }, [])

  // Redirecciones segun rol y ruta actual
  useEffect(() => {
    if (!listo || !sesion) return
    const enDireccion = pathname?.startsWith("/directora")

    // Direccion fuera de su tablero -> llevarla a /directora
    if (sesion.rol === "direccion" && !enDireccion) {
      router.replace("/directora")
    }
    // Maestra intentando ver /directora -> sacarla a su dashboard
    if (sesion.rol === "maestra" && enDireccion) {
      router.replace("/")
    }
  }, [listo, sesion, pathname, router])

  const handleCerrar = () => {
    cerrarSesion()
    setSesion(null)
    router.replace("/")
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

  // Maestra en la pagina principal: fijar su sala (desactiva el dropdown).
  // En /directora la maestra ya la redirige el efecto de arriba.
  const enDireccion = pathname?.startsWith("/directora")
  let contenido = children
  if (sesion.rol === "maestra" && sesion.sala && !enDireccion && isValidElement(children)) {
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
