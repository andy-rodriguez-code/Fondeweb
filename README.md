# Fondefos — sitio web

Sitio institucional de **FONDEFOS**, fondo de empleados de Floridablanca, Santander.

Reemplaza al sitio anterior en WordPress, que cargaba 74 archivos por visita (27 de JavaScript y 28 de CSS) con un TTFB de 1,7 s. Esta versión sirve **un bundle de JavaScript y una hoja de estilos**.

---

## Stack

| | |
|---|---|
| Framework | React 19 |
| Compilador | Vite 8 |
| Estilos | Tailwind CSS 4 (tokens con `@theme`, sin `tailwind.config.js`) |
| Rutas | React Router 7 (`createBrowserRouter`) |
| Lint | oxlint |

## Puesta en marcha

```bash
cd frontend
npm install
npm run dev      # servidor de desarrollo
npm run build    # compila a frontend/dist
npm run preview  # sirve lo compilado
npm run lint     # oxlint
```

## Estructura

```
frontend/src/
├── assets/images/     imágenes; Vite las procesa y les pone hash
│   ├── banner/        fotografías de banner y de sección, por página
│   ├── convenios/     25 logos de aliados comerciales
│   └── fondefos.com.co/  logotipos y páginas del boletín
├── components/
│   ├── layout/        Header, Footer, Layout, UtilityBar, SkipLink
│   └── ui/            12 primitivas: Button, Tarjeta, Icono, Rotulo…
├── data/              contenido y literales, separados de la vista
├── hooks/             8 hooks de interacción
├── pages/             19 módulos de página + plantilla de crédito
├── sections/          13 composites de sección
├── styles/
│   ├── index.css      tokens de marca en @theme
│   └── paridad.css    23 grupos de CSS que Tailwind no expresa
└── router.jsx         18 rutas + 2 alias heredados + 404
```

Las imágenes van en `src/assets/images/`, no en `public/`: así Vite las procesa, les agrega hash de contenido y **falla el build si falta un archivo**. `public/` queda para lo que necesita URL fija, como los PDF de afiliación.

## Decisiones que conviene conocer

**Los tokens de marca viven en `styles/index.css`**, dentro de `@theme`. Es el único lugar del proyecto con literales hexadecimales; el resto usa `var(--color-*)`. Tailwind 4 configura desde CSS, por eso no hay `tailwind.config.js`.

**`styles/paridad.css` agrupa lo que Tailwind no puede expresar**: contadores CSS, `mask-image`, coreografías de estado por atributo, pseudo-elementos con contenido. Cada grupo lleva su justificación y la fuente de la que se portó.

**Cuidado con las capas de Tailwind.** Las utilidades viven en una capa posterior a `components`, así que ganan a cualquier regla de `paridad.css` sin importar la especificidad. Si un color o un tamaño "no aplica", suele ser esto: la solución es ponerlo en el componente, no subir especificidad en el CSS.

**El contenido está separado de la vista**, en `src/data/`. Cambiar una tasa, un teléfono o un horario es editar un dato, no un componente.

**Accesibilidad**: todos los campos con `<label>`, trampa de foco en los diálogos, cierre con Escape, `prefers-reduced-motion` respetado en el contador de cifras, y las mayúsculas de los títulos se aplican por CSS para que un lector de pantalla no deletree.

## Estado

| Fase | Alcance | Estado |
|---|---|---|
| 0 — Auditoría | Inventario de páginas, formularios y campos | Completa |
| 1 — Setup | Vite, React, Tailwind, tokens de marca | Completa |
| 2 — Componentización | Shell, secciones, páginas, router, hooks | Completa y verificada |
| 3 — Formularios | Validación de cliente en el formulario de contacto | Pendiente |
| 4 — Backend PHP | Endpoint de contacto y checklist de seguridad | Pendiente |
| 5 — Integración | Conexión frontend ↔ backend | Pendiente |
| 6 — Revisión final | Seguridad, UI/UX y accesibilidad | Pendiente |

**Verificación de la Fase 2**: 21 rutas sin errores de consola, 19 comprobaciones de interacción sobre los 8 hooks y paridad visual en cuatro páginas. Se corre con harnesses temporales sobre CDP; el proyecto todavía no tiene test runner.

## Lo que falta

**El formulario de contacto es inerte a propósito.** Tiene el markup completo, las etiquetas y los estados de error, pero no envía nada: lo cablea la Fase 3.

**Datos que faltan del cliente** y bloquean el backend:

- Correos de destino de los formularios
- Cuenta de Gmail dedicada, con verificación en dos pasos y contraseña de aplicación
- Claves de reCAPTCHA v3 para el dominio real
- Versión de PHP del hosting y si permite salida SMTP
- Si el plan de cPanel incluye acceso SSH o Composer

**Diferencias abiertas con el sitio anterior**, a la espera de confirmación:

- Las tasas de *crédito de recreación y turismo* (1,5 %) e *impuestos* (1,2 %) están cruzadas respecto de lo publicado en WordPress
- El horario de atención aparece como 8:00 a. m. en Contáctenos y 8:30 a. m. en el pie

## Notas de operación

`archivos-listos/` guarda el clon estático del sitio anterior, el material de reconocimiento y los scripts que lo generaron. Está fuera del control de versiones: es material de consulta, no parte del producto. Su README explica qué contiene cada carpeta.
