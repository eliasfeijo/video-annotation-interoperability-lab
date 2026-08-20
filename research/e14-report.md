# Experiment E14 — Painting Composition & SVG Resource Semantics

Date: 2026-08-20
Status: complete (fixtures generated, three renderers compared, browser + viewer verification, evidence archived)
Depends on: findings.md (Exp 1–11), blind-renderer-report.md, iiif-3-vs-4.md, ambiguities.md

## 1. Question

Can existing standards express a *temporal graphical overlay composed on top of video* without
inventing a new annotation vocabulary, when the overlay is **composed** (multiple painted
resources, nested canvases, non-SVG bodies) and the painting body is a **resource with its own
rendering semantics** (an `image/svg+xml` body whose SVG uses or omits a `viewBox`)?

Three candidate models, compared record-for-record by three independent renderers:

| Model | Structure | Status of the semantics |
|-------|-----------|------------------------|
| **A** | IIIF 3.0 Canvas + direct `painting` of each body (SVG / PNG / TextualBody) into the Canvas (optionally into a `xywh` region with a `t` window) | NORMATIVE (IIIF 3.0 + W3C Web Annotation + Media Fragments) |
| **B** | IIIF 4.0 DRAFT nested *Overlay Canvas* painted as a Content Resource into a region of the main Canvas | **DRAFT only** — IIIF 4.0 "Containers as Content Resources" / "Nesting Containers" / Use Case 6 |
| **C** | W3C Web Annotation with a video `target` and `FragmentSelector`(s) | NORMATIVE (W3C) but with **no defined painting/composition semantics** |

Deliverables: this report, machine-readable evidence under `evidence/e14/`, unit + semantic
comparison tests (`tests/e14-comparison.test.ts`), browser E2E tests (`tests/e2e/e14.spec.ts`),
and a Ramp viewer probe (`tests/e2e/viewer.spec.ts`).

## 2. Method

16 case fixtures (built by `scripts/build-e14-fixtures.mjs`) exercise: temporal + spatial
targeting, unit forms (`pixel:` default, `percent:` normative, `pct:` convention), viewBox vs
no-viewBox SVG bodies, preserveAspectRatio variants, PNG and TextualBody bodies, multi-resource
z-order, multiple AnnotationPages, invalid/out-of-bounds spatial fragments, nested Overlay
Canvases (full + sub-region + temporal), and SVG security payloads. Each fixture is resolved by
three semantically independent renderers:

- **Renderer A** (`src/reference/lib/e14.ts`) — existing Renderer A logic; synthesizes a viewBox
  from `width`/`height` when a body has none (reference convention).
- **Blind Renderer** (`src/blind/e14.ts`) — SVG-as-image reading: a body without a viewBox is
  painted 1:1 (user units == region units), `preserveAspectRatio` ignored (SVG 1.1 §7.8);
  classifies + rejects unsafe SVG.
- **Native Renderer** (`src/native/resolver.ts` + `src/native/stage.ts`) — renders bodies through
  the browser's `<img>` pipeline (SVG-as-image / Image Content Resource), the true semantic of an
  IIIF `Image` body.

The comparison harness (`src/e14/comparison.ts`) aligns overlays by `(startTime, zIndex)` and
classifies each divergence by provenance (NORMATIVE / DERIVED / CONVENTION / OPEN /
IMPLEMENTATION_GAP / VIEWER_GAP).

## 3. Results (evidence: `evidence/e14/summary.json`, per-case `evidence/e14/e14-case*.json`)

### 3.1 Agreement

**35 of 39 fixture×renderer sets resolved identically across all three renderers** (`a==blind`,
`a==native`, `blind==native`): all temporal/spatial cases, unit forms, viewBox-meet/slice/none
geometries, PNG and TextualBody bodies, z-order and multi-page cases, and all nested-canvas
(Model B) fixtures.

### 3.2 Designed divergences (all classified)

| Fixture | Divergence | Classification |
|---------|-----------|----------------|
| case06/07 (`a`,`c`) | SVG body **without viewBox**: Renderer A synthesizes a viewBox and fits; blind & native read 1:1. | **OPEN** (SVG-as-image) |
| case13 | out-of-bounds / invalid `xywh`: Renderer A keeps the fragment (paints, clipped); blind & native treat the fragment as absent → full resource | **NORMATIVE** (Media Fragments §6.2 ambiguity) |
| case16 | unsafe SVG: Renderer A renders unconditionally; blind rejects; native classifies then renders via the `<img>` sandbox | **CONVENTION** / **IMPLEMENTATION_GAP** |

case06/07 (`b`) — the nested-canvas variants — agree everywhere because the inner canvases use
viewBox-bearing SVGs, isolating the no-viewBox question to Model A/C.

### 3.3 Empirical browser findings (`tests/e2e/e14.spec.ts`, `evidence/observations/e14-*.json`)

**Finding 1 — the SVG-as-image prediction is falsified in the `<img>` embedding context (case06).**
Chrome's default replaced-element sizing (`object-fit: fill`) **stretches the SVG's intrinsic
canvas into the region box**, placing a no-viewBox circle centred on the region (Canvas 960,540)
rather than mapping user units 1:1 from the region origin (Canvas 980,770). Pixel probes:

| Renderer | Probe (940,500) | Probe (980,770) | Reading |
|----------|-----------------|-----------------|---------|
| blind (nested `<svg>`, no viewBox) | grid (20,20,20) | red (206,17,17) | 1:1 user units |
| Renderer A (nested `<svg>`, synthesized viewBox) | red (206,17,17) | grid (20,20,20) | fit |
| native (`<img>`, default object-fit) | red (206,17,17) | grid (20,20,20) | intrinsic stretched to region |

So the browser's `<img>` behavior matches Renderer A's *scale-to-region* result at the circle
centre, **not** the blind 1:1 reading. The 1:1 reading is only reproducible under `<img>` by
explicitly choosing `object-fit: none; object-position: left top`. The manifest cannot express
which embedding the consumer must use ⇒ **VIEWER_GAP**: "the region is the SVG viewport" (the
interpretation the blind renderer encodes, SVG 1.1 §7.2) is an *embedding-context* rule that
`<img>` does not implement.

**Finding 2 — `percent:` is the normative Media Fragments unit and Renderer A did not parse it.**
Renderer A's `parseSpatial` only stripped the `pct:` convention alias, so
`xywh=percent:25,25,50,50` (case03) silently fell back to the full canvas. Fixed
(`src/reference/lib/selectors.ts`) to accept `percent:` and `pixel:` (MF §4.2.2). This is a
reference-implementation bug the three-way comparison exposed, not a standards gap.

**Finding 3 — `<img>` intrinsic sizing for viewBox-only SVG is browser-specific.**
Chrome reports `naturalWidth` 267 × 150 for `e14-shapes.svg` (viewBox 1920×1080, no width/height)
— CSS default sizing (height 150) with the width derived from the viewBox aspect ratio
(`evidence/observations/e14-case14-b-native-intrinsic.json`). A body's *intended* region size is
not recoverable from the SVG alone.

**Finding 4 — the `<img>` sandbox is a platform behavior, not a manifest policy (case16).**
Under `<img>`, script/foreignObject/event-handlers are inert; the native renderer renders a
classified-unsafe SVG (recorded decision `render` with level `unsafe`), while the blind renderer
rejects it. Both are defensible; neither is expressible in the manifest. ⇒ **IMPLEMENTATION_GAP**:
SVG security policy cannot be declared in IIIF/W3C Web Annotation.

**Finding 5 — Model B is draft-only and unstable-viewer-invisible.**
The nested Overlay Canvas is not expressible in stable IIIF 3.0 (a Canvas is not a Content
Resource there). Ramp (stable IIIF 3.0 AV player) throws on `e14-case14-b.json`
("Cannot set properties of undefined (setting 'id')") — `evidence/observations/viewer-e14-case14-b.json`.
⇒ **VIEWER_GAP** + a draft-only dependency.

**Finding 6 — Model C has no composition semantics.**
W3C Web Annotation defines `body` + `target` + selectors but no painting motivation, no z-order
rule, and no spatial frame beyond the media's own dimensions. The lab therefore applied
conventions (z-order = annotation order; spatial frame = probed video dimensions; render SVG at
the region). These are the same conventions Renderer A and the blind renderer encode, which is
why Model C *fixtures* agree — the standards themselves leave all three open.

## 4. NORMATIVE vs CONVENTION vs GAP classification

| Aspect | Classification | Basis |
|--------|---------------|-------|
| `t=` half-open window | NORMATIVE | Media Fragments §4.2.1 |
| `xywh=` spatial, pixel + `percent:` | NORMATIVE | Media Fragments §4.2.2 (fixed in Renderer A, Finding 2) |
| `pct:` alias | CONVENTION | lab accepts it; not in the spec |
| invalid / out-of-bounds fragment | **NORMATIVE ambiguity** | §6.2 "SHOULD ignore" vs §6.1.2 clipping; keep-annotation vs fall-back-to-resource |
| Canvas + `painting` (Model A) | NORMATIVE | IIIF 3.0 §5.3 |
| region = SVG viewport (no-viewBox SVG) | **OPEN** (falsified under `<img>`, Finding 1) | SVG 1.1 §7.2 vs CSS replaced-element sizing |
| viewBox → region (meet/slice/none) | NORMATIVE | SVG 1.1 §7.7/§7.8 (agreed by all renderers) |
| nested Overlay Canvas (Model B) | NORMATIVE **only in IIIF 4.0 draft** | draft "Nesting Containers", Use Case 6 |
| nested inner-canvas → region mapping (fill) | DERIVED; "contain" variant OPEN | draft says "scaled to fit that region" |
| Model C z-order / painting | CONVENTION | W3C Web Annotation silent |
| Model C spatial frame | DERIVED | consumer must probe media dimensions |
| SVG security policy | IMPLEMENTATION_GAP | `<img>` sandbox is platform, not manifest (Finding 4) |
| Viewer support for SVG bodies / nested canvases | VIEWER_GAP | Ramp crashes on both (Finding 5, viewer matrix below) |

## 5. Viewer compatibility matrix

| Manifest | Ramp (stable IIIF 3.0 AV) |
|----------|---------------------------|
| Plain time-based video Canvas (`viewer-plain.json`) | **Plays** |
| Same Canvas + SVG painting annotation (`exp1.json`) | **Fails** (React error boundary; no video) |
| Nested Overlay Canvas, IIIF 4.0 draft (`e14-case14-b.json`) | **Fails** (`Cannot set properties of undefined (setting 'id')`) |
| Model C (Web Annotation Collection) | Not applicable — Ramp is an IIIF manifest player, not a Web Annotation renderer |

## 6. Coordinate-transformation analysis

For a body into a region of an N×M Canvas (`R = (rx,ry,rw,rh)`), the three renderers compute:

| Body SVG | Renderer A | Blind | Native (`<img>`) |
|----------|-----------|-------|------------------|
| has `viewBox` + PAR | `viewBox → R` per PAR (meet/slice/none) | same | same (browser applies PAR inside intrinsic box, then object-fit) |
| has `viewBox`, no PAR | meet (SVG §7.8 default) | meet | meet |
| no `viewBox`, w/h given | synthesize `viewBox` from w/h → fit (**CONVENTION**) | 1:1 into R | **intrinsic stretched to R** (object-fit fill) |

The no-viewBox row is the crux: three different results, and the browser `<img>` default does not
match the nested-`<svg>` 1:1 reading. The user→canvas map for the agreed viewBox cases is
`canvas = R.origin + PAR-offset + scale·(user − viewBox.min)`, where `scale` = min/max of
`(rw/vbw, rh/vbh)` for meet/slice. For no-viewBox 1:1 it is `canvas = R.origin + user`. The
renderers' resolved placements are compared field-by-field in `src/e14/comparison.ts`.

## 7. SVG resource semantics analysis

An IIIF `Image` body with `format: image/svg+xml` is an **Image Content Resource**, whose only
defined consumer contract is "render it" (IIIF 3.0 §5.3). Which rendering is "correct" is
unspecified for:

- **viewBox absence** — 1:1 into the region (nested-`<svg>` reading, blind) vs intrinsic-scaled
  into the region (`<img>` default, native) vs synthesized-viewBox (Renderer A). **OPEN**;
  empirically `<img>` ≠ nested-`<svg>`.
- **intrinsic sizing** — Chrome's CSS-default 267×150 for a viewBox-only SVG (§7.12 default
  sizing is viewer-dependent). Recorded, not spec'd.
- **security** — SVG active content is inert under `<img>` but live under `innerHTML`/inline
  embedding; no manifest-expressible policy. IMPLEMENTATION_GAP.

## 8. Direct vs nested Canvas (Model A vs Model B)

| | Model A (direct painting) | Model B (nested Overlay Canvas) |
|---|---|---|
| Spec status | IIIF 3.0 (stable) | IIIF 4.0 draft only |
| Composition unit | one Canvas, N painting annotations | explicit inner Canvas as its own addressable document |
| Expresses | multi-resource z-order, regions, windows | a reusable, independently-versioned overlay layer |
| Rendered geometry (this lab) | identical (fill mapping) | identical (fill mapping) |
| Viewer support | fails in Ramp (SVG body) | fails in Ramp (4.0 draft) |
| Recommendation | use now | use only when layering/reuse of overlays matters and a draft dependency is acceptable |

All three renderers produce byte-identical geometry for the Model B fixtures (the inner canvas is
scaled by `(rw/iw, rh/ih)` into the region, then inner bodies resolve inside inner space) —
evidence `e14-case14-b/-reg/-15`.

## 9. Updated architecture recommendation

1. **Model A for production** — stable, agreed-by-all-renderers for everything except the
   no-viewBox SVG case.
2. **Eliminate the no-viewBox ambiguity** by requiring every SVG painting body to declare an
   explicit `viewBox` (and a `preserveAspectRatio` when letterboxing matters). This is the single
   highest-value interoperability rule: it turns the OPEN/Falsified case into the agreed
   viewBox-meet case. Document it as a lab convention (CONVENTION) in the interpretation packet.
3. Adopt the **`percent:`** unit (normative), keep `pct:` only as a legacy alias.
4. Treat **out-of-bounds/invalid spatial fragments** as absent-fragment (full resource) and
   record the §6.2 reading in the packet, since Media Fragments is ambiguous.
5. **Do not rely on SVG-as-image 1:1** across viewers; if the intent is "SVG fills the region",
   say so via viewBox semantics, not by omitting the viewBox.
6. Adopt **Model B only behind a draft flag**; never for systems that must interoperate with
   stable IIIF 3.0 clients.
7. Keep **security as a renderer policy**: sanitize/reject at the consumer; do not assume the
   `<img>` sandbox (inline embedding is a live-SVG context).
8. For **Model C**, document the conventions (z-order, spatial frame, painting-as-overlay) in the
   interpretation packet; they are application-level, not normative.

## 10. Remaining gaps

- **SVG-as-image embedding semantics** (GAP): no normative statement maps an Image Content
  Resource's SVG to a Canvas region; `<img>` and nested-`<svg>` disagree. Needs a spec note
  (IIIF FAQ / errata) or an explicit convention.
- **Media Fragments §6.2** ambiguity (invalid/out-of-bounds): "ignore the fragment" vs "ignore
  the annotation".
- **SVG security policy** cannot be declared in-manifest (IMPLEMENTATION_GAP).
- **Model B** draft-only; nested-canvas *contain* variant is OPEN (only `fill` is exercised here).
- **TextualBody / PNG** rendering is convention-only (no painting geometry semantics in W3C).
- **Viewers**: no stable IIIF AV player renders SVG painting bodies or nested canvases
  (VIEWER_GAP, Ramp).

## 11. Recommendation for the next experiment

**E15 — SVG-as-image disambiguation.** One small, high-value experiment: take case06 and render
the same manifest through a matrix of consumer embeddings (`<img>` with object-fit
fill/contain/none; nested `<svg>`; CSS background-image; `<object>`) and record the resolved
geometry per embedding. This turns the OPEN/no-viewBox finding into a quantitative viewer matrix
and can motivate either a spec erratum or a lab convention (require viewBox). Secondary: E16
could test the `contain` variant of the nested-canvas mapping (currently OPEN).

## 12. Reproduce

```
node scripts/build-e14-fixtures.mjs     # regenerate fixtures
pnpm test                                # 125 unit tests incl. tests/e14-comparison.test.ts
pnpm run check                           # tsc --noEmit
pnpm exec playwright test tests/e2e/e14.spec.ts tests/e2e/viewer.spec.ts
```

Evidence: `evidence/e14/summary.json` + `evidence/e14/e14-case*.json`,
`evidence/observations/e14-*.json`, `evidence/screenshots/e14/*.png`.