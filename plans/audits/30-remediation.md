# Security Audit 30 — Remediation

No P0 or P1 findings. The hardening wave below addresses three P2 items and
four P3 documentation nudges. Each fix includes a regression test.

---

## P0 fixes: none required

Phase-30 hardening is verified effective. No exploitable unauthenticated
vulnerability found in this audit.

## P1 fixes: none required

No defense-in-depth failure was both directly exploitable and lacking
mitigating factors.

---

## P2 hardening wave (one commit per file)

### Fix 1.1: `Anchor` item.href missing `safeHref`
- **Finding:** §3.1 in 30-findings.md
- **File:** `src/components/Anchor.tsx` (line 124)
- **Change:**
  ```diff
  +import { safeHref } from "../utils/safeHref";
  …
  -            <a
  -              href={item.href}
  +            <a
  +              href={safeHref(item.href)}
  ```
- **Test:** add to `src/components/__tests__/Anchor.test.tsx`:
  ```ts
  it("rejects javascript: hrefs on modifier-click", () => {
    const items = [{ key: "x", label: "X",
      href: "javascript:window.__pwned=1" as string }];
    const { container } = render(<Anchor items={items} />);
    const a = container.querySelector("a")!;
    expect(a.getAttribute("href")).toBe("#");
  });
  ```
- **Disclosure:** N — never shipped as exploitable; requires consumer to bypass
  TypeScript AND victim modifier-click.

### Fix 1.2: `IFrame.src` not routed through `safeHref`; unsafe sandbox combos not warned
- **Finding:** §3.2 in 30-findings.md
- **File:** `src/components/Embed.tsx` (lines 50-62)
- **Change:**
  ```diff
  +import { safeHref } from "../utils/safeHref";
  +
  +const UNSAFE_SANDBOX_COMBO = new Set(["allow-scripts", "allow-same-origin"]);
  +function warnSandbox(sandbox: string) {
  +  if (typeof process === "undefined" || process.env?.NODE_ENV === "production") return;
  +  const tokens = new Set(sandbox.split(/\s+/).filter(Boolean));
  +  if (tokens.has("allow-scripts") && tokens.has("allow-same-origin")) {
  +    // eslint-disable-next-line no-console
  +    console.warn("[voidframe] IFrame: sandbox=\"allow-scripts allow-same-origin\" defeats the sandbox");
  +  }
  +}
  …
     return (
  -    <iframe
  -      ref={ref}
  -      src={src}
  +    <iframe
  +      ref={ref}
  +      src={safeHref(src, { allowProtocols: ["about:"] })}
         title={title}
         sandbox={sandbox}
  ```
  And call `warnSandbox(sandbox)` inside the component body (once, gated on a
  `useEffect` with `sandbox` dep).
- **Test:** `src/components/__tests__/Embed.test.tsx`:
  ```ts
  it("rejects javascript: iframe src", () => {
    const { container } = render(
      <IFrame src={"javascript:1" as string} title="t" />
    );
    expect(container.querySelector("iframe")!.getAttribute("src")).toBe("#");
  });
  it("warns on unsafe sandbox combo in dev", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<IFrame src="https://x" title="t" sandbox="allow-scripts allow-same-origin" />);
    expect(warn).toHaveBeenCalled();
  });
  ```
- **Disclosure:** N

### Fix 1.3: ReDoS surface in `RegExpTester` + `LogViewer`
- **Finding:** §5.4 in 30-findings.md
- **Files:**
  - `src/components/RegExpTester.tsx` (lines 35-65)
  - `src/components/Viewers/LogViewer.tsx` (lines 101-105, 131-147)
- **Change:** introduce a shared helper `src/utils/compileUserRegExp.ts`:
  ```ts
  export const MAX_PATTERN_LENGTH = 512;
  export const MAX_HAYSTACK_LENGTH = 10_000;

  export function compileUserRegExp(
    pattern: string,
    flags: string
  ): RegExp | null {
    if (!pattern || pattern.length > MAX_PATTERN_LENGTH) return null;
    try {
      return new RegExp(pattern, flags);
    } catch {
      return null;
    }
  }
  ```
  RegExpTester replaces both `new RegExp` sites with `compileUserRegExp`, and
  truncates `testString` before matching.
  LogViewer wraps `filterText` / `highlight` compilation in the helper and
  caps per-message length before `.test` / `.matchAll`.
- **Test:** `src/utils/__tests__/compileUserRegExp.test.ts`:
  ```ts
  it("rejects oversized patterns", () => {
    expect(compileUserRegExp("a".repeat(600), "g")).toBeNull();
  });
  it("rejects malformed patterns", () => {
    expect(compileUserRegExp("(unclosed", "")).toBeNull();
  });
  it("compiles safe patterns", () => {
    expect(compileUserRegExp("\\d+", "g")).toBeInstanceOf(RegExp);
  });
  ```
  Additionally, benchmark regression test: RegExpTester with pattern `(a+)+$`
  and test string `"a".repeat(30) + "b"` should complete in under 250ms (or
  fail fast to `null`).
- **Disclosure:** N (self-DoS only)

### Fix 2.1: Raise `dompurify` peer floor
- **Finding:** §1.2 in 30-findings.md
- **File:** `package.json` (line 125)
- **Change:**
  ```diff
  -    "dompurify": ">=3.0.0",
  +    "dompurify": ">=3.2.4",
  ```
- **Test:** `scripts/check-peer-deps.mjs` existing snapshot test, plus add a
  CHANGELOG entry noting the floor bump and reasoning (GHSA-mmhx-hmjr-r674 /
  GHSA-vhxf-7vqr-mrjg mitigated).
- **Disclosure:** N — consumers can already install 3.2.4+; we only tighten
  the minimum.

---

## P3 documentation items (roll into plan 32)

- **§1.3 `react-live` peer floor doc:** README `./dev` subpath warning — add
  a "not for production bundles" note near the Playground section.
- **§2.3 CodeBlock `highlight` prop:** README CodeBlock section — make the
  sanitize contract more prominent with an example using `highlight.js`
  `escape` helper.
- **§4.3 Playground subpath:** CHANGELOG + README — mark `./dev` as
  dev-build-only, with example Vite/webpack exclusion.
- **§7.2 `theme-script.js` CSP:** README — add a short section explaining
  either inline `<script>` + `script-src 'unsafe-inline'` OR external
  `/theme-script.js` with SRI hash.

---

## Rollout order

1. Commit Fix 2.1 (`package.json` peer-floor bump) — lowest risk.
2. Commit Fix 1.1 (`Anchor` safeHref) — single-line fix, test.
3. Commit Fix 1.2 (`IFrame` safeHref + sandbox warning) — slightly wider
   surface, test.
4. Commit Fix 1.3 (ReDoS guard helper) — new shared util; update both
   consumers + tests.
5. Hand P3 items to plan 32 (docs audit).

Each commit should include its regression test in the same commit so future
regressions flip the build red.
