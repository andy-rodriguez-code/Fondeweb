// Split — clon .shell.split, rejilla asimétrica reutilizable:
//   base      columnas 1fr / 1.15fr (texto a la izquierda)
//   invertido columnas 1.15fr / 1fr con .split__media al final (order 2)
// En ≤880px ambos colapsan a una columna y el media vuelve al orden natural.
// El hijo que lleva la clase .split__media recibe el orden vía arbitrary
// variants (misma técnica de descendientes que Tarjeta/TituloDual en P3).
// Contrato de diseño: <Seccion><Split invertido? media?>…</Split></Seccion>.

export default function Split({ invertido = false, className = '', children }) {
  const clases =
    `shell split grid items-center gap-[clamp(32px,5vw,72px)] max-[880px]:grid-cols-1 ` +
    `[&_.split__media_img]:w-full [&_.split__media_img]:rounded-md ` +
    (invertido
      ? `split--invertido grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] [&_.split__media]:order-2 max-[880px]:[&_.split__media]:order-none `
      : `grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] `) +
    className
  return <div className={clases.trim()}>{children}</div>
}
