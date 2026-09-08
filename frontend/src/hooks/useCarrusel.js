import { useCallback, useEffect, useRef, useState } from 'react'

// useCarrusel — carrusel de portada (clon assets/site.js [data-carrusel]):
// avance automático cada `ms` (6000), pausa con hover/foco, reinicio del
// temporizador tras navegación manual (prev/sig/punto) y respeto de
// prefers-reduced-motion (`respetaReduccion`). El estado `indice` refleja los
// atributos del clon en las láminas (data-activa, aria-hidden) y puntos
// (aria-current) — el CSS (grupo 2) selecciona por ellos. El clon evalúa la
// media query una vez al cargar; aquí se evalúa en cada arranque (superset:
// responde si la preferencia cambia durante la sesión). Sin láminas o con una
// sola el clon no activa nada (`laminas.length < 2`); se conserva esa guarda.

export default function useCarrusel(ref, { ms = 6000, respetaReduccion = true } = {}) {
  const [indice, setIndice] = useState(0)
  const totalRef = useRef(0)
  const temporizadorRef = useRef(null)

  const detener = useCallback(() => {
    if (temporizadorRef.current) {
      window.clearInterval(temporizadorRef.current)
      temporizadorRef.current = null
    }
  }, [])

  const arrancar = useCallback(() => {
    if (!ref.current) return
    if (respetaReduccion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    detener()
    temporizadorRef.current = window.setInterval(() => {
      setIndice((prev) => (totalRef.current > 1 ? (prev + 1) % totalRef.current : prev))
    }, ms)
  }, [ref, ms, respetaReduccion, detener])

  useEffect(() => {
    const contenedor = ref.current
    if (!contenedor) return
    totalRef.current = contenedor.querySelectorAll('.carrusel__lamina').length
    if (totalRef.current < 2) return
    arrancar()
    return detener
  }, [ref, arrancar, detener])

  const anterior = useCallback(() => {
    if (totalRef.current <= 1) return
    setIndice((prev) => ((prev - 1 + totalRef.current) % totalRef.current))
    arrancar()
  }, [arrancar])

  const siguiente = useCallback(() => {
    if (totalRef.current <= 1) return
    setIndice((prev) => (prev + 1) % totalRef.current)
    arrancar()
  }, [arrancar])

  const irA = useCallback(
    (i) => {
      const total = totalRef.current
      if (total <= 1) return
      setIndice(((i % total) + total) % total)
      arrancar()
    },
    [arrancar],
  )

  return { indice, anterior, siguiente, irA, pausar: detener, reanudar: arrancar }
}
