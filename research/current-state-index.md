# Current-State Index (L6)

Status: consolidation Layer **L6** — pointer/index only.
Created by: Phase C design (see `research/consolidation-map.md`).
Decision basis: D3 in `research/phase-b-provenance-terminology-audit.md`.

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
- Conservative framing for future prose (adopted wording, not retroactively applied):
  see `research/documentation-conventions.md` §Framing.

## Open items that must stay open (pointers only)

| Item | Status | Owner document |
|---|---|---|
| AMB-N6-1 replacement-form arithmetic parentheticals | OPEN — recorded, not resolved | `n6-implementation-report.md` §9; `evidence/n6/summary.json` `recordedAmbiguities` |
| Temporal consumer honoring (R-S8b / X7) | `[OPEN]` fence — no predicate by design | `profile-draft.md`; `conformance-matrix.md` row S8b |
| Nested-composition fit rule ("scaled to fit") | `[OPEN]`; same-aspect subset is the safe path (P5a) | `e16-report.md` §4.2; `n4-safe-subset.md`; `profile-draft.md` S4 |
| Leaf-PAR vs container-fit precedence | `[OPEN]` + `[BROWSER]` (tri-engine measured) | `e16-report.md` §4.3; `e17-report.md` F5 |
| No-viewBox body mapping across mechanisms | `[OPEN]`, eliminable by profile rule P1/R-S1 | `e15-report.md` R2; `profile-draft.md` |
| Consumer-side certification (R-S2 realization) | BLOCKED — no capable consumer (Ramp crashes, Mirador drops) | `n6-implementation-report.md` §6; `viewer-interop-report.md` |
| Temporal/spatial fragment honoring by consumers | `[UNKNOWN]` from passive probes | `viewer-interop-report.md` V2/V3 |
| Question register (all numbered open questions) | living append-only register | `open-questions.md` |

## Where current normative requirements are

`profile-draft.md` Parts 4–10 (R-S1…R-S8b, X1–X8), operationalized for testing by
`conformance-matrix.md` and executed via `src/n6/suite.ts`. Edit flow and ownership
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

## Maintenance rule for this index

Pointer edits only. Adding/removing a pointer requires the target's owning document
to already exist. Never resolve a dispute between two owning documents here — link
to both and flag in `open-questions.md` if needed.
