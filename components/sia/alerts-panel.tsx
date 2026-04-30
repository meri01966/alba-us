"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ChevronRight } from "lucide-react"

interface Alert {
  id: string
  message: string
  type: "warning" | "urgent"
}

const alerts: Alert[] = [
  {
    id: "1",
    message: "4 alumnos requieren refuerzo en segmentación silábica",
    type: "warning",
  },
  {
    id: "2",
    message: "Santi lleva 2 registros en rojo en conciencia fonológica",
    type: "urgent",
  },
]

export function AlertsPanel() {
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-status-yellow" />
          Alertas pedagógicas
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between gap-3 p-3 rounded-lg border ${
                alert.type === "urgent"
                  ? "bg-status-red/5 border-status-red/20"
                  : "bg-status-yellow/5 border-status-yellow/20"
              }`}
            >
              <div className="flex items-start gap-2 flex-1 min-w-0">
                <div
                  className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    alert.type === "urgent" ? "bg-status-red" : "bg-status-yellow"
                  }`}
                />
                <p className="text-sm text-foreground">{alert.message}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex-shrink-0 text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                Ver sugerencia
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
