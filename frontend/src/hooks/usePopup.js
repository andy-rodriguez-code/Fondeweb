import { useCallback, useEffect, useRef, useState } from 'react'
import useTrampaFoco from './useTrampaFoco.js'
import horaServidor from '../lib/horaServidor.js'

// usePopup — ciclo de vida de un popup que se abre solo al entrar al sitio.
//
// Pasa por tres estados: 'oculto' (no está en el DOM), 'visible' y 'saliendo'.
// El tercero existe para la animación de salida: sin él, cerrar desmontaría el
// popup en el acto y no habría nada que animar.
//
// Se abre una vez por carga de la página, pasados `esperaMs`. No guarda nada en
// el navegador: quien vuelve a entrar lo vuelve a ver, que es lo pedido. Vive en
// el Layout, que no se desmonta al navegar, así que cambiar de página dentro
// del sitio no lo reabre.
//
// El desmontaje va por temporizador y no por `animationend`: el widget de
// accesibilidad puede anular las animaciones, y entonces ese evento no llega
// nunca y el velo quedaría tapando el sitio.
//
// Mientras está abierto se comporta como un diálogo modal: el foco entra y no
// sale (useTrampaFoco), Escape lo cierra, la página de fondo no se desplaza y,
// al cerrar, el foco vuelve a donde estaba.

// `vigencia` ({ desde, hasta }, fechas ISO con su zona horaria) limita los días
// en que se abre. Las fechas llevan la zona escrita, así que el instante de
// corte es el mismo para todos sin importar dónde esté el visitante. La hora
// se le pregunta al servidor (lib/horaServidor.js) y no al dispositivo, que
// puede tener el reloj mal puesto. Solo si esa consulta falla se usa el reloj
// del dispositivo: entre no mostrar un aviso vigente y arriesgarse a un reloj
// errado, se prefiere mostrarlo.
//
// La consulta corre durante la espera, no después: el popup abre a los
// `esperaMs` de siempre, salvo que el servidor tarde más que eso.

const enVigencia = ({ desde, hasta }, ahora) =>
  ahora >= Date.parse(desde) && ahora < Date.parse(hasta)

export default function usePopup({ esperaMs, salidaMs, vigencia }) {
  const [estado, setEstado] = useState('oculto')
  const popupRef = useRef(null)
  const trampa = useTrampaFoco(popupRef)
  const montado = estado !== 'oculto'

  const cerrar = useCallback(() => {
    setEstado((previo) => (previo === 'visible' ? 'saliendo' : previo))
  }, [])

  useEffect(() => {
    let cancelado = false
    let espera
    const inicio = Date.now()

    const abrir = async () => {
      if (vigencia) {
        const ahora = await horaServidor().catch(() => Date.now())
        if (cancelado || !enVigencia(vigencia, ahora)) return
      }
      const restante = Math.max(0, esperaMs - (Date.now() - inicio))
      espera = window.setTimeout(() => setEstado('visible'), restante)
    }
    abrir()

    return () => {
      cancelado = true
      window.clearTimeout(espera)
    }
  }, [esperaMs, vigencia])

  useEffect(() => {
    if (estado !== 'saliendo') return
    const salida = window.setTimeout(() => setEstado('oculto'), salidaMs)
    return () => window.clearTimeout(salida)
  }, [estado, salidaMs])

  useEffect(() => {
    if (!montado) return
    const popup = popupRef.current
    const origen = document.activeElement
    const desborde = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // El foco va al diálogo y no a su primer botón: así el lector de pantalla
    // anuncia el título y no aparece un anillo de foco que nadie pidió.
    popup?.focus({ preventScroll: true })

    const alTeclear = (e) => {
      if (e.key === 'Escape') {
        cerrar()
        return
      }
      // Con el foco todavía en el diálogo, la trampa no tiene desde dónde
      // envolver: el primer Tab se manda al primer control.
      if (e.key === 'Tab' && document.activeElement === popup) {
        e.preventDefault()
        popup.querySelector('button, a[href]')?.focus()
        return
      }
      trampa(e)
    }
    document.addEventListener('keydown', alTeclear)

    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.body.style.overflow = desborde
      origen?.focus?.({ preventScroll: true })
    }
  }, [montado, cerrar, trampa])

  return { estado, montado, popupRef, cerrar }
}
