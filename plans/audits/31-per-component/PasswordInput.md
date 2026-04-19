# `PasswordInput` functionality audit

**File:** `src/components/FormAdvanced.tsx:254`
**Test:** `src/components/__tests__/FormAdvanced.test.tsx`
**Prop count:** 13
**Bucket:** forms

## Prop liveness
- `value` — LIVE (294)
- `onChange` — LIVE (296)
- `onValueChange` — LIVE (297)
- `placeholder` — LIVE (299)
- `label` — LIVE (280-283, 305 aria-label)
- `required` — LIVE (300)
- `disabled` — LIVE (301, 315)
- `readOnly` — LIVE (302)
- `autoComplete` — LIVE (303)
- `name` — LIVE (304)
- `id` — LIVE (277 via useId)
- `visibilityToggle` — LIVE (308)
- `defaultVisible` — LIVE (276)

## Control pattern
- Pattern: Raw controlled passthrough — `value` + `onChange`/`onValueChange` to native input; no internal text state
- Uses `useControllableState`: NO
- Issues:
  - No `defaultValue` prop; uncontrolled consumers cannot supply initial text without using a ref (FINDING 1)
  - Passing `value` without any handler results in a read-only input with React warnings; no dev hint (inherits React's behavior)

## State transitions
- `visible=false` → type="password" ✓ (293)
- `visible=true` → type="text" ✓
- Toggle click → flips visible; `aria-pressed` tracks state ✓ (313-314)
- `disabled=true` → toggle button disabled as well ✓ (315)
- `visibilityToggle=false` → toggle button omitted; password cannot be revealed ✓ (308)
- `defaultVisible=true` → starts revealed ✓ (276)
- `defaultVisible` later changed → has no effect (captured once in useState) — documented React behavior, acceptable

## Callback signatures
- `onChange(e: ChangeEvent<HTMLInputElement>)` — verified (296)
- `onValueChange(value: string)` — verified (297) — emitted after `onChange` on every keystroke

## Test coverage
- File exists: YES, ~5 tests
- Tested props: `label`, `defaultVisible`, `visibilityToggle`, `onChange`, `onValueChange`
- Untested props: `value`, `placeholder`, `required`, `disabled`, `readOnly`, `autoComplete`, `name`, `id`

## Findings
1. P1 — No `defaultValue` prop at `src/components/FormAdvanced.tsx:232-252`. Other voidframe form inputs support both; uncontrolled consumers cannot seed initial text without a DOM ref. Asymmetric with the rest of the forms bucket.
2. P2 — Missing `onBlur`/`onFocus` passthrough at `src/components/FormAdvanced.tsx:290-307`. `...props` spreads on the wrapper `<div>`, not the input, so consumers cannot attach focus events declared on the component. Only HTMLAttributes for `HTMLDivElement` are typed — this is consistent but counterintuitive (`HTMLDivElement` attrs land on the div, not the input). Documented interface limitation.
3. P2 — `autoComplete` default is `"current-password"` at `src/components/FormAdvanced.tsx:265`. For sign-up flows callers must remember to pass `"new-password"`; default encourages password-manager mis-classification. Consider requiring explicit value.
4. P2 — `aria-label={label}` always passed at `src/components/FormAdvanced.tsx:305` even though `<label htmlFor>` is also rendered (281-283). Result: accessible name is `label` via the hidden label AND aria-label — duplication not harmful but redundant; if `label` is undefined `aria-label` is undefined → fallback acceptable.
5. P3 — Most props untested: `value`, `placeholder`, `required`, `disabled`, `readOnly`, `autoComplete`, `name`, `id`.
