import { Header } from "@/components/sia/header"
import { HeatMap } from "@/components/sia/heat-map"
import { DayPlanning } from "@/components/sia/day-planning"
import { MicroTraining } from "@/components/sia/micro-training"
import { AlertsPanel } from "@/components/sia/alerts-panel"
import { QuickRegister } from "@/components/sia/quick-register"

export default function SIADashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto h-full">
          {/* Dashboard Grid - Optimized for tablet */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
            
            {/* Left Panel - Heat Map */}
            <div className="lg:col-span-3">
              <HeatMap />
            </div>

            {/* Center Panel - Day Planning */}
            <div className="lg:col-span-5">
              <DayPlanning />
            </div>

            {/* Right Panel - Micro Training */}
            <div className="lg:col-span-4">
              <MicroTraining />
            </div>

            {/* Bottom Section - Full Width */}
            <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {/* Alerts */}
              <AlertsPanel />
              
              {/* Quick Register */}
              <QuickRegister />
            </div>
          </div>
        </div>
      </main>

      {/* Footer branding */}
      <footer className="py-2 px-4 text-center text-xs text-muted-foreground border-t border-border">
        <span>SIA · Sistema Integral de Alfabetización · Nivel Inicial</span>
      </footer>
    </div>
  )
}
