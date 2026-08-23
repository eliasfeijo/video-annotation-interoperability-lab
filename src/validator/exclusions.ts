/**
 * N6 — R-S7: resource-side exclusions.
 *
 * Resource-side predicate (profile-draft.md R-S7, conformance-matrix Part A):
 *   1. Reject any SVG painting body without root viewBox — shared machinery
 *      with R-S1 (implemented there).
 *   2. Flag manifests whose declared metadata relies on excluded channels
 *      (intrinsic-fit expectations, CSS-background painting, naive attribute
 *      insertion). This detection is a DOCUMENTED HEURISTIC: only DECLARED
 *      reliance is detectable from static resource data. Undeclared channel
 *      choice is not statically detectable, and consumer-side promise
 *      checking requires a real consumer (none exists; N2) — both boundaries
 *      are preserved rather than pretended away.
 *
 * Exclusions are profile boundaries (Part 10); nothing here claims web
 * standards forbid the excluded patterns.
 */

import type { Diagnostic, ResourceLocation } from "./types.ts";

export type ExclusionId =
  | "X2-intrinsic-fit"
  | "css-background-channel"
  | "naive-attribute-insertion";

export interface ExclusionRelianceMatch {
  exclusionId: ExclusionId;
  field: string;
  declaration: string;
}

interface Rule {
  exclusionId: ExclusionId;
  re: RegExp;
}

const DECLARED_RULES: Rule[] = [
  {
    exclusionId: "X2-intrinsic-fit",
    // e.g. T09's declared expectation that consumers scale by intrinsic size.
    re: /intrinsic\s*(canvas|size|dimension|fit)|scale\s+(this\s+)?(body|svg)?.*intrinsic/i,
  },
  {
    exclusionId: "css-background-channel",
    re: /background-image|css\s+background|background-channel|background-size/i,
  },
  {
    exclusionId: "naive-attribute-insertion",
    re: /attribute[- ]mode|naive\s+insert|inline\s+insert(ion)?\s+without\s+viewport/i,
  },
];

/** Collect the human-readable strings declared on an IIIF node. */
function declaredStrings(node: unknown): { field: string; text: string }[] {
  const out: { field: string; text: string }[] = [];
  if (node === null || typeof node !== "object") return out;
  const n = node as Record<string, unknown>;
  const push = (field: string, v: unknown): void => {
    const visit = (val: unknown): void => {
      if (typeof val === "string") {
        if (val.trim() !== "") out.push({ field, text: val });
        return;
      }
      if (Array.isArray(val)) {
        for (const item of val) visit(item);
        return;
      }
      if (val !== null && typeof val === "object") {
        // Language maps ({en: [...]}) and typed values: gather their strings.
        for (const inner of Object.values(val as Record<string, unknown>)) {
          visit(inner);
        }
      }
    };
    visit(v);
  };
  push("label", n.label);
  push("summary", n.summary);
  if (Array.isArray(n.metadata)) {
    let i = 0;
    for (const entry of n.metadata as unknown[]) {
      i += 1;
      if (entry !== null && typeof entry === "object") {
        const e = entry as Record<string, unknown>;
        push(`metadata[${i}].label`, e.label);
        push(`metadata[${i}].value`, e.value);
      }
    }
  }
  return out;
}

/** Detect DECLARED reliance on excluded channels in one node. */
export function detectDeclaredExclusionReliance(
  node: unknown,
): ExclusionRelianceMatch[] {
  const matches: ExclusionRelianceMatch[] = [];
  for (const { field, text } of declaredStrings(node)) {
    for (const rule of DECLARED_RULES) {
      if (rule.re.test(text)) {
        matches.push({
          exclusionId: rule.exclusionId,
          field,
          declaration: text,
        });
      }
    }
  }
  return matches;
}

const EXCLUSION_EXPECTED: Record<ExclusionId, string> = {
  "X2-intrinsic-fit":
    "no reliance on implicit intrinsic SVG dimensions (exclusion X2); explicit viewBox per R-S1",
  "css-background-channel":
    "CSS-background painting channels are outside the profile (R-S7/Part 10)",
  "naive-attribute-insertion":
    "naive attribute-mode insertion is outside the profile (R-S7/Part 10)",
};

/** Turn reliance matches into R-S7 diagnostics (heuristic by design). */
export function exclusionDiagnostics(
  matches: ExclusionRelianceMatch[],
  location: ResourceLocation,
): Diagnostic[] {
  return matches.map((m) => ({
    requirement: "R-S7" as const,
    status: "FAIL" as const,
    code: "EXCLUSION_RELIANCE_DECLARED" as const,
    location: { ...location },
    actual: { exclusionId: m.exclusionId, field: m.field, declaration: m.declaration },
    expected: EXCLUSION_EXPECTED[m.exclusionId],
    heuristic: true,
  }));
}
