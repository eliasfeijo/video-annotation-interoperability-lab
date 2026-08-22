/**
 * Experiment E17 — supplementary embedding-matrix page.
 *
 * Hosts ONLY the cells the E15 matrix lacks: the xMaxYMax preserveAspectRatio
 * variant. Everything else (cell id format `variant|regionKey|embedding`,
 * region geometry, embedding construction, measurement hooks) mirrors
 * /e15-lab.html + src/e15/page.ts verbatim so one classifier can score both.
 *
 * This page is measurement infrastructure only; it implements NO IIIF/W3C
 * resolution semantics.
 */

import type { E15Embedding } from "../e15/analysis.ts";

const K = 0.25; // css px per canvas unit

interface RegionDef {
  key: string;
  fragment: string | null;
  rect: { x: number; y: number; w: number; h: number };
}

const REGIONS: RegionDef[] = [
  { key: "half", fragment: "xywh=480,270,960,540", rect: { x: 480, y: 270, w: 960, h: 540 } },
  { key: "rect43", fragment: "xywh=100,100,800,600", rect: { x: 100, y: 100, w: 800, h: 600 } },
];

const VARIANTS = ["e17-vb1000-max.svg"];

const EMBEDDINGS: E15Embedding[] = [
  "svg-nested-region",
  "svg-nested-attr",
  "img-default",
  "img-fill",
  "img-contain",
  "img-none",
  "object",
];

const svgUrl = (name: string) => `/svg/e17/${name}`;

function cellId(variant: string, regionKey: string, emb: string): string {
  return `${variant}|${regionKey}|${emb}`;
}

function buildBox(variant: string, region: RegionDef, emb: E15Embedding): HTMLDivElement {
  const box = document.createElement("div");
  box.className = "e15-box"; // same class so ready()-style queries stay uniform
  box.dataset.cell = cellId(variant, region.key, emb);
  box.style.position = "relative";
  box.style.width = `${Math.round(region.rect.w * K)}px`;
  box.style.height = `${Math.round(region.rect.h * K)}px`;
  box.style.background = "#808080";
  box.style.overflow = "hidden";
  box.style.margin = "2px";
  box.style.verticalAlign = "top";
  box.style.display = "inline-block";

  const url = svgUrl(variant);
  const SVG_NS = "http://www.w3.org/2000/svg";
  switch (emb) {
    case "svg-nested-attr":
    case "svg-nested-region": {
      const host = document.createElementNS(SVG_NS, "svg");
      host.setAttribute("viewBox", `0 0 ${region.rect.w} ${region.rect.h}`);
      host.setAttribute("preserveAspectRatio", "none"); // cell box == region exactly
      host.dataset.innerSvg = "1";
      host.style.width = "100%";
      host.style.height = "100%";
      host.style.display = "block";
      fetch(url)
        .then((r) => r.text())
        .then((t) => {
          const tmp = document.createElement("div");
          tmp.innerHTML = t;
          const src = tmp.querySelector("svg");
          if (!src) return;
          if (emb === "svg-nested-region") {
            const nested = document.createElementNS(SVG_NS, "svg");
            nested.setAttribute("x", "0");
            nested.setAttribute("y", "0");
            nested.setAttribute("width", String(region.rect.w));
            nested.setAttribute("height", String(region.rect.h));
            const vb = src.getAttribute("viewBox");
            if (vb) nested.setAttribute("viewBox", vb);
            const par = src.getAttribute("preserveAspectRatio");
            if (par) nested.setAttribute("preserveAspectRatio", par);
            nested.innerHTML = src.innerHTML;
            host.appendChild(nested);
          } else {
            src.setAttribute("x", "0");
            src.setAttribute("y", "0");
            host.appendChild(src);
          }
          box.appendChild(host);
        });
      break;
    }
    case "img-default":
    case "img-fill":
    case "img-contain":
    case "img-none": {
      const img = document.createElement("img");
      img.src = url;
      img.alt = "";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.display = "block";
      if (emb === "img-fill") img.style.objectFit = "fill";
      if (emb === "img-contain") img.style.objectFit = "contain";
      if (emb === "img-none") img.style.objectFit = "none";
      box.appendChild(img);
      break;
    }
    case "object": {
      const obj = document.createElement("object");
      obj.type = "image/svg+xml";
      obj.data = url;
      obj.style.width = "100%";
      obj.style.height = "100%";
      obj.style.display = "block";
      obj.addEventListener("load", () => {
        obj.dataset.loaded = "1";
      });
      box.appendChild(obj);
      break;
    }
    case "background":
      // not used by E17
      break;
  }
  return box;
}

async function ready(): Promise<void> {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    const nestedHosts = document.querySelectorAll<SVGElement>(
      '.e15-box[data-cell*="svg-nested"] svg[data-inner-svg]',
    ).length;
    if (nestedHosts >= VARIANTS.length * REGIONS.length * 2) break;
    await new Promise((res) => setTimeout(res, 100));
  }
  await Promise.all(
    Array.from(document.querySelectorAll<HTMLImageElement>(".e15-box img")).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.addEventListener("load", () => res());
            img.addEventListener("error", () => res());
          }),
    ),
  );
  const objects = Array.from(document.querySelectorAll<HTMLObjectElement>(".e15-box object"));
  await Promise.race([
    Promise.all(
      objects.map(
        (o) =>
          new Promise<void>((res) => {
            if (o.dataset.loaded === "1") return res();
            o.addEventListener("load", () => res());
            setTimeout(() => res(), 5000);
          }),
      ),
    ),
    new Promise((res) => setTimeout(res, 6000)),
  ]);
  await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
}

function main(): void {
  const matrix = document.getElementById("matrix")!;
  for (const variant of VARIANTS) {
    for (const region of REGIONS) {
      const rowLabel = document.createElement("p");
      rowLabel.textContent = `${variant} @ ${region.key} (${region.fragment ?? "full canvas"})`;
      matrix.appendChild(rowLabel);
      const row = document.createElement("div");
      row.className = "e15-row";
      for (const emb of EMBEDDINGS) row.appendChild(buildBox(variant, region, emb));
      matrix.appendChild(row);
    }
  }

  // Hidden intrinsic-size probe.
  const probes = document.createElement("div");
  probes.id = "e17-probes";
  probes.style.visibility = "hidden";
  for (const v of VARIANTS) {
    const img = document.createElement("img");
    img.src = svgUrl(v);
    img.dataset.probe = v;
    probes.appendChild(img);
  }
  matrix.appendChild(probes);

  const api = {
    k: K,
    regions: REGIONS,
    embeddings: EMBEDDINGS,
    variants: VARIANTS,
    cells(): Array<{ id: string; variant: string; embedding: E15Embedding; regionKey: string }> {
      return Array.from(document.querySelectorAll<HTMLElement>(".e15-box")).map((el) => {
        const [v, regionKey, embedding] = el.dataset.cell!.split("|") as [string, string, E15Embedding];
        return { id: el.dataset.cell!, variant: v, embedding, regionKey };
      });
    },
    async ready(): Promise<boolean> {
      await ready();
      return true;
    },
    intrinsics(): Record<string, { w: number; h: number }> {
      const out: Record<string, { w: number; h: number }> = {};
      for (const img of Array.from(document.querySelectorAll<HTMLImageElement>("img[data-probe]"))) {
        out[img.dataset.probe!] = { w: img.naturalWidth, h: img.naturalHeight };
      }
      return out;
    },
    innerSvgBox(id: string): { x: number; y: number; w: number; h: number } | null {
      const box = document.querySelector<HTMLElement>(`.e15-box[data-cell="${CSS.escape(id)}"]`);
      if (!box) return null;
      const inner =
        box.querySelector<SVGElement>("[data-inner-svg] svg") ??
        (box.querySelector("object")?.contentDocument?.querySelector("svg") as SVGElement | null);
      if (!inner) return null;
      const b = (inner as unknown as Element).getBoundingClientRect();
      const r = box.getBoundingClientRect();
      return { x: b.x - r.x, y: b.y - r.y, w: b.width, h: b.height };
    },
    objectLoaded(id: string): boolean {
      const o = document.querySelector<HTMLElement>(`.e15-box[data-cell="${CSS.escape(id)}"] object`);
      return o?.dataset.loaded === "1" && !!(o as HTMLObjectElement).contentDocument?.querySelector("svg");
    },
  };
  (window as unknown as { __e17: typeof api }).__e17 = api;
  document.getElementById("hud")!.textContent = `E17 cells: ${api.cells().length} built`;
}

void main();
