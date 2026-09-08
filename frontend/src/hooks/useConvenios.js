import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useTrampaFoco from './useTrampaFoco.js'
import { convenios as conveniosDefecto } from '../data/convenios.js'

// useConvenios — filtro + cajón de detalle (clon assets/site.js sección de
// convenios): filtro por categoría (aria-pressed derivado de estado, tarjetas
// ocultas, conteo aria-live y vacío), cajón lateral (data-abierto="si",
// ficha llena, foco al botón cerrar al abrir y al disparador al cerrar, body
// overflow hidden/restaurado, history.replaceState → #id al abrir y pathname
// al cerrar), apertura por hash inicial (#santur), cierre con Escape y trampa
// de foco. Convenios.jsx refleja el estado en data-* (el CSS del grupo 15
// selecciona por ellos). Diferencia documentada frente al clon (página
// estática): la SPA restaura el body overflow al desmontar la sección para no
// dejar la página sin scroll al navegar con el cajón abierto.

export default function useConvenios(datos = conveniosDefecto) {
  const [categoria, setCategoria] = useState('todos')
  const cajonRef = useRef(null)
  const disparadorRef = useRef(null)

  // Hash inicial (clon: `if (location.hash.length > 1) abrirCajon(...)`). El
  // item se deriva durante el render (sin setState en efecto); los efectos de
  // apertura (overflow + foco) los aplica el efecto de más abajo. El guard
  // typeof window protege el render SSR de los harness de verificación.
  const [item, setItem] = useState(() => {
    if (typeof window === 'undefined') return null
    if (window.location.hash.length <= 1) return null
    return datos.find((c) => c.id === window.location.hash.slice(1)) || null
  })

  const visibles = useMemo(
    () => datos.filter((c) => categoria === 'todos' || c.categoria === categoria),
    [datos, categoria],
  )

  const cerrarCajon = useCallback(() => {
    setItem(null)
    document.body.style.overflow = ''
    if (window.history.replaceState) {
      window.history.replaceState(null, '', window.location.pathname)
    }
    if (disparadorRef.current) disparadorRef.current.focus()
  }, [])

  const abrirCajon = useCallback(
    (id, disparador = null) => {
      const encontrado = datos.find((c) => c.id === id)
      if (!encontrado) return
      disparadorRef.current = disparador
      setItem(encontrado)
      if (window.history.replaceState) {
        window.history.replaceState(null, '', '#' + encontrado.id)
      }
    },
    [datos],
  )

  // Efectos de apertura (clon abrirCajon): body overflow oculto + foco al
  // botón cerrar. Cubre tanto la apertura inicial por hash como la apertura
  // por click (operaciones idempotentes; reejecutar en StrictMode no cambia
  // el resultado). Al cerrar (item null) no actúa: el overflow lo restaura
  // cerrarCajon.
  useEffect(() => {
    if (!item) return
    document.body.style.overflow = 'hidden'
    window.requestAnimationFrame(() => {
      cajonRef.current?.querySelector('.cajon__cerrar')?.focus()
    })
  }, [item])

  const trampa = useTrampaFoco(cajonRef)

  useEffect(() => {
    if (!item) return
    const manejarTecla = (e) => {
      if (e.key === 'Escape') cerrarCajon()
      trampa(e)
    }
    document.addEventListener('keydown', manejarTecla)
    return () => document.removeEventListener('keydown', manejarTecla)
  }, [item, cerrarCajon, trampa])

  // SPA: restaura el overflow al desmontar (el clon no lo necesita).
  useEffect(
    () => () => {
      document.body.style.overflow = ''
    },
    [],
  )

  const filtrar = useCallback((nueva) => setCategoria(nueva), [])

  return {
    categoria,
    filtrar,
    visibles,
    item,
    abierto: item !== null,
    cajonRef,
    abrirCajon,
    cerrarCajon,
  }
}
