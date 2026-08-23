import type {
  CanvasInfo,
  ReferenceOverlay,
  ResolvedOverlay,
} from "../reference/lib/types.ts";
import { readSvgRootAttrs } from "../primitives/svg-root.ts";

/**
 * Renderer B: direct reference model. Deliberately simple and NON-STANDARD.
 * Every coordinate is already in Canvas space; there is no selector parsing.
 *
 * Oracle path, not a consumer implementation (Phase H.2-B home: src/oracle/).
 * It performs no standards resolution — it lowers oracle data from
 * experiments.ts into the legacy ResolvedOverlay record so it can be compared
 * against Renderer A's resolved sets. It must never be counted as an
 * independent consumer in agreement claims.
 */
export function resolveReference(
  refs: ReferenceOverlay[],
  canvas: CanvasInfo,
): ResolvedOverlay[] {
  return refs.map((ref, i) => ({
    id: ref.id ?? `ref-${i}`,
    startTime: ref.startTime,
    endTime: ref.endTime,
    zIndex: ref.zIndex,
    svgText: ref.svg,
    svgAttrs: readSvgRootAttrs(ref.svg),
    viewport: ref.viewport ?? {
      x: 0,
      y: 0,
      w: canvas.width ?? 0,
      h: canvas.height ?? 0,
    },
    ...(ref.keyframes ? { keyframes: ref.keyframes } : {}),
  }));
}