import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { THEME_NAMES } from "../index";
import { darkTheme } from "../dark";
import { lightTheme } from "../light";
import { midnightTheme } from "../midnight";
import { greyTheme } from "../grey";
import { softTheme } from "../soft";
import { softLightTheme } from "../soft-light";
import type { VoidframeTokens } from "../../tokens";

// `themeName="…"` on VoidframeProvider works via the stylesheet cascade:
// it sets data-vf-theme and expects tokens.css to carry a matching block.
// A theme registered only as a JS object silently renders as dark — this
// suite pins every built-in name to a cascade block with matching values.

const css = readFileSync(
  resolve(__dirname, "../../css/tokens.css"),
  "utf8"
);

const THEMES: Record<(typeof THEME_NAMES)[number], VoidframeTokens> = {
  dark: darkTheme,
  light: lightTheme,
  midnight: midnightTheme,
  grey: greyTheme,
  soft: softTheme,
  "soft-light": softLightTheme,
};

function cascadeBlock(name: string): string | null {
  const marker = `[data-vf-theme="${name}"]`;
  const start = css.indexOf(marker);
  if (start < 0) return null;
  const open = css.indexOf("{", start);
  const close = css.indexOf("}", open);
  return css.slice(open + 1, close);
}

describe("theme stylesheet cascade", () => {
  it.each(THEME_NAMES)(
    "[data-vf-theme=%s] block exists in tokens.css",
    (name) => {
      expect(cascadeBlock(name), `missing cascade block for "${name}"`).toBeTruthy();
    }
  );

  it.each(THEME_NAMES)(
    "%s cascade surface/text/accent values match the JS token object",
    (name) => {
      const block = cascadeBlock(name)!;
      const t = THEMES[name];
      // Dark is the :root default; its block may restate or inherit values,
      // so only assert when the block declares the property.
      const expectVar = (prop: string, value: string) => {
        const m = block.match(new RegExp(`${prop}:\\s*([^;]+);`));
        if (name === "dark" && !m) return;
        expect(m, `${name}: ${prop} not declared`).toBeTruthy();
        expect(m![1].trim().toLowerCase()).toBe(value.toLowerCase());
      };
      expectVar("--vf-bg-0", t.bg0);
      expectVar("--vf-bg-5", t.bg5);
      expectVar("--vf-text-0", t.text0);
      expectVar("--vf-border-2", t.border2);
      expectVar("--vf-green", t.green);
      expectVar("--vf-rose-60", t.rose60);
    }
  );

  it.each(THEME_NAMES)("%s cascade radius matches the JS token object", (name) => {
    const block = cascadeBlock(name)!;
    const t = THEMES[name];
    const m = block.match(/--vf-radius:\s*([^;]+);/);
    if (t.radius === 0) {
      // Zero-radius themes may inherit :root's default (--vf-radius: 0).
      if (m) expect(m[1].trim()).toMatch(/^0(px)?$/);
    } else {
      expect(m, `${name}: non-zero radius must be declared in the cascade`).toBeTruthy();
      expect(m![1].trim()).toBe(`${t.radius}px`);
    }
  });
});
