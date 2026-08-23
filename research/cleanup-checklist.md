# Cleanup Checklist — Stale Documentation Findings

Working checklist produced by the 2026-08-23 pointer review. Items expire when
executed; this file is not part of the frozen record. It owns no research claims —
every finding below cites its evidence.

---

## Summary

| Field | Value |
|---|---|
| Last updated | 2026-08-23 (agent documentation-currency review session) |
| Baseline | HEAD `1283438` ("refactor: remove dead public surfaces (phase H.2-C)", 2026-08-22); tracked tree clean at review start |
| Scope | Documentation currency only. Exactly one file was edited (`current-state-index.md`, pointer-only edits per its own maintenance rule). Everything else here is FLAGGED, not touched. |
| Method | Git log replay (`993d82a`…`1283438`, 2026-08-20 → 2026-08-22) cross-checked against `research/*`, `docs/*`, `README.md`, `AGENTS.md`, and the live `src/` tree. Per-commit `--stat` inspection for every commit after Phase C (`a453988`). |
| Validation performed | None beyond inspection — docs-only change; no tests run, no build run. |
| Evidence status | No suites executed; tracked evidence untouched. |
| Result | 1 document updated (the index); 4 findings recorded — item 4 was executed within this session (see below), items 1–3 remain pending authorization; plus do-not-fix notes for frozen records. |

### What was edited in this pass (current-state-index.md only)

1. Header: added last-pointer-review stamp (date + baseline commit).
2. "Current research position": added pointer bullets for the identifier registry,
   the Phase F proposal, H.2-owned current tree layout, and the H.1 #6–#11 carried
   questions.
3. Open-items table: added rows for H.1 deferred questions #6–#11 and the Phase F
   terminology-migration review gate.
4. Consolidation records: added Phase E / G.1 / H.1 process records; added a
   separate mutable group listing `terminology.md`, `terminology-specification.md`,
   and this checklist.

---

## Action items (require their own authorization before execution)

### 1. README.md — Layout and quick-start stale after Phases H.2-A/B/C

Priority: medium. Public entry point; a refresh touches no protected machine surface
as long as URL params/verdicts are only described, never changed.

OBSERVED stale facts:

- Layout lists `src/experiments.ts` and Renderer B under `src/reference/renderers/`;
  H.2-B moved these to `src/oracle/experiments.ts` and `src/oracle/rendererB.ts`.
- Layout omits `src/primitives/` (created H.2-A) and `src/comparison/` (created
  H.2-B; `src/blind/comparison.ts` → `src/comparison/blind-comparison.ts`).
- Quick start advertises `/?exp=1..7&renderer=a|b`; the live surface also accepts
  `blind` and `native` (`src/main.ts:71–87`). Documentation-only gap: the parameter
  set itself is a protected surface — fix the prose, not the parameters.
- Non-issue: "(37 tests as of the initial cycle)" already self-qualifies; leave.

Suggested action: scoped docs-only refresh of the Layout block and the renderer
enumeration in quick start. The prior refresh (op R-1 / D9, commit `b4b0503`) was an
executed, scoped operation; a new refresh needs its own mandate.

### 2. open-questions.md — register items 12–15 not annotated against executing stages

Priority: medium. Register is append-only with status legend OPEN /
ANSWERED (session, see link) / SUPERSEDED; numbering is never touched.

OBSERVED:

- Item 12 (N1 cross-engine) → executed as E17 (`e17-report.md`).
- Item 13 (N2 two-stage composition in deployed viewers) → executed as the consumer
  probes (`viewer-interop-report.md` V1–V7 / M1–M3).
- Item 14 (N3 community positioning) → executed as `community-positioning.md`
  (+ `n3-source-index.json`).
- Item 15 (N4 same-aspect subset adoption) → decided as `n4-safe-subset.md`.

INFERRED: status annotations were simply never appended after the stages ran; the
register's own legend supports marking them.

OPEN QUESTION (wording, human call): whether items 12–15 should read ANSWERED or
SUPERSEDED per item, since each answer became a whole document rather than a session
note. Item 11 additionally predates N2's refinement (Ramp crashes on ANY secondary
painting body; Mirador silently drops) — a candidate refinement annotation, but its
substance remains genuinely OPEN.

Suggested action: append status lines using the established new-above-historic
practice; keep all numbering intact.

### 3. terminology.md — phase coverage lags

Priority: low. The registry's own §7 authorizes fixing it when it lags owners.

OBSERVED:

- §2.D row "Phase letters … consolidation phases A–E" predates Phases F/G.1/H.1/
  H.2-A/B/C.
- The registry does not yet catalog H-phase identifier families (e.g., H.1 deferred
  question numbers #1–#12).

Suggested action: small registry update once items 1–2 land, or alongside the Phase F
review outcome (which may supersede parts of the registry anyway).

### 4. Untracked governance files — AGENTS.md, docs/prompts/

Priority: housekeeping / human decision.

OBSERVED: `git status --short` reports `?? AGENTS.md` and `?? docs/prompts/`.
AGENTS.md content was verified consistent with the current architecture (four-tier
model citing `phase-h2a`; infrastructure list matches the post-H.2 tree).

Suggested action: decide whether to track/commit them; out of scope for this pass.

Resolution: EXECUTED in this session — both paths tracked and committed
(`8edde96`, "docs: add coding-agent instructions and coordination prompts"),
after a secrets/content check against their documented purpose. Item closed.

---

## Do-not-fix notes (expected staleness in frozen records)

### 5. consolidation-map.md

Frozen Phase C design artifact ("frozen once committed" per its own §1.2). Its §1
tables and §1.4 source-tree rules intentionally predate Phases E–H.2; they describe
the pre-H.2 tree and do not list the later phase records. This is by design: the
current-state index now carries the current pointers. Do NOT modernize the map;
record new state in new phase records instead (per AGENTS.md historical-records rule).

### 6. phase-g1-source-architecture-inventory.md (+ path citations inside phase-h1)

Observation-only audits whose authority is bounded to their baselines (`9c6534f`,
pre-H.2). Paths cited there that have since moved (all OBSERVED via commit stats):

- `src/experiments.ts` → `src/oracle/experiments.ts` (H.2-B)
- `src/reference/renderers/rendererB.ts` → `src/oracle/rendererB.ts` (H.2-B)
- `src/blind/comparison.ts` → `src/comparison/blind-comparison.ts` (H.2-B)
- `src/blind/svg-root.ts` → `src/primitives/svg-root.ts` (H.2-A)
- `src/blind/index.ts` barrel deleted; `timing.activeAt` removed (H.2-C)

G.1's header phrase "as they exist today" is now era-bound. These are correct
as-of-their-era citations — the same pattern H.2-C §9 already records for frozen
records mentioning deleted surfaces. Pair G.1/H.1 with the H.2 records for current
layout; do not edit them.

### 7. All L0 records and Phase C/D artifacts

`findings.md`, `plan.md`, `experiment-log.md`, `next-session-plan.md`, the E14/E15/
E16/E17/final/viewer reports, `docs/*`, plus `documentation-conventions.md`,
`evidence-policy.md`, `phase-d-checklist.md` — frozen historical/process records.
Any apparent staleness inside them is record, not defect. Spot-checked anchors used
by the index still resolve (e.g., documentation-conventions T-5 "Framing").

---

## Verification notes

- All documents referenced by the updated index exist at HEAD (checked via file
  listing): every L0/L1/L2/L3/L4/L5 owner named there, all phase records A–H.2,
  `terminology.md`, `terminology-specification.md`, `n3-source-index.json`.
- Normative-chain surfaces verified present at HEAD: `profile-draft.md` Parts 4–10,
  `conformance-matrix.md`, `src/n6/suite.ts` and the other `src/n6/*` modules.
- Layer assignments in the index were left untouched: inventing new epistemic layers
  would be a semantic decision owned by the frozen consolidation map, not a pointer
  edit. New documents are instead navigated via the position bullets and the
  process-record lists.
