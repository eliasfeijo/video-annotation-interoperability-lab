/**
 * Blind Renderer — public surface.
 *
 * Everything an integrator (or the comparison harness) needs to drive the blind
 * renderer independently of the reference implementation.
 */

export * from "./types.ts";
export * from "./selectors.ts";
export { resolveWindow } from "./temporal.ts";
export {
  isActive,
  type TimeWindow,
} from "../primitives/temporal.ts";
// Functions only: the SvgBox/SvgRootAttrs TYPE declarations remain owned by
// ./types.ts to keep the barrel's public surface unchanged.
export {
  readSvgRootAttrs,
  parseViewBox,
  svgInnerContent,
} from "../primitives/svg-root.ts";
export * from "./placement.ts";
export * from "./layers.ts";
export * from "./parser.ts";
export * from "./sanitize.ts";
export * from "./resolver.ts";
export * from "./compositor.ts";