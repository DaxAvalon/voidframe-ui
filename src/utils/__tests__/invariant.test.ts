import { describe, expect, it } from "vitest";
import { invariant, invariantViolation } from "../invariant";

describe("invariant", () => {
  it("does not throw for true", () => {
    expect(() => invariant(true, "msg")).not.toThrow();
  });

  it("throws for false", () => {
    expect(() => invariant(false, "msg")).toThrow("msg");
  });

  it("throws for null", () => {
    expect(() => invariant(null, "null check")).toThrow("null check");
  });

  it("throws for undefined", () => {
    expect(() => invariant(undefined, "undef check")).toThrow("undef check");
  });

  it("throws for 0", () => {
    expect(() => invariant(0, "zero")).toThrow("zero");
  });

  it('throws for ""', () => {
    expect(() => invariant("", "empty string")).toThrow("empty string");
  });

  it("does not throw for 1", () => {
    expect(() => invariant(1, "msg")).not.toThrow();
  });

  it("does not throw for {}", () => {
    expect(() => invariant({}, "msg")).not.toThrow();
  });
});

describe("invariantViolation", () => {
  it("always throws", () => {
    expect(() => invariantViolation("always")).toThrow("always");
  });

  it("includes the correct error message", () => {
    expect(() => invariantViolation("specific message")).toThrow("specific message");
  });
});
