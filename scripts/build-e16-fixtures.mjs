/**
 * Builds Experiment E16 fixtures: IIIF 4.0 DRAFT nested-Canvas composition
 * (Model B) versus stable-IIIF-3.0-expressible direct paintings (Mode A twins).
 *
 * Outer Canvas: 1920x1080 (+duration 30) with a video painting.
 * Overlay painting: body = Inner Canvas ({type:"Canvas", partOf:[manifest]}),
 * target = outer Canvas or an outer region (Media Fragments xywh=).
 *
 * Inner Canvases (each containing two SVG paintings: one viewBox-bearing, one
 * WITHOUT viewBox — the latter probes whether nesting removes the E15/E14 SVG
 * coordinate ambiguity):
 *   inner-square.json : Canvas 1000x1000
 *   inner-169.json    : Canvas 1920x1080
 *   inner-43.json     : Canvas 640x480
 *
 * Cases (Model B, ctx presentation/4):
 *   e16-case01-same-full-b    inner-169    -> full canvas      (same aspect)
 *   e16-case02-same-reg-b     inner-169    -> xywh=100,100,960,540
 *   e16-case03-sq-full-b      inner-square -> full canvas      (1:1 -> 16:9)
 *   e16-case04-sq-reg-b       inner-square -> xywh=710,290,500,500
 *   e16-case05-43-full-b      inner-43     -> full canvas      (4:3 -> 16:9)
 *   e16-case06-169into-sq-b   inner-169    -> xywh=710,290,500,500 (16:9 -> 1:1)
 *   e16-case07-novb-b         inner-square -> xywh=480,270,960,540 (no-viewBox probe)
 *   e16-case08-temporal-b     inner-169    -> full canvas, t=10,15
 *
 * Mode A twins (-a, ctx presentation/3, STABLE): the same overlay content
 * expressed WITHOUT nested canvases, painting each inner SVG directly onto the
 * outer Canvas at the region obtained by ASPECT-PRESERVING (contain) mapping
 * of the inner Canvas into the target. These twins demonstrate what stable
 * IIIF 3.0 can already express today; comparing them against Model B fill vs
 * contain quantifies exactly which outcomes need (or don't need) the draft.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const svgDir = resolve(root, "public", "svg", "e16");
const mfDir = resolve(root, "public", "manifests", "e16");
mkdirSync(svgDir, { recursive: true });
mkdirSync(mfDir, { recursive: true });

const ORIGIN = "http://localhost:5173";
const VIDEO = `${ORIGIN}/video/test-grid-1920x1080-30s.mp4`;
const CTX_ANNO = "http://www.w3.org/ns/anno.jsonld";
const CTX_3 = "http://iiif.io/api/presentation/3/context.json";
const CTX_4 = "http://iiif.io/api/presentation/4/context.json";

const label = (s) => ({ en: [s] });
const svgUrl = (n) => `${ORIGIN}/svg/e16/${n}`;

// ---------------------------------------------------------------------------
// Landmark SVGs (frame #ff00ff, circle #00ffff, ticks #ffff00)
// ---------------------------------------------------------------------------
function makeSvg(name, { W, H, viewBox }) {
  const r = Math.round(0.2 * Math.min(W, H));
  const t = 24;
  const attrs = [
    `xmlns="http://www.w3.org/2000/svg"`,
    `version="1.1"`,
    `width="${W}"`,
    `height="${H}"`,
  ];
  if (viewBox) attrs.push(`viewBox="0 0 ${W} ${H}"`);
  const doc = `<svg ${attrs.join(" ")}>
<!-- E16 landmarks (user units): frame=${JSON.stringify({ x: 20, y: 20, w: W - 40, h: H - 40 })} circle=${JSON.stringify({ cx: Math.round(W / 2), cy: Math.round(H / 2), r })} tick=${t} -->
<rect x="20" y="20" width="${W - 40}" height="${H - 40}" fill="none" stroke="#ff00ff" stroke-width="8"/>
<circle cx="${Math.round(W / 2)}" cy="${Math.round(H / 2)}" r="${r}" fill="#00ffff"/>
<rect x="${28}" y="${28}" width="${t}" height="${t}" fill="#ffff00"/>
<rect x="${W - 28 - t}" y="${28}" width="${t}" height="${t}" fill="#ffff00"/>
<rect x="${28}" y="${H - 28 - t}" width="${t}" height="${t}" fill="#ffff00"/>
<rect x="${W - 28 - t}" y="${H - 28 - t}" width="${t}" height="${t}" fill="#ffff00"/>
</svg>
`;
  writeFileSync(resolve(svgDir, name), doc, "utf8");
  console.log("wrote", resolve(svgDir, name));
  return {
    name,
    landmarks: {
      W,
      H,
      frame: { x: 20, y: 20, w: W - 40, h: H - 40 },
      circle: { cx: Math.round(W / 2), cy: Math.round(H / 2), r },
      tick: t,
    },
    viewBox: viewBox ?? null,
  };
}

const registry = {
  "e16-shapes-sq.svg": makeSvg("e16-shapes-sq.svg", { W: 1000, H: 1000, viewBox: true }),
  "e16-shapes-169.svg": makeSvg("e16-shapes-169.svg", { W: 1920, H: 1080, viewBox: true }),
  "e16-shapes-43.svg": makeSvg("e16-shapes-43.svg", { W: 640, H: 480, viewBox: true }),
  "e16-novb-sq.svg": makeSvg("e16-novb-sq.svg", { W: 1000, H: 1000, viewBox: false }),
};

writeFileSync(
  resolve(svgDir, "e16-landmarks.json"),
  JSON.stringify(Object.fromEntries(Object.entries(registry).map(([k, v]) => [k, v.landmarks])), null, 2) + "\n",
  "utf8",
);
console.log("wrote", resolve(svgDir, "e16-landmarks.json"));

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------
const ANNO = `${ORIGIN}/annotation/e16`;
const PAGE = `${ORIGIN}/page/e16`;

function svgPainting(id, bodyName, canvasRef, selectors = []) {
  return {
    id: `${ANNO}/${id}`,
    type: "Annotation",
    motivation: ["painting"],
    target: {
      id: canvasRef,
      type: "Canvas",
      ...(selectors.length ? { selector: selectors.length === 1 ? selectors[0] : selectors } : {}),
    },
    body: { id: svgUrl(bodyName), type: "Image", format: "image/svg+xml", label: label(id) },
  };
}

/** Inner overlay manifest with ONE Canvas carrying the given svg bodies. */
function innerManifest(name, canvasId, W, H, bodyNames) {
  const mfId = `${ORIGIN}/manifests/e16/${name}`;
  return {
    "@context": [CTX_ANNO, CTX_4],
    id: mfId,
    type: "Manifest",
    label: label(`E16 inner overlay ${W}x${H} (IIIF 4.0 draft)`),
    items: [
      {
        id: canvasId,
        type: "Canvas",
        width: W,
        height: H,
        partOf: [{ id: mfId, type: "Manifest" }],
        label: label(`overlay canvas ${W}x${H}`),
        items: [
          {
            id: `${canvasId}/page`,
            type: "AnnotationPage",
            items: bodyNames.map((b, i) => svgPainting(`inner-${i}`, b, canvasId)),
          },
        ],
      },
    ],
  };
}

const inners = {
  square: innerManifest("inner-square.json", `${ORIGIN}/canvas/e16-overlay-square`, 1000, 1000, [
    "e16-shapes-sq.svg",
    "e16-novb-sq.svg",
  ]),
  "169": innerManifest("inner-169.json", `${ORIGIN}/canvas/e16-overlay-169`, 1920, 1080, [
    "e16-shapes-169.svg",
    "e16-novb-sq.svg",
  ]),
  "43": innerManifest("inner-43.json", `${ORIGIN}/canvas/e16-overlay-43`, 640, 480, [
    "e16-shapes-43.svg",
    "e16-novb-sq.svg",
  ]),
};
for (const [k, mf] of Object.entries(inners)) {
  writeFileSync(resolve(mfDir, `inner-${k}.json`), JSON.stringify(mf, null, 2) + "\n", "utf8");
  console.log("wrote", resolve(mfDir, `inner-${k}.json`));
}

const OUTER_CANVAS = `${ORIGIN}/canvas/e16-main`;
const OUTER_PAGE = `${ORIGIN}/page/e16-main`;

function modelB(name, innerKey, selectors) {
  const inner = inners[innerKey];
  const innerCanvas = inner.items[0];
  return {
    "@context": [CTX_ANNO, CTX_4],
    id: `${ORIGIN}/manifests/e16/${name}`,
    type: "Manifest",
    label: label(`${name} (IIIF 4.0 DRAFT nested Canvas)`),
    summary: {
      en: ["Overlay Canvas painted into an outer video Canvas; fit rule intentionally unspecified by the draft."],
    },
    items: [
      {
        id: OUTER_CANVAS,
        type: "Canvas",
        width: 1920,
        height: 1080,
        duration: 30,
        label: label("outer canvas"),
        items: [
          {
            id: OUTER_PAGE,
            type: "AnnotationPage",
            items: [
              {
                id: `${ANNO}/video`,
                type: "Annotation",
                motivation: ["painting"],
                target: { id: OUTER_CANVAS, type: "Canvas" },
                body: {
                  id: VIDEO,
                  type: "Video",
                  format: "video/mp4",
                  width: 1920,
                  height: 1080,
                  duration: 30.0,
                },
              },
              {
                id: `${ANNO}/overlay`,
                type: "Annotation",
                motivation: ["painting"],
                target: {
                  id: OUTER_CANVAS,
                  type: "Canvas",
                  ...(selectors?.length ? { selector: selectors } : {}),
                },
                body: {
                  id: innerCanvas.id,
                  type: "Canvas",
                  partOf: [{ id: inner.id, type: "Manifest" }],
                  width: innerCanvas.width,
                  height: innerCanvas.height,
                  label: label("overlay canvas body"),
                },
              },
            ],
          },
        ],
      },
    ],
  };
}

/** Contain-map of the inner canvas into the target region (for Mode A twins). */
function containRegion(innerW, innerH, rx, ry, rw, rh) {
  const s = Math.min(rw / innerW, rh / innerH);
  const w = innerW * s;
  const h = innerH * s;
  return { x: rx + (rw - w) / 2, y: ry + (rh - h) / 2, w, h };
}
function frag(rect) {
  return { type: "FragmentSelector", value: `xywh=${Math.round(rect.x)},${Math.round(rect.y)},${Math.round(rect.w)},${Math.round(rect.h)}` };
}

/**
 * Mode A twin (stable IIIF 3.0): direct paintings at contain-mapped regions.
 * Returns null for same-aspect targets (identical to plain direct painting).
 */
function modeATwin(name, innerKey, targetRect) {
  const dims = { square: [1000, 1000], "169": [1920, 1080], "43": [640, 480] }[innerKey];
  const [iw, ih] = dims;
  const c = containRegion(iw, ih, targetRect.x, targetRect.y, targetRect.w, targetRect.h);
  const bodies = { square: "e16-shapes-sq.svg", "169": "e16-shapes-169.svg", "43": "e16-shapes-43.svg" }[innerKey];
  const items = [
    {
      id: `${ANNO}/video-a`,
      type: "Annotation",
      motivation: "painting",
      target: OUTER_CANVAS,
      body: { id: VIDEO, type: "Video", format: "video/mp4", width: 1920, height: 1080, duration: 30.0 },
    },
    svgPainting("overlay-a", bodies, OUTER_CANVAS, [frag(c)]),
  ];
  return {
    "@context": [CTX_ANNO, CTX_3],
    id: `${ORIGIN}/manifests/e16/${name}`,
    type: "Manifest",
    label: label(`${name} (STABLE IIIF 3.0, contain-equivalent direct paintings)`),
    items: [
      {
        id: OUTER_CANVAS,
        type: "Canvas",
        width: 1920,
        height: 1080,
        duration: 30,
        label: label("outer canvas"),
        items: [{ id: OUTER_PAGE, type: "AnnotationPage", items }],
      },
    ],
  };
}

const FULL = { x: 0, y: 0, w: 1920, h: 1080 };
const REG_HALF = { x: 480, y: 270, w: 960, h: 540 };
const REG_SQ = { x: 710, y: 290, w: 500, h: 500 };

const bCases = {
  "e16-case01-same-full-b": modelB("e16-case01-same-full-b", "169", []),
  "e16-case02-same-reg-b": modelB("e16-case02-same-reg-b", "169", [frag(REG_HALF)]),
  "e16-case03-sq-full-b": modelB("e16-case03-sq-full-b", "square", []),
  "e16-case04-sq-reg-b": modelB("e16-case04-sq-reg-b", "square", [frag(REG_SQ)]),
  "e16-case05-43-full-b": modelB("e16-case05-43-full-b", "43", []),
  "e16-case06-169into-sq-b": modelB("e16-case06-169into-sq-b", "169", [frag(REG_SQ)]),
  "e16-case07-novb-b": modelB("e16-case07-novb-b", "square", [frag(REG_HALF)]),
  "e16-case08-temporal-b": (() => {
    const m = modelB("e16-case08-temporal-b", "169", []);
    m.items[0].items[0].items[1].target.selector = {
      type: "FragmentSelector",
      value: "t=10,15",
    };
    return m;
  })(),
};
for (const [name, mf] of Object.entries(bCases)) {
  writeFileSync(resolve(mfDir, `${name}.json`), JSON.stringify(mf, null, 2) + "\n", "utf8");
  console.log("wrote", resolve(mfDir, `${name}.json`));
}

const twins = {
  "e16-case03-sq-full-a": modeATwin("e16-case03-sq-full-a", "square", FULL),
  "e16-case04-sq-reg-a": modeATwin("e16-case04-sq-reg-a", "square", REG_SQ),
  "e16-case05-43-full-a": modeATwin("e16-case05-43-full-a", "43", FULL),
  "e16-case06-169into-sq-a": modeATwin("e16-case06-169into-sq-a", "169", REG_SQ),
};
for (const [name, mf] of Object.entries(twins)) {
  writeFileSync(resolve(mfDir, `${name}.json`), JSON.stringify(mf, null, 2) + "\n", "utf8");
  console.log("wrote", resolve(mfDir, `${name}.json`));
}

console.log("e16 fixtures complete.");
