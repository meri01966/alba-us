import { NextResponse } from "next/server"

const AIRTABLE_TOKEN  = process.env.AIRTABLE_TOKEN
const BASE_ID         = process.env.AIRTABLE_BASE_ID || "appvmkxMrMWhGbclm"
// Tabla del Cerebro Central — secuencia diaria predefinida
const TABLE_ID        = "tbllr0ae0dLj1VIfN"

interface AirtableRecord {
  id: string
  fields: Record<string, string | number>
}

// Actividad de demo para cuando no hay token o la API falla
// Eje: Conciencia Fonologica (CF)
const DEMO_BRAIN: BrainActivity = {
  id:          "demo",
  dia:         37,
  titulo:      "Reconocimiento de Sonido Inicial /M/",
  descripcion: "1. Mostrar imagenes de objetos: MESA, MONO, MANZANA, MAPA.\n2. Pronunciar cada palabra enfatizando el sonido /M/ inicial.\n3. Pedir a los ninos que repitan el sonido /M/ solos.\n4. Juego: aplaudir cuando escuchen una palabra que empiece con /M/.",
  objetivo:    "Que los ninos identifiquen y reproduzcan el sonido /M/ en posicion inicial de palabra.",
  source:      "demo",
}

export interface BrainActivity {
  id:          string
  dia:         number
  titulo:      string
  descripcion: string
  objetivo:    string
  source:      "airtable" | "demo" | "alba"
  ejeRecomendado?: string
  razon?: string
}

function recordToBrain(record: AirtableRecord): BrainActivity {
  const f = record.fields
  return {
    id:          record.id,
    dia:         typeof f["Dia"] === "number" ? f["Dia"] : Number(f["Dia"]) || 0,
    titulo:      String(f["Titulo"]      || f["titulo"]      || ""),
    descripcion: String(f["Descripcion"] || f["descripcion"] || f["Actividad"] || ""),
    objetivo:    String(f["Objetivo"]    || f["objetivo"]    || ""),
    source:      "airtable",
  }
}

// Actividades sugeridas por eje basadas en resultados
const ACTIVIDADES_POR_EJE: Record<string, BrainActivity[]> = {
  CF: [
    {
      id: "cf-refuerzo-1",
      dia: 0,
      titulo: "Refuerzo de Sonidos Iniciales",
      descripcion: "1. Seleccionar 5 alumnos que necesitan refuerzo.\n2. Usar tarjetas con imagenes de objetos conocidos.\n3. Enfatizar el sonido inicial de cada palabra.\n4. Juego de imitacion: repetir el sonido 3 veces.\n5. Actividad en parejas: encontrar objetos que empiecen igual.",
      objetivo: "Fortalecer la identificacion de sonidos iniciales en alumnos con dificultades.",
      source: "alba",
      ejeRecomendado: "CF",
    },
    {
      id: "cf-avance-1",
      dia: 0,
      titulo: "Segmentacion Silabica Avanzada",
      descripcion: "1. Presentar palabras de 3-4 silabas.\n2. Aplaudir por cada silaba.\n3. Usar el cuerpo: saltar por silaba.\n4. Desafio: contar silabas sin ayuda visual.\n5. Crear palabras nuevas combinando silabas.",
      objetivo: "Avanzar hacia la segmentacion de palabras mas complejas.",
      source: "alba",
      ejeRecomendado: "CF",
    },
  ],
  CT: [
    {
      id: "ct-refuerzo-1",
      dia: 0,
      titulo: "Exploracion de Textos con Apoyo",
      descripcion: "1. Mostrar un libro grande con imagenes claras.\n2. Senalar titulo, autor, portada.\n3. Preguntar: Donde empezamos a leer?\n4. Seguir el texto con el dedo.\n5. Identificar donde hay letras vs imagenes.",
      objetivo: "Reforzar conceptos basicos sobre la organizacion del texto impreso.",
      source: "alba",
      ejeRecomendado: "CT",
    },
  ],
  O: [
    {
      id: "o-refuerzo-1",
      dia: 0,
      titulo: "Circulo de Conversacion Guiada",
      descripcion: "1. Sentarse en circulo.\n2. Tema del dia: Mi juguete favorito.\n3. Cada nino tiene 1 minuto para hablar.\n4. Usar preguntas guia: Como es? Por que te gusta?\n5. Practicar escucha activa: mirar a quien habla.",
      objetivo: "Desarrollar la expresion oral y la escucha activa en un ambiente seguro.",
      source: "alba",
      ejeRecomendado: "O",
    },
  ],
}

// Analizar evaluaciones y generar sugerencia inteligente
function generarSugerenciaInteligente(
  evaluaciones: Record<string, string>,
  ejeActual: string,
  stats: { green: number; yellow: number; red: number; sinEvaluar: number }
): BrainActivity {
  const total = stats.green + stats.yellow + stats.red
  
  // Si no hay evaluaciones, sugerir comenzar
  if (total === 0) {
    return {
      ...DEMO_BRAIN,
      razon: "Aun no hay evaluaciones del dia. Comienza evaluando a tus alumnos con el semaforo.",
    }
  }

  const porcentajeRojo = (stats.red / total) * 100
  const porcentajeAmarillo = (stats.yellow / total) * 100
  const porcentajeVerde = (stats.green / total) * 100

  let actividad: BrainActivity
  let razon: string

  // Logica de decision basada en resultados
  if (porcentajeRojo > 40) {
    // Muchos en rojo: sugerir refuerzo intensivo
    const actividadesEje = ACTIVIDADES_POR_EJE[ejeActual] || ACTIVIDADES_POR_EJE.CF
    actividad = { ...actividadesEje[0] }
    razon = `${stats.red} alumnos (${Math.round(porcentajeRojo)}%) necesitan refuerzo en ${ejeActual === "CF" ? "Conciencia Fonologica" : ejeActual === "CT" ? "Conocimiento del Texto" : "Oralidad"}. ALBA sugiere repetir actividades de consolidacion manana.`
  } else if (porcentajeAmarillo > 50) {
    // Muchos en proceso: sugerir practica adicional
    const actividadesEje = ACTIVIDADES_POR_EJE[ejeActual] || ACTIVIDADES_POR_EJE.CF
    actividad = { ...actividadesEje[0] }
    razon = `${stats.yellow} alumnos (${Math.round(porcentajeAmarillo)}%) estan en proceso. ALBA sugiere actividades de practica guiada para consolidar.`
  } else if (porcentajeVerde > 60) {
    // Mayoria logrado: avanzar al siguiente nivel
    const actividadesEje = ACTIVIDADES_POR_EJE[ejeActual] || ACTIVIDADES_POR_EJE.CF
    actividad = actividadesEje.length > 1 ? { ...actividadesEje[1] } : { ...actividadesEje[0] }
    razon = `Excelente! ${stats.green} alumnos (${Math.round(porcentajeVerde)}%) lograron el objetivo. ALBA sugiere avanzar a actividades mas desafiantes.`
  } else {
    // Grupo mixto: actividad diferenciada
    actividad = {
      id: "mixto-1",
      dia: 0,
      titulo: "Actividad Diferenciada por Niveles",
      descripcion: "1. Dividir la clase en 3 grupos por nivel.\n2. Grupo Verde: actividad autonoma avanzada.\n3. Grupo Amarillo: practica guiada con apoyo.\n4. Grupo Rojo: refuerzo intensivo con la docente.\n5. Rotar cada 10 minutos.",
      objetivo: "Atender las necesidades diferenciadas de cada grupo de alumnos.",
      source: "alba",
      ejeRecomendado: ejeActual,
    }
    razon = `Grupo mixto: ${stats.green} logrado, ${stats.yellow} en proceso, ${stats.red} refuerzo. ALBA sugiere trabajo diferenciado.`
  }

  actividad.razon = razon
  actividad.ejeRecomendado = ejeActual

  return actividad
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { evaluaciones = {}, ejeActual = "CF", stats } = body

    // Generar sugerencia basada en las evaluaciones
    const activity = generarSugerenciaInteligente(
      evaluaciones,
      ejeActual,
      stats || { green: 0, yellow: 0, red: 0, sinEvaluar: 0 }
    )

    return NextResponse.json({ activity })
  } catch (err) {
    console.error("[v0] Error in brain POST:", err)
    return NextResponse.json({ activity: DEMO_BRAIN })
  }
}

export async function GET() {
  // Si no hay token, devolver demo silenciosamente
  if (!AIRTABLE_TOKEN) {
    return NextResponse.json({ activity: DEMO_BRAIN })
  }

  try {
    // Calcular el día actual (número de día del año, ajustable)
    const dayOfYear = Math.ceil(
      (Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) /
        (1000 * 60 * 60 * 24)
    )

    // Intentar traer el registro que corresponde al día actual por campo "Dia"
    // Si no existe ese campo, traer el primer registro
    const filterFormula = encodeURIComponent(`{Dia}=${dayOfYear}`)
    const urlByDay = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?filterByFormula=${filterFormula}&maxRecords=1`

    let response = await fetch(urlByDay, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("[v0] Brain GET error:", response.status)
      return NextResponse.json({ activity: DEMO_BRAIN })
    }

    let data = await response.json()

    // Si no encontró para este día, traer el primer registro disponible
    if (!data.records || data.records.length === 0) {
      const urlFirst = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?maxRecords=1`
      const fallbackResp = await fetch(urlFirst, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_TOKEN}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })
      if (fallbackResp.ok) {
        data = await fallbackResp.json()
      }
    }

    if (!data.records || data.records.length === 0) {
      return NextResponse.json({ activity: DEMO_BRAIN })
    }

    return NextResponse.json({ activity: recordToBrain(data.records[0]) })
  } catch (err) {
    console.error("[v0] Error fetching brain activity:", err)
    return NextResponse.json({ activity: DEMO_BRAIN })
  }
}
