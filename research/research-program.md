# Research Program — Living Forward-Looking Surface

> **STATUS: LIVING PROGRAM SURFACE (mutable working document, governed by this
> header).** Established by unit I.1 against baseline HEAD `c34bd0a` (post
> H.5-2R), opening the I-cycle research regime after the completed A–H
> consolidation cycle. This document PRIORITIZES and SEQUENCES; it owns NO
> scientific truth. Every substantive statement below either cites its owning
> document or is program metadata. Where this document and any owning document
> disagree, the OWNING DOCUMENT WINS, and this file must be corrected as a
> pointer-level edit. It is superseded by nothing; it supersedes
> `research/next-session-plan.md` as the forward-looking planning surface only —
> that file remains a frozen L0 historical record whose stages are already
> executed by their owning reports.

Date: 2026-08-25.

## 1. Purpose / non-purpose

Purpose:

- register the active research questions of the I-cycle with priority,
  prerequisites, decision gates, and completion criteria;
- capture event-triggered follow-ups and intentional deferrals;
- preserve the forward-looking program independently of conversational history;
- point to authoritative documents for every claim of fact.

This document does NOT own or restate:

- normative requirements (`research/profile-draft.md`);
- pre-registered test expectations (`research/conformance-matrix.md`);
- capability verdicts (`research/compatibility-matrix.md`);
- experiment conclusions or historical evidence (L0 reports under `research/`,
  `docs/`; `evidence/`);
- question substance and status history (`research/open-questions.md` remains
  the question register);
- validator implementation state (`research/n6-implementation-report.md`).

Terminology follows `documentation-conventions.md` (T-4: conformance /
compatibility / honoring kept distinct; T-6: immutable identifiers quoted
verbatim; zero new provenance labels).

Identifier note: the D-numbers below are PROGRAM PRIORITY POINTERS introduced
by this surface, subordinate to the immutable owner identifiers cited alongside
them (R-S*/X*/P*/probe IDs/AMB-N6-1/open-question numbers). Where an existing
identifier owns the question, that identifier is authoritative and is named
first-class here.

## 2. Relationship to the A–H cycle → I-cycle transition

OBSERVED (phase records): Phases A–H completed the consolidation and
architectural-stabilization cycle — documentation layering (Phase C artifacts),
terminology taxonomy and namespace migration (F/G/G.x; ratified by
`phase-g-terminology-taxonomy.md`, executed per `terminology-migration-inventory.md`
§EXECUTION STATUS), concept/architecture reconciliation and dispositions
(H.1–H.3, incl. H.2-A..D governance records), terminology currency (H.4), and
deferred technical follow-up triage/closure (H.5-0 triage [untracked working
material], H.5-1 pin, H.5-2R post-G.x Chromium P-3 refresh).

With I.1 the repository enters the I-cycle: research consolidation, synthesis,
the remaining internally reachable research questions, and potential
externalization work. NOTHING of the I-cycle is complete beyond this program
surface; every item below proceeds only through its stated gate.

## 3. Current scientific position (pointers only)

- Resource-side conformance stack COMPLETE: profile R-S1…R-S8b + X1–X8
  (`profile-draft.md`) operationalized by `conformance-matrix.md` and executed
  via the validator (T01–T15 all matching pre-registered outcomes;
  `n6-implementation-report.md`; `evidence/n6/`).
- Geometry determinism STRONG: explicit-viewBox region-painting agreement and
  no-viewBox three-readings hazard reproduced unanimously across Chromium/
  Firefox/WebKit (E17 F1–F6, 62/62 rows; `evidence/e17/`); same-aspect
  constraint collapses fit readings mathematically (E16 coincidence theorem +
  E17 F6).
- Post-G.x integrity VERIFIED: canonical Chromium E17/N2 measurements
  byte-reproduced across the rename boundary (H.5-2R record).
- Real-consumer geometry BLOCKED: Ramp 5.1.1 crashes on ANY secondary painting
  body; Mirador 3.4.3 silently drops them — zero consumer-side geometric
  readings exist (N2 V4–V7/M2/M3; `viewer-interop-report.md`;
  `evidence/viewer-matrix.json`). Consumer-side certification therefore remains
  declaratively blocked (profile Part 11.2/17; N6 §6).
- Temporal honoring FENCED: fragment syntax/intervals are normative (R-S6a/
  R-S8a) but consumer application is `[UNKNOWN]` — N2 V2 was passive-only and
  provably cannot distinguish later honoring from ignoring (R-S8b fence; X7).
- External anchors: P1/P2 have NO external anchor (genuinely profile-level);
  fit rule absent from IIIF with contradictory community evidence; z-order
  recipes self-contradict (`community-positioning.md`; `n3-source-index.json`;
  `n4-safe-subset.md` Part 5).

## 4. Active questions

Register pointers only; `open-questions.md` keeps status history.

| ID | Question | Authoritative owner(s) | Reach | Prerequisites | Decision gate | Completion criterion |
|---|---|---|---|---|---|---|
| D1 | Does any tested consumer actively honor `#t=` fragments when driven at interaction level (seek-to-start/windowing)? | R-S8b fence + X7 (`profile-draft.md`; `conformance-matrix.md` S8b row); evidence N2 V2 (`viewer-interop-report.md`) | INTERNAL | Pre-registered interaction protocol driving the consumer's own playback surface (not synthetic media-element events) + pre-registered outcome classes; P-3-style authorization covering viewer-family regeneration; `experiment-log.md` reopened append-only per `consolidation-map.md` §1.5 #2 | Explicit human authorization of the D1 package (listing here does NOT authorize execution) | Machine-evidence rows classifying honoring observed/not-observed per consumer+version; R-S8b/X7 citation upgraded or fence retained with interaction-grade evidence, via authorized edit flow |
| D2 | Will a capable consumer realize region-as-viewport (R-S2) / Canvas-as-body rendering? | R-S2 BLOCKED + X4/X5/X8; consumer-row fixture designs (`conformance-matrix.md`); `viewer-interop-report.md` | EXTERNAL (+ internal event-gated watch) | A consumer release claiming painting-body support (or credible candidate) | Event trigger §6; certification fixtures are designed, not yet exercisable | Fixtures executed against a claiming consumer, or standing blocked note unchanged |
| D3 | Fit behavior for mismatched aspects ("scaled to fit" names no algorithm) | E16 §4.2 `[OPEN]`; X1/X3; `community-positioning.md` §8; `n4-safe-subset.md` Part 5 | EXTERNAL (spec/community process) | None repo-internally resolvable | Human posture decision on externalization (§9); upstream movement | Recorded spec/community resolution supersedes the exclusion; otherwise mismatched aspects stay non-conforming by design |
| D4 | Z-order portability across consumers | X6; `profile-draft.md` Part 9; recipe contradiction (`community-positioning.md` §§4/7) | EXTERNAL | Same shape as D3 | Human posture decision on externalization (§9) | Community/spec convergence recorded; otherwise local-convention-only stands |
| D5 | AMB-N6-1 replacement-form arithmetic parentheticals disposition | `n6-implementation-report.md` §9; `evidence/n6/case-T12.json`; edit-flow chain stages 1–2 (`consolidation-map.md` §2) | INTERNAL (human decision) | None | Explicit human research decision (edit-flow rule §2.2 #5: stays OPEN until then; resolution must be repeated explicitly in every touched document) | Disposition propagated through the N6 edit flow in one change-set |
| D6 | Register/documentation currency decisions | `cleanup-checklist.md` item 2 (open-questions items 12–15 ANSWERED-vs-SUPERSEDED wording call); commit/disposition decision for the untracked H.5-0 triage record | INTERNAL (human calls) | None | Human wording/versioning decisions, each as its own micro-unit | Annotations appended (numbering untouched); H.5-0 record committed or explicitly dispositioned |

## 5. Decision gates

Gates state CONDITIONS; listing a gate authorizes nothing.

- **G1 — Ledger closure before capstone**: D5/D6 dispositions should precede or
  accompany capstone finalization so the synthesis does not immediately require
  pointer repairs.
- **G2 — D1 authorization package**: before any D1 execution there must exist
  an explicit instruction carrying: purpose; Chromium-only scope (N2
  consumer-isolation precedent); the pre-registered interaction protocol and
  outcome classes; expected evidence churn classes for the viewer family
  (P-2/P-3 discipline); and the mechanism reopening `experiment-log.md`
  append-only.
- **G3 — Capstone sequencing**: see §8.
- **G4 — External escalation posture**: no issue/submission may be filed
  without an explicit human decision (§9).

## 6. Event-triggered follow-ups

Each trigger is conditional; none schedules work without a question.

| Trigger | Follow-up |
|---|---|
| Consumer release claiming painting-body support | Targeted N2 re-probe; exercise designed certification fixtures (D2) |
| Tracked consumer version change | Re-run affected N2 probes; compare outcome rows version-scoped |
| Browser engine major-version change relevant to version-scoped `[BROWSER]` rows | Reassess remeasurement need against E17 F-findings; no scheduled runs |
| Next authorized evidence regeneration event | Consider bundling writer restructuring/rootTextSample normalization per H.5-0 §D and the H.5-2R carried open question |
| Ecosystem/spec movement on fit rule or z-order | Reopen D3/D4 assessment |

## 7. Explicit deferrals

Carried from ratified records; do not reopen closed items.

- LabApi guard/dispatch/type-narrowing work (H.5-0 §A: harness-only; future
  scope defined there) — DEFERRED.
- Evidence-writer restructuring / N2 aggregation extraction (H.5-0 §D) —
  DEFERRED, gated on the next authorized regeneration event.
- `rootTextSample` normalization (carried open question of H.5-2R) — DEFERRED,
  bundle with the writer event.
- Extended consumer survey beyond Ramp/Mirador — DEFERRED, event-gated.
- Firefox/WebKit re-measurement as research — REDUNDANT absent a new question
  or engine change (renames proven behavior-neutral by H.5-2R byte-reproduction);
  version-scoped trigger only.
- Adapter filename renames (`src/reference/lib/e14.ts`, `src/blind/e14.ts`) —
  CLOSED without action (H.3-1 §3.4 ratified residue; H.5-0 §E).
- Movement/keyframes vocabulary — out of profile scope; findings-era gap
  documented; E15–E17/N3 jointly advise against inventing vocabulary.
- Security-policy expression track — separate, not opened.

## 8. Capstone synthesis

A durable capstone synthesis is PLANNED, not written. Recommended sequence:
ledger/documentation closure (D5/D6) → D1 characterization → capstone. The
temporal-honoring result should be characterized first where practical so the
capstone integrates the last internally reachable research question once rather
than requiring immediate revision. If a later human decision reorders this,
the capstone must write its temporal chapter as the currently fenced unknown
(R-S8b/X7) rather than asserting either way. This section is a planning
preference, not a normative lock.

## 9. Externalization / community

The falsification-pass source matrix and rank table live in
`community-positioning.md` (+ `n3-source-index.json`); submission-ready
evidence packets exist (`evidence/e15/`, `evidence/e16/modeA-twins.json`,
named in open-questions item 14). D2/D3/D4 cannot be resolved solely by
repository experimentation; their resolution lives in ecosystem/spec/community
processes. Whether to actually file external issues or submissions is a HUMAN
POSTURE DECISION (gate G4); nothing in this program authorizes external
communication.

*End of research-program surface. Maintenance rule: pointer/priority edits
only; substantive changes to any cited claim belong in the owning document.*