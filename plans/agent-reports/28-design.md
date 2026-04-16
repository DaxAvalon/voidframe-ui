# Audit 28 — Design/UX Consistency

## Critical

1. **Hardcoded px spacing** — 900+ instances of hardcoded `gap: Xpx`, `padding: Xpx Ypx`, `margin: Xpx` across nearly all component CSS files instead of `var(--vf-sp-*)` tokens. This means density modes (compact/spacious) won't properly affect most components.

2. **Non-zero border-radius violations** — 18 instances across 8 CSS files. Most `border-radius: 50%` are intentional circular indicators, but:
   - `feedback-overlays.css:105` — `.vf-toast-v2 { border-radius: 2px; }` violates brutalist principle
   - `feedback-overlays.css:514` — `.vf-shimmer--rounded { border-radius: 4px; }` contradicts zero-radius

## Medium

3. **Density barely implemented** — Only `charts.css` respects density in its CSS. All other 31+ component files hardcode spacing. tokens.css defines density overrides but they can't cascade to hardcoded values.

4. **Animation policy violations** — Spinner animations in feedback-overlays.css (vf-bounce, vf-bar, vf-pulse-spin, vf-shimmer-slide, vf-blink). Button spinner references undefined `spin` keyframe. Policy says "no gratuitous animations."

5. **Scattered z-index** — 8 hardcoded z-index values (e.g., `z-index: 9999` in dev.css and utilities.css) vs 22 properly tokenized values using `var(--vf-z-*)`.

6. **Fallback hex colors** — 12 instances of hardcoded hex fallbacks in var() defaults (e.g., `var(--vf-red, #c44)`) in feedback-overlays.css.

## Verified Consistent

- **Theme tokens**: All 4 themes define same complete token set (typography relies on inheritance from root — acceptable)
- **Contrast mode**: Properly implemented with `data-vf-contrast="high"` + OS preference detection
- **Typography**: All components use `var(--vf-font-family)` and `var(--vf-font-*)` tokens
- **Colors**: No hardcoded hex in main properties (only in var() fallbacks)
