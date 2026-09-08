// MarcoOffset — marco desplazado (clon .marco-offset): el ::before sale 26px
// en diagonal por detrás de la caja (paridad.css grupo 11); la caja recorta
// el contenido con radius-lg y sombra alta. `caja` agrega un modificador a
// .marco-offset__caja; `cajaProps` propaga atributos a la caja (data-od-id).
// Su único consumidor hoy es la sección de objetivos de /nosotros: la portada
// dejó de usarlo cuando se retiró el carrusel (2026-09-08).

export default function MarcoOffset({ caja = '', cajaProps = {}, className = '', children }) {
  return (
    <div className={`marco-offset ${className}`.trim()}>
      <div className={`marco-offset__caja${caja ? ` ${caja}` : ''}`} {...cajaProps}>
        {children}
      </div>
    </div>
  )
}
