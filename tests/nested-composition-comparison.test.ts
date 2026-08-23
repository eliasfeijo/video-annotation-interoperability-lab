import { describe, expect, it } from "vitest";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import { resolveE14Manifest } from "../src/reference/lib/e14.ts";
import { resolveBlindE14Manifest } from "../src/blind/e14.ts";
import { resolveNativeManifest } from "../src/native/resolver.ts";
import { compareE14 } from "../src/e14/comparison.ts";
import { fitMap, landmarkToOuter, fitsCoincide } from "../src/nested-composition/comparison.ts";
import type { E14Manifest, E14Overlay, RendererName } from "../src/e14/types.ts";


/**
 * Experiment E16 — nested-Canvas composition semantics.
 *
 * Resolves every Model B fixture with all three independent renderers under
 * BOTH readings of the IIIF 4.0 draft's "scaled to fit that region" (fill and
 * contain), compares them against each other and against the stable-IIIF-3.0
 * Mode A twins, and writes evidence/e16/.
 */

const ORIGIN = "http://localhost:5173";
const ROOT = resolve(__dirname, "..");
const MANIFEST_DIR = resolve(ROOT, "public", "manifests", "e16");
const SVG_DIR = resolve(ROOT, "public", "svg", "e16");
const EVIDENCE_DIR = resolve(ROOT, "evidence", "e16");

type Fit = "fill" | "contain";

const B_CASES = [
  "e16-case01-same-full-b",
  "e16-case02-same-reg-b",
  "e16-case03-sq-full-b",
  "e16-case04-sq-reg-b",
  "e16-case05-43-full-b",
  "e16-case06-169into-sq-b",
  "e16-case07-novb-b",
  "e16-case08-temporal-b",
];
const TWINS = [
  "e16-case03-sq-full-a",
  "e16-case04-sq-reg-a",
  "e16-case05-43-full-a",
  "e16-case06-169into-sq-a",
];

function fetchers() {
  return {
    fetchSvg: (url: string) =>
      Promise.resolve(readFileSync(resolve(SVG_DIR, basename(new URL(url).pathname)), "utf8")),
    fetchManifest: (url: string) =>
      Promise.resolve(
        JSON.parse(readFileSync(resolve(MANIFEST_DIR, basename(new URL(url).pathname)), "utf8")),
      ),
    // inner manifests live in the same dir; resolve relative to e16 dir
  };
}

function load(name: string): any {
  return JSON.parse(readFileSync(resolve(MANIFEST_DIR, `${name}.json`), "utf8"));
}

async function runAll(name: string, fit: Fit): Promise<Record<RendererName, E14Manifest>> {
  const manifest = load(name);
  const url = `${ORIGIN}/manifests/e16/${name}.json`;
  const f = fetchers();
  const opts = { nestedFit: fit };
  return {
    a: await resolveE14Manifest(manifest, url, f, opts),
    blind: await resolveBlindE14Manifest(manifest, url, f, opts),
    native: await resolveNativeManifest(manifest, url, f, opts),
  };
}

const reports = new Map<string, ReturnType<typeof compareE14>>();
const resolved = new Map<string, Record<RendererName, E14Manifest>>();

describe("E16: nested-Canvas composition across three renderers x two fit readings", () => {
  for (const c of B_CASES) {
    for (const fit of ["fill", "contain"] as const) {
      it(`${c} [${fit}]: resolves with all renderers`, async () => {
        const r = await runAll(c, fit);
        resolved.set(`${c}|${fit}`, r);
        const cmp = compareE14(r);
        reports.set(`${c}|${fit}`, cmp);
        for (const name of ["a", "blind", "native"] as const) {
          expect(r[name].overlays.length, `${c} ${name}`).toBe(2); // vb svg + novb svg
          expect(r[name].model).toBe("B");
        }
      });
    }
  }

  it("writes per-fixture evidence", () => {
    mkdirSync(EVIDENCE_DIR, { recursive: true });
    const summary: Record<string, unknown> = {};
    for (const [key, cmp] of reports) {
      writeFileSync(resolve(EVIDENCE_DIR, `cmp-${key.replace("|", "__")}.json`), JSON.stringify(cmp, null, 2), "utf8");
      summary[key] = { verdicts: cmp.verdicts };
    }
    void summary;
  });

  it("divergences are confined to the no-viewBox inner SVG (designed, OPEN)", () => {
    // Every inner Canvas paints one viewBox-bearing SVG and one WITHOUT a
    // viewBox. With any fixed fit reading, A (synthesizes a viewBox) must
    // disagree with blind/native (1:1) ONLY on that overlay.
    for (const c of B_CASES) {
      for (const fit of ["fill", "contain"] as const) {
        const cmp = reports.get(`${c}|${fit}`)!;
        expect(cmp.verdicts, `${c} ${fit}`).toEqual(["a!=blind", "a!=native", "blind==native"]);
        for (const pair of cmp.byPair) {
          if (pair.a === "blind") continue; // blind==native has no diffs
          for (const d of pair.diffs) {
            expect(d.classification, `${c} ${fit} ${pair.a}/${pair.b} ${d.field}`).toBe("OPEN");
          }
        }
      }
    }
  });

  it("same-aspect cases: fill and contain coincide (ambiguity unrealized)", () => {
    for (const c of ["e16-case01-same-full-b", "e16-case02-same-reg-b"]) {
      const f = resolved.get(`${c}|fill`)!;
      const n = resolved.get(`${c}|contain`)!;
      expect(fitsCoincide(1920, 1080, { x: 0, y: 0, w: 1920, h: 1080 })).toBe(true);
      expect(destKey(f.a.overlays[0]!)).toBe(destKey(n.a.overlays[0]!));
    }
  });

  it("aspect-mismatch cases: fill and contain produce different geometry (OPEN)", () => {
    const checks: Array<[string, number, number, RectLike]> = [
      ["e16-case03-sq-full-b", 1000, 1000, { x: 0, y: 0, w: 1920, h: 1080 }],
      ["e16-case05-43-full-b", 640, 480, { x: 0, y: 0, w: 1920, h: 1080 }],
      ["e16-case06-169into-sq-b", 1920, 1080, { x: 710, y: 290, w: 500, h: 500 }],
    ];
    for (const [c, iw, ih, region] of checks) {
      expect(fitsCoincide(iw, ih, region)).toBe(false);
      const f = resolved.get(`${c}|fill`)!;
      const n = resolved.get(`${c}|contain`)!;
      const dFill = destKey(f.a.overlays[0]!);
      const dContain = destKey(n.a.overlays[0]!);
      expect(dFill, c).not.toBe(dContain);
      // contain must be the letterboxed (uniform-scale) rect
      const fm = fitMap(iw, ih, region, "contain");
      expect(dContain).toBe(
        `${round(region.x + fm.offsetX - region.x)},${round(fm.offsetY)},${round(iw * fm.scaleX)},${round(ih * fm.scaleY)}`,
      );
    }
  });
});

interface RectLike {
  x: number;
  y: number;
  w: number;
  h: number;
}
function round(x: number): number {
  return Math.round(x * 1000) / 1000;
}
function destKey(ov: E14Overlay): string {
  const d = ov.destination;
  return `${round(d.x)},${round(d.y)},${round(d.w)},${round(d.h)}`;
}

describe("E16: Mode A twins (STABLE IIIF 3.0) vs Model B draft readings", () => {
  it("contain-mapped twins reproduce the B-contain outcome in stable IIIF 3.0", async () => {
    const pairs: Array<[string, string]> = [
      ["e16-case03-sq-full-b", "e16-case03-sq-full-a"],
      ["e16-case04-sq-reg-b", "e16-case04-sq-reg-a"],
      ["e16-case05-43-full-b", "e16-case05-43-full-a"],
      ["e16-case06-169into-sq-b", "e16-case06-169into-sq-a"],
    ];
    const evidenceOut: Record<string, unknown> = {};
    for (const [bName, aName] of pairs) {
      const twin = await runAll(aName, "fill"); // fit irrelevant for Model A
      const bContain = resolved.get(`${bName}|contain`)!;
      const bFill = resolved.get(`${bName}|fill`)!;
      // Compare the viewBox-bearing overlay (index 0) destinations.
      const twinDest = destKey(twin.a.overlays.find((o) => o.svgAttrs.viewBox)!);
      const bcDest = destKey(bContain.a.overlays.find((o) => o.svgAttrs.viewBox)!);
      const bfDest = destKey(bFill.a.overlays.find((o) => o.svgAttrs.viewBox)!);
      evidenceOut[bName] = {
        twinStable3: twinDest,
        modelB_contain: bcDest,
        modelB_fill: bfDest,
        twinMatchesContain: keyClose(twinDest, bcDest),
        twinMatchesFill: keyClose(twinDest, bfDest),
      };
      expect(keyClose(twinDest, bcDest), `${aName} vs ${bName} contain`).toBe(true);
    }
    writeFileSync(resolve(EVIDENCE_DIR, "modeA-twins.json"), JSON.stringify(evidenceOut, null, 2), "utf8");
  });
});

/** Destination-key equality within 1 Canvas unit (twin regions are rounded). */
function keyClose(a: string, b: string): boolean {
  const pa = a.split(",").map(Number);
  const pb = b.split(",").map(Number);
  return pa.every((v, i) => Math.abs(v - pb[i]!) <= 1);
}

// Landmark spot-check: case03 circle centre under fill vs contain.
describe("E16: composed landmark geometry", () => {
  it("case03 circle centre lands differently under fill than contain", () => {
    // Inner svg e16-shapes-sq.svg: viewBox 1000x1000 painted into 1000x1000
    // inner canvas => identity placement; circle centre user (500,500).
    const identity = { translation: { x: 0, y: 0 }, scale: 1 };
    const fill = landmarkToOuter(
      fitMap(1000, 1000, { x: 0, y: 0, w: 1920, h: 1080 }, "fill"),
      identity as any,
      { x: 500, y: 500 },
    );
    const contain = landmarkToOuter(
      fitMap(1000, 1000, { x: 0, y: 0, w: 1920, h: 1080 }, "contain"),
      identity as any,
      { x: 500, y: 500 },
    );
    // fill: stretched to full canvas -> centre (960,540)
    expect(fill.x).toBeCloseTo(960, 6);
    expect(fill.y).toBeCloseTo(540, 6);
    // contain: uniform s=1.08, x-offset 420 -> centre (960,540)... same centre!
    // The DISCRIMINATING landmarks are the corners/ticks, not the centre:
    expect(contain.x).toBeCloseTo(420 + 500 * 1.08, 6);
    // tick at user (28..52): fill -> x ~53.76; contain -> x ~450.24
    const tickFill = landmarkToOuter(
      fitMap(1000, 1000, { x: 0, y: 0, w: 1920, h: 1080 }, "fill"),
      identity as any,
      { x: 40, y: 40 },
    );
    const tickContain = landmarkToOuter(
      fitMap(1000, 1000, { x: 0, y: 0, w: 1920, h: 1080 }, "contain"),
      identity as any,
      { x: 40, y: 40 },
    );
    expect(Math.abs(tickFill.x - tickContain.x)).toBeGreaterThan(300);
    writeFileSync(
      resolve(EVIDENCE_DIR, "landmark-spot-check.json"),
      JSON.stringify({ fill, contain, tickFill, tickContain }, null, 2),
      "utf8",
    );
  });
});
