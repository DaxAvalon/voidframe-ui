# `AppShell` functionality audit

**File:** `src/components/AppShell.tsx:51`
**Test:** `src/components/__tests__/AppShell.test.tsx`
**Prop count:** 12
**Bucket:** navigation

## Prop liveness
- `header` — LIVE (109, 125)
- `sidebar` — LIVE (114, 128, 133, 136, 144)
- `rightPanel` — LIVE (86, 154, 159)
- `footer` — LIVE (162, 167)
- `sidebarWidth` — LIVE (85)
- `rightPanelWidth` — LIVE (86)
- `sidebarCollapsible` — LIVE (114)
- `sidebarDefaultCollapsed` — LIVE (75)
- `sidebarCollapsed` — LIVE (62, 77, 81)
- `onSidebarCollapsedChange` — LIVE (82)
- `headerHeight` — LIVE (87)
- `mobileBreakpoint` — LIVE (73)

## Control pattern
- Pattern: Hand-rolled controlled/uncontrolled at `const collapsed = sidebarCollapsed ?? internalCollapsed` (77)
- Uses `useControllableState`: NO
- Issues:
  - Same pattern as DateRangePicker — no warning on controlled/uncontrolled flip
  - `toggle` emits `onSidebarCollapsedChange` even when controlled without a handler → silently no-ops (acceptable)

## State transitions
- `isMobile=true` + `!collapsed` → sidebar renders as mobile drawer with backdrop ✓ (136-147)
- `isMobile=true` + `collapsed` → no sidebar, no backdrop ✓
- `isMobile=false` + `!collapsed` → sidebar renders in grid ✓ (128)
- `isMobile=false` + `collapsed` → sidebar hidden; sbW=0 but `<aside>` is also unrendered — so no double-hide ✓ (85, 128)
- `sidebarCollapsible=false` → no toggle button, user cannot change collapsed state via UI (but `sidebarCollapsed` prop still controls) ✓
- `sidebarCollapsible=true` + no `sidebar` → button is also hidden via `&& sidebar` guard ✓ (114)
- `rightPanel` absent → rpW=0 ✓
- On mobile, grid column `sbW=0px` also applies, but mobile drawer uses its own positioning class `vf-app-shell__sidebar--mobile` (143) — relies on CSS absolute positioning (FINDING 1)

## Callback signatures
- `onSidebarCollapsedChange(collapsed: boolean)` — verified (82)

## Test coverage
- File exists: YES, ~3 tests
- Tested props: `header`, `sidebar`, `rightPanel`, `footer`, `sidebarCollapsible`, `sidebarCollapsed`
- Untested props: `sidebarWidth`, `rightPanelWidth`, `sidebarDefaultCollapsed`, `onSidebarCollapsedChange`, `headerHeight`, `mobileBreakpoint`

## Findings
1. P1 — Inconsistent CSS class prefix at `src/components/AppShell.tsx:138-145`. The grid-rendered sidebar uses `vf-appshell__...` but the mobile variant uses `vf-app-shell__...` (with dash). Any consumer stylesheet targeting one prefix will silently fail for the other. Likely a typo.
2. P1 — Sidebar toggle button only rendered when `header` is truthy at `src/components/AppShell.tsx:109-127`. The toggle is inside the header region; a consumer passing `sidebarCollapsible` without a header has no UI to toggle — users can still pass `sidebarCollapsed` but no keyboard path exists.
3. P2 — No focus trap / escape handler on mobile drawer at `src/components/AppShell.tsx:136-147`. Keyboard users are stuck inside the drawer; only a click on the backdrop closes it.
4. P2 — `onSidebarCollapsedChange` fires on every toggle even if controlled value wouldn't change at `src/components/AppShell.tsx:79-83`. Computed as `!collapsed` so no stale callback, but no equality guard against parent "ignored" control flows.
5. P3 — `sidebarWidth`, `rightPanelWidth`, `sidebarDefaultCollapsed`, `onSidebarCollapsedChange`, `headerHeight`, `mobileBreakpoint` untested at `src/components/__tests__/AppShell.test.tsx`.
