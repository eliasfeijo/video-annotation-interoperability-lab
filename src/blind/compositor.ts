/**
 * Blind Renderer — DOM compositor.
 *
 * Renders BlindOverlay[] into a host `<svg>` that spans the Canvas. Layout and
 * coordinate-mapping helpers mirror the reference Stage only insofar as both
 * describe the same browser/video geometry (shared screenshot infrastructure);
 * the SVG placement decision (which viewBox/preserveAspectRatio attributes to
 * write, whether to synthesize a viewBox) is the blind renderer's OWN logic:
 *
 *   - nested element always gets x/y/width/height = destination region
 *     (the SVG viewport, per SVG 1.1 §7.9).
 *   - viewBox is written ONLY when the body actually declares one (SVG §7.7).
 *     When the body has NO viewBox, no viewBox attribute is emitted, so the
 *     browser applies the §7.3/§7.10 1:1 user-unit rule. The reference renderer
 *     synthesizes a viewBox in that case; this is the documented Case 11b
 *     disagreement (see docs/ambiguities.md).
 *   - preserveAspectRatio is written only when present; otherwise the browser's
 *     default "xMidYMid meet" applies only if a viewBox exists (SVG §7.8).
 *   - bodies classified "unsafe" (Case 13) are NOT painted; a red placeholder
 *     rect + title is emitted instead so rejection is explicit and visible.
 */

import type { BlindOverlay, BlindCanvasInfo } from "./types.ts";
import { isActive } from "../primitives/temporal.ts";
import { svgInnerContent } from "../primitives/svg-root.ts";

export type Fit = "contain" | "fill" | "cover";

export class BlindStage {
  readonly el: HTMLElement;
  private video: HTMLVideoElement;
  private overlay: SVGSVGElement;
  private fit: Fit = "contain";
  private canvas: BlindCanvasInfo = { id: "", width: 0, height: 0, duration: null };
  private overlays: BlindOverlay[] = [];
  private nodes = new Map<string, SVGElement>();

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

    this.overlay = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.overlay.setAttribute("class", "overlay blind");
    this.overlay.style.position = "absolute";
    this.overlay.style.pointerEvents = "none";
    this.overlay.setAttribute("overflow", "visible");

    container.appendChild(this.el);
    this.el.append(this.video, this.overlay);
  }

  get videoElement(): HTMLVideoElement {
    return this.video;
  }

  setFit(fit: Fit): void {
    this.fit = fit;
    this.layout();
  }

  setCanvas(info: BlindCanvasInfo): void {
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
    this.overlay.style.left = `${r.x}px`;
    this.overlay.style.top = `${r.y}px`;
    this.overlay.style.width = `${r.w}px`;
    this.overlay.style.height = `${r.h}px`;
    this.overlay.setAttribute("viewBox", `0 0 ${this.canvas.width || 1920} ${this.canvas.height || 1080}`);
    this.overlay.setAttribute("preserveAspectRatio", "xMidYMid meet");
  }

  setOverlays(overlays: BlindOverlay[]): void {
    this.overlays = overlays;
    this.nodes.clear();
    while (this.overlay.firstChild) this.overlay.removeChild(this.overlay.firstChild);
    for (const ov of overlays) this.buildNode(ov);
    this.layout();
  }

  private buildNode(ov: BlindOverlay): void {
    const svgns = "http://www.w3.org/2000/svg";
    const g = document.createElementNS(svgns, "g");
    g.setAttribute("data-overlay-id", ov.id);
    g.setAttribute("data-start", String(ov.startTime));
    g.setAttribute("data-end", String(ov.endTime));
    g.setAttribute("data-z", String(ov.zIndex));
    g.style.display = "none";

    const d = ov.destination;
    const nested = document.createElementNS(svgns, "svg");
    nested.setAttribute("x", String(d.x));
    nested.setAttribute("y", String(d.y));
    nested.setAttribute("width", String(d.w));
    nested.setAttribute("height", String(d.h));
    nested.setAttribute("data-overlay-nested", "1");
    // Blind placement rule: only write a viewBox the body actually declares.
    if (ov.svgAttrs.viewBox) {
      const vb = ov.svgAttrs.viewBox;
      nested.setAttribute("viewBox", `${vb.minX} ${vb.minY} ${vb.w} ${vb.h}`);
    }
    if (ov.svgAttrs.preserveAspectRatio) {
      nested.setAttribute("preserveAspectRatio", ov.svgAttrs.preserveAspectRatio);
    }

    if (ov.security.level === "unsafe") {
      // Case 13: explicit rejection instead of silent rendering.
      const marker = document.createElementNS(svgns, "g");
      marker.setAttribute("data-sec", "unsafe");
      const rect = document.createElementNS(svgns, "rect");
      rect.setAttribute("x", "0");
      rect.setAttribute("y", "0");
      rect.setAttribute("width", String(d.w));
      rect.setAttribute("height", String(d.h));
      rect.setAttribute("fill", "#ff000022");
      rect.setAttribute("stroke", "#d00");
      rect.setAttribute("stroke-width", "2");
      const title = document.createElementNS(svgns, "title");
      title.textContent = `rejected: unsafe svg (${(ov.security.blocking ?? []).join(", ")})`;
      marker.append(rect, title);
      nested.appendChild(marker);
    } else {
      const inner = document.createElementNS(svgns, "g");
      inner.setAttribute("data-overlay-transform", "1");
      const text = ov.security.sanitized ?? ov.svgText;
      inner.innerHTML = svgInnerContent(text);
      nested.appendChild(inner);
    }

    g.appendChild(nested);
    this.overlay.appendChild(g);
    this.nodes.set(ov.id, g);
  }

  applyAt(t: number): void {
    for (const ov of this.overlays) {
      const g = this.nodes.get(ov.id);
      if (!g) continue;
      const window = { start: ov.startTime, end: ov.endTime };
      g.style.display = isActive(window, t) ? "" : "none";
    }
  }

  activeIds(t: number): string[] {
    return this.overlays.filter((o) => isActive({ start: o.startTime, end: o.endTime }, t)).map((o) => o.id);
  }

  toCanvasPoint(cssX: number, cssY: number): { x: number; y: number } {
    const rect = this.overlay.getBoundingClientRect();
    const cw = this.canvas.width || 1920;
    const ch = this.canvas.height || 1080;
    return {
      x: ((cssX - rect.left) / rect.width) * cw,
      y: ((cssY - rect.top) / rect.height) * ch,
    };
  }

  canvasToCssPoint(cx: number, cy: number): { x: number; y: number } {
    const rect = this.overlay.getBoundingClientRect();
    const cw = this.canvas.width || 1920;
    const ch = this.canvas.height || 1080;
    return {
      x: rect.left + (cx / cw) * rect.width,
      y: rect.top + (cy / ch) * rect.height,
    };
  }

  get overlaySvg(): SVGSVGElement {
    return this.overlay;
  }

  /** Snapshot of all overlay geometry in CSS pixels (page coordinates). */
  geometrySnapshot(): {
    id: string;
    visible: boolean;
    start: number;
    end: number;
    z: number;
    region: { x: number; y: number; width: number; height: number };
    shapes: { tag: string; cls: string | null; rect: { x: number; y: number; width: number; height: number } }[];
  }[] {
    const out: ReturnType<BlindStage["geometrySnapshot"]> = [];
    const overlayRect = this.overlay.getBoundingClientRect();
    const cw = this.canvas.width || 1920;
    const ch = this.canvas.height || 1080;
    const sx = overlayRect.width / cw;
    const sy = overlayRect.height / ch;
    const SHAPE_SELECTOR = "circle,rect,path,line,polyline,polygon,ellipse,text,tspan";
    for (const ov of this.overlays) {
      const g = this.nodes.get(ov.id);
      if (!g) continue;
      const nested = g.querySelector<SVGElement>("[data-overlay-nested]");
      const visible = g.style.display !== "none";
      const d = ov.destination;
      const region = {
        x: overlayRect.left + d.x * sx,
        y: overlayRect.top + d.y * sy,
        width: d.w * sx,
        height: d.h * sy,
      };
      const shapes: { tag: string; cls: string | null; rect: { x: number; y: number; width: number; height: number } }[] = [];
      if (nested) {
        for (const el of Array.from(nested.querySelectorAll(SHAPE_SELECTOR))) {
          const r = el.getBoundingClientRect();
          shapes.push({
            tag: el.tagName.toLowerCase(),
            cls: el.getAttribute("class"),
            rect: { x: r.x, y: r.y, width: r.width, height: r.height },
          });
        }
      }
      out.push({ id: ov.id, visible, start: ov.startTime, end: ov.endTime, z: ov.zIndex, region, shapes });
    }
    return out;
  }

  overlayRect(id: string): DOMRect | null {
    const g = this.overlaySvg.querySelector(
      `[data-overlay-id="${id}"] [data-overlay-nested]`,
    );
    return g ? g.getBoundingClientRect() : null;
  }

  domProbe(id: string, selector: string): string | null {
    const g = this.overlaySvg.querySelector(`[data-overlay-id="${id}"]`);
    const el = g?.querySelector(selector);
    return el
      ? (el.getAttribute("transform") ??
          el.getAttribute("x") ??
          el.getAttribute("cx") ??
          null)
      : null;
  }
}