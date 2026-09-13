// Genera un HTML por ruta después de compilar, cada uno con su propio título,
// su descripción y sus etiquetas de vista previa.
//
// QUÉ PROBLEMA RESUELVE
// El sitio es una sola aplicación: el servidor entrega un index.html con un
// <div id="root"></div> vacío y React arma todo después. Google ejecuta
// JavaScript y termina viendo las páginas, pero los rastreadores de WhatsApp,
// Facebook, LinkedIn y X no lo hacen: piden el documento, leen las etiquetas y
// se van. Con un solo index.html, compartir /credito-educativo mostraba la
// vista previa de la portada.
//
// QUÉ HACE Y QUÉ NO
// Escribe el <head> correcto de cada ruta. El <body> sigue armándolo React.
// Eso alcanza para las vistas previas —que solo leen el head— y para que
// Google indexe cada página con su propio título. No es prerenderizado de
// contenido: para eso haría falta un navegador sin ventana en el build, que
// trae su propio conjunto de problemas y una dependencia de trescientos megas.
//
// POR QUÉ CARPETAS Y NO ARCHIVOS SUELTOS
// /convenios/index.html y no /convenios.html: así Apache lo sirve sin tocar
// nada, por la regla que ya existe en el .htaccess —si el destino es una
// carpeta que existe, se sirve su index y no se reescribe—.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const AQUI = dirname(fileURLToPath(import.meta.url))
const DIST = join(AQUI, '..', 'dist')
const SITIO = 'https://fondefos.com.co'

// El mismo mapa que usa la aplicación en el navegador. Una sola fuente: si
// alguien agrega una página y su entrada, el prerenderizado la toma sola.
const { metadatos } = await import('../src/data/metadatos.js')
const { faq } = await import('../src/data/faq.js')

const plantilla = readFileSync(join(DIST, 'index.html'), 'utf8')

// Sustituye el contenido de una etiqueta sin tocar el resto del documento.
// Se hace con reemplazos puntuales y no armando el head de cero para que
// cualquier cosa que Vite agregue —precargas, módulos— siga estando.
function reemplazar(html, busca, pone) {
  if (!busca.test(html)) {
    throw new Error(`No se encontró en el HTML: ${busca}`)
  }
  return html.replace(busca, pone)
}

function escapar(texto) {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;')
}

// Migas de pan como dato estructurado. En pantalla ya existen; esto es para que
// Google las muestre en el resultado, en vez de la URL cruda.
function migas(slug, titulo) {
  const corto = titulo.split(/\s*[|—]\s*/)[0]
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITIO}/` },
      { '@type': 'ListItem', position: 2, name: corto, item: `${SITIO}/${slug}` },
    ],
  })
}

// Las nueve preguntas frecuentes como dato estructurado. Es de los pocos
// resultados enriquecidos que Google todavía muestra: las preguntas aparecen
// desplegables debajo del enlace y ocupan más alto en la página de resultados.
//
// La regla que hay que respetar: la respuesta del dato tiene que ser la misma
// que se lee en pantalla. Poner acá un texto distinto —más largo, con más
// palabras clave— es lo que Google penaliza.
function preguntasFrecuentes() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.items.map((item) => ({
      '@type': 'Question',
      name: item.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: item.respuesta },
    })),
  })
}

let escritas = 0

for (const [slug, datos] of Object.entries(metadatos)) {
  // La portada ya es el index.html de la raíz: su head sale tal cual del
  // documento fuente y no hay nada que reescribir.
  if (slug === '/') continue

  const url = `${SITIO}/${slug}`
  let html = plantilla

  html = reemplazar(html, /<title>[^<]*<\/title>/, `<title>${escapar(datos.titulo)}</title>`)
  html = reemplazar(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapar(datos.descripcion)}" />`,
  )
  html = reemplazar(
    html,
    /<link rel="canonical" href="[^"]*" \/>/,
    `<link rel="canonical" href="${url}" />`,
  )
  html = reemplazar(html, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${url}" />`)
  html = reemplazar(
    html,
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapar(datos.titulo)}" />`,
  )
  html = reemplazar(
    html,
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapar(datos.descripcion)}" />`,
  )
  html = reemplazar(
    html,
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapar(datos.titulo)}" />`,
  )
  html = reemplazar(
    html,
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapar(datos.descripcion)}" />`,
  )

  // Las migas van antes de cerrar el head, después del bloque de la entidad.
  const extra = [migas(slug, datos.titulo)]
  if (slug === 'preguntas-frecuentes') {
    extra.push(preguntasFrecuentes())
  }

  html = html.replace(
    '</head>',
    extra.map((json) => `  <script type="application/ld+json">${json}</script>`).join('\n') +
      '\n  </head>',
  )

  const carpeta = join(DIST, slug)
  mkdirSync(carpeta, { recursive: true })
  writeFileSync(join(carpeta, 'index.html'), html)
  escritas++
}

console.log(`prerenderizado: ${escritas} páginas con su propio head`)
