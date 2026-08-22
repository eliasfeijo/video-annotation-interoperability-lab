# Documentation Conventions — Terminology (D1) & Provenance-Taxonomy Legend (D2)

Status: Phase C design artifact. Applies to NEW/FUTURE documents only.
Historical documents are never modernized (Phase B rule P-TERM-2).
Decision basis: D1, D2 in `phase-b-provenance-terminology-audit.md` (§§2–4 there are
the analysis; this file is the operative rule set).

---

## Part I — Terminology rules for new documents (D1)

### T-1. Axis words are mandatory

Bare letters A/B/C are forbidden in new prose. Always carry the axis word:

| Write this | Never this | Axis |
|---|---|---|
| Renderer A / Renderer B / Blind renderer / Native renderer | "renderer A"→ok; "A", "B" alone | implementation identity |
| Model A / Model B / Model C | "Model B" ok; "B" alone | composition structure (E14) |
| Mode A / Mode B | "Mode A" ok; "A/B semantics" alone | IIIF 3.0-stable vs 4.0-draft semantics (blind renderer) |

Definition sites: `src/reference/lib/types.ts` (`RendererKind`),
`src/e14/types.ts` (`E14Model`), `src/blind/layers.ts` (`IiifMode`,
`zProvenance`), `docs/iiif-3-vs-4.md`, `e14-report.md` §2.

### T-2. Qualified collision terms

| Unqualified term | Required qualification in new prose |
|---|---|
| viewport | **page viewport** (CSS/host element, exp6) · **SVG viewport** (SVG 1.1 §7.2) · **region-as-viewport** (profile assignment S2/P2) |
| region | **target region (Canvas space)** (placement rect addressed by target fragment) · **MF selection region** (media-intrinsic `xywh=` rect). Collision flagged by `profile-draft.md` Part 2 — keep both meanings distinct |
| canonical | **canonical prefix/form** (`percent:` vs alias `pct:` — value normalization) · **canonical ordering** (output order-neutrality, T08 sense) |
| reference | name the role: "Renderer A library (`src/reference/lib/…`)" vs "Renderer B oracle" |
| native | reserve for the `<img>`-pipeline renderer; use `[BROWSER]` class for generic browser behavior |
| blind | methodological blinding only; note N6's sanctioned reuse of two pure helpers |

### T-3. Era-appropriate comparison vocabulary

| Term | Use only for |
|---|---|
| parity | exp1–7 resolved-set equality (Renderer A vs Renderer B oracle); `parity-*.json` era |
| comparison / semantic diff | blind-generation and E14/E16 structured comparisons |
| verdicts / agreement (`a==blind` …) | E14+/E17 pairwise evidence outcomes |

### T-4. Conformance ≠ compatibility ≠ honoring

- **conformance** = satisfaction of R-S*/X* profile requirements (L3/L4 world).
- **compatibility** = capability status S/G/B rows (`compatibility-matrix.md`, L1).
- Resource-side conformance NEVER implies consumer conformance (R-S2 stays BLOCKED;
  `n6-implementation-report.md` §6).
- Fragment **syntax permitted** (S6a/S8a) never implies consumer **honoring**
  (S8b `[OPEN]`; N2 `[UNKNOWN]`).

### T-5. Framing (D8)

New descriptive prose uses the conservative framing adopted in Phase B:
"predictable, interoperable geometry for graphical resources (SVG/Canvases) painted
onto IIIF Presentation Canvases — including temporal targeting — using existing
standards vocabulary, with a conventions-and-conformance approach rather than new
vocabulary." Never claim a new standard/protocol/normative authority; consumer-side
certification remains blocked.

### T-6. Immutable identifiers

Never rename or reinterpret: experiment IDs (exp1–7, E12–E17, N1–N6), test IDs
(T01–T15, RF01–RF04), requirement/exclusion IDs (R-S1…R-S8b, X1–X8, S1–S8),
rule IDs (P1–P6), probe IDs (R-V*, M-M*), findings (F*), questions (Q*, open-question
numbers), interpretations (I-REGION-VIEWPORT etc.), ambiguities (AMB-N6-1),
provenance labels (Part II), evidence filenames (including legacy typos such as
`epx6-*.png`). SUPERSEDED markers are data and stay structurally visible.

---

## Part II — Provenance-taxonomy common legend (D2)

ZERO new labels. Every label below is quoted verbatim from its definition site.
Taxonomies classify DIFFERENT object types; equivalence between same-named labels in
different taxonomies is denied explicitly.

### The four scoped taxonomies

| Taxonomy | Object being classified | Labels | Definition source | Not equivalent to |
|---|---|---|---|---|
| **A — interpretation-rule provenance** (blind renderer) | a rule an independent implementer may use | `[NORMATIVE]` `[DERIVED]` `[CONVENTION]` `[OPEN]` | `docs/blind-interpretation-rules.md` header table | C (requirement provenance): A licenses *interpretations*, C licenses *requirements*. B's same-named strings classify divergences instead |
| **B — renderer-divergence classification** (E14) | why renderers differ / who owns a behavior gap | `NORMATIVE` `DERIVED` `CONVENTION` `OPEN` `IMPLEMENTATION_GAP` `VIEWER_GAP` | `research/e14-report.md` §3.2/§4 | A/C: here labels attach to DIVERGENCES/ASPECTS, not rules or requirements |
| **C — requirement provenance** (profile) | epistemic authority of a REQUIREMENT/claim | `[NORMATIVE]` `[BROWSER]` `[COMMUNITY]` `[DERIVED]` `[PROFILE]` `[OPEN]` | `research/profile-draft.md` Part 3 (includes binding promotion rules: three-engine agreement does NOT upgrade; cookbook advice does NOT become spec claim; [OPEN] must not acquire implicit status) | A (rule scope), D (observations); `[PROFILE]` descends historically from A's `[CONVENTION]` but is stricter |
| **D — consumer-observation classification** (N2) | a recorded probe outcome about deployed consumers | `[CONSUMER]` `[VIEWER_GAP]` `[UNKNOWN]` | `research/viewer-interop-report.md` (probe matrix; "Which observations are [CONSUMER] only?") | everything normative; D `[UNKNOWN]` = measurement-inconclusive, NOT C/A `[OPEN]` = semantically undetermined |

Cross-taxonomy traps (from Phase B §4.1, kept as warnings):

- `[CONVENTION]`: A licenses an interpretation rule; B classifies a divergence whose
  ownership is conventional; C's functional ancestor of `[PROFILE]`. Three objects.
- `VIEWER_GAP`: B classifies a gap class; D labels a probe row. Same phrase,
  different granularity.
- `[OPEN]` (A/C: undetermined semantics) vs `[UNKNOWN]` (D: inconclusive capture)
  vs BLOCKED (N6 state: requires nonexistent capable consumer).

### Adjacent systems that are NOT provenance taxonomies

Do not mix these with A–D when writing:

| System | Object | Labels | Definition source |
|---|---|---|---|
| Compatibility status | capability row | `S` `G` `B` `S*` | `compatibility-matrix.md` legend |
| Conformance state | requirement implementation status | implemented / BLOCKED / OPEN fence / EXCLUDED / OUT OF SCOPE (markdown vocabulary); implemented/blocked/open fence/excluded (JSON presentation) | `conformance-matrix.md` Part A; `scripts/run-n6-suite.mts` `matrixRows` (mapping lives ONLY there) |
| Diagnostic codes | validator output items | `VIEWBOX_PRESENT`, `MISSING_VIEWBOX`, `ASPECT_MISMATCH`, `TEMPORAL_HONORING_OPEN`, … | `src/n6/types.ts` |
| Comparison verdicts | fixture×renderer pairs | `a==blind`, `a==native`, `blind==native` (+ `!=`) | evidence/e14,e16,e17 JSONs |
| Hypothesis verdict scale | session-level falsification outcome | grades A–E | `findings.md` §Verdict |

### Rule for new documents needing a label

Use the taxonomy that owns your object type, quote labels verbatim, cite the
definition source once, and never merge vocabularies into combined labels
(profile Part 3 rule 1 applies repo-wide). If no taxonomy fits, describe the object
in prose; do NOT mint a label (zero-new-labels rule, D2).
