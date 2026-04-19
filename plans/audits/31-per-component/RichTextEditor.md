# `RichTextEditor` functionality audit

**File:** `src/components/RichTextEditor.tsx:184`
**Test:** `src/components/__tests__/RichTextEditor.test.tsx`
**Prop count:** 12
**Bucket:** media

## Prop liveness
- `value` — LIVE (206)
- `defaultValue` — LIVE (207)
- `onChange` — LIVE (208)
- `label` — LIVE (265-268, 294)
- `placeholder` — LIVE (297, data-placeholder)
- `toolbar` — LIVE (274)
- `renderToolbar` — LIVE (272)
- `minHeight` — LIVE (301)
- `disabled` — LIVE (230, 281, 296, 298, 307)
- `readOnly` — LIVE (230, 295, 298, 307)
- `sanitize` — LIVE (214)
- `id` — LIVE (218)

## Control pattern
- Pattern: Controllable HTML via `useControllableState`; DOM mirrors `html` state via `useEffect`
- Uses `useControllableState`: YES (205-210)
- Issues:
  - `useEffect` writes html→DOM at `224`. If user is actively typing (React `onInput` fires `setHtml`), the next render path re-sanitizes and writes DOM, resetting caret position. Tests may not catch this because jsdom has trivial selection. (FINDING 1)
  - `runCommand` writes DOM via `execCommand`, then calls `setHtml(sanitize(readHTML(...)))` (233). The `useEffect` will then re-write the sanitized HTML back to DOM, potentially losing caret selection again.

## State transitions
- `readOnly` or `disabled` → `contentEditable=false` and `runCommand` early-return ✓ (230, 298)
- `readOnly` or `disabled` + paste with HTML payload → early-return (paste blocked) ✓ (307)
- Plain-text paste → falls through default handler ✓ (308-310)
- Toolbar `link` without arg → `window.prompt("URL")` (blocking SSR-fallback to null) ✓ (167)
- `sanitize` custom → wraps via useMemo keyed by prop reference ✓ (212-216)
- `value` change when controlled → `useEffect` re-writes sanitized HTML to DOM ✓
- Initial mount with `defaultValue` non-empty → `useEffect` writes to DOM on first paint ✓

## Callback signatures
- `onChange(html: string)` — verified (via useControllableState)
- `sanitize(html: string) => string` — verified (214, 223, 233, 245, 312)
- `renderToolbar(api: RichTextEditorApi) => ReactNode` — verified (273)

## Test coverage
- File exists: YES, ~15 tests
- Tested props: `label`, `toolbar` (custom subset), `renderToolbar`, `readOnly`, `disabled`, `onChange`, `placeholder`, `minHeight`, `value` (controlled)
- Untested props: `defaultValue` (non-empty), `sanitize` (custom), `id`, paste handler

## Findings
1. P1 — Caret position resets on every input at `src/components/RichTextEditor.tsx:220-225, 302`. `onInput` calls `setHtml(readHTML)` → state change → `useEffect` writes sanitized HTML back to `innerHTML` unless byte-equal — sanitizing a user's in-progress paragraph often changes whitespace or normalizes, so the compare fails, DOM is rewritten, and the caret jumps to the start. jsdom tests don't exercise this. Consider diffing at DOM-node level or skipping write when source of change is the element itself.
2. P1 — `execCommand`-based link command uses `window.prompt` at `src/components/RichTextEditor.tsx:167`. Blocks the JS thread, not accessible in headless/server envs, and provides no UI. Prefer exposing `run("link", url)` via `renderToolbar` api but still default to prompt.
3. P2 — `data-placeholder` shown via CSS only at `src/components/RichTextEditor.tsx:297`. Without the corresponding `:empty::before` CSS rule, `placeholder` is effectively dead. This is a CSS dependency, not a component bug, but undocumented.
4. P2 — `sanitize` memoization key is `sanitizeProp` reference at `src/components/RichTextEditor.tsx:212-216`. Passing a fresh function each render rebuilds the closure AND retriggers the `useEffect` that writes DOM (225), causing extra reflows.
5. P2 — `useEffect` write compares `readHTML(el) !== clean` at `src/components/RichTextEditor.tsx:224`. Harmless on first mount; but if sanitize adds/removes attributes, every render will rewrite DOM.
6. P3 — `defaultValue` non-empty, custom `sanitize`, paste handler, `id` untested at `src/components/__tests__/RichTextEditor.test.tsx`.
