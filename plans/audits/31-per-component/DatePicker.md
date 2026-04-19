# `DatePicker` functionality audit

**File:** `src/components/DatePicker.tsx:298`
**Test:** `src/components/__tests__/DatePicker.test.tsx`
**Prop count:** 17
**Bucket:** forms

## Prop liveness
- `value` — LIVE (line 353, 355)
- `defaultValue` — LIVE (line 354)
- `onChange` — LIVE (line 376)
- `label` — LIVE (line 455, 468)
- `placeholder` — LIVE (line 483)
- `min` — LIVE (line 437)
- `max` — LIVE (line 438)
- `disabledDates` — LIVE (line 439)
- `format` — LIVE (line 360, 383, 406)
- `parseFormat` — LIVE (line 407)
- `locale` — LIVE (line 440)
- `firstDayOfWeek` — LIVE (line 441)
- `showWeekNumbers` — LIVE (line 442)
- `inline` — LIVE (line 447)
- `disabled` — LIVE (line 484)
- `required` — LIVE (line 485)
- `id` — LIVE (line 369)

## Control pattern
- Pattern: `value` / `defaultValue` / `onChange` — classic controlled/uncontrolled. `isControlled = value !== undefined` at line 353.
- Uses `useControllableState`: NO — hand-rolled via `setValue` callback at 373.
- Issues: none obvious. Effect at line 388 re-syncs draft on `current` change including uncontrolled mode (fine).

## State transitions
- `disabled` → passed to `<input disabled>` at 484 ✓. BUT `inline` mode (line 447) does NOT apply `disabled` to the internal Calendar — Calendar has no `disabled` affordance at all → FINDING 1.
- `open` toggle via focus (480), ArrowDown (422), Escape (425), click outside (367).
- `required` → passed through to input (485) ✓.
- `inline` → renders Calendar directly, skipping popover and input (447).
- Escape only works when `open` (line 423) — fine.

## Callback signatures
- `onChange(date: Date | null)` — verified at 376. Called with `null` when blur clears, `startOfDay(parsed)` when typed, `startOfDay(d)` when selected.

## Test coverage
- File exists: YES.
- Tested props: value, defaultValue, onChange, format, min, max, disabledDates.
- Untested props: `parseFormat` distinct from `format`, `locale`, `firstDayOfWeek`, `showWeekNumbers`, `inline`, `required`.
- Tested states: controlled/uncontrolled, blur parsing, keyboard open.
- Untested states: `inline + disabled` (no effect — finding 1), popover aria-expanded.
- Untested callbacks: onChange with `null` via blur clearing.

## Findings
1. P1 — `disabled` is applied to the text input (src/components/DatePicker.tsx:484) but in `inline` mode (line 447) the Calendar grid is rendered with no disabled gating. Users can still click days and `onChange` fires despite `disabled={true}`.
2. P2 — `handleInputBlur` at line 405 only runs parse-logic when `typeof format === "string"`. If `format` is a function, typed text is never parsed on blur — the draft silently remains out of sync with `current`. src/components/DatePicker.tsx:406.
3. P2 — `handleSelect` at line 400 calls `startOfDay(d)` but Calendar internally already passes `startOfDay`-ed dates. Double-normalization is harmless but indicates unclear invariants.
4. P3 — Effect at line 393 omits `viewMonth` from deps intentionally (eslint-disable at 397); this is necessary but worth documenting with a comment (the existing comment explains it).
5. P3 — `parseFormat` documented as defaulting to `format` (line 311) — fine, but untested.
