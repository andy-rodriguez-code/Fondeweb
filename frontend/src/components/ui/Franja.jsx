// Franja — primary-colored banner with icon chip, centered title and optional
// CTA slot (assets/site.css lines 753-786; clone usage: ahorro.html "retiro
// parcial" with a fantasma Button). The clone's image variant
// (.franja__miniatura) is unused across the 18 pages, so it is intentionally
// not represented here.
import Icono from './Icono.jsx'

export default function Franja({ icono, titulo, className = '', children }) {
  const clases =
    `franja relative flex items-center gap-6 min-h-[108px] px-[clamp(20px,3vw,34px)] py-5 ` +
    `rounded-md bg-primary text-white overflow-hidden ${className}`.trim()
  return (
    <div className={clases}>
      <span className="acceso__icono flex-none w-[42px] h-[42px] grid place-items-center rounded-sm bg-interactive/20 text-interactive-bright">
        <Icono nombre={icono} size={22} />
      </span>
      <h3 className="flex-1 m-0 text-white text-[clamp(1.1rem,0.95rem+0.7vw,1.5rem)] uppercase tracking-[0.02em]">
        {titulo}
      </h3>
      {children}
    </div>
  )
}
