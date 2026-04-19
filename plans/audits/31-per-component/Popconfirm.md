# `Popconfirm` functionality audit

**File:** `src/components/Popconfirm.tsx:39`
**Test:** `src/components/__tests__/Popconfirm.test.tsx`
**Prop count:** 13 (the `children` prop is required but typically excluded from prop counts; 14 incl children — plan says 13)
**Bucket:** overlays

## Prop liveness
- `title` — LIVE (137 aria-label, 144)
- `description` — LIVE (145-147)
- `onConfirm` — LIVE (81)
- `onCancel` — LIVE (86)
- `confirmLabel` — LIVE (169)
- `cancelLabel` — LIVE (154)
- `confirmVariant` — LIVE (134, 161-165)
- `icon` — LIVE (139-142)
- `placement` — LIVE (133)
- `open` — LIVE (63)
- `defaultOpen` — LIVE (64)
- `onOpenChange` — LIVE (65)
- `disabled` — LIVE (76)
- `children` — LIVE (104)

## Control pattern
- Pattern: Controlled via `useControllableState` on `open`
- Uses `useControllableState`: YES (62-67)
- Issues: none structural; trigger cloning attaches handler regardless of `disabled` — click handler gates internally (75-78), but `aria-expanded` still reflects state for a disabled trigger. That's acceptable.

## State transitions
- Closed → trigger click → `isOpen` toggles to true → Portal + overlay render ✓ (128-174)
- Open → confirm → `onConfirm`, `close()` → `isOpen=false` ✓ (80-83)
- Open → cancel → `onCancel?.()`, `close()` → `isOpen=false` ✓ (85-88)
- Open → Escape → `close()` via `useEscapeKey` ✓ (90)
- Open → focus confirm button on next animation frame ✓ (93-101)
- `disabled=true` → trigger click is no-op ✓ (76)
- `disabled` but `open` is controlled to true → popover renders; only trigger toggling is blocked (expected)
- `confirmVariant="danger"` → overlay + button get danger classes ✓ (134, 161)
- `placement="top|bottom|left|right"` → overlay class suffix ✓ (133) — no positioning logic, only CSS (FINDING 1)

## Callback signatures
- `onConfirm()` — verified, no args (81)
- `onCancel()` — verified, no args, optional (86)
- `onOpenChange(open: boolean)` — verified (65)

## Test coverage
- File exists: YES, ~10 tests
- Tested props: `title`, `description`, `icon`, `onConfirm`, `onCancel`, `cancelLabel`, `confirmLabel`, `open` controlled, `onOpenChange`, `defaultOpen`, `disabled`, `confirmVariant`
- Untested props: `placement`

## Findings
1. P1 — `placement` has no positioning logic at `src/components/Popconfirm.tsx:128-138`. The overlay is rendered into a `Portal` but there's no anchor math; it depends entirely on CSS to place the popover. If consumer CSS is absent, overlay appears at portal root and `placement` is dead visually. Works as a CSS class hook but there's no trigger-relative positioning.
2. P1 — No outside-click close at `src/components/Popconfirm.tsx:90-101`. Only Escape closes. In a portal with no backdrop and no click-outside handler, clicking elsewhere leaves the popover open. Other overlay components (DateRangePicker, etc.) include `useClickOutside`.
3. P1 — `useEffect` focus of confirm button loses focus return at `src/components/Popconfirm.tsx:93-101`. On close, focus is not restored to the trigger element — accessibility regression for keyboard users.
4. P2 — Trigger cloning replaces `aria-haspopup`/`aria-expanded` unconditionally at `src/components/Popconfirm.tsx:105-117`. A trigger that already sets these will have them overwritten silently.
5. P2 — Trigger click handler does not `preventDefault`/`stopPropagation` at `src/components/Popconfirm.tsx:106-114`, so the child's click handler still runs; this is intentional but the confirm action then may fire twice (child click + confirm click). Caller-dependent.
6. P3 — `placement` prop untested at `src/components/__tests__/Popconfirm.test.tsx`.
