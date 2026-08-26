# Public Release Audit

**Status:** Publication-readiness audit record (not a research report).
This document records that Gate G0 is closed. It owns no scientific claims
and does not modify the research record.

**Audit date:** 2026-08-25

**P0 audit baseline:** `1dc6114` — `1dc6114241c460b2bb230a495c589c3220ab548f`
(`docs: finalize research navigation and status`). P0 verdict at baseline was
`PASS WITH NON-BLOCKING FINDINGS` (no blocking publication issue).

**Resulting release-candidate commit (after hygiene remediation):**
`99c56ad9b464e395d8a4033bbf071130e4e0b8b5` — `docs: prepare repository for public release`
(4 files: `evidence/observations/exp2.json`, `public/viewer-check.html`,
`public/mirador-check.html`, `research/post-research-plan.md`).

---

## Audit scope (per `research/post-research-plan.md` §1)

- **P0 audit result:** PASS — no blocking publication issue at `1dc6114`; two
  non-blocking hygiene items identified (N1/N2).
- **N1 remediation:** completed — `evidence/observations/exp2.json:36`
  absolute Windows path
  `C:\Users\Elias\workspace\video-annotation-blind-lab\evidence\screenshots\exp2\exp2-primitives.png`
  replaced with repository-relative path
  `evidence/screenshots/exp2/exp2-primitives.png`. No observation semantics
  changed.
- **N2 remediation:** completed — floating unpkg viewer URLs pinned to tested
  versions:
  `public/viewer-check.html` Ramp CSS/JS → `@samvera/ramp@5.1.1`;
  `public/mirador-check.html` Mirador → `mirador@3.4.3`. No viewer behavior or
  probe logic changed.
- **Git history review:** passed; no rewrite required. History contains single
  public author identity, no `.env`/credential files ever tracked, no secret
  deletions, no personal-path leakage beyond the remediated `exp2.json` value.
- **Secrets/credentials review:** passed. `.gitignore` covers `.env`/`.env.*`;
  no `.env` files, API keys, tokens, or private keys found in tracked content
  or history (false positives only: CSS `token` strings, PNG binary noise).
- **Privacy review:** passed after N1. `LICENSE` authorship is intentional
  public provenance; screenshots/fixtures contain synthetic geometry only;
  evidence JSON contains only technical probe metadata.
- **Dependency/license review:** passed — CLEAR. `LICENSE` MIT, `package.json`
  devDependencies only (Playwright, Vite, Vitest, TypeScript, pngjs), no
  vendored unlicensed assets. `public/video/test-grid-1920x1080-30s.mp4`
  (586 kB) and `public/svg/e14/e14-red-circle.png` are synthetic/FFmpeg-
  generated per `research/fixture-provenance.json`.
- **External services review:** passed with N2 noted. All external URLs are
  public and documented: `http://localhost:5173` (local dev), `https://unpkg.com`
  (Ramp/Mirador — now pinned), `https://presentation-validator.iiif.io` (archived
  validation, network-dependent), IIIF/W3C spec URLs (citation only). No private
  endpoints or authenticated services.
- **Provenance review:** passed. `research/fixture-provenance.json` owns all
  families; `research/evidence-policy.md` P-1/P-4 governs evidence/producers;
  `research/consolidation-map.md` L0–L6 governs layers.
- **External-reader / fresh-clone review:** passed. Local fresh clone from
  `99c56ad` at
  `C:\Users\Elias\AppData\Local\Temp\video-annotation-blind-lab-fresh-clone-10d13ea2`
  verified:
  `README.md` TL;DR with capstone/canonical pointer (`research/capstone.md`),
  `LICENSE` present, `research/current-state-index.md` (L6, Capstone Commit A),
  `research/research-program.md` Steps 0–3 COMPLETE / Step 4 OPTIONAL,
  `research/post-research-plan.md` forward-looking, `research/capstone.md`
  final synthesis, `evidence/`/`src/`/`tests/`/`scripts/`/`package.json`/
  `pnpm-lock.yaml` present; no stale/dead links from N1/N2 edits.
- **Reproducibility checks performed (in fresh clone):**
  - `pnpm install --frozen-lockfile` — PASS (53 packages, lockfile up to date, 2.8 s)
  - `pnpm run check` (`tsc --noEmit`) — PASS (no errors)
  - `pnpm test` (`vitest run`) — PASS (9 test files, 180 tests passed, 2.96 s)
  - `pnpm run build` (`vite build`) — PASS (31 modules, 886 ms)
  - No viewer experiments or evidence regeneration run; no tracked research
    artifacts mutated.
- **Working-tree check (original repo after clone):**
  `git status --short` — clean; `git diff HEAD` — empty; `git remote -v` —
  empty (no GitHub remote added).

---

## Explicit statements

- The research arc remains **complete**; `research/capstone.md` remains the
  **canonical final synthesis** (Layer L0-adjacent, 2026-08-25). No research
  findings, frozen reports, evidence semantics, fixtures, profile
  (`research/profile-draft.md`), conformance matrix (`research/conformance-matrix.md`),
  or validator behavior (`src/validator/`) were changed beyond the approved
  hygiene edits above.
- This audit does **not** constitute a new research phase. No experiments were
  reopened, no fixtures regenerated, no evidence rewritten.
- **GitHub publication has NOT yet been performed.**
- **DOI / Zenodo archival has NOT yet been performed.**
- **GitHub Pages deployment has NOT yet been performed.**
- No GitHub URL, DOI, ORCID, affiliation, venue, or release URL is invented or
  implied by this document. Placeholders (`<REPO_URL>`, `<DOI_PLACEHOLDER>`) remain
  in `research/post-research-plan.md` until minted.

---

## G0 status

**G0 PASSED** — repository is ready for P1 GitHub publication per
`research/post-research-plan.md` §12 Gate G0 (public readiness) and §11
sequencing principle (do not start P3 before stable public artifact).

Recorded at: `99c56ad9b464e395d8a4033bbf071130e4e0b8b5`
Date: 2026-08-25

---

## G1 status

**G1 PASSED** — citation readiness per `research/post-research-plan.md` §12 Gate G1.

- public repository: `https://github.com/eliasfeijo/video-annotation-interoperability-lab` (public, `main`) — verified `gh api` visibility public, `200` at `https://github.com/eliasfeijo/video-annotation-interoperability-lab`
- `CITATION.cff` present with decided authorship (`Elias Feijó`), title `Video Annotation Interoperability Lab`, license `MIT`, version `1.0.0`, repository URL, and DOIs — live `main` at `cdc9af956d284797867908071770c695329a086b` / `99c026b` contains `doi: 10.5281/zenodo.22105056` and `identifiers: 10.5281/zenodo.22105055` (concept), validated `cff-version 1.2.0`; `v1.0.0` snapshot intentionally retains pre-DOI `CITATION.cff` at `dbe4f2b7934231c1434d296376eb4241c3601340`
- stable release `v1.0.0` tagged: annotated tag `89021251337fa5549c93bd17f371e8587db933b7` → `dbe4f2b7934231c1434d296376eb4241c3601340`, GitHub release `https://github.com/eliasfeijo/video-annotation-interoperability-lab/releases/tag/v1.0.0` published `2026-08-26T03:13:59Z`, not draft/prerelease, `target_commitish main`
- archival DOI minted via Zenodo: version DOI `10.5281/zenodo.22105056` (`https://doi.org/10.5281/zenodo.22105056` `302 → 302 → 200` → `https://zenodo.org/records/22105056` `200`, `Link: <https://doi.org/10.5281/zenodo.22105056>; rel="cite-as"`) and concept DOI `10.5281/zenodo.22105055` (`https://doi.org/10.5281/zenodo.22105055` `200`), both public, `Zenodo API` `id 22105056 conceptrecid 22105055 doi 10.5281/zenodo.22105056 conceptdoi 10.5281/zenodo.22105055 version v1.0.0 publication_date 2026-08-26 creators `Feijó, Elias`, keywords/title match `CITATION.cff`, related_identifiers `https://github.com/.../tree/v1.0.0`

Gate closes: DOI resolves and citation snippet is verified — both satisfied (Zenodo `citation_title`/`citation_author`/`citation_doi`/`citation_keywords` present, record file `eliasfeijo/video-annotation-interoperability-lab-v1.0.0.zip` size 4766519).

Recorded at: `be72139b6a7d4e1a00287594cdb23194863d70ce` (a11y polish) — closure recorded at next commit `G1/G2 closure`
Date: 2026-08-26

## G2 status

**G2 PASSED** — discovery readiness per `research/post-research-plan.md` §12 Gate G2 and `research/landing-page-spec.md` §12 traceability matrix.

- published landing page: `https://eliasfeijo.github.io/video-annotation-interoperability-lab/` (`main` + `/docs`, `status built`, commits `99c026b` → `be72139`, `HTTP 200` len 27046) — verified via `gh api .../pages` and `Invoke-WebRequest`
- actual repository `https://github.com/eliasfeijo/video-annotation-interoperability-lab` `200`, release `v1.0.0` `200`, version DOI `https://doi.org/10.5281/zenodo.22105056` `200`, concept DOI `200`, Zenodo record `https://zenodo.org/records/22105056` `200` — all publication URLs verified
- publication metadata consistent: `CITATION.cff` `1.2.0` with version DOI on `main`, repository description `A reproducibility lab testing whether Web Annotation, Media Fragments, IIIF Presentation, and SVG can express portable video annotation without a new vocabulary.`, homepage `https://eliasfeijo.github.io/...`, topics `iiif, iiif-presentation, web-annotation, media-fragments, svg, video-annotation, interoperability, reproducibility` verified via `gh api`, Pages delivery audit kept `main + /docs` (legacy, automatically published; CI/CD rejected as unnecessary per P1-E.5/P1-E.6 — docs/ is final static artifact, 2 requests, 36k, no build)
- artifact/citation links verified: `Repository` `github.com/...`, `Capstone blob/main/research/capstone.md` `200`, `Release v1.0.0` `200`, `DOI version 22105056` `200` + `concept 22105055` `200`, `Validator src/validator/` + `evidence/n6/`, `CITATION.cff` `200` (live DOI-bearing), evidence families — all `200` or `file-exists`, internal anchors `href="#hero"` etc. `exists:true`, no failed requests/console errors at 7 viewports
- stale placeholders removed: `&lt;REPO_URL&gt;` count `0`, `&lt;DOI_PLACEHOLDER&gt;` count `0`, no `DOI pending`/`forthcoming`/`URL TBD` language; `Badge` now `Published v1.0.0 — DOI 10.5281/zenodo.22105056`; `Footer` now cites `CITATION.cff` + both DOIs + `Release v1.0.0` + `Pages main + /docs`
- visual/responsive/accessibility audit completed: Playwright Chromium 7 viewports (1440x900, 1280x800, 1024x768, 768x1024, 390x844, 375x812, 320x568) — `scrollWidth === clientWidth` at all widths, `overflowX false`, `tables 13 rows width 280–656 stacked cards usable`, `codeBlocks 1` internally scrollable at narrow widths, `focus-visible` blue outline, `axe` violations `0` passes `24` (incomplete `aria-prohibited-attr` `2 nodes` fixed in `be72139` → incomplete `0` at desktop), performance `HTML 27046 + CSS 8949 = 35995 bytes 2 requests 0 JS 0 images max-age 600`, `DOMContentLoaded 31–44ms` warm

Gate closes: external reader can land, understand contribution, and reach every canonical artifact in one click — satisfied.

Recorded at: `be72139b6a7d4e1a00287594cdb23194863d70ce` — closure recorded at next commit `G1/G2 closure`
Date: 2026-08-26

*End of audit record. G1/G2 closed. Next: P2/G3 AI-assisted methodology note.*
