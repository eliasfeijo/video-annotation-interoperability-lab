# Terminology & Identifier Registry — RETIRED Historical Appendix

> **RETIREMENT NOTICE (Phase H.4-1, 2026-08-24).** The vocabulary authority for this
> repository is now `research/terminology-specification.md` (mapping ratified in
> commit `622417a`, executed by Phase G.x; dispositions ratified through Phase H.3).
> This file is a **historical identifier appendix / audit artifact**: it preserves
> exact historical identifier → meaning mappings for provenance. It is NOT current
> vocabulary policy and must not be consulted for naming governance or extended with
> new identifier families. Content below was carried from the former Phase E registry
> at retirement time; framing sections that duplicated current governance (reading
> guide, maintenance rules) are reduced to pointers. Where any entry here conflicts
> with an owning document, the owning document wins.

---

## 1. Authority

- Current vocabulary, glossary, qualifier discipline, and naming policy:
  **`research/terminology-specification.md`**.
- Exhaustive historical audit from which this appendix derives:
  `phase-e-identifier-inventory.md`.
- Executed migration record: `terminology-migration-inventory.md` §EXECUTION STATUS.
- This appendix documents meaning only; it never redefines, renames, or supersedes
  historical identifiers.

Governing principle of the former registry, retained for reading its rows:
**"IDs provide traceability; names provide comprehension."**

## 2. Historical identifier appendix

Status vocabulary used below: **historical** (fixed experiment-era record),
**current** (live citation/normative space), **process** (consolidation/governance
era only), **generated** (machine output) — as of the era when each row was written.

### A. Experiment / generation IDs

| Identifier | Example | What it identifies | Syntax / range | Status | Owner / definition site | Aliases & warnings |
|---|---|---|---|---|---|---|
| `exp<N>` | `exp4`, `exp5a`, `exp7-animate` | initial-cycle experiments & their fixtures/manifests | exp1–7; letter variants 5a/b/c; `-animate`; name aliases `text`, `security` | historical; fixtures still active in harness | `scripts/build-fixtures.mjs`; routing `src/main.ts` (`MANIFEST_MAP`); register: `experiment-log.md` table | `text`/`security` are manifest-name aliases, not numbered experiments |
| blind `case<N>` | `case11` | blind-renderer adversarial fixtures/cases | case1–case13 (**unpadded**) | historical; fixtures active | added wholesale in commit `cbd0880`; provenance: `fixture-provenance.json` (`case-blind-1-13`: no generator, authorship unknown) | padding differs from e14 (`case06`) — see §4 |
| `e{gen}-case{NN}-<slug>-{a,b}` | `e14-case03-sq-full-b` | later-generation case fixtures; suffix encodes composition variant (a = direct/twin, b = nested, c = Web-Annotation where present) | e14-case01…16, e16-case01…08 | historical; active | `build-e14/e16-fixtures.mjs`; semantics in `e14-report.md` §2 | zero-padded here, unpadded in blind generation |
| `E<n>` | `E15`, `E17` | experiment generations 12–17 (ranges E1–E11 / "E1–E13" appear in prose) | E12–E17 named; log rows 1–11 then 14–17 | historical record; current citation space | `experiment-log.md` table; E12/E13 declared in `docs/blind-interpretation-rules.md:3` | the 11→14 gap is historical (blind generation = E12/13) |
| `E18` | `E18` | **ghost ID**: proposed viewer-survey follow-up, never executed as E18 | single mention | historical proposal only | `e15-e16-final-report.md` §13 | realized as N2; do not search for E18 artifacts — see §5 |
| `N<n>` | `N2`, `N6` | post-E17 stages: N1 cross-engine, N2 consumers, N3 community, N4 safe subset, N5 profile+matrix, N6 validator | N1–N6 | historical generations; live citation space | `next-session-plan.md` (N1–N4); N5/N6 self-declared in own headers | `Stage <k>` is its alias (§3); beware `N-2` op and `n2-*`/`N2-*` probe strings (§4) |

### B. Requirements / tests / exclusions

| Identifier | Example | What it identifies | Syntax / range | Status | Owner | Aliases & warnings |
|---|---|---|---|---|---|---|
| `S<n>` | `S4` | N4 safe-subset rules (pre-profile formulation) | S1–S8 | historical→current via alias rows | `n4-safe-subset.md`; equivalence table `conformance-matrix.md` Part A | each has an R-S twin — full map in §3; NOT the capability grade `S` |
| `R-S<n><part>` | `R-S6b` | formal profile requirements; a/b splits where provenance differs | R-S1–R-S8b | current normative | `profile-draft.md` Part 4; encoded in `src/validator/types.ts` (`RequirementId`) | immutable; part-split pairs: R-S6a/b, R-S8a/b |
| `X<n>` | `X7` | profile exclusions (no geometry promised) | X1–X8 | current normative | `profile-draft.md` Part 10 | unrelated to lowercase SVG tokens (`xywh=`, `xMidYMid`) |
| `T<nn>` | `T08` | pre-registered black-box conformance cases | T01–T15 | design frozen (N5); executed (N6) | design: `conformance-matrix.md` Part B; execution encoding: `src/validator/suite.ts` | distinct from terminology rules `T-1…T-6` (§4) |
| `RF<nn>` | `RF02` | future consumer rendering checks (blocked by design; informational only) | RF01–RF04 | current design, unexecuted | `conformance-matrix.md` Part B ("Future rendering-level checks") | never gate conformance |
| `P<n>` (+`P5a`) | `P2`, `P5a` | lab-convention rules from the E15/E16 cycle; P5a = same-aspect sub-rule | P1–P6, P5a | historical rules; final ranks in N3 | formulated `e15-e16-final-report.md` §9; rank table `community-positioning.md` §10 | formalized into S/R-S*; IDs remain citation currency — NOT policy points `P-1…P-7` (§4) |

### C. Experiment-internal IDs

| Identifier | Example | What it identifies | Syntax / range | Status | Owner | Aliases & warnings |
|---|---|---|---|---|---|---|
| `R<n>` | `R2` | five classified embedding-semantics rules of E15 | R1–R5 | historical | `e15-report.md` §5 | distinct from R-S*, R-V*, and README-op `R-1` |
| `Finding <n>` | `Finding 1` | six empirical findings of E14 | Finding 1–6 | historical | `e14-report.md` §3.3 | prose form; predecessor style of F<n> |
| `F<n>` | `F5` | eight cross-engine findings of E17 (each cites an H hypothesis) | F1–F8 | historical/current citations | `e17-report.md` §3 | unrelated to "fixture" prose |
| `H<n>` | `H1` | five acceptance-tested E17 hypotheses | H1–H5 | process/historical | `next-session-plan.md` Stage 1 table | outcomes recorded as "(H<n> ACCEPTED)" in e17-report |
| `Q<n>` | `Q7` | ten mandated community-positioning questions answered by N3 | Q1–Q10 | historical/process | `community-positioning.md` (inline answers; §10 = Q10); machine refs in `n3-source-index.json` (`relatesTo`) | NOT the open-question register; NOT plan-stage Q<n>.<m> — see §4 |
| `Q<n>.<m>` | `Q1.6` | six exact stage-1 questions of the E17 plan | Q1.1–Q1.6 | process/historical | `next-session-plan.md` Stage 1 | dotted form unique to this set |
| open-question `<n>` | "open question #9" | living question-register entries (new items above historic block) | integers 1–15, unprefixed | current, append-only | `open-questions.md` | referenced as "#9"-style; third Q-ish space |
| `bug-fix #<n>` | `#13` | sixteen numbered implementation-bug ledger entries | #1–#16 | historical (frozen ledger) | `experiment-log.md` §Bug-fix log | cited across eras (#10, #13, #15, #16 most often) |
| `AMB-<stage>-<n>` | `AMB-N6-1` | recorded, unresolved ambiguity (replacement-form arithmetic parentheticals) | one instance | current, OPEN by decision (D10) | `n6-implementation-report.md` §9; mirrored `evidence/n6/summary.json` | resolution requires a human research decision |

Consumer-probe IDs live in §3 (mapping tables) because their defining feature IS
their multiple surface forms.

### D. Process / governance IDs (consolidation era — HISTORICAL)

HISTORICAL-scope note (Phase H.4-1): this subsection maps identifiers minted during
the early consolidation phases only; the phrase "consolidation phases A–E" below is a
period description as of the former registry's writing, not a statement about later
phases. Later-era identifier families are cataloged by the specification and their own
owning records, not here.

| Identifier | Example | What it identifies | Syntax / range | Status | Owner | Warnings |
|---|---|---|---|---|---|---|
| `D<n>` | `D7` | consolidation decisions operationalizing Phase B | D1–D10 | process | `phase-b-provenance-terminology-audit.md` §11 | not `DERIVED`, not verdict grade D |
| `L<n>` | `L4` | epistemic layers L0–L5 + pointer layer L6 | L0–L6 | process/current | `consolidation-map.md` §1 | L6 owns no claims |
| Phase letters | `Phase C` | consolidation phases A–E (as of the former registry's writing; a period description, not current scope) | A–E | process/historical | mission briefs / doc titles | letter overload (Phase E inventory §3) |
| Checklist ops | `P-0`, `R-1`, `G-1`, `V-1`, `N-2`, `D-DEF`; sub-steps `R-1.x`, `V-1.x` | Phase D operations (pre-flight, README, governance link, integrity sweep, deferred suite.ts comment fix, deferred-designs bucket) | letter-number with hyphen | process (executed/closed; N-2 deferred) | `phase-d-checklist.md` §0/A/B | `V-1`≠probes V1–V7; `R-1`≠rules R1–R5; `N-2`≠generation N2 |
| Terminology rules | `T-3` | six writing conventions for new documents | T-1–T-6 | process/current | `documentation-conventions.md` Part I | hyphenated/unpadded vs tests T01–T15 |
| Preservation rules | `P-TERM-4` | six historical-terminology preservation rules | P-TERM-1–6 | process/current | defined `phase-b audit` §3; applied in conventions/map | compound prefix disambiguates within P-cluster |
| Evidence-policy points | `P-6` | seven adopted evidence policies | P-1–P-7 | process/current | `evidence-policy.md` §2 | hyphen separates from rules P1–P6 — barely (Phase E inventory §3) |
| Fixture family ids | `case-blind-1-13` | eight kebab-case family ids in the provenance manifest | fixed set of 8; extensible schema | process/current | `fixture-provenance.json` `_schemaNotes` | machine-facing |

### E. Matrix / fixture naming conventions (systematic vocabularies worth knowing)

| Convention | Example | Meaning | Values | Owner |
|---|---|---|---|---|
| Region short-names | `square500`, `rect43`, `full`, `half` | four E15 target regions on the 1920×1080 canvas | 4 | `build-embedding-semantics-fixtures.mjs` (historical `build-e15-fixtures.mjs`); `e15-report.md` §2 |
| Embedding mechanisms | `svg-nested-region`, `img-none`, `background` | eight embedding channels under test | typed union in `src/embedding-semantics/analysis.ts` | same |
| Variant short-names | `vb1000`, `novb1920x1080-min`, `e17-vb1000-max` | viewBox presence/size + PAR token encoding; `-max` = xMaxYMax | vb/novb × sizes × PAR | builders e15/e17 |
| Interpretation labels | `I-REGION-VIEWPORT` | analytic candidate readings scored by the pixel classifier | I-REGION-VIEWPORT, I-INTRINSIC-STRETCH, I-OBJECTFIT-CONTAIN, I-NATURAL-CENTERED, I-NATURAL-TOPLEFT | `e15-report.md` §3 |
| Evidence filename grammars | `cmp-e16-case05-43-full-b__contain.json`, `case-e15-firefox-vb1000--rect43.json` | per-family generated-artifact grammars (`__<fit>`, `<variant>--<region>`, engine infix, `parity-<n>`, `observations/<id>`) | per family | producing specs/tests; rename-forbidden |
| Landmark contract files | `e15-landmarks.json` | landmark geometry contracts; e15's reused verbatim by e16/e17 | e15/e16/e17 | builders |

## 3. Alias bridges (historical mapping tables)

### 3.1 Subset rules ↔ formal requirements (S* ↔ R-S*)

Equivalence rows are printed verbatim in `conformance-matrix.md` Part A.

| Subset rule | Formal requirement(s) | Topic (owner: n4-safe-subset.md / profile-draft.md Part 4) |
|---|---|---|
| S1 | R-S1 | explicit root viewBox on every painting body |
| S2 | R-S2 | region-as-viewport consumer contract (certification BLOCKED) |
| S3 | R-S3 | positive integer Canvas dimensions |
| S4 | R-S4 | same-aspect painted/replaced Canvas; no fallback fit |
| S5 | R-S5 | uniform-scale landmark mapping |
| S6 | R-S6a + R-S6b | Media Fragments syntax (split: syntax vs `pct:` alias) |
| S7 | R-S7 | exclusions, resource side |
| S8 | R-S8a + R-S8b | temporal MAY-syntax vs honoring OPEN fence (split) |

### 3.2 Process stages ↔ generations (Stage k ≡ Nk)

`Stage <k>` is an ALIAS for generation Nk, not a competing namespace. Verified via
each document's own header.

| Stage | Generation | Owning document |
|---|---|---|
| Stage 1 | N1 (E17 cross-engine) | `e17-report.md` (plan ref) |
| Stage 2 | N2 (consumer probes) | `viewer-interop-report.md` |
| Stage 3 | N3 (community positioning) | `community-positioning.md` |
| Stage 4 | N4 (safe-subset decision) | `n4-safe-subset.md` |
| Stage 5 | N5 (profile draft + conformance matrix) | `profile-draft.md`, `conformance-matrix.md` |
| Stage 6 | N6 (validator implementation) | `n6-implementation-report.md` |

Stage 0 = the session brief itself (`next-session-plan.md` preamble). No N-number.

### 3.3 Consumer probes: report ID ↔ shorthand ↔ probeId ↔ filename slug

One probe object, four surface forms (canonical = report ID).

| Report ID (canonical) | Shorthand (later docs) | probeId (`viewer-matrix.json`) | slug / filenames |
|---|---|---|---|
| R-V1 | V1 | N2-ramp-v1-baseline | ramp-v1-baseline (.png/.json) |
| R-V2 | V2 | N2-ramp-v2-temporal | ramp-v2-temporal |
| R-V3 | V3 | N2-ramp-v3-spatial | ramp-v3-spatial |
| R-V4 | V4 | N2-ramp-v4-svg-vb-region | ramp-v4-svg-vb-region |
| R-V5 | V5 | N2-ramp-v5-svg-novb-region | ramp-v5-svg-novb-region |
| R-V6 | V6 | N2-ramp-v6-raster-body | ramp-v6-raster-body |
| R-V7 | V7 | N2-ramp-v7-canvas-as-body | ramp-v7-canvas-as-body |
| M-M1 | M1 | N2-mirador-m1-baseline | mirador-m1-baseline |
| M-M2 | M2 | N2-mirador-m2-svg-vb-region | mirador-m2-svg-vb-region |
| M-M3 | M3 | N2-mirador-m3-canvas-as-body | mirador-m3-canvas-as-body |

Owner of canonical forms: `research/viewer-interop-report.md` probe matrix.
Shorthand spread via `conformance-matrix.md` / `profile-draft.md` ("N2 V4–V7, M2/M3").
In NEW prose use the report-ID form on first use (rule now owned by the specification).

## 4. Reading hazards — REDUCED (pointer)

Full analysis of the collision clusters (letter overload; P/S/Q/T/R/N/V clusters;
Stage↔N duality; case-padding split; E18 ghost ID; minor clusters) is owned by
`phase-e-identifier-inventory.md` §3; qualifier discipline for new prose is owned by
`terminology-specification.md`. Retained here only as a one-line index of the cluster
names formerly detailed in this registry: bare letters (A/B/C), P-cluster, S-cluster,
Q-cluster, T-cluster, R-cluster, probe-naming redundancy (§3.3), N-cluster, V-cluster,
Stage↔N duality, case-padding split, E18 ghost ID, minor clusters (`D<n>` vs grade D,
op `G-1` vs grade G, `Finding <n>` vs `F<n>`, `X1–X8` vs lowercase SVG tokens).

## 5. Historical / unresolved identifiers

| Item | Status | Note |
|---|---|---|
| `E18` | GHOST — proposed in `e15-e16-final-report.md` §13, never executed under that number | the work later became N2; no artifacts exist and none may be manufactured |
| `Stage <k>` | historical alias system, still used in headers | documented as alias (§3.2), not independent numbering |
| `S1–S8` standalone usage | historical formulation | cite via R-S twins when precision matters; alias rows remain authoritative bridges |
| `AMB-N6-1` | OPEN by decision (D10) | owner `n6-implementation-report.md` §9; must not be resolved by assumption anywhere |
| Rare bracket labels `[VIEWER]`, `[IMPLEMENTATION]`, `[RECOMMENDATION]`, `[SUPPORTED]`, `[COMMUNITY PRACTICE]`, `[PROPOSAL]` | historical/ad-hoc labels, counts 1–2 each | deliberately NOT promoted to formal vocabulary; several sit outside the Phase C legend. Warning: do not reuse them as if they were governed classes. Sites: `e15-report.md` (R3), `e15-e16-final-report.md` §6, `community-positioning.md` header, `next-session-plan.md` Stage 2/3 class lists |
| Two confidence vocabularies (`CONFIRMED/LIKELY/UNCERTAIN` in phase docs vs `"confidence": "high"` in `n3-source-index.json`) | coexist unreconciled | owners respectively: consolidation docs / n3 JSON; reconciliation intentionally out of scope |

## 6. What is NOT an identifier — REDUCED (pointer)

The former exclusion list (compatibility status grades, conformance-state vocabularies,
provenance taxonomies, N6 diagnostic codes, typed-axis value sets, verdict scales,
register states, confidence words, N3 source labels, ordinary technical vocabulary,
external citation coordinates, code symbols/parameters, lab globals/CSS hooks) remains
owned where it always was: the owners cited per item in `phase-e-identifier-inventory.md`
§2 and `documentation-conventions.md` Part II. This appendix does not restate those
boundaries.

## 7. Status and maintenance of this appendix

RETIRED (Phase H.4-1): no longer the vocabulary authority; superseded by
`terminology-specification.md`. Permitted maintenance is limited to corrections that
keep the retained historical mappings ACCURATE (wrong owner citations, transcription
errors); do not add new identifier families, do not extend governance content, do not
modernize historical wording inside the tables.

*End of the retired historical appendix.*
