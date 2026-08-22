# Viewer Interop Report — N2 Real-Consumer Survey/Probe

Date: 2026-08-22
Plan: `research/next-session-plan.md` Stage 2 (PRIORITY 2a). Empirical consumer experiment —
NOT a standards interpretation exercise. Every claim below is tied to a recorded probe row in
`evidence/viewer-matrix.json` (+ raw rows in `evidence/viewer/probe-*.json`, screenshots in
`evidence/screenshots/n2/`).

Consumers exercised (real third-party bundles loaded from unpkg in-browser; our renderers not
involved):

| Consumer | Version (resolved redirect) | Harness |
|---|---|---|
| Ramp (`@samvera/ramp`) | **5.1.1** | `public/viewer-check.html` (existing) |
| Mirador 3 | **3.4.3** | `public/mirador-check.html` (new, smoke-level) |

Engine: Chromium 151.0.7922.34 (Playwright 1.62.1). Browser behavior was established
cross-engine in E17; this stage isolates the CONSUMER variable.

## Methodology

Controlled stable-IIIF-3 manifests are served locally; each probe loads one manifest into the
real consumer bundle and captures: parse/render outcome, error-boundary text, `<video>` state,
and a full DOM inventory (`video/img/svg/canvas/object`) with bounding boxes and resource URLs.
Content-overlay candidates are distinguished from UI chrome by resource reference (UI icons ship
as inline `<svg>` with empty `src`). Expected interpretations were fixed before observation.
No conclusion is drawn from anything not captured in the evidence rows.

## Probe matrix

| Probe | Manifest | Distinguishes | Observed outcome |
|---|---|---|---|
| R-V1 | `viewer-plain.json` (video only) | consumer baseline | video renders + plays (readyState 4) `[CONSUMER]` |
| R-V2 | `n2-temporal.json` (`#t=10,20` on Video body) | temporal targeting honored? | parses; video at t=0 paused after capture AND after 3 s — **no observable seek-to-start** `[CONSUMER]`+`[UNKNOWN]` |
| R-V3 | `n2-spatial.json` (`#xywh=…` on Video body) | spatial-fragment parser robustness | parses without failure `[CONSUMER]` |
| R-V4 | `n2-svg-vb.json` (explicit-viewBox SVG @ region) | E15 geometry through consumer | **error boundary: "Cannot set properties of undefined (setting 'id')"**, no video rendered `[VIEWER_GAP]` |
| R-V5 | `n2-svg-novb.json` (no-viewBox SVG @ region) | viewBox dimension observable? | **identical error boundary to V4** → dimension unobservable `[VIEWER_GAP]` |
| R-V6 | `n2-raster.json` (PNG Image body) | SVG-specific vs any overlay body | **identical error boundary** → gap covers ANY secondary painting Image body `[VIEWER_GAP]` |
| R-V7 | `e16-case03-sq-full-a.json` (stable-3 Canvas-as-body) | nested Canvas consumption | **identical error boundary** `[VIEWER_GAP]` |
| M-M1 | `viewer-plain.json` | Mirador AV feasibility | workspace mounts; real `<video>` with local mp4 `[CONSUMER]` |
| M-M2 | `n2-svg-vb.json` | SVG body geometry via Mirador | video renders; **SVG annotation silently dropped** — zero fixture-referencing overlay elements `[CONSUMER]`+`[VIEWER_GAP]` |
| M-M3 | `e16-case03-sq-full-a.json` | nested Canvas via Mirador | video renders; **inner Canvas body silently dropped** `[CONSUMER]`+`[VIEWER_GAP]` |

Run counts: dedicated suite `playwright.n2.config.ts` → **10/10 passed** (pass = harness ran and
captured; outcomes themselves are data, not pass conditions).

## Answers to the mandated questions

1. **What does Ramp actually do with explicit-viewBox region geometry?**
   Nothing observable — it never reaches geometry. Ramp 5.1.1 throws during render
   ("Cannot set properties of undefined (setting 'id')"), tears down the player (no `<video>`
   remains), and shows its error boundary. No geometric reading (region-as-viewport or
   otherwise) is realized. `[VIEWER_GAP]`.

2. **What does Ramp actually do with no-viewBox resources?**
   Exactly what it does with explicit-viewBox resources: the same crash, byte-identical error
   text. Within this consumer the P1 dimension (explicit viewBox vs not) is unobservable — both
   fail identically before any paint. `[VIEWER_GAP]`; no discrimination possible.

3. **Does Ramp reproduce the E16 leaf-PAR collapse?**
   Untestable on two independent grounds: SVG bodies crash (V4/V5) AND the pre-composed stable-3
   nested-Canvas twin crashes (V7). The collapse phenomenon is a browser-pipeline behavior
   (`[BROWSER]`, tri-engine per E17); Ramp never reaches the pipeline that would exhibit it.
   Question stays `[OPEN]` for consumers.

4. **Does Ramp introduce a consumer-specific interpretation?**
   Not an interpretation — a hard failure. For plain video + fragments it parses cleanly
   (temporal and spatial MediaFragment URIs accepted), but no fragment application was observable
   in the captured state (currentTime stayed 0; playback autoplay-blocked), so fragment HONORING
   remains `[UNKNOWN]` for Ramp under this probe design. The failure signature is identical
   across four different body types, suggesting one unsupported-body code path rather than four
   distinct bugs — but that is inference, marked as such, not an observed mechanism.

5. **Can Mirador 3 provide comparable evidence?**
   Yes, at smoke level, and it behaves DIFFERENTLY from Ramp. Mirador 3.4.3 mounts the
   workspace, renders the AV canvas with a real `<video>`, and survives every adversarial
   manifest — but it **silently drops** unsupported bodies: zero DOM elements referencing our SVG
   fixture (M2) and zero elements for the inner Canvas body (M3). So comparable probes ARE
   feasible; today's answer for overlay geometry is also "not rendered", reached by graceful
   omission instead of crash.

6. **Which observations are [CONSUMER] only?**
   All of Section "Probe matrix" outcomes. Specifically: Ramp's hard-failure on secondary bodies;
   Mirador's silent dropping; both consumers' video-only rendering paths; the absence of
   observable temporal seek in Ramp. None of these say anything about what standards require or
   what browsers do — those live in E15–E17 (`[BROWSER]`, `[NORMATIVE]`, `[DERIVED]`).

7. **Which previous [OPEN] questions remain open?**
   - Community positioning of P1/P2 and the fit rule (N3) — untouched here.
   - Whether ANY deployed consumer realizes region-as-viewport or nested composition: still none
     found (Ramp crashes, Mirador drops) — strengthens, but does not close, open question #4/#13.
   - Temporal/spatial fragment honoring by consumers — now measured as unobserved-in-capture,
     still `[OPEN]` (needs interaction-level probes).
   - Leaf-PAR collapse in a two-stage consumer — `[OPEN]`, currently untestable (see #3).
   - Fit-rule semantics ("scaled to fit") — unaffected by N2.

8. **Does N2 justify changing any P1–P6 ranking?**
   No. N2 produced zero geometric readings, so there is nothing that could confirm OR refute
   P1/P2/P5 at consumer level. The profile stands exactly as E17 left it. What N2 adds is scope:
   the deployment blocker for graphical overlays on AV canvases in these two mainstream
   consumers is broader than previously recorded — it covers ANY secondary painting body (raster
   included), not just SVG (Ramp), and manifests as either crash (Ramp) or silent drop
   (Mirador). Per the standing rules this disagreement with the historical framing ("Ramp throws
   on Image/SVG painting body") is preserved as a REFINEMENT of the viewer-gap row, not a change
   to the profile.

## Limitations (explicit)

- Single engine (Chromium) by design: consumer isolation; browser variables were settled in E17.
- Ramp/Mirador are unpkg "latest" bundles pinned only by resolved version strings recorded per
  run; re-runs may pick up newer releases (versions are machine-recorded in every row).
- Fragment-honoring probes are passive; interaction-level verification (driving the consumers'
  own UI) was out of scope and is required before claiming honoring or non-honoring.
- Mirador integration is deliberately smoke-level; annotation-panel inspection was not attempted.
- The Ramp failure text is version-dependent; only the 5.1.1 behavior is claimed.

## Historical-evidence cross-check

`tests/e2e/viewer.spec.ts` (E11/E14 era) recorded Ramp throwing on exp1's SVG annotation. N2
reproduces that class of failure on unpinned-latest Ramp 5.1.1 and EXTENDS it: raster Image
bodies and stable-3 Canvas-as-body fail identically. No historical test was modified; the new
scope lives entirely in `evidence/viewer-matrix.json`.
