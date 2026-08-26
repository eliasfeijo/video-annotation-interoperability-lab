# AI-Assisted Research Methodology

**Status:** Methodology disclosure for the completed research arc (documentation of process, not a research result). This document explains how AI assistance participated in the lab, how responsibility was divided, and how evidence was validated. It owns no scientific claims and does not modify the research record.

**Baseline:** `23e9483` (`docs(landing): final polish + fix public link integrity`) — working tree clean at drafting. `v1.0.0` immutable at `dbe4f2b7934231c1434d296376eb4241c3601340` (annotated tag `89021251337fa5549c93bd17f371e8587db933b7`). Zenodo version DOI `10.5281/zenodo.22105056` / concept DOI `10.5281/zenodo.22105055` published. G0/G1/G2 closed per `research/public-release-audit.md`.

**Date:** 2026-08-26

**Gating:** Implements `research/post-research-plan.md` §7 / §8 / §12 Gate G3 (methodology transparency). Depends on G1/G2. No experiment, evidence regeneration, or publication action is performed by this document.

---

## 1. Purpose and scope

This document records, in auditable form, the **actual AI-assisted workflow that produced the repository**, the division of responsibility between human and AI systems, and the verification mechanisms that prevented AI output from becoming evidence.

It does **not**:

- establish new findings, change any verdict, or modify `research/capstone.md`, `research/profile-draft.md`, `research/conformance-matrix.md`, `research/research-program.md`, `evidence/`, `src/validator/`, `public/manifests/`, `docs/index.html`/`docs/styles.css`, `CITATION.cff`, `package.json`, or release/DOI state;
- claim that AI output itself constitutes scientific evidence;
- preserve or assert the full conversational history — only the repository-tracked artifacts listed in §10 are evidenced;
- fix a permanent model identity — capability is documented, not a single model version (per `research/post-research-plan.md` §7.2).

Where a substantive research statement matters, the owning L0–L5 document wins (`research/consolidation-map.md`, `research/current-state-index.md` L6, `research/capstone.md` §12).

## 2. Human responsibility

The human operator (repository owner, `LICENSE` copyright `2026 Elias Feijó de Almeida Pereira Lima`) was the **responsible research operator**. This is directly evidenced by the governance documents (`research/post-research-plan.md` §7.2 Human; `docs/prompts/external/chatgpt-session-template.md` Working protocol).

Human-owned decisions included:

- research question, scope, and falsification design (`research/research-program.md` §1, `research/capstone.md` §2);
- requirement provenance and profile decisions (`[NORMATIVE]`/`[BROWSER]`/`[COMMUNITY]`/`[DERIVED]`/`[PROFILE]`/`[OPEN]` per `research/profile-draft.md` Part 3 and `research/documentation-conventions.md` Part II);
- governance and evidence discipline (`research/evidence-policy.md` P-1–P-7, `research/consolidation-map.md` N6 edit flow §2);
- acceptance, rejection, or revision of every AI-proposed artifact after inspection and/or deterministic validation;
- authorization of each research or publication phase and of every protocol-authorized evidence regeneration;
- determination that the research arc was complete (`research/capstone.md`, `research/research-program.md` Steps 0–3 COMPLETE) and of release/publication readiness (G0/G1/G2 closure in `research/public-release-audit.md`);
- prevention of unsupported promotion (browser facts to normative law, cookbook advice to spec, viewer gap to prohibition — `research/profile-draft.md` Part 3 promotion rules, `research/capstone.md` §3).

AI systems were **tools operated under human direction**; the human retained decision authority and accountability for publication.

## 3. AI-assisted roles

Two distinct AI assistance classes were used, as explicitly documented in `research/post-research-plan.md` §7 and `docs/prompts/external/`:

### 3.1 ChatGPT Web (Free) — planning and synthesis

Role per `research/post-research-plan.md` §7.2 and `docs/prompts/external/chatgpt-session-template.md`:

- research planning and decomposition;
- architectural reasoning and methodological critique;
- interpreting external-agent completion reports returned via the human;
- identifying risks, inconsistencies, and scope drift;
- generating precise, bounded execution prompts for the external agent.

Constraint evidenced in both documents: **ChatGPT Web had no direct repository or filesystem access** in this workflow. All repository facts reached it only as excerpts, reports, or git state supplied by the human. It therefore shaped *what was attempted and in what order*, not what was true.

Exact prompts exchanged in ChatGPT Web sessions are **not tracked as repository artifacts** and are not reconstructed here. The durable record is the task briefs under `docs/prompts/external/` (template + example) and the post-research plan's conceptual workflow, not a verbatim transcript.

### 3.2 External coding/research agents (OpenCode)

Role per `research/post-research-plan.md` §7.2 and `docs/prompts/external/session-handoff-example.md`:

- repository and filesystem inspection (current tree, git state, config, source);
- implementation (code, fixtures, validators, renderers, landing page);
- running experiments and browser probes;
- executing tests and generating evidence;
- mechanical verification (`pnpm run check`, `pnpm test`, `pnpm run build`);
- producing completion reports for human return to ChatGPT.

These agents had **repository and local filesystem access** and were authoritative for *what actually exists in the repository at execution time* (`chatgpt-session-template.md` line 49). Their output was artifacts and measurements, not claims.

The exact model identity varied over time and is **not hard-coded as a methodological dependency** — `research/post-research-plan.md` §7.2 states the exact model could vary and the capability (external agent with repo access) is the documented fact, not a single model name. This document therefore does not assert a single model version.

### 3.3 What was not an AI role

Deterministic tooling (§4) and human decisions (§2) are separate categories. AI assistance did not own evidence semantics, normative requirements, or publication decisions.

## 4. Research workflow

The practical workflow, as implemented and as documented in `research/post-research-plan.md` §7.1, was:

```text
Human research objective
        ↓
ChatGPT Web (Free) — no repo access
        ↓ planning / decomposition / critique / next-step prompt
Human transfers bounded task brief to external agent
        ↓
External agent (OpenCode, with repo access)
        ↓ inspection / implementation / experiments / evidence generation / verification
Agent produces completion report (observed facts, diffs, validation output)
        ↓
Human returns report/context to ChatGPT Web
        ↓ analysis / audit / interpretation / next-step planning
Next controlled task (human-authorized)
```

Each cycle was **human-gated**: the human approved scope, forwarded the brief, inspected the diff and validation output, and decided accept / reject / revise. Not every research phase used identical sub-steps, but the gating pattern — *planning assistance → bounded execution → deterministic artifacts → inspection/verification → human acceptance* — is the evidenced invariant.

`AGENTS.md` codified the agent's operating constraints (project character, epistemic labels OBSERVED/INFERRED/OPEN QUESTION, repository truth, architectural reuse discipline, methodological blinding of `src/reference/`/`src/blind/`/`src/native/`, protected surfaces, evidence policy, scope discipline, validation commands).

## 5. Evidence and verification

The repository distinguishes four provenance classes (`research/post-research-plan.md` §8):

| Class | What it is | Authority |
|-------|------------|-----------|
| **AI-generated planning** | ChatGPT prompts, decompositions, critiques, next-step proposals | Shaped *what was attempted*; not evidence |
| **AI-assisted implementation** | Code, docs, fixtures, evidence-producing work executed by external agents | Produced *artifacts and measurements*; required validation |
| **Human-controlled decisions** | Research questions, scope, governance, taxonomy, acceptance, completion determination | Accountable authorship; owns claims |
| **Machine-verifiable results** | Tests, matrices, evidence artifacts, validator output, browser runs, cross-engine comparisons | Reproducible observations; do not depend on which assistant phrased the task |

Central principle (`research/post-research-plan.md` §8.5):

> **AI assistance does not substitute for evidence.**

Deterministic tooling produced evidence; AI-generated interpretation did not:

- **Deterministic tools** (ordinary software, not AI reasoning): Playwright + Chromium 151.0.7922.34 / Firefox 153.0 / WebKit 26.5, TypeScript 7, Vitest 4.1.11, Vite 8.2.1, FFmpeg 9, `src/validator/` (browser-free), Git/GitHub, unpkg bundles (`@samvera/ramp@5.1.1`, `mirador@3.4.3`), `presentation-validator.iiif.io` POST. Their output is the archived result set under `evidence/` (`research/evidence-policy.md` P-1).
- **AI interpretation**: planning text, code proposals, audit summaries. Treated as hypotheses; acceptance required inspection of repository state and/or deterministic validation (`pnpm run check`, `pnpm test`, `pnpm run build`, Playwright suites, `node scripts/run-n6-suite.mjs`, `node scripts/cross-engine-aggregate.mjs`, link audits, viewport checks, axe).

Evidence handling followed `research/evidence-policy.md`:

- P-1 archived result set (evidence backs L0 reports; not a rebuildable cache);
- P-2 byte-unstable in practice (rendering nondeterminism);
- P-3 protocol-authorized regeneration only (explicit what/why, source state recorded, expectations compared, provenance in commit message);
- P-4 source-state linkage (family → producer);
- P-5 frozen filenames;
- P-7 working-tree hazard (suites write `evidence/` on every run; check `git status --short evidence`).

The N6 validator's five-stage edit flow (`research/consolidation-map.md` §2: `profile-draft.md` → `conformance-matrix.md` → `src/validator/suite.ts` → `run-n6-suite.mts` → `evidence/n6/`) enforced that requirement changes flow left-to-right; downstream-first edits are forbidden.

## 6. Adversarial checking and correction

AI-assisted work was not treated as infallible. Two repository-recorded episodes demonstrate the verification model:

### 6.1 H.5-2 aborted root-config evidence refresh

Documented in `research/phase-h5-2r-post-gx-chromium-p3-refresh.md` (Phase H.5-2R).

- An authorized P-3 refresh executed `pnpm test:e2e` (root Playwright config). Suite verdict 90/90 passed, but the run produced 66 tracked modifications + 37 untracked files with **empty-engine provenance** (`"engine": ""`, filenames `case-e15--*.json`) because `test.info().project.name` was empty under the root config (`cross-engine.spec.ts` ×9, `consumer-probe.spec.ts:164`).
- The phase was **stopped before commit** per stop conditions; the 66+37 artifacts were discarded and restored against a pre-run SHA256 inventory (353 files, byte-identical match required), not absorbed.
- The canonical Chromium-only refresh was then executed via the documented named-project configs (`playwright.cross-engine.config.ts --project=chromium` 16/16, `playwright.consumer-probe.config.ts` 10/10, `node scripts/cross-engine-aggregate.mjs` 62 rows) with delta limited to 11 files (timestamps + documented PNG drift + `rootTextSample` variance), verified zero `"engine": ""`.

This demonstrates: passing tests ≠ architectural correctness; provenance defects are rejected even when suites pass; restoration is verified, not assumed.

### 6.2 P1-E.8 → P1-E.9 mobile clipping fix

The landing page's initial publication audit (G2, `research/public-release-audit.md`) recorded visual/responsive/a11y PASS at `be72139` (7 viewports, `scrollWidth === clientWidth`, axe 0 violations). Subsequent verification at narrower viewports found **vertical text clipping** in the boundary table's stacked card rows (`overflow: hidden` on `tr`, `scrollHeight 52 > 44`, border intersecting glyphs in R-S3 and other rows).

The fix (`7821ae2 docs(styles): fix mobile boundary-table text clipping`) replaced `overflow: hidden` on `tr` with `overflow: visible`, preserved rounded-card appearance via `border-radius` on first/last `td`, and added `height: auto`, `min-height: 44px` (56px ≤480px), `overflow-wrap: anywhere` on `td`. Verification recorded in the commit message: no clipping at 390/375/320/768/1024/1440, document overflow 0, focus outline and label overlap intact, desktop unchanged. A follow-up link-integrity polish (`23e9483`) converted 62 `../` hrefs that 404 on Pages to absolute `https://github.com/.../blob|tree/main/...` and re-verified 0 `../`, 0 `TBD`.

Both episodes are **examples of the verification model**, not scientific findings. They show that AI-assisted auditing and initial human review were subject to deterministic browser measurement and were corrected when measurement disagreed.

## 7. Limitations

Only limitations evidenced in the repository are stated:

- **No direct ChatGPT repository access.** The ChatGPT Web ↔ external agent split required human relay; ChatGPT could not independently verify repository state (`docs/prompts/external/chatgpt-session-template.md`).
- **Full conversational history not preserved.** Verbatim ChatGPT prompts and responses are not tracked as repository artifacts. The durable record is the repository state, commits, evidence, and the planning templates/plan — not a transcript.
- **Model/tool availability varied.** The external agent's exact model could vary over time (`research/post-research-plan.md` §7.2); pinning a single model would misrepresent the method. Deterministic toolchain versions *are* pinned (`package.json`: Playwright 1.62.1, Vite 8.2.1, Vitest 4.1.11, TypeScript 7, Node 26, FFmpeg 9; `evidence/` rows embed engine versions).
- **Incomplete automation.** Evidence generation remained intentionally manual and protocol-gated (P-3); running tests must not be treated as authorization to regenerate evidence (`AGENTS.md`). Browser/network-dependent evidence (E15–E17, N2, D1, viewer probes, validator POST) requires the original environment classes; if unavailable the task is BLOCKED, not approximated (`research/evidence-policy.md` P-3).
- **Visual inspection limits.** Automated checks (axe, `scrollWidth === clientWidth`, Playwright viewports) do not replace human judgment for readability, framing bias, or terminology correctness — hence the explicit human acceptance gate and the P1-E.9 correction.
- **Version scope.** All engine/consumer findings are version-scoped (Chromium 151.0.7922.34 / Firefox 153.0 / WebKit 26.5; Ramp 5.1.1 / Mirador 3.4.3) per `research/capstone.md` §10 and `research/e17-report.md` §27–29. AI assistance does not lift this scope.

No additional limitations are invented.

## 8. Reproducibility and auditability

Auditability rests on repository state and deterministic replay, not on AI recall:

- **Repository as source of truth** (`AGENTS.md` Repository truth). Every claim in `research/capstone.md` §12 traces to a commit, evidence file, or cited spec.
- **Commits as provenance.** The full git history (e.g., `23e9483`, `7821ae2`, `be3afb9`, `dbe4f2b`/`8902125` for `v1.0.0`) records what changed, when, and with what message. Evidence regenerations carry provenance in the commit message per P-3(4) (e.g., H.5-2R's 11-file refresh).
- **Evidence as archived result set** (`research/evidence-policy.md` P-1). Tracked `evidence/` families (`e15/`, `e16/`, `e17/`, `viewer/`, `viewer-interaction/`, `n6/`, `screenshots/`, `observations/`, `blind-comparison/`) are the measured backing for L0 reports, not a cache to rebuild casually.
- **Deterministic replay.** Reproducibility path per `research/capstone.md` §10 and `README.md`: `pnpm install` → `pnpm exec playwright install chromium firefox webkit` → `pnpm gen:video` → `pnpm gen:fixtures` → `pnpm test` (180 tests at capstone) → `pnpm exec playwright test --config=playwright.cross-engine.config.ts` (E17) → `pnpm exec playwright test --config=playwright.consumer-probe.config.ts` (N2+D1) → `node scripts/run-n6-suite.mjs` (N6). Network required only for viewer probes and validator POST.
- **Governance layers** (`research/consolidation-map.md` L0–L6, `research/current-state-index.md` L6) separate historical record (frozen), normative requirements (controlled), and navigation (pointer-only).
- **Validation commands** (`AGENTS.md` Validation: `pnpm run check`, `pnpm test`, `pnpm run build`; plus `git status --short evidence` after evidence-producing suites).

AI assistance is auditable to the extent that its *effects* are tracked as diffs, evidence, and reports. The repository does not claim that every intermediate AI reasoning step is independently reproducible from a transcript.

## 9. Disclosure boundary

- **AI assistance does not substitute for scientific evidence or human responsibility.** The capstone's evidence discipline and taxonomy remain authoritative; AI-generated planning, implementation assistance, and human decisions are meaningful only insofar as they are backed by traceable evidence (`research/post-research-plan.md` §8.5).
- The short disclosure in `docs/index.html` `#ai-method` satisfies the G2 landing-page requirement; this dedicated note satisfies G3. Neither disclosure changes the research record.
- The document at hand is **documentation of the completed process**, not a continuation of the research. No new experiment, terminology, or claim is introduced here.

## 10. Evidence index / references

Repository-relative paths (internal research document convention):

- Workflow and responsibility: `research/post-research-plan.md` §§7–8, `docs/prompts/external/chatgpt-session-template.md`, `docs/prompts/external/session-handoff-example.md`, `AGENTS.md`
- Governance and layers: `research/consolidation-map.md`, `research/current-state-index.md`, `research/documentation-conventions.md`, `research/terminology-specification.md`
- Evidence policy: `research/evidence-policy.md`, `research/fixture-provenance.json`
- Canonical synthesis and claims: `research/capstone.md` (§12 evidence map), `research/profile-draft.md`, `research/conformance-matrix.md`, `research/n6-implementation-report.md`
- Experiment records: `research/e15-report.md`, `research/e16-report.md`, `research/e17-report.md`, `research/e15-e16-final-report.md`, `research/viewer-interop-report.md`, `research/experiment-log.md` #18 (D1), `research/n4-safe-subset.md`, `research/community-positioning.md`
- Adversarial / correction episodes: `research/phase-h5-2r-post-gx-chromium-p3-refresh.md` (H.5-2 → H.5-2R), `research/public-release-audit.md` (G0/G1/G2), git commits `7821ae2` (P1-E.9 mobile clipping fix), `23e9483` (link-integrity polish)
- Publication state: `CITATION.cff`, `LICENSE`, `package.json`, `docs/index.html` `#ai-method`, `research/public-release-audit.md` G1/G2 records, tag `v1.0.0` (`dbe4f2b` / `8902125`), Zenodo DOIs `10.5281/zenodo.22105056` / `10.5281/zenodo.22105055`
- Landing page spec (implementation requirements, not evidence): `research/landing-page-spec.md`

---

*End of AI-assisted methodology disclosure. Next: P2 technical outreach article (P2/G3 → publication, not research). Do not start G4 or any new research phase without explicit authorization.*
