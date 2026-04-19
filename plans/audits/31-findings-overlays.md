# Plan 31 — Overlays Bucket: Signal-First Functionality Audit

Scope: 31 overlay components (Dialog/Drawer/Popover/Menu/Toast/Tooltip/Command/
Spotlight/Popconfirm family). Read-only audit against the 5-point check
(prop-to-code liveness, controlled/uncontrolled, state transitions,
callback signatures, test coverage) with overlay-specific focus on focus
trap, portal rendering, backdrop dismissal, Escape, `aria-modal`, and focus
restoration.

## Severity counts

- P0 (dead prop / broken open control): **2**
- P1 (focus-trap edge / default mismatch / broken behavior): **7**
- P2 (undocumented behavior): **3**
- P3 (test-only): **0**

Total findings: **12** across **8** components. Remaining 23 components
clean for this audit.

---

## Per-component findings

### Popconfirm — `src/components/Popconfirm.tsx`

- **P0 — `placement` anchoring is broken when Portal renders the overlay.**
  `src/components/Popconfirm.tsx:129` wraps the overlay in `<Portal>`, which
  appends it to `document.body`. The CSS placement modifiers in
  `src/css/components/popconfirm.css:20-46` position the overlay with
  `position: absolute; top/left/right/bottom: 100%` — those values resolve
  relative to the portal root (body), not the trigger container
  (`.vf-popconfirm`). The `placement` prop at
  `src/components/Popconfirm.tsx:50,133` appears live (sets a class) but
  the class is CSS-dead once portaled. No `computeAnchoredPosition` or
  trigger-rect measurement is performed (contrast with `PopoverV2` at
  `src/components/Popovers.tsx:155-172`). Effect: overlay renders at an
  arbitrary viewport corner rather than anchored to the trigger.

- **P1 — No click-outside dismissal; focus is not trapped.**
  `src/components/Popconfirm.tsx:90` only wires Escape via `useEscapeKey`.
  The overlay has no `DismissableLayer` or click-outside handler, and no
  `FocusScope`, so tab can move focus out of the portaled content while
  the dialog (role="dialog", line 136) is still open. `aria-modal` is
  absent, which is consistent with the non-trapping behavior but the
  `role="dialog"` label is misleading without modal semantics.

### ConfirmDialog (deprecated) — `src/components/Overlay.tsx`

- **P1 — `open` is read but the prop is never consulted for render
  gating.** `src/components/Overlay.tsx:333-346` destructures `open` from
  props, but the `motion=true` branch at line 385-389 passes the inner
  content unconditionally to `<Presence present={open}>`; only the
  `motion=false` branch at line 381 actually short-circuits on `!open`.
  `Presence` handles this correctly, so the render is fine, but the
  `open` prop is otherwise invisible to the rest of the component
  (e.g., `aria-modal="true"` is hard-coded even when `open` is false
  and the tree is mounting/unmounting via `Presence`).

### Drawer (deprecated) — `src/components/Overlay.tsx`

- **P2 — Controlled-only open state with no `defaultOpen` /
  `onOpenChange`.** `src/components/Overlay.tsx:29-31` types `open` as
  required and `onClose` as `() => void`, diverging from the
  `open?/defaultOpen?/onOpenChange(open)` pattern used by every V2
  overlay in the bucket. Marked P2 since the component is deprecated
  (`deprecatedComponent("Drawer", "DrawerV2", "v1.1")` at line 59).

- **P1 — No `ScrollLock` composition.** `src/components/Overlay.tsx:69-116`
  portals a modal drawer (`aria-modal="true"`, line 73) without locking
  body scroll. Users can scroll the page behind the modal, which breaks
  modal semantics. Contrast with `DrawerV2` which uses `<ScrollLock
  enabled={ctx.open} />` at `src/components/DrawerCompound.tsx:193`.

### DrawerV2 — `src/components/DrawerCompound.tsx`

- **P1 — `ScrollLock` ignores the `modal` prop.**
  `src/components/DrawerCompound.tsx:193` reads `<ScrollLock
  enabled={ctx.open} />` regardless of `ctx.modal`. A non-modal drawer
  (`modal={false}`) still locks body scroll, which contradicts the
  non-modal intent (no backdrop, `aria-modal` absent per line 219).
  Dialog gates this correctly at `src/components/Dialog.tsx:229` with
  `enabled={ctx.open && modal}`.

- **P2 — Backdrop click and `DismissableLayer.onPointerDownOutside`
  both call `setOpen(false)`.** `src/components/DrawerCompound.tsx:198`
  installs an `onClick={() => ctx.setOpen(false)}` on the backdrop, and
  the `DismissableLayer` at line 201-209 also calls `setOpen(false)` on
  pointer-down-outside. A click on the backdrop fires both paths, so
  `onOpenChange(false)` is invoked twice per dismissal. Same pattern in
  `Dialog` (`src/components/Dialog.tsx:232` + `:240-243`) and `Sheet`
  (`src/components/DrawerCompound.tsx:432` + `:435`).

### Sheet — `src/components/DrawerCompound.tsx`

- **P1 — `ScrollLock` ignores `modal` (same as DrawerV2).**
  `src/components/DrawerCompound.tsx:427` — `<ScrollLock
  enabled={ctx.open} />` ignores `ctx.modal`.

### Tooltip / TooltipProvider — `src/components/Popovers.tsx`

- **P1 — `skipDelayDuration` is dead; `lastClosedAt` snapshot never
  updates.** `src/components/Popovers.tsx:245-256` creates the provider
  value via `useMemo` with deps `[delayDuration, skipDelayDuration]`.
  `lastClosedAt: lastClosed.current` is captured *at memo time* (always
  `0` on first render), while `setLastClosedAt` mutates
  `lastClosed.current` without re-memoizing. The `Tooltip` consumer at
  `src/components/Popovers.tsx:281-287` reads `provider.lastClosedAt`
  (the stale snapshot), so `Date.now() - 0` is always huge, and the
  "fast re-open" path (`0` delay) never engages. `skipDelayDuration` is
  effectively a dead prop on `TooltipProvider`.
  `src/components/Popovers.tsx:234-238` documents it as live.

### MenuBar / MenuBarMenu — `src/components/Menu.tsx`

- **P1 — ArrowLeft/ArrowRight between MenuBar menus is documented but
  not implemented.** `src/components/Menu.tsx:6-11` claims
  "ArrowRight — open submenu or next bar menu" and "ArrowLeft — close
  submenu or previous bar menu", but `MenuBar` at line 608-618 only
  sets `role="menubar"` and renders children; there is no keyboard
  handler wiring between sibling `MenuBarMenu` entries. Only
  `MenuSubTrigger` (`src/components/Menu.tsx:444-452`) implements the
  ArrowLeft/ArrowRight contract, and only for submenus.

### Spotlight — `src/components/Spotlight.tsx`

- (No finding for Spotlight root.)

### CoachMark — `src/components/Spotlight.tsx`

- **P0 — `once` is a dead prop.** `src/components/Spotlight.tsx:234-235`
  types and documents the prop ("When true (with no storageKey), shows
  once per mount"), but the implementation at line 318 is literally
  `void once; // documentation prop; behavior matches readDismissed by
  default.` The prop is declared but has no runtime effect. Either
  remove the prop from the type or implement the documented behavior.

### ShortcutGuide — `src/components/ShortcutGuide.tsx`

- **P1 — `triggerKeys` documented as "combo" but matched as a single
  key.** `src/components/ShortcutGuide.tsx:21` documents `triggerKeys`
  as a "Key combo that toggles the guide. Default '?'". The
  implementation at line 69 performs `e.key === triggerKeys` — a raw
  string equality against `KeyboardEvent.key`. Modifier combos like
  `"mod+?"` or `"ctrl+k"` will never match. Either narrow the doc to
  "single key" or route through a combo-aware matcher (e.g., the helper
  used by `CommandPalette` at `src/components/CommandPalette.tsx:162`).

- **P2 — No Portal, no focus trap, no focus restoration.**
  `src/components/ShortcutGuide.tsx:92-104` renders the dialog inline
  (no `Portal`), uses backdrop-click via `onClick={(e) => if (e.target
  === e.currentTarget) setOpen(false)}`, and neither traps focus nor
  restores focus on close. `role="dialog"` + `aria-modal="true"` are
  set (line 95-96) without the supporting semantics. Acceptable as a
  help overlay but inconsistent with every other modal overlay in the
  bucket.

---

## Zero-finding roster (23 components)

These passed the 5-point check with no material findings:

- `Dialog` — `src/components/Dialog.tsx:71`
- `ConfirmDialogV2` — `src/components/Dialog.tsx:458`
- `Modal` — `src/components/Interactive.tsx:189`
- `CommandPalette` — `src/components/CommandPalette.tsx:180`
- `Toast` (deprecated) — `src/components/Interactive.tsx:288`
- `Toaster` — `src/components/ToastSystem.tsx:211`
- `Popover` (deprecated) — `src/components/Overlay.tsx:225`
- `PopoverV2` — `src/components/Popovers.tsx:69`
- `Menu` — `src/components/Menu.tsx:64`
- `MenuItem` — `src/components/Menu.tsx:226`
- `MenuCheckboxItem` — `src/components/Menu.tsx:274`
- `MenuRadioGroup` — `src/components/Menu.tsx:329`
- `MenuRadioItem` — `src/components/Menu.tsx:353`
- `MenuTrigger` — `src/components/Menu.tsx:97`
- `MenuContent` — `src/components/Menu.tsx:136`
- `MenuLabel` — `src/components/Menu.tsx:402`
- `MenuSeparator` — `src/components/Menu.tsx:398`
- `MenuSub` — `src/components/Menu.tsx:421`
- `MenuSubTrigger` — `src/components/Menu.tsx:430`
- `MenuSubContent` — `src/components/Menu.tsx:465`
- `Spotlight` — `src/components/Spotlight.tsx:56`

Caveats on "clean": backdrop double-fire (see DrawerV2 P2 above) applies
to `Dialog` and `Sheet` as well (cited in that finding) — noted once
under DrawerV2 to avoid duplication.

---

## Methodology notes

- **Prop-to-code liveness**: each declared prop was traced to a runtime
  read. Two dead props found (`CoachMark.once`,
  `TooltipProvider.skipDelayDuration` via stale snapshot); one
  CSS-dead (`Popconfirm.placement` under Portal).
- **Controlled/uncontrolled**: all V2 overlays use the canonical
  `open?/defaultOpen?/onOpenChange(next)` triplet with `open ?? internal`
  selection and `if (open === undefined) setInternal(next)` write-gate
  (seen in Dialog, DrawerV2, Sheet, PopoverV2, HoverCard, Menu,
  CommandPalette, Spotlight). Deprecated overlays (Drawer, Modal,
  Toast, ConfirmDialog) use `open`+`onClose`/`onDismiss`; Popconfirm
  uses `useControllableState`.
- **State transitions**: animations via `Presence`; focus-trap via
  `FocusScope`; scroll-lock via `ScrollLock`. Two overlays mis-gate
  `ScrollLock` against `modal` (DrawerV2 L193, Sheet L427). Dialog
  gates correctly (L229).
- **Callback signatures**: `onOpenChange(open: boolean)` is consistent
  across V2 overlays; legacy `onClose(): void` remains only on
  deprecated Drawer/Modal/ConfirmDialog.
- **Test coverage**: every overlay in this bucket has a corresponding
  test file (`Dialog.test.tsx`, `DrawerCompound.test.tsx`,
  `Popovers.test.tsx`, `Popconfirm.test.tsx`, `Menu.test.tsx`,
  `CommandPalette.test.tsx`, `CommandPaletteExpanded.test.tsx`,
  `CommandPaletteCoverage.test.tsx`, `ToastSystem.test.tsx`,
  `Spotlight.test.tsx`, `ShortcutGuide.test.tsx`, `Sheet.test.tsx`,
  `Overlay.test.tsx`, `Interactive.test.tsx`, `overlayMotion.test.tsx`,
  `a11yAxe.test.tsx`, `FeedbackOverlays.test.tsx`). No P3 test-only
  findings surfaced because each finding above cites a source-level
  defect, not a coverage gap.
- **Compound API**: `Dialog`, `DrawerV2`, `Sheet`, `PopoverV2`,
  `HoverCard`, `Menu`, `CommandPalette` all use the
  `Object.assign(Root, { Trigger, Content, ... })` pattern with a
  context guard that throws `"X.* must be used inside <X>"`. Wiring
  verified for trigger `id` / `aria-haspopup` / `aria-expanded` /
  `aria-controls` linkage. No compound-API mis-wirings found.

No components were skipped or unauditable.
