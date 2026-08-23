/**
 * Builds the Experiment N2 (real-consumer probe) fixture manifests.
 *
 * All manifests are STABLE IIIF Presentation 3.0 (same context/structure the
 * existing Ramp probes consumed). Bodies reuse existing deterministic lab
 * fixtures:
 *   - /svg/e15/e15-vb1000.svg     explicit viewBox landmark SVG (E15 contract)
 *   - /svg/e15/e15-novb1000.svg   no-viewBox landmark SVG
 *   - /svg/e14/e14-red-circle.png raster image
 *
 * Outputs under public/manifests/n2/:
 *   n2-temporal.json    video Canvas whose Video body carries t=10,20
 *   n2-spatial.json     video Canvas whose Video body carries xywh=100,100,800,600
 *   n2-svg-vb.json      video Canvas + explicit-viewBox SVG painting @ half region
 *   n2-svg-novb.json    video Canvas + no-viewBox SVG painting @ half region
 *   n2-raster.json      video Canvas + PNG painting @ full canvas
 *
 * The nested-Canvas stable-3 probe reuses the E16 Mode A twin
 * /manifests/e16/e16-case03-sq-full-a.json unchanged.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, "..", "public", "manifests", "n2");
mkdirSync(outDir, { recursive: true });

const O = "http://localhost:5173";
const CANVAS = `${O}/canvas/main`;
const label = (s) => ({ en: [s] });

function baseManifest(id, anns) {
  return {
    "@context": ["http://www.w3.org/ns/anno.jsonld", "http://iiif.io/api/presentation/3/context.json"],
    id: `${O}/manifests/n2/${id}`,
    type: "Manifest",
    label: label(id),
    items: [
      {
        id: CANVAS,
        type: "Canvas",
        width: 1920,
        height: 1080,
        duration: 30,
        label: label("main canvas"),
        items: [
          {
            id: `${CANVAS}/page`,
            type: "AnnotationPage",
            items: anns.map((a, i) => ({
              id: `${CANVAS}/annotation/${i}`,
              type: "Annotation",
              motivation: "painting",
              ...a,
            })),
          },
        ],
      },
    ],
  };
}

const videoBody = {
  id: `${O}/video/test-grid-1920x1080-30s.mp4`,
  type: "Video",
  format: "video/mp4",
  width: 1920,
  height: 1080,
  duration: 30,
  label: label("video"),
};

const videoAnn = (fragment) => ({
  target: fragment ? `${CANVAS}#${fragment}` : CANVAS,
  body: videoBody,
});

const svgBody = (file) => ({
  id: `${O}/svg/e15/${file}`,
  type: "Image",
  format: "image/svg+xml",
  label: label(file),
});

const manifests = {
  "n2-temporal.json": baseManifest("n2-temporal", [videoAnn("t=10,20")]),
  "n2-spatial.json": baseManifest("n2-spatial", [videoAnn("xywh=100,100,800,600")]),
  "n2-svg-vb.json": baseManifest("n2-svg-vb", [
    videoAnn(null),
    { target: `${CANVAS}#xywh=480,270,960,540`, body: svgBody("e15-vb1000.svg") },
  ]),
  "n2-svg-novb.json": baseManifest("n2-svg-novb", [
    videoAnn(null),
    { target: `${CANVAS}#xywh=480,270,960,540`, body: svgBody("e15-novb1000.svg") },
  ]),
  "n2-raster.json": baseManifest("n2-raster", [
    videoAnn(null),
    {
      target: CANVAS,
      body: { id: `${O}/svg/e14/e14-red-circle.png`, type: "Image", format: "image/png", label: label("red circle") },
    },
  ]),
};

for (const [name, json] of Object.entries(manifests)) {
  writeFileSync(resolve(outDir, name), JSON.stringify(json, null, 2) + "\n", "utf8");
  console.log("wrote", resolve(outDir, name));
}
console.log("n2 fixtures complete.");
