import { useEffect, useRef, useState } from 'react'

// useVisto — marca `visto` la primera vez que el elemento entra en pantalla
// (IntersectionObserver con el umbral dado) y deja de observar. Sin
// IntersectionObserver (navegadores viejos, prerenderizado) arranca visto,
// para que nada quede oculto esperando una animación que no va a llegar.
export default function useVisto({ umbral = 0.35 } = {}) {
  const ref = useRef(null)
  const [visto, setVisto] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const nodo = ref.current
    if (visto || !nodo) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) setVisto(true)
      },
      { threshold: umbral },
    )
    observador.observe(nodo)
    return () => observador.disconnect()
  }, [visto, umbral])

  return { ref, visto }
}
