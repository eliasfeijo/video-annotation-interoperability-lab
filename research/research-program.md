# Research Program

> **STATUS: LIVING ROADMAP (mutable planning surface).** This document is the
> project's forward-looking research program. It explains what the project is,
> what has been established, what remains unknown, and what is planned next —
> for readers who did not participate in the repository's earlier phases. It
> owns no scientific claims: wherever a factual statement matters, this file
> points to the authoritative document that owns it. Established by unit I.1
> against HEAD `c34bd0a`; restructured into its current human-facing form by
> I.1-R. It supersedes `research/next-session-plan.md` as the forward-looking
> planner only; that file remains frozen history.

Date: 2026-08-25.

---

## 1. What is this project?

This lab studies a concrete question:

> **Under which conditions does the geometry of graphical content painted onto
> IIIF Presentation Canvases become predictable, interoperable, and mechanically
> checkable?**

Concretely: IIIF Presentation manifests can describe a video (via a Canvas) and
attach graphical overlays to it — an SVG shape drawn on top of the video,
targeted at a spatial region (`xywh=`) and a time window (`t=`) using standard
W3C Media Fragments. The standards *permit* all of this. What they do not fully
specify is what the resulting geometry **means**: how an SVG body's coordinate
system maps onto the Canvas, how nested Canvases fit into their target regions,
or whether real software honors any of it.

The lab therefore measures when this stack behaves predictably across
independent implementations and browsers, distills the results into a small
written interoperability profile, and checks that profile with a mechanical
validator — without inventing new standards vocabulary.

## 2. Where are we now?

The main measurement and conformance arc is complete. In plain terms:

- The standards stack **can express** portable time-segmented, spatially
  targeted graphical overlays; the original falsification attempt failed
  (`research/findings.md`, historical snapshot).
- Requiring an explicit `viewBox` on overlay SVG bodies makes their geometry
  deterministic; without one, different rendering mechanisms produce different
  geometries from identical data (`research/e15-report.md`).
- That behavior was reproduced identically in Chromium, Firefox, and WebKit —
  62 of 62 measurement rows agree across all three engines
  (`research/e17-report.md`, `evidence/e17/`). Cross-engine agreement proves
  browser behavior; it does not promote anything to standards law.
- When a Canvas is painted onto another Canvas, restricting compositions to
  matching aspect ratios removes the last geometric ambiguity mathematically
  (`research/n4-safe-subset.md`; measured divergence otherwise: up to ~386
  Canvas units).
- The two mainstream IIIF viewers tested (Ramp 5.1.1, Mirador 3.4.3) fail
  before ever drawing such overlays — one crashes on any secondary painting
  body, one silently drops it (`research/viewer-interop-report.md`). So the
  data model works; deployed viewers cannot yet show it.
- The written profile's resource-side rules are mechanically checkable today
  by the lab's validator (`research/n6-implementation-report.md`,
  `evidence/n6/`); checking a *consumer* remains impossible until a capable
  consumer exists.
- Whether any viewer honors a `t=` time window is now **characterized for the tested implementations**: Ramp 5.1.1 demonstrably **does not honor** `#t=10,20` on a Canvas target when driven through its own playback surface (interaction probe, Chromium 151, 2×2 runs, delta 0.01 — `research/experiment-log.md` #18, `evidence/viewer-interaction/viewer-interaction-matrix.json`); Mirador 3.4.3 was **inconclusive / experimentally unreachable** for this question because it exposed no consumer-owned AV playback control. Temporal honoring therefore remains **outside the profile's guaranteed requirement set** (`research/profile-draft.md` R-S8b `[OPEN]`).

## 3. What have we established?

Grouped by theme; each point cites its owning document.

**Expressibility.** The full annotation model (temporal + spatial targeting +
SVG painting bodies, including Canvas-on-Canvas nesting) is expressible in
stable IIIF Presentation 3.0 plus W3C vocabularies, with documented gaps that
need conventions rather than new vocabulary (`research/findings.md`;
`research/e15-e16-final-report.md`).

**Geometry determinism.** One small publisher rule — explicit `viewBox` on every
SVG painting body — eliminates the principal ambiguity: with it, all mechanisms
that paint into a region agree; without it, three incompatible readings coexist
(`research/e15-report.md`; formalized as rule R-S1 in `research/profile-draft.md`).

**Cross-engine stability.** The browser behaviors underlying those findings hold
identically in three engines (`research/e17-report.md`). These are version-scoped
browser facts, kept separate from normative claims by design.

**Composition safety.** For aspect-mismatched nesting, no standard defines a fit
behavior ("scaled to fit" names no algorithm), and readings measurably diverge;
matching aspect ratios make every reading coincide exactly — the safe subset
adopted as profile rule R-S4/P5a (`research/n4-safe-subset.md` Part 2;
`research/profile-draft.md` Part 7).

**Consumer reality.** Both tested viewers fail before geometry: Ramp with a hard
error, Mirador by silent omission, for SVG, raster, and nested-Canvas bodies
alike (`research/viewer-interop-report.md`). This is a measured gap in current
deployed software, version-scoped — not a verdict on the standards or on future
viewers.

**Conformance.** A formal profile (requirements R-S1…R-S8b, exclusions X1–X8)
exists with provenance labels separating standards text from browser facts,
community practice, and deliberate profile decisions
(`research/profile-draft.md`). Eight resource-side checks are implemented and
passing in the validator; consumer-side certification is explicitly blocked, not
silently skipped (`research/conformance-matrix.md`;
`research/n6-implementation-report.md`).

**Temporal semantics.** Time-window syntax and half-open interval meaning are
normative (Media Fragments); producers may use them freely. Whether consumers
*apply* them is deliberately fenced as unknown (`research/profile-draft.md`
R-S8b) — see §4.

## 4. What remains unknown?

### Internally answerable

**Does a real viewer honor `#t=` time windows when actually used?** — **ANSWERED (version-scoped, D1).** Ramp 5.1.1: **NOT-HONORED** for the `#t=10,20` Canvas-target case when driven through the consumer's own playback surface (`research/experiment-log.md` #18, `evidence/viewer-interaction/viewer-interaction-matrix.json`, Chromium 151, 4 valid drives via `.vjs-big-play-button`, temporal settled 2.65/2.64 vs control 2.63/2.64 delta 0.01, `hasMediaFragmentInSrc:false`). Mirador 3.4.3: **INCONCLUSIVE / experimentally unreachable** — no consumer-owned AV playback control was found (native `controls:true` only), so no causal honoring verdict is possible. The result is version- and case-scoped; it does **not** generalize to “Ramp never supports temporal fragments” and does **not** become a normative profile requirement (R-S8b stays `[OPEN]`). See `§5 Step 2` completion record.

Two smaller internal items were decisions rather than experiments, both closed by
unit I.2: the recorded wording ambiguity in the validator documents (AMB-N6-1,
resolved with the formula-consistent correction — `research/n6-implementation-report.md`
§9) and routine register bookkeeping (questions 12–15 annotated as ANSWERED;
the H.5-0 working record committed unchanged).

### Externally gated

These cannot be settled by more repository experimentation, because the deciding
fact lives outside the lab:

- **Capable consumer support.** Whether any viewer will ever realize the profile's
  consumer-side contract depends on software we do not control. The certification
  test fixtures are designed and waiting (`research/conformance-matrix.md`);
  they become runnable the day a claiming consumer appears.
- **Fit behavior for mismatched aspects.** IIIF specifies no algorithm and the
  community's own guidance is contradictory; resolving it is a specification/
  community process. The profile currently excludes the case honestly rather
  than guessing (`research/community-positioning.md`).
- **Z-order portability.** IIIF's own recipes contradict each other on stacking
  direction; cross-consumer guarantees await community convergence
  (`research/community-positioning.md`; profile Part 9).

The distinction matters operationally: internally answerable questions get
experiments now; externally gated ones get monitoring triggers and, if desired,
community engagement — not more lab measurement pretending to decide them.

## 5. What are we doing next?

Four steps, in dependency order. Each awaits its own explicit authorization
where noted; listing them here plans work, it does not authorize it.

**Step 0 — Living research-program surface. COMPLETE (this document, unit I.1).**
Gives the project a durable, conversation-independent forward-looking plan.

**Step 1 — Ledger/documentation closure. COMPLETE (unit I.2).**
AMB-N6-1 resolved via the formula-consistent correction (`W'·H == H'·W`; verdicts
unchanged — resolution record in `n6-implementation-report.md` §9); register questions
12–15 annotated in place as ANSWERED with per-item scope caveats; the H.5-0 triage
record committed unchanged as a completed historical record.
*Why now:* these are tiny, and finishing them keeps later synthesis honest.
*Done when:* each item carries a recorded disposition or explicit deferral owner. ✓

**Step 2 — Interaction-level temporal experiment. COMPLETE (unit I.3, 2026-08-25, commit 994e293).**
Drove the tested viewer(s) through their own playback surface — play via the consumer's UI (Ramp `.vjs-big-play-button`), never synthetic media-element events — and compared `#t=10,20` (`public/manifests/n2/n2-temporal.json`) against a control without a fragment (`public/manifests/viewer-plain.json`), recording whether playback seeks to the window start. Outcome: Ramp 5.1.1 **NOT-HONORED** (version-scoped, see `evidence/viewer-interaction/viewer-interaction-matrix.json`, `research/experiment-log.md` #18; 2×2 valid drives, delta 0.01); Mirador 3.4.3 **INCONCLUSIVE / unreachable** (no consumer-owned path). The result upgrades the prior `[UNKNOWN]` into a characterized boundary for the tested case without creating a general browser or normative claim.
*Prerequisites were met:* pre-registered protocol and outcome classes (I.3-A), authorization covering `evidence/viewer-interaction/` regeneration, and append-only reopening of the experiment log (`research/consolidation-map.md` §1.5 #2).
*Done when satisfied:* machine-readable evidence rows classify the outcome per consumer/version, and the temporal fence citation is updated through the authorized edit flow (this synthesis, I.3-B). ✓

**Step 3 — Capstone synthesis. PLANNED.**
One durable document integrating the whole arc: what was asked, what was
established, what stays open, with the negative guarantees stated plainly.
*Why after steps 1–2:* closure prevents immediate staleness; the temporal result
should be characterized before integration so the capstone is written once.
If sequencing changes by later decision, the capstone must state the temporal
question as the open fence it is today.

**Step 4 — Externalization posture. OPTIONAL, HUMAN DECISION.**
Assemble (and, only if separately decided, file) a submission-ready package for
IIIF community channels: the fit-rule question with measured divergence figures,
the explicit-viewBox recommendation, the viewer-gap documentation, and the
validator's existence as evidence that the proposal is checkable. Source
analysis already exists (`research/community-positioning.md`); nothing here
authorizes external communication.

## 6. Why this order?

Closure precedes synthesis because a capstone built on unresolved ledger items
would need immediate repair. The temporal experiment precedes synthesis because
it is the only remaining research-grade question the lab can answer for itself,
and both possible answers change what the synthesis should say. Externalization
comes last (or in parallel, as preparation only) because no amount of additional
internal experimentation can resolve externally gated questions — packaging them
is the lab's only lever there.

## 7. What is deliberately deferred?

Carried from ratified records (`phase-h3-1…md` §3.4/§6; the H.5 triage series);
none of these blocks the roadmap.

| Item | Trigger for revisiting |
|---|---|
| LabApi guard/dispatch cleanup (harness-only robustness) | A dedicated fix phase, if ever authorized |
| Evidence-writer restructuring / aggregation extraction | The next authorized evidence-regeneration event |
| `rootTextSample` capture-field normalization (churn-noise cosmetic) | Same regeneration event |
| Consumer surveys beyond Ramp/Mirador | A credible new candidate consumer appears |
| Firefox/WebKit re-measurement | A new research question or a relevant engine major change (renames were proven behavior-neutral by byte-reproduction under Chromium) |
| Adapter filename renames | Closed permanently — intentional traceability residue |
| Movement/keyframe vocabulary | Out of scope by standing advice against inventing vocabulary |
| Security-policy expression track | Separate track; not opened |

## 8. Where to go for details?

| Want… | Read |
|---|---|
| Navigation across everything | `research/current-state-index.md` |
| Original question & session verdict (historical) | `research/findings.md` |
| Experiment records | `research/e14-report.md` … `e17-report.md`; `research/e15-e16-final-report.md`; `research/experiment-log.md` |
| Live question register | `research/open-questions.md` |
| The interoperability profile (requirements) | `research/profile-draft.md` |
| Requirement matrix & test design | `research/conformance-matrix.md` |
| Validator implementation record | `research/n6-implementation-report.md` (+ `evidence/n6/`) |
| Real-consumer probe results | `research/viewer-interop-report.md` (+ `evidence/viewer-matrix.json`) |
| Community/spec source analysis | `research/community-positioning.md` (+ `research/n3-source-index.json`) |
| Safe-subset decision | `research/n4-safe-subset.md` |
| Phase-by-phase consolidation history | `research/phase-*.md`; governance in `research/consolidation-map.md` |

This program is a map, not a substitute for those documents.

## 9. Governance / maintenance

This is a mutable planning surface. It does not own scientific claims, normative
requirements, capability verdicts, historical question status, or experimental
conclusions; the relevant owning document remains authoritative, and disputes
resolve in the owner's favor.

Existing repository identifiers (requirement IDs, exclusion IDs, probe IDs,
open-question numbers, AMB-N6-1) remain authoritative wherever cited. Any
program-local shorthand (such as the D-numbers for the questions in §4) is a
subordinate pointer to those owners, never a replacement.

Maintenance rule: edit this file only for priorities, sequence, gates, triggers,
and deferrals; substantive changes to any cited claim belong in the owning
document.

*End of the research program.*