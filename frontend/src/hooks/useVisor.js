import { useCallback, useEffect, useRef, useState } from 'react'
import useTrampaFoco from './useTrampaFoco.js'

// useVisor — visor de Notifondo (clon assets/site.js sección del visor): un
// click en cualquier [data-visor-src] abre el diálogo .visor
// (data-abierto="si"), fija src/alt de la imagen, enfoca .visor__cerrar y
// oculta el scroll del body; cierre por botón, por click en el velo y por
// Escape, con trampa de foco y devolución del foco al disparador. El clon
// enlaza los disparadores al cargar; aquí una delegación document-level
// produce el mismo efecto sin importar dónde viva el disparador (las hojas de
// NotifondoGrid ya portan data-visor-src). `src` se devuelve resuelto a
// import de Vite: el path verbatim del clon no resuelve en la app (misma
// técnica del glob de NotifondoGrid). Diferencia documentada: el diálogo vive
// en Layout (decisión de diseño) y monta inerte en todas las páginas, aunque
// solo la portada tiene disparadores; observablemente idéntico al clon.

const PAGINAS = import.meta.glob('../assets/images/fondefos.com.co/notifondo-*', {
  eager: true,
  import: 'default',
})

const imagenDe = (src) => PAGINAS[`../assets/images/fondefos.com.co/${src.split('/').pop()}`]

export default function useVisor() {
  const [abierto, setAbierto] = useState(false)
  const [imagen, setImagen] = useState({ src: '', alt: '' })
  const visorRef = useRef(null)
  const origenRef = useRef(null)
  const trampa = useTrampaFoco(visorRef)

  const cerrar = useCallback(() => {
    setAbierto(false)
    document.body.style.overflow = ''
    if (origenRef.current) origenRef.current.focus()
  }, [])

  const abrir = useCallback((src, alt, boton) => {
    origenRef.current = boton
    setImagen({ src: imagenDe(src), alt: alt || '' })
    setAbierto(true)
    document.body.style.overflow = 'hidden'
    window.requestAnimationFrame(() => {
      visorRef.current?.querySelector('.visor__cerrar')?.focus()
    })
  }, [])

  useEffect(() => {
    const alClic = (e) => {
      const boton = e.target.closest('[data-visor-src]')
      if (!boton) return
      abrir(
        boton.getAttribute('data-visor-src'),
        boton.getAttribute('data-visor-alt') || '',
        boton,
      )
    }
    document.addEventListener('click', alClic)
    return () => document.removeEventListener('click', alClic)
  }, [abrir])

  useEffect(() => {
    if (!abierto) return
    const manejarTecla = (e) => {
      if (e.key === 'Escape') cerrar()
      trampa(e)
    }
    document.addEventListener('keydown', manejarTecla)
    return () => document.removeEventListener('keydown', manejarTecla)
  }, [abierto, cerrar, trampa])

  // SPA: restaura el overflow al desmontar (el clon no lo necesita).
  useEffect(
    () => () => {
      document.body.style.overflow = ''
    },
    [],
  )

  return { abierto, src: imagen.src, alt: imagen.alt, visorRef, cerrar }
}
