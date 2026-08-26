# Phase H.3-0 — Carried-Question Disposition: Observation & Scoping

Status: OBSERVATION/SCOPING ONLY (analysis; zero source, test, script, fixture, evidence,
or existing-document changes). This phase produces a factual baseline and decision matrix
for H.1 deferred questions #7–#10; it resolves nothing by itself. Baseline: post-G.x tree,
clean at `f956d4d` (G.x-9 final consistency audit passed).

Epistemic labels: **OBSERVED** (established directly from source/config/cited documents),
**INFERRED** (interpretation supported by observed facts), **OPEN QUESTION** (carried for
human decision).

Authoritative carry-forward records: `phase-h1-concept-architecture-reconciliation.md`
§12 (questions #7–#10 verbatim); `phase-h2d-interchange-display-tier-ratification.md` §5
(carried unchanged + newly reported native-on-legacy fact);
`phase-g-terminology-taxonomy.md` §15 (standing restrictions re-stated);
`terminology-specification.md` §10–§11 (U1–U7, migration principles);
`evidence-policy.md` P-3/P-4/P-7; AGENTS.md.

---

## 1. Scope and explicit exclusions

In scope: static inspection of the current LabApi surface and stage implementations (#7);
inventory of current evidence-producing machinery (#8); reachability analysis of the
`temporalWindow` defensive branch (#9); naming-policy residue assessment after G.x (#10);
cross-question dependency analysis; a decision matrix for human disposition.

Excluded (unchanged): any code/test/script modification; evidence regeneration or
byte-churn absorption; browser-suite execution (P-3 requires its own protocol instruction);
fixture changes; edits to frozen records; edits to `current-state-index.md` (stale rows are
REPORTED as findings only, per task mandate); resolving U1/U2 by action; starting any
implementation phase.

---

## 2. Method

All claims verified against HEAD `f956d4d`: direct reads of `src/main.ts`,
`src/reference/renderers/dom.ts`, `src/blind/compositor.ts`, `src/native/stage.ts`,
`src/native/resolver.ts`, `src/reference/lib/timing.ts`, `src/reference/lib/selectors.ts`,
`src/blind/selectors.ts`, `src/reference/lib/types.ts`; repo-wide greps for LabApi method
usage in tests; filesystem-write inventory over `tests/**` and `scripts/**`;
GATE-5-style residue scan (`\be14\b|\be15\b|\be16\b|\be17\b|\bn6\b|\bn2\b`) across
`src/ scripts/ tests/`; targeted reads of governing records. No tests, builds, browser
suites, or generators were run; `git status --short evidence` clean before and after.

---

## 3. H.1 #7 — LabApi contract divergence

### 3.1 Original question and context

H.1 §12 #7 (verbatim intent): "Should the `LabApi` contract be normalized across stages
(overlayRect/domProbe throwing under native; snapshot shape duality), or is per-stage API
divergence acceptable and to be documented?" H.2-D §5 additionally reported (not fixed):
"`?renderer=native` on a LEGACY experiment drives `NativeStage` with `ResolvedOverlay[]`
via casts — unguarded and would crash at runtime if exercised."

### 3.2 Current factual state (OBSERVED)

The contract is declared ad hoc in `src/main.ts:31–61` (`interface LabApi` on
`window.__lab`); there is no shared interface type implemented by the three stages.
Stage construction: `main.ts:86–96`. Per-method reality:

| `__lab` member | Stage (reference) | BlindStage | NativeStage | Divergence |
|---|---|---|---|---|
| `snapshot()` main.ts:365–368 | `OverlaySnap[]` (dom.ts:207–253: region/shapes) | structurally identical inline shape (compositor.ts:199–241) | `NativeElementSnap[]` (stage.ts:194–223: box/intrinsic/rendered) | shape duality; declared type `ReturnType<Stage["geometrySnapshot"]>` is wrong for native |
| `overlayRect()` main.ts:369–374 | via `stage.overlaySvg` | works (same DOM shape) | `overlaySvg` getter THROWS by design (stage.ts:169–171) | crash path; `NativeStage.overlayRect(id)` exists (stage.ts:225–228) but is never dispatched to |
| `domProbe()` main.ts:385–394 | via `stage.overlaySvg` | works | same throwing getter | crash path |
| `imgMetrics()` main.ts:337–338 | returns null | returns null | native-aware dispatch | the ONLY per-stage-guarded member (precedent pattern) |
| `setSanitize()` main.ts:380–384 | works | no-op guard (isBlind early return) | `(stage as Stage).setSanitizer(...)` — no such method on NativeStage | latent TypeError if invoked under native |
| `layerCount()` main.ts:378 | resolvedA.length | blind count | resolvedA.length | returns 0 on e14/e16 pages for every renderer (`resolvedA` never populated there) — harness-level observation |

### 3.3 The reported native-on-legacy path — still present (OBSERVED)

`main.ts:299–306` (legacy boot branch): for `?renderer=native&exp=<legacy>`, the else-arm
executes `(stage as Stage).setCanvas(canvasInfo)` then
`(stage as Stage).setOverlays(renderer === "b" ? resolvedB : resolvedA)` — feeding
`ResolvedOverlay[]` into `NativeStage.setOverlays` → `buildNode` reads `ov.destination`
(undefined; `ResolvedOverlay` carries `viewport` instead) → `d.x` throws TypeError during
`boot()` → the promise rejects, `.then` never runs, and `window.__lab` is never installed.
This is statically demonstrable from the current tree; no suite exercises the combination
(legacy specs use a/b/blind; composition.spec uses native only on e14 pages;
embedding/cross-engine specs drive their own `__e15`/`__e17` page APIs).

### 3.4 Interpretation (INFERRED)

Three distinct phenomena hide inside one question: (a) a **missing dispatch/guard** for
native in four `__lab` members (overlayRect, domProbe, setSanitize, snapshot's declared
type); (b) an **intentional consumer-policy difference** — NativeStage genuinely has no SVG
overlay layer, and its throwing getter self-documents that; (c) one **genuinely broken,
never-exercised combination** (native-on-legacy). The divergences are not a violation of
any ratified architecture: H.1 posed #7 as a question precisely because either answer
changes no concepts.

### 3.5 Disposition options (not chosen)

1. Normalize: route all members through per-stage guards/dispatch following the
   `imgMetrics` precedent; align `snapshot()`'s declared type or split it per renderer.
2. Document-only: record per-stage contract deltas (table above) as the ratified answer;
   declare native-on-legacy an unsupported combination.
3. Guard-and-forbid: keep divergence but make unsupported combinations fail fast with a
   clear error instead of an opaque TypeError deep in boot.
4. Defer pending runtime verification (see 3.6).

### 3.6 Evidence/verification required

Options 1–3 are decidable statically; none requires new measurement. Runtime confirmation
of the 3.3 crash would require a Playwright run, which is permissible only under a
dedicated P-3 protocol instruction; static analysis is sufficient evidence for scoping.

### 3.7 Blocking status

Not blocking anything today: no shipped surface exercises the broken combination, and the
`__lab` key names/values are protected (taxonomy §11.7), so any normalization must preserve
the machine surface exactly.

---

## 4. H.1 #8 — Evidence-writer separation

### 4.1 Original question and context

H.1 §12 #8: "Should evidence writing be separated from assertion suites (dedicated
generators per family), or does the P-4/P-7-sanctioned embedded model stand? Either answer
changes no concepts — only mechanics." Carried unchanged through H.2-D §5.

### 4.2 Current writer inventory (OBSERVED)

Unit-run writers (rewrite evidence on every `pnpm test`; the P-7 families):

| Producer | Writes | Style |
|---|---|---|
| `tests/composition-comparison.test.ts` | `evidence/e14/` (case JSON + summary.json) | embedded writeFileSync in assertions |
| `tests/nested-composition-comparison.test.ts` | `evidence/e16/` (cmp-*, modeA-twins.json, landmark-spot-check.json) | embedded |
| `tests/blind-comparison.test.ts` | `evidence/blind-comparison/` (case JSON + summary.json) | embedded |

Browser-dependent writers (run only under P-3 authorization):

| Producer | Writes | Style |
|---|---|---|
| `tests/e2e/embedding-semantics.spec.ts` | `evidence/e15/` (intrinsics, case-*, geometry-matrix, summary, screenshots) | measurement + assertion + writing + aggregation ALL inline in the spec |
| `tests/e2e/cross-engine.spec.ts` | `evidence/e17/<engine>/` rows + shots | rows inline; aggregation SEPARATED |
| `scripts/cross-engine-aggregate.mjs` | `evidence/e17/cross-engine-matrix.json`, `summary.json` | dedicated aggregator script |
| `tests/e2e/consumer-probe.spec.ts` | `evidence/viewer/probe-*.json` + `evidence/viewer-matrix.json` (afterAll) + shots | probe + assertion + aggregation inline |
| `tests/e2e/utils.ts` `shot()`/`record()` | `evidence/screenshots/`, `evidence/observations/*.json` | shared harness helpers |
| `tests/e2e/viewer.spec.ts` | screenshots dir only | minimal |

Standalone generator precedent:

| Producer | Writes | Style |
|---|---|---|
| `scripts/run-validator-suite.mts` | `evidence/n6/*` | fully separated: pure suite in `src/validator/suite.ts`, script generates evidence |

Fixture generators (`scripts/build-*-fixtures.mjs`) write `public/` fixtures, not
evidence, and are out of #8's surface.

### 4.3 Separation achieved vs remaining coupling (OBSERVED + INFERRED)

Already separated: N6 (generator script vs pure suite) and E17 (aggregation script).
Remaining mixed responsibility: E15 spec (measure+assert+write+aggregate in one file) and
N2 consumer-probe spec (probe+assert+aggregate inline). INFERRED: this is organizational
debt, NOT an architecture violation — no ratified document mandates separation; H.1 framed
#8 as mechanics-only, and evidence-policy P-4 sanctions the embedded model descriptively
("corresponding specs"). Ownership boundaries between consumer implementations, shared
infrastructure (`src/comparison/`, `src/oracle/`), analysis infrastructure, and evidence
producers remain clean at the import level; the mixing is confined to harness/spec files.

### 4.4 Disposition options (not chosen)

1. Leave as-is; refresh P-4's producer table to post-G.x filenames (pointer-level edit).
2. Extract aggregation only where it is already separable (N2 matrix afterAll → script,
   mirroring `cross-engine-aggregate.mjs`).
3. Full per-family generator split (N6 pattern) for E15/N2 — highest churn, browser-run
   dependent for byte-stability proof.
4. Defer until a family's evidence must be regenerated anyway (P-3 event), bundling the
   separation with that authorized regeneration.

### 4.5 Evidence required

Option 1 needs none beyond the doc edit. Options 2–3 require byte-stability proofs:
unit-runnable for the three P-7 families; E15/E17/N2 require browser runs (P-3) to
regenerate and compare — currently unauthorized, so those splits cannot be VALIDATED today.

### 4.6 Blocking status

Not blocking. Note: `evidence-policy.md` P-4 still cites pre-G.x producer filenames
(`tests/e2e/n2-viewer.spec.ts`, `e17-aggregate.mjs`, `run-n6-suite.mts`) — stale citations
in a living policy document (finding, §9).

---

## 5. H.1 #9 — `temporalWindow` defensive branch

### 5.1 Exact current branch (OBSERVED)

`src/reference/lib/timing.ts:20–29`; the defensive arm is line 27:
`if (end < start) return { start, end: Number.POSITIVE_INFINITY };`. The site header
(lines 15–18, updated when the predicate moved to `src/primitives/temporal.ts` in H.2-A)
already labels the wrapper "including its defensive end<start branch" as consumer-local.

### 5.2 Reachability analysis (OBSERVED)

- Only producer of reference-stack `TemporalFragment`s: `parseTemporal`
  (`src/reference/lib/selectors.ts:15–39`), which REJECTS inverted ranges
  (line 35: `if (e < s) return null`). Callers pass parser output only:
  `iiif.ts:123`, `e14.ts:210`, `e14.ts:446`.
- The other consumers independently guarantee the same invariant without sharing code:
  blind's parser rejects `end < start` (`blind/selectors.ts:47`, citing MF §6.2.2);
  native's fragment readers accept only `end >= start` (`native/resolver.ts:226,494`) and
  its local `windowOf` (`resolver.ts:257–260`) contains NO defensive arm.
- Therefore the branch is UNEXERCISED by every in-repo producer, but NOT statically
  unreachable: `TemporalFragment` (`reference/lib/types.ts:76–79`) is a plain interface
  with no branded invariant, and `temporalWindow` is exported to any future caller.
- No test pins the defensive behavior (`tests/timing.test.ts:20–30` covers undefined /
  finite / open-end only).

### 5.3 Interpretation (INFERRED)

The branch is a legitimate runtime safety boundary at an exported API seam, not dead code
in the strict sense and not a type-system artifact (the types cannot express the
invariant). It also documents a deliberate independence datum: native solved the same
problem by rejecting bad input upstream instead of defending downstream.

### 5.4 Disposition options (not chosen)

1. Retain and formally document (ratify the existing site comment as the answer) — smallest.
2. Pin behavior with one unit test (`end < start` → open-ended window), converting
  unexercised into regression-protected.
3. Remove the branch and rely on producer-side rejection (matches native's pattern; loses
   the boundary at the export seam).
4. Strengthen the type (branded/invariant-carrying window type) — disproportionate.

### 5.5 Evidence required

None; decidable by decision alone. Option 2 adds verification work; option 3 must argue
against the export-seam exposure.

### 5.6 Blocking status

Not blocking; fully independent of #7/#8/#10.

---

## 6. H.1 #10 — Naming-policy residue

### 6.1 Original question and context

H.1 §12 #10: whether directory/module renames proceed at all (ANSWERED YES by ratified G.x
for generation namespaces), and whether URL params/verdict strings stay frozen as machine
surfaces if descriptive names were approved (ANSWERED YES — they stayed frozen throughout
G.x; taxonomy §7.1 pins them). Residue therefore = what remains mutable or undecided.

### 6.2 Current residue (OBSERVED)

Protected/frozen (no action possible without a protocol decision): URL values
(`exp=e14…`, `renderer=a|b|blind|native`), verdict/diagnostic strings, fixture ids
(`e14-caseNN-*`), evidence paths (`evidence/e14…e17/n6`, `viewer-matrix.json`),
`VALIDATOR_VERSION="n6-resource-validator@1.0.0"`, `__lab.e14*` keys, lab-page routes
(`/e15-lab.html`, `/e17-lab.html` — G.4 KEEP), frozen report filenames.

Living-code residue (mutable in principle, retained by G.x scope):
- Consumer adapter module filenames still carry generation letters:
  `src/reference/lib/e14.ts`, `src/blind/e14.ts` (imported by `main.ts:19–20`,
  `tests/composition-comparison.test.ts:4–5`,
  `tests/nested-composition-comparison.test.ts:4–5`). These were outside G.x's ratified
  §11 mapping (which migrated namespace directories only) and are absent from taxonomy
  §11.7's SHOULD-NOT-RENAME register — a small register gap worth recording.
- Prose "Renderer A/B" remains canonical (U2 default: no action while machine surfaces
  encode the letters).

Documentation-state residue (living documents, pointer-level):
- `terminology.md` has NOT been reduced to pointer + historical appendix
  (spec §11 principle 5 "registry retirement" unexecuted) and its §2.D row still reads
  "consolidation phases A–E", lagging F/G/H (also cleanup-checklist item 3).
- `current-state-index.md` staleness: line 80 open-items row still says terminology
  migration is "OPEN — awaiting human review; no renames authorized yet", contradicting
  lines 51–56 of the same file and the executed migration recorded in
  `terminology-migration-inventory.md` §EXECUTION STATUS; header pointer-review stamp
  (line 6) predates G.x; line 48 still describes the specification as an unreviewed
  proposal. REPORTED ONLY per task mandate — not edited here.

Separate decisions: U1 project self-descriptor (package name
`video-annotation-interoperability-lab`, README title unchanged; inventory marks G.7/U1
STILL OPEN) is a naming/branding call independent of #10's architectural substance.

### 6.3 Interpretation (INFERRED)

#10's actionable architectural content is exhausted: both halves were answered by ratified
decisions (G.x execution; frozen machine surfaces). What remains is (a) optional cosmetic
rename of two consumer adapter filenames, (b) registry retirement housekeeping from the
spec's own migration principles, and (c) documentation-currency fixes. None of these hides
a research-significant ambiguity.

### 6.4 Disposition options (not chosen)

1. Close #10 as RESOLVED-BY-G.x with residue recorded (filenames kept for traceability,
   mirroring Q2's bridge-name rationale); treat registry retirement and index staleness as
   separate small doc authorizations; keep U1/U2 explicitly deferred.
2. Authorize one atomic cosmetic change-set renaming the two adapter files (§7.2 class),
   plus the doc items.
3. Fold registry retirement + index repair into the next docs-touching phase.

### 6.5 Blocking status

Not blocking. Items (b)/(c) are cheap but require their own authorization per
cleanup-checklist conventions.

---

## 7. Cross-question dependencies

- #7 ↔ #8 share FILES, not outcomes: several evidence-writing specs are also the surfaces
  where #7's LabApi guards would land. If both proceed as implementation, sequencing or
  coordination is needed to avoid churn collisions; neither DECISION depends on the other.
- #7 does not require the P-3 runtime verification for its decision (static analysis
  suffices); a browser run becomes relevant only to CONFIRM the crash empirically or to
  validate a fix.
- #8's options 2–3 are blocked on P-3 authorization for browser families regardless of #7;
  option 1 is free-standing.
- #9 is fully independent (pure function, single-file surface).
- #10 is independent of #7–#9; overlaps only with completed G.x history and with U1/U2,
  which should stay separate decisions to avoid conflating naming-branding with
  architecture disposition.
- No basis found for merging questions into one implementation unit except the incidental
  file overlap noted above; each has distinct decision owners and risk profiles.

## 8. Decision matrix (for human disposition; nothing pre-decided)

| Question | Current status | Best-supported options | Evidence needed | Human decision required? |
|---|---|---|---|---|
| #7 LabApi divergence | Open; divergence real; native-on-legacy crash statically confirmed, never exercised | normalize dispatch; document divergence as deliberate; guard-and-forbid unsupported combos; defer | none for decision; browser run only to confirm crash empirically | YES — normalize vs document vs guard |
| #8 Evidence-writer separation | Open; mixed responsibility real in E15/N2 specs; N6/E17 already separated; sanctioned descriptively by P-4 | leave + refresh P-4 producers; extract N2 aggregation only; full generator split; bundle with next authorized regeneration | none for option 1; byte-stability proofs (+P-3 runs) for splits | YES — if anything beyond option 1 |
| #9 temporalWindow branch | Open; unexercised by all in-repo producers; not statically unreachable; site-documented; unpinned by tests | retain + formalize documentation; pin with unit test; remove; defer | none (decision alone suffices) | YES — retain vs remove vs pin |
| #10 Naming residue | Architectural content exhausted (both halves answered by ratified decisions); residue = 2 adapter filenames, registry retirement, stale index rows | close as resolved-by-G.x with residue recorded; atomic cosmetic rename; fold doc items into next docs phase | none | YES — closure wording + whether to authorize doc/cosmetic units |

Related separate calls available alongside (each its own authorization): registry
retirement of `terminology.md` (spec §11 principle 5); `current-state-index.md` pointer
repairs (lines 6, 47–49, 80); cleanup-checklist items 2–3; U1 self-descriptor; U2 (default
no action stands); P-4 producer-table refresh; one-time P-3 browser verification of
post-G.x renamed e2e surfaces.

## 9. Recommended next execution unit (recommendation only)

After human disposition of the matrix: **H.3-1 — documentation-only disposition record**,
implementing whichever matrix cells resolve documentation-only (#9 retain-and-document
wording, #7 divergence table if document-option chosen, #8 option-1 P-4 refresh, #10
closure note), as ONE commit touching only living research/policy documents. It is the
smallest safe unit: no code paths, no evidence risk, and it converts this scoping into
ratified answers. Any code-bearing follow-up (LabApi guards, writer extraction, adapter
renames, test pin for #9) should be its own subsequently authorized phase.

## 10. Open findings (reported, not fixed)

1. `current-state-index.md` internal contradiction on terminology-migration status
   (line 80 vs lines 51–56) plus stale pointer-review stamp (line 6) and stale
   "awaiting human review" description (line 48). Pointer-only repair candidate; NOT
   edited here per task mandate.
2. `evidence-policy.md` P-4 producer table cites pre-G.x filenames
   (`n2-viewer.spec.ts`, `e17-aggregate.mjs`, `run-n6-suite.mts`).
3. Taxonomy §11.7 SHOULD-NOT-RENAME register does not mention the consumer adapter
   filenames `reference/lib/e14.ts` / `blind/e14.ts`, leaving their mutability class
   implicit (they fall under §7.2 by elimination).
4. `__lab.layerCount()` returns 0 on e14/e16 pages for all renderers (`resolvedA` is never
   populated on those paths) — harness-level quirk on #7's surface, unexercised by suites.
5. No standalone "migration executed" phase-record file was created during G.x; the
   inventory's EXECUTION STATUS block serves that role. Recorded here so successor readers
   know where the execution record lives.

---

*End of Phase H.3-0. Stopping point reached: observation and scoping only; no repository
file other than this record was created or modified; no tests, builds, browser suites, or
generators were run; tracked evidence untouched.*
