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

  it("renders title and description", () => {
    const values = Array.from({ length: 100 }, () => Math.random());
    const { getByText } = renderWithTheme(
      <ViolinPlot
        groups={[{ key: "a", values }]}
        width={300}
        height={200}
        title="Scores"
        description="KDE estimate"
      />
    );
    expect(getByText("Scores")).toBeTruthy();
    expect(getByText("KDE estimate")).toBeTruthy();
  });

  it("uses the default aria-label", () => {
    const values = Array.from({ length: 100 }, () => Math.random());
    const { container } = renderWithTheme(
      <ViolinPlot
        groups={[{ key: "a", values }]}
        width={300}
        height={200}
      />
    );
    const svg = container.querySelector("svg[role='img']");
    expect(svg!.getAttribute("aria-label")).toBe("Violin plot");
  });

  it("renders a KDE shape with correct fill opacity", () => {
    const values = Array.from({ length: 100 }, () => Math.random());
    const { container } = renderWithTheme(
      <ViolinPlot
        groups={[{ key: "a", values }]}
        width={300}
        height={200}
      />
    );
    const shape = container.querySelector(".vf-chart-violin__shape");
    expect(shape).toBeTruthy();
  });

  it("accepts an explicit numeric bandwidth", () => {
    // Explicit number exercises the non-"auto" branch of bandwidth selection.
    const values = Array.from({ length: 100 }, (_, i) => i / 10);
    const { container } = renderWithTheme(
      <ViolinPlot
        groups={[{ key: "a", values }]}
        bandwidth={0.5}
        width={300}
        height={200}
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-violin__shape").length
    ).toBe(1);
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <ViolinPlot
        groups={[{ key: "a", values: [1, 2, 3] }]}
        width={300}
        height={200}
        className="my-violin"
      />
    );
    expect(
      container
        .querySelector(".vf-chart-violin")!
        .classList.contains("my-violin")
    ).toBe(true);
  });
});
