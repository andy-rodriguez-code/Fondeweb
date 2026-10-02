import usePopup from '../../hooks/usePopup.js'
import { popupNinos } from '../../data/popupNinos.js'
import personajes from '../../assets/images/popup/intensamente.jpg'
import logo from '../../assets/images/popup/logo-fondefos.png'

// PopupNinos — aviso del Día de los Niños que se abre solo al entrar al sitio.
// Reproduce la pieza del cliente en sus dos composiciones: en teléfono la
// imagen va arriba y el contenido centrado; desde 900px, imagen a la izquierda
// y contenido a la derecha.
//
// Tiempos:
//   ESPERA_MS   1,5 s antes de abrir. Deja que la página termine de pintarse:
//               un popup que aparece junto con el contenido se lee como parte
//               de la carga y se cierra sin mirar.
//   SALIDA_MS   lo que dura la animación de salida. Tiene que coincidir con el
//               valor de paridad.css (grupo 28), porque es el plazo tras el
//               cual el popup sale del DOM.
// Solo sale dentro de la vigencia de data/popupNinos.js (hasta el cierre de
// inscripciones); pasada esa fecha deja de aparecer sin tocar el código.
//
// No se cierra solo: trae una cláusula que hay que leer, y un aviso que
// desaparece por tiempo se le va a quien lee despacio (WCAG 2.2.1).
//
// Se cierra con la ✕, con Escape, con un clic en el velo o al ir al formulario,
// que abre en una pestaña nueva para no sacar a nadie del sitio.

const ESPERA_MS = 1500
const SALIDA_MS = 250

// Los colores de las letras rotan en este orden, igual que en la pieza.
const COLORES_LETRA = [
  'text-fiesta-furia',
  'text-fiesta-tristeza',
  'text-fiesta-alegria',
  'text-fiesta-temor',
  'text-fiesta-desagrado',
]

// Fondo de la pastilla y color del trazo de cada dato.
const TONOS = {
  alegria: 'bg-fiesta-alegria-100 text-fiesta-alegria-800',
  furia: 'bg-fiesta-furia-100 text-fiesta-furia',
  tristeza: 'bg-fiesta-tristeza-100 text-fiesta-tristeza',
}

// Íconos propios de la pieza, con su trazo de 2.4: no son los del set del
// sitio (Icono.jsx), que es más fino.
const ICONOS = {
  lapiz: (
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="M13 7l4 4" />
    </>
  ),
  calendario: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  lugar: (
    <>
      <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
      <circle cx="12" cy="9" r="2.6" />
    </>
  ),
}

// Reparte los colores letra por letra. Los espacios no consumen color; el salto
// de renglón sí, porque en la pieza original ocupa un lugar en la rotación.
function colorearTitulo(lineas) {
  let turno = 0
  return lineas.map((linea) => {
    const letras = Array.from(linea).map((letra) =>
      letra === ' ' ? { letra } : { letra, color: COLORES_LETRA[turno++ % COLORES_LETRA.length] },
    )
    turno++
    return letras
  })
}

const TITULO = colorearTitulo(popupNinos.titulo)

export default function PopupNinos() {
  const { estado, montado, popupRef, cerrar } = usePopup({
    esperaMs: ESPERA_MS,
    salidaMs: SALIDA_MS,
    vigencia: popupNinos.vigencia,
  })

  if (!montado) return null

  const { subtitulo, imagenAlt, edad, datos, nota, inscripcion } = popupNinos

  return (
    <div
      className="popup fixed inset-0 z-[300] flex items-center justify-center p-4 font-sistema leading-[normal] text-fiesta-tinta 900:p-6"
      data-estado={estado}
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar()
      }}
    >
      <div
        ref={popupRef}
        className="popup__tarjeta relative max-h-[calc(100dvh-32px)] w-[360px] max-w-full overflow-y-auto rounded-[26px] bg-white outline-none 900:grid 900:max-h-[calc(100dvh-48px)] 900:w-[880px] 900:grid-cols-[360px_1fr] 900:rounded-[28px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-ninos-titulo"
        tabIndex={-1}
      >
        <button
          type="button"
          className="absolute right-3 top-3 z-[2] size-9 cursor-pointer rounded-full border-0 bg-white/92 p-0 [font-family:Arial,sans-serif] text-[22px] leading-9 text-fiesta-tinta 900:right-3.5 900:top-3.5 900:size-[38px] 900:bg-fiesta-lila 900:leading-[38px] 900:hover:bg-fiesta-lila-300"
          aria-label="Cerrar"
          onClick={cerrar}
        >
          ×
        </button>

        <div className="popup__arte relative h-[270px] overflow-hidden 900:h-auto 900:min-h-[520px]">
          <img
            className="absolute inset-0 size-full max-w-none object-cover object-[50%_18%] 900:object-[50%_70%]"
            src={personajes}
            alt={imagenAlt}
          />
          <div className="absolute bottom-4 left-3 flex size-[76px] -rotate-10 flex-col items-center justify-center rounded-full border-[3px] border-white bg-fiesta-desagrado font-fiesta leading-none text-white shadow-[0_5px_0_rgba(0,0,0,0.2)] 900:bottom-auto 900:left-[18px] 900:top-[18px] 900:size-24 900:border-4 900:shadow-[0_6px_0_rgba(0,0,0,0.2)]">
            <span className="text-[10px] tracking-[0.5px] 900:text-[12px] 900:tracking-[1px]">
              {edad.antes}
            </span>
            <strong className="my-0.5 text-[20px] font-normal 900:text-[26px]">{edad.rango}</strong>
            <span className="text-[10px] tracking-[0.5px] 900:text-[12px] 900:tracking-[1px]">
              {edad.despues}
            </span>
          </div>
        </div>

        <div className="px-[22px] pb-[22px] pt-5 text-center 900:flex 900:flex-col 900:px-[38px] 900:pb-[30px] 900:pt-[34px] 900:text-left">
          <img
            className="mx-auto mb-2.5 h-6 w-auto 900:mx-0 900:mb-3.5 900:h-[30px] 900:self-start"
            src={logo}
            alt="FONDEFOS"
          />

          {/* El título se anuncia entero por aria-label: letra por letra, un
              lector de pantalla lo deletrearía. */}
          <h2
            id="popup-ninos-titulo"
            className="m-0 font-fiesta text-[40px] font-normal leading-[0.95] tracking-[1px] 900:text-[52px]"
            aria-label={popupNinos.titulo.join(' ')}
          >
            {TITULO.map((letras, renglon) => (
              <span key={renglon} className="block" aria-hidden="true">
                {letras.map(({ letra, color }, posicion) =>
                  color ? (
                    <span key={posicion} className={color}>
                      {letra}
                    </span>
                  ) : (
                    letra
                  ),
                )}
              </span>
            ))}
          </h2>
          <p className="mb-3.5 mt-1.5 font-fiesta text-[15px] tracking-[0.5px] text-fiesta-rosa 900:mb-[18px] 900:mt-2 900:text-[18px]">
            {subtitulo}
          </p>

          <ul className="m-0 mb-3 grid list-none gap-[9px] p-0 text-left 900:mb-4 900:gap-2.5">
            {datos.map(({ icono, tono, titulo, detalle }) => (
              <li
                key={titulo}
                className="flex items-start gap-2.5 text-[14px] leading-[1.3] 900:gap-3 900:text-[15px] 900:leading-[1.35]"
              >
                <span
                  className={`flex size-[30px] flex-none items-center justify-center rounded-[9px] 900:size-[34px] 900:rounded-[10px] ${TONOS[tono]}`}
                >
                  <svg
                    className="size-[17px] 900:size-[19px]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {ICONOS[icono]}
                  </svg>
                </span>
                <div>
                  <strong className="block text-[14px] 900:text-[15.5px]">{titulo}</strong>
                  {detalle ? (
                    <span className="text-[12.5px] text-fiesta-texto 900:text-[14px]">{detalle}</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>

          <p className="m-0 mb-4 rounded-r-[10px] border-l-4 border-fiesta-furia bg-fiesta-furia-50 px-2.5 py-2 text-left text-[11.5px] leading-[1.4] text-fiesta-texto 900:mb-5 900:rounded-r-[12px] 900:px-3 900:py-[9px] 900:text-[12px]">
            <strong className="text-fiesta-furia">{nota.rotulo}</strong> {nota.texto}
          </p>

          <div className="900:mt-auto">
            <a
              className="block rounded-full bg-fiesta-violeta px-5 pb-3 pt-3.5 text-center font-fiesta text-[18px] tracking-[1px] text-white no-underline shadow-[0_5px_0_var(--color-fiesta-violeta-900)] hover:text-white 900:inline-block 900:px-[26px] 900:text-[19px] 900:transition-transform 900:duration-150 900:hover:-translate-y-0.5"
              href={inscripcion.href}
              target="_blank"
              rel="noopener"
              onClick={cerrar}
            >
              {inscripcion.etiqueta}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
