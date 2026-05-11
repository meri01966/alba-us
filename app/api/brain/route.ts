import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// ── Supabase ───────────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// ── Gemini AI ──────────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// ── Types ──────────────────────────────────────────────────────────────────
export interface BrainActivity {
  id: string
  dia: number
  semana: number
  titulo: string
  descripcion: string
  objetivo: string
  source: "secuencia" | "alba-ia" | "demo"
  ejeRecomendado: string
  razon?: string
}

interface SecuenciaActividad {
  semana: number
  titulo: string
  objetivo: string
}

// ── Secuencia Anual Curricular por Eje ─────────────────────────────────────
const SECUENCIA_CURRICULAR: Record<string, { nombre: string; actividades: SecuenciaActividad[] }> = {
  CF: {
    nombre: "Conciencia Fonologica",
    actividades: [
      { semana: 1, titulo: "Sonidos del entorno", objetivo: "Discriminar sonidos ambientales y asociarlos a su fuente" },
      { semana: 2, titulo: "Rimas y canciones", objetivo: "Identificar palabras que riman en canciones conocidas" },
      { semana: 3, titulo: "Segmentacion silabica", objetivo: "Separar palabras en silabas usando palmadas" },
      { semana: 4, titulo: "Sonido inicial /a/", objetivo: "Identificar palabras que comienzan con el sonido /a/" },
      { semana: 5, titulo: "Sonido inicial /e/", objetivo: "Identificar palabras que comienzan con el sonido /e/" },
      { semana: 6, titulo: "Sonido inicial /i/", objetivo: "Identificar palabras que comienzan con el sonido /i/" },
      { semana: 7, titulo: "Sonido inicial /o/", objetivo: "Identificar palabras que comienzan con el sonido /o/" },
      { semana: 8, titulo: "Sonido inicial /u/", objetivo: "Identificar palabras que comienzan con el sonido /u/" },
      { semana: 9, titulo: "Vocales - Repaso", objetivo: "Consolidar identificacion de sonidos vocalicos iniciales" },
      { semana: 10, titulo: "Sonido inicial /m/", objetivo: "Identificar palabras que comienzan con el sonido /m/" },
      { semana: 11, titulo: "Sonido inicial /p/", objetivo: "Identificar palabras que comienzan con el sonido /p/" },
      { semana: 12, titulo: "Sonido inicial /s/", objetivo: "Identificar palabras que comienzan con el sonido /s/" },
      { semana: 13, titulo: "Sonido inicial /l/", objetivo: "Identificar palabras que comienzan con el sonido /l/" },
      { semana: 14, titulo: "Sonido inicial /t/", objetivo: "Identificar palabras que comienzan con el sonido /t/" },
      { semana: 15, titulo: "Sonido inicial /n/", objetivo: "Identificar palabras que comienzan con el sonido /n/" },
      { semana: 16, titulo: "Consonantes - Repaso", objetivo: "Consolidar identificacion de sonidos consonanticos" },
      { semana: 17, titulo: "Sonido final", objetivo: "Identificar el sonido final de palabras cortas" },
      { semana: 18, titulo: "Sonidos medios", objetivo: "Identificar sonidos en posicion media de palabras" },
      { semana: 19, titulo: "Sintesis de fonemas", objetivo: "Unir fonemas para formar palabras simples" },
      { semana: 20, titulo: "Analisis de fonemas", objetivo: "Descomponer palabras en sus fonemas individuales" },
      { semana: 21, titulo: "Sustitucion de fonemas", objetivo: "Cambiar un fonema para crear palabras nuevas" },
      { semana: 22, titulo: "Omision de fonemas", objetivo: "Identificar que palabra queda al quitar un fonema" },
      { semana: 23, titulo: "Adicion de fonemas", objetivo: "Agregar fonemas para crear palabras nuevas" },
      { semana: 24, titulo: "Manipulacion avanzada", objetivo: "Realizar operaciones complejas con fonemas" },
      { semana: 25, titulo: "Evaluacion CF", objetivo: "Evaluar el dominio de la conciencia fonologica" },
    ],
  },
  CT: {
    nombre: "Conocimiento del Texto",
    actividades: [
      { semana: 1, titulo: "El libro como objeto", objetivo: "Explorar las partes del libro (tapa, contratapa, lomo)" },
      { semana: 2, titulo: "Direccionalidad", objetivo: "Comprender que leemos de izquierda a derecha y arriba a abajo" },
      { semana: 3, titulo: "Titulo y autor", objetivo: "Identificar el titulo y autor de un libro" },
      { semana: 4, titulo: "Portada e ilustraciones", objetivo: "Relacionar imagenes con el contenido del texto" },
      { semana: 5, titulo: "Diferencia texto/imagen", objetivo: "Distinguir entre lo que se lee y lo que se mira" },
      { semana: 6, titulo: "Funcion del texto", objetivo: "Comprender que el texto transmite un mensaje" },
      { semana: 7, titulo: "Tipos de texto: cuento", objetivo: "Reconocer caracteristicas de los cuentos" },
      { semana: 8, titulo: "Tipos de texto: poesia", objetivo: "Reconocer caracteristicas de las poesias" },
      { semana: 9, titulo: "Tipos de texto: receta", objetivo: "Reconocer caracteristicas de las recetas" },
      { semana: 10, titulo: "Tipos de texto: carta", objetivo: "Reconocer caracteristicas de las cartas" },
      { semana: 11, titulo: "Tipos de texto: noticia", objetivo: "Reconocer caracteristicas de las noticias" },
      { semana: 12, titulo: "Tipos de texto: instructivo", objetivo: "Reconocer caracteristicas de los instructivos" },
      { semana: 13, titulo: "Palabra y oracion", objetivo: "Diferenciar palabras de oraciones" },
      { semana: 14, titulo: "Espacios entre palabras", objetivo: "Reconocer que las palabras se separan con espacios" },
      { semana: 15, titulo: "Signos de puntuacion", objetivo: "Identificar punto, coma y signos de pregunta" },
      { semana: 16, titulo: "Mayusculas", objetivo: "Reconocer el uso de mayusculas al inicio" },
      { semana: 17, titulo: "Lectura compartida I", objetivo: "Participar activamente en lectura guiada" },
      { semana: 18, titulo: "Lectura compartida II", objetivo: "Anticipar contenido a partir del titulo" },
      { semana: 19, titulo: "Lectura compartida III", objetivo: "Hacer predicciones durante la lectura" },
      { semana: 20, titulo: "Comprension literal", objetivo: "Responder preguntas sobre informacion explicita" },
      { semana: 21, titulo: "Comprension inferencial", objetivo: "Inferir informacion no explicita del texto" },
      { semana: 22, titulo: "Secuencia narrativa", objetivo: "Ordenar eventos de una historia" },
      { semana: 23, titulo: "Personajes", objetivo: "Identificar personajes principales y secundarios" },
      { semana: 24, titulo: "Ambiente y tiempo", objetivo: "Identificar donde y cuando ocurre la historia" },
      { semana: 25, titulo: "Evaluacion CT", objetivo: "Evaluar el conocimiento del texto impreso" },
    ],
  },
  O: {
    nombre: "Oralidad",
    actividades: [
      { semana: 1, titulo: "Presentacion personal", objetivo: "Presentarse diciendo nombre y algo que les gusta" },
      { semana: 2, titulo: "Escucha activa", objetivo: "Practicar escuchar sin interrumpir" },
      { semana: 3, titulo: "Turnos de habla", objetivo: "Respetar turnos en una conversacion" },
      { semana: 4, titulo: "Vocabulario cotidiano", objetivo: "Ampliar vocabulario de objetos del aula" },
      { semana: 5, titulo: "Vocabulario: familia", objetivo: "Ampliar vocabulario relacionado con la familia" },
      { semana: 6, titulo: "Vocabulario: cuerpo", objetivo: "Ampliar vocabulario de partes del cuerpo" },
      { semana: 7, titulo: "Vocabulario: alimentos", objetivo: "Ampliar vocabulario de alimentos" },
      { semana: 8, titulo: "Vocabulario: animales", objetivo: "Ampliar vocabulario de animales" },
      { semana: 9, titulo: "Descripcion de objetos", objetivo: "Describir objetos usando adjetivos simples" },
      { semana: 10, titulo: "Descripcion de personas", objetivo: "Describir personas usando caracteristicas fisicas" },
      { semana: 11, titulo: "Descripcion de lugares", objetivo: "Describir lugares usando vocabulario espacial" },
      { semana: 12, titulo: "Narracion de experiencias", objetivo: "Contar una experiencia personal con secuencia" },
      { semana: 13, titulo: "Recontar un cuento", objetivo: "Recontar un cuento escuchado con sus propias palabras" },
      { semana: 14, titulo: "Crear finales alternativos", objetivo: "Inventar finales diferentes para cuentos" },
      { semana: 15, titulo: "Dialogos", objetivo: "Participar en dialogos simples con companeros" },
      { semana: 16, titulo: "Preguntas y respuestas", objetivo: "Formular y responder preguntas" },
      { semana: 17, titulo: "Expresion de emociones", objetivo: "Expresar como se sienten usando palabras" },
      { semana: 18, titulo: "Expresion de opiniones", objetivo: "Dar opiniones simples sobre temas conocidos" },
      { semana: 19, titulo: "Instrucciones orales", objetivo: "Dar y seguir instrucciones simples" },
      { semana: 20, titulo: "Explicar procedimientos", objetivo: "Explicar como hacer algo paso a paso" },
      { semana: 21, titulo: "Recitar poesias", objetivo: "Memorizar y recitar poesias cortas" },
      { semana: 22, titulo: "Dramatizacion", objetivo: "Participar en dramatizaciones simples" },
      { semana: 23, titulo: "Exposicion oral", objetivo: "Hacer una breve exposicion sobre un tema" },
      { semana: 24, titulo: "Debate guiado", objetivo: "Participar en debates simples con argumentos" },
      { semana: 25, titulo: "Evaluacion O", objetivo: "Evaluar las habilidades de comunicacion oral" },
    ],
  },
}

// ── Descripcion de actividades detalladas ──────────────────────────────────
function generarDescripcionActividad(eje: string, semana: number): string {
  const descripciones: Record<string, Record<number, string>> = {
    CF: {
      1: "1. Cerrar los ojos y escuchar sonidos del aula.\n2. Identificar cada sonido (puerta, pasos, voces).\n3. Imitar los sonidos escuchados.\n4. Juego: adivinar el sonido con ojos cerrados.\n5. Clasificar sonidos fuertes vs suaves.",
      2: "1. Cantar una cancion conocida juntos.\n2. Identificar palabras que riman al final.\n3. Crear nuevas rimas con sus nombres.\n4. Juego de parejas: encontrar cartas que riman.\n5. Inventar una rima corta en grupo.",
      3: "1. Presentar palabras de 2 silabas (mesa, libro).\n2. Separar con palmadas: ME-SA.\n3. Contar las silabas con los dedos.\n4. Avanzar a palabras de 3 silabas.\n5. Carrera de silabas: quien separa mas rapido.",
      4: "1. Mostrar imagenes: ARBOL, AVION, AGUA.\n2. Pronunciar enfatizando /AAAA/.\n3. Los ninos repiten el sonido inicial.\n4. Buscar objetos del aula que empiecen con /a/.\n5. Dibujar algo que empiece con A.",
    },
    CT: {
      1: "1. Explorar un libro fisico en grupos.\n2. Identificar la tapa: donde esta el titulo?\n3. Encontrar el lomo del libro.\n4. Ver la contratapa: que hay ahi?\n5. Practicar como sostener un libro correctamente.",
      2: "1. Senalar donde empieza el texto.\n2. Seguir con el dedo de izquierda a derecha.\n3. Mostrar como bajamos a la siguiente linea.\n4. Practicar con un texto grande.\n5. Juego: ser el dedo lector.",
      3: "1. Mostrar varios libros con titulos claros.\n2. Leer el titulo senalando cada palabra.\n3. Buscar donde dice el nombre del autor.\n4. Comparar: titulo grande, autor mas chico.\n5. Inventar un titulo para un libro sin titulo.",
    },
    O: {
      1: "1. Sentarse en circulo mirando a todos.\n2. Modelar: Me llamo... y me gusta...\n3. Cada nino se presenta usando la frase.\n4. Aplaudir despues de cada presentacion.\n5. Recordar: que le gusta a tu companero?",
      2: "1. Explicar las reglas: mirar a quien habla.\n2. Un nino cuenta algo, los demas escuchan.\n3. Mostrar senales de escucha activa.\n4. Practicar NO interrumpir.\n5. Al final, resumir lo que escuchamos.",
      3: "1. Usar un objeto para indicar el turno.\n2. Solo habla quien tiene el objeto.\n3. Practicar pasar el turno en orden.\n4. Juego: contar una historia por turnos.\n5. Reflexionar: fue dificil esperar?",
    },
  }
  
  return descripciones[eje]?.[semana] || 
    `1. Introducir el concepto de la semana.\n2. Modelar la actividad con ejemplos claros.\n3. Practicar en grupo grande.\n4. Trabajo en parejas o pequenos grupos.\n5. Cierre: reflexionar sobre lo aprendido.`
}

// ── Consultar historial de Supabase ────────────────────────────────────────
async function obtenerHistorialSeguimiento(sala?: string): Promise<{
  totalRegistros: number
  porEje: Record<string, { green: number; yellow: number; red: number; total: number }>
  ultimaSemana: Record<string, number>
  tendencia: Record<string, "mejorando" | "estable" | "bajando">
}> {
  const resultado = {
    totalRegistros: 0,
    porEje: {
      CF: { green: 0, yellow: 0, red: 0, total: 0 },
      CT: { green: 0, yellow: 0, red: 0, total: 0 },
      O: { green: 0, yellow: 0, red: 0, total: 0 },
    },
    ultimaSemana: { CF: 1, CT: 1, O: 1 },
    tendencia: { CF: "estable" as const, CT: "estable" as const, O: "estable" as const },
  }

  if (!supabase) return resultado

  try {
    // Obtener ultimos 100 registros de seguimiento
    const { data, error } = await supabase
      .from("seguimiento")
      .select("eje, resultado, fecha")
      .order("fecha", { ascending: false })
      .limit(100)

    if (error || !data) return resultado

    resultado.totalRegistros = data.length

    // Contar por eje y resultado
    data.forEach((registro: { eje: string; resultado: string; fecha: string }) => {
      const eje = registro.eje as "CF" | "CT" | "O"
      if (resultado.porEje[eje]) {
        resultado.porEje[eje].total++
        if (registro.resultado === "green") resultado.porEje[eje].green++
        else if (registro.resultado === "yellow") resultado.porEje[eje].yellow++
        else if (registro.resultado === "red") resultado.porEje[eje].red++
      }
    })

    // Calcular semana aproximada basada en total de registros por eje
    Object.keys(resultado.porEje).forEach((eje) => {
      const totalEje = resultado.porEje[eje as "CF" | "CT" | "O"].total
      // Aproximar: cada 20 registros = 1 semana avanzada
      resultado.ultimaSemana[eje as "CF" | "CT" | "O"] = Math.min(25, Math.floor(totalEje / 20) + 1)
    })

    // Calcular tendencia (ultimos 20 vs anteriores 20)
    Object.keys(resultado.porEje).forEach((eje) => {
      const registrosEje = data.filter((r: { eje: string }) => r.eje === eje)
      if (registrosEje.length >= 20) {
        const recientes = registrosEje.slice(0, 10)
        const anteriores = registrosEje.slice(10, 20)
        
        const promedioReciente = recientes.filter((r: { resultado: string }) => r.resultado === "green").length / recientes.length
        const promedioAnterior = anteriores.filter((r: { resultado: string }) => r.resultado === "green").length / anteriores.length
        
        if (promedioReciente > promedioAnterior + 0.1) {
          resultado.tendencia[eje as "CF" | "CT" | "O"] = "mejorando"
        } else if (promedioReciente < promedioAnterior - 0.1) {
          resultado.tendencia[eje as "CF" | "CT" | "O"] = "bajando"
        }
      }
    })

    return resultado
  } catch (err) {
    console.error("[v0] Error obteniendo historial:", err)
    return resultado
  }
}

// ── Generar sugerencia con IA ──────────────────────────────────────────────
async function generarSugerenciaConIA(
  historial: Awaited<ReturnType<typeof obtenerHistorialSeguimiento>>,
  ejeActual: string,
  statsHoy: { green: number; yellow: number; red: number }
): Promise<string | null> {
  if (!GEMINI_API_KEY) return null

  const secuencia = SECUENCIA_CURRICULAR[ejeActual]
  const semanaActual = historial.ultimaSemana[ejeActual] || 1
  const actividadActual = secuencia?.actividades[semanaActual - 1]
  const tendencia = historial.tendencia[ejeActual]
  const datosEje = historial.porEje[ejeActual as "CF" | "CT" | "O"]

  const prompt = `Eres ALBA, un asistente pedagogico experto en alfabetizacion inicial para ninos de 4-5 anos.

CONTEXTO:
- Eje actual: ${secuencia?.nombre || ejeActual}
- Semana de la secuencia: ${semanaActual} de 25
- Actividad actual: "${actividadActual?.titulo}"
- Objetivo: "${actividadActual?.objetivo}"

DATOS HISTORICOS DEL EJE ${ejeActual}:
- Total evaluaciones: ${datosEje?.total || 0}
- Logrado (verde): ${datosEje?.green || 0} (${datosEje?.total ? Math.round((datosEje.green / datosEje.total) * 100) : 0}%)
- En proceso (amarillo): ${datosEje?.yellow || 0}
- Necesita refuerzo (rojo): ${datosEje?.red || 0}
- Tendencia: ${tendencia}

EVALUACIONES DE HOY:
- Verde: ${statsHoy.green}
- Amarillo: ${statsHoy.yellow}
- Rojo: ${statsHoy.red}

INSTRUCCION:
Basandote en estos datos, genera UNA recomendacion pedagogica breve (maximo 2 oraciones) sobre:
1. Si la clase debe AVANZAR a la siguiente semana, REPETIR la actividad actual, o hacer REFUERZO
2. Una sugerencia concreta para manana

Responde SOLO con la recomendacion, sin explicaciones adicionales.`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 150, temperature: 0.7 },
        }),
      }
    )

    if (!response.ok) return null

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || null
  } catch (err) {
    console.error("[v0] Error con Gemini:", err)
    return null
  }
}

// ── Generar actividad de la secuencia ──────────────────────────────────────
function generarActividadSecuencia(
  eje: string,
  semana: number,
  decision: "avanzar" | "repetir" | "reforzar",
  razonIA?: string | null
): BrainActivity {
  const secuencia = SECUENCIA_CURRICULAR[eje]
  if (!secuencia) {
    return {
      id: "demo",
      dia: 1,
      semana: 1,
      titulo: "Actividad de inicio",
      descripcion: "Comenzar con actividades de reconocimiento.",
      objetivo: "Iniciar la secuencia de aprendizaje.",
      source: "demo",
      ejeRecomendado: eje,
    }
  }

  let semanaObjetivo = semana
  let razon = ""

  switch (decision) {
    case "avanzar":
      semanaObjetivo = Math.min(25, semana + 1)
      razon = `El grupo mostro buen desempeno. Avanzamos a la semana ${semanaObjetivo} de ${secuencia.nombre}.`
      break
    case "repetir":
      razon = `Algunos alumnos necesitan consolidar. Repetimos la semana ${semana} de ${secuencia.nombre}.`
      break
    case "reforzar":
      semanaObjetivo = Math.max(1, semana - 1)
      razon = `Detectamos dificultades. Reforzamos con actividades de la semana ${semanaObjetivo}.`
      break
  }

  const actividad = secuencia.actividades[semanaObjetivo - 1]

  return {
    id: `${eje}-sem${semanaObjetivo}`,
    dia: semanaObjetivo,
    semana: semanaObjetivo,
    titulo: actividad.titulo,
    descripcion: generarDescripcionActividad(eje, semanaObjetivo),
    objetivo: actividad.objetivo,
    source: razonIA ? "alba-ia" : "secuencia",
    ejeRecomendado: eje,
    razon: razonIA || razon,
  }
}

// ── POST: Analisis inteligente ─────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ejeActual = "CF", stats = { green: 0, yellow: 0, red: 0 } } = body

    // Obtener historial de Supabase
    const historial = await obtenerHistorialSeguimiento()
    const semanaActual = historial.ultimaSemana[ejeActual] || 1

    // Determinar decision basada en stats de hoy
    const totalHoy = stats.green + stats.yellow + stats.red
    let decision: "avanzar" | "repetir" | "reforzar" = "repetir"

    if (totalHoy > 0) {
      const porcentajeVerde = (stats.green / totalHoy) * 100
      const porcentajeRojo = (stats.red / totalHoy) * 100

      if (porcentajeVerde >= 70) {
        decision = "avanzar"
      } else if (porcentajeRojo >= 40) {
        decision = "reforzar"
      }
    }

    // Generar sugerencia con IA si esta disponible
    const sugerenciaIA = await generarSugerenciaConIA(historial, ejeActual, stats)

    // Generar actividad basada en la secuencia curricular
    const activity = generarActividadSecuencia(ejeActual, semanaActual, decision, sugerenciaIA)

    return NextResponse.json({ 
      activity,
      historial: {
        semanaActual,
        tendencia: historial.tendencia[ejeActual],
        totalRegistros: historial.totalRegistros,
      }
    })
  } catch (err) {
    console.error("[v0] Error in brain POST:", err)
    return NextResponse.json({ 
      activity: generarActividadSecuencia("CF", 1, "repetir"),
    })
  }
}

// ── GET: Actividad por defecto ─────────────────────────────────────────────
export async function GET() {
  try {
    const historial = await obtenerHistorialSeguimiento()
    
    // Determinar que eje necesita mas atencion
    let ejeRecomendado = "CF"
    let menorPorcentajeVerde = 100

    Object.entries(historial.porEje).forEach(([eje, datos]) => {
      if (datos.total > 0) {
        const porcentajeVerde = (datos.green / datos.total) * 100
        if (porcentajeVerde < menorPorcentajeVerde) {
          menorPorcentajeVerde = porcentajeVerde
          ejeRecomendado = eje
        }
      }
    })

    const semana = historial.ultimaSemana[ejeRecomendado] || 1
    const activity = generarActividadSecuencia(ejeRecomendado, semana, "repetir")

    return NextResponse.json({ 
      activity,
      historial: {
        semanaActual: semana,
        ejeRecomendado,
        totalRegistros: historial.totalRegistros,
      }
    })
  } catch (err) {
    console.error("[v0] Error in brain GET:", err)
    return NextResponse.json({ 
      activity: generarActividadSecuencia("CF", 1, "repetir"),
    })
  }
}
