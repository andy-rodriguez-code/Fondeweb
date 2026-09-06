import BotonCta from './BotonCta.jsx'
import MarcoOffset from './MarcoOffset.jsx'
import Rotulo from '../components/ui/Rotulo.jsx'
import Icono from '../components/ui/Icono.jsx'
import marcaAgua from '../assets/images/fondefos.com.co/background_fondo_ico-e48e1f6f69.webp'
import lamina1 from '../assets/images/fondefos.com.co/PLAN-100-NOVIEMBRE_11zon-768x960-9bf7cfe8ff.webp'
import lamina2 from '../assets/images/fondefos.com.co/MERCAMIL-NOVIEMBRE_11zon-768x960-66de9a4dcc.webp'
import lamina3 from '../assets/images/fondefos.com.co/P2-1-768x960-6f1468d4e0.png'
import lamina4 from '../assets/images/fondefos.com.co/P2-2-768x960-304188c20a.png'

// Portada — héroe asimétrico del inicio (clon .portada): rótulo + h1 + bajada
// + par de CTA a la izquierda, carrusel en marco desplazado a la derecha
// (4 láminas 768×960, flechas, puntos y píldora flotante). Renderiza el
// estado inicial estático del clon (data-activa="si" en la primera lámina,
// aria-current="true" en el primer punto); useCarrusel (P8) reflejará esos
// mismos atributos — el CSS del carrusel (grupo 2) ya selecciona por ellos.
// Las cuatro imágenes son fijas de la portada (imports de Vite desde
// src/assets/); `laminas` solo aporta los alt verbatim del clon, en orden.
// CSS: grupo 10 (portada) + grupo 11 (marco + dato flotante).

const LAMINAS = [lamina1, lamina2, lamina3, lamina4]

export default function Portada({ rotulo, titulo, bajada, acciones = [], laminas = [], datoFlotante }) {
  return (
    <section className="portada" data-od-id="portada">
      <img
        className="portada__marca-agua"
        src={marcaAgua}
        width="298"
        height="355"
        alt=""
        aria-hidden="true"
      />
      <div className="shell portada__rejilla">
        <div className="portada__texto">
          <Rotulo>{rotulo}</Rotulo>
          <h1>{titulo}</h1>
          <p className="portada__bajada">{bajada}</p>
          <div className="portada__acciones">
            {acciones.map((accion) => (
              <BotonCta
                key={accion.etiqueta}
                to={accion.to}
                href={accion.href}
                variant={accion.variante}
                {...(accion.odId ? { 'data-od-id': accion.odId } : {})}
              >
                {accion.etiqueta}
              </BotonCta>
            ))}
          </div>
        </div>

        <MarcoOffset caja="carrusel" cajaProps={{ 'data-carrusel': '', 'data-od-id': 'carrusel-portada' }}>
          <div className="carrusel__pista">
            {laminas.map((lamina, i) => {
              const activa = i === 0
              return (
                <div
                  className="carrusel__lamina"
                  data-activa={activa ? 'si' : 'no'}
                  aria-hidden={activa ? 'false' : 'true'}
                  key={i}
                >
                  <img
                    src={LAMINAS[i]}
                    width="768"
                    height="960"
                    alt={lamina.alt}
                    {...(activa ? { fetchPriority: 'high' } : { loading: 'lazy' })}
                  />
                </div>
              )
            })}
          </div>
          <button type="button" className="carrusel__nav carrusel__nav--prev" aria-label="Pieza anterior">
            <Icono nombre="chevron-izquierda" size={18} />
          </button>
          <button type="button" className="carrusel__nav carrusel__nav--sig" aria-label="Pieza siguiente">
            <Icono nombre="chevron-derecha" size={18} />
          </button>
          <div className="carrusel__puntos" aria-label="Piezas destacadas">
            {laminas.map((_, i) => (
              <button
                type="button"
                className="carrusel__punto"
                aria-current={i === 0 ? 'true' : undefined}
                aria-label={`Ver pieza ${i + 1} de ${laminas.length}`}
                key={i}
              />
            ))}
          </div>
          <div className="dato-flotante">
            <div>
              <strong>{datoFlotante.valor}</strong>
              <span>{datoFlotante.etiqueta}</span>
            </div>
          </div>
        </MarcoOffset>
      </div>
    </section>
  )
}
