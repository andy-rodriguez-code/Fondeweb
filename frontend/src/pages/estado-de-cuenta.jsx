import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import Split from '../sections/Split.jsx'
import Rotulo from '../components/ui/Rotulo.jsx'
import TituloDual from '../components/ui/TituloDual.jsx'
import Tarjeta from '../components/ui/Tarjeta.jsx'
import Button from '../components/ui/Button.jsx'
import Icono from '../components/ui/Icono.jsx'
import ListaRequisitos from '../components/ui/ListaRequisitos.jsx'

// estado-de-cuenta — página del extracto (clon estado-de-cuenta.html).
// Split "Primer ingreso" (lista numerada con enlace al portal) + tarjeta
// tinta del portal con dato-contacto oscuro (composición manual: la
// primitiva DatoContacto no acepta el chip oscuro del clon y es un archivo
// P3 congelado). Los literales exclusivos de la página no tienen módulo P2
// propio (mismo criterio que beneficios/nosotros). data-od-id del clon:
// seccion-extracto (cta-extracto).

const ENCABEZADO = {
  entrada: 'Accede fácilmente a la información de tus productos y movimientos. Consulta tu estado de cuenta en línea y mantén siempre el control de tus finanzas desde cualquier lugar.',
}

// El portal del asociado, en un solo lugar: la misma dirección la usan el paso
// 1 de las instrucciones y el botón del extracto, y dos copias de una URL se
// desincronizan en la primera mudanza.
const PORTAL_URL = 'https://fondefos.sflfintech.com/administrador/componentes/index.php'

const PASOS = [
  <>
    Ingresa a la página web:{' '}
    {/* Se muestra solo el dominio y no la ruta completa: el texto va en medio
        de una frase y la dirección entera la parte en dos en teléfono. El
        enlace sí lleva a la URL completa. */}
    <a href={PORTAL_URL} target="_blank" rel="noopener">
      fondefos.sflfintech.com
    </a>
  </>,
  'Digita tu usuario: número de cédula.',
  'Digita la contraseña: los últimos 4 números de la cédula.',
  'Cambia la contraseña y haz clic en la opción «Aplicar».',
  'Listo, ya puedes acceder a la información de tu cuenta.',
]

const PORTAL = {
  titulo: 'Portal del asociado',
  texto: 'Saldos, aportes y estado de tus créditos, actualizados por el fondo.',
  accion: { etiqueta: 'Ir a mi extracto', href: PORTAL_URL },
  olvido: {
    titulo: '¿Olvidaste tu contraseña?',
    antes: 'Escribe a ',
    enlace: { etiqueta: 'contactenos@fondefos.com.co', href: 'mailto:contactenos@fondefos.com.co' },
  },
}

export default function EstadoDeCuentaPage() {
  return (
    <>
      <EncabezadoPagina
        rutas={[
          { texto: 'Inicio', slug: '/' },
          { texto: 'Estado de cuenta' },
        ]}
        titulo="Estado de cuenta"
        entrada={ENCABEZADO.entrada}
        banner="estado-de-cuenta"
      />

      <Seccion data-od-id="seccion-extracto">
        <Split>
          <div>
            {/* Solo el encabezado se centra en teléfono: la lista numerada de
                pasos conserva su alineación. */}
            <div className="max-md:text-center">
              <Rotulo>Primer ingreso</Rotulo>
              <TituloDual>
                Consulta tu extracto <strong>¡aquí!</strong>
              </TituloDual>
            </div>
            <ListaRequisitos items={PASOS} className="mt-6" />
          </div>
          <Tarjeta relleno="amplio" tono="tinta">
            <span className="acceso__icono w-[42px] h-[42px] grid place-items-center rounded-sm bg-surface-low text-primary">
              <Icono nombre="usuario" size={18} />
            </span>
            <h3 className="text-white mt-[18px]">{PORTAL.titulo}</h3>
            <p>{PORTAL.texto}</p>
            <Button
              href={PORTAL.accion.href}
              variant="claro"
              className="mt-[22px]"
              target="_blank"
              rel="noopener"
              data-od-id="cta-extracto"
            >
              {PORTAL.accion.etiqueta}
            </Button>
            <div className="dato-contacto flex gap-4 py-5 mt-7 border-t border-white/15">
              <span className="dato-contacto__icono flex-none w-[42px] h-[42px] grid place-items-center rounded-sm bg-white/10 text-interactive-bright">
                <Icono nombre="correo" size={18} />
              </span>
              <div>
                <h4 className="text-white mb-1">{PORTAL.olvido.titulo}</h4>
                <p className="m-0 text-[0.97rem]">
                  {PORTAL.olvido.antes}
                  <a href={PORTAL.olvido.enlace.href} className="text-interactive-bright">
                    {PORTAL.olvido.enlace.etiqueta}
                  </a>
                </p>
              </div>
            </div>
          </Tarjeta>
        </Split>
      </Seccion>
    </>
  )
}
