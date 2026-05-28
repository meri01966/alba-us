import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://oairchbitlanpzywncua.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haXJjaGJpdGxhbnB6eXduY3VhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNjM4MzIsImV4cCI6MjA5MzczOTgzMn0.7_f8egxeOn9FUOGkF8Mp-OBhpo2rGaqy-6e2rcCXLiA"

function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

const NOMBRE_EJE: Record<string, string> = {
  CF: "Conciencia Fonologica",
  CT: "Comprension de Textos",
  O:  "Oralidad",
}

const STATUS_VAL: Record<string, number> = {
  green:   100,
  logrado: 100,
  yellow:  50,
  proceso: 50,
  red:     10,
  refuerzo: 10,
  blue:    0,
}

// Genera redaccion de "que trabajamos" en primera persona para reunion de padres
function queTrabajamosTxt(eje: string, actividades: string[]): string {
  const nombre = NOMBRE_EJE[eje] || eje
  if (actividades.length === 0) return `Trabajamos el area de ${nombre}.`
  if (actividades.length === 1) {
    return `En el area de ${nombre} trabajamos "${actividades[0]}". Esta actividad nos permitio introducir y explorar los contenidos del eje.`
  }
  const listado = actividades.slice(0, -1).map(a => `"${a}"`).join(", ") + ` y "${actividades[actividades.length - 1]}"`
  return `En el area de ${nombre} realizamos ${actividades.length} actividades a lo largo del periodo: ${listado}. Cada una fue pensada para avanzar de manera progresiva en los aprendizajes del eje.`
}

// Genera redaccion de "como lo trabajamos" describiendo metodologias y recursos
function comoTrabajamosTxt(eje: string, actividades: string[], metodologias: string[]): string {
  const metodBase: Record<string, string> = {
    CF: "juegos de discriminacion sonora, palmadas silabicas, tarjetas de imagenes, actividades con espejo para observar la posicion de los labios y la boca, y trabajo en parejas y equipos pequenos",
    CT: "lectura dialogica con pausas estrategicas, cruz de comprension, predicciones antes de leer y verificacion posterior, muro de palabras nuevas y recontado oral en cadena",
    O:  "la metodologia ECO-E (Escucha, Comprension y Oral-Expresion) con oralidad estructurada, respuesta en oracion completa, y situaciones comunicativas graduadas en complejidad",
  }
  const base = metodBase[eje] || "actividades variadas y participativas"
  const extra = metodologias.length > 0
    ? ` Los docentes utilizaron materiales como ${metodologias.slice(0, 4).join(", ")}.`
    : ""
  return `Las actividades se desarrollaron utilizando ${base}.${extra} Se priorizo la participacion activa de todos los ninos y la interaccion entre pares.`
}

// Genera redaccion de "que aprendio el grupo" con datos cuantitativos
function queAprendioTxt(eje: string, pctLogrado: number, pctProceso: number, pctRefuerzo: number, total: number): string {
  const nombre = NOMBRE_EJE[eje] || eje
  if (pctLogrado >= 70) {
    return `El grupo demostro un muy buen nivel de apropiacion en ${nombre}. El ${pctLogrado}% de los alumnos alcanzo los objetivos propuestos en forma sostenida a lo largo de las ${total} evaluaciones realizadas. Un ${pctProceso}% se encuentra en proceso de consolidacion y continuara avanzando con la practica.`
  }
  if (pctLogrado >= 40) {
    return `El grupo mostro avances significativos en ${nombre}. El ${pctLogrado}% de los alumnos logro los objetivos planteados, mientras que el ${pctProceso}% esta en proceso de consolidacion. Un ${pctRefuerzo}% requiere continuidad y refuerzo especifico para alcanzar los aprendizajes esperados.`
  }
  return `El grupo se encuentra en etapa de construccion de los aprendizajes de ${nombre}. El ${pctLogrado}% alcanzo los objetivos, el ${pctProceso}% esta transitando el proceso y el ${pctRefuerzo}% necesita apoyo adicional. Las proximas actividades estaran orientadas a consolidar estos aprendizajes de manera gradual.`
}

// Genera sugerencias de continuacion basadas en el nivel grupal
function sugerenciasContinuacion(eje: string, promedio: number): string[] {
  if (eje === "CF") {
    if (promedio >= 70) return [
      "Avanzar hacia actividades de sintesis y analisis de fonemas con mayor complejidad",
      "Introducir la asociacion letra-sonido en el contexto de palabras conocidas",
      "Trabajar con texto escrito simple para conectar conciencia fonologica con lectura inicial",
    ]
    if (promedio >= 40) return [
      "Consolidar la identificacion de sonido inicial con actividades de mayor variedad de consonantes",
      "Reforzar la segmentacion silabica usando movimiento corporal y comparacion de longitudes",
      "Introducir el sonido final con apoyo visual de tarjetas y fichas de colores",
    ]
    return [
      "Retomar la discriminacion de sonidos del entorno con actividades de alta motivacion",
      "Trabajar rimas con los nombres propios de los ninos del grupo antes de pasar a otras palabras",
      "Usar el cuerpo como anclaje: palmadas, pasos y gestos para cada actividad fonologica",
    ]
  }
  if (eje === "CT") {
    if (promedio >= 70) return [
      "Incorporar textos informativos y poesias para diversificar los generos trabajados",
      "Profundizar el nivel critico: debates sobre dilemas de los personajes con argumentacion estructurada",
      "Trabajar la produccion oral de recontados cada vez mas autonomos y elaborados",
    ]
    if (promedio >= 40) return [
      "Consolidar el uso de la cruz de comprension con las cuatro preguntas literales en forma autonoma",
      "Incorporar mas pausas dialogicas inferenciales durante la lectura",
      "Trabajar conexiones texto-vida y texto-texto de manera sistematica",
    ]
    return [
      "Reforzar las predicciones con apoyo visual (solo tapa e ilustraciones) antes de cada lectura",
      "Simplificar la cruz de comprension comenzando por QUIEN y QUE solamente",
      "Usar cuentos de estructura muy simple y repetitiva para facilitar el recontado",
    ]
  }
  if (eje === "O") {
    if (promedio >= 70) return [
      "Avanzar hacia instrucciones de tres pasos con verbalizacion completa y autonoma",
      "Incorporar situaciones de narracion oral espontanea con estructura inicio-desarrollo-cierre",
      "Trabajar turnos de habla extendidos en contextos de debate y argumentacion",
    ]
    if (promedio >= 40) return [
      "Consolidar las respuestas en oracion completa aplicando la Regla ECO en todas las actividades",
      "Agregar el uso de conectores temporales: primero, luego, despues, finalmente",
      "Aumentar gradualmente la complejidad de las instrucciones a dos pasos",
    ]
    return [
      "Reforzar la oracion completa comenzando siempre con el modelo de la docente",
      "Trabajar escucha activa con sonidos familiares antes de pasar a instrucciones",
      "Usar el microfono de juguete para aumentar la confianza en la expresion oral",
    ]
  }
  return ["Continuar con actividades del mismo nivel para consolidar los aprendizajes"]
}

function tendencia(resultadosRecientes: string[]): "mejorando" | "estable" | "necesita_apoyo" {
  if (resultadosRecientes.length < 3) return "estable"
  const recientes = resultadosRecientes.slice(-Math.min(6, resultadosRecientes.length))
  const pctGreen = recientes.filter(r => r === "green" || r === "logrado").length / recientes.length
  if (pctGreen >= 0.6) return "mejorando"
  const pctRed = recientes.filter(r => r === "red" || r === "refuerzo").length / recientes.length
  if (pctRed >= 0.5) return "necesita_apoyo"
  return "estable"
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sala = searchParams.get("sala")

  if (!sala) {
    return NextResponse.json({ ok: false, error: "Falta el parametro sala" }, { status: 400 })
  }

  const supabase = getSupabase()

  try {
    // 1. Traer todos los registros de seguimiento de la sala
    const { data: seguimientosRaw, error: errSeg } = await supabase
      .from("seguimiento")
      .select("alumno_id, eje, estado, actividad, fecha")
      .eq("sala", sala)
      .order("fecha", { ascending: true })

    if (errSeg) console.error("[v0] Error seguimiento:", errSeg.message)
    const seguimientos = seguimientosRaw || []

    // 2. Traer registros de cierre (actividades_docente, observaciones, eje)
    const { data: cierresRaw, error: errCierres } = await supabase
      .from("registro_cierre")
      .select("eje, actividad_docente, observaciones, fecha")
      .eq("sala", sala)
      .order("fecha", { ascending: true })

    if (errCierres) console.error("[v0] Error cierres:", errCierres.message)
    const cierres = cierresRaw || []

    // 3. Contar alumnos unicos
    const alumnosUnicos = [...new Set(seguimientos.map((s: { alumno_id: string }) => s.alumno_id))]
    const totalAlumnos = alumnosUnicos.length

    // Sin datos
    if (seguimientos.length === 0 && cierres.length === 0) {
      return NextResponse.json({
        ok: true,
        sinDatos: true,
        mensaje: `ALBA analiza los datos que vas cargando en cada clase. Para generar el informe grupal de ${sala}, necesito que registres evaluaciones de los alumnos usando el boton "Finalizar Jornada" despues de cada actividad. El informe se construira automaticamente a partir de esos datos reales.`,
        sala,
        ejes: [],
      })
    }

    // 4. Agrupar por eje
    const porEje: Record<string, {
      resultados: string[]
      actividades: string[]
      metodologias: string[]
      fechas: string[]
    }> = {}

    for (const s of seguimientos) {
      const eje = (s.eje as string) || "CF"
      if (!porEje[eje]) porEje[eje] = { resultados: [], actividades: [], metodologias: [], fechas: [] }
      porEje[eje].resultados.push(s.estado || "red")
      if (s.actividad && !porEje[eje].actividades.includes(s.actividad)) {
        porEje[eje].actividades.push(s.actividad)
      }
      if (s.fecha) porEje[eje].fechas.push(s.fecha)
    }

    // Agregar actividades de cierres (registradas por docente)
    for (const c of cierres) {
      const eje = (c.eje as string) || "CF"
      if (!porEje[eje]) porEje[eje] = { resultados: [], actividades: [], metodologias: [], fechas: [] }
      if (c.actividad_docente && !porEje[eje].actividades.includes(c.actividad_docente)) {
        porEje[eje].actividades.push(c.actividad_docente)
      }
      // Extraer materiales/metodologias de observaciones
      if (c.observaciones) {
        const obs = (c.observaciones as string).toLowerCase()
        const keywords = ["tarjetas", "espejo", "dado", "titere", "cancion", "cuento", "palmadas", "pizarron", "post-it", "grabadora"]
        for (const kw of keywords) {
          if (obs.includes(kw) && !porEje[eje].metodologias.includes(kw)) {
            porEje[eje].metodologias.push(kw)
          }
        }
      }
    }

    // 5. Generar reporte por eje
    const ejesConDatos = Object.keys(porEje).filter(eje => porEje[eje].resultados.length > 0)

    const ejesReporte = ejesConDatos.map(eje => {
      const datos = porEje[eje]
      const total = datos.resultados.length
      const verdes    = datos.resultados.filter(r => r === "green"   || r === "logrado").length
      const amarillos = datos.resultados.filter(r => r === "yellow"  || r === "proceso").length
      const rojos     = datos.resultados.filter(r => r === "red"     || r === "refuerzo").length
      const pctLogrado  = Math.round((verdes    / total) * 100)
      const pctProceso  = Math.round((amarillos / total) * 100)
      const pctRefuerzo = Math.round((rojos     / total) * 100)
      const sum = datos.resultados.reduce((acc, r) => acc + (STATUS_VAL[r] ?? 0), 0)
      const promedioGrupal = Math.round(sum / total)

      const tendenciaGrupal = tendencia(datos.resultados)

      const periodoDesde = datos.fechas.length > 0
        ? new Date(datos.fechas[0]).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
        : null
      const periodoHasta = datos.fechas.length > 0
        ? new Date(datos.fechas[datos.fechas.length - 1]).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
        : null

      return {
        eje,
        nombre: NOMBRE_EJE[eje] || eje,
        totalClases: datos.actividades.length || total,
        actividadesUnicas: datos.actividades,
        periodoDesde,
        periodoHasta,
        metodologias: datos.metodologias,
        pctLogrado,
        pctProceso,
        pctRefuerzo,
        promedioGrupal,
        tendencia: tendenciaGrupal,
        // Textos listos para leer en reunion de padres
        txt_queTrabajaamos: queTrabajamosTxt(eje, datos.actividades),
        txt_comoLoTrabajaamos: comoTrabajamosTxt(eje, datos.actividades, datos.metodologias),
        txt_queAprendioElGrupo: queAprendioTxt(eje, pctLogrado, pctProceso, pctRefuerzo, total),
        sugerenciasContinuacion: sugerenciasContinuacion(eje, promedioGrupal),
      }
    })

    // Ordenar CF > CT > O
    const orden: Record<string, number> = { CF: 0, CT: 1, O: 2 }
    ejesReporte.sort((a, b) => (orden[a.eje] ?? 9) - (orden[b.eje] ?? 9))

    const todasFechas = seguimientos.map((s: { fecha: string }) => s.fecha).filter(Boolean).sort()

    return NextResponse.json({
      ok: true,
      sinDatos: false,
      sala,
      totalAlumnos,
      totalClases: [...new Set(seguimientos.map((s: { fecha: string }) => s.fecha?.split("T")[0]))].length,
      periodoDesde: todasFechas.length > 0
        ? new Date(todasFechas[0]).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
        : null,
      periodoHasta: todasFechas.length > 0
        ? new Date(todasFechas[todasFechas.length - 1]).toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" })
        : null,
      ejes: ejesReporte,
    })
  } catch (err) {
    console.error("[v0] Error en reporte-grupal:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
