"use client"

import { useState, useEffect, useRef } from "react"
import { RefreshCw, Lightbulb } from "lucide-react"
import Image from "next/image"

// Consejos especificos por ACTIVIDAD (no solo por eje)
// Mapea titulo de actividad a consejos especificos
const CONSEJOS_POR_ACTIVIDAD: Record<string, string[]> = {
  // ═══════════════════════════════════════════════════════════════════════════
  // CONCIENCIA FONOLOGICA - Actividades especificas
  // ═══════════════════════════════════════════════════════════════════════════
  "Sonidos del entorno": [
    "Hola! Hoy trabajamos con sonidos del entorno. Empeza con sonidos bien distintos: una campana, palmas, un silbato. Preguntales: Que escucharon? De donde vino ese sonido?",
    "Un tip que funciona barbaro: cerra los ojos con ellos y hace un sonido. Que adivinen que es. Les encanta el misterio y aprenden a escuchar con atencion.",
    "Usa sonidos de la vida cotidiana: el timbre, la lluvia, un auto. Despues podes grabarlos y hacer un juego de memoria auditiva.",
    "Acorda que el objetivo es que distingan sonidos, no que los nombren perfecto. Si dicen 'hace ding' en vez de 'campana', esta barbaro.",
    "Proba llevar objetos que suenen distinto: llaves, papel arrugado, una botella con arroz. Los chicos pueden explorar y comparar los sonidos."
  ],
  "Rimas con nombres": [
    "Hola! Las rimas con nombres son geniales porque cada nene se siente protagonista. Maria-sandia, Juan-pan. Buscalas antes para tener opciones.",
    "Si un nombre es dificil de rimar, inventalo! Los nenes se rien mucho con rimas graciosas como 'Valentina-mandarina' o 'Santiago-tiene un gato'.",
    "Hace una ronda: cada nene dice su nombre y entre todos buscamos algo que rime. No importa si es disparatado, lo importante es el sonido.",
    "Un tip: usa una pelota. El que la tiene dice su nombre, la tira a otro que tiene que decir la rima. Movimiento + sonido = aprendizaje.",
    "Arma un cartel con los nombres y sus rimas. Lo pueden decorar y queda para el aula. Cada vez que pasan lo leen y repiten."
  ],
  "Separacion en silabas": [
    "Hola! Las silabas se sienten mejor con el cuerpo. Una palmada por silaba: MA-RI-PO-SA. Cuatro palmadas, cuatro silabas.",
    "Empeza con palabras cortas de 2 silabas: ME-SA, SI-LLA, CA-SA. Despues vas subiendo la dificultad con palabras mas largas.",
    "Un juego que funciona: saltar en el lugar una vez por silaba. E-LE-FAN-TE = cuatro saltos. Los nenes gastan energia y aprenden.",
    "Usa nombres de los chicos para contar silabas. MAR-TI-NA tiene 3, ANA tiene 2. Se enganchan porque es sobre ellos.",
    "Acorda que no importa si se equivocan al principio. Lo importante es que entiendan que las palabras se pueden 'cortar' en pedacitos."
  ],
  "Sonido inicial /m/": [
    "Hola! La M es perfecta para empezar porque se puede alargar: Mmmmmmanzana. Hace que los nenes sientan como vibran los labios.",
    "Junta objetos que empiecen con M: muneco, mochila, manzana, moneda. Ponelos en una caja misteriosa y que saquen de a uno diciendo Mmmmm...",
    "Un tip: dibuja una M grande y pegale fotos de cosas que empiezan con M. Los nenes pueden traer recortes de casa.",
    "Hace el sonido exagerado: MMMMMMesa, MMMMMama. Que te imiten. Es como un juego de hacer ruiditos graciosos.",
    "Canta canciones que repitan la M: 'Mi mama me mima'. La repeticion y la musica ayudan a fijar el sonido."
  ],
  "Sonido inicial /s/": [
    "Hola! La S es como el sonido de la serpiente: Sssssss. A los chicos les encanta hacer de vibora mientras practican.",
    "Busca palabras que los nenes conozcan: sol, silla, sopa, sapo. Alargas el sonido: Sssssol, Ssssilla. Que escuchen como suena.",
    "Un juego divertido: 'La serpiente dice'. Solo pueden moverse cuando decis palabras con S. Si decis 'mesa' (que empieza con M), se quedan quietos.",
    "Podes usar un titere de serpiente que solo 'habla' palabras con S. Los nenes le tienen que dar palabras para que diga.",
    "Acorda que la S se escucha clarito al principio. Enfatizala: SSSSSapo, SSSSSopa. El sonido sostenido ayuda a identificarlo."
  ],
  "Sonido inicial /p/": [
    "Hola! La P es explosiva: Pa-Pa-Pa. Podes hacer que los nenes sientan el aire que sale cuando la dicen poniendo la mano frente a la boca.",
    "Usa palabras cotidianas: papa, pelo, pelota, puerta, pan. Pregunta: Que tienen en comun? Todas empiezan con Pppp...",
    "Un juego: infla los cachetes y hace 'explotar' la P. Pa! Pe! Pi! Po! Pu! Los nenes se rien y practican.",
    "Arma una 'caja de la P' con objetos que empiecen con P. Los nenes pueden agregar cosas que traigan de casa.",
    "Canta 'Pin Pon es un muneco' remarcando las P. La cancion conocida hace que se enganchen mas facil."
  ],
  "Sonido final": [
    "Hola! El sonido final es mas dificil que el inicial. Empeza con palabras donde el sonido final sea bien claro: soL, paZ, maR.",
    "Un tip: estira la palabra y para en el final. Soooooool. Que escuchen? La L! Pazzzzzz. Y ahora? La Z!",
    "Hace parejas de palabras que terminan igual: pan-tren, sol-col, mar-par. Pregunta que tienen en comun al final.",
    "Usa rimas para esto: 'Mi abuela tiene una cazuela'. Que escuchan al final de abuela y cazuela? El sonido es el mismo!",
    "Proba con los nombres: Juan termina en N, Maria en A. Que otros nombres terminan con el mismo sonido?"
  ],
  
  // ═══════════════════════════════════════════════════════════════════════════
  // COMPRENSION DE TEXTOS - Actividades especificas
  // ═══════════════════════════════════════════════════════════════════════════
  "Exploracion del libro": [
    "Hola! Antes de leer, deja que exploren el libro: que lo toquen, lo abran, miren los dibujos. La curiosidad es el primer paso.",
    "Pregunta: Que ven en la tapa? De que creen que se trata? No hay respuestas incorrectas, todo vale para anticipar.",
    "Mostrales como se sostiene el libro, donde empieza, para donde vamos leyendo. Son cosas que nosotros damos por obvias pero ellos estan aprendiendo.",
    "Si el libro tiene texturas o solapas, mejor! La exploracion sensorial los conecta con el objeto libro.",
    "Un tip: deja libros disponibles en un rincon. Que puedan agarrarlos cuando quieran, aunque sea para mirar las figuritas."
  ],
  "Prediccion con tapa": [
    "Hola! La tapa es una ventana a la historia. Mostrala bien y pregunta: Quienes seran estos personajes? Donde estaran?",
    "Tapa el titulo y que adivinen de que se trata solo con la imagen. Despues leelo y comparen: acertaron?",
    "Si hay un personaje en la tapa, pregunta: Como se llamara? Sera bueno o malo? Que le pasara? Activa la imaginacion.",
    "Un tip: anota las predicciones en un afiche. Despues de leer, vuelvan a mirarlas. Se divierte viendo que acertaron y que no.",
    "Pregunta: Ustedes querrian estar ahi? Les gustaria conocer a ese personaje? Los conectas emocionalmente con la historia."
  ],
  "Lectura dialogica": [
    "Hola! La lectura dialogica es conversar con el libro. Mientras lees, para y pregunta: Por que habra hecho eso el personaje?",
    "No leas de corrido. Hace pausas dramaticas, cambia la voz para cada personaje, miralos a los ojos. Que sea teatral.",
    "Un tip: cuando algo emocionante esta por pasar, para y pregunta: Que creen que pasara ahora? Genera suspenso.",
    "Si un nene interrumpe con un comentario relacionado, no lo cortes. Esa conexion con su vida es comprension pura.",
    "Despues de una parte importante, resumi: Entonces el lobo se queria comer a Caperucita. Que piensan de eso? Reflexion conjunta."
  ],
  "Secuencia narrativa": [
    "Hola! Inicio, desarrollo, final. Usa esas palabras: Primero paso... despues... y al final... Los nenes van a incorporarlas.",
    "Despues de leer, pregunta: Como empezo el cuento? Que paso en el medio? Como termino? Tres momentos clave.",
    "Un tip: usa tarjetas con dibujos del cuento. Que las ordenen: cual va primero, cual despues, cual al final.",
    "Si se confunden el orden, no corrijas directamente. Pregunta: Seguro que eso paso primero? Releeamos esa parte...",
    "Podes actuar el cuento: un grupo hace el inicio, otro el desarrollo, otro el final. El cuerpo ayuda a recordar la secuencia."
  ],
  "Identificar personajes": [
    "Hola! Despues de leer pregunta: Quienes aparecian en el cuento? Anotalos. Quien era el mas importante?",
    "Diferencia entre personajes principales y secundarios: El cuento es sobre el lobo o sobre Caperucita? Por que?",
    "Un tip: pedi que dibujen su personaje favorito. Mientras dibujan, pregunta: Por que te gusta ese? Que hacia?",
    "Compara personajes: En que se parecen el lobo y la abuelita? En que son diferentes? Desarrolla el pensamiento critico.",
    "Arma titeres simples de los personajes con palitos y dibujos. Pueden recontar el cuento usandolos."
  ],
  "Inferencias simples": [
    "Hola! Inferir es leer entre lineas. El libro dice que el nene temblaba. Pregunta: Como se sentia? No lo dice, pero lo podemos pensar.",
    "Usa preguntas de por que: Por que el personaje hizo eso? Por que estaba triste? No esta escrito pero se puede deducir.",
    "Un tip: mostra una imagen sin texto. Que paso aca? Como lo saben si no hay letras? Estan infiriendo!",
    "Conecta con sus experiencias: Alguna vez se sintieron como este personaje? Que hicieron ustedes?",
    "Las inferencias tambien son predicciones: Si el personaje sigue enojado, que creen que va a hacer? Anticipa usando logica."
  ],
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ORALIDAD - Actividades especificas  
  // ═══════════════════════════════════════════════════════════════════════════
  "Escucha activa": [
    "Hola! Escuchar activamente es mas que oir. Miralos a los ojos cuando hablas y pedi que te miren cuando escuchan.",
    "Un juego: Simeon dice. Pero solo si dicen 'Simeon dice'. Entrena la escucha atenta y seguir instrucciones.",
    "Despues de dar una consigna, pregunta a un nene: Que dije que habia que hacer? Verifica que escucharon.",
    "Baja el volumen de tu voz a proposito. Vas a ver como se acercan y prestan mas atencion para escucharte.",
    "Acorda que escuchar es una habilidad. Algunos nenes necesitan mas tiempo y practica. Paciencia y repeticion."
  ],
  "Turnos de habla": [
    "Hola! Hablar de a uno es dificil para los mas chiquitos. Usa un objeto: solo habla el que tiene la pelota/palito/muneco.",
    "Modela vos primero: Ahora hablo yo... listo, ahora le toca a Juan. Que vean como funciona el turno.",
    "Si interrumpen, no retes. Decile con cariño: Espera, ahora esta hablando Maria. Cuando termine, es tu turno.",
    "Un tip: un reloj de arena ayuda a visualizar el tiempo. Cuando cae toda la arena, cambia el turno.",
    "Celebra cuando esperan su turno: Que bien esperaste! Ahora te escuchamos todos. El refuerzo positivo funciona."
  ],
  "Vocabulario nuevo": [
    "Hola! Cada cuento es una oportunidad de palabras nuevas. Antes de leer, elegi 3 palabras que quieras enseñar.",
    "Cuando aparece la palabra nueva, para: Feroz significa muy enojado y peligroso. El lobo era feroz. Repitanlo: feroz.",
    "Un tip: arma un 'rincón de palabras nuevas'. Cada palabra con un dibujo. Repasalas durante la semana.",
    "Usa las palabras nuevas en otros contextos: Como esta el dia hoy? Esta soleado? O esta nublado? Palabras del clima.",
    "Pedi que usen la palabra nueva en una oracion. Si dijimos 'gigante', que inventen: El edificio es gigante."
  ],
  "Descripcion de objetos": [
    "Hola! Describir es observar y poner en palabras. Mostra un objeto y pregunta: Como es? De que color? Grande o chico?",
    "Un juego: 'Adivina que es'. Un nene describe sin decir el nombre, los otros adivinan. Es redondo, naranja, se come...",
    "Amplia sus descripciones: Si dicen 'es rojo', agrega: Si, es rojo y tambien es suave, como terciopelo.",
    "Usa los sentidos: Como se ve? Como se siente al tocarlo? Tiene olor? Hace ruido? Descripcion multisensorial.",
    "Podes describir personas: El personaje del cuento era alto, con pelo negro y usaba un sombrero grande."
  ],
  "Narracion de experiencias": [
    "Hola! Contar lo que vivimos ordena el pensamiento. Que hiciste el fin de semana? Primero, despues, al final.",
    "Ayuda con preguntas: Y despues que paso? Quien estaba con vos? Como te sentiste? Guia la narracion.",
    "Un tip: empeza vos contando algo tuyo. Modelar como se cuenta una experiencia les da el ejemplo.",
    "Si se van por las ramas, reconducí con cariño: Ah que lindo! Pero volvamos a la plaza, que paso despues?",
    "Valorá el contenido, no solo la forma. Si cuentan algo importante para ellos, aunque sea corto, es valioso."
  ],
  "Expresion de emociones": [
    "Hola! Poner nombre a las emociones es el primer paso para manejarlas. Estas contento? Triste? Enojado? Asustado?",
    "Usa caritas o emojis: Señala como te sentis hoy. Despues pregunta por que. Conecta emocion con causa.",
    "Los cuentos son perfectos: Como se sintio el personaje cuando le paso eso? Y vos como te sentirias?",
    "Valida todas las emociones: Esta bien estar enojado. Lo que importa es que hacemos cuando estamos enojados.",
    "Un tip: el 'termómetro de emociones'. Cada dia al llegar marcan como se sienten. Genera conversacion."
  ],
  "Dialogo entre pares": [
    "Hola! El dialogo entre nenes es tan importante como el dialogo con el adulto. Arma parejas para conversar.",
    "Da un tema: Hablen de su juguete favorito. Tienen 2 minutos. Despues uno le cuenta al grupo lo que dijo el otro.",
    "Un tip: cambia las parejas seguido. Que todos hablen con todos, no siempre con el mismo amigo.",
    "Modela un dialogo: Vos me contas algo, yo te escucho y te hago una pregunta. Ahora practiquen ustedes.",
    "Si un nene domina la conversacion, interveni: Maria, ahora dejemos que Pedro cuente. Equilibra la participacion."
  ]
}

// Consejos genericos por eje (fallback si no hay actividad especifica)
const CONSEJOS_GENERICOS: Record<string, string[]> = {
  CF: [
    "Hola! Hoy trabajamos Conciencia Fonologica. Acordate de alargar los sonidos para que los nenes los escuchen bien.",
    "Un tip que funciona barbaro: usa objetos del aula que empiecen con el mismo sonido. Los nenes lo ven y lo entienden al toque.",
    "Acorda que lo importante es que asocien el dibujo de la letra con el sonido. Cuando vean la M, tienen que pensar 'Mmmmm'.",
    "Si un nene no lo agarra de una, tranqui. Repetilo de forma divertida, con juegos. Nada de presion."
  ],
  CT: [
    "Hola! Hoy trabajamos Comprension de Textos. Antes de leer, mostrales la tapa y preguntales de que creen que se trata.",
    "Mientras lees, para cada tanto y pregunta: Que les parece que va a pasar ahora? Mantene la atencion.",
    "Relaciona el cuento con cosas que ellos conocen. Conectar la historia con su vida mejora la comprension.",
    "Usa distintos tonos de voz para los personajes. A los chicos les encanta y les ayuda a entender quien habla."
  ],
  O: [
    "Hola! Hoy trabajamos Oralidad. Hace preguntas abiertas, no de si o no. Que tengan que pensar y expresarse.",
    "Cuando un nene dice algo cortito, vos amplias con mas preguntas. Asi van sumando vocabulario.",
    "Dale tiempo para que piensen. A veces los apuramos sin querer. Espera unos segundos antes de pasar a otro nene.",
    "La ronda de intercambio es clave. Que cada uno cuente algo. Escucharse entre ellos tambien es aprender."
  ]
}

// Lo que deben aprender los ninos - mapeado por actividad especifica
const QUE_DEBEN_APRENDER_ACT: Record<string, string[]> = {
  // CF
  "Sonidos del entorno": ["Identificar diferentes sonidos del ambiente", "Asociar un sonido con su fuente", "Discriminar sonidos fuertes y suaves", "Desarrollar atencion auditiva sostenida"],
  "Rimas con nombres": ["Reconocer palabras que terminan con el mismo sonido", "Producir palabras que riman", "Disfrutar del juego con los sonidos del lenguaje"],
  "Separacion en silabas": ["Entender que las palabras se pueden dividir en partes", "Contar cuantas silabas tiene una palabra", "Comparar palabras largas y cortas"],
  "Sonido inicial /m/": ["Reconocer el sonido /m/ al inicio de palabras", "Producir el sonido /m/ de forma aislada", "Asociar el sonido /m/ con la letra M"],
  "Sonido inicial /p/": ["Reconocer el sonido /p/ al inicio de palabras", "Sentir el aire que sale al decir /p/", "Asociar el sonido /p/ con la letra P"],
  "Sonido inicial /s/": ["Reconocer el sonido /s/ al inicio de palabras", "Producir /s/ sostenido como una serpiente", "Asociar el sonido /s/ con la letra S"],
  "Sonido inicial /l/": ["Reconocer el sonido /l/ al inicio de palabras", "Asociar el sonido /l/ con la letra L"],
  "Sonido inicial /t/": ["Reconocer el sonido /t/ al inicio de palabras", "Asociar el sonido /t/ con la letra T"],
  "Sonido inicial /n/": ["Reconocer el sonido /n/ al inicio de palabras", "Asociar el sonido /n/ con la letra N"],
  "Sonido inicial /a/": ["Reconocer el sonido vocalico /a/", "Identificar palabras que empiezan con A"],
  "Sonido inicial /e/": ["Reconocer el sonido vocalico /e/", "Identificar palabras que empiezan con E"],
  "Sonido inicial /i/": ["Reconocer el sonido vocalico /i/", "Identificar palabras que empiezan con I"],
  "Sonido inicial /o/": ["Reconocer el sonido vocalico /o/", "Identificar palabras que empiezan con O"],
  "Sonido inicial /u/": ["Reconocer el sonido vocalico /u/", "Identificar palabras que empiezan con U"],
  "Sonido final": ["Prestar atencion al final de las palabras", "Identificar el ultimo sonido de una palabra", "Encontrar palabras que terminan igual"],
  "Sintesis de fonemas": ["Unir sonidos separados para formar palabras", "Escuchar un sonido por vez y adivinar la palabra"],
  "Analisis de fonemas": ["Separar cada sonido de una palabra", "Contar cuantos sonidos tiene una palabra"],
  // CT
  "Exploracion del libro": ["Manipular el libro correctamente", "Reconocer tapa, contratapa y paginas", "Entender que las imagenes cuentan una historia"],
  "Antes de leer: Predicciones": ["Usar imagenes para anticipar el contenido", "Formular hipotesis sobre la historia", "Activar conocimientos previos"],
  "Lectura dialogica: Pausas": ["Participar activamente durante la lectura", "Responder preguntas sobre el cuento", "Conectar la historia con sus experiencias"],
  "Vocabulario en contexto": ["Deducir el significado de palabras nuevas por el contexto", "Incorporar palabras nuevas al vocabulario"],
  "Recontar la historia": ["Ordenar los eventos del cuento", "Usar conectores: primero, luego, al final", "Contar con sus propias palabras"],
  "Cruz: Quien - Identificar personajes": ["Nombrar a los personajes del cuento", "Distinguir personajes principales de secundarios", "Responder: Quien?"],
  "Cruz: Que - Identificar acciones": ["Identificar que sucede en el cuento", "Responder: Que paso?"],
  "Cruz: Donde - Identificar lugar": ["Identificar el lugar donde ocurre la historia", "Responder: Donde?"],
  "Cruz: Cuando - Identificar tiempo": ["Identificar el tiempo en que ocurre la historia", "Usar marcadores temporales"],
  "Cruz: Por que - causas": ["Identificar causas y efectos en el cuento", "Responder: Por que?", "Relacionar acciones con sus consecuencias"],
  "Cruz: Que opinas": ["Expresar opinion sobre el texto", "Argumentar con razon", "Escuchar la opinion de otros"],
  // O - ECO Estructurado
  "ECO-E: Sonidos del entorno": ["Identificar y discriminar sonidos ambientales", "Responder con oracion completa: Yo escucho...", "Desarrollar atencion auditiva sostenida"],
  "ECO-E: Escucha de voces": ["Reconocer voces y responder con oracion: Esa es la voz de...", "Mantener atencion auditiva"],
  "ECO-E: Instrucciones simples": ["Seguir instrucciones de un paso", "Verbalizar la accion realizada: Yo hice...", "Usar estructura sujeto + verbo"],
  "ECO-E: Instrucciones complejas": ["Seguir dos instrucciones seguidas", "Verbalizar con conectores: Primero... y despues...", "Mantener secuencia en la respuesta"],
  "ECO-C: Vocabulario nuevo": ["Comprender palabras nuevas en contexto", "Usar la palabra nueva en oracion completa", "Responder: Esto es un/una..."],
  "ECO-C: Comprension literal": ["Responder preguntas sobre lo escuchado", "Usar evidencia del texto: En el cuento...", "Responder con oracion completa"],
  "ECO-C: Inferencias simples": ["Deducir emociones y causas", "Responder con causa: ... porque...", "Conectar acciones con consecuencias"],
  "ECO-O: Nombrar con estructura": ["Producir oraciones completas al nombrar objetos", "Usar estructura: El/La objeto es...", "No responder con palabras sueltas"],
  "ECO-O: Narrar con secuenciadores": ["Contar usando: primero, luego, despues, al final", "Incluir conectores temporales obligatorios", "Construir narraciones coherentes"],
  "ECO-O: Argumentar con PORQUE": ["Dar razones con la estructura: ...porque...", "Expresar opinion fundamentada", "Usar el conector PORQUE"],
  "ECO-O: Turnos de dialogo": ["Respetar el turno para hablar", "Responder con oracion completa antes de pasar el turno", "Escuchar activamente a los companeros"],
  "ECO-O: Exposicion oral": ["Presentar con estructura inicio/desarrollo/cierre", "Comenzar con: Hoy voy a hablar de...", "Cerrar con: Eso es todo sobre..."],
}

// Fallback por eje
const QUE_DEBEN_APRENDER_EJE: Record<string, string[]> = {
  CF: ["Reconocer que las palabras estan formadas por sonidos", "Identificar el sonido inicial de una palabra", "Separar palabras en silabas con palmadas", "Desarrollar atencion auditiva"],
  CT: ["Entender que los textos cuentan historias", "Anticipar que puede pasar en un cuento", "Recordar la secuencia: inicio, desarrollo, final", "Conectar la historia con sus propias experiencias"],
  O: ["Expresar ideas con oraciones completas", "Escuchar a los demas cuando hablan", "Usar conectores para ordenar ideas", "Argumentar con razones"]
}

// Fundamento pedagogico - mapeado por actividad
const FUNDAMENTO_ACT: Record<string, { teoria: string; autor: string; descripcion: string }> = {
  "Sonidos del entorno": { teoria: "Discriminacion Auditiva", autor: "Tomatis, 1991 / Tallal, 1980", descripcion: "La discriminacion de sonidos ambientales es el primer paso para la conciencia fonologica. Entrena la atencion auditiva selectiva." },
  "Rimas con nombres": { teoria: "Sensibilidad Fonologica", autor: "Goswami & Bryant, 1990", descripcion: "Las rimas desarrollan la sensibilidad a los sonidos finales, una de las primeras habilidades fonologicas en emerger." },
  "Separacion en silabas": { teoria: "Conciencia Silabica", autor: "Liberman et al., 1974", descripcion: "La segmentacion silabica es mas accesible que la fonemica y sirve como puente hacia la manipulacion de fonemas." },
  "Sonido inicial /m/": { teoria: "Conciencia del Fonema Inicial", autor: "Adams, 1990 / Defior, 1996", descripcion: "La identificacion del fonema inicial es clave para la decodificacion. La /m/ es continua y sonora, ideal para aislar y sostener." },
  "Sonido inicial /p/": { teoria: "Conciencia del Fonema Inicial", autor: "Adams, 1990", descripcion: "La /p/ es oclusiva y permite sentir el aire, conectando la produccion oral con la percepcion del fonema." },
  "Sonido inicial /s/": { teoria: "Conciencia del Fonema Inicial", autor: "Adams, 1990", descripcion: "La /s/ es fricativa y puede sostenerse, lo que facilita aislarla y reconocerla al inicio de palabras." },
  "Exploracion del libro": { teoria: "Alfabetizacion Emergente", autor: "Clay, 1966 / Teale & Sulzby, 1986", descripcion: "El contacto temprano con libros desarrolla conceptos sobre lo impreso: direccionalidad, funcion del texto e imagenes." },
  "Antes de leer: Predicciones": { teoria: "Lectura como Proceso Predictivo", autor: "Goodman, 1967 / Smith, 1971", descripcion: "Anticipar el contenido activa esquemas mentales y prepara al lector para construir significado antes de leer." },
  "Lectura dialogica: Pausas": { teoria: "Lectura Dialogica", autor: "Whitehurst et al., 1988", descripcion: "La interaccion durante la lectura en voz alta es mas efectiva que la lectura pasiva para el desarrollo del lenguaje." },
  "Cruz: Quien - Identificar personajes": { teoria: "Estructura Narrativa", autor: "Stein & Glenn, 1979", descripcion: "La Cruz de Comprension organiza las preguntas de forma visual. QUIEN entrena la comprension literal de los agentes de la historia." },
  "Cruz: Por que - causas": { teoria: "Comprension Inferencial", autor: "Kintsch, 1988 / Cain & Oakhill, 1999", descripcion: "Las inferencias causales conectan lo explicito con el conocimiento previo, construyendo una representacion coherente del texto." },
  "ECO-E: Sonidos del entorno": { teoria: "ECO Estructurado - Escuchar", autor: "Modelo ECO (Oralidad Expandida)", descripcion: "La fase Escuchar del ECO desarrolla la atencion auditiva como base para la comprension y produccion oral con estructura completa." },
  "ECO-C: Comprension literal": { teoria: "ECO Estructurado - Comprender", autor: "Modelo ECO (Oralidad Expandida)", descripcion: "La fase Comprender del ECO trabaja la comprension oral como paso previo a la produccion. Se enfoca en respuestas con evidencia del texto." },
  "ECO-O: Nombrar con estructura": { teoria: "ECO Estructurado - Oralizar (No aceptacion de palabras sueltas)", autor: "Modelo ECO (Oralidad Expandida)", descripcion: "La fase Oralizar aplica el principio central del ECO: no aceptar palabras sueltas. El docente modela la oracion completa y espera que el alumno la repita antes de continuar." },
  "ECO-O: Narrar con secuenciadores": { teoria: "Narrativa con Andamiaje", autor: "Bruner, 1986 / Vygotsky, 1978", descripcion: "Los conectores temporales (primero, luego, al final) son andamios cognitivos que organizan el pensamiento narrativo y la produccion oral coherente." },
  "ECO-O: Argumentar con PORQUE": { teoria: "Lenguaje Argumentativo Emergente", autor: "Veneziano & Sinclair, 1995", descripcion: "El uso del conector PORQUE marca el inicio del razonamiento causal en el lenguaje. Es una habilidad metalinguistica clave para el pensamiento critico." },
}

// Fallback por eje
const FUNDAMENTO_EJE: Record<string, { teoria: string; autor: string; descripcion: string }> = {
  CF: { teoria: "Conciencia Fonologica", autor: "Marilyn Adams, 1990 / Defior, 1996", descripcion: "La conciencia fonologica es la capacidad de reconocer y manipular los sonidos del lenguaje hablado. Es el predictor mas fuerte del exito en la lectura inicial." },
  CT: { teoria: "Comprension Lectora Emergente", autor: "Sulzby & Teale, 1991 / Scarborough, 2001", descripcion: "La comprension de textos en nivel inicial se construye a traves de la lectura compartida y dialogica. Los ninos desarrollan esquemas narrativos que les permiten anticipar e inferir." },
  O: { teoria: "ECO Estructurado - Oralidad Expandida", autor: "Vygotsky, 1978 / Bruner, 1983", descripcion: "El lenguaje oral es el andamiaje fundamental para el desarrollo cognitivo. El modelo ECO propone tres fases: Escuchar, Comprender y Oralizar, con estructura completa de oracion." }
}

function buscarPorActividad<T>(actividad: string | undefined, mapa: Record<string, T>, fallback: T): T {
  if (!actividad) return fallback
  const lower = actividad.toLowerCase()
  for (const [clave, valor] of Object.entries(mapa)) {
    if (lower.includes(clave.toLowerCase()) || clave.toLowerCase().includes(lower)) return valor
  }
  const palabras = lower.split(" ")
  for (const [clave, valor] of Object.entries(mapa)) {
    if (palabras.some(p => p.length > 3 && clave.toLowerCase().includes(p))) return valor
  }
  return fallback
}

interface MicroTrainingProps {
  ejeDelDia?: "CF" | "CT" | "O"
  actividadDelDia?: string
}

// Buscar consejos por actividad o usar genericos
function obtenerConsejos(actividad: string | undefined, eje: string): string[] {
  if (actividad) {
    const actividadLower = actividad.toLowerCase()
    for (const [titulo, consejos] of Object.entries(CONSEJOS_POR_ACTIVIDAD)) {
      if (actividadLower.includes(titulo.toLowerCase()) || titulo.toLowerCase().includes(actividadLower)) {
        return consejos
      }
    }
    const palabrasClave = actividadLower.split(" ")
    for (const [titulo, consejos] of Object.entries(CONSEJOS_POR_ACTIVIDAD)) {
      const tituloLower = titulo.toLowerCase()
      if (palabrasClave.some(p => p.length > 3 && tituloLower.includes(p))) {
        return consejos
      }
    }
  }
  return CONSEJOS_GENERICOS[eje] || CONSEJOS_GENERICOS.CF
}

export function MicroTraining({ ejeDelDia = "CF", actividadDelDia = "" }: MicroTrainingProps) {
  const consejos   = obtenerConsejos(actividadDelDia, ejeDelDia)
  const aprendizajes = buscarPorActividad(actividadDelDia, QUE_DEBEN_APRENDER_ACT, QUE_DEBEN_APRENDER_EJE[ejeDelDia] || QUE_DEBEN_APRENDER_EJE.CF)
  const fundamento   = buscarPorActividad(actividadDelDia, FUNDAMENTO_ACT, FUNDAMENTO_EJE[ejeDelDia] || FUNDAMENTO_EJE.CF)
  
  const [consejoIndex, setConsejoIndex] = useState(0)
  const [showAprendizajes, setShowAprendizajes] = useState(false)
  const [showFundamento, setShowFundamento] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isTalking, setIsTalking] = useState(false)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Resetear indice cuando cambia la actividad
  useEffect(() => {
    setConsejoIndex(0)
  }, [actividadDelDia])

  const consejoActual = consejos[consejoIndex]

  // Cargar voces del navegador
  useEffect(() => {
    const loadVoices = () => window.speechSynthesis.getVoices()
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  // Detener audio al cambiar de consejo
  useEffect(() => {
    window.speechSynthesis.cancel()
    setIsPlaying(false)
    setIsTalking(false)
  }, [consejoIndex])

  const handleOtroTip = () => {
    window.speechSynthesis.cancel()
    const nextIndex = (consejoIndex + 1) % consejos.length
    setConsejoIndex(nextIndex)
    
    setTimeout(() => {
      const nuevoConsejo = consejos[nextIndex]
      const utterance = new SpeechSynthesisUtterance(nuevoConsejo)
      
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1
      
      const voices = window.speechSynthesis.getVoices()
      const vozNatural = 
        voices.find(v => v.name.includes("Google español")) ||
        voices.find(v => v.name.includes("Google Spanish")) ||
        voices.find(v => v.name === "Paulina") ||
        voices.find(v => v.name === "Monica") ||
        voices.find(v => v.name.includes("Microsoft") && v.lang.includes("es")) ||
        voices.find(v => v.lang === "es-MX") ||
        voices.find(v => v.lang === "es-AR") ||
        voices.find(v => v.lang.startsWith("es"))
      
      if (vozNatural) {
        utterance.voice = vozNatural
        utterance.lang = vozNatural.lang
      } else {
        utterance.lang = "es-MX"
      }
      
      utterance.onstart = () => setIsTalking(true)
      utterance.onend = () => {
        setIsPlaying(false)
        setIsTalking(false)
      }
      utterance.onerror = () => {
        setIsPlaying(false)
        setIsTalking(false)
      }
      
      speechRef.current = utterance
      window.speechSynthesis.speak(utterance)
      setIsPlaying(true)
    }, 100)
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md h-full flex flex-col border border-slate-200 overflow-hidden">
      {/* Header con actividad del dia */}
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "#1e3a5f" }}>
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Micro capacitacion just in time
        </h3>
        {actividadDelDia && (
          <p className="text-xs text-slate-500 mt-1 truncate">
            Actividad: <span className="font-medium text-slate-700">{actividadDelDia}</span>
          </p>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1">
        <div className="rounded-xl overflow-hidden m-4" style={{ backgroundColor: "#1e3a5f" }}>
          <div className="p-4">
            <div className="flex gap-3">
              <div className="relative flex-shrink-0">
                <div 
                  className={`w-16 h-16 rounded-full overflow-hidden transition-transform ${isTalking ? "animate-pulse scale-105" : ""}`}
                  style={{ borderColor: "#fbbf24", borderWidth: "3px" }}
                >
                  <Image 
                    src="/images/alba-personaje.jpg"
                    alt="ALBA"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
              
              <div className="flex-1 relative">
                <div 
                  className="bg-white rounded-xl rounded-tl-none p-3 text-sm text-slate-700 leading-relaxed"
                  style={{ minHeight: "80px" }}
                >
                  {consejoActual}
                </div>
                <div 
                  className="absolute top-3 -left-2 w-0 h-0"
                  style={{
                    borderTop: "8px solid transparent",
                    borderBottom: "8px solid transparent",
                    borderRight: "8px solid white"
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50">
            <button 
              type="button"
              onClick={handleOtroTip}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-amber-500 text-white hover:bg-amber-600 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isTalking ? "animate-spin" : ""}`} />
              Otro tip
            </button>
            <span className="text-xs text-white/60">
              {consejoIndex + 1} / {consejos.length}
            </span>
          </div>
        </div>

        <div className="mx-4 mb-2 bg-slate-50 rounded-lg px-4 py-3">
          <button 
            type="button"
            onClick={() => setShowAprendizajes(!showAprendizajes)}
            className="w-full text-left flex items-center justify-between text-xs font-semibold"
            style={{ color: "#1e3a5f" }}
          >
            <span>Que deben aprender los ninos</span>
            <span className="text-slate-400">{showAprendizajes ? "−" : "+"}</span>
          </button>
          
          {showAprendizajes && (
            <ul className="mt-2 text-xs text-slate-600 space-y-1.5">
              {aprendizajes.map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-amber-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mx-4 mb-4 bg-blue-50 rounded-lg px-4 py-3 border border-blue-100">
          <button 
            type="button"
            onClick={() => setShowFundamento(!showFundamento)}
            className="w-full text-left flex items-center justify-between text-xs font-semibold"
            style={{ color: "#1e3a5f" }}
          >
            <span>Fundamento pedagogico</span>
            <span className="text-slate-400">{showFundamento ? "−" : "+"}</span>
          </button>
          
          {showFundamento && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-700">{fundamento.teoria}</span>
              </div>
              <p className="text-xs text-blue-600 italic">
                {fundamento.autor}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {fundamento.descripcion}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
