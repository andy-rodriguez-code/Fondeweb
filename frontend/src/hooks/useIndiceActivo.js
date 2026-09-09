import { useEffect, useState } from 'react'

// useIndiceActivo — devuelve el id de la sección que se está leyendo, para
// resaltarla en el índice lateral de un documento largo.
//
// Se apoya en IntersectionObserver con un margen superior generoso: la sección
// "activa" es la que cruza el tercio superior de la ventana, no la que está
// centrada. Sin ese margen, con secciones de altura muy distinta el resaltado
// salta de forma errática.
//
// Si el navegador no trae IntersectionObserver, el índice sigue funcionando
// como lista de enlaces; solo no marca la sección actual.

export default function useIndiceActivo(ids) {
  const [activo, setActivo] = useState(null)

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const nodos = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!nodos.length) return

    // Guarda el estado de cada sección para elegir siempre la primera visible
    // en orden de documento, y no la última que disparó el observador.
    const visibles = new Map()
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) visibles.set(entrada.target.id, entrada.isIntersecting)
        const primera = ids.find((id) => visibles.get(id))
        if (primera) setActivo(primera)
      },
      { rootMargin: '-88px 0px -70% 0px' },
    )
    nodos.forEach((nodo) => observador.observe(nodo))
    return () => observador.disconnect()
  }, [ids])

  return activo
}
