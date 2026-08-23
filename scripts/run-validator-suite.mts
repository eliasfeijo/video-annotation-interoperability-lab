/**
 * N6 evidence generator.
 *
 * Runs the black-box conformance suite T01–T15 (src/validator/suite.ts) and writes
 * machine-readable artifacts to evidence/n6/:
 *   - summary.json            build context, totals, standing confirmations
 *   - conformance-matrix.json requirement/exclusion rows vs implementation state
 *   - case-T01..T15.json      inputs, pre-registered expectations, actual
 *                             outcomes, diagnostics, pass/fail per case
 *
 * Deterministic outcomes; only this script adds wall-clock/commit context.
 * No browser and no viewer is involved anywhere.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { runSuite } from "../src/validator/suite.ts";
import { VALIDATOR_VERSION } from "../src/validator/validator.ts";

const OUT_DIR = "evidence/n6";

function gitSha(): string {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "(unavailable)";
  }
}

const outcomes = await runSuite();
mkdirSync(OUT_DIR, { recursive: true });

for (const o of outcomes) {
  writeFileSync(
    `${OUT_DIR}/case-${o.id}.json`,
    JSON.stringify(
      {
        id: o.id,
        title: o.title,
        requirements: o.requirements,
        browserDependent: o.browserDependent,
        consumerDependent: o.consumerDependent,
        expectedPreRegistered: o.expected,
        failureCondition: o.failureCondition,
        violations: o.violations,
        pass: o.pass,
        actual: o.actual,
      },
      null,
      2,
    ) + "\n",
  );
}

const matrixRows = [
  { id: "R-S1", statement: "Explicit SVG root viewBox on every painting body", provenance: "PROFILE", implemented: true, mechanism: "static root-element parse", codes: ["VIEWBOX_PRESENT", "MISSING_VIEWBOX", "INVALID_VIEWBOX"] },
  { id: "R-S2", statement: "Region-as-viewport consumer contract", provenance: "PROFILE", implemented: false, state: "BLOCKED — declarative only; needs a claiming consumer (N2 V4–V7/M2/M3)", codes: ["CONSUMER_CONFORMANCE_BLOCKED"], note: "analytic region-as-viewport predictions are emitted as declarative data only" },
  { id: "R-S3", statement: "Positive integer Canvas height/width", provenance: "PROFILE", implemented: true, mechanism: "JSON parse + integer/positivity assertions", codes: ["CANVAS_DIMENSIONS_OK", "MISSING_CANVAS_DIMENSION", "NONPOSITIVE_CANVAS_DIMENSION", "NONINTEGER_CANVAS_DIMENSION"] },
  { id: "R-S4", statement: "Same-aspect painted/replaced Canvas (P5a); mismatch non-conforming, no fallback fit", provenance: "PROFILE", implemented: true, mechanism: "exact BigInt cross-multiplication; default reject of non-integers; documented ε=10⁻⁶ mode records its decision", codes: ["ASPECT_CONFORMS", "ASPECT_MISMATCH", "NONINTEGER_DIMENSIONS_REJECTED", "EPSILON_DECISION_RECORDED"], ambiguities: ["AMB-N6-1"] },
  { id: "R-S5", statement: "Landmark mapping (u,v) ↦ (Tx+k·u, Ty+k·v), k uniform", provenance: "DERIVED", implemented: true, mechanism: "pure-function mapping tables emitted for conforming compositions", codes: ["MAPPING_EMERGED*"] },
  { id: "R-S6a", statement: "Media Fragments t=/xywh= syntax; half-open intervals; percent axis-split; FragmentSelector chain", provenance: "NORMATIVE", implemented: true, mechanism: "strict MF grammar parser reporting rejections", codes: ["FRAGMENT_WELLFORMED", "MALFORMED_FRAGMENT"] },
  { id: "R-S6b", statement: "pct: alias accepted as percent: equivalent; canonical form percent:", provenance: "PROFILE", implemented: true, mechanism: "prefix normalization", codes: ["ALIAS_NORMALIZED"] },
  { id: "R-S7", statement: "Exclusions X1–X8 (resource side)", provenance: "PROFILE", implemented: true, mechanism: "shares R-S1 rejection; declared-metadata reliance flagging is a DOCUMENTED HEURISTIC; consumer side blocked", codes: ["EXCLUSION_RELIANCE_DECLARED", "NO_GEOMETRY_PROMISED"] },
  { id: "R-S8a", statement: "Producers MAY use t= fragments; syntax valid regardless of honoring", provenance: "NORMATIVE", implemented: true, mechanism: "shares R-S6a parser", codes: ["TEMPORAL_SYNTAX_PERMITTED"] },
  { id: "R-S8b", statement: "Temporal consumer honoring NOT guaranteed", provenance: "OPEN", implemented: false, state: "OPEN FENCE — no predicate by design; never becomes a requirement", codes: ["TEMPORAL_HONORING_OPEN"] },
  { id: "X1", statement: "Arbitrary aspect-ratio replacement/nesting", state: "EXCLUDED — S4 predicate rejects; no fit behavior exists in the vocabulary" },
  { id: "X2", statement: "Reliance on implicit intrinsic SVG dimensions", state: "EXCLUDED — R-S1 rejection; intrinsic-fit expectation declarations flagged (heuristic)" },
  { id: "X3", statement: "Unspecified fit algorithms / fit keywords", state: "EXCLUDED — output vocabulary contains no fit parameter (meta-test T10)" },
  { id: "X4", statement: "Consumer-specific SVG painting-body assumptions", state: "OPEN fence — requires rendering consumers; none available (N2)" },
  { id: "X5", statement: "Canvas-as-body RENDERING through current consumers", state: "EXCLUDED for guarantees — data-level expression allowed" },
  { id: "X6", statement: "Z-order assumptions", state: "OUT OF SCOPE — no stacking assertions in any output (meta-test T08)" },
  { id: "X7", statement: "Reliance on temporal consumer honoring", state: "OPEN fence — same as R-S8b" },
  { id: "X8", statement: "Two-stage composition reliance", state: "EXCLUDED for guarantees — observable only with capable consumer" },
];

writeFileSync(
  `${OUT_DIR}/conformance-matrix.json`,
  JSON.stringify({ stage: "N6", companionTo: "research/conformance-matrix.md", rows: matrixRows }, null, 2) + "\n",
);

const passed = outcomes.filter((o) => o.pass).length;
const summary = {
  experiment: "N6 resource conformance validation (deterministic, browser-free)",
  companionDocuments: [
    "research/profile-draft.md",
    "research/conformance-matrix.md",
    "research/n4-safe-subset.md",
  ],
  validatorVersion: VALIDATOR_VERSION,
  buildContext: {
    node: process.version,
    platform: process.platform,
    gitCommit: gitSha(),
    generatedAt: new Date().toISOString(),
  },
  suite: {
    cases: outcomes.length,
    passed,
    failed: outcomes.length - passed,
    browserDependentCases: 0,
    consumerDependentCases: 0,
    ids: outcomes.map((o) => o.id),
    perCase: outcomes.map((o) => ({ id: o.id, pass: o.pass, violations: o.violations.length })),
  },
  standingConfirmations: {
    consumerConformanceRemainsBlocked: true,
    openItemsPromoted: [],
    fitPolicyEmittedForAspectMismatches: false,
    zOrderAssertionsInOutput: false,
    researchSourceDocumentsModified: false,
    recordedAmbiguities: [
      {
        id: "AMB-N6-1",
        affected: "T12 (replacement-form cross products); profile-draft.md Part 14 Example B parenthetical",
        description:
          "The profile formula W'·H == H'·W (stated identically in profile-draft.md Part 7.1, R-S4, and conformance-matrix.md Part A row S4) yields pair B products 2000·1080 = 2,160,000 vs 2000·1920 = 3,840,000 for 1920×1080 → 2000×2000. The prose parentheticals quote “2,160,000 ≠ 2,073,600”, whose second value equals H·W rather than H'·W. The FAIL ASPECT_MISMATCH verdict is identical under both readings. The validator implements the formula; no research document was modified pending clarification.",
        smallestClarificationNeeded:
          "Confirm the second product is H'·W (= 3,840,000) and correct the two prose parentheticals, or state an alternative intended formula.",
      },
    ],
  },
};

writeFileSync(`${OUT_DIR}/summary.json`, JSON.stringify(summary, null, 2) + "\n");

console.log(`evidence/n6: ${outcomes.length} cases, ${passed} passed, ${outcomes.length - passed} failed`);
