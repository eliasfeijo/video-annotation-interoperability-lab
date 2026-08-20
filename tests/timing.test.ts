import { describe, it, expect } from "vitest";
import { temporalWindow, isActiveAt } from "../src/lib/timing.ts";
import type { ResolvedOverlay } from "../src/lib/types.ts";

const DURATION = 30;

function ov(partial: Partial<ResolvedOverlay>): ResolvedOverlay {
  return {
    id: "x",
    startTime: 10,
    endTime: 15,
    zIndex: 0,
    svgText: "<svg/>",
    svgAttrs: {},
    viewport: { x: 0, y: 0, w: 1920, h: 1080 },
    ...partial,
  };
}

describe("temporalWindow", () => {
  it("no temporal fragment covers the whole canvas duration", () => {
    expect(temporalWindow(undefined, DURATION)).toEqual({ start: 0, end: 30 });
  });
  it("finite range", () => {
    expect(temporalWindow({ start: 10, end: 15 }, DURATION)).toEqual({ start: 10, end: 15 });
  });
  it("open end runs to +infinity", () => {
    expect(temporalWindow({ start: 10 }, DURATION)).toEqual({ start: 10, end: Number.POSITIVE_INFINITY });
  });
});

describe("isActiveAt boundaries (half-open [start, end))", () => {
  it("inactive before start", () => {
    expect(isActiveAt(ov({}), 9.999)).toBe(false);
  });
  it("active exactly at start", () => {
    expect(isActiveAt(ov({}), 10)).toBe(true);
  });
  it("active inside window", () => {
    expect(isActiveAt(ov({}), 12)).toBe(true);
  });
  it("inactive exactly at end", () => {
    expect(isActiveAt(ov({}), 15)).toBe(false);
  });
  it("inactive after end", () => {
    expect(isActiveAt(ov({}), 15.001)).toBe(false);
  });
  it("open-ended overlay stays active past end of video", () => {
    const openEnded = ov({ startTime: 10, endTime: Number.POSITIVE_INFINITY });
    expect(isActiveAt(openEnded, 29.999)).toBe(true);
    expect(isActiveAt(openEnded, 100)).toBe(true);
  });
});