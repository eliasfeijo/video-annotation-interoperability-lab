# Blind Renderer — Experiment Report

Status: complete. Runs end-to-end under Vitest and Playwright.

## What was built

An **independent** IIIF Presentation + Web Annotation + Media Fragments + SVG
renderer, `src/blind/`, that resolves a manifest into a set of compositable
overlays using **only** `docs/blind-interpretation-rules.md` and the specs it
cites. It never imports, calls, copies, or reuses Renderer A's resolution
logic (`src/reference/lib/*`). The only permitted cross-references are the
shared test/evidence harness (`src/blind/comparison.ts`), which must know both
sides to compare them.

Modules (`src/blind/`):

| File | Responsibility |
|---|---|
| `types.ts` | Blind data model (`BlindManifest`, `BlindOverlay`, `Placement`, security) |
| `selectors.ts` | Media Fragments 1.0 parser (`t=`, `xywh=`; `pct:`/`percent:`/`pixel:`) |
| `temporal.ts` | half-open window resolution + `isActive` predicate |
| `svg-root.ts` | SVG root attribute + viewBox parser (dependency-free) |
| `placement.ts` | SVG viewport/viewBox/preserveAspectRatio mapping math |
| `layers.ts` | painting-annotation collection + z-order (encounter order) |
| `parser.ts` | manifest walk: Canvas, AnnotationPages, bodies, targets, selectors |
| `resolver.ts` | `resolveBlindManifest` — the semantic resolution, mode A/B aware |
| `sanitize.ts` | SVG security **classification** + allowlist sanitizer |
| `compositor.ts` | `BlindStage` DOM compositor (nested `<svg>`, unsafe marker) |
| `comparison.ts` | blind-vs-reference semantic harness (shared infra) |

Each `BlindOverlay` records which interpretation rules it applied and their
provenance class (`NORMATIVE` / `DERIVED` / `CONVENTION` / `OPEN`), so any
resolution decision is auditable.

## Method

1. **Fixtures (Cases 1–13).** 13 manifests + 25 SVGs under `public/`,
   adversarial per packet §"Experiment 12": temporal edges, spatial units,
   invalid fragments, z-order across pages, three viewBoxes into one region,
   preserveAspectRatio variants, intrinsic dims (with and without viewBox),
   multi-selectors, security triage (safe / unsupported / unsafe).
2. **Unit tests** (`tests/blind.test.ts`, 25) — parser, temporal, svg-root,
   placement, resolver, security classification.
3. **Comparison** (`tests/blind-comparison.test.ts`, 18) — resolves every case
   with **both** renderers and diffs a *semantic record* (time window, z,
   destination region, user-space landmarks mapped through each renderer's own
   placement) rather than pixels. Writes
   `evidence/blind-comparison/{case1..13,summary}.json`. Also asserts Mode B
   (IIIF 4.0 draft) geometry is identical to Mode A.
4. **Browser E2E** (`tests/e2e/blind.spec.ts`, 7) — drives `?renderer=blind`
   in the lab, verifies DOM-level consequences (viewBox presence/absence,
   unsafe rejection marker, sanitization, out-of-bounds fallback, aspect
   letterboxing) and captures screenshots to `evidence/screenshots/blind/`.

## Results

| Case | Question | Verdict |
|---|---|---|
| 1 | full-canvas SVG, `t=10,15` half-open | match |
| 2 | primitives, no fragments | match |
| 3 | stacking, last on top | match ×3 |
| 4 | `xywh` pixel / `pct:` / pct-variant | match ×3 |
| 5 | same region, viewBox 1920 / 1000 / 100 | match ×3 (three distinct crops) |
| 6 | display-aspect letterboxing (16:9/4:3/narrow/wide) | match (display-only) |
| 7 | preserveAspectRatio meet/min/slice/none | match ×4 |
| 8 | z-order across two AnnotationPages | match ×2 |
| 9 | `t=,20` / `t=15` / invalid `t=20,10` | match ×3 |
| 10 | invalid spatial (zero-size, out-of-bounds) | match + **difference:spatial-fragment-validation** |
| 11 | intrinsic dims (viewBox present / absent) | match + **difference:no-viewBox-placement** |
| 12 | multi-selector, combined fragments | match ×2 |
| 13 | security triage | match + **difference:security-sanitization** + **difference:security-rejection** |

Mode A ≡ Mode B geometry: **true in all 13 cases**.

## Conclusions

1. **The standards determine the resolution for any body that carries a
   `viewBox`.** The Experiment-12 triple (same region, three viewBoxes) resolves
   identically in both renderers; the only non-unique link is
   "destination = region" (`[DERIVED]`/`[OPEN]`, packet §14).
2. **One genuine standards gap remains:** an SVG body with **no `viewBox`**.
   SVG's own 1:1 rule conflicts with the "scale into the space" reading; the
   renderers diverge (Case 11b). See `docs/ambiguities.md` §1.
3. **Three reference gaps/divergences surfaced:**
   - no out-of-bounds spatial validation (Case 10);
   - `percent:` (normative) unsupported, only `pct:` (convention) (Case 4);
   - implicit rather than explicit security policy (Case 13).
4. **Mode A/B provenance labels differ but geometry does not.** IIIF 4.0
   promotes z-order and Canvas-space xywh to normative; the rendered output is
   unchanged for this use case.
5. **`[start,end)` is normative**, not a convention (Media Fragments §4.2.1);
   both renderers implement it identically.

## Evidence

- `evidence/blind-comparison/case1.json … case13.json`, `summary.json` — semantic diffs.
- `evidence/screenshots/blind/*.png` — browser renderings for every case,
  including the four display aspects.
- `tests/` — 25 blind unit + 18 comparison + 7 E2E tests (all passing).

## Verification

- `pnpm test` — 80 unit tests.
- `pnpm run check` — clean `tsc --noEmit`.
- `pnpm exec playwright test` — 26 E2E tests (19 existing + 7 blind).

## Future work

- State the no-viewBox rule in a IIIF profile (recommend SVG's 1:1).
- Add out-of-bounds spatial validation to the reference.
- Accept `percent:` in the reference alongside `pct:`.
- Define a single, explicit security policy (reject vs sanitize) for the
  IIIF AV use case.