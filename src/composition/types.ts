/**
 * Experiment E14 — shared evidence / comparison data model.
 *
 * These types describe the *semantic* resolution of a manifest (or Web
 * Annotation document) into compositable overlays, so that independent
 * renderers can be compared record-for-record. They are deliberately shared
 * infrastructure (like the comparison harnesses under src/comparison/), NOT
 * renderer semantics.
 * Each renderer computes the values in its own way and fills these shapes.
 */

export type CompositionModel = "A" | "B" | "C";
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

export interface CompositionSvgAttrs {
  viewBox?: SvgBox;
  preserveAspectRatio?: string;
  width?: number;
  height?: number;
}

export type CompositionPlacementMode =
  | "viewBox-meet"
  | "viewBox-slice"
  | "viewBox-none"
  | "no-viewBox-1to1"
  | "nested-canvas"
  | "image-contain";

/** Model B: linear map from inner Canvas space into an outer destination. */
export interface CompositionNestedMap {
  innerWidth: number;
  innerHeight: number;
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

export interface CompositionPlacement {
  mode: CompositionPlacementMode;
  /** Destination region (= SVG viewport) in outer Canvas units. */
  viewport: Rect;
  /** Uniform scale factor for viewBox branches; null for none/no-viewBox. */
  scale: number | null;
  /** Offset of the user-space origin within the destination (outer units). */
  translation: { x: number; y: number };
  /** Present only for Model B overlays. */
  nested?: CompositionNestedMap;
}

export interface CompositionSecurity {
  level: "safe" | "unsupported" | "unsafe";
  blocking: string[];
  decision: "render" | "sanitize" | "reject";
}

/**
 * Overlay body kinds. `"video"` is currently never assigned — video bodies are
 * carried by the manifest-level videoUrl, not as overlays. Retained first by
 * Phase H.2-C (dead-code cleanup must not decide record territory), then
 * ratified by Phase H.2-D: the durable interchange tier documents its modeled
 * domain beyond currently exercised territory; revisit only if
 * video-as-overlay-body becomes research-relevant.
 */
export type BodyKind = "svg" | "png" | "textual" | "video";

export interface CompositionRule {
  rule: string;
  provenance: Provenance;
}

export interface CompositionOverlay {
  id: string;
  model: CompositionModel;
  startTime: number;
  endTime: number;
  zIndex: number;
  /** Destination region in the OUTER Canvas space. */
  destination: Rect;
  svgAttrs: CompositionSvgAttrs;
  placement: CompositionPlacement;
  security?: CompositionSecurity;
  rules: CompositionRule[];
  kind: BodyKind;
  /** Model B only: the overlay resolved inside the inner Canvas before mapping. */
  inner?: {
    destination: Rect;
    placement: CompositionPlacement;
  };
  /** Absolute URL of the body resource (used by the native <img> stage). */
  resourceUrl?: string;
  /** Raw SVG document text, when the body is SVG (used by DOM lab stages). */
  svgText?: string;
}

export interface CompositionCanvasInfo {
  id: string;
  width: number;
  height: number;
  duration: number | null;
}

export interface CompositionManifest {
  manifestId: string;
  model: CompositionModel;
  canvas: CompositionCanvasInfo;
  videoUrl: string | null;
  overlays: CompositionOverlay[];
}