import { describe, expect, it } from "vitest";
import { buttonDisabledAttrs } from "../buttonDisabledAttrs";

describe("buttonDisabledAttrs", () => {
  it("returns native disabled + aria-disabled when disabled is true", () => {
    expect(buttonDisabledAttrs(true)).toEqual({
      disabled: true,
      "aria-disabled": "true",
    });
  });

  it("returns empty object when disabled is false", () => {
    expect(buttonDisabledAttrs(false)).toEqual({});
  });

  it("returns empty object when disabled is undefined", () => {
    expect(buttonDisabledAttrs(undefined)).toEqual({});
  });
});
