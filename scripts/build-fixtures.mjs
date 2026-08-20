/**
 * Builds every experiment SVG fixture and IIIF Presentation 3.0 manifest used by
 * the lab. Output goes under public/svg and public/manifests.
 *
 * The manifests are plain IIIF Presentation 3.0 JSON-LD. The only non-standard
 * artifact is exp7-keyframes.json, which is explicitly experimental and NOT part
 * of IIIF (the corresponding exp7.json manifest is spec-clean).
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const svgDir = resolve(root, "public", "svg");
const mfDir = resolve(root, "public", "manifests");
mkdirSync(svgDir, { recursive: true });
mkdirSync(mfDir, { recursive: true });

const ORIGIN = "http://localhost:5173";
const VIDEO = `${ORIGIN}/video/test-grid-1920x1080-30s.mp4`;
const CANVAS = `${ORIGIN}/canvas/main`;
const ANNO = `${ORIGIN}/annotation`;
const PAGE = `${ORIGIN}/page/1`;
const anchor = (id, base = ANNO) => id.startsWith("http") ? id : `${base}/${id}`;

function svgFile(name) {
  return `${ORIGIN}/svg/${name}`;
}

function ctx() {
  return [
    "http://www.w3.org/ns/anno.jsonld",
    "http://iiif.io/api/presentation/3/context.json",
  ];
}

function fragmentSelector(value) {
  return { type: "FragmentSelector", value };
}

function target(source, selectors) {
  const sel = selectors && selectors.length ? { selector: selectors.length === 1 ? selectors[0] : selectors } : {};
  return { source, ...sel };
}

function label(s) {
  return { en: [s] };
}

/** Painting annotation whose body is an SVG visual resource. */
function svgPainting(id, svg, selectors, extra = {}) {
  const body = {
    id: svgFile(svg),
    type: "Image",
    format: "image/svg+xml",
    label: label(id),
  };
  return {
    id: anchor(id),
    type: "Annotation",
    motivation: "painting",
    target: target(CANVAS, selectors),
    body: { ...body, ...extra },
  };
}

/** Painting annotation whose body is the underlying video. */
function videoPainting(id) {
  return {
    id: anchor(id),
    type: "Annotation",
    motivation: "painting",
    target: CANVAS,
    body: {
      id: VIDEO,
      type: "Video",
      format: "video/mp4",
      width: 1920,
      height: 1080,
      duration: 30.0,
      label: label(id),
    },
  };
}

function manifest(id, canvasItems, extra = {}) {
  return {
    "@context": ctx(),
    id: `${ORIGIN}/manifests/${id}`,
    type: "Manifest",
    label: label(id.replace(/\.json$/, "")),
    items: [
      {
        id: CANVAS,
        type: "Canvas",
        width: 1920,
        height: 1080,
        duration: 30.0,
        label: label("main canvas"),
        items: [
          {
            id: PAGE,
            type: "AnnotationPage",
            items: canvasItems,
          },
        ],
      },
    ],
    ...extra,
  };
}

const S = (s) => [s];

// ---------------------------------------------------------------------------
// SVG fixtures
// ---------------------------------------------------------------------------

const svgs = {
  "exp1-circle.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="1920" height="1080" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet">
  <circle cx="960" cy="540" r="300" fill="#e11" fill-opacity="0.85" stroke="#000" stroke-width="8"/>
</svg>`,

  "exp2-primitives.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#0af"/>
    </marker>
  </defs>
  <g fill="none" stroke="#fff" stroke-width="4">
    <path d="M 40 300 Q 200 120 400 260 T 800 240" stroke="#ff5c5c"/>
    <line x1="40" y1="420" x2="800" y2="420" stroke="#7dff7d"/>
    <polyline points="40,520 200,480 360,560 520,520 760,560" stroke="#7dd7ff"/>
    <polygon points="40,700 200,640 360,720 200,780" fill="#ff7dff22" stroke="#ff7dff"/>
  </g>
  <rect x="900" y="60" width="260" height="180" fill="#ffff00" fill-opacity="0.55" stroke="#000" stroke-width="6"/>
  <circle cx="1260" cy="560" r="150" fill="#00ff88" fill-opacity="0.5" stroke="#003" stroke-width="8"/>
  <ellipse cx="1180" cy="880" rx="220" ry="90" fill="#88f" fill-opacity="0.5" stroke="#fff" stroke-width="5"/>
  <line x1="1450" y1="180" x2="1650" y2="180" stroke="#0af" stroke-width="10" marker-end="url(#arrow)"/>
  <g transform="translate(1100,400) rotate(25)">
    <rect x="0" y="0" width="180" height="120" fill="#ff8800" opacity="0.6" stroke="#000" stroke-width="4"/>
  </g>
  <path d="M 1400 900 h 180 v 70 h -180 z" fill="none" stroke="#fff" stroke-width="12" stroke-linejoin="round"/>
  <line x1="1400" y1="850" x2="1580" y2="850" stroke="#fff" stroke-width="24" stroke-linecap="round"/>
  <g stroke="#fff" stroke-width="8">
    <line x1="40" y1="40" x2="240" y2="40" opacity="1.0"/>
    <line x1="40" y1="100" x2="240" y2="100" opacity="0.6"/>
    <line x1="40" y1="160" x2="240" y2="160" opacity="0.3"/>
  </g>
  <text x="40" y="1040" font-size="48" fill="#fff" font-family="Arial, sans-serif">Exp2 primitives</text>
  <text x="1360" y="720" font-size="40" fill="#fff">
    <tspan x="1360">tspan line 1</tspan>
    <tspan x="1360" dy="48" fill="#ff0">tspan line 2</tspan>
  </text>
</svg>`,

  "exp3-yellow-rect.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080">
  <rect x="80" y="80" width="560" height="420" fill="#ffd000" fill-opacity="0.55" stroke="#333" stroke-width="6"/>
</svg>`,

  "exp3-red-circle.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080">
  <circle cx="500" cy="380" r="170" fill="#d11" fill-opacity="0.8"/>
</svg>`,

  "exp3-arrow.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#0b0"/>
    </marker>
  </defs>
  <line x1="700" y1="300" x2="1200" y2="150" stroke="#0b0" stroke-width="18" marker-end="url(#arrow)"/>
</svg>`,

  "exp3-text.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080">
  <text x="700" y="340" font-size="120" fill="#00c" font-family="Arial, sans-serif">TEXT</text>
</svg>`,

  // Region-sized SVG (960x540). Used with xywh spatial targets to paint into a
  // quarter-region of the canvas.
  "exp4-circle.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="960" height="540" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid meet">
  <circle cx="480" cy="270" r="150" fill="#e11" fill-opacity="0.85" stroke="#000" stroke-width="6"/>
</svg>`,

  // Renderer-B oracle equivalents for exp4: the SAME circle with coordinates
  // baked directly into a full-canvas space. Used to check whether the renderer
  // A interpretation of `xywh` ("paint SVG into this canvas region") produces
  // the same pixels as pre-positioned content.
  "exp4-pos-00.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet">
  <circle cx="480" cy="270" r="150" fill="#e11" fill-opacity="0.85" stroke="#000" stroke-width="6"/>
</svg>`,
  "exp4-pos-960540.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet">
  <circle cx="1440" cy="810" r="150" fill="#e11" fill-opacity="0.85" stroke="#000" stroke-width="6"/>
</svg>`,
  "exp4-pos-pct.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet">
  <circle cx="1200" cy="135" r="150" fill="#e11" fill-opacity="0.85" stroke="#000" stroke-width="6"/>
</svg>`,
  "exp4-pos-timed.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet">
  <circle cx="480" cy="810" r="150" fill="#e11" fill-opacity="0.85" stroke="#000" stroke-width="6"/>
</svg>`,

  // Coordinate-system experiments: identical nominal circle, differing viewBox.
  "exp5-viewbox-1920.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet">
  <circle cx="960" cy="540" r="200" fill="#e11" fill-opacity="0.8" stroke="#000" stroke-width="6"/>
</svg>`,
  "exp5-viewbox-1000.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
  <circle cx="500" cy="545" r="200" fill="#e11" fill-opacity="0.8" stroke="#000" stroke-width="6"/>
</svg>`,
  "exp5-viewbox-64.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 64 36" preserveAspectRatio="xMidYMid meet">
  <circle cx="32" cy="18" r="7" fill="#e11" fill-opacity="0.8" stroke="#000" stroke-width="0.2"/>
</svg>`,

  // Temporal movement: dot at canvas-space origin (0,0); keyframes move it.
  "exp7-dot.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080">
  <circle cx="0" cy="0" r="80" fill="#e11" fill-opacity="0.85" stroke="#000" stroke-width="6"/>
</svg>`,

  // Same dot, but moving via SVG-internal animation (<animate>). Used only for
  // comparison; not the default approach.
  "exp7-animate.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080">
  <circle r="80" fill="#e11" fill-opacity="0.85" stroke="#000" stroke-width="6">
    <animate attributeName="cx" values="100;300;600" dur="10s" begin="10s" keyTimes="0;0.5;1" repeatCount="1" fill="freeze"/>
    <animate attributeName="cy" values="500;500;500" dur="10s" begin="10s" repeatCount="1" fill="freeze"/>
  </circle>
</svg>`,

  "text-probe.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080">
  <text x="120" y="200" font-size="96" fill="#fff" font-family="Arial, sans-serif">The quick brown fox</text>
  <text x="120" y="360" font-size="96" fill="#ffd700" font-family="Arial, sans-serif" font-style="italic" font-weight="bold">جمل الوزن</text>
  <text x="120" y="500" font-size="64" fill="#7dd7ff">
    <tspan>Line one</tspan>
    <tspan x="120" dy="72">Line two (tspan)</tspan>
    <tspan x="120" dy="72" fill="#ff7979">Line three</tspan>
  </text>
  <text x="120" y="760" font-size="80" fill="#fff" font-family="monospace">C:\\dir \\u0041</text>
</svg>`,

  // Crude path-based surrogate of the word "TEXT" (strokes approximated by hand).
  "text-outlined.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080">
  <g fill="none" stroke="#0f0" stroke-width="28" stroke-linecap="square">
    <path d="M 120 850 L 220 150 L 320 850"/>                       <!-- T -->
    <path d="M 420 850 L 420 150 L 520 850 L 620 150 L 620 850"/>   <!-- E -->
    <path d="M 720 850 L 820 150 L 920 150 L 920 850"/>             <!-- X -->
    <path d="M 1020 150 L 1120 150 L 1120 850 L 1020 850"/>         <!-- T -->
  </g>
</svg>`,

  "security-clean.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080">
  <rect x="100" y="100" width="600" height="400" fill="#55f" fill-opacity="0.5"/>
  <circle cx="1400" cy="500" r="200" fill="#5f5" fill-opacity="0.5"/>
  <line x1="100" y1="800" x2="900" y2="800" stroke="#fff" stroke-width="12"/>
</svg>`,

  "security-danger.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080">
  <script>document.title = "PWNED"</script>
  <rect x="100" y="100" width="600" height="400" fill="#f55" fill-opacity="0.5" onclick="alert('xss')"/>
  <a xlink:href="http://example.com/" xmlns:xlink="http://www.w3.org/1999/xlink"><rect x="700" y="500" width="200" height="200" fill="#ff0"/></a>
  <foreignObject x="900" y="100" width="400" height="200"><div xmlns="http://www.w3.org/1999/xhtml" style="background:lime">raw HTML</div></foreignObject>
  <image xlink:href="http://example.com/nope.png" xmlns:xlink="http://www.w3.org/1999/xlink" x="900" y="400" width="200" height="100"/>
  <filter id="evil"><feImage xlink:href="http://example.com/nope.png" xmlns:xlink="http://www.w3.org/1999/xlink"/></filter>
  <circle cx="1400" cy="700" r="150" fill="#5f5" filter="url(#evil)"/>
  <style>circle { display: none }</style>
</svg>`,
};

// ---------------------------------------------------------------------------
// Manifests
// ---------------------------------------------------------------------------

const manifests = {
  "exp1.json": () =>
    manifest("exp1.json", [
      videoPainting("video"),
      svgPainting("circle", "exp1-circle.svg", [fragmentSelector("t=10,15")]),
    ]),

  "exp2.json": () =>
    manifest("exp2.json", [
      videoPainting("video"),
      svgPainting("primitives", "exp2-primitives.svg", []),
    ]),

  "exp3.json": () =>
    manifest("exp3.json", [
      videoPainting("video"),
      svgPainting("yellow-rect", "exp3-yellow-rect.svg", []),
      svgPainting("red-circle", "exp3-red-circle.svg", []),
      svgPainting("arrow", "exp3-arrow.svg", []),
      svgPainting("text", "exp3-text.svg", []),
    ]),

  "exp4.json": () =>
    manifest("exp4.json", [
      videoPainting("video"),
      svgPainting("region-circles", "exp4-circle.svg", [
        fragmentSelector("xywh=0,0,960,540"),
      ]),
      svgPainting("region-circles-t", "exp4-circle.svg", [
        fragmentSelector("xywh=960,540,960,540"),
      ]),
      svgPainting("region-pct", "exp4-circle.svg", [
        fragmentSelector("xywh=pct:50,0,25,25"),
      ]),
      svgPainting("region-timed", "exp4-circle.svg", [
        fragmentSelector("xywh=0,540,960,540&t=10,20"),
      ]),
    ]),

  "exp5a.json": () =>
    manifest("exp5a.json", [
      videoPainting("video"),
      svgPainting("vb1920", "exp5-viewbox-1920.svg", []),
    ]),
  "exp5b.json": () =>
    manifest("exp5b.json", [
      videoPainting("video"),
      svgPainting("vb1000", "exp5-viewbox-1000.svg", []),
    ]),
  "exp5c.json": () =>
    manifest("exp5c.json", [
      videoPainting("video"),
      svgPainting("vb64", "exp5-viewbox-64.svg", []),
    ]),

  "exp7.json": () =>
    manifest("exp7.json", [
      videoPainting("video"),
      svgPainting("moving-dot", "exp7-dot.svg", [fragmentSelector("t=10,25")]),
    ]),

  // Alternative: same dot moved by an SVG-internal <animate>. For comparison
  // against the keyframe (renderer-driven) approach in exp7.
  "exp7-animate.json": () =>
    manifest("exp7-animate.json", [
      videoPainting("video"),
      svgPainting("moving-dot", "exp7-animate.svg", [fragmentSelector("t=10,30")]),
    ]),

  "exp-security.json": () =>
    manifest("exp-security.json", [
      videoPainting("video"),
      svgPainting("clean", "security-clean.svg", []),
      svgPainting("danger", "security-danger.svg", []),
    ]),

  "exp-text.json": () =>
    manifest("exp-text.json", [
      videoPainting("video"),
      svgPainting("text-probe", "text-probe.svg", []),
      svgPainting("outlined", "text-outlined.svg", [fragmentSelector("t=0,15")]),
      svgPainting("text-late", "text-probe.svg", [fragmentSelector("t=15,30")]),
    ]),
};

/**
 * EXPERIMENTAL, NON-STANDARD keyframe timeline paired with exp7.json.
 * Extends the annotation with a timeline OUTSIDE SVG. Not part of IIIF.
 */
const exp7Keyframes = {
  "@context": ctx(),
  id: `${ORIGIN}/manifests/exp7-keyframes.json`,
  type: "Manifest",
  label: label("experimental keyframe timeline (NON-STANDARD)"),
  extension: "experimental-keyframes",
  annotations: [
    {
      id: anchor("moving-dot"),
      keyframes: [
        { t: 10, x: 100, y: 500, metadata: "linear" },
        { t: 15, x: 300, y: 500 },
        { t: 20, x: 600, y: 500 },
      ],
    },
  ],
};

function write(dir, name, data) {
  const file = resolve(dir, name);
  const body = typeof data === "string" ? data : JSON.stringify(data, null, 2) + "\n";
  writeFileSync(file, body, "utf8");
  console.log("wrote", file);
}

for (const [name, body] of Object.entries(svgs)) write(svgDir, name, body);
for (const [name, fn] of Object.entries(manifests)) if (fn) write(mfDir, name, fn());
write(mfDir, "exp7-keyframes.json", exp7Keyframes);

console.log("fixtures complete.");