# Audit 28 — Performance

## Medium

1. **DataGrid O(n²) column ordering** — `src/components/DataGrid.tsx:296` — `order.includes(col.key)` inside a loop over columns is O(n) per column. Fix: convert `order` to a Set.

2. **DataGrid reorder indexOf** — `src/components/DataGrid.tsx:328-329` — `next.indexOf(from)` and `next.indexOf(to)` are linear searches per drag operation. Low frequency but avoidable.

## Low

3. **Icon spread export** — `src/icons/index.ts:16` — `export * from "./set"` re-exports ~50+ icons. Consumers importing 1-2 icons get the entire set bundled. Consider tree-shakeable icon registry.

## Verified Excellent

- **Bundle size**: Properly configured with size-limit budgets (170KB core, 40KB charts, 10KB dev, 40KB CSS, 400KB total)
- **Tree-shaking**: Barrel files use named re-exports, `sideEffects: ["*.css"]` correct
- **React patterns**: Context values properly memoized (VoidframeProvider, Accordion, DataGrid). useCallback used appropriately. No missing deps in useEffect.
- **Virtualization**: Binary search for start index O(log n), overscan buffer, ResizeObserver integration. Properly integrated in DataGrid.
- **CSS performance**: `contain: layout paint` on overlays, opt-in `content-visibility: auto`, proper `contain-intrinsic-size`
- **Lazy loading**: 15+ heavy components code-split via React.lazy (overlays, data grids, editors, charts, media)
- **Charts**: useMemo for expensive computations, SVG rendering efficient for ~2000 points
- **Context overhead**: 25 createContext calls, all well-managed with memoized values
