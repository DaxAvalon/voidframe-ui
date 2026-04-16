# Audit 28 — Testing

## Summary
- 168 test files total
- Components: 73/92 files tested (79%)
- Primitives: 14/15 files tested (93%)
- Charts: 30/30 files tested (100%)
- **Hooks: 14/40 files tested (35%)** — severely undertested

## Critical Gaps

### Hooks (35% coverage)
26+ hooks have no dedicated tests. Only tested:
- useForm, useControllableState, useMergedRefs, useId
- Aggregated hook files (effectHooks, interactionHooks, asyncHooks, a11yHooks, mediaHooks, timingHooks, domHooks, phase1Hooks)

### Untested Components (19 files)
- Carousel.tsx — complex scroll/keyboard navigation
- Kanban.tsx — drag-drop reorder logic
- Accordion.tsx — core interactive
- Calendar.tsx — date grid
- Activity.tsx, AsyncData.tsx, ScrollArea.tsx
- Animations.tsx, Gestures.tsx
- Network.tsx, ChatAttachments.tsx, ChatModel.tsx
- ~6 more

### Viewers (no individual tests)
CodeBlock, DiffViewer, JSONViewer, LogViewer, MarkdownRenderer — only covered by aggregate smoke tests in DataDisplay.test.tsx

### Weak Tests
- **Print.test.tsx**: 2 assertions, no print behavior testing
- **Lightbox.test.tsx**: No image navigation, keyboard, or swipe testing

## Missing Test Categories
- No compound component integration tests (Form + FormProvider + Field, DataGrid + Dialog for editing)
- No keyboard navigation sequence tests (multi-key combos, focus trap escape)
- No responsive breakpoint edge case tests

## Coverage Config
- Thresholds: 75% lines/statements/functions, 70% branches
- Exclusions appropriate: dist, demo, plans, CLI templates, VS Code extension

## Strengths
- Chart tests adequate for happy-dom constraints
- Form tests strong (validation, errors, field array)
- Overlay tests good (ScrollLock, portal, focus, motion)
- Mostly behavior-focused (not implementation details)
- No flaky test patterns detected
