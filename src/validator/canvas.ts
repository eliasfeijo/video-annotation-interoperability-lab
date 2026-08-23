/**
 * N6 — R-S3: explicit Canvas dimensions.
 *
 * Predicate (profile-draft.md R-S4 block, "Conformance predicate"):
 *   assert Number.isInteger(h) && h > 0 && Number.isInteger(w) && w > 0
 * for every Canvas involved in profile-conforming content.
 */

import type { Diagnostic, ResourceLocation } from "./types.ts";

export interface CanvasDims {
  width: number;
  height: number;
}

function dimDiagnostics(
  which: "width" | "height",
  value: unknown,
  location: ResourceLocation,
): Diagnostic | null {
  const loc = location;
  if (value === undefined || value === null) {
    return {
      requirement: "R-S3",
      status: "FAIL",
      code: "MISSING_CANVAS_DIMENSION",
      location: loc,
      actual: { property: which },
      expected: `positive integer ${which} required by R-S3`,
    };
  }
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return {
      requirement: "R-S3",
      status: "FAIL",
      code: "NONINTEGER_CANVAS_DIMENSION",
      location: loc,
      actual: { property: which, value: String(value) },
      expected: `positive integer ${which} required by R-S3`,
    };
  }
  if (value <= 0) {
    return {
      requirement: "R-S3",
      status: "FAIL",
      code: "NONPOSITIVE_CANVAS_DIMENSION",
      location: loc,
      actual: { property: which, value },
      expected: `positive integer ${which} required by R-S3`,
    };
  }
  return null;
}

/**
 * Check one Canvas's dimensions. Returns one diagnostic per dimension
 * (FAIL) or a single CANVAS_DIMENSIONS_OK pass record.
 */
export function checkCanvasDimensions(
  canvasNode: { id?: unknown; width?: unknown; height?: unknown },
  location: ResourceLocation,
): Diagnostic[] {
  const id = typeof canvasNode.id === "string" ? canvasNode.id : undefined;
  const loc: ResourceLocation =
    id !== undefined ? { ...location, canvasId: id } : { ...location };
  const failures = [
    dimDiagnostics("height", canvasNode.height, loc),
    dimDiagnostics("width", canvasNode.width, loc),
  ].filter((d): d is Diagnostic => d !== null);
  if (failures.length > 0) return failures;
  return [
    {
      requirement: "R-S3",
      status: "PASS",
      code: "CANVAS_DIMENSIONS_OK",
      location: loc,
      actual: { width: canvasNode.width, height: canvasNode.height },
      expected: "Number.isInteger(w) && w > 0 && Number.isInteger(h) && h > 0",
    },
  ];
}
