# Phase G — Terminology Taxonomy & Migration Mapping

> **DECISION ARTIFACT — TAXONOMY AND MAPPING ONLY. NOTHING RENAMED, MOVED, DELETED,
> REGENERATED, OR MIGRATED.** This document turns the factual findings of
> `phase-g-terminology-namespace-audit.md` (baseline `fb3c140`, tracked as `5ec792d`)
> into (a) a terminology taxonomy, (b) resolved vocabulary-gap definitions, and
> (c) an executable migration map with sequencing and verification policy. It edits no
> existing document, source, test, script, config, fixture, or evidence file; the only
> delta it produces is this file. Every decision below cites the audit's OBSERVED
> findings or fresh inspection at HEAD `5ec792d`. Where a decision requires human
> sign-off it is listed in §15 (unresolved questions), not silently treated as settled.
>
> Filename note: the sibling record is `phase-g-terminology-namespace-audit.md`; this
> file continues that task designation ("Phase G"). The pre-existing G-series process
> record (`phase-g1-source-architecture-inventory.md`) is unaffected.

Governing inputs read and unmodified: `AGENTS.md`, `terminology-specification.md`,
`terminology-migration-inventory.md`, `terminology.md`, `documentation-conventions.md`,
`current-state-index.md`, `consolidation-map.md`, `cleanup-checklist.md`,
`evidence-policy.md`, `fixture-provenance.json`,
`phase-h2a-shared-primitive-namespace.md`, `phase-h2d-interchange-display-tier-ratification.md`.

---

## 1. Decision summary

1. **Six identity planes** are distinguished (§3): historical experiment identity,
   semantic/domain identity, implementation namespace, machine-facing identity,
   evidence/fixture identity, process-local identifiers. Generation numbers belong to
   plane 1 (and, frozen, to planes 4–5); they must not remain the primary vocabulary of
   plane 3.
2. **Canonical experiment reference format**: semantic name first, historical ID in
   parentheses — "cross-engine replication (E17)". Number-first form (`E17 — …`) is
   reserved for archival indexes/citations where the number is the lookup key. New
   machine slugs never embed generation numbers (§3.2).
3. **Vocabulary gaps closed** (§5) using existing ratified phrasing wherever possible:
   Gap A formalizes H.2-D's four tier names (interchange record / legacy
   display-regression substrate / consumer-private model / harness-tier bridge);
   Gap B adopts H.2-A's four reuse-governance class names verbatim; Gap C defines eight
   module/test role words used by AGENTS.md and all migration planning.
4. **E14 decision: single namespace `src/composition/` (Option A)** holding both the
   interchange record data model (`types.ts`) and the renderer-agreement comparison
   machinery (`comparison.ts`). NOT split; NOT merged into `src/comparison/`
   (§8). Dependency architecture decides: `compareE14` is defined only over the
   interchange record, and the record's own header declares it exists as a
   comparison/evidence data model — they are one dependency unit bound to one ratified
   tier.
5. **Other namespace decisions** (§9): `src/n6/ → src/validator/` (suite moves with the
   validator); `src/e15/ → src/embedding-semantics/`; `src/e16/ → src/nested-composition/`;
   `src/e17/ → src/cross-engine/`. Clean namespaces (`reference/`, `blind/`, `native/`,
   `primitives/`, `comparison/`, `oracle/`, plus `main.ts`) stay unchanged.
6. **Initial-cycle experiments (exp1–7, text, security, parity, viewer) are a separate
   class** from E14–E17: historical experiments whose reproducibility apparatus remains
   active around FROZEN surfaces (`?exp=` values, fixture families). Their spec
   filenames are recommended to stay; semantic slugs are recorded for prose/mapping use
   only (§10).
7. **Protected-surface policy** (§7): every serialized value/key/filename/route/global/
   live-ID space is classified MUST NOT CHANGE; internal type/function/module names are
   CAN CHANGE IF ATOMIC; two deliberate exceptions are pinned forever (interpretation
   function names mirror frozen `I-*` labels; bridge function names preserve traceability
   with the ratified H.2-D record).
8. **Migration sequencing** (§12): five family change-sets ordered by blast radius
   (validator → embedding-semantics → cross-engine → nested-composition → composition),
   each compiling green at its boundary, none regenerating evidence, each individually
   revertable. Documentation refresh follows after renames land.

---

## 2. Design goals and non-goals

Goals:

- A new contributor can infer what any living path does without decoding generation
  numbers, while historical lineage stays recoverable in one step.
- No machine contract changes. Evidence remains byte-stable; regeneration is neither
  required nor authorized by anything in this document.
- Migration planning becomes mechanical: mapping-first rows + per-family couplings +
  verification gates decided now, so no semantic decisions get invented mid-rename.

Non-goals: renaming for aesthetics; touching clean namespaces; unifying era-specific
comparison mechanisms (N-06 separation stands); resolving U1 (project descriptor);
resolving AMB-N6-1; modernizing any frozen record.

---

## 3. Taxonomy

### 3.1 The six identity planes

| # | Plane | What belongs | Canonical carriers | May carry generation numbers? |
|---|---|---|---|---|
| 1 | **Historical experiment/probe identity** | coordinates of past research: exp1–7/text/security/viewer, blind case1–13, E12–E17, N1–N6, findings/hypotheses/probe-report IDs | experiment-log rows, L0 reports, registry (`terminology.md`), evidence `"experiment"` values | YES — this plane IS the numbers' home |
| 2 | **Semantic/domain identity** | what a thing IS per the glossary (C1–C6): composition model, embedding semantics, cross-engine replication, validator, consumer probe… | glossary terms, report titles, prose | NO |
| 3 | **Implementation namespace** | directories/modules/scripts/tests/configs of living code | paths under `src/ scripts/ tests/`, config filenames | NO (exception below) |
| 4 | **Machine-facing identity** | values/keys crossing program boundaries or serialized into outputs: URL params, browser globals, routes, verdict strings, diagnostic codes, live ID spaces, validator version | code string literals, unions, schemas | YES where frozen (e.g. `n6-resource-validator@1.0.0`, `n6-t01`, `e14-case03-a`) |
| 5 | **Evidence/fixture identity** | filename grammars and directory names of archived outputs and generated fixtures | `evidence/**`, `public/manifests/**`, `public/svg/**`, family ids in `fixture-provenance.json` | YES — frozen grammars (P-5) |
| 6 | **Process-local identifiers** | consolidation/process machinery: phase letters, ops D1–D10/R-1/N-2, plan questions | phase records, checklists | YES — but never domain vocabulary |

The exception in plane 3: a living artifact whose PURPOSE is reproducing a numbered
historical surface may cite the number in comments/docs, but even then should not carry
it as its own name (the reproducibility lives in the frozen surface, not the filename).

Rule derived from the planes: **a rename may only move an identifier between planes 3
and 2.** Plane 4/5 identifiers are immutable; plane 1/6 identifiers are citations, not
names; nothing may migrate INTO plane 1 (i.e., no living name may become
number-dependent).

### 3.2 Experiment-identity canonical format

Three context-dependent forms; the semantic name always comes from the canonical
experiment register (§3.4):

| Context | Form | Example |
|---|---|---|
| Living prose (first mention per document) | `<semantic name> (<historical ID>)` | "cross-engine replication (E17)" |
| Living prose (subsequent mentions) | `<semantic name>` | "cross-engine replication" |
| Archival index/table/citation (number is the sort or lookup key) | `<ID> — <semantic name>` | `E17 — Cross-engine replication` |
| Future machine-readable keys (if ever minted) | kebab-case slug; historical ID as separate metadata field | slug `cross-engine-replication`, field `"historicalId": "E17"` |

Forbidden: compound living identifiers embedding the number (`e17-cross-engine`,
`E14Composition*` as NEW names). Frozen grammars that already have that shape
(`e14-case03-a`, `n6-t01`, `case-e15-*`) stay byte-identical forever — they are planes
4–5, not vocabulary.

Rationale: the reader reaches meaning before history; the number degrades gracefully
into an optional annotation instead of a prerequisite. This matches spec §9's direction
("name the report"; "numbers only in archival citation") and reuses the registry's
existing ID-first style exactly where IDs remain the primary key.

### 3.3 Living implementation namespace naming rules

1. Directory/script/test/config names are compounds of existing glossary concepts
   (kebab-case): `composition`, `embedding-semantics`, `nested-composition`,
   `cross-engine`, `validator`, `consumer-probe`. No new nouns invented where the
   glossary already has the concept.
2. The namespace names the concept family; the module filename names the role inside it
   (`classify.ts`, `page.ts`, `comparison.ts`, `types.ts`). A namespace need not
   advertise every member's sub-role; headers do that.
3. One namespace = one ownership/governance story, stated in each module header
   (H.2-A corollary: governance class travels with the module and is declared in its
   header — mixing classes in one directory is allowed ONLY under that discipline,
   as `src/primitives/` already does for classes 1–2).
4. Test filenames follow their subject namespace (`<subject>.spec.ts`,
   `<subject>-comparison.test.ts`); Playwright `testMatch`/`outputDir` move in the same
   change-set (coupling C4).
5. New code MUST NOT introduce generation-numbered paths/names. Justified exceptions
   require an explicit phase record.

### 3.4 Canonical experiment register (semantic identities)

This table is the prose-mapping target for §3.2. It consolidates registry §2.A/§3 rows
and the audit's findings. Historical documents are never rewritten; this register
serves living prose and future mapping rows.

| Historical ID(s) | Semantic name (canonical) | Owning record | Class (see §10) |
|---|---|---|---|
| exp1 | temporal overlay visibility | initial cycle; fixtures active via harness | initial-cycle experiment (reproducibility apparatus active) |
| exp2 | SVG primitive rendering coverage | same | same |
| exp3 | annotation-page z-order probe | same | same |
| exp4 | spatial region targeting | same | same |
| exp5a/exp5b/exp5c | SVG coordinate-system independence (viewBox variants) | same | same |
| exp6 | aspect-ratio tracking across viewports | same | same |
| exp7 (+exp7-animate/-keyframes) | keyframe movement (external timeline vs SMIL; NON-STANDARD) | same | same |
| text | text metrics / font independence probe | same | same |
| security | sanitizer allowlist probe | same | same |
| viewer (Experiment 11) | third-party viewer smoke (Ramp, plain video Canvas) | `viewer.spec.ts`; refined by consumer probes | same |
| blind case1–13 (gen E12/E13) | adversarial blind-generation case fixtures | fixture-provenance `case-blind-1-13`; `docs/blind-renderer-report.md` era | historical fixture family (frozen) |
| E14 | composition-model interchange & renderer agreement | `e14-report.md` | later-generation experiment; living shared infrastructure |
| E15 | embedding-semantics measurement | `e15-report.md`, `e15-e16-final-report.md` | same |
| E16 | nested-composition fit analysis | `e16-report.md` | same |
| E17 (N1) | cross-engine replication | `e17-report.md`; open-question 12 | same |
| N2 | deployed-consumer probes | `viewer-interop-report.md`; open-question 13 | completed research stage; probe apparatus active |
| N3 | community positioning | `community-positioning.md` | completed research stage (documents only) |
| N4 | safe-subset adoption decision | `n4-safe-subset.md` | same |
| N5 | profile + conformance matrix formulation | `profile-draft.md`, `conformance-matrix.md` | normative-chain origin (L3/L4) |
| N6 | validator implementation | `n6-implementation-report.md` | conformance stack (living executable half) |
| E18 | ghost — never executed under this number | `e15-e16-final-report.md` §13 | do not use (spec §9) |

---

## 4. Relationship to existing specifications

This document does not supersede `terminology-specification.md`; it extends it along
the axes the specification itself reserves for later work:

- §11.3 (mapping-first): every proposed rename below becomes a §9 row BEFORE any edit;
  the proposed row content is in §11 here.
- §12.1/§12.5 (glossary-first, append-only mapping): Gap A/B/C definitions (§5) are
  proposed glossary entries, to be added to the specification's §5 in the SAME
  pre-migration documentation change-set as the §9 rows.
- §7.5 (semantic over sequential identifiers): all proposed namespace names are
  semantic; no new numbered space is created.
- N-26 (implementation detail out of vocabulary): routes/globals/CSS hooks stay OUT of
  the glossary; this document manages them purely as protected surfaces (§7).

---

## 5. Vocabulary gap resolutions

Minimum-vocabulary discipline: adopt already-ratified phrasings verbatim wherever one
exists; add nothing redundant. Each block below states the term, definition, owner, and
what it must NOT be confused with.

### Gap A — H.2-D display/interchange architecture (proposed glossary addition; C5-adjacent "architecture tiers")

All four terms already exist in ratified prose (`phase-h2d-…` §3–4, current-state-index
open-items row). This formalizes them so migration prose can name boundaries precisely.
None of these terms implies that the interchange record IS renderer semantics — that
denial is part of each definition.

1. **Interchange record** — the durable, renderer-filled shared record of the
   composition domain: each consumer resolves a manifest INTO its own instance of the
   record, carrying its readings AS DATA (placement modes, provenance-classed rules,
   security summaries), so agreement can be diffed mechanically without any consumer
   importing another's logic. Code home: `src/e14/types.ts` (target `src/composition/types.ts`).
   Owner: H.2-D §3.1–3.2 (ratified three-tier boundary). NOT renderer semantics; NOT a
   display model; NOT owned by any one consumer. Machine encoding note: type names like
   `E14Overlay` are implementation spellings of this concept, migratable under §7.
2. **Legacy display-regression substrate** — the `ResolvedOverlay` record plus the
   `Stage` rendering path: multi-role, live substrate serving exp-era flows, Renderer B
   oracle lowering, L1 parity, L2 reference-side input, and the reference consumer's
   native output. Owner: H.2-D §3.3 (determination H7 confirmed). NOT deprecated
   ("legacy" = era origin, not scheduled for removal); NOT interchangeable with the
   interchange record (its only unique field, `keyframes`, is exp7 experimental
   machinery attached to this substrate alone).
3. **Consumer-private model** — a record owned by exactly one consumer and never merged
   or replaced: instances `BlindOverlay` (blind renderer; methodological blinding
   device). Owner: H.2-D §3.4. Sharing it would manufacture representation agreement and
   destroy the L2 observable.
4. **Harness-tier bridge** — one of the two permanent `main.ts` adapters
   (`e14ToResolvedA`, `e14ToBlindOverlay`) crossing between the interchange record and
   the display/private tiers with documented, expected lossiness; transport-only (no
   resolved geometry injected into any consumer stage). Owner: H.2-D §3.5–3.6 (ratified
   permanent). Never normalized into a generic framework; never relocated into a
   single-caller abstraction.

### Gap B — H.2-A reuse-governance tiers (proposed glossary addition; C6)

Adopted VERBATIM from H.2-A §1 (which AGENTS.md restates). No new synonyms; the four
class names ARE the vocabulary:

1. **Renderer-neutral primitive** (class 1) — zero interpretive content; free reuse in
   any direction. Instances: `primitives/svg-root.ts`, `primitives/temporal.ts`.
2. **Explicitly labeled profile-defined reading** (class 2) — a named interpretation
   the profile assigns; shareable only under a name/header stating the reading so
   alternative readings stay visible. Instance: `primitives/region-as-viewport-placement.ts`
   (region-as-viewport reading per R-S2). This class is WHY the validator may import it
   without collapsing consumers' divergent readings.
3. **Consumer-policy implementation** (class 3) — embodies a choice where consumers
   deliberately diverge; MUST stay owned by its consumer; sharing prohibited when it
   would collapse a research observable (MF bounds/drop policy, security posture,
   z-order, window defaulting, synthesized-viewBox placement).
4. **Analysis-only / counterfactual implementation** (class 4) — prediction/measurement
   machinery consumed by NO renderer; renderers MUST NOT import it. Instances:
   `src/e15/analysis.ts`, `src/e16/comparison.ts`, `src/e14/comparison.ts`,
   `src/e17/classify.ts`, the `src/comparison/` harness, `src/oracle/*`.

Binding usage rule (already binding via H.2-A): physical location does not establish
semantic ownership; the class travels with the module and is declared in its header.
Consequence for this taxonomy: mixed-class directories are legitimate ONLY under header
discipline — which both `src/primitives/` and the proposed `src/composition/` satisfy.

### Gap C — Module/test roles (proposed engineering-role vocabulary; C6-adjacent, referenced by AGENTS.md behavior rules)

Eight role words; these make migration planning and AGENTS.md's behavioral rules
stateable without improvisation:

| Term | Definition | Instances |
|---|---|---|
| **Consumer implementation** | an independent renderer/resolver whose SEMANTIC RESOLUTION LOGIC must not import another consumer's | `src/reference/`, `src/blind/`, `src/native/` |
| **Shared infrastructure** | code multiple consumers may depend on without collapsing observables: reuse-governance classes 1–2 plus the interchange record tier | `src/primitives/*`, `src/e14/types.ts` |
| **Analysis infrastructure** | reuse-governance class 4 collectively: prediction/agreement/measurement machinery excluded from consumer resolution dependencies | `src/comparison/`, `src/oracle/*`, `src/e14/comparison.ts`, `src/e15/analysis.ts`, `src/e16/comparison.ts`, `src/e17/classify.ts` |
| **Harness / measurement apparatus** | the lab app and pages exposing renderers/fixtures/measurement hooks; deliberately below glossary term level (spec §5.7 note) | `src/main.ts`, `src/e15/page.ts`, `src/e17/page.ts`, `tests/e2e/utils.ts` |
| **Evidence-producing test** | a test/script whose successful run writes tracked evidence as a side effect; governed by evidence-policy P-2/P-3/P-7 | vitest: `tests/e14-comparison.test.ts` (→`evidence/e14/`), `tests/e16-comparison.test.ts` (→`evidence/e16/`), `tests/blind-comparison.test.ts` (→`evidence/blind-comparison/`); script: `scripts/run-n6-suite.mts` (→`evidence/n6/`); browser suites incl. `tests/e2e/e15.spec.ts` (writes `evidence/e15/` directly), e14/e16/e17/n2-viewer specs (via `record()`), `scripts/e17-aggregate.mjs` |
| **Protected machine surface** | any identifier whose VALUE/KEY/NAME crosses a machine boundary or is frozen by evidence/policy: URL params+values, browser globals, routes/events/CSS hooks, serialized vocabularies, live ID spaces, filename grammars | enumerated in §7 MUST-NOT-CHANGE |
| **Historical citation** | a legitimate occurrence of a retired identifier when NAMING a historical artifact, document, or serialized value — sanctioned use, never prose vocabulary | "Experiment E14" headers; `E17/N1` inside evidence strings; report filenames |
| **Frozen output grammar** | the filename/content grammar of an evidence or fixture family; byte-stable under regeneration; renames forbidden (P-5) | `evidence/n6/case-T*.json`, `cmp-e16-*__*.json`, `e14-caseNN-*`, `parity-*.json` |

Not a gap (recorded to prevent false positives, matching audit §6): the lab harness /
`window.__lab` surface — N-26 excludes lab globals from vocabulary scope; adequate.

---

## 6. Historical-ID nomenclature policy

Repository-wide rule for when generation identifiers remain visible:

1. **Plane 1 (history)**: generation IDs remain permanently in experiment-log rows, L0
   reports, the registry appendix, evidence citation strings, and archival indexes.
   They are coordinates, not vocabulary.
2. **Frozen machine surfaces (planes 4–5)**: IDs embedded in serialized values/keys/
   grammars persist byte-identically forever, regardless of any rename. Concrete
   standing examples AFTER full migration:
   - `VALIDATOR_VERSION = "n6-resource-validator@1.0.0"` — still emitted by
     `src/validator/validator.ts` (renamed home) into every `evidence/n6/*.json`.
   - suite fixture ids `n6-t01…n6-t15` — still serialized by `src/validator/suite.ts`.
   - URL values `e14-caseNN-x` / `e16-caseNN-x`; fixture families `manifests/e14/`,
     `svg/e15/…`; evidence dirs `evidence/e14…e17/`; aggregate keys `e16["case03-collapse"]`.
   - `"experiment": "E17/N1 cross-engine replication…"` values regenerated by
     `cross-engine-aggregate.mjs` (unchanged literals).
3. **Living prose**: semantic-first format per §3.2. First mention carries the
   parenthesized historical ID; the ID then drops away.
4. **Migrated module headers** carry ONE provenance line preserving lineage, e.g.:
   `Historical origin: experiment E17 (cross-engine replication); see research/e17-report.md.` —
   citation class, clearly not a name.
5. **New code**: no generation-numbered paths, type names, function names, script
   names, or test names. A future artifact genuinely ABOUT a historical experiment
   (e.g., "rerun the embedding-semantics measurement on engine X") uses the semantic
   name; the experiment linkage goes in prose/metadata, not the identifier.
6. **Never minted again**: E-numbers, N-numbers, `Stage k`, continuation numbering of
   any retired space (spec §7.4 stands unchanged).

Worked examples of the policy:

- GOOD (post-migration comment): `// Cross-engine classifier. Thresholds verbatim from
  the embedding-semantics analysis (historical E15); see research/e15-report.md.`
- BAD: `src/e17-cross-engine/classify.ts`; `E17Classifier`; `run-e18-survey.mjs`.
- GOOD (README post-migration): "The validator (`src/validator/`) executes conformance
  cases T01–T15 … its serialized identity string `n6-resource-validator@1.0.0` is a
  frozen machine coordinate from its historical stage N6."
- GOOD (archival citation): "`E17 — Cross-engine replication` (`e17-report.md`),
  evidence family `evidence/e17/`."

---

## 7. Protected-surface policy

Three dispositions, built from audit couplings C1–C4 and finding S1:

### 7.1 MUST NOT CHANGE (frozen machine contract)

Serialized VALUES and vocabularies:

- Model letters `"A"/"B"/"C"`; placement-mode strings (`viewBox-meet/slice/none`,
  `no-viewBox-1to1`, `nested-canvas`, `image-contain`); `BodyKind` values
  (`svg/png/textual/video` incl. retained `"video"`); `RendererName`/renderer
  enumerants `a|b|blind|native`; verdict/agreement strings (`a==blind`, `a==native`,
  `blind==native`, `!=` forms); provenance-label strings of taxonomies A–D.
- Diagnostic statuses `PASS|FAIL|BLOCKED|OPEN_FENCE`; all 20 diagnostic codes;
  `RequirementId` values `R-S1…R-S8b`; exclusions `X1–X8`; cases `T01–T15`; dormant
  `RF01–RF04`; epistemic layers `L0–L6`; ambiguity id `AMB-N6-1` and its verbatim T12
  expected-text context (U6 forbids touch).
- Classifier labels `I-REGION-VIEWPORT`, `I-INTRINSIC-STRETCH`, `I-OBJECTFIT-CONTAIN`,
  `I-NATURAL-CENTERED`, `I-NATURAL-TOPLEFT` (frozen evidence vocabulary; also the
  pinning target of §7.3).
- `VALIDATOR_VERSION = "n6-resource-validator@1.0.0"`; suite fixture ids
  `n6-t01…n6-t15` + derived canvas/annotation ids; `matrixRows` JSON presentation
  literals; `recordedAmbiguities` content.
- Evidence-string values such as `"experiment": "E15"`, `"tolerances": "E15 verbatim…"`,
  `"E17/N1 cross-engine replication…"`, `intrinsics-<engine>.json` keys.

URL/routing/browser surfaces:

- Query parameters and value grammars: `?exp=` (`1..7`, `5a/b/c`, `7-animate`, `text`,
  `security`, alias `"6"`, `case1..13`, `e14-caseNN-x`, `e16-caseNN-x`), `?renderer=`,
  `?sanitize`, `?fit`, `?aspect`, `?t`.
- `MANIFEST_MAP` keys (`"6"`, `text`, `security`) and the `exp${exp}.json` /
  `caseN.json` construction; manifest-dir literals `"e14"`/`"e16"` in boot routing.
- Browser-global API keys: entire `window.__lab` surface including `e14Resolved`,
  `e14Compare`, `parity`, `parityBlind`, `activeIds`, … ; `window.__e15`;
  `window.__e17` (coupling C1: page↔Playwright `page.evaluate` contracts).
- Events `lab-ready`, `e15-ready`; CSS/id hooks `.e15-box`, `.e15-row`,
  `#e15-probes`, `#e17-probes`, `.ar-*`, `.viewport`; HUD text format.
- Routes `/e15-lab.html`, `/e17-lab.html` and their public HTML filenames (policy:
  KEEP — see §15/Q1); mounts `<script src="/src/…">` update only as the atomic shadow
  of a source-path move (§7.2).
- Playwright project names `chromium/firefox/webkit`.

Filename grammars (planes 4–5):

- Entire `evidence/` tree: directories `evidence/{observations,screenshots,blind-comparison,e14,e15,e16,e17,n6,viewer}`; artifacts incl.
  `case-T*.json`, `cmp-e16-*__*.json`, `modeA-twins.json`, `geometry-matrix.json`,
  `intrinsics.json`, `summary.json`, `conformance-matrix.json`, `cross-engine-matrix.json`,
  `viewer-matrix.json`, observations names from `record()` first args
  (`e14-case06-native`, `e16-case05-fit-separation`, `exp1`, `parity-*`, …),
  screenshots incl. legacy typos (`epx6-*.png`).
- `OUT_DIR = "evidence/n6"` literal; every writer's evidence-path literal.
- Fixture families: `public/manifests/**` (incl. `case6` unpadded vs `case06` padded —
  never unified, N-07; `manifests/e14|e16|n2/**`, `exp*.json`, `viewer-plain.json`),
  `public/svg/**` (variant grammar `e15-vb1000.svg`…, landmark contracts
  `e15-landmarks.json`/`e16-landmarks.json`/`e17-landmarks.json`, region keys
  `full/half/square500/rect43`, `e14-red-circle.png`, `e17-vb1000-max.svg`),
  `public/video/*.mp4`.
- Family ids in `fixture-provenance.json` (`exp-era-root`, `case-blind-1-13`,
  `e14-family`, `e15-family`, `e16-family`, `e17-addition`, `n2-manifests`,
  `video-fixture`) — append-only schema, ids immutable.
- Probe slugs/probeIds (`N2-ramp-v#-…`) in viewer evidence.
- Historical document/record FILENAMES (`e14-report.md`, `n6-implementation-report.md`,
  `phase-*-….md`, …) — citation coordinates of frozen records.

### 7.2 CAN CHANGE IF ATOMIC (internal names with cross-file reach; no serialization)

- All TypeScript TYPE/FUNCTION/MODULE names (`E14Model`, `E15Embedding`,
  `resolveE14Manifest`, `compareE14`, …): zero occurrences anywhere in `evidence/`
  (audit S1). Rename rule: one change-set spanning the definition and ALL importers;
  exact target spellings fixed by approved §9 rows (§11.2 proposals; final spelling is
  execution detail once the row lands).
- Directory/script/test/config FILENAMES per the family tables in §11, honoring C4:
  spec filename ↔ playwright `testMatch` regex ↔ `outputDir`; module dir ↔ importing
  tests/scripts; page source path ↔ public HTML mount. Routes themselves stay (§7.1).
- Comment/describe-string PROSE in migrated files (behavior-safe; headers gain the
  §6.4 provenance line).
- Deliberate KEEP-within-this-class (recommended, see §15/Q2): the two bridge function
  names `e14ToResolvedA`/`e14ToBlindOverlay` — internal to `main.ts`, no test imports
  them, but their names are cited by the ratified frozen H.2-D record; keeping them
  preserves name-level traceability with the ratification.

### 7.3 PINNED MIRRORS (never rename)

Interpretation function names `iRegionViewport`, `iIntrinsicStretch`,
`iObjectFitContain`, `iNaturalTopLeft`, `iNaturalCentered` are deliberate mirrors of
the frozen `I-*` labels via `INTERPRETATION_NAMES[fn.name] ?? fn.name`
(`src/e17/classify.ts:198`; coupling C2). Renaming them would decouple name↔label
mirroring and risk accidental evidence-vocabulary drift if the map keys lagged. Policy:
these names are SEMANTIC VOCABULARY PINNED TO MACHINE LABELS — do not rename; do not
"improve" independently of the frozen labels.

### 7.4 NORMAL INTERNAL NAME (free within a file)

Local variables, private helpers, inline comment phrasing, HUD copy details — ordinary
code hygiene, no coupling rules beyond typecheck.

---

## 8. E14 namespace decision (the load-bearing call)

### 8.1 Observed dependency facts (deciding material)

- `src/e14/types.ts` is a leaf module consumed by: `reference/lib/e14.ts`,
  `blind/e14.ts`, `native/resolver.ts`, `native/stage.ts`, `main.ts` (both bridges +
  `__lab` typing), `e16/comparison.ts`, `e14/comparison.ts`, unit tests. It IS the
  ratified interchange-record tier (H.2-D §4.1).
- `src/e14/comparison.ts` imports only `./types.ts` (+ reference types for naming) and
  is consumed by `main.ts` (`__lab.e14Compare`) and `tests/e14-comparison.test.ts`
  (writer of `evidence/e14/`), plus e2e specs through `__lab`.
- H.2-D observed: "no interchange machinery exists over any other record" —
  `compareE14` is defined ONLY over the interchange record; the three-way agreement
  claims in `evidence/e14|e16/` are keyed to these records.
- The record's OWN header self-describes as "shared evidence / comparison data model":
  the record exists FOR cross-consumer agreement measurement.
- `src/comparison/` (H.2-B charter) hosts the blind-vs-reference SEMANTIC DIFF harness
  defined over a DIFFERENT pair of records (legacy substrate + consumer-private model)
  and carries the blinding-protection charter.

### 8.2 Options evaluated

**Option A — umbrella `src/composition/` containing both modules** (types.ts +
comparison.ts move together; internal filenames initially unchanged).

- Semantic accuracy: "composition" names the DOMAIN (glossary C1.a composition models;
  the record describes Models A/B/C). The directory = "the composition-domain record
  world": its data model and the agreement checking defined over it. Sub-roles are
  advertised by module names/headers (rule §3.3.2), as `src/primitives/` already mixes
  classes 1–2 under header discipline.
- Dependency clarity: preserves the tight definitional pairing (comparison imports the
  record it diffs); zero cross-directory fragmentation; single atomic move.
- Consistency with H.2-D: the ratified tier gets its ratified name ("interchange
  record" tier) inside a domain-named namespace; bridges stay in `main.ts` (H.2-D §3.6
  rejected relocation).
- Impact on existing `src/comparison/`: NONE — no merge, no shared code, charters stay
  distinct (N-06: same concept-TYPE, different era mechanisms over different record
  worlds; merging would falsely imply one mechanism).
- Historical traceability: header provenance line + §9 mapping rows + frozen reports.
- Migration complexity: LOWEST of the options (one dir move + importer sweep).
- False-shared-semantics risk: LOWEST — the record's neutrality is its defining
  property and stays loudly documented; nothing here makes the record a renderer input
  beyond today's adapters.

**Option B — split**: `src/composition/` (record) + agreement machinery elsewhere
(either into `src/comparison/` or a new `src/agreement/`).

- Semantic accuracy: highest per-module precision.
- Dependency clarity: WORSE — splits an inseparable definitional pair; creates a
  single-importer module directory (`agreement/`) with no reuse horizon (the exact
  anti-pattern H.2-D §3.6 rejected for the bridges), or places `compareE14` beside a
  differently-scoped mechanism whose co-location implies unifiable machinery.
- Impact on `src/comparison/`: variant B-1 (merge there) conflates two record worlds
  under one roof and dilutes H.2-B's blinding-charter namespace — rejected on
  architecture, not aesthetics (audit's explicit warning stands).
- Migration complexity/risk: higher (two namespaces, more importer churn, more review
  surface) for zero behavioral gain.

**Option C — one renamed namespace with renamed internals** (e.g. `types.ts →
record.ts`, `comparison.ts → agreement.ts`).

- Same dependency shape as A with extra filename churn. `record.ts` has genuine
  appeal (encodes Gap-A term), but `types.ts` is conventional and the ratified term
  can live in the header; renaming adds diff noise to an already-wide importer sweep.

### 8.3 Decision

**Option A — migrate `src/e14/` → `src/composition/` as ONE namespace containing both
responsibilities.** Do NOT merge anything into `src/comparison/`; do NOT split.
Both modules' headers state their role and governance class explicitly (interchange
record = shared infrastructure; comparison = analysis infrastructure/class 4). Optional
later refinement (separate micro-change-set, only if a human wants it): rename
`types.ts` → `record.ts` inside `src/composition/`; default is NO.

Rationale in one line: the record and its agreement comparison are one dependency unit
bound to one ratified tier — splitting them fragments a definitional pair, and merging
the comparison into `src/comparison/` would conflate mechanisms over different record
worlds (H.2-D separation stands).

---

## 9. E15 / E16 / E17 / N6 decisions

### E15 — `src/embedding-semantics/` (CONFIRMED)

Canonical living namespace for the concept family. Exact scope:

- `analysis.ts` — embedding-semantics ANALYSIS INFRASTRUCTURE (class 4): embedding
  channels, landmark-contract shapes, candidate interpretations, legality matrix,
  region/variant tables. Stays the single shared analysis module (consumed by
  cross-engine classify/page).
- `page.ts` — the measurement-matrix PAGE belongs IN the namespace: it is the
  measurement apparatus OF this concept family (same pattern as `classify.ts` living in
  cross-engine). It is harness/measurement apparatus by role (Gap C), not analysis
  infrastructure; its header says so. Route `/e15-lab.html`, `__e15`, CSS hooks stay;
  only the public HTML `<script src>` mount updates when the module moves (atomic).
- Evidence/test apparatus NOT in scope of the namespace: `tests/e2e/e15.spec.ts`
  (browser-dependent writer of `evidence/e15/`), fixture family `e15-family`,
  evidence grammar `evidence/e15/` — all protected or separately mapped.

### E16 — `src/nested-composition/` (CONFIRMED WITH SCOPE NOTE)

- `comparison.ts` — pure fit-analysis helpers over nested-Canvas readings; class 4
  analysis infrastructure; imports the LIVING interchange tier (`e14/types` → later
  `composition/types`), which is precisely why it must be treated as living code, not
  historical apparatus.
- Scope boundary: the directory contains ONLY analysis infrastructure. Evidence/test
  apparatus lives outside: `tests/e16-comparison.test.ts` (vitest writer of
  `evidence/e16/`, incl. `modeA-twins.json`), e2e spec, `e16-family` fixtures,
  `evidence/e16/` grammar.
- Adjacency note: `composition` vs `nested-composition` are distinct concepts
  (interchange-record world vs fit-analysis of Canvas-as-body readings); the glossary
  distinguishes Composition model from Nested Canvas. Risk of confusion is mitigated by
  headers + index pointers; flagged in §15/Q7 as accepted residual.

### E17 — `src/cross-engine/` (CONFIRMED WITH ROLE SPLIT)

Four distinct things, explicitly separated:

1. Classifier infrastructure: `classify.ts` (parameterized `makeClassifier`; thresholds
   verbatim from embedding-semantics analysis — dependency PRESERVED and documented, not
   hidden). Class 4.
2. Measurement page: `page.ts` — supplementary cells (xMaxYMax variant) absent from the
   embedding-semantics matrix; mirrors that page deliberately so ONE classifier scores
   both; shares `.e15-box/.e15-row` hooks BY DESIGN (protected). Route `/e17-lab.html`,
   `__e17` stay.
3. Cross-engine test: `tests/e2e/e17.spec.ts` → `cross-engine.spec.ts` + dedicated
   tri-engine config `playwright.e17.config.ts` → `playwright.cross-engine.config.ts`
   (`testMatch`/`outputDir` move atomically; project names untouched). Browser suite —
   not run routinely (P-7).
4. Historical experiment identity: "cross-engine replication (E17/N1)" persists in
   frozen evidence values, reports, and register rows — never edited.

Plus the evidence aggregator: `scripts/e17-aggregate.mjs` → `cross-engine-aggregate.mjs`;
it READS only frozen `evidence/e17/` filenames and WRITES `cross-engine-matrix.json`/
`summary.json` with unchanged `"experiment"` values — rename must not alter any literal.

### N6 — `src/validator/` (CONFIRMED; SUITE STAYS)

- `validator` is sufficient and correct: the directory implements glossary Validator
  (C3) — orchestration, six requirement-predicate modules, owned output vocabulary.
- The suite (`suite.ts`, execution encoding of T01–T15) MOVES WITH the validator: it is
  stage 3 of the same edit-flow chain, imported by BOTH consumers
  (`tests/n6-conformance.test.ts`, `run-n6-suite.mts`). Splitting it off would create a
  one-file namespace whose only consumers are validator consumers — ownership, not
  looks, decides (task constraint honored).
- "Conformance stack" remains the CHAIN concept (profile → matrix → suite → generator →
  evidence); its executable half lives in `src/validator/` + `run-validator-suite.mts`;
  its normative half remains the documents. No new namespace needed for the chain.
- Frozen payloads carried unchanged: `VALIDATOR_VERSION` string, `n6-tXX` fixture ids,
  `AMB-N6-1` context, `OUT_DIR="evidence/n6"`, `matrixRows` presentation literals.
- Pointer obligations at execution (mapping-first): spec Appendix/§8 name
  `src/n6/types.ts` as output-vocabulary owner → pointer updates land with the approved
  §9 rows; consolidation-map citations stay frozen (new phase record notes the new path).

---

## 10. Initial-cycle taxonomy (exp1..7, parity, security, text, viewer, blind cases)

Investigated per brief; NOT renamed. Method: read each spec header/body at HEAD; cross-
checked fixtures (`fixture-provenance.json` family `exp-era-root`), routing
(`MANIFEST_MAP`, `exp${exp}.json` construction), and evidence writers.

### 10.1 What each actually tests

| Spec | Tests (observed) | Uses |
|---|---|---|
| `exp1.spec.ts` | temporal static overlay: circle visible only inside [10,15) — half-open interval visibility | `?exp=1`; `expectParityClean` |
| `exp2.spec.ts` | SVG primitives fixture paints expected elements (DOM presence; screenshot primary) | `?exp=2` |
| `exp3.spec.ts` | AnnotationPage order acts as z-order (rect<circle<arrow<text stacking) | `?exp=3` |
| `exp4.spec.ts` | spatial targeting `xywh=`/`xywh&t=`: Renderer A region-painted geometry == Renderer B baked-position (<2.5 canvas units) | `?exp=4&renderer=a|b` |
| `exp5.spec.ts` | coordinate systems: same circle, three viewBoxes — must a profile require user space == Canvas space? | `?exp=5a|5b|5c` |
| `exp6.spec.ts` | aspect ratio: overlay tracks DISPLAYED (letterboxed) video content; centre invariant across viewport shapes | `?exp=6&aspect=…` |
| `exp7.spec.ts` | temporal movement: external keyframe timeline (NON-STANDARD) deterministic vs SVG `<animate>` counterpart | `?exp=7`, `?exp=7-animate`, keyframes JSON |
| `parity.spec.ts` | resolved-set equality A==B field-by-field for raw exps 1,2,3,5a/b/c,6,7 — "does the standards representation carry enough information" | `__lab.parity()` |
| `security.spec.ts` | sanitizer allowlist strips dangerous SVG elements; sanitize on/off DOM/exec evidence | `?exp=security&sanitize=` |
| `text.spec.ts` | `<text>/<tspan>` font-dependence vs path-outlined glyph metrics + temporal switching | `?exp=text` |
| `viewer.spec.ts` | third-party viewer smoke: Ramp plays plain video Canvas locally (network-dependent) | unpkg bundle |
| `n2-viewer.spec.ts` | deployed-consumer probe matrix V1–V7/M1–M3 (parse/render outcomes as data) | probe manifests |

### 10.2 Classification

These are **historical experiments whose reproducibility apparatus remains ACTIVE around
frozen surfaces** — a DIFFERENT class from E14–E17:

- No living SHARED INFRASTRUCTURE hides behind their filenames (each spec is
  self-contained apparatus driving the legacy display substrate + oracle — both staying
  put). By contrast E14–E17 names conceal living, cross-imported infrastructure.
- Their subject identifiers are frozen URL VALUES and fixture grammars; renaming specs
  cannot remove era vocabulary from the system because `?exp=1..7` must survive.
- Their evidence (`evidence/observations/exp*.json`, `parity-*.json`) is frozen grammar.

Therefore: treat as a separate class — **initial-cycle reproducibility apparatus** —
NOT candidates for the E14–E17-style namespace migration.

### 10.3 Proposed semantic slugs (mapping/prose only; NOT rename authorization)

`exp1` temporal-overlay-visibility · `exp2` svg-primitive-rendering · `exp3`
annotation-order-z-order · `exp4` spatial-region-targeting · `exp5a/b/c`
viewbox-coordinate-independence · `exp6` aspect-ratio-tracking · `exp7`
keyframe-movement-nonstandard · `parity` resolved-set-parity · `security`
sanitizer-allowlist · `text` text-metrics-font-independence · `viewer`
third-party-viewer-smoke · `n2-viewer` consumer-probe-matrix.

These slugs serve §3.2 prose references and potential future registry rows. Recommendation: leave spec FILENAMES as-is (process-local harness names; zero semantic payoff,
nonzero churn; root playwright config pins nothing for them). If a human later wants
slug filenames anyway, it is a self-contained cosmetic change-set (no testMatch/outputDir
couplings for these specs in the ROOT config; `parity` writes `evidence/observations/`).

### 10.4 Protected identifiers in this class

`?exp=` value set (incl. alias `"6"` → `exp1.json`); manifest filenames
`exp*.json`, `exp-text.json`, `exp-security.json`, `case1..13.json`, `viewer-plain.json`;
fixture paths `/svg/exp*-*.svg`, `/svg/security-*.svg`, `/svg/text-*.svg`; keyframes
JSON; evidence observation names; screenshot names; `MANIFEST_MAP` keys.

---

## 11. Full migration mapping

Kind codes: DIR=directory, MOD=module file, SCRIPT=script, TEST=test file, CONFIG=config,
PAGE=harness page/html, SYM=type/function symbol rename, KEEP=no change.
Risk: LOW=mechanical import sweep; MED=multi-file atomic sweep w/ evidence-writer
involvement; HIGH reserved (none proposed). "Hist. preserved?" = whether historical
lineage remains reachable after the rename (headers/registry/reports).

### 11.1 Source namespaces

| Current | Proposed | Kind | Semantic reason | Hist. preserved? | Machine coupling | Risk | Notes |
|---|---|---|---|---|---|---|---|
| `src/n6/` (9 files) | `src/validator/` | DIR | Glossary Validator (C3); audit CONFIRMED w/ qualification | Yes: headers keep provenance lines; registry/report citations intact | `VALIDATOR_VERSION` value, `n6-tXX` ids, `AMB-N6-1` context UNTOUCHED; importers: 1 test + 1 script follow atomically | LOW-MED | Suite moves WITH validator (edit-flow stage 3). Vocabulary-owner pointer (spec Appendix/§8 → `src/validator/types.ts`) updated via approved §9 rows, not silently |
| `src/e14/` (types.ts, comparison.ts) | `src/composition/` | DIR | Interchange-record tier (H.2-D) + its agreement machinery = one dependency unit (§8) | Yes: headers + H.2-D citations + mapping rows | Type names inside = SYM (S1-safe, atomic); `__lab.e14Resolved/e14Compare` KEYS untouched; verdict strings untouched; `evidence/e14/` untouched | MED | Option A decision. NOT merged into `src/comparison/`. Importers: main.ts, 3 consumer adapters, native/stage.ts, e16 module, unit tests, 3 e2e specs |
| `src/e15/` (analysis.ts, page.ts) | `src/embedding-semantics/` | DIR | Embedding-semantics concept family (audit CONFIRMED) | Yes: headers + e15-report citations | `__e15`, route, CSS/event hooks untouched; public HTML mount updates same change-set; `src/e17/*` imports updated in THIS family's change-set | MED | Page stays in namespace (measurement apparatus of the family). `INTERPRETATION_NAMES` VALUES untouched; `i*` functions PINNED (§7.3) |
| `src/e16/` (comparison.ts) | `src/nested-composition/` | DIR | Nested-Canvas fit-analysis concept (audit CONFIRMED w/ qualification) | Yes: headers + e16-report citations | Imports `../e14/types` → repointed during composition family; sole vitest consumer follows; `evidence/e16/` untouched | LOW | Living class-4 module, NOT historical apparatus |
| `src/e17/` (classify.ts, page.ts) | `src/cross-engine/` | DIR | Cross-engine replication concept (audit CONFIRMED w/ qualification) | Yes: headers + e17-report + evidence values `"E17/N1…"` | Route/`__e17`/shared CSS hooks untouched; HTML mount updates; e15-analysis import already repointed by earlier family | LOW-MED | `makeClassifier` parameterization preserved; e15 dependency documented, not hidden |

### 11.2 Representative symbol migrations (execution confirms exact spellings per approved §9 rows; mechanical prefix/domain swap, suffixes kept)

| Current | Proposed | Kind | Semantic reason | Hist. preserved? | Machine coupling | Risk | Notes |
|---|---|---|---|---|---|---|---|
| `E14Model` | `CompositionModel` | SYM | Axis-worded glossary concept; letter VALUES `"A"/"B"/"C"` unchanged | Yes | Values serialize; NAME does not (S1) | LOW | Spec §5.1's "machine encoding E14Model persists" was Phase-F-era description, not immunization (inventory §0 ruling) |
| `E14Overlay`/`E14Manifest`/`E14Rule`/`E14CanvasInfo`/`E14SvgAttrs`/`E14Placement(Mode)`/`E14NestedMap`/`E14Security` | `Composition*` equivalents | SYM | Domain prefix swap | Yes | None (S1) | LOW | Single change-set with all importers |
| `resolveE14Manifest` / `resolveBlindE14Manifest` | `resolveCompositionManifest` / `resolveBlindCompositionManifest` | SYM | Consumer entry points onto the interchange record | Yes | None | LOW | `resolveNativeManifest` already clean — KEEP |
| `compareE14` | `compareCompositionRecords` (spelling confirmable) | SYM | Agreement comparison over composition records | Yes | Exposed via `__lab.e14Compare` KEY (unchanged); return shape unchanged | LOW | Verdict strings untouched |
| `E15Embedding` | `EmbeddingMechanism` | SYM | Exactly glossary C1.c "embedding mechanism" | Yes | Channel VALUE strings unchanged | LOW | |
| `E15Rect`/`E15Landmarks`/`E15SvgVariant`/`E15Map`/`E15Measured`/`E15CellResult` | measurement/landmark-concept names (spellings fixed at execution) | SYM | Domain naming | Yes | None | LOW | e.g. landmark-contract shape per glossary Landmark contract |
| `iRegionViewport` … `iNaturalCentered` | **KEEP — PINNED** | — | Mirrors of frozen `I-*` labels (§7.3) | n/a | `INTERPRETATION_NAMES[fn.name]` introspection | — | Never rename independently of frozen labels |
| `e14ToResolvedA` / `e14ToBlindOverlay` | **KEEP (recommended)** | — | Traceability with ratified frozen H.2-D record (§7.2 exception) | Yes — IS the traceability | None (main.ts-local) | — | Human may override; if renamed, same-commit H.2-D-pointer note in a NEW phase record |

### 11.3 Scripts

| Current | Proposed | Kind | Semantic reason | Hist. preserved? | Machine coupling | Risk | Notes |
|---|---|---|---|---|---|---|---|
| `scripts/run-n6-suite.mts` | `scripts/run-validator-suite.mts` | SCRIPT | Edit-flow stage-4 generator of the validator stack | Yes | `OUT_DIR="evidence/n6"` literal UNTOUCHED; `matrixRows` literals UNTOUCHED; imports follow validator family | LOW | Consolidation-map cites old path — frozen doc stays; new phase record notes successor path |
| `scripts/build-e14-fixtures.mjs` | `build-composition-fixtures.mjs` | SCRIPT | Composition fixture builder | Yes | Output grammar `e14-caseNN-*` etc. UNTOUCHED | LOW | |
| `scripts/build-e15-fixtures.mjs` | `build-embedding-semantics-fixtures.mjs` | SCRIPT | Embedding variants builder | Yes | Variant/landmark outputs UNTOUCHED | LOW | |
| `scripts/build-e16-fixtures.mjs` | `build-nested-composition-fixtures.mjs` | SCRIPT | Nested-composition cases builder | Yes | Outputs UNTOUCHED | LOW | |
| `scripts/build-e17-fixtures.mjs` | `build-cross-engine-fixtures.mjs` | SCRIPT | xMaxYMax variant builder | Yes | Outputs UNTOUCHED | LOW | |
| `scripts/build-n2-fixtures.mjs` | `build-consumer-probe-fixtures.mjs` | SCRIPT | Consumer-probe manifests (§5.5 Consumer probe) | Yes | Probe-manifest slugs UNTOUCHED; cites e14/e15/e16 fixture paths (frozen) | LOW | |
| `scripts/e17-aggregate.mjs` | `cross-engine-aggregate.mjs` | SCRIPT | Cross-engine evidence aggregator (P-4 producer) | Yes | READS frozen `evidence/e17/*`; WRITES `cross-engine-matrix.json`/`summary.json` with unchanged `"experiment"` values | LOW | Not run unless protocol-authorized regeneration |
| `scripts/build-fixtures.mjs`, `generate-video.mjs` | KEEP | SCRIPT | Clean names | — | Frozen outputs | — | Inventory CONFIRMED keep |

### 11.4 Unit tests

| Current | Proposed | Kind | Semantic reason | Hist. preserved? | Machine coupling | Risk | Notes |
|---|---|---|---|---|---|---|---|
| `tests/n6-conformance.test.ts` | `tests/validator-conformance.test.ts` | TEST | Black-box suite over the validator | Yes | T01–T15 ids untouched; writes NO evidence (script writes it) | LOW | describe-string prose migrates; expectations untouched |
| `tests/e14-comparison.test.ts` | `tests/composition-comparison.test.ts` | TEST | Composition-record agreement tests | Yes | EVIDENCE-PRODUCING → `evidence/e14/`: run focused + byte-compare (P-2/P-7) | MED | Fixture-path literals (`manifests/e14`, `svg/e14`) UNTOUCHED |
| `tests/e16-comparison.test.ts` | `tests/nested-composition-comparison.test.ts` | TEST | Fit-analysis tests | Yes | EVIDENCE-PRODUCING → `evidence/e16/`: focused run + byte-compare | MED | `cmp-*` filename construction UNTOUCHED |
| `tests/blind*.test.ts`, `iiif`, `selectors`, `svg`, `timing` | KEEP | TEST | Clean | — | blind-comparison writes `evidence/blind-comparison/` (path unchanged) | — | |

### 11.5 E2E tests and configs

| Current | Proposed | Kind | Semantic reason | Hist. preserved? | Machine coupling | Risk | Notes |
|---|---|---|---|---|---|---|---|
| `tests/e2e/e14.spec.ts` | `tests/e2e/composition.spec.ts` | TEST | Composition-case browser verification | Yes | `__lab.e14Resolved/e14Compare` KEYS unchanged; `record("e14-case06-*",…)` observation names UNCHANGED; root config has no testMatch pin | MED | Browser suite — static verification by default |
| `tests/e2e/e15.spec.ts` | `tests/e2e/embedding-semantics.spec.ts` | TEST | Matrix measurement | Yes | navigates `/e15-lab.html` (route KEPT); `__e15` calls unchanged; writes `evidence/e15/*` — DO NOT RUN routinely | MED | |
| `tests/e2e/e16.spec.ts` | `tests/e2e/nested-composition.spec.ts` | TEST | Nested-composition checks | Yes | `__lab.*` keys unchanged; record names unchanged | MED | |
| `tests/e2e/e17.spec.ts` | `tests/e2e/cross-engine.spec.ts` | TEST | Tri-engine replication run | Yes | drives BOTH lab pages (`__e15`,`__e17`) — atomicity constraint; couples to dedicated config | MED | Config must move in SAME change-set |
| `tests/e2e/n2-viewer.spec.ts` | `tests/e2e/consumer-probe.spec.ts` | TEST | Deployed-consumer probes | Yes | couples to dedicated config; network-dependent — do not run | MED | |
| `playwright.e17.config.ts` | `playwright.cross-engine.config.ts` | CONFIG | Dedicated tri-engine runner | Yes | `testMatch:/cross-engine\.spec\.ts$/` + `outputDir ./test-results/cross-engine` move together; project names untouched | LOW | Header comment prose migrates |
| `playwright.n2.config.ts` | `playwright.consumer-probe.config.ts` | CONFIG | Dedicated probe runner | Yes | testMatch/outputDir move together | LOW | |
| `tests/e2e/exp1..7`, `parity`, `security`, `text`, `viewer`, `blind` specs | KEEP (§10 class decision) | TEST | Reproducibility apparatus around frozen `?exp=` surfaces | n/a | Frozen values everywhere | — | Slugs recorded for prose only |
| `tests/e2e/utils.ts` | KEEP (helpers clean; `record()` grammar frozen) | TEST | Harness utils | — | `record()` observation-name grammar frozen | — | |

### 11.6 Pages and app shell

| Current | Proposed | Kind | Semantic reason | Hist. preserved? | Machine coupling | Risk | Notes |
|---|---|---|---|---|---|---|---|
| `public/e15-lab.html` | KEEP filename/route | PAGE | Route = stable dev-surface key (policy §15/Q1 lean-keep) | Yes | route string in e15.spec/e17.spec; event `e15-ready`; `__e15` | — | Only inner `<script src>` mount updates when `src/e15/page.ts` moves |
| `public/e17-lab.html` | KEEP filename/route | PAGE | Same policy | Yes | route in e17.spec; `__e17`; `#e17-probes` | — | Mount updates with cross-engine family |
| `src/main.ts` | KEEP | MOD | Conventional entry-point name; carries retired tokens only as protected VALUES/routes | — | Everything routed/globaled through it | — | Bridge functions: §7.2 recommended-keep exception |
| `index.html`, `style.css`, `vite-env.d.ts`, infra configs | KEEP | — | Clean (audit) | — | — | — | package.json descriptor = U1, out of scope |

### 11.7 Explicit SHOULD-NOT-RENAME register (beyond §7.1)

- Clean namespaces: `src/reference/`, `src/blind/`, `src/native/`, `src/primitives/`,
  `src/comparison/`, `src/oracle/` (inventory B.1 CONFIRMED; H.2-A/B charters).
- `src/main.ts` and its `__lab` API surface.
- All frozen evidence/fixture trees and family ids (§7.1).
- `i*` interpretation functions (pinned mirrors, §7.3).
- Bridge functions (recommended keep, §7.2/§15/Q2).
- Historical document filenames and phase-record filenames.
- `docs/blind-interpretation-rules.md`, `docs/ambiguities.md` contents (L0).
- Playwright engine project names; `chromium/firefox/webkit`.
- Root `playwright.config.ts`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`.

---

## 12. Documentation update map (executed AFTER renames; nothing edited now)

Sequencing respects frozen-record rules: pointers and living docs update; frozen records
get successor phase records instead of edits.

| Document | Action | When | Authority |
|---|---|---|---|
| `terminology-specification.md` | PRE-MIGRATION: append §9 mapping rows for every executed path (content = §11 here, finalized); add Gap A/B/C glossary entries (§5 here) into §5/§6-adjacent sections; POST-MIGRATION: pointer updates where owning status attaches to paths (`Validator` implementation site; Appendix row for the output-vocabulary owner file; §8 owner citation) | Rows+glossary BEFORE any rename (mapping-first, §11.3/§12.5); pointer updates with the relevant family | Spec's own maintenance rules; mutable proposal artifact |
| `terminology-migration-inventory.md` | Mark rows executed; resolve its §G ambiguities per this artifact (G.1 answered: living namespaces w/ frozen output grammars; G.2: slugs minted as prose-only, filenames kept; G.3: answered by audit S1; G.4: routes KEEP; G.5/G.6/G.7: §15) | After approval; after each family | Working inventory (mutable) |
| `terminology.md` | Registry: add initial-cycle slug rows + new namespace cross-references; AFTER full migration reduce to pointer + historical appendix (spec §11.5) | Post-migration | Registry maintenance rules (§7 there) |
| `documentation-conventions.md` | CONTROLLED: pointer-only corrections where definition sites moved (T-1 cites `src/e14/types.ts` as `E14Model` site; T-6 list unchanged — those IDs persist) | With the family that moves the cited site | Controlled mutability |
| `current-state-index.md` | Pointer edits: add this taxonomy artifact; post-migration layout pointers; open-item updates (Q1 routes policy outcome) | Now (this artifact exists) + post-migration | Pointer-only rule |
| `consolidation-map.md` | DO NOT EDIT (frozen). Successor phase record documents: §1.4 "frozen surfaces" wording superseded for e14–e17 (per audit); old script/path citations | New record at migration time | AGENTS.md historical-records rule; precedent cleanup-checklist item 5 |
| `cleanup-checklist.md` | Fold README refresh (item 1) INTO post-migration README refresh (single edit; avoids double-touching); annotate item 2/3 handling | At planning | Working checklist (mutable) |
| `README.md` | ONE combined refresh AFTER renames land: layout block (new tree), quick start (describe params, don't change them), validator naming per §6 examples | Post-migration | Cleanup item 1 + G.5 resolution |
| `AGENTS.md` | Update infrastructure list paths + any path-bearing examples when families execute | With last family (single edit) | Living instructions |
| `docs/prompts/external/session-handoff-example.md` | Needs scope ruling (G.6/§15/Q5); recommendation: treat as living template, refresh with renames | Post-ruling | — |
| NEW phase record(s) | One cumulative "terminology migration executed" record (or per-family) documenting: executed §9 rows, successor paths for frozen citations, verification results | At migration | AGENTS.md phase discipline |
| Frozen L0/L5/L2/L3/L4 records, evidence-policy, phase records A–H.2, G audit, G.1 | NEVER EDITED | — | Frozen/controlled regimes |

---

## 13. Migration sequencing (future work; NOT started)

Per-family change-set = ONE commit = rollback boundary. Order chosen so every commit
compiles green and blast radius ascends; `composition` deliberately LAST as the largest
unit, executed after the pattern is proven.

Precondition for ANY family: approved §9 rows + glossary additions landed in
`terminology-specification.md` (mapping-first), and human sign-off on §15 items Q1–Q6.

| Step | Family | Files involved | Coupling constraints (C1–C4) | Evidence constraint | Verification | Rollback |
|---|---|---|---|---|---|---|
| 0 | Docs precondition | `terminology-specification.md` (append-only §9 rows + glossary entries) | none | none | doc review | single commit |
| 1 | **validator** | `src/n6/*` → `src/validator/*`; `tests/n6-conformance.test.ts` → `validator-conformance.test.ts`; `scripts/run-n6-suite.mts` → `run-validator-suite.mts`; comment prose | C4 (dir+importers one set); C3 values pinned | NONE written by vitest; script NOT run | check; focused n6 suite; full unit + `git status --short evidence` (must be empty); build | revert commit |
| 2 | **embedding-semantics** | `src/e15/*` → `src/embedding-semantics/*`; `public/e15-lab.html` mount line; `src/e17/{classify,page}.ts` import lines; `tests/e2e/e15.spec.ts` → `embedding-semantics.spec.ts` | C1 globals untouched; C2 labels untouched; C4 page-mount-spec triangle | Browser suite NOT run (`evidence/e15/` untouched) | check; build; grep route/global literals; full unit + evidence status | revert commit |
| 3 | **cross-engine** | `src/e17/*` → `src/cross-engine/*`; `public/e17-lab.html` mount; `tests/e2e/e17.spec.ts` → `cross-engine.spec.ts`; `playwright.e17.config.ts` → `playwright.cross-engine.config.ts` (testMatch+outputDir); `scripts/e17-aggregate.mjs` → `cross-engine-aggregate.mjs` | C4 spec↔config↔mount one set; drives BOTH pages (spec internals reference `__e15` too) | Aggregator NOT run; browser suite NOT run | check; build; grep config testMatch/outputDir coherence; full unit + evidence status | revert commit |
| 4 | **nested-composition** | `src/e16/comparison.ts` → `src/nested-composition/comparison.ts`; `tests/e16-comparison.test.ts` → `nested-composition-comparison.test.ts` | C4; imports `../e14/types` (old path still valid at this point) | EVIDENCE-PRODUCING: focused run REQUIRED; byte-compare `evidence/e16/` against HEAD (expected identical); else investigate, never absorb churn | check; focused suite; hash compare; full unit + evidence status; build | revert commit |
| 5 | **composition** (paths) | `src/e14/*` → `src/composition/*`; import sweeps: `main.ts`, `reference/lib/e14.ts`, `blind/e14.ts`, `native/resolver.ts`, `native/stage.ts`, `src/nested-composition/comparison.ts`, unit tests, `tests/e2e/{e14,e16,cross-engine}.spec.ts` (paths only) | C1 `__lab` keys untouched; C4; adapter entry-point names may rename here or in 5b | EVIDENCE-PRODUCING unit suite (`composition-comparison.test.ts`): focused run + byte-compare `evidence/e14/` | check; focused suites (e14-comparison + blind/svg/timing/iiif/selectors since adapters touched); full unit + evidence status; build | revert commit |
| 5b | **composition** (symbols, optional-separate) | `E14*`→`Composition*`, resolver/compare names per §11.2 across same importer set | C2 n/a; S1 verified; `__lab`/verdicts/values untouched | none expected | same as 5 | revert commit |
| 6 | **Documentation refresh** | README combined refresh; AGENTS.md paths; inventory/status marks; index pointers; NEW phase record incl. successor-path notes for frozen citations (consolidation-map, spec Appendix handled per §12) | Normative freeze respected | none | doc consistency pass; link check | single commit |
| 7 | **Final consistency audit** | repo-wide greps per §14 GATE-5/6; verify no living prose uses retired forms outside citation contexts (spec §11.6 completion criterion) | — | `git status --short evidence` empty | full §14 protocol | n/a |

Explicitly EXCLUDED from every step: evidence regeneration; fixture changes; URL/global/
route changes; `src/comparison/`, `src/oracle/`, `src/primitives/`, consumers' internal
logic; AMB-N6-1 context; profile/matrix texts.

---

## 14. Verification protocol (for the future migration)

Per family change-set, in order; all gates must pass before the next family starts.

1. **Baseline**: `git rev-parse HEAD`; `git status --short` clean (tree AND `evidence/`).
2. **Typecheck**: `pnpm run check`.
3. **Focused suites** for the affected area FIRST (e.g., n6-conformance; e14-comparison;
   e16-comparison; blind/svg/timing/iiif/selectors when adapters move).
4. **Full unit run**: `pnpm test`, then `git status --short evidence` — expected EMPTY.
   Any churn: hash-compare against HEAD (`git stash` no; use `git diff --stat evidence`
   + byte compare); byte-identical ⇒ behavioral confirmation (P-2 precedent from
   H.2-A §6); differing ⇒ STOP, investigate, never absorb.
5. **Build**: `pnpm run build` (module graph affected by every family).
6. **Static browser-surface checks** (instead of running browser suites, per P-7):
   grep route strings (`/e15-lab.html`, `/e17-lab.html`), global keys (`__e15`, `__e17`,
   `__lab.e14*`), event/CSS hook literals — must appear UNCHANGED in specs/pages.
   Browser/Playwright suites are run ONLY under a separate protocol-authorized
   regeneration instruction (P-3), never as rename verification.
7. **Retired-token gate (GATE-5)**: grep `src/ scripts/ tests/` for
   `\be14\b|\be15\b|\be16\b|\be17\b|\bn6\b|\bn2\b` — remaining hits must each be one of:
   (a) header provenance-citation lines, (b) frozen string literals (values/paths/
   keys per §7.1), (c) registry/comment citations of historical artifacts. ZERO hits as
   import paths, identifiers, or new prose names.
8. **Protected-value gate (GATE-6)**: grep assertions that
   `n6-resource-validator@1.0.0`, `n6-t01`, `I-REGION-VIEWPORT` (+4 labels),
   `a==blind`, `PASS|FAIL|BLOCKED|OPEN_FENCE` codes sample, `AMB-N6-1`,
   `e14-case01-a` fixture id, `?exp=` value handling, `__lab.e14Compare` — all present
   and byte-identical in their definition sites.
9. **Byte-stability spot-check** after evidence-producing runs: `git diff --stat evidence`
   empty OR hashes equal for the touched family's artifacts.
10. **Completion criterion** (whole migration, spec §11.6): suites pass unchanged;
    evidence tree untouched; no living document/code uses retired forms outside §9-
    citation contexts; glossary/owner sites agree; final audit recorded in the phase
    record.

Rollback: each family is one commit; `git revert <commit>` restores prior state exactly
(no evidence writes expected at any step except the two focused-run steps, which must
prove byte-stability — making even those effectively no-op on the tree).

---

## 15. Explicit unresolved questions (carried, not resolved here)

- **Q1 — Lab-page routes/filenames** `/e15-lab.html`, `/e17-lab.html`: this artifact
  sets policy lean-KEEP (stable dev-surface keys; renaming buys no clarity while
  coupling pages+mounts+specs — audit G.4/B.4). Needs explicit human confirmation to
  close; if overridden, execute as one atomic route change-set with spec navigation
  updates (C1/C4).
- **Q2 — Bridge function names** `e14ToResolvedA`/`e14ToBlindOverlay`: recommended KEEP
  (traceability with frozen H.2-D record). Human may override; rename would be atomic
  main.ts-local + a pointer note in the migration phase record.
- **Q3 — Symbol-spelling approvals**: §11.2 target spellings (esp. beyond the mechanical
  prefix swaps: `E15Rect/Landmarks/Map/Measured/CellResult`, `compareE14`) require
  mapping-row approval before execution (glossary fixes the CONCEPT; spelling is the
  human call).
- **Q4 — Initial-cycle spec filenames**: recommendation KEEP (slugs prose-only). Human
  may override with a cosmetic change-set.
- **Q5 — Prompt-template scope** (`docs/prompts/external/session-handoff-example.md`):
  needs the G.6 scope ruling; recommendation living-template refresh post-migration.
- **Q6 — U1 project self-descriptor** (package name/title/README title): unchanged,
  separate decision, unaffected by everything above.
- **Q7 — Accepted residual**: adjacency of `src/composition/` and
  `src/nested-composition/` (distinct concepts; mitigated by headers/index). Recorded
  for the final consistency audit to re-examine.
- **Standing restrictions inherited**: AMB-N6-1 OPEN — T12 parentheticals untouchable
  pending human research decision (U6). H.1 deferred #7/#8/#9/#10 carried unchanged
  (H.2-D §5). Evidence-producing suites never run casually (P-7).

---

## 16. Scope boundary and verification performed (this phase)

Delta produced by this phase: creation of this file ONLY. No source, test, script,
config, fixture, evidence, or existing-documentation file was created, renamed, edited,
moved, or deleted. No tests were run; no build was run; no evidence was regenerated;
`git status --short evidence` is clean.

Method: read all governing documents listed in the header; inspected at HEAD `5ec792d`:
full `src/`/`tests/`/`scripts/` listings; `main.ts` (routing, MANIFEST_MAP, bridges,
`__lab` surface); all twelve initial-cycle/e2e spec headers and bodies sampled;
`e15/analysis.ts` export surface (incl. `INTERPRETATION_NAMES` + `fn.name` introspection
site `src/e17/classify.ts:198`); `n6/{validator,suite}.ts` headers +
`VALIDATOR_VERSION`/`n6-tXX` sites; `run-n6-suite.mts` (`OUT_DIR`, `matrixRows`);
evidence writers' output-path literals (`e14/e16/blind-comparison` vitest, `e15.spec`
direct `evidence/e15/` writes, `e17-aggregate.mjs` reads/writes); both extra Playwright
configs (testMatch/outputDir/projects); public HTML mounts; `fixture-provenance.json`
family ids; registry section A/B rows. Audit claims spot-reverified where load-bearing
(S1 reliance, C1/C2 sites, evidence-writer inventory).

*End of Phase G taxonomy & migration mapping. Stopping point reached: no rename,
migration, documentation edit, or evidence operation has been performed; execution
awaits explicit instruction and §15 sign-offs.*
