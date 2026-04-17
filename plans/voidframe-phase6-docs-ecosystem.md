# Phase 6: Documentation & Ecosystem

## Context

Voidframe has a custom Vite-powered interactive docs site, a CONVENTIONS.md, a CLI (init, theme, codemod, doctor), a VS Code extension (snippets, hover docs, playground command), an ESLint plugin, and prop extraction scripts. This phase fills gaps in pattern documentation, design token export, migration guidance, and accessibility audit reporting. The docs site is at `/home/aeryn/code/voidframe/docs/`.

**Test requirement:** All new tooling and scripts get tests with 100% coverage. Documentation content changes get build verification tests (docs site builds successfully, links resolve, examples render).

---

## 6.1 Pattern Library (Composed Page Patterns)

**Files to create:**
- `docs/patterns/index.tsx` — pattern library entry page
- `docs/patterns/LoginForm.tsx`
- `docs/patterns/SettingsPage.tsx`
- `docs/patterns/DashboardLayout.tsx`
- `docs/patterns/DataTablePage.tsx`
- `docs/patterns/ChatInterface.tsx`
- `docs/patterns/EmptyStatePage.tsx`
- `docs/patterns/ErrorPage.tsx`
- `docs/patterns/OnboardingWizard.tsx`
- `docs/patterns/__tests__/patterns.test.tsx`

**Description:** Pre-built page-level composition patterns showing how voidframe components work together. Bridges the gap between individual component docs and real-world page construction. Each pattern is a copy-paste-ready example with source code display.

**Patterns to build:**

### Pattern 1: Login Form
- Components: `Form`, `FormField`, `Input`, `PasswordInput`, `Button`, `Checkbox`, `VStack`, `Text`, `Divider`
- Features: Validation, "remember me" checkbox, forgot password link, social login buttons
- Variants: Simple (email/password), with social, with 2FA code input

### Pattern 2: Settings Page
- Components: `Tabs`, `FormField`, `Input`, `Toggle`, `Select`, `RadioGroup`, `Button`, `Divider`, `VStack`, `HStack`, `Text`, `Avatar`
- Features: Tabbed sections (profile, notifications, security, billing), form save/cancel, avatar upload
- Variants: Single-page, tabbed, sidebar navigation

### Pattern 3: Dashboard Layout
- Components: `AppShell`, `Sidebar`, `Navbar`, `DashboardGrid`, `WidgetShell`, `StatGroup`, `MetricCard`, `Sparkline`, `DataGrid`
- Features: Collapsible sidebar, responsive grid, widget drag-reorder, KPI cards
- Variants: Analytics dashboard, admin overview, monitoring dashboard

### Pattern 4: Data Table Page
- Components: `DataGrid`, `SearchInput`, `Select`, `ButtonGroup`, `Pagination`, `HStack`, `Text`, `Badge`, `Button`, `Modal`
- Features: Search + filter bar, column visibility, export, row actions, bulk actions, delete confirmation
- Variants: Simple list, CRUD table with edit modal, master-detail

### Pattern 5: Chat Interface
- Components: `ChatLayout`, `Conversation`, `MessageList`, `Composer`, `SessionList`, `ModelSelector`
- Features: Message list, input with file attachment, session sidebar, model selection
- Variants: Simple chat, AI assistant with tool calls, customer support

### Pattern 6: Empty State Page
- Components: `EmptyState`, `Button`, `VStack`, `Text`, `Center`
- Features: Icon, title, description, CTA button
- Variants: No data, first-time user, search no results, error state

### Pattern 7: Error Pages
- Components: `Result` (new from Phase 1), `Button`, `VStack`, `Center`
- Features: 404, 403, 500, generic error
- Variants: Full page, inline error, with retry

### Pattern 8: Onboarding Wizard
- Components: `Wizard`, `Stepper`, `Form`, `FormField`, `Input`, `Select`, `Button`, `Progress`
- Features: Multi-step form, step validation, progress indicator, summary review step
- Variants: Account setup, project creation, data import

**Each pattern includes:**
1. Live interactive preview
2. Full source code (copy-paste ready)
3. Component usage notes (which props are critical, what to customize)
4. Responsive behavior demonstration
5. Theme adaptation (shows same pattern in dark/light)

**Documentation page structure:**
```typescript
// docs/patterns/LoginForm.tsx
export default function LoginFormPattern() {
  return (
    <PatternLayout
      title="Login Form"
      description="Authentication form with validation, social login, and 2FA support."
      components={["Form", "FormField", "Input", "PasswordInput", "Button", "Checkbox"]}
    >
      <PatternPreview>
        <LoginFormExample />
      </PatternPreview>
      <PatternSource code={loginFormSource} />
      <PatternVariants>
        <Variant name="Simple" component={<SimpleLogin />} />
        <Variant name="With Social" component={<SocialLogin />} />
        <Variant name="With 2FA" component={<TwoFactorLogin />} />
      </PatternVariants>
    </PatternLayout>
  );
}
```

### Pattern 9: TOTP / Two-Factor Authentication Flow
- Components: `PinInput`, `Countdown`, `QRCode`, `Button`, `VStack`, `Text`, `Stepper`
- Features: QR code display for authenticator app setup, 6-digit TOTP code entry with auto-submit, countdown timer showing code expiry (30s), backup codes display, recovery flow
- Variants: Setup flow (QR + manual key + verify), Login verification (code entry only), Recovery (backup code entry)

### Pattern 10: AI Training Dashboard
- Components: `LineChart`, `Progress`, `MetricCard`, `StatGroup`, `DataGrid`, `Tabs`, `WidgetShell`, `Sparkline`, `MultiProgress` (new)
- Features: Training loss/accuracy curves over epochs, batch progress bars, hyperparameter display, metric comparison table, eval results
- Variants: Single run monitoring, multi-run comparison, fine-tune progress

**Test plan (patterns.test.tsx):**
1. Each pattern renders without errors
2. Each pattern renders within VoidframeProvider
3. Each pattern variant renders without errors
4. Pattern source code is non-empty string
5. Pattern components list is accurate
6. Patterns render correctly in dark and light themes
7. Patterns render correctly in compact and spacious density
8. Interactive elements in patterns respond to clicks

---

## 6.2 Design Token Export (Style Dictionary / Figma)

**Files to create:**
- `scripts/export-tokens.mjs`
- `scripts/__tests__/export-tokens.test.ts`
- `dist/tokens/tokens.json` (generated)
- `dist/tokens/tokens.css` (generated, alternative to importing from package)
- `dist/tokens/tokens.scss` (generated, for Sass users)
- `dist/tokens/figma-variables.json` (generated, Figma Variables API format)

**Description:** Export voidframe design tokens in multiple formats for consumption by design tools (Figma), preprocessors (Sass), and other platforms. Bridges the design-developer gap by making tokens available outside of React.

**Export formats:**

### JSON (Style Dictionary compatible)
```json
{
  "color": {
    "bg": {
      "0": { "value": "#050505", "type": "color" },
      "1": { "value": "#0a0a0a", "type": "color" }
    },
    "accent": {
      "green": { "value": "#4ade80", "type": "color" }
    }
  },
  "spacing": {
    "1": { "value": "2px", "type": "dimension" },
    "2": { "value": "4px", "type": "dimension" }
  },
  "typography": {
    "fontFamily": { "value": "'Courier New', 'Courier', 'Liberation Mono', monospace", "type": "fontFamily" }
  }
}
```

### SCSS Variables
```scss
$vf-bg-0: #050505;
$vf-bg-1: #0a0a0a;
$vf-green: #4ade80;
$vf-sp-1: 2px;
$vf-sp-2: 4px;
$vf-font-family: 'Courier New', 'Courier', 'Liberation Mono', monospace;
// ... all tokens
```

### Figma Variables API Format
```json
{
  "variableCollections": [{
    "name": "Voidframe Tokens",
    "modes": [
      { "name": "Dark", "modeId": "dark" },
      { "name": "Light", "modeId": "light" },
      { "name": "Midnight", "modeId": "midnight" },
      { "name": "Grey", "modeId": "grey" }
    ],
    "variables": [
      {
        "name": "color/bg/0",
        "resolvedType": "COLOR",
        "valuesByMode": {
          "dark": { "r": 5, "g": 5, "b": 5, "a": 1 },
          "light": { "r": 250, "g": 250, "b": 250, "a": 1 }
        }
      }
    ]
  }]
}
```

**CLI integration:**
```bash
voidframe tokens --format json     # Output tokens.json
voidframe tokens --format scss     # Output tokens.scss
voidframe tokens --format css      # Output tokens.css (standalone, no import needed)
voidframe tokens --format figma    # Output figma-variables.json
voidframe tokens --format all      # Output all formats
voidframe tokens --theme dark      # Specific theme only
voidframe tokens --theme all       # All themes (default)
```

**Test plan (export-tokens.test.ts):**
1. JSON output contains all token categories (color, spacing, typography)
2. JSON values match TypeScript token definitions
3. JSON structure is Style Dictionary compatible (has `value` and `type`)
4. SCSS output contains all tokens as `$vf-*` variables
5. SCSS values match TypeScript definitions
6. CSS output contains all tokens as `--vf-*` properties
7. Figma output contains all variables with correct resolved types
8. Figma output includes all 4 theme modes
9. Each theme produces correct values
10. `--format all` generates all formats
11. `--theme dark` only includes dark theme values
12. Generated files are valid (JSON parses, SCSS compiles)

---

## 6.3 Accessibility Audit Report Page

**Files to create:**
- `docs/a11y/index.tsx` — accessibility audit page
- `docs/a11y/AuditTable.tsx` — component audit table
- `scripts/generate-a11y-report.mjs`
- `scripts/__tests__/generate-a11y-report.test.ts`
- `docs/a11y/data/audit-results.json` (generated)

**Description:** Public-facing accessibility audit page in the docs site showing WCAG compliance per component. Generated from the jest-axe test results and manual audit data.

**Audit report structure:**
```typescript
interface ComponentAudit {
  name: string;
  category: string;
  wcagLevel: "A" | "AA" | "AAA" | "untested";
  axeViolations: number;
  keyboardNav: "full" | "partial" | "none" | "n/a";
  screenReader: "tested" | "untested";
  ariaRoles: string[];                 // roles used
  focusManagement: "trapped" | "scoped" | "natural" | "n/a";
  notes?: string;
}
```

**Page sections:**
1. **Summary stats** — % components at AA level, total violations, coverage
2. **Component table** — sortable/filterable table of all components with audit status
3. **WCAG criterion checklist** — which WCAG 2.1 criteria are met globally
4. **Known issues** — documented accessibility gaps with workarounds
5. **Testing methodology** — how tests are run (jest-axe, manual, screen reader)

**Generation script:** Runs jest-axe tests, collects results, merges with manual audit data, outputs JSON consumed by docs page.

**Test plan:**
1. Generation script produces valid JSON
2. JSON includes all public components
3. Each component has wcagLevel, keyboardNav, screenReader fields
4. Audit page renders table with all components
5. Table is sortable by compliance level
6. Summary stats calculate correctly from data
7. No components are missing from the audit
8. Script exits non-zero if axe tests fail

---

## 6.4 Migration Guide Framework

**Files to create:**
- `docs/migration/index.tsx` — migration guides hub
- `docs/migration/MigrationGuide.tsx` — reusable guide component
- `docs/migration/v1-to-v2.tsx` — placeholder for future v2 migration
- `MIGRATION.md` — root-level migration document

**Description:** Framework for versioned migration guides. Not immediately needed at v1.0, but the infrastructure should exist before v2 so it's ready when breaking changes are introduced.

**Migration guide component:**
```typescript
interface MigrationGuideProps {
  fromVersion: string;
  toVersion: string;
  breakingChanges: BreakingChange[];
  deprecations: Deprecation[];
  newFeatures: string[];
  codemods?: CodemodInfo[];            // Available codemods for automated migration
}

interface BreakingChange {
  component: string;
  description: string;
  before: string;                      // code example
  after: string;                       // code example
  codemod?: string;                    // codemod name if available
}
```

**Page features:**
- Before/after code comparison for each breaking change
- "Run codemod" button linking to `voidframe codemod` command
- Search/filter by component name
- Severity indicators (breaking, deprecation, enhancement)

**Test plan:**
1. Migration guide component renders with sample data
2. Before/after code blocks display correctly
3. Breaking changes list renders all items
4. Deprecation list renders all items
5. Codemod link renders when codemod is available
6. Search filters changes by component name

---

## 6.5 Expanded Component Documentation

**Files to modify:**
- `docs/curated.tsx` — add missing component examples
- `docs/taxonomy.ts` — ensure all components categorized
- `docs/scope.ts` — ensure all exports listed

**Description:** Audit the docs site to ensure every public component has:
1. A curated example in the docs
2. A props table (auto-generated via extract-props.mjs)
3. At least one interactive example
4. Usage notes for common patterns
5. Related components list

**Audit process:**
1. Compare `src/index.ts` exports against `docs/taxonomy.ts` entries
2. For each missing component, add to taxonomy and create curated example
3. Verify `scripts/extract-props.mjs` extracts props for all components
4. Add "Related components" section linking similar components

**Components most likely missing from docs:**
- New Phase 1 components (Transfer, Popconfirm, SplitButton, etc.)
- Recently added components that may have been missed
- Compound sub-components (Menu.Item, Dialog.Content, etc.)
- Utility components (VisuallyHidden, Portal, Presence)

**Test plan:**
1. Every export from `src/index.ts` has an entry in `docs/taxonomy.ts`
2. Every entry in taxonomy has a curated example
3. Props extraction script produces data for all components
4. Docs site builds without errors after additions
5. All internal links resolve (no broken links)
6. Interactive examples render and respond to interaction

---

## 6.6 Changelog Automation

**Files to modify:**
- `scripts/generate-changelog.mjs` — verify and enhance
- `package.json` — add changelog script

**Description:** The changelog generation script exists but may not be automated. Verify it works, enhance it to categorize changes (breaking, features, fixes, docs), and integrate with release workflow.

**Enhanced changelog format:**
```markdown
## [1.1.0] - 2026-05-01

### Breaking Changes
- `DataGrid`: `onSort` callback now receives `SortDescriptor` instead of plain string (#123)

### New Components
- `Transfer` — Dual-list component for moving items between panels
- `Popconfirm` — Lightweight inline confirmation popover

### New Hooks
- `useDocumentTitle` — Dynamic document title management
- `useUndoRedo` — State with undo/redo history

### Enhancements
- `Button`: Added `solid` variant (#456)
- `Select`: Support for option groups (#789)

### Bug Fixes
- Fixed `DatePicker` not respecting `disabledDates` in range mode (#234)

### Internal
- Upgraded vitest to 2.x
- Added visual regression tests
```

**Categorization rules:**
- Commits starting with `feat:` → New Components or Enhancements
- Commits starting with `fix:` → Bug Fixes
- Commits starting with `BREAKING:` → Breaking Changes
- Commits starting with `docs:` → Documentation (excluded from user changelog)
- Commits starting with `chore:` / `refactor:` → Internal

**Test plan:**
1. Script generates valid Markdown
2. Commits are categorized correctly by prefix
3. Breaking changes appear in dedicated section
4. PR/issue numbers are linked as markdown
5. Version header includes date
6. Script handles repositories with no tags gracefully
7. Script excludes merge commits and internal changes

---

## 6.7 ESLint Plugin Enhancement

**Files to modify:**
- `tools/eslint-plugin-voidframe/` — add new rules

**Description:** Enhance the ESLint plugin with rules that catch common mistakes when using voidframe components.

**New rules:**

### `voidframe/no-inline-theme-tokens`
Warns when hardcoded color/spacing values are used instead of voidframe tokens.
```typescript
// Bad
<div style={{ color: "#4ade80" }}>
// Good
<div style={{ color: tokens.green }}>
```

### `voidframe/prefer-semantic-color`
Warns when using raw accent colors where semantic colors are more appropriate.
```typescript
// Bad
<Tag color="green">Success</Tag>
// Good
<Tag color="success">Success</Tag>
```

### `voidframe/require-a11y-label`
Warns when interactive components lack accessible labels.
```typescript
// Bad
<IconButton onClick={handleClose}><CloseIcon /></IconButton>
// Good
<IconButton onClick={handleClose} aria-label="Close"><CloseIcon /></IconButton>
```

### `voidframe/no-deprecated-props`
Errors when using deprecated props that have been renamed or removed.

### `voidframe/prefer-compound-pattern`
Suggests compound component pattern when using primitive overlay components.
```typescript
// Suggests
<Dialog> instead of <Modal> for complex modals
<DrawerV2> instead of <Drawer> for new code
<PopoverV2> instead of <Popover> for new code
```

**Test plan (for each rule):**
1. Rule flags incorrect usage
2. Rule does not flag correct usage
3. Rule provides helpful error message with fix suggestion
4. Rule has `--fix` auto-fix where applicable
5. Rule handles edge cases (dynamic values, spread props)
6. Rule works with TypeScript files

---

## 6.8 VS Code Extension Enhancement

**Files to modify:**
- `tools/vscode-voidframe/` — add new features

**Description:** Enhance the VS Code extension with additional developer experience features.

**New features:**

### Component Import Autocomplete
- When typing a voidframe component name, suggest auto-import from `"voidframe"`
- Trigger on PascalCase identifiers matching known component names

### Token Color Previews
- Show color swatches inline for `--vf-*` CSS custom properties
- Show color preview for token references in TypeScript (`tokens.green`, `tokens.bg0`)

### Diagnostic Warnings
- Warn when using deprecated components (mirror eslint-plugin rules)
- Warn when a component is imported but not from the correct entry point

### "Go to Component Docs" Command
- Right-click a voidframe component → "Open Voidframe Docs"
- Opens the docs site page for that component in the browser

**Test plan:**
1. Snippets generate correct component markup
2. Hover docs display correct prop information
3. Color previews show for CSS custom properties
4. "Open Docs" command constructs correct URL
5. Extension activates on `.tsx` and `.css` files in projects with voidframe dependency

---

## Integration with Existing Codebase

**Files to update:**
1. `docs/App.tsx` — add routes for patterns, a11y audit, migration pages
2. `docs/taxonomy.ts` — add all new components and patterns
3. `docs/scope.ts` — verify all exports listed
4. `tools/cli/index.ts` — add `tokens` command
5. `package.json` — add docs and token export scripts

**New scripts:**
```json
{
  "docs": "npm run extract-props && vite serve docs",
  "docs:build": "npm run extract-props && vite build docs",
  "tokens:export": "node scripts/export-tokens.mjs --format all",
  "changelog": "node scripts/generate-changelog.mjs",
  "a11y:report": "node scripts/generate-a11y-report.mjs"
}
```

---

## Verification

After implementing all documentation and ecosystem changes:
1. `npm run docs:build` — docs site builds without errors
2. All pattern examples render correctly
3. Token export produces valid JSON, SCSS, CSS, Figma formats
4. A11y audit page shows data for all components
5. Changelog script generates accurate categorized changelog
6. ESLint plugin rules pass their test suites
7. VS Code extension installs and activates without errors
8. Every public component is represented in docs taxonomy
9. Migration guide framework renders sample content correctly
10. `voidframe tokens --format all` generates all token formats
