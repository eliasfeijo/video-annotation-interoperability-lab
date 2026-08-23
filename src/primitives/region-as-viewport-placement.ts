/**
 * Profile-defined primitive — REGION-AS-VIEWPORT placement reading.
 *
 * This module implements ONE NAMED READING of SVG-body placement, not a
 * neutral truth:
 *
 *   The destination region acts as the SVG viewport (the profile's own
 *   assignment — R-S2, profile-draft.md Part 6 "Assigned BY THIS PROFILE";
 *   interpretation packet §§5–7). With an explicit viewBox present, user
 *   space maps through viewBox + preserveAspectRatio per SVG 1.1 §7.7/§7.8
 *   (meet/slice/none); with NO viewBox, user units map 1:1 into the region
 *   (SVG §7.3/§7.10) and preserveAspectRatio is ignored (§7.8).
 *
 * The no-viewBox branch carries the packet's SVG-normative side of the
 * lab's central measured disagreement: consumers that instead SYNTHESIZE a
 * viewBox and fit it (e.g. the standards-driven consumer in
 * src/reference/) deliberately take the opposite reading
 * (docs/ambiguities.md #1/#5). That fork stays with each consumer; sharing
 * this module does not collapse it because the other readings are separate,
 * consumer-owned implementations.
 *
 * Consumers of this reading: the method-blinded renderer (one realizing
 * consumer) and the validator (declarative predictor for conforming bodies).
 * Neither imports it from the other.
 *
 * Governance: physical location does not establish semantic ownership; this
 * is the profile-defined reading, not any renderer's policy. Provenance:
 * [PROFILE] R-S2 assignment; [NORMATIVE] SVG 1.1 §7.3/§7.7/§7.8/§7.10;
 * packet §§5–7 ([DERIVED] region-as-viewport; [OPEN]-marked no-viewBox
 * mapping, realized here as 1:1 per the packet).
 */

import type { SvgBox, SvgRootAttrs } from "./svg-root.ts";

/** A rectangle in Canvas coordinate units. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface PlacementRequest {
  destination: Rect;
  attrs: SvgRootAttrs;
}

/**
 * The computed affine map of the region-as-viewport reading. `mode` records
 * which SVG branch applied; `scale`/`translation` describe the user→Canvas
 * map exactly as in each consumer's placement records:
 *   canvas = translation + scale * user            [viewBox present]
 *   canvas = translation + user                    [no viewBox, scale 1]
 */
export interface RegionAsViewportPlacement {
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

const DEFAULT_PAR = "xMidYMid meet";

/**
 * Compute the region-as-viewport placement of a body SVG whose root
 * attributes have been parsed (e.g. with readSvgRootAttrs).
 */
export function computeRegionAsViewportPlacement(
  req: PlacementRequest,
): RegionAsViewportPlacement {
  const { destination, attrs } = req;
  const par = attrs.preserveAspectRatio ?? DEFAULT_PAR;
  const viewBox = attrs.viewBox ?? null;

  if (!viewBox) {
    // SVG §7.3/§7.10: 1 user unit == 1 viewport unit. Content drawn at user
    // (x, y) lands at destination.x + x, destination.y + y. No viewBox =>
    // preserveAspectRatio is ignored (SVG §7.8).
    return {
      viewport: destination,
      viewBox: null,
      preserveAspectRatio: null,
      mode: "no-viewBox-1to1",
      scale: 1,
      translation: { x: destination.x, y: destination.y },
    };
  }

  const align = par.trim().split(/\s+/)[0] ?? "xMidYMid";
  const meetOrSlice = par.trim().split(/\s+/)[1] ?? "meet";

  if (align === "none") {
    // Non-uniform stretch so the viewBox exactly matches the viewport.
    return {
      viewport: destination,
      viewBox,
      preserveAspectRatio: par,
      mode: "viewBox-none",
      scale: null,
      translation: { x: destination.x, y: destination.y },
    };
  }

  const fit = regionAsViewportViewBoxFit({
    destination,
    viewBox,
    meet: meetOrSlice !== "slice",
    align,
  });
  return {
    viewport: destination,
    viewBox,
    preserveAspectRatio: par,
    ...fit,
  };
}

/**
 * Meet/slice affine kernel OF THE REGION-AS-VIEWPORT READING (SVG 1.1
 * §7.7/§7.8): uniform scale selection plus alignment offsets for a
 * viewBox-present body mapped into a destination region. This arithmetic is
 * policy-free given the parsed components; HOW a consumer derives `meet` and
 * `align` from its authored preserveAspectRatio string remains the
 * consumer's own (token-splitting vs substring testing are deliberately not
 * reconciled). The "none" (non-uniform stretch) and no-viewBox branches are
 * NOT part of this kernel; they stay with the callers that define them.
 */
export function regionAsViewportViewBoxFit(params: {
  destination: Rect;
  viewBox: SvgBox;
  /** true => meet (min of axis scales); false => slice (max). */
  meet: boolean;
  /** Align token(s), tested with the SVG §7.8 xMin/xMid/xMax, yMin/yMid/yMax keyword rules. */
  align: string;
}): {
  mode: "viewBox-meet" | "viewBox-slice";
  scale: number;
  translation: { x: number; y: number };
} {
  const { destination, viewBox, meet, align } = params;
  const sx = destination.w / viewBox.w;
  const sy = destination.h / viewBox.h;
  const scale = meet ? Math.min(sx, sy) : Math.max(sx, sy);
  const usedW = viewBox.w * scale;
  const usedH = viewBox.h * scale;
  const ox = /xMax/.test(align)
    ? destination.w - usedW
    : /xMid/.test(align)
      ? (destination.w - usedW) / 2
      : 0;
  // Align tokens capitalize the y part ("xMidYMid"): match case-insensitively.
  const oy = /yMax/i.test(align)
    ? destination.h - usedH
    : /yMid/i.test(align)
      ? (destination.h - usedH) / 2
      : 0;
  return {
    mode: meet ? "viewBox-meet" : "viewBox-slice",
    scale,
    translation: {
      x: destination.x + ox - viewBox.minX * scale,
      y: destination.y + oy - viewBox.minY * scale,
    },
  };
}
