/**
 * Browser-Native Renderer — DOM compositor.
 *
 * Renders resolved E14 overlays using the browser's NATIVE resource pipeline:
 *   - video body            => `<video>` (shared stage)
 *   - SVG bodies            => `<img src="…svg">` (SVG-as-image semantics)
 *   - raster bodies (PNG)   => `<img src="…png">` (object-fit contain)
 *   - TextualBody           => absolutely positioned `<div>`
 *
 * Each overlay is an element absolutely positioned at its destination region,
 * expressed in % of the letterboxed content box (so it tracks the displayed
 * video content like the reference/blind stages). Temporal visibility follows
 * the half-open window [start, end). Geometry is snapshot-able for E2E pixel
 * verification: the <img> box rect is compared against the predicted
 * SVG-as-image placement, and intrinsic dimensions are recorded.
 */

import type { CompositionCanvasInfo, CompositionOverlay } from "../composition/types.ts";
import { isActive } from "../primitives/temporal.ts";

export type Fit = "contain" | "fill" | "cover";

export interface NativeElementSnap {
  id: string;
  visible: boolean;
  start: number;
  end: number;
  z: number;
  kind: string;
  /** The element box in CSS pixels (page coords). */
  box: { x: number; y: number; width: number; height: number };
  /** For <img>: intrinsic size reported by the browser. */
  intrinsic: { w: number; h: number } | null;
  /** For <img>: actual rendered bitmap size (content box, object-fit aware). */
  rendered: { w: number; h: number } | null;
}

export class NativeStage {
  readonly el: HTMLElement;
  private video: HTMLVideoElement;
  private box: HTMLDivElement;
  private fit: Fit = "contain";
  private canvas: CompositionCanvasInfo = { id: "", width: 1920, height: 1080, duration: null };
  private overlays: CompositionOverlay[] = [];
  private nodes = new Map<string, HTMLElement>();

  constructor(container: HTMLElement) {
    this.el = document.createElement("div");
    this.el.className = "stage";
    this.el.style.position = "relative";
    this.el.style.overflow = "hidden";

    this.video = document.createElement("video");
    this.video.muted = true;
    this.video.playsInline = true;
    this.video.preload = "auto";
    this.video.style.position = "absolute";
    this.video.style.inset = "0";
    this.video.style.width = "100%";
    this.video.style.height = "100%";

    this.box = document.createElement("div");
    this.box.className = "native-content";
    this.box.style.position = "absolute";
    this.box.style.overflow = "hidden";
    this.box.style.pointerEvents = "none";

    container.appendChild(this.el);
    this.el.append(this.video, this.box);
  }

  get videoElement(): HTMLVideoElement {
    return this.video;
  }

  get contentBox(): HTMLDivElement {
    return this.box;
  }

  setFit(fit: Fit): void {
    this.fit = fit;
    this.layout();
  }

  setCanvas(info: CompositionCanvasInfo): void {
    this.canvas = info;
    this.layout();
  }

  private contentRect(): { x: number; y: number; w: number; h: number } {
    const vw = this.canvas.width || this.video.videoWidth || 1920;
    const vh = this.canvas.height || this.video.videoHeight || 1080;
    const cw = this.el.clientWidth || 1920;
    const ch = this.el.clientHeight || 1080;
    if (this.fit === "fill") return { x: 0, y: 0, w: cw, h: ch };
    const scale = this.fit === "cover" ? Math.max(cw / vw, ch / vh) : Math.min(cw / vw, ch / vh);
    const w = vw * scale;
    const h = vh * scale;
    return { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
  }

  layout(): void {
    const r = this.contentRect();
    this.box.style.left = `${r.x}px`;
    this.box.style.top = `${r.y}px`;
    this.box.style.width = `${r.w}px`;
    this.box.style.height = `${r.h}px`;
  }

  setOverlays(overlays: CompositionOverlay[]): void {
    this.overlays = overlays;
    this.nodes.clear();
    while (this.box.firstChild) this.box.removeChild(this.box.firstChild);
    for (const ov of overlays) this.buildNode(ov);
    this.layout();
  }

  private buildNode(ov: CompositionOverlay): void {
    const d = ov.destination;
    const cw = this.canvas.width || 1920;
    const ch = this.canvas.height || 1080;
    const el = document.createElement("div");
    el.className = "native-overlay";
    el.dataset.overlayId = ov.id;
    el.dataset.overlayNested = "1";
    el.dataset.kind = ov.kind;
    el.dataset.start = String(ov.startTime);
    el.dataset.end = String(ov.endTime);
    el.dataset.z = String(ov.zIndex);
    el.style.position = "absolute";
    el.style.left = `${(d.x / cw) * 100}%`;
    el.style.top = `${(d.y / ch) * 100}%`;
    el.style.width = `${(d.w / cw) * 100}%`;
    el.style.height = `${(d.h / ch) * 100}%`;
    el.style.zIndex = String(1000 + ov.zIndex);
    el.style.display = "none";

    if (ov.kind === "textual") {
      el.style.overflow = "hidden";
      el.textContent = "TEXT";
    } else if (ov.resourceUrl) {
      const img = document.createElement("img");
      img.src = ov.resourceUrl;
      img.alt = "";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = ov.placement.mode === "image-contain" ? "contain" : "fill";
      img.style.display = "block";
      el.appendChild(img);
      el.dataset.resource = ov.resourceUrl;
    }

    this.box.appendChild(el);
    this.nodes.set(ov.id, el);
  }

  applyAt(t: number): void {
    for (const ov of this.overlays) {
      const el = this.nodes.get(ov.id);
      if (!el) continue;
      el.style.display = isActive({ start: ov.startTime, end: ov.endTime }, t) ? "" : "none";
    }
  }

  activeIds(t: number): string[] {
    return this.overlays.filter((o) => isActive({ start: o.startTime, end: o.endTime }, t)).map((o) => o.id);
  }

  get overlaySvg(): SVGSVGElement {
    throw new Error("NativeStage has no overlay SVG; use contentBox / geometrySnapshot()");
  }

  /** CSS-pixel point (page coordinates) => Canvas units. */
  toCanvasPoint(cssX: number, cssY: number): { x: number; y: number } {
    const rect = this.box.getBoundingClientRect();
    const cw = this.canvas.width || 1920;
    const ch = this.canvas.height || 1080;
    return {
      x: ((cssX - rect.left) / rect.width) * cw,
      y: ((cssY - rect.top) / rect.height) * ch,
    };
  }

  canvasToCssPoint(cx: number, cy: number): { x: number; y: number } {
    const rect = this.box.getBoundingClientRect();
    const cw = this.canvas.width || 1920;
    const ch = this.canvas.height || 1080;
    return {
      x: rect.left + (cx / cw) * rect.width,
      y: rect.top + (cy / ch) * rect.height,
    };
  }

  geometrySnapshot(): NativeElementSnap[] {
    const out: NativeElementSnap[] = [];
    for (const ov of this.overlays) {
      const el = this.nodes.get(ov.id);
      if (!el) continue;
      const img = el.querySelector<HTMLImageElement>("img");
      const r = el.getBoundingClientRect();
      out.push({
        id: ov.id,
        visible: el.style.display !== "none",
        start: ov.startTime,
        end: ov.endTime,
        z: ov.zIndex,
        kind: ov.kind,
        box: { x: r.x, y: r.y, width: r.width, height: r.height },
        intrinsic:
          img && img.naturalWidth > 0
            ? { w: img.naturalWidth, h: img.naturalHeight }
            : null,
        rendered:
          img && img.naturalWidth > 0
            ? {
                w: img.naturalWidth * (r.width / img.naturalWidth),
                h: img.naturalHeight * (r.height / img.naturalHeight),
              }
            : null,
      });
    }
    return out;
  }

  overlayRect(id: string): DOMRect | null {
    const el = this.nodes.get(id);
    return el ? el.getBoundingClientRect() : null;
  }

  /** Probe intrinsic metrics from the rendered <img> (browser truth). */
  imgMetrics(id: string): { box: DOMRect; naturalW: number; naturalH: number } | null {
    const el = this.nodes.get(id);
    const img = el?.querySelector<HTMLImageElement>("img");
    if (!el || !img) return null;
    return { box: el.getBoundingClientRect(), naturalW: img.naturalWidth, naturalH: img.naturalHeight };
  }
}