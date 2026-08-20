import type { CanvasInfo, Keyframe, ResolvedOverlay } from "../lib/types.ts";
import { isActiveAt } from "../lib/timing.ts";
import { svgInnerContent, computeNestedSvgPlacement } from "../lib/svg.ts";

export type Fit = "contain" | "fill" | "cover";

export interface ShapeSnap {
  tag: string;
  cls: string | null;
  rect: { x: number; y: number; width: number; height: number };
}

export interface OverlaySnap {
  id: string;
  visible: boolean;
  start: number;
  end: number;
  z: number;
  region: { x: number; y: number; width: number; height: number };
  shapes: ShapeSnap[];
}

export type SvgSanitizer = (svg: string) => string;

const SHAPE_SELECTOR =
  "circle,rect,path,line,polyline,polygon,ellipse,text,tspan,image,use,foreignObject";

/** Deterministic linear interpolation between keyframe offsets. */
export function keyframeOffset(keyframes: Keyframe[], t: number): { x: number; y: number } {
  if (!keyframes.length) return { x: 0, y: 0 };
  if (t <= keyframes[0]!.t) return { x: keyframes[0]!.x, y: keyframes[0]!.y };
  const last = keyframes[keyframes.length - 1]!;
  if (t >= last.t) return { x: last.x, y: last.y };
  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i]!;
    const b = keyframes[i + 1]!;
    if (t >= a.t && t <= b.t) {
      const f = (t - a.t) / (b.t - a.t);
      return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
    }
  }
  return { x: 0, y: 0 };
}

/**
 * DOM compositor. Hosts the `<video>` and an absolutely-positioned SVG overlay
 * that tracks the *displayed* video content (letterbox-aware).
 */
export class Stage {
  readonly el: HTMLElement;
  private video: HTMLVideoElement;
  private overlay: SVGSVGElement;
  private fit: Fit = "contain";
  private canvas: CanvasInfo = {};
  private overlays: ResolvedOverlay[] = [];
  private nodes = new Map<string, SVGElement>();
  private sanitize: SvgSanitizer = (s) => s;

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
    this.overlay.setAttribute("class", "overlay");
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

  setCanvas(info: CanvasInfo): void {
    this.canvas = info;
    this.layout();
  }

  setSanitizer(fn: SvgSanitizer): void {
    this.sanitize = fn;
  }

  private contentRect(): { x: number; y: number; w: number; h: number } {
    const vw = this.canvas.width ?? this.video.videoWidth ?? 1920;
    const vh = this.canvas.height ?? this.video.videoHeight ?? 1080;
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
    this.overlay.setAttribute("viewBox", `0 0 ${this.canvas.width ?? 1920} ${this.canvas.height ?? 1080}`);
    this.overlay.setAttribute("preserveAspectRatio", "xMidYMid meet");
  }

  setOverlays(overlays: ResolvedOverlay[]): void {
    this.overlays = overlays;
    this.nodes.clear();
    while (this.overlay.firstChild) this.overlay.removeChild(this.overlay.firstChild);
    const cw = this.canvas.width ?? 1920;
    const ch = this.canvas.height ?? 1080;
    for (const ov of overlays) this.buildNode(ov, cw, ch);
    this.layout();
  }

  private buildNode(ov: ResolvedOverlay, cw: number, ch: number): void {
    const svgns = "http://www.w3.org/2000/svg";
    const g = document.createElementNS(svgns, "g");
    g.setAttribute("data-overlay-id", ov.id);
    g.setAttribute("data-start", String(ov.startTime));
    g.setAttribute("data-end", String(ov.endTime));
    g.setAttribute("data-z", String(ov.zIndex));
    g.style.display = "none";

    const placement = computeNestedSvgPlacement(ov.viewport, ov.svgAttrs, cw, ch);
    const nested = document.createElementNS(svgns, "svg");
    nested.setAttribute("x", String(placement.x));
    nested.setAttribute("y", String(placement.y));
    nested.setAttribute("width", String(placement.w));
    nested.setAttribute("height", String(placement.h));
    if (placement.viewBox) {
      const { minX, minY, w, h } = placement.viewBox;
      nested.setAttribute("viewBox", `${minX} ${minY} ${w} ${h}`);
    }
    nested.setAttribute("preserveAspectRatio", placement.preserveAspectRatio ?? "xMidYMid meet");
    nested.setAttribute("data-overlay-nested", "1");

    const inner = document.createElementNS(svgns, "g");
    inner.setAttribute("data-overlay-transform", "1");
    inner.innerHTML = svgInnerContent(this.sanitize(ov.svgText));

    nested.appendChild(inner);
    g.appendChild(nested);
    this.overlay.appendChild(g);
    this.nodes.set(ov.id, g);
  }

  /** Re-evaluate visibility and keyframe positions for wall-clock time t (s). */
  applyAt(t: number): void {
    for (const ov of this.overlays) {
      const g = this.nodes.get(ov.id)!;
      const visible = isActiveAt(ov, t);
      g.style.display = visible ? "" : "none";
      if (visible && ov.keyframes?.length) {
        const transform = g.querySelector('[data-overlay-transform]')!;
        const off = keyframeOffset(ov.keyframes, t);
        transform.setAttribute("transform", `translate(${off.x}, ${off.y})`);
      }
    }
  }

  activeIds(t: number): string[] {
    return this.overlays.filter((o) => isActiveAt(o, t)).map((o) => o.id);
  }

  /** CSS-pixel point (page coordinates) => Canvas units. */
  toCanvasPoint(cssX: number, cssY: number): { x: number; y: number } {
    const rect = this.overlay.getBoundingClientRect();
    const cw = this.canvas.width ?? 1920;
    const ch = this.canvas.height ?? 1080;
    return {
      x: ((cssX - rect.left) / rect.width) * cw,
      y: ((cssY - rect.top) / rect.height) * ch,
    };
  }

  canvasToCssPoint(cx: number, cy: number): { x: number; y: number } {
    const rect = this.overlay.getBoundingClientRect();
    const cw = this.canvas.width ?? 1920;
    const ch = this.canvas.height ?? 1080;
    return {
      x: rect.left + (cx / cw) * rect.width,
      y: rect.top + (cy / ch) * rect.height,
    };
  }

  /** Snapshot of all overlay geometry in CSS pixels (page coordinates). */
  geometrySnapshot(): OverlaySnap[] {
    const out: OverlaySnap[] = [];
    const overlayRect = this.overlay.getBoundingClientRect();
    const cw = this.canvas.width ?? 1920;
    const ch = this.canvas.height ?? 1080;
    const sx = overlayRect.width / cw;
    const sy = overlayRect.height / ch;
    for (const ov of this.overlays) {
      const g = this.nodes.get(ov.id);
      if (!g) continue;
      const nested = g.querySelector<SVGElement>("[data-overlay-nested]");
      const visible = g.style.display !== "none";
      // The nested <svg> element's own getBoundingClientRect() is unreliable in
      // Chromium (it reports the bounding box of painted content, not the
      // attribute viewport). Compute the region box from the declared viewport
      // geometry instead, which maps 1:1 through the overlay's coordinate
      // system.
      const region = {
        x: overlayRect.left + ov.viewport.x * sx,
        y: overlayRect.top + ov.viewport.y * sy,
        width: ov.viewport.w * sx,
        height: ov.viewport.h * sy,
      };
      const shapes: ShapeSnap[] = [];
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
      out.push({
        id: ov.id,
        visible,
        start: ov.startTime,
        end: ov.endTime,
        z: ov.zIndex,
        region,
        shapes,
      });
    }
    return out;
  }

  get overlaySvg(): SVGSVGElement {
    return this.overlay;
  }
}