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
  materiales?: string[]
  source: "secuencia" | "alba-ia" | "demo"
  ejeRecomendado: string
  razon?: string
  }

// ── Configuracion de Salas por Edad ────────────────────────────────────────
// Salas de 5 años: secuencia CF → O → CT (semanal)
// Salas de 4 años: secuencia O → CF → CT (priorizando oralidad)
interface SalaConfig {
  edad: 4 | 5
  secuenciaEjes: Array<"CF" | "O" | "CT">
  descripcion: string
}

const SALAS_CONFIG: Record<string, SalaConfig> = {
  "Manzanos": { edad: 5, secuenciaEjes: ["CF", "O", "CT"], descripcion: "Sala de 5 años - TM" },
  "Girasoles": { edad: 5, secuenciaEjes: ["CF", "O", "CT"], descripcion: "Sala de 5 años - TM" },
  "Alamos": { edad: 5, secuenciaEjes: ["CF", "O", "CT"], descripcion: "Sala de 5 años - TT" },
  "Nogales TM": { edad: 4, secuenciaEjes: ["O", "CF", "CT"], descripcion: "Sala de 4 años - TM" },
  "Nogales TT": { edad: 4, secuenciaEjes: ["O", "CF", "CT"], descripcion: "Sala de 4 años - TT" },
}

// Obtener configuracion de sala (default a 5 años si no existe)
function getSalaConfig(sala: string): SalaConfig {
  return SALAS_CONFIG[sala] || { edad: 5, secuenciaEjes: ["CF", "O", "CT"], descripcion: "Sala por defecto" }
}

interface SecuenciaActividad {
  semana: number
  titulo: string
  objetivo: string
  materiales?: string[]
}

// ── Secuencia Anual Curricular por Eje ─────────────────────────────────────
const SECUENCIA_CURRICULAR: Record<string, { nombre: string; actividades: SecuenciaActividad[] }> = {
  CF: {
    nombre: "Conciencia Fonologica",
    actividades: [
      { semana: 1, titulo: "Sonidos del entorno", objetivo: "Discriminar sonidos ambientales y asociarlos a su fuente", materiales: ["Campana o triangulo", "Grabadora o celular con sonidos", "Tarjetas con imagenes de fuentes sonoras", "Antifaz o venda para ojos"] },
      { semana: 2, titulo: "Rimas y canciones", objetivo: "Identificar palabras que riman en canciones conocidas", materiales: ["Cancionero con rimas ilustradas", "Titere o muneco", "Tarjetas con dibujos de palabras que riman"] },
      { semana: 3, titulo: "Segmentacion silabica", objetivo: "Separar palabras en silabas usando palmadas", materiales: ["Tarjetas con imagenes de objetos", "Circulos de cartulina para contar silabas", "Tambor o pandereta"] },
      { semana: 4, titulo: "Sonido inicial /a/", objetivo: "Identificar palabras que comienzan con el sonido /a/", materiales: ["Tarjetas con imagenes que empiezan con A", "Caja o bolsa misteriosa", "Letra A en distintos formatos"] },
      { semana: 5, titulo: "Sonido inicial /e/", objetivo: "Identificar palabras que comienzan con el sonido /e/", materiales: ["Tarjetas con imagenes que empiezan con E", "Espejo para ver posicion de boca", "Letra E en distintos formatos"] },
      { semana: 6, titulo: "Sonido inicial /i/", objetivo: "Identificar palabras que comienzan con el sonido /i/", materiales: ["Tarjetas con imagenes que empiezan con I", "Letra I en distintos formatos"] },
      { semana: 7, titulo: "Sonido inicial /o/", objetivo: "Identificar palabras que comienzan con el sonido /o/", materiales: ["Tarjetas con imagenes que empiezan con O", "Letra O en distintos formatos"] },
      { semana: 8, titulo: "Sonido inicial /u/", objetivo: "Identificar palabras que comienzan con el sonido /u/", materiales: ["Tarjetas con imagenes que empiezan con U", "Letra U en distintos formatos"] },
      { semana: 9, titulo: "Vocales - Repaso", objetivo: "Consolidar identificacion de sonidos vocalicos iniciales", materiales: ["Set completo de vocales", "Canasto o cajas para clasificar", "Dado con vocales"] },
      { semana: 10, titulo: "Sonido inicial /m/", objetivo: "Identificar palabras que comienzan con el sonido /m/", materiales: ["Tarjetas con imagenes que empiezan con M", "Espejo", "Letra M en distintos formatos"] },
      { semana: 11, titulo: "Sonido inicial /p/", objetivo: "Identificar palabras que comienzan con el sonido /p/", materiales: ["Tarjetas con imagenes que empiezan con P", "Plumas o papelitos para soplar", "Letra P en distintos formatos"] },
      { semana: 12, titulo: "Sonido inicial /s/", objetivo: "Identificar palabras que comienzan con el sonido /s/", materiales: ["Tarjetas con imagenes que empiezan con S", "Serpiente de peluche o dibujo", "Letra S en distintos formatos"] },
      { semana: 13, titulo: "Sonido inicial /l/", objetivo: "Identificar palabras que comienzan con el sonido /l/", materiales: ["Tarjetas con imagenes que empiezan con L", "Letra L en distintos formatos"] },
      { semana: 14, titulo: "Sonido inicial /t/", objetivo: "Identificar palabras que comienzan con el sonido /t/", materiales: ["Tarjetas con imagenes que empiezan con T", "Letra T en distintos formatos"] },
      { semana: 15, titulo: "Sonido inicial /n/", objetivo: "Identificar palabras que comienzan con el sonido /n/", materiales: ["Tarjetas con imagenes que empiezan con N", "Letra N en distintos formatos"] },
      { semana: 16, titulo: "Consonantes - Repaso", objetivo: "Consolidar identificacion de sonidos consonanticos", materiales: ["Set de consonantes trabajadas", "Tablero de clasificacion", "Fichas o tokens"] },
      { semana: 17, titulo: "Sonido final", objetivo: "Identificar el sonido final de palabras cortas", materiales: ["Tarjetas con imagenes", "Fichas de colores", "Tablero de sonidos finales"] },
      { semana: 18, titulo: "Sonidos medios", objetivo: "Identificar sonidos en posicion media de palabras", materiales: ["Tarjetas con imagenes de palabras CVC", "Esquema de tres cajas para posicion"] },
      { semana: 19, titulo: "Sintesis de fonemas", objetivo: "Unir fonemas para formar palabras simples", materiales: ["Robot o titere que habla lento", "Tarjetas con imagenes de palabras cortas"] },
      { semana: 20, titulo: "Analisis de fonemas", objetivo: "Descomponer palabras en sus fonemas individuales", materiales: ["Cajitas o cubos para contar fonemas", "Tarjetas con imagenes"] },
      { semana: 21, titulo: "Sustitucion de fonemas", objetivo: "Cambiar un fonema para crear palabras nuevas", materiales: ["Tarjetas de letras moviles", "Pizarra o franelografo"] },
      { semana: 22, titulo: "Omision de fonemas", objetivo: "Identificar que palabra queda al quitar un fonema", materiales: ["Tarjetas de letras", "Fichas para tapar sonidos"] },
      { semana: 23, titulo: "Adicion de fonemas", objetivo: "Agregar fonemas para crear palabras nuevas", materiales: ["Tarjetas de letras moviles", "Pizarra"] },
      { semana: 24, titulo: "Manipulacion avanzada", objetivo: "Realizar operaciones complejas con fonemas", materiales: ["Set completo de letras", "Tablero de manipulacion"] },
      { semana: 25, titulo: "Evaluacion CF", objetivo: "Evaluar el dominio de la conciencia fonologica", materiales: ["Rúbrica de evaluacion", "Registro individual"] },
    ],
  },
  CT: {
    nombre: "Conocimiento del Texto - Lectura Dialogica + Cruz de Comprension",
    actividades: [
      // Lectura Dialogica - Fundamentos
      { semana: 1, titulo: "LD: Antes de leer - Exploracion", objetivo: "Activar conocimientos previos con portada, titulo e ilustraciones", materiales: ["Cuento con portada atractiva", "Atril o soporte para libro", "Pizarra para anotar predicciones"] },
      { semana: 2, titulo: "LD: Antes de leer - Predicciones", objetivo: "Formular hipotesis sobre el contenido", materiales: ["Libro seleccionado", "Tarjetas para escribir predicciones", "Post-its"] },
      { semana: 3, titulo: "LD: Durante - Pausas dialogicas", objetivo: "Participar con preguntas durante la lectura", materiales: ["Libro con marcadores de pausas", "Titere preguntador", "Campana para pausas"] },
      { semana: 4, titulo: "LD: Durante - Vocabulario", objetivo: "Inferir significado de palabras nuevas", materiales: ["Libro seleccionado", "Tarjetas de vocabulario", "Diccionario ilustrado"] },
      { semana: 5, titulo: "LD: Despues - Recontar", objetivo: "Recontar la historia con propias palabras", materiales: ["Libro leido", "Secuencia de imagenes del cuento", "Titeres de personajes"] },
      { semana: 6, titulo: "LD: Despues - Conexiones", objetivo: "Conectar texto con experiencias personales", materiales: ["Libro leido", "Hojas para dibujar conexiones", "Marcadores"] },
      { semana: 7, titulo: "LD: Ciclo completo cuento", objetivo: "Aplicar las tres fases con un cuento", materiales: ["Cuento nuevo", "Guia de lectura dialogica", "Material para actividad de cierre"] },
      { semana: 8, titulo: "LD: Ciclo completo informativo", objetivo: "Aplicar lectura dialogica con texto informativo", materiales: ["Libro informativo con imagenes", "Tarjetas KWL (Se-Quiero saber-Aprendi)"] },
      // Cruz de Comprension - Nivel Literal
      { semana: 9, titulo: "Cruz: QUIEN", objetivo: "Responder QUIEN usando evidencia del texto", materiales: ["Cuento con personajes claros", "Tarjetas QUIEN", "Siluetas de personajes"] },
      { semana: 10, titulo: "Cruz: QUE", objetivo: "Responder QUE sucede con informacion explicita", materiales: ["Cuento seleccionado", "Tarjetas QUE", "Secuencia de acciones"] },
      { semana: 11, titulo: "Cruz: DONDE", objetivo: "Responder DONDE ocurre con evidencia textual", materiales: ["Cuento con lugares definidos", "Tarjetas DONDE", "Mapa o escenario del cuento"] },
      { semana: 12, titulo: "Cruz: CUANDO", objetivo: "Responder CUANDO suceden los eventos", materiales: ["Cuento con secuencia temporal", "Tarjetas CUANDO", "Linea de tiempo"] },
      { semana: 13, titulo: "Cruz: Integracion literal", objetivo: "Usar las 4 preguntas para comprension literal", materiales: ["Cruz de comprension en carton", "Cuento nuevo", "Tarjetas de las 4 preguntas"] },
      // Cruz de Comprension - Nivel Inferencial
      { semana: 14, titulo: "Cruz: POR QUE", objetivo: "Inferir POR QUE suceden las cosas (causa-efecto)", materiales: ["Cuento con causas claras", "Tarjetas POR QUE", "Flechas causa-efecto"] },
      { semana: 15, titulo: "Cruz: COMO", objetivo: "Inferir COMO suceden las acciones", materiales: ["Cuento seleccionado", "Tarjetas COMO", "Secuencia de pasos"] },
      { semana: 16, titulo: "Cruz: PARA QUE", objetivo: "Inferir PARA QUE se realizan las acciones", materiales: ["Cuento con propositos claros", "Tarjetas PARA QUE"] },
      { semana: 17, titulo: "Cruz: QUE PASARIA SI", objetivo: "Formular hipotesis sobre alternativas", materiales: ["Cuento conocido", "Tarjetas de alternativas", "Dados de historias"] },
      { semana: 18, titulo: "Cruz: Integracion inferencial", objetivo: "Combinar preguntas para comprension profunda", materiales: ["Cruz de comprension completa", "Cuento nuevo"] },
      // Cruz de Comprension - Nivel Critico
      { semana: 19, titulo: "Cruz: QUE OPINAS", objetivo: "Expresar opinion fundamentada sobre el texto", materiales: ["Cuento con dilema", "Caritas de opinion", "Microfono de juguete"] },
      { semana: 20, titulo: "Cruz: ESTA BIEN O MAL", objetivo: "Emitir juicios eticos sobre personajes", materiales: ["Cuento con acciones a juzgar", "Tarjetas bien/mal", "Balanza de justicia"] },
      { semana: 21, titulo: "Cruz: QUE HARIAS TU", objetivo: "Aplicar lo aprendido a situaciones propias", materiales: ["Cuento seleccionado", "Hojas para dibujar", "Tarjetas de situaciones"] },
      { semana: 22, titulo: "Cruz: Integracion critica", objetivo: "Desarrollar pensamiento critico sobre textos", materiales: ["Cruz completa", "Cuento desafiante"] },
      // Integracion LD + Cruz
      { semana: 23, titulo: "Integracion: LD + Cruz Literal", objetivo: "Combinar lectura dialogica con preguntas literales", materiales: ["Cuento nuevo", "Guia LD", "Cruz literal"] },
      { semana: 24, titulo: "Integracion: LD + Cruz Completa", objetivo: "Aplicar ambas metodologias en secuencia", materiales: ["Cuento nuevo", "Guia completa LD + Cruz"] },
      { semana: 25, titulo: "Evaluacion CT", objetivo: "Evaluar con Lectura Dialogica y Cruz de Comprension", materiales: ["Rubrica de evaluacion", "Cuento de evaluacion", "Registro individual"] },
    ],
  },
  O: {
    nombre: "Oralidad - ECO Estructurado (Escuchar-Comprender-Oralizar)",
    actividades: [
      // ECO - ESCUCHAR
      { semana: 1, titulo: "ECO-E: Escucha de sonidos", objetivo: "Identificar y discriminar sonidos del entorno", materiales: ["Grabadora o celular con sonidos", "Instrumentos musicales variados", "Campana", "Objetos sonoros"] },
      { semana: 2, titulo: "ECO-E: Escucha de voces", objetivo: "Reconocer voces familiares y sus caracteristicas", materiales: ["Grabaciones de voces familiares", "Antifaz", "Microfono de juguete"] },
      { semana: 3, titulo: "ECO-E: Instrucciones simples", objetivo: "Seguir instrucciones de un paso con atencion", materiales: ["Objetos variados para manipular", "Tarjetas con acciones", "Silbato o campana"] },
      { semana: 4, titulo: "ECO-E: Instrucciones complejas", objetivo: "Seguir instrucciones de dos o mas pasos", materiales: ["Objetos para circuito de acciones", "Tarjetas de secuencia", "Cronometro"] },
      { semana: 5, titulo: "ECO-E: Cuentos cortos", objetivo: "Mantener atencion durante narraciones breves", materiales: ["Cuentos cortos ilustrados", "Titere narrador", "Alfombra de cuentos"] },
      { semana: 6, titulo: "ECO-E: Cuentos largos", objetivo: "Mantener atencion durante narraciones extensas", materiales: ["Cuento extenso", "Imagenes de apoyo", "Cojines para sentarse"] },
      { semana: 7, titulo: "ECO-E: Escucha selectiva", objetivo: "Identificar informacion especifica en mensaje oral", materiales: ["Grabaciones con datos especificos", "Tarjetas de busqueda", "Campana para senalar"] },
      { semana: 8, titulo: "ECO-E: Escucha critica", objetivo: "Distinguir hechos de opiniones", materiales: ["Tarjetas hecho/opinion", "Grabaciones con afirmaciones", "Caritas de acuerdo/desacuerdo"] },
      // ECO - COMPRENDER
      { semana: 9, titulo: "ECO-C: Vocabulario receptivo I", objetivo: "Comprender palabras nuevas en contexto oral", materiales: ["Objetos reales o imagenes", "Tarjetas de vocabulario", "Bolsa misteriosa"] },
      { semana: 10, titulo: "ECO-C: Vocabulario receptivo II", objetivo: "Ampliar categorias semanticas", materiales: ["Cajas de categorias", "Objetos variados", "Tablero de clasificacion"] },
      { semana: 11, titulo: "ECO-C: Comprension literal oral", objetivo: "Responder preguntas sobre lo escuchado", materiales: ["Cuento o texto oral", "Tarjetas de preguntas", "Titere preguntador"] },
      { semana: 12, titulo: "ECO-C: Comprension inferencial", objetivo: "Inferir informacion no dicha explicitamente", materiales: ["Historias incompletas", "Tarjetas de inferencia", "Lupa de detective"] },
      { semana: 13, titulo: "ECO-C: Secuencia temporal", objetivo: "Ordenar eventos escuchados cronologicamente", materiales: ["Tarjetas de secuencia", "Linea de tiempo", "Marcadores primero/luego/despues"] },
      { semana: 14, titulo: "ECO-C: Causa y efecto", objetivo: "Identificar relaciones causales", materiales: ["Tarjetas causa-efecto", "Flechas de conexion", "Historias causales"] },
      { semana: 15, titulo: "ECO-C: Idea principal", objetivo: "Identificar el tema central de un mensaje", materiales: ["Textos orales cortos", "Tarjetas de tema", "Pizarra"] },
      { semana: 16, titulo: "ECO-C: Detalles de apoyo", objetivo: "Identificar detalles que apoyan la idea principal", materiales: ["Organizador grafico", "Tarjetas de detalles", "Texto oral"] },
      // ECO - ORALIZAR
      { semana: 17, titulo: "ECO-O: Nombrar y etiquetar", objetivo: "Producir vocabulario preciso", materiales: ["Objetos variados para nombrar", "Caja de vocabulario", "Tarjetas de imagenes"] },
      { semana: 18, titulo: "ECO-O: Describir con estructura", objetivo: "Usar marcos: es..., tiene..., sirve para...", materiales: ["Objetos para describir", "Marco de descripcion impreso", "Microfono"] },
      { semana: 19, titulo: "ECO-O: Narrar con secuencia", objetivo: "Contar usando primero, luego, despues, al final", materiales: ["Tarjetas de secuencia narrativa", "Dado cuenta-cuentos", "Linea de tiempo personal"] },
      { semana: 20, titulo: "ECO-O: Explicar procesos", objetivo: "Explicar como hacer algo paso a paso", materiales: ["Material para proceso simple", "Tarjetas de pasos", "Camara para grabar"] },
      { semana: 21, titulo: "ECO-O: Argumentar simple", objetivo: "Dar razones para apoyar una opinion", materiales: ["Tarjetas de opinion", "Conectores porque/por eso", "Microfono"] },
      { semana: 22, titulo: "ECO-O: Dialogar con turnos", objetivo: "Conversar respetando turnos y tema", materiales: ["Objeto para turnos de habla", "Reloj de arena", "Tarjetas de temas"] },
      { semana: 23, titulo: "ECO-O: Exponer oralmente", objetivo: "Presentar con introduccion, desarrollo y cierre", materiales: ["Objeto personal para exponer", "Estructura de exposicion", "Publico de peluches"] },
      { semana: 24, titulo: "ECO-O: Recontar elaborado", objetivo: "Recontar agregando detalles y emociones", materiales: ["Cuento conocido", "Titeres de personajes", "Escenario simple"] },
      { semana: 25, titulo: "Evaluacion ECO", objetivo: "Evaluar Escuchar-Comprender-Oralizar integrado", materiales: ["Rubrica ECO", "Registro individual", "Material de evaluacion"] },
    ],
  },
}

// ── Secuencia diferenciada para 4 anos ─────────────────────────────────────
// Salas de 4 anos priorizan actividades mas concretas, ludicas y con mas apoyo visual
const ADAPTACIONES_4_ANOS: Record<string, Record<number, { titulo: string; objetivo: string; adaptacion: string }>> = {
  CF: {
    1: { titulo: "Sonidos del entorno con imagenes", objetivo: "Asociar sonidos a imagenes", adaptacion: "Usar tarjetas grandes con imagenes de la fuente sonora" },
    2: { titulo: "Rimas con movimiento", objetivo: "Identificar rimas a traves del cuerpo", adaptacion: "Agregar movimientos corporales para cada rima" },
    3: { titulo: "Silabas con saltos", objetivo: "Separar silabas saltando", adaptacion: "Usar circulos en el piso, un salto por silaba" },
    4: { titulo: "Sonido /a/ con animales", objetivo: "Identificar /a/ en nombres de animales", adaptacion: "Usar peluches o titeres de animales que empiezan con A" },
  },
  CT: {
    1: { titulo: "Exploracion con manipulables", objetivo: "Explorar el libro fisicamente", adaptacion: "Dejar que toquen, abran, cierren el libro libremente" },
    2: { titulo: "Predicciones con titeres", objetivo: "Formular hipotesis jugando", adaptacion: "Usar un titere que hace las preguntas" },
    9: { titulo: "QUIEN con fotos", objetivo: "Identificar personajes con apoyo visual", adaptacion: "Usar fotos impresas de los personajes del cuento" },
  },
  O: {
    1: { titulo: "Escucha con instrumentos", objetivo: "Discriminar sonidos de instrumentos", adaptacion: "Usar instrumentos reales que puedan tocar" },
    17: { titulo: "Nombrar tocando", objetivo: "Nombrar objetos que pueden tocar", adaptacion: "Caja misteriosa: sacar objeto, nombrarlo, describirlo" },
    19: { titulo: "Narrar con secuencia visual", objetivo: "Contar usando imagenes ordenadas", adaptacion: "Tarjetas grandes con PRIMERO, LUEGO, DESPUES, AL FINAL" },
  },
}

// ── Inteligencia Adaptativa por Sala ───────────────────────────────────────
interface AnalisisSala {
  nivelGeneral: "inicial" | "en_desarrollo" | "avanzado"
  ejeDebil: string | null
  ejeFuerte: string | null
  necesitaRefuerzo: boolean
  recomendacionEspecial: string | null
  actividadesExitosas: string[]
  actividadesEvitar: string[]
}

async function analizarSala(sala: string): Promise<AnalisisSala> {
  const resultado: AnalisisSala = {
    nivelGeneral: "en_desarrollo",
    ejeDebil: null,
    ejeFuerte: null,
    necesitaRefuerzo: false,
    recomendacionEspecial: null,
    actividadesExitosas: [],
    actividadesEvitar: [],
  }

  if (!supabase) return resultado

  try {
    // Obtener registros de cierre de esta sala
    const { data: cierres } = await supabase
      .from("registros_cierre")
      .select("eje, promedio_logro, actividad_efectiva, actividad_docente, sugerencia_ia, evaluacion_general")
      .eq("sala", sala)
      .order("fecha", { ascending: false })
      .limit(30)

    if (!cierres || cierres.length === 0) return resultado

    // Calcular promedios por eje
    const promediosPorEje: Record<string, { suma: number; count: number }> = {
      CF: { suma: 0, count: 0 },
      CT: { suma: 0, count: 0 },
      O: { suma: 0, count: 0 },
    }

    cierres.forEach((c: { eje: string; promedio_logro: number; actividad_efectiva: boolean; actividad_docente: string }) => {
      if (promediosPorEje[c.eje]) {
        promediosPorEje[c.eje].suma += c.promedio_logro || 0
        promediosPorEje[c.eje].count++
      }
      
      // Recopilar actividades exitosas y a evitar
      if (c.actividad_efectiva && c.promedio_logro >= 60) {
        if (!resultado.actividadesExitosas.includes(c.actividad_docente)) {
          resultado.actividadesExitosas.push(c.actividad_docente)
        }
      } else if (c.promedio_logro < 40) {
        if (!resultado.actividadesEvitar.includes(c.actividad_docente)) {
          resultado.actividadesEvitar.push(c.actividad_docente)
        }
      }
    })

    // Determinar eje debil y fuerte
    let minPromedio = 100, maxPromedio = 0
    Object.entries(promediosPorEje).forEach(([eje, data]) => {
      if (data.count > 0) {
        const promedio = data.suma / data.count
        if (promedio < minPromedio) {
          minPromedio = promedio
          resultado.ejeDebil = eje
        }
        if (promedio > maxPromedio) {
          maxPromedio = promedio
          resultado.ejeFuerte = eje
        }
      }
    })

    // Determinar nivel general
    const promedioGeneral = Object.values(promediosPorEje)
      .filter(d => d.count > 0)
      .reduce((acc, d) => acc + d.suma / d.count, 0) / 3

    if (promedioGeneral >= 70) resultado.nivelGeneral = "avanzado"
    else if (promedioGeneral >= 45) resultado.nivelGeneral = "en_desarrollo"
    else resultado.nivelGeneral = "inicial"

    // Determinar si necesita refuerzo
    resultado.necesitaRefuerzo = minPromedio < 40

    // Generar recomendacion especial basada en datos
    if (resultado.ejeDebil && minPromedio < 40) {
      const nombreEje = resultado.ejeDebil === "CF" ? "Conciencia Fonologica" :
                        resultado.ejeDebil === "CT" ? "Comprension de Textos" : "Oralidad"
      resultado.recomendacionEspecial = `La sala muestra dificultades en ${nombreEje}. Se recomienda dedicar mas tiempo a este eje con actividades mas concretas y ludicas.`
    }

    return resultado
  } catch (err) {
    console.error("[v0] Error analizando sala:", err)
    return resultado
  }
}

// ── Descripcion de actividades detalladas ──────────────────────────────────
function generarDescripcionActividad(eje: string, semana: number, edad?: number): string {
  // Si es sala de 4 anos, buscar adaptacion primero
  if (edad === 4) {
    const adaptacion = ADAPTACIONES_4_ANOS[eje]?.[semana]
    if (adaptacion) {
      return `ADAPTACION PARA 4 ANOS:\n${adaptacion.adaptacion}\n\nActividad: ${adaptacion.titulo}\nObjetivo: ${adaptacion.objetivo}`
    }
  }
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

// ── Consultar registros de cierre para calcular progreso real ──────────────
async function obtenerProgresoSecuencia(sala: string): Promise<{
  totalClasesCompletadas: number
  semanaActual: number
  claseDeLaSemana: number // 1, 2 o 3
  ejeParaHoy: "CF" | "CT" | "O"
  clasesCompletadasPorEje: Record<string, number>
  ultimaFechaClase: string | null
  salaConfig: SalaConfig
}> {
  const salaConfig = getSalaConfig(sala)
  
  const resultado = {
    totalClasesCompletadas: 0,
    semanaActual: 1,
    claseDeLaSemana: 1,
    ejeParaHoy: salaConfig.secuenciaEjes[0] as "CF" | "CT" | "O",
    clasesCompletadasPorEje: { CF: 0, CT: 0, O: 0 },
    ultimaFechaClase: null as string | null,
    salaConfig,
  }

  if (!supabase) return resultado

  try {
    // Contar registros de cierre completados PARA ESTA SALA
    const { data: cierres, error } = await supabase
      .from("registros_cierre")
      .select("id, eje, fecha, evaluacion_general, sala")
      .eq("sala", sala)
      .order("fecha", { ascending: true })

    if (error || !cierres) return resultado

    resultado.totalClasesCompletadas = cierres.length
    
    // Contar clases por eje
    cierres.forEach((cierre: { eje: string; fecha: string }) => {
      if (resultado.clasesCompletadasPorEje[cierre.eje] !== undefined) {
        resultado.clasesCompletadasPorEje[cierre.eje]++
      }
    })

    if (cierres.length > 0) {
      resultado.ultimaFechaClase = cierres[cierres.length - 1].fecha
    }

    // Calcular semana actual: cada 3 clases = 1 semana
    resultado.semanaActual = Math.floor(resultado.totalClasesCompletadas / 3) + 1
    resultado.semanaActual = Math.min(25, resultado.semanaActual)

    // Calcular clase dentro de la semana (1, 2 o 3)
    resultado.claseDeLaSemana = (resultado.totalClasesCompletadas % 3) + 1

    // Determinar eje para hoy segun la secuencia de la sala (por edad)
    // Salas de 5 años: CF → O → CT
    // Salas de 4 años: O → CF → CT
    const secuenciaEjes = salaConfig.secuenciaEjes
    resultado.ejeParaHoy = secuenciaEjes[(resultado.totalClasesCompletadas) % 3]

    return resultado
  } catch (err) {
    console.error("[v0] Error obteniendo progreso secuencia:", err)
    return resultado
  }
}

// ── Consultar feedback de registros de cierre ──────────────────────────────
async function obtenerFeedbackCierres(): Promise<{
  ultimosCierres: Array<{
    eje: string
    actividadALBA: string
    actividadDocente: string
    promedio: number
    efectiva: boolean
    sugerenciaDocente: string | null
  }>
  actividadesEfectivas: Record<string, string[]>
  actividadesEvitar: Record<string, string[]>
  sugerenciasDocentes: string[]
}> {
  const resultado = {
    ultimosCierres: [] as Array<{
      eje: string
      actividadALBA: string
      actividadDocente: string
      promedio: number
      efectiva: boolean
      sugerenciaDocente: string | null
    }>,
    actividadesEfectivas: { CF: [] as string[], CT: [] as string[], O: [] as string[] },
    actividadesEvitar: { CF: [] as string[], CT: [] as string[], O: [] as string[] },
    sugerenciasDocentes: [] as string[],
  }

  if (!supabase) return resultado

  try {
    const { data, error } = await supabase
      .from("registros_cierre")
      .select("*")
      .order("fecha", { ascending: false })
      .limit(20)

    if (error || !data) return resultado

    data.forEach((cierre: {
      eje: string
      actividad_alba: string
      actividad_docente: string
      promedio_logro: number
      actividad_efectiva: boolean
      sugerencia_ia: string | null
    }) => {
      resultado.ultimosCierres.push({
        eje: cierre.eje,
        actividadALBA: cierre.actividad_alba,
        actividadDocente: cierre.actividad_docente,
        promedio: cierre.promedio_logro,
        efectiva: cierre.actividad_efectiva,
        sugerenciaDocente: cierre.sugerencia_ia,
      })

      // Clasificar actividades
      if (cierre.actividad_efectiva && cierre.promedio_logro >= 60) {
        const ejeKey = cierre.eje as "CF" | "CT" | "O"
        if (!resultado.actividadesEfectivas[ejeKey].includes(cierre.actividad_docente)) {
          resultado.actividadesEfectivas[ejeKey].push(cierre.actividad_docente)
        }
      } else if (cierre.promedio_logro < 40) {
        const ejeKey = cierre.eje as "CF" | "CT" | "O"
        if (!resultado.actividadesEvitar[ejeKey].includes(cierre.actividad_docente)) {
          resultado.actividadesEvitar[ejeKey].push(cierre.actividad_docente)
        }
      }

      // Recopilar sugerencias del docente
      if (cierre.sugerencia_ia) {
        resultado.sugerenciasDocentes.push(cierre.sugerencia_ia)
      }
    })

    return resultado
  } catch (err) {
    console.error("[v0] Error obteniendo feedback de cierres:", err)
    return resultado
  }
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
  razonIA?: string | null,
  edad: number = 5
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
  
  // Si es sala de 4 anos, buscar adaptacion especial
  let tituloFinal = actividad.titulo
  let objetivoFinal = actividad.objetivo
  
  if (edad === 4) {
    const adaptacion = ADAPTACIONES_4_ANOS[eje]?.[semanaObjetivo]
    if (adaptacion) {
      tituloFinal = `${adaptacion.titulo} (4 anos)`
      objetivoFinal = adaptacion.objetivo
    } else {
      // Agregar indicador de adaptacion requerida
      tituloFinal = `${actividad.titulo} (adaptar para 4 anos)`
    }
  }
  
  return {
  id: `${eje}-sem${semanaObjetivo}`,
  dia: semanaObjetivo,
  semana: semanaObjetivo,
  titulo: tituloFinal,
  descripcion: generarDescripcionActividad(eje, semanaObjetivo, edad),
  objetivo: objetivoFinal,
  materiales: actividad.materiales || [],
  source: razonIA ? "alba-ia" : "secuencia",
  ejeRecomendado: eje,
  razon: razonIA || razon,
  }
  }

// ── POST: Analisis inteligente basado en promedio de la sala ───────────────
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { ejeActual, actividadActual = "", stats = { green: 0, yellow: 0, red: 0 }, sala = "Girasoles" } = body

    // Obtener configuracion de la sala (edad y secuencia de ejes)
    const salaConfig = getSalaConfig(sala)
    
    // Obtener progreso REAL de la secuencia basado en registros de cierre DE ESTA SALA
    const progreso = await obtenerProgresoSecuencia(sala)
    
    // NUEVO: Analisis inteligente de la sala
    const analisisSala = await analizarSala(sala)
    
    // Obtener feedback de cierres anteriores para retroalimentar sugerencias
    const feedbackCierres = await obtenerFeedbackCierres()
    
    // INTELIGENCIA: Decidir eje basado en analisis
    // Si la sala tiene un eje muy debil, priorizarlo cada 2 clases
    let ejeParaActividad = progreso.ejeParaHoy
    
    // Si hay un eje debil y el rendimiento es muy bajo, intervenir
    if (analisisSala.necesitaRefuerzo && analisisSala.ejeDebil) {
      // Cada 2 clases, insertar refuerzo del eje debil
      if (progreso.totalClasesCompletadas % 2 === 1) {
        ejeParaActividad = analisisSala.ejeDebil as "CF" | "CT" | "O"
      }
    }
    
    // Obtener historial de evaluaciones DE ESTA SALA
    const historial = await obtenerHistorialSeguimiento(sala)
    const datosEje = historial.porEje[ejeParaActividad as "CF" | "CT" | "O"]
    const promedioHistorico = datosEje?.promedio || 0
    const tendencia = historial.tendencia[ejeParaActividad]

    // La semana REAL viene del progreso de registros de cierre
    const semanaReal = progreso.semanaActual

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

    // Logica de decision basada en evaluacion del docente
    if (promedioCombinado >= 70 && tendencia !== "bajando") {
      decision = "avanzar"
    } else if (promedioCombinado < 40 || tendencia === "bajando") {
      decision = "reforzar"
    } else {
      decision = "repetir"
    }

    // Si hoy fue muy malo y el historico era bueno, solo repetir
    if (totalHoy > 0 && promedioHoy < 30 && promedioHistorico >= 70) {
      decision = "repetir"
    }

    // Para la primera vez o si no hay registros de cierre, siempre empezar con la actividad de la semana
    if (progreso.totalClasesCompletadas === 0) {
      decision = "repetir" // Mantener en semana 1
    }

    // Verificar si la actividad del docente coincide con la secuencia
    const secuencia = SECUENCIA_CURRICULAR[ejeParaActividad as "CF" | "CT" | "O"]
    
    let actividadFueExitosa = false
    let mensajeActividad = ""
    
    if (actividadActual && totalHoy > 0) {
      if (promedioHoy >= 70) {
        actividadFueExitosa = true
        mensajeActividad = `Excelentes resultados (${promedioHoy}% logro). `
      } else if (promedioHoy >= 50) {
        mensajeActividad = `Resultados moderados (${promedioHoy}%). Considera repetir. `
      } else {
        mensajeActividad = `Se necesita refuerzo (${promedioHoy}%). `
      }
    }

    // Generar sugerencia con IA
    const sugerenciaIA = await generarSugerenciaConIA(historial, ejeParaActividad, stats)
    
    // Construir razon con informacion de la clase semanal y feedback
    const infoClaseSemanal = `Semana ${semanaReal}/25. `
    
    // Incluir feedback del ultimo cierre si existe
    let feedbackUltimoCierre = ""
    const ultimoCierreEje = feedbackCierres.ultimosCierres.find(c => c.eje === ejeParaActividad)
    if (ultimoCierreEje) {
      if (ultimoCierreEje.efectiva) {
        feedbackUltimoCierre = `Ultima actividad efectiva (${ultimoCierreEje.promedio}%). `
      } else {
        feedbackUltimoCierre = `Se ajusta segun retroalimentacion anterior. `
      }
    }
    
    // Incluir si hay actividades efectivas probadas
    const actividadesEfectivas = feedbackCierres.actividadesEfectivas[ejeParaActividad as "CF" | "CT" | "O"] || []
    let infoActividadesEfectivas = ""
    if (actividadesEfectivas.length > 0) {
      infoActividadesEfectivas = `Actividades probadas: ${actividadesEfectivas.slice(0, 2).join(", ")}. `
    }
    
    // Incluir analisis inteligente de la sala
    let infoAnalisisSala = ""
    if (analisisSala.recomendacionEspecial) {
      infoAnalisisSala = analisisSala.recomendacionEspecial + " "
    } else if (analisisSala.nivelGeneral === "avanzado") {
      infoAnalisisSala = "Sala con buen rendimiento general. "
    } else if (analisisSala.nivelGeneral === "inicial") {
      infoAnalisisSala = "Sala requiere actividades mas concretas y ludicas. "
    }
    
    // Indicar si es sala de 4 anos
    const infoEdad = salaConfig.edad === 4 ? "[Sala 4 anos - actividades adaptadas] " : ""
    
    const razonFinal = infoEdad + infoClaseSemanal + infoAnalisisSala + feedbackUltimoCierre + (mensajeActividad || "") + infoActividadesEfectivas + (sugerenciaIA || "")

    // Generar actividad basada en la secuencia curricular (con edad para adaptaciones)
    const activity = generarActividadSecuencia(ejeParaActividad, semanaReal, decision, razonFinal || undefined, salaConfig.edad)

    // Agregar info de clase semanal, sala y analisis a la actividad
    const activityConInfo = {
      ...activity,
      claseNumero: progreso.totalClasesCompletadas + 1,
      claseDeLaSemana: progreso.claseDeLaSemana,
      sala,
      edadSala: salaConfig.edad,
      secuenciaEjes: salaConfig.secuenciaEjes,
      descripcionSala: salaConfig.descripcion,
      ejeRecomendado: ejeParaActividad, // Puede ser diferente si hay refuerzo
      // Datos de inteligencia de ALBA
      analisisSala: {
        nivelGeneral: analisisSala.nivelGeneral,
        ejeDebil: analisisSala.ejeDebil,
        ejeFuerte: analisisSala.ejeFuerte,
        necesitaRefuerzo: analisisSala.necesitaRefuerzo,
        actividadesExitosas: analisisSala.actividadesExitosas.slice(0, 3),
        actividadesEvitar: analisisSala.actividadesEvitar.slice(0, 3),
      },
    }

    return NextResponse.json({ 
      activity: activityConInfo,
      progreso: {
        semanaActual: semanaReal,
        claseDeLaSemana: progreso.claseDeLaSemana,
        totalClasesCompletadas: progreso.totalClasesCompletadas,
        ejeParaHoy: progreso.ejeParaHoy,
        clasesCompletadasPorEje: progreso.clasesCompletadasPorEje,
      },
      historial: {
        tendencia,
        totalRegistros: historial.totalRegistros,
        promedioHistorico,
        promedioHoy,
        promedioCombinado,
        decision,
        actividadDocente: actividadActual,
        actividadFueExitosa,
      },
      feedback: {
        ultimoCierre: ultimoCierreEje || null,
        actividadesEfectivas: feedbackCierres.actividadesEfectivas[ejeParaActividad as "CF" | "CT" | "O"] || [],
        sugerenciasDocentes: feedbackCierres.sugerenciasDocentes.slice(0, 3),
      }
    })
  } catch (err) {
    console.error("[v0] Error in brain POST:", err)
    return NextResponse.json({ 
      activity: generarActividadSecuencia("CF", 1, "repetir"),
    })
  }
}

// ── GET: Actividad por defecto basada en progreso real ─────────────────────
export async function GET(request: Request) {
  try {
    // Obtener sala del query param
    const { searchParams } = new URL(request.url)
    const sala = searchParams.get("sala") || "Girasoles"
    
    // Obtener configuracion de la sala (edad y secuencia)
    const salaConfig = getSalaConfig(sala)
    
    // Obtener progreso REAL de la secuencia PARA ESTA SALA
    const progreso = await obtenerProgresoSecuencia(sala)
    const historial = await obtenerHistorialSeguimiento(sala)
    
    // Analisis inteligente de la sala
    const analisisSala = await analizarSala(sala)
    
    // Analizar promedios de todos los ejes
    const promediosPorEje = {
      CF: historial.porEje.CF.promedio,
      CT: historial.porEje.CT.promedio,
      O: historial.porEje.O.promedio,
    }
    
    // Encontrar el eje con menor promedio (necesita mas trabajo)
    let ejeRecomendado = progreso.ejeParaHoy
    let menorPromedio = 100
    let hayDatosEvaluados = false
    
    Object.entries(promediosPorEje).forEach(([eje, promedio]) => {
      if (promedio > 0) {
        hayDatosEvaluados = true
        if (promedio < menorPromedio) {
          menorPromedio = promedio
          if (promedio < 50) {
            ejeRecomendado = eje // Priorizar eje con bajo promedio
          }
        }
      }
    })
    
    // Si no hay datos evaluados, rotar normalmente CF -> CT -> O
    if (!hayDatosEvaluados) {
      ejeRecomendado = progreso.ejeParaHoy
    }
    
    // Calcular semana para el eje recomendado
    const clasesDelEje = progreso.clasesCompletadasPorEje[ejeRecomendado] || 0
    const semanaDelEje = Math.min(25, clasesDelEje + 1)
    
    // Generar actividad para el eje recomendado
    const nombreEje = ejeRecomendado === "CF" ? "Conciencia Fonologica" : 
                      ejeRecomendado === "CT" ? "Conocimiento del Texto" : "Oralidad"
    
    let razon = salaConfig.edad === 4 ? `[Sala 4 anos] ` : ""
    razon += `${nombreEje} - Semana ${semanaDelEje}/25. `
    if (menorPromedio < 50 && menorPromedio > 0 && ejeRecomendado !== progreso.ejeParaHoy) {
      razon += `ALBA prioriza este eje por tener promedio bajo (${menorPromedio}%). `
    }
    
    const activity = generarActividadSecuencia(ejeRecomendado, semanaDelEje, "repetir", razon, salaConfig.edad)
    
    // Agregar info de progreso, sala y analisis
    const activityConInfo = {
      ...activity,
      claseNumero: progreso.totalClasesCompletadas + 1,
      claseDeLaSemana: progreso.claseDeLaSemana,
      ejeRecomendado: ejeRecomendado,
      sala,
      edadSala: salaConfig.edad,
      secuenciaEjes: salaConfig.secuenciaEjes,
      descripcionSala: salaConfig.descripcion,
      // Datos de inteligencia
      analisisSala: {
        nivelGeneral: analisisSala.nivelGeneral,
        ejeDebil: analisisSala.ejeDebil,
        ejeFuerte: analisisSala.ejeFuerte,
        necesitaRefuerzo: analisisSala.necesitaRefuerzo,
      },
    }

    return NextResponse.json({ 
      activity: activityConInfo,
      progreso: {
        semanaActual: semanaDelEje,
        claseDeLaSemana: progreso.claseDeLaSemana,
        totalClasesCompletadas: progreso.totalClasesCompletadas,
        ejeParaHoy: ejeRecomendado,
        ejeRotacion: progreso.ejeParaHoy,
        clasesCompletadasPorEje: progreso.clasesCompletadasPorEje,
      },
      historial: {
        totalRegistros: historial.totalRegistros,
        promediosPorEje,
      }
    })
  } catch (err) {
    console.error("[v0] Error in brain GET:", err)
    return NextResponse.json({ 
      activity: generarActividadSecuencia("CF", 1, "repetir"),
    })
  }
}
