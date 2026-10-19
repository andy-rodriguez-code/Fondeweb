import { createElement } from 'react'
import Rotulo from '../components/ui/Rotulo.jsx'
import TituloDual from '../components/ui/TituloDual.jsx'
import Button from '../components/ui/Button.jsx'
import Icono from '../components/ui/Icono.jsx'
import useVisto from '../hooks/useVisto.js'
import { imagenNotifondo } from '../lib/imagenesNotifondo.js'
import { notifondo } from '../data/notifondo.js'

// NotifondoGrid — sección "Boletín del asociado" presentada como revista:
// encabezado (rótulo + titulo-dual + texto + "Leer el Notifondo") junto a una
// pila de tres hojas —la publicación más reciente de portada y las dos
// siguientes detrás—, y debajo la tira .notifondo con todas las
// publicaciones. Todo disparador porta data-visor-* (useVisor los lee para
// armar la secuencia del visor). CSS: paridad.css grupo 16.

const MEDIDAS = { ancho: 819, alto: 1024 }

function Hoja({ pagina, alt = pagina.alt }) {
  const { ancho, alto } = { ...MEDIDAS, ...pagina }
  return <img src={imagenNotifondo(pagina.src)} width={ancho} height={alto} loading="lazy" alt={alt} />
}

const atributosVisor = ({ src, alt, enlace }) => ({
  'data-visor-src': src,
  'data-visor-alt': alt,
  'data-visor-enlace': enlace?.href,
  'data-visor-enlace-etiqueta': enlace?.etiqueta,
})

export default function NotifondoGrid({ datos = notifondo, encabezado, ...rest }) {
  const { rotulo, titulo, texto, accion } = encabezado ?? datos.encabezado
  const [portada, ...resto] = datos.paginas
  const detras = resto.slice(0, 2)
  const { ref, visto } = useVisto()
  return (
    <div className="shell">
      <div className="revista">
        <div className="revista__texto">
          <Rotulo>{rotulo}</Rotulo>
          <TituloDual>
            {titulo.inicio}
            <strong>{titulo.destacado}</strong>
            {titulo.fin}
          </TituloDual>
          {texto ? <p>{texto}</p> : null}
          <div className="revista__acciones">
            <Button {...atributosVisor(portada)}>
              {accion}
              <Icono nombre="chevron-derecha" size={18} />
            </Button>
            <span className="revista__dato">{datos.paginas.length} publicaciones</span>
          </div>
        </div>
        <div className="revista__pila" data-visto={visto ? 'si' : 'no'} ref={ref}>
          {detras.map((pagina, i) => (
            <span className={`revista__hoja revista__hoja--${i + 2}`} aria-hidden="true" key={pagina.src}>
              <Hoja pagina={pagina} alt="" />
            </span>
          ))}
          <button type="button" className="revista__hoja revista__portada" {...atributosVisor(portada)}>
            <Hoja pagina={portada} />
            <span className="revista__sello" aria-hidden="true">
              Abrir
            </span>
          </button>
        </div>
      </div>
      <div className="notifondo" data-od-id="rejilla-notifondo" {...rest}>
        {datos.paginas.map((pagina, i) =>
          // createElement y no JSX: `key` tiene que ir aparte del spread de
          // atributosVisor.
          createElement(
            'button',
            {
              type: 'button',
              className: 'notifondo__hoja',
              'data-od-id': `notifondo-${i + 1}`,
              ...atributosVisor(pagina),
              key: pagina.src,
            },
            <Hoja pagina={pagina} />,
            <span className="notifondo__pie">{pagina.pagina}</span>,
          ),
        )}
      </div>
    </div>
  )
}
