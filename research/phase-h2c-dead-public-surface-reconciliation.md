# Phase H.2-C — Dead/Public Surface Reconciliation

Status: implemented. Resolves ONLY H.1 §12 #5 (which unused exports / dead surfaces should
be deleted, and which retained). Baseline: H.2-B committed (`426db32`) immediately before
this phase; work started from a clean tree so H.2-C remains an isolated unit. Evidence and
behavioral semantics remained frozen throughout; validation produced zero evidence churn
and an unchanged production bundle hash.

Epistemic labels: OBSERVED / INFERRED / OPEN QUESTION as in prior phase records.

---

## 1. Scope

In scope: usage census, classification, and minimal deletion-or-retention decisions for
the four H.1 candidates — `src/blind/index.ts`, `blind/layers.collectPaintingAnnotations`,
`reference/lib/timing.activeAt`, `e14/types.BodyKind "video"` — plus directly affected
imports/comments only.

Excluded (untouched): E14/ResolvedOverlay redesign; bridge normalization; LabApi;
evidence-writer separation; unreachable `temporalWindow` branch; renderer naming; URL/verdict
surfaces; taxonomy; conformance/profile/MF/security/placement/z-order/temporal-window
semantics; fixtures; evidence regeneration; frozen research records; `asArray`
consolidation (see §10).

## 2. Inputs and method

Authoritative inputs: G.1 inventory (§ residual-surface findings), H.1 §12 #5 and §10,
H.2-A record (governance rule, asArray deferral), H.2-B record, current-state index,
consolidation-map (mutability regimes), terminology specification (history-is-data;
machine-identifier policy), evidence policy (P-1/P-2/P-7), interpretation packet,
ambiguities ledger. Method: G.1's census re-executed against the CURRENT tree
(post-H.2-A/H.2-B) via repository-wide grep over imports, re-exports, string references,
union matches, test helpers, scripts, fixture builders, configs, HTML, and documentation —
not compiler errors alone.

## 3–5. Candidate inventory, usage census, classification

| Candidate | Definition (OBSERVED) | Usage census (OBSERVED) | Classification |
|---|---|---|---|
| `src/blind/index.ts` | Barrel "public surface" header; re-exported blind modules plus (post-H.2-A) two primitives symbols | Zero importers in `src/`, `tests/`, `scripts/`, configs, HTML (G.1 finding re-confirmed post-H.2-A/B); never in the production module graph (pre- and post-deletion bundle hash identical: `index-BGJUCMue.js`); no documentation names it as a current API — README/docs contain no "barrel"/"integrator" references; its public-API intent exists only as its own header comment | DEAD residue |
| `collectPaintingAnnotations` + `Encounter` | `src/blind/layers.ts` (exported fn + its interface) | Zero call sites repo-wide; superseded de facto by inline resolver walks (`blind/parser.collectPaintingInputs` is the live equivalent); untested; absent from every fixture/evidence path; referenced only by frozen research records | DEAD residue (H.1 §5.6: C-residue; there is deliberately NO layering engine) |
| `timing.activeAt` | `src/reference/lib/timing.ts` exported filter helper | Zero callers outside its module; untested (`timing.test.ts` covers `temporalWindow` + `isActiveAt` only); trivial delegation to `isActiveAt`; no fixture/evidence path | DEAD residue (historical convenience wrapper) |
| `BodyKind "video"` | Member of the LIVE union `e14/types.BodyKind`, carried by `E14Overlay.kind` on the shared interchange record | Never assigned (all three adapters emit only `"svg"|"textual"|"png"`; video bodies are carried by manifest-level `videoUrl`) and never matched (no switch/pattern on `kind` anywhere; `compareE14` diffs whatever values occur). No fixture/evidence contains it. INFERRED: it models territory (a video as an overlay body) that is currently unimplemented rather than impossible | MODELED-but-unassigned machine-visible enum member — NOT plain dead |

## 6. Decisions

| Candidate | Decision | Why |
|---|---|---|
| `blind/index.ts` | **DELETE** | All Step-5 criteria hold: no consumer, no test/evidence path, no API role honored by any caller OR any documentation, no research coordinate depends on it, no methodological distinction collapses. The prompt authorizes outright deletion over a shim unless the barrel is intentionally public — OBSERVED evidence says nothing treats it as public beyond its own comment. Machine surface unchanged (it was imported by nothing and bundled by nothing). |
| `collectPaintingAnnotations` + `Encounter` | **DELETE** | Dead residue of a pre-resolver design stage; z-order independence guarantees are untouched — zProvenance (LIVE, used by blind/resolver) remains with its provenance citations, and encounter-order assignment stays inline in the resolvers exactly as before. Deleting does not collapse the kept-open z-order question (X6): nothing was ever shared through this function. |
| `timing.activeAt` | **DELETE** | Dead wrapper; predicate sharing architecture from H.2-A fully preserved (`primitives/temporal.isActive` ← `isActiveAt` ← consumers; window resolution untouched). Its removal neither duplicates nor alters temporal semantics. |
| `BodyKind "video"` | **RETAIN** (with one-line retention note in `e14/types.ts`) | Removing a member of the machine-visible record type would decide modeled-but-unassigned interchange-record territory — a semantic/model choice owned by the pending dual-model question (H.1 #11), outside dead-code cleanup. Per this phase's own constraints, a machine-visible enum may remain frozen even when one value has no fixtures. Retention cost is zero (no runtime footprint, no exhaustiveness site, no evidence assertion either way). |

## 7. Implementation (exact)

Deleted file: `src/blind/index.ts`.
Removed symbols: `collectPaintingAnnotations`, `interface Encounter` (`src/blind/layers.ts`);
`activeAt` (`src/reference/lib/timing.ts`). `layers.ts` docstring adjusted minimally to
describe what the module still contains (provenance helper + painting test) while keeping
the normative citations; no other neighboring code touched.
Added: one retention comment above `BodyKind` in `src/e14/types.ts` recording why the
member stays.
No imports required removal anywhere (none of the deleted symbols had importers — that was
the audit's premise, now also its verification).

## 8. Architectural consequences

The blind renderer namespace no longer advertises a "public surface" that nothing consumes
and no documentation describes — its remaining modules are exactly its semantic resolution
stack plus its E14 adapter. `layers.ts` now contains only what executes. `timing.ts`
contains only the tested, consumed surface. The tree no longer falsely advertises dead
API; conversely, the retained `"video"` member keeps the E14 record's modeled domain
visible for the deferred dual-model decision. No broader claim: this phase performed no
consolidation, no renaming, and no redesign.

## 9. Validation

- `pnpm run check` (`tsc --noEmit`) — PASS.
- Focused suites for affected areas first (`timing`, `blind`, `iiif`) — 40/40 PASS.
- Full unit suite `pnpm test` — 9 files, 179/179 PASS.
- `pnpm run build` — PASS; bundle hash IDENTICAL to pre-phase builds
  (`index-BGJUCMue.js`) — direct observed confirmation that all deleted surfaces were
  outside the shipped module graph.
- Repository-wide usage/import audit after changes: zero references to the deleted
  symbols/files in live code; remaining mentions exist solely in frozen research records
  (G.1/H.1/H.2-B), which are correct as-of-their-era citations.
- Evidence status: `git status --short evidence` EMPTY after full-suite runs — zero churn;
  nothing regenerated, rebaselined, or absorbed.

## 10. Remaining H.2 questions (carried forward unchanged)

- H.1 #6 — main.ts E14 ↔ legacy bridge normalization / permanent compatibility tier.
- H.1 #7 — LabApi contract divergence across stages.
- H.1 #8 — evidence-writing separation vs P-4/P-7-sanctioned embedded model.
- H.1 #9 — unreachable defensive branch in `temporalWindow` (remove vs document).
- H.1 #10 — U2 naming policy (renderer letters/directory prose fate).
- H.1 #11 — dual-model arrangement (legacy display models + E14 record): now also owns
  the retained `BodyKind "video"` decision recorded above.
- Deferred observation (from H.2-A, re-checked here): six local `asArray` copies —
  none is a dead surface (`reference/lib/asArray.ts` is consumed within reference; the
  other five are file-private and used), so H.2-C's scope criterion for touching them is
  not met. Optional future class-1 consolidation remains open.

None of these is resolved or prejudged by H.2-C.
