// Completa RECON/design-dna.json: qué se tomó de comfacundi.com.co (gramática
// de layout) y qué manda el manual de marca de Fondefos (color y tipografía).
import { readFileSync, writeFileSync } from "node:fs";

const ruta = new URL("../RECON/design-dna.json", import.meta.url);
const dna = JSON.parse(readFileSync(ruta));
const ds = dna.design_system;
const st = dna.design_style;
const ve = dna.visual_effects;

dna.meta = {
  ...dna.meta,
  name: "Fondefos — contenido propio, gramática Comfacundi, tokens del manual v2",
  description:
    "Identidad visual del clon: la paleta y las tipografías vienen del manual de marca de Fondefos (fondefos-sistema-de-diseno.pdf, v2 2026). La gramática de composición — bandas alternadas, splits asimétricos, radios generosos, franjas full-bleed con CTA pill — viene de comfacundi.com.co. Ninguna de las dos fuentes aporta contenido: el contenido es 100 % de fondefos.com.co.",
  source_references:
    "fondefos-sistema-de-diseno.pdf (tokens) · comfacundi.com.co (layout, valores computados en RECON/reference-recon.json) · fondefos.com.co (contenido, RECON/original-recon.json)"
};

ds.color = {
  palette_type: "Corporativa de cuatro roles funcionales sobre neutros fríos",
  primary: { hex: "#1B4F9C", role: "Azul Corporativo: cabeceras, navegación, botones primarios" },
  secondary: { hex: "#00A8C6", role: "Cian Institucional: enlaces, foco de campos, CTAs secundarios" },
  accent: {
    hex: "#E8792B",
    role: "Naranja Energía: único acento, máximo dos apariciones por pantalla. Sólo como relleno o con tinta oscura encima — sobre blanco da 2,9:1 y no alcanza para texto"
  },
  neutral: {
    scale: "#FFFFFF · #F4F8FD · #E7EFF8 · #D3E0EE · #B8CEE4 · #667487 · #3D4A5C · #152238",
    usage: "Fondos alternados blanco/azul claro, bordes de tarjeta, texto de cuerpo y tinta de titulares"
  },
  semantic: {
    success: "#1E8449 (Verde Solidario: banda de afiliación, estados de ahorro cumplido)",
    warning: "#E8792B",
    error: "#A5281B (derivado; el rojo del manual no alcanza contraste sobre blanco)",
    info: "#0A7A90 (cian oscurecido a 5,0:1 para texto de enlace)"
  },
  surface: { background: "#FFFFFF", card: "#FFFFFF", elevated: "#F4F8FD" },
  contrast_strategy:
    "Cada estado define fondo y texto como par. El hover mueve la luminosidad del fondo ±0,06–0,12 y nunca aclara el texto. Mínimos: 4,5:1 texto normal, 3:1 texto grande e iconos."
};

ds.typography = {
  type_scale: {
    display: { font: "Montserrat 800", size: "clamp(2.15rem, 1.5rem + 2.4vw, 3.4rem)", tracking: "-0.025em" },
    heading_1: { font: "Montserrat 800", size: "34px base del manual, escalado con clamp" },
    heading_2: { font: "Montserrat 700", size: "clamp(1.6rem, 1.2rem + 1.5vw, 2.3rem)" },
    heading_3: { font: "Montserrat 700", size: "clamp(1.2rem, 1.05rem + 0.5vw, 1.45rem)" },
    body: { font: "Open Sans 400", size: "16px", line_height: "1.65" },
    body_small: { font: "Open Sans 400", size: "0.95rem" },
    caption: { font: "Open Sans 600", size: "0.72rem", transform: "mayúsculas", tracking: "0.14em" },
    overline: { font: "Open Sans 600", size: "0.72rem", note: "rótulo de sección con regla naranja de 26px" }
  },
  font_families: {
    heading: "Montserrat (500/600/700/800), autohospedada en assets/fonts/brand",
    body: "Open Sans (400/600/700 + itálica), autohospedada en assets/fonts/brand",
    mono: "no se usa"
  },
  font_style_notes:
    "El manual fija Montserrat para títulos y Open Sans para cuerpo. El sitio original servía Merriweather/Open Sans/Roboto; se descartaron por contradecir el manual. Comfacundi usa Poppins: no se adoptó, sólo se tomó su gramática de composición."
};

ds.spacing = {
  base_unit: "4px",
  scale: "4 · 8 · 12 · 18 · 26 · 34 · 44 · 56 · 76 · 104",
  content_density: "Media-baja: párrafos a 62ch máximo, tarjetas con 26px de padding",
  section_rhythm: "padding-block: clamp(56px, 7vw, 104px), con bandas full-bleed más cortas (clamp(34px, 4vw, 52px)) como respiro entre secciones largas"
};

ds.layout = {
  grid_system: "CSS Grid con contenedor centrado y anchos mínimos por tarjeta (auto-fit + minmax)",
  max_content_width: "1180px",
  columns: "Splits asimétricos 1fr/1.15fr y 1.05fr/1fr; rejillas de 2, 3 y 4 columnas",
  gutter: "clamp(20px, 4vw, 48px)",
  breakpoints: "1080px (navegación), 1000px (pie), 900px (portada y ficha de crédito), 880px (splits), 620px (pie a dos columnas)",
  alignment_tendency:
    "Asimetría deliberada: el bloque de texto ocupa la columna ancha y la imagen se desplaza fuera de la rejilla con un marco de color detrás (patrón .marco-offset). Tomado de la portada y de los bloques de servicios de Comfacundi."
};

ds.shape = {
  border_radius: { small: "8px", medium: "14px", large: "22px", pill: "999px" },
  border_usage: "Borde de 1px #D3E0EE en toda tarjeta sobre blanco; 1,5px en controles de formulario y botones",
  divider_style: "Línea de 1px del mismo tono de borde; en superficies oscuras, rgba(255,255,255,0.13)"
};

ds.elevation = {
  shadow_style: "Sombras frías de dos capas basadas en la tinta (#152238), nunca negro puro",
  levels: {
    low: "0 1px 2px rgba(21,34,56,.06), 0 8px 24px rgba(21,34,56,.07)",
    medium: "misma baja + translateY(-2px) en hover de tarjeta",
    high: "0 2px 4px rgba(21,34,56,.08), 0 24px 60px rgba(21,34,56,.14)"
  },
  depth_cues: "Elevación por sombra + desplazamiento de 1–3px en hover; el marco de color detrás de la imagen da profundidad sin sombra"
};

ds.iconography = {
  style: "Lineal, geométrico, esquinas redondeadas",
  stroke_weight: "1,7–1,9px",
  size_scale: "18px en línea de texto, 22px en cajas de icono de 42px",
  preferred_set: "SVG propios en línea (assets inline en build/shell.mjs). Sin emoji y sin sets de terceros."
};

ds.motion = {
  easing: "ease por defecto; 0.16–0.24s en micro-interacciones",
  duration_scale: { micro: "160ms", normal: "180–240ms", macro: "500ms (fundido del carrusel)" },
  entrance_pattern: "Fundido de opacidad para el carrusel; deslizamiento de 24px + fundido para el cajón lateral",
  exit_pattern: "Inverso inmediato, sin animación de salida",
  philosophy:
    "Comfacundi declara scroll-behavior: smooth y usa GSAP con 9 reglas de scroll-snap. Aquí se conserva el scroll suave nativo y se descarta GSAP: el contenido es informativo y no justifica una dependencia externa. Se respeta prefers-reduced-motion."
};

ds.components = {
  button_style:
    "Píldora de 48px de alto mínimo con borde de 1,5px. Un solo botón sólido por vista; el resto secundario, fantasma o enlace con flecha.",
  input_style: "Alto mínimo 48px, radio 8px, borde 1,5px, anillo de foco cian de 3px y estado de error con mensaje bajo el campo",
  card_style: "Blanca, radio 14px, borde 1px, sombra sólo en hover, elevación de 2–3px",
  navigation_pattern:
    "Barra de utilidad oscura + cabecera blanca fija con sombra al desplazar. Submenú de Servicios por click. Bajo 1080px pasa a menú desplegable de altura completa.",
  modal_style: "Cajón lateral derecho de 470px con velo a rgba(21,34,56,.55), cierre con Escape y foco devuelto al disparador",
  list_style: "Acordeón de filas con signo + que rota 45°; listas de requisitos numeradas con contador naranja",
  component_notes:
    "El cajón de convenios es enlazable por hash (convenios.html#santur), de modo que los 28 convenios siguen siendo direccionables sin generar 28 páginas casi vacías."
};

st.aesthetic = {
  mood: ["institucional", "cercano", "ordenado", "solidario"],
  visual_metaphor: "Una cartilla financiera clara: cifras al frente, letra chica accesible",
  era_influence: "Web institucional contemporánea latinoamericana (2023–2026)",
  genre: "Sitio corporativo de servicios financieros cooperativos",
  personality_traits: ["confiable", "explicativo", "sin adornos", "directo"],
  adjectives: ["nítido", "azul", "aireado", "asimétrico"]
};

st.visual_language = {
  complexity: "Baja-media: pocos elementos por sección, mucha jerarquía tipográfica",
  ornamentation: "Mínima. Un único gesto repetido: la regla naranja de 26px del rótulo de sección y el círculo de trazo grueso del encabezado.",
  whitespace_usage: "Generoso entre secciones, compacto dentro de las tarjetas",
  visual_weight_distribution: "Desequilibrio intencional: la columna de texto pesa más que la de imagen y la imagen compensa saliéndose de la rejilla",
  focal_strategy: "Titular de doble peso (regular + primario en negrita) y un solo botón sólido por vista",
  contrast_level: "Alto en texto, medio en superficies",
  texture_usage: "Ninguna. La marca de agua del isotipo al 14 % de opacidad es la única capa de fondo."
};

st.composition = {
  hierarchy_method: "Rótulo → titular de doble peso → párrafo de entrada → contenido",
  balance_type: "Asimétrico con eje vertical estable",
  flow_direction: "Zigzag: los splits alternan el lado de la imagen entre secciones",
  grouping_strategy: "Bandas de color completas para separar bloques temáticos, tomado de Comfacundi",
  negative_space_role: "Separar bandas y dar aire a las cifras; nunca decorativo"
};

st.imagery = {
  photo_treatment: "Sin filtros ni superposiciones de color. Las piezas gráficas del fondo se muestran completas.",
  illustration_style: "No se genera ilustración. Todas las imágenes son activos reales de fondefos.com.co.",
  graphic_elements: "Marco de color desplazado detrás de la imagen; círculo de trazo grueso en el encabezado de página interior",
  pattern_usage: "Ninguno",
  image_shape:
    "Radio 14–22px. object-fit: contain en todo contenido legible (piezas del Notifondo, logotipos de convenios) para no recortar. cover queda reservado a rellenos decorativos."
};

st.interaction_feel = {
  feedback_style: "Inmediato y sobrio: cambio de fondo, borde y 1–3px de desplazamiento",
  hover_behavior: "El fondo se oscurece o aclara; el texto nunca pierde contraste",
  transition_personality: "Corta y funcional",
  loading_style: "No aplica: sitio estático sin estados de carga",
  microinteraction_density: "Baja"
};

st.brand_voice_in_ui = {
  tone: "Cercano y explicativo, en voseo rioplatense adaptado al público colombiano del fondo",
  formality: "Media: tutea al asociado pero conserva la redacción textual del reglamento de crédito",
  cta_style: "Verbo en primera persona o imperativo corto: «Registrarme aquí», «Solicitar este crédito», «Cómo llegar»",
  empty_state_approach: "Mensaje único y literal: «No hay convenios publicados en esta categoría»",
  error_tone: "Instrucción directa bajo el campo: «Ingresá un correo electrónico válido»"
};

ve.overview = {
  effect_intensity: "lightweight",
  performance_tier: "CSS puro + ~330 líneas de JavaScript sin dependencias",
  fallback_strategy:
    "Todo el contenido es HTML estático: sin JavaScript se pierden el carrusel, los filtros, el cajón y el visor, pero las 18 páginas y los 28 convenios siguen leyéndose.",
  primary_technology: "CSS Grid, custom properties y JavaScript nativo"
};

ve.background_effects = {
  type: "marca de agua estática",
  description: "El isotipo de Fondefos al 14 % de opacidad, desplazado fuera del borde derecho de la portada",
  technology: "<img> posicionado en absoluto",
  params: { color_palette: "azul corporativo", speed: "0", density: "1 elemento", opacity: "0.14", blend_mode: "normal" }
};

ve.scroll_effects.parallax = { enabled: false, layers: "0", depth_range: "0", speed_curve: "n/a" };
ve.scroll_effects.scroll_triggered_animations = {
  enabled: true,
  trigger_points: "scrollY > 8px",
  animation_type: "La cabecera fija gana sombra",
  scrub_behavior: "no"
};
ve.scroll_effects.scroll_morphing = { enabled: false, description: "" };

ve.text_effects = {
  type: "ninguno",
  description: "No hay animación de texto. La jerarquía se resuelve con peso y tamaño.",
  technology: "n/a",
  params: { split_strategy: "n/a", animation_per_unit: "n/a", stagger: "n/a", effect_style: "n/a" }
};

ve.image_effects = {
  type: "elevación en hover",
  description: "Las tarjetas con imagen suben 2–3px y ganan sombra y borde primario claro",
  technology: "transición CSS",
  params: {
    filter_pipeline: "ninguno",
    hover_transform: "translateY(-2px a -3px)",
    reveal_animation: "ninguna",
    distortion_type: "ninguna"
  }
};

ve.glassmorphism_neumorphism = {
  enabled: true,
  style: "glassmorphism puntual",
  params: {
    blur_radius: "8px",
    transparency: "rgba(255,255,255,0.95)",
    border_treatment: "sin borde, radio 14px",
    shadow_type: "sombra alta",
    light_source_angle: "superior"
  }
};

ve.composite_notes =
  "Comfacundi corre GSAP con 9 reglas de scroll-snap y 6 elementos sticky/fixed. Aquí se conserva sólo la cabecera fija y el scroll suave nativo: replicar el motor de scroll añadiría una dependencia sin beneficio para un sitio informativo. Sin canvas, sin WebGL, sin partículas, sin efectos de cursor.";

delete dna._scaffold_note;
writeFileSync(ruta, JSON.stringify(dna, null, 1));
console.log("design-dna.json completado");
