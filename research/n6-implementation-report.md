# N6 Implementation Report — Resource Conformance Validator

Stage: N6 (Stage 6). Date: 2026-08-22.
Implements: `research/profile-draft.md` + `research/conformance-matrix.md` (N5), per
`research/n4-safe-subset.md` S1–S8. Companion evidence: `evidence/n6/`.
Status: COMPLETE for the resource-conformance half. Consumer conformance remains
declaratively BLOCKED; no OPEN item was promoted; no research source document was modified.

---

## 1. Implementation architecture

New additive module `src/n6/` — pure TypeScript, browser-free, zero new dependencies.
The only imports from existing code are pure helpers reused verbatim:
`readSvgRootAttrs` (`src/blind/svg-root.ts`) and `computePlacement`
(`src/blind/placement.ts`). No historical experiment harness was touched.

| Module | Responsibility |
|---|---|
| `types.ts` | Diagnostic/report model: requirement ID, PASS / FAIL / **BLOCKED** / **OPEN_FENCE**, stable codes, resource location, actual-vs-expected data, mapping/prediction/fence records |
| `canvas.ts` | R-S3: `Number.isInteger(w) && w>0 && Number.isInteger(h) && h>0` per Canvas |
| `svg.ts` | R-S1: root `<svg>` viewBox presence + 4 numeric components, at every composition depth |
| `fragments.ts` | R-S6a/R-S6b/R-S8a: strict Media Fragments parser returning accept/reject results (never silent drops); half-open `[begin,end)`; per-axis percent split; `pct:` ≡ `percent:` with canonical `percent:` |
| `aspect.ts` | R-S4/P5a: exact BigInt cross-multiplication (`Tw·Hb == Th·Wb`, `W'·H == H'·W`); default reject of non-integers (SHOULD); documented optional ε = 10⁻⁶ relative-tolerance mode that always records its decision |
| `mapping.ts` | R-S5: `(u,v) ↦ (Tx + k·u, Ty + k·v)` painted form; `x' = k·x` replacement form; landmark tables |
| `exclusions.ts` | R-S7 resource side: declared-metadata reliance flagging (explicitly `heuristic: true`) |
| `validator.ts` | Orchestration: manifest walk incl. nested Canvas-as-body recursion (`partOf`), canonical ordering, R-S2 → BLOCKED, R-S8b → OPEN_FENCE, output-vocabulary audit (T10 meta-test) |
| `suite.ts` | Single source of truth: T01–T15 fixtures + PRE-REGISTERED expected outcomes + deterministic runner |

Deliberate divergence from the consumer parser (`src/blind/selectors.ts`): that parser
silently drops malformed fragments — correct consumer behavior ([NORMATIVE] MF §6.2),
wrong validator behavior. The strict parser reports every malformed occurrence as
`MALFORMED_FRAGMENT`. Out-of-range-but-well-formed values are accepted at syntax level,
preserving the E14-era [OPEN] fence (R-S6a Non-goal).

Determinism & order-neutrality (T08): diagnostics/mappings/predictions are canonically
sorted by content keys; no index or stacking field exists anywhere in the output, so
AnnotationPage order cannot alter any verdict (verified byte-equality in T08).

## 2. Requirement-to-code mapping

| Requirement | Code | Diagnostic codes | Status |
|---|---|---|---|
| R-S1 explicit root viewBox [PROFILE] | `svg.ts` + validator walk | `VIEWBOX_PRESENT` / `MISSING_VIEWBOX` / `INVALID_VIEWBOX` | implemented |
| R-S2 region-as-viewport consumer contract [PROFILE] | report-level record | `CONSUMER_CONFORMANCE_BLOCKED` (status BLOCKED, never PASS/FAIL) | blocked (by design; N2) |
| R-S3 positive integer Canvas dims [PROFILE] | `canvas.ts` | `CANVAS_DIMENSIONS_OK` / `MISSING_CANVAS_DIMENSION` / `NONPOSITIVE_CANVAS_DIMENSION` / `NONINTEGER_CANVAS_DIMENSION` | implemented |
| R-S4 same-aspect P5a [PROFILE] | `aspect.ts` (+ `validateReplacement`) | `ASPECT_CONFORMS` / `ASPECT_MISMATCH` / `NONINTEGER_DIMENSIONS_REJECTED` / `EPSILON_DECISION_RECORDED` | implemented |
| R-S5 uniform-scale mapping [DERIVED] | `mapping.ts` | emitted `MappingRecord` (`k`, translation, landmarks) | implemented |
| R-S6a MF syntax/interval semantics [NORMATIVE] | `fragments.ts` | `FRAGMENT_WELLFORMED` / `MALFORMED_FRAGMENT` | implemented |
| R-S6b `pct:` alias [PROFILE] | `fragments.ts` | `ALIAS_NORMALIZED` (canonical form stays `percent:`) | implemented |
| R-S7 exclusions, resource side [PROFILE] | `exclusions.ts` + R-S1 machinery | `EXCLUSION_RELIANCE_DECLARED` (heuristic) / `NO_GEOMETRY_PROMISED` fence | implemented (resource side only) |
| R-S8a temporal usage permission [NORMATIVE] | `fragments.ts` | `TEMPORAL_SYNTAX_PERMITTED` (half-open notation recorded) | implemented |
| R-S8b temporal honoring [OPEN] | fence record | `TEMPORAL_HONORING_OPEN` (no predicate, by design) | open fence |

Semantic boundaries enforced structurally:

- **No fit behavior exists anywhere in the vocabulary.** Aspect mismatches produce an
  `ASPECT_MISMATCH` FAIL carrying exact cross products and nothing else (T04 asserts the
  absence of any fit key). The T10 meta-test audits the whole corpus for forbidden
  guarantee strings ("will render", "honors t=", "stacks first") and fit/z-order keys.
- Predictions are emitted ONLY for bodies passing R-S1 (T02/T09 assert zero geometry for
  rejected bodies).
- ε path is opt-in (`epsilonMode`), documented (ε = 10⁻⁶ relative tolerance, profile
  parameter), and self-recording: every decision made under it emits the ε value and
  relative delta (T15). The default path applies no tolerance at all.
- Non-root `<svg>` elements inside one SVG document are NOT checked: N5's predicate is
  "root element of every SVG painting-body document" (Part 5 #5 extends S1 across
  composition depth, not within a single document). Checking deeper would strengthen the
  profile.

## 3. Test coverage

`tests/n6-conformance.test.ts` — 32 tests over the pre-registered suite:

- One test per matrix case asserting actual === pre-registered outcome (T01–T15).
- Explicit falsifiable spot-checks of load-bearing values (cross-product BigInt strings,
  k values, landmark coordinates, interval notation, rejection counts/reasons).
- Standing-boundary tests over every report: R-S2 always BLOCKED; R-S8b never acquires a
  diagnostic; no fit/z-order vocabulary; corpus-wide T10 audit empty.

Negative coverage included as required: missing viewBox (T02/T09/T14), invalid Canvas
dimensions (T13: missing / zero / fractional), aspect mismatch (T04/T12-B), malformed
fragments (T07), nested leaf without viewBox (T14), undocumented-ε behavior (T15 asserts
the default path records no epsilon field at all), plus same-aspect replacement
(T05/T12-A), pct:/percent: normalization (T11), logical-coordinate mapping (T05), and
output-vocabulary safety (T08/T10).

Result: **32/32 pass; all fifteen cases match the pre-registered matrix outcomes.**

## 4. Evidence produced

`evidence/n6/` (generated by `node scripts/run-n6-suite.mts`; deterministic outcomes,
context added once):

- `summary.json` — build context (validator version, node/platform, commit, timestamp),
  totals (15/15 passed), standing confirmations, recorded ambiguities.
- `conformance-matrix.json` — requirement/exclusion rows vs implementation state
  (implemented / blocked / open fence / excluded).
- `case-T01.json … case-T15.json` — per case: requirements, pre-registered expected
  result, failure condition, violations, pass flag, full actual outputs (reports,
  diagnostics, mappings, predictions).

No browser and no viewer is involved anywhere in N6 evidence.

## 5. Known limitations

1. Resource-side only. R-S2's observable predicate and consumer-side R-S7 enforcement are
   represented as BLOCKED; they require a consumer that renders secondary painting bodies
   (none exists: Ramp 5.1.1 crashes, Mirador 3.4.3 drops — N2).
2. R-S7 declared-reliance detection is a documented HEURISTIC over label/summary/metadata
   text; undeclared channel usage (CSS background, naive insertion) is not statically
   detectable from manifest JSON and is not pretended detectable.
3. Fragment grammar covers the profile scope (`t=`, `xywh=` with `pixel:`/`percent:`/
   alias `pct:`); other named dimensions are ignored (MF §5.1.2). Track/media-range
   dimensions are out of the admitted scope.
4. Out-of-bounds-but-well-formed fragments are accepted syntactically (fenced [OPEN]
   since E14); no semantic range policy is applied or claimed.
5. SVG body text must be supplied via `fetchSvgText` (tests/evidence use inline registry
   fixtures following the e15 patterns); the validator itself performs no network I/O.
6. Browser-level e2e harnesses were NOT re-executed in this session; they exercise code
   paths entirely disjoint from `src/n6/`, and `git diff` confirms zero modifications to
   any tracked file. The historical unit suite passes unchanged (147/147).

## 6. Explicitly blocked consumer-side requirements

Not implemented, not certified, not claimed: R-S2 realization/certification; temporal
honoring (R-S8b, [OPEN]); z-order guarantees (X6); two-stage composition verification
(X8); leaf-PAR precedence; CSS cover channels; consumer certification of any kind. These
appear in outputs only as BLOCKED statuses or non-guarantee fences. Future rendering-level
checks RF01–RF04 remain informational-only designs in the conformance matrix and never gate
resource conformance.

## 7. Confirmation: no OPEN item promoted

Every [OPEN]/excluded item appears exclusively as a statement, fence, exclusion, or
BLOCKED status: R-S8b/X7 → `TEMPORAL_HONORING_OPEN` fence; X1/X3 → structural absence +
T04/T10 assertions; X4/X8 → blocked-by-ecosystem notes; X5/X6 → out-of-scope with
meta-test enforcement (T08 byte-equality, T10 audit). No new MUST was introduced beyond
N5's wording; SHOULD/MAY levels preserved (non-integer reject = SHOULD with opt-in
documented ε path; `pct:` acceptance = SHOULD-level recorded as PASS-permissive;
temporal usage = MAY expressed as permission record).

## 8. Confirmation: no profile wording silently strengthened

No research document was modified (`git diff` empty against HEAD `23e7f50`). Where
implementation required interpretation choices, they are recorded here and in
`suite.ts` expected-outcome strings rather than resolved silently.

## 9. Recorded ambiguity AMB-N6-1 (reported, not resolved)

**Exact ambiguity.** The replacement-form cross product formula is stated identically in
three places — profile-draft.md Part 7.1 ("conform iff `W'·H == H'·W`"), R-S4's predicate
block, and conformance-matrix.md Part A row S4 ("`W'·H == H'·W` (replacement form)").
For matrix T12 pair B (1920×1080 → 2000×2000) this yields A = W'·H = 2000·1080 =
**2,160,000** and B = H'·W = 2000·1920 = **3,840,000**. However the illustrative
parentheticals — conformance-matrix.md T12 "(2,160,000 ≠ 2,073,600)" and
profile-draft.md Part 14 Example B "vs `1080·1920` = 2,073,600" — quote a second value
that equals H·W (the original Canvas's own product), not H'·W.

**Affected requirement/test.** R-S4 replacement form; T12. The CONFORMANCE VERDICT is
identical under both readings (unequal → NON-CONFORMING, FAIL ASPECT_MISMATCH); only the
recorded arithmetic differs. Pair A (3840×2160) is consistent under the formula
(4,147,200 == 4,147,200) and unaffected.

**Evidence.** `evidence/n6/case-T12.json` (formula-consistent products, verdict FAIL);
`research/profile-draft.md` Part 7.1 vs Part 14 Example B; `research/conformance-matrix.md`
Part A row S4 vs Part B row T12.

**Smallest clarification needed.** Confirm B = H'·W (= 3,840,000) and correct the two
prose parentheticals — or state the alternative intended formula. The implementation
follows the thrice-stated formula and awaits instruction before ANY research-document
edit.

---

## Validation record (N6)

1. `pnpm check` — clean.
2. Full vitest suite — 179/179 (147 historical + 32 N6), 9 files.
3. `git diff --check` — clean; working-tree diff against HEAD is empty; all N6 files are
   additive/untracked (now committed as one stage commit if so instructed).
4. All T01–T15 actual outcomes match their pre-registered expected outcomes
   (`evidence/n6/case-T*.json`: `"pass": true` ×15).
5. Validator never emits fit-policy decisions for aspect mismatches (asserted in T04 and
   by the T10 corpus audit).
6. Output vocabulary contains no accidental guarantees for OPEN items (T08/T10).
