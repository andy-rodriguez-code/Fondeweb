import Rotulo from '../components/ui/Rotulo.jsx'
import TituloDual from '../components/ui/TituloDual.jsx'
import { notifondo } from '../data/notifondo.js'

// NotifondoGrid — composite "Boletín del asociado" (clon index.html,
// data-od-id="rejilla-notifondo"): encabezado (rótulo + titulo-dual + texto)
// + rejilla .notifondo de 8 hojas-botón. `datos` por defecto es el módulo
// notifondo.js (P2); las rutas verbatim `src` se resuelven a imports de Vite
// (src/assets/images/fondefos.com.co/) por basename. Cada hoja conserva
// data-visor-src/data-visor-alt (useVisor en P8 los consume) y el pie
// "Página N / Ampliar". CSS: grupo 16 (§4.4 rejilla + hoja).

const PAGINAS = import.meta.glob('../assets/images/fondefos.com.co/notifondo-*', {
  eager: true,
  import: 'default',
})

const imagenDe = (src) => PAGINAS[`../assets/images/fondefos.com.co/${src.split('/').pop()}`]

export default function NotifondoGrid({ datos = notifondo, encabezado, ...rest }) {
  const { rotulo, titulo, texto } = encabezado ?? datos.encabezado
  return (
    <div className="shell">
      <div className="max-w-[60ch] mb-[34px]">
        <Rotulo>{rotulo}</Rotulo>
        <TituloDual>
          {titulo.inicio}
          <strong>{titulo.destacado}</strong>
          {titulo.fin}
        </TituloDual>
        {texto ? <p>{texto}</p> : null}
      </div>
      <div className="notifondo" data-od-id="rejilla-notifondo" {...rest}>
        {datos.paginas.map((pagina, i) => (
          <button
            type="button"
            className="notifondo__hoja"
            data-od-id={`notifondo-${i + 1}`}
            data-visor-src={pagina.src}
            data-visor-alt={pagina.alt}
            key={pagina.src}
          >
            <img src={imagenDe(pagina.src)} width="819" height="1024" loading="lazy" alt={pagina.alt} />
            <span className="notifondo__pie">
              <span>{pagina.pagina}</span>
              <span>{pagina.accion}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
