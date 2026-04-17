# Phase 5: Testing & Developer Experience Infrastructure

## Context

Voidframe has a solid testing foundation: vitest with happy-dom, `renderWithTheme()` wrapper, `expectNoA11yViolations()` via jest-axe, `installMatchMedia()` and `createMockStorage()` mock utilities, and 228 test files. However, current coverage is only ~2% (likely due to report configuration), there's no visual regression testing, no SSR integration tests beyond a single file, no automated bundle size tracking, and no type contract testing. This phase builds the testing and DX infrastructure needed to maintain quality as the library grows.

**Test requirement:** All new testing infrastructure must itself be tested. Meta-tests validate that test utilities, generators, and configuration work correctly.

---

## 5.1 Coverage Configuration Fix & Enforcement

**Files to modify:**
- `vite.config.ts` — fix coverage configuration
- `package.json` — add coverage scripts

**Description:** The current coverage report shows ~2% but the library has 228 test files — the configuration is likely including source files that shouldn't be measured or excluding test files incorrectly. Fix coverage config and raise thresholds for new code.

**Implementation:**
1. Audit the `coverage.exclude` array in vite.config.ts — ensure it excludes:
   - `**/node_modules/**`, `**/dist/**`, `**/__tests__/**`, `**/test/**`
   - `**/docs/**`, `**/tools/**`, `**/scripts/**`, `**/*.d.ts`
   - `src/dev/**` (dev tools are optional), `src/lazy.ts` (just React.lazy wrappers)
2. Verify `coverage.include` targets only source files: `["src/**/*.{ts,tsx}"]`
3. Add threshold configuration and coverage scripts

**Test plan:**
1. `vitest run --coverage` produces accurate report (>50% for well-tested areas)
2. Coverage excludes non-source files (dist, docs, tools, scripts)
3. Coverage includes all src/ files that should be measured
4. HTML coverage report generates in coverage/ directory
5. Threshold enforcement fails build when coverage drops below configured limits

---

## 5.2 Component Test Generator CLI

**Files to create:**
- `tools/cli/commands/test.ts`
- `tools/cli/__tests__/test.test.ts`
- `tools/cli/templates/component-test.ts.hbs`
- `tools/cli/templates/hook-test.ts.hbs`
- `tools/cli/templates/utility-test.ts.hbs`

**Description:** Add a `voidframe test <ComponentName>` CLI command that scaffolds a test file for an existing component, hook, or utility. Reads the component's props via `react-docgen-typescript` (already a dev dependency) and generates test stubs for rendering, interactions, variants, controlled/uncontrolled, and a11y.

**API:**
```bash
voidframe test Button                    # component test scaffold
voidframe test useToggle --type hook     # hook test scaffold
voidframe test cx --type util            # utility test scaffold
voidframe test Button --force            # overwrite existing
```

**Generated test structure (component):**
- Import block (vitest, testing-library, userEvent, renderWithTheme, axe)
- Basic render test
- `it.each` for variant and size props (if detected)
- Controlled/uncontrolled describe blocks (if value/defaultValue props detected)
- Keyboard interaction describe block (if interactive)
- a11y violation test

**Implementation notes:**
- Detect variant/size props and generate `it.each` blocks
- Detect `value`/`defaultValue` props for controlled/uncontrolled stubs
- Detect `onClick`/`onChange` for interaction test stubs
- Do not overwrite existing test files unless `--force`

**Test plan (test.test.ts):**
1. Generates component test file at correct path
2. Generated file imports correct component
3. Generated file includes renderWithTheme import
4. Generated file includes a11y test stub
5. Variant `it.each` generated when component has variant prop
6. Size `it.each` generated when component has size prop
7. Controlled/uncontrolled describe blocks for controllable components
8. Hook test template uses renderHook
9. Utility test template uses plain function assertions
10. Does not overwrite without `--force`
11. `--force` overwrites existing file
12. Error when component not found

---

## 5.3 Visual Regression Testing Setup

**Files to create:**
- `test/visual/setup.ts` — Playwright test config
- `test/visual/components.spec.ts` — component screenshot tests
- `test/visual/themes.spec.ts` — theme comparison tests
- `test/visual/__snapshots__/` — baseline screenshot directory
- `playwright.config.ts` — Playwright configuration

**Description:** Set up Playwright-based visual regression testing. Each test renders a component in the docs site dev server, takes a screenshot, and compares against a baseline. Catches CSS regressions that unit tests miss.

**Configuration:** Playwright with vite dev server as webServer, dark and light color scheme projects, 1280x720 viewport.

**Component coverage for visual tests:**
- Button (all variants, sizes, states)
- Input, Select, Checkbox, Radio, Toggle
- DataGrid (basic rendering)
- Modal, Dialog, Drawer
- Tabs, Accordion
- Menu, Popover, Tooltip
- Toast notifications
- Calendar, DatePicker
- Theme comparison (same component in all 4 themes)
- Density comparison (same component in compact, comfortable, spacious)

**Test plan (meta-tests):**
1. Playwright config loads without errors
2. Dev server starts and serves docs site
3. Screenshot test captures component at correct selector
4. Baseline snapshots created on first run
5. Mismatch detected when component CSS changes
6. Theme project renders in correct color scheme
7. Update command regenerates baselines

---

## 5.4 Type Contract Testing

**Files to create:**
- `test/types/exports.test-d.ts`
- `test/types/components.test-d.ts`
- `test/types/hooks.test-d.ts`

**Description:** Use vitest's `expectTypeOf` to verify public API type contracts. Catches accidental type changes that break consumer code without changing behavior.

**Tests cover:**
- All exported components have corresponding Props type exports
- Props types include expected required and optional fields
- Hook return types match documented shapes
- Utility function signatures match documented overloads
- Theme token interface includes all documented token keys
- Generic types (`Responsive<T>`, `Accent`, `Size`) resolve correctly

**Test plan:**
1. ButtonProps has `variant` with correct union type
2. useToggle return type has `on` and `toggle`
3. cx is callable with mixed args and returns string
4. VoidframeTokens has all required token fields (bg0, green, sp1, fontFamily)
5. Responsive<T> resolves to `T | Partial<Record<Breakpoint, T>>`
6. Test fails when a public type accidentally changes

---

## 5.5 SSR Smoke Tests

**Files to create:**
- `test/ssr/renderToString.test.tsx`
- `test/ssr/hydration.test.tsx`

**Description:** Test that all components render to string without errors (for Next.js/Remix SSR) and hydrate without mismatches. Expand the single existing `src/__tests__/ssr.test.tsx` to comprehensive coverage.

**Test approach:**
- Define array of all public components with minimal required props
- For each: `renderToString(wrapper(element))` must not throw and must produce non-empty HTML
- Hydration tests: render server HTML into container, `hydrateRoot`, verify no console.error calls

**Components to test:** All public components across Layout, Text, Form, Data, Navigation, Overlay, Feedback categories. Hooks using browser APIs must return SSR-safe defaults without errors.

**Test plan:**
1. Every public component renders to string without throwing
2. No hydration mismatch warnings for core components
3. Components using browser APIs (portals, media queries) degrade gracefully
4. Hooks return safe defaults in SSR context
5. VoidframeProvider renders correctly server-side
6. Theme-script.js is separate from React (no SSR conflict)

---

## 5.6 Bundle Size Tracking

**Files to create:**
- `scripts/check-bundle-size.mjs`

**Description:** Automated bundle size tracking that fails when size exceeds limits. The package.json already defines size limits (170 KB core, 40 KB charts, 40 KB CSS) — add enforcement.

**Implementation:** Script reads built files, gzips them, compares against limits, exits non-zero on failure. Reports each file's actual vs. allowed size with percentage.

**Size limits:**
- `dist/voidframe.es.js`: 170 KB gzipped
- `dist/voidframe-charts.es.js`: 40 KB gzipped
- `dist/voidframe-dev.es.js`: 10 KB gzipped
- `dist/styles.css`: 40 KB gzipped

**Test plan:**
1. Script correctly reads built files
2. Gzip size calculation is accurate
3. Script exits 0 when all files under limit
4. Script exits 1 when any file exceeds limit
5. Output shows file name, actual size, limit, percentage
6. Missing file is reported as error (build not run)

---

## 5.7 Mock Component Library

**Files to create:**
- `src/testing/mocks.ts`
- `src/testing/__tests__/mocks.test.tsx`

**Description:** Lightweight mock versions of heavy components for consumer tests. Mocks render as simple divs with `data-testid` attributes, allowing consumers to test their own components without loading DataGrid (1,239 LoC), charts (d3), or editors (react-live).

**Components to mock:**
- `DataGrid` — heaviest component
- `Calendar` — complex date logic
- `RichTextEditor`, `MarkdownEditor`, `CodeEditor` — editor dependencies
- `Conversation` — chat system
- Chart components (all) — d3 dependency

**Mock pattern:** Each mock renders a div with `data-testid="vf-mock-{name}"` and data attributes exposing key props (row count, column count, etc.). All have `displayName` set.

**Exported as:**
- Individual named exports (`MockDataGrid`, `MockCalendar`, etc.)
- `mockComponents` object for bulk `vi.mock` override

**Test plan (mocks.test.tsx):**
1. Each mock renders without errors
2. Each mock renders a div with `data-testid`
3. Each mock has `displayName` set
4. Props are accessible via `data-*` attributes
5. `mockComponents` object contains all mocks
6. Mocks can be spread into vi.mock override
7. Mock DataGrid shows row count
8. Mock Calendar renders date prop

---

## Integration with Existing Codebase

**Files to update:**
1. `package.json` — new scripts for all test commands
2. `src/testing/index.ts` — export new testing utilities and mocks
3. `tools/cli/index.ts` — register `test` command
4. `.gitignore` — add `coverage/`, `playwright-report/`, `test-results/`

**New scripts summary:**
```
test, test:watch, test:coverage, test:coverage:report,
test:types, test:ssr, test:visual, test:visual:update,
test:a11y, size, size:check
```

---

## Verification

After implementing all testing infrastructure:
1. `npm run test` — all existing tests pass
2. `npm run test:coverage` — accurate coverage report generated
3. `npm run test:types` — type contract tests pass
4. `npm run test:ssr` — SSR tests pass for all components
5. `npm run test:visual` — visual regression tests capture baselines
6. `npm run size:check` — bundle size within limits
7. `voidframe test Button` — generates test scaffold
8. All new testing utilities exported from `voidframe/testing`
9. Mock components render correctly in consumer test scenarios
