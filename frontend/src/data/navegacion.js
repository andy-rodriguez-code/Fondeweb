// Site navigation and site-wide contact/legal literals — single auditable source
// for the utility bar, header nav (11 links + "Servicios" submenu), footer columns
// and the "Dónde estamos" block. Read-only source: root index.html clone.
//
// Every `etiqueta`/`href` is a verbatim byte-copy of the clone. `slug` is the
// derived router path (P7 defines the same 18 slugs): index.html → '/', otherwise
// '/' + basename without '.html'. The maps `href` below stores the decoded URL
// (the clone encodes '&' as '&amp;' in HTML source; browsers resolve it to '&').

export const marca = {
  alt: 'Fondefos, tu fondo de servicios',
}

export const utilidad = [
  { etiqueta: '304 4962328', href: 'tel:+573044962328' },
  { etiqueta: 'fondo.empleados@foscal.com.co', href: 'mailto:fondo.empleados@foscal.com.co' },
  { etiqueta: 'Consultar mi extracto', href: 'estado-de-cuenta.html', slug: '/estado-de-cuenta' },
]

export const servicios = [
  { etiqueta: 'Ahorro', href: 'ahorro.html', slug: '/ahorro' },
  { etiqueta: 'Crediaportes + 10%', href: 'crediaportes-10.html', slug: '/crediaportes-10' },
  { etiqueta: 'Crédito de confianza', href: 'credito-de-confianza.html', slug: '/credito-de-confianza' },
  { etiqueta: 'Crédito de consumo por bonos', href: 'credito-de-consumo-por-bonos.html', slug: '/credito-de-consumo-por-bonos' },
  { etiqueta: 'Crédito de libre inversión', href: 'credito-de-libre-inversion.html', slug: '/credito-de-libre-inversion' },
  { etiqueta: 'Crédito de impuestos', href: 'credito-de-impuestos.html', slug: '/credito-de-impuestos' },
  { etiqueta: 'Crédito de recreación y turismo', href: 'credito-de-recreacion-y-turismo.html', slug: '/credito-de-recreacion-y-turismo' },
  { etiqueta: 'Crédito educativo', href: 'credito-educativo.html', slug: '/credito-educativo' },
  { etiqueta: 'Créditos de tesorería', href: 'creditos-de-tesoreria.html', slug: '/creditos-de-tesoreria' },
  { etiqueta: 'Tarjeta expréss', href: 'tarjeta-express.html', slug: '/tarjeta-express' },
]

export const principal = [
  { etiqueta: 'Inicio', href: 'index.html', slug: '/' },
  { etiqueta: 'Nosotros', href: 'nosotros.html', slug: '/nosotros' },
  { etiqueta: 'Cómo ser asociado', href: 'como-ser-asociado.html', slug: '/como-ser-asociado' },
  { etiqueta: 'Servicios', submenu: servicios },
  { etiqueta: 'Convenios', href: 'convenios.html', slug: '/convenios' },
  { etiqueta: 'Beneficios', href: 'beneficios.html', slug: '/beneficios' },
  { etiqueta: 'Estado de cuenta', href: 'estado-de-cuenta.html', slug: '/estado-de-cuenta' },
  { etiqueta: 'Preguntas frecuentes', href: 'preguntas-frecuentes.html', slug: '/preguntas-frecuentes' },
  { etiqueta: 'Contáctenos', href: 'contactenos.html', slug: '/contactenos' },
]

export const pie = {
  direccion: 'AP Floridablanca – Calle 155 A 23 09, frente a la Fundación Cardiovascular, junto a consulta externa – Nueva EPS.',
  horario: 'Lunes a viernes: 7:30 a. m. – 12:00 m. y 1:00 p. m. – 5:00 p. m.',
  columnas: [
    {
      titulo: 'Servicios',
      enlaces: [
        { etiqueta: 'Ahorro', href: 'ahorro.html', slug: '/ahorro' },
        { etiqueta: 'Crediaportes + 10%', href: 'crediaportes-10.html', slug: '/crediaportes-10' },
        { etiqueta: 'Crédito de confianza', href: 'credito-de-confianza.html', slug: '/credito-de-confianza' },
        { etiqueta: 'Crédito de consumo por bonos', href: 'credito-de-consumo-por-bonos.html', slug: '/credito-de-consumo-por-bonos' },
        { etiqueta: 'Crédito de libre inversión', href: 'credito-de-libre-inversion.html', slug: '/credito-de-libre-inversion' },
        { etiqueta: 'Crédito de impuestos', href: 'credito-de-impuestos.html', slug: '/credito-de-impuestos' },
        { etiqueta: 'Ver todos los convenios', href: 'convenios.html', slug: '/convenios' },
      ],
    },
    {
      titulo: 'El fondo',
      enlaces: [
        { etiqueta: 'Nosotros', href: 'nosotros.html', slug: '/nosotros' },
        { etiqueta: 'Cómo ser asociado', href: 'como-ser-asociado.html', slug: '/como-ser-asociado' },
        { etiqueta: 'Beneficios', href: 'beneficios.html', slug: '/beneficios' },
        { etiqueta: 'Preguntas frecuentes', href: 'preguntas-frecuentes.html', slug: '/preguntas-frecuentes' },
        { etiqueta: 'Contáctenos', href: 'contactenos.html', slug: '/contactenos' },
      ],
    },
    {
      titulo: 'Atención',
      enlaces: [
        { etiqueta: '304 4962328', href: 'tel:+573044962328' },
        { etiqueta: '302 2619797', href: 'tel:+573022619797' },
        { etiqueta: '317 4357685', href: 'tel:+573174357685' },
        { etiqueta: 'fondo.empleados@foscal.com.co', href: 'mailto:fondo.empleados@foscal.com.co' },
      ],
    },
  ],
  legal: 'Copyright © 2026 | Fondefos',
  proteccion: 'FONDEFOS cumple con la Ley 1581 de 2012 y el Decreto 1377 de 2013, en el marco general de la protección de datos personales.',
  redes: [
    { etiqueta: 'Fondefos en Facebook', href: 'https://www.facebook.com/fondefos' },
    { etiqueta: 'Fondefos en Instagram', href: 'https://www.instagram.com/fondefos.oficial/' },
  ],
}

export const contacto = {
  sede: 'AP Floridablanca – Calle 155 A 23 09, frente a la Fundación Cardiovascular, junto a consulta externa – Nueva EPS.',
  horario: 'Lunes a viernes: 7:30 a. m. – 12:00 m. y 1:00 p. m. – 5:00 p. m.',
  telefonos: ['304 4962328 · 302 2619797 · 317 4357685', 'Fijo: 67008000 ext 2167'],
  comoLlegar: { etiqueta: 'Cómo llegar', href: 'https://www.google.com/maps/search/?api=1&query=Calle+155A+%2323-09+Floridablanca+Santander' },
}

export default principal
