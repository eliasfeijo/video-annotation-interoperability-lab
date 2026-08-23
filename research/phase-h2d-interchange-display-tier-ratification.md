# Phase H.2-D — Interchange / Display Tier Ratification

Status: ratified (inspection + documentation; no behavioral change). This phase resolves
ONLY H.1 deferred questions #6 (main.ts E14 ↔ legacy bridge normalization / permanent
compatibility tier) and #11 (dual-model arrangement: permanent two-tier design vs transition
state), plus the `BodyKind "video"` consistency question H.2-C attached to #11. Baseline:
H.2-C as committed (`1283438`) plus two docs-only commits; inspection performed against a
clean tree at `385ac58`.

Epistemic labels: **OBSERVED** (established from source/config/cited documents),
**INFERRED** (supported interpretation), **OPEN QUESTION** (carried, not resolved here).

---

## 1. Scope and explicit exclusions

In scope: independent re-inspection of the three record systems (`E14Overlay`,
`ResolvedOverlay`, `BlindOverlay`), their consumers, and the two `main.ts` bridges;
ratification-or-rejection of the three-tier boundary; minimal documentation of the decision.

Excluded (unchanged): merging models; making E14 the universal runtime representation;
making `Stage` consume E14 or blind consume `ResolvedOverlay`; E14 schema redesign;
comparison/oracle redesign; experiment semantics; fixtures/evidence regeneration;
URL/query parameters; LabApi normalization (H.1 #7); evidence-writer separation (#8);
`temporalWindow` branch (#9); naming policy (#10); generic adapter namespaces; speculative
abstractions; README cleanup; terminology migration.

## 2. Method

Every claim below was re-verified directly against the current tree (not trusted from G.1/H.1
prose): full-repository import/usage greps for all three model types; direct reads of both
bridge functions, all three stages (`Stage`, `BlindStage`, `NativeStage`), all three E14
adapters (`reference/lib/e14.ts`, `blind/e14.ts`, `native/resolver.ts`), the comparison
layers (`e14/comparison.ts`, `comparison/blind-comparison.ts`, `oracle/experiments.ts#sameOverlay`),
and the e14/e16 spec/evidence paths that exercise the bridged flows.

## 3. Observed facts

### 3.1 The three record systems

| Record | Defined | Header self-description | Producers | Consumers |
|---|---|---|---|---|
| `E14Overlay` / `E14Manifest` | `src/e14/types.ts` | "shared evidence / comparison data model … deliberately shared infrastructure … NOT renderer semantics" | three adapters: `reference/lib/e14.ts#resolveE14Manifest`, `blind/e14.ts#resolveBlindE14Manifest`, `native/resolver.ts#resolveNativeManifest` — each fills the shapes with its OWN resolution logic | `e14/comparison.ts` (L3 pairwise diff), `native/stage.ts` (renders records natively), `main.ts` (exposes `__lab.e14Resolved`/`__lab.e14Compare`; lowers to legacy/blind stages via the two bridges), vitest suites e14/e16, e17 browser path (`__lab.e14Resolved`) |
| `ResolvedOverlay` | `src/reference/lib/types.ts` | "canonical, renderer-agnostic description" (legacy-era phrasing) | `reference/lib/iiif.ts#resolveManifest` (Renderer A generic path), `oracle/rendererB.ts` (Renderer B lowering) | `Stage` (`reference/renderers/dom.ts`), L1 parity `oracle/experiments.ts#sameOverlay`, L2 `comparison/blind-comparison.ts#normalizeReference`, exp1–7/text/security app flows, `main.ts resolvedA/resolvedB` |
| `BlindOverlay` | `src/blind/types.ts` | "deliberately independent of src/reference/lib/types.ts"; structural similarity explained by shared subject matter, not shared logic | `blind/resolver.ts` (packet-only resolution) | `BlindStage` (`blind/compositor.ts`), L2 `comparison/blind-comparison.ts#normalizeBlind`, `main.ts` |

### 3.2 What E14 represents

OBSERVED: an E14 record carries, per overlay: id; composition-model letter (`A` IIIF /
`B` nested-Canvas draft / `C` Web Annotation); temporal window; encounter-order zIndex;
destination rect in outer Canvas units; faithful parsed SVG root attributes; the consumer's
RESOLVED placement (mode enumerating every named reading — `viewBox-meet/slice/none`,
`no-viewBox-1to1`, `nested-canvas`, `image-contain` — plus scale/translation and the Model B
nested linear map); inner-canvas resolution for Model B; security summary (level/blocking/
decision); body kind (`svg`/`png`/`textual`/`video`); applied-rule list with provenance class
(`NORMATIVE`/`DERIVED`/`CONVENTION`/`OPEN` + experiment extensions `IMPLEMENTATION_GAP`/
`VIEWER_GAP`); optional resourceUrl/svgText payload.

OBSERVED: consumer-specific readings are carried AS DATA (each adapter's placement values
encode its own reading; e.g. reference synthesizes a viewBox for placement math but stores
the raw attrs unchanged), so the record stays neutral while preserving divergence observably.
This is what makes `compareE14`'s provenance-classified diffs possible.

OBSERVED: no interchange machinery exists over any other record. L3 (`compareE14`) is defined
only over E14; the three-way agreement claims in evidence families `evidence/e14/`,
`evidence/e16/` are keyed to these records; `NativeStage` consumes them natively.

OBSERVED: required interchange semantics do NOT exist solely in `ResolvedOverlay`. Its only
field absent from E14 is `keyframes` — the exp7 NON-STANDARD timeline that H.1 §11 #15
classifies as experimental-but-live machinery outside the conceptual model, attached to the
legacy path only.

INFERRED: E14's one non-neutral element is vocabulary-level, not semantic: the historical
experiment name (`e14`), the harness pairing labels (`RendererName = a|blind|native`), and
the two deployment-finding provenance classes. None encodes a consumer's interpretation
policy.

### 3.3 ResolvedOverlay is genuinely load-bearing

OBSERVED consumers that would be affected by replacing it: Renderer A's native output shape
(`iiif.resolveManifest`), Renderer B's oracle lowering, L1 field-diff parity (`sameOverlay`
diff strings), L2's reference-side lowering input, all regular-exp DOM flows and their
Playwright evidence (`exp1–7`, `parity`, `text`, `security` snapshots), exp7 keyframe
machinery, and `timing.isActiveAt`'s parameter type. Historical L0/L1 records cite this
vocabulary. Replacement would be a cross-cutting redesign with zero research payoff —
explicitly out of scope.

### 3.4 BlindOverlay independence

OBSERVED: produced exclusively by `blind/resolver.ts` from the interpretation packet;
consumed by `blind/compositor.ts` and (as comparison INPUT) the harness-owned
`comparison/blind-comparison.ts`. No module outside `src/blind/` + the harness produces it,
and blind resolution code imports nothing from `reference/` or `native/` (re-verified).

INFERRED: collapsing `BlindOverlay` into either other model would erase exactly the L2
observable — `compareSemantics` exists to lower TWO INDEPENDENT models into one semantic
record and diff them; sharing the input model would manufacture agreement on representation
and silently disable disagreements like `difference:no-viewBox-placement`.

### 3.5 The bridges (both verified line-by-line)

**`main.ts#e14ToResolvedA`** (sole call site main.ts:216, pre-filtered to `kind === "svg"`):

- Source/target: E14 record (from the reference adapter) → `ResolvedOverlay`.
- Transported: id, window, zIndex, destination→viewport rename, svgAttrs, svgText.
- Deliberately NOT transported: `placement` (Stage recomputes placement from viewport+attrs
  via `computeNestedSvgPlacement` — its own reading), `security` (Stage sanitizes via its
  pluggable sanitizer instead), `rules`/provenance, `model`/`kind`, Model B `nested` map,
  `resourceUrl`.
- Defensive blanking `svgText ?? ""`: unreachable for adapter output (svg kind always carries
  text); absorbs the type difference between E14's optional and ResolvedOverlay's required
  `svgText`.
- Assumption introduced: none beyond Stage's own semantics — the bridge transports raw
  material and lets the display stage re-derive placement per the reference reading.
  INFERRED: this preserves methodological independence (the harness never injects a resolved
  geometry INTO a consumer stage).
- Verdict: honest thin adapter; lossiness expected by the architecture.

**`main.ts#e14ToBlindOverlay`** (sole call site main.ts:203–205):

- Source/target: E14 record (from the blind adapter) → `BlindOverlay | null`; null for
  non-SVG or text-less bodies (filtered out).
- Recomputed at display time: security classification (`classifySvg`) + sanitized copy
  (`sanitizeSvg`) — discards the record's `security` summary because BlindOverlay requires
  blind-private detail the interchange record does not carry (per-feature map, sanitized
  text). OBSERVED: same classifier, same input ⇒ identical outcome to resolve time.
- Transformed: `placement.mode` remapped onto blind's union
  (`nested-canvas`/`image-contain` → `no-viewBox-1to1`); `model A/B/C` collapsed onto
  `IiifMode A|B` (C → "A").
- Cast, not transformed: `rules` via `as unknown as` absorbs E14's six-class `Provenance`
  superset into blind's four packet classes. Runtime-safe today (blind-adapter rules stay
  within packet classes — OBSERVED), but type-unsound in general: a genuine, silent
  representational mismatch.
- Display-inert construction: OBSERVED `BlindStage.buildNode` reads ONLY `destination`,
  `svgAttrs.viewBox/preserveAspectRatio`, `security`, `svgText` — it never reads
  `ov.placement`. The remapped placement object is therefore constructed for model
  compatibility but consumed by nothing on the current display path (L2 landmark comparison
  consumes `.placement` only for resolver-produced overlays, not bridged ones).
- Non-SVG kinds dropped: matches BlindStage's capability (it paints SVG bodies + rejection
  markers only), not an oversight; textual/png blind display simply does not exist yet.
- Verdict: mostly honest adapter, with two absorbed inconsistencies worth recording (the
  provenance cast; the IiifMode collapse). Neither affects current behavior or evidence.

### 3.6 Bridge placement

OBSERVED: each bridge has exactly one call site, both inside `main.ts`'s e14/e16 branch;
neither is exported; `main.ts` is the only module importing all three consumers (H.1 §3).
No test imports the bridges (vitest suites exercise the adapters directly; Playwright specs
exercise the bridges through `__lab` + rendered DOM).

INFERRED: relocation (e.g. to a new `src/harness/` namespace) would create a single-caller
module with no reuse horizon — an abstraction without a consumer, contrary to the repo's
reuse-discipline rule. The harness tier is where they belong.

### 3.7 `BodyKind "video"`

OBSERVED: retained by H.2-C with a code comment deferring the decision to #11; never assigned
by any adapter (all emit `"svg"|"textual"|"png"`; manifest-level video travels as
`videoUrl`); never matched (no switch on `kind`; `compareE14` diffs whatever occurs);
absent from every fixture and evidence file. `NativeStage.buildNode` routes non-textual
kinds through the `<img>` branch guarded by `resourceUrl`.

INFERRED: retention is consistent with the ratified architecture — the durable interchange
tier legitimately documents its modeled domain beyond currently exercised territory, and
removing the member would be an interchange-schema decision (a protected surface) with no
research driver.

## 4. Decisions

1. **Ratified: three-tier boundary.**
   - `E14Overlay`/`E14Manifest` = the durable interchange/semantic-record tier
     (resolves H.1 #11's direction question: permanent design, not transition state).
   - `ResolvedOverlay` = legacy display/regression/oracle substrate for the exp-era flows,
     L1/L2 comparisons, and the reference consumer's native output (multi-role, live —
     confirming H.1 §7 determination H7).
   - `BlindOverlay` = consumer-private model; must never merge or be replaced (methodological
     blinding, C5).
2. **Ratified: the two `main.ts` bridges are the permanent harness-tier boundary crossings**
   (resolves H.1 #6: neither normalized into a generic framework nor retired). Their
   documented lossiness is expected behavior, recorded in code comments; the two absorbed
   inconsistencies (§3.5) stay as-is — fixing them would alter machine-visible type surfaces
   (Provenance/IiifMode) outside this phase's scope.
3. **Retained: `BodyKind "video"`**, now owned by the ratified boundary instead of deferred
   to #11 (which this phase closes).
4. **Documentation-only implementation**: phase record (this file), current-state index
   pointer updates, and minimal comment updates at the three ratification sites
   (`main.ts` ×2 bridges, `e14/types.ts` ×1 BodyKind note). Zero behavioral delta.

## 5. Explicitly carried forward (unchanged)

- H.1 #7 LabApi contract divergence across stages. Newly observed related fact (reported,
  not fixed): `?renderer=native` on a LEGACY experiment drives `NativeStage` with
  `ResolvedOverlay[]` via casts — unguarded and would crash at runtime if exercised. This
  belongs to #7's surface, untouched here.
- H.1 #8 evidence-writer separation; H.1 #9 `temporalWindow` branch; H.1 #10 naming policy.
- Newly observed non-blocking residue (reported, not fixed): unused duplicate import
  `ResolvedOverlay as RefOverlay` at `src/main.ts:25` (compiles only because
  `noUnusedLocals` is off). Dead-code cleanup is out of scope for H.2-D.

None of the above is prejudged by this phase.

## 6. Validation

Performed after implementation (see final report): `pnpm run check`, `pnpm test` with
post-run `git status --short evidence` clean-check, full diff review, bundle-graph
irrelevance argued from comment-only source delta.

---

*End of Phase H.2-D. Remaining open questions: #7, #8, #9, #10 (carried unchanged).*
