# `CommandInput` functionality audit

**File:** `src/components/CommandInput.tsx:40`
**Test:** `src/components/__tests__/CommandInput.test.tsx`
**Prop count:** 12
**Bucket:** forms

## Prop liveness
- `value` — LIVE (62)
- `defaultValue` — LIVE (63)
- `onValueChange` — LIVE (64)
- `onSubmit` — LIVE (112)
- `history` — LIVE (69, 113)
- `maxHistory` — LIVE (116)
- `suggestions` — LIVE (80, 87)
- `placeholder` — LIVE (218)
- `prompt` — LIVE (208)
- `disabled` — LIVE (201, 219)
- `size` — LIVE (200)
- `autoFocus` — LIVE (190, 220)

## Control pattern
- Pattern: Controllable via `useControllableState` on value (61-66); `history` also supports controlled mode (69)
- Uses `useControllableState`: YES (value)
- Issues:
  - `maxHistory` only affects internal history; when `controlledHistory` passed, the consumer is responsible for capping (acceptable but undocumented) (FINDING 1)
  - Ghost text uses `currentSuggestions[0]` (first match) without regard to active completion — if user arrow-selects a different completion, ghost text still reflects the first match (FINDING 2)

## State transitions
- Empty `current` + Enter → early-return before submit ✓ (111)
- Enter with completionsOpen + active completion → autocomplete, don't submit ✓ (100-109)
- ArrowUp from initial state → saves current draft, walks history up ✓ (135-140)
- ArrowDown from history → decrements index, if `historyIndex <= 0` → restores savedDraft and resets index to -1 ✓ (152-160)
- Tab with 1 match → auto-completes ✓ (166-168)
- Tab with >1 matches → opens completions popover ✓ (169-172)
- Escape → closes completions ✓ (176-179)
- `disabled` → input disabled; key handlers still attached but can't fire (browser-level blocking) ✓ (219)
- `autoFocus` changing → re-runs useEffect, re-focuses (190-193) — subtle; toggling autoFocus true→false→true re-focuses

## Callback signatures
- `onValueChange(value: string)` — verified via useControllableState
- `onSubmit(command: string)` — verified (112), required
- `suggestions` callable: `(partial: string) => CommandInputSuggestion[]` — verified (81)

## Test coverage
- File exists: YES, ~15+ tests
- Tested props: `prompt`, `placeholder`, `onSubmit`, controlled `value`/`onValueChange`, `history`, `suggestions` (static + behavior), `disabled`, `size`, `autoFocus`
- Untested props: `defaultValue` explicit, `maxHistory`, `suggestions` as function

## Findings
1. P1 — Ghost text ignores `activeCompletion` at `src/components/CommandInput.tsx:93-96`. Always uses `currentSuggestions[0]`. When user arrows through the listbox, the preview should reflect the highlighted option. Use `currentSuggestions[activeCompletion]` or hide ghost when popover is open.
2. P1 — Submitted command NOT added to controlled `history` at `src/components/CommandInput.tsx:113-118`. When `controlledHistory` is provided, no `onHistoryChange` callback exists — the consumer has no way to be notified of new entries. Component behaves as "read-only history" in controlled mode, which is surprising.
3. P2 — `currentSuggestions` computed every render without memo at `src/components/CommandInput.tsx:90`. `resolvedSuggestions(current)` lifts a new array per render even when current/suggestions unchanged. Minor perf.
4. P2 — Down-arrow reset path at `src/components/CommandInput.tsx:152-156`. `historyIndex <= 0` includes `-1`; in that state `historyIndex=-1` means no history selected — pressing ArrowDown again restores savedDraft and keeps index at -1. Works, but the `<= 0` comparison is subtle.
5. P2 — `autoFocus` runtime dependency at `src/components/CommandInput.tsx:189-193`. Re-focusing on prop change is non-obvious. Changing `autoFocus` from false→true at runtime triggers focus, which differs from native `<input autoFocus>` behavior.
6. P3 — `defaultValue`, `maxHistory`, `suggestions` as function untested at `src/components/__tests__/CommandInput.test.tsx`.
