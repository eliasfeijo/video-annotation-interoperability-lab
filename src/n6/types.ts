/**
 * N6 — Resource Conformance Validator: data model.
 *
 * Machine-readable diagnostics for the N5 Safe Interoperability Subset
 * (research/profile-draft.md, research/conformance-matrix.md). Deterministic,
 * browser-free, resource-side only.
 *
 * Vocabulary discipline (conformance-matrix.md T10):
 *   - No fit-policy parameter or decision exists anywhere in this model.
 *   - Consumer-side obligations are represented as BLOCKED, never PASS/FAIL.
 *   - [OPEN] items appear only as explicit non-guarantee fences (OPEN_FENCE).
 */

export type RequirementId =
  | "R-S1"
  | "R-S2"
  | "R-S3"
  | "R-S4"
  | "R-S5"
  | "R-S6a"
  | "R-S6b"
  | "R-S7"
  | "R-S8a"
  | "R-S8b";

/**
 * PASS / FAIL apply only to resource-side requirements with a mechanical
 * predicate. BLOCKED marks consumer-side obligations that cannot be tested
 * today (no capable consumer; N2). OPEN_FENCE records an [OPEN] boundary
 * without a predicate, by design.
 */
export type DiagnosticStatus = "PASS" | "FAIL" | "BLOCKED" | "OPEN_FENCE";

/** Stable diagnostic codes. */
export type DiagnosticCode =
  // R-S1
  | "MISSING_VIEWBOX"
  | "INVALID_VIEWBOX"
  | "VIEWBOX_PRESENT"
  // R-S3
  | "MISSING_CANVAS_DIMENSION"
  | "NONPOSITIVE_CANVAS_DIMENSION"
  | "NONINTEGER_CANVAS_DIMENSION"
  | "CANVAS_DIMENSIONS_OK"
  // R-S4
  | "ASPECT_MISMATCH"
  | "ASPECT_CONFORMS"
  | "NONINTEGER_DIMENSIONS_REJECTED"
  | "EPSILON_DECISION_RECORDED"
  // R-S5
  | "MAPPING_EMERGED"
  // R-S6a
  | "MALFORMED_FRAGMENT"
  | "FRAGMENT_WELLFORMED"
  // R-S6b
  | "ALIAS_NORMALIZED"
  // R-S7
  | "EXCLUSION_RELIANCE_DECLARED"
  | "NO_GEOMETRY_PROMISED"
  // R-S2
  | "CONSUMER_CONFORMANCE_BLOCKED"
  // R-S8a
  | "TEMPORAL_SYNTAX_PERMITTED"
  // R-S8b
  | "TEMPORAL_HONORING_OPEN";

/** Where a diagnostic applies inside the validated resource. */
export interface ResourceLocation {
  /** Manifest id (inner manifests get their own id at depth > 0). */
  manifestId?: string;
  canvasId?: string;
  annotationId?: string;
  bodyId?: string;
  /** Composition depth: 0 = top-level manifest, n = nth nested Canvas body. */
  depth?: number;
}

export interface Diagnostic {
  requirement: RequirementId;
  status: DiagnosticStatus;
  code: DiagnosticCode;
  location: ResourceLocation;
  /** Relevant actual values from the resource. */
  actual?: Record<string, unknown>;
  /** The expected constraint, stated without strengthening the profile. */
  expected: string;
  /** True when the check is heuristic by design (conformance-matrix Part A). */
  heuristic?: boolean;
}

/** One emitted R-S5 landmark mapping entry (painted form). */
export interface PaintedLandmark {
  u: number;
  v: number;
  x: number;
  y: number;
}

/** Uniform-scale mapping record for an R-S4-conforming composition. */
export interface MappingRecord {
  requirement: "R-S5";
  form: "painted" | "replacement";
  k: number;
  /** Painted form: target rect origin in Canvas space. */
  translation?: { x: number; y: number };
  landmarks?: PaintedLandmark[];
  location: ResourceLocation;
}

/**
 * Declarative region-as-viewport prediction for an R-S1-conforming SVG body.
 * This is the profile's own viewport assignment (R-S2) computed analytically;
 * it is NOT a claim that any consumer renders it (see CONSUMER_CONFORMANCE_BLOCKED).
 */
export interface RegionViewportPrediction {
  bodyId?: string;
  viewport: { x: number; y: number; w: number; h: number };
  viewBox: { minX: number; minY: number; w: number; h: number };
  preserveAspectRatio: string;
  /** Uniform scale for align-PAR modes; null for PAR="none" (stretch). */
  scale: number | null;
  translation: { x: number; y: number };
  location: ResourceLocation;
}

/** An [OPEN] boundary recorded as an explicit non-guarantee fence. */
export interface FenceRecord {
  requirement: RequirementId;
  code: DiagnosticCode;
  statement: string;
  /** Resources the boundary applies to (e.g., excluded bodies). */
  subjectIds?: string[];
}

export interface ConformanceReport {
  manifestId: string;
  validatorVersion: string;
  /** Whether the documented ε tolerance path was selected for R-S4. */
  epsilonMode: boolean;
  /**
   * True iff every resource-side requirement (R-S1, R-S3–R-S6b, R-S7, R-S8a)
   * evaluates true/permissible and no exclusion is relied upon.
   * BLOCKED (R-S2) and OPEN_FENCE (R-S8b) do not affect resource conformance.
   */
  conforming: boolean;
  diagnostics: Diagnostic[];
  mappings: MappingRecord[];
  predictions: RegionViewportPrediction[];
  fences: FenceRecord[];
}
