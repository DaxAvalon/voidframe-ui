// `voidframe-ui/testing` must be importable without the optional peer
// `jest-axe`; only calling expectNoA11yViolations needs it.
import { describe, expect, it, vi } from "vitest";

vi.mock("jest-axe", () => {
  throw new Error("Cannot find module 'jest-axe'");
});

describe("testing entry without jest-axe", () => {
  it("imports and renders without the peer installed", async () => {
    const testing = await import("../index");
    expect(typeof testing.renderWithVoidframe).toBe("function");
    expect(typeof testing.installMatchMedia).toBe("function");
    const { container } = testing.renderWithVoidframe(<button>ok</button>);
    expect(container.querySelector("button")).not.toBeNull();
  });

  it("explains the missing peer when the axe helper is called", async () => {
    const { expectNoA11yViolations } = await import("../index");
    await expect(expectNoA11yViolations(document.body)).rejects.toThrow(
      /optional peer `jest-axe`/
    );
  });
});
