"use client"

import { User, Calendar, BookOpen } from "lucide-react"

export function Header() {
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
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">SIA</h1>
              <p className="text-xs sm:text-sm text-primary-foreground/70 font-medium">
                Sistema Integral de Alfabetización
              </p>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-4 sm:gap-6 text-sm">
            {/* Classroom */}
            <div className="flex items-center gap-2">
              <span className="text-primary-foreground/60 text-xs hidden sm:inline">Sala:</span>
              <span className="font-semibold px-2.5 py-1 bg-white/10 rounded-lg text-sm">
                Manzanos
              </span>
            </div>

            {/* Day counter */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-foreground/60" />
              <span className="font-semibold">Día 37</span>
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
