import { describe, expect, it } from "vitest";
import { mergeStyles } from "../mergeStyles";

describe("mergeStyles", () => {
  it("returns a single object unchanged", () => {
    expect(mergeStyles({ color: "red" })).toEqual({ color: "red" });
  });

  it("merges two objects with later overriding earlier", () => {
    expect(mergeStyles({ color: "red", fontSize: 14 }, { color: "blue" })).toEqual({
      color: "blue",
      fontSize: 14,
    });
  });

  it("skips undefined values without overriding existing", () => {
    expect(
      mergeStyles({ color: "red", fontSize: 14 }, { color: undefined, fontWeight: "bold" })
    ).toEqual({ color: "red", fontSize: 14, fontWeight: "bold" });
  });

  it("skips null, false, and undefined args", () => {
    expect(mergeStyles(null, false, undefined, { color: "red" })).toEqual({ color: "red" });
  });

  it("returns empty object when given no truthy args", () => {
    expect(mergeStyles()).toEqual({});
    expect(mergeStyles(null, false, undefined)).toEqual({});
  });

  it("preserves CSS custom properties", () => {
    expect(
      mergeStyles({ "--vf-color": "red" } as React.CSSProperties, { "--vf-size": "16px" } as React.CSSProperties)
    ).toEqual({ "--vf-color": "red", "--vf-size": "16px" });
  });

  it("preserves numeric values", () => {
    expect(mergeStyles({ fontSize: 14, opacity: 0.5, zIndex: 100 })).toEqual({
      fontSize: 14,
      opacity: 0.5,
      zIndex: 100,
    });
  });

  it("merges 3+ objects in order", () => {
    expect(
      mergeStyles({ color: "red" }, { color: "blue", fontSize: 14 }, { color: "green" })
    ).toEqual({ color: "green", fontSize: 14 });
  });
});
