// dompurify is an optional peer loaded on first use.
import { describe, expect, it } from "vitest";

import { ensureSanitizer, isSanitizerReady, sanitizeHtml } from "../sanitizeHtml";

describe("sanitizeHtml (lazy peer)", () => {
  it("escapes markup before the purifier has loaded, then sanitises for real", async () => {
    // Fresh module state: nothing loaded yet in this test file's isolate.
    if (!isSanitizerReady()) {
      expect(sanitizeHtml('<b>x</b><script>1</script>')).toBe(
        "&lt;b&gt;x&lt;/b&gt;&lt;script&gt;1&lt;/script&gt;"
      );
    }
    await ensureSanitizer();
    expect(isSanitizerReady()).toBe(true);
    expect(sanitizeHtml('<b>x</b><script>alert(1)</script>')).toBe("<b>x</b>");
  });

  it("keeps allowed links and strips unknown tags", async () => {
    await ensureSanitizer();
    const out = sanitizeHtml('<a href="https://x.test">x</a><img src=x onerror=alert(1)>');
    expect(out).toContain('<a href="https://x.test">x</a>');
    expect(out).not.toContain("<img");
  });
});
