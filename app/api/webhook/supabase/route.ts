import { createClient } from '@supabase/supabase-js'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

// Este endpoint es llamado por el webhook de Supabase
// cuando se acumulan registros en la tabla seguimiento

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function POST(request: Request) {
  try {
    // Verificar el webhook secret (opcional pero recomendado)
    const webhookSecret = request.headers.get('x-webhook-secret')
    if (process.env.SUPABASE_WEBHOOK_SECRET && webhookSecret !== process.env.SUPABASE_WEBHOOK_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = await request.json()
    
    // El payload de Supabase incluye el registro insertado
    const { record, table } = payload
    
    if (table !== 'seguimiento') {
      return Response.json({ ok: true, mensaje: "Tabla ignorada" })
    }

    // Verificar configuracion
    const apiKey = process.env.AI_API_KEY
    if (!apiKey || !supabaseUrl || !supabaseKey) {
      return Response.json({ 
        ok: false, 
        error: "Configuracion incompleta" 
      }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Contar registros de hoy para esta sala
    const today = new Date().toISOString().split('T')[0]
    
    // Obtener la sala del alumno
    const { data: alumno } = await supabase
      .from('alumnos')
      .select('sala')
      .eq('id', record.alumno_id)
      .single()

    if (!alumno) {
      return Response.json({ ok: true, mensaje: "Alumno no encontrado" })
    }

    // Contar registros de hoy para esta sala
    const { count } = await supabase
      .from('seguimiento')
      .select('*', { count: 'exact', head: true })
      .gte('fecha', `${today}T00:00:00`)
      .lte('fecha', `${today}T23:59:59`)

    // Solo analizar cada 20 registros
    if (!count || count % 20 !== 0) {
      return Response.json({ 
        ok: true, 
        mensaje: `Registros hoy: ${count}. Analisis se ejecuta cada 20 registros.`
      })
    }

    // Obtener los ultimos 20 registros para analisis
    const { data: seguimientos } = await supabase
      .from('seguimiento')
      .select(`
        *,
        alumnos (id, nombre, sala)
      `)
      .gte('fecha', `${today}T00:00:00`)
      .order('fecha', { ascending: false })
      .limit(20)

    if (!seguimientos || seguimientos.length === 0) {
      return Response.json({ ok: true, mensaje: "Sin datos para analizar" })
    }

    // Preparar resumen
    const conteo = {
      green: seguimientos.filter(s => s.resultado === 'green').length,
      yellow: seguimientos.filter(s => s.resultado === 'yellow').length,
      red: seguimientos.filter(s => s.resultado === 'red').length,
    }

    const prompt = `Eres ALBA, asistente pedagogico de alfabetizacion inicial.

Se acaban de registrar 20 nuevas evaluaciones. Resumen:
- Verdes (logrado): ${conteo.green}
- Amarillos (en proceso): ${conteo.yellow}
- Rojos (necesita refuerzo): ${conteo.red}

Genera un MICRO-INSIGHT de 1-2 oraciones para la maestra. 
Ejemplo: "El grupo muestra buen avance en conciencia fonologica. Considera dedicar 5 minutos extra a juegos de rimas con los 3 ninos que aun necesitan refuerzo."

Se breve y accionable.`

    const { text } = await generateText({
      model: openai('gpt-4o-mini', { apiKey }),
      prompt,
      maxTokens: 150,
    })

    // Guardar el insight en una tabla de notificaciones (opcional)
    await supabase
      .from('insights_ia')
      .insert([{
        sala: alumno.sala,
        tipo: 'tendencia_diaria',
        mensaje: text,
        estadisticas: conteo,
        fecha: new Date().toISOString()
      }])
      .select()

    return Response.json({
      ok: true,
      insight: text,
      registrosAnalizados: 20,
      estadisticas: conteo
    })

  } catch (error) {
    console.error("Error en webhook Supabase:", error)
    return Response.json({ 
      ok: false, 
      error: error instanceof Error ? error.message : "Error desconocido" 
    }, { status: 500 })
  }
}

export async function GET() {
  return Response.json({ 
    ok: true, 
    mensaje: "Webhook de Supabase para ALBA",
    descripcion: "Este endpoint recibe notificaciones de Supabase cuando se insertan registros en la tabla seguimiento"
  })
}
