import { describe, expect, it } from "vitest";
import { toneAttrs } from "../toneAttrs";

describe("toneAttrs", () => {
  it("emits the base class when no tone/variant/size provided", () => {
    const result = toneAttrs("vf-stat");
    expect(result.className).toBe("vf-stat");
    expect(result.attrs).toEqual({});
  });

  it("appends BEM class modifiers and data-* attrs for tone", () => {
    const result = toneAttrs("vf-stat", { tone: "success" });
    expect(result.className).toBe("vf-stat vf-stat--success");
    expect(result.attrs).toEqual({ "data-tone": "success" });
  });

  it("emits all three modifiers (tone, variant, size) at once", () => {
    const result = toneAttrs("vf-button", {
      tone: "danger",
      variant: "solid",
      size: "lg",
    });
    expect(result.className).toBe(
      "vf-button vf-button--danger vf-button--solid vf-button--lg"
    );
    expect(result.attrs).toEqual({
      "data-tone": "danger",
      "data-variant": "solid",
      "data-size": "lg",
    });
  });

  it("omits undefined values", () => {
    const result = toneAttrs("vf-x", { tone: undefined, variant: "outline" });
    expect(result.className).toBe("vf-x vf-x--outline");
    expect(result.attrs).toEqual({ "data-variant": "outline" });
  });

  it("does not emit data-* for empty-string values", () => {
    const result = toneAttrs("vf-x", { tone: "" });
    expect(result.className).toBe("vf-x");
    expect(result.attrs).toEqual({});
  });
});
