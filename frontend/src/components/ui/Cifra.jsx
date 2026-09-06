// Cifra — stat block (value + uppercase label) with a 3px accent bar
// (assets/site.css lines 881-899). Two clone contexts:
//   tono="tinta"  (default): dark section — white value, ink-muted label (index)
//   tono="claro": light section — ink value, muted label (nosotros inline styles)
// acento picks the bar color: '' (accent), 'primario' or 'interactivo' (nosotros).

const TONOS = {
  tinta: { strong: 'text-white', span: 'text-ink-muted' },
  claro: { strong: 'text-ink', span: 'text-muted' },
}

const ACENTOS = {
  '': 'border-accent',
  primario: 'border-primary',
  interactivo: 'border-interactive',
}

export default function Cifra({ valor, etiqueta, tono = 'tinta', acento = '', className = '' }) {
  const t = TONOS[tono] ?? TONOS.tinta
  const clases = `cifra pl-[22px] py-1 border-l-[3px] ${ACENTOS[acento] ?? ACENTOS['']} ${className}`.trim()
  return (
    <div className={clases}>
      <strong
        className={`block font-display font-extrabold text-[clamp(2.2rem,1.6rem+2.4vw,3.4rem)] leading-none tracking-[-0.03em] ${t.strong}`}
      >
        {valor}
      </strong>
      <span className={`block mt-2 text-[0.82rem] tracking-[0.14em] uppercase ${t.span}`}>{etiqueta}</span>
    </div>
  )
}
