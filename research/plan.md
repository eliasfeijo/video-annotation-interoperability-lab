# Research Plan — Video Annotation Interoperability Lab

Date: 2026-08-20

## Research question

Can W3C Web Annotation + Media Fragments + IIIF Presentation (Canvas/Painting) + SVG
already represent portable, temporal, graphical overlays on video — **without inventing a
new annotation vocabulary**?

This session actively tries to falsify the hypothesis:

> Web Annotation (temporal + spatial selectors) + IIIF Canvas/Painting semantics +
> Media Fragments + an SVG painting body is sufficient to describe and render
> time-segmented graphical overlays on video.

## Observation model / architecture

A single small Vite page (`index.html`) hosts:

1. `<video>` element (deterministic synthetic test video).
2. An SVG overlay layer positioned exactly over the *displayed* video content.

Two renderers are implemented side-by-side:

- **Renderer A (standards-oriented)**: parses a IIIF Presentation 3.0 manifest generically.
  It derives Canvas dimensions/duration, AnnotationPage, Painting Annotations, target
  temporal selector (`t=...`), target spatial selector (`xywh=...`), and the SVG body.
  No experiment coordinates are hardcoded in the renderer.
- **Renderer B (direct reference)**: takes a deliberately simple internal representation
  described below. It is **not** proposed as a standard.

```ts
type ReferenceOverlay = {
  startTime: number;   // seconds, inclusive
  endTime: number;     // seconds, exclusive
  zIndex: number;      // paint order
  svg: string;         // SVG text, pre-positioned in canvas space
};
```

Both renderers produce a `ResolvedOverlay[]` (id, time window, z-order, SVG, canvas
region) through the same DOM/SVG compositing machinery. Automatable comparison
(`sameResolved`) decides whether Renderer A carried "enough information" to reproduce
Renderer B's result.

### Semantic interpretation being tested (the "viewport" hypothesis)

An SVG painting body is treated like an image painted into the canvas region selected by
the annotation's `xywh` target (defaulting to the whole canvas). The SVG's own `viewBox`
defines its user space; `preserveAspectRatio` + nested `<svg>` semantics control how it
fits the region. `t=` defines the active time window. AnnotationPage item order defines
z-order. This is a **hypothesis to be falsified**, not an assumption.

## Pipeline under test

```
Manifest -> Canvas -> AnnotationPage -> Painting Annotation
  -> target -> temporal/spatial selection -> SVG body -> composite over video
```

## Experiments

1. **Temporal static overlay** — one red circle, visible 10–15s. Screenshots at 9/10/12/15/16s.
2. **SVG primitives** — path, line, polyline, polygon, rect, circle, ellipse, text, tspan,
   marker/arrow, fill/stroke/opacity/stroke-width/linecap/linejoin/transforms. Record which
   render correctly / depend on browser.
3. **Multiple painting annotations / layering** — yellow rect, red circle, arrow, text as
   separate annotations; test whether AnnotationPage order serves as z-order.
4. **Spatial targeting** — `xywh=...` alone and `xywh=...&t=...`. Document the distinction
   between *target region*, *canvas coordinate system*, and *SVG user coordinates*.
5. **Coordinate systems** — same overlay in viewBox `1920x1080`, `1000x1000`, and a third
   arbitrary system; decide whether "SVG user space == Canvas space" should be a profile rule.
6. **Aspect ratio** — same annotation at 16:9, 4:3, narrow, or wide viewport; inspect
   `preserveAspectRatio` and video/Canvas/SVG/CSS dimension interplay.
7. **Temporal movement** — experimental keyframes **outside** SVG (`10s→x=100`, `15s→x=300`,
   `20s→x=600`); compare conceptually with SVG `<animate>`. Not a proposed standard.
8. **SVG security** — allowlist vs reject-list inspection; document which restrictions are
   justified by security/determinism/interoperability/simplicity.
9. **Text** — `<text>`/`<tspan>` vs outlined path text; font determinism tradeoffs.
10. **IIIF validation** — official Presentation Validator output for all fixtures.
11. **Third-party viewer** — attempt to load a time-based media manifest in an existing IIIF
    viewer; record viewer-vs-model failure distinction explicitly.

## Deterministic test video

`1920x1080`, 30 s, 30 fps, H.264 (`libx264`), yuv420p, no audio. Synthetic FFmpeg pattern
with grid, axis labels, central crosshair, four corner markers, PTS timestamp. Exact command
documented in `scripts/generate-video.mjs` and `research/findings.md`.

## Tooling

- Node 20+ (26 available), pnpm, TypeScript, Vite, Vitest, Playwright (Chromium), FFmpeg.
- No Next.js/React/database/backend/Docker/auth/cloud/Chrome-extension code.

## Success / honesty criteria

- Do **not** invent standard semantics; any non-standard extension is explicitly labelled
  experimental.
- Validation failures, viewer failures, and ambiguities are **evidence**, not bugs.
- Verdict is one of A–E from the mission brief, written in `research/findings.md`.