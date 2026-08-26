# Phase H.3-1 — Carried-Question Disposition Ratification

Status: RATIFIED (documentation/policy only). This phase converts the human dispositions
of H.1 deferred questions #7–#10 into living-document updates and a ratification record.
It implements NO source, test, script, fixture, or evidence change and resolves no new
research question. Baseline: Phase H.3-0 observation/scoping record
(`phase-h3-0-carried-question-disposition-scoping.md`) as committed in `61f4a82`, itself
performed against a clean post-G.x tree at `f956d4d`; this phase inspected a clean tree
at `61f4a82`.

Epistemic labels: **OBSERVED** (established by repository inspection),
**RATIFIED / HUMAN DISPOSITION** (decided by the human operator for this phase),
**INFERRED** (supported interpretation), **DEFERRED / NOT AUTHORIZED** (future work,
explicitly not opened here).

Authoritative inputs (historical owners, unchanged):
`phase-h1-concept-architecture-reconciliation.md` §12 (questions #7–#10);
`phase-h2d-interchange-display-tier-ratification.md` §5 (carry-forward + reported
native-on-legacy fact); `phase-h3-0-carried-question-disposition-scoping.md` (factual
baseline); `terminology-specification.md` §10–§11 (U1/U2 context);
`phase-g-terminology-taxonomy.md` §7/§11.7/§15 (protected surfaces, register, standing
restrictions); `evidence-policy.md` P-3/P-4/P-7.

---

## 1. Scope and explicit exclusions

In scope: one new ratification record (this file) plus exactly one authorized
living-document edit — the stale producer-filename refresh in `evidence-policy.md` §2
P-4 (H.1 #8 disposition). Nothing else.

Excluded: any `src/**`, `tests/**`, `scripts/**`, `public/**`, fixture, evidence, or
generated-artifact change; frozen-record edits; edits to `current-state-index.md`,
`terminology.md`, `terminology-migration-inventory.md`, AGENTS.md; U1/U2 decisions;
registry retirement; LabApi guards/refactors; evidence-writer restructuring; test
additions; adapter-module renames; browser execution; evidence regeneration;
byte-stability comparisons; unrelated cleanup of any H.3-0 finding.

---

## 2. Method

Re-verified before editing: HEAD `61f4a82`, clean tree and clean
`git status --short evidence`. Re-confirmed exact current producer filenames by
filesystem inspection (`tests/e2e/consumer-probe.spec.ts`,
`scripts/cross-engine-aggregate.mjs`, `scripts/run-validator-suite.mts`,
`tests/e2e/viewer.spec.ts`) rather than trusting prose. Confirmed via
`consolidation-map.md` §1 that `evidence-policy.md` is governed as **controlled** (not
frozen), making the authorized pointer-level refresh legitimate. Factual content of the
dispositions is taken from H.3-0 without re-running its investigation.

---

## 3. Ratified dispositions

### 3.1 H.1 #7 — LabApi contract divergence

**HUMAN DISPOSITION**: document-only. The divergence stands unnormalized in this phase.

Ratified interpretation, distinguishing three phenomena on one surface:

1. **Intentional consumer-policy divergence (OBSERVED + RATIFIED)**: NativeStage has no
   SVG overlay layer by design; its throwing `overlaySvg` getter
   (`src/native/stage.ts:169–171`) documents that policy at the seam. Snapshot shape
   duality (`OverlaySnap[]` vs blind's structurally identical inline shape vs
   `NativeElementSnap[]`) is part of the same per-stage difference, as are the
   native-aware `imgMetrics` dispatch and the blind no-op in `setSanitize`.
2. **Missing per-stage dispatch/guard mechanics (OBSERVED)**: `__lab.overlayRect`,
   `__lab.domProbe`, and `__lab.setSanitize` reach `stage.overlaySvg` /
   Stage-only methods without a native guard (`main.ts:369–394`,
   `main.ts:380–384`); `__lab.snapshot`'s declared type names Stage's return shape
   (`main.ts:52`). These are harness mechanics gaps, NOT ratified architecture
   violations — H.1 posed #7 as an open question precisely because either answer changes
   no concepts.
3. **Unsupported combination (OBSERVED + RATIFIED)**: `?renderer=native` on a LEGACY
   experiment is UNSUPPORTED in the current architecture. The resulting TypeError
   (`ResolvedOverlay[]` fed into `NativeStage.setOverlays` → undefined `destination`
   read during boot, so `window.__lab` never installs) is a REAL defect, statically
   demonstrated from the tree in H.3-0. It has NOT been empirically/browser-confirmed —
   no browser run was performed — and is deliberately left unfixed here.

Per the disposition: no guards, dispatch logic, type refactors, or runtime checks were
added; no `__lab` key was renamed or altered; nothing above may be cited as a ratified
architecture violation.

### 3.2 H.1 #8 — Evidence-writer separation

**HUMAN DISPOSITION**: leave the writer architecture as-is. The embedded
measurement/assertion/writing style in the E15 spec and the N2 consumer-probe spec, and
the existing separations (N6 generator script, E17 aggregation script), all stand as
ratified-descriptive practice under P-4; no separation work is required or authorized.

Only implementation in this phase: refresh of the three stale producer references in
`evidence-policy.md` §2 P-4 to post-G.x filenames (see §4). No substantive P-4 policy
text was altered. No aggregator extraction, writer split, evidence regeneration, browser
run, or byte-stability comparison was performed.

### 3.3 H.1 #9 — `temporalWindow` defensive branch

**HUMAN DISPOSITION**: retain the branch and formally document its rationale. Formal
record of that rationale (the code site is intentionally untouched):

The branch is `if (end < start) return { start, end: Number.POSITIVE_INFINITY };`
(`src/reference/lib/timing.ts:27`). OBSERVED facts, established in H.3-0:

- Current in-repo producers reject inverted ranges upstream: the reference parser
  returns null for `end < start` (`src/reference/lib/selectors.ts:35`), blind's parser
  likewise (`src/blind/selectors.ts:47`, MF §6.2.2), and native accepts only
  `end >= start` (`src/native/resolver.ts:226,494`). The branch is therefore currently
  UNEXERCISED by those producers.
- `temporalWindow` remains an exported consumer-facing seam, callable with arbitrary
  values; `TemporalFragment` (`src/reference/lib/types.ts:76–79`) does not encode the
  `end >= start` invariant, so the branch is not statically unreachable.

RATIFIED: the defensive behavior is intentionally retained as a runtime safety boundary
at that exported seam. It is NOT dead code. Native solves the same invariant upstream
(rejecting bad input) instead of defending downstream through this wrapper; that
difference is an implementation/consumer detail between independent consumers, not a new
standards concept and not a blinding-relevant divergence. Per the disposition: no test
was added, no typing redesign, no implementation change.

### 3.4 H.1 #10 — Naming-policy residue

**HUMAN DISPOSITION**: #10 is CLOSED as RESOLVED-BY-G.X.

OBSERVED: both architectural halves were already answered by ratified decisions — the
generation namespace migration was authorized and executed in G.x
(`terminology-migration-inventory.md` §EXECUTION STATUS), and machine-facing surfaces
stayed protected throughout: URL values, verdict/diagnostic strings, fixture IDs,
evidence paths, `__lab` keys, lab-page routes (G.4 KEEP), `VALIDATOR_VERSION`.

RATIFIED residue classification: the two remaining generation-lettered consumer adapter
filenames —

- `src/reference/lib/e14.ts`
- `src/blind/e14.ts`

— are RETAINED INTENTIONALLY as residue/traceability (same rationale as the Q2 bridge
names: continuity with frozen records that cite these surfaces). They are mutable-in-
principle under taxonomy §7.2 but are NOT renamed in this phase, and #10's closure does
NOT reopen the terminology migration. G.x history is untouched by this closure.

Explicitly NOT done here (separate future authorizations): U1 self-descriptor; U2
(default no action stands); `terminology.md` registry retirement;
`current-state-index.md` repairs; renaming the adapter files.

---

## 4. Documentation changes made (exact list)

1. CREATED `research/phase-h3-1-carried-question-disposition-ratification.md` (this
   record).
2. MODIFIED `research/evidence-policy.md` §2 P-4 producer table only — three stale
   filenames refreshed to their post-G.x names, plus a one-line provenance note:
   - `e17-aggregate.mjs` → `cross-engine-aggregate.mjs`
   - `tests/e2e/n2-viewer.spec.ts` → `tests/e2e/consumer-probe.spec.ts`
     (legacy `viewer.spec.ts` association retained)
   - `scripts/run-n6-suite.mts` → `scripts/run-validator-suite.mts`
   No other P-4/P-1..P-7 text changed.

No other document was created or modified.

## 5. Explicitly excluded implementation work (none performed)

LabApi normalization/guards/type refactors; native-on-legacy fix or empirical
confirmation; N2 aggregation extraction; E15 writer split; generator architecture; any
test addition (including a `temporalWindow` end<start pin); adapter-file renames or
import edits; evidence regeneration; byte-stability runs; browser suites; Playwright
execution; index/registry/U1/U2/cleanup-checklist actions.

## 6. Deferred follow-up candidates (RECORDED, NOT AUTHORIZED)

- LabApi per-stage guard/dispatch or normalization; explicit unsupported-combination
  error for native-on-legacy; empirical confirmation under a P-3 instruction.
- N2 matrix aggregation extraction (mirroring `cross-engine-aggregate.mjs`); deeper
  writer separation, ideally bundled with a future authorized regeneration event.
- Unit-test pin for `temporalWindow`'s defensive behavior.
- Cosmetic atomic rename of the two `*e14.ts` adapter files (§7.2-class change-set).
- `current-state-index.md` pointer repairs (lines 6, 47–49, 80 contradiction);
  `terminology.md` registry retirement (spec §11 principle 5); cleanup-checklist items
  2–3; U1 self-descriptor decision; U2 revisit only if machine surfaces ever change;
  one-time P-3 browser verification of post-G.x renamed e2e surfaces.

## 7. Validation and phase boundary

Validation performed: pre-edit HEAD/cleanliness check; filesystem re-verification of all
replacement filenames; `git status --short evidence` clean after edits; full `git diff`
review confirming documentation-only delta; `pnpm run check` (`tsc --noEmit`, read-only)
as a safe static check. No tests, builds, browser suites, or generators were run; tracked
evidence untouched.

With the four dispositions ratified, H.1's deferred question set (#1–#12) is now fully
dispositioned: #1–#6/#11 by H.2-A/B/C/D, #10 by G.x (closed here), #7/#8/#9 by this
phase. Next-phase boundary: H.3-1 ends here; any item from §6 requires its own explicit
authorization.

*End of Phase H.3-1.*
