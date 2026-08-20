import { describe, expect, it } from "vitest";
import { resolveManifest } from "../src/reference/lib/iiif.ts";
import { resolveReference } from "../src/reference/renderers/rendererB.ts";

const ORIGIN = "http://localhost:5173";

function manifestWith(pages: any[], canvasOverrides: any = {}): any {
  return {
    "@context": [
      "http://www.w3.org/ns/anno.jsonld",
      "http://iiif.io/api/presentation/3/context.json",
    ],
    id: `${ORIGIN}/manifests/exp1.json`,
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

const fetcher = async (url: string) => {
  if (url.endsWith("a.svg"))
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"><circle cx="10" cy="20" r="30"/></svg>`;
  throw new Error("unexpected fetch " + url);
};

describe("resolveManifest (Renderer A)", () => {
  it("extracts canvas geometry and duration", async () => {
    const r = await resolveManifest(
      manifestWith([
        {
          id: "a",
          type: "Annotation",
          motivation: "painting",
          target: `${ORIGIN}/canvas/main`,
          body: VIDEO_BODY,
        },
      ]),
      `${ORIGIN}/manifests/exp1.json`,
      fetcher,
    );
    expect(r.canvas).toEqual({
      id: `${ORIGIN}/canvas/main`,
      width: 1920,
      height: 1080,
      duration: 30,
    });
    expect(r.videoUrl).toBe(`${ORIGIN}/video/test.mp4`);
  });

  it("builds overlay from SVG painting with temporal + spatial fragment", async () => {
    const r = await resolveManifest(
      manifestWith([
        {
          id: "doc",
          type: "Annotation",
          motivation: "painting",
          target: `${ORIGIN}/canvas/main`,
          body: VIDEO_BODY,
        },
        {
          id: "anno/circle",
          type: "Annotation",
          motivation: "painting",
          target: {
            source: `${ORIGIN}/canvas/main`,
            selector: {
              type: "FragmentSelector",
              value: "xywh=100,50,200,300&t=10,20",
            },
          },
          body: SVG_BODY,
        },
      ]),
      `${ORIGIN}/manifests/exp1.json`,
      fetcher,
    );
    expect(r.overlays).toHaveLength(1);
    const o = r.overlays[0]!;
    expect(o.startTime).toBe(10);
    expect(o.endTime).toBe(20);
    expect(o.zIndex).toBe(0);
    expect(o.viewport).toEqual({ x: 100, y: 50, w: 200, h: 300 });
    expect(o.svgAttrs.viewBox).toEqual({ minX: 0, minY: 0, w: 1920, h: 1080 });
  });

  it("skips non-painting annotations and non-SVG bodies", async () => {
    const r = await resolveManifest(
      manifestWith([
        {
          id: "doc",
          type: "Annotation",
          motivation: "commenting",
          target: `${ORIGIN}/canvas/main`,
          body: { id: "x", type: "Text" },
        },
        {
          id: "anno/other",
          type: "Annotation",
          motivation: "painting",
          target: `${ORIGIN}/canvas/main`,
          body: { id: `${ORIGIN}/pic.png`, type: "Image", format: "image/png" },
        },
      ]),
      `${ORIGIN}/manifests/exp1.json`,
      fetcher,
    );
    expect(r.overlays).toHaveLength(0);
  });

  it("no temporal fragment => whole canvas duration window", async () => {
    const r = await resolveManifest(
      manifestWith([
        {
          id: "anno/full",
          type: "Annotation",
          motivation: "painting",
          target: `${ORIGIN}/canvas/main`,
          body: SVG_BODY,
        },
      ]),
      `${ORIGIN}/manifests/exp1.json`,
      fetcher,
    );
    expect(r.overlays[0]!.startTime).toBe(0);
    expect(r.overlays[0]!.endTime).toBe(30);
    expect(r.overlays[0]!.viewport).toEqual({ x: 0, y: 0, w: 1920, h: 1080 });
  });

  it("preserves annotation page order as z-order across multiple annotations", async () => {
    const r = await resolveManifest(
      manifestWith([
        {
          id: "doc",
          type: "Annotation",
          motivation: "painting",
          target: `${ORIGIN}/canvas/main`,
          body: VIDEO_BODY,
        },
        {
          id: "anno/a",
          type: "Annotation",
          motivation: "painting",
          target: `${ORIGIN}/canvas/main`,
          body: SVG_BODY,
        },
        {
          id: "anno/b",
          type: "Annotation",
          motivation: "painting",
          target: `${ORIGIN}/canvas/main`,
          body: SVG_BODY,
        },
        {
          id: "anno/c",
          type: "Annotation",
          motivation: "painting",
          target: `${ORIGIN}/canvas/main`,
          body: SVG_BODY,
        },
      ]),
      `${ORIGIN}/manifests/exp1.json`,
      fetcher,
    );
    expect(r.overlays.map((o) => o.id)).toEqual(["anno/a", "anno/b", "anno/c"]);
    expect(r.overlays.map((o) => o.zIndex)).toEqual([0, 1, 2]);
  });
});

describe("resolveReference (Renderer B)", () => {
  it("defaults viewport to full canvas, preserves given times/z", () => {
    const r = resolveReference(
      [
        {
          startTime: 10,
          endTime: 15,
          zIndex: 0,
          svg: `<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="10"/></svg>`,
        },
      ],
      { width: 1920, height: 1080, duration: 30 },
    );
    expect(r[0]!.viewport).toEqual({ x: 0, y: 0, w: 1920, h: 1080 });
    expect(r[0]!.startTime).toBe(10);
    expect(r[0]!.endTime).toBe(15);
    expect(r[0]!.zIndex).toBe(0);
  });
});
