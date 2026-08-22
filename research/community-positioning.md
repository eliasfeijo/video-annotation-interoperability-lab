# Community Positioning — N3 (Stage 3)

Date: 2026-08-22
Plan: `research/next-session-plan.md` Stage 3 (PRIORITY 2b).
Inputs: E17 cross-engine evidence (`research/e17-report.md`), N2 consumer probes
(`research/viewer-interop-report.md`, `evidence/viewer-matrix.json`).
Method: primary sources first; every claim below carries a source, a source type
([NORMATIVE]/[RECOMMENDATION]/[COMMUNITY]/[IMPLEMENTATION]), and whether the source states the
claim directly or it is inferred. Machine-readable index: `research/n3-source-index.json`.
This was conducted as a FALSIFICATION pass: each section records what was searched for and what
was found against P1/P2 as well as for them.

---

## 1. Executive summary

1. **P1 (explicit viewBox on SVG painting bodies) has NO existing external anchor — it is a
   genuine lab convention, not a restatement.** IIIF Presentation 3.0 does not mention SVG at
   all (verified by full-document search). No IIIF or W3C source requires or recommends a
   viewBox for painting bodies. The closest adjacent precedent is normative but different in
   kind: the W3C Web Annotation SvgSelector note restricting SVG features.
2. **P2 (region-as-viewport + preserveAspectRatio consumer rule) is likewise not stated
   anywhere** — and one existing normative rule points in a DIFFERENT direction: W3C Web
   Annotation's SvgSelector mandates proportional mapping of SVG dimensions to the Source
   resource (a stretch-style model) *for selection shapes*. That rule does not govern painting
   bodies, but it is the closest existing normative SVG↔resource coordinate mapping and must be
   recorded as contrast, not support.
3. **The fit question is genuinely undefined in the ecosystem, and IIIF's own Cookbook says
   so**: "Renderers must scale content into the space represented by the Canvas" (stable 3.0,
   no algorithm), "unpredictable stretching and/or distorting" when aspect ratios differ
   (recipe 0004), and both proportional and disproportionate transforms acknowledged (recipe
   0299). Recipe 0004's guidance — keep source and Canvas aspect ratios consistent — IS the
   lab's P5a safe subset, arrived at independently.
4. **Canvas-as-body is explicitly permitted in stable 3.0** ("A Canvas may be treated as a
   content resource…") and was deliberately developed into 4.0 through tracked spec issues
   (IIIF/api#1190/#1191) with dimension-error rules — supported construction, zero measured
   consumer uptake (N2).
5. **Viewer divergence on identical constructions is documented BY IIIF ITSELF**: two official
   recipes state first-painted = lowest z-index while noting Mirador 3 reverses it, and a third
   recipe describes its one capable viewer putting the FIRST resource most foregrounded — the
   recipes contradict EACH OTHER on ordering direction. Z-order remains [CONVENTION], exactly
   as the lab classified it (P4).
6. Net effect: **P1–P6 ranks are unchanged**, with strengthened motivation and two sharpened
   boundaries: P1/P2 remain conventions (nothing to reuse), and the deployment blocker measured
   in N2 corresponds to consumer scope limits rather than any geometry dispute.

## 2. P1/P2 source-positioning matrix

| Lab claim | Closest existing source | What that source actually establishes | Directly supports? | Contradicts? | Status after N3 |
|---|---|---|---|---|---|
| P1: painting bodies MUST carry explicit viewBox | Presentation 3.0 (whole doc); WA §4.2.7 note | SVG absent from Presentation 3.0 entirely; WA note restricts SVG *features* (no style/js/animation/text) for selectors, silent on viewBox | No | No | [CONVENTION] unchanged; genuinely new |
| P1 (motivation side) | Cookbook 0004 aspect warning | Aspect mismatch ⇒ "unpredictable stretching and/or distorting"; advises consistent aspects | Motivates stability-seeking rules generally | No | Supporting context only |
| P2: targeted region acts as SVG viewport; PAR maps viewBox→region | SVG 1.1 §§7.7–7.10 (via E15 verified quotes) | PAR semantics given a viewport; does NOT say which viewport an embedder must choose | Mechanism only once viewport fixed | No | [CONVENTION] unchanged |
| P2 (contrast) | WA §4.2.7 SvgSelector sentence | For SELECTION shapes: SVG dimensions MUST be relative to Source dimensions, mapped proportionally ("scaling the shape's size to the full size") — no aspect-ratio/meet logic | No (different model, selection-side) | Adjacent tension — recorded | Contrast documented |
| P5/P5a: same-aspect nested/safe subset | Cookbook 0004; 0299-region | 0004 recommends consistent aspects (else unpredictable); 0299 acknowledges both fit directions | Yes — community guidance matches P5a independently | No | Strengthened motivation; rank unchanged |

## 3. IIIF Presentation findings

Source: https://iiif.io/api/presentation/3.0/ (3.0.0, stable) [NORMATIVE]

- Canvas framing: "The Canvas provides a frame of reference for the layout of the content,
  both spatially and temporally." (§2.1)
- Dimensions: width/height "conveys an aspect ratio for the space in which content resources
  are located"; for Canvases "the value does not have a unit." (§3.2 height/width)
- Scaling mandate without algorithm: "Renderers must scale content into the space represented
  by the Canvas, and should follow any timeMode value provided for time-based media." (§5.3)
- Painting breadth: "content of any type may be associated with the Canvas via an Annotation
  that has the motivation value painting" (§5.3) — subject only to the dimensional constraint
  ("Content resources that have dimensions which are not defined for the Canvas must not be
  associated…", with the Image-on-AV-Canvas vs Video-on-image-Canvas example).
- Canvas-as-body: "A Canvas may be treated as a content resource for the purposes of annotating
  it on to other Canvases." (§5.7) — verbatim permission in STABLE 3.0 (re-confirms E16).
- timeMode "scale": temporal fitting IS defined ("Fit the duration of content resource to the
  duration of the portion of the Canvas… played at double-speed") — notable contrast: temporal
  fit got a parameter, spatial fit did not.
- Whole-document searches: "svg"/"image/svg+xml" → **zero occurrences**; "scaled" → zero;
  "coordinate space" → absent (closest: coordinates-beyond-extent example); z-order/paint-order
  semantics → absent (AnnotationPage order is processing order only).

Answers: **Q1 no** (SVG unmentioned); **Q2 mandated-but-undefined**; **Q3 Canvas-space
confirmed as frame of reference, unit-less**.

## 4. IIIF AV / Cookbook findings

Sources: cookbook recipes 0004-canvas-size, 0036-composition-from-multiple-images,
0033-choice, 0489-multimedia-canvas, 0299-region [COMMUNITY]; Ramp README scope statement
[IMPLEMENTATION].

- Recipe 0004 ("Image and Canvas with Differing Dimensions"): "thinking about a Canvas as a
  coordinate space, not as absolute pixel or display dimensions"; "if the image dimensions are
  larger than the Canvas, the image will be scaled to fit the Canvas"; and decisively:
  **"The aspect ratio should be consistent between your source image and Canvas. Otherwise,
  you'll see unpredictable stretching and/or distorting."** The community's own advice is the
  same-aspect discipline the lab derived experimentally (P5a) — independent convergence.
- Recipe 0299-region: region content "transformed as needed to fit the Canvas — enlarged or
  shrunk proportionally, or stretched or squeezed disproportionally." Both readings named, none
  mandated.
- Recipes 0036/0033 (z-order): resources "assembled upwards on the canvas in the order they are
  provided in the Manifest. This works like Z-index in CSS."; "upwards in a z-index from the
  first painting annotation encountered" — i.e., FIRST = BOTTOM (matches lab convention P4).
  Both recipes then warn: "Mirador 3 … processed the images upwards from the first painting
  annotation, Mirador 3 does this in reverse."
- Recipe 0489 (multimedia canvas): "The simultaneously visible resources are listed in the
  Manifest from the foreground to the background … the only currently capable viewer places
  resources on the Canvas so that the first resource is the most foregrounded." This describes
  the OPPOSITE direction to 0036/0033 for the one AV viewer implementing the pattern — the
  Cookbook contradicts itself across recipes. Also: timing precision caveat ("timing should be
  considered approximate").
- Ramp scope (README): components "created to display audio/video resources in IIIF
  Presentation 3.0 manifests" — secondary painting bodies sit outside the product's declared
  scope; Known Issues wiki lists video.js-level items, none about Image/SVG bodies. Q9 answer:
  the N2 crash pattern corresponds to a SCOPE limitation of an AV player, not to a tracked
  geometry disagreement.

Answers: **Q7 undefined/consumer-defined, with same-aspect recommended practice**; **Q8 yes —
documented divergence, including recipe-vs-recipe contradiction**; **Q9 scope limitation**
(for Mirador, target-side SVG highlighting IS supported — see §7).

## 5. W3C Web Annotation / Media Fragments findings

Sources: https://www.w3.org/TR/annotation-model/ (REC 2017), https://www.w3.org/TR/media-frags/
(REC 2012) [NORMATIVE].

- Normative chain for coordinates: FragmentSelector "conformsTo:
  http://www.w3.org/TR/media-frags/" (WA §4.2.1 table) → Media Fragments REC defines xywh.
  **Q4: yes, an independent normative basis exists for the selector-side coordinate semantics.**
- Media Fragments §4.2.1: temporal intervals are **half-open by definition** ("the begin time
  is considered part of the interval whereas the end time is considered to be the first time
  point that is not part of the interval") — the lab's half-open convention (open question #6)
  is not merely defensible, it is the normative reading.
- Media Fragments §4.2.2: xywh percent axes split exactly as the lab assumed (x,w % of width;
  y,h % of height) — open question #7 gains a second implementation-independent confirmation;
  pixel coordinates "interpreted after taking into account the resource's dimensions, aspect
  ratio, clean aperture".
- Media Fragments §7.1 (non-normative): pixel coords intended to match HTML5 intrinsic
  dimensions; HTML clients expected to implement CROPPING as default rendering; highlight-vs-
  crop explicitly out of scope. Recorded as tension with IIIF placement practice (see §8).
- Web Annotation SvgSelector (§4.2.7): "The dimensions of the SVG shape or canvas MUST be
  relative to the dimensions of the Source resource, such that scaling the shape's size to the
  full size of the image correctly describes the desired area." Plus the Note: implementers
  SHOULD use only commonly supported shape features; style, Javascript, animation, text are NOT
  RECOMMENDED; clients SHOULD ignore such information.
  - This is the ONLY existing normative SVG↔resource mapping rule found anywhere in the stack.
    It applies to TARGET-SIDE selection shapes, uses plain proportional scaling (no viewBox/
    PAR/meet language), and defines no mismatch behavior beyond the proportional instruction.
  - Relationship to P1/P2: NOT a restatement of P2 (different mechanism, different side of the
    annotation), but strong precedent that (a) SVG-to-resource mapping needs a normative
    sentence, and (b) the community already accepts feature-restricted SVG inside annotations —
    which independently motivates parts of our sanitizer policy and text-determinism findings.

## 6. SVG findings

Sources: SVG 1.1 §§7.7–7.12 quotes previously verified verbatim in `research/e15-report.md`
[E15 verification stands; not re-fetched]. SVG 2 intrinsic-sizing delta noted in E15/E17
evidence (attribute-less intrinsic behavior) and empirically settled tri-engine by E17 F3.

- SVG fixes geometry GIVEN a viewport (viewBox+PAR) and defines intrinsic sizing from
  width/height attributes. It does NOT assign an embedding consumer a viewport obligation for
  foreign embedding contexts (Canvas regions) — E15's three coexisting readings and E17's
  unanimity demonstrate exactly this boundary. **Q5: no — SVG alone cannot derive P1/P2.**

## 7. Community / implementation findings

- Mirador renders SVG for ANNOTATION TARGETS (SvgSelector highlights): evidenced by the
  official Mirador test fixture pattern (StackOverflow answer, Jun 2022), PR #4380 ("Fix SVG
  annotation fill and stroke order"), issue #4130 (fill/stroke paint order bug),
  mirador-annotations#21 (selector alternatives). So Mirador's N2 "silent drop" applies to
  PAINTING bodies specifically; target-side SVG highlighting is a supported, maintained path.
- Z-order history: mirador#632 (2015) designed overlay "with z order from the first (lowest) to
  last (highest)"; mirador#2607 (2019) documents M3's deliberate reversal ("unlike in Mirador
  2…"). Implementation-level confirmation that stacking order is a client decision, not a
  spec-mandated constant.

## 8. Contradictory evidence (falsification record)

1. **WA SvgSelector proportional-stretch model vs P2's meet model.** If the community ever
   extends the SvgSelector sentence toward bodies, the natural extension would be stretch-style
   proportional mapping — NOT meet. P2 must therefore argue from browser reality (E15/E17) and
   determinism, not from precedent. Recorded, unresolved, [OPEN].
2. **Cookbook self-contradiction on stacking direction** (0036/0033 first=bottom vs 0489
   first=top). Weakens any hope that z-order could be cited as established practice; confirms
   P4's honest [CONVENTION] rank.
3. **Media Fragments §7.1 crop-default vs IIIF region-placement practice.** Browsers treat a
   spatial fragment as crop-by-default (non-normative note); IIIF composition treats xywh as
   the placement region for painting. These coexist because they govern different operations —
   but any future profile should state explicitly that painting targets place, they do not
   crop. New nuance recorded; no rank change.
4. Searches for ANY source requiring/recommending explicit viewBox for embedded/painted SVG:
   none found (IIIF corpus absent on SVG; W3C annotations restrict features but never mention
   viewBox). No contradiction found either — P1 survives falsification attempt unrefuted but
   unsupported.

## 9. What N2 consumer results do and do not establish

Do: establish version-pinned CONSUMER facts (Ramp 5.1.1 hard failure on any secondary body;
Mirador 3.4.3 silent drop of painting bodies while supporting target-side SVG) and show that
P1/P2 geometry is currently UNOBSERVABLE in mainstream consumers.
Do not: say anything about what standards require ([NORMATIVE] claims come only from §3–§6
sources); generalize beyond tested builds; or imply the failures are geometry bugs — Ramp's
scope statement plus Mirador's working target-side SVG indicate scope/design decisions.

## 10. Final status of P1–P6 (Q10)

| Rule | Was | After N3 | Reason |
|---|---|---|---|
| P1 explicit viewBox | [CONVENTION] | **[CONVENTION]** unchanged | Zero external anchor; survives falsification; adjacent feature-restriction precedent only |
| P2 region-as-viewport consumer rule | [CONVENTION] | **[CONVENTION]** unchanged | Not stated anywhere; contrast with WA SvgSelector stretch model recorded |
| P3 fragments/half-open/percent | [CONVENTION]+normative inputs | **Strengthened** (inputs upgraded) | MF §4.2.1 half-open is [NORMATIVE]; percent axes [NORMATIVE]; WA chain normative |
| P4 z-order = page order | [CONVENTION] | **[CONVENTION]** unchanged, weaker as aspiration | Cookbook contradicts itself; Mirador reversal documented |
| P5 nested Canvas expressible; fit undefined; prefer same-aspect | mixed S/[OPEN] | **Strengthened**; P5a gains independent community endorsement | §5.7 verbatim; api#1190/#1191 deliberate work; recipe 0004 same-aspect advice |
| P6 exclusions (no-viewBox etc.) | [CONVENTION] | **[CONVENTION]** unchanged | Nothing new |

No rank changes made. Profile untouched, per instructions.

## 11. Remaining [OPEN]/[UNKNOWN]

- Whether the community would adopt P1/P2 if proposed (candidate IIIF AV cookbook/FAQ issue —
  now WITH better material: the SvgSelector sentence shows the community already writes
  normative SVG-mapping sentences when motivated).
- Fit-rule standardization ("scale into the space" needs an algorithm; 0004's unpredictability
  admission is the hook). [OPEN]
- Leaf-PAR precedence in collapsed pipelines — still browser-only evidence. [OPEN]
- Consumer-side temporal honoring (N2 V2 passive probe inconclusive). [UNKNOWN]
- Whether any consumer implements two-stage nested composition. [OPEN] (none found in N2)

## 12. Recommended next stage

Proceed to Stage 4 (N4 decision) using: E16 divergence measurements + E17 tri-engine
unanimity + N2 zero-consumer-geometry + N3's recipe-0004 convergence. The worked example
required by the plan for P5a can now be drawn from recipe 0004's own use case
(higher-resolution canvas replacement + overlay alignment), making the N4 evaluation largely
documentary rather than constructive.
