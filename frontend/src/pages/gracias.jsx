import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Icono from '../components/ui/Icono.jsx'
import logotipo from '../assets/images/banner/Logo-Fondefos-sin-fondo.png'

// Pantalla de cierre de los formularios. Va fuera del Layout a propósito: sin
// menú ni pie, para que quede claro que el envío terminó y no haya nada más que
// hacer acá.
//
// El radicado y el aviso llegan por el `state` de la navegación y no por la
// URL. Un radicado en la barra de direcciones se comparte, se indexa y se
// puede escribir a mano: es el identificador de la solicitud de una persona.

const SEGUNDOS = 8

export default function GraciasPage() {
  const navegar = useNavigate()
  const { state } = useLocation()
  const [restantes, setRestantes] = useState(SEGUNDOS)

  const radicado = state?.radicado ?? ''
  const aviso = state?.aviso ?? ''
  const avisoFinal = state?.avisoFinal ?? ''

  useEffect(() => {
    // Un solo intervalo para la cuenta y para el salto: dos temporizadores
    // separados se desincronizan y el número visible no coincidiría con el
    // momento real del cambio de página.
    const reloj = setInterval(() => {
      setRestantes((quedan) => {
        if (quedan <= 1) {
          clearInterval(reloj)
          navegar('/', { replace: true })
          return 0
        }
        return quedan - 1
      })
    }, 1000)

    return () => clearInterval(reloj)
  }, [navegar])

  // Fracción que ya transcurrió, para la barra de progreso. Se calcula en el
  // render y no en un estado aparte: un solo origen de verdad, el contador.
  const avance = ((SEGUNDOS - restantes) / SEGUNDOS) * 100

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-5 py-14">
      <div className="w-full max-w-[620px] text-center">
        <img
          src={logotipo}
          width="295"
          height="61"
          alt="FONDEFOS"
          className="mx-auto h-auto w-[270px] max-w-[80%] md:w-[330px]"
        />

        {/* El visto sobre un círculo claro: el mensaje se entiende antes de
            leerlo. Va después del logotipo para no competir con la marca. */}
        <div
          className="mx-auto mt-9 flex h-[62px] w-[62px] items-center justify-center rounded-full md:h-[72px] md:w-[72px]"
          style={{ background: 'var(--color-surface-low)', color: 'var(--color-primary)' }}
          aria-hidden="true"
        >
          <Icono nombre="check" size={30} />
        </div>

        {/* role="status" para que un lector de pantalla anuncie el resultado:
            sin esto, quien no ve la pantalla no se entera de que el envío
            salió bien. */}
        <div role="status">
          <h1
            className="mt-6 text-[26px] md:text-[34px] lg:text-[44px] font-bold leading-tight"
            style={{ color: 'var(--color-primary)' }}
          >
            Gracias
          </h1>

          {/* Filete corto en el naranja de la marca: separa el título del
              cuerpo sin meter una línea de lado a lado. */}
          <div
            className="mx-auto mt-4 h-[4px] w-[64px] rounded-full"
            style={{ background: 'var(--color-accent)' }}
          />

          <p
            className="mt-6 text-[18px] md:text-[21px] lg:text-[23px] leading-snug"
            style={{ color: 'var(--color-ink)' }}
          >
            Hemos recibido tu solicitud.
          </p>

          {aviso ? (
            <p
              className="mx-auto mt-4 max-w-[500px] text-[15px] md:text-[17px] leading-relaxed"
              style={{ color: 'var(--color-text)' }}
            >
              {aviso}
              {radicado ? (
                <strong className="font-bold" style={{ color: 'var(--color-primary)' }}>
                  {radicado}
                </strong>
              ) : null}
              {avisoFinal}
            </p>
          ) : null}
        </div>

        {/* La barra avanza con el contador: la página se va a ir sola y eso
            tiene que verse venir, no pasar de sorpresa. */}
        <div
          className="mx-auto mt-10 h-[4px] w-[200px] overflow-hidden rounded-full"
          style={{ background: 'var(--color-surface-low)' }}
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full transition-[width] duration-1000 ease-linear"
            style={{ width: `${avance}%`, background: 'var(--color-primary)' }}
          />
        </div>

        <p className="mt-4 text-[13px] md:text-[14px]" style={{ color: 'var(--color-muted)' }}>
          Te llevamos al inicio en {restantes} {restantes === 1 ? 'segundo' : 'segundos'}.
        </p>

        {/* La salida manual no sobra: ocho segundos son pocos para anotar un
            radicado, y quien quiera quedarse leyendo no tiene por qué esperar
            a que la página decida por él. */}
        <Link
          to="/"
          className="mt-5 inline-block rounded-full px-6 py-3 text-[14px] md:text-[15px] font-semibold text-white"
          style={{ background: 'var(--color-primary)' }}
        >
          Ir al inicio ahora
        </Link>
      </div>
    </main>
  )
}
