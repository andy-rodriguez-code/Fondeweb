import Rotulo from '../components/ui/Rotulo.jsx'
import TituloDual from '../components/ui/TituloDual.jsx'
import useVisto from '../hooks/useVisto.js'

// MuralFotos — mural de fotos del fondo, debajo de la tira del Notifondo.
// Ocupa todo el ancho de la pantalla.
//
// Escritorio: tres hileras de cinco fotos visibles que se deslizan sin fin
// (la primera y la tercera hacia la derecha, la del medio hacia la
// izquierda). Teléfono: una sola hilera con todas las fotos hacia la
// izquierda. Al entrar en pantalla (useVisto) las fotos "caen" desde el
// frente sobre el mural, escalonadas.
//
// El bucle infinito duplica cada hilera: la copia es solo decorativa
// (aria-hidden, fuera del orden de tabulación) y la pista se traslada
// exactamente su mitad. Un click en cualquier foto abre el visor
// (useVisor) con la secuencia del grupo "mural": solo estas fotos, en orden,
// con flechas, teclado y deslizar. CSS: paridad.css grupo 16b.
//
// Fotos: src/assets/images/mural/mural-NN.webp (1000×1000, para el visor)
// y mural-NN-mini.webp (560×560, para el mural). Para agregar una foto basta
// con dejar el par de archivos en esa carpeta.

const GRANDES = import.meta.glob('../assets/images/mural/mural-[0-9][0-9].webp', { eager: true, import: 'default' })
const MINIS = import.meta.glob('../assets/images/mural/mural-*-mini.webp', { eager: true, import: 'default' })

const numeroDe = (ruta) => Number(ruta.match(/mural-(\d+)/)[1])

const FOTOS = Object.entries(GRANDES)
  .map(([ruta, grande]) => {
    const numero = numeroDe(ruta)
    const mini = Object.entries(MINIS).find(([r]) => numeroDe(r) === numero)?.[1] ?? grande
    return { numero, grande, mini }
  })
  .sort((a, b) => a.numero - b.numero)
  .map((foto, i, todas) => ({ ...foto, alt: `Foto ${i + 1} de ${todas.length} del mural de Fondefos` }))

// Reparte en tres hileras seguidas (1-17, 18-34, 35-50) para que el orden
// del visor coincida con el que se ve.
const porHilera = Math.ceil(FOTOS.length / 3)
const HILERAS = [0, 1, 2].map((h) => FOTOS.slice(h * porHilera, (h + 1) * porHilera))

// Inclinación de cada foto al caer: determinista (sin Math.random) para que
// el prerenderizado y el navegador coincidan.
const giroDe = (i) => `${((i * 37) % 13) - 6}deg`

function Foto({ foto, copia, orden, i }) {
  return (
    <button
      type="button"
      className="mural__foto"
      data-visor-src={foto.grande}
      data-visor-alt={foto.alt}
      data-visor-grupo="mural"
      aria-hidden={copia ? 'true' : undefined}
      tabIndex={copia ? -1 : undefined}
      aria-label={copia ? undefined : `Ampliar: ${foto.alt}`}
      style={{ '--orden': orden, '--giro': giroDe(i) }}
    >
      <img src={foto.mini} width="560" height="560" loading="lazy" decoding="async" alt="" />
      <span className="mural__lupa" aria-hidden="true">
        <span />
      </span>
    </button>
  )
}

function Hilera({ fotos, sentido, base = 0, className = '' }) {
  return (
    <div className={`mural__hilera mural__hilera--${sentido} ${className}`.trim()}>
      <div className="mural__pista" style={{ '--cantidad': fotos.length }}>
        {[false, true].map((copia) =>
          fotos.map((foto, i) => (
            <Foto
              foto={foto}
              copia={copia}
              // Escalonado de la caída: las primeras de cada hilera, que son
              // las que se ven, caen una tras otra; las demás, juntas al final.
              orden={Math.min(i, 6) + base}
              i={i + base}
              key={`${copia ? 'b' : 'a'}-${foto.numero}`}
            />
          )),
        )}
      </div>
    </div>
  )
}

export default function MuralFotos() {
  const { ref, visto } = useVisto({ umbral: 0.15 })
  if (FOTOS.length === 0) return null
  return (
    <div className="mural-seccion" data-od-id="mural-fotos">
      <div className="shell mural__encabezado">
        <Rotulo>Mural de fotos</Rotulo>
        <TituloDual>
          Momentos que <strong>nos unen</strong>
        </TituloDual>
        <p>Así vivimos el fondo. Toca cualquier foto para verla en grande y recorrer el mural.</p>
      </div>
      <div className="mural" data-visto={visto ? 'si' : 'no'} ref={ref}>
        <div className="mural__escritorio">
          {HILERAS.map((fotos, h) => (
            <Hilera fotos={fotos} sentido={h === 1 ? 'izquierda' : 'derecha'} base={h * 2} key={h} />
          ))}
        </div>
        <Hilera fotos={FOTOS} sentido="izquierda" className="mural__movil" />
      </div>
    </div>
  )
}
