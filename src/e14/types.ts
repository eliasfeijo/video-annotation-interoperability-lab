/**
 * Experiment E14 — shared evidence / comparison data model.
 *
 * These types describe the *semantic* resolution of a manifest (or Web
 * Annotation document) into compositable overlays, so that independent
 * renderers can be compared record-for-record. They are deliberately shared
 * infrastructure (like src/blind/comparison.ts), NOT renderer semantics.
 * Each renderer computes the values in its own way and fills these shapes.
 */

export type E14Model = "A" | "B" | "C";
export type RendererName = "a" | "blind" | "native";

/**
 * Provenance classes. `IMPLEMENTATION_GAP` and `VIEWER_GAP` extend the
 * interpretation-packet classes with the experiment's deployment findings.
 */
export type Provenance =
  | "NORMATIVE"
  | "DERIVED"
  | "CONVENTION"
  | "OPEN"
  | "IMPLEMENTATION_GAP"
  | "VIEWER_GAP";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SvgBox {
  minX: number;
  minY: number;
  w: number;
  h: number;
}

export interface E14SvgAttrs {
  viewBox?: SvgBox;
  preserveAspectRatio?: string;
  width?: number;
  height?: number;
}

export type E14PlacementMode =
  | "viewBox-meet"
  | "viewBox-slice"
  | "viewBox-none"
  | "no-viewBox-1to1"
  | "nested-canvas"
  | "image-contain";

/** Model B: linear map from inner Canvas space into an outer destination. */
export interface E14NestedMap {
  innerWidth: number;
  innerHeight: number;
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

export interface E14Placement {
  mode: E14PlacementMode;
  /** Destination region (= SVG viewport) in outer Canvas units. */
  viewport: Rect;
  /** Uniform scale factor for viewBox branches; null for none/no-viewBox. */
  scale: number | null;
  /** Offset of the user-space origin within the destination (outer units). */
  translation: { x: number; y: number };
  /** Present only for Model B overlays. */
  nested?: E14NestedMap;
}

export interface E14Security {
  level: "safe" | "unsupported" | "unsafe";
  blocking: string[];
  decision: "render" | "sanitize" | "reject";
}

export type BodyKind = "svg" | "png" | "textual" | "video";

export interface E14Rule {
  rule: string;
  provenance: Provenance;
}

export interface E14Overlay {
  id: string;
  model: E14Model;
  startTime: number;
  endTime: number;
  zIndex: number;
  /** Destination region in the OUTER Canvas space. */
  destination: Rect;
  svgAttrs: E14SvgAttrs;
  placement: E14Placement;
  security?: E14Security;
  rules: E14Rule[];
  kind: BodyKind;
  /** Model B only: the overlay resolved inside the inner Canvas before mapping. */
  inner?: {
    destination: Rect;
    placement: E14Placement;
  };
  /** Absolute URL of the body resource (used by the native <img> stage). */
  resourceUrl?: string;
  /** Raw SVG document text, when the body is SVG (used by DOM lab stages). */
  svgText?: string;
}

export interface E14CanvasInfo {
  id: string;
  width: number;
  height: number;
  duration: number | null;
}

export interface E14Manifest {
  manifestId: string;
  model: E14Model;
  canvas: E14CanvasInfo;
  videoUrl: string | null;
  overlays: E14Overlay[];
}