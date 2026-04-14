# 05 — Accessibility

**Goal:** WCAG 2.1 AA compliance on every interactive component. Every component is keyboard-operable, screen-reader accessible, high-contrast compatible, and reduced-motion aware.

**Depends on:** 02 Architecture, 03 Primitives, 04 CSS.
**Unblocks:** shipping to production.
**Effort:** Pass 1: 2-3 days (retrofit existing 63). Pass 2: 2-3 days (audit new components after Track B).

## Commitments

- **WCAG 2.1 AA** on every interactive component.
- **Keyboard operable** — every interaction reachable without a mouse.
- **Screen-reader tested** — VoiceOver (macOS/iOS), NVDA (Windows), JAWS, TalkBack.
- **High-contrast mode compatible** — `data-vf-contrast="high"` and Windows HC mode.
- **Reduced motion respected** — `prefers-reduced-motion` disables non-essential animation.
- **Focus visible** — every focused element shows a ring via `:focus-visible`.
- **Color is never the only cue** — semantics conveyed by icon, text, or pattern too.

## Global Rules

1. **All interactive elements** are `<button>`, `<a>`, `<input>`, `<select>`, `<textarea>`, or have `role` + `tabindex="0"` + keyboard handlers.
2. **All icon-only buttons** have `aria-label` or a `<VisuallyHidden>` child.
3. **All form inputs** have an associated label (`<label>` with `htmlFor`, or wrapping).
4. **All dynamic content** that matters for AT (toasts, errors, loading) uses `aria-live`.
5. **Focus returns** to the triggering element on overlay close.
6. **Tab order matches visual order.** No positive `tabindex`.
7. **No keyboard traps** except inside modals (where it's intentional).
8. **Contrast ratio ≥ 4.5:1** for body text, ≥ 3:1 for large text and UI components (verified tool: axe, Lighthouse).

## Component Audit

For every interactive component, check: role, keyboard, focus, aria, states, reduced motion.

### Button

| Requirement | Implementation |
|---|---|
| Role | Native `<button>` |
| Keyboard | Space, Enter activate (native) |
| Focus | `:focus-visible` ring |
| Disabled | `aria-disabled="true"` + `disabled`; click still blocked |
| Loading | `aria-busy="true"`; label remains readable |
| Icon-only | Requires `aria-label` (dev-warn if missing) |

### IconButton (new)

Same as Button + mandatory `aria-label`.

### Toggle / Switch

| Requirement | Implementation |
|---|---|
| Role | `role="switch"` |
| State | `aria-checked={boolean}` |
| Keyboard | Space, Enter toggle |
| Label | `aria-label` or visible label with `htmlFor` |

### Checkbox

| Requirement | Implementation |
|---|---|
| Role | Native `<input type="checkbox">` |
| State | `checked`, `aria-checked` (for tri-state) |
| Indeterminate | `aria-checked="mixed"` |
| Keyboard | Space toggles |

### Radio / RadioGroup

| Requirement | Implementation |
|---|---|
| Role | `role="radiogroup"` on group, native `<input type="radio">` inside |
| Group | `aria-labelledby` on group pointing to group label |
| Keyboard | Arrow keys navigate between radios, Tab exits group |
| Focus | Only selected radio is tab-reachable (roving tabindex via `RovingFocusGroup`) |

### Select (native)

Use native `<select>` when possible. Add `aria-label` if no visible label. Arrow keys handled natively.

### Combobox

| Requirement | Implementation |
|---|---|
| Role | `role="combobox"` on input, `role="listbox"` on dropdown, `role="option"` on items |
| State | `aria-expanded`, `aria-controls={listboxId}`, `aria-activedescendant={highlightedOptionId}` |
| Keyboard | Arrow up/down navigate options, Enter selects, Escape closes, Home/End first/last, typing filters |
| Announcements | Live region announces "N results available", "no results" |

### MultiSelect

As Combobox + `aria-multiselectable="true"` on listbox.

### Input / Textarea

| Requirement | Implementation |
|---|---|
| Label | Required — visible label or `aria-label` |
| Error | `aria-invalid="true"`, `aria-describedby={errorId}` |
| Help | `aria-describedby={helpId}` |
| Required | `required` + `aria-required="true"` |

Auto-wired via `<Field>` primitive.

### Slider

| Requirement | Implementation |
|---|---|
| Role | `role="slider"` (or native `<input type="range">` wrapper) |
| State | `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext` |
| Keyboard | Arrow keys (step), PageUp/Down (large step), Home/End |

### DatePicker

| Requirement | Implementation |
|---|---|
| Role | Trigger is `<button>` + `aria-haspopup="dialog"` |
| Calendar grid | `role="grid"`, `role="gridcell"` |
| Keyboard | Arrow keys navigate days, PageUp/Down months, Shift+PageUp/Down years, Home/End week, Enter selects, Escape closes |
| Announcement | Announce focused date: "March 5, 2026, Thursday" |

### Tabs

| Requirement | Implementation |
|---|---|
| Role | `role="tablist"`, `role="tab"`, `role="tabpanel"` |
| State | `aria-selected`, `aria-controls={panelId}`, `aria-labelledby={tabId}` |
| Keyboard | Arrow keys navigate tabs (orientation-aware), Home/End first/last, Enter/Space activate (if manual activation) |
| Roving | Roving tabindex across tabs; panel is focusable (`tabindex="0"`) |

### Accordion

| Requirement | Implementation |
|---|---|
| Trigger | `<button>` with `aria-expanded`, `aria-controls={contentId}` |
| Content | `role="region"`, `aria-labelledby={triggerId}` |
| Keyboard | Enter/Space toggle, Up/Down navigate between items, Home/End |

### Modal / Dialog

| Requirement | Implementation |
|---|---|
| Role | `role="dialog"`, `aria-modal="true"` |
| Label | `aria-labelledby={titleId}` or `aria-label` |
| Description | `aria-describedby={descId}` optional |
| Focus | Trapped inside (FocusScope); auto-focus first element or labelled target |
| Return | Focus returns to trigger on close |
| Keyboard | Escape closes (unless explicitly disabled) |
| Background | `<body>` gets `aria-hidden` or `inert` on siblings |

### Drawer / Sheet

Same as Modal + `aria-label="[side] drawer"`.

### AlertDialog / ConfirmDialog

Like Modal but `role="alertdialog"`. **Auto-focus the safest action** (usually Cancel).

### Dropdown / Menu

| Requirement | Implementation |
|---|---|
| Trigger | `aria-haspopup="menu"`, `aria-expanded` |
| Menu | `role="menu"` |
| Items | `role="menuitem"`, `role="menuitemcheckbox"`, `role="menuitemradio"` |
| Separator | `role="separator"` |
| Submenu | Trigger has `aria-haspopup="menu"`; opens on ArrowRight |
| Keyboard | Arrow up/down, Enter/Space activate, Escape closes, Home/End, typeahead |

### ContextMenu

Same as Dropdown but triggered by right-click / long-press. Announce: "Context menu opened".

### Popover

| Requirement | Implementation |
|---|---|
| Trigger | `aria-haspopup="dialog"` (if interactive content), `aria-expanded`, `aria-controls` |
| Content | `role="dialog"` + label; focus moves in if interactive |
| Keyboard | Escape closes; focus-return on close |

### Tooltip

| Requirement | Implementation |
|---|---|
| Role | `role="tooltip"` |
| Association | Trigger has `aria-describedby={tooltipId}` |
| Trigger | Show on hover **and** focus (keyboard users need tooltips too) |
| Dismiss | Hides on Escape |
| Delay | Configurable; screen-reader reads description without delay |

### HoverCard

More content than Tooltip (links, rich text). `role="dialog"` or `role="tooltip"` depending on interactivity. Only mouse-hover triggers — not keyboard (use Popover instead for keyboard).

### Toast

| Requirement | Implementation |
|---|---|
| Container | `role="region"`, `aria-label="Notifications"` |
| Item | `role="status"` (polite) or `role="alert"` (assertive, for danger only) |
| Dismiss | Every toast has a close button with `aria-label="Dismiss"` |
| Keyboard | F6 (or configurable) focuses the toast region; Tab navigates toasts |

### Breadcrumb

- `<nav aria-label="Breadcrumb">` wrapper.
- Current page: `aria-current="page"`.
- Separator is decorative (`aria-hidden="true"`).

### Pagination

- `<nav aria-label="Pagination">`.
- Current page: `aria-current="page"`.
- Buttons: `aria-label="Page N"`, `aria-label="Previous page"`, `aria-label="Next page"`.
- Disable (not hide) prev/next at bounds.

### Stepper

- `<ol>` (or `role="list"`) with `<li role="listitem">` for each step.
- Current: `aria-current="step"`.
- Steps are buttons if clickable, spans if not.

### Table / DataGrid

| Requirement | Implementation |
|---|---|
| Semantic | `<table>`, `<thead>`, `<tbody>`, `<th scope="col">`, `<td>` |
| Sort | `aria-sort="ascending" \| "descending" \| "none"` on sorted `<th>` |
| Caption | `<caption>` for accessible name |
| Selection | Row with `aria-selected`; checkbox per row for multi-select |
| DataGrid | Keyboard cell nav (ArrowLeft/Right/Up/Down), PageUp/Down, Home/End, Ctrl+Home/End |
| Announcement | Sort/filter changes announced via live region |

### TreeView

| Requirement | Implementation |
|---|---|
| Role | `role="tree"`, `role="treeitem"`, `role="group"` for children |
| State | `aria-expanded`, `aria-level`, `aria-posinset`, `aria-setsize`, `aria-selected` |
| Keyboard | Arrow keys (ArrowRight expands or moves to child, ArrowLeft collapses or moves to parent), Enter activates, Home/End, typeahead |

### Kanban

Drag-and-drop must have a **keyboard alternative**. ARIA live region announces moves: "Card moved from Todo to In Progress, position 2 of 5". Each card has a menu with "Move to..." option.

### Calendar / DatePicker

See DatePicker.

### Progress

- `role="progressbar"`.
- `aria-valuemin`, `aria-valuemax`, `aria-valuenow` (for determinate).
- `aria-label` or `aria-labelledby`.
- Indeterminate: omit `aria-valuenow`.
- Live region for significant milestones (optional).

### Spinner

- `role="status"`, `aria-label="Loading"` (or context-specific).
- Dev-warn if standalone without an accessible name.

### Skeleton

- `aria-hidden="true"` (purely visual placeholder).
- The loading-state ancestor has `aria-busy="true"`.

### Carousel

| Requirement | Implementation |
|---|---|
| Role | `role="region"`, `aria-roledescription="carousel"` |
| Controls | Prev/Next buttons with `aria-label` |
| Slides | `role="group"`, `aria-roledescription="slide"`, `aria-label="Slide N of M"` |
| Auto-play | Pause on hover/focus; expose play/pause button |
| Keyboard | Arrow left/right navigate slides |

### CommandPalette

- `role="dialog"`, `aria-modal="true"`.
- Input: `role="combobox"`, `aria-controls={listId}`, `aria-expanded="true"`.
- Results: `role="listbox"`, items `role="option"` with `aria-selected`.
- Announce: "N commands found". Empty state: "No commands match".

### FileUpload / DropZone

- `<input type="file">` always present (hidden visually but not from AT).
- Drop zone: `aria-label="Drop files to upload or click to browse"`.
- Announce upload progress and completion.

---

## Keyboard Shortcut Baseline

| Action | Shortcut |
|---|---|
| Close overlay | Escape |
| Confirm | Enter (in dialogs) |
| Navigate tabs/lists | Arrow keys |
| Jump to start/end | Home / End |
| Large step (slider, pagination) | PageUp / PageDown |
| Multi-select (table, tree) | Shift+click, Ctrl/Cmd+click |
| Expand/collapse | ArrowRight / ArrowLeft (tree, menu) |
| Typeahead | Alphanumeric key |
| Select all | Ctrl/Cmd+A (where applicable) |

## Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- Essential motion (scroll-into-view, focus-return) remains.
- Decorative motion (slide-ins, pulses) effectively disabled.
- Provide a `usePrefersReducedMotion()` hook for JS-driven animations.

## Color Contrast

- Every text-on-bg pairing verified via axe + manual check.
- Document contrast ratios in the docs site per token pairing.
- Amber/green/red on `bg-2` must hit 4.5:1 — adjust token values if they don't.
- **`data-vf-contrast="high"`** boosts text-1 / border-1 / border-2 for AAA readability.

## Focus Management

- **One element has focus at a time.** Never try to focus two.
- **Focus is visible** via `:focus-visible` on every focusable element.
- **Focus returns** on overlay close (FocusScope handles this).
- **Skip to content** link at the top of each page — `<SkipToContent href="#main" />`.
- **Programmatic focus** only when appropriate (modal open, form error) — never on scroll.

## Live Regions

- One global `aria-live="polite"` region (injected by Provider) for toast announcements and incidental messages.
- One global `aria-live="assertive"` region for urgent (danger toasts, critical errors).
- Component-local live regions for in-context updates (combobox results count, form validation).

## Screen-Reader Testing Protocol

For each component in Pass 2:

1. **VoiceOver on macOS Safari** — tab through, activate, observe announcements.
2. **NVDA on Windows Firefox** — same.
3. **TalkBack on Android Chrome** — at least spot-check forms and overlays.
4. Document issues; fix; re-test.

## Automated Testing (bridges to Phase 19)

- **axe-core** run on every component in unit tests.
- **No violations of "serious" or "critical" severity** before merge.
- **@testing-library/jest-dom** assertions: `toHaveAccessibleName`, `toHaveAccessibleDescription`.
- **Playwright + axe** on the demo app in CI.

## Dev-Mode A11y Warnings

Fire in dev when:
- `<IconButton>` or icon-only `<Button>` has no `aria-label`.
- `<Input>` has no label or `aria-label`.
- `<img>` passed via `children` has no `alt`.
- `<Modal>` has no `aria-labelledby` and no `aria-label`.
- `tabindex` with positive value detected.

---

## Acceptance Criteria (Pass 1)

- [ ] Every existing interactive component has correct role, aria, keyboard handling.
- [ ] `:focus-visible` rings on all focusable elements.
- [ ] Focus return works for Modal, Drawer, Dropdown, Popover.
- [ ] Escape dismisses overlays.
- [ ] Reduced motion CSS is in place.
- [ ] axe-core unit tests pass for all components (no serious/critical violations).

## Acceptance Criteria (Pass 2 — after Track B)

- [ ] New components from Track B pass the same audit.
- [ ] Full library screen-reader walkthrough (VO + NVDA) completed and documented.
- [ ] Playwright + axe CI runs clean on the docs site.
- [ ] High-contrast mode (Windows HC + `data-vf-contrast="high"`) verified.
- [ ] An accessibility statement is published in the docs.

## Notes

- **Native elements are always preferred** over custom roles. Only use `role="button"` on `<div>` if there's a structural reason we can't use `<button>`.
- **Don't fake focus** — use real focus management (FocusScope does this).
- **Test with real screen readers** — automated tools catch ~30% of a11y issues. The rest requires human ears.
- **Consumer responsibility**: document that consumers are responsible for the labels they pass — we can't guess a button's purpose.
