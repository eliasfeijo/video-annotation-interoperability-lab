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
| 15 | SVG embedding semantics | Is SVG painting geometry deterministic independently of the embedding mechanism? Does requiring an explicit viewBox eliminate the ambiguity? | 10 SVG variants × 4 regions × 8 embedding mechanisms = 176 cells, pixel-mask measured against named interpretations; intrinsics probe; IIIF manifest fixture for region provenance | ✅ viewBox ⇒ agreement among region-painting mechanisms; no-viewBox ⇒ 3 coexisting readings (`[BROWSER]`+`[OPEN]`); profile rule P1 strengthened | `evidence/e15/summary.json` + `case-*` + `geometry-matrix.json` + `intrinsics.json`, `screenshots/e15/`; `research/e15-report.md` |
| 16 | IIIF nested-Canvas composition | Does IIIF 4.0 give precise Canvas-into-Canvas composition semantics ("scaled to fit")? Stable-3 expressibility? Does nesting resolve the SVG ambiguity? | 8 Model B fixtures × 3 renderers × {fill,contain} + 4 stable-IIIF-3 Mode A twins; browser pixel probes for aspect-mismatched cases | ✅ representable in STABLE 3.0 (supersedes E14 claim); fit rule `[OPEN]` (386-unit divergence measured); NEW: leaf-PAR collapse in `<img>` channel `[BROWSER]`; nesting relocates (not resolves) SVG ambiguity | `evidence/e16/cmp-*__{fill,contain}.json` + `modeA-twins.json` + `landmark-spot-check.json`, `screenshots/e16/`; `research/e16-report.md` |
| 17 | N1 cross-engine replication (Chromium/Firefox/WebKit) | Do the `[BROWSER]`-classified E15/E16 rows hold beyond Chromium? | Minimal adversarial subset: E15 core cells (vb/novb × square500/rect43/half; min/max/none/slice PAR) × 6–7 embeddings via mask classifier (E15-verbatim thresholds); E16 native-channel probes (case01/03/05/06/07); per-engine intrinsics; dedicated runner `playwright.e17.config.ts` | ✅ 62/62 matrix rows UNANIMOUS across engines; all E16 probes unanimous; intrinsics identical incl. attribute-less SVG; leaf-PAR collapse reproduces in FF+WK; zero divergences | `evidence/e17/{summary,cross-engine-matrix,intrinsics-*,case-*}.json`, `screenshots/e17/<engine>/`; `research/e17-report.md` |
| 18 | D1 interaction-level temporal probe (Chromium) | Does Ramp 5.1.1 honor #t=10,20 when driven through its own playback surface (vs plain control)? Mirador 3.4.3 feasibility | Ramp 5.1.1 + Mirador 3.4.3, Chromium 151.0.7922.34 (Playwright 1.62.1), dedicated runner `playwright.consumer-probe.config.ts` (testMatch consumer-(probe|interaction)), fixtures `n2-temporal.json` (#t=10,20) vs `viewer-plain.json`, valid stimulus `.vjs-big-play-button` click (Video.js/Ramp control) → player seek/play → observed `currentTime`/`paused`/`timeDisplay`, 2 runs/fixture + settled 2s liveness, no direct media-element writes | ✅ Ramp **NOT-HONORED** (temporal settled 2.66, 2.64 vs control 2.63, 2.64 delta 0.01, valid drive via consumer control, `hasMediaFragmentInSrc:false`) — `[CONSUMER]` drove playback but ignored fragment; Mirador **INCONCLUSIVE/unreachable** (no consumer-owned playback control; native `controls:true` only) | `evidence/viewer-interaction/viewer-interaction-matrix.json` + `evidence/viewer-interaction/probe-ramp-d1-*.json` + `evidence/viewer-interaction/probe-mirador-d1-temporal-feasibility.json`, `evidence/screenshots/viewer-interaction/*`; runner `tests/e2e/consumer-interaction.spec.ts` |

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
13. **E15/lab-wide PAR regex** — `/yMid/` and `/yMax/` never matched valid SVG align tokens
    (`xMidYMid` capitalizes the Y part), silently disabling vertical centering in EVERY
    placement implementation (reference svg.ts + e14.ts, blind placement.ts, native
    resolver.ts) since E1. Never triggered because earlier fixtures used aspect-matched
    regions or xMin*/none variants. Exposed by E15 square-region cells where browser truth
    disagreed with all four implementations simultaneously. Fixed with case-insensitive match
    in all five sites.
14. **E16/target serialization conformance** — resolvers read only W3C-style `target.source`
    and object-form `partOf`; IIIF serializes targets as the Canvas object itself
    (`target: {id, type}`) and `partOf` as an ARRAY (Use Case 6). Both input forms now
    accepted by all three independent resolvers (same normalization, no shared code).
15. **e15 harness calibration** (measurement infra, not renderers): mask scoring needed
    clip-aware rasterized comparison (bbox heuristics break on corner-clipped circles);
    HTML-context embeddings live in element-css space while canvas-space embeddings live in
    Canvas units (`EMBEDDING_SPACE`).
16. **E17/case05 harness race** (measurement infra): the E16-derived row-scan probe applied the
    target time only via the URL `t=` param and screenshotted after image load without a
    re-apply. Chromium/WebKit painted fast enough to mask this; Firefox's slower decode/paint
    pipeline rasterized a pre-applyAt state → empty magenta runs (initially looked like a
    browser divergence). Fixed in `tests/e2e/e17.spec.ts` by explicit `seek(t)` + settle frames
    AFTER `waitImgsLoaded`; Firefox then reproduced Chromium/WebKit fractions exactly
    (0.0196, 0.1483). The historical `e16.spec.ts` carries the same latent pattern but is
    frozen (Chromium-only by design); not modified. Lesson recorded: cross-engine probes must
    re-apply time after resource load, never rely on load-order timing.

## Test totals (after E15/E16)

- Unit (Vitest): **147 passing** (previous 125 + 22 E16 comparison tests).
- E2E (Playwright, Chromium): **61 passing** excluding network-dependent `viewer` specs
  (previous suite + 24 E15 + 5 E16). Viewer specs unchanged from E14 (require network).
- `tsc --noEmit`: clean.