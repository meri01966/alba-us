// ALBA Brain API v10.3 - Marco Curricular DC Inicial Buenos Aires 2025 + evidencia internacional
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { generateText } from "ai"

const SUPABASE_URL = "https://ehwlulqcwimatxmnajra.supabase.co"
const SUPABASE_KEY = "sb_publishable_q-qtEDnI0QxcrTt3pQIh8w_vbmnQZS1"

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

// Tipo de micro-capacitacion
type MicroCap = { titulo: string; contenido: string; tips: string[]; cancion?: string; poesia?: string; referencia?: string; observar?: string[] }

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
// Micro capacitacion just in time. Una entrada por cada titulo de SECUENCIA.
// Es el "Before you teach": la teoria de dos minutos sobre lo que se va a
// ensenar, los recursos que mas rinden, el autor que lo respalda y los
// indicadores concretos para observar durante la clase. Esos indicadores
// son los mismos que la maestra despues marca, asi formar y medir son el
// mismo movimiento.
const MICRO_CAPS: Record<string, MicroCap> = {
  "Sound Detectives": {
    titulo: "Auditory discrimination",
    contenido: "Before children can hear a phoneme they have to notice that sound is something you can attend to on purpose. This is the floor of every phonological skill and it is often skipped because it looks like play.",
    tips: ["Lower your own voice so they sharpen their listening instead of competing with you", "If a child answers with one word, model the full sentence and have the group repeat it", "Contrast two sounds at a time before asking for one alone"],
    referencia: "Adams (1990); California PTKLF, Phonological Awareness",
    observar: ["Names a sound without a visual clue", "Uses a full sentence unprompted", "Distinguishes two similar sounds"],
  },
  "Rhyme Basket": {
    titulo: "Rhyme recognition",
    contenido: "Rhyme is the earliest window into the sound structure of words and one of the strongest early predictors of later reading. Invented words count: what matters is that the child is manipulating sound, not vocabulary.",
    tips: ["Accept nonsense rhymes with enthusiasm, they show the skill is there", "Do recognition before production: judging is easier than making", "Use their own names first, it is the word every child owns"],
    referencia: "Goswami & Bryant (1990); Yopp",
    observar: ["Judges a rhyming pair correctly", "Produces a rhyme, real or invented", "Completes the rhyme in a song without help"],
  },
  "Clap the Beats": {
    titulo: "Syllable segmentation",
    contenido: "The syllable is the easiest unit to hear because it has a beat you can feel in your body. Moving while segmenting is not decoration: the physical beat is what makes the abstract unit perceivable.",
    tips: ["Start with two-syllable names, never with one-syllable words", "Say the word at normal speed first, then segmented, never only segmented", "Watch for the child who claps randomly: they need your hands on theirs"],
    referencia: "California PTKLF, Phonological Awareness",
    observar: ["Claps two-syllable words accurately", "Claps three-syllable words accurately", "Coordinates the clap with the syllable, not the beat of the music"],
  },
  "My Name Starts With": {
    titulo: "Initial sound isolation",
    contenido: "The child's own name is the first word they own as an object, not just as a label. Isolating its first sound is usually the first phoneme a child can hold in their head, which is why every phonemic sequence starts there.",
    tips: ["Say the sound, never the letter name: it is mmm, not em", "Hold the sound out loud so it is audible: mmmmoon", "If a child cannot isolate it, say the name and the sound together three times before asking"],
    referencia: "Ehri (2005); California PTKLF",
    observar: ["Produces the first sound of own name alone", "Matches another word with the same first sound", "Says the sound rather than the letter name"],
  },
  "Syllable Clap Parade": {
    titulo: "Syllable blending and segmenting",
    contenido: "Blending and segmenting are the same skill in two directions, and children usually get one before the other. Teaching both from the start prevents the child who can take words apart but cannot put them together.",
    tips: ["Always pair segmenting with blending in the same session", "Use words the children already understand: this is about sound, not vocabulary", "Three syllables is the ceiling at this stage, do not push to four"],
    referencia: "California CCSS RF.K.2b; Adams (1990)",
    observar: ["Blends two syllables into a word", "Blends three syllables into a word", "Segments a word without a physical cue"],
  },
  "Onset and Rime Puppets": {
    titulo: "Onset-rime blending",
    contenido: "Onset and rime is the bridge between the syllable and the phoneme. It is easier than full phoneme blending because the rime stays whole, and it sets up word families, which is where decoding will start.",
    tips: ["Keep the rime constant across a whole round so the pattern becomes audible", "The puppet does the slow talking, not you: children correct a puppet more freely", "Move to full phonemes only after two consecutive successful rounds"],
    referencia: "Goswami & Bryant (1990); Cunningham (1999)",
    observar: ["Blends onset and rime into a word", "Splits a word at the onset", "Notices the shared rime in a word family"],
  },
  "First Sound Sort": {
    titulo: "Initial phoneme isolation",
    contenido: "Isolating the initial phoneme is the first true phonemic skill and the one that most reliably separates children who will need extra support. Continuant sounds like /m/ and /s/ are easier than stops like /b/ and /t/ because you can hold them.",
    tips: ["Start with continuants, /m/ /s/ /f/, before stops", "Insist on the sound in isolation, not the letter name and not the whole word", "A child who says the whole word instead of the sound has not got it yet, even if the card is in the right hoop"],
    referencia: "Ehri (2005); Castiglioni-Spalten & Ehri (2003)",
    observar: ["Produces the isolated first sound", "Sorts correctly without saying the whole word", "Handles a stop consonant, not only continuants"],
  },
  "Say It, Move It": {
    titulo: "Phoneme segmentation",
    contenido: "The medial vowel is where most children stall, because it is the least perceptible position. Making the sound physical, one counter per phoneme, turns an invisible sequence into something the child can see and correct.",
    tips: ["Use only CVC words, never blends, at this stage", "Say the word once at normal speed before segmenting", "If a child pushes two counters for three sounds, it is almost always the vowel they dropped"],
    referencia: "Ehri & McCormick (1998); California CCSS RF.K.2d",
    observar: ["Pushes one counter per sound", "Identifies the medial vowel", "Sweeps back to the whole word without losing it"],
  },
  "Sound Swap Songs": {
    titulo: "Phoneme substitution",
    contenido: "Substitution requires holding a word in memory, removing a sound and inserting another, all at once. It is the most demanding phonemic skill and the clearest sign that the earlier steps are consolidated. If a group fails here, the answer is to go back, not to repeat this.",
    tips: ["Do not attempt this until segmentation is solid, it will only frustrate", "Whole group first, individuals later: the song carries the ones who are not there yet", "Failing here is data about the previous step, not about this one"],
    referencia: "California CCSS RF.K.2e; Brady (2012)",
    observar: ["Substitutes the initial sound in a known word", "Keeps the rest of the word intact", "Can do it without the song's rhythm carrying them"],
  },
  "Letter Sound Anchors": {
    titulo: "Letter-sound correspondence",
    contenido: "This is where phonological awareness becomes reading: the moment the child maps a sound they can already hear onto a symbol. If the sound is not secure in the ear first, the letter is just a shape to memorize.",
    tips: ["Never teach the letter before the sound is audible to the child", "Two letters per week is enough; more looks like progress and is not", "Let the group pick the anchor word, they will remember their own"],
    referencia: "Ehri (2005); Moats (2012)",
    observar: ["Produces the sound when shown the letter", "Finds the letter in connected text", "Uses the anchor word to retrieve the sound"],
  },
  "High Frequency Word Wall": {
    titulo: "Sight word recognition",
    contenido: "Sight recognition is not memorization of shapes: it is what happens when a word has been decoded enough times to become automatic. Words met in sentences become sight words faster than words drilled on cards.",
    tips: ["Always in context, never as an isolated list", "Five per cycle is the ceiling for kindergarten", "If a child guesses from the first letter, cover it and ask them to read the rest"],
    referencia: "Ehri (2005); California CCSS RF.K.3c",
    observar: ["Reads the word without sounding out", "Finds it in connected text", "Uses it correctly in an invented sentence"],
  },
  "Long or Short Vowel Sort": {
    titulo: "Vowel discrimination",
    contenido: "English vowels carry most of the decoding difficulty. Hearing the difference before seeing the spelling prevents the child from guessing from the consonants, which is the most common compensatory habit.",
    tips: ["Ear before eye, always: signal first, write second", "Use minimal pairs so the vowel is the only variable", "A child who guesses from consonants will do well on the list and fail on new words"],
    referencia: "California CCSS RF.1.2a; Moats (2012)",
    observar: ["Signals correctly before seeing the word", "Handles a minimal pair", "Explains the difference in their own words"],
  },
  "Blend the Blends": {
    titulo: "Blending with consonant clusters",
    contenido: "Consonant blends are the single most common stalling point between kindergarten and first grade. Children insert a vowel, saying suh-top, because holding two consonants is physically hard. It is not a comprehension problem, it is a motor and perceptual one.",
    tips: ["Listen for the inserted vowel, suh-top, it is the tell", "Have the child feel their own mouth between the two consonants", "Do not move to written blends until the oral blend is clean"],
    referencia: "California CCSS RF.1.2b; Spear-Swerling (2011)",
    observar: ["Blends a two-consonant onset without inserting a vowel", "Blends a final cluster", "Self-corrects when they hear the inserted vowel"],
  },
  "Digraph Detectives": {
    titulo: "Consonant digraphs",
    contenido: "A digraph is the first time a child meets two letters making one sound, which breaks the one-to-one rule they just learned. Naming that contradiction out loud helps more than drilling it.",
    tips: ["Say out loud that this breaks the rule they learned, do not hide it", "One digraph per session, they interfere with each other", "Build the chart from words they found, not from your list"],
    referencia: "California CCSS RF.1.3a",
    observar: ["Reads a digraph as one sound", "Finds digraphs in new text", "Does not try to sound the two letters separately"],
  },
  "Every Syllable Has a Vowel": {
    titulo: "Syllable structure in print",
    contenido: "This is the first strategy that lets a child attack a word nobody taught them. It converts decoding from recall into a procedure, which is what makes independent reading possible.",
    tips: ["The rule is stated once and then used, not re-explained every session", "Apply it to words from their own reading, never to a prepared list", "When they get stuck on a long word later, point at the vowels rather than telling them the word"],
    referencia: "California CCSS RF.1.3d",
    observar: ["Marks the vowels correctly", "Splits between syllables", "Uses the strategy on an unfamiliar word without prompting"],
  },
  "Vowel Team Teams": {
    titulo: "Vowel teams",
    contenido: "Vowel teams are where English stops being reliable, and children notice. Letting them collect the exceptions themselves, instead of hiding them, builds the flexibility that good decoders have and poor ones lack.",
    tips: ["Ask for the exceptions on purpose, they will find them anyway", "Groups teach each other: explaining the pattern consolidates it", "Keep the collected words visible for the rest of the year"],
    referencia: "California CCSS RF.2.3b",
    observar: ["Reads the vowel team as one sound", "Finds new examples independently", "Notices and flags an exception"],
  },
  "Prefix and Suffix Builders": {
    titulo: "Morphological decoding",
    contenido: "Morphology is the highest-yield decoding strategy after the alphabetic principle, because affixes are stable in both sound and meaning. A child who owns twenty affixes can attack thousands of words.",
    tips: ["Always ask what the affix did to the meaning, never only how it sounds", "Start with affixes that do not change the base spelling", "Keep a running journal, the collection is the learning"],
    referencia: "California CCSS RF.2.3d; Moats (2012)",
    observar: ["Reads the built word fluently", "Explains the meaning change", "Applies a known affix to an unfamiliar base"],
  },
  "Latin Suffix Lab": {
    titulo: "Latin morphology",
    contenido: "From third grade on, most new words a child meets are multisyllabic and academic, and they arrive in science and social studies, not in stories. Teaching morphology inside content is what makes it transfer.",
    tips: ["Pull the words from content class, that is where they actually appear", "Predict the meaning before checking, the prediction is the thinking", "Three suffixes is enough for a whole unit"],
    referencia: "California CCSS RF.3.3b; Graves (2009)",
    observar: ["Splits a multisyllabic word at the suffix", "Predicts meaning from the parts", "Transfers the strategy to a content text without prompting"],
  },
  "Picture Walk Predictions": {
    titulo: "Prediction from illustration",
    contenido: "Coming back to the prediction is what makes it comprehension rather than guessing. Children learn that being wrong and noticing it is part of reading, not a failure.",
    tips: ["Always come back to the sticky notes, that is the whole point", "Write their words, not your improved version", "Two predictions is enough, more and you lose the return"],
    referencia: "California PTKLF, Comprehension and Analysis",
    observar: ["Makes a prediction grounded in the picture", "Notices when the story differed", "Revises without being told they were wrong"],
  },
  "What Happened First": {
    titulo: "Sequencing",
    contenido: "Sequence is the scaffold of narrative comprehension. Using a story they already know removes the memory load so all the effort goes into the ordering itself.",
    tips: ["Only stories they know by heart, never a new one", "Three cards first, five much later", "Let them tell each part, not just place the card"],
    referencia: "California PTKLF, Comprehension and Analysis",
    observar: ["Orders three events correctly", "Tells what happens in each part", "Uses a temporal connector while telling"],
  },
  "Ask Me Three": {
    titulo: "Questioning with evidence",
    contenido: "Pointing to the page is what separates comprehension from recall of the general vibe. It is also the first move of citing evidence, which is the spine of every later reading standard.",
    tips: ["The page has to be pointed at, not just remembered", "Children who answer from memory alone need the book back in their hands", "Record who points and who does not, that is your group"],
    referencia: "California CCSS RL.K.1",
    observar: ["Asks a question about a key detail", "Points to the page that supports the answer", "Answers a classmate's question accurately"],
  },
  "Story Retell Ropes": {
    titulo: "Retelling structure",
    contenido: "Children almost always drop the middle, because the beginning and the end are the most memorable. The rope makes the missing part physically obvious to the child, not just to you.",
    tips: ["Watch for the jump from beginning to end, it is the most common gap", "The rope stays in their hands, do not hold it for them", "Second turn with cards, not with your prompting"],
    referencia: "California CCSS RL.K.2; McGee & Schickedanz (2007)",
    observar: ["Includes the middle without prompting", "Retells in order", "Includes at least one key detail"],
  },
  "Character Feelings Map": {
    titulo: "Character analysis with evidence",
    contenido: "Feelings are where children first make an inference, and where they are most tempted to answer from their own experience instead of the text. Demanding the page is what keeps it a reading task.",
    tips: ["Ask how do we know, every single time", "Supply the feeling vocabulary, they cannot infer with two words", "An answer from personal experience is not wrong, it is just not the task"],
    referencia: "California CCSS RL.1.3",
    observar: ["Names a feeling with a text-based reason", "Points to the supporting page", "Distinguishes what the text says from what they imagine"],
  },
  "Two Books, One Topic": {
    titulo: "Text type awareness",
    contenido: "Knowing what kind of text you are holding changes how you read it. Children who read informational text as if it were a story miss the structure that carries the information.",
    tips: ["Same topic in both books, otherwise they sort by subject not by type", "End with a real question so the choice has a purpose", "Diagrams and headings are the giveaways, name them"],
    referencia: "California CCSS RL.1.5; Duke (2000)",
    observar: ["Sorts features correctly", "Chooses the right text for a question", "Names a structural feature"],
  },
  "What Does the Author Want": {
    titulo: "Author's purpose",
    contenido: "Purpose is the first properly interpretive move. Allowing two defensible answers, as long as each is supported, teaches that evidence is what settles a reading claim, not authority.",
    tips: ["Keep the disagreement if both sides have a line from the text", "One line of evidence, not a summary", "Use short texts, purpose is easier to see in a page than in a chapter"],
    referencia: "California CCSS RI.2.6",
    observar: ["Chooses a purpose and defends it", "Cites one line as evidence", "Accepts a different answer that is also supported"],
  },
  "Two Texts, One Question": {
    titulo: "Cross-text comparison",
    contenido: "The difference between two sources is where a child first meets the idea that texts are written by people who chose what to include. That is the beginning of critical reading.",
    tips: ["Short texts, the comparison is the work, not the reading volume", "Focus the discussion on what only one says", "Ask why the author chose to include it, not just what it says"],
    referencia: "California CCSS RI.3.9",
    observar: ["Fills both columns accurately", "Identifies what only one text says", "Offers a reason for the difference"],
  },
  "Mystery Bag Talk": {
    titulo: "Descriptive language",
    contenido: "Young children default to naming. Pushing for a second and third descriptor is what turns a label into description, and description is the seed of every later explanation.",
    tips: ["Hold the guessing back until two descriptors are out", "Model the words they lack: rough, bumpy, cold, they cannot describe with words they do not have", "Let the quiet ones go with an easy object first"],
    referencia: "California PTKLF, Listening and Speaking; Beck & McKeown (2013)",
    observar: ["Gives two descriptors before guessing", "Uses a word modeled earlier in the week", "Waits for their turn to speak"],
  },
  "Tell Me Your Morning": {
    titulo: "Narrative sequencing",
    contenido: "Temporal connectors are the first grammar of narrative. A child who can say first and then is building the structure they will later need to retell a story and to write one.",
    tips: ["Keep the frame visible even when they no longer need it", "Do not correct grammar mid-sentence, it stops the narration", "Two connected sentences is the target, not more"],
    referencia: "California PTKLF, Listening and Speaking",
    observar: ["Uses a temporal connector", "Sustains two connected sentences", "Narrates in the order things happened"],
  },
  "Morning Meeting Turn and Talk": {
    titulo: "Conversational turn-taking",
    contenido: "Reporting the partner's idea instead of your own is what turns talking into listening. It is a small change in the instruction that changes what the activity actually trains.",
    tips: ["Have them report the partner's idea, not their own, that is the whole trick", "The physical listening card matters, it gives the listener a job", "Two pairs is enough, more and the group loses the thread"],
    referencia: "California CCSS SL.K.1a",
    observar: ["Waits for their turn", "Reports the partner's idea accurately", "Speaks audibly to the whole group"],
  },
  "Ask to Understand": {
    titulo: "Clarifying questions",
    contenido: "Children who do not ask when they do not understand fall behind silently. Making the question the goal, rather than the answer, gives permission to the ones who never ask.",
    tips: ["Celebrate the question out loud, name it as the thing that was hard", "Deliberately leave out something they need, not something trivial", "Watch who never asks, that is your data"],
    referencia: "California CCSS SL.K.3",
    observar: ["Asks a question that completes the instruction", "Asks without being prompted", "Asks when genuinely confused, not only in the game"],
  },
  "Describe So I Can Draw It": {
    titulo: "Precision in description",
    contenido: "The gap between what the speaker said and what the listener drew makes vagueness visible without anyone correcting anyone. Children fix their own language when they see the result.",
    tips: ["First round without questions, that is what creates the gap", "Compare the drawings, do not evaluate the speaker", "Three questions in the second round, not unlimited"],
    referencia: "California CCSS SL.1.4",
    observar: ["Gives details that change the drawing", "Adjusts their language after seeing the gap", "Asks a useful question in the second round"],
  },
  "Build on What They Said": {
    titulo: "Building on others' ideas",
    contenido: "Most classroom discussion is a series of unrelated statements aimed at the teacher. The starters force the children to listen to each other, which is the actual standard and the harder skill.",
    tips: ["Track how long the chain runs, not how many spoke", "The starters are compulsory at first and drop away later", "If every child talks to you, the chain is broken, sit down"],
    referencia: "California CCSS SL.1.1b",
    observar: ["Uses a starter correctly", "Refers to what a classmate actually said", "Sustains a chain of three exchanges"],
  },
  "Partner Reading Check": {
    titulo: "Listening and reflecting",
    contenido: "Self-correction is the visible sign that a reader is monitoring meaning. Having a peer notice it, rather than a teacher correct it, keeps the reader in charge of their own reading.",
    tips: ["The listener never corrects, that is the rule that makes it work", "Talk about what made the spot hard, not about the mistake", "Collect the marking strips, they are assessment"],
    referencia: "California CCSS SL.2.1b; Samuels (1979)",
    observar: ["Marks a genuine self-correction", "Explains what made the word hard", "Listens without interrupting"],
  },
  "Say It Again, Better": {
    titulo: "Elaborated reporting",
    contenido: "The first version of anything is a draft, including spoken language. Making the second attempt the one that counts teaches revision as a habit before it is ever asked for in writing.",
    tips: ["Only the second version is assessed, say so beforehand", "One request for more detail, not a barrage", "Model the two versions yourself first"],
    referencia: "California CCSS SL.3.4",
    observar: ["Adds a relevant fact in the second version", "Keeps an understandable pace", "Uses vocabulary from the text"],
  },
  "Sign In Every Morning": {
    titulo: "Name writing",
    contenido: "This is the highest-yield routine in an early years classroom and it costs no instructional time. The child's name is the first word they write with meaning, and the kept sheets are the cleanest developmental record you will ever have.",
    tips: ["Never correct at the door, it turns a routine into a test", "Keep every sheet in date order, that pile is your evidence", "The name model goes at their eye level, not yours"],
    referencia: "California PTKLF, Writing; Clay (1991)",
    observar: ["Makes a mark with intent", "Produces the first letter of the name", "Writes the whole name recognizably"],
  },
  "Draw It, Tell It": {
    titulo: "Emergent composition",
    contenido: "Writing down what the child just said, in front of them, is how they discover that speech can be captured. It is the single most important demonstration in the year and it takes fifteen seconds per child.",
    tips: ["Write their words exactly, not a corrected version", "Say each word as you write it so they see the match", "Do it in front of the child, never afterwards at your desk"],
    referencia: "California PTKLF, Writing; Ferreiro & Teberosky (1979)",
    observar: ["Tells about their own drawing", "Watches the words being written", "Points at their drawing while telling"],
  },
  "Draw, Label, Tell": {
    titulo: "Informative composition",
    contenido: "Invented spelling is not a mistake to tolerate, it is direct evidence of the child's phonemic analysis. A label written as KT for cat tells you the child hears the first and last sound but not the vowel.",
    tips: ["Read their invented spelling as data, it tells you which phonemes they hear", "Do not correct spelling at this stage, it stops the analysis", "One label is enough to start, more comes on its own"],
    referencia: "California CCSS W.K.2; Ehri (2005)",
    observar: ["Writes a label with at least the initial sound", "Includes the final sound", "Explains the drawing using the label"],
  },
  "Letter Formation Trays": {
    titulo: "Letter formation",
    contenido: "The verbal path is what makes formation automatic, and automatic formation is what frees attention for composing. A child fighting to make a letter has nothing left for what they wanted to say.",
    tips: ["Say the path out loud every time, they will say it to themselves later", "Only letters whose sound they already know", "Two per session, formation fatigues faster than you think"],
    referencia: "California CCSS L.K.1a",
    observar: ["Starts the letter in the right place", "Says the path while writing", "Forms it without the model in front"],
  },
  "Sentence of the Day": {
    titulo: "Sentence expansion",
    contenido: "Expanding a sentence together makes visible that writing is choosing, not transcribing. The child's one added word is a low-risk entry into authorship for the ones who freeze at a blank page.",
    tips: ["The added word is the part that matters, share those", "Grow it word by word, do not jump to the finished sentence", "The frozen ones can copy and add one word, that counts"],
    referencia: "California CCSS W.1.2",
    observar: ["Copies the sentence accurately", "Adds a word that fits", "Explains why they chose that word"],
  },
  "Opinion with a Reason": {
    titulo: "Opinion with support",
    contenido: "Separating the opinion from the reason is the move that makes argument teachable. The opinion is never wrong, which removes the risk, and it puts all the attention on the quality of the justification.",
    tips: ["Never touch the opinion, only work the reason", "Read the reasons aloud without naming the author", "Because is the word to teach here, explicitly"],
    referencia: "California CCSS W.1.1",
    observar: ["States an opinion clearly", "Gives a reason connected to the book", "Uses because or an equivalent"],
  },
  "Opinion with Linking Words": {
    titulo: "Cohesion in argument",
    contenido: "Linking words are where an opinion becomes an argument. They are also the easiest thing to teach explicitly and the fastest visible gain in second grade writing.",
    tips: ["Partner marks the gaps, teacher does not", "Keep the poster of linking words up during writing, not only during teaching", "Revise on the marks, that is the second draft"],
    referencia: "California CCSS W.2.1",
    observar: ["Uses at least two linking words", "Connects each reason to the opinion", "Revises after the partner's marks"],
  },
  "Paragraph with a Spine": {
    titulo: "Structured informative writing",
    contenido: "Requiring the page for every fact turns writing into reading. It is also the habit that prevents the paragraph that sounds informative and says nothing, which is the standard third grade failure mode.",
    tips: ["Strike out unsourced facts, consistently, from the first day", "The organiser stays until the structure is internal", "Three facts, not more, the structure is the target not the volume"],
    referencia: "California CCSS W.3.2; Donovan & Smolkin (2011)",
    observar: ["Writes a topic sentence that frames the paragraph", "Sources each fact with a page", "Closes the paragraph rather than stopping"],
  },
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

const SECUENCIA: Record<"CF" | "CT" | "O" | "EA" | "OCT", { titulo: string; objetivo: string; descripcion: string; materiales: string[]; ccss?: string; nivel?: "TK" | "K" | "1" | "2" | "3"; prerequisito?: boolean }[]> = {
  // ── FOUNDATIONAL SKILLS - phonological awareness, phonics, morphology 
  // Progresion TK → Grade 3. Cada paso citado al estandar oficial que lo
  // fundamenta: CCSS ELA de California, o PTKLF para TK.
  CF: [
    {
      titulo: "Sound Detectives",
      objetivo: "Attend to and discriminate sounds in the environment and in speech.",
      descripcion: "Children close their eyes for thirty seconds of silence, then name what they heard in a full sentence: I heard the sound of. The teacher plays contrasting sounds, loud and soft, near and far, and children sort them. Ends by listening for a sound inside a word.",
      materiales: ["Recorded environmental sounds", "Sound picture cards", "Triangle and bell"],
      ccss: "PTKLF.LL.PA.1",
      nivel: "TK",
      prerequisito: true,
    },
    {
      titulo: "Rhyme Basket",
      objetivo: "Recognize and enjoy rhyme in songs, verses and language play.",
      descripcion: "Pull two objects from the basket and say the names aloud. Children signal thumbs up when the words rhyme. Then sing a known rhyming song stopping before the last word so the group completes the pair. Each child offers one rhyming word for their own name, real or invented.",
      materiales: ["Basket with 12 familiar objects", "Song chart", "Name cards"],
      ccss: "PTKLF.LL.PA.2",
      nivel: "TK",
    },
    {
      titulo: "Clap the Beats",
      objetivo: "Segment spoken words into syllables with physical support.",
      descripcion: "Children walk in a line saying classmates names, clapping once per syllable and taking one step per clap. Then move to picture cards of two and three syllables. Children who clap every sound instead of the syllable get a second round with the teacher's hands over theirs.",
      materiales: ["Name cards", "Picture cards, two and three syllables", "Open floor space"],
      ccss: "PTKLF.LL.PA.3",
      nivel: "TK",
    },
    {
      titulo: "My Name Starts With",
      objetivo: "Identify the initial sound of familiar words, beginning with proper names.",
      descripcion: "The name song runs each morning. When a child's name comes up the group says the first sound before saying the whole name. Then the teacher holds up two picture cards and children choose the one that starts like their name. Sound only, no letters yet.",
      materiales: ["Name cards with photographs", "Picture cards", "Song chart"],
      ccss: "PTKLF.LL.PA.4",
      nivel: "TK",
    },
    {
      titulo: "Syllable Clap Parade",
      objetivo: "Count, pronounce, blend and segment syllables in spoken words.",
      descripcion: "Children segment and then blend: the teacher says a word in syllables and children join it back into a whole word, then reverse roles. Words come from the week's read aloud so meaning is already there. Record who can blend three syllables without support.",
      materiales: ["Word list from the read aloud", "Counters", "Whiteboard"],
      ccss: "RF.K.2b",
      nivel: "K",
    },
    {
      titulo: "Onset and Rime Puppets",
      objetivo: "Blend and segment onsets and rimes of single-syllable spoken words.",
      descripcion: "The puppet talks slowly and says a word split at the onset: /c/ - at. Children blend it and say the whole word. Then children split words for the puppet. Word families keep the rime constant so children hear the pattern: cat, hat, sat, mat.",
      materiales: ["Hand puppet", "Word family list", "Small whiteboard"],
      ccss: "RF.K.2c",
      nivel: "K",
    },
    {
      titulo: "First Sound Sort",
      objetivo: "Isolate and pronounce the initial sound in spoken words.",
      descripcion: "Three hoops on the floor, each with an anchor picture for a target sound. Children take a picture card, say the word slowly, isolate the first sound and place the card in the matching hoop. Each child says the sound in isolation before placing.",
      materiales: ["3 hoops", "24 picture cards", "Anchor pictures"],
      ccss: "RF.K.2d",
      nivel: "K",
    },
    {
      titulo: "Say It, Move It",
      objetivo: "Isolate and pronounce initial, medial vowel and final sounds in CVC words.",
      descripcion: "Each child has three counters and a strip. The teacher says a CVC word; the child pushes one counter per sound while saying it, then sweeps and says the whole word. The medial vowel is the hardest and the one to watch: mark who skips it.",
      materiales: ["Three counters per child", "Sound strips", "CVC word list"],
      ccss: "RF.K.2d",
      nivel: "K",
    },
    {
      titulo: "Sound Swap Songs",
      objetivo: "Add or substitute individual sounds in one-syllable words to make new words.",
      descripcion: "Sing a known song replacing the first sound of every word with the sound of the day. Then children choose the sound. This is the last and hardest step of the phonemic sequence and only works once segmentation is secure with the whole group.",
      materiales: ["Song chart", "Pointer", "Sound of the day card"],
      ccss: "RF.K.2e",
      nivel: "K",
    },
    {
      titulo: "Letter Sound Anchors",
      objetivo: "Produce the primary sound for each consonant.",
      descripcion: "One letter per session, with a verbal path for the shape and an anchor word chosen by the group. Children find that letter in the week's text and add the word they found to the anchor chart. Sound first, name second, always in that order.",
      materiales: ["Letter cards", "Anchor chart", "Decodable text"],
      ccss: "RF.K.3a",
      nivel: "K",
    },
    {
      titulo: "High Frequency Word Wall",
      objetivo: "Read common high-frequency words by sight.",
      descripcion: "Five words per cycle, always in a sentence, never as a list. Children find them in the week's text, mark them, and use each one in a sentence they invent. The wall grows with words they found themselves.",
      materiales: ["Word wall", "Highlighting tape", "Decodable text"],
      ccss: "RF.K.3c",
      nivel: "K",
    },
    {
      titulo: "Long or Short Vowel Sort",
      objetivo: "Distinguish long from short vowel sounds in spoken single-syllable words.",
      descripcion: "Two columns on the board. The teacher says a single-syllable word and children signal long or short before it is written. Only then does the word go up, so the ear leads the eye. Contrast pairs that differ only in the vowel: hop and hope.",
      materiales: ["Word list", "Whiteboard", "Signal cards"],
      ccss: "RF.1.2a",
      nivel: "1",
    },
    {
      titulo: "Blend the Blends",
      objetivo: "Orally produce single-syllable words by blending sounds, including consonant blends.",
      descripcion: "The teacher segments a word with a blend, /s/ /t/ /o/ /p/, and children blend and say it whole. Blends are where most of the group slows down because two consonants must be held without a vowel between them. Stay here longer than feels necessary.",
      materiales: ["Blend word list", "Counters"],
      ccss: "RF.1.2b",
      nivel: "1",
    },
    {
      titulo: "Digraph Detectives",
      objetivo: "Know the spelling-sound correspondences for common consonant digraphs.",
      descripcion: "Hunt for sh, ch, th and wh in the week's text. Each digraph found goes on the anchor chart with the word it came from, so the chart is built from their own reading, not handed to them. One digraph per session.",
      materiales: ["Anchor chart", "Decodable text", "Markers"],
      ccss: "RF.1.3a",
      nivel: "1",
    },
    {
      titulo: "Every Syllable Has a Vowel",
      objetivo: "Use knowledge that every syllable must have a vowel sound to determine the number of syllables in a printed word.",
      descripcion: "Children mark the vowels in a written word with a pencil dot, then split between them and read each part. The rule is stated once and used every time: if there is no vowel, it is not a syllable. Applied to words from their own reading.",
      materiales: ["Word cards", "Pencils", "Content texts"],
      ccss: "RF.1.3d",
      nivel: "1",
    },
    {
      titulo: "Vowel Team Teams",
      objetivo: "Know spelling-sound correspondences for additional common vowel teams.",
      descripcion: "Small groups each get a vowel team, ai, ea, oa, ee, and hunt for it in the week's text. Each team teaches its pattern to the class with three examples they found themselves, and adds the exceptions they could not explain.",
      materiales: ["Decodable and content texts", "Team charts"],
      ccss: "RF.2.3b",
      nivel: "2",
    },
    {
      titulo: "Prefix and Suffix Builders",
      objetivo: "Decode words with common prefixes and suffixes.",
      descripcion: "Base words on one color of card, affixes on another. Children build words, read them, and say what the affix did to the meaning. Reading and meaning happen in the same move, which is the point: an affix is a unit of sense, not just of sound.",
      materiales: ["Two-color word cards", "Word journals"],
      ccss: "RF.2.3d",
      nivel: "2",
    },
    {
      titulo: "Latin Suffix Lab",
      objetivo: "Decode words with common Latin suffixes.",
      descripcion: "Take -tion, -sion and -able. Children collect words from science and social studies texts, split them, and predict the meaning from the base plus the suffix before checking. The words come from content class, not from a reading list.",
      materiales: ["Content area texts", "Word journals", "Wall chart"],
      ccss: "RF.3.3b",
      nivel: "3",
    },
  ],
  // ── COMPREHENSION OF TEXT - literature and informational ────
  // Progresion TK → Grade 3. Cada paso citado al estandar oficial que lo
  // fundamenta: CCSS ELA de California, o PTKLF para TK.
  CT: [
    {
      titulo: "Picture Walk Predictions",
      objetivo: "Predict and comment on the content of a text using the illustrations.",
      descripcion: "Walk through the pictures of a new book without reading the words. Children say what they think happens. Write two predictions on sticky notes and revisit them after the read aloud to confirm or revise.",
      materiales: ["Picture book", "Sticky notes", "Marker"],
      ccss: "PTKLF.LL.CA.1",
      nivel: "TK",
      prerequisito: true,
    },
    {
      titulo: "What Happened First",
      objetivo: "Retell, with support, the main events of a familiar story.",
      descripcion: "Three picture cards from a story the group knows well, placed out of order on the floor. Children arrange them and tell each part. The story must already be familiar: this is about sequence, not about comprehension of new material.",
      materiales: ["Three story cards per group", "Floor space"],
      ccss: "PTKLF.LL.CA.2",
      nivel: "TK",
    },
    {
      titulo: "Ask Me Three",
      objetivo: "With prompting and support, ask and answer questions about key details in a text.",
      descripcion: "After reading, children generate three questions for a classmate using question cards: who, where, what happened. The partner answers pointing to the page that proves it. The teacher records who supports the answer with evidence.",
      materiales: ["Read aloud book", "Question cards"],
      ccss: "RL.K.1",
      nivel: "K",
    },
    {
      titulo: "Story Retell Ropes",
      objetivo: "With prompting and support, retell familiar stories, including key details.",
      descripcion: "Each child holds a rope with three knots: beginning, middle, end. They move their hand along the rope as they retell. Children who skip the middle get a second turn with the picture cards visible in front of them.",
      materiales: ["Ropes with three knots", "Story picture cards"],
      ccss: "RL.K.2",
      nivel: "K",
    },
    {
      titulo: "Character Feelings Map",
      objetivo: "Describe characters, settings and major events in a story, using key details.",
      descripcion: "Draw the character in the centre of the chart. Children add a feeling word and must point to the page that shows it. The emphasis is on evidence, not on opinion: how do we know she was scared.",
      materiales: ["Chart paper", "Feeling word cards", "The book"],
      ccss: "RL.1.3",
      nivel: "1",
    },
    {
      titulo: "Two Books, One Topic",
      objetivo: "Explain major differences between books that tell stories and books that give information.",
      descripcion: "Two books on the same subject, one narrative and one informational. Children sort five features into the right column: characters, facts, once upon a time, diagrams, an ending. Then choose which one they would use to answer a question.",
      materiales: ["Paired books", "Feature cards"],
      ccss: "RL.1.5",
      nivel: "1",
    },
    {
      titulo: "What Does the Author Want",
      objetivo: "Identify the main purpose of a text, including what the author wants to answer, explain or describe.",
      descripcion: "After reading, children choose between three purpose cards, to teach, to convince, to entertain, and defend the choice with one line from the text. Disagreement is kept, not resolved: two defensible answers is a better lesson than one right one.",
      materiales: ["Informational texts", "Purpose cards"],
      ccss: "RI.2.6",
      nivel: "2",
    },
    {
      titulo: "Two Texts, One Question",
      objetivo: "Compare and contrast the most important points and key details presented in two texts on the same topic.",
      descripcion: "Two short texts on one topic. Children fill a two-column chart with what each says, then mark what only one of them says. That difference is the discussion: why would one author include it and the other not.",
      materiales: ["Paired texts", "Comparison chart"],
      ccss: "RI.3.9",
      nivel: "3",
    },
  ],
  // ── ORAL LANGUAGE - speaking and listening ──────────────────
  // Progresion TK → Grade 3. Cada paso citado al estandar oficial que lo
  // fundamenta: CCSS ELA de California, o PTKLF para TK.
  O: [
    {
      titulo: "Mystery Bag Talk",
      objetivo: "Describe familiar objects using increasingly precise vocabulary.",
      descripcion: "A child reaches into the bag without looking and describes what they feel before pulling it out: size, texture, shape. The group guesses. The rule is that two descriptors must come before any guess is allowed.",
      materiales: ["Cloth bag", "Ten objects of contrasting texture"],
      ccss: "PTKLF.LL.LS.2",
      nivel: "TK",
      prerequisito: true,
    },
    {
      titulo: "Tell Me Your Morning",
      objetivo: "Use sentences of increasing complexity to narrate personal experiences.",
      descripcion: "Each child narrates one thing they did before school, using the visible frame: First I, then I. The frame stays on the wall all year. Record who sustains two connected sentences without prompting.",
      materiales: ["Sentence frame poster"],
      ccss: "PTKLF.LL.LS.3",
      nivel: "TK",
    },
    {
      titulo: "Morning Meeting Turn and Talk",
      objetivo: "Follow agreed-upon rules for discussions, listening and taking turns.",
      descripcion: "Question of the day on the easel. Partners talk: one speaks while the other holds the listening card, then they swap. Two pairs share out with the whole group, reporting what their partner said, not what they said.",
      materiales: ["Easel", "Question card", "Listening cards"],
      ccss: "SL.K.1a",
      nivel: "K",
    },
    {
      titulo: "Ask to Understand",
      objetivo: "Ask and answer questions in order to seek help, get information, or clarify.",
      descripcion: "The teacher gives a deliberately incomplete instruction. Children must ask the question that completes it. The question gets celebrated, not the answer. Repeat with a partner giving the incomplete instruction.",
      materiales: ["Instruction cards"],
      ccss: "SL.K.3",
      nivel: "K",
    },
    {
      titulo: "Describe So I Can Draw It",
      objetivo: "Describe people, places, things and events with relevant details.",
      descripcion: "One child describes a picture only they can see. The partner draws from the description without asking questions in the first round. Then compare. Second round the partner may ask three questions. The gap between the two drawings is the lesson.",
      materiales: ["Picture cards", "Paper and pencils"],
      ccss: "SL.1.4",
      nivel: "1",
    },
    {
      titulo: "Build on What They Said",
      objetivo: "Build on others' talk by responding to the comments of others through multiple exchanges.",
      descripcion: "Three sentence starters on the wall: I agree because, I want to add, I thought something different. Every contribution after the first must begin with one of them. The teacher tracks the chain of exchanges rather than the number of speakers.",
      materiales: ["Sentence starter posters"],
      ccss: "SL.1.1b",
      nivel: "1",
    },
    {
      titulo: "Partner Reading Check",
      objetivo: "Build on others' talk by linking their comments to the remarks of others.",
      descripcion: "Partners take turns reading a paragraph aloud. The listener does not correct: they mark where the reader stopped and self-corrected. Afterwards they discuss what made those spots hard. The mark is the data.",
      materiales: ["Grade-level texts", "Marking strips"],
      ccss: "SL.2.1b",
      nivel: "2",
    },
    {
      titulo: "Say It Again, Better",
      objetivo: "Report on a topic with appropriate facts and relevant descriptive details, speaking clearly at an understandable pace.",
      descripcion: "A child reports on something they read. The group asks for one more detail and the child says it again, fuller. The second version is the one that counts and the only one recorded.",
      materiales: ["Reading logs", "Timer"],
      ccss: "SL.3.4",
      nivel: "3",
    },
  ],
  // ── EMERGENT AND DEVELOPING WRITING ─────────────────────────
  // Progresion TK → Grade 3. Cada paso citado al estandar oficial que lo
  // fundamenta: CCSS ELA de California, o PTKLF para TK.
  EA: [
    {
      titulo: "Sign In Every Morning",
      objetivo: "Write own name with increasing conventional approximation.",
      descripcion: "The sign-in sheet is at the door. Every child signs in on arrival at whatever stage they are: a mark, a first letter, the whole name. Nobody is corrected. The sheets are kept in order, so the progression across weeks is visible without any extra assessment time.",
      materiales: ["Sign-in clipboard", "Pencils", "Name models at eye level"],
      ccss: "PTKLF.LL.WR.2",
      nivel: "TK",
      prerequisito: true,
    },
    {
      titulo: "Draw It, Tell It",
      objetivo: "Produce marks, scribbles and letters with communicative intent.",
      descripcion: "Children draw something they know well and then tell a partner about it while pointing at their own drawing. The teacher writes one sentence of what the child said underneath, in front of them, saying each word aloud as it is written.",
      materiales: ["Paper", "Markers"],
      ccss: "PTKLF.LL.WR.1",
      nivel: "TK",
    },
    {
      titulo: "Draw, Label, Tell",
      objetivo: "Use drawing, dictating and writing to compose informative texts.",
      descripcion: "Children draw something they know a lot about, add at least one label using the sounds they hear, and tell it to a partner. Any spelling approximation counts: the target is sound to letter, not correctness.",
      materiales: ["Paper", "Pencils", "Alphabet strips"],
      ccss: "W.K.2",
      nivel: "K",
    },
    {
      titulo: "Letter Formation Trays",
      objetivo: "Print many upper- and lowercase letters.",
      descripcion: "Model the letter with a spoken path, start at the top, pull down. Children trace it in the sand tray three times saying the path, then write it once on paper. Two letters per session, no more, and always letters whose sound they already own.",
      materiales: ["Sand trays", "Letter cards", "Paper"],
      ccss: "L.K.1a",
      nivel: "K",
    },
    {
      titulo: "Sentence of the Day",
      objetivo: "Write informative texts naming a topic and supplying facts about it.",
      descripcion: "A two-word idea goes on the board. The class grows it word by word until it is a sentence that says something. Each child copies the final version and adds one word of their own. The added word is what gets shared.",
      materiales: ["Board", "Notebooks"],
      ccss: "W.1.2",
      nivel: "1",
    },
    {
      titulo: "Opinion with a Reason",
      objetivo: "Write opinion pieces stating an opinion and supplying a reason for it.",
      descripcion: "Children choose their favourite of three read alouds, place their sticker on the graph and write the reason. The reason is what gets revised, never the opinion. The graph makes the class distribution visible and the reasons get read aloud.",
      materiales: ["Book covers", "Stickers", "Chart", "Paper strips"],
      ccss: "W.1.1",
      nivel: "1",
    },
    {
      titulo: "Opinion with Linking Words",
      objetivo: "Write opinion pieces using linking words to connect opinion and reasons.",
      descripcion: "Children write an opinion about a shared read using because, and and also at least twice. Then they swap and the partner marks where the link is missing. The revision is done on the partner's marks, not on the teacher's.",
      materiales: ["Shared text", "Linking word poster", "Paper"],
      ccss: "W.2.1",
      nivel: "2",
    },
    {
      titulo: "Paragraph with a Spine",
      objetivo: "Write informative texts to examine a topic and convey ideas and information clearly.",
      descripcion: "Topic sentence first, three facts from the paired texts, closing sentence. Each fact must come from the text and be marked with the page where it was found. The page mark is not optional: unsourced facts get struck out.",
      materiales: ["Paired texts", "Paragraph organiser"],
      ccss: "W.3.2",
      nivel: "3",
    },
  ],
  // OCT: alias O+CT combinados, se resuelve en runtime
  OCT: [],
}

// Hasta donde llega cada nivel dentro de la progresion de su eje.
// Reemplaza al corte binario de dos salas: California va de TK a 3er grado
// como un continuo (P-3 Learning Progressions, CDE 2025), no como cinco
// curriculums sueltos. Cada nivel ve todo lo anterior mas lo suyo.
const CORTES_POR_NIVEL: Record<string, Record<string, number>> = {
  "TK": { CF: 4, CT: 2, O: 2, EA: 2 },
  "K": { CF: 11, CT: 4, O: 4, EA: 4 },
  "G1": { CF: 15, CT: 6, O: 6, EA: 6 },
  "G2": { CF: 17, CT: 7, O: 7, EA: 7 },
  "G3": { CF: 18, CT: 8, O: 8, EA: 8 },
}

const SALAS_4_ANIOS = ["tk"]
// ── MATERNAL — SALA DE 2 ANOS ───────────────────────────────────────────
// Ejes heredados del modelo argentino de maternal. Inactivos en ALBA US:
// nivelDeSala nunca devuelve "2" ni "3", asi que estas ramas no se alcanzan.
// La capacidad es la lente con la que se observa; la alfabetizacion sigue
// siendo el objetivo: toda actividad, sea de la capacidad que sea, tiene que
// hacer trabajar el lenguaje.
const SALAS_MATERNAL = ["PINITOS TT", "PINITOS TM", "NARANJOS TM", "NARANJOS TT", "PRUEBA MATERNAL"]

function esDeMaternal(sala: string): boolean {
  const s = (sala || "").toLowerCase().replace(/\s/g, "")
  return SALAS_MATERNAL.some((ref) => s.includes(ref.toLowerCase().replace(/\s/g, "")))
}

// ── EJES DE SALA DE 2 (DC maternal, bloque Lengua Oral) ─────────────────
// El EJE ordena que se ensena; la CAPACIDAD es la lente con la que se observa.
// La actividad sale del eje, no de la capacidad.
// Las CINCO AREAS del DC de Jardin Maternal, no solo lenguaje. Los cuatro
// primeros son de Comunicacion y Expresion (Lengua Oral); los otros cuatro
// cubren las areas restantes, con sus pasos derivados de los objetivos de
// aprendizaje de SALA DE 2 del Diseno.
const EJES_SALA2 = [
  { key: "USO", nombre: "Uso de la lengua" },
  { key: "ORA", nombre: "Oraciones" },
  { key: "VOC", nombre: "Vocabulario" },
  { key: "ESC", nombre: "La escritura comunica" },
  { key: "JUE", nombre: "Desarrollo del juego" },
  { key: "COR", nombre: "Desarrollo corporal" },
  { key: "AMB", nombre: "Exploracion del ambiente" },
  { key: "PER", nombre: "Desarrollo personal y social" },
] as const

const SECUENCIA_SALA2: Record<string, { titulo: string; objetivo: string; descripcion: string; materiales: string[]; dccaba?: string }[]> = {
  USO: [
    { titulo: "Responde a su nombre y a consignas simples", objetivo: "Reconocer su nombre y responder a preguntas e instrucciones breves", descripcion: "En rondas y momentos de rutina nombra a cada nino y espera su respuesta: la mirada, un gesto, una palabra. Da consignas de un solo paso acompanadas de gesto.", materiales: ["Ninguno"], dccaba: "DC CABA Maternal - Lengua Oral: responder preguntas e instrucciones simples" },
    { titulo: "Expresa lo que quiere con palabras", objetivo: "Usar el lenguaje para saludar, nombrar, pedir y llamar la atencion", descripcion: "Genera situaciones donde decir algo tiene un efecto: un objeto a la vista pero fuera de alcance, saludar al entrar, elegir entre dos cosas nombrandolas.", materiales: ["Objetos conocidos de la sala"], dccaba: "DC CABA Maternal - Lengua Oral: expresar intenciones comunicativas" },
    { titulo: "Conversa por turnos", objetivo: "Participar de intercambios de uno o dos turnos", descripcion: "Juegos de ida y vuelta: deci algo y espera. Sostene el silencio para dar lugar a la respuesta, sea palabra, gesto o vocalizacion, y retomala en palabras.", materiales: ["Titeres u objetos que aparecen y desaparecen"], dccaba: "DC CABA Maternal - Lengua Oral: intercambios de uno o dos turnos" },
    { titulo: "Pide ayuda con palabras", objetivo: "Usar el lenguaje para pedir lo que necesita", descripcion: "Situaciones donde hace falta ayuda: espera el pedido antes de intervenir y ofrece la palabra si no aparece.", materiales: ["Frascos o cajas dificiles de abrir"], dccaba: "DC CABA Maternal - Lengua Oral: uso de la lengua en intercambios" },
  ],
  ORA: [
    { titulo: "Comprende consignas de dos partes", objetivo: "Entender enunciados con dos elementos", descripcion: "Da consignas de dos partes en situaciones reales: agarra la pelota y ponela en la caja. Acompana con gesto las primeras veces y despues solo con la palabra.", materiales: ["Objetos de la sala", "Cajas o canastos"], dccaba: "DC CABA Maternal - Lengua Oral: comprension de oraciones" },
    { titulo: "Arma frases de dos palabras", objetivo: "Producir combinaciones de dos palabras", descripcion: "Modela frases cortas sobre lo que esta pasando y espera que las completen o repitan. Aprovecha las acciones reales de la sala para nombrarlas mientras suceden.", materiales: ["Ninguno"], dccaba: "DC CABA Maternal - Lengua Oral: produccion de oraciones" },
    { titulo: "Arma frases de tres palabras", objetivo: "Producir oraciones de tres palabras con orden sujeto-verbo-objeto", descripcion: "Nombra lo que hace cada nino con una frase completa y esperala de vuelta. Repeti la misma estructura muchas veces con distintos protagonistas.", materiales: ["Ninguno"], dccaba: "DC CABA Maternal - Lengua Oral: oraciones con orden canonico" },
    { titulo: "Cuenta algo que paso", objetivo: "Relatar un hecho reciente con apoyo del adulto", descripcion: "Al final de la jornada retoma algo que paso y ayudalos a contarlo, poniendo vos las palabras que faltan.", materiales: ["Fotos o el objeto que se uso"], dccaba: "DC CABA Maternal - Lengua Oral: produccion" },
  ],
  VOC: [
    { titulo: "Nombra lo que hay en la sala", objetivo: "Incorporar palabras para nombrar objetos del entorno", descripcion: "Presenta un objeto o escena y nombralo muchas veces, en frases distintas. Ellos repiten, senalan y buscan. Retoma la misma palabra en dias siguientes.", materiales: ["Objetos reales", "Imagenes grandes"], dccaba: "DC CABA Maternal - Lengua Oral: adquisicion de palabras nuevas" },
    { titulo: "Agrupa por categorias", objetivo: "Reunir palabras que pertenecen a un mismo grupo", descripcion: "Juegos de juntar: todo lo que se come, todo lo que se pone. Nombra la categoria mientras la arman.", materiales: ["Objetos o imagenes de categorias conocidas"], dccaba: "DC CABA Maternal - Lengua Oral: vocabulario" },
    { titulo: "Palabras que dicen donde", objetivo: "Comprender arriba, abajo, adentro, afuera", descripcion: "Juegos corporales y con objetos donde la palabra indica el lugar. Deci la palabra y espera que la accion aparezca.", materiales: ["Cajas, tuneles, telas"], dccaba: "DC CABA Maternal - Lengua Oral: vocabulario" },
    { titulo: "Escucha cuentos y canciones", objetivo: "Incorporar vocabulario en situaciones de lectura y canto", descripcion: "Lee y canta con pausas a proposito para que completen. Repeti el mismo cuento o cancion varios dias hasta que anticipen lo que viene.", materiales: ["Libros de imagenes", "Canciones conocidas"], dccaba: "DC CABA Maternal - Lengua Oral: participar de situaciones de lectura" },
  ],
  // ── Pasos de las otras cuatro areas del DC de Jardin Maternal ────────
  JUE: [
    { titulo: "Elige con que jugar", objetivo: "Manifestar gustos y preferencias eligiendo juegos u objetos", descripcion: "Poné al alcance dos o tres canastos con objetos distintos y dejalos elegir. No dirijas: mira que agarra cada uno y cuanto se queda. Nombra lo que eligio: 'agarraste el auto'.", materiales: ["Canastos", "Objetos variados de la sala"], dccaba: "DC CABA Maternal - Juego, sala de 2: manifestar gustos y preferencias" },
    { titulo: "Juego de imitar", objetivo: "Enriquecer el juego simbolico a partir de la interaccion con otros", descripcion: "Ofrece objetos de la vida diaria —tazas, cucharas, telas, munecos— y sumate al juego imitando: dale de comer al muneco, tapalo. Ellos copian y agregan lo suyo.", materiales: ["Vajilla de juguete", "Munecos", "Telas"], dccaba: "DC CABA Maternal - Juego, sala de 2: juego simbolico" },
    { titulo: "Como hago que entre", objetivo: "Sortear los desafios que los materiales proponen creando nuevas formas de manipularlos", descripcion: "Da objetos y recipientes de distintos tamanos: algunos entran y otros no. Deja que prueben solos. Cuando no sale, espera antes de ayudar y despues pregunta: 'y si probas con este?'.", materiales: ["Cajas y frascos de distintos tamanos", "Objetos que entren y otros que no"], dccaba: "DC CABA Maternal - Juego, sala de 2: resolver desafios de los materiales" },
    { titulo: "Guardamos juntos", objetivo: "Participar cooperativamente en rutinas de cuidado y orden de los materiales", descripcion: "Al terminar de jugar, canta siempre la misma cancion de guardar y da a cada uno un objeto para llevar a su lugar. La repeticion diaria es lo que instala la rutina.", materiales: ["Los juguetes de la sala", "Canastos con su lugar fijo"], dccaba: "DC CABA Maternal - Juego, sala de 2: autonomia emergente en el orden" },
  ],
  COR: [
    { titulo: "Todo lo que puedo hacer", objetivo: "Iniciarse en el conocimiento del cuerpo reconociendo posibilidades de movimiento", descripcion: "Arma un recorrido con lo que haya: trepar a un almohadon, pasar por debajo de una mesa, caminar sobre una linea. Hacelo vos primero y que te sigan.", materiales: ["Almohadones", "Telas", "Cinta para marcar el piso"], dccaba: "DC CABA Maternal - Corporal, sala de 2: posibilidades de movimiento" },
    { titulo: "Rapido y despacio", objetivo: "Desarrollar habilidades motoras explorando distintas posibilidades", descripcion: "Con musica, alterna momentos rapidos y lentos. Cuando para la musica, todos se quedan quietos. Repetilo muchas veces: la anticipacion es lo que los engancha.", materiales: ["Musica", "Espacio libre"], dccaba: "DC CABA Maternal - Corporal, sala de 2: habilidades motoras" },
    { titulo: "Mi cuerpo dice", objetivo: "Expresar con el cuerpo emociones y sensaciones", descripcion: "Con una tela o una musica, propone moverse como si tuvieran frio, como si estuvieran cansados, como si algo los alegrara. Nombra vos lo que ves: 'te estas estirando'.", materiales: ["Telas livianas", "Musica"], dccaba: "DC CABA Maternal - Corporal, sala de 2: expresar con el cuerpo" },
    { titulo: "El juego tiene reglas", objetivo: "Iniciarse en la comprension del sentido de las reglas en propuestas ludicas", descripcion: "Juegos con una sola regla clara y repetida: correr cuando suena, parar cuando no suena. La regla tiene que ser una sola y siempre la misma.", materiales: ["Un instrumento o palmas"], dccaba: "DC CABA Maternal - Corporal, sala de 2: sentido de las reglas" },
  ],
  AMB: [
    { titulo: "Que pasa si", objetivo: "Sostener la exploracion de objetos prestando atencion a los cambios que se producen", descripcion: "Poné agua en recipientes y objetos que floten y se hundan. Dejalos probar. Cuando algo cambia, nombralo: 'se hundio', 'se lleno'.", materiales: ["Bateas con agua", "Objetos que floten y se hundan", "Vasos"], dccaba: "DC CABA Maternal - Ambiente, sala de 2: exploracion y cambios" },
    { titulo: "Junto los que van juntos", objetivo: "Agrupar y separar objetos segun caracteristicas observables", descripcion: "Da una coleccion de objetos de dos tipos bien distintos y dos canastos. Que los repartan. Nombra el criterio mientras lo hacen: 'las pelotas aca, los autos alla'.", materiales: ["Coleccion de objetos de dos tipos", "Dos canastos"], dccaba: "DC CABA Maternal - Ambiente, sala de 2: agrupar y comparar" },
    { titulo: "Grande y chico", objetivo: "Comparar objetos por tamano", descripcion: "Ofrece objetos iguales en dos tamanos y dos recipientes acordes. Que descubran cual entra donde. Nombra 'grande' y 'chico' cada vez.", materiales: ["Objetos iguales en dos tamanos", "Recipientes"], dccaba: "DC CABA Maternal - Ambiente, sala de 2: comparar por tamano" },
    { titulo: "Busco otra manera", objetivo: "Explorar diferentes formas de alcanzar un objeto o lograr un proposito", descripcion: "Poné algo deseado a la vista pero fuera de alcance, con elementos cerca que sirvan para conseguirlo. Espera antes de intervenir: el valor esta en que prueben.", materiales: ["Un objeto atractivo", "Un banquito o un palo"], dccaba: "DC CABA Maternal - Ambiente, sala de 2: modificar estrategias" },
  ],
  PER: [
    { titulo: "Puedo solo", objetivo: "Acrecentar la autonomia en los habitos de higiene, orden y alimentacion", descripcion: "En la merienda o el guardado, dales la parte que ya pueden hacer solos: servirse con una jarra chica, llevar su vaso, colgar su toalla. Espera aunque tarde.", materiales: ["Elementos de la rutina, a su altura"], dccaba: "DC CABA Maternal - Personal y social, sala de 2: autonomia en los habitos" },
    { titulo: "Yo elijo", objetivo: "Tomar decisiones ligadas a la eleccion de juguetes y juegos preferidos", descripcion: "Ofrece siempre dos opciones concretas y visibles, y respeta lo que eligen aunque elijan lo mismo todos los dias. Nombra la eleccion: 'elegiste el rojo'.", materiales: ["Dos opciones a la vista"], dccaba: "DC CABA Maternal - Personal y social, sala de 2: tomar decisiones" },
    { titulo: "Esperar un poquito", objetivo: "Demostrar interes y concentracion respetando turnos y tolerando la espera", descripcion: "Juegos de a dos donde hay que esperar el turno, muy cortos. Nombra la espera: 'ahora Juan, despues vos'. Los primeros dias la espera dura segundos.", materiales: ["Un objeto que circule"], dccaba: "DC CABA Maternal - Personal y social, sala de 2: turnos y espera" },
    { titulo: "Como me siento", objetivo: "Iniciarse en la identificacion de algunas emociones dejandose acompanar", descripcion: "Cuando aparece una emocion fuerte, ponele nombre en el momento: 'estas enojado porque se termino'. No se ensena en una actividad aparte: se ensena cuando pasa.", materiales: ["Ninguno"], dccaba: "DC CABA Maternal - Personal y social, sala de 2: identificar emociones" },
  ],
  ESC: [
    { titulo: "Los libros dicen cosas", objetivo: "Descubrir el libro como objeto que comunica", descripcion: "Ofrece libros para explorar libremente y lee en voz alta senalando. Nombra lo que ves en las imagenes.", materiales: ["Libros resistentes de imagenes"], dccaba: "DC CABA Maternal - Lengua Oral: reconocimiento de la escritura" },
    { titulo: "Su nombre en su lugar", objetivo: "Reconocer su nombre escrito como marca propia", descripcion: "Pone carteles con los nombres en las perchas y las cajas. Leelos en voz alta senalando, para que descubran que esas marcas dicen siempre lo mismo. No se copia ni se traza.", materiales: ["Carteles con los nombres"], dccaba: "DC CABA Maternal - Lengua Oral: la escritura como medio comunicativo" },
    { titulo: "Dejar marcas", objetivo: "Explorar el trazo espontaneo sobre distintos soportes", descripcion: "Ofrece superficies grandes y materiales para dejar marcas con todo el brazo. Nombra lo que hicieron sin pedir que dibujen algo.", materiales: ["Papel grande", "Crayones gruesos"], dccaba: "DC CABA Maternal - Lengua Oral: precursores" },
  ],
}

// ── EJES DE SALA DE 3 (DC sala de 3, area Lengua) ───────────────────────
// Tres bloques, tal como los define el Diseno: Comprension, Produccion,
// y Precursores y sistema de escritura.
// Las CINCO AREAS del DC de Sala de 3. Los tres primeros son los bloques de
// Lengua; los otros cuatro cubren las areas restantes del Diseno.
const EJES_SALA3 = [
  { key: "COMP", nombre: "Comprension" },
  { key: "PROD", nombre: "Produccion" },
  { key: "PREC", nombre: "Precursores y sistema de escritura" },
  { key: "MAT", nombre: "Matematica" },
  { key: "IND", nombre: "Indagacion del ambiente" },
  { key: "EFI", nombre: "Educacion Fisica" },
  { key: "EXP", nombre: "Lenguajes expresivos" },
] as const

const SECUENCIA_SALA3: Record<string, { titulo: string; objetivo: string; descripcion: string; materiales: string[]; dccaba?: string }[]> = {
  COMP: [
    { titulo: "Vocabulario del entorno y categorias", objetivo: "Clasificar palabras segun categorias semanticas", descripcion: "Juegos de agrupar: animales, alimentos, prendas. Nombra la categoria mientras arman los grupos y pregunta por que va ahi.", materiales: ["Imagenes u objetos de categorias conocidas"], dccaba: "DC CABA Sala de 3 - Lengua, bloque Comprension: clasificacion del vocabulario" },
    { titulo: "Palabras que dicen donde y cuando", objetivo: "Comprender contrastes locativos y temporales", descripcion: "Juegos corporales con arriba, abajo, detras, delante, cerca, lejos. Despues los del tiempo: antes, despues, dia, noche. La palabra manda la accion.", materiales: ["Objetos, aros, telas"], dccaba: "DC CABA Sala de 3 - Comprension: conceptos locativos y temporales" },
    { titulo: "Palabras que suenan parecido", objetivo: "Distinguir palabras que se diferencian por minimos contrastes", descripcion: "Juegos con pares como masa y mesa, pero y perro. Deci una y que senalen la imagen. Exagera el contraste al principio.", materiales: ["Imagenes de pares minimos"], dccaba: "DC CABA Sala de 3 - Comprension: contrastes fonologicos minimos" },
    { titulo: "Escuchar un cuento y comentarlo", objetivo: "Comprender textos leidos por la docente y responder", descripcion: "Lee con pausas y hace preguntas: que paso, que le paso a, que te parece que va a pasar. Aceptamos comentarios espontaneos.", materiales: ["Cuentos breves con imagenes"], dccaba: "DC CABA Sala de 3 - Comprension guiada de textos orales" },
    { titulo: "Anticipar de que se trata", objetivo: "Anticipar el contenido a partir del titulo y las imagenes", descripcion: "Antes de leer, mostra la tapa y pregunta de que creen que se trata. Al terminar, volve a la anticipacion y comparen.", materiales: ["Libros con tapa ilustrada"], dccaba: "DC CABA Sala de 3 - Comprension" },
  ],
  PROD: [
    { titulo: "Oraciones completas para pedir y contar", objetivo: "Producir oraciones completas en situaciones reales", descripcion: "En los momentos de la rutina, espera la frase completa antes de dar lo que piden, ofreciendo el modelo si hace falta.", materiales: ["Ninguno"], dccaba: "DC CABA Sala de 3 - Produccion: oraciones completas" },
    { titulo: "Turnos de habla y cortesia", objetivo: "Respetar turnos y usar formulas de cortesia", descripcion: "En la ronda, un objeto marca de quien es la palabra. Nombra el turno y sostene la espera. Modela por favor y gracias en situaciones reales.", materiales: ["Un objeto que circule"], dccaba: "DC CABA Sala de 3 - Produccion: turnos de habla y formulas de cortesia" },
    { titulo: "Contar algo que paso", objetivo: "Narrar un hecho propio con inicio y final", descripcion: "Da un espacio fijo para que uno cuente algo que le paso. Ayudalo con preguntas: y despues que paso, quien estaba.", materiales: ["Ninguno"], dccaba: "DC CABA Sala de 3 - Produccion: narracion" },
    { titulo: "Recontar un cuento conocido", objetivo: "Reconstruir oralmente un cuento ya escuchado", descripcion: "Despues de leer el mismo cuento varias veces, pedi que lo cuenten ellos. Usa las imagenes como apoyo del orden.", materiales: ["El cuento y sus imagenes"], dccaba: "DC CABA Sala de 3 - Produccion: recontado" },
    { titulo: "Describir con palabras precisas", objetivo: "Describir objetos y escenas con vocabulario preciso", descripcion: "Juegos de adivinar: uno describe y los demas buscan. Empuja hacia palabras mas exactas que grande o lindo.", materiales: ["Objetos variados o laminas"], dccaba: "DC CABA Sala de 3 - Produccion: vocabulario preciso" },
  ],
  // ── Pasos de las otras cuatro areas del DC de Sala de 3 ──────────────
  MAT: [
    { titulo: "Contamos la coleccion", objetivo: "Contar colecciones de objetos en situaciones con sentido", descripcion: "Aprovecha una situacion real: cuantos vasos faltan, cuantos somos hoy. Que cuenten senalando cada objeto. Si usan los dedos, dejalos: es una estrategia valida a esta edad.", materiales: ["Objetos de la sala para contar"], dccaba: "DC CABA Sala de 3 - Matematica, bloque Numero: contar colecciones" },
    { titulo: "Donde hay mas", objetivo: "Comparar grupos de objetos", descripcion: "Presenta dos grupos con cantidades bien distintas y pregunta donde hay mas. Que lo comprueben repartiendo de a uno. Despues acerca las cantidades para que tengan que contar.", materiales: ["Dos colecciones de objetos", "Bandejas"], dccaba: "DC CABA Sala de 3 - Matematica: comparar grupos de objetos" },
    { titulo: "Cuantos faltan", objetivo: "Anticipar cuantos hay o cuantos faltan", descripcion: "En una situacion real —repartir servilletas, buscar sillas— pediles que anticipen antes de traer: 'cuantas necesitamos?'. Despues comprueban.", materiales: ["Los elementos de la rutina"], dccaba: "DC CABA Sala de 3 - Matematica: anticipar cantidades" },
    { titulo: "Donde esta y como es", objetivo: "Explorar posiciones, recorridos y formas con el cuerpo y con objetos", descripcion: "Recorridos donde haya que pasar por arriba, por abajo, entre dos cosas. Nombra la posicion mientras pasan. Despues, que lo armen ellos para otro companero.", materiales: ["Aros", "Cajas", "Sillas"], dccaba: "DC CABA Sala de 3 - Matematica, bloque Espacio y formas" },
  ],
  IND: [
    { titulo: "Miramos de cerca", objetivo: "Observar el entorno natural con detalle", descripcion: "Salgan con lupas a mirar una parte chica del patio. Que cada uno traiga o senale algo que le llamo la atencion, y lo describa al grupo.", materiales: ["Lupas", "El patio o una planta de la sala"], dccaba: "DC CABA Sala de 3 - Indagacion del ambiente: observacion del entorno natural" },
    { titulo: "Que cambio", objetivo: "Registrar cambios en el entorno a lo largo del tiempo", descripcion: "Elijan algo que cambie —una planta, el tiempo, algo que se moja o se seca— y observenlo varios dias seguidos. Registren con dibujos o fotos y comparen.", materiales: ["Una planta o algo que cambie", "Afiche para registrar"], dccaba: "DC CABA Sala de 3 - Indagacion del ambiente: cambios en el entorno" },
    { titulo: "Como funciona", objetivo: "Explorar objetos del entorno social y sus usos", descripcion: "Traé objetos de uso cotidiano y dejalos explorar: para que sirve, quien lo usa, como funciona. Que prueben antes de que vos expliques.", materiales: ["Objetos de uso cotidiano seguros"], dccaba: "DC CABA Sala de 3 - Indagacion del ambiente: entorno social" },
    { titulo: "Nos preguntamos", objetivo: "Formular preguntas sobre lo que pasa alrededor", descripcion: "A partir de algo que los sorprendio, anota en un afiche las preguntas que van saliendo. No las contestes todas: elegi una y busquen juntos como averiguarlo.", materiales: ["Afiche", "Marcador"], dccaba: "DC CABA Sala de 3 - Indagacion del ambiente: hacerse preguntas" },
  ],
  EFI: [
    { titulo: "Me muevo de muchas formas", objetivo: "Explorar las posibilidades de movimiento del propio cuerpo", descripcion: "Propone desplazarse de distintas maneras: gateando, en puntas de pie, como si pesaran mucho. Que cada uno invente una y los demas la copien.", materiales: ["Espacio libre"], dccaba: "DC CABA Sala de 3 - Educacion Fisica: posibilidades de movimiento" },
    { titulo: "El equilibrio", objetivo: "Desarrollar el equilibrio y la coordinacion", descripcion: "Caminar sobre una linea en el piso, pasar por arriba de algo bajo, llevar un objeto sin que se caiga. Aumenta la dificultad de a poco.", materiales: ["Cinta para marcar el piso", "Objetos para transportar"], dccaba: "DC CABA Sala de 3 - Educacion Fisica: equilibrio y coordinacion" },
    { titulo: "Juegos con otros", objetivo: "Participar en juegos grupales respetando reglas simples", descripcion: "Juegos tradicionales con una sola regla clara: la mancha, las estatuas. Antes de empezar, que expliquen ellos la regla con sus palabras.", materiales: ["Espacio libre"], dccaba: "DC CABA Sala de 3 - Educacion Fisica: juegos grupales" },
    { titulo: "Manos que pueden", objetivo: "Desarrollar la motricidad fina", descripcion: "Enhebrar, embocar, trasvasar con cuchara, abrochar. Ofrece varias opciones al mismo tiempo y dejalos elegir cual quieren.", materiales: ["Cuentas y cordones", "Recipientes", "Cucharas"], dccaba: "DC CABA Sala de 3 - Educacion Fisica: motricidad fina" },
  ],
  EXP: [
    { titulo: "Dejamos marcas", objetivo: "Explorar las posibilidades expresivas de la plastica", descripcion: "Ofrece un material por vez y en formato grande: pintura con las manos, tiza mojada, crayones sobre papel afiche. Que exploren antes de pedirles que hagan algo.", materiales: ["Papel grande", "Pintura o tizas", "Crayones gruesos"], dccaba: "DC CABA Sala de 3 - Lenguajes expresivos: plastica" },
    { titulo: "Sonidos y silencio", objetivo: "Explorar el sonido, el ritmo y el silencio", descripcion: "Con instrumentos o con el cuerpo, alterna sonido y silencio. Que sigan un ritmo simple y despues propongan ellos uno.", materiales: ["Instrumentos simples o palmas"], dccaba: "DC CABA Sala de 3 - Lenguajes expresivos: musica" },
    { titulo: "Como si fuera", objetivo: "Participar de situaciones de juego dramatico", descripcion: "Arma un rincon con objetos de un contexto —la verduleria, el doctor— y sumate al juego dando pie: 'buenas tardes, que tiene hoy?'. Salite cuando el juego se sostiene solo.", materiales: ["Objetos del contexto elegido", "Telas"], dccaba: "DC CABA Sala de 3 - Lenguajes expresivos: juego dramatico" },
    { titulo: "Mi cuerpo cuenta", objetivo: "Expresar con el cuerpo ideas y emociones", descripcion: "Con musica de climas distintos, propone moverse como lo que la musica sugiere. Nombra lo que ves sin corregir: no hay una forma correcta.", materiales: ["Musica de distintos climas", "Telas livianas"], dccaba: "DC CABA Sala de 3 - Lenguajes expresivos: expresion corporal" },
  ],
  PREC: [
    { titulo: "Cuantas palabras tiene", objetivo: "Reconocer palabras dentro de la cadena hablada", descripcion: "Deci una oracion corta y que pongan una ficha por cada palabra. Compara oraciones largas y cortas: lo que se cuenta son las palabras, no lo que dura decirlas.", materiales: ["Fichas o tapitas"], dccaba: "DC CABA Sala de 3 - Precursores: reconocimiento de palabras en la cadena hablada" },
    { titulo: "Las palabras se separan en golpes", objetivo: "Reconocer silabas dentro de la palabra", descripcion: "Palmear los nombres del grupo y las palabras del proyecto. Primero con vos, despues solos. Compara cuales tienen mas golpes.", materiales: ["Ninguno"], dccaba: "DC CABA Sala de 3 - Precursores: reconocimiento de silabas" },
    { titulo: "Palabras que terminan igual", objetivo: "Reconocer y producir rimas jugando", descripcion: "Poesias y canciones con rima, con pausa antes de la palabra final para que la completen. Despues, buscar otras que rimen.", materiales: ["Poesias y canciones conocidas"], dccaba: "DC CABA Sala de 3 - Precursores: rimas en actividades ludicas" },
    { titulo: "La escritura dice algo", objetivo: "Reconocer que la escritura comunica significados", descripcion: "Usa carteles reales de la sala y leelos senalando. Muestra que dicen siempre lo mismo aunque cambie quien lee.", materiales: ["Carteles, envases, libros"], dccaba: "DC CABA Sala de 3 - Precursores: la escritura comunica significados" },
    { titulo: "Como es un libro", objetivo: "Reconocer las convenciones del sistema de escritura", descripcion: "Antes de leer, mostra la tapa, el titulo, por donde se empieza y hacia donde va la lectura. Repetilo cada vez hasta que lo anticipen.", materiales: ["Libros de la sala"], dccaba: "DC CABA Sala de 3 - Precursores: convenciones de la escritura" },
    { titulo: "Trazos con direccion", objetivo: "Producir trazos controlados y tomar el lapiz", descripcion: "Trazos grandes con distintos patrones: horizontales, verticales, oblicuos. Primero con todo el brazo, despues con el lapiz.", materiales: ["Papel grande", "Crayones y lapices gruesos"], dccaba: "DC CABA Sala de 3 - Precursores: toma del lapiz y trazos controlados" },
    { titulo: "Mi nombre es esta marca", objetivo: "Reconocer el propio nombre escrito", descripcion: "Que busquen su cartel entre otros para retirar sus cosas. Se reconoce, no se copia: mira si lo identifica entre varios.", materiales: ["Carteles con los nombres del grupo"], dccaba: "DC CABA Sala de 3 - Precursores: sistema de escritura" },
  ],
}

const CAPACIDADES_MATERNAL = [
  { key: "COM", nombre: "Comunicacion" },
  { key: "AUT", nombre: "Autonomia para aprender" },
  { key: "RES", nombre: "Resolucion de problemas" },
  { key: "COL", nombre: "Compromiso y colaboracion" },
  { key: "REF", nombre: "Pensamiento reflexivo y critico" },
] as const

const SECUENCIA_MATERNAL: Record<string, { titulo: string; objetivo: string; descripcion: string; materiales: string[]; dccaba?: string }[]> = {
  COM: [
    { titulo: "Responde a su nombre y a consignas simples", objetivo: "Reconocer su nombre y responder a preguntas e instrucciones breves", descripcion: "En rondas y momentos de rutina, la docente nombra a cada nino y espera su respuesta: la mirada, un gesto, una palabra. Se dan consignas de un solo paso acompanadas de gesto.", materiales: ["Ninguno"], dccaba: "DC CABA Maternal - Lengua Oral: responder preguntas e instrucciones verbales simples" },
    { titulo: "Expresa lo que quiere con palabras", objetivo: "Usar el lenguaje para saludar, nombrar, pedir y llamar la atencion", descripcion: "Se generan situaciones donde decir algo tiene un efecto: pedir un objeto que esta a la vista pero fuera de alcance, saludar al entrar, elegir entre dos cosas nombrandolas.", materiales: ["Objetos conocidos de la sala"], dccaba: "DC CABA Maternal - Lengua Oral: expresar intenciones comunicativas" },
    { titulo: "Suma palabras nuevas", objetivo: "Incorporar palabras para nombrar objetos y hechos del entorno", descripcion: "Se presenta un objeto o una escena nueva y se la nombra muchas veces, en frases distintas. Los ninos repiten, senalan y buscan. Se retoma la misma palabra en dias siguientes.", materiales: ["Objetos reales", "Imagenes grandes"], dccaba: "DC CABA Maternal - Lengua Oral: adquisicion de palabras nuevas" },
    { titulo: "Conversa por turnos", objetivo: "Participar de intercambios de uno o dos turnos", descripcion: "Juegos de ida y vuelta donde la docente dice algo y espera. Se sostiene el silencio para dar lugar a la respuesta, sea palabra, gesto o vocalizacion, y se la retoma en palabras.", materiales: ["Titeres u objetos que aparecen y desaparecen"], dccaba: "DC CABA Maternal - Lengua Oral: intercambios de uno o dos turnos" },
    { titulo: "Arma frases de dos o tres palabras", objetivo: "Comprender y producir oraciones cortas con orden sujeto-verbo-objeto", descripcion: "La docente modela frases cortas sobre lo que esta pasando y los ninos las completan o repiten. Se aprovechan las acciones reales de la sala para nombrarlas mientras suceden.", materiales: ["Ninguno"], dccaba: "DC CABA Maternal - Lengua Oral: comprension y produccion de oraciones" },
    { titulo: "Participa cuando se lee y se canta", objetivo: "Imitar, repetir o completar palabras y sonidos en cuentos y canciones", descripcion: "Lectura y canto con pausas a proposito para que los ninos completen. Se repite el mismo cuento o cancion varios dias hasta que anticipan lo que viene.", materiales: ["Libros de imagenes", "Canciones conocidas"], dccaba: "DC CABA Maternal - Lengua Oral: participar de situaciones de lectura y canto" },
    { titulo: "Descubre que lo escrito dice algo", objetivo: "Reconocer la escritura como medio para comunicar", descripcion: "Se usan carteles con los nombres de los ninos en sus perchas y cajas. Se lee en voz alta senalando, para que descubran que esas marcas dicen siempre lo mismo.", materiales: ["Carteles con los nombres", "Libros"], dccaba: "DC CABA Maternal - Lengua Oral: reconocimiento de la escritura como medio comunicativo" },
  ],
  AUT: [
    { titulo: "Explora los materiales a su modo", objetivo: "Explorar libremente objetos y materiales", descripcion: "Se ofrecen materiales variados sin consigna y se acompana nombrando lo que cada nino hace. La docente pone en palabras la exploracion: que agarra, que suena, que pasa.", materiales: ["Materiales de exploracion variados"], dccaba: "DC CABA Maternal - Desarrollo personal y social" },
    { titulo: "Elige entre dos propuestas", objetivo: "Tomar pequenas decisiones y sostenerlas", descripcion: "Se ofrecen dos opciones a la vez, nombrandolas, y se espera la eleccion. Se nombra lo que eligio y se lo acompana a sostenerlo hasta terminar.", materiales: ["Dos propuestas simultaneas"], dccaba: "DC CABA Maternal - Desarrollo personal y social" },
    { titulo: "Sostiene una actividad hasta terminarla", objetivo: "Mantener la atencion en una propuesta breve", descripcion: "Propuestas cortas con un final visible: llenar, encajar, guardar. Se anticipa en palabras cuanto falta y se celebra el cierre.", materiales: ["Materiales con inicio y fin claros"], dccaba: "DC CABA Maternal - Desarrollo personal y social" },
    { titulo: "Anticipa la rutina y la nombra", objetivo: "Reconocer y anticipar los momentos del dia", descripcion: "Se nombra siempre igual cada momento de la jornada y se pregunta que viene despues. Los ninos anticipan con palabras o gestos.", materiales: ["Imagenes de la rutina"], dccaba: "DC CABA Maternal - Desarrollo personal y social" },
  ],
  RES: [
    { titulo: "Descubre que sus acciones tienen efecto", objetivo: "Descubrir relaciones causa-efecto", descripcion: "Materiales donde una accion produce un resultado visible o sonoro. Se nombra la relacion: si lo empujas, cae; si lo agitas, suena.", materiales: ["Objetos sonoros", "Torres para derribar"], dccaba: "DC CABA Maternal - Exploracion del ambiente" },
    { titulo: "Prueba otra manera cuando no sale", objetivo: "Ensayar alternativas frente a una dificultad", descripcion: "Se ofrecen desafios simples que no salen al primer intento. La docente no resuelve: nombra el problema en voz alta y acompana el segundo intento.", materiales: ["Encastres", "Recipientes con tapa"], dccaba: "DC CABA Maternal - Exploracion del ambiente" },
    { titulo: "Pide ayuda con palabras", objetivo: "Usar el lenguaje para pedir lo que necesita", descripcion: "Situaciones donde hace falta ayuda y la docente espera el pedido antes de intervenir, ofreciendo la palabra si no aparece.", materiales: ["Frascos, cajas o envases dificiles de abrir"], dccaba: "DC CABA Maternal - Desarrollo personal y social" },
    { titulo: "Busca el modo de conseguir lo que quiere", objetivo: "Buscar modos de alcanzar un objetivo simple", descripcion: "Un objeto deseado a la vista pero fuera de alcance. Se acompana la busqueda del modo, nombrando cada intento.", materiales: ["Objetos conocidos", "Elementos para alcanzar"], dccaba: "DC CABA Maternal - Exploracion del ambiente" },
  ],
  COL: [
    { titulo: "Comparte el espacio con otros", objetivo: "Jugar cerca de otros compartiendo materiales", descripcion: "Propuestas en grupos pequenos con material suficiente. Se nombra lo que hace cada uno para que se miren entre ellos.", materiales: ["Material abundante"], dccaba: "DC CABA Maternal - Desarrollo personal y social" },
    { titulo: "Espera su turno", objetivo: "Esperar y respetar turnos en un juego", descripcion: "Juegos de ida y vuelta con un solo objeto que circula. Se nombra de quien es el turno y se sostiene la espera con palabras.", materiales: ["Una pelota o un objeto que circule"], dccaba: "DC CABA Maternal - Desarrollo personal y social" },
    { titulo: "Participa de una propuesta grupal", objetivo: "Sumarse a una actividad con todo el grupo", descripcion: "Canciones con movimiento, murales colectivos o juegos donde todos hacen lo mismo a la vez. Se nombra al grupo como grupo.", materiales: ["Canciones", "Papel afiche"], dccaba: "DC CABA Maternal - Desarrollo personal y social" },
    { titulo: "Ayuda a un companero o a la docente", objetivo: "Colaborar en tareas cotidianas de la sala", descripcion: "Guardar juntos, repartir, alcanzar algo a un companero. Se agradece nombrando lo que hizo.", materiales: ["Elementos de la rutina"], dccaba: "DC CABA Maternal - Desarrollo personal y social" },
  ],
  REF: [
    { titulo: "Explora y descubre que pasa", objetivo: "Descubrir efectos de sus acciones sobre los objetos", descripcion: "Materiales que cambian al manipularlos: agua, masa, arena. Se conversa sobre lo que pasa mientras pasa.", materiales: ["Agua", "Masa", "Arena"], dccaba: "DC CABA Maternal - Exploracion del ambiente" },
    { titulo: "Anticipa lo que va a pasar", objetivo: "Anticipar el resultado de una accion conocida", descripcion: "Se repite una secuencia conocida y se hace una pausa antes del final para que anticipen, con palabra o gesto.", materiales: ["Juegos de aparecer y desaparecer"], dccaba: "DC CABA Maternal - Exploracion del ambiente" },
    { titulo: "Dice que le gusta y que no", objetivo: "Expresar preferencias y elegir", descripcion: "Se presentan dos opciones y se pide elegir, nombrando el motivo si aparece. Se acepta y se nombra la eleccion.", materiales: ["Dos opciones a la vez"], dccaba: "DC CABA Maternal - Desarrollo personal y social" },
    { titulo: "Reconoce lo conocido en algo nuevo", objetivo: "Relacionar lo nuevo con lo que ya conoce", descripcion: "Se presenta un objeto o imagen parecido a otro conocido y se conversa sobre en que se parecen y en que no.", materiales: ["Objetos e imagenes familiares"], dccaba: "DC CABA Maternal - Exploracion del ambiente" },
  ],
}

// Nivel pedagogico de la sala. La red NUNCA cruza niveles: una actividad de
// sala de 5 en una de 2 no sirve y ademas confunde. Antes el filtro usaba
// esde4Anios, que solo distingue 4 de 5, asi que trataba a maternal como
// sala de 5 y le mandaba actividades de escritura del nombre propio.
// Nivel del aula en el sistema de California: TK, Kindergarten y grados 1 a 3.
// Las claves de grado llevan prefijo G a proposito. El motor todavia conserva
// ramas de logica que preguntan si el nivel es "2" o "3" para las salas de
// maternal argentinas; si los grados usaran esos mismos valores, Grade 2
// recibiria las actividades de una sala de 2 anos. El prefijo lo hace imposible.
// Los valores "2" a "5" son herencia del modelo argentino (salas de 2, 3, 4 y
// 5 anos). Esta funcion ya no los devuelve nunca, pero quedan declarados en el
// tipo porque el motor conserva ramas de logica que los comparan. Sin esto el
// compilador marca esas comparaciones como imposibles, que es exactamente lo
// que son: codigo heredado inalcanzable, pendiente de retirar.
function nivelDeSala(sala: string): "TK" | "K" | "G1" | "G2" | "G3" | "2" | "3" | "4" | "5" {
  const s = (sala || "").toUpperCase().trim()
  if (s.startsWith("TK") || s.includes("TRANSITIONAL")) return "TK"
  if (s.includes("KINDER")) return "K"
  if (s.includes("GRADE 1")) return "G1"
  if (s.includes("GRADE 2")) return "G2"
  if (s.includes("GRADE 3")) return "G3"
  return "K"
}

// El nivel dicho como se dice en una escuela de California.
function nombreDeNivel(nivel: string): string {
  return nivel === "TK" ? "transitional kindergarten"
       : nivel === "K"  ? "kindergarten"
       : `grade ${nivel.replace("G", "")}`
}

// Se conserva por compatibilidad: el nivel mas chico, el unico que todavia no
// trabaja lectura de palabras, es TK.
function esde4Anios(sala: string): boolean {
  return nivelDeSala(sala) === "TK"
}

// Detectar segunda mitad del ciclo lectivo.
// El ciclo escolar de California va de agosto a junio: la mitad cae cerca de
// enero. Se calcula desde el primer lunes de agosto del año en curso.
function esSegundaMitadAnio(): boolean {
  const ahora = new Date()
  const anio = ahora.getFullYear()
  // Primer lunes de marzo
  const inicioAgosto = new Date(anio, 7, 1) // 1 de agosto
  const diaSemana = inicioAgosto.getDay() // 0=dom, 1=lun
  const diasHastaLunes = diaSemana === 0 ? 1 : diaSemana === 1 ? 0 : 8 - diaSemana
  const primerLunesAgosto = new Date(anio, 7, 1 + diasHastaLunes)
  // Semanas transcurridas desde el inicio del ciclo
  const msTranscurridos = ahora.getTime() - primerLunesAgosto.getTime()
  const semanasTranscurridas = Math.floor(msTranscurridos / (7 * 24 * 60 * 60 * 1000))
  return semanasTranscurridas >= 21
}

// Normaliza el eje tal como viene guardado en seguimiento al vocabulario del brain.
function ejeDeSeguimiento(valor: string): "CF" | "CT" | "O" | "EA" {
  const e = (valor || "").trim().toUpperCase()
  if (e === "CT") return "CT"
  if (e === "O" || e === "ORALIDAD") return "O"
  if (e === "E" || e === "EA" || e === "LE" || e === "ESCRITURA") return "EA"
  return "CF"
}

function calcularActividadDelDia(
  eje: "CF" | "CT" | "O" | "EA",
  clasesCompletadasEnEje: number,
  promedioEje: number,
  sala = "TK",
  yaDadas: string[] = []
): { actividad: (typeof SECUENCIA)["CF"][0]; indice: number; esRepeticion: boolean; esAvanzado: boolean } {
  const fullSeq = SECUENCIA[eje]
  // DC CABA 2025: sala 4 cubre hasta repaso de vocales (CF), comprension literal (CT) y oralidad situacional (O)
  // Para EA sala 4 solo accede a los 7 primeros (escritura emergente, antes de escritura convencional)
  // Cada nivel recorre la progresion hasta donde le corresponde: TK ve el
  // principio, tercer grado ve todo. No son catalogos distintos, es un corte
  // sobre el mismo continuo.
  const limite = CORTES_POR_NIVEL[nivelDeSala(sala)]?.[eje] ?? fullSeq.length
  const seq = fullSeq.slice(0, limite)
  if (!seq || seq.length === 0) return { actividad: fullSeq[0], indice: 0, esRepeticion: false, esAvanzado: false }
  // Offset de mitad de año: si la sala no tiene cierres en este eje, arrancar en la actividad 9
  // Esto evita mostrar actividades del primer semestre en Junio
  // 12 = las 8 posiciones de trabajo previo + los 4 pasos nuevos de conciencia lexica
  const OFFSET_MITAD_ANIO = 12

  // Punto de partida: las salas de 5 ya venian trabajando antes de registrar en ALBA,
  // asi que no arrancan del principio. Las de 4 si.
  // El ciclo lectivo de California arranca en agosto: todos los niveles
  // empiezan la progresion desde el principio de su tramo.
  const arranque = 0

  const norm = (t: string) => (t || "").trim().toLowerCase()
  const dadas = new Set(yaDadas.map(norm))

  // CONSOLIDAR: si el grupo viene flojo, no avanzamos. Se repite lo ultimo trabajado.
  if (promedioEje < 40 && yaDadas.length > 0) {
    const ultima = norm(yaDadas[yaDadas.length - 1])
    const idxUltima = seq.findIndex((a) => norm(a.titulo) === ultima)
    if (idxUltima >= 0) {
      return { actividad: seq[idxUltima], indice: idxUltima, esRepeticion: true, esAvanzado: false }
    }
  }

  // PREREQUISITOS: si hay pasos marcados como base que esta sala nunca trabajo,
  // van primero, sin importar cuan adelante este el grupo en el resto de la secuencia.
  const pendientePrerequisito = seq.findIndex((a) => a.prerequisito === true && !dadas.has(norm(a.titulo)))
  if (pendientePrerequisito >= 0) {
    return { actividad: seq[pendientePrerequisito], indice: pendientePrerequisito, esRepeticion: false, esAvanzado: false }
  }

  // AVANZAR: la primera de la secuencia que esta sala todavia no dio, desde el arranque.
  // Asi la posicion se mueve sola con cada actividad evaluada y no puede repetirse.
  for (let i = arranque; i < seq.length; i++) {
    if (!dadas.has(norm(seq[i].titulo))) {
      return { actividad: seq[i], indice: i, esRepeticion: false, esAvanzado: false }
    }
  }
  // Si ya cubrio todo desde el arranque, recuperar lo anterior que quedo sin dar.
  for (let i = 0; i < arranque && i < seq.length; i++) {
    if (!dadas.has(norm(seq[i].titulo))) {
      return { actividad: seq[i], indice: i, esRepeticion: false, esAvanzado: false }
    }
  }

  // Secuencia completa: vuelve a ciclar, marcado como repeticion.
  const indiceCiclo = (clasesCompletadasEnEje || arranque) % seq.length
  return { actividad: seq[indiceCiclo], indice: indiceCiclo, esRepeticion: true, esAvanzado: false }
}

// Nunca cachear — cada llamada debe leer los datos mas recientes de Supabase
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala") || "TK"

  // Crear cliente Supabase con cache desactivado para que cada request lea datos frescos
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ehwlulqcwimatxmnajra.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_q-qtEDnI0QxcrTt3pQIh8w_vbmnQZS1",
    {
      global: {
        fetch: (url: RequestInfo | URL, options?: RequestInit) =>
          fetch(url, { ...options, cache: "no-store", next: { revalidate: 0 } }),
      },
    }
  )

  try {
    const hoy = new Date()
    const diaHoy = hoy.getDay() // 0=Dom, 1=Lun...5=Vie

    // ── 0a. Buscar actividad del cronograma guardado para mostrar en el dashboard ──
    // Lógica: buscar el próximo día lectivo que tiene actividades aceptadas.
    // Si hoy es lectivo y hay actividad → usar hoy.
    // Si hoy es Viernes/Finde/no hay actividad → buscar siguiente semana Lunes.
    // Esto garantiza que la sugerencia de ALBA siempre coincide con el cronograma.
    const diasNombresArray = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"]

    // Calcular semana actual (lunes)
    const getLunes = (fecha: Date) => {
      const d = new Date(fecha)
      const day = d.getDay()
      const diff = d.getDate() - day + (day === 0 ? -6 : 1)
      d.setDate(diff)
      d.setHours(0,0,0,0)
      return d
    }

    // Buscar actividad del cronograma: hoy → resto de semana → semana siguiente
    // Normaliza nombre de sala para tolerar variantes (Kindergarten vs Sala de prueba)
    const normalizarSala = (s: string) => s.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9]/g, "")
    const salaKey = normalizarSala(sala)
    const esSalaPrueba = salaKey.includes("prueba")

    // Aviso de lo que viene: se completa dentro de buscarActividadCronograma
    let proximaAlfabetizacion: { dia: string; nombre: string } | null = null

    const buscarActividadCronograma = async (): Promise<{ actAlfa: any; dia: string } | null> => {
      // LA SEMANA LA DECIDE EL CALENDARIO — misma regla que el GET de cronograma-jardin.
      // Lunes a viernes: semana actual. Sabado y domingo: semana siguiente.
      // Dentro de esa semana se toma el primer dia sin finalizar con actividad de ALBA.
      
      const normalizarSala = (s: string) => s.toLowerCase().replace(/\s/g, "").replace(/[^a-z0-9]/g, "")
      const salaKey = normalizarSala(sala)

      // Hoy en horario de Buenos Aires (el servidor corre en UTC)
      const ahoraSrv = new Date()
      const hoyBA = new Date(ahoraSrv.getTime() + ahoraSrv.getTimezoneOffset() * 60000 - 3 * 60 * 60 * 1000)
      const lunesSemana = getLunes(hoyBA)
      const diaBA = hoyBA.getDay() // 0=Domingo, 6=Sabado
      if (diaBA === 0 || diaBA === 6) lunesSemana.setDate(lunesSemana.getDate() + 7)
      const semanaObjetivo = lunesSemana.toISOString().split("T")[0]

      // Buscar SIN restricción de semana — traer todo
      const { data: registros } = await supabase
        .from("cronograma_jardin")
        .select("sala, dia, semana_inicio, actividades, dia_finalizado")

      if (!registros || registros.length === 0) return null

      // Filtrar por sala normalizada
      const deSala = registros.filter((r: any) => normalizarSala(r.sala || "") === salaKey)
      if (deSala.length === 0) return null

      // Solo la semana que corresponde al calendario, y solo los dias NO finalizados
      const pendientes = deSala.filter(
        (r: any) => r.semana_inicio === semanaObjetivo && r.dia_finalizado !== true
      )
      if (pendientes.length === 0) return null

      // Ordenar por dia (Lunes primero)
      const ORDEN_DIAS = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"]
      pendientes.sort((a: any, b: any) => ORDEN_DIAS.indexOf(a.dia) - ORDEN_DIAS.indexOf(b.dia))

      // No mirar mas alla de HOY: los dias que todavia no llegaron no se ofrecen.
      const hoyStr = hoyBA.toISOString().split("T")[0]
      const fechaDelDia = (nombreDia: string): string => {
        const idx = ORDEN_DIAS.indexOf(nombreDia)
        if (idx < 0) return ""
        const f = new Date(lunesSemana)
        f.setDate(f.getDate() + idx)
        return f.toISOString().split("T")[0]
      }

      // Que actividades de esta semana YA tienen evaluacion: un dia que paso y
      // quedo sin evaluar no se vuelve a ofrecer, queda atras con su rojo.
      const evaluadasSem = new Set<string>()
      try {
        const { data: alSala } = await supabase.from("alumnos").select("id").eq("sala", sala)
        const idsSala = (alSala || []).map((a: any) => a.id)
        if (idsSala.length > 0) {
          const { data: rs } = await supabase
            .from("seguimiento").select("actividad").in("alumno_id", idsSala).gte("fecha", semanaObjetivo)
          ;(rs || []).forEach((r: any) => {
            if (r.actividad) evaluadasSem.add(String(r.actividad).trim().toLowerCase())
          })
        }
      } catch (e) {
        console.error("[v0] Error mirando evaluadas de la semana:", e)
      }

      // Solo se OFRECE PARA EVALUAR un dia vigente (hoy o antes) sin evaluar.
      // La que viene mas adelante no se ofrece: se guarda aparte para avisar
      // que se viene, sin que la maestra pueda evaluarla antes de darla.
      for (const reg of pendientes) {
        if (!Array.isArray(reg.actividades)) continue
        const actAlfa = reg.actividades.find(
          (a: any) => (a.alfabetizacion === true || a.origen === "alba") && (a.nombre || "").trim().length > 0
        )
        if (!actAlfa) continue

        const fDia = fechaDelDia(reg.dia)
        if (fDia && fDia > hoyStr) {
          // Todavia no llego: solo se anota como aviso
          if (!proximaAlfabetizacion) proximaAlfabetizacion = { dia: reg.dia, nombre: String(actAlfa.nombre || "") }
          continue
        }

        const nombre = String(actAlfa.nombre || "").trim().toLowerCase()
        if (fDia && fDia < hoyStr && !evaluadasSem.has(nombre)) continue  // vencida: queda atras con su rojo

        return { actAlfa, dia: reg.dia }
      }
      return null
    }

    const resultadoCronograma = await buscarActividadCronograma()
    if (resultadoCronograma) {
      const { actAlfa, dia: diaActividad } = resultadoCronograma
      const ejeActividad: "CF" | "CT" | "O" | "E" = (actAlfa.eje === "CT" ? "CT" : (actAlfa.eje === "Escritura" || actAlfa.eje === "E" || actAlfa.eje === "EA") ? "E" : (actAlfa.eje === "Oralidad" || actAlfa.eje === "O") ? "O" : "CF")
      // Etiqueta legible: si la actividad es de Escritura, mostrar "Escritura" (EA)
      // aunque internamente el eje se mapee a "O" para el resto del sistema.
      const ejeNombreActividad =
        actAlfa.eje === "CT" ? "Conocimiento del Texto"
        : actAlfa.eje === "Escritura" ? "Escritura"
        : actAlfa.eje === "Oralidad" || actAlfa.eje === "O" ? "Oralidad"
        : "Conciencia Fonologica"
      const materialesArr: string[] = Array.isArray(actAlfa.materiales)
        ? actAlfa.materiales.filter((m: string) => (m || "").trim())
        : typeof actAlfa.materiales === "string" && actAlfa.materiales.trim()
          ? actAlfa.materiales.split(",").map((m: string) => m.trim()).filter(Boolean)
          : []
      return NextResponse.json({
        sugerencia: {
          eje: ejeActividad,
          ejeNombre: ejeNombreActividad,
          actividad: actAlfa.nombre,
          descripcion: actAlfa.desarrollo || actAlfa.descripcion || "",
          objetivo: actAlfa.objetivo || "",
          capacidades: actAlfa.capacidades || "",
          contenidos: actAlfa.contenidos || "",
          materiales: materialesArr,
          razon: `Actividad del cronograma del ${diaActividad} — aceptada por la docente`,
          // Paso de la secuencia al que pertenece esta actividad. Se guarda en el
          // cierre para que el brain sepa despues QUE contenido repetir o avanzar.
          paso: actAlfa.paso || "",
          alumnosEnRiesgo: 0,
          totalAlumnos: 0,
          tendencia: "progreso",
          aprendidoDeLaRed: false,
          salaRed: null,
          desdeCronograma: true,
        },
        microCapacitacion: getMicroCapacitacion(actAlfa.nombre),
        alertas: [],
        historial: { promediosPorEje: { CF: 0, CT: 0, O: 0 } },
        progreso: { totalClasesCompletadas: 0, semanaActual: 1, clasesCompletadasPorEje: { CF: 0, CT: 0, O: 0 } },
      })
    }

    // ── Sin actividad planificada en el cronograma → panel VACIO ──────────────
    // Si la maestra no guardo una planificacion de alfabetizacion para esta
    // semana, ALBA NO propone una actividad por defecto: el panel del dashboard
    // queda vacio hasta que la docente planifique y guarde el cronograma. Evita
    // la "actividad fantasma" que aparecia sin que la maestra hiciera nada.
    return NextResponse.json({
      sugerencia: null,
      proximaAlfabetizacion,
      microCapacitacion: null,
      alertas: [],
      historial: { promediosPorEje: { CF: 0, CT: 0, O: 0 } },
      progreso: { totalClasesCompletadas: 0, semanaActual: 1, clasesCompletadasPorEje: { CF: 0, CT: 0, O: 0 } },
    })

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

      const secuenciaEje = SECUENCIA[ejeElegido].slice(
        0, CORTES_POR_NIVEL[nivelDeSala(sala)]?.[ejeElegido] ?? SECUENCIA[ejeElegido].length)
      const cierresDeEje = ejeElegido === "CF" ? cierresCF : ejeElegido === "CT" ? cierresCT : cierresO
      // Estamos a mitad de año: si la sala no tiene cierres, arrancar desde la actividad 9
      // OFFSET_MITAD_ANIO = 8 (actividades 1-8 corresponden a primer semestre)
      // 12 = las 8 posiciones de trabajo previo + los 4 pasos nuevos de conciencia lexica
  const OFFSET_MITAD_ANIO = 12
      const indiceBase = cierresDeEje === 0 ? OFFSET_MITAD_ANIO : cierresDeEje
      const indiceActividad = indiceBase % secuenciaEje.length
      console.log("[v0] FALLBACK rotacion - totalCierres:", totalCierres, "ejeElegido:", ejeElegido, "cierresDeEje:", cierresDeEje, "indice:", indiceActividad)
      const actividadInicial = secuenciaEje[indiceActividad]

      return NextResponse.json({
        sugerencia: {
          eje: ejeElegido,
          actividad: actividadInicial.titulo,
          descripcion: actividadInicial.descripcion,
          objetivo: actividadInicial.objetivo,
          materiales: actividadInicial.materiales,
          razon: `Clase ${cierresDeEje + 1} en ${ejeElegido}. ` + `(${nombreDeNivel(nivelDeSala(sala))})`,
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
    // La RED ALBA esta integrada por: TK, Kindergarten, Grade 1, Grade 3, Grade 2, Sala de Prueba
    // Cada sala nutre el cerebro con dos fuentes:
    //   a) seguimiento: resultado por alumno por actividad (green/yellow/red)
    //   b) registro_cierre: actividades subidas por la docente con evaluacion general
    // ALBA indexa ambas fuentes y distribuye las mejores actividades a toda la red

    const SALAS_RED = ["TK", "Kindergarten", "Grade 1", "Grade 3", "Grade 2"]

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
      .select("id, fecha, eje, evaluacion_general")
      .eq("sala", sala)
      .order("fecha", { ascending: true })
    
    if (cierresError) {
      console.log("[ALBA v8] Error cargando cierres:", cierresError.message)
    }
    
    const cierres = cierresData || []
    // Solo cuentan como CLASE DADA los cierres con evidencia real.
    // Las "no_realizada" quedan registradas (para que ALBA las reofrezca)
    // pero NO hacen avanzar la secuencia ni la rotacion de ejes.
    const cierresConEvidencia = cierres.filter((c: any) => c.evaluacion_general !== "no_realizada")
    const totalClasesCompletadasGlobal = cierresConEvidencia.length
    console.log("[v0] BRAIN sala:", sala, "cierres:", cierres.length, "conEvidencia:", cierresConEvidencia.length, "alumnos:", alumnos.length)
    
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

      // Clases completadas para ESTE eje = cierres CON EVIDENCIA de ese eje especifico
      const cierresDeEje = cierresConEvidencia.filter((c: any) => c.eje === eje)
      const clasesCompletadas = cierresDeEje.length

      // Ultimas 2 clases en rojo (para bajar nivel en secuencia)
      // Solo miramos clases realmente dadas: una "no_realizada" no es una clase.
      const ultimos2Cierres = cierresConEvidencia.slice(-2)
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

    // ORDEN POR NECESIDAD (reemplaza la rotacion por modulo).
    // Un eje por dia, como antes: lo que cambia es CUAL va primero, no cuantos dias se lleva.
    // Prioriza el eje mas postergado y el que peor viene, sin que ninguno desaparezca.
    const ultimaPorEje: Record<string, number> = {}
    let ejeUltimaClase = ""
    let ultimaMs = 0
    regs.forEach((r: any) => {
      if (!r.actividad) return
      const e = ejeDeSeguimiento(r.eje)
      const t = new Date(r.fecha || r.created_at).getTime()
      if (isNaN(t)) return
      if (!ultimaPorEje[e] || t > ultimaPorEje[e]) ultimaPorEje[e] = t
      if (t > ultimaMs) { ultimaMs = t; ejeUltimaClase = e }
    })

    const ahoraMs = Date.now()
    const diasSinTrabajar = (e: string) =>
      ultimaPorEje[e] ? Math.floor((ahoraMs - ultimaPorEje[e]) / 86400000) : 60

    function prioridadDeEje(e: "CF" | "CT" | "O" | "EA"): number {
      const d = e === "EA" ? null : analisis[e as "CF" | "CT" | "O"]
      const clases = d ? d.clasesCompletadas : 0
      const prom = d ? d.promedio : 50
      const rojos = d ? d.ultimasClasesEnRojo : 0
      const espera = Math.min(diasSinTrabajar(e), 60)
      // La postergacion pesa fuerte: un eje sin trabajar hace dos semanas gana solo.
      // El fracaso y los rojos suman. La poca cobertura tambien.
      return espera * 3 + (100 - prom) + rojos * 25 + Math.max(0, 20 - clases * 2)
    }

    let ejeSugerido: "CF" | "CT" | "O" | "EA"
    // No repetir el mismo eje dos clases seguidas, salvo que sea el unico candidato.
    const candidatos = ORDEN_EJES.filter((e) => e !== ejeUltimaClase)
    const pool = candidatos.length > 0 ? candidatos : ORDEN_EJES
    ejeSugerido = [...pool].sort((a, b) => prioridadDeEje(b) - prioridadDeEje(a))[0]

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

    // Actividades de este eje que la sala YA dio, en orden cronologico.
    // regs viene ordenado por fecha ascendente.
    const yaDadasEje: string[] = regs
      .filter((r: any) => r.actividad && ejeDeSeguimiento(r.eje) === ejeSugerido)
      .map((r: any) => String(r.actividad))

    const { actividad, indice, esRepeticion, esAvanzado } = calcularActividadDelDia(
      ejeSugerido as "CF" | "CT" | "O" | "EA",
      clasesParaCalculo,
      ejeDatosActivos.promedio,
      sala,
      yaDadasEje
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
    const ejeKey = ejeSugerido as "CF" | "CT" | "O" | "EA"
    const totalEnSecuencia = Math.min(
      CORTES_POR_NIVEL[nivelDeSala(sala)]?.[ejeKey] ?? SECUENCIA[ejeKey].length,
      SECUENCIA[ejeKey].length)
    const edadLabel = ` (${nombreDeNivel(nivelDeSala(sala))})`
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
          ? `La red ALBA (TK, Kindergarten, Grade 1, Grade 3, Grade 2) tiene ${exitosasRed[eje].length} actividad${exitosasRed[eje].length > 1 ? "es" : ""} con >${umbralTasa}% de logro en ${nombre}, incluyendo ${docentes} propuesta${docentes > 1 ? "s" : ""} por docentes. ALBA las priorizara automaticamente.`
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
// El proyecto le dice a ALBA POR DONDE QUIERE IR LA MAESTRA. Antes solo le
// llegaba el titulo: sabia que el proyecto se llamaba "Los animales marinos"
// pero no que se proponia lograr con eso. Con el objetivo y el momento del
// proyecto, las actividades aportan a lo que ella busca en vez de solo
// compartir el tema.
function bloqueProyecto(proy: any): string {
  if (!proy?.titulo) return ""
  const partes = [`Proyecto de la sala: "${proy.titulo}".`]
  if (proy.objetivoGeneral) {
    partes.push(`Lo que la maestra se propone con este proyecto: ${proy.objetivoGeneral}`)
    partes.push(`La actividad tiene que APORTAR A ESE OBJETIVO, no solo compartir el tema.`)
  }
  if (proy.duracion) {
    partes.push(`Duracion prevista: ${proy.duracion}.`)
    if (proy.semanaActual) {
      partes.push(`Va por la semana ${proy.semanaActual}. Al principio del proyecto se explora y se abre; despues se profundiza; al final se cierra y se muestra lo aprendido. Ajusta la propuesta al momento en que esta.`)
    }
  }
  return partes.join("\n")
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action, proyecto, sala, dias, actividadesYaSugeridas = [] } = body

    // ── MICRO CAPACITACION SITUADA ────────────────────────────────────────
    // Un consejo anclado en tres cosas: el proyecto de la sala, la actividad
    // que va a dar, y un enfoque de una lista CERRADA de autores. La lista es
    // cerrada a proposito: sin ella la IA inventa titulos y paginas que no existen.
    // Tips de planificacion: se generan cada vez, anclados al proyecto.
    // Antes eran una lista fija en el codigo y salian siempre los mismos.
    // ── TIPS DE LA SEMANA ─────────────────────────────────────────────────
    // NUNCA quedan vacios: en una sala siempre se esta ensenando, haya o no
    // actividad cargada hoy. Si hay actividades, los tips hablan de ellas.
    // Si no hay, son consejos para ensenar en esa sala y esa edad. Y si la IA
    // falla, hay consejos de respaldo del Diseno para que la tarjeta nunca
    // quede en blanco por un problema tecnico.
    if (action === "tips_planificacion") {
      const evitarTips = Array.isArray(body.evitar) ? body.evitar : []
      const actsSemana = Array.isArray(body.actividades) ? body.actividades : []
      const nivelTip = nivelDeSala(String(sala || ""))
      const esMatTip = nivelTip === "2" || nivelTip === "3"

      const edadTexto =
        nivelTip === "2" ? "sala de 2 anos (jardin maternal)"
        : nivelTip === "3" ? "sala de 3 anos"
        : nivelTip === "4" ? "sala de 4 anos"
        : "sala de 5 anos"

      const promptTips = `Sos ALBA, asistente pedagogico de nivel inicial.

Escribi 3 consejos breves y practicos para la maestra de una ${edadTexto}.
Cada uno: UNA sola idea concreta, aplicable esta semana, escrita A ELLA en
segunda persona. Entre 15 y 40 palabras cada uno.

${bloqueProyecto(proyecto)}
${actsSemana.length
  ? `Actividades cargadas en el cronograma de esta semana:\n${actsSemana
      .map((a: any) => `- "${a.nombre}"${a.capacidad ? ` (se observa: ${a.capacidad})` : ""}`)
      .join("\n")}\nAl menos dos de los tres consejos tienen que servir para ESTAS actividades.`
  : `Todavia no hay actividades cargadas en el cronograma. Da consejos generales para ensenar en ${edadTexto}: como sostener la atencion, como organizar el grupo, como aprovechar las rutinas, que observar en los chicos.`}
${esMatTip ? "Uno de los tres puede ser sobre como FAVORECER EL LENGUAJE en el dia a dia: acompanar con palabras lo que el nino hace, dar lugar a que pida, aprovechar las rutinas." : ""}
${evitarTips.length ? `NO repitas estos, que ya se los dimos: ${evitarTips.join(" | ")}` : ""}

No inventes datos sobre el grupo ni sobre ningun nino: no sabes como son.

Respondé SOLO con un array JSON de 3 textos, sin backticks ni nada mas.
Ejemplo del formato exacto que espero:
["Primer consejo completo aca.","Segundo consejo completo aca.","Tercer consejo completo aca."]`

      // Respaldo por edad, del Diseno. Solo se usa si la IA no devuelve nada.
      const RESPALDO: Record<string, string[]> = {
        "2": [
          "Repeti la misma propuesta varios dias seguidos: a los 2 anos la repeticion es lo que consolida el aprendizaje, no la variedad.",
          "Poné en palabras lo que cada nino hace mientras lo hace: 'estas metiendo la pelota en la caja'. Esa voz del adulto es el motor del lenguaje.",
          "Trabaja en grupos muy chicos o en ronda con toda la sala, nunca sentados en mesa de a uno: a esta edad se aprende con el cuerpo y con otros.",
        ],
        "3": [
          "Da consignas de un solo paso y acompanalas con el gesto: a los 3 anos entender dos ordenes seguidas todavia cuesta.",
          "Antes de leer un cuento, mostra la tapa y pregunta de que creen que se trata. Al terminar, volve a esa prediccion y comparen.",
          "Aprovecha los momentos de rutina —la merienda, el guardado— para nombrar, contar y comparar: ahi el lenguaje aparece solo.",
        ],
        "4": [
          "Modela vos la primera pregunta antes de pedirles que pregunten ellos: necesitan escuchar el ejemplo para animarse.",
          "En la ronda de intercambio no alcanza con escuchar: pregunta por lo que falta en el relato, 'cuando fue?', 'con quien estabas?'.",
          "Elegi propuestas que no sean ni muy faciles ni muy dificiles: en los dos extremos los chicos se desenganchan.",
        ],
        "5": [
          "Deja que primero intenten solos y recien despues acompana: lo que hoy hacen con ayuda, manana lo van a poder solos.",
          "Registra en un afiche lo que dicen los chicos: ver sus palabras escritas les muestra para que sirve la escritura.",
          "Cuando trabajen en parejas, dales roles distintos: uno dicta y el otro escribe, y despues cambian.",
        ],
      }

      try {
        const r = await generateText({
          model: "openai/gpt-4o-mini",
          prompt: promptTips,
          maxOutputTokens: 900,
          temperature: 0.9,
        })
        const t = (r.text || "").trim()

        // Se acepta cualquier forma de respuesta: array suelto, objeto con
        // tips, lista de objetos, o texto plano por lineas.
        let tips: string[] = []
        try {
          const leido = leerJSONAunqueVengaCortado(t)
          const crudo = Array.isArray(leido) ? leido : (leido?.tips ?? leido?.sugerencias ?? [])
          if (Array.isArray(crudo)) {
            tips = crudo
              .map((x: any) => (typeof x === "string" ? x : x?.tip ?? x?.texto ?? x?.contenido ?? ""))
              .map((x: string) => String(x).trim())
              .filter((x: string) => x.length > 15)
          }
        } catch {
          // sigue al rescate por lineas
        }

        if (tips.length === 0) {
          tips = t
            .split("\n")
            .map((l: string) => l.replace(/^[\s\-•*\d.)\[\]"']+/, "").replace(/["',\]]+$/, "").trim())
            .filter((l: string) => l.length > 20 && !/^\{|^\}|tips"?\s*:/.test(l))
        }

        tips = tips.slice(0, 3)

        if (tips.length === 0) {
          console.error(`[v0] tips vacios para "${sala}", se usa respaldo. El modelo devolvio:`, t.slice(0, 300))
          tips = RESPALDO[nivelTip] || RESPALDO["4"]
        } else {
          console.log(`[v0] tips para "${sala}": ${tips.length} generados`)
        }

        return NextResponse.json({ ok: true, tips })
      } catch (e) {
        console.error("[v0] Error generando tips:", e, "| sala:", sala)
        // Nunca se devuelve vacio: la maestra siempre ve algo util
        return NextResponse.json({ ok: true, tips: RESPALDO[nivelTip] || RESPALDO["4"] })
      }
    }

    if (action === "relato_maternal") {
      const tipo = String(body.tipo || "grupo")
      const datos = body.datos || {}

      const anterior = body.relatoAnterior || null

      const promptRelato = tipo === "grupo"
        ? `Sos ALBA, asistente pedagogico de una sala de 2 anos.

Escribi como viene el grupo DESDE QUE EMPEZO, no lo que paso esta semana.
A los 2 anos lo que se ve en cinco dias es ruido: la senal aparece en meses.
Habla de TRAYECTORIA: que se consolido, que esta en proceso, que sigue costando.
Prosa clara que se lea en 30 segundos. Nada de listas ni numeros sueltos.

REGLA QUE NO SE ROMPE: solo podes hablar de lo que esta en la evidencia de abajo.
PROHIBIDO inventar personalidad, estado de animo o conductas que nadie registro:
nada de "entra contento", "es timido", "llega con una sonrisa", "se muestra
entusiasmado". Nadie observo eso y la maestra podria creer que ALBA lo vio.
Tu trabajo es ANALIZAR los datos y contarlos en lenguaje claro y amable —eso es
lo que mejor haces—, no rellenar con literatura. Si un dato no esta, no existe.


${datos.proyecto ? `Proyecto en curso: "${datos.proyecto}".` : ""}
Actividades trabajadas: ${(datos.actividades || []).join(", ") || "todavia ninguna"}

Evidencia por capacidad (lo ultimo observado en cada una):
${(datos.capacidades || []).map((c: any) => c.evaluada
  ? `- ${c.nombre} — se observo "${c.indicador}": ${c.yaLoHacen} ya lo hacen, ${c.empezando} empezando, ${c.acompanar} necesitan acompanamiento${c.necesitanAcompanamiento?.length ? ` (${c.necesitanAcompanamiento.join(", ")})` : ""}. Se miraron ${c.indicadoresTrabajados} de ${c.totalIndicadores} indicadores`
  : `- ${c.nombre} — todavia sin observar`).join("\n")}

HABILIDADES OBSERVABLES de cada capacidad, para nombrarlas por su nombre:
${(datos.indicadoresPorCapacidad || []).map((c: any) =>
  `${c.nombre}: ${(c.indicadores || []).join(" · ")}`).join("\n")}

${anterior ? `RELATO ANTERIOR, del ${anterior.fecha}. Compara contra esto y contá que CAMBIO desde entonces. Si algo mejoro, decilo. Si algo sigue igual, tambien:
- Como venia: ${anterior.contenido?.comoViene || ""}
- En que estaba: ${anterior.contenido?.enQueEsta || ""}` : "Es el PRIMER relato de esta sala: no hay con que comparar todavia, asi que solo describi como viene."}

Respondé SOLO con este JSON, sin backticks:
{
  "comoViene": "3 o 4 oraciones sobre la trayectoria del grupo desde que empezo: que se consolido, que esta en proceso, que sigue costando${anterior ? ". Compara explicitamente con el relato anterior: que cambio" : ""}",
  "enQueEsta": "2 o 3 oraciones sobre lo ultimo que se observo y donde esta parado el grupo ahora, con nombres solo si hace falta acompanar",
  "queSigue": "2 o 3 oraciones de por donde seguir. Nombra la HABILIDAD OBSERVABLE que conviene mirar ahora —usando los indicadores de la lista— y la SITUACION que la genera. Nunca 'estimular la comunicacion': eso no se puede mirar ni hacer"
}`
        : `Sos ALBA, asistente pedagogico de una sala de 2 anos.

Para cada nino escribi un relato breve —2 o 3 oraciones— de COMO VIENE, no de lo
que paso esta semana: a esta edad la senal aparece en meses, no en dias.
Hablale A LA MAESTRA. Cerra con algo concreto para hacer, siempre referido al
LENGUAJE mas alla de la capacidad.
Si un nino tiene poca evidencia, decilo en vez de inventar un diagnostico.

COMO SE ESCRIBE LA SUGERENCIA — esto es lo mas importante:
Una capacidad NO se ensena: se ADQUIERE a traves de habilidades observables que
se estimulan con situaciones didacticas concretas. Por eso NUNCA escribas
"ayudalo en su comunicacion" ni "estimula su autonomia": eso no se puede mirar
ni se puede hacer. Deci SIEMPRE dos cosas:
  1. QUE HABILIDAD OBSERVABLE mirar ahora — usa los indicadores de la lista de
     abajo, por su nombre. Ej: "si pide con palabras lo que quiere".
  2. QUE SITUACION generarla. Ej: "pone el objeto a la vista pero fuera de
     alcance y espera el pedido antes de darselo".

${(datos.indicadoresPorCapacidad || []).map((c: any) =>
  `${c.nombre}: ${(c.indicadores || []).join(" · ")}`).join("\n")}

REGLA QUE NO SE ROMPE: solo podes hablar de lo que esta en la evidencia de abajo.
PROHIBIDO inventar personalidad, estado de animo o conductas que nadie registro:
nada de "entra contento", "es timido", "llega con una sonrisa", "se muestra
entusiasmado". Nadie observo eso y la maestra podria creer que ALBA lo vio.
Tu trabajo es ANALIZAR los datos y contarlos en lenguaje claro y amable —eso es
lo que mejor haces—, no rellenar con literatura. Si un dato no esta, no existe.


${(datos.alumnos || []).map((a: any) => `${a.nombre}: ${
  (a.capacidades || []).length === 0
    ? "sin evidencia todavia"
    : (a.capacidades || []).map((c: any) => `${c.nombre} ${c.estado === "ya_lo_hace" ? "ya lo hace" : c.estado === "empezando" ? "esta empezando" : "necesita acompanamiento"} (${c.indicador})`).join("; ")
}`).join("\n")}

${anterior ? `RELATO ANTERIOR de estos mismos ninos, del ${anterior.fecha}. Compara y deci que CAMBIO en cada uno. Si avanzo, nombralo. Si sigue igual, tambien:
${(anterior.contenido?.alumnos || []).map((a: any) => `- ${a.nombre}: ${a.relato}`).join("\n")}` : "Es el PRIMER relato de estos ninos: no hay con que comparar, solo desribi como vienen."}

Respondé SOLO con este JSON, sin backticks:
{ "alumnos": [ { "nombre": "NOMBRE TAL CUAL", "relato": "2 o 3 oraciones${anterior ? ", diciendo que cambio desde el relato anterior" : ""}" } ] }`

      try {
        const r = await generateText({ model: "openai/gpt-4o-mini", prompt: promptRelato, maxOutputTokens: 3000, temperature: 0.7 })
        const t = r.text.trim()
        const leidoRel = leerJSONAunqueVengaCortado(t)
        // Se acepta cualquier forma: objeto, o array suelto de alumnos.
        const relato = Array.isArray(leidoRel) ? { alumnos: leidoRel } : leidoRel
        if (tipo === "alumnos") {
          const n = Array.isArray(relato?.alumnos) ? relato.alumnos.length : 0
          if (n === 0) {
            console.error(`[v0] relato de alumnos vacio para "${sala}". El modelo devolvio:`, t.slice(0, 300))
          } else {
            console.log(`[v0] relato de alumnos para "${sala}": ${n} chicos`)
          }
        }

        // El relato del grupo se GUARDA: asi se acumula la historia de la sala
        // y el proximo puede comparar contra este. Antes era una foto que se perdia.
        try {
          const sb = getSupabase()
          await sb.from("relatos_maternal").insert([{
            sala: String(sala || ""),
            tipo,
            contenido: relato,
          }])
        } catch (errGuardar) {
          console.error("[v0] Error guardando el relato:", errGuardar)
        }

        return NextResponse.json({ ok: true, ...relato })
      } catch (e) {
        console.error("[v0] Error generando el relato:", e)
        return NextResponse.json({ ok: false, error: "No se pudo generar el relato" }, { status: 502 })
      }
    }

    // ── ORDENAR CON ALBA ──────────────────────────────────────────────────
    // La maestra escribe sus actividades en el cronograma como puede. ALBA no
    // las reescribe: RESPETA su nombre, su desarrollo y sus materiales, y les
    // agrega lo que falta —eje, capacidad, "Observa si" y contenidos
    // condensados—. Muchas todavia estan aprendiendo a planificar con el Diseno
    // nuevo: al ver su propia actividad bien ordenada, aprenden como se hace.
    if (action === "ordenar_cronograma") {
      const acts = Array.isArray(body.actividades) ? body.actividades : []
      if (acts.length === 0) return NextResponse.json({ ok: true, actividades: [] })

      const salaOrd = String(sala || "")
      const nivelOrd = nivelDeSala(salaOrd)
      const esMatOrd = nivelOrd === "2" || nivelOrd === "3"

      const promptOrd = `Sos ALBA, asistente pedagogico de nivel inicial.

La maestra escribio estas actividades en su cronograma. ORDENALAS.

QUE SIGNIFICA RESPETAR: respeta SU PROPUESTA, o sea LO QUE ELLA QUIERE HACER.
Si escribio "hacer una ronda y saltar diciendo el nombre", eso es lo que tiene
que pasar en la actividad. Lo que NO tenes que respetar es el texto tal cual lo
tipeo: puede estar hecho un lio, con la capacidad, el objetivo y los pasos todo
mezclado en un mismo parrafo. Tu trabajo es DESARMAR ese texto y poner cada
cosa en su lugar.

Si ella misma escribio un eje o una capacidad, tomalos: te esta diciendo que
quiere trabajar. Si puso "en la ronda saltando" y "capacidad: hacer preguntas",
usa las dos cosas.

${bloqueProyecto(proyecto)}
Sala de ${nivelOrd} anos.

${acts.map((a: any, i: number) => `--- ACTIVIDAD ${i + 1} ---
Nombre: ${a.nombre || ""}
Lo que escribio: ${[a.desarrollo, a.contenidos, a.capacidades, a.objetivo].filter(Boolean).join(" | ")}
Materiales: ${a.materiales || ""}`).join("\n\n")}

Para CADA una devolve, en el mismo orden y la misma cantidad:
- El EJE de alfabetizacion que le corresponde${esMatOrd ? "" : " (CF, CT, O o E)"}. Toda actividad de nivel inicial toca el lenguaje de algun modo: encontralo. Una de expresion corporal donde nombran emociones es Oralidad; una donde escriben una palabra es Escritura.
- La CAPACIDAD del Diseno: el nombre de una de las cinco seguido de dos puntos y lo que esta actividad pone en juego. Formato: "Comunicacion: expresar emociones y ponerles nombre". Las cinco son: Autonomia para aprender | Comunicacion | Pensamiento reflexivo y critico | Resolucion de problemas | Compromiso y colaboracion.
- El OBSERVA SI: UNA sola accion observable, empezando con verbo en tercera persona, sin escribir las palabras "Observa si". Si la maestra puso cuatro objetivos largos, elegi UNA conducta concreta que se pueda mirar. PROHIBIDO "desarrollar", "reconocer las posibilidades de", "proyectar", "fomentar".
- Los CONTENIDOS en 1 o 2 lineas: lo que se ENSENA para llegar al objetivo, no el objetivo mismo. Ej: "Vocabulario de las emociones. Intercambio oral guiado". Si escribio cuatro parrafos, condensalos.
- El DESARROLLO reescrito: SOLO LOS PASOS de lo que se hace, en orden, en segunda persona. Sin repetir la capacidad, el objetivo ni los contenidos, que ya estan en su renglon. Si ella escribio todo pegoteado, quedate con las acciones.

Respondé SOLO con este JSON, sin backticks:
[{ "eje": "CF|CT|O|E", "capacidadDC": "Nombre: lo que pone en juego", "capacidades": "la accion observable", "contenidos": "1 o 2 lineas", "desarrollo": "solo los pasos" }]`

      try {
        const r = await generateText({ model: "openai/gpt-4o-mini", prompt: promptOrd, maxOutputTokens: 3000, temperature: 0.5 })
        const orden = leerJSONAunqueVengaCortado(r.text.trim())
        const lista = Array.isArray(orden) ? orden : []
        // Se devuelve la actividad de la maestra INTACTA, con lo agregado
        const ordenadas = acts.map((a: any, i: number) => ({
          ...a,
          eje: lista[i]?.eje || a.eje || "",
          capacidadDC: lista[i]?.capacidadDC || a.capacidadDC || "",
          capacidades: lista[i]?.capacidades || a.capacidades || "",
          contenidos: lista[i]?.contenidos || a.contenidos || "",
          desarrollo: lista[i]?.desarrollo || a.desarrollo || "",
          objetivo: "",   // el objetivo ya vive en la capacidad: no se repite
          alfabetizacion: true,
        }))
        return NextResponse.json({ ok: true, actividades: ordenadas })
      } catch (e) {
        console.error("[v0] Error ordenando el cronograma:", e)
        return NextResponse.json({ ok: false, error: "No se pudo ordenar" }, { status: 502 })
      }
    }

    if (action === "micro_capacitacion") {
      const actividad = String(body.actividad || "").trim()
      const capacidadAct = String(body.capacidad || "").trim()
      const evitar = Array.isArray(body.evitar) ? body.evitar : []
      const esMat = esDeMaternal(String(sala || ""))

      const AUTORES = [
        "Vigotsky (zona de desarrollo proximo, andamiaje del adulto, el lenguaje como herramienta del pensamiento)",
        "Piaget (exploracion sensoriomotriz, el nino construye conocimiento actuando sobre los objetos)",
        "Montessori (ambiente preparado, autonomia, materiales que se explican solos)",
        "Perkins (hacer visible el pensamiento, comprension como desempeno)",
        "Pikler (movimiento libre, respeto por los tiempos propios, el adulto acompana sin apurar)",
        "Malaguzzi y Reggio Emilia (los cien lenguajes, la documentacion, el ambiente como tercer maestro)",
        "Goldschmied (cesto de los tesoros, juego heuristico, exploracion con objetos cotidianos)",
        "Calmels (el cuerpo y el gesto como primer lenguaje, juegos de crianza)",
        "Borzone (programa Queremos Aprender: ensenanza explicita y sistematica, conciencia fonologica desde el nivel inicial, la narracion de experiencias como punto de partida. Es el enfoque que Mendoza adopto como politica educativa)",
        "Diuk (programa DALE: alfabetizacion en contextos vulnerables, ensenanza explicita de las correspondencias, sin dar por sabido lo que no se enseno)",
        "Isabel Beck (vocabulario robusto y preguntas que profundizan un texto: no alcanza con decodificar, hay que entender)",
        "Devetach (la poesia y el juego con las palabras desde muy chicos)",
        "Furman (preguntas que abren la exploracion y el pensamiento)",
        "Malajovich (el juego como contenido y como forma de ensenar en el nivel inicial)",
        "Beneito (desarrollo temprano, la mirada atenta del adulto)",
        "Maria Emilia Lopez (literatura en la primera infancia, la voz que arrulla y narra)",
      ]

      const promptCap = `Sos ALBA, formadora de docentes de nivel inicial.

Escribi UN consejo pedagogico corto y situado para la docente, sobre COMO dar mejor esta actividad concreta. No teoria general: algo que pueda aplicar hoy.

No inventes datos sobre el grupo ni sobre ningun nino: no sabes como son ni como
reaccionaron. Hablale de la ACTIVIDAD y de como darla, nada mas.

${esMat ? "SALA DE 2 ANOS (jardin maternal). El consejo tiene que servir para esa edad: tiempos breves, cuerpo, objetos reales, la palabra del adulto acompanando la accion." : "Sala de 4 o 5 anos."}
${bloqueProyecto(proyecto)}
${actividad ? `Actividad que va a dar: "${actividad}".` : ""}
${capacidadAct ? `Lo que se observa en esa actividad: "${capacidadAct}". El consejo tiene que ayudarla a ver justamente eso.` : ""}
${evitar.length ? `Ya le dimos estos consejos: ${evitar.join(" | ")}. Deci algo CLARAMENTE DISTINTO y apoyate en OTRO autor de la lista.` : ""}

Podes apoyarte en UNO de estos enfoques, y solo en estos. No inventes titulos de libros, paginas ni citas textuales: nombra al autor y su idea.
${AUTORES.map((a) => "- " + a).join("\n")}

Dame DOS consejos que se complementen: dos enfoques distintos sobre la misma
actividad, de DOS autores diferentes de la lista. Uno sobre como preparar o
presentar la propuesta, otro sobre que hacer mientras los ninos la hacen.

Respondé SOLO con este JSON, sin backticks:
{
  "titulo": "una frase corta e imperativa, maximo 6 palabras",
  "contenido": "2 o 3 oraciones concretas sobre que hacer en esta actividad",
  "autor": "nombre del autor y su idea en 4 o 5 palabras",
  "segundo": {
    "titulo": "otra frase corta e imperativa, maximo 6 palabras",
    "contenido": "2 o 3 oraciones concretas, un angulo DISTINTO del primero",
    "autor": "OTRO autor de la lista y su idea en 4 o 5 palabras"
  }
}`

      try {
        const r = await generateText({ model: "openai/gpt-4o-mini", prompt: promptCap, maxOutputTokens: 1200, temperature: 0.95 })
        const t = r.text.trim()
        return NextResponse.json({ ok: true, capacitacion: leerJSONAunqueVengaCortado(t) })
      } catch (e) {
        console.error("[v0] Error generando micro capacitacion:", e)
        return NextResponse.json({ ok: false, error: "No se pudo generar el consejo" }, { status: 502 })
      }
    }
    
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
      // Las no realizadas se separan por antiguedad:
      // - recientes (ultima semana): NO se vuelven a sugerir, la sala sigue avanzando
      // - antiguas: ALBA puede reconsiderarlas mas adelante si el analisis lo estima pertinente
      let actividadesNoRealizadasRecientes: string[] = []
      let actividadesNoRealizadasAntiguas: string[] = []
      try {
        const { data: cierres } = await supabase
          .from("registro_cierre")
          .select("actividad_alba, evaluacion_general, eje, fecha")
          .eq("sala", sala || "Kindergarten")
          .order("fecha", { ascending: false })
          .limit(20)
        if (cierres && cierres.length > 0) {
          const realizadas = cierres.filter(c => c.evaluacion_general !== "no_realizada")
          const hoyMs = Date.now()
          const UNA_SEMANA_MS = 7 * 86400000
          for (const c of cierres) {
            if (c.evaluacion_general !== "no_realizada" || !c.actividad_alba) continue
            const fechaMs = c.fecha ? new Date(c.fecha).getTime() : 0
            if (fechaMs && (hoyMs - fechaMs) <= UNA_SEMANA_MS) {
              actividadesNoRealizadasRecientes.push(c.actividad_alba)
            } else {
              actividadesNoRealizadasAntiguas.push(c.actividad_alba)
            }
          }
          historialResumen = realizadas.slice(0, 10).map(c =>
            `- ${c.actividad_alba || "sin nombre"} (${c.eje}, ${c.evaluacion_general}, ${c.fecha})`
          ).join("\n")
        }
      } catch (e) {
        // silencioso
      }

      const diasArray = dias as string[]

      // ── DECISION EN CODIGO: que eje y que paso le toca a cada dia ────────
      // La IA ya no decide la progresion. El sistema calcula, con la evidencia
      // real de la sala, en que paso de cada secuencia esta y que eje necesita.
      const salaNombre = sala || "Kindergarten"
      const esMaternal = esDeMaternal(salaNombre)
      const nivel = nivelDeSala(salaNombre)

      // Los EJES los decide el NIVEL de la sala: cada edad tiene su territorio
      // pedagogico y su progresion. La capacidad no elige la actividad: es la
      // lente con la que se observa lo que la actividad pone en juego.
      const ejesDeEsteNivel =
        nivel === "2" ? EJES_SALA2.map((e) => e.key)
        : nivel === "3" ? EJES_SALA3.map((e) => e.key)
        : semanaAnio >= 20 ? ["CF", "CT", "O", "EA"] : ["CF", "CT", "O"]

      const secuenciaDeEsteNivel: Record<string, any[]> | null =
        nivel === "2" ? SECUENCIA_SALA2 : nivel === "3" ? SECUENCIA_SALA3 : null

      const ejesPosibles: string[] = ejesDeEsteNivel

      const yaDadasPorEje: Record<string, string[]> = { CF: [], CT: [], O: [], EA: [] }
      const promedioPorEje: Record<string, number> = { CF: 50, CT: 50, O: 50, EA: 50 }
      ejesPosibles.forEach((k) => { yaDadasPorEje[k] = []; promedioPorEje[k] = 50 })
      // Porcentaje de chicos en verde por eje: es la "mayoria consolidada"
      const verdePorEje: Record<string, number> = { CF: 0, CT: 0, O: 0, EA: 0 }
      ejesPosibles.forEach((k) => { verdePorEje[k] = 0 })
      const ultimaPorEjeSem: Record<string, number> = {}

      try {
        const { data: alumnosSala } = await supabase
          .from("alumnos").select("id").eq("sala", salaNombre)
        const idsSala = (alumnosSala || []).map((a: any) => a.id)
        if (idsSala.length > 0) {
          const { data: regsSala } = await supabase
            .from("seguimiento").select("*")
            .in("alumno_id", idsSala)
            .order("fecha", { ascending: true })
          const puntos: Record<string, { suma: number; n: number }> = {}
          const verdes: Record<string, { verdes: number; n: number }> = {}
          ;(regsSala || []).forEach((r: any) => {
            const e = ejeDeSeguimiento(r.eje)
            if (r.actividad) {
              const nom = String(r.actividad)
              if (!yaDadasPorEje[e].includes(nom)) yaDadasPorEje[e].push(nom)
              const t = new Date(r.fecha || r.created_at).getTime()
              if (!isNaN(t) && (!ultimaPorEjeSem[e] || t > ultimaPorEjeSem[e])) ultimaPorEjeSem[e] = t
            }
            const est = String(r.estado || "").toLowerCase()
            if (est === "blue") return
            if (!puntos[e]) puntos[e] = { suma: 0, n: 0 }
            puntos[e].suma += est === "green" ? 100 : est === "yellow" ? 50 : 0
            puntos[e].n++
            if (!verdes[e]) verdes[e] = { verdes: 0, n: 0 }
            if (est === "green") verdes[e].verdes++
            verdes[e].n++
          })
          Object.keys(verdes).forEach((e) => {
            if (verdes[e].n > 0) verdePorEje[e] = Math.round((verdes[e].verdes / verdes[e].n) * 100)
          })
          Object.keys(puntos).forEach((e) => {
            if (puntos[e].n > 0) promedioPorEje[e] = Math.round(puntos[e].suma / puntos[e].n)
          })
        }
      } catch (errEvid) {
        console.error("[v0] Error leyendo evidencia de la sala:", errEvid)
      }

      // Prioridad por necesidad: pesa la postergacion, el bajo rendimiento y la poca cobertura
      const ahoraSemMs = Date.now()
      const prioridadSemanal = (e: string) => {
        const dias = ultimaPorEjeSem[e] ? Math.floor((ahoraSemMs - ultimaPorEjeSem[e]) / 86400000) : 60
        const cobertura = yaDadasPorEje[e].length
        return Math.min(dias, 60) * 3 + (100 - promedioPorEje[e]) + Math.max(0, 20 - cobertura * 2)
      }

      // ── QUE EJES TRABAJA LA SEMANA ──────────────────────────────────────
      //
      // Dos problemas resueltos aca:
      //
      // 1. EL EMPATE. En una sala sin evaluaciones todos los ejes dan la misma
      //    prioridad (250) y el ordenamiento conservaba el orden en que estan
      //    escritos: como los primeros de maternal son los de lenguaje, salian
      //    siempre esos tres. Por eso el desempate va al azar.
      //
      // 2. EL DESBALANCE. En el Diseno de maternal "Comunicacion y expresion"
      //    es UN area, pero la partimos en cuatro ejes (uso de la lengua,
      //    oraciones, vocabulario, escritura). Las otras cuatro areas tienen un
      //    eje cada una. Elegir eje por eje le da al lenguaje cuatro chances
      //    contra una. Por eso se elige por AREA: cada una pesa igual, como en
      //    el Diseno, y la semana recorre areas distintas.
      // Como se LLAMA el area en el Diseno. Es lo que ve la maestra.
      const AREA_DEL_EJE_NOMBRE: Record<string, string> = {
        // Sala de 2 — las cinco areas del DC de Jardin Maternal
        USO: "Comunicacion y expresion", ORA: "Comunicacion y expresion",
        VOC: "Comunicacion y expresion", ESC: "Comunicacion y expresion",
        JUE: "Desarrollo del juego", COR: "Desarrollo corporal",
        AMB: "Exploracion del ambiente", PER: "Desarrollo personal y social",
        // Sala de 3 — las cinco areas de su Diseno
        COMP: "Lengua", PROD: "Lengua", PREC: "Lengua",
        MAT: "Matematica", IND: "Indagacion del ambiente",
        EFI: "Educacion Fisica", EXP: "Lenguajes expresivos",
      }

      const AREA_DEL_EJE: Record<string, string> = {
        // Sala de 2 — las cinco areas del DC de Jardin Maternal
        USO: "comunicacion", ORA: "comunicacion", VOC: "comunicacion", ESC: "comunicacion",
        JUE: "juego", COR: "corporal", AMB: "ambiente", PER: "personal",
        // Sala de 3 — las cinco areas de su Diseno
        COMP: "lengua", PROD: "lengua", PREC: "lengua",
        MAT: "matematica", IND: "indagacion", EFI: "fisica", EXP: "expresivos",
      }

      const barajar = <T,>(xs: T[]): T[] => {
        const a = [...xs]
        for (let i = a.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[a[i], a[j]] = [a[j], a[i]]
        }
        return a
      }

      // Esto aplica SOLO A MATERNAL. Jardin conserva exactamente la logica
      // que ya tenia y funciona bien: sin barajado, sin agrupar por area.
      const esMaternalEjes = nivel === "2" || nivel === "3"

      const ejesDeLaSemana: string[] = []

      if (!esMaternalEjes) {
        // ── JARDIN 4/5: identico a como venia ────────────────────────────
        const ordenJardin = [...ejesPosibles]
          .sort((a, b) => prioridadSemanal(b) - prioridadSemanal(a))
          .slice(0, diasArray.length)
        ejesDeLaSemana.push(...ordenJardin)
      } else {
        const ordenados = barajar(ejesPosibles)
          .sort((a, b) => prioridadSemanal(b) - prioridadSemanal(a))

        // Un eje por area, en orden de prioridad. Si no alcanzan las areas,
        // recien ahi se repite area con otro eje.
        const areasUsadas = new Set<string>()
        for (const e of ordenados) {
          if (ejesDeLaSemana.length >= diasArray.length) break
          const area = AREA_DEL_EJE[e] || e
          if (areasUsadas.has(area)) continue
          areasUsadas.add(area)
          ejesDeLaSemana.push(e)
        }
        for (const e of ordenados) {
          if (ejesDeLaSemana.length >= diasArray.length) break
          if (!ejesDeLaSemana.includes(e)) ejesDeLaSemana.push(e)
        }
      }
      while (ejesDeLaSemana.length < diasArray.length) {
        ejesDeLaSemana.push(ejesPosibles[ejesDeLaSemana.length % ejesPosibles.length])
      }

      const NOMBRE_EJE_LARGO: Record<string, string> = {
        CF: "Conciencia Fonologica", CT: "Comprension de Textos",
        O: "Oralidad", EA: "Escritura",
      }
      CAPACIDADES_MATERNAL.forEach((c) => { NOMBRE_EJE_LARGO[c.key] = c.nombre })
      EJES_SALA2.forEach((e) => { NOMBRE_EJE_LARGO[e.key] = e.nombre })
      EJES_SALA3.forEach((e) => { NOMBRE_EJE_LARGO[e.key] = e.nombre })

      // ── DECISION DE LA DOCENTE + CONSOLIDACION ──────────────────────────
      // Del ultimo cierre de cada eje sacamos: en que paso estaba, si la maestra
      // pidio volver sobre el, y cuantas veces se trabajo ese mismo paso.
      const ultimoCierrePorEje: Record<string, { paso: string; repetir: boolean | null; veces: number }> = {}
      try {
        const { data: cierresSala } = await supabase
          .from("registro_cierre")
          .select("eje, paso, repetir, created_at")
          .eq("sala", salaNombre)
          .order("created_at", { ascending: false })
          .limit(80)
        ;(cierresSala || []).forEach((c: any) => {
          if (!c.paso) return
          const e = ejeDeSeguimiento(c.eje)
          const pasoTxt = String(c.paso)
          if (!ultimoCierrePorEje[e]) {
            ultimoCierrePorEje[e] = {
              paso: pasoTxt,
              repetir: c.repetir === true ? true : c.repetir === false ? false : null,
              veces: 0,
            }
          }
          if (ultimoCierrePorEje[e].paso === pasoTxt) ultimoCierrePorEje[e].veces++
        })
      } catch (errCierres) {
        console.error("[v0] Error leyendo cierres para decidir avance:", errCierres)
      }

      // Criterios acordados: mayoria = 70% de los chicos en verde;
      // tope = 3 veces el mismo paso, despues avanza igual.
      const MAYORIA_VERDE = 70
      const TOPE_REPETICIONES = 3

      const pasosDeLaSemana = ejesDeLaSemana.map((e) => {
        // Maternal usa la secuencia de SU NIVEL: sala de 2 o sala de 3.
        // Arranca a mitad de secuencia porque estamos a mitad de ano.
        if (secuenciaDeEsteNivel) {
          const seqCap = secuenciaDeEsteNivel[e] || []
          const dadas = new Set((yaDadasPorEje[e] || []).map((t: string) => t.trim().toLowerCase()))
          const arranqueNivel = Math.floor(seqCap.length / 2)
          let idx = seqCap.findIndex((a: any, i: number) => i >= arranqueNivel && !dadas.has(String(a.titulo).trim().toLowerCase()))
          if (idx < 0) idx = seqCap.findIndex((a: any) => !dadas.has(String(a.titulo).trim().toLowerCase()))
          let repite = false
          if (idx < 0) { idx = arranqueNivel; repite = true }
          return { eje: e, paso: seqCap[idx], indice: idx, esRepeticion: repite, motivo: "" }
        }

        const ultimo = ultimoCierrePorEje[e]

        if (ultimo && ultimo.paso) {
          const seqEje = SECUENCIA[e as "CF" | "CT" | "O" | "EA"] || []
          const idx = seqEje.findIndex(
            (a) => a.titulo.trim().toLowerCase() === ultimo.paso.trim().toLowerCase()
          )
          if (idx >= 0 && ultimo.veces < TOPE_REPETICIONES) {
            const consolidado = (verdePorEje[e] ?? 0) >= MAYORIA_VERDE && ultimo.veces >= 2
            // La docente manda. Si no opino, decide la evidencia.
            const quedarse = ultimo.repetir === true || (ultimo.repetir === null && !consolidado)
            if (quedarse) {
              return {
                eje: e,
                paso: seqEje[idx],
                indice: idx,
                esRepeticion: true,
                motivo: ultimo.repetir === true
                  ? "la docente pidio volver sobre este contenido"
                  : `el grupo todavia no lo consolido (${verdePorEje[e] ?? 0}% en verde)`,
              }
            }
          }
        }

        const r = calcularActividadDelDia(
          e as "CF" | "CT" | "O" | "EA", yaDadasPorEje[e].length, promedioPorEje[e], salaNombre, yaDadasPorEje[e]
        )
        return { eje: e, paso: r.actividad, indice: r.indice, esRepeticion: r.esRepeticion, motivo: "" }
      })

      const instruccionesDias = pasosDeLaSemana.map((p, i) => {
        // La prohibicion va PEGADA a la instruccion del dia, no en un bloque aparte:
        // el modelo la ignora cuando esta veinte lineas mas arriba.
        const prohibidas = (yaDadasPorEje[p.eje] || []).slice(-10)
        const bloqueProhibido = prohibidas.length
          ? `\n  PROHIBIDO para este dia: no uses estos titulos ni variantes parecidas: ${prohibidas.join(" | ")}. El titulo y la consigna tienen que ser claramente distintos.`
          : ""
        const bloqueRepeticion = p.esRepeticion
          ? `\n  SE VUELVE sobre este mismo paso${p.motivo ? ` porque ${p.motivo}` : ""}. NO avances de nivel, pero la actividad tiene que ser OTRA: cambia el formato (de juego corporal a juego con tarjetas, de grupo grande a parejas, de oral a manipulativo), cambia el soporte y cambia el titulo.`
          : ""
        return (
          `Dia ${i + 1} (${diasArray[i]}) — eje ${NOMBRE_EJE_LARGO[p.eje]}.\n` +
          `  PASO A TRABAJAR: "${p.paso.titulo}"\n` +
          `  Objetivo del paso: ${p.paso.objetivo}\n` +
          `  Referencia: ${p.paso.descripcion}` +
          bloqueRepeticion +
          bloqueProhibido
        )
      }).join("\n\n")

      const listaYaDadas = Object.entries(yaDadasPorEje)
        .map(([e, l]) => (l.length ? `- ${NOMBRE_EJE_LARGO[e]}: ${l.slice(-12).join(", ")}` : ""))
        .filter(Boolean).join("\n") || "Ninguna todavia."

      // Se conserva para el fallback si la IA falla
      const EJES = ejesDeLaSemana.map((e) => (e === "EA" ? "Escritura" : e))

      // La impronta de las docentes de esta edad: como escriben ellas. Si no
      // hay material devuelve vacio y el prompt queda igual que hoy.
      const impronta = await traerImpronta(nivel)

      const prompt = `${
  nivel === "2"
    ? "Eres ALBA, el asistente pedagogico de una SALA DE 2 ANOS del jardin maternal. Tu marco es el Diseno Curricular de Jardin Maternal y las CINCO CAPACIDADES. NO sos un asistente de alfabetizacion: a esta edad se aprende con el cuerpo, los objetos y el juego, no hablando."
    : nivel === "3"
    ? "Eres ALBA, el asistente pedagogico de una SALA DE 3 ANOS. Tu marco es el Diseno Curricular de Sala de 3 y sus cinco areas. NO sos un asistente de alfabetizacion: a esta edad se aprende con el cuerpo, los objetos y el juego."
    : `Eres ALBA, el asistente pedagogico de alfabetizacion temprana de un aula de ${nombreDeNivel(nivel)} en una escuela publica de California. Tu marco son los Common Core State Standards de California para English Language Arts y, en transitional kindergarten, las California Preschool/TK Learning Foundations. NO inventas actividades: trabajas sobre una secuencia curada y sobre la evidencia real del aula.`
}

La maestra ya dio su clase con el programa que adopto su distrito. Vos no reemplazas esa clase: la acompanas. Tu trabajo es que atienda a los chicos que no llegaron, en el minimo tiempo posible, porque tiene tres minutos antes de volver con sus alumnos.

CONTEXTO DE LA SALA:
- Sala: ${sala}
- EDAD DE LOS NIÑOS: ${nivel === "2" ? "2 anos (jardin maternal)" : nivel === "3" ? "3 anos" : nivel === "4" ? "4 anos" : "5 anos"}
${nivel === "3" ? `
ATENCION — ESTA ES UNA SALA DE 3 ANOS, y estamos a MITAD DE ANO: el grupo ya
viene trabajando, no arranca de cero.

Los ejes son los tres bloques del area Lengua del Diseno de sala de 3:
Comprension, Produccion, y Precursores y sistema de escritura.

VARIA LAS AREAS DEL DISENO. En sala de 3 las propuestas NO son todas de leer
cuentos y conversar. El Diseno de Sala de 3 organiza la ensenanza en CINCO
AREAS, y las actividades de la semana tienen que pasar por varias:

- LENGUA: comprension y produccion oral, precursores de la escritura.
- MATEMATICA: a los 3 anos es conteo con objetos concretos, comparar
  cantidades (mas, menos, igual), clasificar y agrupar por atributos, formas
  y nociones espaciales. NADA de sumar, restar ni escribir numeros.
- INDAGACION DEL AMBIENTE: explorar el entorno natural y social, observar
  cambios, hacerse preguntas sobre lo que pasa alrededor.
- EDUCACION FISICA: movimiento, equilibrio, juegos corporales, coordinacion.
- LENGUAJES EXPRESIVOS: plastica, musica, expresion corporal, juego dramatico.

Si en la semana ya hay una propuesta de cuentos o conversacion, la siguiente
tiene que venir de OTRA area.

EL CUERPO Y LOS OBJETOS SON EL METODO tambien a los 3 anos. La propuesta
tiene a los chicos HACIENDO: buscar, construir, clasificar, trasladar,
mezclar, plantar, embocar, dramatizar. Si la actividad se resuelve sentados
en ronda conversando, esta mal planteada. La conversacion aparece MIENTRAS
hacen o despues de hacer, nunca en lugar de hacer.
MAL: "conversen sobre las plantas que conocen".
BIEN: "salgan al patio con una lupa a buscar tres hojas distintas. Al volver,
que cada uno cuente donde la encontro y como es."

Adapta TODO a los 3 anos:
- Duracion: 15 a 20 minutos.
- Consignas de uno o dos pasos, dichas en frases cortas.
- Mucho juego, cuerpo y objetos reales. Se empieza a trabajar con imagenes y carteles.
- En precursores: palabra dentro de la oracion, silaba dentro de la palabra y rimas.
  NADA de fonemas aislados, ni copiar palabras, ni escritura convencional.
- El nombre propio se RECONOCE entre otros, no se copia ni se traza letra por letra.
- Trazos grandes y controlados, toma del lapiz: eso si.
- La repeticion sigue siendo central: la misma propuesta varios dias.
` : nivel === "2" ? `
ATENCION — ESTA ES UNA SALA DE 2 ANOS DEL JARDIN MATERNAL.

Los ejes son las CINCO CAPACIDADES del Diseno Curricular, no los ejes de
alfabetizacion. LA CAPACIDAD ES LO QUE MANDA: cada actividad trabaja la
capacidad que le toca —autonomia, comunicacion, resolucion de problemas,
colaboracion o pensamiento reflexivo— y se disena para eso.

NO fuerces el lenguaje en todas las actividades. Si la capacidad de la semana
es autonomia o resolucion de problemas, la actividad es sobre eso, no sobre
hablar. Lo que si corresponde siempre es que el adulto ACOMPANE CON PALABRAS
lo que va pasando —nombra lo que el nino hace, siente y quiere— pero eso es
la forma de estar del docente, no el objetivo de la propuesta.

EL AREA DE CADA DIA YA ESTA DECIDIDA (te la damos abajo, dia por dia). No la
elijas vos: escribi la actividad que corresponde a esa area. Una sala de
maternal explora, se mueve, juega y manipula tanto como escucha.

Adapta TODO a los 2 anos:
- Duracion: 5 a 10 minutos. A esta edad la atencion sostenida es muy breve.
- UNA sola consigna, dicha en una frase corta y acompanada de gesto.
- Todo corporal, manipulativo y con objetos reales. NADA de fichas, papel ni consignas escritas.
- Grupos muy chicos o ronda con toda la sala, nunca trabajo individual en mesa.
- La repeticion es central: la misma propuesta se repite muchos dias y asi se aprende.
- Se aprende jugando y en las rutinas cotidianas (cambiado, merienda, guardado), no en "clases".
- El adulto pone en palabras lo que el nino hace, siente y quiere: ese es el motor del lenguaje.
- No se espera un resultado: se observa un proceso.
- Estamos a MITAD DE ANO: el grupo ya viene trabajando, no arranca de cero.

PROHIBIDO EN SALA DE 2, ademas de lo aritmetico:
- RIMAS, trabalenguas, adivinanzas, jugar con los sonidos de las palabras.
  Eso es conciencia fonologica y es de sala de 4 y 5. A los 2 anos NO.
- Conversar sentados en ronda como propuesta principal. A esta edad la
  atencion sostenida hablando es de segundos: si la actividad se resuelve
  charlando, esta mal planteada.
- Cualquier propuesta donde los chicos esten quietos escuchando.

EL CUERPO Y LOS OBJETOS SON EL METODO. Toda actividad de sala de 2 tiene a
los chicos MOVIENDOSE Y MANIPULANDO: meter y sacar, llenar y vaciar, apilar,
trasladar, esconder y buscar, embocar, arrastrar, trepar, amasar, chapotear,
envolver, abrir y cerrar. El adulto acompana con palabras lo que va pasando,
pero la propuesta es la accion, no la conversacion.
MAL: "sentados en ronda, conversen sobre los animales que conocen".
BIEN: "pone en una batea objetos de distintas texturas tapados con una tela.
Que cada nino meta la mano, saque uno y lo lleve hasta el canasto del otro
lado de la sala. Mientras lo hacen, nombra lo que sacaron."

QUE CONTENIDO COGNITIVO ES APROPIADO A LOS 2 ANOS (textual del Diseno
Curricular de Jardin Maternal, area Exploracion del ambiente): a esta edad
se empieza a COMPARAR objetos por tamano, forma o cantidad; AGRUPAR o
SEPARAR segun caracteristicas observables (grande/chico, mismo color, va
junto/no va junto); y construir relaciones espaciales simples (adentro,
afuera, arriba, abajo). Eso es TODO lo que corresponde de pensamiento
logico-matematico a esta edad.

PROHIBIDO EN SALA DE 2: sumar, restar, contar mas alla de sesiones muy
cortas de conteo con objetos concretos (uno, dos, muchos), cualquier
operacion aritmetica, escribir numeros, usar fichas con numeros. Si la
maestra o el proyecto traen un tema de "contar" o "matematica", llevalo a
lo que SI corresponde: agrupar, comparar, separar objetos reales.
MAL: "lancen dos dados y sumen los puntos".
BIEN: "junten todas las pelotas grandes en un canasto y las chicas en
otro, mientras nombras: esta es grande, esta es chica".
` : esde4Anios(salaNombre) ? `
ATENCION — ESTA ES UNA SALA DE 4 ANOS. Adapta TODO a esa edad:
- Duracion: 10 a 15 minutos como maximo. Los de 4 no sostienen mas.
- Consignas de UN SOLO paso por vez. Nada de "primero, luego, despues, finalmente".
- Todo oral, corporal y manipulativo: cantar, palmear, saltar, mover objetos. NADA de leer ni escribir de forma convencional.
- En conciencia fonologica quedate en la unidad GRANDE: palabra, silaba, rima. NO trabajes fonemas aislados.
- En escritura: garabato, marcas, el nombre propio como dibujo. Nunca pedir que escriban frases.
- Grupos chicos o ronda completa, nunca trabajo individual en mesa.
- Materiales concretos que se puedan tocar. Sin fichas ni consignas escritas.
- Vocabulario simple y frases cortas en la consigna.
` : `
Esta es una sala de 5 anos: pueden sostener consignas de dos o tres pasos, trabajar en parejas, y aproximarse a la escritura con marcas propias y al analisis de sonidos dentro de la palabra.
`}

════════════════════════════════════════════════════════════════════
COMO ENSENA UN DOCENTE DE NIVEL INICIAL
Esto no son reglas sueltas: es el marco del que se desprende todo lo demas.
Si una decision no sale de aca, esta mal tomada.
════════════════════════════════════════════════════════════════════

1. SE APRENDE HACIENDO. En el nivel inicial el conocimiento se construye con
   las manos y el cuerpo, no escuchando ni conversando sobre algo. Toda
   propuesta tiene una ACCION CONCRETA en el centro: plantar, medir, palmear,
   armar, buscar, repartir, comparar, construir, cocinar, esconder.
   El lenguaje aparece DENTRO de esa accion, no en lugar de ella.

   Por eso NUNCA resuelvas una actividad con "observen y cuenten", "dialoguen
   sobre", "compartan sus experiencias" o "preguntales que sienten". Eso es una
   charla, no una propuesta de sala. Si la actividad se puede hacer sentados en
   ronda hablando, esta mal planteada.

   MAL: "invitalos a observar la huerta y preguntales que sienten".
   BIEN: "que cada uno plante una semilla en su vasito y le ponga una etiqueta
   con su nombre. Mientras plantan, pregunta que necesita la semilla para
   crecer. Al terminar, cada uno cuenta que planto y donde lo va a poner."

2. EL JUEGO ES EL METODO. El Diseno lo dice: el juego es la experiencia que
   articula el desarrollo del lenguaje y la cognicion. No es un adorno que se
   agrega al final: es la forma en que se ensena a esta edad.

   PROPUESTAS QUE NOMBRA EL DISENO DE SALA DE 4 Y 5 (usalas cuando sea esa edad):
   - "VEO VEO" y "EL DETECTIVE": para enunciar caracteristicas de un objeto
     partiendo de lo que se ve y de para que sirve.
   - "MUESTRO Y CUENTO": cada nino trae un objeto suyo y cuenta de que se trata
     y por que lo eligio. La maestra ayuda con las primeras preguntas y establece
     relaciones entre categorias: "es un utensilio de la sala?", "es un juguete?".
   - FORMULAR O SEGUIR INSTRUCCIONES de pocos pasos: indicar los pasos para
     preparar una chocolatada, para armar una torre con bloques de distintos
     tamanos.
   - EXPLICAR CON SUS PALABRAS las reglas de un juego conocido: la mancha, las
     escondidas.
   - ELABORAR EN GRUPO las normas de convivencia o las reglas de la biblioteca,
     partiendo de preguntas que les hagan ver que hace falta ordenar la sala.
   - JUEGOS PARA FORMULAR PREGUNTAS abiertas —que, quien, cuando, donde— y
     respuestas con distintas estructuras. La maestra modela las primeras.
   - LA RONDA DE INTERCAMBIO: el Diseno la llama "practica comunicativa
     privilegiada". Pero OJO: no es sentarse a charlar. La maestra organiza los
     turnos e INTERVIENE — pregunta por lo que falta en el relato ("cuando te
     caiste?, con quien estabas?"), agrega lo que es importante, reelabora.
     Sin esa intervencion no hay ensenanza.

   PROPUESTAS QUE NOMBRA EL DISENO DE SALA DE 3 (usalas cuando sea esa edad):
   - JUEGO DRAMATICO: representar roles —hacer las compras, ir al doctor, servir
     el te— donde tienen que preguntar, pedir, explicar y variar como hablan.
   - ADIVINANZAS Y JUEGOS DE PISTAS: para descubrir un objeto o personaje. Salen
     preguntas cerradas: "es un animal?", "vive en el bosque?".
   - JUEGOS DE CONSTRUCCION: aparecen las palabras de lugar y tamano: "poné el
     bloque rojo chico arriba del verde grande".
   - TEXTOS VERSIFICADOS: poesias y canciones donde se juega con como suenan
     las palabras.

   EN MATERNAL, sala de 2: la sorpresa (una bolsa o una tela de la que sale
   algo), un personaje que se equivoca y hay que corregirlo, esconder y buscar,
   la cancion que se corta para que completen, el cuerpo, y la repeticion con
   variacion.

   NUNCA mezcles las propuestas de una edad con las de otra.

   Y ATENCION: esas propuestas son UN MODELO, NO UN MENU. El Diseno las da "a
   modo de orientaciones", no como lista cerrada. Entendé POR QUE funcionan —hay
   una accion concreta, hay algo que resolver usando el lenguaje, la maestra
   andamia— e INVENTA otras con esa misma logica. Si todas tus actividades son
   "Veo veo" y adivinanzas, estas girando sobre lo mismo y la sala se aburre.

   VARIA LA ESTRUCTURA, no solo el tema. Si las ultimas dos actividades de esta
   sala fueron de adivinar, la que escribas ahora tiene que ser de otra cosa:
   construir, cocinar, ordenar, dramatizar, salir a buscar, fabricar algo.
   Cambiar el tema y repetir el formato NO es variar.

3. CONCIENCIA FONOLOGICA: TODO ORAL. El Diseno es explicito: las propuestas de
   conciencia fonologica reflexionan sobre el lenguaje HABLADO y NO incluyen
   letras ni palabras escritas. Se empieza reconociendo rimas dentro de poemas
   o canciones, y despues generandolas.

4. LA BIBLIOTECA Y LOS CARTELES DE LA SALA son el contexto para las
   convenciones de la escritura: las partes del libro, el titulo, el autor,
   hacia donde se lee, que lo escrito dice siempre lo mismo.

5. EL DOCENTE ANDAMIA. El Diseno de 4 y 5 lo dice asi: lo que un nino puede
   hacer HOY con ayuda, manana lo va a poder solo. El tipo y la calidad de las
   intervenciones de la maestra son clave para el aprendizaje. Y la propuesta
   tiene que estar en el punto justo: NI MUY FACIL NI MUY DIFICIL, porque en los
   dos extremos no se aprende nada.
   Por eso las consignas dicen que hace la maestra MIENTRAS los chicos hacen:
   que pregunta, que modela, que reelabora, cuando espera. A medida que ellos
   se sueltan, el acompanamiento baja.

DENTRO DEL MARCO ESCOLAR: con lo que hay en una sala o se consigue en un kiosco.
Nada de disfraces, producciones ni materiales que la maestra no tenga a mano.

MATERIALES. Varia: no todo papel y crayones. Se consiguen en una sala o un kiosco.
- Papel celofan de colores para mirar a traves, linterna, espejo
- Hielo, agua, espuma de afeitar, esponjas
- Tubos de carton, cajas, papel burbuja, telas
- Tapitas, broches, arroz o fideos en una bandeja
- Sal o harina sobre una bandeja oscura para dejar marcas con el dedo
- Bolsas de tela, canastos, titeres o munecos de la sala

CUENTOS Y CANCIONES: NO inventes titulos. Un titulo tirado al azar no le sirve a
la maestra: no sabe si existe ni si lo tiene en la sala. Deci QUE TIPO DE TEXTO
necesita la actividad y PARA QUE, y que ella elija de su biblioteca.

MAL: "leeles el cuento 'La tortuga y el escorpion'".
BIEN: "busca un cuento breve donde haya un problema que se resuelve, para que
puedan anticipar que va a pasar".
BIEN: "elegi un cuento con mucha accion y personajes que hablen, asi tienen de
que preguntar".
BIEN: "busca una poesia con rima bien marcada, de las que se pueden completar".

Solo nombra una obra si es MUY conocida y estas seguro de que existe. Ante la
duda, describi el tipo de texto. NUNCA links ni URLs.

COMO SE ESCRIBE: es una planificacion de aula. La prueba: si manana entra una
SUPLENTE que no conoce al grupo, tiene que poder darla leyendola una vez.
Materiales exactos, como se agrupan, cuanto dura, que frases decir.

CAPACIDADES DEL DISENO CURRICULAR DE CABA (son cinco, comunes a todos los niveles).
Para cada actividad elegi la que MAS se pone en juego, escrita exactamente asi:
- Autonomia para aprender
- Comunicacion
- Pensamiento reflexivo y critico
- Resolucion de problemas
- Compromiso y colaboracion

- ${bloqueProyecto(proyecto) || 'Proyecto en curso: "Alfabetizacion inicial"'}
- Objetivo del proyecto: "${proyecto?.objetivoGeneral || "Aproximacion a la lengua escrita"}"
- Semana del año: ${semanaAnio} (${semanaAnio >= 20 ? "segunda mitad del año — trabajar los 3 ejes completos CF/CT/Escritura" : "primera mitad — foco en CF y CT, aproximacion a Escritura"})

${(nivel === "4" || nivel === "5") ? `MARCO CURRICULAR: DC CABA 2025 — Practicas del Lenguaje, Nivel Inicial Salas 4 y 5.
Ejes de trabajo: CF (Conciencia Fonologica), Oralidad, CT (Comprension Textual), Escritura inicial.

FUNDAMENTO METODOLOGICO — basate en la evidencia de los sistemas de alfabetizacion mas efectivos a nivel mundial y adaptalos al contexto argentino:
- Science of Reading / Simple View of Reading: la lectura = decodificacion x comprension del lenguaje. Trabajar ambas vias en paralelo.
- Conciencia fonologica sistematica (linea Heggerty / Phonological Awareness): progresion explicita de la unidad mayor a la menor.
- Lectura dialogica y lenguaje oral enriquecido (linea Hanen / dialogic reading): preguntas abiertas, expansion del vocabulario, intercambios conversacionales.
- Escritura emergente (Ferreiro-Teberosky): respetar y hacer avanzar las hipotesis de escritura del niño (presilabica → silabica → silabico-alfabetica → alfabetica).
- Enfoque equilibrado (balanced literacy) anclado en proyectos con sentido real para el niño.

SECUENCIAS PROGRESIVAS (clave para NO repetir y para que cada semana AVANCE de nivel):
- CF — Conciencia Fonologica: conciencia lexica (contar palabras) → conciencia silabica (segmentar/unir silabas) → rima y aliteracion → conciencia intrasilabica → conciencia fonemica (sonido inicial → final → segmentacion de fonemas). Avanzar de nivel a medida que el grupo consolida el anterior.
- Oralidad: escucha comprensiva → relato y descripcion → vocabulario y categorias → narracion estructurada (inicio-nudo-desenlace) → argumentacion y conversacion.
- CT — Comprension Textual: anticipacion por paratexto → comprension literal → secuencia temporal → inferencias → reconstruccion y recontado.
- Escritura inicial: trazos y nombre propio como modelo estable → escritura de palabras significativas → escritura de listas y rotulos → escritura de frases → produccion con sentido comunicativo.
` : ""}

REGLA DE PROGRESION: la progresion NO la decidis vos. El sistema ya calculo, con la evidencia real de esta sala, que eje y que paso corresponde a cada dia. Tu tarea es ESCRIBIR la actividad de ese paso, adaptada al proyecto del grupo. No cambies el eje ni el paso indicado.

HISTORIAL RECIENTE (actividades ya realizadas — NO repetir):
${historialResumen || "Sin historial previo — esta es la primera semana."}

${actividadesNoRealizadasRecientes.length > 0 ? `ACTIVIDADES NO REALIZADAS LA ULTIMA SEMANA (NO volver a sugerir ahora — la sala sigue avanzando con contenido nuevo. Podran reconsiderarse mas adelante si el progreso lo amerita):\n${actividadesNoRealizadasRecientes.join(", ")}` : ""}

${actividadesNoRealizadasAntiguas.length > 0 ? `ACTIVIDADES NO REALIZADAS HACE MAS DE UNA SEMANA (solo reconsiderar si el analisis de progreso del grupo indica que ese contenido aun es necesario; de lo contrario, continuar avanzando):\n${actividadesNoRealizadasAntiguas.join(", ")}` : ""}

ACTIVIDADES YA EN EL CRONOGRAMA ESTA SEMANA (evitar duplicar):
${(actividadesYaSugeridas || []).join(", ") || "Ninguna."}

ACTIVIDADES QUE ESTA SALA YA TRABAJO (no repetir ninguna, ni con otro nombre):
${listaYaDadas}

${bloqueImpronta(impronta)}
TAREA: Genera exactamente ${diasArray.length} actividades de alfabetizacion, UNA por cada dia, respetando el eje y el paso indicados:

${instruccionesDias}

REQUISITOS DE CADA ACTIVIDAD:
1. Novedosa, original, no repetida respecto al historial NI a actividades del mismo nivel de secuencia ya trabajadas
2. Debe representar el SIGUIENTE paso de la secuencia de su eje (progresion real, no repeticion del mismo nivel)
3. Anclada al proyecto "${proyecto?.titulo || "actual"}" cuando sea posible
4. Rica en recursos: juegos corporales, canciones, cuentos, materiales no convencionales, tecnologia simple, metodologias (Montessori, Reggio, Vigotsky, lectura dialogica, conciencia fonologica sistematica, etc.)
5. Practicable por una sola maestra con 20-25 ninos de jardin
6. Tiempo de ejecucion: 20-30 minutos
7. Materiales accesibles en un jardin de infantes comun de Argentina

FORMATO DE RESPUESTA — JSON puro, sin markdown, sin explicaciones fuera del JSON:
[
  {
    "dia": "${diasArray[0]}",
    "eje": "CF",
    "nivelSecuencia": "paso especifico de la secuencia del eje que se trabaja (ej: 'conciencia silabica - segmentacion')",
    "nombre": "nombre corto y atractivo",
    "capacidades": "SOLO EL VERBO Y LA ACCION, nada mas. PROHIBIDO poner adelante el nombre de una capacidad: 'Comunicacion:', 'Pensamiento reflexivo y critico:' NO van aca, van SOLO en capacidadDC. Tampoco escribas 'Observa si', que lo pone la pantalla. Arranca directo con el verbo en tercera persona. MAL: 'Pensamiento reflexivo y critico: evalua las acciones'. BIEN: 'evalua las acciones de los personajes con argumentos'. Y tiene que mostrar LA CAPACIDAD EN ACCION, no el contenido: si la capacidad es Resolucion de problemas, no pongas 'clasifica por tamano' (eso es el contenido) sino 'cambia de canasto cuando ve que no va ahi' (ahi se ve que resolvio algo). Es lo que la docente va a MIRAR en los ninos mientras hacen la actividad, no lo que la actividad desarrolla. Empeza con un VERBO en tercera persona del singular y describi una conducta concreta que se pueda ver o escuchar. PROHIBIDO empezar con 'desarrollar', 'fomentar', 'estimular', 'trabajar', 'promover', 'favorecer' o 'lograr': eso son objetivos, no se pueden mirar. MAL: 'desarrollar la conciencia fonologica y la segmentacion intrasilabica'. BIEN: 'separa la palabra en golpes de voz al palmear', 'reconoce dos palabras que terminan igual', 'escribe su nombre con letras que reconoce', 'responde cuando lo nombran', 'pide con palabras lo que quiere', 'espera su turno'",
    "capacidadDC": "el NOMBRE de una de las cinco capacidades seguido de dos puntos y LO QUE ESTA ACTIVIDAD PONE EN JUEGO de ella. Formato exacto: 'Comunicacion: formular preguntas sobre el cuento leido'. Las cinco, tal cual estan escritas: Autonomia para aprender | Comunicacion | Pensamiento reflexivo y critico | Resolucion de problemas | Compromiso y colaboracion. PRIORIZA la que la alfabetizacion pone en juego: casi siempre Comunicacion, y Pensamiento reflexivo y critico cuando se trata de comprender un texto. NO pongas el eje (CF, CT, Oralidad, Escritura) aca: el eje es otra cosa. La capacidad NO decide la actividad: la actividad sale del eje y despues se mira con la capacidad que corresponda",
    "contenidos": "contenidos curriculares especificos del DC CABA 2025",
    "objetivo": "objetivo especifico de la actividad en una oracion",
    "desarrollo": "SOLO LOS PASOS de lo que se hace. Nada de repetir aca la capacidad, el objetivo ni los contenidos: eso ya vive en su renglon. Arranca directo con la primera accion. LA PRUEBA: si manana entra una SUPLENTE que no conoce al grupo, tiene que poder dar la actividad leyendo esto una sola vez. TRES REGLAS: (1) ESCRIBILE A LA DOCENTE, en segunda persona: 'deci', 'pone', 'invitalos', 'preguntales', 'espera'. NUNCA 'la docente dice', 'el docente invita' ni 'quien coordine'. (2) CADA PASO CON EJEMPLO CONCRETO: no 'deci una palabra con un sonido', sino 'deci una palabra que empiece con /m/, por ejemplo mama'. Nombra las palabras y los objetos exactos. (3) Que no quede nada librado a la interpretacion: como se agrupan los chicos, cuanto dura, y que frases decir textualmente",
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
          maxOutputTokens: 6000,
          temperature: 0.85,
        })

        // Parsear JSON
        const texto = result.text.trim()
        const sugerenciasIA = leerJSONAunqueVengaCortado(texto)

        const sugerencias = sugerenciasIA.map((s: { dia: string; eje: string; nivelSecuencia?: string; nombre: string; capacidades: string; contenidos: string; objetivo: string; desarrollo: string; materiales: string }, idx: number) => {
          // El eje y el paso los impone el sistema: si la IA devolvio otra cosa, se ignora.
          const decidido = pasosDeLaSemana[idx]
          const ejeFinal = decidido ? (decidido.eje === "EA" ? "Escritura" : decidido.eje) : s.eje
          // En MATERNAL se planifica por AREAS DEL DISENO, no por ejes de
          // alfabetizacion. El eje es una clave interna para elegir el paso;
          // lo que ve la maestra es el area: "Exploracion del ambiente",
          // "Desarrollo corporal", "Comunicacion y expresion".
          const claveEje = String(decidido?.eje || "")
          const nombreEjeFinal = esMaternal
            ? (AREA_DEL_EJE_NOMBRE[claveEje] || NOMBRE_EJE_LARGO[claveEje] || ejeFinal)
            : (NOMBRE_EJE_LARGO[claveEje] || ejeFinal)
          const pasoNombre = decidido ? decidido.paso.titulo : (s.nivelSecuencia || "")
          // Se separan aca: la IA los mezcla seguido
          const limpio = separarCapacidadYObservaSi(s.capacidades, (s as any).capacidadDC)

          // ── RED DE SEGURIDAD PARA MATERNAL ──────────────────────────────
          // El modelo tiene la edad y el marco en el prompt, pero asocia igual:
          // ve "verduleria" y escribe "negociar precios". Como ese campo tiene
          // forma fija, el codigo lo revisa. Si trae vocabulario que no va a
          // esa edad, se reemplaza por el OBJETIVO DEL PASO, que ya esta
          // escrito desde el Diseno. Si no, se deja lo que escribio la IA:
          // asi hay variedad cuando acierta y un piso que no se rompe.
          if (esMaternal && decidido?.paso) {
            const capNombre = String(limpio.capacidadDC || "").split(":")[0].trim()
            let loQuePoneEnJuego = String(limpio.capacidadDC || "").split(":").slice(1).join(":").trim()

            if (!loQuePoneEnJuego || tieneVocabularioFueraDeEdad(loQuePoneEnJuego, nivel)) {
              loQuePoneEnJuego = String(decidido.paso.objetivo || "").trim()
            }
            if (capNombre && loQuePoneEnJuego) {
              limpio.capacidadDC = `${capNombre}: ${ajustarVocabularioDeEdad(loQuePoneEnJuego, nivel)}`
            }

            if (tieneVocabularioFueraDeEdad(limpio.capacidades, nivel)) {
              limpio.capacidades = ajustarVocabularioDeEdad(limpio.capacidades, nivel)
            }
          }
          return {
            dia: diasArray[idx] || s.dia,
            actividad: {
              nombre: s.nombre,
              capacidades: limpio.capacidades,
              // Capacidad del Diseno Curricular de CABA (cinco posibles).
              // Permite agrupar despues las actividades por capacidad.
              capacidadDC: limpio.capacidadDC,
              // Clave de la capacidad en maternal (COM/AUT/RES/COL/REF):
              // la usa la tarjeta del cronograma para su color
              capacidadKey: decidido && esMaternal ? decidido.eje : "",
              contenidos: pasoNombre ? `${s.contenidos} · Estamos trabajando: ${pasoNombre}` : s.contenidos,
              objetivo: "",   // ya vive en la capacidad: no se repite
              desarrollo: s.desarrollo,
              materiales: s.materiales,
              eje: ejeFinal,
              // El nombre legible del eje: en maternal "eje" es una clave como
              // "JUE" o "COR", que no le dice nada a la maestra.
              ejeNombre: nombreEjeFinal || ejeFinal || "",
              paso: pasoNombre,
              pasoNumero: decidido ? decidido.indice + 1 : null,
              // En maternal la actividad NO es de alfabetizacion: trabaja la
              // capacidad que le toca. Solo en jardin 4/5 va tildada.
              alfabetizacion: nivel === "4" || nivel === "5",
              origen: "alba" as const,
            }
          }
        })

        const conDocenteIA = await incorporarActividadDocente(sugerencias, sala)
        return NextResponse.json({ ok: true, sugerencias: conDocenteIA })
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
        const conDocenteFB = await incorporarActividadDocente(FALLBACK, sala)
        return NextResponse.json({ ok: true, sugerencias: conDocenteFB })
      }
    }

    
    return NextResponse.json({ ok: false, error: "Accion no reconocida" }, { status: 400 })
  } catch (err) {
    console.error("Error en POST /api/brain:", err)
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
  }
}

// ── Repertorio de la docente ────────────────────────────────────────────────
// Una vez por semana, ALBA reemplaza UNA de las 3 sugerencias por una actividad
// del repertorio propio de la maestra, elegida al azar entre las que todavia no
// uso. Al azar a proposito: sin evidencia todavia, ninguna merece prioridad.
// Si la sala no cargo nada, no pasa nada y siguen las 3 de ALBA.
// La actividad NO se borra: se marca como "usada" para que conserve su historia.
// ── LA RED ────────────────────────────────────────────────────────────────
// Una actividad del repertorio de OTRA sala llega aca solo si se cumplen las
// cuatro condiciones que definio Meri:
//   1. Le fue bien donde se dio (la docente la califico excelente o buena)
//   2. La sala que recibe necesita ese eje (es uno de los ejes de la semana)
//   3. La sala que recibe todavia no la dio
//   4. El aula de origen viene registrando con consistencia
// No se rankea por popularidad: se rutea por necesidad.
async function buscarEnLaRed(supabase: any, sala: string, sugerencias: any[]): Promise<any | null> {
  try {
    const REGISTROS_MINIMOS_ORIGEN = 3

    // Ejes que la sala necesita esta semana, en el vocabulario de la tabla
    const ejesNecesarios = new Set<string>(
      sugerencias.map((s): string => {
        const e = String(s?.actividad?.eje || "")
        if (e === "Escritura" || e === "EA" || e === "E") return "E"
        if (e === "CT") return "CT"
        if (e === "O" || e === "Oralidad") return "O"
        return "CF"
      })
    )

    // Candidatas: repertorio de las demas salas, en los ejes que hacen falta
    const { data: deOtrasSalas } = await supabase
      .from("actividades_docentes")
      .select("*")
      .neq("sala", sala)
    if (!deOtrasSalas || deOtrasSalas.length === 0) return null

    // Cierres de toda la red: solo para saber que salas registran con constancia
    const { data: cierres } = await supabase
      .from("registro_cierre")
      .select("sala")
      .limit(1000)

    const registrosPorSala: Record<string, number> = {}
    ;(cierres || []).forEach((c: any) => {
      if (c.sala) registrosPorSala[c.sala] = (registrosPorSala[c.sala] || 0) + 1
    })

    // ── QUE HABILITA A UNA ACTIVIDAD A VIAJAR ─────────────────────────────
    // UN SOLO criterio: EVIDENCIA DE QUE FUNCIONO PARA LA ALFABETIZACION.
    // No alcanza con que la maestra la haya calificado bien: eso dice que le
    // gusto, no que los chicos aprendieron. Lo que habilita es que en el EJE
    // de esa actividad —CF, CT, O o E— los chicos hayan dado resultado.
    const UMBRAL_VERDE = 70   // porcentaje de chicos en verde en ese eje

    const { data: segRed } = await supabase
      .from("seguimiento")
      .select("actividad, eje, estado, sala, fecha")
      .limit(4000)

    // Por actividad Y eje, separando CADA GRUPO en el que se dio: asi se puede
    // contar cuantas veces funciono, no solo un promedio de todo junto.
    type Conteo = { porGrupo: Record<string, { total: number; verdes: number }> }
    const porActividad: Record<string, Conteo> = {}
    ;(segRed || []).forEach((r: any) => {
      const nombre = String(r.actividad || "").trim().toLowerCase()
      const eje = String(r.eje || "").trim().toUpperCase()
      if (!nombre || !eje) return
      // Sin eje de alfabetizacion la actividad no viaja: ese es el criterio
      if (!["CF", "CT", "O", "E", "EA"].includes(eje)) return
      const clave = `${nombre}||${eje === "EA" ? "E" : eje}`
      // Un "grupo" es una sala en una fecha: la misma actividad dada dos veces
      // en salas distintas cuenta como dos oportunidades de validarse.
      const grupo = `${String(r.sala || "")}||${String(r.fecha || "").slice(0, 10)}`
      if (!porActividad[clave]) porActividad[clave] = { porGrupo: {} }
      if (!porActividad[clave].porGrupo[grupo]) porActividad[clave].porGrupo[grupo] = { total: 0, verdes: 0 }
      // Los ausentes no cuentan: no dan informacion del aprendizaje
      if (r.estado === "blue") return
      porActividad[clave].porGrupo[grupo].total += 1
      if (r.estado === "green") porActividad[clave].porGrupo[grupo].verdes += 1
    })

    // Las que superaron el umbral en su eje. Se guarda "nombre||eje" para que
    // una actividad solo viaje en el eje donde efectivamente funciono.
    //
    // CURACION ACUMULATIVA: no basta con un buen resultado. Cada vez que la
    // actividad supera el umbral en un grupo, suma una marca. Con una ya puede
    // viajar —necesita circular para juntar evidencia—, pero ALBA prefiere las
    // que tienen mas, y a las 3 queda VALIDADA por la red. Una actividad que
    // funciono en tres grupos distintos dice algo del metodo; una sola vez
    // puede ser suerte o un grupo que ya venia bien.
    const VECES_PARA_VALIDADA = 3
    const bienEvaluadas = new Set<string>()
    const vecesQueFunciono: Record<string, number> = {}

    Object.entries(porActividad).forEach(([clave, d]) => {
      Object.entries(d.porGrupo).forEach(([, g]) => {
        if (g.total < 5) return   // muy pocos chicos: el dato no dice nada
        if (Math.round((g.verdes / g.total) * 100) >= UMBRAL_VERDE) {
          vecesQueFunciono[clave] = (vecesQueFunciono[clave] || 0) + 1
        }
      })
      if ((vecesQueFunciono[clave] || 0) > 0) bienEvaluadas.add(clave)
    })

    // Lo que esta sala ya trabajo, para no mandarle algo repetido
    const { data: alumnosSala } = await supabase.from("alumnos").select("id").eq("sala", sala)
    const idsSala = (alumnosSala || []).map((a: any) => a.id)
    const yaDadasAqui = new Set<string>()
    if (idsSala.length > 0) {
      const { data: regs } = await supabase
        .from("seguimiento").select("actividad").in("alumno_id", idsSala)
      ;(regs || []).forEach((r: any) => {
        if (r.actividad) yaDadasAqui.add(String(r.actividad).trim().toLowerCase())
      })
    }

    // Condicion 0, la que manda sobre todas: la edad tiene que coincidir.
    // Una actividad de sala de 5 en una sala de 4 no sirve y frustra al grupo.
    // Si no hay nada de la misma edad, la red no propone y quedan las de ALBA.
    const nivelRecibe = nivelDeSala(sala)

    const candidatas = deOtrasSalas.filter((a: any) => {
      const nombre = String(a.nombre || "").trim().toLowerCase()
      if (!nombre) return false
      if (nivelDeSala(String(a.sala || "")) !== nivelRecibe) return false  // 0. mismo nivel
      const ejeAct = String(a.eje || "").trim().toUpperCase()
      if (!ejesNecesarios.has(ejeAct)) return false                        // 2
      if (yaDadasAqui.has(nombre)) return false                            // 3
      // 1. EVIDENCIA en el eje: es el unico criterio que la habilita a viajar
      if (!bienEvaluadas.has(`${nombre}||${ejeAct === "EA" ? "E" : ejeAct}`)) return false
      if ((registrosPorSala[a.sala] || 0) < REGISTROS_MINIMOS_ORIGEN) return false  // 4
      return true
    })

    if (candidatas.length > 0) {
      // Prefiere las que funcionaron mas veces: una actividad probada en tres
      // grupos distintos dice mas que una que anduvo bien una sola vez.
      const conVeces = candidatas.map((a: any) => {
        const ejeA = String(a.eje || "").trim().toUpperCase()
        const clave = `${String(a.nombre).trim().toLowerCase()}||${ejeA === "EA" ? "E" : ejeA}`
        return { ...a, veces: vecesQueFunciono[clave] || 1 }
      })
      const maximo = Math.max(...conVeces.map((a: any) => a.veces))
      const mejores = conVeces.filter((a: any) => a.veces === maximo)
      const elegida = mejores[Math.floor(Math.random() * mejores.length)]
      return { ...elegida, validada: elegida.veces >= VECES_PARA_VALIDADA }
    }

    // ── Segundo pozo: el HISTORIAL de la red ──────────────────────────────
    // El cronograma guarda la actividad completa (nombre, objetivo, desarrollo,
    // materiales), asi que una actividad de junio que funciono es tan
    // transplantable como una del repertorio. Lo que viaja no es el texto:
    // es la evidencia de que sirvio con un grupo real.
    const { data: cronoRed } = await supabase
      .from("cronograma_jardin")
      .select("sala, actividades")
      .neq("sala", sala)
      .order("fecha", { ascending: false })
      .limit(300)

    const normEje = (v: string): string => {
      const e = String(v || "").trim().toUpperCase()
      if (e === "CT") return "CT"
      if (e === "O" || e === "ORALIDAD") return "O"
      if (e === "E" || e === "EA" || e === "LE" || e === "ESCRITURA") return "E"
      return "CF"
    }

    const delHistorial: any[] = []
    const vistos = new Set<string>()

    ;(cronoRed || []).forEach((fila: any) => {
      const acts = Array.isArray(fila.actividades) ? fila.actividades : []
      acts.forEach((a: any) => {
        if (!a || !a.nombre) return
        const nombre = String(a.nombre).trim()
        const clave = nombre.toLowerCase()
        if (vistos.has(clave)) return

        // Solo sirve si quedo guardada COMPLETA: sin desarrollo no se puede dar en otra sala
        const desarrollo = String(a.desarrollo || a.descripcion || "").trim()
        if (desarrollo.length < 30) return

        if (nivelDeSala(String(fila.sala || "")) !== nivelRecibe) return  // 0. mismo nivel
        const eje = normEje(a.eje)
        if (!ejesNecesarios.has(eje)) return          // 2. la sala lo necesita
        if (yaDadasAqui.has(clave)) return            // 3. no la dio todavia
        // 1. EVIDENCIA en el eje, igual que en el repertorio
        if (!bienEvaluadas.has(`${clave}||${eje}`)) return
        if ((registrosPorSala[fila.sala] || 0) < REGISTROS_MINIMOS_ORIGEN) return  // 4. origen confiable

        vistos.add(clave)
        delHistorial.push({
          id: null,
          sala: fila.sala,
          nombre,
          eje,
          capacidad: String(a.capacidades || "").trim(),
          objetivo: String(a.objetivo || "").trim(),
          desarrollo,
          materiales: Array.isArray(a.materiales) ? a.materiales.join(", ") : String(a.materiales || ""),
          nivelSala: nivelDeSala(String(fila.sala || "")),
        })
      })
    })

    if (delHistorial.length === 0) return null
    const histConVeces = delHistorial.map((a: any) => ({
      ...a,
      veces: vecesQueFunciono[`${String(a.nombre).trim().toLowerCase()}||${a.eje}`] || 1,
    }))
    const maxHist = Math.max(...histConVeces.map((a: any) => a.veces))
    const mejoresHist = histConVeces.filter((a: any) => a.veces === maxHist)
    const elegidaHist = mejoresHist[Math.floor(Math.random() * mejoresHist.length)]
    return { ...elegidaHist, validada: elegidaHist.veces >= VECES_PARA_VALIDADA }
  } catch (e) {
    console.error("[v0] Error buscando en la red:", e)
    return null
  }
}

// Repara un JSON que llego cortado. Pasa cuando el modelo llega al tope de
// tokens y la respuesta termina a la mitad: en vez de perder TODO y caer al
// fallback, se rescata lo que si esta completo.
function leerJSONAunqueVengaCortado(texto: string): any {
  const t = (texto || "").trim()
  const abre = t.indexOf("[") >= 0 ? "[" : "{"
  const cierra = abre === "[" ? "]" : "}"
  const desde = t.indexOf(abre)
  if (desde < 0) throw new Error("La respuesta no trae JSON")

  // Primero, lo obvio: si esta completo, se lee y listo
  const hastaUltimo = t.lastIndexOf(cierra)
  if (hastaUltimo > desde) {
    try { return JSON.parse(t.slice(desde, hastaUltimo + 1)) } catch {}
  }

  // Vino cortado: se cierra lo que quedo abierto, contando solo fuera de comillas
  let dentroDeTexto = false
  let escapado = false
  const pila: string[] = []
  let ultimoCierreCompleto = -1

  for (let i = desde; i < t.length; i++) {
    const c = t[i]
    if (escapado) { escapado = false; continue }
    if (c === "\\") { escapado = true; continue }
    if (c === '"') { dentroDeTexto = !dentroDeTexto; continue }
    if (dentroDeTexto) continue
    if (c === "{" || c === "[") pila.push(c === "{" ? "}" : "]")
    else if (c === "}" || c === "]") {
      pila.pop()
      if (pila.length === 1 && abre === "[") ultimoCierreCompleto = i
    }
  }

  // Si es una lista, se corta despues del ultimo elemento entero
  if (abre === "[" && ultimoCierreCompleto > 0) {
    try { return JSON.parse(t.slice(desde, ultimoCierreCompleto + 1) + "]") } catch {}
  }

  // Ultimo intento: cerrar todo lo que quedo abierto
  let recorte = t.slice(desde)
  if (dentroDeTexto) recorte += '"'
  while (pila.length > 0) recorte += pila.pop()
  return JSON.parse(recorte)
}

// ── LA IMPRONTA DE LAS DOCENTES ───────────────────────────────────────────
// Distinto del muestrario, y por eso son dos cosas separadas:
//
//   El MUESTRARIO junta actividades VALIDADAS POR EVIDENCIA —70% de verdes en
//   tres grupos— y sirve para saber QUE FUNCIONA. Es un estandar alto y tarda
//   meses en poblarse.
//
//   La IMPRONTA junta lo que las maestras ESCRIBEN, sin esperar evidencia, y
//   sirve para otra cosa: para que ALBA aprenda COMO SE ESCRIBE EN ESTA
//   ESCUELA. El tono, el nivel de detalle, que materiales se usan de verdad.
//
// Se toman solo las BIEN ESCRITAS: si una maestra escribe escueto, ALBA
// aprenderia a escribir escueto. Y se filtran por NIVEL: lo que escribe una
// maestra de PINITOS (2 anos) nunca influye en una sala de 5.
const LARGO_MINIMO_DESARROLLO = 120
const DIAS_ENTRE_RECOPILACIONES = 30

async function traerImpronta(nivel: string): Promise<any[]> {
  try {
    const supabase = getSupabase()

    const { data: guardado } = await supabase
      .from("impronta_docente")
      .select("*")
      .eq("nivel", nivel)
      .order("calculado_at", { ascending: false })
      .limit(30)

    const ultimo = guardado?.[0]?.calculado_at
    const dias = ultimo ? (Date.now() - new Date(ultimo).getTime()) / 86400000 : Infinity

    if (dias < DIAS_ENTRE_RECOPILACIONES && guardado && guardado.length > 0) {
      return guardado
    }

    await recopilarImpronta(nivel)

    const { data: fresco } = await supabase
      .from("impronta_docente")
      .select("*")
      .eq("nivel", nivel)
      .limit(30)

    return fresco || []
  } catch (e) {
    // Nunca puede romper una sugerencia
    console.error("[v0] Error trayendo la impronta docente:", e)
    return []
  }
}

async function recopilarImpronta(nivel: string): Promise<void> {
  try {
    const supabase = getSupabase()
    const esMat = nivel === "2" || nivel === "3"
    const tabla = esMat ? "cronograma_maternal" : "cronograma_jardin"

    const { data: crono } = await supabase
      .from(tabla)
      .select("sala, actividades")
      .order("fecha", { ascending: false })
      .limit(400)

    const filas: any[] = []
    const vistos = new Set<string>()

    ;(crono || []).forEach((fila: any) => {
      if (nivelDeSala(String(fila.sala || "")) !== nivel) return
      const acts = Array.isArray(fila.actividades) ? fila.actividades : []
      acts.forEach((a: any) => {
        // Solo lo que escribio la DOCENTE, no lo que propuso ALBA
        if (a?.origen === "alba") return

        const nombre = String(a?.nombre || "").trim()
        const desarrollo = String(a?.desarrollo || a?.descripcion || "").trim()
        if (!nombre || desarrollo.length < LARGO_MINIMO_DESARROLLO) return

        const clave = nombre.toLowerCase()
        if (vistos.has(clave)) return
        vistos.add(clave)

        filas.push({
          nivel,
          area: String(a?.ejeNombre || a?.eje || "").trim() || null,
          nombre,
          desarrollo,
          materiales: Array.isArray(a?.materiales) ? a.materiales.join(", ") : String(a?.materiales || "").trim() || null,
          capacidad_dc: String(a?.capacidadDC || "").trim() || null,
          sala_origen: fila.sala,
        })
      })
    })

    if (filas.length === 0) return

    await supabase.from("impronta_docente").delete().eq("nivel", nivel)
    await supabase.from("impronta_docente").insert(filas.slice(0, 30))
    console.log(`[v0] impronta recopilada para nivel ${nivel}: ${filas.length} actividades de docentes`)
  } catch (e) {
    console.error("[v0] Error recopilando la impronta:", e)
  }
}

// Arma el bloque para el prompt. Si no hay material, devuelve vacio y ALBA
// escribe exactamente como hoy.
function bloqueImpronta(impronta: any[]): string {
  if (!impronta || impronta.length < 2) return ""

  // Al azar, para que no salgan siempre las mismas
  const mezcladas = [...impronta]
  for (let i = mezcladas.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[mezcladas[i], mezcladas[j]] = [mezcladas[j], mezcladas[i]]
  }
  const elegidas = mezcladas.slice(0, 3)

  return `
COMO ESCRIBEN LAS MAESTRAS DE ESTA ESCUELA. Estas actividades las escribieron
ellas para esta misma edad. Miralas para tomar SU FORMA de escribir: el tono,
cuanto detalle dan, que materiales usan de verdad, como le hablan al grupo.

NO copies el tema ni la propuesta: son de otro contenido. Lo que tomas es la
manera de escribir, para que tu actividad se parezca a las de la escuela y no
a un texto generico.

${elegidas.map((m: any, i: number) => `Ejemplo ${i + 1} — "${m.nombre}"
${m.desarrollo}${m.materiales ? `\nMateriales: ${m.materiales}` : ""}`).join("\n\n")}
`
}

// ── EL MUESTRARIO ─────────────────────────────────────────────────────────
// Actividades que la red YA VALIDO: funcionaron en 3 grupos distintos.
// No se usan para copiar ni para mandar a otra sala: se le muestran a ALBA
// como EJEMPLO DE COMO ESCRIBE UNA MAESTRA de esa edad, para que aprenda el
// oficio en vez de seguir reglas. Un buen ejemplo ensena mas que diez
// instrucciones, y permite sacar reglas del prompt en vez de sumarlas.
//
// Se recalcula cada 30 DIAS, no en cada sugerencia: es una consulta pesada
// cuyo resultado cambia lento. Un mes es el ciclo natural de la planificacion
// escolar y filtra solo el ruido de una semana floja.
const DIAS_ENTRE_CALCULOS = 30
const EJEMPLOS_MINIMOS = 3

async function traerMuestrario(nivel: string, ejeQueVaAEscribir: string): Promise<any[]> {
  try {
    const supabase = getSupabase()

    // Que tan viejo es lo guardado
    const { data: guardado } = await supabase
      .from("muestrario_alba")
      .select("*")
      .eq("nivel", nivel)
      .order("calculado_at", { ascending: false })
      .limit(50)

    const ultimo = guardado?.[0]?.calculado_at
    const diasDesde = ultimo
      ? (Date.now() - new Date(ultimo).getTime()) / 86400000
      : Infinity

    if (diasDesde < DIAS_ENTRE_CALCULOS && guardado && guardado.length > 0) {
      return guardado
    }

    // Toca recalcular: se rehace el muestrario de este nivel
    await recalcularMuestrario(nivel)

    const { data: fresco } = await supabase
      .from("muestrario_alba")
      .select("*")
      .eq("nivel", nivel)
      .order("veces_funciono", { ascending: false })
      .limit(50)

    return fresco || []
  } catch (e) {
    // Si algo falla, ALBA escribe como siempre: el muestrario nunca puede
    // romper una sugerencia.
    console.error("[v0] Error trayendo el muestrario:", e)
    return []
  }
}

async function recalcularMuestrario(nivel: string): Promise<void> {
  try {
    const supabase = getSupabase()

    const { data: seg } = await supabase
      .from("seguimiento")
      .select("actividad, eje, estado, sala, fecha")
      .limit(4000)

    // Por actividad y eje, separando cada grupo: cuantas veces funciono
    const porActividad: Record<string, Record<string, { total: number; verdes: number }>> = {}
    ;(seg || []).forEach((r: any) => {
      const nombre = String(r.actividad || "").trim().toLowerCase()
      const eje = String(r.eje || "").trim().toUpperCase()
      if (!nombre || !eje) return
      if (!["CF", "CT", "O", "E", "EA"].includes(eje)) return
      if (nivelDeSala(String(r.sala || "")) !== nivel) return
      const clave = `${nombre}||${eje === "EA" ? "E" : eje}`
      const grupo = `${String(r.sala || "")}||${String(r.fecha || "").slice(0, 10)}`
      if (!porActividad[clave]) porActividad[clave] = {}
      if (!porActividad[clave][grupo]) porActividad[clave][grupo] = { total: 0, verdes: 0 }
      if (r.estado === "blue") return
      porActividad[clave][grupo].total += 1
      if (r.estado === "green") porActividad[clave][grupo].verdes += 1
    })

    // Las que superaron el umbral en 3 grupos distintos
    const validadas: { clave: string; veces: number }[] = []
    Object.entries(porActividad).forEach(([clave, grupos]) => {
      let veces = 0
      Object.values(grupos).forEach((g) => {
        if (g.total >= 5 && Math.round((g.verdes / g.total) * 100) >= 70) veces += 1
      })
      if (veces >= 3) validadas.push({ clave, veces })
    })

    if (validadas.length === 0) return

    // El texto completo sale del historial del cronograma
    const { data: crono } = await supabase
      .from("cronograma_jardin")
      .select("sala, actividades")
      .limit(400)

    const filas: any[] = []
    const vistos = new Set<string>()
    ;(crono || []).forEach((fila: any) => {
      if (nivelDeSala(String(fila.sala || "")) !== nivel) return
      const acts = Array.isArray(fila.actividades) ? fila.actividades : []
      acts.forEach((a: any) => {
        const nombre = String(a?.nombre || "").trim()
        if (!nombre) return
        const eje = String(a?.eje || "").trim().toUpperCase()
        const clave = `${nombre.toLowerCase()}||${eje === "EA" ? "E" : eje}`
        if (vistos.has(clave)) return
        const v = validadas.find((x) => x.clave === clave)
        if (!v) return
        const desarrollo = String(a?.desarrollo || "").trim()
        if (desarrollo.length < 40) return
        vistos.add(clave)
        filas.push({
          nivel,
          eje: eje === "EA" ? "E" : eje,
          nombre,
          desarrollo,
          materiales: Array.isArray(a?.materiales) ? a.materiales.join(", ") : String(a?.materiales || ""),
          veces_funciono: v.veces,
        })
      })
    })

    if (filas.length === 0) return

    // Se reemplaza el muestrario de este nivel
    await supabase.from("muestrario_alba").delete().eq("nivel", nivel)
    await supabase.from("muestrario_alba").insert(filas)
    console.log(`[v0] muestrario recalculado para nivel ${nivel}: ${filas.length} actividades validadas`)
  } catch (e) {
    console.error("[v0] Error recalculando el muestrario:", e)
  }
}

// Arma el bloque de ejemplos para el prompt. Si no hay material suficiente
// devuelve vacio y ALBA escribe exactamente como hoy.
function bloqueEjemplos(muestrario: any[], ejeQueVaAEscribir: string): string {
  if (!muestrario || muestrario.length < EJEMPLOS_MINIMOS) return ""

  // A proposito se prefieren ejemplos de OTRO eje: si le muestro una del
  // mismo eje y tema, copia el tema en vez de aprender el estilo.
  const otros = muestrario.filter((m) => m.eje !== ejeQueVaAEscribir)
  const elegidos = (otros.length >= EJEMPLOS_MINIMOS ? otros : muestrario).slice(0, 3)

  return `
COMO ESCRIBEN LAS MAESTRAS DE ESTA EDAD. Estas actividades fueron dadas en
aulas reales y funcionaron con al menos tres grupos distintos. Miralas para
aprender EL OFICIO: como se plantea una consigna, cuanto se explica, que
materiales se usan de verdad, como se acompana a los chicos.

NO copies el tema ni la estructura de estas: son de otro contenido. Lo que
tenes que tomar es la FORMA de escribir una propuesta que de verdad se puede
dar en una sala.

${elegidos.map((m: any, i: number) => `Ejemplo ${i + 1} — "${m.nombre}"
${m.desarrollo}
Materiales: ${m.materiales || "los de la sala"}`).join("\n\n")}
`
}

// Las cinco capacidades del Diseno, para reconocerlas cuando la IA las mete
// donde no van.
const NOMBRES_CAPACIDAD = [
  "Autonomia para aprender", "Autonomía para aprender",
  "Comunicacion", "Comunicación",
  "Pensamiento reflexivo y critico", "Pensamiento reflexivo y crítico",
  "Resolucion de problemas", "Resolución de problemas",
  "Compromiso y colaboracion", "Compromiso y colaboración",
]

// El modelo confunde seguido dos campos parecidos: mete "Comunicacion: expresa
// lo que siente" dentro del "Observa si" y deja la capacidad vacia. El prompt
// se lo prohibe pero igual pasa, asi que el codigo lo separa: es determinista y
// no depende de que el modelo obedezca.
// Palabras que NO corresponden a maternal. El modelo las asocia solo: ve
// "verduleria" y completa con "negociar precios", ve "contar" y completa con
// "sumar". Tiene el marco y la edad en el prompt, pero asociar es lo que hace.
// Por eso el corte va en codigo: es determinista y no se le escapa.
//
// OJO: a los 2 y 3 anos SI se trabaja la cantidad, pero con otras palabras y
// sobre objetos reales: AGREGAR y QUITAR, poner mas, sacar, ver que quedan
// menos. Lo que no va es el vocabulario del calculo.
const PALABRAS_FUERA_DE_EDAD: { palabra: RegExp; reemplazo?: string }[] = [
  { palabra: /\bsumar\b/gi, reemplazo: "agregar" },
  { palabra: /\bsuma\b/gi, reemplazo: "agregado" },
  { palabra: /\brestar\b/gi, reemplazo: "quitar" },
  { palabra: /\bresta\b/gi, reemplazo: "quitado" },
  { palabra: /\bnegociar\b/gi },
  { palabra: /\bregatear\b/gi },
  { palabra: /\bprecios?\b/gi },
  { palabra: /\bdinero\b/gi },
  { palabra: /\bleer\b/gi },
  { palabra: /\bescribir\b/gi },
  { palabra: /\bdeletrear\b/gi },
  { palabra: /\bsilabas?\b/gi },
  { palabra: /\bfonemas?\b/gi },
  { palabra: /\brimas?\b/gi },
]

// Devuelve true si el texto trae algo que no corresponde a esa edad.
function tieneVocabularioFueraDeEdad(texto: string, nivel: string): boolean {
  if (nivel !== "2" && nivel !== "3") return false
  return PALABRAS_FUERA_DE_EDAD.some(({ palabra }) => {
    palabra.lastIndex = 0
    return palabra.test(String(texto || ""))
  })
}

// Cambia el vocabulario del calculo por el de la accion, que es como se
// trabaja la cantidad a esta edad.
function ajustarVocabularioDeEdad(texto: string, nivel: string): string {
  if (nivel !== "2" && nivel !== "3") return texto
  let t = String(texto || "")
  PALABRAS_FUERA_DE_EDAD.forEach(({ palabra, reemplazo }) => {
    if (reemplazo) {
      palabra.lastIndex = 0
      t = t.replace(palabra, reemplazo)
    }
  })
  return t
}

function separarCapacidadYObservaSi(capacidades: string, capacidadDC: string): { capacidades: string; capacidadDC: string } {
  let obs = String(capacidades || "").trim()
  let cap = String(capacidadDC || "").trim()

  // "Comunicacion: expresa lo que siente" dentro del Observa si
  for (const nombre of NOMBRES_CAPACIDAD) {
    const prefijo = nombre + ":"
    if (obs.toLowerCase().startsWith(prefijo.toLowerCase())) {
      const resto = obs.slice(prefijo.length).trim()
      if (!cap) cap = `${nombre}: ${resto}`
      obs = resto
      break
    }
  }

  // Al reves: la accion observable quedo en el campo de la capacidad
  if (cap && !cap.includes(":")) {
    const esSoloNombre = NOMBRES_CAPACIDAD.some((n) => n.toLowerCase() === cap.toLowerCase())
    if (!esSoloNombre && !obs) {
      obs = cap
      cap = ""
    }
  }

  // El Observa si nunca lleva esas palabras adentro
  obs = obs.replace(/^observ[aá]\s+si:?\s*/i, "").trim()
  // Ni termina en punto: es una accion, no una oracion
  obs = obs.replace(/\.$/, "")

  return { capacidades: obs, capacidadDC: cap }
}

async function incorporarActividadDocente(sugerencias: any[], sala: string): Promise<any[]> {
  // Declarado aca arriba a proposito: se usa en el bloque de las marcadas,
  // que corre antes. Estaba mas abajo y rompia con "Cannot access before
  // initialization" — el servidor no perdona lo que el navegador si.
  const NOMBRE_EJE: Record<string, string> = {
    CF: "CF", CT: "CT", O: "O", E: "Escritura",
  }
  try {
    if (!sala || !Array.isArray(sugerencias) || sugerencias.length === 0) return sugerencias

    const supabase = getSupabase()
    const { data: propias, error } = await supabase
      .from("actividades_docentes")
      .select("*")
      .eq("sala", sala)
      .eq("estado", "propia")

    if (error) {
      console.error("[v0] Error leyendo repertorio docente:", error.message, "| sala:", sala)
      return sugerencias
    }

    // ── LAS QUE LA MAESTRA MARCO PARA ESTA SEMANA ────────────────────────
    // Si marco varias, ALBA usa TODAS: ella sabe mejor que ALBA que le viene
    // bien esta semana, y si armo una secuencia tiene sentido que la de junta.
    // Van tal cual las escribio: son propias, no se reformulan.
    const marcadas = (propias || []).filter((a: any) => a.elegida === true)
    console.log(`[v0] repertorio de "${sala}": ${(propias || []).length} propias, ${marcadas.length} marcadas para esta semana`)

    if (marcadas.length > 0) {
      const copiaM = [...sugerencias]
      const usados = new Set<number>()

      for (const m of marcadas.slice(0, sugerencias.length)) {
        // En maternal el "eje" ES EL AREA del Diseno, con su nombre completo.
        // Las actividades guardadas antes traen claves viejas de capacidad
        // (COM, AUT, RES...): se traducen para que se vean bien igual.
        const CLAVE_VIEJA_A_AREA: Record<string, string> = {
          COM: "Comunicacion y expresion", AUT: "Desarrollo personal y social",
          RES: "Exploracion del ambiente", COL: "Desarrollo personal y social",
          REF: "Exploracion del ambiente",
          USO: "Comunicacion y expresion", ORA: "Comunicacion y expresion",
          VOC: "Comunicacion y expresion", ESC: "Comunicacion y expresion",
          JUE: "Desarrollo del juego", COR: "Desarrollo corporal",
          AMB: "Exploracion del ambiente", PER: "Desarrollo personal y social",
          COMP: "Lengua", PROD: "Lengua", PREC: "Lengua",
          MAT: "Matematica", IND: "Indagacion del ambiente",
          EFI: "Educacion Fisica", EXP: "Lenguajes expresivos",
        }
        const crudoM = String(m.eje || "")
        const esMatM = nivelDeSala(sala) === "2" || nivelDeSala(sala) === "3"
        const ejeM = esMatM
          ? (crudoM.length > 4 ? crudoM : (CLAVE_VIEJA_A_AREA[crudoM.toUpperCase()] || crudoM))
          : (NOMBRE_EJE[crudoM] || crudoM || "CF")
        // Preferimos el dia cuyo eje coincide; si no, el primero libre
        let i = copiaM.findIndex((s, k) => {
          if (usados.has(k)) return false
          const e = String(s?.actividad?.eje || "")
          return e === ejeM || (e === "EA" && ejeM === "Escritura")
        })
        if (i < 0) i = copiaM.findIndex((_, k) => !usados.has(k))
        if (i < 0) break
        usados.add(i)

        copiaM[i] = {
          ...copiaM[i],
          actividad: {
            nombre: m.nombre || "Actividad de la sala",
            capacidades: m.capacidad || "",
            capacidadDC: m.capacidad_dc || "",
            contenidos: m.contenidos || "",
            desarrollo: m.desarrollo || "",
            materiales: m.materiales || "",
            eje: ejeM,
            // El nombre legible: en maternal es el area del Diseno
            ejeNombre: ejeM,
            // En maternal la alfabetizacion NO es el marco: lo que ordena son
            // las areas y las capacidades. Se trabaja la lengua cuando toca
            // esa area, igual que la matematica cuando toca la suya.
            alfabetizacion: !esMatM,
            origen: "docente",
            origenTexto: "Mi actividad",
            actividadDocenteId: m.id,
          },
        }

        // Se marca usada y se le saca la estrella: ya se uso esta semana
        await supabase
          .from("actividades_docentes")
          .update({ estado: "usada", elegida: false })
          .eq("id", m.id)
      }

      return copiaM
    }

    // Orden: primero las que nunca se usaron, tal cual las escribio la maestra.
    // Si ya se usaron todas, vuelven — pero REFORMULADAS: misma estructura,
    // otros materiales, otro cuento. Asi la version original nunca se pierde
    // y la repeticion no aburre.
    let elegida: any = null
    let vieneDeLaRed = false
    let esVariante = false

    if (propias && propias.length > 0) {
      elegida = propias[Math.floor(Math.random() * propias.length)]
    } else {
      // Ya usadas: solo las que anduvieron bien vuelven a proponerse
      const { data: usadas } = await supabase
        .from("actividades_docentes")
        .select("*")
        .eq("sala", sala)
        .neq("estado", "propia")

      if (usadas && usadas.length > 0) {
        const { data: cierresSala } = await supabase
          .from("registro_cierre")
          .select("actividad_alba, evaluacion_general")
          .eq("sala", sala)
          .limit(400)
        const anduvieronBien = new Set(
          (cierresSala || [])
            .filter((c: any) => c.evaluacion_general === "excelente" || c.evaluacion_general === "buena")
            .map((c: any) => String(c.actividad_alba || "").trim().toLowerCase())
        )
        const candidatas = usadas.filter((u: any) =>
          anduvieronBien.has(String(u.nombre || "").trim().toLowerCase())
        )
        const pool = candidatas.length > 0 ? candidatas : usadas
        elegida = pool[Math.floor(Math.random() * pool.length)]
        esVariante = !!elegida
      }

      if (!elegida) {
        elegida = await buscarEnLaRed(supabase, sala, sugerencias)
        vieneDeLaRed = !!elegida
        esVariante = !!elegida   // las de la red tambien se reformulan
      }
    }

    if (!elegida) return sugerencias

    // ── REFORMULACION ────────────────────────────────────────────────────
    // Mantiene la estructura de la actividad y cambia materiales, cuento o
    // formato. La original queda intacta en la tabla.
    let nombreFinal = elegida.nombre || "Actividad de la sala"
    let desarrolloFinal = elegida.desarrollo || ""
    let materialesFinal = elegida.materiales || ""
    let capacidadesFinal = elegida.capacidad || ""
    let capacidadDCFinal = elegida.capacidad_dc || ""
    // Arranca VACIO a proposito: si la IA no lo reescribe, es preferible que
    // no aparezca antes que mostrar los contenidos de la actividad original.
    let contenidosFinal = ""
    let deQueSeTrata = ""
    // Si la IA no logra reformular, la actividad queda igual a la original:
    // en ese caso NO se la anuncia como variante ni se le vacian los
    // contenidos, para que no quede una mezcla incoherente.
    let seReformulo = false

    if (esVariante) {
      try {
        const r = await generateText({
          model: "openai/gpt-4o-mini",
          maxOutputTokens: 1600,
          temperature: 0.9,
          prompt: `Sos ALBA, asistente pedagogico de nivel inicial.

Esta actividad ya se dio en la sala y funciono. Escribi una VARIANTE: la misma
estructura y el mismo objetivo, pero con OTROS materiales, otro cuento u otro
formato. No la mejores ni la cambies de fondo: es la misma propuesta con ropa nueva.

Actividad original:
- Nombre: "${elegida.nombre || ""}"
- Que se hace: ${elegida.desarrollo || ""}
- Materiales: ${elegida.materiales || ""}
${elegida.capacidad ? `- Se observa: ${elegida.capacidad}` : ""}

Escribile A LA DOCENTE en segunda persona ("pone", "invitalos", "preguntales").
Si entra una suplente que no conoce al grupo, tiene que poder darla leyendola una vez.

Respondé SOLO con este JSON, sin backticks:
{
  "nombre": "titulo nuevo, corto",
  "deQueSeTrata": "EL CONTENIDO PEDAGOGICO que comparten la original y la variante: lo que NO cambia entre las dos. En pocas palabras y empezando con un verbo en infinitivo. Ej: 'reconstruir oralmente la secuencia de un cuento', 'escribir el nombre propio con un modelo a la vista', 'reconocer palabras que riman'. NO describas el tema de ninguna de las dos: ni el de la original (San Martin, las plantas) ni el de la variante (los animales). Solo lo pedagogico, que es lo unico que se mantiene",
  "capacidades": "la accion observable REESCRITA para esta variante, sin arrastrar el tema de la original. Empeza directo con el verbo, sin las palabras 'Observa si'",
  "capacidadDC": "el nombre de una de las cinco capacidades del Diseno seguido de dos puntos y lo que ESTA variante pone en juego. Formato: 'Comunicacion: escribir frases sobre lo que observaron'. Las cinco: Autonomia para aprender | Comunicacion | Pensamiento reflexivo y critico | Resolucion de problemas | Compromiso y colaboracion",
  "contenidos": "los contenidos de ESTA variante, en 1 o 2 lineas. NO copies los de la original: si la original era de San Martin y la variante es de animales, los contenidos son de la variante",
  "desarrollo": "pasos concretos",
  "materiales": "lista breve"
}`,
        })
        const t = r.text.trim()
        const v = leerJSONAunqueVengaCortado(t)
        if (v?.nombre || v?.desarrollo) seReformulo = true
        if (v?.nombre) nombreFinal = String(v.nombre).trim()
        if (v?.desarrollo) desarrolloFinal = String(v.desarrollo).trim()
        if (v?.materiales) materialesFinal = String(v.materiales).trim()
        if (v?.deQueSeTrata) deQueSeTrata = String(v.deQueSeTrata).trim()
        if (v?.capacidades) capacidadesFinal = String(v.capacidades).trim()
        if (v?.capacidadDC) capacidadDCFinal = String(v.capacidadDC).trim()
        if (v?.contenidos) contenidosFinal = String(v.contenidos).trim()
      } catch (e) {
        console.error("[v0] Error reformulando la actividad, se usa tal cual:", e)
      }
    }

    // Traduccion de vocabulario: la tabla usa E, el cronograma usa "Escritura".
    const ejeCronograma = NOMBRE_EJE[String(elegida.eje || "")] || String(elegida.eje || "CF")

    // Preferimos el dia cuyo eje coincide. Si ninguno coincide, uno al azar.
    let idx = sugerencias.findIndex((s) => {
      const e = String(s?.actividad?.eje || "")
      return e === ejeCronograma || (e === "EA" && ejeCronograma === "Escritura")
    })
    if (idx < 0) idx = Math.floor(Math.random() * sugerencias.length)

    const copia = [...sugerencias]
    copia[idx] = {
      ...copia[idx],
      actividad: {
        nombre: nombreFinal,
        capacidades: capacidadesFinal,
        capacidadDC: capacidadDCFinal,
        contenidos: contenidosFinal || (seReformulo ? "" : elegida.contenidos || ""),
        objetivo: "",   // el objetivo ya vive en la capacidad: no se repite
        desarrollo: desarrolloFinal,
        materiales: materialesFinal,
        eje: ejeCronograma,
        alfabetizacion: true,
        origen: vieneDeLaRed ? "red" : "docente",
        origenTexto: vieneDeLaRed
          ? (elegida.validada
              ? `De la red — validada: funciono en ${elegida.veces} grupos distintos`
              : `De la red — funciono en una sala de ${elegida.nivelSala || nivelDeSala(String(elegida.sala || ""))} anos`)
          : (esVariante && seReformulo)
          ? (deQueSeTrata ? `Variante de tu actividad sobre ${deQueSeTrata}` : "Variante de tu actividad")
          : "Mi actividad",
        alfabetizacionRed: vieneDeLaRed,
        esVariante,
        actividadDocenteId: elegida.id,
      },
    }

    // Solo la primera vez: si ya era una variante, ya estaba marcada
    if (!vieneDeLaRed && !esVariante) {
      // Se desmarca en la misma llamada: ya se uso, no tiene sentido que
      // siga marcada para la semana siguiente.
      await supabase
        .from("actividades_docentes")
        .update({ estado: "usada", elegida: false })
        .eq("id", elegida.id)
    }

    return copia
  } catch (e) {
    console.error("[v0] Error incorporando actividad docente:", e)
    return sugerencias
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
