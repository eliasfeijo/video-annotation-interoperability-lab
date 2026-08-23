# Phase H.1 — Concept ↔ Architecture Reconciliation

Status: reconciliation analysis. No source, test, fixture, evidence, or research file was
modified to produce this document; it is the single requested output of Phase H.1.
Companion inputs: `research/phase-g1-source-architecture-inventory.md` (authoritative for the
current source architecture), the Phase F terminology specification (authoritative for target
concepts), `research/conformance-matrix.md`, `research/compatibility-matrix.md`,
`docs/ambiguities.md`, `docs/blind-interpretation-rules.md` (the interpretation packet),
`research/evidence-policy.md`, and direct source inspection where G.1 needed confirmation.

---

## 1. Scope and method

This phase answers: **how should the conceptual architecture of the research map onto the
architecture that actually exists in source?** It reconciles two authorities:

- Research documents, authoritative for *concepts and requirements they define*
  (requirements R-S1…R-S8b, exclusions X1–X8, provenance classes, the C1–C6 taxonomy,
  renderer roles, validator role, evidence policy).
- Executable source, authoritative for *what the code does* (per Phase G.1, re-verified
  directly where a claim below depends on it).

Method: every H-question was answered against G.1 findings first; where an answer's weight
rests on a specific code fact (imports, call sites, unreachable branches), that fact was
re-checked in source during H.1 rather than trusted from prose. Code comments were treated as
claims; where source establishes behavior directly, the source statement wins.

Epistemic labels used throughout:

- **OBSERVED** — established from source, configuration, or cited research documents.
- **INFERRED** — an interpretation supported by observed facts but not itself directly
  inspectable.
- **OPEN QUESTION** — not determinable in this phase; carried to §12 / H.2.

Nothing labeled INFERRED or OPEN QUESTION is silently promoted elsewhere in this document.

A note on one terminology input: the Phase F specification defines the conceptual vocabulary
(Renderer A/B, Blind/Native renderer, Validator, harness-below-term-level, N-06
renderer-agreement check, N-21 non-standard extensions). H.1 treats it as the concept side of
the reconciliation and does not re-design that vocabulary; where this document proposes
descriptive phrasing for the three consumer stacks (§4), it operates strictly inside the
specification's own axis-qualified-name rules and defers naming decisions to it (U2).

---

## 2. Reconciled conceptual architecture

OBSERVED hierarchy (roles confirmed to exist as separable responsibilities; INFERRED grouping
noted per layer). The prompt's suggested hierarchy holds with three amendments: Renderer B is
NOT a consumer implementation (it has no resolution semantics); "shared semantic primitives" is
a real layer even though it has no namespace of its own; and fixtures/records sit at the base
as inputs rather than a layer above.

```
Application / Lab Harness                       (src/main.ts, index.html, public/*.html, configs)
    |
    +-- Independent Consumer Implementations     (reference/, blind/, native/ — resolver+stage each)
    |       \-- Oracle / reference-data path     (experiments.ts + renderers/rendererB.ts — NOT a consumer)
    |
    +-- Interchange / Semantic Records           (e14/types.ts de facto IR; legacy ResolvedOverlay model;
    |                                             bridges in main.ts)
    +-- Comparison / Diagnostic Infrastructure   (experiments.sameOverlay; blind/comparison.ts; e14/comparison.ts)
    +-- Measurement / Analysis Infrastructure    (e15/*, e17/*, e16/comparison.ts)
    +-- Conformance / Validation Infrastructure  (n6/*)
    +-- [de-facto] Shared Semantic Primitives    (blind/placement.ts viewBox math, blind/svg-root.ts,
    |                                             blind/temporal.ts predicate — no namespace of their own)
    +-- Evidence & Record Pipeline               (test-embedded writers, run-n6-suite.mts, e17-aggregate.mjs,
                                                  fixture builders, evidence-policy governance)
```

Layer explanations:

- **Application / Lab Harness** — OBSERVED: the only code that knows all implementations and
  bridges their models (`main.ts` imports every resolver and stage). The terminology
  specification places the harness below term level (§5.7 note) while G.1 shows it is
  architecturally load-bearing. Both are true: it is real infrastructure with no conceptual
  name yet.
- **Independent Consumer Implementations** — OBSERVED: three stacks, each pairing a semantic
  resolver with a DOM stage. Their independence is methodological (the specification's
  "methodological blinding", C5): agreements are evidence only because the implementations do
  not share resolution logic. OBSERVED cross-imports among resolver/stage paths are exactly
  one: `native/stage.ts` imports `blind/temporal.ts#isActive`.
- **Oracle path** — OBSERVED: `experiments.ts` supplies hard-coded expected overlays plus the
  same SVG payloads the manifests reference; `rendererB.ts` lowers them into the legacy record.
  It performs no parsing/resolution of standards structures and is deliberately non-standard.
- **Interchange records** — two coexisting record systems (E14 record; legacy ResolvedOverlay);
  analyzed in §7.
- **Comparison infrastructure** — three mechanisms at different representation levels; §6.
- **Measurement infrastructure** — embedding matrix pages plus pure prediction/classifier
  libraries; no renderer imports them (G.1 §3.7–3.9).
- **Conformance validation** — resource-side checker; §8.
- **Shared semantic primitives** — a *de-facto* layer: pure functions implementing
  standards/profile readings that are consumed across namespaces while living inside a renderer
  directory. This layer exists in fact but not in name; §5 classifies it operation by operation.
- **Evidence & record pipeline** — producers are partly tests, partly scripts; governed by
  `evidence-policy.md`. §9.

---

## 3. Concept → source mapping

Statuses: DIRECT (role and location coincide by design), DE FACTO (role exercised though the
location/name encodes something else), HISTORICAL (live but named for a past era), MIXED,
UNCERTAIN.

| Conceptual role | Source locations | Current consumers | Status | Evidence |
|---|---|---|---|---|
| Application/lab harness | `index.html`, `src/main.ts`, `public/*.html`, vite/vitest/playwright configs | Playwright specs via `__lab`/`__e15`/`__e17`; humans via `pnpm dev` | DIRECT (conceptually unnamed — spec keeps it below term level) | G.1 §2, §3.1; spec §5.7 note |
| Standards-driven consumer (Renderer A) | `src/reference/lib/{iiif,selectors,timing,svg,sanitize}.ts`, `renderers/dom.ts` | `main.ts`; exp/text/security/parity specs; vitest suites | DIRECT | G.1 §3.3; spec §5.7 |
| Direct-reference oracle (Renderer B) | `src/experiments.ts`, `src/reference/renderers/rendererB.ts` | `main.ts` parity; exp1–7 specs' `expectParityClean` | DIRECT (role distinct; lives inside reference/) | G.1 §2.1, §3.2; spec §5.7 |
| Method-blinded independent consumer (Blind renderer) | `src/blind/{parser,selectors,temporal,svg-root,placement,layers,sanitize,resolver,compositor}.ts` | `main.ts`; blind specs/tests; comparison | DIRECT | packet header ("only source of interpretation rules"); G.1 §3.4 |
| Browser-pipeline consumer (Native renderer) | `src/native/{resolver,stage}.ts` | `main.ts`; e14/e16/e17 specs | DIRECT | native resolver header ("written from the E14 interpretation packet"); compatibility-matrix row: `<img>` = true consumer semantics of an Image body |
| Renderer-neutral interchange record | `src/e14/types.ts` (+ adapters `reference/lib/e14.ts`, `blind/e14.ts`, `native/resolver.ts`) | `e14/comparison.ts`; `main.ts` bridges; e14/e16 vitest suites | DE FACTO (name is an experiment number) | types.ts header ("deliberately shared infrastructure … NOT renderer semantics") |
| Legacy experimental model | `src/reference/lib/types.ts` (`ResolvedOverlay`, `RendererKind`), `experiments.ts` | regular-exp app flows, Stage, comparisons, exp1–7 coverage | MIXED (live model + historical era) | G.1 §7; compatibility-matrix rows citing exp1–7 |
| Bridge adapters (interchange → legacy stages) | `main.ts#e14ToResolvedA`, `#e14ToBlindOverlay` | e14/e16 branch of the app | DE FACTO compatibility layer | G.1 §7 residue list |
| Comparison/diagnostic infrastructure | `experiments.sameOverlay`; `blind/comparison.ts`; `e14/comparison.ts` | `__lab.parity*`, `e14Compare`; three vitest suites | DIRECT | §6 below; spec N-06 |
| Measurement/analysis infrastructure | `src/e15/{page,analysis}.ts`, `src/e17/{page,classify}.ts`, `src/e16/comparison.ts` | e15/e17 specs; nothing renders from them | DIRECT (numbering HISTORICAL) | page headers ("implements NO IIIF/W3C resolution semantics") |
| Conformance validation | `src/n6/**` | `tests/n6-conformance.test.ts`; `scripts/run-n6-suite.mts` | DIRECT (numbering HISTORICAL) | spec §5.5 "Validator … Implementation: src/n6/" |
| Shared semantic primitives | `blind/placement.ts#computePlacement`, `blind/svg-root.ts`, `blind/temporal.ts#isActive` | n6 (validator), native/stage, blind itself | DE FACTO (no owning namespace) | import grep re-run in H.1: `n6/validator.ts:54`, `n6/svg.ts:16`, `native/stage.ts:19` |
| Evidence pipeline | test-embedded writers (`utils.record/shot`, 3 vitest suites), `run-n6-suite.mts`, `e17-aggregate.mjs`, fixture builders ×7 | L0 reports; evidence tree | DE FACTO (policy-sanctioned side effects) | evidence-policy P-4 producer table |
| Experimental/non-standard extensions | exp7 keyframe machinery (`main.ts` branch, `dom.ts#keyframeOffset`, `exp7-keyframes.json`, `7-animate` special case) | exp7 spec | HISTORICAL-but-live | spec N-21; compatibility-matrix "marked explicitly non-standard" |

UNCERTAIN entries: none at role level; individual unused exports remain UNCERTAIN (§10).

---

## 4. Renderer/consumer taxonomy

OBSERVED problem (from G.1): directory names encode three different properties —
`reference` conflates the Renderer-A implementation with the Renderer-B oracle;
`blind` names a method; `native` names a mechanism. The Phase F specification already resolves
this at the concept level with four axis-qualified roles (§5.7, C5). H.1 therefore does not need
to invent a taxonomy; it adopts the specification's and makes its non-authority implications
explicit. Machine surfaces (`?renderer=a|b|blind|native`, verdict strings, `RendererKind`)
remain untouched code enumerants (spec principle 8; U2 defers any change).

| Current directory | Current/historical name | Conceptual role (spec-aligned) | What makes it independent | What its name must NOT imply |
|---|---|---|---|---|
| `src/reference/` | Renderer A; "reference implementation" | **Standards-driven consumer**: resolves manifests per IIIF/WA/MF, adopting a synthesized-viewBox reading where standards underdetermine | Its resolver/stage share no resolution logic with blind/native; its divergent choices are recorded (ambiguities #1/#2) | "Reference" must not mean *normatively correct*; its no-viewBox reading was empirically falsified as consumer semantics under `<img>` (ambiguity #5), and out-of-bounds handling is a documented genuine ambiguity (#6) |
| `src/experiments.ts` + `rendererB.ts` (inside reference/) | Renderer B; "deliberately-simple reference" | **Direct-reference oracle**: intended geometry from fixture metadata, no standards resolution | Non-standard by design; exists only to be compared against | Not a consumer; must never be counted as an implementing consumer in agreement claims |
| `src/blind/` | Blind Renderer | **Method-blinded consumer**: written from the interpretation packet + cited specs only | Never reads other resolvers' resolution logic (OBSERVED: zero such imports); disagreements vs A are the experiment's output | "Blind" describes provenance/method, not superiority or compliance; packet fidelity ≠ profile conformance claims |
| `src/native/` | Native Renderer | **Browser-pipeline consumer**: renders bodies through the browser's replaced-element (`<img>`) pipeline; predicts that placement analytically | Independent resolver written from the E14 packet; its stage delegates geometry to the browser | "Native" truth applies to the replaced-element channel only; it is not platform ground truth for nested-`<svg>` channels (ambiguity #5 shows channel-dependence) |

INFERRED: the neutral, letter-free descriptors above ("standards-driven",
"method-blinded", "browser-pipeline") can serve as prose vocabulary without touching machine
enumerants, consistent with spec U2's default of no action. OPEN QUESTION (→ H.2/spec U2):
whether prose should standardize on these descriptors or keep "Renderer A/Blind/Native" as-is.

---

## 5. Shared semantic primitives vs renderer-specific behavior

Classification of each duplicated operation into the prompt's categories:
**A = deliberate independence**, **B = shared infrastructure**, **C = historical/incidental
duplication**. "Shared abstraction conceptually justified?" asks whether the capability is
renderer-neutral in principle — it does NOT assert the code should move (that is H.2).

### 5.1 Media Fragment parsing

One concept (MF grammar → temporal/spatial fragments), realized as **multiple distinct
policies** — answer **C** of the prompt's options (one semantic concept plus separate
consumer/producer profiles):

| Implementation | Policy | Category |
|---|---|---|
| `reference/lib/selectors.ts` | accepts `pct:`/`percent:`/`pixel:` (post-fix); **no bounds validation**; malformed fragments dropped silently | A w.r.t. bounds — the divergence is a documented genuine `[NORMATIVE]` ambiguity (ambiguities #6) that E15/E16 deliberately kept observable |
| `blind/selectors.ts` | same acceptance; **rejects top-left-outside rects (MF §6.3.3)**; drops malformed per MF §6.2 SHOULD-ignore | A w.r.t. bounds; the compliant-side reading per ambiguities #6 |
| inline in `native/resolver.ts` | ≈ blind-lite: bounds check `x<w && y<h` only when canvas dims known; combined `t=`/`xywh=` handled inline | A (consumer policy), structurally incidental |
| `n6/fragments.ts` | strict grammar; **reports** malformed instead of dropping; accepts out-of-range values by design (syntax-level) | distinct concept-role: producer/conformance profile, not consumer behavior — its header states the deliberate difference |

Semantically meaningful differences: drop-vs-report (consumer vs producer obligation —
structurally mirrored by R-S6a/R-S8a being syntax requirements while honoring stays fenced);
out-of-bounds handling (real interop question). Historical/incidental: Renderer A's earlier
`pct:`-only acceptance (fixed; ambiguities notes `percent:` now agrees everywhere); code
structure. Shared abstraction: a grammar core is conceptually renderer-neutral, but no current
code shares it, and policies must stay per-consumer; extraction is an H.2 question, not
settled here.

### 5.2 Temporal window resolution

One concept, effectively one policy: half-open `[start,end)` per MF §4.2.1 (packet §10/13
declares this normative). Two modules (`blind/temporal.ts`, `reference/lib/timing.ts`) plus
native's inline copy implement the same semantics. OBSERVED incidental divergence:
`timing.temporalWindow` coerces `end<start` to an open-ended window, but that branch is
**unreachable through resolvers** because both parsers reject `end<start` first
(`parseTemporal` returns null → fragment dropped → whole-canvas window) — matching
ambiguities' "invalid `t=20,10` dropped" agreement row. Category: B-in-principle (the activity
predicate `isActive` is already reused by native), C-in-current-form (two module copies).

### 5.3 SVG root parsing

One concept (extract viewBox/PAR/width/height from the root tag), zero interpretive content,
three near-identical copies (`blind/svg-root.ts`, `reference/lib/svg.ts`, inline
`readAttrs` in native). Micro-drift (unit-suffix tolerance) is incidental, not designed.
Category: C today; B in principle — n6 already consumes blind's copy, demonstrating the reuse
is safe precisely because nothing here is a policy.

### 5.4 SVG placement

One geometric concept (user-space → Canvas affine map given destination + root attrs) carrying
**multiple named readings**:

- Region-as-viewport + PAR meet/slice/none + **no-viewBox → 1:1**: `blind/placement.ts`
  (packet §§5–7). The same reading is what R-S2 assigns (profile Part 6 layer model) and what
  n6 emits as declarative predictions — hence n6's import.
- Region-as-viewport + **no-viewBox → synthesized viewBox fit**: `reference/lib/svg.ts`
  (`computeNestedSvgPlacement`) and `reference/lib/e14.ts#refPlacement` — the deliberate
  opposite policy (ambiguities #1), the lab's central measured disagreement.
- Analysis-only candidate maps: `e15/analysis.ts` interpretations (I-*), `e16/comparison.ts`
  fill/contain — counterfactual predictions, consumed by no renderer.

Intentional differences: the no-viewBox fork IS the experiment (ambiguity #5 falsified the
1:1 reading under `<img>`; three consumers, three geometries). Incidental: the meet/slice
arithmetic itself is copied four times in executable code — the arithmetic is not the
independence-bearing part; the policy choice is. Shared abstraction: conceptually justified
only as a **labeled** primitive ("viewBox-fit math per reading X"); naive sharing would smuggle
one reading into all consumers and destroy the observable. Category: mixed A (policy fork) +
B (the winning-reading math already functions as shared infra via n6).

### 5.5 Nested-Canvas mapping

One concept (inner Canvas → outer rect linear map). Consumers implement the **fill** reading
inline ×3 (byte-identical formula); the **contain** counterfactual lives only in analysis
(`e16.fitMap`) because fill-vs-contain is the profile's OPEN territory (X1; compatibility-matrix
row "fit semantics … `[OPEN]`"). Intentional: exercising one reading while measuring the other.
Incidental: triple inline duplication of the formula. Same conclusion as placement: policy
forks stay with consumers; the formula could be a labeled primitive (H.2 question).

### 5.6 Z-order

One concept, **deliberately undefined** by the profile (glossary: "Deliberately UNDEFINED";
X6 out-of-scope; T08/T10 audits forbid stacking assertions in validator output). All three
consumers assign encounter-order zIndex locally (CONVENTION under Mode A, normative-labeled
under Mode B — packet §8); n6 asserts nothing. There is no layer engine and should be none:
sharing z-order logic would manufacture agreement on exactly the dimension the research keeps
open. Category: A by design. `blind/layers.collectPaintingAnnotations` (unused) is C-residue.

### 5.7 Security classification

One concept-family (feature detection: script/foreignObject/eventHandler/externalHref…) with
**three distinct policies that are themselves results**:

- Blind: classify → reject unsafe (red marker), sanitize unsupported (Case-13 mandate,
  explicit CONVENTION — packet §17).
- Reference: strip-at-render via allowlist sanitizer, implicit convention, no classification
  record (ambiguities #4).
- Native: classify, decision always "render" — the `<img>` sandbox is platform behavior,
  recorded as `IMPLEMENTATION_GAP` (ambiguities #7).

Differences intentional (they are the measured policy space). Detection regexes overlap but
each consumer's set differs slightly; the two sanitizers carry **different allowlists**
(blind allows gradients/mask/pattern etc.; reference allows marker-* attrs) — partially
intentional scope choice, partially drift; classified MIXED. Shared abstraction justified
only for raw detection, never for the decision.

### 5.8 Sanitization

One activity (allowlist scrub), two implementations with different tables (above). The
security *posture* difference is independence-bearing (A); the table divergence is C-drift
except where scope was deliberate. No abstraction decided here.

### 5.9 Additional duplications observed (for completeness)

- Letterbox/contentRect + coordinate conversion ×3 stages: one presentation convention
  (packet §12), category C.
- Multi-selector merge (first-selector-wins per dimension, W3C §4.2): duplicated in
  blind/parser and reference/iiif, implicit in native; identical semantics, category C.
- `asArray` helpers ×5+: pure utility, category C.
- E15 scoring math (spec-private copy vs `e17/classify.ts`): documented verbatim freeze —
  category A-with-a-papertrail (deliberate, stated in both headers).

---

## 6. Comparison architecture

Answer: a **hierarchy of comparison layers over different representations** — one conceptual
activity family (the specification's N-06 "renderer-agreement check") implemented as three
era-specific mechanisms. Their distinct vocabularies are preserved as-is; unification is
neither proposed nor desired here.

| Layer | Mechanism | Representation compared | Question it answers | Vocabulary (preserved) |
|---|---|---|---|---|
| L1 resolved-set parity | `experiments.sameOverlay` (via `__lab.parity`) | legacy `ResolvedOverlay` fields, A vs B | Does the standards serialization carry enough information to reproduce the intended result? | field diff strings (`start: … != …`) |
| L2 landmark-level semantic diff | `blind/comparison.ts#compareSemantics` (via `__lab.parityBlind`, `tests/blind-comparison.test.ts`) | A-resolved vs blind-resolved, lowered into sampled-landmark semantic records | Do two independently written consumers resolve the same visual layout? | tags like `difference:no-viewBox-placement`, `difference:spatial-fragment-validation` |
| L3 record-level pairwise diff | `e14/comparison.ts#compareE14` (via `__lab.e14Compare`, e14/e16 suites) | any pair of {a, blind, native} over E14 records, aligned by (startTime, zIndex) | Where do three implementations differ, and under which rule provenance does each difference fall? | provenance-classified diffs (`OPEN`, `DERIVED`, `CONVENTION`, `IMPLEMENTATION_GAP`), verdict strings `a==blind` |

OBSERVED: the layers are stacked in practice — L2 consumes L1-style resolved sets; L3 consumes
the interchange record the adapters produce. They are not redundant: each exists because the
representation beneath it changed (legacy record → semantic landmarks → neutral E14 records).
The archived `==`/`!=` verdict strings are the C4 "comparison outcome" records; all three
mechanisms remain valid descriptions of their own evidence families (N-06).

---

## 7. E14 and legacy model relationship

OBSERVED facts:

- `src/e14/types.ts` self-describes as "shared evidence / comparison data model … deliberately
  shared infrastructure … NOT renderer semantics"; it is filled by three adapters
  (`reference/lib/e14.ts`, `blind/e14.ts`, `native/resolver.ts`), consumed by
  `e14/comparison.ts` and `main.ts`.
- The terminology specification already treats the composition-model letters as persisting
  machine encoding (`E14Model`) inside a concept whose canonical name is letter-free — i.e.,
  the research expects E14-era encoding to survive in code while the vocabulary moves on.
- The legacy `ResolvedOverlay` model remains: the reference consumer's native output; the input
  to L1/L2 comparisons; the rendering target for all regular-exp flows; and the target of the
  `main.ts` bridge functions that lower E14 records onto legacy-model stages.

Determination: E14 is best understood as **mixed, with layers**:

1. **Interchange representation (de facto, concept-permanent function):** `e14/types.ts` is the
   renderer-neutral semantic record of the E14 generation — the point where all three
   consumers meet for comparison. Nothing else in the repo plays this role.
2. **Experiment artifact (historical identity):** the name `e14` cites the experiment; reports
   and evidence families (`evidence/e14/*`) own that history. The name is a citation
   coordinate, not a role statement (same pattern as e15–e17, n6).
3. **Not** merely a compatibility representation: compatibility runs in the opposite
   direction — the `main.ts` bridges take E14 records DOWN to the legacy model, which shows
   the legacy model, not E14, playing the compatibility role today.

Legacy model determination (H7): **combination — B + C + D of the prompt's options**:

- still-valid first-class experimental model: it carries exp1–7/text/security/case1–13 flows
  end-to-end (OBSERVED live coverage; compatibility-matrix cites those experiments as S-grade
  evidence);
- compatibility layer: receives E14-record content via bridges for e14/e16 browser flows
  (OBSERVED);
- regression/oracle substrate: Renderer B's oracle data and `parity()`/`parityBlind()` both
  operate on it (OBSERVED).

It is **not** obsolete residue (option A): no answer to "should it be removed" is possible or
attempted here. OPEN QUESTION (→ H.2): whether the dual-model arrangement is a permanent
two-tier design (modern record + display models) or a transition state.

---

## 8. N6 architectural placement

What N6 **is** (OBSERVED, aligned with spec §5.5/C3): the **Validator** — a deterministic,
browser-free, consumer-free program that checks *resources* against the profile's
resource-side requirements (R-S1, R-S3–R-S6b, R-S7, R-S8a), emits analytic predictions
(region-as-viewport placement; uniform-scale mappings), represents the consumer contract as
BLOCKED (R-S2) and temporal honoring as an OPEN_FENCE (R-S8b), audits its own output
vocabulary (T08/T10), and executes the pre-registered suite T01–T15.

What N6 is **not**: not a renderer (renders nothing; no DOM); not a semantic preflight layer
(nothing in the render pipeline invokes it; it gates nothing at runtime); not a fourth consumer
(it implements no consumer obligations and certifies none — consumer conformance is
declaratively BLOCKED by design, profile Part 11.2).

Its imports from `src/blind/` (OBSERVED: `validator.ts` ← `computePlacement`, `SvgRootAttrs`;
`svg.ts` ← `readSvgRootAttrs`):

- N6 is **independent of rendering** — yes, absolutely (no browser/DOM/rendering imports).
- N6 is **not independent of renderer namespaces** — it compiles against a consumer
  directory's internals.

Is this architectural coupling? Analysis (mix of OBSERVED and INFERRED):

- The imported functions implement SVG 1.1 §7.7/§7.8 mapping plus the region-as-viewport
  assignment — content that originates in the interpretation packet and was **adopted by the
  profile itself** (R-S2, Part 6: "Assigned BY THIS PROFILE"). Blind uses them as one consumer
  realizing the rules; n6 uses them as the profile's declarative predictor. The *interpretation
  content* of the dependency is profile-level, not blind-specific (INFERRED, supported by
  profile-draft Part 6 and the packet's rule classes).
- The coupling is therefore **implementation-level (namespace location), not conceptual**:
  conceptually both sides depend on the same profile/SVG reading; mechanically the validator
  reaches into a consumer's directory to get it. The risk is asymmetric evolution — if the
  blind consumer ever specialized these helpers with consumer-specific behavior, the validator
  would inherit the change silently (INFERRED risk; no such specialization exists today —
  OBSERVED the functions are packet-bound and policy-free in the viewBox branch n6 exercises;
  n6 never reaches the no-viewBox branch because R-S1 rejects those bodies first).
- Note the asymmetry against the research record: the packet/spec sanction pure-helper reuse
  *into* the blind renderer ("Sanctioned exception: pure geometric helpers may be reused where
  documented"); nothing in the record addresses reuse *out of* a renderer namespace. That is a
  vocabulary/governance gap, not a code defect.

No refactoring proposal follows from this section (explicitly deferred to H.2).

---

## 9. Evidence architecture

OBSERVED shape (re-verified; matches evidence-policy P-4's producer table):

```
fixtures (builders ×7, generate-video)          → public/  (inputs)
source + pages
    ├─ Vitest assertion suites ────────────────→ evidence/blind-comparison, evidence/e14, evidence/e16
    │                                            (write JSON as a run side effect — P-4/P-7 sanctioned)
    ├─ Playwright specs (default config) ───────→ evidence/observations/*, evidence/screenshots/*
    ├─ Playwright e15/e17 specs ────────────────→ evidence/e15, evidence/e17 (+ per-engine screenshots)
    ├─ Playwright viewer/n2 specs ──────────────→ evidence/viewer/*, viewer-matrix.json, screenshots/n2
    └─ src/n6/suite.ts ← scripts/run-n6-suite.mts → evidence/n6/*   (dedicated generator; edit-flow terminus)
scripts/e17-aggregate.mjs (post-processor) ────→ evidence/e17/{cross-engine-matrix,summary}.json
```

Determination: **"evidence pipeline" is a legitimate architectural concept** — it is the C4
record layer's production side, the terminus of the edit-flow direction (profile → matrix →
suite → generator → evidence), and it is governed artifact-by-artifact by P-4 traceability.
Its current implementation embeds production inside test execution for most families; the
evidence policy explicitly acknowledges and sanctions this (P-1 "regenerated whenever that
suite runs", P-7 working-tree hazard) rather than treating it as an accident. So the honest
model is **both**: evidence generation is simultaneously a property of the test suites (their
runs are measurement events) and a pipeline concept (families, producers, filename grammars,
provenance metadata). Whether the implementation should separate assertions from artifact
writing is an H.2 question, not a defect finding.

---

## 10. Experimental and historical boundaries

| Item | Classification | Basis |
|---|---|---|
| exp1–7 flows, text/security pseudo-experiments | historical but live | Run current resolvers/stages; cited as S-grade evidence in compatibility-matrix; spec N-21 calls the *concepts* historical-with-no-equivalent while the fixtures/specs remain active regression coverage |
| case1–13 blind adversarial fixtures | historical but live | Active in blind-comparison suite and blind.spec; padding split frozen (N-07) |
| E14 | mixed: de-facto interchange (concept-permanent function) under a historical name | §7 |
| E15/E16/E17 | concept-permanent methods, historical numbering | Pixel-mask classifier, candidate interpretations, cross-engine replication are glossary concepts; directories are numbered by generation |
| N6 | concept-permanent validator, historical numbering | Spec §5.5 names the concept "Validator"; `n6` is the stage coordinate |
| exp7 keyframes + `7-animate` | experimental but live; explicitly out-of-model | NON-STANDARD markers in types/manifests; compatibility-matrix grades movement/keyframes G/G; N-21 excludes them from target vocabulary |
| Renderer A/B letters | unresolved (spec U2 open; default no action) | Machine-load-bearing enumerants; prose fate deferred by the specification itself |
| Legacy ResolvedOverlay model | unresolved (live, multi-role — see §7) | H.2 question |
| Unused public surfaces (`blind/index.ts`, `collectPaintingAnnotations`, `timing.activeAt`, `BodyKind "video"`) | likely residue, unresolved | Zero consumers found in G.1 (re-confirmed); deletion decisions belong to H.2 |
| NativeStage `overlaySvg` throwing / `LabApi` shape duality under native | unresolved interface roughness | OBSERVED in G.1; normalization is an H.2 question |
| `timing.temporalWindow` unreachable `end<start` coercion branch | likely residue (defensive dead branch) | OBSERVED unreachable through resolvers; documentation/removal is an H.2 question |

---

## 11. Reconciliation decisions

Conceptual decisions H.1 can confidently make (all evidence-backed; none requires code
changes):

1. The three renderer directories implement **three independent consumer implementations**;
   preserving their mutual independence — including the one deliberate cross-import
   (`isActive`) being purely a normative predicate — is required by the research method
   (methodological blinding).
2. **Renderer B is not a consumer stack.** It is a direct-reference oracle data path
   (`experiments.ts` + `rendererB.ts`) that happens to live inside `src/reference/`; agreement
   counts derived from it must never be presented as multi-consumer evidence.
3. The Phase F specification's C5 roles (**Standards-driven / Direct-reference oracle /
   Method-blinded / Browser-pipeline**) are sufficient as the conceptual taxonomy; directory
   names are historical surfaces. No name implies normative authority: Renderer A's
   no-viewBox reading is empirically falsified as deployed-consumer semantics, blind's packet
   fidelity is not conformance, native's truth is channel-scoped.
4. **E14 is functioning as the renderer-neutral interchange record** (type level), while its
   name remains a historical experiment coordinate; `e14/comparison.ts` is comparison
   infrastructure, not part of the record.
5. The **legacy ResolvedOverlay model is live and multi-role** — reference consumer output,
   comparison substrate, regression coverage, and bridge target — not obsolete residue.
6. **N6 is a validator** (resource-side conformance checker + declarative predictor), not a
   renderer and not a preflight layer; it is independent of rendering but **not** independent
   of renderer namespaces.
7. N6's imports from `src/blind/` constitute **implementation-level coupling to de-facto
   shared semantic primitives** whose interpretation content is profile-defined (R-S2/SVG
   §7.7–7.8), not blind-specific; the primitives currently have no namespace of their own.
8. **Media-Fragment parsing is one semantic concept with multiple profiles**: three
   consumer-lenient variants whose bounds-handling divergence is a deliberately preserved,
   documented genuine ambiguity, plus one producer-strict reporting grammar (n6) that is a
   different obligation, not a competing consumer.
9. **SVG-root parsing and the half-open temporal predicate are renderer-neutral primitives in
   fact** (zero interpretive content; already consumed cross-namespace); their remaining
   triplication is incidental, not independence-bearing.
10. **Placement and nested-Canvas mapping carry named alternative readings**; the
    no-viewBox fork and fill-vs-contain are the research's kept disagreements. Only
    explicitly labeled per-reading primitives could ever be shared; unlabeled sharing would
    erase observables.
11. **Z-order must stay un-shared and undefined**: the profile fences it (X6, T08/T10);
    consumer-local encounter-order assignment is the convention each implementation records
    with its own provenance label.
12. **Security posture is per-consumer policy space** (classify+reject / strip-at-render /
    classify+render-inert): detection may be conceptually common; decisions never.
13. **Comparison is one activity family at three representation levels** (resolved-set parity
    → landmark semantics → provenance-classified record diff); vocabularies stay distinct.
14. **The evidence pipeline is a legitimate architectural concept**, currently realized as
    policy-sanctioned test side effects plus dedicated generators; fixture corpora are record-
    layer inputs governed by `fixture-provenance.json`.
15. **exp7 keyframes/`7-animate` are experimental-but-live machinery outside the conceptual
    model** (N-21), attached to the legacy path only.

---

## 12. Deferred questions for H.2

Source-level reconciliation questions (questions only; H.1 takes no position):

1. Should the de-facto shared primitives (`computePlacement` viewBox math, `svg-root`
   parsers, `isActive`) gain a real namespace — and if so, which modules move, and how are
   per-reading placement variants labeled so policy forks stay visible?
2. Which of the four Media-Fragment parsers, three SVG-root parsers, and three temporal
   implementations keep duplicated bodies (deliberate independence) versus consolidate
   (incidental duplication)? Specifically: is a shared grammar core compatible with keeping
   consumer policies and the n6 producer grammar separate?
3. Should `blind/comparison.ts` remain under `src/blind/` given it self-describes as
   harness infrastructure that imports reference code?
4. What happens to `Renderer B`'s home: should the oracle path (`experiments.ts`,
   `rendererB.ts`) remain inside `src/reference/` now that the concept model separates oracle
   from implementation?
5. Which unused exports should be deleted (`blind/index.ts`,
   `collectPaintingAnnotations`, `activeAt`, `BodyKind "video"`), and which retained?
6. Should the `main.ts` E14↔legacy bridge functions be normalized, documented as a permanent
   compatibility tier, or eventually retired with the legacy stage paths?
7. Should the `LabApi` contract be normalized across stages (overlayRect/domProbe throwing
   under native; snapshot shape duality), or is per-stage API divergence acceptable and to be
   documented?
8. Should evidence writing be separated from assertion suites (dedicated generators per
   family), or does the P-4/P-7-sanctioned embedded model stand? Either answer changes no
   concepts — only mechanics.
9. Should the unreachable defensive branch in `reference/lib/timing.temporalWindow` be
   removed or documented as dead defensiveness?
10. Do directory/module renames proceed at all (spec U2 default: no action), and if the human
    review approves descriptive consumer names, do URL params/verdict strings stay frozen as
    machine surfaces?
11. Is the dual-model arrangement (legacy display models + E14 interchange record) a permanent
    two-tier design or a transition state to collapse?
12. Should the governance gap around out-of-renderer helper reuse (packet sanctions inbound
    purity only) be recorded in the owning documents before any physical move of shared
    utilities?

---

*End of Phase H.1. No refactoring, renaming, cleanup, or migration is proposed or performed
here; H.2 owns those questions.*
