# N4 — Safe-Subset Decision (Stage 4)

Date: 2026-08-22
Plan: `research/next-session-plan.md` Stage 4 (PRIORITY 3).
Inputs: E15 (`research/e15-report.md`, `evidence/e15/`), E16 (`research/e16-report.md`,
`evidence/e16/`), E17 (`research/e17-report.md`, `evidence/e17/`), N2
(`research/viewer-interop-report.md`, `evidence/viewer-matrix.json`), N3
(`research/community-positioning.md`, `research/n3-source-index.json`), candidate profile
P1–P6 (`research/e15-e16-final-report.md` §9).

Question answered:

> What is the smallest useful interoperability-safe profile we can recommend today, based on
> the existing evidence, without pretending that unresolved semantics are standardized?

Claim labels used throughout (mandated vocabulary):

| Label | Meaning |
|---|---|
| `[NORMATIVE]` | Directly supported by an authoritative specification (source named) |
| `[BROWSER]` | Reproduced browser behavior, incl. E17 three-engine replication |
| `[COMMUNITY]` | Independent ecosystem / recipe / implementation convergence |
| `[DERIVED]` | Consequence of our experiments or resolver logic |
| `[PROFILE]` | Deliberate rule proposed by THIS interoperability profile |
| `[OPEN]` | Not sufficiently determined; must not be silently promoted |

Standing honesty rules applied: cross-engine agreement never promotes a claim to normative
rank; IIIF implementation conventions never become standards claims; implementation
recommendations never convert into normative text. Dispositions do not force every P to SAFE.

---

## PART 1 — Evidence synthesis for P1–P6

Current statements and ranks are quoted from `research/e15-e16-final-report.md` §9 as updated
by N3 §10 (`research/community-positioning.md`). No statement text was modified by this stage.

### P1 — Explicit viewBox on SVG painting bodies

| Field | Content |
|---|---|
| Current statement | "Every SVG painting body MUST declare an explicit `viewBox`." — rank `[CONVENTION]` on normative primitives |
| E15 evidence | 176-cell matrix: with viewBox, every region-painting mechanism agrees with I-REGION-VIEWPORT in all distinguishable cells; without it, three coexisting readings (§4.1–4.2). Falsification verdict: "NOT falsified — strengthened" (§6) |
| E16 evidence | case07: nesting relocates rather than resolves the no-viewBox divergence (§4.4); renderer disagreement confined to the no-viewBox overlay across all 16 fixture×reading runs (§4.1) |
| E17 evidence | F1 explicit-viewBox region-painting unanimous tri-engine; F2 no-viewBox hazard reproduced identically tri-engine; F3 intrinsics identical incl. attribute-less SVG. 62/62 rows unanimous |
| N2 evidence | Dimension unobservable in consumers: Ramp 5.1.1 crashes byte-identically with and without viewBox (V4 vs V5); Mirador drops both silently (M2). Neither refutes nor confirms at consumer level |
| N3 evidence | Zero external anchor found: Presentation 3.0 contains zero occurrences of "svg"/"image/svg+xml"; WA SvgSelector note restricts features but is silent on viewBox. Genuinely new convention; survives falsification attempt unrefuted but unsupported (N3 §8.4) |
| Normative provenance | None for the rule itself. Built entirely on `[NORMATIVE]` primitives: SVG 1.1 §7.7–7.10 (viewBox↔viewport mapping given a viewport), §7.12 (intrinsic sizing), CSS Images 3 §4.5 (concrete object size becomes the SVG viewport for `<img>`) |
| Community provenance | None (that is the N3 finding). Adjacent precedent only: WA feature-restricted SVG shows community writes mapping sentences when motivated |
| Remaining uncertainty | Version-scoped engine behavior (SVG 2 intrinsic-sizing risk noted pre-E17 did not materialize in tested versions); consumer uptake unmeasurable today (N2) |
| **N4 disposition** | **SAFE WITH EXPLICIT PROFILE CONDITION** — safe as a `[PROFILE]` rule among region-painting consumers compliant with P2; NOT a normative claim; scope condition stated in Part 4 |

### P2 — Region-as-viewport consumer rule

| Field | Content |
|---|---|
| Current statement | "Consumers SHALL render an SVG painting body such that the targeted region acts as the SVG viewport with preserveAspectRatio applied between body viewBox and region … raw `<img>`-into-region acceptable ONLY when the region aspect equals the viewBox aspect or the consumer composites before scaling." — rank `[CONVENTION]` |
| E15 evidence | R1: `<img>`+viewBox resolves identically to region-as-viewport nested `<svg>` (all 40 distinguishable viewBox cells). R3/R4/R5: object/background channels add their own (normative CSS or document-level) transforms — mechanism choice must be pinned |
| E16 evidence | §4.3 leaf-PAR collapse: through the real `<img>` channel, aspect-mismatched compositions collapse into one stage; the leaf's own PAR overrides container fit even inside a fill-mapped container (case03/case05 bands measured simultaneously in one frame) |
| E17 evidence | F1 (region-as-viewport agreement) and F5 (leaf-PAR collapse: identical run fractions 0.0196/0.1483 in all engines) hold tri-engine |
| N2 evidence | Untestable end-to-end: every probe that would exercise body geometry crashed (Ramp V4–V7) or dropped the body (Mirador M2/M3) before paint. Zero consumer-side geometric readings obtained |
| N3 evidence | Not stated anywhere. Contrast recorded: WA SvgSelector §4.2.7 mandates proportional-stretch mapping for SELECTION shapes — different side, different model; adjacent tension, not support (N3 §8.1) |
| Normative provenance | Mechanism-level only: SVG 1.1 §7.7–7.10 + CSS Images 3 §4.5 make the reading deterministic GIVEN a compliant consumer; neither assigns embedders a viewport obligation |
| Community provenance | None supporting; one adjacent normative rule points elsewhere (stretch model) |
| Remaining uncertainty | No deployed consumer tested realizes the rule today (N2); collapsed pipelines violate it for mismatched aspects unless they composite first (E16/E17 F5) |
| **N4 disposition** | **SAFE WITH EXPLICIT PROFILE CONDITION** — `[PROFILE]` rule whose conditions are load-bearing: (i) target-aspect == viewBox-aspect, OR consumer composites before scaling; (ii) applies only to consumers claiming region-painting support. The full unconditional guarantee is NOT currently demonstrable in any tested deployed consumer |

### P3 — Media Fragments targets (half-open windows, percent axes)

| Field | Content |
|---|---|
| Current statement | Targets use Media Fragments `t=`/`xywh=`; `percent:` normative, `pct:` accepted alias; half-open temporal windows. Rank `[CONVENTION]` + strengthened normative inputs (N3 §10) |
| E15 evidence | Regions published as Media Fragments in the E15 manifest fixture; xywh semantics exercised over 176 cells |
| E16 evidence | Temporal-window nested fixture (Model B) resolvable; inner-canvas temporal propagation agreed by all three renderers `[DERIVED]` |
| E17 evidence | No fragment-semantics divergence surfaced in any engine run (probes were static-geometry by design) |
| N2 evidence | Ramp parses `#t=10,20` and `#xywh=` without failure (V2/V3) but no honoring observable (currentTime stayed 0; autoplay-blocked passive capture) → `[UNKNOWN]` |
| N3 evidence | MF REC §4.2.1 half-open intervals `[NORMATIVE]`; MF §4.2.2 percent axis split + `percent:`/`pixel:` prefixes `[NORMATIVE]`; WA FragmentSelector conformsTo chain `[NORMATIVE]`; MF §7.1 crop-vs-highlight out-of-scope note recorded as tension (N3 §8.3) |
| Normative provenance | Syntax and interval semantics: W3C Media Fragments REC + Web Annotation REC chain |
| Community provenance | IIIF manifests use MediaFragment URIs pervasively (cookbook corpus) |
| Remaining uncertainty | Consumer HONORING of temporal fragments (interaction-level probes needed); invalid/out-of-bounds fragment handling (unchanged since E14) |
| **N4 disposition** | **SAFE** for syntax and interval semantics (normatively anchored); consumer rendering/honoring stays explicitly outside the proven subset |

### P4 — Z-order = AnnotationPage item order

| Field | Content |
|---|---|
| Current statement | "Z-order = AnnotationPage item order." — rank `[CONVENTION]` on stable 3.0, matching 4.0-draft wording |
| E15 evidence | n/a (single-overlay geometry matrix) |
| E16 evidence | Processing-order/z-index classified `[NORMATIVE]` in draft, `[DERIVED]` under stable 3.0 (§6 table) |
| E17 evidence | Not re-probed (out of adversarial subset scope); nothing contradicts |
| N2 evidence | No multi-painting manifest rendered by any consumer → stacking behavior unobservable |
| N3 evidence | Cookbook self-contradiction documented BY IIIF: recipes 0036/0033 say first = bottom ("works like z-index"), recipe 0489 says its one capable viewer puts FIRST = most foregrounded; Mirador 3 reversal deliberate (mirador#2607). `[COMMUNITY]` evidence cuts against portability |
| Normative provenance | 4.0 draft Annotation Page ("ascending z-index from the first annotation encountered") — draft only; absent from stable 3.0 |
| Community provenance | Contradictory across recipes and implementations (above) |
| Remaining uncertainty | Whether any cross-consumer stacking guarantee is achievable at all today |
| **N4 disposition** | **OPEN** as an interoperability claim. The lab may keep item-order stacking as a local `[PROFILE]` convention for its own renderer set, but this profile does NOT certify stacking across consumers |

### P5 / P5a — Nested Canvas overlays; same-aspect subset

| Field | Content |
|---|---|
| Current statement | "Canvas-into-Canvas overlays: expressible now; UNTIL 'fit' is standardized, profiles SHOULD either (a) require target aspect == inner Canvas aspect … or (b) declare one fit as a profile parameter and require non-collapsed consumers. Prefer (a)." — rank mixed supported/`[OPEN]`, strengthened by N3 |
| E15 evidence | Indirect: establishes the body-mapping layer that nesting composes onto (P1/P2 substrate) |
| E16 evidence | fill vs contain destinations diverge measurably for mismatched aspects (case03: `0,0,1920,1080` vs `420,0,1080,1080`; landmark 386 Canvas units apart — `landmark-spot-check.json`); coincide exactly for same-aspect (case01/02); Mode A twin matches BOTH fits only for same-aspect case04 (`modeA-twins.json`: twinMatchesFill AND twinMatchesContain true) |
| E17 evidence | F6: same-aspect control unanimous tri-engine (composed bands match analytic coincidence, `fitsCoincide` true); F5: leaf-PAR collapse reproduces tri-engine (mismatched-case hazard confirmed general) |
| N2 evidence | NO tested consumer realizes nested composition at all: Ramp crashes (V7), Mirador silently drops (M3). Same-aspect safety is currently publisher/data-level, not observed viewer behavior |
| N3 evidence | Stable 3.0 §5.7 verbatim permission for Canvas-as-body `[NORMATIVE]`; §5.3 "Renderers must scale content into the space represented by the Canvas" `[NORMATIVE]` mandate WITHOUT algorithm; recipe 0004 independently recommends consistent aspects ("otherwise, you'll see unpredictable stretching and/or distorting") `[COMMUNITY]`; recipe 0299 names both transform directions, mandates neither `[COMMUNITY]`; api#1190/#1191 show deliberate draft development `[COMMUNITY]` |
| Normative provenance | Permission + scale-into-space duty only. The FIT ALGORITHM has none — verified by whole-document search ("scaled"/"scaled to fit": zero occurrences in 3.0 per N3 §3) |
| Community provenance | Recipe 0004 aspect-consistency advice = independent convergence with P5a |
| Remaining uncertainty | Fit algorithm standardization; consumer realization of two-stage composition; whether community would adopt P5a formally |
| **N4 disposition** | **SAFE WITH EXPLICIT PROFILE CONDITION** — adopted as formal `[PROFILE]` RULE P5a (Part 2). It eliminates the known fit ambiguity while remaining compatible with the `[NORMATIVE]` scale-into-space requirement; it does NOT claim IIIF specifies any algorithm |

### P6 — Exclusions (no-viewBox bodies, background-channel painting, naive attribute insertion)

| Field | Content |
|---|---|
| Current statement | "Bodies without viewBox, CSS-background embedding, and naive attribute-mode insertion are OUT of profile (not forbidden by standards; just not portable)." — rank `[CONVENTION]` |
| E15 evidence | R2: no-viewBox `<img>` stretches intrinsic canvas (spec underdetermined) `[BROWSER]`; R5: background-size:auto never scales natural-dimension images — cannot paint into a region at all `[NORMATIVE]`; attribute insertion draws natural-size top-left |
| E16 evidence | case07 ambiguity relocation extends exclusion into nests; no counter-evidence |
| E17 evidence | F2/F3/F4: the three coexisting readings and intrinsic reporting reproduce identically tri-engine — the hazard the exclusions avoid is engine-uniform |
| N2 evidence | Consumers fail before these distinctions could matter (V5 ≡ V4) — consistent with exclusion, not evidence about it |
| N3 evidence | Nothing found recommending these channels for painting bodies |
| Normative provenance | The excluded behaviors' own semantics where they exist (CSS Images 3 §4.3.1/§4.5; SVG 1.1 §7.12) |
| Community provenance | None endorsing exclusion or inclusion |
| Remaining uncertainty | None material for the exclusion itself |
| **N4 disposition** | **EXCLUDED / MUST NOT** *within this profile* (portability scope): profile-conformant publishers do not ship these patterns and conformant consumers do not promise geometry for them. This is a profile boundary, not a claim that standards forbid them |

---

## PART 2 — P5a decision (highest-priority N4 question)

### Question, narrowed precisely

> Is same-aspect replacement/overlay a safe PROFILE constraint that eliminates the known fit
> ambiguity while remaining compatible with IIIF's "scale into the space represented by the
> Canvas" requirement?

It is deliberately NOT the question "what fit algorithm does IIIF specify?" — because IIIF
specifies none (verified absence, N3 §3; E16 §2 row 6). Any wording implying otherwise would be
an unauthorized upgrade.

### Analysis

1. **The ambiguity is real and measurable.** For mismatched aspects, fill and contain
   destinations differ (E16 §4.2: case03 `0,0,1920,1080` vs `420,0,1080,1080`; composed
   landmark Δ = 386 Canvas units, machine-recorded in `evidence/e16/landmark-spot-check.json`;
   case06 strongest divergence). The spec text selects neither ⇒ `[OPEN]` by construction.

2. **Same aspect makes every reasonable reading coincide — mathematically, not accidentally.**
   When `W_target/H_target == W_body/H_body`, the uniform scale factor is unique
   (`k = Tw/Wb = Th/Hb`), non-uniform fill scales equal it on both axes, contain/meet letterbox
   offsets are exactly zero, and slice crops nothing. Fill == contain == meet == slice == cover.
   This is why case01/02 coincide and why the case04 Mode-A twin matches BOTH machine-recorded
   readings (`twinMatchesFill && twinMatchesContain === true`). E17 F6 confirmed the coincidence
   renders identically in Chromium, Firefox, and WebKit.

3. **Same aspect also neutralizes the browser hazard.** The leaf-PAR collapse (E16 §4.3, E17
   F5) changes outcomes only when container aspect ≠ leaf aspect; under P5a there is nothing to
   collapse — the collapsed and two-stage pipelines produce identical geometry. P5a therefore
   makes the container-fit-vs-leaf-PAR precedence question unobservable inside the subset,
   without resolving it (it stays `[OPEN]` outside).

4. **Compatibility with the normative requirement.** IIIF 3.0 §5.3 says renderers "must scale
   content into the space represented by the Canvas". Uniform scaling of a same-aspect body
   IS scaling into that space — P5a constrains how PUBLISHERS keep every conforming
   interpretation identical; it does not reinterpret, extend, or contradict the normative
   sentence, and it does not assert that IIIF chose an algorithm. Canvas-as-body permission
   itself is verbatim stable 3.0 §5.7 `[NORMATIVE]`.

5. **Community convergence.** Recipe 0004 arrives at the same discipline independently:
   "The aspect ratio should be consistent between your source image and Canvas. Otherwise,
   you'll see unpredictable stretching and/or distorting." `[COMMUNITY]`. Recipe 0299 confirms
   the ecosystem treats both transform directions as live options — i.e., the ambiguity is not
   just ours.

6. **Cost check (the plan's adoption criterion).** The worked example (Part 3) shows the
   realistic higher-resolution-replacement use case needs only `x' = kx, y' = ky`, which
   same-aspect guarantees. No probed use case requires mismatched-aspect nesting;
   recipe 0004's own use case is the same shape.

7. **Honest scope limits.** N2 proved no tested consumer currently realizes nested composition
   (Ramp crashes on the stable-3 twin; Mirador drops it). Adopting P5a therefore buys:
   publisher-side determinism today, immunity from the undefined-fit and leaf-PAR hazards if a
   capable consumer appears, and a crisp proposal for community channels. It does NOT buy
   visible overlays in Ramp/Mirador today, and this decision does not claim it does.

### Verdict

YES — adopt P5a as a PROFILE RULE. Formulation:

> **P5a (profile rule).** A Canvas painted as a content resource onto another Canvas (or onto a
> region of one) MUST have the same aspect ratio as its target rect — the targeted region when
> the target carries a spatial selector, otherwise the full target Canvas dimensions.
>
> Mechanical conformance test:
> 1. Let the inner Canvas be `(Wb, Hb)` and the target rect be `(Tx, Ty, Tw, Th)` in the target
>    Canvas coordinate space.
> 2. Aspect condition: `Tw × Hb == Th × Wb`. Dimensions are unit-less integers in practice;
>    integer cross-multiplication is exact. Non-integer serializations SHOULD be rejected or
>    compared with a documented relative tolerance ε ≤ 10⁻⁶ — the profile parameter, chosen
>    here, not derived from any standard.
> 3. Rendering consequence within the subset: every landmark point `(u, v)` of the inner
>    Canvas maps to `(Tx + k·u, Ty + k·v)` with the single scale `k = Tw/Wb (= Th/Hb)`.
> 4. Observable test: rendered landmarks land within measurement tolerance of prediction (3),
>    AND the painted destination rect equals the target rect exactly — no letterbox bands, no
>    overflow clipping, no offset. Any band or clip is a visible, mechanical violation.

This is testable without knowing the consumer's internal fit policy — which is the point:
under P5a the policy is irrelevant, so compliance can be verified black-box.

Rank: `[PROFILE]` (this document), motivated by `[DERIVED]` coincidence theorem (E16) +
`[BROWSER]` tri-engine confirmation (E17 F6) + `[COMMUNITY]` convergence (recipe 0004) +
`[NORMATIVE]` compatibility frame (IIIF 3.0 §5.3/§5.7). It is NOT `[NORMATIVE]`, and nothing
here upgrades the fit algorithm out of `[OPEN]`.

---

## PART 3 — Worked example (Cookbook 0004-style replacement + overlay alignment)

Scenario mirroring recipe 0004's own guidance and the plan's mandated example: a published
video Canvas carrying graphical annotations is later upgraded to a higher-resolution
replacement Canvas; annotations and overlays must stay aligned without re-authoring.

### 3.1 Original Canvas

- Canvas C: `width: 1920, height: 1080` (16:9), duration 30 s.
- Painting: video body (full Canvas).
- Overlay annotation: SVG body, `viewBox="0 0 1920 1080"`, containing
  - centre circle `cx=960 cy=540 r=100`,
  - corner tick landmark at user coordinates `(40, 40)`,
  - target: full Canvas (default).

Under P2, the body viewBox maps onto the Canvas rect 1:1: circle at Canvas `(960, 540)`,
tick at Canvas `(40, 40)`.

### 3.2 Higher-resolution replacement, same aspect

Replacement Canvas C′: `width: 3840, height: 2160` (k = 2, still 16:9). The same overlay body
is repainted onto C′ (or C′ is painted as a body onto a 3840×2160 presentation space — the
algebra is identical). With `x′ = k·x`, `y′ = k·y`:

| Landmark | C (original) | C′ (replacement) |
|---|---|---|
| Circle centre | (960, 540) | (1920, 1080) |
| Circle radius | 100 | 200 |
| Tick | (40, 40) | (80, 80) |

Why ONE uniform factor suffices: because `3840/1920 == 2160/1080 == k`, both axis scales are
the same number. Check every fit reading at mismatch-proof level:

- fill: `sx = 3840/1920 = 2`, `sy = 2160/1080 = 2` — non-uniform algorithm degenerates to uniform;
- contain/meet: `s = min(2, 2) = 2`, offsets `((3840−3840)/2, (2160−2160)/2) = (0, 0)` — no letterbox;
- slice/cover: excess to crop is zero — no clipping.

Every policy computes the SAME map. The logical coordinate relationship is unchanged: the tick
is at 1/48 of width and 1/27 of height before and after; the circle stays centred. This is the
[DERIVED] coincidence theorem of E16 §4.2 (same-aspect rows), rendered unanimously by three
engines (E17 F6). An implementer can replace Canvases at will inside the subset without
knowing — or caring — which fit algorithm any consumer implements.

Nested variant (E16 case04 shape): inner Canvas 1000×1000 painted onto outer 1920×1080 with
target region `xywh=710,290,500,500`. Aspects both 1:1 ⇒ unique `k = 0.5`; destination is the
full target rect `(710,290,500,500)` under BOTH recorded readings
(`evidence/e16/modeA-twins.json`: twinMatchesFill = twinMatchesContain = true). Inner point
`(u,v)` → `(710 + u/2, 290 + v/2)`.

### 3.3 What breaks when `W'/H' != W/H`

Two demonstrations — one synthetic replacement, one machine-measured:

**(a) Replacement with mismatched aspect (synthetic, algebraic).** Replace C (1920×1080) with
C″ = 2000×2000 (aspect 1.0 vs 1.778):

- fill: `sx = 2000/1920 ≈ 1.0417`, `sy = 2000/1080 ≈ 1.8519` ⇒ tick (40,40) → **(41.7, 74.1)**;
- contain: `s = min(·) = 1.0417`, drawn height 1125, vertical offset `(2000−1125)/2 = 437.5`
  ⇒ tick (40,40) → **(41.7, 479.2)**.

Same input, ~405 units apart vertically — and note the circle CENTRE lands identically
(1000, 1000) under both: centred invariants hide the divergence while off-centre landmarks
expose it. There is no universally correct answer between these outcomes; the spec names no
algorithm; the choice becomes observable and therefore demands an explicit rule. That is
exactly why the mismatched case sits OUTSIDE the safe subset rather than being assigned an
ad-hoc behavior here.

**(b) Measured instance (E16 case03, machine evidence).** Inner 1000×1000 Canvas painted onto
full outer 1920×1080: fill destination `0,0,1920,1080`, contain destination `420,0,1080,1080`
(`evidence/e16/modeA-twins.json`); composed tick at user (40,40) lands at Canvas x = **76.8**
(fill) vs x = **463.2** (contain) — Δ = 386.4 units (`evidence/e16/landmark-spot-check.json`),
with both bands visible in a single rendered frame through the browser pipeline (E16 §4.3,
tri-engine E17 F5).

### 3.4 Layer separation (explicitly not conflated)

| Layer | What it governs | Source class |
|---|---|---|
| SVG coordinate transforms | viewBox↔viewport mapping INSIDE an SVG document, given a viewport | SVG 1.1 §7.7–7.10 `[NORMATIVE]` |
| Canvas logical coordinates | Unit-less space established by Canvas height/width; "not pixels" | IIIF 3.0 §3.2/§5.3; 4.0 draft explicit `[NORMATIVE]` |
| HTML replaced-element fitting | Concrete object size algorithms (fill/contain/none) for `<img>`-like boxes | CSS Images 3 §4.3–4.5 `[NORMATIVE]` |
| IIIF Canvas dimensions | Aspect-ratio/space semantics of the composition target | IIIF 3.0 `[NORMATIVE]` + this profile's rules |

P5a lives in the fourth row only. It does not redefine SVG transforms, does not change what
CSS does to replaced elements, and does not assign pixels to Canvas units. The worked example's
`x′ = k·x` is a statement about the IIIF coordinate-space layer; each lower layer still runs
its own rules underneath (which is precisely why P1/P2 remain necessary companions).

---

## PART 4 — P1 / P2 decision

What E17 actually established (verified against `evidence/e17/summary.json` and
`cross-engine-matrix.json`): 62/62 distinct rows unanimous across Chromium 151 / Firefox 153 /
WebKit 26.5; explicit-viewBox region behavior consistently matched I-REGION-VIEWPORT alone
(F1); no-viewBox ambiguity reproduced identically (F2); intrinsic sizes identical across
engines including attribute-less SVG (F3).

What N3 actually established: IIIF Canvas dimensions carry primarily aspect-ratio/space
semantics (§3 quotes); SVG is absent from Presentation 3.0 entirely; therefore P1/P2 are NOT
restatements of any IIIF normative text — they are profile semantics built on normative web
primitives.

Decision:

- **P1: SAFE WITH EXPLICIT PROFILE CONDITION — adopted as a `[PROFILE]` rule (SHOULD-level
  mandatory within the profile), rank unchanged (`[PROFILE]`/convention-grade, not
  `[NORMATIVE]`).**
  Basis: `[NORMATIVE]` primitives (SVG 1.1 §§7.7–7.12; CSS Images 3 §4.5) + `[BROWSER]`
  tri-engine verification (E15→E17) + `[OPEN]` hazard it eliminates (three coexisting
  readings, engine-uniform). Scope condition: the determinism guarantee holds among consumers
  that paint into regions per P2; mechanisms that never claimed region-painting (background,
  naive insertion) are excluded by P6 rather than fixed. We do NOT upgrade despite unanimity:
  three browsers agreeing proves browser behavior, not standardization.

- **P2: SAFE WITH EXPLICIT PROFILE CONDITION — retained verbatim, including its conditional
  clause; rank unchanged.**
  Basis: same normative primitives + E17 F1/F5. The conditions are load-bearing, evidenced
  twice: (i) raw `<img>`-into-region is acceptable only when region aspect == viewBox aspect
  (else leaf-PAR collapse, E16 §4.3 / E17 F5 `[BROWSER]`) or the consumer composites before
  scaling; (ii) the rule binds only consumers claiming region-painting support. Honest caveat
  attached: no deployed consumer tested realizes P2 end-to-end today (N2: crash or silent drop
  before geometry) — P2 is a forward-looking consumer requirement with a complete browser-level
  evidence base, not a description of current viewer behavior.

Neither RECOMMENDED-without-condition nor OPEN: the evidence is strong enough to adopt as
profile rules (that is what E15 §6 concluded, now tri-engine), and the rank ceiling is exactly
as high as the honesty rules allow — `[PROFILE]` on `[NORMATIVE]` primitives, never higher.

---

## PART 5 — What must remain OPEN

Each item below fails at least one promotion test: no authoritative text, or no consumer/
engine realization, or active contradictory evidence.

1. **Consumer-side temporal fragment honoring** — `[OPEN]`/`[UNKNOWN]`. Ramp parsed `#t=10,20`
   but capture showed currentTime 0 with playback paused; passive probes cannot distinguish
   "honors later" from "ignores". Promoting would assert honoring nobody observed. Needs
   interaction-level probes driving the consumer's own UI.
2. **Two-stage composition through a real consumer** — `[OPEN]`. Ramp 5.1.1 crashes on the
   stable-3 Canvas-as-body twin (V7); Mirador 3.4.3 silently drops it (M3). Zero positive
   instances found; a guarantee would be fabricated.
3. **Leaf-PAR collapse through a real consumer** — `[BROWSER]` (tri-engine, E17 F5) + `[OPEN]`
   at consumer level. Untestable in Ramp/Mirador because they never reach the pipeline (see
   #2). Browser facts cannot stand in for consumer guarantees.
4. **Arbitrary aspect-ratio Canvas replacement** — `[OPEN]`. Fit policy becomes observable
   (Part 3.3: ~405-unit synthetic divergence; 386.4 measured). No universal correct behavior
   exists to promote; would require inventing a fit-parameter vocabulary, which E15–E17/N3
     jointly advise against standardizing yet.
5. **Exact fit algorithm implied by "scale into the space represented by the Canvas"** —
   `[OPEN]`. Verified absence: no algorithm in stable 3.0 or 4.0 draft (E16 §2; N3 §3 searches);
   recipes acknowledge both directions (0299) and warn about unpredictability (0004). IIIF
   mandates the duty, not the method — P5a sidesteps rather than resolves this.
6. **Z-order / stacking semantics** — `[OPEN]` as interop guarantee. Cookbook contradicts
   itself across recipes (0036/0033 first=bottom vs 0489 first=top); Mirador 3 reversal
   documented (#2607). Only the 4.0 draft states ordering, draft-only. Local `[PROFILE]`
   convention permitted; cross-consumer certification impossible today.
7. **Web Annotation SvgSelector stretch model vs P2 meet-style model** — `[OPEN]`. WA §4.2.7
   normatively mandates proportional mapping for selection shapes (no aspect logic); P2 uses
   viewport/PAR for painting bodies. Different sides, different mechanisms; if the community
   ever extends the sentence toward bodies, stretch is the likelier direction (N3 §8.1).
   Recorded as contrast; not reconcilable from existing texts.
8. **Other unresolved items documented by N3**: community adoption of P1/P2 itself (unasked);
   CSS `object-fit: cover` channel (deliberately unprobed, out of profile); Media Fragments
   crop-default vs IIIF placement nuance (MF §7.1 non-normative vs painting practice — any
   future profile text must state painting targets PLACE, not CROP); invalid/out-of-bounds
   fragment handling (E14-era, untouched); SVG security-policy expression
   (`[IMPLEMENTATION_GAP]`); movement/keyframes (Priority 4, untouched); AV timing precision
   ("approximate", recipe 0489).

None of Part 6 below draws any rule from items 1–8.

---

## PART 6 — SAFE INTEROPERABILITY SUBSET

Derived from the dispositions above. Smallest useful set, not largest defensible set.

## SAFE INTEROPERABILITY SUBSET (N4)

**S1. Explicit SVG coordinate system.** Every SVG painting body declares an explicit
`viewBox`. `[PROFILE]` — built on `[NORMATIVE]` SVG 1.1 §7.7–7.10/§7.12 + CSS Images 3 §4.5;
hazard it removes verified `[BROWSER]` tri-engine (E15 §4.1, E17 F2/F3).

**S2. Region-as-viewport consumer contract.** Consumers that paint SVG bodies into regions do
so such that the targeted region acts as the SVG viewport with preserveAspectRatio applied;
raw `<img>`-into-region qualifies ONLY for aspect-matched targets or pre-compositing
consumers. `[PROFILE]` — `[BROWSER]` basis E15 R1 + E17 F1/F5; conditional wording is part of
the rule.

**S3. Explicit Canvas dimensions.** Every Canvas states height/width establishing its
coordinate space; the dimension semantics ("aspect ratio for the space…", "not pixels") are
`[NORMATIVE]` IIIF 3.0 §3.2/§5.3 (+4.0 draft explicit); the always-state-them requirement for
this profile is `[PROFILE]`.

**S4. Same-aspect replacement/nesting (P5a).** Painted-Canvas bodies match target-rect aspect
ratio; conformance mechanically testable per Part 2 (uniform-scale map, no bands, no clips).
`[PROFILE]` rule; `[COMMUNITY]` recipe-0004 convergence; `[DERIVED]` coincidence (E16) +
tri-engine confirmation (E17 F6). Compatibility frame `[NORMATIVE]` §5.3/§5.7; the fit
ALGORITHM itself remains `[OPEN]`.

**S5. Coordinate mapping within S4 compositions.** Landmarks map `x′ = Tx + k·u`,
`y′ = Ty + k·v`, `k = Tw/Wb = Th/Hb`. `[DERIVED]` (E16 same-aspect results + resolver logic),
validated `[BROWSER]` (E17 F6).

**S6. Target syntax.** Media Fragments `t=`/`xywh=`; half-open intervals; `percent:`
normative with `pct:` alias. `[NORMATIVE]` MF REC §4.2.1–4.2.2 + WA chain (per N3 §5);
alias acceptance `[PROFILE]`.

**S7. Exclusions.** No-viewBox bodies, background-image painting, naive attribute insertion:
outside the profile; no geometry promised. `[PROFILE]` boundary justified by `[BROWSER]`
three-readings evidence (E15 R2/R5, E17 F2) and `[NORMATIVE]` CSS/SVG sizing semantics.
Not claimed forbidden by standards.

**S8. Temporal fragment usage.** Producers MAY use `t=` fragments per Media Fragments
(`[NORMATIVE]` syntax); consumer rendering/honoring is explicitly OUTSIDE the proven subset
`[OPEN]` (N2 V2 inconclusive).

Deliberately ABSENT from the subset (and not to be re-added without new evidence):
z-order guarantees (`[OPEN]`, P4), any fit keyword/vocabulary (`[OPEN]`, Part 5 #4/#5),
consumer capability claims for SVG bodies or Canvas-as-body (`[VIEWER_GAP]`, N2), pixel-
identical rendering promises (tolerance-based methodology; see Part 7).

---

## PART 7 — Negative guarantees

## What this profile does NOT guarantee

- **Arbitrary SVG aspect ratios.** Mismatched body/target aspects have observable, unstandardized
  fit policy (E16 386-unit divergence; Part 3.3). Outside S1–S8, nothing is promised — not
  fill, not contain, not anything else.
- **Browser-independent rendering of unspecified fit policies.** Where no rule fixes the
  policy (mismatched nesting), even tri-engine agreement would not help — and for the collapse
  phenomenon specifically, engines DO agree on producing contain-like geometry through the
  `<img>` pipeline (E17 F5), which contradicts fill-declarations rather than rescuing them.
- **Consumer support for SVG painting bodies.** Ramp 5.1.1 error-boundary-crashes on ANY
  secondary painting Image body including plain PNG (N2 V4–V6); Mirador 3.4.3 silently drops
  them (M2). The profile describes data-level interoperability, not current viewer rendering.
- **Consumer support for Canvas-as-body.** Both tested consumers fail on stable-3.0 nested
  Canvases (Ramp V7 crash; Mirador M3 drop). S4 is future-facing discipline, not a working
  deployment path today.
- **Temporal fragment rendering.** Honoring was unobservable in passive probes (currentTime 0);
  syntax is normative (S6), application is not guaranteed (S8).
- **Z-order.** No stacking guarantee across consumers; IIIF's own recipes disagree on
  direction; Mirador's reversal is deliberate (N3 §4/§7).
- **Two-stage composition.** No tested consumer pre-composites an inner Canvas honoring
  container fit; the leaf-PAR collapse shows naive pipelines actively flatten composition
  (E16 §4.3, E17 F5).
- **Pixel-identical rendering.** All geometric evidence is tolerance-classified (coverage ≥ 0.8
  masks, AA dilation); anti-aliasing, rasterization, and sub-pixel effects differ by engine and
  zoom (E17 F8 records a case06 measurement limitation honestly rather than papering over it).
  The subset promises analytic-coordinate agreement, never pixel equality.
- (Standing) **No silent upgrades.** Nothing labeled `[OPEN]` in Part 5 acquired rule status
  anywhere in S1–S8; nothing labeled `[BROWSER]` was promoted for having three engines; nothing
  labeled `[COMMUNITY]` was promoted for having IIIF's own cookbook behind it.

---

## PART 8 — Decision log

## N4 Decision

**Decision.** Adopt the same-aspect constraint as a formal PROFILE rule (P5a, Part 2
wording + mechanical test) and issue the N4 Safe Interoperability Subset S1–S8 (Part 6).
Retain P1/P2 as safe profile rules with unchanged substance and unchanged rank ceiling;
keep the fit algorithm, z-order, consumer-capability, and temporal-honoring questions
explicitly OPEN. The candidate profile text in `research/e15-e16-final-report.md` §9 is NOT
modified in this stage; P5a lives in this document pending the Stage-5 research-model update,
where superseding edits (if any) get SUPERSEDED markers per protocol.

**Rationale.** P5a is the unique point where (i) the measured ambiguity (E16 386-unit
divergence) vanishes mathematically, (ii) the browser hazard (leaf-PAR collapse, E17 F5)
becomes unreachable, (iii) IIIF's normative scale-into-space duty is satisfied without
inventing a fit algorithm, and (iv) the ecosystem already advises the same discipline
(recipe 0004) — i.e., it is a restriction, not new vocabulary. Its cost in realistic use
cases is zero (Part 3). Promoting anything further would require exactly the evidence we do
not have (a realizing consumer, a standardized fit, consistent stacking practice).

**Strongest supporting evidence.** `evidence/e16/{cmp-*,modeA-twins.json,
landmark-spot-check.json}` (coincidence + divergence, quantified) + `evidence/e17/summary.json`
(62/62 tri-engine unanimity; e16Agreement flags all true) + recipe 0004 quote (N3 §4) +
IIIF 3.0 §5.3/§5.7 verbatim permissions/duties (N3 §3, E16 §2).

**Strongest counterargument.** N2 showed no mainstream consumer renders ANY of this today —
nested canvases crash or vanish, SVG/raster secondary bodies fail identically. One can argue
the safe subset is therefore premature optimization: the binding constraint is viewer support,
not publisher discipline, and effort belongs in viewer-gap work or community escalation
(cookbook issue) instead of profile drafting. Counter-response accepted in part: this is why
S4/P5a is framed as publisher-side discipline with a black-box test and explicit
non-guarantees (Part 7), and why the decision does NOT declare the subset deployable — but
publisher-side stability costs nothing, prevents latent breakage, and gives the community
escalation a concrete, testable proposal, so adoption remains net-positive.

**Remaining uncertainty.** Consumer-side everything (temporal honoring, two-stage composition,
collapsed-pipeline behavior in real viewers); fit-algorithm standardization trajectory;
engine-version scoping of intrinsic-sizing behavior (F3 holds for Chromium 151/Firefox
153/WebKit 26.5, not eternally); tolerance choices (ε for aspect comparison; mask-scoring
limits ~24 Canvas units).

**Should P1–P6 be modified?** Substance: NO. Ranks: clarified, not changed — P1/P2 stay
`[PROFILE]`/convention-grade on `[NORMATIVE]` primitives (now tri-engine evidenced); P3's
inputs are `[NORMATIVE]` (already recorded by N3); P4 demoted in aspiration by N3 findings and
stays OUT of the certified subset; P5 gains P5a as a formalized `[PROFILE]` RULE (textual home:
this document until Stage 5 merges it); P6 exclusions restated as S7. No [CONVENTION]→
[NORMATIVE] or [BROWSER]→[NORMATIVE] promotions occurred anywhere.

**Can the next stage move to implementation/profile drafting?** YES for research-model update
(Stage 5: compatibility-matrix/open-questions/final-report deltas with SUPERSEDED markers) and
for profile-document drafting grounded in S1–S8 — gated on explicit instruction. Implementation
of new experimental machinery is NOT authorized by this stage; movement/timeline modeling
remains Priority 4, blocked as planned.

---

*Provenance chain: every claim above traces to `evidence/e15|e16|e17/`, `evidence/viewer-matrix.json`,
or sources cited in `research/community-positioning.md` / `research/n3-source-index.json`.
Historical conclusions elsewhere were not altered by this document.*
