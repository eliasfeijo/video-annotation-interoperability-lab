# Conformance Matrix — N5 Draft Profile

Stage: N5 (Stage 5). Date: 2026-08-22.
Companion to: `research/profile-draft.md` (the profile itself; requirement blocks R-S1…R-S8b,
exclusions X1–X8). This file contains (A) the requirement matrix and (B) the black-box test
suite DESIGN. Nothing here is implemented in this stage.

Provenance classes are the six defined in profile-draft.md Part 3
(`[NORMATIVE]`/`[BROWSER]`/`[COMMUNITY]`/`[DERIVED]`/`[PROFILE]`/`[OPEN]`). Evidence pointers:
E15 = `research/e15-report.md` + `evidence/e15/`; E16 = `research/e16-report.md` +
`evidence/e16/`; E17 = `research/e17-report.md` + `evidence/e17/`; N2 =
`research/viewer-interop-report.md` + `evidence/viewer-matrix.json`; N3 =
`research/community-positioning.md` + `research/n3-source-index.json`.

---

## PART A — Requirement matrix

| ID | Requirement | Type | Testable? | Test mechanism | Evidence | Status |
|---|---|---|---|---|---|---|
| S1 / R-S1 | Every SVG painting body declares an explicit root `viewBox` | [PROFILE] | Yes — static | Parse SVG root element of each painting body; assert `viewBox` attribute present with 4 numeric components | E15 §4.1/§4.2 + E17 F1/F2/F3; normative primitives SVG 1.1 §7.7–7.12, CSS Images 3 §4.5; absence anchor N3 §3/§8#4 | IN FORCE (resource side) |
| S2 / R-S2 | Region acts as SVG viewport with PAR applied; raw `<img>` channel only for aspect-matched targets or pre-compositing consumers | [PROFILE] | Partially — consumer-side observable only with a claiming consumer | Black-box landmark/destination check (E15 classifier style): rendered landmarks ≈ analytic region-as-viewport prediction AND destination rect == target rect exactly (no bands/clips) | E15 R1 + E17 F1/F5; E16 §4.3 collapse; N2 V4–V7/M2/M3 (no realizing consumer) | IN FORCE (declarative); certification blocked on capable consumer |
| S3 / R-S3 | Every Canvas states positive integer height/width | [PROFILE] (semantics [NORMATIVE]) | Yes — static | Parse manifest; assert `Number.isInteger(w) && w>0 && Number.isInteger(h) && h>0` per Canvas | IIIF 3.0 §3.2/§5.3 (N3 §3) | IN FORCE |
| S4 / R-S4 | Same-aspect painted/replaced Canvas vs target rect (P5a); mismatch non-conforming, no fallback fit | [PROFILE] | Yes — arithmetic | Exact integer cross-multiplication `Tw·Hb == Th·Wb` (painted) / `W'·H == H'·W` (replacement); reject non-integers or apply documented ε ≤ 10⁻⁶ relative tolerance | [DERIVED] E16 modeA-twins.json + landmark-spot-check.json (Δ386.4); [BROWSER] E17 F5/F6; [COMMUNITY] recipe 0004; frame IIIF 3.0 §5.3/§5.7 | IN FORCE |
| S5 / R-S5 | Landmark mapping `(u,v) ↦ (Tx + k·u, Ty + k·v)`, `k = Tw/Wb = Th/Hb` | [DERIVED] | Yes — pure function | Validator emits predicted mapping table; assert equality with formula for sampled landmarks | [DERIVED] E16 same-aspect rows + resolver logic; [BROWSER] validation E17 F6 | IN FORCE (consequence of S4) |
| S6a / R-S6a | Media Fragments `t=`/`xywh=` syntax; half-open intervals; percent axis-split; WA FragmentSelector chain | [NORMATIVE] | Yes — parser | MF ABNF grammar check; well-formedness assertions (`t=banana`, `xywh=1,2,3` fail) | MF REC §4.2.1/§4.2.2; WA REC §4.2.1 (N3 §5) | IN FORCE (syntax level only) |
| S6b / R-S6b | `pct:` alias accepted as `percent:` equivalent | [PROFILE] | Yes — parser | Normalize both prefixes; assert identical parsed result | MF §4.2.2 base + lab usage (exp4; bug-fix #10) | IN FORCE (SHOULD-level) |
| S7 / R-S7 | Exclusions: no geometry promised for viewBox-less bodies, background-channel painting, naive insertion (full list X1–X8 below) | [PROFILE] | Resource side yes; consumer side needs fixture | Reject viewBox-less bodies (shares S1 check); flag manifests relying on excluded channels via declared metadata; consumer-side promise-checking requires a real consumer | [BROWSER] E15 R2/R5 + E17 F2/F3; [NORMATIVE] CSS Images 3 §4.3.1/§4.5, SVG 1.1 §7.12 | IN FORCE (boundary) |
| S8a / R-S8a | Producers MAY use `t=` fragments; syntax valid regardless of honoring | [NORMATIVE] (syntax) | Yes — shares S6a parser | Grammar validity check | MF §4.2.1 | IN FORCE (permission) |
| S8b / R-S8b | Temporal consumer honoring explicitly NOT guaranteed | [OPEN] | No — not implementable from existing evidence | Requires interaction-level probes driving a consumer's own UI; passive capture proven insufficient | N2 V2 (currentTime stayed 0; `[UNKNOWN]`) | OPEN fence — MUST NOT become a requirement |

### Exclusion rows (profile boundaries; none claims standards forbid these)

| ID | Exclusion | Type | Testable? | Test mechanism | Evidence | Status |
|---|---|---|---|---|---|---|
| X1 | Arbitrary aspect-ratio replacement/nesting | [OPEN] | n/a (excluded by S4 predicate) | S4 cross-multiplication rejects; validator must NOT emit any fit behavior for failures | E16 case03/case05/case06 divergence; N4 Part 5 #4 | EXCLUDED |
| X2 | Reliance on implicit intrinsic SVG dimensions | [PROFILE]-exclusion (hazard [BROWSER]) | Yes (static) | Same as S1 rejection; additionally reject "intrinsic-fit" expectation declarations | E15 R2 + E17 F2/F3 | EXCLUDED |
| X3 | Unspecified fit algorithms / fit keywords | [OPEN] | n/a | Validator vocabulary contains no fit parameter at all (meta-test T10) | Verified absence N3 §3; E16 §2 row 6 | EXCLUDED (declined) |
| X4 | Consumer-specific SVG painting-body assumptions | [OPEN] (viewer gap) | No today | Would require rendering consumers; zero available (crash/drop) | N2 V4–V6/M2; Ramp scope statement (Ramp README, N3 §4) | EXCLUDED until ecosystem changes |
| X5 | Reliance on Canvas-as-body RENDERING through current consumers | [OPEN] (permission itself [NORMATIVE] §5.7) | No today | Rendering probes impossible (V7 crash; M3 drop) | N2 V7/M3 | EXCLUDED for guarantees; data-level expression allowed |
| X6 | Z-order assumptions | [OPEN] | No | No stacking assertions anywhere in conformance output (meta-test T08) | Cookbook 0036/0033 vs 0489 contradiction; mirador#2607 (N3 §4/§7) | OUT OF SCOPE; future-extension candidate |
| X7 | Reliance on temporal consumer honoring | [OPEN] | No | Same as S8b | N2 V2 | OPEN fence |
| X8 | Two-stage composition reliance | [OPEN] | No today | Consumer pre-compositing observable only with capable consumer | E16 §4.3 + E17 F5 ([BROWSER] collapse); N2 V7/M3 | EXCLUDED for guarantees |

Counts: 10 requirement rules (S1–S8 decomposed), 8 exclusions. Mechanically/statically
testable NOW: **7** requirement rules (S1, S3, S4, S5, S6a, S6b, S8a-syntax) plus the resource
side of S7 → 8 static checks total; S2 is observable-but-blocked (needs fixture + capable
consumer); S8b and X4–X8 are open fences with no predicate by design.

---

## PART B — Black-box test suite design (NOT implemented)

Design constraints honored throughout:

- No browser behavior is encoded as a conformance oracle. All PASS/FAIL outcomes derive from
  parsing and arithmetic over the RESOURCE. Browser/consumer columns exist so future
  informational rendering checks can be added WITHOUT changing conformance semantics.
- Deterministic fixtures; machine-readable outputs; falsifiable expectations
  (methodology inherited from E15–E17).
- Expected results fixed before any implementation (same discipline as E17).

### Core suite

| ID | Fixture | Input | Expected result | Failure condition | Deterministic? | Depends on browser? | Depends on real consumer? |
|---|---|---|---|---|---|---|---|
| T01 | Manifest with SVG painting body carrying `viewBox="0 0 1000 1000"` (+ width/height attrs equal), target `xywh=480,270,960,540` on 1920×1080 Canvas | Run resource validator | PASS — conforming; emitted prediction uses region-as-viewport mapping | Any parse error or MISSING_VIEWBOX raised | Yes | No | No |
| T02 | Identical fixture with `viewBox` removed (reuse pattern of `e15-novb1000.svg`) | Run resource validator | FAIL with code `MISSING_VIEWBOX`, pointing at the offending body | Validator passes the body or crashes without diagnostic | Yes | No | No |
| T03 | Inner Canvas 1000×1000 painted onto outer 1920×1080 with target rect `xywh=710,290,500,500` (E16 case04 shape; aspects both 1:1) | Run S4 predicate | PASS — `500·1000 == 500·1000`; `k = 0.5`; destination == target rect | Cross-products unequal, or k reported non-uniform | Yes | No | No |
| T04 | Inner Canvas 1000×1000 painted onto full outer 1920×1080 (E16 case03 shape) | Run S4 predicate | FAIL with code `ASPECT_MISMATCH` (`1920·1000 = 1,920,000 ≠ 1080·1000 = 1,080,000`); NO fallback fit value emitted | Any fit policy (fill/contain/other) attached to the failure; silent pass | Yes | No | No |
| T05 | Conforming T03 input with landmark `(40,40)` (tick contract as in e15-landmarks) | Inspect emitted mapping table | Prediction exactly `(Tx + k·u, Ty + k·v) = (730, 310)`; also replacement-form sample 1920×1080→3840×2160 maps tick `(40,40) → (80,80)`, circle centre `(960,540) → (1920,1080)`, r 100→200 | Any dual-axis scale (`k_x ≠ k_y`) or off-by-offset value | Yes | No | No |
| T06 | Targets `#t=10,20`, `#t=10`, `#xywh=pixel:100,100,800,600` | Run fragment grammar check | All ACCEPTED as well-formed; temporal interval normalized to half-open `[10,20)` | Well-formed fragment rejected | Yes | No | No |
| T07 | Targets `#t=banana`, `#xywh=1,2,3`, `#t=,,` | Run fragment grammar check | REJECTED with code `MALFORMED_FRAGMENT` (one per input) | Accepted silently, or crash without code | Yes | No | No |
| T08 | Same conforming manifest with two paintings, submitted in BOTH AnnotationPage orders | Run full validator twice, diff outputs | Geometry-related verdicts IDENTICAL; z-order fields absent/neutral in both runs; neither order flagged pass nor fail on stacking grounds | Any z-order assertion appearing in output; differing verdicts between orders | Yes | No | No |
| T09 | ViewBox-less body accompanied by publisher metadata asserting "consumers will scale intrinsic canvas" (intrinsic-fit expectation) | Run resource validator | NON-CONFORMING via `MISSING_VIEWBOX`; validator emits NO geometry guarantee of any kind for this body | Any intrinsic-based geometry prediction emitted; any pass contingent on assumed stretch | Yes | No | No |
| T10 | Corpus run over all suite fixtures | Audit validator OUTPUT VOCABULARY | Output contains no guarantee strings for unsupported bodies ("will render", "honors t=", "stacks first", fit-policy names); OPEN items appear only as explicit non-guarantee fences | Any [OPEN]/excluded item phrased as capability or guarantee | Yes | No | No |

### Supplementary static tests (same discipline)

| ID | Fixture | Input | Expected result | Failure condition | Deterministic? | Depends on browser? | Depends on real consumer? |
|---|---|---|---|---|---|---|---|
| T11 | Target `xywh=pct:50,0,25,25` and `xywh=percent:50,0,25,25` | Parser normalization | Both accepted (S6b SHOULD); identical normalized rects (per-axis split per MF §4.2.2) | Alias rejected outright, or divergent normalizations | Yes | No | No |
| T12 | Replacement pair A: 1920×1080 → 3840×2160; pair B: 1920×1080 → 2000×2000 | Run S4 replacement form | A: PASS, `k = 2`. B: FAIL `ASPECT_MISMATCH` (`W'·H = 2,160,000 ≠ H'·W = 3,840,000`) | Wrong cross-product arithmetic; ε path applied to integers | Yes | No | No |
| T13 | Canvas missing `height`; Canvas with `height: 0`; Canvas with fractional width | Run S3 check | Each REJECTED (`MISSING_CANVAS_DIMENSION` / non-positive / non-integer) | Any accepted | Yes | No | No |
| T14 | Nested structure: inner SVG leaf without viewBox inside a nested Canvas composition (E16 case07 pattern) | Run S1 check at all depths | REJECTED — every SVG leaf requires its own viewBox (nesting does not exempt) | Only root checked; leaf passes | Yes | No | No |
| T15 | Non-integer dimension pair (e.g., Tw = 500.5) | Run S4 default path | REJECTED per SHOULD-reject rule; if implementation selects documented ε mode, decision recorded with ε ≤ 10⁻⁶ value in output | Undocumented tolerance silently applied | Yes | No | No |

*AMB-N6-1 resolution (2026-08-25, human research decision): the T12 pair-B expected-result
parenthetical previously quoted `2,160,000 ≠ 2,073,600`; its second value equaled H·W rather
than the pre-registered formula's H'·W (= 3,840,000). Corrected to the formula-consistent
arithmetic above; every pre-registered outcome, including FAIL `ASPECT_MISMATCH` for pair B,
is unchanged. Resolution record: `n6-implementation-report.md` §9.*

### Future rendering-level checks (informational ONLY; NOT part of conformance v1)

These would verify R-S2's consumer predicate against a REAL consumer that claims
region-painting support. None exists today (N2): Ramp 5.1.1 crashes before paint on ANY
secondary painting body (SVG/raster/Canvas-as-body, byte-identical error boundary V4–V7);
Mirador 3.4.3 silently drops them (M2/M3). Designed now, executable when a capable consumer
appears:

| ID | Fixture | Method | Expected (if consumer claims S2) | Blocked because |
|---|---|---|---|---|
| RF01 | T01 manifest | Load in consumer; pixel-mask landmark scan (E15 classifier thresholds verbatim: coverage ≥ 0.8, K = 0.25) | Rendered landmarks within documented tolerance of region-as-viewport prediction; destination rect == target rect (no bands/clips) | No consumer renders secondary painting bodies (N2 V4/M2) |
| RF02 | Aspect-MISMATCHED variant (square viewBox onto 16:9 region) via raw `<img>`-style channel | Same scan | Collapsed-pipeline signature (leaf-PAR bands, E16 §4.3/E17 F5) counts as S2 VIOLATION unless consumer pre-composites | Same as RF01 |
| RF03 | T03 nested same-aspect manifest | Same scan + seek/reapply-after-load protocol (experiment-log bug #16 lesson) | Composed landmarks match `(Tx + k·u, Ty + k·v)` | Ramp crashes (V7); Mirador drops (M3) |
| RF04 | `#t=` windowed overlay | Interaction-level probe driving the consumer UI (passive capture proven insufficient) | Honoring observable or refuted — either outcome closes R-S8b honestly | Needs UI automation not yet built; passive method invalid (N2 V2) |

RF01–RF04 depend on browsers/consumers BY DESIGN and therefore never gate resource
conformance; their outcomes would extend the evidence base (and could justify future profile
revisions through the normal falsification protocol), never silently become requirements.

---

## Traceability notes

- Every matrix row's Evidence column points to machine-readable artifacts (`evidence/e15|e16|e17/`,
  `evidence/viewer-matrix.json`) or named spec sections via `research/n3-source-index.json`.
- The suite deliberately reuses existing fixture patterns (`e15-vb1000` family, E16 case03/
  case04 shapes, e15-landmarks contract) so future implementation needs no new SVG authoring
  beyond assembling manifests.
- Status vocabulary: IN FORCE / EXCLUDED / OPEN fence / OUT OF SCOPE — matching
  profile-draft.md Parts 4–10. No row mixes classes; no [OPEN] row carries a PASS/FAIL
  mechanism.
