import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Cliente Supabase lazy - se crea dentro del handler, nunca a nivel de modulo
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
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
): { actividad: (typeof SECUENCIA)[typeof eje][0]; indice: number; esRepeticion: boolean } {
  const fullSeq = SECUENCIA[eje]
  const limites4 = { CF: 12, CT: 8, O: 10 }
  const seq = esde4Anios(sala) ? fullSeq.slice(0, limites4[eje]) : fullSeq

  let indice = Math.min(clasesCompletadasEnEje, seq.length - 1)
  let esRepeticion = false
  if (promedioEje < 40 && indice > 0) {
    indice = Math.max(0, indice - 1)
    esRepeticion = true
  }
  return { actividad: seq[indice], indice, esRepeticion }
}

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
      const actividadInicial = esde4Anios(sala) ? SECUENCIA.CF.slice(0, 12)[0] : SECUENCIA.CF[0]
      return NextResponse.json({
        sugerencia: {
          eje: "CF",
          actividad: actividadInicial.titulo,
          descripcion: actividadInicial.descripcion,
          objetivo: actividadInicial.objetivo,
          materiales: actividadInicial.materiales,
          razon: "Inicio del ano. Conciencia Fonologica " + (esde4Anios(sala) ? "(4 anos)" : "(5 anos)") + ".",
          alumnosEnRiesgo: 0,
          totalAlumnos: 0,
          tendencia: "estancado",
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
      .select("actividad, eje, resultado, sala")
      .neq("sala", sala)

    const registrosRed = (registrosRedRaw || []).filter(r => r.sala != null && r.sala !== "")

    // Calcular tasa de exito por actividad/eje en toda la red
    type MapaRed = Record<string, { total: number; verdes: number; salas: Set<string> }>
    const mapaRed: MapaRed = {}
    for (const r of registrosRed || []) {
      const key = `${r.eje}::${r.actividad}`
      if (!mapaRed[key]) mapaRed[key] = { total: 0, verdes: 0, salas: new Set() }
      mapaRed[key].total++
      if (r.resultado === "green") mapaRed[key].verdes++
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
    // Contar clases completadas desde registro_cierre (donde se guarda Finalizar Jornada)
    const { data: cierresData } = await supabase
      .from("registro_cierre")
      .select("fecha, eje")
      .eq("sala", sala)
      .order("fecha", { ascending: true })
    const cierres = cierresData || []
    
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
      const verdes = regsEje.filter((r) => r.resultado === "green").length
      const amarillos = regsEje.filter((r) => r.resultado === "yellow").length
      const rojos = regsEje.filter((r) => r.resultado === "red").length
      const total = regsEje.length
      const promedio = total > 0 ? Math.round((verdes * 100 + amarillos * 50 + rojos * 10) / total) : 0

      // Contar clases completadas desde registro_cierre para este eje
      const cierresEje = cierres.filter((c) => c.eje === eje)
      const fechasCierre = [...new Set(cierresEje.map((c) => c.fecha?.split("T")[0]))].sort()
      const clasesCompletadas = fechasCierre.length

      // Ultimas 2 clases en rojo (para bajar nivel en secuencia)
      const ultimas2Fechas = fechasCierre.slice(-2)
      let ultimasClasesEnRojo = 0
      for (const f of ultimas2Fechas) {
        const regsEsaFecha = regsEje.filter((r) => r.fecha?.split("T")[0] === f)
        const promFecha = regsEsaFecha.length > 0
          ? regsEsaFecha.filter((r) => r.resultado === "green").length / regsEsaFecha.length
          : 1
        if (promFecha < 0.4) ultimasClasesEnRojo++
      }

      const alumnosEnRojo: string[] = []
      for (const al of alumnos) {
        const ultReg = regsEje.filter((r) => r.alumno_id === al.id).pop()
        if (ultReg && ultReg.resultado === "red") alumnosEnRojo.push(al.nombre)
      }

      const actMap: Record<string, { total: number; verdes: number }> = {}
      for (const r of regsEje) {
        if (!r.actividad) continue
        if (!actMap[r.actividad]) actMap[r.actividad] = { total: 0, verdes: 0 }
        actMap[r.actividad].total++
        if (r.resultado === "green") actMap[r.actividad].verdes++
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
      const promSemActual = semActual.length > 0 ? semActual.filter((r) => r.resultado === "green").length / semActual.length : 0
      const promSemAnterior = semAnterior.length > 0 ? semAnterior.filter((r) => r.resultado === "green").length / semAnterior.length : 0
      let tendencia: "mejorando" | "estancado" | "empeorando" = "estancado"
      if (promSemActual > promSemAnterior + 0.1) tendencia = "mejorando"
      if (promSemActual < promSemAnterior - 0.1) tendencia = "empeorando"

      analisis[eje] = { total, verdes, amarillos, rojos, promedio, alumnosEnRojo, actividadesExitosasLocales, tendencia, clasesCompletadas, ultimasClasesEnRojo }
    }

    // ── 5. Elegir eje: el mas debil con mas urgencia ───────────────────────
    let ejeSugerido: "CF" | "CT" | "O" = "CF"
    let peorScore = 999
    for (const eje of ejes) {
      const a = analisis[eje]
      const score = a.promedio
        - (a.alumnosEnRojo.length * 10)
        - (a.tendencia === "empeorando" ? 20 : 0)
        - (a.ultimasClasesEnRojo >= 2 ? 15 : 0)
      if (score < peorScore) {
        peorScore = score
        ejeSugerido = eje
      }
    }

    // ── 6. Elegir actividad: combinar secuencia + evidencia inter-salas ────
    const ejeDatos = analisis[ejeSugerido]

    // Si hay 2+ clases seguidas con promedio bajo, retroceder en la secuencia
    let clasesParaCalculo = ejeDatos.clasesCompletadas
    if (ejeDatos.ultimasClasesEnRojo >= 2 && clasesParaCalculo > 0) {
      clasesParaCalculo = Math.max(0, clasesParaCalculo - 1)
    }

    const { actividad, indice, esRepeticion } = calcularActividadDelDia(
      ejeSugerido,
      clasesParaCalculo,
      ejeDatos.promedio,
      sala
    )

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

    // ── 7. Construir respuesta ─────────────────────────────────────────────
    const limites4 = { CF: 12, CT: 8, O: 10 }
    const totalEnSecuencia = esde4Anios(sala)
      ? SECUENCIA[ejeSugerido].slice(0, limites4[ejeSugerido]).length
      : SECUENCIA[ejeSugerido].length
    const edadLabel = esde4Anios(sala) ? " (4 anos)" : " (5 anos)"
    const ejeNombre = ejeSugerido === "CF" ? "Conciencia Fonologica" : ejeSugerido === "CT" ? "Comprension de Textos" : "Oralidad (ECO)"

    let razon = ejeDatos.alumnosEnRojo.length > 0
      ? `${ejeDatos.alumnosEnRojo.length} alumno${ejeDatos.alumnosEnRojo.length > 1 ? "s" : ""} necesita${ejeDatos.alumnosEnRojo.length > 1 ? "n" : ""} refuerzo en ${ejeNombre}${edadLabel}.`
      : `Continuamos avanzando en ${ejeNombre}${edadLabel}.`

    if (aprendidoDeLaRed && salaRedNombre) {
      razon += ` Actividad sugerida por la red ALBA (exitosa en ${salaRedNombre} con ${candidataRed?.tasa}% de logro).`
    } else if (ejeDatos.ultimasClasesEnRojo >= 2) {
      razon += ` El grupo tuvo 2 clases seguidas con dificultad. Se retrocedio en la secuencia para consolidar.`
    } else if (esRepeticion) {
      razon += ` Repetimos para consolidar (promedio: ${ejeDatos.promedio}%).`
    } else {
      razon += ` Clase ${indice + 1} de ${totalEnSecuencia} en la secuencia anual.`
    }

    // ── 8. Alertas ─────────────────────────────────────────────────────────
    const alertas: { tipo: string; mensaje: string; urgencia: "alta" | "media" | "info" }[] = []
    for (const eje of ejes) {
      const a = analisis[eje]
      const nombre = eje === "CF" ? "Conciencia Fonologica" : eje === "CT" ? "Comprension de Textos" : "Oralidad"

      if (a.alumnosEnRojo.length >= alumnos.length * 0.3) {
        alertas.push({ tipo: "patron_grupal", mensaje: `${a.alumnosEnRojo.length} de ${alumnos.length} alumnos en rojo en ${nombre}. Revisar estrategia grupal.`, urgencia: "alta" })
      }
      for (const al of alumnos) {
        const regsAl = regs.filter((r) => r.alumno_id === al.id && r.eje === eje).slice(-3)
        if (regsAl.length >= 3 && regsAl.every((r) => r.resultado === "red")) {
          alertas.push({ tipo: "persistencia", mensaje: `${al.nombre} lleva 3+ registros en rojo en ${nombre}.`, urgencia: "alta" })
        }
      }
      if (a.tendencia === "empeorando") {
        alertas.push({ tipo: "tendencia", mensaje: `${nombre} muestra tendencia negativa esta semana.`, urgencia: "media" })
      }
      // Alerta positiva: actividad de la red disponible
      if (exitosasRed[eje].length > 0) {
        alertas.push({ tipo: "red_exitosa", mensaje: `La red ALBA tiene ${exitosasRed[eje].length} actividad${exitosasRed[eje].length > 1 ? "es" : ""} con >70% de logro en ${nombre}. ALBA las priorizara automaticamente.`, urgencia: "info" })
      }
    }

    const totalClases = new Set(regs.map((r) => r.fecha?.split("T")[0])).size
    const primerRegistro = regs.length > 0 ? new Date(regs[0].fecha) : new Date()
    const semanaActual = Math.max(1, Math.ceil((Date.now() - primerRegistro.getTime()) / (7 * 86400000)))

    // ── 9. Micro-capacitacion just-in-time vinculada a la actividad ──────────
    const microCapacitaciones: Record<string, { titulo: string; contenido: string; tips: string[] }> = {
      // CF - Conciencia Fonologica
      "Sonidos del entorno": { titulo: "Escucha activa", contenido: "Desarrolle la capacidad de escucha discriminando sonidos ambientales.", tips: ["Pida silencio total", "Use grabaciones variadas", "Relacione con imagenes"] },
      "Rimas con nombres": { titulo: "Ensenar rimas", contenido: "Las rimas desarrollan conciencia fonologica. Use nombres de los ninos.", tips: ["Empiece simple", "Use gestos", "Repita varias veces"] },
      "Separacion en silabas": { titulo: "Segmentacion silabica", contenido: "Dividir palabras con palmas desarrolla conciencia fonologica.", tips: ["Palabras cortas primero", "Use nombres", "Agregue movimiento"] },
      "Sonido inicial /a/": { titulo: "Vocal A", contenido: "Enfoque en /a/ al inicio de palabras.", tips: ["Exagere el sonido", "Use espejo", "Busque objetos con A"] },
      "Sonido inicial /e/": { titulo: "Vocal E", contenido: "Identificar palabras que empiezan con /e/.", tips: ["Recorra el aula", "Liste en pizarron", "Ejemplos cotidianos"] },
      "Sonido inicial /i/": { titulo: "Vocal I", contenido: "Use el cuerpo para formar la I.", tips: ["Brazos estirados = I", "Alterne palabras", "Dictado grafico"] },
      "Sonido inicial /o/": { titulo: "Vocal O", contenido: "Aplaudir con palabras que empiezan con /o/.", tips: ["Una palmada = O", "Dibujen cosas con O", "Lista colectiva"] },
      "Sonido inicial /u/": { titulo: "Vocal U", contenido: "Juego de memoria con sonido inicial.", tips: ["Trabajen en parejas", "Emparejen imagen-sonido", "Celebre aciertos"] },
      "Vocales - Repaso": { titulo: "Consolidar vocales", contenido: "Ruleta de vocales para repasar.", tips: ["3 palabras por vocal", "Cuente cual tuvo mas", "Registre"] },
      "Sonido inicial /m/": { titulo: "Consonante M", contenido: "Imitar /m/ cerrando labios.", tips: ["Use espejo", "Senale laminas", "Creen oraciones"] },
      "Sonido inicial /p/": { titulo: "Consonante P", contenido: "Juego de pesca con palabras.", tips: ["Pescar tarjetas", "Clasificar", "Canastos de colores"] },
      "Sonido inicial /s/": { titulo: "Consonante S", contenido: "Trabajo en parejas con /s/.", tips: ["Pulgar arriba/abajo", "Intercambien roles", "Compartan"] },
      // CT - Conocimiento Textual
      "Exploracion del libro": { titulo: "Conocer el libro", contenido: "Manipular y explorar portada e ilustraciones.", tips: ["Observen tapa", "Predigan contenido", "Registre hipotesis"] },
      "Antes de leer: Predicciones": { titulo: "Predicciones", contenido: "Formular hipotesis mirando la tapa.", tips: ["Use post-its", "Verifiquen al final", "Celebre aciertos"] },
      "Lectura dialogica: Pausas": { titulo: "Lectura interactiva", contenido: "Pausas estrategicas para preguntas.", tips: ["Que pasara?", "Por que hizo eso?", "Como se siente?"] },
      // O - Oralidad
      "ECO-E: Sonidos del entorno": { titulo: "Escucha y respuesta", contenido: "Nombrar sonidos en oracion completa.", tips: ["Ojos cerrados", "Oracion completa", "Modele si necesario"] },
      "ECO-E: Escucha de voces": { titulo: "Reconocer voces", contenido: "Responder con oracion completa.", tips: ["Use grabaciones", "Esa es la voz de...", "Espere oracion"] },
      "ECO-E: Instrucciones simples": { titulo: "Seguir instrucciones", contenido: "Ejecutar y verbalizar acciones.", tips: ["Un paso a la vez", "Yo levante el...", "No avance sin verbalizacion"] },
    }
    const microDefault = { titulo: "Tip del dia", contenido: "Observe a cada nino y adapte la actividad a sus necesidades.", tips: ["Sea paciente", "Celebre logros", "Repita si necesario"] }
    const microCapacitacion = microCapacitaciones[actividadFinal.titulo] || microDefault

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
      },
      microCapacitacion,
      alertas: alertas.slice(0, 8),
      historial: {
        promediosPorEje: { CF: analisis.CF.promedio, CT: analisis.CT.promedio, O: analisis.O.promedio },
        tendencias: { CF: analisis.CF.tendencia, CT: analisis.CT.tendencia, O: analisis.O.tendencia },
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
