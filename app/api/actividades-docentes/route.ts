// ALBA — Actividades de la docente (v2: carga por lote)
// La maestra pega su listado completo (del Drive, del cuaderno, de otra IA).
// ALBA lo desarma en actividades separadas y a cada una le asigna eje y capacidad.
// El texto original de cada una se guarda intacto: es la autoria de la docente.
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { generateText } from "ai"

const SUPABASE_URL = "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

const TABLA = "actividades_docentes"
const MAX_POR_LOTE = 8

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

export const dynamic = "force-dynamic"
export const revalidate = 0

// Vocabulario UNICO de ejes: CF / CT / O / E. Si otra parte del sistema usa
// "Escritura" o "EA", se traduce en el borde — aca se guarda siempre asi.
// Las salas de maternal se clasifican por CAPACIDAD, no por eje de alfabetizacion
const SALAS_MATERNAL_AD = ["PINITOS", "NARANJOS", "PRUEBA MATERNAL"]
function esDeMaternalAD(sala: string): boolean {
  const s = (sala || "").toUpperCase()
  return SALAS_MATERNAL_AD.some((ref) => s.includes(ref))
}

// Las AREAS del Diseno de maternal, tal como se guardan y se muestran.
const AREAS_MATERNAL = [
  "Comunicacion y expresion",
  "Desarrollo del juego",
  "Desarrollo corporal",
  "Exploracion del ambiente",
  "Desarrollo personal y social",
  // Sala de 3
  "Lengua",
  "Matematica",
  "Indagacion del ambiente",
  "Educacion Fisica",
  "Lenguajes expresivos",
]

const sinTildes = (t: string) =>
  (t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase()

// De lo que devuelve la IA al AREA del Diseno. La decision la toma el codigo:
// el modelo solo dice de que se trata en una palabra, y aca se traduce. Asi el
// area no depende de que el modelo recuerde los cinco nombres exactos.
const PALABRA_A_AREA: Record<string, string> = {
  lenguaje:"Comunicacion y expresion", lengua:"Comunicacion y expresion",
  comunicacion:"Comunicacion y expresion", expresion:"Comunicacion y expresion",
  juego:"Desarrollo del juego", jugar:"Desarrollo del juego",
  cuerpo:"Desarrollo corporal", corporal:"Desarrollo corporal",
  movimiento:"Desarrollo corporal", fisica:"Desarrollo corporal",
  ambiente:"Exploracion del ambiente", exploracion:"Exploracion del ambiente",
  naturaleza:"Exploracion del ambiente", matematica:"Exploracion del ambiente",
  convivencia:"Desarrollo personal y social", social:"Desarrollo personal y social",
  personal:"Desarrollo personal y social", autonomia:"Desarrollo personal y social",
}

function normalizarEje(valor: string): string | null {
  const e = (valor || "").trim().toUpperCase()

  // Si ya vino el area completa, se toma tal cual
  const area = AREAS_MATERNAL.find((a) => sinTildes(a) === sinTildes(valor))
  if (area) return area

  // Si vino una palabra suelta, la traduce el codigo
  const porPalabra = PALABRA_A_AREA[sinTildes(valor)]
  if (porPalabra) return porPalabra

  // Se conservan las claves viejas de capacidad por compatibilidad con lo
  // que ya esta guardado
  if (["COM", "AUT", "RES", "COL", "REF"].includes(e)) return e
  if (e === "CF") return "CF"
  if (e === "CT") return "CT"
  if (e === "O" || e === "ORALIDAD") return "O"
  if (e === "E" || e === "EA" || e === "LE" || e === "ESCRITURA") return "E"
  return null
}

// ── GET: actividades de una sala ────────────────────────────────────────────
// ?sala=X            -> todas
// ?sala=X&pendientes=1 -> solo las que ALBA todavia no uso
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala")
  const soloPendientes = searchParams.get("pendientes") === "1"

  if (!sala) return NextResponse.json({ ok: false, error: "Falta sala" }, { status: 400 })

  const supabase = getSupabase()
  let query = supabase
    .from(TABLA)
    .select("*")
    .eq("sala", sala)
    .order("created_at", { ascending: false })

  if (soloPendientes) query = query.eq("estado", "propia")

  const { data, error } = await query

  if (error) {
    console.error("[v0] Error leyendo actividades_docentes:", error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, actividades: data || [] })
}

// ── POST: la maestra pega un listado, ALBA lo desarma ───────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sala, texto, proyecto, proyectoObjetivo, proyectoDuracion } = body

    if (!sala || !texto || String(texto).trim().length < 15) {
      return NextResponse.json(
        { ok: false, error: "Falta la sala o el texto de las actividades." },
        { status: 400 }
      )
    }

    const textoCompleto = String(texto).trim().slice(0, 12000)
    const esMaternal = esDeMaternalAD(String(sala || ""))

    const prompt = `Sos ALBA, asistente pedagogico de alfabetizacion inicial para salas de 4 y 5 anos (Diseno Curricular de Educacion Inicial, Ciudad de Buenos Aires).

La maestra escribio algo en el campo. Puede ser UNA DE DOS COSAS, y tenes que
darte cuenta sola:

CASO 1 — PEGO ACTIVIDADES QUE YA USA. Separalas y ordena cada una. Devolve
EXACTAMENTE las que pego, ni una mas. NO inventes actividades adicionales.
No las reescribas ni las "mejores": respeta su propuesta, su intencion, su
nombre y su desarrollo. Lo que SI haces es ordenarlas: asignarles el eje, la
capacidad, el "Observa si" como accion observable, y CONDENSAR los contenidos
si vinieron larguisimos. Muchas maestras todavia estan aprendiendo a planificar
con el Diseno nuevo: al ver su propia actividad bien ordenada, aprenden como se
hace. Ese es el mayor valor que les das.

CASO 2 — TE ESTA PIDIENDO ACTIVIDADES. Este es un espacio de trabajo: ella te
pide como le pediria a una colega. Interpretá lo que quiere y dáselo.

Puede pedirte de muchas formas, todas validas:
- Por cantidad y eje: "dame 3 de oralidad", "una de conciencia fonologica"
- Por tema: "5 actividades sobre los animales marinos"
- Una SECUENCIA: "armame 4 que vayan de menos a mas para trabajar rimas".
  Ahi no son cuatro sueltas: son CUATRO QUE PROGRESAN. Cada una tiene que
  apoyarse en lo que la anterior dejo instalado, y decilo en el nombre o en el
  desarrollo para que se entienda el orden. Esto es lo que mas les cuesta a las
  maestras y es exactamente lo que pide el Diseno.
- A partir de algo que ya le funciono: "la de las semillas anduvo barbaro, dame
  dos parecidas pero para conciencia fonologica". Tomá la estructura de esa
  actividad y llevala al eje nuevo.

Escribi EXACTAMENTE la cantidad que pide. Si no dice cantidad, devolve UNA.
Si no dice eje, elegilo vos.

EL PROYECTO ES CONTEXTO DE FONDO, no una obligacion. Aca ELLA DECIDE: si te
pide algo relacionado al proyecto, o no dice nada de tema, ancla al proyecto.
Si pide un tema DISTINTO ("dame algo de dinosaurios" con el proyecto siendo
la huerta), ese tema manda: no fuerces el proyecto adentro.

En los dos casos, la cantidad la decide ELLA. Nunca agregues actividades que no
pidio ni escribio.

${proyecto ? `Proyecto en curso de la sala: "${proyecto}"${
  proyectoObjetivo ? `\nLo que la maestra se propone con este proyecto: ${proyectoObjetivo}\nLas actividades tienen que APORTAR A ESE OBJETIVO, no solo compartir el tema.` : ""
}${proyectoDuracion ? `\nDuracion prevista: ${proyectoDuracion}.` : ""}` : ""}

${esMaternal ? `CAPACIDADES (elegi exactamente una por actividad, es una sala de 2 anos):
- COM: Comunicacion — responder, nombrar, pedir, conversar, escuchar cuentos y canciones
- AUT: Autonomia para aprender — explorar, elegir, sostener una actividad, anticipar la rutina
- RES: Resolucion de problemas — causa y efecto, ensayar alternativas, pedir ayuda
- COL: Compromiso y colaboracion — compartir, esperar turnos, participar del grupo
- REF: Pensamiento reflexivo y critico — descubrir efectos, anticipar, expresar preferencias
Aunque la capacidad sea otra, la actividad SIEMPRE tiene que hacer trabajar el lenguaje.` : `EJES (elegi exactamente uno por actividad):
- CF: Conciencia Fonologica — sonidos, rimas, silabas, fonemas
- CT: Comprension de Textos — cuentos, lectura dialogica, secuencias, preguntas sobre el texto
- O: Oralidad — conversacion, escucha, vocabulario, narracion oral, argumentacion
- E: Escritura — escribir el nombre, rotular, listas, frases, hipotesis de escritura`}

CAPACIDAD: una sola capacidad por actividad, redactada como ACCION OBSERVABLE que la maestra pueda evaluar mirando al nino. Empezá con un verbo en tercera persona del singular.
Ejemplos correctos: "Identifica el sonido inicial de una palabra", "Escribe su nombre con letras convencionales", "Reconstruye oralmente la secuencia de un cuento", "Anticipa el contenido de un texto a partir de las imagenes".
Ejemplos INCORRECTOS (no uses este estilo): "Trabajar la escritura", "Desarrollar el lenguaje", "Estimular la conciencia fonologica".

Devolve como MAXIMO ${MAX_POR_LOTE} actividades. Si el listado trae mas, quedate con las ${MAX_POR_LOTE} primeras.

LISTADO DE LA MAESTRA:
"""
${textoCompleto}
"""

${esMaternal ? `Actividades RICAS Y LUDICAS, propias de la edad: con el cuerpo, con objetos, con juego.` : `REGLA QUE NO SE ROMPE: en jardin ALBA es una herramienta de ALFABETIZACION. Toda
actividad que escribas tiene que trabajar el LENGUAJE`} —hablar, escuchar,
comprender, escribir, jugar con los sonidos de las palabras—. Si la maestra te
pide algo de matematica, ciencias o arte, tomá ese tema como CONTEXTO pero la
propuesta tiene que hacer trabajar el lenguaje.
${esMaternal ? "" : `MAL: "lanza los dados y conta los puntos" (eso es matematica pura).
BIEN: "lanza el dado y busca en la sala esa cantidad de objetos. Despues
contale al grupo que juntaste y por que elegiste esos."`}

COMO SON LAS ACTIVIDADES QUE ESCRIBIS:
- SE APRENDE HACIENDO: una accion concreta en el centro —plantar, medir,
  palmear, armar, buscar, repartir, construir— y el lenguaje DENTRO de esa
  accion. Nunca resuelvas con "observen y cuenten" o "preguntales que sienten".
- EL JUEGO ES EL METODO. El Diseno nombra propuestas como "Veo veo", "El
  detective", "Muestro y cuento", seguir instrucciones de pocos pasos, explicar
  las reglas de un juego, adivinanzas, juego dramatico, juegos de construccion.
  USALAS COMO MODELO, NO COMO MENU: entendé por que funcionan —hay una accion,
  hay algo que resolver con lenguaje, la maestra andamia— e INVENTA otras con
  esa misma logica. Si todas tus actividades son "Veo veo" y adivinanzas, estas
  girando sobre lo mismo.
- VARIA LA ESTRUCTURA, no solo el tema. Si ya propusiste dos de adivinar, la
  tercera tiene que ser de otra cosa: construir, cocinar, ordenar, dramatizar.
- La maestra andamia: deci que hace ella MIENTRAS los chicos hacen.

Respondé SOLO con un array JSON, sin texto adicional ni backticks:
[
  {
    "nombre": "titulo corto y claro, maximo 6 palabras",
    "eje": "${esMaternal ? "de que se trata la actividad en una palabra: lenguaje, juego, cuerpo, ambiente o convivencia" : "CF | CT | O | E"}",
    "capacidad": "SOLO EL VERBO Y LA ACCION. PROHIBIDO poner adelante el nombre de una capacidad ('Comunicacion:', 'Pensamiento reflexivo:'): eso va SOLO en capacidadDC. Tampoco escribas 'Observa si'. Arranca directo con un verbo en tercera persona y describi una conducta que se pueda ver o escuchar. PROHIBIDO empezar con 'desarrollar', 'fomentar', 'estimular', 'trabajar', 'promover', 'reconocer las posibilidades de', 'proyectar': eso son objetivos y no se pueden mirar. UNA sola accion, no cuatro",
    "capacidadDC": "el NOMBRE de una de las cinco capacidades del Diseno seguido de dos puntos y lo que ESTA actividad pone en juego. Formato exacto: 'Comunicacion: expresar emociones y ponerles nombre'. Las cinco: Autonomia para aprender | Comunicacion | Pensamiento reflexivo y critico | Resolucion de problemas | Compromiso y colaboracion. PRIORIZA la que la alfabetizacion pone en juego",
    "contenidos": "los contenidos, en 1 o 2 lineas. Si la maestra escribio cuatro parrafos, CONDENSALOS: lo que importa es que se lea de un vistazo",
    "objetivo": "que se busca que los ninos logren, una oracion",
    "desarrollo": "pasos concretos para darla en el aula. LA PRUEBA: si entra una SUPLENTE que no conoce al grupo, tiene que poder darla leyendo esto una sola vez — materiales exactos, como se agrupan los chicos, cuanto dura, que frases decir. Escribile A LA DOCENTE en segunda persona: 'pone', 'invitalos', 'preguntales'. Nunca 'la docente pone' ni 'quien coordine'",
    "materiales": "lista breve separada por comas",
    "texto_original": "el fragmento exacto del listado que corresponde a esta actividad"
  }
]`

    let propuestas: Record<string, unknown>[] = []

    try {
      const result = await generateText({
        model: "openai/gpt-4o-mini",
        prompt,
        maxOutputTokens: 3000,
        temperature: 0.3,
      })

      const t = result.text.trim()
      const jsonStr = t.startsWith("[") ? t : t.slice(t.indexOf("["), t.lastIndexOf("]") + 1)
      const parsed = JSON.parse(jsonStr)
      if (Array.isArray(parsed)) propuestas = parsed
    } catch (errIA) {
      console.error("[v0] Error desarmando listado:", errIA)
      return NextResponse.json(
        { ok: false, error: "ALBA no pudo leer el listado. Proba con menos actividades o revisá el formato." },
        { status: 502 }
      )
    }

    if (propuestas.length === 0) {
      return NextResponse.json(
        { ok: false, error: "No se reconocio ninguna actividad en el texto." },
        { status: 422 }
      )
    }

    const filas = propuestas.slice(0, MAX_POR_LOTE).map((p) => {
      const nombre = String(p.nombre || "").trim().slice(0, 120)
      const original = String(p.texto_original || "").trim()
      return {
        sala,
        // Si la IA no devolvio el fragmento, guardamos el listado entero:
        // preferimos texto de mas antes que perder lo que escribio la maestra.
        texto_original: original.length > 5 ? original : textoCompleto,
        nombre: nombre || "Actividad sin titulo",
        eje: normalizarEje(String(p.eje || "")),
        capacidad: String(p.capacidad || "").trim() || null,
        capacidad_dc: String(p.capacidadDC || "").trim() || null,
        contenidos: String(p.contenidos || "").trim() || null,
        objetivo: String(p.objetivo || "").trim() || null,
        desarrollo: String(p.desarrollo || "").trim() || null,
        materiales: String(p.materiales || "").trim() || null,
        estado: "propia",
        confirmada: true,
      }
    })

    const supabase = getSupabase()
    const { data, error } = await supabase.from(TABLA).insert(filas).select()

    if (error) {
      console.error("[v0] Error guardando actividades docentes:", error.message)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, cantidad: (data || []).length, actividades: data || [] })
  } catch (e) {
    console.error("[v0] Error en actividades-docentes POST:", e)
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
  }
}

// ── PATCH: corregir el eje, o marcar como usada cuando ALBA la toma ─────────
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, eje, estado, elegida, nombre, desarrollo, materiales } = body

    if (!id) return NextResponse.json({ ok: false, error: "Falta id" }, { status: 400 })

    const supabase = getSupabase()
    const cambios: Record<string, unknown> = {}

    // La maestra puede ajustar lo suyo: si ALBA propuso ensalada de frutas y
    // ella prefiere trufas de avena, lo cambia. El area, la capacidad y el
    // "Observa si" NO se tocan: los decide la secuencia y sostienen la
    // evaluacion.
    if (typeof nombre === "string" && nombre.trim()) cambios.nombre = nombre.trim()
    if (typeof desarrollo === "string") cambios.desarrollo = desarrollo.trim() || null
    if (typeof materiales === "string") cambios.materiales = materiales.trim() || null

    if (typeof eje === "string") {
      const ejeOk = normalizarEje(eje)
      if (!ejeOk) return NextResponse.json({ ok: false, error: "Eje invalido" }, { status: 400 })
      cambios.eje = ejeOk
    }

    // "usada" = ALBA ya la sugirio. Sale de la lista de pendientes pero NO se
    // borra: su evidencia es lo que despues permite indexarla y ruteo a la red.
    if (estado === "propia" || estado === "usada" || estado === "red") {
      cambios.estado = estado
    }

    // Las actividades que la maestra eligio para esta semana. Puede marcar
    // VARIAS: si armo una secuencia tiene sentido darla junta.
    if (typeof elegida === "boolean") {
      cambios.elegida = elegida
    }

    if (Object.keys(cambios).length === 0) {
      return NextResponse.json({ ok: false, error: "Nada para actualizar" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from(TABLA)
      .update(cambios)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error actualizando actividad docente:", error.message)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, actividad: data })
  } catch (e) {
    console.error("[v0] Error en actividades-docentes PATCH:", e)
    return NextResponse.json({ ok: false, error: "Error interno" }, { status: 500 })
  }
}

// ── DELETE: la maestra borra una actividad de su repertorio ─────────────────
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ ok: false, error: "Falta id" }, { status: 400 })

  const supabase = getSupabase()
  const { error } = await supabase.from(TABLA).delete().eq("id", id)

  if (error) {
    console.error("[v0] Error borrando actividad docente:", error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
