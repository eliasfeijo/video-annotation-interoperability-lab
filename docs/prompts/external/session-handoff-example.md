# Session Context Block

## Project

Video Annotation Interoperability Lab / standards interoperability research repository.

## Collaboration model

I am using ChatGPT Web Free as the architecture/research/planning counterpart and an external OpenCode coding agent as the repository-execution counterpart.

ChatGPT does not have direct repository access.
OpenCode has repository access and can inspect/modify/test the current tree.
I will relay prompts and reports between them.

## Current repository state

The repository is currently at the post-H.2-C state.

H.2-A, H.2-B, and H.2-C are complete and committed.

Latest relevant architecture:

- `src/primitives/` — renderer-neutral primitives and explicitly labeled profile-defined readings.
- `src/comparison/blind-comparison.ts` — comparison/diagnostic harness.
- `src/oracle/` — direct-reference/oracle path.
- `src/n6/` — browser-free validator.
- `src/e14/` — interchange record/comparison layer.
- `src/reference/` — Renderer A implementation.
- `src/blind/` — blinded consumer implementation.
- `src/native/` — native `<img>` consumer implementation.
- `src/e15`–`src/e17` — analysis/counterfactual/research machinery.

H.2-C removed confirmed dead public/dead surfaces and retained `BodyKind "video"` because it belongs to the unresolved model-tier question.

The working tree was reported clean after H.2-C commit `1283438`.

## Remaining H.2 questions

The remaining questions were analyzed by a direct repository inspection performed by the external agent.

They reduce to three coherent future phases:

### H.2-D — Display/interchange two-tier ratification

Resolve:

- H.1 #11 — dual-model arrangement.
- H.1 #6 — `main.ts` E14 ↔ legacy bridges.

Hard dependency:

- #6 depends on #11.

Central architectural question:

Is E14 the permanent interchange tier while legacy `ResolvedOverlay` remains the display/regression/comparison substrate, with explicit bridges between them?

Important observed facts:

- There are actually three record systems:
  - `ResolvedOverlay` — legacy/reference display/regression model.
  - `BlindOverlay` — blind consumer-private model.
  - `E14Overlay` — interchange model.
- `Stage` consumes `ResolvedOverlay[]`.
- `BlindStage` consumes `BlindOverlay[]`.
- `NativeStage` consumes `E14Overlay[]`.
- `main.ts` contains `e14ToResolvedA` and `e14ToBlindOverlay`.
- These bridges are load-bearing and currently lossy.
- `e14ToResolvedA` only handles `kind === "svg"` and blanks missing SVG text.
- `e14ToBlindOverlay` only serves SVG, remaps `nested-canvas|image-contain` to `no-viewBox-1to1`, casts rules, and recomputes blind security classification at display time.
- L1/L2 comparison infrastructure and historical evidence depend on the legacy substrate.
- Blind's private model must not be collapsed into a shared interchange model because of methodological independence.
- `BodyKind "video"` was retained in H.2-C because deleting it would prematurely decide the model-tier question.

Potential implementation:

- likely document/ratify the permanent boundary;
- only relocate bridges if that is clearly behavior-identical and architecturally useful;
- do NOT merge models;
- do NOT redesign E14;
- do NOT modify comparators;
- do NOT regenerate evidence.

### H.2-E — Harness measurement contract

Resolve:

- H.1 #7 — LabApi divergence.

Observed:

- `LabApi` is owned by `main.ts`.
- `snapshot()` is typed as `Stage["geometrySnapshot"]`, but `NativeStage` returns a different shape.
- `overlayRect` / `domProbe` are not meaningful for NativeStage.
- `imgMetrics` is native-specific.
- `layerCount` has renderer-dependent meaning.
- Stage and BlindStage snapshots structurally agree; NativeStage is intentionally different because it measures a different rendering channel.
- Consumer specs currently bypass typing through `window.__lab` / `any`.
- Normalizing all shapes would potentially alter observation bytes and is not currently justified.

Additional observed issue:

- `?renderer=native` on legacy experiments appears unguarded and can crash because the legacy experiment branch drives NativeStage with `ResolvedOverlay`.
- No current spec exercises that combination.

Recommended direction:

- ratify/document a per-renderer/per-experiment capability contract;
- do not normalize observation shapes merely for type symmetry;
- decide whether the invalid native+legacy combination should be explicitly unsupported, guarded, or otherwise documented.

### H.2-F — Residue & policy closures

Resolve together:

- H.1 #8 — evidence-writing separation.
- H.1 #9 — unreachable `temporalWindow` defensive branch.
- H.1 #10 — U2 naming.
- micro-cleanup: dead private `n6/validator.ts#asArray`.

Recommended direction:

- ratify the currently embedded evidence-production model; do not create dedicated generators without a concrete problem;
- remove or explicitly document the unreachable `end < start` branch in `reference/lib/timing.ts`;
- reaffirm U2 default: machine letters remain; no rename; prose vocabulary remains governed by human review;
- delete only the confirmed dead N6 private `asArray`;
- do not create a generic utilities namespace.

Other `asArray` copies remain intentionally local and used.

## Recommended order

H.2-D → H.2-E → H.2-F

Reason:

- H.2-D contains the only hard architectural dependency (#11 → #6).
- H.2-E follows because it touches the same `main.ts` area but answers a different question.
- H.2-F contains mostly independent documentation/cleanup closures.

## Immediate objective for this session

Start by critically reviewing the H.2-D grouping and the proposed two-tier architecture.

Do not immediately write an implementation prompt.

First determine whether the supplied architectural conclusion is actually justified by the repository evidence.

If evidence is insufficient, formulate a targeted inspection request for OpenCode.

If evidence is sufficient, produce:

1. architectural decision;
2. precise H.2-D scope;
3. exclusions;
4. acceptance criteria;
5. a ready-to-paste OpenCode prompt;
6. the expected final report format.

Do not proceed to H.2-E or H.2-F until H.2-D is independently reviewed and completed.