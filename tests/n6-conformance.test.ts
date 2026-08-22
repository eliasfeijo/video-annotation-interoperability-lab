/**
 * N6 — black-box conformance tests T01–T15.
 *
 * Expected outcomes are pre-registered in research/conformance-matrix.md
 * (Part B) and encoded once in src/n6/suite.ts; these tests assert that the
 * validator meets them exactly. They are falsifiable: any divergence between
 * pre-registered expectation and actual outcome fails here.
 */

import { describe, expect, it } from "vitest";
import { runSuite } from "../src/n6/suite.ts";
import type { ConformanceReport } from "../src/n6/types.ts";

const outcomes = await runSuite();
const byId = new Map(outcomes.map((o) => [o.id, o]));

function reportOf(id: string): ConformanceReport {
  const o = byId.get(id);
  if (!o) throw new Error(`missing suite case ${id}`);
  const r = (o.actual as { report?: unknown }).report;
  if (!r) throw new Error(`case ${id} carries no report`);
  return r as ConformanceReport;
}

function requireOutcome(id: string) {
  const o = byId.get(id);
  if (!o) throw new Error(`missing suite case ${id}`);
  return o;
}

describe("N6 conformance suite T01–T15 (pre-registered outcomes)", () => {
  for (const id of [
    "T01", "T02", "T03", "T04", "T05",
    "T06", "T07", "T08", "T09", "T10",
    "T11", "T12", "T13", "T14", "T15",
  ]) {
    it(`${id} matches its pre-registered expected outcome`, () => {
      const o = requireOutcome(id);
      expect(o.browserDependent).toBe(false);
      expect(o.consumerDependent).toBe(false);
      expect(o.violations, `${id}: ${o.violations.join("; ")}`).toEqual([]);
      expect(o.pass).toBe(true);
    });
  }
});

// Explicit falsifiable spot-checks of the load-bearing values ---------------

describe("N6 core suite details", () => {
  it("T01 emits a region-as-viewport prediction equal to the target rect", () => {
    const p = reportOf("T01").predictions[0]!;
    expect(p.viewport).toEqual({ x: 480, y: 270, w: 960, h: 540 });
    expect(p.viewBox).toEqual({ minX: 0, minY: 0, w: 1000, h: 1000 });
    expect(p.scale).toBeCloseTo(0.54, 12);
    expect(p.translation.x).toBeCloseTo(690, 9);
    expect(p.translation.y).toBeCloseTo(270, 9);
  });

  it("T02 rejects the viewBox-less body by stable code at the body location", () => {
    const d = reportOf("T02").diagnostics.find((x) => x.code === "MISSING_VIEWBOX")!;
    expect(d.requirement).toBe("R-S1");
    expect(d.status).toBe("FAIL");
    expect(d.location.bodyId).toBe("http://example.org/svg/novb1000.svg");
  });

  it("T03 records exact cross products and uniform k=0.5", () => {
    const report = reportOf("T03");
    const d = report.diagnostics.find((x) => x.code === "ASPECT_CONFORMS")!;
    expect(d.actual!.crossProductA).toBe("500000");
    expect(d.actual!.crossProductB).toBe("500000");
    expect(report.mappings[0]!.k).toBe(0.5);
    expect(report.mappings[0]!.translation).toEqual({ x: 710, y: 290 });
  });

  it("T04 reports ASPECT_MISMATCH with exact arithmetic and zero fit output", () => {
    const report = reportOf("T04");
    const d = report.diagnostics.find((x) => x.code === "ASPECT_MISMATCH")!;
    expect(d.status).toBe("FAIL");
    expect(d.actual!.crossProductA).toBe("1920000");
    expect(d.actual!.crossProductB).toBe("1080000");
    expect(report.mappings).toEqual([]);
    expect(JSON.stringify(report)).not.toMatch(/"(fit|fitPolicy|fitAlgorithm)"\s*:/i);
  });

  it("T05 mapping tables are single-scale with the documented landmarks", () => {
    const actual = requireOutcome("T05").actual as {
      painted: ConformanceReport;
      replacement: { diagnostics: { code: string }[]; mappings: { k: number; landmarks: { u: number; v: number; x: number; y: number }[] }[] };
      radiusScaled: number;
    };
    const painted = actual.painted.mappings.find((m) => m.form === "painted")!;
    expect(painted.landmarks![0]).toEqual({ u: 40, v: 40, x: 730, y: 310 });
    const rm = actual.replacement.mappings[0]!;
    expect(rm.k).toBe(2);
    expect(rm.landmarks[0]).toEqual({ u: 40, v: 40, x: 80, y: 80 });
    expect(rm.landmarks[1]).toEqual({ u: 960, v: 540, x: 1920, y: 1080 });
    expect(actual.radiusScaled).toBe(200);
    // No dual-axis scale anywhere in the emitted record.
    expect(Object.keys(rm).some((k) => /scaleX|scaleY/i.test(k))).toBe(false);
  });

  it("T06 accepts well-formed fragments and normalizes [10,20)", () => {
    const a = requireOutcome("T06").actual as {
      temporal: Record<string, unknown>[];
      spatial: Record<string, unknown>[];
      malformedCounts: number[];
      conforming: boolean[];
    };
    expect(a.temporal.map((t) => t.intervalNotation)).toContain("[10,20)");
    expect(a.malformedCounts).toEqual([0, 0, 0]);
    expect(a.conforming.every(Boolean)).toBe(true);
  });

  it("T07 rejects each malformed fragment exactly once", () => {
    const a = requireOutcome("T07").actual as {
      perInput: { malformed: Record<string, unknown>[] }[];
      conforming: boolean[];
    };
    expect(a.perInput.map((p) => p.malformed.length)).toEqual([1, 1, 1]);
    expect(a.conforming.every((c) => c === false)).toBe(true);
    expect(
      a.perInput.map((p) => String(p.malformed[0]!.dimension)),
    ).toEqual(["t", "xywh", "t"]);
  });

  it("T08 produces byte-identical verdicts under both page orders", () => {
    const a = requireOutcome("T08").actual as {
      identical: boolean;
      reportA: ConformanceReport;
      reportB: ConformanceReport;
    };
    expect(a.identical).toBe(true);
    expect(JSON.stringify(a.reportA)).not.toMatch(/zOrder|zIndex|stackOrder|stacks/i);
  });
  it("T09 flags declared intrinsic-fit reliance heuristically without geometry", () => {
    const report = reportOf("T09");
    const d = report.diagnostics.find((x) => x.code === "EXCLUSION_RELIANCE_DECLARED")!;
    expect(d.heuristic).toBe(true);
    expect(d.actual!.exclusionId).toBe("X2-intrinsic-fit");
    expect(report.predictions).toEqual([]);
    const fence = report.fences.find((f) => f.code === "NO_GEOMETRY_PROMISED");
    expect(fence?.subjectIds).toContain("http://example.org/svg/novb1000.svg");
  });

  it("T10 corpus audit finds zero vocabulary violations", () => {
    const a = requireOutcome("T10").actual as {
      corpusSize: number;
      audits: { manifestId: string; violations: string[] }[];
    };
    expect(a.corpusSize).toBeGreaterThanOrEqual(10);
    expect(a.audits.flatMap((x) => x.violations)).toEqual([]);
  });
});

describe("N6 supplementary suite details", () => {
  it("T11 pct: and percent: normalize to one identical rect", () => {
    const a = requireOutcome("T11").actual as {
      pct: { ok: boolean; value?: Record<string, unknown> };
      percent: { ok: boolean; value?: Record<string, unknown> };
    };
    expect(a.pct.ok).toBe(true);
    expect(a.percent.ok).toBe(true);
    expect(a.pct.value).toEqual({
      canonicalPrefix: "percent",
      percent: true,
      x: 960,
      y: 0,
      w: 480,
      h: 270,
    });
    expect(a.pct.value).toEqual(a.percent.value);
  });

  it("T12 pair A passes k=2; pair B fails with exact formula cross products", () => {
    const a = requireOutcome("T12").actual as {
      pairA: { diagnostics: { code: string; actual?: Record<string, unknown> }[]; mappings: { k: number }[] };
      pairB: { diagnostics: { code: string; actual?: Record<string, unknown> }[] };
    };
    expect(a.pairA.diagnostics[0]!.code).toBe("ASPECT_CONFORMS");
    expect(a.pairA.mappings[0]!.k).toBe(2);
    expect(a.pairB.diagnostics[0]!.code).toBe("ASPECT_MISMATCH");
    // Formula W'·H == H'·W (profile Part 7.1): 2000·1080 vs 2000·1920.
    // See recorded ambiguity AMB-N6-1 in src/n6/suite.ts T12.expected.
    expect(a.pairB.diagnostics[0]!.actual!.crossProductA).toBe("2160000");
    expect(a.pairB.diagnostics[0]!.actual!.crossProductB).toBe("3840000");
    expect(a.pairB.diagnostics[0]!.actual!.epsilon).toBeUndefined();
  });

  it("T13 rejects missing, non-positive, and fractional Canvas dimensions", () => {
    const a = requireOutcome("T13").actual as {
      missingHeight: string[];
      zeroHeight: string[];
      fractionalWidth: string[];
      conforming: boolean[];
    };
    expect(a.missingHeight).toContain("MISSING_CANVAS_DIMENSION");
    expect(a.zeroHeight).toContain("NONPOSITIVE_CANVAS_DIMENSION");
    expect(a.fractionalWidth).toContain("NONINTEGER_CANVAS_DIMENSION");
    expect(a.conforming).toEqual([false, false, false]);
  });

  it("T14 rejects the nested viewBox-less leaf at composition depth 1", () => {
    const report = reportOf("T14");
    const d = report.diagnostics.find(
      (x) =>
        x.code === "MISSING_VIEWBOX" &&
        x.location.depth === 1 &&
        x.location.manifestId === "http://example.org/manifest/inner-novb",
    );
    expect(d).toBeDefined();
    expect(d!.location.bodyId).toBe("http://example.org/svg/novb1000.svg");
  });

  it("T15 default path rejects; ε path records ε ≤ 10⁻⁶ explicitly", () => {
    const a = requireOutcome("T15").actual as {
      defaultPath: ConformanceReport;
      epsilonPath: ConformanceReport;
    };
    expect(
      a.defaultPath.diagnostics.some((d) => d.code === "NONINTEGER_DIMENSIONS_REJECTED"),
    ).toBe(true);
    expect(a.defaultPath.epsilonMode).toBe(false);
    const eps = a.epsilonPath.diagnostics.find((d) => d.code === "EPSILON_DECISION_RECORDED")!;
    expect((eps.actual!.epsilon as number)).toBeLessThanOrEqual(1e-6);
    expect((eps.actual!.epsilon as number)).toBeGreaterThan(0);
    expect(a.epsilonPath.epsilonMode).toBe(true);
  });
});

describe("N6 standing boundaries (every report in every case)", () => {
  it("never certifies a consumer: R-S2 is BLOCKED, R-S8b stays an open fence", () => {
    for (const id of ["T01", "T02", "T03", "T04", "T08", "T09", "T14"]) {
      const reports = collectAllReports(requireOutcome(id).actual);
      expect(reports.length, id).toBeGreaterThan(0);
      for (const report of reports) {
        const blocked = report.diagnostics.filter(
          (d) => d.code === "CONSUMER_CONFORMANCE_BLOCKED",
        );
        expect(blocked.length, id).toBeGreaterThanOrEqual(1);
        expect(blocked.every((d) => d.status === "BLOCKED"), id).toBe(true);
        const honoringFence = report.fences.find(
          (f) => f.code === "TEMPORAL_HONORING_OPEN",
        );
        expect(honoringFence, id).toBeDefined();
      }
    }
  });

  it("emits no PASS/FAIL for any consumer-side obligation", () => {
    for (const o of outcomes) {
      collectAllReports(o.actual).forEach((r) => {
        const rs2 = r.diagnostics.filter((d) => d.requirement === "R-S2");
        expect(rs2.every((d) => d.status === "BLOCKED")).toBe(true);
        const rs8b = r.diagnostics.filter((d) => d.requirement === "R-S8b");
        expect(rs8b).toEqual([]);
      });
    }
  });
});

function collectAllReports(value: unknown): ConformanceReport[] {
  const out: ConformanceReport[] = [];
  walk(value);
  return out;
  function walk(v: unknown) {
    if (v === null || typeof v !== "object") return;
    const rec = v as Record<string, unknown>;
    if (
      typeof rec.manifestId === "string" &&
      Array.isArray(rec.diagnostics) &&
      typeof rec.conforming === "boolean"
    ) {
      out.push(rec as unknown as ConformanceReport);
    }
    for (const child of Object.values(rec)) walk(child);
  }
}
