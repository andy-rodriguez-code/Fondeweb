// Rotulo — section eyebrow ("Fondo de empleados · Floridablanca").
// Mirrors .rotulo + .rotulo::before (assets/site.css lines 180-199); the bar is
// expressed with Tailwind before: utilities (content:'' width/height/background).
// tono="claro" reproduces the clone's tinta-section override
// (.seccion--tinta .rotulo / nosotros inline #6fd9ef).

const TONOS = {
  '': 'text-interactive-ink',
  claro: 'text-interactive-bright',
}

export default function Rotulo({ tono = '', className = '', children }) {
  const clases =
    `rotulo inline-flex items-center gap-2.5 mb-3 font-body font-semibold ` +
    `text-[0.72rem] tracking-[0.14em] uppercase ${TONOS[tono] ?? TONOS['']} ` +
    `before:content-[''] before:w-[26px] before:h-[3px] before:rounded-[2px] before:bg-accent ${className}`.trim()
  return <span className={clases}>{children}</span>
}
