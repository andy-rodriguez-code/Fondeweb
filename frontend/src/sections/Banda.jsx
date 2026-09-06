import BotonCta from './BotonCta.jsx'

// Banda — clon .banda, banda full-bleed con CTA; --primario cambia el verde
// éxito por el azul primario. Sin coreografía de estado → utilidades
// (padding clamp, flex de banda__fila, overrides de h2/h3/p por arbitrary
// variants, igual que Tarjeta en P3). Todos los CTA de banda del clon son
// enlaces internos .html → router Link vía BotonCta (slug derivado).
// accion: { etiqueta, to (slug) | href (ancla/externo), variante? } con
// variante 'fantasma' por defecto (el caso común del clon; index usa
// 'claro'). El slot `children` permite CTA compuestos fuera del patrón.

export default function Banda({ primario = false, titulo, texto, accion, children, ...rest }) {
  const clases =
    `banda py-[clamp(34px,4vw,52px)] text-white ` +
    (primario ? 'banda--primario bg-primary ' : 'bg-success ') +
    `[&_h2]:text-white [&_h2]:m-0 [&_h2]:max-w-[40ch] [&_h2]:text-[clamp(1.25rem,1rem+1vw,1.7rem)] ` +
    `[&_h3]:text-white [&_h3]:m-0 [&_h3]:max-w-[40ch] [&_h3]:text-[clamp(1.25rem,1rem+1vw,1.7rem)] ` +
    `[&_p]:text-[rgba(255,255,255,0.88)] [&_p]:mt-2 [&_p]:mb-0 [&_p]:max-w-[52ch]`
  return (
    <section className={clases} {...rest}>
      <div className="shell banda__fila flex items-center justify-between gap-7 flex-wrap">
        {titulo || texto ? (
          <div>
            {titulo ? <h2>{titulo}</h2> : null}
            {texto ? <p>{texto}</p> : null}
          </div>
        ) : null}
        {children}
        {accion ? (
          <BotonCta
            to={accion.to}
            href={accion.href}
            variant={accion.variante ?? 'fantasma'}
            {...(accion.descarga ? { download: accion.descarga } : {})}
            {...(accion.odId ? { 'data-od-id': accion.odId } : {})}
          >
            {accion.etiqueta}
          </BotonCta>
        ) : null}
      </div>
    </section>
  )
}
