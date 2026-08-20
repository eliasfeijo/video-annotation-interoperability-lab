# Blind Renderer — Interpretation Packet

Status: normative input to the Blind Renderer (experiment 12/13).

This document is the **only** source of interpretation rules the Blind Renderer may use,
beyond the cited specifications themselves. It contains no Renderer A/B implementation
detail. It is written as if for an independent implementer who has never seen the reference
implementation.

Each rule is classified by provenance:

| Class | Meaning |
|---|---|
| `[NORMATIVE]` | directly stated by a specification |
| `[DERIVED]` | logically derived from one or more normative statements |
| `[CONVENTION]` | application-level rule explicitly introduced by this experiment |
| `[OPEN]` | not determined by the existing standards |

"Normative" here follows RFC 2119: MUST / MUST NOT / SHOULD / SHOULD NOT statements in the
cited specifications. References:

- IIIF Presentation API 3.0: https://iiif.io/api/presentation/3.0/
- IIIF Presentation API 4.0 (draft): https://iiif.io/api/presentation/4.0/
- W3C Web Annotation Data Model: https://www.w3.org/TR/annotation-model/
- W3C Media Fragments 1.0: https://www.w3.org/TR/media-frags/
- SVG 1.1 (2nd ed.): https://www.w3.org/TR/SVG11/ (Chapter 7: Coordinate Systems)

---

## 1. What does `painting` mean?

- `[NORMATIVE]` IIIF 3.0, motivations: "Resources associated with a Canvas by an Annotation
  that has the motivation value `painting` must be presented to the user as the
  representation of the Canvas. The content can be thought of as being of the Canvas."
- `[NORMATIVE]` IIIF 3.0, §5.3 Canvas: "Content that is to be rendered as part of the Canvas
  must be associated by an Annotation that has the motivation value `painting`."
- `[NORMATIVE]` IIIF 4.0: "This specification defines a value for motivation called
  `painting` for associating Content Resources with Containers, which this specification
  calls a Painting Annotation. The verb 'paint' is also used to refer to the associating of a
  Content Resource with a Container by a Painting Annotation."
- `[NORMATIVE]` W3C Web Annotation Data Model, §3.3.5: "The Motivation for an Annotation is a
  reason for its creation." Motivations describe the *why* of the annotation, not the *how*
  of rendering. The W3C motivation vocabulary does **not** include `painting`; `painting` is
  a IIIF-defined extension.
- `[DERIVED]` A body carried by a `painting` annotation is to be composited **into** the
  Canvas's representation (rendered as part of the Canvas surface), not presented elsewhere
  in the UI.
- `[DERIVED]` The `highlighting` motivation (W3C) describes the annotator's intent ("to
  highlight the Target resource or segment of it"); it is **not** a compositing mechanism and
  must not be used to infer overlay rendering semantics.

## 2. What does it mean for the body to be an SVG Image resource?

- `[NORMATIVE]` IIIF 3.0, §5.7 Content Resources: content resources are external web
  resources (images, video, audio, ...) referenced from the body of a `painting` annotation;
  they must have `id` and `type`, and `format` should be the media type of the resource.
- `[NORMATIVE]` W3C Web Annotation, §3.2.2: `Image` is the class for "image resources,
  primarily intended to be seen".
- `[NORMATIVE]` SVG 1.1: an SVG document is a graphical resource; its root `<svg>` element
  establishes a viewport whose size is given by the `width`/`height` attributes (§7.2), a
  user coordinate system (§7.3), and an optional `viewBox` transformation (§7.7).
- `[CONVENTION]` An SVG resource is recognised as a body that paints a graphical layer when
  its `format` is `image/svg+xml` (or, in absence of `format`, its `id` ends in `.svg`).
  This experiment renders only such SVG bodies as graphical overlays. (A `painting`
  annotation may legitimately carry other resource types — e.g. Video — but this experiment
  is scoped to SVG graphical bodies.)

## 3. How does an Annotation target a Canvas region?

- `[NORMATIVE]` IIIF 3.0, §5.6 Annotation: "The URI of the Canvas must be repeated in the
  target property of the Annotation, or the source property of a Specific Resource used in
  the target property."
- `[NORMATIVE]` W3C Web Annotation, §4.2.1 FragmentSelector: a `FragmentSelector` describes a
  segment of a source resource through the fragment component of an IRI; its `value`
  property "MUST" be present.
- `[NORMATIVE]` W3C Media Fragments, §4: name–value pairs in the fragment, separated by `&`,
  e.g. `xywh=…&t=…`.
- `[NORMATIVE]` IIIF 3.0, §5.3: "Parts of Canvases may also be identified by appending a
  fragment to the Canvas's URI, and these parts are still considered to be Canvases."
- `[DERIVED]` The Canvas URI in `target` (or in `target.source`) is the spatial frame of
  reference; a `FragmentSelector` on that target qualifies *which part* of the Canvas the
  annotation's body is painted into.

## 4. What exactly does `xywh` identify?

- `[NORMATIVE]` W3C Media Fragments, §4.2.2: `xywh=x,y,w,h` selects a rectangle; with the
  default pixel unit, x=0,y=0 is the top-left corner; with `percent:`, x and w are
  percentages of the resource width, y and h percentages of the resource height. The
  grammar's unit prefixes are `pixel:` and `percent:`.
- `[NORMATIVE]` IIIF 4.0, §Referencing Parts of Resources: "the x, y, w, and h are in the
  Canvas coordinate space, not the image pixel dimensions space."
- `[NORMATIVE]` IIIF 3.0, §5.3: "Content must not be associated with space ... outside of
  the Canvas's dimensions."
- `[DERIVED]` For a target on a Canvas, `xywh=` identifies a rectangle **in Canvas
  coordinate space** — a spatial part of the Canvas. Percentages (when used) are relative to
  the Canvas width/height respectively.
- `[CONVENTION]` **`pct:` prefix.** The Media Fragments unit prefix for percentages is
  `percent:`; `pct:` is **not** defined there. `pct:` is defined in the IIIF Image API
  (`/pct:x,y,w,h/` region syntax). This experiment's fixtures use `xywh=pct:…` (as the
  reference fixtures did); the Blind Renderer therefore accepts `pct:` as an alias for
  `percent:`. This is an application convention, **not** a Media Fragments fact. A
  standards-pure producer should emit `percent:`.

## 5. How is an SVG resource mapped into the Canvas coordinate system?

- `[NORMATIVE]` IIIF 3.0, §5.3: "Renderers must scale content into the space represented by
  the Canvas".
- `[NORMATIVE]` SVG 1.1, §7.9 Establishing a new viewport: "the bounds of the new viewport
  are defined by the x, y, width and height attributes on the element establishing the new
  viewport" (a nested `<svg>` element establishes a new viewport).
- `[DERIVED]` A `painting` body is scaled into the space of the Canvas part it targets. When
  the body is an SVG document, the renderer establishes an SVG viewport whose position and
  size **equal the targeted Canvas region**, and places the body's SVG root into that
  viewport, applying the SVG viewport→viewBox mapping rules.
- `[CONVENTION]` **Destination = targeted region.** The spatial part identified by `xywh=` on
  the target is treated as the *destination rectangle* for the body. (See §14 below: this is
  derived from "scale content into the space", but the standards do not spell out
  "destination = region" verbatim.)

## 6. What does `viewBox` contribute?

- `[NORMATIVE]` SVG 1.1, §7.7: the `viewBox` is "a rectangle in user space which should be
  mapped to the bounds of the viewport established by the given element, taking into account
  attribute preserveAspectRatio". If absent, no viewBox transformation is applied and the
  user coordinate system equals the viewport coordinate system (1 user unit = 1 viewport px,
  §7.3/§7.10).
- `[DERIVED]` The body SVG's user coordinates are transformed into the destination region
  viewport via its `viewBox` (min-x, min-y, width, height) and `preserveAspectRatio`, exactly
  as SVG would render the SVG as a standalone document in a viewport of that size.

## 7. What does `preserveAspectRatio` contribute?

- `[NORMATIVE]` SVG 1.1, §7.8: `preserveAspectRatio="[align] [meetOrSlice]"`, default
  `xMidYMid meet`:
  - `meet` (default): uniform scale; entire viewBox visible; scaled up as much as possible.
  - `slice`: uniform scale; entire viewport covered.
  - `none`: "Do not force uniform scaling. Scale ... non-uniformly if necessary such that
    the ... bounding box exactly matches the viewport rectangle."
  - Align keywords (`xMin/xMid/xMax` + `yMin/yMid/yMax`) position the scaled viewBox within
    the viewport.
- `[NORMATIVE]` SVG 1.1, §7.8: "preserveAspectRatio only applies when a value has been
  provided for viewBox on the same element. For these elements, if attribute viewBox is not
  provided, then preserveAspectRatio is ignored."
- `[DERIVED]` An SVG body with no `viewBox` therefore maps its user coordinates 1:1 into the
  destination region (stretch to fill, since the region defines the viewport). An SVG body
  with a `viewBox` is fitted into the region per its `preserveAspectRatio` (default
  `xMidYMid meet`).

## 8. What determines z-order?

- `[NORMATIVE]` IIIF 4.0, Annotation Page: "Order within the Annotation Page can be
  significant, as Annotations are assigned an ascending z-index from the first annotation
  encountered when displayed on a Canvas. Annotations with a higher z-index will render in
  front of those with a lower z-index, thus the last Annotation in the Annotation Page will
  display on top of any others that come before it."
- `[NORMATIVE]` IIIF 3.0/4.0, Annotation Page: "Clients should process the Annotation Pages
  and their items in the order given in the Canvas [Container]."
- `[DERIVED]` Rendering order = processing order of `painting` annotations, in the order the
  annotations are encountered across Annotation Pages (and within each page). Later
  annotations paint in front of earlier ones.
- `[CONVENTION]` This experiment assigns each painting SVG body a monotonically increasing
  integer `zIndex` in encounter order (video content is conventionally the first painting
  body; overlay bodies follow). **Note:** IIIF 3.0 does not state the z-order rule at all;
  it only mandates processing order. Assigning z-order from that order is therefore
  `[DERIVED]` from 4.0, but only `[CONVENTION]` under 3.0. (See `docs/iiif-3-vs-4.md`.)

## 9. What happens across multiple Annotation Pages?

- `[NORMATIVE]` IIIF 3.0, §5.5: "Clients should process the Annotation Pages and their items
  in the order given in the Canvas."
- `[DERIVED]` Multiple Annotation Pages are flattened in container order; the ordering rule
  of §8 applies across the flattened sequence. No page "resets" rendering order.
- `[OPEN]` IIIF 4.0 assigns z-index "from the first annotation encountered when displayed on
  a Canvas" — read as a global encounter order this matches the flat model, but the 4.0 text
  explicitly discusses order *within* the Annotation Page and does not explicitly state
  whether the ascending counter continues across pages.

## 10. How is temporal visibility determined?

- `[NORMATIVE]` IIIF 3.0, §5.3: "temporal parts of Canvases may be described by appending a
  t= fragment"; "Spatial and temporal fragments may be combined, using an & character between
  them"; "It is an error to select a region using a dimension that is not defined by the
  Canvas".
- `[NORMATIVE]` W3C Media Fragments, §4.2.1: "The interval is half-open: the begin time is
  considered part of the interval whereas the end time is considered to be the first time
  point that is not part of the interval." `t=10,20` ⇒ `[10,20)`; `t=,20` ⇒ `[0,20)`;
  `t=10` ⇒ `[10, end of resource)`.
- `[NORMATIVE]` W3C Media Fragments, §6.2.2: `t=a,b` with `a >= b` is an error; invalid
  temporal fragments "SHOULD be ignored".
- `[DERIVED]` A painting body with temporal fragment `t=s,e` is visible for wall-clock time
  `t ∈ [s, e)` relative to the Canvas duration. With no temporal fragment, it is visible for
  the whole Canvas duration. With only a start, it is visible from `s` to the end of the
  Canvas.
- `[DERIVED]` "Visible" means the layer is presented; "invisible" means it is not presented.
  The half-open rule makes the interval a deterministic predicate for any real `t`.

## 11. What happens when the body has different intrinsic dimensions?

- `[NORMATIVE]` SVG 1.1, §7.2: the `width`/`height` attributes of the outermost `svg` element
  establish the viewport size of a standalone SVG document.
- `[DERIVED]` When a body SVG is placed into a destination region, the region (not the body's
  own `width`/`height`) establishes the SVG viewport; the body's `width`/`height` attributes
  are superseded by the destination geometry. The body's `viewBox` (if any) then maps user
  space into that viewport.
- `[DERIVED]` Consequently, intrinsic `width`/`height` differing from the `viewBox` do not
  change the final placement once the renderer overrides the viewport geometry.
- `[CONVENTION]` For a body with **no `viewBox` at all**, this experiment behaves as if the
  user coordinate system were the region itself: content drawn at user (x,y) lands at region
  (x,y), scaled by the region/viewBox ratio only if a synthetic viewBox is assumed. The
  Blind Renderer models this case explicitly and reports it, because SVG's own default
  (1:1 user units) is only equivalent to a synthetic `viewBox` when the aspect ratios match.
  This is the one placement sub-rule the standards leave open; see `docs/ambiguities.md`.

## 12. What happens under letterboxing?

- `[OPEN]` Neither IIIF, Web Annotation, nor Media Fragments specifies how a Canvas is mapped
  onto a physical display surface (e.g. letterboxing, aspect-preserving fit, window size).
- `[CONVENTION]` This experiment displays the Canvas with `preserveAspectRatio`-style
  "contain" semantics: the Canvas is scaled uniformly to fit the display area, centered, with
  the remainder of the display area left empty (letterboxed). All Canvas-coordinate geometry
  is then mapped linearly from Canvas units to displayed pixels. The overlay layer is drawn
  over the *displayed* Canvas content, not over the whole display area. This is a display
  convention; it does not change any Canvas-space resolution result.

## 13. Is `[start,end)` actually normative, or merely our chosen convention?

- `[NORMATIVE]` It is normative. W3C Media Fragments §4.2.1 explicitly states the interval is
  half-open ("the end time is considered to be the first time point that is not part of the
  interval"), and §6.1.1 restates: "if we state below that 'the media is played from x to y',
  this means that the frame corresponding to y will not be played." The previous lab's
  labelling of `[start,end)` as a "chosen convention" is superseded: it is the Media
  Fragments interpretation. (What remains an application decision is how a *renderer*
  implements "active at t" — but the interval semantics are normative.)

## 14. Is the target spatial rectangle also the destination rectangle for the body?

- `[DERIVED]` Yes, for this experiment's reading, derived from:
  1. IIIF 3.0 §5.3 — a `#xywh=` part of a Canvas "is still considered to be a Canvas";
  2. IIIF 3.0 §5.3 — "Renderers must scale content into the space represented by the Canvas";
  3. IIIF 4.0 — "Painting Annotations paint Content Resources into Containers".
  Combining: painting a body into a Canvas *part* (a smaller Canvas) scales it into that
  part's space. So the body occupies the target rectangle.
- `[OPEN]` The chain is a derivation, not a verbatim statement. A literal reading of IIIF 4.0
  "the x,y,w,h are in the Canvas coordinate space" identifies the *selection*, not the
  *placement*. An implementer could plausibly interpret `xywh=` as a selection for a body
  that keeps its own intrinsic aspect (e.g. the body drawn at its intrinsic size, anchored at
  the region origin). This experiment treats region-as-destination and documents the choice.
- `[CONVENTION]` The Blind Renderer and the reference both use region-as-destination. The
  comparison records this as the joint convention; a future profile should state it.

## 15. Does IIIF explicitly define the SVG→region mapping, imply it, or leave it open?

- IIIF 3.0 requires "Renderers must scale content into the space represented by the Canvas"
  (§5.3) — an explicit scaling *requirement* without an explicit *algorithm*.
- The algorithm (nested `<svg>` viewport = region; `viewBox` + `preserveAspectRatio` per SVG
  §7.7/§7.8) is supplied by SVG semantics, which are normative for the SVG resource itself.
- The *link* "Canvas region ⇒ SVG viewport" is implied but not stated verbatim ⇒
  `[DERIVED]` (with the residual open question documented in §14 and `docs/ambiguities.md`).

---

## Consolidated rule set the Blind Renderer MUST implement

(Each rule is implementable from the above; nothing else from any renderer is used.)

1. Parse the manifest: find the Canvas (its `width`, `height`, `duration`).
2. Collect `painting` annotations from all AnnotationPages, in container-then-item order.
   Non-`painting` annotations are ignored for rendering.
3. For each `painting` annotation with an SVG body:
   - Resolve the target fragment: `xywh=` → destination rectangle in Canvas units
     (`pct:`/`percent:` resolved against Canvas width/height); `t=` → half-open time window
     against Canvas duration; invalid fragments are dropped (`[NORMATIVE]` Media Fragments
     error handling).
   - No spatial fragment → destination = full Canvas. No temporal fragment → visible for the
     whole Canvas duration.
   - Assign z-order = encounter order (integer, ascending).
   - Compute SVG placement: destination rectangle establishes the SVG viewport; map the
     body's `viewBox`/`preserveAspectRatio` into it per SVG §7.7/§7.8 (default
     `xMidYMid meet`).
4. Visibility predicate: overlay is presented iff `t ∈ [start, end)`.
5. Letterboxing/display mapping is a presentation concern applied after resolution (§12).

## Fixture-targeted adversarial questions (Experiment 12)

The critical experiment is: *same target `xywh=480,270,960,540`, three different body
viewBoxes (`1920x1080`, `1000x1000`, `100x100`). Does the standard stack uniquely determine
the resulting visual placement?*

Answer per this packet:

- The destination region is determined (target region, `[DERIVED]`).
- The mapping of user space into that region is determined by SVG (`viewBox` +
  `preserveAspectRatio` default `xMidYMid meet`) — `[NORMATIVE]`.
- Therefore the visual placement IS uniquely determined for any body that carries a
  `viewBox`. The three viewBoxes produce three different letterboxed crops inside the same
  region. The only non-unique element is the "destination = region" link itself (`[DERIVED]`/
  `[OPEN]`, §14).

A body with **no `viewBox`** is the one genuinely ambiguous case: SVG says 1:1 user units
(`[NORMATIVE]`), while a "scale to fill region" reading (from IIIF "scale content into the
space") would non-uniformly stretch. The renderers must both report what they did for this
case.