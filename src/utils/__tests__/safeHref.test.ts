import { beforeEach, describe, expect, it, vi } from "vitest";
import { safeHref, safeHrefOrWarn } from "../safeHref";
import { _resetWarnings } from "../warn";

describe("safeHref", () => {
  describe("accepts safe URLs", () => {
    const safe = [
      "https://example.com",
      "http://example.com/foo?bar=1",
      "HTTPS://EXAMPLE.COM",
      "mailto:a@b.com",
      "tel:+15555551234",
      "sms:+15555551234",
      "/relative",
      "./sibling",
      "../parent",
      "?query=only",
      "#fragment",
      "example.com/implicit-relative",
      "",
    ];
    for (const url of safe) {
      it(`passes: ${JSON.stringify(url)}`, () => {
        expect(safeHref(url)).toBe(url);
      });
    }
  });

  describe("rejects unsafe URLs", () => {
    const unsafe = [
      "javascript:alert(1)",
      "JAVASCRIPT:alert(1)",
      "jAvAsCrIpT:alert(1)",
      "\tjavascript:alert(1)",
      "  javascript:alert(1)",
      "\u0000javascript:alert(1)",
      "vbscript:msgbox(1)",
      "data:text/html,<script>alert(1)</script>",
      "file:///etc/passwd",
      "chrome://settings",
    ];
    for (const url of unsafe) {
      it(`blocks: ${JSON.stringify(url)}`, () => {
        expect(safeHref(url)).toBe("#");
      });
    }
  });

  it("rejects non-string input", () => {
    expect(safeHref(undefined)).toBe("#");
    expect(safeHref(null)).toBe("#");
    expect(safeHref(123)).toBe("#");
    expect(safeHref({ href: "https://x.com" })).toBe("#");
  });

  it("respects custom fallback", () => {
    expect(safeHref("javascript:alert(1)", { fallback: "about:blank" })).toBe(
      "about:blank"
    );
  });

  it("allows additional protocols when opted-in", () => {
    expect(safeHref("myapp://open", { allowProtocols: ["myapp:"] })).toBe(
      "myapp://open"
    );
  });

  it("does NOT allow additional protocols by default", () => {
    expect(safeHref("myapp://open")).toBe("#");
  });

  it("allows empty string through unchanged", () => {
    expect(safeHref("")).toBe("");
  });
});

describe("safeHrefOrWarn", () => {
  beforeEach(() => {
    _resetWarnings();
  });
  it("warns in dev when rejecting a non-empty unsafe URL", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const out = safeHrefOrWarn("javascript:alert(1)", "TestComponent");
    expect(out).toBe("#");
    expect(spy).toHaveBeenCalledOnce();
    const msg = spy.mock.calls[0]?.[0];
    expect(String(msg)).toContain("TestComponent");
    expect(String(msg)).toContain("javascript:alert(1)");
    spy.mockRestore();
  });

  it("does not warn for safe URLs", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    safeHrefOrWarn("https://example.com", "TestComponent");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("does not warn for empty string", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    safeHrefOrWarn("", "TestComponent");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("does not warn for undefined", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    safeHrefOrWarn(undefined, "TestComponent");
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
