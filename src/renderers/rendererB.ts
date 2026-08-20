import type {
  CanvasInfo,
  ReferenceOverlay,
  ResolvedOverlay,
} from "../lib/types.ts";
import { readSvgRootAttrs } from "../lib/svg.ts";

/**
 * Renderer B: direct reference model. Deliberately simple and NON-STANDARD.
 * Every coordinate is already in Canvas space; there is no selector parsing.
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