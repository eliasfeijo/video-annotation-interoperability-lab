# Experiment Log — Video Annotation Interoperability Lab

Session date: 2026-08-20. Harness: Vite + Vitest + Playwright (Chromium), Node 26,
pnpm, TypeScript 7 strict. FFmpeg 9 for the deterministic test video.

Guide: each row = one falsifiable question. `evidence/` holds the machine output.

## Experiments

| # | Name | Question | Method (fixtures) | Pass? | Evidence |
|---|------|----------|-------------------|-------|----------|
| 1 | Temporal static overlay | Does `t=` window an SVG overlay correctly? | exp1: `t=10,15`, red circle | ✅ | `observations/exp1.json`, `screenshots/exp1/t={9,10,12,15,16}.png` |
| 2 | SVG primitives | Do standard SVG shape/attr primitives render through the compositor? | exp2: path, line, polyline, polygon, rect, circle, ellipse, text + tspan, fill/stroke/opacity/stroke-width/linecap/linejoin/transforms | ✅ | `observations/exp2.json`, `screenshots/exp2/exp2-primitives.png` |
| 3 | Multiple paintings / z-order | Does AnnotationPage item order act as z-order? | exp3: 4 stacked graphics (yellow rect, red circle, arrow, text) | ✅ | `observations/exp3.json`, `screenshots/exp3/exp3-layers.png` |
| 4 | Spatial targeting (`xywh=`, `pct:`, `&t=`) | Does targeted painting reproduce pre-positioned (Renderer B) geometry? | exp4: 4 regions incl. `pct:50,0,25,25` and `xywh=0,540,960,540&t=10,20` | ✅ (after bug-fix) | `observations/exp4.json`, `screenshots/exp4/exp4-renderer{A,B}.png` |
| 5 | Coordinate systems | Is body-`viewBox` handling predictable? | exp5a/b/c: identical circle in `1920x1080`, `1000x1000`, `64x36` viewBox | ✅ | `observations/exp5.json` (as `parity-5a/b/c`), `screenshots/exp5/5{a,b,c}-viewbox.png` |
| 6 | Aspect ratio / letterboxing | Does the overlay track the *displayed* content rect across viewport shapes? | exp6: 16:9, 4:3, narrow, wide viewports | ✅ (after fix) | `observations/exp6.json`, `screenshots/exp6/epx6-16-9/4-3/narrow/wide.png` |
| 7 | Temporal movement | Can an external (non-standard) keyframe timeline move an overlay deterministically? | exp7 + `exp7-keyframes.json` (NON-STANDARD extension); compare with SVG `<animate>` | ✅ (linear model) / ⚠ SMIL unobserved | `observations/exp7.json`, `screenshots/exp7/*.png` |
| 8 | SVG security | What does an allowlist sanitizer strip, and does raw SVG execute script? | exp-security: dangerous + clean payloads, sanitize on/off | ✅ | `observations/security.json`, `screenshots/security/sanitized-{on,off}.png` |
| 9 | Text determinism | Are `<text>` glyph boxes measurable; is outline-path a deterministic surrogate? | exp-text: latin/arabic/tspspan/monospace + hand-drawn stroke word | ✅ (partial) | `observations/text.json` |
| 10 | IIIF validation | Do standard fixtures pass the official validator? | POST of 10 manifests to `presentation-validator.iiif.io` | ✅ (`okay:1`, 0 warnings) | `observations/iiif-validation.json` |
| 11 | Third-party viewer | Can a mainstream IIIF AV player consume the manifests? | Ramp (`@samvera/ramp` UMD from unpkg) against local manifests | ✅ video loads / ❌ SVG-body annotation crashes player | `observations/viewer-{plain,svg-annotation}.json`, `screenshots/viewer/*.png` |
| 14 | Painting composition & SVG resource semantics | Can composed overlays (SVG/PNG/TextualBody, nested Overlay Canvas, Web Annotation) be expressed and resolved identically by independent renderers, incl. the browser's real `<img>` semantics? | e14-case01..16 `{a,b,c}` fixtures × Renderer A + Blind + Native (`<img>`) + Ramp probe | ✅ 35/39 renderer sets identical; 3 designed divergences classified | `e14/summary.json`, `e14/e14-case*.json`, `observations/e14-*.json`, `screenshots/e14/*` |

## Bug-fix log (implementation-side discoveries)

1. **exp6/CSS** — `.ar-*` aspect classes were inert: `#viewport` (id selector, specificity
   1-0-0) outranked `.viewport.ar-*` (0-2-0). Base rule changed to `.viewport`.
2. **exp4/pct** — `parseTarget` called `parseFragmentValue` without canvas dimensions, so
   `xywh=pct:50,0,25,25` was parsed as absolute px (25 px instead of 25%). Threaded canvas
   width/height through.
3. **exp6 measurement** — Chromium reports content-bbox for nested `<svg>` via
   `getBoundingClientRect`; region now computed from declared viewport × overlay rect.
4. **exp7 fixture** — helper `S()` keeps only the first arg, silently dropping keyframes 2–3.
5. **exp7 window** — dot window was `t=10,20`; half-open semantics make t=20 invisible;
   widened to `t=10,25`.
6. **exp3 colors** — fills are translucent; pixel expectations updated to blended values.
7. **exp2 fixture** — contained no `<tspan>` (asserted one); added a tspan text block.
8. **manifest naming** — main.ts fetched `exp<id>.json`; `text`/`security` fixtures are
   `exp-text.json`/`exp-security.json`. Vite SPA-fallback served `index.html` → JSON parse
   error. Added a name map.
9. **snapshot vs seek race** — `snapshot()` could run before `applyAt`; it now applies the
   time before measuring visibility.
10. **e14/percent unit** — Renderer A `parseSpatial` only stripped `pct:` (IIIF convention), not
    the normative `percent:`/`pixel:` prefixes (MF §4.2.2); `xywh=percent:…` fell back to the
    full Canvas. Fixed in `src/reference/lib/selectors.ts` (case03).
11. **e14/object-fit** — the native `<img>` stage's default `object-fit: fill` stretches a
    no-viewBox SVG's intrinsic canvas into the region, falsifying the 1:1 reading under `<img>`
    (case06, `evidence/observations/e14-case06-native.json`). 1:1 needs explicit
    `object-fit: none`.
12. **e14/viewer intrinsic** — Chrome reports `naturalWidth` 267×150 for a viewBox-only SVG
    (CSS default sizing); a body's intended region size is not recoverable from the SVG alone
    (case14-b).

## Test totals (final)

- Unit (Vitest): **125 passing** (`selectors`, `timing`, `svg`, `iiif`, `e14-comparison`).
- E2E (Playwright, Chromium): **35 passing** across exp1–7, exp4 regions, parity (1,2,3,5a,
  5b,5c,6,7), security, text, viewer, e14 (8), e14 viewer (1).
- `tsc --noEmit`: clean.