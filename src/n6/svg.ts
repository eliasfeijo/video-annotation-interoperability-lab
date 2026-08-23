/**
 * N6 — R-S1: explicit SVG root viewBox on painting bodies.
 *
 * Predicate (profile-draft.md R-S1, "Conformance predicate"):
 *   Parse the root element of every SVG painting-body resource; assert
 *   attribute `viewBox` is present with four numeric components.
 *
 * Scope notes preserved from the profile:
 *   - Only the ROOT `<svg>` element of each painting-body document is checked
 *     (the documented predicate). Width/height attributes are NOT required
 *     (Part 5 #3) and PAR presence/value never affects conformance (#6).
 *   - The check applies at every composition depth via the validator's nested
 *     walk (Part 5 #5: nesting relocates rather than resolves the hazard).
 */

import { readSvgRootAttrs } from "../primitives/svg-root.ts";
import type { Diagnostic, ResourceLocation } from "./types.ts";

export interface SvgRootCheck {
  diagnostic: Diagnostic;
  /** Parsed viewBox when the body passes R-S1. */
  viewBox: { minX: number; minY: number; w: number; h: number } | null;
  preserveAspectRatio: string | null;
}

export function checkSvgRootViewBox(
  svgText: string,
  location: ResourceLocation,
): SvgRootCheck {
  const attrs = readSvgRootAttrs(svgText);
  const loc: ResourceLocation = { ...location };
  if (!attrs.viewBox) {
    // Distinguish absent vs present-but-invalid for honest reporting; both
    // fail R-S1 identically (no coordinate-space contract declared).
    const raw = /<svg\b[^>]*>/i.exec(svgText.trim());
    const hasAttribute = raw !== null && /\bviewBox\s*=/i.test(raw[0]);
    return {
      diagnostic: {
        requirement: "R-S1",
        status: "FAIL",
        code: hasAttribute ? "INVALID_VIEWBOX" : "MISSING_VIEWBOX",
        location: loc,
        actual: hasAttribute ? { rootOpenTag: raw![0] } : { attribute: "absent" },
        expected:
          "explicit root viewBox with four numeric components (R-S1); intrinsic size is not a coordinate contract",
      },
      viewBox: null,
      preserveAspectRatio: attrs.preserveAspectRatio ?? null,
    };
  }
  return {
    diagnostic: {
      requirement: "R-S1",
      status: "PASS",
      code: "VIEWBOX_PRESENT",
      location: loc,
      actual: {
        viewBox: `${attrs.viewBox.minX} ${attrs.viewBox.minY} ${attrs.viewBox.w} ${attrs.viewBox.h}`,
      },
      expected: "explicit root viewBox with four numeric components",
    },
    viewBox: attrs.viewBox,
    preserveAspectRatio: attrs.preserveAspectRatio ?? null,
  };
}
