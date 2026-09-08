import { useCallback, useEffect, useState } from 'react'

// useSubmenu — submenú "Servicios" (clon assets/site.js .nav__grupo): el
// disparador alterna data-abierto "si"/"no" y su aria-expanded; un click fuera
// del grupo cierra; Escape también cierra (escenario de la spec
// frontend-interactions "Submenu keyboard and outside-click close" — el clon
// solo cierra por click fuera; cierre por Escape es una mejora exigida).
// Hay un único grupo en navegacion.js, así que la lógica del clon de cerrar
// los demás grupos degenera en un solo estado.

export default function useSubmenu() {
  const [abierto, setAbierto] = useState(false)

  useEffect(() => {
    const cerrarFuera = (e) => {
      if (!e.target.closest('.nav__grupo')) setAbierto(false)
    }
    const cerrarEscape = (e) => {
      if (e.key === 'Escape') setAbierto(false)
    }
    document.addEventListener('click', cerrarFuera)
    document.addEventListener('keydown', cerrarEscape)
    return () => {
      document.removeEventListener('click', cerrarFuera)
      document.removeEventListener('keydown', cerrarEscape)
    }
  }, [])

  const alternar = useCallback((e) => {
    e.preventDefault()
    setAbierto((prev) => !prev)
  }, [])

  const cerrar = useCallback(() => setAbierto(false), [])

  return { abierto, alternar, cerrar }
}
