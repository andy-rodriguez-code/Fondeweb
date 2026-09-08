// Tarjeta — card primitive, link and article variants (assets/site.css lines
// 800-831). Children compose freely (h3/h4 + p, Etiqueta, Icono chips…); `pie`
// renders the clone's .tarjeta__pie block. Padding follows the clone:
//   relleno="base"     26px (default)
//   relleno="contacto" clamp(24px,3vw,34px)  (index "Dónde estamos")
//   relleno="amplio"   clamp(26px,3vw,38px)  (ahorro / nosotros inline styles)
// tono="tinta" reproduces the dark card (nosotros "Visión" inline styles).

const RELLENOS = {
  base: 'p-[26px]',
  contacto: 'p-[clamp(24px,3vw,34px)]',
  amplio: 'p-[clamp(26px,3vw,38px)]',
}

// Cada tono trae su propio fondo, borde y color de párrafo. No se apilan sobre
// los del tono claro: dos utilidades Tailwind de la misma propiedad compiten
// por orden en la hoja generada, no por orden en el className, así que
// `bg-white bg-ink` ganaba blanco y dejaba el h2 blanco sobre fondo blanco.
const TONOS = {
  '': 'border-border bg-white [&_p]:text-text',
  tinta: 'border-ink bg-ink [&_h2]:text-white [&_p]:text-ink-bright',
}

export default function Tarjeta({ as, href, relleno = 'base', tono = '', pie, className = '', children, ...rest }) {
  const Componente = as || (href ? 'a' : 'div')
  const esEnlace = href !== undefined
  const clases =
    `tarjeta flex flex-col border rounded-md ` +
    `transition-[border-color,box-shadow,transform] duration-[180ms] ` +
    `[&_h3]:mb-2 [&_h4]:mb-2 [&_p]:text-[0.95rem] ` +
    `${RELLENOS[relleno] ?? RELLENOS.base} ${TONOS[tono] ?? TONOS['']} ` +
    (esEnlace
      ? 'no-underline text-inherit hover:border-primary-300 hover:shadow-low hover:-translate-y-0.5 hover:text-inherit '
      : '') +
    className
  return (
    <Componente {...(esEnlace ? { href } : {})} className={clases.trim()} {...rest}>
      {children}
      {pie ? <div className="tarjeta__pie mt-auto pt-[18px]">{pie}</div> : null}
    </Componente>
  )
}
