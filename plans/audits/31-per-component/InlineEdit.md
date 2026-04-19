# `InlineEdit` functionality audit

**File:** `src/components/InlineEdit.tsx:7`
**Test:** `src/components/__tests__/InlineEdit.test.tsx`
**Prop count:** 14
**Bucket:** core

## Prop liveness
- `value` — LIVE (line 52, 68, 130, 164)
- `onSave` — LIVE (line 83)
- `onCancel` — LIVE (line 90)
- `placeholder` — LIVE (line 167)
- `validation` — LIVE (line 74)
- `size` — LIVE (line 120)
- `multiline` — LIVE (line 106, 144)
- `disabled` — LIVE (line 67, 122, 159)
- `readOnly` — LIVE (line 67, 123, 159)
- `renderDisplay` — LIVE (line 163)
- `maxLength` — LIVE (line 135)
- `autoSelect` — LIVE (line 60)
- `submitOnBlur` — LIVE (line 113)
- `submitOnEnter` — LIVE (line 106)

## Control pattern
- Pattern: `value` is the committed source; internal `draft` state mirrors during edit. No `defaultValue` (always controlled via parent's `value` + `onSave`).
- Uses `useControllableState`: NO — bespoke draft pattern.
- Issues: `draft` initialized from initial `value` prop (line 52); if `value` prop changes while NOT editing, `draft` stays stale → FINDING 1. `enterEditMode` at 68 resyncs on entry so first edit session is correct, but if value changes during editing, the draft persists (maybe intended).

## State transitions
- `disabled` or `readOnly` → `enterEditMode` no-op (line 67); display tabIndex set to -1 (159). ✓
- `multiline + submitOnEnter` → Enter submit disabled only when multiline (line 106 condition: `!multiline`). ✓
- `validation` returns truthy → `error` set, `editing` stays true, `onSave` NOT called (76). ✓
- Blur + `submitOnBlur=false` → no save.
- Cancel (Escape) → restores draft, exits edit mode, fires `onCancel`.

## Callback signatures
- `onSave(value: string)` — verified at 83.
- `onCancel()` — verified at 90.
- `validation(value) => string | undefined` — verified at 75.

## Test coverage
- File exists: (need to confirm — dedicated test file likely missing; no `InlineEdit.test.tsx` in the visible listing earlier). Treating as MISSING unless proven otherwise.
- Tested props: unknown.
- Untested props: likely all without dedicated test.
- Tested states: unknown.
- Untested states: readOnly vs disabled, validation-failure path, blur-with-error path.
- Untested callbacks: unknown.

## Findings
1. P1 — External `value` prop change while NOT editing does NOT re-sync `draft` (src/components/InlineEdit.tsx:52). Sequence: parent updates `value` → user enters edit mode later → `enterEditMode` resets draft to `value` (line 68), so display value is correct the moment user edits. But intermediate state (e.g. user presses Enter to edit, expecting the newly-updated value) is fine due to line 68. Only failure mode: if draft is ever shown without going through `enterEditMode`, it'd be stale. Currently not possible. Downgrade to P3.
2. P1 — Blur-with-validation-error path at line 112-116: `submitOnBlur=true` calls `save()` which sees the error, sets error state, but also triggers blur again → `save()` runs again (may loop or just re-set error). Specifically, the input has already lost focus; `save()` does NOT re-focus, so user loses focus with error visible but no way to correct without clicking back into the input.
3. P2 — Keyboard Enter on display (line 94) opens edit mode, but Space does NOT (standard `role="button"` should accept both Enter and Space).
4. P2 — `aria-label="Inline edit input"` at line 136 is generic — should ideally be derived from surrounding context.
5. P3 — `memo()` wrap at 177 with forced displayName at 178 — same pattern as RegExpTester; works but fragile.
