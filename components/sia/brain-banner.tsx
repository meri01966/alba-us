"use client"

import useSWR from "swr"
import { BookOpen, Brain, Loader2 } from "lucide-react"
import type { BrainActivity } from "@/app/api/brain/route"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function BrainBanner() {
  const { data, isLoading } = useSWR<{ activity: BrainActivity }>(
    "/api/brain",
    fetcher,
    { revalidateOnFocus: false }
  )

  const activity = data?.activity

  return (
    <div className="w-full rounded-2xl bg-primary text-primary-foreground px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-md">
      {/* Icon + label */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary-foreground/15 flex items-center justify-center">
          <Brain className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-semibold text-primary-foreground/70 uppercase tracking-wider">
            Cerebro Central
          </span>
          {activity && (
            <span className="text-xs text-primary-foreground/60">
              {activity.source === "airtable" ? `Día ${activity.dia}` : "Demo"}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-10 bg-primary-foreground/20 mx-1" />

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-primary-foreground/70">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Cargando actividad del día...</span>
        </div>
      ) : activity ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 flex-1 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <BookOpen className="w-4 h-4 text-primary-foreground/70 shrink-0" />
            <span className="text-base font-bold text-primary-foreground truncate">
              {activity.titulo}
            </span>
          </div>
          <p className="text-sm text-primary-foreground/80 leading-snug line-clamp-2 sm:line-clamp-1 flex-1 min-w-0">
            {activity.objetivo || activity.descripcion}
          </p>
        </div>
      ) : null}
    </div>
  )
}
