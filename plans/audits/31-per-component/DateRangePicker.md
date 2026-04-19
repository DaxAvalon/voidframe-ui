# `DateRangePicker` functionality audit

**File:** `src/components/DatePicker.tsx:538`
**Test:** `src/components/__tests__/DatePicker.test.tsx`
**Prop count:** 13
**Bucket:** forms

## Prop liveness
- `value` — LIVE (560, 565)
- `defaultValue` — LIVE (562)
- `onChange` — LIVE (585)
- `label` — LIVE (633, 641)
- `min` — LIVE (683)
- `max` — LIVE (684)
- `disabledDates` — LIVE (685)
- `format` — LIVE (590)
- `locale` — LIVE (686)
- `firstDayOfWeek` — LIVE (687)
- `presets` — LIVE (651, 657)
- `numberOfMonths` — LIVE (622)
- `disabled` — LIVE (638)

## Control pattern
- Pattern: Hand-rolled controlled/uncontrolled via `isControlled = value !== undefined`
- Uses `useControllableState`: NO (rolled at 560-566, 583-586)
- Issues:
  - No warning if user toggles controlled ↔ uncontrolled mid-lifecycle
  - `viewMonth` initialized from `current.start ?? new Date()` once; if controlled value later transitions from null to a date, the view does not follow (FINDING 1)

## State transitions
- First selection → `start=day, end=null`, popover stays open ✓ (596-597)
- Second selection same-or-after start → `end=day`, popover closes ✓ (601-604)
- Second selection before start → swapped: `start=day, end=current.start`, popover closes ✓ (598-600)
- Third selection after complete range → restarts with new `start=day, end=null` ✓ (596)
- Preset clicked → sets range, updates viewMonth, closes popover ✓ (607-612)
- Click outside → closes popover, clears hoverEnd ✓ (575-578)
- `numberOfMonths=2` default → renders two months side by side (621-624)
- `numberOfMonths=1` → single month ✓
- Month nav on second calendar → shifts base `viewMonth` by -1 so the second month advances (674-677) — correct math ✓
- `hoverEnd` only applied to calendar when `!current.end` ✓ (680)
- `disabled=true` → only the trigger button is disabled; preset buttons & calendar inside popover are not guarded (but popover won't open since trigger is disabled) ✓

## Callback signatures
- `onChange(range: DateRange)` — verified, fires on every `setRange` including preset application (585)
- `disabledDates(date: Date) => boolean` — verified (685)
- `format(d: Date) => string` or string template — verified (590)

## Test coverage
- File exists: YES, multiple tests in `DateRangePicker` describe block
- Tested props: `label`, `presets`, plus interaction flows (open/close, range selection)
- Untested props: `value` (controlled), `defaultValue`, `onChange` (signature), `min`, `max`, `disabledDates`, `format`, `locale`, `firstDayOfWeek`, `numberOfMonths`, `disabled`

## Findings
1. P1 — `viewMonth` does not track controlled `value` at `src/components/DatePicker.tsx:568-570`. Initial value is captured once in `useState`; if parent changes `value.start` later (e.g. programmatic selection), the calendar still shows the stale month. Add `useEffect` syncing `viewMonth` when controlled value changes.
2. P1 — `handleSelect` ignores `disabledDates` / `min` / `max` at `src/components/DatePicker.tsx:594-605`. Calendar may style disabled days, but `handleSelect` accepts any Date passed up; relies on Calendar to gate clicks. If Calendar misfires (or is focus-keyboard activated), out-of-range selection reaches state. Defensive validation here is missing.
3. P1 — Preset range can violate `min`/`max` at `src/components/DatePicker.tsx:607-612`. `applyPreset` does not clamp or validate against `min`/`max`/`disabledDates`. Invalid ranges silently apply.
4. P2 — Stale hover end on first selection at `src/components/DatePicker.tsx:594-605`. After picking a start, `hoverEnd` state is not reset to null explicitly; pre-existing hover value could briefly highlight a misleading range until the next pointer move. Acceptable but worth a reset.
5. P2 — `onChange` fires with equal-value `{start: null, end: null}` possible at 583-586; no equality guard.
6. P3 — Most props untested at `src/components/__tests__/DatePicker.test.tsx` (see Untested list).
