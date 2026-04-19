# `SlashCommandInput` functionality audit

**File:** `src/components/MentionInput.tsx:318`
**Test:** `src/components/__tests__/MentionInput.test.tsx`
**Prop count:** 13 (3 own + ~10 inherited from MentionInputProps minus options/renderMention/onMention)
**Bucket:** forms

## Prop liveness
- `commands` — LIVE (326; passed as MentionInput.options)
- `trigger` — LIVE (327, default "/")
- `onCommand` — LIVE (335)
- Inherited from `MentionInputProps` (minus options/renderMention/onMention):
  - `value` — LIVE (spread via `...rest` to MentionInput)
  - `defaultValue` — LIVE (spread)
  - `onChange` — LIVE (spread)
  - `label` — LIVE (spread)
  - `filter` — LIVE (spread)
  - `placeholder` — LIVE (spread)
  - `minHeight` — LIVE (spread)
  - `disabled` — LIVE (spread)
  - `id` — LIVE (spread)
  - `textareaProps` — LIVE (spread)

## Control pattern
- Pattern: Thin wrapper around MentionInput; defers to MentionInput's controllable text state (via useControllableState)
- Uses `useControllableState`: YES (indirectly via MentionInput)
- Issues: Own `renderMention` overrides inherited one (328); callers cannot customize the insertion token format beyond `insertToken` flag (FINDING 2)

## State transitions
- `/` at whitespace boundary → menu opens with filtered commands ✓ (inherits MentionInput trigger-find logic)
- Command selected with `insertToken: true` → inserts `/${value}` at trigger position ✓ (329-331)
- Command selected with `insertToken: false|undefined` → returns empty string — MentionInput still performs its "insert token" machinery but the replacement token is empty, effectively deleting the `/query` from the textarea ✓ (330)
- Command selected → invokes `action?.(...)` with `{text: "", triggerIndex: 0, caret: 0}` — hardcoded zeros (FINDING 1)
- `onCommand` fires after `action` ✓ (335)
- Disabled textarea → menu doesn't open (inherited behavior)

## Callback signatures
- `onCommand(cmd: SlashCommandOption)` — verified (335)
- `action({text, triggerIndex, caret})` — signature implies access to editor state, but ALL THREE ARE HARDCODED TO 0 / "" (334) — effectively broken (FINDING 1)

## Test coverage
- File exists: YES, 2 tests for SlashCommandInput
- Tested props: `label`, `commands`, `onCommand`
- Untested props: `trigger` (custom), `value`, `defaultValue`, `onChange`, `filter`, `placeholder`, `minHeight`, `disabled`, `id`, `textareaProps`; also `action` callback payload untested

## Findings
1. P0 — `action` callback receives hardcoded zeros at `src/components/MentionInput.tsx:334`. Interface declares `(state: { text: string; triggerIndex: number; caret: number })` (304) but the call site always passes `{text: "", triggerIndex: 0, caret: 0}`. Any consumer relying on these values to, e.g., perform context-aware text manipulation gets meaningless data. MentionInput.onMention only receives the option, not the trigger state; plumbing must be added to surface the real values.
2. P1 — Hardcoded `renderMention` drops caller customization at `src/components/MentionInput.tsx:328-331`. Callers can only choose between `/${value}` and `""`; there's no escape hatch to e.g. insert a placeholder name with parentheses. The base MentionInput exposes `renderMention` — SlashCommandInput reserves it for its own use.
3. P2 — "Delete by inserting empty string" is fragile at `src/components/MentionInput.tsx:330`. Returning `""` relies on MentionInput's insertion logic to replace `/query` → `""`. If MentionInput ever short-circuits empty inserts, the stale `/query` text remains. Tests only cover the happy path.
4. P3 — Most inherited props untested for SlashCommandInput: `trigger`, `value`, `defaultValue`, `onChange`, `filter`, `placeholder`, `minHeight`, `disabled`, `id`, `textareaProps`, and `action` payload.
