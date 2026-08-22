/**
 * Experiment E14 — comparison harness.
 *
 * Compares the semantic resolution records produced by independent renderers
 * (Renderer A, Blind Renderer, Native Renderer) for the same manifest, so the
 * report can distinguish agreement, principled divergence (recorded OPEN /
 * DERIVED / CONVENTION), and outright contradiction (a genuine standards gap
 * or a renderer bug).
 *
 * Overlays are aligned by (startTime, zIndex) — ids are synthesized per
 * renderer and are not comparable.
 */

import type {
  E14Manifest,
  E14Overlay,
  E14Placement,
  Provenance,
  RendererName,
} from "./types.ts";

export interface OverlayDiff {
  overlayIndex: number;
  overlayId: string;
  field: string;
  a: string;
  b: string;
  classification: Provenance;
}

export interface RendererPair {
  a: RendererName;
  b: RendererName;
  diffs: OverlayDiff[];
}

export interface E14Comparison {
  byPair: RendererPair[];
  /** Short verdict strings, e.g. "a==blind", "a!=native". */
  verdicts: string[];
  overlayCount: Partial<Record<RendererName, number>>;
}

const RENDERERS: RendererName[] = ["a", "blind", "native"];

function round(n: number): string {
  return (Math.round(n * 1e6) / 1e6).toString();
}

function rectKey(r: { x: number; y: number; w: number; h: number }): string {
  return `${round(r.x)},${round(r.y)},${round(r.w)},${round(r.h)}`;
}

function placementKey(p: E14Placement): string {
  const nested = p.nested
    ? `|nested(${round(p.nested.innerWidth)}x${round(p.nested.innerHeight)} s=${round(p.nested.scaleX)},${round(p.nested.scaleY)} off=${round(p.nested.offsetX)},${round(p.nested.offsetY)})`
    : "";
  return `${p.mode}|vp=${rectKey(p.viewport)}|s=${p.scale == null ? "null" : round(p.scale)}|t=${round(p.translation.x)},${round(p.translation.y)}${nested}`;
}

/** Provenance classes carried by an overlay's rules (for reporting). */
export function ruleProvenances(ov: E14Overlay): Provenance[] {
  const seen: Provenance[] = [];
  for (const r of ov.rules) {
    if (!seen.includes(r.provenance)) seen.push(r.provenance);
  }
  return seen;
}

/**
 * Classify a single field divergence. Special-cases the known E14 question
 * (SVG-as-image, no viewBox) and records the rest by the involved rules.
 */
export function classifyDiff(field: string, a: E14Overlay, b: E14Overlay): Provenance {
  const pa = ruleProvenances(a);
  const pb = ruleProvenances(b);
  const all = Array.from(new Set([...pa, ...pb]));

  if (
    field === "placement.mode" ||
    field === "placement.scale" ||
    field.startsWith("inner.placement")
  ) {
    if (!a.svgAttrs.viewBox && !b.svgAttrs.viewBox) {
      return "OPEN"; // no-viewBox SVG-as-image reading
    }
    if (field === "placement.mode") return "DERIVED";
  }
  if (field === "security.decision") {
    return all.includes("IMPLEMENTATION_GAP") ? "IMPLEMENTATION_GAP" : "CONVENTION";
  }
  if (field === "startTime" || field === "endTime" || field === "model") {
    return "NORMATIVE";
  }
  if (all.includes("OPEN")) return "OPEN";
  if (all.includes("DERIVED")) return "DERIVED";
  if (all.includes("CONVENTION")) return "CONVENTION";
  if (all.includes("NORMATIVE")) return "NORMATIVE";
  return "IMPLEMENTATION_GAP";
}

function diffFields(a: E14Overlay, b: E14Overlay, idx: number, overlayId: string): OverlayDiff[] {
  const diffs: OverlayDiff[] = [];
  const push = (field: string, av: string, bv: string) =>
    diffs.push({
      overlayIndex: idx,
      overlayId,
      field,
      a: av,
      b: bv,
      classification: classifyDiff(field, a, b),
    });

  if (a.model !== b.model) push("model", a.model, b.model);
  if (a.kind !== b.kind) push("kind", a.kind, b.kind);
  if (Math.abs(a.startTime - b.startTime) > 1e-6) push("startTime", round(a.startTime), round(b.startTime));
  if (Math.abs(a.endTime - b.endTime) > 1e-6) push("endTime", round(a.endTime), round(b.endTime));
  if (a.zIndex !== b.zIndex) push("zIndex", String(a.zIndex), String(b.zIndex));
  if (rectKey(a.destination) !== rectKey(b.destination)) {
    push("destination", rectKey(a.destination), rectKey(b.destination));
  }
  if (placementKey(a.placement) !== placementKey(b.placement)) {
    push("placement", placementKey(a.placement), placementKey(b.placement));
  }
  if (a.inner && b.inner) {
    if (rectKey(a.inner.destination) !== rectKey(b.inner.destination)) {
      push("inner.destination", rectKey(a.inner.destination), rectKey(b.inner.destination));
    }
    if (placementKey(a.inner.placement) !== placementKey(b.inner.placement)) {
      push("inner.placement", placementKey(a.inner.placement), placementKey(b.inner.placement));
    }
  } else if (!!a.inner !== !!b.inner) {
    push("inner", String(!!a.inner), String(!!b.inner));
  }
  if (a.security && b.security && a.security.decision !== b.security.decision) {
    push("security.decision", a.security.decision, b.security.decision);
  }
  return diffs;
}

/** Compare one renderer's resolved manifest against another's. */
export function compareManifestPair(
  ra: RendererName,
  rb: RendererName,
  a: E14Manifest | null,
  b: E14Manifest | null,
): RendererPair {
  const diffs: OverlayDiff[] = [];
  if (!a || !b) {
    if (!!a !== !!b) {
      diffs.push({
        overlayIndex: 0,
        overlayId: "(manifest)",
        field: "manifest",
        a: a ? "present" : "missing",
        b: b ? "present" : "missing",
        classification: "IMPLEMENTATION_GAP",
      });
    }
    return { a: ra, b: rb, diffs };
  }
  const oa = [...a.overlays].sort((x, y) => x.startTime - y.startTime || x.zIndex - y.zIndex);
  const ob = [...b.overlays].sort((x, y) => x.startTime - y.startTime || x.zIndex - y.zIndex);
  if (oa.length !== ob.length) {
    diffs.push({
      overlayIndex: 0,
      overlayId: "(count)",
      field: "overlayCount",
      a: String(oa.length),
      b: String(ob.length),
      classification: "NORMATIVE",
    });
  }
  const n = Math.min(oa.length, ob.length);
  for (let i = 0; i < n; i++) {
    diffs.push(...diffFields(oa[i]!, ob[i]!, i, oa[i]!.id));
  }
  return { a: ra, b: rb, diffs };
}

export function compareE14(
  manifests: Partial<Record<RendererName, E14Manifest | null>>,
): E14Comparison {
  const byPair: RendererPair[] = [];
  const verdicts: string[] = [];
  const overlayCount: Partial<Record<RendererName, number>> = {};
  for (const r of RENDERERS) overlayCount[r] = manifests[r]?.overlays.length ?? 0;

  for (let i = 0; i < RENDERERS.length; i++) {
    for (let j = i + 1; j < RENDERERS.length; j++) {
      const ra = RENDERERS[i]!;
      const rb = RENDERERS[j]!;
      const pair = compareManifestPair(ra, rb, manifests[ra] ?? null, manifests[rb] ?? null);
      byPair.push(pair);
      verdicts.push(pair.diffs.length === 0 ? `${ra}==${rb}` : `${ra}!=${rb}`);
    }
  }
  return { byPair, verdicts, overlayCount };
}

/** Map a user-space point through an overlay's placement into outer Canvas units. */
export function userToCanvas(ov: E14Overlay, p: { x: number; y: number }): { x: number; y: number } {
  const pl = ov.placement;
  const vp = pl.viewport;
  const vb = ov.svgAttrs.viewBox;
  if (!vb) {
    if (pl.mode === "nested-canvas" && pl.nested) {
      return {
        x: pl.nested.offsetX + p.x * pl.nested.scaleX,
        y: pl.nested.offsetY + p.y * pl.nested.scaleY,
      };
    }
    return { x: vp.x + p.x, y: vp.y + p.y };
  }
  if (pl.mode === "viewBox-none") {
    const sx = vp.w / vb.w;
    const sy = vp.h / vb.h;
    return { x: vp.x + (p.x - vb.minX) * sx, y: vp.y + (p.y - vb.minY) * sy };
  }
  const s = pl.scale ?? 1;
  return { x: pl.translation.x + p.x * s, y: pl.translation.y + p.y * s };
}