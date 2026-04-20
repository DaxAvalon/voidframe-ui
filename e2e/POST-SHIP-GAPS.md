# Library gaps surfaced by the Playwright e2e suite

These are real behaviors the e2e sweep caught that jsdom / happy-dom unit
tests couldn't see. Each is marked as `test.fixme` in the e2e suite — the
suite ships green with the gap visible in every run, and the test
auto-promotes back to `toEqual` (green→red) once the underlying library
fix lands and the `fixme` is removed.

Not shipping blockers on their own; tracked here so a follow-up branch
can close them deliberately.

## 1. `Menu.Trigger` click does not move focus into `Menu.Content`

**File:** `src/components/Menu.tsx` (`MenuTrigger`).
**Symptom:** after `<Menu.Trigger>` opens the menu, `document.activeElement`
stays on the trigger button. Arrow-key nav does nothing until the user
Tabs into the menu manually or the e2e test seeds focus on the first
item via `.focus()`.
**Fix sketch:** on open, focus the first enabled `role="menuitem"` inside
the content panel. Match Radix's behavior (Menu open → first item focused).
**Covered by:** `e2e/tests/keyboard/menu.spec.ts` — the test currently
seeds focus manually and asserts ArrowDown / ArrowUp navigation from there.

## 2. `MenuBar` ArrowRight opens next menu but doesn't close the previous

**File:** `src/components/Menu.tsx` (`MenuBar` + `MenuBarMenu`).
**Symptom:** each `MenuBarMenu` owns its own Menu state. `MenuBar`'s
arrow-key handler focuses + clicks the next trigger, which toggles that
menu open. The currently-open sibling stays open, leaving both menus
visible at once.
**Fix sketch:** MenuBar should maintain a shared registry (context) of
open menus and close the previous when a new one opens. Or MenuBarMenu
should subscribe to MenuBar's "active index" and close when the active
index moves away.
**Covered by:** `e2e/tests/keyboard/menubar.spec.ts` — asserts only that
the next menu opens (today's reality); once the fix lands, add an
assertion that the previous menu closes.

## 3. `Dialog.Close` / `Dialog.Action` with `asChild` produces `nested-interactive`

**File:** `src/components/Dialog.tsx` (`DialogClose` / `DialogCancel` / `DialogAction`).
**Axe rule:** `nested-interactive` (serious).
**Symptom:** `<Dialog.Close asChild><Button>Cancel</Button></Dialog.Close>`
emits a `<button>` inside a `<button>` — the Slot merge isn't collapsing
the wrapper in one of these subparts. Likely the Close renders its own
`<button>` regardless of `asChild`, or Button's `asChild` merge isn't
propagating correctly.
**Fix sketch:** route `DialogClose` / `DialogCancel` / `DialogAction`
through the `Slot` primitive when `asChild` is true, mirroring the
pattern used by `DialogTrigger`.
**Covered by:** `e2e/tests/a11y/overlay-open-axe.spec.ts` — Dialog-open
axe test is `fixme` today.

## 4. `MenuBar` `role="menubar"` requires `role="menuitem"` children

**File:** `src/components/Menu.tsx` (`MenuBarMenu` triggers).
**Axe rule:** `aria-required-children` (critical).
**Symptom:** `role="menubar"` wraps `MenuBarMenu` entries, which each
render a `MenuRoot.Trigger` — a plain `<button>` without `role="menuitem"`.
Axe flags the menubar as violating the required-children contract.
**Fix sketch:** `MenuBarMenu`'s trigger should carry `role="menuitem"`
with `aria-haspopup="menu"`. That's the WAI-ARIA pattern for menubar +
sub-menu triggers.
**Covered by:** `e2e/tests/a11y/routes-axe.spec.ts` — MenuBar route axe
test is `fixme`.

## 5. `FileUpload` hidden `<input type="file">` missing label

**File:** `src/components/FileUpload.tsx`.
**Axe rule:** `label` (critical) — "Form elements must have labels."
**Symptom:** the hidden native file input that powers the browse
affordance has no associated `<label>` or `aria-label`. Visually the
drop-zone surface is the real control, but axe inspects the input and
fails because it's focusable (even if visually hidden) with no accessible
name.
**Fix sketch:** add `aria-label={label ?? "Upload files"}` to the
`<input type="file">`, or wrap it in a visually-hidden `<label>`.
**Covered by:** `e2e/tests/a11y/routes-axe.spec.ts` — FileUpload route
axe test is `fixme`.

---

Fix order (recommended): (5) easiest — 1-line aria-label. (4) next —
role rename on a well-defined element. (3) — refactor via Slot, larger
but self-contained. (1) and (2) are behavior changes that affect
interaction patterns; coordinate with test updates.
