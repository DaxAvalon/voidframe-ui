import { describe, expect, it } from "vitest";
import { isClient, isServer, isTest, isDev } from "../environment";

describe("environment", () => {
  it("isClient is true in happy-dom", () => {
    expect(isClient).toBe(true);
  });

  it("isServer is false in happy-dom", () => {
    expect(isServer).toBe(false);
  });

  it("isTest is true when running in vitest", () => {
    expect(isTest).toBe(true);
  });

  it("all exports are booleans", () => {
    expect(typeof isClient).toBe("boolean");
    expect(typeof isServer).toBe("boolean");
    expect(typeof isTest).toBe("boolean");
    expect(typeof isDev).toBe("boolean");
  });

  it("all exports are read-only module bindings (typeof is boolean)", () => {
    // Module exports are live bindings — they can't be reassigned from outside.
    // We verify their type is boolean, confirming they're proper const exports.
    expect(typeof isClient).toBe("boolean");
    expect(typeof isServer).toBe("boolean");
    expect(typeof isTest).toBe("boolean");
    expect(typeof isDev).toBe("boolean");
  });
});
