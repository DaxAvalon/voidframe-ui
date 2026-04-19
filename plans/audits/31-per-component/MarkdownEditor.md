# `MarkdownEditor` functionality audit

**File:** `src/components/MarkdownEditor.tsx:475`
**Test:** `src/components/__tests__/MarkdownEditor.test.tsx`
**Prop count:** 12
**Bucket:** media

## Prop liveness
- `value` — LIVE (497)
- `defaultValue` — LIVE (498)
- `onChange` — LIVE (499)
- `label` — LIVE (535-538, 577 aria-label)
- `placeholder` — LIVE (574)
- `toolbar` — LIVE (541)
- `preview` — LIVE (507, 526, 555)
- `renderPreview` — LIVE (588)
- `minHeight` — LIVE (578, 585)
- `disabled` — LIVE (548, 575)
- `readOnly` — LIVE (576)
- `id` — LIVE (504)

## Control pattern
- Pattern: Controllable text via `useControllableState`; `previewShown` is uncontrolled UI toggle
- Uses `useControllableState`: YES (496-501)
- Issues:
  - `previewShown` initial value derived from `preview !== false` (507), but if `preview` prop later changes from false to "side", `previewShown` does not update (initial-only useState) (FINDING 1)
  - Toolbar commands mutate textarea via `wrapSelection`/`prependLine` that set `textarea.value` directly then dispatch `Event("input", {bubbles:true})` (116, 120) — this races with React's controlled value prop in the next render (FINDING 2)

## State transitions
- `preview=false` → toggle button hidden, preview pane hidden unconditionally ✓ (555, 580)
- `preview="side"` or true → side-by-side layout class ✓ (525-526)
- `preview="below"` → stacked layout class ✓
- Toolbar click → focuses textarea, mutates DOM, dispatches input event → controllable state updates ✓ (516-521)
- `renderPreview` provided → replaces built-in renderer ✓ (588)
- `disabled` → textarea and toolbar buttons disabled ✓ (548, 575)
- `readOnly` → only textarea has readOnly attr; toolbar still enabled → can still inject via toolbar into a read-only textarea (FINDING 3)

## Callback signatures
- `onChange(md: string)` — verified (via useControllableState → 511)
- `renderPreview(md: string) => ReactNode` — verified (588)

## Test coverage
- File exists: YES, ~5 tests
- Tested props: `label`, `defaultValue`, `preview` (false), `onChange`, toolbar Bold, preview toggle button
- Untested props: `value` (controlled), `placeholder`, `toolbar` (custom subset), `renderPreview`, `minHeight`, `disabled`, `readOnly`, `id`; also other toolbar commands (italic, link, heading, hr, lists, quote) untested

## Findings
1. P1 — `previewShown` state never syncs with `preview` prop changes at `src/components/MarkdownEditor.tsx:507`. `useState(preview !== false)` captures at mount; if caller toggles `preview` dynamically (false ↔ "side"), the toggle button and pane stay frozen in the initial decision.
2. P1 — Toolbar commands bypass React's controlled value at `src/components/MarkdownEditor.tsx:116-120, 127-130`. `wrapSelection` and `prependLine` write `textarea.value = next` and dispatch a synthetic `Event("input")`. React's synthetic event wrapper does pick this up, but in controlled mode the parent is expected to update `value`. If the parent doesn't (e.g. async state), the next render may overwrite the DOM-written text.
3. P0 — Toolbar bypasses `readOnly` at `src/components/MarkdownEditor.tsx:516-521, 548`. Toolbar buttons only check `disabled`, not `readOnly`. A read-only markdown editor still accepts bold/italic/link insertion via toolbar, mutating the value and emitting `onChange`. Guard `runCommand` with `if (readOnly || disabled) return`.
4. P1 — Manual DOM event dispatch assumes React's synthetic input-event integration at `src/components/MarkdownEditor.tsx:120, 130`. Works in React 18 but relies on implementation detail. Preferred: update state via `setMd(next)` directly from `applyMarkdownCommand`.
5. P2 — `preview="below"` untested at `src/components/__tests__/MarkdownEditor.test.tsx`.
6. P3 — Most commands (italic/link/heading/lists/quote/hr) untested; `renderPreview`, `placeholder`, `minHeight`, `disabled`, `readOnly`, `id`, custom toolbar all untested.
