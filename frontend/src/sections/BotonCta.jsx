import { Link } from 'react-router-dom'

// BotonCta — helper interno de secciones: CTA con la apariencia de Button
// (P3) que además soporta rutas internas. Button solo renderiza <a>/<button>,
// y react-router Link exige `to` + discover="none" explícito (v7 inyecta
// data-discover="true" por defecto, atributo que el clon no tiene — ver nota
// P4). `to` (slug derivado) → Link; `href` (ancla hash o URL externa) → <a>.
// Los mapas VARIANTES/BASE replican el lenguaje visual de Button para los
// variants que las secciones usan (primary, secundario, claro, fantasma);
// cuando Button (P3) soporte `to`, este helper se podrá reconciliar en P6.
// Fuente: frontend/src/components/ui/Button.jsx (solo lectura en esta fase).

const VARIANTES = {
  '': 'border-primary bg-primary text-white hover:border-primary-800 hover:bg-primary-800',
  secundario: 'border-border-strong bg-transparent text-primary hover:border-primary-300 hover:bg-surface-low hover:text-primary-900',
  claro: 'border-white bg-white text-primary-900 hover:border-surface-low hover:bg-surface-low',
  fantasma: 'border-white/70 bg-transparent text-white hover:border-white hover:bg-white/14',
}

const BASE =
  'btn inline-flex items-center justify-center gap-2.5 min-h-12 px-[26px] py-3 ' +
  'border-[1.5px] rounded-pill font-display font-semibold text-[0.95rem] leading-[1.2] ' +
  'no-underline cursor-pointer transition-[background-color,border-color,transform,box-shadow] ' +
  'duration-[180ms] hover:-translate-y-px hover:shadow-low active:translate-y-0'

export default function BotonCta({ to, href, variant = '', className = '', children, ...rest }) {
  const clases =
    `${BASE}${variant ? ` btn--${variant}` : ''} ${VARIANTES[variant] ?? VARIANTES['']} ${className}`.trim()
  if (to !== undefined) {
    return (
      <Link to={to} discover="none" className={clases} {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <a href={href} className={clases} {...rest}>
      {children}
    </a>
  )
}
