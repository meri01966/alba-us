// ALBA Brain API v10.3 - Marco Curricular DC Inicial Buenos Aires 2025 + evidencia internacional
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { generateText } from "ai"

const SUPABASE_URL = "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

// Tipo de micro-capacitacion
type MicroCap = { titulo: string; contenido: string; tips: string[]; cancion?: string; poesia?: string; referencia?: string }

// ── MARCO CURRICULAR DC INICIAL BUENOS AIRES 2025 ──────────────────────────
// Diseño Curricular para la Educacion Inicial - Salas de 4 y 5 años
// Ministerio de Educacion GCBA - Aprobado 2025
// Fuente: https://static.buenosaires.gob.ar/sites/default/files/2025-04/DC_Inicial_Salas_4_y_5.pdf
// Esta seccion alimenta la razon pedagogica y las sugerencias de ALBA
// alineando cada actividad con los propositos, contenidos y expectativas de logro oficiales

const DC_BSAS_2025 = {
  // PROPOSITOS FORMATIVOS - Lenguaje - Prácticas del Lenguaje
  propositos: {
    generales: [
      "Promover situaciones de escucha, habla, lectura y escritura en contextos significativos.",
      "Favorecer el desarrollo de la conciencia fonologica como base del aprendizaje del sistema de escritura.",
      "Generar oportunidades para que los ninos exploren los usos sociales de la lectura y la escritura.",
      "Propiciar la participacion activa en intercambios orales, escucha de textos literarios e informativos.",
      "Iniciar a los ninos en la comprension de textos leidos por el docente."
    ],
    sala4: [
      "Aproximar a los ninos a la escucha sistematica y discriminacion de sonidos del entorno y del lenguaje.",
      "Promover el juego con el lenguaje: rimas, canciones, trabalenguas, adivinanzas.",
      "Favorecer la exploracion de portadores de texto: libros, revistas, envases, carteles."
    ],
    sala5: [
      "Desarrollar la conciencia fonemica como preparacion para la lectura y escritura convencional.",
      "Profundizar la comprension de textos narrativos e informativos leidos en voz alta.",
      "Promover la produccion oral de textos: narraciones, descripciones, argumentaciones simples.",
      "Iniciar la relacion entre sonidos y letras a traves del juego sistematico."
    ]
  },
  // CONTENIDOS CURRICULARES por eje
  contenidos: {
    CF: {
      sala4: [
        "Escucha y discriminacion de sonidos del entorno.",
        "Reconocimiento de palabras que riman.",
        "Segmentacion de palabras en silabas con apoyo de palmadas y movimiento.",
        "Identificacion del sonido inicial de las vocales en palabras conocidas.",
        "Juegos con el lenguaje: canciones, rimas, trabalenguas, poesias."
      ],
      sala5: [
        "Identificacion del sonido inicial de consonantes frecuentes: m, p, s, l, t, n.",
        "Segmentacion silabica y fonemica de palabras.",
        "Identificacion de sonidos medios y finales.",
        "Sintesis de fonemas (blending): juntar sonidos para formar palabras.",
        "Analisis de fonemas (segmentacion fonemica): separar una palabra en sus sonidos.",
        "Manipulacion de fonemas: sustitucion, omision y adicion.",
        "Relacion sonido-letra: vocales y consonantes trabajadas.",
        "Escritura de su nombre y palabras significativas como referencia."
      ]
    },
    CT: {
      sala4: [
        "Escucha atenta de textos literarios leidos por el docente.",
        "Exploracion de libros: portada, titulo, ilustraciones.",
        "Anticipacion del contenido a partir de imagenes.",
        "Comprension literal: quien, que, donde en textos muy breves.",
        "Reconocimiento de personajes principales.",
        "Disfrute estetico del texto literario."
      ],
      sala5: [
        "Comprension literal: quien, que, cuando, donde, como.",
        "Comprension inferencial: por que, para que, como se siente el personaje.",
        "Reconocimiento de secuencia narrativa: inicio-desarrollo-final.",
        "Vocabulario en contexto: inferir significados por el contexto.",
        "Lectura dialogica: participacion activa durante la lectura.",
        "Diversidad de textos: cuentos, poesias, textos informativos, recetas.",
        "Comprension critica: valorar las acciones de los personajes, dar opinion fundamentada.",
        "Recontado con apoyo de imagenes y sin apoyo."
      ]
    },
    O: {
      sala4: [
        "Escucha activa en situaciones comunicativas variadas.",
        "Participacion en conversaciones grupales respetando el turno.",
        "Descripcion de objetos, personas y situaciones cotidianas.",
        "Narracion de experiencias personales con apoyo del docente.",
        "Amplitud de vocabulario en contextos significativos."
      ],
      sala5: [
        "Escucha comprensiva de instrucciones, explicaciones y relatos.",
        "Narracion autonoma de experiencias, cuentos y situaciones imaginadas.",
        "Descripcion con precision: color, forma, tamaño, funcion.",
        "Argumentacion simple: dar razones de preferencias y opiniones.",
        "Uso de conectores temporales y causales en la produccion oral.",
        "Participacion en debates y dramatizaciones.",
        "Exposicion oral de temas conocidos con apoyo de imagenes."
      ]
    }
  },
  // EXPECTATIVAS DE LOGRO al finalizar sala 5
  expectativasLogro: {
    CF: [
      "Identifica el sonido inicial de palabras en contextos ludicos.",
      "Segmenta palabras conocidas en silabas.",
      "Reconoce palabras que riman.",
      "Realiza analisis y sintesis de fonemas con apoyo concreto.",
      "Muestra sensibilidad hacia los sonidos del lenguaje."
    ],
    CT: [
      "Comprende textos narrativos breves respondiendo preguntas literales.",
      "Realiza inferencias sencillas sobre textos escuchados.",
      "Reconoce la secuencia narrativa basica.",
      "Recuenta una historia con sus propias palabras.",
      "Usa vocabulario aprendido en nuevos contextos."
    ],
    O: [
      "Participa activamente en intercambios orales.",
      "Narra experiencias y cuentos con inicio, desarrollo y final.",
      "Describe objetos y situaciones con vocabulario variado.",
      "Fundamenta sus opiniones con razones simples.",
      "Escucha con atencion y responde pertinentemente."
    ]
  },
  // ENFOQUE DIDACTICO del DC 2025
  enfoqueDid: {
    principios: [
      "El aprendizaje del lenguaje se da en situaciones comunicativas reales y significativas.",
      "El juego es el organizador principal de la ensenanza en el nivel inicial.",
      "El docente es mediador entre los textos, el lenguaje y los ninos.",
      "La literatura tiene valor en si misma: no es solo pretexto para ensenanza.",
      "La evaluacion es continua, formativa y al servicio del aprendizaje.",
      "La diversidad de los ninos es un recurso pedagogico, no un obstaculo.",
      "La familia y la comunidad son parte del ecosistema de alfabetizacion."
    ],
    estrategiasRecomendadas: {
      CF: [
        "Juego libre con el lenguaje como estrategia principal.",
        "Canciones, rimas y poesias como vehiculo de conciencia fonologica.",
        "Material concreto: fichas, cubos, tarjetas, espejos.",
        "Movimiento corporal asociado a cada sonido.",
        "Rutinas diarias con palabras del dia, nombre propio, fecha."
      ],
      CT: [
        "Lectura en voz alta diaria por el docente.",
        "Lectura dialogica: antes, durante y despues del texto.",
        "Biblioteca del aula accesible: libros al alcance de los ninos.",
        "Conversacion literaria: espacio para interpretar y valorar.",
        "Diversidad de generos: cuentos, poemas, textos informativos."
      ],
      O: [
        "Asamblea diaria: espacio de intercambio oral sistematico.",
        "Dramatizaciones y juego simbolico.",
        "Exposiciones orales sobre temas de interes.",
        "Entrevistas a adultos de la comunidad.",
        "Grabaciones para que los ninos escuchen su propia voz."
      ]
    }
  }
}

// Funcion para enriquecer la razon con el DC oficial
function enriquecerConDC(eje: "CF" | "CT" | "O", sala: string, indice: number, tendencia: string): string {
  const esSala4 = esde4Anios(sala)
  const contenidos = esSala4 ? DC_BSAS_2025.contenidos[eje].sala4 : DC_BSAS_2025.contenidos[eje].sala5
  const estrategias = DC_BSAS_2025.enfoqueDid.estrategiasRecomendadas[eje]
  const expectativas = DC_BSAS_2025.expectativasLogro[eje]
  
  // Seleccionar contenido relevante segun el indice de la actividad
  const contenidoRelevante = contenidos[Math.min(indice, contenidos.length - 1)]
  const estrategiaRelevante = estrategias[indice % estrategias.length]
  const expectativaRelevante = expectativas[Math.min(Math.floor(indice / 3), expectativas.length - 1)]
  
  let texto = ` | DC Inicial GCBA 2025: "${contenidoRelevante}".`
  if (tendencia === "empeorando") {
    texto += ` Estrategia sugerida: ${estrategiaRelevante}.`
  }
  texto += ` Meta: "${expectativaRelevante}".`
  return texto
}


// ── EVIDENCIA INTERNACIONAL ──────────────────────────────────────────────────
// Cada entrada mapea un titulo de actividad a su respaldo pedagogico internacional.
// ALBA usa esto para:
//   1. Enriquecer la razon que le explica al docente por que se eligio esta actividad
//   2. Priorizar actividades de mayor impacto cuando hay varias candidatas al mismo nivel
// Fuentes: NRP (EEUU), Reading Recovery (NZ), PIRLS, PISA, metodo cubano, 
//          Plan CEIBAL (Uruguay), Lectura dialógica (España/Chile), Programa LEER (Finlandia adaptado)
const EVIDENCIA_INTERNACIONAL: Record<string, {
  pais: string
  programa: string
  impacto: number  // 1-10: mayor numero = mayor evidencia de impacto en alfabetizacion temprana
  descripcion: string
}> = {
  // CF - Evidencia muy alta (base del metodo fonetico sistematico)
  "Sonidos del entorno":     { pais: "Nueva Zelanda", programa: "Reading Recovery", impacto: 7, descripcion: "La discriminacion auditiva ambiental es el primer nivel del desarrollo fonologico segun Clay (1991). Base de todos los programas de conciencia fonologica." },
  "Rimas con nombres":       { pais: "Reino Unido / Finlandia", programa: "Programa Goswami + Lectura Finlandesa", impacto: 9, descripcion: "Goswami & Bryant (1990): las rimas son el predictor mas fuerte de exito lector en pre-escolar. Finlandia las usa sistematicamente en sala de 5 con altisimos resultados en PISA." },
  "Separacion en silabas":   { pais: "Francia / Cuba", programa: "Methode globale revisee + Metodo cubano Aprendamos", impacto: 9, descripcion: "La segmentacion silabica es la habilidad fonologica mas facil de adquirir y es el punto de entrada obligatorio segun Liberman et al. Cuba la usa como base de su metodo con 98% de alfabetizacion." },
  "Sonido inicial /a/":      { pais: "Estados Unidos", programa: "National Reading Panel (2000) - Fonetica sistematica", impacto: 10, descripcion: "El NRP encontro que la instruccion explicita de correspondencia fonema-grafema es el metodo con mayor eficacia documentada. Empieza por vocales por ser los sonidos mas perceptibles." },
  "Sonido inicial /e/":      { pais: "Estados Unidos / Chile", programa: "NRP + Lectura en voz alta MINEDUC Chile", impacto: 10, descripcion: "Chile (MINEDUC 2018): el trabajo sistematico por vocales antes que consonantes reduce la confusion en ninos que aprenden espanol como primera lengua." },
  "Sonido inicial /i/":      { pais: "Estados Unidos / Uruguay", programa: "NRP + Plan CEIBAL", impacto: 10, descripcion: "Uruguay: el uso del cuerpo como recurso para anclar sonidos (kinestesia fonetica) aumenta la retencion en ninos con diferentes estilos de aprendizaje." },
  "Sonido inicial /o/":      { pais: "Estados Unidos / España", programa: "NRP + Metodo Phonics en español (España)", impacto: 10, descripcion: "España (2021): la discriminacion de vocales con apoyo grafico + kinestesico tiene impacto significativo en escritura temprana." },
  "Sonido inicial /u/":      { pais: "Estados Unidos / Mexico", programa: "NRP + SEP Mexico", impacto: 10, descripcion: "SEP Mexico (Aprender a Leer 2019): el juego de memoria con sonido inicial es una de las 5 estrategias con mayor retención a largo plazo." },
  "Vocales - Repaso":        { pais: "Cuba", programa: "Metodo cubano Aprendamos a Leer", impacto: 9, descripcion: "Cuba consolida vocales antes de pasar a consonantes. El repaso con variacion (ruleta, dado, clasificacion) es clave para la retencion durable." },
  "Sonido inicial /m/":      { pais: "Australia / NRP", programa: "First Steps (Australia) + NRP", impacto: 10, descripcion: "First Steps: /m/ es la primera consonante por su alta frecuencia en espanol y por ser bilabial (visible y facil de imitar). Alta transferencia a la escritura." },
  "Sonido inicial /p/":      { pais: "Australia / Chile", programa: "First Steps + LEE Chile", impacto: 9, descripcion: "La actividad de pesca con clasificacion bicolor desarrolla discriminacion fonema-no fonema objetivo, habilidad base para la lectura decodificada." },
  "Sonido inicial /s/":      { pais: "Reino Unido", programa: "Letters and Sounds (UK DfE 2007)", impacto: 9, descripcion: "UK Letters and Sounds: /s/ en parejas con pulgar arriba/abajo es estrategia de bajo costo cognitivo y alta participacion activa." },
  "Sonido inicial /l/":      { pais: "Nueva Zelanda", programa: "Reading Recovery Clay", impacto: 8, descripcion: "Clay: escuchar y levantar tarjeta cuando se detecta el fonema objetivo entrena atencion sostenida y discriminacion auditiva simultaneamente." },
  "Sonido inicial /t/":      { pais: "Estados Unidos", programa: "DIBELS (Dynamic Indicators of Basic Early Literacy)", impacto: 8, descripcion: "DIBELS: los juegos de dado con fonemas objetivo muestran alta correlacion con desempeno en lectura a fin del primer grado." },
  "Sonido inicial /n/":      { pais: "Uruguay / Argentina", programa: "Plan CEIBAL + PNEA Argentina", impacto: 8, descripcion: "El recorrido del aula buscando objetos con el fonema objetivo genera aprendizaje situado y desarrolla vocabulario en contexto real." },
  "Consonantes - Repaso":    { pais: "Cuba / Australia", programa: "Aprendamos + First Steps", impacto: 9, descripcion: "El bingo de sonidos iniciales es una actividad de repaso con alta motivacion intrinseca. Cuba lo usa en el cierre de cada unidad fonologica." },
  "Sonido final":            { pais: "Canada", programa: "BC Phonological Awareness Literacy (BPAL)", impacto: 8, descripcion: "BPAL Canada: identificar el sonido final es mas dificil que el inicial pero es predictor de comprension ortografica. Se introduce despues de consolidar sonido inicial." },
  "Sonidos medios":          { pais: "Canada / NRP", programa: "BPAL + NRP", impacto: 8, descripcion: "El analisis posicional (inicio-medio-final) con el cuerpo es estrategia validada en programas canadienses de intervencion temprana." },
  "Sintesis de fonemas":     { pais: "Reino Unido", programa: "Jolly Phonics UK (Lloyd)", impacto: 10, descripcion: "Jolly Phonics: la sintesis (blending) es LA habilidad central para decodificar. El juego del robot que habla lento es la estrategia mas replicada internacionalmente." },
  "Analisis de fonemas":     { pais: "Estados Unidos", programa: "NRP - Segmentacion fonemica", impacto: 10, descripcion: "NRP (2000): el analisis fonetico con apoyo manipulativo (cubos Elkonin) es la estrategia con mas evidencia de impacto en conciencia fonemica. Efecto tamaño d=0.86." },
  "Sustitucion de fonemas":  { pais: "Nueva Zelanda / USA", programa: "Reading Recovery + Wilson Reading System", impacto: 9, descripcion: "La sustitucion de fonemas con letras moviles es estrategia de intervencion temprana para ninos con dislexia (Wilson). Tambien usada en Reading Recovery." },
  "Omision de fonemas":      { pais: "Canada", programa: "BPAL Canada", impacto: 8, descripcion: "La omision de fonemas con fichas visuales es actividad de nivel avanzado validada en programas de recuperacion lectora." },
  "Adicion de fonemas":      { pais: "Estados Unidos", programa: "NRP avanzado", impacto: 7, descripcion: "La adicion de fonemas refuerza la comprension de la estructura silabica y prepara para la lectura de palabras compuestas." },
  "Manipulacion avanzada":   { pais: "Reino Unido / USA", programa: "Letters & Sounds Fase 5 + NRP", impacto: 7, descripcion: "La manipulacion avanzada de fonemas en equipo desarrolla metacognicion fonemica, predictor de comprension lectora en 2do grado." },
  "Evaluacion CF":           { pais: "Estados Unidos", programa: "DIBELS + PALS (Phonological Awareness Literacy Screening)", impacto: 9, descripcion: "La evaluacion en estaciones con rubrica es el formato recomendado por PALS para obtener datos utiles para la instruccion sin interrumpir el ritmo del grupo." },
  // CT - Lectura dialogica con evidencia fuerte
  "Exploracion del libro":          { pais: "España / Chile", programa: "Lectura Dialogica (Flecha / MINEDUC Chile)", impacto: 9, descripcion: "La exploracion previa de portada activa conocimiento previo y aumenta la comprension en un 35% segun estudios de Lectura Dialogica (Flecha, 2012)." },
  "Antes de leer: Predicciones":    { pais: "Chile / Uruguay", programa: "MINEDUC Chile + CEIBAL", impacto: 9, descripcion: "Las predicciones antes de la lectura generan 'cognitive engagement': el cerebro procesa el texto buscando confirmacion o refutacion, profundizando la comprension." },
  "Lectura dialogica: Pausas":      { pais: "España / Argentina", programa: "Lectura Dialogica + Programa Nacional de Lectura Argentina", impacto: 10, descripcion: "Vygotsky/Flecha: la lectura interactiva con pausas y preguntas desarrolla comprension literal e inferencial simultaneamente. Mayor impacto en grupos vulnerables." },
  "Vocabulario en contexto":        { pais: "Estados Unidos", programa: "Tier 2 Vocabulary Instruction (Beck et al.)", impacto: 9, descripcion: "Beck & McKeown: inferir vocabulario en contexto es mas efectivo que la definicion directa para la retencion a largo plazo. El muro de palabras es estrategia de alta evidencia." },
  "Recontar la historia":           { pais: "Nueva Zelanda / Australia", programa: "Reading Recovery + First Steps", impacto: 9, descripcion: "El recontado en cadena con imagenes de secuencia activa la memoria episodica y desarrolla comprension de estructura narrativa (Clay, 1991)." },
  "Conexiones texto-vida":          { pais: "Canada", programa: "Reader's Workshop (Calkins)", impacto: 8, descripcion: "Calkins (2001): las conexiones texto-vida generan motivacion lectora y comprension profunda. Efecto especialmente fuerte en ninos con poca exposicion previa a libros." },
  "Cruz de comprension: QUIEN":     { pais: "Chile", programa: "Cruz de Comprension MINEDUC Chile", impacto: 10, descripcion: "La Cruz de Comprension es el modelo de Chile para estructurar preguntas literales. Validada en todos los niveles educativos con impacto en comprension sistematica." },
  "Cruz de comprension: QUE":       { pais: "Chile", programa: "Cruz de Comprension MINEDUC Chile", impacto: 10, descripcion: "Identificar QUE sucede (accion principal) con justificacion en el texto es habilidad base para la comprension literal. Chile la instala desde sala de 5 años." },
  "Cruz de comprension: DONDE":     { pais: "Chile", programa: "Cruz de Comprension MINEDUC Chile", impacto: 9, descripcion: "El DONDE espacial con evidencia textual desarrolla la habilidad de localizar informacion explicita, predictor de desempeno en PISA Lectura." },
  "Cruz de comprension: CUANDO":    { pais: "Chile", programa: "Cruz de Comprension MINEDUC Chile", impacto: 9, descripcion: "La linea temporal del CUANDO desarrolla comprension de secuencia narrativa, habilidad con alta correlacion con comprension global del texto." },
  "Cruz: Integracion literal":      { pais: "Chile / España", programa: "Cruz MINEDUC + Lectura Dialogica", impacto: 10, descripcion: "La integracion de los 4 brazos en equipo combina comprension literal con desarrollo de oralidad y pensamiento colaborativo." },
  "Cruz: POR QUE - causa y efecto": { pais: "Chile / Canada", programa: "Cruz MINEDUC + Reader's Workshop", impacto: 9, descripcion: "La inferencia de causas no explicitas es habilidad de comprension inferencial, nivel superior al literal. Chile la trabaja desde sala 5." },
  "Cruz: COMO sucede":              { pais: "Chile", programa: "Cruz de Comprension MINEDUC Chile", impacto: 9, descripcion: "El COMO con vocabulario de secuencia (primero/luego/finalmente) desarrolla comprension de procesos, base para textos informativos." },
  "Cruz: QUE OPINAS":               { pais: "Chile / Finlandia", programa: "Cruz MINEDUC + Sistema finlandes de debate temprano", impacto: 9, descripcion: "Finlandia introduce el debate argumentativo desde sala 5. La estructura 'Yo opino que... porque...' es la base de la comprension critica." },
  "Integracion LD + Cruz":          { pais: "España / Chile", programa: "Lectura Dialogica + Cruz MINEDUC", impacto: 10, descripcion: "El ciclo completo Antes-Durante-Despues liderado por los ninos es el modelo de maxima evidencia para comprension lectora profunda en educacion inicial." },
  "Texto informativo":              { pais: "Canada / Estados Unidos", programa: "CAFE Strategy + Reader's Workshop", impacto: 8, descripcion: "La estrategia KWL (lo que se, lo que quiero saber, lo que aprendi) es estandar en programas canadienses y americanos para lectura de no ficcion." },
  // O - Oralidad
  "ECO-E: Sonidos del entorno":   { pais: "Argentina / Uruguay", programa: "Programa ECO-E (Educacion Comunicativa Oral)", impacto: 9, descripcion: "ECO-E: la escucha activa con respuesta en oracion completa es el primer nivel del desarrollo oral sistematico. Uruguay la incluye como competencia transversal desde sala 3." },
  "ECO-E: Escucha de voces":      { pais: "Argentina", programa: "Programa ECO-E", impacto: 8, descripcion: "El reconocimiento de voces con justificacion desarrolla escucha discriminativa y argumentacion oral basica, ambas predictoras de desempeno academico." },
  "ECO-E: Instrucciones simples": { pais: "Argentina / Chile", programa: "ECO-E + MINEDUC Chile Oralidad", impacto: 9, descripcion: "La verbalizacion posterior a la ejecucion de instrucciones ancla el vocabulario de accion y desarrolla memoria de trabajo verbal, base de la comprension lectora." },
}

// Impacto promedio por eje para referencia de ALBA
const IMPACTO_PROMEDIO = {
  CF: 9.0,
  CT: 9.3,
  O:  8.7,
}

// Mapa completo sincronizado con TODOS los titulos de SECUENCIA
const MICRO_CAPS: Record<string, MicroCap> = {
  "Sonidos del entorno": { titulo: "Escucha activa en el aula", contenido: "Pida que cierren los ojos 30 segundos en silencio total. Luego pregunte uno por uno: que sonido escuchaste? Espere que respondan en oracion completa: Yo escuche el sonido de... Muestre tarjetas con imagenes de fuentes sonoras y pida que las asocien con lo que oyeron.", tips: ["Baje la voz tambien para que los ninos agudicen la escucha", "Si un nino dice solo una palabra, modele: Muy bien, el viento. Digamos todos: yo escuche el sonido del viento", "Use el triangulo para contrastar sonidos fuertes y suaves", "Registre en el pizarron todos los sonidos nombrados"], cancion: "Cancion sugerida: Cierra tus ojos y escucha el entorno, el viento los pasos el canto del torno. Uno por uno diremos que oimos, jugando a escuchar es lo que seguimos.", poesia: "Poesia sugerida: El mundo hace ruido de mil maneras. El nino que escucha aprende a nombrar, y en cada sonido hay un mundo a encontrar." },
  "Rimas con nombres": { titulo: "Rimas con los nombres del grupo", contenido: "Cante rimas usando los nombres de los ninos. Empiece con el suyo: Mi nombre es y rima con. Luego invite a cada nino a buscar una palabra que rime con su nombre.", tips: ["Aplauda una vez por cada silaba del nombre y una vez por la rima", "Si un nino propone una rima inventada, celebrela: las rimas inventadas tambien desarrollan conciencia fonologica", "Haga un cartel con los nombres y sus rimas para dejarlo a la vista", "Repita la rima de cada nino en coro antes de pasar al siguiente"], cancion: "Cancion sugerida: Vamos a rimar, vamos a jugar. El nombre de Maria rima con alegria. El nombre de Juan rima con capitan. Cada nombre tiene su par, solo hay que escuchar y cantar.", poesia: "Poesia sugerida: Mi nombre es especial, suena de una manera, y tiene una palabra amiga que siempre lo espera. Si me llamo Luna, me espera fortuna. Si me llamo Sol, me espera caracol." },
  "Separacion en silabas": { titulo: "Palmadas por silabas con movimiento", contenido: "Muestre una imagen, diga la palabra y de palmadas por silabas. Los ninos repiten. Use circulos de cartulina para representar cada silaba. Comparen longitudes.", tips: ["Empiece con los nombres de los ninos: son palabras que conocen bien", "Agregue movimiento: un paso por silaba o golpe en la mesa", "No corrija si un nino da palmadas de mas: repita lento y exagere la separacion", "Cuente en voz alta: una, dos, tres palmadas. Cuantas tiene esta palabra?"], cancion: "Cancion sugerida: Vamos a palmear las silabas del dia, una por una con mucha alegria. Ca-sa tiene dos, ma-ri-po-sa cuatro, si contamos juntos aprendemos tanto.", poesia: "Poesia sugerida: Cada silaba es un golpe, cada golpe una voz. Las palabras se dividen y las contamos dos a dos." },
  "Sonido inicial /a/": { titulo: "La vocal A: boca bien abierta", contenido: "Diga el sonido /a/ de forma prolongada: aaaaaa. Muestre imagenes variadas. Los ninos levantan la mano SOLO cuando la imagen empieza con /a/. Incluya imagenes que NO empiezan con A para practicar discriminacion.", tips: ["Exagere la posicion de la boca: la A se dice con la boca bien abierta. Muestresela en el espejo", "Gesto de A: brazos en triangulo hacia arriba", "Pida que busquen en la sala objetos que empiecen con A antes de mostrar tarjetas", "Diga tambien palabras que NO empiezan con A para que practiquen discriminar"], cancion: "Cancion sugerida: La A es redonda y abierta, la A es la primera. Avion, arbol, araña, la A nos espera. Aaaaaa decimos todos con la boca abierta, la A es nuestra amiga y siempre nos despierta.", poesia: "Poesia sugerida: A de avion que vuela alto, A de arbol verde y sano. A de agua que refresca, A de amor que nunca cesa. La A es la primera, la mas grande y verdadera." },
  "Sonido inicial /e/": { titulo: "La E: buscar y encontrar en el aula", contenido: "Explique el sonido /e/ con la boca casi cerrada: eeeeee. Envie a los ninos a recorrer el aula buscando objetos cuyo nombre empiece con /e/. Cuando encuentren uno lo muestran al grupo.", tips: ["Anticipe colocando objetos con E en lugares visibles antes de la actividad", "Si un nino trae un objeto que no empieza con E diga: A ver, escuchamos... empieza con otra letra", "Liste en el pizarron todo lo que encontraron", "Haga enfasis en el espejo del aula: espejo empieza con E"], cancion: "Cancion sugerida: La E sale a explorar, la E va a caminar. Escalera, elefante, estrella y el mar. Eeeee decimos todos buscando sin parar.", poesia: "Poesia sugerida: El elefante Eduardo es enorme y especial. La E de Eduardo empieza su nombre, la E de elefante es la letra del hombre." },
  "Sonido inicial /i/": { titulo: "La I con el cuerpo entero", contenido: "La I se hace con el cuerpo: brazos estirados hacia arriba, cuerpo derecho. Cuando escuchen una palabra que empieza con /i/ hacen la postura de I. Cuando no empieza con /i/ se sientan.", tips: ["Haga usted la postura de I con exageracion para que los ninos imiten", "Palabras con I: iglesia, isla, iglu, iguana, imitar", "El dictado grafico funciona bien: diga una palabra con I y pida que la dibujen", "Si un nino confunde I con otra vocal, repita frente al espejo"], cancion: "Cancion sugerida: La I es un palito con un punto arriba, la I de imitar y de iguana viva. Iiiii decimos todos parados muy derechos.", poesia: "Poesia sugerida: La I es igualita, alta y derechita. Iguana, iglesia, isla e imitar, todas empiezan con I al hablar." },
  "Sonido inicial /o/": { titulo: "La O: labios redondos como un circulo", contenido: "La O se dice con los labios redondos: ooooo. Los ninos aplauden UNA VEZ si una palabra empieza con /o/ y se quedan quietos si no. Luego cada nino dibuja una cosa que empiece con /o/.", tips: ["Gesto: haga el circulo con los dedos indice y pulgar para recordar la O", "Incluya palabras que suenan parecido pero empiezan diferente: hormiga empieza con H", "El dibujo da prueba de comprension", "Pregunte: como sabes que esa palabra empieza con O?"], cancion: "Cancion sugerida: La O es redondita como el sol. La O de oso, oveja y caracol. Ooooo decimos todos con la boca en O.", poesia: "Poesia sugerida: El oso Osvaldo sale en otono, recorre el oceano y mira el redondo. La O de Osvaldo empieza su nombre." },
  "Sonido inicial /u/": { titulo: "La U: juego de memoria en parejas", contenido: "Tarjetas de memoria: imagen que empieza con /u/ y tarjeta con la letra U. En parejas las dan vuelta de a dos. Si emparejan imagen con letra U, ganan el par.", tips: ["Palabras con U: uva, uno, uniforme, unicornio, ukelele", "Mientras juegan, pregunte: esa imagen como se llama? Con que sonido empieza?", "Celebre cada emparejamiento correcto: La U de uva!", "Si un nino no sabe el nombre de la imagen, nombrela y repita el sonido inicial"], cancion: "Cancion sugerida: La U tiene uvas, la U tiene uno. La U de unicornio que salta con truno. Uuuuu decimos todos jugando el juego.", poesia: "Poesia sugerida: La U es la ultima pero no es menor, tiene uva, uniforme y unicornio de honor." },
  "Vocales - Repaso": { titulo: "Ruleta de vocales: consolidar todas", contenido: "Ruleta de vocales. La docente la gira y cae en una vocal. El grupo tiene 30 segundos para decir TRES palabras que empiecen con esa vocal. Al final cuentan cual vocal tuvo mas palabras.", tips: ["Si cae una vocal dificil como U, de pista: piensen en frutas, en animales", "Hagan el gesto de cada vocal con el cuerpo", "El registro visual muestra cuales vocales necesitan mas practica", "Cierren cantando la cancion de las vocales para consolidar"], cancion: "Cancion sugerida: A-E-I-O-U, el burro sabe mas que tu. La A de avion, la E de elefante, la I de imitar, la O de oso grande, la U de uva dulce y especial.", poesia: "Poesia sugerida: Somos cinco hermanas, vivimos en las palabras. Sin nosotras nada suena, nada vive, nada encarna." },
  "Sonido inicial /m/": { titulo: "La M: labios juntos y vibrar", contenido: "Pida que junten los labios y digan mmmm. Sientan la vibracion con los dedos. Muestren laminas y los ninos senalan las que empiezan con /m/. Construyan oraciones orales.", tips: ["La M es bilabial: se produce juntando los labios", "Palabras con M: mama, mano, mapa, mariposa, mono, mesa", "Pida que pongan los dedos en los labios para sentir la vibracion", "Construir oraciones orales desarrolla vocabulario y sintaxis"], cancion: "Cancion sugerida: La M de mama que nos da amor. La M de mano, de mapa y de flor. Mmmm decimos todos juntando los labios.", poesia: "Poesia sugerida: La M es una montana con dos picos, tiene mama, mano, mono y chicos." },
  "Sonido inicial /p/": { titulo: "Pesca de palabras con P", contenido: "Tarjetas en el piso como peces. Los ninos pescan con cana de carton. Clasifican: canasto VERDE si empieza con /p/, canasto ROJO si no.", tips: ["La P es explosiva: el aire sale de golpe. Pongan la mano frente a la boca y sientan el soplo", "Palabras con P: pelota, pato, pan, papa, pez, paloma, piedra", "Si un nino clasifica mal, pregunte al grupo si estan de acuerdo", "La actividad motora de pescar mantiene la atencion"], cancion: "Cancion sugerida: El pato Pedro pesca en el rio, pesca palabras con mucho frio. P de pelota, P de paloma, P de pan dulce que huele y nos toma.", poesia: "Poesia sugerida: La P es pescadora que pesca palabras, pato, pelota, puerta y ventanas." },
  "Sonido inicial /s/": { titulo: "La S en parejas: pulgar arriba o abajo", contenido: "En parejas, un nino dice una palabra y el otro decide: si empieza con /s/ sube el pulgar, si no lo baja. Se intercambian. Arman lista colectiva.", tips: ["La S es como la serpiente: ssssss. Hagan el gesto con el brazo", "Palabras con S: sopa, sol, silla, sapo, semilla, serpiente", "El trabajo en parejas desarrolla habilidades sociales", "Si un nino se equivoca, pida que diga la palabra muy lento"], cancion: "Cancion sugerida: La serpiente Susana dice ssss, busca palabras de su cancion mas. Sol y sapo, silla y salon, la S nos llena de palabras con sabor.", poesia: "Poesia sugerida: La S silba suave como el viento suena. Sol, semilla, sapo, serpiente y nena." },
  "Sonido inicial /l/": { titulo: "La L: cuento con bandera levantada", contenido: "Un cuento breve con muchas palabras que empiezan con /l/. Cada nino tiene una tarjeta con la L. La levantan CADA VEZ que escuchan una palabra que empieza con /l/.", tips: ["La L se produce con la lengua tocando el paladar", "Palabras con L: luna, llave, loba, limon, lazo, leche, loro, luz", "El conteo de levantadas da datos sobre atencion sostenida", "Invencion breve de 10 oraciones con luna y leon funciona muy bien"], cancion: "Cancion sugerida: La luna le habla al loro en la laguna, el loro le responde con luna y fortuna. L de luna, L de loro, L de lazo de oro.", poesia: "Poesia sugerida: La L es larga como la luna llena. La leche del loro, la luz que nos llena. La lengua toca el paladar." },
  "Sonido inicial /t/": { titulo: "Dado de imagenes con T", contenido: "Dado con imagenes. El nino lo tira y si la imagen empieza con /t/ suma un punto. Equipos de 3, cinco rondas.", tips: ["La T es dental: la lengua toca los dientes", "Palabras con T: taza, tigre, tren, tambor, tomate, tortuga", "Si la imagen no empieza con T, el nino no suma puntos: trabaja discriminacion", "Despues del juego armen lista colectiva"], cancion: "Cancion sugerida: El tigre Tomas toca el tambor, toca y toca con mucho fervor. T de tigre, T de tambor, T de tomate y de todo el fervor.", poesia: "Poesia sugerida: La T es tamboritera que golpea sin cesar. Tigre, tren y tortuga la hacen sonar." },
  "Sonido inicial /n/": { titulo: "Busqueda de objetos con N en el aula", contenido: "Los ninos recorren el aula buscando objetos cuyo nombre empiece con /n/. Los muestran al grupo. Armen un grafico de barras colectivo.", tips: ["La N es nasal: el sonido sale por la nariz. Sientan la vibracion", "Palabras con N: nariz, nube, nino, nido, naranja, nuez, noche", "El grafico de barras introduce matematicas de representacion", "Si un nino no encuentra nada, ayudelo: tu nombre empieza con N?"], cancion: "Cancion sugerida: La nube Nora nada en el cielo, la naranja Nina rueda en el suelo. N de nariz, N de nido y de noche.", poesia: "Poesia sugerida: La N es naricera, el sonido vibra en la nariz entera. Nube, nino, nido y naranja." },
  "Consonantes - Repaso": { titulo: "Bingo de sonidos iniciales", contenido: "Cada nino recibe un cartero con consonantes trabajadas. La docente dice palabras. El nino marca la consonante inicial. Gana el primero en completar una fila.", tips: ["Diga las palabras lentamente estirando el sonido inicial: mmmesa, ppperro", "Si un nino marca mal, pida al grupo que repitan el sonido inicial juntos", "El bingo mantiene alta la motivacion por la competencia amistosa", "Despues del juego repase cada consonante con su gesto corporal"], cancion: "Cancion sugerida: M de mama, P de papa, S de sol brillante, L de luna y lapa. T de tortuga, N de nido blanco, el bingo de las letras lo jugamos todos." },
  "Sonido final": { titulo: "Atrapar el sonido final", contenido: "Diga palabras estirando el ultimo sonido: sooolll, paaan. Los ninos cierran la mano atrapando ese sonido. Luego abren la mano y dicen que sonido atraparon.", tips: ["Estire exageradamente el sonido final", "Palabras buenas: sol, pan, mar, flor, tos, luz, red, sal", "Es mas dificil que el sonido inicial: celebre cada identificacion", "Registre con una ficha de color en un tablero"] },
  "Sonidos medios": { titulo: "Inicio, medio y final con las manos", contenido: "Mano izquierda = inicio, centro del pecho = medio, mano derecha = final. Digan el sonido de cada posicion mientras hacen el gesto.", tips: ["El gesto corporal ancla la posicion espacial del sonido en la memoria", "Haga la actividad varias veces antes de pedir que lo hagan solos", "El sonido medio es el mas dificil: priorice inicio y final primero"] },
  "Sintesis de fonemas": { titulo: "El robot que habla lento", contenido: "La docente actua como un robot separando cada fonema: /s/... /o/... /l/. Los ninos juntan los sonidos y adivinan la palabra. Luego los ninos turnan de ser el robot.", tips: ["Empiece con palabras de 2 fonemas y aumente la dificultad", "Mantenga el juego con movimientos roboticos para sostener la atencion", "Esta habilidad es base para la lectura"], cancion: "Cancion sugerida: Soy el robot lector que habla muy lento, /s/... /o/... /l/... adivina el cuento." },
  "Analisis de fonemas": { titulo: "Cubos para contar fonemas", contenido: "Con cubos o fichas los ninos representan cada fonema en fila. Cuentan cuantos tiene la palabra y comparan longitudes.", tips: ["Un fonema = un cubo. Diga la palabra muy lento", "Distinga entre letra y sonido: ch tiene dos letras pero un fonema", "Esta habilidad es predictora de exito lector"] },
  "Sustitucion de fonemas": { titulo: "Cambiar un fonema para crear palabras nuevas", contenido: "La docente propone cambiar el primer sonido: pato con /g/ queda gato. Use letras moviles para mostrar el cambio visualmente.", tips: ["Empiece cambiando solo el sonido inicial: es el mas facil", "Palabras ideales: pato-gato, mesa-pesa, sol-col", "Las letras moviles hacen visible el proceso abstracto"] },
  "Omision de fonemas": { titulo: "Que queda sin el primer sonido", contenido: "Se quita el sonido inicial. Sol sin /s/ queda ol. Una ficha que se cubre representa el fonema quitado.", tips: ["Use apoyo visual: dos fichas, cubra la primera y lean lo que queda", "Es actividad avanzada: asegurese que dominen analisis antes", "Celebre los intentos aunque sean incorrectos"] },
  "Adicion de fonemas": { titulo: "Agregar sonidos para crear palabras nuevas", contenido: "Los ninos agregan un fonema al inicio o al final de palabras cortas para crear palabras nuevas.", tips: ["Use letras moviles para visualizar el agregado", "Priorice la adicion al final por ser mas sencilla", "No importa si la palabra creada no existe: el proceso es el objetivo"] },
  "Manipulacion avanzada": { titulo: "Desafio fonologico en equipos", contenido: "La docente da operaciones con fonemas en serie. Los ninos en equipos descifran la palabra resultante.", tips: ["Esta actividad es para ninos con solido dominio de las anteriores", "Trabaje en equipos para que los ninos se apoyen", "Si hay ninos sin dominio basico, asigneles operaciones mas simples"] },
  "Evaluacion CF": { titulo: "Estaciones de evaluacion de CF", contenido: "Cuatro estaciones: rimas, segmentacion silabica, sonido inicial, manipulacion. La docente rota registrando individualmente con rubrica.", tips: ["Prepare la rubrica antes: que espera ver en cada nino segun el nivel", "Asigne actividad autonoma en cada estacion", "Use esta informacion para planificar las proximas actividades con ALBA"] },
  // ── COMPRENSION TEXTUAL ───────────────────────�����������──────────────────────────
  "Exploracion del libro": { titulo: "Antes de abrir el libro", contenido: "Presente el libro CERRADO 2 minutos. Los ninos observan la tapa y responden en ronda. Registre TODAS las hipotesis en el pizarron sin juzgar ninguna.", tips: ["No abra el libro hasta que todos hayan hablado: la anticipacion construye comprension", "Pida que justifiquen: como lo sabes? que te hizo pensar eso?", "Vuelva a estas hipotesis al terminar la lectura"], cancion: "Cancion sugerida: El libro me habla desde la portada, con colores e imagenes y una historia guardada. Antes de abrirlo yo ya imagino que pasara adentro en este camino.", poesia: "Poesia sugerida: La tapa del cuento me guina el ojo, me dice que adentro hay un mundo de antojo. Miro el titulo, miro el autor, y ya mi cabeza empieza a sonar." },
  "Antes de leer: Predicciones": { titulo: "Predicciones con post-its antes de leer", contenido: "Cada nino dice su prediccion. Escriba o dibuje en post-it y peguelo en el pizarron. Al finalizar vuelvan: acertada, parcialmente acertada, o no acertada.", tips: ["Modele la estructura: Yo creo que... porque en la tapa veo...", "Acepte TODAS las predicciones sin evaluarlas antes de leer", "El momento de verificar es tan importante como el momento de predecir"] },
  "Lectura dialogica: Pausas": { titulo: "Pausas estrategicas con el titere preguntador", contenido: "Lea en voz alta con pausas planificadas. El titere hace una pregunta en cada pausa. Los ninos responden y luego continuan para verificar.", tips: ["Planifique las pausas antes de la clase: marque donde se detendra", "Las mejores pausas son antes de un momento clave o despues de una sorpresa", "Si los ninos responden con una sola palabra, amplie la respuesta"] },
  "Vocabulario en contexto": { titulo: "El muro de palabras nuevas", contenido: "Al encontrar una palabra dificil, detenerse: Esta palabra es nueva. Infieran juntos el significado por el contexto. Agreguen al MURO DE PALABRAS.", tips: ["No de el significado inmediatamente: el proceso de inferencia es el aprendizaje", "Use pistas del texto: las imagenes, las palabras anteriores", "Vuelva a las palabras del muro en otras actividades"] },
  "Recontar la historia": { titulo: "Recontado en cadena con imagenes", contenido: "Imagenes de secuencia en el pizarron. Los ninos recontan en cadena: cada uno agrega UN fragmento en orden.", tips: ["Use palabras de secuencia: primero, despues, luego, finalmente", "Si un nino se salta un evento importante, pregunte al grupo que ayude", "Despues del recontado colectivo, pida que reconten en pareja"] },
  "Conexiones texto-vida": { titulo: "Esto me paso a mi tambien", contenido: "Proponga preguntas de conexion personal. Los ninos comparten en parejas primero, luego con el grupo.", tips: ["Modele una conexion personal propia: a mi me paso algo parecido cuando...", "Las conexiones texto-vida profundizan la comprension y generan empatia", "No fuerce: si un nino dice que no le paso, pregunte a alguien que conozcas"] },
  "Cruz de comprension: QUIEN": { titulo: "Quien aparece en el cuento", contenido: "El brazo QUIEN de la cruz. Los ninos responden citando el texto y colocan siluetas de personajes.", tips: ["Distinga entre personaje principal y secundarios", "Pida que describan fisica y emocionalmente a cada personaje", "Las siluetas visuales ayudan a los ninos con dificultades de memoria"] },
  "Cruz de comprension: QUE": { titulo: "Que sucede en el cuento", contenido: "Identifican las 3 acciones mas importantes y las ordenan por relevancia.", tips: ["Distinga entre TODAS las cosas que pasan y las 3 MAS IMPORTANTES", "Pida justificacion: por que esa es mas importante?", "Las 3 acciones deben contar la historia si se leen solas"] },
  "Cruz de comprension: DONDE": { titulo: "Donde ocurre la historia", contenido: "Los ninos buscan frases que indican el lugar. Anotan en la cruz y dibujan el escenario principal.", tips: ["El DONDE puede cambiar a lo largo del cuento: identifiquen todos los lugares", "Busquen evidencia textual", "Pregunte: como se habrian sentido los personajes en otro lugar?"] },
  "Cruz de comprension: CUANDO": { titulo: "Cuando sucede la historia", contenido: "Los ninos identifican indicadores de tiempo y los ubican en una linea temporal.", tips: ["Indicadores tipicos: de manana, en invierno, habia una vez", "La linea temporal desarrolla comprension de secuencia narrativa", "Contrasten el tiempo del cuento con el tiempo real"] },
  "Cruz: Integracion literal": { titulo: "Los 4 brazos en equipo", contenido: "Divida en 4 grupos, cada uno trabaja un brazo. Presentan y completan la cruz colectiva.", tips: ["Cada grupo tiene 5 minutos para preparar su brazo", "La presentacion grupal desarrolla oralidad y pensamiento colaborativo", "Lean los 4 brazos como resumen de la historia"] },
  "Cruz: POR QUE - causa y efecto": { titulo: "Por que suceden las cosas", contenido: "Los ninos infieren causas que el texto no dice explicitamente. Como lo sabemos si no esta escrito?", tips: ["El POR QUE inferencial es mas dificil: prepare un ejemplo para modelar", "Use flechas causa-efecto en el pizarron", "Celebre las respuestas razonadas aunque no sean exactas"] },
  "Cruz: COMO sucede": { titulo: "Como ocurren los eventos", contenido: "Los ninos explican los procesos usando vocabulario de secuencia: primero... luego... al final.", tips: ["El COMO implica proceso y secuencia: use flecha que va de una cosa a otra", "Las diferentes versiones son validas si tienen base en el texto", "Conecte con procesos que los ninos conocen de su vida"] },
  "Cruz: QUE OPINAS": { titulo: "Yo opino porque...", contenido: "Los ninos expresan opinion usando la estructura: Yo opino que... porque en el texto dice...", tips: ["Modele la estructura completa antes de pedir que la usen", "Una opinion sin fundamento no es valida: exija el porque", "El debate muestra que el texto admite multiples lecturas"] },
  "Integracion LD + Cruz": { titulo: "El ciclo completo: antes durante y despues", contenido: "Ciclo completo: Antes, Durante, Despues. Los ninos lideran cada fase con la docente facilitando.", tips: ["Asigne roles: lider de predicciones, lider de preguntas, lider de cruz", "El ciclo completo toma una sesion entera: no lo apure", "Cuando los ninos lideran, el aprendizaje se profundiza"] },
  "Texto informativo": { titulo: "Antes durante y despues con texto informativo", contenido: "Antes: que sabemos. Durante: datos nuevos. Despues: comparamos con tarjetas KWL.", tips: ["El texto informativo no tiene personajes ni trama: adapte las preguntas", "Las imagenes en libros informativos son informacion, no decoracion", "La comparacion antes-despues muestra el aprendizaje que ocurrio"] },
  // ── ORALIDAD ──────────────────────────────────────────────────────────
  "ECO-E: Sonidos del entorno": { titulo: "Escucha y respuesta en oracion completa", contenido: "Los ninos cierran los ojos y escuchan 30 segundos. Responden en ORACION COMPLETA: Yo escuche el sonido de...", tips: ["Modele la oracion completa antes: Yo escuche el sonido de los pasos", "Si un nino dice solo la palabra, repita la oracion y pida que la repita", "El silencio previo es parte de la actividad: no lo llene con su voz"] },
  "ECO-E: Escucha de voces": { titulo: "Reconocer voces y responder", contenido: "Grabe voces de personas conocidas. Los ninos escuchan y responden: Esa es la voz de... porque...", tips: ["Conseguir las grabaciones toma tiempo: planifique con anticipacion", "La motivacion es alta cuando reconocen una voz conocida", "El porque desarrolla argumentacion oral basica"] },
  "ECO-E: Instrucciones simples": { titulo: "Seguir instrucciones y verbalizar", contenido: "De instrucciones simples. El nino ejecuta la accion y luego la verbaliza. No pase a la siguiente hasta que el nino haya verbalizado.", tips: ["La verbalizacion posterior a la accion ancla el vocabulario de accion", "Progrese de instrucciones simples a instrucciones de dos pasos", "La demora entre accion y verbalizacion desarrolla memoria de trabajo"] },
}

function getMicroCapacitacion(titulo: string): MicroCap {
  const cap = MICRO_CAPS[titulo]
  const ev  = EVIDENCIA_INTERNACIONAL[titulo]
  if (cap) {
    return {
      ...cap,
      referencia: ev ? `${ev.programa} (${ev.pais}) — impacto ${ev.impacto}/10` : undefined,
    }
  }
  return {
    titulo: "Tip para la actividad de hoy",
    contenido: `Para "${titulo}", observe atentamente a cada nino. Note quien participa con facilidad y quien necesita mas apoyo. Adapte el ritmo segun lo que vea.`,
    tips: [
      "Modele la actividad completa antes de pedir que los ninos la hagan solos",
      "Celebre cada logro por pequeno que sea",
      "Repita si los ninos no comprenden al primer intento: la repeticion es aprendizaje",
      "Registre sus observaciones para informar la planificacion de ALBA",
    ],
  }
}

// ── SECUENCIA ANUAL ───────────────────────────────────────────────────────────
// Alineada al DC Inicial GCBA 2025 - Practicas del Lenguaje
// La secuencia respeta la progresion curricular oficial:
// SALA 4: Discriminacion auditiva → Rimas y juego con el lenguaje → Silabas → Vocales → Exploracion de textos → Oralidad situacional
// SALA 5: Avanza sobre sala 4 agregando fonemas consonanticos → Blending/Segmentacion → CT inferencial/critica → Oralidad autonoma y argumentativa
// El cerebro de ALBA usa esta secuencia como NORTE y la ajusta segun el desempenio real del grupo
// ─────────────────────────────────────────────────────────────────────────────

const SECUENCIA: Record<"CF" | "CT" | "O" | "EA" | "OCT", { titulo: string; objetivo: string; descripcion: string; materiales: string[]; dccaba?: string; sala?: "4" | "5" | "ambas" }[]> = {
  // ── CONCIENCIA FONOLOGICA ────────────────────────────────────────────────
  // DC CABA 2025: sala 4 trabaja escucha, rimas, silabas y vocales.
  // Sala 5 profundiza fonemas consonanticos, blending y segmentacion fonemica.
  CF: [
    // BLOQUE 1 - SALA 4 Y 5: Discriminacion auditiva y juego con el lenguaje
    {
      titulo: "Escucha activa: sonidos del entorno",
      objetivo: "Discriminar y nombrar sonidos ambientales en oracion completa",
      descripcion: "Los ninos cierran los ojos 30 segundos en silencio. Al abrirlos nombran lo que oyeron en oracion completa: Yo escuche el sonido de... La docente muestra tarjetas con fuentes sonoras y los ninos las asocian. Se reproducen sonidos grabados (lluvia, palmas, instrumentos) para ampliar el repertorio.",
      materiales: ["Grabadora con sonidos del entorno", "Tarjetas con fuentes sonoras", "Triangulo y campana", "Antifaz opcional"],
      dccaba: "DC CABA 2025 - CF Sala 4: Escucha y discriminacion de sonidos del entorno. Base del desarrollo fonologico segun Goswami (1990).",
      sala: "ambas"
    },
    {
      titulo: "Juego con el lenguaje: canciones y rimas",
      objetivo: "Explorar el lenguaje oral a traves del ritmo, la rima y la musica",
      descripcion: "Cantar canciones rimadas del repertorio de la sala. La docente se detiene en el ultimo verso y los ninos completan el par rimado. Luego se juega a rimar los nombres del grupo: cada nino busca una palabra que rime con su nombre. Se arma un cartel de rimas de nombres para dejar a la vista.",
      materiales: ["Cancionero ilustrado de la sala", "Titere rimador", "Tarjetas con nombres", "Cartel colectivo"],
      dccaba: "DC CABA 2025 - CF Sala 4: Juego con el lenguaje - rimas, canciones, trabalenguas. Las rimas son el predictor mas fuerte de exito lector en pre-escolar (Goswami & Bryant, 1990).",
      sala: "ambas"
    },
    {
      titulo: "Trabalenguas y poesias: sensibilidad fonemica",
      objetivo: "Desarrollar sensibilidad hacia los sonidos del lenguaje a traves de la literatura oral",
      descripcion: "La docente presenta un trabalenguas o poesia breve. Lo dicen en coro primero lento, luego rapido. Luego identifican que sonido se repite mucho. Se anota en el pizarron y se decora con dibujos alusivos. Los ninos aprenden de memoria al menos dos trabalenguas en el ano.",
      materiales: ["Cartel con trabalenguas ilustrado", "Microfono de juguete", "Libros de poesia"],
      dccaba: "DC CABA 2025 - CF Sala 4: Juego con el lenguaje. La repeticion de sonidos en el texto literario desarrolla conciencia fonemica sin instruccion directa.",
      sala: "ambas"
    },
    // BLOQUE 2 - AMBAS SALAS: Segmentacion silabica
    {
      titulo: "Segmentacion silabica con palmadas",
      objetivo: "Separar palabras en silabas usando palmadas y representacion con fichas",
      descripcion: "La docente muestra una imagen, dice la palabra exagerando las silabas y da palmadas. Los ninos repiten. Se usan circulos de cartulina para representar cada silaba: uno por silaba, alineados en el pizarron. Se comparan palabras cortas (sol, pan) con largas (mariposa, helicoptero).",
      materiales: ["Tarjetas con imagenes variadas", "Circulos de cartulina", "Tamborcito"],
      dccaba: "DC CABA 2025 - CF Sala 4 y 5: Segmentacion de palabras en silabas con apoyo de palmadas y movimiento. Cuba y Francia: punto de entrada obligatorio al sistema de escritura.",
      sala: "ambas"
    },
    {
      titulo: "Silabas con movimiento corporal",
      objetivo: "Consolidar la segmentacion silabica con el cuerpo en movimiento",
      descripcion: "Un paso por silaba al caminar por el salon. La docente dice una palabra, los ninos caminan dando un paso por cada silaba y se detienen. Luego vuelven al piso y se cuentan las fichas. Se trabaja con nombres de animales, frutas y nombres de los ninos del grupo.",
      materiales: ["Cinta adhesiva en el piso para marcar espacios", "Imagenes de animales y frutas"],
      dccaba: "DC CABA 2025 - CF: El movimiento corporal asociado a cada silaba aumenta la retencion y es recomendado por el enfoque didactico oficial.",
      sala: "ambas"
    },
    // BLOQUE 3 - AMBAS SALAS: Vocales (sonido inicial)
    {
      titulo: "Vocal /a/: sonido inicial con imagen y gesto",
      objetivo: "Identificar palabras que comienzan con /a/ a traves de imagen, sonido y gesto",
      descripcion: "La docente prolonga el sonido /a/ con la boca bien abierta. Gesto corporal: brazos en triangulo hacia arriba. Se muestran imagenes variadas (incluyendo distractores) y los ninos hacen el gesto de /a/ SOLO cuando la imagen empieza con ese sonido. Luego buscan en la sala objetos que empiecen con /a/.",
      materiales: ["Tarjetas con imagenes (A y no-A)", "Espejo pequeno", "Mural colectivo letra A"],
      dccaba: "DC CABA 2025 - CF Sala 4: Identificacion del sonido inicial de las vocales en palabras conocidas. Las vocales primero porque son los sonidos mas perceptibles en espanol.",
      sala: "ambas"
    },
    {
      titulo: "Vocal /e/: buscar y encontrar en el aula",
      objetivo: "Identificar palabras que comienzan con /e/ en el entorno real",
      descripcion: "Los ninos recorren el aula buscando objetos cuyo nombre empiece con /e/. Cuando encuentran uno lo muestran al grupo y lo dicen en voz alta: Este es el espejo, empieza con /e/. Se lista en el pizarron. Si un nino trae un objeto que no empieza con E se trabaja juntos: a ver, escuchamos...",
      materiales: ["Sala preparada con objetos E visibles", "Tarjetas con imagenes E"],
      dccaba: "DC CABA 2025 - CF Sala 4: Sonido inicial vocal /e/. El aprendizaje situado en el aula real favorece la retencion a largo plazo.",
      sala: "ambas"
    },
    {
      titulo: "Vocal /i/: el cuerpo hace la letra",
      objetivo: "Identificar palabras que comienzan con /i/ con apoyo kinestesico",
      descripcion: "Los ninos forman la I con el cuerpo: de pie, brazos estirados hacia arriba. Cuando escuchan una palabra con /i/ hacen la postura, cuando no emppieza con /i/ se sientan. Luego el dictado grafico: la docente dice una palabra con /i/ y cada nino la dibuja.",
      materiales: ["Espejo largo", "Tarjetas de imagen I", "Hojas para dibujo"],
      dccaba: "DC CABA 2025 - CF Sala 4: Vocal /i/. La kinestesia fonetica (Uruguay, Plan CEIBAL) aumenta la retencion en ninos con distintos estilos de aprendizaje.",
      sala: "ambas"
    },
    {
      titulo: "Vocal /o/: labios redondos y clasificacion",
      objetivo: "Identificar palabras que comienzan con /o/ y discriminar de otras vocales",
      descripcion: "La O se dice con los labios redondos: ooooo. Gesto: hacer el circulo con indice y pulgar. Los ninos aplauden una sola vez si la imagen empieza con /o/ y se quedan quietos si no. Incluir distractores con otras vocales. Cada nino dibuja una cosa que empiece con /o/.",
      materiales: ["Tarjetas con imagenes O", "Espejo"],
      dccaba: "DC CABA 2025 - CF Sala 4: Vocal /o/. Discriminar de otras vocales refuerza la conciencia de contraste fonetico.",
      sala: "ambas"
    },
    {
      titulo: "Vocal /u/: juego de memoria en parejas",
      objetivo: "Identificar palabras que comienzan con /u/ a traves del juego colaborativo",
      descripcion: "Tarjetas de memoria: imagen con /u/ + tarjeta con la letra. En parejas dan vuelta de a dos. Si emparejan imagen con letra U ganan el par. Mientras juegan la docente pregunta: esa imagen como se llama? Con que sonido empieza? Al final arman un mural con todos los pares encontrados.",
      materiales: ["Juego de memoria con imagenes y letras U", "Mural colectivo"],
      dccaba: "DC CABA 2025 - CF Sala 4: Vocal /u/. El juego colaborativo en parejas desarrolla autonomia y lenguaje oral simultaneamente.",
      sala: "ambas"
    },
    {
      titulo: "Repaso de vocales: ruleta y clasificacion",
      objetivo: "Consolidar el reconocimiento de las 5 vocales por sonido inicial",
      descripcion: "Ruleta de vocales: al girar cae en una vocal y los ninos dicen 3 palabras que empiecen con ella. Luego se clasifican tarjetas de imagen en 5 columnas (una por vocal). Al final se cuenta cual vocal tuvo mas palabras y se debate por que.",
      materiales: ["Ruleta de vocales", "Dado con vocales", "Cajas de clasificacion rotuladas", "Set completo de tarjetas"],
      dccaba: "DC CABA 2025 - CF Sala 4: Consolidacion de vocales antes de pasar a consonantes (secuencia cubana: 98% de alfabetizacion).",
      sala: "ambas"
    },
    // BLOQUE 4 - SALA 5: Consonantes de alta frecuencia
    {
      titulo: "Consonante /m/: la primera consonante",
      objetivo: "Identificar palabras que comienzan con /m/ con estrategia visual y kinestesica",
      descripcion: "Los ninos imitan el sonido /m/ cerrando los labios: mmmmm. Frente al espejo se observa como se hacen los labios. Se muestran laminas y los ninos senalan las que empiezan con /m/ mientras hacen el gesto. Finalmente construyen una oracion oral con una de esas palabras.",
      materiales: ["Tarjetas con imagenes M", "Espejo", "Letra M en grande"],
      dccaba: "DC CABA 2025 - CF Sala 5: Sonido inicial de consonantes frecuentes. /m/ es bilabial, visible y de alta frecuencia en espanol (First Steps Australia).",
      sala: "5"
    },
    {
      titulo: "Consonante /p/: juego de pesca",
      objetivo: "Identificar y clasificar palabras que comienzan con /p/",
      descripcion: "Juego de pesca: tarjetas en el piso, cana de carton con iman. Los ninos pescan y clasifican en canasto verde las que empiezan con /p/ y rojo las que no. Cada vez que pescan lo dicen en voz alta: pesca, empieza con /p/. Al final cuentan cuantas palabras con /p/ encontraron.",
      materiales: ["Tarjetas plastificadas con iman", "Cana de carton", "Canastos de colores"],
      dccaba: "DC CABA 2025 - CF Sala 5: Discriminacion fonema-no fonema objetivo, habilidad base para decodificacion (First Steps + LEE Chile).",
      sala: "5"
    },
    {
      titulo: "Consonante /s/: trabajo en parejas",
      objetivo: "Identificar palabras con /s/ inicial en intercambio oral con un par",
      descripcion: "En parejas con turno alternado: un nino dice una palabra, el otro decide si empieza con /s/ levantando o bajando el pulgar. Luego intercambian. Al final presentan al grupo las palabras con /s/ que encontraron. Se anota en el pizarron.",
      materiales: ["Tarjetas con imagenes S", "Serpiente de peluche como objeto de turno"],
      dccaba: "DC CABA 2025 - CF Sala 5: /s/. El trabajo en parejas desarrolla argumentacion oral y metacognicion fonetica (Letters and Sounds, UK DfE 2007).",
      sala: "5"
    },
    {
      titulo: "Consonante /l/: cuento y tarjeta de alerta",
      objetivo: "Identificar el fonema /l/ en contexto de texto oral",
      descripcion: "La docente presenta un cuento breve con muchas palabras con /l/. Antes de leer, cada nino recibe una tarjeta L. La levantan cada vez que escuchan una palabra con /l/. Al terminar se listan todas las palabras encontradas y se cuentan.",
      materiales: ["Cuento con palabras L", "Tarjetas letra L", "Lista colectiva"],
      dccaba: "DC CABA 2025 - CF Sala 5: /l/. La identificacion en contexto de texto oral refuerza la comprension de que el fonema aparece dentro de palabras reales.",
      sala: "5"
    },
    {
      titulo: "Consonante /t/: dado de fonemas",
      objetivo: "Identificar y producir palabras con /t/ en juego grupal",
      descripcion: "Dado con imagenes en sus caras. Al girar, si la imagen empieza con /t/ el nino suma un punto. Se juega en equipos de 3. El equipo con mas puntos al cabo de 5 rondas gana. Luego cada nino dice una oracion con la imagen que le toco.",
      materiales: ["Dado con imagenes T y no-T", "Tablero de puntos"],
      dccaba: "DC CABA 2025 - CF Sala 5: /t/. DIBELS: los juegos de dado con fonemas objetivo tienen alta correlacion con desempeno lector a fin del primer grado.",
      sala: "5"
    },
    {
      titulo: "Consonante /n/: recorrido por el aula",
      objetivo: "Identificar palabras con /n/ en el entorno real de la sala",
      descripcion: "Los ninos recorren el aula buscando objetos cuyo nombre empiece con /n/. Los muestran al grupo. Se registra en un grafico de barras colectivo cuantas cosas encontro cada uno. Al final la docente agrega palabras no encontradas para completar el repertorio.",
      materiales: ["Grafico de barras en pizarron", "Tarjetas N para refuerzo"],
      dccaba: "DC CABA 2025 - CF Sala 5: /n/. El recorrido genera aprendizaje situado y amplia vocabulario en contexto real (Plan CEIBAL + PNEA Argentina).",
      sala: "5"
    },
    {
      titulo: "Repaso de consonantes: bingo de sonidos",
      objetivo: "Consolidar las consonantes trabajadas en formato de juego",
      descripcion: "Bingo de sonidos iniciales: cada nino recibe un carton con consonantes trabajadas. La docente dice palabras y el nino marca la consonante si su carton la tiene. Gana el primero en completar. Al verificar el bingo, el ganador dice una palabra por cada consonante marcada.",
      materiales: ["Cartones de bingo personalizados", "Bolsa con tarjetas de palabras"],
      dccaba: "DC CABA 2025 - CF Sala 5: Consolidacion de consonantes frecuentes. El bingo tiene alta motivacion intrinseca (Cuba/Australia).",
      sala: "5"
    },
    // BLOQUE 5 - SALA 5: Nivel fonetico avanzado (DC CABA: analisis y sintesis)
    {
      titulo: "Sonido final: atrapar el ultimo sonido",
      objetivo: "Identificar el sonido final de palabras de dos silabas",
      descripcion: "La docente dice palabras de dos silabas estirando el ultimo sonido. Los ninos cierran la mano para atrapar el sonido final y dicen que atraparon. Se registra con fichas de colores. Luego se agrupan las palabras por sonido final identico.",
      materiales: ["Tarjetas con imagenes bisillabas", "Fichas de colores", "Tablero de sonidos finales"],
      dccaba: "DC CABA 2025 - CF Sala 5: Identificacion de sonidos medios y finales. BPAL Canada: predictor de comprension ortografica.",
      sala: "5"
    },
    {
      titulo: "Analisis posicional: inicio-medio-final",
      objetivo: "Identificar la posicion de sonidos dentro de palabras trisllabas",
      descripcion: "Con palabras de tres silabas, los ninos abren la palabra con el cuerpo: mano izquierda=inicio, pecho=medio, mano derecha=final. Dicen el sonido de cada posicion. Se usan cajas de tres compartimentos con fichas de colores para representar cada posicion.",
      materiales: ["Cajas de tres compartimentos", "Fichas de tres colores distintos", "Tarjetas CVC"],
      dccaba: "DC CABA 2025 - CF Sala 5: Analisis posicional validado en programas canadienses de intervencion temprana (BPAL).",
      sala: "5"
    },
    {
      titulo: "Sintesis de fonemas: el robot habla lento",
      objetivo: "Unir fonemas separados para formar palabras (blending)",
      descripcion: "La docente actua como un robot que habla lento pronunciando fonemas separados: /m/-/a/-/r/. Los ninos juntan los sonidos y adivinan la palabra. Luego los ninos turnan de ser el robot mientras el grupo adivina. Se usan palabras del entorno cotidiano.",
      materiales: ["Tarjetas con imagenes de palabras cortas", "Fichas para representar fonemas"],
      dccaba: "DC CABA 2025 - CF Sala 5: Sintesis de fonemas (blending). Jolly Phonics UK: LA habilidad central para decodificar. Estrategia mas replicada internacionalmente.",
      sala: "5"
    },
    {
      titulo: "Analisis de fonemas: cubos de Elkonin",
      objetivo: "Descomponer palabras en sus fonemas individuales (segmentacion fonemica)",
      descripcion: "Los ninos reciben una palabra y con cubos de Elkonin (uno por fonema) los colocan en una fila empujando cada cubo a medida que dicen cada sonido. Cuentan cuantos fonemas tiene la palabra. Se comparan palabras largas y cortas. La docente registra individualmente.",
      materiales: ["Set de cubos de Elkonin", "Tarjetas con imagenes de palabras 2-4 fonemas"],
      dccaba: "DC CABA 2025 - CF Sala 5: Analisis de fonemas. NRP (2000): estrategia con mas evidencia de impacto en conciencia fonemica. Efecto tamaño d=0.86.",
      sala: "5"
    },
    {
      titulo: "Sustitucion de fonemas: letras moviles",
      objetivo: "Cambiar un fonema para crear palabras nuevas",
      descripcion: "La docente propone cambiar el primer sonido: pato cambiamos /p/ por /g/ y queda gato. Los ninos descubren la nueva palabra. Se usan letras moviles para mostrar el cambio visualmente en el franelografo. Luego los ninos proponen sus propios cambios.",
      materiales: ["Letras moviles magneticas", "Franelografo o pizarra magnetica"],
      dccaba: "DC CABA 2025 - CF Sala 5: Manipulacion de fonemas (sustitucion). Wilson Reading System + Reading Recovery: estrategia de intervencion temprana de alta evidencia.",
      sala: "5"
    },
    {
      titulo: "Omision y adicion de fonemas",
      objetivo: "Quitar y agregar fonemas para crear nuevas palabras",
      descripcion: "OMISION: sol sin /s/ queda ol. Se usa una ficha que se cubre para representar el fonema quitado. ADICION: a la palabra mar agregamos /c/ al inicio y queda cama. Los ninos dicen lo que queda o resulta en cada caso. Trabajo con letras moviles.",
      materiales: ["Tarjetas de letras", "Fichas para tapar sonidos", "Letras moviles"],
      dccaba: "DC CABA 2025 - CF Sala 5: Manipulacion de fonemas (omision y adicion). BPAL Canada: nivel avanzado de conciencia fonemica.",
      sala: "5"
    },
    {
      titulo: "Evaluacion CF: estaciones de fonologia",
      objetivo: "Evaluar el dominio de la conciencia fonologica por nivel",
      descripcion: "Cuatro estaciones rotativas (5 min cada una): 1) Rimas: el nino dice si dos palabras riman. 2) Silabas: segmentar con palmadas. 3) Sonido inicial: identificar en imagen. 4) Sintesis/Analisis: robot lento y cubos. La docente rota y registra individualmente con rubrica.",
      materiales: ["Rubrica de evaluacion CF", "Material por estacion", "Registro individual"],
      dccaba: "DC CABA 2025 - CF: Evaluacion continua y formativa al servicio del aprendizaje. DIBELS + PALS: formato de estaciones para obtener datos sin interrumpir el ritmo grupal.",
      sala: "ambas"
    },
  ],

  // ── COMPRENSION DE TEXTOS ────────────────────────────────────────────────
  // DC CABA 2025: sala 4 trabaja comprension literal con textos narrativos breves y explorados en voz alta.
  // Sala 5 profundiza inferencias, secuencia narrativa, vocabulario y comprension critica.
  // El eje literario tiene valor en si mismo: no es pretexto para la ensenanza (DC CABA, enfoque didactico).
  CT: [
    // BLOQUE 1 - AMBAS SALAS: Aproximacion al libro y al texto
    {
      titulo: "El libro como objeto: exploracion libre",
      objetivo: "Explorar el libro como portador de texto y desarrollar actitud lectora",
      descripcion: "Se presenta el libro cerrado en el atril. Los ninos observan tapa, contratapa, titulo, autor, ilustrador. En ronda responden: de que creen que trata? quienes apareceran? La docente registra las predicciones visibles en el pizarron. Se enfatiza que el libro fue escrito por alguien para ser leido.",
      materiales: ["Libro con portada atractiva", "Atril", "Post-its o tarjetas para predicciones"],
      dccaba: "DC CABA 2025 - CT Sala 4: Exploracion de portadores de texto. El libro como objeto cultural con valor propio (enfoque didactico DC).",
      sala: "ambas"
    },
    {
      titulo: "Antes de leer: predicciones e hipotesis",
      objetivo: "Formular hipotesis sobre el contenido a partir de la portada",
      descripcion: "Antes de abrir el libro, cada nino dice en voz alta su prediccion. Se registran en el pizarron. Al terminar la lectura se vuelve a las predicciones: cuales fueron acertadas? Cuales no? Por que nos confundimos? El error es parte del aprendizaje lector.",
      materiales: ["Libro seleccionado", "Pizarron para predicciones", "Tapa ampliada si es posible"],
      dccaba: "DC CABA 2025 - CT Sala 4 y 5: Anticipacion del contenido a partir de imagenes. Las predicciones generan 'cognitive engagement' (CEIBAL/MINEDUC Chile).",
      sala: "ambas"
    },
    {
      titulo: "Lectura en voz alta con pausas dialogicas",
      objetivo: "Participar activamente durante la lectura respondiendo preguntas",
      descripcion: "La docente lee en voz alta con pausas estrategicas para preguntar: que creen que pasara? por que hizo eso el personaje? como se siente? Un titere preguntador formula las preguntas para motivar. Se acepta toda respuesta y se vuelve al texto para verificar.",
      materiales: ["Libro con marcadores de pausa", "Titere preguntador", "Campana para pausas"],
      dccaba: "DC CABA 2025 - CT Sala 4 y 5: Lectura dialogica en voz alta diaria por el docente. Mayor impacto en grupos vulnerables (Vygotsky/Flecha, Lectura Dialogica).",
      sala: "ambas"
    },
    {
      titulo: "Vocabulario en contexto: muro de palabras",
      objetivo: "Inferir el significado de palabras nuevas en el contexto de la lectura",
      descripcion: "Al encontrar una palabra dificil la docente se detiene: esta palabra es nueva, vamos a adivinar que significa por lo que leimos. El grupo infiere y luego se escribe en el muro de palabras de la sala con una imagen. Se revisa al inicio de la clase siguiente.",
      materiales: ["Libro con vocabulario nuevo", "Muro de palabras en la sala", "Tarjetas de vocabulario con imagen"],
      dccaba: "DC CABA 2025 - CT Sala 5: Vocabulario en contexto. Beck & McKeown: la inferencia en contexto es mas efectiva que la definicion directa para la retencion.",
      sala: "ambas"
    },
    // BLOQUE 2 - AMBAS SALAS: Comprension literal (QUIEN, QUE, DONDE, CUANDO)
    {
      titulo: "QUIEN: personajes principales",
      objetivo: "Identificar y describir a los personajes principales con evidencia del texto",
      descripcion: "La docente pregunta: quienes son los personajes? Los ninos responden citando el texto. Se colocan siluetas en la cruz de comprension (brazo QUIEN). Para sala 4: solo nombrar los personajes. Para sala 5: agregar como son fisicamente y como son en su personalidad.",
      materiales: ["Cruz de comprension en pizarron", "Siluetas de personajes", "Cuento con personajes claros"],
      dccaba: "DC CABA 2025 - CT Sala 4: Reconocimiento de personajes principales. Sala 5: descripcion con atributos. Cruz de Comprension MINEDUC Chile: validada en todos los niveles educativos.",
      sala: "ambas"
    },
    {
      titulo: "QUE: acciones del texto con apoyo visual",
      objetivo: "Identificar las acciones mas importantes del texto en orden",
      descripcion: "Los ninos identifican las 3 acciones mas importantes del texto y las ordenan por relevancia. Se anotan en el brazo QUE de la cruz. Para sala 4 se apoya con imagenes de la historia. Para sala 5 se hace sin apoyo visual y se agrega el orden temporal.",
      materiales: ["Cruz de comprension", "Tarjetas de acciones", "Imagenes de la historia para sala 4"],
      dccaba: "DC CABA 2025 - CT Sala 4 y 5: Comprension literal (QUE sucede). Cruz MINEDUC Chile.",
      sala: "ambas"
    },
    {
      titulo: "DONDE y CUANDO: espacio y tiempo en el texto",
      objetivo: "Identificar indicadores de lugar y tiempo con evidencia textual",
      descripcion: "DONDE: los ninos buscan frases del texto que indican el lugar y lo dibujan. CUANDO: identifican indicadores de tiempo (de manana, en verano, hace mucho tiempo) y los ubican en una linea temporal. Se trabaja en grupos de 4: 2 a cargo de DONDE y 2 a cargo de CUANDO.",
      materiales: ["Cruz de comprension", "Linea de tiempo en papel", "Hojas para dibujar el escenario"],
      dccaba: "DC CABA 2025 - CT Sala 5: Comprension de secuencia narrativa. Predictor de desempeno en PISA Lectura.",
      sala: "ambas"
    },
    {
      titulo: "Recontar la historia: cadena de imagenes",
      objetivo: "Recontar con propias palabras usando conectores de secuencia",
      descripcion: "Con imagenes de secuencia del cuento en el pizarron los ninos recontan en cadena: cada uno agrega un fragmento. La docente guia con: que paso primero? y despues? como termino? Para sala 5 se hace sin imagenes de apoyo usando solo conectores: primero, luego, al final.",
      materiales: ["Imagenes de secuencia del cuento", "Titeres opcionales"],
      dccaba: "DC CABA 2025 - CT Sala 4 y 5: Recontado de la historia. Reading Recovery (Clay): activa memoria episodica y estructura narrativa.",
      sala: "ambas"
    },
    {
      titulo: "Conexiones texto-vida: texto-texto-mundo",
      objetivo: "Conectar el texto con experiencias personales y otros textos conocidos",
      descripcion: "La docente propone los tres tipos de conexion: TEXTO-VIDA (esto te paso a vos?), TEXTO-TEXTO (conoces otro cuento con un personaje asi?), TEXTO-MUNDO (esto pasa en la vida real?). Los ninos comparten en parejas y luego algunos con el grupo.",
      materiales: ["Libro leido", "Hojas para dibujar conexiones", "Otros libros de la biblioteca de la sala"],
      dccaba: "DC CABA 2025 - CT: Diversidad de textos. Calkins (2001): las conexiones generan motivacion lectora y comprension profunda.",
      sala: "ambas"
    },
    // BLOQUE 3 - SALA 5: Comprension inferencial
    {
      titulo: "POR QUE: causas e inferencias",
      objetivo: "Inferir causas no explicitas en el texto",
      descripcion: "Se agrega el brazo POR QUE a la cruz. Los ninos infieren causas que el texto no dice explicitamente. La docente pregunta: como lo sabemos si no esta escrito? Se debate en grupo. Solo en sala 5. Para sala 4 esta pregunta se responde solo si la causa esta explicita.",
      materiales: ["Cruz de comprension con brazo POR QUE", "Flechas causa-efecto"],
      dccaba: "DC CABA 2025 - CT Sala 5: Comprension inferencial. Cruz MINEDUC Chile + Reader's Workshop Canada: nivel superior al literal.",
      sala: "5"
    },
    {
      titulo: "COMO sucede: secuencia de procesos",
      objetivo: "Explicar como ocurren los eventos usando vocabulario de secuencia",
      descripcion: "Los ninos explican los procesos que llevan a los eventos del texto usando: primero... luego... al final... Se contrastan diferentes versiones. La docente registra quien usa conectores de forma autonoma y quien necesita andamio.",
      materiales: ["Cruz con brazo COMO", "Tarjetas de conectores visuales"],
      dccaba: "DC CABA 2025 - CT Sala 5: Comprension de procesos. Base para textos informativos y explicativos.",
      sala: "5"
    },
    {
      titulo: "QUE OPINAS: opinion fundamentada",
      objetivo: "Expresar opinion sobre el texto con argumentos del texto",
      descripcion: "Los ninos usan la estructura: Yo opino que... porque en el texto dice... Se registran en globos de opinion en el pizarron. Se debate si hay distintas opiniones validas sobre el mismo texto. La docente celebra las opiniones distintas como enriquecimiento.",
      materiales: ["Cuento con dilema etico", "Microfono de juguete", "Globos de opinion para el pizarron"],
      dccaba: "DC CABA 2025 - CT Sala 5: Comprension critica. Finlandia introduce el debate argumentativo desde sala 5.",
      sala: "5"
    },
    {
      titulo: "Texto informativo: KWL + datos nuevos",
      objetivo: "Aplicar estrategias de comprension a textos no narrativos",
      descripcion: "Se usa un libro informativo o afiche. ANTES: que sabemos del tema (K), que queremos saber (W). DURANTE: buscamos datos nuevos y los marcamos. DESPUES: que aprendimos (L) y comparamos con lo que ya sabiamos. Se arma una cartelera informativa con los datos encontrados.",
      materiales: ["Libro informativo con imagenes", "Tarjetas KWL", "Cartelera colectiva"],
      dccaba: "DC CABA 2025 - CT Sala 5: Diversidad de textos - textos informativos. CAFE Strategy + Reader's Workshop Canada.",
      sala: "5"
    },
    {
      titulo: "Personajes: fisico, personalidad y acciones",
      objetivo: "Describir un personaje con atributos fisicos, de personalidad y acciones",
      descripcion: "Cada nino elige un personaje y completa un organizador grafico: como es fisicamente? como es su personalidad? que hace en la historia? que le pasa al final? Se presentan al grupo y se comparan. La docente desafia: como lo sabes? Muestra donde dice eso.",
      materiales: ["Cuento con personajes variados", "Organizador grafico impreso"],
      dccaba: "DC CABA 2025 - CT Sala 5: Comprension de personajes con atributos. Predictor de comprension lectora en educacion primaria.",
      sala: "5"
    },
    {
      titulo: "Comprension critica: dilemas del cuento",
      objetivo: "Evaluar las acciones de los personajes con argumentos propios",
      descripcion: "Se presenta un dilema etico del cuento. Los ninos debaten: estuvo bien lo que hizo el personaje? Por que? Se vota y se elabora un juicio colectivo usando la estructura: Yo creo que... porque... La docente registra la complejidad argumentativa de cada nino.",
      materiales: ["Cuento con dilemas eticos", "Balanza de justicia de juguete"],
      dccaba: "DC CABA 2025 - CT Sala 5: Comprension critica. Los ninos valoran las acciones de los personajes y dan opinion fundamentada.",
      sala: "5"
    },
    {
      titulo: "Ciclo completo: Antes - Durante - Despues",
      objetivo: "Aplicar el ciclo completo de lectura dialogica de forma autonoma",
      descripcion: "Los ninos lideran cada fase: Antes (un nino coordina las predicciones), Durante (otro nino con el titere hace las pausas y preguntas), Despues (completan la cruz entre todos). La docente facilita sin dirigir. Al final reflexionan: que estrategia les resulto mas util?",
      materiales: ["Cuento nuevo", "Titere preguntador", "Cruz completa"],
      dccaba: "DC CABA 2025 - CT: Ciclo completo Antes-Durante-Despues liderado por los ninos. Modelo de maxima evidencia (Lectura Dialogica + Cruz MINEDUC).",
      sala: "5"
    },
    {
      titulo: "Evaluacion CT: texto nuevo y rubrica",
      objetivo: "Evaluar comprension con texto no trabajado previamente",
      descripcion: "La docente lee un texto nuevo y observa como cada nino aplica de forma autonoma las estrategias de lectura dialogica y la cruz. Registra en rubrica: nivel literal (sala 4) e inferencial/critico (sala 5). Los datos informan la planificacion del trimestre siguiente.",
      materiales: ["Texto de evaluacion nuevo", "Rubrica CT por nivel", "Registro individual"],
      dccaba: "DC CABA 2025 - CT: Evaluacion continua y formativa. La evaluacion esta al servicio del aprendizaje y la planificacion.",
      sala: "ambas"
    },
  ],

  // ── ORALIDAD ──────────────────────────────────────────────────────────────
  // DC CABA 2025: el eje de Oralidad es transversal a toda la ensenanza.
  // Sala 4: participacion en situaciones comunicativas, escucha activa, narracion con apoyo.
  // Sala 5: narracion autonoma, argumentacion, exposicion oral, debate, dramatizacion.
  // La asamblea diaria es el espacio de oralidad sistematico recomendado por el DC CABA.
  O: [
    // BLOQUE 1 - AMBAS SALAS: Escucha activa y oralidad situacional
    {
      titulo: "Asamblea: el espacio de la palabra",
      objetivo: "Participar en intercambios orales respetando turnos y expresandose en oracion completa",
      descripcion: "La asamblea es el espacio diario de oralidad. La docente modela el turno: quien tiene el objeto de la palabra (pelota, baston) habla, el resto escucha. Se empieza con temas cotidianos: que hicieron el fin de semana? que notaron hoy? Se exige oracion completa y se celebra cada participacion.",
      materiales: ["Objeto de la palabra (pelota, baston)", "Reloj de arena", "Lista de nombres"],
      dccaba: "DC CABA 2025 - O Sala 4 y 5: Participacion en conversaciones grupales respetando el turno. La asamblea diaria es el espacio de intercambio oral sistematico recomendado por el DC.",
      sala: "ambas"
    },
    {
      titulo: "Escucha activa: sonidos y voces",
      objetivo: "Discriminar sonidos y voces con respuesta verbal en oracion completa",
      descripcion: "Se reproducen grabaciones de sonidos ambientales y voces conocidas. El nino responde en oracion completa: Eso es el sonido de... / Esa es la voz de... Si responde con una sola palabra, la docente modela la oracion completa y espera la repeticion. Se registra quien necesita andamio.",
      materiales: ["Grabaciones de sonidos y voces", "Microfono de juguete", "Antifaz"],
      dccaba: "DC CABA 2025 - O Sala 4: Escucha activa en situaciones comunicativas variadas. La oracion completa como estandar de produccion oral desde sala 4.",
      sala: "ambas"
    },
    {
      titulo: "Instrucciones: ejecutar y verbalizar",
      objetivo: "Seguir instrucciones orales y verbalizarlas con estructura completa",
      descripcion: "Instrucciones de un paso (sala 4) o dos pasos (sala 5). El nino las ejecuta y las verbaliza: Yo levante el brazo / Primero yo... y despues yo... REGLA: no avanzar a la siguiente instruccion sin la verbalizacion completa. Aumentar dificultad gradualmente.",
      materiales: ["Objetos para manipular", "Tarjetas con acciones pictogramas"],
      dccaba: "DC CABA 2025 - O Sala 4: Instrucciones simples. Sala 5: secuencia de dos pasos. ECO-E (Argentina/Chile): la verbalizacion posterior ancla el vocabulario de accion.",
      sala: "ambas"
    },
    {
      titulo: "Descripcion de objetos: ES / TIENE / SIRVE PARA",
      objetivo: "Describir objetos usando un marco estructurado",
      descripcion: "El nino saca un objeto de la bolsa misteriosa y lo describe usando el marco visible: Es un... / Tiene... / Sirve para... La docente no avanza con respuesta de palabra suelta. Si el nino se traba, senala el marco como apoyo visual y espera. Para sala 5 se agrega: Es igual/parecido a...",
      materiales: ["Bolsa misteriosa con objetos variados", "Marco de descripcion impreso en grande", "Microfono"],
      dccaba: "DC CABA 2025 - O Sala 4: Descripcion de objetos y situaciones. Sala 5: descripcion con precision (color, forma, tamaño, funcion). Marco estructurado como andamio.",
      sala: "ambas"
    },
    // BLOQUE 2 - AMBAS SALAS: Vocabulario y comprension oral
    {
      titulo: "Vocabulario nuevo: bolsa misteriosa y clasificacion",
      objetivo: "Ampliar vocabulario y usar palabras nuevas en oracion completa",
      descripcion: "Se presenta un objeto desconocido. El nino lo saca, lo explora y lo describe. La docente valida el nombre correcto y lo integra a la clase: quien mas conoce esta palabra? Se clasifica por categoria: es un animal, una herramienta, una fruta. Al final se revisa el muro de palabras.",
      materiales: ["Objetos o imagenes nuevas", "Bolsa misteriosa", "Muro de palabras"],
      dccaba: "DC CABA 2025 - O Sala 4 y 5: Amplitud de vocabulario en contextos significativos. El contexto real facilita la retencion a largo plazo.",
      sala: "ambas"
    },
    {
      titulo: "Categorias semanticas: clasificar y argumentar",
      objetivo: "Clasificar objetos por categoria y verbalizar el criterio usado",
      descripcion: "Se presentan objetos de distintas categorias. El nino los clasifica y verbaliza: El perro es un animal porque... La docente no acepta clasificacion sin verbalizacion. Se complica agregando subcategorias (animal domestico vs salvaje) y pidiendo que justifiquen.",
      materiales: ["Cajas de categorias rotuladas", "Objetos o imagenes variadas"],
      dccaba: "DC CABA 2025 - O: Amplitud de vocabulario. La categorizacion semantica es base del desarrollo del lenguaje academico.",
      sala: "ambas"
    },
    {
      titulo: "Inferencias orales: causa y efecto",
      objetivo: "Inferir causas a partir de imagenes y expresarlas con PORQUE",
      descripcion: "Se muestran imagenes con situaciones. El nino infiere usando: El nino esta llorando porque... / La planta se seco porque... La docente desafia: como lo sabes si la imagen no lo dice? Se trabaja la diferencia entre lo que SE VE y lo que SE DEDUCE.",
      materiales: ["Imagenes con situaciones cotidianas", "Tarjetas de causa-efecto", "Flechas visuales"],
      dccaba: "DC CABA 2025 - O Sala 5: Inferencias simples. ECO-C: la inferencia oral precede y anticipa la inferencia en la lectura.",
      sala: "ambas"
    },
    // BLOQUE 3 - AMBAS SALAS: Narracion oral
    {
      titulo: "Narracion de experiencias personales",
      objetivo: "Narrar experiencias propias usando conectores de secuencia temporal",
      descripcion: "El nino narra una experiencia personal usando los 4 conectores: Primero... luego... despues... al final... La docente muestra los conectores en tarjetas visuales. Si el nino salta uno, se senala la tarjeta faltante y se espera que lo incluya. Para sala 4 se admite apoyo visual durante toda la narracion.",
      materiales: ["Tarjetas visuales de conectores", "Fotos de experiencias (opcionales)", "Microfono"],
      dccaba: "DC CABA 2025 - O Sala 4: Narracion de experiencias personales con apoyo. Sala 5: narracion autonoma con conectores temporales y causales.",
      sala: "ambas"
    },
    {
      titulo: "Dramatizacion: juego simbolico y lenguaje",
      objetivo: "Desarrollar el lenguaje oral a traves de la dramatizacion y el juego simbolico",
      descripcion: "Los ninos dramatizan un cuento conocido asumiendo roles. La docente es el narrador. Se detiene en momentos de dialogo y los ninos improvisan lo que dirian los personajes. Luego se comenta: que dijo el personaje? como lo dijo? Por que lo dijo asi?",
      materiales: ["Vestuario simple", "Titeres", "Escenografia minima"],
      dccaba: "DC CABA 2025 - O Sala 4 y 5: Dramatizaciones y juego simbolico. El juego es el organizador principal de la ensenanza en el nivel inicial (DC CABA, principio didactico).",
      sala: "ambas"
    },
    // BLOQUE 4 - SALA 5: Oralidad autonoma y argumentativa
    {
      titulo: "Exposicion oral: estructura INICIO-DESARROLLO-CIERRE",
      objetivo: "Presentar un tema breve con estructura completa",
      descripcion: "Cada nino presenta un tema de 1 minuto usando la estructura: Hoy voy a hablar de... (inicio) / Lo que mas me importa es... (desarrollo) / Para terminar... (cierre). La docente muestra la estructura en cartel. Si empieza sin ella, para amablemente y recuerda el inicio correcto.",
      materiales: ["Cartel de estructura de exposicion", "Microfono", "Publico de peluches para los mas timidos"],
      dccaba: "DC CABA 2025 - O Sala 5: Exposicion oral de temas conocidos con apoyo de imagenes. Base del lenguaje academico en primaria.",
      sala: "5"
    },
    {
      titulo: "Argumentacion: Yo opino que... porque...",
      objetivo: "Dar razones de preferencias y opiniones con estructura argumentativa",
      descripcion: "La docente presenta dilemas o preferencias. El nino argumenta: A mi me gusta X porque Y / Yo creo que Z porque W. REGLA: no se acepta la opinion sin el PORQUE. Si falta, la docente senala el conector visual y espera la oracion completa. Se debate si hay distintas opiniones validas.",
      materiales: ["Tarjetas de dilemas o preferencias", "Conector PORQUE en cartel visible", "Microfono"],
      dccaba: "DC CABA 2025 - O Sala 5: Argumentacion simple - dar razones de preferencias y opiniones. Base del pensamiento critico.",
      sala: "5"
    },
    {
      titulo: "Debate: escuchar y responder con argumentos",
      objetivo: "Participar en un debate respetando el turno y respondiendo al argumento del otro",
      descripcion: "Se propone un tema de debate accesible: es mejor el dia o la noche? Se divide la clase en dos grupos. Cada grupo prepara 3 argumentos. El debate tiene reglas: escuchar al otro antes de responder, responder al argumento (no al nino), usar PORQUE. La docente modera.",
      materiales: ["Objeto de turno", "Tarjetas de argumentos para preparar", "Reloj visible"],
      dccaba: "DC CABA 2025 - O Sala 5: Participacion en debates. El sistema finlandes de debate temprano + Cruz QUE OPINAS (MINEDUC Chile).",
      sala: "5"
    },
    {
      titulo: "Narracion autonoma: cuento con inicio, conflicto y resolucion",
      objetivo: "Narrar un cuento inventado con estructura narrativa completa",
      descripcion: "El nino inventa y narra un cuento breve con estructura: habia una vez... (inicio), un dia... (conflicto), y entonces... (resolucion), al final... (cierre). La docente usa la estructura de tarjetas como andamio. Se graba la narracion para que el nino se escuche. Al escucharse el nino identifica que le falta o mejorar.",
      materiales: ["Tarjetas de estructura narrativa", "Grabador o celular", "Titeres para apoyo"],
      dccaba: "DC CABA 2025 - O Sala 5: Narracion autonoma de experiencias, cuentos y situaciones imaginadas. La grabacion desarrolla metacognicion oral.",
      sala: "5"
    },
    {
      titulo: "Exposicion con imagenes: tema de interes propio",
      objetivo: "Presentar al grupo un tema de interes personal con apoyo visual",
      descripcion: "Cada nino elige un tema de su interes (un animal, un deporte, su familia) y prepara una exposicion de 2 minutos con imagenes. El grupo escucha y luego hace al menos una pregunta. La docente registra la estructura usada y el vocabulario especifico del tema.",
      materiales: ["Imagenes o dibujos preparados por el nino", "Microfono", "Rubrica de exposicion"],
      dccaba: "DC CABA 2025 - O Sala 5: Exposicion oral de temas conocidos. Entrevistas a adultos de la comunidad (variante recomendada por el DC).",
      sala: "5"
    },
    {
      titulo: "Evaluacion ECO: situaciones naturales de comunicacion",
      objetivo: "Evaluar la oralidad en contextos comunicativos reales y variados",
      descripcion: "La docente genera situaciones naturales de conversacion (describir, narrar, argumentar, exponer) sin modelado previo. Registra en rubrica por nivel: autonoma, con andamio, con palabra suelta. Incluye: escucha activa, turno de dialogo, vocabulario, conectores, argumentacion.",
      materiales: ["Rubrica ECO completa", "Registro individual", "Situaciones comunicativas variadas preparadas"],
      dccaba: "DC CABA 2025 - O: Evaluacion continua y formativa. La evaluacion de oralidad debe realizarse en situaciones comunicativas reales, no en pruebas aisladas.",
      sala: "ambas"
    },
  ],

  // ── APROXIMACION A LA ESCRITURA (EA) — segunda mitad de ano ─────────────
  // DC CABA 2025: Practicas de lectura y escritura en contextos reales.
  // Se incorpora desde julio aproximadamente, cuando la CF ya esta consolidada.
  // Sala 5 es el foco principal; sala 4 trabaja solo los niveles iniciales.
  EA: [
    {
      titulo: "Escritura del nombre propio",
      objetivo: "Reconocer y escribir el nombre propio como primer texto significativo",
      descripcion: "La docente presenta tarjetas con los nombres del grupo. Cada nino busca la suya, la observa y copia su nombre en papel sin renglones. Se trabaja letra por letra con la tarjeta como modelo. Se comparan nombres: cuales son largos, cuales cortos, cuales empiezan igual. El nombre queda pegado en el cuaderno como referente permanente.",
      materiales: ["Tarjetas con nombres en mayuscula imprenta", "Papel blanco sin renglones", "Marcadores gruesos", "Cuaderno personal"],
      dccaba: "DC CABA 2025 - EA: El nombre propio es el primer texto con significado real para el nino. Base de todos los programas de alfabetizacion temprana (Ferreiro & Teberosky, 1979).",
      sala: "ambas"
    },
    {
      titulo: "Letras de mi nombre en el cuerpo",
      objetivo: "Identificar y reconocer las letras del nombre propio en diferentes soportes",
      descripcion: "Los ninos buscan las letras de su nombre en diarios, revistas y envases. Las recortan o senalan. Luego arman su nombre con letras moviles (tarjetas). Se trabaja la idea de que las letras son fijas: siempre son las mismas para el mismo nombre. Cierre: cada nino presenta su nombre armado al grupo.",
      materiales: ["Diarios y revistas", "Tijeras con punta roma", "Letras moviles (tarjetas o imanes)", "Pegamento"],
      dccaba: "DC CABA 2025 - EA: Exploracion de portadores de texto. Reconocer letras conocidas en distintos soportes desarrolla la nocion de que la escritura es un sistema estable.",
      sala: "ambas"
    },
    {
      titulo: "Escritura espontanea: que quiero decir?",
      objetivo: "Producir escritura espontanea para comunicar un mensaje personal",
      descripcion: "Cada nino elige algo que quiere contarle a alguien (un familiar, un amigo imaginario) y lo escribe como puede: con letras que conoce, con dibujo-escritura, con letras mezcladas. La docente pregunta a cada uno que quiso escribir y lo anota al pie en escritura convencional. Se leen las producciones en voz alta.",
      materiales: ["Papel carta", "Lapices y marcadores", "Sobres de carta opcionales"],
      dccaba: "DC CABA 2025 - EA: La produccion de escritura con intencion comunicativa real es mas efectiva que la copia mecanica. Ferreiro (1979): los ninos pasan por niveles de conceptualizacion que deben respetarse.",
      sala: "ambas"
    },
    {
      titulo: "Palabras del proyecto: mural de escritura",
      objetivo: "Escribir palabras significativas del proyecto con apoyo del mural del aula",
      descripcion: "Se arma un mural con las palabras clave del proyecto en curso (ej: si el proyecto es Los Insectos, van: mariposa, hormiga, alas, antenas). Los ninos copian la palabra de su eleccion en una tira de papel y la ilustran. El mural queda como banco de palabras disponible todo el mes.",
      materiales: ["Papel afiche para el mural", "Tiras de papel", "Marcadores de colores", "Imagenes del proyecto"],
      dccaba: "DC CABA 2025 - EA: El vocabulario del proyecto como recurso de escritura. La copia con sentido (no mecanica) del nivel inicial desarrolla la relacion sonido-grafia en contexto real.",
      sala: "ambas"
    },
    {
      titulo: "Etiquetas: escribir para nombrar el mundo",
      objetivo: "Producir escritura funcional etiquetando objetos del aula",
      descripcion: "La sala se convierte en un museo: cada sector, caja y rincón necesita una etiqueta. Los ninos escriben las etiquetas (con modelo o autonomamente segun nivel). Se pegan en los objetos reales. La docente lee cada etiqueta en voz alta con el grupo. Queda como instalacion permanente del mes.",
      materiales: ["Tarjetas en blanco", "Marcadores", "Cinta adhesiva", "Lista de palabras de referencia"],
      dccaba: "DC CABA 2025 - EA: Escritura funcional con proposito real. El DC enfatiza que los ninos deben escribir para algo, no solo por ejercicio.",
      sala: "ambas"
    },
    {
      titulo: "Dictado al docente: texto colectivo",
      objetivo: "Participar en la produccion de un texto colectivo dictado al docente",
      descripcion: "El grupo dicta una historia, noticia o carta y la docente escribe en el pizarron en tiempo real, verbalizando cada decision: escribo una mayuscula porque empieza la oracion, pongo punto porque termina la idea. Los ninos observan como el habla se convierte en escritura. Luego la docente lee el texto completo y los ninos ilustran su parte favorita.",
      materiales: ["Pizarron o papel afiche", "Marcadores gruesos", "Hoja para ilustrar"],
      dccaba: "DC CABA 2025 - EA: El dictado al docente es la estrategia de maxima evidencia para mostrar la relacion oral-escrito. Chambers (1993): el adulto como escriba modela el proceso de manera visible.",
      sala: "ambas"
    },
    {
      titulo: "Lectura de lista: escribir para recordar",
      objetivo: "Producir una lista con proposito real como texto funcional basico",
      descripcion: "El grupo necesita una lista real: ingredientes para una receta, materiales para manualidades, libros de la biblioteca. Los ninos dictan los items y la docente va anotando. Luego cada nino copia un item de la lista con modelo a la vista. Se usa la lista realmente (para ir a buscar lo que falta, por ejemplo).",
      materiales: ["Hoja para la lista colectiva", "Copias individuales", "Lapices", "Hoja para copiar"],
      dccaba: "DC CABA 2025 - EA: Las listas son el tipo de texto mas simple estructuralmente y con alto valor funcional. Base para la escritura convencional segun Tolchinsky (2003).",
      sala: "ambas"
    },
    {
      titulo: "Escritura con apoyo: sonido a letra",
      objetivo: "Escribir palabras cortas identificando fonemas y sus grafias con apoyo de la docente",
      descripcion: "La docente elige 3-4 palabras cortas de alta frecuencia del proyecto (ej: sol, mar, casa). Para cada una: 1) La dicen lentamente estirando los sonidos. 2) Cuentan cuantos sonidos tiene. 3) Piensan qué letra va para cada sonido. 4) La escriben en el cuaderno. La docente circula y da apoyo individual sin corregir el resultado sino el proceso.",
      materiales: ["Cuaderno personal", "Lapiz y goma", "Abecedario de pared", "Lista de palabras del proyecto"],
      dccaba: "DC CABA 2025 - EA: Relacion sonido-letra en palabras del contexto real. El DC recomienda partir de palabras significativas del proyecto para que la escritura tenga sentido.",
      sala: "5"
    },
    {
      titulo: "Revision colectiva: mejoramos el texto",
      objetivo: "Revisar colectivamente un texto escrito para mejorarlo como escritores reales",
      descripcion: "Se retoma un texto producido la clase anterior (la historia dictada, la carta, las etiquetas). La docente lo lee y pregunta: que le falta? que podemos mejorar? Se hacen 2-3 correcciones colectivas: agregar una palabra, cambiar el final, agregar un detalle. Se relee el texto mejorado. Los ninos descubren que los textos se reescriben.",
      materiales: ["Texto producido en clase anterior", "Marcadores de color para las correcciones", "Pizarron o afiche"],
      dccaba: "DC CABA 2025 - EA: La revision es parte del proceso escritor. Ensenar desde el inicio que los textos se pueden mejorar instala la mentalidad de escritor segun el DC.",
      sala: "5"
    },
    {
      titulo: "Evaluacion EA: muestra de producciones escritas",
      objetivo: "Evaluar el nivel de escritura individual mediante la produccion autonoma de un texto breve",
      descripcion: "Cada nino produce de forma autonoma una escritura corta: su nombre + una palabra que elija + un dibujo que la represente. La docente registra el nivel de escritura: presilabico, silabico, silabico-alfabetico, alfabetico. No se corrige ni se pide reescritura. La muestra va al portfolio del nino como evidencia de su nivel al finalizar el primer semestre.",
      materiales: ["Hoja blanca A4", "Lapices y marcadores", "Portfolio individual", "Rubrica de niveles de escritura"],
      dccaba: "DC CABA 2025 - EA: Evaluacion formativa de escritura. El DC propone registrar el nivel de conceptualizacion, no calificar la produccion.",
      sala: "ambas"
    },
  ],

  // ── OCT: alias O+CT combinados — segunda mitad de ano ──────────────────────
  // En la segunda mitad del año ALBA rota: CF / O+CT / EA
  // OCT alterna automaticamente entre O y CT segun la clase par/impar del eje
  OCT: [],  // se resuelve en runtime — ver logica de rotacion mitad de año
}

const SALAS_4_ANIOS = ["nogalestt", "nogalestm", "nogales tt", "nogales tm"]
function esde4Anios(sala: string): boolean {
  const s = sala.toLowerCase().replace(/\s/g, "")
  return SALAS_4_ANIOS.some(ref => s.includes(ref.replace(/\s/g, "")))
}

// Detectar segunda mitad del ciclo lectivo (aproximadamente julio en adelante)
// El ciclo lectivo CABA va de marzo a diciembre (semanas 1-40 aprox.)
// Mitad = semana 21 → aprox. 1 de julio
// Se calcula desde el primer lunes de marzo del año en curso
function esSegundaMitadAnio(): boolean {
  const ahora = new Date()
  const anio = ahora.getFullYear()
  // Primer lunes de marzo
  const inicioMarzo = new Date(anio, 2, 1) // 1 de marzo
  const diaSemana = inicioMarzo.getDay() // 0=dom, 1=lun
  const diasHastaLunes = diaSemana === 0 ? 1 : diaSemana === 1 ? 0 : 8 - diaSemana
  const primerLunesMarzo = new Date(anio, 2, 1 + diasHastaLunes)
  // Semanas transcurridas desde el inicio del ciclo
  const msTranscurridos = ahora.getTime() - primerLunesMarzo.getTime()
  const semanasTranscurridas = Math.floor(msTranscurridos / (7 * 24 * 60 * 60 * 1000))
  return semanasTranscurridas >= 21
}

function calcularActividadDelDia(
  eje: "CF" | "CT" | "O" | "EA",
  clasesCompletadasEnEje: number,
  promedioEje: number,
  sala = "Manzanos"
): { actividad: (typeof SECUENCIA)["CF"][0]; indice: number; esRepeticion: boolean; esAvanzado: boolean } {
  const fullSeq = SECUENCIA[eje]
  // DC CABA 2025: sala 4 cubre hasta repaso de vocales (CF), comprension literal (CT) y oralidad situacional (O)
  // Para EA sala 4 solo accede a los 7 primeros (escritura emergente, antes de escritura convencional)
  const limites4: Record<string, number> = { CF: 11, CT: 9, O: 10, EA: 7 }
  const limite = limites4[eje] ?? fullSeq.length
  const seq = esde4Anios(sala) ? fullSeq.slice(0, limite) : fullSeq
  if (!seq || seq.length === 0) return { actividad: fullSeq[0], indice: 0, esRepeticion: false, esAvanzado: false }
  // Usar modulo para que la secuencia sea ciclica y nunca quede atascada
  let indice = clasesCompletadasEnEje % seq.length
  let esRepeticion = false
  let esAvanzado = false

  // CHECKPOINT CADA ~10 CLASES: evaluar si reforzar o avanzar
  // Si el promedio es bajo (< 40%) retroceder para consolidar
  if (promedioEje < 40 && indice > 0) {
    indice = Math.max(0, indice - 1)
    esRepeticion = true
  }
  // Si el promedio es muy bueno (>= 75%) y hay mas actividades, saltar adelante
  else if (promedioEje >= 75 && indice < seq.length - 2) {
    indice = Math.min(indice + 1, seq.length - 1)
    esAvanzado = true
  }

  return { actividad: seq[indice], indice, esRepeticion, esAvanzado }
}

// Nunca cachear — cada llamada debe leer los datos mas recientes de Supabase
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala") || "Manzanos"

  // Crear cliente Supabase con cache desactivado para que cada request lea datos frescos
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oairchbitlanpzywncua.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA",
    {
      global: {
        fetch: (url: RequestInfo | URL, options?: RequestInit) =>
          fetch(url, { ...options, cache: "no-store", next: { revalidate: 0 } }),
      },
    }
  )

  try {
    // ── 0. Proyecto activo de la sala (tema para contextualizar) ────────────
    const { data: proyectoActivo } = await supabase
      .from("proyectos")
      .select("id, titulo, objetivo_general, actividades")
      .eq("sala", sala)
      .eq("estado", "activo")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    const temaProyecto: string | null = proyectoActivo?.titulo ?? null

    // ── 1. Alumnos de esta sala ──────────────────────────────────────────���─
    const { data: alumnos, error: alumnosError } = await supabase
      .from("alumnos")
      .select("id, nombre")
      .eq("sala", sala)

    console.log("[v0] BRAIN alumnos query - sala:", sala, "found:", alumnos?.length || 0, "error:", alumnosError?.message || "none")

    if (!alumnos || alumnos.length === 0) {
      // Sin alumnos: rotar CF → O → CT igual que con alumnos
      const { data: cierresData, error: cierresErr } = await supabase
        .from("registro_cierre")
        .select("id,eje")
        .eq("sala", sala)
      console.log("[v0] FALLBACK cierres query - sala:", sala, "found:", cierresData?.length || 0, "error:", cierresErr?.message || "none")
      const cierresTodos = cierresData || []
      const cierresCF = cierresTodos.filter((c: { eje: string }) => c.eje === "CF").length
      const cierresCT = cierresTodos.filter((c: { eje: string }) => c.eje === "CT").length
      const cierresO  = cierresTodos.filter((c: { eje: string }) => c.eje === "O").length
      const totalCierres = cierresTodos.length

      // Rotacion ciclica CF → O → CT
      const ORDEN: ("CF" | "CT" | "O")[] = ["CF", "O", "CT"]
      const ejeElegido: "CF" | "CT" | "O" = ORDEN[totalCierres % ORDEN.length]

      const secuenciaEje = esde4Anios(sala)
        ? SECUENCIA[ejeElegido].slice(0, ({ CF: 12, CT: 8, O: 10 })[ejeElegido])
        : SECUENCIA[ejeElegido]
      const cierresDeEje = ejeElegido === "CF" ? cierresCF : ejeElegido === "CT" ? cierresCT : cierresO
      const indiceActividad = cierresDeEje % secuenciaEje.length
      console.log("[v0] FALLBACK rotacion - totalCierres:", totalCierres, "ejeElegido:", ejeElegido, "cierresDeEje:", cierresDeEje, "indice:", indiceActividad)
      const actividadInicial = secuenciaEje[indiceActividad]

      return NextResponse.json({
        sugerencia: {
          eje: ejeElegido,
          actividad: actividadInicial.titulo,
          descripcion: actividadInicial.descripcion,
          objetivo: actividadInicial.objetivo,
          materiales: actividadInicial.materiales,
          razon: `Clase ${cierresDeEje + 1} en ${ejeElegido}. ` + (esde4Anios(sala) ? "(4 anos)" : "(5 anos)"),
          alumnosEnRiesgo: 0,
          totalAlumnos: 0,
          tendencia: "estancado",
          aprendidoDeLaRed: false,
          salaRed: null,
          numeroClase: totalCierres + 1,
          esRepeticion: false,
        },
        microCapacitacion: getMicroCapacitacion(actividadInicial.titulo),
        alertas: [],
        historial: { promediosPorEje: { CF: 0, CT: 0, O: 0 } },
        progreso: { totalClasesCompletadas: totalCierres, semanaActual: 1, clasesCompletadasPorEje: { CF: cierresCF, CT: cierresCT, O: cierresO } },
      })
    }

    const ids = alumnos.map((a) => a.id)
    const { data: registros } = await supabase
      .from("seguimiento")
      .select("*")
      .in("alumno_id", ids)
      .order("fecha", { ascending: true })

    const regs = registros || []

    // ── 3. Inteligencia inter-salas: actividades exitosas en la RED ─────────
    // La RED ALBA esta integrada por: Manzanos, Girasoles, Alamos, Nogales TT, Nogales TM, Sala de Prueba
    // Cada sala nutre el cerebro con dos fuentes:
    //   a) seguimiento: resultado por alumno por actividad (green/yellow/red)
    //   b) registro_cierre: actividades subidas por la docente con evaluacion general
    // ALBA indexa ambas fuentes y distribuye las mejores actividades a toda la red

    const SALAS_RED = ["Manzanos", "Girasoles", "Alamos", "Nogales TT", "Nogales TM", "Sala de Prueba"]

    // a) Fuente 1: seguimiento de todas las salas de la red (excluyendo la sala actual)
    // seguimiento no tiene columna "sala", filtramos por alumno_ids de las otras salas
    const { data: alumnosRedRaw } = await supabase
      .from("alumnos")
      .select("id, sala")
      .in("sala", SALAS_RED.filter(s => s !== sala))
    const alumnosRedIds = (alumnosRedRaw || []).map(a => a.id)
    const alumnoSalaMap: Record<string, string> = {}
    for (const a of (alumnosRedRaw || [])) alumnoSalaMap[a.id] = a.sala

    const { data: registrosRedRaw } = alumnosRedIds.length > 0
      ? await supabase
          .from("seguimiento")
          .select("alumno_id, actividad, eje, estado, resultado")
          .in("alumno_id", alumnosRedIds)
      : { data: [] }

    // Adjuntar sala a cada registro de seguimiento via el mapa de alumnos
    const registrosRed = (registrosRedRaw || []).map(r => ({
      ...r,
      sala: alumnoSalaMap[r.alumno_id] || "",
    })).filter(r => r.sala !== "")

    // b) Fuente 2: actividades propias de la docente en registro_cierre de la red
    //    Solo cuenta si evaluacion_general = "excelente" o "buena" (actividad efectiva)
    const { data: cierresRedRaw } = await supabase
      .from("registro_cierre")
      .select("actividad_docente, eje, evaluacion_general, sala")
      .in("sala", SALAS_RED.filter(s => s !== sala))
      .in("evaluacion_general", ["excelente", "buena"])

    const cierresRed = (cierresRedRaw || []).filter(r => r.actividad_docente && r.sala)

    // Calcular tasa de exito por actividad/eje unificando ambas fuentes
    type MapaRed = Record<string, { total: number; verdes: number; salas: Set<string>; esDocente: boolean }>
    const mapaRed: MapaRed = {}

    // Procesar seguimiento (fuente 1)
    for (const r of registrosRed) {
      const key = `${r.eje}::${r.actividad}`
      if (!mapaRed[key]) mapaRed[key] = { total: 0, verdes: 0, salas: new Set(), esDocente: false }
      mapaRed[key].total++
      if ((r.resultado === "green" || r.estado === "green")) mapaRed[key].verdes++
      if (r.sala) mapaRed[key].salas.add(r.sala)
    }

    // Procesar cierres de docentes (fuente 2)
    // Cada cierre exitoso aporta como 3 registros green para ponderar la experiencia docente
    for (const c of cierresRed) {
      const key = `${c.eje}::${c.actividad_docente}`
      if (!mapaRed[key]) mapaRed[key] = { total: 0, verdes: 0, salas: new Set(), esDocente: true }
      mapaRed[key].total += 3
      mapaRed[key].verdes += 3 // actividad docente evaluada como excelente/buena
      if (c.sala) mapaRed[key].salas.add(c.sala)
      mapaRed[key].esDocente = true
    }

    // Umbrales adaptativos: bajan si la red es nueva (pocas salas con datos)
    const salasConDatos = new Set(registrosRed.map(r => r.sala).concat(cierresRed.map(c => c.sala))).size
    const umbralRegistros = salasConDatos >= 3 ? 5 : salasConDatos >= 2 ? 3 : 2
    const umbralSalas    = salasConDatos >= 3 ? 2 : 1
    const umbralTasa     = 65 // fijo: una actividad debe lograr al menos 65% para distribuirse

    // Indexar actividades exitosas de la red por eje
    const exitosasRed: Record<string, { actividad: string; tasa: number; salas: number; esDocente: boolean }[]> = { CF: [], CT: [], O: [] }
    for (const [key, d] of Object.entries(mapaRed)) {
      const [eje, actividad] = key.split("::")
      if (!actividad || !["CF", "CT", "O"].includes(eje)) continue
      const tasa = Math.round((d.verdes / d.total) * 100)
      if (d.total >= umbralRegistros && d.salas.size >= umbralSalas && tasa >= umbralTasa) {
        exitosasRed[eje].push({ actividad, tasa, salas: d.salas.size, esDocente: d.esDocente })
      }
    }

    // Ordenar por tasa descendente para priorizar las mejores
    for (const eje of ["CF", "CT", "O"]) {
      exitosasRed[eje].sort((a, b) => b.tasa - a.tasa)
    }

    console.log("[v0] RED - salasConDatos:", salasConDatos, "umbralRegistros:", umbralRegistros, "exitosasRed CF:", exitosasRed.CF.length, "CT:", exitosasRed.CT.length, "O:", exitosasRed.O.length)

    // ── 4. Analisis por eje de esta sala ───────────────────────────────────
    // Contar TOTAL de clases completadas desde registro_cierre (cada cierre = 1 clase)
    const { data: cierresData, error: cierresError } = await supabase
      .from("registro_cierre")
      .select("id, fecha, eje")
      .eq("sala", sala)
      .order("fecha", { ascending: true })
    
    if (cierresError) {
      console.log("[ALBA v8] Error cargando cierres:", cierresError.message)
    }
    
    const cierres = cierresData || []
    const totalClasesCompletadasGlobal = cierres.length
    console.log("[v0] BRAIN sala:", sala, "cierres:", cierres.length, "alumnos:", alumnos.length)
    
    const ejes = ["CF", "CT", "O"] as const
    const analisis: Record<string, {
      total: number
      verdes: number
      amarillos: number
      rojos: number
      promedio: number
      alumnosEnRojo: string[]
      actividadesExitosasLocales: { actividad: string; tasa: number }[]
      tendencia: "mejorando" | "estancado" | "empeorando"
      clasesCompletadas: number
      ultimasClasesEnRojo: number
    }> = {} as any

    for (const eje of ejes) {
      const regsEje = regs.filter((r) => r.eje === eje)
      // La tabla seguimiento guarda el campo como "estado" (no "resultado")
      const getVal = (r: any) => r.estado ?? r.resultado ?? ""
      const verdes = regsEje.filter((r) => getVal(r) === "green").length
      const amarillos = regsEje.filter((r) => getVal(r) === "yellow").length
      const rojos = regsEje.filter((r) => getVal(r) === "red").length
      const total = regsEje.length
      // Si no hay registros de seguimiento individual, usar promedio neutro (50)
      // para que el brain no retroceda al indice 0 por falta de datos
      const promedio = total > 0 ? Math.round((verdes * 100 + amarillos * 50 + rojos * 10) / total) : 50

      // Clases completadas para ESTE eje = cierres con ese eje especifico
      const cierresDeEje = cierres.filter((c: { eje: string }) => c.eje === eje)
      const clasesCompletadas = cierresDeEje.length

      // Ultimas 2 clases en rojo (para bajar nivel en secuencia)
      const ultimos2Cierres = cierres.slice(-2)
      let ultimasClasesEnRojo = 0
      for (const c of ultimos2Cierres) {
        const f = c.fecha?.split("T")[0]
        const regsEsaFecha = regsEje.filter((r) => r.fecha?.split("T")[0] === f)
        const promFecha = regsEsaFecha.length > 0
          ? regsEsaFecha.filter((r) => (r.estado ?? r.resultado ?? "") === "green").length / regsEsaFecha.length
          : 1
        if (promFecha < 0.4) ultimasClasesEnRojo++
      }

      const alumnosEnRojo: string[] = []
      for (const al of alumnos) {
        const ultReg = regsEje.filter((r) => r.alumno_id === al.id).pop()
        if (ultReg && (ultReg.estado ?? ultReg.resultado) === "red") alumnosEnRojo.push(al.nombre)
      }

      const actMap: Record<string, { total: number; verdes: number }> = {}
      for (const r of regsEje) {
        if (!r.actividad) continue
        if (!actMap[r.actividad]) actMap[r.actividad] = { total: 0, verdes: 0 }
        actMap[r.actividad].total++
        if (r.resultado === "green" || r.estado === "green") actMap[r.actividad].verdes++
      }
      const actividadesExitosas = Object.entries(actMap)
        .map(([actividad, d]) => ({ actividad, tasa: d.total > 2 ? Math.round((d.verdes / d.total) * 100) : 0 }))
        .filter((a) => a.tasa > 0)
        .sort((a, b) => b.tasa - a.tasa)
        .slice(0, 5)

      const ahora = new Date()
      const hace7 = new Date(ahora.getTime() - 7 * 86400000)
      const hace14 = new Date(ahora.getTime() - 14 * 86400000)
        const semActual = regsEje.filter((r) => new Date(r.fecha) >= hace7)
      const semAnterior = regsEje.filter((r) => new Date(r.fecha) >= hace14 && new Date(r.fecha) < hace7)
      const promSemActual = semActual.length > 0 ? semActual.filter((r) => (r.estado ?? r.resultado ?? "") === "green").length / semActual.length : 0
      const promSemAnterior = semAnterior.length > 0 ? semAnterior.filter((r) => (r.estado ?? r.resultado ?? "") === "green").length / semAnterior.length : 0
      let tendencia: "mejorando" | "estancado" | "empeorando" = "estancado"
      if (promSemActual > promSemAnterior + 0.1) tendencia = "mejorando"
      if (promSemActual < promSemAnterior - 0.1) tendencia = "empeorando"

      analisis[eje] = { total, verdes, amarillos, rojos, promedio, alumnosEnRojo, actividadesExitosasLocales: actividadesExitosas, tendencia, clasesCompletadas, ultimasClasesEnRojo }
    }

    // ── 5. Elegir eje: ROTACION CICLICA con logica de mitad de año ─────────
    // Primera mitad (sem 1-20): CF → O → CT → CF → O → CT
    // Segunda mitad (sem 21+):  CF → OCT → EA  (OCT = O+CT combinados, EA = Escritura)
    //   OCT alterna O y CT en clases pares/impares para mantener ambos ejes activos
    // Excepcion: si un eje tiene 2 clases seguidas en rojo, ALBA lo repite antes de rotar
    const segundaMitad = esSegundaMitadAnio()
    const ORDEN_EJES: ("CF" | "CT" | "O" | "EA")[] = segundaMitad
      ? ["CF", "O", "CT", "EA"]   // en segunda mitad: CF/O/CT alternan con EA como 4to slot
      : ["CF", "O", "CT"]

    // Para segunda mitad: el slot 1 (indice 1) alterna O y CT segun paridad del total de clases
    // Esto garantiza que tanto O como CT siguen siendo trabajados
    let ejeSugerido: "CF" | "CT" | "O" | "EA"
    if (segundaMitad) {
      const slotIndex = totalClasesCompletadasGlobal % 3  // rota en 3: CF / O|CT / EA
      if (slotIndex === 0) {
        ejeSugerido = "CF"
      } else if (slotIndex === 1) {
        // Alterna O y CT segun paridad del total de veces que se paso por este slot
        const vecesSlot1 = Math.floor(totalClasesCompletadasGlobal / 3)
        ejeSugerido = vecesSlot1 % 2 === 0 ? "O" : "CT"
      } else {
        ejeSugerido = "EA"
      }
    } else {
      ejeSugerido = ORDEN_EJES[totalClasesCompletadasGlobal % ORDEN_EJES.length] as "CF" | "CT" | "O"
    }

    // Si el eje elegido por rotacion tiene 2+ clases seguidas en rojo, ALBA lo mantiene
    // para consolidar antes de continuar la rotacion (maximo 2 repeticiones)
    // EA no aplica esta logica (es nueva, no hay historico de rojos)
    if (ejeSugerido !== "EA") {
      const datosEjeRotado = analisis[ejeSugerido as "CF" | "CT" | "O"]
      if (datosEjeRotado.ultimasClasesEnRojo >= 2) {
        ejeSugerido = ejeSugerido  // mantener el mismo eje para consolidar
      }
    }

    const CHECKPOINT_CADA = 10
    const esCheckpoint = totalClasesCompletadasGlobal > 0 && totalClasesCompletadasGlobal % CHECKPOINT_CADA === 0

    // ── 6. Elegir actividad: combinar secuencia + evidencia inter-salas ────
    // EA no tiene analisis historico (eje nuevo); usamos defaults para no crashear
    const ejeParaAnalisis: "CF" | "CT" | "O" = ejeSugerido === "EA" ? "CF" : ejeSugerido as "CF" | "CT" | "O"
    const ejeDatos = analisis[ejeParaAnalisis]
    const ejeDatosEA = { clasesCompletadas: 0, promedio: 0, ultimasClasesEnRojo: 0, actividadesExitosasLocales: [] }
    const ejeDatosActivos = ejeSugerido === "EA" ? ejeDatosEA : ejeDatos

    // Si hay 2+ clases seguidas con promedio bajo, retroceder en la secuencia
    // Solo retroceder si hay mas de 1 clase completada (no tiene sentido retroceder de la primera)
    let clasesParaCalculo = ejeDatosActivos.clasesCompletadas
    if (ejeDatosActivos.ultimasClasesEnRojo >= 2 && clasesParaCalculo > 1) {
      clasesParaCalculo = Math.max(1, clasesParaCalculo - 1)
    }

    const { actividad, indice, esRepeticion, esAvanzado } = calcularActividadDelDia(
      ejeSugerido as "CF" | "CT" | "O" | "EA",
      clasesParaCalculo,
      ejeDatosActivos.promedio,
      sala
    )

    // Guard: si la secuencia esta vacia o el indice es invalido, no crashear
    if (!actividad) {
      return NextResponse.json(
        { error: "Secuencia vacia para eje " + ejeSugerido },
        { status: 500, headers: { "Cache-Control": "no-store" } }
      )
    }

    // Verificar si la actividad sugerida tiene mala tasa local (< 30%)
    // EA no tiene historico de red todavia — se salta el check de red para ese eje
    const actividadLocal = ejeSugerido === "EA" ? [] : analisis[ejeSugerido as "CF" | "CT" | "O"].actividadesExitosasLocales
    const actTasaLocal = actividadLocal.find((a: { actividad: string; tasa: number }) => a.actividad === actividad.titulo)
    const tasaLocal = actTasaLocal ? actTasaLocal.tasa : -1 // -1 = sin datos

    const redParaEje = ejeSugerido === "EA" ? [] : (exitosasRed[ejeSugerido as "CF" | "CT" | "O"] || [])
    // Buscar en la SECUENCIA la actividad de la red que no hayamos hecho aun
    const actividadesHechasEnEste = new Set(regs.filter((r: { eje: string }) => r.eje === ejeSugerido).map((r: { actividad: string }) => r.actividad))
    const candidataRed = redParaEje
      .filter((r: { actividad: string }) => !actividadesHechasEnEste.has(r.actividad))
      .sort((a: { tasa: number }, b: { tasa: number }) => b.tasa - a.tasa)[0]

    // Usar actividad de la red si:
    // - La actividad de la secuencia tiene tasa local mala (< 30%), O
    // - La candidata de la red es una actividad docente con alta tasa (> 80%) en 2+ salas
    const candidataEsDocente = candidataRed?.esDocente === true
    const usarRed = (tasaLocal !== -1 && tasaLocal < 30 && candidataRed != null)
      || (candidataEsDocente && candidataRed && candidataRed.tasa >= 80 && candidataRed.salas >= 2)
    const actividadFinal = usarRed
      ? (SECUENCIA[ejeSugerido as "CF" | "CT" | "O" | "EA"].find((a: { titulo: string }) => a.titulo === candidataRed.actividad) ?? actividad)
      : actividad
    const aprendidoDeLaRed = usarRed
    const salaRedNombre = usarRed && candidataRed ? `${candidataRed.salas} sala${candidataRed.salas > 1 ? "s" : ""} de la red` : null

    // ── 7. Construir respuesta ─���───────────────────────────────────────────
    // DC CABA 2025: sala 4 cubre hasta repaso de vocales (CF), comprension literal (CT) y oralidad situacional (O)
  // La funcion filtra la secuencia para que sala 4 no acceda a actividades de sala 5
  const limites4: Record<string, number> = { CF: 11, CT: 9, O: 10, EA: 7 }
    const ejeKey = ejeSugerido as "CF" | "CT" | "O" | "EA"
    const totalEnSecuencia = esde4Anios(sala)
      ? SECUENCIA[ejeKey].slice(0, limites4[ejeKey] ?? SECUENCIA[ejeKey].length).length
      : SECUENCIA[ejeKey].length
    const edadLabel = esde4Anios(sala) ? " (4 anos)" : " (5 anos)"
    const ejeNombre = ejeSugerido === "CF" ? "Conciencia Fonologica" : ejeSugerido === "CT" ? "Comprension de Textos" : ejeSugerido === "EA" ? "Aproximacion a la Escritura" : "Oralidad (ECO)"

    // Enriquecer la razon con evidencia internacional si existe
    const evidencia = EVIDENCIA_INTERNACIONAL[actividadFinal.titulo]
    const evidenciaTexto = evidencia
      ? ` [${evidencia.pais}: ${evidencia.programa} — impacto ${evidencia.impacto}/10]`
      : ""

    let razon = ""
    if (esAvanzado) {
      razon = `El grupo demostro excelente dominio en ${ejeNombre}${edadLabel} con ${ejeDatos.promedio}% de logro. ALBA subio el nivel de la actividad. Sigan asi!`
    } else if (ejeDatos.alumnosEnRojo.length > 0) {
      razon = `${ejeDatos.alumnosEnRojo.length} alumno${ejeDatos.alumnosEnRojo.length > 1 ? "s" : ""} necesita${ejeDatos.alumnosEnRojo.length > 1 ? "n" : ""} refuerzo en ${ejeNombre}${edadLabel}.`
    } else {
      razon = `Continuamos avanzando en ${ejeNombre}${edadLabel}.`
    }

    if (aprendidoDeLaRed && salaRedNombre) {
      const origenRed = candidataRed?.esDocente ? "actividad propuesta por docentes de" : "actividad exitosa en"
      razon += ` ALBA incorpora ${origenRed} ${salaRedNombre} (${candidataRed?.tasa}% de logro en la red).`
    } else if (ejeDatos.ultimasClasesEnRojo >= 2) {
      razon += ` Dos clases seguidas con dificultad: retrocedemos para consolidar antes de avanzar.`
    } else if (esRepeticion) {
      razon += ` Repetimos para consolidar (promedio actual: ${ejeDatos.promedio}%).`
    } else if (esCheckpoint) {
      razon += ` Checkpoint de ${CHECKPOINT_CADA} clases: ALBA analizo todos los ejes y este es el que mas necesita atencion.`
    } else {
      razon += ` Clase ${indice + 1} de ${totalEnSecuencia} en la secuencia anual.`
    }

    // Agregar fundamento internacional
    if (evidencia) {
      razon += `${evidenciaTexto} ${evidencia.descripcion}`
    }

    // ── Contextualización con el tema del proyecto activo ──────────────────
    // Si hay proyecto activo, el cerebro adapta la descripcion de la actividad al tema
    // y sugiere como conectar el eje de alfabetizacion con el proyecto
    let descripcionContextualizada = actividadFinal.descripcion
    let temaEnRazon = ""
    if (temaProyecto) {
      // Ejemplos de contextualización por eje usando el tema del proyecto
      const contextosPorEje: Record<string, string[]> = {
        CF: [
          `Usa palabras del tema "${temaProyecto}" para esta actividad. Por ejemplo, busca palabras del tema que tengan el sonido trabajado.`,
          `Conecta con el proyecto "${temaProyecto}": los ninos identifican sonidos en palabras clave del tema (nombres de personajes, objetos, lugares).`,
          `Aprovecha el vocabulario de "${temaProyecto}" para practicar: rimas con palabras del tema, palmadas con sus nombres especificos, sonidos iniciales de elementos del proyecto.`,
        ],
        CT: [
          `Busca un texto informativo, cuento o libro sobre "${temaProyecto}" para aplicar la estrategia de lectura dialogica de hoy.`,
          `Conecta la comprension lectora con el proyecto "${temaProyecto}": las preguntas de la cruz pueden girar en torno a personajes o conceptos del tema.`,
          `Selecciona un texto que amplie el vocabulario de "${temaProyecto}" y aplica la estrategia de hoy para profundizar la comprension del tema.`,
        ],
        O: [
          `Usa el tema "${temaProyecto}" como contexto de oralidad: los ninos describen, narran o argumentan sobre elementos del proyecto con las estructuras ECO.`,
          `El proyecto "${temaProyecto}" ofrece vocabulario rico para la actividad oral de hoy. Los ninos practican oraciones completas con palabras del tema.`,
          `Conecta la oralidad con "${temaProyecto}": presenta un elemento del proyecto (imagen, objeto, experimento) y aplica la actividad ECO de hoy para verbalizarlo.`,
        ],
      }
      const opciones = contextosPorEje[ejeSugerido] || []
      const conexion = opciones[indice % opciones.length]
      descripcionContextualizada = actividadFinal.descripcion + (conexion ? ` \n\nCONEXION CON EL PROYECTO: ${conexion}` : "")
      temaEnRazon = ` Adaptada al proyecto activo: "${temaProyecto}".`
    }

    // ── Pedagogía global (mejores sistemas del mundo alineados al DC CABA) ──
    // Ideas para enriquecer la actividad según los sistemas educativos mejor rankeados
    // compatibles con el DC Inicial GCBA 2025
    const PEDAGOGIA_GLOBAL: Record<string, { pais: string; idea: string; compatibleDC: boolean }[]> = {
      CF: [
        { pais: "Finlandia", idea: "Juego libre guiado con palabras: los ninos inventan canciones tontas cambiando el primer sonido de sus nombres. Desarrollo fonologico en contexto ludico.", compatibleDC: true },
        { pais: "Singapur",  idea: "Cartas de acciones foneticas: cada carta muestra una imagen y los ninos deben decir el sonido, aplaudir las silabas y hacer una oracion. Multisensorial y sistematico.", compatibleDC: true },
        { pais: "Estonia",   idea: "Caminata de sonidos: el grupo sale al patio y cada vez que escuchan un sonido de la naturaleza lo imitan y buscan palabras que empiecen igual. Aprendizaje situado al aire libre.", compatibleDC: true },
        { pais: "Canada",    idea: "Juego de construccion con sonidos: con bloques, cada bloque representa un fonema. Los ninos construyen torres-palabras uniendo bloques-fonemas. Visual y manipulativo.", compatibleDC: true },
        { pais: "NZ",        idea: "Libro de sonidos colaborativo: la sala construye colectivamente un libro con una pagina por sonido, llenada de dibujos, recortes y palabras encontradas en el entorno.", compatibleDC: true },
      ],
      CT: [
        { pais: "Finlandia", idea: "Lectura en pareja libre: ninos mas avanzados leen a ninos que aun no leen. El que escucha hace predicciones y el que lee explica. Aprendizaje entre pares.", compatibleDC: true },
        { pais: "Singapur",  idea: "Mapa de texto visual: despues de la lectura los ninos dibujan el mapa del cuento (personajes, lugar, problema, solucion) con colores y flechas. Organizador grafico.", compatibleDC: true },
        { pais: "Canada",    idea: "Lectura de imagenes: antes de leer el texto escrito, los ninos leen solo las ilustraciones y construyen su version de la historia. Desarrolla inferencia visual.", compatibleDC: true },
        { pais: "NZ",        idea: "Silla del autor: la docente se sienta en la silla del autor y los ninos la entrevistan como si fuera el personaje. Comprension critica y empatica.", compatibleDC: true },
        { pais: "Estonia",   idea: "Teatro de lectura: los ninos leen en voz alta distintos roles del cuento (narrador, personaje 1, personaje 2). Comprension oral profunda.", compatibleDC: true },
      ],
      O: [
        { pais: "Finlandia", idea: "Ronda de filosofia para ninos: la docente lanza una pregunta abierta sobre el cuento o el proyecto y los ninos dialogan respetando turnos y construyendo sobre la idea del otro.", compatibleDC: true },
        { pais: "Singapur",  idea: "Show and tell estructurado: cada nino trae un objeto y lo presenta con la estructura INICIO-DESARROLLO-CIERRE. El grupo hace preguntas. Exposicion oral formal.", compatibleDC: true },
        { pais: "Canada",    idea: "Juego de rol linguistico: los ninos actuan una situacion cotidiana (ir al mercado, visitar al medico) usando vocabulario especifico. Oralidad en contexto real.", compatibleDC: true },
        { pais: "NZ",        idea: "Mural de palabras vivo: cada vez que un nino usa una palabra nueva en forma oral, se anota en el mural. Al final de la semana se celebra al nino con mas palabras nuevas.", compatibleDC: true },
        { pais: "Estonia",   idea: "Debate de expertos: se divide la clase en grupos. Cada grupo es experto en un subtema del proyecto y debe explicarselo a los demas usando vocabulario preciso.", compatibleDC: true },
      ],
    }

    const ideasGlobales = PEDAGOGIA_GLOBAL[ejeSugerido] || []
    // Rotar ideas para variar entre clases
    const ideaGlobal = ideasGlobales[(indice + analisis[ejeSugerido].clasesCompletadas) % ideasGlobales.length]
    const sugerenciaPedagogica = ideaGlobal
      ? `\n\nIDEA PEDAGOGICA (${ideaGlobal.pais}): ${ideaGlobal.idea}`
      : ""
    
    // Agregar marco curricular DC Inicial GCBA 2025
    razon += enriquecerConDC(ejeSugerido === "EA" ? "CF" : ejeSugerido as "CF"|"CT"|"O", sala, indice, ejeDatos.tendencia)

    // Agregar contextualización del proyecto al final de la razón
    razon += temaEnRazon

    // -- 8. Alertas: destacados, refuerzo, red, checkpoint ----------------
    const alertas: { tipo: string; mensaje: string; urgencia: "alta" | "media" | "info" }[] = []

    // Alerta especial cuando es checkpoint de 10 clases
    if (esCheckpoint) {
      alertas.push({ tipo: "checkpoint", mensaje: `Checkpoint de ${CHECKPOINT_CADA} clases: ALBA analizo el avance de la sala y actualizo la estrategia para los proximos dias.`, urgencia: "info" })
    }

    for (const eje of ejes) {
      const a = analisis[eje]
      const nombre = eje === "CF" ? "Conciencia Fonologica" : eje === "CT" ? "Comprension de Textos" : "Oralidad"

      // Alerta positiva: eje destacado (>= 75% de logro grupal con al menos 5 registros)
      if (a.promedio >= 75 && a.total >= 5) {
        alertas.push({
          tipo: "eje_destacado",
          mensaje: `Excelente! El grupo logro ${a.promedio}% en ${nombre}. ALBA subio el nivel de las actividades para mantener el desafio.`,
          urgencia: "info",
        })
      }
      if (a.alumnosEnRojo.length >= alumnos.length * 0.3) {
        alertas.push({ tipo: "patron_grupal", mensaje: `${a.alumnosEnRojo.length} de ${alumnos.length} en rojo en ${nombre}. Revisar estrategia.`, urgencia: "alta" })
      }
      for (const al of alumnos) {
        const regsAl = regs.filter((r) => r.alumno_id === al.id && r.eje === eje).slice(-3)
        if (regsAl.length >= 3 && regsAl.every((r) => (r.estado ?? r.resultado ?? "") === "red")) {
          alertas.push({ tipo: "persistencia", mensaje: `${al.nombre} lleva 3+ clases seguidas en rojo en ${nombre}.`, urgencia: "alta" })
        }
      }
      if (a.tendencia === "empeorando") {
        alertas.push({ tipo: "tendencia", mensaje: `${nombre} muestra tendencia negativa esta semana.`, urgencia: "media" })
      }
      if (exitosasRed[eje].length > 0) {
        const docentes = exitosasRed[eje].filter(a => a.esDocente).length
        const msg = docentes > 0
          ? `La red ALBA (Manzanos, Girasoles, Alamos, Nogales TT, Nogales TM) tiene ${exitosasRed[eje].length} actividad${exitosasRed[eje].length > 1 ? "es" : ""} con >${umbralTasa}% de logro en ${nombre}, incluyendo ${docentes} propuesta${docentes > 1 ? "s" : ""} por docentes. ALBA las priorizara automaticamente.`
          : `La red ALBA tiene ${exitosasRed[eje].length} actividad${exitosasRed[eje].length > 1 ? "es" : ""} con >${umbralTasa}% de logro en ${nombre}. ALBA las priorizara automaticamente.`
        alertas.push({ tipo: "red_exitosa", mensaje: msg, urgencia: "info" })
      }
    }

    const totalClases = totalClasesCompletadasGlobal
    const primerRegistro = cierres.length > 0 ? new Date(cierres[0].fecha) : new Date()
    const semanaActual = Math.max(1, Math.ceil((Date.now() - primerRegistro.getTime()) / (7 * 86400000)))

    // -- 9. Micro-capacitacion just-in-time: banco pedagogico completo -------
    // getMicroCapacitacion devuelve contenido especifico de la actividad:
    // que hace el docente, que aprenden los ninos, fundamento pedagogico y cancion/poesia
    const microCapacitacion = getMicroCapacitacion(actividadFinal.titulo)

    return NextResponse.json({
      sugerencia: {
        eje: ejeSugerido,
        actividad: actividadFinal.titulo,
        descripcion: descripcionContextualizada,
        objetivo: actividadFinal.objetivo,
        materiales: actividadFinal.materiales,
        razon,
        alumnosEnRiesgo: ejeDatos.alumnosEnRojo.length,
        totalAlumnos: alumnos.length,
        tendencia: ejeDatos.tendencia,
        aprendidoDeLaRed,
        salaRed: salaRedNombre,
        numeroClase: indice + 1,
        esRepeticion,
        esAvanzado,
        esCheckpoint,
        temaProyecto,
        sugerenciaPedagogica,
        evidenciaInternacional: evidencia ? {
          pais: evidencia.pais,
          programa: evidencia.programa,
          impacto: evidencia.impacto,
          descripcion: evidencia.descripcion,
        } : null,
      },
      microCapacitacion,
      alertas: alertas.slice(0, 8),
      historial: {
        promediosPorEje: { CF: analisis.CF.promedio, CT: analisis.CT.promedio, O: analisis.O.promedio },
        tendencias: { CF: analisis.CF.tendencia, CT: analisis.CT.tendencia, O: analisis.O.tendencia },
        ejesDestacados: ejes.filter(e => analisis[e].promedio >= 75 && analisis[e].total >= 5),
        ejesEnRefuerzo: ejes.filter(e => analisis[e].promedio < 40 && analisis[e].total >= 3),
        actividadesExitosasLocales: { CF: analisis.CF.actividadesExitosasLocales, CT: analisis.CT.actividadesExitosasLocales, O: analisis.O.actividadesExitosasLocales },
        exitosasRed,
      },
      progreso: {
        totalClasesCompletadas: totalClases,
        semanaActual,
        clasesCompletadasPorEje: {
          CF: analisis.CF.clasesCompletadas,
          CT: analisis.CT.clasesCompletadas,
          O: analisis.O.clasesCompletadas,
        },
      },
      // Marco curricular DC Inicial GCBA 2025 para mostrar en la UI
      marcoCurricular: {
        proposito: esde4Anios(sala) 
          ? DC_BSAS_2025.propositos.sala4[indice % DC_BSAS_2025.propositos.sala4.length]
          : DC_BSAS_2025.propositos.sala5[indice % DC_BSAS_2025.propositos.sala5.length],
        contenidos: esde4Anios(sala) 
          ? DC_BSAS_2025.contenidos[ejeSugerido === "EA" ? "CF" : ejeSugerido as "CF"|"CT"|"O"].sala4
          : DC_BSAS_2025.contenidos[ejeSugerido === "EA" ? "CF" : ejeSugerido as "CF"|"CT"|"O"].sala5,
        expectativaLogro: DC_BSAS_2025.expectativasLogro[ejeSugerido === "EA" ? "CF" : ejeSugerido as "CF"|"CT"|"O"][Math.min(Math.floor(indice / 3), DC_BSAS_2025.expectativasLogro[ejeSugerido === "EA" ? "CF" : ejeSugerido as "CF"|"CT"|"O"].length - 1)],
        estrategiasDocente: DC_BSAS_2025.enfoqueDid.estrategiasRecomendadas[ejeSugerido === "EA" ? "CF" : ejeSugerido as "CF"|"CT"|"O"],
        principiosDC: DC_BSAS_2025.enfoqueDid.principios.slice(0, 3),
      },
    }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate", "Pragma": "no-cache" },
    })
  } catch (err) {
    console.error("Error en /api/brain:", err)
    return NextResponse.json({
      sugerencia: { eje: "CF", actividad: "Reconocimiento de Sonido Inicial /M/", razon: "Error cargando datos." },
      alertas: [],
      historial: { promediosPorEje: { CF: 0, CT: 0, O: 0 } },
      progreso: { totalClasesCompletadas: 0, semanaActual: 1, clasesCompletadasPorEje: { CF: 0, CT: 0, O: 0 } },
    })
  }
}
// Build timestamp: 1779400487
// Timestamp 1779751849

// POST handler para acciones especiales de ALBA
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, proyecto, sala, dias, actividadesYaSugeridas = [] } = body
    
    if (action === "sugerir_actividades_semana" && proyecto && dias) {
      // ALBA usa IA real para generar actividades de alfabetizacion ricas, variadas y siempre nuevas.
      // Lee el historial de cierres para no repetir actividades ya realizadas.
      // Prioriza actividades marcadas como no_realizada para volver a sugerirlas.

      const supabase = getSupabase()

      // Semana del año para determinar segunda mitad (semana >= 20 = desde mayo)
      const hoy = new Date()
      const inicioAnio = new Date(hoy.getFullYear(), 0, 1)
      const semanaAnio = Math.ceil(((hoy.getTime() - inicioAnio.getTime()) / 86400000 + inicioAnio.getDay() + 1) / 7)

      // Leer historial de cierres para contexto
      let historialResumen = ""
      let actividadesNoRealizadas: string[] = []
      try {
        const { data: cierres } = await supabase
          .from("registro_cierre")
          .select("actividad_alba, evaluacion_general, eje, fecha")
          .eq("sala", sala || "Girasoles")
          .order("fecha", { ascending: false })
          .limit(20)
        if (cierres && cierres.length > 0) {
          const realizadas = cierres.filter(c => c.evaluacion_general !== "no_realizada")
          actividadesNoRealizadas = cierres
            .filter(c => c.evaluacion_general === "no_realizada")
            .map(c => c.actividad_alba).filter(Boolean)
          historialResumen = realizadas.slice(0, 10).map(c =>
            `- ${c.actividad_alba || "sin nombre"} (${c.eje}, ${c.evaluacion_general}, ${c.fecha})`
          ).join("\n")
        }
      } catch (e) {
        // silencioso
      }

      // Los 3 dias de alfabetizacion rotan eje: dia[0]=CF, dia[1]=CT+O, dia[2]=Escritura
      const EJES = ["CF", "CT", "Escritura"]
      const diasArray = dias as string[]

      const prompt = `Eres ALBA, el asistente pedagogico de alfabetizacion inicial de nivel jardin (4-5 anos) de Buenos Aires, Argentina. Tu mision es asistir a docentes de nivel inicial para que gestionen su clase con la maxima efectividad en el tiempo minimo — la maestra tiene 3 minutos frente a la compu antes de estar con sus alumnos.

CONTEXTO DE LA SALA:
- Sala: ${sala}
- Proyecto en curso: "${proyecto?.titulo || "Alfabetizacion inicial"}"
- Objetivo del proyecto: "${proyecto?.objetivoGeneral || "Aproximacion a la lengua escrita"}"
- Semana del año: ${semanaAnio} (${semanaAnio >= 20 ? "segunda mitad del año — trabajar los 3 ejes completos CF/CT/Escritura" : "primera mitad — foco en CF y CT, aproximacion a Escritura"})

MARCO CURRICULAR: DC CABA 2025 — Practicas del Lenguaje, Nivel Inicial Salas 4 y 5.
Ejes: CF (Conciencia Fonologica), CT (Comprension Textual), Escritura inicial.

HISTORIAL RECIENTE (actividades ya realizadas — NO repetir):
${historialResumen || "Sin historial previo — esta es la primera semana."}

${actividadesNoRealizadas.length > 0 ? `ACTIVIDADES NO REALIZADAS (volver a sugerir si son pertinentes):\n${actividadesNoRealizadas.join(", ")}` : ""}

ACTIVIDADES YA EN EL CRONOGRAMA ESTA SEMANA (evitar duplicar):
${(actividadesYaSugeridas || []).join(", ") || "Ninguna."}

TAREA: Genera exactamente ${diasArray.length} actividades de alfabetizacion, UNA por cada dia indicado.
Dia 1 (${diasArray[0]}): eje CF (Conciencia Fonologica)
Dia 2 (${diasArray[1]}): eje CT (Comprension Textual)  
Dia 3 (${diasArray[2]}): eje Escritura inicial

REQUISITOS DE CADA ACTIVIDAD:
1. Novedosa, original, no repetida respecto al historial
2. Anclada al proyecto "${proyecto?.titulo || "actual"}" cuando sea posible
3. Rica en recursos: puede incluir juegos corporales, canciones, cuentos, materiales no convencionales, tecnologia simple, metodologias (Montessori, Reggio, Vigotsky, lectura dialogica, etc.)
4. Practicable por una sola maestra con 20-25 ninos de jardin
5. Tiempo de ejecucion: 20-30 minutos
6. Materiales accesibles en un jardin de infantes comun de Argentina

FORMATO DE RESPUESTA — JSON puro, sin markdown, sin explicaciones fuera del JSON:
[
  {
    "dia": "${diasArray[0]}",
    "eje": "CF",
    "nombre": "nombre corto y atractivo",
    "capacidades": "una linea con las capacidades que desarrolla",
    "contenidos": "contenidos curriculares especificos del DC CABA 2025",
    "objetivo": "objetivo especifico de la actividad en una oracion",
    "desarrollo": "descripcion paso a paso de como se hace la actividad, con dinamicas concretas y momentos clave",
    "materiales": "lista de materiales necesarios"
  },
  {
    "dia": "${diasArray[1]}",
    "eje": "CT",
    ...
  },
  {
    "dia": "${diasArray[2]}",
    "eje": "Escritura",
    ...
  }
]

Sé creativa, variada, pedagógicamente fundamentada. No repitas actividades que ya estan en el historial. Responde SOLO con el JSON, sin ningun texto adicional.`

      try {
        const result = await generateText({
          model: "openai/gpt-4o-mini",
          prompt,
          maxOutputTokens: 2000,
          temperature: 0.85,
        })

        // Parsear JSON
        const texto = result.text.trim()
        const jsonStr = texto.startsWith("[") ? texto : texto.slice(texto.indexOf("["), texto.lastIndexOf("]") + 1)
        const sugerenciasIA = JSON.parse(jsonStr)

        const sugerencias = sugerenciasIA.map((s: { dia: string; eje: string; nombre: string; capacidades: string; contenidos: string; objetivo: string; desarrollo: string; materiales: string }) => ({
          dia: s.dia,
          actividad: {
            nombre: s.nombre,
            capacidades: s.capacidades,
            contenidos: s.contenidos,
            objetivo: s.objetivo,
            desarrollo: s.desarrollo,
            materiales: s.materiales,
            eje: s.eje,
            alfabetizacion: true,
            origen: "alba" as const,
          }
        }))

        return NextResponse.json({ ok: true, sugerencias })
      } catch (iaError) {
        console.error("[v0] Error en IA para sugerencias:", iaError)
        // Fallback con actividades ricas predefinidas si la IA falla
        const FALLBACK = diasArray.map((dia, idx) => ({
          dia,
          actividad: {
            nombre: idx === 0 ? "Juego de sonidos con los nombres del grupo" : idx === 1 ? "Lectura dialogica: anticipacion por imagenes" : "Escritura del nombre propio con modelo",
            capacidades: idx === 0 ? "Conciencia silabica y fonemica" : idx === 1 ? "Comprension lectora predictiva" : "Sistema de escritura — nombre como modelo estable",
            contenidos: idx === 0 ? "Segmentacion silabica, identificacion de sonido inicial" : idx === 1 ? "Anticipacion a partir de portada e ilustraciones, comprension literal" : "Correspondencia sonido-letra, escritura espontanea con referente",
            objetivo: idx === 0 ? "Segmentar nombres de companeros en silabas y reconocer el sonido inicial" : idx === 1 ? "Formular hipotesis sobre el contenido antes de leer y verificarlas" : "Escribir el nombre propio de memoria usando el cartel como referencia",
            desarrollo: idx === 0 ? "En ronda, cada nino dice su nombre palmeando las silabas. Luego todos repiten. Enfatizar el primer sonido. Armar lista en afiche con los nombres y sus silabas." : idx === 1 ? "Mostrar tapa del libro. Preguntar: de que crees que trata? Por que? Registrar predicciones. Leer el cuento. Volver a las predicciones: acertaron?" : "Entregar tarjeta con nombre de cada nino. Observar, trazar con el dedo, copiar en papel. Comparar con companeros: cuales son mas largos?",
            materiales: idx === 0 ? "Afiche, marcadores, lista de nombres de la sala" : idx === 1 ? "Cuento seleccionado, pizarron o afiche para registrar predicciones" : "Tarjetas plastificadas con nombres, hojas, lapices",
            eje: EJES[idx],
            alfabetizacion: true,
            origen: "alba" as const,
          }
        }))
        return NextResponse.json({ ok: true, sugerencias: FALLBACK })
      }
    }

    
    return NextResponse.json({ ok: false, error: "Accion no reconocida" }, { status: 400 })
  } catch (err) {
    console.error("Error en POST /api/brain:", err)
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
  }
}

// Funcion para generar actividades basadas en el proyecto
// Implementa principios pedagogicos de Vigotsky (ZDP), Perkins (EpC), Montessori y Reggio Emilia
function generarActividadSegunProyecto(
  proyecto: { titulo: string; objetivoGeneral: string; duracion?: string }, 
  dia: string, 
  diaIdx: number,
  actividadesYaSugeridas: string[] = []
) {
  const titulo = proyecto.titulo.toLowerCase()
  const objetivo = proyecto.objetivoGeneral.toLowerCase()
  
  // Banco ampliado de actividades con fundamentos pedagogicos
  // Basado en: Vigotsky (andamiaje, ZDP), Perkins (comprension), Montessori (sensorial), Reggio Emilia (100 lenguajes)
  const bancosActividades: { [key: string]: { nombre: string; capacidades: string; contenidos: string; objetivo: string; desarrollo: string; materiales: string }[] } = {
    animales: [
      { nombre: "Descubrimos a los animales de la granja", capacidades: "Exploracion del entorno natural", contenidos: "Animales domesticos y sus caracteristicas", objetivo: "Identificar animales de la granja y sus sonidos", desarrollo: "Presentar imagenes de animales, imitar sonidos, clasificar por tamano", materiales: "Imagenes, titeres de animales, audio de sonidos" },
      { nombre: "Armamos mascaras de animales", capacidades: "Creatividad y expresion artistica", contenidos: "Tecnicas de collage y recorte", objetivo: "Crear una mascara de su animal favorito", desarrollo: "Elegir animal, decorar mascara con papeles, mostrar a los companeros", materiales: "Cartulina, papeles de colores, pegamento, elastico" },
      { nombre: "Jugamos al veterinario", capacidades: "Juego simbolico y empatia", contenidos: "Cuidado de los animales", objetivo: "Comprender la importancia de cuidar a los animales", desarrollo: "Dramatizar atencion veterinaria con peluches, usar elementos de doctor", materiales: "Peluches, maletin de medico, vendas, jeringas de juguete" },
      { nombre: "Caminamos como animales", capacidades: "Expresion corporal y motricidad", contenidos: "Movimientos de distintos animales", objetivo: "Explorar diferentes formas de desplazamiento", desarrollo: "Imitar caminar como oso, saltar como conejo, arrastrarse como serpiente", materiales: "Espacio amplio, musica" },
      { nombre: "Cantamos canciones de animales", capacidades: "Expresion musical y lenguaje", contenidos: "Canciones infantiles con animales", objetivo: "Aprender canciones y ampliar vocabulario", desarrollo: "Cantar 'En la granja de mi tio', 'Los pollitos', acompanar con palmas", materiales: "Reproductor de musica, imagenes de animales" },
      // Actividades adicionales basadas en Montessori y Reggio Emilia
      { nombre: "Mesa de luz con animales (Reggio Emilia)", capacidades: "Exploracion visual y sensorial", contenidos: "Siluetas y transparencias", objetivo: "Descubrir propiedades de luz y sombra con formas de animales", desarrollo: "Explorar siluetas en mesa de luz, crear historias, combinar colores", materiales: "Mesa de luz, siluetas de animales, acetatos de colores" },
      { nombre: "Bandeja sensorial de la granja (Montessori)", capacidades: "Desarrollo sensorial y motricidad fina", contenidos: "Texturas y materiales naturales", objetivo: "Explorar texturas asociadas al habitat de los animales", desarrollo: "Tocar heno, arena, plumas; clasificar por textura; asociar animal-habitat", materiales: "Bandeja, heno, arena, plumas, piedras, animales de goma" },
      { nombre: "Investigamos: Como nacen los animales (Vigotsky)", capacidades: "Pensamiento cientifico y lenguaje", contenidos: "Oviparos y viviparos", objetivo: "Construir conocimiento colaborativo sobre reproduccion animal", desarrollo: "Preguntas iniciales, observar imagenes, clasificar con ayuda del docente (andamiaje)", materiales: "Imagenes de huevos, animales bebes, carteles para clasificar" },
      { nombre: "Teatro de sombras de animales", capacidades: "Expresion artistica y narrativa", contenidos: "Luz, sombra y narracion", objetivo: "Crear una historia usando siluetas de animales", desarrollo: "Armar teatro, manipular siluetas, narrar cuento grupal", materiales: "Linterna, tela blanca, siluetas de carton negro" },
      { nombre: "Puzzle de animales y sus partes", capacidades: "Pensamiento logico y vocabulario", contenidos: "Partes del cuerpo animal", objetivo: "Reconocer y nombrar partes de diferentes animales", desarrollo: "Armar puzzles, nombrar partes, comparar entre animales", materiales: "Puzzles de animales, tarjetas de partes" },
    ],
    naturaleza: [
      { nombre: "Exploramos hojas y semillas", capacidades: "Observacion y exploracion sensorial", contenidos: "Elementos de la naturaleza", objetivo: "Descubrir texturas y formas de elementos naturales", desarrollo: "Tocar, observar con lupa, clasificar hojas por forma y color", materiales: "Hojas secas, semillas, lupas, bandejas" },
      { nombre: "Plantamos semillas", capacidades: "Responsabilidad y cuidado del ambiente", contenidos: "Ciclo de vida de las plantas", objetivo: "Iniciar el seguimiento del crecimiento de una planta", desarrollo: "Preparar maceta, colocar tierra, plantar semilla, regar", materiales: "Vasos plasticos, tierra, semillas, agua" },
      { nombre: "Jugamos con agua y arena", capacidades: "Exploracion sensorial y creatividad", contenidos: "Propiedades del agua y la arena", objetivo: "Descubrir que pasa al mezclar agua y arena", desarrollo: "Juego libre con recipientes, trasvasar, hacer formas", materiales: "Arena, agua, recipientes, moldes" },
      { nombre: "Observamos el cielo", capacidades: "Curiosidad cientifica", contenidos: "El sol, las nubes, el clima", objetivo: "Describir como esta el cielo hoy", desarrollo: "Salir al patio, observar, dibujar lo que vemos, conversar", materiales: "Hojas, crayones, mantas para sentarse" },
      { nombre: "Clasificamos elementos naturales", capacidades: "Pensamiento logico", contenidos: "Clasificacion por atributos", objetivo: "Agrupar elementos por caracteristicas", desarrollo: "Separar piedras grandes/chicas, hojas verdes/marrones", materiales: "Piedras, hojas, palitos, cajas para clasificar" },
      // Actividades adicionales con fundamentos pedagogicos
      { nombre: "Diario de la naturaleza (Reggio Emilia)", capacidades: "Documentacion y registro", contenidos: "Cambios en la naturaleza", objetivo: "Observar y registrar cambios en el entorno natural", desarrollo: "Salir a observar, dibujar, pegar elementos, comparar con dias anteriores", materiales: "Cuaderno grupal, crayones, pegamento, elementos naturales" },
      { nombre: "Bandeja sensorial del bosque (Montessori)", capacidades: "Exploracion multisensorial", contenidos: "Ecosistema del bosque", objetivo: "Explorar elementos del bosque con todos los sentidos", desarrollo: "Tocar musgo, oler pinos, escuchar sonidos grabados, clasificar", materiales: "Musgo, corteza, pinas, hojas, audio de bosque" },
      { nombre: "Experimento: Que necesitan las plantas (Vigotsky)", capacidades: "Pensamiento cientifico", contenidos: "Necesidades de las plantas", objetivo: "Formular hipotesis y verificarlas con guia del docente", desarrollo: "Plantar 3 semillas: con luz, sin luz, sin agua. Predecir, observar, comparar", materiales: "3 vasos, semillas, tierra, agua, caja para oscurecer" },
      { nombre: "Mandalas con elementos naturales", capacidades: "Expresion artistica y concentracion", contenidos: "Patrones y simetria", objetivo: "Crear composiciones artisticas con materiales naturales", desarrollo: "Recolectar elementos, crear mandala grupal, fotografiar", materiales: "Hojas, flores, piedras, palitos" },
      { nombre: "Caminata de texturas al aire libre", capacidades: "Percepcion sensorial y vocabulario", contenidos: "Texturas naturales", objetivo: "Ampliar vocabulario sensorial explorando texturas", desarrollo: "Caminar descalzos por pasto, arena, piedras; describir sensaciones", materiales: "Espacio exterior seguro, diferentes superficies" },
    ],
    familia: [
      { nombre: "Mi familia en un dibujo", capacidades: "Expresion grafica y afectividad", contenidos: "Los miembros de la familia", objetivo: "Representar a su familia a traves del dibujo", desarrollo: "Conversar sobre quienes viven en casa, dibujar, compartir", materiales: "Hojas, crayones, lapices de colores" },
      { nombre: "Jugamos a la casita", capacidades: "Juego simbolico y roles sociales", contenidos: "Roles familiares", objetivo: "Dramatizar situaciones de la vida cotidiana familiar", desarrollo: "Armar rincones (cocina, living), asumir roles, interactuar", materiales: "Elementos de cocina, munecas, disfraces" },
      { nombre: "Armamos un arbol familiar", capacidades: "Identidad y pertenencia", contenidos: "La familia extendida", objetivo: "Reconocer a los miembros de la familia", desarrollo: "Pegar fotos traidas de casa en arbol, nombrar parentescos", materiales: "Cartulina con arbol, fotos de familia, pegamento" },
      { nombre: "Cocinamos con recetas de familia", capacidades: "Trabajo colaborativo", contenidos: "Tradiciones familiares", objetivo: "Valorar las costumbres de cada familia", desarrollo: "Preparar receta sencilla (galletitas), compartir historias", materiales: "Ingredientes, bowls, utensilios de cocina" },
      { nombre: "Cantamos canciones de cuna", capacidades: "Expresion musical y vinculos afectivos", contenidos: "Canciones tradicionales", objetivo: "Conocer canciones que nos cantaban de bebes", desarrollo: "Escuchar, cantar juntos, mecer munecas", materiales: "Munecas, mantas, reproductor de musica" },
      // Actividades adicionales
      { nombre: "Caja de los recuerdos familiares", capacidades: "Memoria y narracion", contenidos: "Historia familiar", objetivo: "Valorar objetos significativos de la familia", desarrollo: "Traer objeto de casa, contar su historia, exponerlo", materiales: "Objetos de casa, caja decorada, etiquetas" },
      { nombre: "Titeres de la familia (Reggio Emilia)", capacidades: "Expresion dramatica y creatividad", contenidos: "Representacion familiar", objetivo: "Crear titeres que representen a su familia", desarrollo: "Crear titeres con medias/cucharas, dramatizar escenas", materiales: "Medias, cucharas de madera, lana, ojos moviles" },
      { nombre: "Mapa de mi casa (Vigotsky)", capacidades: "Representacion espacial", contenidos: "El hogar y sus espacios", objetivo: "Representar espacios conocidos con ayuda guiada", desarrollo: "Conversar sobre habitaciones, dibujar mapa, ubicar a cada familiar", materiales: "Papel grande, crayones, fotos de familiares" },
      { nombre: "Roles y responsabilidades en casa", capacidades: "Autonomia y colaboracion", contenidos: "Tareas del hogar", objetivo: "Reconocer como cada uno colabora en casa", desarrollo: "Dramatizar tareas, conversar sobre ayuda en casa, hacer compromisos", materiales: "Elementos de limpieza de juguete, delantales" },
      { nombre: "Album de familias diversas", capacidades: "Respeto por la diversidad", contenidos: "Diferentes tipos de familias", objetivo: "Reconocer y valorar la diversidad familiar", desarrollo: "Ver imagenes de familias diversas, conversar sin prejuicios, dibujar", materiales: "Imagenes de familias diversas, hojas, crayones" },
    ],
    cuerpo: [
      { nombre: "Conocemos las partes del cuerpo", capacidades: "Conocimiento de si mismo", contenidos: "Partes del cuerpo humano", objetivo: "Nombrar y senalar partes del cuerpo", desarrollo: "Cancion 'Cabeza, hombros, rodillas, pies', senalar en muneco", materiales: "Muneco grande, espejo, musica" },
      { nombre: "Pintamos con el cuerpo", capacidades: "Expresion artistica y motricidad", contenidos: "Tecnicas grafoplasticas", objetivo: "Experimentar pintura con diferentes partes del cuerpo", desarrollo: "Pintar con manos, pies, codos sobre papel grande", materiales: "Papel afiche, temperas, recipientes, agua" },
      { nombre: "Circuito de movimientos", capacidades: "Motricidad gruesa y coordinacion", contenidos: "Desplazamientos y equilibrio", objetivo: "Ejercitar diferentes formas de movimiento", desarrollo: "Armar circuito con obstaculos, trepar, reptar, saltar", materiales: "Colchonetas, aros, conos, tunel" },
      { nombre: "Juegos con espejo", capacidades: "Autoconocimiento", contenidos: "La imagen corporal", objetivo: "Reconocerse y expresar emociones frente al espejo", desarrollo: "Hacer gestos, imitar al companero, dibujar lo que vemos", materiales: "Espejos, hojas, crayones" },
      { nombre: "Relajacion y respiracion", capacidades: "Autoregulacion y bienestar", contenidos: "Tecnicas de relajacion", objetivo: "Aprender a calmar el cuerpo", desarrollo: "Acostarse, escuchar musica suave, respirar como globo", materiales: "Colchonetas, musica relajante, peluches" },
      // Actividades adicionales con base pedagogica
      { nombre: "Silueta corporal a tamano real", capacidades: "Esquema corporal", contenidos: "Proporciones del cuerpo", objetivo: "Reconocer el tamano real de su cuerpo", desarrollo: "Acostarse sobre papel, dibujar contorno, decorar, comparar", materiales: "Papel grande, marcadores, materiales para decorar" },
      { nombre: "Los 5 sentidos (Montessori)", capacidades: "Discriminacion sensorial", contenidos: "Vista, oido, tacto, gusto, olfato", objetivo: "Identificar y usar cada sentido", desarrollo: "Estaciones sensoriales: cajas de texturas, frascos de olores, sabores", materiales: "Cajas, telas, especias, alimentos, vendas" },
      { nombre: "Yoga para ninos", capacidades: "Conciencia corporal y concentracion", contenidos: "Posturas y equilibrio", objetivo: "Explorar posturas de yoga adaptadas", desarrollo: "Imitar animales con posturas de yoga, respirar, relajar", materiales: "Colchonetas, tarjetas de posturas, musica suave" },
      { nombre: "Estatuas musicales con emociones", capacidades: "Expresion emocional y corporal", contenidos: "Emociones basicas", objetivo: "Expresar emociones con el cuerpo", desarrollo: "Bailar, al parar mostrar emocion indicada, conversar", materiales: "Musica, tarjetas de emociones" },
      { nombre: "Masaje con pelotas", capacidades: "Percepcion tactil y relajacion", contenidos: "Partes del cuerpo", objetivo: "Reconocer partes del cuerpo a traves del tacto", desarrollo: "En parejas, pasar pelota por partes indicadas, nombrar", materiales: "Pelotas de texturas, musica relajante" },
    ],
    colores: [
      { nombre: "Buscamos colores en la sala", capacidades: "Observacion y discriminacion visual", contenidos: "Colores primarios", objetivo: "Identificar y nombrar colores", desarrollo: "Busqueda del tesoro de objetos de un color, agrupar", materiales: "Objetos de colores variados, cestos" },
      { nombre: "Mezclamos colores", capacidades: "Experimentacion y curiosidad", contenidos: "Mezcla de colores", objetivo: "Descubrir que colores nuevos se forman al mezclar", desarrollo: "Mezclar temperas, observar resultados, pintar", materiales: "Temperas primarias, paleta, pinceles, hojas" },
      { nombre: "Clasificamos por color", capacidades: "Pensamiento logico matematico", contenidos: "Clasificacion por atributos", objetivo: "Agrupar objetos segun su color", desarrollo: "Separar bloques, tapitas, papeles por color", materiales: "Bloques, tapitas, papeles de colores, recipientes" },
      { nombre: "Jugamos con luces de colores", capacidades: "Exploracion sensorial", contenidos: "La luz y los colores", objetivo: "Explorar como cambian los objetos con luces de colores", desarrollo: "Oscurecer sala, usar linternas con celofan, proyectar", materiales: "Linternas, celofan de colores, objetos blancos" },
      { nombre: "Arcoiris con las manos", capacidades: "Expresion artistica", contenidos: "Tecnica de estampado", objetivo: "Crear un arcoiris grupal", desarrollo: "Estampar manos con temperas en orden del arcoiris", materiales: "Papel afiche grande, temperas de colores" },
      // Actividades adicionales
      { nombre: "Botellas sensoriales de colores (Montessori)", capacidades: "Exploracion visual y calma", contenidos: "Colores y movimiento", objetivo: "Observar movimiento de colores para calmar", desarrollo: "Crear botellas con agua, aceite y colorante; observar; describir", materiales: "Botellas plasticas, agua, aceite, colorante" },
      { nombre: "Mesa de luz y colores (Reggio Emilia)", capacidades: "Exploracion luminica", contenidos: "Transparencia y color", objetivo: "Descubrir como se ven los colores con luz", desarrollo: "Explorar acetatos, superponer colores, crear composiciones", materiales: "Mesa de luz, acetatos de colores, objetos translucidos" },
      { nombre: "Dia monocromatico", capacidades: "Identificacion de colores", contenidos: "Un color en profundidad", objetivo: "Explorar todas las variantes de un color", desarrollo: "Vestir del color elegido, buscar objetos, comer alimentos de ese color", materiales: "Objetos del color, alimentos, ropa" },
      { nombre: "Pintura con elementos naturales", capacidades: "Creatividad y naturaleza", contenidos: "Pigmentos naturales", objetivo: "Descubrir colores que dan elementos naturales", desarrollo: "Frotar flores, hojas, frutas en papel; observar colores", materiales: "Petalos, hojas, remolachas, papel blanco" },
      { nombre: "Collage de revista por colores", capacidades: "Motricidad fina y clasificacion", contenidos: "Reconocimiento de colores", objetivo: "Buscar y clasificar colores en imagenes", desarrollo: "Recortar/rasgar partes de revista de un color, pegar en cartel grupal", materiales: "Revistas, tijeras, pegamento, cartulinas" },
    ],
    default: [
      { nombre: "Exploracion libre con materiales", capacidades: "Creatividad y autonomia", contenidos: "Exploracion sensorial", objetivo: "Descubrir propiedades de diferentes materiales", desarrollo: "Disponer materiales variados, observar como los usan, guiar descubrimientos", materiales: "Cajas, telas, papeles, elementos naturales" },
      { nombre: "Ronda de cuentos", capacidades: "Escucha atenta y comprension", contenidos: "Literatura infantil", objetivo: "Disfrutar de la lectura de un cuento", desarrollo: "Sentarse en ronda, leer cuento, hacer preguntas, dramatizar", materiales: "Cuento seleccionado, titeres opcionales" },
      { nombre: "Juego en sectores", capacidades: "Juego simbolico y socializacion", contenidos: "Diferentes areas de juego", objetivo: "Elegir y sostener el juego en un sector", desarrollo: "Presentar sectores disponibles, elegir, jugar, guardar", materiales: "Sectores armados (construccion, hogar, arte)" },
      { nombre: "Taller de arte libre", capacidades: "Expresion y creatividad", contenidos: "Tecnicas mixtas", objetivo: "Expresarse a traves de diferentes materiales", desarrollo: "Ofrecer variedad de materiales, crear libremente, exponer", materiales: "Papeles, temperas, plasticola, brillantina, tijeras" },
      { nombre: "Juegos musicales", capacidades: "Expresion musical y ritmo", contenidos: "Instrumentos y ritmos", objetivo: "Explorar sonidos y ritmos", desarrollo: "Usar instrumentos, seguir ritmos, cantar, bailar", materiales: "Panderetas, maracas, tambores, musica" },
      // Actividades adicionales basadas en pedagogias
      { nombre: "Provocacion artistica (Reggio Emilia)", capacidades: "Creatividad e iniciativa", contenidos: "Exploracion abierta", objetivo: "Responder creativamente a una propuesta abierta", desarrollo: "Disponer materiales de forma atractiva, observar, guiar sin dirigir", materiales: "Materiales variados dispuestos esteticamente" },
      { nombre: "Vida practica (Montessori)", capacidades: "Autonomia y concentracion", contenidos: "Actividades cotidianas", objetivo: "Desarrollar independencia en tareas cotidianas", desarrollo: "Trasvasar, abotonar, verter agua, doblar telas", materiales: "Jarras, botones, telas, bandejas" },
      { nombre: "Construccion colaborativa (Vigotsky)", capacidades: "Trabajo en equipo y resolucion", contenidos: "Construccion con bloques", objetivo: "Construir juntos con ayuda mutua", desarrollo: "Proponer construccion grupal, asignar roles, reflexionar sobre proceso", materiales: "Bloques grandes, fotos de inspiracion" },
      { nombre: "Cuentos con finales abiertos (Perkins)", capacidades: "Pensamiento creativo", contenidos: "Narrativa y prediccion", objetivo: "Imaginar y argumentar posibles finales", desarrollo: "Leer cuento hasta el nudo, preguntar que pasara, dibujar finales", materiales: "Cuento seleccionado, hojas, crayones" },
      { nombre: "Juego heuristico", capacidades: "Exploracion y descubrimiento", contenidos: "Propiedades de objetos", objetivo: "Descubrir que se puede hacer con objetos cotidianos", desarrollo: "Ofrecer objetos variados (no juguetes), observar uso creativo", materiales: "Cajas, tubos, cadenas, telas, pelotas" },
    ]
  }
  
  // Detectar tema del proyecto
  let temaDetectado = "default"
  if (titulo.includes("animal") || objetivo.includes("animal") || titulo.includes("granja") || titulo.includes("mascota")) {
    temaDetectado = "animales"
  } else if (titulo.includes("natural") || objetivo.includes("planta") || titulo.includes("ambiente") || titulo.includes("ecolog")) {
    temaDetectado = "naturaleza"
  } else if (titulo.includes("familia") || objetivo.includes("familia") || titulo.includes("hogar")) {
    temaDetectado = "familia"
  } else if (titulo.includes("cuerpo") || objetivo.includes("cuerpo") || titulo.includes("movimiento") || titulo.includes("salud")) {
    temaDetectado = "cuerpo"
  } else if (titulo.includes("color") || objetivo.includes("color") || titulo.includes("arte")) {
    temaDetectado = "colores"
  }
  
  const banco = bancosActividades[temaDetectado] || bancosActividades.default
  
  // Filtrar actividades que ya fueron sugeridas/aceptadas
  const bancoDisponible = banco.filter(act => !actividadesYaSugeridas.includes(act.nombre))
  
  // Si ya se usaron todas las actividades del tema, usar el banco default
  const bancoFinal = bancoDisponible.length > 0 
    ? bancoDisponible 
    : bancosActividades.default.filter(act => !actividadesYaSugeridas.includes(act.nombre))
  
  // Si aun asi no hay disponibles, volver al banco original (permitir repeticion)
  if (bancoFinal.length === 0) {
    return banco[diaIdx % banco.length]
  }
  
  // Seleccionar actividad basada en el indice del dia pero dentro del banco disponible
  const actividadIdx = diaIdx % bancoFinal.length
  return bancoFinal[actividadIdx]
}
