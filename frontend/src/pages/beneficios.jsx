import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import Banda from '../sections/Banda.jsx'
import FilaFoto from '../sections/FilaFoto.jsx'
import Tarjeta from '../components/ui/Tarjeta.jsx'
import iconoBeneficios from '../assets/images/content/icono-beneficios.jpg'

// beneficios — página de beneficios. Banner con la fotografía del cliente +
// fila de entrada con la ilustración + rejilla de tres con las 6 tarjetas
// numeradas + banda de cierre. La estructura sigue a producción, medida el
// 2026-09-08. Los literales de las 6 tarjetas no tienen módulo P2 propio
// (la especificación exige módulos solo para líneas/faq/ahorro/convenios/
// notifondo/navegación), así que viven aquí como constantes.
// data-od-id: seccion-intro-beneficios, seccion-beneficios (beneficio-*),
// banda-cierre.

const BENEFICIOS = [
  {
    numero: '01',
    titulo: 'Fomenta el hábito del ahorro',
    texto: 'El Fondo de Empleados recibe directamente los aportes y ahorros de los asociados, convirtiéndolos en capital de trabajo. En FONDEFOS existen dos formas diferentes de ahorro y ambas brindan grandes beneficios al asociado.',
    odId: 'beneficio-fomenta-el-habito-del-ahorro',
  },
  {
    numero: '02',
    titulo: 'Crédito inmediato y con tasa baja',
    texto: 'El Fondo de Empleados otorga créditos a los integrantes con una tasa de interés muy baja y sin trámites engorrosos, protegiendo siempre el capital de todos los asociados mediante la aplicación del reglamento de crédito vigente.',
    odId: 'beneficio-credito-inmediato-y-con-tasa-baja',
  },
  {
    numero: '03',
    titulo: 'Administración de los propios asociados',
    texto: 'La administración es llevada por la Junta Directiva, conformada por asociados elegidos democráticamente en la asamblea general. Es decir, no hay personas externas.',
    odId: 'beneficio-administracion-de-los-propios-asociados',
  },
  {
    numero: '04',
    titulo: 'Protección social',
    texto: 'El Fondo de Empleados es una opción para la protección social: permite satisfacer necesidades en cuanto a servicios de salud, calamidad doméstica, seguridad social y gastos funerarios.',
    odId: 'beneficio-proteccion-social',
  },
  {
    numero: '05',
    titulo: 'Servicios para toda la familia',
    texto: 'Los integrantes y sus familias pueden gozar de servicios sociales tales como créditos para estudio, recreación y obtención de bienes y servicios, gracias a los convenios que se realizan con entidades comerciales.',
    odId: 'beneficio-servicios-para-toda-la-familia',
  },
  {
    numero: '06',
    titulo: 'Los excedentes vuelven al asociado',
    texto: 'Los excedentes que se generan de esta actividad se reinvierten en el bienestar de los integrantes y, al mismo tiempo, contribuyen al patrimonio del fondo.',
    odId: 'beneficio-los-excedentes-vuelven-al-asociado',
  },
]

const ENCABEZADO = {
  entrada: 'En FONDEFOS, ser asociado tiene beneficios: disfruta oportunidades y soluciones creadas pensando en tu bienestar.',
}

// Sección de entrada: la ilustración a la izquierda y el texto a la derecha,
// como producción (medida el 2026-09-08). Es el lugar donde vive el icono de
// beneficios; el banner de arriba ya no lo lleva.
const INTRO = {
  rotulo: 'Para ti',
  titulo: (
    <>
      Seis beneficios <strong>que te encantarán</strong>
    </>
  ),
  texto: 'Ventajas pensadas para acompañarte en cada etapa, facilitar tus proyectos y hacer que pertenecer a FONDEFOS realmente marque la diferencia.',
  imagen: iconoBeneficios,
  alt: 'Alcancía con forma de cerdito, símbolo del ahorro en Fondefos.',
  ilustracion: true,
}

const BANDA_CIERRE = {
  titulo: 'Los beneficios empiezan con el primer aporte',
  texto: 'Desde el primer mes de ahorro ya podés tramitar un crédito de tesorería.',
  accion: { etiqueta: 'Ver cómo funciona el ahorro', to: '/ahorro' },
}

export default function BeneficiosPage() {
  return (
    <>
      <EncabezadoPagina
        rutas={[
          { texto: 'Inicio', slug: '/' },
          { texto: 'Beneficios' },
        ]}
        titulo="Beneficios"
        entrada={ENCABEZADO.entrada}
        banner="beneficios"
      />

      <Seccion data-od-id="seccion-intro-beneficios">
        <FilaFoto datos={INTRO} fotoIzquierda />
      </Seccion>

      {/* Rejilla de tres columnas como producción: el número en su cuadro
          naranja a la izquierda, y a su lado el título con la descripción
          debajo. Antes era una rejilla de dos con el número arriba del todo. */}
      <Seccion tono="bright" data-od-id="seccion-beneficios">
        <div className="shell">
          <div className="rejilla rejilla--3">
            {BENEFICIOS.map((beneficio) => (
              <Tarjeta as="article" data-od-id={beneficio.odId} key={beneficio.odId}>
                <div className="flex gap-4">
                  <span className="flex-none grid place-items-center w-11 h-11 rounded-sm border border-accent font-display font-extrabold text-[1.05rem] text-accent">
                    {beneficio.numero}
                  </span>
                  <div>
                    <h3 className="m-0 text-[1.0625rem] leading-[1.25]">{beneficio.titulo}</h3>
                    <p className="mt-2 mb-0">{beneficio.texto}</p>
                  </div>
                </div>
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
