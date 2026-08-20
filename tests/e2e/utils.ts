import { expect, type Page } from "@playwright/test";
import { PNG } from "pngjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export const EVIDENCE = resolve("evidence");

export interface GotoOpts {
  exp: string;
  renderer?: "a" | "b" | "blind" | "native";
  t?: number;
  aspect?: "16:9" | "4:3" | "narrow" | "wide";
  sanitize?: "0" | "1";
  fit?: "contain" | "cover" | "fill";
}

export async function gotoLab(page: Page, opts: GotoOpts): Promise<void> {
  const q = new URLSearchParams({ exp: opts.exp, renderer: opts.renderer ?? "a" });
  if (opts.t !== undefined) q.set("t", String(opts.t));
  if (opts.aspect) q.set("aspect", opts.aspect);
  if (opts.sanitize) q.set("sanitize", opts.sanitize);
  if (opts.fit) q.set("fit", opts.fit);
  await page.goto(`/?${q}`);
  await page.waitForFunction(() => (window as any).__lab !== undefined, null, { timeout: 20000 });
  await waitFrames(page, 3);
}

export function waitFrames(page: Page, n = 2): Promise<void> {
  return page.evaluate(
    (count) =>
      new Promise((res) => {
        let i = 0;
        const step = () => (++i < count ? requestAnimationFrame(step) : (res(undefined) as any));
        requestAnimationFrame(step);
      }),
    n,
  );
}

export async function seek(page: Page, t: number): Promise<number> {
  await page.evaluate((tt) => (window as any).__lab.seek(tt), t);
  await waitFrames(page, 3);
  return page.evaluate(() => (window as any).__lab.currentTime());
}

export interface SnapshotShape {
  tag: string;
  cls: string | null;
  rect: { x: number; y: number; width: number; height: number };
}
export interface SnapshotEntry {
  id: string;
  visible: boolean;
  start: number;
  end: number;
  z: number;
  region: { x: number; y: number; width: number; height: number };
  shapes: SnapshotShape[];
}

export async function snapshot(page: Page): Promise<SnapshotEntry[]> {
  return page.evaluate(() => (window as any).__lab.snapshot());
}

export function pick(entries: SnapshotEntry[], substr: string): SnapshotEntry {
  const e = entries.find((x) => x.id.includes(substr));
  expect(e, `overlay containing ${substr}`).toBeDefined();
  return e!;
}

/** CSS rect => Canvas-space center. */
export async function rectCenterCanvas(page: Page, r: { x: number; y: number; width: number; height: number }): Promise<{ x: number; y: number }> {
  return page.evaluate(
    ([x, y]) => (window as any).__lab.toCanvasPoint(x, y),
    [r.x + r.width / 2, r.y + r.height / 2] as [number, number],
  );
}

export async function canvasToCss(page: Page, x: number, y: number): Promise<{ x: number; y: number }> {
  return page.evaluate(([cx, cy]) => (window as any).__lab.canvasToCss(cx, cy), [x, y] as [number, number]);
}

export function color(str: string): [number, number, number] {
  const v = str.replace("#", "").replace(/0x/, "").slice(0, 6);
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

export function close(a: [number, number, number], b: [number, number, number], tol: number): boolean {
  return a.every((v, i) => Math.abs(v - b[i]!) <= tol);
}

export async function screenshotPng(page: Page): Promise<PNG> {
  return PNG.sync.read(await page.screenshot({ type: "png" }));
}

export function px(png: PNG, x: number, y: number): [number, number, number] {
  const xi = Math.max(0, Math.min(png.width - 1, Math.round(x)));
  const yi = Math.max(0, Math.min(png.height - 1, Math.round(y)));
  const idx = (png.width * yi + xi) * 4;
  return [png.data[idx]!, png.data[idx + 1]!, png.data[idx + 2]!];
}

export async function shot(page: Page, name: string): Promise<string> {
  mkdirSync(resolve(EVIDENCE, "screenshots"), { recursive: true });
  const p = resolve(EVIDENCE, "screenshots", `${name}.png`);
  await page.locator("#viewport").screenshot({ path: p });
  return p;
}

export function record(exp: string, data: Record<string, unknown>): string {
  mkdirSync(resolve(EVIDENCE, "observations"), { recursive: true });
  const p = resolve(EVIDENCE, "observations", `${exp}.json`);
  writeFileSync(p, JSON.stringify(data, null, 2), "utf8");
  return p;
}

export function expectParityClean(page: Page): Promise<boolean> {
  return page.evaluate(() => (window as any).__lab.parity().every((d: string[]) => d.length === 0));
}

export function overlayDomCounts(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
    const overlay = document.querySelector("#stage-root svg.overlay, #stage-root svg") as SVGSVGElement | null;
    const root = overlay ?? document;
    const counts: Record<string, number> = {};
    for (const tag of ["script", "foreignObject", "a", "image", "use", "filter", "style", "marker", "defs", "animate"]) {
      counts[tag] = root.querySelectorAll(tag).length;
    }
    return counts;
  });
}