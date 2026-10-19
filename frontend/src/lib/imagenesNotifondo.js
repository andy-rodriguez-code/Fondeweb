// Resuelve el `src` verbatim de una publicación del Notifondo (data/notifondo.js)
// al import de Vite. Lo comparten NotifondoGrid y useVisor, que antes tenían
// cada uno su propio glob. Indexa por basename, así que da igual si la imagen
// vive en fondefos.com.co/ (las páginas del boletín impreso) o en notifondo/
// (las publicaciones nuevas). Solo .webp: en notifondo/ también se guardan
// los PDF originales y no deben entrar al build.

const IMAGENES = Object.fromEntries(
  Object.entries(
    import.meta.glob(['../assets/images/fondefos.com.co/notifondo-*', '../assets/images/notifondo/*.webp'], {
      eager: true,
      import: 'default',
    }),
  ).map(([ruta, url]) => [ruta.split('/').pop(), url]),
)

export function imagenNotifondo(src) {
  return IMAGENES[src.split('/').pop()]
}
