import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Histogram } from "../Histogram";

describe("Histogram", () => {
  it("renders at least one bar for a uniform sample", () => {
    const values = Array.from({ length: 100 }, () => Math.random());
    const { container } = renderWithTheme(
      <Histogram values={values} bins={10} width={400} height={200} />
    );
    const bars = container.querySelectorAll(".vf-chart-bar__rect");
    expect(bars.length).toBeGreaterThan(0);
  });

  it("renders an SVG with role=img", () => {
    const { container } = renderWithTheme(
      <Histogram
        values={[1, 2, 3, 4, 5]}
        width={300}
        height={200}
      />
    );
    expect(container.querySelector("svg[role='img']")).toBeTruthy();
  });
});
