# Agent A — Component API + A11y review

> 15 findings. Strongest: Input/Textarea onChange is inconsistent with
> the rest of the form surface, `asChild` triggers clobber user
> `onClick`, Spotlight advertises `aria-modal` without a focus trap,
> duplicate Drawer/Popover implementations, Combobox `useEffect` sync
> anti-pattern, no component honors `prefers-reduced-motion` at the JS
> layer, `Chat.tsx` is a 1050-LOC monolith with duplicate alias
> exports.

## Findings

### 1. Inconsistent onChange signatures across primitive inputs
**Severity:** high
**Evidence:** `src/components/Form.tsx:38,89` — `onChange?: (e: ChangeEvent<HTMLInputElement>) => void` for `Input`/`Textarea`, but every other editor (`MarkdownEditor.tsx:49`, `CodeEditor.tsx:31`, `ChatComposer.tsx:54`, `MaskedInput.tsx:101`, `MentionInput.tsx:87`, `Combobox.tsx:55`, `FormExtended.tsx:126`) emits a bare value.
**Problem:** Consumers can't swap Input for Textarea/Combobox/Masked without rewriting the handler; the two "native wrappers" are the only outliers in a ~30-component emit-value convention.
**Fix:** Change Input/Textarea to emit `(value: string, e?) => void` (or add `onValueChange`) and thread through `useControllableState` like Combobox does.

### 2. Input/Textarea lack controlled+uncontrolled parity
**Severity:** high
**Evidence:** `src/components/Form.tsx:36-79` — no `defaultValue` in `InputProps`; no `useControllableState`. Compare `Combobox.tsx:95-100`, `Accordion.tsx:63-83` which use the shared hook.
**Problem:** Input/Textarea rely on DOM-native uncontrolled behavior, so framework patterns like "controlled outside, uncontrolled inside" don't apply uniformly — warning helpers and controlled-prop dev-warnings are bypassed.
**Fix:** Route Input/Textarea through `useControllableState` and expose `defaultValue` in props.

### 3. asChild Trigger clobbers user onClick via late spread
**Severity:** high
**Evidence:** `src/components/Dialog.tsx:136-143`, `DrawerCompound.tsx:100-107`, `Popovers.tsx:108-115,489-494` — cloneElement order is `{ onClick: handle, ...props }`, so a user-supplied onClick in `...props` overwrites the toggle handler.
**Problem:** `<Dialog.Trigger asChild><button onClick={fn}>…` silently disables opening the dialog; user handlers also can't chain.
**Fix:** Spread `...props` first, then compose: `onClick: mergeHandlers(props.onClick, handle)`.

### 4. asChild cloneElement doesn't merge refs (Dialog, DrawerV2)
**Severity:** medium
**Evidence:** `src/components/Dialog.tsx:136`, `DrawerCompound.tsx:100` — no `ref:` in the cloneElement prop bag. `Popovers.tsx:109` does merge via `captureRef`, proving the codebase knows better.
**Problem:** Parent ref to `<Dialog.Trigger asChild>` is lost; child's own ref isn't preserved either.
**Fix:** Compose refs like `Popovers.tsx` does with a `captureRef` helper and `useMergedRefs`.

### 5. Overlay.Dropdown / Overlay.Popover are a11y-broken menu facades
**Severity:** high
**Evidence:** `src/components/Overlay.tsx:162-199` — `role="menu"` + `role="menuitem"` but no ArrowDown/ArrowUp/Home/End/Escape handling (grep for `ArrowDown` in the file = 0 hits). Trigger is a `<div onClick>`, not a button.
**Problem:** Violates WAI-ARIA menu pattern contract; trigger is keyboard-inoperable; overlaps semantically with the proper `Menu.tsx` compound.
**Fix:** Delete Overlay.Dropdown/Popover (a richer Popovers.tsx + Menu.tsx already exist) or rebuild on those primitives.

### 6. Spotlight claims aria-modal without focus trap, escape, or focus return
**Severity:** high
**Evidence:** `src/components/Spotlight.tsx:152-223` — `role="dialog"` + `aria-modal="true"`, but no `FocusScope`, no escape handler, no `restoreFocus`. Contrast with `DrawerCompound.tsx:180` and `Dialog.tsx` which use FocusScope.
**Problem:** A modal tour that doesn't trap focus, doesn't dismiss on Escape, and doesn't restore focus — screen-reader and keyboard users get stranded.
**Fix:** Wrap the card in FocusScope + DismissableLayer like Drawer/Dialog, or drop the aria-modal lie.

### 7. Two complete Drawer implementations; two Popover implementations
**Severity:** medium
**Evidence:** `src/components/Overlay.tsx:41` (`Drawer`, flat API) vs `DrawerCompound.tsx:272` (`DrawerV2`, compound). `Overlay.tsx:219` (`Popover`) vs `Popovers.tsx` (`PopoverV2` compound with anchoring).
**Problem:** Two public APIs for the same primitive create decision paralysis and doubled surface for bug-fixes; Overlay's versions are strictly weaker (no anchoring, no compound).
**Fix:** Deprecate `Overlay.Drawer` / `Overlay.Popover` and re-export the V2 versions under the canonical names.

### 8. Compound roots missing displayName
**Severity:** low
**Evidence:** `src/components/Dialog.tsx:69` (`DialogRoot`), `Accordion.tsx:80` (`AccordionRoot`), `DrawerCompound.tsx:63` (`DrawerRoot`), `Popovers.tsx:69` (`PopoverRoot`). All Triggers/Contents have displayName; roots never do because `Object.assign(Root, …)` doesn't attach one.
**Problem:** React DevTools shows `Unknown` / `_c` for every compound root; breaks `devWarnings.test.tsx`-style displayName assertions and snapshot testing.
**Fix:** Set `DialogRoot.displayName = "Dialog"` (etc.) before the Object.assign.

### 9. Combobox syncs derived state in useEffect
**Severity:** medium
**Evidence:** `src/components/Combobox.tsx:124-126` — `useEffect(() => setQuery(selectedOption?.label ?? …), [selectedOption, allowCustomValue, current])`.
**Problem:** Classic "reset state on prop change" anti-pattern — causes an extra render and fights user typing on every selection change.
**Fix:** Compute displayed text during render from `selectedOption`, or key the input to reset, per React docs.

### 10. Toaster region has no aria-live wrapper
**Severity:** medium
**Evidence:** `src/components/ToastSystem.tsx:247-263` — `role="region" aria-label="Notifications"` only; individual bubbles carry `role="status"`/`alert` at `:277`.
**Problem:** When toasts enter after the region is mounted, SRs often miss them because role=status on a newly-portaled node isn't always announced without an ancestor live region. Also not a landmark semantically.
**Fix:** Add `aria-live="polite"` + `aria-relevant="additions"` to the Toaster container (or split polite/assertive regions by tone).

### 11. No component honors prefers-reduced-motion at the JS layer
**Severity:** medium
**Evidence:** `src/hooks/usePrefersReducedMotion.ts` exists but `grep usePrefersReducedMotion src/components` returns 0. `Carousel.tsx:141-144` autoplays unconditionally; `Spotlight`, `Animations.tsx`, `Presence` never consult it.
**Problem:** CSS `@media (prefers-reduced-motion)` covers transitions but not JS-driven autoplay intervals, Typewriter ticks, or Marquee loops.
**Fix:** Gate autoplay/typewriter timers with `usePrefersReducedMotion()`.

### 12. Carousel autoplay effect re-registers every frame
**Severity:** low
**Evidence:** `src/components/Carousel.tsx:141-144` — deps `[autoPlay, hovered, total, interval, index, setIndex]` include `index`.
**Problem:** Every tick replaces the interval and teardowns the old one; minor perf issue, stale-closure-prone if `setIndex` changes.
**Fix:** Use functional setter `setIndex(i => i+1)` and drop `index`/`setIndex` from deps.

### 13. Chat.tsx: 15 top-level exports in one 1050-line file
**Severity:** low
**Evidence:** `src/components/Chat.tsx` — Conversation, MessageList, MessageGroup, Message, MessageContent, StreamingText, ThinkingIndicator, TypingIndicator (alias), ReasoningTrace, MessageActions (compound), MessageFeedback, ReactionBar, MessageReactions (alias), MessageEdit, and more. Also `Chat.tsx:616` `TypingIndicator = ThinkingIndicator` and `:969` `MessageReactions = ReactionBar` — duplicate names with no deprecation.
**Problem:** Impossible to tree-shake meaningfully; two names for the same component confuse consumers; file hard to navigate.
**Fix:** Split into Chat/Conversation, Chat/Message, Chat/Indicators, Chat/Reactions, Chat/Edit; drop or formally deprecate alias exports.

### 14. DashboardGrid manually merges forwardRef instead of useMergedRefs
**Severity:** low
**Evidence:** `src/components/Widget.tsx:315-320` — hand-rolled ref-forking loop when `../hooks/useMergedRefs` is used elsewhere (`Overlay.tsx:153`, `Combobox.tsx:138`).
**Problem:** Inconsistent pattern; easy to miss edge cases (cleanup on unmount, callback ref semantics).
**Fix:** Replace with `useMergedRefs(ref, canvasRef)`.

### 15. Three overlapping "menu" surfaces with unclear boundaries
**Severity:** medium
**Evidence:** `Overlay.tsx` `Dropdown` (items array, role=menu), `Menu.tsx` (compound with ContextMenu/MenuBar), `BreadcrumbMenu.tsx` (navigation), plus `MegaMenu.tsx`. Export index lists all four as independent exports.
**Problem:** Consumers can't tell which to reach for; identical behaviors get re-implemented per file (each manages its own open state, outside-click, keyboard).
**Fix:** Document: Menu = app menus, MegaMenu = nav-megamenu, BreadcrumbMenu = breadcrumb overflow; delete Overlay.Dropdown in favor of `Menu`.

> Note: `"use client"` coverage is actually solid — all 79 hook-using
> components carry the directive, so that audit item came up clean.
