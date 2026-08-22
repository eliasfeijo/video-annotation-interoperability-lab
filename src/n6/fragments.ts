/**
 * N6 — strict Media Fragments parser for conformance validation.
 *
 * Scope (R-S6a/R-S6b/R-S8a, profile-draft.md Parts 4 & 8):
 *   - `t=` temporal dimension: half-open interval [begin, end)   [NORMATIVE MF §4.2.1]
 *   - `xywh=` spatial dimension: `pixel:` / `percent:` prefixes,
 *     percent split PER AXIS (x,w of width; y,h of height)       [NORMATIVE MF §4.2.2]
 *   - `pct:` accepted as alias for `percent:`; canonical
 *     serialization remains `percent:`                           [PROFILE R-S6b]
 *   - Web Annotation FragmentSelector values carry the same
 *     fragment-value grammar                                     [NORMATIVE WA §4.2.1]
 *
 * Deliberate differences from src/blind/selectors.ts (consumer behavior):
 *   - Malformed fragments are REPORTED, never silently dropped.
 *   - Out-of-range-but-well-formed values are ACCEPTED at syntax level;
 *     invalid/out-of-bounds semantic handling is an E14-era [OPEN] fence that
 *     N5 deliberately preserves (profile-draft.md R-S6a Non-goal).
 *
 * Unknown named dimensions are ignored (MF §5.1.2), matching the consumer parser.
 * A repeated dimension must itself be well-formed; any malformed occurrence
 * yields a rejection entry (MF §5.1.2 "last valid wins" governs consumers,
 * not producer syntax validity).
 */

export interface NormalizedTemporal {
  /** Canonical half-open interval notation, e.g. "[10,20)". */
  intervalNotation: string;
  start: number;
  end?: number;
}

export interface NormalizedSpatial {
  /** Canonical unit prefix (`percent:` even when authored as `pct:`). */
  canonicalPrefix: "pixel" | "percent";
  percent: boolean;
  /**
   * Resolved axis values: Canvas units when media dimensions were supplied,
   * otherwise the raw percentages (percent=true).
   */
  x: number;
  y: number;
  w: number;
  h: number;
}

export type AcceptedDimension =
  | { dimension: "t"; value: NormalizedTemporal }
  | { dimension: "xywh"; value: NormalizedSpatial };

export interface RejectedDimension {
  dimension: string;
  raw: string;
  reason: string;
}

export interface FragmentValueOutcome {
  accepted: AcceptedDimension[];
  rejected: RejectedDimension[];
}

const NPT_RE = /^npt:/i;

function toNumber(part: string): number | null {
  const trimmed = part.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

/** Parse one `t=` value. Grammar: ["npt:"] (t | ,end | start[,end]). */
export function parseTemporalStrict(
  raw: string,
): { ok: true; value: NormalizedTemporal } | { ok: false; reason: string } {
  let body = raw.trim();
  const m = NPT_RE.exec(body);
  if (m) body = body.slice(m[0].length);
  if (body === "") {
    return { ok: false, reason: "empty temporal value" };
  }
  const parts = body.split(",");
  if (parts.length > 2) {
    return { ok: false, reason: `expected at most 2 components, got ${parts.length}` };
  }
  if (parts.length === 1) {
    if (parts[0]!.trim() === "") {
      return { ok: false, reason: "empty temporal component" };
    }
    const start = toNumber(parts[0]!);
    if (start === null) {
      return { ok: false, reason: `non-numeric start "${parts[0]!.trim()}"` };
    }
    return {
      ok: true,
      value: {
        start,
        intervalNotation: `[${fmt(start)},∞)`,
      },
    };
  }
  // Two components: start[,end]; empty start means 0 (t=,end); empty end is open.
  const startRaw = parts[0]!;
  const endRaw = parts[1]!;
  let start: number;
  if (startRaw.trim() === "") {
    start = 0;
  } else {
    const s = toNumber(startRaw);
    if (s === null) {
      return { ok: false, reason: `non-numeric start "${startRaw.trim()}"` };
    }
    start = s;
  }
  let end: number | undefined;
  if (endRaw.trim() !== "") {
    const e = toNumber(endRaw);
    if (e === null) {
      return { ok: false, reason: `non-numeric end "${endRaw.trim()}"` };
    }
    if (e < start) {
      // MF §4.2.1/§6.2.2 discipline retained from the consumer parser.
      return { ok: false, reason: `end ${e} before start ${start}` };
    }
    end = e;
  }
  return {
    ok: true,
    value: {
      start,
      ...(end !== undefined ? { end } : {}),
      intervalNotation: `[${fmt(start)},${end !== undefined ? fmt(end) : "∞"})`,
    },
  };
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n);
}

/**
 * Parse one `xywh=` value. Grammar: [prefix:]x,y,w,h — exactly four numeric
 * components; positive extent. Prefixes: `pixel:` (default), `percent:`,
 * and the profile alias `pct:` (normalized to `percent:`).
 */
export function parseSpatialStrict(
  raw: string,
  mediaWidth?: number,
  mediaHeight?: number,
): { ok: true; value: NormalizedSpatial } | { ok: false; reason: string } {
  let body = raw.trim();
  let percent = false;
  const unit = /^(pixel|percent|pct):/i.exec(body);
  if (unit) {
    const name = unit[1]!.toLowerCase();
    percent = name === "percent" || name === "pct";
    body = body.slice(unit[0].length);
  }
  const parts = body.split(",");
  if (parts.length !== 4) {
    return {
      ok: false,
      reason: `expected 4 comma-separated components, got ${parts.length}`,
    };
  }
  const nums = parts.map((p) => toNumber(p));
  const badIndex = nums.findIndex((n) => n === null);
  if (badIndex !== -1) {
    return { ok: false, reason: `non-numeric component "${parts[badIndex!]!.trim()}"` };
  }
  const [x = 0, y = 0, w = 0, h = 0] = nums as [number, number, number, number];
  if (!(w > 0) || !(h > 0)) {
    return { ok: false, reason: `non-positive extent (${w},${h})` };
  }
  if (!percent) {
    return {
      ok: true,
      value: { canonicalPrefix: "pixel", percent: false, x, y, w, h },
    };
  }
  // Percent coordinates split PER AXIS (MF §4.2.2): x,w fractions of width;
  // y,h fractions of height. Identical for `percent:` and alias `pct:`.
  const rx = mediaWidth !== undefined ? (x / 100) * mediaWidth : x;
  const rw = mediaWidth !== undefined ? (w / 100) * mediaWidth : w;
  const ry = mediaHeight !== undefined ? (y / 100) * mediaHeight : y;
  const rh = mediaHeight !== undefined ? (h / 100) * mediaHeight : h;
  return {
    ok: true,
    value: { canonicalPrefix: "percent", percent: true, x: rx, y: ry, w: rw, h: rh },
  };
}

/**
 * Parse one fragment VALUE string: `&`-separated name=value pairs.
 * Returns every accepted dimension and every malformed occurrence.
 */
export function parseFragmentValueStrict(
  value: string,
  mediaWidth?: number,
  mediaHeight?: number,
): FragmentValueOutcome {
  const outcome: FragmentValueOutcome = { accepted: [], rejected: [] };
  for (const part of value.split("&")) {
    const eq = part.indexOf("=");
    if (eq === -1) {
      if (part.trim() !== "") {
        outcome.rejected.push({
          dimension: part.trim(),
          raw: part.trim(),
          reason: "component without name=value structure",
        });
      }
      continue;
    }
    const name = part.slice(0, eq).trim();
    const val = part.slice(eq + 1).trim();
    if (name === "t") {
      const r = parseTemporalStrict(val);
      if (r.ok) outcome.accepted.push({ dimension: "t", value: r.value });
      else outcome.rejected.push({ dimension: name, raw: val, reason: r.reason });
    } else if (name === "xywh") {
      const r = parseSpatialStrict(val, mediaWidth, mediaHeight);
      if (r.ok) outcome.accepted.push({ dimension: "xywh", value: r.value });
      else outcome.rejected.push({ dimension: name, raw: val, reason: r.reason });
    }
    // Other named dimensions are ignored per MF §5.1.2.
  }
  return outcome;
}

/**
 * Extract the fragment component from a target reference: accepts a bare
 * fragment value ("t=10,20"), "#t=10,20", or a full URI with "#fragment".
 */
export function extractFragmentValue(target: string): string | null {
  const hash = target.indexOf("#");
  if (hash === -1) {
    // Bare fragment values (FragmentSelector.value form) contain "=" pairs.
    return /^[A-Za-z]+=/.test(target.trim()) ? target.trim() : null;
  }
  const frag = target.slice(hash + 1).trim();
  return frag === "" ? null : frag;
}
