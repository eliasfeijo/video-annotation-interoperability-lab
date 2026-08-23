import { describe, expect, it } from "vitest";
import {
  parseTemporal,
  parseSpatial,
  parseFragmentValue,
} from "../src/blind/selectors.ts";
import { resolveWindow } from "../src/blind/temporal.ts";
import { isActive } from "../src/primitives/temporal.ts";
import {
  readSvgRootAttrs,
  parseViewBox,
} from "../src/primitives/svg-root.ts";
import { canvasPointOf } from "../src/blind/placement.ts";
import { computeRegionAsViewportPlacement } from "../src/primitives/region-as-viewport-placement.ts";
import {
  resolveBlindManifest,
} from "../src/blind/resolver.ts";
import { classifySvg, sanitizeSvg } from "../src/blind/sanitize.ts";

const ORIGIN = "http://localhost:5173";

function manifestWith(pages: any[], canvasOverrides: any = {}): any {
  return {
    "@context": [
      "http://www.w3.org/ns/anno.jsonld",
      "http://iiif.io/api/presentation/3/context.json",
    ],
    id: `${ORIGIN}/manifests/case.json`,
    type: "Manifest",
    items: [
      {
        id: `${ORIGIN}/canvas/main`,
        type: "Canvas",
        width: 1920,
        height: 1080,
        duration: 30,
        ...canvasOverrides,
        items: [
          { id: `${ORIGIN}/page/1`, type: "AnnotationPage", items: pages },
        ],
      },
    ],
  };
}

const VIDEO_BODY = {
  id: `${ORIGIN}/video/test.mp4`,
  type: "Video",
  format: "video/mp4",
  width: 1920,
  height: 1080,
  duration: 30,
};

const SVG_BODY = {
  id: `${ORIGIN}/svg/a.svg`,
  type: "Image",
  format: "image/svg+xml",
};

const SVG_A = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"><circle cx="10" cy="20" r="30"/></svg>`;

const fetcher = async (url: string) => {
  if (url.endsWith("a.svg")) return SVG_A;
  throw new Error("unexpected fetch " + url);
};

describe("blind selectors (Media Fragments)", () => {
  it("parses half-open intervals t=a,b", () => {
    expect(parseTemporal("10,20")).toEqual({ start: 10, end: 20 });
    expect(parseTemporal("npt:10,20")).toEqual({ start: 10, end: 20 });
  });
  it("parses t=,end as [0,end)", () => {
    expect(parseTemporal(",20")).toEqual({ start: 0, end: 20 });
  });
  it("parses t=start as [start,+inf)", () => {
    expect(parseTemporal("15")).toEqual({ start: 15 });
  });
  it("rejects reversed interval a>=b", () => {
    expect(parseTemporal("20,10")).toBeNull();
  });
  it("parses xywh pixel and percent", () => {
    expect(parseSpatial("100,50,200,300")).toEqual({
      x: 100,
      y: 50,
      w: 200,
      h: 300,
      percent: false,
    });
    expect(parseSpatial("pct:25,25,50,50", 1920, 1080)).toEqual({
      x: 480,
      y: 270,
      w: 960,
      h: 540,
      percent: true,
    });
    expect(parseSpatial("percent:10,10,20,20", 1920, 1080)).toEqual({
      x: 192,
      y: 108,
      w: 384,
      h: 216,
      percent: true,
    });
  });
  it("rejects zero-size and fully out-of-bounds regions", () => {
    expect(parseSpatial("0,0,0,0")).toBeNull();
    expect(parseSpatial("2000,0,100,100", 1920, 1080)).toBeNull();
  });
  it("keeps the last valid occurrence of each dimension", () => {
    expect(parseFragmentValue("t=1,5&t=10,20&xywh=0,0,100,100&xywh=0,0,200,200", 1920, 1080)).toEqual({
      temporal: { start: 10, end: 20 },
      spatial: { x: 0, y: 0, w: 200, h: 200, percent: false },
    });
  });
});

describe("blind temporal resolution", () => {
  it("resolves windows against canvas duration", () => {
    expect(resolveWindow(undefined, 30)).toEqual({ start: 0, end: 30 });
    expect(resolveWindow({ start: 10, end: 20 }, 30)).toEqual({ start: 10, end: 20 });
    expect(resolveWindow({ start: 15 }, 30)).toEqual({ start: 15, end: Number.POSITIVE_INFINITY });
  });
  it("half-open visibility: end exclusive", () => {
    const w = { start: 10, end: 20 };
    expect(isActive(w, 10)).toBe(true);
    expect(isActive(w, 19.999)).toBe(true);
    expect(isActive(w, 20)).toBe(false);
    expect(isActive(w, 9.999)).toBe(false);
  });
});

describe("blind svg root parsing", () => {
  it("parses viewBox, preserveAspectRatio, width/height", () => {
    const a = readSvgRootAttrs(
      `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 100 100" preserveAspectRatio="xMinYMin meet"></svg>`,
    );
    expect(a.viewBox).toEqual({ minX: 0, minY: 0, w: 100, h: 100 });
    expect(a.preserveAspectRatio).toBe("xMinYMin meet");
    expect(a.width).toBe(200);
    expect(a.height).toBe(100);
  });
  it("leaves viewBox unset when absent", () => {
    expect(readSvgRootAttrs(`<svg width="1000" height="1000"></svg>`).viewBox).toBeUndefined();
  });
  it("rejects degenerate viewBoxes", () => {
    expect(parseViewBox("0 0 0 100")).toBeNull();
    expect(parseViewBox("0 0 100 -5")).toBeNull();
  });
});

describe("blind placement", () => {
  const dest = { x: 480, y: 270, w: 960, h: 540 };
  it("viewBox + default meet centers content in region", () => {
    const p = computeRegionAsViewportPlacement({
      destination: dest,
      attrs: { viewBox: { minX: 0, minY: 0, w: 1000, h: 1000 } },
    });
    expect(p.mode).toBe("viewBox-meet");
    expect(p.scale).toBeCloseTo(0.54, 5);
    expect(canvasPointOf(p, { x: 0, y: 0 })).toEqual({ x: 690, y: 270 });
    expect(canvasPointOf(p, { x: 500, y: 500 })).toEqual({ x: 960, y: 540 });
  });
  it("preserveAspectRatio none stretches non-uniformly", () => {
    const p = computeRegionAsViewportPlacement({
      destination: dest,
      attrs: {
        viewBox: { minX: 0, minY: 0, w: 100, h: 100 },
        preserveAspectRatio: "none",
      },
    });
    expect(p.mode).toBe("viewBox-none");
    expect(canvasPointOf(p, { x: 50, y: 50 })).toEqual({ x: 960, y: 540 });
    expect(canvasPointOf(p, { x: 100, y: 100 })).toEqual({ x: 1440, y: 810 });
  });
  it("preserveAspectRatio slice covers the viewport", () => {
    const p = computeRegionAsViewportPlacement({
      destination: dest,
      attrs: {
        viewBox: { minX: 0, minY: 0, w: 100, h: 100 },
        preserveAspectRatio: "xMidYMid slice",
      },
    });
    expect(p.mode).toBe("viewBox-slice");
    expect(p.scale).toBeCloseTo(9.6, 5);
  });
  it("no viewBox => 1:1 user units from the region origin", () => {
    const p = computeRegionAsViewportPlacement({ destination: dest, attrs: {} });
    expect(p.mode).toBe("no-viewBox-1to1");
    expect(p.scale).toBe(1);
    expect(canvasPointOf(p, { x: 100, y: 100 })).toEqual({ x: 580, y: 370 });
  });
});

describe("blind resolver", () => {
  it("extracts canvas + video + svg overlay with z-order in encounter order", async () => {
    const r = await resolveBlindManifest(
      manifestWith([
        { id: "a/video", type: "Annotation", motivation: "painting", target: `${ORIGIN}/canvas/main`, body: VIDEO_BODY },
        { id: "a/doc", type: "Annotation", motivation: "painting", target: `${ORIGIN}/canvas/main`, body: SVG_BODY },
        { id: "a/note", type: "Annotation", motivation: "commenting", target: `${ORIGIN}/canvas/main`, body: SVG_BODY },
        { id: "a/other", type: "Annotation", motivation: "painting", target: `${ORIGIN}/canvas/main`, body: { id: `${ORIGIN}/x.png`, type: "Image", format: "image/png" } },
        { id: "a/doc2", type: "Annotation", motivation: "painting", target: `${ORIGIN}/canvas/main`, body: SVG_BODY },
      ]),
      fetcher,
    );
    expect(r.canvas).toEqual({ id: `${ORIGIN}/canvas/main`, width: 1920, height: 1080, duration: 30 });
    expect(r.videoUrl).toBe(`${ORIGIN}/video/test.mp4`);
    expect(r.overlays).toHaveLength(2);
    expect(r.overlays.map((o) => o.zIndex)).toEqual([0, 1]);
    expect(r.overlays[0]!.destination).toEqual({ x: 0, y: 0, w: 1920, h: 1080 });
    expect(r.overlays[0]!.placement.mode).toBe("viewBox-meet");
    expect(r.overlays[0]!.rules.some((x) => x.provenance === "NORMATIVE")).toBe(true);
  });

  it("resolves pct alias against canvas dimensions", async () => {
    const r = await resolveBlindManifest(
      manifestWith([
        { id: "a/doc", type: "Annotation", motivation: "painting", target: `${ORIGIN}/canvas/main`, body: VIDEO_BODY },
        {
          id: "a/reg",
          type: "Annotation",
          motivation: "painting",
          target: { source: `${ORIGIN}/canvas/main`, selector: { type: "FragmentSelector", value: "xywh=pct:25,25,50,50&t=10,20" } },
          body: SVG_BODY,
        },
      ]),
      fetcher,
    );
    const o = r.overlays[0]!;
    expect(o.destination).toEqual({ x: 480, y: 270, w: 960, h: 540 });
    expect(o.startTime).toBe(10);
    expect(o.endTime).toBe(20);
  });

  it("mode B labels z-order provenance as NORMATIVE", async () => {
    const r = await resolveBlindManifest(
      manifestWith([
        { id: "a/doc", type: "Annotation", motivation: "painting", target: `${ORIGIN}/canvas/main`, body: SVG_BODY },
      ]),
      fetcher,
      { mode: "B" },
    );
    expect(r.mode).toBe("B");
    expect(r.overlays[0]!.rules.find((x) => x.rule.includes("z-order"))!.provenance).toBe("NORMATIVE");
  });

  it("mode A labels z-order provenance as CONVENTION", async () => {
    const r = await resolveBlindManifest(
      manifestWith([
        { id: "a/doc", type: "Annotation", motivation: "painting", target: `${ORIGIN}/canvas/main`, body: SVG_BODY },
      ]),
      fetcher,
      { mode: "A" },
    );
    expect(r.overlays[0]!.rules.find((x) => x.rule.includes("z-order"))!.provenance).toBe("CONVENTION");
  });

  it("marks no-viewBox placement rule provenance as OPEN", async () => {
    const fetcherNoVb = async (url: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000"><circle cx="10" cy="20" r="30"/></svg>`;
    const r = await resolveBlindManifest(
      manifestWith([
        { id: "a/doc", type: "Annotation", motivation: "painting", target: `${ORIGIN}/canvas/main`, body: SVG_BODY },
      ]),
      fetcherNoVb,
    );
    expect(r.overlays[0]!.placement.mode).toBe("no-viewBox-1to1");
    expect(r.overlays[0]!.rules.find((x) => x.rule.includes("placement"))!.provenance).toBe("OPEN");
  });
});

describe("blind svg security classification (case 13)", () => {
  it("classifies clean svg as safe", () => {
    const c = classifySvg(`<svg viewBox="0 0 100 100"><rect width="10" height="10"/></svg>`);
    expect(c.level).toBe("safe");
    expect(c.blocking).toEqual([]);
  });
  it("classifies script/foreignObject/eventHandler/external href as unsafe", () => {
    const c = classifySvg(
      `<svg viewBox="0 0 100 100"><script>alert(1)</script><foreignObject><div/></foreignObject><rect onclick="x()"/><a href="https://e.invalid"><rect/></a></svg>`,
    );
    expect(c.level).toBe("unsafe");
    expect(c.blocking).toContain("script");
    expect(c.blocking).toContain("foreignObject");
    expect(c.blocking).toContain("eventHandler");
    expect(c.blocking).toContain("externalHref");
  });
  it("classifies image/use/style/filter as unsupported but not unsafe", () => {
    const c = classifySvg(`<svg viewBox="0 0 100 100"><image href="data:image/png;base64,x"/><use href="#x"/><style>circle{}</style></svg>`);
    expect(c.level).toBe("unsupported");
    expect(c.blocking).toEqual([]);
  });
  it("sanitizes unsupported svg down to an allowlist", () => {
    const out = sanitizeSvg(`<svg viewBox="0 0 100 100"><use href="#x"/><circle cx="10" cy="10" r="5" fill="red"/><script>alert(1)</script></svg>`);
    expect(out).not.toMatch(/<use/);
    expect(out).not.toMatch(/<script/);
    expect(out).toMatch(/<circle/);
  });
});
