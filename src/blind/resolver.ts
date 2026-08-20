/**
 * Blind Renderer — semantic resolver.
 *
 * Given a IIIF Presentation manifest (Mode A: 3.0, Mode B: 4.0), lower it into
 * the blind renderer's own `BlindOverlay[]` model using only the interpretation
 * packet (docs/blind-interpretation-rules.md) and the standards it cites.
 *
 * Deliberately independent of src/reference/lib/iiif.ts. The only shared input
 * is the manifest JSON and an SVG fetcher supplied by the caller.
 */

import type {
  BlindManifest,
  BlindOverlay,
  IiifMode,
  Placement,
  Provenance,
  Rect,
  SecurityClassification,
} from "./types.ts";
import { findCanvas, collectPaintingInputs, mergeFragments } from "./parser.ts";
import { resolveWindow, isActive, type TimeWindow } from "./temporal.ts";
import { computePlacement, canvasPointOf } from "./placement.ts";
import { readSvgRootAttrs } from "./svg-root.ts";
import { classifySvg, sanitizeSvg } from "./sanitize.ts";
import { zProvenance, isPainting } from "./layers.ts";

export type SvgFetcher = (url: string) => Promise<string>;

export interface ResolveBlindOptions {
  /** IIIF mode: "A" = Presentation 3.0, "B" = Presentation 4.0 draft. */
  mode?: IiifMode;
}

export async function resolveBlindManifest(
  manifest: any,
  fetchSvg: SvgFetcher,
  options: ResolveBlindOptions = {},
): Promise<BlindManifest> {
  const mode: IiifMode = options.mode ?? "A";
  const canvasNode = findCanvas(manifest);
  if (!canvasNode) throw new Error("no Canvas in manifest");

  const canvas = {
    id: String(canvasNode.id ?? ""),
    width: typeof canvasNode.width === "number" ? canvasNode.width : 0,
    height: typeof canvasNode.height === "number" ? canvasNode.height : 0,
    duration:
      typeof canvasNode.duration === "number" ? canvasNode.duration : null,
  };

  const inputs = collectPaintingInputs(canvasNode, canvas.width, canvas.height);

  let videoUrl: string | null = null;
  const overlays: BlindOverlay[] = [];
  const zProvenanceClass = zProvenance(mode);

  // Z-order: ascending in painting-annotation encounter order; the LAST painted
  // SVG is on top (IIIF 4.0 normative; 3.0 convention per the packet §7).
  let paintIndex = 0;

  for (const input of inputs) {
    if (!isPainting(input.annotation)) continue;
    const target = input.target;
    if (!target) continue;

    for (const body of input.bodies) {
      if (body.isVideo) {
        if (!videoUrl) videoUrl = body.url;
        continue;
      }

      const fragment = mergeFragments(target.fragments);
      const window = resolveWindow(fragment.temporal, canvas.duration);
      const dest: Rect = fragment.spatial
        ? {
            x: fragment.spatial.x,
            y: fragment.spatial.y,
            w: fragment.spatial.w,
            h: fragment.spatial.h,
          }
        : { x: 0, y: 0, w: canvas.width, h: canvas.height };

      let svgText = "";
      try {
        svgText = await fetchSvg(body.url);
      } catch {
        // Body could not be fetched; drop the overlay (same as Renderer A).
        continue;
      }

      const attrs = readSvgRootAttrs(svgText);
      const placement = computePlacement({ destination: dest, attrs });
      const sec = classifySvg(svgText);
      const security: SecurityClassification = {
        ...sec,
        sanitized: sec.level === "unsafe" ? null : sanitizeSvg(svgText),
      };

      const rules = buildRules({
        mode,
        zIndex: paintIndex,
        zProvenanceClass,
        temporal: fragment.temporal,
        spatial: fragment.spatial,
        placement,
      });

      overlays.push({
        id: String(input.id || body.url || `blind-${paintIndex}`),
        startTime: window.start,
        endTime: window.end,
        zIndex: paintIndex++,
        svgText,
        svgAttrs: attrs,
        destination: dest,
        placement,
        security,
        rules,
        mode,
      });
    }
  }

  return { canvas, videoUrl, overlays, mode };
}

export { isActive, canvasPointOf };
export type { TimeWindow, Placement };

interface RuleInput {
  mode: IiifMode;
  zIndex: number;
  zProvenanceClass: Provenance;
  temporal: { start: number; end?: number } | undefined;
  spatial: { x: number; y: number; w: number; h: number } | undefined;
  placement: Placement;
}

function buildRules(input: RuleInput) {
  const rules = [] as { rule: string; provenance: Provenance }[];

  if (input.temporal) {
    rules.push({ rule: "temporal half-open interval [start,end)", provenance: "NORMATIVE" });
  } else {
    rules.push({ rule: "no temporal fragment => whole Canvas duration", provenance: "DERIVED" });
  }
  if (input.spatial) {
    rules.push({
      rule: `spatial target => destination region at (${input.spatial.x},${input.spatial.y}) ${input.spatial.w}x${input.spatial.h}`,
      provenance: "NORMATIVE",
    });
  } else {
    rules.push({ rule: "no spatial fragment => whole Canvas region", provenance: "DERIVED" });
  }
  rules.push({
    rule: `z-order = encounter order (paintIndex=${input.zIndex})`,
    provenance: input.zProvenanceClass,
  });
  rules.push({
    rule: `svg placement mode=${input.placement.mode} into destination region`,
    provenance: input.placement.viewBox ? "NORMATIVE" : "OPEN",
  });
  return rules;
}