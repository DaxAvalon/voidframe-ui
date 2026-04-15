# Agent C — Security review

> 15 findings. Strongest: MarkdownEditor, RichTextEditor, Mermaid, and
> anchor components all have user-HTML / URL paths that land in the
> DOM without validation or escaping. `Chat.tsx` uses raw
> `useLayoutEffect`. `useThemePersistence` reads `localStorage` during
> render. `react-live` is a `devDependency` despite being imported by
> a public export.

## Findings

### 1. MarkdownRenderer emits raw unescaped URL into `href` (javascript: XSS)
**Severity:** critical
**Evidence:** `src/components/MarkdownEditor.tsx:180` — link-replace interpolates the URL and text directly into an anchor tag template literal.
**Problem:** Link URL `u` is interpolated into HTML without protocol validation or attribute escaping, so `[x](javascript:alert(1))` and `[x](" onmouseover="alert(1))` both execute. This HTML is then written via `innerHTML` in `PreviewPane` and `MarkdownRenderer` (Viewers.tsx:46-49) and shipped to every consumer.
**Fix:** Reject non-`http(s)`/`mailto:`/relative URLs and HTML-escape the attribute value before interpolation.

### 2. Inline `<code>` content in markdown is not re-escaped
**Severity:** high
**Evidence:** `src/components/MarkdownEditor.tsx:179` — backtick-replace wraps captured content directly in a `<code>` tag template literal.
**Problem:** The global escape runs first then backticks pull out the content — but the link-replace step runs AFTER emphasis and code, so an `<a href="...">` emitted for a link can be re-matched by `*...*` and corrupt the output in ways that bypass escaping (e.g. an attribute containing `*foo*` becomes `<em>`-tagged inside the href).
**Fix:** Tokenize once, then stringify; do not chain global regex replaces over already-emitted HTML.

### 3. RichTextEditor accepts unsanitized HTML `value` and writes it via `innerHTML`
**Severity:** high
**Evidence:** `src/components/RichTextEditor.tsx:34-36, 200` — `writeHTML(el, html)` where `html` comes directly from the `value` prop.
**Problem:** A doc comment tells consumers "sanitize first" but the component publicly accepts an HTML string and writes it to the DOM with no sanitization. Downstream apps routinely trust framework defaults; shipping this without a built-in sanitize step is a foot-gun.
**Fix:** Sanitize inputs with a minimal tag/attr allowlist (or require a `sanitize` prop with no default passthrough) and reject `javascript:` URLs from `createLink` in `applyCommand` (line 154).

### 4. `createLink` takes arbitrary prompt string, no URL validation
**Severity:** high
**Evidence:** `src/components/RichTextEditor.tsx:152-155` — `const url = arg ?? window.prompt("URL"); if (url) bridge.call(document, "createLink", false, url);`
**Problem:** `javascript:alert(1)` entered at the prompt produces an active XSS anchor inside the editor HTML, which is then read back via `readHTML` and round-tripped to the consumer.
**Fix:** Validate `url` against `^(https?:|mailto:|/|#)` before calling `createLink`.

### 5. IFrame sandbox default enables both scripts and forms with same-origin unset
**Severity:** medium
**Evidence:** `src/components/Embed.tsx:35` — `sandbox = "allow-scripts allow-forms"`
**Problem:** Default is reasonable but there is no `src` allowlist nor a `referrerPolicy` default, and `allow-scripts` together with any future accidental `allow-same-origin` escape would be catastrophic. There is also no warning when a consumer passes `allow-same-origin allow-scripts` together (the known sandbox-escape combo).
**Fix:** Dev-time `warn()` when `sandbox` contains both `allow-scripts` and `allow-same-origin`; document/require explicit opt-in for cross-origin `src`.

### 6. Anchor components accept arbitrary `href` with no `javascript:` filter
**Severity:** high
**Evidence:** `src/components/Navigation.tsx:152`, `src/components/BreadcrumbMenu.tsx:87,121,169`, `src/components/Identity.tsx:216`, `src/components/ChatCitations.tsx:158,243`, `src/components/ChatComposer.tsx:922` (`Mention`), `src/primitives/SkipToContent.tsx:24`, `src/components/Lightbox.tsx:172`, `src/components/Embed.tsx:167` (`DocumentPreview`).
**Problem:** Every link-capable component forwards `href` untouched. A consumer binding `items[].href` or `source.url` from untrusted JSON directly gets `javascript:` clickjacking. `Lightbox`'s Download anchor uses `current.src` — a data URL or `javascript:` here is user-controlled.
**Fix:** Add a shared `safeHref()` helper that strips protocols not in `{http, https, mailto, tel, relative, fragment}` and use it in every anchor component.

### 7. `target="_blank"` missing `rel="noopener"` in several spots
**Severity:** medium
**Evidence:** `src/components/ChatCitations.tsx:160` (`rel="noreferrer"` only), `src/components/ChatCitations.tsx:245` (same), `src/components/Identity.tsx:218` (same).
**Problem:** `rel="noreferrer"` implies `noopener` in modern browsers but *older* browsers (still in consumer apps' support matrices) leak `window.opener`, enabling reverse tab-nabbing. The MarkdownRenderer path (Viewers.tsx:886) gets this right with `noreferrer noopener`; these do not.
**Fix:** Use `rel="noreferrer noopener"` consistently.

### 8. `Chat.tsx` uses raw `useLayoutEffect` — SSR warning + hydration drift
**Severity:** medium
**Evidence:** `src/components/Chat.tsx:23,201`
**Problem:** Despite `useIsomorphicLayoutEffect` existing and being used elsewhere, `Chat.tsx` imports the raw hook and calls it for autoscroll. Produces console warnings under SSR (Next.js) and can mis-time scroll on first paint.
**Fix:** Swap to `useIsomorphicLayoutEffect`.

### 9. `useThemePersistence` reads `localStorage` during initial render
**Severity:** medium
**Evidence:** `src/hooks/useThemePersistence.ts:77-85` — `readInitial` calls `backend.get(key)` inside the `useState` initializer.
**Problem:** Under SSR the `defaultStorage()` no-op returns null (fine) but under hydration, the client sees a persisted value while the server rendered `defaultTheme`, producing a hydration mismatch for any consumer wiring theme classes to rendered attributes. `DataGrid.tsx:98-107` has the same pattern for persisted column state.
**Fix:** Initialize with default, then set the persisted value in a post-mount `useEffect` (or gate the read behind `useSyncExternalStore`).

### 10. `Mermaid` initializes with `securityLevel: "loose"`
**Severity:** high
**Evidence:** `src/components/RichEmbed.tsx:90` — `api.initialize({ theme, securityLevel: "loose" });`
**Problem:** Mermaid `loose` mode explicitly allows click handlers and inline HTML in node labels, and the produced SVG is then written via `innerHTML` (line 116). A malicious `chart` string can execute arbitrary script. The comment "trusted output from mermaid itself" is false under `loose`.
**Fix:** Change default to `securityLevel: "strict"`; expose as a prop for consumers who opt in.

### 11. Unsanitized `highlight()` return string written via `innerHTML`
**Severity:** medium
**Evidence:** `src/components/Viewers.tsx:66-70` (docstring) + the `HTMLPane` helper that writes any returned string through `innerHTML`.
**Problem:** CodeBlock lets consumers pass a `highlight` function returning a string which is then written unescaped. Typical use pipes user-pasted code through `shiki`, which is safe, but a consumer composing a highlighter incorrectly ships XSS. The pattern should at minimum DOM-parse + re-serialize through a safe allowlist or require a `ReactNode` return.
**Fix:** Default to ReactNode; accept strings only when `sanitize` is explicitly provided.

### 12. SignaturePad `background` and `strokeColor` flow unchecked into Canvas `fillStyle`
**Severity:** low
**Evidence:** `src/components/SignaturePad.tsx:84-88`
**Problem:** Canvas `fillStyle`/`strokeStyle` do not execute script, but a consumer binding these to user input could be surprised — not XSS, just noted for defense-in-depth. The `toDataURL()` properly re-clears on `clear()` (fix confirmed).
**Fix:** None required; consider restricting to a CSS-color parse.

### 13. `DevPanel` warnings tab stores raw warn args including user data
**Severity:** low
**Evidence:** `src/utils/warn.ts:85-101` — `warn`/`warnOnce` push `args` into `history` unredacted.
**Problem:** Components pass context objects (form values, prop snapshots) as `args`. In dev this is fine; if a consumer sets `showInProduction={true}` they inadvertently display internal state to end users. `isProd` check is correctly the only gate, and `showInProduction` defaults to `false`. No leak absent explicit opt-in — verified at `DevPanel.tsx:116`. Still worth a redaction pass.
**Fix:** Strip/structurally clone args before push; document that enabling `showInProduction` exposes dev payloads.

### 14. `react-live` (Babel Standalone) shipped as devDependency but imported at runtime
**Severity:** medium
**Evidence:** `package.json:146` — `"react-live": "^4.1.6"` in **devDependencies**.
**Problem:** If the Playground component is exported from the package entry, consumers' bundlers will try to resolve `react-live` and fail, OR (worse) if it's bundled into `dist/voidframe.es.js`, the Babel standalone transformer (which relies on dynamic code generation) ships to every downstream app. Needs verification: grep `dist/voidframe.es.js` for `react-live`. Either way the classification is wrong.
**Fix:** Move to `peerDependencies` with `optional: true`, lazy-load via dynamic `import()`, and add a CSP-nonce note for consumers.

### 15. `d3-sankey@0.12.3` is the latest release from 2022 (>3y unmaintained)
**Severity:** low
**Evidence:** `package.json:102`
**Problem:** No CVEs of note, but the maintainer has not published; if a transitive chain reports a CVE you cannot patch. `d3-force` peer `>=3.0.0` is unbounded (next major could break consumers). Other d3 packages are current.
**Fix:** Pin `d3-force` peer with an upper bound, audit `d3-sankey` fork status.
