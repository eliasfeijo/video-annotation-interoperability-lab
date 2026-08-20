import { describe, it, expect } from "vitest";
import { parseTemporal, parseSpatial, parseFragmentValue } from "../src/lib/selectors.ts";

describe("parseTemporal", () => {
  it("parses full range t=10,15", () => {
    expect(parseTemporal("10,15")).toEqual({ start: 10, end: 15 });
  });
  it("parses open start t=10", () => {
    expect(parseTemporal("10")).toEqual({ start: 10 });
  });
  it("parses open end t=,15", () => {
    expect(parseTemporal(",15")).toEqual({ start: 0, end: 15 });
  });
  it("parses npt: scheme", () => {
    expect(parseTemporal("npt:10.5,15.25")).toEqual({ start: 10.5, end: 15.25 });
  });
  it("rejects reversed ranges", () => {
    expect(parseTemporal("15,10")).toBeNull();
  });
  it("rejects garbage", () => {
    expect(parseTemporal("abc")).toBeNull();
  });
  it("empty means no temporal info (whole resource)", () => {
    expect(parseTemporal("")).toBeNull();
  });
});

describe("parseSpatial", () => {
  it("parses pixel xywh", () => {
    expect(parseSpatial("0,0,960,540")).toEqual({ x: 0, y: 0, w: 960, h: 540 });
  });
  it("parses percent xywh against canvas dims", () => {
    expect(parseSpatial("pct:50,0,25,25", 1920, 1080)).toEqual({ x: 960, y: 0, w: 480, h: 270 });
  });
  it("rejects non-4-part values", () => {
    expect(parseSpatial("10,20,30")).toBeNull();
    expect(parseSpatial("a,b,c,d")).toBeNull();
  });
  it("rejects zero-size regions", () => {
    expect(parseSpatial("10,10,0,50")).toBeNull();
  });
});

describe("parseFragmentValue", () => {
  it("parses t only", () => {
    expect(parseFragmentValue("t=10,15")).toEqual({ temporal: { start: 10, end: 15 } });
  });
  it("parses xywh only", () => {
    expect(parseFragmentValue("xywh=0,0,1920,1080", 1920, 1080)).toEqual({
      spatial: { x: 0, y: 0, w: 1920, h: 1080 },
    });
  });
  it("parses combined xywh and t", () => {
    expect(parseFragmentValue("xywh=100,50,200,300&t=10,20", 1920, 1080)).toEqual({
      spatial: { x: 100, y: 50, w: 200, h: 300 },
      temporal: { start: 10, end: 20 },
    });
  });
  it("ignores unknown sub-fragments", () => {
    expect(parseFragmentValue("track=1&t=5,6", 1, 1)).toEqual({ temporal: { start: 5, end: 6 } });
  });
});