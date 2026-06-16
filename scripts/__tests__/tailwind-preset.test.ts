import { describe, expect, it } from "vitest";
// The preset is the shipped CommonJS source of truth.
import presetRaw from "../../tailwind/preset.cjs";
import { tokensToCssVars } from "../../src/themes";
import { defaultTokens } from "../../src/tokens";

const preset = presetRaw as {
  theme: { extend: Record<string, unknown> };
};

// Every `var(--vf-*)` reference anywhere in the preset object.
function collectVarRefs(node: unknown, out: Set<string>): void {
  if (typeof node === "string") {
    const re = /var\((--vf-[a-z0-9-]+)\)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(node))) out.add(m[1]);
  } else if (node && typeof node === "object") {
    for (const v of Object.values(node)) collectVarRefs(v, out);
  }
}

const referenced = new Set<string>();
collectVarRefs(preset.theme.extend, referenced);

// The canonical set of variables the runtime actually emits.
const emitted = new Set(Object.keys(tokensToCssVars(defaultTokens)));

// Variables that map cleanly onto a Tailwind scale and therefore MUST be
// surfaced by the preset. Excludes vars with no idiomatic Tailwind home
// (the transition shorthand, heading-case) and breakpoints (emitted as
// literal px screens, asserted separately).
function isMappable(v: string): boolean {
  if (/^--vf-(bg|text)-\d+$/.test(v)) return true;
  if (/^--vf-border-\d+$/.test(v)) return true; // border colors
  if (/^--vf-border-width-\d+$/.test(v)) return true; // border widths
  if (/^--vf-(green|red|amber|blue|purple|cyan|rose)(-\d+)?$/.test(v)) return true;
  if (/^--vf-(success|danger|warning|info)$/.test(v)) return true;
  if (/^--vf-sp-\d+$/.test(v)) return true;
  if (/^--vf-font-(xxs|xs|sm|md|lg|xl|xxl|3xl)$/.test(v)) return true;
  if (/^--vf-font-(family|mono|sans|display)$/.test(v)) return true;
  if (/^--vf-radius(-\d+)?$/.test(v)) return true;
  if (/^--vf-(letter-spacing|label-spacing|heading-tracking|line-height)$/.test(v))
    return true;
  return false;
}

describe("tailwind preset", () => {
  it("only references variables the runtime actually emits", () => {
    const stale = [...referenced].filter((v) => !emitted.has(v));
    expect(stale).toEqual([]);
  });

  it("surfaces every mappable token (guards against drift)", () => {
    const missing = [...emitted].filter(
      (v) => isMappable(v) && !referenced.has(v)
    );
    expect(missing).toEqual([]);
  });

  it("keeps breakpoint screens in sync with the default theme", () => {
    const screens = preset.theme.extend.screens as Record<string, string>;
    expect(screens["vf-sm"]).toBe(`${defaultTokens.bpSm}px`);
    expect(screens["vf-md"]).toBe(`${defaultTokens.bpMd}px`);
    expect(screens["vf-lg"]).toBe(`${defaultTokens.bpLg}px`);
    expect(screens["vf-xl"]).toBe(`${defaultTokens.bpXl}px`);
    expect(screens["vf-xxl"]).toBe(`${defaultTokens.bpXxl}px`);
  });

  it("exposes the expected Tailwind theme scales", () => {
    const e = preset.theme.extend;
    for (const key of [
      "colors", "spacing", "fontFamily", "fontSize", "lineHeight",
      "letterSpacing", "borderRadius", "borderWidth", "screens",
    ]) {
      expect(e[key], `missing theme.extend.${key}`).toBeTruthy();
    }
  });
});
