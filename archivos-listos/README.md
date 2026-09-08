# archivos-listos

Material que ya cumplió su función y salió de la raíz del proyecto el **2026-09-08**, con la Fase 2 cerrada (`HEAD` en `ac14414`).

Nada de acá lo consume la app. `frontend/` no importa ni un archivo de esta carpeta: se verificó con un `npm run build` en verde después de mover todo.

**No se borró nada.** Si algo hace falta, se mueve de vuelta a la raíz y queda igual que antes.

---

## Qué hay acá

| Ruta | Qué es | Por qué salió |
|---|---|---|
| `clon-html/` | Las 18 páginas HTML del clon estático | Fueron la referencia de paridad de la Fase 2, ya migrada a React. Ver la advertencia de abajo |
| `artifact-json/` | 18 `*.html.artifact.json` | Metadatos del clonador. Ya estaban en `.gitignore` |
| `RECON/` (48 MB) | Reconocimiento del sitio original: capturas a 3 anchos, mapas de rutas, manifiestos de assets, contenido extraído | Insumo de la Fase 0. El contenido que importaba ya vive en `frontend/src/data/` |
| `build/` | Los cinco scripts Node que generaron las 18 páginas del clon | No se vuelven a correr: el destino ahora es React, no HTML estático |
| `banners.png` | Contactos de los banners, 1,5 MB | Sin una sola referencia en HTML, CSS, JS ni en el frontend |
| `CLONE_AUDIT.md`, `CLONE_REPORT.md` | Auditoría e informe del clon | `ESTADO_PROYECTO.md` los reemplazó como tablero activo, y lo dice en su cabecera |
| `NOTES.md` | Bitácora de cómo se reconstruyó el sitio | Histórico. Registra las decisiones de origen: contenido de fondefos.com.co, gramática visual de Comfacundi, tokens del manual de marca |

## Lo que se quedó en la raíz, y por qué

- **`assets/`** — el `images/banner/` de ahí son las imágenes reales del cliente para el rediseño, todavía sin cablear. Además `site.css` y `site.js` siguen siendo la fuente de verdad de `styles/paridad.css`, que cita sus números de línea.
- **`fondefos-sistema-de-diseno.pdf`** — el manual de marca. Según `NOTES.md`, manda sobre todo lo visual.
- **`.od-skills/`** — de ahí salen `visual-diff.mjs` e `interaction-probe.mjs`, las herramientas de verificación de paridad.
- **`ESPECIFICACION_MIGRACION.md`**, **`ESTADO_PROYECTO.md`**, **`openspec/`**, **`frontend/`**.

---

## Advertencia: el clon movido no se abre solo

Las 18 páginas de `clon-html/` referencian sus recursos con rutas relativas (`assets/site.css`, `assets/images/...`) que apuntaban a la raíz del proyecto. Desde su ubicación actual esas rutas ya no resuelven: la página abre sin estilos ni imágenes.

Esto importa en la **Fase 6**, que compara la app contra el clon. Dos formas de recuperar la comparación:

1. **Moverlas de vuelta mientras dure la revisión** (lo más simple):
   ```bash
   mv archivos-listos/clon-html/*.html .
   # y al terminar
   mv *.html archivos-listos/clon-html/
   ```

2. **Servirlas con la raíz mapeada**, si el servidor estático permite montar `assets/` en la ruta que el HTML espera.

La matriz de trazabilidad (`openspec/changes/fase-2-componentizacion/artifacts/matriz-trazabilidad.md`) enlaza a estos archivos por su ruta vieja; sus enlaces quedaron apuntando a `archivos-listos/`.

## Nota sobre `build/`

`build/generate.mjs` escribe su salida en el directorio padre del script. Desde acá eso significa que emitiría las 18 páginas dentro de `archivos-listos/`, no en la raíz. Es el comportamiento correcto para lo que quedó archivado, pero conviene saberlo antes de ejecutarlo por costumbre.
