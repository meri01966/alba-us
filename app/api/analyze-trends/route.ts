import { createClient } from '@supabase/supabase-js'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

// Inicializar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request: Request) {
  try {
    const { sala, alumnoId } = await request.json()
    
    // Verificar API Key
    const apiKey = process.env.AI_API_KEY
    if (!apiKey) {
      return Response.json({ 
        ok: false, 
        error: "AI_API_KEY no configurada" 
      }, { status: 500 })
    }

    // Verificar Supabase
    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ 
        ok: false, 
        error: "Supabase no configurado" 
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Obtener datos de seguimiento
    let query = supabase
      .from('seguimiento')
      .select(`
        *,
        alumnos (id, nombre, sala)
      `)
      .order('fecha', { ascending: false })
      .limit(100)

    if (sala) {
      query = query.eq('alumnos.sala', sala)
    }
    if (alumnoId) {
      query = query.eq('alumno_id', alumnoId)
    }

    const { data: seguimientos, error } = await query

    if (error) {
      return Response.json({ ok: false, error: error.message }, { status: 500 })
    }

    if (!seguimientos || seguimientos.length < 5) {
      return Response.json({ 
        ok: true, 
        analisis: null,
        mensaje: "Se necesitan al menos 5 registros para analizar tendencias"
      })
    }

    // Preparar datos para el analisis
    const datosParaIA = seguimientos.map(s => ({
      alumno: s.alumnos?.nombre || 'Desconocido',
      sala: s.alumnos?.sala || sala,
      eje: s.eje,
      resultado: s.resultado,
      actividad: s.actividad,
      fecha: s.fecha
    }))

    // Contar por resultado
    const conteoResultados = {
      green: seguimientos.filter(s => s.resultado === 'green').length,
      yellow: seguimientos.filter(s => s.resultado === 'yellow').length,
      red: seguimientos.filter(s => s.resultado === 'red').length,
    }

    // Alumnos con mas dificultades (mas rojos)
    const alumnosConDificultad: Record<string, number> = {}
    seguimientos.forEach(s => {
      if (s.resultado === 'red') {
        const nombre = s.alumnos?.nombre || 'Desconocido'
        alumnosConDificultad[nombre] = (alumnosConDificultad[nombre] || 0) + 1
      }
    })

    const prompt = `Eres ALBA, un asistente pedagogico especializado en alfabetizacion inicial para nivel inicial (jardin de infantes, 4-5 anos).

Analiza los siguientes datos de evaluaciones de una sala:

RESUMEN:
- Total de evaluaciones: ${seguimientos.length}
- Resultados verdes (logrado): ${conteoResultados.green}
- Resultados amarillos (en proceso): ${conteoResultados.yellow}
- Resultados rojos (necesita refuerzo): ${conteoResultados.red}

ALUMNOS CON MAS DIFICULTADES:
${Object.entries(alumnosConDificultad)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([nombre, count]) => `- ${nombre}: ${count} evaluaciones en rojo`)
  .join('\n')}

ULTIMAS EVALUACIONES:
${JSON.stringify(datosParaIA.slice(0, 20), null, 2)}

Por favor genera un analisis breve (maximo 3 parrafos) que incluya:
1. Tendencia general del grupo
2. Alumnos que necesitan atencion prioritaria
3. Una sugerencia pedagogica concreta para la proxima clase

Usa un tono profesional pero cercano, como si hablaras con una maestra de jardin.`

    const { text } = await generateText({
      model: openai('gpt-4o-mini', { apiKey }),
      prompt,
      maxTokens: 500,
    })

    return Response.json({
      ok: true,
      analisis: text,
      estadisticas: {
        total: seguimientos.length,
        ...conteoResultados,
        alumnosConDificultad: Object.entries(alumnosConDificultad)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
      }
    })

  } catch (error) {
    console.error("Error en analyze-trends:", error)
    return Response.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : "Error desconocido" 
    }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ 
    ok: true, 
    mensaje: "Usa POST para analizar tendencias",
    parametros: {
      sala: "Nombre de la sala (opcional)",
      alumnoId: "ID del alumno para analisis individual (opcional)"
    }
  })
}
