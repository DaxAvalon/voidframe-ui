# `Carousel` functionality audit

**File:** `src/components/Carousel.tsx:70`
**Test:** `src/components/__tests__/Carousel.test.tsx`
**Prop count:** 12 (CarouselRoot declared props, excluding HTMLAttributes spread)
**Bucket:** media

## Prop liveness
- `slides` — LIVE (used at 106, 189)
- `autoPlay` — LIVE (used at 145)
- `interval` — LIVE (used at 146)
- `pauseOnHover` — LIVE (used at 175-178)
- `loop` — LIVE (used at 110, 158)
- `slidesPerView` — LIVE (used at 186)
- `gap` — LIVE (used at 185-186)
- `align` — LIVE (used at 157, 266)
- `onSlideChange` — LIVE (used at 114)
- `controls` — LIVE (used at 165-166)
- `defaultIndex` — LIVE (used at 88)
- `index` — LIVE (used at 82, 89, 113)
- (`children`, `className`, `style` are destructured but standard React plumbing)

## Control pattern
- Pattern: Hand-rolled controllable — `const index = indexProp ?? internal` at line 89; writes to `setInternal` only when `indexProp === undefined` (113)
- Uses `useControllableState`: NO (rolls its own at 88-89, 113)
- Issues:
  - When `index` is controlled, `onSlideChange` still fires but `setInternal` doesn't update; `indexRef.current = index` always tracks the incoming prop, so autoplay still drives through the callback ✓
  - No `onChange` guard: consumer passing controlled `index` but no `onSlideChange` has a dead autoplay loop — Prev/Next and autoplay become no-ops silently (FINDING 2)

## State transitions
- Empty children and empty slides → `total=0`; `setIndex` computes `((n % 0) + 0) % 0 = NaN` when `loop=true`, Math.max/min clamp to -1/-Infinity when `loop=false` → NaN index (FINDING 1)
- `autoPlay=true` + `prefersReducedMotion=true` → autoplay halted ✓ (145)
- `autoPlay=true` + `hovered=true` → autoplay halted ✓ (145)
- `total <= 1` → autoplay halted ✓ (145)
- `loop=true` → `setIndex` wraps with modulo ✓ (110-112)
- `loop=false` → Prev disabled at index 0, Next disabled at index `total-1` ✓ (289, 308)
- Index change via prop → `useEffect` triggers `scrollToIndex` ✓ (135-137)
- Keyboard: ArrowRight/Left/Home/End on viewport → `setIndex` moves (212-225) ✓

## Callback signatures
- `onSlideChange(index: number)` — verified, always receives clamped index (114)
- `onSlideChange` fires even when clamped value equals previous index (e.g. Prev at 0 without loop) (FINDING 3)
- `registerSlide(id: string)` / `unregisterSlide(id: string)` — internal context, LIVE in `CarouselSlide` (257-258)

## Test coverage
- File exists: YES, ~5 tests in Carousel describe + 1 in CarouselImageGallery
- Tested props: `onSlideChange`, `defaultIndex`, `loop`, `autoPlay`, `interval`
- Untested props: `slides`, `pauseOnHover`, `slidesPerView`, `gap`, `align`, `controls`, `index` (controlled)

## Findings
1. P0 — NaN index when `total === 0` and `loop=true` at `src/components/Carousel.tsx:110-111`. `((n % 0) + 0) % 0 = NaN`; `onSlideChange(NaN)` can be emitted, `scrollToIndex(NaN)` fetches `vp.children[NaN] === undefined` so it no-ops, but `aria-selected={ctx.index === i}` comparisons on NaN always false. Guard against `total === 0` before computing.
2. P1 — No warning when `index` is controlled without `onSlideChange` at `src/components/Carousel.tsx:82-114`. Autoplay still calls `setIndex` which calls `onSlideChange?.(clamped)` (optional chain), and `setInternal` is skipped (113), so the carousel appears frozen. Should warn in dev.
3. P1 — `onSlideChange` fires even when clamped === previous index at `src/components/Carousel.tsx:114`. No equality check vs prior `index`. Causes redundant emissions.
4. P2 — `force` re-render hack at `src/components/Carousel.tsx:92, 96, 102`. `useState(0)` purely to bump identity after mutating `slideIds.current`. Works, but would be cleaner with state-held array.
5. P2 — Keyboard nav only active on viewport focus at `src/components/Carousel.tsx:212-226`. Arrow keys on Prev/Next buttons (focused) don't navigate; only click. Acceptable but undocumented.
6. P3 — Untested: `slides`, `pauseOnHover`, `slidesPerView`, `gap`, `align`, `controls`, controlled `index` at `src/components/__tests__/Carousel.test.tsx`.
