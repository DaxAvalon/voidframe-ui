# 20 — Performance

**Goal:** Fast by default. Core bundle under 50KB gzipped. Full library under 150KB. Components don't re-render unnecessarily. Large datasets perform at 60fps.

**Depends on:** all prior phases.
**Effort:** 2-3 days (initial pass) + ongoing.

## Bundle Budget

| Bundle | Budget | Measure |
|---|---|---|
| Core (tokens + provider + utilities + hooks) | <15KB gzipped | |
| Per-component entry (e.g. `voidframe/button`) | <3KB gzipped | |
| Full library | <150KB gzipped | |
| CSS | <25KB gzipped | |
| Icons (full set) | <15KB gzipped (with sprite) | |

Set up `rollup-plugin-visualizer` to inspect bundle composition; add `size-limit` to enforce budgets in CI.

```json
// package.json
"size-limit": [
  { "path": "dist/voidframe.es.js", "limit": "150 KB" },
  { "path": "dist/styles.css", "limit": "25 KB" }
]
```

## Tree-Shaking

- Named exports only.
- No side-effect imports except `*.css`.
- `"sideEffects": ["*.css"]` in package.json.
- Per-component entry points: `"./button": "./dist/components/Button.js"`.
- Lazy-loadable components documented (`React.lazy(() => import("voidframe/modal"))`).

Verify with a test consumer: importing one component should result in that component + deps only.

## Memoization

### Leaf components

Wrap leaf components with `memo`:

```tsx
export const Button = memo(forwardRef<HTMLButtonElement, ButtonProps>(...));
```

Applies to: Button, IconButton, Badge, Tag, Label, Divider, Spacer, Text, Heading, Kbd, Spinner, Skeleton, Stat, Icon, Avatar, etc.

### Compound components

`memo` the standalone exports; parent compound contexts are usually cheap.

### Tables / DataGrid

`memo` row components. Compare rows by reference (`shallow`) or key. Virtualization is mandatory for 100+ rows (delegate to VirtualList).

### Context splitting

If `VoidframeContext` updates cause tree-wide re-renders, split:

- `ThemeContext` (rarely changes) — tokens, locale, direction.
- `TransientContext` (frequently changes) — toast queue, modal stack.

## Stable Callbacks

Every hook that accepts a callback stores it in a ref to avoid re-subscribing on every render:

```tsx
function useClickOutside(ref, handler) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  useEffect(() => {
    const listener = (e: Event) => handlerRef.current(e);
    document.addEventListener("click", listener);
    return () => document.removeEventListener("click", listener);
  }, []);
}
```

Audit: every hook in `src/hooks/` must follow this pattern for callbacks.

## React 18 Features

### `useTransition` for async UI updates

Filtering large lists (DataGrid search, Combobox):

```tsx
const [isPending, startTransition] = useTransition();
const handleSearch = (q: string) => {
  startTransition(() => setQuery(q));
};
```

### `useDeferredValue`

For typed input → filtered list:

```tsx
const deferredQuery = useDeferredValue(query);
const results = useMemo(() => items.filter(matchesQuery(deferredQuery)), [items, deferredQuery]);
```

### `useSyncExternalStore`

For hooks that subscribe to browser state (localStorage, window size, media queries). Ensures tear-free reads in concurrent mode.

## Virtualization

- `VirtualList` (Phase 09) — for any list ≥100 items.
- DataGrid — virtualized rows by default.
- TreeView — virtualized for ≥500 nodes.
- MessageList (chat) — virtualized for ≥100 messages.
- Combobox / MultiSelect dropdown — virtualize options ≥100.

Implementation: intersection-observer-based visibility windowing; scroll-top-based for fixed-height.

## CSS Performance

- **`contain: layout paint`** on overlay contents.
- **`content-visibility: auto`** on virtualized-list items (browser skips rendering off-screen items).
- **`will-change: transform`** only on elements that animate frequently (not broadcast globally).
- **Animate transform + opacity only.** Layout properties (width, top) cause reflow.

## Image / Media

- `<Image>` uses native `loading="lazy"` + IntersectionObserver fallback.
- Blur-up placeholder reduces layout shift.
- Video/audio default to `preload="metadata"` (not full file).

## Icon Performance

- Per-icon tree-shaking verified.
- Sprite build for apps using 10+ icons.
- Icons are inline SVGs (no HTTP request per icon).

## Initial Render

- Provider initializes synchronously — no suspension on mount.
- Theme CSS injection happens in a single `<style>` tag (not per-theme var).
- No JSX work during module load — defer to component first render.

## Hydration

- `<HydrationBoundary>` (Phase 18) for deferring heavy client components.
- Theme script pre-hydration to avoid FOUC.

## Animation Performance

- 60fps target on mid-range hardware (Pixel 4a, MacBook Air 2020).
- Profile with DevTools flame chart.
- Reduced motion zeroes most animation; still verify timing-critical paths.

## Network

- No network requests from Voidframe itself.
- Fonts: we don't bundle fonts. Consumers load their own mono font or rely on Courier New (system).

## Profiling

Set up a `scripts/profile.ts` that runs a benchmark harness:
- Renders a DataGrid with 10k rows.
- Types into a Combobox with 1k options.
- Opens/closes a Modal 50 times.
- Scrolls a LogViewer with 10k lines.

Report FPS, render count, allocation. Use as regression benchmark.

## Dev Warnings in Production

All `warn()` and `warnOnce()` calls guarded by `process.env.NODE_ENV !== "production"`. Production builds drop them entirely via DCE.

Verify: production bundle grep'd for `voidframe` warning strings should return empty.

## Lazy-Load Patterns

Document and ship lazy wrappers for heavy components:

```tsx
// src/lazy.ts
export const LazyModal = lazy(() => import("./components/Modal").then(m => ({ default: m.Modal })));
export const LazyDataGrid = lazy(() => import("./components/DataGrid").then(m => ({ default: m.DataGrid })));
export const LazyCodeEditor = lazy(() => ...);
export const LazyRichTextEditor = lazy(() => ...);
export const LazyDatePicker = lazy(() => ...);
```

Consumer pattern:

```tsx
import { LazyModal } from "voidframe/lazy";
<Suspense fallback={null}>
  <LazyModal open={open}>...</LazyModal>
</Suspense>
```

## Peer-Dep Strategy

Heavy deps are peer-optional:

- CodeEditor → consumer picks shiki / prismjs / monaco.
- RichTextEditor → consumer picks lexical / tiptap.
- PhoneInput → consumer picks libphonenumber-js.

This keeps core bundle lean.

## Continuous Monitoring

- `size-limit` in CI on every PR — fails if budget breached.
- Bundle visualizer artifact uploaded to PR.
- Performance regression tests (optional) — benchmark key flows and fail on 20% regression.

---

## Acceptance Criteria

- [ ] Core bundle <50KB gzipped.
- [ ] Full library <150KB gzipped.
- [ ] Per-component imports work; tree-shaking verified.
- [ ] All leaf components memoized.
- [ ] DataGrid renders 10k rows at 60fps.
- [ ] Combobox filters 1k options without lag.
- [ ] MessageList virtualizes long histories.
- [ ] No dev warnings in production bundle.
- [ ] `size-limit` enforced in CI.
- [ ] Bundle visualizer published per release.

## Notes

- **Premature optimization** — don't `memo` everything upfront. Profile first. `memo` has its own overhead.
- **Bundle size is a feature.** Every KB ships to every consumer. Resist bloat.
- **Real devices over benchmarks.** Test on actual low-end hardware.
