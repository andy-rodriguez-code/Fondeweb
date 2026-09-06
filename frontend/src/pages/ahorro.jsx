import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import Banda from '../sections/Banda.jsx'
import BotonCta from '../sections/BotonCta.jsx'
import Franja from '../components/ui/Franja.jsx'
import Tarjeta from '../components/ui/Tarjeta.jsx'
import Etiqueta from '../components/ui/Etiqueta.jsx'
import { ListaProsa } from '../components/ui/ListaRequisitos.jsx'
import { ahorro } from '../data/ahorro.js'

// ahorro — página de ahorro (clon ahorro.html). Banner interior + dos
// tarjetas (Permanente/Voluntario) + franja de retiro parcial + banda de
// cierre primaria. Todo el contenido verbatim viene de ahorro.js (P2, solo
// lectura); los CTA internos usan los slugs derivados (preguntas-frecuentes,
// credito-de-libre-inversion). data-od-id del clon: seccion-ahorro
// (ahorro-permanente, ahorro-voluntario, franja-retiro-parcial),
// banda-cierre.

export default function AhorroPage() {
  return (
    <>
      <EncabezadoPagina
        rutas={[
          { texto: 'Inicio', slug: '/' },
          { texto: 'Ahorro' },
        ]}
        titulo="Ahorro"
        entrada={ahorro.entrada}
      />

      <Seccion data-od-id="seccion-ahorro">
        <div className="shell">
          <div className="rejilla rejilla--2">
            {ahorro.opciones.map((opcion, i) => (
              <Tarjeta
                as="article"
                relleno="amplio"
                data-od-id={i === 0 ? 'ahorro-permanente' : 'ahorro-voluntario'}
                key={opcion.titulo}
              >
                <Etiqueta>{opcion.etiqueta}</Etiqueta>
                <h2 className="mt-4">{opcion.titulo}</h2>
                <p>{opcion.texto}</p>
                {opcion.lista ? <ListaProsa items={opcion.lista} /> : null}
              </Tarjeta>
            ))}
          </div>

          {/* Franja (P3, congelada) no propaga atributos extra (sin ...rest):
              el data-od-id="franja-retiro-parcial" del clon no se renderiza
              para no envolver la franja en un div extra. Desviación
              documentada (solo atributo marcador, sin comportamiento). */}
          <Franja icono="ahorro" titulo={ahorro.franja.titulo} className="mt-[clamp(32px,4vw,52px)]">
            <BotonCta to={ahorro.franja.accion.slug} variant="fantasma">
              {ahorro.franja.accion.etiqueta}
            </BotonCta>
          </Franja>
        </div>
      </Seccion>

      <Banda
        primario
        data-od-id="banda-cierre"
        titulo={ahorro.cierre.titulo}
        texto={ahorro.cierre.texto}
        accion={{ etiqueta: ahorro.cierre.accion.etiqueta, to: ahorro.cierre.accion.slug }}
      />
    </>
  )
}
