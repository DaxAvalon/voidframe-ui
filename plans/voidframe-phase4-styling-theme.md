# Phase 4: Styling & Theme Gaps

## Context

Voidframe's styling system is CSS-first with custom properties (`--vf-*`), 4 built-in themes, a 12-step spacing scale, 5 breakpoints, BEM naming, and support for density/contrast/RTL/reduced-motion modes. This phase addresses 10 identified gaps in the token system, CSS architecture, and design system completeness. All changes are CSS and TypeScript token additions — no new components, but existing components may benefit from the expanded token palette.

**Test requirement:** Token changes get tests in `src/__tests__/tokens.test.ts` (or a new file). CSS changes get visual regression tests where applicable. TypeScript utility changes get unit tests with 100% coverage.

---

## 4.1 Opacity Token Variants

**Files to modify:**
- `src/tokens.ts` — add opacity variants to VoidframeTokens
- `src/css/tokens.css` — add CSS custom properties for opacity variants
- `src/themes/dark.ts`, `light.ts`, `midnight.ts`, `grey.ts` — add values per theme

**Files to create:**
- `src/utils/__tests__/tint.test.ts` (if tint utility needs expansion)

**Description:** Add opacity variants for all accent colors. Currently using accent colors at reduced opacity requires manual `color-mix(in srgb, var(--vf-green) 20%, transparent)` everywhere. Pre-defined opacity tokens eliminate this boilerplate.

**New tokens:**
```typescript
// For each accent color (green, red, amber, blue, purple, cyan, rose):
export interface VoidframeTokens {
  // ... existing tokens ...
  
  // Opacity variants — hex colors with alpha channel
  green5: string;    // 5% opacity  — subtle backgrounds
  green10: string;   // 10% opacity — hover backgrounds
  green20: string;   // 20% opacity — active backgrounds, borders
  green40: string;   // 40% opacity — muted text, secondary elements
  green60: string;   // 60% opacity — primary use (most components use this or full)
  // Same pattern for: red, amber, blue, purple, cyan, rose
}
```

**CSS custom properties:**
```css
:root, [data-vf-theme="dark"] {
  --vf-green-5: #4ade800d;
  --vf-green-10: #4ade801a;
  --vf-green-20: #4ade8033;
  --vf-green-40: #4ade8066;
  --vf-green-60: #4ade8099;
  /* ... same for all 7 accents ... */
}
```

**Implementation notes:**
- 5 opacity levels x 7 accent colors = 35 new tokens
- Use hex alpha notation (8-digit hex) for consistency with existing tokens
- Alternatively, use the existing `tint()` function to generate at build time
- Each theme overrides with its own accent colors at same opacities
- Semantic aliases: `--vf-success-20` maps to `--vf-green-20`, etc.

**Migration:** Grep codebase for `color-mix(in srgb, var(--vf-green)` patterns and replace with new tokens where appropriate. This is optional optimization — existing `color-mix` continues to work.

**Test plan:**
1. Each opacity token is defined in default tokens
2. Each opacity token has correct alpha channel value
3. All 4 themes define all opacity variants
4. `tint()` utility produces same values as hardcoded tokens
5. Semantic aliases (success-20, danger-20, etc.) map correctly
6. CSS custom properties render in all theme modes

---

## 4.2 CSS Container Queries

**Files to modify:**
- `src/css/tokens.css` — add container-type declarations
- `src/css/utilities.css` — add container query utility classes

**Files to create:**
- `src/css/container-queries.css`
- `src/utils/__tests__/containerQueries.test.ts`

**Description:** Add native CSS `@container` query support alongside the existing JS-based `useContainerQuery` hook. CSS container queries reduce JavaScript overhead for responsive components that respond to their parent's size rather than the viewport.

**New CSS:**
```css
/* Container declarations */
.vf-container { container-type: inline-size; }
.vf-container-normal { container-type: normal; }
.vf-container-size { container-type: size; }

/* Named containers */
.vf-container-name-card { container-name: card; }
.vf-container-name-panel { container-name: panel; }
.vf-container-name-sidebar { container-name: sidebar; }

/* Breakpoint utility classes within containers */
/* @container (min-width: 400px) { .cq-sm\:vf-{...} } */
/* @container (min-width: 640px) { .cq-md\:vf-{...} } */
/* @container (min-width: 800px) { .cq-lg\:vf-{...} } */
```

**Container breakpoints (different from viewport breakpoints):**
```css
--vf-cq-sm: 400px;
--vf-cq-md: 640px;
--vf-cq-lg: 800px;
--vf-cq-xl: 1024px;
```

**Utility classes within container queries:**
```css
@container (min-width: 400px) {
  .cq-sm\:vf-hidden { display: none; }
  .cq-sm\:vf-visible { display: block; }
  .cq-sm\:vf-flex-row { flex-direction: row; }
  .cq-sm\:vf-flex-col { flex-direction: column; }
  .cq-sm\:vf-grid-2 { grid-template-columns: repeat(2, 1fr); }
  .cq-sm\:vf-grid-3 { grid-template-columns: repeat(3, 1fr); }
}
/* Same pattern for cq-md, cq-lg, cq-xl */
```

**Implementation notes:**
- Container queries are progressive enhancement — fallback gracefully in older browsers
- Don't convert existing viewport-responsive components; add as option
- Container breakpoints are intentionally smaller than viewport breakpoints (containers are smaller than viewport)
- Integrate with existing `useContainerQuery` hook — add a `cssOnly` option that just sets container-type

**Test plan:**
1. `.vf-container` sets `container-type: inline-size` (verify via getComputedStyle)
2. Container query utility classes apply styles when container is wide enough
3. Nested containers respect their own container context
4. Named containers with `container-name` work for targeted queries
5. Container breakpoint tokens have correct values
6. Fallback: classes still apply sensible defaults without container query support

---

## 4.3 Gradient Token System

**Files to create:**
- `src/css/gradients.css`
- `src/utils/__tests__/gradients.test.ts` (for gradient utility functions)

**Files to modify:**
- `src/css/index.css` — import gradients.css
- `src/tokens.ts` — add gradient tokens if using JS

**Description:** Predefined gradient tokens and utility classes. The brutalist aesthetic doesn't use gradients extensively, but subtle gradients for backgrounds, overlays, and data visualization enhance the design system.

**New CSS custom properties:**
```css
:root, [data-vf-theme="dark"] {
  /* Surface gradients — subtle depth */
  --vf-gradient-surface: linear-gradient(180deg, var(--vf-bg-1) 0%, var(--vf-bg-0) 100%);
  --vf-gradient-surface-reverse: linear-gradient(0deg, var(--vf-bg-1) 0%, var(--vf-bg-0) 100%);
  
  /* Accent gradients — for highlights, CTAs */
  --vf-gradient-accent: linear-gradient(135deg, var(--vf-accent) 0%, color-mix(in srgb, var(--vf-accent) 60%, var(--vf-bg-0)) 100%);
  
  /* Scrim gradients — for overlays on images/content */
  --vf-gradient-scrim-top: linear-gradient(180deg, var(--vf-scrim) 0%, transparent 100%);
  --vf-gradient-scrim-bottom: linear-gradient(0deg, var(--vf-scrim) 0%, transparent 100%);
  
  /* Data gradients — for heatmaps, charts */
  --vf-gradient-heat: linear-gradient(90deg, var(--vf-blue) 0%, var(--vf-green) 33%, var(--vf-amber) 66%, var(--vf-red) 100%);
  --vf-gradient-cool: linear-gradient(90deg, var(--vf-cyan) 0%, var(--vf-blue) 50%, var(--vf-purple) 100%);
  --vf-gradient-diverging: linear-gradient(90deg, var(--vf-red) 0%, var(--vf-bg-2) 50%, var(--vf-green) 100%);
}
```

**Utility classes:**
```css
.vf-gradient-surface { background: var(--vf-gradient-surface); }
.vf-gradient-accent { background: var(--vf-gradient-accent); }
.vf-gradient-scrim-top { background: var(--vf-gradient-scrim-top); }
.vf-gradient-scrim-bottom { background: var(--vf-gradient-scrim-bottom); }
.vf-gradient-text { /* Gradient text clipping */ }
```

**Implementation notes:**
- All gradients use existing token colors — they adapt automatically per theme
- Data gradients useful for chart components (heatmap, choropleth)
- Scrim gradients useful for image overlays (carousel, lightbox)
- Gradient text uses `-webkit-background-clip: text` with fallback

**Test plan:**
1. Surface gradient CSS property defined in default theme
2. Gradient changes per theme (light theme uses inverted direction)
3. All gradient utility classes apply correct background
4. Gradient text clip renders without visible background rectangle
5. Data gradients have correct color stops
6. Gradients render correctly in all 4 themes

---

## 4.4 Border Width Tokens

**Files to modify:**
- `src/tokens.ts` — add border width tokens
- `src/css/tokens.css` — add CSS custom properties

**Description:** Add border width tokens. Currently only border colors exist (border0–border4); widths are hardcoded. Consistent border width tokens enable density-responsive borders and explicit border weight control.

**New tokens:**
```css
--vf-border-width-0: 0px;       /* No border */
--vf-border-width-1: 1px;       /* Default — most borders */
--vf-border-width-2: 2px;       /* Emphasized borders, focus rings */
--vf-border-width-3: 3px;       /* Heavy emphasis */
--vf-border-width-4: 4px;       /* Maximum emphasis, section dividers */
```

**Density scaling:**
```css
[data-vf-density="compact"] {
  --vf-border-width-2: 1px;     /* Thinner in compact */
  --vf-border-width-3: 2px;
  --vf-border-width-4: 3px;
}

[data-vf-density="spacious"] {
  --vf-border-width-2: 3px;     /* Thicker in spacious */
  --vf-border-width-3: 4px;
  --vf-border-width-4: 5px;
}
```

**Utility classes:**
```css
.vf-border-0 { border-width: var(--vf-border-width-0); }
.vf-border-1 { border-width: var(--vf-border-width-1); }
.vf-border-2 { border-width: var(--vf-border-width-2); }
.vf-border-3 { border-width: var(--vf-border-width-3); }
.vf-border-4 { border-width: var(--vf-border-width-4); }
/* Side-specific: .vf-border-t-1, .vf-border-b-2, etc. */
```

**Test plan:**
1. All border width tokens defined in default theme
2. Tokens scale with density mode (compact thinner, spacious thicker)
3. Utility classes apply correct border width
4. Side-specific utilities work (top, right, bottom, left)
5. Border width 0 removes border entirely

---

## 4.5 Shadow Utility System

**Files to modify:**
- `src/css/tokens.css` — verify shadow tokens
- `src/css/utilities.css` — add shadow utility classes

**Description:** Shadow tokens exist (`--vf-shadow-sm`, `--vf-shadow-md`, `--vf-shadow-lg`) but there are no utility classes to apply them. Add utility classes and expand the shadow scale.

**Expanded shadow scale:**
```css
--vf-shadow-none: none;
--vf-shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.2);
--vf-shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3);
--vf-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
--vf-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3);
--vf-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
--vf-shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.2);
```

**Utility classes:**
```css
.vf-shadow-none { box-shadow: var(--vf-shadow-none); }
.vf-shadow-xs { box-shadow: var(--vf-shadow-xs); }
.vf-shadow-sm { box-shadow: var(--vf-shadow-sm); }
.vf-shadow-md { box-shadow: var(--vf-shadow-md); }
.vf-shadow-lg { box-shadow: var(--vf-shadow-lg); }
.vf-shadow-xl { box-shadow: var(--vf-shadow-xl); }
.vf-shadow-inner { box-shadow: var(--vf-shadow-inner); }
```

**Theme variations:**
- Light theme: lighter shadows (lower opacity)
- Dark/midnight: heavier shadows (higher opacity, maybe colored)
- Grey: medium shadows

**Test plan:**
1. All shadow tokens defined in each theme
2. Shadow utility classes apply correct box-shadow
3. Shadow tokens vary per theme (opacity differences)
4. `.vf-shadow-none` removes shadows
5. `.vf-shadow-inner` applies inset shadow
6. New shadow tokens (xs, xl, inner) render correctly

---

## 4.6 CSS Logical Properties Audit

**Files to modify:**
- Multiple component CSS files

**Description:** Audit and convert physical CSS properties to logical equivalents for better RTL support. Voidframe supports RTL via `dir="rtl"` attribute, but CSS may still use physical properties (`margin-left`, `padding-right`) that don't flip in RTL.

**Properties to convert:**
```
Physical                 → Logical
margin-left              → margin-inline-start
margin-right             → margin-inline-end
padding-left             → padding-inline-start
padding-right            → padding-inline-end
border-left              → border-inline-start
border-right             → border-inline-end
left                     → inset-inline-start
right                    → inset-inline-end
text-align: left         → text-align: start
text-align: right        → text-align: end
float: left              → float: inline-start
float: right             → float: inline-end
```

**Exceptions (keep physical):**
- Vertical properties (`top`, `bottom`, `margin-top`, `margin-bottom`) — these don't change in RTL
- Explicitly visual positioning (shadows, transforms, decorations)
- Animation directions (`translateX` for slide-left/right — these should flip, but via `[dir="rtl"]` override)

**Implementation approach:**
1. Grep all component CSS files for physical properties
2. For each, determine if it should be logical (depends on reading direction) or physical (always same visual position)
3. Convert reading-direction-dependent properties to logical
4. Test RTL rendering for key components

**Test plan:**
1. Grep for remaining physical properties after conversion — document any intentional exceptions
2. Key components render correctly in `dir="rtl"` mode:
   - Navigation (Sidebar, Breadcrumb, Navbar) — items flip to right-to-left
   - Form fields (Input, Select, Combobox) — text direction correct
   - Modals/Drawers — slide from correct side in RTL
   - DataGrid — columns render right-to-left
3. No visual regressions in LTR mode (properties are equivalent)
4. renderWithTheme with `direction: "rtl"` option — verify CSS applies

---

## 4.7 color-scheme CSS Meta

**Files to modify:**
- `src/css/tokens.css` — add `color-scheme` property
- `src/css/base.css` — apply to `.vf-root`

**Description:** Add `color-scheme: dark` (or `light`) CSS property so native form controls (scrollbars, checkboxes, selects, date inputs) automatically match the theme. Without this, native controls render in the browser's default light scheme even in dark mode.

**Implementation:**
```css
[data-vf-theme="dark"],
[data-vf-theme="midnight"] {
  color-scheme: dark;
}

[data-vf-theme="light"] {
  color-scheme: light;
}

[data-vf-theme="grey"] {
  color-scheme: dark light;  /* browser picks best match */
}
```

**What this affects:**
- Native scrollbar colors
- Native `<select>` dropdown background
- Native `<input type="date">` picker
- `<meta name="color-scheme">` (handled by theme-script.js)
- `Canvas` default background
- System `::backdrop` color

**Test plan:**
1. Dark theme root has `color-scheme: dark`
2. Light theme root has `color-scheme: light`
3. Midnight theme has `color-scheme: dark`
4. Grey theme has `color-scheme: dark light`
5. Native scrollbar renders dark in dark mode (visual check)

---

## 4.8 Expanded Utility Classes

**Files to modify:**
- `src/css/utilities.css`

**Description:** Add commonly needed utility classes that are currently missing. The existing set is minimal (visually-hidden, truncate, no-scrollbar, uppercase, skip-to-content). Expand to cover the most common inline needs.

**New utility classes:**
```css
/* Display */
.vf-hidden { display: none; }
.vf-block { display: block; }
.vf-inline-block { display: inline-block; }
.vf-inline { display: inline; }
.vf-flex { display: flex; }
.vf-inline-flex { display: inline-flex; }
.vf-grid { display: grid; }

/* Overflow */
.vf-overflow-hidden { overflow: hidden; }
.vf-overflow-auto { overflow: auto; }
.vf-overflow-x-auto { overflow-x: auto; }
.vf-overflow-y-auto { overflow-y: auto; }

/* Position */
.vf-relative { position: relative; }
.vf-absolute { position: absolute; }
.vf-fixed { position: fixed; }
.vf-sticky { position: sticky; }

/* Text */
.vf-text-left { text-align: start; }
.vf-text-center { text-align: center; }
.vf-text-right { text-align: end; }
.vf-text-nowrap { white-space: nowrap; }
.vf-text-break { word-break: break-word; overflow-wrap: break-word; }
.vf-text-mono { font-family: var(--vf-font-family); }
.vf-text-bold { font-weight: 700; }
.vf-text-normal { font-weight: 400; }

/* Cursor */
.vf-cursor-pointer { cursor: pointer; }
.vf-cursor-default { cursor: default; }
.vf-cursor-not-allowed { cursor: not-allowed; }
.vf-cursor-grab { cursor: grab; }

/* Pointer events */
.vf-pointer-events-none { pointer-events: none; }
.vf-pointer-events-auto { pointer-events: auto; }

/* User select */
.vf-select-none { user-select: none; }
.vf-select-all { user-select: all; }
.vf-select-text { user-select: text; }

/* Aspect ratio */
.vf-aspect-square { aspect-ratio: 1; }
.vf-aspect-video { aspect-ratio: 16/9; }
.vf-aspect-photo { aspect-ratio: 4/3; }

/* Width/Height */
.vf-w-full { width: 100%; }
.vf-h-full { height: 100%; }
.vf-min-h-screen { min-height: 100vh; }
.vf-max-w-prose { max-width: 65ch; }

/* Flex utilities */
.vf-flex-1 { flex: 1; }
.vf-flex-auto { flex: auto; }
.vf-flex-none { flex: none; }
.vf-flex-grow { flex-grow: 1; }
.vf-flex-shrink-0 { flex-shrink: 0; }

/* Gap utilities using spacing tokens */
.vf-gap-0 { gap: 0; }
.vf-gap-1 { gap: var(--vf-sp-1); }
.vf-gap-2 { gap: var(--vf-sp-2); }
.vf-gap-4 { gap: var(--vf-sp-4); }
.vf-gap-6 { gap: var(--vf-sp-6); }
.vf-gap-8 { gap: var(--vf-sp-8); }
.vf-gap-10 { gap: var(--vf-sp-10); }
.vf-gap-12 { gap: var(--vf-sp-12); }

/* Margin/Padding with token values */
.vf-m-0 { margin: 0; }
.vf-m-auto { margin: auto; }
.vf-mx-auto { margin-inline: auto; }
.vf-p-0 { padding: 0; }
/* Spacing 4 and 8 are most commonly needed inline */
.vf-p-4 { padding: var(--vf-sp-4); }
.vf-p-8 { padding: var(--vf-sp-8); }
.vf-px-4 { padding-inline: var(--vf-sp-4); }
.vf-py-4 { padding-block: var(--vf-sp-4); }
.vf-px-8 { padding-inline: var(--vf-sp-8); }
.vf-py-8 { padding-block: var(--vf-sp-8); }
```

**Implementation notes:**
- Use logical properties for margin/padding (inline/block instead of left/right/top/bottom)
- Use `start`/`end` instead of `left`/`right` for text-align
- Keep the set focused — these are escape hatches, not a Tailwind replacement
- Gap utilities reference spacing tokens for consistency
- All prefixed with `vf-` to avoid conflicts

**Test plan:**
1. Each utility class applies the correct CSS property
2. Logical properties work correctly in RTL mode
3. Gap utilities use correct spacing token values
4. Aspect ratio utilities render correct proportions
5. No naming conflicts with existing component classes
6. Total CSS size impact: verify still under 40 KB gzipped

---

## 4.9 Print Stylesheet Expansion

**Files to modify:**
- `src/css/base.css` — expand `@media print` section

**Description:** Expand the minimal print styles to provide better control over printed output. Current print styles only hide overlays and force ink-on-paper defaults.

**New print styles:**
```css
@media print {
  /* Already exists: hide overlays, invert colors */
  
  /* NEW: Page break control */
  .vf-break-before { break-before: page; }
  .vf-break-after { break-after: page; }
  .vf-break-inside-avoid { break-inside: avoid; }
  
  /* NEW: Print visibility */
  .vf-print-hidden { display: none !important; }
  .vf-print-only { /* visible only in print */ }
  .vf-screen-only { display: none !important; }
  
  /* NEW: Component-specific print optimization */
  .vf-sidebar { display: none !important; }
  .vf-navbar { display: none !important; }
  .vf-fab { display: none !important; }
  .vf-toast, .vf-toaster { display: none !important; }
  .vf-back-to-top { display: none !important; }
  .vf-scroll-indicator { display: none !important; }
  
  /* NEW: Table optimization */
  .vf-data-grid { overflow: visible !important; }
  .vf-data-grid thead { display: table-header-group; }  /* repeat headers on each page */
  
  /* NEW: Link URLs */
  a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-size: var(--vf-font-xxs);
    color: var(--vf-text-3);
  }
  
  /* NEW: Background colors → borders for ink saving */
  .vf-tag, .vf-badge__indicator {
    border: 1px solid currentColor;
    background: transparent !important;
  }
}
```

**Print-specific components already hidden:** Modal, Dialog, Drawer, Popover, Tooltip, Toast (from existing base.css).

**Test plan:**
1. `.vf-print-hidden` elements not visible in print media
2. `.vf-screen-only` elements not visible in print media
3. `.vf-print-only` elements only visible in print media
4. Navigation elements (sidebar, navbar) hidden in print
5. Table headers repeat on page breaks
6. External link URLs appended after links
7. Page break classes control break behavior

---

## 4.10 Transition Token Expansion

**Files to modify:**
- `src/css/tokens.css` — expand transition/animation tokens

**Description:** Expand the transition system beyond the single `--vf-transition: all 0.15s ease`. Add named transition tokens for different properties and speeds, enabling more nuanced motion design.

**New tokens:**
```css
/* Property-specific transitions */
--vf-transition-colors: color, background-color, border-color, outline-color, fill, stroke;
--vf-transition-opacity: opacity;
--vf-transition-shadow: box-shadow;
--vf-transition-transform: transform;

/* Compound transitions */
--vf-transition-default: color 150ms var(--vf-easing-standard),
                          background-color 150ms var(--vf-easing-standard),
                          border-color 150ms var(--vf-easing-standard),
                          box-shadow 150ms var(--vf-easing-standard);

--vf-transition-transform-only: transform 200ms var(--vf-easing-emphasized);

--vf-transition-all: all 150ms var(--vf-easing-standard);

/* Spring-like easing (approximated with cubic-bezier) */
--vf-easing-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--vf-easing-bounce: cubic-bezier(0.34, 1.3, 0.64, 1);
--vf-easing-decelerate: cubic-bezier(0, 0, 0.2, 1);
--vf-easing-accelerate: cubic-bezier(0.4, 0, 1, 1);

/* Duration additions */
--vf-duration-instant: 0ms;
--vf-duration-faster: 50ms;
--vf-duration-slower: 400ms;
--vf-duration-slowest: 600ms;
```

**Implementation notes:**
- `--vf-transition-default` replaces `all 0.15s ease` with property-specific transitions (avoids transitioning `height`, `width`, `layout` properties which cause jank)
- Spring/bounce easings are cubic-bezier approximations — not true spring physics, but good enough for UI
- All durations respect `prefers-reduced-motion` (already handled by existing `@media` rule)
- Existing `--vf-transition` remains for backward compatibility

**Test plan:**
1. All new transition tokens defined
2. Property-specific transitions only animate named properties
3. Spring/bounce easings produce visible overshoot effect
4. New duration tokens have correct values
5. Reduced motion media query zeroes out all durations
6. Backward compatibility: existing `--vf-transition` still works

---

## Integration with Existing Codebase

**Files to update:**
1. `src/css/index.css` — import any new CSS files (gradients.css, container-queries.css)
2. `src/tokens.ts` — update `VoidframeTokens` interface with new token types
3. `src/themes/*.ts` — add values for new tokens in each theme
4. `src/css/tokens.css` — add CSS custom properties
5. Run `scripts/extract-props.mjs` — regenerate prop docs

**Order of implementation:**
1. Opacity tokens (4.1) — most impactful, simplest change
2. Border width tokens (4.4) — simple addition
3. Shadow utilities (4.5) — simple addition
4. Expanded utility classes (4.8) — broad utility
5. Transition tokens (4.10) — enhances motion system
6. color-scheme meta (4.7) — simple, high impact for native elements
7. Gradient system (4.3) — new CSS file
8. CSS container queries (4.2) — new CSS file
9. Print expansion (4.9) — enhancement to existing
10. Logical properties audit (4.6) — refactor of existing

---

## Verification

After implementing all styling changes:
1. Run `vitest run` — all existing tests still pass
2. Run new token/utility tests — 100% coverage
3. Visual check: all 4 themes render correctly with new tokens
4. Visual check: RTL mode works after logical property conversion
5. Visual check: print mode shows expanded print styles
6. Bundle size: CSS still under 40 KB gzipped
7. Run `vite build` — no errors
8. Density modes (compact, spacious) apply correctly to new tokens
9. High contrast mode enhances new utilities appropriately
10. Reduced motion respects new transition tokens
