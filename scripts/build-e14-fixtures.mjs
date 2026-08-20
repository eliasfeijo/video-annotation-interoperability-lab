/**
 * Builds the Experiment E14 fixture set: SVG bodies, a deterministic PNG body,
 * and IIIF / Web Annotation manifests for Models A (direct Canvas painting),
 * B (nested Overlay Canvas painting, IIIF 4.0 draft semantics), and C (W3C Web
 * Annotation, video target).
 *
 * Output goes under public/svg/e14 and public/manifests/e14.
 *
 * Naming convention:  e14-caseNN-<model>.json   (model in {a, b, c})
 *                     e14-caseNN-<model>-inner.json (Model B inner overlay manifests)
 *
 * Model B manifests use the IIIF Presentation 4.0 DRAFT context and semantics
 * (Containers as Content Resources / Nesting Containers). They are labelled as
 * draft-dependent in the evidence, never as stable IIIF 3.0.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const svgDir = resolve(root, "public", "svg", "e14");
const mfDir = resolve(root, "public", "manifests", "e14");
mkdirSync(svgDir, { recursive: true });
mkdirSync(mfDir, { recursive: true });

const ORIGIN = "http://localhost:5173";
const VIDEO = `${ORIGIN}/video/test-grid-1920x1080-30s.mp4`;
const CANVAS = `${ORIGIN}/canvas/main`;
const OVERLAY_CANVAS = `${ORIGIN}/canvas/e14-overlay`;
const OVERLAY_MANIFEST = `${ORIGIN}/manifests/e14/inner-overlay.json`;
const ANNO = `${ORIGIN}/annotation/e14`;
const PAGE = `${ORIGIN}/page/e14`;

const CTX_ANNO = "http://www.w3.org/ns/anno.jsonld";
const CTX_3 = "http://iiif.io/api/presentation/3/context.json";
const CTX_4 = "http://iiif.io/api/presentation/4/context.json";

const anchor = (id) => (id.startsWith("http") ? id : `${ANNO}/${id}`);
const svg = (name) => `${ORIGIN}/svg/e14/${name}`;
const png = (name) => `${ORIGIN}/svg/e14/${name}`;

const label = (s) => ({ en: [s] });
const fragmentSelector = (value) => ({ type: "FragmentSelector", value });
const target = (source, selectors) => {
  const sel = selectors?.length ? { selector: selectors.length === 1 ? selectors[0] : selectors } : {};
  return { source, ...sel };
};

// ---------------------------------------------------------------------------
// Deterministic PNG body (case 9)
// ---------------------------------------------------------------------------
function makePng(name) {
  const p = new PNG({ width: 1920, height: 1080 });
  const r = 300;
  const cx = 960;
  const cy = 540;
  for (let y = 0; y < 1080; y++) {
    for (let x = 0; x < 1920; x++) {
      const d = Math.hypot(x - cx, y - cy);
      const idx = (p.width * y + x) * 4;
      if (d <= r) {
        p.data[idx] = 0xe1;
        p.data[idx + 1] = 0x11;
        p.data[idx + 2] = 0x11;
        p.data[idx + 3] = 0xd9;
      } else if (d <= r + 6) {
        p.data[idx] = 0;
        p.data[idx + 1] = 0;
        p.data[idx + 2] = 0;
        p.data[idx + 3] = 0xff;
      } else {
        p.data[idx] = 0;
        p.data[idx + 1] = 0;
        p.data[idx + 2] = 0;
        p.data[idx + 3] = 0;
      }
    }
  }
  writeFileSync(resolve(svgDir, name), PNG.sync.write(p));
  console.log("wrote", resolve(svgDir, name));
}

// ---------------------------------------------------------------------------
// SVG bodies
// ---------------------------------------------------------------------------
const svgs = {
  "e14-circle.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="1920" height="1080" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet">
  <circle cx="960" cy="540" r="300" fill="#e11" fill-opacity="0.85" stroke="#000" stroke-width="8"/>
</svg>`,

  // Region-sized SVG (960x540) used with xywh targets of the same size.
  "e14-circle-960x540.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="960" height="540" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid meet">
  <circle cx="480" cy="270" r="150" fill="#e11" fill-opacity="0.85" stroke="#000" stroke-width="6"/>
</svg>`,

  // Case 5: viewBox aspect (1:1) differs from the target region aspect (16:9).
  "e14-vb-1000.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="1000" height="1000" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
  <circle cx="500" cy="500" r="200" fill="#e11" fill-opacity="0.85" stroke="#000" stroke-width="6"/>
</svg>`,

  // Case 6: NO viewBox, intrinsic 1000x1000, target region 960x540.
  "e14-noviewbox-1000.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="1000" height="1000">
  <circle cx="500" cy="500" r="200" fill="#e11" fill-opacity="0.85" stroke="#000" stroke-width="6"/>
</svg>`,

  // Case 7: NO viewBox, intrinsic == target region (960x540).
  "e14-noviewbox-region.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="960" height="540">
  <circle cx="480" cy="270" r="150" fill="#e11" fill-opacity="0.85" stroke="#000" stroke-width="6"/>
</svg>`,

  // Case 8: preserveAspectRatio variants, all with a 1:1 viewBox into a 16:9 region.
  "e14-par-meet.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
  <rect x="100" y="100" width="800" height="800" fill="none" stroke="#0af" stroke-width="12"/>
  <circle cx="500" cy="500" r="200" fill="#e11" fill-opacity="0.85"/>
</svg>`,
  "e14-par-min.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1000 1000" preserveAspectRatio="xMinYMin meet">
  <rect x="100" y="100" width="800" height="800" fill="none" stroke="#0af" stroke-width="12"/>
  <circle cx="500" cy="500" r="200" fill="#e11" fill-opacity="0.85"/>
</svg>`,
  "e14-par-slice.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
  <rect x="100" y="100" width="800" height="800" fill="none" stroke="#0af" stroke-width="12"/>
  <circle cx="500" cy="500" r="200" fill="#e11" fill-opacity="0.85"/>
</svg>`,
  "e14-par-none.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1000 1000" preserveAspectRatio="none">
  <rect x="100" y="100" width="800" height="800" fill="none" stroke="#0af" stroke-width="12"/>
  <circle cx="500" cy="500" r="200" fill="#e11" fill-opacity="0.85"/>
</svg>`,

  // Case 11 / 14 / 15: layered + nested-canvas bodies.
  "e14-rect.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080">
  <rect x="200" y="200" width="700" height="500" fill="#ffd000" fill-opacity="0.55" stroke="#333" stroke-width="8"/>
</svg>`,
  "e14-shapes.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080">
  <rect x="300" y="300" width="800" height="500" fill="#22c" fill-opacity="0.4" stroke="#fff" stroke-width="8"/>
  <circle cx="1400" cy="600" r="220" fill="#e11" fill-opacity="0.8" stroke="#000" stroke-width="6"/>
</svg>`,
  "e14-text.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080">
  <text x="960" y="540" font-size="160" fill="#0a0" font-family="Arial, sans-serif" text-anchor="middle">E14</text>
</svg>`,

  // Case 16 / 13: security triage bodies.
  "e14-safe.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080">
  <rect x="100" y="100" width="600" height="400" fill="#55f" fill-opacity="0.5"/>
  <circle cx="1400" cy="500" r="200" fill="#5f5" fill-opacity="0.5"/>
</svg>`,
  "e14-unsafe.svg": `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1920 1080">
  <script>document.title = "PWNED"</script>
  <rect x="100" y="100" width="600" height="400" fill="#f55" fill-opacity="0.5" onclick="alert('xss')"/>
  <foreignObject x="900" y="100" width="400" height="200"><div xmlns="http://www.w3.org/1999/xhtml">raw</div></foreignObject>
</svg>`,
};

// ---------------------------------------------------------------------------
// Annotation / manifest builders
// ---------------------------------------------------------------------------

/** Painting annotation whose body is an SVG / PNG Image resource. */
function svgPainting(id, bodyUrl, bodyFormat, selectors, extra = {}) {
  const body = {
    id: bodyUrl,
    type: "Image",
    format: bodyFormat,
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

/** Painting annotation whose body is the underlying video (Models A/B). */
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

/** Model B: painting annotation whose body is the nested Overlay Canvas. */
function overlayCanvasPainting(id, selectors, temporal) {
  const sel = [...(selectors ?? [])];
  if (temporal) sel.push(fragmentSelector(`t=${temporal}`));
  return {
    id: anchor(id),
    type: "Annotation",
    motivation: "painting",
    target: target(CANVAS, sel.length ? sel : undefined),
    body: {
      id: OVERLAY_CANVAS,
      type: "Canvas",
      partOf: { id: OVERLAY_MANIFEST },
      width: 1920,
      height: 1080,
      duration: 30,
      label: label(id),
    },
  };
}

/** Model A/B canvas page builder. */
function canvasBlock(id, items, context, duration = 30) {
  return {
    id,
    type: "Canvas",
    width: 1920,
    height: 1080,
    duration,
    label: label("main canvas"),
    items: [{ id: PAGE, type: "AnnotationPage", items }],
  };
}

function modelAManifest(name, items) {
  return {
    "@context": [CTX_ANNO, CTX_3],
    id: `${ORIGIN}/manifests/e14/${name}`,
    type: "Manifest",
    label: label(name.replace(/\.json$/, "")),
    items: [canvasBlock(CANVAS, items)],
  };
}

function modelBManifest(name, items) {
  return {
    "@context": [CTX_ANNO, CTX_4],
    id: `${ORIGIN}/manifests/e14/${name}`,
    type: "Manifest",
    label: label(`${name.replace(/\.json$/, "")} (IIIF 4.0 draft)`),
    items: [canvasBlock(CANVAS, items)],
  };
}

/** Model C: W3C Web Annotation Collection (video target, no IIIF Canvas). */
function modelCManifest(name, annotations) {
  return {
    "@context": CTX_ANNO,
    id: `${ORIGIN}/manifests/e14/${name}`,
    type: "AnnotationCollection",
    label: label(name.replace(/\.json$/, "")),
    items: annotations,
  };
}

/** Model C annotation: target = the video file itself + selectors. */
function cAnnotation(id, selectors, bodyUrl, bodyFormat, motivation = "highlighting") {
  return {
    id: anchor(id),
    type: "Annotation",
    motivation,
    target: target(VIDEO, selectors),
    body: { id: bodyUrl, type: "Image", format: bodyFormat, label: label(id) },
  };
}

/** The inner Overlay Canvas manifest (Model B), shared by all nested cases. */
const innerOverlayManifest = {
  "@context": [CTX_ANNO, CTX_4],
  id: OVERLAY_MANIFEST,
  type: "Manifest",
  label: label("e14 inner overlay canvas (IIIF 4.0 draft)"),
  items: [
    {
      id: OVERLAY_CANVAS,
      type: "Canvas",
      width: 1920,
      height: 1080,
      duration: 30,
      partOf: { id: OVERLAY_MANIFEST },
      label: label("overlay canvas"),
      items: [
        {
          id: `${PAGE}/overlay`,
          type: "AnnotationPage",
          items: [
            svgPainting("overlay-svg", svg("e14-shapes.svg"), "image/svg+xml", []),
          ],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Case manifests
// ---------------------------------------------------------------------------
const manifests = {};

// CASE 1: Video + SVG full canvas, temporal window t=10,15.
manifests["e14-case01-a.json"] = () =>
  modelAManifest("e14-case01-a.json", [
    videoPainting("video"),
    svgPainting("overlay", svg("e14-circle.svg"), "image/svg+xml", [fragmentSelector("t=10,15")]),
  ]);
manifests["e14-case01-b.json"] = () =>
  modelBManifest("e14-case01-b.json", [
    videoPainting("video"),
    overlayCanvasPainting("overlay-canvas", [], "10,15"),
  ]);
manifests["e14-case01-c.json"] = () =>
  modelCManifest("e14-case01-c.json", [
    cAnnotation("c1", [fragmentSelector("t=10,15")], svg("e14-circle.svg"), "image/svg+xml"),
  ]);

// CASE 2: Video + SVG spatial target xywh=pixel.
manifests["e14-case02-a.json"] = () =>
  modelAManifest("e14-case02-a.json", [
    videoPainting("video"),
    svgPainting("overlay", svg("e14-circle-960x540.svg"), "image/svg+xml", [fragmentSelector("xywh=480,270,960,540")]),
  ]);
manifests["e14-case02-b.json"] = () =>
  modelBManifest("e14-case02-b.json", [
    videoPainting("video"),
    overlayCanvasPainting("overlay-canvas", [fragmentSelector("xywh=480,270,960,540")]),
  ]);
manifests["e14-case02-c.json"] = () =>
  modelCManifest("e14-case02-c.json", [
    cAnnotation("c2", [fragmentSelector("xywh=480,270,960,540")], svg("e14-circle-960x540.svg"), "image/svg+xml"),
  ]);

// CASE 3: Video + SVG spatial target xywh=percent: (normative Media Fragments).
manifests["e14-case03-a.json"] = () =>
  modelAManifest("e14-case03-a.json", [
    videoPainting("video"),
    svgPainting("overlay", svg("e14-circle-960x540.svg"), "image/svg+xml", [fragmentSelector("xywh=percent:25,25,50,50")]),
  ]);
manifests["e14-case03-b.json"] = () =>
  modelBManifest("e14-case03-b.json", [
    videoPainting("video"),
    overlayCanvasPainting("overlay-canvas", [fragmentSelector("xywh=percent:25,25,50,50")]),
  ]);
manifests["e14-case03-c.json"] = () =>
  modelCManifest("e14-case03-c.json", [
    cAnnotation("c3", [fragmentSelector("xywh=percent:25,25,50,50")], svg("e14-circle-960x540.svg"), "image/svg+xml"),
  ]);

// CASE 4: Video + SVG temporal + spatial (xywh & t).
manifests["e14-case04-a.json"] = () =>
  modelAManifest("e14-case04-a.json", [
    videoPainting("video"),
    svgPainting("overlay", svg("e14-circle-960x540.svg"), "image/svg+xml", [fragmentSelector("xywh=480,270,960,540&t=10,15")]),
  ]);
manifests["e14-case04-b.json"] = () =>
  modelBManifest("e14-case04-b.json", [
    videoPainting("video"),
    overlayCanvasPainting("overlay-canvas", [fragmentSelector("xywh=480,270,960,540")], "10,15"),
  ]);
manifests["e14-case04-c.json"] = () =>
  modelCManifest("e14-case04-c.json", [
    cAnnotation("c4", [fragmentSelector("xywh=480,270,960,540&t=10,15")], svg("e14-circle-960x540.svg"), "image/svg+xml"),
  ]);

// CASE 5: SVG viewBox aspect differs from target region aspect.
manifests["e14-case05-a.json"] = () =>
  modelAManifest("e14-case05-a.json", [
    videoPainting("video"),
    svgPainting("overlay", svg("e14-vb-1000.svg"), "image/svg+xml", [fragmentSelector("xywh=480,270,960,540")]),
  ]);
manifests["e14-case05-b.json"] = () =>
  modelBManifest("e14-case05-b.json", [
    videoPainting("video"),
    overlayCanvasPainting("overlay-canvas", [fragmentSelector("xywh=480,270,960,540")]),
  ]);
manifests["e14-case05-c.json"] = () =>
  modelCManifest("e14-case05-c.json", [
    cAnnotation("c5", [fragmentSelector("xywh=480,270,960,540")], svg("e14-vb-1000.svg"), "image/svg+xml"),
  ]);

// CASE 6: SVG WITHOUT viewBox, intrinsic 1000x1000 != target 960x540.
manifests["e14-case06-a.json"] = () =>
  modelAManifest("e14-case06-a.json", [
    videoPainting("video"),
    svgPainting("overlay", svg("e14-noviewbox-1000.svg"), "image/svg+xml", [fragmentSelector("xywh=480,270,960,540")]),
  ]);
manifests["e14-case06-b.json"] = () =>
  modelBManifest("e14-case06-b.json", [
    videoPainting("video"),
    overlayCanvasPainting("overlay-canvas", [fragmentSelector("xywh=480,270,960,540")]),
  ]);
manifests["e14-case06-c.json"] = () =>
  modelCManifest("e14-case06-c.json", [
    cAnnotation("c6", [fragmentSelector("xywh=480,270,960,540")], svg("e14-noviewbox-1000.svg"), "image/svg+xml"),
  ]);

// CASE 7: SVG width/height == target, without viewBox.
manifests["e14-case07-a.json"] = () =>
  modelAManifest("e14-case07-a.json", [
    videoPainting("video"),
    svgPainting("overlay", svg("e14-noviewbox-region.svg"), "image/svg+xml", [fragmentSelector("xywh=480,270,960,540")]),
  ]);
manifests["e14-case07-b.json"] = () =>
  modelBManifest("e14-case07-b.json", [
    videoPainting("video"),
    overlayCanvasPainting("overlay-canvas", [fragmentSelector("xywh=480,270,960,540")]),
  ]);
manifests["e14-case07-c.json"] = () =>
  modelCManifest("e14-case07-c.json", [
    cAnnotation("c7", [fragmentSelector("xywh=480,270,960,540")], svg("e14-noviewbox-region.svg"), "image/svg+xml"),
  ]);

// CASE 8: preserveAspectRatio variants (four annotations, one region each).
manifests["e14-case08-a.json"] = () =>
  modelAManifest("e14-case08-a.json", [
    videoPainting("video"),
    svgPainting("par-meet", svg("e14-par-meet.svg"), "image/svg+xml", [fragmentSelector("xywh=0,0,960,540")]),
    svgPainting("par-min", svg("e14-par-min.svg"), "image/svg+xml", [fragmentSelector("xywh=0,540,960,540")]),
    svgPainting("par-slice", svg("e14-par-slice.svg"), "image/svg+xml", [fragmentSelector("xywh=960,0,960,540")]),
    svgPainting("par-none", svg("e14-par-none.svg"), "image/svg+xml", [fragmentSelector("xywh=960,540,960,540")]),
  ]);

// CASE 9: PNG painting control.
manifests["e14-case09-a.json"] = () =>
  modelAManifest("e14-case09-a.json", [
    videoPainting("video"),
    svgPainting("png", png("e14-red-circle.png"), "image/png", []),
  ]);
manifests["e14-case09-c.json"] = () =>
  modelCManifest("e14-case09-c.json", [
    cAnnotation("c9", [], png("e14-red-circle.png"), "image/png"),
  ]);

// CASE 10: TextualBody painting control.
manifests["e14-case10-a.json"] = () =>
  modelAManifest("e14-case10-a.json", [
    videoPainting("video"),
    {
      id: anchor("textual"),
      type: "Annotation",
      motivation: "painting",
      target: CANVAS,
      body: {
        type: "TextualBody",
        value: "E14 text overlay",
        format: "text/plain",
        language: "en",
        label: label("textual"),
      },
    },
  ]);
manifests["e14-case10-c.json"] = () =>
  modelCManifest("e14-case10-c.json", [
    {
      id: anchor("c10"),
      type: "Annotation",
      motivation: "highlighting",
      target: VIDEO,
      body: { type: "TextualBody", value: "E14 text overlay", format: "text/plain", language: "en" },
    },
  ]);

// CASE 11: multiple painting resources, z-order.
manifests["e14-case11-a.json"] = () =>
  modelAManifest("e14-case11-a.json", [
    videoPainting("video"),
    svgPainting("rect", svg("e14-rect.svg"), "image/svg+xml", []),
    svgPainting("shapes", svg("e14-shapes.svg"), "image/svg+xml", []),
    svgPainting("text", svg("e14-text.svg"), "image/svg+xml", []),
  ]);
manifests["e14-case11-b.json"] = () =>
  modelBManifest("e14-case11-b.json", [
    videoPainting("video"),
    overlayCanvasPainting("oc-rect", []),
    overlayCanvasPainting("oc-text", []),
  ]);
manifests["e14-case11-c.json"] = () =>
  modelCManifest("e14-case11-c.json", [
    cAnnotation("c11a", [], svg("e14-rect.svg"), "image/svg+xml"),
    cAnnotation("c11b", [], svg("e14-shapes.svg"), "image/svg+xml"),
    cAnnotation("c11c", [], svg("e14-text.svg"), "image/svg+xml"),
  ]);

// CASE 12: multiple AnnotationPages.
manifests["e14-case12-a.json"] = () => {
  const base = modelAManifest("e14-case12-a.json", [
    videoPainting("video"),
    svgPainting("page1", svg("e14-rect.svg"), "image/svg+xml", []),
  ]);
  base.items[0].items.push({
    id: `${PAGE}/2`,
    type: "AnnotationPage",
    items: [svgPainting("page2", svg("e14-shapes.svg"), "image/svg+xml", [])],
  });
  return base;
};
manifests["e14-case12-b.json"] = () => {
  const base = modelBManifest("e14-case12-b.json", [
    videoPainting("video"),
    overlayCanvasPainting("page1", []),
  ]);
  base.items[0].items.push({
    id: `${PAGE}/2`,
    type: "AnnotationPage",
    items: [overlayCanvasPainting("page2", [])],
  });
  return base;
};

// CASE 13: invalid / out-of-bounds xywh.
manifests["e14-case13-a.json"] = () =>
  modelAManifest("e14-case13-a.json", [
    videoPainting("video"),
    svgPainting("oob", svg("e14-circle.svg"), "image/svg+xml", [fragmentSelector("xywh=2000,0,100,100")]),
    svgPainting("zerosize", svg("e14-circle.svg"), "image/svg+xml", [fragmentSelector("xywh=0,0,0,0")]),
  ]);
manifests["e14-case13-b.json"] = () =>
  modelBManifest("e14-case13-b.json", [
    videoPainting("video"),
    overlayCanvasPainting("oob", [fragmentSelector("xywh=2000,0,100,100")]),
  ]);
manifests["e14-case13-c.json"] = () =>
  modelCManifest("e14-case13-c.json", [
    cAnnotation("c13", [fragmentSelector("xywh=2000,0,100,100")], svg("e14-circle.svg"), "image/svg+xml"),
  ]);

// CASE 14: nested Overlay Canvas (full canvas).
manifests["e14-case14-b.json"] = () =>
  modelBManifest("e14-case14-b.json", [
    videoPainting("video"),
    overlayCanvasPainting("overlay-canvas", []),
  ]);

// CASE 14 (variant): nested Overlay Canvas targeted to a sub-region.
manifests["e14-case14reg-b.json"] = () =>
  modelBManifest("e14-case14reg-b.json", [
    videoPainting("video"),
    overlayCanvasPainting("overlay-canvas", [fragmentSelector("xywh=480,270,960,540")]),
  ]);

// CASE 15: nested Overlay Canvas + temporal target.
manifests["e14-case15-b.json"] = () =>
  modelBManifest("e14-case15-b.json", [
    videoPainting("video"),
    overlayCanvasPainting("overlay-canvas", [], "10,15"),
  ]);

// CASE 16: SVG security cases.
manifests["e14-case16-a.json"] = () =>
  modelAManifest("e14-case16-a.json", [
    videoPainting("video"),
    svgPainting("safe", svg("e14-safe.svg"), "image/svg+xml", []),
    svgPainting("unsafe", svg("e14-unsafe.svg"), "image/svg+xml", []),
  ]);

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------
function write(dir, name, data) {
  const file = resolve(dir, name);
  const body = typeof data === "string" ? data : JSON.stringify(data, null, 2) + "\n";
  writeFileSync(file, body, "utf8");
  console.log("wrote", file);
}

for (const [name, body] of Object.entries(svgs)) write(svgDir, name, body);
makePng("e14-red-circle.png");
write(mfDir, "inner-overlay.json", innerOverlayManifest);
for (const [name, fn] of Object.entries(manifests)) write(mfDir, name, fn());

console.log("e14 fixtures complete.");