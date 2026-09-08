import useContador from '../../hooks/useContador.js'

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

// El número cuenta desde cero al entrar en pantalla (useContador).
// Un solo nodo de texto: la versión anterior duplicaba el valor en un span
// `sr-only` y, aunque no se veía, quedaba en el texto de la página y salía
// repetido al copiar o en modo lectura. No hace falta: el número no vive en
// una región `aria-live`, así que un lector de pantalla lo anuncia solo cuando
// el usuario llega hasta él, y para entonces la cuenta ya terminó.

export default function Cifra({ valor, etiqueta, tono = 'tinta', acento = '', className = '' }) {
  const t = TONOS[tono] ?? TONOS.tinta
  const clases = `cifra pl-[22px] py-1 border-l-[3px] ${ACENTOS[acento] ?? ACENTOS['']} ${className}`.trim()
  const { ref: refNumero, texto: textoNumero } = useContador(valor)
  return (
    <div className={clases}>
      <strong
        ref={refNumero}
        className={`block font-display font-extrabold text-[clamp(2.2rem,1.6rem+2.4vw,3.4rem)] leading-none tracking-[-0.03em] ${t.strong}`}
      >
        {textoNumero}
      </strong>
      <span className={`block mt-2 text-[0.82rem] tracking-[0.14em] uppercase ${t.span}`}>{etiqueta}</span>
    </div>
  )
}
