import Rotulo from '../components/ui/Rotulo.jsx'
import TituloDual from '../components/ui/TituloDual.jsx'
import { ListaProsa } from '../components/ui/ListaRequisitos.jsx'

// FilaFoto — fila de contenido con fotografía: dos columnas iguales, texto a
// un lado y foto al otro. Es el patrón que producción repite en /nosotros
// (visión, misión, objetivos) y /ahorro (permanente, voluntario), medido el
// 2026-09-08.
//
// `fotoIzquierda` invierte el orden por CSS y no en el DOM, para que el texto
// se siga leyendo antes que la imagen.
// `texto` admite una cadena o varias; `lista` agrega los ítems en prosa.
// El párrafo va justificado, verbatim de producción, y en teléfono todo se
// centra y la foto pasa arriba, como el resto del sitio.
// El radio y la sombra de la foto viven en paridad.css (grupo 22): un
// box-shadow arbitrario de Tailwind con comas dentro del valor no compila.
//
// `ilustracion` marca la imagen como dibujo y no fotografía: va sin marco ni
// sombra y con el ancho de 336px de producción, en vez de ocupar la columna.
//
// Contrato: { rotulo, titulo, texto, lista?, imagen, alt, ilustracion? }

export default function FilaFoto({ datos, fotoIzquierda = false }) {
  const parrafos = Array.isArray(datos.texto) ? datos.texto : [datos.texto]
  return (
    <div className="shell grid items-center gap-[clamp(32px,5vw,72px)] grid-cols-2 max-md:grid-cols-1">
      <div className={`max-md:text-center${fotoIzquierda ? ' order-2 max-md:order-none' : ''}`}>
        <Rotulo>{datos.rotulo}</Rotulo>
        <TituloDual tono="naranja">{datos.titulo}</TituloDual>
        {parrafos.map((parrafo) => (
          <p className="text-justify max-md:text-center" key={parrafo.slice(0, 24)}>
            {parrafo}
          </p>
        ))}
        {datos.lista ? <ListaProsa items={datos.lista} className="text-justify max-md:text-left" /> : null}
      </div>
      <div className={fotoIzquierda ? 'order-1 max-md:order-none' : ''}>
        <img
          src={datos.imagen}
          alt={datos.alt}
          loading="lazy"
          className={
            datos.ilustracion
              ? 'block w-[min(336px,100%)] h-auto mx-auto'
              : 'foto-marco'
          }
        />
      </div>
    </div>
  )
}
