"use client"

import { useState } from "react"
import { User, Calendar, BookOpen, Database, Home, FileText, X } from "lucide-react"

type ViewType = "clase" | "evaluar" | "mapa" | "perfil"

// Registro de actividad por dia
export interface DiaActividad {
  fecha: string
  eje: "CF" | "CT" | "O" | null
  actividad: string | null
  completado: boolean
}

interface HeaderProps {
  activeView?: ViewType
  onNavigate?: (view: ViewType) => void
  onSintesis?: () => void
  salaActual?: string
  historialSemana?: DiaActividad[]
  onDiaClick?: (dia: DiaActividad) => void
}

// Colores por eje
const EJE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  CF: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
  CT: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
  O: { bg: "#dcfce7", text: "#166534", border: "#22c55e" },
}

export function Header({ activeView = "clase", onNavigate, onSintesis, salaActual = "Manzanos" }: HeaderProps) {
  return (
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="px-4 py-3 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/10 backdrop-blur">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">ALBA</h1>
              <p className="text-xs sm:text-sm text-primary-foreground/70 font-medium">
                Alfabetizacion con Acompanamiento
              </p>
            </div>
          </div>

          {/* Navigation buttons */}
          {onNavigate && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate("clase")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: activeView === "clase" ? "rgba(212,135,14,0.15)" : "transparent",
                  border: activeView === "clase" ? "1px solid #D4870E" : "1px solid rgba(255,255,255,0.2)",
                  color: activeView === "clase" ? "#D4870E" : "rgba(255,255,255,0.7)",
                }}
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clase</span>
              </button>

              <button
                onClick={() => onNavigate("mapa")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  backgroundColor: activeView === "mapa" || activeView === "perfil" ? "rgba(212,135,14,0.15)" : "transparent",
                  border: activeView === "mapa" || activeView === "perfil" ? "1px solid #D4870E" : "1px solid rgba(255,255,255,0.2)",
                  color: activeView === "mapa" || activeView === "perfil" ? "#D4870E" : "rgba(255,255,255,0.7)",
                }}
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Datos</span>
              </button>
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-3 sm:gap-4 text-sm">
            {/* Boton Sintesis Pedagogica */}
            {onSintesis && (
              <button
                onClick={onSintesis}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105"
                style={{ backgroundColor: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sintesis</span>
              </button>
            )}
            {/* Classroom */}
            <div className="flex items-center gap-2">
              <span className="text-primary-foreground/60 text-xs hidden sm:inline">Sala:</span>
              <span className="font-semibold px-2.5 py-1 bg-white/10 rounded-lg text-sm">
                {salaActual}
              </span>
            </div>

            {/* Day counter */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-foreground/60" />
              <span className="font-semibold">Dia 37</span>
            </div>

            {/* User */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                <User className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xs text-primary-foreground/60">Docente:</span>
                <span className="font-medium ml-1">Mariana</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
