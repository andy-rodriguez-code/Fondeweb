import { useCallback, useState } from 'react'

// useMenuMovil — menú móvil (clon assets/site.js `botonMenu`): la hamburguesa
// alterna data-menu "abierto"/"cerrado" de la cabecera y su aria-expanded. El
// clon solo alterna con el botón (sin cierre por Escape ni al navegar); se
// conserva esa paridad exacta, sin inventar comportamiento.

export default function useMenuMovil() {
  const [abierto, setAbierto] = useState(false)
  const alternar = useCallback(() => setAbierto((prev) => !prev), [])
  return { abierto, alternar }
}
