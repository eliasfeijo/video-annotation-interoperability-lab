/**
 * Blind Renderer — user-point mapping over computed placements.
 *
 * The region-as-viewport PLACEMENT computation itself (computePlacement) was
 * moved to src/primitives/region-as-viewport-placement.ts in Phase H.2-A: it
 * implements the profile-assigned reading (R-S2 / packet §§5–7), not a
 * blind-specific policy, and the validator consumes the same labeled reading
 * from its neutral home. Reusing it here is the documented inbound
 * pure-primitive reuse sanctioned by the interpretation packet; it makes the
 * blind renderer neither authoritative nor dependent on another consumer.
 *
 * What remains here is blind-side only: mapping sampled user points through
 * a placement record for landmark evidence.
 */

import type { Placement } from "./types.ts";

/** Map a user-space point to Canvas space for a computed placement. */
export function canvasPointOf(
  placement: Placement,
  p: { x: number; y: number },
): { x: number; y: number } {
  const v = placement.viewport;
  if (!placement.viewBox) {
    return { x: v.x + p.x, y: v.y + p.y };
  }
  if (placement.mode === "viewBox-none") {
    const sx = v.w / placement.viewBox.w;
    const sy = v.h / placement.viewBox.h;
    return {
      x: v.x + (p.x - placement.viewBox.minX) * sx,
      y: v.y + (p.y - placement.viewBox.minY) * sy,
    };
  }
  const s = placement.scale ?? 1;
  return {
    x: placement.translation.x + p.x * s,
    y: placement.translation.y + p.y * s,
  };
}
