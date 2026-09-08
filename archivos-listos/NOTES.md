# Fondefos — reconstrucción con gramática visual de Comfacundi

## Qué se pidió y qué se hizo

| | |
|---|---|
| Contenido | `https://fondefos.com.co/` — 23 rutas rastreadas, contenido transcrito literal |
| Gramática visual | `https://comfacundi.com.co/` — bordes, bandas, asimetría, ritmo de secciones |
| Tokens de marca | `fondefos-sistema-de-diseno.pdf` (Manual de Marca v2, 2026) — **manda sobre todo lo visual** |
| Modo | Reconstrucción visual (no clon fiel de píxeles). Decisión del usuario: `pages=crawl_all`, `brand_source=pdf_wins`, `assets=harvest_real` |
| Complejidad del original | **L2** — WordPress + Elementor, sin framework de front, 0 canvas, 0 WebGL, 0 errores de consola |
| Entregable | 18 páginas HTML estáticas + `assets/` autocontenido |

Comfacundi aportó **cómo se ve**, no **qué dice** ni **de qué color es**. Su tipografía es Poppins y su
azul es `#004976`: ninguno de los dos se adoptó, porque el manual de Fondefos manda.

## Reconocimiento (evidencia en `RECON/`)

| Archivo | Qué contiene |
|---|---|
| `original-recon.json` / `original-summary.md` | Paleta computada, fuentes cargadas, recursos y capturas de fondefos.com.co |
| `reference-recon.json` / `reference-summary.md` | Lo mismo para comfacundi.com.co (fuente de la gramática) |
| `clone-recon.json`, `clone-*-recon.json` | Reconocimiento del sitio construido |
| `routes/original-route-map.json` | Las 25 rutas rastreadas del original (23 páginas + 2 PDF) |
| `routes-clone/clone-route-map.json` | Las 21 rutas del clon (18 páginas + 2 PDF + raíz) |
| `content/pages.json` | Texto estructurado de cada página del original |
| `content/convenios.json` | Los 28 convenios con asesor, teléfono, correo, dirección y logotipo |
| `asset-manifest.json`, `extra-asset-manifest.json` | `originalUrl → localPath` de cada activo descargado |
| `interactions-clone/clone-interactions.json` | Sonda de interacción: 22 acciones, **0 errores de consola** |
| `visual-diff-1440.json`, `screenshots/` | Comparativa de píxeles y capturas 1440 / 768 / 390 |
| `design-dna.json` | Identidad visual codificada: qué viene del manual y qué de Comfacundi |
| `harvest-original/` | CSS y fuentes del original que el sitio construido **no usa** (ver «Limpieza») |

Los scripts de extracción propios están en `RECON/extract-content.mjs` y `RECON/fetch-extra-assets.mjs`.

## Mapa de páginas

18 archivos. Las 23 rutas del original se cubren así:

| Archivo | Origen |
|---|---|
| `index.html` | `/` |
| `nosotros.html` | `/nosotros` |
| `como-ser-asociado.html` | `/como-ser-asociado` |
| `ahorro.html` | `/ahorro` |
| `crediaportes-10.html` | `/crediaportes-10` |
| `credito-de-confianza.html` | `/credito-de-confianza` |
| `credito-de-consumo-por-bonos.html` | `/credito-de-consumo-por-bonos` |
| `credito-de-libre-inversion.html` | `/credito-de-libre-inversion` |
| `credito-de-impuestos.html` | `/credito-de-impuestos-2` |
| `credito-de-recreacion-y-turismo.html` | `/credito-de-recreacion-y-turismo` |
| `credito-educativo.html` | `/credito-educativo` |
| `creditos-de-tesoreria.html` | `/creditos-de-tesoreria` |
| `tarjeta-express.html` | `/tarjeta-express` |
| `convenios.html` | `/convenios` **+ las 28 páginas de detalle** |
| `beneficios.html` | `/beneficios` |
| `estado-de-cuenta.html` | `/estado-de-cuenta` |
| `preguntas-frecuentes.html` | `/preguntas-frecuentes` |
| `contactenos.html` | `/contactenos` |

**Decisión sobre los convenios.** El original publica 28 páginas de detalle con cuatro líneas cada una
(asesor, teléfono, correo, dirección). Generarlas como 28 archivos habría producido 28 páginas casi
vacías. En su lugar, `convenios.html` monta una rejilla filtrable por 14 categorías y un cajón lateral
con la ficha completa. **Cada convenio conserva su URL propia** mediante hash: `convenios.html#santur`
abre el cajón de Santur directamente. Cobertura de contenido: 28 de 28, cero pérdida.

## Sistema de diseño

Los tokens salen del PDF, textualmente:

| Token | Valor | Rol según el manual |
|---|---|---|
| `--primario` | `#1B4F9C` | Cabeceras, navegación, botones primarios |
| `--interactivo` | `#00A8C6` | Enlaces, foco de campos, CTAs secundarios |
| `--exito` | `#1E8449` | Confirmaciones, estados de ahorro cumplido |
| `--enfasis` | `#E8792B` | Notificaciones urgentes, acentos puntuales |
| `--tinta` | `#152238` | Titulares y superficies oscuras |
| Display | Montserrat 500–800 | H1 800 · H2/H3 700 · H4 600 |
| Cuerpo | Open Sans 400/600/700 | Body y caption |

Montserrat y Open Sans están **autohospedadas** en `assets/fonts/brand/` (25 archivos woff2 + CSS
reescrito a rutas locales). No hay `@import` remoto ni cadena de respaldo del sistema suplantando la
tipografía de marca.

### Dos correcciones de contraste sobre el manual

El manual es la autoridad visual, pero dos de sus combinaciones no alcanzan los mínimos WCAG. Se
respetó el color y se corrigió el uso:

1. **Cian `#00A8C6` sobre blanco = 2,8:1.** Insuficiente para texto. Se conserva para bordes, anillos
   de foco e iconos, y se añade `--interactivo-ink: #0A7A90` (**5,0:1**) para texto de enlace.
2. **Naranja `#E8792B` con texto blanco = 2,9:1.** El PDF muestra un botón naranja con texto blanco
   (página 4). No se replicó. El naranja se usa como relleno decorativo y en píldoras con tinta
   oscura encima (**5,4:1**).

Ninguna otra combinación se alteró.

### Gramática tomada de Comfacundi

| Patrón | Dónde se aplicó |
|---|---|
| Bandas de sección alternadas (blanco / azul claro / tinta) | Todas las páginas |
| Split asimétrico con la imagen fuera de la rejilla y marco de color detrás | Portada, Nosotros, Ahorro, Estado de cuenta |
| Rótulo de sección + titular de doble peso | Todas las secciones |
| Franja full-bleed con título y CTA en píldora | Bandas de cierre de cada página |
| Rejilla de tarjetas con imagen arriba y etiqueta de categoría | Convenios, líneas de crédito |
| Panel de formulario en contenedor redondeado | Contáctenos |
| Pie azul profundo multicolumna | Todas las páginas |

Lo que **no** se copió: Poppins, la paleta de Comfacundi, GSAP y sus 9 reglas de `scroll-snap`,
el widget de accesibilidad y los botones flotantes de chat.

### Banner de páginas interiores

Las 17 páginas interiores llevan un banner de cabecera (`.encabezado`) con: fondo azul en degradado
(`primario-900 → primario → primario-800`), título en blanco, breadcrumb claro, el anillo de
«máscara» a la izquierda y el isotipo de Fondefos difuminado a la derecha (bordes fundidos con
`mask-image`). Referencia de composición 1920×800; colapsa a una columna bajo 880px.

**Imagen temática por título: pendiente.** El entorno no tiene clave de generación de imágenes
(fal y OpenAI sin credencial) ni herramienta de búsqueda activa, así que el motivo es el isotipo
de marca. Para fotos por página hay dos vías: (1) configurar una clave en Settings → Media
providers, o (2) dejar los archivos en `assets/images/banners/{slug}.jpg` y conectarlos en el
`.encabezado` de cada página.

## Activos

- **71 archivos descargados**, todos con navegador real o petición dirigida al origen: 18 imágenes de
  fondefos.com.co (logotipos, portada, las 8 páginas del Notifondo, marca de agua), 25 logotipos de
  convenios, 1 icono de la sección Beneficios, 2 PDF de formularios y 25 woff2 de Montserrat y Open Sans.
- Todo se referencia por ruta relativa. **Cero hotlinks, cero URLs remotas de imagen.**
- Los logotipos de convenios tienen proporciones de 0,68 a 7,44. Se muestran con `object-fit: contain`
  sobre una placa clara de altura fija: se ven completos, sin recorte ni deformación.
- Las páginas del Notifondo (819×1024) y las piezas de portada (768×960) se muestran enteras. En la
  primera versión se recortaban con `cover`; se corrigió tras revisar la captura.

### Tres convenios sin logotipo

`Decameron`, `Servicios Fúnebres Los Olivos` y `CNT` **no publican logotipo en el sitio original** —
se verificó su HTML: cero `<img>` y cero imagen de fondo. Se resuelven con un monograma de la inicial
sobre azul corporativo. No se generó ni se buscó un logotipo sustituto.

## Redacción

Se pidió mano dura editorial. Lo que se tocó y lo que no:

**Sí se corrigió:**
- Nombres de asesor en mayúscula/minúscula inconsistente → capitalización correcta
  («leidy gonzalez» → «Leidy Gonzalez»).
- Dos nombres de marca en mayúscula sostenida: `MT TECNOLOGIA` → «MT Tecnología»;
  `AXA- COLPATRIA POLIZA SALUD MEDICA PREPAGADA` → «AXA Colpatria · Salud prepagada».
- Tildes, comas decimales (`0.8%` → `0,8%`) y numerales del reglamento de crédito.
- Voseo consistente en la voz del sitio (títulos, CTAs, textos de apoyo).

**No se tocó:**
- Cifras, tasas, plazos, montos y requisitos del reglamento: van textuales.
- Direcciones y teléfonos de los convenios: se transcriben tal cual, incluidas abreviaturas
  (`CC`, `CR`, `LC`) y erratas del original (`CENTRO COEMERCIAL CACIQUE`). Normalizarlos habría
  arriesgado corromper datos de contacto reales.

## Verificación

Servidor local en `127.0.0.1:8899`, navegador real vía CDP.

| Comprobación | Resultado |
|---|---|
| Las 18 páginas responden 200 | ✅ |
| Referencias locales rotas | **0 de 802** |
| Errores de consola / de página | **0** |
| Sonda de interacción (22 acciones) | 12 cambian el DOM, ninguna falla |
| Cajón de convenios por hash (`#santur`) | ✅ abre con datos reales |
| 1440 / 768 / 390 px | ✅ sin scroll horizontal |
| `audit-clone.mjs --strict` | exit 0 · 4 avisos de paleta, todos deliberados (ver abajo) |

### Defectos encontrados y corregidos durante la verificación

1. Notifondo y carrusel de portada recortaban las imágenes con `object-fit: cover`. Corregido a
   `contain` con proporción declarada.
2. La rejilla del Notifondo generaba 5–6 columnas ilegibles. Fijada a 4 (2 en móvil).
3. A 768 px la primera columna del pie colapsaba a ~55 px y partía el texto palabra por palabra:
   `repeat(auto-fit, …)` mezclado con una pista explícita. Reemplazado por breakpoints explícitos.
4. El correo del pie desbordaba su columna. Añadido `overflow-wrap: anywhere`.
5. Enlaces sociales genéricos → los reales del original (`facebook.com/fondefos`,
   `instagram.com/fondefos.oficial`).

### Los 4 avisos de paleta del audit son intencionales

`audit-clone.mjs` compara contra los valores computados del sitio vivo y reporta:

- `body/header/footer color: rgb(51,51,51)` — el gris `#333` del original.
- `footer backgroundColor: rgb(17,17,17)` — el pie casi negro del original.

Ambos se reemplazaron a propósito por la tinta `#152238` y el azul `#10305F` del manual, porque la
decisión registrada fue `brand_source=pdf_wins`. **No son defectos**; son la diferencia esperada
entre el sitio actual y el manual de marca. Si en algún momento se quiere el clon fiel de píxeles,
hay que revertir esos tokens en `assets/site.css`.

## Estructura

```
index.html … contactenos.html   18 páginas generadas
assets/
  site.css                      sistema de diseño (tokens, componentes, breakpoints)
  site.js                       nav, carrusel, acordeón, filtro, cajón, visor, validación
  data/convenios.js             los 28 convenios (window.CONVENIOS)
  docs/                         2 PDF de formularios del fondo
  fonts/brand/                  Montserrat + Open Sans autohospedadas
  images/                       contenido, logotipos de convenios, marca
build/
  shell.mjs                     cabecera, pie, <head>, iconos SVG
  paginas.mjs                   contenido transcrito (créditos, FAQ, beneficios)
  convenios.mjs                 normalización de los 28 convenios
  generate.mjs                  emisor de las 18 páginas
  fill-dna.mjs                  completa RECON/design-dna.json
RECON/                          toda la evidencia de reconocimiento
CLONE_REPORT.md                 comparativa original vs. construido
CLONE_AUDIT.md                  auditoría de rastreo, marca y fidelidad
```

Para regenerar: `node build/generate.mjs`. Las páginas resultantes son HTML estático completo; el
directorio `build/` no hace falta para servir el sitio.

## Límites declarados

- **El formulario de contacto no envía nada.** Valida en cliente y muestra un aviso que dice
  explícitamente que es una demostración y que hay que escribir a `fondo.empleados@foscal.com.co`.
  El original tampoco expone un endpoint público.
- **No hay mapa embebido.** El original mostraba un Google Maps que en el reconocimiento cargó vacío.
  Se reemplazó por una tarjeta con la dirección real y un enlace «Cómo llegar». No se inventó un mapa
  ni se puso una imagen de mapa falsa.
- **`estado-de-cuenta.html` enlaza al portal externo** `fondefos.misaldoweb.co`. Es un servicio de
  terceros: no se replicó el login.
- **Las cifras `1.200+` y `65+`** son las que publica el original. El «0,8% desde» de la portada se
  deriva de la tasa más baja del reglamento (Crediaportes). No hay ninguna métrica inventada.
- **El buscador del original no se replicó**: es la búsqueda de WordPress y requiere backend.

## Antes de publicar

1. Confirmar con el fondo que las tasas, plazos y datos de los 28 asesores siguen vigentes: se
   transcribieron el día del reconocimiento.
2. Conectar el formulario de contacto a un endpoint real y quitar el aviso de demostración.
3. Decidir si el mapa vuelve (requiere clave de Google Maps o un proveedor alternativo).
4. Los logotipos de los 25 convenios son marcas de terceros. Están en el sitio original, pero conviene
   confirmar la autorización de uso antes de un despliegue público.
