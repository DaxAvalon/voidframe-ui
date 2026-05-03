import { describe, expect, it } from "vitest";
import { resolveItemKey, itemKeyAttrs } from "../useItemKey";

describe("resolveItemKey", () => {
  it("returns empty string when key is undefined", () => {
    expect(resolveItemKey(undefined, { id: "x" })).toBe("");
  });

  it("resolves keyof T against the item", () => {
    expect(resolveItemKey<{ id: string }>("id", { id: "abc" })).toBe("abc");
  });

  it("calls function-style keys", () => {
    const item = { id: 42 };
    const fn = (i: { id: number }) => i.id;
    expect(resolveItemKey<{ id: number }>(fn, item)).toBe("42");
  });

  it("stringifies number keys", () => {
    expect(resolveItemKey<{ n: number }>("n", { n: 7 })).toBe("7");
  });

  it("returns empty string for null/undefined values at the key", () => {
    expect(resolveItemKey<{ id: unknown }>("id", { id: null })).toBe("");
    expect(resolveItemKey<{ id: unknown }>("id", { id: undefined })).toBe("");
  });

  it("handles symbol-returning function keys without throwing", () => {
    const sym = Symbol("k");
    const fn = () => sym;
    const out = resolveItemKey<{}>(fn, {});
    expect(typeof out).toBe("string");
  });
});

describe("itemKeyAttrs", () => {
  it("returns empty object for empty key", () => {
    expect(itemKeyAttrs("row", "")).toEqual({});
  });

  it("emits data-row-key for kind=row", () => {
    expect(itemKeyAttrs("row", "abc")).toEqual({ "data-row-key": "abc" });
  });

  it("emits data-item-key for kind=item", () => {
    expect(itemKeyAttrs("item", "abc")).toEqual({ "data-item-key": "abc" });
  });

  it("emits data-node-key for kind=node", () => {
    expect(itemKeyAttrs("node", "abc")).toEqual({ "data-node-key": "abc" });
  });
});
