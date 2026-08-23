# Phase H.2-B — Comparison Infrastructure & Oracle Ownership

Status: implemented. This phase resolves ONLY H.1 deferred questions #3 (`blind/comparison.ts`
ownership) and #4 (Renderer B / oracle path ownership). Baseline: H.2-A as committed
(`src/primitives/` namespace, four-tier governance rule, N6 decoupled from `src/blind/`).
No behavior, evidence, fixture, machine-surface, or conformance change was made or needed.

Epistemic labels: **OBSERVED** (established from source/config/cited documents),
**INFERRED** (supported interpretation), **OPEN QUESTION** (carried, not resolved here).

---

## 1. Scope and explicit exclusions

In scope: ownership/location decisions and any resulting mechanical moves for
`src/blind/comparison.ts`, `src/experiments.ts`, `src/reference/renderers/rendererB.ts`;
import updates caused solely by those moves; documentation directly recording them.

Excluded (hard, unchanged): renderer renames (A/B/Blind/Native); URL/query parameters;
verdict strings; E14 types; ResolvedOverlay design; main.ts bridge semantics; LabApi
normalization; evidence-writer separation; unused-export/dead-branch removal; `asArray`
consolidation; fixture content; evidence regeneration; conformance/profile semantics;
ambiguity classifications; security/MF/placement/temporal/z-order policies; moving
`e14/comparison.ts` or `experiments.sameOverlay` out of their modules; H.2-C.

## 2. Source evidence used

- `src/blind/comparison.ts` (271 lines): self-header "NOT part of the blind renderer's
  semantic resolution … test/evidence harness"; imports reference types +
  `computeNestedSvgPlacement`/`canvasPointOfSvgUserPoint` (reference's own placement
  predictor) and blind types + `canvasPointOf`.
- Import census (grep, re-run post-move): consumers of `blind/comparison.ts` were exactly
  `src/main.ts` (`__lab.parityBlind`) and `tests/blind-comparison.test.ts` (evidence
  producer for `evidence/blind-comparison/*`). Nothing under `src/blind/` imported it;
  it was not exported by the `blind/index.ts` barrel.
- `src/experiments.ts`: already at `src/` root — NOT inside `reference/`. Oracle registry
  (`expRefs`, per-experiment expected overlays fetching `/svg/exp*.svg`) plus L1 parity
  comparator (`sameOverlay`). Sole importer: `main.ts`.
- `src/reference/renderers/rendererB.ts` (31 lines): pure lowering of `ReferenceOverlay[]`
  into the legacy `ResolvedOverlay` record via neutral `readSvgRootAttrs`; no standards
  resolution. Importers: `main.ts` and `tests/iiif.test.ts`. NOTHING inside
  `src/reference/` imports it; `renderers/dom.ts` (Renderer A stage) is fully independent.
- Configs (`vite.config.ts`, playwright configs), `index.html`, `public/*.html`: zero
  string/path references to the three modules (module paths are not machine surfaces).
- G.1 §2.1/§3.2/§3.4/§9 ("naming breadth drift" finding), H.1 §2/§3/§4/§6/§7,
  consolidation-map §1.4 (frozen; rows recording the historical tree rules),
  docs/blind-renderer-report.md (frozen L0; cites the old path as-era).

## 3. Current ownership/dependency map (before this phase)

```
main.ts (harness) ──► experiments.ts (oracle data + sameOverlay)      [src root]
main.ts ──► reference/renderers/rendererB.ts (oracle lowering)        [inside consumer #1]
main.ts ──► blind/comparison.ts (L2 semantic diff)                    [inside consumer #2]
main.ts ──► e14/comparison.ts (L3 record diff)                        [experiment dir]
tests/blind-comparison.test.ts ──► blind/comparison.ts (+ resolvers)
tests/iiif.test.ts ──► rendererB.ts
blind/comparison.ts ──► { reference/lib/types+svg predictor ; blind/types+placement }
rendererB.ts ──► { reference/lib/types (legacy record) ; primitives/svg-root }
experiments.ts ──► reference/lib/types (legacy record types only)
```

OBSERVED: both moved modules already depended only on (a) the legacy record model — which
H.1 §7 determined is lab-wide substrate ("regression/oracle substrate"), not Renderer A's
implementation — and (b) neutral primitives. Neither was imported by any consumer
resolver/stage. The misleading aspect was purely *who appears to own them* (tree shape),
never an actual dependency of consumer semantics on harness code.

## 4. H.1 #3 analysis — `blind/comparison.ts`

1. Role: OBSERVED comparison/diagnostic infrastructure (its header; G.1 §3.4; H.1 §6 L2).
   Under the H.2-A governance rule it is harness infrastructure — outside the four tiers
   eligible to be consumed BY renderers, and explicitly NOT a shared semantic primitive.
2. Dependency direction: OBSERVED downward into both consumers from harness position;
   imported only by harness-side callers.
3. Consumers: OBSERVED `__lab.parityBlind` + `tests/blind-comparison.test.ts`.
4. Move changes dependency direction? No.
5. Public API changes? None required; exports preserved verbatim.
6. Blinding contamination? The move REMOVES the last structural exception in the blinding
   audit ("blind → reference import"). The import itself was always harness privilege
   ("compare like-for-like", per its own header); the file merely wore a consumer's
   directory. Post-move the graph states what H.1/G.1 concluded in prose.
7. Evidence/experiment semantics? File content functionally identical; producer suite
   unchanged (P-4 row still `tests/blind-comparison.test.ts`); evidence family name
   `evidence/blind-comparison` untouched (frozen coordinate).
8. Location historical or architectural? OBSERVED historical: born in the blind
   generation alongside the blind stack; G.1's "naming breadth drift" finding; zero
   architectural coupling to `src/blind/` (no internal importer, absent from barrel).

INFERRED conclusion: leaving it in place with documentation-only clarification would keep
the tree asserting a false ownership relation that two inventory phases had to keep
re-explaining. The smallest honest change is the move.

Decision: **MOVE to `src/comparison/blind-comparison.ts`.** New small dedicated directory
named for the layer H.1 itself names ("Comparison / Diagnostic Infrastructure") — not a
generic `shared/`/`utils/`. Filename keeps the era vocabulary "blind comparison"
(N-06; matches `tests/blind-comparison.test.ts` and the evidence family). Alternatives
rejected: `src/e14/` (wrong experiment coordinate; would imply grouping with the L3
mechanism); renaming the file away from "blind-comparison" (would sever era vocabulary);
documentation-only (see above). `e14/comparison.ts` deliberately stays where it is
(out of scope; its experiment-directory placement is a citation coordinate like n6/e15–e17).

## 5. H.1 #4 analysis — oracle path

1. Role: OBSERVED direct-reference oracle data path (H.1 §2/§4): intended geometry from
   fixture metadata; must never count as a consumer in agreement claims.
2. Dependency direction: OBSERVED — `experiments.ts` and `rendererB.ts` each depend only
   on the legacy record TYPES (`reference/lib/types.ts`) plus, for rendererB, the neutral
   primitive parser. No consumer code depends on either; Renderer A's resolver/stage are
   untouched by them.
3. Consumers: OBSERVED `main.ts` only (plus `tests/iiif.test.ts` for `resolveReference`).
4. Move changes dependency direction? No — only specifier depths change.
5. Public API changes? None (`VIDEO`, `ExpRefs`, `expRefs`, `sameOverlay`,
   `resolveReference` preserved).
6. Blinding contamination? None either way; the move eliminates the physical conflation
   G.1/H.1 flag ("`reference` conflates the Renderer-A implementation with the Renderer-B
   oracle"). Agreement claims cite `__lab.parity`, not directories, but tree shape should
   not contradict the claim discipline.
7. Evidence/experiment semantics? Zero behavior delta (bundle hash below); oracle data,
   parity semantics, fixture expectations untouched. No config references module paths.
8. Location historical or architectural? `rendererB.ts` beside `dom.ts` is OBSERVED
   historical inheritance. `experiments.ts` was ALREADY outside `reference/` at src root
   — i.e., half the oracle path never belonged to a consumer directory in the first place;
   H.1 consistently names the two files as ONE path ("Oracle / reference-data path").

INFERRED conclusion: move the whole named path so its home matches its role; keeping
`experiments.ts` at src root while moving only `rendererB.ts` would leave the path split.

Decision: **MOVE BOTH to `src/oracle/experiments.ts` + `src/oracle/rendererB.ts`.**
Directory named for the specification/H.1 role ("direct-reference oracle"). Filenames kept
verbatim: `rendererB.ts` carries the machine-letter enumerant whose prose fate is deferred
by terminology spec U2 (code enumerants persist); `experiments.ts` keeps its experiment-era
coordinate. `sameOverlay` deliberately remains embedded in `experiments.ts` exactly as
recorded (splitting it would be an abstraction this phase forbids). Alternative rejected:
root-level `src/rendererB.ts` (sprawl without semantic grouping); co-location inside
`primitives/` rejected outright (oracle is not tier-1/tier-2 infrastructure).

## 6–7. Decisions (summary)

| Item | Decision | Form |
|---|---|---|
| `blind/comparison.ts` | MOVE | → `src/comparison/blind-comparison.ts` |
| `experiments.ts` + `rendererB.ts` | MOVE as one path | → `src/oracle/{experiments,rendererB}.ts` |

## 8. Import/dependency consequences

Updated specifiers (mechanical only): `main.ts` ×3; `tests/blind-comparison.test.ts`;
`tests/iiif.test.ts`. Internal re-depths: `comparison/blind-comparison.ts` now imports
`../blind/{types,placement}.ts` (reference imports unchanged depth); `oracle/experiments.ts`
imports `../reference/lib/types.ts`; `oracle/rendererB.ts` imports
`../reference/lib/types.ts` and `../primitives/svg-root.ts`. One live-code comment
cross-reference refreshed (`src/e14/types.ts` header now cites "the comparison harnesses
under src/comparison/"). Frozen research documents citing the old paths
(docs/blind-renderer-report.md, G.1, H.1, phase-b audit) are historical records and are
deliberately NOT rewritten.

Post-move cross-tree import audit (grep-verified):

- blind → reference: **NONE** (was exactly one: the mis-filed harness; eliminated by #3)
- blind → native / n6: NONE
- reference → blind / native / n6 / oracle / comparison: NONE
- native → blind / reference / n6: NONE
- consumer → n6: NONE
- Remaining sanctioned cross-cutting edges (harness/infrastructure class, not consumer
  resolution logic): `comparison/blind-comparison.ts` → {both consumers' models +
  each side's own placement mapper} (documented compare-like-for-like privilege);
  `oracle/*` → legacy record types + primitives; `main.ts` → all implementations
  (harness by design).

## 9. Blinding implications

Methodological independence concerns consumer RESOLUTION logic; neither moved module ever
participated in any consumer's resolution. The audit classification improves: pre-phase
there was one "blind → reference" edge to justify every audit; post-phase there are none,
and the justification lives structurally in `src/comparison/` where harness privilege is
the stated purpose. No consumer gained or lost a dependency. Renderer B remains
non-consumer: nothing about agreement counting changes; if anything, `src/oracle/` now
makes it impossible to mistake the oracle for a fourth implementation when reading the
tree.

## 10. Evidence/experiment implications

None behavioral. The evidence-producing suite (`tests/blind-comparison.test.ts`) ran
during validation and produced byte-identical artifacts (`git status evidence` empty;
P-2/P-7 respected — no regeneration occurred, output simply did not drift). Production
bundle hash before and after the move is identical (`index-BGJUCMue.js`), confirming the
module graph content is unchanged. Historical identifiers preserved: evidence family
`blind-comparison`, test filename, `RendererKind`/"b"/URL params, exp ids in
`experiments.ts`.

## 11. Files changed

Renamed (git mv): `src/blind/comparison.ts` → `src/comparison/blind-comparison.ts`;
`src/experiments.ts` → `src/oracle/experiments.ts`;
`src/reference/renderers/rendererB.ts` → `src/oracle/rendererB.ts`.
Modified: `src/main.ts` (3 import specifiers), `tests/blind-comparison.test.ts`,
`tests/iiif.test.ts` (import specifiers), `src/e14/types.ts` (one stale comment
cross-reference), headers of the three moved files (ownership notes only; no logic),
`research/current-state-index.md` (pointer entry for this phase document).
Created: `research/phase-h2b-comparison-oracle-ownership.md` (this document),
directories `src/comparison/`, `src/oracle/`.
Deleted: none beyond the renames.

## 12. Validation performed

- `pnpm run check` (`tsc --noEmit`) — PASS.
- Focused suites first: `vitest run tests/blind-comparison.test.ts tests/iiif.test.ts` —
  24/24 PASS (covers the L2 comparison flow end-to-end and the oracle lowering).
- Full unit suite `pnpm test` — 9 files, 179/179 PASS.
- `pnpm run build` — PASS; bundle hash identical to pre-move build.
- Evidence check after every test run: `git status --short evidence` EMPTY.
- Import audit: §8 above.
- Commits: phase units landed separately — H.1 doc (`docs:`), then H.2-A
  (`refactor:`), then this phase; no mixing of units.

## 13. Remaining H.2 questions (unchanged)

H.1 §12 items #5–#11 stand: unused exports (`blind/index.ts` barrel,
`collectPaintingAnnotations`, `activeAt`, `BodyKind "video"`); main.ts E14↔legacy bridge
normalization; LabApi contract divergence; evidence-writing separation; unreachable
`temporalWindow` defensive branch; U2 directory/prose naming; dual-model arrangement.
Item #12 was resolved by H.2-A; items #1–#4 are now resolved (#1/#2 by H.2-A, #3/#4 by
this phase). No new open questions were created; none of the above is prejudged by the
moves recorded here.
