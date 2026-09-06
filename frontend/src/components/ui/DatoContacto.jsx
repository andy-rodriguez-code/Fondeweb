// DatoContacto — contact row (icon + h4 + paragraph) used in the "Dónde estamos"
// block and contact page (assets/site.css lines 1461-1491). The first item in a
// group drops its top border via first: variants (clone: .dato-contacto:first-child).
import Icono from './Icono.jsx'

export default function DatoContacto({ icono, titulo, className = '', children }) {
  const clases =
    `dato-contacto flex gap-4 py-5 border-t border-border first:border-t-0 first:pt-0 ${className}`.trim()
  return (
    <div className={clases}>
      <span className="dato-contacto__icono flex-none w-[42px] h-[42px] grid place-items-center rounded-sm bg-surface-low text-primary">
        <Icono nombre={icono} size={18} />
      </span>
      <div>
        <h4 className="mb-1">{titulo}</h4>
        <p className="m-0 text-[0.97rem]">{children}</p>
      </div>
    </div>
  )
}
