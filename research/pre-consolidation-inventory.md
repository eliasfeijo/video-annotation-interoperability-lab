# Pre-Consolidation Repository Inventory

Phase A deliverable. Audit only — nothing in the repository was moved, renamed,
modified, or deleted to produce this document. Confidence labels:
`CONFIRMED` (verified by direct file/git inspection), `LIKELY` (strong but
indirect evidence), `UNCERTAIN` (not established).

---

## 1. Baseline

| Item | Value |
|---|---|
| Branch | `consolidation/inventory-audit` |
| Created from tag | `n6-complete-pre-consolidation` |
| Baseline commit | `8f5efa6` "docs: add N6 implementation report" |
| Tag verified on HEAD | yes (`git log --decorate`: tag and branch both at `8f5efa6`) |
| Working tree at start | clean, on branch `n6`, same commit |
| Tracked files | 640 total: evidence/ 353, public/ 170, src/ 45, tests/ 27, research/ 18 (+ docs/ 4, scripts/ 9, root configs) |
| Repo purpose | Falsification-driven research lab: can Web Annotation + Media Fragments + IIIF Presentation + SVG express portable temporal/spatial graphical video overlays without new vocabulary? Verdict so far: **B** (holds with documented gaps), refined through E14–E17 into a draft profile (N4/N5) with a resource conformance validator (N6). |

Commit chronology (verified via `git log --oneline --reverse`):

```
993d82a initial commit (exp1–7 era: plan, findings, fixtures, harness)
eafcdba..f05d120   blind renderer generation (E12/E13)
e0b848b..9eae868   E14; then bcd3ad7/447fd9c cross-cutting fixes
66fe59d..2f13b03   E15
4ac3773..2109591   E16
4822e64            next-session plan (E17/N1 → N4 roadmap)
fa506ce..5734e2a   E17 (N1 cross-engine)
6fd5380..580f26b   N2 real-consumer probes
014d202            N3 community positioning
a75e241            N4 safe-subset decision
8807224, 23e7f50   N5 profile draft + conformance matrix
0014642..8f5efa6   N6 validator + suite + evidence + report  ← baseline tag
```

---

## 2. Repository Layers

| Layer | Location | Role |
|---|---|---|
| Root harness | `index.html`, `src/main.ts`, `src/experiments.ts`, `src/style.css` | Vite lab page exposing `window.__lab`; routes `?exp=`/`?renderer=` to all renderer generations |
| Interpretation packets | `docs/` (4 files) | blind-renderer rules (declared normative input), blind experiment report, ambiguities ledger, IIIF 3-vs-4 comparison |
| Fixtures | `public/svg/**` (79 files incl. landmark JSONs), `public/manifests/**` (86), `public/video/test-grid-1920x1080-30s.mp4`, lab pages `public/e15-lab.html`, `public/e17-lab.html`, `public/viewer-check.html`, `public/mirador-check.html` | inputs for every experiment |
| Renderers / implementations | `src/reference/` (Renderer A library + Renderer B oracle), `src/blind/` (independent renderer), `src/native/` (browser `<img>` pipeline), per-experiment analysis code `src/e14/ src/e15/ src/e16/ src/e17/`, validator `src/n6/` | resolution/comparison machinery |
| Tests | `tests/*.test.ts` (Vitest unit + comparison), `tests/e2e/*.spec.ts` (Playwright; default config = Chromium historical suite, plus dedicated `playwright.e17.config.ts`, `playwright.n2.config.ts`) | verification + evidence producers |
| Scripts | `scripts/build-fixtures.mjs`, `build-e14/e15/e16/e17/n2-fixtures.mjs`, `generate-video.mjs`, `e17-aggregate.mjs`, `run-n6-suite.mts` | deterministic fixture/evidence generators |
| Evidence (immutable archive) | `evidence/observations/` (E1–E11-era machine observations), `evidence/blind-comparison/`, `evidence/e14|e15|e16|e17/`, `evidence/n6/`, `evidence/viewer*/`, `evidence/screenshots/**` | machine-readable results + screenshots per generation |
| Research documents | `research/` (18 files): plan → findings → per-experiment reports → matrices → profile → conformance matrix → N6 report, plus open questions, experiment log, session plans | interpretation layer / claims |

Layering rule observed throughout the repo's own honesty constraints
(`research/next-session-plan.md` §"Global honesty constraints"):
renderers must never share resolution logic; only comparison infrastructure may
know two sides. Any consolidation MUST preserve this.

---

## 3. Experiment / Family Inventory

Numbering note (CONFIRMED): the main experiment-log table numbers rows 1–11 then
14–17. Rows **12/13 are absent from the table**, but `docs/blind-interpretation-rules.md`
line 3 declares itself "normative input to the Blind Renderer (**experiment 12/13**)"
and `research/next-session-plan.md` refers to "E1–E13 observations". So the blind
renderer generation occupies the E12/E13 slot even though the log never says so.
The gap is a numbering hazard for consolidation, not missing history.

### 3.1 exp1–exp7 (+ text, security) — initial generation

```text
scripts/generate-video.mjs → public/video/test-grid-1920x1080-30s.mp4
scripts/build-fixtures.mjs → public/svg/exp*.svg, security-*.svg, text-*.svg
                            → public/manifests/exp{1,2,3,4,5a,5b,5c,7,7-animate}.json
                            → public/manifests/exp-{text,security}.json
                            → public/manifests/exp7-keyframes.json (NON-STANDARD, labelled)
      ↓ consumed via index.html?exp=N (MANIFEST_MAP in src/main.ts:226 maps "6"→exp1.json, text/security)
src/reference/lib/iiif.ts (Renderer A) + src/reference/renderers/rendererB.ts (oracle, refs in src/experiments.ts)
      ↓ tests: unit (iiif/selectors/svg/timing.test.ts), e2e exp1–7.spec.ts, parity.spec.ts
evidence/observations/{exp1..7,text,security,iiif-validation,parity-*}.json
evidence/screenshots/{exp1..7,text,security}/*.png
      ↓ research/findings.md + research/experiment-log.md + research/plan.md (verdict B)
```

Status of each link: CONFIRMED by file inspection. Renderer-B references for exp4
are baked-coordinate oracles (`rawEqual:false`, geometric parity < 2.5 units) — CONFIRMED in `src/experiments.ts`.

### 3.2 Blind renderer generation (E12/E13)

```text
commit cbd0880 added case1–13 fixtures DIRECTLY (public/manifests/case{1..13}.json,
public/svg/case*.svg). NO generator script for them exists in the current tree
(build-fixtures.mjs writes only exp*/text/security). Regeneration impossible
from current scripts. UNCERTAIN whether a generating script ever existed.
docs/blind-interpretation-rules.md  ← declared ONLY permitted input
      ↓ src/blind/* (parser, selectors, placement, resolver, compositor, sanitize…)
tests/blind.test.ts (unit, mocked fetch), tests/blind-comparison.test.ts (semantic diff vs Renderer A)
tests/e2e/blind.spec.ts (?exp=caseN&renderer=blind via main.ts fallback naming, line 228)
      ↓
evidence/blind-comparison/case{1..13}.json + summary.json
evidence/screenshots/blind/*.png ; observations: blind-case6-aspects.json, blind-clean-parity.json
      ↓ docs/blind-renderer-report.md, docs/ambiguities.md §1–4
```

### 3.3 E14 — painting composition & SVG resource semantics

```text
scripts/build-e14-fixtures.mjs → public/svg/e14/* (incl. e14-red-circle.png, a PNG raster body
                                 generated via pngjs inside the script) + public/manifests/e14/*
                                 + shared inner manifest public/manifests/e14/inner-overlay.json
      ↓ three renderers: src/reference/lib/e14.ts (Renderer A E14 logic),
        src/blind/e14.ts (Blind E14 extension), src/native/resolver.ts+stage.ts (Native <img>)
comparison harness src/e14/comparison.ts + types
      ↓ tests/e14-comparison.test.ts (unit, writes evidence/e14/*.json),
        tests/e2e/e14.spec.ts (browser probes → evidence/observations/e14-*.json, screenshots/e14/)
        tests/e2e/viewer.spec.ts (Ramp probe; network-gated; also uses exp1.json + viewer-plain.json)
      ↓ research/e14-report.md (35/39 identical; designed divergences case06/07 no-viewBox OPEN,
        case13 MF §6.2 ambiguity, case16 security policy gap)
```

### 3.4 E15 — SVG embedding semantics matrix

```text
scripts/build-e15-fixtures.mjs → public/svg/e15/e15-{vb1000,vb1920x1080,novb1000,novb1920x1080}
                                 [+ -min,-slice,-none PAR variants].svg
                                 + public/svg/e15/e15-landmarks.json (landmark CONTRACT reused later by e16/e17)
                                 + public/manifests/e15/e15-manifest.json (region provenance)
      ↓ measurement stage src/e15/page.ts served at /e15-lab.html; classifier thresholds live in
        tests/e2e/e15.spec.ts (K=0.25, tol ≥ 0.8); pure analysis in src/e15/analysis.ts
      ↓ tests/e2e/e15.spec.ts (176 cells, Chromium)
evidence/e15/{summary,geometry-matrix,intrinsics}.json + case-e15-*-<variant>--<region>.json
evidence/e15/screenshots/*.png
      ↓ research/e15-report.md (R1–R5 classifications; P1 viewBox rule NOT falsified — strengthened;
        exposed lab-wide /yMid/i bug #13 fixed in 4 placement implementations)
```

### 3.5 E16 — nested Canvas composition

```text
scripts/build-e16-fixtures.mjs → public/manifests/e16/e16-case{01..08}-{...}-{a,b}.json
                                 + inner-{169,43,square}.json + public/svg/e16/*.svg + e16-landmarks.json
      ↓ resolvers unchanged (A=e14 path, blind, native) under nestedFit fill|contain;
        analysis src/e16/comparison.ts; wired into main.ts (?exp=e16-case*)
      ↓ tests/e16-comparison.test.ts (writes evidence/e16/cmp-*__{fill,contain}.json, modeA-twins.json,
        landmark-spot-check.json), tests/e2e/e16.spec.ts (native-channel probes; screenshots/e16/)
      ↓ research/e16-report.md ("scaled to fit" [OPEN], 386-unit divergence, leaf-PAR collapse [BROWSER],
        stable 3.0 §5.3 supersedes E14 draft-only claim)
```

### 3.6 E17 — N1 cross-engine replication

```text
reuses ALL e15 fixtures + new scripts/build-e17-fixtures.mjs → public/svg/e17/e17-vb1000-max.svg
      ↓ /e17-lab.html + src/e17/page.ts (xMaxYMax cells); classifier lifted verbatim into src/e17/classify.ts
runner playwright.e17.config.ts (projects chromium/firefox/webkit, testMatch pinned to e17.spec.ts)
      ↓ tests/e2e/e17.spec.ts → evidence/e17/{summary,cross-engine-matrix,intrinsics-*,case-*}.json
        aggregated by scripts/e17-aggregate.mjs ; screenshots/e17/<engine>/
      ↓ research/e17-report.md (62/62 unanimous; zero divergences; [BROWSER] upgraded to tri-engine,
        explicitly NOT promoted to [NORMATIVE])
```

### 3.7 N2 — real-consumer probes

```text
scripts/build-n2-fixtures.mjs → public/manifests/n2/{n2-temporal,n2-spatial,n2-svg-vb,n2-svg-novb,n2-raster}.json
hosts: public/viewer-check.html (Ramp UMD), public/mirador-check.html (Mirador 3 CDN)
also reuses public/manifests/viewer-plain.json and e16-case03-sq-full-a.json (cross-generation fixture reuse)
      ↓ playwright.n2.config.ts (chromium-only, pinned testMatch) → tests/e2e/n2-viewer.spec.ts
evidence/viewer-matrix.json (10 probe rows R-V1..V7, M-M1..M3) + evidence/viewer/probe-*.json
evidence/screenshots/n2/*.png
      ↓ research/viewer-interop-report.md (Ramp 5.1.1 crashes on ANY secondary painting body;
        Mirador 3.4.3 silently drops them; temporal honoring unobserved → [UNKNOWN])
historical predecessor: viewer.spec.ts (E11/E14 era Ramp probes, evidence/observations/viewer-*.json,
screenshots/viewer/) — kept frozen; N2 extends rather than replaces it (CONFIRMED, report §cross-check)
```

### 3.8 N3 — community positioning (documentary)

```text
inputs: e17-report + viewer-matrix + primary specs (live fetches recorded in research/n3-source-index.json, 11 sources)
output: research/community-positioning.md + n3-source-index.json (machine-readable claim index)
no fixtures/evidence dirs of its own. Key results: P1/P2 have NO external anchor ([CONVENTION]);
Cookbook recipe 0004 independently converges with P5a; Cookbook self-contradicts on z-order direction.
```

### 3.9 N4 — safe-subset decision (documentary)

```text
research/n4-safe-subset.md (Parts 1–8): P5a adopted as SAFE INTEROPERABILITY SUBSET;
negative guarantees; decision log. No code/fixtures. Feeds profile-draft S-rules.
NOTE (cosmetic, CONFIRMED): the headings "## PART 6 - SAFE INTEROPERABILITY SUBSET" and
"## SAFE INTEROPERABILITY SUBSET (N4)" duplicate the phrase as adjacent section titles.
```

### 3.10 N5 — profile draft + conformance design (documentary)

```text
research/profile-draft.md (Parts 1–17; requirement blocks R-S1…R-S8b, exclusions X1–X8,
provenance taxonomy [NORMATIVE]/[BROWSER]/[COMMUNITY]/[DERIVED]/[PROFILE]/[OPEN])
research/conformance-matrix.md (Part A requirement matrix; Part B pre-registered T01–T15 design,
"NOT implemented in this stage"; RF01–RF04 future consumer checks)
```

### 3.11 N6 — resource conformance validator (see §11 for focused audit)

```text
src/n6/{types,canvas,svg,fragments,aspect,mapping,exclusions,validator,suite}.ts
tests/n6-conformance.test.ts ; scripts/run-n6-suite.mts → evidence/n6/*
research/n6-implementation-report.md
```

---

## 4. Provenance Map

Format: chain with status per link. Only chains verified in this session are listed
as CONFIRMED end-to-end.

| # | Chain | Status |
|---|---|---|
| P-1 | `scripts/build-fixtures.mjs` → root exp/text/security SVG+manifests → exp1-7 e2e/unit tests → `evidence/observations/*`, `screenshots/{exp1..7,text,security}/` → `findings.md` | CONFIRMED (script outputs, consumers, evidence names all match) |
| P-2 | commit cbd0880 → `case1–13` fixtures → blind tests/specs → `evidence/blind-comparison/`, `screenshots/blind/` → `docs/blind-renderer-report.md` | CONFIRMED chain; PRODUCER SCRIPT ABSENT (fixtures have no current generator) |
| P-3 | `build-e14-fixtures.mjs` → e14 manifests/SVGs → 3 renderers → `evidence/e14/*` + `observations/e14-*` + `screenshots/e14/` → `e14-report.md` | CONFIRMED |
| P-4 | `build-e15-fixtures.mjs` → e15 SVG variants + landmarks + manifest → `/e15-lab.html` (`src/e15/page.ts`) → `evidence/e15/*` → `e15-report.md` | CONFIRMED |
| P-5 | e15 fixtures (REUSED) + `build-e17-fixtures.mjs` → `/e15-lab.html`,`/e17-lab.html` → tri-engine runs → `evidence/e17/*` → `e17-report.md` | CONFIRMED |
| P-6 | `build-e16-fixtures.mjs` → e16 manifests (inner Canvas bodies reference `inner-*.json` via partOf) → main.ts e14/e16 path → `evidence/e16/*` → `e16-report.md` | CONFIRMED |
| P-7 | `build-n2-fixtures.mjs` → n2 manifests → viewer/mirador host pages → n2-viewer.spec → `viewer-matrix.json` + `probe-*.json` + `screenshots/n2/` → `viewer-interop-report.md` | CONFIRMED |
| P-8 | `profile-draft.md` + `conformance-matrix.md` Part B (pre-registered T01–T15) → encoded verbatim in `src/n6/suite.ts` → executed by `run-n6-suite.mts` → `evidence/n6/case-T*.json` → asserted by `tests/n6-conformance.test.ts` | CONFIRMED (suite.ts header states the encoding relationship; matrix rows and case IDs match) |
| P-9 | `scripts/run-n6-suite.mts` lines 55–74 (hardcoded `matrixRows`) → `evidence/n6/conformance-matrix.json` | CONFIRMED (byte-level correspondence inspected) |
| P-10 | `evidence/n6/summary.json.buildContext.gitCommit = 23e7f50` (the N5 commit, BEFORE N6 code commits) | CONFIRMED — N6 evidence was generated while N6 files were untracked/additive; matches n6-report §Validation record |
| P-11 | N6 → `src/blind/svg-root.ts` (`readSvgRootAttrs`) and `src/blind/placement.ts` (`computePlacement`) | CONFIRMED import statements in `src/n6/svg.ts`, `src/n6/validator.ts` — N6 depends on the blind generation's helpers |
| P-12 | e15 Chromium screenshots ≡ e17 Chromium screenshots for re-measured cells | CONFIRMED for sampled pairs — byte-identical SHA256 (e.g. `vb1000none-half-nested-region.png` == `e17/chromium/e15-vb1000-none.svg-half-nested-region.png`; same for slice pair) |
| P-13 | `evidence/observations/*` written by Playwright helper `record()` in `tests/e2e/utils.ts:110-113` | CONFIRMED |
| P-14 | README layout section ↔ actual tree | BROKEN — README names `src/lib/*`, `src/renderers/dom.ts`, `src/renderers/rendererB.ts`; actual paths are `src/reference/lib/*`, `src/reference/renderers/*` (dirs `src/lib`, `src/renderers` do not exist; relocation happened in commit eafcdba) |
| P-15 | `findings.md`/README test-count claims ("37 unit", "19 E2E") ↔ current suites (147 historical + 32 N6 unit; 61+ E2E) | STALE-BY-DESIGN — counts are point-in-time snapshots in older docs; experiment-log carries updated totals |
| P-16 | `viewer.spec.ts` (E11/E14) Ramp findings ↔ N2 extension claims | CONFIRMED consistency (n2 report §Historical-evidence cross-check explicitly extends, does not modify) |

Not invented where not verifiable: no provenance is claimed for the case1–13 authoring
process beyond the committing commit, nor for exact regeneration order of refreshed
screenshot commits (f05d120, e08522d, cd43c66, b02fe11 — message text indicates
regenerated-by-E2E-run refreshes).

---

## 5. Source-of-Truth Candidates

For each important concept, the currently apparent source of truth:

| Concept | Apparent source of truth | Rating |
|---|---|---|
| Blind-renderer interpretation semantics | `docs/blind-interpretation-rules.md` (self-declared "only source of interpretation rules" for the blind renderer) | CLEAR |
| Experiment definitions E14–E17 | respective `research/e1X-report.md` Method sections | CLEAR |
| Pre-registered expected outcomes T01–T15 | `research/conformance-matrix.md` Part B (design origin) **and** `src/n6/suite.ts` (calls itself "Single source of truth"; header says expectations are "encoded once" there). TWO artifacts claim primacy; they currently agree. | PROBABLE dual-source — conflict dormant |
| Landmark geometry contract | `public/svg/e15/e15-landmarks.json` (explicitly "recorded per file"; e16/e17 reuse the contract) | CLEAR |
| Measured geometry results E15/E17 | `evidence/e15/geometry-matrix.json`, `evidence/e17/cross-engine-matrix.json` | CLEAR |
| Consumer-probe outcomes | `evidence/viewer-matrix.json` | CLEAR |
| Conformance requirements (what MUST hold) | `research/profile-draft.md` Parts 4–10 (R-S1…R-S8b, X1–X8); mirrored in `conformance-matrix.md` Part A; re-stated as literals in `run-n6-suite.mts`. Three representations, one semantic origin. | PROBABLE (profile-draft primary; mirrors exist) |
| Capability/gap status over time | `research/compatibility-matrix.md` (S/G/B rows, contains inline SUPERSEDED markers) | PROBABLE — it mixes current status with preserved history in one table |
| Overall research verdict | `research/findings.md` verdict B for exp era; superseded/refined layers in `e15-e16-final-report.md`, `community-positioning.md` §10, `profile-draft.md` | NO_CLEAR_SOURCE_OF_TRUTH for "current best single statement" — deliberately layered, never consolidated |
| Terminology definitions | scattered: blind packet (interpretation classes), profile-draft Part 2 TERMINOLOGY, e15-report candidate interpretations I-* | PROBABLE (Part 2 exists but other docs redefine overlapping terms informally) |
| Fixture regeneration procedure | per-family build scripts EXCEPT case1–13 (no generator) | PROBABLE with one known hole |
| Canonical fragment prefix | `percent:` canonical, `pct:` alias (N6 fragments.ts; consistent with e14-report recommendation) | CLEAR |

---

## 6. Duplicate / Parallel Artifacts

| Observation | Evidence | Classification |
|---|---|---|
| Renderer A logic exists twice: `src/reference/lib/iiif.ts` (exp-era resolver used by main.ts for exp/case paths) AND `src/reference/lib/e14.ts` (E14+ resolver used for e14/e16 paths). Both ACTIVE, different feature sets (e14.ts handles models/painting composition). | main.ts imports both; separate call sites | INTENTIONAL_DUPLICATION (generation layering), consolidation-sensitive |
| `asArray` implemented locally in `blind/parser.ts`, `blind/e14.ts`, `native/resolver.ts`, `n6/validator.ts` PLUS exported once from `reference/lib/asArray.ts` (imported only by `reference/lib/e14.ts`). Local copies are deliberate independence; the exported one is intra-reference sharing. | grep across src | MIXED: local copies INTENTIONAL; `reference/lib/asArray.ts` itself POSSIBLE_DUPLICATION candidate |
| Selector/temporal/svg-root/sanitize parsing re-implemented per renderer (reference, blind, native) | repo honesty constraint #3 mandates this | INTENTIONAL_DUPLICATION — must NOT be merged |
| e15 vs e17 screenshots for identical Chromium cells byte-identical (sampled 2/2 pairs) | SHA256 equality | POSSIBLE_DUPLICATION (independent re-captures that happen to be identical; both are evidence of distinct runs) |
| `parity-*.json` (34 bytes each, `{"diffs":[]}` style stubs) overlap with richer per-exp observation JSONs | evidence/observations | POSSIBLE_DUPLICATION (aggregated claim duplicated at different granularity) |
| case1 fixture ≈ exp1 fixture semantics (t=10,15 red circle); `case1-circle.svg` (160B) vs `exp1-circle.svg` (249B) are distinct files with equivalent intent | file inspection | POSSIBLE_DUPLICATION (parallel fixture families for parallel renderer generations) |
| `evidence/blind-comparison/case1.json` vs `case6.json` | hashes differ | UNCERTAIN (sizes equal at 2959B but content differs; case6 adds aspect dimension) |
| Multiple restatements of the headline finding "explicit viewBox restores determinism / no-viewBox is hazardous": e15-report §4/§6, e15-e16-final-report §1, compatibility-matrix rows, e17-report F1/F2, profile-draft R-S1/X2, community-positioning §1 | doc set | INTENTIONAL_DUPLICATION (layered conclusions with explicit SUPERSEDED markers where applicable) — canonicalization must pick one home without erasing layers |
| Ramp-crash finding appears in: findings.md (#11), e14-report §5, viewer-interop-report, viewer-matrix.json, community-positioning §4 | doc set | INTENTIONAL_DUPLICATION with REFINEMENT (each later version widens scope: SVG → any secondary body) |
| `inner-overlay.json` referenced by five e14 `-b` manifests; `inner-{169,43,square}.json` shared across e16 cases | manifest inspection | INTENTIONAL_DUPLICATION (shared inner canvases by design) |
| Two Playwright runner configs pin disjoint testMatches (default config ↔ historical suite; e17 config ↔ e17 spec; n2 config ↔ n2 spec) | configs | INTENTIONAL_DUPLICATION (isolation pattern documented in config comments) |
| n4-safe-subset.md duplicated section titles "SAFE INTEROPERABILITY SUBSET" | headings | UNCERTAIN (cosmetic; likely editorial slip, harmless) |

No duplicate was removed; all remain untouched.

---

## 7. Terminology Inventory

Potentially ambiguous/overloaded terms. This is an inventory, not a proposal.

| Term | Where it occurs | Apparent meaning in context | Conflict/overload | Confidence |
|---|---|---|---|---|
| **Renderer A** | README, reports, main.ts comments | standards-driven IIIF Presentation resolver | Implemented by two different modules across generations (`iiif.ts` vs `e14.ts`); also generically called "the reference implementation" | CONFIRMED overload |
| **Renderer B** | experiments.ts, rendererB.ts | direct-reference ORACLE, deliberately non-standard | Name sits inside directory `src/reference/` whose name suggests authority; README separately calls B "the deliberately-simple reference". "Reference" therefore denotes both Renderer A's library dir and Renderer B's role | CONFIRMED overload |
| **Blind** | src/blind/, docs/, tests | independent implementer who has never seen Renderer A (methodological blinding) | Easily misread as "hidden/occluded rendering" or accessibility term; also the module N6 imports helpers FROM (so N6 is not fully "independent" of blind) | CONFIRMED |
| **Native** | src/native/, reports | rendering through the browser's real `<img>` pipeline (SVG-as-image) | Also colloquially "native browser behavior" generally ([BROWSER] class), and `object-fit` native defaults | LIKELY confusion risk |
| **Mode A/B** vs **Model A/B/C** vs **Renderer A/B** | docs/iiif-3-vs-4.md (Mode = IIIF version semantics), e14-report (Model = composition structure), everywhere (Renderer = implementation) | three orthogonal axes that sound identical | HIGH overload: "Model B" (nested Overlay Canvas) vs "Mode B" (IIIF 4.0 semantics) vs "Renderer B" (oracle) | CONFIRMED — highest-risk terminology cluster |
| **conformance** | conformance-matrix.md, src/n6, n6 report | profile-requirement compliance (resource-side static checks; consumer side BLOCKED) | Distinct from **compatibility** (S/G/B capability matrix) and from IIIF official-validator "okay:1" usage in exp10 | CONFIRMED distinction, easily blurred |
| **compatibility** | compatibility-matrix.md, playwright configs | stack capability S/G/B | overlaps colloquial "viewer compatibility" (VIEWER_GAP rows) | LIKELY |
| **parity** | parity.spec, parity-*.json, findings | resolved-set equality between Renderer A and B (exp era) | Later generations use "comparison"/"agreement"/"verdicts" (`a==blind`) for analogous-but-different checks; "clean parity" phrasing persists in README TL;DR | CONFIRMED drift |
| **portability** | mission statements | end-to-end property across viewers/environments | Used loosely in README prose vs strictly in profile negative-guarantees (where portability is NOT guaranteed for excluded channels) | LIKELY |
| **safe subset** | n4-safe-subset.md, profile P5a | same-aspect (target aspect == inner canvas aspect) interoperable subset | Section title duplication in the doc; also "safe subset" occasionally glossed as the whole profile scope | PROBABLE minor |
| **canonical** | n6 fragments.ts ("canonical form stays percent:"), n6 validator ordering ("canonically sorted"), T08 order-neutrality | two meanings: value normalization vs output ordering determinism | Same word, unrelated semantics within one stage | CONFIRMED |
| **intrinsic** | SVG 1.1 §7.12 intrinsic size; "intrinsic-fit expectation" (exclusion X2); naturalWidth probes | intrinsic dimensions of an SVG resource | vs "intrinsic canvas stretched" behavior descriptions; exclusion X2 bans RELYING on it — the word appears both as fact and as forbidden-assumption | LIKELY |
| **viewport** | CSS viewport presets (exp6 aspect classes), SVG viewport (region-as-viewport P2/R-S2), `<svg>` element viewport | three distinct geometries | exp6 "viewport" = page window; P2 "viewport" = target region acting as SVG viewport | CONFIRMED overload |
| **viewBox** | everywhere | coordinate-system attribute | Consistent technical meaning; ambiguity lives in its ABSENCE semantics (three readings), which the repo classifies rather than resolves — do not "fix" wording without preserving [OPEN] fences | CONFIRMED consistent |
| **region** | xywh target region; region-painting mechanisms; Mirador target-side region highlights | target rectangle vs embedding mechanism family vs selector-shape area | Mostly disambiguated by context; SvgSelector "region" (selection) differs from painting "region" | LIKELY |
| **temporal/spatial** | fragments, R-S6a/R-S8a/R-S8b | syntax permission vs consumer HONORING are deliberately separated | Docs sometimes say "temporal supported" meaning syntax-only; R-S8b fence exists precisely to prevent that reading | CONFIRMED trap for consolidators |
| Provenance taxonomies | three sets coexist: (1) blind packet classes `[NORMATIVE]/[DERIVED]/[CONVENTION]/[OPEN]`; (2) E14 divergence classes `IMPLEMENTATION_GAP/VIEWER_GAP/CONVENTION/OPEN`; (3) profile six-class system adding `[BROWSER]/[COMMUNITY]/[PROFILE]`; N2 adds `[CONSUMER]/[UNKNOWN]` | overlapping classification vocabularies for different object types | No single legend maps them; Phase B will need the mapping table | CONFIRMED |

---

## 8. Historical Layers

| Layer | Commits | Artifacts | Status |
|---|---|---|---|
| Early experiments (exp1–11) | 993d82a | fixtures exp*/text/security, observations exp*–text/security/iiif-validation, plan/findings/log, README | ACTIVE (still exercised by default e2e suite + parity.spec) but historically superseded as *claims* by later layers |
| Blind generation (E12/E13) | eafcdba–f05d120 | src/blind core, case1–13 fixtures, blind-comparison evidence, interpretation packet | ACTIVE (renderer still wired into main.ts; N6 reuses its helpers) |
| E14 | e0b848b–9eae868 | e14 fixtures/renderers/tests/evidence/report; native renderer born here | ACTIVE (harness paths live); some CLAIMS superseded (draft-only Model B → corrected by E16; marked inline) |
| Cross-cutting fixes | bcd3ad7, 447fd9c | PAR token fix (#13), IIIF-native target/array partOf acceptance (#14) | ACTIVE (in all resolvers) |
| E15 | 66fe59d–2f13b03 | e15 fixtures/lab page/spec/evidence/report | ACTIVE (fixtures reused by E17; lab page live) |
| E16 | 4ac3773–2109591 | e16 fixtures/analysis/spec/evidence/report | ACTIVE; e16.spec.ts deliberately FROZEN with latent race pattern (experiment-log #16) — historical artifact by explicit decision |
| E17 | fa506ce–5734e2a | multi-engine runner, classify/page, evidence, report | ACTIVE (most recent browser evidence) |
| N2 | 6fd5380–580f26b | consumer hosts, n2 manifests, viewer-matrix, report | ACTIVE (network-dependent re-runs possible) |
| N3 | 014d202 | positioning doc + source index | REFERENCED (input to N4/N5) |
| N4 | a75e241 | safe-subset decision | REFERENCED (basis of profile) |
| N5 | 8807224, 23e7f50 | profile-draft + conformance-matrix | ACTIVE (normative design input to N6) |
| N6 | 0014642–8f5efa6 | src/n6, tests, script, evidence, report | ACTIVE — most recent completed stage |
| Shared infrastructure | generate-video.mjs, video mp4, vitest/vite/tsconfig, utils.ts | ACTIVE throughout |

Likely orphaned: none confirmed dead. Uncertain items listed in §9.

---

## 9. Orphan Candidates

Nothing is deleted; these are candidates for Phase B scrutiny only.

| Item | Why flagged | Status |
|---|---|---|
| case1–13 fixture family has no generator script (added wholesale in cbd0880) | regeneration impossible; drift risk if exp-family script rerun nearby | ORPHAN_CANDIDATE (producer-less, not consumer-less) |
| `src/reference/lib/asArray.ts` | imported by exactly one consumer (`reference/lib/e14.ts`) while four sibling modules keep private copies | ORPHAN_CANDIDATE (weak) |
| README Layout section paths (`src/lib/…`, `src/renderers/…`) | stale since eafcdba relocation | DOCUMENTATION DRIFT — repair belongs to a later phase |
| `evidence/screenshots/exp6/epx6-*.png` filenames ("epx6" typo) | cosmetic historical naming; referenced by findings/log tables as-is | HISTORICAL (do not rename; doc references match the typo) |
| `public/svg/e14/e14-red-circle.png` | PNG living under svg/ tree (raster-body fixture generated by build-e14 script via pngjs) | UNCERTAIN placement, CONFIRMED consumed by e14 `-c` manifests |
| `evidence/observations/parity-*.json` micro-files | 34-byte stubs duplicating parity info carried in per-exp JSONs | POSSIBLE_DUPLICATE (see §6) |
| `playwright.n2.config.ts` / `playwright.e17.config.ts` | active, but only reachable via explicit `--config` (not wired into package.json scripts) | UNCERTAIN (usage documented in reports' Reproduce sections, not in npm scripts) |
| `test-results/` | untracked gitignored Playwright output present on disk | IGNORED (out of repository proper) |

Programmatic check performed this session: every file under `public/svg/` (79/79) is
referenced by at least one of src/tests/scripts/public-manifests/research; no unreferenced
SVG fixture exists. Manifest consumption is via URL construction (`?exp=` names), so
"no literal reference" does not imply orphanhood (verified for case*/exp5a-c).

---

## 10. Cross-Reference Issues

Recorded only — nothing repaired.

| Issue | Location | Kind |
|---|---|---|
| README layout lists `src/lib/selectors.ts`, `src/lib/timing.ts`, `src/lib/svg.ts`, `src/lib/iiif.ts`, `src/lib/sanitize.ts`, `src/renderers/rendererB.ts`, `src/renderers/dom.ts` | README.md §Layout | STALE PATHS (files relocated to `src/reference/lib|renderers/`) |
| `evidence/n6/summary.json.buildContext.gitCommit` = `23e7f50…` (pre-N6 commit) | evidence/n6/summary.json | SUSPICIOUS-LOOKING BUT DOCUMENTED (generation ran before N6 files were committed; see n6 report validation record) |
| Experiment log numbering jumps 11 → 14 (rows 12/13 never tabulated; blind generation occupies those slots per other docs) | research/experiment-log.md | NUMBERING GAP |
| Test-count claims differ per document vintage (37 → 125 → 147 → 179; 19 → 61 → more E2E) | README vs findings vs experiment-log vs n6 report | POINT-IN-TIME DRIFT (each doc internally honest; no consolidated counter exists) |
| AMB-N6-1 arithmetic discrepancy: formula `W'·H == H'·W` stated 3× consistently; illustrative parentheticals quote `2,073,600` (= H·W) in `conformance-matrix.md` Part B T12 and `profile-draft.md` Part 14 Example B | both files | DOCUMENTED UNRESOLVED DISCREPANCY — awaiting Phase-B decision; verdict unaffected either way |
| compatibility-matrix row "Nested Overlay Canvas … draft-only" carries inline SUPERSEDED correction pointing to E16 | research/compatibility-matrix.md | INTENTIONAL (history-preserving pattern to emulate during consolidation) |
| open-questions.md presents new items (9–15) above historic items (1–8) | research/open-questions.md | STRUCTURAL ODDITY (numbering non-monotonic down the file) |
| N2 consumes `e16-case03-sq-full-a.json` (cross-generation fixture reuse) and `viewer-plain.json` (exp era) | evidence/viewer-matrix.json probe rows | INTENTIONAL reuse, noted for dependency mapping |
| N6 imports blind helpers (`../blind/svg-root.ts`, `../blind/placement.ts`) | src/n6/svg.ts, src/n6/validator.ts | CROSS-GENERATION DEPENDENCY — conflicts with any naive "generations are independent" assumption (renderer-independence rule applies BETWEEN renderers, not to N6's reuse of pure helpers, which the n6 report explicitly documents) |
| `viewer.spec.ts` network-gated specs mixed into default suite (documented in README quick start) | playwright default config | KNOWN OPERATIONAL FOOTGUN (needs network for viewer specs) |

---

## 11. N6 Audit

Focused audit of the most recent completed phase (baseline tag).

### Component separation

| # | Component | Artifact(s) | Notes |
|---|---|---|---|
| 1 | Implementation | `src/n6/types.ts, canvas.ts, svg.ts, fragments.ts, aspect.ts, mapping.ts, exclusions.ts, validator.ts` | Pure TS, browser-free, no new deps. Reuses blind helpers (P-11 above). Divergence from blind parser documented (strict reporting vs silent drop — intentional). |
| 2 | Test harness | `tests/n6-conformance.test.ts` | 32 Vitest tests; consumes `runSuite()` from suite.ts (same source as evidence generator — cannot diverge). Asserts actual == pre-registered outcome per T01–T15 + standing boundaries. |
| 3 | Source/input definitions | `src/n6/suite.ts` | Inline string fixtures following e15/e16 PATTERNS (no physical fixture file read; `example.org` ids resolved from an inline registry). PRE-REGISTERED expected outcomes encoded here, transcribed from `conformance-matrix.md` Part B. |
| 4 | Generated evidence | `evidence/n6/summary.json`, `case-T01..T15.json`, `conformance-matrix.json` | Produced solely by `scripts/run-n6-suite.mts`; only the script adds wall-clock/commit context; outcomes deterministic. Build context pins node v26.5.0/win32 and commit 23e7f50. |
| 5 | Conformance matrix | `evidence/n6/conformance-matrix.json` | Classification below. |
| 6 | Interpretation/reporting | `research/n6-implementation-report.md` | Architecture, requirement-to-code map, coverage, limitations, blocked items, AMB-N6-1. |
| 7 | Derived research claims | consumer conformance remains BLOCKED (no capable consumer: Ramp crashes, Mirador drops — N2); no [OPEN] item promoted; no fit/z-order vocabulary emitted (T04/T08/T10 enforce); ε-mode opt-in and self-recording; temporal honoring stays an open fence (R-S8b/X7). | All traced to specific evidence files. |

### Classification of `evidence/n6/conformance-matrix.json`

**GENERATED ARTIFACT — machine-readable representation authored as literals inside its
generator; NOT a primary source; NOT parsed from any document.**

Supporting evidence:

1. `scripts/run-n6-suite.mts` lines 55–74 define `matrixRows` as hardcoded TypeScript
   array literals; line 76–79 serialize them verbatim to the file.
2. The file self-describes: `"stage": "N6"`, `"companionTo": "research/conformance-matrix.md"`
   — i.e., it points at the human document as its semantic companion.
3. Content correspondence to `conformance-matrix.md` Part A + Exclusion rows is manual,
   not mechanical: row statements are paraphrases (shorter than the md), statuses are
   N6-state ("implemented/blocked/open fence/excluded") rather than the md's
   IN FORCE/EXCLUDED/OUT OF SCOPE vocabulary.
4. Therefore the de-facto edit surface for this JSON is the .mts script; the de-facto
   semantic authority is the markdown pair (profile-draft + conformance-matrix).
   A derived aggregation snapshot would be the closest second label, but "snapshot"
   usually implies captured-from-execution; the matrix rows are static script data,
   independent of `runSuite()` results.

Consequence for consolidation: regenerating evidence/n6 rewrites summary timestamps and
git sha; the matrix JSON is stable across runs except when the script is edited.

### Additional N6 facts worth keeping

- Evidence predates implementation commits (P-10): the run happened at N5 HEAD with N6
  files untracked; report §Validation record states this explicitly. Any future
  "evidence must postdate code" lint would false-positive here.
- N6 modifies nothing historical by design; its only inbound coupling is to
  `src/blind/{svg-root,placement,types}.ts`.
- `suite.ts` claims "single source of truth" for the suite while simultaneously deriving
  from `conformance-matrix.md` Part B — the two texts agree today; Phase B should decide
  which artifact owns pre-registration going forward (see §5).

---

## 12. Consolidation Risks

1. **Renderer-independence constraint.** Deliberate duplication across
   `reference`/`blind`/`native` is methodologically required (honesty constraint #3,
   blind packet). Mechanical dedup during refactor phases would invalidate the
   experimental design and historical claims.
2. **Pre-registration traceability.** T01–T15 expectations flow
   conformance-matrix.md → suite.ts → evidence → tests. Renaming IDs (T*, R-S*, X*,
   P*) anywhere breaks a five-link traceability chain that the n6 report and evidence
   JSONs depend on.
3. **Evidence immutability vs regeneration.** Browser evidence (e14–e17, n2) needs
   Playwright engines + network (unpkg bundles, IIIF validator POST); it cannot be
   faithfully regenerated on demand. Consolidation must treat `evidence/` as archived
   data, not rebuildable output.
4. **Frozen-spec hazards.** `tests/e2e/e16.spec.ts` intentionally retains a latent
   race pattern (experiment-log #16); "fixing" it during consolidation would falsify
   the recorded lesson.
5. **Superseded-claim preservation.** Inline SUPERSEDED markers (compatibility-matrix,
   open-questions) encode the epistemic history. Flattening documents risks silently
   resurrecting corrected claims (e.g., E14's "Model B draft-only").
6. **AMB-N6-1 pending decision.** Any edit touching profile/conformance arithmetic
   examples before resolving the recorded ambiguity would contradict the N6 report's
   explicit await-instruction state.
7. **Three provenance taxonomies + three A/B letter-axes** (§7) — renaming or unifying
   vocabulary prematurely would break cross-document citations (every report cites the
   class labels verbatim).
8. **Producer-less fixture family** (case1–13): consolidation that reruns fixture
   builders must not assume full-regenerability of `public/` from scripts.
9. **Cross-generation helper imports** (N6→blind): moving `src/blind/` helpers without
   updating `src/n6/` imports breaks the validator; the dependency is documented but
   easy to miss because directory names suggest isolation.

---

## 13. Open Inventory Questions

1. Which document should be canonical for "current best claims" after consolidation —
   `findings.md`, `compatibility-matrix.md`, or `profile-draft.md`? Today they answer
   different vintages of overlapping questions (see §5).
2. Should `src/n6/suite.ts` or `research/conformance-matrix.md` Part B own
   pre-registration going forward? (Both currently agree; dual-maintenance risk.)
3. Were case1–13 fixtures ever script-generated (git history shows only the wholesale
   add), and does Phase C need a reconstruction script or an explicit
   "hand-authored" designation?
4. Are byte-identical e15/e17 Chromium screenshot pairs intended to remain duplicated
   (one per run) or should Phase C deduplicate with pointer records? (Recommendation
   territory — flagged, not decided.)
5. Is `src/reference/lib/iiif.ts` (exp-era Renderer A) to remain a permanently separate
   resolver from `reference/lib/e14.ts`, or is the exp path considered frozen-legacy
   inside the harness?
6. Do any consumers outside this repo (or future ones) depend on evidence filenames
   cited in research docs (including the `epx6-*` typos)? Renaming is risky until
   answered.
7. Confirm intended audience for `docs/` vs `research/` split (packets vs conclusions);
   several ambiguities-ledger entries in `docs/ambiguities.md` are conclusion-flavored.

---

## 14. Context for Phase B

Handoff notes. Phase B = provenance/terminology audit; nothing below has been acted on.

### Inspect first

1. `research/profile-draft.md` Part 2 (TERMINOLOGY) + Part 3 (taxonomy) against the
   term-conflict table in §7 above — decide the authoritative vocabulary and produce
   the mapping table between the three provenance taxonomies.
2. `src/main.ts` routing (`boot()`, MANIFEST_MAP, e14/e16 branch) — it is the single
   choke point that defines which fixture families are reachable by which renderers;
   every provenance question about "who consumes X" funnels through it plus the three
   Playwright configs.
3. `scripts/run-n6-suite.mts` vs `evidence/n6/conformance-matrix.json` vs
   `research/conformance-matrix.md` — resolve the three-representation situation for
   conformance status.

### Provenance relationships needing deeper verification

- Exact production story of case1–13 fixtures (git show cbd0880; check for deleted
  scripts in history).
- Whether any tracked evidence file was regenerated after its capture commit (four
  "refresh screenshots" commits suggest yes for screenshots; establish policy: is
  refreshed evidence still the recorded result of its experiment?). `git log --follow`
  on `evidence/screenshots/**` recommended.
- Full extent of e15↔e17 screenshot identity (sampled 2/2; enumerate all pairs).
- Whether `reference/lib/iiif.ts` and `reference/lib/e14.ts` resolution behaviors are
  guaranteed-equivalent on overlapping inputs (never tested head-to-head in-repo, as
  far as this inventory found).

### Terminology conflicts requiring resolution

- Mode A/B vs Model A/B/C vs Renderer A/B (highest priority; cross-cited everywhere).
- "reference" (directory vs Renderer B vs reference convention of synthesized viewBox).
- "canonical" (value normalization vs output ordering in N6).
- "parity" vs "comparison/agreement" vocabularies.
- "conformance" vs "compatibility" document identities.
- Single consolidated legend for provenance classes ([NORMATIVE]/[BROWSER]/[COMMUNITY]/
  [DERIVED]/[PROFILE]/[OPEN] vs IMPLEMENTATION_GAP/VIEWER_GAP vs [CONSUMER]/[UNKNOWN]).

### Source-of-truth conflicts

- Pre-registration ownership (matrix.md Part B vs suite.ts) — see §11.
- Current-verdict ownership (layered reports; §13 Q1).
- Compatibility-status representation mixing live rows with SUPERSEDED history.

### Likely canonicalization problems ahead (Phase C/D preview, unsolved here)

- Merging renderer directories would break the independence invariant — any proposal
  must keep per-renderer namespaces intact and move only true shared infra
  (utils/analysis already partially separated per experiment).
- Evidence tree is the largest blob (353 files); consolidation proposals must decide
  append-only vs reorganization policy BEFORE touching anything, given regeneration
  constraints (§12.3).
- Stale README paths and count claims need a documentation-refresh pass that preserves
  point-in-time honesty (add "as of" qualifiers rather than rewriting history).

### Historical distinctions that must not be lost

- E12/E13 = blind generation despite log-table gap.
- E14 "draft-only Model B" → superseded by E16 (stable 3.0 §5.3) — the correction IS
  part of the record.
- [BROWSER] ≠ [NORMATIVE]: tri-engine unanimity never promotes rank (E17 headline rule).
- R-S8b/[OPEN] fences: temporal honoring and fit-rule remain open BY DESIGN; N6 emits
  fences, not failures.
- Ramp/Mirador failure asymmetry (crash vs silent drop) and its refinement history
  (SVG-specific → any secondary body).
- AMB-N6-1: unresolved, awaiting instruction; verdict-independent.

### Priority files/documents for Phase B

1. `research/profile-draft.md` (64KB — the normative center; Parts 2, 3, 4–10, 14).
2. `research/conformance-matrix.md` + `src/n6/suite.ts` (pre-registration pair).
3. `src/main.ts` (fixture-routing ground truth).
4. `docs/blind-interpretation-rules.md` (terminology origin for interpretation classes).
5. `research/compatibility-matrix.md` + `open-questions.md` (status bookkeeping).
6. `evidence/n6/summary.json` + one `case-T*.json` (evidence schema exemplars).
7. Git archaeology targets: cbd0880 (case fixtures), eafcdba (relocation), the four
   evidence-refresh commits.

### Unresolved questions

All of §13, plus: none blocking Phase B from starting with items 1–3 above.

---

*End of Phase A inventory. Branch `consolidation/inventory-audit`; no existing file was
created, modified, or deleted except this document.*
