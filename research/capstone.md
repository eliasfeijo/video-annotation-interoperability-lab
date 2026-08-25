# Capstone Synthesis — Video Annotation Interoperability Lab

**Status:** Final research synthesis (Layer L0-adjacent, new document). This document closes the research arc. It owns no new measurements; every substantive claim traces to the canonical sources listed in §12.

**Baseline:** `5dbd50c` (`research/research-program.md` Step 2 COMPLETE after D1 `994e293`). Working tree clean at synthesis. No evidence regenerated, no browsers run.

**Date:** 2026-08-25

---

## 1. Executive Summary

This lab asked: *under which conditions does the geometry of graphical content painted onto IIIF Presentation Canvases become predictable, interoperable, and mechanically checkable?*

The practical motivation was to draw graphical annotations over video interoperably using the existing standards stack — **W3C Web Annotation + Media Fragments + IIIF Presentation 3.0 (Canvas/Painting) + SVG** — without inventing a new annotation vocabulary.

**What was established (conditional, auditable):**

* **Expressibility** — The full annotation model (temporal `t=` + spatial `xywh=` targeting + SVG painting bodies, including Canvas-as-body nesting) is expressible in stable IIIF 3.0 + W3C vocabularies with documented gaps (`research/findings.md`, `research/e15-e16-final-report.md`, `research/e16-report.md§4` superseding E14 draft-only claim).
* **Geometry determinism** — Requiring an explicit `viewBox` on every SVG painting body makes its Canvas geometry deterministic across independent embedding mechanisms; without it, three coexisting readings appear (`research/e15-report.md§4`, `research/profile-draft.md:R-S1` `[PROFILE]` on SVG 1.1 §7.7–7.12 + CSS Images 3 §4.5).
* **Cross-engine stability** — The 62-row geometry matrix reproduced **identically in Chromium 151, Firefox 153, WebKit 26.5** (`research/e17-report.md`, `evidence/e17/cross-engine-matrix.json`). This is version-scoped browser behavior, not normative law.
* **Safe composition** — Restricting Canvas-into-Canvas painting to **same-aspect targets** removes the last fit-algorithm ambiguity mathematically; mismatched aspects diverge up to ~386 Canvas units (`research/n4-safe-subset.md` P5a → `research/profile-draft.md:R-S4`, `evidence/e16/landmark-spot-check.json`, `evidence/e17:F6`).
* **Mechanical validation** — Eight resource-side checks are implemented and passing (15/15 fixtures, `evidence/n6/`, `src/validator/`) for the profile's resource-side contract; consumer-side certification is declaratively blocked (`research/n6-implementation-report.md`).
* **Consumer reality** — Both mainstream viewers failed before geometry: **Ramp 5.1.1** error-boundary crash on any secondary painting body (SVG/raster/Canvas-as-body, identical `Cannot set properties of undefined (setting 'id')`), **Mirador 3.4.3** silent drop (zero overlay elements) (`research/viewer-interop-report.md` N2, `evidence/viewer-matrix.json`). Through the consumer's own Video.js surface, **Ramp 5.1.1 did not honor** Canvas-target `#t=10,20` (interaction probe, 4 valid drives, settled `2.65/2.64` vs control `2.63/2.64` delta `0.01` — `research/experiment-log.md#18`, `evidence/viewer-interaction/viewer-interaction-matrix.json`), **Mirador 3.4.3 was INCONCLUSIVE / experimentally unreachable** (no consumer-owned AV playback control, native `controls:true` only).
* **Boundary** — Temporal honoring, z-order portability, arbitrary-aspect fit algorithms, two-stage composition through real consumers, and general consumer conformance remain **outside the guaranteed profile** (`research/profile-draft.md:R-S8b [OPEN] Predicate:None`, `X1-X8`, `research/conformance-matrix.md:S8b/X7`).

**Practical conclusion:** A constrained profile can make **static graphical overlays on IIIF video Canvases mechanically predictable** when explicit coordinate systems and same-aspect conditions are enforced, and those conditions are checkable. The broader goal of **interoperable animated/temporal annotations remains outside the guaranteed profile** because real consumers do not consistently honor the required temporal/compositional semantics. This is a conditional success, not a universal one, and it is presented as the research result.

---

## 2. From the Original Problem to the Research Question

The original goal — *draw annotations over video interoperably* — is not a single property. The research **decomposed** it into independently falsifiable layers, and the decomposition itself is a finding:

```
draw graphical annotations over video interoperably
  ├─ coordinate-system determinism (how SVG user units map to Canvas space)
  ├─ Canvas / painting geometry (logical Canvas dimensions, region targeting)
  ├─ nested composition (Canvas-as-body fit, “scaled to fit”)
  ├─ spatial targeting (xywh=, pct: vs percent:, per-axis semantics)
  ├─ temporal targeting (t= half-open windows, producer permission vs consumer application)
  ├─ browser behavior (replaced-element layout, object-fit, intrinsic sizing, PAR)
  ├─ real-consumer behavior (do deployed viewers realize any of the above?)
  └─ mechanically checkable validation (resource-side vs consumer-side certification)
```

Narrowing from “video annotation” to “under which conditions does the geometry of graphical content painted onto IIIF Presentation Canvases become predictable, interoperable, and mechanically checkable?” (`research/research-program.md:19-22`) was not scope drift but the operationalization that made measurement possible. Each layer was probed in isolation (E15 geometry matrix, E16 composition, E17 replication, N2 consumer survey, N6 validator, D1 interaction probe), with the lab deliberately **not** turning “unknown” into “not needed.”

## 3. Standards Stack and Scope

**Stack (as tested):**

* **IIIF Presentation 3.0** — Canvas (`type:Canvas`, logical `width`/`height`/`duration`), Annotation (`motivation:painting`, `target` = Canvas or Canvas fragment, `body` = content resource).
* **W3C Web Annotation** — Annotation model, `FragmentSelector` with `conformsTo: http://www.w3.org/TR/media-frags/`.
* **W3C Media Fragments REC** — `t=` temporal (half-open `[begin,end)` per §4.2.1 `[NORMATIVE]`), `xywh=` spatial (`percent:`/`pixel:` per §4.2.2, per-axis split).
* **SVG 1.1 (§7.7–7.12)** — `viewBox` ↔ viewport mapping **given** a viewport, intrinsic sizing; + **CSS Images 3 §4.5** concrete object size as SVG viewport for `<img>`.

**What the standards specify (specification):** Canvas dimensions convey “an aspect ratio for the space in which content resources are located” (IIIF 3.0 §3.2/§5.3, 4.0 draft explicit), renderers “must scale content into the space represented by the Canvas” (§5.3) **without naming an algorithm** (verified absence, `research/community-positioning.md:§3`), Canvas-as-body is permitted (§5.7), Media Fragments syntax/semantics are normative (MF REC), WA chain is normative.

**What this lab chose as profile constraint (profile):** Explicit `viewBox` (R-S1 `[PROFILE]`), region-as-viewport assignment with PAR (R-S2 `[PROFILE]` conditional), same-aspect nesting (R-S4/P5a `[PROFILE]`), exclusions (R-S7/X1-X8 `[PROFILE]` boundaries), `pct:` alias `SHOULD` (R-S6b `[PROFILE]`). These are *profile* decisions on top of normative primitives, mechanically justified by cited browser evidence, not derived from IIIF.

**What the standards leave underdetermined (open):** No SVG requirement for `viewBox`; no embedder viewport obligation (hence R-S2 must assign it); no fit algorithm for mismatched aspects (`[OPEN]`); no universal z-order guarantee (recipe contradiction); no consumer temporal-honoring obligation (fenced as R-S8b `[OPEN]`).

**What the lab explicitly excluded (out of profile):** Background-image painting, naive attribute-mode insertion, viewBox-less bodies, arbitrary-aspect replacement, invented fit keywords, reliance on consumer-specific painting-body behavior, two-stage composition guarantees, pixel-identical rendering, and general temporal honoring. See `research/profile-draft.md:Part10` X1-X8 and `research/profile-draft.md:Part1` OUT boundary — all `[PROFILE]` boundaries, not claims that standards forbid them.

## 4. Methodology

The lab treated interoperability as **falsifiable** and separated concerns by design:

* **Independent renderers:** `src/reference/` (Renderer A, two entry points `iiif.ts`/`e14.ts` sharing parsing core), `src/blind/` (independent renderer, interpretation-packet-driven), `src/native/` (`<img>` pipeline). Methodological blinding (`AGENTS.md`) forbids sharing semantic resolution logic; comparison harness `src/comparison/` is analysis-only. This makes agreement non-trivial.
* **Embedding-semantics matrix (E15):** 10 SVG variants × 4 regions × 8 mechanisms = 176 cells, pixel-mask classifier (`src/embedding-semantics/`, coverage ≥0.8, K=0.25), landmark contract (`public/svg/e15/e15-landmarks.json`). Verbatim thresholds reused in E17.
* **Nested-composition probes (E16):** 8 fixtures × 3 renderers × {fill,contain} + 4 stable-3 Mode A twins (`public/manifests/e16/`), browser pixel probes for aspect-mismatched bands, cross-engine spots (`evidence/e16/landmark-spot-check.json`).
* **Cross-engine replication (E17):** Minimal adversarial subset from E15/E16 via dedicated runner `playwright.e17.config.ts` (`chromium|firefox|webkit`, `testMatch` pinned), mask classifier lifted verbatim, per-engine intrinsics + leaf-PAR collapse probes (`evidence/e17/`).
* **Safe-subset analysis (N4):** Decision record `research/n4-safe-subset.md` synthesizing E15-E17 + N2-N3, adopting P5a same-aspect with zero-cost worked example (Part 3).
* **Real-consumer probes (N2):** Real third-party bundles from unpkg in-browser (`public/viewer-check.html` Ramp, `public/mirador-check.html`), passive DOM/`video` state capture (`tests/e2e/consumer-probe.spec.ts`, `evidence/viewer-matrix.json` + `evidence/viewer/probe-*.json`).
* **Interaction-level temporal probe (D1):** Valid **consumer-owned** stimulus only — Playwright `click(.vjs-big-play-button)` (Video.js/Ramp control) → Ramp/Video.js state → `player.currentTime()` → observable `currentTime`/`paused`/`timeDisplay`, 2×2 runs per fixture, settled 2s liveness, no `video.play()`/`currentTime=` writes, no synthetic events, Chromium-only pre-registered protocol (`tests/e2e/consumer-interaction.spec.ts`, `evidence/viewer-interaction/`).
* **Evidence discipline:** `research/evidence-policy.md` (P-1 archived result set, P-2 byte-unstable, P-3 protocol-authorized regeneration with source-state provenance, P-5 frozen filenames). `research/fixture-provenance.json` owns provenance. `research/consolidation-map.md` governs layers and the 5-stage N6 edit flow `profile-draft.md → conformance-matrix.md → src/validator/suite.ts → generator → evidence/n6/`.
* **Mechanical validator (N6):** Browser-free, deterministic resource-side checker (`src/validator/`), T01-T15 pre-registered suite, `evidence/n6/` 15/15.

Independence and observable behavior mattered because the question is *portability across implementations*, not *spec reading*. The lab never promoted three-engine agreement to `[NORMATIVE]`, nor cookbook advice to spec, nor viewer gap to standard prohibition (`research/profile-draft.md:136-147` taxonomy).

## 5. What the Lab Established

### 5.1 Geometry determinism — explicit viewBox (R-S1)

**Established:** With an explicit `viewBox="0 0 1000 1000"` (etc.) on the SVG root, every region-painting mechanism (nested `<svg>` region, `<img>` default/fill, `object`) agrees with **I-REGION-VIEWPORT** in all distinguishable cells — 40 viewBox cells in E15, confirmed tri-engine in E17 `F1` (`research/e15-report.md:§4.2,§6`, `research/e17-report.md:F1`, `research/profile-draft.md:R-S1` `[PROFILE]` on SVG 1.1 §7.7–7.10 + CSS Images 3 §4.5). The rule is a **profile** requirement because SVG itself does not mandate `viewBox` and IIIF Presentation 3.0 contains zero occurrences of SVG (`research/community-positioning.md:§3`, `research/n3-source-index.json`), so no external anchor exists — genuinely new convention, unrefuted and strengthened.

### 5.2 Cross-engine stability (E17)

**Established:** **62/62 distinct geometry-matrix rows unanimous across Chromium 151.0.7922.34 / Firefox 153.0 / WebKit 26.5 (Playwright 1.62.1)** (`research/e17-report.md:20-31`, `evidence/e17/cross-engine-matrix.json`, `evidence/e17/summary.json`). This covers explicit-viewBox agreement, no-viewBox hazard, intrinsic-size reporting (including attribute-less SVG), PAR token behavior, leaf-PAR collapse, same-aspect control, and designed no-viewBox divergence.

**Scope guard:** This is **version-scoped browser behavior** (`[BROWSER]`), per `research/e17-report.md:27-29` and `research/documentation-conventions.md`. It does not promote any row to `[NORMATIVE]`; it upgrades the *evidence base* for `[PROFILE]` rules from one to three engines. Do not read as “all browsers” in general — read as the tested three versions in the tested matrix.

### 5.3 The no-viewBox hazard

**Established:** Without `viewBox`, the same body resolves to **three coexisting readings** (`research/e15-report.md:§4.1` + `research/e17-report.md:F2` tri-engine): nested-region paints user units 1:1 (`I-REGION-VIEWPORT`), `<img>` default/fill bitmap-stretches the intrinsic canvas (`I-INTRINSIC-STRETCH`), CSS contain/none follow object-fit semantics. The hazard is **engine-uniform** (E17 F2/F3), so no engine choice rescues it. Intrinsic size (e.g., `naturalWidth:1000×1000` for no-viewBox vs Chromium `267×150` for viewBox-only per `research/e15-report.md:§4.3` experiment-log bug #12, `research/e17-report.md:F3` identical across engines) describes a bitmap-like natural size, not a coordinate contract — therefore R-S1 rejects viewBox-less bodies and R-S7 excludes reliance on intrinsic dimensions (`research/profile-draft.md:X2`, `research/n4-safe-subset.md:Part1-P1`).

### 5.4 Same-aspect safe subset (R-S4 / P5a)

**Established:** When painted Canvas `Wb×Hb` and target rect `Tw×Th` satisfy `Tw·Hb == Th·Wb` (or replacement `W'·H == H'·W`), every reasonable fit interpretation coincides mathematically: unique uniform scale `k=Tw/Wb=Th/Hb`, fill degenerates to uniform, contain/meet letterbox offsets are exactly zero, slice crops nothing (`research/n4-safe-subset.md:Part2-P5a`, `research/profile-draft.md:Part7` exact cross-multiplication, tolerance `ε≤10⁻⁶` for non-integers).

*Quantified divergence when not satisfied:* case03 `0,0,1920,1080` vs `420,0,1080,1080` destinations, composed tick `(40,40)` at `76.8` vs `463.2` Δ=386.4 Canvas units (`evidence/e16/landmark-spot-check.json`, synthetic replacement tick `41.7,74.1` vs `41.7,479.2` Δ≈405, `research/n4-safe-subset.md:Part3`). Same-aspect rows (case01/02, case04 twin) coincide and `twinMatchesFill && twinMatchesContain` (`evidence/e16/modeA-twins.json`), confirmed tri-engine `fitsCoincide` `true` (E17 F6). Leaf-PAR collapse (E16 §4.3, E17 F5 identical run fractions `0.0196/0.1483`) becomes unreachable under P5a.

Adopted as **formal `[PROFILE]` rule P5a** (`research/n4-safe-subset.md:Part2` verdict). It is compatible with IIIF 3.0 §5.3/§5.7 (verified absence: IIIF never names a fit algorithm, `research/community-positioning.md:§3`) and converges independently with Cookbook recipe 0004 (“aspect ratio should be consistent… otherwise unpredictable stretching”) `[COMMUNITY]`. Worked example `1920×1080 → 3840×2160 k=2` and nested `1000×1000 @ 710,290,500,500 k=0.5` preserve fractional invariants (`research/n4-safe-subset.md:Part3`).

### 5.5 Real-consumer behavior (N2 + D1)

**N2 passive survey (Chromium-only, consumer isolation, browser already tri-engine):** Both mainstream viewers failed before drawing such overlays (`research/viewer-interop-report.md`):

* **Ramp 5.1.1** — **hard error boundary** `Cannot set properties of undefined (setting 'id')` for **any** secondary painting body (explicit-viewBox SVG V4, no-viewBox V5, PNG raster V6, stable-3 Canvas-as-body V7, byte-identical text), no `<video>` remains, so geometry unobservable. **Mirador 3.4.3** — **silent drop** (M2/M3, zero fixture-referencing overlay elements, Annotations dropped while `<video>` renders). Video-only baseline V1/M1 renders `readyState:4` video (`evidence/viewer-matrix.json`).
* **Scope:** Version-scoped viewer gap `[VIEWER_GAP]` + `[CONSUMER]` per taxonomy, not spec verdict. Already extends historical `exp11` “Ramp throws on SVG” to “any secondary Image body.” No geometric reading obtained, so no P1/P2 refutation possible (`research/viewer-interop-report.md:§8`).

**D1 interaction probe (Chromium 151, dedicated `playwright.consumer-probe.config.ts`, `tests/e2e/consumer-interaction.spec.ts`, `evidence/viewer-interaction/`):**

* **Stimulus (valid):** `page.goto('/viewer-check.html?manifest=…')` → `#status bundle loaded` → `video readyState≥2` → **Playwright `click(.vjs-big-play-button)`** (Ramp/Video.js control) → Video.js/Ramp state → `player.currentTime()` → observable `currentTime`/`paused`/`timeDisplay`. No `video.play()`, no `currentTime=` writes, no synthetic events, no `src#t=` mutation (frozen scope).
* **Observed (OBSERVED):** 4 valid drives — temporal `#t=10,20` settles `2.65`/`2.64`, control settles `2.63`/`2.64`, delta `0.01` (`evidence/viewer-interaction/viewer-interaction-matrix.json:7-8`, `research/experiment-log.md:27` #18). All `hasMediaFragmentInSrc:false`, so the seek is not browser-native `src#t=` handling.
* **Classification (INFERRED, conservative taxonomy):** **Ramp 5.1.1 NOT-HONORED** for the tested Canvas-target case — consumer **drove** playback successfully (not `INCONCLUSIVE`) but ignored the fragment; the negative result is attributable to the **tested consumer path** because the decision value (`10` vs `0`) originates in consumer parsing, and `src` bears no fragment. Do not generalize to “Ramp never supports temporal fragments” — other Ramp modes/paths (e.g., `startCanvasTime`) were not tested and are explicitly not claimed.
* **Mirador 3.4.3:** **INCONCLUSIVE / experimentally unreachable** — workspace mounts (`hasMiradorRoot:true`, `videoCount:1`), but `hasConsumerPlaybackControl:false` (native `controls:true` only, word-boundary heuristic excludes `display` false positive; `evidence/viewer-interaction/probe-mirador-d1-temporal-feasibility.json`). No consumer-owned playback control satisfying the causal rule was found; no native-media manipulation was performed to manufacture a result. Therefore **do not** classify as `NOT-HONORED`; record as boundary.

### 5.6 Mechanical validation (N6)

**Established:** Resource-side validator `src/validator/` (pure TS, browser-free) implements **8 static checks** (`research/n6-implementation-report.md`, `evidence/n6/`): R-S1 `viewBox`, R-S3 Canvas dims, R-S4 same-aspect (exact `Tw·Hb` cross-multiplication, `ε≤10⁻⁶`), R-S5 mapping `(Tx+k·u)`, R-S6a MF grammar, R-S6b `pct:` alias `SHOULD`, R-S7 resource-side exclusions, R-S8a temporal permission. **15/15 T01-T15 fixtures pass** pre-registered expectations (including failure cases `MISSING_VIEWBOX`, `ASPECT_MISMATCH`). Consumer-side is blocked: R-S2 region-as-viewport observable predicate (landmark/destination check) and R-S7 consumer enforcement are `BLOCKED` (no capable consumer, N2), R-S8b is `OPEN_FENCE` `TEMPORAL_HONORING_OPEN` (no predicate by design), output vocabulary audit (T10) guards against fit/z-order/“honors t=” guarantees (`src/validator/types.ts` caps `implemented/BLOCKED/OPEN_FENCE` only).

**What validator can guarantee:** structural/profile conditions, resource-side conformance, safe-geometry conditions, and that *inside* the safe subset every reasonable interpretation coincides analytically and browser hazards are unreachable — so conforming **data** is stable against future capable consumers.

**What it cannot guarantee:** viewer rendering, temporal honoring by arbitrary viewers, z-order, arbitrary-aspect fit, pixel-identical rasterization, two-stage composition — all `X1-X8`/`OUT OF SCOPE` by design (`research/conformance-matrix.md:45-48`, `research/profile-draft.md:Part15`).

## 6. The Interoperability Boundary

| Dimension | Established condition (profile) | Evidence | Status | What is NOT guaranteed |
|-----------|----------------------------------|----------|--------|------------------------|
| **SVG coordinate system** | Every painting body has explicit root `viewBox` — R-S1 `[PROFILE]` | E15 176 cells + E17 F1/F2 62/62 tri-engine `[BROWSER]`; N3 zero SVG anchor | **IN FORCE (resource side)** | Nothing about viewBox-less bodies (X2, 3 readings) |
| **Region as viewport** | Targeted region acts as SVG viewport with PAR — R-S2 `[PROFILE]` (raw `<img>` only if aspect-matched or pre-compositing) | E15 R1 40 cells + E17 F1/F5 collapse `[BROWSER]`; N2 zero consumer readings | **IN FORCE declarative; certification BLOCKED** | Realization by current Ramp/Mirador (N2 V4/M2) |
| **Canvas dimensions** | Positive integer `h`/`w` — R-S3 `[PROFILE]` (semantics `[NORMATIVE]` IIIF 3.0 §3.2/§5.3) | IIIF spec + N3 | **IN FORCE** | Pixel assignment |
| **Composition aspect** | Painted Canvas matches target rect aspect `Tw·Hb==Th·Wb` — R-S4/P5a `[PROFILE]` | E16 Δ386.4 + twin coincidence + E17 F6 + recipe 0004 `[COMMUNITY]` | **IN FORCE** | Any fit for mismatched (X1/X3, `[OPEN]` — no algorithm defined) |
| **Coordinate mapping** | `(u,v)↦(Tx+k·u)` with `k=Tw/Wb` — R-S5 `[DERIVED]` | E16 same-aspect + E17 F6 | **IN FORCE (consequence of S4)** | Any dual-axis scaling outside S4 |
| **Fragment syntax** | `t=`/`xywh=` half-open, per-axis `percent:` + `pct:` alias `SHOULD` — R-S6a `[NORMATIVE]` / R-S6b `[PROFILE]` | MF REC §4.2.1/§4.2.2; WA §4.2.1; E15 176 cells; bug-fix #10 | **IN FORCE (syntax only)** | Handling of invalid/out-of-bounds (E14 OPEN) |
| **Temporal permission** | Producers MAY use `t=` — R-S8a `[NORMATIVE]` | MF §4.2.1 | **IN FORCE (permission)** | Honoring (see next) |
| **Temporal honoring** | R-S8b **fence** — `[OPEN]` `Predicate:None` | N2 V2 `[UNKNOWN]` passive + D1 `viewer-interaction-matrix.json` Ramp **NOT-HONORED** (version-scoped, valid drive) / Mirador **INCONCLUSIVE** | **OPEN fence — MUST NOT become requirement** | Seek/windowing/cropping by any consumer (X7) |
| **Exclusions** | No geometry promised for viewBox-less, background-channel, naive insertion — R-S7 / X1-X8 `[PROFILE]` boundary | E15 R2/R5 + E17 F2/F3 `[BROWSER]` + CSS Images 3 §4.3.1/§4.5 `[NORMATIVE]` | **IN FORCE (boundary)** / **EXCLUDED/OUT OF SCOPE** | Standards-forbidden reading (not claimed) |
| **Browser behavior** | Explicit-viewBox agreement, no-viewBox hazard, collapse etc. | E17 62/62 tri-engine `[BROWSER]` version-scoped | **[BROWSER]** facts, not normative | Promotion to standards |
| **Consumer behavior** | Ramp crash / Mirador drop for secondary bodies; Ramp NOT-HONORED temporal, Mirador unreachable | N2 + D1 `[CONSUMER]`/`[VIEWER_GAP]` version-scoped | **[CONSUMER]** observations | Generalization beyond tested versions/targets |
| **Conformance** | Resource-side 8 checks — S1,S3,S4,S5,S6a,S6b,S7(resource),S8a | N6 15/15 T01-T15 `evidence/n6/` | **IMPLEMENTED** | Consumer-side (needs capable consumer) |

Do not turn `OPEN`/`EXCLUDED` into requirements.

## 7. Practical Safe Subset

If you want the **best-supported interoperable construction demonstrated**, do exactly this (and nothing more), per `research/profile-draft.md:Part4` + `research/n4-safe-subset.md:Part6` S1-S8:

* **S1:** Every SVG painting body (`type:Image`, `image/svg+xml`) has an explicit root `viewBox="minX minY w h"` with four numeric components. Add equal `width`/`height` attrs `SHOULD` (viewBox-only SVG has Chromium `267×150` intrinsic weirdness, `research/profile-draft.md:Part5#3`).
* **S3:** Every Canvas states positive integer `width`/`height` (logical space, not pixels; IIIF 3.0 §3.2).
* **S4 (P5a):** Any Canvas-as-body matches its target rect aspect exactly `Tw·Hb==Th·Wb` (painted) / `W'·H==H'·W` (replacement); non-integer dims `SHOULD` be rejected, or documented `ε≤10⁻⁶` relative. Then landmark `(u,v)` maps to `(Tx+k·u)` with `k=Tw/Wb` (replacement: `k=W'/W`). No letterbox bands, no clips — destination rect equals target rect (S5).
* **S6:** Targets use Media Fragments `t=` (half-open `[begin,end)`) and/or `xywh=` with `percent:` (`pct:` accepted as `percent:`); `conformsTo: http://www.w3.org/TR/media-frags/` chain allowed via WA `FragmentSelector`. Malformed fragments are non-conforming.
* **S2 (forward-looking consumer):** A claiming consumer renders the targeted region as the SVG viewport with `preserveAspectRatio`. Raw single-stage `<img>` qualifies only for aspect-matched targets or pre-compositing consumers.
* **S7/X1-X8:** Do not ship viewBox-less bodies, background-channel painting, naive insertion, arbitrary-aspect replacement, fit keywords, or reliance on consumer-specific body assumptions. No geometry is promised for these; the validator rejects `MISSING_VIEWBOX` / `ASPECT_MISMATCH` and never emits a fit policy (T10).
* **S8:** You MAY attach `t=` windows — they are syntactically valid — but do not rely on viewers honoring them (`R-S8b [OPEN]`). The D1 test for `#t=10,20` on a Canvas target via Ramp's own UI was **NOT-HONORED** (version-scoped), and Mirador was **unreachable** for this question.

This is a *practical summary*, not a new specification; every line is already a `profile-draft.md` rule or exclusion.

## 8. What the Lab Does NOT Establish

* **No universal fit algorithm** for mismatched aspects — X1/X3 `[OPEN]`; defining one would invent vocabulary (`research/e16-report.md:§2` + `research/community-positioning.md:§3` verified absence).
* **No portable z-order** — recipes 0036/0033 (first=bottom, “like z-index”) contradict 0489 (first=foreground) and Mirador #2607 `[COMMUNITY]` (`research/profile-draft.md:Part9` `[OPEN]`, `X6` `OUT OF SCOPE`).
* **No consumer-side certification** — R-S2 declarative only; `BLOCKED` until a capable consumer exists (`research/n6-implementation-report.md:§6`, `research/conformance-matrix.md:RF01-RF04` blocked).
* **No two-stage composition guarantee** — pre-composited inner Canvas honoring container fit is `X8`/`[OPEN]`; no realizing consumer found (N2 V7/M3), browser pipelines demonstrably collapse (E16 §4.3, E17 F5 `[BROWSER]`+`[OPEN]`).
* **No general temporal honoring** — syntax is normative, application is not; R-S8b stays `[OPEN]` even after the version-scoped D1 negative instance. The lab did not test SMIL, keyframe vocabularies, or other Ramp modes (`startCanvasTime` etc.).
* **No pixel-identical promise** — thresholds `coverage≥0.8 K=0.25` etc. are tolerance-classified (`research/profile-draft.md:Part15`), per-engine rasterization differences explicitly out of contract.
* These are not “future TODOs” to be closed by one more lab experiment; fit and z-order are externally gated (needs spec/community convergence), consumer support is externally gated (needs implementation).

## 9. Implications for the Original Video-Annotation Goal

**Direct answer:** Can we describe a practical, interoperable way to place graphical 2D annotations over video using this stack?

* **Yes, conditionally:** For **static graphical overlays** (SVG bodies at spatial regions) with the constraints above — explicit `viewBox` + same-aspect composition + well-formed fragments + exclusions respected — the lab demonstrates a **mechanically predictable, cross-engine reproducible** construction at the **resource/geometry layer**. The data model works (10/10 fixtures pass the official IIIF validator `okay:1`, `research/compatibility-matrix.md` S), and the geometry is testable without knowing a consumer's internal fit policy exactly because under the safe subset every reasonable policy coincides.

* **Only partially for full video annotation:** The broader goal — interoperable **animated/temporal** annotations — remains **outside the guaranteed profile** because real consumers do not consistently honor the required temporal/compositional semantics. The validator can certify that your *data is well-formed for portability*; it **cannot** certify that Ramp/Mirador will *show* it as you intend. Today they do not: they fail before drawing secondary bodies, and Ramp's own playback path ignores the Canvas temporal target that the standards *permit* producers to use freely.

Why this is useful, not an apology: The narrowing *is* the result. By decomposing one “simple” goal into eight layers and falsifying each, the lab turned an unbounded interoperability hope into a **checkable boundary** with concrete, low-cost publisher discipline (explicit `viewBox` costs nothing; same-aspect costs nothing in the probed replacement case) and a crisp proposal for community channels (standardize a fit algorithm or adopt P5a; converge on z-order). Before this work, a publisher had no way to know whether a failure was a bug, a browser quirk, or a viewer choice; now they can run `src/validator/` and know that *inside* the subset the failure is viewer-side and *outside* the subset the failure is profile-excluded by design.

**Evaluate the test conclusion:** “A constrained profile can make static graphical overlays on IIIF video Canvases mechanically predictable when explicit coordinate systems and safe geometry conditions are enforced, but the broader goal of interoperable animated/temporal annotations remains outside the guaranteed profile because real consumers do not consistently honor the required temporal/compositional semantics.” — **Justified, with one refinement:** add *“for the tested Canvases/bodies/engines/consumers/versions (#t=10,20 Canvas-target, Ramp 5.1.1 vs Mirador 3.4.3, Chromium 151 / Firefox 153 / WebKit 26.5)”* to avoid over-generalizing “do not consistently honor” beyond the version-scoped evidence. The core claim stands.

## 10. Limitations and Reproducibility

* **Version scope (must be quoted with every claim):** Chromium `151.0.7922.34` / Firefox `153.0` / WebKit `26.5` via Playwright `1.62.1` (Windows) (`research/e17-report.md:9`); Ramp `5.1.1` (`@samvera/ramp@5.1.1/dist/ramp.standalone.umd.js`), Mirador `3.4.3` (`mirador@3.4.3/dist/mirador.min.js`) via unpkg HEAD-resolved per-run (`evidence/viewer-matrix.json` + `evidence/viewer-interaction/viewer-interaction-matrix.json`); Vite + Vitest + TypeScript 7 strict, Node 26, FFmpeg 9 for `public/video/test-grid-1920x1080-30s.mp4` (`research/experiment-log.md:3`). No claim is eternally version-proof.
* **Evidence families (archived result sets, not rebuildable caches per `research/evidence-policy.md:P-1`):** `evidence/e15/` + `evidence/e16/` (geometry + composition), `evidence/e17/{summary,cross-engine-matrix,intrinsics-*,case-*}.json` (62/62), `evidence/viewer-matrix.json` + `evidence/viewer/probe-*.json` (N2), `evidence/viewer-interaction/viewer-interaction-matrix.json` + `probe-ramp-d1-*.json` + `probe-mirador-d1-temporal-feasibility.json` (D1), `evidence/n6/15/15` (`case-T*.json` + `summary.json` + `conformance-matrix.json`), screenshots `evidence/screenshots/{e15,e16,e17,n2,viewer-interaction}/`, plus `evidence/observations/` and `evidence/blind-comparison/` for exp-era. Producer linkage in `research/evidence-policy.md:P-4` and `research/fixture-provenance.json`.
* **Frozen fixtures:** All manifests under `public/manifests/{exp*,e14,e15,e16,n2}/*.json`, SVGs `public/svg/{e15,e16,e14,exp*}.svg`, video `public/video/test-grid-1920x1080-30s.mp4` are deterministic (`scripts/generate-video.mjs`, `scripts/build-fixtures.mjs` + `build-e15/e16/*.mjs`). Repro requires `pnpm dev` (port 5173) + unpkg fetch for Ramp/Mirador and `presentation-validator.iiif.io` POST for exp10.
* **Reproducibility path:** `pnpm install` → `pnpm exec playwright install chromium firefox webkit` → `pnpm gen:video` → `pnpm gen:fixtures` → `pnpm test` (Vitest 180 tests at capstone) → `pnpm exec playwright test --config=playwright.e17.config.ts` (E17) → `pnpm exec playwright test --config=playwright.consumer-probe.config.ts` (N2 + D1, `evidence/viewer-interaction/`), `node scripts/run-n6-suite.mjs` (N6). Do not run browser suites during consolidation without expecting `evidence/` churn (`research/evidence-policy.md:P-7`). Every L0 report is frozen; new evidence is new work (`research/evidence-policy.md:§3`).

## 11. Conclusion

The lab demonstrates a **mechanically checkable, geometry-deterministic safe subset** for graphical content associated with IIIF video Canvases **under explicit coordinate-system (R-S1) and same-aspect (R-S4/P5a) constraints**, browser-free verifiable today and reproducible identically in the tested three engines for the tested matrix.

It **does not** demonstrate universal consumer interoperability. For the tested versions and the tested `#t=10,20` Canvas-target case, **Ramp 5.1.1 did not honor** the temporal fragment when driven through its own Video.js playback surface (NOT-HONORED, valid drive, version- and case-scoped), and **Mirador 3.4.3 was experimentally unreachable** for temporal honoring (no consumer-owned AV control). Together with the independent finding that both consumers currently fail to render secondary painting bodies at all (N2), this establishes that **interoperability is conditional at the resource/geometry layer, not yet at the consumer layer**.

The profile therefore stays honestly conditional: it promises **publisher-side determinism** and **analytic-geometry predictability inside the subset** regardless of which compliant mechanism a future capable consumer chooses, and it explicitly promises **nothing** outside the subset — no mismatched-aspect fit, no z-order, no temporal honoring, no two-stage composition — until a specification or a capable implementation removes the need for a fence. That fence (R-S8b `[OPEN]` Predicate:None) is not a defect; it is the lab's way of keeping the boundary auditable.

## 12. Evidence and Reproducibility Map

| Capstone conclusion ( § ) | Canonical source owner | Evidence family / artifact (version scope) |
|---|---|---|
| Expressibility (full model permitted, draft-only superseded) | `research/findings.md` + `research/e16-report.md:§4` + `research/n4-safe-subset.md:Part1` | `public/manifests/{e14,e16}/*.json`, IIIF 3.0 §5.7 (stable) |
| R-S1 explicit viewBox deterministic | `research/e15-report.md:§4.2,§6` + `research/profile-draft.md:R-S1` | `evidence/e15/geometry-matrix.json`, `evidence/e17/summary.json` F1 (Chromium 151/Firefox 153/WebKit 26.5) |
| 62/62 tri-engine unanimous | `research/e17-report.md:20-31` | `evidence/e17/cross-engine-matrix.json` 62 rows × {chromium,firefox,webkit} |
| No-viewBox hazard | `research/e15-report.md:§4.1` + `research/profile-draft.md:X2` | `evidence/e15/case-*` + `evidence/e17:F2/F3` (engine-uniform) |
| Same-aspect safe subset P5a / R-S4 | `research/n4-safe-subset.md:Part2-3` + `research/profile-draft.md:Part7` | `evidence/e16/{landmark-spot-check.json Δ386.4, modeA-twins.json, cmp-*}` + `evidence/e17:F6` + recipe 0004 `research/community-positioning.md:§4` |
| Nested Canvas gap (no realizing consumer) | `research/viewer-interop-report.md:M1-M3/V7` + `research/e16-report.md:§4.2` | `evidence/viewer-matrix.json` Ramp 5.1.1 crash / Mirador 3.4.3 drop + `evidence/viewer/probe-*.json` |
| Temporal syntax normative | `research/profile-draft.md:R-S6a,R-S8a` + `research/community-positioning.md:§5` | MF REC §4.2.1 `[NORMATIVE]` + validator `evidence/n6/case-T06.json` |
| Temporal consumer NOT-HONORED (Ramp) | `research/experiment-log.md:27` #18 + `research/profile-draft.md:Part8B,R-S8b` | `evidence/viewer-interaction/viewer-interaction-matrix.json` + `probe-ramp-d1-temporal-run1/2.json` (Ramp 5.1.1 NOT-HONORED, Chromium 151, valid drive, delta 0.01) |
| Mirador INCONCLUSIVE/unreachable | same + `research/current-state-index.md:74` | `evidence/viewer-interaction/probe-mirador-d1-temporal-feasibility.json` (`hasConsumerPlaybackControl:false`) |
| Validator 15/15 resource-side | `research/n6-implementation-report.md` + `research/conformance-matrix.md:PartA` | `evidence/n6/{summary,conformance-matrix,case-T*.json}` (validator `n6-resource-validator@1.0.0`) |
| Temporal fence [OPEN] | `research/profile-draft.md:R-S8b,Part15#5` + `research/conformance-matrix.md:S8b/X7` | No predicate (by design); D1 cited as observation, not requirement |
| Community gaps (z-order, fit) | `research/community-positioning.md:§10` + `research/n3-source-index.json` | `research/n3-source-index.json` 11 sources; recipes 0036/0033 vs 0489 vs mirador#2607 |

All entries are traceable via `research/current-state-index.md` (L6) and `research/consolidation-map.md` (L0-L6, preservation constraints). This capstone is a new document, not a rewrite of any frozen record, and it invents no new vocabulary per `research/documentation-conventions.md:zero-new-labels`.

---

*End of capstone synthesis.*
