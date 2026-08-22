/**
 * N6 — R-S4 / P5a: same-aspect predicate.
 *
 * Exact form (profile-draft.md Part 7):
 *   painted form:     conform iff Tw·Hb == Th·Wb
 *   replacement form: conform iff W'·H  == H'·W
 *
 * Numerical tolerance (Part 7.2, verbatim discipline):
 *   - Integer values (default path): exact integer cross-multiplication via
 *     BigInt (arbitrary precision; overflow-safe). Any nonzero difference fails.
 *   - Non-integer serializations: validators SHOULD reject them outright;
 *     MAY instead accept iff |A−B|/max(A,B) ≤ ε with ε = 10⁻⁶, documented per
 *     implementation. When this optional path is selected, the decision and
 *     the ε value are RECORDED IN THE OUTPUT (conformance-matrix T15).
 *
 * NO fit behavior is ever produced here. A mismatch is a conformance failure,
 * nothing else (Part 7.5 "Mismatch disposition").
 */

import type { DiagnosticCode } from "./types.ts";

/** Documented profile parameter (chosen by the profile, not by any standard). */
export const ASPECT_EPSILON = 1e-6;

export interface Dims {
  w: number;
  h: number;
}

export type AspectDecision =
  | {
      conforms: true;
      path: "exact-integer";
      crossProductA: string;
      crossProductB: string;
    }
  | {
      conforms: false;
      path: "exact-integer";
      crossProductA: string;
      crossProductB: string;
    }
  | { conforms: false; path: "non-integer-rejected"; nonIntegers: string[] }
  | {
      conforms: boolean;
      path: "epsilon";
      epsilon: number;
      relativeDelta: number;
      crossProductA: number;
      crossProductB: number;
    };

function isPosNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x) && x > 0;
}

function decide(values: number[]): AspectDecision {
  const [Tw, Hb, Th, Wb] = values as [number, number, number, number];
  if (values.every((v) => Number.isInteger(v))) {
    // Exact arbitrary-precision comparison.
    const a = BigInt(Tw) * BigInt(Hb);
    const b = BigInt(Th) * BigInt(Wb);
    return {
      conforms: a === b,
      path: "exact-integer",
      crossProductA: a.toString(),
      crossProductB: b.toString(),
    };
  }
  return {
    conforms: false,
    path: "non-integer-rejected",
    nonIntegers: values
      .map((v, i) => ({ v, i }))
      .filter(({ v }) => !Number.isInteger(v))
      .map(({ i }) => ["Tw", "Hb", "Th", "Wb"][i]!),
  };
}

/**
 * Painted form. `target` is the target rect (Tw×Th); `body` the painted
 * Canvas dimensions (Wb×Hb). All four values must be positive finite numbers.
 */
export function sameAspectPainted(
  target: Dims,
  body: Dims,
): AspectDecision | null {
  if (!isPosNumber(target.w) || !isPosNumber(target.h)) return null;
  if (!isPosNumber(body.w) || !isPosNumber(body.h)) return null;
  // A = Tw·Hb, B = Th·Wb
  return decide([target.w, body.h, target.h, body.w]);
}

/**
 * Replacement form. `original` = replaced Canvas (W×H), `replacement` =
 * replacing Canvas (W'×H'). Conforms iff W'·H == H'·W.
 */
export function sameAspectReplacement(
  original: Dims,
  replacement: Dims,
): AspectDecision | null {
  if (!isPosNumber(original.w) || !isPosNumber(original.h)) return null;
  if (!isPosNumber(replacement.w) || !isPosNumber(replacement.h)) return null;
  // A = W'·H, B = H'·W
  return decide([replacement.w, original.h, replacement.h, original.w]);
}

/**
 * Apply the documented ε tolerance path to a pair of positive numbers
 * (used only when the caller explicitly selects epsilonMode).
 */
export interface EpsilonResult {
  conforms: boolean;
  path: "epsilon";
  epsilon: number;
  relativeDelta: number;
  crossProductA: number;
  crossProductB: number;
}

export function epsilonDecision(A: number, B: number): EpsilonResult {
  const rel = Math.abs(A - B) / Math.max(A, B);
  return {
    conforms: rel <= ASPECT_EPSILON,
    path: "epsilon",
    epsilon: ASPECT_EPSILON,
    relativeDelta: rel,
    crossProductA: A,
    crossProductB: B,
  };
}

/** Uniform scale for a conforming painted composition: k = Tw/Wb = Th/Hb. */
export function uniformScalePainted(target: Dims, body: Dims): number {
  return target.w / body.w;
}

/** Uniform scale for a conforming replacement: k = W'/W = H'/H. */
export function uniformScaleReplacement(
  original: Dims,
  replacement: Dims,
): number {
  return replacement.w / original.w;
}

/** Stable code for an aspect decision (used by diagnostics). */
export function aspectDecisionCode(d: AspectDecision): DiagnosticCode {
  switch (d.path) {
    case "non-integer-rejected":
      return "NONINTEGER_DIMENSIONS_REJECTED";
    case "epsilon":
      return "EPSILON_DECISION_RECORDED";
    default:
      return d.conforms ? "ASPECT_CONFORMS" : "ASPECT_MISMATCH";
  }
}
