import type { SvgSanitizer } from "../renderers/dom.ts";

/**
 * Security/allowlist experiment.
 *
 * The renderer can be run with or without this allowlist. It exists to measure
 * whether (a) a minimal SVG profile is workable and (b) how much of the surface
 * must be rejected on security grounds. It is NOT a production-grade sanitizer
 * (subset handling, namespace checks and URL scheme checks are minimal).
 */

export const ALLOWED_ELEMENTS = new Set([
  "svg", "g", "defs", "marker", "path", "line", "polyline", "polygon",
  "rect", "circle", "ellipse", "text", "tspan", "title", "desc",
]);

export const ALLOWED_ATTRIBUTES = new Set([
  // structural
  "id", "data-name", "class",
  // geometry
  "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry",
  "width", "height", "viewbox", "preserveaspectratio", "d", "points",
  "transform", "dx", "dy", "rotate",
  // paint
  "fill", "stroke", "fill-opacity", "stroke-opacity", "opacity",
  "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-dasharray",
  "fill-rule", "clip-rule", "marker-start", "marker-mid", "marker-end",
  "font-size", "font-family", "font-weight", "font-style", "text-anchor",
  "dominant-baseline", "letter-spacing",
  // marker
  "refx", "refy", "markerwidth", "markerheight", "orient", "markerunits", "markergradientunits",
]);

export const REJECTED_ELEMENTS = [
  "script", "foreignObject", "a", "image", "use", "filter", "feImage", "feFlood",
  "iframe", "object", "embed", "audio", "video", "style", "link", "meta",
];

/** Reject prefixes indicating external or dynamic behavior. */
export function isUnsafeUrl(value: string): boolean {
  const v = value.trim().toLowerCase();
  return (
    /^(javascript|data|file|vbscript):/.test(v) ||
    /^\/\//.test(v)
  );
}

/**
 * Allowlist-based sanitizer. Parses with DOMParser (browser only) and removes
 * every element/attribute not on the allowlists, plus unsafe URLs.
 */
export const allowlistSanitizer: SvgSanitizer = (svg) => {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  if (doc.querySelector("parsererror")) return svg;
  const root = doc.documentElement;
  const walk = (node: Element): void => {
    const children = Array.from(node.children);
    for (const child of children) {
      const tag = child.tagName.toLowerCase();
      if (!ALLOWED_ELEMENTS.has(tag)) {
        child.remove();
        continue;
      }
      for (const attr of Array.from(child.attributes)) {
        const name = attr.name.toLowerCase();
        const isLinkRef = /^(xlink:href|href)$/.test(attr.name.toLowerCase());
        if (!ALLOWED_ATTRIBUTES.has(name.replace(/^xlink:/, "")) && !isLinkRef) {
          child.removeAttribute(attr.name);
          continue;
        }
        if (name === "href" || name === "xlink:href") {
          if (isUnsafeUrl(attr.value)) child.removeAttribute(attr.name);
        }
        if (/^on/i.test(name)) child.removeAttribute(attr.name);
      }
      walk(child);
    }
  };
  walk(root);
  return new XMLSerializer().serializeToString(root);
};

export const identitySanitizer: SvgSanitizer = (svg) => svg;