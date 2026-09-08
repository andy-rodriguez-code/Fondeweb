import BotonCta from './BotonCta.jsx'
import Etiqueta from '../components/ui/Etiqueta.jsx'
import useConvenios from '../hooks/useConvenios.js'
import { convenios } from '../data/convenios.js'

// Convenios — composite de la página de convenios (clon convenios.html):
// filtros por categoría + rejilla--4 de 28 tarjetas-botón + vacío oculto +
// cajón lateral de detalle. useConvenios (P8) refleja desde estado los
// atributos que el clon manipula con site.js (aria-pressed, hidden de
// tarjetas, conteo aria-live, data-abierto del cajón y su ficha) — el CSS
// del cajón (grupo 15) selecciona por [data-abierto="si"]. El clon coloca el
// cajón después del pie y lo llena con site.js; en React vive junto a la
// sección (position: fixed → la paridad visual es idéntica; el orden DOM
// difiere, documentado).
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

// Ficha del cajón — port del clon site.js abrirCajon: lista de campos con
// etiqueta, valor y transformación de enlace (tel:/mailto:), idénticas al
// clon; los campos sin valor se omiten. La nota del monograma convierte los
// inline styles del clon por §4.3 (margin 12px 0 0 → mt-3, font-size 0.85rem
// → text-[0.85rem], color #667487 → token --color-muted).
const CAMPOS_FICHA = [
  { etiqueta: 'Asesor comercial', valor: (c) => c.asesor, href: null },
  {
    etiqueta: 'Teléfono',
    valor: (c) => c.telefono,
    href: (c) => (c.telefono ? 'tel:' + c.telefono.replace(/[^0-9+]/g, '') : null),
  },
  {
    etiqueta: 'Correo',
    valor: (c) => c.correo,
    href: (c) => (c.correo ? 'mailto:' + c.correo.split(/[\s/]+/)[0] : null),
  },
  { etiqueta: 'Dirección', valor: (c) => c.direccion, href: null },
]

export default function Convenios({ datos = convenios }) {
  const {
    categoria,
    filtrar,
    busqueda,
    buscar,
    visibles,
    item,
    abierto,
    cajonRef,
    abrirCajon,
    cerrarCajon,
  } = useConvenios(datos)

  const conteo = visibles.length === 1 ? '1 convenio' : `${visibles.length} convenios`
  const idsVisibles = new Set(visibles.map((c) => c.id))

  return (
    <>
      <div className="shell">
        {/* Selector de categoría y buscador, en una sola fila. En teléfono se
            apilan. Reemplazan la hilera de 15 botones del clon: con esa
            cantidad de categorías la hilera ocupaba tres renglones. */}
        <div className="filtros-convenios" data-od-id="filtros-convenios">
          <div className="campo-filtro">
            <label htmlFor="convenios-categoria">Categoría</label>
            <select
              id="convenios-categoria"
              value={categoria}
              onChange={(e) => filtrar(e.target.value)}
            >
              {FILTROS.map((filtro) => (
                <option value={filtro.id} key={filtro.id}>
                  {filtro.etiqueta}
                </option>
              ))}
            </select>
          </div>
          <div className="campo-filtro">
            <label htmlFor="convenios-busqueda">Buscar</label>
            <input
              id="convenios-busqueda"
              type="search"
              value={busqueda}
              onChange={(e) => buscar(e.target.value)}
              placeholder="Nombre, categoría o asesor"
              autoComplete="off"
            />
          </div>
        </div>
        <p
          className="mb-6 text-muted text-[0.92rem]"
          data-od-id="convenios-conteo"
          aria-live="polite"
        >
          {conteo}
        </p>
        <div className="rejilla rejilla--4" data-od-id="rejilla-convenios">
          {datos.map((convenio) => {
            // La visibilidad la decide el hook, que ya combina categoría y
            // búsqueda; acá solo se refleja con `hidden`, como el clon.
            const oculto = !idsVisibles.has(convenio.id)
            return (
              <button
                type="button"
                className="convenio"
                data-convenio={convenio.id}
                data-categorias={convenio.categoria}
                data-od-id={`convenio-${convenio.id}`}
                hidden={oculto}
                onClick={(e) => abrirCajon(convenio.id, e.currentTarget)}
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
            )
          })}
        </div>
        <p className="vacio" data-od-id="convenios-vacio" hidden={visibles.length !== 0}>
          No hay convenios publicados en esta categoría.
        </p>
      </div>

      <div
        className="cajon"
        data-od-id="cajon-convenio"
        data-abierto={abierto ? 'si' : 'no'}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cajon-titulo"
        ref={cajonRef}
      >
        <button
          type="button"
          className="cajon__velo"
          data-cerrar-cajon
          aria-label="Cerrar el detalle del convenio"
          onClick={cerrarCajon}
        ></button>
        <div className="cajon__panel">
          <button
            type="button"
            className="cajon__cerrar"
            data-cerrar-cajon
            aria-label="Cerrar el detalle del convenio"
            onClick={cerrarCajon}
          >
            ✕
          </button>
          {item ? (
            <>
              <span className={ETIQUETA_VACIA} data-od-id="cajon-categoria">
                {item.categoriaNombre}
              </span>
              <h2 id="cajon-titulo" data-od-id="cajon-titulo" className="mt-3">
                {item.nombre}
              </h2>
              <div className="cajon__marca" data-od-id="cajon-marca">
                {item.logo ? (
                  <img
                    src={logoDe(item.logo)}
                    alt={`Logotipo de ${item.nombre}`}
                    loading="lazy"
                  />
                ) : (
                  <>
                    <span className="convenio__inicial" aria-hidden="true">
                      {item.nombre.charAt(0)}
                    </span>
                    <p className="mt-3 text-[0.85rem] text-muted">
                      Este convenio no publica logotipo en el sitio original.
                    </p>
                  </>
                )}
              </div>
              <dl className="ficha" data-od-id="cajon-ficha">
                {CAMPOS_FICHA.map((campo) => {
                  const valor = campo.valor(item)
                  if (!valor) return null
                  const href = campo.href ? campo.href(item) : null
                  return (
                    <div className="ficha__campo" key={campo.etiqueta}>
                      <dt>{campo.etiqueta}</dt>
                      <dd>{href ? <a href={href}>{valor}</a> : valor}</dd>
                    </div>
                  )
                })}
              </dl>
            </>
          ) : (
            <>
              <span className={ETIQUETA_VACIA} data-od-id="cajon-categoria"></span>
              <h2 id="cajon-titulo" data-od-id="cajon-titulo" className="mt-3"></h2>
              <div className="cajon__marca" data-od-id="cajon-marca"></div>
              <dl className="ficha" data-od-id="cajon-ficha"></dl>
            </>
          )}
          <BotonCta to="/contactenos" variant="secundario" className="w-full mt-[26px]">
            ¿Tu empresa quiere ser convenio?
          </BotonCta>
        </div>
      </div>
    </>
  )
}
