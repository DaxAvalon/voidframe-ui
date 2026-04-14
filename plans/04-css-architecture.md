# 04 — CSS Architecture

**Goal:** Replace all inline `style={{}}` with a real CSS architecture. Unlock pseudo-selectors, keyframes, media queries, SSR support, and dramatic perf gains.

**Depends on:** 01 TypeScript, 02 Architecture patterns.
**Unblocks:** 05 Accessibility (focus-visible), 06 Animation, 15 Theming (density/contrast), 16 Responsive.
**Effort:** 3-4 days.

## Approach

**Chosen strategy: CSS custom properties + static CSS classes.** Zero runtime, zero bundled CSS-in-JS, maximum SSR compatibility, trivial theme switching.

The `style` prop remains as a **final escape hatch** on every component, but base styles come from CSS classes keyed to design tokens via custom properties.

### Why not vanilla-extract / Stitches / Emotion / styled-components?
- **vanilla-extract**: excellent, but requires Vite plugin + build-step ceremony that adds fragility for consumers using alternate bundlers.
- **Stitches**: unmaintained.
- **Emotion / styled-components**: runtime overhead; SSR complexity; hydration mismatches; increases bundle size.
- **Plain CSS + CSS vars**: zero runtime; framework-agnostic; every bundler understands it; cache-friendly; the browser owns the cascade.

**We ship one CSS file.** Consumers import it once.

---

## File Structure

```
src/
├── css/
│   ├── index.css              # entry: imports all below in order
│   ├── reset.css              # minimal reset
│   ├── tokens.css             # :root + [data-vf-theme] custom properties
│   ├── base.css               # .vf-root baseline
│   ├── keyframes.css          # @keyframes definitions
│   ├── utilities.css          # .vf-visually-hidden, .vf-focus-ring, etc.
│   └── components/
│       ├── button.css
│       ├── card.css
│       ├── input.css
│       ├── ...                # one file per component group
```

The Vite build emits `dist/styles.css` (bundled + minified) that consumers import:

```ts
import "voidframe/styles.css";
```

Or, for maximum tree-shaking (advanced), per-component CSS:

```ts
import "voidframe/styles/button.css";
```

---

## Token Generation

Tokens become CSS custom properties under `:root` and theme-scoped selectors.

### `src/css/tokens.css` (generated from `src/tokens.ts`)

```css
:root, [data-vf-theme="dark"] {
  /* surfaces */
  --vf-bg-0: #050505;
  --vf-bg-1: #0a0a0a;
  --vf-bg-2: #0d0d0d;
  --vf-bg-3: #111111;
  --vf-bg-4: #161616;
  --vf-bg-5: #1a1a1a;

  /* borders */
  --vf-border-0: #111111;
  --vf-border-1: #1a1a1a;
  --vf-border-2: #222222;
  --vf-border-3: #333333;
  --vf-border-4: #444444;

  /* text */
  --vf-text-0: #ffffff;
  --vf-text-1: #cccccc;
  --vf-text-2: #888888;
  --vf-text-3: #555555;
  --vf-text-4: #333333;
  --vf-text-5: #1a1a1a;

  /* accents */
  --vf-green: #4ade80;
  --vf-red: #f87171;
  --vf-amber: #c8aa3e;
  --vf-blue: #6b9fdd;
  --vf-purple: #a855f7;
  --vf-cyan: #22d3ee;
  --vf-rose: #ff6b6b;

  /* semantic aliases */
  --vf-success: var(--vf-green);
  --vf-danger: var(--vf-red);
  --vf-warning: var(--vf-amber);
  --vf-info: var(--vf-blue);

  /* typography */
  --vf-font-family: 'Courier New', 'Courier', 'Liberation Mono', monospace;
  --vf-font-xxs: 8px;
  --vf-font-xs:  9px;
  --vf-font-sm: 10px;
  --vf-font-md: 12px;
  --vf-font-lg: 14px;
  --vf-font-xl: 18px;
  --vf-font-xxl: 24px;
  --vf-font-3xl: 32px;

  /* spacing */
  --vf-sp-1: 2px;   --vf-sp-2: 4px;   --vf-sp-3: 6px;   --vf-sp-4: 8px;
  --vf-sp-5: 10px;  --vf-sp-6: 12px;  --vf-sp-7: 16px;  --vf-sp-8: 20px;
  --vf-sp-9: 24px;  --vf-sp-10: 32px; --vf-sp-11: 40px; --vf-sp-12: 48px;

  /* motion */
  --vf-duration-fast: 100ms;
  --vf-duration-base: 150ms;
  --vf-duration-slow: 250ms;
  --vf-easing-standard: cubic-bezier(0.2, 0, 0, 1);
  --vf-easing-emphasized: cubic-bezier(0.3, 0, 0, 1);

  /* geometry */
  --vf-radius: 0;

  /* z-index */
  --vf-z-base: 0;
  --vf-z-dropdown: 1000;
  --vf-z-sticky: 1100;
  --vf-z-modal: 1300;
  --vf-z-popover: 1400;
  --vf-z-tooltip: 1500;
  --vf-z-toast: 1600;

  /* breakpoints (for JS consumers; CSS uses @media directly) */
  --vf-bp-sm: 640px;
  --vf-bp-md: 768px;
  --vf-bp-lg: 1024px;
  --vf-bp-xl: 1280px;
  --vf-bp-xxl: 1536px;

  /* focus ring */
  --vf-focus-ring: 2px solid var(--vf-text-0);
  --vf-focus-offset: 0;
}

[data-vf-theme="light"] {
  --vf-bg-0: #f5f5f0;
  --vf-bg-1: #eeeeea;
  --vf-bg-2: #e8e8e4;
  /* ... light overrides ... */
  --vf-text-0: #050505;
  --vf-text-1: #1a1a1a;
  /* ... */
}

[data-vf-density="compact"] {
  --vf-sp-1: 1px;  --vf-sp-2: 2px;  --vf-sp-3: 4px;  --vf-sp-4: 6px;
  --vf-sp-5: 8px;  --vf-sp-6: 10px; --vf-sp-7: 12px; --vf-sp-8: 16px;
  --vf-sp-9: 20px; --vf-sp-10: 24px;
}

[data-vf-density="spacious"] {
  --vf-sp-4: 12px; --vf-sp-5: 14px; --vf-sp-6: 16px; --vf-sp-7: 20px;
  --vf-sp-8: 24px; --vf-sp-9: 32px; --vf-sp-10: 40px;
}

[data-vf-contrast="high"] {
  --vf-text-1: #ffffff;
  --vf-text-2: #cccccc;
  --vf-border-1: #444444;
  --vf-border-2: #666666;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --vf-duration-fast: 0.01ms;
    --vf-duration-base: 0.01ms;
    --vf-duration-slow: 0.01ms;
  }
}
```

### Build-time generation

`scripts/generate-css-tokens.ts` reads `src/tokens.ts`, outputs `src/css/tokens.css`. Runs in `prebuild`. Keeps the CSS file in sync with the TS source of truth.

---

## Reset

`src/css/reset.css`:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-text-size-adjust: 100%;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.5;
  text-rendering: optimizeLegibility;
}

img, picture, video, canvas, svg {
  display: block;
  max-width: 100%;
}

button, input, textarea, select {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  outline: none;
}

button {
  cursor: pointer;
  user-select: none;
}

[hidden] { display: none !important; }

:focus-visible {
  outline: var(--vf-focus-ring);
  outline-offset: var(--vf-focus-offset);
}

::selection {
  background: var(--vf-text-1);
  color: var(--vf-bg-0);
}

/* opt-in only — consumers toggle via VoidframeProvider cssBaseline prop */
```

Reset is opt-in. `VoidframeProvider` accepts `cssBaseline={true}` to inject it.

---

## Base Styles

`src/css/base.css`:

```css
.vf-root {
  background: var(--vf-bg-0);
  color: var(--vf-text-1);
  font-family: var(--vf-font-family);
  font-size: var(--vf-font-md);
  line-height: 1.6;
  min-height: 100%;
}

.vf-root * {
  font-family: inherit;
}
```

---

## Component CSS Pattern

Each component gets its own stylesheet.

`src/css/components/button.css`:

```css
.vf-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--vf-sp-3);
  padding: var(--vf-sp-4) var(--vf-sp-6);
  background: var(--vf-bg-2);
  color: var(--vf-text-0);
  border: 1px solid var(--vf-border-2);
  font-family: inherit;
  font-size: var(--vf-font-sm);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background var(--vf-duration-fast) var(--vf-easing-standard),
              border-color var(--vf-duration-fast) var(--vf-easing-standard);
  user-select: none;
}

.vf-button:hover:not(:disabled) {
  background: var(--vf-bg-3);
  border-color: var(--vf-border-3);
}

.vf-button:focus-visible {
  outline: var(--vf-focus-ring);
  outline-offset: var(--vf-focus-offset);
}

.vf-button:active:not(:disabled) {
  background: var(--vf-bg-4);
}

.vf-button:disabled,
.vf-button[aria-disabled="true"] {
  color: var(--vf-text-3);
  cursor: not-allowed;
  opacity: 0.6;
}

/* variants */
.vf-button--ghost {
  background: transparent;
  border-color: transparent;
}
.vf-button--ghost:hover:not(:disabled) {
  background: var(--vf-bg-3);
}

.vf-button--accent {
  color: var(--vf-accent, var(--vf-text-0));
  border-color: var(--vf-accent, var(--vf-border-2));
}

.vf-button--solid {
  background: var(--vf-accent, var(--vf-text-0));
  color: var(--vf-bg-0);
  border-color: var(--vf-accent, var(--vf-text-0));
}

/* sizes */
.vf-button--xs  { padding: var(--vf-sp-2) var(--vf-sp-4); font-size: var(--vf-font-xs); }
.vf-button--sm  { padding: var(--vf-sp-3) var(--vf-sp-5); font-size: var(--vf-font-sm); }
.vf-button--md  { padding: var(--vf-sp-4) var(--vf-sp-6); font-size: var(--vf-font-sm); }
.vf-button--lg  { padding: var(--vf-sp-5) var(--vf-sp-8); font-size: var(--vf-font-md); }

.vf-button--full-width { width: 100%; }

.vf-button[data-loading="true"] {
  pointer-events: none;
}
```

The TSX sets `--vf-accent` inline when an accent color prop is passed:

```tsx
<button
  className={cx("vf-button", `vf-button--${variant}`, `vf-button--${size}`)}
  style={accent ? { "--vf-accent": accent } as CSSProperties : undefined}
/>
```

This is the **only** inline-style pattern allowed after the migration: **CSS custom property overrides**. No layout, no color, no typography — just CSS var values.

---

## `cx()` utility

`src/utils/cx.ts`:

```ts
export function cx(
  ...args: Array<string | number | false | null | undefined | Record<string, boolean>>
): string {
  const classes: string[] = [];
  for (const arg of args) {
    if (!arg) continue;
    if (typeof arg === "string" || typeof arg === "number") classes.push(String(arg));
    else if (typeof arg === "object") {
      for (const key in arg) if (arg[key]) classes.push(key);
    }
  }
  return classes.join(" ");
}
```

Used in every component:

```tsx
className={cx("vf-button", `vf-button--${variant}`, { "vf-button--full-width": fullWidth }, className)}
```

---

## Keyframes

`src/css/keyframes.css`:

```css
@keyframes vf-fade-in  { from { opacity: 0 } to { opacity: 1 } }
@keyframes vf-fade-out { from { opacity: 1 } to { opacity: 0 } }
@keyframes vf-slide-up-in   { from { transform: translateY(8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
@keyframes vf-slide-up-out  { from { transform: translateY(0); opacity: 1 } to { transform: translateY(8px); opacity: 0 } }
@keyframes vf-slide-down-in  { from { transform: translateY(-8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
@keyframes vf-slide-down-out { from { transform: translateY(0); opacity: 1 } to { transform: translateY(-8px); opacity: 0 } }
@keyframes vf-slide-left-in   { from { transform: translateX(8px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
@keyframes vf-slide-left-out  { from { transform: translateX(0); opacity: 1 } to { transform: translateX(8px); opacity: 0 } }
@keyframes vf-slide-right-in  { from { transform: translateX(-8px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
@keyframes vf-slide-right-out { from { transform: translateX(0); opacity: 1 } to { transform: translateX(-8px); opacity: 0 } }
@keyframes vf-scale-in   { from { transform: scale(0.96); opacity: 0 } to { transform: scale(1); opacity: 1 } }
@keyframes vf-scale-out  { from { transform: scale(1); opacity: 1 } to { transform: scale(0.96); opacity: 0 } }
@keyframes vf-pulse      { 0%, 100% { opacity: 0.4 } 50% { opacity: 0.8 } }
@keyframes vf-spin       { to { transform: rotate(360deg) } }
@keyframes vf-shimmer    { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }

/* drawer/sheet directional */
@keyframes vf-drawer-in-right  { from { transform: translateX(100%) } to { transform: translateX(0) } }
@keyframes vf-drawer-out-right { from { transform: translateX(0) } to { transform: translateX(100%) } }
/* ...left, top, bottom */
```

---

## Utility Classes

`src/css/utilities.css`:

```css
.vf-visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.vf-focus-ring:focus-visible {
  outline: var(--vf-focus-ring);
  outline-offset: var(--vf-focus-offset);
}

.vf-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vf-no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.vf-no-scrollbar::-webkit-scrollbar { display: none; }

.vf-uppercase { text-transform: uppercase; letter-spacing: 0.08em; }
```

---

## State Attributes

Components expose `data-*` attributes for state; CSS targets them directly.

```tsx
<div
  className="vf-popover"
  data-state={open ? "open" : "closed"}
  data-placement={placement}
  data-side={side}
/>
```

```css
.vf-popover[data-state="open"]  { animation: vf-fade-in var(--vf-duration-base) var(--vf-easing-standard); }
.vf-popover[data-state="closed"] { animation: vf-fade-out var(--vf-duration-fast) var(--vf-easing-standard); }

.vf-dropdown[data-state="open"]  { animation: vf-slide-down-in var(--vf-duration-base); }
.vf-button[data-active="true"]   { background: var(--vf-bg-4); }
.vf-nav-item[data-selected="true"] { border-inline-start: 2px solid var(--vf-text-0); }
```

This replaces JS-driven hover/focus states for all *styling* (hooks still exist for *logic*).

---

## Provider Updates

`VoidframeProvider` (Phase 1 stub → expanded here):

```tsx
export interface VoidframeProviderProps {
  theme?: VoidframeTokens;
  themeName?: "dark" | "light" | string;  // sets data-vf-theme
  density?: "comfortable" | "compact" | "spacious";
  contrast?: "normal" | "high";
  direction?: "ltr" | "rtl";
  cssBaseline?: boolean;                   // inject reset
  container?: HTMLElement;                 // scoped root
  children: ReactNode;
}
```

It renders:

```tsx
<div
  ref={rootRef}
  className="vf-root"
  data-vf-theme={themeName}
  data-vf-density={density}
  data-vf-contrast={contrast}
  dir={direction}
>
  {cssBaseline && <VoidframeBaseline />}
  {children}
</div>
```

When `theme` is a runtime override (not a named theme), it injects a `<style>` tag with custom property overrides scoped to the root.

---

## Migration Checklist (for each existing component)

1. Create CSS file `src/css/components/[name].css`.
2. Replace inline `style={{ ... }}` with `className={cx(...)}`.
3. Preserve the `style` prop as escape hatch — pass it through, don't drop it.
4. Convert `useHover`/`useFocus` styling uses to CSS `:hover` / `:focus-visible`; keep the hooks for *logic* (e.g. showing a tooltip on hover).
5. Add `data-state` / `data-*` attributes where the component has state worth CSS-targeting.
6. Test: screenshot before, screenshot after, diff.

**Order of migration:** smallest first. Start with `Text`, `Label`, `Divider`, `Spacer`. Then `Badge`, `Dots`, `Kbd`, `Tag`. Then `Button`, `Input`. Work up to complex ones (`Table`, `Modal`, `DataGrid` comes in Phase 09).

---

## Responsive Utility (Phase 16 elaborates)

CSS media queries for common breakpoints, consumable via class modifiers:

```css
@media (min-width: 640px)  { .vf-sm\:hidden { display: none !important; } }
@media (max-width: 639px)  { .vf-hide-below-sm { display: none !important; } }
/* ... */
```

Paired with the `<Show>` / `<Hide>` components defined in Phase 16.

---

## Acceptance Criteria

- [ ] Every existing component has a CSS file.
- [ ] Zero inline `style={{ color, background, ... }}` in component source — only `--vf-*` custom property overrides.
- [ ] `dist/styles.css` is emitted by the build and importable as `"voidframe/styles.css"`.
- [ ] Per-component CSS imports work: `"voidframe/styles/button.css"`.
- [ ] `cx()` is exported.
- [ ] Pixel-perfect parity with pre-migration demo (screenshot comparison).
- [ ] `:focus-visible` outlines work; hover states are CSS-driven.
- [ ] Theme switching works by toggling `data-vf-theme` on the root.
- [ ] Density switching works by toggling `data-vf-density`.
- [ ] SSR: no hydration warnings; styles apply pre-hydration.
- [ ] `prefers-reduced-motion` zeroes motion tokens.
- [ ] Reset is opt-in via `cssBaseline` prop.

## Notes

- **Don't use `!important`** except in utility classes (where it's documented).
- **Logical properties** (`margin-inline-start`, `padding-block`) over physical ones (`margin-left`, `padding-top`) — prepares for RTL in Phase 17.
- **Don't nest more than one level.** CSS for Voidframe is flat and obvious. No BEM double-underscores; modifier pattern only.
- **Keep specificity low.** `.vf-button` is the ceiling for component selectors. Modifiers share specificity. State attributes are attribute selectors (slightly higher specificity, intentional).
- **Source order matters** in the bundled `styles.css` — tokens → reset → keyframes → base → utilities → components. Enforce in `index.css` imports.
