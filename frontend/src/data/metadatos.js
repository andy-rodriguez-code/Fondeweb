// Título y descripción de cada página, para los resultados de búsqueda.
//
// El sitio es una sola aplicación: todas las rutas comparten el index.html, así
// que sin esto las veinte páginas saldrían en Google con el mismo título y la
// misma descripción, compitiendo entre ellas por las mismas palabras.
//
// Google ejecuta JavaScript y toma el título que la aplicación escribe al
// navegar. Los rastreadores de WhatsApp y Facebook NO: para ellos vale lo que
// está escrito en el index.html, y por eso las etiquetas Open Graph viven allá
// y no acá.
//
// Cómo están escritos:
//   - El título empieza por lo que la persona busca y cierra con la marca.
//     Google corta cerca de los 60 caracteres, así que lo que identifica va
//     primero y «| FONDEFOS» al final, que es lo que se puede perder.
//   - La descripción no es un resumen: es el anuncio. Dice qué encuentra y
//     para quién, en menos de 160 caracteres.
//   - «Fondo de empleados de la FOSCAL» y «Floridablanca» aparecen donde
//     tienen sentido: es como busca quien todavía no conoce el nombre.

const MARCA = 'FONDEFOS'

export const metadatos = {
  '/': {
    titulo: 'FONDEFOS | Fondo de Empleados de la FOSCAL — Floridablanca',
    descripcion:
      'Fondo de empleados de la FOSCAL en Floridablanca, Santander. Créditos por libranza, ahorro programado, estado de cuenta en línea y más de 65 convenios para los asociados.',
  },
  ahorro: {
    titulo: `Ahorro programado y permanente para asociados | ${MARCA}`,
    descripcion:
      'Ahorro permanente y ahorro voluntario con descuento de nómina para los empleados de la FOSCAL. Conoce las modalidades, los montos y cómo empezar.',
  },
  'como-ser-asociado': {
    titulo: `Cómo afiliarse al fondo de empleados de la FOSCAL | ${MARCA}`,
    descripcion:
      'Requisitos, documentos y pasos para afiliarte a FONDEFOS. Quién puede asociarse, cuánto es el aporte y qué beneficios tienes desde el primer mes.',
  },
  nosotros: {
    titulo: `Quiénes somos — Fondo de Empleados de la FOSCAL | ${MARCA}`,
    descripcion:
      'FONDEFOS es el fondo de empleados de la Fundación Oftalmológica de Santander, constituido en 1997 en Floridablanca. Conoce su historia, misión y gobierno.',
  },
  beneficios: {
    titulo: `Beneficios y auxilios para los asociados | ${MARCA}`,
    descripcion:
      'Auxilios, seguros y acompañamiento para los asociados de FONDEFOS y sus familias. Qué cubre cada beneficio y cómo solicitarlo.',
  },
  convenios: {
    titulo: `Más de 65 convenios con descuento para asociados | ${MARCA}`,
    descripcion:
      'Salud, educación, recreación y comercio con tarifas preferenciales para los asociados de FONDEFOS en Floridablanca y Bucaramanga.',
  },
  'estado-de-cuenta': {
    titulo: `Consultar estado de cuenta y extracto en línea | ${MARCA}`,
    descripcion:
      'Ingresa al portal del asociado de FONDEFOS para ver saldos, aportes y el estado de tus créditos. Instrucciones paso a paso para consultar tu extracto.',
  },
  'preguntas-frecuentes': {
    titulo: `Preguntas frecuentes de los asociados | ${MARCA}`,
    descripcion:
      'Respuestas sobre afiliación, aportes, créditos, retiros y estado de cuenta en FONDEFOS, el fondo de empleados de la FOSCAL.',
  },
  contactenos: {
    titulo: `Contacto — Fondo de Empleados de la FOSCAL | ${MARCA}`,
    descripcion:
      'Escríbenos o acércate a la sede de FONDEFOS en la Torre Milton Salazar de la FOSCAL, Floridablanca. Teléfono, correo y horario de atención.',
  },
  'programa-100': {
    titulo: `Programa 100 de ahorro voluntario — inscripción | ${MARCA}`,
    descripcion:
      'Inscríbete al Programa 100 de ahorro voluntario de FONDEFOS: doce cuotas mensuales, sorteos para los ahorradores al día y seguro sobre lo ahorrado.',
  },
  'politica-de-datos': {
    titulo: `Política de tratamiento de datos personales | ${MARCA}`,
    descripcion:
      'Cómo FONDEFOS recolecta, usa y protege los datos personales de sus asociados, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013.',
  },

  // Las nueve líneas de crédito. Cada una pelea por su propia búsqueda: quien
  // busca «crédito educativo» no busca «crédito de libranza».
  'credito-de-libre-inversion': {
    titulo: `Crédito de libre inversión por libranza | ${MARCA}`,
    descripcion:
      'Crédito de libre inversión para asociados de FONDEFOS, con descuento de nómina y tasas por debajo del mercado. Montos, plazos y requisitos.',
  },
  'credito-educativo': {
    titulo: `Crédito educativo para asociados y sus hijos | ${MARCA}`,
    descripcion:
      'Financia matrículas y estudios de tu familia con el crédito educativo de FONDEFOS. Descuento por nómina, plazos cómodos y trámite sin banco.',
  },
  'credito-de-confianza': {
    titulo: `Crédito de confianza, desembolso rápido | ${MARCA}`,
    descripcion:
      'Crédito de confianza de FONDEFOS para necesidades inmediatas de los asociados, con trámite corto y descuento de nómina.',
  },
  'credito-de-impuestos': {
    titulo: `Crédito para pago de impuestos | ${MARCA}`,
    descripcion:
      'Paga predial, vehículos y renta con el crédito de impuestos de FONDEFOS, diferido por nómina y sin los intereses de una tarjeta.',
  },
  'credito-de-recreacion-y-turismo': {
    titulo: `Crédito de recreación y turismo para asociados | ${MARCA}`,
    descripcion:
      'Financia tus vacaciones y planes de descanso con el crédito de recreación y turismo de FONDEFOS, con descuento de nómina.',
  },
  'credito-de-consumo-por-bonos': {
    titulo: `Crédito de consumo por bonos | ${MARCA}`,
    descripcion:
      'Compra en los comercios aliados con los bonos de consumo de FONDEFOS y págalos por nómina, en cuotas fijas.',
  },
  'creditos-de-tesoreria': {
    titulo: `Crédito de tesorería a corto plazo | ${MARCA}`,
    descripcion:
      'Crédito de tesorería de FONDEFOS para cubrir un imprevisto y devolverlo en pocos meses, con descuento de nómina.',
  },
  'crediaportes-10': {
    titulo: `Crediaportes 10 — crédito sobre tus aportes | ${MARCA}`,
    descripcion:
      'Accede a un crédito respaldado por tus propios aportes al fondo, con una de las tasas más bajas del portafolio de FONDEFOS.',
  },
  'tarjeta-express': {
    titulo: `Tarjeta Express de compras para asociados | ${MARCA}`,
    descripcion:
      'La Tarjeta Express de FONDEFOS te deja comprar en los comercios en convenio y pagar por nómina, sin cuota de manejo.',
  },
}

// La clave del mapa es el slug sin la barra inicial; la portada usa '/'.
export function metadatosDe(ruta) {
  const clave = ruta === '/' ? '/' : ruta.replace(/^\/+|\/+$/g, '')
  return metadatos[clave] ?? null
}
