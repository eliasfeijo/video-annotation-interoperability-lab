# Experiment E16 — IIIF 4.0 Nested Canvas / Composition Semantics

Date: 2026-08-21
Status: complete (8 Model B fixtures × 3 renderers × 2 fit readings + 4 stable-IIIF-3 twins, browser-verified)
Depends on: e14-report.md (Model B machinery), e15-report.md (SVG embedding semantics), docs/iiif-3-vs-4.md

## 1. Question

Does IIIF Presentation 4.0 provide a sufficiently precise composition model for painting one
Canvas into another Canvas (or region)? Specifically:

1. Is the nested-Canvas model valid in the 4.0 **draft** and representable in stable **3.0**?
2. What exactly does "scaled to fit that region" mean?
3. Does nesting eliminate or merely relocate the SVG body coordinate ambiguity?

Mandatory framing: IIIF 4.0 is a DRAFT (`4.0.0-draft`); IIIF 3.0 is the stable version
(`3.0.0`). Every conclusion below carries that distinction.

## 2. Specification provenance (verified against current published text)

| Claim | Source | Exact wording (verified this session) |
|---|---|---|
| Containers can be painted into other Containers | 4.0 draft, "Nesting Containers" | "A Container can be painted into another Container as an Annotation with motivation 'painting'. For example … a Canvas may be painted into another Canvas … Multiple Containers may be hierarchically nested" |
| Scaling statement | 4.0 draft, Use Case 6 Key Points | "Both source Canvases are scaled. … The target property for painting the Folio image into the new Canvas therefore simply uses the Canvas id, and the client will fill the new Canvas with the source Canvas. The miniature Canvas target is a region of the new Canvas, and it is scaled to fit that region." |
| Canvas coordinates are not pixels | 4.0 draft, Use Case 1 / data model | "The Canvas dimensions establish a coordinate system for painting annotations …; they are not pixels of images." / height+width "convey an aspect ratio for the space in which content resources are located" |
| Painting order / z-index | 4.0 draft, Annotation Page | "Annotations are assigned an ascending z-index from the first annotation encountered … higher z-index will render in front" |
| Stable-3.0 nesting permission | **IIIF 3.0 §5.3 (stable)** | "Canvases may be treated as content resources for the purposes of annotating on to other Canvases. For example, a Canvas (Canvas A) with a video resource and Annotations representing subtitles or captions may be annotated on to another Canvas (Canvas B). This pattern maintains the correct spatial and temporal alignment of Canvas A's content relative to Canvas B's dimensions." |
| Stable-3.0 scaling duty | IIIF 3.0 §5.3 | "Renderers must scale content into the space represented by the Canvas" |

Consequence of rows 5–6: **E14's classification of Model B as "draft-only / not expressible in
stable IIIF 3.0" is superseded.** Stable 3.0 explicitly permits Canvas-as-body painting. What
the 4.0 draft adds is: the general Container abstraction, an explicit worked pattern with
`partOf` manifest linkage (Use Case 6), and the phrase "scaled to fit that region". Neither
version defines *which* fit.

The Use Case 6 example cannot disambiguate "fit": its miniature happens to be painted into a
region whose aspect relationship makes fill/contain indistinguishable in the prose (no target
region aspect vs canvas aspect conflict is exercised).

## 3. Method

Fixtures (`scripts/build-e16-fixtures.mjs`, `public/manifests/e16/`):

- Outer Canvas 1920×1080/30 s with video painting; overlay painting whose body is an Inner
  Canvas (`type:"Canvas"` + `partOf:[manifest]`, the draft's serialization).
- Inner Canvases: 1000×1000, 1920×1080, 640×480 — each containing TWO SVG paintings: one
  viewBox-bearing, one WITHOUT viewBox (ambiguity probe), landmark geometry per e15 contract.
- 8 Model B cases covering: same-aspect full + sub-region targets, 1:1→16:9, 4:3→16:9,
  16:9→1:1, square-region target, no-viewBox probe, temporal window.
- 4 Mode A twins (stable IIIF 3.0 context): the same overlay content expressed as DIRECT
  paintings at regions obtained by aspect-preserving (contain) mapping — what a 3.0-only
  publisher can ship today.
- Resolution: Renderer A (`src/reference/lib/e14.ts`), Blind (`src/blind/e14.ts`), Native
  (`src/native/resolver.ts`) — unchanged independent implementations — each under BOTH readings
  of "scaled to fit": `nestedFit:"fill"` and `nestedFit:"contain"`. Comparison harness
  `src/e16/comparison.ts` (analysis only) computes both fits' maps and composed landmarks.
- Browser verification: native `<img>` channel pixel probes (`tests/e2e/e16.spec.ts`).

Evidence: `evidence/e16/cmp-*__{fill,contain}.json`, `modeA-twins.json`,
`landmark-spot-check.json`, screenshots `evidence/screenshots/e16/`.

## 4. Results

### 4.1 Renderer agreement (within a fixed reading)

All three renderers agree record-for-record for every fixture under each reading — EXCEPT the
designed divergence: the no-viewBox inner SVG, where Renderer A synthesizes a viewBox while
Blind/Native read 1:1 (classification OPEN, identical to E14 case06/E15). Verdicts are
`a!=blind, a!=native, blind==native` on all 16 fixture×reading combinations, with every
individual diff classified OPEN. No new renderer disagreement appeared from composition itself.

### 4.2 "Scaled to fit" is genuinely ambiguous — and observable

| Case | inner → target | fill destination | contain destination | coincide? |
|---|---|---|---|---|
| case01/02 | 1920×1080 → full / 960×540 region | = contain | = fill | yes |
| case03 | 1000×1000 → full | 0,0,1920,1080 | 420,0,1080,1080 | **no** |
| case05 | 640×480 → full | 0,0,1920,1080 | 240,0,1440,1080 | **no** |
| case06 | 1920×1080 → 500² region | 710,290,500,500 | 710,399.375,500,281.25 | **no** |

Composed landmark spot-check (case03, tick at user (40,40)): fill lands it at Canvas x=76.8;
contain at x=463.2 — **386 Canvas units apart**. The specification does not select between
them ⇒ `[OPEN]` by construction; we did NOT silently pick one and test plausible readings
independently, as required.

### 4.3 NEW FINDING — browser leaf-PAR collapse (container-fit vs leaf-PAR precedence)

For aspect-mismatched compositions through the browser's real resource channel
(`<img src=svg>` inside the mapped region), Chromium does **not** realize the two-stage
composition:

- The no-viewBox leaf behaves as E15 predicts (bitmap-stretch of intrinsic canvas): the fill
  composition IS realized for that layer.
- The viewBox-bearing leaf re-applies its own `preserveAspectRatio` against the DESTINATION
  aspect: the square viewBox letterboxes INSIDE the fill-stretched container (measured frame
  bands at fractions ~0.02 AND ~0.15 of the width in case05; both present simultaneously in
  one rendered frame — see `evidence/screenshots/e16/case05-native.png`).

So even if a profile pinned "fill", a compliant-looking consumer that collapses composition
into its image pipeline would still produce contain-like geometry for viewBox leaves. The
draft defines neither the fit NOR this interaction ⇒ two stacked `[OPEN]`s. This is the
single strongest argument that a profile must constrain CONSUMER behavior, not just declare a
fit keyword.

### 4.4 Nested Canvas does not eliminate the SVG ambiguity — it relocates it

case07 (novb body inside a nested Canvas): the A-vs-blind/native placement divergence appears
inside inner space exactly as in direct Model A, scaled outward by whatever fit map is chosen.
Nesting adds a second transform ON TOP of the unresolved body mapping. Q7 answer: relocate,
not resolve.

### 4.5 What stable IIIF 3.0 can express today

Mode A twins reproduce the B-contain outcome exactly (destinations equal within rounding:
`modeA-twins.json`; e.g. case03 twin `420,0,1080,1080` == B-contain; case06 twin
`710,399,500,281` ≈ `710,399.375,500,281.25`). The fill outcome is also expressible in 3.0 by
pre-computing stretched target regions — but then each body's own viewBox mapping composes
differently (body meet vs region stretch), so a fill-twin changes the bodies or their targets
rather than reusing them. The genuine draft-only value is structural: the overlay remains ONE
independently addressable, independently annotated Canvas (`partOf` pulls its annotations
along) instead of duplicated flattened paintings.

## 5. Answers to the mandated question list

1. Valid under 4.0 draft? Yes — Nesting Containers + Use Case 6 serialize exactly our shape.
2. Representable under stable 3.0? Yes — §5.3 sentence quoted above; superseding E14's
   "draft-only" classification ([NORMATIVE] both, different explicitness).
3. What does IIIF say about scaling? Only "scaled to fit that region" (draft); 3.0 says only
   "renderers must scale content into the Canvas space".
4. Does "scaled to fit" mean fill/contain/cover/PAR? Undefined. Measured candidates diverge up
   to 386 Canvas units for our fixtures.
5. Does the target region establish the coordinate system? Implicitly yes in both versions
   (fragments are "in the Canvas coordinate space"); the fit INTO it is the undefined part.
6. Are Canvas coordinates distinct from source pixels? Explicitly yes (4.0); derived in 3.0.
7. Does nested Canvas eliminate the SVG body ambiguity? No — relocates it (case07).
8. New ambiguity introduced? Yes — fit rule (undefined) + leaf-PAR/container-fit precedence
   (browser-measured, undefined).
9. Browser-native agreement? Partial: resolvers agree; the actual `<img>` pipeline collapses
   composition and overrides container fit via leaf PAR (§4.3).
10. Blind vs Renderer A convergence? Converge everywhere except the inherited no-viewBox
    reading; no code shared (`src/blind/*` imports nothing from `src/reference/*`).

## 6. Classification summary

| Rule | Provenance |
|---|---|
| Canvas-as-body painting allowed | [NORMATIVE] in BOTH 3.0 stable and 4.0 draft |
| `partOf` manifest linkage for outer references | [NORMATIVE] draft pattern; workable convention under 3.0 |
| Processing order / z-index across pages | [NORMATIVE] 4.0 ("first annotation encountered"); [DERIVED] under 3.0 |
| "Scaled to fit" = fill vs contain vs cover | [OPEN] — spec silent, outcomes measurably differ |
| Container-fit vs leaf-SVG-PAR precedence | [OPEN] + [BROWSER] — collapse measured in Chromium |
| Inner-canvas temporal propagation from outer target | [DERIVED] (both versions silent; all renderers agree) |
| no-viewBox body inside nest | [OPEN] inherited from E15 |

## 7. Reproduce

```
node scripts/build-e16-fixtures.mjs
pnpm test                                   # includes tests/e16-comparison.test.ts (writes evidence/e16)
pnpm exec playwright test tests/e2e/e16.spec.ts
```
