# Feature-gap: Overlays (20 findings)

### 1. Dialog never engages scroll-lock
**Category:** Dialog
**Benchmark:** Radix, Headless UI, MUI all lock body scroll on open and add a gutter equal to the scrollbar width.
**Gap:** `ScrollLock` primitive exists at `src/primitives/ScrollLock.tsx` but `Dialog.Content`, `DrawerV2.Content`, `Sheet`, `Lightbox`, and `CommandPalette` never wrap with it — every open shifts page content behind the backdrop.
**Where to add:** `src/components/Dialog.tsx`, `DrawerCompound.tsx`, `Lightbox.tsx`, `CommandPalette.tsx`
**Priority:** must-have

### 2. Dialog has no size variants despite a typed union
**Category:** Dialog
**Benchmark:** Radix `maxWidth`, MUI `maxWidth="sm|md|lg|xl"`, Chakra `size`.
**Gap:** `DialogSize` is exported as `"sm" | "md" | "lg" | "xl" | "full"` and passed as a CSS modifier, but the only CSS selectors shipped are backdrop / panel — no `--sm/--md/--lg/--xl/--full` width rules exist in `overlay.css`. The prop is effectively inert.
**Where to add:** `src/css/components/overlay.css`
**Priority:** must-have

### 3. No async `useConfirm().await()` pattern documented or returned-value support
**Category:** Confirm
**Benchmark:** Mantine `openConfirmModal` returns `Promise<boolean>`; MUI `useConfirm` (material-ui-confirm).
**Gap:** `useConfirm()` resolves boolean but `onConfirm` can return `Promise<void>` and the provider doesn't await it — clicking Confirm closes immediately even if the handler throws, so error toasts appear on a closed dialog with no busy state or retry.
**Where to add:** `src/components/Dialog.tsx` (ConfirmProvider)
**Priority:** must-have

### 4. No "type to confirm" destructive variant
**Category:** Confirm
**Benchmark:** GitHub delete-repo flow, Vercel, Linear; Mantine has `confirmProps.disabled` pattern.
**Gap:** `ConfirmDialogV2` has `destructive` flag but no input-match gate, no countdown-before-enable, no Enter-to-confirm binding.
**Where to add:** `src/components/Dialog.tsx`
**Priority:** nice-to-have

### 5. No nested-dialog stack coordination beyond DismissableLayer
**Category:** Dialog
**Benchmark:** Radix stacks Dialogs correctly; Chakra uses `DialogManager`.
**Gap:** `DismissableLayer` stacks Escape correctly, but `FocusScope` restores focus via `setTimeout(0)` to `document.activeElement` captured at mount — when Dialog A opens Dialog B and B closes, focus jumps past A back to the original trigger instead of to A.
**Where to add:** `src/primitives/FocusScope.tsx`
**Priority:** must-have

### 6. Drawer has no swipe-to-dismiss; only Sheet does
**Category:** Drawer
**Benchmark:** Vaul, Radix Dialog (bottom), Mantine Drawer swipe handlers on mobile.
**Gap:** `DrawerV2.Content` has no pointer-drag logic. `Sheet.Handle` works only for bottom orientation.
**Where to add:** `src/components/DrawerCompound.tsx`
**Priority:** nice-to-have

### 7. Popover/Tooltip anchoring: no shift, boundary, virtual-element, or arrow positioning
**Category:** Popover / Tooltip
**Benchmark:** Floating UI's `shift`, `flip`, `hide`, `arrow`, `VirtualElement`; Radix `collisionBoundary`, `arrowPadding`.
**Gap:** `computeAnchoredPosition` supports flip but no shift (popover clipped when anchor is near viewport edge on the cross axis), no custom `boundary`, no `hide-when-anchor-scrolled-offscreen`, no virtual-element anchoring (needed for right-click context menus at pointer coords), and `arrow` prop on `PopoverV2.Content` only renders a span with no positioned offset.
**Where to add:** `src/utils/anchor.ts`, `src/components/Popovers.tsx`
**Priority:** must-have

### 8. Tooltip delay-group acknowledges provider but has no trigger-free API
**Category:** Tooltip
**Benchmark:** Radix `TooltipProvider` + `Tooltip.Root controlled open`; Mantine `Tooltip.Group`.
**Gap:** `TooltipProvider` records last-closed timestamp for skip-delay, but `Tooltip` has no `controlled open`, no `trigger="click|focus|hover"` modes, no interactive (keep-open-when-hovering-content) support — attempting a tooltip with a link inside drops it immediately.
**Where to add:** `src/components/Popovers.tsx`
**Priority:** must-have

### 9. Toast has no action feedback, progress, grouping, dismiss-all, or pause-on-hover
**Category:** Toast
**Benchmark:** Sonner (`toast.loading`, pause-on-hover, duration bar, `toast.dismiss()` with no arg), react-hot-toast grouping.
**Gap:** `Toaster` auto-dismiss timer never pauses on hover/focus (WCAG 2.2.1 issue), no countdown/progress bar, no `toast.dismiss()` (all), no collapsing-duplicates ("Saved ×3"), `action` is render-only with no built-in undo-timer. `promise` exists but doesn't support a "cancel" handle.
**Where to add:** `src/components/ToastSystem.tsx`
**Priority:** must-have

### 10. No desktop Notification API bridge
**Category:** System
**Benchmark:** Mantine `notifications` + Web Notifications; Sonner + browser fallback.
**Gap:** `NotificationCenter` and `Toaster` never surface `new Notification()` when the tab is hidden; `useNetworkStatus` only signals online/offline to banners.
**Where to add:** `src/components/ToastSystem.tsx`, new hook `useNotificationBridge`
**Priority:** nice-to-have

### 11. Spotlight: no persistent acknowledgement, JSON config, or keyboard shortcuts
**Category:** Tour
**Benchmark:** Intro.js, Shepherd, Driver.js persist "don't show again" + arrow-key navigation.
**Gap:** `Spotlight` has no `storageKey`/don't-show-again (CoachMark has this, tour doesn't), no left/right-arrow step binding, no branching (`nextStep: (state) => n`), no auto-scroll to bring target into view.
**Where to add:** `src/components/Spotlight.tsx`
**Priority:** nice-to-have

### 12. CommandPalette: no recents, pinned, async results, or nested commands
**Category:** Palette
**Benchmark:** Raycast, Linear, cmdk (Vercel) — all support history, pins, async-loading states, sub-palettes.
**Gap:** Registry is flat, no `useRecent()`/localStorage history, no async resolver (loading spinner while backend search), no nested `onSelect: () => pushPalette(...)` pattern, fuzzy score is computed but never displayed.
**Where to add:** `src/components/CommandPalette.tsx`
**Priority:** nice-to-have

### 13. Lightbox: no pan when zoomed, no slideshow, no EXIF/share
**Category:** Lightbox
**Benchmark:** yet-another-react-lightbox, PhotoSwipe (pan, rotate, fullscreen, auto-advance).
**Gap:** Zoom scales `transform` but there's no pointer-drag pan when `scale > 1` — user cannot inspect zoomed regions. No `slideshow={interval}` auto-advance, no share-to-clipboard button, no fullscreen API integration, download always delivers raw `src` (no "optimized" option).
**Where to add:** `src/components/Lightbox.tsx`
**Priority:** nice-to-have

### 14. No ContextMenu / right-click menu component
**Category:** Popover
**Benchmark:** Radix `ContextMenu`, shadcn, MUI `Menu` (anchorPosition).
**Gap:** There's no surface for pointer-anchored menus. Would naturally live next to `PopoverV2` but requires the virtual-element anchoring from finding #7.
**Where to add:** new `src/components/ContextMenu.tsx`
**Priority:** nice-to-have

### 15. BannerAlert / AlertV2 have no auto-dismiss timer
**Category:** Alert
**Benchmark:** Chakra `Alert` + `useToast({ duration })`, Mantine `Notification.autoClose`.
**Gap:** Both accept `dismissible` but no `duration`/`autoDismiss` prop, no pause-on-hover, no countdown affordance. Users wiring timed-hide must re-implement.
**Where to add:** `src/components/Notifications.tsx`
**Priority:** nice-to-have

### 16. OfflineBanner has no retry, last-online timestamp, or service-worker hook
**Category:** Network
**Benchmark:** Workbox + `BackgroundSync`, Vercel offline UIs.
**Gap:** `OfflineBanner` only renders a message; no retry button, no "offline since 3m ago" counter, no way to subscribe to SW controller changes (`controllerchange` for "update available").
**Where to add:** `src/components/Network.tsx`, `src/hooks/useNetworkStatus.ts`
**Priority:** nice-to-have

### 17. Sheet snap-point transitions are instant, not spring
**Category:** Sheet
**Benchmark:** Vaul spring physics, Material bottom sheet velocity-based snap.
**Gap:** `SheetHandle` snaps on pointer-up with no velocity awareness (a fast swipe down that crosses <60% still snaps instead of dismissing), and the CSS transition between snap points is linear — no spring. Also no handle for other sides.
**Where to add:** `src/components/DrawerCompound.tsx`
**Priority:** nice-to-have

### 18. Dialog.Content body has no scroll-sticky header/footer pattern
**Category:** Dialog
**Benchmark:** Radix shadcn pattern `max-h-[85vh]` + scroll body + sticky header; Chakra `DialogBody` auto-scrolls with sticky footer.
**Gap:** `DialogBody` has no max-height/overflow-auto styling; long content overflows the panel or forces the entire dialog to scroll including the header.
**Where to add:** `src/css/components/overlay.css`
**Priority:** must-have

### 19. No "initialFocus" / "finalFocus" escape hatch
**Category:** Dialog / Drawer
**Benchmark:** Radix `onOpenAutoFocus`, Headless UI `initialFocus` ref, Chakra `initialFocusRef` / `finalFocusRef`.
**Gap:** `FocusScope` always focuses the first focusable. There's no way to say "focus the destructive Cancel button" or "return focus to a specific element after close" — the escape hatch exists in the primitive (`autoFocus={false}`) but Dialog/Drawer don't surface it per-invocation.
**Where to add:** `src/components/Dialog.tsx`, `DrawerCompound.tsx`
**Priority:** must-have

### 20. V1 Overlay.tsx exports (`Alert`, `Popover`, `Drawer`, `ConfirmDialog`) beyond being superseded
**Category:** System
**Benchmark:** n/a — codebase hygiene.
**Gap:** Beyond duplication, V1 `Popover` uses `position` instead of placement-pair, has no flip/shift, no portal (content is clipped by overflow ancestors). V1 `ConfirmDialog` has no ScrollLock, no open-controlled-by-Presence exit animation when `motion={false}`, and duplicates title/label as plain strings breaking rich content.
**Where to add:** Migration deprecation JSDoc tags in `src/components/Overlay.tsx`
**Priority:** nice-to-have
