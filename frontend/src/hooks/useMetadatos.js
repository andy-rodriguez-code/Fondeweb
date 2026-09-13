import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { metadatosDe } from '../data/metadatos.js'

// Escribe el título, la descripción y la URL canónica de cada página al
// navegar.
//
// Hace falta porque el sitio es una sola aplicación: todas las rutas comparten
// el mismo index.html. Sin esto, las veinte páginas aparecerían en Google con
// un título idéntico y competirían entre ellas por las mismas palabras.
//
// Google ejecuta JavaScript y toma lo que la aplicación escribe acá. Los
// rastreadores de WhatsApp y Facebook no lo hacen: para ellos vale solo lo que
// está en el HTML estático, y por eso las etiquetas Open Graph viven en
// index.html. Esto es para el buscador, aquello es para el enlace compartido.
//
// La canónica se actualiza también: si no, cada página declararía ser la
// portada y Google tendría motivo para no indexarlas.

function fijarEtiqueta(selector, crear, valor) {
  let nodo = document.head.querySelector(selector)
  if (!nodo) {
    nodo = crear()
    document.head.appendChild(nodo)
  }
  nodo.setAttribute(selector.startsWith('link') ? 'href' : 'content', valor)
}

export default function useMetadatos() {
  const { pathname } = useLocation()

  useEffect(() => {
    const datos = metadatosDe(pathname)

    // Una ruta sin entrada —la pantalla de gracias, un 404— se deja con lo que
    // ya trae el documento. Inventar un título para ellas sería peor.
    if (!datos) return

    document.title = datos.titulo

    fijarEtiqueta(
      'meta[name="description"]',
      () => {
        const m = document.createElement('meta')
        m.setAttribute('name', 'description')
        return m
      },
      datos.descripcion,
    )

    fijarEtiqueta(
      'link[rel="canonical"]',
      () => {
        const l = document.createElement('link')
        l.setAttribute('rel', 'canonical')
        return l
      },
      `https://fondefos.com.co${pathname === '/' ? '/' : pathname}`,
    )
  }, [pathname])
}
