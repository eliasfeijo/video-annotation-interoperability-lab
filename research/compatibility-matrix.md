# Compatibility Matrix

What the standard stack (Web Annotation + Media Fragments + IIIF Presentation 3 + SVG)
covers for portable temporal graphical video annotations, based on the evidence in
`evidence/`. `S` = supported by the tested stack (probed), `G` = gap (needs application
convention or non-standard extension), `B` = browser/environment dependent.

| Dimension | Mechanism used | Std? | Result | Notes / evidence |
|-----------|----------------|------|--------|------------------|
| Overlay on video | Painting Annotation, SVG `Image` body (`image/svg+xml`) | S | S | Renderer A generic path; exp1–7 |
| Time window | `FragmentSelector` `t=start,end` (Media Fragments) | S | S | Half-open `[start,end)` convention, tested at boundaries (exp1) |
| Temporal without end | `t=start` only | S | S | `parseTemporal` handles single value (unit-tested) |
| Combined temporal+spatial | `xywh=…&t=…` | S | S | exp4 `region-timed` |
| Spatial targeting (px) | `xywh=x,y,w,h` | S | S | exp4 regions 0,0 and 960,540 |
| Spatial targeting (%) | `xywh=pct:x,y,w,h` | S | S | exp4 `pct:50,0,25,25` (after canvas-dim threading fix) |
| Layer order | AnnotationPage item order | S | S | exp3 DOM order == z-order |
| Canvas arbitrary size | Canvas width/height | S | S | exp1–7 (1920×1080; 480×360 validated) |
| Duration | Canvas `duration` (and body `duration`) | S | S | exp1…; Ramp consumed the video Canvas |
| Body coordinate space | SVG `viewBox` + `preserveAspectRatio` | S | S | Predictable `meet` behavior (exp5) |
| SVG user space == Canvas space | Convention: paint body into region per `meet` | G | S* | *Our chosen interpretation; identify + test. exp4/5 |
| Letterbox / aspect ratio | Overlay sized to *displayed* content rect | — | S | exp6: invariant at (960,540) across 4 viewport shapes |
| Non-16:9 page windows | CSS viewport presets | — | S | exp6 (4:3, narrow, wide) |
| Movement / animation | None | G | G | exp7 external keyframe file is NON-STANDARD; SMIL unobserved in injected SVG |
| Keyframes (experimental) | `extension: "experimental-keyframes"` manifest | G | G | Marked explicitly non-standard |
| Text rendering | SVG `<text>`/`<tspan>` | S | B | Deterministic metrics unavailable cross-browser/font (exp9) |
| Deterministic text | Outline `<path>` surrogate | S | S | `text-outlined.svg` (exp9) | 
| Untrusted SVG | Allowlist sanitizer | — | S | Rejects script/foreignObject/a/image/filter/style, `on*` (exp8) |
| Inline script execution | — | — | S | `innerHTML`-injected `<script>` does not execute (exp8) |
| Official spec conformance | IIIF Presentation 3 manifest | S | S | 10/10 fixtures `okay:1`, 0 warnings (exp10) |
| Mainstream viewer (video) | Ramp (`@samvera/ramp`) | S | S | Loads/plays plain video Canvas locally (exp11) |
| Mainstream viewer (SVG overlay) | Ramp | S* | G | Playable structure *permitted*; viewer throws on Image/SVG painting body (exp11) |

### Legend / honesty notes

- The row "SVG user space == Canvas space" is marked `G` for *portability*: the spec does not
  mandate it; we made it an explicit, tested interpretation so consumers can agree. This is
  the single most important interop convention the experiment surfaced.
- "Movement / animation" has no standard vocabulary in the model under test; both alternatives
  (in-SVG SMIL and external keyframes) have portability problems — SMIL due to browser
  execution, keyframes due to being non-standard.
- Rendering of SVG bodies in deployed viewers (right-hand column, last row) is the largest
  remaining gap between "the data structure is valid" and "humans can see the overlay".

### Suggested profile (if this were a product, NOT currently part of any standard)

1. Painting SVG bodies on a video Canvas use `format: "image/svg+xml"`.
2. Time windows are half-open; targets use Media Fragments (`t=`, `xywh=` with `pct:` allowed).
3. The body SVG is painted into the targeted Canvas region using `meet`; default target is the
   whole Canvas.
4. Z-order follows AnnotationPage item order.
5. Body text that must be reproducible should be outline path surrogates.
6. Untrusted annotations are sanitized with an allowlist.