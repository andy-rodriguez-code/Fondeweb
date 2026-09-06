// SkipLink — "Saltar al contenido principal" (clone .saltar).
// Plain anchor to #contenido (main id rendered by Layout); the browser
// performs the fragment scroll natively. Read-only source: root *.html
// (identical across all 18 pages). Styled by paridad.css group 6.
export default function SkipLink() {
  return (
    <a className="saltar" href="#contenido">
      Saltar al contenido principal
    </a>
  )
}
