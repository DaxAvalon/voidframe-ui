import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { LineChart } from "../LineChart";

const data = Array.from({ length: 10 }, (_, i) => ({
  x: i,
  a: i * 2,
  b: 20 - i,
}));

describe("LineChart", () => {
  it("renders one path per series", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a" }, { key: "b" }]}
        width={400}
        height={240}
      />
    );
    const paths = container.querySelectorAll("path.vf-chart-line");
    expect(paths).toHaveLength(2);
  });

  it("renders series points when showPoints is not disabled", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a" }]}
        width={400}
        height={240}
      />
    );
    expect(container.querySelector(".vf-chart-point")).toBeTruthy();
  });

  it("suppresses points when showPoints=false", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a", showPoints: false }]}
        width={400}
        height={240}
      />
    );
    // No Point <g> group should be rendered for this series.
    // (Legend + axes may still contain <g>, but none with vf-chart-point.)
    expect(container.querySelector(".vf-chart-point")).toBeFalsy();
  });

  it("uses a dashed stroke when series.dashed is true", () => {
    const { container } = renderWithTheme(
      <LineChart
        data={data}
        series={[{ key: "a", dashed: true }]}
        width={400}
        height={240}
      />
    );
    const path = container.querySelector("path.vf-chart-line");
    expect(path!.getAttribute("stroke-dasharray")).toBeTruthy();
  });
});
