# `Calendar` functionality audit

**File:** `src/components/Calendar.tsx:51`
**Test:** `src/components/__tests__/CalendarExpanded.test.tsx`
**Prop count:** 13
**Bucket:** domain-data

## Prop liveness

- `value` — LIVE (line 127, used as highlighted set)
- `defaultDisplayMonth` — LIVE (line 114)
- `displayMonth` — LIVE (line 116, 120)
- `onDisplayMonthChange` — LIVE (line 121)
- `view` — LIVE (line 148, 152, 156, 160, 169, 236, 239, 246, 260, 350, 366)
- `onViewChange` — LIVE (line 386, 394)
- `events` — LIVE (line 133, 247, 306)
- `firstDayOfWeek` — LIVE (line 143, 153, 231, 274-275)
- `showWeekNumbers` — LIVE (line 410, 413, 421)
- `locale` — LIVE (line 143, 274, 367, 369, 372, 448, 450)
- `onDayClick` — LIVE (line 202, 298)
- `onEventClick` — LIVE (line 215, 335, 445)
- `onRangeChange` — LIVE (line 165)

## Control pattern

- Pattern: `displayMonth` / `defaultDisplayMonth` / `onDisplayMonthChange` — controlled/uncontrolled via hand-rolled fallback at line 116.
- Uses `useControllableState`: NO — ad-hoc fallback.
- Issues: `view` is NOT controllable (no `defaultView` etc). It's a plain prop consumed directly; parent sets view entirely. `onViewChange` conditionally renders the tab switch (line 386), making view effectively one-way-controlled — parent must own view state, but there's no uncontrolled path.

## State transitions

- `view="month"` → month grid rendered.
- `view="week"` / `"day"` → hour grid rendered (line 456).
- `view="agenda"` → upcoming list (line 432).
- `events` empty in agenda → "No upcoming events" placeholder (line 434).
- `onViewChange` absent → view switch tabs hidden (line 386).
- No loading/error/disabled state.

## Callback signatures

- `onDisplayMonthChange(date)` — verified (121).
- `onViewChange(view)` — verified (394).
- `onDayClick(date)` — verified (202, 298).
- `onEventClick(event)` — verified (215, 335, 445).
- `onRangeChange(range)` — verified (165). Fires on every range change via effect.

## Test coverage

- File exists: YES — CalendarExpanded.test.tsx.
- Tested props: view, events, onDayClick, onEventClick, displayMonth.
- Untested props: locale variants, firstDayOfWeek=1, showWeekNumbers, onRangeChange.
- Tested states: month/week/day/agenda renders.
- Untested states: agenda with empty events, hour-grid event positioning.
- Untested callbacks: onRangeChange timing.

## Findings

1. P1 — `onRangeChange` fires every time `range` memo re-computes (line 164-166). Because `range` is a fresh object each render (even with same values), effect runs on every render when `current` or `view` change, which is intended — but also fires on mount with initial range (effect runs post-mount). Parents relying on it for "user navigated" signal get a spurious first call.
2. P1 — Event positioning in hour grid at line 325-331 mixes absolute `position` with `gridColumn` — `gridColumn` is ignored when position is absolute. Events may be positioned only by `top`/`left` and misalign with the grid cells beneath them.
3. P2 — Agenda view ignores `current` for its range (line 156-158); it always shows "next 30 days from today". `navPrev`/`navNext` in agenda advance `current` by 30 days but `range` is rebuilt from `new Date()` — navigation has no visible effect.
4. P2 — `weekdayNames(locale, firstDayOfWeek, "short")` called in three places (lines 143, 274) — recomputed per render where unmemoized.
5. P3 — `range.end` for week view is only 6 days (`addDays(start, 6)`) so `ev.date <= range.end` at line 248 excludes the last 24h of the week if time-specific comparison isn't start-of-day.
