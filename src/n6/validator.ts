/**
 * N6 — resource conformance validator orchestration.
 *
 * Validates a IIIF Presentation manifest (and, when resolvable, the inner
 * manifests of nested Canvas-as-body compositions) against every currently
 * implementable requirement of the N5 Safe Interoperability Subset:
 *
 *   R-S1  explicit SVG root viewBox on painting bodies        [PROFILE]
 *   R-S3  positive integer Canvas dimensions                  [PROFILE]
 *   R-S4  same-aspect painted/replaced Canvas (P5a)           [PROFILE]
 *   R-S5  uniform-scale landmark mapping                      [DERIVED]
 *   R-S6a Media Fragments syntax / interval semantics         [NORMATIVE]
 *   R-S6b `pct:` alias normalization                          [PROFILE]
 *   R-S7  resource-side exclusions                            [PROFILE]
 *   R-S8a temporal fragment usage permission (syntax)         [NORMATIVE]
 *
 * Explicit non-goals encoded here:
 *   - R-S2 is emitted as CONSUMER_CONFORMANCE_BLOCKED: no capable consumer
 *     exists to exercise the consumer-side predicate (N2), so it is never
 *     PASS/FAIL from resource data.
 *   - R-S8b is emitted as an OPEN_FENCE with no predicate.
 *   - No fit behavior exists anywhere in this output; aspect mismatches are
 *     reported as conformance failures and nothing else (X1).
 *   - Z-order is never asserted; outputs are canonicalized so annotation-page
 *     order cannot change any verdict (T08).
 */

import type {
  ConformanceReport,
  Diagnostic,
  DiagnosticCode,
  FenceRecord,
  MappingRecord,
  RegionViewportPrediction,
  RequirementId,
  ResourceLocation,
} from "./types.ts";
import { checkCanvasDimensions } from "./canvas.ts";
import { checkSvgRootViewBox } from "./svg.ts";
import {
  aspectDecisionCode,
  epsilonDecision,
  sameAspectPainted,
  sameAspectReplacement,
  type AspectDecision,
  type Dims,
} from "./aspect.ts";
import {
  predictPaintedLandmarks,
  replacementMapping,
  type LandmarkInput,
  type TargetRect,
} from "./mapping.ts";
import { computePlacement } from "../blind/placement.ts";
import type { SvgRootAttrs } from "../blind/types.ts";
import {
  extractFragmentValue,
  parseFragmentValueStrict,
  type NormalizedSpatial,
} from "./fragments.ts";
import {
  detectDeclaredExclusionReliance,
  exclusionDiagnostics,
} from "./exclusions.ts";

export const VALIDATOR_VERSION = "n6-resource-validator@1.0.0";

/** Requirements whose FAIL verdicts make the resource non-conforming. */
const RESOURCE_REQUIREMENTS: ReadonlySet<RequirementId> = new Set([
  "R-S1",
  "R-S3",
  "R-S4",
  "R-S5",
  "R-S6a",
  "R-S6b",
  "R-S7",
  "R-S8a",
]) as ReadonlySet<RequirementId>;

export type SvgTextFetcher = (url: string) => Promise<string>;

export interface ValidateOptions {
  /** Fetches SVG document text for SVG painting bodies. */
  fetchSvgText?: SvgTextFetcher;
  /** Resolves inner manifests referenced by nested Canvas bodies (`partOf`). */
  resolveInnerManifest?: (ref: { id?: unknown }) => unknown;
  /** Sampled landmarks for R-S5 mapping tables (painted + replacement forms). */
  landmarks?: LandmarkInput[];
  /**
   * Selects the documented ε ≤ 10⁻⁶ relative-tolerance path for R-S4 on
   * non-integer serializations. The decision and ε value are recorded in the
   * output whenever this mode is used (conformance-matrix T15).
   */
  epsilonMode?: boolean;
}

function asArray<T>(x: T | T[] | undefined | null): T[] {
  if (x == null) return [];
  return Array.isArray(x) ? x : [x];
}

/** Coerce an unknown JSON field to an array of object nodes. */
function asRecords(x: unknown): Record<string, unknown>[] {
  if (x == null) return [];
  const arr = Array.isArray(x) ? x : [x];
  return arr.filter(
    (v): v is Record<string, unknown> => v !== null && typeof v === "object",
  );
}

function isPainting(ann: Record<string, unknown>): boolean {
  const m = ann.motivation;
  if (typeof m === "string") return m === "painting";
  if (Array.isArray(m)) return m.includes("painting");
  return false;
}

interface FragmentFindings {
  rect: TargetRect | null;
  diagnostics: Diagnostic[];
}

const PCT_ALIAS_RE = /(^|&)xywh=pct:/i;

/** Parse all fragment expressions of one annotation target strictly. */
function checkTargetFragments(
  target: unknown,
  canvasW: number | null,
  canvasH: number | null,
  location: ResourceLocation,
): FragmentFindings {
  const diagnostics: Diagnostic[] = [];
  const values: string[] = [];

  const collectFromString = (s: string) => {
    const frag = extractFragmentValue(s);
    if (frag !== null) values.push(frag);
  };
  if (typeof target === "string") {
    collectFromString(target);
  } else if (target !== null && typeof target === "object") {
    const t = target as Record<string, unknown>;
    if (typeof t.id === "string") collectFromString(t.id);
    if (typeof t.source === "string") collectFromString(t.source);
    else if (
      t.source !== null &&
      typeof t.source === "object" &&
      typeof (t.source as Record<string, unknown>).id === "string"
    ) {
      collectFromString((t.source as Record<string, unknown>).id as string);
    }
    for (const sel of asRecords(t.selector)) {
      if (
        sel?.type === "FragmentSelector" &&
        typeof sel.value === "string"
      ) {
        values.push(sel.value);
      }
    }
  }

  let rect: TargetRect | null = null;
  for (const value of values) {
    const aliasUsed = PCT_ALIAS_RE.test(value);
    const outcome = parseFragmentValueStrict(
      value,
      canvasW ?? undefined,
      canvasH ?? undefined,
    );
    for (const rejected of outcome.rejected) {
      diagnostics.push({
        requirement: "R-S6a",
        status: "FAIL",
        code: "MALFORMED_FRAGMENT",
        location: { ...location },
        actual: { dimension: rejected.dimension, value: rejected.raw, reason: rejected.reason },
        expected:
          "Media Fragments grammar per MF §4.2.1/§4.2.2 within the profile scope (R-S6a)",
      });
    }
    for (const accepted of outcome.accepted) {
      if (accepted.dimension === "t") {
        // R-S8a: producers MAY attach t= fragments; syntax valid regardless
        // of any consumer's honoring (which is fenced by R-S8b).
        diagnostics.push({
          requirement: "R-S8a",
          status: "PASS",
          code: "TEMPORAL_SYNTAX_PERMITTED",
          location: { ...location },
          actual: {
            intervalNotation: accepted.value.intervalNotation,
            halfOpen: true,
            start: accepted.value.start,
            ...(accepted.value.end !== undefined
              ? { end: accepted.value.end }
              : {}),
          },
          expected:
            "well-formed temporal fragment denoting half-open [begin,end) per MF §4.2.1",
        });
      } else {
        const s: NormalizedSpatial = accepted.value;
        diagnostics.push({
          requirement: "R-S6a",
          status: "PASS",
          code: "FRAGMENT_WELLFORMED",
          location: { ...location },
          actual: {
            canonicalPrefix: s.canonicalPrefix,
            percent: s.percent,
            x: s.x,
            y: s.y,
            w: s.w,
            h: s.h,
          },
          expected:
            "well-formed xywh= fragment; percent coordinates split per axis (MF §4.2.2)",
        });
        if (aliasUsed) {
          diagnostics.push({
            requirement: "R-S6b",
            status: "PASS",
            code: "ALIAS_NORMALIZED",
            location: { ...location },
            actual: { authoredPrefix: "pct:", normalizedPrefix: "percent:" },
            expected:
              "pct: accepted as equivalent to normative percent:; canonical form percent:",
          });
        }
        if (!s.percent || (canvasW !== null && canvasH !== null)) {
          rect ??= { x: s.x, y: s.y, w: s.w, h: s.h };
        }
      }
    }
  }
  return { rect, diagnostics };
}

interface AspectDiagnosticInput {
  form: "painted" | "replacement";
  decision: AspectDecision;
  location: ResourceLocation;
  epsilonMode: boolean;
  labels: { A: string; B: string };
  dims: Record<string, number>;
}

function aspectDiagnostics(input: AspectDiagnosticInput): Diagnostic[] {
  const { form, decision, location, epsilonMode, labels, dims } = input;
  const d: AspectDecision = decision;
  if (d.path === "non-integer-rejected" && epsilonMode) {
    const A =
      form === "painted"
        ? dims["Tw"]! * dims["Hb"]!
        : dims["W'"]! * dims["H"]!;
    const B =
      form === "painted"
        ? dims["Th"]! * dims["Wb"]!
        : dims["H'"]! * dims["W"]!;
    const eps = epsilonDecision(A, B);
    return [
      {
        requirement: "R-S4",
        status: eps.conforms ? "PASS" : "FAIL",
        code: "EPSILON_DECISION_RECORDED",
        location: { ...location },
        actual: {
          form,
          crossProductA: eps.crossProductA,
          crossProductB: eps.crossProductB,
          relativeDelta: eps.relativeDelta,
          epsilon: eps.epsilon,
          path: "epsilon",
        },
        expected: `relative tolerance |A−B|/max(A,B) ≤ ε applied (ε = ${eps.epsilon}); decision recorded per conformance-matrix T15`,
      },
    ];
  }
  const code: DiagnosticCode = aspectDecisionCode(d);
  if (code === "NONINTEGER_DIMENSIONS_REJECTED") {
    return [
      {
        requirement: "R-S4",
        status: "FAIL",
        code,
        location: { ...location },
        actual: { form, nonIntegers: (d as { nonIntegers: string[] }).nonIntegers },
        expected:
          "non-integer dimension serializations are rejected by default (SHOULD); select documented ε mode to compare instead",
      },
    ];
  }
  const conforms = d.conforms;
  return [
    {
      requirement: "R-S4",
      status: conforms ? "PASS" : "FAIL",
      code,
      location: { ...location },
      actual: {
        form,
        path: d.path,
        crossProductA: d.path === "exact-integer" ? d.crossProductA : undefined,
        crossProductB: d.path === "exact-integer" ? d.crossProductB : undefined,
        formula: `${labels.A} vs ${labels.B}`,
        ...dims,
      },
      expected:
        conforms
          ? `same aspect (${labels.A} == ${labels.B})`
          : `same aspect required (${labels.A} == ${labels.B}); aspect-mismatched compositions are excluded (X1) with no assigned placement behavior`,
    },
  ];
}

function stableKey(o: unknown): string {
  return JSON.stringify(o, (_k, v) =>
    v === undefined ? "\u0000undefined" : v,
  );
}

/** Canonicalize report arrays so encounter order can never change verdicts. */
function canonicalize(
  diagnostics: Diagnostic[],
  mappings: MappingRecord[],
  predictions: RegionViewportPrediction[],
): void {
  const diagKey = (d: Diagnostic) =>
    [
      d.requirement,
      d.code,
      d.status,
      stableKey(d.location),
      d.expected,
      stableKey(d.actual ?? null),
    ].join("\u0001");
  diagnostics.sort((a, b) => (diagKey(a) < diagKey(b) ? -1 : diagKey(a) > diagKey(b) ? 1 : 0));
  const mapKey = (m: MappingRecord) =>
    [m.form, String(m.k), stableKey(m.location)].join("\u0001");
  mappings.sort((a, b) => (mapKey(a) < mapKey(b) ? -1 : mapKey(a) > mapKey(b) ? 1 : 0));
  const predKey = (p: RegionViewportPrediction) =>
    [stableKey(p.location), stableKey(p.viewport), String(p.scale ?? "")].join("\u0001");
  predictions.sort((a, b) => (predKey(a) < predKey(b) ? -1 : predKey(a) > predKey(b) ? 1 : 0));
}

/**
 * Validate one manifest node at a composition depth, accumulating results
 * into shared arrays. Nested Canvas bodies recurse via resolveInnerManifest.
 */
async function validateInto(
  manifestNode: Record<string, unknown>,
  depth: number,
  fallbackManifestId: string,
  options: ValidateOptions,
  acc: {
    diagnostics: Diagnostic[];
    mappings: MappingRecord[];
    predictions: RegionViewportPrediction[];
    noGeometryFor: Set<string>;
  },
): Promise<void> {
  const manifestId =
    typeof manifestNode.id === "string" ? manifestNode.id : fallbackManifestId;
  const items = asRecords(manifestNode.items);
  for (const canvas of items.filter((c) => c?.type === "Canvas")) {
    const canvasId = typeof canvas.id === "string" ? canvas.id : undefined;
    const canvasLoc: ResourceLocation = {
      manifestId,
      ...(canvasId !== undefined ? { canvasId } : {}),
      depth,
    };

    // ---- R-S3 ------------------------------------------------------------
    acc.diagnostics.push(...checkCanvasDimensions(canvas, canvasLoc));

    const wOk =
      typeof canvas.width === "number" &&
      Number.isInteger(canvas.width) &&
      canvas.width > 0;
    const hOk =
      typeof canvas.height === "number" &&
      Number.isInteger(canvas.height) &&
      canvas.height > 0;
    const fullRect: TargetRect | null =
      wOk && hOk
        ? { x: 0, y: 0, w: canvas.width as number, h: canvas.height as number }
        : null;

    // Declared exclusion reliance on the Canvas node itself (R-S7 heuristic).
    acc.diagnostics.push(
      ...exclusionDiagnostics(
        detectDeclaredExclusionReliance(canvas),
        canvasLoc,
      ),
    );

    for (const page of asRecords(canvas.items).filter(
      (p) => p?.type === "AnnotationPage",
    )) {
      for (const ann of asRecords(page.items).filter(
        (a) => a?.type === "Annotation" && isPainting(a),
      )) {
        const annotationId =
          typeof ann.id === "string" ? ann.id : undefined;
        const annLoc: ResourceLocation = {
          ...canvasLoc,
          ...(annotationId !== undefined ? { annotationId } : {}),
        };

        // Declared exclusion reliance on the Annotation node (R-S7 heuristic).
        acc.diagnostics.push(
          ...exclusionDiagnostics(detectDeclaredExclusionReliance(ann), annLoc),
        );

        // ---- R-S6a / R-S6b / R-S8a -------------------------------------
        const findings = checkTargetFragments(
          ann.target,
          wOk ? (canvas.width as number) : null,
          hOk ? (canvas.height as number) : null,
          annLoc,
        );
        acc.diagnostics.push(...findings.diagnostics);

        const rect: TargetRect | null = findings.rect ?? fullRect;

        const bodies = asRecords(ann.body).filter(
          (b) => b !== null && typeof b === "object",
        );
        for (const body of bodies) {
          const bodyId = typeof body.id === "string" ? body.id : undefined;
          const bodyLoc: ResourceLocation = {
            ...annLoc,
            ...(bodyId !== undefined ? { bodyId } : {}),
          };

          // Declared exclusion reliance on the body node (R-S7 heuristic).
          acc.diagnostics.push(
            ...exclusionDiagnostics(
              detectDeclaredExclusionReliance(body),
              bodyLoc,
            ),
          );

          const format = String(body.format ?? "");
          const isSvg =
            format === "image/svg+xml" ||
            (/\.svg(\?|$)/i.test(bodyId ?? ""));
          const isCanvasBody = body.type === "Canvas";

          if (isSvg) {
            await validateSvgBody(body, svgTextOf(bodyId, options), rect, bodyLoc, acc);
          } else if (isCanvasBody) {
            await validateCanvasBody(canvas, body, rect, bodyLoc, manifestId, depth, options, acc);
          }
          // Other body kinds (video/audio/raster): no S-rule geometry applies.
        }
      }
    }
  }
}

function svgTextOf(bodyId: string | undefined, options: ValidateOptions): Promise<string> {
  if (!options.fetchSvgText) {
    return Promise.reject(
      new Error("fetchSvgText option required to validate SVG painting bodies"),
    );
  }
  if (bodyId === undefined) {
    return Promise.reject(new Error("SVG painting body without an id"));
  }
  return options.fetchSvgText(bodyId);
}

async function validateSvgBody(
  body: Record<string, unknown>,
  svgTextPromise: Promise<string>,
  rect: TargetRect | null,
  bodyLoc: ResourceLocation,
  acc: {
    diagnostics: Diagnostic[];
    mappings: MappingRecord[];
    predictions: RegionViewportPrediction[];
    noGeometryFor: Set<string>;
  },
): Promise<void> {
  let svgText: string;
  try {
    svgText = await svgTextPromise;
  } catch (err) {
    acc.diagnostics.push({
      requirement: "R-S1",
      status: "FAIL",
      code: "MISSING_VIEWBOX",
      location: { ...bodyLoc },
      actual: { error: err instanceof Error ? err.message : String(err) },
      expected: "fetchable SVG document text for the painting body",
    });
    return;
  }
  const root = checkSvgRootViewBox(svgText, bodyLoc);
  acc.diagnostics.push(root.diagnostic);
  if (root.viewBox !== null && rect !== null) {
    // Declarative region-as-viewport prediction for the conforming body
    // (R-S2 assignment computed analytically). NOT a consumer claim; the
    // report carries CONSUMER_CONFORMANCE_BLOCKED for that boundary.
    const attrs: SvgRootAttrs = {
      viewBox: root.viewBox,
      ...(root.preserveAspectRatio !== null
        ? { preserveAspectRatio: root.preserveAspectRatio }
        : {}),
    };
    const placement = computePlacement({ destination: rect, attrs });
    acc.predictions.push({
      ...(bodyLoc.bodyId !== undefined ? { bodyId: bodyLoc.bodyId } : {}),
      viewport: placement.viewport,
      viewBox: root.viewBox,
      preserveAspectRatio: placement.preserveAspectRatio ?? "xMidYMid meet",
      scale: placement.scale,
      translation: placement.translation,
      location: { ...bodyLoc },
    });
  } else if (root.viewBox === null) {
    // R-S7(a): viewBox-less bodies get NO geometry of any kind.
    if (bodyLoc.bodyId !== undefined) acc.noGeometryFor.add(bodyLoc.bodyId);
  }
}

async function validateCanvasBody(
  targetCanvas: Record<string, unknown>,
  body: Record<string, unknown>,
  rect: TargetRect | null,
  bodyLoc: ResourceLocation,
  parentManifestId: string,
  depth: number,
  options: ValidateOptions,
  acc: {
    diagnostics: Diagnostic[];
    mappings: MappingRecord[];
    predictions: RegionViewportPrediction[];
    noGeometryFor: Set<string>;
  },
): Promise<void> {
  const epsilonMode = options.epsilonMode === true;
  const landmarks = options.landmarks ?? [];

  const inlineDims: Dims | null =
    typeof body.width === "number" && typeof body.height === "number"
      ? { w: body.width, h: body.height }
      : null;

  // Resolve the inner manifest for recursion (R-S1/R-S3 at all depths).
  let innerManifest: Record<string, unknown> | null = null;
  const partOf = asRecords(body.partOf);
  const innerRef = partOf[0];
  if (innerRef !== undefined && options.resolveInnerManifest) {
    const resolved = options.resolveInnerManifest(innerRef);
    if (resolved !== null && typeof resolved === "object") {
      innerManifest = resolved as Record<string, unknown>;
    }
  }

  // Painted-form dimensions: inline first, then the resolved inner Canvas.
  let paintedDims = inlineDims;
  if (paintedDims === null && innerManifest !== null) {
    const innerCanvas = asRecords(
      innerManifest.items,
    ).find((i) => i?.type === "Canvas");
    if (
      innerCanvas &&
      typeof innerCanvas.width === "number" &&
      typeof innerCanvas.height === "number"
    ) {
      paintedDims = { w: innerCanvas.width, h: innerCanvas.height };
    }
  }

  // ---- R-S4 painted form -------------------------------------------------
  if (rect !== null && paintedDims !== null) {
    const decision = sameAspectPainted(
      { w: rect.w, h: rect.h },
      { w: paintedDims.w, h: paintedDims.h },
    );
    if (decision !== null) {
      acc.diagnostics.push(
        ...aspectDiagnostics({
          form: "painted",
          decision,
          location: bodyLoc,
          epsilonMode,
          labels: { A: "Tw·Hb", B: "Th·Wb" },
          dims: {
            Tw: rect.w,
            Th: rect.h,
            Wb: paintedDims.w,
            Hb: paintedDims.h,
            ...(rect.x !== undefined ? { Tx: rect.x } : {}),
            ...(rect.y !== undefined ? { Ty: rect.y } : {}),
          },
        }),
      );
      // ---- R-S5 mapping: the unique uniform scale is part of the
      // conformance statement for every conforming composition; landmark
      // tables are added when sampled landmarks are supplied. --------------
      if (decision.conforms) {
        const { k, landmarks: mapped } = predictPaintedLandmarks(
          rect,
          paintedDims,
          landmarks,
        );
        acc.mappings.push({
          requirement: "R-S5",
          form: "painted",
          k,
          translation: { x: rect.x, y: rect.y },
          ...(landmarks.length > 0 ? { landmarks: mapped } : {}),
          location: { ...bodyLoc },
        });
      }
    }
  }

  // ---- Recurse into the nested composition --------------------------------
  if (innerManifest !== null) {
    await validateInto(
      innerManifest,
      depth + 1,
      parentManifestId,
      options,
      acc,
    );
  }
}

/** Replacement-form validation (R-S4/R-S5 replacement semantics). */
export function validateReplacement(
  original: Dims,
  replacement: Dims,
  options: Pick<ValidateOptions, "epsilonMode" | "landmarks"> = {},
  location: ResourceLocation = {},
): { diagnostics: Diagnostic[]; mappings: MappingRecord[] } {
  const epsilonMode = options.epsilonMode === true;
  let decision = sameAspectReplacement(original, replacement);
  const diagnostics: Diagnostic[] = [];
  const mappings: MappingRecord[] = [];
  if (decision !== null) {
    diagnostics.push(
      ...aspectDiagnostics({
        form: "replacement",
        decision,
        location,
        epsilonMode,
        labels: { A: "W'·H", B: "H'·W" },
        dims: {
          W: original.w,
          H: original.h,
          "W'": replacement.w,
          "H'": replacement.h,
        },
      }),
    );
    if (decision.conforms) {
      mappings.push(
        replacementMapping(original, replacement, options.landmarks ?? [], location),
      );
    }
  }
  return { diagnostics, mappings };
}

/** Validate a manifest (and its resolvable nested compositions). */
export async function validateManifest(
  manifest: unknown,
  options: ValidateOptions = {},
): Promise<ConformanceReport> {
  if (manifest === null || typeof manifest !== "object") {
    throw new Error("validateManifest expects a manifest object");
  }
  const manifestNode = manifest as Record<string, unknown>;
  const manifestId =
    typeof manifestNode.id === "string" ? manifestNode.id : "(unnamed-manifest)";

  const acc = {
    diagnostics: [] as Diagnostic[],
    mappings: [] as MappingRecord[],
    predictions: [] as RegionViewportPrediction[],
    noGeometryFor: new Set<string>(),
  };
  await validateInto(manifestNode, 0, manifestId, options, acc);

  // ---- Report-level boundaries -------------------------------------------
  // R-S2: consumer-side obligation — observable only with a claiming
  // consumer; none exists (N2 V4–V7/M2/M3). Represented as BLOCKED, never
  // PASS/FAIL.
  const diagnostics: Diagnostic[] = [
    ...acc.diagnostics,
    {
      requirement: "R-S2",
      status: "BLOCKED",
      code: "CONSUMER_CONFORMANCE_BLOCKED",
      location: { manifestId },
      actual: { capableConsumersAvailable: 0 },
      expected:
        "region-as-viewport predicate requires a consumer that renders secondary painting bodies; none tested realizes it (N2)",
    },
  ];
  const fences: FenceRecord[] = [
    {
      requirement: "R-S8b",
      code: "TEMPORAL_HONORING_OPEN",
      statement:
        "Whether any consumer honors a temporal fragment is UNDETERMINED (N2 V2); interaction-level probes are required before any claim either way. This is not a requirement on producers or consumers.",
    },
  ];
  if (acc.noGeometryFor.size > 0) {
    fences.push({
      requirement: "R-S7",
      code: "NO_GEOMETRY_PROMISED",
      statement:
        "No geometry is promised for these excluded bodies; no prediction was emitted for them.",
      subjectIds: [...acc.noGeometryFor].sort(),
    });
  }

  canonicalize(diagnostics, acc.mappings, acc.predictions);

  const conforming = !diagnostics.some(
    (d) =>
      d.status === "FAIL" &&
      d.requirement !== "R-S2" &&
      RESOURCE_REQUIREMENTS.has(d.requirement),
  );

  return {
    manifestId,
    validatorVersion: VALIDATOR_VERSION,
    epsilonMode: options.epsilonMode === true,
    conforming,
    diagnostics,
    mappings: [...acc.mappings],
    predictions: [...acc.predictions],
    fences,
  };
}

// ---------------------------------------------------------------------------
// Output-vocabulary audit (meta-test T10)
// ---------------------------------------------------------------------------

/**
 * Forbidden guarantee strings must never appear in machine-readable results
 * (diagnostics/mappings/predictions). Fence records are exempt: OPEN items
 * MUST appear there, but only as explicit non-guarantee statements.
 * There is deliberately no fit parameter anywhere in the vocabulary.
 */
const FORBIDDEN_PHRASES = [
  "will render",
  "honors t=",
  "stacks first",
] as const;

const FORBIDDEN_KEYS_RE =
  /"(fit|fitPolicy|fitAlgorithm|fitMode|zOrder|zIndex|stackOrder)"\s*:/gi;

export function auditOutputVocabulary(report: ConformanceReport): string[] {
  const payload = JSON.stringify({
    diagnostics: report.diagnostics,
    mappings: report.mappings,
    predictions: report.predictions,
  });
  const violations: string[] = [];
  const lower = payload.toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    if (lower.includes(phrase)) violations.push(`forbidden phrase "${phrase}"`);
  }
  FORBIDDEN_KEYS_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = FORBIDDEN_KEYS_RE.exec(payload)) !== null) {
    violations.push(`forbidden key "${m[1]}"`);
  }
  for (const fence of report.fences) {
    const honest =
      /not guaranteed|undetermined|no geometry is promised|not a requirement/i.test(
        fence.statement,
      );
    if (!honest) {
      violations.push(`fence ${fence.code} lacks explicit non-guarantee wording`);
    }
  }
  return violations;
}
