# 03 — Primitives & Hooks

**Goal:** Ship the foundational primitives and hooks that every higher-level component composes from. These are the "Lego bricks" — small, focused, headless, well-tested.

**Depends on:** 01 TypeScript, 02 Architecture patterns.
**Unblocks:** all component phases.
**Effort:** 3-4 days.

## Deliverables

- **~20 primitives** covering portals, focus, dismissal, positioning, scroll, collections.
- **~60 hooks** covering state, effects, DOM observation, gestures, formatting, and a11y.
- Every primitive is **headless** (no styling) and composable.
- Every hook is typed, tested, and SSR-safe.

---

## Primitives

Primitives live in `src/primitives/`. They are headless utility components — they render behavior, not appearance. Components in Track B compose these.

### P01. `<Portal>`

Renders children into a detached DOM node via `createPortal`.

```tsx
export interface PortalProps {
  children: ReactNode;
  container?: HTMLElement | null;  // defaults to document.body
  asChild?: boolean;
}
```

- SSR-safe (renders nothing server-side; hydrates on mount).
- Supports a custom container (for modals inside a scoped root).
- Used by: Modal, Drawer, Dropdown, Popover, Tooltip, Toast, CommandPalette, ContextMenu, Sheet.

### P02. `<FocusTrap>` / `<FocusScope>`

Traps Tab and Shift+Tab within its children. Restores focus on unmount.

```tsx
export interface FocusScopeProps {
  children: ReactNode;
  trapped?: boolean;                    // true by default
  loop?: boolean;                       // wrap tab at boundaries
  autoFocus?: boolean;                  // focus first focusable on mount
  restoreFocus?: boolean;               // restore previous focus on unmount
  onMountAutoFocus?: (e: Event) => void;
  onUnmountAutoFocus?: (e: Event) => void;
}
```

- Finds all focusable descendants: `[tabindex]:not([tabindex="-1"]), button, input, textarea, select, a[href], [contenteditable="true"]`.
- Handles dynamic content (uses MutationObserver).
- Respects `inert` attribute.
- Used by: Modal, Drawer, ConfirmDialog, Sheet, CommandPalette.

### P03. `<DismissableLayer>`

Handles dismissal via Escape and outside-click.

```tsx
export interface DismissableLayerProps {
  children: ReactNode;
  disableOutsidePointerEvents?: boolean;
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
  onPointerDownOutside?: (e: PointerEvent) => void;
  onInteractOutside?: (e: Event) => void;
  onFocusOutside?: (e: FocusEvent) => void;
  onDismiss?: () => void;
}
```

- Stacks correctly with nested layers (only the topmost dismisses on Escape).
- Used by: Modal, Dropdown, Popover, Tooltip (if interactive), ContextMenu, Sheet.

### P04. `<Presence>`

Keeps a component mounted long enough to run exit animations.

```tsx
export interface PresenceProps {
  present: boolean;
  children: ReactNode;
}
```

- When `present` becomes false, stays mounted until the element's CSS `animationend` / `transitionend` fires.
- Uses `data-state="open"` / `data-state="closed"` on the child for CSS targeting.
- Used by every overlay with an exit animation.

### P05. `<Slot>` (defined in 02, implemented here)

See [02-architecture-patterns.md §3](02-architecture-patterns.md#3-slot--aschild-pattern).

### P06. `<VisuallyHidden>`

Visually hidden, screen-reader accessible.

```tsx
export const visuallyHiddenStyle = {
  position: "absolute",
  width: 1, height: 1,
  padding: 0, margin: -1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;

export const VisuallyHidden = forwardRef<HTMLSpanElement, BaseProps>(/* ... */);
```

- Used for icon-only buttons, form labels, live regions.

### P07. `<LiveRegion>`

Announces dynamic content to screen readers.

```tsx
export interface LiveRegionProps {
  message: string;
  politeness?: "polite" | "assertive";
  clearAfter?: number;  // ms
}
```

- Wraps an `aria-live` container.
- Used by: Toast, form errors, search results, loading states.

### P08. `<FloatingElement>` / Positioning engine

Positions an element relative to an anchor, handling collision detection and flipping.

```tsx
export interface FloatingProps {
  anchor: RefObject<HTMLElement> | HTMLElement;
  placement?: Placement;  // 'bottom-start', 'top-end', etc.
  offset?: number;
  flip?: boolean;
  shift?: boolean;        // slide along axis to stay in viewport
  arrow?: boolean;
  strategy?: "fixed" | "absolute";
  children: ReactNode | ((state: FloatingState) => ReactNode);
}
```

- Wraps `@floating-ui/react` or rolls our own thin implementation.
- **Recommendation:** depend on `@floating-ui/react-dom` (stable, small, battle-tested).
- Used by: Dropdown, Popover, Tooltip, HoverCard, ContextMenu, Menu, Combobox.

### P09. `<ScrollLock>`

Prevents body scroll when an overlay is open.

```tsx
export interface ScrollLockProps {
  enabled?: boolean;
  allowScroll?: RefObject<HTMLElement>;  // allow scroll inside this element
}
```

- Detects scrollbar width and compensates (no layout shift).
- Handles iOS Safari touch scroll quirks.
- Used by: Modal, Drawer, Sheet.

### P10. `<Collection>`

Abstraction for components that manage lists of items (Menu, Listbox, Tabs, Accordion).

```tsx
// Internal pattern, not user-facing
const [Collection, useCollection, useCollectionItem] = createCollection<MenuItemData>();
```

- Tracks registered items via refs for keyboard navigation.
- Exposes `useCollection()` to get ordered list, `useCollectionItem(data)` to register.

### P11. `<RovingFocusGroup>`

Arrow-key navigation through a group of focusable children. Only one child has `tabindex=0` at a time.

```tsx
export interface RovingFocusGroupProps {
  orientation?: Orientation;
  loop?: boolean;
  dir?: "ltr" | "rtl";
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}
```

- Used by: Tabs, RadioGroup, Menu, Toolbar, Dropdown, Stepper.

### P12. `<Field>` (form field composition)

Headless primitive for label + input + help + error composition.

```tsx
<Field>
  <Field.Label>Email</Field.Label>
  <Field.Control>
    <Input type="email" />
  </Field.Control>
  <Field.Help>We'll never share your email.</Field.Help>
  <Field.Error>Required</Field.Error>
</Field>
```

- Wires up `htmlFor`, `aria-describedby`, `aria-invalid`, `aria-required` automatically via context.
- Used by: every form in the library.

### P13. `<Collapsible>` (primitive — existing Collapsible becomes a styled consumer)

Headless collapse primitive with animated height.

```tsx
<Collapsible open={open} onOpenChange={setOpen}>
  <Collapsible.Trigger>Toggle</Collapsible.Trigger>
  <Collapsible.Content>Content</Collapsible.Content>
</Collapsible>
```

- Measures content height, animates max-height.
- Handles dynamic content height changes.

### P14. `<ToggleGroup>` (primitive)

Controls a group of toggle buttons — single or multiple selection.

```tsx
<ToggleGroup type="single" value={view} onValueChange={setView}>
  <ToggleGroup.Item value="grid">Grid</ToggleGroup.Item>
  <ToggleGroup.Item value="list">List</ToggleGroup.Item>
</ToggleGroup>
```

- Wraps RovingFocusGroup + roles/aria.
- Used by: view switchers, filter pills, toolbars.

### P15. `<Separator>`

Headless horizontal or vertical separator with correct ARIA.

```tsx
<Separator orientation="horizontal" decorative={false} />
```

- Renders `<hr>` or `role="separator"` with `aria-orientation`.
- `decorative` toggles semantic vs purely visual.

### P16. `<AspectRatio>`

Maintains aspect ratio for children.

```tsx
<AspectRatio ratio={16 / 9}>
  <img src="..." />
</AspectRatio>
```

### P17. `<AccessibleIcon>`

Wraps an SVG/icon with an `aria-label` and hides the visual element from AT.

```tsx
<AccessibleIcon label="Close">
  <XIcon />
</AccessibleIcon>
```

### P18. `<ErrorBoundary>`

Class component wrapping `componentDidCatch`. Functional fallback option.

```tsx
<ErrorBoundary fallback={(error, reset) => <ErrorState onRetry={reset} />}>
  {children}
</ErrorBoundary>
```

- Included for completeness (mentioned in Phase 05 components in original plan).

### P19. `<Teleport>` (advanced)

Like Portal but targeted at a named registry location (useful for slot composition across deep trees). Optional.

### P20. `<Observer>` primitives

Small wrappers that expose observer behavior declaratively:
- `<IntersectionObserver>` — child receives `visible: boolean`.
- `<ResizeObserver>` — child receives `size: { width, height }`.
- `<MutationObserver>` — children re-render on mutation.

Used by internal components; not heavily promoted as user API (hooks are preferred).

---

## Hooks

Hooks live in `src/hooks/` and are each in their own file plus barrel-exported.

### State hooks

- `useToggle(initial?: boolean)` — `[value, toggle, setValue]`
- `useControllableState<T>({ value, defaultValue, onChange })` — controlled/uncontrolled duality
- `useLocalStorage<T>(key, initial, options?)` — sync state with localStorage (with `storage` event listener)
- `useSessionStorage<T>(key, initial)` — sync with sessionStorage
- `useCookie(name, initial?, options?)` — cookie-backed state
- `useMap<K, V>(initial?)` — reactive Map
- `useSet<T>(initial?)` — reactive Set
- `useArray<T>(initial?)` — with push, remove, clear, replace helpers
- `useQueue<T>(initial?)` — FIFO
- `useStack<T>(initial?)` — LIFO
- `usePrevious<T>(value)` — returns value from previous render
- `useForceUpdate()` — returns a stable `() => void` that triggers re-render
- `useCounter(initial?, { min?, max?, step? })` — `[count, { inc, dec, reset, set }]`
- `useHistory<T>(initial)` — undo/redo stack with `{ state, set, undo, redo, canUndo, canRedo }`

### Timing hooks

- `useDebounce<T>(value, delay)` — debounced value
- `useDebouncedCallback<F>(fn, delay)` — debounced function
- `useThrottle<T>(value, interval)` — throttled value
- `useThrottledCallback<F>(fn, interval)` — throttled function
- `useInterval(callback, delay | null)` — setInterval with clean cancellation
- `useTimeout(callback, delay | null)` — setTimeout
- `useCountdown(target, { onComplete? })` — countdown timer
- `useStopwatch({ autoStart?: boolean })` — elapsed time
- `useRafInterval(callback, ms)` — interval via requestAnimationFrame
- `useIdle(timeout)` — `true` when user has been idle `timeout` ms

### DOM observation

- `useResizeObserver<T>(ref)` — `{ width, height }`
- `useIntersectionObserver<T>(ref, options?)` — `{ isIntersecting, entry }`
- `useMutationObserver<T>(ref, callback, options?)`
- `useWindowSize()` — `{ width, height }`
- `useScrollPosition()` — `{ x, y }`
- `useScrollDirection()` — `'up' | 'down' | null`
- `useElementSize<T>(ref)` — pinned to a specific element
- `useBoundingBox<T>(ref)` — full DOMRect reactive
- `useIsOverflowing<T>(ref)` — `{ x: boolean, y: boolean }`
- `useHover<T>(ref?)` — `[isHovered, bind]`
- `useFocus<T>()` — `[isFocused, bind]`
- `useFocusVisible()` — matches the CSS `:focus-visible` rule
- `useFocusWithin<T>(ref)` — true when any descendant is focused
- `useHasMounted()` — false on first render, true after (for SSR-conditional content)
- `usePageVisibility()` — document.visibilityState

### Interaction

- `useClickOutside<T>(ref, handler)` — click outside element
- `useEscapeKey(handler)` — Escape key handler
- `useKeyboardShortcut(keys, handler, options?)` — `keys: "mod+k" | ["g", "h"]`
- `useKeyPress(key)` — `true` while key is pressed
- `useLongPress(handler, options?)` — long-press detection with threshold
- `useDoubleClick(handler, options?)` — double-click detection
- `useGesture(handlers)` — pan/swipe/pinch (delegates to lightweight impl or `@use-gesture/react`)
- `useDrag<T>(ref, options?)` — native HTML5 drag wrapper
- `useDrop<T>(ref, handlers)` — drop target
- `useHotkeys(bindings)` — multi-binding hotkey registry

### Media/capability

- `useMediaQuery(query)` — `matchMedia` reactive
- `usePrefersReducedMotion()`
- `usePrefersColorScheme()` — `'light' | 'dark' | null`
- `usePrefersContrast()` — `'more' | 'less' | null`
- `useColorScheme()` — combines prefers-color-scheme with manual override
- `useFullscreen<T>(ref)` — `[isFullscreen, { enter, exit, toggle }]`
- `useNetworkStatus()` — `{ online, downlink?, effectiveType? }`
- `useBattery()` — battery level/charging (where supported)
- `useGeolocation(options?)` — position/error
- `useOrientation()` — device orientation
- `usePermission(name)` — `'granted' | 'denied' | 'prompt' | null`
- `useDeviceType()` — `'mobile' | 'tablet' | 'desktop'` via breakpoints
- `useClipboard()` — `{ copy, copied, text }`

### Navigation (tiny)

- `useHash()` — sync with `location.hash`
- `useQueryParam<T>(key, parse?, stringify?)` — URL search param
- `usePathname()` — `location.pathname` reactive

### Utility

- `useMergedRefs<T>(...refs)` — see 02
- `useId(providedId?, prefix?)` — see 02
- `useIsomorphicLayoutEffect` — see 02
- `useEvent<F>(fn)` — stable callback ref that always sees latest closure (RFC useEvent)
- `useUpdateEffect(effect, deps)` — effect that skips first render
- `useMountEffect(effect)` — effect that runs only once
- `useUnmountEffect(effect)` — cleanup-only effect
- `useDeepCompareEffect(effect, deps)` — effect with deep equality on deps
- `useAsync<T>(fn, deps)` — `{ data, error, loading, run }`
- `useAsyncCallback<T, A>(fn)` — wraps an async fn with status
- `useLazyRef<T>(initializer)` — `useRef` with lazy initialization

### Form-specific

- `useField(name, options?)` — returns `{ value, onChange, error, touched, dirty }`
- `useFieldArray(name)` — array helpers for form arrays
- `useForm<T>({ defaultValues, onSubmit, validate? })` — lightweight form handler
- `useMaskedInput(mask)` — input masking

### A11y-specific

- `useRovingTabIndex<T>(items, options?)` — manages tabindex rotation
- `useListNavigation<T>(items, { loop?, orientation? })` — arrow-key navigation
- `useAnnouncer()` — `announce(message, politeness?)` for live region
- `useFocusReturn(enabled?)` — save/restore focus on mount/unmount

---

## Hook Rules

1. **SSR-safe**: hooks that access `window`/`document` check with `typeof window !== "undefined"`, or use `useHasMounted`.
2. **Stable refs**: any callback passed as an arg is stored in a ref to avoid re-subscription on every render.
3. **Cleanup**: every subscription has a cleanup. Verify with Strict Mode test.
4. **Minimal deps**: don't depend on `react-dom` except where necessary; most hooks are pure React.
5. **Named**: always named exports, never default. This enables tree-shaking.
6. **Documented**: every hook has JSDoc with example. Extracted to docs site in Phase 23.

## Primitive Rules

1. **Headless**: no inline styles except structural (position, display). No tokens. No color.
2. **Composable**: primitives nest cleanly. `<Modal>` composes `<Portal><FocusTrap><DismissableLayer><Presence>...`.
3. **`data-*` attributes** for state: `data-state="open"`, `data-disabled`, `data-orientation="vertical"` — enables CSS targeting in Phase 04.
4. **`asChild` supported** where it makes sense (most primitives).
5. **Accessible by default**: correct roles, aria attrs, keyboard behavior, baked in.

## File Layout

```
src/
├── primitives/
│   ├── index.ts
│   ├── Portal.tsx
│   ├── FocusScope.tsx
│   ├── DismissableLayer.tsx
│   ├── Presence.tsx
│   ├── Slot.tsx
│   ├── VisuallyHidden.tsx
│   ├── LiveRegion.tsx
│   ├── Floating.tsx
│   ├── ScrollLock.tsx
│   ├── Collection.tsx
│   ├── RovingFocusGroup.tsx
│   ├── Field.tsx
│   ├── Collapsible.tsx
│   ├── ToggleGroup.tsx
│   ├── Separator.tsx
│   ├── AspectRatio.tsx
│   ├── AccessibleIcon.tsx
│   ├── ErrorBoundary.tsx
│   └── Teleport.tsx
├── hooks/
│   ├── index.ts
│   ├── state/
│   ├── timing/
│   ├── dom/
│   ├── interaction/
│   ├── media/
│   ├── navigation/
│   ├── utility/
│   ├── form/
│   └── a11y/
```

## Acceptance Criteria

- [ ] All 20 primitives implemented, exported from `src/primitives/index.ts`.
- [ ] All ~60 hooks implemented, organized into subfolders, exported from `src/hooks/index.ts`.
- [ ] Every primitive has a unit test covering its core behavior.
- [ ] Every hook has a unit test (`renderHook` from RTL).
- [ ] `<Modal>` is re-implemented in Phase 10 as a composition of Portal + FocusScope + DismissableLayer + Presence — demonstrating the primitive layer works.
- [ ] `@floating-ui/react-dom` added as a peer dep (or dep, if <5KB gzipped).
- [ ] SSR smoke test: render all primitives/hooks in a Node environment without errors.

## Notes

- **Don't reinvent @floating-ui.** It's battle-tested, small, and tree-shakable. Voidframe's positioning wraps it.
- **Don't reinvent focus management.** Our `FocusScope` borrows patterns directly from Radix's implementation.
- **Hooks without cleanup are leaks.** Every effect must return a cleanup if it subscribes to anything.
- **Avoid transient state in primitives.** If a primitive holds state that affects rendering, expose it via prop or context — don't hide it.
