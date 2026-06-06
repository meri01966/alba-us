import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"

// Cache simple en memoria para no llamar la IA por cada click
const cache = new Map<string, { tips: string[]; ts: number }>()
const CACHE_TTL = 1000 * 60 * 30 // 30 minutos

export async function POST(req: NextRequest) {
  const { eje, actividad, sala, yaVisto = [] } = await req.json()

  const cacheKey = `${eje}|${actividad}|${sala}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.ts < CACHE_TTL && cached.tips.length > yaVisto.length) {
    // Devolver el siguiente tip no visto aun
    const noVisto = cached.tips.find(t => !yaVisto.includes(t))
    if (noVisto) return NextResponse.json({ ok: true, tip: noVisto, total: cached.tips.length })
  }

  const ejeNombre = eje === "CF" ? "Conciencia Fonologica" : eje === "CT" ? "Comprension de Textos" : eje === "O" ? "Produccion Oral" : "Escritura inicial"

  const prompt = `Eres ALBA, la asistente pedagogica de nivel inicial de Buenos Aires. Tu rol es dar un CONSEJO PRACTICO Y ESPECIFICO a una maestra jardinera mientras esta en su jornada con los ninos.

Actividad que se esta realizando hoy: "${actividad}"
Eje de alfabetizacion: ${ejeNombre}
Sala: ${sala}

Genera 5 consejos practicos y variados para esta actividad. Cada consejo debe:
- Ser breve (2-4 oraciones maximo)
- Empezar siempre con "Hola!" seguido del consejo directo
- Ser DIFERENTE a los otros (diferentes tecnicas, momentos, variantes)
- Hablar en vos (tuteo argentino): "proba", "hace", "mira", "te conviene"
- Ser MUY ESPECIFICO a la actividad "${actividad}" — no consejos genericos
- Incluir tecnicas de: Vigotsky, Montessori, Reggio Emilia, lectura dialogica, enfoque comunicativo, neuroeducacion — variados entre los 5 tips
- Al menos 1 consejo con una VARIANTE CREATIVA que sorprenda
- Al menos 1 consejo sobre GESTION DEL GRUPO (no solo la tecnica pedagogica)

Responde SOLO con un JSON array de 5 strings, sin markdown, sin texto adicional:
["tip1","tip2","tip3","tip4","tip5"]`

  try {
    const result = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      maxOutputTokens: 800,
      temperature: 0.9,
    })

    const texto = result.text.trim()
    const jsonStr = texto.startsWith("[") ? texto : texto.slice(texto.indexOf("["), texto.lastIndexOf("]") + 1)
    const tips: string[] = JSON.parse(jsonStr)

    cache.set(cacheKey, { tips, ts: Date.now() })

    const primerTip = tips.find(t => !yaVisto.includes(t)) || tips[0]
    return NextResponse.json({ ok: true, tip: primerTip, total: tips.length })
  } catch (e) {
    console.error("[v0] Error generando tip ALBA:", e)
    // Fallback con tip contextual
    const FALLBACKS: Record<string, string> = {
      CF: `Hola! Para "${actividad}" en conciencia fonologica: exagera el sonido que estan trabajando, alargalo, que lo sientan con el cuerpo. El aprendizaje fonologico pasa primero por el oido y la boca, despues por la letra.`,
      CT: `Hola! En la lectura dialogica de "${actividad}": hace pausas despues de momentos clave y pregunta Que creen que va a pasar? No hay respuesta incorrecta — todas las predicciones son validas y activan la comprension.`,
      O: `Hola! Para "${actividad}": dale a cada nino un momento de protagonismo oral. Que cuenten algo propio relacionado con el tema. La voz de cada uno vale y enriquece a todo el grupo.`,
      Escritura: `Hola! En "${actividad}": no corrijas la escritura espontanea, observala y pregunta Como lo escribiste? Que dice ahi? La escritura emergente es una hipotesis valida que hay que respetar y acompañar.`,
    }
    const tip = FALLBACKS[eje] || FALLBACKS.CF
    return NextResponse.json({ ok: true, tip, total: 1 })
  }
}
