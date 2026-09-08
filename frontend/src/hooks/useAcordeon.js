import { useCallback, useState } from 'react'

// useAcordeon — acordeones (clon assets/site.js [data-acordeon] .fila__boton):
// cada fila alterna su data-abierta "si"/"no" y el aria-expanded del botón de
// forma independiente (el clon permite varias filas abiertas a la vez y no
// fuerza cierre de las demás — se conserva). `abiertaInicial` es el índice de
// la fila abierta por defecto (0, como el markup del clon).

export default function useAcordeon(abiertaInicial = 0) {
  const [abiertas, setAbiertas] = useState(() =>
    abiertaInicial >= 0 ? new Set([abiertaInicial]) : new Set(),
  )

  const alternar = useCallback((i) => {
    setAbiertas((prev) => {
      const siguiente = new Set(prev)
      if (siguiente.has(i)) siguiente.delete(i)
      else siguiente.add(i)
      return siguiente
    })
  }, [])

  return { abiertas, alternar }
}
