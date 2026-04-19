# Plan 31 — Core Bucket Functionality Audit

Signal-first audit of the 38 components listed under the `core` key of
`plans/audits/31-component-index.json`. Each component was evaluated against
the 5-point check (prop-to-code liveness, controlled/uncontrolled wiring,
state transitions, callback signatures, test coverage). Only items that
triggered a finding are enumerated; the remaining components are rolled up
in the zero-finding roster.

## Severity counts

| Severity | Count |
| -------- | ----- |
| P0 — dead prop / broken callback | 0 |
| P1 — edge-path / default mismatch | 3 |
| P2 — undocumented / dead code    | 8 |
| P3 — test-only                    | 0 |
| **Total**                         | **11** |

Components audited: 38. Components with findings: 7. Zero-finding: 31.
Components that could not be audited: 0.

---

## Per-component findings

### Button — `src/components/Button.tsx`

- **P1 · asChild path drops `iconLeft`, `iconRight`, and `loading` affordances.**
  `src/components/Button.tsx:41-44, 68-85` — Those three props are
  destructured off `props` and then never applied when `asChild` is true; the
  `<Slot>` branch just renders `{children}`. Consumers who pass
  `<Button asChild loading iconLeft={…}><a /></Button>` silently lose the
  spinner and icon slots. The `disabled` guard on `onClick` also ignores
  `loading` (the `isDisabled` derivation on `src/components/Button.tsx:62` is
  only used on the non-asChild branch — `src/components/Button.tsx:76` checks
  bare `disabled`). Either document the asChild restrictions or thread the
  decorated markup through `Slot`.

### Badge — `src/components/Badge.tsx`

- **P2 · asChild path drops `dot`, `icon`, `count`, `overflowCount`, and
  `dismissible`.** `src/components/Badge.tsx:68-79` — When `asChild` is true
  the component returns the cloned child with only `className`/`style`; every
  visual/behavioural prop above is destructured off `props` and discarded.
  Call-sites using `<Badge asChild dismissible onDismiss={…}>` receive no
  close button.

### Pagination — `src/components/Navigation.tsx`

- **P1 · `pageSize` controlled `<select>` has no default.**
  `src/components/Navigation.tsx:256, 334-336` — `pageSize` is typed as an
  optional `number` with no default, but the element is rendered as
  `<select value={pageSize} onChange={…}>`. When `showPageSize` is true and
  `pageSize` is omitted, React emits the "changing an uncontrolled input to
  be controlled" warning and the first render picks the first option
  regardless of intent. Either require `pageSize` when `showPageSize` is
  true, supply a default (`pageSizeOptions[0]`), or fall back to
  `defaultValue` until a value arrives.

- **P2 · `maxItems=1` collapses to `[first, …]` with no tail.**
  `src/components/Navigation.tsx:76-93` — With `maxItems=1`, `keep=1`
  causes `segments.slice(segments.length - 0)` which returns an empty
  tail; the rendered crumb list becomes `first / …` with no current page.
  No runtime error, but the output is meaningless for the smallest cap.

### NavItem — `src/components/Navigation.tsx`

- **P2 · `asChild` path drops the forwarded `ref` and the `...props` spread.**
  `src/components/Navigation.tsx:610-628` — The asChild branch hand-spreads a
  new element with `commonProps` + `onClick` but never applies the forwarded
  `ref` (third arg to `forwardRef`) and ignores the caller's rest props
  (`...props`). Routers passing a custom `<Link>` through `asChild` cannot
  receive the ref, and attributes like `aria-label` on `<NavItem asChild>`
  are silently dropped.

### ToggleGroup — `src/components/ToggleGroup.tsx`

- **P2 · `focusItem` helper is dead code.**
  `src/components/ToggleGroup.tsx:72-84` — The function is defined,
  references `itemsRef`/`items`, but is never called. Keyboard navigation is
  handled entirely by the inline `handleKeyDown` logic lower in the file.
  Remove or wire it up.

### InlineEdit — `src/components/InlineEdit.tsx`

- **P2 · `submitOnBlur` and `submitOnEnter` bypass the `disabled`/`readOnly`
  gate.** `src/components/InlineEdit.tsx:73-116` — Edit mode is only reachable
  via `enterEditMode`, which gates on `disabled`/`readOnly`; but once the
  component is in edit mode (e.g. because the flags toggled true mid-session)
  `save()` still fires on blur/Enter and invokes `onSave(draft)`. The likely
  intent is that a component that just became read-only should cancel, not
  commit. Small edge-path; upgradable to P1 if this is consumer-facing.

- **P2 · `onSave` fires before any re-render so the external value can lag.**
  `src/components/InlineEdit.tsx:73-84` — `setEditing(false)` runs before
  `onSave(draft)` synchronously in the same handler, but consumers that do
  not update `value` before the next render will see the new display flash
  the old `value` until their handler resolves. Worth documenting on the
  prop; today the typedef just says "Save".

### FloatingActionButton — `src/components/FloatingActionButton.tsx`

- **P2 · `offset` sub-keys unused for the current `position`.**
  `src/components/FloatingActionButton.tsx:98-109` — All three of
  `offset.bottom`, `offset.right`, `offset.left` are projected onto the
  style object regardless of `position`. For `position="bottom-left"`,
  `offset.right` is still pushed as `--vf-fab-right` (and vice-versa).
  CSS ignores the irrelevant one, so nothing renders wrong, but the
  declared contract ("offset" relative to position) is not enforced and
  duplicate offsets can confuse consumers. Prefer filtering by `position`.

### AsyncData — `src/components/AsyncData.tsx`

- **P1 · `status="success"` with `data === undefined` renders `null` silently.**
  `src/components/AsyncData.tsx:91-93` — The success branch short-circuits to
  `null` when `data` is undefined/null, so an empty render slot can appear
  with `status="success"` — the user's `children(data)` is never called and
  the empty fallback is not taken either. The TS types mark
  `data: T | undefined`, so this is reachable. Either require `T` to be
  non-null, fall back to the `empty` slot, or warn in dev.

### CopyButton — `src/components/CopyButton.tsx`

- **P2 · `aria-label` mirrors visible text; overrideable `aria-label` prop is
  silently clobbered.** `src/components/CopyButton.tsx:82` — Consumers who
  pass `aria-label` via `...props` have it stomped: the explicit
  `aria-label={copied ? copiedLabel : label}` attribute is spread *before*
  `{...props}` on `src/components/CopyButton.tsx:91`, so `...props`
  actually wins — which is the opposite of the documented behaviour in the
  prop table (`label` is described as the accessible label). Either drop
  `aria-label` from the `Omit<>` in `CopyButtonProps` typing or flip the
  spread order.

---

## Zero-finding roster (31)

The following components passed the 5-point check with no actionable
findings. Props are live, controllable wiring is consistent with the
component library's `useControllableState`/`useId` conventions, states
render distinctly, callback signatures match declarations, and each has at
least one exercising test (direct or via composite suites listed in
parentheses).

- Accordion — direct (`Accordion.test.tsx`)
- Alert *(deprecated)* — via `FeedbackOverlays.test.tsx`
- AlertDialog — via `Dialog.test.tsx`
- AlertV2 — via `Notifications.test.tsx`
- Avatar — via `DataExtended.test.tsx`
- AvatarGroup — via `DataExtended.test.tsx`
- Box — via `Layout.test.tsx`
- ButtonGroup — via `Button.test.tsx`
- Card — direct (`Card.test.tsx`)
- Code — via `DataExtended.test.tsx`
- CodeAttachment — via `InteractiveMedia.test.tsx`
- Container — via `Layout.test.tsx`
- Divider — via `Text.test.tsx`
- Kbd — via `Interactive.test.tsx`
- Progress — via `Data.test.tsx`
- Result — direct (`Result.test.tsx`)
- Shimmer — via `FeedbackOverlays.test.tsx`
- Skeleton — via `FeedbackOverlays.test.tsx`/`DataExtended.test.tsx`
- SkeletonAvatar — via `SkeletonComposites.test.tsx`
- SkeletonButton — via `SkeletonComposites.test.tsx`
- SkeletonCard — via `SkeletonComposites.test.tsx`
- SkeletonForm — via `SkeletonComposites.test.tsx`
- SkeletonTable — via `SkeletonComposites.test.tsx`
- SkeletonText — via `SkeletonComposites.test.tsx`
- SplitButton — direct (`SplitButton.test.tsx`)
- Spinner *(deprecated)* — via `DataExtended.test.tsx`
- SpinnerV2 — via `FeedbackOverlays.test.tsx`
- Stack — via `LayoutExtended.test.tsx`
- Stepper — via `Navigation.test.tsx`/`NavigationUpgrades.test.tsx`
- Text — direct (`Text.test.tsx`)
- Toggle — via `Form.test.tsx`/`controllable.test.tsx`

---

## Methodology notes

- **Scope.** Restricted to the 38 entries in
  `plans/audits/31-component-index.json` → `core`. Components declared in
  the same source files but assigned to other buckets (e.g. `Table`,
  `Breadcrumb`, `AttachmentList`) were intentionally skipped.
- **Tooling.** Read-only session — `Read`, `Grep`, `Glob`, `Write`. No
  source mutations, no commits. The codebase and test tree were not
  executed.
- **Prop liveness** was verified by reading each component top-to-bottom
  and confirming every declared prop (including `...props` consumers)
  reached either JSX, a handler, or a spread target.
- **Controllable wiring** was spot-checked against
  `src/hooks/useControllableState.tsx`. Toggle, ToggleGroup, Accordion,
  and the Dialog compound all opt in; InlineEdit/CopyButton/SplitButton
  manage internal-only state by design.
- **Callback signatures** were verified by tracing each `on*` through
  its call-sites in the component body; TS types were taken at face
  value (no compiler run).
- **Test coverage** was determined by matching component names across
  `src/**/__tests__/*.test.tsx` using the Grep tool. Coverage mapping in
  the zero-finding roster cites the principal suite; some components
  have additional incidental coverage via `a11yAxe.test.tsx`,
  `refForwarding.test.tsx`, and `controllable.test.tsx`.
- **Severity labels** follow the Plan 31 Task 2 rubric: P0 = dead prop /
  broken callback; P1 = edge-path / default mismatch; P2 = undocumented /
  dead code; P3 = test-only.
