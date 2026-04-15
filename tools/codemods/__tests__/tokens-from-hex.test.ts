import { describe, expect, it } from "vitest";
import jscodeshift from "jscodeshift";
import transform from "../transforms/tokens-from-hex";

function apply(source: string): string {
  return transform(
    { path: "test.tsx", source },
    {
      jscodeshift: jscodeshift.withParser("tsx"),
      j: jscodeshift.withParser("tsx"),
      stats: () => {},
      report: () => {},
    },
    {}
  );
}

describe("tokens-from-hex", () => {
  it("replaces #fff with the text token in color", () => {
    const out = apply(`const x = <div style={{ color: "#fff" }} />`);
    expect(out).toContain("var(--vf-text-0)");
    expect(out).not.toContain('"#fff"');
  });

  it("replaces full-hex background", () => {
    const out = apply(
      `const x = <div style={{ backgroundColor: "#0a0a0a" }} />`
    );
    expect(out).toContain("var(--vf-bg-0)");
  });

  it("leaves unknown hex values alone", () => {
    const src = `const x = <div style={{ color: "#ff00ff" }} />`;
    expect(apply(src)).toBe(src);
  });

  it("ignores non-color props", () => {
    const src = `const x = <div style={{ content: "#fff" }} />`;
    expect(apply(src)).toBe(src);
  });

  it("handles multiple properties in a single style object", () => {
    const out = apply(
      `const x = <div style={{ color: "#fff", backgroundColor: "#000000" }} />`
    );
    expect(out).toContain("var(--vf-text-0)");
    expect(out).toContain("var(--vf-bg-0)");
  });
});
