# `CarouselImageGallery` functionality audit

**File:** `src/components/Carousel.tsx:365`
**Test:** `src/components/__tests__/Carousel.test.tsx`
**Prop count:** 13 (11 inherited from Carousel + `images` + `kenBurns`)
**Bucket:** media

## Prop liveness
- `images` — LIVE (used at 375)
- `kenBurns` — LIVE (used at 382)
- `autoPlay` — LIVE via spread (inherited; 374 → 72)
- `interval` — LIVE via spread (374 → 73)
- `pauseOnHover` — LIVE via spread (374 → 74)
- `loop` — LIVE via spread (374 → 75)
- `slidesPerView` — LIVE via spread (374 → 76)
- `gap` — LIVE via spread (374 → 77)
- `align` — LIVE via spread (374 → 78)
- `onSlideChange` — LIVE via spread (374 → 79)
- `controls` — LIVE via spread (374 → 80)
- `defaultIndex` — LIVE via spread (374 → 81)
- `index` — LIVE via spread (374 → 82)

## Control pattern
- Pattern: Thin wrapper around Carousel; inherits Carousel's controllable `index` / uncontrolled `defaultIndex` pattern
- Uses `useControllableState`: NO (hand-rolled at Carousel.tsx:88-89, 113)
- Issues: `slides` is overridden by the wrapper (375), so callers who also pass `children` via spread would silently lose them — but `children` is excluded from `CarouselImageProps` so type-safe.

## State transitions
- Renders each image as `<figure>` with `<img>` and optional `<figcaption>` ✓ (376-388)
- `kenBurns=true` → adds `vf-carousel__img--ken-burns` class ✓ (382)
- `images=[]` → renders zero slides; Carousel `total=0`; Prev/Next both disabled at `Carousel.tsx:289, 308`; Dots renders 0 dots ✓
- Inherited transitions (autoPlay, hover pause, reduced motion, loop, keyboard) from Carousel apply ✓

## Callback signatures
- `onSlideChange(index: number)` — verified, inherited, fires with clamped index (`Carousel.tsx:114`)
- Note: `onSlideChange` fires on every internal `setIndex`, including auto-play ticks and keyboard navigation, even if the index did not change (e.g. loop=false and already at 0 pressing Prev still emits current clamped index) (FINDING 1)

## Test coverage
- File exists: YES, 1 test for `CarouselImageGallery` (renders images with captions)
- Tested props: `images` (with and without caption)
- Untested props: `kenBurns`, `autoPlay`, `interval`, `pauseOnHover`, `loop`, `slidesPerView`, `gap`, `align`, `onSlideChange`, `controls`, `defaultIndex`, `index`

## Findings
1. P1 — `onSlideChange` fires even when index did not change at `src/components/Carousel.tsx:108-117`. `setIndex` clamps then always calls `onSlideChange?.(clamped)`; if the caller presses Prev at index 0 with `loop=false`, callback still emits `0`, causing spurious re-renders/analytics hits. Wrapper inherits bug.
2. P2 — Dead imports silenced rather than removed at `src/components/Carousel.tsx:370-371`. `Children` and `isValidElement` are imported solely to be voided; either use them or remove.
3. P3 — `kenBurns` prop untested at `src/components/__tests__/Carousel.test.tsx:91-103`. Only test asserts `images`; all 12 other LIVE props uncovered on the gallery wrapper.
