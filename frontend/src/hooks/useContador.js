import { useEffect, useMemo, useRef, useState } from 'react'

// useContador — anima una cifra desde cero hasta su valor, cuando el bloque
// entra en pantalla. Arranca una sola vez por elemento.
//
// El valor llega ya formateado desde los datos ('1.200+', '0,8%', '28'), así
// que acá se descompone en prefijo, número y sufijo, se anima el número y se
// vuelve a formatear en es-CO en cada cuadro: así '1.200+' cuenta con su punto
// de miles y '0,8%' conserva el decimal con coma.
//
// Respeta `prefers-reduced-motion` igual que el resto del sitio: con la
// preferencia activa el número aparece directamente en su valor final, sin
// animación.

const DURACION_MS = 1400

// Descompone '1.200+' → { prefijo: '', numero: 1200, sufijo: '+', decimales: 0, agrupa: true }
function analizar(valor) {
  const texto = String(valor)
  const nucleo = texto.match(/[\d.,]+/)
  if (!nucleo) return null

  const crudo = nucleo[0]
  const prefijo = texto.slice(0, nucleo.index)
  const sufijo = texto.slice(nucleo.index + crudo.length)

  const [entera, decimal = ''] = crudo.split(',')
  const numero = Number(`${entera.replace(/\./g, '')}.${decimal || 0}`)
  if (!Number.isFinite(numero)) return null

  return {
    prefijo,
    sufijo,
    numero,
    decimales: decimal.length,
    agrupa: entera.includes('.'),
  }
}

// Desaceleración cúbica: rápido al principio y suave al final.
const suavizar = (t) => 1 - Math.pow(1 - t, 3)

// ¿Hay que animar, o el número arranca directamente en su valor final?
function sinAnimacion() {
  if (typeof window === 'undefined') return true
  if (typeof IntersectionObserver === 'undefined') return true
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function useContador(valor) {
  const ref = useRef(null)
  const partes = useMemo(() => analizar(valor), [valor])
  // El caso sin animación se resuelve en el estado inicial y no dentro del
  // efecto: un setState síncrono ahí dispara un render en cascada.
  const [numero, setNumero] = useState(() => {
    if (!partes) return null
    return sinAnimacion() ? partes.numero : 0
  })

  const formateador = useMemo(() => {
    if (!partes) return null
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: partes.decimales,
      maximumFractionDigits: partes.decimales,
      useGrouping: partes.agrupa,
    })
  }, [partes])

  useEffect(() => {
    if (!partes) return
    const nodo = ref.current
    if (!nodo) return

    if (sinAnimacion()) return

    let cuadro = 0
    let inicio = 0
    const animar = (ahora) => {
      if (!inicio) inicio = ahora
      const avance = Math.min((ahora - inicio) / DURACION_MS, 1)
      setNumero(partes.numero * suavizar(avance))
      if (avance < 1) cuadro = window.requestAnimationFrame(animar)
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((e) => e.isIntersecting)) return
        observador.disconnect()
        cuadro = window.requestAnimationFrame(animar)
      },
      { threshold: 0.4 },
    )
    observador.observe(nodo)

    return () => {
      observador.disconnect()
      if (cuadro) window.cancelAnimationFrame(cuadro)
    }
  }, [partes])

  if (!partes || !formateador) return { ref, texto: valor, animado: false }
  return {
    ref,
    texto: `${partes.prefijo}${formateador.format(numero)}${partes.sufijo}`,
    animado: true,
  }
}
