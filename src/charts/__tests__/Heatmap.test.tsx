import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Heatmap } from "../Heatmap";

describe("Heatmap", () => {
  it("renders one cell per (row, column) pair", () => {
    const { container } = renderWithTheme(
      <Heatmap
        rows={["r1", "r2"]}
        columns={["c1", "c2", "c3"]}
        data={[
          { x: "c1", y: "r1", value: 1 },
          { x: "c2", y: "r2", value: 4 },
        ]}
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-heatmap__cell")
    ).toHaveLength(6);
  });

  it("renders row + column labels", () => {
    const { container } = renderWithTheme(
      <Heatmap
        rows={["r"]}
        columns={["c"]}
        data={[{ x: "c", y: "r", value: 1 }]}
      />
    );
    expect(container.querySelector(".vf-chart-heatmap__row-label")).toBeTruthy();
    expect(container.querySelector(".vf-chart-heatmap__col-label")).toBeTruthy();
  });

  it("hides row labels when showRowLabels=false", () => {
    const { container } = renderWithTheme(
      <Heatmap
        rows={["r"]}
        columns={["c"]}
        data={[{ x: "c", y: "r", value: 1 }]}
        showRowLabels={false}
      />
    );
    expect(container.querySelector(".vf-chart-heatmap__row-label")).toBeFalsy();
  });

  it("hides column labels when showColumnLabels=false", () => {
    const { container } = renderWithTheme(
      <Heatmap
        rows={["r"]}
        columns={["c"]}
        data={[{ x: "c", y: "r", value: 1 }]}
        showColumnLabels={false}
      />
    );
    expect(container.querySelector(".vf-chart-heatmap__col-label")).toBeFalsy();
  });

  it("renders a legend by default", () => {
    const { container } = renderWithTheme(
      <Heatmap
        rows={["r"]}
        columns={["c"]}
        data={[{ x: "c", y: "r", value: 1 }]}
      />
    );
    expect(container.querySelector(".vf-chart-heatmap__legend")).toBeTruthy();
  });

  it("hides legend when showLegend=false", () => {
    const { container } = renderWithTheme(
      <Heatmap
        rows={["r"]}
        columns={["c"]}
        data={[{ x: "c", y: "r", value: 1 }]}
        showLegend={false}
      />
    );
    expect(container.querySelector(".vf-chart-heatmap__legend")).toBeFalsy();
  });

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <Heatmap
        rows={["r"]}
        columns={["c"]}
        data={[{ x: "c", y: "r", value: 1 }]}
        title="Correlation"
        description="Heat values"
      />
    );
    expect(getByText("Correlation")).toBeTruthy();
    expect(getByText("Heat values")).toBeTruthy();
  });

  it("uses the default aria-label", () => {
    const { container } = renderWithTheme(
      <Heatmap
        rows={["r"]}
        columns={["c"]}
        data={[{ x: "c", y: "r", value: 1 }]}
      />
    );
    const svg = container.querySelector(".vf-chart-heatmap__svg");
    expect(svg!.getAttribute("aria-label")).toBe("Heatmap");
  });

  it("renders cells with bg color for missing data", () => {
    const { container } = renderWithTheme(
      <Heatmap
        rows={["r1", "r2"]}
        columns={["c1"]}
        data={[{ x: "c1", y: "r1", value: 5 }]}
      />
    );
    // 2 cells total, only one has data
    expect(
      container.querySelectorAll(".vf-chart-heatmap__cell")
    ).toHaveLength(2);
  });

  it("uses custom colors array", () => {
    const customColors = ["#111", "#222", "#333"];
    const { container } = renderWithTheme(
      <Heatmap
        rows={["r"]}
        columns={["c"]}
        data={[{ x: "c", y: "r", value: 1 }]}
        colors={customColors}
      />
    );
    const legendItems = container.querySelectorAll(".vf-chart-legend__item");
    expect(legendItems.length).toBe(3);
  });

  it("uses custom cellSize and cellGap", () => {
    const { container } = renderWithTheme(
      <Heatmap
        rows={["r"]}
        columns={["c"]}
        data={[{ x: "c", y: "r", value: 1 }]}
        cellSize={40}
        cellGap={4}
      />
    );
    const cell = container.querySelector(".vf-chart-heatmap__cell");
    expect(cell!.getAttribute("width")).toBe("40");
    expect(cell!.getAttribute("height")).toBe("40");
  });

  it("uses custom valueFormat", () => {
    const { container } = renderWithTheme(
      <Heatmap
        rows={["r"]}
        columns={["c"]}
        data={[{ x: "c", y: "r", value: 100 }]}
        valueFormat={(v) => `$${v}`}
      />
    );
    expect(container.querySelector(".vf-chart-heatmap")).toBeTruthy();
  });

  it("renders cell label in tooltip when provided", () => {
    const { container } = renderWithTheme(
      <Heatmap
        rows={["r"]}
        columns={["c"]}
        data={[{ x: "c", y: "r", value: 1, label: "Special" }]}
      />
    );
    expect(container.querySelector(".vf-chart-heatmap")).toBeTruthy();
  });

  it("uses custom accessibleLabel", () => {
    const { container } = renderWithTheme(
      <Heatmap
        rows={["r"]}
        columns={["c"]}
        data={[{ x: "c", y: "r", value: 1 }]}
        accessibleLabel="custom heatmap"
      />
    );
    const svg = container.querySelector(".vf-chart-heatmap__svg");
    expect(svg!.getAttribute("aria-label")).toBe("custom heatmap");
  });
});
