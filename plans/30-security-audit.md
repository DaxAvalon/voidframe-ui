# Security Audit

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to run the per-surface inspections in parallel. Use superpowers:executing-plans inline. Steps use checkbox syntax for tracking.

**Goal:** Inventory every security-relevant surface and validate that there are no live XSS, injection, prototype-pollution, SSRF, storage-exfil, or dependency-CVE exposures. Produce evidence (file + line + mitigation) for every verified-safe surface and a remediation plan for every verified-unsafe surface.

**Architecture:** Read-only inspection pass backed by `npm audit`, OSV scanner output, and manual review of every tainted-data sink. Produces `plans/audits/30-findings.md` with severity-scored findings and `plans/audits/30-remediation.md` with fixes. No source changes in this audit.

**Tech Stack:** Grep / Read / `npm audit` / `npx osv-scanner` (optional) / DOMPurify config inspection / `jest-axe` for a11y sanity (already wired but not security-scoped).

---

## Scope

Six classes of surface:

1. **HTML sinks** — every use of `innerHTML`, `dangerouslySetInnerHTML`, `outerHTML`, or `setAttribute` with user data
2. **URL sinks** — `href`, `src`, `action`, `formaction`, `xlink:href`, `window.open`, `location.*`
3. **Code execution** — `eval`, `new Function`, `setTimeout`/`setInterval` with string, dynamic `import()` with user data, `react-live` scope
4. **Data parsing** — `JSON.parse` of untrusted input, `deepMerge`, prototype pollution sinks, `RegExp` compiled from user input (ReDoS)
5. **Persistence and transport** — `localStorage`, `sessionStorage`, `document.cookie`, `postMessage`, `fetch` / `XMLHttpRequest`, EventSource, WebSocket
6. **Dependencies** — `npm audit` for runtime + peer deps; advisories for DOMPurify, react-live, d3-*, topojson-client

Out of scope:
- Backend/server code (none in this project)
- Supply-chain threats at the git/CI level (covered separately in the publish plan)
- Network-layer attacks (TLS, DNS) — not relevant to a library

---

## File Structure

**Outputs (created by this plan):**
- `plans/audits/30-findings.md` — severity-scored findings, one section per surface class
- `plans/audits/30-remediation.md` — ordered fix plan
- `plans/audits/30-sinks.json` — machine-readable sink inventory (file + line + classification)

**Reference sources (read-only):**
- `src/utils/sanitizeHtml.ts` — single audited DOMPurify wrapper
- `src/utils/safeHref.ts` — URL allowlist
- `src/utils/formatters.ts` — includes `deepMerge` with prototype-pollution guards (Phase 50-54)
- `src/components/MarkdownEditor.tsx`, `RichTextEditor.tsx`, `RichEmbed.tsx`, `Viewers/MarkdownRenderer.tsx`, `Viewers/CodeBlock.tsx` — known HTML-handling surfaces

---

## Task 1: Dependency advisory scan

**Files:**
- Create: `plans/audits/30-findings.md` (initial section)
- Optional: `plans/audits/30-npm-audit.json`

- [ ] **Step 1: Run `npm audit` with low threshold**

```bash
cd /Users/aaron/Code/VoidFrame
docker compose run --rm shell -c "npm audit --audit-level=low --json" > plans/audits/30-npm-audit.json || true
node -e '
const a = require("./plans/audits/30-npm-audit.json");
const v = a.metadata?.vulnerabilities || {};
console.log("low:", v.low || 0, "moderate:", v.moderate || 0, "high:", v.high || 0, "critical:", v.critical || 0);
'
```

Expected: any `high` / `critical` is a P0 finding. Record in `§1. Dependency advisories`.

- [ ] **Step 2: Check peer-dep advisories explicitly**

Peer deps not installed by default are NOT scanned by `npm audit` on our repo, but consumers install them. Check each:

```bash
for dep in dompurify d3-array d3-force d3-geo d3-hierarchy d3-sankey d3-scale d3-shape d3-time topojson-client react-live; do
  echo "=== $dep ==="
  docker compose run --rm shell -c "npm view $dep vulnerabilities 2>/dev/null || echo none" | tail -3
done
```

For `dompurify` and `react-live` especially, check the GitHub advisory DB for the minimum-version in `peerDependencies`. If the minimum allows a known-vulnerable version, bump it.

- [ ] **Step 3: Pin the `dompurify` minimum version**

Open `package.json`. Current is `"dompurify": ">=3.0.0"`. Audit: what's the earliest `3.x` without known CVEs? If the current `>=3.0.0` range admits a bad version, record as P1 with the suggested new floor.

- [ ] **Step 4: Write §1 and commit**

```bash
git add plans/audits/30-findings.md plans/audits/30-npm-audit.json
git commit -m "audit 30: dependency advisory findings"
```

---

## Task 2: HTML sink audit

**Objective:** Every `innerHTML`, `dangerouslySetInnerHTML`, `outerHTML`, and `setAttribute` call must either (a) receive only library-controlled strings or (b) pass through `sanitizeHtml` with an appropriate profile.

- [ ] **Step 1: Enumerate every HTML sink**

```bash
grep -rn "innerHTML\s*=\|dangerouslySetInnerHTML\|outerHTML\s*=\|setAttribute\s*(" src/ --include="*.ts" --include="*.tsx" | grep -v __tests__ | grep -v "\.test\." > plans/audits/30-html-sinks.txt
wc -l plans/audits/30-html-sinks.txt
```

**Filtering `setAttribute` noise:** `setAttribute` is used frequently for safe attributes (`aria-*`, `data-*`, `role`, `id`, `tabindex`, `hidden`, `lang`, `dir`). The **dangerous subset** is:

- `href`, `src`, `srcdoc`, `action`, `formaction`, `xlink:href` — URL sinks (overlap with Task 3)
- `style` — CSS injection
- `on*` — inline event handlers
- `srcset`, `data` (on `<object>`) — resource loads

After classification, record only the dangerous-subset hits in findings. Aria/data/role hits count as `LIBRARY-STRING` unless the attribute **value** is user-controlled (rare; usually the value is a hardcoded "true"/"false").

- [ ] **Step 2: Classify each hit**

Open each file/line and record one of:
- `LIBRARY-STRING` — template literal with hardcoded markup, no interpolated user data
- `SANITIZED` — goes through `sanitizeHtml(...)` before assignment
- `UNSAFE-CONFIRMED` — user data reaches the sink unmodified
- `NEEDS-REVIEW` — can't tell from local context; trace data flow

Template in `plans/audits/30-findings.md` under `§2. HTML sinks`:

```markdown
### Finding 2.N: <file>:<line>
- **Sink:** `innerHTML = ...`
- **Path:** `props.value → sanitizeProp → sanitize → innerHTML` (or similar)
- **Classification:** SANITIZED via `sanitizeHtml(value, "rich-text")`
- **Profile used:** rich-text allowlist (see `src/utils/sanitizeHtml.ts:18`)
- **Severity:** P4 (verified safe)
- **Notes:** consumers can override the sanitizer via the `sanitize` prop — document in §6.
```

Use `P4 (verified safe)` for confirmed-OK sinks. P0-P3 only for actually-unsafe findings.

- [ ] **Step 3: Special surfaces to trace fully**

These get full data-flow traces (not just local checks):

- `MarkdownEditor.tsx` — write out the chain from `value` prop → rendered output
- `RichTextEditor.tsx` — trace `value` + `createLink` + `sanitize` prop + paste handler
- `RichEmbed.tsx` — Mermaid + SVG surface. Confirm `mermaid.initialize({ securityLevel: "strict" })` (phase 30)
- `Viewers/MarkdownRenderer.tsx` — does it sanitize before render?
- `Viewers/CodeBlock.tsx` — syntax-highlighted HTML source
- `Chat/Message.tsx` (and any other chat surfaces that render `content`)

- [ ] **Step 4: Commit**

```bash
git add plans/audits/30-html-sinks.txt plans/audits/30-findings.md
git commit -m "audit 30: HTML sink findings"
```

---

## Task 3: URL sink audit

**Objective:** Every anchor-like attribute must resolve untrusted URLs through `safeHref`. Every `target="_blank"` must carry `rel="noreferrer noopener"`.

- [ ] **Step 1: Enumerate URL-carrying attributes**

```bash
grep -rnE "(href|src|srcdoc|action|formaction|xlink:href|data)\s*=\s*\{" src/ --include="*.tsx" | grep -v __tests__ > plans/audits/30-url-sinks.txt

# iframe / embed / object surfaces — SSRF-adjacent and sandbox-escape risks
grep -rnE "<(iframe|embed|object|frame)\b" src/ --include="*.tsx" | grep -v __tests__ >> plans/audits/30-url-sinks.txt

grep -rn "target\s*=\s*[\"\']_blank" src/ --include="*.tsx" | grep -v __tests__ >> plans/audits/30-url-sinks.txt
wc -l plans/audits/30-url-sinks.txt
```

**iframe / embed / object audit:** For any hit, confirm:

- `sandbox` attribute is set with a minimal token list (e.g., `sandbox="allow-scripts"` but **not** `allow-same-origin` + `allow-scripts` together, which defeats the sandbox)
- `src` / `srcdoc` / `data` value is library-controlled or passes through `safeHref` / a dedicated iframe-URL validator
- No untrusted `allow`, `referrerpolicy`, or `csp` overrides

- [ ] **Step 2: Classify each href expression**

For each href expression, record:
- `STATIC` — literal string or library-controlled
- `SAFE-HREF` — passed through `safeHref(input)`
- `UNSAFE-CONFIRMED` — untrusted URL goes directly to the attribute
- `NEEDS-REVIEW` — can't tell locally

Priority surfaces: `Navigation.tsx`, `NavigationExtended.tsx`, `BreadcrumbMenu.tsx`, `Anchor.tsx`, `Identity.tsx`, `ChatCitations.tsx`, `Menu.tsx`, `Link`/`a` wrappers in Text/Button/Card.

- [ ] **Step 3: Audit `target="_blank"` rel coverage**

```bash
grep -rnB1 -A1 'target="_blank"' src/ --include="*.tsx" | grep -v __tests__
```

For each hit, confirm `rel` contains both `noopener` and `noreferrer`. Record any missing rel value as P2.

- [ ] **Step 4: Validate safeHref allowlist**

Open `src/utils/safeHref.ts`. Record:

- Scheme allowlist (expected: `http(s)`, `mailto`, `tel`, `sms`, relative paths starting with `/`, `#`, `?`)
- Default return value for rejected input (should be `"#"` or throw, never empty string which creates relative-to-current-page link)
- Handling of `data:` URIs (should be rejected for generic hrefs; explicit allowlist only for known-safe MIME types like `data:image/png;base64,...` if at all)

- [ ] **Step 5: Commit**

```bash
git add plans/audits/30-url-sinks.txt plans/audits/30-findings.md
git commit -m "audit 30: URL sink findings"
```

---

## Task 4: Code-execution surfaces

**Objective:** No `eval`, no `new Function`, no string-form `setTimeout`/`setInterval`. `react-live` Playground must only expose a tightly-scoped `scope` object. Dynamic `import()` must not accept user-provided paths.

- [ ] **Step 1: Search for eval-class sinks**

```bash
# literal-string first-arg is the obvious case
grep -rnE "\beval\s*\(|new\s+Function\s*\(|setTimeout\s*\(\s*['\"]|setInterval\s*\(\s*['\"]" src/ --include="*.ts" --include="*.tsx" | grep -v __tests__ > plans/audits/30-exec-sinks.txt

# Full setTimeout/setInterval sweep — first arg may be a variable holding a string
grep -rnE "\b(setTimeout|setInterval)\s*\(" src/ --include="*.ts" --include="*.tsx" | grep -v __tests__ > plans/audits/30-timer-calls.txt

wc -l plans/audits/30-exec-sinks.txt plans/audits/30-timer-calls.txt
```

Classify every `setTimeout` / `setInterval` hit: `FUNCTION-ARG` (safe) vs `VARIABLE-ARG` (trace the variable to confirm it's a function, not a string). If the first arg type is `unknown` or `string`, it's unsafe.

Expected: zero hits, or only in `dev/Playground.tsx` / tests. Any other hit is P0.

- [ ] **Step 2: Audit `react-live` scope**

Open `src/dev/Playground.tsx`. Record:
- What `scope` object is passed to `<LiveProvider>`?
- Can the scope object contain symbols the user's example code uses to escape the sandbox (e.g., `window`, `document`, `fetch`, `eval`)?
- Is the Playground documented as "development only" and excluded from production builds?
- Is it behind `import "voidframe/dev"` subpath (yes — verified in package.json `exports`)?

- [ ] **Step 3: Audit dynamic imports**

```bash
grep -rnE "\bimport\s*\(" src/ --include="*.ts" --include="*.tsx" | grep -v __tests__ > plans/audits/30-dyn-import.txt
```

Every dynamic import argument should be a literal string or a `satisfies string` type — never user-provided. Verify.

- [ ] **Step 4: Audit `CodeEditor.tsx` execution surfaces**

Open `src/components/CodeEditor.tsx`. Record:
- Does it execute the code the user edits? (Expected: no — it's a display surface.)
- If it offers a "run" feature, trace it.

- [ ] **Step 5: Commit**

```bash
git add plans/audits/30-exec-sinks.txt plans/audits/30-dyn-import.txt plans/audits/30-findings.md
git commit -m "audit 30: code-execution surface findings"
```

---

## Task 5: Data parsing and prototype pollution

**Objective:** Every `JSON.parse` of untrusted input must be wrapped to reject `__proto__` / `constructor` / `prototype`. Every merge-like operation must be pollution-safe. RegExp constructed from user input must have complexity bounds.

- [ ] **Step 1: Enumerate JSON.parse sites**

```bash
grep -rn "JSON\.parse" src/ --include="*.ts" --include="*.tsx" | grep -v __tests__ > plans/audits/30-json-parse.txt
```

For each hit, classify:
- `LIBRARY-STRING` — input is a literal or library-controlled
- `USER-INPUT-GUARDED` — rejects `__proto__` etc. after parse
- `USER-INPUT-UNGUARDED` — direct use of parsed object, no key filtering

- [ ] **Step 2: Enumerate merge-class operations**

```bash
grep -rnE "\bObject\.assign\s*\(|\bdeepMerge\s*\(" src/ --include="*.ts" --include="*.tsx" | grep -v __tests__ > plans/audits/30-merge-calls.txt
wc -l plans/audits/30-merge-calls.txt
```

Spread syntax (`...x`) is too noisy to grep usefully — skip the spread search. The merge-call set above is the real pollution surface.

Focus: calls that take user-provided objects (theme config, Playground code, filter builders).

Verify `deepMerge` in `src/utils/formatters.ts` still filters `__proto__`, `constructor`, `prototype` (Phase 50-54 added this — confirm it's still in place).

- [ ] **Step 3: Audit RegExp construction**

```bash
grep -rn "new RegExp\s*(" src/ --include="*.ts" --include="*.tsx" | grep -v __tests__
```

For each hit, classify the argument. If it's user input, the component is a ReDoS candidate (especially `RegExpTester`, `Combobox` filter, `Search`). For each: confirm either a complexity-safe regex engine or a timeout / length cap.

- [ ] **Step 4: Audit `formValidation.ts` and Zod/Yup adapters**

Open `src/utils/formValidation.ts`. Record whether error messages from schema libraries can leak PII or structured internals when displayed to users.

- [ ] **Step 5: Commit**

```bash
git add plans/audits/30-json-parse.txt plans/audits/30-findings.md
git commit -m "audit 30: parsing / pollution / ReDoS findings"
```

---

## Task 6: Persistence and transport

**Objective:** Every `localStorage` / `sessionStorage` / `cookie` write must not store secrets or PII. Every `postMessage` listener must validate `event.origin`. Every `fetch`/`WebSocket`/`EventSource` must not forward user input to arbitrary URLs.

- [ ] **Step 1: Enumerate storage sites**

```bash
grep -rn "localStorage\.\|sessionStorage\.\|document\.cookie" src/ --include="*.ts" --include="*.tsx" | grep -v __tests__ > plans/audits/30-storage.txt
wc -l plans/audits/30-storage.txt
```

For each hit, record:
- Key name (should be prefixed `vf-` or `voidframe-` for namespace safety)
- What's stored (theme/preferences OK; tokens/secrets NOT OK)
- Whether it's read during render (SSR hydration mismatch risk — also a correctness issue covered in plan 31)

Known sites: `useThemePersistence`, `DataGrid` column state, likely a few others.

- [ ] **Step 2: Enumerate postMessage listeners**

```bash
grep -rnE "addEventListener\s*\(\s*[\"']message|window\.addEventListener\s*\(\s*[\"']message|new\s+(MessageChannel|BroadcastChannel|SharedWorker)" src/ --include="*.ts" --include="*.tsx" | grep -v __tests__
```

For each hit, confirm: the handler checks `event.origin` against a known allowlist before processing the payload. For `BroadcastChannel` / `SharedWorker`, confirm the channel name is library-controlled and the handler validates shape of received data.

- [ ] **Step 3: Enumerate fetch/XHR/WebSocket/EventSource sites**

```bash
grep -rnE "\bfetch\s*\(|new\s+(XMLHttpRequest|WebSocket|EventSource)\s*\(|navigator\.sendBeacon" src/ --include="*.ts" --include="*.tsx" | grep -v __tests__ > plans/audits/30-network.txt
wc -l plans/audits/30-network.txt
```

Expected: library components should be "dumb" about network — consumers pass data in. If a component actually makes network calls internally (likely: `useFetch`, `useWebSocket`, `useEventSource`, `FileUpload`), audit the URL source — it must come from props/config, never from parsed user input without sanitization.

- [ ] **Step 4: Audit FileUpload in detail**

Open `src/components/FileUpload.tsx`. Record:
- Does it upload anywhere by default? (Expected: no — emits files, consumer handles upload)
- If it does, the URL source must be an explicit prop
- Does it read file contents client-side? If yes, size caps + type allowlist?

- [ ] **Step 5: Commit**

```bash
git add plans/audits/30-storage.txt plans/audits/30-network.txt plans/audits/30-findings.md
git commit -m "audit 30: storage + network findings"
```

---

## Task 7: CSP-friendliness and inline surfaces

**Objective:** Library code should not require `unsafe-inline` or `unsafe-eval` CSP. `style=` attributes are fine (style-src) but `onclick=` inline handlers are not.

- [ ] **Step 1: Search for inline event handler strings**

```bash
grep -rnE "onclick\s*=\s*[\"']|onload\s*=\s*[\"']|onerror\s*=\s*[\"']" src/ --include="*.ts" --include="*.tsx" | grep -v __tests__
```

Expected: zero hits. React-synthesized handlers (`onClick={...}`) are fine; HTML-string handlers are not.

- [ ] **Step 2: Document inline `<script>` usage**

`theme-script.js` exists at the repo root and is referenced in package.json exports. Confirm: it's meant to be loaded as a synchronous `<script>` before hydration to prevent theme flash; is its contents fully literal (no user data)?

- [ ] **Step 3: Document `style` / CSS-in-JS usage**

We use style objects + CSS modules. Document: no `dangerouslySetInnerHTML` for `<style>` tags anywhere (grep to confirm). No runtime CSS string concatenation that takes user input (grep for `style.innerHTML` or `document.createElement("style")`).

- [ ] **Step 4: Audit object-URL sinks**

Blob + `URL.createObjectURL` with user-controlled MIME types can be an XSS vector when navigated to. Also relevant for `require-trusted-types-for` CSP.

```bash
grep -rnE "new\s+Blob\s*\(|URL\.createObjectURL" src/ --include="*.ts" --include="*.tsx" | grep -v __tests__ > plans/audits/30-object-urls.txt
```

For each hit, classify the MIME type source (literal = safe; user input = needs validation against an allowlist).

- [ ] **Step 4: Commit**

```bash
git add plans/audits/30-findings.md
git commit -m "audit 30: CSP + inline-surface findings"
```

---

## Task 8: Triage and severity scoring

**Objective:** Score every finding and produce an executive summary.

- [ ] **Step 1: Apply severity**

Scoring:
- `P0` — exploitable unauthenticated vulnerability (XSS, prototype pollution via user input, arbitrary redirect)
- `P1` — defense-in-depth failure that requires attacker-assisted conditions (CSP bypass, rel-missing)
- `P2` — hardening improvement (pin dep floor, tighten allowlist)
- `P3` — documentation-only (warn consumers about expected input)
- `P4` — verified-safe sink (no action, recorded for future review)

- [ ] **Step 2: Write the summary at the top of `30-findings.md`**

```markdown
## Summary

| Severity | Count |
|---|---|
| P0 | N |
| P1 | N |
| P2 | N |
| P3 | N |
| P4 (verified safe) | N |

**Headline:** <one sentence — does the library ship with known-exploitable holes? Yes/no + shortest-path remediation.>

**Verified-safe sink count:** N (see §2–§6 for inventory)
```

- [ ] **Step 3: Commit**

```bash
git add plans/audits/30-findings.md
git commit -m "audit 30: triage + summary"
```

---

## Task 9: Remediation plan

**Files:**
- Create: `plans/audits/30-remediation.md`

- [ ] **Step 1: For every P0 finding, write a minimal fix**

Template:

```markdown
### Fix 0.N: <short title>
- **Finding:** §2.N in 30-findings.md
- **File(s):** exact paths + lines
- **Change:** code diff or prose
- **Test:** the regression test that proves it's fixed (add to `src/.../__tests__/security.test.tsx` or similar)
- **Disclosure:** does this need a security advisory on the GitHub mirror? (Y/N)
```

- [ ] **Step 2: For P1/P2 findings, group into a hardening wave**

One wave = one commit per file touched. Include tests where feasible.

- [ ] **Step 3: P3 findings roll into the docs audit (plan 32)**

Note that P3 findings go to plan 32 instead of being fixed here — they're documentation changes (warning consumers about expected input shape, etc.).

- [ ] **Step 4: Commit**

```bash
git add plans/audits/30-remediation.md
git commit -m "audit 30: remediation plan"
```

---

## Success Criteria

- `plans/audits/30-findings.md` has sections 1-7 populated with findings or explicit "no findings" notes
- Every HTML sink, URL sink, eval surface, JSON parse site, merge site, storage site, postMessage listener, and fetch site in `src/` appears in `plans/audits/30-sinks.json` or a txt counterpart
- Every finding has severity + evidence (file:line) + classification
- `plans/audits/30-remediation.md` specifies a test-backed fix for every P0 and P1
- Zero source files modified during this plan

## Out of Scope

- Fixing findings (that's the remediation plan execution)
- Accessibility audit (Phase 33 a11y hardening already landed; re-run as part of plan 31 functionality audit instead)
- Supply-chain / git / CI security — covered separately when we wire `NPM_TOKEN` and GitHub mirror (see `plans/npm-publish-plan.md`)
