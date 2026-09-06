// Etiqueta — pill label ("0,8% mensual", "Obligatorio"). Mirrors .etiqueta
// (assets/site.css lines 1310-1322): accent-100 background with accent-ink text.

export default function Etiqueta({ className = '', children }) {
  const clases =
    `etiqueta self-start px-3 py-1 rounded-pill bg-accent-100 text-accent-ink ` +
    `font-body font-semibold text-[0.72rem] tracking-[0.06em] uppercase ${className}`.trim()
  return <span className={clases}>{children}</span>
}
