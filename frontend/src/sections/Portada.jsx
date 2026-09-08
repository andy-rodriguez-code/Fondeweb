import BotonCta from './BotonCta.jsx'
import Rotulo from '../components/ui/Rotulo.jsx'
import BannerFoto from './BannerFoto.jsx'
import { bannerDe } from '../data/banners.js'

// Portada — héroe del inicio: rótulo + h1 + bajada + par de CTA sobre la
// fotografía real de producción (home-pc / home-movil), con el mismo velo azul
// que las páginas interiores.
//
// El carrusel de cuatro piezas promocionales que vivía a la derecha se retiró
// el 2026-09-08 por decisión del dueño del proyecto: producción no lo tiene y
// tapaba la fotografía. Con él se fueron `useCarrusel`, el grupo 2 del CSS y
// la píldora .dato-flotante; la cifra "1.200+ asociados" sigue publicada en la
// sección de accesos. El historial lo conserva a partir del commit 15501a7.
//
// CSS: grupo 10 (portada) + grupo 20 (variante con foto).

export default function Portada({ rotulo, titulo, bajada, acciones = [] }) {
  const foto = bannerDe('/')
  return (
    <section
      className={foto ? 'portada portada--foto' : 'portada'}
      data-od-id="portada"
    >
      {foto ? <BannerFoto slug="/" /> : null}
      <div className={`shell portada__rejilla${foto ? ' portada__rejilla--centrada' : ''}`}>
        <div className="portada__texto">
          <Rotulo tono={foto ? 'blanco' : ''}>{rotulo}</Rotulo>
          <h1>{titulo}</h1>
          <p className="portada__bajada">{bajada}</p>
          <div className="portada__acciones">
            {acciones.map((accion) => (
              <BotonCta
                key={accion.etiqueta}
                to={accion.to}
                href={accion.href}
                variant={accion.variante}
                className={accion.clase}
                {...(accion.odId ? { 'data-od-id': accion.odId } : {})}
              >
                {accion.etiqueta}
              </BotonCta>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
