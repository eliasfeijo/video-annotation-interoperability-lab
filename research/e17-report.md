# E17 Report — N1 Cross-Engine Replication

Date: 2026-08-21
Plan: `research/next-session-plan.md` Stage 1 (PRIORITY 1).
Runner: dedicated `playwright.e17.config.ts` (projects `chromium` | `firefox` | `webkit`;
`testMatch` pinned to `tests/e2e/e17.spec.ts`; historical suite untouched and still runs once via
the default config).
Engines: Chromium **151.0.7922.34**, Firefox **153.0**, WebKit **26.5** (Playwright 1.62.1,
Windows; exact versions also machine-recorded with userAgent in every evidence file).

Method summary: minimal adversarial subset from the approved plan — E15 core geometry cells
re-measured with the E15 mask classifier lifted verbatim (`src/e17/classify.ts`, thresholds
unchanged: coverage ≥ 0.8 on circle AND frame masks, K = 0.25), a NEW xMaxYMax variant fixture
(`e17-vb1000-max.svg`, landmark contract identical to the e15 vb1000 family), and the E16
native `<img>`-channel probes re-run per engine. Expected interpretations were fixed before
measurement and never adjusted.

---

## 1. Headline

**62/62 distinct geometry-matrix rows are UNANIMOUS across Chromium/Firefox/WebKit
(0 divergent, 0 incomplete). Every E16 probe outcome is unanimous. Zero cross-engine
divergences were found.** The plan's S1.1 stopping condition ("explicit-viewBox disagreement ⇒
stop higher-level modeling") was NOT triggered.

Per the honesty rules: these agreements establish **multi-engine browser behavior only**
(`[BROWSER]` facts now backed by three engines). They do NOT promote any row to
`[NORMATIVE]` — standards provenance stays with the sources cited in E15/E16 reports.

## 2. Probe set actually executed

| Family | Fixtures @ regions | Embeddings |
|---|---|---|
| E15 rep + core | `e15-vb1000.svg`@{rect43,square500}, `e15-vb1920x1080.svg`@rect43, `e15-novb1000.svg`@square500, `e15-novb1920x1080.svg`@rect43, `e15-vb1000-{min,none,slice}.svg`@half | svg-nested-region, img-default, img-fill, img-contain, img-none, object |
| xMaxYMax (new) | `e17-vb1000-max.svg`@{half,rect43} | + svg-nested-attr |
| Intrinsics | all variants of both lab pages | hidden `<img>` probes |
| E16 native channel | case01 same-aspect control, case03 collapse probes, case05 row-scan separation, case06 strongest-divergence record, case07 resolver verdicts | `.native-overlay img` pipeline |

Full per-cell records (engine, browser version, userAgent, mechanism, fixture, expected,
observed geometry, matches, classification inputs): `evidence/e17/case-*.json`,
aggregated in `evidence/e17/{cross-engine-matrix.json,summary.json}`.

## 3. Findings

**F1 — Explicit-viewBox region-painting agreement (H1 ACCEPTED).**
For every explicit-viewBox fixture × region × {svg-nested-region, img-default, img-fill,
object}, ALL engines matched `I-REGION-VIEWPORT` alone (hard assertion, would have failed the
run otherwise). Observed circle centers/radii agree within existing tolerances.
Class: `[BROWSER]` multi-engine consistency *with* `[NORMATIVE]` predictions — the predictions'
rank comes from SVG 1.1 §7.7–7.10 / CSS Images 3 as recorded in E15, not from unanimity.

**F2 — The no-viewBox hazard reproduces identically (H2 ACCEPTED).**
All engines show the same three coexisting readings: nested-region paints 1:1
(`I-REGION-VIEWPORT`), `img-default`/`img-fill` bitmap-stretch the intrinsic canvas
(`I-INTRINSIC-STRETCH`), CSS contain/none follow object-fit semantics. The ambiguity is
engine-uniform, so eliminating it requires exactly the profile rule (P1 explicit viewBox +
P2 consumer rule) — now evidenced on three engines. Class: `[BROWSER]`+`[OPEN]` retained.

**F3 — Intrinsic-size reporting is identical, including attribute-less SVG.**
`naturalWidth/naturalHeight` for every variant (incl. `novb*`) reported identical values in all
three engines (e.g. novb1000 = 1000×1000). The anticipated Firefox/WebKit SVG2 intrinsic-sizing
divergence did NOT materialize in tested versions. Raw values preserved verbatim in
`intrinsics-<engine>.json`. Class: `[BROWSER]`.

**F4 — preserveAspectRatio token behavior is engine-uniform (H3 ACCEPTED).**
`xMinYMin`, default `xMidYMid meet`, new `xMaxYMax`, `none`, and the slice clipping family all
match spec-derived placement in every engine. Class: `[BROWSER]` multi-engine.

**F5 — Leaf-PAR collapse through the `<img>` pipeline reproduces outside Chromium (H5
ACCEPTED — general browser behavior).**
case03 probes (`novbBand` near canvas (38,540) AND `collapsedBand` near (441,540)) are TRUE in
all three engines; case05 left-frame run fractions are numerically identical
(0.0196, 0.1483). The collapse is therefore not a Chromium quirk. Class: `[BROWSER]`;
container-fit vs leaf-PAR precedence stays `[OPEN]`.

**F6 — Same-aspect control unanimous (H4 supported at control level).**
case01 composed band positions agree across engines and match the analytic coincidence of
fill/contain for 1920×1080→1920×1080 (`fitsCoincide` true). Mismatched-case magnitude checks
remain as recorded in E16; no new divergence surfaced.

**F7 — Designed no-viewBox divergence preserved everywhere.**
case07 verdict sets `{a!=blind, a!=native, blind==native}` reproduced by both independent
resolvers in all engines (hard assertion passed). Class: `[DERIVED]` (resolver logic is
engine-independent JavaScript; the underlying semantic question stays `[OPEN]`).

**F8 — case06 measurement limitation documented.**
Composite `<img>` natural sizes are identical across engines (1920×1080, 1000×1000), but
raster fit-classification was deferred: down-scaled strokes are sub-pixel at K = 0.25, so band
probing cannot distinguish fill from contain reliably there. Recorded as an explicit
measurement limitation (`[OPEN]` instrumentation note), not papered over.

## 4. Lab bugs discovered during E17

16. **E17/case05 harness race** — see `research/experiment-log.md`. Missing re-apply of the
    target time after image-load wait made Firefox rasterize a pre-applyAt state (empty scan),
    which initially looked like a browser divergence. Fixed in the E17 spec only
    (`seek(t)` + settle AFTER `waitImgsLoaded`); Firefox then reproduced the other engines
    exactly. Historical specs left frozen. Lesson: cross-engine probes must re-apply time after
    resource load.

## 5. Consequences for the candidate profile (P1–P6)

**No content change.** The evidence base for P1/P2 (explicit viewBox + region-as-viewport
consumer rule) and for the `[BROWSER]` classifications behind P5/P6 upgrades from one engine to
three. Per the standing rules nothing changes rank: conventions remain conventions, browser
facts remain browser facts, and "all engines agree" is nowhere read as "standardized".

## 6. Evidence index

- `evidence/e17/summary.json` — engines, totals, agreement flags, intrinsics divergences (none)
- `evidence/e17/cross-engine-matrix.json` — 62 rows × {chromium,firefox,webkit} match sets
- `evidence/e17/case-e15-<engine>-*.json`, `case-max-<engine>--*.json` — per-fixture cell records
- `evidence/e17/intrinsics-<engine>.json` — raw intrinsic sizes
- `evidence/e17/e16-<engine>-case{01,03,05,06,07}-*.json` — nested-Canvas probes
- `evidence/screenshots/e17/<engine>/…` — per-engine screenshots
- Commands: `pnpm exec playwright test --config=playwright.e17.config.ts --project={chromium|firefox|webkit}`
  → 16/16 each; `node scripts/e17-aggregate.mjs`; `pnpm check` clean.

## 7. Next-stage gate

S1.1 (irreconcilable divergence) did not fire; the geometry profile survives beyond Chromium.
Priorities 2–3 of the approved plan are now unlocked: N2 real-consumer probes and N3
community/spec positioning, followed by the N4 decision. Movement/timeline modeling remains
blocked behind those, as mandated.
