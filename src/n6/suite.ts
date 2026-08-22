/**
 * N6 — black-box conformance suite T01–T15.
 *
 * Single source of truth for the suite designed in
 * research/conformance-matrix.md Part B. Expected outcomes are PRE-REGISTERED
 * here verbatim from that matrix (fixture / input / expected result / failure
 * condition); they are NOT derived from the implementation. The vitest suite
 * and the evidence generator both consume this module, so they can never
 * diverge.
 *
 * Every case is deterministic, browser-free and consumer-free by design.
 */

import type {
  ConformanceReport,
  Diagnostic,
  RequirementId,
} from "./types.ts";
import { validateManifest, validateReplacement, auditOutputVocabulary } from "./validator.ts";
import type { LandmarkInput } from "./mapping.ts";
import { scaleRadius } from "./mapping.ts";
import { parseSpatialStrict } from "./fragments.ts";

// ---------------------------------------------------------------------------
// Fixtures (patterns reused from public/svg/e15 + public/manifests/e16)
// ---------------------------------------------------------------------------

/** e15-vb1000.svg pattern: explicit viewBox + equal width/height attrs. */
const SVG_VB_1000 =
  '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="1000" height="1000" viewBox="0 0 1000 1000"></svg>';
/** e15-novb1000.svg pattern: the same body with the viewBox removed. */
const SVG_NOVB_1000 =
  '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="1000" height="1000"></svg>';
const SVG_VB_FULL_1920 =
  '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="1920" height="1080" viewBox="0 0 1920 1080"></svg>';

const SVG_TEXTS: Record<string, string> = {
  "http://example.org/svg/vb1000.svg": SVG_VB_1000,
  "http://example.org/svg/novb1000.svg": SVG_NOVB_1000,
  "http://example.org/svg/novb1000-b.svg": SVG_NOVB_1000,
  "http://example.org/svg/vb-full-1920.svg": SVG_VB_FULL_1920,
};

function fetchSvgText(url: string): Promise<string> {
  const text = SVG_TEXTS[url];
  if (text === undefined) {
    return Promise.reject(new Error(`no fixture text for ${url}`));
  }
  return Promise.resolve(text);
}

function annotation(
  id: string,
  target: unknown,
  body: unknown,
): Record<string, unknown> {
  return { id, type: "Annotation", motivation: ["painting"], target, body };
}

function svgBody(url: string): Record<string, unknown> {
  return { id: url, type: "Image", format: "image/svg+xml" };
}

function videoBody(url: string): Record<string, unknown> {
  return { id: url, type: "Video", format: "video/mp4" };
}

interface OverlayManifestInput {
  manifestId: string;
  canvasId?: string;
  canvasWidth?: number | null;
  canvasHeight?: number | null;
  annotations: Record<string, unknown>[];
}

function overlayManifest(input: OverlayManifestInput): Record<string, unknown> {
  const canvasId = input.canvasId ?? `${input.manifestId}/canvas`;
  const canvas: Record<string, unknown> = {
    id: canvasId,
    type: "Canvas",
    ...(input.canvasWidth !== undefined ? { width: input.canvasWidth } : {}),
    ...(input.canvasHeight !== undefined ? { height: input.canvasHeight } : {}),
    items: [
      {
        id: `${canvasId}/page`,
        type: "AnnotationPage",
        items: input.annotations,
      },
    ],
  };
  return {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    id: input.manifestId,
    type: "Manifest",
    items: [canvas],
  };
}

const OUTER_CANVAS = "http://example.org/canvas/outer";
const INNER_CANVAS = "http://example.org/canvas/inner-square";

/** E16 case04/case07-style nested composition (Canvas-as-body + partOf). */
function nestedManifest(opts: {
  manifestId: string;
  innerManifestId: string;
targetSelectorValue?: string;
}): Record<string, unknown> {
  return overlayManifest({
    manifestId: opts.manifestId,
    canvasId: OUTER_CANVAS,
    canvasWidth: 1920,
    canvasHeight: 1080,
    annotations: [
      annotation(
        `${opts.manifestId}/annotation/overlay`,
        {
          id: OUTER_CANVAS,
          type: "Canvas",
          selector: [
            {
              type: "FragmentSelector",
              // E16 case04 shape, pre-registered by matrix T03/T05.
              value: opts.targetSelectorValue ?? "xywh=710,290,500,500",
            },
          ],
        },
        {
          id: INNER_CANVAS,
          type: "Canvas",
          partOf: [{ id: opts.innerManifestId, type: "Manifest" }],
          width: 1000,
          height: 1000,
        },
      ),
    ],
  });
}

function innerManifestWithSvg(
  innerManifestId: string,
  svgUrl: string,
): Record<string, unknown> {
  return overlayManifest({
    manifestId: innerManifestId,
    canvasId: INNER_CANVAS,
    canvasWidth: 1000,
    canvasHeight: 1000,
    annotations: [
      annotation(
        `${innerManifestId}/annotation/leaf`,
        { id: INNER_CANVAS, type: "Canvas" },
        svgBody(svgUrl),
      ),
    ],
  });
}

const NESTED_OPTIONS = {
  fetchSvgText,
  resolveInnerManifest: (ref: { id?: unknown }) =>
    ref.id === "http://example.org/manifest/inner"
      ? innerManifestWithSvg("http://example.org/manifest/inner", "http://example.org/svg/vb1000.svg")
      : ref.id === "http://example.org/manifest/inner-novb"
        ? innerManifestWithSvg("http://example.org/manifest/inner-novb", "http://example.org/svg/novb1000.svg")
        : null,
};

// ---------------------------------------------------------------------------
// Suite machinery
// ---------------------------------------------------------------------------

export interface SuiteCase {
  id: string;
  title: string;
  requirements: RequirementId[];
  expected: string;
  failureCondition: string;
  run(collected: Map<string, SuiteCaseOutcome>): Promise<Record<string, unknown>>;
  verify(actual: Record<string, unknown>): string[];
}

export interface SuiteCaseOutcome {
  id: string;
  title: string;
  requirements: RequirementId[];
  browserDependent: false;
  consumerDependent: false;
  expected: string;
  failureCondition: string;
  actual: Record<string, unknown>;
  violations: string[];
  pass: boolean;
}

function codesOf(diagnostics: Diagnostic[]): string[] {
  return diagnostics.map((d) => d.code);
}

function findCode(diagnostics: Diagnostic[], code: string): Diagnostic[] {
  return diagnostics.filter((d) => d.code === code);
}

function violation(msg: string): string {
  return msg;
}

function check(cond: boolean, msg: string): string[] {
  return cond ? [] : [violation(msg)];
}

// ---------------------------------------------------------------------------
// T01–T15 (expected outcomes pre-registered from conformance-matrix.md)
// ---------------------------------------------------------------------------

export const SUITE: SuiteCase[] = [
  // -- Core suite ----------------------------------------------------------
  {
    id: "T01",
    title: "Conforming SVG painting body with explicit viewBox",
    requirements: ["R-S1"],
    expected:
      "PASS — conforming; emitted prediction uses region-as-viewport mapping",
    failureCondition: "Any parse error or MISSING_VIEWBOX raised",
    async run() {
      const report = await validateManifest(
        overlayManifest({
          manifestId: "n6-t01",
          canvasWidth: 1920,
          canvasHeight: 1080,
          annotations: [
            annotation(
              "n6-t01/annotation/svg",
              {
                id: OUTER_CANVAS,
                type: "Canvas",
                selector: [{ type: "FragmentSelector", value: "xywh=480,270,960,540" }],
              },
              svgBody("http://example.org/svg/vb1000.svg"),
            ),
          ],
        }),
        { fetchSvgText },
      );
      return { report };
    },
    verify(actual) {
      const report = actual.report as ConformanceReport;
      if (!report.conforming) return ["T01 expected conforming resource"];
      if (findCode(report.diagnostics, "MISSING_VIEWBOX").length > 0) {
        return ["T01 must not raise MISSING_VIEWBOX"];
      }
      if (findCode(report.diagnostics, "VIEWBOX_PRESENT").length !== 1) {
        return ["T01 expected exactly one VIEWBOX_PRESENT pass"];
      }
      const preds = report.predictions;
      if (preds.length !== 1) return ["T01 expected one region-as-viewport prediction"];
      const p = preds[0]!;
      return [
        ...check(
          p.viewport.x === 480 && p.viewport.y === 270 && p.viewport.w === 960 && p.viewport.h === 540,
          `T01 prediction viewport must equal target rect, got ${JSON.stringify(p.viewport)}`,
        ),
      ];
    },
  },
  {
    id: "T02",
    title: "ViewBox-less body rejected",
    requirements: ["R-S1", "R-S7"],
    expected:
      'FAIL with code MISSING_VIEWBOX, pointing at the offending body',
    failureCondition: "Validator passes the body or crashes without diagnostic",
    async run() {
      const report = await validateManifest(
        overlayManifest({
          manifestId: "n6-t02",
          canvasWidth: 1920,
          canvasHeight: 1080,
          annotations: [
            annotation(
              "n6-t02/annotation/svg",
              {
                id: OUTER_CANVAS,
                type: "Canvas",
                selector: [{ type: "FragmentSelector", value: "xywh=480,270,960,540" }],
              },
              svgBody("http://example.org/svg/novb1000.svg"),
            ),
          ],
        }),
        { fetchSvgText },
      );
      return { report };
    },
    verify(actual) {
      const report = actual.report as ConformanceReport;
      if (report.conforming) return ["T02 expected non-conforming"];
      const misses = findCode(report.diagnostics, "MISSING_VIEWBOX");
      if (misses.length !== 1) return ["T02 expected exactly one MISSING_VIEWBOX"];
      if (misses[0]!.location.bodyId !== "http://example.org/svg/novb1000.svg") {
        return ["T02 MISSING_VIEWBOX must point at the offending body"];
      }
      if (report.predictions.length !== 0) {
        return ["T02 must emit no geometry prediction for the excluded body"];
      }
      return [];
    },
  },
  {
    id: "T03",
    title: "Same-aspect nested Canvas painting passes P5a",
    requirements: ["R-S4", "R-S5", "R-S3"],
    expected:
      "PASS — 500·1000 == 500·1000; k = 0.5; destination == target rect",
    failureCondition: "Cross-products unequal, or k reported non-uniform",
    async run() {
      const report = await validateManifest(
        nestedManifest({ manifestId: "n6-t03", innerManifestId: "http://example.org/manifest/inner" }),
        NESTED_OPTIONS,
      );
      return { report };
    },
    verify(actual) {
      const report = actual.report as ConformanceReport;
      if (!report.conforming) return ["T03 expected conforming"];
      const aspect = findCode(report.diagnostics, "ASPECT_CONFORMS");
      if (aspect.length !== 1) return ["T03 expected one ASPECT_CONFORMS"];
      const a = aspect[0]!.actual as Record<string, unknown>;
      if (a.crossProductA !== "500000" || a.crossProductB !== "500000") {
        return [`T03 cross products wrong: ${String(a.crossProductA)} vs ${String(a.crossProductB)}`];
      }
      const mapping = report.mappings.find((m) => m.form === "painted");
      if (!mapping) return ["T03 expected a painted-form mapping"];
      if (mapping.k !== 0.5) return [`T03 expected k=0.5, got ${String(mapping.k)}`];
      if (
        mapping.translation?.x !== 710 ||
        mapping.translation?.y !== 290
      ) {
        return ["T03 destination origin must equal target rect origin (710,290)"];
      }
      return [];
    },
  },
  {
    id: "T04",
    title: "Aspect-mismatched nesting fails without any fallback fit",
    requirements: ["R-S4"],
    expected:
      'FAIL with code ASPECT_MISMATCH (1920·1000 = 1,920,000 ≠ 1080·1000 = 1,080,000); NO fallback fit value emitted',
    failureCondition: "Any fit policy attached to the failure; silent pass",
    async run() {
      const report = await validateManifest(
        overlayManifest({
          manifestId: "n6-t04",
          canvasWidth: 1920,
          canvasHeight: 1080,
          annotations: [
            annotation(
              "n6-t04/annotation/overlay",
              { id: OUTER_CANVAS, type: "Canvas" }, // full-canvas target → rect = full dims
              {
                id: INNER_CANVAS,
                type: "Canvas",
                partOf: [{ id: "http://example.org/manifest/inner", type: "Manifest" }],
                width: 1000,
                height: 1000,
              },
            ),
          ],
        }),
        NESTED_OPTIONS,
      );
      return { report };
    },
    verify(actual) {
      const report = actual.report as ConformanceReport;
      if (report.conforming) return ["T04 expected non-conforming"];
      const mismatches = findCode(report.diagnostics, "ASPECT_MISMATCH");
      if (mismatches.length !== 1) return ["T04 expected exactly one ASPECT_MISMATCH"];
      const a = mismatches[0]!.actual as Record<string, unknown>;
      if (a.crossProductA !== "1920000" || a.crossProductB !== "1080000") {
        return [`T04 cross products wrong: ${String(a.crossProductA)} vs ${String(a.crossProductB)}`];
      }
      if (report.mappings.length !== 0) {
        return ["T04 must emit no mapping for a mismatched composition"];
      }
      const serialized = JSON.stringify(report);
      if (/"(fit|fitPolicy|fitAlgorithm|fitMode)"\s*:/i.test(serialized)) {
        return ["T04 output must contain no fit parameter whatsoever"];
      }
      return [];
    },
  },
  {
    id: "T05",
    title: "Landmark mapping table (painted form and replacement form)",
    requirements: ["R-S5"],
    expected:
      "Prediction exactly (Tx + k·u, Ty + k·v) = (730, 310); replacement sample 1920×1080→3840×2160 maps tick (40,40) → (80,80), circle centre (960,540) → (1920,1080), r 100→200",
    failureCondition: "Any dual-axis scale (k_x ≠ k_y) or off-by-offset value",
    async run() {
      const painted = await validateManifest(
        nestedManifest({ manifestId: "n6-t05", innerManifestId: "http://example.org/manifest/inner" }),
        { ...NESTED_OPTIONS, landmarks: [{ x: 40, y: 40 }] },
      );
      const replacement = validateReplacement(
        { w: 1920, h: 1080 },
        { w: 3840, h: 2160 },
        { landmarks: [{ x: 40, y: 40 }, { x: 960, y: 540 }] },
      );
      return { painted, replacement, radiusScaled: scaleRadius(100, 2) };
    },
    verify(actual) {
      const painted = actual.painted as ConformanceReport;
      const m = painted.mappings.find((x) => x.form === "painted");
      if (!m || !m.landmarks || m.landmarks.length !== 1) {
        return ["T05 expected one painted landmark entry"];
      }
      const l = m.landmarks[0]!;
      const v1 = check(
        l.u === 40 && l.v === 40 && l.x === 730 && l.y === 310,
        `T05 painted landmark expected (730,310), got (${String(l.x)},${String(l.y)})`,
      );
      const rep = actual.replacement as ReturnType<typeof validateReplacement>;
      const rm = rep.mappings[0];
      if (!rm || !rm.landmarks || rm.landmarks.length !== 2) {
        return ["T05 expected two replacement landmark entries"];
      }
      const tick = rm.landmarks[0]!;
      const centre = rm.landmarks[1]!;
      const v2 = check(
        rm.k === 2 && tick.x === 80 && tick.y === 80 && centre.x === 1920 && centre.y === 1080,
        "T05 replacement mapping must be uniform k=2 with tick (80,80), centre (1920,1080)",
      );
      const r = actual.radiusScaled as number;
      const v3 = check(r === 200, `T05 radius 100 must scale to 200, got ${String(r)}`);
      return [...v1, ...v2, ...v3];
    },
  },
  {
    id: "T06",
    title: "Well-formed temporal and pixel spatial fragments accepted",
    requirements: ["R-S6a", "R-S8a"],
    expected:
      "All ACCEPTED as well-formed; temporal interval normalized to half-open [10,20)",
    failureCondition: "Well-formed fragment rejected",
    async run() {
      const base = {
        manifestId: "n6-t06",
        canvasWidth: 1920,
        canvasHeight: 1080,
      };
      const mk = (target: string, i: number) =>
        overlayManifest({
          ...base,
          manifestId: `n6-t06-${i}`,
          annotations: [annotation(`n6-t06-${i}/a`, target, videoBody("http://example.org/video.mp4"))],
        });
      const reports = [
        await validateManifest(mk("http://example.org/canvas1#t=10,20", 1)),
        await validateManifest(mk("http://example.org/canvas1#t=10", 2)),
        await validateManifest(mk("http://example.org/canvas1#xywh=pixel:100,100,800,600", 3)),
      ];
      return {
        temporal: reports.flatMap((r) => findCode(r.diagnostics, "TEMPORAL_SYNTAX_PERMITTED").map((d) => d.actual)),
        spatial: reports.flatMap((r) => findCode(r.diagnostics, "FRAGMENT_WELLFORMED").map((d) => d.actual)),
        malformedCounts: reports.map((r) => findCode(r.diagnostics, "MALFORMED_FRAGMENT").length),
        conforming: reports.map((r) => r.conforming),
      };
    },
    verify(actual) {
      const temporal = actual.temporal as Record<string, unknown>[];
      if (temporal.length !== 2) return ["T06 expected two accepted temporal fragments"];
      const interval = temporal.find((t) => t.intervalNotation === "[10,20)");
      if (!interval || interval.halfOpen !== true) {
        return ["T06 expected t=10,20 normalized to half-open [10,20)"];
      }
      if (!(temporal.some((t) => t.intervalNotation === "[10,\u221e)"))) {
        return ["T06 expected open-ended t=10 normalized as [10,∞)"];
      }
      const spatial = actual.spatial as Record<string, unknown>[];
      if (spatial.length !== 1) return ["T06 expected one accepted spatial fragment"];
      const s = spatial[0]!;
      const ok =
        s.canonicalPrefix === "pixel" &&
        s.percent === false &&
        s.x === 100 && s.y === 100 && s.w === 800 && s.h === 600;
      return check(ok, `T06 pixel rect mismatch: ${JSON.stringify(s)}`);
    },
  },
  {
    id: "T07",
    title: "Malformed fragments rejected with stable code",
    requirements: ["R-S6a"],
    expected: "REJECTED with code MALFORMED_FRAGMENT (one per input)",
    failureCondition: "Accepted silently, or crash without code",
    async run() {
      const inputs = [
        "http://example.org/canvas1#t=banana",
        "http://example.org/canvas1#xywh=1,2,3",
        "http://example.org/canvas1#t=,,",
      ];
      const reports = [];
      let i = 0;
      for (const target of inputs) {
        i += 1;
        reports.push(
          await validateManifest(
            overlayManifest({
              manifestId: `n6-t07-${i}`,
              canvasWidth: 1920,
              canvasHeight: 1080,
              annotations: [annotation(`n6-t07-${i}/a`, target, videoBody("http://example.org/video.mp4"))],
            }),
          ),
        );
      }
      return {
        perInput: reports.map((r) => ({
          malformed: findCode(r.diagnostics, "MALFORMED_FRAGMENT").map((d) => d.actual),
        })),
        conforming: reports.map((r) => r.conforming),
      };
    },
    verify(actual) {
      const perInput = actual.perInput as { malformed: Record<string, unknown>[] }[];
      if (perInput.length !== 3) return ["T07 expected three inputs"];
      const counts = perInput.map((p) => p.malformed.length);
      const v = check(
        counts.every((c) => c === 1),
        `T07 expected exactly one MALFORMED_FRAGMENT per input, got ${JSON.stringify(counts)}`,
      );
      const reasons = perInput.map((p) => String(p.malformed[0]?.reason ?? ""));
      const distinct = new Set(reasons).size === 3;
      return [...v, ...check(distinct, `T07 rejection reasons should differ per input: ${JSON.stringify(reasons)}`)];
    },
  },
  {
    id: "T08",
    title: "Annotation-page order cannot change verdicts; no stacking assertions",
    requirements: ["R-S7", "R-S1", "R-S4"],
    expected:
      "Geometry-related verdicts IDENTICAL in both orders; z-order fields absent/neutral; neither order flagged on stacking grounds",
    failureCondition: "Any z-order assertion appearing in output; differing verdicts between orders",
    async run() {
      const build = (order: "ab" | "ba") => {
        const annA = annotation(
          "n6-t08/annotation/a",
          { id: OUTER_CANVAS, type: "Canvas" },
          svgBody("http://example.org/svg/vb-full-1920.svg"),
        );
        const annB = annotation(
          "n6-t08/annotation/b",
          {
            id: OUTER_CANVAS,
            type: "Canvas",
            selector: [{ type: "FragmentSelector", value: "xywh=690,270,540,540" }],
          },
          svgBody("http://example.org/svg/vb1000.svg"),
        );
        return overlayManifest({
          manifestId: "n6-t08",
          canvasWidth: 1920,
          canvasHeight: 1080,
          annotations: order === "ab" ? [annA, annB] : [annB, annA],
        });
      };
      const reportA = await validateManifest(build("ab"), { fetchSvgText });
      const reportB = await validateManifest(build("ba"), { fetchSvgText });
      return { reportA, reportB, identical: JSON.stringify(reportA) === JSON.stringify(reportB) };
    },
    verify(actual) {
      const identical = actual.identical as boolean;
      const reportA = actual.reportA as ConformanceReport;
      const v = check(identical, "T08 outputs must be byte-identical across page orders");
      const audit = auditOutputVocabulary(reportA);
      return [
        ...v,
        ...check(audit.length === 0, `T08 vocabulary violations: ${audit.join("; ")}`),
      ];
    },
  },
  {
    id: "T09",
    title: "Intrinsic-fit expectation metadata does not rescue a viewBox-less body",
    requirements: ["R-S7", "R-S1"],
    expected:
      "NON-CONFORMING via MISSING_VIEWBOX; validator emits NO geometry guarantee of any kind for this body",
    failureCondition: "Any intrinsic-based geometry prediction emitted; any pass contingent on assumed stretch",
    async run() {
      const report = await validateManifest(
        overlayManifest({
          manifestId: "n6-t09",
          canvasWidth: 1920,
          canvasHeight: 1080,
          annotations: [
            annotation(
              "n6-t09/annotation/svg",
              {
                id: OUTER_CANVAS,
                type: "Canvas",
                selector: [{ type: "FragmentSelector", value: "xywh=480,270,960,540" }],
              },
              {
                ...svgBody("http://example.org/svg/novb1000.svg"),
                metadata: [
                  {
                    label: { en: ["embedding expectation"] },
                    value: { en: ["Consumers will scale this body's intrinsic canvas."] },
                  },
                ],
              },
            ),
          ],
        }),
        { fetchSvgText },
      );
      return { report };
    },
    verify(actual) {
      const report = actual.report as ConformanceReport;
      if (report.conforming) return ["T09 expected non-conforming"];
      if (findCode(report.diagnostics, "MISSING_VIEWBOX").length !== 1) {
        return ["T09 expected MISSING_VIEWBOX for the body"];
      }
      const declared = findCode(report.diagnostics, "EXCLUSION_RELIANCE_DECLARED");
      if (declared.length !== 1) return ["T09 expected declared intrinsic-fit reliance flagged"];
      const d = declared[0]!;
      if (d.heuristic !== true) return ["T09 exclusion flagging must be marked heuristic"];
      if ((d.actual as Record<string, unknown>).exclusionId !== "X2-intrinsic-fit") {
        return ["T09 expected exclusionId X2-intrinsic-fit"];
      }
      if (report.predictions.length !== 0) {
        return ["T09 must emit no geometry of any kind for the body"];
      }
      const fence = report.fences.find((f) => f.code === "NO_GEOMETRY_PROMISED");
      if (!fence || !(fence.subjectIds ?? []).includes("http://example.org/svg/novb1000.svg")) {
        return ["T09 expected an explicit NO_GEOMETRY_PROMISED fence naming the body"];
      }
      return [];
    },
  },
  {
    id: "T10",
    title: "Output vocabulary audit over the whole corpus",
    requirements: ["R-S7", "R-S8b", "R-S4"],
    expected:
      'Output contains no guarantee strings for unsupported bodies ("will render", "honors t=", "stacks first", fit-policy names); OPEN items appear only as explicit non-guarantee fences',
    failureCondition: "Any [OPEN]/excluded item phrased as capability or guarantee",
    async run(collected) {
      const corpus: ConformanceReport[] = [];
      for (const [id, outcome] of collected) {
        if (id === "T10") continue;
        collectReports(outcome.actual, corpus);
      }
      const audits = corpus.map((r) => ({ manifestId: r.manifestId, violations: auditOutputVocabulary(r) }));
      return { corpusSize: corpus.length, audits };
    },
    verify(actual) {
      const size = actual.corpusSize as number;
      if (size < 10) return [`T10 expected a corpus of at least 10 reports, got ${String(size)}`];
      const bad = (actual.audits as { manifestId: string; violations: string[] }[]).filter(
        (a) => a.violations.length > 0,
      );
      return check(
        bad.length === 0,
        `T10 vocabulary violations: ${JSON.stringify(bad)}`,
      );
    },
  },

  // -- Supplementary static tests -------------------------------------------
  {
    id: "T11",
    title: "pct: alias normalizes identically to percent:",
    requirements: ["R-S6b"],
    expected: "Both accepted (S6b SHOULD); identical normalized rects (per-axis split per MF §4.2.2)",
    failureCondition: "Alias rejected outright, or divergent normalizations",
    async run() {
      const pct = parseSpatialStrict("pct:50,0,25,25", 1920, 1080);
      const percent = parseSpatialStrict("percent:50,0,25,25", 1920, 1080);
      const manifestFor = (prefix: string, id: string) =>
        overlayManifest({
          manifestId: id,
          canvasWidth: 1920,
          canvasHeight: 1080,
          annotations: [
            annotation(
              `${id}/a`,
              {
                id: OUTER_CANVAS,
                type: "Canvas",
                selector: [{ type: "FragmentSelector", value: `xywh=${prefix}50,0,25,25` }],
              },
              videoBody("http://example.org/video.mp4"),
            ),
          ],
        });
      const viaPct = await validateManifest(manifestFor("pct:", "n6-t11-pct"));
      const viaPercent = await validateManifest(manifestFor("percent:", "n6-t11-percent"));
      return { pct, percent, viaPct, viaPercent };
    },
    verify(actual) {
      const pct = actual.pct as ReturnType<typeof parseSpatialStrict>;
      const percent = actual.percent as ReturnType<typeof parseSpatialStrict>;
      if (!pct.ok || !percent.ok) return ["T11 both prefixes must be accepted"];
      if (JSON.stringify(pct.value) !== JSON.stringify(percent.value)) {
        return [`T11 normalizations diverge: ${JSON.stringify(pct.value)} vs ${JSON.stringify(percent.value)}`];
      }
      const s = pct.value;
      const v1 = check(
        s.canonicalPrefix === "percent" && s.percent === true,
        "T11 canonical serialization must remain percent:",
      );
      const v2 = check(
        s.x === 960 && s.y === 0 && s.w === 480 && s.h === 270,
        `T11 per-axis split expected (960,0,480,270), got ${JSON.stringify(s)}`,
      );
      const viaPct = actual.viaPct as ConformanceReport;
      const viaPercent = actual.viaPercent as ConformanceReport;
      const aliasDiag = findCode(viaPct.diagnostics, "ALIAS_NORMALIZED");
      const v3 = check(aliasDiag.length === 1, "T11 validator must record alias normalization for pct:");
      const pctRect = findCode(viaPct.diagnostics, "FRAGMENT_WELLFORMED")[0]?.actual;
      const percentRect = findCode(viaPercent.diagnostics, "FRAGMENT_WELLFORMED")[0]?.actual;
      const v4 = check(
        JSON.stringify(pctRect) === JSON.stringify(percentRect),
        `T11 validator-level rects must be identical: ${JSON.stringify(pctRect)} vs ${JSON.stringify(percentRect)}`,
      );
      return [...v1, ...v2, ...v3, ...v4];
    },
  },
  {
    id: "T12",
    title: "Same-aspect replacement pair A passes; mismatched pair B fails",
    requirements: ["R-S4"],
    expected:
      "A: PASS, k = 2. B: FAIL ASPECT_MISMATCH. Cross products per the profile formula W'·H == H'·W: pair A 4,147,200 == 4,147,200; pair B 2,160,000 ≠ 3,840,000. NOTE (recorded ambiguity AMB-N6-1): the matrix/profile prose parentheticals quote pair B as “2,160,000 ≠ 2,073,600”, whose second value does not follow from the pre-registered formula (it equals H·W, not H'·W). The FAIL verdict is identical under both readings; this suite implements the formula stated identically in profile-draft.md Part 7.1, R-S4, and conformance-matrix.md Part A row S4.",
    failureCondition: "Wrong cross-product arithmetic; ε path applied to integers",
    async run() {
      // Landmarks included so the replacement mapping (and its k) is emitted.
      const landmarks = [{ x: 40, y: 40 }];
      const pairA = validateReplacement(
        { w: 1920, h: 1080 },
        { w: 3840, h: 2160 },
        { landmarks },
      );
      const pairB = validateReplacement(
        { w: 1920, h: 1080 },
        { w: 2000, h: 2000 },
        { landmarks },
      );
      return { pairA, pairB };
    },
    verify(actual) {
      const pairA = actual.pairA as ReturnType<typeof validateReplacement>;
      const pairB = actual.pairB as ReturnType<typeof validateReplacement>;
      const da = pairA.diagnostics[0]!;
      const db = pairB.diagnostics[0]!;
      const v1 = check(
        da.code === "ASPECT_CONFORMS" && (da.actual as Record<string, unknown>).path === "exact-integer",
        "T12 pair A must pass via exact-integer path",
      );
      const ma = pairA.mappings[0];
      const v2 = check(ma !== undefined && ma.k === 2, "T12 pair A mapping must carry k=2");
      const v3 = check(
        db.code === "ASPECT_MISMATCH" &&
          (db.actual as Record<string, unknown>).path === "exact-integer" &&
          (db.actual as Record<string, unknown>).crossProductA === "2160000" &&
          (db.actual as Record<string, unknown>).crossProductB === "3840000",
        `T12 pair B must FAIL ASPECT_MISMATCH with formula products W'·H=2160000 vs H'·W=3840000, got ${JSON.stringify(db.actual)}`,
      );
      const v4 = check(
        (da.actual as Record<string, unknown>).epsilon === undefined &&
          (db.actual as Record<string, unknown>).epsilon === undefined,
        "T12 ε path must not apply to integer values",
      );
      return [...v1, ...v2, ...v3, ...v4];
    },
  },
  {
    id: "T13",
    title: "Invalid Canvas dimensions rejected",
    requirements: ["R-S3"],
    expected:
      "Each REJECTED (MISSING_CANVAS_DIMENSION / non-positive / non-integer)",
    failureCondition: "Any accepted",
    async run() {
      const missingHeight = await validateManifest(
        overlayManifest({
          manifestId: "n6-t13-missing-height",
          canvasWidth: 1920,
          canvasHeight: null as unknown as number,
          annotations: [],
        }),
      );
      const zeroHeight = await validateManifest(
        overlayManifest({
          manifestId: "n6-t13-zero-height",
          canvasWidth: 1920,
          canvasHeight: 0,
          annotations: [],
        }),
      );
      const fractionalWidth = await validateManifest(
        overlayManifest({
          manifestId: "n6-t13-fractional-width",
          canvasWidth: 500.5,
          canvasHeight: 1080,
          annotations: [],
        }),
      );
      return {
        missingHeight: codesOf(missingHeight.diagnostics),
        zeroHeight: codesOf(zeroHeight.diagnostics),
        fractionalWidth: codesOf(fractionalWidth.diagnostics),
        conforming: [missingHeight.conforming, zeroHeight.conforming, fractionalWidth.conforming],
      };
    },
    verify(actual) {
      const mh = actual.missingHeight as string[];
      const zh = actual.zeroHeight as string[];
      const fw = actual.fractionalWidth as string[];
      const conf = actual.conforming as boolean[];
      return [
        ...check(mh.includes("MISSING_CANVAS_DIMENSION"), `T13 missing height: ${JSON.stringify(mh)}`),
        ...check(zh.includes("NONPOSITIVE_CANVAS_DIMENSION"), `T13 zero height: ${JSON.stringify(zh)}`),
        ...check(fw.includes("NONINTEGER_CANVAS_DIMENSION"), `T13 fractional width: ${JSON.stringify(fw)}`),
        ...check(conf.every((c) => c === false), "T13 all three must be non-conforming"),
      ];
    },
  },
  {
    id: "T14",
    title: "Nested SVG leaf without viewBox is rejected at depth",
    requirements: ["R-S1"],
    expected:
      "REJECTED — every SVG leaf requires its own viewBox (nesting does not exempt)",
    failureCondition: "Only root checked; leaf passes",
    async run() {
      const report = await validateManifest(nestedManifestNovb(), NESTED_OPTIONS);
      return { report };
    },
    verify(actual) {
      const report = actual.report as ConformanceReport;
      if (report.conforming) return ["T14 expected non-conforming"];
      const misses = findCode(report.diagnostics, "MISSING_VIEWBOX").filter(
        (d) => d.location.depth === 1 && d.location.manifestId === "http://example.org/manifest/inner-novb",
      );
      const v1 = check(misses.length === 1, "T14 expected MISSING_VIEWBOX for the inner leaf at depth 1");
      if (misses.length === 1) {
        const v2 = check(
          misses[0]!.location.bodyId === "http://example.org/svg/novb1000.svg",
          "T14 diagnostic must point at the leaf body",
        );
        return [...v1, ...v2];
      }
      return v1;
    },
  },
  {
    id: "T15",
    title: "Non-integer dimension pair: default reject vs documented ε path",
    requirements: ["R-S4"],
    expected:
      "Default path REJECTED per SHOULD-reject rule; ε mode records its decision with the ε ≤ 10⁻⁶ value in output",
    failureCondition: "Undocumented tolerance silently applied",
    async run() {
      const build = () =>
        overlayManifest({
          manifestId: "n6-t15",
          canvasWidth: 1920,
          canvasHeight: 1080,
          annotations: [
            annotation(
              "n6-t15/annotation/overlay",
              {
                id: OUTER_CANVAS,
                type: "Canvas",
                selector: [{ type: "FragmentSelector", value: "xywh=460,290,500.5,500" }],
              },
              {
                id: INNER_CANVAS,
                type: "Canvas",
                partOf: [{ id: "http://example.org/manifest/inner", type: "Manifest" }],
                width: 1000,
                height: 1000,
              },
            ),
          ],
        });
      const defaultPath = await validateManifest(build(), NESTED_OPTIONS);
      const epsilonPath = await validateManifest(build(), {
        ...NESTED_OPTIONS,
        epsilonMode: true,
      });
      return { defaultPath, epsilonPath };
    },
    verify(actual) {
      const defaultPath = actual.defaultPath as ConformanceReport;
      const epsilonPath = actual.epsilonPath as ConformanceReport;
      const rejected = findCode(defaultPath.diagnostics, "NONINTEGER_DIMENSIONS_REJECTED");
      const v1 = check(rejected.length >= 1, "T15 default path must reject non-integer serializations");
      const eps = findCode(epsilonPath.diagnostics, "EPSILON_DECISION_RECORDED");
      const v2 = check(eps.length >= 1, "T15 ε mode must record EPSILON_DECISION_RECORDED");
      let v3: string[] = [];
      if (eps.length >= 1) {
        const a = eps[0]!.actual as Record<string, unknown>;
        v3 = check(
          typeof a.epsilon === "number" && a.epsilon <= 1e-6 && a.epsilon > 0,
          `T15 recorded ε must be ≤ 10⁻⁶, got ${String(a.epsilon)}`,
        );
      }
      const defaultEps = JSON.stringify(defaultPath).includes('"epsilon":');
      const v4 = check(!defaultEps, "T15 default path must apply no tolerance at all");
      return [...v1, ...v2, ...v3, ...v4];
    },
  },
];

/** case07-pattern fixture whose INNER manifest carries the novb leaf. */
function nestedManifestNovb(): Record<string, unknown> {
  return nestedManifest({
    manifestId: "n6-t14",
    innerManifestId: "http://example.org/manifest/inner-novb",
  });
}

function collectReports(value: unknown, out: ConformanceReport[]): void {
  if (value === null || typeof value !== "object") return;
  const v = value as Record<string, unknown>;
  if (
    typeof v.manifestId === "string" &&
    Array.isArray(v.diagnostics) &&
    typeof v.conforming === "boolean"
  ) {
    out.push(v as unknown as ConformanceReport);
  }
  for (const child of Object.values(v)) {
    collectReports(child, out);
  }
}

/** Run all cases in order; T10 last so it can audit the whole corpus. */
export async function runSuite(): Promise<SuiteCaseOutcome[]> {
  const collected = new Map<string, SuiteCaseOutcome>();
  const ordered = [
    ...SUITE.filter((c) => c.id !== "T10"),
    ...SUITE.filter((c) => c.id === "T10"),
  ];
  for (const c of ordered) {
    const actual = await c.run(collected);
    const violations = c.verify(actual);
    collected.set(c.id, {
      id: c.id,
      title: c.title,
      requirements: c.requirements,
      browserDependent: false,
      consumerDependent: false,
      expected: c.expected,
      failureCondition: c.failureCondition,
      actual,
      violations,
      pass: violations.length === 0,
    });
  }
  return SUITE.map((c) => collected.get(c.id)!);
}

export const LANDMARKS_TICK: LandmarkInput = { x: 40, y: 40 };
