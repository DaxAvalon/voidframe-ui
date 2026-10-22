import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import jscodeshift from "jscodeshift";
import transform, { SHADCN_TO_VF, rewriteShadcnColors } from "../transforms/shadcn-hsl-to-vf";

function apply(source: string, report = vi.fn()): string {
  return transform(
    { path: "test.tsx", source },
    {
      jscodeshift: jscodeshift.withParser("tsx"),
      j: jscodeshift.withParser("tsx"),
      stats: () => {},
      report,
    },
    {}
  );
}

const ROOT = resolve(process.cwd());
const tokensCss = readFileSync(resolve(ROOT, "src/css/tokens.css"), "utf-8");
const bridge = readFileSync(resolve(ROOT, "src/css/compat/shadcn-tokens.css"), "utf-8");
const bridgeV4 = readFileSync(resolve(ROOT, "src/css/compat/shadcn-tokens-v4.css"), "utf-8");

describe("shadcn-hsl-to-vf codemod", () => {
  it("rewrites hsl(var(--x)) in string literals", () => {
    const out = apply(`const s = { color: "hsl(var(--foreground))", background: 'hsl(var(--background))' };`);
    expect(out).toContain('"var(--vf-text-0)"');
    expect(out).toContain('"var(--vf-bg-0)"');
    expect(out).not.toContain("hsl(");
  });

  it("turns alpha modifiers into color-mix and bare var(--radius) into the vf token", () => {
    const out = apply("const css = `border: 1px solid hsl(var(--border) / 0.5); border-radius: calc(var(--radius) - 2px);`;");
    expect(out).toContain("color-mix(in srgb, var(--vf-border-1) 50%, transparent)");
    expect(out).toContain("calc(var(--vf-radius) - 2px)");
  });

  it("reports unmapped variables and leaves them alone", () => {
    const report = vi.fn();
    const src = `const s = "hsl(var(--brand-glow))";`;
    expect(apply(src, report)).toBe(src);
    expect(report).toHaveBeenCalledTimes(1);
    expect(report.mock.calls[0]![0]).toContain("brand-glow");
  });

  it("rewriteShadcnColors works on CSS text", () => {
    const r = rewriteShadcnColors(".x { background: hsl(var(--muted) / 40%); color: hsl(var(--muted-foreground)); }");
    expect(r.changed).toBe(true);
    expect(r.output).toBe(
      ".x { background: color-mix(in srgb, var(--vf-bg-2) 40%, transparent); color: var(--vf-text-2); }"
    );
  });
});

describe("compat-shadcn token bridges", () => {
  const defined = new Set([...tokensCss.matchAll(/(--vf-[\w-]+)\s*:/g)].map((m) => m[1]!));

  for (const [label, css] of [
    ["tokens.css", bridge],
    ["tokens-v4.css", bridgeV4],
  ] as const) {
    it(`${label} defines every mapped shadcn variable and references only defined --vf-* tokens`, () => {
      for (const name of Object.keys(SHADCN_TO_VF)) {
        expect(css, `--${name}`).toMatch(new RegExp(`--${name}\\s*:`));
      }
      for (const m of css.matchAll(/var\((--vf-[\w-]+)\)/g)) {
        expect(defined.has(m[1]!), m[1]).toBe(true);
      }
    });
  }

  it("the hsl bridge yields valid relative-color syntax when substituted", () => {
    const m = bridge.match(/--background:\s*([^;]+);/)!;
    expect(`hsl(${m[1]!.trim()})`).toBe("hsl(from var(--vf-bg-0) h s l)");
    expect(`hsl(${m[1]!.trim()} / 0.5)`).toBe("hsl(from var(--vf-bg-0) h s l / 0.5)");
  });

  it("the codemod map and the bridge agree", () => {
    for (const [name, token] of Object.entries(SHADCN_TO_VF)) {
      expect(bridgeV4, name).toContain(`--${name}: var(${token});`);
    }
  });
});
