# Experiment E15 — SVG Embedding Semantics

Date: 2026-08-21
Status: complete (176-cell embedding matrix measured in Chromium, evidence archived)
Depends on: e14-report.md (Finding 1: `<img>` falsified the 1:1 no-viewBox reading), ambiguities, open questions #9

## 1. Question

Is SVG painting geometry **deterministic independently of the embedding mechanism** — and if
not, is the ambiguity eliminable by requiring an explicit `viewBox`?

E14 left this open: one manifest resolved to three geometries depending on whether the consumer
embedded the SVG body as nested `<svg>` (1:1 user units), Renderer A's synthesized viewBox
(fit), or `<img>` (intrinsic stretched). E15 turns that single observation into a quantitative
matrix.

## 2. Method

- 10 deterministic SVG variants (identical landmarks: red frame `#f00`, blue centre circle
  `#00f`, green corner ticks; recorded per file in `public/svg/e15/e15-landmarks.json`):
  - A `viewBox="0 0 1000 1000"`, B `viewBox="0 0 1920 1080"` (both with matching width/height),
  - C/D same sizes with **no viewBox**, plus PAR variants (`xMinYMin meet`, `xMidYMid slice`,
    `none`) of A and B.
- 4 target regions on a 1920×1080 Canvas (also published as Media Fragments in
  `public/manifests/e15/e15-manifest.json`): full canvas; `xywh=480,270,960,540`;
  `xywh=710,290,500,500`; non-16:9 `xywh=100,100,800,600`.
- 8 embedding mechanisms: two canvas-space nested-`<svg>` modes (body attrs intact vs region as
  viewport — the lab renderer stages' convention), `<img>` default/`fill`/`contain`/`none`,
  `<object data>`, CSS `background-image` (`no-repeat`, `left top`).
- Each cell is rendered at K = 0.25 css px per Canvas unit and screenshot-measured by pixel-mask
  comparison against analytically rasterized candidate interpretations (tolerance score ≥ 0.8
  with 3 px dilation for anti-aliasing).

Evidence: `evidence/e15/summary.json`, `case-<variant>--<region>.json`,
`geometry-matrix.json`, `intrinsics.json`, `screenshots/`. Harness: `src/e15/page.ts`
(measurement infrastructure only), spec `tests/e2e/e15.spec.ts`.

## 3. Candidate interpretations

| Name | Reading | Source |
|------|---------|--------|
| I-REGION-VIEWPORT | Target region is the SVG viewport; viewBox fitted per preserveAspectRatio; without viewBox user units = region units from the origin | SVG 1.1 §7.2, §7.7–§7.10; IIIF 3.0 §5.3 "scale content into the Canvas space" |
| I-INTRINSIC-STRETCH | The intrinsic canvas (width/height attrs, SVG 1.1 §7.12) is scaled onto the region like a bitmap (non-uniform under fill) | CSS Images 3 §4.3.1 + §4.5 `fill`; observed Chromium behavior |
| I-OBJECTFIT-CONTAIN | Concrete object size = natural size contained & centered; intrinsic canvas mapped onto it | CSS Images 3 §4.4–§4.5 |
| I-NATURAL-CENTERED | object-fit none: natural size, centered, clipped | CSS Images 3 §4.5 |
| I-NATURAL-TOPLEFT | Content at natural size anchored at box origin (naive insertion / background-size:auto) | SVG 1.1 §7.9/§7.12; CSS Images 3 §4.3.1 |

## 4. Results (Chromium, Playwright)

Full matrix: `evidence/e15/geometry-matrix.json`. Headline pattern:

### 4.1 No-viewBox bodies resolve to THREE different geometries

For C/D across every region:

| Mechanism | Winning interpretation |
|-----------|------------------------|
| svg-nested-region (lab stages) | I-REGION-VIEWPORT (1:1) |
| img-default / img-fill | **I-INTRINSIC-STRETCH** |
| img-contain / img-none | I-OBJECTFIT-CONTAIN / I-NATURAL-CENTERED (CSS-normative letterboxing of the stretched canvas) |
| object | document semantics (viewport = element box, 1:1) |
| background / svg-nested-attr | I-NATURAL-TOPLEFT |

The same resource therefore paints different Canvas geometry depending on which component the
consumer uses — reproducing and generalizing E14 Finding 1.

### 4.2 Explicit viewBox restores determinism among region-painting mechanisms

For A/B and all PAR variants, `img-default`, `img-fill` and `svg-nested-region` agree with
I-REGION-VIEWPORT everywhere they are distinguishable (cells labelled `ambiguous(...)` are cases
where two interpretations coincide numerically, e.g. aspect-matched regions — not measurement
uncertainty). With a viewBox present, Chromium's `<img>` pipeline establishes the viewport at
the concrete object size and applies preserveAspectRatio — exactly the nested-`<svg>` reading.
`img-contain`/`img-none` add their own CSS-level contain/centering, but that behavior is
[NORMATIVE] CSS and identical in any conforming consumer, so geometry remains predictable.

Mechanisms that never claimed to paint into a region (`background-image`, unmodified attribute
insertion) draw at natural size and ignore the region — they are simply out of scope for
region-painting and must be excluded by profile rather than fixed.

### 4.3 Browser intrinsic reporting follows SVG 1.1 §7.12

`evidence/e15/intrinsics.json`: naturalWidth/Height equal the width/height attributes for all
variants (1000×1000, 1920×1080). Combined with §4.1 this explains the stretch: the browser owns
a well-defined intrinsic size and treats the image accordingly when no viewBox overrides the
coordinate mapping.

## 5. Classification of key rules (required format)

**R1 — Region-painting via `<img>` with explicit viewBox**
SOURCE: SVG 1.1 §7.7/§7.8 (viewBox↔viewport mapping, PAR); CSS Images 3 §4.5 note ("SVG uses the given size as the size of the 'SVG Viewport'").
WHAT THE SOURCE ACTUALLY SAYS: the concrete object size becomes the SVG viewport; the root element's attributes determine drawing within it; PAR aligns viewBox to that viewport.
OUR INTERPRETATION: an `<img>`-embedded painting body with viewBox resolves identically to a region-as-viewport nested `<svg>`.
EXPERIMENTAL RESULT: confirmed in all 40 distinguishable viewBox cells (`geometry-matrix.json`).
INTEROP IMPLICATION: `[NORMATIVE]` — requiring a viewBox makes `<img>` consumers agree with SVG-native consumers.

**R2 — No-viewBox `<img>` stretches the intrinsic canvas**
SOURCE: SVG 1.1 §7.12 (intrinsic sizing); CSS Images 3 §4.5 `fill`.
WHAT THE SOURCE ACTUALLY SAYS: percentage/omitted width-height give no intrinsic size; `fill` sizes content to the element's content box. Neither states how user units map when the viewport differs from intrinsic dimensions.
OUR INTERPRETATION: the spec does not force a unique answer; Chromium chooses bitmap-like stretching.
EXPERIMENTAL RESULT: I-INTRINSIC-STRETCH wins every novb img-default/fill cell (16/16).
INTEROP IMPLICATION: `[BROWSER]` — the blind renderer's 1:1 rule (SVG 1.1 §7.9/§7.10 reading) is NOT what browsers do through `<img>`; the disagreement is real and mechanism-dependent ⇒ `[OPEN]` at the standards level.

**R3 — `<object>` preserves SVG document semantics**
SOURCE: HTML embedded-content model; SVG 1.1 §7.9 (document establishes its own viewport).
WHAT THE SOURCE ACTUALLY SAYS: an `<object>` hosts a full SVG document, whose root establishes its viewport per its own attributes/CSS.
OUR INTERPRETATION: `<object>` behaves like the naive-document reading, not like `<img>`.
EXPERIMENTAL RESULT: object cells match the document reading (indistinguishable pair REGION-VIEWPORT==NATURAL-TOPLEFT because attrs==viewBox in our variants).
INTEROP IMPLICATION: `[BROWSER]`/`[VIEWER]` — even "same resource type", different elements disagree; only a profile-level requirement can pin consumer behavior.

**R4 — CSS letterboxing mechanisms are normative and consistent**
SOURCE: CSS Images 3 §4.5 (contain/none definitions).
WHAT THE SOURCE ACTUALLY SAYS: exact constraint algorithms for contain/none/cover.
OUR INTERPRETATION: these mechanisms are predictable, but they ADD a transform on top of any SVG-internal mapping.
EXPERIMENTAL RESULT: I-OBJECTFIT-CONTAIN / I-NATURAL-CENTERED win 32/32 relevant cells.
INTEROP IMPLICATION: `[NORMATIVE]` — deterministic, but only if the profile fixes which object-fit a consumer must use; otherwise still a fork.

**R5 — background-size:auto never scales natural-dimension images**
SOURCE: CSS Images 3 §4.3.1 default sizing algorithm.
WHAT THE SOURCE ACTUALLY SAYS: with auto/auto and natural dimensions present, concrete size = natural size.
OUR INTERPRETATION: backgrounds cannot express "paint into region" without author-supplied background-size; excluded from the painting profile.
EXPERIMENTAL RESULT: I-NATURAL-TOPLEFT wins all background cells.
INTEROP IMPLICATION: `[NORMATIVE]`, and a reason to exclude CSS-background consumers from the profile rather than accommodate them.

## 6. Falsification verdict on the proposed profile rule

> "Every SVG painting body MUST contain an explicit viewBox."

**Verdict: NOT falsified — strengthened, with one scope condition.** The rule removes the only
*unpredictable* fork (R2): with an explicit viewBox, every mechanism that paints into a region
produces identical, spec-derived geometry (R1). The residual differences (R3/R4/R5) come from
mechanisms that either don't implement region-painting at all or apply additional *normative*
CSS transforms; they must be handled by a second, companion rule — "the consumer shall render
SVG painting bodies through a mechanism equivalent to region-as-viewport (nested `<svg>` or
`<img>` with object-fit such that the targeted region is the SVG viewport)" — not by changing
the SVG requirement. Requiring viewBox alone is sufficient to eliminate ambiguity *among
compliant region-painting consumers*, which is what a IIIF/WebAnnotation profile can actually
specify. Provenance of the rule itself: `[CONVENTION]` (profile), built entirely on
`[NORMATIVE]` primitives.

## 7. Uncertainty

- Single browser engine (Chromium via Playwright), per session scope. R2's browser-dependence
  label would need Firefox/WebKit runs to become a cross-engine claim.
- Variants carry width/height attrs equal to their viewBox (the common authoring case);
  viewBox-only resources inherit E14 Finding 3's separate intrinsic-sizing weirdness and were
  deliberately not re-matrixed here.
- Tolerance-based mask scoring (≥0.8, dilation 3px) can theoretically conflate placements closer
  than ~6css px (24 Canvas units); all decisive cells won with scores ≥0.86 against competing
  interpretations separated by far more.

## 8. Consequences for the lab

1. Adopt into the interpretation packet: **SVG painting bodies MUST declare a viewBox**
   (`[CONVENTION]`, evidence-backed), plus the companion region-as-viewport rendering rule.
2. Renderer A's synthesized-viewBox fallback and Blind's 1:1 fallback remain useful as probes,
   but both now sit behind the profile line; fixtures keep exercising them.
3. The lab-wide `/yMid/i` regex bug discovered during calibration (vertical centering silently
   disabled in all placement implementations since E1) is fixed in
   `src/reference/lib/svg.ts`, `src/reference/lib/e14.ts`, `src/blind/placement.ts`,
   `src/native/resolver.ts`; see experiment-log bug-fix #13.
4. Open question #9 (embedding semantics) → answered; superseded by the companion-rule wording
   above. Open question #10 (nested-canvas contain) remains → E16.
