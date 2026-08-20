import { describe, it, expect } from "vitest";
import {
  readSvgRootAttrs,
  svgInnerContent,
  parseViewBox,
  computeNestedSvgPlacement,
  canvasPointOfSvgUserPoint,
} from "../src/lib/svg.ts";

describe("readSvgRootAttrs", () => {
  it("extracts viewBox, preserveAspectRatio, width, height", () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid meet"><circle cx="1" cy="2" r="3"/></svg>';
    expect(readSvgRootAttrs(svg)).toEqual({
      viewBox: { minX: 0, minY: 0, w: 1920, h: 1080 },
      preserveAspectRatio: "xMidYMid meet",
      width: 1920,
      height: 1080,
    });
  });
  it("returns empty attributes for non-svg text", () => {
    expect(readSvgRootAttrs("hello world")).toEqual({});
  });
  it("parses comma-separated viewBox", () => {
    expect(parseViewBox("0,0,640,480")).toEqual({ minX: 0, minY: 0, w: 640, h: 480 });
  });
});

describe("svgInnerContent", () => {
  it("strips only the outer svg wrapper", () => {
    const inner = svgInnerContent("<svg viewBox=\"0 0 1 1\"><g><rect/></g></svg>");
    expect(inner).toContain("<g>");
    expect(inner.startsWith("<g>")).toBe(true);
  });
});

describe("computeNestedSvgPlacement", () => {
  it("maps viewport to region", () => {
    const p = computeNestedSvgPlacement(
      { x: 100, y: 50, w: 960, h: 540 },
      { viewBox: { minX: 0, minY: 0, w: 960, h: 540 }, preserveAspectRatio: "xMidYMid meet" },
      1920,
      1080,
    );
    expect(p).toMatchObject({ x: 100, y: 50, w: 960, h: 540, viewBox: { minX: 0, minY: 0, w: 960, h: 540 } });
  });
});

describe("canvasPointOfSvgUserPoint", () => {
  it("meet: uniform scale, centered", () => {
    const placement = {
      x: 0,
      y: 0,
      w: 1920,
      h: 1080,
      viewBox: { minX: 0, minY: 0, w: 1000, h: 1000 },
      preserveAspectRatio: "xMidYMid meet",
    };
    // 1000x1000 viewBox in a 16:9 region: scale = min(1920/1000, 1080/1000)=1.08, centered horizontally
    const p = canvasPointOfSvgUserPoint({ x: 500, y: 500 }, placement);
    expect(p.x).toBeCloseTo(960, 3); // centered on the wide region
    expect(p.y).toBeCloseTo(540, 3);
  });
  it("none: non-uniform stretch", () => {
    const placement = {
      x: 0,
      y: 0,
      w: 1920,
      h: 1080,
      viewBox: { minX: 0, minY: 0, w: 1000, h: 1000 },
      preserveAspectRatio: "none",
    };
    const p = canvasPointOfSvgUserPoint({ x: 500, y: 500 }, placement);
    expect(p.x).toBeCloseTo(960, 3);
    expect(p.y).toBeCloseTo(540, 3);
    // corner check: top-left maps to (0,0), bottom-right to (1920,1080)
    expect(canvasPointOfSvgUserPoint({ x: 1000, y: 1000 }, placement)).toEqual({ x: 1920, y: 1080 });
  });
});