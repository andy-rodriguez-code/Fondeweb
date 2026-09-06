import BotonCta from './BotonCta.jsx'
import Etiqueta from '../components/ui/Etiqueta.jsx'
import { convenios } from '../data/convenios.js'

// Convenios — composite de la página de convenios (clon convenios.html):
// filtros por categoría + rejilla--4 de 28 tarjetas-botón + vacío oculto +
// cajón lateral de detalle (data-abierto="no", campos vacíos que useConvenios
// en P8 llena; el CSS del cajón — grupo 15 — selecciona por
// [data-abierto="si"]). El clon coloca el cajón después del pie y lo llena
// con site.js; en React vive junto a la sección (position: fixed → la paridad
// visual es idéntica; el orden DOM difiere, documentado).
// Logos: los paths verbatim del módulo se resuelven por basename a imports
// de Vite (glob eager de src/assets/images/convenios/); los 3 `logo: null`
// usan el monograma .convenio__inicial. Los filtros conservan el orden fijo
// del clon (la lista no es derivable del orden de los registros).
// CSS: grupo 15 (filtros, convenio, vacío, cajón, ficha) + grupo 12 (rejilla).

const LOGOS = import.meta.glob('../assets/images/convenios/*', {
  eager: true,
  import: 'default',
})

const logoDe = (logo) => LOGOS[`../assets/images/convenios/${logo.split('/').pop()}`]

const FILTROS = [
  { id: 'todos', etiqueta: 'Todos' },
  { id: 'agencia-de-viajes', etiqueta: 'Agencia de viajes' },
  { id: 'asistencia-medica', etiqueta: 'Asistencia médica' },
  { id: 'automovilismo', etiqueta: 'Automovilismo' },
  { id: 'calzado', etiqueta: 'Calzado y ropa' },
  { id: 'capacitacion', etiqueta: 'Capacitación' },
  { id: 'cosmeticos', etiqueta: 'Cosméticos y belleza' },
  { id: 'detalles', etiqueta: 'Detalles' },
  { id: 'educacion', etiqueta: 'Educación' },
  { id: 'electrodomesticos', etiqueta: 'Electrodomésticos' },
  { id: 'lenceria-y-hogar', etiqueta: 'Lencería y hogar' },
  { id: 'prepagada', etiqueta: 'Medicina prepagada' },
  { id: 'sin-categoria', etiqueta: 'Otros convenios' },
  { id: 'servicios', etiqueta: 'Servicios fúnebres' },
  { id: 'tecnologia', etiqueta: 'Tecnología' },
]

// Los slots del cajón llevan la clase .etiqueta sin utilidades (P8 los llena
// por id): Etiqueta no propaga atributos extra (contrato P3), así que se
// replica su cadena de utilidades en el span vacío del cajón.
const ETIQUETA_VACIA =
  'etiqueta self-start px-3 py-1 rounded-pill bg-accent-100 text-accent-ink ' +
  'font-body font-semibold text-[0.72rem] tracking-[0.06em] uppercase'

export default function Convenios({ datos = convenios }) {
  return (
    <>
      <div className="shell">
        <div
          className="filtros"
          data-od-id="filtros-convenios"
          role="group"
          aria-label="Filtrar convenios por categoría"
        >
          {FILTROS.map((filtro) => (
            <button
              type="button"
              className="filtro"
              data-categoria={filtro.id}
              aria-pressed={filtro.id === 'todos'}
              key={filtro.id}
            >
              {filtro.etiqueta}
            </button>
          ))}
        </div>
        <p
          className="mb-6 text-muted text-[0.92rem]"
          data-od-id="convenios-conteo"
          aria-live="polite"
        ></p>
        <div className="rejilla rejilla--4" data-od-id="rejilla-convenios">
          {datos.map((convenio) => (
            <button
              type="button"
              className="convenio"
              data-convenio={convenio.id}
              data-categorias={convenio.categoria}
              data-od-id={`convenio-${convenio.id}`}
              key={convenio.id}
            >
              <span className="convenio__marca">
                {convenio.logo ? (
                  <img
                    src={logoDe(convenio.logo)}
                    loading="lazy"
                    alt={`Logotipo de ${convenio.nombre}`}
                  />
                ) : (
                  <span className="convenio__inicial" aria-hidden="true">
                    {convenio.nombre[0]}
                  </span>
                )}
              </span>
              <span className="convenio__cuerpo">
                <Etiqueta>{convenio.categoriaNombre}</Etiqueta>
                <h3>{convenio.nombre}</h3>
                <span className="convenio__ver">Ver datos del asesor →</span>
              </span>
            </button>
          ))}
        </div>
        <p className="vacio" data-od-id="convenios-vacio" hidden>
          No hay convenios publicados en esta categoría.
        </p>
      </div>

      <div
        className="cajon"
        data-od-id="cajon-convenio"
        data-abierto="no"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cajon-titulo"
      >
        <button type="button" className="cajon__velo" data-cerrar-cajon aria-label="Cerrar el detalle del convenio"></button>
        <div className="cajon__panel">
          <button type="button" className="cajon__cerrar" data-cerrar-cajon aria-label="Cerrar el detalle del convenio">
            ✕
          </button>
          <span className={ETIQUETA_VACIA} data-od-id="cajon-categoria"></span>
          <h2 id="cajon-titulo" data-od-id="cajon-titulo" className="mt-3"></h2>
          <div className="cajon__marca" data-od-id="cajon-marca"></div>
          <dl className="ficha" data-od-id="cajon-ficha"></dl>
          <BotonCta to="/contactenos" variant="secundario" className="w-full mt-[26px]">
            ¿Tu empresa quiere ser convenio?
          </BotonCta>
        </div>
      </div>
    </>
  )
}
