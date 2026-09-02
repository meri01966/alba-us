"use client"

import { useState } from "react"
import { BookOpen, Lock } from "lucide-react"

// Access codes. Light security by design: these ship in the browser bundle, so
// anyone with the link can read them in the page source. That is acceptable
// while every student in this database is fictional. Before a single real
// child's data enters, this moves to Supabase Auth with row level security.

// One code per classroom. The code decides which classroom the teacher opens,
// and she sees only that one.
const PIN_POR_SALA: Record<string, string> = {
  "TK25":  "TK",
  "K25":   "Kindergarten",
  "G125":  "Grade 1",
  "G225":  "Grade 2",
  "G325":  "Grade 3",
}

// Maternal does not exist in the California system: TK is the youngest level.
// The map stays declared so the rest of the engine keeps compiling, but no code
// resolves to it, which makes those screens unreachable.
const PIN_MATERNAL: Record<string, string> = {}

// School View only: aggregated data, no classroom detail.
const PIN_DIRECCION = "PRINCIPAL25"

// Full access: every classroom plus School View. This is the demo code.
const PIN_ADMIN = "ALBA2026"

// Claves de sesion en el navegador
const SESION_ROL = "alba_sesion_rol"       // "maestra" | "maternal" | "direccion" | "admin"
const SESION_SALA = "alba_sesion_sala"      // nombre de sala (solo maestra)

export interface SesionAlba {
  rol: "maestra" | "maternal" | "direccion" | "admin"
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
    if (rol === "maternal") {
      const sala = localStorage.getItem(SESION_SALA)
      if (sala) return { rol: "maternal", sala }
      return null
    }
    if (rol === "direccion") return { rol: "direccion", sala: null }
    if (rol === "admin") return { rol: "admin", sala: null }
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

    // Admin (acceso total)
    if (pinLimpio === PIN_ADMIN) {
      try {
        localStorage.setItem(SESION_ROL, "admin")
        localStorage.removeItem(SESION_SALA)
      } catch {}
      onIngreso({ rol: "admin", sala: null })
      return
    }

    // Direccion
    if (pinLimpio === PIN_DIRECCION) {
      try {
        localStorage.setItem(SESION_ROL, "direccion")
        localStorage.removeItem(SESION_SALA)
      } catch {}
      onIngreso({ rol: "direccion", sala: null })
      return
    }

    // Maternal: mismo esquema que maestra, pero la pantalla es otra
    const salaMat = PIN_MATERNAL[pinLimpio]
    if (salaMat) {
      try {
        // Rol propio: con "maestra" el portero la mandaba a jardin
        localStorage.setItem(SESION_ROL, "maternal")
        localStorage.setItem(SESION_SALA, salaMat)
        // El dashboard de maternal lee la sala de SU propia clave
        localStorage.setItem("maternal-sala-activa", salaMat)
      } catch {}
      onIngreso({ rol: "maternal", sala: salaMat })
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
