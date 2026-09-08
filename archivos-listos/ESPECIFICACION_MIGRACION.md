# Especificación Técnica: Migración HTML/CSS → React + Tailwind + Backend PHP

**Documento destinado a un agente de IA (Claude Code) para ejecutar la migración de forma controlada, segura y sin desviaciones del alcance.**

---

## 0. Cómo usar este documento

Este archivo es la **única fuente de verdad** para el agente. Antes de escribir código, el agente debe:

1. Leer este documento completo.
2. Inspeccionar el proyecto HTML/CSS actual (estructura de carpetas, componentes visuales, formularios existentes).
3. Producir un plan corto (lista de archivos a crear/mover) y esperar confirmación **antes** de generar más de 3 archivos nuevos de una sola vez.
4. Ejecutar por fases (ver sección 8), no todo de una vez.

Si algo en este documento es ambiguo o falta información, el agente debe **preguntar**, nunca asumir ni inventar.

---

## 1. Objetivo del proyecto

Migrar un sitio existente construido en **HTML + CSS puro** a una aplicación **React + Tailwind CSS**, conservando exactamente el diseño visual actual (colores, tipografías, espaciados, animaciones), y conectando los formularios existentes a un **backend PHP** que envíe correos de forma segura.

**No es un rediseño.** El resultado visual debe verse idéntico (o mejorado solo en accesibilidad/responsividad) al original, salvo que se indique explícitamente lo contrario.

---

## 2. Stack tecnológico objetivo

| Capa | Tecnología |
|---|---|
| Frontend | React (Vite), **JavaScript** (sin TypeScript) |
| Estilos | Tailwind CSS (usando `tailwind.config` con tokens extraídos del CSS original) |
| Formularios | React Hook Form + validación con Zod o Yup |
| Backend | PHP puro (sin frameworks pesados), estructura orientada a endpoints (`/api/contact.php`, etc.) |
| Envío de correo | PHPMailer + **Gmail SMTP** (autenticado, con contraseña de aplicación, nunca la contraseña normal de la cuenta) |
| Anti-spam | **reCAPTCHA v3 invisible** (Google) — se valida por score en el backend, sin desafío visible al usuario |
| Comunicación Frontend↔Backend | `fetch` a endpoints PHP, respuestas en JSON |
| Hosting objetivo | **cPanel** (hosting compartido) — el agente debe asumir restricciones típicas de este entorno (ver sección 6.4) |

> El agente no debe agregar frameworks, librerías de UI (MUI, Bootstrap, Chakra, etc.) ni dependencias no listadas aquí sin preguntar primero.

---

## 3. Estructura de carpetas esperada

```
proyecto/
├── frontend/
│   ├── src/
│   │   ├── components/       # componentes reutilizables (Button, Input, Card...)
│   │   ├── sections/         # secciones de página (Hero, Contact, Footer...)
│   │   ├── pages/            # si hay rutas múltiples
│   │   ├── hooks/
│   │   ├── lib/              # validaciones, helpers, cliente fetch
│   │   ├── styles/           # index.css con @tailwind directives
│   │   └── assets/
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
└── backend/
    ├── api/
    │   ├── contact.php        # un endpoint por formulario (ver sección 6.5)
    │   ├── formulario-2.php
    │   └── ...
    ├── src/
    │   ├── Mailer.php         # wrapper de PHPMailer reutilizable por todos los formularios
    │   ├── Validator.php
    │   ├── RateLimiter.php
    │   ├── Csrf.php
    │   └── Recaptcha.php      # verificación de reCAPTCHA v3 contra la API de Google
    ├── config/
    │   ├── config.php         # NUNCA con credenciales hardcodeadas
    │   └── forms.php          # mapa de formularios: campos esperados + correo(s) destino de cada uno
    ├── vendor/                # PHPMailer instalado vía Composer (o manual si cPanel no permite Composer, ver 6.4)
    ├── .env                   # variables sensibles (fuera de git)
    └── .env.example
```

El agente debe respetar esta estructura o proponer una alternativa justificada **antes** de crearla.

---

## 4. Migración del diseño (HTML/CSS → React/Tailwind)

Reglas obligatorias:

1. **Extraer design tokens primero**: antes de escribir un solo componente, el agente debe listar colores, tipografías, tamaños de fuente, espaciados y breakpoints usados en el CSS original y mapearlos a `tailwind.config.js` (`theme.extend`).
2. **Un componente = una responsabilidad**. No crear componentes gigantes de 500+ líneas; dividir en subcomponentes lógicos.
3. **Sin CSS inline ni `style={{}}`** salvo casos justificados (ej. valores dinámicos calculados en runtime).
4. **Sin clases CSS personalizadas nuevas** si Tailwind ya resuelve el caso. Si se necesita CSS custom (ej. animaciones complejas), debe ir en `styles/` y documentarse por qué Tailwind no bastó.
5. **Responsive obligatorio**: cada componente debe funcionar en móvil, tablet y desktop aunque el original no lo tuviera bien resuelto — pero sin cambiar el layout conceptual sin avisar.
6. **Imágenes y assets**: mover tal cual, optimizar solo si se pide explícitamente.
7. Al finalizar cada sección migrada, el agente debe indicar qué archivo original correspondía a qué componente nuevo (trazabilidad).

---

## 5. Estándares de UI/UX (normas actuales)

- **Accesibilidad (WCAG 2.2 AA como mínimo)**:
  - Contraste de color adecuado (mínimo 4.5:1 texto normal).
  - Todos los inputs con `<label>` asociado (no solo placeholder).
  - Navegación por teclado funcional (focus visible, orden lógico de tab).
  - Atributos ARIA donde el HTML semántico no baste.
  - Textos alternativos (`alt`) en todas las imágenes informativas.
- **Estados de interfaz obligatorios en cada formulario**:
  - Estado inicial / estado de carga (loading, botón deshabilitado con spinner).
  - Estado de éxito (mensaje claro, no solo un `alert()`).
  - Estado de error (mensaje específico por campo, no genérico).
  - Validación en tiempo real (on blur), no solo al enviar.
- **Micro-interacciones**: transiciones suaves (150–300ms), sin animaciones que distraigan o generen mareo (`prefers-reduced-motion` respetado).
- **Mobile-first**: diseñar/verificar primero en viewport pequeño.
- **Feedback inmediato**: ningún botón debe quedar "muerto" sin respuesta visual al hacer clic.
- **Tipografía y jerarquía visual** consistentes con el proyecto original; no introducir más de 2 familias tipográficas.

---

## 6. Seguridad — Requisitos obligatorios (no negociables)

Dado que habrá formularios con envío de correo, el agente **debe implementar todo lo siguiente**, no una parte:

### 6.1 Frontend (React)
- Validación de datos en cliente (UX), pero **nunca confiar solo en ella** — es solo la primera capa.
- Sanitizar/escapar cualquier dato antes de mostrarlo en pantalla (evitar XSS reflejado).
- No exponer claves, tokens ni endpoints sensibles en el código del frontend (nada de API keys de servicios de correo en el cliente).
- Usar HTTPS obligatorio para todas las peticiones (nunca `http://` en producción).

### 6.2 Backend (PHP)
- **Validación y sanitización server-side de TODOS los campos**, sin excepción, incluso si ya se validó en el frontend.
- **Protección CSRF**: token único por sesión/formulario, verificado en cada submit.
- **Rate limiting**: límite de envíos por IP (ej. máximo 5 intentos cada 10 minutos) para evitar spam/flooding del formulario.
- **reCAPTCHA v3 invisible**: el frontend obtiene el token al enviar el formulario; el backend lo verifica contra la API de Google (`siteverify`) y rechaza envíos con `score` bajo (umbral recomendado: 0.5, ajustable). Además, agregar un **honeypot** (campo oculto que un bot llenaría) como segunda capa barata.
- **Prepared statements** si hay cualquier consulta a base de datos (prevención de SQL Injection). Nunca concatenar variables en queries.
- **Escapar salida** con `htmlspecialchars()` en cualquier dato que se re-muestre.
- **Nunca usar `mail()` nativo de PHP** — usar PHPMailer con **Gmail SMTP** autenticado mediante:
  - Una **cuenta de Gmail dedicada** al envío (no la personal del negocio, idealmente).
  - Una **contraseña de aplicación** de Google (no la contraseña normal de la cuenta; requiere verificación en 2 pasos activada en esa cuenta de Gmail).
  - Conexión por `smtp.gmail.com`, puerto `587` con `STARTTLS` (o `465` con SSL).
  - Tener en cuenta el **límite de envío de Gmail** (~500 correos/día en cuentas normales); si el volumen crece, migrar a un proveedor transaccional (SendGrid, Mailgun, Amazon SES) más adelante — dejarlo anotado como nota técnica, no implementarlo ahora.
- **Destinatario configurable, no hardcodeado**: cada formulario define su correo (o correos) destino en `config/forms.php` o vía variable de entorno, para poder cambiarlo sin tocar código. Mientras el usuario no indique un correo definitivo, usar un placeholder claro (`destinatario@ejemplo.com`) y dejarlo señalado en `.env.example`.
- **Variables sensibles (usuario y contraseña de aplicación de Gmail) solo en `.env`**, nunca hardcodeadas ni subidas al control de versiones. Incluir `.env` en `.gitignore`.
- **Cabeceras de seguridad HTTP**: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Strict-Transport-Security`.
- **CORS restringido**: solo permitir el dominio real del frontend, nunca `*` en producción.
- **Límite de tamaño de payload** para evitar ataques de denegación de servicio simples.
- **Logs de intentos sospechosos** (sin loggear datos sensibles como contraseñas).
- **Manejo de errores sin exponer información interna** (nunca mostrar stack traces, rutas del servidor o versión de PHP al usuario final).
- Validar `Content-Type` y método HTTP esperado (rechazar todo lo que no sea `POST` en endpoints de formulario).

### 6.4 Particularidades de hosting cPanel (compartido)

El agente debe tener en cuenta que un hosting cPanel típico:

- Puede **no permitir `composer` por SSH** (depende del plan). Si no hay acceso SSH/Composer, instalar PHPMailer **manualmente** (descargar la librería y subir la carpeta `vendor/` o los archivos fuente, sin gestor de dependencias).
- Suele restringir la **versión de PHP** disponible (verificar en cPanel → "Select PHP Version" y no usar sintaxis de una versión de PHP más nueva de la que el hosting soporta).
- Puede bloquear **puertos salientes SMTP no estándar**; confirmar que el hosting permite conexiones salientes al puerto 587/465 hacia `smtp.gmail.com` (algunos hostings compartidos los bloquean por defecto — si es el caso, el agente debe avisarlo, no asumir que funcionará).
- El archivo `.env` y `config/` deben ubicarse, si es posible, **fuera del `public_html`** (o protegidos con `.htaccess` que deniegue el acceso directo), para que no sean accesibles vía URL directa.
- Agregar un `.htaccess` en `backend/` que bloquee el acceso directo a `.env`, `config/*.php` y `vendor/` desde el navegador.

### 6.5 Manejo de varios formularios (patrón reutilizable)

Como el proyecto tiene **varios formularios**, no se debe duplicar lógica de seguridad en cada endpoint. En su lugar:

1. Toda la lógica común (CSRF, rate limiting, reCAPTCHA, sanitización, envío) vive en `src/` como clases reutilizables.
2. Cada endpoint en `api/` solo define: qué campos espera ese formulario específico, a qué correo van, y llama a las clases comunes.
3. `config/forms.php` mantiene un registro central de todos los formularios (nombre, campos requeridos, correo destino, asunto del correo) para que agregar un formulario nuevo no implique reescribir seguridad desde cero.
4. Antes de generar el código de cada formulario, el agente debe listar cuántos formularios detectó en el HTML original y qué campos tiene cada uno, y confirmarlo con el usuario si no es evidente.

### 6.6 Checklist final de seguridad (el agente debe marcar cada ítem como hecho)
- [ ] CSRF token implementado y verificado
- [ ] Rate limiting activo
- [ ] reCAPTCHA v3 verificado en backend con umbral de score
- [ ] Honeypot implementado como segunda capa
- [ ] Validación server-side completa (todos los campos, en todos los formularios)
- [ ] Sanitización de entrada y salida
- [ ] PHPMailer con Gmail SMTP + contraseña de aplicación (no `mail()` nativo, no contraseña normal)
- [ ] Correo(s) destino configurables en `.env` / `config/forms.php`, no hardcodeados
- [ ] Credenciales solo en `.env`, `.env` en `.gitignore` y protegido con `.htaccess`
- [ ] HTTPS forzado
- [ ] Cabeceras de seguridad configuradas
- [ ] CORS restringido al dominio real
- [ ] `config/`, `vendor/` y `.env` protegidos de acceso directo vía URL
- [ ] Confirmado que el hosting cPanel permite salida SMTP a Gmail (587/465)
- [ ] Sin mensajes de error que filtren información del servidor

---

## 7. Reglas anti-alucinación / anti-desvío para el agente

Estas reglas tienen **prioridad sobre cualquier "iniciativa creativa"** del agente:

1. **No inventar funcionalidades no pedidas.** Si algo parece "buena idea" (ej. agregar dark mode, agregar analytics, agregar más páginas), el agente debe **proponerlo y preguntar**, nunca implementarlo directamente.
2. **No asumir contenido.** Si un texto, imagen o dato del formulario no está claro en el HTML original, el agente debe dejar un `// TODO: confirmar con el usuario` en vez de inventar contenido de relleno permanente.
3. **No eliminar ni modificar funcionalidad existente** sin señalarlo explícitamente antes de hacerlo.
4. **No crear archivos, dependencias o carpetas fuera de la estructura definida en la sección 3** sin justificar por qué es necesario.
5. **No fabricar credenciales, API keys ni datos de configuración.** Si falta una clave SMTP o similar, debe dejar un placeholder claro en `.env.example` y pedir el dato real al usuario.
6. **Reportar siempre qué se hizo vs. qué falta.** Al final de cada fase, entregar un resumen: archivos creados, archivos modificados, pendientes, y cualquier supuesto que haya tenido que tomar.
7. **No marcar una tarea como "completada" sin haberla verificado** (ej. que el formulario realmente compile, que no haya errores de import, que el build de Vite no falle).
8. **No cambiar el alcance del proyecto.** Si el usuario pidió migrar 3 formularios, no migrar "de paso" otras secciones no mencionadas.
9. **Cuando haya duda entre dos formas válidas de resolver algo, preguntar cuál prefiere el usuario**, no elegir silenciosamente la que al agente "le parezca mejor".
10. **Nunca declarar que algo es "100% seguro" o "imposible de hackear".** La seguridad es un proceso de mitigación de riesgos, no una garantía absoluta — el agente debe comunicarlo así.

---

## 8. Plan de ejecución por fases (recomendado)

1. **Fase 0 – Auditoría**: listar archivos HTML/CSS actuales, formularios existentes, campos de cada formulario, y destino de cada correo.
2. **Fase 1 – Setup**: crear proyecto Vite + React + Tailwind, configurar `tailwind.config.js` con los tokens extraídos.
3. **Fase 2 – Componentización**: migrar secciones estáticas (header, footer, hero, etc.) sin lógica de formularios todavía.
4. **Fase 3 – Formularios (frontend)**: construir formularios con validación cliente, sin conectar aún al backend.
5. **Fase 4 – Backend PHP**: crear endpoints con toda la checklist de seguridad de la sección 6.
6. **Fase 5 – Integración**: conectar frontend↔backend, probar envío real de correo en entorno de pruebas.
7. **Fase 6 – Revisión final**: checklist de seguridad, checklist de UI/UX, checklist de accesibilidad.

El agente debe pedir confirmación antes de pasar de una fase a la siguiente si hubo cambios de alcance.

---

## 9. Decisiones ya confirmadas por el usuario

| Pregunta | Decisión |
|---|---|
| Lenguaje frontend | JavaScript (sin TypeScript) |
| Cantidad de formularios | Varios — el agente debe **auditarlos primero** (Fase 0) y listarlos con sus campos antes de programar nada |
| Correo(s) destino | Abierto/configurable — usar placeholder en `.env.example` hasta que el usuario dé el correo real; nunca hardcodear uno inventado como definitivo |
| Proveedor SMTP | Gmail SMTP con contraseña de aplicación |
| Hosting | cPanel (compartido) — aplican las restricciones de la sección 6.4 |
| Anti-bot | reCAPTCHA v3 invisible + honeypot |

### Pendiente aún antes de programar (Fase 0 del agente)

- [ ] Listar cada formulario detectado en el HTML original y sus campos exactos.
- [ ] Confirmar la cuenta de Gmail que se usará para el envío (y que tenga verificación en 2 pasos + contraseña de aplicación generada).
- [ ] Confirmar si el plan de cPanel tiene acceso SSH/Composer o si PHPMailer debe instalarse manualmente.
- [ ] Confirmar el correo(s) real de destino por formulario (puede ser el mismo para todos o distinto por formulario).
- [ ] Registrar el sitio en Google reCAPTCHA v3 y obtener `site key` + `secret key`.

---

*Fin de la especificación. El agente debe tratar cada sección como requisito, no como sugerencia.*
