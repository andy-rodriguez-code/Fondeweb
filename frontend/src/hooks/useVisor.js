import { useCallback, useEffect, useRef, useState } from 'react'
import useTrampaFoco from './useTrampaFoco.js'
import { imagenNotifondo } from '../lib/imagenesNotifondo.js'

// useVisor — visor de Notifondo: un click en cualquier [data-visor-src] abre
// el diálogo .visor (data-abierto="si") en esa publicación, enfoca
// .visor__cerrar y oculta el scroll del body; cierre por botón, por click en
// el velo y por Escape, con trampa de foco y devolución del foco al
// disparador. La delegación es document-level, así que da igual dónde viva el
// disparador.
//
// Navegación: al abrir se arma la secuencia con todos los [data-visor-src]
// del documento, sin repetir (la portada de la revista y su hoja en la tira
// son la misma publicación). Flechas en pantalla, ←/→ en el teclado y
// deslizar en el teléfono. Si la publicación trae data-visor-enlace, el visor
// muestra un botón que lo abre.

const UMBRAL_GESTO = 48

const leerSecuencia = () => {
  const lista = []
  document.querySelectorAll('[data-visor-src]').forEach((nodo) => {
    const clave = nodo.getAttribute('data-visor-src')
    if (lista.some((item) => item.clave === clave)) return
    lista.push({
      clave,
      src: imagenNotifondo(clave),
      alt: nodo.getAttribute('data-visor-alt') || '',
      enlace: nodo.getAttribute('data-visor-enlace') || '',
      enlaceEtiqueta: nodo.getAttribute('data-visor-enlace-etiqueta') || '',
    })
  })
  return lista
}

export default function useVisor() {
  const [abierto, setAbierto] = useState(false)
  const [secuencia, setSecuencia] = useState([])
  const [indice, setIndice] = useState(0)
  const visorRef = useRef(null)
  const origenRef = useRef(null)
  const toqueRef = useRef(null)
  const trampa = useTrampaFoco(visorRef)
  const total = secuencia.length

  const cerrar = useCallback(() => {
    setAbierto(false)
    document.body.style.overflow = ''
    if (origenRef.current) origenRef.current.focus()
  }, [])

  const abrir = useCallback((boton) => {
    const lista = leerSecuencia()
    const clave = boton.getAttribute('data-visor-src')
    origenRef.current = boton
    setSecuencia(lista)
    setIndice(Math.max(0, lista.findIndex((item) => item.clave === clave)))
    setAbierto(true)
    document.body.style.overflow = 'hidden'
    window.requestAnimationFrame(() => {
      visorRef.current?.querySelector('.visor__cerrar')?.focus()
    })
  }, [])

  const mover = useCallback(
    (paso) => {
      if (total < 2) return
      setIndice((actual) => (actual + paso + total) % total)
    },
    [total],
  )
  const anterior = useCallback(() => mover(-1), [mover])
  const siguiente = useCallback(() => mover(1), [mover])

  useEffect(() => {
    const alClic = (e) => {
      const boton = e.target.closest('[data-visor-src]')
      if (boton) abrir(boton)
    }
    document.addEventListener('click', alClic)
    return () => document.removeEventListener('click', alClic)
  }, [abrir])

  useEffect(() => {
    if (!abierto) return
    const manejarTecla = (e) => {
      if (e.key === 'Escape') cerrar()
      if (e.key === 'ArrowLeft') anterior()
      if (e.key === 'ArrowRight') siguiente()
      trampa(e)
    }
    document.addEventListener('keydown', manejarTecla)
    return () => document.removeEventListener('keydown', manejarTecla)
  }, [abierto, cerrar, anterior, siguiente, trampa])

  // SPA: restaura el overflow al desmontar.
  useEffect(
    () => () => {
      document.body.style.overflow = ''
    },
    [],
  )

  // Deslizar horizontal en el teléfono; un gesto más vertical que horizontal
  // se ignora para no pelear con el scroll.
  const gestos = {
    onTouchStart: (e) => {
      const { clientX, clientY } = e.touches[0]
      toqueRef.current = { x: clientX, y: clientY }
    },
    onTouchEnd: (e) => {
      const inicio = toqueRef.current
      toqueRef.current = null
      if (!inicio) return
      const { clientX, clientY } = e.changedTouches[0]
      const dx = clientX - inicio.x
      const dy = clientY - inicio.y
      if (Math.abs(dx) < UMBRAL_GESTO || Math.abs(dx) < Math.abs(dy)) return
      if (dx < 0) siguiente()
      else anterior()
    },
  }

  const actual = secuencia[indice]
  return {
    abierto,
    src: actual?.src ?? '',
    alt: actual?.alt ?? '',
    enlace: actual?.enlace ?? '',
    enlaceEtiqueta: actual?.enlaceEtiqueta ?? '',
    indice,
    total,
    visorRef,
    cerrar,
    anterior,
    siguiente,
    gestos,
  }
}
