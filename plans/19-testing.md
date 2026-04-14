# 19 — Testing

**Status:** Testing is a **continuous discipline applied in every phase**, not a discrete late-stage phase. This document describes the infrastructure, conventions, and quality gates. Every phase references it.

**Goal:** Every component, hook, and utility ships with tests *in the same commit* as the implementation. Accessibility is verified automatically via axe. Interactive behaviors are tested with Playwright. Visual regression catches unintended changes.

**Depends on:** nothing — infrastructure lands in Phase 1 so subsequent phases can land with tests.
**Effort:** Initial infrastructure: 1-2 days (Phase 1). Per-phase test authoring: rolled into each phase's effort estimate.

## Testing Discipline (non-negotiable)

- **Tests concurrent with code.** A component without tests does not ship. A bug fix without a regression test does not ship.
- **Every phase has a quality gate.** `make test` must pass in Docker before a phase is considered complete. `make check` (tsc) and `make build` must also pass.
- **Minimum coverage per item:**
  - Component: 1 render, 1 prop variation, 1 interaction (if stateful), 1 a11y assertion.
  - Hook: 1 behavior test via `renderHook`.
  - Utility: happy path + edge case + error/empty case.
  - Bug fix: regression test that would have caught the bug.
- **All tests run in Docker.** `make test` is the canonical invocation. No test runner on the host.

## Layers

1. **Unit tests** (Vitest + Testing Library) — render, prop behavior, interaction.
2. **A11y tests** (axe-core) — run on every component test.
3. **Integration tests** (Playwright) — full-flow tests for overlays, navigation, forms.
4. **Visual regression** (Chromatic or Playwright snapshots) — catch visual diffs.
5. **SSR smoke tests** — render-to-string for every component.
6. **Hook tests** (renderHook from RTL).
7. **Utility tests** — pure function input/output.

## Setup

### Dev deps

```
vitest
@testing-library/react
@testing-library/user-event
@testing-library/jest-dom
jest-axe
@axe-core/playwright
playwright
@playwright/experimental-ct-react
@storybook/react-vite
@chromatic-com/storybook
jsdom
happy-dom
```

### `vite.config.ts` test config

```ts
test: {
  globals: true,
  environment: "happy-dom",          // faster than jsdom
  setupFiles: ["./test/setup.ts"],
  coverage: {
    provider: "v8",
    reporter: ["text", "html", "lcov"],
    exclude: ["dist", "demo", "**/*.stories.*", "**/*.test.*"],
  },
}
```

### `test/setup.ts`

```ts
import "@testing-library/jest-dom";
import { toHaveNoViolations } from "jest-axe";
import { expect } from "vitest";

expect.extend(toHaveNoViolations);

// Polyfill ResizeObserver for jsdom
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Polyfill matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
```

### `test/renderWithTheme.tsx`

```tsx
import { render, RenderOptions } from "@testing-library/react";
import { VoidframeProvider } from "../src";

export function renderWithTheme(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, {
    wrapper: ({ children }) => <VoidframeProvider>{children}</VoidframeProvider>,
    ...options,
  });
}
```

---

## Component Test Template

Every component under `src/components/*/` gets `__tests__/ComponentName.test.tsx`:

```tsx
import { renderWithTheme } from "../../../test/renderWithTheme";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Button } from "../Button";

describe("Button", () => {
  it("renders children", () => {
    renderWithTheme(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("fires onClick", async () => {
    const onClick = vi.fn();
    renderWithTheme(<Button onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    renderWithTheme(<Button disabled onClick={onClick}>Click</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each(["default", "ghost", "solid", "accent"])("renders variant %s", (variant) => {
    renderWithTheme(<Button variant={variant as any}>Test</Button>);
    expect(screen.getByRole("button")).toHaveClass(`vf-button--${variant}`);
  });

  it("forwards ref", () => {
    const ref = React.createRef<HTMLButtonElement>();
    renderWithTheme(<Button ref={ref}>X</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("supports asChild", () => {
    renderWithTheme(<Button asChild><a href="/">Link</a></Button>);
    expect(screen.getByRole("link")).toHaveClass("vf-button");
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(<Button>Accessible</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
```

### Coverage checklist per component

- [ ] Renders children / content.
- [ ] Each significant prop changes rendered output.
- [ ] Each event handler is called correctly.
- [ ] Disabled/readOnly/loading states behave correctly.
- [ ] Keyboard navigation works (Tab, Arrow keys, Enter/Space, Escape).
- [ ] Ref forwarding.
- [ ] `asChild` (if supported).
- [ ] Controlled / uncontrolled duality.
- [ ] `className` / `style` pass through.
- [ ] `data-state` attributes set correctly.
- [ ] No a11y violations (axe).
- [ ] SSR: `renderToString` doesn't throw.

---

## Hook Test Template

```tsx
import { renderHook, act } from "@testing-library/react";
import { useToggle } from "../useToggle";

describe("useToggle", () => {
  it("initializes with default value", () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });

  it("toggles value", () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);
  });

  it("sets value", () => {
    const { result } = renderHook(() => useToggle(false));
    act(() => result.current[2](true));
    expect(result.current[0]).toBe(true);
  });
});
```

---

## A11y Testing Strategy

Every component test includes `await axe(container)` assertion.

Global ruleset tightened:

```ts
const axeConfig = {
  rules: {
    "color-contrast": { enabled: true },
    "label": { enabled: true },
    "button-name": { enabled: true },
    // ...
  },
};
```

Serious/critical violations fail the build. Minor violations are reviewed but may be deferred.

Special tests:

- **Keyboard-only flows** for every overlay (user-event keyboard sequences).
- **Focus restoration** — open modal, close, verify trigger focused.
- **ARIA attribute correctness** — `aria-expanded`, `aria-checked`, etc. flip as expected.

---

## Integration Tests (Playwright)

End-to-end tests on the Storybook or docs site to verify real interactions:

- Dropdown: open, navigate items, select, close.
- Combobox: type, filter, select, close.
- Modal: open, tab within, Escape closes, focus returns.
- Drag-drop sortable: keyboard reorder.
- Form: fill all fields, submit, verify.

```ts
// playwright/dropdown.spec.ts
test("dropdown keyboard navigation", async ({ page }) => {
  await page.goto("/storybook?id=dropdown--default");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeHidden();
});
```

### Playwright + axe

```ts
import { injectAxe, checkA11y } from "@axe-core/playwright";

test("a11y: modal", async ({ page }) => {
  await page.goto("/storybook?id=modal--open");
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true },
  });
});
```

---

## Visual Regression

Two options:

### Option A: Chromatic (preferred — SaaS)

- Publishes Storybook to Chromatic.
- Captures baseline screenshots of every story.
- PRs diff against baseline; reviewer approves visual changes.
- Handles cross-browser rendering.
- Has a free tier for OSS.

### Option B: Playwright snapshots (self-hosted)

- `await expect(page).toHaveScreenshot()` in Playwright tests.
- Snapshots checked into repo.
- Use when Chromatic isn't an option.

Chromatic is the default; Playwright snapshots are the fallback.

---

## SSR Tests

```tsx
// test/ssr.test.tsx
import { renderToString } from "react-dom/server";
import * as Voidframe from "../src";

describe("SSR", () => {
  for (const [name, Component] of Object.entries(Voidframe)) {
    if (typeof Component !== "function") continue;
    it(`renders ${name} without throwing`, () => {
      expect(() => renderToString(<Component />)).not.toThrow();
    });
  }
});
```

Components with required props get dedicated tests with sample props.

---

## Utility Tests

```ts
import { formatNumber, truncate, clamp } from "../src/utils";

describe("formatNumber", () => {
  it("formats with thousand separators", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });
  it("respects locale", () => {
    expect(formatNumber(1234.5, { locale: "de-DE" })).toBe("1.234,5");
  });
  it("handles edge cases", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(-1.5)).toBe("-1.5");
    expect(formatNumber(NaN)).toBe("NaN");
  });
});
```

Every utility: ≥3 tests (happy path, edge case, error).

---

## Coverage Targets

| Layer | Target |
|---|---|
| Utilities | 100% branches |
| Hooks | 95% branches |
| Primitives | 95% branches |
| Components — render + primary interactions | 85% |
| Integration (Playwright) | All overlays + navigation |
| A11y | 0 serious/critical violations |
| Visual regression | All components |

Enforce in CI via `vitest --coverage` thresholds.

---

## CI Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  lint:
    steps: [checkout, setup-node, npm ci, npm run lint]
  typecheck:
    steps: [checkout, setup-node, npm ci, npm run typecheck]
  test:
    steps: [checkout, setup-node, npm ci, npm run test -- --coverage]
  ssr:
    steps: [checkout, setup-node, npm ci, npm run test:ssr]
  build:
    steps: [checkout, setup-node, npm ci, npm run build, "bundle size check"]
  a11y:
    steps: [checkout, setup-node, npm ci, npm run test:a11y]
  playwright:
    steps: [checkout, setup-node, npm ci, npm run build:storybook, npx playwright test]
  chromatic:
    steps: [checkout, setup-node, npm ci, npx chromatic]
```

Every PR runs all jobs. Merges blocked on failures.

---

## Test Organization

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.css
│   │   ├── Button.stories.tsx
│   │   └── __tests__/
│   │       └── Button.test.tsx
├── hooks/
│   ├── useToggle.ts
│   └── __tests__/
│       └── useToggle.test.ts
├── utils.ts
└── __tests__/
    └── utils.test.ts
test/
├── setup.ts
├── renderWithTheme.tsx
├── ssr.test.tsx
└── playwright/
    ├── dropdown.spec.ts
    └── ...
```

---

## Acceptance Criteria

- [ ] Every component has a test file.
- [ ] Every hook has a test file.
- [ ] Every utility has a test file.
- [ ] Coverage ≥85% overall, ≥95% for utilities/hooks/primitives.
- [ ] Zero a11y violations at serious/critical severity.
- [ ] SSR tests pass for every exported component.
- [ ] Playwright smoke tests pass for overlays and forms.
- [ ] Chromatic (or Playwright snapshot) baseline established.
- [ ] CI gates all PRs on tests passing.
- [ ] Test utilities (`renderWithTheme`, mock factories) exported for consumers.

## Notes

- **Slow tests kill morale.** Keep unit tests fast (<5s total). Playwright runs only in CI or `npm run test:e2e`.
- **Happy-dom > jsdom** for speed where it works. Fall back to jsdom for edge cases.
- **Don't over-mock.** Test real components, real events. Mocks are for network/timer/storage only.
- **Flaky tests are worse than no tests.** Investigate and fix flakes immediately.
