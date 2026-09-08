// Split — clon .shell.split, rejilla asimétrica reutilizable:
//   base      columnas 1fr / 1.15fr (texto a la izquierda)
//   invertido columnas 1.15fr / 1fr con .split__media al final (order 2)
// En ≤880px ambos colapsan a una columna y el media vuelve al orden natural.
// El orden y el tamaño de .split__media viven en paridad.css (grupo 19): son
// reglas sobre un descendiente BEM y como arbitrary variants dependían de
// escapar los guiones bajos, escape que no sobrevive entre el texto que
// escanea Tailwind y la cadena que arma el template literal.
// Contrato de diseño: <Seccion><Split invertido? media?>…</Split></Seccion>.

export default function Split({ invertido = false, className = '', children }) {
  const clases =
    `shell split grid items-center gap-[clamp(32px,5vw,72px)] max-[880px]:grid-cols-1 ` +
    (invertido
      ? `split--invertido grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] `
      : `grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] `) +
    className
  return <div className={clases.trim()}>{children}</div>
}
