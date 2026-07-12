"use client"

import { useState } from "react"
import { BookOpen, Lock } from "lucide-react"

// PINs del piloto (seguridad liviana — se mueven a Supabase post-piloto).
// Cada sala tiene su propio PIN. El PIN determina a qué sala entra la maestra.
const PIN_POR_SALA: Record<string, string> = {
  "2026G":  "Girasoles",
  "2026M":  "Manzanos",
  "2026A":  "Alamos",
  "2026TM": "Nogales TM",
  "2026TT": "Nogales TT",
}
const PIN_DIRECCION = "7788"

// Claves de sesion en el navegador
const SESION_ROL = "alba_sesion_rol"       // "maestra" | "direccion"
const SESION_SALA = "alba_sesion_sala"      // nombre de sala (solo maestra)

export interface SesionAlba {
  rol: "maestra" | "direccion"
  sala: string | null
}

// Lee la sesion guardada. Devuelve null si no hay sesion activa.
export function leerSesion(): SesionAlba | null {
  try {
    const rol = localStorage.getItem(SESION_ROL)
    if (rol === "maestra") {
      const sala = localStorage.getItem(SESION_SALA)
      if (sala) return { rol: "maestra", sala }
      return null
    }
    if (rol === "direccion") {
      return { rol: "direccion", sala: null }
    }
    return null
  } catch {
    return null
  }
}

// Cierra la sesion (borra lo guardado)
export function cerrarSesion() {
  try {
    localStorage.removeItem(SESION_ROL)
    localStorage.removeItem(SESION_SALA)
  } catch {}
}

interface LoginPinProps {
  onIngreso: (sesion: SesionAlba) => void
}

export function LoginPin({ onIngreso }: LoginPinProps) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")

  const handleIngresar = () => {
    setError("")
    const pinLimpio = pin.trim().toUpperCase()

    // Dirección
    if (pinLimpio === PIN_DIRECCION) {
      try {
        localStorage.setItem(SESION_ROL, "direccion")
        localStorage.removeItem(SESION_SALA)
      } catch {}
      onIngreso({ rol: "direccion", sala: null })
      return
    }

    // Maestra: el PIN determina la sala
    const sala = PIN_POR_SALA[pinLimpio]
    if (sala) {
      try {
        localStorage.setItem(SESION_ROL, "maestra")
        localStorage.setItem(SESION_SALA, sala)
      } catch {}
      onIngreso({ rol: "maestra", sala })
      return
    }

    // No coincide con ninguno
    setError("El PIN no es correcto. Volvé a intentarlo.")
    setPin("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#1e3a5f] via-[#244a73] to-[#1e3a5f]">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#244a73] px-6 py-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/15 backdrop-blur mb-3">
            <BookOpen className="w-8 h-8 text-[#D4870E]" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ALBA</h1>
          <p className="text-sm text-white/70 mt-1">Alfabetización con Acompañamiento</p>
        </div>

        {/* Cuerpo */}
        <div className="px-6 py-6">
          <p className="text-sm text-slate-600 text-center mb-5">
            Ingresá el PIN de tu sala para comenzar.
          </p>

          {/* Campo PIN */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              PIN
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setError("") }}
                onKeyDown={(e) => { if (e.key === "Enter") handleIngresar() }}
                placeholder="••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-700 tracking-widest focus:outline-none focus:border-[#1e3a5f] transition-all"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 mb-3 text-center">{error}</p>
          )}

          {/* Boton ingresar */}
          <button
            type="button"
            onClick={handleIngresar}
            className="w-full py-3 rounded-xl bg-[#D4870E] text-white text-sm font-bold hover:bg-[#b8740c] transition-all"
          >
            Ingresar
          </button>
        </div>
      </div>
    </div>
  )
}
