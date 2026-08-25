# Post-Research Publication & Dissemination Plan

**Status:** Forward-looking operational roadmap (mutable planning surface).
This document plans what to do **with** the completed research. It owns no
scientific claims, introduces no new experimental results, and does not modify
the research record.

**Baseline:** `1dc6114` (`docs: finalize research navigation and status`) /
`24afbfb` (`docs: add final research capstone synthesis`), working tree clean
at drafting. No publication, release, DOI, or deployment is performed by this
document.

**Date:** 2026-08-25

---

## 0. Position and non-purpose

### 0.1 Research arc is complete

The lab's experimental and conformance arc is complete as recorded in
`research/research-program.md` Step 3 and synthesized in `research/capstone.md`.
No further experimental or research phase is authorized at this point. Any
future experimental work would require its own explicit authorization and must
not be inferred from this plan.

### 0.2 Canonical final synthesis

`research/capstone.md` is the **canonical final synthesis** — the auditable
answer to what is predictable, interoperable, and mechanically checkable, under
which conditions, and where guarantees stop. Every substantive claim there
traces to the source table in `research/capstone.md` §12.

### 0.3 Relationship to the capstone

This document **does not modify, supersede, reinterpret, or reword** the
capstone. Where a factual statement matters, the capstone (and the document it
cites) wins. If this plan and any owning document disagree, the owning document
wins and this plan must be corrected as a pointer-only edit.

### 0.4 Nature of future activities

All activities listed here are **publication, preservation, dissemination, and
communication** activities unless explicitly described otherwise. They package,
cite, archive, and explain the already-completed research; they do not reopen
the research program.

### 0.5 Academic reframing, not reopening

Future academic publication may involve **reframing the already-completed
research** into a scholarly presentation (paper, preprint, workshop submission)
rather than reopening the experimental program. A new presentation does not
retroactively change the frozen evidence, fixtures, or prior verdicts.
Reopening experiments requires separate justification under the falsification
protocol and evidence policy (`research/evidence-policy.md`, `research/consolidation-map.md`).

---

## 1. P0 — Public-release audit (gate, not checklist)

### 1.1 Final audit before public exposure

Before the repository is made public, a **deliberate public-release audit**
must be completed. This is an **audit gate**: the repository must not be made
public until the gate is explicitly completed and recorded.

### 1.2 Audit scope

The audit covers at minimum:

* secrets, credentials, API keys, tokens;
* private URLs, internal endpoints, local filesystem paths;
* personal data and identifying information — including information
  accidentally present in fixtures or evidence (filenames, captured DOM, probe
  payloads, screenshots);
* artifacts that should not be public (draft credentials, private notes,
  local configuration);
* generated files that should not be tracked or published;
* dependency licenses and third-party assets (bundles, vendored code, fonts,
  media) — verify each asset's license permits redistribution and that
  attribution requirements are met;
* Git history and commit metadata — author names/emails, commit messages,
  embedded secrets, prior versions of files that were later cleaned;
* provenance and attribution of external code, fixtures, and evidence;
* external services referenced by the repository (unpkg bundles for Ramp/Mirador,
  `presentation-validator.iiif.io`, CDN URLs) — confirm no private dependency
  and no assumption that a third-party URL will remain stable;
* reproducibility assumptions — what is pinned vs. floating, what requires
  network access, what is version-scoped;
* potentially unstable external dependencies whose disappearance or change
  would break reproducibility or create legal exposure;
* anything else whose publication could create privacy, security, or legal
  problems.

### 1.3 Gate character

This is not a casual checklist to tick while publishing. Each item must be
**inspected, dispositioned, and recorded** (clean / remediated / explicitly
accepted with rationale). Remediation that touches history requires its own
recorded decision. The gate closes only when the auditor(s) explicitly state
that no known secret, privacy, security, or legal issue remains.

### 1.4 Gating rule

> The repository must not be made public until P0 is explicitly completed.

Completion should be recorded as a short audit note (who audited, when, at
which commit, outcome) — not as a silent assumption that "it looked fine."

---

## 2. P1 — Open-source publication: publish the repository on GitHub

### 2.1 Intended workflow

1. Complete P0 audit (gate G0).
2. Prepare a release candidate on a clean working tree at the chosen commit.
3. Inspect the repository **as an external reader** — clone into a fresh
   directory, follow the README, run reproducibility instructions.
4. Verify `README.md` and navigation (`research/current-state-index.md` points
   to the capstone; capstone is reachable; no stale layout/count claims
   mislead a newcomer).
5. Verify `LICENSE` is present and correct (MIT — `LICENSE`).
6. Verify reproducibility instructions are accurate (`pnpm install`,
   `pnpm exec playwright install chromium`, `pnpm gen:video`,
   `pnpm gen:fixtures`, `pnpm dev`, `pnpm test`, Playwright suites,
   `node scripts/run-n6-suite.mjs`; network requirements for viewer probes and
   validator POST noted).
7. Verify research status is unambiguous — the lab is complete, the capstone
   is canonical, this plan is forward-looking.
8. Only then publish / open-source the repository (make public, set visibility,
   confirm default branch and description).

### 2.2 Placeholders

Do not assume the current repository name, GitHub owner/organization, or final
URL is known. Use placeholders where necessary rather than inventing them:

* `<GITHUB_OWNER>/<REPO_NAME>` for the repository slug;
* `<REPO_URL>` for the canonical HTTPS URL;
* `<DEFAULT_BRANCH>` for the default branch name.

No URL is invented by this plan.

### 2.3 Non-goals at this step

No code changes, feature work, or evidence regeneration accompany publication.
Publication exposes the existing artifact; it does not improve it.

---

## 3. P1 — Research identity and citation: add `CITATION.cff`

### 3.1 Why it exists

`CITATION.cff` (Citation File Format) provides **machine-readable citation
metadata** for the repository as a software/research artifact:

* easier citation by researchers and tooling;
* GitHub's built-in citation UI support ("Cite this repository");
* clean separation between **software/repository citation** and a future
  **paper citation** — they are distinct citable objects with distinct DOIs
  and bibliographic records.

### 3.2 What it will need

The file should be added after the repository is public (or staged with the
release candidate) and must include at minimum:

* `cff-version`, `message`, `title`;
* authorship (to be decided — see §3.3);
* repository URL (`<REPO_URL>`);
* license (`MIT`);
* version (`1.0.0` at first release — §4);
* release date (actual date of `v1.0.0`);
* DOI once available via Zenodo (§5) — added as `doi` / `identifiers`;
* preferred citation text and abstract (one-sentence research statement).

### 3.3 Fields that require a future decision

This plan does **not** invent bibliographic information. The following remain
**OPEN** until explicitly decided by the human research operator:

* authorship and author order;
* canonical title string (lab name vs. artifact title);
* preferred citation text;
* ORCID(s) — if any;
* affiliation(s) — if any;
* keywords and abstract wording.

Placeholders or `TBD` must be used in any draft; no name, ORCID, affiliation,
or venue is invented here.

### 3.4 Maintenance

`CITATION.cff` is updated only when the release, DOI, or authorship decision
changes. It never carries unsupported research claims.

---

## 4. P1 — GitHub Release: create `v1.0.0`

### 4.1 Character of the release

`v1.0.0` is the **first public research artifact release**, not merely a
software version bump. It marks a stable snapshot of the completed research
for citation and archival.

### 4.2 What the release corresponds to

The tagged snapshot must include a consistent, self-contained set:

* research reports (`research/e14-report.md`, `research/e15-report.md`,
  `research/e16-report.md`, `research/e17-report.md`,
  `research/e15-e16-final-report.md`, `research/viewer-interop-report.md`,
  `research/n4-safe-subset.md`, `research/community-positioning.md`) and
  supporting governance (`research/consolidation-map.md`,
  `research/evidence-policy.md`, `research/documentation-conventions.md`,
  `research/current-state-index.md`, `research/research-program.md`);
* canonical synthesis `research/capstone.md`;
* profile and conformance model (`research/profile-draft.md`,
  `research/conformance-matrix.md`, `research/n6-implementation-report.md`);
* evidence (`evidence/` — all families: `e15/`, `e16/`, `e17/`,
  `viewer-matrix.json` + `viewer/`, `viewer-interaction/`, `n6/`,
  `screenshots/`, `observations/`, `blind-comparison/`);
* validator (`src/validator/`);
* fixtures (`public/manifests/`, `public/svg/`, `public/video/`,
  `scripts/generate-video.mjs`, `scripts/build-fixtures.mjs`);
* documentation and reproducibility instructions (`README.md`,
  `research/fixture-provenance.json`, `CITATION.cff` once added);
* license (`LICENSE`).

### 4.3 Tagging and notes

* Tag: `v1.0.0` on the audited, externally-inspected commit.
* Release notes: state that the research arc is complete, point to the
  capstone, note that consumer-side validation is blocked pending a capable
  consumer, and link to the DOI once minted.
* Future changes (if any) do not invalidate the findings captured at `v1.0.0`;
  they are new work with new provenance.

---

## 5. P1 — DOI / archival identity: Zenodo

### 5.1 Intended workflow

```text
GitHub repository  (<REPO_URL>)
        ↓
GitHub Release  (v1.0.0, tag + notes)
        ↓
Zenodo archival integration  (GitHub–Zenodo webhook / linked deposit)
        ↓
DOI  (persistent identifier, version-scoped and concept DOI)
        ↓
stable citation target  (resolves independent of repository evolution)
```

### 5.2 Why the DOI matters

A DOI provides a **persistent scholarly reference** independent of the
repository's future evolution (renames, moves, branch changes). It makes the
artifact citable in papers, indexes, and funding reports even if the live
repository later advances.

### 5.3 Distinguish

* **Repository URL** — the live GitHub location (`<REPO_URL>`);
* **GitHub Release** — a tagged snapshot with release notes (`v1.0.0`);
* **Zenodo record** — the archived deposit with metadata and files;
* **DOI** — the persistent identifier resolving to the Zenodo record
  (e.g., `10.5281/zenodo.<TBD>` — placeholder, not invented).

None of these is interchangeable with another. Citations should prefer the DOI
once available; the repository URL remains the development location.

### 5.4 Do not invent

No DOI, Zenodo record URL, or badge URL is invented by this plan. The actual
DOI is obtained only after the Zenodo integration mints it. Any draft badge
or citation snippet must use `<DOI_PLACEHOLDER>` until then.

---

## 6. P1 — Discovery / research landing page: GitHub Pages

### 6.1 Platform choice

**GitHub Pages** is the preferred initial landing-page platform — co-located
with the repository, zero additional hosting, version-controlled. This plan
records the intent; it does not design or deploy the page.

### 6.2 Size constraint

The page should be **intentionally small**. It must not duplicate the entire
repository, replicate every report, or become a second source of claims. Its
job is **discovery and orientation**: a newcomer lands, understands the
question, the result, the boundary, and where to read further.

### 6.3 Recommended information architecture

#### Hero

**Video Annotation Interoperability Lab**

One-sentence research statement, e.g.: "A reproducibility lab testing whether
W3C Web Annotation + Media Fragments + IIIF Presentation + SVG can express
portable, temporal, graphical video annotations without a new vocabulary —
and where that stack becomes predictable, interoperable, and checkable."

#### Research question

The operational question from the capstone (`research/capstone.md` §1):

> Under which conditions does the geometry of graphical content painted onto
> IIIF Presentation Canvases become predictable, interoperable, and
> mechanically checkable?

#### Result

A concise statement of the conditional result (capstone §1, §9):

> A constrained profile can make **static graphical overlays** on IIIF video
> Canvases mechanically predictable when explicit coordinate systems (explicit
> `viewBox`) and same-aspect composition are enforced — and those conditions
> are checkable. The broader goal of interoperable animated/temporal
> annotations remains outside the guaranteed profile because real consumers do
> not consistently honor the required temporal/compositional semantics
> (version-scoped).

#### Key findings (4–6 items)

* **Explicit `viewBox` restores determinism** — with it, all region-painting
  mechanisms agree with `I-REGION-VIEWPORT`; without it, three coexisting
  readings appear (`research/e15-report.md`, `research/profile-draft.md` R-S1).
* **62/62 cross-engine replication** — the geometry matrix reproduced
  unanimously in Chromium 151.0.7922.34 / Firefox 153.0 / WebKit 26.5
  (`research/e17-report.md`, `evidence/e17/cross-engine-matrix.json`) —
  version-scoped `[BROWSER]` facts, not normative promotion.
* **No-`viewBox` hazard is engine-uniform** — no engine choice rescues it
  (E17 F2/F3).
* **Same-aspect safe subset** — requiring `Tw·Hb == Th·Wb` (R-S4/P5a) makes
  every reasonable fit interpretation coincide mathematically; mismatch
  diverges up to ~386 Canvas units (`research/n4-safe-subset.md`,
  `evidence/e16/landmark-spot-check.json`).
* **Consumer limitations (version-scoped)** — Ramp 5.1.1: error boundary on
  any secondary painting body (V4–V7), `NOT-HONORED` for `#t=10,20` via its
  own Video.js surface (D1); Mirador 3.4.3: silent drop (M2/M3), temporal
  probe unreachable (`research/viewer-interop-report.md`,
  `evidence/viewer-interaction/viewer-interaction-matrix.json`).
* **Mechanical resource-side validation** — eight static checks implemented,
  15/15 fixtures passing (`research/n6-implementation-report.md`,
  `evidence/n6/`); consumer-side certification blocked pending a capable
  consumer.

#### Interoperability boundary

Clearly distinguish:

* **Established** — resource-side geometry inside the safe subset (R-S1,
  R-S3, R-S4/P5a, R-S5, R-S6a/b, R-S8a; R-S7 boundary);
* **Profile constraints** — deliberate `[PROFILE]` rules adopted on top of
  standards (explicit `viewBox`, region-as-viewport, same-aspect);
* **Browser evidence** — 62/62 tri-engine facts (`[BROWSER]`, version-scoped);
* **Consumer observations** — Ramp/Mirador version-scoped `[CONSUMER]` /
  `[VIEWER_GAP]` / `[OPEN]` / `[UNKNOWN]` rows;
* **OPEN / fenced areas** — temporal honoring (R-S8b), z-order, fit
  algorithms, two-stage composition, mismatched aspects — honestly excluded,
  not silently omitted.

Do not turn `OPEN`/`EXCLUDED` into requirements.

#### Method (brief)

* Independent renderers: `src/reference/`, `src/blind/`,
  `src/native/` — methodological blinding forbids sharing semantic resolution
  logic; `src/comparison/` is analysis-only (`AGENTS.md`).
* Embedding-semantics matrix: E15 (176 cells, pixel-mask classifier).
* Nested composition: E16 (Canvas-into-Canvas, fit divergence measured).
* Cross-engine replication: E17 (62/62 tri-engine).
* Safe-subset analysis: N4 (`research/n4-safe-subset.md`).
* Real-consumer survey: N2 (`research/viewer-interop-report.md`).
* Interaction-level temporal probe: D1 (Ramp `NOT-HONORED`,
  Mirador `INCONCLUSIVE` — `evidence/viewer-interaction/`).
* Evidence discipline: `research/evidence-policy.md` (P-1 archived result
  set, P-3 protocol-authorized regeneration).

#### AI-assisted methodology (short link/section)

A short section noting that AI systems were used as **research-assistance
tools under human direction and repository-level verification** — see §7.
Link to the dedicated methodology note once written; do not duplicate it
here.

#### Reproducibility

Link to repository instructions (`README.md` quick start), note network
requirements for viewer probes and validator POST, and point to
`research/evidence-policy.md` for evidence handling.

#### Artifacts

Links to (placeholders where not yet minted):

* repository (`<REPO_URL>`);
* capstone (`research/capstone.md`);
* profile (`research/profile-draft.md`);
* validator (`src/validator/`);
* evidence (`evidence/`);
* release (`<REPO_URL>/releases/tag/v1.0.0`);
* DOI (`<DOI_PLACEHOLDER>` once available).

#### Status

Clearly state that the **research phase is complete**; the capstone is
canonical; this site is a discovery surface, not a new research venue.

### 6.4 Non-goal

Do not design, theme, or deploy the page now. This document only records
the plan and information architecture. Design, copy-editing, and deployment
are separate tasks that follow the release and DOI.

---

## 7. P2 — AI-assisted research methodology: document the workflow

This is an important methodological artifact and **must not be omitted**.
The research evolved from an initially informal/exploratory workflow into a
governed, reproducible research repository. The eventual documentation must
explain the role of AI without overstating autonomy or authorship.

### 7.1 Actual workflow (conceptual)

```text
Human research objective
        ↓
ChatGPT Web (Free)
        ↓
planning / decomposition / critique / next-step recommendations
        ↓
human transfers task into external coding/research agent
        ↓
OpenCode Zen + available external models
        ↓
agent has repository + local filesystem access
        ↓
implementation / inspection / experiments / evidence generation
        ↓
agent produces completion report
        ↓
human returns report/context to ChatGPT
        ↓
analysis / audit / interpretation / next-step planning
        ↓
next controlled task
```

### 7.2 Role distinctions

#### ChatGPT Web

Used primarily for:

* research planning and decomposition;
* architectural reasoning and methodological critique;
* interpreting agent completion reports;
* identifying risks, inconsistencies, and scope drift;
* deciding next steps;
* generating precise execution prompts for the external agent.

It did **not** have direct repository or filesystem access in this workflow.

#### External OpenCode agents

Used for:

* repository and filesystem inspection;
* implementation (code, fixtures, validators, renderers);
* running experiments and browser probes;
* executing tests and generating evidence;
* mechanical verification (`pnpm run check`, `pnpm test`, `pnpm run build`);
* producing completion reports that the human could return to ChatGPT.

The exact model could vary over time and **must not** be hard-coded as a
permanent methodological dependency. Record the capability (external agent
with repo access), not a single model name as a fixed requirement.

#### Human

The document must explicitly identify the **human as the responsible research
operator** — the person who:

* defined objectives and research questions;
* approved scope and authorized each step;
* executed/forwarded tasks between ChatGPT and the external agent;
* decided whether results were accepted, rejected, or needed revision;
* maintained repository governance and evidence discipline;
* prevented unsupported claims (promotion of browser facts to normative law,
  generalization beyond version scope, invention of fit algorithms);
* decided when the research was complete (capstone).

### 7.3 Framing

Do not describe the workflow as "AI conducted the research." Prefer:

> AI-assisted research workflow

or

> human-directed, AI-assisted research and repository workflow.

AI systems were **tools operated under human direction**; the human retained
decision authority and the repository's verification mechanisms (tests,
evidence, cross-engine replication, validator) retained epistemic authority.

### 7.4 Where the methodology note lives

The eventual note should be a short, durable document (e.g.,
`research/ai-assisted-methodology.md` or a section of the landing page's
methodology note — exact filename to be decided) that records §§7.1–7.3 plus
§8 below. It must not become a backdoor for changing research conclusions.

---

## 8. AI provenance requirements

The eventual methodology documentation should distinguish four categories:

### 8.1 AI-generated planning

Prompts, task decompositions, recommendations, critiques, and next-step
proposals produced via ChatGPT Web. These shaped **what was attempted and in
what order**, not what was true.

### 8.2 AI-assisted implementation

Code, documentation, fixture generation, and evidence-producing work performed
by external OpenCode agents with repository access. These produced **artifacts
and measurements**, not claims.

### 8.3 Human-controlled decisions

Research questions, scope boundaries, acceptance/rejection of findings,
governance rules, terminology, requirement provenance (`[NORMATIVE]` /
`[BROWSER]` / `[COMMUNITY]` / `[DERIVED]` / `[PROFILE]` / `[OPEN]`), and the
final determination that the research arc was complete. The human is the
accountable author of these decisions.

### 8.4 Machine-verifiable results

Tests, matrices, evidence artifacts, validator output, browser runs, and
cross-engine comparisons. These are **reproducible observations** that do not
depend on which assistant phrased the task.

### 8.5 Central methodological principle

> **AI assistance does not substitute for evidence.**

The capstone's evidence discipline (`research/evidence-policy.md`,
`research/consolidation-map.md` §2 N6 edit flow) remains authoritative.
Planning assistance, implementation assistance, and human decisions are
meaningful only insofar as they are backed by traceable evidence. Do not
introduce a new research taxonomy unless necessary; use the taxonomies
defined in `research/documentation-conventions.md` and
`research/profile-draft.md` Part 3.

---

## 9. P2 — Technical outreach: publish a technical article/post

### 9.1 Objective

Discovery and communication, not self-promotion. The article translates the
research for a practitioner audience and drives readers to the canonical
artifacts.

### 9.2 Working title

> What 62 Cross-Browser Geometry Tests Taught Me About IIIF Video
> Annotations

Alternative titles may be considered later; this title is a placeholder for
planning, not a commitment.

### 9.3 Intended narrative

The article should:

* begin with the interoperability problem — why painting graphical
  annotations over IIIF video Canvases is harder than it looks;
* explain the surprising geometry issue — the same SVG body resolves to
  three different Canvas geometries without an explicit `viewBox`;
* introduce the 62/62 tri-engine result and why it matters (and why it does
  not become standards law);
* explain the no-`viewBox` hazard and the explicit-`viewBox` fix (R-S1);
* explain the same-aspect safe subset and the ~386-unit divergence it avoids
  (R-S4/P5a);
* explain why real consumers changed the conclusion — Ramp 5.1.1 crash /
  `NOT-HONORED`, Mirador 3.4.3 silent drop / unreachable (version-scoped);
* link to the research repository, capstone, profile, validator, and
  evidence;
* invite community discussion on the fit-rule and viewer-gap findings.

### 9.4 Non-goals now

Do not write the article now. Do not select a publication platform yet
(personal blog, IIIF community forum, dev.to, etc. — to be decided after
the public artifact exists). Do not pre-publish excerpts that could be
mistaken for the research record.

---

## 10. P3 — Academic publication: eventually transform the research into a paper

### 10.1 Intentionally later

Academic publication is **P3** — after the stable public artifact, citation
identity, landing page, and methodological account are established. Do not
start a paper merely because the repository is public.

### 10.2 Degree status does not preclude publication

The document must state explicitly: **the absence of a completed
undergraduate/graduate degree does not automatically make the research
unsuitable for publication.** Evaluate the work on its evidence and
contribution, not on credential status.

### 10.3 No guaranteed acceptance

Do not make claims about guaranteed acceptance, review outcomes, or venue
prestige. The research must be judged by reviewers on its merits.

### 10.4 Distinguish

* having an academic degree;
* being an independent researcher;
* publishing a **technical report** (the repository + capstone already are
  one);
* publishing a **preprint** (e.g., arXiv — to be decided later);
* submitting a **conference/workshop paper**;
* submitting to a **journal**;
* participating in **standards/community discussion** (IIIF, W3C).

These are distinct dissemination acts with distinct expectations and review
processes. The research can first establish a public artifact and citation
identity; reframing into a paper follows.

### 10.5 The paper as reframing

The paper should be treated as a **new scholarly presentation of the
completed research**, not as permission to reopen the entire experimental
program without justification. New experiments for a paper require the same
authorization and pre-registration discipline as any post-capstone
experimental work.

### 10.6 Potential future structure

1. Abstract
2. Introduction
3. Research question
4. Related standards (IIIF Presentation 3.0, Web Annotation, Media Fragments,
   SVG 1.1, CSS Images 3)
5. Methodology (independent renderers, blinding, evidence discipline)
6. Experimental design (E15/E16/E17, N2, D1)
7. E15/E16/E17 results (determinism, hazard, cross-engine stability)
8. Safe subset (N4/P5a, R-S4)
9. Consumer interoperability findings (N2 + D1, Ramp/Mirador version-scoped)
10. Validator (N6, resource-side checks, blocked consumer certification)
11. Limitations (version scope, externally gated questions)
12. Discussion (community convergence, fit rule, z-order, temporal honoring)
13. Conclusion
14. Reproducibility / artifacts (repository, evidence, fixtures, DOI)

Structure is provisional; the actual paper outline will be decided during
paper preparation.

### 10.7 Venue selection

Potential venues must **not** be selected now without a later
literature/venue review. Venue choice depends on the paper's actual scope
(systems, multimedia, digital libraries, standards-adjacent venues) and on a
current survey of related work — to be performed at paper time.

---

## 11. Recommended execution order

```text
NOW
 │
 ├─ P0  Public-release audit  (gate G0)
 │
 ▼
P1
 ├─ GitHub public repository  (G0 → G1)
 ├─ CITATION.cff
 ├─ GitHub v1.0.0 release
 ├─ Zenodo / DOI
 └─ GitHub Pages landing page  (G2)
 │
 ▼
P2
 ├─ AI-assisted research methodology  (G3)
 └─ Technical outreach article
 │
 ▼
P3
 └─ Academic paper / preprint / workshop submission  (G4)
```

### 11.1 Sequencing principle

> Do not start P3 merely because the repository is public. First establish a
> stable public artifact, citation identity, landing page, and methodological
> account.

Each tier depends on the prior tier's gates (§12). Skipping ahead creates a
paper that cites an unstable or uncitable artifact.

---

## 12. Decision gates

### Gate G0 — Public readiness

Requires:

* P0 complete — audit performed, dispositioned, and explicitly recorded;
* no known secret / privacy / security / legal issue remains;
* `README.md` understandable to an external reader (capstone reachable,
  status unambiguous, reproducibility instructions accurate);
* `LICENSE` present (MIT);
* repository status clear (research complete, capstone canonical);
* reproducibility instructions reviewed (fresh-clone test).

Gate closes: human records "G0 passed at commit `<SHA>` on `<DATE>`."

### Gate G1 — Citation readiness

Requires:

* public repository (`<REPO_URL>` live);
* `CITATION.cff` present with decided authorship, title, license, version,
  and repository URL;
* stable release `v1.0.0` tagged;
* archival DOI minted via Zenodo (concept DOI + version DOI).

Gate closes: DOI resolves and citation snippet is verified.

### Gate G2 — Discovery readiness

Requires:

* GitHub Pages landing page deployed;
* concise research narrative (question, conditional result, key findings,
  boundary) present and accurate;
* links to canonical artifacts (repository, capstone, profile, validator,
  evidence, release, DOI) verified;
* research status clearly stated as complete.

Gate closes: external reader can land, understand the contribution, and reach
every canonical artifact in one click.

### Gate G3 — Methodology transparency

Requires:

* AI-assisted workflow documented (ChatGPT Web planning vs. external
  OpenCode agents with repo access);
* human/AI responsibilities clearly distinguished (human as responsible
  operator, AI as assistance);
* evidence remains traceable — AI assistance does not substitute for
  evidence; capstone provenance intact.

Gate closes: methodology note published and linked from the landing page.

### Gate G4 — Academic reframing

Requires:

* stable public artifact with DOI (G1);
* mature understanding of the contribution (capstone + community positioning
  + consumer reality internalized);
* literature / related-work review performed;
* venue selection based on actual scope (not assumed);
* paper draft derived from the canonical research record (no silent
  claim changes, no invented URLs/DOIs/affiliations).

Gate closes: paper/preprint submitted or ready for submission under human
authorship.

---

## 13. What this document must NOT do

This document must not:

* modify `research/capstone.md` or any frozen L0 report;
* modify evidence (`evidence/`) or regenerate fixtures;
* run experiments or change the profile (`research/profile-draft.md`);
* change the conformance matrix (`research/conformance-matrix.md`);
* change validator behavior (`src/validator/`);
* change research conclusions, verdicts, or requirement provenance;
* declare a paper accepted or publishable;
* invent an academic affiliation, ORCID, DOI, GitHub URL, or venue;
* invent authorship details not already established in `LICENSE` or
  otherwise decided by the human operator;
* add unsupported research claims or new provenance labels;
* serve as a backdoor for silently changing the former research record.

This is a **planning artifact only**. Any change to the research record
requires its own authorized edit flow (`research/consolidation-map.md` §2).

---

## 14. Governance relationship

```text
research/capstone.md
    ↓
canonical final research synthesis
    — what the research established (conditional, auditable,
      traceable to evidence; L0-adjacent, 2026-08-25)

research/current-state-index.md
    ↓
current canonical navigation/status  (L6)
    — where truth lives (pointer/index only; owning documents win)

research/research-program.md
    ↓
research program and completion state  (living roadmap, mutable)
    — what was planned, what was established, what stays open,
      Steps 0–3 COMPLETE, Step 4 optional/human decision

research/post-research-plan.md  (this document)
    ↓
post-research publication/dissemination roadmap  (forward-looking, mutable)
    — what to do with the completed research (P0 → P1 → P2 → P3,
      gates G0–G4, no new claims)
```

* `capstone.md` answers **what the research established**.
* `post-research-plan.md` answers **what to do with the completed research**.

The latter must never become a backdoor for silently changing the former.
If a future discovery requires revising a research claim, the revision is
made in the owning document through its authorized edit flow and cited
explicitly — not smuggled through this plan.

---

*End of post-research plan.*
