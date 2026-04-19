# Deferred features — captured from audit 31 Wave A

These props were declared on component interfaces but had no implementation. During P0 remediation of audit 31 (Wave A — dead-prop removal), they were **removed from the type** rather than implemented, because each required genuine feature work beyond the scope of a dead-prop fix. V1.0 is unpublished so the removal is safe; if/when these features are wanted, each becomes its own implementation plan.

## F1 — 6-field cron (seconds precision)

**Previously on:** `CronBuilder` — `fields?: 5 | 6` (removed in audit 31 Wave A A1)

**What it would do:** Quartz-style cron supports an optional 6th field at the start for seconds (`* * * * * *` = every second). With `fields={6}`, the visual builder should render 6 columns (Seconds, Minute, Hour, Day, Month, Weekday) and accept/emit 6-part expressions.

**Implementation scope:**
- Extend `FIELD_NAMES` / `FIELD_LABELS` / `FIELD_RANGES` with a seconds entry (range `[0, 59]`)
- Pass the `fields` count down to slicing logic and `parsedFields` mapping
- Update `isValidCron` to accept 5 or 6 parts and relate that to the declared `fields` prop
- Update `updateField` padding and `getNextRuns` to handle seconds
- Tests: 6-field render, 6-field round-trip, preview correctly includes seconds tick

**Estimated effort:** Half a day plus docs.

## F2 — Discretized Ticker animation (steps)

**Previously on:** `Ticker` — `steps?` (removed in audit 31 Wave A A5)

**What it would do:** Instead of smoothly interpolating from `from` to `to` across `duration`, emit exactly N intermediate values at evenly-spaced intervals. Useful for tickers that need to hit a set of specific round numbers (counting up to 100 in 10s of 10, etc.).

**Implementation scope:**
- Replace the current `requestAnimationFrame` interpolation with `setInterval(tick, duration / steps)` when `steps` is set
- Emit `steps` discrete values; ensure the final value is exactly `to`
- Respect `reducedMotion` → skip interpolation, emit final value only
- Tests: exactly N emissions, final value matches `to`, `steps={0}` behaves like `steps` unset

**Estimated effort:** Quarter day plus tests.

## F3 — VirtualList function-height viewport estimation

**Previously on:** `VirtualList` — `estimatedItemHeight?` (removed in audit 31 Wave A A7)

**What it would do:** When `itemHeight` is a function (variable-height items), the initial viewport size can't be known until every item is measured. An `estimatedItemHeight` lets the component pre-size the scroller so the first render has approximately the right scroll extent. Only relevant in the variable-height code path.

**Implementation scope:**
- Branch on `typeof itemHeight === "function"` in the viewport-size calculation
- Use `estimatedItemHeight * itemCount` as the initial scroller height; refine as real measurements come in via `ResizeObserver`
- Progressive refinement: replace estimates with measurements as items enter view
- Tests: initial scrollbar extent uses estimate; scrollbar extent updates as items render; missing `estimatedItemHeight` falls back to current (1000 `itemHeight()` calls on mount) behavior with a dev warning

**Estimated effort:** Half a day to a day plus tests.

## When to pick these up

Not blockers for v1.0 publish. Each is a self-contained feature plan; file under `plans/<next-phase-number>-<name>.md` and implement with its own test suite when there's consumer demand or a feature phase surfaces the need.
