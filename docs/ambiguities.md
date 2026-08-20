# Ambiguities and Designed Differences (Blind vs Reference)

Status: findings from the blind-renderer comparison (Cases 1–13).

This document records every point where the Blind Renderer and Renderer A
(the reference) disagree or could disagree, the provenance class of each, and
which side each renderer takes. Evidence: `evidence/blind-comparison/*.json`.

The comparison is **semantic**: it diffs the same body's landmarks (where user
space lands in Canvas space), time windows, z-order and destination regions —
not raw pixels. A verdict of `match` means both renderers resolve the same
visual layout from the same manifest.

---

## 1. Placement of an SVG body with no `viewBox` (Case 11b) — GENUINE GAP

- **Question.** A body SVG has `width="1000" height="1000"`, no `viewBox`, and
  targets a 960×540 region. Where does the content land?
- **Blind Renderer** (`no-viewBox-1to1`): SVG §7.3/§7.10 — no `viewBox` means
  user units equal viewport units (1:1). Content is drawn at region-relative
  coordinates, unscaled. It writes **no** `viewBox` attribute on the nested
  element, so the browser applies the 1:1 rule.
- **Renderer A**: synthesizes `viewBox="0 0 1000 1000"` and applies the default
  `xMidYMid meet` fit, so the 1000×1000 square is scaled down and centered in
  the region (a letterboxed crop).
- **Provenance.** SVG's 1:1 rule is `[NORMATIVE]`. IIIF's "Renderers must scale
  content into the space represented by the Canvas" (§5.3) admits a
  "scale to fill" reading that contradicts it. The packet marks the
  no-viewBox mapping `[OPEN]` (§11); the two renderers picked opposite sides.
- **Verdict.** `difference:no-viewBox-placement`. Not resolvable from the
  standards as written. A future IIIF profile should state the rule (the
  experiment's recommendation: follow SVG — 1:1 — since SVG is normative for
  the body resource).

## 2. Out-of-bounds spatial fragment (Case 10) — REFERENCE GAP

- **Question.** `xywh=2000,0,100,100` on a 1920-wide Canvas (region entirely
  outside the Canvas). What happens?
- **Blind Renderer**: the fragment is invalid (Media Fragments §6.3.3, top-left
  outside the media) and is dropped; the annotation falls back to the whole
  Canvas (`0,0,1920,1080`). The reference keeps the fragment and creates an
  overlay whose viewport lies entirely outside the Canvas (renders nothing).
- **Provenance.** Media Fragments §6.2: invalid fragments "SHOULD be ignored".
  Zero-size regions are rejected by **both** renderers.
- **Verdict.** `difference:spatial-fragment-validation`. The reference does no
  out-of-bounds validation. This is a reference gap, not a standards
  ambiguity.

## 3. `percent:` vs `pct:` spatial unit (Case 4) — CONVENTION

- **Question.** What is the percentage prefix for `xywh`?
- **Media Fragments §4.2.2** defines `percent:` (and `pixel:`). `pct:` is a
  IIIF Image API region syntax, not a Media Fragments unit.
- **Blind Renderer** accepts **both** `pct:` and `percent:` (packet §4
  convention) and resolves them against the Canvas width/height.
- **Renderer A** accepts **only** `pct:`; a `percent:` fragment is silently
  dropped (falls back to the full Canvas).
- **Provenance.** `percent:` is `[NORMATIVE]`; `pct:` is `[CONVENTION]`.
- **Verdict.** Not counted as a difference in the case matrix (the fixture uses
  `pct:` so both match); documented here because it is a real interop gap: a
  standards-pure producer emitting `percent:` would resolve differently in the
  two renderers. Blind is the compliant one.

## 4. Security handling of dangerous SVG (Case 13) — POLICY DIFFERENCE

- **Question.** A body contains `<script>`, `<foreignObject>`, `onclick` or an
  off-host `href`. What is painted?
- **Blind Renderer** (Case 13 mandate): *classifies first*. `unsafe` bodies are
  **not painted at all**; a red marker rect + `<title>rejected: unsafe svg`
  is emitted instead (`data-sec="unsafe"`). `unsupported` bodies (e.g.
  `<image>`, `<use>`, `<style>`, `<filter>`) are allowlist-sanitized (those
  elements removed, primitives kept).
- **Renderer A**: its allowlist sanitizer strips dangerous/unsupported
  elements and paints whatever remains, without an explicit classification.
- **Provenance.** Untrusted-SVG-has-memory-footprint is the prior lab's
  finding #8; neither IIIF nor SVG makes a security *policy* statement.
  The blind behavior is `[CONVENTION]` (explicit), the reference behavior is
  `[CONVENTION]` (implicit).
- **Verdict.** `difference:security-rejection` (unsafe) and
  `difference:security-sanitization` (unsupported). Both are legitimate
  policies; the blind renderer's value is that the policy is explicit and
  auditable per overlay.

---

## Points where both renderers AGREE (no ambiguity)

These were all expected to diverge or at least were worth checking, and did not:

- **Temporal half-open interval** `[start, end)`: `t=10,15`, `t=,20`, `t=15`
  and invalid `t=20,10` (dropped → whole Canvas) resolve identically.
  (`[NORMATIVE]` Media Fragments §4.2.1.)
- **z-order from encounter order**: across one page (Case 3) and across
  multiple AnnotationPages (Case 8) — identical. (Mode A labels it
  `[CONVENTION]`, Mode B `[NORMATIVE]`; geometry unchanged.)
- **viewBox variants** into one region (Case 5): three viewBoxes → three
  different letterboxed crops, identical in both renderers. This is the
  packet's Experiment-12 answer: the mapping is uniquely determined when the
  body carries a `viewBox`.
- **preserveAspectRatio** variants (`xMidYMid meet`, `xMinYMin meet`,
  `xMidYMid slice`, `none`) — identical (both follow SVG §7.8).
- **Multi-selector annotations** (Case 12): first-selector-wins for each
  dimension per W3C Web Annotation §4.2 — identical.
- **Mode A vs Mode B** (IIIF 3.0 vs 4.0 draft): zero geometric differences in
  all 13 cases (`modeAIdenticalToModeB: true` everywhere). The two modes only
  change the *provenance label* of the z-order and xywh-coordinate-space rules.