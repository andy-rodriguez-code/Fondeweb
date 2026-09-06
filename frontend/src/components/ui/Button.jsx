// Button — mirrors the clone's .btn and its four modifiers
// (--secundario, --claro, --fantasma, --exito). Read-only source:
// assets/site.css lines 217-296. Styled with @theme utilities; the clone's
// `--btn-*` custom properties collapse into the variant's final values.
// Contract (design.md): <Button as="a|button" variant={''|'secundario'|'claro'|'fantasma'|'exito'} href? />

const VARIANTES = {
  '': 'border-primary bg-primary text-white hover:border-primary-800 hover:bg-primary-800',
  secundario: 'border-border-strong bg-transparent text-primary hover:border-primary-300 hover:bg-surface-low hover:text-primary-900',
  claro: 'border-white bg-white text-primary-900 hover:border-surface-low hover:bg-surface-low',
  fantasma: 'border-white/70 bg-transparent text-white hover:border-white hover:bg-white/14',
  exito: 'border-success bg-success text-white hover:border-success-800 hover:bg-success-800',
}

const BASE =
  'btn inline-flex items-center justify-center gap-2.5 min-h-12 px-[26px] py-3 ' +
  'border-[1.5px] rounded-pill font-display font-semibold text-[0.95rem] leading-[1.2] ' +
  'no-underline cursor-pointer transition-[background-color,border-color,transform,box-shadow] ' +
  'duration-[180ms] hover:-translate-y-px hover:shadow-low active:translate-y-0'

export default function Button({ as, variant = '', href, className = '', children, ...rest }) {
  const Componente = as || (href ? 'a' : 'button')
  const clases =
    `${BASE}${variant ? ` btn--${variant}` : ''} ${VARIANTES[variant] ?? VARIANTES['']} ${className}`.trim()
  if (Componente === 'button') {
    return (
      <button type="button" className={clases} {...rest}>
        {children}
      </button>
    )
  }
  return (
    <a href={href} className={clases} {...rest}>
      {children}
    </a>
  )
}
