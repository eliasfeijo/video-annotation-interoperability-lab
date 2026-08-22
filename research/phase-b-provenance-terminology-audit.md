# Phase B — Provenance & Terminology Audit

Audit-only deliverable of the consolidation process. No existing file was modified,
moved, renamed, or deleted; no evidence regenerated; no ID or provenance label changed.
The only repository change is this document.

Baseline: tag `n6-complete-pre-consolidation` (`8f5efa6`).
Branch: `consolidation/inventory-audit`. Phase A handoff:
`research/pre-consolidation-inventory.md` (§5, §7, §11, §12, §13, §14 used as input).

Confidence labels: `CONFIRMED` (direct file/git inspection cited), `LIKELY`
(strong indirect evidence; residual uncertainty stated), `UNCERTAIN`
(cannot be established from repository evidence).

---

## 1. Executive Summary

1. **The three A/B/C letter-axes are three different classification systems, verified
   down to type definitions:** *Renderer* A/B = implementation identity
   (`RendererKind = "a" | "b"`, `src/reference/lib/types.ts:106`);
   *Model* A/B/C = composition structure (`E14Model = "A" | "B" | "C"`,
   `src/e14/types.ts:11`); *Mode* A/B = IIIF version semantics inside the blind
   renderer (`IiifMode`, `src/blind/layers.ts:17`; z-order provenance literally
   switches on it: `zProvenance(mode)` returns `[NORMATIVE]` for Mode B vs
   `[CONVENTION]` for Mode A, `src/blind/layers.ts:55-56`). They must never be
   collapsed or renamed. CONFIRMED.
2. **The profile already contains an explicit terminology layer**
   (`research/profile-draft.md` Part 2 TERMINOLOGY, Part 3 REQUIREMENT TAXONOMY)
   that flags the worst collisions itself (MF-region vs IIIF-region; viewport
   assignment). Phase B adopts it as the preferred current vocabulary and maps all
   older vocabularies onto it WITHOUT renaming anything historical. CONFIRMED.
3. **Four scoped provenance taxonomies coexist and classify different object types**
   (interpretation rules, renderer divergences, requirement provenance, consumer
   observations). They are NOT mutually equivalent; forcing them into one taxonomy
   would destroy information. Recommended target: **several explicitly scoped
   taxonomies plus one common legend** (option C), not unification. See §4.
4. **Source-of-truth conflicts are real but narrow.** The two live ones:
   (a) T01–T15 pre-registration exists in both `conformance-matrix.md` Part B and
   `src/n6/suite.ts` (self-declared "single source of truth"); (b) no single document
   owns "the current research position" — six documents each own an epistemic layer.
   Ownership models proposed in §5 and §6; nothing changed yet.
5. **Git archaeology settled three open inventory questions** (Phase A §13):
   case1–13 fixtures were added wholesale in one commit with **no generator script ever
   existing in history** (scripts/ dir has zero modifications/deletions across all
   commits — authorship remains UNCERTAIN); evidence-refresh commits contain **semantic
   evidence changes that trace to bug fixes landed minutes before the refresh**
   (CONFIRMED by commit timestamps); Renderer A's two resolvers are **layered, not
   duplicated** — `e14.ts` imports parsing helpers FROM `iiif.ts`. See §§7–9.
6. **Research framing:** the original "video annotation" phrasing is now narrower than
   the actual evidence base, whose center of gravity moved to deterministic geometric
   composition of painted resources on Canvases. A conservative reframe is proposed
   for FUTURE documents only (§10); no public-facing text changed.

---

## 2. Current Terminology Model

Work Package 1. Method: definitions were taken from the documents/code where each term
is DEFINED (not merely used): profile-draft Part 2/3, blind packet header, e14-report
§2 table, docs/iiif-3-vs-4.md preamble, code type definitions. Historical usage
locations were grep-enumerated (counts on file, available if needed).

### 2.1 The primary cluster: Mode / Model / Renderer

| Concept | Preferred current term | Historical term(s) | Meaning | Scope | Keep historical usage? | Confidence |
|---|---|---|---|---|---|---|
| Implementation axis | **Renderer A**, **Renderer B**, **Blind renderer**, **Native renderer** | "reference implementation", "oracle", "standards-oriented renderer", "renderer=a\|b\|blind\|native" (URL param) | Which independent program resolves a manifest: A = standards-driven IIIF resolver; B = direct-reference oracle (non-standard by design); Blind = interpretation-packet-driven independent renderer; Native = browser `<img>` pipeline | All generations exp1→N2; URL/API surface in `src/main.ts` | YES — verbatim; IDs are load-bearing (URL params, test names, evidence verdicts `a==blind`) | CONFIRMED |
| Composition-structure axis | **Model A / Model B / Model C** | "direct painting", "nested Overlay Canvas", "Web Annotation overlay" | A = IIIF Canvas + direct `painting` of bodies; B = inner Canvas painted as body (nested composition); C = W3C Web Annotation collection (video target, FragmentSelectors) | E14/E16 experiments + all three renderers' E14 extensions (`E14Model` field in shared evidence model) | YES — typed in code (`src/e14/types.ts:11`), cited by compatibility-matrix rows | CONFIRMED |
| IIIF-version-semantics axis | **Mode A / Mode B** | "stable 3.0 context", "draft 4.0 semantics" | Mode A = IIIF Presentation 3.0 stable semantics; Mode B = 4.0 draft semantics (Container model, normative z-index wording) | Blind renderer internals + docs/iiif-3-vs-4.md + blind-comparison evidence | YES — typed in code (`IiifMode`); z-order provenance is computed from it | CONFIRMED |

**Rule derived from evidence:** the letters A/B/C mean nothing outside their axis.
Any future sentence must carry the axis word ("Renderer B", "Model B", "Mode B"),
never a bare letter. This is a usage convention for new documents; no rename.

### 2.2 Remaining overloaded clusters

| Concept | Preferred current term | Historical term(s) | Meaning | Scope | Keep historical usage? | Confidence |
|---|---|---|---|---|---|---|
| Renderer A's home | `src/reference/` directory name kept as-is | "the reference implementation"; README calls Renderer B "the deliberately-simple reference" | Directory holds BOTH Renderer A's library AND Renderer B's oracle module | repo layout + prose | YES (rename would break imports/history); future prose must disambiguate: "Renderer A library (`src/reference/lib/…`)" vs "Renderer B oracle (`src/reference/renderers/rendererB.ts`)" | CONFIRMED |
| Blind | **Blind renderer** | "blind comparison", "blind reading" | Implementer blinding: resolves using ONLY `docs/blind-interpretation-rules.md` + cited specs; never imports Renderer A resolution logic | src/blind/, docs/, tests, N6 helper reuse | YES; note for future docs: N6 legitimately imports two PURE helpers from it (svg-root, placement) without violating blinding (documented in n6 report §1) | CONFIRMED |
| Native | **Native renderer** | "native channel", "native `<img>` behavior", "[BROWSER]" | Renders Image bodies through the real `<img>` pipeline = true IIIF Image-body consumer semantics | src/native/, E14+ reports | YES; avoid extending "native" to mean generic browser behavior in new prose — use `[BROWSER]` class for that | CONFIRMED |
| Value canonicalization | **canonical prefix / canonical form** (`percent:` over alias `pct:`) | "normalization" | One accepted spelling per value in N6 output (`canonicalPrefix` field, `src/n6/fragments.ts:33-34`) | N6 only | YES | CONFIRMED |
| Output canonicalization | **canonical ordering / order-neutrality** | "order-neutral outputs" | Diagnostics sorted by content keys so AnnotationPage order cannot alter verdicts (T08) | N6 validator/suite | YES; future docs should say "canonical ordering" not bare "canonical" when meaning this sense | CONFIRMED (two unrelated senses in one stage — always qualify) |
| Resolved-set equality | **parity** | "clean parity" (README), `parity-*.json` | Field-by-field equality of Renderer A resolved set vs Renderer B oracle refs | exp1–7 era ONLY | YES — historical; do not extend to newer comparisons | CONFIRMED |
| Semantic diff | **comparison** (`compareSemantics`, `compareE14`, cmp-\*.json) | "semantic record diff" | Structured record comparison between renderers with per-diff classification | blind generation, E14, E16 | YES | CONFIRMED |
| Agreement outcome | **verdicts / agreement** (`a==blind`, `a==native`, `blind==native`) | — | Per-fixture pairwise equality verdicts recorded in evidence JSONs | E14/E16/E17 evidence | YES | CONFIRMED |
| Profile compliance | **conformance** | — | Satisfaction of R-S1…R-S8b requirements + X-exclusions; resource-side machine-checkable; consumer side declaratively BLOCKED | N5 design, N6 implementation | YES | CONFIRMED |
| Capability status | **compatibility** (`S`/`G`/`B` legend) | "supported/gap/browser-dependent" | Whether the standard stack covers a capability, probed or gap | compatibility-matrix.md (rolling doc) | YES; do not merge with conformance status despite both being "matrix" tables | CONFIRMED |
| Page/display rectangle | **viewport** (CSS) | `.ar-*` aspect presets | Browser window element hosting the stage (`#viewport`, `src/style.css:10-31`) | exp6, index.html harness | YES; qualify as "page viewport" in new prose | CONFIRMED |
| SVG coordinate rectangle | **viewport** (SVG) | — | Rectangle onto which viewBox is mapped (SVG 1.1 §7.2) | everywhere | YES | CONFIRMED |
| Region acting as SVG viewport | **region-as-viewport** | P2 rule name; S2/R-S2 requirement name | Deliberate PROFILE assignment: targeted region acts as the SVG viewport (profile Part 2 flags that neither SVG nor IIIF assigns this) | E15 R1 onward, S2/R-S2 | YES | CONFIRMED |
| Target placement rect | **region** (IIIF sense) | "target rect", "destination", "xywh region" | Canvas-space sub-rectangle `(Tx,Ty,Tw,Th)` addressed by spatial fragment ON THE TARGET | E15+ analysis, N6 mapping | YES; profile-draft Part 2 explicitly flags collision with MF sense | CONFIRMED |
| Media-intrinsic selection rect | **region** (Media Fragments sense) | — | Resource-intrinsic rectangle selected by `xywh=` on the media itself | MF REC; n3-source-index contradiction #3 | YES; never silently substitute one for the other | CONFIRMED (collision documented IN profile Part 2) |
| Measured resource size | **intrinsic size / intrinsics** | "naturalWidth/Height", `intrinsics*.json` | Browser-reported natural dimensions of an SVG resource | E14 Finding 3, E15/E17 evidence | YES | CONFIRMED |
| Forbidden reliance | **intrinsic-fit expectation** | — | Declaring that consumers will scale by intrinsic canvas — excluded (X2), flagged heuristically | N5 exclusions, N6 exclusions.ts | YES | CONFIRMED |
| Fragment acceptance | **syntax permitted / well-formed** | "accepted" | Grammar-level acceptance (S6a/S8a) — says NOTHING about rendering | MF, N6 parser | YES | CONFIRMED |
| Consumer application | **honoring** | "applies the fragment" | Consumer actually applying fragment at render time — explicitly NOT guaranteed (S8b `[OPEN]` fence; N2 V2 `[UNKNOWN]`) | N2, N5, N6 fences | YES — this distinction is the single most consolidation-trap-prone pair in the repo | CONFIRMED |

### 2.3 Terms deliberately NOT given a "preferred" replacement

- All experiment/generation IDs (exp1–7, E12–E17, N1–N6, T01–T15, R-V/M-M probes,
  F-findings, Q-questions, P-rules, S/R-S requirements, X-exclusions, AMB-N6-1):
  immutable identifiers, not terminology. Changing any breaks cross-references in
  ~20 documents and machine evidence. CONFIRMED policy need.
- `I-REGION-VIEWPORT`, `I-INTRINSIC-STRETCH`, `I-OBJECTFIT-CONTAIN`,
  `I-NATURAL-CENTERED`, `I-NATURAL-TOPLEFT`: named candidate interpretations of the
  E15 classifier; they appear verbatim in `geometry-matrix.json`,
  `cross-engine-matrix.json`, and three reports. Immutable.

---

## 3. Historical Terminology Preservation Rules

These rules bind Phases C–E. Each is grounded in a cited mechanism.

1. **P-TERM-1 (axis words mandatory).** Bare "A"/"B"/"C" must never appear without its
   axis word in future documents. Evidence: the three axes are distinct typed systems
   (§2.1). CONFIRMED.
2. **P-TERM-2 (historical docs stay verbatim).** Documents authored as experiment
   records (findings.md, e14/e15/e16/e17 reports, viewer-interop-report,
   n6-implementation-report, blind packet/report, ambiguities, plans/logs) are never
   terminologically modernized. Their vocabulary IS the record: e.g., e14-report's
   "Model B … draft-only" is preserved even though E16 superseded the expressibility
   claim, because the supersession is itself history (compatibility-matrix row carries
   the inline SUPERSEDED marker pointing to E16). CONFIRMED pattern.
3. **P-TERM-3 (SUPERSEDED markers are data).** Inline SUPERSEDED/REFINED markers
   (compatibility-matrix.md lines 34/40; open-questions.md items 9–11) must be carried
   forward structurally in any Phase C document hierarchy — as archived rows or
   pointer records — never deleted as "inconsistencies". CONFIRMED.
4. **P-TERM-4 (class labels immutable).** `[OPEN]`, `[BROWSER]`, `[COMMUNITY]`,
   `[PROFILE]`, `[NORMATIVE]`, `[DERIVED]`, `[CONVENTION]`, `[CONSUMER]`,
   `[UNKNOWN]`, `IMPLEMENTATION_GAP`, `VIEWER_GAP`, `BLOCKED`, `OPEN_FENCE` are
   protocol vocabulary. Promotion/collapse rules already exist in profile Part 3
   ("Three-engine agreement does NOT upgrade a claim") and must be restated, not
   reinvented, in Phase C. CONFIRMED.
5. **P-TERM-5 (evidence filenames frozen).** Including misspelled legacy names
   (`epx6-*.png`) which are cited verbatim by findings.md/experiment-log tables.
   CONFIRMED cross-reference.
6. **P-TERM-6 (future-doc vocabulary).** New/restructured documents (Phase C+) SHOULD
   use profile Part 2 terms, the §2 conventions above, and qualified phrases
   ("page viewport", "target region (Canvas space)", "MF selection region") where
   collision terms are unavoidable. RECOMMENDATION — not applied anywhere yet.

---

## 4. Provenance Taxonomy Mapping

Work Package 2. Four scoped taxonomies were inspected at their definition sites:

- A: blind packet header table (`docs/blind-interpretation-rules.md:10-17`)
- B: e14-report divergence classifications (§3.2 table, §4 table)
- C: profile Part 3 table (`research/profile-draft.md:136-158`, quoted promotion rules)
- D: viewer-interop-report probe classes + viewer-matrix.json row fields

### 4.1 Mapping table

| Taxonomy | Label | Object being classified | Meaning | Closest equivalent elsewhere | Not equivalent to | Authority/source |
|---|---|---|---|---|---|---|
| A (blind packet) | `[NORMATIVE]` | an INTERPRETATION RULE used by the blind renderer | directly stated by a cited spec (RFC-2119 sense) | C `[NORMATIVE]` (requirement-level) | B's NORMATIVE-aspect rows (aspect classification, not rule licensing) | blind packet header; CONFIRMED |
| A | `[DERIVED]` | interpretation rule | logical consequence of normative statements | C `[DERIVED]` | — | blind packet; CONFIRMED |
| A | `[CONVENTION]` | interpretation rule | application-level rule introduced by the experiment | C `[PROFILE]` (both are lab-imposed constraints) | B `[CONVENTION]` (classifies a DIVERGENCE between renderers, not a rule's authority) | blind packet vs e14-report §4; CONFIRMED distinction |
| A | `[OPEN]` | interpretation rule | not determined by standards | C `[OPEN]` | D `[UNKNOWN]` (D marks an observation that failed to capture, A/C mark undetermined semantics) | blind packet; CONFIRMED |
| B (E14) | `NORMATIVE` / `DERIVED` / `CONVENTION` / `OPEN` / `IMPLEMENTATION_GAP` / `VIEWER_GAP` | a RESOLVER DIVERGENCE or ASPECT (why do renderers differ / who owns this behavior) | provenance OF A DISAGREEMENT OR GAP among implementations/specs | shares names with A/C but classifies divergences, not rules | A and C uses of the same strings | e14-report §3.2/§4; CONFIRMED (name reuse, different object) |
| B | `IMPLEMENTATION_GAP` | divergence | no manifest-expressible policy; consumer/platform owns behavior (e.g., `<img>` sandbox) | nearest C concept: exclusion/fence territory | `[PROFILE]` (profile does not own it) | e14-report Finding 4; CONFIRMED |
| B | `VIEWER_GAP` | divergence/observation | deployed viewers don't realize what standards permit | D `[VIEWER_GAP]` (same label, D applies it to probe ROWS) | `[OPEN]` (standards-level undetermined ≠ ecosystem lag) | e14-report §5; viewer-interop-report; CONFIRMED |
| C (profile) | `[NORMATIVE]` | a REQUIREMENT's provenance | supported by named spec citation; never inferred from behavior | A `[NORMATIVE]` (rule-level) | B usage | profile Part 3; CONFIRMED |
| C | `[BROWSER]` | requirement/claim provenance | measured multi-engine browser fact, version-scoped; NEVER normative | E15/E17 report classes (originated there) | `[COMMUNITY]` | profile Part 3 + e17-report headline; CONFIRMED |
| C | `[COMMUNITY]` | requirement provenance | ecosystem convergence (cookbook/recipes via N3) | — | `[NORMATIVE]` ("Cookbook advice does NOT become a spec claim") | profile Part 3; CONFIRMED |
| C | `[DERIVED]` | requirement provenance | consequence of lab experiments/resolver logic | A `[DERIVED]` | — | profile Part 3; CONFIRMED |
| C | `[PROFILE]` | requirement provenance | deliberate constraint adopted by THIS profile | A `[CONVENTION]` (functional ancestor; P1/P2 were [CONVENTION] before formalization) | `[NORMATIVE]` | profile Part 3 + community-positioning §10; CONFIRMED lineage |
| C | `[OPEN]` | requirement/status | undetermined; MUST NOT appear as requirement or acquire implicit status | A `[OPEN]` | B `VIEWER_GAP` | profile Part 3; CONFIRMED |
| D (N2) | `[CONSUMER]` | a PROBE OBSERVATION | observed consumer-specific behavior, version-pinned | B `VIEWER_GAP` neighborhood | anything normative | viewer-interop-report §"Which observations are [CONSUMER] only?"; CONFIRMED |
| D | `[VIEWER_GAP]` | probe row outcome | consumer fails/drops what standards permit | B `VIEWER_GAP` | `[OPEN]` | same; CONFIRMED |
| D | `[UNKNOWN]` | probe row outcome | capture could not decide (passive probe inconclusive, currentTime stayed 0) | — | C/A `[OPEN]` (semantic undetermined vs measurement inconclusive) | viewer-interop-report V2; CONFIRMED |

Adjacent systems that are NOT provenance taxonomies (mapped to prevent confusion):

| System | Object | Labels | Where |
|---|---|---|---|
| Compatibility status | capability rows | S / G / B / S* | compatibility-matrix.md legend |
| Conformance state | requirement implementation | implemented / BLOCKED / OPEN fence / EXCLUDED / OUT OF SCOPE | conformance-matrix.md Part A; run-n6-suite.mts matrixRows |
| Diagnostic codes | validator output | VIEWBOX_PRESENT, MISSING_VIEWBOX, … | src/n6/types.ts |
| Comparison verdicts | fixture×renderer pairs | `a==blind`, `!=` variants | evidence/e14,e16 JSONs |
| Verdict scale | session hypothesis | A–E (falsification grades) | findings.md §Verdict |

### 4.2 Assessment and proposal

The four taxonomies classify genuinely different objects:

- A classifies RULES an independent implementer may use.
- B classifies DISAGREEMENTS/GAPS between implementations and specs.
- C classifies REQUIREMENTS' epistemic authority.
- D classifies OBSERVED CONSUMER OUTCOMES.

Label reuse across taxonomies (`[NORMATIVE]`, `[CONVENTION]`, `[OPEN]`,
`VIEWER_GAP`) is real but each instance is locally defined and internally consistent;
the objects differ, so equivalence would be false.

**Proposal (unimplemented): option C — several explicitly scoped taxonomies under one
common legend.** A single unified taxonomy (option A) would erase the object-type
distinctions and contradict profile Part 3's own decomposition rules (no combined
labels; mixed-provenance rules split into sub-rules). Pure option B leaves the
observed trap: identical strings meaning different things in different files. The
common legend should be a NEW small document/table (Phase C deliverable) that states:
taxonomy name → object type → label set → definition-site file. It must introduce NO
new labels and change NO existing label.

Confidence: CONFIRMED that objects differ; the C-vs-B recommendation is a
RECOMMENDATION (judgment), grounded in the cited constraints.

---

## 5. Source-of-Truth Hierarchy

Work Package 3.1. Roles established by inspection of document self-descriptions,
dates, update patterns, and cross-citations.

### 5.1 Determined roles (current state)

| Document | Epistemic role | Update pattern | Confidence |
|---|---|---|---|
| `research/plan.md` | original hypothesis + method contract (2026-08-20) | frozen | CONFIRMED |
| `research/findings.md` | OWNS historical exp-era findings + verdict **B** (dated snapshot; includes point-in-time test counts) | frozen after initial era | CONFIRMED |
| `research/experiment-log.md` | OWNS the experiment registry + numbered bug-fix ledger (#1–#16) | append-only within eras | CONFIRMED |
| `research/compatibility-matrix.md` | OWNS rolling capability STATUS (S/G/B) incl. inline SUPERSEDED corrections | living doc through E16; untouched by N-stages | CONFIRMED |
| `research/e15-e16-final-report.md` | OWNS the E15/E16 cycle synthesis + first P1–P6 formulation | frozen cycle report | CONFIRMED |
| `research/community-positioning.md` (+ n3-source-index.json) | OWNS external-source claims (what specs/cookbook/implementations actually say) + final P1–P6 rank table | frozen (N3) | CONFIRMED |
| `research/n4-safe-subset.md` | OWNS the safe-subset DECISION (P5a adoption) + negative guarantees | frozen (N4) | CONFIRMED |
| `research/profile-draft.md` | OWNS CURRENT NORMATIVE REQUIREMENTS (R-S1…R-S8b, X1–X8, terminology, conformance model) | frozen (N5) | CONFIRMED |
| `research/conformance-matrix.md` | OWNS requirement MATRIX + pre-registered TEST DESIGN (Part B) | frozen (N5) | CONFIRMED |
| `research/n6-implementation-report.md` | OWNS implementation STATE of the validator + recorded ambiguity AMB-N6-1 | frozen (N6) | CONFIRMED |
| `research/open-questions.md` | OWNS the open/refined question register | living doc, prepend-style | CONFIRMED |
| `docs/blind-interpretation-rules.md` | OWNS interpretation-rule semantics for the blind renderer | frozen packet | CONFIRMED |
| `README.md` | public-facing intro; layout section STALE since eafcdba (paths `src/lib/*`, `src/renderers/*`); counts stale | drifts | CONFIRMED (stale paths re-verified this phase) |

### 5.2 Answer to the mandated questions

- Historical experiment findings → `findings.md` + per-experiment reports + experiment-log (registry/bugs).
- Compatibility status → `compatibility-matrix.md`.
- Current profile → `profile-draft.md`.
- Current normative requirements → `profile-draft.md` Part 4–10, operationalized by `conformance-matrix.md` + `src/n6/`.
- Current research position → **NO single owner exists today** (CONFIRMED). The position is distributed: profile (=requirements) + community-positioning §10 (=rule ranks after falsification) + compatibility-matrix (=capability gaps) + n6-report (=what is enforced).

### 5.3 Proposed future hierarchy (for Phase C to design; nothing moved now)

```text
L0  Immutable experiment record      per-experiment reports, logs, plans, packets,
                                     docs/, evidence/            (never edited)
L1  Capability status                compatibility-matrix.md     (append-with-markers)
L2  External-source claims           community-positioning.md + n3-source-index.json
L3  Normative profile                profile-draft.md            (change-controlled)
L4  Conformance design               conformance-matrix.md       (paired with L3 edits)
L5  Implementation state             n6-implementation-report.md (+ successor reports)
L6  Current-position summary         DOES NOT EXIST YET — Phase C candidate:
                                     a thin, generated-or-managed index that POINTS
                                     into L1–L5 and owns no claims itself
```

Key design constraint discovered this phase: L3/L4/L5 texts quote each other
verbatim (formulas, statuses); Phase C must define a single edit-flow direction
(profile → matrix → suite → evidence) so quotations cannot drift. See §6.4.

---

## 6. N6 Pre-registration Ownership

Work Package 3.2. Facts first, then the ownership model.

### 6.1 Established facts

| Question | Answer | Evidence | Confidence |
|---|---|---|---|
| Where did T01–T15 originate? | `research/conformance-matrix.md` Part B ("black-box test suite DESIGN"), committed `23e7f50` as design-only ("NOT implemented in this stage") | file header + commit order (23e7f50 precedes all N6 code commits) | CONFIRMED |
| Where maintained now? | Twice, redundantly: the md (normative text) and `src/n6/suite.ts` (executable encoding; header: "Expected outcomes are PRE-REGISTERED here verbatim from that matrix … The vitest suite and the evidence generator both consume this module, so they can never diverge") | `src/n6/suite.ts:1-12` | CONFIRMED (dual maintenance exists; "can never diverge" holds only because both consumers use suite.ts — the MD↔suite link is by discipline, not machinery) |
| Which artifact executes them? | `runSuite()` in `src/n6/suite.ts`, consumed by `tests/n6-conformance.test.ts` (32 assertions) | imports verified | CONFIRMED |
| Which artifact generates evidence? | `scripts/run-n6-suite.mts` — writes `case-T*.json`, `summary.json`, AND `conformance-matrix.json` | script lines 30-79, 124 | CONFIRMED |
| Which artifact is derived output? | `evidence/n6/conformance-matrix.json`: rows are TypeScript literals hardcoded at `run-n6-suite.mts:55-74`; serialized verbatim at :76-79; self-labels `"companionTo": "research/conformance-matrix.md"`. NOT parsed from the md; NOT produced by `runSuite()`. Also `summary.json.buildContext` (wall clock/sha). | byte-compared in Phase A; re-inspected this phase | CONFIRMED |
| Do expectations match between md and suite? | Spot-verified T01/T02/T04/T05/T07/T11/T12 pairs (fixtures, expected outcomes, failure conditions correspond; T12 md parenthetical `(2,160,000 ≠ 2,073,600)` vs formula products = the recorded AMB-N6-1 discrepancy, unchanged) | read both sides | CONFIRMED correspondence; AMB-N6-1 remains OPEN (untouched, per prohibitions) |

### 6.2 The generator-literals problem, precisely stated

`evidence/n6/conformance-matrix.json` has THREE ancestors with different roles:
semantic origin (`conformance-matrix.md` Part A/exclusions), edit surface (the .mts
literal array), and published form (the JSON). Its row statements are paraphrases of
the md (shorter), and its status vocabulary (implemented/BLOCKED/open fence/EXCLUDED/
OUT OF SCOPE) differs from the md's (IN FORCE / EXCLUDED / OPEN fence / OUT OF SCOPE).
Consequence: editing the markdown does NOT update the JSON, and vice versa. CONFIRMED.

### 6.3 Recommended ownership model (decision-quality; nothing executed)

1. **Normative origin:** `conformance-matrix.md` (with `profile-draft.md` above it).
   Owns WHAT the requirements and expected outcomes ARE.
2. **Executable encoding:** `src/n6/suite.ts`. Owns the machine-checkable transcription
   (fixtures + expected outcomes). MUST change in the same change-set as (1) whenever
   expectations change. Its "single source of truth" header comment should eventually
   be reworded to "single EXECUTION source" — flagged for Phase C, NOT edited now
   (modifying source is out of Phase B scope).
3. **Presentation literals:** the `matrixRows` array in `run-n6-suite.mts`. Status-
   vocabulary mapping belongs here and nowhere else. If Phase C wants the JSON
   generated from structured data shared with suite.ts, that is a code change to be
   designed then, with evidence-regeneration consequences acknowledged.
4. **Published evidence:** everything under `evidence/n6/` is output; never hand-edited.
5. **Tests:** `tests/n6-conformance.test.ts` asserts suite-vs-pre-registration equality;
   it is a guard, not an owner.

### 6.4 Edit-flow rule for the future (Phase C guardrail)

```text
profile-draft.md  →  conformance-matrix.md  →  src/n6/suite.ts  →  run script  →  evidence/
     (L3)                  (L4)                    (encoding)        (generator)    (output)
```

Any expectation change flows strictly left-to-right in ONE change-set; reverse edits
(forward-porting code behavior into the md) are forbidden without an explicit
falsification-protocol entry. RECOMMENDATION.

---

## 7. Case1–13 Provenance Findings

Work Package 4.1. Commands run: `git show cbd0880 --stat`;
`git log --all --follow -- public/manifests/case1.json`;
`git log --all -- public/svg/case1-circle.svg`;
full-history listing of `scripts/` with `--diff-filter=ADMR`.

Established facts:

1. All 39 case-family files (13 manifests + 26 SVGs) were added in exactly one
   commit `cbd0880` ("feat: add adversarial fixtures for blind renderer cases 1-13",
   2026-08-20 15:07:22 -0300), total +717 lines. CONFIRMED.
2. None of these files was ever modified afterwards (`--follow` shows the single
   commit). CONFIRMED.
3. The entire history of `scripts/` consists of nine ADDITIONS
   (generate-video, build-fixtures, build-e14/e15/e16/e17/n2, e17-aggregate,
   run-n6-suite). No script was ever MODIFIED or DELETED (`--diff-filter=M,D` empty
   for the whole history). Therefore no in-repo generator for case1–13 ever existed,
   at any point in time. CONFIRMED.
4. `build-fixtures.mjs` (present since the initial commit) writes only exp*/text/
   security fixtures; it contains no case-generation branch today, and — per (3) —
   never did. CONFIRMED.
5. Authorship mechanism (hand-written vs generated off-repo vs pasted from a scratch
   process): **UNCERTAIN — cannot be established from repository evidence.** The
   commit message calls them "adversarial fixtures" and the sibling docs describe
   them as built "adversarial per packet §Experiment 12"
   (docs/blind-renderer-report.md:38), which suggests deliberate authorship, but
   git cannot distinguish hand-authoring from out-of-repo generation.

Recommendation to Phase C: record the family as
`provenance: single-commit addition; no in-repo generator; authorship unknown`
in whatever fixture manifest/index Phase C creates. Do NOT write a retroactive
generator and do NOT speculate in durable docs beyond the two facts above.

Related consumer fact (re-verified): the manifests are consumed via URL construction
`?exp=caseN` → `${exp}.json` fallback (`src/main.ts:228`); literal-string searches
alone therefore understate their consumption (Phase A finding, confirmed).

---

## 8. Evidence Refresh Archaeology

Work Package 4.2. Commits examined: `f05d120`, `e08522d`, `cd43c66`, `b02fe11`,
plus deletion commit `2f13b03` (discovered during Phase A; included here because it
completes the policy picture). No evidence regenerated during this audit.

### 8.1 Commit-by-commit findings

| Commit | Date | Contents | Semantics |
|---|---|---|---|
| `f05d120` | Aug 20 15:07 | additions only: blind-comparison case1–13 + summary, screenshots/blind/* | FIRST CAPTURE of blind-generation evidence (misleading word "refresh" in message; stat shows pure additions). CONFIRMED |
| `e08522d` | Aug 20 18:00 | screenshots (blind/exp1/exp2/…) byte-changed; `observations/exp7.json` numeric drift ±0.03–0.14 canvas units in keyframe x measurements | screenshot re-render noise + sub-pixel measurement variance; no semantic claim changes (values remain within the linear-model tolerance reported in findings). CONFIRMED diffs; tolerance reading LIKELY (findings.md quotes "~3.4 canvas units" bound) |
| `cd43c66` | Aug 21 22:29:53 | screenshots again; SEMANTIC changes: blind-comparison case4/case7/case10 landmark y-coordinates shifted (e.g., case7 y 270→60, 1230→1020; case4 y 100→137.5); e14-case13-a/c minor; exp7 noise | **Captured corrected PAR-centering behavior**: committed 3 minutes after `bcd3ad7` "fix: honor capitalized PAR align tokens" (22:26:53, CONFIRMED timestamp), whose subject is exactly vertical alignment. The refreshed evidence reflects post-fix reality of the SAME fixtures. CONFIRMED causal attribution (timing + affected cases = PAR variants) |
| `b02fe11` | Aug 22 01:26 | one PNG (`ramp-plain-video.png`) re-captured | network-viewer run sweep; bytes only. CONFIRMED |
| `2f13b03` | (E15 capture era) | DELETED 4 E15 screenshots named `*-inline-region.png` | only evidence DELETION in history; message: "drop E15 screenshots from superseded harness naming". Implicit policy: evidence with SUPERSEDED NAMING may be dropped; same-named evidence is refreshed IN PLACE. CONFIRMED existence; generalization to a policy is LIKELY (single instance) |

### 8.2 Answers to the mandated questions

- **What was regenerated?** Machine-written evidence (screenshots, observation/comparison
  JSONs) as a side effect of running the suites — `record()` in `tests/e2e/utils.ts:110-113`
  and writeFileSync paths in the unit comparison tests write INTO `evidence/`. CONFIRMED mechanism.
- **Did source fixtures change in those commits?** No — every refresh commit touches
  only `evidence/**`. CONFIRMED (--stat review).
- **Were screenshots merely refreshed?** Bytes yes; but the accompanying JSON updates in
  `cd43c66` are semantic (post-bugfix coordinates), so "refresh" commits can carry
  substantive evidence updates when fixes landed since the previous capture. CONFIRMED.
- **Did evidence semantics change?** Only via implementation-bug fixes between captures
  (bug #13 lineage for cd43c66). No refresh invented or altered a conclusion; reports
  cite the corrected values (e15-report §8.3 documents the #13 fix explicitly).
  CONFIRMED consistency chain.
- **Implicit evidence-refresh policy (as it actually operated):**
  1. suites write evidence as a run side effect;
  2. `chore:` commits sweep resulting diffs;
  3. evidence is refreshed in place under the SAME filename;
  4. filenames themselves were retired once (naming-supersession, 2f13b03);
  5. no commit message distinguishes "noise refresh" from "post-fix refresh" — the
     linkage must be reconstructed from neighboring fix commits (as done above).
  Classification: CONFIRMED as observed practice; NOT a written policy anywhere.

### 8.3 Consolidation implication

Evidence files are REPRODUCIBLE-BUT-NOT-STABLE outputs of test runs: regenerating
today would produce different bytes (rendering nondeterminism) and possibly different
numbers (if fixes postdate a capture). Therefore Phase C's evidence policy should
treat the CURRENT tracked evidence as the archived result set corresponding to the
reports, and forbid casual regeneration — matching the Phase B operating rules.
RECOMMENDATION, consistent with observed practice.

---

## 9. Renderer A Split Analysis

Work Package 4.3. Files: `src/reference/lib/iiif.ts` (139 lines),
`src/reference/lib/e14.ts` (482 lines). No merge performed.

### 9.1 Findings

| Question | Finding | Confidence |
|---|---|---|
| Why do they coexist? | Layered evolution, not duplication: `iiif.ts` is the exp-era Resolver-A pipeline (`resolveManifest`: flat painting annotations → ResolvedOverlay); `e14.ts` adds painting-COMPOSITION resolution (models A/B/C, nested canvases, TextualBody/PNG bodies, security classification hooks) for E14+. | CONFIRMED (structure + headers) |
| When introduced? | `iiif.ts`: initial commit `993d82a` (path then `src/lib/iiif.ts`; relocated by `eafcdba`). `e14.ts`: `e0b848b` ("Renderer A painting-composition resolver"). | CONFIRMED (git log --diff-filter=A) |
| Who consumes which? | `iiif.ts::resolveManifest` → `src/main.ts` exp/case path (:235), `tests/iiif.test.ts`, `tests/blind-comparison.test.ts`. `e14.ts::resolveE14Manifest` → `src/main.ts` e14/e16 path (:187), `tests/e14-comparison.test.ts`, `tests/e16-comparison.test.ts`. | CONFIRMED (import grep, exhaustive) |
| Are they independent? | NO — `e14.ts:37` imports `{motivationIsPainting, isSvgBody, isVideoBody, parseTarget, mergeFragments}` FROM `iiif.ts`; it reuses the parsing core but has its own placement math (`parseSpatialRect`, :88) vs iiif.ts treating the spatial fragment directly as viewport (:124-126). | CONFIRMED |
| Intentionally frozen overlap? | The overlapping-but-not-identical placement logic was never reconciled; later stages explicitly left historical harnesses untouched (experiment-log #16 freezes e16.spec; next-session-plan mandates reuse-not-rebuild). Intent inference: LIKELY. | LIKELY |
| Ever compared head-to-head? | NO test or script imports both resolvers; no evidence artifact records a direct iiif.ts-vs-e14.ts differential. | CONFIRMED ABSENCE (exhaustive import search) |
| Can consolidation treat either as legacy? | NOT SAFELY: `iiif.ts` is (a) the active resolver for the whole exp/case URL surface incl. blind.spec/parity.spec runs, (b) a parsing-core dependency of `e14.ts`, (c) the comparison baseline for blind-generation evidence. Treating it as dead would orphan the exp-era record; merging it into e14.ts would rewrite the historical baseline. Equivalence on overlapping inputs: UNKNOWN (never measured). | CONFIRMED (usage), UNKNOWN (equivalence) |

### 9.2 Characterization (refines Phase A)

Phase A classified this as "INTENTIONAL_DUPLICATION (generation layering)". Phase B
refines: it is a **shared parsing core with two resolution layers** — duplication is
confined to placement/viewport logic, and the layers serve disjoint fixture surfaces.
For Phase C the correct mental model is "one renderer, two historical resolution
entry points", NOT "two Renderer A implementations to deduplicate". Any equivalence
measurement would be NEW research (new evidence) and is out of consolidation scope.

---

## 10. Current Research Framing

Work Package 5. Analytical only; no public-facing document touched.

**1. Original research question** (plan.md, findings.md): can Web Annotation +
Media Fragments + IIIF Presentation + SVG express portable, TEMPORAL, graphical
overlays on VIDEO without inventing vocabulary — with an attempt to falsify.

**2. What the experiments actually investigated** (evidence trail):
- E1–E11: expressibility of temporal/spatial windows, primitives, layering, scaling
  on a video Canvas (verdict B).
- E12/E13: adversarial interpretation differences between independent implementations.
- E14: composition MODELS (painting structures) and SVG-as-image resource semantics.
- E15/E16/E17: GEOMETRY DETERMINISM of painted SVG/Canvas bodies across embedding
  mechanisms and engines; fit-rule ambiguity; leaf-PAR collapse.
- N2: consumer realization gap (crash/drop for ANY secondary painting body).
- N3/N4/N5: positioning, safe-subset decision, formalized profile of geometric
  predictability (resource-side conformance).
- N6: mechanical conformance checking of resources against that profile.

The center of gravity migrated from "annotations on video" to "under which
conditions does painted-content geometry on IIIF Canvases become predictable and
checkable". Video persists as substrate (duration-bearing Canvases, t= fragments,
AV players as consumers), but most profile boundary items (§Part 1.2) are
media-type-agnostic; the P5a worked example (higher-resolution replacement) is not
video-specific.

**3. Is "video annotation" too narrow?** For FUTURE descriptive prose, yes —
LIKELY-to-CONFIRMED as a characterization of the evidence base. Two caveats keep it
from being simply wrong: temporal targeting remains in scope (R-S6a/R-S8a), and the
deployment blocker was measured specifically on AV players (Ramp/Mirador).

**4/5. Framing candidates evaluated (nothing adopted):**

- Candidate 1: "portable/interoperable temporal and spatial graphical overlays over
  media resources." Accurate but keeps the overlay/annotation lens; understates that
  the hard-won results are about PAINTING/COMPOSITION semantics and conformance
  mechanics.
- Candidate 2: "interoperable graphical composition over temporal media using
  existing Web and IIIF vocabulary." Closer to the evidence: "composition" matches
  E14+, "existing vocabulary" matches the no-new-vocabulary constraint and N3's
  finding that P1/P2 are genuine conventions, "temporal media" preserves the video
  lineage without claiming video exclusivity.

**Trajectory-model check (mandated):**

```text
existing standards vocabulary → expressive space → browser/consumer constraints
→ safe interoperability subset → profile / conformance model
```

This matches the repository's actual sequence: falsification of the expressibility
hypothesis (verdict B: expressible WITH gaps) → E14–E17 constraint discovery
(embedding mechanisms, engines) → N2 consumer non-realization → N4 same-aspect
subset → N5 formalized profile ([PROFILE] constraints on [NORMATIVE]/[BROWSER]
substrate) → N6 resource-side conformance validator with honestly BLOCKED consumer
side. CONFIRMED as description; the model's honesty hinges on preserving the class
labels at each arrow — which §4 protects.

**Conservative recommended wording for FUTURE documents** (not applied anywhere):
describe the project as investigating *predictable, interoperable geometry for
graphical resources (SVG/Canvases) painted onto IIIF Presentation Canvases —
including temporal targeting — using existing standards vocabulary, with a
conventions-and-conformance approach rather than new vocabulary.* Explicitly NOT
claimed: a new standard, protocol, or normative authority; the profile self-describes
as lab conventions with [PROFILE] authority only (profile Part 1 "IS/IS NOT").
Consumer-side certification remains blocked (N6 §6). CONFIRMED that the corpus
supports this conservative framing.

---

## 11. Consolidation Decisions Needed Before Phase C

Decision list (each blocks some Phase C design choice). None decided here.

| # | Decision | Options | Input ready? |
|---|---|---|---|
| D1 | Adopt §2 terminology conventions (axis-word rule; qualified collision terms) for future docs | adopt as-is / amend | yes (§2) |
| D2 | Choose taxonomy strategy: common legend + scoped taxonomies (C) vs pure scoping (B) vs unification (A) | recommend C | yes (§4.2) |
| D3 | Approve source-of-truth hierarchy L0–L6; commission the L6 pointer-document design | approve / reshape | yes (§5.3) |
| D4 | Approve N6 ownership model + left-to-right edit flow (§6.3/6.4), including eventual rewording of suite.ts's "single source of truth" comment | approve / defer | yes |
| D5 | Record case1–13 provenance statement (single-commit, no generator, authorship unknown) in Phase C's fixture documentation; forbid retroactive generators | yes/no | yes (§7) |
| D6 | Codify evidence policy: current tracked evidence = archived result set; regeneration only under explicit protocol; naming-supersession allowed only with pointer records | yes/no | yes (§8) |
| D7 | Renderer A model-of-record: "one renderer, two resolution entry points"; forbid merges; treat equivalence testing as out-of-scope new research | yes/no | yes (§9) |
| D8 | Future-doc framing sentence (§10 end); README refresh deferred to Phase C/D with "as of" qualifiers rather than rewrites | choose wording | yes |
| D9 | Decide fate of stale README layout section (fix in Phase C/D while preserving history note) vs leave | options | yes (§5.1 last row) |
| D10 | AMB-N6-1 handling: keep OPEN through consolidation; ensure Phase C docs repeat, not resolve, the ambiguity | yes/no | yes |

## 12. Recommended Phase C Guardrails

1. Never edit L0 (immutable experiment record) documents; restructure around them via
   indexes/pointers only (P-TERM-2/3).
2. Preserve every ID space verbatim: exp*/E*/N*/T*/R-S*/X*/P*/F*/Q*/R-V/M-M/I-*/
   AMB-* and evidence filenames incl. typos (P-TERM-5).
3. No renaming/moving of `src/{reference,blind,native}/` or renderer entry symbols;
   imports (incl. N6→blind helpers) must keep resolving during any move that is later
   approved (§12 risk in Phase A; §9 here).
4. Any new legend/taxonomy document introduces ZERO new labels (§4.2).
5. Evidence tree: append-only by default; deletions require superseded-naming
   justification per the 2f13b03 precedent (§8).
6. Documentation refreshes must preserve point-in-time claims with "as of <commit>"
   qualifiers instead of silent correction (§8.2 policy, §5.1 README).
7. Keep [OPEN] fences, BLOCKED statuses, and SUPERSEDED markers structurally visible
   in any consolidated view (P-TERM-3/4).
8. Markdown↔code quotation pairs (formula strings, status strings) get a single
   edit-flow direction (§6.4) to prevent drift.

## 13. Unresolved Questions

Carried forward explicitly unresolved (unchanged from Phase A except where WP4
answered them):

1. ~~case1–13 authorship~~ → narrowed by §7: no-generator-ever CONFIRMED; hand vs
   off-repo generation stays UNCERTAIN.
2. Full enumeration of byte-identical e15↔e17 Chromium screenshot pairs (2 sampled
   pairs confirmed identical; full hash sweep not performed — low value, optional).
3. `iiif.ts` vs `e14.ts` behavioral equivalence on overlapping inputs — UNKNOWN by
   design; measuring would be new evidence, not consolidation.
4. Whether the implicit evidence-refresh practice (§8.2) should become a written
   policy in Phase C (D6).
5. AMB-N6-1 — OPEN by prohibition; Phase C must propagate, not settle it.
6. Whether any external consumer depends on evidence filenames/docs citing them
   (assumed none; unverifiable from repo).
7. Whether the L6 "current position" document should be hand-maintained or
   generated from front-matter metadata in L1–L5 (design question for Phase C).

## 14. Confidence / Evidence Notes

- Every table cell marked CONFIRMED cites either a file:line, a command output
  (git show/log/stat), or a byte/hash comparison performed in Phase A/B sessions.
- Code-level claims (types `RendererKind`, `E14Model`, `IiifMode`, `zProvenance`,
  `canonicalPrefix`, import graphs) were read from source this session; line numbers
  refer to the baseline working tree at `4763abf`.
- Git-archaeology claims are reproducible via the exact commands listed in §§7–9.
- Items marked LIKELY involve intent or generalization from limited instances
  (freezing intent; refresh-policy generalization; findings-tolerance reading);
  items marked UNCERTAIN cannot be settled from the repository (fixture authorship;
  external dependents).
- No evidence was executed, fetched, or regenerated during this phase; all
  browser/network-dependent facts are cited from archived reports/evidence.

---

## Appendix — Proposed Phase C Plan (PREVIEW ONLY — DO NOT EXECUTE)

Proposed shape of Phase C, contingent on decisions D1–D10:

1. **Design inputs:** this audit (§§2, 4, 5, 6, 10) + Phase A inventory.
2. **Deliverables sketch:**
   - canonical current-state document (the L6 pointer/index) with strict
     no-claims-of-its-own policy;
   - documentation map assigning every existing research/doc file to L0–L5 with
     retention rules (archive-in-place vs index);
   - terminology legend (new, zero new labels) implementing D1/D2;
   - evidence preservation policy codifying D6 (including refresh protocol and
     naming-supersession rules);
   - fixture provenance manifest codifying D5 (family-by-family generator status);
   - README refresh plan implementing D8/D9 with historical qualifiers;
   - optional directory/document restructuring proposal — explicitly deferring any
     `src/` moves unless D-decisions demand them, with import-safety checks.
3. **Explicit non-goals:** no renames of IDs/files; no renderer merges; no evidence
   regeneration; no AMB-N6-1 resolution; no [OPEN]-promotion.
4. **Verification style:** Phase C should ship its design as a document + checklist,
   with Phase D executing mechanically and Phase E validating independently.

*End of Phase B audit. Branch `consolidation/inventory-audit`; only this document added.*
