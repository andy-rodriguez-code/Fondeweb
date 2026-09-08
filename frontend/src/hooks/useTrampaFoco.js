import { useCallback } from 'react'

// useTrampaFoco — helper de trampa de foco (clon assets/site.js `trampaFoco`):
// recibe una ref al contenedor modal (cajón, visor) y devuelve el manejador
// keydown que mantiene el foco dentro al tabular, envolviendo entre el primer
// y el último elemento enfocable. Selector de enfocables idéntico al clon y
// mismos filtros (visible vía getClientRects y sin atributo hidden). Lo
// consumen useConvenios y useVisor, que lo conectan a un keydown document-level
// mientras el modal está abierto.

export default function useTrampaFoco(ref) {
  return useCallback(
    (e) => {
      if (e.key !== 'Tab') return
      const contenedor = ref.current
      if (!contenedor) return
      const focos = Array.from(
        contenedor.querySelectorAll(
          "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
        ),
      ).filter((el) => el.getClientRects().length > 0 && !el.hasAttribute('hidden'))
      if (!focos.length) return
      const primero = focos[0]
      const ultimo = focos[focos.length - 1]
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault()
        ultimo.focus()
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault()
        primero.focus()
      }
    },
    [ref],
  )
}
