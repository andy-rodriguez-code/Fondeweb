import usePopup from '../../hooks/usePopup.js'
import { popupDatos } from '../../data/popupDatos.js'
import logo from '../../assets/images/popup/logo-fondefos.png'

// PopupDatos — invita a los asociados a actualizar sus datos y lleva al video
// de Instagram que explica cómo. Misma mecánica que PopupNinos (usePopup):
// abre solo a los 1,5 s, solo dentro de la vigencia de data/popupDatos.js, y
// se cierra con la ✕, Escape, clic en el velo o al ir al video (pestaña
// nueva, para no sacar a nadie del sitio).
//
// El arte es propio y en la paleta del sitio: un "reel" de vidrio con botón de
// reproducción, anillos que laten y tres campos de formulario que se van
// marcando uno a uno — la idea de "datos al día" contada sin texto.
// CSS: paridad.css grupo 28b. SALIDA_MS coincide con la salida de .popup.

const ESPERA_MS = 1500
const SALIDA_MS = 250

const ICONOS = {
  documento: (
    <>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5M10 13h6M10 17h6" />
    </>
  ),
  regalo: (
    <>
      <rect x="3.5" y="9" width="17" height="11.5" rx="2" />
      <path d="M12 9v11.5M3.5 13h17M12 9c-1.5-4-6-4-6-1.5S12 9 12 9zm0 0c1.5-4 6-4 6-1.5S12 9 12 9z" />
    </>
  ),
  campana: (
    <>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>
  ),
}

function Arte() {
  return (
    <div className="popup-datos__arte" aria-hidden="true">
      <span className="popup-datos__halo" />
      <div className="popup-datos__reel">
        <span className="popup-datos__marca">
          <svg viewBox="0 0 24 24">
            <path d="M8 5.5v13l10.5-6.5z" />
          </svg>
          Video
        </span>
        <span className="popup-datos__play">
          <span className="popup-datos__onda" />
          <span className="popup-datos__onda popup-datos__onda--2" />
          <svg viewBox="0 0 24 24">
            <path d="M8 5.5v13l10.5-6.5z" />
          </svg>
        </span>
        <ul className="popup-datos__campos">
          {[0, 1, 2].map((i) => (
            <li key={i} style={{ '--paso': i }}>
              <span className="popup-datos__linea" />
              <svg viewBox="0 0 24 24">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function PopupDatos() {
  const { estado, montado, popupRef, cerrar } = usePopup({
    esperaMs: ESPERA_MS,
    salidaMs: SALIDA_MS,
    vigencia: popupDatos.vigencia,
  })

  if (!montado) return null

  const { rotulo, titulo, texto, beneficios, video } = popupDatos

  return (
    <div
      className="popup popup--datos fixed inset-0 z-[300] flex items-center justify-center p-4 900:p-6"
      data-estado={estado}
      onClick={(e) => {
        if (e.target === e.currentTarget) cerrar()
      }}
    >
      <div
        ref={popupRef}
        className="popup__tarjeta relative max-h-[calc(100dvh-32px)] w-[380px] max-w-full overflow-y-auto rounded-[24px] bg-white outline-none 900:grid 900:max-h-[calc(100dvh-48px)] 900:w-[860px] 900:grid-cols-[340px_1fr] 900:rounded-[28px]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-datos-titulo"
        tabIndex={-1}
      >
        <button
          type="button"
          className="absolute right-3 top-3 z-[2] grid size-9 cursor-pointer place-items-center rounded-full border-0 bg-white/90 p-0 text-[22px] leading-none text-ink shadow-[0_2px_8px_rgba(21,34,56,0.18)] hover:bg-surface-low 900:right-4 900:top-4 900:bg-surface-bright"
          aria-label="Cerrar"
          onClick={cerrar}
        >
          ×
        </button>

        <Arte />

        <div className="px-[22px] pb-6 pt-5 text-center 900:flex 900:flex-col 900:justify-center 900:px-11 900:py-10 900:text-left">
          <img className="mx-auto mb-4 h-6 w-auto 900:mx-0 900:h-[30px] 900:self-start" src={logo} alt="FONDEFOS" />
          <span className="mb-2 inline-flex items-center gap-2.5 font-body text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-interactive-ink before:h-[3px] before:w-[26px] before:rounded-[2px] before:bg-accent before:content-['']">
            {rotulo}
          </span>
          <h2
            id="popup-datos-titulo"
            className="m-0 font-display text-[clamp(1.6rem,7vw,2rem)] font-extrabold leading-[1.08] tracking-[-0.02em] text-ink 900:text-[2.35rem]"
          >
            {titulo.inicio}
            <span className="text-primary">{titulo.destacado}</span>
            {titulo.fin}
          </h2>
          <p className="mb-5 mt-3 text-[0.98rem] leading-[1.55] text-text 900:mb-6">{texto}</p>

          {/* En teléfono la lista se omite para que el botón quepa sin desplazarse. */}
          <ul className="m-0 mb-7 hidden list-none gap-2.5 p-0 text-left 900:grid">
            {beneficios.map(({ icono, texto: beneficio }) => (
              <li key={beneficio} className="flex items-center gap-3 text-[0.92rem] font-medium text-ink">
                <span className="grid size-9 flex-none place-items-center rounded-[10px] bg-accent-100 text-accent">
                  <svg
                    className="size-[19px]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {ICONOS[icono]}
                  </svg>
                </span>
                {beneficio}
              </li>
            ))}
          </ul>

          <a
            className="popup-datos__cta group inline-flex w-full items-center justify-center gap-3 rounded-full bg-accent px-6 py-3.5 font-display text-[1.02rem] font-bold text-white no-underline hover:text-white 900:w-auto 900:self-start"
            href={video.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${video.etiqueta} (${video.nota.toLowerCase()}, en una pestaña nueva)`}
            onClick={cerrar}
          >
            <span className="grid size-7 place-items-center rounded-full bg-white/22">
              <svg className="ml-0.5 size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 4.5v15l12.5-7.5z" />
              </svg>
            </span>
            {video.etiqueta}
          </a>
          <span className="mt-2.5 block text-[0.78rem] text-muted">{video.nota}</span>
        </div>
      </div>
    </div>
  )
}
