import BotonCta from './BotonCta.jsx'
import ListaRequisitos, { ListaProsa } from '../components/ui/ListaRequisitos.jsx'

// Credito — ficha de crédito (clon .shell.credito): resumen sticky
// (Condiciones vigentes + pares dt/dd + CTA "Solicitar este crédito" + nota)
// y bloques de contenido (título con viñeta ::before, párrafos y/o lista
// prosa) + bloque final de requisitos numerados. Consume el registro de
// creditos.js (P2) que la página selecciona por slug; el data-od-id de cada
// bloque deriva del título (minúsculas, sin tildes, espacios → guiones),
// igual que los ids del clon en las 9 páginas (verificado contra todas).
// CSS: grupo 14 (§4.4: sticky, viñeta ::before, colapso 900px); la rejilla
// .credito es el contenedor que Seccion deja al composite.

const odId = (titulo) =>
  titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ /g, '-')

export default function Credito({ datos }) {
  return (
    <div className="shell credito">
      <aside className="credito__resumen" data-od-id="resumen-credito">
        <h2>Condiciones vigentes</h2>
        <dl className="m-0">
          {datos.resumen.map((dato) => (
            <div className="credito__dato" key={dato.etiqueta}>
              <dt>{dato.etiqueta}</dt>
              <dd>{dato.valor}</dd>
            </div>
          ))}
        </dl>
        <BotonCta to="/contactenos" className="w-full mt-6" data-od-id="cta-solicitar">
          Solicitar este crédito
        </BotonCta>
        <p className="mt-[14px] text-[0.82rem] text-ink-muted">
          Los valores corresponden al reglamento de crédito vigente publicado por FONDEFOS.
        </p>
      </aside>

      <div>
        {datos.bloques.map((bloque) => (
          <div className="credito__bloque" data-od-id={`bloque-${odId(bloque.titulo)}`} key={bloque.titulo}>
            <h2>{bloque.titulo}</h2>
            {bloque.parrafos?.map((parrafo, i) => (
              <p key={i}>{parrafo}</p>
            ))}
            {bloque.lista ? <ListaProsa items={bloque.lista} /> : null}
          </div>
        ))}
        <div className="credito__bloque" data-od-id="bloque-requisitos">
          <h2>Requisitos</h2>
          <ListaRequisitos items={datos.requisitos} />
        </div>
      </div>
    </div>
  )
}
