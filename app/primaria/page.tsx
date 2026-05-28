// app/primaria/page.tsx
'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js' // Tu config de siempre

export default function DashboardPrimaria() {
  const [showModal, setShowModal] = useState(false);
  const [sugerencia, setSugerencia] = useState("");

  // Esta función es el "Cerebro" que se activa al tocar el botón
  const solicitarRegrupacion = async () => {
    setSugerencia("ALBA está analizando los datos de 1A, 1B y 1C...");
    setShowModal(true);
    
    // Aquí es donde ALBA lee las excepciones y decide
    // Por ahora, simulamos la respuesta pedagógica:
    setTimeout(() => {
      setSugerencia(`
        ESTRATEGIA: Grupos de Nivel Adecuado (TaRL).
        JUSTIFICACIÓN: Según el Diseño Curricular de CABA, para acelerar la fluidez en agosto, 
        reagrupamos a los alumnos de las 3 secciones que presentan 'Excepción de Sonidos'.
        PROPUESTA: 
        - Grupo 1 (Refuerzo): 5 niños de 1A, 3 de 1B.
        - Grupo 2 (Consolidación): Mezcla heterogénea 1A/1C.
      `);
    }, 2000);
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <nav className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-green-800">ALBA Primaria - 1er Ciclo</h1>
        <button 
          onClick={solicitarRegrupacion}
          className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 shadow-lg"
        >
          👥 Solicitar Regrupación Inteligente
        </button>
      </nav>

      {/* Aquí iría tu grilla de alumnos similar a la de Jardín */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">Sección 1A (Lista...)</div>
        <div className="bg-white p-4 rounded-xl shadow">Sección 1B (Lista...)</div>
        <div className="bg-white p-4 rounded-xl shadow">Sección 1C (Lista...)</div>
      </div>

      {/* MODAL DE ALBA */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Sugerencia de ALBA</h2>
            <p className="whitespace-pre-line text-gray-700">{sugerencia}</p>
            <button 
              onClick={() => setShowModal(false)}
              className="mt-6 w-full bg-slate-200 py-2 rounded-lg"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
