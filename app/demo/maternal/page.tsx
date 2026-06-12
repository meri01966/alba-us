"use client"

import { DashboardMaternal } from "@/components/alba/maternal/dashboard-maternal"

// Vista de demostracion: Maternal bloqueado solo a la sala de prueba.
// No permite cambiar a otras salas (selector oculto).
export default function DemoMaternalPage() {
  return <DashboardMaternal forzarSala="Sala de prueba" />
}
