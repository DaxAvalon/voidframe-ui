// tools/cli/commands/test.mjs
// Generate test scaffold for a voidframe component, hook, or utility.

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { resolve, join } from "path";

/**
 * @param {string} name - Component/hook/utility name
 * @param {{ type?: "component" | "hook" | "util", force?: boolean }} options
 */
export function generateTest(name, options = {}) {
  const type = options.type ?? "component";

  let sourcePath, testDir, testPath, template;

  if (type === "component") {
    sourcePath = resolve("src/components", `${name}.tsx`);
    testDir = resolve("src/components/__tests__");
    testPath = join(testDir, `${name}.test.tsx`);
    template = componentTemplate(name);
  } else if (type === "hook") {
    sourcePath = resolve("src/hooks", `${name}.ts`);
    testDir = resolve("src/hooks/__tests__");
    testPath = join(testDir, `${name}.test.ts`);
    template = hookTemplate(name);
  } else if (type === "util") {
    sourcePath = resolve("src/utils", `${name}.ts`);
    testDir = resolve("src/utils/__tests__");
    testPath = join(testDir, `${name}.test.ts`);
    template = utilTemplate(name);
  } else {
    throw new Error(`Unknown type: ${type}. Use "component", "hook", or "util".`);
  }

  if (!existsSync(sourcePath)) {
    throw new Error(`Source file not found: ${sourcePath}`);
  }

  if (existsSync(testPath) && !options.force) {
    throw new Error(`Test file already exists: ${testPath}. Use --force to overwrite.`);
  }

  // Read source to detect props
  const source = readFileSync(sourcePath, "utf-8");

  // Detect variant/size props for component templates
  if (type === "component") {
    const hasVariant = /variant\??\s*:\s*["']/.test(source) || /variant\??\s*:/.test(source);
    const hasSize = /size\??\s*:\s*["']/.test(source) || /size\??\s*:/.test(source);
    const hasValue = /\bvalue\??\s*:/.test(source) && /\bdefaultValue\??\s*:/.test(source);
    template = componentTemplate(name, { hasVariant, hasSize, hasValue });
  }

  mkdirSync(testDir, { recursive: true });
  writeFileSync(testPath, template, "utf-8");

  return { testPath, type, name };
}

function componentTemplate(name, detection = {}) {
  const { hasVariant, hasSize, hasValue } = detection;

  let tests = `
  it("renders without crashing", () => {
    renderWithTheme(<${name} />);
    // TODO: Add assertion
  });`;

  if (hasVariant) {
    tests += `

  it.each(["default", "ghost", "accent"] as const)("renders variant %s", (variant) => {
    renderWithTheme(<${name} variant={variant} />);
    // TODO: Add assertion
  });`;
  }

  if (hasSize) {
    tests += `

  it.each(["sm", "md", "lg"] as const)("renders size %s", (size) => {
    renderWithTheme(<${name} size={size} />);
    // TODO: Add assertion
  });`;
  }

  if (hasValue) {
    tests += `

  describe("controlled", () => {
    it("reflects value prop", () => {
      // TODO: Implement controlled test
    });

    it("fires onValueChange", async () => {
      const onChange = vi.fn();
      // TODO: Implement callback test
    });
  });

  describe("uncontrolled", () => {
    it("uses defaultValue", () => {
      // TODO: Implement uncontrolled test
    });
  });`;
  }

  tests += `

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(<${name} />);
    await expectNoA11yViolations(container);
  });`;

  return `import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ${name} } from "../${name}";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("${name}", () => {${tests}
});
`;
}

function hookTemplate(name) {
  return `import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ${name} } from "../${name}";

describe("${name}", () => {
  it("returns expected shape", () => {
    const { result } = renderHook(() => ${name}());
    // TODO: Assert on result.current
  });

  it("cleans up on unmount", () => {
    const { unmount } = renderHook(() => ${name}());
    unmount();
    // TODO: Verify cleanup
  });
});
`;
}

function utilTemplate(name) {
  return `import { describe, expect, it } from "vitest";
import { ${name} } from "../${name}";

describe("${name}", () => {
  it("works with basic input", () => {
    // TODO: Test basic usage
    // expect(${name}(...)).toBe(...);
  });

  it("handles edge cases", () => {
    // TODO: Test edge cases
  });
});
`;
}
