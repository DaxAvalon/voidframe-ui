# Phase 7: Review & Validation

## Context

Phases 1–6 add 16 components, 19 hooks, 13 utilities, 10 styling/theme expansions, 7 testing/DX tools, and 8 documentation/ecosystem improvements. This phase is the final gate — a comprehensive review and validation sweep to ensure everything meets quality standards before merging. Nothing ships until this phase passes.

---

## 7.1 Test Coverage Audit

**Goal:** Verify 100% code coverage on ALL new files from Phases 1–6.

**Process:**
1. Run `vitest run --coverage` with coverage report
2. For each new file, verify: 100% statement, branch, function, and line coverage
3. Generate HTML coverage report for manual inspection
4. Flag any uncovered lines and write additional tests

**New files to audit:**

| Phase | Source Files | Test Files |
|-------|-------------|------------|
| Phase 1: Components | 31 component .tsx files (+ 1 in src/charts/) | 31 test files in `src/components/__tests__/` (+ 1 in `src/charts/__tests__/`) |
| Phase 2: Hooks | 19 hook .ts files | 19 test files in `src/hooks/__tests__/` |
| Phase 3: Utilities | 13 utility .ts files | 13 test files in `src/utils/__tests__/` |
| Phase 4: Styling | Token additions in existing files | 10 token/CSS test files in `src/__tests__/` |
| Phase 5: Testing DX | CLI command, mocks, type tests, SSR tests | Meta-tests for each tool |
| Phase 6: Docs/Ecosystem | Pattern pages, export scripts, ESLint rules | Pattern tests, script tests, rule tests |

**Acceptance criteria:**
- 100% coverage on every new source file
- Zero skipped or pending tests

---

## 7.2 Accessibility Audit

**Goal:** Every new interactive component passes jest-axe and has correct ARIA semantics.

**Process:**
1. Add all 16 new components to `src/components/__tests__/a11yAxe.test.tsx`
2. Run the full a11y test suite
3. Manual keyboard testing for each interactive component

**ARIA role verification:**

| Component | Expected Role | Key aria-* attributes |
|-----------|--------------|----------------------|
| Transfer panels | `role="listbox"` | `aria-multiselectable` |
| Transfer items | `role="option"` | `aria-selected` |
| Popconfirm | `role="dialog"` | `aria-labelledby` |
| SplitButton menu | `role="menu"` | `aria-expanded` |
| SplitButton items | `role="menuitem"` | |
| InlineEdit display | `role="button"` | `aria-label` |
| Badge | N/A | `aria-label` (count description) |
| ToggleGroup | `role="group"` | |
| ToggleGroup items | N/A | `aria-pressed` |
| NumberStepper input | `role="spinbutton"` | `aria-valuemin`, `aria-valuemax`, `aria-valuenow` |
| Anchor | `role="navigation"` | `aria-label="Table of Contents"` |
| Cascader trigger | `role="combobox"` | `aria-expanded`, `aria-controls` |
| Cascader panels | `role="listbox"` | |
| Result | `role="status"` | |
| Descriptions | `<dl>`, `<dt>`, `<dd>` | Semantic HTML |
| Comment | `role="article"` | |
| FAB speed dial | `role="menu"` | `aria-expanded` |
| CommandInput | `role="combobox"` | `aria-autocomplete="list"`, `aria-expanded` |
| CommandInput completions | `role="listbox"` | |
| MultiProgress bars | `role="progressbar"` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| HexDump | `role="grid"` | `role="row"`, `role="gridcell"` |
| CronBuilder fieldsets | fieldset + legend | `aria-label` on selectors |
| EnvironmentVars | `role="table"` | `role="row"`, secret toggle `aria-label` |
| FilterBuilder | N/A | Labeled selects and inputs |
| CSVViewer | `<table>` | `<thead>`, `scope` on th |
| ImageDiff slider | `role="slider"` | `aria-valuenow` |
| RegExpTester | N/A | Labeled inputs, `aria-pressed` on flags |
| ModelCompare panels | N/A | `aria-label` per panel |
| TokenVisualizer | `role="button"` (if clickable) | `aria-label` on tokens |
| ConfidenceMeter | `role="meter"` | `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| OrgChart | `role="tree"` | `role="treeitem"`, `aria-expanded` |

**Manual keyboard testing matrix:**

| Component | Tab | Arrow Keys | Enter/Space | Escape |
|-----------|-----|------------|-------------|--------|
| Transfer | Panels → Actions | Within panel items | Select/Move | N/A |
| Popconfirm | Cancel → Confirm | N/A | Trigger actions | Close |
| SplitButton | Primary → Caret | Menu items | Fire action | Close menu |
| InlineEdit | Focus display | N/A | Enter edit/save | Cancel edit |
| ToggleGroup | First item | Between items | Toggle item | N/A |
| NumberStepper | Dec → Input → Inc | Up/Down in input | N/A | N/A |
| Anchor | Between links | N/A | Navigate | N/A |
| Cascader | Trigger | Panel items | Select/Expand | Close |
| FAB | FAB → Speed dial | Between actions | Trigger action | Close dial |
| CommandInput | Focus input | Up/Down history, Tab complete | Submit / Select completion | N/A |
| CronBuilder | Field selectors | N/A | Toggle/Select | N/A |
| EnvironmentVars | Row cells → Actions | N/A | Edit/Copy/Reveal | Cancel edit |
| FilterBuilder | Field → Op → Value → Remove | N/A | N/A | N/A |
| RegExpTester | Pattern → Flags → Test string | N/A | Toggle flags | N/A |
| OrgChart | Between nodes | N/A | Collapse/Expand | N/A |

**Acceptance criteria:**
- Zero jest-axe violations for all new components
- All keyboard interactions work as documented
- All ARIA roles and attributes are correct

---

## 7.3 Type Safety Review

**Goal:** All new exports have correct TypeScript types, no `any` leaks, all Props types exported.

**Process:**
1. Run `tsc --noEmit` — zero errors
2. Run `test:types` — type contract tests pass
3. Manual review per category:

**Component checklist (each of 16):**
- [ ] `{Component}Props` type exported
- [ ] All props explicitly typed (no implicit `any`)
- [ ] `className` and `style` accepted on root
- [ ] `ref` forwarded with correct element type
- [ ] Event handlers use correct React event types
- [ ] Responsive props use `Responsive<T>` correctly
- [ ] Polymorphic components use `PolymorphicComponentProps`

**Hook checklist (each of 19):**
- [ ] Return type explicitly typed
- [ ] Options parameter has named interface
- [ ] Generic type parameters correctly constrained
- [ ] Overloads (if any) have correct signatures

**Utility checklist (each of 13):**
- [ ] Parameters and return types explicit
- [ ] Generic constraints appropriate
- [ ] No `as any` casts

**Acceptance criteria:**
- `tsc --noEmit` passes with zero errors
- No `any` in public API surface
- All Props types exported
- Type contract tests pass

---

## 7.4 Bundle Size Verification

**Goal:** All bundle sizes remain within defined limits.

**Process:**
1. Run `npm run build`
2. Run `node scripts/check-bundle-size.mjs`
3. Compare against limits

**Limits:**
| Bundle | Limit |
|--------|-------|
| `dist/voidframe.es.js` | 170 KB gzip |
| `dist/voidframe-charts.es.js` | 40 KB gzip |
| `dist/voidframe-dev.es.js` | 10 KB gzip |
| `dist/styles.css` | 40 KB gzip |

**If size exceeds limits:**
1. Identify largest additions via bundle analyzer
2. Move heavy components to `./lazy` entry point
3. Review CSS for redundant declarations
4. Consider splitting heavy components (Cascader, Transfer)

**Tree-shaking verification:**
- Create minimal app importing only `Button` — verify new components NOT in output
- Import `Transfer` alone — verify only Transfer + dependencies included

**Acceptance criteria:**
- All bundles under defined limits
- New code is tree-shakeable

---

## 7.5 Documentation Completeness Audit

**Goal:** Every new export documented, categorized, and has examples.

**Process:** Cross-reference `src/index.ts` exports against `docs/taxonomy.ts`.

**Per-component checklist:**
- [ ] Listed in `docs/taxonomy.ts` with correct category
- [ ] Listed in `docs/scope.ts`
- [ ] Has curated example in docs
- [ ] Props table auto-generated
- [ ] Interactive example functional
- [ ] Related components listed
- [ ] VSCode snippets generated

**Per-hook/utility checklist:**
- [ ] Listed in docs
- [ ] API signature documented
- [ ] Usage examples provided
- [ ] Return type documented

**Verification commands:**
```bash
npm run extract-props
npm run generate-vscode-snippets
npm run docs:build
```

**Acceptance criteria:**
- Every new export in docs
- Props tables generated
- Docs site builds without errors
- No broken internal links

---

## 7.6 Convention Compliance Review

**Goal:** All new code follows CONVENTIONS.md.

**Naming conventions:**
- [ ] File: PascalCase.tsx for components, camelCase.ts for hooks/utils
- [ ] CSS: `.vf-{kebab-case}`, BEM elements `__element`, modifiers `--modifier`
- [ ] Test: `{Name}.test.tsx` in `__tests__/`

**Component structure:**
- [ ] `forwardRef` + `displayName` on every component
- [ ] `cx()` for class composition
- [ ] `useControllableState` for controlled/uncontrolled
- [ ] `onValueChange` (primary), `onChange` (secondary)
- [ ] `onOpenChange` for open/close state

**CSS conventions:**
- [ ] Uses `var(--vf-*)` for all colors/spacing/typography
- [ ] No hardcoded values
- [ ] Density-responsive spacing
- [ ] Logical properties for inline direction
- [ ] Respects `prefers-reduced-motion`

**Hook conventions:**
- [ ] SSR-safe defaults
- [ ] Cleanup on unmount
- [ ] `useIsomorphicLayoutEffect` instead of `useLayoutEffect`
- [ ] `useEvent` for stable callbacks

---

## 7.7 Cross-Phase Integration Testing

**Goal:** Verify additions from different phases work together.

**Scenarios:**

1. **Component + Hook:** Transfer using `useList` for item management
2. **Component + Styling:** Badge with new opacity token variants
3. **Component + Utility:** Popconfirm using `composeEventHandlers`
4. **Hook + Theme:** `useDocumentTitle` with theme name from `useThemeScope`
5. **Patterns + New Components:** Dashboard pattern using NumberStepper, Badge, ToggleGroup
6. **Full Theme Test:** Every new component in all 4 themes x 3 densities x 2 contrast modes

**Acceptance criteria:**
- All integration scenarios render without errors
- Theme tokens apply consistently
- Density/contrast modes affect new components correctly

---

## 7.8 Performance Spot Check

**Goal:** No performance regressions.

**Checks:**
1. **Render performance:** Transfer, Cascader with 1000+ items — no unnecessary re-renders
2. **Bundle impact:** Before/after size comparison
3. **CSS specificity:** No `!important` in new CSS (except print styles)
4. **Memory leaks:** useWebSocket, useEventSource clean up on unmount
5. **Animation performance:** New transitions use `transform`/`opacity` only (GPU-accelerated)

---

## 7.9 Security Review

**Goal:** No new security vulnerabilities.

**Checklist:**
- [ ] No unsanitized HTML rendering
- [ ] User URLs pass through `safeHref()` / `safeHrefOrWarn()`
- [ ] Cookie utility uses secure defaults (SameSite, Secure)
- [ ] `parseColor()` doesn't evaluate arbitrary strings
- [ ] Form validation adapters don't execute schema code unsafely
- [ ] No eval-like patterns in any new code
- [ ] WebSocket hook handles URL redirects safely
- [ ] Clipboard hook handles permission denial gracefully
- [ ] Event handlers don't expose internal state globally

---

## 7.10 Final Checklist

**Before merging, ALL must be true:**

### Tests
- [ ] `vitest run` — all tests pass (existing + new)
- [ ] `vitest run --coverage` — 100% coverage on all new files
- [ ] `vitest run src/components/__tests__/a11yAxe.test.tsx` — zero violations
- [ ] `test:types` — type contract tests pass
- [ ] `test:ssr` — SSR smoke tests pass for new components

### Build
- [ ] `tsc --noEmit` — zero TypeScript errors
- [ ] `vite build` — builds successfully
- [ ] Bundle sizes within limits
- [ ] Tree-shaking verified

### Quality
- [ ] Zero `any` in public API
- [ ] Zero hardcoded values in new CSS
- [ ] Zero a11y violations
- [ ] All keyboard interactions functional
- [ ] ARIA roles/attributes correct
- [ ] Convention compliance verified
- [ ] No security vulnerabilities

### Documentation
- [ ] All new exports in docs taxonomy/scope
- [ ] Props tables generated
- [ ] Docs site builds
- [ ] Pattern library examples render
- [ ] VSCode snippets regenerated
- [ ] Changelog updated

### Integration
- [ ] Cross-phase scenarios verified
- [ ] All 4 themes tested
- [ ] Density modes verified
- [ ] High contrast mode verified
- [ ] RTL direction verified
- [ ] Reduced motion respected

---

## Execution Order

Execute in this order — earlier checks catch issues that would cascade to later checks:

1. **7.1 Coverage audit** — find untested code first
2. **7.3 Type safety** — catch type issues before runtime
3. **7.2 Accessibility audit** — verify a11y compliance
4. **7.4 Bundle size** — verify build output
5. **7.6 Convention compliance** — code quality
6. **7.5 Documentation completeness** — docs audit
7. **7.7 Integration testing** — cross-phase verification
8. **7.8 Performance** — spot-check
9. **7.9 Security** — security review
10. **7.10 Final checklist** — comprehensive sign-off

**If any check fails:** Fix in the originating phase, re-run the failed check, continue. Do not merge until all checks pass.
