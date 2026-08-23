# Terminology Specification — Proposed Target Vocabulary

> **PHASE F DESIGN ARTIFACT — PROPOSAL AWAITING HUMAN REVIEW.**
> This document DESIGNS the target terminology/taxonomy. It does not rename,
> rewrite, or migrate anything. `research/terminology.md` (the Phase E identifier
> registry) remains in force as an audit/navigation artifact until the migration
> phase is approved. Nothing here modifies historical records, evidence, code, or
> validator behavior. Where this document conflicts with an owning document, the
> owning document still wins (Phase C rule) — until the migration this specifies
> is separately approved and executed.

---

## 1. Purpose

This repository studies a concrete question: **under which conditions does the 2D
geometry of graphical content painted onto IIIF Presentation Canvases become
predictable, interoperable, and mechanically checkable?** Over time it produced a
conformance stack (evidence → safe subset → profile → conformance matrix →
validator) plus a large residue of historical naming systems from successive
experiment generations.

The earlier registry (`research/terminology.md`) answers "I met identifier X —
what is it?". That is an archaeological service. It is NOT a vocabulary a new
contributor can adopt, because its organizing principle is the history of
identifiers rather than the structure of the ideas.

This specification is the replacement target. It provides:

1. a **concept model** — the ideas the project actually uses;
2. a **taxonomy** — how those ideas relate;
3. a **canonical glossary** — one preferred term per concept, readable without
   knowing any experiment number;
4. an **identifier policy** — which things deserve stable IDs and why;
5. an **output vocabulary** section — machine codes kept distinct from human
   terminology;
6. a **historical mapping** — old names → concepts → current terms, for reading
   archives only;
7. **migration and maintenance rules** sufficient to run a later cleanup without
   inventing new semantic decisions during it.

Deliberate non-goal: becoming another decode layer. If a sentence is clear
without this document, this document has failed.

---

## 2. Design principles

Binding for this specification and any document derived from it:

1. **Concepts before identifiers.** An identifier is a label attached to a
   well-understood concept — never a substitute for one.
2. **Meaning before abbreviations.** Explicit nouns win over opaque acronyms.
3. **One concept → one canonical term.** Synonyms require an explicit mapping;
   unmanaged synonyms are defects.
4. **One term → one concept.** Terms with multiple senses carry mandatory
   qualifiers (§5.1) or are split into distinct terms.
5. **No bare letters.** A letter is not a name. Letters survive only inside
   qualified role names whose letter part is machine-load-bearing (§5.5).
6. **Standards vocabulary is reused, not reinvented.** When IIIF, W3C Web
   Annotation, Media Fragments, SVG, or CSS define a term adequately, we use
   theirs and cite once; the profile's Part 2 table remains the substantive
   definition site.
7. **Identifiers exist only where stable cross-references are real.** Passing a
   four-part test earns an identifier (§7). Everything else is described in
   prose and anchored by document + heading.
8. **Machine identifiers may differ from human terms.** Code unions, URL params,
   diagnostic codes, and filename grammars are interfaces, not vocabulary.
9. **History is data, not design input.** A name is not preserved because it
   existed; it is mapped if someone might encounter it again.
10. **Small strong taxonomies beat large weak ones.** Six categories (§4);
    subcategories only where the repository genuinely distinguishes objects.
11. **No governance bureaucracy.** One owner per term (a document), one short
    maintenance rule set (§12). No review boards, no versioned namespaces.
12. **Definitions live at exactly one site.** This specification assigns
    canonical status and qualification rules; it does not duplicate normative
    definitions that other documents own (anti-drift).

---

## 3. Concept model

### 3.1 Method

Concepts were extracted from what the repository *does*, not from what it *once
called things*: the profile's requirement blocks, the validator's data model
(`src/n6/types.ts`), the conformance matrix, the experiment reports' methods and
findings, the provenance-class rules, and the consolidation governance model.
The Phase E inventory was used only as an exhaustive checklist to ensure no
concept was missed; its category scheme (letter groups A–I) was deliberately
discarded.

### 3.2 Normalization results

Each historically entangled case classified per the Phase F rubric:

| # | Case | Classification | Resolution |
|---|------|----------------|------------|
| N-01 | `S1–S8` subset rules ↔ `R-S1…R-S8b` requirements | SAME CONCEPT / MULTIPLE NAMES | Requirement (one concept). `S#` is the historical formulation alias; `R-S#a/R-S#b` splits reflect mixed provenance decomposition, not different concepts |
| N-02 | `Stage <k>` ↔ `N<k>` | SAME CONCEPT / MULTIPLE NAMES | Experiment generation (research stage). Both surface forms historical; new prose says e.g. "the validator stage" or names the report |
| N-03 | `R-V#` ≡ `V#` ≡ `N2-ramp-…` probeId ≡ slug | SAME CONCEPT / MULTIPLE NAMES | Consumer probe (one object, four surface forms). Report IDs and shorthands retire to history; slugs were the only semantically meaningful form |
| N-04 | `M-M#` ≡ `M#` ≡ probeId ≡ slug | SAME CONCEPT / MULTIPLE NAMES | As N-03 |
| N-05 | IIIF "content resource" ≡ WA "body" ≡ lab "painting body" | SAME CONCEPT / MULTIPLE NAMES ACROSS STANDARDS | Painting body is canonical (profile Part 2 already decided this) |
| N-06 | exp-era `parity` / blind-E16 `comparison` / E17 `verdicts (`a==blind`)` | SAME CONCEPT-TYPE / ERA-SPECIFIC INSTANCES | Renderer-agreement check is the concept; era terms describe specific mechanisms and remain valid descriptions of their own evidence |
| N-07 | blind `case6` vs e14/e16 `case06` | SAME CONCEPT / MULTIPLE NAMES (convention drift) | Case fixture. Padding difference is a frozen property of historical filenames; no unification ever |
| N-08 | `Finding <n>` (E14) vs `F<n>` (E17) | SAME CONCEPT-TYPE / DIFFERENT INSTANCE FAMILIES | Finding is the concept; both numberings are historical instances |
| N-09 | Bare letters: Renderer A/B · Mode A/B · Model A/B/C · fixture suffix `-a/-b/-c` · verdict grades A–E · taxonomy meta-labels A–D · E15 variant letters A–D | DISTINCT CONCEPTS / HISTORICALLY COLLIDED | Each axis keeps its axis-word-qualified name (§5). Fixture suffixes are filename encoding, not terminology. Verdict grades and meta-labels are historical/process vocabularies |
| N-10 | P-cluster: rules `P1–P6` vs policy points `P-1…P-7` vs preservation rules `P-TERM-n` vs op `P-0` | DISTINCT CONCEPTS / HISTORICALLY COLLIDED | Candidate rule → became Requirement or Open fence. Policy points, preservation rules, ops are process artifacts (mapping only) |
| N-11 | Q-cluster: open-question integers vs N3 brief `Q1–Q10` vs plan `Q1.1–Q1.6` | DISTINCT CONCEPTS / HISTORICALLY COLLIDED | One concept survives: open question (register entry). Brief/stage questions are historical process artifacts |
| N-12 | S-cluster: subset rules `S1–S8` vs stopping conditions `S1.0–S1.3` vs capability grade `S` | DISTINCT CONCEPTS / COLLIDED | Rules → Requirement (N-01). Stopping conditions: process artifact. Capability grade: compatibility-status value (distinct system) |
| N-13 | T-cluster: tests `T01–T15` vs writing rules `T-1…T-6` | DISTINCT CONCEPTS / COLLIDED | Test case (active identifier) vs writing-convention item (process artifact) |
| N-14 | R-cluster: E15 rules `R1–R5` vs `R-S*` vs `R-V*` vs `RF01–04` vs op `R-1` | DISTINCT CONCEPTS / PREFIX-COLLIDED | Respectively: historical classified finding, Requirement, consumer probe, rendering check (design-only), process op |
| N-15 | `[OPEN]` vs `[UNKNOWN]` vs BLOCKED vs OPEN_FENCE | DISTINCT CONCEPTS / SUPERFICIALLY SIMILAR | Four genuinely different epistemic states, all canonical (§5.4, §5.6): semantics undetermined · measurement inconclusive · capability missing · boundary recorded without predicate |
| N-16 | `conformance` vs `compatibility` vs `honoring` | DISTINCT CONCEPTS / RECURRINGLY CONFLATED | All three canonical, rigorously separated (§6) |
| N-17 | "region": MF selection rect vs Canvas-space target rect | DISTINCT CONCEPTS / STANDARDS-LEVEL COLLISION | Canonical pair: **target region** and **MF selection region**, always qualified (profile Part 2 flags this) |
| N-18 | "viewport": page viewport vs SVG viewport vs region-as-viewport | DISTINCT CONCEPTS / COLLIDED | Three qualified canonical terms |
| N-19 | "canonical": prefix form vs output ordering | DISTINCT CONCEPTS / WORD COLLISION | **Canonical prefix** and **canonical ordering** |
| N-20 | `E18` ghost | HISTORICAL CONCEPT WITH NO CURRENT EQUIVALENT | Proposed survey realized under a different name; recorded, never minted again |
| N-21 | exp-era keyframe timeline (`exp7`), text/security pseudo-experiments, parity harness | HISTORICAL CONCEPTS WITH NO CURRENT EQUIVALENT | Described in their reports; absent from target vocabulary except as history |
| N-22 | Project self-descriptor ("video annotation …") | CURRENT CONCEPT WITH NO CLEAN NAME | Framing sentence adopted (documentation-conventions §T-5); a short project descriptor is an open naming decision (§10 U1) |
| N-23 | Validator diagnostic codes (`MISSING_VIEWBOX`, …) | OUTPUT VOCABULARY (resolves Phase E open question) | Neither identifier namespace nor taxonomy label: machine codes emitted by software. Listed in §8, owned by `src/n6/types.ts`; humans quote them verbatim, never paraphrase or extend them |
| N-24 | Probe slug/probeId/filename grammars, landmark contracts, evidence filename grammars | EVIDENCE ARTIFACT | Naming conventions for generated files; documented, frozen for existing evidence |
| N-25 | Phases A–F, decisions D1–D10, ops, L0–L6 | PROCESS ARTIFACT | Consolidation machinery; L0–L6 promoted to canonical governance terms (they are good); phase letters remain process-local |
| N-26 | Harness route keys, lab globals, CSS hooks, URL params, playwright projects | IMPLEMENTATION DETAIL | Out of vocabulary scope entirely |
| N-27 | Orphan bracket labels (`[VIEWER]`, `[PROPOSAL]`, …) | UNKNOWN / NEEDS DECISION → resolved as HISTORICAL AD-HOC | Not promoted; never reused as if governed (matches registry §5 disposition) |
| N-28 | Two confidence-label sets (phase-doc words vs n3 JSON `"confidence"`) | IMPLEMENTATION/EVIDENCE DETAIL COEXISTING | Left unreconciled; flagged §10 U6 |

### 3.3 What the model contains (summary)

Seven concept strata, fully developed in §4–§5:

1. the **subject-matter world**: canvases, bodies, fragments, geometry, and how
   software realizes them;
2. the **normative layer**: the profile and its machinery of requirements,
   exclusions, provenance classes, fences;
3. the **verification layer**: conformance testing, validation, measurement,
   probing;
4. the **record layer**: fixtures, evidence, experiments, findings, registers;
5. the **implementation layer**: independent renderer roles and methodological
   blinding;
6. the **output layer**: machine statuses and diagnostic codes;
7. the **governance layer**: document roles, epistemic layers, mutability
   regimes.

---

## 4. Taxonomy

Six categories ordered from the world the project studies toward the process
that studies it. Derived from the repository's actual structure; the examples
in the phase brief were treated as hints only.

### C1 — Domain concepts (the subject matter)

Why the category exists: the project makes claims about a specific technical
world; these are its nouns.

Belongs: everything IIIF Presentation, Web Annotation, Media Fragments, SVG,
CSS Images, and browser pipelines present to us, plus the profile's own
geometric constructions (target region, same-aspect constraint, uniform-scale
mapping).

Does NOT belong: anything that exists only because we measured or built
something (those are C3/C4), and anything normative (C2) — "requirement" is not
a domain concept even though it constrains the domain.

Subgroups (natural joints found in the material):

- **C1.a Composition**: Canvas, logical Canvas space, painting body, SVG
  resource, nested Canvas / Canvas-as-body, replacement Canvas, composition
  models, z-order (deliberately unsolved).
- **C1.b Targeting & geometry**: temporal fragment, spatial fragment, target
  region, MF selection region, aspect ratio, fit policy (undefined by design),
  same-aspect constraint, uniform scale, landmark mapping, half-open interval.
- **C1.c Realization**: embedding mechanism, SVG viewport, region-as-viewport,
  leaf-PAR collapse, intrinsic size, consumer/viewer/player, browser engine,
  rasterization (out of scope marker).

### C2 — Normative concepts (the contract)

Why: the profile converts measurements into a publishable contract; these are
its moving parts.

Belongs: interoperability profile, requirement, exclusion,
provenance class, open fence, non-guarantee statement, resource conformance,
consumer conformance, interoperability claim, conformance predicate.

Does NOT belong: tests (C3) — a requirement is what is true of resources; a
test is how we check it. The edit-flow direction (profile → matrix → suite →
generator → evidence) enforces this separation structurally.

### C3 — Verification concepts (checking truth)

Why: the project distinguishes sharply between claiming and checking; this
category holds every checking instrument.

Belongs: conformance test case, pre-registration, validator, diagnostic,
black-box predicate, pixel-mask classifier, candidate interpretation, landmark,
tolerance class, cross-engine replication, consumer probe, rendering check
(designed-but-blocked kind), output-vocabulary audit.

Does NOT belong: the evidence those instruments produce (C4).

### C4 — Record concepts (evidence & research memory)

Why: the repository's epistemic discipline depends on separating immutable
observations from living summaries.

Belongs: fixture, case fixture, evidence artifact, evidence family, landmark
contract, experiment, experiment generation, hypothesis, finding, comparison
outcome, compatibility status row, open question, bug-fix ledger entry,
ambiguity record.

Does NOT belong: process/governance bookkeeping (C6).

### C5 — Implementation-role concepts (who computes what)

Why: methodology depends on independence among implementations.

Belongs: Renderer A (standards-driven resolver), Renderer B
(direct-reference oracle), Blind renderer, Native renderer, methodological
blinding, interpretation packet.

Does NOT belong: code symbols, module paths, route keys (implementation detail,
excluded per §2 principle 8's complement).

### C6 — Governance concepts (how the repository manages itself)

Why: consolidation established document roles and change control; these need
names too, but a smaller, quieter one.

Belongs: owning document, immutable record, append-only register, controlled
document, pointer/index, epistemic layer (L0–L6), edit-flow direction,
falsification protocol, evidence policy, preservation rule, writing convention.

Does NOT belong: domain, normative, verification content itself.

---

## 5. Canonical glossary

Reading guide: **Bold** term = canonical. *Historical:* lists names that map to
this concept — for archive reading only, never for new prose. "ID" states
whether the concept carries a stable identifier and its convention. Category
refs point into §4.

Definition sites are cited so this glossary stays an index of record, not a
competing authority (principle 12).

### 5.1 Domain — composition (C1.a)

**Canvas** — IIIF Presentation resource providing the spatial/temporal frame of
reference for painted content. Category C1.a. Definition owner:
`profile-draft.md` Part 2 (citing IIIF 3.0). Related: logical Canvas space,
painting body. Historical: none needed. ID: no (instances are addressed by
their own manifest `id`s).

**Logical Canvas space** — unit-less 2D coordinate system established by a
Canvas's positive integer width/height; values have no unit and are not pixels.
Category C1.a. Owner: profile Part 2 (IIIF 3.0 §3.2/§5.3). Related: target
region, uniform scale. Forbidden alternative: "pixel space". ID: no.

**Painting body** — a source resource carried by an Annotation with motivation
`painting` (image, video, SVG resource, or another Canvas). Category C1.a.
Owner: profile Part 2. Historical: IIIF "content resource", WA "body"
(role-name differences across standards, mapped once in profile Part 2).
Forbidden alternative: using "body"/"content resource" interchangeably in the
same document. ID: no.

**SVG resource** — an SVG document presented as a painting body (as opposed to
selection-side SVG shapes, which are out of scope). Owner: profile Part 2.
Related: explicit viewBox. ID: no.

**Explicit viewBox** — a `viewBox` attribute on the root `<svg>` element of a
painting-body SVG resource; the coordinate-space declaration the profile
requires. Category C1.a. Owner: profile Part 2. Historical: "P1 rule"
(candidate-rule era). ID: no — formalized by R-S1 (the requirement mandating
this attribute carries the identifier; the concept does not).

**Nested Canvas (Canvas-as-body)** — a Canvas painted as a content resource
onto another Canvas or region. Permitted by IIIF 3.0 §5.7; geometry governed
only under the same-aspect constraint. Related: replacement Canvas,
composition models. ID: no.

**Replacement Canvas** — a Canvas whose dimensions supersede an earlier
Canvas's while annotations must stay aligned; conforming replacement requires
equal aspect ratio. Owner: profile Part 2. ID: no (formalized by R-S4).

**Composition model** — the structural pattern by which overlay content is
expressed in a manifest. Three canonical instances, always written with both
word and letter (machine encoding `E14Model` persists in code):
- **direct painting (Model A)** — bodies painted directly on the target Canvas;
- **nested Canvas (Model B)** — an inner Canvas painted as body;
- **Web Annotation overlay (Model C)** — WA collection with FragmentSelectors.
Historical: "direct painting", "nested Overlay Canvas", "WA overlay" used
unqualified. Category C1.a. ID: no for the concept; letter values are code
enumerants, not prose terms.

**Z-order / stacking order** — which painting occludes which. Deliberately
UNDEFINED by the profile (no portable guarantee exists; recipes contradict).
Any statement about stacking in new prose must say "no guarantee" unless citing
new evidence processed through the falsification protocol. ID: no.

### 5.2 Domain — targeting & geometry (C1.b)

**Temporal fragment** — Media Fragments `t=` dimension denoting a half-open
interval `[begin, end)` on a target or body. Syntax/semantics normative (MF
§4.2.1). Whether any consumer applies it at render time is NOT guaranteed
(see honoring, §5.4). ID: no.

**Spatial fragment** — Media Fragments `xywh=` dimension with `percent:` /
`pixel:` axes; the historical IIIF alias prefix is accepted and normalized
(see canonical prefix). ID: no.

**Target region** — the rectangular sub-rectangle `(Tx,Ty,Tw,Th)` of logical
Canvas space addressed by a spatial fragment ON THE TARGET; where painted
content is placed. Category C1.b. Mandatory qualifier form: "target region
(Canvas space)". Historical: "region", "target rect", "destination". Forbidden
alternative: bare "region" when the MF sense is anywhere nearby. ID: no.

**MF selection region** — the resource-intrinsic rectangle selected by `xywh=`
on the media itself (crop/select sense of Media Fragments). Coexists with
target region; never substituted silently. ID: no.

**Aspect ratio** — W:H of positive dimensions; compared by exact integer
cross-multiplication, else within the documented ε tolerance. ID: no.

**Same-aspect constraint** — the profile rule that a painted/replaced Canvas
must match its target's aspect ratio, making every reasonable placement rule
coincide; aspect mismatches are non-conforming with NO fallback behavior.
Owner: profile Part 7 mathematics. Historical: "P5a". ID: no — formalized by
R-S4 (the requirement enforcing this constraint carries the identifier; the
concept does not).

**Uniform-scale mapping** — under the same-aspect constraint, every landmark
`(u,v)` maps as `(Tx+k·u, Ty+k·v)` with unique `k`; the analytic prediction
validators emit. Owner: profile Part 7. Historical: "landmark mapping",
"P5a math". ID: no — formalized by R-S5 (the requirement predicting this
mapping carries the identifier; the concept does not).

**Fit policy** — any rule choosing placement/scaling when aspects differ
(fill, contain/meet, cover/slice, stretch…). Deliberately undefined by this
project and by the standards; excluded territory (X3). New prose never names a
fit policy as if one were standardized. ID: no.

**Half-open interval** — `[begin, end)`: begin included, end excluded; the
temporal semantics adopted throughout. Historical: occasionally implicit in
early fixtures (bug-fix ledger #5 records a window widened for exactly this).
ID: no.

### 5.3 Domain — realization (C1.c)

**Embedding mechanism** — the concrete channel by which a consumer places a
body into a region (nested `<svg>`, `<img>` variants, `<object>`,
CSS background). Measured systematically in the embedding-semantics experiments.
Category C1.c. Values are ordinary kebab-case technical labels; no new values
without a measurement behind them. ID: no (labels, not instances).

**SVG viewport** — the rectangle onto which an SVG coordinate system maps
(SVG 1.1 §7.2). Qualified form mandatory. Historical: bare "viewport". ID: no.

**Region-as-viewport** — THIS PROFILE'S assignment that the targeted region
acts as the SVG viewport for a painting body, with preserveAspectRatio applied
between viewBox and region. Neither SVG nor CSS nor IIIF assigns this; it is
the profile's own decision, and the single most load-bearing consumer
obligation. Owner: profile Parts 2/6. Historical: "P2", "S2". ID: no —
formalized by R-S2 (the requirement assigning this role carries the
identifier; the concept does not).

**Page viewport** — the CSS host element/window area in the measurement
harness. Confined to harness description. ID: no.

**Leaf-PAR collapse** — the measured single-stage behavior of raw
`<img>`-style channels: an inner leaf's own preserveAspectRatio overrides
container fit for aspect-mismatched targets, so nested composition collapses
to one stage. Engine-uniform measured fact; motivates the same-aspect
constraint. Category C1.c. ID: no (described, cited by evidence).

**Intrinsic size** — browser-reported natural dimensions of a resource
(`naturalWidth/Height`); bitmap-like, NOT a coordinate-space contract.
Forbidden alternative: treating intrinsic size as geometry authority (X2). ID: no.

**Consumer** (also viewer, player where the product class matters) — software
that parses a manifest and renders Canvas content. Evidence exists only for
version-pinned instances; claims are always version-scoped. ID: no.

**Browser engine** — Chromium/Firefox/WebKit as measurement substrate. Facts
are version-scoped and engine-count-scoped ("measured tri-engine"). ID: no.

### 5.4 Normative machinery (C2)

**Interoperability profile** (usually "the profile") — the constrained
interoperability contract defining the deterministic-geometry subset: a small
set of publisher-side requirements and consumer-side obligations under which
painted-content geometry becomes predictable and mechanically checkable. Owner:
`profile-draft.md` Part 1 (IS/IS NOT). It claims NO standard-track authority;
it is a lab conventions-plus-evidence construct. Historical: "N5 draft",
"Stage 5 output", "safe-subset formalization". ID: no (the document is the
instance).

**Requirement** — a normative statement of what profile-conforming
resources/consumers MUST, SHOULD, or MAY satisfy, carrying exactly one
provenance class, a rationale, cited evidence, a mechanical or observable
predicate, a failure example, and explicit non-goals. Category C2. Canonical
instances: R-S1, R-S2, R-S3, R-S4, R-S5, R-S6a, R-S6b, R-S7, R-S8a, R-S8b.
Owner: `profile-draft.md` Part 4; encoded in `src/n6/types.ts`
(`RequirementId`). Historical: `S1–S8` (subset-rule formulation — same
concepts), candidate rules `P1/P2/P5a/P6` (pre-formalization). ID: YES —
`R-S<n><part>`; immutable; see §7.

**Exclusion** — a construction for which the profile promises NO geometry;
boundaries of the contract, never claims that web standards forbid the
pattern. Canonical instances X1–X8. Owner: profile Part 10. Historical: "P6
boundary", "S7". ID: YES — `X<n>`; immutable.

**Provenance class** — the epistemic-authority label every requirement/claim
carries, exactly one per item: `[NORMATIVE]` (spec-cited), `[BROWSER]`
(version-scoped multi-engine measurement, never normative), `[COMMUNITY]`
(ecosystem convergence, never spec authority), `[DERIVED]` (consequence of
lab logic/evidence), `[PROFILE]` (deliberate constraint adopted by this
profile), `[OPEN]` (undetermined; must not become a requirement or acquire
implicit status). Promotion rules are binding and quoted at the owner
(profile Part 3): three-engine agreement does NOT upgrade; cookbook advice
does NOT become a spec claim. Distinct systems that share some label strings
but classify different objects — interpretation-rule classes (the blind
renderer's rule licensing) and divergence classes (why implementations differ)
— are NOT this concept; their labels stay verbatim and scoped to their
definition sites. ID: no (values, not instances).

**Open fence** (verb: fenced) — a recorded boundary marking undetermined
semantics WITHOUT a predicate: the honest "we promise nothing here" marker
(e.g., temporal honoring). Appears in outputs as `OPEN_FENCE`/fence records
and in matrices as "open fence" status. Related: exclusion (decided boundary),
BLOCKED (capability boundary). ID: no.

**Non-guarantee statement** — explicit prose that something is NOT promised
(temporal application, z-order, fit behavior, consumer support). Negative
guarantees are part of the contract, not footnotes. ID: no.

**Resource conformance** — STRONG, fully defined: a manifest/resource satisfies
every in-force requirement and violates no exclusion; statically checkable
today. Asserts the geometry CONTRACT is well-defined — asserts nothing about
any rendering. Owner: profile Part 11.1. ID: no.

**Consumer conformance** — DECLARATIVE ONLY today: realizing region-as-viewport
and fragment parsing obligations. Cannot currently be verified because no
tested deployed consumer renders secondary painting bodies at all. No
certification may be claimed. Owner: profile Part 11.2, validator report §6.
ID: no.

**Interoperability claim** — CONDITIONAL/THEORETICAL: equivalent geometry
across implementations iff resource-conforming ∧ both consumer-conforming ∧
compared in logical Canvas coordinates within tolerance. Owner: profile
Part 11.3. ID: no.

**Conformance predicate** — the mechanical/observable check defining when a
requirement evaluates true. Stated per requirement; never strengthened
silently. ID: no (owned by its requirement).

### 5.5 Verification (C3)

**Validator** — the deterministic, browser-free program that checks resources
against the profile and emits diagnostics, mappings, predictions, fences.
Implementation: `src/n6/`. Historical: "N6 validator", "resource conformance
validator". ID: no (module path identifies it).

**Conformance test case** — a pre-registered black-box check with fixed
fixture, input, expected result, failure condition; expectations fixed BEFORE
implementation. Canonical instances T01–T15. Owner: `conformance-matrix.md`
Part B (normative design); executable transcription `src/n6/suite.ts`.
Historical: none. ID: YES — `T<nn>` zero-padded; immutable.

**Pre-registration** — the discipline of fixing expected outcomes before
running; the project's core honesty mechanism, inherited from the
cross-engine experiment. Applies to test cases and to hypothesis-driven
experiments alike. ID: no.

**Rendering check** — informational consumer-level check designed but blocked
(no capable consumer exists); never gates resource conformance. Instances
RF01–RF04. Historical: "future rendering-level checks". ID: YES for the four
existing designs (`RF<nn>`); dormant namespace — do not extend without
revisiting §7 policy.

**Landmark** — a known point of a fixture (circle centre, corner tick) used to
measure rendered geometry against predictions. Related: landmark contract (the
per-fixture geometry table consumed by builders/tests). ID: no.

**Pixel-mask classification** — screenshot-measurement method comparing
rasterized masks against analytically rendered candidate readings with fixed
thresholds (coverage ≥ 0.8, K = 0.25, dilation allowance). Owner: the
embedding-semantics experiment reports; thresholds lifted verbatim across
reuse. ID: no.

**Candidate interpretation** — one of the five named analytic readings scored
by the classifier (region-as-viewport reading, intrinsic-stretch reading,
object-fit-contain reading, natural-centered reading, natural-topleft
reading). Their machine labels (`I-*`) are frozen classifier vocabulary tied
to archived evidence; in prose prefer the descriptive phrases above, quoting
machine labels only when citing evidence cells. ID: machine labels frozen; no
new labels without new evidence.

**Cross-engine replication** — re-running browser-behavior probes across all
three engines to convert single-engine observations into engine-uniform facts
(never into normative claims). ID: no.

**Consumer probe** — a controlled observation of a deployed, version-pinned
consumer against a prepared manifest, capturing parse/render outcome and DOM
state; outcomes are data, never pass conditions. Historical: `R-V1–R-V7`,
`V1–V7`, `M-M1–M-M3`, `M1–M3`, probeIds `N2-*`, slugs. ID: NO going forward
(see §7); future probes take semantic slugs `<consumer>-<topic>` matching the
existing slug style.

**Output-vocabulary audit** — the standing check that validator output contains
no guarantees for unsupported/open items and no fit/z-order vocabulary
(tests T08/T10 enforce; §8 lists the audited vocabulary). ID: no.

### 5.6 Records (C4)

**Fixture** — a deterministic constructed input (manifest, SVG, video) built to
make exactly one behavior observable. Category C4. Families exist in the
fixture-provenance manifest with generator status. Historical families: initial
cycle manifests, adversarial blind-generation cases, later-generation
composition cases, embedding-semantics variants, consumer-probe manifests.
ID: families YES (kebab-case family ids in the provenance manifest);
individual files identified by filename grammars, frozen.

**Case fixture** — an individual numbered fixture instance. Historical padding
split (blind `case6` unpadded vs `case06` padded) is a frozen property of
filenames; searches must account for both. ID: filename only.

**Evidence artifact** — machine-written archived output (JSON, screenshots)
corresponding to reports; reproducible-but-not-stable; never hand-edited;
regeneration only under the evidence policy. ID: filename grammar (frozen,
including legacy typos).

**Evidence family** — the per-generation grouping of evidence artifacts sharing
one production pipeline and filename grammar. ID: YES (family ids in
`fixture-provenance.json` schema).

**Landmark contract** — per-generation JSON table of fixture landmark
geometry; reused by reference (never copied) across generations. ID: filename.

**Experiment** — a falsifiable question pursued with fixtures, method, and
archived evidence. Category C4. Historical instances are recorded in the
experiment log with their numbers; NEW experiments are registered by title +
date + log row, not by minting continuation numbers (§7). ID: historical
numbers only; no new numbers.

**Experiment generation** — a numbered research cycle bundling experiments
toward a milestone (embedding semantics, composition, cross-engine, consumer
survey, community positioning, safe subset, profile, validator). All existing
numbers are historical citation coordinates; the concepts they named survive as
the reports themselves. New prose refers to reports by name. ID: historical
only.

**Hypothesis** — an acceptance-tested prediction stated before an experimental
run. Historical instances H1–H5. ID: historical only.

**Finding** — a numbered empirical result recorded in an experiment report,
each citing its evidence. Historical instance families: E14 findings, E17
findings. ID: historical only; new findings are prose headings + log rows.

**Comparison outcome** — pairwise renderer-agreement result recorded in
evidence (`==`/`!=` strings). Era-specific mechanisms (resolved-set parity;
structured semantic diff; pairwise verdicts) remain valid descriptions of
their own artifacts. ID: no.

**Compatibility status** — rolling capability classification of the standard
stack (supported / gap / browser-dependent grades, `S/G/B/S*`). Distinct from
conformance (§6). Owner: `compatibility-matrix.md`. Values are grade symbols
tied to that document's legend. ID: no.

**Open question** — a register entry recording something the evidence could not
settle; append-only; never renumbered; states OPEN/ANSWERED/SUPERSEDED.
Owner: `open-questions.md`. Historical: unprefixed integers, "#n" references.
ID: register-entry number, document-scoped (see §7 — acceptable as an
append-only ledger exception).

**Bug-fix ledger entry** — numbered record of an implementation bug and its
fix, cited by reports as evidence lineage. Frozen at sixteen entries.
ID: historical only.

**Ambiguity record** — a formally reported, unresolved discrepancy awaiting a
human research decision; resolution forbidden by assumption anywhere. Living
instance: AMB-N6-1 (replacement-form arithmetic parentheticals; verdict
unaffected either way). Historical: none prior. ID: YES for living ambiguity
records — `AMB-<report>-<n>`, minted only by the owning report.

### 5.7 Implementation roles (C5)

**Renderer A** — the standards-driven resolver implementation: resolves
manifests per IIIF/WA/MF semantics (with a synthesized-viewBox reading where
standards underdetermine). Letter part is machine-load-bearing (URL
`renderer=a`, `RendererKind`, verdict strings); ALWAYS written with the axis
word. Historical: "reference implementation", "oracle" (misapplied),
"standards-oriented renderer". ID: code enumerant `a`.

**Renderer B** — the direct-reference oracle: reproduces intended geometry
from fixture metadata without standards resolution, deliberately non-standard,
serving as comparison ground truth. Historical: "the deliberately-simple
reference" (README phrasing retired). ID: code enumerant `b`.

**Blind renderer** — independent implementation driven ONLY by the
interpretation packet and cited specs; never imports other resolvers'
resolution logic; the methodological honesty device. Sanctioned exception:
pure geometric helpers may be reused where documented. Historical: "blind
comparison" (the activity), "blind reading". ID: code enumerant `blind`.

**Native renderer** — the real browser `<img>`-pipeline stage representing
true replaced-element semantics. Reserved sense: do not extend "native" to
generic browser behavior. ID: code enumerant `native`.

**Methodological blinding** — the practice of keeping at least one
implementation ignorant of the others' interpretive choices, so agreements
are evidence rather than coincidence. ID: no.

**Interpretation packet** — the frozen document licensing the blind renderer's
readings, with its own rule-class table (normative/derived/convention/open
rule classes). Owner: `docs/blind-interpretation-rules.md`. ID: no.

*Implementation detail below term level (no glossary entry): the harness —
the local app/config surface exposing renderers, fixtures, and measurement
hooks for experiments.*

### 5.8 Governance (C6)

**Owning document** — the single document where a truth lives; conflicts resolve
in its favor everywhere else. Core governance primitive. ID: no.

**Epistemic layer** — the stratification of documents by what kind of truth
they own: immutable experiment record (L0), capability status (L1),
external-source claims (L2), normative profile (L3), conformance design (L4),
implementation state (L5), navigation (L6, owns no claims). Retained verbatim
— clean, load-bearing, already minimal. ID: YES — `L<n>`, closed set of seven.

Procedural/convention pointers — named here for citation only; their
definitions live solely at their owning sites:

**Edit-flow direction** — expectation changes move strictly profile → matrix →
suite → generator → evidence; defined at consolidation map §2.

**Falsification protocol** — the sanctioned route from measurement to
normative change; anchors: consolidation map (reverse-flow entries), profile
Part 3 (promotion rules).

**Mutability regimes** (immutable record / append-only register / controlled
document / pointer index) — defined at consolidation map.

**Writing convention** — binding style rules for new documents; defined at
documentation-conventions.md Part I. Historical: `T-1…T-6` item numbers
(process-local).

---

### 5.9 Architecture tiers, reuse-governance classes, and module roles (Phase G additions)

Added by Phase G mapping-first documentation (`phase-g-terminology-taxonomy.md`),
recording vocabulary demonstrated necessary by the Phase G audit and already ratified
in phase records. Per principle 12, the BOUNDARIES these terms name are owned by their
ratifying records; this glossary indexes them for prose use. None of these terms may
be paraphrased into synonyms.

#### Gap A — display/interchange architecture tiers (ratified phase H.2-D)

**Interchange record** — the durable, renderer-filled shared record of the composition
domain: each consumer resolves a manifest into its OWN instance, carrying its readings
AS DATA (placement modes, provenance-classed rules, security summaries), so agreement
can be diffed mechanically without any consumer importing another's logic. Code home:
`src/e14/types.ts` (migration target `src/composition/types.ts`, §9.1). It is NOT
renderer semantics, NOT a display model, and NOT owned by any consumer. Owner:
`phase-h2d-interchange-display-tier-ratification.md` §3–§4. Type names such as
`E14Overlay`/`E14Manifest` are implementation spellings of this concept (migratable
per §9.1); the VALUES they carry (model letters, placement modes, BodyKind values) are
frozen machine surfaces.

**Legacy display-regression substrate** — the `ResolvedOverlay` record plus the legacy
`Stage` rendering path; multi-role and LIVE: exp-era flows, Renderer B oracle lowering,
L1 parity, L2 reference-side input, Renderer A native output. "Legacy" records era
origin, NOT scheduled removal. Distinct from the interchange record (its unique
`keyframes` field is exp7 experimental machinery attached here alone). Owner:
H.2-D §3.3.

**Consumer-private model** — a record owned by exactly ONE consumer and never merged
or replaced; instance: `BlindOverlay` (the methodological blinding device; sharing it
would manufacture representation agreement and destroy the L2 observable). Owner:
H.2-D §3.4.

**Harness-tier bridge** — one of the two permanent `main.ts` adapters
(`e14ToResolvedA`, `e14ToBlindOverlay`) crossing between the interchange record and
the display/private tiers; transport-only (no resolved geometry injected into any
consumer stage) with documented, expected lossiness; never normalized into a generic
framework, never relocated. Owner: H.2-D §3.5–§3.6.

#### Gap B — reuse-governance classes (ratified phase H.2-A; names verbatim)

1. **Renderer-neutral primitive** — zero interpretive content; free reuse in any
   direction (`primitives/svg-root.ts`, `primitives/temporal.ts`).
2. **Explicitly labeled profile-defined reading** — a named interpretation the profile
   itself assigns; shareable ONLY under a name and header stating the reading so
   alternative readings stay visible (`primitives/region-as-viewport-placement.ts`,
   the region-as-viewport reading per R-S2).
3. **Consumer-policy implementation** — embodies a choice where consumers deliberately
   diverge; stays owned by its consumer; sharing prohibited when it would collapse a
   research observable (MF bounds/drop policy, security posture, z-order, window
   defaulting, synthesized-viewBox placement).
4. **Analysis-only / counterfactual implementation** — prediction/measurement machinery
   consumed by NO renderer; renderers MUST NOT import it (`composition/comparison.ts`,
   `comparison/blind-comparison.ts`, `oracle/*`, `embedding-semantics/analysis.ts`,
   `nested-composition/comparison.ts`, `cross-engine/classify.ts`).

Binding corollary (H.2-A): physical location does not establish semantic ownership;
the class travels with the module and is declared in its module header.

#### Gap C — module/test roles (engineering vocabulary)

Role words used by `AGENTS.md` behavior rules and by migration planning:

- **Consumer implementation** — an independent renderer/resolver whose semantic
  resolution logic must not import another consumer's (`reference/`, `blind/`,
  `native/`).
- **Shared infrastructure** — code multiple consumers may depend on without collapsing
  observables: reuse-governance classes 1–2 plus the interchange-record tier.
- **Analysis infrastructure** — reuse-governance class 4 collectively (list above).
- **Harness/measurement apparatus** — the lab app and measurement pages exposing
  renderers, fixtures, and hooks (`main.ts`, `embedding-semantics/page.ts`,
  `cross-engine/page.ts`, `tests/e2e/utils.ts`); deliberately below term level
  (see §5.7 closing note).
- **Evidence-producing test** — a test/script whose successful run writes tracked
  evidence as a side effect (vitest suites `tests/e14-comparison.test.ts`,
  `tests/e16-comparison.test.ts`, `tests/blind-comparison.test.ts`; script
  `scripts/run-validator-suite.mts`; the browser suites); governed by evidence policy
  P-2/P-3/P-7.
- **Protected machine surface** — an identifier whose value/key/name crosses a machine
  boundary or is frozen by policy: URL parameters+values, browser globals,
  routes/events/CSS hooks, serialized vocabularies, live ID spaces, filename grammars.
- **Historical citation** — a legitimate occurrence of a retired identifier when
  NAMING a historical artifact, document, or serialized value; sanctioned use, never
  prose vocabulary.
- **Frozen output grammar** — the filename/content grammar of an evidence or fixture
  family; byte-stable under regeneration; renames forbidden (evidence policy P-5).

---

## 6. Concept relationships

The vocabulary's power sits in a handful of load-bearing distinctions and one
pipeline shape. A new contributor who internalizes these six understands the
system:

1. **Requirement ≠ Exclusion ≠ Fence.** Requirements say what must hold;
   exclusions mark territory outside the contract (no promises made); fences
   mark undetermined semantics inside awareness (promise explicitly withheld).
   None of the three implies the others.
2. **Resource conformance ≠ Consumer conformance ≠ Interoperability.** Data can
   be perfect while every current consumer fails to render it. Today's
   guarantee chain stops after the first link — by evidence, not omission.
3. **Syntax permitted ≠ Honored.** Grammar-level validity of a fragment says
   nothing about any consumer applying it at render time. This is the most
   trap-prone pair in the corpus; the distinction is enforced structurally
   (separate requirement parts, separate diagnostics, audit tests).
4. **Conformance ≠ Compatibility ≠ Agreement.** Conformance: satisfaction of
   profile requirements (normative layer). Compatibility: capability grades of
   the standard stack (rolling status). Agreement: observed equality between
   implementations (evidence outcome). Never merged despite superficial
   similarity.
5. **Claim provenance is singular and un-promotable.** Every claim carries
   exactly one provenance class; agreement across engines upgrades confidence
   in a `[BROWSER]` fact but NEVER manufactures `[NORMATIVE]`.
6. **Truth flows one way.** Profile → matrix → suite → generator → evidence;
   observations flow back only through ambiguity records and the falsification
   protocol. Terminology mirrors this: normative terms (C2) never borrow their
   meaning from downstream artifacts.

Pipeline shape (for orientation, not redefinition):

```
fixtures → measurements → findings ─┐
external sources ───────────────────┼→ safe subset → profile → matrix → suite → validator → diagnostics
consumers/engines probes ───────────┘                                                        ↓
                                                                              evidence (archived outputs)
```

---

## 7. Identifier policy

### 7.1 When a concept receives an identifier

ALL four must hold:

1. **Cross-artifact reference**: the thing is cited from at least two of:
   normative documents, executable code, generated evidence.
2. **Automated processing**: some program keys on it (tests, validators,
   generators) or plausibly will.
3. **Dispute-grade traceability**: disagreements are argued by citing it.
4. **Small, stable population**: the set changes rarely; churn would break
   references worth more than the numbering convenience.

Otherwise: describe in prose, anchor by document + heading, and skip the ID.

### 7.2 Live identifier spaces (approved)

| Space | Pattern | Why it qualifies | Rules |
|---|---|---|---|
| Requirements | `R-S<n><part>` | Cited by profile, matrix, code union (`RequirementId`), evidence, disputes | Immutable; append new requirements with next free number + provenance-forced letter part; never renumber, never recycle |
| Exclusions | `X<n>` | Same cross-artifact web | Immutable; append-only |
| Conformance test cases | `T<nn>` | Pre-registration + suite encoding + evidence filenames | Zero-padded; immutable; append-only while suite v1 lives |
| Diagnostic codes | `SCREAMING_SNAKE` strings | Machine-emitted, evidence-carried, audited | Owned solely by `src/n6/types.ts`; additions require validator change-set; humans quote verbatim |
| Epistemic layers | `L0…L6` | Governance shorthand used across consolidation documents | Closed set |
| Fixture/evidence family ids | kebab-case in provenance manifest | Machine-facing provenance tracking | Append via manifest schema |
| Living ambiguity records | `AMB-<report>-<n>` | Must stay citable until human resolution | Minted only in an implementation/report context |

### 7.3 Dormant identifier spaces

`RF01–RF04` (rendering checks): retained because the designs are committed and
executable-if-capable-consumer appears; do not extend without revisiting this
policy. Register numbers in `open-questions.md`: retained as the one sanctioned
append-only ledger numbering (document-scoped; never cited without naming the
register).

### 7.4 Retired-to-history spaces (never extended)

Experiment/generation numbers (`exp*`, `E<n>`, `N<n>`, `Stage k`), candidate
rule numbers (`P1–P6`), finding/hypothesis/brief-question numbers
(`Finding n`, `Fn`, `Hn`, `Q1–Q10`, `Q1.m`), probe report IDs/shorthands
(`R-V*`, `M-M*`, `V*`, `M*`), subset-rule aliases (`S1–S8`), process ops
(`P-0`,`R-1`,`G-1`,`V-1`,`N-2`,`D-DEF`), preservation/writing-rule item
numbers (`P-TERM-n`, `T-1…T-6`), evidence-policy points (`P-1…P-7`),
consolidation decisions (`D1–D10`), bug-ledger numbers, `E18` ghost.
These remain readable in archives via §9; none may be minted anew.

### 7.5 Sequential vs semantic identifiers

Sequential numbering is accepted ONLY where the artifact type is inherently
enumerated and append-only (requirements/exclusions/cases appended to frozen
sets; register entries). Everywhere else, prefer semantic identifiers:
slugs over numbers for probes; names over letters for roles in prose;
descriptive phrases over labels for interpretations. A new identifier that
needs a legend to decode is a design smell.

---

## 8. Output vocabulary (machine layer)

Human terminology ends here. These are software interface surfaces — listed so
the glossary visibly excludes them, owned by their definition sites.

- **Diagnostic statuses**: `PASS | FAIL | BLOCKED | OPEN_FENCE`
  (`src/n6/types.ts` `DiagnosticStatus`). PASS/FAIL apply only to
  resource-side mechanical predicates; BLOCKED marks consumer-side
  untestability; OPEN_FENCE records predicate-free boundaries.
- **Diagnostic codes** (20, `src/n6/types.ts`): `MISSING_VIEWBOX`,
  `INVALID_VIEWBOX`, `VIEWBOX_PRESENT`, `MISSING_CANVAS_DIMENSION`,
  `NONPOSITIVE_CANVAS_DIMENSION`, `NONINTEGER_CANVAS_DIMENSION`,
  `CANVAS_DIMENSIONS_OK`, `ASPECT_MISMATCH`, `ASPECT_CONFORMS`,
  `NONINTEGER_DIMENSIONS_REJECTED`, `EPSILON_DECISION_RECORDED`,
  `MAPPING_EMERGED`, `MALFORMED_FRAGMENT`, `FRAGMENT_WELLFORMED`,
  `ALIAS_NORMALIZED`, `EXCLUSION_RELIANCE_DECLARED`, `NO_GEOMETRY_PROMISED`,
  `CONSUMER_CONFORMANCE_BLOCKED`, `TEMPORAL_SYNTAX_PERMITTED`,
  `TEMPORAL_HONORING_OPEN`.
- **Conformance-state vocabularies** (deliberately two, never unified):
  markdown `IN FORCE / EXCLUDED / OPEN fence / OUT OF SCOPE`
  (conformance-matrix Part A); JSON presentation
  `implemented / blocked / open fence / excluded` (mapping lives only in the
  run script's `matrixRows`).
- **Compatibility grades** `S / G / B / S*` — owned by the compatibility
  matrix legend.
- **Register states** `OPEN / ANSWERED / SUPERSEDED`; inline SUPERSEDED
  markers are data.
- **Classifier labels** `I-*` — frozen evidence vocabulary (see §5.6).
- **Filename grammars / probeIds / slugs** — frozen per family; see evidence
  policy.

Rule: new prose may QUOTE these verbatim when discussing outputs; it never
paraphrases them into new terms, extends them, or treats them as taxonomy.

---

## 9. Historical terminology mapping

Archaeology table: old surface form → underlying concept → current term/ID to
use in NEW prose. Historical documents themselves are never rewritten; this
table exists so readers (and the eventual migration tooling) can translate.

| Historical form(s) | Underlying concept | Current term / handling |
|---|---|---|
| `exp1–exp7`, `text`, `security`, `exp7-animate` | Initial-cycle experiments + fixtures | "initial-cycle experiments/fixtures" by name; fixtures via provenance manifest families |
| `case1–case13` (blind) / `case06` (e14/e16 padded) | Case fixture | "case fixture" + exact filename when citing |
| `e14-caseNN-…-a/b/c`, `e16-caseNN-…` | Composition case fixtures (suffix encodes composition model) | filename citations; suffix letters are encoding, not prose terms |
| `E12–E17`, `E1–E11` ranges | Experiment generations | Name the report ("the embedding-semantics experiment", "the cross-engine replication"); numbers only in archival citation |
| `E18` | Ghost: proposed survey, executed under a different name | Do not use; the consumer-probe report exists under its own name |
| `N1–N6` / `Stage 0–6` | Research stages/generations | Same treatment as generations; "Stage" was a pure alias |
| `S1–S8` | Subset rules = today's requirements | Map: S1→R-S1, S2→R-S2, S3→R-S3, S4→R-S4, S5→R-S5, S6→R-S6a+R-S6b, S7→R-S7(+X-list), S8→R-S8a+R-S8b |
| `N4`, "safe subset", "Safe Interoperability Subset" | Superseded pre-profile vocabulary for the decision record now carried by Requirement/Exclusion terms | Not current vocabulary; cite `n4-safe-subset.md` as the historical decision record |
| `P1–P6`, `P5a` | Candidate profile rules | P1→explicit-viewBox requirement (R-S1); P2→region-as-viewport (R-S2); P3→fragment syntax (R-S6a/b, R-S8a); P4→z-order (now open fence / X6 territory); P5→nested composition (R-S4/R-S5 + X1/X8 boundaries); P5a→same-aspect constraint (R-S4); P6→exclusions (R-S7/X1–X8) |
| `R1–R5` (embedding report) | Classified embedding-semantics findings | Cite the report §; concept absorbed into candidate-interpretation/finding vocabulary |
| `Finding 1–6`, `F1–F8` | Findings | "finding" + report name |
| `H1–H5` | Hypotheses | "hypothesis" + plan/report name |
| `Q1–Q10` (positioning brief) | Mandated briefing questions | Process artifact; cite positioning report section |
| `Q1.1–Q1.6`, `S1.0–S1.3` | Plan-stage questions/stopping conditions | Process artifacts of the session plan |
| open-question `#n` | Register entries | "open question <n> in the question register" |
| `bug-fix #n` | Ledger entries | "ledger entry <n>" with experiment-log citation |
| `R-V1–R-V7` ≡ `V1–V7` ≡ probeId ≡ slug | Ramp consumer probes | "consumer probe" + slug when citing evidence files |
| `M-M1–M-M3` ≡ `M1–M3` ≡ … | Mirador smoke probes | Same |
| `RF01–RF04` | Designed rendering checks | Keep IDs (dormant space) |
| `D1–D10` | Consolidation decisions | Process record; cite audit §11 |
| `L0–L6` | Epistemic layers | KEEP — canonical (§5.8) |
| Phase letters `A…F` | Consolidation phases | Process-local; never domain vocabulary |
| Ops `P-0,R-1,G-1,V-1,N-2,D-DEF` (+ `.x` substeps) | Checklist operations | Process record |
| `T-1…T-6` | Writing-convention items | Cite documentation-conventions Part I by rule name |
| `P-TERM-1…6` | Preservation rules | Same |
| `P-1…P-7` | Evidence-policy points | Cite evidence-policy §2 |
| Region short-names (`square500`…), variant names (`vb1000`, `novb1920x1080-min`), embedding labels | Matrix vocabularies | Frozen fixture/label encodings; cite builders/reports |
| `I-REGION-VIEWPORT` etc. | Candidate interpretations | Descriptive phrase in prose; machine label when citing cells |
| Verdict grades A–E | Session falsification outcomes | Historical process vocabulary of findings snapshot |
| Capability meta-labels A–D; orphan brackets (`[VIEWER]`…) | Ad-hoc classification tokens | Not governed; treat as historical ad-hoc, never reuse |

Mapping maintenance: this table is append-only; new historical families
discovered during migration get rows here rather than new glossary terms.

---

### 9.1 Approved implementation migration mapping (Phase G)

> ADDED BY PHASE G.x-0 MAPPING-FIRST DOCUMENTATION. Rows below are RATIFIED AND
> PENDING EXECUTION — nothing has been renamed yet. This subsection is a different
> kind of content from the archaeology table above: that table translates historical
> FORMS for reading prose; this subsection authorizes FUTURE IMPLEMENTATION MOVES.
> The two must not be conflated. Ratifying artifact:
> `research/phase-g-terminology-taxonomy.md` (full rationale, sequencing §13,
> verification protocol §14). Baseline at ratification: HEAD `5ec792d`.

Naming policy governing every row below (ratified Phase G):

- Living prose refers to experiments semantically first: `<semantic name>
  (<historical ID>)`, e.g. "cross-engine replication (E17)". Number-first forms
  (`E17 — …`) are reserved for archival indexes/citations where the number is the
  lookup key.
- New namespaces/slugs/identifiers MUST NOT embed historical experiment numbers;
  generation tokens remain historical citations or frozen machine coordinates only.
- Frozen machine surfaces (serialized values/keys, filename grammars, URL parameters,
  browser globals, routes/events/CSS hooks, live ID spaces) NEVER change as part of
  any row below.

Execution discipline: ONE atomic change-set per family (every row's importers and
coupled files move together; each commit compiles green and is its own rollback
boundary); evidence-producing vitest suites are run focused after their family and
byte-compared against HEAD (expected identical — never absorb churn); browser/
Playwright suites are NOT run as rename verification; per-family gates are defined in
the taxonomy artifact §14.

#### Approved namespace migrations

| Current | Target | Atomicity / coupling notes |
|---|---|---|
| `src/n6/` | `src/validator/` | ONE directory move. `suite.ts` moves WITH the validator (edit-flow stage 3). Importers `tests/n6-conformance.test.ts` + `scripts/run-n6-suite.mts` update in the same change-set. Values stay byte-identical: `VALIDATOR_VERSION = "n6-resource-validator@1.0.0"`, fixture ids `n6-t01…n6-t15`, `AMB-N6-1` context, `OUT_DIR = "evidence/n6"`, `matrixRows` literals. The `src/n6/types.ts` owner citations in THIS document become pointer updates AT EXECUTION (see pointer obligations below). Vitest conformance suite writes no evidence. |
| `src/e14/` | `src/composition/` | ONE namespace migration: `types.ts` + `comparison.ts` move TOGETHER. Do NOT split; do NOT merge `comparison.ts` into `src/comparison/`. Importer sweep: `main.ts`, `reference/lib/e14.ts`, `blind/e14.ts`, `native/resolver.ts`, `native/stage.ts`, `src/e16/comparison.ts`, unit tests, e2e specs. Browser-global keys `__lab.e14Resolved`/`__lab.e14Compare`, verdict strings, model letters, placement modes, BodyKind values UNCHANGED; `evidence/e14/` grammar unchanged. Evidence-producing unit suite (`e14-comparison`) requires focused run + byte-compare. |
| `src/e15/` | `src/embedding-semantics/` | Directory move incl. `analysis.ts` + `page.ts`. `public/e15-lab.html` `<script src>` mount updates in the SAME change-set; route `/e15-lab.html`, `window.__e15`, CSS/event hooks unchanged. `src/e17/classify.ts` + `src/e17/page.ts` imports repoint in THIS family's change-set. `tests/e2e/e15.spec.ts` is a browser-dependent evidence writer (`evidence/e15/`) — not run as rename verification. `INTERPRETATION_NAMES` VALUES and pinned interpretation function names untouched. |
| `src/e16/` | `src/nested-composition/` | Single-module move. Imports `../e14/types` (repointed during this family or the composition family, whichever runs later). Importer `tests/e16-comparison.test.ts` follows atomically; `evidence/e16/` grammar unchanged; that suite is evidence-producing — focused run + byte-compare required. |
| `src/e17/` | `src/cross-engine/` | Directory move incl. `classify.ts` + `page.ts`. `public/e17-lab.html` `<script src>` mount updates same change-set; route `/e17-lab.html`, `__e17`, shared `.e15-box/.e15-row` hooks unchanged. Spec+config move in ONE change-set (row below). `scripts/e17-aggregate.mjs` rename must NOT alter any frozen `evidence/e17/*` path literal or `"experiment"` value. |

#### Approved script migrations

| Current | Target | Notes |
|---|---|---|
| `scripts/run-n6-suite.mts` | `scripts/run-validator-suite.mts` | Moves with validator family; `OUT_DIR="evidence/n6"` and all output literals byte-identical; not executed during migration. |
| `scripts/build-e14-fixtures.mjs` | `scripts/build-composition-fixtures.mjs` | Generated fixture filenames (`e14-caseNN-*` grammar) frozen. |
| `scripts/build-e15-fixtures.mjs` | `scripts/build-embedding-semantics-fixtures.mjs` | Variant/landmark outputs frozen. |
| `scripts/build-e16-fixtures.mjs` | `scripts/build-nested-composition-fixtures.mjs` | Outputs frozen. |
| `scripts/build-e17-fixtures.mjs` | `scripts/build-cross-engine-fixtures.mjs` | Outputs frozen. |
| `scripts/build-n2-fixtures.mjs` | `scripts/build-consumer-probe-fixtures.mjs` | Probe-manifest slugs frozen (incl. its citations of e14/e15/e16 fixture paths). |
| `scripts/e17-aggregate.mjs` | `scripts/cross-engine-aggregate.mjs` | Reads frozen `evidence/e17/*`; writes `cross-engine-matrix.json`/`summary.json` with unchanged `"experiment"` values; not executed during migration. |

#### Approved unit-test migrations

| Current | Target | Notes |
|---|---|---|
| `tests/n6-conformance.test.ts` | `tests/validator-conformance.test.ts` | T01–T15 ids immutable; writes NO evidence. |
| `tests/e14-comparison.test.ts` | `tests/composition-comparison.test.ts` | Evidence-producing (`evidence/e14/`) — focused run + byte-compare post-rename. Fixture-path literals frozen. |
| `tests/e16-comparison.test.ts` | `tests/nested-composition-comparison.test.ts` | Evidence-producing (`evidence/e16/`) — focused run + byte-compare post-rename. `cmp-*` filename construction frozen. |

#### Approved E2E spec migrations

| Current | Target | Notes |
|---|---|---|
| `tests/e2e/e14.spec.ts` | `tests/e2e/composition.spec.ts` | Root config pins nothing for it; `record()` observation names (`e14-case06-*`…) frozen; `__lab` keys unchanged. Browser suite — static verification only by default. |
| `tests/e2e/e15.spec.ts` | `tests/e2e/embedding-semantics.spec.ts` | Navigates `/e15-lab.html` (route KEPT); `__e15` calls unchanged; writes `evidence/e15/*` — DO NOT RUN. |
| `tests/e2e/e16.spec.ts` | `tests/e2e/nested-composition.spec.ts` | `__lab.*` keys and record names unchanged. |
| `tests/e2e/e17.spec.ts` | `tests/e2e/cross-engine.spec.ts` | Couples to dedicated config — SAME change-set; drives BOTH lab pages (`__e15` + `__e17`). |
| `tests/e2e/n2-viewer.spec.ts` | `tests/e2e/consumer-probe.spec.ts` | Couples to dedicated config — SAME change-set; network-dependent, never run casually. |

Initial-cycle specs (`exp1..7`, `parity`, `security`, `text`, `viewer`, `blind`) and
`tests/e2e/utils.ts`: KEEP (reproducibility apparatus around frozen `?exp=` surfaces;
Phase G class decision).

#### Approved Playwright config migrations

| Current | Target | Notes |
|---|---|---|
| `playwright.e17.config.ts` | `playwright.cross-engine.config.ts` | `testMatch` regex + `outputDir` move in the same change-set as the spec rename; engine project names `chromium/firefox/webkit` untouched. |
| `playwright.n2.config.ts` | `playwright.consumer-probe.config.ts` | Same coupling rule. |

#### Symbol mappings

| Current | Target | Status |
|---|---|---|
| Every exported symbol prefixed `E14` (`E14Model`, `E14SvgAttrs`, `E14Placement`, `E14PlacementMode`, `E14NestedMap`, `E14Security`, `E14Rule`, `E14Overlay`, `E14CanvasInfo`, `E14Manifest`, `E14Comparison`) | `Composition<name>` equivalent | APPROVED (mechanical prefix swap; member inventory confirmed against the export surface at composition-family execution). Non-prefixed exports of those modules (`RendererName`, `Provenance`, `Rect`, `SvgBox`, `BodyKind`, `OverlayDiff`, `RendererPair`, `classifyDiff`, `compareManifestPair`, `ruleProvenances`, `userToCanvas`) are NOT touched by this rule. Serialized VALUES (letters/modes/kinds) unchanged. |
| `resolveE14Manifest` | `resolveCompositionManifest` | APPROVED |
| `resolveBlindE14Manifest` | `resolveBlindCompositionManifest` | APPROVED |
| `compareE14` | `compareCompositionRecords` | APPROVED (final spelling ratified by G.x-0) |
| `E15Embedding` | `EmbeddingMechanism` | APPROVED — adopts the existing §5.3 glossary term; channel VALUE strings unchanged |
| `resolveNativeManifest` | — | KEEP (already semantic) |
| `iRegionViewport`, `iIntrinsicStretch`, `iObjectFitContain`, `iNaturalTopLeft`, `iNaturalCentered` | — | PINNED KEEP — deliberate mirrors of the frozen `I-*` labels via `INTERPRETATION_NAMES[fn.name] ?? fn.name` (`classify.ts:198`); never renamed independently of the frozen labels |
| `e14ToResolvedA`, `e14ToBlindOverlay` | — | KEEP unless a human decision explicitly overrides open question Q2 (names cited by the ratified H.2-D record) |

#### Q3 symbol spellings (RESOLVED at embedding-semantics execution — Phase G.x-2)

Resolved during the embedding-semantics family migration; each target was chosen from
the symbol's actual semantic role (definition + every usage inspected) using existing
glossary/domain vocabulary, verified collision-free against the tree.

| Former symbol | Target | Semantic reason |
|---|---|---|
| `E15Rect` | `CanvasRect` | Axis-aligned rectangle in logical Canvas space. Every usage (target-region rects, landmark frame, interpretation viewports, clip windows, contain/natural boxes) shares canvas-unit semantics; the architecture demonstrates ONE concept, so no split. Avoids collision confusion with e14's distinct unqualified `Rect`. |
| `E15Landmarks` | `LandmarkContract` | The glossary C4 concept verbatim: the per-fixture landmark geometry table (`public/svg/e15/e15-landmarks.json`, "the landmark geometry CONTRACT reused by e16/e17"). |
| `E15SvgVariant` | `SvgVariant` | A measurement-stimulus SVG variant record (file + viewBox + preserveAspectRatio + width/height attrs); matches the "embedding-semantics variants" fixture-family vocabulary without embedding the experiment number. |
| `E15Map` | `PlacementMap` | The module's own contract line: "A placement = linear map user space -> Canvas space (+ optional clip box)" — the predicted placement mapping a candidate interpretation returns. Distinct from e14's richer `Placement` record (which carries mode/scale/translation as interchange data). |
| `E15Measured` | `CellMeasurements` | Per-cell browser-measured quantities ("Measured record produced by the browser harness"): CSS-pixel frame/circle bboxes, intrinsic size, inner-svg box. |
| `E15CellResult` | `CellResult` | Full result record for one measurement-matrix cell: coordinates (variant × embedding mechanism × region), scale k, measurements, derived geometry, matching interpretations, verdict. |

These renames executed ATOMICALLY across
`src/embedding-semantics/analysis.ts`, `src/e17/classify.ts`,
`tests/e2e/embedding-semantics.spec.ts`, and `tests/e2e/e17.spec.ts` within the
embedding-semantics family change-set.

#### Explicit keeps (ratified)

`scripts/build-fixtures.mjs`; `scripts/generate-video.mjs`; namespaces
`src/reference/`, `src/blind/`, `src/native/`, `src/primitives/`, `src/comparison/`,
`src/oracle/`; `src/main.ts`; lab-page filenames/routes `/e15-lab.html`,
`/e17-lab.html`; initial-cycle spec filenames (above); all clean unit tests
(`blind*`, `iiif`, `selectors`, `svg`, `timing`); infrastructure configs.

#### Pointer obligations inside this document (future updates, NOT edits now)

Current-state path references below remain accurate until the corresponding family
executes; they then become POINTER UPDATES to the migrated paths. Protected VALUES
are never changed either way:

- Validator family → update `src/n6/types.ts` / `src/n6/` / `src/n6/suite.ts`
  citations at: §3.1 Method; §3.2 row N-23; §5.4 Requirement ("encoded in …
  `RequirementId`"); §5.5 Validator ("Implementation: …") and Conformance test case
  ("executable transcription …"); §7.2 Diagnostic codes row; §8 Output vocabulary
  (both bullets); Appendix row "`src/n6/types.ts`".
- Composition/embedding-semantics/nested-composition/cross-engine families → update
  the code-home citations introduced in §5.9 Gap A/B/C if they name moved paths.

---

## 10. Ambiguities / unresolved decisions

Recorded, not guessed. Each blocks a specific migration step, nothing else.

- **U1 — Project self-descriptor.** Repository/doc titles still say "video
  annotation", while the evidence center of gravity is predictable geometry of
  painted resources. The framing SENTENCE is decided (writing conventions);
  whether to mint a short NAME (title/readme/package metadata) is a naming
  decision deferred to the migration phase.
- **U2 — Prose fate of "Renderer A/B" letters.** Canonical today (§5.7) because
  machine surfaces encode them; IF the eventual cleanup ever touches URL
  parameters/evidence verdict strings (behavior-adjacent), a simultaneous
  semantic rename could be considered. Until then: axis-word rule stands.
  Default: no action.
- **U3 — Future requirement numbering.** Policy says append-with-next-number;
  whether a future profile revision should instead re-issue a versioned
  requirement set is a governance choice only needed if/when the profile
  actually changes.
- **U4 — Probe ID revival.** If consumer probing resumes, new probes use
  semantic slugs (§5.6); whether to ALSO assign stable row IDs in a successor
  evidence schema is deferred until such work exists.
- **U5 — Confidence vocabulary duality.** Prose confidence words
  (confirmed/likely/uncertain) coexist with the n3 JSON `"confidence"` field.
  Harmless (different layers); reconcile only if tooling ever consumes both.
- **U6 — AMB-N6-1.** Remains OPEN by standing decision; this specification
  inherits and repeats it without resolving. Any migration touching the
  affected parentheticals is forbidden until a human research decision lands.
- **U7 — Machine-readable companion.** No JSON/YAML emitted in this phase: the
  §9 table is grep-able and the migration is document-editing work; a
  structured export becomes worthwhile only if the cleanup acquires scripted
  checks (decide then, not now).

---

## 11. Migration principles (for the LATER cleanup phase)

The cleanup, once approved, follows these rules so no semantic decisions get
invented mid-refactor:

1. **Two-document classes.** Historical records (reports, logs, plans, packets,
   evidence, generated artifacts) are NEVER terminologically modernized. Living
   and future-facing documents adopt the target vocabulary.
2. **Normative-text freeze.** Requirement substance, predicates, statuses, and
   conclusions are untouched; migration changes NAMES/qualifications only,
   through the sanctioned edit-flow, one change-set per chain.
3. **Mapping-first.** Every rename executes a §9 row; unmapped renames are
   forbidden. The mapping table grows before edits, not after.
4. **Code follows vocabulary only where behavior-safe.** Comments/strings that
   merely speak may adopt terms; unions, URLs, codes, and filenames change only
   under a separate decision acknowledging evidence regeneration costs.
5. **Registry retirement.** After migration, `terminology.md` is reduced to (a)
   a pointer to this specification and (b) the historical identifier appendix —
   an audit artifact, no longer the vocabulary authority.
6. **Verification.** The migration completes only when: no living document uses
   retired forms outside §9-citation contexts; glossary/owner-definition sites
   agree; suites pass unchanged; evidence tree untouched.

---

## 12. Maintenance rules

Minimal by design:

1. One canonical term per concept; proposals for new concepts add a glossary
   entry FIRST, code/labels second.
2. New identifiers must pass §7.1's four-part test and land in §7.2's table with
   an owner; anything else stays unnamed.
3. Qualifier discipline: collision-prone terms are always written in qualified
   form (target region, MF selection region, SVG viewport, page viewport,
   canonical prefix/ordering, axis-qualified renderer/model/mode names).
4. Definitions live at their owning sites; this specification may be corrected
   to match an owner, never vice versa (until a deliberate re-design says
   otherwise through the falsification protocol).
5. Historical mapping is append-only; never delete rows.
6. Disagreements between this specification and any owning document are logged
   as ambiguity/register items, not silently patched.

---

## Appendix — Relationship to existing artifacts

| Artifact | Status under this specification |
|---|---|
| `research/terminology.md` | Unchanged now; becomes pointer + historical appendix AFTER approved migration |
| `research/phase-e-identifier-inventory.md` | Archaeological map; superseded as design input, kept as record |
| `profile-draft.md` Part 2/3 | Remains DEFINITION SITE for domain terms and provenance classes; this spec defers to it |
| `documentation-conventions.md` | Its rules are restated/absorbed conceptually; remains operative for new documents until migration supersedes file organization |
| `src/n6/types.ts` | Definition site of output vocabulary (§8); untouched |
| Evidence, reports, logs | Untouched; historical forms read via §9 |

*End of Phase F terminology specification.*
