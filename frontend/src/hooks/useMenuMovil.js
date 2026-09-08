import { useCallback, useState } from 'react'

// useMenuMovil — menú móvil (clon assets/site.js `botonMenu`): la hamburguesa
// alterna data-menu "abierto"/"cerrado" de la cabecera y su aria-expanded.
//
// Desviación frente al clon (2026-09-08): el panel también se cierra al elegir
// una página. El clon es un sitio de páginas separadas, donde la navegación
// recarga el documento y el menú desaparece solo; en una SPA la vista cambia
// debajo del panel abierto y el usuario queda tapando la página que acaba de
// pedir. `cerrar` lo consume Header, tanto al hacer clic en un enlace como al
// cambiar la ruta (cubre atrás/adelante del navegador).

export default function useMenuMovil() {
  const [abierto, setAbierto] = useState(false)
  const alternar = useCallback(() => setAbierto((prev) => !prev), [])
  const cerrar = useCallback(() => setAbierto(false), [])
  return { abierto, alternar, cerrar }
}
