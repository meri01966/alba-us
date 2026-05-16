import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
)

// ─── SECUENCIA ANUAL POR EJE ───────────────────────────────────────────────
// Cada clase completada en un eje avanza a la siguiente actividad de esa secuencia.
// La logica es: clasesCompletadasEnEje -> indice en el array -> siguiente actividad.

const SECUENCIA: Record<"CF" | "CT" | "O", { titulo: string; objetivo: string; materiales: string[] }[]> = {
  CF: [
    { titulo: "Sonidos del entorno", objetivo: "Discriminar sonidos ambientales y asociarlos a su fuente", materiales: ["Campana o triangulo", "Grabadora con sonidos del entorno", "Tarjetas con imagenes de fuentes sonoras", "Antifaz"] },
    { titulo: "Rimas con nombres", objetivo: "Identificar y producir palabras que riman", materiales: ["Cancionero ilustrado", "Titere", "Tarjetas con palabras que riman"] },
    { titulo: "Separacion en silabas", objetivo: "Separar palabras en silabas usando palmadas", materiales: ["Tarjetas con imagenes", "Circulos de cartulina para contar silabas", "Tambor"] },
    { titulo: "Sonido inicial /a/", objetivo: "Identificar palabras que comienzan con /a/", materiales: ["Tarjetas con imagenes que empiezan con A", "Letra A en distintos formatos", "Caja misteriosa"] },
    { titulo: "Sonido inicial /e/", objetivo: "Identificar palabras que comienzan con /e/", materiales: ["Tarjetas con imagenes que empiezan con E", "Espejo", "Letra E"] },
    { titulo: "Sonido inicial /i/", objetivo: "Identificar palabras que comienzan con /i/", materiales: ["Tarjetas con imagenes que empiezan con I", "Letra I"] },
    { titulo: "Sonido inicial /o/", objetivo: "Identificar palabras que comienzan con /o/", materiales: ["Tarjetas con imagenes que empiezan con O", "Letra O"] },
    { titulo: "Sonido inicial /u/", objetivo: "Identificar palabras que comienzan con /u/", materiales: ["Tarjetas con imagenes que empiezan con U", "Letra U"] },
    { titulo: "Vocales - Repaso", objetivo: "Consolidar identificacion de sonidos vocalicos iniciales", materiales: ["Set completo de vocales", "Dado con vocales", "Cajas para clasificar"] },
    { titulo: "Sonido inicial /m/", objetivo: "Identificar palabras que comienzan con /m/", materiales: ["Tarjetas con imagenes que empiezan con M", "Espejo", "Letra M"] },
    { titulo: "Sonido inicial /p/", objetivo: "Identificar palabras que comienzan con /p/", materiales: ["Tarjetas con imagenes que empiezan con P", "Plumas para soplar", "Letra P"] },
    { titulo: "Sonido inicial /s/", objetivo: "Identificar palabras que comienzan con /s/", materiales: ["Tarjetas con imagenes que empiezan con S", "Serpiente de peluche", "Letra S"] },
    { titulo: "Sonido inicial /l/", objetivo: "Identificar palabras que comienzan con /l/", materiales: ["Tarjetas con imagenes que empiezan con L", "Letra L"] },
    { titulo: "Sonido inicial /t/", objetivo: "Identificar palabras que comienzan con /t/", materiales: ["Tarjetas con imagenes que empiezan con T", "Letra T"] },
    { titulo: "Sonido inicial /n/", objetivo: "Identificar palabras que comienzan con /n/", materiales: ["Tarjetas con imagenes que empiezan con N", "Letra N"] },
    { titulo: "Consonantes - Repaso", objetivo: "Consolidar identificacion de sonidos consonanticos", materiales: ["Set de consonantes trabajadas", "Tablero de clasificacion"] },
    { titulo: "Sonido final", objetivo: "Identificar el sonido final de palabras cortas", materiales: ["Tarjetas con imagenes", "Fichas de colores", "Tablero de sonidos finales"] },
    { titulo: "Sonidos medios", objetivo: "Identificar sonidos en posicion media de palabras", materiales: ["Tarjetas CVC", "Esquema de tres cajas"] },
    { titulo: "Sintesis de fonemas", objetivo: "Unir fonemas para formar palabras simples", materiales: ["Robot que habla lento", "Tarjetas con imagenes de palabras cortas"] },
    { titulo: "Analisis de fonemas", objetivo: "Descomponer palabras en sus fonemas individuales", materiales: ["Cubos para contar fonemas", "Tarjetas con imagenes"] },
    { titulo: "Sustitucion de fonemas", objetivo: "Cambiar un fonema para crear palabras nuevas", materiales: ["Letras moviles", "Pizarra o franelografo"] },
    { titulo: "Omision de fonemas", objetivo: "Identificar que palabra queda al quitar un fonema", materiales: ["Tarjetas de letras", "Fichas para tapar sonidos"] },
    { titulo: "Adicion de fonemas", objetivo: "Agregar fonemas para crear palabras nuevas", materiales: ["Letras moviles", "Pizarra"] },
    { titulo: "Manipulacion avanzada", objetivo: "Realizar operaciones complejas con fonemas", materiales: ["Set completo de letras", "Tablero de manipulacion"] },
    { titulo: "Evaluacion CF", objetivo: "Evaluar el dominio de la conciencia fonologica", materiales: ["Rubrica de evaluacion", "Registro individual"] },
  ],
  CT: [
    { titulo: "Exploracion del libro", objetivo: "Manipular el libro y explorar portada e ilustraciones", materiales: ["Cuento con portada atractiva", "Atril para libro"] },
    { titulo: "Antes de leer: Predicciones", objetivo: "Formular hipotesis sobre el contenido mirando la tapa", materiales: ["Libro seleccionado", "Post-its para anotar predicciones"] },
    { titulo: "Lectura dialogica: Pausas", objetivo: "Participar con preguntas durante la lectura", materiales: ["Libro con marcadores de pausas", "Titere preguntador", "Campana"] },
    { titulo: "Vocabulario en contexto", objetivo: "Inferir significado de palabras nuevas", materiales: ["Libro seleccionado", "Tarjetas de vocabulario", "Diccionario ilustrado"] },
    { titulo: "Recontar la historia", objetivo: "Recontar con propias palabras usando secuencia", materiales: ["Libro leido", "Imagenes de secuencia del cuento", "Titeres"] },
    { titulo: "Conexiones texto-vida", objetivo: "Conectar el texto con experiencias personales", materiales: ["Libro leido", "Hojas para dibujar conexiones"] },
    { titulo: "Cruz de comprension: QUIEN", objetivo: "Responder QUIEN usando evidencia del texto", materiales: ["Cuento con personajes claros", "Tarjetas QUIEN", "Siluetas de personajes"] },
    { titulo: "Cruz de comprension: QUE", objetivo: "Responder QUE sucede con informacion explicita", materiales: ["Cuento seleccionado", "Tarjetas QUE"] },
    { titulo: "Cruz de comprension: DONDE", objetivo: "Responder DONDE ocurre con evidencia textual", materiales: ["Cuento con lugares definidos", "Mapa del cuento"] },
    { titulo: "Cruz de comprension: CUANDO", objetivo: "Responder CUANDO suceden los eventos", materiales: ["Cuento con secuencia temporal", "Linea de tiempo"] },
    { titulo: "Cruz: Integracion literal", objetivo: "Usar las 4 preguntas literales juntas", materiales: ["Cruz de comprension en carton", "Cuento nuevo"] },
    { titulo: "Cruz: POR QUE - causa y efecto", objetivo: "Inferir POR QUE suceden las cosas", materiales: ["Cuento con causas claras", "Flechas causa-efecto"] },
    { titulo: "Cruz: COMO sucede", objetivo: "Inferir COMO suceden las acciones", materiales: ["Cuento seleccionado", "Tarjetas COMO"] },
    { titulo: "Cruz: QUE OPINAS", objetivo: "Expresar opinion fundamentada sobre el texto", materiales: ["Cuento con dilema", "Caritas de opinion", "Microfono de juguete"] },
    { titulo: "Integracion LD + Cruz", objetivo: "Aplicar lectura dialogica y cruz de comprension juntas", materiales: ["Cuento nuevo", "Guia LD", "Cruz completa"] },
    { titulo: "Texto informativo", objetivo: "Aplicar lectura dialogica con texto no narrativo", materiales: ["Libro informativo con imagenes", "Tarjetas KWL"] },
    { titulo: "Secuencia narrativa completa", objetivo: "Identificar inicio, conflicto, resolucion y cierre", materiales: ["Cuento con estructura clara", "Tarjetas de estructura"] },
    { titulo: "Personajes: caracteristicas", objetivo: "Describir caracteristicas fisicas y de personalidad", materiales: ["Cuento con personajes variados", "Organizador grafico de personaje"] },
    { titulo: "Vocabulario literario", objetivo: "Reconocer y usar vocabulario propio de los textos", materiales: ["Libro seleccionado", "Diccionario ilustrado", "Tarjetas de palabras"] },
    { titulo: "Comprension critica", objetivo: "Evaluar las acciones de los personajes con argumentos", materiales: ["Cuento con dilemas eticos", "Balanza de justicia"] },
    { titulo: "Evaluacion CT", objetivo: "Evaluar comprension con Lectura Dialogica y Cruz", materiales: ["Rubrica de evaluacion", "Cuento de evaluacion"] },
  ],
  O: [
    // ECO ESTRUCTURADO - ESCUCHAR (E)
    { titulo: "ECO-E: Sonidos del entorno", objetivo: "Identificar y discriminar sonidos ambientales. REGLA ECO: Modelar oracion completa ante respuesta de palabra suelta.", materiales: ["Grabadora con sonidos", "Instrumentos variados", "Campana", "Antifaz"], },
    { titulo: "ECO-E: Escucha de voces", objetivo: "Reconocer voces y responder con oracion completa. ANDAMIO: [Esa es la voz de ___]", materiales: ["Grabaciones de voces", "Antifaz", "Microfono de juguete"] },
    { titulo: "ECO-E: Instrucciones simples", objetivo: "Seguir instrucciones y verbalizarlas. ANDAMIO: [Yo ___] + [accion]", materiales: ["Objetos para manipular", "Tarjetas con acciones", "Campana"] },
    { titulo: "ECO-E: Instrucciones complejas", objetivo: "Seguir y verbalizar secuencia de dos pasos. ANDAMIO: [Primero ___] + [y despues ___]", materiales: ["Objetos para circuito", "Tarjetas de secuencia"] },
    { titulo: "ECO-E: Atencion en cuentos", objetivo: "Mantener atencion y responder con estructura. ANDAMIO: [En el cuento ___]", materiales: ["Cuentos cortos ilustrados", "Titere narrador"] },
    { titulo: "ECO-E: Escucha selectiva", objetivo: "Identificar informacion especifica. ANDAMIO: [Escuche que ___]", materiales: ["Grabaciones con datos", "Tarjetas de busqueda"] },
    // ECO ESTRUCTURADO - COMPRENDER (C)
    { titulo: "ECO-C: Vocabulario nuevo I", objetivo: "Comprender y usar palabras nuevas en oracion completa. ANDAMIO: [Esto es un/una ___ que ___]", materiales: ["Objetos o imagenes nuevas", "Bolsa misteriosa"] },
    { titulo: "ECO-C: Categorias semanticas", objetivo: "Clasificar y verbalizar categorias. ANDAMIO: [El/La ___ es un/una ___]", materiales: ["Cajas de categorias", "Objetos variados"] },
    { titulo: "ECO-C: Comprension literal", objetivo: "Responder preguntas literales con evidencia del texto. ANDAMIO: [En el cuento, ___ hizo ___]", materiales: ["Cuento conocido", "Tarjetas de preguntas"] },
    { titulo: "ECO-C: Inferencias simples", objetivo: "Inferir causa-efecto con oracion completa. ANDAMIO: [___ esta ___ porque ___]", materiales: ["Historias con causa clara", "Tarjetas de inferencia"] },
    { titulo: "ECO-C: Secuencia temporal", objetivo: "Ordenar y verbalizar eventos con conectores. ANDAMIO: [Primero ___ luego ___ al final ___]", materiales: ["Tarjetas de secuencia", "Linea de tiempo"] },
    { titulo: "ECO-C: Causa y efecto", objetivo: "Identificar y explicar relaciones causales. ANDAMIO: [___ porque ___]", materiales: ["Tarjetas causa-efecto", "Flechas de conexion"] },
    // ECO ESTRUCTURADO - ORALIZAR (O) - No aceptacion de palabras sueltas
    { titulo: "ECO-O: Nombrar con estructura", objetivo: "REGLA: NO aceptar palabras sueltas. Modelar y esperar oracion [El/La ___ es ___] antes de continuar.", materiales: ["Objetos variados", "Tira de frase visual: [El/La] + [objeto] + [es] + [caracteristica]"] },
    { titulo: "ECO-O: Describir con marco", objetivo: "Usar marco ES / TIENE / SIRVE PARA. NO avanzar con palabra suelta.", materiales: ["Objetos para describir", "Marco de descripcion impreso", "Microfono"] },
    { titulo: "ECO-O: Narrar con secuenciadores", objetivo: "Usar PRIMERO / LUEGO / DESPUES / AL FINAL. NO aceptar sin conector.", materiales: ["Tarjetas de secuencia", "Conectores visuales: PRIMERO-LUEGO-DESPUES-AL FINAL"] },
    { titulo: "ECO-O: Explicar procesos", objetivo: "Explicar paso a paso con conectores. NO avanzar sin estructura secuencial.", materiales: ["Material para proceso simple", "Marco: Para hacer X, primero... luego... al final..."] },
    { titulo: "ECO-O: Argumentar con PORQUE", objetivo: "Dar razones. NO aceptar sin PORQUE. ANDAMIO: [A mi me gusta/no me gusta ___ porque ___]", materiales: ["Tarjetas de opinion", "Conector PORQUE visual", "Microfono"] },
    { titulo: "ECO-O: Turnos de dialogo", objetivo: "Dialogar con turnos y oraciones completas. El turno solo se pasa si la respuesta es oracion completa.", materiales: ["Objeto de turno", "Reloj de arena", "Tarjetas de temas"] },
    { titulo: "ECO-O: Exposicion oral", objetivo: "Presentar con estructura INICIO/DESARROLLO/CIERRE. Detener y reiniciar si empieza con palabra suelta.", materiales: ["Guia de exposicion: Hoy voy a hablar de...", "Publico de peluches"] },
    { titulo: "ECO-O: Recontar con emocion", objetivo: "Recontar agregando emociones. ANDAMIO: [Entonces ___ y estaba/sentia ___]", materiales: ["Cuento conocido", "Titeres", "Tarjetas de emociones"] },
    { titulo: "Evaluacion ECO", objetivo: "Evaluar si el alumno usa oraciones completas de forma autonoma sin modelado.", materiales: ["Rubrica ECO", "Checklist: Usa oracion completa SI/NO", "Registro individual"] },
  ],
}

// ─── CALCULAR SIGUIENTE ACTIVIDAD SEGUN CLASES COMPLETADAS ────────────────
// Cada fecha distinta con registros en ese eje = 1 clase completada
// Si el promedio del eje es bajo (muchos rojos), ALBA no avanza y repite
function calcularActividadDelDia(
  eje: "CF" | "CT" | "O",
  clasesCompletadasEnEje: number,
  promedioEje: number
): { actividad: (typeof SECUENCIA)[typeof eje][0]; indice: number; esRepeticion: boolean } {
  const seq = SECUENCIA[eje]
  let indice = Math.min(clasesCompletadasEnEje, seq.length - 1)

  // Si el promedio del eje es menor al 40% (muchos rojos/amarillos),
  // ALBA repite la actividad anterior para consolidar antes de avanzar
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

  try {
    // 1. Cargar alumnos de la sala
    const { data: alumnos } = await supabase
      .from("alumnos")
      .select("id, nombre")
      .eq("sala", sala)

    if (!alumnos || alumnos.length === 0) {
      const actividadInicial = SECUENCIA.CF[0]
      return NextResponse.json({
        sugerencia: {
          eje: "CF",
          actividad: actividadInicial.titulo,
          objetivo: actividadInicial.objetivo,
          materiales: actividadInicial.materiales,
          razon: "Inicio del año. Comenzamos con Conciencia Fonologica: discriminacion auditiva.",
          alumnosEnRiesgo: 0,
          totalAlumnos: 0,
          tendencia: "estancado",
          aprendidoDeLaRed: false,
          numeroClase: 1,
          esRepeticion: false,
        },
        alertas: [],
        historial: { promediosPorEje: { CF: 0, CT: 0, O: 0 } },
        progreso: { totalClasesCompletadas: 0, semanaActual: 1, clasesCompletadasPorEje: { CF: 0, CT: 0, O: 0 } },
      })
    }

    const ids = alumnos.map((a) => a.id)

    // 2. Cargar TODA la evidencia acumulada
    const { data: registros } = await supabase
      .from("seguimiento")
      .select("*")
      .in("alumno_id", ids)
      .order("fecha", { ascending: true })

    const regs = registros || []

    // 3. ANALIZAR PATRONES POR EJE
    const ejes = ["CF", "CT", "O"] as const
    const analisis: Record<string, {
      total: number
      verdes: number
      amarillos: number
      rojos: number
      promedio: number
      alumnosEnRojo: string[]
      actividadesExitosas: { actividad: string; tasa: number }[]
      tendencia: "mejorando" | "estancado" | "empeorando"
      clasesCompletadas: number // Fechas distintas con registros en este eje
    }> = {} as any

    for (const eje of ejes) {
      const regsEje = regs.filter((r) => r.eje === eje)
      const verdes = regsEje.filter((r) => r.resultado === "green").length
      const amarillos = regsEje.filter((r) => r.resultado === "yellow").length
      const rojos = regsEje.filter((r) => r.resultado === "red").length
      const total = regsEje.length
      const promedio = total > 0 ? Math.round((verdes * 100 + amarillos * 50 + rojos * 10) / total) : 0

      // Clases completadas = fechas distintas con al menos 1 registro en ese eje
      const fechasDistintas = new Set(regsEje.map((r) => r.fecha?.split("T")[0])).size
      const clasesCompletadas = fechasDistintas

      // Alumnos actualmente en rojo (ultimo registro)
      const alumnosEnRojo: string[] = []
      for (const al of alumnos) {
        const ultReg = regsEje.filter((r) => r.alumno_id === al.id).pop()
        if (ultReg && ultReg.resultado === "red") alumnosEnRojo.push(al.nombre)
      }

      // Actividades que mas veces dieron verde
      const actMap: Record<string, { total: number; verdes: number }> = {}
      for (const r of regsEje) {
        if (!r.actividad) continue
        if (!actMap[r.actividad]) actMap[r.actividad] = { total: 0, verdes: 0 }
        actMap[r.actividad].total++
        if (r.resultado === "green") actMap[r.actividad].verdes++
      }
      const actividadesExitosas = Object.entries(actMap)
        .map(([actividad, d]) => ({ actividad, tasa: d.total > 2 ? Math.round((d.verdes / d.total) * 100) : 0 }))
        .filter((a) => a.tasa > 0)
        .sort((a, b) => b.tasa - a.tasa)
        .slice(0, 5)

      // Tendencia
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

      analisis[eje] = { total, verdes, amarillos, rojos, promedio, alumnosEnRojo, actividadesExitosas, tendencia, clasesCompletadas }
    }

    // 4. DECIDIR EJE SUGERIDO (eje con menor avance o mas alumnos en rojo)
    let ejeSugerido: "CF" | "CT" | "O" = "CF"
    let peorScore = 999
    for (const eje of ejes) {
      const a = analisis[eje]
      const score = a.promedio - (a.alumnosEnRojo.length * 10) - (a.tendencia === "empeorando" ? 20 : 0)
      if (score < peorScore) {
        peorScore = score
        ejeSugerido = eje
      }
    }

    // 5. CALCULAR ACTIVIDAD SIGUIENTE EN LA SECUENCIA para el eje sugerido
    const { actividad, indice, esRepeticion } = calcularActividadDelDia(
      ejeSugerido,
      analisis[ejeSugerido].clasesCompletadas,
      analisis[ejeSugerido].promedio
    )

    // Razon explicada
    const ejeNombre = ejeSugerido === "CF" ? "Conciencia Fonologica" : ejeSugerido === "CT" ? "Comprension de Textos" : "Oralidad (ECO Estructurado)"
    const razonBase = analisis[ejeSugerido].alumnosEnRojo.length > 0
      ? `${analisis[ejeSugerido].alumnosEnRojo.length} alumno${analisis[ejeSugerido].alumnosEnRojo.length > 1 ? "s" : ""} necesita${analisis[ejeSugerido].alumnosEnRojo.length > 1 ? "n" : ""} refuerzo en ${ejeNombre}.`
      : `Continuamos avanzando en ${ejeNombre}.`
    const razonSecuencia = esRepeticion
      ? ` ALBA sugiere repetir la actividad anterior para consolidar (promedio bajo: ${analisis[ejeSugerido].promedio}%).`
      : ` Clase ${indice + 1} de ${SECUENCIA[ejeSugerido].length} en la secuencia anual.`

    // 6. ALERTAS
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
          alertas.push({ tipo: "persistencia", mensaje: `${al.nombre} lleva 3+ registros en rojo en ${nombre}. Considerar intervencion diferenciada.`, urgencia: "alta" })
        }
      }
      for (const al of alumnos) {
        const regsAl = regs.filter((r) => r.alumno_id === al.id && r.eje === eje).slice(-2)
        if (regsAl.length === 2 && regsAl[0].resultado !== "red" && regsAl[1].resultado === "red") {
          alertas.push({ tipo: "regresion", mensaje: `${al.nombre} retrocedio en ${nombre}. Revisar que cambio.`, urgencia: "media" })
        }
      }
      if (a.tendencia === "empeorando") {
        alertas.push({ tipo: "tendencia", mensaje: `${nombre} muestra tendencia negativa esta semana.`, urgencia: "media" })
      }
    }

    // 7. PROGRESO GENERAL
    const totalClases = new Set(regs.map((r) => r.fecha?.split("T")[0])).size
    const primerRegistro = regs.length > 0 ? new Date(regs[0].fecha) : new Date()
    const semanaActual = Math.max(1, Math.ceil((Date.now() - primerRegistro.getTime()) / (7 * 86400000)))

    return NextResponse.json({
      sugerencia: {
        eje: ejeSugerido,
        actividad: actividad.titulo,
        objetivo: actividad.objetivo,
        materiales: actividad.materiales,
        razon: razonBase + razonSecuencia,
        alumnosEnRiesgo: analisis[ejeSugerido].alumnosEnRojo.length,
        totalAlumnos: alumnos.length,
        tendencia: analisis[ejeSugerido].tendencia,
        aprendidoDeLaRed: analisis[ejeSugerido].actividadesExitosas.length > 0,
        numeroClase: indice + 1,
        esRepeticion,
      },
      alertas: alertas.slice(0, 8),
      historial: {
        promediosPorEje: { CF: analisis.CF.promedio, CT: analisis.CT.promedio, O: analisis.O.promedio },
        tendencias: { CF: analisis.CF.tendencia, CT: analisis.CT.tendencia, O: analisis.O.tendencia },
        actividadesExitosas: { CF: analisis.CF.actividadesExitosas, CT: analisis.CT.actividadesExitosas, O: analisis.O.actividadesExitosas },
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
    console.error("Error en /api/brain:", err)
    const actividadInicial = SECUENCIA.CF[0]
    return NextResponse.json({
      sugerencia: {
        eje: "CF",
        actividad: actividadInicial.titulo,
        objetivo: actividadInicial.objetivo,
        materiales: actividadInicial.materiales,
        razon: "Inicio del recorrido. Comenzamos con Conciencia Fonologica.",
        numeroClase: 1,
        esRepeticion: false,
      },
      alertas: [],
      historial: { promediosPorEje: { CF: 0, CT: 0, O: 0 } },
      progreso: { totalClasesCompletadas: 0, semanaActual: 1, clasesCompletadasPorEje: { CF: 0, CT: 0, O: 0 } },
    })
  }
}
