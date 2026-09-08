// DatoContacto — contact row (icon + h4 + paragraph) used in the "Dónde estamos"
// block and contact page (assets/site.css lines 1461-1491). The first item in a
// group drops its top border via first: variants (clone: .dato-contacto:first-child).
import Icono from './Icono.jsx'

// `tituloEnMayuscula` deja el h4 en versalitas por CSS (uppercase), no en el
// literal: el texto real sigue en minúsculas y un lector de pantalla no lo
// deletrea letra por letra. La tipografía iguala a la de los títulos del pie
// (.pie h4: 0.82rem / 1.14 / 600 / tracking 0.14em), que es la referencia que
// pidió el cliente; el h4 base del grupo 1 va en 1.05rem sin espaciado.
export default function DatoContacto({ icono, titulo, tituloEnMayuscula = false, className = '', children }) {
  const clases =
    `dato-contacto flex gap-4 py-5 border-t border-border first:border-t-0 first:pt-0 ${className}`.trim()
  return (
    <div className={clases}>
      <span className="dato-contacto__icono flex-none w-[42px] h-[42px] grid place-items-center rounded-sm bg-surface-low text-primary">
        <Icono nombre={icono} size={18} />
      </span>
      <div>
        <h4
          className={
            tituloEnMayuscula
              ? 'mb-1 uppercase text-[0.82rem] leading-[1.14] font-semibold tracking-[0.14em]'
              : 'mb-1'
          }
        >
          {titulo}
        </h4>
        <p className="m-0 text-[0.97rem]">{children}</p>
      </div>
    </div>
  )
}
