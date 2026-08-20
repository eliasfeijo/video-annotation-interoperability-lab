/**
 * Blind Renderer — SVG security classification + allowlist sanitization.
 *
 * Case 13 requires the renderer to *explicitly classify* unsafe/unsupported
 * SVG features rather than silently accepting them. This module:
 *
 *   1. classifies the presence of each feature of concern;
 *   2. rejects the body outright if it carries a blocking feature;
 *   3. otherwise returns an allowlisted sanitized copy of the SVG markup.
 *
 * The allowlist covers SVG 1.1 drawing primitives and structural elements that
 * are inert when placed inside a host document. Everything else is stripped.
 * External references (href/xlink:href pointing off-host), scripts, embedded
 * HTML, filters, <use>, <style>, <image> and event-handler attributes are
 * treated as unsafe (mirroring the previous lab's finding #8: untrusted SVG is
 * NOT safe merely because it is SVG).
 */

import type {
  SecurityClassification,
  SecurityLevel,
  SvgFeatureName,
} from "./types.ts";

export type { SecurityLevel, SvgFeatureName };
export type SvgClassification = Omit<SecurityClassification, "sanitized">;

const DANGEROUS_TAGS = new Set([
  "script",
  "foreignObject",
  "image",
  "style",
  "filter",
  "use",
  "animate",
  "animateTransform",
  "animateMotion",
  "set",
]);

const BLOCKING = new Set<SvgFeatureName>([
  "script",
  "foreignObject",
  "externalHref",
  "eventHandler",
]);

const ALLOWED_TAGS = new Set([
  "svg",
  "g",
  "defs",
  "circle",
  "ellipse",
  "rect",
  "line",
  "path",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "textPath",
  "title",
  "desc",
  "symbol",
  "marker",
  "linearGradient",
  "radialGradient",
  "stop",
  "clipPath",
  "mask",
  "pattern",
]);

const ALLOWED_ATTRS = new Set([
  // geometry / styling
  "x",
  "y",
  "x1",
  "y1",
  "x2",
  "y2",
  "cx",
  "cy",
  "r",
  "rx",
  "ry",
  "width",
  "height",
  "d",
  "points",
  "viewBox",
  "preserveAspectRatio",
  "transform",
  "fill",
  "fill-opacity",
  "stroke",
  "stroke-width",
  "stroke-opacity",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "stroke-dashoffset",
  "opacity",
  "font-size",
  "font-family",
  "font-weight",
  "font-style",
  "text-anchor",
  "dominant-baseline",
  "letter-spacing",
  "class",
  "id",
  "style",
  "offset",
  "stop-color",
  "stop-opacity",
  "gradientUnits",
  "gradientTransform",
  "spreadMethod",
  "clip-path",
  "mask",
  "marker-start",
  "marker-mid",
  "marker-end",
  "xmlns",
  "xmlns:xlink",
  "version",
  "data-overlay-id",
]);

/** Classify an SVG document's security-relevant features. */
export function classifySvg(svgText: string): SvgClassification {
  const features: Record<SvgFeatureName, boolean> = {
    script: /<script\b/i.test(svgText),
    foreignObject: /<foreignObject\b/i.test(svgText),
    image: /<image\b/i.test(svgText),
    style: /<style\b/i.test(svgText),
    filter: /<filter\b/i.test(svgText),
    use: /<use\b/i.test(svgText),
    a: /<a\b/i.test(svgText),
    animate: /<animate\b|<animateTransform\b|<set\b/i.test(svgText),
    externalHref: /(?:href|xlink:href)\s*=\s*"(?!data:image|\/|#)/i.test(
      svgText,
    ),
    eventHandler: /\son[a-z]+\s*=/i.test(svgText),
    xmlnsExternal: /xmlns(?::\w+)?\s*=\s*"(?!http:\/\/www\.w3\.org\/2000\/svg)"/i.test(
      svgText,
    ),
  };
  const present = (Object.keys(features) as SvgFeatureName[]).filter(
    (k) => features[k],
  );
  const blocking = present.filter((f) => BLOCKING.has(f));
  const level: SecurityLevel =
    blocking.length > 0 ? "unsafe" : present.length > 0 ? "unsupported" : "safe";
  return { level, features, blocking };
}

/** Allowlist sanitizer: keep only allowlisted tags/attrs; drop everything else. */
export function sanitizeSvg(svgText: string): string {
  // Parse into a DOM when available (browser), else a light lexical scrub.
  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
    const root = doc.documentElement;
    if (root?.tagName?.toLowerCase() !== "svg") return "";
    const sanitized = sanitizeNode(root);
    return sanitized ? sanitized.outerHTML : "";
  }
  // Node fallback: remove dangerous elements and non-allowed attributes via
  // a conservative tag/attr regex scrub. (Used only for classification tests.)
  return scrubText(svgText);
}

function sanitizeNode(node: Element): Element | null {
  const svgns = "http://www.w3.org/2000/svg";
  const name = node.tagName.toLowerCase();
  // Anything not in the allowlist (including the dangerous tags) is dropped
  // entirely, together with its subtree.
  if (!ALLOWED_TAGS.has(name)) return null;
  const clone = document.createElementNS(svgns, name);
  for (const attr of Array.from(node.attributes)) {
    const an = attr.name.toLowerCase();
    if (ALLOWED_ATTRS.has(an) && !/\son[a-z]+$/.test(an)) {
      if (an === "style") {
        const kept = sanitizeStyle(attr.value);
        if (kept) clone.setAttribute(an, kept);
      } else {
        clone.setAttribute(an, attr.value);
      }
    }
  }
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      clone.appendChild(child.cloneNode(true));
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const c = sanitizeNode(child as Element);
      if (c) clone.appendChild(c);
    }
  }
  return clone;
}

const STYLE_ALLOWED = /^(fill|stroke|stroke-width|fill-opacity|stroke-opacity|opacity|font-size|font-family|font-weight|text-anchor)\s*:/i;

function sanitizeStyle(value: string): string {
  return value
    .split(";")
    .map((s) => s.trim())
    .filter((s) => STYLE_ALLOWED.test(s))
    .join(";");
}

/** Conservative text scrub used when no DOM is available. */
function scrubText(svgText: string): string {
  const withoutComments = svgText.replace(/<!--[\s\S]*?-->/g, "");
  let out = withoutComments.replace(
    /<(\/?)(script|foreignObject|image|style|filter|use|animate\w*|set)\b[^>]*>/gi,
    "",
  );
  out = out.replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, "");
  out = out.replace(/(?:href|xlink:href)\s*=\s*"(?!data:image|\/|#)[^"]*"/gi, "");
  return out;
}