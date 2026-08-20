/**
 * Blind Renderer — Media Fragments 1.0 parser.
 *
 * Parses the fragment grammar from https://www.w3.org/TR/media-frags/:
 *   - temporal dimension `t=` (NPT seconds; `npt:` prefix optional)
 *   - spatial dimension `xywh=` (pixel | percent)
 *
 * Rule provenance (see docs/blind-interpretation-rules.md):
 *   - half-open interval, `t=a,b` with `a>=b` is an error        [NORMATIVE MF §4.2.1, §6.2.2]
 *   - `percent:` unit prefix                                     [NORMATIVE MF §4.2.2]
 *   - `pct:` accepted as an alias for `percent:`                 [CONVENTION]
 *   - invalid fragments are dropped (SHOULD ignore)              [NORMATIVE MF §6.2]
 *   - last valid occurrence of a dimension wins                  [NORMATIVE MF §5.1.2]
 */

import type {
  MediaFragment,
  SpatialFragment,
  TemporalFragment,
} from "./types.ts";

const NPT_RE = /^npt:/i;

export function parseTemporal(raw: string): TemporalFragment | null {
  let body = raw.trim();
  const m = NPT_RE.exec(body);
  if (m) body = body.slice(m[0].length);
  if (body === "") return null;
  if (body.startsWith(",")) {
    // t=,end   => [0, end)
    const end = parseFloat(body.slice(1));
    if (!Number.isFinite(end)) return null;
    return { start: 0, end };
  }
  const parts = body.split(",");
  if (parts.length === 1) {
    const start = parseFloat(parts[0]!);
    if (!Number.isFinite(start)) return null;
    return { start };
  }
  if (parts.length === 2) {
    const start = parseFloat(parts[0]!);
    const end = parts[1] === "" ? undefined : parseFloat(parts[1]!);
    if (!Number.isFinite(start)) return null;
    if (end !== undefined) {
      if (!Number.isFinite(end)) return null;
      if (end < start) return null; // a >= b is an error (MF §6.2.2)
    }
    return { start, ...(end !== undefined ? { end } : {}) };
  }
  return null;
}

export function parseSpatial(
  raw: string,
  canvasWidth?: number,
  canvasHeight?: number,
): SpatialFragment | null {
  let body = raw.trim();
  let percent = false;
  const unit = /^(pct|percent|pixel):/i.exec(body);
  if (unit) {
    const name = unit[1]!.toLowerCase();
    percent = name === "pct" || name === "percent";
    body = body.slice(unit[0].length);
  }
  const parts = body.split(",");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => parseFloat(p));
  if (nums.some((n) => !Number.isFinite(n))) return null;
  let [x = 0, y = 0, w = 0, h = 0] = nums as [number, number, number, number];
  if (percent) {
    if (canvasWidth) x = (x / 100) * canvasWidth;
    if (canvasHeight) y = (y / 100) * canvasHeight;
    if (canvasWidth) w = (w / 100) * canvasWidth;
    if (canvasHeight) h = (h / 100) * canvasHeight;
  }
  if (w <= 0 || h <= 0) return null;
  // MF §6.3.3: top-left outside the media is invalid.
  if (canvasWidth && x >= canvasWidth) return null;
  if (canvasHeight && y >= canvasHeight) return null;
  return { x, y, w, h, percent };
}

/**
 * Parse one Media Fragment value string. `&`-separated name=value pairs;
 * `t` and `xywh` are recognised; other dimensions are ignored (MF §5.1.2).
 * The last valid occurrence of each dimension wins (MF §5.1.2).
 */
export function parseFragmentValue(
  value: string,
  canvasWidth?: number,
  canvasHeight?: number,
): MediaFragment {
  const out: MediaFragment = {};
  for (const part of value.split("&")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const name = part.slice(0, eq).trim();
    const val = part.slice(eq + 1).trim();
    if (name === "t") {
      const t = parseTemporal(val);
      if (t) out.temporal = t;
    } else if (name === "xywh") {
      const s = parseSpatial(val, canvasWidth, canvasHeight);
      if (s) out.spatial = s;
    }
  }
  return out;
}