# Terminology Migration — Inventory (pre-migration classification)

> **WORKING INVENTORY ARTIFACT — COMPANION TO `terminology-specification.md` (Phase F).**
> This file CLASSIFIES the repository surface so a later migration can be executed
> deterministically. It renames, edits, and migrates nothing. It owns no research
> claims; every classification cites its evidence. Like `cleanup-checklist.md`, it is
> not part of the frozen record. Baseline: HEAD `cc4f0e3`, tracked tree clean at
> inventory start (verified via `git status`).

---

## 0. Method and authority basis

Read first (governance): `AGENTS.md`, `research/terminology-specification.md`
(§2 principles, §5 glossary, §7 identifier policy, §8 output vocabulary, §9 mapping,
§10 open decisions, §11 migration rules), `research/terminology.md` (Phase E registry,
in force as audit/navigation), `research/documentation-conventions.md`,
`research/current-state-index.md`, `research/consolidation-map.md`,
`research/cleanup-checklist.md`.

Then inspected: full file tree (all 647 non-generated files enumerated), living
source modules (`src/main.ts`, `src/e14/*`, `src/e15/*`, `src/e16/*`, `src/e17/*`,
`src/n6` imports, `src/comparison/`, `src/oracle/`, `src/primitives/`),
scripts, tests (unit + e2e), configs (`package.json`, both extra Playwright configs,
vite/vitest/tsconfig), `index.html`, `README.md`, `docs/prompts/`, and targeted
searches for every retired family listed in §7.4/§9 (`e1[4-7]`, `\bn[1-6]\b`,
`exp[0-9]`, `stage [0-9]`, `r-v*`/`m-m*`, `finding/hypothesis`, ops `P-0/R-1/G-1/V-1/N-2/D-DEF`)
across `src/ scripts/ tests/ docs/ README.md index.html *.ts *.json`.

Classification categories A–G are those of the task brief. Counts below are
per-area approximations where noted; path-level rows are exact.

Key interpretive ruling applied (per task correction): the Phase F specification's
mentions of current paths (`src/n6/types.ts` in §8/§5.5/Appendix) are descriptions
of implementation state written before migration. They do NOT immunize living paths.
They DO protect what those sections actually own: the diagnostic-code values,
unions, and output-vocabulary strings themselves.

---

## A. Executive summary

| Class | Count | Basis |
|---|---|---|
| A. Historical record occurrences (preserve) | ~353 evidence files + ~170 fixture files + 28 frozen research/docs documents + 10 frozen phase/process records | entire `evidence/` tree; `public/manifests/**`, `public/svg/**`, `public/video/**`; L0/L5 records and phase records (see §F) |
| B. Historical citation occurrences in living documents (preserve) | dominant form in: `cleanup-checklist.md`, `current-state-index.md`, `terminology.md`, `AGENTS.md`, `docs/prompts/*` | citations name historical artifacts/documents, which is sanctioned use |
| C. Living terminology candidates (migrate prose) | 4 files (~15 term sites) | README.md; playwright.e17.config.ts + playwright.n2.config.ts header comments; session-handoff-example.md (partial); AGENTS.md path-list follow-on |
| D. Living path / namespace candidates | 5 module dirs / 16 source files, 7 scripts, 21 test files, 2 configs, 2 harness pages ≈ 48 paths | detailed tables §B below |
| E. Machine-interface exceptions | ~12 families | §E below |
| F. Ambiguous / decision-needed | 7 items | §G below |

No occurrence of retired probe report IDs (`R-V*`, `M-M*`), finding numbers
(`Finding n`, `Fn`), hypotheses (`Hn`), or brief questions (`Qn`) exists in living
code/scripts/tests except as explicit citations of historical documents (Category B).

---

## B. Living path candidates

Proposed targets use ONLY glossary-established concepts (spec §5). Per spec §11.3
(mapping-first), executing ANY row below requires appending the corresponding row to
`terminology-specification.md` §9 before edits. Exact slugs are proposals; the
concept is fixed by the glossary, the string is execution detail.

### B.1 Source modules

| Current path | Object represented | Classification | Proposed canonical path | Evidence/rationale |
|---|---|---|---|---|
| `src/n6/` (aspect, canvas, exclusions, fragments, mapping, suite, svg, types, validator — 9 files) | The Validator (C3 concept, spec §5.5); stage 3 of the N6 edit flow | D (module dir + filenames); contents partially E | `src/validator/` | Spec's own worked example ("n6-validator → validator"). Imports from `tests/n6-conformance.test.ts` and `scripts/run-n6-suite.mts` update atomically. `types.ts` diagnostic codes / `RequirementId` values are E — values never change, only their containing path does |
| `src/e14/` (`comparison.ts`, `types.ts`) | Composition-model interchange record + comparison harness (H.2-D ratified "E14 record" interchange tier); home of `E14Model` union | D; `E14Model` union NAME = F (see G.3), letter VALUES "A"/"B"/"C" = E | `src/composition/` | Glossary C1.a "Composition model"; H.2-D names the tier semantically ("interchange record"). Distinct from src/e16 analysis — do NOT merge code |
| `src/e15/analysis.ts` | Shared embedding-semantics analysis data model: embeddings, landmarks contract types, candidate interpretations (`iRegionViewport`, `iIntrinsicStretch`, …), regions/variants | D (strong candidate — explicitly reused by `src/e17/classify.ts` as importable infrastructure) | `src/embedding-semantics/analysis.ts` | Glossary: "embedding-semantics experiments/reports", candidate interpretation (§5.5), pixel-mask classifier |
| `src/e15/page.ts` | Measurement-matrix page for the embedding-semantics experiment (served at `/e15-lab.html`) | D page name + route; `.e15-box`/`#e15-probes`/`__e15`/`e15-ready` inside = E (lab globals/CSS hooks, N-26 out of scope) | `src/embedding-semantics/page.ts` (+ route decision, see G.4) | Same concept basis |
| `src/e16/comparison.ts` | Pure geometry/provenance helpers comparing nested-Canvas composition fit readings | D | `src/nested-composition/comparison.ts` | Glossary "Nested Canvas (Canvas-as-body)"; fit-policy territory references |
| `src/e17/classify.ts` | Cross-engine replication scoring/classification helpers (thresholds lifted verbatim from e15 spec) | D | `src/cross-engine/classify.ts` | Glossary §5.5 "Cross-engine replication" (canonical term) |
| `src/e17/page.ts` | Cross-engine measurement page (`/e17-lab.html`) | D page name + route; internals = E | `src/cross-engine/page.ts` (+ route decision, see G.4) | Same |

Clean living namespaces (no action): `src/reference/`, `src/blind/`, `src/native/`,
`src/primitives/`, `src/comparison/`, `src/oracle/` (`rendererB.ts` matches canonical
"Renderer B"; `experiments.ts` is semantic).

### B.2 Scripts

| Current path | Object represented | Classification | Proposed canonical path | Evidence/rationale |
|---|---|---|---|---|
| `scripts/run-n6-suite.mts` | Validator suite generator (edit-flow stage 4; owns `matrixRows` presentation literals) | D; `OUT_DIR="evidence/n6"` literal inside = E (frozen evidence grammar) | `scripts/run-validator-suite.mts` | Validator concept. Consolidation-map cites old path — frozen doc stays as-is; new phase record documents new path |
| `scripts/build-fixtures.mjs` | Initial-cycle fixture builder (generates exp*/case*/text/security fixtures) | Name clean (D-no); generated FILENAMES inside = E (frozen grammar) | none | Keep name; fixture grammar untouchable (N-24, §8) |
| `scripts/build-e14-fixtures.mjs` | Composition case-fixture builder | D | `build-composition-fixtures.mjs` | Composition model fixtures (family grammar of outputs unchanged) |
| `scripts/build-e15-fixtures.mjs` | Embedding-semantics variant builder | D | `build-embedding-semantics-fixtures.mjs` | Embedding-semantics experiment |
| `scripts/build-e16-fixtures.mjs` | Nested-composition case builder | D | `build-nested-composition-fixtures.mjs` | Nested Canvas composition |
| `scripts/build-e17-fixtures.mjs` | Cross-engine variant builder | D | `build-cross-engine-fixtures.mjs` | Cross-engine replication |
| `scripts/build-n2-fixtures.mjs` | Consumer-probe manifest builder | D | `build-consumer-probe-fixtures.mjs` | Consumer probe (§5.5); outputs keep frozen slugs |
| `scripts/e17-aggregate.mjs` | Cross-engine evidence aggregator | D; `"Stage 1"` plan citation inside = B; reads `evidence/e17/*` = E | `cross-engine-aggregate.mjs` | Cross-engine replication |
| `scripts/generate-video.mjs` | Deterministic video generator | clean | none | No retired identifiers |

### B.3 Tests

| Current path | Object represented | Classification | Proposed canonical path | Evidence/rationale |
|---|---|---|---|---|
| `tests/n6-conformance.test.ts` | Black-box conformance suite T01–T15 over the validator | D; describe-string prose = C; imports = follows module rename | `validator-conformance.test.ts` | Validator; T-ids themselves stay (live space §7.2) |
| `tests/e14-comparison.test.ts` | Composition comparison unit tests (writes evidence/e14) | D | `composition-comparison.test.ts` | Writes into `evidence/e14/` — output paths unchanged (E) |
| `tests/e16-comparison.test.ts` | Nested-composition fit/comparison tests (writes evidence/e16) | D | `nested-composition-comparison.test.ts` | Same pattern |
| `tests/blind*.test.ts`, `iiif`, `selectors`, `svg`, `timing` | consumer/renderer unit tests | clean | none | No retired identifiers (blind is canonical role name) |
| `tests/e2e/e14.spec.ts` | Browser verification of composition cases via lab harness | D (filename + internal `record()` keys write evidence filenames = E) | `composition.spec.ts` | Concept: composition-model cases |
| `tests/e2e/e15.spec.ts` | Embedding-semantics matrix measurement (writes evidence/e15) | D | `embedding-semantics.spec.ts` | Note classify.ts calls its private scoring copy "historical harness stays frozen" — see G.1 |
| `tests/e2e/e16.spec.ts` | Nested-composition browser checks | D | `nested-composition.spec.ts` | |
| `tests/e2e/e17.spec.ts` | Cross-engine replication run | D; `"Stage 1"` comment = B | `cross-engine.spec.ts` | Config testMatch must move in same change-set |
| `tests/e2e/n2-viewer.spec.ts` | Consumer probes against deployed viewers | D; `"Stage 2"` comment = B | `consumer-probe.spec.ts` | Consumer probe |
| `tests/e2e/exp1…exp7.spec.ts`, `parity.spec.ts`, `security.spec.ts`, `text.spec.ts` | Initial-cycle experiment reproduction harnesses (drive `?exp=N` URLs; regenerate `evidence/observations/exp*.json`, `parity-*.json`) | **F** (see G.2) | deferred — no glossary slug exists per experiment | §9 maps exp1–7 to descriptive phrases only; minting slugs would be new vocabulary |
| `tests/e2e/viewer.spec.ts`, `blind.spec.ts` | early viewer/blind harness specs | clean-ish (viewer.spec writes `viewer-*` observation names = frozen grammar) | none | |

### B.4 Configs and pages

| Current path | Object represented | Classification | Proposed canonical path | Evidence/rationale |
|---|---|---|---|---|
| `playwright.e17.config.ts` | Dedicated tri-engine runner for cross-engine spec | D filename; header comments = C; `testMatch` regex + `outputDir test-results/e17` = E-infra | `playwright.cross-engine.config.ts` | Cross-engine replication |
| `playwright.n2.config.ts` | Dedicated single-engine runner for consumer probes | D filename; comments = C; testMatch/outputDir = E-infra | `playwright.consumer-probe.config.ts` | Consumer probe |
| `public/e15-lab.html` | Harness route serving embedding-semantics matrix page | D route (harness routes are implementation detail, N-26 — rename optional, coupled to specs) | `embedding-lab.html` or keep | See G.4 |
| `public/e17-lab.html` | Harness route serving cross-engine page | D route | `cross-engine-lab.html` or keep | See G.4 |
| `public/mirador-check.html`, `public/viewer-check.html` | Consumer-probe host pages | clean | none | Already semantic |
| `package.json`, `index.html`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, root playwright.config.ts | infrastructure | clean of retired identifiers | none | package name/title touch only U1 |

---

## C. Living documentation candidates

| File | Current term | Classification | Canonical term | Mapping §9 row | Notes |
|---|---|---|---|---|---|
| `README.md` | "exps 1,2,3,5a/b/c,6,7", "exp4", fixture table rows exp1–7/text/security, layout entries `src/e14/ … src/e17/`, `src/n6/`, stale `src/experiments.ts`, "N6 resource conformance validator", "Renderer-B oracle … deliberately-simple reference" | C (prose) mixed with E (describes URL params `/?exp=1..7&renderer=a|b` — protected surface, fix prose not params) | "initial-cycle experiments" by topic; "the validator"; Renderer B phrasing per §5.7; paths per §B once executed | exp-row; N-row; generation rows | Refresh already mandated independently by cleanup-checklist item 1 — sequence the two (G.5). U1 title question separate |
| `playwright.e17.config.ts` (comments) | "E17 (N1 cross-engine)", "the E17 spec" | C | "cross-engine replication runner/spec" | N-row, generation row | Comment-only if file keeps name |
| `playwright.n2.config.ts` (comments) | "N2 (real-consumer)", "the N2 spec" | C | "consumer-probe runner/spec" | N-row | Same |
| `docs/prompts/external/session-handoff-example.md` | uses `E14`, `N6`, `src/n6/`, `E14Overlay` etc. as current object names | F (see G.6) | mostly B/citation + code symbols | — | Example handoff template; decide whether prompt templates are in migration scope |
| `AGENTS.md` | infrastructure list citing `src/n6/`, `src/e14/`–`src/e17/` | C-lite (path facts, not prose terminology) | updated automatically when/if §B executes | n/a | Living instructions; also cites retired families only to forbid extending them (B) |
| `research/cleanup-checklist.md` | N1–N4, E17, V1–V7/M1–M3, op R-1/D9 mentions | B (historical citations of artifacts/docs) | — | — | No action |
| `research/current-state-index.md`, `research/terminology.md` | pervasive historical identifiers | B (citation/navigation by charter) | — | — | Registry retirement happens AFTER approved migration per §11.5 |

Frozen documentation (L0/L5/L2 + phase records + controlled convention/policy docs):
NOT candidates — see §F. In particular `documentation-conventions.md` T-1…T-6 item
numbers and `evidence-policy.md` P-1…P-7 points are process-local identifiers whose
owning documents remain operative until superseded (spec Appendix).

---

## D. Code terminology candidates (by kind — no behavior-changing edits proposed)

- **Comments**: `src/e14/*`, `src/e15/*`, `src/e16/*`, `src/e17/*`, `src/n6/suite.ts`
  ("AMB-N6-1" mention = sanctioned live ambiguity ID), `scripts/run-n6-suite.mts`,
  `scripts/e17-aggregate.mjs`, `scripts/build-n2-fixtures.mjs`, all flagged e2e specs,
  both extra Playwright configs — headers self-describe with generation numbers
  ("Experiment E15 — …"). Migrate comment PROSE to concept names when the owning path
  migrates; comment text is behavior-safe.
- **Identifiers (type/function names)**: `E14Model`, `E14SvgAttrs`, `E14Placement*`,
  `E14NestedMap`, `E14Security`, `E14Rule`, `E14Overlay`, `E14Manifest`,
  `E14CanvasInfo`, `E15Embedding`, `E15Rect`, `E15Landmarks`, `E15SvgVariant`,
  `E15Map`, `E15Measured`, `E15CellResult`, `resolveE14Manifest`,
  `resolveBlindE14Manifest`, `compareE14`, `e14ToResolvedA`, `e14ToBlindOverlay`,
  `e14Resolved`, `e14Compare`. Internal code symbols — behavior-safe to rename IF no
  serialization coupling (verify per G.3). Letter VALUES ("A"/"B"/"C") and verdict
  strings are E and never change.
- **Strings**: HUD text `exp=${exp} renderer=…` (`main.ts`), `window.__lab` API keys
  (`e14Resolved`, `e14Compare`, `parity`, `parityBlind`), event names
  (`lab-ready`, `e15-ready`), CSS hooks (`.e15-box`, `#e15-probes`, `.ar-*`) — all E
  (lab globals/CSS hooks/route keys, N-26: out of vocabulary scope; leave unless a
  separate decision says otherwise).
- **Module names / imports**: covered by §B tables; imports update mechanically with
  module renames (behavior-safe when atomic).
- **Tests**: describe/test titles using "N6/E14/E16/E17/N2" = C prose; expectations,
  fixture coordinates, evidence-writing calls = protected, untouched.
- **Configs**: testMatch regexes + Playwright outputDirs tied to spec filenames =
  E-infra (rename together with specs in one change-set).
- **Package metadata**: clean (name/description carry no retired identifiers; U1 applies to the project descriptor, not these).

---

## E. Machine interfaces (separate decisions; do not rename casually)

1. **URL query parameters** (`main.ts`): `?exp=` (values: `1..7`, `7-animate`, `text`,
   `security`, `case1..13`, `e14-caseNN-x`, `e16-caseNN-x`, legacy alias `6`),
   `?renderer=a|b|blind|native`, `?sanitize`, `?fit`, `?aspect`, `?t`. Protected
   surfaces (explicitly reaffirmed by cleanup-checklist item 1). Values encode
   historical fixture families → effectively frozen grammar.
2. **`MANIFEST_MAP` route keys** (`"6"→exp1.json`, `text`, `security`) and
   `exp${exp}.json` construction — machine-facing routing.
3. **Renderer enumerants**: `RendererKind` `"a"|"b"` (+ harness `"blind"|"native"`),
   verdict/agreement strings (`a==blind`, `a==native`, `blind==native`, `!=`) carried
   in archived evidence — U2 default: no action.
4. **Model/mode unions**: `E14Model` `"A"|"B"|"C"` (values persist in evidence),
   `IiifMode` A/B semantics (blind/layers.ts) — axis letters machine-load-bearing
   (§5.1, T-1).
5. **Diagnostic codes** (20 SCREAMING_SNAKE, `src/n6/types.ts`) and
   `DiagnosticStatus` (`PASS|FAIL|BLOCKED|OPEN_FENCE`) — owned output vocabulary;
   quote verbatim; survive any path rename unchanged.
6. **Live approved ID spaces** (NOT retired; keep): `R-S1…R-S8b`, `X1–X8`,
   `T01–T15` (suite encoding + `evidence/n6/case-T*.json` filenames), dormant
   `RF01–RF04`, epistemic layers `L0–L6`, fixture/evidence family ids in
   `fixture-provenance.json`.
7. **Living ambiguity record** `AMB-N6-1` — approved space (§7.2); stays OPEN and
   verbatim until a human research decision lands (U6). Occurs in `suite.ts`
   (T12.expected context), `evidence/n6/summary.json` (`recordedAmbiguities`), reports.
8. **Evidence filename grammars** — entire `evidence/` tree incl. directory names
   (`evidence/n6/`, `evidence/e14/`…, screenshots `ramp-v*-…`, `mirador-m*-…`,
   `parity-*`, legacy typo `epx6-*.png`): frozen; regeneration follows
   `evidence-policy.md`; `run-*-suite.mts` `OUT_DIR` literals must keep producing the
   same paths even if the script is renamed.
9. **Fixture filename grammars** — `public/manifests/**`, `public/svg/**` (incl.
   `case6` unpadded vs `case06` padded split — never unified, N-07), region/variant
   encodings (`vb1000`, `novb1920x1080-min`, `square500`, `-a/-b/-c` suffixes):
   frozen encodings, cite builders/reports.
10. **Probe slugs / probeIds** — `evidence/viewer/probe-ramp-v*.json`,
    `probeId` values `N2-ramp-v#-…` in `viewer-matrix.json`: frozen per family
    (N-24); future probes take `<consumer>-<topic>` slugs per §5.6/U4.
11. **Lab globals / CSS hooks / events / route keys**: `__lab`, `__e15` (and e17
    analogues), `.ar-*`, `.viewport`, `.e15-box`, `lab-ready`/`e15-ready` events,
    `MANIFEST_MAP` — implementation detail, excluded from vocabulary (N-26).
12. **Playwright projects/output dirs**: `chromium/firefox/webkit` project names;
    `test-results/e17`, `test-results/n2` — infra metadata; may follow config
    renames but have no terminology standing.
13. **Classifier labels** `I-REGION-VIEWPORT`, `I-INTRINSIC-STRETCH`,
    `I-OBJECTFIT-CONTAIN`, `I-NATURAL-CENTERED`, `I-NATURAL-TOPLEFT` — frozen
    evidence vocabulary (§5.5/§8); function names `iRegionViewport` etc. mirror them
    and should track the frozen labels, not be "improved" independently.

MACHINE INTERFACE — NEEDS SEPARATE DECISION: none found beyond the above; every
retired-identifier-bearing machine surface discovered is already covered by an
existing exception class (items 1–13).

---

## F. Historical surfaces (must remain untouched)

- **`evidence/` (353 files)** — all archived observations, comparisons, probes,
  conformance runs, screenshots. Includes `evidence/viewer-matrix.json`,
  `evidence/n6/conformance-matrix.json` (generated), legacy-typo screenshots.
- **Fixtures** — `public/manifests/**` (~75), `public/svg/**` (~70 incl.
  landmark contracts `e15/e16/e17-landmarks.json` reused across generations),
  `public/video/*.mp4`. Generated but grammar-frozen (regeneration byte-stable under
  builders; treat as protected coordinates).
- **L0 immutable records** — `research/plan.md`, `findings.md`, `experiment-log.md`,
  `next-session-plan.md`, `e14-report.md`, `e15-report.md`, `e16-report.md`,
  `e17-report.md`, `e15-e16-final-report.md`, `viewer-interop-report.md`,
  `n4-safe-subset.md`, `community-positioning.md`, `n3-source-index.json`,
  `docs/blind-interpretation-rules.md`, `docs/blind-renderer-report.md`,
  `docs/ambiguities.md`, `docs/iiif-3-vs-4.md`.
- **L5 era report** — `research/n6-implementation-report.md` (frozen; successor L5
  entries would be NEW documents, not rewrites).
- **Frozen process/governance records** — `consolidation-map.md`,
  `phase-b-provenance-terminology-audit.md`, `phase-d-checklist.md`,
  `phase-e-identifier-inventory.md`, `phase-g1-…`, `phase-h1-…`,
  `phase-h2a/h2b/h2c/h2d-…`, `pre-consolidation-inventory.md`. Their filenames embed
  phase letters — process-local naming for process records; historical identity,
  not migration targets.
- **Controlled normative chain** — `profile-draft.md` (L3), `conformance-matrix.md`
  (L4): migrate nothing here without the sanctioned edit-flow; their `S1↔R-S*` alias
  rows and Part A/B structures are sanctioned bridges, not violations.
- **Registers** — `open-questions.md` (append-only; numbering never touched);
  `fixture-provenance.json` (schema-append only).
- **Controlled conventions/policy** — `documentation-conventions.md`,
  `evidence-policy.md` (operative until superseded by the approved migration).

Note on document FILENAMES: frozen records keep their names (`e14-report.md`,
`n4-safe-subset.md`, `n6-implementation-report.md`, …) — the names are citation
coordinates of historical artifacts (rule: historical identifiers appear legitimately
when identifying historical artifacts). Only LIVING paths are candidates (§B).

---

## G. Ambiguities (each blocks specific steps; needs named evidence or human decision)

1. **Status of generation-harness trees (`src/e15/…e17/` + their specs/pages):**
   consolidation-map §1.4 called them "frozen surfaces" (Phase C wording, pre-H.2);
   H.2-B/C subsequently moved sibling harness code under explicit mandates, and
   `src/e17/classify.ts` now calls the e15 spec copy "historical harness stays
   frozen". Whether these directories are (a) living namespaces to migrate (treated
   in §B) or (b) reproducibility apparatus akin to evidence (leave named as-is) is a
   POLICY decision. Needed: human call per family; factual coupling (imports,
   routes, evidence writers) is fully mapped above.
2. **Initial-cycle spec filenames (`tests/e2e/exp1…7.spec.ts`, `parity`,
   `security`, `text`):** no canonical slug exists — §9 maps exp1–7 to descriptive
   phrases only. Renaming requires either minting new slugs (glossary-first per spec
   maintenance rule 12.1) or leaving process-local harness names. Needed: human
   decision; do not resolve by renaming.
3. **Type-name renames (`E14Model`, `E15*`, `e14To*` bridges):** behavior-safe only
   if no serialized surface carries the type NAMES. Evidence JSONs observed store
   VALUES (letters, numbers), but full schema audit of all 353 evidence files was
   not performed. Needed before any execution: grep evidence tree for type-name
   strings; if absent, renames are code-internal and safe.
4. **Harness page routes (`/e15-lab.html`, `/e17-lab.html`):** routes are
   implementation detail (N-26), but renaming couples page files, `src/*/page.ts`
   mount points, and several spec files atomically. Needed: decision whether route
   URLs join the migration or stay as stable dev-surface keys.
5. **README sequencing:** cleanup-checklist item 1 (layout/quick-start staleness)
   overlaps this migration's README rows. Needed: decide whether README refresh
   executes standalone (as previously scoped) or folds into the terminology
   change-set to avoid double-editing.
6. **Prompt templates (`docs/prompts/external/session-handoff-example.md`):**
   living coordination artifact referencing `E14`/`N6`/paths as current names.
   Unclear whether docs/prompts is in migration scope or a transient session tool.
   Needed: scope ruling.
7. **Project self-descriptor (U1 carry-over):** `package.json` name, `index.html`
   title, README title say "Video Annotation Interoperability Lab". Already an open
   decision (spec §10 U1); this inventory adds nothing except confirming no OTHER
   metadata carries retired identifiers.

Observation (not blocking, recorded per scope discipline): post-F phase records
continued the letter series (`phase-g1-…`, `phase-h1/h2…`) — consistent with the
spec's treatment of phase letters as process-local machinery (never domain
vocabulary); note only the pre-existing collision hazard between op `G-1` and
`phase-g1` (registry §4 already warns). Also note `Stage 1–5` in consolidation-map
§2.1 denotes edit-flow stages, unrelated to experiment `Stage k` — distinct senses
of an overloaded word, both process-local.

---

## H. Possible vocabulary gaps (new living terminology absent from Phase F glossary)

Reported separately per instructions; NOT fixed here. Each requires a glossary
decision BEFORE code/files lean on it further.

1. **Three-tier display architecture terms** (H.2-D ratified): "interchange record /
   interchange tier" (the E14-record tier), "legacy display-regression substrate"
   (`ResolvedOverlay` tier), "private model" (`BlindOverlay` tier), plus the
   "permanent harness-tier bridges" notion. None of these tiers/tier-names exist in
   the §5 glossary (closest: composition model, interpretation packet — different
   objects).
2. **Four-tier reuse-governance terms** (H.2-A, restated in AGENTS.md):
   "renderer-neutral primitive" / "shared primitive namespace", "explicitly labeled
   profile-defined reading", "consumer-policy implementation", "analysis-only /
   counterfactual implementation". Governance concepts (C6 territory) introduced
   after Phase F; absent from §5.8.
3. **Namespace-role words now load-bearing in AGENTS.md**: "infrastructure (vs
   consumer)" distinction, "protected surface" list-categories, "evidence-producing
   test". These govern agent behavior repo-wide but have no glossary entries.

If the migration is approved, decide whether these enter the glossary (with owners)
or are explicitly declared out-of-vocabulary implementation/process detail (like
N-26) — silence would repeat the synonym-drift the specification exists to prevent.

---

## I. Verification against the specification

- **§7 checked:** live spaces (R-S*, X*, T*, diagnostics, L0–L6, family ids,
  AMB-*) inventoried as KEEP (§E.5–E.7); dormant RF01–04 untouched; retired §7.4
  families searched comprehensively; no living occurrence extends/mints any of them.
  Sequential-vs-semantic rule (§7.5) respected: all proposed targets are semantic
  compounds of existing glossary terms; no new numbered space proposed.
- **§9 checked:** every Category-C prose proposal resolves to an existing §9 row
  (exp-row, N-row, generation-name rows, Renderer-B phrasing). Every Category-D path
  proposal derives its CONCEPT from §5 but has NO §9 row yet — per §11.3 the mapping
  table must grow with path-migration rows BEFORE any rename executes. This file
  proposes those rows' content (tables §B) without adding them.
- **§11 checked:** two-document-class rule drives the A/F vs C/D split; normative-text
  freeze respected (no profile/matrix changes proposed); mapping-first flag raised
  (previous sentence); code-follows-vocabulary honored (only behavior-safe layers
  marked migratable, machine surfaces quarantined in §E); registry-retirement
  sequencing noted (terminology.md untouched until after approved migration);
  verification criterion anticipated — suites pass unchanged, evidence tree
  untouched, no living prose outside §9-citation contexts.

---

## J. Inventory status

INVENTORY COMPLETE — NO FILES MODIFIED.

Tracked-tree delta produced by this task: creation of this file only
(`research/terminology-migration-inventory.md`). No renames, no edits to source,
tests, configs, evidence, fixtures, or any existing document; no commits.
