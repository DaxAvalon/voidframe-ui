# 06 — Animation System

**Goal:** Enter/exit animations for overlays, micro-interactions, and a composable `<Transition>` primitive — without depending on Framer Motion.

**Depends on:** 03 Primitives (Presence), 04 CSS (keyframes).
**Unblocks:** every overlay component.
**Effort:** 1-2 days.

## Design

Voidframe's animation system is **CSS-driven with JS orchestration**. Keyframes and transitions live in CSS; React controls *when* to apply them by toggling `data-state` attributes and managing mount/unmount timing via the `<Presence>` primitive.

No Framer Motion dependency. ~1KB total overhead.

### Layers

1. **CSS keyframes** (Phase 04) — raw motion.
2. **`data-state` attribute** on components — indicates `open` / `closed` / `entering` / `exiting`.
3. **`<Presence>` primitive** (Phase 03) — keeps element mounted through exit animation.
4. **`<Transition>` component** — higher-level wrapper with props for simple cases.
5. **`prefers-reduced-motion`** — zeroes durations automatically (Phase 04).

---

## `<Presence>` Recap

```tsx
<Presence present={open}>
  <div data-state={open ? "open" : "closed"} className="vf-modal__content">
    ...
  </div>
</Presence>
```

When `open` → `true`: mounts immediately.
When `open` → `false`: keeps mounted, sets `data-state="closed"`, waits for `animationend` / `transitionend`, then unmounts.

CSS:

```css
.vf-modal__content[data-state="open"]  { animation: vf-scale-in  var(--vf-duration-base) var(--vf-easing-standard); }
.vf-modal__content[data-state="closed"] { animation: vf-scale-out var(--vf-duration-fast) var(--vf-easing-standard); }
```

This is the **default pattern** for every overlay.

---

## `<Transition>` Component

Higher-level API for simpler cases where you don't want to write the CSS manually.

```tsx
export interface TransitionProps {
  show: boolean;
  children: ReactNode | ((state: TransitionState) => ReactNode);
  appear?: boolean;                  // animate on first mount too
  enter?: string;                    // CSS animation name
  enterDuration?: number;            // ms; overrides CSS
  exit?: string;
  exitDuration?: number;
  onEnter?: () => void;
  onEntered?: () => void;
  onExit?: () => void;
  onExited?: () => void;
  asChild?: boolean;
  unmountOnExit?: boolean;           // default true
}

type TransitionState = "entering" | "entered" | "exiting" | "exited";
```

### Usage

```tsx
<Transition show={visible} enter="vf-fade-in" exit="vf-fade-out">
  <div>Contents</div>
</Transition>

<Transition show={visible} asChild>
  <Card>Contents</Card>
</Transition>
```

Internally composes `<Presence>` + applies `data-state` + injects inline `animationName` when `enter` / `exit` are passed.

---

## Animation Tokens (from Phase 04)

| Token | Value | Use |
|---|---|---|
| `--vf-duration-fast` | 100ms | Hover, micro |
| `--vf-duration-base` | 150ms | Enter |
| `--vf-duration-slow` | 250ms | Complex enter (drawer, large panels) |
| `--vf-easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default |
| `--vf-easing-emphasized` | `cubic-bezier(0.3, 0, 0, 1)` | Entrance of hero elements |

Exit durations are typically **shorter** than enter (close fast, open elegantly).

---

## Per-Component Application

### Modal

```css
.vf-modal__overlay[data-state="open"]  { animation: vf-fade-in var(--vf-duration-base); }
.vf-modal__overlay[data-state="closed"] { animation: vf-fade-out var(--vf-duration-fast); }

.vf-modal__content[data-state="open"]  { animation: vf-scale-in var(--vf-duration-base) var(--vf-easing-emphasized); }
.vf-modal__content[data-state="closed"] { animation: vf-scale-out var(--vf-duration-fast); }
```

### Drawer / Sheet

Directional slide based on `side` prop:

```css
.vf-drawer[data-side="right"][data-state="open"]  { animation: vf-drawer-in-right  var(--vf-duration-slow); }
.vf-drawer[data-side="right"][data-state="closed"] { animation: vf-drawer-out-right var(--vf-duration-base); }
.vf-drawer[data-side="left"][data-state="open"]   { animation: vf-drawer-in-left   var(--vf-duration-slow); }
/* etc. */
```

### Dropdown / Popover / Menu

Origin-aware scale + fade:

```css
.vf-popover[data-state="open"][data-side="bottom"]  { animation: vf-slide-down-in var(--vf-duration-base); transform-origin: top; }
.vf-popover[data-state="open"][data-side="top"]     { animation: vf-slide-up-in var(--vf-duration-base); transform-origin: bottom; }
.vf-popover[data-state="closed"]                    { animation: vf-fade-out var(--vf-duration-fast); }
```

### Tooltip

Fast fade:

```css
.vf-tooltip[data-state="open"]   { animation: vf-fade-in var(--vf-duration-fast); }
.vf-tooltip[data-state="closed"]  { animation: vf-fade-out 0ms; }  /* instant close */
```

### Toast

Slide in from side, slide out:

```css
.vf-toast[data-state="open"][data-position="top-right"]  { animation: vf-slide-left-in var(--vf-duration-base); }
.vf-toast[data-state="closed"][data-position="top-right"] { animation: vf-slide-right-out var(--vf-duration-fast); }
```

### Collapsible / Accordion

Height animation — requires measurement because content height is variable.

Implementation uses CSS custom property for max-height, set via inline style on open/close:

```tsx
const contentRef = useRef<HTMLDivElement>(null);
const [height, setHeight] = useState(0);
useEffect(() => {
  if (contentRef.current) setHeight(contentRef.current.scrollHeight);
}, [children]);
```

```css
.vf-collapsible__content {
  overflow: hidden;
  transition: max-height var(--vf-duration-base) var(--vf-easing-standard);
}
.vf-collapsible__content[data-state="closed"] { max-height: 0; }
.vf-collapsible__content[data-state="open"]   { max-height: var(--vf-content-height); }
```

### Tabs

Panel fade on switch:

```css
.vf-tabs__panel[data-state="active"]   { animation: vf-fade-in var(--vf-duration-base); }
.vf-tabs__panel[data-state="inactive"] { display: none; }
```

### Skeleton

Existing pulse keyframe kept as-is:

```css
.vf-skeleton { animation: vf-pulse 1.5s ease-in-out infinite; }
```

### Spinner

```css
.vf-spinner { animation: vf-spin 0.8s linear infinite; }
```

### Shimmer loading (alternative to pulse)

```css
.vf-shimmer {
  background: linear-gradient(90deg, var(--vf-bg-2), var(--vf-bg-3), var(--vf-bg-2));
  background-size: 200% 100%;
  animation: vf-shimmer 1.5s ease-in-out infinite;
}
```

---

## Micro-interactions

### Button

All transitions via CSS (hover bg, border). No JS required:

```css
.vf-button {
  transition: background var(--vf-duration-fast), border-color var(--vf-duration-fast);
}
```

### Toggle (switch thumb)

```css
.vf-toggle__thumb {
  transition: transform var(--vf-duration-base) var(--vf-easing-standard);
}
.vf-toggle[aria-checked="true"] .vf-toggle__thumb { transform: translateX(var(--vf-toggle-width)); }
```

### Checkbox checkmark

Path draw animation using `stroke-dasharray`:

```css
.vf-checkbox__check {
  stroke-dasharray: 20;
  stroke-dashoffset: 20;
  transition: stroke-dashoffset var(--vf-duration-base) var(--vf-easing-standard);
}
.vf-checkbox[aria-checked="true"] .vf-checkbox__check { stroke-dashoffset: 0; }
```

### Progress bar

```css
.vf-progress__fill {
  transition: width var(--vf-duration-slow) var(--vf-easing-standard);
}
```

### NavItem / NavLink

Border slides in:

```css
.vf-nav-item {
  border-inline-start: 2px solid transparent;
  transition: border-color var(--vf-duration-fast), background var(--vf-duration-fast);
}
.vf-nav-item[data-selected="true"] { border-inline-start-color: var(--vf-text-0); }
```

---

## JS-Orchestrated Cases

A few scenarios need JS help:

### Auto-measure height (Collapsible, Accordion)

Hook: `useMeasure<T>(ref)` → `{ height, width }`. Re-measures on content change.

### Shared element / Magic move

For advanced cases (tab indicator sliding under the active tab, sidebar section header following expansion). These use `FLIP` technique (First, Last, Invert, Play): measure before state change, measure after, apply inverse transform, then animate to zero.

Helper: `<FlipAnimation>` primitive (optional, low priority — can skip for v1).

### Scroll-driven animation

For parallax or scroll-linked effects. Use CSS Scroll-Driven Animations where supported, `useScrollPosition` hook otherwise. Optional — not core.

---

## Reduced Motion

The motion tokens are zeroed globally when `prefers-reduced-motion: reduce`. This handles 95% of cases.

For edge cases (e.g. a spinner that would appear frozen), provide a `usePrefersReducedMotion()` hook:

```tsx
const reduced = usePrefersReducedMotion();
return reduced ? <span>Loading…</span> : <Spinner />;
```

Also expose a `MotionProvider` override for users who want to force-disable all motion regardless of system setting:

```tsx
<VoidframeProvider reducedMotion="always">
```

---

## Component-Level Animation Override

Any component accepts a `motion` prop to disable animation per-instance:

```tsx
<Modal motion={false}>  {/* opens/closes instantly */}
```

Default: `true`. Undocumented in most components unless it matters.

---

## Orchestration Utilities

### `useTransitionState(open: boolean, duration: number)`

Returns `"entering" | "entered" | "exiting" | "exited"`. Used internally by `<Transition>`; exposed for custom orchestration.

### `useStaggered<T>(items: T[], delay: number)`

Returns items with staggered `visible` booleans so they appear one after another. Used for list entrance animations.

---

## Exit-Before-Enter Patterns

Some transitions need the exiting element to finish before the new one enters (e.g. tab panels with directional slide).

The `<Presence>` primitive doesn't handle this cross-element case. For those scenarios:

```tsx
<AnimatePresence mode="wait">  {/* Voidframe's own, not Framer's */}
  <Transition key={activeTab} show>
    <Panel>{activeTab}</Panel>
  </Transition>
</AnimatePresence>
```

`<AnimatePresence>` waits for the previous child to fully exit before rendering the new one.

---

## Performance

- **Transform + opacity only.** Never animate `width` / `height` / `top` / `left` (layout/paint thrash). Use `scale`, `translate`, `opacity`. Exception: Collapsible (height is unavoidable).
- **`will-change`** hints sparingly. Let the browser decide in most cases; add `will-change: transform` only for elements that animate frequently.
- **`contain: layout`** on overlay contents to isolate layout calculations.
- **60fps budget** — every animation must hit 60fps on mid-range hardware. Profile with DevTools.

---

## Acceptance Criteria

- [ ] `<Transition>` component exported and works.
- [ ] `<Presence>` primitive (from Phase 03) integrated into all overlays.
- [ ] Every overlay has enter + exit animation.
- [ ] Micro-interactions on Button, Toggle, Checkbox, Progress, NavItem.
- [ ] Collapsible animates height.
- [ ] `prefers-reduced-motion` zeroes all non-essential motion.
- [ ] `motion={false}` prop disables animation per-component.
- [ ] No animation drops below 60fps in demo profiling.
- [ ] Visual regression baseline captures animated states (entering + entered frames).

## Notes

- **Don't build a general-purpose animation engine.** We're shipping a UI framework, not a motion library. If users need complex choreography, they integrate Framer Motion *on top of* Voidframe.
- **Consistency over cleverness.** All overlays use the same enter/exit pattern. Same durations. Same easings. The brutalist aesthetic demands restraint.
- **Test with real devices.** Low-end Android, old Safari. Animations that feel snappy on an M2 look choppy on a Snapdragon 660.
