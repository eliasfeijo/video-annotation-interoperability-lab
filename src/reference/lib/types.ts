/**
 * Shared data model for the experiment.
 *
 * `ResolvedOverlay` is the canonical, renderer-agnostic description of a single
 * layer to draw over the video. Both Renderer A (IIIF/WebAnnotation-driven) and
 * Renderer B (direct reference model) lower into this shape, which makes the two
 * paths directly comparable.
 */

export interface Viewport {
  /** Region in Canvas coordinate space where the SVG is painted. */
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

export interface SvgRootAttrs {
  viewBox?: SvgBox;
  preserveAspectRatio?: string;
  width?: number;
  height?: number;
}

/** EXPERIMENTAL, NON-STANDARD: timeline of (time, canvas-space offset) pairs. */
export interface Keyframe {
  t: number;
  x: number;
  y: number;
}

export interface ResolvedOverlay {
  /** Annotation id (Renderer A) or stable synthetic id (Renderer B). */
  id: string;
  /** Active window start, seconds. */
  startTime: number;
  /** Active window end, seconds (exclusive). Infinity if unbounded. */
  endTime: number;
  /** Paint order within the annotation page stack. */
  zIndex: number;
  /** Raw SVG document text (the visual body). */
  svgText: string;
  /** Parsed root attributes of the SVG body. */
  svgAttrs: SvgRootAttrs;
  /** Canvas-space region into which the SVG is painted. */
  viewport: Viewport;
  /** EXPERIMENTAL, NON-STANDARD keyframe timeline (only set by exp7). */
  keyframes?: Keyframe[];
}

/**
 * Renderer B's deliberately simple, NON-STANDARD reference representation.
 * Used only as an oracle to compare against.
 */
export interface ReferenceOverlay {
  /** Optional stable id (used by tests to locate the overlay); defaults to ref-N. */
  id?: string;
  startTime: number;
  endTime: number;
  zIndex: number;
  /** SVG text with coordinates already expressed in Canvas space. */
  svg: string;
  /** Optional; defaults to the full Canvas. */
  viewport?: Viewport;
  keyframes?: Keyframe[];
}

/** Browser + Node safe value objects produced by selector parsing. */
export interface TemporalFragment {
  start: number;
  end?: number;
}

export interface SpatialFragment {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface MediaFragment {
  temporal?: TemporalFragment;
  spatial?: SpatialFragment;
}

export interface CanvasInfo {
  id?: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface ResolvedManifest {
  canvas: CanvasInfo;
  videoUrl: string | null;
  overlays: ResolvedOverlay[];
}

export type RendererKind = "a" | "b";