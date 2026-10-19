/*!
 * Widget de accesibilidad flotante — vanilla, sin dependencias.
 *
 * Instalación: pegar antes de </body>
 *   <script src="/a11y-widget.js" defer></script>
 *
 * ---------------------------------------------------------------------------
 * TRES DECISIONES DE ARQUITECTURA QUE CONVIENE LEER ANTES DE MODIFICAR ESTE
 * ARCHIVO, PORQUE NO SON ARBITRARIAS
 * ---------------------------------------------------------------------------
 *
 * 1. EL HOST VIVE FUERA DE <body>, COMO HERMANO SUYO.
 *
 *    Los filtros de contraste y saturación se aplican a `body`. Un elemento
 *    descendiente NO PUEDE escapar del `filter` de un ancestro: no existe
 *    `filter: none` que lo anule, ni `isolation`, ni una capa superior. Si el
 *    widget viviera dentro de `body`, al activar escala de grises el propio
 *    panel se volvería gris, y al aplicar un filtro el ancestro se convierte en
 *    containing block, lo que rompería su `position: fixed`.
 *
 *    Con el host colgado de <html>, el widget queda fuera del subárbol
 *    filtrado. Y de ahí se deriva la regla que gobierna todo el CSS global de
 *    este archivo: TODA regla que afecte al sitio lleva `body` como ancestro.
 *    Eso excluye al widget de los filtros, del zoom, del resaltado de enlaces y
 *    del ocultado de imágenes sin necesidad de una sola excepción con :not().
 *
 *    Contrapartida conocida: mientras un filtro está activo, `body` es
 *    containing block, así que un elemento `position: fixed` DEL SITIO se
 *    posiciona respecto a `body` y no al viewport. Es el precio de usar
 *    `filter`, y no tiene alternativa en CSS.
 *
 * 2. LOS ESTILOS ENTRAN POR EL CSSOM, NUNCA POR UN <style>.
 *
 *    Una política de seguridad de contenido con `style-src 'self'` y sin
 *    `'unsafe-inline'` bloquea los elementos <style> que inyecta un script, y
 *    el panel aparecería sin estilos. Las hojas construibles
 *    (`new CSSStyleSheet()` + `adoptedStyleSheets`) son API del CSSOM y la
 *    política no las intercepta. Hay respaldo con <style> para navegadores sin
 *    soporte, que son los mismos donde una política estricta no está en juego.
 *
 * 3. EL CURSOR GRANDE NECESITA `data:` EN LA DIRECTIVA img-src.
 *
 *    `cursor: url(data:...)` se evalúa contra `img-src`. Con `img-src 'self'`
 *    el cursor no se aplica: el resto del widget funciona igual, solo esa
 *    función queda sin efecto. Para habilitarla hace falta `img-src 'self'
 *    data:` en la política del servidor.
 */

(function () {
  'use strict';

  // Si el script se incluye dos veces, no duplicar el widget.
  if (window.__a11ywIniciado) return;
  window.__a11ywIniciado = true;

  /* =========================================================================
   * 1. CONFIGURACIÓN — lo único que hay que tocar para adaptarlo a un cliente
   * ========================================================================= */

  const CONFIG = {
    // Colores de la marca. Si alguno no alcanza 4.5:1 contra su fondo, el
    // widget lo corrige solo al arrancar (ver asegurarContraste).
    colorPrimario: '#01509C',   // botón flotante, encabezado, estados activos
    colorSecundario: '#00a8c6', // hover y acentos
    colorPanel: '#ffffff',      // fondo del panel
    colorTexto: '#152238',      // texto

    // Tipografía. El fallback no es decorativo: si la fuente de la marca no
    // carga, el panel tiene que seguir siendo legible.
    fuente: '"Montserrat", system-ui, sans-serif',

    radio: '14px',              // radio de bordes

    // Lado del panel, y del botón flotante mientras el sitio no diga otra cosa.
    // Acá va a la IZQUIERDA porque el sitio ya tiene su propio botón flotante
    // abajo a la derecha, el de volver arriba, y dos botones en la misma
    // esquina se tapan.
    //
    // El sitio puede mover y redimensionar el botón con las propiedades
    // --a11yw-lanzador-* (ver .lanzador en la sección 7). Fondefos lo hace en
    // paridad.css, grupo 25, donde se reparte la columna de flotantes: antes
    // de cambiar este valor conviene mirar ese reparto.
    posicion: 'izquierda',      // 'derecha' | 'izquierda'
    idioma: 'auto',             // 'auto' toma el lang del documento; 'es' | 'en'

    // Atajo de teclado. Alt+A y no Ctrl+U: Ctrl+U es «ver código fuente» del
    // navegador, y quitarle a alguien un atajo que ya usa es lo contrario de
    // una mejora de accesibilidad.
    atajo: { alt: true, ctrl: false, tecla: 'a' },

    // URL de la declaración de accesibilidad. Vacía = no se muestra el enlace.
    declaracionUrl: '',

    // Funciones visibles, en el orden en que aparecen en la cuadrícula.
    funcionesActivas: [
      'lectura', 'contraste', 'saturacion', 'textoGrande', 'espaciado',
      'enlaces', 'dislexia', 'cursor', 'tooltips', 'estructura',
      'animaciones', 'guia', 'mascara', 'imagenes', 'alineacion', 'foco',
    ],
  };

  const CLAVE_ALMACEN = 'a11yw:prefs';

  /* =========================================================================
   * 2. TRADUCCIONES — agregar un idioma es agregar una clave a este objeto
   * ========================================================================= */

  const TEXTOS = {
    es: {
      abrir: 'Abrir menú de accesibilidad',
      cerrar: 'Cerrar menú de accesibilidad',
      titulo: 'Menú de accesibilidad',
      idioma: 'Idioma',
      perfiles: 'Perfiles',
      ajustes: 'Ajustes individuales',
      restablecer: 'Restablecer todo',
      declaracion: 'Declaración de accesibilidad',
      activado: 'activado',
      desactivado: 'desactivado',
      nivel: 'nivel',
      de: 'de',
      atajoAviso: 'Atajo: Alt + A',

      // Perfiles
      p_motora: 'Discapacidad motora',
      p_motora_d: 'Cursor grande, foco resaltado y animaciones detenidas',
      p_ceguera: 'Ceguera',
      p_ceguera_d: 'Lectura en voz alta y foco resaltado',
      p_daltonismo: 'Daltonismo',
      p_daltonismo_d: 'Saturación alta para separar mejor los colores',
      p_dislexia: 'Dislexia',
      p_dislexia_d: 'Fuente legible y más espaciado entre letras',
      p_bajaVision: 'Baja visión',
      p_bajaVision_d: 'Texto más grande y contraste alto',
      p_cognitivo: 'Cognitivo y aprendizaje',
      p_cognitivo_d: 'Guía de lectura y enlaces resaltados',
      p_epilepsia: 'Epilepsia',
      p_epilepsia_d: 'Animaciones detenidas y saturación baja',
      p_tdah: 'TDAH',
      p_tdah_d: 'Máscara de lectura y animaciones detenidas',

      // Funciones
      f_lectura: 'Leer en voz alta',
      f_contraste: 'Contraste',
      f_saturacion: 'Saturación',
      f_textoGrande: 'Texto más grande',
      f_espaciado: 'Espaciado de texto',
      f_enlaces: 'Resaltar enlaces',
      f_dislexia: 'Fuente para dislexia',
      f_cursor: 'Cursor grande',
      f_tooltips: 'Descripciones al pasar',
      f_estructura: 'Estructura de página',
      f_animaciones: 'Pausar animaciones',
      f_guia: 'Guía de lectura',
      f_mascara: 'Máscara de lectura',
      f_imagenes: 'Ocultar imágenes',
      f_alineacion: 'Alineación de texto',
      f_foco: 'Resaltar el foco',

      // Niveles
      n_contraste: ['Contraste alto', 'Modo oscuro', 'Modo claro'],
      n_saturacion: ['Saturación baja', 'Saturación alta', 'Escala de grises'],
      n_textoGrande: ['110 %', '125 %', '150 %'],
      n_espaciado: ['Espaciado ligero', 'Espaciado medio', 'Espaciado amplio'],
      n_alineacion: ['Izquierda', 'Centrado', 'Justificado'],

      // Modal de estructura
      estructuraTitulo: 'Estructura de la página',
      encabezados: 'Encabezados',
      regiones: 'Regiones',
      enlacesLista: 'Enlaces',
      vacio: 'No se encontró ninguno.',
      irA: 'Ir a este elemento',

      // Lectura en voz alta
      lecturaActiva: 'Lectura activa: haga clic en un texto para escucharlo.',
      lecturaNoDisponible: 'Este navegador no puede leer en voz alta.',
    },

    en: {
      abrir: 'Open accessibility menu',
      cerrar: 'Close accessibility menu',
      titulo: 'Accessibility menu',
      idioma: 'Language',
      perfiles: 'Profiles',
      ajustes: 'Individual settings',
      restablecer: 'Reset all',
      declaracion: 'Accessibility statement',
      activado: 'on',
      desactivado: 'off',
      nivel: 'level',
      de: 'of',
      atajoAviso: 'Shortcut: Alt + A',

      p_motora: 'Motor impairment',
      p_motora_d: 'Large cursor, highlighted focus, animations stopped',
      p_ceguera: 'Blindness',
      p_ceguera_d: 'Read aloud and highlighted focus',
      p_daltonismo: 'Color blindness',
      p_daltonismo_d: 'Higher saturation to separate colors',
      p_dislexia: 'Dyslexia',
      p_dislexia_d: 'Readable font and wider letter spacing',
      p_bajaVision: 'Low vision',
      p_bajaVision_d: 'Larger text and high contrast',
      p_cognitivo: 'Cognitive and learning',
      p_cognitivo_d: 'Reading guide and highlighted links',
      p_epilepsia: 'Epilepsy',
      p_epilepsia_d: 'Animations stopped and lower saturation',
      p_tdah: 'ADHD',
      p_tdah_d: 'Reading mask and animations stopped',

      f_lectura: 'Read aloud',
      f_contraste: 'Contrast',
      f_saturacion: 'Saturation',
      f_textoGrande: 'Bigger text',
      f_espaciado: 'Text spacing',
      f_enlaces: 'Highlight links',
      f_dislexia: 'Dyslexia font',
      f_cursor: 'Big cursor',
      f_tooltips: 'Show descriptions',
      f_estructura: 'Page structure',
      f_animaciones: 'Pause animations',
      f_guia: 'Reading guide',
      f_mascara: 'Reading mask',
      f_imagenes: 'Hide images',
      f_alineacion: 'Text align',
      f_foco: 'Highlight focus',

      n_contraste: ['High contrast', 'Dark mode', 'Light mode'],
      n_saturacion: ['Low saturation', 'High saturation', 'Grayscale'],
      n_textoGrande: ['110%', '125%', '150%'],
      n_espaciado: ['Light spacing', 'Medium spacing', 'Wide spacing'],
      n_alineacion: ['Left', 'Center', 'Justified'],

      estructuraTitulo: 'Page structure',
      encabezados: 'Headings',
      regiones: 'Landmarks',
      enlacesLista: 'Links',
      vacio: 'None found.',
      irA: 'Go to this element',

      lecturaActiva: 'Reading is on: click any text to hear it.',
      lecturaNoDisponible: 'This browser cannot read aloud.',
    },
  };

  let idioma = (function () {
    if (CONFIG.idioma !== 'auto') return CONFIG.idioma;
    const lang = (document.documentElement.lang || 'es').slice(0, 2).toLowerCase();
    return TEXTOS[lang] ? lang : 'es';
  })();

  const t = (clave) => (TEXTOS[idioma] && TEXTOS[idioma][clave]) || TEXTOS.es[clave] || clave;

  /* =========================================================================
   * 3. COLOR — cálculo de contraste según WCAG y corrección automática
   * ========================================================================= */

  /** '#abc' o '#aabbcc' a [r, g, b] en 0-255. */
  function hexARgb(hex) {
    let h = String(hex).trim().replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function rgbAHex(rgb) {
    return '#' + rgb.map((c) => {
      const v = Math.max(0, Math.min(255, Math.round(c))).toString(16);
      return v.length === 1 ? '0' + v : v;
    }).join('');
  }

  /**
   * Canal sRGB a lineal. El umbral es 0.03928 y no 0.04045 porque ese es el
   * valor que escribe literalmente el criterio de la WCAG: acá interesa
   * coincidir con la norma contra la que alguien va a auditar el sitio, no con
   * la especificación de sRGB, que difiere en el quinto decimal.
   */
  function canalLineal(c) {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  }

  /** Luminancia relativa, 0 (negro) a 1 (blanco). */
  function luminancia(rgb) {
    return 0.2126 * canalLineal(rgb[0])
         + 0.7152 * canalLineal(rgb[1])
         + 0.0722 * canalLineal(rgb[2]);
  }

  /** Razón de contraste entre dos colores hexadecimales. 1:1 a 21:1. */
  function contraste(hexA, hexB) {
    const a = luminancia(hexARgb(hexA));
    const b = luminancia(hexARgb(hexB));
    const claro = Math.max(a, b);
    const oscuro = Math.min(a, b);
    return (claro + 0.05) / (oscuro + 0.05);
  }

  function rgbAHsl(rgb) {
    const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return [h, s, l];
  }

  function hslARgb(hsl) {
    const h = hsl[0], s = hsl[1], l = hsl[2];
    if (s === 0) return [l * 255, l * 255, l * 255];
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const canal = (tt) => {
      let x = tt;
      if (x < 0) x += 1;
      if (x > 1) x -= 1;
      if (x < 1 / 6) return p + (q - p) * 6 * x;
      if (x < 1 / 2) return q;
      if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
      return p;
    };
    return [canal(h + 1 / 3) * 255, canal(h) * 255, canal(h - 1 / 3) * 255];
  }

  /**
   * Devuelve `frente` si ya alcanza el contraste pedido contra `fondo`, y si no
   * lo oscurece o lo aclara lo mínimo necesario, conservando su tono.
   *
   * La dirección la decide el fondo: sobre un fondo claro hay que oscurecer,
   * sobre uno oscuro aclarar. Avanza en pasos de 1 % de luminosidad HSL y se
   * detiene en cuanto cumple, así el color sigue siendo reconociblemente el de
   * la marca en vez de saltar a negro o blanco.
   */
  function asegurarContraste(frente, fondo, minimo) {
    const min = minimo || 4.5;
    if (contraste(frente, fondo) >= min) return frente;

    const haciaOscuro = luminancia(hexARgb(fondo)) > 0.5;
    const hsl = rgbAHsl(hexARgb(frente));

    for (let paso = 1; paso <= 100; paso++) {
      const l = haciaOscuro
        ? Math.max(0, hsl[2] - paso / 100)
        : Math.min(1, hsl[2] + paso / 100);
      const candidato = rgbAHex(hslARgb([hsl[0], hsl[1], l]));
      if (contraste(candidato, fondo) >= min) return candidato;
      if (l === 0 || l === 1) break;
    }
    // Último recurso: el extremo que más contraste da.
    return haciaOscuro ? '#000000' : '#ffffff';
  }

  // Paleta efectiva, ya corregida. Cada par se valida contra el fondo real
  // sobre el que se va a pintar.
  const P = (function () {
    const panel = CONFIG.colorPanel;
    const primario = CONFIG.colorPrimario;

    return {
      panel: panel,
      primario: primario,
      // Texto sobre el panel.
      texto: asegurarContraste(CONFIG.colorTexto, panel, 4.5),
      // Texto sobre el color primario (encabezado y botón flotante).
      sobrePrimario: contraste('#ffffff', primario) >= 4.5
        ? '#ffffff'
        : asegurarContraste(CONFIG.colorTexto, primario, 4.5),
      // El secundario como TEXTO necesita 4.5:1 contra el panel; como borde o
      // relleno no, pero se corrige igual para poder usarlo en ambos lugares.
      secundario: asegurarContraste(CONFIG.colorSecundario, panel, 4.5),
      // El secundario sin corregir sirve para hover de fondo, donde no hay
      // texto encima y el criterio que aplica es 3:1 de componente.
      secundarioFondo: CONFIG.colorSecundario,
      // Gris de apoyo, siempre legible.
      apoyo: asegurarContraste('#667487', panel, 4.5),
      borde: '#d3e0ee',
    };
  })();

  /* =========================================================================
   * 4. ESTADO — un nivel por función, persistido en localStorage
   * ========================================================================= */

  /** { idFuncion: nivel }. Nivel 0 o ausente significa apagado. */
  let estado = {};

  function cargarEstado() {
    try {
      const crudo = window.localStorage.getItem(CLAVE_ALMACEN);
      if (!crudo) return {};
      const datos = JSON.parse(crudo);
      if (datos && typeof datos === 'object') {
        if (typeof datos.idioma === 'string' && TEXTOS[datos.idioma]) {
          idioma = datos.idioma;
        }
        return datos.funciones && typeof datos.funciones === 'object' ? datos.funciones : {};
      }
    } catch (e) {
      // Modo privado, almacenamiento lleno o bloqueado por el navegador. El
      // widget funciona igual, solo no recuerda las preferencias.
    }
    return {};
  }

  function guardarEstado() {
    try {
      window.localStorage.setItem(
        CLAVE_ALMACEN,
        JSON.stringify({ funciones: estado, idioma: idioma })
      );
    } catch (e) {
      // Ídem: no recordar es degradar, no fallar.
    }
  }

  /* =========================================================================
   * 5. HOJAS DE ESTILO — por CSSOM, con respaldo a <style>
   * ========================================================================= */

  function crearHoja(css, destino) {
    try {
      const hoja = new CSSStyleSheet();
      hoja.replaceSync(css);
      destino.adoptedStyleSheets = destino.adoptedStyleSheets.concat([hoja]);
      return hoja;
    } catch (e) {
      // Sin hojas construibles. Un <style> puede quedar bloqueado por una
      // política de seguridad estricta, pero es la única alternativa y en esos
      // navegadores la política rara vez está en juego.
      const el = document.createElement('style');
      el.textContent = css;
      (destino === document ? document.head : destino).appendChild(el);
      return null;
    }
  }

  /* =========================================================================
   * 6. CSS GLOBAL DE EFECTOS
   *
   * REGLA INVIOLABLE DE ESTA SECCIÓN: todo selector lleva `body` como ancestro.
   * El host del widget cuelga de <html>, no de <body>, así que esa sola
   * disciplina lo mantiene fuera de todos los efectos sin un solo :not().
   * ========================================================================= */

  const CSS_GLOBAL = `
    /* --- Filtros de imagen: contraste y saturación ---------------------------
       Los dos se componen en una sola variable porque dos reglas de filtro
       sobre el mismo elemento no se suman: la última gana y la otra se
       pierde en silencio. */
    html[data-a11yw-filtro] body {
      filter: var(--a11yw-filtro, none);
    }

    /* Modo oscuro por reglas de color, NO invirtiendo el documento.
       La inversión es el truco corto y falla justo donde más se nota: un sitio
       que ya tiene secciones de fondo oscuro las vuelve claras —queda más
       brillante que antes, que es lo contrario de lo pedido— y deja todas las
       fotografías en negativo. Forzar los colores es predecible y no toca las
       imágenes. */
    html.a11yw-contraste-2 body,
    html.a11yw-contraste-2 body * {
      background-color: #121212 !important;
      color: #e9e9e9 !important;
      border-color: #4a4a4a !important;
    }
    html.a11yw-contraste-2 body a,
    html.a11yw-contraste-2 body a * {
      color: #8ab4f8 !important;
    }
    html.a11yw-contraste-2 body img,
    html.a11yw-contraste-2 body video,
    html.a11yw-contraste-2 body canvas {
      background: transparent !important;
    }

    /* Contraste alto: no alcanza con un filtro, hay que forzar los colores. */
    html.a11yw-contraste-1 body,
    html.a11yw-contraste-1 body * {
      background-color: #000 !important;
      color: #fff !important;
      border-color: #fff !important;
    }
    html.a11yw-contraste-1 body a,
    html.a11yw-contraste-1 body a * {
      color: #ffff00 !important;
    }
    html.a11yw-contraste-1 body img,
    html.a11yw-contraste-1 body video {
      background: transparent !important;
    }

    /* Modo claro forzado. */
    html.a11yw-contraste-3 body,
    html.a11yw-contraste-3 body * {
      background-color: #fff !important;
      color: #121212 !important;
    }
    html.a11yw-contraste-3 body a,
    html.a11yw-contraste-3 body a * {
      color: #00439c !important;
    }

    /* --- Espaciado de texto -------------------------------------------------
       El nivel 3 usa exactamente los valores del criterio WCAG 1.4.12: alto de
       línea 1.5, separación entre párrafos 2em, entre letras 0.12em y entre
       palabras 0.16em. No son números elegidos a gusto. */
    html.a11yw-espaciado-1 body * {
      line-height: 1.4 !important;
      letter-spacing: 0.04em !important;
      word-spacing: 0.06em !important;
    }
    html.a11yw-espaciado-2 body * {
      line-height: 1.5 !important;
      letter-spacing: 0.08em !important;
      word-spacing: 0.1em !important;
    }
    html.a11yw-espaciado-3 body * {
      line-height: 1.5 !important;
      letter-spacing: 0.12em !important;
      word-spacing: 0.16em !important;
    }
    html.a11yw-espaciado-3 body p {
      margin-bottom: 2em !important;
    }

    /* --- Resaltar enlaces --------------------------------------------------- */
    html.a11yw-enlaces-1 body a,
    html.a11yw-enlaces-1 body button,
    html.a11yw-enlaces-1 body [role="button"],
    html.a11yw-enlaces-1 body [role="link"] {
      text-decoration: underline !important;
      text-underline-offset: 3px !important;
      outline: 2px solid #ffbf00 !important;
      outline-offset: 2px !important;
    }

    /* --- Fuente para dislexia ----------------------------------------------
       OpenDyslexic no se puede descargar: sin dependencias externas no hay de
       dónde traerla, y una política con font-src 'self' tampoco lo permitiría.
       Con local() se usa si la persona la tiene instalada en su equipo; si no,
       cae a Verdana, que ya separa mejor los caracteres que la mayoría de las
       fuentes de marca. */
    @font-face {
      font-family: 'A11ywDislexia';
      src: local('OpenDyslexic'), local('OpenDyslexic Regular'),
           local('Atkinson Hyperlegible'), local('Verdana');
      font-display: swap;
    }
    html.a11yw-dislexia-1 body,
    html.a11yw-dislexia-1 body * {
      font-family: 'A11ywDislexia', 'Atkinson Hyperlegible', Verdana, Tahoma, sans-serif !important;
    }

    /* --- Cursor grande -----------------------------------------------------
       El SVG va como data URI, que se evalúa contra img-src. Con img-src
       'self' esta regla no se aplica y la función queda sin efecto; el resto
       del widget no se ve afectado. */
    html.a11yw-cursor-1 body,
    html.a11yw-cursor-1 body * {
      cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M8 4l26 16-11 2 7 13-5 3-7-13-10 7z' fill='%23fff' stroke='%23000' stroke-width='2.5'/%3E%3C/svg%3E") 6 4, auto !important;
    }
    html.a11yw-cursor-1 body a,
    html.a11yw-cursor-1 body button,
    html.a11yw-cursor-1 body [role="button"] {
      cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Cpath d='M18 4c-2 0-3 1-3 3v18l-4-4c-2-2-5-2-6 1l8 17c1 2 3 3 5 3h13c3 0 5-2 5-5V19c0-2-1-3-3-3s-3 1-3 3v-2c0-2-1-3-3-3s-3 1-3 3v-1c0-2-1-3-3-3s-3 1-3 3V7c0-2-1-3-3-3z' fill='%23fff' stroke='%23000' stroke-width='2.5'/%3E%3C/svg%3E") 12 4, pointer !important;
    }

    /* --- Pausar animaciones ------------------------------------------------- */
    html.a11yw-animaciones-1 body,
    html.a11yw-animaciones-1 body *,
    html.a11yw-animaciones-1 body *::before,
    html.a11yw-animaciones-1 body *::after {
      animation-play-state: paused !important;
      animation: none !important;
      transition: none !important;
      scroll-behavior: auto !important;
    }

    /* --- Ocultar imágenes --------------------------------------------------
       Se vacía el hueco en vez de dejarlo en blanco, y los fondos decorativos
       también se quitan: media página gris tampoco ayuda a leer. */
    html.a11yw-imagenes-1 body img,
    html.a11yw-imagenes-1 body picture,
    html.a11yw-imagenes-1 body video,
    html.a11yw-imagenes-1 body iframe {
      visibility: hidden !important;
    }
    html.a11yw-imagenes-1 body * {
      background-image: none !important;
    }

    /* --- Alineación de texto ----------------------------------------------- */
    html.a11yw-alineacion-1 body p,
    html.a11yw-alineacion-1 body li,
    html.a11yw-alineacion-1 body h1,
    html.a11yw-alineacion-1 body h2,
    html.a11yw-alineacion-1 body h3 { text-align: left !important; }

    html.a11yw-alineacion-2 body p,
    html.a11yw-alineacion-2 body li,
    html.a11yw-alineacion-2 body h1,
    html.a11yw-alineacion-2 body h2,
    html.a11yw-alineacion-2 body h3 { text-align: center !important; }

    html.a11yw-alineacion-3 body p,
    html.a11yw-alineacion-3 body li { text-align: justify !important; }

    /* --- Resaltar el foco -------------------------------------------------- */
    html.a11yw-foco-1 body *:focus,
    html.a11yw-foco-1 body *:focus-visible {
      outline: 4px solid #ffbf00 !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 8px rgba(0, 0, 0, 0.45) !important;
    }

    /* --- Zoom de texto ----------------------------------------------------
       Se toca font-size en <html> y no la propiedad zoom ni una transformación
       de escala: así crece todo
       lo que esté dimensionado en rem o em, que es lo que hay que crecer, y no
       las cajas fijas ni las imágenes, que es lo que rompería el layout.
       El panel del widget no crece porque fija su propio font-size en px. */
    html.a11yw-texto-1 { font-size: 110% !important; }
    html.a11yw-texto-2 { font-size: 125% !important; }
    html.a11yw-texto-3 { font-size: 150% !important; }

    /* Reflujo al agrandar el texto.
       Agrandar la tipografía sin más deja al sitio con barra horizontal: los
       menús se maquetan en una fila que no envuelve, y al crecer las palabras
       la fila se pasa del ancho de la pantalla. Eso incumple el criterio WCAG
       1.4.10, que pide que no haya que desplazarse en los dos ejes a la vez, y
       convierte la función en un problema en lugar de una ayuda.

       La regla se aplica a TODOS los elementos y no a una lista de etiquetas y
       nombres de clase: adivinar que el menú se llama «nav» o «menu» funciona
       en un sitio y falla en el siguiente, y acá la fila que se desbordaba era
       la del teléfono y el correo del pie, que no se llama de ninguna de las
       dos formas. Poner flex-wrap en un elemento que no es contenedor flex no
       tiene ningún efecto, así que aplicarlo a todo es seguro y además es lo
       único que cubre un sitio que no se conoce de antemano. */
    html[class*="a11yw-texto-"] body * {
      flex-wrap: wrap !important;
      max-width: 100% !important;
      overflow-wrap: break-word !important;
      /* Un hijo de flex o de grid trae min-width: auto, que le impide encogerse
         por debajo de su contenido y es la causa más común de que una fila se
         pase del ancho en vez de partirse. */
      min-width: 0 !important;
    }

    /* Las rejillas en rem son el otro caso, y flex-wrap no las toca porque no
       son flex: un minmax de 21rem pide 21 veces el tamaño de letra, así
       que al 150 % reclama 343px dentro de una columna de 230 y se sale. Las
       listas maquetadas como rejilla pasan a una sola columna, que es
       exactamente lo que hace un reflujo cuando deja de haber sitio. */
    html[class*="a11yw-texto-"] body ul,
    html[class*="a11yw-texto-"] body ol {
      grid-template-columns: minmax(0, 1fr) !important;
    }
    /* Las tablas y el contenido ancho de verdad se desplazan dentro de su
       propia caja, que es la salida que el criterio sí admite. */
    html[class*="a11yw-texto-"] body table {
      display: block !important;
      overflow-x: auto !important;
    }

    /* NO se recorta el desborde con overflow-x: clip, aunque quite la barra
       horizontal de un plumazo. Se probó y lo que quedaba cortado contra el
       borde eran el teléfono y el correo del pie: cambiar una barra molesta por
       contenido que desaparece incumple el criterio 1.4.4, que pide agrandar el
       texto SIN perder contenido ni funciones. Envolver deja la página más
       alta; recortar deja al lector sin el teléfono. */

    /* --- Guía y máscara de lectura ----------------------------------------- */
    .a11yw-guia-linea {
      position: fixed;
      left: 0;
      width: 100%;
      height: 0;
      border-top: 4px solid #01509C;
      border-bottom: 4px solid #ffbf00;
      pointer-events: none;
      z-index: 2147483640;
    }
    .a11yw-mascara-parte {
      position: fixed;
      left: 0;
      width: 100%;
      background: rgba(0, 0, 0, 0.72);
      pointer-events: none;
      z-index: 2147483640;
    }

    /* --- Descripciones al pasar el puntero o al enfocar -------------------- */
    .a11yw-tooltip {
      position: fixed;
      z-index: 2147483641;
      max-width: 320px;
      padding: 8px 12px;
      border-radius: 8px;
      background: #152238;
      color: #ffffff;
      font: 500 14px/1.45 system-ui, sans-serif;
      pointer-events: none;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    }
  `;

  /* =========================================================================
   * 7. CSS DEL PANEL — vive en el shadow root, aislado del sitio
   * ========================================================================= */

  const ladoPanel = CONFIG.posicion === 'izquierda' ? 'left' : 'right';

  const CSS_PANEL = `
    :host {
      /* font-size en px y no en rem: corta la herencia del zoom de texto, así
         el panel no crece junto con el sitio y sigue entrando en pantalla. */
      font-size: 16px;
      font-family: ${CONFIG.fuente};
      line-height: 1.5;
      color: ${P.texto};
      -webkit-font-smoothing: antialiased;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    button { font: inherit; color: inherit; background: none; border: none; cursor: pointer; }

    /* Foco visible propio y generoso: el widget no puede depender del foco del
       sitio, que puede estar anulado con outline:none. */
    :where(button, a, select):focus-visible {
      outline: 3px solid ${P.secundario};
      outline-offset: 2px;
      border-radius: 6px;
    }

    /* --- Botón flotante ---------------------------------------------------
       Tamaño y posición se pueden fijar desde el sitio con las propiedades
       --a11yw-lanzador-*: las propiedades personalizadas son lo único del CSS
       del sitio que atraviesa el shadow root, y así el botón se alinea con
       los otros flotantes de la página sin que este archivo sepa cuáles son.
       Sin ellas valen los valores de acá. */
    .lanzador {
      position: fixed;
      left: var(--a11yw-lanzador-left, ${ladoPanel === 'left' ? '20px' : 'auto'});
      right: var(--a11yw-lanzador-right, ${ladoPanel === 'right' ? '20px' : 'auto'});
      bottom: var(--a11yw-lanzador-bottom, 20px);
      width: var(--a11yw-lanzador-tamano, 56px);
      height: var(--a11yw-lanzador-tamano, 56px);
      border-radius: 50%;
      background: ${P.primario};
      color: ${P.sobrePrimario};
      display: grid;
      place-items: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.28);
      z-index: 2147483645;
      transition: transform 0.18s ease, background-color 0.18s ease;
    }
    .lanzador:hover { background: ${P.secundarioFondo}; transform: scale(1.06); }
    /* En proporción al botón: 30px sobre los 56 por defecto. */
    .lanzador svg { width: 54%; height: 54%; display: block; }

    /* --- Panel ------------------------------------------------------------- */
    .panel {
      position: fixed;
      ${ladoPanel}: 0;
      top: 0;
      width: 400px;
      max-width: 100vw;
      height: 100vh;
      height: 100dvh;
      background: ${P.panel};
      display: flex;
      flex-direction: column;
      box-shadow: 0 0 40px rgba(0, 0, 0, 0.3);
      z-index: 2147483646;
      transform: translateX(${ladoPanel === 'right' ? '100%' : '-100%'});
      transition: transform 0.26s ease;
      visibility: hidden;
    }
    .panel[data-abierto="si"] { transform: translateX(0); visibility: visible; }

    /* Pantalla completa en móvil: 400px sobre 360 de ancho no es un panel, es
       una pared. */
    @media (max-width: 480px) {
      .panel { width: 100vw; }
    }

    /* --- Encabezado -------------------------------------------------------- */
    .cabecera {
      background: ${P.primario};
      color: ${P.sobrePrimario};
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .cabecera h2 { font-size: 17px; font-weight: 700; flex: 1; }
    .cabecera select {
      font: inherit;
      font-size: 14px;
      padding: 6px 8px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.14);
      color: ${P.sobrePrimario};
      min-height: 44px;
    }
    .cabecera select option { color: #152238; background: #fff; }
    .cerrar {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: grid;
      place-items: center;
      flex-shrink: 0;
    }
    .cerrar:hover { background: rgba(255, 255, 255, 0.2); }
    .cerrar svg { width: 22px; height: 22px; }

    /* --- Cuerpo ------------------------------------------------------------ */
    .cuerpo { flex: 1; overflow-y: auto; padding: 16px; }
    .cuerpo h3 {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: ${P.apoyo};
      margin: 4px 0 10px;
    }
    .cuerpo h3:not(:first-child) { margin-top: 24px; }

    /* --- Perfiles ---------------------------------------------------------- */
    .perfiles { display: flex; flex-direction: column; gap: 8px; }
    .perfil {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      min-height: 60px;
      padding: 10px 12px;
      text-align: left;
      border: 2px solid ${P.borde};
      border-radius: ${CONFIG.radio};
      background: ${P.panel};
      transition: border-color 0.16s ease, background-color 0.16s ease;
    }
    .perfil:hover { border-color: ${P.secundario}; }
    .perfil[aria-pressed="true"] {
      border-color: ${P.primario};
      background: color-mix(in srgb, ${P.primario} 8%, ${P.panel});
    }
    .perfil .textos { flex: 1; min-width: 0; }
    .perfil .nombre { font-size: 15px; font-weight: 600; display: block; }
    .perfil .desc { font-size: 12.5px; color: ${P.apoyo}; display: block; }

    /* Interruptor. Es un dibujo, no un input: el estado real lo lleva
       aria-pressed en el botón que lo contiene. */
    .llave {
      width: 44px;
      height: 26px;
      border-radius: 999px;
      background: ${P.borde};
      flex-shrink: 0;
      position: relative;
      transition: background-color 0.16s ease;
    }
    .llave::after {
      content: "";
      position: absolute;
      top: 3px;
      left: 3px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      transition: transform 0.16s ease;
    }
    .perfil[aria-pressed="true"] .llave { background: ${P.primario}; }
    .perfil[aria-pressed="true"] .llave::after { transform: translateX(18px); }

    /* --- Cuadrícula de funciones ------------------------------------------- */
    .rejilla {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }
    .tarjeta {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      gap: 6px;
      /* 44px de lado mínimo por el criterio 2.5.8 de tamaño de objetivo. */
      min-height: 104px;
      padding: 12px 8px;
      border: 2px solid ${P.borde};
      border-radius: ${CONFIG.radio};
      background: ${P.panel};
      text-align: center;
      transition: border-color 0.16s ease, background-color 0.16s ease;
    }
    .tarjeta:hover { border-color: ${P.secundario}; }
    .tarjeta[aria-pressed="true"] {
      border-color: ${P.primario};
      background: color-mix(in srgb, ${P.primario} 8%, ${P.panel});
    }
    .tarjeta svg { width: 26px; height: 26px; color: ${P.primario}; flex-shrink: 0; }
    .tarjeta .nombre { font-size: 13px; font-weight: 600; line-height: 1.3; }
    .tarjeta .estado { font-size: 11.5px; color: ${P.apoyo}; }
    .tarjeta[aria-pressed="true"] .estado { color: ${P.secundario}; font-weight: 600; }

    /* Indicadores de paso para las funciones con niveles. */
    .pasos { display: flex; gap: 4px; }
    .pasos i {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: ${P.borde};
    }
    .pasos i[data-lleno="si"] { background: ${P.primario}; }

    /* --- Pie --------------------------------------------------------------- */
    .pie {
      flex-shrink: 0;
      padding: 12px 16px;
      border-top: 1px solid ${P.borde};
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .restablecer {
      width: 100%;
      min-height: 46px;
      border-radius: ${CONFIG.radio};
      background: ${P.primario};
      color: ${P.sobrePrimario};
      font-size: 15px;
      font-weight: 600;
      transition: background-color 0.16s ease;
    }
    .restablecer:hover { background: ${P.secundarioFondo}; }
    .pie a { font-size: 12.5px; color: ${P.secundario}; text-align: center; }
    .pie .atajo { font-size: 11.5px; color: ${P.apoyo}; text-align: center; }

    /* --- Modal de estructura ---------------------------------------------- */
    .velo {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.55);
      z-index: 2147483647;
      display: none;
      place-items: center;
      padding: 20px;
    }
    .velo[data-abierto="si"] { display: grid; }
    .modal {
      background: ${P.panel};
      border-radius: ${CONFIG.radio};
      width: min(560px, 100%);
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .modal .cabecera h2 { font-size: 16px; }
    .modal .lista { overflow-y: auto; padding: 12px 16px 16px; }
    .modal .lista button {
      display: block;
      width: 100%;
      text-align: left;
      padding: 9px 10px;
      min-height: 44px;
      border-radius: 8px;
      font-size: 14px;
      border-bottom: 1px solid ${P.borde};
    }
    .modal .lista button:hover { background: color-mix(in srgb, ${P.primario} 8%, ${P.panel}); }
    .modal .lista button .marca {
      font-size: 11px;
      font-weight: 700;
      color: ${P.secundario};
      margin-right: 8px;
    }
    .modal .lista p { font-size: 13.5px; color: ${P.apoyo}; padding: 8px 0; }

    /* --- Aviso ------------------------------------------------------------- */
    .aviso {
      margin-top: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      background: color-mix(in srgb, ${P.primario} 10%, ${P.panel});
      font-size: 13px;
      color: ${P.texto};
    }
    .aviso[hidden] { display: none; }

    /* Región para anunciar cambios a un lector de pantalla real. */
    .anuncio {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    /* Quien pidió menos movimiento no pidió ninguna excepción para este
       widget. */
    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; animation: none !important; }
    }
  `;

  /* =========================================================================
   * 8. ICONOS — SVG propios, dibujados para este widget
   * ========================================================================= */

  const svg = (cuerpo, relleno) =>
    `<svg viewBox="0 0 24 24" fill="${relleno ? 'currentColor' : 'none'}" stroke="currentColor" ` +
    `stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ` +
    `focusable="false">${cuerpo}</svg>`;

  const ICONOS = {
    // Figura humana con los brazos abiertos dentro de un círculo. Es el signo
    // convencional de accesibilidad, dibujado acá y no copiado.
    accesibilidad: svg(
      '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="6.6" r="1.5" fill="currentColor" stroke="none"/>' +
      '<path d="M5.9 9.3c3.9 1.2 8.3 1.2 12.2 0"/><path d="M12 9.8v4.4"/>' +
      '<path d="M12 14.2l-2.3 4.6"/><path d="M12 14.2l2.3 4.6"/>'
    ),
    cerrar: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
    lectura: svg('<path d="M11 5L6 9H3v6h3l5 4V5z"/><path d="M15.5 8.5a5 5 0 010 7"/><path d="M18.5 6a8.5 8.5 0 010 12"/>'),
    contraste: svg('<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 000-18z" fill="currentColor" stroke="none"/>'),
    saturacion: svg('<path d="M12 3l5.7 5.7a8 8 0 11-11.4 0L12 3z"/>'),
    textoGrande: svg('<path d="M3 19l5.5-14L14 19"/><path d="M5 14h7"/><path d="M15 19l3.5-9 3.5 9"/><path d="M16.2 16h4.6"/>'),
    espaciado: svg('<path d="M3 5h18M3 12h18M3 19h18"/><path d="M6.5 8.5L4 11l2.5 2.5"/><path d="M17.5 8.5L20 11l-2.5 2.5"/>'),
    enlaces: svg('<path d="M10 13a4 4 0 005.7 0l2.6-2.6a4 4 0 00-5.7-5.7l-1.2 1.2"/><path d="M14 11a4 4 0 00-5.7 0l-2.6 2.6a4 4 0 005.7 5.7l1.2-1.2"/>'),
    dislexia: svg('<path d="M4 18V7a3 3 0 013-3h3v14"/><path d="M14 4h3a3 3 0 013 3v11"/><path d="M10 11h4"/>'),
    cursor: svg('<path d="M5 3l14 9-6 1.2 3.4 6.6-2.6 1.4-3.4-6.6L6 19z"/>'),
    tooltips: svg('<path d="M21 12a9 9 0 11-4.2-7.6"/><path d="M12 8h.01"/><path d="M11.5 11.5h1v5h-1z" fill="currentColor" stroke="none"/>'),
    estructura: svg('<path d="M4 5h16"/><path d="M4 12h10"/><path d="M4 19h13"/><circle cx="19" cy="12" r="1.6"/>'),
    animaciones: svg('<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>'),
    guia: svg('<path d="M2 12h20"/><path d="M8 8l4-4 4 4"/><path d="M8 16l4 4 4-4"/>'),
    mascara: svg('<rect x="2.5" y="4" width="19" height="16" rx="2"/><path d="M2.5 10h19M2.5 14h19"/>'),
    imagenes: svg('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 17l5-5 4 4 3-3 6 6"/><path d="M4 4l16 16"/>'),
    alineacion: svg('<path d="M4 6h16"/><path d="M4 12h10"/><path d="M4 18h16"/>'),
    foco: svg('<circle cx="12" cy="12" r="3.2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="8.4" stroke-dasharray="3 3"/>'),
  };

  /* =========================================================================
   * 9. UTILIDADES DE APLICACIÓN
   * ========================================================================= */

  const raiz = document.documentElement;

  /** Deja en <html> exactamente la clase del nivel pedido y quita las demás. */
  function aplicarClaseNivel(base, nivel, maximo) {
    for (let i = 1; i <= maximo; i++) raiz.classList.remove(`a11yw-${base}-${i}`);
    if (nivel > 0) raiz.classList.add(`a11yw-${base}-${nivel}`);
  }

  /**
   * Compone contraste y saturación en una sola declaración `filter`.
   * Dos reglas separadas no se acumulan: la de mayor especificidad gana y la
   * otra se descarta en silencio, que es justo el tipo de fallo que después
   * cuesta encontrar.
   */
  function recomponerFiltro() {
    const partes = [];

    // El contraste ya no participa del filtro: sus tres niveles se resuelven
    // con reglas de color, que son predecibles y no tocan las fotografías.
    // Acá solo queda la saturación, que sí necesita un filtro de verdad.
    if (estado.saturacion === 1) partes.push('saturate(0.5)');
    if (estado.saturacion === 2) partes.push('saturate(1.8)');
    if (estado.saturacion === 3) partes.push('grayscale(1)');

    if (partes.length) {
      raiz.style.setProperty('--a11yw-filtro', partes.join(' '));
      raiz.setAttribute('data-a11yw-filtro', 'si');
    } else {
      raiz.style.removeProperty('--a11yw-filtro');
      raiz.removeAttribute('data-a11yw-filtro');
    }
  }

  /* =========================================================================
   * 10. CATÁLOGO DE FUNCIONES
   *
   * Cada una declara cuántos niveles tiene y qué hace al cambiar de nivel.
   * `niveles: 1` es un interruptor; más de 1 rota y vuelve a apagado.
   * ========================================================================= */

  // --- Lectura en voz alta ---------------------------------------------------
  // No es un lector de pantalla y por eso no se llama así. Un lector de
  // pantalla navega la página, anuncia roles y estados y se maneja con su
  // propio teclado. Esto lee en voz alta el texto que se toca, que es útil,
  // pero llamarlo lector puede hacer creer que el sitio ya está cubierto sin
  // NVDA ni VoiceOver.
  const lectura = {
    activa: false,

    manejar(ev) {
      if (!lectura.activa) return;
      if (ev.target.closest && ev.target.closest('[data-a11yw-host]')) return;

      const texto = (ev.target.innerText || ev.target.textContent || '').trim();
      if (!texto) return;

      try {
        const voz = window.speechSynthesis;
        voz.cancel();
        const frase = new SpeechSynthesisUtterance(texto.slice(0, 3000));
        frase.lang = document.documentElement.lang || (idioma === 'en' ? 'en-US' : 'es-ES');
        voz.speak(frase);
      } catch (e) {
        // Sin síntesis de voz disponible: no hay nada que degradar.
      }
    },

    aplicar(nivel) {
      lectura.activa = nivel === 1;
      if (nivel === 1) {
        document.addEventListener('click', lectura.manejar, true);
      } else {
        document.removeEventListener('click', lectura.manejar, true);
        try { window.speechSynthesis.cancel(); } catch (e) { /* ídem */ }
      }
    },
  };

  // --- Guía de lectura: una línea que sigue el puntero ----------------------
  const guia = {
    el: null,
    mover(ev) {
      // Si la línea se quedó sin DOM, se vuelve a crear en el acto en lugar de
      // dejar de seguir al puntero en silencio. Misma razón que en tooltips.
      if (!guia.el || !guia.el.isConnected) guia.crear();
      guia.el.style.top = (ev.clientY - 4) + 'px';
    },
    crear() {
      guia.el = document.createElement('div');
      guia.el.className = 'a11yw-guia-linea';
      guia.el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(guia.el);
    },
    aplicar(nivel) {
      if (nivel === 1) {
        if (!guia.el || !guia.el.isConnected) guia.crear();
        document.addEventListener('mousemove', guia.mover);
      } else {
        document.removeEventListener('mousemove', guia.mover);
        if (guia.el) { guia.el.remove(); guia.el = null; }
      }
    },
  };

  // --- Máscara de lectura: oscurece todo menos una banda -------------------
  // Distinta de la guía, y a propósito: la guía marca el renglón, la máscara
  // borra lo demás. El perfil de TDAH pide la segunda.
  const mascara = {
    arriba: null,
    abajo: null,
    alto: 120,
    mover(ev) {
      // Igual que la guía: si las bandas perdieron el DOM se rehacen, en vez de
      // dejar la pantalla oscurecida a medias y sin respuesta.
      if (!mascara.arriba || !mascara.arriba.isConnected) mascara.crear();
      const y = ev.clientY;
      const mitad = mascara.alto / 2;
      mascara.arriba.style.top = '0px';
      mascara.arriba.style.height = Math.max(0, y - mitad) + 'px';
      mascara.abajo.style.top = (y + mitad) + 'px';
      mascara.abajo.style.height = Math.max(0, window.innerHeight - y - mitad) + 'px';
    },
    crear() {
      mascara.arriba = document.createElement('div');
      mascara.abajo = document.createElement('div');
      [mascara.arriba, mascara.abajo].forEach((el) => {
        el.className = 'a11yw-mascara-parte';
        el.setAttribute('aria-hidden', 'true');
        document.body.appendChild(el);
      });
      mascara.arriba.style.height = '0px';
      mascara.abajo.style.height = '0px';
    },
    aplicar(nivel) {
      if (nivel === 1) {
        if (!mascara.arriba || !mascara.arriba.isConnected) mascara.crear();
        document.addEventListener('mousemove', mascara.mover);
      } else {
        document.removeEventListener('mousemove', mascara.mover);
        if (mascara.arriba) { mascara.arriba.remove(); mascara.arriba = null; }
        if (mascara.abajo) { mascara.abajo.remove(); mascara.abajo = null; }
      }
    },
  };

  // --- Descripciones al pasar el puntero o al enfocar ----------------------
  const tooltips = {
    el: null,

    /** Devuelve el primer texto alternativo que el elemento realmente tenga. */
    describir(destino) {
      if (!destino || !destino.closest) return '';
      const el = destino.closest('img, a, button, [role="img"], [aria-label], [title], svg');
      if (!el) return '';
      if (el.closest('[data-a11yw-host]')) return '';
      return (
        el.getAttribute('aria-label') ||
        el.getAttribute('alt') ||
        el.getAttribute('title') ||
        ''
      ).trim();
    },

    mostrar(ev) {
      const texto = tooltips.describir(ev.target);
      if (!texto) { tooltips.ocultar(); return; }

      // `isConnected` además de la existencia de la referencia: si algo saca el
      // globo del DOM —una vista de la aplicación que se reemplaza, un script
      // del sitio que limpia el body— la referencia sigue apuntando a un nodo
      // huérfano. Comprobar solo `!tooltips.el` daría por bueno ese nodo y se
      // escribiría en un elemento que ya no está en ninguna pantalla: la
      // función quedaría muerta sin un solo error en la consola.
      if (!tooltips.el || !tooltips.el.isConnected) {
        tooltips.el = document.createElement('div');
        tooltips.el.className = 'a11yw-tooltip';
        tooltips.el.setAttribute('role', 'status');
        document.body.appendChild(tooltips.el);
      }
      tooltips.el.textContent = texto;

      // Posición: junto al puntero si vino del mouse, junto al elemento si vino
      // del teclado. Sin esto, la función solo serviría con mouse y dejaría
      // afuera justamente a quien navega con Tab.
      let x, y;
      if (typeof ev.clientX === 'number' && ev.clientX > 0) {
        x = ev.clientX + 14;
        y = ev.clientY + 16;
      } else {
        const caja = ev.target.getBoundingClientRect();
        x = caja.left;
        y = caja.bottom + 8;
      }
      const ancho = tooltips.el.offsetWidth || 200;
      const alto = tooltips.el.offsetHeight || 40;
      tooltips.el.style.left = Math.min(x, window.innerWidth - ancho - 10) + 'px';
      tooltips.el.style.top = Math.min(y, window.innerHeight - alto - 10) + 'px';
    },

    ocultar() {
      if (tooltips.el) { tooltips.el.remove(); tooltips.el = null; }
    },

    aplicar(nivel) {
      if (nivel === 1) {
        document.addEventListener('mouseover', tooltips.mostrar, true);
        document.addEventListener('focusin', tooltips.mostrar, true);
        document.addEventListener('mouseout', tooltips.ocultar, true);
        document.addEventListener('focusout', tooltips.ocultar, true);
      } else {
        document.removeEventListener('mouseover', tooltips.mostrar, true);
        document.removeEventListener('focusin', tooltips.mostrar, true);
        document.removeEventListener('mouseout', tooltips.ocultar, true);
        document.removeEventListener('focusout', tooltips.ocultar, true);
        tooltips.ocultar();
      }
    },
  };

  // --- Pausar animaciones --------------------------------------------------
  const animaciones = {
    congelados: [],

    /**
     * Los GIF no los detiene ningún CSS: su animación la lleva el decodificador
     * de imagen. Se tapa el <img> con un <canvas> que muestra el primer
     * fotograma, en lugar de reemplazar el `src` por un data URI, porque una
     * política con img-src 'self' bloquearía ese data URI y la imagen
     * desaparecería en vez de congelarse.
     */
    /**
     * ¿Esta imagen es un GIF? Mirar si el src termina en «.gif» no alcanza y
     * falla en los tres casos que más aparecen: una URL con parámetros
     * (`/foto.gif?v=2`), una imagen incrustada (`data:image/gif;base64,…`, que
     * no tiene ni un punto) y un servidor que entrega la imagen desde una ruta
     * sin extensión. Se mira la dirección realmente cargada —currentSrc, que es
     * la que gana cuando hay srcset— buscando la extensión en cualquier
     * posición o el tipo declarado.
     *
     * Límite conocido y asumido: un WebP o un APNG animados no se detectan.
     * Distinguirlos de sus versiones estáticas exige leer los bytes del
     * archivo, y congelar por las dudas todos los WebP del sitio reemplazaría
     * imágenes perfectamente quietas por un canvas, perdiendo srcset y el
     * ajuste al tamaño de pantalla. El daño sería mayor que el beneficio.
     */
    esGif(img) {
      const origen = (img.currentSrc || img.src || '').toLowerCase();
      return origen.includes('.gif') || origen.includes('image/gif');
    },

    congelarGifs() {
      const gifs = Array.prototype.filter.call(
        document.querySelectorAll('img'),
        (img) => animaciones.esGif(img)
      );
      gifs.forEach((img) => {
        if (img.closest('[data-a11yw-host]') || img.dataset.a11ywCongelado) return;
        const ancho = img.naturalWidth || img.width;
        const alto = img.naturalHeight || img.height;
        if (!ancho || !alto) return;

        try {
          const lienzo = document.createElement('canvas');
          lienzo.width = ancho;
          lienzo.height = alto;
          lienzo.getContext('2d').drawImage(img, 0, 0);

          const estilo = window.getComputedStyle(img);
          lienzo.style.width = estilo.width;
          lienzo.style.height = estilo.height;
          lienzo.setAttribute('aria-hidden', 'true');
          lienzo.dataset.a11ywLienzo = 'si';

          img.after(lienzo);
          img.style.display = 'none';
          img.dataset.a11ywCongelado = 'si';
          animaciones.congelados.push({ img: img, lienzo: lienzo });
        } catch (e) {
          // Un GIF de otro origen sin CORS no se puede dibujar. Se deja andando:
          // es preferible a una imagen vacía.
        }
      });
    },

    descongelarGifs() {
      animaciones.congelados.forEach((par) => {
        par.lienzo.remove();
        par.img.style.display = '';
        delete par.img.dataset.a11ywCongelado;
      });
      animaciones.congelados = [];
    },

    aplicar(nivel) {
      aplicarClaseNivel('animaciones', nivel, 1);
      const medios = document.querySelectorAll('video, audio');

      if (nivel === 1) {
        medios.forEach((m) => {
          if (m.closest('[data-a11yw-host]')) return;
          if (!m.paused) { m.pause(); m.dataset.a11ywPausado = 'si'; }
          m.removeAttribute('autoplay');
        });
        animaciones.congelarGifs();
      } else {
        medios.forEach((m) => {
          if (m.dataset.a11ywPausado) {
            delete m.dataset.a11ywPausado;
            const intento = m.play();
            if (intento && intento.catch) intento.catch(() => {});
          }
        });
        animaciones.descongelarGifs();
      }
    },
  };

  /** El catálogo. El orden de la cuadrícula lo fija CONFIG.funcionesActivas. */
  const FUNCIONES = {
    lectura: {
      icono: 'lectura', niveles: 1,
      aplicar: (n) => {
        lectura.aplicar(n);
        const puede = 'speechSynthesis' in window;
        mostrarAviso(n === 1 ? (puede ? t('lecturaActiva') : t('lecturaNoDisponible')) : '');
      },
    },
    contraste:   { icono: 'contraste',   niveles: 3, aplicar: (n) => { aplicarClaseNivel('contraste', n, 3); recomponerFiltro(); } },
    saturacion:  { icono: 'saturacion',  niveles: 3, aplicar: () => recomponerFiltro() },
    textoGrande: { icono: 'textoGrande', niveles: 3, aplicar: (n) => aplicarClaseNivel('texto', n, 3) },
    espaciado:   { icono: 'espaciado',   niveles: 3, aplicar: (n) => aplicarClaseNivel('espaciado', n, 3) },
    enlaces:     { icono: 'enlaces',     niveles: 1, aplicar: (n) => aplicarClaseNivel('enlaces', n, 1) },
    dislexia:    { icono: 'dislexia',    niveles: 1, aplicar: (n) => aplicarClaseNivel('dislexia', n, 1) },
    cursor:      { icono: 'cursor',      niveles: 1, aplicar: (n) => aplicarClaseNivel('cursor', n, 1) },
    tooltips:    { icono: 'tooltips',    niveles: 1, aplicar: (n) => tooltips.aplicar(n) },
    // Acción, no estado: abre el modal y no queda «encendida».
    estructura:  { icono: 'estructura',  niveles: 0, aplicar: () => abrirEstructura() },
    animaciones: { icono: 'animaciones', niveles: 1, aplicar: (n) => animaciones.aplicar(n) },
    guia:        { icono: 'guia',        niveles: 1, aplicar: (n) => guia.aplicar(n) },
    mascara:     { icono: 'mascara',     niveles: 1, aplicar: (n) => mascara.aplicar(n) },
    imagenes:    { icono: 'imagenes',    niveles: 1, aplicar: (n) => aplicarClaseNivel('imagenes', n, 1) },
    alineacion:  { icono: 'alineacion',  niveles: 3, aplicar: (n) => aplicarClaseNivel('alineacion', n, 3) },
    foco:        { icono: 'foco',        niveles: 1, aplicar: (n) => aplicarClaseNivel('foco', n, 1) },
  };

  /* =========================================================================
   * 11. PERFILES — combinaciones predefinidas
   * ========================================================================= */

  const PERFILES = {
    motora:     { cursor: 1, foco: 1, animaciones: 1 },
    ceguera:    { lectura: 1, foco: 1 },
    daltonismo: { saturacion: 2 },
    dislexia:   { dislexia: 1, espaciado: 2 },
    bajaVision: { textoGrande: 2, contraste: 1 },
    cognitivo:  { guia: 1, enlaces: 1 },
    epilepsia:  { animaciones: 1, saturacion: 1 },
    tdah:       { mascara: 1, animaciones: 1 },
  };

  const ORDEN_PERFILES = [
    'motora', 'ceguera', 'daltonismo', 'dislexia',
    'bajaVision', 'cognitivo', 'epilepsia', 'tdah',
  ];

  /** Un perfil está activo si todas sus funciones están en el nivel que pide. */
  function perfilActivo(id) {
    const perfil = PERFILES[id];
    return Object.keys(perfil).every((f) => (estado[f] || 0) === perfil[f]);
  }

  /* =========================================================================
   * 12. CONSTRUCCIÓN DEL DOM
   * ========================================================================= */

  // El host cuelga de <html>, hermano de <body>. Ver la nota 1 de la cabecera:
  // es lo que permite que el widget quede fuera de todos los efectos.
  const host = document.createElement('div');
  host.setAttribute('data-a11yw-host', '');
  host.setAttribute('translate', 'no');
  raiz.appendChild(host);

  const sombra = host.attachShadow({ mode: 'open' });
  crearHoja(CSS_PANEL, sombra);
  crearHoja(CSS_GLOBAL, document);

  let lanzador, panel, cuerpo, velo, listaEstructura, avisoEl, anuncioEl, selectorIdioma;

  function construir() {
    // Se vacía nodo por nodo y no con textContent: en el camino de respaldo sin
    // hojas construibles, los estilos del panel son un <style> dentro de este
    // mismo shadow root, y vaciarlo de golpe los borraría al cambiar de idioma.
    Array.prototype.slice.call(sombra.children).forEach((nodo) => {
      if (nodo.tagName !== 'STYLE') nodo.remove();
    });

    // --- Botón flotante ---
    lanzador = document.createElement('button');
    lanzador.className = 'lanzador';
    lanzador.type = 'button';
    lanzador.id = 'a11yw-lanzador';
    lanzador.setAttribute('aria-label', t('abrir'));
    lanzador.setAttribute('aria-expanded', 'false');
    lanzador.setAttribute('aria-controls', 'a11yw-panel');
    lanzador.innerHTML = ICONOS.accesibilidad;
    lanzador.addEventListener('click', alternarPanel);

    // --- Panel ---
    panel = document.createElement('div');
    panel.className = 'panel';
    panel.id = 'a11yw-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'a11yw-titulo');
    panel.dataset.abierto = 'no';
    // `inert` además de visibility:hidden. La visibilidad ya saca el panel del
    // orden de tabulación, pero inert lo dice explícitamente y también lo quita
    // del árbol de accesibilidad: un panel cerrado no debería aparecer en la
    // lista de elementos de un lector de pantalla.
    panel.inert = true;

    // Encabezado
    const cabecera = document.createElement('div');
    cabecera.className = 'cabecera';

    const titulo = document.createElement('h2');
    titulo.id = 'a11yw-titulo';
    titulo.textContent = t('titulo');

    selectorIdioma = document.createElement('select');
    selectorIdioma.setAttribute('aria-label', t('idioma'));
    [['es', 'Español'], ['en', 'English']].forEach((par) => {
      const op = document.createElement('option');
      op.value = par[0];
      op.textContent = par[1];
      if (par[0] === idioma) op.selected = true;
      selectorIdioma.appendChild(op);
    });
    selectorIdioma.addEventListener('change', (ev) => {
      idioma = ev.target.value;
      guardarEstado();
      construir();
      abrirPanel();
    });

    const botonCerrar = document.createElement('button');
    botonCerrar.className = 'cerrar';
    botonCerrar.type = 'button';
    botonCerrar.setAttribute('aria-label', t('cerrar'));
    botonCerrar.innerHTML = ICONOS.cerrar;
    botonCerrar.addEventListener('click', cerrarPanel);

    cabecera.append(titulo, selectorIdioma, botonCerrar);

    // Cuerpo
    cuerpo = document.createElement('div');
    cuerpo.className = 'cuerpo';

    const h3Perfiles = document.createElement('h3');
    h3Perfiles.textContent = t('perfiles');

    const cajaPerfiles = document.createElement('div');
    cajaPerfiles.className = 'perfiles';
    ORDEN_PERFILES.forEach((id) => cajaPerfiles.appendChild(crearPerfil(id)));

    const h3Ajustes = document.createElement('h3');
    h3Ajustes.textContent = t('ajustes');

    const rejilla = document.createElement('div');
    rejilla.className = 'rejilla';
    CONFIG.funcionesActivas.forEach((id) => {
      if (FUNCIONES[id]) rejilla.appendChild(crearTarjeta(id));
    });

    avisoEl = document.createElement('div');
    avisoEl.className = 'aviso';
    avisoEl.setAttribute('role', 'status');
    avisoEl.hidden = true;

    cuerpo.append(h3Perfiles, cajaPerfiles, h3Ajustes, rejilla, avisoEl);

    // Pie
    const pie = document.createElement('div');
    pie.className = 'pie';

    const botonReset = document.createElement('button');
    botonReset.className = 'restablecer';
    botonReset.type = 'button';
    botonReset.textContent = t('restablecer');
    botonReset.addEventListener('click', restablecerTodo);
    pie.appendChild(botonReset);

    if (CONFIG.declaracionUrl) {
      const enlace = document.createElement('a');
      enlace.href = CONFIG.declaracionUrl;
      enlace.textContent = t('declaracion');
      pie.appendChild(enlace);
    }

    const atajoTexto = document.createElement('p');
    atajoTexto.className = 'atajo';
    atajoTexto.textContent = t('atajoAviso');
    pie.appendChild(atajoTexto);

    panel.append(cabecera, cuerpo, pie);

    // --- Modal de estructura ---
    velo = document.createElement('div');
    velo.className = 'velo';
    velo.dataset.abierto = 'no';
    velo.addEventListener('click', (ev) => { if (ev.target === velo) cerrarEstructura(); });

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', t('estructuraTitulo'));

    const cabModal = document.createElement('div');
    cabModal.className = 'cabecera';
    const tituloModal = document.createElement('h2');
    tituloModal.textContent = t('estructuraTitulo');
    const cerrarModal = document.createElement('button');
    cerrarModal.className = 'cerrar';
    cerrarModal.type = 'button';
    cerrarModal.setAttribute('aria-label', t('cerrar'));
    cerrarModal.innerHTML = ICONOS.cerrar;
    cerrarModal.addEventListener('click', cerrarEstructura);
    cabModal.append(tituloModal, cerrarModal);

    listaEstructura = document.createElement('div');
    listaEstructura.className = 'lista';

    modal.append(cabModal, listaEstructura);
    velo.appendChild(modal);

    // Región para anunciar cambios a un lector de pantalla real.
    anuncioEl = document.createElement('div');
    anuncioEl.className = 'anuncio';
    anuncioEl.setAttribute('role', 'status');
    anuncioEl.setAttribute('aria-live', 'polite');

    sombra.append(lanzador, panel, velo, anuncioEl);
    refrescar();
  }

  function crearPerfil(id) {
    const boton = document.createElement('button');
    boton.className = 'perfil';
    boton.type = 'button';
    boton.dataset.perfil = id;
    boton.setAttribute('aria-pressed', 'false');

    const textos = document.createElement('span');
    textos.className = 'textos';
    const nombre = document.createElement('span');
    nombre.className = 'nombre';
    nombre.textContent = t('p_' + id);
    const desc = document.createElement('span');
    desc.className = 'desc';
    desc.textContent = t('p_' + id + '_d');
    textos.append(nombre, desc);

    const llave = document.createElement('span');
    llave.className = 'llave';
    llave.setAttribute('aria-hidden', 'true');

    boton.append(textos, llave);
    boton.addEventListener('click', () => alternarPerfil(id));
    return boton;
  }

  function crearTarjeta(id) {
    const def = FUNCIONES[id];
    const boton = document.createElement('button');
    boton.className = 'tarjeta';
    boton.type = 'button';
    boton.dataset.funcion = id;
    // Una acción no tiene estado, así que no lleva aria-pressed: decir
    // «no presionado» de un botón que solo abre algo es información falsa.
    if (def.niveles > 0) boton.setAttribute('aria-pressed', 'false');

    const icono = document.createElement('span');
    icono.innerHTML = ICONOS[def.icono] || ICONOS.accesibilidad;

    const nombre = document.createElement('span');
    nombre.className = 'nombre';
    nombre.textContent = t('f_' + id);

    const estadoTexto = document.createElement('span');
    estadoTexto.className = 'estado';

    boton.append(icono.firstChild, nombre, estadoTexto);

    if (def.niveles > 1) {
      const pasos = document.createElement('span');
      pasos.className = 'pasos';
      pasos.setAttribute('aria-hidden', 'true');
      for (let i = 0; i < def.niveles; i++) pasos.appendChild(document.createElement('i'));
      boton.appendChild(pasos);
    }

    boton.addEventListener('click', () => rotarFuncion(id));
    return boton;
  }

  /* =========================================================================
   * 13. SINCRONIZACIÓN DE LA INTERFAZ CON EL ESTADO
   * ========================================================================= */

  function etiquetaNivel(id, nivel) {
    const def = FUNCIONES[id];
    if (def.niveles === 0) return '';
    if (nivel === 0) return t('desactivado');
    const lista = TEXTOS[idioma] && TEXTOS[idioma]['n_' + id];
    if (lista && lista[nivel - 1]) return lista[nivel - 1];
    if (def.niveles === 1) return t('activado');
    return `${t('nivel')} ${nivel} ${t('de')} ${def.niveles}`;
  }

  function refrescar() {
    if (!sombra.querySelector('.rejilla')) return;

    CONFIG.funcionesActivas.forEach((id) => {
      const def = FUNCIONES[id];
      if (!def) return;
      const boton = sombra.querySelector(`[data-funcion="${id}"]`);
      if (!boton) return;

      const nivel = estado[id] || 0;
      if (def.niveles > 0) boton.setAttribute('aria-pressed', nivel > 0 ? 'true' : 'false');

      const estadoTexto = boton.querySelector('.estado');
      if (estadoTexto) estadoTexto.textContent = etiquetaNivel(id, nivel);

      const pasos = boton.querySelectorAll('.pasos i');
      pasos.forEach((paso, i) => {
        paso.dataset.lleno = i < nivel ? 'si' : 'no';
      });

      // El nombre visible ya dice qué es; aria-label suma el estado para que
      // quien use un lector no tenga que deducirlo del dibujo de los puntos.
      const sufijo = def.niveles > 0 ? ` — ${etiquetaNivel(id, nivel)}` : '';
      boton.setAttribute('aria-label', t('f_' + id) + sufijo);
    });

    ORDEN_PERFILES.forEach((id) => {
      const boton = sombra.querySelector(`[data-perfil="${id}"]`);
      if (boton) boton.setAttribute('aria-pressed', perfilActivo(id) ? 'true' : 'false');
    });
  }

  function anunciar(texto) {
    if (anuncioEl) anuncioEl.textContent = texto;
  }

  function mostrarAviso(texto) {
    if (!avisoEl) return;
    avisoEl.textContent = texto || '';
    avisoEl.hidden = !texto;
  }

  /* =========================================================================
   * 14. ACCIONES
   * ========================================================================= */

  function fijarFuncion(id, nivel) {
    const def = FUNCIONES[id];
    if (!def) return;
    estado[id] = nivel;
    if (nivel === 0) delete estado[id];
    def.aplicar(nivel);
  }

  function rotarFuncion(id) {
    const def = FUNCIONES[id];
    if (!def) return;

    if (def.niveles === 0) { def.aplicar(0); return; }

    const actual = estado[id] || 0;
    const siguiente = actual >= def.niveles ? 0 : actual + 1;
    fijarFuncion(id, siguiente);
    guardarEstado();
    refrescar();
    anunciar(`${t('f_' + id)}: ${etiquetaNivel(id, siguiente)}`);
  }

  function alternarPerfil(id) {
    const perfil = PERFILES[id];
    const apagar = perfilActivo(id);

    Object.keys(perfil).forEach((f) => {
      fijarFuncion(f, apagar ? 0 : perfil[f]);
    });

    guardarEstado();
    refrescar();
    anunciar(`${t('p_' + id)}: ${apagar ? t('desactivado') : t('activado')}`);
  }

  function restablecerTodo() {
    Object.keys(FUNCIONES).forEach((id) => {
      if (FUNCIONES[id].niveles > 0) fijarFuncion(id, 0);
    });
    estado = {};
    guardarEstado();
    mostrarAviso('');
    refrescar();
    anunciar(t('restablecer'));
  }

  function aplicarEstadoGuardado() {
    Object.keys(estado).forEach((id) => {
      const def = FUNCIONES[id];
      if (def && def.niveles > 0) def.aplicar(estado[id]);
    });
    recomponerFiltro();
  }

  /* =========================================================================
   * 15. APERTURA, CIERRE Y FOCO
   * ========================================================================= */

  const SELECTOR_FOCO = 'button, a[href], select, input, [tabindex]:not([tabindex="-1"])';

  function focalizables(contenedor) {
    return Array.prototype.filter.call(
      contenedor.querySelectorAll(SELECTOR_FOCO),
      (el) => el.offsetParent !== null || el === sombra.activeElement
    );
  }

  function abrirPanel() {
    panel.inert = false;
    panel.dataset.abierto = 'si';
    lanzador.setAttribute('aria-expanded', 'true');
    lanzador.setAttribute('aria-label', t('cerrar'));
    const primero = focalizables(panel)[0];
    if (primero) primero.focus();
  }

  function cerrarPanel() {
    if (velo && velo.dataset.abierto === 'si') cerrarEstructura();
    panel.dataset.abierto = 'no';
    panel.inert = true;
    lanzador.setAttribute('aria-expanded', 'false');
    lanzador.setAttribute('aria-label', t('abrir'));
    // Devolver el foco a su origen es parte del criterio: si no, quien navega
    // por teclado queda en la nada y tiene que volver a tabular la página.
    lanzador.focus();
  }

  function alternarPanel() {
    if (panel.dataset.abierto === 'si') cerrarPanel();
    else abrirPanel();
  }

  function abrirEstructura() {
    llenarEstructura();
    velo.dataset.abierto = 'si';
    const primero = focalizables(velo)[0];
    if (primero) primero.focus();
  }

  function cerrarEstructura() {
    velo.dataset.abierto = 'no';
    const tarjeta = sombra.querySelector('[data-funcion="estructura"]');
    if (tarjeta) tarjeta.focus();
  }

  function llenarEstructura() {
    listaEstructura.textContent = '';

    const grupos = [
      { titulo: t('encabezados'), elementos: document.querySelectorAll('body h1, body h2, body h3, body h4, body h5, body h6') },
      { titulo: t('regiones'), elementos: document.querySelectorAll('body main, body nav, body aside, body header, body footer, body section[aria-label], body [role="main"], body [role="navigation"], body [role="banner"], body [role="contentinfo"]') },
      { titulo: t('enlacesLista'), elementos: document.querySelectorAll('body a[href]') },
    ];

    grupos.forEach((grupo) => {
      const h = document.createElement('h3');
      h.textContent = grupo.titulo;
      h.style.cssText = 'font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin:14px 0 6px;';
      listaEstructura.appendChild(h);

      let puestos = 0;
      Array.prototype.forEach.call(grupo.elementos, (el) => {
        if (el.closest('[data-a11yw-host]')) return;
        const texto = (el.getAttribute('aria-label') || el.innerText || el.textContent || '').trim();
        if (!texto) return;
        if (puestos >= 60) return; // Un listado de 400 enlaces no es navegable.

        const boton = document.createElement('button');
        boton.type = 'button';
        boton.setAttribute('aria-label', `${t('irA')}: ${texto.slice(0, 90)}`);

        const marca = document.createElement('span');
        marca.className = 'marca';
        marca.textContent = el.tagName.toLowerCase();

        boton.append(marca, document.createTextNode(texto.slice(0, 90)));
        boton.addEventListener('click', () => {
          cerrarEstructura();
          cerrarPanel();
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Hacerlo enfocable temporalmente: llevar la vista sin llevar el foco
          // deja a quien usa teclado mirando un lugar donde no está parado.
          const teniaTabindex = el.hasAttribute('tabindex');
          if (!teniaTabindex) el.setAttribute('tabindex', '-1');
          el.focus({ preventScroll: true });
          if (!teniaTabindex) {
            el.addEventListener('blur', function limpiar() {
              el.removeAttribute('tabindex');
              el.removeEventListener('blur', limpiar);
            });
          }
        });

        listaEstructura.appendChild(boton);
        puestos++;
      });

      if (puestos === 0) {
        const vacio = document.createElement('p');
        vacio.textContent = t('vacio');
        listaEstructura.appendChild(vacio);
      }
    });
  }

  /* =========================================================================
   * 16. TECLADO
   * ========================================================================= */

  function atrapaFoco(ev, contenedor) {
    if (ev.key !== 'Tab') return;
    const lista = focalizables(contenedor);
    if (!lista.length) return;

    const primero = lista[0];
    const ultimo = lista[lista.length - 1];
    // En un shadow root, document.activeElement devuelve el host: el elemento
    // real está en sombra.activeElement.
    const actual = sombra.activeElement;

    if (ev.shiftKey && actual === primero) {
      ev.preventDefault();
      ultimo.focus();
    } else if (!ev.shiftKey && actual === ultimo) {
      ev.preventDefault();
      primero.focus();
    }
  }

  document.addEventListener('keydown', (ev) => {
    const atajo = CONFIG.atajo;
    if (
      ev.key && ev.key.toLowerCase() === atajo.tecla &&
      (!atajo.alt || ev.altKey) && (!atajo.ctrl || ev.ctrlKey) &&
      !ev.metaKey
    ) {
      ev.preventDefault();
      alternarPanel();
      return;
    }

    if (ev.key === 'Escape') {
      if (velo && velo.dataset.abierto === 'si') { cerrarEstructura(); return; }
      if (panel && panel.dataset.abierto === 'si') { cerrarPanel(); return; }
    }
  });

  // El foco se atrapa en el shadow root, donde los eventos de teclado del panel
  // realmente ocurren.
  sombra.addEventListener('keydown', (ev) => {
    if (velo && velo.dataset.abierto === 'si') atrapaFoco(ev, velo);
    else if (panel && panel.dataset.abierto === 'si') atrapaFoco(ev, panel);
  });

  /* =========================================================================
   * 17. ARRANQUE
   * ========================================================================= */

  estado = cargarEstado();
  construir();
  aplicarEstadoGuardado();
  refrescar();

  // En una aplicación de una sola página el contenido se reemplaza sin recargar,
  // así que los efectos que dependen de recorrer el DOM —los GIF congelados,
  // los vídeos pausados— hay que volver a aplicarlos cuando cambia la vista.
  // Las clases en <html> no necesitan esto: el CSS se aplica solo.
  if (window.MutationObserver) {
    let pendiente = null;
    const vigia = new MutationObserver(() => {
      if (pendiente) return;
      pendiente = window.setTimeout(() => {
        pendiente = null;
        if (estado.animaciones === 1) animaciones.congelarGifs();
      }, 400);
    });
    vigia.observe(document.body, { childList: true, subtree: true });
  }
})();
