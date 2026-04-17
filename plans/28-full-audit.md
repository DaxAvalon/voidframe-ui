# Full Audit — Findings & Fix Plan

**Date**: 2026-04-15
**Scope**: 8 parallel audits — CI/CD, completeness, functionality, testing, security, design/UX, performance, API consistency
**Raw reports**: `plans/agent-reports/28-*.md`

---

## Findings Summary

| Audit | Critical | High | Medium | Low |
|-------|----------|------|--------|-----|
| CI/CD | 3 | 3 | 3 | 3 |
| Completeness | 0 | 0 | 0 | 0 |
| Functionality | 2 | 2 | 1 | 0 |
| Testing | 0 | 3 | 2 | 0 |
| Security | 0 | 0 | 1 | 0 |
| Design/UX | 2 | 0 | 4 | 0 |
| Performance | 0 | 0 | 2 | 1 |
| API Consistency | 0 | 2 | 2 | 0 |
| **Total** | **7** | **10** | **15** | **4** |

---

## All Findings by Severity

### Critical (7)

| # | Audit | Finding | File(s) |
|---|-------|---------|---------|
| C1 | CI/CD | GitHub Actions syntax in Forgejo workflow | `.forgejo/workflows/ci.yml` |
| C2 | CI/CD | Artifact upload 500 errors (storage not configured) | `.forgejo/workflows/ci.yml:60-82` |
| C3 | CI/CD | No npm publish step in release job | `.forgejo/workflows/ci.yml:84-128` |
| C4 | Functionality | MessageFeedback `aria-checked` hardcoded to "false" | `src/components/Chat/Reactions.tsx:87` |
| C5 | Functionality | MessageFeedback selection state never tracked | `src/components/Chat/Reactions.tsx:24` |
| C6 | Design | 900+ hardcoded px spacing values (density won't work) | All CSS component files |
| C7 | Design | Non-zero border-radius violations (toast 2px, shimmer 4px) | `src/css/components/feedback-overlays.css:105,514` |

### High (10)

| # | Audit | Finding | File(s) |
|---|-------|---------|---------|
| H1 | CI/CD | Linting not enforced in CI | `.forgejo/workflows/ci.yml` |
| H2 | CI/CD | No branch protection rules | Forgejo repo settings |
| H3 | CI/CD | Size-limit not checked in CI | `.forgejo/workflows/ci.yml` |
| H4 | Functionality | DataGrid `onGroupByChange` declared but never called | `src/components/DataGrid.tsx:90` |
| H5 | Functionality | DataGrid collapsed groups persist on groupBy change | `src/components/DataGrid.tsx:284,358-365` |
| H6 | Testing | Hooks 35% tested (14/40) | `src/hooks/` |
| H7 | Testing | 19 components untested (Carousel, Kanban, Accordion, etc.) | `src/components/` |
| H8 | Testing | 5 Viewer components have no individual tests | `src/components/Viewers/` |
| H9 | API | `onValueChange` incomplete (SearchInput, PasswordInput, etc.) | `src/components/Form.tsx` |
| H10 | API | `readOnly` prop not standardized across form controls | Multiple form components |

### Medium (15)

| # | Audit | Finding | File(s) |
|---|-------|---------|---------|
| M1 | CI/CD | Coverage reports inaccessible (artifact upload fails) | `.forgejo/workflows/ci.yml` |
| M2 | CI/CD | Container image mismatch (act-latest vs Forgejo) | `.forgejo/workflows/ci.yml:20,90` |
| M3 | CI/CD | Unused CI scripts (test:ssr, test:a11y, size, lint, etc.) | `package.json` |
| M4 | Functionality | DataGrid virtualization silently disabled with grouping | `src/components/DataGrid.tsx:1003` |
| M5 | Security | deepMerge prototype pollution (no __proto__ filter) | `src/utils/formatters.ts:113-131` |
| M6 | Design | Density only implemented in charts.css (31+ files miss it) | `src/css/components/` |
| M7 | Design | Spinner animation policy violations (bounce, bar, pulse) | `src/css/components/feedback-overlays.css` |
| M8 | Design | Scattered z-index (8 hardcoded vs 22 tokenized) | `src/css/` |
| M9 | Design | Fallback hex colors in var() defaults (12 instances) | `src/css/components/feedback-overlays.css` |
| M10 | Performance | DataGrid O(n^2) column ordering | `src/components/DataGrid.tsx:296` |
| M11 | Performance | DataGrid reorder indexOf O(n) per drag | `src/components/DataGrid.tsx:328-329` |
| M12 | Testing | No compound component integration tests | N/A |
| M13 | Testing | Weak tests (Print, Lightbox) | `src/components/__tests__/` |
| M14 | API | Compound pattern inconsistency (Tabs flat, others dot notation) | `src/components/` |
| M15 | API | variant vs tone naming convention undocumented | Multiple components |

### Low (4)

| # | Audit | Finding | File(s) |
|---|-------|---------|---------|
| L1 | CI/CD | No automated changelog | `CHANGELOG.md` |
| L2 | CI/CD | No security scanning (npm audit skipped) | `.forgejo/workflows/ci.yml` |
| L3 | CI/CD | Dual type declaration emission | `package.json`, `vite.config.ts` |
| L4 | Performance | Icon spread export (entire set bundled) | `src/icons/index.ts:16` |

---

## Fix Phases

### Phase 50 — CI/CD Hardening

**Fixes**: C1, C2, C3, H1, H2, H3, M1, M2, M3, L1, L2, L3

| Task | Findings |
|------|----------|
| Fix artifact upload — either configure Forgejo storage, switch to `run:` step saving to repo/external storage, or remove upload steps | C2, M1 |
| Add npm publish to release job with NPM_TOKEN secret | C3 |
| Verify Forgejo compatibility of all action references; replace with `run:` steps if needed | C1, M2 |
| Add `npm run lint:voidframe` step to CI | H1 |
| Add `npm run size` step after build | H3 |
| Add `npm run test:ssr` and `npm run test:a11y` to CI test suite | M3 |
| Add `npm run pack:check` to release validation | M3 |
| Add `npm audit --audit-level=moderate` step | L2 |
| Document branch protection setup for Forgejo | H2 |
| Clarify type declaration strategy (tsc vs vite-plugin-dts) | L3 |

**Estimate**: ~200 LOC changes, 1-2 working days

### Phase 51 — Component Bugfixes

**Fixes**: C4, C5, H4, H5, M4, M5, M10, M11

| Task | Findings |
|------|----------|
| Fix MessageFeedback: add selected state tracking, wire `aria-checked` dynamically | C4, C5 |
| Fix DataGrid: implement `onGroupByChange` callback, reset `collapsedGroups` on groupBy change | H4, H5 |
| Fix DataGrid: add dev warning when virtualization disabled by grouping | M4 |
| Fix deepMerge: add `__proto__`/`constructor`/`prototype` key filtering | M5 |
| Fix DataGrid column ordering: convert `order` to Set for O(1) lookup | M10, M11 |

**Estimate**: ~150 LOC changes + ~100 LOC tests, 1 working day

### Phase 52 — CSS Token Migration

**Fixes**: C6, C7, M6, M7, M8, M9

| Task | Findings |
|------|----------|
| Audit all hardcoded px values in CSS and convert to `var(--vf-sp-*)` tokens where appropriate | C6, M6 |
| Remove non-zero border-radius from toast and shimmer (or document as intentional exceptions) | C7 |
| Replace hardcoded z-index values with `--vf-z-*` tokens; add new tokens as needed | M8 |
| Replace fallback hex colors with proper token defaults | M9 |
| Document spinner animations as intentional exceptions to no-animation policy (they're loading indicators, not decorative) | M7 |

**Estimate**: ~500 LOC CSS changes, 3-4 working days (mostly mechanical but needs care)

### Phase 53 — Test Coverage Sweep

**Fixes**: H6, H7, H8, M12, M13

| Task | Findings |
|------|----------|
| Add tests for all 26 untested hooks | H6 |
| Add tests for 19 untested components (Carousel, Kanban, Accordion, Calendar, etc.) | H7 |
| Add individual tests for CodeBlock, DiffViewer, JSONViewer, LogViewer, MarkdownRenderer | H8 |
| Add compound component integration tests (Form + FormProvider, DataGrid + Dialog) | M12 |
| Strengthen Print and Lightbox tests | M13 |

**Estimate**: ~1200 LOC tests, 4-5 working days

### Phase 54 — API Consistency

**Fixes**: H9, H10, M14, M15

| Task | Findings |
|------|----------|
| Add `onValueChange` to SearchInput, PasswordInput, MaskedInput, CurrencyInput, PhoneInput | H9 |
| Add `readOnly` prop to all form controls (Input, Textarea, Select, Combobox, Checkbox, Radio, Toggle, Slider, etc.) | H10 |
| Document compound component convention (dot notation vs flat) | M14 |
| Document variant/tone naming convention | M15 |

**Estimate**: ~300 LOC changes + ~200 LOC tests, 2 working days

---

## Phase Execution Order

1. **Phase 51** (bugfixes) — highest user-visible impact, smallest scope
2. **Phase 50** (CI/CD) — unblocks quality gates for all subsequent work
3. **Phase 52** (CSS tokens) — large mechanical change, best done before more tests lock in current behavior
4. **Phase 53** (tests) — covers both old and new code after CSS migration
5. **Phase 54** (API) — API changes may require test updates, do last

## Out of Scope

- Automated changelog generation (L1) — optional, can adopt conventional commits later
- Icon tree-shaking optimization (L4) — low impact, icons are small
- Canvas rendering for charts >3000 points — future optimization
- Tabs compound component refactor — documented for v2 consideration
