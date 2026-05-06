import { Header }       from "@/components/sia/header"
import { BrainBanner } from "@/components/sia/brain-banner"
import { HeatMap }      from "@/components/sia/heat-map"
import { DayPlanning }  from "@/components/sia/day-planning"
import { MicroTraining } from "@/components/sia/micro-training"
import { AlertsPanel }  from "@/components/sia/alerts-panel"
import { QuickRegister } from "@/components/sia/quick-register"

export default function ALBADashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 p-3 sm:p-4 lg:p-5">
        <div className="max-w-7xl mx-auto space-y-4">

          {/* ── Banner: Cerebro Central ── */}
          <BrainBanner />

          {/* ── Row 1: Heat Map (protagonist) + Day Planning ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Heat Map — wider column on the left */}
            <div className="lg:col-span-5">
              <HeatMap />
            </div>

            {/* Day Planning — right side */}
            <div className="lg:col-span-7">
              <DayPlanning />
            </div>
          </div>

          {/* ── Row 2: Micro Training + Alerts + Quick Register ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MicroTraining />
            <AlertsPanel />
            <QuickRegister />
          </div>

        </div>
      </main>

      <footer className="py-2 px-4 text-center text-xs text-muted-foreground border-t border-border">
        ALBA · Alfabetización con Acompañamiento · Nivel Inicial
      </footer>
    </div>
  )
}
