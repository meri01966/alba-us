"use client"

import { useState, useEffect, useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Printer, List, Plus, BookOpen, BrainCircuit, X, ChevronDown, ChevronRight, Network, FolderOpen, Trash2, CheckCircle2, AlertCircle } from "lucide-react"

// ── Types ──────────────────────────────────────────────────────────────────

type StatusLevel = "green" | "yellow" | "red" | "blue"

interface DayPlanningProps {
  evaluaciones?: Record<string, StatusLevel>
  ejeActual?: string
  actividadActual?: string
  totalAlumnos?: number
  sala?: string
  onActividadALBA?: (actividad: string) => void
  onEjeALBA?: (eje: string) => void
}

interface BrainActivity {
  id:          string
  dia:         number
  semana?:     number
  titulo:      string
  descripcion: string
  objetivo:    string
  materiales?: string[]
  source:      "secuencia" | "alba-ia" | "demo"
  ejeRecomendado?: string
  razon?: string
  claseNumero?: number
  claseDeLaSemana?: number
  aprendidoDeLaRed?: boolean
  salaRed?: string | null
  temaProyecto?: string | null
  sugerenciaPedagogica?: string | null
}

interface Planning {
  id:        string
  titulo:    string
  objetivo:  string
  actividad: string
  recursos:  string
  fecha:     string
}

// ── Tipos Proyecto / Unidad Didáctica ──────────────────────────────────────
interface ActividadProyecto {
  id: string
  titulo: string
  objetivo: string
  desarrollo: string
  materiales: string
}

interface Proyecto {
  id?: string
  sala: string
  titulo: string
  objetivo_general: string
  actividades: ActividadProyecto[]
  estado: "activo" | "finalizado"
  created_at?: string
  finalizado_at?: string | null
}

function crearActividadVacia(): ActividadProyecto {
  return { id: crypto.randomUUID(), titulo: "", objetivo: "", desarrollo: "", materiales: "" }
}

// ── Secuencia Anual de Actividades por Eje ─────────────────────────────────

interface ActividadSecuencia {
  semana: number
  titulo: string
  objetivo: string
  descripcion?: string
  metodologia?: string
}

interface EjeSecuencia {
  nombre: string
  color: string
  bgColor: string
  metodologia?: string
  actividades: ActividadSecuencia[]
}

const SECUENCIA_ANUAL: Record<string, EjeSecuencia> = {
  CF: {
    nombre: "Conciencia Fonologica",
    color: "#3b82f6",
    bgColor: "#eff6ff",
    actividades: [
      { semana: 1,  titulo: "Sonidos del entorno",       objetivo: "Discriminar sonidos ambientales y asociarlos a su fuente",             descripcion: "Los ninos escuchan grabaciones o sonidos en vivo (campana, agua, animales) y los asocian a tarjetas con imagenes. Luego reproducen el sonido con su voz o cuerpo." },
      { semana: 2,  titulo: "Rimas y canciones",         objetivo: "Identificar palabras que riman en canciones conocidas",                  descripcion: "La docente canta canciones rimadas y pide a los ninos completar el par rimado. Se juega a rimar nombres de la sala." },
      { semana: 3,  titulo: "Segmentacion silabica",      objetivo: "Separar palabras en silabas usando palmadas",                          descripcion: "Se dan palmadas por silabas al nombrar objetos del aula. Se cuenta cuantas palmadas tiene cada palabra y se comparan." },
      { semana: 4,  titulo: "Sonido inicial /a/",         objetivo: "Identificar palabras que comienzan con el sonido /a/",                  descripcion: "La docente muestra imagenes y los ninos levantan la mano cuando la palabra empieza con /a/. Se arma un mural con recortes de palabras con ese sonido." },
      { semana: 5,  titulo: "Sonido inicial /e/",         objetivo: "Identificar palabras que comienzan con el sonido /e/",                  descripcion: "Juego de 'busca y encuentra': los ninos recorren el aula buscando objetos cuyo nombre empieza con /e/. Luego los nombran en grupo." },
      { semana: 6,  titulo: "Sonido inicial /i/",         objetivo: "Identificar palabras que comienzan con el sonido /i/",                  descripcion: "Se usa el cuerpo: los ninos forman la letra I con brazos estirados cuando escuchan una palabra que empieza con /i/." },
      { semana: 7,  titulo: "Sonido inicial /o/",         objetivo: "Identificar palabras que comienzan con el sonido /o/",                  descripcion: "La docente lee una lista de palabras y los ninos aplauden solo si empieza con /o/. Se crea un dictado grafico colectivo." },
      { semana: 8,  titulo: "Sonido inicial /u/",         objetivo: "Identificar palabras que comienzan con el sonido /u/",                  descripcion: "Juego de memoria: tarjetas con imagen y sonido inicial. Los ninos las emparejan identificando cuales empiezan con /u/." },
      { semana: 9,  titulo: "Vocales - Repaso",           objetivo: "Consolidar identificacion de sonidos vocalicos iniciales",              descripcion: "Ruleta de vocales: la docente gira una ruleta con vocales y los ninos dicen palabras que empiezan con esa vocal. Se registra en pizarron." },
      { semana: 10, titulo: "Sonido inicial /m/",         objetivo: "Identificar palabras que comienzan con el sonido /m/",                  descripcion: "Los ninos imitan el sonido /m/ y buscan en laminas palabras que comiencen con ese sonido. Construyen una oracion con una de ellas." },
      { semana: 11, titulo: "Sonido inicial /p/",         objetivo: "Identificar palabras que comienzan con el sonido /p/",                  descripcion: "Juego de 'pesca': los ninos 'pescan' tarjetas con imagenes y clasifican las que empiezan con /p/ en un canasto especial." },
      { semana: 12, titulo: "Sonido inicial /s/",         objetivo: "Identificar palabras que comienzan con el sonido /s/",                  descripcion: "Trabajo en parejas: un nino dice una palabra y el otro decide si empieza con /s/. Luego se intercambian roles." },
      { semana: 13, titulo: "Sonido inicial /l/",         objetivo: "Identificar palabras que comienzan con el sonido /l/",                  descripcion: "La docente presenta un cuento con muchas palabras que empiezan con /l/. Los ninos levantan su tarjeta cada vez que escuchan una." },
      { semana: 14, titulo: "Sonido inicial /t/",         objetivo: "Identificar palabras que comienzan con el sonido /t/",                  descripcion: "Se usa un dado con imagenes: al girar, si la imagen empieza con /t/ el nino suma un punto. Se juega en equipos." },
      { semana: 15, titulo: "Sonido inicial /n/",         objetivo: "Identificar palabras que comienzan con el sonido /n/",                  descripcion: "Los ninos nombran sus objetos personales y de la sala que empiezan con /n/. Se registra en un grafico colectivo." },
      { semana: 16, titulo: "Consonantes - Repaso",       objetivo: "Consolidar identificacion de sonidos consonanticos",                    descripcion: "Bingo de sonidos iniciales: cada nino tiene un cartero con consonantes trabajadas y marca cuando escucha una palabra que empieza con ese sonido." },
      { semana: 17, titulo: "Sonido final",               objetivo: "Identificar el sonido final de palabras cortas",                        descripcion: "La docente dice palabras de dos silabas y los ninos 'atrapan' el ultimo sonido estirando la ultima silaba. Se registra el sonido final en tarjetas." },
      { semana: 18, titulo: "Sonidos medios",             objetivo: "Identificar sonidos en posicion media de palabras",                     descripcion: "Se trabaja con palabras de tres silabas. Los ninos 'abren' la palabra separando inicio-medio-final con las manos y dicen el sonido del medio." },
      { semana: 19, titulo: "Sintesis de fonemas",        objetivo: "Unir fonemas para formar palabras simples",                            descripcion: "La docente pronuncia fonemas separados (/m/...../a/...../r/) y los ninos adivinan la palabra que se forma. Se usan palabras del entorno cotidiano." },
      { semana: 20, titulo: "Analisis de fonemas",        objetivo: "Descomponer palabras en sus fonemas individuales",                     descripcion: "Los ninos reciben una palabra y con fichas o bloques representan cada fonema. Luego cuentan cuantos fonemas tiene." },
      { semana: 21, titulo: "Sustitucion de fonemas",     objetivo: "Cambiar un fonema para crear palabras nuevas",                         descripcion: "La docente dice una palabra y propone cambiar el primer sonido. Los ninos descubren la nueva palabra. Ejemplo: 'pato' → cambiar /p/ por /g/ → 'gato'." },
      { semana: 22, titulo: "Omision de fonemas",         objetivo: "Identificar que palabra queda al quitar un fonema",                    descripcion: "Se practica quitar el sonido inicial o final de una palabra y decir lo que queda. Ejemplo: 'sol' sin /s/ → 'ol'. Se usa apoyo visual." },
      { semana: 23, titulo: "Adicion de fonemas",         objetivo: "Agregar fonemas para crear palabras nuevas",                           descripcion: "Los ninos reciben palabras cortas y agregan un fonema al inicio o al final para crear palabras nuevas. Se comparan los resultados en grupo." },
      { semana: 24, titulo: "Manipulacion avanzada",      objetivo: "Realizar operaciones complejas con fonemas",                           descripcion: "Desafio grupal: los ninos reciben una serie de operaciones con fonemas (quitar, agregar, sustituir) y descifran la palabra resultante." },
      { semana: 25, titulo: "Evaluacion CF",              objetivo: "Evaluar el dominio de la conciencia fonologica",                        descripcion: "Actividad de cierre: cada nino participa en estaciones de evaluacion (rimas, segmentacion, sonido inicial) mientras la docente registra los logros." },
    ],
  },
  CT: {
    nombre: "Conocimiento del Texto - Lectura Dialogica y Cruz de Comprension",
    color: "#10b981",
    bgColor: "#ecfdf5",
    metodologia: "Lectura Dialogica + Cruz de Comprension",
    actividades: [
      // BLOQUE 1: Lectura Dialogica - Fundamentos (Semanas 1-8)
      { semana: 1,  titulo: "LD: Antes de leer - Exploracion del libro",  objetivo: "Activar conocimientos previos observando portada, titulo e ilustraciones",          descripcion: "La docente presenta el libro cerrado. Los ninos observan la tapa, el titulo y las ilustraciones. En ronda responden: de que creen que trata el libro? Quienes apareceran?", metodologia: "Lectura Dialogica - Antes" },
      { semana: 2,  titulo: "LD: Antes de leer - Predicciones",           objetivo: "Formular hipotesis sobre el contenido a partir de elementos paratextuales",        descripcion: "Antes de leer, cada nino dice en voz alta su prediccion sobre la historia. Se registran las predicciones en el pizarron y al finalizar la lectura se verifican.", metodologia: "Lectura Dialogica - Antes" },
      { semana: 3,  titulo: "LD: Durante la lectura - Pausas dialogicas", objetivo: "Participar activamente con preguntas durante la lectura en voz alta",              descripcion: "La docente lee en voz alta y hace pausas estrategicas para preguntar: que creen que pasara? por que hizo eso el personaje? Se estimula la participacion de todos.", metodologia: "Lectura Dialogica - Durante" },
      { semana: 4,  titulo: "LD: Durante la lectura - Vocabulario",       objetivo: "Inferir significado de palabras nuevas usando el contexto",                        descripcion: "Al encontrar una palabra dificil, la docente detiene la lectura y entre todos intentan adivinar su significado por el contexto. Se anota en el 'muro de palabras'.", metodologia: "Lectura Dialogica - Durante" },
      { semana: 5,  titulo: "LD: Despues de leer - Recontar",             objetivo: "Recontar la historia usando sus propias palabras",                                descripcion: "Usando los apoyos visuales del libro (o imagenes en el pizarron), los ninos recuentan la historia en cadena: cada uno aporta un fragmento.", metodologia: "Lectura Dialogica - Despues" },
      { semana: 6,  titulo: "LD: Despues de leer - Conexiones",           objetivo: "Conectar el texto con experiencias personales",                                   descripcion: "La docente propone preguntas de conexion personal: esto te paso a vos alguna vez? conoces a alguien como este personaje? Los ninos comparten en parejas.", metodologia: "Lectura Dialogica - Despues" },
      { semana: 7,  titulo: "LD: Ciclo completo I",                       objetivo: "Aplicar las tres fases de lectura dialogica con un cuento",                       descripcion: "Se realiza el ciclo completo Antes-Durante-Despues con un cuento nuevo. La docente guia cada fase y los ninos lideran las preguntas de su fase asignada.", metodologia: "Lectura Dialogica - Ciclo Completo" },
      { semana: 8,  titulo: "LD: Ciclo completo II",                      objetivo: "Aplicar lectura dialogica con texto informativo",                                 descripcion: "Se aplica el ciclo completo usando un texto informativo (enciclopedia, afiche, receta). Los ninos adaptan sus estrategias al tipo de texto.", metodologia: "Lectura Dialogica - Ciclo Completo" },
      // BLOQUE 2: Cruz de Comprension - Nivel Literal (Semanas 9-13)
      { semana: 9,  titulo: "Cruz: Quien - Identificar personajes",       objetivo: "Responder QUIEN usando evidencia del texto",                                      descripcion: "Despues de la lectura, se coloca la pregunta QUIEN en el centro de la cruz. Los ninos responden con evidencia del texto y se registra en el diagrama.", metodologia: "Cruz de Comprension - Literal" },
      { semana: 10, titulo: "Cruz: Que - Identificar acciones",           objetivo: "Responder QUE sucede usando informacion explicita del texto",                     descripcion: "Se completa el brazo QUE de la cruz. Los ninos identifican las acciones principales del texto y las ordenan por importancia.", metodologia: "Cruz de Comprension - Literal" },
      { semana: 11, titulo: "Cruz: Donde - Identificar lugar",            objetivo: "Responder DONDE ocurre la historia con evidencia textual",                        descripcion: "Se completa el brazo DONDE. Los ninos buscan en el texto frases que indican el lugar y las registran. Se dibuja el escenario.", metodologia: "Cruz de Comprension - Literal" },
      { semana: 12, titulo: "Cruz: Cuando - Identificar tiempo",          objetivo: "Responder CUANDO suceden los eventos del texto",                                  descripcion: "Se completa el brazo CUANDO. Los ninos identifican indicadores de tiempo en el texto (de manana, en verano, hace mucho tiempo) y los ubican en una linea temporal.", metodologia: "Cruz de Comprension - Literal" },
      { semana: 13, titulo: "Cruz: Integracion literal",                  objetivo: "Usar las 4 preguntas de la cruz para comprension literal completa",               descripcion: "Se completa la cruz entera con un texto nuevo. Los ninos trabajan en grupos, cada uno a cargo de un brazo, y luego presentan al resto.", metodologia: "Cruz de Comprension - Literal" },
      // BLOQUE 3: Cruz de Comprension - Nivel Inferencial (Semanas 14-18)
      { semana: 14, titulo: "Cruz: Por que - Causas",                     objetivo: "Inferir POR QUE suceden las cosas (causa-efecto)",                                descripcion: "Se agrega el brazo POR QUE a la cruz. Los ninos infieren causas que el texto no dice explicitamente. Se debate: como lo sabemos si no esta escrito?", metodologia: "Cruz de Comprension - Inferencial" },
      { semana: 15, titulo: "Cruz: Como - Procesos",                      objetivo: "Inferir COMO suceden las acciones y procesos",                                   descripcion: "Se trabaja el brazo COMO inferencial. Los ninos explican los procesos que llevan a los eventos del texto, usando vocabulario de secuencia.", metodologia: "Cruz de Comprension - Inferencial" },
      { semana: 16, titulo: "Cruz: Para que - Propositos",                objetivo: "Inferir PARA QUE se realizan las acciones (intencion)",                          descripcion: "Se completa el brazo PARA QUE. Los ninos identifican intenciones de los personajes y del autor. Debate: por que creen que el autor escribio esto?", metodologia: "Cruz de Comprension - Inferencial" },
      { semana: 17, titulo: "Cruz: Que pasaria si - Hipotesis",           objetivo: "Formular hipotesis sobre situaciones alternativas",                               descripcion: "Brazo especial QUE PASARIA SI. Los ninos cambian un elemento del texto y predicen como cambiaria la historia. Se comparan las diferentes versiones.", metodologia: "Cruz de Comprension - Inferencial" },
      { semana: 18, titulo: "Cruz: Integracion inferencial",              objetivo: "Combinar preguntas inferenciales para comprension profunda",                     descripcion: "Cruz completa incluyendo los brazos inferenciales. Los ninos trabajan con un texto desafiante y justifican cada respuesta con evidencia.", metodologia: "Cruz de Comprension - Inferencial" },
      // BLOQUE 4: Cruz de Comprension - Nivel Critico (Semanas 19-22)
      { semana: 19, titulo: "Cruz: Que opinas - Valoracion",              objetivo: "Expresar opinion fundamentada sobre el texto",                                    descripcion: "Los ninos expresan su opinion sobre el texto usando la estructura: 'Yo opino que... porque en el texto dice...' Se registran en globos de opinion.", metodologia: "Cruz de Comprension - Critico" },
      { semana: 20, titulo: "Cruz: Esta bien o mal - Juicio",             objetivo: "Emitir juicios eticos sobre acciones de personajes",                             descripcion: "Se analiza una accion del personaje. Los ninos debaten si estuvo bien o mal y por que. Se elabora un juicio colectivo fundamentado.", metodologia: "Cruz de Comprension - Critico" },
      { semana: 21, titulo: "Cruz: Que harias tu - Aplicacion",           objetivo: "Aplicar lo aprendido a situaciones propias",                                     descripcion: "Los ninos transfieren el mensaje del texto a su vida: si yo estuviera en esa situacion yo haria... Se dramatiza brevemente.", metodologia: "Cruz de Comprension - Critico" },
      { semana: 22, titulo: "Cruz: Integracion critica",                  objetivo: "Desarrollar pensamiento critico completo sobre textos",                          descripcion: "Cruz completa en todos los niveles (literal, inferencial, critico) con un texto nuevo seleccionado por los ninos. La docente facilita el debate.", metodologia: "Cruz de Comprension - Critico" },
      // BLOQUE 5: Integracion LD + Cruz (Semanas 23-25)
      { semana: 23, titulo: "Integracion: LD + Cruz Literal",             objetivo: "Combinar lectura dialogica con preguntas literales de la cruz",                  descripcion: "Se realiza una lectura dialogica completa y luego se completa la cruz literal. Los ninos identifican como las preguntas del Antes/Durante/Despues se conectan con la cruz.", metodologia: "Integracion LD + Cruz" },
      { semana: 24, titulo: "Integracion: LD + Cruz Completa",            objetivo: "Aplicar ambas metodologias en secuencia completa",                               descripcion: "Lectura dialogica completa + Cruz de Comprension en todos los niveles. Actividad de cierre anual: los ninos eligen el texto y lideran las fases.", metodologia: "Integracion LD + Cruz" },
      { semana: 25, titulo: "Evaluacion CT",                              objetivo: "Evaluar comprension usando Lectura Dialogica y Cruz de Comprension",             descripcion: "Evaluacion formativa: la docente registra el nivel de participacion en cada fase y el dominio de los brazos de la cruz. Se devuelve feedback personalizado.", metodologia: "Evaluacion" },
    ],
  },
  O: {
    nombre: "Oralidad - ECO Estructurado",
    color: "#f59e0b",
    bgColor: "#fffbeb",
    metodologia: "ECO Estructurado (Escuchar-Comprender-Oralizar)",
    actividades: [
      // BLOQUE 1: ESCUCHAR - Desarrollo de la escucha activa (Semanas 1-8)
      { semana: 1,  titulo: "ECO-E: Escucha de sonidos",              objetivo: "Identificar y discriminar sonidos del entorno con atencion sostenida",   descripcion: "Los ninos cierran los ojos 30 segundos y escuchan. Luego nombran todos los sonidos que percibieron. Se comparan los listados de cada nino.", metodologia: "ECO - Escuchar" },
      { semana: 2,  titulo: "ECO-E: Escucha de voces",                objetivo: "Reconocer voces familiares y sus caracteristicas",                        descripcion: "Se reproducen grabaciones de voz de personas conocidas (o la docente cambia el tono). Los ninos identifican de quien es la voz y describen como suena.", metodologia: "ECO - Escuchar" },
      { semana: 3,  titulo: "ECO-E: Escucha de instrucciones simples", objetivo: "Seguir instrucciones de un paso con atencion",                            descripcion: "La docente da instrucciones de un paso (levanta el brazo, dibuja un circulo) y los ninos las ejecutan. Se aumenta la velocidad progresivamente.", metodologia: "ECO - Escuchar" },
      { semana: 4,  titulo: "ECO-E: Escucha de instrucciones complejas",objetivo: "Seguir instrucciones de dos o mas pasos",                               descripcion: "Instrucciones de dos pasos (toca tu nariz y luego salta). Progresivamente se llega a tres pasos. Los ninos pueden dar instrucciones al grupo.", metodologia: "ECO - Escuchar" },
      { semana: 5,  titulo: "ECO-E: Escucha de cuentos cortos",        objetivo: "Mantener atencion durante narraciones breves",                           descripcion: "La docente narra un cuento breve sin mostrar imagenes. Al finalizar, los ninos dibujan lo que imaginaron. Se comparan las interpretaciones.", metodologia: "ECO - Escuchar" },
      { semana: 6,  titulo: "ECO-E: Escucha de cuentos largos",        objetivo: "Mantener atencion durante narraciones extensas",                         descripcion: "Cuento mas extenso narrado en dos partes. Al cortar, los ninos predicen lo que viene. Al final comparan su prediccion con el desenlace real.", metodologia: "ECO - Escuchar" },
      { semana: 7,  titulo: "ECO-E: Escucha selectiva",                objetivo: "Identificar informacion especifica en un mensaje oral",                  descripcion: "La docente da una consigna antes de escuchar: presta atencion al color de la casa del personaje. Los ninos escuchan y responden solo sobre ese detalle.", metodologia: "ECO - Escuchar" },
      { semana: 8,  titulo: "ECO-E: Escucha critica",                  objetivo: "Distinguir hechos de opiniones en mensajes orales",                      descripcion: "La docente dice frases: algunas son hechos (el perro tiene cuatro patas) y otras son opiniones (los perros son los mejores animales). Los ninos clasifican.", metodologia: "ECO - Escuchar" },
      // BLOQUE 2: COMPRENDER - Procesamiento del mensaje (Semanas 9-16)
      { semana: 9,  titulo: "ECO-C: Vocabulario receptivo I",          objetivo: "Comprender palabras nuevas en contexto oral",                            descripcion: "La docente incorpora palabras nuevas en un cuento y luego pregunta por su significado. Se construye el significado entre todos usando el contexto.", metodologia: "ECO - Comprender" },
      { semana: 10, titulo: "ECO-C: Vocabulario receptivo II",         objetivo: "Ampliar vocabulario de categorias semanticas",                           descripcion: "Se trabaja con campos semanticos (animales de la granja, cosas de la cocina). Los ninos escuchan palabras y las asocian a su categoria.", metodologia: "ECO - Comprender" },
      { semana: 11, titulo: "ECO-C: Comprension literal oral",         objetivo: "Responder preguntas sobre informacion explicita escuchada",              descripcion: "Despues de escuchar un texto oral, los ninos responden preguntas literales (quien, que, donde, cuando). Las respuestas deben estar en el texto.", metodologia: "ECO - Comprender" },
      { semana: 12, titulo: "ECO-C: Comprension inferencial oral",     objetivo: "Inferir informacion no dicha explicitamente",                            descripcion: "La docente hace pausas en el relato oral y pregunta cosas que no estan dichas. Los ninos infieren usando pistas del contexto y su conocimiento previo.", metodologia: "ECO - Comprender" },
      { semana: 13, titulo: "ECO-C: Secuencia temporal",               objetivo: "Ordenar eventos escuchados cronologicamente",                            descripcion: "Despues de escuchar una narracion, los ninos reciben tarjetas con imagenes y las ordenan segun lo que escucharon. Se verifica con el texto.", metodologia: "ECO - Comprender" },
      { semana: 14, titulo: "ECO-C: Causa y efecto",                   objetivo: "Identificar relaciones causales en lo escuchado",                        descripcion: "La docente cuenta una historia y detiene en momentos clave para preguntar: por que paso eso? Los ninos identifican la causa de cada evento.", metodologia: "ECO - Comprender" },
      { semana: 15, titulo: "ECO-C: Idea principal",                   objetivo: "Identificar el tema central de un mensaje oral",                         descripcion: "Despues de escuchar un texto, la docente pregunta: de que se trataba todo? Los ninos sintetizan en una sola oracion el tema central.", metodologia: "ECO - Comprender" },
      { semana: 16, titulo: "ECO-C: Detalles de apoyo",                objetivo: "Identificar detalles que apoyan la idea principal",                      descripcion: "Los ninos diferencian entre la idea principal (de que trata) y los detalles (cosas especificas que lo apoyan). Se usa un diagrama de red.", metodologia: "ECO - Comprender" },
      // BLOQUE 3: ORALIZAR - Produccion oral estructurada (Semanas 17-24)
      { semana: 17, titulo: "ECO-O: Nombrar y etiquetar",              objetivo: "Producir vocabulario preciso para nombrar objetos y acciones",           descripcion: "Los ninos reciben objetos o imagenes y los nombran con precision. Se desafia a usar el nombre exacto en vez de 'cosa' o 'eso'. Se registra el vocabulario nuevo.", metodologia: "ECO - Oralizar" },
      { semana: 18, titulo: "ECO-O: Describir con estructura",         objetivo: "Usar marcos de descripcion (es..., tiene..., sirve para...)",            descripcion: "Con un marco de oracion visible (Es un/a... Tiene... Sirve para...), los ninos describen objetos del aula. Se turnan describiendo sin mostrar el objeto.", metodologia: "ECO - Oralizar" },
      { semana: 19, titulo: "ECO-O: Narrar con secuencia",             objetivo: "Contar eventos usando primero, luego, despues, al final",                descripcion: "Los ninos narran su fin de semana o una actividad usando los conectores temporales. La docente registra en el pizarron la estructura de la narracion.", metodologia: "ECO - Oralizar" },
      { semana: 20, titulo: "ECO-O: Explicar procesos",                objetivo: "Explicar como hacer algo paso a paso con claridad",                      descripcion: "Cada nino elige algo que sabe hacer (preparar jugo, hacer un dibujo) y lo explica paso a paso. El resto del grupo sigue las instrucciones.", metodologia: "ECO - Oralizar" },
      { semana: 21, titulo: "ECO-O: Argumentar simple",                objetivo: "Dar razones para apoyar una opinion (porque...)",                        descripcion: "La docente propone dilemas simples (que prefieren, cual es mejor) y los ninos argumentan con 'Yo creo que... porque...'. Se debate en grupos.", metodologia: "ECO - Oralizar" },
      { semana: 22, titulo: "ECO-O: Dialogar con turnos",              objetivo: "Participar en conversaciones respetando turnos y tema",                  descripcion: "Juego del dialogo: los ninos conversan en parejas con un objeto que indica el turno. Reglas: escuchar, no interrumpir, mantener el tema.", metodologia: "ECO - Oralizar" },
      { semana: 23, titulo: "ECO-O: Exponer oralmente",                objetivo: "Presentar un tema con introduccion, desarrollo y cierre",                descripcion: "Cada nino prepara una mini exposicion de 1 minuto sobre un tema elegido. La docente guia con: primero presenten el tema, luego cuenten algo, al final cierren.", metodologia: "ECO - Oralizar" },
      { semana: 24, titulo: "ECO-O: Recontar elaborado",               objetivo: "Recontar historias agregando detalles y emociones",                      descripcion: "Los ninos recontan un cuento conocido pero enriqueciendolo: agregan como se sintieron los personajes, detalles del lugar, dialogos inventados.", metodologia: "ECO - Oralizar" },
      // BLOQUE 4: Integracion ECO (Semana 25)
      { semana: 25, titulo: "Evaluacion O: Ciclo ECO completo",        objetivo: "Evaluar Escuchar-Comprender-Oralizar en actividad integrada",            descripcion: "Actividad integradora: la docente lee un texto, los ninos escuchan, responden preguntas de comprension y finalmente narran oralmente lo que entendieron.", metodologia: "Evaluacion ECO" },
    ],
  },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function parseSteps(text: string): string[] {
  if (!text) return []
  return text
    .split(/\n|(?=\d+\.)/)
    .map(s => s.replace(/^\d+\.\s*/, "").trim())
    .filter(s => s.length > 0)
}

// ── Secuencia Modal Component ──────────────────────────────────────────────

function SecuenciaModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const [ejeExpandido, setEjeExpandido] = useState<string | null>(null)
  const [tabActivo, setTabActivo] = useState<"CF" | "CT" | "O">("CF")

  if (!isOpen) return null

  const ejeActual = SECUENCIA_ANUAL[tabActivo]

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "#1e3a5f" }}>
                Secuencia Anual ALBA
              </h2>
              <p className="text-sm text-slate-500">25 semanas de actividades por eje</p>
            </div>
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
          </div>
          
          {/* Tabs de Ejes */}
          <div className="flex gap-2">
            {(Object.entries(SECUENCIA_ANUAL) as [string, typeof SECUENCIA_ANUAL.CF][]).map(([ejeId, eje]) => (
              <button
                key={ejeId}
                onClick={() => setTabActivo(ejeId as "CF" | "CT" | "O")}
                className={`flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                  tabActivo === ejeId 
                    ? "text-white shadow-lg" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                style={tabActivo === ejeId ? { backgroundColor: eje.color } : {}}
              >
                <span className="font-bold">{ejeId}</span>
                <span className="hidden sm:inline ml-1">
                  {ejeId === "CF" ? "- Conciencia Fonologica" : ejeId === "CT" ? "- Comprension de Textos" : "- Oralidad"}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Info del eje seleccionado */}
        <div 
          className="px-5 py-3 border-b"
          style={{ backgroundColor: ejeActual.bgColor, borderColor: ejeActual.color + "30" }}
        >
          <p className="font-semibold text-sm" style={{ color: ejeActual.color }}>
            {ejeActual.nombre}
          </p>
          {ejeActual.metodologia && (
            <p className="text-xs mt-1" style={{ color: ejeActual.color + "cc" }}>
              Metodologia: {ejeActual.metodologia}
            </p>
          )}
        </div>

        {/* Content - Lista de actividades del eje seleccionado */}
        <div className="flex-1 overflow-y-auto">
          {ejeActual.actividades.map((act, idx) => {
            const esNuevoBloque = idx === 0 || 
              (act.metodologia && ejeActual.actividades[idx - 1]?.metodologia !== act.metodologia)
            
            return (
              <div key={idx}>
                {/* Separador de bloque/metodologia */}
                {esNuevoBloque && act.metodologia && (
                  <div 
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider border-t border-b"
                    style={{ 
                      backgroundColor: ejeActual.color + "10", 
                      color: ejeActual.color,
                      borderColor: ejeActual.color + "20"
                    }}
                  >
                    {act.metodologia}
          {/* Sugerencia pedagogica global */}
          {activity.sugerenciaPedagogica && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <p className="text-xs font-medium text-indigo-700 uppercase tracking-wide mb-1.5">Idea pedagogica internacional</p>
              <p className="text-sm text-indigo-800 leading-relaxed whitespace-pre-line">{activity.sugerenciaPedagogica.replace(/\\n\\nIDEA PEDAGOGICA \([^)]+\): /, "")}</p>
            </div>
          )}
        </div>
      )}
                <div 
                  className="flex items-start gap-3 px-5 py-3 border-b hover:bg-slate-50 transition-colors"
                  style={{ borderColor: "#f1f5f9" }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                    style={{ backgroundColor: ejeActual.color }}
                  >
                    {act.semana}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-slate-800">{act.titulo}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{act.objetivo}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cerrar
            </Button>
            <Button className="flex-1" style={{ backgroundColor: "#1e3a5f" }}>
              <Printer className="w-4 h-4 mr-2" />
              Imprimir Secuencia
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function BrainColumn({ activity, isLoading, stats, microCapacitacion }: { 
  activity: BrainActivity | null; 
  isLoading: boolean;
  stats?: { green: number; yellow: number; red: number; sinEvaluar: number };
  microCapacitacion?: { titulo: string; contenido: string; tips: string[] } | null;
}) {
  const [showSecuencia, setShowSecuencia] = useState(false)
  
  return (
    <>
    <SecuenciaModal isOpen={showSecuencia} onClose={() => setShowSecuencia(false)} />
    <div className="flex flex-col gap-3 h-full">
      {/* Header con info de clase */}
      <div className="flex flex-col gap-2 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <BrainCircuit className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary leading-tight">Sugerencia de ALBA</p>
          </div>
          {activity && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
              Semana {activity.semana || activity.dia}/25
            </span>
          )}
        </div>
          {activity && activity.aprendidoDeLaRed && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-semibold flex items-center gap-1">
              <Network className="w-3 h-3" />
              Red ALBA{activity.salaRed ? ` (${activity.salaRed})` : ""}
            </span>
          )}
        {activity && (
          <div className="flex items-center gap-2 flex-wrap">
            {activity.claseNumero && (
              <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">
                Clase #{activity.claseNumero}
              </span>
            )}
            {activity.claseDeLaSemana && (
              <span className="text-xs px-2 py-1 rounded-lg bg-purple-100 text-purple-700 font-medium">
                Estimulo {activity.claseDeLaSemana}/3
              </span>
            )}
            {activity.ejeRecomendado && (
              <span 
                className="text-xs px-2 py-1 rounded-lg font-bold text-white"
                style={{ 
                  backgroundColor: activity.ejeRecomendado === "CF" ? "#3b82f6" : 
                                   activity.ejeRecomendado === "CT" ? "#10b981" : "#f59e0b"
                }}
              >
                {activity.ejeRecomendado}: {activity.ejeRecomendado === "CF" ? "Conciencia Fonologica" : activity.ejeRecomendado === "CT" ? "Conocimiento del Texto" : "Oralidad"}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Stats del dia con promedio */}
      {stats && stats.green + stats.yellow + stats.red > 0 && (
        <div className="space-y-2">
          <div className="flex gap-2 text-xs">
            <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">{stats.green} logrado</span>
            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">{stats.yellow} proceso</span>
            <span className="px-2 py-1 rounded-full bg-red-100 text-red-700">{stats.red} refuerzo</span>
          </div>
          {/* Promedio del dia */}
          {(() => {
            const total = stats.green + stats.yellow + stats.red
            const promedio = Math.round(((stats.green * 100) + (stats.yellow * 50) + (stats.red * 10)) / total)
            const colorPromedio = promedio >= 70 ? "text-green-600 bg-green-50" : promedio >= 40 ? "text-yellow-600 bg-yellow-50" : "text-red-600 bg-red-50"
            return (
              <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${colorPromedio}`}>
                Promedio de hoy: {promedio}% {promedio >= 70 ? "(Listo para avanzar)" : promedio >= 40 ? "(Consolidando)" : "(Necesita refuerzo)"}
              </div>
            )
          })()}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center flex-1 min-h-[120px]">
          <Spinner className="text-primary" />
        </div>
      ) : !activity ? (
        <div className="flex-1 flex items-center justify-center text-center text-muted-foreground text-sm py-6">
          Sin actividad disponible
        </div>
      ) : (
        <div className="space-y-3 flex-1">
          {activity.razon && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 text-xs text-blue-700">
              {activity.razon}
            </div>
          )}
          <div>
            <p className="text-base font-semibold text-foreground leading-snug">{activity.titulo}</p>
          </div>
          {activity.descripcion && (
            <div className="bg-primary/5 rounded-lg p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Desarrollo de la actividad</p>
              <p className="text-sm text-foreground leading-relaxed">{activity.descripcion}</p>
            </div>
          )}
          {activity.objetivo && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Objetivo</p>
              <p className="text-sm text-foreground leading-relaxed">{activity.objetivo}</p>
            </div>
          )}
          {activity.materiales && activity.materiales.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-2">Materiales</p>
              <ul className="text-sm text-amber-800 space-y-1">
                {activity.materiales.map((mat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{mat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Tema del proyecto activo */}
          {activity.temaProyecto && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <FolderOpen className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-xs text-emerald-800">
                <span className="font-semibold">Proyecto activo:</span> {activity.temaProyecto}. La actividad esta contextualizada a este tema.
              </span>
            </div>
          )}

          {/* Micro-capacitacion just-in-time */}
          {microCapacitacion && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-xs font-medium text-purple-700 uppercase tracking-wide mb-2">Micro-capacitacion: {microCapacitacion.titulo}</p>
              <p className="text-sm text-purple-800 mb-2">{microCapacitacion.contenido}</p>
              {microCapacitacion.tips && microCapacitacion.tips.length > 0 && (
                <ul className="text-xs text-purple-700 space-y-1">
                  {microCapacitacion.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-purple-500">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" className="flex-1 h-9 text-xs">
          <Printer className="w-3.5 h-3.5 mr-1.5" />
          Imprimir fichas
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 h-9 text-xs"
          onClick={() => setShowSecuencia(true)}
        >
          <List className="w-3.5 h-3.5 mr-1.5" />
          Ver secuencia
        </Button>
      </div>
    </div>
    </>
  )
}

function ProyectoColumn({
  proyecto,
  isLoading,
  onGuardado,
  onFinalizado,
  sala,
}: {
  proyecto: Proyecto | null
  isLoading: boolean
  onGuardado: (p: Proyecto) => void
  onFinalizado: () => void
  sala: string
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving]       = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [saveError, setSaveError]     = useState<string | null>(null)
  const [form, setForm] = useState<Proyecto>({
    sala,
    titulo: "",
    objetivo_general: "",
    actividades: [crearActividadVacia()],
    estado: "activo",
  })

  // Al abrir el modal pre-cargar el proyecto activo si existe
  const handleOpenModal = () => {
    if (proyecto) {
      setForm({
        ...proyecto,
        actividades: proyecto.actividades.length > 0 ? proyecto.actividades : [crearActividadVacia()],
      })
    } else {
      setForm({ sala, titulo: "", objetivo_general: "", actividades: [crearActividadVacia()], estado: "activo" })
    }
    setSaveError(null)
    setIsModalOpen(true)
  }

  const updateActividad = (idx: number, field: keyof ActividadProyecto, value: string) => {
    setForm(prev => {
      const acts = [...prev.actividades]
      acts[idx] = { ...acts[idx], [field]: value }
      return { ...prev, actividades: acts }
    })
  }

  const addActividad = () => {
    setForm(prev => ({ ...prev, actividades: [...prev.actividades, crearActividadVacia()] }))
  }

  const removeActividad = (idx: number) => {
    setForm(prev => ({
      ...prev,
      actividades: prev.actividades.length > 1
        ? prev.actividades.filter((_, i) => i !== idx)
        : prev.actividades,
    }))
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveError(null)
    try {
      const res = await fetch("/api/proyectos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sala }),
      })
      const data = await res.json()
      if (data.ok && data.activo) {
        onGuardado(data.activo)
        setIsModalOpen(false)
      } else {
        setSaveError(data.error || "Error al guardar")
      }
    } catch {
      setSaveError("Error de conexion")
    } finally {
      setIsSaving(false)
    }
  }

  const handleFinalizar = async () => {
    if (!proyecto?.id) return
    setIsFinalizing(true)
    try {
      const res = await fetch("/api/proyectos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sala, id: proyecto.id }),
      })
      const data = await res.json()
      if (data.ok) onFinalizado()
    } catch {
      // silencioso
    } finally {
      setIsFinalizing(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
          <FolderOpen className="w-4 h-4 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold text-accent leading-tight">Proyecto / Unidad Didactica</p>
          <p className="text-xs text-muted-foreground">
            {proyecto ? "Proyecto activo" : "Sin proyecto activo"}
          </p>
        </div>
        <Button size="sm" className="ml-auto h-7 text-xs px-2.5" onClick={handleOpenModal}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          {proyecto ? "Editar" : "Nueva"}
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center flex-1 min-h-[120px]">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !proyecto ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6 gap-2">
          <FolderOpen className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No hay proyecto activo.</p>
          <p className="text-xs text-muted-foreground/70">
            Usa el boton <strong>Nueva</strong> para cargar un proyecto o unidad didactica.
          </p>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {/* Titulo */}
          <p className="text-base font-semibold text-foreground leading-snug">{proyecto.titulo}</p>

          {/* Objetivo general */}
          {proyecto.objetivo_general && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Objetivo general</p>
              <p className="text-sm text-foreground leading-relaxed">{proyecto.objetivo_general}</p>
            </div>
          )}

          {/* Actividades */}
          {proyecto.actividades.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Actividades ({proyecto.actividades.length})
              </p>
              <div className="space-y-2">
                {proyecto.actividades.map((act, i) => (
                  <div key={act.id} className="bg-accent/5 rounded-lg p-2.5">
                    <p className="text-xs font-semibold text-accent mb-1">Actividad {i + 1}{act.titulo ? ` — ${act.titulo}` : ""}</p>
                    {act.objetivo && <p className="text-xs text-muted-foreground leading-relaxed mb-1"><span className="font-medium">Obj:</span> {act.objetivo}</p>}
                    {act.desarrollo && <p className="text-xs text-foreground leading-relaxed mb-1">{act.desarrollo}</p>}
                    {act.materiales && <p className="text-xs text-muted-foreground"><span className="font-medium">Mat:</span> {act.materiales}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Boton Finalizar Proyecto */}
          <div className="pt-1">
            <Button
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
              onClick={handleFinalizar}
              disabled={isFinalizing}
            >
              {isFinalizing ? (
                <div className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mr-1.5" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
              )}
              Guardar y finalizar proyecto
            </Button>
          </div>
        </div>
      )}

      {/* Modal carga/edicion proyecto */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-primary" />
              {proyecto ? "Editar Proyecto" : "Nuevo Proyecto / Unidad Didactica"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleGuardar}>
            <FieldGroup className="py-4 space-y-4">
              {/* Titulo */}
              <Field>
                <FieldLabel htmlFor="proj-titulo">Titulo del proyecto</FieldLabel>
                <Input
                  id="proj-titulo"
                  placeholder="Ej: Los Insectos, El Sistema Solar, El Agua..."
                  value={form.titulo}
                  onChange={e => setForm(prev => ({ ...prev, titulo: e.target.value }))}
                  required
                />
              </Field>

              {/* Objetivo general */}
              <Field>
                <FieldLabel htmlFor="proj-objetivo">Objetivos de aprendizaje</FieldLabel>
                <Textarea
                  id="proj-objetivo"
                  placeholder="Ej: Explorar las caracteristicas de los insectos, desarrollar vocabulario especifico y estimular la curiosidad cientifica."
                  value={form.objetivo_general}
                  onChange={e => setForm(prev => ({ ...prev, objetivo_general: e.target.value }))}
                  rows={3}
                />
              </Field>

              {/* Actividades */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-foreground">Actividades</p>
                  <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={addActividad}>
                    <Plus className="w-3 h-3 mr-1" /> Agregar actividad
                  </Button>
                </div>
                <div className="space-y-4">
                  {form.actividades.map((act, idx) => (
                    <div key={act.id} className="border border-border rounded-lg p-3 space-y-3 relative">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-accent">Actividad {idx + 1}</p>
                        {form.actividades.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeActividad(idx)}
                            className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <Field>
                        <FieldLabel htmlFor={`act-titulo-${idx}`}>Titulo</FieldLabel>
                        <Input
                          id={`act-titulo-${idx}`}
                          placeholder="Ej: Observacion de hormigas en el jardin"
                          value={act.titulo}
                          onChange={e => updateActividad(idx, "titulo", e.target.value)}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`act-objetivo-${idx}`}>Objetivo de aprendizaje</FieldLabel>
                        <Textarea
                          id={`act-objetivo-${idx}`}
                          placeholder="Ej: Identificar partes del cuerpo de una hormiga y describirlas oralmente."
                          value={act.objetivo}
                          onChange={e => updateActividad(idx, "objetivo", e.target.value)}
                          rows={2}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`act-desarrollo-${idx}`}>Desarrollo de la actividad</FieldLabel>
                        <Textarea
                          id={`act-desarrollo-${idx}`}
                          placeholder="Describe paso a paso como se desarrolla la actividad..."
                          value={act.desarrollo}
                          onChange={e => updateActividad(idx, "desarrollo", e.target.value)}
                          rows={3}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor={`act-materiales-${idx}`}>Materiales</FieldLabel>
                        <Input
                          id={`act-materiales-${idx}`}
                          placeholder="Ej: Lupas, laminas de insectos, plasticina"
                          value={act.materiales}
                          onChange={e => updateActividad(idx, "materiales", e.target.value)}
                        />
                      </Field>
                    </div>
                  ))}
                </div>
              </div>
            </FieldGroup>

            {saveError && (
              <div className="flex items-center gap-2 text-sm text-destructive mb-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {saveError}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : null}
                Guardar proyecto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

// Handle expuesto via ref para que el padre pueda llamar fetchBrain directamente
export interface DayPlanningHandle {
  fetchBrain: () => Promise<void>
}

export const DayPlanning = forwardRef<DayPlanningHandle, DayPlanningProps>(function DayPlanning(
  { evaluaciones = {}, ejeActual = "CF", actividadActual = "", totalAlumnos = 0, sala = "Girasoles", onActividadALBA, onEjeALBA },
  ref
) {
  const [brain,         setBrain]         = useState<BrainActivity | null>(null)
  const [isBrainLoading, setIsBrainLoading] = useState(true)
  const [microCapacitacion, setMicroCapacitacion] = useState<{ titulo: string; contenido: string; tips: string[] } | null>(null)

  const [planning,         setPlanning]         = useState<Planning | null>(null)
  const [isPlanningLoading, setIsPlanningLoading] = useState(true)

  const [proyecto,          setProyecto]          = useState<Proyecto | null>(null)
  const [isProyectoLoading, setIsProyectoLoading] = useState(true)

  // Refs para los callbacks - evitan que fetchBrain se recree en cada render del padre
  const onActividadRef = useRef(onActividadALBA)
  const onEjeRef       = useRef(onEjeALBA)
  useEffect(() => { onActividadRef.current = onActividadALBA }, [onActividadALBA])
  useEffect(() => { onEjeRef.current       = onEjeALBA },       [onEjeALBA])

  // Calcular stats de las evaluaciones del dia
  const stats = useMemo(() => {
    const values = Object.values(evaluaciones)
    return {
      green: values.filter(v => v === "green").length,
      yellow: values.filter(v => v === "yellow").length,
      red: values.filter(v => v === "red").length,
      sinEvaluar: totalAlumnos - values.length,
    }
  }, [evaluaciones, totalAlumnos])

  // Fetch Cerebro Central - usa GET mapeando data.sugerencia
  const fetchBrain = useCallback(async () => {
    setIsBrainLoading(true)
    try {
      const res = await fetch(`/api/brain?sala=${encodeURIComponent(sala)}&t=${Date.now()}`, { cache: "no-store" })
      const data = await res.json()
      const sugerencia = data.sugerencia ?? null
      if (sugerencia) {
        const activity: BrainActivity = {
          id: `${sugerencia.eje}-${Date.now()}`,
          dia: 1,
          titulo: sugerencia.actividad,
          descripcion: sugerencia.descripcion || "",
          objetivo: sugerencia.objetivo,
          materiales: sugerencia.materiales || [],
          razon: sugerencia.razon,
          source: "secuencia",
          ejeRecomendado: sugerencia.eje,
          aprendidoDeLaRed: sugerencia.aprendidoDeLaRed || false,
          salaRed: sugerencia.salaRed || null,
          temaProyecto: sugerencia.temaProyecto || null,
          sugerenciaPedagogica: sugerencia.sugerenciaPedagogica || null,
        }
        setBrain(activity)
        setMicroCapacitacion(data.microCapacitacion || null)
        if (onActividadRef.current) onActividadRef.current(sugerencia.actividad)
        if (onEjeRef.current)       onEjeRef.current(sugerencia.eje)
      } else {
        setBrain(null)
      }
    } catch {
      // Si falla la API no pisar la actividad anterior
    } finally {
      setIsBrainLoading(false)
    }
  }, [sala]) // solo sala como dependencia - los callbacks van por ref

  // Exponer fetchBrain al padre para llamarlo con timing correcto tras guardar cierre
  useImperativeHandle(ref, () => ({ fetchBrain }), [fetchBrain])

  // Fetch Mi Planificacion
  const fetchPlanning = useCallback(async () => {
    setIsPlanningLoading(true)
    try {
      const res  = await fetch("/api/planning")
      const data = await res.json()
      setPlanning(data.planning ?? null)
    } catch {
      setPlanning(null)
    } finally {
      setIsPlanningLoading(false)
    }
  }, [])

  // Fetch Proyecto activo
  const fetchProyecto = useCallback(async () => {
    setIsProyectoLoading(true)
    try {
      const res  = await fetch(`/api/proyectos?sala=${encodeURIComponent(sala)}`)
      const data = await res.json()
      setProyecto(data.activo ?? null)
    } catch {
      setProyecto(null)
    } finally {
      setIsProyectoLoading(false)
    }
  }, [sala])

  useEffect(() => {
    fetchBrain()
    fetchPlanning()
    fetchProyecto()
  }, [fetchBrain, fetchPlanning, fetchProyecto])

  return (
    <Card className="h-full shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-primary">
          Planificación del día
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {/* Left: Sugerencia SIA */}
          <div className="pb-4 sm:pb-0 sm:pr-4">
            <BrainColumn activity={brain} isLoading={isBrainLoading} stats={stats} microCapacitacion={microCapacitacion} />
          </div>
          {/* Right: Proyecto / Unidad Didactica */}
          <div className="pt-4 sm:pt-0 sm:pl-4">
            <ProyectoColumn
              proyecto={proyecto}
              isLoading={isProyectoLoading}
              onGuardado={p => setProyecto(p)}
              onFinalizado={() => { setProyecto(null); fetchBrain() }}
              sala={sala}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
