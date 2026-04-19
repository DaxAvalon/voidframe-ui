# Security Audit 30 — Findings

Audit date: 2026-04-17. Audit is READ-ONLY. Source not modified.

## Summary

| Severity | Count |
|---|---|
| P0 | 0 |
| P1 | 0 |
| P2 | 4 |
| P3 | 3 |
| P4 (verified safe) | 16 |

**Headline:** Phase-30 hardening (DOMPurify wrapper, safeHref, deepMerge guards) holds
up: no exploitable unauthenticated vulnerabilities found, and every HTML/URL sink
either resolves through the audited helpers or receives library-controlled strings.
Remaining items are hardening improvements (Anchor missing safeHref, Embed iframe
src missing safeHref, ReDoS-possible RegExp compiled from user input without
length caps) and documentation nudges for consumer-sanitized sinks.

**Dependency-scan status:** `npm audit` executed by the controlling agent on
2026-04-18. Results in `plans/audits/30-npm-audit.json`. Findings folded in as §1.1.

---

## §1. Dependency advisories

### Finding 1.1: `npm audit` results (executed 2026-04-18)

**Totals:** 16 vulnerabilities — 1 critical, 4 high, 11 moderate, 0 low/info.

**Critical + high breakdown:**

| Severity | Package | Direct? | CVE summary |
|---|---|---|---|
| CRITICAL | `happy-dom` | direct devDep | VM Context Escape; server-side code exec via `<script>` |
| HIGH | `vite-plugin-dts` | direct devDep | transitive via `@microsoft/api-extractor`, `@vue/language-core` |
| HIGH | `@microsoft/api-extractor` | transitive | `@microsoft/tsdoc-config` |
| HIGH | `lodash` | transitive | Code injection via `_.template`; prototype pollution |
| HIGH | `minimatch` | transitive | ReDoS via repeated wildcards |

**Impact assessment:** All 16 vulnerabilities live in `devDependencies`. None appear
in `peerDependencies` or `dependencies`. Consumers installing `voidframe` from npm
do **not** inherit these vulnerabilities — they affect only the build/test
environment of this repository. `happy-dom` (critical) is test-suite only; does
not ship. `vite-plugin-dts` is build-time only; does not ship.

- **Classification:** DEFENSE-IN-DEPTH (consumer-facing impact: zero)
- **Severity:** P2 — upgrade to keep CI clean and limit maintainer exposure, but
  not a publish blocker.
- **Remediation:** `Fix 2.0` in `30-remediation.md` — bump `happy-dom` to latest
  15.x+, bump `vite-plugin-dts` to 4.x, `npm dedupe` to collapse transitive
  lodash/minimatch, re-run `npm audit` to confirm zero critical/high.

### Finding 1.2: `dompurify` peer floor `>=3.0.0`
- **Sink:** `package.json:peerDependencies.dompurify = ">=3.0.0"` (line 125)
- **Classification:** DEFENSE-IN-DEPTH
- **Severity:** P2 (hardening)
- **Notes:** The floor admits the entire 3.x train. GHSA-vhxf-7vqr-mrjg (mutation
  XSS fixed in 3.1.3) and GHSA-mmhx-hmjr-r674 (nesting-based bypass fixed in 3.2.4)
  are mitigated by consumer installs of the latest 3.x, but the peer declaration
  permits a vulnerable install. Raise the floor to `>=3.2.4` (matches the
  `devDependencies` pin `^3.2.0`). See `30-remediation.md` Fix 2.1.

### Finding 1.3: `react-live` peer floor `>=4.0.0`
- **Sink:** `package.json:peerDependencies.react-live = ">=4.0.0"` (line 126)
- **Classification:** DEFENSE-IN-DEPTH
- **Severity:** P3 (doc / consumer-gated)
- **Notes:** Playground exposes `./dev` subpath explicitly. `react-live` uses
  `new Function()` under the hood; this is by design. No advisories against 4.x at
  time of audit (`.1.6` pinned in devDependencies). Document in §6.

---

## §2. HTML sinks

Inventory: `plans/audits/30-html-sinks.txt`. Zero `dangerouslySetInnerHTML` in
production. Three `innerHTML` writers all isolate untrusted data behind
`sanitizeHtml` or an escape helper.

### Finding 2.1: `src/components/RichEmbed.tsx:137`
- **Sink:** `(el)["innerHTML"] = sanitizeHtml(state.svg, "svg")`
- **Path:** `chart prop → mermaid.render → {svg} → sanitizeHtml("svg") → innerHTML`
- **Classification:** SANITIZED
- **Profile used:** `svg` allowlist (sanitizeHtml.ts:50)
- **Mitigations stack:** `mermaid.initialize({ securityLevel: "strict" })` (default)
  disables inline HTML in node labels and anchor execution. The DOMPurify SVG
  profile is a belt-and-suspenders pass in case of a future mermaid regression.
- **Severity:** P4 (verified safe)

### Finding 2.2: `src/components/RichTextEditor.tsx:224, 246, 317`
- **Sink:** contentEditable div's `innerHTML` set via `writeHTML(el, clean)`.
- **Path:** `value prop / clipboard/text-html / contentEditable input
  → sanitize(input) → innerHTML`
- **Classification:** SANITIZED
- **Profile used:** `rich-text` (sanitizeHtml.ts:18) unless consumer supplies a
  custom `sanitize` prop
- **Paste handler:** line 303-321 — `clipboardData.getData("text/html")` is run
  through `sanitize` before `execCommand("insertHTML", …)`. Plain-text payload
  falls through to default browser paste (React-escaped text). Verified.
- **Severity:** P4 (verified safe)

### Finding 2.3: `src/components/Viewers/CodeBlock.tsx:36 (HTMLPane)`
- **Sink:** `el.innerHTML = html` via `writeHTML` helper.
- **Path:** `highlight(code, language) returns string → HTMLPane html prop → innerHTML`
- **Classification:** CONSUMER-SANITIZED (by contract)
- **Evidence:** JSDoc at line 52-56: "Must return safe HTML (escapes its input)
  OR ReactNode. When given a string, the CodeBlock writes through the HTMLPane;
  callers are expected to sanitize."
- **Severity:** P3 (documentation-only — escalate the warning in the README
  usage example; callers using a syntax highlighter like `prism` or `highlight.js`
  return pre-escaped HTML by default, but someone rolling their own is on the hook.)

### Finding 2.4: `src/components/Print.tsx:145-156 (printNode)`
- **Sink:** `iframe.contentDocument.write(...)` — the `<title>` is escaped
  (line 147, `escapeHTML(title)`); stylesheet `<link>` and `<style>` outerHTML is
  copied from the live document (same-origin); and the print target's `outerHTML`
  is written verbatim (line 155).
- **Path:** `node (document DOM) → outerHTML → doc.write`
- **Classification:** LIBRARY-STRING + LIVE-DOM clone
- **Severity:** P4 (verified safe — the iframe is same-origin to the host, and
  the DOM content being copied is already rendered in the host page. Writing it
  into a print-only iframe does not create a new attack surface.)

### Finding 2.5: `src/components/MarkdownEditor.tsx` (entire file)
- **Sink:** none — the renderer produces a React element tree (`renderMarkdownBlocks`,
  line 363). No `innerHTML`, no `dangerouslySetInnerHTML`. Link hrefs pass
  through `safeHref` (line 343); text tokens are React-escaped by default.
- **Classification:** REACT-ESCAPED
- **Severity:** P4 (verified safe)

### Finding 2.6: `src/components/Viewers/MarkdownRenderer.tsx`
- **Sink:** reuses `renderMarkdownBlocks` from MarkdownEditor. Same path as 2.5.
- **Severity:** P4 (verified safe)

### Finding 2.7: `setAttribute` surface
- **Sink:** 6 production call sites. Every attribute set is a safe-class
  (`aria-*`, `data-*`, `role`, `draggable`, `rel`), with a literal value. No
  dangerous-subset (`href`, `src`, `srcdoc`, `on*`, `style`, `srcset`, `action`)
  is set via `setAttribute`.
- **Severity:** P4 (verified safe)

---

## §3. URL sinks

Inventory: `plans/audits/30-url-sinks.txt`. Most consumer-facing anchor surfaces
route through `safeHref`; two anchor surfaces skip it, and one `iframe` surface
skips it for its `src`.

### Finding 3.1: `src/components/Anchor.tsx:124`
- **Sink:** `<a href={item.href}>`
- **Path:** `AnchorProps.items[].href → direct attribute`
- **Classification:** UNSAFE-BY-CONTRACT (documented "#section-id" only)
- **Data-flow trace:** `AnchorItem.href` (line 22, typed `string`, JSDoc says
  `// #section-id`) → `renderItems` (line 103) → `<a href={item.href}>` (line 124).
  The `onClick` handler `preventDefault`s for left-click and scrolls to the
  fragment. Modifier-click (ctrl-click, cmd-click, middle-click) does NOT
  trigger preventDefault — it opens in a new tab via the href. A consumer
  passing `"javascript:alert(1)"` here, against TypeScript's type, would execute
  on modifier-click in a browser that tolerates `javascript:` on anchor
  activation.
- **Exploit scenario:** any consumer who feeds `AnchorItem.href` from an
  upstream API or from URL query params (without their own validation) hands an
  attacker a reflected-XSS vector, triggered when a victim modifier-clicks a
  TOC entry.
- **Severity:** P2 (defense-in-depth — requires attacker-controlled `item.href`
  and a victim modifier-click)
- **Fix:** `safeHref(item.href)` on line 124. See `30-remediation.md` Fix 1.1.

### Finding 3.2: `src/components/Embed.tsx:51-62 (IFrame)`
- **Sink:** `<iframe src={src} sandbox="allow-scripts allow-forms" ...>`
- **Path:** `IFrameProps.src → direct attribute`
- **Classification:** DEFENSE-IN-DEPTH gap
- **Data-flow trace:** `IFrameProps.src` (line 23, typed `string`) → forwarded
  unchanged to the `<iframe src={...}>` attribute.
- **Mitigations:** default `sandbox="allow-scripts allow-forms"` — critically,
  does NOT include `allow-same-origin`, so even if a malicious document loads,
  it cannot reach host-origin state (cookies, localStorage, DOM). `javascript:`
  URIs in `<iframe src>` are rejected by all modern browsers by platform contract.
  `data:` URIs load as an opaque origin, still sandboxed.
- **Residual risk:** a consumer who overrides `sandbox` with a token list
  containing both `allow-same-origin` + `allow-scripts` would grant the embed
  full host privileges. No runtime warning if they do.
- **Severity:** P2 (hardening)
- **Fix:** route `src` through `safeHref` (or a specialized `safeIframeSrc`
  that additionally permits `about:` and `blob:` if legitimately needed), AND
  add a dev-time warning if `sandbox` contains both tokens. See
  `30-remediation.md` Fix 1.2.

### Finding 3.3: Navigation, NavigationExtended, BreadcrumbMenu, ScrollSpy/TreeNav, ChatComposer, ChatCitations, Lightbox, Identity, SkipToContent, Embed (DocumentPreview download), MarkdownEditor link tokens
- **Classification:** SAFE-HREF
- **Severity:** P4 (verified safe)
- **Notes:** All anchor hrefs that take untrusted input pass through
  `safeHref(…)`. See `30-url-sinks.txt` for exact lines.

### Finding 3.4: `target="_blank"` rel coverage
- **Classification:** SAFE
- All three production sites with `target="_blank"` (ChatCitations.tsx:160,245;
  Identity.tsx:218) carry `rel="noreferrer noopener"`. DOMPurify hook
  (sanitizeHtml.ts:89) enforces the same for sanitized HTML. MarkdownEditor
  (line 346) enforces it for rendered link tokens.
- **Severity:** P4 (verified safe)

### Finding 3.5: `safeHref` allowlist
- **Classification:** AUDITED
- Protocol allowlist: `http:`, `https:`, `mailto:`, `tel:`, `sms:`. Relative
  prefixes: `/`, `./`, `../`, `?`, `#`. Whitespace / C0-control-prefixed schemes
  normalized (line 55). Non-string input returns fallback. `""` passes through
  for no-op callers. `data:` / `blob:` / `javascript:` / `vbscript:` / `file:`
  all rejected. Fallback defaults to `"#"` (configurable).
- **Severity:** P4 (verified safe)

---

## §4. Code execution

Inventory: `plans/audits/30-exec-sinks.txt`, `30-timer-calls.txt`, `30-dyn-import.txt`.

### Finding 4.1: Zero `eval` / `new Function` / string-form timers
- **Sink:** grep returned 0 matches in src/ (excluding tests, `node_modules`).
- **Severity:** P4 (verified safe)

### Finding 4.2: `setTimeout` / `setInterval` first-arg audit
- **Classification:** FUNCTION-ARG across all 40+ call sites.
- Every first-arg is an arrow function, method reference, or saved callback
  ref — no string execution.
- **Severity:** P4 (verified safe)

### Finding 4.3: `react-live` Playground (src/dev/Playground.tsx)
- **Path:** `scope prop → <LiveProvider scope={scope}>` — library does NOT
  inject `window`, `eval`, `Function`, `fetch`, or any DOM globals. Consumer
  chooses the scope.
- **Mitigation:** Playground is exported ONLY via the `./dev` subpath
  (package.json:20-24). Documented as dev-only. `react-live` inherently uses
  `new Function()` under the hood, which is by design.
- **Severity:** P3 (documentation — add an explicit "not for production bundles"
  banner in the JSDoc of PlaygroundProps)

### Finding 4.4: Dynamic imports
- **Classification:** LITERAL across all 5 runtime and all 20+ lazy.ts call sites.
- No user-provided module paths. Safe.
- **Severity:** P4 (verified safe)

### Finding 4.5: `src/components/CodeEditor.tsx`
- **Classification:** DISPLAY-ONLY
- No eval path. No run/execute feature.
- **Severity:** P4 (verified safe)

---

## §5. Data parsing, prototype pollution, ReDoS

Inventory: `plans/audits/30-json-parse.txt`, `30-merge-calls.txt`.

### Finding 5.1: `deepMerge` guards
- **Sink:** `src/utils/formatters.ts:113-132`
- **Guard:** line 119 — `if (key === "__proto__" || key === "constructor" ||
  key === "prototype") continue;`. Recursion at line 123 inherits the same
  filter.
- **Test coverage:** `src/utils/__tests__/formatters.test.ts:234-240` tests
  the malicious payload `{"__proto__": {...}, "constructor": {...}}`.
- **Classification:** AUDITED-AND-TESTED
- **Severity:** P4 (verified safe)

### Finding 5.2: `JSON.parse` call sites
- 3 production sites: useWebSocket, useLocalStorage, DataGrid persisted-state read.
- None feed their output into `deepMerge` or a key-walk that could allow
  prototype pollution (V8's JSON.parse creates `__proto__` as an own property,
  not a prototype mutation — no direct pollution path).
- **Severity:** P4 (verified safe)

### Finding 5.3: `Object.assign` call sites
- All 30+ are compound-component assembly (`Object.assign(Base, { Item, … })`)
  with hardcoded right-hand sides. `src/utils/announce.ts:19` assigns literal
  CSS props to `el.style`. No consumer objects merged.
- **Severity:** P4 (verified safe)

### Finding 5.4: RegExp built from user input
- **Sink:** `new RegExp(pattern, flags)` compiled from untrusted input.
- Sites:
  - `src/components/RegExpTester.tsx:40, 60` — compiles user-typed regex against
    user-typed test string. No length cap, no catastrophic-backtracking guard.
  - `src/components/Viewers/LogViewer.tsx:104, 135` — compiles user-typed
    `filterText` / `highlight` against each log message. No length cap.
  - `src/utils/date.ts:189` — compiles a known-safe format token string from
    a library-controlled `regexSource`. LIBRARY-CONTROLLED.
- **Impact:** Single-threaded browser. A malicious `(a+)+$` + long string can
  hang the tab (DoS of the user's own browser). Not exploitable by a remote
  attacker unless they can also plant the regex.
- **Severity:** P2 (hardening — for RegExpTester + LogViewer only)
- **Fix:** Cap pattern length (e.g. 200 chars) and input string length; OR
  run the match in a Worker with a timeout; OR use a backtrack-limited engine
  (`re2-wasm`) behind a flag. See `30-remediation.md` Fix 1.3.

### Finding 5.5: `src/utils/formValidation.ts` error-message leakage
- Zod/Yup adapter errors are surfaced as strings to the consumer's form UI.
- Classification: CONSUMER-DISPLAYED — the library does not enrich them with
  internal state. Consumer's schema decides message content.
- **Severity:** P4 (verified safe)

---

## §6. Persistence and transport

Inventory: `plans/audits/30-storage.txt`, `30-network.txt`, `30-object-urls.txt`.

### Finding 6.1: localStorage namespace discipline
- All keys use `vf-…` or `voidframe-…` prefixes. No secrets / PII stored.
- Hydration-safe reads (post-mount effect in `useThemePersistence`).
- **Severity:** P4 (verified safe)

### Finding 6.2: `document.cookie` helpers
- `src/utils/cookie.ts` encodes names and values. Consumer chooses `secure`
  / `sameSite`. Library never writes tokens or secrets.
- **Severity:** P4 (verified safe)

### Finding 6.3: No postMessage listeners
- Zero `addEventListener("message", …)` / `BroadcastChannel` / `SharedWorker`
  in src/.
- **Severity:** P4 (verified safe)

### Finding 6.4: Network endpoints are consumer-provided
- `useWebSocket`, `useEventSource`, and `MediaPlayer`'s waveform `fetch` all
  take URLs as props / hook args. No library-internal request derives a URL
  from parsed user input.
- **Severity:** P4 (verified safe)

### Finding 6.5: `FileUpload` default behavior
- Does NOT auto-upload; emits files to `onChange` or to the consumer-provided
  `upload` callback. Size/type validation via `maxSize` and `accept` props.
- **Severity:** P4 (verified safe)

### Finding 6.6: Object-URL MIME sourcing
- All `new Blob(..., { type: <LITERAL> })` call sites use library-hardcoded
  MIME strings ("text/csv", "application/json", "text/plain", "image/svg+xml").
  ImageCropper uses browser-supplied `File.type` via drag/drop, assigned to
  `<img src>` — not a script-execution vector.
- **Severity:** P4 (verified safe)

---

## §7. CSP-friendliness and inline surfaces

### Finding 7.1: Zero HTML-attribute inline handlers
- Grep for `onclick=["']`, `onload=["']`, `onerror=["']` returned 0 matches.
  All event handlers are React-synthesized. CSP-safe without `unsafe-inline`.
- **Severity:** P4 (verified safe)

### Finding 7.2: `theme-script.js`
- `/Users/aaron/Code/VoidFrame/theme-script.js` — fully literal. Reads
  `localStorage.getItem("voidframe-theme")` and `setAttribute("data-vf-theme", t)`.
  `setAttribute` sets a literal attribute value, no HTML parsing — a maliciously
  planted localStorage value cannot escape into script execution via this path.
- **Severity:** P4 (verified safe). **Consumer must allow inline `<script>` in
  their CSP OR load it as an external file** — document in README.
- **Severity:** P3 (doc nudge)

### Finding 7.3: No runtime CSS concatenation
- No `document.createElement("style")` + `.innerHTML = …` sinks.
- No `style.innerHTML = …` in production.
- Style objects are React prop values (React escapes the CSS-string form).
- **Severity:** P4 (verified safe)

---

## Caveats (methodology notes)

- **`npm audit` not executed.** The sandbox blocked all Bash / Docker
  invocations in this session. The audit is otherwise source-complete. Re-run
  the dependency sweep separately; if any high/critical surfaces, re-open this
  audit.
- **Git log not read.** Bash denial also blocked `git log`. Phase-30 landing
  has been verified by direct inspection of `src/utils/sanitizeHtml.ts`,
  `src/utils/safeHref.ts`, and the `__proto__` guard in
  `src/utils/formatters.ts:119`. No drift detected vs. the known-context hints.
