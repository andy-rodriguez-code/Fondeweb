import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import Banda from '../sections/Banda.jsx'
import Split from '../sections/Split.jsx'
import MarcoOffset from '../sections/MarcoOffset.jsx'
import Rotulo from '../components/ui/Rotulo.jsx'
import TituloDual from '../components/ui/TituloDual.jsx'
import Tarjeta from '../components/ui/Tarjeta.jsx'
import Etiqueta from '../components/ui/Etiqueta.jsx'
import Cifra from '../components/ui/Cifra.jsx'
import notifondoPortada from '../assets/images/fondefos.com.co/notifondo-web-1-819x1024-d6a063db7d.webp'

// nosotros — página institucional (clon nosotros.html). Banner con cifras +
// Split visión/misión (tarjeta tinta) + principios (rejilla--3) + objetivos
// (split invertido con marco-offset) + banda de cierre. Los literales
// exclusivos de esta página no tienen módulo P2 propio (la especificación
// exige módulos solo para líneas/faq/ahorro/convenios/notifondo/navegación):
// viven aquí como constantes verbatim del clon. data-od-id del clon:
// seccion-vision-mision, seccion-principios (principio-*), seccion-objetivos,
// banda-cierre.

const ENCABEZADO = {
  entrada: 'FONDEFOS es una empresa asociativa de derecho privado constituida para fomentar el ahorro y prestar servicios de crédito a sus asociados.',
  cifras: [
    { valor: '1.200+', etiqueta: 'Asociados', acento: 'primario' },
    { valor: '65+', etiqueta: 'Convenios', acento: 'interactivo' },
  ],
}

const VISION = {
  rotulo: 'Visión',
  titulo: 'Solución inmediata a lo más apremiante',
  texto: 'La visión de FONDEFOS es la de ser fuente para la solución inmediata de las necesidades más apremiantes y ordinarias de sus asociados, mediante la regulación del ahorro y el crédito en forma solidaria.',
}

const MISION = {
  rotulo: 'Misión',
  titulo: (
    <>
      Contribuir al <strong>desarrollo integral</strong> del asociado y su familia
    </>
  ),
  texto: 'La misión de FONDEFOS es contribuir al desarrollo integral de los asociados y su grupo familiar, y propender por un vínculo socioempresarial y un elevamiento de identidad laboral que les motive a fortalecer y crear mayor capital para su usufructo personal y la inversión en la familia.',
}

const PRINCIPIOS = [
  { numero: '01', titulo: 'Honestidad', odId: 'principio-honestidad' },
  { numero: '02', titulo: 'Democracia', odId: 'principio-democracia' },
  { numero: '03', titulo: 'Solidaridad', odId: 'principio-solidaridad' },
  { numero: '04', titulo: 'Equidad', odId: 'principio-equidad' },
  { numero: '05', titulo: 'Transparencia', odId: 'principio-transparencia' },
]

const OBJETIVOS = {
  rotulo: 'Objetivos',
  titulo: (
    <>
      Ahorro, crédito y <strong>bienestar social</strong>
    </>
  ),
  parrafos: [
    'El Fondo de Empleados, como empresa asociativa y de derecho privado del orden legal, está constituido con el objeto de fomentar el ahorro y prestar los servicios de crédito en distintas formas a los asociados, y proporcionar otros servicios en forma permanente.',
    'Además, busca dar oportuno apoyo de previsión, solidaridad y bienestar social, fortaleciendo los lazos de compañerismo y ayuda mutua entre sus asociados.',
  ],
  alt: 'Notifondo de Fondefos con las actividades y novedades del fondo.',
}

const BANDA_CIERRE = {
  titulo: '¿Querés hacer parte del fondo?',
  texto: 'La afiliación no tiene costo y el trámite se hace con tres documentos.',
  accion: { etiqueta: 'Ver cómo afiliarme', to: '/como-ser-asociado' },
}

export default function NosotrosPage() {
  return (
    <>
      <EncabezadoPagina
        rutas={[
          { texto: 'Inicio', slug: '/' },
          { texto: 'Nosotros' },
        ]}
        titulo="Nosotros"
        entrada={ENCABEZADO.entrada}
      >
        <div className="cifras">
          {ENCABEZADO.cifras.map((cifra) => (
            <Cifra valor={cifra.valor} etiqueta={cifra.etiqueta} acento={cifra.acento} key={cifra.etiqueta} />
          ))}
        </div>
      </EncabezadoPagina>

      <Seccion data-od-id="seccion-vision-mision">
        <Split>
          <Tarjeta relleno="amplio" tono="tinta">
            <Rotulo tono="claro">{VISION.rotulo}</Rotulo>
            <h2>{VISION.titulo}</h2>
            <p>{VISION.texto}</p>
          </Tarjeta>
          <div>
            <Rotulo>{MISION.rotulo}</Rotulo>
            <TituloDual>{MISION.titulo}</TituloDual>
            <p>{MISION.texto}</p>
          </div>
        </Split>
      </Seccion>

      <Seccion tono="bright" data-od-id="seccion-principios">
        <div className="shell">
          <div className="max-w-[56ch] mb-8">
            <Rotulo>Principios</Rotulo>
            <TituloDual>
              Cinco principios que <strong>ordenan cada decisión</strong>
            </TituloDual>
          </div>
          <div className="rejilla rejilla--3">
            {PRINCIPIOS.map((principio) => (
              <Tarjeta data-od-id={principio.odId} key={principio.odId}>
                <Etiqueta>{principio.numero}</Etiqueta>
                <h3 className="mt-[14px] mb-0">{principio.titulo}</h3>
              </Tarjeta>
            ))}
          </div>
        </div>
      </Seccion>

      <Seccion data-od-id="seccion-objetivos">
        <Split invertido>
          <div className="split__media">
            <MarcoOffset>
              <img src={notifondoPortada} width="819" height="1024" loading="lazy" alt={OBJETIVOS.alt} />
            </MarcoOffset>
          </div>
          <div>
            <Rotulo>{OBJETIVOS.rotulo}</Rotulo>
            <TituloDual>{OBJETIVOS.titulo}</TituloDual>
            {OBJETIVOS.parrafos.map((parrafo) => (
              <p key={parrafo.slice(0, 24)}>{parrafo}</p>
            ))}
          </div>
        </Split>
      </Seccion>

      <Banda
        primario
        data-od-id="banda-cierre"
        titulo={BANDA_CIERRE.titulo}
        texto={BANDA_CIERRE.texto}
        accion={BANDA_CIERRE.accion}
      />
    </>
  )
}
