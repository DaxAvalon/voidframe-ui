/**
 * Regression test: ensure CSS files use logical properties instead of
 * physical left/right equivalents. New violations should use logical
 * properties (padding-inline-start, margin-inline-end, etc.) or be
 * added to the allowlist below with a justification.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const CSS_DIR = join(__dirname, "../src/css");

/** Patterns that indicate physical LTR/RTL-sensitive properties. */
const PHYSICAL_PATTERNS = [
  /(?<!\w)padding-left\s*:/,
  /(?<!\w)padding-right\s*:/,
  /(?<!\w)margin-left\s*:/,
  /(?<!\w)margin-right\s*:/,
  /(?<!\w)border-left\s*:/,
  /(?<!\w)border-right\s*:/,
  /(?<!\w)border-left-color\s*:/,
  /(?<!\w)border-right-color\s*:/,
  /text-align\s*:\s*left/,
  /text-align\s*:\s*right/,
];

/**
 * Allowlist: file:line patterns that are intentionally physical.
 * Each entry is a substring that must appear in the "file:line" string.
 * Add entries here with a comment explaining why the physical property
 * is correct (e.g., absolute positioning for arrow tips).
 */
const ALLOWLIST = [
  // Popover arrow base shape — physical triangle made with borders.
  "feedback-overlays.css:131:",
  // Timeline arrow — CSS triangle pointing right; time direction is constant.
  "horizontal-timeline.css:89:",
];

function collectCssFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectCssFiles(full));
    } else if (entry.name.endsWith(".css")) {
      results.push(full);
    }
  }
  return results;
}

describe("CSS logical properties", () => {
  const files = collectCssFiles(CSS_DIR);

  it("has CSS files to check", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("no physical left/right properties outside allowlist", () => {
    const violations: string[] = [];

    for (const file of files) {
      const content = readFileSync(file, "utf-8");
      const lines = content.split("\n");
      const relPath = file.replace(/^.*\/src\/css\//, "");

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        // Skip comments
        if (line.trim().startsWith("/*") || line.trim().startsWith("*")) continue;

        for (const pattern of PHYSICAL_PATTERNS) {
          if (pattern.test(line)) {
            const entry = `${relPath}:${i + 1}: ${line.trim()}`;
            const allowed = ALLOWLIST.some((a) => entry.includes(a));
            if (!allowed) {
              violations.push(entry);
            }
          }
        }
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `Found ${violations.length} physical CSS properties that should use logical equivalents:\n` +
          violations.map((v) => `  ${v}`).join("\n") +
          "\n\nUse logical properties (padding-inline-start, margin-inline-end, etc.) " +
          "or add to the ALLOWLIST in test/css-logical.test.ts with a justification."
      );
    }
  });
});
