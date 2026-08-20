# Open Questions

Things this lab could not settle with the current evidence. Each is a candidate follow-up,
mostly because the deciding data point lives in another browser, viewer, or community
document.

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
    `fit` presets were exposed but not exhaustively verified pixel-wise.