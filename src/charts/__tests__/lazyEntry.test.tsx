import { describe, expect, it } from "vitest";
import { Suspense, createRef } from "react";
import { waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import * as lazyEntry from "../lazy";
import { LazyBarChart, LazyTreeMap, ChartSkeleton } from "../lazy";

describe("voidframe-ui/charts/lazy", () => {
  it("exports a Lazy wrapper for every chart in the barrel", async () => {
    const barrel = await import("../index");
    const chartNames = Object.keys(barrel).filter(
      (k) =>
        /^[A-Z]/.test(k) &&
        /(Chart|Plot|Map|Graph|Matrix|Sparkline|Heatmap|Histogram|Multiples|Sunburst|Sankey|Diagram|Coordinates)$/.test(
          k
        ) &&
        !/^(Chart[A-Z]|ReferenceLine|ReferenceBand)/.test(k)
    );
    for (const name of chartNames) {
      expect(
        (lazyEntry as Record<string, unknown>)[`Lazy${name}`],
        `Lazy${name}`
      ).toBeDefined();
    }
    expect(chartNames.length).toBeGreaterThan(25);
  });

  it("ChartSkeleton reserves the height and announces loading", () => {
    const { container } = renderWithTheme(<ChartSkeleton height={180} />);
    const el = container.querySelector(".vf-chart-skeleton") as HTMLElement;
    expect(el.style.height).toBe("180px");
    expect(el.style.width).toBe("100%");
    expect(el.getAttribute("role")).toBe("status");
    expect(el.getAttribute("aria-busy")).toBe("true");
    expect(el.getAttribute("aria-label")).toBe("Loading chart");
    expect(el.classList.contains("vf-chart-skeleton--animate")).toBe(true);
  });

  it("renders the skeleton fallback, then the chart, and forwards ref", async () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = renderWithTheme(
      <Suspense fallback={<ChartSkeleton height={120} label="Loading bars" />}>
        <LazyBarChart
          ref={ref}
          data={[{ c: "a", v: 1 }, { c: "b", v: 2 }]}
          series={[{ key: "v", label: "v" }]}
          xKey="c"
          width={300}
          height={120}
        />
      </Suspense>
    );
    await waitFor(() =>
      expect(container.querySelectorAll(".vf-chart-bar__rect").length).toBe(2)
    );
    expect(container.querySelector(".vf-chart-skeleton")).toBeNull();
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("peer-backed charts render through their lazy wrapper", async () => {
    const { container } = renderWithTheme(
      <Suspense fallback={<ChartSkeleton height={100} />}>
        <LazyTreeMap
          data={{ name: "r", children: [{ name: "a", value: 1 }, { name: "b", value: 2 }] }}
          width={200}
          height={100}
        />
      </Suspense>
    );
    await waitFor(() =>
      expect(container.querySelectorAll(".vf-chart-treemap__cell").length).toBe(2)
    );
  });
});
