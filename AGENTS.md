# AGENTS.md — Repository Instructions for AI Agents

Binding instructions for AI coding agents working in this repository.

Task-specific briefs may add constraints, but must not silently relax these rules.

## Project character

This repository is a **research-driven interoperability/conformance lab**, not an ordinary application.

When changing the repository, preserve:

- methodological independence of consumer implementations;
- evidence integrity and reproducibility;
- frozen historical research records;
- machine-visible surfaces;
- the distinction between normative requirements, profile-defined readings, implementation behavior, and research observations.

Research correctness and explicit semantics take priority over ordinary production-software preferences such as DRYness or abstraction density.

## Epistemic discipline

Use these labels when reasoning about repository state:

- **OBSERVED** — established directly from source, configuration, tests, or cited documents;
- **INFERRED** — an interpretation supported by observed facts;
- **OPEN QUESTION** — genuinely unresolved.

Do not present an inference as an observed fact.

Do not promote implementation behavior into a normative claim without source evidence.

Do not silently resolve an open question. Carry it forward or obtain the required human decision.

## Repository truth

The repository is the authoritative source for its current implementation state.

Chat history, copied summaries, previous agent reports, and task descriptions are context only. They may be stale.

When a task involves non-trivial architectural or research work:

1. inspect the current tree and git state;
2. read `research/current-state-index.md`;
3. read the relevant current and immediately preceding phase records;
4. inspect the actual source files involved;
5. verify important inherited claims against the current tree;
6. identify protected surfaces and dependencies before editing;
7. work only within the task's stated scope.

If repository inspection contradicts the task premise, report the contradiction before proceeding.

## Architectural reuse discipline

The repository follows the four-tier governance model established in `research/phase-h2a-shared-primitive-namespace.md`:

1. **Renderer-neutral primitive** — freely shareable under `src/primitives/`.
2. **Explicitly labeled profile-defined reading** — shareable only when the name makes the reading explicit.
3. **Consumer-policy implementation** — owned by its consumer; sharing it may collapse a research observable and is therefore prohibited unless explicitly authorized.
4. **Analysis-only / counterfactual implementation** — must not become a consumer dependency.

Duplication alone is not sufficient justification for consolidation.

Physical location does not determine semantic ownership.

Do not introduce abstractions that hide research-significant divergence merely to reduce code duplication.

## Methodological blinding

The consumer implementations are:

- `src/reference/`
- `src/blind/`
- `src/native/`

Their semantic resolution logic must remain independent.

In particular, consumer implementations must not import one another's semantic resolution code.

The following are infrastructure rather than consumers:

- `src/comparison/`
- `src/oracle/`
- `src/n6/`
- `src/e14/`
- `src/e15/`
- `src/e16/`
- `src/e17/`

These may compare, predict, validate, or analyze consumer behavior, but must not become part of consumer resolution logic or be counted as an additional consumer in agreement claims.

## Protected surfaces

Treat the following as protected unless the active task explicitly places them in scope:

- tracked evidence under `evidence/`;
- fixtures and fixture coordinates;
- URL/query parameters;
- verdict strings;
- diagnostic codes;
- experiment and experiment-family identifiers;
- machine-visible code enumerants;
- filename grammars;
- frozen historical research records.

Changing one of these is not a routine refactor.

## Evidence policy

`research/evidence-policy.md` governs evidence handling.

In particular:

- running tests must not be treated as authorization to regenerate evidence;
- if an evidence-producing test rewrites tracked evidence, inspect the resulting diff and determine whether the output is expected and byte-stable;
- do not absorb unexpected evidence churn;
- evidence regeneration is protocol-authorized research work, not a refactor side effect.

Three Vitest suites currently write evidence as a run side effect. Check:

    git status --short evidence

after running them.

Browser/Playwright suites may also regenerate browser-dependent evidence. Do not run them routinely unless the task explicitly requires them.

## Historical records

Frozen research documents are historical records, not stale documentation.

Do not rewrite historical phase reports merely because paths, terminology, or implementation details changed later.

When current architecture changes, record the new state in the appropriate current-state document or new phase record while preserving historical records as they were.

Use `research/consolidation-map.md` to determine mutability regimes when uncertain.

## Scope discipline

Every research phase must have a bounded objective and explicit exclusions.

Do not perform opportunistic cleanup, redesign, renaming, abstraction, or modernization.

When discovering something outside the active scope:

1. classify it;
2. determine whether it blocks the current task;
3. if not blocking, record/defer it rather than expanding the phase.

Do not begin a subsequent phase without explicit instruction.

## Validation

Use the repository's established commands.

Typical validation:

    pnpm run check
    pnpm test
    pnpm run build

For code changes:

1. run focused tests for the affected area first when practical;
2. run the full relevant suite;
3. run the build when the module graph or shipped behavior may be affected;
4. check evidence status after evidence-producing tests;
5. inspect `git diff` and `git status` before reporting completion.

Do not claim validation that was not actually performed.

## Documentation layout

- `AGENTS.md` — durable instructions for coding agents.
- `docs/prompts/` — reusable prompts and session templates for the human/AI coordination workflow.
- `docs/` — human/project documentation.
- `research/` — research state, decisions, evidence policy, phase records, and current-state index.

Do not put reusable prompts into `research/`.

Do not use `AGENTS.md` as a substitute for research records.

Do not copy transient session context into `AGENTS.md`.

## Completion discipline

When the requested work is complete:

- stop at the stated completion condition;
- report what changed and why;
- report validation actually performed;
- report evidence status;
- report remaining open questions or newly discovered non-blocking issues;
- do not continue into the next phase without instruction.