# Draft Interoperability Profile — Deterministic Geometry Subset for SVG / Canvas Painting

Stage: N5 (Stage 5 — formal profile + conformance model). Date: 2026-08-22.
Inputs: `research/n4-safe-subset.md` (S1–S8, P5a), `research/e15-report.md`,
`research/e16-report.md`, `research/e17-report.md` (+ `evidence/e17/`),
`research/viewer-interop-report.md` (+ `evidence/viewer-matrix.json`),
`research/community-positioning.md` (+ `research/n3-source-index.json`),
candidate profile P1–P6 (`research/e15-e16-final-report.md` §9).

Status: DRAFT. This document is an isolated Stage-5 artifact. It does NOT modify the final
report (`research/e15-e16-final-report.md`) or the N4 candidate text; where this draft
reformulates S1–S8 it does so without strengthening them (no new MUSTs, no rank promotions,
no [OPEN] item promoted). The plan's "Stage 5 research-model update"
(`compatibility-matrix.md`, `open-questions.md`, final-report deltas) remains pending and is
deliberately not performed here.

Companion documents: `research/conformance-matrix.md` (requirement matrix + black-box test
suite design). No application or runtime code is implemented in this stage.

---

## PART 1 — PROFILE SCOPE

### 1.1 Problem this profile solves

IIIF Presentation 3.0 lets publishers paint content resources — including SVG resources and
other Canvases — onto Canvases whose dimensions establish a unit-less logical coordinate
space. It mandates only that renderers "scale content into the space represented by the
Canvas" (§5.3) and defines no spatial fit algorithm (verified absence: whole-document search,
N3 §3). Measured consequences:

- Without an explicit SVG `viewBox`, the same body resolves to different Canvas geometry
  depending on which embedding mechanism a consumer uses — three coexisting readings,
  reproduced identically across Chromium 151 / Firefox 153 / WebKit 26.5
  (E15 §4.1 `[BROWSER]`; E17 F2/F3).
- With mismatched aspect ratios between painted Canvas and target rect, candidate fit
  readings diverge measurably — up to 386 Canvas units in our fixtures — and no standard
  selects between them (E16 §4.2 `[OPEN]`; E17 F5/F6).
- Through real `<img>`-style resource channels, nested composition collapses into one stage:
  the leaf's own `preserveAspectRatio` overrides container fit for aspect-mismatched targets
  (E16 §4.3; tri-engine E17 F5).
- No tested deployed consumer realizes any of this geometry today: Ramp 5.1.1 hard-fails on
  any secondary painting body; Mirador 3.4.3 silently drops them (N2 V4–V7, M2/M3).

This profile turns the N4 Safe Interoperability Subset (S1–S8) into a constrained
interoperability contract: a small set of publisher-side requirements and consumer-side
obligations under which the 2D geometry of painted content in logical Canvas space becomes
predictable and mechanically checkable.

The profile IS:

- a constrained interoperability contract for exactly that subset whose geometry can be made
  predictable from the evidence gathered in E15–N4;
- explicit about which rules are profile decisions ([PROFILE]), which are inherited standards
  semantics ([NORMATIVE]), which are browser measurements ([BROWSER]), which are ecosystem
  convergence ([COMMUNITY]), which are derived consequences ([DERIVED]), and which remain
  undetermined ([OPEN]).

The profile is NOT:

- a replacement for SVG (SVG's own normative machinery is inherited, not restated);
- a replacement for IIIF Presentation (the profile constrains one degree of freedom IIIF
  leaves open; it adds no new manifest properties);
- a universal browser rendering specification ([BROWSER] facts are version-scoped evidence:
  Chromium 151.0.7922.34 / Firefox 153.0 / WebKit 26.5 via Playwright 1.62.1, Windows);
- a consumer implementation specification (consumer obligations are declared but no deployed
  consumer currently realizes them — N2);
- a definition of z-order (Part 9);
- a universal Canvas composition algorithm (no fit algorithm is defined anywhere in this
  profile; the mismatched-aspect case is excluded, not solved).

### 1.2 Interoperability boundary (explicit)

IN boundary — the profile governs, at the data level:

1. SVG resources used as painting bodies on Presentation 3.0 Canvases: their required
   coordinate-space declaration (S1) and how consumers must map that space into a targeted
   region (S2).
2. Canvas dimensions as the logical coordinate space of composition (S3).
3. Canvases painted as content resources onto other Canvases or regions, restricted to
   same-aspect targets (S4/S5 = P5a), including wholesale same-aspect replacement of a
   Canvas's logical dimensions.
4. Media Fragments target syntax for temporal and spatial targeting (S6), with painting
   placement semantics clarified (Part 8).
5. Exclusions: constructions for which no geometry is promised (S7, Part 10).

OUT of boundary — explicitly not governed:

z-order / stacking; temporal fragment honoring by consumers; AV timing precision; CSS
object-fit `cover` channels; security policy expression of SVG; movement/keyframes; invalid or
out-of-bounds fragment handling (E14-era open question); any rendering behavior outside the
logical-coordinate layer (rasterization, anti-aliasing); consumers' internal architecture.
Each OUT item keeps its recorded status ([OPEN] or excluded) and none generates a requirement.

---

## PART 2 — TERMINOLOGY

Existing IIIF / SVG / Web Annotation / CSS terms are reused wherever sufficient. Terms whose
meaning differs between standards are flagged.

| Term | Definition | Source of term |
|---|---|---|
| **Canvas** | An IIIF Presentation 3.0 resource (`type: "Canvas"`) providing a frame of reference for layout of content, spatially and temporally. | IIIF 3.0 §2.1/§5 |
| **logical Canvas space** | The unit-less 2D coordinate system established by a Canvas's `width`/`height`; "conveys an aspect ratio for the space in which content resources are located"; values have no unit and are not pixels. | IIIF 3.0 §3.2; 4.0 draft makes it explicit |
| **source resource** | A content resource presented as the body of a painting Annotation (image, video, SVG resource, or another Canvas). IIIF calls this a *content resource*; Web Annotation calls the same role the *body*. This profile uses **painting body** for clarity and notes the mapping here once. | IIIF 3.0 §5; WA §2 (terminology differs — flagged) |
| **painting body** | A source resource carried by an Annotation with motivation `painting`. | IIIF 3.0 §5.3/§5.6 |
| **SVG resource** | An SVG document presented as a painting body (`type: "Image"` with media type `image/svg+xml` in our fixtures/probes). Distinct from a *selection-side* SvgSelector shape, which lives on the annotation TARGET side and is out of scope. | lab usage; WA §4.2.7 contrast |
| **explicit viewBox** | A `viewBox` attribute present on the root `<svg>` element of an SVG resource, declaring the user coordinate system mapped onto the viewport. Its presence is the profile's coordinate-space contract (S1). | SVG 1.1 §7.7–§7.10 |
| **region** | A rectangular sub-rectangle `(Tx, Ty, Tw, Th)` of a Canvas's logical space, addressed by a spatial Media Fragment on the target. NOTE terminology collision: Media Fragments uses "region" for the *media-intrinsic* rectangle selected by `xywh=` on the media resource itself; this profile uses "region" for the *Canvas-space* target rect. The distinction matters because MF pixel coordinates are resource-intrinsic (MF §4.2.2) while IIIF region targets live in Canvas space. Flagged; context disambiguates. | MF §4.2.2 vs IIIF practice (N3 §8 #3) |
| **viewport** | The rectangle onto which the SVG coordinate system is mapped. Under S2 the targeted region acts as the SVG viewport. This is a deliberate profile assignment: neither SVG nor IIIF assigns an embedder a viewport obligation (E15 R1 analysis; N3 §6). | SVG 1.1 §7.2 + profile |
| **replacement Canvas** | A Canvas whose dimensions supersede those of an earlier Canvas serving the same role (e.g., higher-resolution re-publication), such that existing annotations/overlays must remain aligned. Conforming replacement requires equal aspect ratio (S4 replacement form). | this profile (P5a worked example, N4 Part 3) |
| **aspect ratio** | For positive dimensions W×H: the ratio `W/H`. Compared exactly via integer cross-multiplication when values are integers; otherwise within ε per S4. | mathematics; no standard needed |
| **fit policy** | Any rule choosing how content is placed/scaled inside a target rect when aspects differ (fill, contain/meet, cover/slice, stretch, …). NO fit policy is defined, mandated, or named by this profile. IIIF names none either ("scaled to fit" undefined — E16 §2, N3 §3). | concept only; deliberately unstandardized here ([OPEN]) |
| **temporal fragment** | A Media Fragments temporal dimension (`t=`) on a target or body, denoting a half-open interval [begin, end). | MF §4.2.1 [NORMATIVE] |
| **spatial fragment** | A Media Fragments spatial dimension (`xywh=`, `pixel:`/`percent:` axes) on a target or body. | MF §4.2.2 [NORMATIVE] |
| **consumer** | Software that parses a manifest and renders Canvas content (viewer, player, renderer). Evidence exists for two version-pinned consumers (Ramp 5.1.1, Mirador 3.4.3) and three browser engines as substrate. | lab usage |
| **profile-conforming resource** | A manifest/resource satisfying every in-force [PROFILE]/[NORMATIVE] requirement of Part 4 and violating no exclusion (Part 10). Machine-checkable per `research/conformance-matrix.md`. | this profile |
| **profile-conforming consumer** | An implementation satisfying the consumer-side obligations (S2 mechanism contract, S6 parsing, S8 non-guarantee honesty). Defined declaratively in Part 11.2; NO implementation may currently claim certification because none was observed to realize the obligations (N2). | this profile |

Terminology differences between standards (explicit):

- IIIF *content resource* ≡ WA *body* (role naming differs).
- WA *Source* (thing annotated) plays the role IIIF assigns to the *target Canvas*.
- MF *region* (media-intrinsic selection rect) ≠ IIIF painting-target *region* (placement rect
  in Canvas space). See table above.
- SVG *viewport* is defined relative to an embedding context SVG does not control; S2 fixes
  it by profile decision.
- WA SvgSelector maps SVG dimensions proportionally to the Source ("stretch-style") for
  SELECTION shapes; this profile's S2 uses viewport+preserveAspectRatio for PAINTING bodies.
  These are adjacent, different mechanisms; the tension is recorded, not reconciled
  (N3 §8 #1, [OPEN]).

---

## PART 3 — REQUIREMENT TAXONOMY

Every requirement in this profile carries EXACTLY ONE provenance class:

| Class | Meaning | Promotion rule |
|---|---|---|
| `[NORMATIVE]` | Directly supported by an authoritative specification, source named (IIIF Presentation 3.0, W3C Media Fragments REC, W3C Web Annotation REC, SVG 1.1, CSS Images 3). | Requires a citation; never inferred from behavior. |
| `[BROWSER]` | Empirically measured browser behavior, traced to E17 multi-engine evidence (E15/E16 single-engine rows count only as re-verified through E17 F-findings). Version-scoped: Chromium 151.0.7922.34 / Firefox 153.0 / WebKit 26.5. Never normative authority. | Three-engine agreement does NOT upgrade a claim. |
| `[COMMUNITY]` | Independent ecosystem / recipe / implementation convergence traced to N3 (`research/community-positioning.md`, `research/n3-source-index.json`). Not normative authority. | Cookbook advice does NOT become a spec claim. |
| `[DERIVED]` | Logical consequence of our experiments or resolver logic (e.g., the same-aspect coincidence theorem). | Traceable to machine evidence. |
| `[PROFILE]` | A deliberate interoperability constraint adopted BY THIS PROFILE on top of the above. The profile's own authority only. | Must be stated as profile-specific; must be mechanically justified by cited evidence, not derived from any standard. |
| `[OPEN]` | Not sufficiently determined. An [OPEN] item MUST NOT appear as a requirement, MUST NOT be silently promoted, and MUST NOT acquire implicit rule status anywhere in this document. | Promotion requires new evidence per the falsification protocol. |

Rules of use:

1. No combined labels ("supported by standards" is not a class).
2. Where a rule has mixed provenance components (e.g., S6 syntax [NORMATIVE] + `pct:` alias
   [PROFILE]), it is decomposed into separately labeled sub-rules (R-S6a, R-S6b).
3. Every MUST / MUST NOT / SHOULD / MAY appears inside a requirement block carrying
   Requirement/Rationale/Evidence/Provenance/Predicate/Failure example/Non-goal, so each has
   explicit justification.
4. Negative guarantees (Part 15) are part of the contract, not footnotes.

---

## PART 4 — REQUIREMENTS (FORMALIZED S1–S8)

Mapping from N4: S1→R-S1, S2→R-S2, S3→R-S3, S4→R-S4, S5→R-S5, S6→R-S6a+R-S6b, S7→R-S7,
S8→R-S8a+R-S8b. Substance preserved verbatim in meaning; wording tightened for testability.
Nothing strengthened: see per-rule Non-goal fields.

---

### R-S1 — Explicit SVG coordinate system (N4 S1)

**Provenance: `[PROFILE]`**

**Requirement.** Every SVG resource used as a painting body MUST declare an explicit
`viewBox` on its root `<svg>` element. A painting body whose root lacks `viewBox` is a
non-conforming resource under this profile.

**Rationale.** Without a viewBox, the same body resolves to different Canvas geometry
depending on the consumer's embedding mechanism: nested-`<svg>` region-painting reads user
units 1:1 against the region, while `<img>`-style pipelines bitmap-stretch the intrinsic
canvas, and CSS object-fit channels apply further normative-but-divergent mappings — three
coexisting readings (E15 §4.1). The hazard is engine-uniform (E17 F2/F3), so no engine choice
rescues it. An explicit viewBox restores determinism among region-painting mechanisms: all
agree with I-REGION-VIEWPORT wherever distinguishable (E15 §4.2; E17 F1). The requirement
exists because THIS PROFILE needs an explicit coordinate-space contract; SVG itself does not
universally require viewBox (see Part 5).

**Evidence.**
- `[BROWSER]` E15 §4.1 (three coexisting readings) re-verified tri-engine E17 F2/F3
  (62/62 rows unanimous).
- `[BROWSER]` E15 §4.2 + E17 F1: with viewBox, svg-nested-region / img-default / img-fill /
  object agree with I-REGION-VIEWPORT in all distinguishable cells.
- `[NORMATIVE]` primitives the rule builds on: SVG 1.1 §7.7–§7.10 (viewBox↔viewport mapping
  given a viewport), §7.12 (intrinsic sizing); CSS Images 3 §4.5 (concrete object size becomes
  the SVG viewport for `<img>`).
- `[NORMATIVE]` absence check: IIIF Presentation 3.0 contains zero occurrences of SVG
  (whole-document search, N3 §3) — nothing external mandates or forbids this rule; it is
  genuinely a profile convention (N3 §8 #4).

**Conformance predicate (mechanical).** Parse the root element of every SVG painting-body
resource; assert attribute `viewBox` is present with four numeric components. Static check;
no browser needed.

**Failure example.** Body: `<svg xmlns="…"><circle cx="500" cy="500" r="100"/></svg>`
(no viewBox) painted at `xywh=480,270,960,540` → NON-CONFORMING (code MISSING_VIEWBOX),
because its Canvas geometry would depend on the consumer's mechanism.

**Non-goal.** Does NOT guarantee anything about bodies lacking viewBox beyond rejection; does
NOT claim SVG forbids viewBox-less documents; does NOT constrain SVG used outside the
painting-body role; does NOT pin preserveAspectRatio values.

---

### R-S2 — Region-as-viewport consumer contract (N4 S2)

**Provenance: `[PROFILE]`**

**Requirement.** A consumer that renders an SVG painting body into a region SHALL do so such
that the targeted region acts as the SVG viewport, with `preserveAspectRatio` applied between
body viewBox and region. Rendering an SVG body through a raw single-stage `<img>`-style
resource channel qualifies ONLY when the region aspect equals the viewBox aspect, or when the
consumer composites (pre-composes) before scaling.

**Rationale.** Given a fixed viewport, SVG's own machinery (viewBox+PAR) makes geometry
deterministic — but neither SVG nor CSS nor IIIF assigns an embedder a viewport obligation
(E15 R1 analysis; N3 §6), and collapsed pipelines violate naive expectations for
aspect-mismatched targets: the leaf's own PAR re-applies against the destination aspect even
inside a fill-stretched container (E16 §4.3; E17 F5 tri-engine). Same-aspect targets make the
collapsed and two-stage pipelines coincide, which is why the conditional clause is
load-bearing rather than decorative. This is a forward-looking consumer obligation: no tested
deployed consumer realizes it end-to-end today (N2 V4–V7/M2/M3 fail before geometry).

**Evidence.**
- `[BROWSER]` E15 R1 (img-with-viewBox ≡ region-as-viewport nested svg, 40 distinguishable
  cells) + E17 F1 (tri-engine).
- `[BROWSER]` E16 §4.3 leaf-PAR collapse + E17 F5 (run fractions identical tri-engine).
- `[NORMATIVE]` mechanism level: SVG 1.1 §7.7–§7.10; CSS Images 3 §4.5.
- Consumer-realization status: zero geometric readings obtainable (N2; `[VIEWER_GAP]`
  rows V4–V7, M2/M3).

**Conformance predicate (observable, requires a claiming consumer).** For a conforming SVG
body (viewBox VB, PAR p) painted at region R, rendered landmark positions match the analytic
prediction (region-as-viewport + p) within documented measurement tolerance, AND the painted
destination rect equals R exactly (no letterbox bands, offsets, or clipping beyond what p
itself prescribes inside R). Black-box style identical to E15 mask classification. Cannot be
exercised until a capable consumer exists → NEEDS TEST FIXTURE (Part 17).

**Failure example.** A consumer paints a square-viewBox SVG leaf through an
`<img>`-stretched container onto a 16:9 region: the leaf letterboxes itself inside the
stretched container (collapsed pipeline), placing landmarks measurably off the
region-as-viewport prediction (E16 case03/case05 bands) → violates R-S2 for this
aspect-mismatched target unless the consumer pre-composites.

**Non-goal.** Does NOT mandate a mechanism (nested `<svg>`, `<img>`, canvas-composite — any
equivalent realization qualifies); does NOT mandate PAR values; does NOT require SVG bodies
to match region aspect (an S2-compliant mechanism renders any aspect deterministically via
PAR — adding such a requirement would strengthen S2 beyond N4); does NOT promise any current
consumer complies.

---

### R-S3 — Explicit Canvas dimensions (N4 S3)

**Provenance: `[PROFILE]`** (dimension semantics are `[NORMATIVE]`)

**Requirement.** Every Canvas involved in profile-conforming content MUST state positive
integer `height` and `width`, establishing its logical Canvas space. Resources relying on
Canvases with missing, zero, negative, or non-integer dimensions are non-conforming.

**Rationale.** The dimension semantics — "conveys an aspect ratio for the space in which
content resources are located", values without unit — are `[NORMATIVE]` IIIF 3.0 §3.2/§5.3
(4.0 draft states it explicitly). Requiring their presence and positivity for every
composition participant is the profile's load-bearing floor: S4's arithmetic and S5's mapping
are undefined otherwise.

**Evidence.** `[NORMATIVE]` IIIF 3.0 §3.2 height/width; §5.3 scaling duty
(`research/community-positioning.md` §3; `research/n3-source-index.json` id
iiif-prezi-3).

**Conformance predicate (mechanical).** Parse each Canvas; assert `Number.isInteger(h)` ∧
`h > 0` ∧ `Number.isInteger(w)` ∧ `w > 0`.

**Failure example.** Outer Canvas omits `height` → NON-CONFORMING (MISSING_CANVAS_DIMENSION):
target rects cannot be interpreted, S4 unspecifiable.

**Non-goal.** Does NOT assign pixels to Canvas units; does NOT define display size; does not
claim IIIF 3.0's own property tables require presence (not verified in our artifacts — the
requirement here is the profile's).

---

### R-S4 — Same-aspect painted/replaced Canvas (N4 S4 = P5a core)

**Provenance: `[PROFILE]`**

**Requirement.** A Canvas painted as a content resource onto another Canvas (or onto a region
of one) MUST have the same aspect ratio as its target rect: the targeted region when the
target carries a spatial selector, otherwise the full target Canvas dimensions. Likewise, a
replacement Canvas (Part 2) MUST have the same aspect ratio as the Canvas it replaces.
Formal statement and tolerance: Part 7. Aspect-mismatched paintings/replacements violate
this rule and are therefore non-conforming; NO fallback fit behavior is defined for them.

**Rationale.** Same aspect is the unique point where (i) the measured fill-vs-contain
divergence vanishes mathematically (uniform scale unique; letterbox offsets exactly zero;
slice crops nothing — every reasonable policy computes the SAME map), (ii) the browser
leaf-PAR collapse becomes unreachable (nothing to collapse), and (iii) IIIF's normative
"scale content into the space represented by the Canvas" is satisfied without inventing a fit
algorithm (none is standardized — verified absence). Community guidance converged on the same
discipline independently. Full derivation: N4 Part 2; formalization: Part 7 below.

**Evidence.**
- `[DERIVED]` coincidence theorem: E16 same-aspect rows (case01/02 coincide; case04 Mode-A
  twin matches BOTH recorded readings — `modeA-twins.json`: twinMatchesFill =
  twinMatchesContain = true) + mismatched divergence quantified (case03 destinations
  `0,0,1920,1080` vs `420,0,1080,1080`; composed landmark Δx = 386.4 Canvas units,
  `landmark-spot-check.json`).
- `[BROWSER]` E17 F6 (same-aspect control unanimous tri-engine; `fitsCoincide` true) and
  E17 F5 (collapse reproduces tri-engine — the hazard S4 neutralizes).
- `[COMMUNITY]` Cookbook recipe 0004: "The aspect ratio should be consistent between your
  source image and Canvas. Otherwise, you'll see unpredictable stretching and/or distorting."
  (N3 §4; independent convergence, not authority).
- `[NORMATIVE]` compatibility frame: IIIF 3.0 §5.3 scale-into-space duty; §5.7 verbatim
  Canvas-as-content-resource permission. S4 does NOT claim IIIF specifies any algorithm.

**Conformance predicate (mechanical, deterministic).** Exact integer cross-multiplication
(Part 7): conform iff `Tw · Hb == Th · Wb` (painted form) resp. `W' · H == H' · W`
(replacement form); non-integers rejected by default (SHOULD) or compared with relative
tolerance ε ≤ 10⁻⁶ (documented profile parameter, chosen here — not derived from any
standard).

**Failure example.** Inner Canvas 1000×1000 painted onto full outer Canvas 1920×1080:
`Tw·Hb = 1920·1000 = 1,920,000` ≠ `Th·Wb = 1080·1000 = 1,080,000` → NON-CONFORMING
(ASPECT_MISMATCH). Worked numbers: Example B (Part 14).

**Non-goal.** Does NOT define a fit algorithm for mismatched cases (they are out of the safe
subset, not assigned ad-hoc behavior); does NOT forbid publishers from authoring mismatches
in general (not forbidden by web standards — just unsupported here); does NOT cover SVG-body
targets (that is S2's conditional, left unchanged); does NOT claim community adoption beyond
recipe-0004 advice.

---

### R-S5 — Coordinate mapping within S4 compositions (N4 S5)

**Provenance: `[DERIVED]`**

**Requirement.** Within any R-S4-conforming composition, every landmark point `(u, v)` of the
painted Canvas maps to `(Tx + k·u, Ty + k·v)` in the target Canvas space, where
`k = Tw/Wb = Th/Hb` (painted form) resp. `k = W'/W = H'/H` (replacement form). Implementations
MAY rely on this identity; validators SHOULD emit it as the predicted geometry.

**Rationale.** Direct consequence of the uniqueness of the uniform scale under equal aspect
(the [DERIVED] coincidence theorem); validated in browsers.

**Evidence.** `[DERIVED]` E16 same-aspect results + resolver logic (`src/e16/comparison.ts`);
`[BROWSER]` validation E17 F6 (composed bands match analytic coincidence tri-engine).

**Conformance predicate (mechanical).** Pure function of conforming inputs; assert emitted
mapping equals `(Tx + k·u, Ty + k·v)` for sampled landmarks (e.g., tick (40,40) → (80,80)
for k=2; → (730,310) for T=(710,290), k=0.5).

**Failure example.** A validator emitting `(Tx + k_x·u, Ty + k_y·v)` with distinct axis
scales for a conforming input contradicts S5 (such dual-scale output is only meaningful for
mismatched inputs, which S4 already rejects).

**Non-goal.** Holds ONLY inside S4-conforming compositions; says nothing about rasterization,
device pixels, or anti-aliasing; does not extend to aspect-mismatched cases (undefined there
by design).

---

### R-S6a — Target fragment syntax and interval semantics (N4 S6, normative part)

**Provenance: `[NORMATIVE]`**

**Requirement.** Targets and body-scoped fragments use Media Fragments URIs: `t=` for
temporal, `xywh=` for spatial addressing. Temporal intervals are half-open `[begin, end)`
per MF §4.2.1. Percent coordinates split per-axis per MF §4.2.2 (x,w percentages of width;
y,h of height), with `percent:` the normative prefix. Selector-side coordinate semantics may
alternatively be expressed via Web Annotation FragmentSelector with
`conformsTo: http://www.w3.org/TR/media-frags/` (WA §4.2.1 chain). Malformed fragments are
non-conforming.

**Rationale.** Syntax and interval semantics are directly normative in W3C Recommendations;
the lab's historical conventions turned out to be the normative readings (half-open windows;
per-axis percent split).

**Evidence.** `[NORMATIVE]` MF REC §4.2.1 (half-open interval sentence quoted in
`research/community-positioning.md` §5); MF REC §4.2.2 (percent axes; pixel coords
resource-intrinsic); WA REC §4.2.1 FragmentSelector conformsTo chain
(`research/n3-source-index.json` ids w3c-media-frags, w3c-web-annotation).

**Conformance predicate (mechanical).** Grammar check per MF ABNF for `t=`/`xywh=` values;
assert parseability and well-formed ranges where grammar defines them.

**Failure example.** `#t=banana` or `#xywh=1,2,3` → NON-CONFORMING (MALFORMED_FRAGMENT).
(Out-of-range-but-well-formed handling stays out of scope — see Non-goal.)

**Non-goal.** Does NOT specify invalid/out-of-bounds fragment behavior (E14-era [OPEN],
unchanged); does NOT govern crop-vs-place for MEDIA-side fragments (only painting-target
placement is clarified in Part 8); does not promise any consumer parses or honors anything
(that is R-S8b).

---

### R-S6b — `pct:` alias acceptance (N4 S6, profile part)

**Provenance: `[PROFILE]`**

**Requirement.** Consumers/validators operating under this profile SHOULD accept the
historical IIIF alias prefix `pct:` in `xywh=` fragments as equivalent to the normative
`percent:` prefix. Canonical serialization remains `percent:`.

**Rationale.** Existing IIIF ecosystem material uses `pct:`; acceptance preserves backward
compatibility without altering normative semantics (MF §4.2.2 names `percent:`/`pixel:`).

**Evidence.** `[NORMATIVE]` base: MF §4.2.2 prefixes. Alias practice recorded in the lab's
own fixtures/experiments (exp4 `xywh=pct:50,0,25,25`; bug-fix #10) — `[DERIVED]` ecosystem
observation; the acceptance rule itself is `[PROFILE]`.

**Conformance predicate (mechanical).** Parser accepts both prefixes; normalized output
identical for `pct:50,0,25,25` and `percent:50,0,25,25`.

**Failure example.** A validator rejecting `xywh=pct:50,0,25,25` outright violates R-S6b
(SHOULD-level).

**Non-goal.** Does NOT rewrite normative syntax; does NOT promise consumers accept the alias
(untested at consumer level).

---

### R-S7 — Exclusions (N4 S7 = P6 boundary)

**Provenance: `[PROFILE]`**

**Requirement.** Profile-conforming resources MUST NOT rely on, and profile-conforming
consumers MUST NOT promise geometry for, the following patterns: (a) painting bodies without
explicit viewBox; (b) CSS-background-image painting channels; (c) naive attribute-mode
insertion of SVG expecting region geometry. Full exclusion list with rationale: Part 10.

**Rationale.** Each pattern either resolves to multiple incompatible readings (a: three
coexisting readings, E15 §4.1/E17 F2) or cannot paint into a region at all under its own
normative semantics (b: `background-size:auto` uses natural size, CSS Images 3 §4.3.1; c:
natural-size top-left drawing). Excluding them is a portability boundary — NOT a claim that
web standards forbid these patterns.

**Evidence.**
- `[BROWSER]` (a): E15 R2 + E17 F2/F3 tri-engine reproduction.
- `[NORMATIVE]` (b)/(c) semantics: CSS Images 3 §4.3.1/§4.5; SVG 1.1 §7.12 (E15 R4/R5);
  background-channel cells were measured Chromium-only (E15) and are additionally covered by
  the normative CSS default-sizing algorithm, so exclusion does not rest on single-engine
  generalization.
- `[PROFILE]` the boundary decision itself.

**Conformance predicate (mechanical, resource side).** Reject any SVG painting body without
root viewBox (same check as R-S1); flag manifests whose expected geometry depends on
background-channel or naive-insertion embeddings (declared via profile metadata in future
tooling; detection heuristic documented in the conformance matrix).

**Failure example.** A publisher ships an overlay relying on `<img>` intrinsic-stretch of a
viewBox-less body and expects identical geometry from a nested-svg consumer → out of subset;
any interop complaint is answered with "non-conforming resource", not a bug report.

**Non-goal.** Does NOT assert standards forbid the excluded patterns; does NOT fix their
behavior; consumer-side enforcement is declarative until capable consumers exist.

---

### R-S8a — Temporal fragment usage permission (N4 S8, producer part)

**Provenance: `[NORMATIVE]`** (syntax); the permission framing is profile bookkeeping

**Requirement.** Producers MAY attach `t=` temporal fragments to targets/bodies per Media
Fragments. Such fragments are syntactically valid and semantically defined (half-open
interval) regardless of consumer behavior.

**Rationale.** Syntax/semantics are normative (R-S6a); producers should not withhold valid
addressing merely because honoring is unproven.

**Evidence.** `[NORMATIVE]` MF §4.2.1; WA chain. Lab usage throughout E1–E16.

**Conformance predicate (mechanical).** Grammar validity per R-S6a.

**Failure example.** None — this is a permission, not an obligation; misuse fails R-S6a
instead.

**Non-goal.** Carries NO rendering/honoring expectation whatsoever (that boundary is
R-S8b).

---

### R-S8b — Temporal consumer honoring: explicitly NOT guaranteed (N4 S8, boundary part)

**Provenance: `[OPEN]`**

**Statement.** Whether ANY consumer honors a temporal fragment (seeks to its start, windows
overlay visibility, etc.) is UNDETERMINED. Ramp 5.1.1 parsed `#t=10,20` without failure but
showed no observable seek in passive capture (currentTime stayed 0, playback paused; probe
cannot distinguish "honors later" from "ignores") — `[UNKNOWN]` (N2 V2). Interaction-level
probes are required before any claim either way. This item MUST NOT be read as a requirement
on producers or consumers; it exists to fence the boundary honestly.

**Evidence.** N2 V2 (`evidence/viewer-matrix.json` probeId N2-ramp-v2-temporal) `[UNKNOWN]` passive; D1 `evidence/viewer-interaction/viewer-interaction-matrix.json` + `evidence/viewer-interaction/probe-ramp-d1-*.json` (Chromium 151.0.7922.34, Ramp 5.1.1 **NOT-HONORED** via valid `.vjs-big-play-button` consumer drive, Mirador 3.4.3 **INCONCLUSIVE/unreachable**) — `research/experiment-log.md` #18 and Part 8 B above.

**Predicate.** None — not implementable as a conformance requirement (Part 17: OPEN / NOT IMPLEMENTABLE YET). The D1 result is a version-scoped consumer observation, not a normative predicate.

**Failure example.** n/a (a promoted claim would BE the failure; none exists in this
profile).

**Non-goal.** Everything about actual honoring.

---

## PART 5 — P1 FORMALIZATION NOTES (detail for R-S1)

Scope of coverage:

1. **Which SVG resources are covered.** Exactly those presented as painting bodies
   (motivation `painting`). SVG used elsewhere — UI chrome, icons, selection-side
   SvgSelector shapes — is OUT of scope. Adjacent precedent noted, not adopted: WA §4.2.7's
   note restricts features of SELECTION-side SVG and is silent on viewBox (N3 §5).
2. **Is viewBox REQUIRED?** REQUIRED precisely for the painting-body usage (R-S1). This is a
   profile requirement, not a reading of SVG: SVG 1.1 does not universally require viewBox;
   the requirement exists because the profile needs an explicit coordinate-space contract.
3. **Are width/height attributes required?** NOT required for conformance. RECOMMENDED
   (SHOULD) and, if present, SHOULD equal the viewBox dimensions: intrinsic reporting follows
   width/height attrs (SVG 1.1 §7.12; E15 §4.3, tri-engine E17 F3), viewBox-only resources
   show known intrinsic-sizing weirdness (Chromium reported naturalWidth 267×150 for a
   viewBox-only SVG — experiment-log bug #12) and were deliberately NOT re-matrixed in E15
   (§7 uncertainty). The recommendation is flagged here transparently as motivated by
   documented measurement limitations; it is a SHOULD, not a silent extension of the N4 MUST.
4. **Are intrinsic dimensions sufficient?** NO. Intrinsic size describes a bitmap-like
   natural size; it does not define how user units map into a target region (Example C,
   Part 14). Conformance cannot be earned via intrinsic size alone.
5. **Nested SVGs.** EVERY SVG document acting as a painting body — at any depth of a composed
   structure — MUST carry its own explicit viewBox. Nesting relocates rather than resolves
   the ambiguity (E16 §4.4 case07: the no-viewBox divergence appears inside inner space,
   scaled outward by whatever fit map applies), so an exempt inner leaf would reintroduce
   exactly the hazard S1 eliminates.
6. **Does preserveAspectRatio affect conformance?** Presence/value of PAR does NOT affect
   whether a resource conforms (only viewBox presence is checked). Whatever PAR is declared
   (including `none`), an S2-compliant consumer applies it deterministically given the
   viewport — token behavior is engine-uniform (E17 F4: xMinYMin / xMidYMid meet /
   xMaxYMax / none / slice all match spec-derived placement tri-engine). Authors are warned
   (informational, not a rule) that PAR determines intra-region placement whenever region
   aspect ≠ viewBox aspect, and that collapsed pipelines let leaf PAR override container fit
   for mismatched aspects (E16 §4.3/E17 F5) — which S2's conditions fence off and P5a makes
   unreachable for Canvas compositions.

---

## PART 6 — P2 FORMALIZATION: THE LAYER MODEL (detail for R-S2)

Five distinct layers; P2 governs exactly one interface between them and MUST NOT be read as
one global transform:

| # | Layer | Governs | Authority |
|---|---|---|---|
| 1 | **Logical Canvas coordinates** | Unit-less space established by Canvas height/width; where regions and landmarks live. | IIIF 3.0 §3.2/§5.3 `[NORMATIVE]` |
| 2 | **SVG coordinate space** | User units inside the SVG document; viewBox↔viewport mapping GIVEN a viewport; PAR alignment. | SVG 1.1 §7.7–§7.12 `[NORMATIVE]` |
| 3 | **Region / viewport assignment** | WHICH rectangle acts as the SVG viewport for a painting body. Assigned BY THIS PROFILE to the targeted region. | R-S2 `[PROFILE]` (nothing in SVG/CSS/IIIF assigns it — E15 R1/N3 §6) |
| 4 | **Browser replaced-element layout** | If the consumer's mechanism is an `<img>`-style channel: concrete-object-size algorithms (fill/contain/none) run UNDERNEATH; with viewBox present the concrete box becomes the SVG viewport (CSS Images 3 §4.5), making layers 2–4 agree; without pre-compositing and with mismatched aspects, the leaf-PAR collapse shows layers 3–4 fighting (E16 §4.3/E17 F5). | CSS Images 3 §4.3–§4.5 `[NORMATIVE]` + collapse `[BROWSER]` |
| 5 | **Rasterization** | Device pixels, anti-aliasing, sub-pixel effects. | Out of conformance scope entirely (tolerance-class methodology, E17 F8). |

What P2 (R-S2) DEFINES: the interface between layers 2 and 3 — the targeted region acts as
the SVG viewport, PAR applied between viewBox and region.

What P2 LEAVES TO THE CONSUMER: the mechanism realizing that interface (nested `<svg>`,
`<img>` under qualifying conditions, internal pre-compositing, or any equivalent); everything
in layer 5; internal architecture.

Pre-compositing condition (explicit): a raw single-stage `<img>`-into-region realization is
conformant ONLY IF (i) region aspect == viewBox aspect — then collapsed and two-stage
pipelines coincide, collapse unreachable — OR (ii) the consumer composites before scaling
(two-stage realized internally). Condition (i) is automatically satisfied for R-S4 Canvas
compositions; it is NOT generally imposed on SVG bodies (that would silently strengthen S2).

Aspect matching, where the profile requires it, lives in R-S4 (Canvas bodies) — its rationale
is not duplicated here.

---

## PART 7 — P5a FORMALIZATION: SAME-ASPECT REPLACEMENT MATHEMATICS

### 7.1 Constraint

Let original/painted Canvas logical dimensions be `W × H` and replacement/target be
`W' × H'` (all positive). Two equivalent forms:

**Ratio form:** `W'/H' = W/H`

**Exact cross-multiplication form (preferred):** `W' · H = H' · W`

For the painted-body form with target rect `(Tx, Ty, Tw, Th)` in target Canvas space and
painted Canvas `(Wb, Hb)`: conform iff `Tw · Hb == Th · Wb`.
For the replacement form: conform iff `W' · H == H' · W` (with `(W,H)` the replaced Canvas).

### 7.2 Numerical tolerance (profile parameter, chosen here — not derived from any standard)

Dimensions are unit-less integers in practice (IIIF 3.0 §3.2):

- Integer values (default path): comparison by exact integer cross-multiplication. Any
  nonzero difference fails. Deterministic, overflow-safe with arbitrary-precision integers.
- Non-integer serializations: validators SHOULD reject them outright; MAY instead accept iff
  `|A − B| / max(A, B) ≤ ε` where `A = Tw·Hb`, `B = Th·Wb` (resp. replacement form), with
  **ε = 10⁻⁶**, documented per implementation. Adopted from the N4 formulation verbatim in
  substance.

### 7.3 Uniform scale and coordinate mapping

Under the constraint, the uniform scale factor is unique:

    k = W'/W = H'/H        (replacement form)
    k = Tw/Wb = Th/Hb      (painted form)

and the coordinate mapping is:

    x' = k·x ,  y' = k·y                     (replacement form)
    x' = Tx + k·u ,  y' = Ty + k·v           (painted form, landmark (u,v))

Rendering consequence within the subset: the painted destination rect EQUALS the target rect
exactly — no letterbox bands, no overflow clipping, no offset. Fill degenerates to uniform
(`sx = sy = k`); contain/meet gives `s = min(k,k) = k` with zero offsets; slice crops
nothing. Every reasonable policy computes the SAME map — which is why conformance is
verifiable black-box without knowing a consumer's internal fit policy.

### 7.4 Why alignment is preserved (Example A preview)

Fractions are invariant: `u/W = k·u/(k·W)` — every point keeps its relative position, so
author-time alignments survive replacement without re-authoring.

### 7.5 Mismatch disposition

If the constraint fails, the painting/replacement is NON-CONFORMING under R-S4 — i.e.,
outside the Safe Interoperability Subset. The profile defines NO fallback fit algorithm, NO
tolerated-mismatch mode, NO behavior at all for this case. Publishers may author such
constructs (web standards do not forbid them); this profile simply promises nothing about
them (Part 15).

---

## PART 8 — FRAGMENTS: SYNTAX VS CONSUMER SUPPORT

**A. Syntax / semantic definition (in force).** Governed by R-S6a/R-S6b/R-S8a:
Media Fragments `t=` (half-open intervals, MF §4.2.1 `[NORMATIVE]`) and `xywh=`
(per-axis percent semantics, `percent:`/`pixel:` prefixes, MF §4.2.2 `[NORMATIVE]`;
`pct:` alias accepted per R-S6b `[PROFILE]`); Web Annotation FragmentSelector
`conformsTo` chain available for selector-form expressions (WA §4.2.1 `[NORMATIVE]`).
Placement clarification adopted per N3 contradiction #3: for PAINTING TARGETS in Canvas
space, a spatial fragment PLACES content into the region; it does not CROP the target
Canvas `[PROFILE clarification, grounded in N3 §8 #3]`. Media-side fragments retain MF's own
semantics untouched.

**B. Consumer support (NOT guaranteed).** The profile MUST NOT and DOES NOT claim "consumer X
will honor the fragment". Recorded status:

- Temporal honoring: `[OPEN]` fence retained — no requirement. N2 passive capture (Ramp V2) was `[UNKNOWN]` (no seek at 0, autoplay-blocked). D1 interaction probe (Chromium 151, valid consumer-owned drive via `.vjs-big-play-button`, `evidence/viewer-interaction/viewer-interaction-matrix.json`, `research/experiment-log.md` #18) provides version-scoped evidence: Ramp 5.1.1 **NOT-HONORED** for `#t=10,20` Canvas target (settled 2.65/2.64 vs control 2.63/2.64, delta 0.01, `hasMediaFragmentInSrc:false`), Mirador 3.4.3 **INCONCLUSIVE / unreachable** (no consumer-owned AV playback control found, native `controls:true` only). Not promoted to normative requirement.
- Spatial parsing robustness: Ramp parsed `#xywh=` without failure (N2 V3) `[CONSUMER
  observation]` — parsing ≠ honoring; no geometry claims follow.
- What IS guaranteed for conforming resources: fragments are well-formed and their interval/
  axis semantics are unambiguously defined by the cited Recs; validators can check syntax
  mechanically.
- What is NOT guaranteed: seeking, windowing, cropping, highlighting, or any other
  application of a fragment by any consumer.

---

## PART 9 — Z-ORDER: DELIBERATELY UNSOLVED

- There is NO universal z-order guarantee in this profile. Stacking semantics across
  consumers are `[OPEN]`: IIIF's own recipes contradict each other (0036/0033 say
  first-painted = bottom "like z-index"; 0489 describes its one capable viewer putting the
  FIRST resource most foregrounded) and Mirador 3's reversal is deliberate
  (mirador#2607) — `[COMMUNITY]` evidence cuts against portability (N3 §4, §7).
- Local conventions MAY exist: the lab may keep item-order stacking as a local convention for
  its own renderer set; this profile does not certify it.
- Consumer-specific behavior MAY differ: conformance to this profile implies NOTHING about
  stacking order.
- A profile-level ordering convention (e.g., "first annotation = bottom") is identified as a
  **FUTURE PROFILE EXTENSION** candidate, contingent on consistent community practice or
  normative uptake (4.0 draft has ascending-z-index wording — draft-only). It is NOT a
  current requirement and MUST NOT be assumed by implementations claiming this profile.

---

## PART 10 — EXCLUSIONS (formalized N4 S7 / P6)

For each: name → why outside the safe subset → status distinction. Universal caveat: ALL
exclusions are boundaries OF THIS PROFILE; none claims the pattern is forbidden by web
standards.

| # | Excluded feature | Why outside | Unsupported-by-profile vs forbidden-by-standard |
|---|---|---|---|
| X1 | Arbitrary aspect-ratio replacement / nesting | Fit policy becomes observable and no universal correct answer exists (synthetic ~405-unit divergence, Part 14 Example B; measured Δ386.4, E16 case03); defining one would invent vocabulary E15–E17/N3 jointly advise against standardizing yet `[OPEN]` | unsupported here; permitted by web standards |
| X2 | Reliance on implicit intrinsic SVG dimensions (viewBox-less bodies) | Three coexisting readings per mechanism, engine-uniform (E15 §4.1 `[BROWSER]` + E17 F2/F3); intrinsic size is not a coordinate contract (Example C) | unsupported here; SVG permits viewBox-less docs |
| X3 | Unspecified fit algorithms / fit-keyword vocabularies | No standardized algorithm exists to cite (verified absence, N3 §3/E16 §2); any keyword would be invented vocabulary `[OPEN]` | n/a — profile declines to define |
| X4 | Consumer-specific SVG painting-body assumptions | No deployed consumer tested realizes painting-body geometry at all (Ramp crashes on any secondary body incl. PNG, V4–V6; Mirador silently drops, M2) `[VIEWER_GAP]`/`[OPEN]` | consumer gap, not a standards prohibition |
| X5 | Relying on Canvas-as-body composition being RENDERED by current consumers | Permission is `[NORMATIVE]` (IIIF 3.0 §5.7) but realization is unproven: Ramp crashes (V7), Mirador drops (M3) — zero positive instances `[OPEN]` | data-level expressible; rendering-level unsupported today |
| X6 | Z-order assumptions | Recipes self-contradict; Mirador reversal deliberate (N3 §4/§7) `[OPEN]` | local conventions allowed; no cross-consumer claim |
| X7 | Reliance on temporal consumer honoring | Passive probes inconclusive (N2 V2 currentTime 0) `[UNKNOWN]`/`[OPEN]` | syntax fine; application unguaranteed |
| X8 | Two-stage composition through real consumers (pre-composited inner Canvas honoring container fit) | Browser pipelines demonstrably collapse composition for aspect-mismatched cases (leaf-PAR override, E16 §4.3 `[BROWSER]` + E17 F5); no consumer counter-instance found | browser fact + consumer gap; not forbidden by standards |

Excluded-channel specifics retained from N4/E15: CSS-background painting
(`background-size:auto` never scales natural-dimension images — CSS Images 3 §4.3.1
`[NORMATIVE]`; E15 background cells I-NATURAL-TOPLEFT) and naive attribute-mode insertion
(natural-size top-left drawing). Nothing re-added without new evidence.

---

## PART 11 — CONFORMANCE MODEL

Three concepts kept separate; they are NOT interchangeable.

### 11.1 Resource conformance (STRONG — fully defined now)

A manifest/resource is **profile-conforming** iff every requirement R-S1, R-S3, R-S4, R-S5,
R-S6a, R-S6b, R-S7, R-S8a evaluates true (or permissible per SHOULD/MAY) and no exclusion
X1–X8 is relied upon. All predicates are static/arithmetic — parseable and computable
without a browser or viewer. This is the conformance class this draft certifies tooling
against (validator design: `research/conformance-matrix.md`).

Resource conformance asserts: the geometry CONTRACT is well-defined. It does not assert any
implementation renders it.

### 11.2 Consumer conformance (LIMITED — declarative only in this draft)

Obligations: realize R-S2 (region-as-viewport with the stated raw-channel conditions), parse
R-S6a/R-S6b, honor R-S7's boundary (promise no geometry for excluded patterns), and make no
claims beyond Part 15.

Honest limitation, stated plainly: **consumer conformance cannot currently be VERIFIED
because no tested consumer supports the necessary painting-body types at all** — Ramp 5.1.1
error-boundary-crashes on any secondary painting body (SVG, raster, Canvas-as-body alike)
and Mirador 3.4.3 silently drops them (N2). Zero consumer-side geometric readings exist.
Therefore this draft defines strong RESOURCE conformance and only a DECLARATIVE consumer
conformance model; no implementation may claim certification, and the certification harness
is undefined until a capable consumer exists (test-fixture design ready in
`research/conformance-matrix.md` §Test suite, consumer rows).

### 11.3 Interoperability claim (conditional)

Two implementations MAY be expected to produce EQUIVALENT GEOMETRY for a resource iff:

1. the resource is profile-conforming (11.1), and
2. both implementations are consumer-conforming per 11.2 (at minimum R-S2 + R-S6a/b), and
3. equivalence is compared in LOGICAL CANVAS COORDINATES within documented measurement
   tolerance — never as pixel identity (Part 15; tolerance-class methodology throughout
   E15–E17).

Today condition 2 is unverifiable against deployed consumers, so the interoperability claim
is CONDITIONAL/THEORETICAL. What is deliverable NOW is publisher-side determinism (11.1):
inside the subset, every reasonable interpretation coincides analytically (R-S4 rationale)
and the known browser hazards are unreachable — so conforming DATA is stable against future
capable consumers regardless of which compliant mechanism they choose.

---

## PART 12 — CONFORMANCE MATRIX

See companion `research/conformance-matrix.md` (requirement matrix: ID / requirement / type /
testable? / test mechanism / evidence / status; plus black-box test-suite design T01–T12).
Not duplicated here.

---

## PART 13 — BLACK-BOX TEST SUITE DESIGN

See `research/conformance-matrix.md` §"Black-box test suite design" (T01–T12 with fixture,
input, expected result, failure condition, determinism, browser-dependence,
consumer-dependence). Design only — intentionally NOT implemented in this stage.

---

## PART 14 — WORKED EXAMPLES

### Example A — same-aspect replacement: 1920×1080 → 3840×2160

Original Canvas C: `1920 × 1080` (16:9). Replacement C′: `3840 × 2160`.

- Exact check: `W' · H = 3840 · 1080 = 4,147,200`; `H' · W = 2160 · 1920 = 4,147,200`. Equal
  → conforming.
- Uniform scale: `k = 3840/1920 = 2160/1080 = 2`.
- Mapping: `x' = 2x`, `y' = 2y`.
- Landmarks (from the N4 overlay): centre circle `(960,540)` r=100 → `(1920,1080)` r=200;
  corner tick `(40,40)` → `(80,80)`.

Alignment is preserved because fractions are invariant: the tick sits at 1/48 of width and
1/27 of height BEFORE and AFTER; the circle stays centred. Policy check: fill
`sx=sy=2`; contain `min(2,2)=2`, offsets `(3840−3840)/2=(2160−2160)/2=0`; slice excess `0`.
Every policy computes the identical map — replacement requires no knowledge of any consumer's
fit internals. (Browser confirmation: E17 F6 same-aspect control unanimous tri-engine.)

### Example B — aspect-ratio mismatch: 1920×1080 → 2000×2000

Check: `W'·H = 2000·1080 = 2,160,000` vs `H'·W = 2000·1920 = 3,840,000`. Unequal → NON-CONFORMING. *(AMB-N6-1 resolution, 2026-08-25: the second product previously quoted here as `1080·1920 = 2,073,600` equaled H·W, not H'·W; corrected to the formula-consistent value with the verdict unchanged — see `n6-implementation-report.md` §9.)*

- No uniform k exists: `k_x = 2000/1920 ≈ 1.0417` but `k_y = 2000/1080 ≈ 1.8519`; forcing
  either single value overflows/letterboxes the other axis. A uniform scale cannot
  simultaneously satisfy both dimensions — that is the definition of aspect mismatch.
- Different fit policies become observably different for tick `(40,40)`:
  fill → `(41.7, 74.1)`; contain → scale `1.0417`, drawn height 1125, offset
  `(2000−1125)/2 = 437.5` → `(41.7, 479.2)`. Same input, ≈405 units apart vertically — while
  the circle CENTRE lands identically `(1000,1000)` under both: centred invariants hide the
  divergence; off-centre landmarks expose it.
- Measured instance of the same phenomenon: E16 case03 (inner 1000×1000 onto full
  1920×1080): composed tick lands at x=76.8 (fill) vs x=463.2 (contain), Δ=386.4 Canvas
  units (`landmark-spot-check.json`), both bands visible in one frame through the browser
  pipeline (E16 §4.3; tri-engine E17 F5).
- Therefore the profile EXCLUDES the case: no spec names an algorithm, so any assigned
  behavior would be invention. The mismatch is non-conforming (outside the Safe
  Interoperability Subset), not assigned a fallback.

### Example C — SVG without explicit viewBox

Body: `<svg xmlns="…" width="1000" height="1000"><circle cx="500" cy="500" r="100"/></svg>`
(no viewBox) painted at `xywh=480,270,960,540`.

The intrinsic dimensions `1000×1000` (from width/height attributes, SVG 1.1 §7.12 —
browser-reported identically tri-engine, E17 F3) describe a natural BITMAP-LIKE size. They do
NOT answer the profile's question: how do USER UNITS map into the target REGION? Measured
answers differ by mechanism (E15 §4.1; tri-engine E17 F2): nested-svg region-painting maps
user units 1:1 onto the region; `<img>` default/fill stretches the intrinsic canvas
non-uniformly onto the region; CSS contain/none apply object-fit geometry. One resource,
three geometries — none selected by any standard (`[BROWSER]`+`[OPEN]`). Intrinsic
dimensions therefore do not provide the coordinate-space CONTRACT the profile needs; only an
explicit viewBox does (which is why R-S1 rejects this resource regardless of its intrinsic
size).

### Example D — temporal fragment

Target: `http://…/canvas1#t=10,20`.

- Guaranteed (syntax/semantics level): the fragment is well-formed (R-S6a) and denotes the
  half-open interval `[10 s, 20 s)` — begin included, end excluded — by MF §4.2.1
  `[NORMATIVE]`. A validator can verify this deterministically.
- NOT guaranteed (consumer level): that any player seeks to t=10 or stops at t=20. Ramp 5.1.1
  parsed it without failure; N2 passive capture was `[UNKNOWN]` (currentTime 0, paused, autoplay-blocked). D1 interaction probe (Chromium 151, valid consumer-owned drive, `evidence/viewer-interaction/viewer-interaction-matrix.json`, `research/experiment-log.md` #18) shows Ramp 5.1.1 **NOT-HONORED** for `#t=10,20` Canvas target when driven through its own playback surface, and Mirador 3.4.3 **INCONCLUSIVE / unreachable** (no consumer-owned control). R-S8b remains `[OPEN]` fence; temporal support stays outside the guaranteed set.

---

## PART 15 — NEGATIVE GUARANTEES

## What conformance does NOT guarantee

Profile conformance — of a resource OR a consumer — implies NONE of the following:

1. **Pixel-identical rendering.** All geometric evidence in E15–E17 is tolerance-classified
   (coverage ≥ 0.8 masks, AA dilation; decisive scores ≥ 0.86; limits ~24 Canvas units).
   The subset promises analytic-coordinate agreement, never pixel equality.
2. **Identical anti-aliasing.** Engine- and zoom-dependent; explicitly out of scope
   (E17 F8 records a measurement limitation honestly rather than papering over it).
3. **Identical rasterization.** Layer-5 effects (device pixels, sub-pixel behavior) are
   outside the contract (Part 6).
4. **Consumer support for unsupported painting bodies.** Ramp 5.1.1 error-boundary-crashes on
   ANY secondary painting Image body INCLUDING plain PNG (V4–V6); Mirador 3.4.3 silently
   drops them (M2). The profile describes data-level interoperability, not current viewer
   rendering.
5. **Temporal fragment honoring.** Syntax is normative (R-S6a); application remains outside guarantees (R-S8b `[OPEN]`). N2 passive was `[UNKNOWN]`; D1 interaction probe (Ramp 5.1.1 **NOT-HONORED** for `#t=10,20` Canvas target via consumer-owned drive, Mirador 3.4.3 **INCONCLUSIVE/unreachable**, `evidence/viewer-interaction/viewer-interaction-matrix.json`) — no general honoring promise exists.
6. **Z-order.** No stacking guarantee across consumers; recipes disagree; Mirador's reversal
   is deliberate (Part 9).
7. **Arbitrary aspect-ratio replacement.** Mismatched aspects are non-conforming; NOTHING is
   promised about them — not fill, not contain, not anything else (X1).
8. **A universal SVG-to-Canvas fit algorithm.** The profile defines no fit algorithm
   anywhere; IIIF's "scale into the space" duty has none to inherit (verified absence).
9. **Two-stage composition.** No tested consumer pre-composites an inner Canvas honoring
   container fit; naive pipelines actively flatten composition (leaf-PAR collapse, E16 §4.3
   `[BROWSER]` + E17 F5) (X8).
10. **Identical browser layout in non-profile-conforming cases.** Outside the subset —
    no-viewBox bodies, mismatched nestings, background channels — even tri-engine agreement
    would not create a guarantee; for the collapse phenomenon specifically engines AGREE on
    contain-like flattening through the `<img>` pipeline (E17 F5), contradicting
    fill-declarations rather than rescuing them.
11. **(Standing) No silent upgrades.** Nothing `[OPEN]` acquired rule status here; nothing
    `[BROWSER]` was promoted for three-engine agreement; nothing `[COMMUNITY]` was promoted
    for cookbook backing. Cross-engine agreement establishes browser behavior, never
    standards provenance.

---

## PART 16 — RELATION TO EXISTING STANDARDS

Legend for "What our profile adds": **ADOPTS** = inherits existing semantics unchanged;
**CONSTRAINS** = narrows an existing degree of freedom; **INTRODUCES** = profile-specific
interoperability rule with no external anchor.

| Profile rule | External source | What source actually says | What our profile adds |
|---|---|---|---|
| R-S1 explicit viewBox | SVG 1.1 §7.7–§7.10, §7.12 | viewBox declares the user coordinate system; PAR maps it onto a viewport WHEN one exists; intrinsic sizing from width/height attrs. SVG nowhere universally requires viewBox and assigns no embedder a viewport obligation. | INTRODUCES the painting-body requirement (no external anchor found — N3 §8 #4); built ON the normative primitives; motivated by `[BROWSER]` E15+E17 F1/F2/F3. |
| R-S1 (context) | IIIF Presentation 3.0 (whole doc) | Zero occurrences of "svg"/"image/svg+xml" (verbatim scan, N3 §3) | Confirms the rule is NOT a restatement — genuinely profile-level. |
| R-S2 region-as-viewport | SVG 1.1 §7.7–§7.10; CSS Images 3 §4.5 | Deterministic viewBox↔viewport mapping given a viewport; for `<img>`, the concrete object size becomes the SVG viewport. Neither assigns embedders an obligation. | INTRODUCES the consumer viewport assignment + conditional raw-channel clause; `[BROWSER]` basis E15 R1 + E17 F1/F5. |
| R-S2 (contrast) | WA §4.2.7 SvgSelector | For SELECTION shapes: SVG dimensions MUST map proportionally to Source dimensions (stretch-style; no aspect logic). | Records adjacent tension, adopts nothing from it (different side, different model) — `[OPEN]` contrast per N3 §8 #1. |
| R-S3 Canvas dimensions | IIIF 3.0 §3.2, §5.3 | Width/height "convey an aspect ratio for the space in which content resources are located"; values unit-less; renderers must scale content into Canvas space. | ADOPTS semantics; CONSTRAINS membership (positivity/integer presence required for participants) as profile rule. |
| R-S4 / P5a | IIIF 3.0 §5.3 | "Renderers must scale content into the space represented by the Canvas" — duty WITHOUT algorithm; "scaled"/fit-algorithm strings absent (searches, N3 §3). | INTRODUCES same-aspect constraint as the profile's way of satisfying the duty WITHOUT inventing a fit rule. Does NOT imply IIIF standardizes P5a. |
| R-S4 (permission frame) | IIIF 3.0 §5.7 | "A Canvas may be treated as a content resource for the purposes of annotating it on to other Canvases." | ADOPTS the permission verbatim; adds nothing to it. |
| R-S4 (community convergence) | Cookbook recipe 0004 `[COMMUNITY]` | "The aspect ratio should be consistent between your source image and Canvas. Otherwise, you'll see unpredictable stretching and/or distorting." | Independent convergence motivating the rule; NOT normative authority; rank stays `[PROFILE]`. |
| R-S5 mapping | (no external source — consequence) | — | DERIVED from R-S4 uniqueness argument; `[BROWSER]`-validated E17 F6. |
| R-S6a fragments | MF REC §4.2.1 / §4.2.2; WA §4.2.1 | Half-open temporal intervals; per-axis percent split with `percent:`/`pixel:` prefixes; FragmentSelector conformsTo chain. | ADOPTS wholesale; clarifies painting-target PLACE-not-CROP (grounded in N3 §8 #3 tension record). |
| R-S6b `pct:` alias | MF §4.2.2 | Names `percent:` (and `pixel:`) prefixes; `pct:` is ecosystem usage. | INTRODUCES alias acceptance `[PROFILE]` for compatibility. |
| R-S7 exclusions | CSS Images 3 §4.3.1/§4.5; SVG 1.1 §7.12 | Default sizing keeps natural size for backgrounds; intrinsic sizing from attributes; object-fit algorithms exact. | INTRODUCES the portability boundary; explicitly NOT a standards-forbidden claim. |
| R-S8a/b temporal | MF §4.2.1; N2 V2 | Interval semantics normative; consumer honoring unobserved. | ADOPTS syntax; fences honoring as `[OPEN]` (no promotion). |

Special notes requested by the brief:

- IIIF Presentation 3 §5.3: supplies the scaling DUTY only. P5a does not reinterpret it; it
  constrains how publishers keep every conforming interpretation identical. IIIF does not
  standardize P5a's fit rule — P5a is a profile constraint motivated by evidence
  ([DERIVED]+[BROWSER]) and community convergence ([COMMUNITY]).
- IIIF Presentation 3 §5.7: verbatim permission for Canvas-as-body, adopted unchanged; the
  profile adds the same-aspect condition for interoperable use (R-S4), not a reading of §5.7.
- MF §4.2.1/§4.2.2: adopted as-is; the profile's only additions are alias acceptance and the
  place-not-crop clarification for painting targets.
- WA FragmentSelector: adopted as an alternative selector-side expression chain.
- WA SvgSelector: recorded as CONTRAST only (stretch-model, selection-side); it neither
  supports nor refutes S2.
- SVG viewBox/PAR semantics: adopted as mechanism truth GIVEN a viewport; the viewport
  assignment itself is the profile's contribution.

---

## PART 17 — IMPLEMENTATION READINESS

Question: can the profile now be implemented as a deterministic validator?

| Rule | Classification | Note |
|---|---|---|
| R-S1 explicit viewBox | READY FOR IMPLEMENTATION | Static XML parse of root element; deterministic; fixtures already exist (`public/svg/e15/*`). |
| R-S3 Canvas dimensions | READY FOR IMPLEMENTATION | JSON parse + integer/positivity assertions. |
| R-S4 same-aspect (P5a) | READY FOR IMPLEMENTATION | Exact integer cross-multiplication (or documented ε path); fully deterministic; no I/O beyond parsing. |
| R-S5 coordinate mapping | READY FOR IMPLEMENTATION | Pure function emission of predicted landmark tables. |
| R-S6a fragment syntax | READY FOR IMPLEMENTATION | MF grammar parser; malformed-fragment rejection deterministic. Out-of-bounds semantic handling stays OUT (unresolved since E14 — not a validator gap, a scope fence). |
| R-S6b pct alias | READY FOR IMPLEMENTATION | Prefix normalization; trivially deterministic. |
| R-S7 exclusions (resource side) | READY FOR IMPLEMENTATION | viewBox rejection shares R-S1 machinery; background/naive-insertion reliance detectable from profile metadata declarations (heuristic documented in matrix). |
| R-S8a temporal usage permission | READY FOR IMPLEMENTATION | Shares R-S6a parser. |
| R-S2 region-as-viewport consumer contract | NEEDS TEST FIXTURE | Consumer-side obligation; predicate is observable (landmark/destination checks à la E15 classifier) but requires a consumer that claims region-painting support. No such consumer found (N2). Fixture design ready (matrix T-row family); implementation blocked on a capable consumer, not on design. |
| R-S7 exclusions (consumer side) | NEEDS TEST FIXTURE | "Consumer promises no geometry for excluded patterns" verifiable only against real consumers; same blocker as R-S2. |
| R-S8b temporal honoring | OPEN / NOT IMPLEMENTABLE YET | Passive probes proven insufficient (N2 V2); needs interaction-level consumer driving; no predicate definable from existing evidence. |
| Z-order (Part 9) | OPEN / NOT IMPLEMENTABLE YET | Contradictory community evidence; future-extension candidate only. |
| Fit algorithm for mismatched aspects (X1/X3) | OPEN / NOT IMPLEMENTABLE YET | Deliberately undefined; any implementation would violate the profile. |
| Two-stage composition verification (X5/X8) | OPEN / NOT IMPLEMENTABLE YET | No realizing consumer; browser-level collapse is characterized but consumer-level behavior unobtainable (N2). |
| Interoperability claim (11.3) | NEEDS SPEC CLARIFICATION (external dependency) | Conditional on consumer conformance becoming verifiable; blocked by ecosystem capability, not by this document. |

Items needing spec clarification INSIDE this profile: none — every mechanically checkable
rule has a complete predicate. The one genuine spec-level unknown affecting future versions
remains the fit-algorithm question, which this profile deliberately sidesteps (R-S4) rather
than resolves.

Verdict: YES — the resource-conformance half of the profile is implementable NOW as a
deterministic, browser-free validator (8 of 10 requirement rules READY). The
consumer-conformance half is correctly deferred behind missing ecosystem capability, with
fixture designs prepared.

---

## Validation record (N5)

1. `pnpm check` — clean (TypeScript untouched; docs-only change).
2. `git diff --check` — clean (no whitespace errors).
3. Every MUST/MUST NOT/SHOULD/MAY appears in a block with Rationale + Evidence + Non-goal
   (checked per requirement R-S1…R-S8b, Parts 5–10).
4. Every `[NORMATIVE]` claim carries a named source (IIIF 3.0 §§3.2/5.3/5.7; MF §§4.2.1/4.2.2;
   WA §§4.2.1/4.2.7; SVG 1.1 §§7.7–7.12; CSS Images 3 §§4.3–4.5) — audited in Part 16 table.
5. Every `[BROWSER]` claim traces to E17 findings F1–F6 (single-engine E15 rows cited only as
   re-verified through E17, or explicitly scoped Chromium-only where E17 did not re-run them —
   background-channel cells).
6. Every `[COMMUNITY]` claim traces to N3 (`research/community-positioning.md` §§3–8;
   `research/n3-source-index.json` ids cookbook-0004/0029-region/0033/0036/0489,
   iiif-api-1190/#1191, mirador issues).
7. Every `[PROFILE]` rule is explicitly identified as profile-specific (taxonomy Part 3 +
   per-rule Provenance lines + Part 16 "adds" column).
8. No `[OPEN]` issue became an implicit requirement: OPEN items appear only as statements,
   fences (R-S8b), exclusions (X1–X8), or future extensions (Part 9) — verified by the audit
   in Part 15 #11.
9. P5a has a deterministic conformance predicate (Part 7: exact integer cross-multiplication;
   optional documented ε ≤ 10⁻⁶ path; unique-k mapping).
10. No final-report/profile source file modified — this session creates only
    `research/profile-draft.md` and `research/conformance-matrix.md` (verified via git status).

No contradiction between N4 and earlier evidence was found during formalization; the only
terminology reconciliation needed ([CONVENTION]-era labels vs the six-class taxonomy) is the
one N4 itself already documented ("ranks clarified, not changed").
