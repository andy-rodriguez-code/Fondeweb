import { useCallback, useEffect, useRef, useState } from 'react'

// useFirma — pad de firma sobre <canvas>, con mouse, dedo o lápiz.
//
// Los trazos se guardan como listas de puntos en píxeles CSS, no solo pintados
// en el lienzo: el canvas se redimensiona con la ventana y al cambiar su ancho
// se pierde el mapa de bits, así que al redibujar se parte siempre de los
// puntos. Es también lo que permite exportar la firma más adelante.
//
// El lienzo se escala por devicePixelRatio para que el trazo no salga borroso
// en pantallas densas; el estilo CSS mantiene el tamaño lógico.

const GROSOR = 2.2

export default function useFirma() {
  const lienzoRef = useRef(null)
  const trazosRef = useRef([])
  const dibujandoRef = useRef(false)
  const [hayFirma, setHayFirma] = useState(false)

  const redibujar = useCallback(() => {
    const lienzo = lienzoRef.current
    if (!lienzo) return
    const ctx = lienzo.getContext('2d')
    const ratio = window.devicePixelRatio || 1
    const { width, height } = lienzo.getBoundingClientRect()
    if (!width || !height) return

    lienzo.width = Math.round(width * ratio)
    lienzo.height = Math.round(height * ratio)
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.clearRect(0, 0, width, height)
    ctx.lineWidth = GROSOR
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    // Tinta de la marca. Se lee del token en vez de fijar un hex acá.
    ctx.strokeStyle =
      getComputedStyle(lienzo).getPropertyValue('--color-ink').trim() || '#152238'

    for (const trazo of trazosRef.current) {
      if (trazo.length === 1) {
        // Un punto suelto: un toque corto también deja marca.
        ctx.beginPath()
        ctx.arc(trazo[0].x, trazo[0].y, GROSOR / 2, 0, Math.PI * 2)
        ctx.fillStyle = ctx.strokeStyle
        ctx.fill()
        continue
      }
      ctx.beginPath()
      ctx.moveTo(trazo[0].x, trazo[0].y)
      for (const punto of trazo.slice(1)) ctx.lineTo(punto.x, punto.y)
      ctx.stroke()
    }
  }, [])

  useEffect(() => {
    redibujar()
    window.addEventListener('resize', redibujar)
    return () => window.removeEventListener('resize', redibujar)
  }, [redibujar])

  const puntoDe = (evento) => {
    const caja = lienzoRef.current.getBoundingClientRect()
    return { x: evento.clientX - caja.left, y: evento.clientY - caja.top }
  }

  const alBajar = (evento) => {
    // Captura el puntero: si el trazo se sale del lienzo, los eventos siguen
    // llegando y la firma no se corta a mitad de camino.
    evento.currentTarget.setPointerCapture(evento.pointerId)
    dibujandoRef.current = true
    trazosRef.current.push([puntoDe(evento)])
    setHayFirma(true)
    redibujar()
  }

  const alMover = (evento) => {
    if (!dibujandoRef.current) return
    trazosRef.current[trazosRef.current.length - 1].push(puntoDe(evento))
    redibujar()
  }

  const alSoltar = () => {
    dibujandoRef.current = false
  }

  const limpiar = () => {
    trazosRef.current = []
    setHayFirma(false)
    redibujar()
  }

  return { lienzoRef, hayFirma, limpiar, manejadores: { onPointerDown: alBajar, onPointerMove: alMover, onPointerUp: alSoltar, onPointerCancel: alSoltar } }
}
