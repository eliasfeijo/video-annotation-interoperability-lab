/**
 * Builds the Experiment E15 fixture set.
 *
 * E15 question: is SVG painting geometry deterministic independently of the
 * embedding mechanism? The SAME landmark geometry is embedded through a matrix
 * of mechanisms (nested inline <svg> attr-sized / region-sized, <img>
 * object-fit fill/contain/none, <object>, CSS background-image) and the same
 * target regions, so the resolved Canvas-space geometry can be compared
 * mechanism against mechanism.
 *
 * Outputs:
 *   public/svg/e15/*.svg   - SVG body variants (A-D + preserveAspectRatio variants)
 *   public/manifests/e15/e15-manifest.json - Model A manifest whose painting
 *       annotations carry the same target regions as Media Fragments (provenance
 *       for the region set; also validator-checkable).
 *
 * Landmark contract (identical across variants, recorded in each SVG comment):
 *   frame  : rect inset 20 user units, stroke #ff0000 width 8 (fill none)
 *   circle : fill #0000ff at user-space centre, r = round(0.2 * min(W,H))
 *   ticks  : four 24x24 rects fill #00aa00 inside the frame corners
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const svgDir = resolve(root, "public", "svg", "e15");
const mfDir = resolve(root, "public", "manifests", "e15");
mkdirSync(svgDir, { recursive: true });
mkdirSync(mfDir, { recursive: true });

const ORIGIN = "http://localhost:5173";
const VIDEO = `${ORIGIN}/video/test-grid-1920x1080-30s.mp4`;
const CANVAS = `${ORIGIN}/canvas/e15-main`;
const PAGE_ID = `${ORIGIN}/page/e15`;
const ANNO = `${ORIGIN}/annotation/e15`;

const CTX_ANNO = "http://www.w3.org/ns/anno.jsonld";
const CTX_3 = "http://iiif.io/api/presentation/3/context.json";

// ---------------------------------------------------------------------------
// Landmark geometry per variant size
// ---------------------------------------------------------------------------
function landmarks(W, H) {
  const r = Math.round(0.2 * Math.min(W, H));
  return {
    W,
    H,
    frame: { x: 20, y: 20, w: W - 40, h: H - 40 },
    circle: { cx: Math.round(W / 2), cy: Math.round(H / 2), r },
    tick: 24,
  };
}

/** Build an SVG document for a variant. */
function makeSvg(name, opts) {
  const vb = opts.viewBox; // "0 0 1000 1000" | null
  const w = vb ? Number(vb.split(/[\s,]+/)[2]) : opts.width;
  const h = vb ? Number(vb.split(/[\s,]+/)[3]) : opts.height;
  const L = landmarks(w, h);
  const attrs = [
    `xmlns="http://www.w3.org/2000/svg"`,
    `version="1.1"`,
    `width="${w}"`,
    `height="${h}"`,
  ];
  if (vb) attrs.push(`viewBox="${vb}"`);
  if (opts.par) attrs.push(`preserveAspectRatio="${opts.par}"`);
  const t = L.tick;
  const doc = `<svg ${attrs.join(" ")}>
<!-- E15 landmarks (user units): frame=${JSON.stringify(L.frame)} circle=${JSON.stringify(L.circle)} tick=${L.tick} -->
<rect x="${L.frame.x}" y="${L.frame.y}" width="${L.frame.w}" height="${L.frame.h}" fill="none" stroke="#ff0000" stroke-width="8"/>
<circle cx="${L.circle.cx}" cy="${L.circle.cy}" r="${L.circle.r}" fill="#0000ff"/>
<rect x="${L.frame.x + 8}" y="${L.frame.y + 8}" width="${t}" height="${t}" fill="#00aa00"/>
<rect x="${L.frame.x + L.frame.w - 8 - t}" y="${L.frame.y + 8}" width="${t}" height="${t}" fill="#00aa00"/>
<rect x="${L.frame.x + 8}" y="${L.frame.y + L.frame.h - 8 - t}" width="${t}" height="${t}" fill="#00aa00"/>
<rect x="${L.frame.x + L.frame.w - 8 - t}" y="${L.frame.y + L.frame.h - 8 - t}" width="${t}" height="${t}" fill="#00aa00"/>
</svg>
`;
  writeFileSync(resolve(svgDir, name), doc, "utf8");
  console.log("wrote", resolve(svgDir, name));
  return { name, landmarks: L, viewBox: vb, par: opts.par ?? null };
}

const registry = {};

// Variant A/B: explicit viewBox (with matching width/height attributes).
for (const [key, vb] of [
  ["vb1000", "0 0 1000 1000"],
  ["vb1920x1080", "0 0 1920 1080"],
]) {
  registry[`e15-${key}.svg`] = makeSvg(`e15-${key}.svg`, { viewBox: vb });
}
// Variant C/D: NO viewBox, width/height only.
registry["e15-novb1000.svg"] = makeSvg("e15-novb1000.svg", { viewBox: null, width: 1000, height: 1000 });
registry["e15-novb1920x1080.svg"] = makeSvg("e15-novb1920x1080.svg", { viewBox: null, width: 1920, height: 1080 });

// preserveAspectRatio variants for the viewBox-bearing resources.
for (const [key, vb] of [
  ["vb1000-min", "0 0 1000 1000"],
  ["vb1000-slice", "0 0 1000 1000"],
  ["vb1000-none", "0 0 1000 1000"],
  ["vb1920x1080-min", "0 0 1920 1080"],
  ["vb1920x1080-slice", "0 0 1920 1080"],
  ["vb1920x1080-none", "0 0 1920 1080"],
]) {
  const par = key.endsWith("-min")
    ? "xMinYMin meet"
    : key.endsWith("-slice")
      ? "xMidYMid slice"
      : "none";
  registry[`e15-${key}.svg`] = makeSvg(`e15-${key}.svg`, { viewBox: vb, par });
}

// Machine-readable landmark metadata for the measurement harness.
writeFileSync(
  resolve(svgDir, "e15-landmarks.json"),
  JSON.stringify(
    Object.fromEntries(
      Object.entries(registry).map(([name, v]) => [name, v.landmarks]),
    ),
    null,
    2,
  ) + "\n",
  "utf8",
);
console.log("wrote", resolve(svgDir, "e15-landmarks.json"));

// ---------------------------------------------------------------------------
// Model A manifest carrying the same regions as Media Fragments (provenance)
// ---------------------------------------------------------------------------
const svgUrl = (name) => `${ORIGIN}/svg/e15/${name}`;
const label = (s) => ({ en: [s] });

function painting(id, bodyName, fragmentValue) {
  return {
    id: `${ANNO}/${id}`,
    type: "Annotation",
    motivation: "painting",
    target: {
      source: CANVAS,
      ...(fragmentValue ? { selector: { type: "FragmentSelector", value: fragmentValue } } : {}),
    },
    body: { id: svgUrl(bodyName), type: "Image", format: "image/svg+xml", label: label(id) },
  };
}

const REGIONS = [
  { key: "full", fragment: null },
  { key: "half", fragment: "xywh=480,270,960,540" },
  { key: "square500", fragment: "xywh=710,290,500,500" },
  { key: "rect43", fragment: "xywh=100,100,800,600" },
];

const items = [];
for (const [vname] of Object.entries(registry)) {
  for (const r of REGIONS) {
    items.push(painting(`${vname}-${r.key}`, vname, r.fragment));
  }
}

const manifest = {
  "@context": [CTX_ANNO, CTX_3],
  id: `${ORIGIN}/manifests/e15/e15-manifest.json`,
  type: "Manifest",
  label: label("E15 SVG embedding-semantics matrix (regions as Media Fragments)"),
  summary: {
    en: [
      "One painting annotation per (SVG variant x target region). Regions: full Canvas, xywh=480,270,960,540, xywh=710,290,500,500, xywh=100,100,800,600.",
    ],
  },
  items: [
    {
      id: CANVAS,
      type: "Canvas",
      width: 1920,
      height: 1080,
      duration: 30,
      label: label("E15 canvas"),
      items: [{ id: PAGE_ID, type: "AnnotationPage", items }],
    },
  ],
};
writeFileSync(resolve(mfDir, "e15-manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log("wrote", resolve(mfDir, "e15-manifest.json"));
console.log("e15 fixtures complete.");
