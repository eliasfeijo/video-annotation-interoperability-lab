import { describe, expect, it } from "vitest";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import { resolveCompositionManifest } from "../src/reference/lib/e14.ts";
import { resolveBlindCompositionManifest } from "../src/blind/e14.ts";
import { resolveNativeManifest } from "../src/native/resolver.ts";
import { compareCompositionRecords } from "../src/composition/comparison.ts";
import type { CompositionManifest, RendererName } from "../src/composition/types.ts";

const ORIGIN = "http://localhost:5173";
const ROOT = resolve(__dirname, "..");
const MANIFEST_DIR = resolve(ROOT, "public", "manifests", "e14");
const SVG_DIR = resolve(ROOT, "public", "svg", "e14");
const EVIDENCE_DIR = resolve(ROOT, "evidence", "e14");

const CASES = [
  "e14-case01-a", "e14-case01-b", "e14-case01-c",
  "e14-case02-a", "e14-case02-b", "e14-case02-c",
  "e14-case03-a", "e14-case03-b", "e14-case03-c",
  "e14-case04-a", "e14-case04-b", "e14-case04-c",
  "e14-case05-a", "e14-case05-b", "e14-case05-c",
  "e14-case06-a", "e14-case06-b", "e14-case06-c",
  "e14-case07-a", "e14-case07-b", "e14-case07-c",
  "e14-case08-a",
  "e14-case09-a", "e14-case09-c",
  "e14-case10-a", "e14-case10-c",
  "e14-case11-a", "e14-case11-b", "e14-case11-c",
  "e14-case12-a", "e14-case12-b",
  "e14-case13-a", "e14-case13-b", "e14-case13-c",
  "e14-case14-b",
  "e14-case14reg-b",
  "e14-case15-b",
  "e14-case16-a",
];

function fetchers() {
  return {
    fetchSvg: (url: string) =>
      Promise.resolve(readFileSync(resolve(SVG_DIR, basename(new URL(url).pathname)), "utf8")),
    fetchManifest: (url: string) =>
      Promise.resolve(
        JSON.parse(readFileSync(resolve(MANIFEST_DIR, basename(new URL(url).pathname)), "utf8")),
      ),
  };
}

function loadCase(c: string): any {
  return JSON.parse(readFileSync(resolve(MANIFEST_DIR, `${c}.json`), "utf8"));
}

async function runCase(c: string): Promise<Record<RendererName, CompositionManifest>> {
  const manifest = loadCase(c);
  const url = `${ORIGIN}/manifests/e14/${c}.json`;
  const f = fetchers();
  return {
    a: await resolveCompositionManifest(manifest, url, f),
    blind: await resolveBlindCompositionManifest(manifest, url, f),
    native: await resolveNativeManifest(manifest, url, f),
  };
}

const reports = new Map<string, ReturnType<typeof compareCompositionRecords>>();

async function writeEvidence(): Promise<void> {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const summary: Record<string, unknown> = {};
  for (const c of CASES) {
    const r = reports.get(c)!;
    writeFileSync(resolve(EVIDENCE_DIR, `${c}.json`), JSON.stringify(r, null, 2), "utf8");
    summary[c] = { verdicts: r.verdicts, overlayCount: r.overlayCount };
  }
  writeFileSync(resolve(EVIDENCE_DIR, "summary.json"), JSON.stringify(summary, null, 2), "utf8");
}

describe("E14: three-renderer semantic comparison across all fixtures", () => {
  for (const c of CASES) {
    it(`${c}: resolves with all three renderers`, async () => {
      const r = await runCase(c);
      const cmp = compareCompositionRecords(r);
      reports.set(c, cmp);
      for (const name of ["a", "blind", "native"] as const) {
        expect(r[name].manifestId, `${c} ${name} manifest id`).toBe(`${ORIGIN}/manifests/e14/${c}.json`);
        expect(r[name].overlays.length, `${c} ${name} overlay count`).toBeGreaterThanOrEqual(0);
      }
    });
  }

  it("writes evidence json for every case", () => {
    expect(reports.size).toBe(CASES.length);
    void writeEvidence();
  });

  it("clean cases agree across all three renderers", () => {
    const clean = [
      "e14-case01-a", "e14-case01-b", "e14-case01-c",
      "e14-case02-a", "e14-case02-b", "e14-case02-c",
      "e14-case03-a", "e14-case03-b", "e14-case03-c",
      "e14-case04-a", "e14-case04-b", "e14-case04-c",
      "e14-case05-a", "e14-case05-b", "e14-case05-c",
      "e14-case08-a",
      "e14-case09-a", "e14-case09-c",
      "e14-case10-a", "e14-case10-c",
      "e14-case11-a", "e14-case11-b", "e14-case11-c",
      "e14-case12-a", "e14-case12-b",
      "e14-case14-b", "e14-case14reg-b", "e14-case15-b",
    ];
    for (const c of clean) {
      const r = reports.get(c)!;
      expect(r.verdicts, `${c} should be all-equal: ${JSON.stringify(r.byPair)}`).toEqual([
        "a==blind",
        "a==native",
        "blind==native",
      ]);
    }
  });

  it("case06: no-viewBox SVG-as-image divergence is the designed difference (OPEN)", () => {
    const r = reports.get("e14-case06-a")!;
    expect(r.verdicts).toEqual(["a!=blind", "a!=native", "blind==native"]);
    const placementDiffs = r.byPair
      .flatMap((p) => p.diffs)
      .filter((d) => d.field === "placement" || d.field === "placement.mode");
    expect(placementDiffs.length).toBeGreaterThan(0);
    for (const d of placementDiffs) expect(d.classification).toBe("OPEN");
    // Renderer A synthesizes a viewBox (scale ~0.54); blind/native go 1:1.
    const aOv = reports.get("e14-case06-a")!;
    expect(aOv.byPair.find((p) => p.a === "a" && p.b === "blind")!.diffs[0]!.a).toContain("viewBox-meet");
  });

  it("case07: aspect-equal no-viewBox region still differs in placement mode (OPEN)", () => {
    const r = reports.get("e14-case07-a")!;
    expect(r.verdicts).toEqual(["a!=blind", "a!=native", "blind==native"]);
  });

  it("case13-a: invalid/out-of-bounds xywh handled differently (normative divergence)", () => {
    const r = reports.get("e14-case13-a")!;
    // Media Fragments §6.2 says clients SHOULD "ignore the fragment" for
    // invalid / out-of-bounds fragments, but the consequence is ambiguous:
    //  - Renderer A keeps the fragment: xywh=2000,0,100,100 stays a distinct
    //    region (painted, clipped by the stage), zero-size falls back to the
    //    whole resource.
    //  - Blind and native treat the invalid fragment as absent: both
    //    annotations fall back to the whole resource.
    expect(r.overlayCount).toEqual({ a: 2, blind: 2, native: 2 });
    expect(r.verdicts).toEqual(["a!=blind", "a!=native", "blind==native"]);
    // The divergent overlay is the out-of-bounds one: A keeps x=2000 region,
    // blind/native resolve it to the full canvas.
    const ab = r.byPair.find((p) => p.a === "a" && p.b === "blind")!;
    const destDiff = ab.diffs.find((d) => d.field === "destination")!;
    expect(destDiff.a).toContain("2000");
    expect(destDiff.b).toBe("0,0,1920,1080");
  });

  it("case16-a: security handling differs — A and native render, blind rejects", () => {
    const r = reports.get("e14-case16-a")!;
    expect(r.overlayCount).toEqual({ a: 2, blind: 2, native: 2 });
    // A and native both render; blind rejects the unsafe body.
    expect(r.verdicts).toEqual(["a!=blind", "a==native", "blind!=native"]);
    const ab = r.byPair.find((p) => p.a === "a" && p.b === "blind")!;
    const sec = ab.diffs.find((d) => d.field === "security.decision")!;
    expect(sec.classification).toBe("CONVENTION");
    expect(sec.b).toBe("reject");
    const bn = r.byPair.find((p) => p.a === "blind" && p.b === "native")!;
    expect(bn.diffs.find((d) => d.field === "security.decision")!.classification).toBe(
      "IMPLEMENTATION_GAP",
    );
  });

  it("nested-canvas (Model B) resolves identically across renderers", () => {
    for (const c of ["e14-case14-b", "e14-case14reg-b", "e14-case15-b"]) {
      const r = reports.get(c)!;
      expect(r.verdicts, c).toEqual(["a==blind", "a==native", "blind==native"]);
    }
  });
});