# Phase G.1 — Independent Source Architecture Inventory

Status: observation-only audit of the executable source tree.
Method: entry points were reconstructed from `index.html`, `package.json`, the Vite/Vitest/Playwright
configs, and by following imports from each entry point. `research/*` documents were used as
contextual navigation only, never as authority for what the code does. Code comments were treated
as claims, not proof; every load-bearing statement below was checked against source.

No repository file was modified, renamed, deleted, or regenerated during this audit.

---

## 1. Repository source architecture

The repository is a Vite SPA laboratory plus a Node-side validator, organized around three
deliberately independent "renderers" (consumer implementations) and several measurement /
comparison / validation layers.

### Executable areas (as they exist today)

| Area | Kind | One-line actual role |
|---|---|---|
| `index.html` + `src/main.ts` + `src/experiments.ts` + `src/style.css` | Application/runtime harness | Query-param driven lab page (`?exp=…&renderer=…`), boots one of three stage implementations, exposes the `window.__lab` automation API used by Playwright |
| `src/reference/` | Renderer implementation + lib + oracle | "Renderer A": IIIF manifest → `ResolvedOverlay[]` (`lib/iiif.ts`); DOM SVG compositor (`renderers/dom.ts` `Stage`); pluggable sanitizer (`lib/sanitize.ts`); plus Renderer B oracle (`renderers/rendererB.ts` fed by `experiments.ts`) and an E14 adapter (`lib/e14.ts`) |
| `src/blind/` | Renderer implementation (independent) | "Blind Renderer": its own data model (`types.ts`), manifest parser, Media-Fragments parser, temporal resolution, SVG-root parsing, placement math, z-order provenance, security classification/sanitization, resolver (`resolver.ts`), DOM compositor (`compositor.ts` `BlindStage`), an E14 adapter (`e14.ts`), and a comparison harness (`comparison.ts`); unused public barrel (`index.ts`) |
| `src/native/` | Renderer implementation | "Browser-Native Renderer": E14-model resolver (`resolver.ts`, Models A/B/C) whose distinguishing behavior is rendering bodies via `<img>` (SVG-as-image pipeline) in `stage.ts` (`NativeStage`) |
| `src/e14/` | Shared comparison infrastructure | The shared semantic record type (`types.ts`) filled by all three renderers' E14 adapters, and a three-way pair comparator with provenance classification (`comparison.ts`) |
| `src/e15/` | Measurement infrastructure | Browser matrix page embedding landmark SVGs through 8 mechanisms × 4 regions × 10 variants (`page.ts`, mounted at `/e15-lab.html`), plus pure interpretation-prediction math (`analysis.ts`) used to classify measured geometry |
| `src/e16/` | Analysis helpers only | Pure nested-Canvas fit math (`fitMap`, `landmarkToOuter`, `fitsCoincide`) — no renderer imports it |
| `src/e17/` | Measurement infrastructure | Supplementary xMaxYMax matrix page (`page.ts`, mounted at `/e17-lab.html`) and a screenshot classifier (`classify.ts`) that re-exposes the E15 scoring math as importable Node-side code |
| `src/n6/` | Validator (browser-free, deterministic) | Resource-conformance validation of manifests against requirement ids R-S1…R-S8b: orchestrator (`validator.ts`), per-rule predicate modules (`svg.ts`, `canvas.ts`, `aspect.ts`, `mapping.ts`, `fragments.ts`, `exclusions.ts`), pre-registered black-box suite T01–T15 (`suite.ts`) |
| `public/*.html` | Static pages | `viewer-check.html` (Ramp) and `mirador-check.html` (Mirador 3): third-party consumer probes loading unpkg bundles; no `src/` wiring |

### Non-executable but load-bearing

- `public/svg/**`, `public/manifests/**`, `public/video/*.mp4` — fixtures served by Vite; consumed by
  the app, the unit tests (via filesystem reads), and the third-party consumer probes.
- `evidence/**` — generated artifacts (see §8). Not inputs to any source module.

---

## 2. Entry points and major flows

### 2.1 Browser entries

1. **`/` — main lab app** (`index.html` → `src/main.ts`). OBSERVED flow:
   - URL params select experiment (`exp`), renderer (`a` | `b` | `blind` | `native`; `b` is refused
     for `7-animate`), sanitize on/off, fit, aspect preset (main.ts:69–102).
   - Stage selection: `NativeStage` / `BlindStage` / `Stage` (main.ts:88–96). Sanitizer injection
     applies only to the reference `Stage` path; blind sanitization is decided at resolve time and
     `setSanitize` is a no-op under blind (main.ts:365–369).
   - **E14/E16 branch** (`exp` starts with `e14`/`e16`): fetches
     `/manifests/{e14|e16}/{exp}.json`, resolves the same fixture through three independent
     resolvers — `resolveE14Manifest` (reference), `resolveBlindE14Manifest` (blind),
     `resolveNativeManifest` (native) — stores them, drives the chosen stage, and exposes
     `e14Resolved()` / `e14Compare()` (→ `compareE14`) on `__lab` (main.ts:168–224).
   - **Regular experiments branch**: fetches `/manifests/{name}.json` (name from `MANIFEST_MAP`
     alias `"6"→"exp1.json"`, `case*.json` passthrough, else `exp{N}.json`; main.ts:111–115,
     226–228), resolves with reference `resolveManifest` AND independently with
     `resolveBlindManifest`; renderer B's expected set comes from `experiments.ts#expRefs`
     (hard-coded per-experiment oracle incl. fetching `/svg/exp*.svg`) lowered by
     `resolveReference`. exp7 additionally fetches the non-standard keyframe sidecar
     `exp7-keyframes.json` and attaches keyframes to resolved overlays (main.ts:251–275).
   - **Automation API** `window.__lab`: parity (`parity()` = A vs B field diff via
     `sameOverlay`; `parityBlind()` = A vs blind semantic diff via `compareSemantics`),
     seek/play/pause, `activeIds`, `snapshot()` (geometry snapshot; shape differs per stage —
     see §9), coordinate conversions, `imgMetrics` (native only), `domProbe`, `overlayRect`,
     `layerCount`, `setFit`, `setSanitize` (main.ts:312–380).
2. **`/e15-lab.html`** (`public/e15-lab.html` → `src/e15/page.ts`). Builds the embedding matrix,
   exposes `window.__e15` (`cells()`, `ready()`, `intrinsics()`, `innerSvgBox()`,
   `objectLoaded()`). Implements no IIIF/W3C semantics (page.ts header claim matches code).
3. **`/e17-lab.html`** (`public/e17-lab.html` → `src/e17/page.ts`). Same cell conventions as E15,
   one variant (`e17-vb1000-max.svg`), two regions; exposes `window.__e17`.
4. **`/viewer-check.html`, `/mirador-check.html`** — static pages that load Ramp / Mirador UMD
   bundles from unpkg and point them at locally served manifests. No src imports; exercised only
   by `tests/e2e/viewer.spec.ts` (Ramp) and `tests/e2e/n2-viewer.spec.ts` (both).

### 2.2 Node entries

- **`scripts/run-n6-suite.mts`** — runs `src/n6/suite.ts#runSuite()` (which drives
  `src/n6/validator.ts`) and writes `evidence/n6/*.json`. No browser involvement.
- **Vitest** (`vitest.config.ts`, include `tests/**/*.test.ts`, node environment): unit tests
  import `src/**` directly; three suites also *write* evidence during test runs (§8).
- **Playwright**: three configs.
  - `playwright.config.ts` (default, used by `pnpm test:e2e`): `testDir ./tests/e2e`, single
    implicit chromium project, **no `testMatch`/`exclude`** — so a default run includes ALL 18
    specs, including `e17.spec.ts` and `n2-viewer.spec.ts`.
  - `playwright.e17.config.ts`: pins `/e17\.spec\.ts$/`, 3 engine projects.
  - `playwright.n2.config.ts`: pins `/n2-viewer\.spec\.ts$/`, chromium only.
- **package.json scripts**: `dev/build/preview` (vite), `test` (vitest), `test:e2e` (default
  playwright config), `gen:video`, `gen:fixtures` (= `build-fixtures.mjs` ONLY), `check`
  (`tsc --noEmit`). OBSERVED: the e14/e15/e16/e17/n2 fixture builders have no package.json
  script and must be invoked directly with `node`.

---

## 3. Responsibility map

For each area: what it does, who consumes it, what it depends on, reuse outside its origin,
name fit, overlap.

### 3.1 `src/main.ts` (+ `index.html`)
- **Does**: parameter parsing; stage/renderer selection; manifest fetching; orchestration of
  parallel resolutions; bridge adapters between E14 records and the older models
  (`e14ToResolvedA`, `e14ToBlindOverlay`, incl. a placement-mode remap
  `nested-canvas|image-contain → no-viewBox-1to1` at main.ts:152–156); `__lab` API surface;
  HUD clocking; `lab-ready` event dispatch.
- **Consumed by**: all Playwright specs that call `gotoLab` (`tests/e2e/utils.ts` waits for
  `__lab`).
- **Depends on**: every renderer area, both comparison harnesses, `experiments.ts`.
- **Reusable outside itself**: no — it is the harness glue.
- **Name fit**: "main" is accurate; it is not part of any renderer's semantics.
- **Overlap**: contains model-conversion logic (E14↔reference/blind shapes) that is neither
  renderer semantics nor comparison; it exists only because the lab drives old-model stages with
  new-model records in the e14/e16 branch.

### 3.2 `src/experiments.ts`
- **Does**: hard-codes the Renderer-B oracle per legacy experiment (fetches the same `/svg/exp*`
  payloads the manifests reference) and defines `sameOverlay`, the normalized A-vs-B field diff.
- **Consumed by**: `main.ts` only.
- **Depends on**: `reference/lib/types.ts` (and runtime `fetch`).
- **Name fit**: partially — it is really "renderer-B expected values + parity diff", i.e. test
  oracle data living in `src/` application space.
- **Overlap**: `sameOverlay` overlaps conceptually with `blind/comparison.ts` and
  `e14/comparison.ts` (three different diff vocabularies).

### 3.3 `src/reference/`
- **Does**:
  - `lib/selectors.ts`: Media-Fragments subset parser (`t=`, `xywh=` with
    `pct:`/`percent:`/`pixel:` prefixes). No out-of-bounds rejection.
  - `lib/timing.ts`: temporal window + half-open activity predicates
    (`temporalWindow`, `isActiveAt`, `activeAt`).
  - `lib/svg.ts`: root-attribute parsing, inner-content extraction, nested-svg placement
    synthesis (`computeNestedSvgPlacement` synthesizes a viewBox when absent) and a
    browser-mirroring user→canvas predictor (`canvasPointOfSvgUserPoint`).
  - `lib/iiif.ts`: Renderer-A manifest resolution (`resolveManifest`) — Canvas discovery,
    painting walk, target/fragment merge, video vs SVG body split, zIndex by encounter order.
  - `lib/sanitize.ts`: render-time allowlist sanitizer (`allowlistSanitizer`, DOMParser-based)
    + `identitySanitizer`; explicitly labeled an experiment, not a production sanitizer.
  - `lib/asArray.ts`: one-off helper; used only by `lib/e14.ts` (iiif.ts keeps its own local copy).
  - `lib/e14.ts`: Renderer-A E14 adapter (Models A/B/C) with its own placement math
    (`refPlacement` — synthesizes viewBox when body has none) and nested-canvas recursion.
  - `renderers/dom.ts`: `Stage` compositor (letterboxed content rect, host `<svg>` spanning the
    canvas, nested `<svg>` per overlay, sanitizer hook, keyframe interpolation
    `keyframeOffset` — non-standard exp7 feature, `geometrySnapshot`).
  - `renderers/rendererB.ts`: lowers the non-standard `ReferenceOverlay[]` oracle into
    `ResolvedOverlay[]`.
- **Consumed by**: `main.ts`; vitest suites (`timing`, `selectors`(ref), `svg`, `iiif`,
  `blind-comparison`, `e16-comparison`); indirectly by `blind/comparison.ts` (its placement
  predictor is imported there by design, per that module's own doc comment).
- **Depends on**: nothing else in `src/` except `../..//e14/types.ts` types in `lib/e14.ts`.
- **Reuse**: `lib/selectors|timing|svg` are generic and dependency-free (run in Node + browser);
  the rest is lab-specific.
- **Name fit**: "reference" means two different things here — the *Renderer-A implementation*
  (`lib/iiif.ts`, `renderers/dom.ts`) and the *Renderer-B oracle* (`rendererB.ts`). Both are
  historical names ("renderer letters").
- **Overlap**: substantial functional overlap with `blind/` and `native/` (parsing, placement,
  timing) — intentional independence, see §6.

### 3.4 `src/blind/`
- **Does**: a full second consumer implementation with an explicitly richer evidence-oriented
  output:
  - `parser.ts`: Canvas/AnnotationPage walk; target/source normalization (W3C `source` vs IIIF
    `id`); FragmentSelector extraction; body classification (SVG/video).
  - `selectors.ts`: Media-Fragments parser; rejects `end < start`; drops invalid fragments;
    implements MF §6.3.3 top-left-outside rejection; keeps a `percent` flag on spatial results.
  - `temporal.ts`: half-open window resolution + `isActive`.
  - `svg-root.ts`: regex root-attr parsing (dependency-free), viewBox validation, wrapper strip.
  - `placement.ts`: `computePlacement` (meet/slice/none/no-viewBox branches) + `canvasPointOf`.
  - `layers.ts`: encounter-order flattening (`collectPaintingAnnotations` — currently uncalled),
    `isPainting`, `zProvenance(mode)` (Mode B normative vs Mode A convention).
  - `sanitize.ts`: feature classification (11 features, 4 blocking) + allowlist sanitization
    (DOMParser path; conservative regex scrub fallback for Node) + style filtering.
  - `resolver.ts`: Mode A/B lowering into `BlindOverlay[]` with per-overlay applied-rule +
    provenance records; unsafe bodies get `sanitized: null`.
  - `compositor.ts`: `BlindStage` — writes a nested `<svg>` with destination x/y/w/h, emits
    viewBox/PAR only when the body declares them (the documented disagreement with Renderer A's
    synthesized viewBox), renders explicit rejection markers for unsafe bodies, visibility via
    `isActive`, `geometrySnapshot`.
  - `e14.ts`: blind E14 adapter (Models A/B/C) reusing parser/temporal/placement/sanitize.
  - `comparison.ts`: NOT renderer semantics (self-declared); lowers both reference and blind
    outputs into a "semantic overlay" record with sampled landmarks and diffs/classifies them
    (`compareSemantics`, `classifyDifference` with tags like
    `difference:no-viewBox-placement`).
  - `index.ts`: barrel re-exporting everything — **no importer found anywhere**.
- **Consumed by**: `main.ts`; vitest (`blind.test.ts`, `blind-comparison.test.ts`);
  `native/stage.ts` (imports `blind/temporal.isActive`); `n6/svg.ts` + `n6/validator.ts`
  (import `blind/svg-root.readSvgRootAttrs`, `blind/placement.computePlacement`,
  `blind/types.SvgRootAttrs`); e2e via the app.
- **Depends on**: nothing from `reference/` inside the resolver path; `comparison.ts`
  deliberately imports `reference/lib/svg.ts` + types.
- **Reuse**: selectors/temporal/svg-root/placement are dependency-free and reusable;
  `compositor.ts` and `e14.ts` are lab-bound.
- **Name fit**: "blind" describes the historical method (written without reading other
  implementations), not a technical capability; the directory now also hosts comparison
  machinery (`comparison.ts`) which is explicitly *not* blind-renderer semantics.
- **Overlap**: near-total functional overlap with `reference/` and `native/` (by design), plus
  hosting of shared utilities that other areas now depend on (placement, svg-root, temporal).

### 3.5 `src/native/`
- **Does**:
  - `resolver.ts`: own structural walk, own inline fragment/window logic, own SVG attr parser,
    own placement math (`nativePlacement` — identical branch structure to blind's), own security
    classifier (`nativeSecurity` — always decides "render"; classification recorded as
    IMPLEMENTATION_GAP provenance because the `<img>` sandbox is platform behavior). Handles
    Models A/B/C; nested-canvas recursion mirrors reference/blind fill mapping.
  - `stage.ts`: `NativeStage` — HTML div overlays positioned in % of content box; SVG and raster
    bodies rendered as literal `<img>` elements (SVG-as-image semantics); TextualBody as text
    div; `overlaySvg` getter deliberately throws; `imgMetrics` probes natural sizes;
    `geometrySnapshot` returns element boxes/intrinsic/rendered sizes.
- **Consumed by**: `main.ts`; vitest `e14-comparison.test.ts`, `e16-comparison.test.ts`;
  e2e via the app.
- **Depends on**: `e14/types.ts` (shared record) and `blind/temporal.isActive` (the only
  cross-renderer runtime import found in a stage/resolver path).
- **Reuse**: resolver is browser-free in principle (pure functions + fetchers injected);
  `stage.ts` is DOM-bound.
- **Name fit**: good — "native" = delegates to the browser's native resource pipeline.
- **Overlap**: resolver duplicates the walk/fragment/placement responsibilities of the other two
  renderers (intentional); stage duplicates letterbox/snapshot scaffolding of `Stage`/`BlindStage`.

### 3.6 `src/e14/`
- **Does**: defines the renderer-neutral E14 record (`E14Manifest`/`E14Overlay`/`E14Placement`
  incl. `nested` maps, `security.decision`, `rules[]` with provenance vocabulary extended by
  `IMPLEMENTATION_GAP`/`VIEWER_GAP`) and the three-way pairwise comparator
  (`compareE14`) aligning overlays by `(startTime, zIndex)` and classifying divergences by rule
  provenance; plus a `userToCanvas` helper.
- **Consumed by**: all three renderers' E14 adapters (types only), `main.ts` (`compareE14`),
  vitest `e14-comparison.test.ts` / `e16-comparison.test.ts`.
- **Depends on**: nothing.
- **Name fit**: "e14" is an experiment number, but the area has become general shared
  infrastructure (its own header says so: "deliberately shared infrastructure … NOT renderer
  semantics").
- **Overlap**: classification taxonomy parallels `blind/comparison.ts#classifyDifference`
  (different vocabularies for similar purposes).

### 3.7 `src/e15/`
- **Does**: `analysis.ts` — named candidate interpretations (I-REGION-VIEWPORT,
  I-INTRINSIC-STRETCH, I-OBJECTFIT-CONTAIN, I-NATURAL-TOPLEFT, I-NATURAL-CENTERED) as pure
  map functions; variant/region registries; record types. `page.ts` — the matrix page
  (embedding mechanisms: svg-nested-attr, svg-nested-region, img-default/fill/contain/none,
  object, background).
- **Consumed by**: `page.ts` mounts via `/e15-lab.html`; `analysis.ts` consumed by
  `tests/e2e/e15.spec.ts`, `src/e17/page.ts`, `src/e17/classify.ts`.
- **Depends on**: nothing (pure); page fetches `/svg/e15/*` fixtures.
- **Name fit**: experiment number; contents are actually reusable measurement infrastructure.
- **Overlap**: `viewBoxFit` inside `analysis.ts` is a fourth copy of meet/slice placement math
  (analysis-only).

### 3.8 `src/e16/`
- **Does**: three pure functions for nested-canvas fit predictions. No page, no component.
- **Consumed by**: vitest `e16-comparison.test.ts`, `tests/e2e/e17.spec.ts`.
- **Depends on**: `e14/types.ts` (type-only).
- **Name fit**: experiment number; content is generic analysis math.
- **Overlap**: `fitMap(fill)` restates the nested-fill formula that also exists inline in all
  three renderers' nested-canvas recursions.

### 3.9 `src/e17/`
- **Does**: supplementary matrix page (copy of E15 cell construction for the xMaxYMax variant)
  and `classify.ts` — scoring lifted verbatim from `tests/e2e/e15.spec.ts` (per its header:
  "historical harness stays frozen") and parameterized over variants/regions/landmarks.
- **Consumed by**: `/e17-lab.html`; `tests/e2e/e17.spec.ts` (imports `makeClassifier`, `K`,
  plus `fitMap` from e16).
- **Depends on**: `e15/analysis.ts`, `pngjs` (Node dep inside a `src/` module).
- **Name fit**: experiment number.
- **Overlap**: page.ts duplicates most of e15/page.ts construction logic (~verbatim);
  classify.ts duplicates e15.spec's private scorer (documented).

### 3.10 `src/n6/`
- **Does**: deterministic, browser-free resource conformance validation:
  R-S1 viewBox presence (`svg.ts`), R-S3 canvas dims (`canvas.ts`), R-S4 same-aspect via exact
  BigInt cross-products with documented ε mode (`aspect.ts`), R-S5 uniform mapping tables
  (`mapping.ts`), strict fragment grammar with reported rejections (`fragments.ts`), declared
  exclusion-reliance heuristics (`exclusions.ts`), orchestration + canonicalized outputs +
  vocabulary self-audit (`validator.ts`), pre-registered suite T01–T15 (`suite.ts`).
  Explicit non-goals encoded in code: R-S2 emitted BLOCKED only; R-S8b OPEN_FENCE only; no fit
  parameter or z-order assertion in outputs (enforced by `auditOutputVocabulary`).
- **Consumed by**: `tests/n6-conformance.test.ts`, `scripts/run-n6-suite.mts`. Nothing else.
- **Depends on**: `blind/placement.computePlacement`, `blind/svg-root.readSvgRootAttrs`,
  `blind/types.SvgRootAttrs` — the validator reuses the blind renderer's pure placement/parser
  utilities rather than having its own copies.
- **Reuse**: fully reusable outside the repo (pure, injectable fetchers).
- **Name fit**: "n6" is a stage number; contents are a standalone validator library.
- **Overlap**: none functionally (strict producer-side grammar intentionally differs from the
  consumer parsers; documented in fragments.ts header).

---

## 4. Semantic operation map

Operations that actually exist, and where. Multiplicity is stated explicitly.

| Operation | Implementation site(s) | Notes |
|---|---|---|
| Manifest structural parsing (Canvas/AnnotationPage discovery, painting walk) | `blind/parser.ts` (`findCanvas`,`collectPaintingInputs`,`parseTarget`,`mergeFragments`,`isSvgBody`,`isVideoBody`); inline in `reference/lib/iiif.ts` (`motivationIsPainting`,`parseTarget`,`mergeFragments`,…); inline twice more in `native/resolver.ts` (`targetOf`,`fragmentOf`,`windowOf`, nested walk); fourth walk in `n6/validator.ts#validateInto` (`isPainting`,`asRecords`) | Four independent walks. Split responsibility: blind separates parse from resolve; reference/native interleave. |
| Target/selector resolution (source normalization W3C vs IIIF) | `blind/parser.parseTarget`; `reference/lib/iiif.parseTarget`; inline in `native/resolver.targetOf`; `n6/validator.checkTargetFragments` | Same acceptance rules observed (source / source.id / id). |
| Media-Fragment parsing (t=, xywh=, pct:/percent:/pixel:) | `blind/selectors.ts`; `reference/lib/selectors.ts`; inline in `native/resolver.ts`; strict reporting variant `n6/fragments.ts` | FOUR parsers. Divergences: blind drops out-of-bounds rects (MF §6.3.3) and `end<start`; reference performs no bounds check; native checks `x<w && y<h` only when canvas dims known; n6 accepts out-of-range by design (syntax-level). |
| Temporal selection (window resolution, activity predicate) | `blind/temporal.ts` (`resolveWindow`,`isActive`); `reference/lib/timing.ts` (`temporalWindow`,`isActiveAt`,`activeAt`); inline `native/resolver.windowOf` | Blind rejects bad ranges at parse time; reference coerces `end<start` to open-ended window. Native duplicates blind semantics inline. |
| Spatial selection (percent→pixel, bounds policy) | same four sites as fragment parsing | Percent split per axis in all four. |
| SVG root attribute parsing (viewBox/PAR/w/h) | `blind/svg-root.ts`; `reference/lib/svg.ts`; inline `native/resolver.readAttrs` | Three near-identical regex parsers (blind adds stricter number/unit handling). |
| SVG wrapper stripping (`svgInnerContent`) | `blind/svg-root.ts`; `reference/lib/svg.ts` | Verbatim-equivalent logic duplicated. |
| Placement / geometry mapping (viewBox+PAR meet/slice/none, no-viewBox 1:1) | `blind/placement.computePlacement` + `canvasPointOf`; `reference/lib/svg.computeNestedSvgPlacement` + `canvasPointOfSvgUserPoint`; `reference/lib/e14.refPlacement`; `native/nativePlacement`; analysis-only `e15/analysis.viewBoxFit`; consumer `n6` uses blind's `computePlacement` | The core semantic fork of the whole lab: reference synthesizes a viewBox when absent; blind/native treat no-viewBox as 1:1 (SVG-as-image). Implemented independently 4× in executable code + 1× in analysis. |
| Nested-canvas composition mapping (fill/contain) | inline in `reference/lib/e14.resolveNestedCanvas`, `blind/e14.resolveBlindNested`, `native/resolver.resolveNativeNested`; analysis `e16/comparison.fitMap` | Same linear-map formula in four places; only e16's is factored out. |
| Z-order / layer ordering | encounter-order counters inline in all resolvers (`paintIndex`/`z`); provenance helper `blind/layers.zProvenance` | There is NO separate layering engine; `blind/layers.collectPaintingAnnotations` exists but is uncalled. |
| Security classification (feature detection) | `blind/sanitize.classifySvg` (11 features, 4 blocking); `reference` has none at resolve time; `native/nativeSecurity` (classification-only, decision always "render"); render-time `reference/lib/sanitize.allowlistSanitizer` strips instead of classifying | Three postures: classify+sanitize+reject (blind), optional render-time strip (reference), classify-and-render-anyway (native). |
| Sanitization | `blind/sanitize.sanitizeSvg` (DOMParser or regex fallback; allowlisted tags/attrs/style); `reference/lib/sanitize.allowlistSanitizer` (DOMParser only; separate allowlists) | Two different allowlists exist (they differ, e.g. blind allows gradients/mask/pattern; reference allows marker-* attrs). |
| Composition/rendering (DOM) | `reference/renderers/dom.ts#Stage`; `blind/compositor.ts#BlindStage`; `native/stage.ts#NativeStage` | Shared conventions duplicated: letterbox `contentRect()` math ×3, applyAt/activeIds ×3, toCanvas/canvasToCss ×3; snapshots differ in shape (shapes[] vs shapes[] vs box/intrinsic/rendered). NativeStage uniquely renders real `<img>`/`<div>` elements and refuses `overlaySvg`. |
| Keyframe interpolation (non-standard) | `reference/renderers/dom.ts#keyframeOffset`; wiring in `main.ts` exp7 branch | Only Renderer-A path supports it. |
| Comparison (A vs B raw fields) | `experiments.sameOverlay` (used by `__lab.parity`) | Excludes ids by design. |
| Comparison (reference vs blind semantics) | `blind/comparison.compareSemantics` + `normalizeReference/normalizeBlind` + `classifyDifference` (used by `__lab.parityBlind`, `tests/blind-comparison.test.ts`) | Landmark-sampling approach; classification tags encode known disagreements. |
| Comparison (three-way E14 records) | `e14/comparison.compareE14` + `classifyDiff` (provenance-driven) | Used by `__lab.e14Compare` and vitest e14/e16 suites. |
| Classification of measured pixels vs predicted interpretations | `tests/e2e/e15.spec.ts` private copy; `e17/classify.ts` (parameterized copy) | Documented verbatim duplication. |
| Conformance validation (resource-side) | `n6/validator.ts` + per-rule modules; suite in `n6/suite.ts` | Distinct from rendering; consumes blind's placement/svg-root utilities. |
| Diagnostic generation (machine-readable) | `n6/types.Diagnostic` codes; `blind` rules/provenance arrays; `e14` diff records | Three diagnostic vocabularies. |
| Evidence writing | vitest suites + playwright specs + scripts (§8) | Tests are evidence producers, not only consumers. |

**Conceptual operations with NO distinct implementation responsibility** (recorded per brief):
- There is no single "selector resolution" service — it exists only embedded in each renderer's
  walk (or the validator's).
- There is no "painting-body resolution" module distinct from the resolvers.
- There is no z-order engine; ordering is an accident of loop position in each resolver.
- "Resource conformance validation" exists only in `n6/`; nothing in the renderers validates
  resources for conformance.

---

## 5. Architectural boundaries

| Boundary | Real or historical? | Evidence |
|---|---|---|
| `reference` ↔ `blind` ↔ `native` as three resolvers | REAL (deliberate independence) | Zero cross-imports among the three resolver paths except `native/stage → blind/temporal.isActive`; each has its own parser/placement/security code; headers document the intent; comparison harnesses exist precisely because they are independent. |
| resolver ↔ compositor (semantic vs DOM) within each renderer | REAL | Each renderer splits into a fetchable/pure-ish resolver and a DOM stage; blind's resolver is exercised in Node tests without DOM (regex-sanitize fallback), stages only in browser. |
| renderer semantics ↔ comparison harnesses | REAL, but boundaries leak in placement | `blind/comparison.ts` and `e14/*` declare themselves infrastructure; however `blind/comparison` must import reference placement to compare like-for-like, and `n6` imports blind placement. The "pure utility" layer (`placement`, `svg-root`, `temporal`, `selectors`) is de-facto shared infrastructure even though it lives inside renderer directories. |
| `src/e14` (shared record + comparator) | REAL boundary, HISTORICAL name | Types consumed by all three renderers; comparator consumed by app + tests. Named after an experiment. |
| `src/e15`, `src/e17` (measurement pages + prediction/classification libs) | REAL roles; page/lib split is clean; numbering historical | `analysis.ts` is imported by tests and e17; pages mount via dedicated HTML files under `public/`. |
| `src/e16` | WEAK boundary | Three pure functions; could be analysis infra like e15/analysis; exists only as an experiment-numbered island. Observation, not a recommendation. |
| `src/n6` ↔ renderers | MOSTLY REAL, one utility-level coupling | N6 is browser-free, consumer-free; but depends on `blind/placement` + `blind/svg-root` (see §9 findings). |
| App shell (`main.ts`/`experiments.ts`) vs everything else | REAL | All automation flows through `__lab`; no renderer imports app code. |
| Legacy experiments 1–7 (manifests `exp*.json`, specs `expN.spec.ts`, `experiments.ts` oracle) | HISTORICAL era, still fully live | These flows run through the same current resolvers/stages; not dead code. |

---

## 6. Duplication and overlap

(Inventory only — no recommendations.)

1. **`asArray` helper**: local copies in `blind/parser.ts`, `blind/e14.ts`, `native/resolver.ts`,
   `reference/lib/iiif.ts`, `n6/validator.ts` (+ `asRecords`), while a shared
   `reference/lib/asArray.ts` exists and is used only by `reference/lib/e14.ts`.
2. **Media-Fragment parsers ×4** with measurably different edge-case policies (bounds checking,
   `end<start`, error dropping vs reporting) — blind vs reference divergence is classified by
   `blind/comparison.classifyDifference` as `difference:spatial-fragment-validation`.
3. **SVG root-attr parsers ×3** (+ landmarks of the same grammar in `n6/svg.ts` usage of blind's).
4. **ViewBox/PAR placement math ×4 executable copies + 1 analysis copy**; the no-viewBox branch
   differs intentionally between reference (synthesize) and blind/native (1:1).
5. **Nested-canvas fill mapping inline ×3 + factored `e16.fitMap`**.
6. **Letterbox/contentRect + coordinate conversion scaffolding ×3 stages** (near-identical).
7. **Temporal window logic ×3** (two shared modules + one inline).
8. **Security handling ×3 postures** with two different allowlists (blind vs reference).
9. **E15 scoring math**: private copy in `tests/e2e/e15.spec.ts` and parameterized copy in
   `src/e17/classify.ts` — duplication is explicit and deliberate (frozen-harness policy).
10. **E15 vs E17 matrix pages**: `src/e17/page.ts` reproduces `src/e15/page.ts` construction
    nearly verbatim (self-documented: "mirrors … verbatim so one classifier can score both").
11. **Three diff/classification vocabularies** for overlapping purposes:
    `sameOverlay` (field strings), `compareSemantics` verdict/classification tags, `compareE14`
    provenance-classified diffs.
12. **Painting-walk + motivation/body classification ×4** (three renderers + n6 validator).
13. **Renderer-A dual identity**: `resolveManifest` (generic path) vs `resolveE14Manifest`
    (E14 path) re-implement the same lowering twice within `reference/` itself; similarly blind
    has `resolveBlindManifest` vs `resolveBlindE14Manifest`; native exists only in E14 form.

---

## 7. Historical residue

All observations; none touched.

- **Experiment-numbered directories/modules in executable code**: `src/e14`, `e15`, `e16`,
  `e17`, `n6` (n6 = stage number for a general validator); `src/*/e14.ts` adapters;
  `tests/e2e/e14–e17.spec.ts`, `exp1–7.spec.ts`; `MANIFEST_MAP["6"] = "exp1.json"` alias
  (experiment 6 reuses experiment 1 content, aspect being the variable).
- **Renderer-letter terminology**: `RendererKind = "a" | "b"` in `reference/lib/types.ts`;
  `?renderer=a|b|blind|native`; comments referring to "Renderer A"/"Renderer B" throughout;
  package name still `video-annotation-interoperability-lab` while the repo directory is
  `video-annotation-blind-lab`.
- **Unused / weakly connected code (verified by search)**:
  - `src/blind/index.ts` barrel — no importer found anywhere in `src/`, `tests/`, `scripts/`.
  - `blind/layers.collectPaintingAnnotations` + `Encounter` — exported, never called.
  - `reference/lib/timing.activeAt` — exported, never called outside its module.
  - `e14/types.BodyKind` value `"video"` — never assigned (video bodies become `videoUrl`
    instead of an overlay).
  - `reference/lib/asArray.ts` — used by exactly one importer while five local copies exist.
- **Compatibility-shim-like bridges**: `main.ts#e14ToResolvedA` / `e14ToBlindOverlay` exist only
  to feed old-model stages from E14 records, including a placement-mode remap
  (`nested-canvas|image-contain → no-viewBox-1to1`).
- **Non-standard experimental extension kept in tree**: exp7 keyframes
  (`Keyframe` type marked EXPERIMENTAL/NON-STANDARD, `exp7-keyframes.json` sidecar,
  `7-animate` special-casing in main.ts renderer parsing).
- **Config-era residue**: two extra playwright configs (`n2`, `e17`) created to avoid touching
  the main suite (their headers say so); the main config does not exclude their specs, so the
  isolation works only in the pinned direction (see §9).
- **Naming breadth drift**: `blind/comparison.ts` is not blind-renderer semantics (its own
  header says so); `e14/*` is shared infrastructure under an experiment name;
  `experiments.ts` is a renderer-B oracle rather than experiment plumbing generally.
- **Dead-at-runtime probe paths**: `__lab.overlayRect` / `domProbe` use `stage.overlaySvg`,
  which throws on `NativeStage` (main.ts:354–379 vs native/stage.ts:169–171); `__lab.snapshot()`
  returns a different record shape under native (`NativeElementSnap`) than the
  `SnapshotEntry` type declared in `tests/e2e/utils.ts`.

---

## 8. Test/script/source relationships

Established relationships only (imports / URLs / file paths read from code).

### Fixture generation (scripts → `public/`)
| Script | Outputs | Consumed by |
|---|---|---|
| `build-fixtures.mjs` | `public/svg/exp*/case*/security/text*`, `public/manifests/exp*.json`, `case*.json` (incl. `exp7-keyframes.json` non-standard) | app regular-exp branch; `blind-comparison.test.ts`; `iiif.test.ts` (inline manifests mostly) |
| `build-e14-fixtures.mjs` | `public/svg/e14/*` (incl. PNG generated via pngjs), `public/manifests/e14/e14-caseNN-{a,b,c}.json` + `inner-overlay.json` | app e14 branch; e14.spec; e14/e16 vitest comparisons |
| `build-e15-fixtures.mjs` | `public/svg/e15/*.svg` + `e15-landmarks.json`, `public/manifests/e15/e15-manifest.json` | e15 page/spec; reused by `build-n2-fixtures.mjs` |
| `build-e16-fixtures.mjs` | `public/svg/e16/*` + landmarks; inner manifests; `e16-case*-b.json` + `-a.json` twins | app e16 branch; e16.spec; e17.spec; e16-comparison.test.ts; n6 suite patterns |
| `build-e17-fixtures.mjs` | `public/svg/e17/e17-vb1000-max.svg` + landmarks | e17 page/spec |
| `build-n2-fixtures.mjs` | `public/manifests/n2/*.json` (reusing e15/e14 assets; nested probe reuses e16 case03-a unchanged) | n2-viewer.spec |
| `generate-video.mjs` | `public/video/test-grid-1920x1080-30s.mp4` (external ffmpeg dependency) | every stage's video |

OBSERVED: only `gen:fixtures` (root builder) and `gen:video` have npm scripts; the e14–e17/n2
builders are manual `node` invocations.

### Source → unit/vitest tests
| Source | Test |
|---|---|
| `reference/lib/timing.ts` | `tests/timing.test.ts` |
| `reference/lib/selectors.ts` | `tests/selectors.test.ts` |
| `reference/lib/svg.ts` | `tests/svg.test.ts` |
| `reference/lib/iiif.ts` + `rendererB.ts` | `tests/iiif.test.ts` |
| `blind/*` (selectors, temporal, svg-root, placement, resolver, sanitize) | `tests/blind.test.ts` |
| `reference/lib/iiif.ts` + `blind/resolver.ts` + `blind/comparison.ts` (+ `public/manifests/case*.json`, `public/svg/*` read from disk) | `tests/blind-comparison.test.ts` → **writes** `evidence/blind-comparison/*` |
| `reference/lib/e14.ts` + `blind/e14.ts` + `native/resolver.ts` + `e14/comparison.ts` (+ `public/manifests/e14/*`) | `tests/e14-comparison.test.ts` → **writes** `evidence/e14/*` |
| same + `e16/comparison.ts` (+ `public/manifests/e16/*`) | `tests/e16-comparison.test.ts` → **writes** `evidence/e16/*` |
| `n6/suite.ts` (whole validator stack) | `tests/n6-conformance.test.ts` |

OBSERVED: three vitest suites are simultaneously assertions and evidence generators; evidence
under `evidence/{blind-comparison,e14,e16}` is regenerated as a side effect of `pnpm test`.

### Source → e2e (Playwright)
- Default config drives the app via `gotoLab` (`/?exp=…&renderer=…`): exp1–7, text, security,
  parity, blind, e14, e16 specs. Specs assert through `__lab` and write screenshots/observations
  (`utils.shot/record` → `evidence/screenshots/**`, `evidence/observations/*.json`).
- `e15.spec.ts` opens `/e15-lab.html`, measures cells pixel-wise, imports
  `src/e15/analysis.ts` predictions, writes `evidence/e15/*` (summary, geometry-matrix,
  intrinsics, per-case JSON, screenshots).
- `e17.spec.ts` (dedicated config, 3 engines) imports `src/e17/classify.ts` +
  `src/e16/comparison.fitMap`, measures selected cells from BOTH `/e15-lab.html` and
  `/e17-lab.html`, writes `evidence/e17/*` incl. per-engine screenshots.
- `scripts/e17-aggregate.mjs` post-processes `evidence/e17/screenshots/<engine>` into
  `cross-engine-matrix.json` + `summary.json` (reads screenshots produced by the spec).
- `viewer.spec.ts` + `n2-viewer.spec.ts` drive the unpkg-bundle pages against
  `public/manifests/*` and write `evidence/viewer/*`, `evidence/viewer-matrix.json`,
  `evidence/screenshots/{viewer,n2}`.
- `blind.spec.ts` exercises the blind path end-to-end (parity via `parityBlind`, unsafe-rejection
  marker, viewBox emission policy, aspect tracking) and records observations/screenshots.

### Independence checks requested by the brief
- **Historical experiments still exercised?** Yes — exp1–7 specs run the CURRENT
  resolvers/stages via the live app; they are regression suites for present code, not frozen
  demos. Their *oracle* (`experiments.ts`) is historical in shape.
- **Is N6 independent from rendering code?** Functionally yes (browser-free, no stage/DOM
  imports; injectable fetchers). Structurally it imports two utilities from `src/blind/`
  (placement math + svg-root parser). So "independent of rendering" holds; "independent of
  renderer directories" does not.
- **Evidence from current source?** Mixed but traceable: `evidence/n6` ← script ← current
  validator; `evidence/{blind-comparison,e14,e16}` ← vitest ← current resolvers;
  `evidence/e15,e17,viewer,observations,screenshots` ← playwright ← current app/pages.
  No evidence pipeline references removed/historical code paths (nothing else exists to
  reference).

---

## 9. Findings

### OBSERVED
1. Three independent renderer stacks exist (reference, blind, native) with independent
   parsers/placement/security; the only cross-renderer runtime import in resolver/stage paths is
   `native/stage.ts` importing `blind/temporal.isActive`.
2. `src/n6/validator.ts` imports `computePlacement` from `src/blind/placement.ts` and
   `readSvgRootAttrs` from `src/blind/svg-root.ts` (plus the `SvgRootAttrs` type).
3. Four media-fragment parsers and three SVG-root parsers exist with differing edge policies
   (detailed §4/§6).
4. Reference placement synthesizes a viewBox when the body lacks one; blind and native do not —
   implemented independently in each resolver and mirrored by the DOM stages (blind emits
   viewBox only when declared; Stage always emits one via `computeNestedSvgPlacement`).
5. `blind/index.ts`, `blind/layers.collectPaintingAnnotations`,
   `reference/lib/timing.activeAt`, and `BodyKind "video"` have no consumers/call sites.
6. Vitest suites `blind-comparison`, `e14-comparison`, `e16-comparison` write JSON files under
   `evidence/` when run; `pnpm test` therefore regenerates those evidence trees.
7. `playwright.config.ts` (default) has no `testMatch`/`exclude`; the e17 and n2 configs pin
   their own specs but nothing prevents the default run from executing `e17.spec.ts` and
   `n2-viewer.spec.ts` under a single chromium project.
8. Only the root fixture builder and video generator are wired to npm scripts; the
   experiment-specific fixture builders are not.
9. `__lab.overlayRect`/`domProbe` would throw under `renderer=native`
   (`NativeStage.overlaySvg` throws by design); `__lab.snapshot()` changes return shape under
   native. Current e14/e16/e17 specs do not call these two helpers on the native path
   (`imgMetrics`/direct DOM queries are used instead) — verified by searching spec sources for
   `overlayRect(`/`domProbe(` usage: none under native renderer tests.
10. Sanitization differs structurally: reference sanitizes at render time via an injectable
    hook; blind sanitizes/classifies at resolve time and renders explicit rejection markers;
    native classifies but always renders via the `<img>` sandbox, recording the decision as
    `IMPLEMENTATION_GAP` provenance.
11. The e15 scoring constants/logic exist in two copies (spec-private and `e17/classify.ts`),
    and the e17 page duplicates e15 page cell construction — both duplications are stated in
    the code's own comments as deliberate freezing/mirroring.
12. `research/terminology-specification.md` carried uncommitted working-tree modifications for
    the duration of this audit (ID-ownership wording, safe-subset vocabulary retirement,
    harness demotion, governance-pointer conversion); recorded as repository state at audit
    time and committed separately afterwards; not audited further.

### INFERRED
1. The de-facto architecture is layered as: **app shell → renderer stacks → shared-record &
   comparison layer (e14/e15/e16/e17-analysis) → validator (n6)**, with a hidden fifth layer of
   "pure utilities" (`placement`, `svg-root`, `temporal`, selectors) that lives inside renderer
   directories but is effectively common infrastructure (n6's imports make this visible).
2. The directory names `blind`/`native` describe provenance/method (how each was written and
   what mechanism it delegates to), while `reference` conflates two roles (implementation and
   oracle). None of the three names describes a stable architectural role.
3. `e14`'s shared record has become the repository's interchange format; `main.ts`'s bridge
   functions exist because the legacy (pre-E14) models are still the app's primary path.
4. The lab is designed so that disagreement is data (rules/provenance arrays, classification
   tags, fences) rather than something to be normalized away; duplication of parsers/math is a
   consequence of that design, not accidental copy-paste in most cases (exceptions: `asArray`,
   `contentRect`, page-construction duplication look like plain copying).
5. Historical experiments 1–7 remain meaningful regression coverage for current code; removing
   anything under them would change present-day verification, not just archive.

### OPEN QUESTION
1. Is `blind/index.ts` intended as a future public API surface (currently unconsumed), or is it
   leftover from an earlier integration plan?
2. Should the default Playwright config exclude the pinned e17/n2 specs (or should those specs
   be treated as also-running-under-chromium by design)? Current behavior is double-run under
   `pnpm test:e2e` (chromium project + dedicated configs when invoked separately).
3. Are the unused exports (`collectPaintingAnnotations`, `activeAt`, `"video"` kind) vestigial,
   or reserved for upcoming stages?
4. What is the intended long-term home of the "pure utility" modules — renderer-private (status
   quo, with cross-area imports like n6→blind) or an explicitly shared layer?
5. `tmp.txt` appeared in the root directory listing at the start of this audit session and no
   longer exists at the time of writing (untracked, transient?). No source relationship; noted
   only for completeness.

### POSSIBLE ISSUE
1. `__lab.overlayRect`/`domProbe` throwing under the native renderer suggests the `LabApi`
   contract is not uniform across stages; harmless today (specs avoid those calls on native)
   but a latent trap for future specs.
2. The dual shape of `__lab.snapshot()` (OverlaySnap vs NativeElementSnap) is typed loosely
   (`ReturnType<Stage["geometrySnapshot"]>` in `LabApi`) — a type-level mismatch with the
   native runtime shape.
3. Evidence regeneration as a side effect of `pnpm test` means protected artifacts mutate
   during ordinary test runs (timestamps/content may differ per run); whether that is acceptable
   under the evidence policy is a policy question, not a code defect established here.
4. `reference/lib/timing.temporalWindow` silently converts `end < start` into an open-ended
   window while blind treats the same input as a dropped fragment — a behavioral divergence
   that the blind-vs-reference comparator will tag, but the A-vs-B `sameOverlay` path cannot
   (it compares resolved windows only). Flagged as a suspicious asymmetry worth Phase H
   attention, not claimed as a bug.
5. `native/resolver.resolveNativeNested` inner-target fragment parsing accepts only
   `xywh=(percent:)?…` via one regex (no `pixel:` prefix, no combined `t=`), narrower than its
   own outer parser — inconsistent strictness inside one module (observation; impact unknown).

---

## 10. Phase H implications (questions only — no proposals)

A future concept ↔ code reconciliation must answer:

1. Which vocabulary should name the three resolver stacks, given that "reference" carries two
   roles (implementation vs oracle) and "blind"/"native" describe method/mechanism?
2. Is the hidden utility layer (`blind/placement`, `blind/svg-root`, `blind/temporal`,
   selectors) to be acknowledged as shared infrastructure — and if so, does n6's dependence on
   `blind/*` remain acceptable, or does the concept model place the validator outside the
   renderer namespace?
3. Do the four media-fragment parsers represent four concepts (consumer-lenient,
   consumer-reference, consumer-native, producer-strict), or one concept with parameterizable
   strictness? Same question for placement math (synthesize-viewBox vs SVG-as-image vs
   analysis-predictions) and for the three security postures.
4. What is the conceptual status of the comparison/diagnostic layer(s): one activity
   ("compare implementations") with three vocabularies, or three distinct activities?
5. Which experiment-numbered containers are concept-permanent (e.g., e14 as interchange
   format, e15 analysis as prediction engine) versus era-named homes for general code?
6. What happens to the legacy exp1–7 model path (ResolvedOverlay/RendererKind/expRefs oracle)
   if the concept model standardizes on the E14 record — do the bridge functions in `main.ts`
   become the concept boundary, or does the legacy model remain first-class?
7. How should the concept model treat evidence-producing tests (vitest suites that write
   evidence) — as pipelines, as tests, or both?
8. Does the unused public surface (`blind/index.ts`, stray exports) belong to the concept
   model's notion of a "renderer package boundary", or is it residue?
9. Where do the non-standard extensions (exp7 keyframes; `7-animate`) sit in the concept model
   — out of scope, or named experimental capabilities?
10. Which naming decisions require migration (directory/module renames, renderer-letter
    terminology, `?renderer=` protocol values baked into specs and `LabApi`) versus which are
    documentation-only — noting that `?renderer=` values and evidence filenames are
    externally observable contracts of the current test corpus.

---

*End of inventory. No files were modified; no cleanup proposed.*
