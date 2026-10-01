import Icono from '../ui/Icono.jsx'
import { whatsapp } from '../../data/navegacion.js'

// BotonWhatsapp — acceso flotante al chat del fondo. Es un enlace y no un
// botón porque lleva a otra página; abre en una pestaña nueva para que quien
// escribe no pierda el lugar donde estaba en el sitio.
//
// Tamaño y posición salen del sistema de flotantes (paridad.css grupo 25): va
// sobre el botón de accesibilidad, que vive fuera de React.
export default function BotonWhatsapp() {
  return (
    <a
      className="flotante flotante--whatsapp"
      href={whatsapp.href}
      target="_blank"
      rel="noopener"
      aria-label={whatsapp.etiqueta}
      title={whatsapp.etiqueta}
    >
      <Icono nombre="whatsapp" size={26} />
    </a>
  )
}
