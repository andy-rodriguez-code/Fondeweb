import { useEffect, useState } from 'react'

// useCabeceraFija — sombra de cabecera fija (clon assets/site.js `marcarFijo`):
// devuelve true cuando window.scrollY > 8 para que el Header refleje
// data-fijo="si"/"no" (el CSS del grupo 6 selecciona por ese atributo). El
// listener de scroll es pasivo como en el clon y se marca al montar (el clon
// también pinta el estado inicial antes del primer scroll).

export default function useCabeceraFija() {
  const [fijo, setFijo] = useState(false)

  useEffect(() => {
    const marcar = () => setFijo(window.scrollY > 8)
    marcar()
    window.addEventListener('scroll', marcar, { passive: true })
    return () => window.removeEventListener('scroll', marcar)
  }, [])

  return fijo
}
