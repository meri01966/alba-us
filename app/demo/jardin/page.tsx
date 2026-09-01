"use client"

import ALBADashboard from "@/app/page"

// Vista de demostracion: Jardin bloqueado solo a la sala de prueba.
// No permite cambiar a otras salas (selector oculto).
export default function DemoJardinPage() {
  return <ALBADashboard forzarSala="Kindergarten" />
}
