// components/sia/header.tsx
"use client"

import { BookOpen, Database, FileText } from "lucide-react"

type ViewType = "clase" | "evaluar" | "mapa" | "perfil"

interface HeaderProps {
  activeView: ViewType
  onNavigate: (view: ViewType) => void
  onSintesis: () => void
  salaActual: string
}

export function Header({ activeView, onNavigate, onSintesis, salaActual }: HeaderProps) {
  const tabs: { id: ViewType; label: string; icon: React.ElementType }[] = [
    { id: "clase", label: "Clase", icon: BookOpen },
    { id: "mapa", label: "Datos", icon: Database },
  ]

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-5">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1
              className="text-xl font-light tracking-tight cursor-pointer"
              style={{ fontFamily: "Georgia, serif" }}
              onClick={() => onNavigate("clase")}
            >
              <span style={{ color: "#D4870E", fontWeight: 700 }}>A</span>
              <span style={{ color: "#1e3a5f" }}>LBA</span>
            </h1>
            <div className="hidden sm:block w-px h-5 bg-slate-200" />
            <span className="hidden sm:block text-xs text-slate-400 tracking-wide uppercase">
              {salaActual}
            </span>
          </div>

          {/* Navegacion central */}
          <nav className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeView === tab.id || (tab.id === "mapa" && activeView === "perfil")
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onNavigate(tab.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    backgroundColor: isActive ? "#1e3a5f" : "transparent",
                    color: isActive ? "#fff" : "#64748b",
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Sintesis */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSintesis}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-slate-50"
              style={{ borderColor: "#D4870E40", color: "#D4870E" }}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sintesis</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
