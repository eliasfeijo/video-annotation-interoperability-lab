# Phase D Execution Checklist

Status: Phase C design artifact — the operative plan for the mechanical phase.
Basis: decisions D1–D10 (`phase-b-provenance-terminology-audit.md`) as
operationalized by `consolidation-map.md`, `documentation-conventions.md`,
`evidence-policy.md`, `fixture-provenance.json`, `current-state-index.md`.

Execution rules for the Phase D agent:

- Work on `consolidation/inventory-audit` or a successor branch created from it.
- Execute operations in order; stop at first failed invariant.
- Each operation lists: source → target, invariant, verification.
- "Approval" = explicit human/mission authorization recorded in the session before
  executing that operation.

---

## 0. Pre-flight invariants (run first)

| # | Check | Command | Expected |
|---|---|---|---|
| P-0 | Baseline lineage | `git log --oneline -5` | Phase C artifacts present at HEAD ancestry (`209d914` + 6 design docs) |
| P-0 | Clean start | `git status --short` | empty |
| P-0 | Evidence untouched baseline | `git ls-files evidence \| Measure-Object -Line` (count) | 353 |
| P-0 | Tracked-file count | `(git ls-files).Count` | 646 (640 pre-Phase-A + 2 phase docs + 4 remaining Phase C artifacts… recompute exactly at execution; invariant: count changes ONLY by authorized new files) |
| P-0 | ID spaces intact (spot) | `Select-String -Path research\*.md,docs\*.md -Pattern 'R-S8b','T15','AMB-N6-1' \| Measure-Object` | counts match pre-op snapshot taken now |

Record the spot-count snapshot in the session log before any op.

---

## A. SAFE MECHANICAL OPERATIONS (execute after approval of this checklist)

### R-1 — README refresh (D9; source analysis: Phase B §5.1 last row, §10)

Source: current `README.md`. Target: same file (in-place edit, one commit).
Scope limit: ONLY the changes below. Everything not listed is preserved verbatim.

| Op | Change | Detail |
|---|---|---|
| R-1.1 | Fix stale Layout paths | `src/lib/selectors.ts` etc. → actual paths: `src/reference/lib/{selectors,timing,svg,iiif,sanitize}.ts`; `src/renderers/rendererB.ts`,`dom.ts` → `src/reference/renderers/`; add rows for `src/blind/`, `src/native/`, `src/e14…e17/`, `src/n6/`, `docs/`, `research/` (one line each, pointer-style) |
| R-1.2 | Qualify stale counts | Replace bare "37 unit tests" / "19 E2E tests" with "37 unit tests *as of the initial cycle*" + pointer to `research/experiment-log.md` (147+32 totals) and `research/n6-implementation-report.md` (179/179 record) |
| R-1.3 | Qualify framing + add index pointer | Keep verdict-B sentence, prefixed "Initial-cycle verdict"; append one line: "Current position, open items, governance: see `research/current-state-index.md`" |
| R-1.4 | Refine viewer-gap claim | Extend TL;DR Ramp sentence with N2 refinement (crash covers ANY secondary painting body incl. raster; Mirador 3.4.3 silently drops), citing `research/viewer-interop-report.md` |
| R-1.5 | PRESERVE verbatim (do not touch) | Honesty-rules section; License rationale; manifest table (historical); Quick-start commands; Reproduce section; all exp1–7 descriptions |

Invariants:
1. No file other than `README.md` changes in this commit.
2. Historical wording preserved except the five listed edits.
3. New claims carry citations to owning documents (L6 discipline).
4. No terminology modernization of historical sentences (T-rules apply only to NEW
   sentences added).

Verification:
- `git diff --stat` → README.md only.
- `git diff -- README.md` reviewed against this table line by line.
- `git diff --check` clean.

### G-1 — Governance-doc discoverability (optional, minimal)

Target: `README.md` Layout block only (may be folded into R-1 commit).
Add a single bullet under research/: "consolidation/governance docs start at
`research/current-state-index.md`". If skipped, document the skip in the session log.
Verification: same as R-1.

### V-1 — Post-execution integrity sweep (mandatory closer)

| # | Check | Command | Expected |
|---|---|---|---|
| V-1.1 | No evidence churn | `git diff --stat -- evidence/` (vs pre-D tag) | empty |
| V-1.2 | No source movement/merge | `git diff --name-status -- src/ <baseline>..HEAD` | no renames/deletes; only authorized comment edit (op N-2 if approved) |
| V-1.3 | Renderer trees intact | `Test-Path src/reference/lib/iiif.ts`, `.../e14.ts`, `src/blind/`, `src/native/` | all True, unmodified content unless N-2 applied |
| V-1.4 | ID snapshot unchanged | re-run P-0 spot count | identical |
| V-1.5 | Fixture manifest still factual | `Get-Content research\fixture-provenance.json -Raw \| ConvertFrom-Json` succeeds | valid JSON, 8 families |
| V-1.6 | Whitespace hygiene | `git diff --check` | clean |
| V-1.7 | Working tree clean after commit | `git status --short` | empty |

Commit style: separate commits per operation group (README refresh; optional N-2),
messages matching repo convention (`docs:` prefix).

---

## B. REVIEW REQUIRED / CONDITIONAL OPERATIONS (only with explicit approval)

### N-2 — suite.ts documentation-only comment fix (D4 clarification)

Source/target: `src/n6/suite.ts` header comment lines 1–12 ONLY.
Change: "Single source of truth" phrasing → "Single EXECUTION source (normative
origin: research/conformance-matrix.md; requirements: profile-draft.md)".
Rationale: aligns self-description with the adopted ownership model without touching
any behavior.
Conditions: human approval explicitly granted; diff confined to comment lines;
behavioral verification required because a source file is touched:
`pnpm test` must pass with the historical+N6 suites green (179 unit tests expected
per n6 report validation record; browser suites NOT run — evidence-policy P-7).
If any condition fails: revert, record blocker, stop.

### D-DEF — deferred design items (NOT Phase D work; listed for completeness)

- L6 automation (generating the index from front-matter) — needs design decision.
- Splitting `open-questions.md` open/closed halves — flagged ambiguous in
  `consolidation-map.md` §1.5; leave as-is.
- Reopening `experiment-log.md` as append-only ledger — only if experiments resume.
- Any restructuring beyond documents (directory moves) — out of scope by D7/D10 and
  mission non-goals.

---

## C. FORBIDDEN / NEW RESEARCH (never executed as consolidation)

Restated as hard stops, each traceable to its decision:

1. Renaming ANY identifier: experiment IDs (exp*, E12–E17, N1–N6), T01–T15,
   RF01–RF04, R-S*/S*/X*/P*/F*/Q*/R-V*/M-M*, I-* interpretations, AMB-N6-1 (D-rules,
   conventions T-6).
2. Editing L0 documents, SUPERSEDED markers, [OPEN]/[UNKNOWN]/BLOCKED states, or
   evidence files (map §1; evidence-policy P-1..P-5).
3. Merging/moving/renaming `src/reference`, `src/blind`, `src/native` or either
   Renderer A entry point (D7).
4. Regenerating evidence/screenshots outside evidence-policy P-3 protocol (D6).
5. Resolving AMB-N6-1 or editing its formula/parenthetical texts (D10).
6. Promoting [OPEN]→requirement, [BROWSER]→[NORMATIVE], consumer failure→standards
   claim, resource-conformance→consumer-conformance (taxonomy legend Part II).
7. Creating fixture generators retroactively or inventing authorship for case1–13
   (D5 — recorded verbatim in `fixture-provenance.json`).
8. iiif.ts/e14.ts equivalence testing or any new behavioral experiment (D7; new
   research requires its own falsification-discipline setup).
9. Unifying the four provenance taxonomies or minting new labels (D2).

If any task appears to require a forbidden item: STOP, record it as a Phase D
blocker/proposal in the session log and (if durable) in `open-questions.md`
append-only, and continue with independent operations.

---

## Completion definition for Phase D

All of: A-section ops executed with invariants green (G-1 optional but decided);
N-2 either executed-with-approval or explicitly deferred-with-reason; C-section
untouched; V-1 sweep green; final report listing files changed, ops skipped, and
blockers encountered. History layers L0–L5 byte-identical to their pre-Phase-D state.
