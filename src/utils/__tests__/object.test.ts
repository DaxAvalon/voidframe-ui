import { describe, expect, it } from "vitest";
import { pick, omit, splitProps } from "../object";

describe("pick", () => {
  it("selects specified keys", () => {
    expect(pick({ a: 1, b: 2, c: 3 }, ["a", "c"])).toEqual({ a: 1, c: 3 });
  });

  it("returns empty object for empty keys", () => {
    expect(pick({ a: 1, b: 2 }, [])).toEqual({});
  });

  it("skips non-existent keys", () => {
    expect(pick({ a: 1 } as Record<string, unknown>, ["a", "z" as never])).toEqual({ a: 1 });
  });
});

describe("omit", () => {
  it("excludes specified keys", () => {
    expect(omit({ a: 1, b: 2, c: 3 }, ["b"])).toEqual({ a: 1, c: 3 });
  });

  it("returns full object for empty keys", () => {
    expect(omit({ a: 1, b: 2 }, [])).toEqual({ a: 1, b: 2 });
  });

  it("ignores non-existent keys", () => {
    expect(omit({ a: 1, b: 2 } as Record<string, unknown>, ["z" as never])).toEqual({ a: 1, b: 2 });
  });
});

describe("splitProps", () => {
  it("splits into picked and rest", () => {
    const [picked, rest] = splitProps({ a: 1, b: 2, c: 3 }, ["a", "c"]);
    expect(picked).toEqual({ a: 1, c: 3 });
    expect(rest).toEqual({ b: 2 });
  });

  it("does not mutate the original object", () => {
    const original = { a: 1, b: 2, c: 3 };
    splitProps(original, ["a"]);
    expect(original).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("preserves undefined values", () => {
    const obj = { a: undefined, b: 2 };
    expect(pick(obj, ["a"])).toEqual({ a: undefined });
    expect("a" in pick(obj, ["a"])).toBe(true);
  });

  it("preserves symbol-keyed properties in omit", () => {
    const sym = Symbol("test");
    const obj = { a: 1, [sym]: "symbol" } as Record<string, unknown>;
    const result = omit(obj, ["a"]);
    expect((result as Record<symbol, unknown>)[sym]).toBe("symbol");
  });
});
