# E15/E16 Final Report — SVG Embedding Semantics & IIIF Nested-Canvas Composition

Date: 2026-08-21
Experiments: E15 (`research/e15-report.md`, `evidence/e15/`), E16 (`research/e16-report.md`, `evidence/e16/`)
Standing framing: IIIF Presentation **3.0 = stable**, **4.0 = DRAFT**. "Standard" below always
means a named normative source, never generic usage.

---

## 1. Executive findings

1. **The proposed profile rule — "Every SVG painting body MUST contain an explicit viewBox" —
   survived falsification and is the single highest-value rule we can adopt.** With an explicit
   viewBox, every mechanism that paints into a region (nested `<svg>` region-as-viewport,
   `<img>` fill/default) produced identical, spec-derived geometry across all distinguishable
   cells (E15 §4.2). Without it, Chromium's `<img>` pipeline bitmap-stretches the intrinsic
   canvas while nested-`<svg>` consumers map user units 1:1: the same body resolves to
   different Canvas geometry per mechanism (E15 §4.1).
2. The no-viewBox ambiguity is therefore **eliminable only by the profile rule + a companion
   consumer rule** ("render SVG painting bodies through a region-as-viewport-equivalent
   mechanism"). Neither SVG nor CSS nor IIIF currently forces one reading.
3. **IIIF 3.0 stable already allows Canvases painted onto Canvases** (§5.3). E14's
   "draft-only" classification is superseded. What 4.0-draft adds is explicitness (Container
   model, Use Case 6 pattern with `partOf`, "scaled to fit that region") — not new capability.
4. **"Scaled to fit that region" remains undefined** between fill/contain; outcomes differ by
   up to 386 Canvas units in our fixtures (E16 §4.2). We did not choose silently; both
   readings were tested independently and recorded as `[OPEN]`.
5. **New browser finding:** through the `<img>` channel, Chromium collapses nested composition
   into one stage — the leaf SVG's own preserveAspectRatio is applied against the destination
   aspect even inside a fill-mapped container (E16 §4.3). Pinning a fit keyword in a profile
   would NOT pin browser geometry for aspect-mismatched compositions unless consumer behavior
   is also constrained.
6. Nested Canvas relocates rather than resolves the SVG coordinate ambiguity (E16 case07).
7. Stable IIIF 3.0 can express today's contain-outcome compositions via pre-computed regions
   (twins match B-contain exactly); what only the draft provides structurally is a reusable,
   independently annotated overlay layer.

## 2. E15 results

Summary (full detail in `evidence/e15/geometry-matrix.json`):

| Variant class | svg-nested-region | img-default/fill | img-contain/none | object | background |
|---|---|---|---|---|---|
| viewBox A/B (+PAR variants) | I-REGION-VIEWPORT | I-REGION-VIEWPORT (identical wherever distinguishable) | I-OBJECTFIT-CONTAIN / I-NATURAL-CENTERED (normative CSS) | document reading | I-NATURAL-TOPLEFT |
| NO viewBox C/D | I-REGION-VIEWPORT (1:1) | **I-INTRINSIC-STRETCH** | contained/stretched intrinsic canvas | document reading (1:1) | I-NATURAL-TOPLEFT |

Key rules classified `[NORMATIVE]`/`[BROWSER]`/`[OPEN]` with SOURCE/QUOTE/INTERPRETATION/
RESULT/IMPLICATION blocks are in `research/e15-report.md` §5. Intrinsic size reporting follows
SVG 1.1 §7.12 exactly (width/height attrs), which is what enables the browser's stretch.

Calibration side-effect: the matrix exposed a lab-wide placement bug — `/yMid/` never matched
the spec's capitalized `YMid` align tokens, silently disabling vertical centering in ALL
placement implementations since E1 (never triggered because earlier fixtures used
aspect-matched regions or xMin*/none variants). Fixed everywhere; see log bug-fix #13.

## 3. E16 results

See `research/e16-report.md`. Headline numbers:

- 8 Model B fixtures × 3 independent renderers × {fill, contain}: renderer agreement except
  the inherited no-viewBox OPEN divergence (confined to that overlay in all 16 runs).
- fill vs contain destinations for mismatched aspects: e.g. 1000²→full gives `0,0,1920,1080`
  vs `420,0,1080,1080`; composed landmark positions differ by up to 386 Canvas units.
- Mode A twins == B-contain within ≤0.375 Canvas units on all four mismatch cases
  (`evidence/e16/modeA-twins.json`).
- Browser leaf-PAR collapse measured (case03/case05 probes + screenshots).

## 4. Standards provenance matrix

| Rule | Source | Status | Verified wording? |
|---|---|---|---|
| Region as SVG viewport; PAR maps viewBox | SVG 1.1 §7.7–§7.9 | [NORMATIVE] | yes |
| No-viewBox ⇒ user==viewport units, PAR ignored | SVG 1.1 §7.8/§7.10 | [NORMATIVE] (but not what browsers do via `<img>`) | yes |
| Intrinsic size from width/height attrs; % gives none | SVG 1.1 §7.12 | [NORMATIVE] | yes (browser-reported values equal attrs) |
| object-fit fill/contain/none semantics | CSS Images 3 §4.5 | [NORMATIVE] | yes |
| background-size:auto uses natural size | CSS Images 3 §4.3.1 | [NORMATIVE] | yes |
| Painting motivation ⇒ content IS the Canvas | IIIF 3.0 §5.6 | [NORMATIVE] stable | yes |
| Renderers must scale content into Canvas space | IIIF 3.0 §5.3 | [NORMATIVE] stable | yes |
| Canvases painted onto Canvases | IIIF 3.0 §5.3 | [NORMATIVE] stable | yes (supersedes E14 note) |
| Containers-as-Content-Resources, Nesting, UC6 "scaled to fit" | IIIF 4.0 DRAFT | [NORMATIVE]-in-draft | yes |
| Canvas dims establish coordinates, not pixels | 4.0 draft UC1 / data model; derived in 3.0 | [NORMATIVE] draft / [DERIVED] stable | yes |
| z-index ascending from first annotation | 4.0 draft Annotation Page; absent in 3.0 | [NORMATIVE] draft / [CONVENTION] stable | yes |
| Fit rule for painted-in Canvas | — | [OPEN] | n/a (absence verified) |
| Leaf-PAR vs container-fit precedence | — | [OPEN]+[BROWSER] | measured |
| Require explicit viewBox (profile) | this lab | [CONVENTION] on normative primitives | evidence E15 |
| Region-as-viewport consumer equivalence | this lab | [CONVENTION] | evidence E15 |

## 5. Renderer divergence matrix

| Comparison | Cases | Result |
|---|---|---|
| Renderer A vs Blind vs Native (resolver level), fixed fit | all E16 fixtures, both readings | agree EXCEPT no-viewBox overlay → placement diffs classified OPEN |
| Renderer A vs Blind (no-viewBox anywhere) | E14 case06/07, E15, E16 case07+all | designed OPEN divergence preserved (A synthesizes viewBox; blind 1:1); never "fixed" to converge |
| Resolver predictions vs browser `<img>` reality | E15 novb×img-fill; E16 case03/05 | diverge: stretch (novb), leaf-PAR collapse (vb) — VIEWER_GAP/BROWSER, recorded not patched |
| Blind vs Native DOM stages | E16 screenshots case07 | visually distinct geometries preserved as evidence |

## 6. Browser behavior matrix (Chromium / Playwright only)

| Mechanism × input | Observed geometry | Class |
|---|---|---|
| `<img>` + viewBox, any object-fit | viewport = concrete box; PAR honored | [NORMATIVE]-consistent |
| `<img>` + no viewBox, default/fill | intrinsic canvas stretched (non-uniform) | [BROWSER] (spec underdetermined) |
| `<img>` + no viewBox, contain/none | intrinsic canvas uniformly fitted/centered | [NORMATIVE] CSS over [BROWSER] base |
| `<object>` SVG document | document semantics (own viewport, 1:1) | [VIEWER]/[BROWSER] |
| background-image natural-size | drawn unscaled at origin | [NORMATIVE] |
| Nested composition via `<img>` leaves | leaf PAR applied against destination aspect (collapse) | [BROWSER]+[OPEN] |
| Inline nested `<svg>` (both modes) | spec-perfect paint truth | [NORMATIVE] |

Cross-engine claims require Firefox/WebKit runs — explicitly out of scope this session.

## 7. Stable IIIF 3 vs draft IIIF 4

| Capability | 3.0 stable | 4.0 draft |
|---|---|---|
| Express video + overlay paintings on one Canvas | yes ([NORMATIVE]) | yes |
| Canvas-as-body nesting permitted | yes (one sentence, no pattern) | yes (explicit + worked example) |
| Overlay as reusable annotated layer (`partOf`) | convention only | modeled ([NORMATIVE]-draft) |
| z-order from annotation order | convention | [NORMATIVE] |
| xywh in Canvas coordinate space | derived | explicit |
| Composition fit rule | absent | absent ("scaled to fit" undefined) |
| Viewer support (Ramp, stable-3 AV player) | fails on SVG bodies (E14) | fails on draft manifests (E14) |

Net: the draft does NOT fix any ambiguity we need for geometry; it improves structure and
z-order wording. Nothing in our profile REQUIRES 4.0; everything required works on 3.0.

## 8. What remains genuinely ambiguous

1. Fit rule for Canvas-into-region ("scaled to fit"): fill/contain/cover undefined. [OPEN]
2. Container-fit vs leaf-PAR precedence in collapsed pipelines. [OPEN]+[BROWSER]
3. No-viewBox SVG body mapping across mechanisms. [OPEN], eliminable by profile rule.
4. Media Fragments invalid/out-of-bounds fragment handling (E14, unchanged). [OPEN]
5. SVG security policy expression (unchanged). [IMPLEMENTATION_GAP]
6. Movement/keyframes (unchanged, out of scope).
7. Cross-browser generalization of every [BROWSER] row above. [OPEN until Firefox/WebKit]

## 9. Recommended profile rules (evidence-backed, minimal)

P1. Every SVG painting body MUST declare an explicit `viewBox`. [CONVENTION; E15 §6]
P2. Consumers SHALL render an SVG painting body such that the targeted region acts as the SVG
    viewport with preserveAspectRatio applied between body viewBox and region (nested-`<svg>`
    or equivalent pre-composited rendering; raw `<img>`-into-region acceptable ONLY when the
    region aspect equals the viewBox aspect or the consumer composites before scaling).
    [CONVENTION; E15 R1 + E16 §4.3]
P3. Targets use Media Fragments `t=`/`xywh=`; `percent:` normative, `pct:` accepted alias;
    half-open temporal windows. (Existing, reconfirmed.)
P4. Z-order = AnnotationPage item order. [CONVENTION on 3.0; matches 4.0 draft]
P5. Canvas-into-Canvas overlays: expressible now; UNTIL "fit" is standardized, profiles SHOULD
    either (a) require target aspect == inner Canvas aspect (makes all readings coincide —
    E16 same-aspect result), or (b) declare one fit as a profile parameter and require
    non-collapsed consumers. Prefer (a) for interoperability today.
P6. Bodies without viewBox, CSS-background embedding, and naive attribute-mode insertion are
    OUT of profile (not forbidden by standards; just not portable).

## 10. What NOT to standardize yet

- A fit keyword vocabulary for nested painting (needs community/spec process + second engine).
- Any new body/motivation classes (VisualBody etc.) — nothing observed requires them.
- Leaf-PAR precedence rules — one engine measured; insufficient basis.
- Security policy expression — separate track.
- Movement — untouched this session.

## 11. Updated compatibility matrix (delta rows; full file updated)

| Dimension | Mechanism | Std? | Result | Evidence |
|---|---|---|---|---|
| Explicit-viewBox SVG geometry across region-painting embeddings | nested-svg/img-fill/object | S | S | E15 matrix, all distinguishable cells agree |
| no-viewBox SVG across embeddings | img vs nested-svg | G | G | three readings coexist [BROWSER/OPEN] |
| CSS letterbox channels (contain/none/background) | CSS Images 3 | S* | S* deterministic only if profile pins channel | E15 |
| Nested Canvas representability | IIIF 3.0 §5.3 | S | S (supersedes E14 "draft-only" row) | E16 twins |
| Nested Canvas fit semantics | — | G | G [OPEN]; same-aspect workaround S | E16 |
| Browser nested composition fidelity | <img> channel | B | G for aspect-mismatched viewBox leaves (leaf-PAR collapse) | E16 case03/05 |
| Vertical PAR centering (YMid/YMax) | all renderers | S | S after bug-fix #13 | E15 calibration |

## 12. Updated open questions (delta)

Answered/closed:
- #9 SVG-as-image embedding semantics → ANSWERED by E15 (superseded by companion-rule framing).
Superseded:
- compatibility-matrix row "Nested Overlay Canvas … draft-only" → superseded by E16 (stable 3.0
  permits; draft adds explicitness). Marked, history kept.
Refined:
- #10 nested-canvas `contain` mapping → resolved INTO the broader OPEN "fit undefined"
  question (fill AND contain both plausible; neither normative) + new leaf-PAR precedence
  sub-question.
New:
- N1: Cross-engine verification of [BROWSER] rows (Firefox/WebKit).
- N2: Does any deployed viewer realize two-stage nested composition (pre-composited inner
  canvas) rather than collapsing? (Survey/probe.)
- N3: Community position on requiring viewBox (IIIF AV cookbook issue?) — candidate erratum/FAQ.

Full list maintained in `research/open-questions.md`.

## 13. Recommendation for E17/E18 — and the mandated answer

**Mandated answer: continue investigating existing standards — but switch mode.** After
E15/E16 the remaining unknowns are no longer "can existing standards express it?" (they can,
stably) nor "is the mapping deterministic?" (it is, once P1/P2 are adopted). What remains is
(a) verifying [BROWSER] rows beyond Chromium, (b) community/spec positioning of the two tiny
conventions P1/P2 and the fit question. That is profile-drafting work conducted THROUGH
standards channels, not invention of vocabulary. Per the preference order
(existing standard > +profile > +convention > new vocabulary): we sit at
"existing standard + small profile/convention", and E15/E16 provide the experimental evidence
that no lower rung is forced.

Concrete next steps:

- **E17 (recommended): cross-engine replication.** Re-run the E15 core matrix + E16 collapse
  probes in Firefox and WebKit via Playwright. Cheap (harness exists), converts every
  [BROWSER] row into cross-engine fact or narrows the gap. Decides whether P2 must say
  "region-as-viewport-equivalent" or can name concrete mechanisms.
- **E18: viewer/consumer survey.** Probe Ramp/Mirador/Annonatate-ish consumers with (i)
  viewBox-bearing bodies, (ii) same-aspect nested canvases (the P5a-safe subset). Establishes
  whether the profile's safe subset already has ANY viewer uptake, and produces material for
  an IIIF FAQ/erratum request on "scaled to fit".
- Only if E17 shows engines fundamentally irreconcilable WITHOUT a fit keyword should we draft
  an experimental profile parameter for fit — and even then as a profile parameter, never as
  new vocabulary.

Success criteria check (session questions): answered in §§1–3, 8, 9 above — notably (1) yes,
(2) yes via profile, (3) no (draft adds explicitness, not semantics we need), (4) undefined +
measured, (5) relocates, (6) everything needed, (7) only structural layering/z-order
wording, (8) table in §4, (9) §9, (10) closer — strictly closer: zero new vocabulary required.
