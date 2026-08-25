# Current-State Index (L6)

Status: consolidation Layer **L6** — pointer/index only.
Created by: Phase C design (see `research/consolidation-map.md`).
Decision basis: D3 in `research/phase-b-provenance-terminology-audit.md`.
Last pointer review: 2026-08-25 during Phase I.2 ledger closure; covers documents
through the Phase E / F / G / G.x / H.1–H.5 series plus the living research program.

## Purpose and non-purpose

This document NAVIGATES. It does not own claims.

- Every substantive statement below either cites its owning document or is metadata
  about where truth lives.
- If this file and any owning document disagree, **the owning document wins**, and
  this index must be corrected as a pointer-only edit.
- This file must never grow requirements, capability verdicts, taxonomy definitions,
  or experiment conclusions. Those live in the layers listed here.

## Epistemic layers (where each class of truth lives)

| Layer | Owns | Documents |
|---|---|---|
| L0 | Immutable historical experiment record | per-experiment reports (`e14-report.md`, `e15-report.md`, `e16-report.md`, `e17-report.md`, `e15-e16-final-report.md`, `viewer-interop-report.md`), `findings.md`, `plan.md`, `experiment-log.md`, `next-session-plan.md`, `docs/*` (interpretation packet, blind report, ambiguities ledger, IIIF 3-vs-4 comparison) |
| L1 | Capability status (supported / gap / browser-dependent) | `compatibility-matrix.md` |
| L2 | External-source claims (what specs/cookbook/implementations say) | `community-positioning.md`, `n3-source-index.json` |
| L3 | Current normative profile requirements + terminology definitions | `profile-draft.md` |
| L4 | Requirement matrix + pre-registered test-suite design | `conformance-matrix.md` |
| L5 | Implementation state of the conformance validator | `n6-implementation-report.md` |
| L6 | Navigation (this file) | — |

Full per-document assignment, mutability, and preservation constraints:
`research/consolidation-map.md`.

## Current research position (summary with owners)

- Original question and falsification verdict **B** for the initial cycle:
  `findings.md` (frozen snapshot, 2026-08-20).
- What the standards/cookbook/implementations actually establish:
  `community-positioning.md` (esp. §10 final P1–P6 rank table).
- Capability gaps and browser-dependent rows today: `compatibility-matrix.md`
  (including its inline SUPERSEDED markers — they are part of the record).
- Normative profile (what MUST hold, what is excluded, what stays open):
  `profile-draft.md` (Part 1 states explicitly what the profile IS and IS NOT).
- What is mechanically enforced vs declaratively blocked: `n6-implementation-report.md`.
- Vocabulary authority: `research/terminology-specification.md` (Phase F design;
  migration mapping ratified in commit `622417a`; executed by Phase G.x). Historical
  identifier provenance / audit appendix (retired from vocabulary authority,
  Phase H.4-1): `research/terminology.md`. Authoritative G.x execution-status record:
  `research/terminology-migration-inventory.md` §EXECUTION STATUS.
- Source-architecture truth today: the H.2 phase records own the current tree
  layout (`src/primitives/`, `src/comparison/`, `src/oracle/`). The Phase G.x
  namespace migration (ratified by `phase-g-terminology-taxonomy.md`; executed in
  commits `ed33445`, `6169f83`, `79658aa`, `a04ba86`, `18c7ae3`, `f956d4d`) renamed the
  generation-numbered namespaces to semantic ones (`src/validator/`,
  `src/composition/`, `src/embedding-semantics/`, `src/nested-composition/`,
  `src/cross-engine/`). The G.1 inventory
  (`phase-g1-source-architecture-inventory.md`) and the H.1 reconciliation
  (`phase-h1-concept-architecture-reconciliation.md`) are authoritative
  observations as of their baselines only; their path citations predate H.2 and
  G.x and are historical citations, not current layout.
- Carried architecture questions: H.1's deferred questions #1–#12 are fully
  dispositioned — #1/#2/#12 resolved by H.2-A, #3/#4 by H.2-B, #5 by H.2-C,
  #6/#11 by H.2-D; #10 closed as RESOLVED-BY-G.x; #7/#8/#9 ratified as document-only
  dispositions (see `phase-h3-1-carried-question-disposition-ratification.md`; the
  implementation follow-ups listed there §6 remain DEFERRED / NOT AUTHORIZED).
- Conservative framing for future prose (adopted wording, not retroactively applied):
  see `research/documentation-conventions.md` §Framing.

## Open items that must stay open (pointers only)

| Item | Status | Owner document |
|---|---|---|
| AMB-N6-1 replacement-form arithmetic parentheticals | RESOLVED (2026-08-25) — formula-consistent correction; verdicts unchanged | `n6-implementation-report.md` §9 resolution record |
| Temporal consumer honoring (R-S8b / X7) | `[OPEN]` fence — no predicate by design | `profile-draft.md`; `conformance-matrix.md` row S8b |
| Nested-composition fit rule ("scaled to fit") | `[OPEN]`; same-aspect subset is the safe path (P5a) | `e16-report.md` §4.2; `n4-safe-subset.md`; `profile-draft.md` S4 |
| Leaf-PAR vs container-fit precedence | `[OPEN]` + `[BROWSER]` (tri-engine measured) | `e16-report.md` §4.3; `e17-report.md` F5 |
| No-viewBox body mapping across mechanisms | `[OPEN]`, eliminable by profile rule P1/R-S1 | `e15-report.md` R2; `profile-draft.md` |
| Consumer-side certification (R-S2 realization) | BLOCKED — no capable consumer (Ramp crashes, Mirador drops) | `n6-implementation-report.md` §6; `viewer-interop-report.md` |
| Temporal/spatial fragment honoring by consumers | `[UNKNOWN]` from passive probes | `viewer-interop-report.md` V2/V3 |
| H.1 #7–#10 decisions | DECISIONS RATIFIED (document-only dispositions); listed implementation follow-ups DEFERRED / NOT AUTHORIZED | `phase-h3-1-carried-question-disposition-ratification.md` §3, §6 |
| Interchange/display tier boundary (E14 record / ResolvedOverlay legacy substrate / BlindOverlay private model; main.ts bridges permanent) | RATIFIED — H.1 #6/#11 resolved | `phase-h2d-interchange-display-tier-ratification.md` §4 |
| Question register (all numbered open questions) | living append-only register | `open-questions.md` |

## Where current normative requirements are

`profile-draft.md` Parts 4–10 (R-S1…R-S8b, X1–X8), operationalized for testing by
`conformance-matrix.md` and executed via `src/validator/suite.ts`. Edit flow and ownership
rules: `research/consolidation-map.md` §"N6 ownership and edit flow".

## Historical claims (do not modernize)

Verdicts, classifications, and terminology inside L0 documents are historical record,
including superseded ones (e.g., E14's "Model B draft-only", corrected inline in
`compatibility-matrix.md`). Rules: `research/documentation-conventions.md`.

## Consolidation process records (outside the L0–L6 stack)

These document the consolidation itself and are immutable once committed:

- `pre-consolidation-inventory.md` (Phase A)
- `phase-b-provenance-terminology-audit.md` (Phase B)
- this file and its sibling Phase C artifacts (map, conventions, policies, checklist)
- `phase-d-checklist.md` (execution plan for the mechanical phase)
- `phase-h2a-shared-primitive-namespace.md` (Phase H.2-A; owns the helper-reuse
  governance rule and the `src/primitives/` namespace decision)
- `phase-h2b-comparison-oracle-ownership.md` (Phase H.2-B; owns the comparison-harness
  and oracle-path ownership decisions: `src/comparison/`, `src/oracle/`)
- `phase-h2c-dead-public-surface-reconciliation.md` (Phase H.2-C; owns the dead-surface
  deletions and the retained `BodyKind "video"` decision)
- `phase-h2d-interchange-display-tier-ratification.md` (Phase H.2-D; owns the ratified
  three-tier boundary — E14 interchange / ResolvedOverlay legacy display-regression /
  BlindOverlay private — and the permanence of the `main.ts` bridges)
- `phase-e-identifier-inventory.md` (Phase E; exhaustive identifier/terminology
  inventory; analysis-only working artifact)
- `phase-g1-source-architecture-inventory.md` (Phase G.1; independent observation-only
  source-tree audit; path citations are as-of-baseline, pre-H.2)
- `phase-h1-concept-architecture-reconciliation.md` (Phase H.1; concept ↔ architecture
  reconciliation; owns deferred questions #1–#12)
- `phase-g-terminology-taxonomy.md` (Phase G; ratified terminology taxonomy and
  migration mapping; executed by Phase G.x)
- `phase-h3-0-carried-question-disposition-scoping.md` (Phase H.3-0; observation/scoping
  baseline for H.1 questions #7–#10)
- `phase-h3-1-carried-question-disposition-ratification.md` (Phase H.3-1; ratified
  document-only dispositions for #7/#8/#9/#10)
- `phase-h5-0-deferred-technical-follow-up-triage.md` (Phase H.5-0; triage of the
  deferred technical follow-ups A–E left by G.x/H.3-1/H.4-1; committed unchanged by
  Phase I.2 as a completed historical record — its candidates' later execution
  history is owned by subsequent records, not rewritten here)
- `phase-h5-2r-post-gx-chromium-p3-refresh.md` (Phase H.5-2R; aborted root-config
  incident disposition + canonical Chromium-only P-3 refresh of E17/N2 evidence)

Mutable consolidation-era registers and proposals, governed by their own headers
(not part of the frozen record):

- `terminology-specification.md` (authoritative vocabulary/taxonomy; mapping ratified
  `622417a`, executed by Phase G.x)
- `terminology-migration-inventory.md` (working inventory artifact; §EXECUTION STATUS is
  the authoritative record of the executed G.x migration families/commits)
- `terminology.md` (RETIRED to historical identifier appendix / audit artifact,
  Phase H.4-1; no longer the vocabulary authority — see the specification)
- `cleanup-checklist.md` (stale-documentation findings from the 2026-08-23 pointer
  review; working checklist whose items expire when executed)
- `research-program.md` (living forward-looking research-program surface,
  established post-H.5-2R as the I-cycle planning regime; supersedes
  `next-session-plan.md` as forward-looking planner only; owns priorities/gates/
  triggers/deferrals, no scientific claims — owners cited there win)

## Maintenance rule for this index

Pointer edits only. Adding/removing a pointer requires the target's owning document
to already exist. Never resolve a dispute between two owning documents here — link
to both and flag in `open-questions.md` if needed.
