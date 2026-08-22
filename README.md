# Video Annotation Interoperability Lab

A small, local research/prototyping repository that tests whether
**W3C Web Annotation + Media Fragments + IIIF Presentation (Canvas/Painting) + SVG**
can express portable, temporal, graphical video annotations **without a new annotation
vocabulary**.

The experiment actively attempts to **falsify** that hypothesis. Verdict and evidence:
see [`research/findings.md`](research/findings.md) (summarised below).

## TL;DR

- A deterministic synthetic video is annotated via real IIIF Presentation 3 manifests whose
  bodies are SVG paintings targeted by Media Fragments (`t=`, `xywh=` incl. `pct:`).
- Two renderers (standards-driven "A"; direct-reference oracle "B") lower to one model and
  composite through one DOM/SVG stage. Resolved-set parity is clean for exps 1,2,3,5a/b/c,6,7;
  geometric parity for exp4 (< 2.5 canvas units).
- All 10 standard fixtures pass the **official IIIF Presentation Validator**
  (`okay:1`, 0 errors, 0 warnings).
- A real third-party AV player (**Ramp**) plays our video Canvas locally — and throws when an
  SVG painting annotation rides the same Canvas (a documented viewer gap, not a spec gap).
  Later consumer probes ([`research/viewer-interop-report.md`](research/viewer-interop-report.md))
  refined this: the Ramp 5.1.1 failure covers ANY secondary painting body (raster included),
  while Mirador 3.4.3 silently drops such bodies.
- **Initial-cycle verdict: B** — the standard stack is sufficient for portable, time-segmented,
  spatially-targeted graphical overlays with explicitly enumerated gaps (movement over time,
  font/tool determinism, SMIL reliability, viewer compositing).
- Current position, open items, and governance docs:
  [`research/current-state-index.md`](research/current-state-index.md).

## Layout

```
index.html                     page harness
src/reference/lib/iiif.ts      Renderer A: generic IIIF Presentation 3 resolver
src/reference/lib/selectors.ts Media Fragments parser (t=, xywh=, pct:)
src/reference/lib/timing.ts    half-open time windows
src/reference/lib/svg.ts       SVG root attr parsing + placement math
src/reference/lib/sanitize.ts  allowlist SVG sanitizer
src/reference/renderers/       Renderer B oracle (rendererB.ts) + stage (dom.ts)
src/blind/                     independent Blind renderer (interpretation-packet-driven)
src/native/                    Native renderer (browser <img> pipeline semantics)
src/e14/ … src/e17/            per-experiment comparison/analysis harnesses
src/n6/                        N6 resource conformance validator
src/experiments.ts             per-experiment Renderer-B references + parity compare
src/main.ts                    browser harness exposing window.__lab
public/manifests/*.json        IIIF Presentation 3 fixtures (exp1..7, text, security)
public/svg/*.svg               experiment bodies + Renderer-B oracles
public/video/…mp4              deterministic test video (see scripts/)
public/viewer-check.html       Ramp (third-party viewer) host page
scripts/generate-video.mjs     deterministic video generator (FFmpeg)
scripts/build-fixtures.mjs     SVG + manifest generator
tests/                         Vitest (unit) and Playwright (E2E) suites
evidence/                      screenshots + machine observations produced by tests
research/                      plan, findings, log, compatibility matrix, open questions;
                               consolidation/governance docs start at current-state-index.md
docs/                          interpretation packet, blind-era reports, ambiguities ledger
```

## Quick start

```sh
pnpm install
pnpm exec playwright install chromium     # once
pnpm gen:video      # rebuild the test-grid MP4 (requires FFmpeg)
pnpm gen:fixtures   # rebuild SVG bodies + IIIF manifests
pnpm dev            # http://localhost:5173 (/?exp=1..7&renderer=a|b)
pnpm test           # unit suite (37 tests as of the initial cycle; later totals recorded in research/)
pnpm exec playwright test   # E2E suite (writes evidence/); network needed for `viewer` specs
pnpm run check      # tsc --noEmit
```

The E2E suite (including the two `viewer` specs) generates all screenshots and observation
JSON in `evidence/`.

## Honesty rules followed

- Nothing new is invented and labelled "standard". The only non-standard artifact is
  `exp7-keyframes.json`, which is explicitly labelled **experimental** (a timeline outside
  SVG), and the Renderer-B oracle which is documented as the deliberately-simple reference.
- Validation failures, viewer limitations, and implementation bugs found during the session are
  recorded as **evidence**, not hidden. See the fixes log in
  `research/experiment-log.md`.

## Manifests, at a glance

| Fixture | What it proves | Body/selector |
|---------|----------------|---------------|
| exp1 | temporal windowing `t=10,15` | circle |
| exp2 | SVG primitives incl. text/tspan | shapes |
| exp3 | overlay layering/z-order | 4 stacked graphics |
| exp4 | spatial targeting `xywh=` (+ `pct:` + `&t=`) | circle in 4 regions |
| exp5a/b/c | body viewBox scaling | circle, three viewBoxes |
| exp6 | aspect-ratio/letterbox tracking (reuses exp1) | circle |
| exp7 | movement: NON-STANDARD external keyframes + SMIL comparison | moving dot |
| text | `<text>` vs outline-path determinism | text |
| security | allowlist sanitizer behavior | clean + dangerous payloads |

## License

[MIT](LICENSE). This is a research artifact: MIT maximises reuse of the methods,
fixtures, evidence and reference code so the IIIF / Web Annotation community can
build on it without legal friction. Apache-2.0 would add an explicit patent grant
(and more compliance overhead) if the project ever produced patentable method
claims; today it does not. Copyleft licenses were deliberately avoided because the
whole point of the project — standards interoperability — depends on unencumbered
reuse across viewers and tools.