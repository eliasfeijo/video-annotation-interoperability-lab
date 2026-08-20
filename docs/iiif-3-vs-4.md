# IIIF Presentation 3.0 vs 4.0 — Semantic Comparison for Blind Renderer

Sources:
- IIIF Presentation API 3.0 (stable), https://iiif.io/api/presentation/3.0/
- IIIF Presentation API 4.0 (draft 4.0.0), https://iiif.io/api/presentation/4.0/

The purpose of this document is to identify whether IIIF 4.0 removes ambiguities that
existed in 3.0 for the "graphical overlay over audiovisual Canvas" use case. Mode A = 3.0
semantics; Mode B = 4.0 semantics. The Blind Renderer keeps the two modes separate.

| Concern | IIIF 3.0 | IIIF 4.0 (draft) | Does 4.0 remove ambiguity? |
|---|---|---|---|
| **Container model** | `Canvas`: "a virtual container that represents a particular view of the object ... provides a frame of reference for the layout of the content, both spatially and temporally." | Introduces the **Container** class with three sub-classes: **Timeline** (temporal only), **Canvas** (bounded 2D, optionally temporal), **Scene** (3D, optionally temporal). Painting Annotations "paint Content Resources into Containers". | Partly. 4.0 makes explicit that temporal-only containers exist (Timeline) and that a Canvas is a 2D + optional temporal frame. For our use case (Canvas) the semantics are unchanged. |
| **painting semantics** | "Resources associated with a Canvas by an Annotation that has the motivation value painting must be presented to the user as the representation of the Canvas. The content can be thought of as being of the Canvas." | "The Content Resource in the body property is painted into the Container by an Annotation whose target property references the id of the Container." "Painting Annotations paint Content Resources into Containers." | Slightly. 4.0 phrases it as an action ("painted into"); 3.0 phrases it as presentation ("must be presented as the representation"). Both mean the body becomes part of the Canvas surface. The 3.0 wording is actually the more operational one for a renderer. |
| **AnnotationPage ordering** | "Clients should process the Annotation Pages and their items in the order given in the Canvas." | "Clients should process the Annotation Pages and their items in the order given in the Container." | No — the ordering requirement is identical (Canvas → Container). |
| **z-order** | **Not stated at all.** Ordering is mandated for *processing*, but no statement says later annotations render in front of earlier ones. | "Order within the Annotation Page can be significant, as Annotations are assigned an ascending z-index from the first annotation encountered when displayed on a Canvas. Annotations with a higher z-index will render in front of those with a lower z-index, thus the last Annotation in the Annotation Page will display on top of any others that come before it." (Explicitly not true for Scenes, which have a z axis.) | **Yes — significant.** 4.0 makes z-order-from-order normative; 3.0 leaves it to the client. Under 3.0 (Mode A) z-order-from-annotation-order is an application convention; under 4.0 (Mode B) it is normative. This is the single biggest 3.0→4.0 change for overlay compositing. Residual ambiguity in 4.0: it discusses order *within a page*; the across-pages counter is only implicit ("first annotation encountered"). |
| **Canvas** | Canvas is a virtual frame of reference; must have rectangular aspect ratio (height/width) and/or duration. | Canvas is a Container subclass; bounded 2D space, optionally bounded temporal range. Same essentials. | No. |
| **Temporal model** | Canvas `duration` property gives extent in time. Temporal parts via `#t=` fragment. | Same, plus a dedicated `Timeline` container for pure-temporal content; "Canvas and Scene with a duration" discuss temporal regions; `timeMode` (trim/loop) exists in 3.0 and is retained. `#t=` used in targets (e.g. `timeline/t1#t=8,10`). | Mostly no. 4.0 adds Timeline as a first-class container for audio-only. For a video Canvas the temporal model is unchanged. |
| **Timeline** | No Timeline class. | New Container sub-class: "a bounded temporal range, without any spatial coordinates." | Yes — new concept; only relevant if the experiment moves to audio-only or pure-temporal containers. Not needed for the video-Canvas overlay case. |
| **Audiovisual content** | Audio/video are content resources (`Sound`/`Video`), painted via `painting` annotations; AV use cases appear in the Cookbook, not the core spec. | Core spec contains dedicated sections "Audio and Video Content" (Use Case 4: 45 single, Use Case 5: Movie with subtitles) with full JSON examples (Video body, Choice, VTT `supplementing`, `timeMode`, `placeholderContainer`). | Yes — 4.0 formally integrates AV into the spec body. The Movie with Subtitles use case is a direct precedent for "video + graphical/text layers on one Canvas". |
| **Target fragments** | "Parts of Canvases may also be identified by appending a fragment to the Canvas's URI"; `#xywh=` spatial, `#t=` temporal, combinable with `&`; parts are "still considered to be Canvases". | "Referencing Parts of Resources": media fragments define "a temporal and 2D spatial region"; explicit statement that "the x, y, w, and h are in the Canvas coordinate space, not the image pixel dimensions space." | Partly. The "Canvas coordinate space" clarification is explicit in 4.0 (3.0 implies it via the part-is-a-Canvas rule). |
| **Spatial targeting** | `xywh=` in Canvas units (implied). | `xywh=` in Canvas units (explicit). | Yes for explicitness; the interpretation is the same. |
| **SVG content resources** | SVG is just a content resource (Image + `image/svg+xml`); no special treatment. | Same — no special SVG treatment. | No. |
| **Renderers must scale content** | "Renderers must scale content into the space represented by the Canvas" (§5.3) — explicit, in the stable spec. | Restated implicitly via "paint into Containers" and "renderers scale content into the Canvas space" (the packet's summary of 3.0; 4.0 keeps the requirement). | No — this crucial renderer-facing rule exists in 3.0 already. |

## Summary: what 4.0 actually changes for this experiment

1. **z-order from annotation order becomes normative** (the headline change; under 3.0 it is
   a convention).
2. **"Canvas coordinate space" for `xywh` becomes explicit** (under 3.0 it is derived).
3. **AV use cases move into the spec body** (Movie with Subtitles is a direct precedent for
   layered graphical annotation on video).
4. **Timeline/Scene containers are introduced** — out of scope for this experiment, but they
   demonstrate the Container abstraction into which the video Canvas case fits.

## What 4.0 does NOT change

- The temporal `#t=` fragment semantics (still Media Fragments, half-open interval).
- The `xywh=` spatial fragment syntax (still Media Fragments; `pct:`/`percent:` caveat
  unchanged — 4.0 does not define percentage fragments in the Presentation layer either).
- SVG body placement: neither version specifies an SVG→region algorithm; both rely on
  SVG's own viewport/viewBox/preserveAspectRatio semantics plus the "scale content into the
  space" requirement.
- Letterboxing / display mapping: absent from both versions.

## Consequence for the two modes

- **Mode A (3.0):** the blind renderer derives everything from: painting presentation
  requirement, scale-into-Canvas requirement, Media Fragments (temporal + spatial, half-open,
  percent) and SVG (viewBox/preserveAspectRatio). z-order from order is `[CONVENTION]`.
- **Mode B (4.0):** identical except z-order-from-order is `[NORMATIVE]` and
  "xywh in Canvas space" is `[NORMATIVE]` (vs `[DERIVED]` in A).

In practice the two modes produce **identical resolved overlays** for every fixture in this
experiment; only the *provenance class* of two rules changes. That itself is a finding: the
3.0 → 4.0 transition does not alter any rendered output for this use case.