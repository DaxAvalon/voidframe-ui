# `ChartFrame` functionality audit

**File:** `src/charts/primitives/ChartFrame.tsx:62`
**Test:** `src/charts/primitives/__tests__/ChartFrame.test.tsx`
**Prop count:** 12
**Bucket:** charts

## Prop liveness
- `width` — LIVE (138, 178, 186, 204)
- `height` — LIVE (142, 178, 205, 211)
- `defaultWidth` — LIVE (138)
- `defaultHeight` — LIVE (142)
- `margins` — LIVE (146-150)
- `xScale` — LIVE (161, 173)
- `yScale` — LIVE (162, 174)
- `accessibleLabel` — LIVE (203)
- `title` — LIVE (191-193)
- `description` — LIVE (194-196)
- `svgClassName` — LIVE (201)
- `svgStyle` — LIVE (212)

## Control pattern
- Pattern: Stateless layout primitive; uses `useImperativeHandle` to augment the div ref with `toSVG`/`toPNG`
- Uses `useControllableState`: NO (stateless)
- Issues:
  - `useImperativeHandle` mutates `containerRef.current` directly by attaching `toSVG`/`toPNG` properties (92-97). Consumers using `ref.current.toSVG()` work, but typed `HTMLDivElement & ChartFrameHandle` is unsafe (FINDING 1)
  - `useImperativeHandle` dep array is `[]` (133) so the handle object is set once using a stale `containerRef.current` at mount; subsequent changes to the ref target aren't reflected — but `containerRef.current` is reference-accessed so the handle dereferences lazily, so this works. Subtle.

## State transitions
- `width`/`height` both defined → fixed SVG size, no responsive scaling ✓ (178, 204)
- Either undefined → `autoResponsive=true`, SVG omits `width`/`height` attrs (responsive CSS) ✓ (178, 204-205)
- `measured.width=0` → falls back to `defaultWidth` ✓ (138)
- `resolvedWidth < 1` impossible due to `Math.max(1, ...)` ✓
- `innerWidth/innerHeight` clamp at 0 when margins exceed dims ✓ (151-152)
- `toPNG` on SSR / jsdom: `Image` load likely never fires; `onerror` may fire; promise rejects ✓ (124-127)

## Callback signatures
- `toSVG(): string` — returns `svg.outerHTML` (94-98)
- `toPNG(scale?: number): Promise<string>` — returns dataURL (99-130)

## Test coverage
- File exists: YES, ~5 tests
- Tested props: `width`, `height`, `defaultWidth`, `defaultHeight`, `title`, `description`, `accessibleLabel`
- Untested props: `margins`, `xScale`, `yScale`, `svgClassName`, `svgStyle`; `toSVG`/`toPNG` imperative handle untested

## Findings
1. P1 — Imperative handle augments the DOM node directly at `src/charts/primitives/ChartFrame.tsx:89-132`. The handle attaches `toSVG`/`toPNG` as properties on the actual `HTMLDivElement`, conflicting with React's `useImperativeHandle` convention (which should return a new object). Side effects: any React-internal code that inspects the element will see extra properties; tests that check the DOM may be surprised.
2. P1 — `toPNG` does not wait for XML namespace / inline styles at `src/charts/primitives/ChartFrame.tsx:99-130`. `svg.outerHTML` may omit xmlns attributes required for `Image` to decode the SVG blob in some browsers; absence of `xmlns="http://www.w3.org/2000/svg"` causes `img.onerror`. Serialize with `XMLSerializer` or inject xmlns.
3. P1 — `useImperativeHandle` deps `[]` at `src/charts/primitives/ChartFrame.tsx:133`. Handle object created once; it dereferences `containerRef.current` lazily so it's okay, but if `ref` is a callback ref (function), React will call it with the handle only once at mount and never re-invoke. For DOM assignment this is fine but confusing.
4. P2 — `aria-label` passed even when undefined at `src/charts/primitives/ChartFrame.tsx:203`. React renders `aria-label={undefined}` which is effectively absent, but screen readers seeing `role="img"` with no name get "image" — consider fallback.
5. P2 — `svgStyle` overrides computed `height` at `src/charts/primitives/ChartFrame.tsx:208-213`. `svgStyle` spreads after height; consumer could accidentally nuke the computed height.
6. P3 — `margins`, `xScale`, `yScale`, `svgClassName`, `svgStyle`, `toSVG`/`toPNG` untested.
