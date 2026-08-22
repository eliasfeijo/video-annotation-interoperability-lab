# Terminology & Identifier Registry

Status: human-facing navigation layer for the repository's identifier namespaces.
Derived from `research/phase-e-identifier-inventory.md` (the exhaustive audit).
Authority rule (Phase C): **if this registry conflicts with an owning document, the
owning document wins.** This file documents meaning; it never redefines, renames,
or supersedes historical identifiers.

Governing principle: **"IDs provide traceability; names provide comprehension."**

---

## 1. Purpose and reading guide

You met an identifier — `E15`, `N6`, `Stage 6`, `S4`, `R-S6b`, `P3`, `P-3`, `T08`,
`T-3`, `R-V4`, `V4`, `M-M3`, `M3`, `Q7`, `Q1.4` — and want to know what it is.

1. Find the namespace in §2 (grouped by semantic role).
2. Check §3 if it might be an ALIAS of something else (many are).
3. Check §4 if it looks similar to something else (collision hazards).
4. If it is not in §2 at all, it is probably deliberately excluded — see §6.

Status vocabulary used here: **historical** (fixed experiment-era record),
**current** (live citation/normative space), **process** (consolidation/governance
era only), **generated** (machine output).

---

## 2. Core identifier registry

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
| `R-S<n><part>` | `R-S6b` | formal profile requirements; a/b splits where provenance differs | R-S1–R-S8b | current normative | `profile-draft.md` Part 4; encoded in `src/n6/types.ts` (`RequirementId`) | immutable; part-split pairs: R-S6a/b, R-S8a/b |
| `X<n>` | `X7` | profile exclusions (no geometry promised) | X1–X8 | current normative | `profile-draft.md` Part 10 | unrelated to lowercase SVG tokens (`xywh=`, `xMidYMid`) |
| `T<nn>` | `T08` | pre-registered black-box conformance cases | T01–T15 | design frozen (N5); executed (N6) | design: `conformance-matrix.md` Part B; execution encoding: `src/n6/suite.ts` | distinct from terminology rules `T-1…T-6` (§4) |
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

### D. Process / governance IDs (consolidation era)

| Identifier | Example | What it identifies | Syntax / range | Status | Owner | Warnings |
|---|---|---|---|---|---|---|
| `D<n>` | `D7` | consolidation decisions operationalizing Phase B | D1–D10 | process | `phase-b-provenance-terminology-audit.md` §11 | not `DERIVED`, not verdict grade D |
| `L<n>` | `L4` | epistemic layers L0–L5 + pointer layer L6 | L0–L6 | process/current | `consolidation-map.md` §1 | L6 owns no claims |
| Phase letters | `Phase C` | consolidation phases A–E | A–E | process | mission briefs / doc titles | letter overload (§4) |
| Checklist ops | `P-0`, `R-1`, `G-1`, `V-1`, `N-2`, `D-DEF`; sub-steps `R-1.x`, `V-1.x` | Phase D operations (pre-flight, README, governance link, integrity sweep, deferred suite.ts comment fix, deferred-designs bucket) | letter-number with hyphen | process (executed/closed; N-2 deferred) | `phase-d-checklist.md` §0/A/B | `V-1`≠probes V1–V7; `R-1`≠rules R1–R5; `N-2`≠generation N2 |
| Terminology rules | `T-3` | six writing conventions for new documents | T-1–T-6 | process/current | `documentation-conventions.md` Part I | hyphenated/unpadded vs tests T01–T15 |
| Preservation rules | `P-TERM-4` | six historical-terminology preservation rules | P-TERM-1–6 | process/current | defined `phase-b audit` §3; applied in conventions/map | compound prefix disambiguates within P-cluster |
| Evidence-policy points | `P-6` | seven adopted evidence policies | P-1–P-7 | process/current | `evidence-policy.md` §2 | hyphen separates from rules P1–P6 — barely (§4) |
| Fixture family ids | `case-blind-1-13` | eight kebab-case family ids in the provenance manifest | fixed set of 8; extensible schema | process/current | `fixture-provenance.json` `_schemaNotes` | machine-facing |

### E. Matrix / fixture naming conventions (systematic vocabularies worth knowing)

| Convention | Example | Meaning | Values | Owner |
|---|---|---|---|---|
| Region short-names | `square500`, `rect43`, `full`, `half` | four E15 target regions on the 1920×1080 canvas | 4 | `build-e15-fixtures.mjs`; `e15-report.md` §2 |
| Embedding mechanisms | `svg-nested-region`, `img-none`, `background` | eight embedding channels under test | typed union in `src/e15/analysis.ts` | same |
| Variant short-names | `vb1000`, `novb1920x1080-min`, `e17-vb1000-max` | viewBox presence/size + PAR token encoding; `-max` = xMaxYMax | vb/novb × sizes × PAR | builders e15/e17 |
| Interpretation labels | `I-REGION-VIEWPORT` | analytic candidate readings scored by the pixel classifier | I-REGION-VIEWPORT, I-INTRINSIC-STRETCH, I-OBJECTFIT-CONTAIN, I-NATURAL-CENTERED, I-NATURAL-TOPLEFT | `e15-report.md` §3 |
| Evidence filename grammars | `cmp-e16-case05-43-full-b__contain.json`, `case-e15-firefox-vb1000--rect43.json` | per-family generated-artifact grammars (`__<fit>`, `<variant>--<region>`, engine infix, `parity-<n>`, `observations/<id>`) | per family | producing specs/tests; rename-forbidden |
| Landmark contract files | `e15-landmarks.json` | landmark geometry contracts; e15's reused verbatim by e16/e17 | e15/e16/e17 | builders |

---

## 3. Alias and mapping tables

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
When writing NEW prose, use the report-ID form on first use.

---

## 4. Reading hazards

High-risk confusion clusters (full analysis: Phase E inventory §3).

1. **Letter overload (highest risk).** Bare letters A/B/C mean different things per
   axis: Renderer A/B (implementation; lowercase in URLs), Mode A/B (IIIF version
   semantics), Model A/B/C (composition structure), fixture suffixes `-a/-b/-c`
   (variant encoding), verdict grades A–E, taxonomy meta-labels A–D, E15 variant
   letters A–D. Never write a bare letter; always carry the axis word
   (`documentation-conventions.md` T-1).
2. **P-cluster.** `P1–P6` rules vs `P5a` vs evidence-policy points `P-1–P-7` vs
   pre-flight op `P-0` vs preservation rules `P-TERM-1–6`. The hyphen is nearly the
   only separator: `P1` (rule) vs `P-1` (policy point).
3. **S-cluster.** `S1–S8` subset rules vs `R-S*` requirements (alias pair, §3.1) vs
   stopping conditions `S1.0–S1.3` (belong to Stage 1 of `next-session-plan.md`) vs
   capability grade `S`. Four objects, near-identical strings.
4. **Q-cluster.** Three question spaces share digits: open-question integers 1–15,
   N3 brief questions `Q1–Q10`, plan-stage questions `Q1.1–Q1.6` (plus prose
   numbered answer lists in reports that are NOT identifiers).
5. **T-cluster.** Tests `T01–T15` vs terminology rules `T-1–T-6`.
6. **R-cluster.** E15 rules `R1–R5` vs requirements `R-S*` vs probes `R-V*` vs
   future checks `RF01–04` vs README op `R-1`.
7. **Probe naming redundancy.** One probe, four surface forms (§3.3). Use report
   IDs canonically; the mapping table is the arbiter.
8. **N-cluster.** Generation `N2` vs deferred op `N-2` vs probeId prefix `N2-` vs
   manifest family id `n2-manifests`.
9. **V-cluster.** Probes `V1–V7` vs integrity-sweep op `V-1`.
10. **Stage ↔ N duality.** Same objects, two names (§3.2); `S1.x` conditions attach
    to Stage 1, compounding hazard 3.
11. **case-padding split.** blind generation `case6` (unpadded) vs e14/e16
    `case06` (padded). Both live; searches miss across the boundary.
12. **E18 ghost ID.** Proposed, never executed; no artifacts exist (see §5).
13. Minor clusters: `D1–D10` vs `DERIVED`/grade D; op `G-1` vs grade `G`;
    `L0–L6` clean; `Finding <n>` vs `F<n>` are sibling-but-distinct families;
    `X1–X8` vs lowercase SVG tokens do not collide (case+context).

---

## 5. Historical / unresolved identifiers

| Item | Status | Note |
|---|---|---|
| `E18` | GHOST — proposed in `e15-e16-final-report.md` §13, never executed under that number | the work later became N2; no artifacts exist and none may be manufactured |
| `Stage <k>` | historical alias system, still used in headers | documented as alias (§3.2), not independent numbering |
| `S1–S8` standalone usage | historical formulation | cite via R-S twins when precision matters; alias rows remain authoritative bridges |
| `AMB-N6-1` | OPEN by decision (D10) | owner `n6-implementation-report.md` §9; must not be resolved by assumption anywhere |
| Rare bracket labels `[VIEWER]`, `[IMPLEMENTATION]`, `[RECOMMENDATION]`, `[SUPPORTED]`, `[COMMUNITY PRACTICE]`, `[PROPOSAL]` | historical/ad-hoc labels, counts 1–2 each | deliberately NOT promoted to formal vocabulary; several sit outside the Phase C legend. Warning: do not reuse them as if they were governed classes. Sites: `e15-report.md` (R3), `e15-e16-final-report.md` §6, `community-positioning.md` header, `next-session-plan.md` Stage 2/3 class lists |
| Two confidence vocabularies (`CONFIRMED/LIKELY/UNCERTAIN` in phase docs vs `"confidence": "high"` in `n3-source-index.json`) | coexist unreconciled | owners respectively: consolidation docs / n3 JSON; reconciliation intentionally out of scope |

---

## 6. What is NOT an identifier

Deliberately excluded from this registry so it cannot become an acronym dump.
Each item keeps its existing legend/owner:

- **Compatibility status** `S/G/B/S*` → `compatibility-matrix.md` legend.
- **Conformance-state vocabularies** (IN FORCE/EXCLUDED/OPEN fence/OUT OF SCOPE;
  implemented/BLOCKED/open fence/excluded) → `conformance-matrix.md` Part A; the
  md→JSON status mapping lives ONLY in `scripts/run-n6-suite.mts` (`matrixRows`).
- **Provenance taxonomies** (four scoped sets: blind-packet rule classes, E14
  divergence classes, profile requirement provenance `[NORMATIVE]/[BROWSER]/…`,
  N2 consumer labels) → common legend in `documentation-conventions.md` Part II.
- **N6 diagnostic codes** (`MISSING_VIEWBOX`, `TEMPORAL_HONORING_OPEN`, …) →
  implementation/output vocabulary, owned by `src/n6/types.ts`; surfaced in the
  requirement-to-code table of `n6-implementation-report.md` §2. Machine codes,
  not human identifier namespaces.
- **Typed-axis value sets** (RendererKind a/b; IiifMode A/B; E14Model A/B/C) →
  semantics owned by Phase B audit §2.1 and the code types themselves.
- **Verdict scale A–E**, comparison verdict strings (`a==blind`…), register states
  (OPEN/ANSWERED/SUPERSEDED), SUPERSEDED markers, state quartet
  `[OPEN]/[UNKNOWN]/BLOCKED/OPEN_FENCE`, confidence words → statuses/meta, owners
  as listed in Phase E inventory §2.
- **N3 source-type labels and source ids, `relatesTo` values** →
  `n3-source-index.json`.
- **Ordinary technical vocabulary** (fit keywords fill/contain/meet/slice/none/
  cover; PAR tokens xMinYMin…; engine names chromium/firefox/webkit) → specs/config.
- **External citation coordinates** (IIIF recipe numbers, spec §§, Use Case 6) →
  external documents, cited not registered.
- **Code symbols & parameters** (`RAW_PARITY_EXPS`, `EMBEDDING_SPACE`, K=0.25,
  TOL_MIN=0.8, ε=10⁻⁶), URL query params, playwright project names, git
  branches/tags, `test-results/` → infrastructure/environment metadata.
- **Lab globals/CSS hooks** (`__lab`, `__e15`, `__e17`, `.ar-*`, `.viewport`),
  harness route keys (`MANIFEST_MAP`) → implementation detail, `src/main.ts` et al.

---

## 7. Maintenance rules

Minimal, by design:

1. Do not rename historical identifiers.
2. Do not reuse an existing identifier for a different object.
3. New identifiers must have an explicit semantic owner (an owning document or
   definition site).
4. Avoid bare-letter identifiers; a contextual prefix is cheap.
5. When an existing shorthand is retained, document its canonical form (add it to
   §3 if a new alias family appears).
6. Prefer writing the noun/context alongside an ambiguous identifier on first use
   (e.g., "requirement R-S6b", "probe R-V4", "decision D7").
7. This registry documents meaning; it does not supersede owning documents. When
   adding rows, cite the owner; when owners disagree with this file, fix this file.
