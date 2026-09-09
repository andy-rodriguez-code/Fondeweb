import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import Banda from '../sections/Banda.jsx'
import Split from '../sections/Split.jsx'
import Rotulo from '../components/ui/Rotulo.jsx'
import TituloDual from '../components/ui/TituloDual.jsx'
import Tarjeta from '../components/ui/Tarjeta.jsx'
import Button from '../components/ui/Button.jsx'
import Icono from '../components/ui/Icono.jsx'

// como-ser-asociado — página de afiliación (clon como-ser-asociado.html).
// Split "Cuatro pasos" (formato descargable + lista numerada) + documentos
// (rejilla--3) + banda de cierre. Los PDF viven en public/docs/ (P1), por lo
// que el href del clon assets/docs/*.pdf deriva a /docs/*.pdf (misma URL que
// sirve Vite; ver nota P1). Literales exclusivos de la página sin módulo P2
// propio (mismo criterio que beneficios/nosotros). data-od-id del clon:
// seccion-pasos (cta-formato, paso-*), seccion-documentos (documento-*),
// banda-cierre.

const ENCABEZADO = {
  entrada: 'Sé parte del Fondo de Empleados. La afiliación no tiene ningún costo',
}

const TRAMITE = {
  rotulo: 'El trámite',
  titulo: (
    <>
      Cuatro pasos y <strong>ya estás dentro</strong>
    </>
  ),
  texto: 'En el siguiente enlace se encuentra el formulario descargable para que puedas inscribirte.',
  notaAntes: 'También podés descargar el ',
  notaEnlace: { etiqueta: 'formulario de conocimiento de personas naturales y asociados (v2)', href: '/docs/formulario-conocimiento-personas-naturales.pdf' },
}

const PASOS = [
  {
    titulo: 'Descargá el formato',
    texto: 'Bajá el formato de afiliación y el formulario de conocimiento del asociado.',
    odId: 'paso-descarga-el-formato',
  },
  {
    titulo: 'Reuní los documentos',
    texto: 'Último desprendible de nómina, fotocopia de la cédula y certificación laboral (aplica para independientes).',
    odId: 'paso-reuni-los-documentos',
  },
  {
    titulo: 'Entregalo en la sede',
    texto: 'Radicá los documentos en la oficina de Floridablanca o consultanos por teléfono.',
    odId: 'paso-entregalo-en-la-sede',
  },
  {
    titulo: 'Empezá a ahorrar',
    texto: 'Desde el primer mes de ahorro ya podés tramitar un crédito por la línea de tesorería.',
    odId: 'paso-empeza-a-ahorrar',
  },
]

const DOCUMENTOS = [
  {
    titulo: 'Desprendible de nómina',
    texto: 'El más reciente.',
    odId: 'documento-desprendible-de-nomina',
  },
  {
    titulo: 'Fotocopia de la cédula',
    texto: 'Del asociado que se afilia.',
    odId: 'documento-fotocopia-de-la-cedula',
  },
  {
    titulo: 'Certificación laboral',
    texto: 'Aplica para independientes.',
    odId: 'documento-certificacion-laboral',
  },
]

const BANDA_CIERRE = {
  titulo: '¿Dudas antes de afiliarte?',
  texto: 'Respondemos las nueve preguntas que más nos hacen.',
  accion: { etiqueta: 'Ver preguntas frecuentes', to: '/preguntas-frecuentes' },
}

export default function ComoSerAsociadoPage() {
  return (
    <>
      <EncabezadoPagina
        rutas={[
          { texto: 'Inicio', slug: '/' },
          { texto: 'Cómo ser asociado' },
        ]}
        titulo="Cómo ser asociado"
        entrada={ENCABEZADO.entrada}
        banner="como-ser-asociado"
      />

      <Seccion data-od-id="seccion-pasos">
        <Split>
          <div className="max-md:text-center">
            <Rotulo>{TRAMITE.rotulo}</Rotulo>
            <TituloDual>{TRAMITE.titulo}</TituloDual>
            <p>{TRAMITE.texto}</p>
            <div className="portada__acciones mt-[26px]">
              <Button href="/docs/formato-afiliacion-fondefos.pdf" download data-od-id="cta-formato">
                <Icono nombre="descargar" size={18} />
                Descargar formato de afiliación
              </Button>
            </div>
            <p className="mt-[18px] text-[0.9rem] text-muted">
              {TRAMITE.notaAntes}
              <a href={TRAMITE.notaEnlace.href} download>
                {TRAMITE.notaEnlace.etiqueta}
              </a>
              .
            </p>
          </div>
          <div>
            <ol className="requisitos">
              {PASOS.map((paso) => (
                <li data-od-id={paso.odId} key={paso.odId}>
                  <strong className="block font-display text-ink mb-1">{paso.titulo}</strong>
                  {paso.texto}
                </li>
              ))}
            </ol>
          </div>
        </Split>
      </Seccion>

      <Seccion tono="bright" data-od-id="seccion-documentos">
        <div className="shell">
          <div className="max-w-[56ch] mb-[30px] max-md:mx-auto max-md:text-center">
            <Rotulo>Documentos</Rotulo>
            <TituloDual>
              Lo que tenés que <strong>llevar</strong>
            </TituloDual>
          </div>
          <div className="rejilla rejilla--3">
            {DOCUMENTOS.map((documento) => (
              <Tarjeta data-od-id={documento.odId} key={documento.odId}>
                <span className="acceso__icono w-[42px] h-[42px] grid place-items-center rounded-sm bg-surface-low text-primary">
                  <Icono nombre="documento" size={22} />
                </span>
                <h3 className="mt-4">{documento.titulo}</h3>
                <p>{documento.texto}</p>
              </Tarjeta>
            ))}
          </div>
        </div>
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
