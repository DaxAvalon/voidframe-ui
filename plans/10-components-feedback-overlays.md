# 10 — Components: Feedback & Overlays

**Goal:** Ship ~25 feedback, notification, and overlay components. All overlays compose the primitives from Phase 03.

**Depends on:** 03 Primitives (Portal, FocusScope, DismissableLayer, Presence, Floating), 06 Animation.
**Effort:** 3-4 days.

## Overlays

Every overlay is a composition of: `Portal` + `FocusScope` (if interactive + modal) + `DismissableLayer` + `Presence` + `Floating` (if anchored). They share common props:

- `open`, `defaultOpen`, `onOpenChange`
- `modal?: boolean`
- `trapFocus?: boolean`
- `onEscape?`, `onInteractOutside?`

### O01. Modal / Dialog (upgrade — now compound)

```tsx
<Modal open onOpenChange>
  <Modal.Trigger asChild><Button>Open</Button></Modal.Trigger>
  <Modal.Content size="md" onEscape onInteractOutside>
    <Modal.Header>
      <Modal.Title>Title</Modal.Title>
      <Modal.Description>Description</Modal.Description>
      <Modal.Close />
    </Modal.Header>
    <Modal.Body>...</Modal.Body>
    <Modal.Footer>
      <Modal.Cancel asChild><Button variant="ghost">Cancel</Button></Modal.Cancel>
      <Modal.Action asChild><Button>Save</Button></Modal.Action>
    </Modal.Footer>
  </Modal.Content>
</Modal>
```

- Sizes: `sm` (400px), `md` (560px), `lg` (720px), `xl` (960px), `full` (100vw-ish).
- Auto-focus first focusable or marked target; return focus on close.

### O02. AlertDialog / ConfirmDialog (upgrade)

```tsx
<ConfirmDialog
  open onOpenChange
  title="Delete account?"
  description="This cannot be undone."
  confirmLabel="Delete" confirmTone="danger"
  cancelLabel="Cancel"
  onConfirm onCancel
  destructive
/>
```

- `role="alertdialog"`. Auto-focuses Cancel (safer default).
- Hook variant: `const confirm = useConfirm(); await confirm({ ... })`.

### O03. Drawer (upgrade — compound)

```tsx
<Drawer open onOpenChange side="right" size={400}>
  <Drawer.Trigger />
  <Drawer.Content>
    <Drawer.Header><Drawer.Title /><Drawer.Close /></Drawer.Header>
    <Drawer.Body />
    <Drawer.Footer />
  </Drawer.Content>
</Drawer>
```

- Sides: `left` | `right` | `top` | `bottom`.
- Locks body scroll.
- Modal by default; `modal={false}` for non-modal drawers (e.g. persistent sidebars).

### O04. Sheet (new — mobile bottom sheet)

```tsx
<Sheet open onOpenChange snapPoints={[0.3, 0.6, 0.9]}>
  <Sheet.Trigger />
  <Sheet.Content>
    <Sheet.Handle />                      // drag affordance
    <Sheet.Header />
    <Sheet.Body />
  </Sheet.Content>
</Sheet>
```

- Bottom drawer with drag-to-dismiss and snap points.
- Mobile-friendly; desktop falls back to Drawer.

### O05. Dropdown (upgrade → Menu alias)

See `<Menu>` in Phase 08.

### O06. Popover (upgrade)

```tsx
<Popover open onOpenChange>
  <Popover.Trigger asChild><Button>Open</Button></Popover.Trigger>
  <Popover.Content placement="bottom-start" offset={4} arrow>
    ...
  </Popover.Content>
</Popover>
```

- Floating-UI positioning.
- Non-modal by default (click-outside dismisses but focus can leave).
- `modal={true}` for popovers with interactive content that should trap focus.

### O07. HoverCard (new)

Rich popover on hover (richer than Tooltip). No focus trap; hover-only.

```tsx
<HoverCard openDelay={400} closeDelay={200}>
  <HoverCard.Trigger asChild><Link>Alice</Link></HoverCard.Trigger>
  <HoverCard.Content>
    <Avatar /><div>Alice — Engineer</div>
  </HoverCard.Content>
</HoverCard>
```

### O08. Tooltip (upgrade)

```tsx
<Tooltip content="Copy" openDelay={300} placement="top">
  <IconButton aria-label="Copy"><CopyIcon /></IconButton>
</Tooltip>
```

- Also opens on focus (keyboard users).
- Delay group: tooltips within a `<TooltipProvider delayDuration={300}>` share timing.

### O09. ContextMenu (new — see Phase 08)

Right-click context menu. Implementation lives here.

### O10. Dropdown (compound — see Phase 08 Menu)

### O11. CommandPalette (new — tier-1 feature)

```tsx
<CommandPalette open onOpenChange shortcut="mod+k">
  <CommandPalette.Input placeholder="Type a command..." />
  <CommandPalette.List>
    <CommandPalette.Empty>No results</CommandPalette.Empty>
    <CommandPalette.Group heading="Actions">
      <CommandPalette.Item onSelect shortcut="G H" icon>
        Go home
      </CommandPalette.Item>
    </CommandPalette.Group>
    <CommandPalette.Separator />
    <CommandPalette.Group heading="Recent">
      ...
    </CommandPalette.Group>
  </CommandPalette.List>
  <CommandPalette.Footer>
    <Kbd>↵</Kbd> to select <Kbd>esc</Kbd> to close
  </CommandPalette.Footer>
</CommandPalette>
```

- Fuzzy filtering (`cmdk`-style) built-in.
- Keyboard: Arrow up/down, Enter select, Escape close, cmd+k toggle.
- Global registry via `useCommandPalette()` — components register commands on mount.

### O12. Spotlight / OnboardingTour (new)

```tsx
<Spotlight
  steps={[{ target: "#inbox", title, content, placement }]}
  open onOpenChange
  onStepChange onComplete
  allowSkip
/>
```

- Highlights target element with cutout overlay.
- Stepped tour with prev/next/skip.

### O13. CoachMark (new)

Single-shot onboarding pointer.

```tsx
<CoachMark target={ref} placement="bottom" once key="first-login">
  This is your inbox.
</CoachMark>
```

- Persists "dismissed" state to localStorage by key.

---

## Notifications

### O14. Toast (upgrade)

```tsx
<Toast id tone="success" title description onDismiss duration action={<Button>Undo</Button>} />
```

Imperative API:

```tsx
const { toast } = useToast();
toast({ title: "Saved", tone: "success" });
toast.promise(saveAction, { loading: "Saving...", success: "Saved", error: "Failed" });
```

### O15. Toaster / ToastRegion (new)

Portal container at a fixed position rendering the toast stack.

```tsx
<Toaster position="top-right" max={5} gap={8} />
```

- Positions: `top-left`, `top-center`, `top-right`, `bottom-left`, `bottom-center`, `bottom-right`.
- Placed once in the app root.

### O16. Snackbar (alias of Toast)

Same behavior; different default styling/position (bottom-center).

### O17. NotificationCenter (new)

Persistent notifications panel (bell icon + list).

```tsx
<NotificationCenter
  notifications={Notification[]}
  onMarkRead onDismiss onMarkAllRead
  unreadCount
  renderNotification
/>
```

- Dropdown/Drawer variant.
- Unread badge on trigger.

### O18. BannerAlert (new)

Top-of-page announcement.

```tsx
<BannerAlert tone="warning" dismissible onDismiss action>
  Scheduled maintenance at 2 PM UTC.
</BannerAlert>
```

### O19. Alert (upgrade)

Inline alert (within page content).

```tsx
<Alert tone="info" title icon dismissible>
  ...
</Alert>
```

### O20. Callout / InfoBox (new)

Softer inline alert variant for documentation/help.

```tsx
<Callout icon="info" title="Tip">...</Callout>
```

### O21. Quote / Blockquote (new)

Styled blockquote.

---

## Loading states

### O22. LoadingOverlay (new)

Overlay inside a container (not full-page) showing a spinner + optional message.

```tsx
<Card style={{ position: "relative" }}>
  <LoadingOverlay open label="Fetching data..." blur />
  {content}
</Card>
```

### O23. ProgressBar (see Phase 09 D15)

### O24. Spinner (upgrade)

```tsx
<Spinner size variant="dots" | "ring" | "bars" | "pulse" label />
```

- Multiple variants.
- `label` for SR accessibility.

### O25. Shimmer (new, alt to Skeleton)

```tsx
<Shimmer width height lines />
```

- Gradient-animated placeholder.

### O26. ErrorState (new)

```tsx
<ErrorState
  error={Error | string}
  title="Something went wrong"
  description
  actions={<Button>Retry</Button>}
  compact
/>
```

- Paired with `<ErrorBoundary>` (primitive).

### O27. OfflineBanner (new)

Auto-displays when `useNetworkStatus()` reports offline.

```tsx
<OfflineBanner />
```

- Dismissable; reappears on next disconnect.

### O28. ConnectionStatus (new)

Small indicator (dot + label) for live connection state — WebSocket, SSE, etc.

```tsx
<ConnectionStatus status="connected" | "connecting" | "disconnected" | "error" />
```

---

## Helpers

### O29. Portal (primitive — see Phase 03, exported for advanced users)

### O30. Backdrop (new)

```tsx
<Backdrop open onClick blur tint />
```

Used internally by Modal/Drawer/Sheet; exported for custom overlay builds.

---

## Acceptance Criteria

- [ ] All overlays compose the same primitive set (Portal/FocusScope/DismissableLayer/Presence/Floating).
- [ ] Toast/Toaster working with imperative API.
- [ ] CommandPalette supports registration + keyboard-first nav.
- [ ] Spotlight/CoachMark for onboarding.
- [ ] HoverCard vs Tooltip vs Popover distinctions documented.
- [ ] All overlays keyboard-dismissable.
- [ ] All overlays pass axe audit.
- [ ] Nested overlays (Modal with Dropdown inside) work without z-index collisions or focus-trap conflicts.
