# Phase E — Identifier & Terminology Inventory

> **PHASE E WORKING ARTIFACT — ANALYSIS ONLY — UNCOMMITTED.**
> This is NOT governance. It does not modify, interpret, or supersede any owning
> document. If it conflicts with any owning document, the owning document wins
> (Phase C rule). The eventual registry (`research/terminology.md`, NOT created
> here) would be built FROM this inventory after review.

## 0. Method & Safety

- Read-only phase. Baseline: HEAD `b4b0503`, clean tree, 353 tracked evidence files.
- Discovery method: targeted scans over `research/`, `docs/`, `src/`, `tests/`,
  `scripts/`, `public/` manifests, `evidence/` JSON keys, plus the accumulated
  Phase A–D context. Bracketed-label universe enumerated by regex over all
  research/docs Markdown. No suites run; no evidence touched; no commits made.
- Output-location convention check: no prior Phase E artifact exists; Phases A–D
  each created exactly one kebab-case document under `research/`
  (`pre-consolidation-inventory.md`, `phase-b-…`, Phase C set, `phase-d-checklist.md`).
  This file follows that convention and is the ONLY file created.
- Classification model: categories A–I as mandated (A identifier namespace,
  B taxonomy/provenance label, C status vocabulary, D historical experiment ID,
  E process/governance ID, F requirement/exclusion ID, G evidence/fixture naming
  convention, H ordinary terminology, I unknown/ambiguous).

---

## 1. Identifier Namespace Registry

Fields per mandated structure are given as columns; "Owner" = owning document with
defining section where practical. Status vocabulary: historical / current /
process / generated / mixed.

### 1.1 Experiment & generation identifiers

| Namespace | Example | Cat | Object type | Meaning | Syntax/range | Status | Owner (definition site) | Referenced by | Collision | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `exp<N>` | `exp4`, `exp5a`, `exp7-animate` | D | experiment/fixture ID (initial cycle) | falsifiable-experiment fixtures & harness routes | exp1–7; letter variants 5a/b/c; `-animate`; pseudo-IDs `text`, `security` via `MANIFEST_MAP` | historical; fixtures still active in harness | `scripts/build-fixtures.mjs`; route map `src/main.ts` `MANIFEST_MAP`; registry row: `experiment-log.md` table | README manifest table, findings.md, parity.spec (`RAW_PARITY_EXPS`) | low | `text`/`security` are manifest-name aliases, not numbered experiments |
| `case<N>` (blind gen) | `case11` | D | adversarial fixture ID (blind cases) | blind-generation fixtures 1–13 | `case1`–`case13` (UNPADDED) | historical; fixtures active | fixtures added wholesale `cbd0880` (see `fixture-provenance.json` `case-blind-1-13`) | blind.spec.ts, blind-comparison evidence, `docs/blind-renderer-report.md` | medium (padding vs e14; see §3) | no generator; authorship unknown |
| `e{gen}-case{NN}-<slug>-{a,b,c}` | `e14-case03-sq-full-b`, `e16-case01-same-full-a` | G | fixture filename convention | later-generation case fixtures; suffix encodes Model/Mode variant (a=A-direct/twin, b=B-nested, c=C-WA where present) | e14-case01…16; e16-case01…08; slugs vary | historical; active | builders `build-e14/e16-fixtures.mjs`; semantics `e14-report.md` §2 | comparison tests, e2e specs, viewer.spec | low | zero-PADDED `caseNN` here vs unpadded blind `caseN` |
| `E<n>` | `E15`, `E17` | D | experiment generation ID | numbered experiment generations; log rows 1–11 then 14–17 | E12–E17 named; ranges "E1–E11"/"E1–E13" prose | historical (record), current (citation space) | `research/experiment-log.md` table (# column); E12/13 declared in `docs/blind-interpretation-rules.md:3` | every report; compatibility-matrix rows | low (case/format separates from `exp`) | numbering gap 11→14 is historical fact |
| `E18` | `E18` | D | PROPOSED, never-executed generation ID | recommended viewer/consumer survey in the E15/E16 cycle close | single mention | historical ghost | `e15-e16-final-report.md` §13 (lines ~193,211) | none downstream | low | realized later as N2; a reader searching E18 artifacts finds none — record, do not create |
| `N<n>` | `N2`, `N6` | D | post-E17 stage/generation ID | N1 cross-engine, N2 consumers, N3 community, N4 subset, N5 profile+matrix, N6 validator | N1–N6 | historical generations; live citation space | `next-session-plan.md` (names N1–N4); N5/N6 self-declare in own headers | profile-draft, conformance-matrix, all later docs | medium (see §3: `N-2`, `n2-*`, `N2-*`) | tag `n6-complete-pre-consolidation` anchors the era |
| `Stage <k>` | `Stage 6` | E | process-stage ALIAS for generations | same objects as N<n>: N6≡Stage 6, N5≡Stage 5, N4≡Stage 4, N1≡Stage 1; Stage 0 = session-brief mandate | Stage 0–6 | process/historical | per-document headers ("Stage: N6 (Stage 6)" in `n6-implementation-report.md`); plan stages in `next-session-plan.md` | 9 documents (scan count) | medium (vs `S1.x`, see §3) | alias, not a separate numbering — never renumber |

### 1.2 Requirement, exclusion & test identifiers

| Namespace | Example | Cat | Object type | Meaning | Syntax/range | Status | Owner | Referenced by | Collision | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `S<n>` (subset rules) | `S4` | F | safe-subset rule (N4 formulation) | pre-profile subset rules S1–S8; ALIAS ROWS to R-S* | S1–S8 | historical→current via alias | `n4-safe-subset.md` Part 6/8; equivalence shown in `conformance-matrix.md` Part A ("S1 / R-S1") | conformance-matrix, profile-draft | HIGH cluster (§3) | never renumber; alias pairs are the bridge |
| `R-S<n><part>` | `R-S6b` | F | formal requirement ID | profile requirements; part-split a/b where provenance differs (R-S6a/b, R-S8a/b) | R-S1–R-S8b | current normative | `profile-draft.md` Part 4; encoded `src/n6/types.ts` (`RequirementId`) | conformance-matrix, suite.ts, run script, evidence JSONs | HIGH cluster | immutable (Phase C T-6) |
| `X<n>` | `X7` | F | exclusion ID | profile boundary exclusions | X1–X8 | current normative | `profile-draft.md` Part 10; matrix exclusion rows | run script matrixRows, evidence/n6 | low (lowercase `x` tokens unrelated — §3) | none carries PASS/FAIL mechanism |
| `T<nn>` | `T08` | A | black-box test-case ID | pre-registered suite cases | T01–T15 | current (design frozen N5; executed N6) | design: `conformance-matrix.md` Part B; execution encoding `src/n6/suite.ts` | tests/n6-conformance.test.ts, evidence/n6/case-T*.json | medium (vs `T-1..T-6` rules, §3) | zero-padded 2-digit |
| `RF<nn>` | `RF02` | A | future rendering-check ID | informational consumer checks, blocked by design | RF01–RF04 | current-design, unexecuted | `conformance-matrix.md` Part B "Future rendering-level checks" | profile-draft mentions | low | never gate conformance |
| `P<n>` (rules) | `P2`, `P5a` | F | lab-convention rule ID | candidate profile rules P1–P6 from E15/E16 cycle; P5a same-aspect sub-rule | P1–P6, P5a | historical rules; ranks finalized in N3 | formulated `e15-e16-final-report.md` §9; final rank table `community-positioning.md` §10 | n4-safe-subset, profile-draft, community-positioning | HIGH cluster (§3) | superseded-in-part by R-S* formalization; IDs remain citation currency |

### 1.3 Experiment-internal rule, finding, hypothesis, question & probe IDs

| Namespace | Example | Cat | Object type | Meaning | Syntax/range | Status | Owner | Referenced by | Collision | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `R<n>` (E15 rules) | `R2` | F | experiment-era classified rule | five key embedding-semantics rules with SOURCE/RESULT/IMPLICATION blocks | R1–R5 | historical | `e15-report.md` §5 | e17-report, profile-draft evidence column | HIGH cluster (§3) | distinct from R-S*/R-V* |
| `Finding <n>` | `Finding 1` | A | finding ID (E14) | six numbered empirical findings | Finding 1–6 | historical | `e14-report.md` §3.3 | ambiguities.md, compatibility-matrix | low | prose form, not "F<n>" |
| `F<n>` | `F5` | A | finding ID (E17) | eight cross-engine findings; each cites accepted hypothesis | F1–F8 | historical/current citations | `e17-report.md` §3 | profile-draft, next-session-plan follow-ups | low-medium | distinct from "fixture" prose |
| `H<n>` | `H1` | A | hypothesis ID (E17 plan) | five acceptance-tested hypotheses | H1–H5 | process/historical | `next-session-plan.md` Stage 1 table | e17-report ("(H1 ACCEPTED)") | low | plan-era; outcomes recorded in e17-report |
| `Q<n>.<m>` | `Q1.6` | A | staged question ID (E17 plan) | six exact stage-1 questions | Q1.1–Q1.6 | process/historical | `next-session-plan.md` Stage 1 | e17-report implicitly | HIGH cluster (second Q-family below) | dotted sub-numbering unique to this set |
| `Q<n>` (N3 brief) | `Q7` | A | brief-question ID (N3) | ten mandated community-positioning questions answered in N3 | Q1–Q10 | historical/process | `community-positioning.md` (answers inline; §10 = Q10); machine refs `n3-source-index.json` `relatesTo:["Q…"]` | n3-source-index | HIGH (distinct family from Q1.1–Q1.6 AND from open-question integers — §3) | NOT the open-questions register |
| open-question `<n>` | "open question #9" | A | register entry number | living register items; new items prepended above historic block | integers 1–15 (unprefixed!) | current append-only register | `open-questions.md` | e15/e16/final reports, phase docs | HIGH (two other Q-ish spaces) | no prefix — referenced as "#9"/"#10" |
| `bug-fix #<n>` | `bug-fix #13` | A | ledger entry number | sixteen numbered implementation-bug ledger entries | #1–#16 | historical (frozen ledger) | `experiment-log.md` §Bug-fix log | e15-report §8.3, profile-draft (S6b evidence), next-session-plan, phase-B audit | low | cited as "#10/#13/#15/#16" across eras |
| `R-V<n>` (canonical) / `V<n>` (shorthand) | `R-V4` ≡ `V4` | A | consumer-probe ID (Ramp) | seven Ramp probes; shorthand V<n> used when context says N2 | R-V1–R-V7; shorthand V1–V7 | historical evidence IDs, actively cited | `viewer-interop-report.md` probe matrix (canonical); shorthand spread via `conformance-matrix.md`/`profile-draft.md` ("N2 V4–V7") | viewer-matrix.json, RF-blocked rationale | medium (vs op `V-1`, §3) | THREE surface forms — see §3 mapping |
| `M-M<n>` (canonical) / `M<n>` (shorthand) | `M-M3` ≡ `M3` | A | consumer-probe ID (Mirador) | three Mirador smoke probes | M-M1–M-M3; shorthand M1–M3 | same | same as above | same | low-medium | same three-form issue |
| `AMB-<stage>-<n>` | `AMB-N6-1` | A | recorded-ambiguity ID | open discrepancy, reported not resolved | one instance; pattern implies family | current OPEN (D10: keep open) | `n6-implementation-report.md` §9; mirrored `evidence/n6/summary.json` | profile/conformance parentheticals context; phase docs | low | resolution requires human research decision |

### 1.4 Process / governance identifiers (consolidation era)

| Namespace | Example | Cat | Object type | Meaning | Syntax/range | Status | Owner | Referenced by | Collision | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `D<n>` | `D7` | E | consolidation decision ID | ten decisions D1–D10 operationalizing Phase B | D1–D10 | process/current | `phase-b-provenance-terminology-audit.md` §11 | consolidation-map, checklist, mission briefs | low (vs `DERIVED`, verdict grade D — §3) | binding inputs to C/D |
| `L<n>` | `L4` | E | epistemic layer ID | L0 immutable record … L6 pointer/index | L0–L6 | process/current | `consolidation-map.md` §1 (adopted from Phase B §5.3) | index, checklist, missions | none found | L6 owns no claims |
| Phase letters | `Phase C` | E | process-phase ID | consolidation phases A–E | A,B,C,D,E | process | mission briefs; doc titles | all consolidation docs | low (letter overload §3) | not repository-native before consolidation |
| Checklist ops | `R-1`, `G-1`, `V-1`, `N-2`, `P-0`, `D-DEF`; sub-steps `R-1.1…R-1.5`, `V-1.1…V-1.8` | E | execution-operation ID | Phase D mechanical operations + pre-flight/post-sweep | letter-digits with hyphen | process (executed/closed) | `phase-d-checklist.md` §0/A/B | Phase D report | medium (V-1 vs V-probes; R-1 vs R1–R5; N-2 vs N2 — §3) | sub-step dotted form mirrors Q1.1 pattern |
| Terminology rules | `T-1`…`T-6` | E | writing-rule ID | six terminology conventions for new docs | T-1–T-6 | process/current | `documentation-conventions.md` Part I | phase docs | medium (vs T01–T15, §3) | hyphenated, unpadded |
| Preservation rules | `P-TERM-1`…`P-TERM-6` | E | preservation-rule ID | six historical-terminology preservation rules | P-TERM-1–6 | process/current | defined `phase-b audit` §3; applied `documentation-conventions.md`/`consolidation-map.md` | phase docs | low-medium (P-cluster) | compound prefix disambiguates |
| Evidence-policy points | `P-3` | E | policy-point ID | seven adopted evidence policies | P-1–P-7 | process/current | `evidence-policy.md` §2 | checklist, phase docs | HIGH cluster (vs P1–P6 rules; hyphen is the only separator) | see §3 |
| Fixture family IDs | `case-blind-1-13`, `e15-family` | G | manifest entry ID (machine) | eight kebab-case family ids in fixture provenance manifest | fixed set of 8; extensible schema | process/current | `fixture-provenance.json` `_schemaNotes` | future registry candidate | low | Phase-C-created namespace |

### 1.5 Matrix / fixture / evidence naming conventions (vocabularies with systematic semantics)

| Namespace | Example | Cat | Object type | Meaning | Values/range | Status | Owner | Referenced by | Collision | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| Region short-names | `square500`, `rect43`, `full`, `half` | G | target-region label | four E15 target regions on the 1920×1080 canvas | 4 values | historical; reused by E17 | `build-e15-fixtures.mjs`; `e15-report.md` §2 | geometry-matrix cells, e17 matrix | low | `half`=480,270,960,540; `rect43`=100,100,800,600 |
| Embedding mechanism names | `svg-nested-region`, `img-none`, `background` | G | embedding-channel label | eight consumer embedding mechanisms under test | 8 values (typed union `src/e15/analysis.ts:11-18`) | historical; E17 reuse | `src/e15/analysis.ts`; e15-report §2 | matrices, specs | low | kebab, lowercase |
| SVG variant short-names | `vb1000`, `novb1920x1080`, `-min/-slice/-none/-max` | G | fixture-variant label | viewBox presence/size + PAR token variants | vb/novb × {1000,1920x1080} × PAR variants; `max`=xMaxYMax | historical | `build-e15-fixtures.mjs`, `build-e17-fixtures.mjs` | matrices, screenshots | low | compact encoding; decode table lives in builders |
| Variant letters | `C/D` (no-viewBox pair) | G | report-local variant shorthand | A/B = vb1000/vb1920, C/D = novb counterparts | A–D | historical (report prose) | `e15-report.md` §2 lines 21–22 | e15-report §4.1 | medium (letter overload §3) | prose-local; matrices use full names |
| Interpretation labels | `I-REGION-VIEWPORT` | B | candidate-interpretation label | analytic readings the pixel classifier scores against | 5 values (I-*) | historical; verbatim in matrices | `e15-report.md` §3 table | geometry-matrix.json, cross-engine-matrix.json, e17 | low | classifier vocabulary, immutable |
| Probe slug/probeId forms | `ramp-v4-svg-vb-region` / `N2-ramp-v4-svg-vb-region` | G | evidence-file/probe naming | slug = filename stem; probeId = N2- prefixed; report ID = R-V<n>; shorthand V<n> — FOUR surface forms, ONE object | v1–v7, m1–m3 stems | historical/generated | `tests/e2e/n2-viewer.spec.ts`; `evidence/viewer-matrix.json` fields `probeId`+`slug`; report IDs `viewer-interop-report.md` | screenshots n2/*, probe-*.json | medium (mapping burden) | a future registry should carry the mapping table |
| Evidence filename grammar | `cmp-e16-case05-43-full-b__contain.json`, `case-e15-firefox-vb1000--rect43.json` | G | generated-artifact naming | per-family grammars: `__<fit>` suffix (e16), `<variant>--<region>` double dash (e15), engine infix (e17), `parity-<n>.json`, `observations/<id>.json` | per family | generated/historical | producing specs/tests (utils.record, comparison tests) | reports cite them | low | rename-forbidden (T-6) |
| Landmark contract files | `e15-landmarks.json` | G | contract-file convention | per-generation landmark geometry contracts; e15 contract REUSED by e16/e17 | e15/e16/e17 | historical/current | builders | specs, analysis | low | reuse-by-reference, not copy |

### 1.6 Implementation constant inventories (code-level systematic vocabularies)

| Namespace | Example | Cat | Object type | Meaning | Values | Status | Owner | Referenced by | Collision | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| N6 diagnostic codes | `MISSING_VIEWBOX`, `TEMPORAL_HONORING_OPEN` | A | validator diagnostic-condition code | stable machine codes emitted in reports/evidence | 20 codes incl. `CONSUMER_CONFORMANCE_BLOCKED`, `ALIAS_NORMALIZED`, `MAPPING_EMERGED`, `NO_GEOMETRY_PROMISED`, `EPSILON_DECISION_RECORDED` (full set: `src/n6/types.ts`) | current/generated | `src/n6/types.ts` (string-literal types); surfaced via validator/run script | evidence/n6/*.json, n6 report §2 table, run-script matrixRows | low | classified A (they IDENTIFY emitted conditions, i.e., instances of output), not B; flagged §5 unresolved for registry placement |
| Renderer kind values | `"a" \| "b"` | C* | typed-axis value set | RendererKind union (URL/renderer param space includes blind/native too) | a,b (+blind,native at routing layer `main.ts:72-76`) | current implementation | `src/reference/lib/types.ts:106` | main.ts, specs | see letter cluster §3 | axis semantics: Phase B §2.1 |
| Mode/Model values | `"A"\|"B"`, `"A"\|"B"\|"C"` | C* | typed-axis value sets | IiifMode (blind), E14Model (shared evidence model) | 2 / 3 values | current implementation | `src/blind/types.ts` (`IiifMode`), `src/e14/types.ts:11` | renderers, comparisons | letter cluster | NOT identifiers of instances |
| Harness route keys | `MANIFEST_MAP` `"6"→exp1.json`, `text`, `security` | G | routing alias table | URL exp-value → manifest filename aliases | 3 entries | current implementation | `src/main.ts:226-230` | harness consumers | low | reason: text/security non-numeric names (log bug #8) |
| Lab globals / CSS hooks | `window.__lab`, `__e15`, `__e17`; `.ar-169/.ar-43/.ar-narrow/.ar-wide`, `.viewport` | G | test-hook naming convention | browser-exposed measurement APIs; aspect preset classes | small fixed sets | current implementation | `src/main.ts`, `src/e15/page.ts`, `src/e17/page.ts`, `style.css` | e2e specs | low | infrastructure; registry likely excludes |

---

## 2. NOT an identifier namespace (vocabulary/system inventory)

These must NOT become registry rows as IDs; the future registry should at most
point at their legends.

| System | What it is | Why not an identifier namespace | Definition site |
|---|---|---|---|
| Compatibility status | capability grades per row | classifies row state, identifies nothing | `compatibility-matrix.md` legend (S/G/B/S*) |
| Conformance-state vocabularies (md vs JSON) | requirement implementation status | two deliberate vocabularies; mapping lives only in `run-n6-suite.mts` | `conformance-matrix.md` Part A; script literals |
| Provenance taxonomies A–D | rule/divergence/requirement/consumer classification sets | labels classify; they do not name instances | blind packet; e14-report §3.2/§4; profile Part 3; viewer-interop-report |
| **Rare/orphan bracket labels**: `[VIEWER]`, `[IMPLEMENTATION]`, `[RECOMMENDATION]`, `[SUPPORTED]`, `[COMMUNITY PRACTICE]`, `[PROPOSAL]` | one-off classification tokens in reports/plan | ad-hoc labels; counts 1–2 each; several sit OUTSIDE the Phase C legend (gap finding — §4) | e15-report R3; final report §6; community-positioning §0; next-session-plan Stage 2/3 class lists |
| N3 source-type labels | external-source typing: `NORMATIVE, RECOMMENDATION, COMMUNITY, IMPLEMENTATION, SPEC-PROCESS` | describes sources, not repo objects | `n3-source-index.json` `sourceTypes` |
| n3 source ids | eleven citation ids (`iiif-prezi-3`, `w3c-media-frags`, …) | citation keys inside one JSON; local scope | `n3-source-index.json` `sources[].id` |
| `relatesTo` pointer values | free-form cross-refs mixing `P2`, `Q3`, `open-question-6`, `contradictions` | pointer FIELD values, not a namespace (mixed targets) | `n3-source-index.json` claims |
| Verdict scale A–E | session falsification grades | grades, not instance IDs | `findings.md` §Verdict |
| Comparison verdicts | pairwise outcome strings (`a==blind`, `!=` forms) | results, not identifiers | evidence e14/e16/e17 JSONs |
| `[OPEN]` vs `[UNKNOWN]` vs BLOCKED vs OPEN_FENCE | undetermined/inconclusive/not-realizable/open-fence states | states; distinctions already governed | profile Part 3; viewer-interop; n6 types |
| OPEN / ANSWERED / SUPERSEDED | register item states | status prefixes of register rows | `open-questions.md` legend |
| SUPERSEDED inline markers | correction markers in living tables | epistemic history data | compatibility-matrix rows; open-questions items |
| Confidence labels | audit-confidence words (`CONFIRMED/LIKELY/UNCERTAIN`; `"confidence":"high"` in n3 JSON) | meta-vocabulary; TWO coexisting sets (process docs vs n3 JSON) — noted as observation, not unified here | phase docs; n3-source-index |
| Fit keywords / PAR tokens / engines | `fill,contain,cover,meet,slice,none`; `xMinYMin…`; chromium/firefox/webkit | ordinary technical terms / config values | specs; playwright configs |
| External reference numbers | IIIF recipe numbers (0004, 0036, 0033, 0489, 0299), spec §§, Use Case 6 | EXTERNAL document coordinates — citations, not repo identifiers | community-positioning, reports |
| Code symbols & parameters | `RAW_PARITY_EXPS`, `EMBEDDING_SPACE`, K=0.25, TOL_MIN=0.8, ε=10⁻⁶ | ordinary code symbols/parameters | respective sources |
| Infra names | playwright project names, `test-results/`, git branches/tags (`n6`, `stage5`, `n6-complete-pre-consolidation`, `consolidation/inventory-audit`) | environment/ref metadata; git refs are process markers, not doc identifiers | configs; git |
| URL query vocabulary | `?exp= &renderer= &sanitize= &fit= &t=` | interface parameter names | `src/main.ts` |

---

## 3. Collision / Ambiguity Analysis

Ordered by reader risk. Nothing here is resolved by renaming (forbidden); the fix
dimension is documentation only.

1. **Letter overload cluster (HIGH).** Bare letters A/B/C mean: Renderer A/B
   (implementation, lowercase in URLs `renderer=a|b`), Mode A/B (IIIF version),
   Model A/B/C (composition), fixture suffixes `-a/-b/-c` (model encoding in
   filenames), verdict grades A–E, taxonomy meta-labels A–D, E15 variant letters
   A–D. Mitigated ONLY by axis-word discipline (conventions T-1). No true
   identifier collision (different syntactic contexts), maximum human confusion.
2. **P-cluster (HIGH).** `P1–P6` profile rules vs `P5a` vs evidence-policy points
   `P-1–P-7` vs pre-flight op `P-0` vs preservation rules `P-TERM-1–6`. The hyphen
   and the word TERM are the only separators; `P-1` (policy) vs `P1` (rule) differ
   by one character. Owners distinct (verified above).
3. **S-cluster (HIGH).** `S1–S8` subset rules vs `R-S1–R-S8b` requirements (alias
   pairs, intentional) vs `S1.0–S1.3` stopping conditions (next-session-plan) vs
   `S` capability grade vs `Stage 1` (whose conditions S1.x are!). Four objects,
   two syntaxes nearly identical (`S1` rule vs `S1.1` condition).
4. **Q-cluster (HIGH).** Three question spaces: open-question integers 1–15
   (unprefixed register), `Q1–Q10` N3 brief questions, `Q1.1–Q1.6` plan-stage
   questions; plus e16 §5's plain numbered answer list (prose enumeration, not an
   ID space). Same digit, different owners — a reader following "Q7" can land in
   either Q-family.
5. **T-cluster (MEDIUM).** `T01–T15` tests vs terminology rules `T-1–T-6`.
   Padding+hyphen distinguish mechanically; humans scanning prose will trip.
6. **R-cluster (MEDIUM-HIGH).** `R1–R5` E15 rules vs `R-S*` vs `R-V*` vs `RF01–04`
   vs op `R-1`. All distinct objects; prefix-sharing is dense.
7. **Probe naming redundancy (MEDIUM).** One Mirador probe = `M-M3` (report) =
   `M3` (profile shorthand) = `mirador-m3-canvas-as-body` (slug/file) =
   `N2-mirador-m3-canvas-as-body` (probeId). Mapping exists nowhere as a table;
   readers must infer. Same for Ramp V-probes.
8. **N-cluster (MEDIUM).** Generation `N2` vs op `N-2` vs probeId prefix `N2-` vs
   family id `n2-manifests`. Hyphen/case separations only.
9. **V-cluster (LOW-MEDIUM).** Probes V1–V7 vs sweep op `V-1`.
10. **Stage↔N duality (LOW-MEDIUM).** `Stage 6` ≡ `N6` — documented per-header but
    no single mapping table; `S1.x` conditions attach to `Stage 1`, worsening #3.
11. **Padding inconsistency (LOW).** blind `case6` vs e14 `case06` — both live,
    both cited; searches for one miss the other.
12. **E18 ghost (LOW).** Proposed ID never executed; absent from registries; a
    completeness-minded reader will hunt for it.
13. **X-cluster (NONE real).** `X1–X8` exclusions vs lowercase SVG tokens
    (`xywh=`, `xMidYMid`) — case+context fully separate; recorded to close the
    mission question.
14. **D/G/L/F mini-clusters (LOW).** `D1–D10` vs `DERIVED`/grade D; op `G-1` vs
    grade `G`; `L0–L6` unique (no collision found); `Finding <n>` vs `F<n>` are
    related-but-distinct families from different reports.
15. **Identifier-vs-status confusions (structural).** Recurring risk of reading
    `S4` (rule ID) as grade, `X7` fence as status, `OPEN_FENCE` code as taxonomy
    label — all are guarded by owner-document discipline; registry must repeat the
    guard.
16. **Unresolved:** whether N6 diagnostic codes should be presented in the future
    registry as an identifier namespace (chosen here: yes, category A) or as
    output vocabulary (B-flavored). Both defensible; needs human judgment.

---

## 4. Completeness Audit

### Confirmed namespaces (evidence-complete)
`exp*` · blind `case*` · `eNN-caseNN-{a,b,c}` · `E<n>` · `E18`(ghost) · `N<n>` ·
`Stage <k>` · `S1–S8` · `R-S*` · `X1–X8` · `T01–T15` · `RF01–RF04` · `P1–P6(+P5a)` ·
`R1–R5` · `Finding 1–6` · `F1–F8` · `H1–H5` · `Q1–Q10`(N3) · `Q1.1–Q1.6`(plan) ·
open-question integers · `bug-fix #1–#16` · `R-V*/V*` · `M-M*/M*` · `AMB-N6-1` ·
`D1–D10` · `L0–L6` · Phase letters · ops `P-0/R-1/G-1/V-1/N-2/D-DEF`(+sub-steps) ·
`T-1–T-6` · `P-TERM-1–6` · policy `P-1–P-7` · fixture family ids · regions ·
embeddings · variants(+letters) · `I-*` · probe slug/probeId forms · evidence
filename grammars · landmark-contract files · diagnostic codes · typed-axis value
sets · `MANIFEST_MAP` keys · lab globals/CSS hooks.

### Probable namespaces (systematic-looking, thinner evidence)
- `relatesTo` value conventions in n3 JSON (mixed pointers).
- Priority labels (`PRIORITY 1/2a/2b/3/4`) — plan-era prose numbering, weakly
  referenced later ("Priorities 2–3 unlocked" in e17-report).
- Answer-enumeration lists (e16 §5, e14 §5) — plain numbering, likely prose only.
- Git ref naming (`stage5` tag, `n6` branch) as era markers.

### Rejected candidates (examined, not namespaces)
Spec-section citations (§5.3…), IIIF recipe numbers, Use Case numbers, engine
names, PAR tokens, fit keywords, playwright project names, code symbols/constants
(K, ε, TOL_MIN, RAW_PARITY_EXPS…), URL query params, CSS classes/window globals
(listed §1.6 as conventions but recommended OUT of registry scope), test-results
paths, `dist/`.

### Unresolved candidates (need human judgment)
1. Registry placement of N6 diagnostic codes (A vs B) — §3.16.
2. Whether `Stage <k>` should be registered as an alias TABLE (recommended) or as
   a namespace row.
3. Whether probe four-form mapping deserves a dedicated registry subsection.
4. Orphan labels `[VIEWER] [IMPLEMENTATION] [RECOMMENDATION] [SUPPORTED]
   [COMMUNITY PRACTICE] [PROPOSAL]`: leave unregistered (historical ad-hoc) vs
   register with OWNER UNKNOWN/AMBIGUOUS annotations. Evidence: usage sites listed
   in §2; no defining table exists for most (the plan's Stage-2/3 class lists are
   proposals, not definitions).
5. Whether the two confidence-label sets should eventually be reconciled in the
   registry (out of scope to change now).

### Namespaces Phase C did NOT previously capture (new findings this phase)
`Q1–Q10` (N3) · `Q1.1–Q1.6` · `S1.0–S1.3` · `H1–H5` · `R1–R5` · `Finding 1–6` ·
`bug-fix #1–#16` · `Stage <k>` alias system · probe slug/probeId/report-ID/shorthand
four-form situation · six rare bracket labels outside the legend · n3 `sourceTypes`
as an additional label set · `E18` ghost · case-padding split · region/embedding/
variant matrix vocabularies as named systems · diagnostic-code full inventory ·
fixture-provenance family ids · op sub-numbering (`R-1.x`, `V-1.x`).

---

## 5. Recommended Scope for the Future `research/terminology.md`

Based only on this inventory (file NOT created now):

INCLUDE:
1. All confirmed namespaces from §4 group lists — as one master table with the
   13 mandated fields, ordered: experiment/generation → requirement/test →
   experiment-internal → process/governance → conventions.
2. An ALIAS/MAPPING appendix: S↔R-S pairs; Stage↔N; probe four-form map;
   shorthand (V#, M#, bug #N) → canonical forms.
3. The collision warnings (§3) as a "reading hazards" box, especially the letter
   overload and P/S/Q/T/R clusters.
4. Diagnostic codes (pending §4-unresolved-1 decision).
5. Explicit "NOT included" pointer list importing §2 (so the registry cannot
   become an acronym dump), plus the Phase C taxonomy legend by reference.

EXCLUDE: everything in §2 (vocabularies/statuses), §4-rejected candidates, and
infra naming — the registry links to their existing legends instead.

DESIGN PRINCIPLE to carry forward: "IDs provide traceability; names provide
comprehension." Prose spots currently leaning on unexplained IDs (profile-draft's
"N2 V4–V7/M2/M3" shorthand; e17-report's bare H*/F*; experiment-log's bare #N)
are hereby RECORDED as readability observations — no document is rewritten in
this phase.

---

## 6. Verification Record

- Created: `research/phase-e-identifier-inventory.md` (this file) — the ONLY file
  created or modified; left UNCOMMITTED by instruction.
- Evidence: 353 files before and after (verified post-write).
- `git status`: only this untracked file; no tracked file modified; no commits made.
- No suites executed; no evidence-producing command run.
