# `SignaturePad` functionality audit

**File:** `src/components/SignaturePad.tsx:105`
**Test:** `src/components/__tests__/SignaturePad.test.tsx`
**Prop count:** 12
**Bucket:** forms

## Prop liveness
- `label` — LIVE (270, 283)
- `width` — LIVE (131, 139, 146)
- `height` — LIVE (173, 280)
- `strokeColor` — LIVE (133, 152-163)
- `strokeWidth` — LIVE (168-169)
- `background` — LIVE (168-169)
- `onChange` — LIVE (224-229)
- `onStrokeStart` — LIVE (201)
- `onStrokeEnd` — LIVE (223)
- `disabled` — LIVE (191, 205, 274, 293)
- `showClearButton` — LIVE (289)
- `id` — LIVE (135, 277)

## Control pattern
- Pattern: Uncontrolled canvas state via `useRef<SignatureStrokes>`; imperative handle exposes `clear/isEmpty/toDataURL/getStrokes/setStrokes`
- Uses `useControllableState`: NO (strokes are a ref, not state)
- Issues:
  - No `value`/`defaultValue` props — strokes are never an externally controlled data source (FINDING 1)
  - `onChange` emits on stroke end but not on `clear` or `setStrokes` (224, 233, 254) — inconsistent observability (FINDING 2)

## State transitions
- Initial → no strokes, placeholder "Sign here" shown ✓ (303)
- Drawing → strokes appended; `hasInk` not yet true (only set on stroke end) ✓ (208-211)
- Stroke end → `hasInk` computed by `strokes.some(s => s.length > 1)` (222); strokes with a single point don't count ✓
- `clear()` → resets strokes, sets hasInk false, re-flushes canvas ✓ (233-237) but does NOT emit onChange
- `setStrokes(next)` → hydrates strokes programmatically, updates hasInk, flushes canvas; does NOT emit onChange
- `disabled=true` → pointerdown early-returns; onStrokeStart/End not emitted ✓ (191)
- `strokeColor` absent + getComputedStyle → reads `--vf-text-0` custom property ✓ (159-162)
- `width` absent → resolves to `container.clientWidth || 360` ✓ (145)

## Callback signatures
- `onChange(dataUrl: string)` — verified (226); only fires on stroke end, not clear
- `onStrokeStart()` — verified (201)
- `onStrokeEnd(strokes: SignatureStrokes)` — verified (223)
- Imperative: `clear()`, `isEmpty()`, `toDataURL(type?, quality?)`, `getStrokes()`, `setStrokes(next)` — all LIVE

## Test coverage
- File exists: YES, ~15 tests
- Tested props: `label`, `disabled`, `onStrokeStart`, `onStrokeEnd`, `showClearButton`, `strokeColor`, `background`; imperative `clear`, `isEmpty`, `toDataURL`, `getStrokes`, `setStrokes`
- Untested props: `width`, `height`, `strokeWidth`, `onChange`, `id`

## Findings
1. P1 — `onChange` not emitted on `clear()` at `src/components/SignaturePad.tsx:233-237`. Consumers listening for `onChange` expecting a form-binding contract will miss the clear event, leaving stale data. Emit `onChange("")` or empty data URL after clear.
2. P1 — `onChange` not emitted on `setStrokes()` at `src/components/SignaturePad.tsx:254-258`. Same contract gap; programmatic hydration should fire the change callback.
3. P1 — `hasInk` set only on stroke end at `src/components/SignaturePad.tsx:222`. During a drag, placeholder "Sign here" is not immediately hidden (but is covered by the canvas strokes visually). Minor UX; placeholder uses `!hasInk` so it stays rendered until stroke ends, but with `aria-hidden=true` it's not announced — OK.
4. P2 — `redraw` clears rect every frame at `src/components/SignaturePad.tsx:83, 165-169, 168`. For very long strokes the full redraw is `O(n)` per pointer move. Consider incremental drawing of the last segment.
5. P2 — Effect on `strokeColor` splits into two effects (138, 151). When both `width` and `strokeColor` change, the effects may fire out of order relative to `flush` (172). Works due to deps, but refactoring into one effect would be clearer.
6. P2 — Pointer capture wrapped in try/catch at `src/components/SignaturePad.tsx:192-196`. Swallows all errors silently; no dev warning.
7. P3 — `width`, `height`, `strokeWidth`, `onChange`, `id` untested at `src/components/__tests__/SignaturePad.test.tsx`.
