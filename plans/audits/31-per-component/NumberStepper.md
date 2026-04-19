# `NumberStepper` functionality audit

**File:** `src/components/NumberStepper.tsx:37`
**Test:** `src/components/__tests__/NumberStepper.test.tsx`
**Prop count:** 12
**Bucket:** forms

## Prop liveness
- `value` — LIVE (57)
- `defaultValue` — LIVE (58)
- `onValueChange` — LIVE (59)
- `min` — LIVE (70, 87, 140, 155)
- `max` — LIVE (71, 88, 141, 156)
- `step` — LIVE (79, 84)
- `size` — LIVE (119)
- `disabled` — LIVE (78, 83, 91, 120, 131, 145, 163, 174)
- `readOnly` — LIVE (78, 83, 91, 164)
- `formatValue` — LIVE (112, 143, 158)
- `label` — LIVE (125, 144, 159)
- `hideInput` — LIVE (136)

## Control pattern
- Pattern: Controllable value via `useControllableState`; local `draft` buffers the text input until blur
- Uses `useControllableState`: YES (56-61)
- Issues:
  - `defaultValue` fallback chain: `defaultValue ?? min ?? 0` (58) — acceptable, but if user supplies `min=5` and leaves value undefined, initial value is 5 (implicit)
  - `draft` is reset to `null` on blur but not on external `value` change — if parent updates `value` while user is mid-edit, draft stays and the input shows stale text until blur (FINDING 1)

## State transitions
- `atMin` → decrement button disabled ✓ (131)
- `atMax` → increment button disabled ✓ (174)
- Invalid input (NaN) on blur → silently resets draft without changing value ✓ (104-106)
- Input typed and blurred → parsed and clamped to [min, max] ✓ (108)
- `readOnly=true` → input `readOnly`, but increment/decrement buttons are NOT disabled (only `disabled || atMin/atMax`) — so buttons still click and trigger increment/decrement which early-return at the handler level (77-78, 82-83). Subtle: visually enabled, functionally no-op (FINDING 2)
- `hideInput=true` → text span with `tabIndex=0`, ArrowUp/ArrowDown handled ✓ (136-149)
- `hideInput=true` + `disabled` → tabIndex undefined; keyboard nav blocked ✓ (145)

## Callback signatures
- `onValueChange(value: number)` — verified (via useControllableState)
- `formatValue(value: number) => string` — verified (112)

## Test coverage
- File exists: YES, ~12+ tests
- Tested props: `value`/`defaultValue`, `onValueChange`, `min`, `max`, `step`, `size`, `disabled`, `readOnly`, `formatValue`, `label`, `hideInput`
- Untested props: direct text input typing/blur path (clamping via input is untested in tests), `value`-sync while user is editing draft

## Findings
1. P1 — `draft` not invalidated when `value` prop changes at `src/components/NumberStepper.tsx:65, 101-110`. In controlled mode, if the parent programmatically updates `value` while the user has typed (but not blurred) a different number, the input continues to display the stale draft. Effect: displayed value disagrees with controlled value until blur.
2. P1 — `readOnly` + buttons at `src/components/NumberStepper.tsx:131, 174`. Buttons only check `disabled || atMin/atMax` — `readOnly` is not gated in the `disabled` attribute. Clicks are intercepted in the handler (77-78), but a keyboard user with focus on the button and pressing Enter hits the handler which early-returns. Not a functional bug, but `aria-disabled` / visual affordance is misleading.
3. P2 — `aria-valuemin`/`max` set to `undefined` when missing at `src/components/NumberStepper.tsx:140-141, 155-156`. React emits the attribute absent; assistive tech sees an unbounded spinbutton. Consider falling back to `Number.MIN_SAFE_INTEGER`/`MAX_SAFE_INTEGER` or a dedicated prop.
4. P2 — `formatValue` used for `aria-valuetext` only when provided at `src/components/NumberStepper.tsx:143, 158`. When `formatValue` converts 1000000 → "$1M", screen readers without `aria-valuetext` will read the raw number. OK fallback, but worth documenting.
5. P2 — `handleKeyDown` on button not wired for space/enter at `src/components/NumberStepper.tsx:127-135, 170-178`. Browsers handle native button activation, so fine.
6. P3 — `value`-sync mid-draft behavior untested at `src/components/__tests__/NumberStepper.test.tsx`.
