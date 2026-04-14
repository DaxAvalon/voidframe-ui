# 16 — Responsive System

**Goal:** Components adapt to viewport size cleanly. A `Responsive<T>` prop pattern, container queries, `<Show>` / `<Hide>` components, and a breakpoint token system.

**Depends on:** 04 CSS, 02 architecture.
**Effort:** 1-2 days.

## Breakpoint Tokens

```ts
breakpoints: {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
}
```

Exposed as:
- CSS custom properties: `--vf-bp-sm` etc.
- TS types: `Breakpoint = "base" | "sm" | "md" | "lg" | "xl" | "xxl"`.

## `Responsive<T>` Type

```ts
export type Responsive<T> =
  | T
  | Partial<Record<Breakpoint, T>>;
```

Components accept responsive values:

```tsx
<Grid columns={{ base: 1, md: 2, lg: 3 }} />
<Flex direction={{ base: "column", md: "row" }} />
<Container maxWidth={{ base: "100%", lg: "1200px" }} />
<Text size={{ base: "sm", lg: "md" }} />
```

## Resolution Strategy

Two paths, pick per-component:

### Path A — CSS media queries (preferred)

Generate CSS class modifiers for each breakpoint. The component emits `data-*` attrs or class names; CSS handles the rest.

```tsx
// Grid example
<div
  className="vf-grid"
  data-columns-base="1"
  data-columns-md="2"
  data-columns-lg="3"
  style={{ "--vf-grid-columns": "1" } as CSSProperties}
/>
```

```css
.vf-grid { grid-template-columns: repeat(var(--vf-grid-columns), minmax(0, 1fr)); }

@media (min-width: 768px) {
  .vf-grid[data-columns-md="2"] { --vf-grid-columns: 2; }
  .vf-grid[data-columns-md="3"] { --vf-grid-columns: 3; }
}
@media (min-width: 1024px) {
  .vf-grid[data-columns-lg="3"] { --vf-grid-columns: 3; }
}
```

### Path B — JS resolution via `useResponsive`

For components where CSS generation would be combinatorially explosive (e.g., Text `size` taking 8 values × 6 breakpoints = 48 classes):

```tsx
export function useResponsive<T>(value: Responsive<T>): T {
  const sm = useMediaQuery(`(min-width: ${bpSm}px)`);
  const md = useMediaQuery(`(min-width: ${bpMd}px)`);
  const lg = useMediaQuery(`(min-width: ${bpLg}px)`);
  const xl = useMediaQuery(`(min-width: ${bpXl}px)`);
  const xxl = useMediaQuery(`(min-width: ${bpXxl}px)`);

  if (typeof value !== "object" || value === null) return value as T;
  const v = value as Partial<Record<Breakpoint, T>>;
  if (xxl && v.xxl !== undefined) return v.xxl!;
  if (xl && v.xl !== undefined) return v.xl!;
  if (lg && v.lg !== undefined) return v.lg!;
  if (md && v.md !== undefined) return v.md!;
  if (sm && v.sm !== undefined) return v.sm!;
  return v.base!;
}
```

Caveat: JS-resolved responsive values cause a hydration flash on SSR. Prefer CSS path where possible.

## SSR Considerations

The JS path can't know the viewport during SSR. Strategies:

1. **Default to `base`** on server render; let client re-resolve. Causes flash but layout-stable.
2. **Serve first-render CSS-only values** (via class-generation path) and use JS only for dynamic updates.
3. **Use `ua-parser-js`** to guess device class server-side for SSR (advanced, optional).

Voidframe's default: **CSS-first for common layout props, JS fallback only where necessary.**

## `<Show>` / `<Hide>` Components

```tsx
<Show above="md">Desktop content</Show>
<Show below="md">Mobile content</Show>
<Show between={["sm", "lg"]}>Tablet-ish</Show>
<Hide above="lg">Hide on big screens</Hide>
```

CSS-based (to avoid SSR flash):

```tsx
<div className="vf-show vf-show--above-md">...</div>
```

```css
.vf-show--above-md { display: none; }
@media (min-width: 768px) { .vf-show--above-md { display: contents; } }
.vf-show--below-md { display: contents; }
@media (min-width: 768px) { .vf-show--below-md { display: none; } }
```

- `display: contents` preserves subtree layout without introducing a wrapper.
- Alternative: JS-based `<Show>` that doesn't render at all — but can cause hydration issues.

---

## Container Queries

Where viewport is the wrong answer (a card that has to adapt based on its own width, not the page), use container queries:

```tsx
<Card container>
  <ResponsiveCardContent />
</Card>
```

```css
.vf-card[data-container] { container-type: inline-size; }

@container (min-width: 300px) {
  .vf-card__grid { grid-template-columns: 1fr 1fr; }
}
```

- Container query support is now >90%; polyfill available for older browsers.
- Components: `<Card>`, `<ScrollArea>`, `<ResizablePanel>`, any contained layout.

Hook: `useContainerQuery<T>(ref, queries)`:

```tsx
const state = useContainerQuery(ref, {
  small: "(max-width: 300px)",
  medium: "(min-width: 301px) and (max-width: 600px)",
  large: "(min-width: 601px)",
});
// state: "small" | "medium" | "large"
```

---

## Device Class Detection

```tsx
const device = useDeviceType();  // "mobile" | "tablet" | "desktop"
```

- `mobile`: below `md`.
- `tablet`: `md` to below `lg`.
- `desktop`: `lg` and above.

For coarser branching when responsive props get unwieldy.

---

## Adaptive Components

Some components adapt **behavior** (not just layout) at smaller sizes:

- `Drawer` → becomes `Sheet` on mobile.
- `Modal` → full-screen on mobile.
- `Sidebar` → collapses to drawer on mobile.
- `Tabs` → horizontal scroll or "More" menu when overflowing.
- `DataGrid` → card list on mobile.
- `Table` → stacked rows on mobile (label above value per cell).

Pattern: component accepts an `adaptive?: boolean` prop (default true) that triggers responsive behavior. Override with `adaptive={false}` to opt out.

---

## Typography Responsive Defaults

`<Text>` and `<Heading>` can accept a size that scales by default:

```tsx
<Heading size="responsive-xl">
// equivalent to
<Heading size={{ base: "lg", md: "xl", xl: "xxl" }}>
```

A preset map of "responsive-*" sizes keeps consumer code clean.

---

## Spacing Responsive

Shorthand style props on Box/Flex/Grid accept responsive:

```tsx
<Box p={{ base: 2, md: 4, lg: 6 }}>
```

---

## Acceptance Criteria

- [ ] `Responsive<T>` type exported.
- [ ] Breakpoint tokens in `VoidframeTokens`.
- [ ] `useResponsive`, `useContainerQuery`, `useDeviceType` hooks.
- [ ] `<Show>` / `<Hide>` components work without SSR flash.
- [ ] Grid, Flex, Container, Text accept responsive props.
- [ ] Drawer/Modal/Sidebar adapt to mobile automatically.
- [ ] Container query polyfill documented for older browsers.
- [ ] Demo includes a responsive layout showcase.

## Notes

- **Mobile is not the center of gravity.** Voidframe is desktop-first but responsive-correct. Don't over-invest in mobile-only patterns.
- **CSS > JS** for responsive resolution. Only reach for JS when CSS combinatorics explode.
- **Container queries are the future.** Use them aggressively in new components; viewport media queries only where layout truly depends on viewport.
