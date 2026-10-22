import { afterEach, describe, expect, it, vi } from "vitest";
import { auditTokens, resetTokenAudit, warnUnknownTokens } from "../auditTokens";

// Stylesheets are modelled directly so the test does not depend on the DOM
// implementation's CSSOM support.
function sheet(...rules: string[]): CSSStyleSheet {
  return { cssRules: rules.map((cssText) => ({ cssText })) } as unknown as CSSStyleSheet;
}
function crossOrigin(): CSSStyleSheet {
  return {
    get cssRules(): CSSRuleList {
      throw new DOMException("blocked", "SecurityError");
    },
  } as unknown as CSSStyleSheet;
}

afterEach(() => {
  resetTokenAudit();
  vi.restoreAllMocks();
});

describe("auditTokens", () => {
  it("reports var(--vf-*) names no stylesheet defines and counts unreadable sheets", () => {
    const a = sheet(":root { --vf-text-0: #fff; --vf-text-muted: var(--vf-text-3); }");
    const b = sheet(".x { color: var(--vf-text-muted); border: 1px solid var(--vf-border); background: var( --vf-surface-9 ); }");
    const result = auditTokens([a, b, crossOrigin()]);
    expect(result.defined).toEqual(["--vf-text-0", "--vf-text-muted"]);
    expect(result.unknown).toEqual(["--vf-border", "--vf-surface-9", "--vf-text-3"]);
    expect(result.skipped).toBe(1);
  });

  it("warnUnknownTokens scans document.styleSheets and warns once", () => {
    vi.spyOn(document, "styleSheets", "get").mockReturnValue([
      sheet(".y { color: var(--vf-nope); }"),
    ] as unknown as StyleSheetList);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const r = warnUnknownTokens();
    expect(r?.unknown).toEqual(["--vf-nope"]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain("--vf-nope");
    expect(warnUnknownTokens()).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("stays quiet when every reference is defined", () => {
    vi.spyOn(document, "styleSheets", "get").mockReturnValue([
      sheet(":root { --vf-bg-0: #000; }", ".z { background: var(--vf-bg-0); }"),
    ] as unknown as StyleSheetList);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnUnknownTokens();
    expect(warn).not.toHaveBeenCalled();
  });
});
