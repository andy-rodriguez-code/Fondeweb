// TituloDual — two-weight heading; the <strong> carries the brand color
// (assets/site.css lines 203-211). Children are composed freely
// ("Compará antes de <strong>decidir</strong>"); the descendant styling uses
// Tailwind arbitrary variants. tono="claro" matches the tinta-section override.

const TONOS = {
  '': '[&_strong]:text-primary',
  claro: '[&_strong]:text-interactive-bright',
}

export default function TituloDual({ as: Componente = 'h2', tono = '', className = '', children }) {
  const clases = `titulo-dual [&_strong]:font-extrabold ${TONOS[tono] ?? TONOS['']} ${className}`.trim()
  return <Componente className={clases}>{children}</Componente>
}
