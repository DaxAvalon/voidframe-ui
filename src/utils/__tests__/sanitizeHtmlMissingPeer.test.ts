// Without dompurify installed, importing still works; sanitising falls back to
// escaped text and ensureSanitizer() names the missing peer.
import { describe, expect, it, vi } from "vitest";

vi.mock("dompurify", () => {
  throw new Error("Cannot find module 'dompurify'");
});

describe("sanitizeHtml without dompurify", () => {
  it("imports, escapes, and reports the missing peer", async () => {
    const { ensureSanitizer, sanitizeHtml, isSanitizerReady } = await import("../sanitizeHtml");
    expect(sanitizeHtml("<i>a</i>")).toBe("&lt;i&gt;a&lt;/i&gt;");
    await expect(ensureSanitizer()).rejects.toThrow(/npm install dompurify/);
    expect(isSanitizerReady()).toBe(false);
    // The forms entry (RichTextEditor) and the root must import cleanly too.
    const forms = await import("../../subpaths/forms");
    expect(typeof forms.RichTextEditor).toBe("object");
    const core = await import("../../subpaths/core");
    expect(typeof core.VoidframeProvider).toBe("function");
    expect(typeof core.useThemePersistence).toBe("function");
  });
});
