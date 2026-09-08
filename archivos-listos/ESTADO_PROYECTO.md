# Estado del proyecto FONDEFOS — checklist de avance

Tablero de control del proyecto: qué está hecho, qué falta y qué está bloqueado esperando un dato del cliente. Cubre las 6 fases de `ESPECIFICACION_MIGRACION.md`, las 18 páginas del clon una por una, los estándares de diseño (§4 y §5 de la especificación) y la checklist de seguridad de formularios (§6).

Este documento reemplaza a `CLONE_AUDIT.md` y `CLONE_REPORT.md` como tablero activo. Esos dos siguen siendo válidos, pero solo describen el clon HTML estático, que es una fase ya cerrada; el 2026-09-08 se archivaron en `archivos-listos/` junto con el clon, `RECON/` y `build/`.

**Última revisión:** 2026-09-08 · **HEAD:** `ac14414` (fase-2 P9, cerrada) · `origin/main` sigue en `1fc241e`, sin push

---

## Leyenda

| Marca | Significado |
|---|---|
| `[x]` | Hecho y verificado (commiteado, build o prueba en verde) |
| `[~]` | Hecho pero sin verificar o sin commitear — riesgo de pérdida |
| `[ ]` | Pendiente |
| `[!]` | Bloqueado: falta un dato o una decisión del cliente |

---

## Resumen por fases

| Fase | Alcance | Estado |
|---|---|---|
| Fase 0 — Auditoría | Inventario de HTML, formularios y campos | `[x]` |
| Fase 1 — Setup | Vite + React + Tailwind, tokens de marca | `[x]` |
| Fase 2 — Componentización | Header/Footer/secciones/páginas/router/hooks | `[x]` P1–P9 hechos, verificados y commiteados |
| Fase 3 — Formularios (frontend) | React Hook Form + validación de cliente | `[ ]` |
| Fase 4 — Backend PHP | Endpoints + checklist de seguridad completa | `[ ]` |
| Fase 5 — Integración | Conexión frontend↔backend, envío real de prueba | `[ ]` |
| Fase 6 — Revisión final | Seguridad + UI/UX + accesibilidad | `[ ]` |

---

## Riesgo abierto ahora mismo

- `[x]` **Commitear el trabajo de P8.** Cerrado en 5 commits apilados, `7187aaa` → `10fdd97`, sobre `main` local. `origin/main` sigue en `1fc241e` (sin push, según la convención del proyecto).
- `[x]` **Borrar el harness temporal.** `frontend/p8-interacciones.mjs` eliminado tras la corrida en verde.
- `[x]` **Actualizar `tasks.md` y `apply-progress.md`.** P8 marcado como completo, con el registro del Slice 8 y sus evidencias.
- `[x]` **P9 corrida y cerrada.** Build, lint, smoke (21/21), interacciones (19/19), paridad visual en 4 páginas, guardas y matriz de trazabilidad. D-3 decidido: se mantiene la proporción correcta de la imagen. Commiteada en `ac14414`.
- `[!]` **`openspec/` está en `.gitignore`.** La matriz de trazabilidad y `apply-progress.md` no quedan versionadas, y el spec `trazabilidad` pide un artefacto commiteado y descubrible. Se resuelve sacando la entrada del ignore o moviendo el artefacto a una ruta trackeada; es un cambio de convención del repo.

---

## Fase 2 — Componentización (detalle por sub-fase)

- `[x]` **P1 Foundation** — estructura `frontend/src`, entrada `main.jsx`, hojas `styles/index.css` y `styles/paridad.css`
- `[x]` **P2 Módulos de datos** — `data/navegacion.js`, `creditos.js`, `convenios.js`, `faq.js`, `ahorro.js`, `notifondo.js`
- `[x]` **P3 Primitivas UI** — 12 componentes en `components/ui/` (Button, Tarjeta, Icono, Rotulo, TituloDual, Etiqueta, Cifra, DatoContacto, Miga, ListaRequisitos, Acceso, Franja)
- `[x]` **P4 Shell** — `Header.jsx`, `Footer.jsx`, `Layout.jsx`, `UtilityBar.jsx`, `SkipLink.jsx`
- `[x]` **P5 Secciones** — 9 secciones en `sections/` (Seccion, Banda, Split, MarcoOffset, EncabezadoPagina, BotonCta, LineasGrid, NotifondoGrid, Credito) + Portada, Convenios, FilasAccordion
- `[x]` **P6 Páginas** — 19 módulos en `pages/` incluyendo `CreditoPage.jsx` (plantilla compartida) y `NotFound.jsx`
- `[x]` **P7 Router** — `router.jsx`, 18 slugs + 2 alias heredados + comodín `*`
- `[x]` **P8 Interacciones** — 8 hooks cableados y verificados con el harness CDP (**34/34 OK, 0 errores de consola**):
  - `[x]` `useCabeceraFija` — sombra de cabecera al hacer scroll (consumido en `Header.jsx:34`)
  - `[x]` `useMenuMovil` — hamburguesa móvil (`Header.jsx:35`)
  - `[x]` `useSubmenu` — submenú "Servicios", cierra con Escape y con click fuera (`Header.jsx:36`)
  - `[x]` `useAcordeon` — filas plegables, admite varias abiertas como el clon (`FilasAccordion.jsx:13`)
  - `[x]` `useCarrusel` — carrusel de portada, auto-avance 6s, pausa con hover, respeta `prefers-reduced-motion` (`Portada.jsx:29`)
  - `[x]` `useTrampaFoco` — helper de trampa de foco para diálogos
  - `[x]` `useConvenios` — filtro + cajón + hash `#id` + overflow + devolución de foco (`Convenios.jsx:75`)
  - `[x]` `useVisor` — visor de Notifondo, delegación en `[data-visor-src]` (`Layout.jsx:21`)
- `[~]` **P9 Verificación y matriz de trazabilidad** — todo verde salvo una decisión abierta
  - `[x]` `npm run build` en verde · `npm run lint` (oxlint) sin avisos
  - `[x]` Smoke de las 18 rutas + 2 alias + NotFound: **21/21**, sin errores de consola
  - `[x]` Paridad de las 8 interacciones: **19/19** comprobaciones
  - `[x]` Paridad visual en ≥4 páginas: `/contactenos` 4 · `/convenios` 4 · `/credito-educativo` 4 · `/` 4,5 compensando el hueco fantasma del clon (D-6) · `/nosotros` 2 a propósito, ver D-3
  - `[x]` Guarda: sin `style=` inline en el árbol
  - `[x]` Guarda: sin literales hex fuera de `@theme` (se corrigieron 3 `#fff` y el `#000` de la máscara en `paridad.css`)
  - `[x]` `openspec/changes/fase-2-componentizacion/artifacts/matriz-trazabilidad.md` creada (§4.7)
  - `[x]` **D-3 — decidido: se mantiene la proporción correcta.** El clon estira la portada del Notifondo de `/nosotros` (819×1024 servido a 515×1024) porque su CSS pone `width:100%` sin `height:auto`. La app la sirve 515×644, sin deformar. No se reproduce la distorsión: `/nosotros` puntúa 2 contra el clon a propósito, y esos 380px son toda la diferencia de la página
  - **Defectos reales encontrados y corregidos en esta pasada:** tarjeta `tono="tinta"` renderizaba blanco sobre blanco (conflicto de utilidades Tailwind resuelto por orden de hoja, no de `className`); `Split invertido` nunca invertía (arbitrary variants sobre una clase BEM con guiones bajos); `.tarjeta__pie` sin estilo en `LineasGrid` (54px por página en la portada)

---

## Páginas del clon, una por una

18 páginas HTML del clon, hoy en `archivos-listos/clon-html/`. Para cada una: módulo React, ruta en el router, interacciones que le tocan, y la verificación de accesibilidad que queda pendiente para todas (Fase 6).

> **Para comparar contra el clon en la Fase 6** hay que moverlas de vuelta a la raíz mientras dure la revisión: sus rutas relativas a `assets/` no resuelven desde la carpeta de archivo. El detalle está en `archivos-listos/README.md`.

### 1. `index.html` → `/`

- `[x]` Módulo React `frontend/src/pages/portada.jsx` (9 secciones)
- `[x]` Ruta registrada (`router.jsx:46`, índice)
- `[x]` Interacciones: carrusel de portada, visor de Notifondo
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 2. `ahorro.html` → `/ahorro`

- `[x]` Módulo React `frontend/src/pages/ahorro.jsx` (3 secciones)
- `[x]` Ruta registrada (`router.jsx:47`)
- `[x]` Interacciones: ninguna propia (solo shell)
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 3. `crediaportes-10.html` → `/crediaportes-10`

- `[x]` Módulo React `frontend/src/pages/crediaportes-10.jsx` (vía `CreditoPage`)
- `[x]` Ruta registrada (`router.jsx:48`)
- `[x]` Interacciones: ninguna propia (solo shell)
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 4. `credito-de-confianza.html` → `/credito-de-confianza`

- `[x]` Módulo React `frontend/src/pages/credito-de-confianza.jsx` (vía `CreditoPage`)
- `[x]` Ruta registrada (`router.jsx:49`)
- `[x]` Interacciones: ninguna propia (solo shell)
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 5. `credito-de-consumo-por-bonos.html` → `/credito-de-consumo-por-bonos`

- `[x]` Módulo React `frontend/src/pages/credito-de-consumo-por-bonos.jsx` (vía `CreditoPage`)
- `[x]` Ruta registrada (`router.jsx:50`)
- `[x]` Interacciones: ninguna propia (solo shell)
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 6. `credito-de-libre-inversion.html` → `/credito-de-libre-inversion`

- `[x]` Módulo React `frontend/src/pages/credito-de-libre-inversion.jsx` (vía `CreditoPage`)
- `[x]` Ruta registrada (`router.jsx:51`)
- `[x]` Interacciones: ninguna propia (solo shell)
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 7. `credito-de-impuestos.html` → `/credito-de-impuestos` (+ alias `/credito-de-impuestos-2`)

- `[x]` Módulo React `frontend/src/pages/credito-de-impuestos.jsx` (vía `CreditoPage`)
- `[x]` Ruta registrada (`router.jsx:52`)
- `[x]` Alias heredado registrado (`router.jsx:65`)
- `[x]` Interacciones: ninguna propia (solo shell)
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 8. `credito-de-recreacion-y-turismo.html` → `/credito-de-recreacion-y-turismo`

- `[x]` Módulo React `frontend/src/pages/credito-de-recreacion-y-turismo.jsx` (vía `CreditoPage`)
- `[x]` Ruta registrada (`router.jsx:53`)
- `[x]` Interacciones: ninguna propia (solo shell)
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 9. `credito-educativo.html` → `/credito-educativo`

- `[x]` Módulo React `frontend/src/pages/credito-educativo.jsx` (vía `CreditoPage`)
- `[x]` Ruta registrada (`router.jsx:54`)
- `[x]` Interacciones: ninguna propia (solo shell)
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 10. `creditos-de-tesoreria.html` → `/creditos-de-tesoreria`

- `[x]` Módulo React `frontend/src/pages/creditos-de-tesoreria.jsx` (vía `CreditoPage`)
- `[x]` Ruta registrada (`router.jsx:55`)
- `[x]` Interacciones: ninguna propia (solo shell)
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 11. `tarjeta-express.html` → `/tarjeta-express`

- `[x]` Módulo React `frontend/src/pages/tarjeta-express.jsx` (vía `CreditoPage`)
- `[x]` Ruta registrada (`router.jsx:56`)
- `[x]` Interacciones: ninguna propia (solo shell)
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 12. `nosotros.html` → `/nosotros`

- `[x]` Módulo React `frontend/src/pages/nosotros.jsx` (8 secciones — la página más densa)
- `[x]` Ruta registrada (`router.jsx:57`)
- `[x]` Interacciones: ninguna propia (solo shell)
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 13. `como-ser-asociado.html` → `/como-ser-asociado` (+ alias `/como-ser_asociado`)

- `[x]` Módulo React `frontend/src/pages/como-ser-asociado.jsx` (5 secciones)
- `[x]` Ruta registrada (`router.jsx:58`)
- `[x]` Alias heredado registrado (`router.jsx:66`)
- `[x]` Interacciones: ninguna propia (solo shell)
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 14. `convenios.html` → `/convenios`

- `[x]` Módulo React `frontend/src/pages/convenios.jsx` (4 secciones)
- `[x]` Ruta registrada (`router.jsx:59`)
- `[x]` Interacciones: filtro por categoría, cajón lateral de detalle, navegación por hash (`#santur`), trampa de foco
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada (crítica aquí: el cajón es un diálogo modal)

### 15. `beneficios.html` → `/beneficios`

- `[x]` Módulo React `frontend/src/pages/beneficios.jsx` (3 secciones)
- `[x]` Ruta registrada (`router.jsx:60`)
- `[x]` Interacciones: ninguna propia (solo shell)
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 16. `estado-de-cuenta.html` → `/estado-de-cuenta`

- `[x]` Módulo React `frontend/src/pages/estado-de-cuenta.jsx` (3 secciones)
- `[x]` Ruta registrada (`router.jsx:61`)
- `[x]` Interacciones: ninguna propia (solo shell)
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 17. `preguntas-frecuentes.html` → `/preguntas-frecuentes`

- `[x]` Módulo React `frontend/src/pages/preguntas-frecuentes.jsx` (4 secciones)
- `[x]` Ruta registrada (`router.jsx:62`)
- `[x]` Interacciones: acordeón de preguntas
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 18. `contactenos.html` → `/contactenos`

- `[x]` Módulo React `frontend/src/pages/contactenos.jsx` (2 secciones)
- `[x]` Ruta registrada (`router.jsx:63`)
- `[x]` Markup del formulario portado completo (5 campos + aviso + texto legal Ley 1581/2012)
- `[x]` Interacciones: ninguna propia (solo shell)
- `[ ]` **Formulario funcional** — hoy es inerte a propósito: sin handlers, sin validación, sin envío (`contactenos.jsx:84`). Lo cablea la Fase 3
- `[ ]` Paridad visual verificada
- `[ ]` Accesibilidad WCAG 2.2 AA verificada

### 19. Fallback 404 (sin HTML de origen)

- `[x]` Módulo React `frontend/src/pages/NotFound.jsx`
- `[x]` Comodín `*` registrado (`router.jsx:67`)
- `[ ]` Paridad visual verificada

---

## Estándares de diseño (§4 y §5 de la especificación)

### Migración de diseño

- `[x]` Tokens de marca extraídos del CSS original antes de componentizar
- `[x]` Un componente = una responsabilidad (sin componentes de 500+ líneas)
- `[x]` Sin CSS inline ni `style={{}}` — guarda corrida en P9, árbol limpio
- `[x]` CSS custom concentrado en `styles/paridad.css` y documentado
- `[x]` Assets movidos tal cual, sin optimización no pedida
- `[x]` Matriz de trazabilidad archivo original → componente nuevo (`openspec/changes/fase-2-componentizacion/artifacts/matriz-trazabilidad.md`)

> **Desviación aceptada:** la especificación §2 pide `tailwind.config.js`. El proyecto usa Tailwind v4, que configura los tokens desde CSS con `@theme` en `styles/index.css`. No existe ni debe existir `tailwind.config.js`. La intención del requisito (tokens centralizados, cero hex sueltos) se cumple igual, y la guarda de P9 lo verifica.

### UI/UX y accesibilidad

- `[ ]` Contraste mínimo 4.5:1 en texto normal, auditado página por página
- `[x]` Todos los inputs con `<label>` asociado (no solo placeholder) — verificado en `contactenos.jsx:95-125`
- `[~]` Navegación por teclado: `SkipLink` existe, trampa de foco implementada en diálogos; falta auditoría de orden de tabulación
- `[~]` Atributos ARIA donde el HTML semántico no basta (`role="status"`, `aria-current`) — falta auditoría completa
- `[ ]` Textos alternativos en todas las imágenes informativas, auditados
- `[x]` `prefers-reduced-motion` respetado en el carrusel (`useCarrusel`)
- `[ ]` Mobile-first verificado en móvil, tablet y desktop
- `[ ]` Estados de formulario obligatorios (ver Fase 3, abajo)

---

## Fase 3 — Formularios en el frontend

### Auditoría de formularios (Fase 0)

**Hallazgo importante que cambia el alcance:** la especificación §9 dice "varios formularios", pero el clon HTML tiene **un solo formulario**. Búsqueda de `<form>`, `<input>`, `<textarea>` y `<select>` sobre las 18 páginas: todas las coincidencias están en `contactenos.html:109-144`. Ninguna otra página tiene campos de entrada.

| Formulario | Página | Campos | Destino |
|---|---|---|---|
| `formulario-contacto` | `contactenos.html:109` | `nombre` (texto, requerido), `correo` (email, requerido), `telefono` (tel, opcional), `asunto` (select de 6 opciones, requerido), `mensaje` (textarea, requerido) | `[!]` sin confirmar |

- `[!]` **Confirmar con el cliente si hay más formularios previstos** que no estén en el clon (por ejemplo: solicitud de crédito, afiliación, newsletter). Si la respuesta es "solo contacto", las Fases 3 a 5 se reducen a un único endpoint y el patrón reutilizable de §6.5 sigue valiendo la pena solo como previsión.

### Implementación

- `[ ]` Instalar `react-hook-form` + `zod` (o `yup`) — hoy no están en `frontend/package.json`
- `[ ]` Crear `frontend/src/lib/` con esquema de validación y cliente `fetch` (la carpeta existe pero está vacía, solo `.gitkeep`)
- `[ ]` Cablear `contactenos.jsx` con React Hook Form conservando el markup y las clases del clon
- `[ ]` Validación en tiempo real (on blur), no solo al enviar
- `[ ]` Estado de carga: botón deshabilitado con spinner
- `[ ]` Estado de éxito: mensaje claro reutilizando el `.aviso-envio` ya presente, no un `alert()`
- `[ ]` Estado de error específico por campo, reutilizando los `.campo__error` ya presentes y el atributo `data-error`
- `[ ]` Campo honeypot oculto (par frontend de la defensa de §6.2)
- `[ ]` Integrar el widget invisible de reCAPTCHA v3 y obtener el token al enviar
- `[ ]` Reemplazar el texto "este formulario es una demostración del prototipo" (`contactenos.jsx:33`) por el copy real de confirmación

---

## Fase 4 — Backend PHP y seguridad

No existe carpeta `backend/` en el repositorio. Todo lo de esta sección está pendiente.

### Estructura

- `[ ]` `backend/api/contact.php` — un endpoint por formulario
- `[ ]` `backend/src/Mailer.php` — wrapper de PHPMailer reutilizable
- `[ ]` `backend/src/Validator.php`
- `[ ]` `backend/src/RateLimiter.php`
- `[ ]` `backend/src/Csrf.php`
- `[ ]` `backend/src/Recaptcha.php`
- `[ ]` `backend/config/config.php` — sin credenciales embebidas
- `[ ]` `backend/config/forms.php` — registro central: campos requeridos, correo destino, asunto
- `[ ]` `backend/vendor/` — PHPMailer
- `[ ]` `backend/.env` y `backend/.env.example`
- `[ ]` `backend/.htaccess` que bloquee acceso directo a `.env`, `config/*.php` y `vendor/`

### Checklist de seguridad (§6.6 — no negociable)

**Frontend (§6.1)**

- `[ ]` Validación de cliente presente, tratada solo como primera capa
- `[ ]` Datos escapados antes de mostrarse en pantalla (prevención de XSS reflejado)
- `[ ]` Sin claves, tokens ni endpoints sensibles en el bundle del cliente
- `[ ]` HTTPS obligatorio en todas las peticiones, nunca `http://` en producción

**Backend (§6.2)**

- `[ ]` Validación y sanitización server-side de todos los campos, sin excepción
- `[ ]` Token CSRF único por sesión/formulario, verificado en cada envío
- `[ ]` Rate limiting por IP (referencia: 5 intentos cada 10 minutos)
- `[ ]` reCAPTCHA v3 verificado contra `siteverify` con umbral de score (arranque en 0.5)
- `[ ]` Honeypot como segunda capa
- `[ ]` Prepared statements si aparece cualquier consulta a base de datos
- `[ ]` Salida escapada con `htmlspecialchars()`
- `[ ]` PHPMailer con Gmail SMTP autenticado — nunca `mail()` nativo de PHP
- `[ ]` Contraseña de aplicación de Google, nunca la contraseña normal de la cuenta
- `[ ]` `smtp.gmail.com` puerto 587 con STARTTLS (o 465 con SSL)
- `[ ]` Correos destino configurables en `.env` / `config/forms.php`, nunca embebidos en el código
- `[ ]` Credenciales solo en `.env`, con `.env` en `.gitignore`
- `[ ]` Cabeceras de seguridad: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`
- `[ ]` CORS restringido al dominio real, nunca `*` en producción
- `[ ]` Límite de tamaño de payload
- `[ ]` Logs de intentos sospechosos, sin registrar datos sensibles
- `[ ]` Errores sin exponer stack traces, rutas del servidor ni versión de PHP
- `[ ]` Validación de método HTTP y `Content-Type` — rechazar todo lo que no sea `POST`

**Hosting cPanel (§6.4)**

- `[!]` Confirmar si el plan tiene acceso SSH/Composer, o si PHPMailer se instala manualmente
- `[!]` Confirmar la versión de PHP disponible en cPanel → "Select PHP Version"
- `[!]` Confirmar que el hosting permite salida SMTP a `smtp.gmail.com` en el puerto 587/465 (varios hostings compartidos lo bloquean por defecto)
- `[ ]` `.env` y `config/` ubicados fuera de `public_html`, o protegidos con `.htaccess`

**Nota sobre volumen:** Gmail limita el envío a unos 500 correos diarios en cuentas normales. Si el volumen crece, corresponde migrar a un proveedor transaccional (SendGrid, Mailgun, Amazon SES). Queda anotado como nota técnica; no se implementa ahora.

---

## Fase 5 — Integración

- `[ ]` Conectar `contactenos.jsx` al endpoint PHP vía `fetch`, respuestas JSON
- `[ ]` Manejo de errores de red y de respuestas no-2xx en la UI
- `[ ]` Prueba de envío real de correo en entorno de pruebas
- `[ ]` Verificar que el correo llega y que el remitente/asunto son los esperados

---

## Fase 6 — Revisión final

- `[ ]` Checklist de seguridad completa recorrida y verificada, ítem por ítem
- `[ ]` Checklist de UI/UX (§5) recorrida en las 18 páginas
- `[ ]` Checklist de accesibilidad WCAG 2.2 AA en las 18 páginas
- `[ ]` Build de producción en verde y desplegado en cPanel
- `[ ]` Resumen final de entrega: archivos creados, modificados, supuestos tomados

---

## Deuda técnica conocida

- `[ ]` **No hay test runner.** `frontend/package.json` solo define `dev`, `build`, `lint`, `preview`. Toda la verificación hasta ahora fue build + `oxlint` + harnesses desechables borrados tras cada tramo. Riesgo de regresión silenciosa a medida que crecen las fases 3 a 5.
- `[ ]` `frontend/src/lib/` está vacía (solo `.gitkeep`), esperando la Fase 3.
- `[x]` `CLONE_AUDIT.md` y `CLONE_REPORT.md` ya no se pueden confundir con el tablero activo: se archivaron en `archivos-listos/`, cuyo README explica qué es cada cosa y por qué salió de la raíz.

---

## Datos que faltan del cliente

Estos bloquean la Fase 4 y no se pueden inventar:

- `[!]` Confirmar si hay más formularios además del de contacto
- `[!]` Correo(s) real(es) de destino por formulario
- `[!]` Cuenta de Gmail dedicada al envío, con verificación en 2 pasos activada y contraseña de aplicación generada
- `[!]` `site key` y `secret key` de Google reCAPTCHA v3 para el dominio real
- `[!]` Acceso SSH/Composer en el plan de cPanel
- `[!]` Versión de PHP del hosting
- `[!]` Confirmación de que el hosting permite salida SMTP

---

## Siguiente paso

Cerrar la Fase 2 antes de abrir cualquier otra: commitear P8, borrar el harness temporal, y correr P9 completa con su matriz de trazabilidad. Recién ahí arranca la Fase 3, y en paralelo se pueden ir pidiendo al cliente los datos bloqueantes de la Fase 4.
