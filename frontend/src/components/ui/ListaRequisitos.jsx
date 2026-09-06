// ListaRequisitos — numbered requirements list with 01, 02… bullets. The
// counter and ::before number are CSS-only (styles/paridad.css §4.4 group 4,
// assets/site.css lines 1194-1222); this component renders the plain <ol>.
// ListaProsa — plain bullet list (.prosa in the clone: assets/site.css lines
// 1775-1779), expressed with utilities.

export default function ListaRequisitos({ items, className = '' }) {
  return (
    <ol className={`requisitos ${className}`.trim()}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  )
}

export function ListaProsa({ items, className = '' }) {
  return (
    <ul className={`prosa pl-5 [&_li]:mb-2 ${className}`.trim()}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}
