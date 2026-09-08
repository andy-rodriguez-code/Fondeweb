import { Link } from 'react-router-dom'
import Rotulo from '../components/ui/Rotulo.jsx'
import TituloDual from '../components/ui/TituloDual.jsx'
import Tarjeta from '../components/ui/Tarjeta.jsx'
import Etiqueta from '../components/ui/Etiqueta.jsx'

// LineasGrid — composite "líneas de crédito" (clon: index #lineas-de-credito
// con las 9 tarjetas y cada bloque "Otras líneas" con 3): encabezado (rótulo
// + titulo-dual + texto opcional, §4.3 max-width/margen) + rejilla--3 de
// tarjetas-enlace. Consume registros de creditos.js (P2): el texto de la
// tarjeta es record.entrada y la etiqueta del pie es record.resumen[0].valor
// (verificado contra index.html y todos los bloques "otras lineas").
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
      <div className={`${ANCHOS[maxAncho] ?? ANCHOS['60ch']} ${MARGENES[margen] ?? MARGENES['34px']}`}>
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
            pie={<Etiqueta>{linea.resumen[0].valor}</Etiqueta>}
          >
            <h3>{linea.titulo}</h3>
            <p>{linea.entrada}</p>
          </Tarjeta>
        ))}
      </div>
    </div>
  )
}
