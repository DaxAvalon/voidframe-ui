import { describe, expect, it } from "vitest";
import { breakpointClass, responsiveClasses } from "../responsiveClasses";

describe("responsiveClasses", () => {
  it("plain string returns single class", () => {
    expect(responsiveClasses("cols", "2")).toBe("vf-cols-2");
  });

  it("responsive object with base and md", () => {
    const result = responsiveClasses("cols", { base: "1", md: "2" });
    expect(result).toContain("vf-cols-1");
    expect(result).toContain("md:vf-cols-2");
  });

  it("handles all breakpoints", () => {
    const result = responsiveClasses("gap", {
      base: "4",
      sm: "6",
      md: "8",
      lg: "10",
      xl: "12",
    });
    expect(result).toContain("vf-gap-4");
    expect(result).toContain("sm:vf-gap-6");
    expect(result).toContain("md:vf-gap-8");
    expect(result).toContain("lg:vf-gap-10");
    expect(result).toContain("xl:vf-gap-12");
  });

  it("breakpointClass without breakpoint returns base class", () => {
    expect(breakpointClass("size", "lg")).toBe("vf-size-lg");
  });

  it("breakpointClass with breakpoint returns prefixed class", () => {
    expect(breakpointClass("size", "lg", "md")).toBe("md:vf-size-lg");
  });

  it("empty object returns empty string", () => {
    expect(responsiveClasses("cols", {})).toBe("");
  });

  it("undefined value returns empty string", () => {
    expect(responsiveClasses("cols", undefined as unknown as string)).toBe("");
  });
});
