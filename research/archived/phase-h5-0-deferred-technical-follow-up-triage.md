# Phase H.5-0 — Deferred Technical Follow-up Triage

Status: OBSERVATION/SCOPING ONLY. This record triages the five deferred technical
follow-ups left open by Phases G.x/H.3-1/H.4-1 and recommends whether any deserves a
subsequent authorized execution phase. It implements nothing. Baseline: clean tree at
HEAD `8f4296e` ("docs: close post-G.x terminology currency and registry pointers
(phase H.4-1)"); history verified: `f956d4d` (post-G.x) → `61f4a82` (H.3-0) →
`efd6224` (H.3-1) → `8f4296e` (H.4-1).

Epistemic labels: **OBSERVED**, **INFERRED**, **RATIFIED** (decided in prior ratified
records), **OPEN QUESTION**, **DEFERRED / NOT AUTHORIZED**.

## 1. Baseline and cleanliness

OBSERVED: HEAD `8f4296e7f39a4190078c676c6ee6f4e6a4b6f868`; working tree clean;
`git status --short evidence` clean. `git diff --stat f956d4d..HEAD -- src tests
scripts public` is EMPTY — every technical surface is byte-identical to the state the
H.3-0 inspection captured, so that inspection's source findings carry forward verbatim;
this phase re-verified them by targeted spot-checks rather than full re-investigation.

## 2. Authoritative inputs

`AGENTS.md`; `phase-h3-1-carried-question-disposition-ratification.md` (§3
dispositions, §6 deferred list); `phase-h3-0-carried-question-disposition-scoping.md`
(factual baseline for LabApi/writers/timing/residue); `phase-h1-concept-architecture-
reconciliation.md` §12; `phase-h2d-interchange-display-tier-ratification.md` §5;
`evidence-policy.md` P-2/P-3/P-4/P-7; `terminology-specification.md` (ratified header);
`current-state-index.md` (post-H.4-1); `cleanup-checklist.md`; H.4-0/H.4-1 currency
state as committed.

## 3. Scope and exclusions

In scope: triage of candidates A–E below. Excluded (DEFERRED / NOT AUTHORIZED, separate
human/document decisions): cleanup-checklist item 2 ANSWERED-vs-SUPERSEDED wording; U1
self-descriptor; U2 naming policy; H.3-1 #12 enumeration erratum; all implementation,
test, script, fixture, evidence, frozen-record modification; any test/build/browser/
generator execution; committing this record (not instructed).

## 4. Method

Git-history equivalence check (§1) to inherit H.3-0 source findings; targeted greps for
`__lab` member usage across `tests/e2e/*.ts`; direct reads of all three Playwright
configs and `package.json` scripts; import-resolution check of renamed specs;
filesystem verification of the Playwright browser cache; `git log` dating of every
browser-dependent evidence family against the rename commits (`6169f83`, `79658aa`,
`f956d4d`, all 2026-08-23); frozen-record citation scan for adapter paths. No commands
beyond read-only inspection were executed.

---

## 5. Candidate findings

### A. LabApi divergence / native-on-legacy (H.3-1 §3.1)

Still factually present (**OBSERVED**; src zero-diff since `f956d4d`). Current usage
facts (**OBSERVED**):

- NO e2e caller invokes `__lab.overlayRect`, `__lab.domProbe`, `__lab.layerCount`, or
  `__lab.setSanitize` at all (repo-wide grep: zero hits). The only exercised members
  are `seek`/`currentTime`/`toCanvasPoint`/`canvasToCss`/`parity` (via utils),
  `snapshot` (blind.spec, utils), and `imgMetrics` (composition.spec).
- Native is driven by suites ONLY on e14 pages (composition.spec, e.g.
  `exp: "e14-case06-a", renderer: "native"`), i.e., the SUPPORTED combination, through
  the guarded `imgMetrics` dispatch and direct DOM queries (`.native-overlay img`) —
  never through the unguarded members.
- The native-on-legacy TypeError remains statically demonstrable and never exercised.
- `snapshot()`'s declared-type mismatch has NO current type-safety consequence:
  every test consumes `window.__lab` through `(window as any)` casts, so no typed
  consumer exists that the wrong return type could mislead.

Assessment:

1. The RATIFIED document-only disposition remains adequate (**INFERRED**): nothing new
   stresses the divergence.
2. The TypeError is an isolated UNSUPPORTED experiment combination, not a symptom of
   broader accidental coupling: the supported native surface (e14/e16 boot + guarded
   members) shares no code path with the legacy-boot cast branch (**INFERRED** from the
   boot-branch structure: e14 branch casts to `NativeStage` correctly at
   `main.ts:214–216`; only the fall-through legacy branch casts wrongly).
3. `__lab` is a lab-diagnostic surface owned ad hoc by `main.ts` (interface declared
   locally, `main.ts:31–61`), not a renderer-neutral contract; per-stage difference is
   RATIFIED acceptable (H.3-1 §3.1(1)). Whether it should ever become a formally typed
   per-stage contract is an **OPEN QUESTION** with no current forcing need.
4. A guard would convert one unsupported path's obscure boot-time TypeError into an
   explicit unsupported-combination error. Correctness gain is confined to harness
   error UX; no supported behavior changes either way (**INFERRED**).
5. Empirical confirmation of the crash is NOT necessary for disposition (**INFERRED**):
   static evidence suffices; a browser demonstration would be protocol-cost without
   decision value unless a fix phase is undertaken.

Risk classification: harness-only risk + minor maintenance debt. No research,
interoperability, or architecture risk (**INFERRED**).

**Recommended future disposition**: remain deferred (no action now). IF later
authorized, the smallest correct unit is a dedicated guard/unsupported-combination
phase: explicit early failure for unsupported `renderer`×experiment combinations plus
per-stage dispatch for the four unguarded members and a narrowed `snapshot()` type —
NOT broader normalization. Empirical verification-first is not warranted.

### B. Post-G.x P-3 browser verification

**OBSERVED**:

- Browser-dependent evidence was last regenerated 2026-08-21/22 (`evidence/e15`
  `2f13b03` 08-21; `evidence/e17` `1acdea3` 08-22; `evidence/viewer*` `bf5fe61` 08-22)
  — ALL BEFORE the rename commits (08-23). Therefore NO renamed e2e surface has
  received browser execution since its rename.
- Static consistency holds: root `playwright.config.ts` (testDir `tests/e2e`, implicit
  chromium project, no testMatch) picks up all renamed specs;
  `playwright.cross-engine.config.ts` testMatch `/cross-engine\.spec\.ts$/` and
  `playwright.consumer-probe.config.ts` testMatch `/consumer-probe\.spec\.ts$/` both
  match the renamed files with their own outputDirs; `cross-engine.spec.ts` imports
  resolve to post-G.x module paths (`src/cross-engine/classify.ts`,
  `src/nested-composition/comparison.ts`); `embedding-semantics.spec.ts` and
  `consumer-probe.spec.ts` import no relocated src modules; evidence-path literals
  were gate-frozen during G.x.
- Rename-only changes plausibly cannot affect runtime behavior (**INFERRED** from the
  above plus the G.x static gates on routes/globals/literals) — plausible, not proven.
- The Playwright cache NOW contains `firefox-1538` and `webkit-2336` alongside
  chromium builds (**OBSERVED**; the original E17-era constraint "Chromium only
  installed" no longer holds). Multi-engine execution is locally feasible; actually
  RE-RUNNING multi-engine comparisons would be NEW measurement (fresh evidence),
  not migration verification.

Research value: the Chromium-only smoke portion is migration hygiene with moderate
engineering value (protects future refactors); multi-engine re-measurement would be
genuinely new research but exceeds this triage's question and needs its own mandate.

Proposed MINIMAL P-3 verification unit (not executed; requires its own instruction):

- Scope/suites: `pnpm test:e2e` (root config ⇒ chromium project ⇒ all specs incl.
  renamed embedding-semantics/cross-engine/consumer-probe/viewer/composition/nested
  specs) as the migration-verification core; optionally the two dedicated configs'
  default (chromium) projects. Firefox/WebKit projects EXCLUDED — their inclusion
  would turn verification into new measurement.
- Expected evidence effects: E15/E17/N2 writers embed run metadata (e.g.,
  `generatedAt: new Date().toISOString()`), so a run REGENERATES tracked evidence with
  new bytes BY DESIGN. Per P-2/P-6/P-7 this churn is legitimate only as explicitly
  committed refresh-with-provenance (what/why/source-state incl. engine versions);
  silent absorption forbidden. Pre-run hash inventory and post-run diff review are
  mandatory; unexpected structural (non-metadata) divergences STOP the phase.
- Required authorization language (essence): "Protocol-authorized regeneration (P-3):
  purpose = verify post-G.x renamed e2e surfaces execute identically post-rename;
  measure = pass/fail of the named suites plus regeneration of their evidence
  families; source state = HEAD <hash>, chromium <version>; expectation = suite
  verdicts unchanged, evidence deltas limited to run-metadata/timestamps and
  nondeterministic pixel drift within recorded tolerance conventions; disposition =
  refresh commit with provenance."

Recommendation: worth verifying; should run BEFORE any future refactor of the e2e/
evidence machinery (candidate D) or of stage/page code feeding those specs; otherwise
deferrable without near-term risk.

### C. temporalWindow test pin (H.3-1 §3.3)

Branch unchanged and still unexercised by producers; site-documented; RATIFIED
retained-as-boundary (**OBSERVED** + prior ratification). Assessment: the exported
seam is stable (consumed by `iiif.ts:123`, `e14.ts:210,446` — live normative-chain
code); the defensive behavior is ratified intent, so a pin freezes ratified semantics,
not an incidental detail; `tests/timing.test.ts` writes no evidence, so the pin itself
has zero evidence cost (**OBSERVED**: no fs imports). Regression value: real but
modest — it protects the boundary against future "simplification" and documents the
contract executably. Semantic risk of current behavior: none identified. Prerequisite
note: the VALIDATING run is a full `pnpm test`, which executes the three P-7
evidence-writing unit suites → standard byte-stability discipline applies (expected
byte-identical; else stop).

Recommendation: worth fixing; best handled as its own micro-phase, not opportunistically.

### D. Evidence-writer restructuring / N2 aggregation extraction (H.3-1 §3.2)

Inventory re-confirmed unchanged (**OBSERVED**; P-4 producer names refreshed H.4-1).
The remaining coupling (E15 spec measure+assert+write+aggregate inline; N2 spec probe+
assert+aggregate inline) is organizational and reproducibility-related (P-7 hazard),
NOT architectural: import-level ownership boundaries are clean, H.1 #8 was framed as
mechanics-only, and P-4 sanctions the embedded model descriptively (**INFERRED**,
consistent with the RATIFIED leave-as-is). Extraction today creates churn and
validation burden (browser families need P-3 + designed evidence churn) for zero
workflow benefit; its benefit materializes only when a family must be regenerated or
its writer modified anyway.

Recommendation: REMAIN DEFERRED until the next mandatory/authorized evidence
regeneration event, at which point extraction may be bundled with that event's own
protocol.

### E. Adapter filename rename (`src/reference/lib/e14.ts`, `src/blind/e14.ts`)
(H.3-1 §3.4)

**OBSERVED**: frozen records cite these exact paths (`phase-h1…md` lines 114/208/302;
`phase-h2d…md` lines 33/43); imports span `main.ts` and two unit tests; behavior
identical either way. Renaming would improve nothing architecturally (the generation
letters in CONSUMER adapter filenames mirror the historical fixture/report namespaces
they resolve), would weaken citation continuity with frozen records, and is already
RATIFIED as intentional traceability residue (H.3-1 §3.4). Cosmetic debt only.

Recommendation: close without action; revisit only under an independently mandated
§7.2-class atomic change-set.

## 6. Cross-item dependency analysis

- A ↔ B share FILES, not outcomes: a P-3 run could opportunistically observe A's
  unsupported path, but bundling would conflate verification with behavioral probing —
  not recommended; if desired, A's runtime confirmation needs its OWN authorization
  line inside a P-3 instruction.
- C is fully independent (pure unit surface, no evidence interaction).
- D is gated on a P-3 regeneration event (itself B-class work); no dependency on A/C/E.
- E is fully independent; closing it removes one H.3-1 §6 deferred entry.
- No candidate's OUTCOME depends on another's; only sequencing preferences exist
  (B-before-D; C anytime).

## 7. Ranked decision matrix

Ranking criteria applied in order: research/interoperability significance (none of the
five carries direct research significance — stated plainly), correctness-risk
containment, likelihood of touching supported behavior, evidence/protocol cost,
churn, independence, deferrability. Not ranked by size.

| Rank | Candidate | Classification | Significance | Protocol cost | Recommendation |
|---|---|---|---|---|---|
| 1 | C temporalWindow pin | worth fixing | contract-pin at stable seam; protects ratified boundary | zero for the test; standard byte-stability on validating run | dedicated micro-phase |
| 2 | B P-3 verification | worth verifying | migration hygiene; prerequisite comfort for future e2e/evidence refactors; enables D's eventual event | moderate: designed evidence churn + provenance commit | dedicated P-3 phase when next convenient; REQUIRED before D-style refactors |
| 3 | A LabApi guards | technically important, currently no action | harness-only; no supported-surface impact | none for staying deferred | remain deferred; future scope = unsupported-combination guard + 4-member dispatch + snapshot type narrowing, NOT normalization |
| 4 | D writer restructuring | defer (organizational) | none today; benefit only at regeneration events | high if forced now | remain deferred to next authorized regeneration event |
| 5 | E adapter renames | cosmetic | none; negative traceability impact | n/a | CLOSED without action |

## 8. Recommended next execution unit

**H.5-1 — temporalWindow contract-test pin**: add the single missing case to
`tests/timing.test.ts` asserting `temporalWindow({ start: 10, end: 5 }, …)` returns
`{ start: 10, end: Number.POSITIVE_INFINITY }`, with a comment citing H.3-1 §3.3
ratification. Smallest coherent unit: one file, zero evidence-producing code, no
dependency on any other candidate. Validation ladder: focused timing suite → full
`pnpm test` with `git status --short evidence` byte-stability check → `pnpm run check`.
Thereafter, when the operator wants migration assurance, authorize **H.5-2 — P-3
Chromium verification** using the exact authorization essence in §5.B. Do NOT combine
C with B or with anything else.

## 9. Explicitly deferred items (unchanged by this phase)

LabApi guard/dispatch/type work (A, deferred with defined future scope); P-3
verification execution (B, awaiting instruction); writer restructuring (D, event-gated);
multi-engine re-measurement as NEW research (needs own mandate); cleanup-checklist
item 2 wording call; U1; U2; H.3-1 #12 erratum; adapter renames (recommended CLOSED,
pending human concurrence); evidence regeneration generally.

## 10. Validation performed

Read-only throughout: HEAD/status verification; `git diff --stat f956d4d..HEAD` over
technical trees (empty); targeted greps (`__lab` member usage; native spec usage;
adapter-path citations in frozen records); reads of three Playwright configs,
package.json scripts, renamed-spec import lines; filesystem check of the Playwright
browser cache; `git log -1` dating of five evidence families. No tests, builds,
browser suites, generators, or evidence operations; no file besides this record
created or modified; no commit made (not instructed).

## 11. Stop condition

Triage complete; recommendation handed to the operator. This phase stops here; H.5-1
(or any alternative) starts only on explicit instruction.

*End of Phase H.5-0.*
