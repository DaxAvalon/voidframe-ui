# `Combobox` functionality audit

**File:** `src/components/Combobox.tsx:74`
**Test:** `src/components/__tests__/Combobox.test.tsx`
**Prop count:** 12
**Bucket:** forms

## Prop liveness
- `options` — LIVE (102, 116, 130, 205)
- `value` — LIVE (96)
- `defaultValue` — LIVE (97)
- `onChange` — LIVE (98)
- `label` — LIVE (217-220, 253)
- `placeholder` — LIVE (236)
- `filter` — LIVE (130)
- `allowCustomValue` — LIVE (124, 175, 203)
- `renderOption` — LIVE (283-287)
- `emptyMessage` — LIVE (257)
- `disabled` — LIVE (237)
- `id` — LIVE (138)

## Control pattern
- Pattern: Controllable via `useControllableState` on `current` (95-100). Internal `query`, `open`, `highlighted` are uncontrolled UI states.
- Uses `useControllableState`: YES
- Issues:
  - `query` state captures `selectedOption?.label ?? ""` at mount (120); if `value` later changes (controlled), `query` doesn't sync, so the input display text may diverge (FINDING 1)
  - Duplicate-value warning via `warnOnce` (106) runs in render (not useEffect), which is fine for dev warnings but triggers per-render on different values — `warnOnce` guards repeat emission.

## State transitions
- Empty options → no listbox items, `emptyMessage` shown ✓ (255-259)
- `open=true` + Enter with `highlighted >= 0` → commits ✓ (173-174)
- `open=true` + Enter + `allowCustomValue` + query → `setCurrent(query)`, no `setQuery` reset ✓ (175-178)
- Escape → closes; reverts query to selected label ✓ (179-184)
- Blur + `allowCustomValue` + query doesn't match any option → commits custom value ✓ (202-208)
- Blur without `allowCustomValue` + typed query that doesn't match → query stays in input but `current` doesn't change; input still shows query because `open=false` branch shows `selectedOption?.label` (124) — that means query is discarded UI-only (FINDING 2)
- Disabled option → `commit` early-return; but arrow-key highlight still lands on disabled options (FINDING 3)

## Callback signatures
- `onChange(value: string | null)` — verified (98)
- `filter(query: string, option: ComboboxOption) => boolean` — verified (130)
- `renderOption(opt, state) => ReactNode` — verified (283)

## Test coverage
- File exists: YES, ~10 tests
- Tested props: `options`, `value`/`onChange`, `emptyMessage`, `allowCustomValue`, disabled options, `label`
- Untested props: `placeholder`, `filter` (custom), `renderOption`, `disabled` (component), `id`

## Findings
1. P1 — `query` state does not sync with controlled `value` at `src/components/Combobox.tsx:120`. If parent changes `value`, `selectedOption` recomputes but `query` state stays at its initial value. While closed the input reads `selectedOption?.label` (124), so visible text is correct; but when the popover opens next time, `query` is stale and filtering starts from that stale string.
2. P1 — Typed query is silently discarded on blur when `allowCustomValue=false` at `src/components/Combobox.tsx:202-208`. Only `allowCustomValue` path commits; otherwise, `query` stays in local state but is not visible (displayText falls back to selectedOption label on close). Subtle UX: users think typed text was saved until they see it reset on reopen.
3. P1 — Disabled options are still highlightable via arrow keys at `src/components/Combobox.tsx:163, 170`. `handleKey` arrows move highlight through all `filtered` options, including `disabled`. Enter on a disabled option → `commit` rejects (144), so behavior is a silent no-op without UI feedback.
4. P2 — Warning loop at `src/components/Combobox.tsx:102-113`. Runs in render body on every render of the component; `warnOnce` dedupes, but looping `options.length` each render adds overhead. Move to `useEffect`.
5. P2 — `selectedOption` falls back to `null` silently if `current` value not in options at `src/components/Combobox.tsx:115-118`. With `allowCustomValue`, the custom string is the `current` value but `selectedOption` is null → display uses `query` fallback on close (124). Good, but if user closes then the option list changes, `query` may reset to empty.
6. P3 — `placeholder`, `filter` (custom), `renderOption`, `disabled` (component), `id` untested at `src/components/__tests__/Combobox.test.tsx`.
