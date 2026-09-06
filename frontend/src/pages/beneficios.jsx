import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import Banda from '../sections/Banda.jsx'
import Tarjeta from '../components/ui/Tarjeta.jsx'
import Etiqueta from '../components/ui/Etiqueta.jsx'
import iconoBeneficios from '../assets/images/content/icono-beneficios.jpg'

// beneficios — página de beneficios (clon beneficios.html). Banner interior
// con imagen de regalo a la derecha + rejilla--2 de 6 tarjetas numeradas +
// banda de cierre primaria. Los literales de las 6 tarjetas no tienen módulo
// P2 propio (la especificación exige módulos solo para líneas/faq/ahorro/
// convenios/notifondo/navegación), así que viven aquí como constantes
// verbatim del clon. data-od-id del clon: seccion-beneficios (beneficio-*),
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
  entrada: 'Pertenecer a un fondo de empleados como FONDEFOS te puede brindar beneficios como:',
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
      >
        <img
          src={iconoBeneficios}
          width="1024"
          height="1024"
          className="w-[min(180px,42vw)] ml-auto rounded-md"
          loading="lazy"
          alt="Icono de regalo usado por Fondefos para identificar la sección de beneficios."
        />
      </EncabezadoPagina>

      <Seccion data-od-id="seccion-beneficios">
        <div className="shell">
          <div className="rejilla rejilla--2">
            {BENEFICIOS.map((beneficio) => (
              <Tarjeta as="article" data-od-id={beneficio.odId} key={beneficio.odId}>
                <Etiqueta>{beneficio.numero}</Etiqueta>
                <h3 className="mt-[14px]">{beneficio.titulo}</h3>
                <p>{beneficio.texto}</p>
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
