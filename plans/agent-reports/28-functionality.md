# Audit 28 — Functionality

## Critical

1. **MessageFeedback aria-checked hardcoded** — `src/components/Chat/Reactions.tsx:87` — `aria-checked="false"` is hardcoded on all radio buttons. Never reflects actual selection. A11y violation + broken UX (no visual feedback for selected reason).

2. **MessageFeedback state not tracked** — `src/components/Chat/Reactions.tsx:24` — `onReasonSelect` callback fires but component has no internal state to track which reason is selected. No mechanism to render selected vs unselected.

## High

3. **DataGrid onGroupByChange never called** — `src/components/DataGrid.tsx:90` — `onGroupByChange?: (key: string | undefined) => void` declared in props but never destructured or called. Parent cannot control groupBy state.

4. **DataGrid collapsed groups persist** — `src/components/DataGrid.tsx:284,358-365` — `collapsedGroups` state not reset when `groupBy` prop changes. Switching groupBy preserves stale collapse state.

## Medium

5. **DataGrid virtualization silently disabled** — `src/components/DataGrid.tsx:1003` — When `groupBy` is active, virtualization is silently disabled. No console warning or documentation of this limitation.

## Verified Working

- **Form system**: FormProvider context wires correctly, useFormContext throws if missing, FormErrorSummary renders errors, useFieldArray manages dynamic fields
- **AsyncData**: All 4 states (loading/empty/error/success) work correctly, retry mechanism functional
- **ScrollLock**: Properly integrated across Dialog, DrawerV2, Sheet, CommandPalette with nested lock counting
- **Viewers**: CodeBlock, JSONViewer, DiffViewer, LogViewer all properly handle declared props
- **Combobox**: Single/multi select, filter, custom values, listbox a11y all working
