// Acceso — access card on dark surfaces ("Convenios", "Cómo ser asociado"…).
// Mirrors .acceso / .acceso__icono (assets/site.css lines 834-874): translucent
// white border/background, interactive icon chip, ink-* text ramp. The hover
// text brightening of the paragraph uses group-hover (.acceso:hover p).
// `tono` pinta el chip del icono: 'interactivo' es el cian original del clon,
// 'naranja' usa --color-accent (accesos rápidos de la portada).
import Icono from './Icono.jsx'

const CHIPS = {
  interactivo: 'bg-interactive/20 text-interactive-bright',
  naranja: 'bg-accent/20 text-accent',
}

export default function Acceso({ href, icono, titulo, tono = 'interactivo', className = '', children, ...rest }) {
  const clases =
    `acceso group relative flex flex-col gap-2.5 pt-[26px] px-6 pb-6 border border-white/14 ` +
    `rounded-md bg-white/5 text-ink-bright no-underline ` +
    `transition-[background-color,border-color,transform] duration-[180ms] ` +
    `hover:bg-white/11 hover:border-white/34 hover:-translate-y-[3px] hover:text-white ${className}`.trim()
  return (
    <a href={href} className={clases} {...rest}>
      <span
        className={`acceso__icono w-[42px] h-[42px] grid place-items-center rounded-sm ${CHIPS[tono] ?? CHIPS.interactivo}`}
      >
        <Icono nombre={icono} size={22} />
      </span>
      <h4 className="m-0 text-white">{titulo}</h4>
      <p className="m-0 text-[0.9rem] text-ink-soft group-hover:text-ink-faint">{children}</p>
    </a>
  )
}
