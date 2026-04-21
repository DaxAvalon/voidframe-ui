import { describe, expect, it } from "vitest";
import jscodeshift from "jscodeshift";
import transform from "../transforms/legacy-charts-to-v2";

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

describe("legacy-charts-to-v2", () => {
  it("rewrites dist/components/Charts path", () => {
    const out = apply(
      `import { Sparkline } from "voidframe/dist/components/Charts";`
    );
    expect(out).toContain(`from "voidframe-ui"`);
    expect(out).not.toContain("components/Charts");
  });

  it("rewrites src/components/Charts path", () => {
    const out = apply(
      `import { Heatmap } from "voidframe/src/components/Charts";`
    );
    expect(out).toContain(`from "voidframe-ui"`);
  });

  it("rewrites components/Charts path", () => {
    const out = apply(
      `import { ChartContainer } from "voidframe/components/Charts";`
    );
    expect(out).toContain(`from "voidframe-ui"`);
  });

  it("leaves already-correct imports alone", () => {
    const src = `import { BarChart } from "voidframe-ui";`;
    expect(apply(src)).toBe(src);
  });

  it("leaves unrelated packages alone", () => {
    const src = `import { X } from "other-pkg/components/Charts";`;
    expect(apply(src)).toBe(src);
  });
});
