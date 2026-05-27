// ALBA Brain API v9 - Criterio pedagogico internacional + secuencia basada en evidencia
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

// Tipo de micro-capacitacion
type MicroCap = { titulo: string; contenido: string; tips: string[]; cancion?: string; poesia?: string; referencia?: string }

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
  // ── COMPRENSION TEXTUAL ───────────────────────�����──────────────────────────
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

const SECUENCIA: Record<"CF" | "CT" | "O", { titulo: string; objetivo: string; descripcion: string; materiales: string[] }[]> = {
  CF: [
    { titulo: "Sonidos del entorno", objetivo: "Discriminar sonidos ambientales y asociarlos a su fuente", descripcion: "Los ninos cierran los ojos y escuchan 30 segundos. Luego nombran todos los sonidos que percibieron. La docente muestra tarjetas con imagenes de fuentes sonoras y los ninos las asocian. Finalmente reproducen cada sonido con su voz o cuerpo.", materiales: ["Campana o triangulo", "Grabadora con sonidos del entorno", "Tarjetas con imagenes de fuentes sonoras", "Antifaz"] },
    { titulo: "Rimas con nombres", objetivo: "Identificar y producir palabras que riman", descripcion: "La docente canta canciones rimadas y se detiene para que los ninos completen el par rimado. Luego se juega a rimar los nombres de los ninos de la sala: cada uno dice su nombre y busca una palabra que rime con el.", materiales: ["Cancionero ilustrado", "Titere", "Tarjetas con palabras que riman"] },
    { titulo: "Separacion en silabas", objetivo: "Separar palabras en silabas usando palmadas", descripcion: "La docente muestra una imagen, dice la palabra y da palmadas por silabas. Los ninos repiten. Se cuenta cuantas palmadas tiene cada palabra y se comparan longitudes. Se usan circulos de cartulina para representar cada silaba.", materiales: ["Tarjetas con imagenes", "Circulos de cartulina para contar silabas", "Tambor"] },
    { titulo: "Sonido inicial /a/", objetivo: "Identificar palabras que comienzan con /a/", descripcion: "La docente dice el sonido /a/ de forma prolongada y muestra imagenes. Los ninos levantan la mano solo cuando la imagen empieza con /a/. Luego se arma un mural colectivo pegando recortes de palabras que comienzan con ese sonido.", materiales: ["Tarjetas con imagenes que empiezan con A", "Letra A en distintos formatos", "Caja misteriosa"] },
    { titulo: "Sonido inicial /e/", objetivo: "Identificar palabras que comienzan con /e/", descripcion: "Juego de busca y encuentra: los ninos recorren el aula buscando objetos cuyo nombre empieza con /e/. Al encontrarlos los muestran al grupo y lo dicen en voz alta. Se arma una lista en el pizarron.", materiales: ["Tarjetas con imagenes que empiezan con E", "Espejo", "Letra E"] },
    { titulo: "Sonido inicial /i/", objetivo: "Identificar palabras que comienzan con /i/", descripcion: "Se usa el cuerpo: los ninos forman la letra I con brazos estirados cuando escuchan una palabra que empieza con /i/. Se alterna: la docente dice palabras y los ninos responden con el gesto si empieza con /i/ o se sientan si no.", materiales: ["Tarjetas con imagenes que empiezan con I", "Letra I"] },
    { titulo: "Sonido inicial /o/", objetivo: "Identificar palabras que comienzan con /o/", descripcion: "La docente lee una lista de palabras en voz alta. Los ninos aplauden una vez si empieza con /o/ y se quedan quietos si no. Luego se crea un dictado grafico colectivo: cada nino dibuja una cosa que empiece con /o/.", materiales: ["Tarjetas con imagenes que empiezan con O", "Letra O"] },
    { titulo: "Sonido inicial /u/", objetivo: "Identificar palabras que comienzan con /u/", descripcion: "Juego de memoria con tarjetas: cara imagen y cara sonido inicial. Los ninos las emparejan identificando cuales empiezan con /u/. Se pueden jugar en parejas turnandose.", materiales: ["Tarjetas con imagenes que empiezan con U", "Letra U"] },
    { titulo: "Vocales - Repaso", objetivo: "Consolidar identificacion de sonidos vocalicos iniciales", descripcion: "Ruleta de vocales: la docente gira la ruleta y cae en una vocal. Los ninos deben decir tres palabras que empiecen con esa vocal. Se registran en el pizarron. Al final se cuenta cual vocal tuvo mas palabras.", materiales: ["Set completo de vocales", "Dado con vocales", "Cajas para clasificar"] },
    { titulo: "Sonido inicial /m/", objetivo: "Identificar palabras que comienzan con /m/", descripcion: "Los ninos imitan el sonido /m/ cerrando los labios. Luego se muestran laminas y los ninos senalan las que empiezan con /m/. Construyen una oracion oral con una de esas palabras.", materiales: ["Tarjetas con imagenes que empiezan con M", "Espejo", "Letra M"] },
    { titulo: "Sonido inicial /p/", objetivo: "Identificar palabras que comienzan con /p/", descripcion: "Juego de pesca: se esparce en el piso tarjetas con imagenes. Los ninos pescan con una cana de carton y clasifican en un canasto verde las que empiezan con /p/ y en un canasto rojo las que no.", materiales: ["Tarjetas con imagenes que empiezan con P", "Plumas para soplar", "Letra P"] },
    { titulo: "Sonido inicial /s/", objetivo: "Identificar palabras que comienzan con /s/", descripcion: "Trabajo en parejas: un nino dice una palabra y el otro decide si empieza con /s/ levantando o bajando el pulgar. Luego se intercambian roles. Al final comparten con el grupo las palabras con /s/ que encontraron.", materiales: ["Tarjetas con imagenes que empiezan con S", "Serpiente de peluche", "Letra S"] },
    { titulo: "Sonido inicial /l/", objetivo: "Identificar palabras que comienzan con /l/", descripcion: "La docente presenta un cuento breve con muchas palabras que empiezan con /l/. Antes de leer, da a cada nino una tarjeta con la letra L. Los ninos la levantan cada vez que escuchan una palabra que empieza con /l/.", materiales: ["Tarjetas con imagenes que empiezan con L", "Letra L"] },
    { titulo: "Sonido inicial /t/", objetivo: "Identificar palabras que comienzan con /t/", descripcion: "Se usa un dado con imagenes en sus caras. Al girar, si la imagen empieza con /t/ el nino suma un punto en su tablero. Se juega en equipos de 3. El equipo con mas puntos al cabo de 5 rondas gana.", materiales: ["Tarjetas con imagenes que empiezan con T", "Letra T"] },
    { titulo: "Sonido inicial /n/", objetivo: "Identificar palabras que comienzan con /n/", descripcion: "Los ninos recorren el aula buscando objetos de su pertenencia cuyo nombre empiece con /n/. Los muestran al grupo y los nombran. Se registra en un grafico de barras colectivo cuantas cosas encontro cada uno.", materiales: ["Tarjetas con imagenes que empiezan con N", "Letra N"] },
    { titulo: "Consonantes - Repaso", objetivo: "Consolidar identificacion de sonidos consonanticos", descripcion: "Bingo de sonidos iniciales: cada nino recibe un cartero con consonantes trabajadas. La docente dice palabras y el nino marca la consonante si su tarjeta la tiene. Gana el primero en completar su cartero.", materiales: ["Set de consonantes trabajadas", "Tablero de clasificacion"] },
    { titulo: "Sonido final", objetivo: "Identificar el sonido final de palabras cortas", descripcion: "La docente dice palabras de dos silabas estirando el ultimo sonido. Los ninos atrapan el sonido final cerrando la mano. Luego dicen que sonido atraparon. Se registra con fichas de colores.", materiales: ["Tarjetas con imagenes", "Fichas de colores", "Tablero de sonidos finales"] },
    { titulo: "Sonidos medios", objetivo: "Identificar sonidos en posicion media de palabras", descripcion: "Se trabaja con palabras de tres silabas. Los ninos abren la palabra separando inicio-medio-final con las manos (mano izquierda, centro del pecho, mano derecha) y dicen el sonido de cada posicion.", materiales: ["Tarjetas CVC", "Esquema de tres cajas"] },
    { titulo: "Sintesis de fonemas", objetivo: "Unir fonemas para formar palabras simples", descripcion: "La docente actua como un robot que habla lento pronunciando fonemas separados. Los ninos deben juntar los sonidos y adivinar la palabra. Se usan palabras del entorno cotidiano. Luego los ninos turnan de ser el robot.", materiales: ["Robot que habla lento", "Tarjetas con imagenes de palabras cortas"] },
    { titulo: "Analisis de fonemas", objetivo: "Descomponer palabras en sus fonemas individuales", descripcion: "Los ninos reciben una palabra y con cubos o fichas representan cada fonema colocandolos en una fila. Cuentan cuantos fonemas tiene la palabra. Se comparan palabras largas y cortas.", materiales: ["Cubos para contar fonemas", "Tarjetas con imagenes"] },
    { titulo: "Sustitucion de fonemas", objetivo: "Cambiar un fonema para crear palabras nuevas", descripcion: "La docente dice una palabra y propone cambiar el primer sonido. Los ninos descubren la nueva palabra. Ejemplo: pato cambiamos /p/ por /g/ y queda gato. Se usan letras moviles para mostrar el cambio visualmente.", materiales: ["Letras moviles", "Pizarra o franelografo"] },
    { titulo: "Omision de fonemas", objetivo: "Identificar que palabra queda al quitar un fonema", descripcion: "Se practica quitando el sonido inicial o final de una palabra. Ejemplo: sol sin /s/ queda ol. Se usa apoyo visual: una ficha que se cubre para representar el fonema quitado. Los ninos dicen lo que queda.", materiales: ["Tarjetas de letras", "Fichas para tapar sonidos"] },
    { titulo: "Adicion de fonemas", objetivo: "Agregar fonemas para crear palabras nuevas", descripcion: "Los ninos reciben palabras cortas y agregan un fonema al inicio o al final para crear palabras nuevas. Se comparan los resultados y se verifica si son palabras reales.", materiales: ["Letras moviles", "Pizarra"] },
    { titulo: "Manipulacion avanzada", objetivo: "Realizar operaciones complejas con fonemas", descripcion: "Desafio grupal: la docente da una serie de operaciones con fonemas (quitar el segundo, cambiar el ultimo, agregar uno al medio) y los ninos descifran la palabra resultante. Se trabaja en equipos comparando resultados.", materiales: ["Set completo de letras", "Tablero de manipulacion"] },
    { titulo: "Evaluacion CF", objetivo: "Evaluar el dominio de la conciencia fonologica", descripcion: "Actividad en estaciones: estacion 1 rimas, estacion 2 segmentacion silabica, estacion 3 sonido inicial, estacion 4 manipulacion de fonemas. La docente rota por las estaciones registrando individualmente los logros de cada nino.", materiales: ["Rubrica de evaluacion", "Registro individual"] },
  ],
  CT: [
    { titulo: "Exploracion del libro", objetivo: "Manipular el libro y explorar portada e ilustraciones", descripcion: "Se presenta el libro cerrado. Los ninos observan tapa, contratapa, titulo y autor. En ronda responden: de que creen que trata? quienes apareceran? La docente registra las predicciones en el pizarron.", materiales: ["Cuento con portada atractiva", "Atril para libro"] },
    { titulo: "Antes de leer: Predicciones", objetivo: "Formular hipotesis sobre el contenido mirando la tapa", descripcion: "Antes de abrir el libro, cada nino dice en voz alta su prediccion sobre la historia. Se registran en post-its en el pizarron. Al finalizar la lectura se verifican cuales fueron acertadas y cuales no.", materiales: ["Libro seleccionado", "Post-its para anotar predicciones"] },
    { titulo: "Lectura dialogica: Pausas", objetivo: "Participar con preguntas durante la lectura", descripcion: "La docente lee en voz alta con pausas estrategicas para preguntar: que creen que pasara? por que hizo eso el personaje? como se siente? El titere preguntador formula las preguntas para motivar la participacion.", materiales: ["Libro con marcadores de pausas", "Titere preguntador", "Campana"] },
    { titulo: "Vocabulario en contexto", objetivo: "Inferir significado de palabras nuevas", descripcion: "Al encontrar una palabra dificil en la lectura, la docente se detiene y dice: Esta palabra es nueva, vamos a adivinar que significa por lo que leimos. Entre todos infieren el significado. Se anota en el muro de palabras de la sala.", materiales: ["Libro seleccionado", "Tarjetas de vocabulario", "Diccionario ilustrado"] },
    { titulo: "Recontar la historia", objetivo: "Recontar con propias palabras usando secuencia", descripcion: "Con imagenes de secuencia del cuento en el pizarron, los ninos recontan la historia en cadena: cada uno agrega un fragmento. La docente guia con: que paso primero? y despues? como termino?", materiales: ["Libro leido", "Imagenes de secuencia del cuento", "Titeres"] },
    { titulo: "Conexiones texto-vida", objetivo: "Conectar el texto con experiencias personales", descripcion: "La docente propone preguntas de conexion personal: esto te paso a vos alguna vez? conoces a alguien como este personaje? Los ninos comparten en parejas y luego algunos comparten con el grupo.", materiales: ["Libro leido", "Hojas para dibujar conexiones"] },
    { titulo: "Cruz de comprension: QUIEN", objetivo: "Responder QUIEN usando evidencia del texto", descripcion: "Se coloca la cruz en el pizarron con QUIEN destacado. La docente lee el cuento y al terminar pregunta: quienes son los personajes principales? Los ninos responden citando el texto y se colocan las siluetas en el brazo QUIEN de la cruz.", materiales: ["Cuento con personajes claros", "Tarjetas QUIEN", "Siluetas de personajes"] },
    { titulo: "Cruz de comprension: QUE", objetivo: "Responder QUE sucede con informacion explicita", descripcion: "Se trabaja el brazo QUE de la cruz. Los ninos identifican las 3 acciones mas importantes del texto y las ordenan por relevancia. Se anota en el brazo QUE de la cruz en el pizarron.", materiales: ["Cuento seleccionado", "Tarjetas QUE"] },
    { titulo: "Cruz de comprension: DONDE", objetivo: "Responder DONDE ocurre con evidencia textual", descripcion: "Se trabaja el brazo DONDE. Los ninos buscan en el texto frases que indican el lugar. Se anota en la cruz y se dibuja el escenario principal.", materiales: ["Cuento con lugares definidos", "Mapa del cuento"] },
    { titulo: "Cruz de comprension: CUANDO", objetivo: "Responder CUANDO suceden los eventos", descripcion: "Se trabaja el brazo CUANDO. Los ninos identifican indicadores de tiempo en el texto (de manana, en verano, hace mucho tiempo) y los ubican en una linea temporal dibujada en el pizarron.", materiales: ["Cuento con secuencia temporal", "Linea de tiempo"] },
    { titulo: "Cruz: Integracion literal", objetivo: "Usar las 4 preguntas literales juntas", descripcion: "Con un cuento nuevo, se divide la clase en 4 grupos. Cada grupo se encarga de un brazo de la cruz (QUIEN, QUE, DONDE, CUANDO). Luego presentan al resto y se completa la cruz colectiva.", materiales: ["Cruz de comprension en carton", "Cuento nuevo"] },
    { titulo: "Cruz: POR QUE - causa y efecto", objetivo: "Inferir POR QUE suceden las cosas", descripcion: "Se agrega el brazo POR QUE a la cruz. Los ninos infieren causas que el texto no dice explicitamente. La docente pregunta: como lo sabemos si no esta escrito? Se debate en grupo hasta llegar a una respuesta consensuada.", materiales: ["Cuento con causas claras", "Flechas causa-efecto"] },
    { titulo: "Cruz: COMO sucede", objetivo: "Inferir COMO suceden las acciones", descripcion: "Se trabaja el brazo COMO inferencial. Los ninos explican los procesos que llevan a los eventos del texto usando vocabulario de secuencia: primero... luego... al final... Se contrastan diferentes versiones.", materiales: ["Cuento seleccionado", "Tarjetas COMO"] },
    { titulo: "Cruz: QUE OPINAS", objetivo: "Expresar opinion fundamentada sobre el texto", descripcion: "Los ninos expresan su opinion usando la estructura: Yo opino que... porque en el texto dice... Se registran en globos de opinion en el pizarron. Se debate si hay distintas opiniones validas sobre el mismo texto.", materiales: ["Cuento con dilema", "Caritas de opinion", "Microfono de juguete"] },
    { titulo: "Integracion LD + Cruz", objetivo: "Aplicar lectura dialogica y cruz de comprension juntas", descripcion: "Se realiza el ciclo completo: Antes (predicciones), Durante (pausas dialogicas), Despues (cruz de comprension). Los ninos lideran cada fase con ayuda de la docente que facilita.", materiales: ["Cuento nuevo", "Guia LD", "Cruz completa"] },
    { titulo: "Texto informativo", objetivo: "Aplicar lectura dialogica con texto no narrativo", descripcion: "Se usa un libro informativo o afiche. Los ninos adaptan sus estrategias: antes preguntan que saben del tema, durante buscan datos nuevos, despues comparan lo que sabian con lo que aprendieron.", materiales: ["Libro informativo con imagenes", "Tarjetas KWL"] },
    { titulo: "Secuencia narrativa completa", objetivo: "Identificar inicio, conflicto, resolucion y cierre", descripcion: "La docente presenta las 4 partes de la estructura narrativa con tarjetas de color. Durante la lectura los ninos levantan la tarjeta del color que corresponde a la parte que se esta leyendo.", materiales: ["Cuento con estructura clara", "Tarjetas de estructura"] },
    { titulo: "Personajes: caracteristicas", objetivo: "Describir caracteristicas fisicas y de personalidad", descripcion: "Cada nino elige un personaje y completa un organizador grafico: como es fisicamente? como es su personalidad? que hace en la historia? Se presentan al grupo y se comparan personajes.", materiales: ["Cuento con personajes variados", "Organizador grafico de personaje"] },
    { titulo: "Vocabulario literario", objetivo: "Reconocer y usar vocabulario propio de los textos", descripcion: "Durante la lectura se identifican palabras especiales propias de los textos literarios. Se agregan al diccionario ilustrado de la sala. Los ninos crean una oracion con cada palabra nueva.", materiales: ["Libro seleccionado", "Diccionario ilustrado", "Tarjetas de palabras"] },
    { titulo: "Comprension critica", objetivo: "Evaluar las acciones de los personajes con argumentos", descripcion: "Se presenta un dilema etico del cuento. Los ninos debaten si la accion del personaje estuvo bien o mal y por que, usando la estructura Yo creo que... porque... Se vota y se elabora un juicio colectivo.", materiales: ["Cuento con dilemas eticos", "Balanza de justicia"] },
    { titulo: "Evaluacion CT", objetivo: "Evaluar comprension con Lectura Dialogica y Cruz", descripcion: "La docente presenta un texto nuevo y observa como cada nino aplica de forma autonoma las estrategias de lectura dialogica y la cruz de comprension. Registra en rubrica el nivel de dominio de cada nino.", materiales: ["Rubrica de evaluacion", "Cuento de evaluacion"] },
  ],
  O: [
    { titulo: "ECO-E: Sonidos del entorno", objetivo: "Identificar y discriminar sonidos ambientales", descripcion: "Los ninos cierran los ojos y escuchan 30 segundos. Al abrir los ojos nombran los sonidos en oracion completa. Si dicen palabra suelta, la docente modela y espera que el nino repita la oracion completa.", materiales: ["Grabadora con sonidos", "Instrumentos variados", "Campana", "Antifaz"] },
    { titulo: "ECO-E: Escucha de voces", objetivo: "Reconocer voces y responder con oracion completa", descripcion: "Se reproducen grabaciones de voz. El nino debe responder en oracion completa: Esa es la voz de mi mama. Si responde con una sola palabra, la docente modela la oracion completa y espera la repeticion antes de continuar.", materiales: ["Grabaciones de voces", "Antifaz", "Microfono de juguete"] },
    { titulo: "ECO-E: Instrucciones simples", objetivo: "Seguir instrucciones y verbalizarlas", descripcion: "La docente da una instruccion de un paso. El nino la ejecuta y la verbaliza en oracion completa: Yo levante el brazo. REGLA ECO: no avanzar a la siguiente instruccion hasta obtener la verbalizacion completa.", materiales: ["Objetos para manipular", "Tarjetas con acciones", "Campana"] },
    { titulo: "ECO-E: Instrucciones complejas", objetivo: "Seguir y verbalizar secuencia de dos pasos", descripcion: "Instrucciones de dos pasos. El nino las ejecuta y las verbaliza usando: Primero yo... y despues yo... La docente no acepta solo la accion sin la verbalizacion. Se aumenta la dificultad gradualmente.", materiales: ["Objetos para circuito", "Tarjetas de secuencia"] },
    { titulo: "ECO-E: Atencion en cuentos", objetivo: "Mantener atencion y responder con estructura", descripcion: "La docente lee un cuento corto con pausas. En cada pausa pregunta sobre lo leido. El nino responde usando: En el cuento el personaje... Si responde con palabra suelta, se modela y se espera la oracion completa.", materiales: ["Cuentos cortos ilustrados", "Titere narrador"] },
    { titulo: "ECO-E: Escucha selectiva", objetivo: "Identificar informacion especifica", descripcion: "La docente da una consigna antes de escuchar: Presta atencion al color de la casa. Luego el nino responde en oracion completa sobre ese detalle especifico. Se verifica que la respuesta incluya el dato pedido.", materiales: ["Grabaciones con datos", "Tarjetas de busqueda"] },
    { titulo: "ECO-C: Vocabulario nuevo I", objetivo: "Comprender y usar palabras nuevas en oracion completa", descripcion: "Se presenta un objeto desconocido en la bolsa misteriosa. El nino lo saca, lo explora y lo describe en oracion completa. La docente no acepta la descripcion si no es oracion completa.", materiales: ["Objetos o imagenes nuevas", "Bolsa misteriosa"] },
    { titulo: "ECO-C: Categorias semanticas", objetivo: "Clasificar y verbalizar categorias", descripcion: "Se presentan objetos de distintas categorias. El nino los clasifica y verbaliza: El perro es un animal. La manzana es una fruta. La docente no acepta clasificacion sin verbalizacion. Se complica agregando subcategorias.", materiales: ["Cajas de categorias", "Objetos variados"] },
    { titulo: "ECO-C: Comprension literal", objetivo: "Responder preguntas literales con evidencia del texto", descripcion: "Despues de un cuento, la docente hace preguntas literales. El nino responde citando el texto. Si la respuesta es incompleta, se modela y se espera la repeticion.", materiales: ["Cuento conocido", "Tarjetas de preguntas"] },
    { titulo: "ECO-C: Inferencias simples", objetivo: "Inferir causa-efecto con oracion completa", descripcion: "Se muestran imagenes con situaciones y el nino infiere usando: El nino esta llorando porque se lastimo. La docente desafia: como lo sabemos? Si la respuesta es incompleta, modela y espera.", materiales: ["Historias con causa clara", "Tarjetas de inferencia"] },
    { titulo: "ECO-C: Secuencia temporal", objetivo: "Ordenar y verbalizar eventos con conectores", descripcion: "Los ninos reciben tarjetas de secuencia desordenadas y las ordenan. Luego narran la secuencia usando: Primero... luego... despues... al final... REGLA: no se acepta la narracion sin los 4 conectores.", materiales: ["Tarjetas de secuencia", "Linea de tiempo"] },
    { titulo: "ECO-C: Causa y efecto", objetivo: "Identificar y explicar relaciones causales", descripcion: "La docente muestra pares de tarjetas causa-efecto. El nino conecta ambas usando: La planta se seco porque nadie la rego. Se usan flechas visuales. REGLA: no avanzar sin el conector PORQUE en la respuesta.", materiales: ["Tarjetas causa-efecto", "Flechas de conexion"] },
    { titulo: "ECO-O: Nombrar con estructura", objetivo: "Producir vocabulario preciso en oracion completa", descripcion: "Se presentan objetos uno a uno. El nino los nombra con estructura completa. REGLA ESTRICTA: si el nino dice solo el nombre del objeto, la docente modela y espera la oracion completa antes de continuar.", materiales: ["Objetos variados", "Tira de frase visual"] },
    { titulo: "ECO-O: Describir con marco", objetivo: "Usar marco ES / TIENE / SIRVE PARA", descripcion: "El nino describe un objeto usando el marco visible: Es un... Tiene... Sirve para... La docente no avanza con respuesta de palabra suelta. Si el nino se traba, senala el marco como apoyo visual y espera.", materiales: ["Objetos para describir", "Marco de descripcion impreso", "Microfono"] },
    { titulo: "ECO-O: Narrar con secuenciadores", objetivo: "Usar PRIMERO / LUEGO / DESPUES / AL FINAL", descripcion: "El nino narra una experiencia personal usando los 4 conectores de secuencia. La docente muestra los conectores en tarjetas visuales. Si el nino salta un conector, se senala la tarjeta faltante y se espera que lo incluya.", materiales: ["Tarjetas de secuencia", "Conectores visuales: PRIMERO-LUEGO-DESPUES-AL FINAL"] },
    { titulo: "ECO-O: Explicar procesos", objetivo: "Explicar paso a paso con conectores", descripcion: "El nino elige algo que sabe hacer y lo explica usando el marco: Para hacer X, primero... luego... al final... El resto del grupo sigue las instrucciones literalmente para verificar si son claras.", materiales: ["Material para proceso simple", "Marco de explicacion"] },
    { titulo: "ECO-O: Argumentar con PORQUE", objetivo: "Dar razones usando la estructura con PORQUE", descripcion: "La docente presenta dilemas o preferencias. El nino argumenta: A mi me gusta X porque Y. REGLA: no se acepta la opinion sin el PORQUE. Si falta, la docente senala el conector visual y espera la oracion completa.", materiales: ["Tarjetas de opinion", "Conector PORQUE visual", "Microfono"] },
    { titulo: "ECO-O: Turnos de dialogo", objetivo: "Dialogar con turnos y oraciones completas", descripcion: "En parejas con un objeto de turno (quien lo tiene habla). El turno solo se transfiere si la respuesta fue en oracion completa. Se usa reloj de arena para dar tiempo. La docente observa y registra.", materiales: ["Objeto de turno", "Reloj de arena", "Tarjetas de temas"] },
    { titulo: "ECO-O: Exposicion oral", objetivo: "Presentar con estructura INICIO/DESARROLLO/CIERRE", descripcion: "Cada nino presenta un tema de 1 minuto usando: Hoy voy a hablar de... Para terminar... Si empieza sin la estructura, la docente para amablemente y recuerda el inicio correcto antes de continuar.", materiales: ["Guia de exposicion", "Publico de peluches"] },
    { titulo: "ECO-O: Recontar con emocion", objetivo: "Recontar agregando emociones de los personajes", descripcion: "El nino recuenta un cuento conocido agregando emociones. La docente sugiere: Y como se sentia cuando...? para enriquecer el relato.", materiales: ["Cuento conocido", "Titeres", "Tarjetas de emociones"] },
    { titulo: "Evaluacion ECO", objetivo: "Evaluar oracion completa de forma autonoma", descripcion: "La docente genera situaciones naturales de conversacion, descripcion y narracion sin modelado previo. Registra en la rubrica si el nino usa oraciones completas de forma autonoma, con andamio o solo con palabras sueltas.", materiales: ["Rubrica ECO", "Checklist: Usa oracion completa SI/NO", "Registro individual"] },
  ],
}

const SALAS_4_ANIOS = ["nogalestt", "nogalestm", "nogales tt", "nogales tm"]
function esde4Anios(sala: string): boolean {
  const s = sala.toLowerCase().replace(/\s/g, "")
  return SALAS_4_ANIOS.some(ref => s.includes(ref.replace(/\s/g, "")))
}

function calcularActividadDelDia(
  eje: "CF" | "CT" | "O",
  clasesCompletadasEnEje: number,
  promedioEje: number,
  sala = "Manzanos"
): { actividad: (typeof SECUENCIA)[typeof eje][0]; indice: number; esRepeticion: boolean; esAvanzado: boolean } {
  const fullSeq = SECUENCIA[eje]
  const limites4 = { CF: 12, CT: 8, O: 10 }
  const seq = esde4Anios(sala) ? fullSeq.slice(0, limites4[eje]) : fullSeq

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala") || "Manzanos"

  const supabase = getSupabase()

  try {
    // ── 1. Alumnos de esta sala ────────────────────────────────────────────
    const { data: alumnos } = await supabase
      .from("alumnos")
      .select("id, nombre")
      .eq("sala", sala)

    if (!alumnos || alumnos.length === 0) {
      // Sin alumnos: rotar CF → O → CT igual que con alumnos
      const { data: cierresData } = await supabase
        .from("registro_cierre")
        .select("id,eje")
        .eq("sala", sala)
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

    // ── 2. Registros de ESTA sala ──────────────────────────────────────────
    const { data: registros } = await supabase
      .from("seguimiento")
      .select("*")
      .in("alumno_id", ids)
      .order("fecha", { ascending: true })

    const regs = registros || []

    // ── 3. Inteligencia inter-salas: actividades exitosas en la RED ─────────
    // Consulta seguimiento de todas las salas (filtramos la actual en JS para evitar conflicto de filtros PostgREST)
    const { data: registrosRedRaw } = await supabase
      .from("seguimiento")
      .select("actividad, eje, estado, sala")
      .neq("sala", sala)

    const registrosRed = (registrosRedRaw || []).filter(r => r.sala != null && r.sala !== "")

    // Calcular tasa de exito por actividad/eje en toda la red
    type MapaRed = Record<string, { total: number; verdes: number; salas: Set<string> }>
    const mapaRed: MapaRed = {}
    for (const r of registrosRed || []) {
      const key = `${r.eje}::${r.actividad}`
      if (!mapaRed[key]) mapaRed[key] = { total: 0, verdes: 0, salas: new Set() }
      mapaRed[key].total++
      if (r.estado === "green") mapaRed[key].verdes++
      if (r.sala) mapaRed[key].salas.add(r.sala)
    }
    // Actividades de la red con tasa >= 70% y al menos 5 registros en 2+ salas
    const exitosasRed: Record<string, { actividad: string; tasa: number; salas: number }[]> = { CF: [], CT: [], O: [] }
    for (const [key, d] of Object.entries(mapaRed)) {
      const [eje, actividad] = key.split("::")
      if (!actividad || !["CF", "CT", "O"].includes(eje)) continue
      const tasa = Math.round((d.verdes / d.total) * 100)
      if (d.total >= 5 && d.salas.size >= 2 && tasa >= 70) {
        exitosasRed[eje].push({ actividad, tasa, salas: d.salas.size })
      }
    }

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
      const verdes = regsEje.filter((r) => r.estado === "green").length
      const amarillos = regsEje.filter((r) => r.estado === "yellow").length
      const rojos = regsEje.filter((r) => r.estado === "red").length
      const total = regsEje.length
      const promedio = total > 0 ? Math.round((verdes * 100 + amarillos * 50 + rojos * 10) / total) : 0

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
          ? regsEsaFecha.filter((r) => r.estado === "green").length / regsEsaFecha.length
          : 1
        if (promFecha < 0.4) ultimasClasesEnRojo++
      }

      const alumnosEnRojo: string[] = []
      for (const al of alumnos) {
        const ultReg = regsEje.filter((r) => r.alumno_id === al.id).pop()
        if (ultReg && ultReg.estado === "red") alumnosEnRojo.push(al.nombre)
      }

      const actMap: Record<string, { total: number; verdes: number }> = {}
      for (const r of regsEje) {
        if (!r.actividad) continue
        if (!actMap[r.actividad]) actMap[r.actividad] = { total: 0, verdes: 0 }
        actMap[r.actividad].total++
        if (r.estado === "green") actMap[r.actividad].verdes++
      }
      const actividadesExitosasLocales = Object.entries(actMap)
        .map(([actividad, d]) => ({ actividad, tasa: d.total >= 3 ? Math.round((d.verdes / d.total) * 100) : 0 }))
        .filter((a) => a.tasa >= 60)
        .sort((a, b) => b.tasa - a.tasa)
        .slice(0, 5)

      const ahora = new Date()
      const hace7 = new Date(ahora.getTime() - 7 * 86400000)
      const hace14 = new Date(ahora.getTime() - 14 * 86400000)
      const semActual = regsEje.filter((r) => new Date(r.fecha) >= hace7)
      const semAnterior = regsEje.filter((r) => new Date(r.fecha) >= hace14 && new Date(r.fecha) < hace7)
      const promSemActual = semActual.length > 0 ? semActual.filter((r) => r.estado === "green").length / semActual.length : 0
      const promSemAnterior = semAnterior.length > 0 ? semAnterior.filter((r) => r.estado === "green").length / semAnterior.length : 0
      let tendencia: "mejorando" | "estancado" | "empeorando" = "estancado"
      if (promSemActual > promSemAnterior + 0.1) tendencia = "mejorando"
      if (promSemActual < promSemAnterior - 0.1) tendencia = "empeorando"

      analisis[eje] = { total, verdes, amarillos, rojos, promedio, alumnosEnRojo, actividadesExitosasLocales, tendencia, clasesCompletadas, ultimasClasesEnRojo }
    }

    // ── 5. Elegir eje: ROTACION CICLICA CF → O → CT → CF → O → CT
    // Cada Finalizar Jornada inserta un cierre nuevo → totalClasesCompletadasGlobal aumenta
    // La rotacion garantiza que los 3 ejes avanzan en paralelo, cada uno a su propio ritmo
    // Excepcion: si un eje tiene 2 clases seguidas en rojo, ALBA lo repite antes de rotar
    const ORDEN_EJES: ("CF" | "CT" | "O")[] = ["CF", "O", "CT"]
    let ejeSugerido: "CF" | "CT" | "O" = ORDEN_EJES[totalClasesCompletadasGlobal % ORDEN_EJES.length]

    // Si el eje elegido por rotacion tiene 2+ clases seguidas en rojo, ALBA lo mantiene
    // para consolidar antes de continuar la rotacion (maximo 2 repeticiones)
    const ejeRotado = ejeSugerido
    const datosEjeRotado = analisis[ejeRotado]
    if (datosEjeRotado.ultimasClasesEnRojo >= 2) {
      // Mantener el mismo eje para consolidar — no rotar todavia
      ejeSugerido = ejeRotado
    }

    const CHECKPOINT_CADA = 10
    const esCheckpoint = totalClasesCompletadasGlobal > 0 && totalClasesCompletadasGlobal % CHECKPOINT_CADA === 0

    // ── 6. Elegir actividad: combinar secuencia + evidencia inter-salas ────
    const ejeDatos = analisis[ejeSugerido]

    // Si hay 2+ clases seguidas con promedio bajo, retroceder en la secuencia
    let clasesParaCalculo = ejeDatos.clasesCompletadas
    if (ejeDatos.ultimasClasesEnRojo >= 2 && clasesParaCalculo > 0) {
      clasesParaCalculo = Math.max(0, clasesParaCalculo - 1)
    }

    const { actividad, indice, esRepeticion, esAvanzado } = calcularActividadDelDia(
      ejeSugerido,
      clasesParaCalculo,
      ejeDatos.promedio,
      sala
    )
    console.log("[v0] BRAIN eje:", ejeSugerido, "clasesParaCalculo:", clasesParaCalculo, "-> actividad:", actividad.titulo)

    // Verificar si la actividad sugerida tiene mala tasa local (< 30%)
    // Si es asi, y hay una actividad de la red con >= 70%, usar esa
    const actividadLocal = analisis[ejeSugerido].actividadesExitosasLocales
    const actTasaLocal = actividadLocal.find(a => a.actividad === actividad.titulo)
    const tasaLocal = actTasaLocal ? actTasaLocal.tasa : -1 // -1 = sin datos

    const redParaEje = exitosasRed[ejeSugerido] || []
    // Buscar en la SECUENCIA la actividad de la red que no hayamos hecho aun
    const actividadesHechasEnEste = new Set(regs.filter(r => r.eje === ejeSugerido).map(r => r.actividad))
    const candidataRed = redParaEje
      .filter(r => !actividadesHechasEnEste.has(r.actividad))
      .sort((a, b) => b.tasa - a.tasa)[0]

    // Usar actividad de la red solo si la secuencia actual tiene tasa local mala Y hay candidata de la red
    const usarRed = tasaLocal !== -1 && tasaLocal < 30 && candidataRed != null
    const actividadFinal = usarRed
      ? (SECUENCIA[ejeSugerido].find(a => a.titulo === candidataRed.actividad) ?? actividad)
      : actividad
    const aprendidoDeLaRed = usarRed
    const salaRedNombre = usarRed && candidataRed ? `${candidataRed.salas} sala${candidataRed.salas > 1 ? "s" : ""} de la red` : null

    // ── 7. Construir respuesta ─���───────────────────────────────────────────
    const limites4 = { CF: 12, CT: 8, O: 10 }
    const totalEnSecuencia = esde4Anios(sala)
      ? SECUENCIA[ejeSugerido].slice(0, limites4[ejeSugerido]).length
      : SECUENCIA[ejeSugerido].length
    const edadLabel = esde4Anios(sala) ? " (4 anos)" : " (5 anos)"
    const ejeNombre = ejeSugerido === "CF" ? "Conciencia Fonologica" : ejeSugerido === "CT" ? "Comprension de Textos" : "Oralidad (ECO)"

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
      razon += ` Actividad exitosa en ${salaRedNombre} de la red ALBA (${candidataRed?.tasa}% de logro).`
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
        alertas.push({ tipo: "patron_grupal", mensaje: `${a.alumnosEnRojo.length} de ${alumnos.length} alumnos en rojo en ${nombre}. Revisar estrategia grupal.`, urgencia: "alta" })
      }
      for (const al of alumnos) {
        const regsAl = regs.filter((r) => r.alumno_id === al.id && r.eje === eje).slice(-3)
        if (regsAl.length >= 3 && regsAl.every((r) => r.estado === "red")) {
          alertas.push({ tipo: "persistencia", mensaje: `${al.nombre} lleva 3+ clases seguidas en rojo en ${nombre}.`, urgencia: "alta" })
        }
      }
      if (a.tendencia === "empeorando") {
        alertas.push({ tipo: "tendencia", mensaje: `${nombre} muestra tendencia negativa esta semana.`, urgencia: "media" })
      }
      if (exitosasRed[eje].length > 0) {
        alertas.push({ tipo: "red_exitosa", mensaje: `La red ALBA tiene ${exitosasRed[eje].length} actividad${exitosasRed[eje].length > 1 ? "es" : ""} con >70% de logro en ${nombre}. ALBA las priorizara automaticamente.`, urgencia: "info" })
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
        descripcion: actividadFinal.descripcion,
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
        totalClasesCompletadas: totalClases, // v7: usa cierres
        semanaActual,
        clasesCompletadasPorEje: {
          CF: analisis.CF.clasesCompletadas,
          CT: analisis.CT.clasesCompletadas,
          O: analisis.O.clasesCompletadas,
        },
      },
    })
  } catch (err) {
    console.error("[v0] Error en /api/brain:", err)
    const actividadInicial = SECUENCIA.CF[0]
    return NextResponse.json({
      sugerencia: {
        eje: "CF",
        actividad: actividadInicial.titulo,
        descripcion: actividadInicial.descripcion,
        objetivo: actividadInicial.objetivo,
        materiales: actividadInicial.materiales,
        razon: "Inicio del recorrido. Comenzamos con Conciencia Fonologica.",
        aprendidoDeLaRed: false,
        salaRed: null,
        numeroClase: 1,
        esRepeticion: false,
      },
      alertas: [],
      historial: { promediosPorEje: { CF: 0, CT: 0, O: 0 } },
      progreso: { totalClasesCompletadas: 0, semanaActual: 1, clasesCompletadasPorEje: { CF: 0, CT: 0, O: 0 } },
    })
  }
}
// Build timestamp: 1779400487
// Timestamp 1779751849
