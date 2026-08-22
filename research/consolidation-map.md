# Consolidation Map — Epistemic Layers & N6 Edit Flow

Status: Phase C design artifact (governance). Implements decisions D3, D4, D7 of
`research/phase-b-provenance-terminology-audit.md`; fixture-family rows summarize
`research/fixture-provenance.json` (D5).
Companion artifacts: `current-state-index.md` (L6), `documentation-conventions.md`
(D1/D2), `evidence-policy.md` (D6), `phase-d-checklist.md`.

---

## 1. Document / epistemic map

Legend:

- **Mutability**: `frozen` = never edited; `append-only` = additions allowed, existing
  text never rewritten; `controlled` = editable only per the stated flow; `refresh-planned`
  = Phase D operation defined in `phase-d-checklist.md`.
- **Quotable by L6**: may the current-state index point at it as an owner of truth.
- **Phase D may modify**: no unless a checklist row authorizes it.

### 1.1 Research documents

| Path | Layer | Epistemic role | Mutability | Quotable by L6 | Phase D may modify | Preservation constraints |
|---|---|---|---|---|---|---|
| `research/plan.md` | L0 | original hypothesis/method contract | frozen | no (historical) | no | verbatim; dated snapshot |
| `research/findings.md` | L0 | exp-era findings + verdict B snapshot | frozen | only as "historical verdict" | no | includes stale test counts by design |
| `research/experiment-log.md` | L0 | experiment registry + bug-fix ledger #1–#16 | frozen (was append-only within eras) | as historical record | no | numbering gap 11→14 is historical (E12/13 = blind generation elsewhere documented) |
| `research/e14-report.md` | L0 | E14 experiment record | frozen | as historical record | no | retains superseded claims (e.g., Model B draft-only) |
| `research/e15-report.md` | L0 | E15 experiment record | frozen | as historical record | no | R1–R5 rule format is canonical for that era |
| `research/e16-report.md` | L0 | E16 experiment record | frozen | as historical record | no | fit-rule [OPEN] statements are fences |
| `research/e17-report.md` | L0 | E17 experiment record | frozen | as historical record | no | "[BROWSER] ≠ [NORMATIVE]" headline rule lives here |
| `research/e15-e16-final-report.md` | L0 | cycle synthesis; first P1–P6 formulation | frozen | as historical record | no | superseded-in-part by N3 §10 rank table |
| `research/viewer-interop-report.md` | L0 | N2 consumer probe record | frozen | as historical record | no | refinement of earlier Ramp claims is part of the record |
| `research/n4-safe-subset.md` | L0 | safe-subset decision record | frozen | as historical decision | no | duplicate section heading ("SAFE INTEROPERABILITY SUBSET" ×2) preserved as-is |
| `docs/blind-interpretation-rules.md` | L0 | interpretation-rule packet (blind renderer's only permitted input) | frozen | yes, for interpretation-rule semantics | no | class table ([NORMATIVE]/[DERIVED]/[CONVENTION]/[OPEN]) is taxonomy A definition site |
| `docs/blind-renderer-report.md` | L0 | blind generation report | frozen | as historical record | no | — |
| `docs/ambiguities.md` | L0 | divergence ledger (blind/E14 era) | frozen | as historical record | no | — |
| `docs/iiif-3-vs-4.md` | L0 | Mode A/B semantic comparison source | frozen | yes, for Mode A/B definitions | no | — |
| `research/community-positioning.md` | L2 | external-source positioning; final P-rank table | frozen | yes | no | falsification record §8 must remain visible |
| `research/n3-source-index.json` | L2 | machine-readable claim index (11 sources) | frozen | yes | no | quotes are evidence |
| `research/compatibility-matrix.md` | L1 | capability status S/G/B incl. SUPERSEDED markers | append-only-with-markers (historically); treat as controlled going forward | yes | no edits in D | inline SUPERSEDED markers are data |
| `research/profile-draft.md` | L3 | **normative requirements** (R-S1…R-S8b, X1–X8), terminology Part 2, taxonomy Part 3 | controlled (head of N6 edit flow) | yes | no edits in D (AMB-N6-1 pending) | promotion rules Part 3 bind all future docs |
| `research/conformance-matrix.md` | L4 | requirement matrix + pre-registered T01–T15 design | controlled (stage 2 of edit flow) | yes | no edits in D | Part B parentheticals carry AMB-N6-1 |
| `research/n6-implementation-report.md` | L5 | validator implementation state, limitations, blocked items, AMB-N6-1 | frozen (era report); successor reports would be new L5 entries | yes | no | BLOCKED/OPEN_FENCE vocabulary is protocol |

### 1.2 Registers and process records

| Path | Role | Mutability | Notes |
|---|---|---|---|
| `research/open-questions.md` | question register (OPEN/ANSWERED/SUPERSEDED) | append-only | cross-layer; new items appended with next number (16+); never renumber; non-monotonic file order (new-above-historic) is established practice — keep |
| `research/pre-consolidation-inventory.md` | Phase A process record | frozen | outside L-stack |
| `research/phase-b-provenance-terminology-audit.md` | Phase B process record + decision set D1–D10 | frozen | decisions are binding inputs to C/D |
| `research/current-state-index.md` | L6 pointer/index | pointer-edits only | owns no substantive claims |
| this file | Phase C design artifact | frozen once committed | governance source for D |
| `research/documentation-conventions.md` | writing rules + taxonomy legend (D1/D2) | controlled; zero-new-labels rule | definition sites stay in L0/L3 docs |
| `research/evidence-policy.md` | evidence policy (D6) | controlled | distinguishes observed vs adopted policy |
| `research/fixture-provenance.json` | fixture provenance manifest (D5) | append-only via schema | no retroactive speculation |
| `research/phase-d-checklist.md` | execution plan | frozen once approved | mechanical ops for Phase D |

### 1.3 Non-document roots

| Path | Assignment |
|---|---|
| `README.md` | public-facing entry point; refresh planned → see `phase-d-checklist.md` op R-1 (D9) |
| `package.json`, configs, `LICENSE`, `.gitignore`, `.gitattributes`, lockfile | infrastructure — out of epistemic scope; untouched |

### 1.4 Source trees (role summary; full rules in Phase B §9, D7)

| Tree | Rule |
|---|---|
| `src/reference/` | Renderer A library (two resolution entry points sharing parsing core) + Renderer B oracle. One implementation, two entry points (`iiif.ts::resolveManifest`, `e14.ts::resolveE14Manifest`). Never merged; equivalence UNKNOWN and untested by design (D7). |
| `src/blind/` | independent renderer; its helpers may be reused as pure functions (N6 precedent) without violating blinding |
| `src/native/` | `<img>`-pipeline renderer; independent |
| `src/e14…e17/`, `src/experiments.ts`, `src/main.ts` | per-generation harness/analysis; frozen surfaces |
| `src/n6/` | validator; stage 3 of the N6 edit flow (§2) |
| `tests/`, `scripts/`, `public/`, `evidence/` | producers, fixtures, archived outputs — see `evidence-policy.md`; fixture families in `fixture-provenance.json` |

### 1.5 Flagged ambiguous assignments (explicit, not forced)

1. `open-questions.md` — register rather than layer member; treated as append-only
   cross-layer (row 1.2). UNCERTAIN whether it should eventually split into
   open-vs-closed halves; deferred, do not split now.
2. `experiment-log.md` — both record (frozen) and potential ledger (future bugs);
   assigned frozen because no active experiment phase exists post-N6. If new
   experiments ever resume, Phase D+ should reopen it as append-only, never rewrite.
3. `e15-e16-final-report.md` — cycle synthesis containing forward-looking
   recommendations later refined by N3/N4; kept wholly L0 (its recommendations are
   historical milestones, not current status).
4. `README.md` — hybrid: accurate TL;DR of the exp era + stale layout/counts;
   neither fully L0 nor current-state. Resolution = planned refresh (D9), not relayering.

---

## 2. N6 ownership and edit flow (D4)

### 2.1 The five-stage chain

```text
STAGE 1               STAGE 2                  STAGE 3             STAGE 4                STAGE 5
profile-draft.md  ->  conformance-matrix.md -> src/n6/suite.ts -> run-n6-suite.mts -> evidence/n6/
(L3 normative         (L4 requirement        (execution         (generator +       (generated
 origin of S/X          matrix + pre-         encoding of        presentation       output;
 requirements)          registered            fixtures +         literals for       never hand-
                        expectations          expected           conformance-       edited)
                        T01–T15)              outcomes)          matrix.json)
```

Roles, restated from Phase B §6 (authoritative analysis there):

| Stage | Role | May define expectations? |
|---|---|---|
| `profile-draft.md` | normative origin of requirements | requirements, yes |
| `conformance-matrix.md` | normative origin of the test matrix (expected outcomes) | yes |
| `src/n6/suite.ts` | EXECUTION source — machine-checkable transcription consumed by tests AND generator | no (transcribes stage 2) |
| `scripts/run-n6-suite.mts` | generator; adds wall-clock/commit context; holds `matrixRows` presentation literals for `conformance-matrix.json` | no |
| `evidence/n6/*` | generated evidence (`case-T*.json`, `summary.json`, `conformance-matrix.json`) | no — output only |

Note: suite.ts's header comment calls itself "single source of truth". Per D4 that
phrasing is imprecise: suite.ts is the single *execution* source (both consumers read
it), while stages 1–2 remain the *normative* sources. Rewording that comment is a
Phase D documentation-only operation (checklist op N-2), deferred from Phase C.

### 2.2 Edit-flow rules

1. Expectation/requirement changes flow strictly left to right, stages 1→5, in ONE
   change-set. Never edit a downstream representation first.
2. Reverse-flow (making the markdown match code behavior) is forbidden without a
   falsification-protocol entry (new evidence, recorded like AMB-N6-1 was).
3. `evidence/n6/**` is never hand-edited; regenerating it follows
   `evidence-policy.md` and rewrites `buildContext` (expected).
4. Status vocabularies: markdown uses IN FORCE / EXCLUDED / OPEN fence /
   OUT OF SCOPE; the generated JSON's implemented/BLOCKED/etc. mapping lives ONLY in
   the script's `matrixRows`. Do not unify these vocabularies.
5. AMB-N6-1 stays OPEN through all phases; any document touched by the eventual
   clarification must repeat the resolution explicitly after it is decided by a human
   research decision — not before.

### 2.3 Danger model (why downstream-first edits are prohibited)

Editing stage 3–4 literals without stage 1–2 creates silent drift between the
normative text and executed checks (the md↔suite link is disciplinary, not
mechanical — verified Phase B §6.1). Editing stage 5 by hand fabricates evidence.
The chain exists so every check traces to a cited requirement.

---

## 3. Renderer preservation (D7, summary)

One Renderer A implementation; two historical resolution entry points
(`iiif.ts::resolveManifest` — exp/case surface; `e14.ts::resolveE14Manifest` —
E14/E16 composition surface). Shared parsing core (`parseTarget`, `mergeFragments`,
motivation/body predicates). Behavioral equivalence: UNKNOWN; measuring it is new
research, not consolidation. Blind/native independence is methodologically
load-bearing (honesty constraint #3, `next-session-plan.md`). No merges, renames,
or moves of `src/reference`, `src/blind`, `src/native`.
