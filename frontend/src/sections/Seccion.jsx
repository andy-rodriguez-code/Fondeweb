// Seccion — clon .seccion con variantes de tono:
//   ''      plana (solo el padding-block clamp)
//   bright  .seccion--bright (surface-bright)
//   tinta   .seccion--tinta (fondo ink; descendientes claros)
// El tinta se resuelve con arbitrary variants (misma técnica que Tarjeta
// tono="tinta" en P3); los hijos Rotulo/TituloDual dentro de tinta usan su
// propio tono="claro" (P3), igual que en el clon.
// La sección NO envuelve en .shell: cada composite posee su contenedor del
// clon (Split → shell split, Credito → shell credito, LineasGrid/NotifondoGrid
// → shell, páginas planas → <div class="shell">). Contrato de diseño:
// <Seccion tono="bright|tinta|''"><Split invertido? media? /></Seccion>.

const TONOS = {
  '': 'py-[clamp(56px,7vw,104px)]',
  bright: 'seccion--bright py-[clamp(56px,7vw,104px)] bg-surface-bright',
  tinta: 'seccion--tinta py-[clamp(56px,7vw,104px)] bg-ink text-ink-bright [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white',
}

export default function Seccion({ tono = '', id, className = '', children, ...rest }) {
  const clases = `seccion ${TONOS[tono] ?? TONOS['']} ${className}`.trim()
  return (
    <section className={clases} {...(id ? { id } : {})} {...rest}>
      {children}
    </section>
  )
}
