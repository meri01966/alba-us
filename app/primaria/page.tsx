"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { supabase, isSupabaseConfigured } from "@/lib/supabase"

/**
 * ALBA · Primaria — Primer Grado
 *
 * Filosofía (distinta a jardín):
 *  - A la maestra NO se le muestran números, promedios ni porcentajes.
 *  - ALBA lee los registros y devuelve un RELATO en lenguaje natural:
 *    qué viene trabajando el grupo, qué eje conviene retomar, a qué chicos acompañar.
 *  - El objetivo es sostener una buena secuencia de alfabetización a lo largo del año.
 *  - La maestra arma su cronograma: puede ACEPTAR la sugerencia de ALBA, pedir OTRA,
 *    o cargar sus propias actividades.
 *
 * Es un archivo standalone: no importa ningún componente de jardín.
 * Lee y escribe en la misma tabla `seguimiento` de Supabase (columna `estado`).
 * El cronograma y los proyectos se guardan localmente por sala (localStorage).
 */

// ─────────────────────────────────────────────────────────────────────────────
// Configuración
// ─────────────────────────────────────────────────────────────────────────────

const NAVY = "#1e3a5f"
const ORANGE = "#D4870E"

const SALAS = ["1A", "1B", "1C", "PrimeroDePrueba"]
// Sala de prueba: no se blanquea por fecha. Se cierra solo con el botón "Finalizar cronograma".
const SALA_PRUEBA = "PrimeroDePrueba"

type EjeKey = "SE" | "LE" | "PE" | "OR" | "CL"

const EJES: { key: EjeKey; nombre: string; corto: string; color: string; bg: string }[] = [
  { key: "SE", nombre: "Sistema de Escritura", corto: "Escritura", color: "#6366F1", bg: "#eef2ff" },
  { key: "LE", nombre: "Lectura", corto: "Lectura", color: "#0D9488", bg: "#f0fdfa" },
  { key: "PE", nombre: "Producción Escrita", corto: "Producción", color: "#D4870E", bg: "#fffbeb" },
  { key: "OR", nombre: "Oralidad", corto: "Oralidad", color: "#DB2777", bg: "#fdf2f8" },
  { key: "CL", nombre: "Conocimiento de la Lengua", corto: "Lengua", color: "#2563EB", bg: "#eff6ff" },
]

const EJE = (k: string) => EJES.find((e) => e.key === k) || EJES[0]

// ─────────────────────────────────────────────────────────────────────────────
// BIBLIOTECA DIDÁCTICA — clases ricas por eje (segundo cuatrimestre, 1er grado)
// Cada actividad es una clase completa: no un título, sino el desarrollo, los
// recursos, los materiales y qué aprenden los chicos. ALBA como fuente de didáctica.
// Basado en el DC CABA (Lengua, primer ciclo) y buenas prácticas de alfabetización.
// ─────────────────────────────────────────────────────────────────────────────

type ClaseDidactica = {
  titulo: string
  objetivo: string          // qué se busca lograr
  aprenden: string          // qué aprenden los chicos (foco)
  desarrollo: string[]      // pasos concretos de la clase
  recursos: string[]        // materiales y recursos estimulantes
  duracion: string          // tiempo estimado
}

const BIBLIOTECA: Record<EjeKey, ClaseDidactica[]> = {
  SE: [
    {
      titulo: "Detectives de sílabas trabadas (tr, pl, gr)",
      objetivo: "Escribir palabras con grupos consonánticos sin omitir la segunda consonante.",
      aprenden: "Que en 'tren' o 'plato' hay dos sonidos pegados que no se pueden saltear.",
      desarrollo: [
        "Mostrá tarjetas con imágenes: tren, plato, globo, grúa, plaza. Los chicos nombran cada una en voz alta.",
        "Palmean la palabra en sílabas y estiran el sonido trabado: 'trrr-en'. El cuerpo marca el grupo.",
        "En parejas, escriben tres palabras en el cuaderno. Vos pasás y señalás con el dedo si falta una letra, sin corregir vos.",
        "Cierre: cada pareja lee una palabra suya y la comparten con el grupo.",
      ],
      recursos: ["Tarjetas con imágenes de palabras trabadas", "Cuaderno y lápiz", "Pizarrón para el modelo"],
      duracion: "40 min",
    },
    {
      titulo: "El dictado del cartero",
      objetivo: "Escribir oraciones cortas respetando mayúscula inicial, separación y punto final.",
      aprenden: "Que una oración empieza con mayúscula, las palabras van separadas y termina con punto.",
      desarrollo: [
        "Contales que son carteros y tienen que escribir mensajes cortos. Cada mensaje es una oración.",
        "Dictá una oración simple y conocida: 'El gato duerme.' Despacio, marcando el punto al final con la voz.",
        "Mientras escriben, recordá en voz alta: arrancamos con mayúscula, separamos las palabras, cerramos con punto.",
        "Repetí con dos o tres oraciones más. Al final, releen sus mensajes señalando con el dedo dónde están las mayúsculas y los puntos.",
      ],
      recursos: ["Sobres o tarjetas de 'mensajes'", "Cuaderno", "Cartelito modelo de oración con sus partes señaladas"],
      duracion: "35 min",
    },
    {
      titulo: "La tijera de palabras",
      objetivo: "Separar correctamente las palabras dentro de una oración escrita de corrido.",
      aprenden: "Dónde termina una palabra y empieza otra; que las palabras no van pegadas.",
      desarrollo: [
        "Escribí en el pizarrón una oración con todas las palabras pegadas: 'elperrocorreenelpatio'.",
        "Los chicos vienen de a uno y marcan con una rayita dónde cortarían cada palabra.",
        "Reescriben la oración separada en su cuaderno y la leen en voz alta para verificar que tiene sentido.",
        "Variante con tarjetas: cada chico recibe palabras sueltas y arma su propia oración acomodándolas con espacios.",
      ],
      recursos: ["Pizarrón", "Tarjetas con palabras sueltas", "Cuaderno"],
      duracion: "30 min",
    },
    {
      titulo: "Sonidos gemelos: ch, ll, rr",
      objetivo: "Asociar los dígrafos a su sonido y usarlos al escribir.",
      aprenden: "Que dos letras juntas pueden sonar como un solo sonido (chico, lluvia, perro).",
      desarrollo: [
        "Presentá un dígrafo por vez con palabras-imagen: 'ch' con chico, chancho, leche.",
        "Los chicos buscan en el aula o en su cabeza otras palabras con ese sonido y las dicen en voz alta.",
        "Escriben tres palabras con el dígrafo del día. Trabajá un solo dígrafo por clase para no mezclar.",
        "Juego de cierre: decís una palabra y levantan la mano si tiene el sonido del día.",
      ],
      recursos: ["Tarjetas-imagen por dígrafo", "Cuaderno", "Lista de palabras de ejemplo"],
      duracion: "35 min",
    },
  ],
  LE: [
    {
      titulo: "Lectura en voz alta: el cuento de cada día",
      objetivo: "Ganar fluidez leyendo un texto breve y conocido en voz alta.",
      aprenden: "A leer con ritmo, respetando el punto, sin trabarse en cada palabra.",
      desarrollo: [
        "Elegí un cuento corto (una página). Leelo vos primero, completo, con buena entonación: sos el modelo.",
        "Lo vuelven a leer todos juntos en voz alta, siguiendo con el dedo.",
        "Después, de a turnos, cada chico lee una oración. La relectura del mismo texto es lo que da fluidez.",
        "Cerrá preguntando qué fue lo que más les gustó y por qué.",
      ],
      recursos: ["Un cuento breve (copia para cada chico o proyectado)", "Señalador o el dedo para seguir el renglón"],
      duracion: "40 min",
    },
    {
      titulo: "El detective del cuento (comprensión)",
      objetivo: "Responder preguntas literales e inferenciales sobre un texto leído.",
      aprenden: "A buscar información que está en el texto y a deducir lo que no está dicho pero se entiende.",
      desarrollo: [
        "Leé un cuento corto en voz alta. Antes de leer, mostrá la tapa y preguntá de qué creen que va a tratar.",
        "Preguntas literales (la respuesta está en el texto): ¿quién es el personaje?, ¿dónde pasa?, ¿qué hizo?",
        "Preguntas inferenciales (hay que deducir): ¿por qué se habrá puesto triste?, ¿qué creen que pasó después?",
        "Cada chico dibuja la parte que más le gustó y la cuenta en una oración.",
      ],
      recursos: ["Un cuento con conflicto claro", "Hoja para dibujar", "Lista de preguntas preparada"],
      duracion: "45 min",
    },
    {
      titulo: "Anticipar con la tapa",
      objetivo: "Formular hipótesis sobre un texto a partir de su portada e imágenes.",
      aprenden: "Que se puede anticipar de qué trata un texto antes de leerlo, usando pistas visuales.",
      desarrollo: [
        "Mostrá solo la tapa de un libro (título e imagen). No leas todavía.",
        "Preguntá: ¿de qué creen que trata?, ¿quién será el personaje?, ¿dónde pasará? Anotá sus hipótesis en el pizarrón.",
        "Leé el cuento. Al terminar, volvé a las hipótesis: ¿cuáles acertaron?, ¿cuáles no?",
        "Conversen sobre qué pistas de la tapa los ayudaron a adivinar bien.",
      ],
      recursos: ["Un libro con tapa atractiva", "Pizarrón para anotar hipótesis"],
      duracion: "35 min",
    },
    {
      titulo: "Palabras nuevas, tesoro nuevo",
      objetivo: "Incorporar vocabulario nuevo a partir de la lectura.",
      aprenden: "El significado de palabras nuevas usándolas en contexto, no de memoria.",
      desarrollo: [
        "Durante la lectura de un cuento, frená en dos o tres palabras que probablemente no conozcan.",
        "Preguntá qué creen que significan según cómo viene la frase. Después explicá con un ejemplo cotidiano.",
        "Cada palabra nueva va a un 'cofre del tesoro' (un afiche en el aula).",
        "Cierre: usan una de las palabras nuevas en una oración propia, oral o escrita.",
      ],
      recursos: ["Un cuento con vocabulario variado", "Afiche 'cofre de palabras'", "Marcadores"],
      duracion: "40 min",
    },
  ],
  PE: [
    {
      titulo: "Dictado al maestro: la historia de todos",
      objetivo: "Producir un texto colectivo donde los chicos piensan y el docente escribe.",
      aprenden: "Que escribir es poner ideas en palabras; producen textos más ricos de los que aún pueden escribir solos.",
      desarrollo: [
        "Proponé escribir entre todos una historia corta. Vos sos la mano que escribe en el pizarrón.",
        "Preguntá: ¿cómo empieza?, ¿quién es el personaje?, ¿qué le pasa? Ellos dictan, vos escribís tal cual dicen.",
        "Releé en voz alta lo que va quedando y preguntá si quieren cambiar o agregar algo. Así aprenden a revisar.",
        "Al final, copian en su cuaderno la historia que crearon juntos.",
      ],
      recursos: ["Pizarrón grande", "Cuaderno para copiar", "Opcional: afiche para dejar la historia en el aula"],
      duracion: "45 min",
    },
    {
      titulo: "Mi oración, mi dibujo",
      objetivo: "Escribir de forma autónoma una oración con sentido completo.",
      aprenden: "A producir una oración propia, completa, de principio a fin.",
      desarrollo: [
        "Cada chico hace un dibujo libre de algo que le guste.",
        "Después escribe una oración que cuente qué dibujó: 'Mi perro juega en la plaza.'",
        "Recordales el plan mínimo: mayúscula al empezar, palabras separadas, punto al final.",
        "Comparten: muestran el dibujo y leen su oración al grupo.",
      ],
      recursos: ["Hoja para dibujar", "Cuaderno", "Lápices de colores"],
      duracion: "40 min",
    },
    {
      titulo: "Otro final para el cuento",
      objetivo: "Reescribir el final de un cuento conocido.",
      aprenden: "Que un texto se puede transformar; a producir manteniendo coherencia con la historia.",
      desarrollo: [
        "Releé un cuento que ya conocen, hasta justo antes del final.",
        "Preguntá: ¿y si terminara distinto? ¿Qué otro final se les ocurre?",
        "Cada uno (o en parejas) escribe un final nuevo, de dos o tres oraciones.",
        "Leen sus finales y votan cuál los sorprendió más. Festejen la variedad.",
      ],
      recursos: ["Un cuento conocido por el grupo", "Cuaderno"],
      duracion: "45 min",
    },
    {
      titulo: "Texto con plan: primero pienso, después escribo",
      objetivo: "Escribir un texto breve (3-4 oraciones) habiendo planificado antes.",
      aprenden: "Que antes de escribir conviene pensar qué y para quién; reduce la frustración.",
      desarrollo: [
        "Elegí un tema cercano: mi mascota, mi juego favorito, mi familia.",
        "Plan oral entre todos: ¿qué tres cosas podríamos contar de eso? Anotalas como ayuda-memoria en el pizarrón.",
        "Cada chico escribe su texto breve siguiendo ese plan.",
        "Releen su texto y marcan con el dedo dónde pusieron cada punto.",
      ],
      recursos: ["Pizarrón para el plan", "Cuaderno"],
      duracion: "45 min",
    },
  ],
  OR: [
    {
      titulo: "Te cuento el cuento (renarración)",
      objetivo: "Volver a contar un cuento siguiendo el orden de los hechos.",
      aprenden: "A organizar un relato con inicio, desarrollo y final; muestra qué comprendieron.",
      desarrollo: [
        "Leé un cuento corto con secuencia clara.",
        "Mostrá tres o cuatro imágenes del cuento desordenadas. Entre todos las ordenan.",
        "Cada chico, con las imágenes como apoyo, vuelve a contar una parte del cuento.",
        "Si se traban, señalá la imagen que sigue, no les des la respuesta.",
      ],
      recursos: ["Un cuento con secuencia clara", "Imágenes de las escenas para ordenar"],
      duracion: "40 min",
    },
    {
      titulo: "Veo, veo y describo",
      objetivo: "Describir oralmente una imagen de forma organizada.",
      aprenden: "A observar con detalle y a poner en palabras lo que ven, con orden.",
      desarrollo: [
        "Mostrá una lámina con muchos detalles (una plaza, un mercado, una fiesta).",
        "Empezá vos modelando: 'En esta imagen veo… arriba hay… abajo hay…'",
        "Cada chico aporta algo que ve. Guialos a ir de lo general a lo particular.",
        "Cierre: entre todos arman una descripción completa de la lámina.",
      ],
      recursos: ["Una lámina rica en detalles", "Espacio para que todos la vean"],
      duracion: "35 min",
    },
    {
      titulo: "Instrucciones para un robot",
      objetivo: "Dar y seguir instrucciones orales de varios pasos.",
      aprenden: "A ordenar instrucciones en secuencia y a escuchar con atención para ejecutarlas.",
      desarrollo: [
        "Un chico es el 'robot' y otro le da instrucciones para llegar a un objeto: 'Dos pasos al frente, giro, un paso.'",
        "El robot ejecuta exactamente lo que escucha (ni más ni menos): así descubren si la instrucción fue clara.",
        "Rotan los roles. Conversen qué instrucciones funcionaron mejor y por qué.",
        "Variante: dar los pasos de una receta o de un juego conocido.",
      ],
      recursos: ["Un objeto-meta", "Espacio para moverse"],
      duracion: "30 min",
    },
    {
      titulo: "Ronda de opiniones",
      objetivo: "Expresar y fundamentar una opinión sobre una lectura, escuchando a los demás.",
      aprenden: "A dar su parecer con un porqué y a respetar el turno y la palabra del otro.",
      desarrollo: [
        "Después de leer un cuento, sentate con el grupo en ronda.",
        "Preguntá algo opinable: ¿el personaje hizo bien?, ¿qué hubieran hecho ustedes?",
        "Cada chico opina cuando tiene la palabra (podés usar un objeto que se pasa). Pedí siempre el 'porqué'.",
        "Modelá la escucha: retomá lo que dijo un compañero antes de pasar al siguiente.",
      ],
      recursos: ["Un cuento con dilema", "Un objeto para marcar el turno de habla"],
      duracion: "35 min",
    },
  ],
  CL: [
    {
      titulo: "Familias de palabras",
      objetivo: "Reconocer palabras que vienen de una misma raíz.",
      aprenden: "Que las palabras tienen 'parientes' (pan, panadero, panadería) y eso ayuda a escribir y entender.",
      desarrollo: [
        "Partí de una palabra que apareció en una lectura: por ejemplo 'flor'.",
        "Entre todos buscan parientes: florero, florería, florecita, florecer.",
        "Arman un 'árbol de familia' en un afiche, con la palabra raíz en el tronco y los parientes en las ramas.",
        "Cierre: cada chico elige una palabra de la familia y la usa en una oración.",
      ],
      recursos: ["Afiche con forma de árbol", "Marcadores", "Una palabra tomada de la lectura"],
      duracion: "35 min",
    },
    {
      titulo: "Lo mismo pero distinto: sinónimos y antónimos",
      objetivo: "Reconocer palabras de significado parecido y opuesto en contexto.",
      aprenden: "Que hay palabras que significan casi lo mismo (lindo/bonito) y otras lo contrario (grande/chico).",
      desarrollo: [
        "Tomá una oración de un cuento: 'El gigante era enorme.' Preguntá: ¿qué otra palabra significa parecido a enorme?",
        "Juego de los opuestos: decís una palabra (alto) y ellos dicen el contrario (bajo), con el cuerpo si quieren.",
        "Arman dos columnas en el cuaderno: parecidas / contrarias, con ejemplos que vayan saliendo.",
        "Siempre partí de palabras que aparecieron en lo que leyeron, nunca en abstracto.",
      ],
      recursos: ["Una lectura previa", "Cuaderno", "Pizarrón con dos columnas"],
      duracion: "35 min",
    },
    {
      titulo: "Cazadores de nombres (sustantivos)",
      objetivo: "Identificar sustantivos dentro de una oración.",
      aprenden: "Que hay palabras que nombran cosas, personas, animales y lugares.",
      desarrollo: [
        "Sin dar la definición técnica, decí: vamos a buscar las palabras que nombran cosas o personas.",
        "Leé una oración y entre todos señalan los 'nombres': 'El perro corre en la plaza' → perro, plaza.",
        "Cada chico escribe una oración y subraya los nombres que encuentra.",
        "A esta edad alcanza con que reconozcan y usen, no con que definan.",
      ],
      recursos: ["Oraciones de ejemplo", "Cuaderno", "Lápiz para subrayar"],
      duracion: "30 min",
    },
    {
      titulo: "Palabras que pintan (adjetivos)",
      objetivo: "Usar adjetivos para describir objetos y personajes.",
      aprenden: "Que hay palabras que dicen cómo es algo (grande, suave, colorido) y enriquecen lo que contamos.",
      desarrollo: [
        "Mostrá un objeto (una pelota, un peluche). Preguntá: ¿cómo es? Van diciendo cualidades: redonda, roja, blanda.",
        "Tomá un personaje de un cuento y entre todos lo describen con tres o cuatro 'palabras que pintan'.",
        "Cada chico elige un objeto del aula y escribe una oración describiéndolo con al menos un adjetivo.",
        "Comparten y adivinan qué objeto describió cada uno por las pistas.",
      ],
      recursos: ["Objetos del aula", "Un personaje conocido", "Cuaderno"],
      duracion: "35 min",
    },
  ],
}

// Lista de títulos por eje (para selectores y compatibilidad con el resto del código)
const ACTIVIDADES: Record<EjeKey, string[]> = {
  SE: BIBLIOTECA.SE.map((c) => c.titulo),
  LE: BIBLIOTECA.LE.map((c) => c.titulo),
  PE: BIBLIOTECA.PE.map((c) => c.titulo),
  OR: BIBLIOTECA.OR.map((c) => c.titulo),
  CL: BIBLIOTECA.CL.map((c) => c.titulo),
}

// Buscar la clase completa por su título
function claseporTitulo(eje: EjeKey, titulo: string): ClaseDidactica | undefined {
  return BIBLIOTECA[eje].find((c) => c.titulo === titulo)
}

// Tips pedagógicos just-in-time por eje
const TIPS: Record<EjeKey, string[]> = {
  SE: [
    "Antes de pedir que escriban, invitá a que digan la palabra en voz alta y la dividan en sílabas con palmas. El cuerpo ancla el sonido.",
    "Si confunden letras de sonido parecido (b/d, p/q), trabajalas en momentos distintos, nunca juntas el mismo día.",
  ],
  LE: [
    "La fluidez crece con relectura, no con textos nuevos cada vez. Que vuelvan a leer el mismo cuento corto varias veces da más resultado.",
    "Antes de leer, activá lo que ya saben sobre el tema. La comprensión empieza antes de la primera palabra.",
  ],
  PE: [
    "El dictado al docente saca la barrera de la mano: ellos piensan el texto, vos escribís. Así producen ideas más ricas que las que aún pueden escribir solos.",
    "Pedí siempre un plan mínimo antes de escribir: de qué van a escribir y para quién. Escribir sin plan agota y frustra.",
  ],
  OR: [
    "La renarración muestra qué comprendieron de verdad. Si se traban, ofrecé las imágenes del cuento como apoyo, no la respuesta.",
    "Dale tiempo de espera después de preguntar. Tres segundos de silencio parecen eternos pero habilitan a los más callados.",
  ],
  CL: [
    "La reflexión sobre la lengua se hace sobre textos que ya leyeron, no en abstracto. Partí siempre de una palabra que apareció en la lectura.",
    "A esta edad alcanza con que reconozcan y usen, no con que definan. 'Es una palabra que nombra algo' vale más que la definición de sustantivo.",
  ],
}

type Estado = "green" | "yellow" | "red" | "blue"

// ─────────────────────────────────────────────────────────────────────────────
// Secuencia anual de primer grado — segundo cuatrimestre hasta fin de año
// Dos vistas combinadas: recorrido por mes + secuencia ordenada por eje.
// Basado en la progresión del DC CABA (Lengua, primer ciclo).
// ─────────────────────────────────────────────────────────────────────────────

// Recorrido por mes: qué priorizar cada mes (junio→diciembre)
const RECORRIDO_MENSUAL: { mes: string; foco: EjeKey[]; titulo: string; detalle: string }[] = [
  {
    mes: "Junio",
    titulo: "Consolidar el sistema de escritura",
    foco: ["SE", "LE"],
    detalle: "Afianzar correspondencia sonido-letra y sílabas complejas. Sostener la lectura compartida diaria para ganar fluidez.",
  },
  {
    mes: "Julio",
    titulo: "Leer para comprender",
    foco: ["LE", "OR"],
    detalle: "Comprensión literal e inferencial de cuentos. Renarración oral organizada. Antes del receso, afianzar lo trabajado.",
  },
  {
    mes: "Agosto",
    titulo: "Empezar a producir por escrito",
    foco: ["PE", "SE"],
    detalle: "Dictado al docente y primeras escrituras autónomas de oraciones. Seguir afianzando la escritura de palabras.",
  },
  {
    mes: "Septiembre",
    titulo: "Escribir con intención",
    foco: ["PE", "CL"],
    detalle: "Textos breves con plan previo. Primeras reflexiones sobre la lengua: sustantivos y adjetivos en lo que escriben.",
  },
  {
    mes: "Octubre",
    titulo: "Integrar los cinco ejes",
    foco: ["LE", "PE", "CL"],
    detalle: "Lectura, escritura y reflexión sobre la lengua trabajando juntas. Vocabulario, sinónimos y familias de palabras.",
  },
  {
    mes: "Noviembre",
    titulo: "Autonomía lectora y escritora",
    foco: ["LE", "PE"],
    detalle: "Lectura en voz alta con fluidez consolidada. Producción de textos más completos con revisión colaborativa.",
  },
  {
    mes: "Diciembre",
    titulo: "Cierre y muestra de logros",
    foco: ["OR", "PE", "LE"],
    detalle: "Integrar lo aprendido en una producción final. Compartir y narrar oralmente lo trabajado durante el año.",
  },
]

// Secuencia ordenada por eje: del estado actual hacia el objetivo de fin de año
const SECUENCIA_EJE: Record<EjeKey, { etapa: string; detalle: string }[]> = {
  SE: [
    { etapa: "Sílabas complejas", detalle: "Escritura de palabras con tr, pl, gr, br, cl." },
    { etapa: "Dígrafos", detalle: "Correspondencia con ch, ll, rr en la escritura." },
    { etapa: "Oración convencional", detalle: "Mayúscula inicial, separación de palabras y punto final." },
    { etapa: "Ortografía inicial", detalle: "Reglas básicas en palabras de uso frecuente." },
  ],
  LE: [
    { etapa: "Fluidez", detalle: "Lectura en voz alta de textos breves, ~50 palabras." },
    { etapa: "Comprensión literal", detalle: "Recuperar quién, qué, dónde, cuándo de un texto." },
    { etapa: "Comprensión inferencial", detalle: "Por qué, para qué, anticipación e hipótesis." },
    { etapa: "Lectura autónoma", detalle: "Leer solos textos cortos y dar cuenta de lo leído." },
  ],
  PE: [
    { etapa: "Dictado al docente", detalle: "Producción colectiva: ellos piensan, el docente escribe." },
    { etapa: "Oración autónoma", detalle: "Escribir una oración propia con sentido completo." },
    { etapa: "Texto breve con plan", detalle: "3-4 oraciones con un plan previo simple." },
    { etapa: "Revisión", detalle: "Releer y mejorar lo escrito con ayuda del grupo." },
  ],
  OR: [
    { etapa: "Renarración", detalle: "Volver a contar un cuento siguiendo la secuencia." },
    { etapa: "Narración organizada", detalle: "Relatar un hecho con inicio, desarrollo y cierre." },
    { etapa: "Descripción oral", detalle: "Describir imágenes, objetos y personajes con detalle." },
    { etapa: "Escucha y turno", detalle: "Escucha activa, esperar el turno y retomar lo dicho." },
  ],
  CL: [
    { etapa: "Vocabulario", detalle: "Palabras nuevas en contexto de lectura." },
    { etapa: "Sinónimos y antónimos", detalle: "Relaciones de significado entre palabras." },
    { etapa: "Familias de palabras", detalle: "Palabras derivadas de una misma raíz." },
    { etapa: "Categorías", detalle: "Reconocer sustantivos, adjetivos y verbos en contexto." },
  ],
}

const COLOR_ESTADO: Record<Estado, string> = {
  green: "#22c55e",
  yellow: "#eab308",
  red: "#ef4444",
  blue: "#94a3b8",
}

type Alumno = { id: string; nombre: string; sala: string }
type Registro = { id: string; alumno_id: string; eje: string; estado: Estado; actividad: string; fecha: string }

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const
type Dia = (typeof DIAS)[number]

type ActividadCronograma = { nombre: string; eje?: EjeKey; origen: "alba" | "docente"; pasarSiguiente?: boolean }
type Cronograma = Record<Dia, ActividadCronograma[]>

// ─────────────────────────────────────────────────────────────────────────────
// Acceso a datos
//  - Alumnos: vía API interna /api/students (la misma que usa jardín)
//  - Guardar evaluación: vía API interna /api/seguimiento (la misma que jardín)
//  - Leer evaluaciones: vía el cliente `supabase` de @/lib/supabase (igual que jardín)
//  No se toca ningún archivo de jardín; sólo se reutiliza su plomería ya probada.
// ─────────────────────────────────────────────────────────────────────────────

// (Las escrituras se hacen vía las APIs internas /api/students y /api/seguimiento,
//  que ya están probadas en jardín y comparten la misma Supabase.)

// ─────────────────────────────────────────────────────────────────────────────
// Motor de análisis — produce RELATO, nunca números
// ─────────────────────────────────────────────────────────────────────────────

type Analisis = {
  relato: string
  observaciones: string[]
  ejeRecomendado: EjeKey
  motivoRecomendacion: string
  alumnosAcompañar: { nombre: string; eje: EjeKey }[]
  ejesTrabajados: EjeKey[]
}

const DIA_MS = 86400000

function diasDesde(fechaISO: string): number {
  return Math.floor((Date.now() - new Date(fechaISO).getTime()) / DIA_MS)
}

function analizarSecuencia(alumnos: Alumno[], registros: Registro[]): Analisis {
  // Sin datos todavía
  if (registros.length === 0) {
    return {
      relato:
        "Todavía no hay registros este cuatrimestre. Cuando empieces a registrar las clases, voy a ir leyendo cómo avanza el grupo y te voy a acompañar para sostener una secuencia equilibrada entre los cinco ejes.",
      observaciones: [],
      ejeRecomendado: "LE",
      motivoRecomendacion:
        "Para arrancar el segundo cuatrimestre, la lectura compartida es un buen punto de reencuentro con el grupo.",
      alumnosAcompañar: [],
      ejesTrabajados: [],
    }
  }

  // Última vez que se trabajó cada eje + calidad reciente (interna, no se muestra)
  const porEje: Record<string, { ultima: number; total: number; recientes: Estado[] }> = {}
  for (const e of EJES) porEje[e.key] = { ultima: Infinity, total: 0, recientes: [] }

  const ordenados = [...registros].sort((a, b) => +new Date(a.fecha) - +new Date(b.fecha))
  for (const r of ordenados) {
    if (!porEje[r.eje]) continue
    porEje[r.eje].total++
    porEje[r.eje].ultima = Math.min(porEje[r.eje].ultima, diasDesde(r.fecha))
  }
  // Estados recientes por eje (últimos registros de cada eje)
  for (const e of EJES) {
    const delEje = ordenados.filter((r) => r.eje === e.key)
    porEje[e.key].recientes = delEje.slice(-Math.max(alumnos.length, 6)).map((r) => r.estado)
  }

  const ejesTrabajados = EJES.filter((e) => porEje[e.key].total > 0).map((e) => e.key)

  // Eje más postergado (mayor cantidad de días sin trabajarse, o nunca trabajado)
  let ejeOlvidado: EjeKey = "LE"
  let maxDias = -1
  for (const e of EJES) {
    const d = porEje[e.key].total === 0 ? 999 : porEje[e.key].ultima
    if (d > maxDias) {
      maxDias = d
      ejeOlvidado = e.key
    }
  }

  // Eje con más dificultad reciente (mayoría de rojos en lo último)
  let ejeDificil: EjeKey | null = null
  let peorRatio = 0
  for (const e of EJES) {
    const rec = porEje[e.key].recientes
    if (rec.length < 3) continue
    const rojos = rec.filter((s) => s === "red").length
    const ratio = rojos / rec.length
    if (ratio > peorRatio && ratio >= 0.4) {
      peorRatio = ratio
      ejeDificil = e.key
    }
  }

  // Calidad general reciente (interna → palabras)
  const ultimos = ordenados.slice(-Math.max(alumnos.length * 2, 10))
  const verdes = ultimos.filter((r) => r.estado === "green").length
  const rojos = ultimos.filter((r) => r.estado === "red").length
  let clima: string
  if (verdes >= ultimos.length * 0.6) clima = "El grupo viene respondiendo bien en lo último que trabajaste."
  else if (rojos >= ultimos.length * 0.4) clima = "En las últimas clases noté que a varios chicos les está costando sostener el ritmo."
  else clima = "El grupo avanza de forma despareja: algunos firmes y otros que necesitan más acompañamiento."

  // Relato de balance de la secuencia
  const nombreOlvidado = EJE(ejeOlvidado).nombre.toLowerCase()
  let balance: string
  if (porEje[ejeOlvidado].total === 0) {
    balance = `Este cuatrimestre todavía no registraste trabajo en ${nombreOlvidado}. Sería bueno darle un lugar para que la secuencia quede completa.`
  } else if (maxDias >= 10) {
    balance = `Hace unas semanas que no trabajás ${nombreOlvidado}. Conviene retomarlo para no perder continuidad.`
  } else {
    balance = "La secuencia entre los cinco ejes viene equilibrada. Buen trabajo sostenido."
  }

  // Decidir recomendación: primero dificultad sostenida, si no, balance
  let ejeRecomendado: EjeKey
  let motivo: string
  if (ejeDificil) {
    ejeRecomendado = ejeDificil
    motivo = `Varios chicos vienen necesitando refuerzo en ${EJE(ejeDificil).nombre.toLowerCase()}. Te propongo volver sobre ese eje antes de avanzar.`
  } else {
    ejeRecomendado = ejeOlvidado
    motivo =
      porEje[ejeOlvidado].total === 0
        ? `Es el eje que aún no aparece en tu secuencia este cuatrimestre.`
        : `Es el eje que hace más tiempo no trabajás. Retomarlo mantiene el equilibrio del año.`
  }

  // Alumnos a acompañar (por nombre, sin números) — último estado rojo por eje
  const acompañar: { nombre: string; eje: EjeKey }[] = []
  for (const al of alumnos) {
    for (const e of EJES) {
      const delAlumno = ordenados.filter((r) => r.alumno_id === al.id && r.eje === e.key)
      if (delAlumno.length === 0) continue
      const ultimos2 = delAlumno.slice(-2)
      if (ultimos2.length >= 2 && ultimos2.every((r) => r.estado === "red")) {
        acompañar.push({ nombre: al.nombre, eje: e.key })
        break // un alumno aparece una sola vez
      }
    }
  }

  const observaciones: string[] = [balance]
  if (ejeDificil) {
    observaciones.push(
      `En ${EJE(ejeDificil).nombre.toLowerCase()} se nota que el grupo todavía no consolidó. Vale la pena bajar un escalón de dificultad antes de seguir.`,
    )
  }
  if (ejesTrabajados.length >= 4) {
    observaciones.push("Estás tocando casi todos los ejes: esa variedad es justo lo que sostiene una buena alfabetización.")
  }

  return {
    relato: clima + " " + balance,
    observaciones,
    ejeRecomendado,
    motivoRecomendacion: motivo,
    alumnosAcompañar: acompañar.slice(0, 8),
    ejesTrabajados,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Persistencia local del cronograma (por sala) — no toca Supabase
//
// Modelo de semana:
//  - Cada cronograma se guarda junto al "lunes" de su semana (semanaInicio, YYYY-MM-DD).
//  - Salas reales (1A/1B/1C): al abrir en una semana nueva, el cronograma viejo se
//    ARCHIVA automáticamente y la grilla aparece en blanco. Las actividades marcadas
//    para "pasar a la semana siguiente" se arrastran al nuevo cronograma.
//  - Sala de prueba: NO se blanquea por fecha. Solo se cierra con el botón manual.
// ─────────────────────────────────────────────────────────────────────────────

function cronogramaVacio(): Cronograma {
  return { Lunes: [], Martes: [], Miércoles: [], Jueves: [], Viernes: [] }
}

// Lunes de la semana actual en formato YYYY-MM-DD
function lunesDeEstaSemana(): string {
  const d = new Date()
  const day = d.getDay() // 0 dom … 6 sab
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const lunes = new Date(d.setDate(diff))
  return lunes.toISOString().split("T")[0]
}

function fmtFechaLarga(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("es-AR", { day: "numeric", month: "long" })
}

type CronoGuardado = { semanaInicio: string; dias: Cronograma }
type SemanaArchivada = { semanaInicio: string; dias: Cronograma; cerrada: string }

const keyCrono = (sala: string) => `alba_primaria_crono_${sala}`
const keyArchivo = (sala: string) => `alba_primaria_archivo_${sala}`

function leerCronoGuardado(sala: string): CronoGuardado | null {
  try {
    const raw = localStorage.getItem(keyCrono(sala))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function escribirCronoGuardado(sala: string, data: CronoGuardado) {
  try {
    localStorage.setItem(keyCrono(sala), JSON.stringify(data))
  } catch {
    /* noop */
  }
}

function leerArchivo(sala: string): SemanaArchivada[] {
  try {
    const raw = localStorage.getItem(keyArchivo(sala))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function archivarSemana(sala: string, semana: CronoGuardado) {
  try {
    const archivo = leerArchivo(sala)
    archivo.unshift({ semanaInicio: semana.semanaInicio, dias: semana.dias, cerrada: new Date().toISOString() })
    localStorage.setItem(keyArchivo(sala), JSON.stringify(archivo.slice(0, 30))) // máx 30 semanas
  } catch {
    /* noop */
  }
}

// Actividades marcadas para pasar a la semana siguiente → arranque del nuevo cronograma
function arrastrarPendientes(dias: Cronograma): Cronograma {
  const nuevo = cronogramaVacio()
  for (const dia of DIAS) {
    for (const act of dias[dia]) {
      if (act.pasarSiguiente) {
        // se reubica el mismo día de la semana nueva, sin la marca
        nuevo[dia].push({ ...act, pasarSiguiente: false })
      }
    }
  }
  return nuevo
}

/**
 * Carga el cronograma vigente.
 * Salas reales: si la semana guardada es anterior a la actual, archiva y blanquea
 * (arrastrando los pendientes). Devuelve { dias, semanaInicio }.
 * Sala de prueba: devuelve siempre lo guardado tal cual (sin cierre por fecha).
 */
function cargarCronogramaVigente(sala: string): { dias: Cronograma; semanaInicio: string } {
  const guardado = leerCronoGuardado(sala)
  const lunesHoy = lunesDeEstaSemana()

  if (!guardado) {
    return { dias: cronogramaVacio(), semanaInicio: sala === SALA_PRUEBA ? "prueba" : lunesHoy }
  }

  // Sala de prueba: nunca cierra por fecha
  if (sala === SALA_PRUEBA) {
    return { dias: { ...cronogramaVacio(), ...guardado.dias }, semanaInicio: guardado.semanaInicio }
  }

  // Salas reales: si cambió la semana, archivar la vieja y blanquear
  if (guardado.semanaInicio !== lunesHoy) {
    archivarSemana(sala, guardado)
    const arrastrado = arrastrarPendientes(guardado.dias)
    const nuevo: CronoGuardado = { semanaInicio: lunesHoy, dias: arrastrado }
    escribirCronoGuardado(sala, nuevo)
    return { dias: arrastrado, semanaInicio: lunesHoy }
  }

  return { dias: { ...cronogramaVacio(), ...guardado.dias }, semanaInicio: guardado.semanaInicio }
}

function persistirCronograma(sala: string, semanaInicio: string, dias: Cronograma) {
  escribirCronoGuardado(sala, { semanaInicio, dias })
}

// Cierre manual (botón) — archiva la semana actual, arrastra pendientes, blanquea
function cerrarCronogramaManual(sala: string, semanaInicio: string, dias: Cronograma): { dias: Cronograma; semanaInicio: string } {
  archivarSemana(sala, { semanaInicio, dias })
  const arrastrado = arrastrarPendientes(dias)
  const nuevaSemana = sala === SALA_PRUEBA ? "prueba" : lunesDeEstaSemana()
  persistirCronograma(sala, nuevaSemana, arrastrado)
  return { dias: arrastrado, semanaInicio: nuevaSemana }
}

// ─────────────────────────────────────────────────────────────────────────────
// Proyectos (por sala, localStorage) — la maestra los crea y los finaliza a mano
// ─────────────────────────────────────────────────────────────────────────────

type Proyecto = {
  id: string
  titulo: string
  objetivo: string
  estado: "activo" | "finalizado"
  creado: string
  finalizado?: string
}

const keyProyectos = (sala: string) => `alba_primaria_proyectos_${sala}`

function leerProyectos(sala: string): Proyecto[] {
  try {
    const raw = localStorage.getItem(keyProyectos(sala))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function guardarProyectos(sala: string, p: Proyecto[]) {
  try {
    localStorage.setItem(keyProyectos(sala), JSON.stringify(p))
  } catch {
    /* noop */
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export default function PrimariaDashboard() {
  const [sala, setSala] = useState(SALAS[0])
  const [showSalas, setShowSalas] = useState(false)
  const [alumnos, setAlumnos] = useState<Alumno[]>([])
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loading, setLoading] = useState(true)

  // Registro del aula
  const [ejeActivo, setEjeActivo] = useState<EjeKey>("LE")
  const [actividadActiva, setActividadActiva] = useState<string>(ACTIVIDADES.LE[0])
  const [excepciones, setExcepciones] = useState<Record<string, Estado>>({})
  const [guardando, setGuardando] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  // Cronograma + sugerencia de ALBA
  const [cronograma, setCronograma] = useState<Cronograma>(cronogramaVacio())
  const [semanaInicio, setSemanaInicio] = useState<string>("")
  const [sugerenciaIdx, setSugerenciaIdx] = useState(0) // para "otra sugerencia"
  const [diaParaCargar, setDiaParaCargar] = useState<Dia>("Lunes")
  const [showCargarManual, setShowCargarManual] = useState(false)
  const [actManualNombre, setActManualNombre] = useState("")
  const [actManualEje, setActManualEje] = useState<EjeKey>("LE")
  const [showArchivo, setShowArchivo] = useState(false)
  const [archivo, setArchivo] = useState<SemanaArchivada[]>([])

  // Proyectos
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [showProyecto, setShowProyecto] = useState(false)
  const [nuevoProyTitulo, setNuevoProyTitulo] = useState("")
  const [nuevoProyObjetivo, setNuevoProyObjetivo] = useState("")

  // Gestión de alumnos
  const [showGestion, setShowGestion] = useState(false)
  const [bulkNombres, setBulkNombres] = useState("")
  const [guardandoBulk, setGuardandoBulk] = useState(false)

  // Tip rotativo
  const [tipIdx, setTipIdx] = useState(0)

  // Secuencia anual
  const [showSecuencia, setShowSecuencia] = useState(false)

  // Diagnóstico (mensaje visible si algo falla al cargar/guardar)
  const [diag, setDiag] = useState<string | null>(null)

  // ── Carga inicial / por sala
  const cargar = useCallback(async () => {
    setLoading(true)
    setDiag(null)
    // Alumnos: usar la API interna de jardín (ya probada y funcionando)
    let als: Alumno[] = []
    try {
      const res = await fetch(`/api/students?sala=${encodeURIComponent(sala)}`)
      const data = await res.json()
      // Aceptar cualquier formato de respuesta conocido
      const lista: any[] = Array.isArray(data)
        ? data
        : data.students || data.alumnos || data.data || []
      als = lista.map((a: any) => ({
        id: a.id,
        nombre: a.nombre ?? a.name ?? "",
        sala: a.sala ?? sala,
      }))
      if (data.error) setDiag(`La base respondió: ${data.error}`)
    } catch (e: any) {
      setDiag(`No se pudo leer la lista de alumnos: ${e?.message || "error de red"}`)
      als = []
    }
    setAlumnos(als)
    if (als.length > 0) {
      // Leer evaluaciones con el mismo cliente supabase que usa jardín
      const ids = als.map((a) => a.id)
      let regs: Registro[] = []
      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from("seguimiento")
            .select("id, alumno_id, eje, estado, actividad, fecha")
            .in("alumno_id", ids)
            .in("eje", ["SE", "LE", "PE", "OR", "CL"])
            .order("fecha", { ascending: true })
          if (error) {
            setDiag(`No se pudieron leer las evaluaciones: ${error.message}`)
          } else {
            regs = (data || []).map((r: any) => ({
              id: r.id,
              alumno_id: r.alumno_id,
              eje: r.eje,
              estado: r.estado,
              actividad: r.actividad ?? "",
              fecha: r.fecha,
            }))
          }
        } catch (e: any) {
          setDiag(`Error leyendo evaluaciones: ${e?.message || "desconocido"}`)
        }
      }
      setRegistros(regs)
    } else {
      setRegistros([])
    }
    const vigente = cargarCronogramaVigente(sala)
    setCronograma(vigente.dias)
    setSemanaInicio(vigente.semanaInicio)
    setArchivo(leerArchivo(sala))
    setProyectos(leerProyectos(sala))
    setLoading(false)
  }, [sala])

  useEffect(() => {
    cargar()
  }, [cargar])

  // ── Análisis (relato)
  const analisis = useMemo(() => analizarSecuencia(alumnos, registros), [alumnos, registros])

  // Sugerencia de actividad: eje recomendado + rotación con "otra sugerencia"
  const sugerencia = useMemo(() => {
    const eje = analisis.ejeRecomendado
    const lista = ACTIVIDADES[eje]
    return { eje, actividad: lista[sugerenciaIdx % lista.length] }
  }, [analisis.ejeRecomendado, sugerenciaIdx])

  // Clase completa (de la biblioteca) que corresponde a la sugerencia
  const claseSugerida = useMemo(
    () => claseporTitulo(sugerencia.eje, sugerencia.actividad),
    [sugerencia.eje, sugerencia.actividad],
  )

  // Al cambiar de eje en el registro, ajustar la actividad
  useEffect(() => {
    setActividadActiva(ACTIVIDADES[ejeActivo][0])
  }, [ejeActivo])


  async function guardarRegistro() {
    if (alumnos.length === 0) return
    setGuardando(true)
    for (const al of alumnos) {
      const estado: Estado = excepciones[al.id] || "green"
      try {
        await fetch("/api/seguimiento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ alumno_id: al.id, eje: ejeActivo, estado, sala, actividad: actividadActiva }),
        })
      } catch {
        /* sin conexión: continúa */
      }
    }
    setExcepciones({})
    setToast("Clase registrada. ALBA ya actualizó su lectura del grupo.")
    setTimeout(() => setToast(null), 3500)
    await cargar()
    setGuardando(false)
  }

  // ── Cronograma: aceptar sugerencia ALBA
  function aceptarSugerencia() {
    setCronograma((prev) => {
      const next = { ...prev, [diaParaCargar]: [...prev[diaParaCargar], { nombre: sugerencia.actividad, eje: sugerencia.eje, origen: "alba" as const }] }
      persistirCronograma(sala, semanaInicio, next)
      return next
    })
    setToast(`Sumé la sugerencia al ${diaParaCargar}.`)
    setTimeout(() => setToast(null), 2500)
    setSugerenciaIdx((i) => i + 1)
  }

  function otraSugerencia() {
    setSugerenciaIdx((i) => i + 1)
  }

  function agregarManual() {
    if (!actManualNombre.trim()) return
    setCronograma((prev) => {
      const next = {
        ...prev,
        [diaParaCargar]: [...prev[diaParaCargar], { nombre: actManualNombre.trim(), eje: actManualEje, origen: "docente" as const }],
      }
      persistirCronograma(sala, semanaInicio, next)
      return next
    })
    setActManualNombre("")
    setShowCargarManual(false)
  }

  function quitarActividad(dia: Dia, idx: number) {
    setCronograma((prev) => {
      const next = { ...prev, [dia]: prev[dia].filter((_, i) => i !== idx) }
      persistirCronograma(sala, semanaInicio, next)
      return next
    })
  }

  // Marcar/desmarcar una actividad para que pase a la semana siguiente
  function togglePasarSiguiente(dia: Dia, idx: number) {
    setCronograma((prev) => {
      const next = {
        ...prev,
        [dia]: prev[dia].map((a, i) => (i === idx ? { ...a, pasarSiguiente: !a.pasarSiguiente } : a)),
      }
      persistirCronograma(sala, semanaInicio, next)
      return next
    })
  }

  // Cierre manual del cronograma: archiva, arrastra pendientes, blanquea
  function finalizarCronograma() {
    const pendientes = DIAS.reduce((acc, d) => acc + cronograma[d].filter((a) => a.pasarSiguiente).length, 0)
    const { dias, semanaInicio: nueva } = cerrarCronogramaManual(sala, semanaInicio, cronograma)
    setCronograma(dias)
    setSemanaInicio(nueva)
    setArchivo(leerArchivo(sala))
    setToast(pendientes > 0 ? `Semana cerrada. Pasé ${pendientes} actividad(es) a la nueva.` : "Semana cerrada y archivada. Cronograma en blanco.")
    setTimeout(() => setToast(null), 3500)
  }

  // ── Proyectos
  function crearProyecto() {
    if (!nuevoProyTitulo.trim()) return
    const p: Proyecto = {
      id: `${Date.now()}`,
      titulo: nuevoProyTitulo.trim(),
      objetivo: nuevoProyObjetivo.trim(),
      estado: "activo",
      creado: new Date().toISOString(),
    }
    const next = [p, ...proyectos]
    setProyectos(next)
    guardarProyectos(sala, next)
    setNuevoProyTitulo("")
    setNuevoProyObjetivo("")
    setShowProyecto(false)
  }

  function finalizarProyecto(id: string) {
    const next = proyectos.map((p) => (p.id === id ? { ...p, estado: "finalizado" as const, finalizado: new Date().toISOString() } : p))
    setProyectos(next)
    guardarProyectos(sala, next)
  }

  function eliminarProyecto(id: string) {
    const next = proyectos.filter((p) => p.id !== id)
    setProyectos(next)
    guardarProyectos(sala, next)
  }

  const proyectoActivo = proyectos.find((p) => p.estado === "activo") || null

  // ── Alta de alumnos (vía API interna de jardín, ya probada)
  async function guardarAlumnos() {
    const nombres = bulkNombres
      .split("\n")
      .map((n) => n.trim().toUpperCase())
      .filter(Boolean)
    if (nombres.length === 0) return
    setGuardandoBulk(true)
    let errorMsg: string | null = null
    let ok = 0
    for (const nombre of nombres) {
      try {
        const res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, sala }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok || data.error) {
          errorMsg = data.error || `La base rechazó "${nombre}" (HTTP ${res.status})`
        } else {
          ok++
        }
      } catch (e: any) {
        errorMsg = e?.message || "error de red al guardar"
      }
    }
    setBulkNombres("")
    setShowGestion(false)
    setGuardandoBulk(false)
    if (errorMsg && ok === 0) {
      setDiag(`No se pudieron guardar los alumnos. ${errorMsg}`)
    }
    await cargar()
  }

  const tipsEje = TIPS[ejeActivo]

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 28, height: 28, border: "3px solid #e2e8f0", borderTopColor: NAVY, borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.9s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <p style={{ fontSize: 13, color: "#64748b" }}>Cargando primer grado…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif", color: "#0f172a" }}>
      {/* ── Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: `linear-gradient(90deg, ${NAVY}, #244a73, ${NAVY})`, color: "#fff", padding: "12px 18px" }}>
        <div style={{ maxWidth: 880, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "Georgia, serif", fontSize: 20 }}>
                <span style={{ color: ORANGE, fontWeight: 700 }}>A</span>
              </span>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.3 }}>ALBA · Primer Grado</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Alfabetización · Segundo cuatrimestre</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="/" style={{ padding: "7px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, textDecoration: "none", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.25)" }}>
              Jardín
            </a>
            <button onClick={() => setShowSecuencia(true)} style={{ padding: "7px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "rgba(212,135,14,0.18)", color: ORANGE, border: `1px solid ${ORANGE}66`, cursor: "pointer" }}>
              Secuencia anual
            </button>
            <button onClick={() => setShowGestion(true)} style={{ padding: "7px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer" }}>
              Gestionar grado
            </button>
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowSalas((s) => !s)} style={{ padding: "7px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: ORANGE, color: "#fff", border: "none", cursor: "pointer" }}>
                {sala} ▾
              </button>
              {showSalas && (
                <div style={{ position: "absolute", right: 0, top: "110%", background: "#fff", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.15)", overflow: "hidden", minWidth: 150 }}>
                  {SALAS.map((s) => (
                    <button key={s} onClick={() => { setSala(s); setShowSalas(false) }} style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 16px", fontSize: 13, border: "none", background: s === sala ? "#f1f5f9" : "#fff", color: NAVY, cursor: "pointer" }}>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 880, margin: "0 auto", padding: 18, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Banner de diagnóstico (solo aparece si algo falla) */}
        {diag && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#b91c1c", marginBottom: 2 }}>Aviso técnico</div>
              <div style={{ fontSize: 12, color: "#7f1d1d", lineHeight: 1.5 }}>{diag}</div>
            </div>
            <button onClick={() => setDiag(null)} style={{ background: "transparent", border: "none", color: "#b91c1c", fontSize: 16, cursor: "pointer" }}>×</button>
          </div>
        )}

        {alumnos.length === 0 ? (
          // ── Estado vacío
          <section style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 32, textAlign: "center" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Este grado todavía no tiene alumnos</h2>
            <p style={{ fontSize: 14, color: "#64748b", marginBottom: 20, maxWidth: 420, marginInline: "auto" }}>
              Cargá la lista de {sala} para que ALBA empiece a acompañar la secuencia de alfabetización del grupo.
            </p>
            <button onClick={() => setShowGestion(true)} style={{ padding: "12px 24px", borderRadius: 12, background: NAVY, color: "#fff", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>
              Cargar alumnos
            </button>
          </section>
        ) : (
          <>
            {/* ── Cronograma semanal */}
            <section style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden" }}>
              <div style={{ padding: "10px 18px", background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Cronograma semanal — {sala}</div>
                  <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.7)" }}>
                    {sala === SALA_PRUEBA
                      ? "Sala de prueba · se cierra solo con el botón Finalizar"
                      : semanaInicio && semanaInicio !== "prueba"
                      ? `Semana del ${fmtFechaLarga(semanaInicio)} · se renueva sola el lunes`
                      : "Semana en curso"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {archivo.length > 0 && (
                    <button onClick={() => setShowArchivo(true)} style={{ padding: "6px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "rgba(255,255,255,0.12)", color: "#fff", border: "1px solid rgba(255,255,255,0.25)", cursor: "pointer" }}>
                      Semanas archivadas ({archivo.length})
                    </button>
                  )}
                  <button onClick={finalizarCronograma} style={{ padding: "6px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: ORANGE, color: "#fff", border: "none", cursor: "pointer" }}>
                    Finalizar cronograma
                  </button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", borderTop: "1px solid #e2e8f0" }}>
                {DIAS.map((dia) => (
                  <div key={dia} style={{ borderRight: "1px solid #f1f5f9", minHeight: 130, display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "8px 6px", textAlign: "center", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", fontSize: 11, fontWeight: 700, color: "#475569" }}>
                      {dia.slice(0, 3).toUpperCase()}
                    </div>
                    <div style={{ padding: 6, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                      {cronograma[dia].length === 0 ? (
                        <div style={{ fontSize: 10, color: "#cbd5e1", textAlign: "center", marginTop: 16 }}>—</div>
                      ) : (
                        cronograma[dia].map((act, i) => {
                          const c = act.eje ? EJE(act.eje) : null
                          return (
                            <div key={i} style={{ position: "relative", background: act.pasarSiguiente ? "#fff7ed" : c ? c.bg : "#f8fafc", border: `1px solid ${act.pasarSiguiente ? ORANGE + "66" : c ? c.color + "33" : "#e2e8f0"}`, borderRadius: 8, padding: "6px 6px 22px 8px" }}>
                              <div style={{ fontSize: 8, fontWeight: 700, color: act.origen === "alba" ? (c?.color || ORANGE) : "#94a3b8", letterSpacing: 0.5, marginBottom: 2 }}>
                                {act.origen === "alba" ? "ALBA" : "DOCENTE"}
                              </div>
                              <div style={{ fontSize: 10.5, fontWeight: 600, color: "#334155", lineHeight: 1.3, paddingRight: 12 }}>{act.nombre}</div>
                              <button onClick={() => quitarActividad(dia, i)} title="Quitar" style={{ position: "absolute", top: 4, right: 4, width: 16, height: 16, borderRadius: "50%", border: "none", background: "transparent", color: "#94a3b8", fontSize: 12, cursor: "pointer", lineHeight: 1 }}>×</button>
                              {/* Botón: pasar a la semana siguiente */}
                              <button
                                onClick={() => togglePasarSiguiente(dia, i)}
                                title={act.pasarSiguiente ? "No pasar a la semana siguiente" : "Pasar a la semana siguiente"}
                                style={{ position: "absolute", bottom: 4, left: 8, fontSize: 8.5, fontWeight: 700, color: act.pasarSiguiente ? ORANGE : "#cbd5e1", background: "transparent", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 2 }}
                              >
                                {act.pasarSiguiente ? "↪ pasa a la próxima" : "↪ pasar"}
                              </button>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "8px 14px", borderTop: "1px solid #f1f5f9", fontSize: 10.5, color: "#94a3b8" }}>
                Tocá <span style={{ color: ORANGE, fontWeight: 700 }}>↪ pasar</span> en una actividad para que se arrastre a la semana siguiente si te queda pendiente. Al finalizar, lo demás se archiva y la grilla queda en blanco.
              </div>
            </section>

            {/* ── Relato de ALBA (lo que ve, en palabras) */}
            <section style={{ background: "#fff", borderRadius: 16, border: `1px solid ${ORANGE}33`, overflow: "hidden" }}>
              <div style={{ padding: "10px 18px", background: "#fffaf2", borderBottom: `1px solid ${ORANGE}22`, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: ORANGE, letterSpacing: 1.5 }}>ALBA · LO QUE VEO HOY</span>
              </div>
              <div style={{ padding: 18 }}>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: "#1e293b", marginBottom: analisis.observaciones.length ? 14 : 0 }}>
                  {analisis.relato}
                </p>
                {analisis.observaciones.length > 1 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {analisis.observaciones.slice(1).map((o, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: ORANGE, marginTop: 7, flexShrink: 0 }} />
                        <span style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.55 }}>{o}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* ── Sugerencia de ALBA: aceptar / otra / manual */}
            <section style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>La clase que ALBA propone para hoy</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b" }}>
                  <span>Cargar en:</span>
                  <select value={diaParaCargar} onChange={(e) => setDiaParaCargar(e.target.value as Dia)} style={{ padding: "4px 8px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12, color: NAVY }}>
                    {DIAS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ background: EJE(sugerencia.eje).bg, border: `1px solid ${EJE(sugerencia.eje).color}33`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: EJE(sugerencia.eje).color, letterSpacing: 1, marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span>{EJE(sugerencia.eje).nombre.toUpperCase()}</span>
                  {claseSugerida && <span style={{ fontWeight: 600, opacity: 0.8 }}>⏱ {claseSugerida.duracion}</span>}
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 6 }}>{sugerencia.actividad}</p>
                <p style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.5, marginBottom: claseSugerida ? 14 : 0 }}>{analisis.motivoRecomendacion}</p>

                {claseSugerida && (
                  <>
                    {/* Qué aprenden los chicos */}
                    <div style={{ background: "#fff", borderRadius: 10, padding: 12, marginBottom: 10, border: `1px solid ${EJE(sugerencia.eje).color}22` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: EJE(sugerencia.eje).color, letterSpacing: 0.5, marginBottom: 4 }}>QUÉ APRENDEN LOS CHICOS</div>
                      <p style={{ fontSize: 13, color: "#334155", lineHeight: 1.5, marginBottom: 8 }}>{claseSugerida.aprenden}</p>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: 0.5, marginBottom: 2 }}>OBJETIVO</div>
                      <p style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.5 }}>{claseSugerida.objetivo}</p>
                    </div>

                    {/* Desarrollo de la clase */}
                    <div style={{ background: "#fff", borderRadius: 10, padding: 12, marginBottom: 10, border: `1px solid ${EJE(sugerencia.eje).color}22` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: EJE(sugerencia.eje).color, letterSpacing: 0.5, marginBottom: 8 }}>CÓMO DARLA, PASO A PASO</div>
                      <ol style={{ margin: 0, paddingLeft: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                        {claseSugerida.desarrollo.map((paso, i) => (
                          <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: "50%", background: EJE(sugerencia.eje).color, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
                            <span style={{ fontSize: 12.5, color: "#475569", lineHeight: 1.5 }}>{paso}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Recursos */}
                    <div style={{ background: "#fff", borderRadius: 10, padding: 12, border: `1px solid ${EJE(sugerencia.eje).color}22` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: EJE(sugerencia.eje).color, letterSpacing: 0.5, marginBottom: 6 }}>RECURSOS Y MATERIALES</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {claseSugerida.recursos.map((r, i) => (
                          <span key={i} style={{ fontSize: 11.5, color: "#475569", background: EJE(sugerencia.eje).bg, border: `1px solid ${EJE(sugerencia.eje).color}33`, borderRadius: 999, padding: "4px 12px" }}>{r}</span>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <button onClick={aceptarSugerencia} style={{ flex: 1, minWidth: 130, padding: "11px", borderRadius: 10, background: NAVY, color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                  Aceptar y sumar
                </button>
                <button onClick={otraSugerencia} style={{ flex: 1, minWidth: 130, padding: "11px", borderRadius: 10, background: "#fff", color: NAVY, border: `1.5px solid ${NAVY}`, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  Proponer otra
                </button>
                <button onClick={() => { setActManualEje(ejeActivo); setShowCargarManual(true) }} style={{ flex: 1, minWidth: 130, padding: "11px", borderRadius: 10, background: "#fff", color: "#64748b", border: "1px solid #e2e8f0", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                  Cargar la mía
                </button>
              </div>
            </section>

            {/* ── Proyectos */}
            <section style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Proyectos</h3>
                {!proyectoActivo && (
                  <button onClick={() => setShowProyecto(true)} style={{ padding: "7px 14px", borderRadius: 999, fontSize: 12, fontWeight: 600, background: NAVY, color: "#fff", border: "none", cursor: "pointer" }}>
                    + Nuevo proyecto
                  </button>
                )}
              </div>

              {proyectos.length === 0 ? (
                <p style={{ fontSize: 13, color: "#94a3b8" }}>Todavía no hay proyectos. Creá uno para acompañar una unidad de trabajo larga.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {proyectos.map((p) => (
                    <div key={p.id} style={{ borderRadius: 12, border: `1px solid ${p.estado === "activo" ? NAVY + "33" : "#e2e8f0"}`, background: p.estado === "activo" ? "#f8fafc" : "#fff", padding: 14 }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{p.titulo}</span>
                            {p.estado === "activo" ? (
                              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: NAVY, color: "#fff", letterSpacing: 0.5 }}>ACTIVO</span>
                            ) : (
                              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#dcfce7", color: "#16a34a", letterSpacing: 0.5 }}>FINALIZADO</span>
                            )}
                          </div>
                          {p.objetivo && <p style={{ fontSize: 12.5, color: "#64748b", lineHeight: 1.5 }}>{p.objetivo}</p>}
                          <p style={{ fontSize: 10.5, color: "#cbd5e1", marginTop: 4 }}>
                            {p.estado === "activo" ? `Desde ${fmtFechaLarga(p.creado.split("T")[0])}` : `${fmtFechaLarga(p.creado.split("T")[0])} — ${p.finalizado ? fmtFechaLarga(p.finalizado.split("T")[0]) : ""}`}
                          </p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          {p.estado === "activo" && (
                            <button onClick={() => finalizarProyecto(p.id)} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: "#dcfce7", color: "#16a34a", border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                              Finalizar
                            </button>
                          )}
                          <button onClick={() => eliminarProyecto(p.id)} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 500, background: "transparent", color: "#94a3b8", border: "1px solid #e2e8f0", cursor: "pointer" }}>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Registro del aula (formato jardín: botones de color visibles) */}
            <section style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Registro del aula</h3>
                {Object.keys(excepciones).length > 0 && (
                  <button onClick={() => setExcepciones({})} style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", border: "none", borderRadius: 8, padding: "5px 10px", cursor: "pointer" }}>
                    ↺ Reiniciar
                  </button>
                )}
              </div>

              {/* Selector de eje */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                {EJES.map((e) => {
                  const activo = ejeActivo === e.key
                  return (
                    <button key={e.key} onClick={() => setEjeActivo(e.key)} style={{ padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: activo ? 700 : 500, background: activo ? e.color : "#f8fafc", color: activo ? "#fff" : "#64748b", border: `1px solid ${activo ? e.color : "#e2e8f0"}`, cursor: "pointer" }}>
                      {e.corto}
                    </button>
                  )
                })}
              </div>

              {/* Banner actividad del día */}
              <div style={{ borderRadius: 12, padding: 14, marginBottom: 12, background: EJE(ejeActivo).color, color: "#fff" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, opacity: 0.85, marginBottom: 4 }}>ACTIVIDAD QUE SE REGISTRA</div>
                <select value={actividadActiva} onChange={(e) => setActividadActiva(e.target.value)} style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 600, color: "#1e293b", background: "rgba(255,255,255,0.95)" }}>
                  {ACTIVIDADES[ejeActivo].map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              {/* Instrucción */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, marginBottom: 12 }}>
                <p style={{ fontSize: 11.5, color: "#64748b", lineHeight: 1.5 }}>
                  Marcá solo a los que están <strong>en proceso, en refuerzo o ausentes</strong>. Al registrar, los que no marcaste quedan como <strong style={{ color: "#16a34a" }}>logrado</strong>.
                </p>
              </div>

              {/* Filas de alumnos — botones de color visibles (formato jardín) */}
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                {alumnos.map((al) => {
                  const estado = excepciones[al.id] || null
                  const colorActual = estado ? COLOR_ESTADO[estado] : "#94a3b8"
                  const bgFila = estado ? COLOR_ESTADO[estado] + "12" : "#f8fafc"
                  return (
                    <li key={al.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, background: bgFila, border: `2px solid ${colorActual}30` }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: colorActual, flexShrink: 0 }} />
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{al.nombre}</span>

                      {estado && estado !== "green" && (
                        <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: colorActual, color: "#fff", marginRight: 2 }}>
                          {estado === "yellow" ? "En proceso" : estado === "red" ? "Refuerzo" : "Ausente"}
                        </span>
                      )}

                      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                        {([
                          { v: "yellow" as Estado, label: "En proceso", on: "#fbbf24", off: "#fef3c7", offText: "#d97706" },
                          { v: "red" as Estado, label: "Refuerzo", on: "#ef4444", off: "#fee2e2", offText: "#ef4444" },
                          { v: "blue" as Estado, label: "Ausente", on: "#6366f1", off: "#e0e7ff", offText: "#6366f1" },
                        ]).map((opt) => {
                          const elegido = estado === opt.v
                          return (
                            <button
                              key={opt.v}
                              onClick={() => setExcepciones((prev) => {
                                const next = { ...prev }
                                if (prev[al.id] === opt.v) delete next[al.id]
                                else next[al.id] = opt.v
                                return next
                              })}
                              title={opt.label}
                              style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${elegido ? opt.on : opt.off}`, background: elegido ? opt.on : opt.off, color: elegido ? "#fff" : opt.offText, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              {opt.v === "yellow" ? "◐" : opt.v === "red" ? "!" : "✕"}
                            </button>
                          )
                        })}
                        {estado && (
                          <button onClick={() => setExcepciones((prev) => { const n = { ...prev }; delete n[al.id]; return n })} title="Volver a logrado" style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #bbf7d0", background: "#dcfce7", color: "#16a34a", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>✓</button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>

              <button onClick={guardarRegistro} disabled={guardando} style={{ width: "100%", marginTop: 14, padding: "13px", borderRadius: 12, background: guardando ? "#94a3b8" : NAVY, color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: guardando ? "default" : "pointer" }}>
                {guardando ? "Guardando…" : "Registrar clase"}
              </button>
            </section>

            {/* ── Alumnos para acompañar (narrativo, por nombre, sin números) */}
            {analisis.alumnosAcompañar.length > 0 && (
              <section style={{ background: "#fff", borderRadius: 16, border: "1px solid #fecaca", padding: 18 }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#b91c1c", marginBottom: 6 }}>Para acompañar de cerca</h3>
                <p style={{ fontSize: 12.5, color: "#64748b", marginBottom: 12, lineHeight: 1.5 }}>
                  Estos chicos vienen necesitando refuerzo sostenido. No es urgencia: es una invitación a dedicarles un momento extra en el eje que les cuesta.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {analisis.alumnosAcompañar.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#fef2f2", borderRadius: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", flex: 1 }}>{a.nombre}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: EJE(a.eje).color, background: EJE(a.eje).bg, padding: "3px 10px", borderRadius: 999 }}>
                        {EJE(a.eje).nombre}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Tips / capacitación just-in-time */}
            <section style={{ background: EJE(ejeActivo).bg, borderRadius: 16, border: `1px solid ${EJE(ejeActivo).color}33`, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: EJE(ejeActivo).color }}>
                  Para enseñar {EJE(ejeActivo).nombre.toLowerCase()}
                </h3>
                {tipsEje.length > 1 && (
                  <button onClick={() => setTipIdx((i) => (i + 1) % tipsEje.length)} style={{ fontSize: 11, color: EJE(ejeActivo).color, background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}>
                    Otro tip →
                  </button>
                )}
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "#334155" }}>{tipsEje[tipIdx % tipsEje.length]}</p>
            </section>
          </>
        )}
      </main>

      <footer style={{ padding: "16px", textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
        ALBA · Primer Grado · Acompañando la secuencia de alfabetización
      </footer>

      {/* ── Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: NAVY, color: "#fff", padding: "12px 20px", borderRadius: 999, fontSize: 13, fontWeight: 600, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 60 }}>
          {toast}
        </div>
      )}

      {/* ── Modal cargar actividad manual */}
      {showCargarManual && (
        <div onClick={() => setShowCargarManual(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 70 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, maxWidth: 420, width: "100%", padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 14 }}>Cargar mi actividad</h3>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Eje</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {EJES.map((e) => (
                <button key={e.key} onClick={() => setActManualEje(e.key)} style={{ padding: "6px 10px", borderRadius: 8, fontSize: 11, fontWeight: actManualEje === e.key ? 700 : 500, background: actManualEje === e.key ? e.color : "#f8fafc", color: actManualEje === e.key ? "#fff" : "#64748b", border: `1px solid ${actManualEje === e.key ? e.color : "#e2e8f0"}`, cursor: "pointer" }}>
                  {e.corto}
                </button>
              ))}
            </div>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Actividad</label>
            <textarea value={actManualNombre} onChange={(e) => setActManualNombre(e.target.value)} placeholder="Ej: Lectura del cuento de la unidad y conversación grupal" style={{ width: "100%", height: 80, padding: 10, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, resize: "none", marginBottom: 14, fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowCargarManual(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, background: "#f1f5f9", color: "#64748b", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              <button onClick={agregarManual} style={{ flex: 1, padding: "11px", borderRadius: 10, background: NAVY, color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Sumar al {diaParaCargar}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal gestión de alumnos */}
      {showGestion && (
        <div onClick={() => setShowGestion(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 70 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, maxWidth: 420, width: "100%", padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Gestionar {sala}</h3>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 14 }}>{alumnos.length} alumnos cargados</p>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Cargar lista (un nombre por línea)</label>
            <textarea value={bulkNombres} onChange={(e) => setBulkNombres(e.target.value)} placeholder={"SOFÍA GARCÍA\nMARTÍN LÓPEZ\nLUCÍA FERNÁNDEZ"} style={{ width: "100%", height: 140, padding: 10, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, resize: "none", marginBottom: 14, fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowGestion(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, background: "#f1f5f9", color: "#64748b", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cerrar</button>
              <button onClick={guardarAlumnos} disabled={guardandoBulk || !bulkNombres.trim()} style={{ flex: 1, padding: "11px", borderRadius: 10, background: guardandoBulk ? "#94a3b8" : NAVY, color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                {guardandoBulk ? "Guardando…" : `Cargar (${bulkNombres.split("\n").filter((n) => n.trim()).length})`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal secuencia anual (recorrido por mes + secuencia por eje) */}
      {showSecuencia && (
        <div onClick={() => setShowSecuencia(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 70 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, maxWidth: 560, width: "100%", maxHeight: "88vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 20px", background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>Secuencia anual · Primer grado</h3>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>El recorrido de los cinco ejes hasta fin de año</p>
              </div>
              <button onClick={() => setShowSecuencia(false)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: "rgba(255,255,255,0.18)", color: "#fff", fontSize: 16, cursor: "pointer" }}>×</button>
            </div>

            <div style={{ overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 22 }}>

              {/* Parte 1: recorrido por mes */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE, letterSpacing: 1, marginBottom: 12 }}>RECORRIDO MES A MES</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {RECORRIDO_MENSUAL.map((m, i) => (
                    <div key={m.mes} style={{ display: "flex", gap: 12 }}>
                      {/* línea de tiempo */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: NAVY, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>
                          {m.mes.slice(0, 3)}
                        </div>
                        {i < RECORRIDO_MENSUAL.length - 1 && <div style={{ width: 2, flex: 1, background: "#e2e8f0", marginTop: 2 }} />}
                      </div>
                      <div style={{ flex: 1, paddingBottom: 6 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1e293b", marginBottom: 2 }}>{m.titulo}</div>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 5 }}>
                          {m.foco.map((k) => (
                            <span key={k} style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: EJE(k).bg, color: EJE(k).color }}>
                              {EJE(k).corto}
                            </span>
                          ))}
                        </div>
                        <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.5 }}>{m.detalle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Parte 2: secuencia por eje */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE, letterSpacing: 1, marginBottom: 12 }}>SECUENCIA POR EJE</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {EJES.map((e) => (
                    <div key={e.key} style={{ borderRadius: 12, border: `1px solid ${e.color}33`, overflow: "hidden" }}>
                      <div style={{ padding: "8px 14px", background: e.bg, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 22, height: 22, borderRadius: 6, background: e.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700 }}>{e.key}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: e.color }}>{e.nombre}</span>
                      </div>
                      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 2 }}>
                        {SECUENCIA_EJE[e.key].map((paso, idx) => (
                          <div key={idx} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "6px 0", borderBottom: idx < SECUENCIA_EJE[e.key].length - 1 ? "1px solid #f1f5f9" : "none" }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: e.color, background: e.bg, width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{idx + 1}</span>
                            <div>
                              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#334155" }}>{paso.etapa}</div>
                              <div style={{ fontSize: 11.5, color: "#94a3b8", lineHeight: 1.4 }}>{paso.detalle}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p style={{ fontSize: 11, color: "#cbd5e1", textAlign: "center", lineHeight: 1.5 }}>
                Esta es la secuencia sugerida. ALBA la usa para proponerte actividades, pero vos decidís el ritmo según cómo responde el grupo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal nuevo proyecto */}
      {showProyecto && (
        <div onClick={() => setShowProyecto(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 70 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, maxWidth: 420, width: "100%", padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 14 }}>Nuevo proyecto</h3>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Título</label>
            <input value={nuevoProyTitulo} onChange={(e) => setNuevoProyTitulo(e.target.value)} placeholder="Ej: El barrio donde vivimos" style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, marginBottom: 14, fontFamily: "inherit" }} />
            <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>Objetivo general</label>
            <textarea value={nuevoProyObjetivo} onChange={(e) => setNuevoProyObjetivo(e.target.value)} placeholder="¿Qué se busca lograr con este proyecto?" style={{ width: "100%", height: 80, padding: 10, borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, resize: "none", marginBottom: 14, fontFamily: "inherit" }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setShowProyecto(false)} style={{ flex: 1, padding: "11px", borderRadius: 10, background: "#f1f5f9", color: "#64748b", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Cancelar</button>
              <button onClick={crearProyecto} disabled={!nuevoProyTitulo.trim()} style={{ flex: 1, padding: "11px", borderRadius: 10, background: nuevoProyTitulo.trim() ? NAVY : "#94a3b8", color: "#fff", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Crear proyecto</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal semanas archivadas */}
      {showArchivo && (
        <div onClick={() => setShowArchivo(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 70 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, maxWidth: 480, width: "100%", maxHeight: "82vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: 18, borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>Semanas archivadas</h3>
              <button onClick={() => setShowArchivo(false)} style={{ width: 30, height: 30, borderRadius: "50%", border: "none", background: "#f1f5f9", color: "#64748b", fontSize: 16, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ padding: 18, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
              {archivo.length === 0 ? (
                <p style={{ fontSize: 13, color: "#94a3b8", textAlign: "center" }}>Todavía no hay semanas archivadas.</p>
              ) : (
                archivo.map((sem, idx) => {
                  const total = DIAS.reduce((acc, d) => acc + (sem.dias[d]?.length || 0), 0)
                  return (
                    <div key={idx} style={{ borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                      <div style={{ padding: "8px 14px", background: "#f8fafc", fontSize: 12.5, fontWeight: 700, color: NAVY }}>
                        Semana del {sem.semanaInicio === "prueba" ? "prueba" : fmtFechaLarga(sem.semanaInicio)}
                        <span style={{ fontWeight: 400, color: "#94a3b8" }}> · {total} actividad{total !== 1 ? "es" : ""}</span>
                      </div>
                      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                        {DIAS.map((d) => {
                          const acts = sem.dias[d] || []
                          if (acts.length === 0) return null
                          return (
                            <div key={d}>
                              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#94a3b8", marginBottom: 3 }}>{d.toUpperCase()}</div>
                              {acts.map((a, i) => {
                                const c = a.eje ? EJE(a.eje) : null
                                return (
                                  <div key={i} style={{ fontSize: 12, color: "#475569", paddingLeft: 8, borderLeft: `2px solid ${c ? c.color : "#cbd5e1"}`, marginBottom: 3 }}>
                                    {a.nombre}
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
