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
    nombre: "Conocimiento del Texto - Lectura Dialogica + Cruz de Comprension",
    actividades: [
      // Lectura Dialogica - Fundamentos
      { semana: 1, titulo: "LD: Antes de leer - Exploracion", objetivo: "Activar conocimientos previos con portada, titulo e ilustraciones" },
      { semana: 2, titulo: "LD: Antes de leer - Predicciones", objetivo: "Formular hipotesis sobre el contenido" },
      { semana: 3, titulo: "LD: Durante - Pausas dialogicas", objetivo: "Participar con preguntas durante la lectura" },
      { semana: 4, titulo: "LD: Durante - Vocabulario", objetivo: "Inferir significado de palabras nuevas" },
      { semana: 5, titulo: "LD: Despues - Recontar", objetivo: "Recontar la historia con propias palabras" },
      { semana: 6, titulo: "LD: Despues - Conexiones", objetivo: "Conectar texto con experiencias personales" },
      { semana: 7, titulo: "LD: Ciclo completo cuento", objetivo: "Aplicar las tres fases con un cuento" },
      { semana: 8, titulo: "LD: Ciclo completo informativo", objetivo: "Aplicar lectura dialogica con texto informativo" },
      // Cruz de Comprension - Nivel Literal
      { semana: 9, titulo: "Cruz: QUIEN", objetivo: "Responder QUIEN usando evidencia del texto" },
      { semana: 10, titulo: "Cruz: QUE", objetivo: "Responder QUE sucede con informacion explicita" },
      { semana: 11, titulo: "Cruz: DONDE", objetivo: "Responder DONDE ocurre con evidencia textual" },
      { semana: 12, titulo: "Cruz: CUANDO", objetivo: "Responder CUANDO suceden los eventos" },
      { semana: 13, titulo: "Cruz: Integracion literal", objetivo: "Usar las 4 preguntas para comprension literal" },
      // Cruz de Comprension - Nivel Inferencial
      { semana: 14, titulo: "Cruz: POR QUE", objetivo: "Inferir POR QUE suceden las cosas (causa-efecto)" },
      { semana: 15, titulo: "Cruz: COMO", objetivo: "Inferir COMO suceden las acciones" },
      { semana: 16, titulo: "Cruz: PARA QUE", objetivo: "Inferir PARA QUE se realizan las acciones" },
      { semana: 17, titulo: "Cruz: QUE PASARIA SI", objetivo: "Formular hipotesis sobre alternativas" },
      { semana: 18, titulo: "Cruz: Integracion inferencial", objetivo: "Combinar preguntas para comprension profunda" },
      // Cruz de Comprension - Nivel Critico
      { semana: 19, titulo: "Cruz: QUE OPINAS", objetivo: "Expresar opinion fundamentada sobre el texto" },
      { semana: 20, titulo: "Cruz: ESTA BIEN O MAL", objetivo: "Emitir juicios eticos sobre personajes" },
      { semana: 21, titulo: "Cruz: QUE HARIAS TU", objetivo: "Aplicar lo aprendido a situaciones propias" },
      { semana: 22, titulo: "Cruz: Integracion critica", objetivo: "Desarrollar pensamiento critico sobre textos" },
      // Integracion LD + Cruz
      { semana: 23, titulo: "Integracion: LD + Cruz Literal", objetivo: "Combinar lectura dialogica con preguntas literales" },
      { semana: 24, titulo: "Integracion: LD + Cruz Completa", objetivo: "Aplicar ambas metodologias en secuencia" },
      { semana: 25, titulo: "Evaluacion CT", objetivo: "Evaluar con Lectura Dialogica y Cruz de Comprension" },
    ],
  },
  O: {
    nombre: "Oralidad - ECO Estructurado (Escuchar-Comprender-Oralizar)",
    actividades: [
      // ECO - ESCUCHAR
      { semana: 1, titulo: "ECO-E: Escucha de sonidos", objetivo: "Identificar y discriminar sonidos del entorno" },
      { semana: 2, titulo: "ECO-E: Escucha de voces", objetivo: "Reconocer voces familiares y sus caracteristicas" },
      { semana: 3, titulo: "ECO-E: Instrucciones simples", objetivo: "Seguir instrucciones de un paso con atencion" },
      { semana: 4, titulo: "ECO-E: Instrucciones complejas", objetivo: "Seguir instrucciones de dos o mas pasos" },
      { semana: 5, titulo: "ECO-E: Cuentos cortos", objetivo: "Mantener atencion durante narraciones breves" },
      { semana: 6, titulo: "ECO-E: Cuentos largos", objetivo: "Mantener atencion durante narraciones extensas" },
      { semana: 7, titulo: "ECO-E: Escucha selectiva", objetivo: "Identificar informacion especifica en mensaje oral" },
      { semana: 8, titulo: "ECO-E: Escucha critica", objetivo: "Distinguir hechos de opiniones" },
      // ECO - COMPRENDER
      { semana: 9, titulo: "ECO-C: Vocabulario receptivo I", objetivo: "Comprender palabras nuevas en contexto oral" },
      { semana: 10, titulo: "ECO-C: Vocabulario receptivo II", objetivo: "Ampliar categorias semanticas" },
      { semana: 11, titulo: "ECO-C: Comprension literal oral", objetivo: "Responder preguntas sobre lo escuchado" },
      { semana: 12, titulo: "ECO-C: Comprension inferencial", objetivo: "Inferir informacion no dicha explicitamente" },
      { semana: 13, titulo: "ECO-C: Secuencia temporal", objetivo: "Ordenar eventos escuchados cronologicamente" },
      { semana: 14, titulo: "ECO-C: Causa y efecto", objetivo: "Identificar relaciones causales" },
      { semana: 15, titulo: "ECO-C: Idea principal", objetivo: "Identificar el tema central de un mensaje" },
      { semana: 16, titulo: "ECO-C: Detalles de apoyo", objetivo: "Identificar detalles que apoyan la idea principal" },
      // ECO - ORALIZAR
      { semana: 17, titulo: "ECO-O: Nombrar y etiquetar", objetivo: "Producir vocabulario preciso" },
      { semana: 18, titulo: "ECO-O: Describir con estructura", objetivo: "Usar marcos: es..., tiene..., sirve para..." },
      { semana: 19, titulo: "ECO-O: Narrar con secuencia", objetivo: "Contar usando primero, luego, despues, al final" },
      { semana: 20, titulo: "ECO-O: Explicar procesos", objetivo: "Explicar como hacer algo paso a paso" },
      { semana: 21, titulo: "ECO-O: Argumentar simple", objetivo: "Dar razones para apoyar una opinion" },
      { semana: 22, titulo: "ECO-O: Dialogar con turnos", objetivo: "Conversar respetando turnos y tema" },
      { semana: 23, titulo: "ECO-O: Exponer oralmente", objetivo: "Presentar con introduccion, desarrollo y cierre" },
      { semana: 24, titulo: "ECO-O: Recontar elaborado", objetivo: "Recontar agregando detalles y emociones" },
      { semana: 25, titulo: "Evaluacion ECO", objetivo: "Evaluar Escuchar-Comprender-Oralizar integrado" },
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
      // Lectura Dialogica
      1: "LECTURA DIALOGICA - ANTES:\n1. Mostrar la portada sin decir el titulo.\n2. Preguntar: Que ven en la imagen?\n3. Leer el titulo y preguntar: De que creen que se trata?\n4. Activar conocimientos previos: Saben algo sobre esto?\n5. Generar expectativas: Que creen que pasara?",
      2: "LECTURA DIALOGICA - PREDICCIONES:\n1. Mostrar ilustraciones sin leer texto.\n2. Preguntar: Que creen que dice aqui?\n3. Anotar predicciones de los ninos.\n4. Leer para verificar predicciones.\n5. Comparar: acertaron o no? Por que?",
      3: "LECTURA DIALOGICA - DURANTE:\n1. Leer pausando en momentos clave.\n2. Preguntar: Que creen que pasara ahora?\n3. Verificar comprension: Por que hizo eso?\n4. Conectar con experiencias: Te paso algo asi?\n5. Continuar lectura integrando respuestas.",
      // Cruz de Comprension
      9: "CRUZ DE COMPRENSION - QUIEN:\n1. Leer un cuento corto completo.\n2. Preguntar: QUIEN es el personaje principal?\n3. Buscar evidencia en el texto.\n4. Preguntar: QUIEN mas aparece en la historia?\n5. Clasificar personajes: principales y secundarios.",
      10: "CRUZ DE COMPRENSION - QUE:\n1. Releer el cuento trabajado.\n2. Preguntar: QUE paso al principio?\n3. QUE paso en el medio? QUE paso al final?\n4. Ordenar acciones en secuencia.\n5. Verificar respuestas con el texto.",
      14: "CRUZ DE COMPRENSION - POR QUE:\n1. Leer historia con conflicto claro.\n2. Preguntar: POR QUE el personaje hizo eso?\n3. Buscar pistas en el texto que lo expliquen.\n4. Discutir causa y efecto.\n5. Crear cadena: esto paso PORQUE...",
    },
    O: {
      // ECO - Escuchar
      1: "ECO - ESCUCHAR SONIDOS:\n1. Cerrar los ojos en silencio total.\n2. Escuchar sonidos del ambiente por 1 minuto.\n3. Abrir ojos y nombrar cada sonido escuchado.\n4. Clasificar: sonidos cercanos vs lejanos.\n5. Juego: adivinar el sonido con ojos cerrados.",
      3: "ECO - ESCUCHAR INSTRUCCIONES:\n1. Dar UNA instruccion clara (ej: toca tu nariz).\n2. Los ninos ejecutan la instruccion.\n3. Aumentar complejidad: dos instrucciones seguidas.\n4. Juego: Simon dice... con instrucciones.\n5. Reflexionar: que ayuda a recordar instrucciones?",
      // ECO - Comprender
      9: "ECO - COMPRENDER VOCABULARIO:\n1. Leer un cuento con palabras nuevas.\n2. Pausar en palabra nueva: Que creen que significa?\n3. Usar el contexto para inferir significado.\n4. Confirmar o corregir con explicacion simple.\n5. Usar la palabra nueva en una oracion.",
      11: "ECO - COMPRENSION LITERAL:\n1. Leer un texto corto informativo.\n2. Preguntar: Que escucharon? (sin inferir)\n3. Solo aceptar respuestas del texto.\n4. Si inventan, regresar al texto.\n5. Practicar: buscar la respuesta exacta.",
      // ECO - Oralizar
      17: "ECO - ORALIZAR NOMBRAR:\n1. Mostrar objetos o imagenes.\n2. Modelar: Esto es un/una... Es de color...\n3. Los ninos nombran objetos con precision.\n4. Corregir gentilmente si usan palabras vagas.\n5. Juego rapido: nombrar todo lo que ven.",
      19: "ECO - ORALIZAR NARRAR:\n1. Modelar con secuenciadores: PRIMERO..., LUEGO..., DESPUES..., AL FINAL...\n2. Contar una experiencia usando secuenciadores.\n3. Cada nino practica con su experiencia.\n4. Apoyar con tarjetas de secuencia.\n5. Retroalimentar: usaste los conectores?",
    },
  }
  
  return descripciones[eje]?.[semana] || 
    `1. Introducir el concepto de la semana.\n2. Modelar la actividad con ejemplos claros.\n3. Practicar en grupo grande.\n4. Trabajo en parejas o pequenos grupos.\n5. Cierre: reflexionar sobre lo aprendido.`
}

// ── Consultar historial de Supabase ────────────────────────────────────────
async function obtenerHistorialSeguimiento(sala?: string): Promise<{
  totalRegistros: number
  porEje: Record<string, { green: number; yellow: number; red: number; total: number; promedio: number }>
  ultimaSemana: Record<string, number>
  tendencia: Record<string, "mejorando" | "estable" | "bajando">
  diasEvaluados: Record<string, number>
}> {
  const resultado = {
    totalRegistros: 0,
    porEje: {
      CF: { green: 0, yellow: 0, red: 0, total: 0, promedio: 0 },
      CT: { green: 0, yellow: 0, red: 0, total: 0, promedio: 0 },
      O: { green: 0, yellow: 0, red: 0, total: 0, promedio: 0 },
    },
    ultimaSemana: { CF: 1, CT: 1, O: 1 },
    tendencia: { CF: "estable" as const, CT: "estable" as const, O: "estable" as const },
    diasEvaluados: { CF: 0, CT: 0, O: 0 },
  }

  if (!supabase) return resultado

  try {
    // Obtener TODOS los registros de seguimiento para calcular promedio real
    const { data, error } = await supabase
      .from("seguimiento")
      .select("eje, resultado, fecha")
      .order("fecha", { ascending: false })

    if (error || !data) return resultado

    resultado.totalRegistros = data.length

    // Contar por eje y resultado
    const fechasPorEje: Record<string, Set<string>> = { CF: new Set(), CT: new Set(), O: new Set() }
    
    data.forEach((registro: { eje: string; resultado: string; fecha: string }) => {
      const eje = registro.eje as "CF" | "CT" | "O"
      if (resultado.porEje[eje]) {
        resultado.porEje[eje].total++
        if (registro.resultado === "green") resultado.porEje[eje].green++
        else if (registro.resultado === "yellow") resultado.porEje[eje].yellow++
        else if (registro.resultado === "red") resultado.porEje[eje].red++
        
        // Contar dias unicos evaluados
        const fecha = registro.fecha.split("T")[0]
        fechasPorEje[eje].add(fecha)
      }
    })

    // Calcular promedio de logro por eje (verde=100, amarillo=50, rojo=10)
    Object.keys(resultado.porEje).forEach((eje) => {
      const datos = resultado.porEje[eje as "CF" | "CT" | "O"]
      if (datos.total > 0) {
        const puntosTotales = (datos.green * 100) + (datos.yellow * 50) + (datos.red * 10)
        datos.promedio = Math.round(puntosTotales / datos.total)
      }
      resultado.diasEvaluados[eje as "CF" | "CT" | "O"] = fechasPorEje[eje].size
    })

    // Calcular semana basada en PROMEDIO de logro de la sala
    // Si promedio >= 70% -> puede avanzar semana, si no -> se queda o retrocede
    Object.keys(resultado.porEje).forEach((eje) => {
      const datos = resultado.porEje[eje as "CF" | "CT" | "O"]
      const diasEvaluados = resultado.diasEvaluados[eje as "CF" | "CT" | "O"]
      
      // Calcular semana: empezamos en 1, avanzamos solo si el promedio es >= 70
      // Cada 5 dias con promedio >= 70 = avanzar 1 semana
      // Si promedio < 50, no avanzamos aunque pasen dias
      let semanaCalculada = 1
      
      if (datos.total > 0) {
        if (datos.promedio >= 70) {
          // Buen desempeno: avanzar 1 semana cada 5 dias de evaluacion
          semanaCalculada = Math.min(25, Math.floor(diasEvaluados / 5) + 1)
        } else if (datos.promedio >= 50) {
          // Desempeno medio: avanzar mas lento (1 semana cada 7 dias)
          semanaCalculada = Math.min(25, Math.floor(diasEvaluados / 7) + 1)
        } else {
          // Bajo desempeno: avanzar muy lento (1 semana cada 10 dias)
          semanaCalculada = Math.min(25, Math.floor(diasEvaluados / 10) + 1)
        }
      }
      
      resultado.ultimaSemana[eje as "CF" | "CT" | "O"] = Math.max(1, semanaCalculada)
    })

    // Calcular tendencia (ultimos 30 vs anteriores 30)
    Object.keys(resultado.porEje).forEach((eje) => {
      const registrosEje = data.filter((r: { eje: string }) => r.eje === eje)
      if (registrosEje.length >= 30) {
        const recientes = registrosEje.slice(0, 15)
        const anteriores = registrosEje.slice(15, 30)
        
        const calcularPuntaje = (registros: Array<{ resultado: string }>) => {
          const puntos = registros.reduce((acc, r) => {
            if (r.resultado === "green") return acc + 100
            if (r.resultado === "yellow") return acc + 50
            return acc + 10
          }, 0)
          return puntos / registros.length
        }
        
        const promedioReciente = calcularPuntaje(recientes)
        const promedioAnterior = calcularPuntaje(anteriores)
        
        if (promedioReciente > promedioAnterior + 10) {
          resultado.tendencia[eje as "CF" | "CT" | "O"] = "mejorando"
        } else if (promedioReciente < promedioAnterior - 10) {
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

  // Calcular promedios para el prompt
  const promedioHistorico = datosEje?.promedio || 0
  const totalHoy = statsHoy.green + statsHoy.yellow + statsHoy.red
  const promedioHoy = totalHoy > 0 
    ? Math.round(((statsHoy.green * 100) + (statsHoy.yellow * 50) + (statsHoy.red * 10)) / totalHoy)
    : 0

  const prompt = `Eres ALBA, un asistente pedagogico experto en alfabetizacion inicial para ninos de 4-5 anos.

CONTEXTO DE LA SALA:
- Eje actual: ${secuencia?.nombre || ejeActual}
- Semana de la secuencia curricular: ${semanaActual} de 25
- Actividad actual: "${actividadActual?.titulo}"
- Objetivo: "${actividadActual?.objetivo}"

PROMEDIO HISTORICO DE LA SALA EN ${ejeActual}:
- Total evaluaciones acumuladas: ${datosEje?.total || 0}
- PROMEDIO DE LOGRO: ${promedioHistorico}% (verde=100, amarillo=50, rojo=10)
- Distribucion: ${datosEje?.green || 0} logrado, ${datosEje?.yellow || 0} en proceso, ${datosEje?.red || 0} refuerzo
- Tendencia: ${tendencia}

EVALUACION DE HOY:
- Alumnos evaluados: ${totalHoy}
- Verde (logrado): ${statsHoy.green}
- Amarillo (proceso): ${statsHoy.yellow}
- Rojo (refuerzo): ${statsHoy.red}
- PROMEDIO HOY: ${promedioHoy}%

REGLAS DE DECISION:
- Si promedio >= 70% y tendencia no baja -> AVANZAR a siguiente semana
- Si promedio < 40% o tendencia bajando -> REFORZAR con semana anterior
- Si promedio 40-70% -> REPETIR para consolidar

INSTRUCCION:
Analiza el PROMEDIO DE LA SALA (no solo el de hoy) y genera UNA recomendacion pedagogica de 2-3 oraciones que incluya:
1. La decision (AVANZAR/REPETIR/REFORZAR) y por que
2. Una sugerencia concreta de actividad para manana basada en la secuencia curricular

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

// ── POST: Analisis inteligente basado en promedio de la sala ───────────────
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ejeActual = "CF", stats = { green: 0, yellow: 0, red: 0 } } = body

    // Obtener historial COMPLETO de Supabase
    const historial = await obtenerHistorialSeguimiento()
    const semanaActual = historial.ultimaSemana[ejeActual] || 1
    const datosEje = historial.porEje[ejeActual as "CF" | "CT" | "O"]
    const promedioHistorico = datosEje?.promedio || 0
    const tendencia = historial.tendencia[ejeActual]

    // Calcular promedio de hoy
    const totalHoy = stats.green + stats.yellow + stats.red
    let promedioHoy = 0
    if (totalHoy > 0) {
      promedioHoy = Math.round(((stats.green * 100) + (stats.yellow * 50) + (stats.red * 10)) / totalHoy)
    }

    // DECISION BASADA EN PROMEDIO HISTORICO + TENDENCIA + HOY
    let decision: "avanzar" | "repetir" | "reforzar" = "repetir"
    
    // Promedio combinado: 60% historico + 40% hoy (si hay datos de hoy)
    const promedioCombinado = totalHoy > 0 
      ? Math.round((promedioHistorico * 0.6) + (promedioHoy * 0.4))
      : promedioHistorico

    // Logica de decision
    if (promedioCombinado >= 70 && tendencia !== "bajando") {
      // Buen promedio y no esta bajando -> AVANZAR
      decision = "avanzar"
    } else if (promedioCombinado < 40 || tendencia === "bajando") {
      // Promedio bajo o tendencia bajando -> REFORZAR
      decision = "reforzar"
    } else {
      // Promedio medio (40-70) -> REPETIR para consolidar
      decision = "repetir"
    }

    // Si hoy fue muy malo (>50% rojo) y el historico era bueno, solo repetir
    if (totalHoy > 0 && promedioHoy < 30 && promedioHistorico >= 70) {
      decision = "repetir" // Un mal dia no debe hacernos retroceder si el historico es bueno
    }

    // Generar sugerencia con IA incluyendo promedios
    const sugerenciaIA = await generarSugerenciaConIA(historial, ejeActual, stats)

    // Generar actividad basada en la secuencia curricular
    const activity = generarActividadSecuencia(ejeActual, semanaActual, decision, sugerenciaIA)

    return NextResponse.json({ 
      activity,
      historial: {
        semanaActual,
        tendencia,
        totalRegistros: historial.totalRegistros,
        promedioHistorico,
        promedioHoy,
        promedioCombinado,
        diasEvaluados: historial.diasEvaluados[ejeActual],
        decision,
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
