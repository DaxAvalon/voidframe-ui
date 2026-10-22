// Regression for the eager d3-hierarchy / d3-sankey imports: importing the
// charts barrel for a LineChart must work without those peers, and the
// charts that need them must render an install message, not crash.
import { describe, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";

vi.mock("d3-hierarchy", () => {
  throw new Error("Cannot find module 'd3-hierarchy'");
});
vi.mock("d3-sankey", () => {
  throw new Error("Cannot find module 'd3-sankey'");
});

describe("charts without d3-hierarchy and d3-sankey installed", () => {
  it("imports the charts barrel and renders LineChart", async () => {
    const { LineChart } = await import("../index");
    const { container } = renderWithTheme(
      <LineChart
        data={[
          { x: 0, y: 1 },
          { x: 1, y: 3 },
        ]}
        series={[{ key: "y", label: "y" }]}
        xKey="x"
        width={320}
        height={160}
      />
    );
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("TreeMap shows the install message instead of throwing", async () => {
    const { TreeMap } = await import("../TreeMap");
    const { container } = renderWithTheme(
      <TreeMap
        data={{ name: "r", children: [{ name: "a", value: 1 }] }}
        width={200}
        height={100}
        title="Files"
      />
    );
    await waitFor(() =>
      expect(
        container.querySelector(".vf-chart-treemap__error-message")?.textContent
      ).toContain("npm install d3-hierarchy")
    );
    expect(container.textContent).toContain("Files");
  });

  it("Sunburst shows the install message", async () => {
    const { Sunburst } = await import("../Sunburst");
    const { container } = renderWithTheme(
      <Sunburst data={{ name: "r", children: [{ name: "a", value: 1 }] }} size={120} />
    );
    await waitFor(() =>
      expect(
        container.querySelector(".vf-chart-sunburst__error-message")?.textContent
      ).toContain("<Sunburst>")
    );
  });

  it("Sankey shows the install message", async () => {
    const { Sankey } = await import("../Sankey");
    const { container } = renderWithTheme(
      <Sankey
        nodes={[{ key: "a" }, { key: "b" }]}
        links={[{ source: "a", target: "b", value: 1 }]}
        width={200}
        height={100}
      />
    );
    await waitFor(() =>
      expect(
        container.querySelector(".vf-chart-sankey__error-message")?.textContent
      ).toContain("npm install d3-sankey")
    );
  });
});
