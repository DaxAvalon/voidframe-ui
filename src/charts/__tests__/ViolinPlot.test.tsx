import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { ViolinPlot } from "../ViolinPlot";

describe("ViolinPlot", () => {
  it("renders a KDE shape per group when samples are large enough", () => {
    const values = Array.from({ length: 100 }, () => Math.random());
    const { container } = renderWithTheme(
      <ViolinPlot
        groups={[
          { key: "a", values },
          { key: "b", values: values.map((v) => v * 2) },
        ]}
        width={400}
        height={240}
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-violin__shape").length
    ).toBe(2);
  });

  it("falls back to a fallback rect when the sample is too small", () => {
    const { container } = renderWithTheme(
      <ViolinPlot
        groups={[{ key: "a", values: [1, 2, 3] }]}
        width={300}
        height={200}
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-violin__fallback").length
    ).toBe(1);
  });
});
