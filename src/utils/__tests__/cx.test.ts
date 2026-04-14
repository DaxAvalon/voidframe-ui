import { describe, expect, it } from "vitest";
import { cx } from "../cx";

describe("cx", () => {
  it("joins string args", () => {
    expect(cx("a", "b", "c")).toBe("a b c");
  });

  it("drops falsy values", () => {
    expect(cx("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("expands object entries with truthy values", () => {
    expect(cx("base", { active: true, hidden: false, focused: 1, hovered: 0 })).toBe(
      "base active focused"
    );
  });

  it("flattens arrays recursively", () => {
    expect(cx(["a", ["b", ["c", "d"]]])).toBe("a b c d");
  });

  it("returns empty string when no truthy args", () => {
    expect(cx(false, null, undefined)).toBe("");
  });

  it("coerces numbers to strings", () => {
    expect(cx(0, 1, 2)).toBe("1 2"); // 0 is falsy
  });
});
