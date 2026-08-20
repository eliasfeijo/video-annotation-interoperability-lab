/**
 * Blind Renderer — data model.
 *
 * These types are produced by the Blind Renderer's OWN semantic resolution
 * (src/blind/*). They are deliberately independent of src/reference/lib/types.ts.
 * Structural similarity to the reference model exists because both describe the
 * same real-world objects (a Canvas, an Annotation, a rectangle); the resolution
 * logic that fills these shapes lives only in src/blind/.
 */

export type IiifMode = "A" | "B";

/** A rectangle in Canvas coordinate units. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** viewBox value: user-space rectangle. */
export interface SvgBox {
  minX: number;
  minY: number;
  w: number;
  h: number;
}

export interface SvgRootAttrs {
  viewBox?: SvgBox;
  preserveAspectRatio?: string;
  width?: number;
  height?: number;
}

export interface TemporalFragment {
  start: number;
  end?: number;
}

export interface SpatialFragment {
  x: number;
  y: number;
  w: number;
  h: number;
  /** `pct:`/`percent:` resolved true; pixel false. */
  percent: boolean;
}

export interface MediaFragment {
  temporal?: TemporalFragment;
  spatial?: SpatialFragment;
}

/** Provenance classes from the interpretation packet. */
export type Provenance =
  | "NORMATIVE"
  | "DERIVED"
  | "CONVENTION"
  | "OPEN";

/** One applied interpretation rule, for evidence. */
export interface AppliedRule {
  rule: string;
  provenance: Provenance;
}

/**
 * The resolved SVG placement of a body into a Canvas region.
 *
 * `mode` records which SVG branch applied:
 *   - "viewBox-meet/slice/none": body had a viewBox, mapped per SVG §7.7/§7.8.
 *   - "no-viewBox-1to1": body had no viewBox; user units map 1:1 into the
 *     destination region (SVG §7.3/§7.10).
 *
 * `scale` and `translation` fully describe the user→canvas affine map:
 *   canvas = translation + scale * (user - viewBox.min)   [viewBox present]
 *   canvas = translation + user                           [no viewBox, scale 1]
 * where translation is the placement of the viewBox origin in Canvas units.
 */
export interface Placement {
  /** Destination region = SVG viewport, in Canvas units. */
  viewport: Rect;
  viewBox: SvgBox | null;
  preserveAspectRatio: string | null;
  mode:
    | "viewBox-meet"
    | "viewBox-slice"
    | "viewBox-none"
    | "no-viewBox-1to1";
  /** Uniform scale factor (for viewBox branches); null for "none"/"no-viewBox". */
  scale: number | null;
  /** Offset of the viewBox origin within the destination region (Canvas units). */
  translation: { x: number; y: number };
}

export type SvgFeatureName =
  | "script"
  | "foreignObject"
  | "image"
  | "style"
  | "filter"
  | "use"
  | "a"
  | "animate"
  | "externalHref"
  | "eventHandler"
  | "xmlnsExternal";

export type SecurityLevel = "safe" | "unsupported" | "unsafe";

/** Result of the SVG feature security classification (Case 13). */
export interface SecurityClassification {
  level: SecurityLevel;
  features: Record<SvgFeatureName, boolean>;
  blocking: SvgFeatureName[];
  /** Allowlisted sanitized copy; null when the body must be rejected. */
  sanitized: string | null;
}

export interface BlindOverlay {
  id: string;
  startTime: number;
  endTime: number;
  zIndex: number;
  svgText: string;
  svgAttrs: SvgRootAttrs;
  /** The targeted spatial region (= destination), Canvas units. */
  destination: Rect;
  placement: Placement;
  security: SecurityClassification;
  /** Interpretation rules applied to build this overlay. */
  rules: AppliedRule[];
  /** Which IIIF mode produced it. */
  mode: IiifMode;
}

export interface BlindCanvasInfo {
  id: string;
  width: number;
  height: number;
  duration: number | null;
}

export interface BlindManifest {
  canvas: BlindCanvasInfo;
  videoUrl: string | null;
  overlays: BlindOverlay[];
  mode: IiifMode;
}