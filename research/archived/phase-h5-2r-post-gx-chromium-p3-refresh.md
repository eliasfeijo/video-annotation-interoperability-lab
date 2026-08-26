# Phase H.5-2R — Post-G.x Chromium P-3 Evidence Refresh (incident disposition + canonical completion)

Status: EXECUTION RECORD for the H.5-2/H.5-2R work unit. Baseline: clean evidence at
HEAD `fd0dca9` ("test: pin temporalWindow inverted-range defensive clamp (phase
H.5-1)"; parent `8f4296e`). This record documents (1) the aborted root-config
execution of H.5-2, (2) its deliberate disposition, and (3) the completed
canonical Chromium-only P-3 refresh of the E17/N2 evidence families.

Epistemic labels: **OBSERVED**, **INFERRED**, **RATIFIED** (decided in prior records),
**OPEN QUESTION**.

## 1. Authorization

H.5-2 was authorized as a protocol-authorized regeneration (evidence policy P-3):
purpose = verify post-G.x renamed e2e surfaces execute identically post-rename;
measure = pass/fail of the named suites plus regeneration of their evidence
families; expectation = suite verdicts unchanged, evidence deltas limited to
run-metadata/timestamps and nondeterministic drift within recorded tolerance
conventions; disposition = refresh commit with provenance. Chromium only;
Firefox/WebKit excluded; LabApi excluded. The authorization named `pnpm test:e2e`
as the execution surface, per the H.5-0 triage proposal
(`phase-h5-0-deferred-technical-follow-up-triage.md`, untracked working material).

## 2. Incident: aborted root-config execution (H.5-2)

OBSERVED facts of the aborted run (2026-08-25, from HEAD `fd0dca9`, pre-run
SHA256 inventory taken over all 353 tracked evidence files):

- Command executed exactly as authorized: `pnpm test:e2e` (root Playwright config).
- Suite verdict: **90/90 passed** (~3.7 min); all six renamed surfaces exercised
  (`embedding-semantics.spec.ts`, `cross-engine.spec.ts`,
  `consumer-probe.spec.ts`, `viewer.spec.ts`, `composition.spec.ts`,
  `nested-composition.spec.ts`). The verification half of the objective
  SUCCEEDED.
- Evidence outcome: 66 tracked files byte-modified; 37 NEW untracked evidence
  files; zero deletions. Families untouched: `evidence/e15/*`,
  `blind-comparison/*`, `n6/*`.
- **Provenance defect**: the affected specs derive provenance/filenames from
  `test.info().project.name` (`tests/e2e/cross-engine.spec.ts` ×9 sites,
  `tests/e2e/consumer-probe.spec.ts:164`). The root config defines no `projects`
  array, so the implicit default project name is EMPTY. Consequences:
  - E17 wrote a parallel artifact set with empty engine segments
    (`case-e15--*.json`, `intrinsics-.json`, `e16--*.json`, flat screenshots
    `-case0*-*.png`) instead of refreshing the tracked `*-chromium-*` forms;
  - N2 rewrote `viewer-matrix.json` and all ten `evidence/viewer/probe-*.json`
    rows with `"engine": ""` where tracked evidence records
    `"engine": "chromium"`.
- The phase was STOPPED before commit per its stop conditions ("unexpected
  structural/semantic divergence"; "required provenance cannot be established").
  No invalid output was committed, normalized, or hidden.

INFERRED (verified by git history during the read-only investigation): this is a
latent root-config/evidence-provenance incompatibility, NOT a G.x rename
regression — the spec code is unchanged since E17's introduction (`d8b2355`) and
the root config since `993d82a`; no empty-engine filename was ever committed in
repository history.

## 3. Architectural disposition (Model B)

Established by the read-only preflight that followed the stop:

- The DOCUMENTED canonical generation surfaces for E17/N2 are the dedicated
  named-project configs: `playwright.e17.config.ts` →
  `playwright.cross-engine.config.ts` (projects chromium/firefox/webkit;
  commands recorded in `e17-report.md` §6 Evidence index) and
  `playwright.n2.config.ts` → `playwright.consumer-probe.config.ts`
  (chromium project; `viewer-interop-report.md` "Run counts"). All historical
  captures of these families used named engines.
- Root `pnpm test:e2e` remains the broad execution/smoke surface and the
  canonical surface for every OTHER e2e family (none of which reads project
  identity; historically refreshed by root runs, e.g. `e08522d`, `cd43c66`).

## 4. Churn disposition

The 66 tracked modifications and 37 untracked artifacts from the aborted run are
INVALID AS CANONICAL EVIDENCE (empty-engine provenance/filename grammar). They
were deliberately discarded/restored — not absorbed, not committed, not silently
deleted: restoration was performed only AFTER this record documented the
incident, and verified against the pre-run SHA256 inventory (353 files,
byte-identical match required). The untracked working-material record
`research/phase-h5-0-deferred-technical-follow-up-triage.md` was preserved
untouched throughout.

## 5. Canonical Chromium-only P-3 refresh (H.5-2R)

Commands (the only browser executions of this unit):

1. `pnpm exec playwright test --config=playwright.cross-engine.config.ts --project=chromium`
2. `pnpm exec playwright test --config=playwright.consumer-probe.config.ts`

Environment: Playwright 1.62.1; Chrome for Testing 151.0.7922.34 (Playwright
chromium v1234); Windows win32; Vite dev server on 127.0.0.1:5173; fixtures
tracked and unmodified at `fd0dca9`. Firefox/WebKit were not executed; no
Firefox/WebKit evidence file changed. The E17 family's tracked aggregate outputs
(`summary.json`, `cross-engine-matrix.json`) are regenerated by the documented
canonical procedure step `node scripts/cross-engine-aggregate.mjs` after the
suite (G.x rename of `scripts/e17-aggregate.mjs`; see `e17-report.md` §6).

Results: SEE §6.

## 6. Refresh results and delta classification

OBSERVED (2026-08-25, from restored-clean state at HEAD `fd0dca9`):

- E17 canonical Chromium run: `pnpm exec playwright test
  --config=playwright.cross-engine.config.ts --project=chromium` → **16/16
  passed** (`[chromium]` project; matches the historically documented 16/16 per
  engine in `e17-report.md`).
- N2 canonical run: `pnpm exec playwright test
  --config=playwright.consumer-probe.config.ts` → **10/10 passed** (matches
  `viewer-interop-report.md` "Run counts").
- Aggregate step: `node scripts/cross-engine-aggregate.mjs` → 62 rows (62
  unanimous, 0 divergent, 0 incomplete) — identical agreement structure to the
  tracked matrix.
- Evidence delta: exactly **11 tracked files byte-modified; 0 new; 0 deleted**
  (verified by full SHA256 inventory comparison against the restored pre-run
  state). All within the authorized E17/N2 families:

  | File(s) | Delta | Class |
  |---|---|---|
  | `evidence/e17/summary.json` | `generatedAt` timestamp only | run-metadata refresh (P-3(2)) |
  | `cross-engine-matrix.json`, all 16 `case-e15-chromium-*` / `case-max-chromium--*` / `intrinsics-chromium.json` / `e16-chromium-*` case files | BYTE-IDENTICAL — chromium measurements reproduced exactly under the same browser build (151.0.7922.34) | verification success (no churn) |
  | `screenshots/e17/chromium-case01-native.png`, `chromium-case05-native.png`; `screenshots/n2/*.png` ×4 | PNG byte drift | rendering nondeterminism (P-2) |
  | `viewer-matrix.json` | `generatedAt`; three `rootTextSample` "Loaded: X%" capture-instant network-load variances (0→100%, 0→78.23%, 11.81→33.53%); `engine` provenance UNCHANGED ("chromium") | metadata + documented nondeterministic unasserted capture field |
  | `viewer/probe-ramp-v{1,2,3}-*.json` | `rootTextSample` load-% variance only; all provenance fields intact | same |

- Provenance/filename verification: zero `"engine": ""` occurrences across
  `evidence/e17/*` and viewer evidence; all eight refreshed
  `case-e15-chromium-*.json` carry `"engine": "chromium"`; every changed path
  follows the historical named-engine grammar; no Firefox/WebKit-named file
  changed.
- Disposition: single `chore:` refresh commit containing the 11 refreshed
  evidence files plus this record (P-3(4): what/why/source-state in the commit
  message). No source/test/config change; no policy change; no taxonomy change;
  `research/phase-h5-0-deferred-technical-follow-up-triage.md` remains untracked
  working material, excluded from the commit per its own instruction.

Research verdict: the post-G.x renamed e2e surfaces are VERIFIED under Chromium —
suite verdicts unchanged (90/90 root smoke + 16/16 E17 + 10/10 N2 canonical),
E17 chromium measurements byte-reproduced, N2 outcomes unchanged except
documented nondeterministic classes. The P-3 refresh is COMPLETE for the
Chromium scope; Firefox/WebKit re-measurement remains out of scope (would be new
research).

OPEN QUESTION (carried, not resolved here): whether the incidental
`rootTextSample` "Loaded: X%" field should be normalized in a future writer
change to reduce churn noise (H.3-1 §3.2 deferred-writer territory; NOT
authorized in this unit).

*End of Phase H.5-2R.*
