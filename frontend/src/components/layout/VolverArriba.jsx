import { useEffect, useState } from 'react'
import Icono from '../ui/Icono.jsx'

// VolverArriba — botón flotante que aparece cuando ya se bajó lo suficiente
// para que la cabecera no esté a la vista, y devuelve al inicio de la página.
//
// Aparece a partir de 600px de scroll: por debajo de eso el encabezado sigue
// cerca y el botón solo estorbaría. El estado solo se actualiza cuando se
// cruza el umbral, así que el listener no provoca renders en cada píxel.
//
// El desplazamiento es suave salvo que el sistema pida menos movimiento
// (prefers-reduced-motion), donde salta directo.
//
// Accesibilidad: cuando está oculto lleva visibility:hidden (paridad.css
// grupo 25), que lo saca del orden de tabulación. Si se activa con teclado
// (click con detail === 0), el foco se manda al enlace "saltar al contenido",
// que es el primer elemento de la página: sin eso el foco se perdería al
// desaparecer el botón.

const UMBRAL = 600

export default function VolverArriba() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const alScroll = () => {
      const pasado = window.scrollY > UMBRAL
      setVisible((previo) => (previo === pasado ? previo : pasado))
    }
    alScroll()
    window.addEventListener('scroll', alScroll, { passive: true })
    return () => window.removeEventListener('scroll', alScroll)
  }, [])

  const subir = (evento) => {
    const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: menosMovimiento ? 'auto' : 'smooth' })
    if (evento.detail === 0) {
      document.querySelector('.saltar')?.focus({ preventScroll: true })
    }
  }

  return (
    <button
      type="button"
      className="volver-arriba"
      data-visible={visible ? 'si' : 'no'}
      aria-label="Volver al inicio de la página"
      title="Volver arriba"
      onClick={subir}
    >
      <Icono nombre="flecha-arriba" size={22} />
    </button>
  )
}
