import { describe, expect, it } from "vitest";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, basename } from "node:path";
import { resolveManifest } from "../src/reference/lib/iiif.ts";
import { resolveBlindManifest } from "../src/blind/resolver.ts";
import { compareSemantics, type ComparisonResult } from "../src/comparison/blind-comparison.ts";

const ORIGIN = "http://localhost:5173";
const ROOT = resolve(__dirname, "..");
const MANIFEST_DIR = resolve(ROOT, "public", "manifests");
const SVG_DIR = resolve(ROOT, "public", "svg");
const EVIDENCE_DIR = resolve(ROOT, "evidence", "blind-comparison");

const CASES = [
  "case1", "case2", "case3", "case4", "case5", "case6", "case7",
  "case8", "case9", "case10", "case11", "case12", "case13",
];

function svgFetcher(url: string): Promise<string> {
  const file = basename(new URL(url).pathname);
  const path = resolve(SVG_DIR, file);
  return Promise.resolve(readFileSync(path, "utf8"));
}

interface CaseReport {
  result: ComparisonResult;
  modeBIdentical: boolean;
}

function loadCase(caseName: string): any {
  return JSON.parse(readFileSync(resolve(MANIFEST_DIR, `${caseName}.json`), "utf8"));
}

async function runCase(caseName: string): Promise<CaseReport> {
  const manifest = loadCase(caseName);
  const manifestUrl = `${ORIGIN}/manifests/${caseName}.json`;
  const ref = await resolveManifest(manifest, manifestUrl, svgFetcher);
  const blindA = await resolveBlindManifest(manifest, svgFetcher, { mode: "A" });
  const blindB = await resolveBlindManifest(manifest, svgFetcher, { mode: "B" });
  const result = compareSemantics(ref, blindA, caseName);
  const modeBIdentical =
    blindA.overlays.length === blindB.overlays.length &&
    blindA.overlays.every((o, i) => {
      const b = blindB.overlays[i]!;
      return (
        o.destination.x === b.destination.x &&
        o.destination.y === b.destination.y &&
        o.destination.w === b.destination.w &&
        o.destination.h === b.destination.h &&
        o.placement.mode === b.placement.mode &&
        o.placement.scale === b.placement.scale &&
        o.zIndex === b.zIndex &&
        o.startTime === b.startTime &&
        o.endTime === b.endTime
      );
    });
  return { result, modeBIdentical };
}

const reports = new Map<string, CaseReport>();

async function writeEvidence(): Promise<void> {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const summary: Record<string, unknown> = {};
  for (const c of CASES) {
    const r = reports.get(c)!;
    writeFileSync(
      resolve(EVIDENCE_DIR, `${c}.json`),
      JSON.stringify(
        {
          ...r.result,
          modeAIdenticalToModeB: r.modeBIdentical,
        },
        null,
        2,
      ),
      "utf8",
    );
    summary[c] = {
      verdicts: r.result.verdicts,
      classifications: r.result.classifications,
      modeAIdenticalToModeB: r.modeBIdentical,
    };
  }
  writeFileSync(
    resolve(EVIDENCE_DIR, "summary.json"),
    JSON.stringify(summary, null, 2),
    "utf8",
  );
}

describe("blind vs reference semantic comparison (all 13 cases)", () => {
  for (const c of CASES) {
    it(`${c}: runs through both renderers`, async () => {
      const r = await runCase(c);
      reports.set(c, r);
      expect(r.result.reference.length).toBeGreaterThan(0);
      expect(r.result.blind.length).toBe(r.result.reference.length);
    });
  }

  it("writes evidence json for every case", () => {
    expect(reports.size).toBe(CASES.length);
    void writeEvidence();
  });

  it("cases with no designed disagreement resolve identically", () => {
    const clean = ["case1", "case2", "case3", "case4", "case5", "case6", "case7", "case8", "case9", "case12"];
    for (const c of clean) {
      const r = reports.get(c)!;
      expect(r.result.verdicts, `${c} should be clean: ${JSON.stringify(r.result.diffs)}`).toEqual(
        r.result.verdicts.map(() => "match"),
      );
      expect(r.modeBIdentical, `${c} mode A/B geometry should match`).toBe(true);
    }
  });

  it("case10: out-of-bounds spatial fragment is the designed difference", () => {
    const r = reports.get("case10")!;
    expect(r.result.verdicts).toEqual(["match", "difference"]);
    expect(r.result.classifications[1]).toContain("spatial");
  });

  it("case11: no-viewBox placement is the designed difference", () => {
    const r = reports.get("case11")!;
    expect(r.result.verdicts).toEqual(["match", "difference"]);
    expect(r.result.classifications[1]).toContain("no-viewBox");
  });

  it("case13: unsupported + unsafe security handling are designed differences", () => {
    const r = reports.get("case13")!;
    expect(r.result.verdicts).toEqual(["match", "difference", "difference"]);
    expect(r.result.classifications[1]).toContain("security-sanitization");
    expect(r.result.classifications[2]).toContain("security-rejection");
  });
});