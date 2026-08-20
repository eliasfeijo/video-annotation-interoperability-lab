import type { MediaFragment, SpatialFragment, TemporalFragment } from "./types.ts";

/**
 * Media Fragments 1.0 syntax (https://www.w3.org/TR/media-frags/), subset:
 *   - `t=start[,end]`        (also accepts the `npt:` scheme prefix)
 *   - `xywh=x,y,w,h`         pixel form
 *   - `xywh=pct:x,y,w,h`     percentage form
 *   - combined with `&`, e.g. `xywh=0,0,960,540&t=10,15`
 *
 * Unknown sub-fragments are ignored (per spec, they are for other consumers).
 */

const NPT_RE = /^npt:/i;

export function parseTemporal(raw: string): TemporalFragment | null {
  let body = raw.trim();
  if (NPT_RE.test(body)) body = body.slice(NPT_RE.exec(body)![0].length);
  if (!body) return null; // "t=" alone: whole resource
  const parts = body.split(",");
  if (parts.length === 1) {
    const s = parseFloat(parts[0]!);
    if (!Number.isFinite(s)) return null;
    return { start: s };
  }
  if (parts.length === 2) {
    const s = parseFloat(parts[0]!);
    const e = parseFloat(parts[1]!);
    if (parts[0] === "") {
      const end = Number.isFinite(e) ? e : undefined;
      return end === undefined ? { start: 0 } : { start: 0, end };
    }
    if (!Number.isFinite(s)) return null;
    if (parts[1] === "") return { start: s };
    if (!Number.isFinite(e)) return null;
    if (e < s) return null; // invalid range
    return { start: s, end: e };
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
  if (body.startsWith("pct:")) {
    percent = true;
    body = body.slice(4);
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
  return { x, y, w, h };
}

/**
 * Parse a single Media Fragment value string per Media Fragments 1.0.
 * Returns only `t` and `xywh` sub-fragments; other parts are dropped.
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
    const key = part.slice(0, eq).trim();
    const val = part.slice(eq + 1).trim();
    if (key === "t") {
      const t = parseTemporal(val);
      if (t) out.temporal = t;
    } else if (key === "xywh") {
      const s = parseSpatial(val, canvasWidth, canvasHeight);
      if (s) out.spatial = s;
    }
  }
  return out;
}