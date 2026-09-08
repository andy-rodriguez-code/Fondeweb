import { Link } from 'react-router-dom'
import Rotulo from '../components/ui/Rotulo.jsx'
import TituloDual from '../components/ui/TituloDual.jsx'
import Tarjeta from '../components/ui/Tarjeta.jsx'
import Etiqueta from '../components/ui/Etiqueta.jsx'
import { iconoDe } from '../data/iconos-lineas.js'

// LineasGrid — composite "líneas de crédito" (clon: index #lineas-de-credito
// con las 9 tarjetas y cada bloque "Otras líneas" con 3): encabezado (rótulo
// + titulo-dual + texto opcional, §4.3 max-width/margen) + rejilla--3 de
// tarjetas-enlace. Consume registros de creditos.js (P2): la etiqueta del pie
// es record.resumen[0].valor.
// La tarjeta muestra el icono de la línea a la izquierda del título, sin
// descripción, igual que producción (2026-09-08). Antes llevaba record.entrada
// como párrafo; se retiró por decisión del dueño del proyecto. El icono es
// decorativo (alt=""): el título que va al lado ya nombra la línea.
// La etiqueta de la tasa va en minúsculas (className="normal-case") porque así
// la escribe producción; la primitiva Etiqueta la pone en mayúsculas por
// defecto y el resto del sitio la sigue usando así.
// Tarjeta es polimórfica (as={Link}); su rama hover está condicionada a
// `href`, que Link no acepta, así que las mismas utilidades hover se pasan
// por className. discover="none" por paridad de markup (nota P4).
// `prefijoId` elige el prefijo de data-od-id del clon: 'linea' (index) u
// 'otra' (páginas de crédito).

const ANCHOS = {
  '52ch': 'max-w-[52ch]',
  '60ch': 'max-w-[60ch]',
}

const MARGENES = {
  '28px': 'mb-7',
  '34px': 'mb-[34px]',
}

const TARJETA_ENLACE =
  'no-underline text-inherit hover:border-primary-300 hover:shadow-low hover:-translate-y-0.5 hover:text-inherit'

export default function LineasGrid({
  lineas,
  encabezado,
  maxAncho = '60ch',
  margen = '34px',
  prefijoId = 'linea',
  ...rest
}) {
  const { rotulo, titulo, texto } = encabezado
  return (
    <div className="shell">
      <div
        className={
          `${ANCHOS[maxAncho] ?? ANCHOS['60ch']} ${MARGENES[margen] ?? MARGENES['34px']}` +
          ' max-md:mx-auto max-md:text-center'
        }
      >
        <Rotulo>{rotulo}</Rotulo>
        <TituloDual>{titulo}</TituloDual>
        {texto ? <p>{texto}</p> : null}
      </div>
      <div className="rejilla rejilla--3" {...rest}>
        {lineas.map((linea) => (
          <Tarjeta
            as={Link}
            to={`/${linea.slug}`}
            discover="none"
            className={TARJETA_ENLACE}
            key={linea.slug}
            data-od-id={`${prefijoId}-${linea.slug}`}
            pie={<Etiqueta className="normal-case">{linea.resumen[0].valor}</Etiqueta>}
          >
            <div className="flex items-center gap-4">
              {iconoDe(linea.slug) ? (
                <img
                  className="flex-none w-[75px] h-[75px]"
                  src={iconoDe(linea.slug)}
                  width="75"
                  height="75"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
              {/* 17px / 1.2 e icono de 75px: medidas de producción. El h3 del
                  grupo 1 usa una escala fluida que acá llegaba a 23,2px. */}
              <h3 className="m-0 text-[1.0625rem] leading-[1.2]">{linea.titulo}</h3>
            </div>
          </Tarjeta>
        ))}
      </div>
    </div>
  )
}
