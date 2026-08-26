# Phase G — Independent `/src` Terminology & Namespace Audit

> **AUDIT ARTIFACT — OBSERVATION ONLY. NOTHING RENAMED, MIGRATED, OR RESOLVED.**
> This report independently inspects the living `/src` tree and reconciles it against
> `terminology-migration-inventory.md`. It renames nothing, edits no source/test/config/
> evidence/fixture/documentation file, and adds no glossary terms. Baseline: HEAD
> `fb3c140` (which only TRACKED the pre-existing untracked inventory file at explicit
> human instruction before this audit was written; content untouched). All path
> citations are OBSERVED at this baseline via static inspection only (file reads,
> greps, `git status`/`git log`). No tests were run; no build was run; no evidence
> was regenerated.
>
> Naming note: a prior record `phase-g1-source-architecture-inventory.md` already uses
> the G series. The filename below follows this task's own designation ("Phase G");
> renumbering it relative to G.1 is a process-local choice left to humans.

Governing documents read and unmodified: `AGENTS.md`, `research/terminology-specification.md`,
`research/terminology-migration-inventory.md`, `research/terminology.md`,
`research/documentation-conventions.md`, `research/current-state-index.md`,
`research/consolidation-map.md`, `research/cleanup-checklist.md`.

---

## 1. Executive conclusion

1. **The living `/src` tree is architecturally coherent and decomposes into eight
   evidenced strata**: renderer-neutral/profile-defined primitives (`src/primitives/`);
   the composition-domain **interchange record** plus renderer-agreement comparison
   machinery (`src/e14/`); three methodologically independent consumer implementations
   (`src/reference/`, `src/blind/`, `src/native/`); the Renderer B oracle
   (`src/oracle/`); the blind-vs-reference semantic-diff harness (`src/comparison/`);
   the validator/conformance stack (`src/n6/`); three generation-named analysis and
   measurement namespaces whose code is **living, cross-imported infrastructure**, not
   frozen reproducibility apparatus (`src/e15/`, `src/e16/`, `src/e17/`); and the lab
   composition root with its ratified permanent harness-tier bridges (`src/main.ts`).

2. **The generation-numbered directories are NOT merely historical experiment
   harnesses.** `src/e14/types.ts` is the H.2-D-ratified interchange tier consumed by
   all three renderers and by e16; `src/e17/classify.ts` imports `src/e15/analysis.ts`
   as reusable embedding-semantics infrastructure exactly as its header states;
   `src/e16/comparison.ts` consumes the living interchange tier. The consolidation-map
   §1.4 phrase "frozen surfaces" for `src/e14…e17/` predates the H.2 ratifications and
   no longer describes these trees' actual dependency roles.

3. **No TypeScript type or function NAME crosses any machine boundary.** A full-tree
   grep of `evidence/` (353 archived JSON artifacts) finds zero occurrences of
   `E14Model`, `E14Overlay`, `E14Manifest`, `E15Embedding`, `resolveE14Manifest`,
   `compareE14`, or bridge function names as strings, schema keys, or values.
   Evidence carries only VALUES: model letters `"A"/"B"/"C"`, verdict strings
   `"a==blind"`, placement-mode strings, Provenance labels, diagnostic codes,
   `I-*` interpretation labels, fixture coordinates, and validator identity strings.
   Internal type/function names are therefore behavior-safe to rename in an atomic
   change-set, subject to the specific couplings recorded in §4.

4. **Retired generation tokens DO live on inside protected machine surfaces — as
   VALUES and KEYS, not type names**: `VALIDATOR_VERSION = "n6-resource-validator@1.0.0"`
   (serialized into every `evidence/n6/*.json`), suite fixture ids `n6-t01…n6-t15`
   (serialized into `evidence/n6/case-T*.json`), URL parameters `?exp=e14-caseNN|e16-caseNN`,
   browser-global keys `window.__lab.e14Resolved/.e14Compare` (consumed by three e2e
   specs), `__e15`/`__e17` lab APIs, `.e15-box`/`.e15-row`/`#e15-probes`/`#e17-probes`
   CSS/id hooks, the `e15-ready`/`lab-ready` events, routes `/e15-lab.html`,
   `/e17-lab.html`, fixture/evidence filename grammars, and Playwright
   `testMatch`/`outputDir` couplings. These are frozen grammars or N-26 implementation
   detail; none is proposed for renaming here.

5. **Inventory reconciliation outcome (summary)**: all five challenged proposals are
   directionally sound — `n6→validator`, `e15→embedding-semantics`, `e16→nested-composition`,
   `e17→cross-engine` CONFIRMED (two with qualification); `e14→composition` is
   CONFIRMED WITH QUALIFICATION because that directory holds TWO distinct roles
   (interchange data model vs agreement-comparison machinery) and only one of them is
   "composition". No proposal was REJECTED. The clean-namespace row
   (`reference/blind/native/primitives/comparison/oracle`) is independently CONFIRMED.
   Open policy questions (G.1–G.7 of the inventory) remain NOT AUDITABLE YET where they
   require human decisions; this audit supplies the missing factual basis for G.1/G.3.

6. **Three vocabulary gaps are demonstrated by this audit** (§6): the H.2-D
   interchange/display tier names, the H.2-A reuse-governance tiers, and the
   infrastructure-vs-consumer / protected-surface / evidence-producing-test role words.
   Each blocks precise description of a real source boundary during any migration.

---

## 2. Namespace audit table

Roles use the task brief's vocabulary. "Living" = actively imported/executable current
implementation; "historical/reproducibility" = exists primarily to reproduce archived
results. Confidence: HIGH = directly evidenced by reads + import graph; MEDIUM =
inference from headers/comments.

| Current path | Observed responsibility | Architectural role | Living vs historical/reproducibility | Important dependencies | Machine-facing exposure | Terminology assessment | Migration recommendation | Confidence |
|---|---|---|---|---|---|---|---|---|
| `src/main.ts` | Lab composition root: URL routing (`?exp/renderer/sanitize/fit/aspect/t`), manifest loading, resolves all renderers, drives stage selection, HUD, `lab-ready`; hosts the two PERMANENT harness-tier bridges `e14ToResolvedA` / `e14ToBlindOverlay` (H.2-D §3.5 lossiness documented) and defines the `window.__lab` API incl. `e14Resolved`/`e14Compare` keys | Harness / composition root (spec §5.7 "below term level"); bridges are compatibility-tier plumbing between interchange record and display models | Living | Imports ALL consumers (`reference`, `blind`, `native`), `oracle`, `comparison`, `e14/{types,comparison}`; indirectly primitives | URL params; `MANIFEST_MAP` route keys; `exp${exp}.json` construction; `__lab.*` keys (consumed by e2e specs); HUD text; event name | Name is conventional entry-point naming; carries retired tokens only as protected values/routes | Keep name; no rename proposed; document as harness root if migration prose needs it | HIGH |
| `src/reference/lib/*` + `src/reference/renderers/dom.ts` | Renderer A library: standards-driven resolver `iiif.ts::resolveManifest` + SECOND resolution entry point `lib/e14.ts::resolveE14Manifest` (E14/E16 surface), shared parsing core, timing/selectors/sanitize/svg placement helpers, legacy DOM `Stage` (H.2-D "legacy display-regression substrate" tier member) | Consumer implementation (Renderer A per §5.7); two entry points never merged (consolidation-map D7) | Living | `primitives/svg-root`, `primitives/region-as-viewport-placement`; `e14/types` (interchange input) | None directly (library; surfaced via main.ts) | Accurate: glossary "Renderer A"; consolidation-map cites both entry points | Keep (inventory "clean" row CONFIRMED) | HIGH |
| `src/blind/*` | Blind Renderer consumer: own parser/placement/temporal/layers/sanitize/types + `resolver.ts::resolveBlindManifest` + `compositor.ts` BlindStage + second entry `e14.ts::resolveBlindE14Manifest` | Consumer implementation (Blind Renderer §5.7); methodological blinding boundary | Living | `primitives/*` (sanctioned pure helpers); `e14/types` (interchange input); never imports `reference` resolution logic (verified imports) | None directly | Canonical role name (T-1 axis word rule) | Keep | HIGH |
| `src/native/*` | Native Renderer consumer: `<img>`-pipeline DOM stage (`stage.ts`: NativeStage, imgMetrics snapshots) + resolver producing predicted SVG-as-image placements from the E14 packet reading | Consumer implementation (Native Renderer §5.7 reserved sense) | Living | `primitives/temporal`, `primitives/svg-root`, `primitives/region-as-viewport-placement`; `e14/types` | None directly | Reserved sense of "native" respected (documentation-conventions T-2) | Keep | HIGH |
| `src/primitives/svg-root.ts`, `temporal.ts` | Renderer-neutral primitives: SVG root attr parsing; half-open temporal predicate. Policy-free, dependency-free, Node+browser safe (headers + H.2-A record) | Shared primitive — H.2-A governance TIER 1 | Living shared infra | None | None | Names descriptive and accurate | Keep | HIGH |
| `src/primitives/region-as-viewport-placement.ts` | ONE NAMED READING of SVG-body placement (region-as-viewport, R-S2 assignment) explicitly labeled profile-defined; documents why sharing does not collapse consumers' divergent readings | Explicitly labeled profile-defined reading — H.2-A governance TIER 2 | Living shared infra | `svg-root` types | None | Header self-describes precisely; glossary has "Region-as-viewport" concept | Keep | HIGH |
| `src/oracle/rendererB.ts` | Renderer B direct-reference lowering of oracle overlay data into `ResolvedOverlay` (no standards resolution) | Renderer B oracle — infrastructure, NOT a consumer (H.2-B; header restates) | Living | `oracle/experiments` data; `primitives/svg-root`; `reference/lib/types` | None | Glossary "Renderer B" matches | Keep | HIGH |
| `src/oracle/experiments.ts` | Initial-cycle reference overlays per `?exp=N` (switch over exp ids), VIDEO constant, `sameOverlay` L1 parity comparator embedded per H.1 §6 | Experiment reference-data + parity comparator; explicitly not counted as consumer in agreement claims | Living (serves initial-cycle reproduction harness) | `reference/lib/types` | Exp switch keys are URL-param VALUES (`?exp=1..7`); fixture paths `/svg/exp*.svg` | Name semantic ("experiments" data for the oracle); contains era fixtures by design | Keep (inventory "clean" row) | HIGH |
| `src/comparison/blind-comparison.ts` | Semantic diff harness lowering BOTH blind and reference outputs into a common semantic-overlay record; verdict/classification/diff output | Analysis-only comparison infrastructure (H.2-B home; header forbids feeding reference logic into blind) | Living | `reference/lib/types` + `reference/lib/svg` placement predictors (allowed for comparison), `blind/types`, `blind/placement` | Verdict/classification strings flow into evidence via `tests/blind-comparison.test.ts` (evidence writer #1 of the three Vitest side-effect suites) | Accurate ("comparison"); historical era coordinate documented in header (N-06) | Keep | HIGH |
| `src/n6/types.ts` | Output vocabulary definition site: `RequirementId` (R-S1…R-S8b values), `DiagnosticStatus` (PASS/FAIL/BLOCKED/OPEN_FENCE), 20 `DiagnosticCode` values, Diagnostic/MappingRecord/RegionViewportPrediction/FenceRecord/ConformanceReport shapes | Validator DATA MODEL + owned machine output vocabulary (spec §8 owner) | Living | — (leaf types module) | Every union VALUE serializes into `evidence/n6/*`; field names of `ConformanceReport` are the report's machine contract | Generation prefix in header comment only; content is concept-owned vocabulary | Migrate PATH with directory (values untouched); spec Appendix currently names this file as vocabulary owner — update pointer when/if renamed (mapping-first) | HIGH |
| `src/n6/validator.ts` | Orchestration: validates manifests incl. nested Canvas recursion; emits diagnostics/mappings/predictions/fences; canonicalization (order-neutrality T08); `validateReplacement`; R-S2 BLOCKED + R-S8b fence emission; `auditOutputVocabulary` meta-check (T10) | Validator implementation (glossary C3 "Validator") | Living | n6 siblings (aspect/canvas/exclusions/fragments/mapping/svg/types); `primitives/region-as-viewport-placement`, `primitives/svg-root` | `VALIDATOR_VERSION = "n6-resource-validator@1.0.0"` serialized into evidence; report field names | Semantically the Validator; "N6" header is era citation | CONFIRMED candidate → validator namespace; keep version string value verbatim | HIGH |
| `src/n6/suite.ts` | Execution encoding of pre-registered conformance cases T01–T15 (conformance-matrix Part B); inline deterministic fixtures; `runSuite()`; AMB-N6-1 note verbatim in T12 | Test-suite machinery of the conformance stack (stage 3 of edit flow) | Living | validator/mapping/fragments/types | Case ids `T01–T15` (live space); fixture manifestIds `n6-t01…` + derived canvas/annotation ids serialize into evidence | Suite belongs to the same conformance chain as the validator; "single source of truth" phrasing already flagged imprecise by consolidation-map §2.1 note | Move WITH the validator directory in one change-set (imports from `tests/n6-conformance.test.ts` + `scripts/run-n6-suite.mts` follow atomically); do NOT split suite from validator casually | HIGH |
| `src/n6/aspect.ts`, `canvas.ts`, `exclusions.ts`, `fragments.ts`, `mapping.ts`, `svg.ts` | Requirement predicates: R-S4 same-aspect (+ε decision), R-S3 dimensions, R-S7 declared-exclusion heuristic, R-S6a/R-S6b/R-S8a strict MF parser, R-S5 uniform-scale mapping, R-S1 viewBox check | Validator implementation modules (one requirement family each) | Living | types; svg/aspect also `primitives/svg-root` | Emitted values only | Clean internal decomposition by requirement; no mixed responsibilities found here | Follow directory rename | HIGH |
| `src/e14/types.ts` | Interchange record data model: `E14Model` "A"/"B"/"C", `RendererName`, Provenance superset (taxonomy B + deployment gaps), Rect/SvgBox/SvgAttrs/Placement(+Mode)/NestedMap/Security, `BodyKind` (incl. retained `"video"` per H.2-C/D), `E14Rule`, `E14Overlay`, `E14CanvasInfo`, `E14Manifest` | Composition/interchange representation — H.2-D ratified INTERCHANGE TIER ("deliberately shared infrastructure … NOT renderer semantics", header) | Living shared representation | — (leaf types module) | Model letter VALUES, mode strings, BodyKind values serialize into evidence diffs/records | Subject matter IS the composition-model domain (glossary C1.a "Composition model"); but see comparison.ts row | CONFIRMED target domain "composition"; QUALIFICATION: directory also hosts comparison machinery (next row) — execution must name both roles honestly (split targets or umbrella name) | HIGH |
| `src/e14/comparison.ts` | Pairwise renderer-agreement comparison over interchange records (`compareE14`, `compareManifestPair`, `classifyDiff`, provenance rollup, `userToCanvas`); emits verdict strings | Comparison/agreement machinery (renderer-agreement check; N-06 concept-type) — analysis infrastructure, not composition semantics | Living | `e14/types` | Verdict strings `"a==blind"` etc. serialize; consumed via `__lab.e14Compare()` by main.ts AND three e2e specs; unit tests write `evidence/e14/` | Concept is NOT "composition"; inventory's single-target `src/composition/` covers only the types half | CONFIRMED WITH QUALIFICATION (see above) | HIGH |
| `src/e15/analysis.ts` | Embedding-semantics analysis model: `E15Embedding` union (8 channels), landmarks contract shape, variant table, `E15Map`, five named candidate interpretations (`iRegionViewport`…) + `INTERPRETATIONS_BY_EMBEDDING` legality matrix + `INTERPRETATION_NAMES` mapping fn-name→frozen `I-*` label; REGIONS/CANVAS constants | Embedding-semantics ANALYSIS INFRASTRUCTURE (header: "not renderer semantics"; "No renderer imports these predictions" — verified) | Living; reused across generations | None (leaf); imported by `e17/classify.ts`, `e17/page.ts` | `I-*` label VALUES serialize (frozen evidence vocabulary §8); variant/region key strings are fixture coordinates | Concept = embedding-semantics experiments (glossary C4 family) + candidate interpretation (C3) | CONFIRMED → `embedding-semantics` | HIGH |
| `src/e15/page.ts` | Measurement-matrix page: renders (variant × region × embedding) cells at K=0.25; exposes `window.__e15` API (cells/intrinsics/innerSvgBox/objectLoaded/ready); `e15-ready` event | Browser measurement harness page (implements NO IIIF/W3C semantics — header) | Living measurement apparatus | `./analysis` (types only) | Route `/e15-lab.html`; `__e15` key; `.e15-box`/`.e15-row`/`#e15-probes`; cell-id dataset strings (fixture coords); HUD text | Page is harness, not analysis — same concept family, different sub-role | CONFIRMED WITH QUALIFICATION (page rename couples to route + specs; internals stay N-26) | HIGH |
| `src/e16/comparison.ts` | Pure fit-analysis helpers for nested-Canvas readings: `fitMap` fill/contain linear maps, `landmarkToOuter`, `fitsCoincide` (records that same-aspect makes fits coincide) | Nested-composition ANALYSIS helper (header: "NOT renderer semantics") | Living | `e14/types` (`E14Overlay`, `Rect`) — depends on living interchange tier | None directly; outputs flow into `evidence/e16/` via `tests/e16-comparison.test.ts` (side-effect writer #2/#3 with blind-comparison) | Concept = Nested Canvas composition fit readings | CONFIRMED WITH QUALIFICATION (not isolable historical apparatus: imports interchange types; sole consumer writes frozen-path evidence) | HIGH |
| `src/e17/classify.ts` | Cross-engine pixel-mask classifier: color scan/dilate/symmetric coverage scoring with thresholds VERBATIM from e15 (K=0.25, TOL_MIN=0.8, dilation 3, stride 1); parameterized `makeClassifier(deps)` over variants/regions/landmarks so one classifier scores both lab pages | Cross-engine replication scoring machinery + reusable classifier infrastructure | Living; consumed by `tests/e2e/e17.spec.ts` only | `e15/analysis` (interpretations, embedding space, names); `pngjs` | Emits prediction records keyed by `I-*` LABELS (via `INTERPRETATION_NAMES`) and verdict strings agree/diverge/unmeasured — serialize into `evidence/e17/` | Concept = cross-engine replication (glossary §5.5) | CONFIRMED → `cross-engine`; note `fn.name` introspection coupling (see §4) | HIGH |
| `src/e17/page.ts` | Supplementary measurement page hosting ONLY the xMaxYMax variant cells absent from e15 matrix; mirrors e15 page structure deliberately ("so one classifier can score both"); exposes `__e17` | Browser measurement harness page (cross-engine leg) | Living measurement apparatus | `e15/analysis` (type import); reuses `.e15-box` class intentionally | Route `/e17-lab.html`; `__e17` key; shares `.e15-box`/`.e15-row` hooks; `#e17-probes`; HUD text | Same page/harness qualification as e15/page | CONFIRMED WITH QUALIFICATION | HIGH |
| `src/style.css`, `src/vite-env.d.ts` | App shell styles / Vite env types | Infrastructure | Living | — | None observed (no generation tokens in style.css — verified) | Clean | Keep | HIGH |

Dependency-oriented summary (edges verified by import grep):

```
primitives/{svg-root,temporal}            ← tier 1 (neutral)
primitives/region-as-viewport-placement   ← tier 2 (profile-defined reading)
        ↑            ↑           ↑ ↑
 reference      blind       native n6(validator+svg)
        └──── e14/types (interchange tier) ←──┴────┐
                 ↑              ↑                  │
   reference/lib/e14.ts   blind/e14.ts   native/resolver.ts
                                            e16/comparison.ts
e15/analysis ← e17/classify, e17/page;  e14/comparison ← main.ts(__lab)
oracle → reference/types; comparison → {reference,blind}; main.ts → everything above
Consumers outside src/: tests/unit (9 suites), tests/e2e (14 specs),
scripts/run-n6-suite.mts, scripts/e17-aggregate.mjs (reads evidence only)
```

No cycle exists; consumers never import each other's resolution logic (verified:
`blind/*` imports no `reference` module; `reference/lib/e14.ts` imports nothing from
blind/native; `native/resolver.ts` imports neither). The only cross-renderer touch
points are the sanctioned ones: shared `e14/types`, shared `primitives/*`, and the
comparison/oracle infrastructure expressly permitted to read both sides.

---

## 3. Identifier audit

Classification codes per task brief: 1=historical citation, 2=current semantic
terminology, 3=internal implementation identifier, 4=machine-facing value/key,
5=evidence/fixture coordinate, 6=legitimate process-local identifier, 7=candidate
for migration. Occurrence counts from full-src grep at baseline HEAD `fb3c140`.

### 3.1 `E14*`

| Occurrence | Where | Class |
|---|---|---|
| Type names `E14Model`, `E14SvgAttrs`, `E14Placement(Mode)`, `E14NestedMap`, `E14Security`, `E14Rule`, `E14Overlay`, `E14CanvasInfo`, `E14Manifest`, `E14Comparison`, options/fetcher interfaces | `src/e14/*` (57 hits), `src/reference/lib/e14.ts` (33), `src/blind/e14.ts` (35), `src/native/resolver.ts` (25), `src/native/stage.ts` (9), `src/main.ts`, `src/e16/comparison.ts` | 3; 7 (rename-safe if atomic — see §4) |
| Function names `resolveE14Manifest`, `resolveBlindE14Manifest`, `compareE14`, `e14ToResolvedA`, `e14ToBlindOverlay` | reference/lib/e14, blind/e14, e14/comparison, main.ts | 3; 7 (bridge names additionally referenced in H.2-D prose — historical citation there) |
| Comment/header prose "Experiment E14 …", "E14-era [OPEN] fence", "the E14 crux/packet/question" | headers of e14/*, reference/lib/e14, blind/e14, native/resolver, n6/fragments, e15/analysis, e16/comparison, e14.spec | 1 |
| Values `"A"/"B"/"C"` of `E14Model`; `BodyKind` values; placement-mode strings | everywhere the record serializes | 4 — NEVER rename |
| Fixture filenames `e14-caseNN-*`, `/svg/e14/*` (incl. body id `e14-red-circle.png` reused by n2 builder) | builders, main.ts routing, specs | 5 — frozen grammar |
| URL param values `exp.startsWith("e14")`, dir literal `"e14"` | main.ts boot routing | 4 — protected surface |
| Browser-global keys `__lab.e14Resolved`, `__lab.e14Compare` | main.ts definition; e14/e16/e17.spec consumption | 4 (crosses page↔test boundary; N-26) |

### 3.2 `E15*`

| Occurrence | Where | Class |
|---|---|---|
| Type names `E15Embedding`, `E15Rect`, `E15Landmarks`, `E15SvgVariant`, `E15Map`, `E15Measured`, `E15CellResult` | `src/e15/analysis.ts` (53 hits), `e17/classify.ts` (20), `e17/page.ts` | 3; 7 |
| Interpretation function names `iRegionViewport`, `iIntrinsicStretch`, `iObjectFitContain`, `iNaturalTopLeft`, `iNaturalCentered` | e15/analysis (definitions), e17/classify (via `INTERPRETATIONS_BY_EMBEDDING` + `fn.name` introspection) | 3; 7 — BUT their names KEY `INTERPRETATION_NAMES`, whose VALUES are the frozen `I-*` labels (class 4); rename requires same-change-set map-key update (§4) |
| Variant filenames `e15-vb1000.svg`… (10 variants), landmark contract `public/svg/e15/e15-landmarks.json`, region keys `full/half/square500/rect43` | analysis tables, page, builders, n2 builder citations | 5 — frozen |
| `window.__e15`; CSS `.e15-box`, `.e15-row`; `#e15-probes`; event `e15-ready`; route `/e15-lab.html`; HUD "E15 matrix:" | e15/page.ts; consumed by e15.spec + e17.spec | 4/N-26 |
| Comment prose "Experiment E15 — …", "e15-vb1000.svg pattern", "/e15-lab.html cells" | e15/*, e17/*, n6/suite.ts comments | 1 |
| Evidence values `"experiment": "E15"` (summary.json), `"tolerances": "E15 verbatim…"` (e17 case files), filename infix `case-e15-<engine>-…` | generated evidence | 4 — generated, frozen |

### 3.3 `E16*`

| Occurrence | Where | Class |
|---|---|---|
| Header "Experiment E16 — analysis infrastructure"; case-shape comments "E16 case04/case07-style nested composition" | e16/comparison.ts; n6/suite.ts comments | 1 |
| Import of `E14Overlay`/`Rect` from e14/types | e16/comparison.ts | 3 (dependency fact, not terminology) |
| Fixture filenames `e16-caseNN-*`; URL routing `exp.startsWith("e16")` + dir literal `"e16"` | builders, main.ts | 5 / 4 |
| Evidence filename grammar `cmp-e16-case05-43-full-b__contain.json` etc.; aggregate keys `e16["case03-collapse"]` | tests/e16-comparison, scripts/e17-aggregate | 5 — frozen |

### 3.4 `E17*`

| Occurrence | Where | Class |
|---|---|---|
| Headers "Experiment E17 — measurement/classification helpers", "supplementary embedding-matrix page" | e17/classify.ts, e17/page.ts | 1 (self-description) + 3 (module identity) |
| Fixture `public/svg/e17/e17-vb1000-max.svg`; `#e17-probes`; `__e17`; route `/e17-lab.html`; HUD "E17 cells:" | page.ts; specs | 5 / 4(N-26) |
| Generated evidence values `"experiment": "E17/N1 cross-engine replication…"`, `intrinsics-<engine>.json`, `case-max-*`, `e16-<engine>-caseNN-*.json` | scripts/e17-aggregate.mjs line 139 + spec record calls | 4 — frozen |
| Config coupling: `playwright.e17.config.ts` `testMatch: /e17\.spec\.ts$/`, `outputDir ./test-results/e17` | config | infra metadata coupled to spec FILENAME (moves only in same change-set as any spec rename) |

### 3.5 `N6` / `n6` / `N2`

| Occurrence | Where | Class |
|---|---|---|
| Directory path `src/n6/` used as the current conformance-stack namespace; imports from `tests/n6-conformance.test.ts`, `scripts/run-n6-suite.mts` | tree | 2 today (current semantic namespace built on a retired generation number); 7 (the migration candidate proper) |
| Header comments "N6 — …" (every n6 file) | n6/* | 1 |
| `VALIDATOR_VERSION = "n6-resource-validator@1.0.0"` | validator.ts:66 | 4 — serialized into EVERY `evidence/n6/case-T*.json` + `summary.json` (`"validatorVersion"` field). Value must survive any path rename byte-identically |
| Suite fixture ids `"n6-t01"…` + derived `n6-t01/canvas`, `n6-tXX/annotation/…` | suite.ts; serialized throughout `evidence/n6/*` | 4/5 — frozen values |
| `AMB-N6-1` | suite.ts T12 expected text; evidence/n6/summary.json `recordedAmbiguities`; reports | LIVE approved identifier space (spec §7.2; U6) — quote verbatim, untouched |
| `OUT_DIR = "evidence/n6"` | scripts/run-n6-suite.mts | 5 — frozen evidence grammar |
| `(N2 V4–V7/M2/M3)`, "(none exists; N2)" rationale comments; `matrixRows` statement text mentioning N2 (regenerates into conformance-matrix.json) | validator.ts, exclusions.ts, types.ts, run-n6-suite.mts | 1 (citation of probe record) / 4 where regenerated into evidence (quote-verbatim context) |

### 3.6 Other generation identifiers

| Occurrence | Where | Class |
|---|---|---|
| `?exp=` VALUES `"1".."7"`, `text`, `security`, `7-animate`, alias `"6"`, `case1..13` | main.ts params + `MANIFEST_MAP` + `exp${exp}.json` construction | 4 — protected surface |
| Oracle switch cases keyed `"1"…"7"` + fixture paths `/svg/exp<N>-*.svg`, keyframes URL | oracle/experiments.ts | 4/5 |
| Comments citing exp6/exp7 behavior origins | reference/lib/types.ts (`Keyframe` "only set by exp7"), reference/lib/svg.ts, main.ts exp7 block | 1 |
| Stage/generation words in src | NONE found as live terminology (only historical citations listed above) — consistent with inventory claim | — |
| `playwright.n2.config.ts` testMatch `n2-viewer.spec.ts`, outputDir `test-results/n2` | config | infra metadata coupled to spec filename |

Names vs values summary: every retired-generation TOKEN appearing as a TypeScript
name (classes 3/7) is separable from every token appearing as a serialized VALUE or
KEY (classes 4/5) or citation (1). The former are migratable; the latter are not.

---

## 4. Serialization/boundary findings

**Finding S1 — No type/function NAME crosses serialization.** Grepped entire
`evidence/` tree for `"E14Model"|"E14Overlay"|"E14Manifest"|"E15Embedding"|"E15CellResult"|resolveE14Manifest|compareE14|e14ToResolvedA|e14ToBlindOverlay`:
zero hits. Spot-reads of representative artifacts confirm the serialized surface
carries only structural JSON with value payloads:

- `evidence/e14/e14-case03-a.json`: `{byPair:[{a,b,diffs}],verdicts:["a==blind",…],overlayCount:{a,blind,native}}`;
  diff records carry `field` strings ("placement", "model", …), composite placement
  strings embedding mode VALUES (`viewBox-meet|vp=…`), and classification VALUES ("OPEN").
- `evidence/e17/case-e15-*-….json`: `experiment`, `tolerances` prose values, numeric
  measurements, `I-*` label keys under `predictions`.
- `evidence/n6/case-T15.json`: `validatorVersion`, suite fixture ids, diagnostic
  objects keyed by field names (`requirement/status/code/location/actual/expected`),
  code VALUES.

Therefore internal TS identifiers (`E14*` types, `E15*` types, resolvers, comparators,
bridges) can be renamed later WITHOUT regenerating or invalidating any archived
evidence, provided the four couplings below are honored.

**Coupling C1 — Browser-global property keys are name-bearing contracts between page
and test code.** `window.__lab.e14Resolved` and `__lab.e14Compare` (defined in
main.ts:335–336) are invoked BY NAME from `tests/e2e/e14.spec.ts` (×2 helpers, 5 call
sites), `tests/e2e/e16.spec.ts` (3 sites), and `tests/e2e/e17.spec.ts` (2 sites);
`window.__e15` / `window.__e17` likewise from e15.spec and e17.spec (incl.
`waitForFunction` existence polls and method calls `cells()/ready()/intrinsics()/
innerSvgBox()/objectLoaded()`). These keys are N-26 implementation detail, but they DO
cross a machine boundary (browser global ↔ Playwright `page.evaluate` string context).
Renaming them requires one atomic change-set spanning main.ts/page.ts + affected
specs, or — recommended — leaving them as stable dev-surface keys.

**Coupling C2 — Interpretation-function names feed emitted evidence through
introspection.** `src/e17/classify.ts:198` resolves each interpretation's emitted
label via `INTERPRETATION_NAMES[fn.name] ?? fn.name`. If `iRegionViewport` & co. are
renamed without updating `INTERPRETATION_NAMES` keys in the same commit, newly
generated evidence would carry changed label strings — an accidental vocabulary
change. Renames here are safe ONLY as atomic pairs; the `I-*` label VALUES themselves
are frozen evidence vocabulary (spec §5.5/§8) and must never change.

**Coupling C3 — Identity strings embedded in generated output are values, not
names.** `VALIDATOR_VERSION="n6-resource-validator@1.0.0"` and suite fixture ids
`n6-t01…n6-t15` serialize into archived evidence. Any future regeneration must keep
producing these byte-identically regardless of any module/script renaming. They are
NOT candidates for migration (they are machine interfaces, per spec §2 principle 8).

**Coupling C4 — Filename/route/config couplings travel together.** Spec filenames ↔
Playwright `testMatch` regexes ↔ `outputDir` dirs; page filenames ↔ routes `/e15-lab.html`,
`/e17-lab.html` ↔ mount `<script src>` in public HTML ↔ spec navigation strings;
evidence-writer tests (`e14/e16/blind-comparison .test.ts` + `run-n6-suite.mts`)
pin `evidence/<family>/` output paths that are frozen grammars. Any path-level
migration executes these as ONE change-set per family (edit-flow discipline).

**Non-findings.** No reflection over class/type names elsewhere; no schema keys
derived from identifier strings; no external scripts consume `dist/` symbol names;
URLs expose no type names; `package.json` metadata carries no retired identifiers
(title/name question is U1, separate).

---

## 5. Inventory reconciliation candidates

Verdict scale per task brief. The inventory is NOT edited by this phase.

### 5.1 Challenged headline proposals

| Inventory row | Verdict | Evidence-based reason |
|---|---|---|
| `src/n6/ → src/validator/` | **CONFIRMED WITH QUALIFICATION** | Contents genuinely implement the glossary Validator (deterministic, browser-free resource-side checks emitting diagnostics/mappings/predictions/fences — validator.ts; six per-requirement predicate modules; owned output vocabulary in types.ts per spec §8). QUALIFICATIONS: (a) the directory ALSO holds suite.ts, the execution encoding of pre-registered T01–T15 — legitimately stage 3 of the same edit-flow, but a rename should consciously move suite+validator together (their consumers `tests/n6-conformance.test.ts` and `scripts/run-n6-suite.mts` import both); (b) `VALIDATOR_VERSION` value and `OUT_DIR="evidence/n6"` must persist unchanged; (c) spec Appendix names `src/n6/types.ts` as vocabulary owner — the §9 mapping row must include a pointer update, else two owner sites drift. No harness-specific or compatibility logic found inside n6 (bridges live in main.ts). |
| `src/e14/ → src/composition/` | **CONFIRMED WITH QUALIFICATION** | The DATA MODEL half is composition-domain: types.ts is the H.2-D interchange tier describing Models A/B/C (glossary C1.a "Composition model" — and spec §5.1 itself notes `E14Model` persists in code as machine encoding). But the DIRECTORY also hosts renderer-agreement comparison machinery (comparison.ts: pairwise diffs, verdict strings, provenance classification — the N-06 "renderer-agreement check" concept, closer to src/comparison/ than to composition). "Composition" names one of the two responsibilities. Execution options: split targets (interchange-record module vs comparison module) or an umbrella path; either way the §9 rows must distinguish them. Do NOT merge e14 code into e16 or comparison (H.2-D separation stands). |
| `src/e15/ → src/embedding-semantics/` | **CONFIRMED** | analysis.ts self-describes and behaves as reusable embedding-semantics analysis infrastructure (candidate interpretations §5.5, pixel-mask classification, embedding channels); cross-generation reuse is real: `e17/classify.ts` and `e17/page.ts` import it. page.ts is the measurement page for the same experiments (qualification recorded at row level in inventory B.1 and accepted). |
| `src/e16/ → src/nested-composition/` | **CONFIRMED WITH QUALIFICATION** | comparison.ts implements exactly nested-Canvas fit-reading analysis (fill/contain maps, fitsCoincide recording the same-aspect collapse fact). QUALIFICATION: it is NOT an isolated historical experiment namespace — it imports the LIVING interchange tier (`e14/types`), and its sole consumer (`tests/e16-comparison.test.ts`) writes frozen-path `evidence/e16/`. Any treatment "as historical apparatus" would misstate these dependencies. |
| `src/e17/ → src/cross-engine/` | **CONFIRMED WITH QUALIFICATION** | classify.ts IS cross-engine replication machinery (tri-engine scoring; thresholds verbatim from e15, documented in-header) and is more than an experiment-local harness: `makeClassifier(deps)` parameterizes variants/regions/landmarks specifically so one classifier scores both lab pages. QUALIFICATION: it is simultaneously the e17 experiment's harness support (sole importer: e17.spec) and depends on e15 analysis — the rename must preserve (and may document) that cross-generation dependency rather than implying a self-contained namespace. |

### 5.2 Remaining §B rows (condensed)

| Row | Verdict | Reason |
|---|---|---|
| B.1 clean namespaces (`reference`,`blind`,`native`,`primitives`,`comparison`,`oracle`) | **CONFIRMED** | Independent role attribution matches inventory; all six names denote their glossary/H.2 roles accurately (Renderer A/B, Blind/Native renderers, primitives tiers 1–2, comparison harness, oracle-not-consumer). No stylistic renaming warranted. |
| `scripts/run-n6-suite.mts → run-validator-suite.mts` | **CONFIRMED WITH QUALIFICATION** | Generator role correct; `matrixRows` presentation literals stay; `OUT_DIR="evidence/n6"` literal is frozen. Consolidation-map cites the old path — frozen doc stays; new phase record documents new path (per inventory's own note). |
| `build-fixtures.mjs` keep | **CONFIRMED** | Generates initial-cycle fixture grammar (exp*/case*/text/security) — name clean, outputs frozen. |
| `build-e14/e15/e16/e17-fixtures.mjs` renames | **CONFIRMED WITH QUALIFICATION** | Concept mapping sound per family; generated FILENAMES (`e14-caseNN-*`, `e15-*.svg`+landmarks, `e16-caseNN-*`, `e17-vb1000-max.svg`) are frozen grammars — script renames must not alter outputs. Note cross-family citations exist (n2 builder references e14/e15/e16 fixture paths). |
| `build-n2-fixtures.mjs → build-consumer-probe-fixtures.mjs` | **CONFIRMED WITH QUALIFICATION** | Consumer probe (§5.5) correct; output slugs frozen. |
| `e17-aggregate.mjs → cross-engine-aggregate.mjs` | **CONFIRMED WITH QUALIFICATION** | Reads only `evidence/e17/` files (frozen names incl. `case-e15-*`, `e16-*` prefixes); writes `cross-engine-matrix.json`/`summary.json` carrying `"experiment": "E17/N1 …"` values — regenerate-identical requirement applies. |
| B.3 unit-test renames (n6/e14/e16) | **CONFIRMED WITH QUALIFICATION** | Imports follow module renames; describe-string prose migratable; T-ids immutable; all three ARE evidence writers (side-effect suites) — output paths unchanged. |
| B.3 e2e renames (e14/e15/e16/e17/n2-viewer) | **CONFIRMED WITH QUALIFICATION** | Each couples to config testMatch/outputDir and (e15/e17) to routes/globals; `record()` keys freeze evidence filenames; e17.spec drives BOTH lab pages — extra atomicity constraint. |
| B.3 exp1..7/parity/security/text specs (inventory class F, deferred) | **NOT AUDITABLE YET** | Confirmed no glossary slug exists for per-experiment harness names; minting slugs is glossary-first work requiring a human decision. Audit adds: these specs exercise `oracle/experiments.ts` + protected `?exp=` values, so they are reproducibility apparatus around frozen surfaces. |
| B.3 viewer.spec/blind.spec clean | **CONFIRMED** | No retired identifiers beyond frozen observation-name grammar. |
| B.4 playwright configs renames | **CONFIRMED WITH QUALIFICATION** | Filenames/comments migratable; `testMatch`/`outputDir` move in the same change-set as spec renames; project names chromium/firefox/webkit are engine enumerants (untouched). |
| B.4 `public/e15-lab.html`/`e17-lab.html` route decision | **QUESTIONED (lean: keep)** | Routes are N-26 detail; renaming buys no semantic clarity while coupling pages+mount points+specs (G.4). Recommend declaring them stable dev-surface keys unless a human decides otherwise. |
| B.4 infra configs clean | **CONFIRMED** | package.json/index.html/vite/vitest/tsconfig/root playwright config verified free of retired identifiers (title question = U1, out of scope). |

### 5.3 Inventory ambiguities G.1–G.7 — audit contribution

- **G.1 (status of generation-harness trees): factual question now ANSWERED by this
  audit; POLICY question remains open.** Observed: e15/e17 analysis code is imported
  across generations; e16 consumes the living interchange tier; e14 types are the
  ratified living interchange tier; headers self-describe as infrastructure; the
  "frozen surfaces" wording in consolidation-map §1.4 predates H.2-A..D ratifications
  (cleanup-checklist item 5 already bounds that map's authority). Only their OUTPUTS
  (fixture filenames, evidence grammars) are frozen. The remaining decision — migrate
  names vs leave as reproducibility apparatus — stays with humans; this audit's
  evidence supports treating them as LIVING namespaces with frozen output grammars.
- **G.3 (type-name rename safety): resolved on the evidence side** — zero type-name
  occurrences in the full evidence tree (§4/S1). Remaining prerequisites are C1–C4.
- **G.2 (initial-cycle spec slugs): NOT AUDITABLE YET** (needs glossary-first slug minting decision).
- **G.4 (routes): QUESTIONED lean-keep** (above).
- **G.5 (README sequencing), G.6 (prompt templates scope), G.7 (U1 descriptor):**
  outside `/src` audit scope; NOT AUDITABLE YET; unchanged.

---

## 6. Vocabulary gaps demonstrated by the audit

Recorded per gap-discipline rules; NOT solved, NO canonical names invented. Existing
glossary terminology is insufficient for each because the nearest concepts denote
different objects.

1. **H.2-D three-tier display architecture.** Observed concept instances: the
   interchange record tier (`src/e14/types.ts` — shared, renderer-filled record),
   the legacy display-regression substrate tier (`ResolvedOverlay` + Stage), the
   private model tier (`BlindOverlay`), and the permanent harness-tier bridges
   (main.ts `e14ToResolvedA`/`e14ToBlindOverlay`, with documented lossiness).
   Insufficiency: glossary "Composition model" denotes the structural pattern
   A/B/C, not the RECORD carrying resolutions of it; "Comparison outcome" denotes
   results, not the record tier; nothing names the bridges. Migration decisions
   depending on it: what the `src/e14` directory/target names must cover
   (§5.1 qualification), and how migrated prose may describe main.ts.
2. **H.2-A four-tier reuse governance.** Observed: tier-1 renderer-neutral
   primitives (`svg-root`, `temporal`), tier-2 explicitly labeled profile-defined
   reading (`region-as-viewport-placement.ts` — self-labeled in header), and the
   consumer-policy ownership rule that keeps readings separate. Insufficiency: §5.8
   governance terms predate H.2-A; no glossary entry distinguishes tier-1 vs tier-2
   primitives, yet the distinction is load-bearing for WHY `n6` may import
   `region-as-viewport-placement` without collapsing readings. Migration decision
   depending on it: honest description of `src/primitives/` members in any moved
   layout (a flat "shared helpers" story would erase the tier boundary).
3. **Infrastructure/consumer role words, protected surfaces, evidence-producing
   tests.** Observed: this audit could not phrase its own table columns
   ("infrastructure vs consumer", "evidence-producing test") using glossary terms;
   AGENTS.md governs behavior with these words repo-wide. Insufficiency: C5 lists
   renderer ROLES, not module-role classes; C6 lacks these process-governance nouns.
   Migration decision depending on it: stating rename-safety conditions and
   which tests may rewrite evidence when paths move.

Not a gap (recorded to prevent false positives): the lab harness/composition root
(main.ts) and its `__lab` surface — spec §5.7 deliberately places "the harness"
below term level and N-26 excludes lab globals; adequate for migration purposes.

---

## 7. Migration prerequisites (what must be decided/mapped BEFORE any rename)

1. **Human ruling on inventory G.1** (living-namespace vs reproducibility-apparatus
   treatment per family: e14, e15, e16, e17, n6). This audit supplies the dependency
   facts; the call is policy.
2. **Mapping-first rows appended to `terminology-specification.md` §9** for every
   executed path (spec §11.3): including the e14 dual-role resolution (split vs
   umbrella target), and pointer updates wherever owning-document status attaches to
   paths (`src/n6/types.ts` as §8 output-vocabulary owner; consolidation-map §1.4/§2
   citations handled per frozen-record rules via NEW phase records, not edits).
3. **One-change-set-per-family plan** honoring coupling C4: spec filename +
   playwright testMatch/outputDir; page filename + route + public HTML mount + spec
   navigations; module dir + importing tests/scripts. Unit-test evidence writers keep
   `evidence/<family>/` output paths byte-stable.
4. **Decision on browser-global keys** (`__lab.e14Resolved/e14Compare`, `__e15`,
   `__e17`): recommend KEEP as stable dev-surface keys (N-26); if ever renamed,
   simultaneous spec updates required (C1).
5. **INTERPRETATION_NAMES atomicity rule** (C2): any rename of `i*` functions updates
   the map keys in the same commit; `I-*` VALUES immutable.
6. **Value-freeze acknowledgments** (C3): `VALIDATOR_VERSION` string, suite fixture
   ids `n6-tXX` + derived ids, verdict strings, model letters, placement-mode
   strings, `BodyKind` values, diagnostic codes/statuses, `AMB-N6-1`, T01–T15,
   R-S*, X*, RF01–04, fixture/evidence filename grammars, URL params, `MANIFEST_MAP`.
7. **Sequencing decisions**: README refresh (cleanup-checklist item 1) vs terminology
   change-set (G.5); prompt-template scope (G.6); U1 project descriptor remains
   separate; U6/AMB-N6-1 forbids touching T12 parentheticals pending human research
   decision.
8. **Post-rename verification protocol** defined up front: `pnpm run check`, focused
   vitest suites, full `pnpm test`, targeted builds, `git status --short evidence`
   after evidence-producing suites, and byte-stability checks of any regenerated
   artifact against archived copies (per evidence policy).

---

## 8. Scope boundary — what this audit did NOT change

- No source, test, script, config, fixture, evidence, or documentation file was
  created, renamed, edited, moved, or deleted by the audit itself.
- The terminology specification, inventory, registry, conventions, index, map, and
  checklist were read but not modified.
- No glossary terms added; §6 gaps recorded only.
- No renames or migrations performed; no migration scripts run.
- No tests executed; no build executed; no evidence regenerated (three known
  side-effect-writing vitest suites were NOT run; no browser/Playwright suite run).
- Commands used: read-only static inspection (file reads, greps, `git status`,
  `git log`) plus glob/listing. One repository mutation occurred at explicit human
  instruction BEFORE report authoring: commit `fb3c140` ("docs: add terminology
  migration inventory (pre-migration classification)") which TRACKED the previously
  untracked `research/terminology-migration-inventory.md` without any content change.
- Intentional delta produced by this phase: creation of this report file only
  (`research/phase-g-terminology-namespace-audit.md`).

## 9. Verification performed (audit discipline)

- `git status --short` inspected at start (untracked inventory only) and again after
  commit (clean); `git log --oneline` reviewed for convention matching.
- Full `/src` tree enumerated (47 files) and every namespace's primary modules read;
  import graph extracted via targeted greps (consumer independence re-verified).
- Identifier census greps for `E14|E15|E16|E17|\bN6\b|\bN2\b|\bexp\d` across `src/`,
  plus evidence-tree greps establishing serialization findings S1 and value inventories.
- Representative archived artifacts spot-read (`evidence/e14/e14-case03-a.json`,
  `e14-case06-a.json`, `summary.json`, `evidence/n6/case-T15.json`, `evidence/n6/summary.json`,
  `evidence/e17/*` patterns) to classify names-vs-values empirically.
- No claim above rests on chat history alone; every load-bearing assertion cites an
  inspected file or grep result from this session.

*End of Phase G audit. Stopping point reached: reconciliation and migration remain
unstarted and await explicit instruction.*
