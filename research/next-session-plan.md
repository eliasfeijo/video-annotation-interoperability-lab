# Next-Session Plan — E17 cycle (N1 cross-engine → N2 viewers → N3 community → N4 decision)

Date: 2026-08-21
Prepared after: repository inspection of research/, docs/, evidence/, tests/, src/reference/,
src/blind/, plus package/playwright configuration and the installed browser cache.
Mandate source: session brief (Stage 0 = this file). **No implementation has started.**

Priorities are fixed by methodology:

1. **PRIORITY 1 — N1 cross-engine replication (E17)** — verify the `[BROWSER]` rows beyond
   Chromium before any higher-level modeling.
2. PRIORITY 2 — N2 real-consumer probes / N3 community positioning.
3. PRIORITY 3 — N4 same-aspect safe-subset decision.
4. PRIORITY 4 — movement/timeline modeling only afterwards.

---

## 0. Current state snapshot (verified by inspection, not assumed)

Implemented WITH machine-readable evidence:

- Renderers A (`src/reference/`), Blind (`src/blind/`, independent), Native (`src/native/`);
  shared comparison infra only (`src/*/comparison.ts` per experiment).
- E1–E13 observations (`evidence/observations/`), E14 matrix (`evidence/e14/`),
  E15 176-cell geometry matrix (`evidence/e15/{summary,geometry-matrix,intrinsics}.json`,
  `case-*.json`, screenshots), E16 fill/contain comparisons (`evidence/e16/cmp-*__{fill,contain}.json`,
  `modeA-twins.json`, `landmark-spot-check.json`) and leaf-PAR collapse probes
  (`evidence/observations/e16-case03-fill-probes.json`, `e16-case05-fit-separation.json`).
- Vitest unit suite (147 passing) + Playwright E2E (61 passing, Chromium-only);
  `tsc --noEmit` clean. Ramp viewer probes network-gated (`tests/e2e/viewer.spec.ts`).

Documented but NOT yet implemented:

- Everything called N1–N4 (`research/open-questions.md` items 12–15): cross-engine runs,
  viewer matrix beyond Ramp, community positioning, safe-subset worked example.
  No `evidence/e17/`, no `evidence/viewer-matrix.json`, no corresponding reports exist.

Environment facts that shape this plan:

- Playwright cache (`%LOCALAPPDATA%\ms-playwright`) contains **Chromium only**
  (`chromium-1228`, `chromium-1234`, headless shells). **Firefox and WebKit are NOT installed.**
  Playwright `1.62.1` is available locally; installing engines is network-dependent.
- All current `[BROWSER]` classifications rest on exactly one engine (final report §6 states
  this explicitly). That is what E17 fixes or refutes.

---

## STAGE 1 — E17: N1 cross-engine replication

### Questions to answer (exact)

- **Q1.1** With an explicit viewBox, do all region-painting mechanisms agree with
  `I-REGION-VIEWPORT` in Firefox and WebKit as they did in Chromium? (P1/P2 robustness.)
- **Q1.2** Without a viewBox, do the three coexisting readings reproduce per engine
  (nested-svg 1:1 vs `<img>` intrinsic-stretch vs CSS contain/none), or does an engine
  produce a *fourth* reading?
- **Q1.3** Do `preserveAspectRatio` variants behave per SVG §7.7–7.10 across engines:
  `xMidYMid` (default), `xMinYMin`, `xMaxYMax`, `none` (stretch)?
- **Q1.4** For aspect-mismatched targets (square500, rect43), is the meet/letterbox geometry
  identical across engines (incl. vertical/horizontal centering — the post-bugfix-#13 tokens)?
- **Q1.5** Does at least one clipping cell (slice variant / region overflow) clip identically?
- **Q1.6** E16 leaf-PAR collapse: through the `<img>` channel against a destination aspect,
  does the leaf preserveAspectRatio still collapse against destination aspect in Firefox/WebKit,
  or is that Chromium-specific?

### Hypotheses and acceptance/rejection evidence

| # | Hypothesis | Accept if | Reject if |
|---|------------|-----------|-----------|
| H1 | Explicit viewBox ⇒ all region-painting cells match `I-REGION-VIEWPORT` in every engine | coverage ≥ 0.8 both masks (`tolScore` criterion reused unchanged) in ≥ FF+WK cells | any explicit-viewBox region-painting cell fails or matches a different interpretation in any engine |
| H2 | no-viewBox readings coexist per mechanism in each engine | nested=1:1 AND img-default=intrinsic-stretch reproduced per engine | an engine collapses readings (e.g., `<img>` stops stretching) or adds a new distinct reading — record as new finding either way |
| H3 | PAR align tokens map per spec in all engines | min/max/center placements within tolerance cross-engine | systematic offset (would indicate engine-specific PAR handling) |
| H4 | Same-aspect nested compositions coincide for fill/contain everywhere; mismatched diverge measurably | coincidence ≤ tolerance cross-engine; divergence magnitude recorded per engine | divergence magnitude differs wildly per engine (would weaken E16's 386-unit figure) |
| H5 | Leaf-PAR collapse reproduces outside Chromium | collapse measurable in ≥2 engines | collapse is Chromium-only ⇒ reclassify row `[BROWSER]`→engine-scoped; P2 wording changes |

Known risk folded into H2: bundled Firefox/WebKit may report **no intrinsic size** for
attribute-less SVG (SVG 2 intrinsic-sizing behavior) where Chromium reported width/height attrs
(SVG 1.1 §7.12). A different intrinsic-size report legitimately changes object-fit outcomes —
that is evidence about the no-viewBox hazard, NOT a harness bug. Record engine + version with
every intrinsics probe (`browser.version()`).

### Probe set (minimal but adversarial)

E15 reuse (existing fixtures, zero new SVGs unless noted):

- Variants: `e15-vb1000.svg`, `e15-vb1920x1080.svg`, `e15-novb1000.svg`,
  `e15-novb1920x1080.svg`; PAR variants `-min` (xMinYMin), `-slice`, `-none`.
- Regions: `full`, `half` (aspect mismatch vs square body), `square500`, `rect43`
  (covers Q1.2/Q1.4 incl. centering tokens).
- Embeddings kept adversarial: `svg-nested-region` (spec-truth reference), `img-default`
  and/or `img-fill`, `img-contain`, `img-none`, plus `object` and `background` only where cheap.
- Q1.5 clipping: `-slice` variant cells; add ONE new fixture variant only if inspection shows
  no existing clipped cell covers `xMaxYMax` (candidate new variant `vb1000-max`, built by the
  existing `scripts/build-e15-fixtures.mjs` pattern — smallest possible addition, logged).

E16 reuse (existing fixtures + comparison machinery):

- `case01-same-full` (same-aspect control), `case03-sq-full`, `case05-43-full`
  (aspect-mismatched fill-vs-contain), `case06-169into-sq` (worst divergence), `case07-novb`
  (ambiguity relocation), leaf-PAR collapse probes (rebuild `case03/case05` fill probes per
  engine using the existing observation scripts' approach).

Explicitly OUT of scope: full 176-cell re-run; video-decode-dependent probes (bundled
Firefox/WebKit may lack H.264 — all chosen cells are static SVG/CSS/image measurements);
CSS `cover` (out-of-profile, open question #10 unchanged); movement/SMIL (Priority 4).

### Existing infrastructure to REUSE (do not rebuild)

- `src/e15/analysis.ts`: `VARIANTS`, `REGIONS`, `INTERPRETATIONS_BY_EMBEDDING`,
  `INTERPRETATION_NAMES`, `EMBEDDING_SPACE`, `mapPoint` — pure module, import directly.
- Classifier machinery from `tests/e2e/e15.spec.ts` (`scanColor`, `predictedMasks`,
  `tolScore`, `classifyCell` semantics, K=0.25 css-px/canvas-unit, TOL_MIN=0.8).
- `/e15-lab.html` stage + `window.__e15` API (cells, intrinsics, innerSvgBox).
- Fixtures `public/svg/e15/*.svg` (+ `e15-landmarks.json`), E16 fixtures under `public/`,
  builders `scripts/build-e15-fixtures.mjs` / `build-e16-fixtures.mjs`.
- pngjs pixel scanning; evidence-writing conventions from E15 (`summary.json` +
  `case-*.json` + matrix + screenshots layout).
- `tests/e2e/utils.ts` (inspect at stage start before writing anything).
- Playwright webServer block (Vite on 127.0.0.1:5173, `reuseExistingServer`).

### New infrastructure REQUIRED

1. Multi-engine execution: extend `playwright.config.ts` with `projects` for
   `chromium`, `firefox`, `webkit` (default project currently implicit Chromium-only),
   OR a small dedicated runner; prefer config projects to stay inside the existing harness.
   Engines must be installed first: `pnpm exec playwright install firefox webkit`
   (network step; verify availability BEFORE writing code — task mandate).
2. Engine/version capture: record `browser.version()` + userAgent into every evidence JSON
   (currently absent — E15 summary hardcodes "Chromium (Playwright)").
3. `tests/e2e/e17.spec.ts` (new file) importing interpretations from `src/e15/analysis.ts`;
   classifier helpers may be lifted into `src/e17/` ONLY as copies/shared pure helpers —
   existing specs must remain untouched.
4. Evidence tree `evidence/e17/`: `summary.json`, `cross-engine-matrix.json`
   (variant×region×embedding×engine → {matches, verdict}), per-fixture `case-*.json`,
   `screenshots/<engine>/…`. Every result row MUST carry: engine, browser version,
   embedding mechanism, fixture, expected interpretation, observed geometry, classification.
5. Report `research/e17-report.md`.

### Expected classifications

- Explicit-viewBox region-painting rows: expect agreement cross-engine → these become
  multi-engine `[BROWSER]` facts. They do NOT become `[NORMATIVE]` — provenance stays with the
  SVG/CSS/IIIF citations already quoted in `e15-report.md` §5 / final report §4.
- no-viewBox rows: expect continued `[BROWSER]+[OPEN]`; possible engine-specific fourth
  reading would strengthen the P1 profile rule, not weaken it.
- CSS object-fit contain/none rows: `[NORMATIVE]` (CSS Images 3 §4.5) — expect stability;
  divergence would indicate engine bug → `[BROWSER]` + lab bug entry.
- Leaf-PAR collapse row: outcome unknown; either result updates classification
  (general `[BROWSER]` vs Chromium-scoped narrowing) and feeds P2's final wording.

### Stopping conditions

- S1.0 Firefox/WebKit cannot be installed (no network/installer failure): mark N1 BLOCKED
  with the failure recorded; do not fake partial engines; proceed only to network-independent
  stages (N3 research) if permitted, else checkpoint.
- S1.1 Any explicit-viewBox region-painting disagreement between engines (H1 reject):
  STOP all higher-level assumptions per mandate; write the divergence into
  `e17-report.md` FIRST; only then decide whether N2/N3 proceed.
- S1.2 Ambiguous cells (multiple interpretations match): record `ambiguous(...)` exactly like
  E15 did; never force-fit an interpretation to make the matrix tidy.
- S1.3 Tolerance recalibration needed for non-Chromium rasterization/AA: allowed, but ONLY as
  harness calibration (precedent: bug-fix #15 distinction) with thresholds recorded per engine;
  expected interpretations are immutable.

---

## STAGE 2 — N2 real consumer survey/probe

Questions (from brief): Canvas-as-body parsing? Painting Annotation SVG bodies? SVG Image
bodies on video Canvases? Nested composition? Temporal targeting preserved? Failure cause
(unsupported semantics vs media type vs app assumption vs bug)?

- Reuse: `tests/e2e/viewer.spec.ts` pattern (Ramp UMD via CDN against local manifests),
  `evidence/observations/viewer-*.json` conventions, local manifests under `public/manifests/`.
- New: extend to Mirador 3 (CDN build) and any AV client discoverable during N3; keep
  executable-probe-first, source-inspection-second. Negative results are first-class evidence.
- Output: `evidence/viewer-matrix.json` + `research/viewer-interop-report.md`;
  classes `[SUPPORTED]/[VIEWER_GAP]/[IMPLEMENTATION_GAP]/[UNKNOWN]`.
- Stop condition: no reachable viewer without heavy scaffolding → record UNKNOWN rows honestly,
  do not simulate viewer behavior from source reading alone.

## STAGE 3 — N3 community/spec positioning

Sources (authoritative-first): IIIF Presentation 3.0 (§5.3/§5.6), IIIF 4.0 draft, IIIF AV
technical requirements + cookbook, IIIF GitHub issues/discussions, W3C Web Annotation Model,
Media Fragments, SVG 1.1 (and SVG 2 where intrinsic sizing differs).

Answer A–E from the brief: existing viewBox recommendation? prior nested-Canvas discussion?
established meaning of "scaled to fit"? conventions for temporal/graphical/moving annotation
bodies? existing profiles making P1/P2 a restatement rather than invention?

- Output `research/community-positioning.md` with per-source quotes/paraphrases classified
  `[NORMATIVE] / [COMMUNITY PRACTICE] / [PROPOSAL] / [OPEN]`.
- Rule: adopt/reuse any existing community solution over inventing; never edit our profile to
  sound authoritative; only what sources establish may be claimed.
- Stop condition: sources conflict → keep [OPEN], cite both.

## STAGE 4 — N4 decision

Evaluate **P5a** ("nested Canvas overlays interoperable when target aspect == inner Canvas
aspect") using E16 + N1 + N2 + N3 outputs. Requires ≥1 realistic worked example (candidate:
letterboxed cinematic overlay set) before adoption/rejection. Decide: convenient subset vs
sufficient vs unnecessary-if-P1/P2-suffices vs formal-profile-constraint.
Output: `research/n4-safe-subset.md`. Implementation only if evidence demands it.

## STAGE 5 — research model update

Update `compatibility-matrix.md`, `open-questions.md`, `experiment-log.md`, and the final
report. Historical conclusions are never erased; superseded rows get SUPERSEDED + reason +
pointer. Provenance chain: claim → experiment/source file. End-state statement must separate:
standards guarantees / cross-engine browser facts / viewer support / profile conventions /
genuinely open items / unsuitable primitives.

---

## Global honesty constraints (apply to every stage)

1. Cross-engine agreement proves browser behavior, never standards provenance.
2. Conventions stay labeled conventions; nothing silently graduates.
3. Renderer independence preserved: never import resolution logic between renderers; shared
   comparison infrastructure only.
4. Every lab bug found gets a numbered entry in `experiment-log.md`.
5. Deterministic fixtures; machine-readable evidence; falsifiable tests.
6. Small experiments; no unrelated cleanup; no dependency additions unless unavoidable.

## Checkpoint protocol

After each stage: write report + machine evidence, run relevant tests (`pnpm test`,
targeted `pnpm test:e2e`, `pnpm check`), record commands/results/unresolved issues, commit,
print CHECKPOINT block (Stage/Status/Completed/Evidence/Tests/Next exact action/Known blockers).
On `continue`: resume from "Next exact action" without repeating completed inspection.
