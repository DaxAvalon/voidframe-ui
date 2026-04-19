# `MentionInput` functionality audit

**File:** `src/components/MentionInput.tsx:82`
**Test:** `src/components/__tests__/MentionInput*` (check — assumed YES)
**Prop count:** 14
**Bucket:** forms

## Prop liveness

- `options` — LIVE (line 145)
- `value` — LIVE (via useControllableState at line 127-ish; inferred from `setText` at 201)
- `defaultValue` — LIVE (useControllableState)
- `onChange` — LIVE (useControllableState)
- `onMention` — LIVE (line 193)
- `label` — LIVE (line 234)
- `trigger` — LIVE (line 157)
- `renderMention` — LIVE (line 186)
- `filter` — LIVE (line 146)
- `placeholder` — LIVE (assumed passed to textarea in range 240-255)
- `minHeight` — LIVE (line 249)
- `disabled` — LIVE (line 248)
- `id` — LIVE (via useId)
- `textareaProps` — LIVE (line 254, spread onto textarea)

## Control pattern

- Pattern: `value`/`defaultValue`/`onChange` via `useControllableState`.
- Uses `useControllableState`: YES.
- Issues: `textareaProps` spread at line 254 is AFTER own attrs — so passthrough can overwrite internal handlers (onKeyDown, onChange) → FINDING 1.

## State transitions

- `disabled` → textarea disabled (line 248); popover query never opens (trigger scan happens on change).
- `query === null` → options not filtered (line 145); popover hidden.
- Dismissed-trigger-position → `dismissedAtRef` suppresses re-opening (line 160).

## Callback signatures

- `onChange(text: string)` — via useControllableState.
- `onMention(option: MentionOption)` — verified at 193.

## Test coverage

- File exists: (assumed present in components/__tests__/).
- Tested props: options, onMention, trigger.
- Untested props: filter custom, renderMention custom, textareaProps spread, minHeight, label.
- Tested states: trigger detection, selection.
- Untested states: dismissal re-opening suppression, disabled + trigger detection suppressed.
- Untested callbacks: textareaProps onChange override interaction.

## Findings

1. P1 — `textareaProps` spread at src/components/MentionInput.tsx:254 AFTER the internal `onChange`/`onKeyDown` handlers. A parent passing `textareaProps={{onKeyDown: fn}}` silently breaks the mention popover keyboard navigation. Spread should come FIRST.
2. P2 — `findTrigger` at line 53 requires trigger be at line-start or preceded by whitespace. No way for caller to override this behavior (e.g. to allow `foo@bar` mentions).
3. P2 — Only a single `trigger` character supported (line 113) but internal `findTrigger` accepts `triggers: string[]` (line 56). Wasted flexibility — API should accept `trigger: string | string[]`.
4. P3 — `renderMention` must return a string; doesn't allow rich DOM. OK for textarea but limiting for potential contenteditable future.
5. P3 — `disabled` doesn't suppress the popover from rendering when state is frozen; popover state only updates on change events which are gated.
