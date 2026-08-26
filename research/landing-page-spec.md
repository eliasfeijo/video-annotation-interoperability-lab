# Landing Page Specification — Video Annotation Interoperability Lab

**Status:** Specification for a public discovery/communication artifact (mutable spec, not a research document).
This spec owns no scientific claims. It derives entirely from the frozen research record.

**Baseline:** `c0e5fa2` (`docs: record public-release audit`) — research arc COMPLETE, G0 CLOSED.
Working tree clean at drafting. No publication, release, DOI, or deployment performed by this spec.

**Date:** 2026-08-26

**Gating:** Implements `research/post-research-plan.md` §6 / §12 Gate G2 (discovery readiness). Depends on Gate G0 (passed at `99c56ad`, recorded at `c0e5fa2`) and Gate G1 (citation readiness) per sequencing P1 → G2. Does not authorize implementation; implementation waits for explicit human authorization.

**Implementation chain (SDD):** `research/capstone.md` → `research/landing-page-spec.md` (this spec, normative for implementation) → implementation → automated verification → browser/visual inspection → human acceptance → G2. Requirement IDs (`C-*`, `UI-*`, `T-*`, `LINK-*`, `A11Y-*`, `RESP-*`) define what the implementation must satisfy; research numbers, version identifiers, evidence files and source citations provide provenance/verification context and do not automatically become UI requirements (§1.3). The page artifact and the research record are separate planes.

---

## 0. Status and scope

This is a **specification for a public discovery/communication artifact** (landing page), not a research document.

- **Purpose:** Discovery and orientation for an external reader with no prior context — what was investigated, what was established, what was not established, where the evidence is, where to continue reading.
- **Non-purpose:** Does not establish new findings, does not reinterpret the research record, does not duplicate every report, does not become a second source of claims.
- **Precedence:** Owning research documents outrank this specification. If this spec and any owning document disagree, the owning document wins and this spec must be corrected as a pointer-only edit.
- **Scope boundary:** One primary specification file (this file). No implementation, no visual design, no deployment, no publication actions are performed by this phase (P1-A/B/P1-B.1). All such actions require explicit human authorization.
- **Size constraint:** The page itself must be intentionally small (post-research-plan §6.2). Its job is orientation, not replication.
- **Implementation target vs deployment vs identity (see §9 T-02):** The *implementation artifact* is a static file(s) tracked in the repository (e.g. `index.html` at a defined location). The *GitHub Pages source/deployment* (which branch/folder Pages serves, custom domain) is a separate human decision. *Repository identity* (`<GITHUB_OWNER>`/`<REPO_NAME>`/`<REPO_URL>`/`<DEFAULT_BRANCH>`) likewise remains placeholder until decided. An implementation agent may create tracked static files but must not invent the owner/name/URL/branch or fix the Pages source; §9 T-02 encodes which choices are open and which are fixed.

### 0.1 Publication preparation analysis — P1-A (informative, derived from repository inspection at `c0e5fa2`)

This section answers the four P1-A prompts by inspecting the current tree, `research/post-research-plan.md`, `research/public-release-audit.md`, `research/capstone.md`, `research/current-state-index.md`, `research/research-program.md`, `README.md`, `LICENSE`, `package.json`, and governance files. It invents no bibliographic or hosting identity.

#### 1. What is already mechanically ready

| Item | Evidence (OBSERVED) | Ready? |
|------|---------------------|--------|
| **G0 gate closed** | `research/public-release-audit.md` records G0 PASSED at `99c56ad`, audit baseline `1dc6114` PASS WITH NON-BLOCKING FINDINGS, N1 (absolute path in `evidence/observations/exp2.json:36`) and N2 (unpkg pin Ramp 5.1.1 / Mirador 3.4.3) remediated, fresh-clone validated (`pnpm install --frozen-lockfile`, `pnpm run check`, `pnpm test` 180 tests, `pnpm run build`) | YES — mechanically ready |
| **Research arc complete / capstone canonical** | `research/capstone.md` Layer L0-adjacent 2026-08-25 with §12 evidence map; `research/current-state-index.md` points to capstone; `research/research-program.md` Steps 0–3 COMPLETE, Step 4 OPTIONAL | YES |
| **License** | `LICENSE` MIT, copyright `2026 Elias Feijó de Almeida Pereira Lima` | YES |
| **Reproducibility instructions** | `README.md` quick start + `research/capstone.md` §10 + `research/fixture-provenance.json` + scripts `generate-video.mjs` / `build-fixtures.mjs` + `pnpm` scripts | YES (network caveats documented) |
| **Validator** | `src/validator/` (historical `src/n6/`) with 8 resource-side checks, 15/15 `evidence/n6/` | YES |
| **Profile / conformance model** | `research/profile-draft.md` R-S1…R-S8b, X1–X8 with taxonomy Part 3; `research/conformance-matrix.md` T01–T15 | YES |
| **Evidence families** | `evidence/{e15,e16,e17,viewer,viewer-interaction,n6,screenshots,observations,blind-comparison}` per `research/evidence-policy.md` P-1 | YES |
| **Fixtures** | `public/manifests/{exp*,e14,e15,e16,n2}/*.json`, `public/svg/`, `public/video/test-grid-1920x1080-30s.mp4` | YES |
| **Package / toolchain pinned** | `package.json` devDeps pinned (Playwright 1.62.1, Vite 8.2.1, Vitest 4.1.11, pngjs 7.0.0, TypeScript 7.0.2, Node 26 via devEngines) | YES |
| **Working tree** | `git status --short` clean, no remote, no `.env`, `.gitignore` covers `.env` | YES |
| **GitHub Pages readiness (technical)** | Static hosting viable; repo contains `index.html` harness (not the landing page) — new static artifact can deploy without build system | YES — technically trivial; authorization needed |

#### 2. What requires human decisions (OPEN — must not be invented)

Per `research/post-research-plan.md` §§3.3, 5.4, 6, 7, 10, 12 and task SDD rules:

- **GitHub owner / organization** — placeholder `<GITHUB_OWNER>`; no URL invented.
- **Repository slug and canonical URL** — placeholders `<REPO_NAME>`, `<REPO_URL>` (HTTPS), `<DEFAULT_BRANCH>` (expected `main`/`master` — confirm on publication).
- **Release URL** — derived as `<REPO_URL>/releases/tag/v1.0.0>` — placeholder until release exists.
- **Authorship and author order** for `CITATION.cff` and Zenodo deposit — OPEN.
- **Canonical title string** (lab name vs. artifact title) — OPEN.
- **Preferred citation text and abstract wording** — OPEN (one-sentence research statement exists in capstone §1 / post-research-plan §6.3 hero but preferred citation text requires decision).
- **ORCID(s) and affiliation(s)** — OPEN (absence does not block publication per §10.2; must not invent).
- **Keywords** for `CITATION.cff` — OPEN.
- **Zenodo DOI** — placeholder `<DOI_PLACEHOLDER>` / `10.5281/zenodo.<TBD>` until minted via GitHub–Zenodo webhook after `v1.0.0` (post-research-plan §5). No DOI invented.
- **Release date** for `v1.0.0` / `CITATION.cff` — actual date of `v1.0.0` tag, to be decided at tagging.
- **GitHub Pages source** (which branch/folder Pages serves: `<DEFAULT_BRANCH>` root vs `docs/` vs `gh-pages`) and custom domain — **OPEN human decision**. The implementation agent must not invent or fix this choice; it tracks static files per §9 T-02 and records the Pages source explicitly when Pages is enabled.
- **Approvals:** Gate G1 (public repo + `CITATION.cff` + `v1.0.0` + DOI resolves) and Gate G2 (landing page deployed, artifact links verified) require explicit human recorded closure per post-research-plan §12.
- **AI-assisted methodology note filename/location** — `research/ai-assisted-methodology.md` vs landing-page section (post-research-plan §7.4) — OPEN.
- **Technical article platform / venue** — OPEN (P2, not now).
- **Academic paper venue** — OPEN, requires literature review at paper time (P3, not now).

#### 3. What can proceed without those decisions

- Draft and review this **landing-page specification** (this file) — DONE in this phase, placeholders only.
- **Implementation of the landing page itself** once human authorizes it — can proceed with placeholders for `<REPO_URL>` and `<DOI_PLACEHOLDER>` (links rendered as placeholders / disabled state with explanatory text; no invented URLs).
- Repository publication to GitHub (make public, set description, confirm default branch) — mechanically ready, but requires owner/org decision (above) → blocked on human identity choice, not on spec.
- Creation of `CITATION.cff` with placeholders (`TBD`) — can be drafted now; final authorship/ORCID/DOI fields remain `TBD` until decided/minted.
- Tagging `v1.0.0` on `c0e5fa2` (or rebased equivalent) — can proceed once owner/repo exists; release notes can be drafted from capstone §1 + §9.
- Zenodo integration enablement — can be configured once repo is public; DOI minted automatically on release.
- Methodology note (`research/ai-assisted-methodology.md`) — can be drafted from post-research-plan §§7–8 (no new claims).
- All of the above remain **authorized separately** — this spec does not perform them.

#### 4. Inconsistencies between `research/post-research-plan.md` and the current repository

Inspection at `c0e5fa2` finds **no contradictions** in substance; only expected forward deltas:

- **G0 closure now recorded:** Plan §1 drafts G0 as a future gate; `research/public-release-audit.md` now records G0 PASSED at `99c56ad` / `c0e5fa2`. The plan's baseline `1dc6114` / `24afbfb` precedes the N1/N2 remediation commit `99c56ad` — this is the documented remediation delta (four files), not an inconsistency. Verdict unchanged.
- **Capstone existence:** Plan §0.2 declares `research/capstone.md` canonical; it now exists (Layer L0-adjacent 2026-08-25) and is reachable via `research/current-state-index.md` and `README.md` TL;DR — consistent.
- **P1 sequencing:** Plan §11 sequences `P0 → P1 (GitHub public → CITATION.cff → v1.0.0 → Zenodo/DOI → Pages G2) → P2 (methodology + article) → P3 (paper)`; repository state matches: P0 complete, P1 not yet started (no `CITATION.cff`, no git remote, no DOI, no Pages deployment) — consistent per audit §Explicit statements.
- **No stale navigation:** `research/current-state-index.md` (L6) correctly identifies capstone as final synthesis, profile/conformance/validator evidence families, and OPEN/blocked rows — no stale layout/count claims observed beyond the known `README.md` D9 hybrid note (consolidation-map §1.4) which is acknowledged working-state, not a contradiction.
- **No evidence churn:** `git status --short evidence` clean — matches evidence-policy P-1/P-7 expectations.
- **Terminology / layering:** Plan cites generation-numbered `src/e14`…`src/n6` paths historically; current tree uses semantic paths (`src/composition/`, `src/embedding-semantics/`, `src/nested-composition/`, `src/cross-engine/`, `src/validator/`) per G.x migration — mapping is documented in `research/current-state-index.md` source-architecture note; not an inconsistency.

No repair to `research/post-research-plan.md` is required by this phase. If a future edit is desired, it is a pointer-only correction per plan §0.3.

---

## 1. Source of truth

### 1.1 Canonical research documents (authoritative, in precedence order)

Where a factual statement matters, the owning document wins over this spec (post-research-plan §0.3, capstone §12):

1. `research/capstone.md` — **canonical final synthesis** (Layer L0-adjacent, 2026-08-25) — auditable answer to what is predictable/interoperable/checkable, under which conditions, and where guarantees stop. Every substantive claim traces to its §12 source table. **Highest precedence for research claims.**
2. `research/profile-draft.md` — normative profile requirements R-S1…R-S8b, exclusions X1–X8, terminology Part 2, taxonomy Part 3 (including promotion rules).
3. `research/conformance-matrix.md` — requirement matrix + pre-registered test suite T01–T15 / RF01–RF04.
4. `research/n6-implementation-report.md` — validator implementation state, 8 static checks, 15/15 `evidence/n6/`, blocked consumer certification, AMB-N6-1 resolution.
5. `research/e15-report.md`, `research/e16-report.md`, `research/e17-report.md`, `research/e15-e16-final-report.md` — experiment records (L0 frozen).
6. `research/viewer-interop-report.md` + `evidence/viewer-matrix.json` + `evidence/viewer-interaction/viewer-interaction-matrix.json` + `research/experiment-log.md#18` (D1) — consumer observations (version-scoped).
7. `research/n4-safe-subset.md` — safe-subset decision P5a / R-S4 derivation, quantified divergence Δ386.4 / Δ405, worked examples.
8. `research/community-positioning.md` + `research/n3-source-index.json` — external-source claims, P1–P6 rank table, recipe contradictions.
9. `research/compatibility-matrix.md` — capability status S/G/B rows (L1, including SUPERSEDED markers as data).
10. `research/evidence-policy.md`, `research/consolidation-map.md`, `research/documentation-conventions.md`, `research/terminology-specification.md` — governance, preservation, vocabulary.
11. `research/research-program.md` + `research/current-state-index.md` (L6) — navigation only; owning documents win.

### 1.2 Precedence rule

```
capstone §12 source row  >  owning report/matrix/profile (L0–L5)
        >  current-state-index / research-program (navigation, L6)
        >  post-research-plan (forward planning)
        >  this landing-page spec (communication artifact)
```

This landing-page specification **MUST NOT** modify, supersede, reinterpret, or reword the capstone where a factual statement matters. Verbatim or close-paraphrase with citation is required for load-bearing claims.

### 1.3 Requirements vs evidence vs provenance (SDD minimal distinction)

For this spec as the **normative implementation specification** (no second spec):

- **Requirement IDs** (`C-*`, `UI-*`, `T-*`, `LINK-*`, `A11Y-*`, `RESP-*` in §11) are the *only* normative shall-statements for the implementation. Verification in §12 tests exactly these IDs.
- **Research numbers, observations, version identifiers, fixture names, evidence files, and source references** (e.g. `62/62`, `Δ386.4`, `R-S1`, `V4–V7`, `evidence/e17/cross-engine-matrix.json`) are *provenance/verification context* cited per §4 trace rows. They justify and constrain wording (MUST-01…07) but do not automatically become UI requirements and must not be rendered as new product claims.
- No new provenance taxonomy is introduced; the four existing taxonomies (`documentation-conventions.md` Part II) remain authoritative.

---

## 2. Audience

### 2.1 Primary audience — external technically competent reader with no prior context

A IIIF implementer, multimedia/digital-library practitioner, or standards-adjacent researcher who:

- understands manifests, Canvases, and Annotations at a practitioner level;
- has not read any prior lab report;
- needs to decide in ≤ 2 minutes whether this repository is relevant, what it proved, and where to verify.

### 2.2 Secondary audiences

- **Repository visitor / reproducer** — wants to clone, run `pnpm install / test / build`, inspect `evidence/`, validate a manifest with `src/validator/`.
- **IIIF / W3C community participant** — wants the fit-rule question, z-order contradiction, and validator existence as community inputs.
- **Funder / reviewer / independent reader** — wants the conditional result, the falsifiable method, and the persistent citation (DOI).
- **Student / newcomer** — wants the operational question and the boundary in plain language.

### 2.3 Audience constraints on the page

- No assumption that the reader knows Renderer A / Blind renderer / Native renderer internals, the E15/E16/E17 numbering, or the `[PROFILE]` taxonomy — those terms must be introduced or glossed on first use, with a link to the owning document.
- No assumption that the reader knows the repository layout — every major artifact must be one click away (see §10).
- English is the default language; no localization is required for v1.

---

## 3. Research-fidelity requirements

These are **MUST / MUST NOT** requirements preventing miscommunication. Each is traceable to `research/capstone.md` and its governance.

### 3.1 MUST

- **MUST-01 — Conditional result (bounded "interoperable"):** State the result as conditional, not universal: predictable geometry requires explicit `viewBox` (R-S1) and same-aspect composition (R-S4/P5a) and the listed exclusions; broader animated/temporal interoperability remains outside the guaranteed profile. The word "interoperable" must be bound to the constrained profile / resource-side geometry conditions actually established (capstone §6, R-S1/R-S4), never as an unqualified "works across arbitrary real-world IIIF viewers." The page must simultaneously state the consumer limitation (Ramp/Mirador failures version-scoped) and that consumer-side certification is `BLOCKED` (n6-implementation-report §5). Source: capstone §1, §9, §11, §6.
- **MUST-02 — Version scope:** Quote engine/consumer versions with every empirical claim: Chromium 151.0.7922.34 / Firefox 153.0 / WebKit 26.5 via Playwright 1.62.1 (Windows) for 62/62; Ramp 5.1.1 / Mirador 3.4.3 for viewer gaps; Node/Pnpm/Vite/Vitest versions for reproducibility. Source: capstone §6 table, §10.
- **MUST-03 — Boundary honesty:** Include the interoperability boundary section distinguishing **Established (resource-side)** vs **Profile constraints [PROFILE]** vs **Browser observations [BROWSER]** vs **Consumer observations [CONSUMER]/[VIEWER_GAP]** vs **OPEN / EXCLUDED** areas. Source: capstone §6, profile-draft Part 3, conformance-matrix Part A.
- **MUST-04 — Traceability:** Every major research statement must cite its owning source (report § or profile rule) and, where evidence exists, the evidence family (`evidence/e17/cross-engine-matrix.json`, `evidence/e16/landmark-spot-check.json`, etc.). Source: capstone §12 map.
- **MUST-05 — OPEN fences preserved:** Temporal honoring (R-S8b), z-order, fit algorithms, two-stage composition, mismatched aspects must be shown as **OPEN / EXCLUDED / BLOCKED**, not as requirements. Text must state that R-S8b has no predicate (capstone §5.6, §6, profile-draft R-S8b `[OPEN]` Predicate:None). Source: capstone §8, profile-draft R-S8b / X1–X8.
- **MUST-06 — Reproducibility disclosure:** Disclose network requirements (unpkg for Ramp/Mirador, `presentation-validator.iiif.io` POST) and pinned vs floating dependencies. Source: post-research-plan §2.1, capstone §10.

### 3.2 MUST NOT

- **MUST NOT-01 — No normative overclaiming:** Do not present `[PROFILE]` rules (R-S1 explicit `viewBox`, R-S4 same-aspect, etc.) as IIIF/W3C normative requirements. They are profile decisions on top of `[NORMATIVE]` primitives (SVG 1.1 §7.7–7.12, CSS Images 3 §4.5, IIIF 3.0 §3.2/§5.3/§5.7, MF REC). Source: profile-draft Part 3 promotion rule; capstone §3.
- **MUST NOT-02 — No promotion of [BROWSER] facts:** Do not promote 62/62 tri-engine unanimity or any `[BROWSER]` measurement into standards law. Label it explicitly as version-scoped browser behavior; cite E17 as `[BROWSER]` not `[NORMATIVE]`. Source: e17-report.md headline rule, capstone §5.2 scope guard, documentation-conventions taxonomy C.
- **MUST NOT-03 — No omission of important boundaries:** Do not omit any row of capstone §6's boundary table; do not omit that consumer-side certification is `BLOCKED` (no capable consumer) and validator guarantees only resource-side structure (n6-implementation-report §5). Source: capstone §6, conformance-matrix status columns.
- **MUST NOT-04 — No implied consumer interoperability:** Do not imply that interoperable rendering through Ramp/Mirador was established. State their failures (Ramp error boundary `Cannot set properties of undefined (setting 'id')` on any secondary Image body V4–V7; Mirador silent drop M2/M3) and the D1 temporal observation (Ramp NOT-HONORED for `#t=10,20` Canvas-target via Video.js UI, delta 0.01, 4 valid drives; Mirador INCONCLUSIVE/unreachable) as version-scoped `[CONSUMER]` rows. Source: capstone §5.5, viewer-interop-report.
- **MUST NOT-05 — No universalization of version-scoped findings:** Do not present any engine or viewer finding as "all browsers" / "all viewers" / eternally version-proof. Source: capstone §10 Limitations.
- **MUST NOT-06 — No invented terminology or conclusions:** Do not mint new labels beyond the four taxonomies (documentation-conventions Part II). Do not claim a new standard/protocol/normative authority, a fit algorithm, a z-order guarantee, or general temporal honoring. Source: documentation-conventions zero-new-labels, profile-draft Parts 9–10, capstone §8.
- **MUST NOT-07 — No silent reinterpretation of the capstone:** Do not strengthen framing beyond capstone §9 ("Justified, with one refinement: add version/case scope"); do not change verdict B or any frozen L0 verdict. Source: capstone §9, consolidation-map L0 frozen.

---

## 4. Content requirements

Each item below is **REQUIRED** on the landing page. Each carries its owning source. Verbatim-preferred phrasing is noted where the capstone provides it.

### 4.1 Research question

Display the operational question (capstone §1, research-program §1):

> Under which conditions does the geometry of graphical content painted onto IIIF Presentation Canvases become predictable, interoperable, and mechanically checkable?

Motivation gloss (≤ 2 sentences): using W3C Web Annotation + Media Fragments + IIIF Presentation 3.0 Canvas/Painting + SVG without a new vocabulary (capstone §1 ¶2, §2, documentation-conventions §T-5 framing).

Trace: `research/capstone.md:§1` → `research/research-program.md:19-22`.

### 4.2 Conditional result

Concise conditional statement (capstone §1 "What was established" + §9 direct answer + §11 conclusion), refined with version scope per capstone §9 final paragraph:

> A constrained profile can make static graphical overlays on IIIF video Canvases mechanically predictable when explicit coordinate systems (explicit `viewBox`) and same-aspect composition are enforced — and those conditions are checkable. The broader goal of interoperable animated/temporal annotations remains outside the guaranteed profile because real consumers do not consistently honor the required temporal/compositional semantics — for the tested Canvases/bodies/engines/consumers/versions (`#t=10,20` Canvas-target, Ramp 5.1.1 vs Mirador 3.4.3, Chromium 151 / Firefox 153 / WebKit 26.5).

Trace: `research/capstone.md:§1,§9,§11` → `research/profile-draft.md:R-S1,R-S4` → `research/n4-safe-subset.md`.

### 4.3 Major findings (4–6 items, exactly the capstone's audited list)

1. **Explicit `viewBox` restores determinism** — with `viewBox` all region-painting mechanisms agree with `I-REGION-VIEWPORT` (40 viewBox cells E15; confirmed 62/62 tri-engine E17 F1); without it three coexisting readings appear (`I-REGION-VIEWPORT` vs `I-INTRINSIC-STRETCH` vs object-fit semantics), engine-uniform (E17 F2/F3). Trace: `research/e15-report.md:§4` + `research/e17-report.md:F1-F3` + `research/profile-draft.md:R-S1 [PROFILE]`.
2. **62/62 cross-engine replication** — geometry matrix unanimous in Chromium 151.0.7922.34 / Firefox 153.0 / WebKit 26.5 via Playwright 1.62.1 (Windows). Version-scoped `[BROWSER]` facts, not normative promotion. Trace: `research/e17-report.md:20-31` + `evidence/e17/cross-engine-matrix.json`.
3. **No-`viewBox` hazard is engine-uniform** — no engine choice rescues it (E17 F2/F3); intrinsic size (`naturalWidth` 1000×1000 vs Chromium 267×150 for viewBox-only per e15 §4.3 / e17 F3) is not a coordinate contract — therefore R-S1 rejects viewBox-less bodies, R-S7 excludes reliance on intrinsic dims. Trace: `research/e15-report.md:§4.3` + `research/e17-report.md:F3`.
4. **Same-aspect safe subset** — `Tw·Hb == Th·Wb` (painted) / `W'·H == H'·W` (replacement) makes every reasonable fit interpretation coincide (fill, contain/meet, slice all yield `k = Tw/Wb = Th/Hb`, zero offsets/crops); mismatch diverges up to ~386 Canvas units (`evidence/e16/landmark-spot-check.json`) / ~405 synthetic (`profile-draft.md` Part 14 Example B); twin rows coincide with `twinMatchesFill && twinMatchesContain`. Trace: `research/n4-safe-subset.md:Part2 P5a` → `research/profile-draft.md:R-S4` + `research/e17-report.md:F6`.
5. **Consumer limitations (version-scoped)** — Ramp 5.1.1 error boundary on any secondary painting body (V4–V7) `Cannot set properties of undefined (setting 'id')`; Mirador 3.4.3 silent drop (M2/M3 zero overlay elements); D1 interaction probe Ramp `NOT-HONORED` for `#t=10,20` via its own Video.js surface (4 valid drives, settled 2.65/2.64 vs control 2.63/2.64 delta 0.01, `hasMediaFragmentInSrc:false`) / Mirador `INCONCLUSIVE` (no consumer-owned AV playback control, native `controls:true` only). Trace: `research/viewer-interop-report.md` + `evidence/viewer-interaction/viewer-interaction-matrix.json` + `research/experiment-log.md#18`.
6. **Mechanical resource-side validation** — eight static checks (R-S1, R-S3, R-S4, R-S5, R-S6a, R-S6b, R-S7 resource side, R-S8a permission), 15/15 fixtures passing `evidence/n6/`, `src/validator/`; consumer-side certification blocked pending a capable consumer. Trace: `research/n6-implementation-report.md` + `evidence/n6/` + `research/conformance-matrix.md`.

Each finding must show its version scope inline where applicable.

### 4.4 Interoperability boundary

Render capstone §6 as a first-class section (not a footnote), distinguishing the five classes from §3. Use a table or card grid with at minimum the rows: SVG coordinate system (R-S1), Region-as-viewport (R-S2), Canvas dimensions (R-S3), Composition aspect (R-S4/P5a), Coordinate mapping (R-S5), Fragment syntax (R-S6a/b), Temporal permission (R-S8a), Temporal honoring (R-S8b OPEN fence), Exclusions (R-S7/X1–X8), Browser behavior, Consumer behavior, Conformance state. For each: condition, evidence pointer, status (`IN FORCE` / `BLOCKED` / `OPEN fence` / `EXCLUDED` / `[BROWSER]` / `[CONSUMER]`), what is NOT guaranteed. Include the explicit sentence: **Do not turn `OPEN`/`EXCLUDED` into requirements.**

Trace: `research/capstone.md:§6` → `research/profile-draft.md:Parts 4,7-11` → `research/conformance-matrix.md:Part A`.

### 4.5 Methodology (brief, falsifiable)

State: independent renderers `src/reference/` (Renderer A, two entry points `iiif.ts`/`e14.ts` sharing parsing core), `src/blind/` (independent, interpretation-packet-driven), `src/native/` (`<img>` pipeline); methodological blinding forbids sharing semantic resolution logic, `src/comparison/` is analysis-only (`AGENTS.md`, `research/consolidation-map.md` §1.4); embedding-semantics matrix E15 (176 cells, pixel-mask coverage≥0.8 K=0.25); nested composition E16 (8 fixtures × {fill,contain} + Mode A twins); cross-engine E17 (62/62 tri-engine via `playwright.e17.config.ts`); safe-subset N4 (P5a); consumer survey N2; interaction probe D1 (consumer-owned stimulus only — `click(.vjs-big-play-button)`, no `video.play()`/`currentTime=` writes); evidence discipline `research/evidence-policy.md` (P-1 archived result sets). Link each to its report.

Trace: `research/capstone.md:§4` + governance files above.

### 4.6 AI-assisted methodology (short link/section)

One short section or card stating: AI systems were used as **research-assistance tools under human direction and repository-level verification**; ChatGPT Web (free) for planning/decomposition/critique/next-step prompts (no repo access) vs external OpenCode agents with repo/filesystem access for inspection/implementation/experiments/evidence/verification; human as responsible operator (objectives, scope, accept/reject, governance, completion); AI does not substitute for evidence; evidence remains traceable per `research/evidence-policy.md`. 

Dependency: the *short disclosure* in this card is required for G2. The *detailed methodology note* `research/ai-assisted-methodology.md` is a distinct P2/G3 artifact (post-research-plan §§7–8) and **is not required for G2**; if not yet created, the page must render the link as placeholder `TBD — detailed note forthcoming (P2/G3)` and remain G2-eligible without it. Do not block G2 on the later detailed note, and do not create the note in this task. Exact link when live: `<REPO_URL>/blob/<DEFAULT_BRANCH>/research/ai-assisted-methodology.md`; until then placeholder.

Trace: `research/post-research-plan.md:§§7–8`.

### 4.7 Evidence

List evidence families with counts and provenance, not as a directory dump:

- `evidence/e15/` + `evidence/e16/` (geometry + composition) — `research/e15-report.md`, `research/e16-report.md`.
- `evidence/e17/{summary,cross-engine-matrix,intrinsics-*,case-*}.json` (62/62) — `research/e17-report.md`.
- `evidence/viewer-matrix.json` + `evidence/viewer/probe-*.json` (N2) — `research/viewer-interop-report.md`.
- `evidence/viewer-interaction/viewer-interaction-matrix.json` + `probe-ramp-d1-*.json` + `probe-mirador-d1-temporal-feasibility.json` (D1) — `research/experiment-log.md#18`.
- `evidence/n6/{summary,conformance-matrix,case-T*.json}` (15/15) — `research/n6-implementation-report.md`, `src/validator/`.
- `evidence/screenshots/{e15,e16,e17,n2,viewer-interaction}/` + `evidence/observations/` + `evidence/blind-comparison/` (exp-era).

Add the sentence: tracked `evidence/` is the **archived result set** backing L0 reports (P-1), not a rebuildable cache (P-2); regeneration is protocol-authorized only (P-3).

Trace: `research/evidence-policy.md` + `research/fixture-provenance.json` + capstone §10.

### 4.8 Reproducibility

Link to `README.md` quick start and state the command chain with versions:

```
pnpm install → pnpm exec playwright install chromium firefox webkit → pnpm gen:video → pnpm gen:fixtures → pnpm test (180 tests at capstone) → pnpm exec playwright test --config=playwright.e17.config.ts (E17) → pnpm exec playwright test --config=playwright.consumer-probe.config.ts (N2+D1, evidence/viewer-interaction/) → node scripts/run-n6-suite.mjs (N6)
```

Note: network required for viewer probes and validator POST; browser suites will dirty `evidence/` per P-7 — do not run routinely (governance note). Link to `research/evidence-policy.md`.

Trace: `research/capstone.md:§10` + `README.md` + `research/public-release-audit.md` fresh-clone review.

### 4.9 Artifacts

Link gallery (one line each, placeholders where minted later):

- Repository — `<REPO_URL>` placeholder until publication.
- Capstone — `research/capstone.md` (relative link + absolute `<REPO_URL>/blob/<DEFAULT_BRANCH>/research/capstone.md>` once live).
- Profile — `research/profile-draft.md`.
- Validator — `src/validator/` (with `evidence/n6/`).
- Evidence — `evidence/` (with `research/evidence-policy.md` + `research/fixture-provenance.json`).
- Release — `<REPO_URL>/releases/tag/v1.0.0>` placeholder until `v1.0.0` tagged.
- DOI — `<DOI_PLACEHOLDER>` / `10.5281/zenodo.<TBD>` placeholder until minted; show as disabled/badge TBD with explanatory text, not a broken link.

Trace: `research/post-research-plan.md:§6.3 Artifacts` + capstone §12.

### 4.10 Current status

State plainly: **research phase is complete**; `research/capstone.md` is canonical final synthesis; this site is a **discovery surface, not a new research venue**; Steps 0–3 COMPLETE per `research/research-program.md`, Step 4 (externalization) OPTIONAL/human decision only. Include last audited commit `c0e5fa2` and G0 PASSED date 2026-08-25, link to `research/public-release-audit.md` and `research/current-state-index.md`.

Trace: `research/capstone.md:§§1,11` + `research/research-program.md:§§2,5` + `research/public-release-audit.md` + `research/post-research-plan.md:§12 Gates`.

---

## 5. Information architecture

Required page sections in order, with intended purpose. Do not prescribe visual styling beyond functional clarity.

| # | Section ID | Heading (proposed) | Purpose | Source |
|---|------------|---------------------|---------|--------|
| 1 | `hero` | Video Annotation Interoperability Lab | Identity + one-sentence research statement (caption under title). Must contain the lab's one-sentence statement per post-research-plan §6.3 Hero. | post-research-plan §6.3 Hero; capstone §1 ¶2 |
| 2 | `question` | Research question | Operational question verbatim + short motivation gloss. Answers "what was investigated?" | capstone §1-§2 |
| 3 | `result` | Result (conditional) | Conditional result statement with version-scope refinement (capstone §9). Answers "what was established?" — no universal claim. | capstone §1, §9, §11 |
| 4 | `findings` | Key findings | 4–6 audited findings with version scope and source citations + evidence pointers. | capstone §5; post-research-plan §6.3 |
| 5 | `boundary` | Interoperability boundary | Five-class boundary table/cards (Established / Profile / Browser / Consumer / OPEN). Prevents omission/overclaiming. Answers "what was not established?" | capstone §6, profile-draft Part 3 |
| 6 | `method` | Method | Falsifiable method summary: independent renderers + blinding + E15/E16/E17/N2/D1/N4/N6 + evidence discipline. | capstone §4 |
| 7 | `ai-method` | AI-assisted methodology | Short disclosure + link to dedicated methodology note (TBD until G3). | post-research-plan §§7–8 |
| 8 | `repro` | Reproducibility | Clone → install → video/fixtures → test → build → browser suites → validator; network/pinned notes. | capstone §10, evidence-policy |
| 9 | `artifacts` | Artifacts | Canonical links gallery: repository, capstone, profile, validator, evidence, release, DOI placeholder. | post-research-plan §6.3 |
| 10 | `status` | Status | Research complete, capstone canonical, this site is discovery only, audited commit `c0e5fa2`, G0 closed. | research-program §2; public-release-audit |
| 11 | `footer` | Footer | License (MIT), copyright holders from `LICENSE`, citation hint (`CITATION.cff` once live, DOI placeholder), last-updated commit/date. | LICENSE, CITATION.cff (future) |

Navigation requirement: a table-of-contents or anchor nav linking to each section by ID must be present at the top (or as a sticky/skip-linked nav). Every major research statement must have an inline citation or footnote link to its owning source (not only a footer dump).

Out of scope for the page: full replication of any L0 report, full fixture/evidence browser, vendored documentation, blog/article content (P2), paper/preprint (P3).

---

## 6. UX requirements

A first-time visitor must understand quickly (within two scrolls / two minutes) without reading any L0 report:

- **U-01** What was investigated (the operational question + motivation).
- **U-02** What was established (conditional: static graphical overlays predictable under explicit `viewBox` + same-aspect, checkable).
- **U-03** What was not established (temporal honoring, z-order, arbitrary-aspect fit, two-stage composition, consumer interoperability — shown as OPEN/BLOCKED, not omitted).
- **U-04** Where the evidence is (evidence families + governance + one-click links).
- **U-05** Where to continue reading (capstone → profile → conformance matrix → validator → reports, in that priority order).
- **U-06** That the research is complete and the site is not a new venue (status section).
- **U-07** That version scope limits every engine/consumer claim (visible next to each finding, not hidden in a footnote).

All of the above must be reachable without client-side JavaScript. If JavaScript is used at all, it must be progressive enhancement only.

---

## 7. Accessibility requirements

Testable baseline (WCAG 2.2 AA-aligned, no invented criteria):

- **A11Y-01 — Keyboard operation:** All interactive controls (nav links, artifact links, any disclosure widgets for boundary/finding details) are reachable and operable by keyboard alone (Tab / Shift+Tab / Enter / Space), with no keyboard trap. Verification: manual tab-through + `axe` or equivalent automated check for focusable/interactive violations.
- **A11Y-02 — Focus visibility:** Visible focus indicator on every focusable element, not removed by CSS, with sufficient contrast (≥ 3:1 against background). Verification: manual + automated focus-visible audit.
- **A11Y-03 — Semantic structure:** Single `h1` (lab title), hierarchical `h2`/`h3` per §5 sections, landmarks (`header`, `nav`, `main`, `footer`), no skipped heading levels. Tables use `caption`/`thead`/`th scope`. Verification: automated heading-order + landmark check + manual screen-reader announcement review.
- **A11Y-04 — Accessible names:** Every link has an accessible name that makes sense out of context (no bare "click here" / "read more"); icon-only controls (if any) have `aria-label`. Evidence/artifact links include the artifact kind in the name. Verification: automated link-name audit + manual.
- **A11Y-05 — Contrast / readability:** Body text ≥ 4.5:1, large text ≥ 3:1, focus/UI components ≥ 3:1; line length ≤ 80–90ch on desktop, line height ≥ 1.5, font size ≥ 16px, no justified body text. Verification: automated contrast check + manual readability review.
- **A11Y-06 — Reduced motion:** If any animation/transition is introduced, it must respect `prefers-reduced-motion: reduce` (disable or reduce to < 150ms fade). No auto-playing animation. Verification: manual with OS reduced-motion enabled.
- **A11Y-07 — No information conveyed by color alone:** Findings/boundary status distinctions (IN FORCE vs OPEN vs BLOCKED vs [BROWSER]/[CONSUMER]) must have a non-color cue (label text, icon with text alternative, or pattern). Verification: manual + automated color-contrast/usage audit.
- **A11Y-08 — Language and document title:** `html lang="en"` and a descriptive `title` that includes the lab name. Verification: automated.

---

## 8. Responsive requirements

Testable behavior for two viewport classes; no device-specific breakpoints are prescribed — implementer chooses values but must satisfy these:

- **RESP-01 — Mobile (≤ 640px):** Single-column flow; nav collapses to a disclosed toggle or in-flow anchor list (no horizontal scroll); body text wraps without overflow; tables/cards stack or scroll with a visible affordance (no clipped columns); tap targets ≥ 44×44 CSS px with ≥ 8px gap. Verification: browser manual at 360×800 and 390×844 + automated viewport-assertion test.
- **RESP-02 — Desktop (≥ 1024px):** Content centered with max-width ≤ 80–90ch for prose; multi-column layout allowed for findings/boundary cards; nav persists as horizontal or sidebar without obscuring content. Verification: manual at 1280×800 and 1440×900.
- **RESP-03 — Fluid range (640–1024px):** No layout breakage at any intermediate width (no overlapping text, no fixed-width overflow). Verification: manual drag + automated Playwright viewport sweep.
- **RESP-04 — Print/reading affordance:** Page prints without nav duplication, with visible link URLs or a printed link list. Verification: manual print preview at desktop width.
- **RESP-05 — No horizontal scroll** at any viewport ≥ 320px. Verification: automated `scrollWidth === clientWidth` assertion per viewport class.

If container queries or fluid type are used, they must not violate any A11Y requirement.

---

## 9. Technical constraints

Derived from the actual repository (keep it simple, no new hosting/bundle):

- **T-01 — Static first (HTML+CSS default):** Implementation is a static artifact whose default is **HTML + CSS only**. JavaScript is **not required** and must not be added unless a concrete acceptance criterion (e.g. an `A11Y-*`/`RESP-*` disclosure widget) cannot be met with HTML/CSS alone; if ultimately used, it must be vanilla JS with no framework, no bundler, no runtime, no CMS/backend, no analytics, no external UI dependency, remain ≤5 kB, and carry a documented requirement-level justification in the implementation PR. No JS is added by this spec. Verification: `pnpm run build` not required; page loads as plain file via `vite preview` or any static server; `package.json` diff zero.
- **T-02 — Co-location vs deployment vs identity:** The *implementation artifact* is file(s) tracked in the repository (e.g. `index.html` at the repository root or equivalent — the exact tracked path is fixed by the implementation PR and need not await Pages). The *GitHub Pages source/deployment* (which branch/folder Pages serves: `<DEFAULT_BRANCH>` root vs `docs/` vs `gh-pages`, custom domain) is a **separate OPEN human decision** (§0.1.2) and must not be invented here; until decided, the spec permits either `"/"` or `"/docs"` as the tracked location but requires the Pages source choice to be recorded explicitly when Pages is enabled. *Repository identity* (`<GITHUB_OWNER>`/`<REPO_NAME>`/`<REPO_URL>`/`<DEFAULT_BRANCH>`) likewise remains placeholder. The artifact must be version-controlled and the deployment is **GitHub Pages** only (post-research-plan §6.1); no additional hosting/CDN/server. Verification: `git log` shows page file(s) tracked; `git status --short` clean; Pages setting (when enabled) documented in `README.md`/repo settings; no invented owner/URL.
- **T-03 — No new runtime dependencies:** No npm dependency added for the page; if a CSS reset/normalize is used, vendor it as a single file with license header and verify MIT compatibility. Verification: `pnpm install` delta is zero; `package.json` unchanged.
- **T-04 — No evidence/fixture/profile/validator mutation:** The page must not regenerate fixtures, rewrite evidence, change validator behavior, or alter `research/capstone.md` / frozen L0 reports. It may link to and quote them. Verification: `git status --short evidence research/capstone.md research/profile-draft.md src/validator/` clean after page implementation.
- **T-05 — Offline-readable (page only):** The *landing page itself* renders its prose, layout and local assets without network access and must not require remote resources at load: no CDN fonts, no remote JS/CSS, no external images required for rendering, no tracking scripts. Viewer bundles (unpkg) and research artifacts are *linked destinations*, not page dependencies. "Offline-readable" does **not** mean GitHub, Zenodo, or linked research artifacts remain accessible while offline; navigating to external artifacts when offline will fail, which is expected. If a font is needed, self-host with MIT/OFL verified. Verification: load page with network disabled; all prose, headings, nav, boundary/finding cards and footer remain visible; link clicks to `<REPO_URL>`/DOI understandably fail.
- **T-06 — Relative links first:** Internal links use repository-relative paths (`research/capstone.md`, `research/profile-draft.md`, `evidence/`, `src/validator/`) so the page works both on GitHub blob view and on Pages. Absolute `<REPO_URL>` forms are shown alongside as canonical once live. Verification: link audit (automated `href` pattern check).
- **T-07 — No analytics/tracking by default:** No analytics script, cookie, or tracker is included without a separate human decision and privacy disclosure. Verification: automated script-src audit (only same-origin or none).

---

## 10. Link / artifact requirements

Canonical links the page must expose (exactly these; placeholders where not yet minted — never invent URLs):

| # | Label | Target | When live | Placeholder text until live |
|---|-------|--------|-----------|------------------------------|
| L-01 | Repository | `<REPO_URL>` | `https://github.com/<GITHUB_OWNER>/<REPO_NAME>` | `Repository — URL TBD (will be <REPO_URL>)` with `CITATION.cff` note |
| L-02 | Capstone | `research/capstone.md` (relative) + `<REPO_URL>/blob/<DEFAULT_BRANCH>/research/capstone.md>` | relative always; absolute after publication | relative link always live |
| L-03 | Profile | `research/profile-draft.md` + `<REPO_URL>/blob/<DEFAULT_BRANCH>/research/profile-draft.md>` | same as L-02 | relative link always live |
| L-04 | Validator | `src/validator/` + `evidence/n6/` | same | relative links always live |
| L-05 | Evidence | `evidence/` + `research/evidence-policy.md` + `research/fixture-provenance.json` | same | relative links always live |
| L-06 | Release | `<REPO_URL>/releases/tag/v1.0.0>` | after `v1.0.0` tagged | `Release v1.0.0 — forthcoming (tag <REPO_URL>/releases/tag/v1.0.0)` disabled with explanatory text |
| L-07 | DOI | `<DOI_PLACEHOLDER>` / `https://doi.org/10.5281/zenodo.<TBD>` | after Zenodo mints DOI (concept + version DOI) | `DOI — forthcoming (<DOI_PLACEHOLDER>); cites via <REPO_URL> until minted` with Zenodo badge placeholder, not a broken DOI link |
| L-08 | Reproducibility | `README.md` + `research/current-state-index.md` + `research/research-program.md` | always | relative links always live |
| L-09 | Audit | `research/public-release-audit.md` + `research/post-research-plan.md` | always | relative links always live |

### 10.1 Lifecycle — draft/local implementation vs G2 candidate

- **Draft / local implementation state (permitted before G2):** May use approved placeholders or visibly disabled links for `L-01` repository URL (`<REPO_URL>` / `<GITHUB_OWNER>/<REPO_NAME>`), `L-06` release URL, `L-07` DOI (`<DOI_PLACEHOLDER>`), and `L-09`/§4.6 methodology note if not yet created. Placeholders must show explanatory text (e.g. "forthcoming", "URL TBD"), must not be invent-real-URL links, and must not be hidden. Verification in this state: LINK-01/LINK-02 assert placeholders present and no invented URL; LINK-03 is waived for placeholder rows (relative links L-02…L-05/L-08/L-09 still verified).
- **G2 candidate state (required for Gate G2):** Requires actual, verified URLs for `L-01`, `L-06`, `L-07` (and the methodology note link if G3 has closed), and `LINK-03` must pass for every row (200 or file-exists). Placeholder waivers no longer apply. Final G2 criteria are **not weakened** to accommodate placeholders; the transition is a URL substitution, not a criterion relaxation.

Link UX: each link's accessible name must include the artifact kind (LINK-04). External links must not use `target="_blank"` without an accessible warning; if used, add `rel="noopener"` and an `(opens externally)` text cue.

---

## 11. Acceptance criteria

Testable criteria with stable IDs. Any implementation PR must check each.

### 11.1 Content / research-fidelity

- **C-01** Hero contains lab title and one-sentence research statement matching capstone §1 / post-research-plan §6.3 Hero (close paraphrase allowed, must cite capstone).
- **C-02** Research question section quotes the operational question verbatim (capstone §1) with motivation gloss.
- **C-03** Conditional result statement includes the version-scope refinement (capstone §9 last paragraph) and does not imply universal/consumer success.
- **C-04** Key findings section lists 4–6 audited findings with inline version scope and citations (C-04a explicit viewBox, C-04b 62/62, C-04c hazard, C-04d same-aspect, C-04e consumer limitations, C-04f validator) — each traces to §4.3 source rows.
- **C-05** Interoperability boundary section distinguishes Established / Profile / Browser / Consumer / OPEN (capstone §6); contains the sentence "Do not turn `OPEN`/`EXCLUDED` into requirements." and shows R-S8b as `Predicate:None` / `OPEN fence`.
- **C-06** No `[BROWSER]` row is presented as normative; the 62/62 row is labeled `[BROWSER] version-scoped` (MUST NOT-02).
- **C-07** No `[PROFILE]` rule is presented as IIIF/W3C normative (MUST NOT-01); profile rules are attributed as "profile decision on top of [NORMATIVE] primitives."
- **C-08** Consumer failures are stated as version-scoped observations with exact probe IDs/values (Ramp V4–V7 `Cannot set properties of undefined (setting 'id')`, Mirador M2/M3 zero overlay elements, D1 NOT-HONORED delta 0.01 / 4 valid drives, Mirador INCONCLUSIVE — `hasConsumerPlaybackControl:false`) and not generalized.
- **C-09** Methodology section states independent renderers + blinding + evidence families with links (capstone §4); states that `src/comparison/` is analysis-only.
- **C-10** Reproducibility section lists the command chain with pinned versions and discloses network requirements (unpkg + validator POST) + evidence-policy P-1/P-7 caveat.
- **C-11** Status section states research complete, capstone canonical, this site is discovery only, with audited commit `c0e5fa2` and G0 date; links to `current-state-index.md` and `public-release-audit.md`.
- **C-12** No new scientific claim, terminology label, or conclusion appears that lacks a traceable source in capstone §12 / owning report — audit per §12 matrix.

### 11.2 Information architecture / UX

- **UI-01** Page contains all §5 sections in order with the stated `id` values and a top anchor nav linking to each (`href="#hero"` etc.).
- **UI-02** A first-time visitor can answer the five U-questions (U-01…U-05) without scrolling past the status section — verified by a 5-question human walkthrough (manual).
- **UI-03** Every major research statement has an inline citation/footnote link to its owning source (capstone / profile / evidence), not only a footer dump.
- **UI-04** Artifact gallery renders all L-01…L-09 links; placeholders for L-01/L-06/L-07 are shown as disabled text with explanatory copy (no broken/invented URLs).
- **UI-05** Page loads and is fully readable with JavaScript disabled (progressive enhancement only).

### 11.3 Technical

- **T-01** Page is a static HTML+CSS artifact, no new npm dependency, no build required (validation per §9 T-01/T-03).
- **T-02** All internal links are repository-relative and resolve on both GitHub blob view and Pages (automated `href` pattern audit).
- **T-03** Page loads with network disabled with no missing prose (no CDN font/bundle at load).
- **T-04** `git status --short evidence research/capstone.md research/profile-draft.md src/validator/` remains clean after implementation.

### 11.4 Links

- **LINK-01** Every artifact in §10 appears with the exact label/target/placeholder rule (draft: placeholders permitted per §10.1; G2: actual URLs required).
- **LINK-02** No DOI/REPO URL is invented — placeholder text is used until minted (automated check: no `https://doi.org/10.5281/zenodo.` with a real suffix, no `https://github.com/` with a real owner) — applies in both lifecycle states.
- **LINK-03** Link audit: draft — `L-02…L-05`/`L-08`/`L-09` `href` returns 200/file-exists, placeholder rows (`L-01`/`L-06`/`L-07`/methodology) are verified as disabled placeholders; **G2 candidate: every `href` returns 200/file-exists, no placeholder rows remain, no 404** (§10.1).

### 11.5 Accessibility

- **A11Y-01** Keyboard-only traversal reaches every interactive element with visible focus (manual + automated focus audit).
- **A11Y-02** Heading hierarchy: one `h1`, no skipped levels, landmarks present (automated).
- **A11Y-03** Every link has a non-generic accessible name (automated).
- **A11Y-04** Text contrast ≥ 4.5:1 / large ≥ 3:1 / UI ≥ 3:1 (automated).
- **A11Y-05** No information conveyed by color alone for status badges (manual).
- **A11Y-06** With `prefers-reduced-motion: reduce`, no animation exceeds 150ms or auto-plays (manual).

### 11.6 Responsive

- **RESP-01** At 360×800 and 390×844 no horizontal scroll, single-column flow, tap targets ≥ 44px (manual + automated `scrollWidth` assertion).
- **RESP-02** At 1280×800 content max-width ≤ 90ch, no overflow, nav persists without obscuring content (manual).
- **RESP-03** No breakage at any width 320–1440 (automated sweep).
- **RESP-04** Print preview shows prose + visible link URLs / link list without nav duplication (manual).

---

## 12. Traceability matrix

Requirement ID | Requirement (short) | Source | Verification method
---|---|---|---
C-01 | Hero title + one-sentence statement | `research/capstone.md:§1` + `research/post-research-plan.md:§6.3 Hero` | **research-content audit** (wording vs source) + **human acceptance**
C-02 | Operational question verbatim | `research/capstone.md:§1` | **research-content audit** + **automated** string-match test
C-03 | Conditional result with version scope | `research/capstone.md:§§1,9,11` | **research-content audit** + **human acceptance** (no universalization)
C-04 | 4–6 audited findings with citations | `research/capstone.md:§5` → §4.3 rows | **research-content audit** (per-finding source check) + **automated** citation-presence test
C-05 | Boundary table + OPEN fence sentence + R-S8b Predicate:None | `research/capstone.md:§6` + `research/profile-draft.md:R-S8b [OPEN]` | **research-content audit** + **automated** text-presence test
C-06 | [BROWSER] not promoted | `research/e17-report.md` headline + `research/profile-draft.md:Part3` + capstone §5.2 | **research-content audit** + **human acceptance**
C-07 | [PROFILE] not normative | `research/profile-draft.md:Part3` + capstone §3 | **research-content audit**
C-08 | Consumer failures version-scoped, verbatim probe values | `research/viewer-interop-report.md` + `research/experiment-log.md#18` + `evidence/viewer-interaction/*` | **research-content audit** + **automated** probe-value match
C-09 | Method: independent renderers + blinding + families | `research/capstone.md:§4` + `research/consolidation-map.md` | **research-content audit**
C-10 | Reproducibility chain + network/pinned notes | `research/capstone.md:§10` + `research/evidence-policy.md` | **automated** command-presence test + **human acceptance**
C-11 | Status: research complete, capstone canonical, site is discovery only, G0 commit/date | `research/research-program.md:§§2,5` + `research/public-release-audit.md` | **research-content audit** + **automated** commit-string test
C-12 | No unsupported claim/label/conclusion | `research/capstone.md:§§8,12` + `research/documentation-conventions.md` zero-new-labels | **research-content audit** (load-bearing sentences vs §12 map)
UI-01 | Sections in order + anchor nav with IDs | This spec §5 | **automated** DOM structure test (`querySelectorAll('section[id]')` + nav `href` audit)
UI-02 | Five U-questions answerable in 2 minutes | This spec §6 (U-01…U-07) | **human acceptance** (5-question walkthrough, manual)
UI-03 | Inline citations per major claim | This spec §5 nav rule + §4 trace rows | **automated** citation-density test + **human acceptance**
UI-04 | Artifact gallery with placeholders | This spec §10 L-01…L-09 | **automated** link-presence/placeholder test + **browser/manual** link audit
UI-05 | Readable with JS disabled | This spec §6 last line + §9 T-01 | **browser/manual** (load with JS disabled)
T-01 | Static HTML+CSS, no new deps, no build | This spec §9 T-01/T-03 | **automated** (`package.json` diff + no build artifact required)
T-02 | Relative links for GitHub + Pages | This spec §9 T-06 | **automated** `href` pattern test
T-03 | Offline-readable (no CDN at load) | This spec §9 T-05 | **browser/manual** (network disabled load)
T-04 | No evidence/profile/validator mutation | `research/evidence-policy.md` P-1/P-3 + consolidation-map N6 flow | **automated** `git status --short evidence research/capstone.md research/profile-draft.md src/validator/` == empty
LINK-01 | Artifact links L-01…L-09 exact (draft vs G2 per §10.1) | This spec §10 + §10.1 | **automated** label/target test (draft checks placeholders, G2 checks actual URLs)
LINK-02 | No invented URLs (both states) | Post-research-plan §2.2/§5.4 + task placeholders | **automated** placeholder-pattern test
LINK-03 | No 404 — draft: relative links 200, placeholders disabled; G2: all 200 | This spec §10 + §10.1 | **automated** file-existence check + **browser/manual** 200 check on Pages (G2 strict)
A11Y-01 | Keyboard operable, no trap | WCAG 2.2.1/2.4.7 | **automated** (axe) + **browser/manual** tab-through
A11Y-02 | Heading/landmark structure | WCAG 1.3.1 | **automated** heading/landmark audit
A11Y-03 | Link accessible names | WCAG 2.4.4/4.1.2 | **automated** link-name audit
A11Y-04 | Contrast ≥ thresholds | WCAG 1.4.3/1.4.11 | **automated** contrast check
A11Y-05 | Status not color-only | WCAG 1.4.1 | **browser/manual**
A11Y-06 | Prefers-reduced-motion respected | WCAG 2.3.3 | **browser/manual** with reduced-motion pref
RESP-01 | Mobile single-column, no scroll, tap targets | This spec §8 | **automated** `scrollWidth` + tap-target audit + **browser/manual** at 360/390 widths
RESP-02 | Desktop max-width ≤ 90ch, nav persists | This spec §8 | **automated** `max-width` computed style check + **browser/manual** at 1280/1440
RESP-03 | No breakage 320–1440 | This spec §8 | **automated** viewport sweep
RESP-04 | Print preview usable | This spec §8 | **browser/manual** print preview
— | Must-not items (MUST NOT-01…07) | Capstone §3, §5.2, §8, §9, §10 + profile taxonomy | **research-content audit** (each prohibition checked line-by-line) + **human acceptance**

---

## Audit of this specification

Performed at drafting (2026-08-26) against the four required documents.

### Against `research/capstone.md`

- **Unsupported claims:** None. Every finding/boundary sentence is a close paraphrase of capstone §1/§5/§6/§9/§11 with source citation. No new empirical number is introduced beyond capstone's Δ386.4 / 62/62 / delta 0.01 — all quoted with provenance.
- **Wording stronger than capstone:** Checked. Result statement adds the capstone §9 refinement verbatim ("for the tested Canvases/bodies/engines/consumers/versions…") to avoid universalization; 62/62 is qualified as `[BROWSER] version-scoped`; consumer rows are qualified as version/case-scoped. No strengthening beyond capstone.
- **Missing boundaries:** None. §6 table covers all capstone §6 rows; R-S8b fence (Predicate:None), z-order, fit algorithms, two-stage, mismatched aspects, and BLOCKED consumer certification are all required visible (C-05/C-08/C-11). "Do not turn OPEN/EXCLUDED into requirements" is a required literal.
- **Unverifiable requirements:** None. Every C/UI/LINK/A11Y/RESP criterion names a verification method (automated / browser-manual / audit / human) and none requires a future experiment.
- **Unnecessary requirements:** Minimal. AI note (post-research-plan §7) and Pages co-location (T-02) are required by gates G2/G3; no extra framework/design system is mandated.
- **Accidentally constraining:** No. Technical constraints (T-01 static-only, T-03 no new deps) are chosen for minimality and justified by the actual repo (Vite already present but not needed for the page). Responsive breakpoints are declared as implementer-chosen with testable behavior, not fixed pixel mandates beyond the two viewport classes.
- **Contradictions with capstone:** None.

### Against `research/documentation-conventions.md`

- Terminology checks: Uses "Renderer A", "Blind renderer", "Native renderer", "Model A/B" only with axis words where needed; avoids bare "A/B". Uses "viewport" only qualified (`SVG viewport`, `region-as-viewport`, `page viewport`). Uses `conformance` vs `compatibility` vs `honoring` per T-4. No new label minted (zero-new-labels). Taxonomy classes quoted verbatim with definition sources. No combined labels.
- Immutable identifiers preserved: R-S1…R-S8b, X1–X8, S1–S8, T01–T15, RF01–RF04, probe IDs V4–V7/M2–M3, F1–F6, AMB-N6-1 are used with original spellings; SUPERSEDED markers acknowledged via compatibility-matrix.
- Framing: Uses the conservative framing from T-5 ("predictable, interoperable geometry … using existing standards vocabulary, with conventions-and-conformance … rather than new vocabulary") — no new standard/protocol claim.

### Against `research/evidence-policy.md`

- Respects P-1/P-2: evidence cited as archived result sets, not rebuildable caches; page is told not to regenerate evidence (T-04).
- Respects P-3: no regeneration authorized by this spec.
- Respects P-5/P-7: no filename mutation or deletion proposed; browser-suite hazard disclosed in reproducibility section (P-7).
- Traceability: evidence families listed with producer linkage per P-4.

### Against `research/post-research-plan.md`

- Respects §0.3 precedence (owning docs win) and §0.4 non-purpose.
- Implements §6.3 information architecture faithfully (hero → question → result → findings → boundary → method → AI note → reproducibility → artifacts → status); working title not hard-coded, hero sentence is a synthesised close paraphrase of the plan's hero example — permitted as derived, not invented.
- Uses placeholders per §§2.2, 3.3, 5.4 (§10 L-01/L-06/L-07) — no URL/DOI/ORCID/affiliation invented.
- Does not trigger Gates G0–G4; explicitly states implementation waits for human authorization (§0, §12 gates).
- P2/P3 non-goals respected: does not write the technical article or paper; AI methodology section is a short link, not a full note.
- Sequencing (§11) respected: spec is P1 work preceding Pages deployment (G2); does not start P3.
- §13 prohibitions respected: modifies no `research/capstone.md`, no frozen L0 report, no evidence, no profile/matrix, no validator, no authorship/venue invention, no unsupported claim.

### Overall audit verdict

**Spec is internally consistent, traceable to the canonical record, and introduce-no-new-claims compliant.** It will be flagged if any line is found to strengthen wording beyond capstone — correction is a pointer-only edit to weaken phrasing.

---

## Completion Report

### Files created / modified

- **Created:** `research/landing-page-spec.md` (this file) — one primary specification file, lightweight, per SDD rules.
- **Modified:** None. No research document, evidence, fixture, profile, matrix, validator, or governance file was edited.
- **Not created:** No landing page implementation, no `CITATION.cff`, no GitHub Pages artifact, no DOI badge, no methodology note, no article/paper.

### Decisions made

- Adopted the single-file spec shape (this file) over a multi-file bureaucracy (per task preference).
- Adopted static HTML+CSS, no-framework, no-new-dependency strategy (§9) — minimal hosting is GitHub Pages co-located with the repo.
- Chose informative placement of the P1-A publication-preparation analysis inside §0.1 rather than a separate file, to keep ONE primary spec file.
- Anchored all research statements to capstone §12's source table and profile taxonomy, with explicit MUST/MUST NOT guards (§3).
- Deferred all bibliographic/hosting identities to placeholders (§10) — no invention.
- Locked acceptance-criteria IDs (C-01…C-12, UI-01…05, T-01…04, LINK-01…03, A11Y-01…06, RESP-01…04) and the §12 traceability matrix with verification-method kinds.

### Decisions still requiring human input

All items listed in **§0.1.2** — at minimum: `<GITHUB_OWNER>`/`<REPO_NAME>`/`<REPO_URL>`/`<DEFAULT_BRANCH>`, authorship/order/title/citation/keywords/ORCID/affiliation for `CITATION.cff`, release date for `v1.0.0`, Zenodo DOI minting (then back-fill `CITATION.cff` + page), Pages source selection, gates G1/G2/G3 closure records, methodology-note filename, and any analytics/tracking choice. No implementation, publication, or DOI action has been performed or authorized by this spec.

### Specification summary

Spec chapters §0–§12 define: (0) artifact scope + P1-A readiness analysis, (1) canonical source-of-truth and precedence, (2) audiences, (3) research-fidelity MUST/MUST NOT guards, (4) content requirements with per-item traceability (question → status, 10 subsections), (5) page sections `hero`→`footer` with IDs and purpose, (6) UX "understand quickly" criteria, (7) testable A11Y baseline (8 criteria), (8) responsive classes (5 criteria), (9) technical constraints (static, co-located, no deps, no mutation, offline-readable, relative links, no tracking by default), (10) canonical link gallery with placeholders, (11) acceptance criteria with stable IDs (C/UI/T/LINK/A11Y/RESP families), (12) traceability matrix Requirement→Source→Verification (automated / browser-manual / audit / human).

### Traceability summary

Every requirement ID maps 1:1 to an owning source (capstone/report/profile/evidence/governance or this spec's own structural rule) and a verification method that distinguishes automated (heading/link/contrast/scrollWidth/file-existence), browser/manual (keyboard/tab, focus, motion, viewport, print), research-content audit (wording vs capstone not strengthened, boundary completeness, no new label), and human acceptance (2-minute walkthrough, DOI/URL placeholder discipline). Full matrix in §12.

### Validation performed

- Read `research/post-research-plan.md`, `research/public-release-audit.md`, `research/capstone.md`, `research/current-state-index.md`, `research/research-program.md`, `research/documentation-conventions.md`, `README.md`, `research/evidence-policy.md`, `research/consolidation-map.md`, `research/profile-draft.md` (full or excerpt), `research/conformance-matrix.md`, `research/n6-implementation-report.md`, plus `package.json`, `.gitignore`, `index.html`, git log/status/remote, `LICENSE`.
- Audited this spec against `research/capstone.md` (no unsupported/stronger/missing-boundary finding), `research/documentation-conventions.md` (terminology, taxonomy, identifiers, framing), `research/evidence-policy.md` (P-1…P-7), and `research/post-research-plan.md` (§0–§13 precedence, placeholders, gates, non-goals). Results recorded in the Audit section above.
- Ran `git status --short` and `git status --short evidence` — clean. Verified no `CITATION.cff`, no `.github`, no Pages artifact. Confirmed baseline `c0e5fa2` / `99c56ad` / `1dc6114` ancestry and N1/N2 remediation delta.
- No tests, build, or evidence regeneration were run (not required for a spec-only phase; evidence-policy P-7 respected). No `pnpm run check / test / build` was re-executed here — fresh-clone validation already recorded in `research/public-release-audit.md`.

### Unresolved questions

- None blocking the spec. All P1 unknowns are explicitly deferred as placeholders or future decisions in §0.1.2; spec is intentionally silent on P2/P3 venue choices.
- Carried OPEN questions from the research record (capstone §8, `research/open-questions.md`) remain OPEN and are not re-decided here — correctly surfaced as OPEN fences on the page (C-05).

### Explicit statement

**Landing-page implementation has NOT started.** This phase produced only the specification above. Implementation, GitHub publication, `CITATION.cff`/`v1.0.0`/Zenodo/DOI creation, and GitHub Pages deployment all **wait for explicit human authorization** per the governing relationship:

```
canonical research record → landing-page specification → implementation → automated verification → browser/visual inspection → human acceptance
```

We stop here. Awaiting human authorization before implementation.

---

*End of landing-page specification.*
