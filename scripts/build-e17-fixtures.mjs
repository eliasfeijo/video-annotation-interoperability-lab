/**
 * Builds the Experiment E17 additions to the E15 fixture family.
 *
 * E17 needs an xMaxYMax preserveAspectRatio variant that E15 never generated
 * (its PAR set was min/slice/none). The landmark contract is IDENTICAL to the
 * e15 vb1000 family (see scripts/build-e15-fixtures.mjs):
 *   viewBox 0 0 1000 1000; width/height 1000;
 *   frame rect inset 20 stroke #ff0000 width 8;
 *   circle cx=500 cy=500 r=200 fill #0000ff;
 *   four 24x24 ticks #00aa00 inside the frame corners.
 *
 * Outputs:
 *   public/svg/e17/e17-vb1000-max.svg
 *   public/svg/e17/e17-landmarks.json   (same values as e15-landmarks.json entry)
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const svgDir = resolve(root, "public", "svg", "e17");
mkdirSync(svgDir, { recursive: true });

// Landmark geometry for W=H=1000 — identical to the e15 vb1000 family.
const L = {
  W: 1000,
  H: 1000,
  frame: { x: 20, y: 20, w: 960, h: 960 },
  circle: { cx: 500, cy: 500, r: 200 },
  tick: 24,
};

const doc = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="1000" height="1000" viewBox="0 0 1000 1000" preserveAspectRatio="xMaxYMax meet">
<!-- E17 landmarks (user units; identical geometry to e15-vb1000.svg, PAR=xMaxYMax meet): frame=${JSON.stringify(L.frame)} circle=${JSON.stringify(L.circle)} tick=${L.tick} -->
<rect x="${L.frame.x}" y="${L.frame.y}" width="${L.frame.w}" height="${L.frame.h}" fill="none" stroke="#ff0000" stroke-width="8"/>
<circle cx="${L.circle.cx}" cy="${L.circle.cy}" r="${L.circle.r}" fill="#0000ff"/>
<rect x="${L.frame.x + 8}" y="${L.frame.y + 8}" width="${L.tick}" height="${L.tick}" fill="#00aa00"/>
<rect x="${L.frame.x + L.frame.w - 8 - L.tick}" y="${L.frame.y + 8}" width="${L.tick}" height="${L.tick}" fill="#00aa00"/>
<rect x="${L.frame.x + 8}" y="${L.frame.y + L.frame.h - 8 - L.tick}" width="${L.tick}" height="${L.tick}" fill="#00aa00"/>
<rect x="${L.frame.x + L.frame.w - 8 - L.tick}" y="${L.frame.y + L.frame.h - 8 - L.tick}" width="${L.tick}" height="${L.tick}" fill="#00aa00"/>
</svg>
`;
writeFileSync(resolve(svgDir, "e17-vb1000-max.svg"), doc, "utf8");
writeFileSync(resolve(svgDir, "e17-landmarks.json"), JSON.stringify({ "e17-vb1000-max.svg": L }, null, 2) + "\n", "utf8");
console.log("wrote", resolve(svgDir, "e17-vb1000-max.svg"));
console.log("wrote", resolve(svgDir, "e17-landmarks.json"));
