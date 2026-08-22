# Open Questions

Things this lab could not settle with the current evidence. Each is a candidate follow-up,
mostly because the deciding data point lives in another browser, viewer, or community
document.

Status legend: **OPEN** / **ANSWERED (session, see link)** / **SUPERSEDED**.

9. **SVG-as-image embedding semantics (E14).** — **ANSWERED by E15**
   (`research/e15-report.md`). The matrix showed three coexisting readings across mechanisms
   for no-viewBox bodies and full agreement for explicit-viewBox bodies among
   region-painting mechanisms. Replaced by profile rules P1/P2 in the final report; residual
   browser-dependence tracked as new question N1.
10. **Nested-canvas `contain` mapping (E14 Model B).** — **REFINED/SUPERSEDED by E16.**
    "Scaled to fit that region" defines NO algorithm: fill AND contain are both plausible and
    measurably divergent; the question is now the broader OPEN fit-rule item plus a new
    leaf-PAR/container-fit precedence sub-question (`research/e16-report.md` §4.2–4.3).
    Same-aspect targets make all readings coincide (interoperable subset).
11. **Nested-canvas viewer support (E14).** Still open as stated (Ramp), with the correction
    that representability is NOT draft-only (stable 3.0 §5.3 permits Canvas-as-body).

New questions from E15/E16:

12. **N1 — Cross-engine replication [OPEN].** Every `[BROWSER]` row in the compatibility
    matrix is Chromium-only. Re-run the E15 core matrix + E16 leaf-PAR collapse probes in
    Firefox/WebKit. Candidate E17.
13. **N2 — Two-stage composition in deployed viewers [OPEN].** Does any real consumer
    pre-composite an inner Canvas (honoring container fit) rather than collapsing through an
    image pipeline? Survey/probe; decides whether profile rule P2 can name concrete safe
    mechanisms.
14. **N3 — Community positioning of P1/P2 and the fit question [OPEN].** Candidate IIIF AV
    cookbook/FAQ issue: (a) recommend explicit viewBox on painting bodies; (b) ask for a
    normative sentence resolving "scaled to fit". Evidence packets:
    `evidence/e15/`, `evidence/e16/modeA-twins.json`.
15. **N4 — Same-aspect-safe subset adoption [OPEN].** Would restricting nested overlays to
    target aspect == inner Canvas aspect (P5a) cost any real use case? Needs one worked
    example set (e.g., letterboxed cinematic overlays) before deciding.

Historic items below unchanged.

1. **Coordinate-system profile.** We chose "paint the body SVG into the targeted region using
   `meet`" as the spatial interpretation. Does the IIIF/Web-Annotation community already
   converge on this (or an alternative, e.g. "user space == canvas space") for
   time-based-media candidates? A small reference implementation survey would settle it.
2. **SVG `<animate>`/SMIL parity.** Our compositor did not observe SMIL updates in
   dynamically injected SVG. Is this a Chromium behavior, an artifact of our insertion point,
   or general? Re-test in Firefox/WebKit and with the SVG added at initial parse time.
3. **Movement vocabulary.** If temporally moving overlays are required, where should the
   timeline live so it is portable? (a) SVG-internal SMIL, (b) an exported animated SVG, (c) an
   external timeline (as exp7), (d) repeated annotations with per-`t` renders (pure
   standards-compliant but clunky). This is an open design question, explicitly NOT solved here.
4. **Viewer support.** Ramp throws on an Image/SVG painting body on a video Canvas. Would a
   Mirador 3 / AV-presence or a fixed Ramp support it? Is this a bug to file, or a
   by-design scope limit?
5. **Font determinism.** How far off are outline-path surrogates for real annotation pipes
   (editing → review → render)? Is there an existing SVG/text-profile convention (e.g.
   WhatsApp/OpenAPI-like "text as path") to reuse?
6. **Half-open window semantics.** We standardized on `[start, end)`. Is there any ecosystem
   precedent (e.g. Media Fragments, range conventions) that dictates otherwise at the `t=END`
   boundary?
7. **`pct:` vertical semantics.** We treat `pct:` percentages against Canvas width for `x`/`w`
   and Canvas height for `y`/`h` (per Media Fragments). Confirm with a second implementation to
   catch any library divergence.
8. **Sanitizer completeness.** Our allowlist covers parse-time payloads. `foreignObject`-hosted
   HTML + CSS selectors like `circle { display:none }` were removed; test newer attack surfaces
   (e.g. SVG `href`, `allowReorder`, `style` on nested elements, base64 data URIs).
9. **Scale/performance.** Could not test large numbers of simultaneous annotations (this lab is
   single-scene); per-frame layout cost of thousands of overlays is unknown.
10. **`cover`/`fill` fit modes.** We default to `contain`; other `preserveAspectRatio` modes and
    `fit` presets were exposed but not exhaustively verified pixel-wise. (E15 now covers the
    SVG-level PAR variants pixel-wise for region-painting mechanisms; CSS object-fit cover
    remains unprobed — deliberately excluded as out-of-profile.)