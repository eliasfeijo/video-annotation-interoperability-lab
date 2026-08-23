# Phase H.2-A — Shared Primitive Namespace & Duplication Reconciliation

Status: implemented. This phase resolves ONLY the H.1 deferred questions #1 (should the
de-facto shared primitives gain a real namespace), #2 (which duplicated bodies consolidate
versus remain duplicated), and #12 (recording the helper-reuse governance rule before/at
physical movement). It is bounded by its brief: no renames of Renderer A/B/Blind/Native, no
URL/verdict/machine-surface changes, no Renderer B move, no `blind/comparison.ts` move, no
E14/ResolvedOverlay/LabApi redesign, no z-order/security/bounds-policy unification, no
fixture or evidence changes. Behavioral preservation was verified by the existing test
suites and by byte-identical comparison-evidence output.

Companion inputs: `research/phase-h1-concept-architecture-reconciliation.md` (§5 operation
classification, §8 N6 analysis — authoritative basis for every decision below),
`research/terminology-specification.md`, `research/consolidation-map.md` §1.4 (the source-
tree rule this phase extends), `docs/blind-interpretation-rules.md` (the packet),
`docs/ambiguities.md`, `research/evidence-policy.md`.

---

## 1. Governance rule for helper reuse (resolves H.1 #12)

H.1 §8 found an asymmetry: the packet sanctions pure-helper reuse INTO the blind renderer,
and `consolidation-map.md` §1.4 records the N6 precedent ("its helpers may be reused as
pure functions"), but nothing governed reuse OUT OF renderer namespaces. That gap is closed
here by an architectural governance rule (not a profile requirement; it adds nothing to
R-S1…R-S8b/X1–X8 and changes no conformance claim):

Every duplicated or cross-consumed operation is classified as exactly one of:

1. **Renderer-neutral primitive** — zero interpretive content; same output for all
   consumers; no acceptance/bounds/defaulting policy (e.g. SVG root attribute extraction;
   the half-open activity predicate). MAY live in and be imported from
   `src/primitives/`. Reuse is free in any direction.
2. **Profile-defined reading** — a named interpretation the profile itself assigns
   (e.g. region-as-viewport placement per R-S2 with the packet's §§5–7 no-viewBox → 1:1
   branch). MAY be shared ONLY under a name and header that state the reading explicitly,
   so the alternative readings stay visible next to it.
3. **Consumer-policy implementation** — embodies a choice where consumers deliberately
   diverge (Media-Fragment bounds/drop policy; security posture; z-order; window
   defaulting; synthesized-viewBox placement). MUST stay owned by its consumer; sharing
   is prohibited when it would collapse a research observable.
4. **Analysis-only / counterfactual implementation** — prediction machinery consumed by
   no renderer (`e15/analysis.ts`, `e16/comparison.ts`). Renderers MUST NOT import it;
   it exists to measure readings, not to implement them.

Binding corollaries:

- **Physical location does not establish semantic ownership.** A helper inside
  `src/blind/` is not blind semantics merely by living there; a moved helper does not
  become authority-free truth either — its CLASS (1–4 above) travels with it and is
  stated in its module header.
- **Extracting a helper from a renderer does not make that renderer authoritative.**
  Canonicalization of previously duplicated bodies onto one copy is a reconciliation of
  incidental drift, decided on evidence of equivalence, never a promotion of the source
  consumer's reading.
- **Methodological independence concerns semantic resolution logic, not mathematical
  utility code.** Blinding forbids consumer A importing consumer B's resolution choices;
  it does not forbid two implementations calling the same policy-free arithmetic.

This rule governs future consolidation phases and any new code; it resolves the H.1 §8
risk of asymmetric evolution (a validator silently inheriting consumer specialization) by
requiring such specialization to leave the primitives namespace first.

## 2. Namespace decision (resolves H.1 #1)

Adopted: **`src/primitives/`**, mirroring H.1's own layer name ("[de-facto] Shared
Semantic Primitives"). It contains three modules — small, semantically honest, each
header declaring its class from §1:

| Module | Class | Contents |
|---|---|---|
| `primitives/svg-root.ts` | 1 neutral | `readSvgRootAttrs`, `parseViewBox`, `svgInnerContent`, types `SvgBox`/`SvgRootAttrs` |
| `primitives/temporal.ts` | 1 neutral | `isActive`, type `TimeWindow` |
| `primitives/region-as-viewport-placement.ts` | 2 profile-defined | `computeRegionAsViewportPlacement` (the full R-S2/packet reading incl. its labeled `no-viewBox-1to1` branch and `viewBox-none` stretch), `regionAsViewportViewBoxFit` (meet/slice affine kernel) |

Rejected alternatives: a generic `src/shared/` dumping ground (invites class-3 leakage);
`src/std/` (implies standards authority that only class-2 items partially carry);
per-consumer re-export shims as the primary home (preserves accidental coupling).

The namespace does NOT imply normative consumer semantics: class-1 modules are
policy-free parsing/arithmetic, and the single class-2 module is named for its reading
and documents its fork (`docs/ambiguities.md` #1/#5) in its header.

## 3. Consolidation decisions (resolves H.1 #2)

| Operation (H.1 ref) | Decision | Reason |
|---|---|---|
| SVG root parsing ×3 (§5.3) | CONSOLIDATED into `primitives/svg-root.ts`; private copies removed from `reference/lib/svg.ts` and `native/resolver.ts`; `blind/svg-root.ts` deleted | Zero interpretive content (H.1: category C today, B in principle); n6 already consumed the blind copy. Canonical body = the former blind copy (already de-facto shared, most-documented). Absorbed incidental micro-drift: width/height forms with exponent notation (`1e2`) or leading `+` parsed differently across the old copies (regex-prefix vs `parseFloat`); no fixture, test, spec, or evidence path exercises these forms (all fixture roots use plain integers), so observables are unchanged. |
| Temporal predicate (§5.2) | CONSOLIDATED: `isActive` + `TimeWindow` → `primitives/temporal.ts`; `native/stage.ts`, blind compositor/resolver, and `reference/lib/timing.ts#isActiveAt` now all delegate to it | `[NORMATIVE]` MF §4.2.1 half-open interval; recorded three-consumer AGREEMENT point (ambiguities "Points where all three agree"). Window RESOLUTION stays per-consumer (see preserved row below). |
| Region-as-viewport placement (§5.4) | MOVED+LABELED: `blind/placement.ts#computePlacement` → `primitives/region-as-viewport-placement.ts#computeRegionAsViewportPlacement`; meet/slice affine core extracted as `regionAsViewportViewBoxFit({destination, viewBox, meet, align})` and reused by reference `refPlacement` and native `nativePlacement` viewBox branches | H.1: the arithmetic is "not the independence-bearing part; the policy choice is". The kernel takes PRE-PARSED components so each consumer keeps its own preserveAspectRatio-parsing discipline (token-split vs substring test — behaviorally distinct on non-canonical strings, preserved exactly); float-operation order is bit-identical to all three replaced bodies. The no-viewBox fork (1:1 vs synthesized-fit) and the `none`-branch representation conventions remain fully consumer-owned. |
| Media-Fragment parsing ×4 (§5.1) | NOT EXTRACTED — implementations remain separate | No clean policy-free lexical/core split exists without redesigning four modules around a new abstraction: acceptance policies (bounds rejection MF §6.3.3 vs none vs `x<w&&y<h`; drop-vs-report; end<start handling; even `t=,` diverges: reference `{start:0}` vs blind drop) are interwoven with the lexical steps at every level. The bounds fork is a documented genuine `[NORMATIVE]` ambiguity (ambiguities #6) that must stay observable; n6's producer grammar is a different obligation class. Explicit duplication is preferable to hiding this divergence (phase rule; H.1 answer C). |
| Nested-Canvas mapping ×3 (+e16) (§5.5) | NOT EXTRACTED | The fill formula is two divisions inline in each resolver, interwoven with the per-consumer `nestedFit:"fill"\|"contain"` handling whose contain branch is live counterfactual machinery (e16-comparison suite) over `[OPEN]` territory (X1). `e16/comparison.ts#fitMap` already owns the factored ANALYSIS version by design ("renderers keep their own independent code"); making renderers import it would violate that documented separation, and a new shared module would buy near-zero deduplication while touching composition paths that feed E14 evidence. |
| Window resolution (`resolveWindow`/`temporalWindow`/inline `windowOf`) | NOT EXTRACTED | Defaulting nuances differ incidentally (duration-null vs duration≤0 guards; reference's unreachable defensive `end<start` coercion is OUT OF SCOPE per phase brief, H.1 §10/H.2 #9). Predicate shared instead; resolution stays consumer-local. |
| `asArray` ×6 (§5.9) | NOT TOUCHED this phase | All copies are file-private/local except `reference/lib/asArray.ts` (consumed within reference only) — there is no namespace coupling to remove; consolidating would touch six files for zero semantic gain. Remains available as a future class-1 candidate. |
| Reference landmark predictor `canvasPointOfSvgUserPoint` | NOT REWIRED onto the kernel | Algebraically equivalent but reordered floating-point evaluation could perturb last-ulp outputs of a predictor whose exact values feed exp5 coordinate-drift checks and archived expectations. Deduplication value ≈ 0; risk > 0. |

## 4. N6 dependency resolution (focus F)

Before (H.1 §8): validator compiled against a consumer directory's internals —
`n6/svg.ts ← blind/svg-root`, `n6/validator.ts ← blind/placement` + `blind/types`.

After:

```
            profile-defined / neutral primitives (src/primitives/)
                     /                    |                \
                reference/              blind/             n6/
          (realizes the reading;   (one realizing     (declarative predictor
           owns synthesized-        consumer; owns     for conforming bodies;
           viewBox counter-         its adapters,      producer-strict grammar)
           reading, policies)       policies)              |
                                                           (no other deps)
```

N6 imports `computeRegionAsViewportPlacement`, `readSvgRootAttrs`, and `SvgRootAttrs`
from `src/primitives/` only. N6 remains a validator: browser-free, consumer-free, with no
consumer semantics acquired; it simply no longer reaches into a renderer namespace. The
target relationship from the phase brief (primitive above blind and n6; consumer policy
below) is now literal in the import graph.

## 5. Methodological blinding audit (post-refactor, verified by import grep)

- `src/blind/**` imports from `../reference/`, `../native/`, `../n6/`: NONE (the only
  pre-existing exception, `blind/comparison.ts` → reference placement predictor, is
  self-described harness infrastructure, unchanged, and excluded by phase non-goals).
- `src/reference/**` imports from blind/native/n6: NONE.
- `src/native/**` imports from blind/reference/n6: NONE (the H.1-observed
  `native/stage → blind/temporal` cross-import is replaced by `primitives/temporal`).
- Consumer → n6 imports: NONE.
- No shared module contains a consumer policy: `primitives/*` contain no bounds,
  drop/report, security, defaulting, or fit-selection decisions (class-2 module states
  and labels its assigned reading).
- No hidden coupling through the new abstraction: the placement kernel cannot select an
  interpretation — callers supply the parsed reading components and own every branch
  fork (no-viewBox, none-stretch, synthesis).

## 6. Validation performed

- Typecheck: `pnpm run check` (`tsc --noEmit`) — PASS.
- Focused unit suites first (svg, timing, selectors, blind, iiif, n6-conformance):
  94/94 PASS.
- Full unit suite (`pnpm test`): 9 files, 179/179 PASS.
- Production build (`pnpm run build`): PASS.
- Evidence: NO regeneration; `git status` clean under `evidence/` after full runs
  including the three evidence-writing suites — their output was byte-identical,
  which is itself behavioral confirmation (P-2/P-7 compliance).
- Import-graph audit: §5 above.

## 7. Files touched

Created: `src/primitives/svg-root.ts`, `src/primitives/temporal.ts`,
`src/primitives/region-as-viewport-placement.ts`, this document.
Deleted: `src/blind/svg-root.ts` (body moved verbatim; barrel re-points at the
primitive).
Modified (imports/delegation only unless noted): `blind/{placement,temporal,resolver,e14,compositor,index}.ts`,
`reference/lib/{svg,e14,iiif,timing}.ts`, `reference/renderers/{dom,rendererB}.ts`,
`native/{resolver,stage}.ts`, `n6/{svg,validator}.ts`, `tests/{blind,svg}.test.ts`.
Behavior-affecting edits are limited to the two meet/slice kernels' call sites and the
timing `isActiveAt` delegation — each verified expression-identical to its predecessor.

## 8. Remaining H.2 questions (unchanged; explicitly deferred)

H.1 §12 items #3–#11 stand as written (comparison-harness placement; oracle path home;
unused exports; main.ts bridges; LabApi normalization; evidence-writing separation;
unreachable `temporalWindow` branch; directory/prose naming under U2; dual-model
arrangement). Nothing in this phase prejudges them. New residual noted for H.2:
the six local `asArray` copies (no coupling; optional future class-1 consolidation) and
the blind barrel's public surface now composing primitive re-exports (barrel itself has
zero consumers; deletion remains H.2 #5).
