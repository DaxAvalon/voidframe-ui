import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { TreeMap } from "../TreeMap";

const data = {
  name: "root",
  children: [
    {
      name: "alpha",
      children: [
        { name: "a1", value: 10 },
        { name: "a2", value: 20 },
      ],
    },
    {
      name: "beta",
      children: [
        { name: "b1", value: 15 },
        { name: "b2", value: 5 },
      ],
    },
  ],
};

describe("TreeMap", () => {
  it("renders one cell per leaf node", () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} width={320} height={200} />
    );
    expect(
      container.querySelectorAll(".vf-chart-treemap__cell").length
    ).toBe(4);
  });

  it("respects the chosen tile algorithm", () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} tile="slice" width={320} height={200} />
    );
    // Same leaf count, different geometry — we just verify it renders.
    expect(
      container.querySelectorAll(".vf-chart-treemap__cell").length
    ).toBe(4);
  });

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <TreeMap
        data={data}
        width={320}
        height={200}
        title="Files"
        description="By size"
      />
    );
    expect(getByText("Files")).toBeTruthy();
    expect(getByText("By size")).toBeTruthy();
  });

  it("uses the default aria-label", () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} width={320} height={200} />
    );
    const svg = container.querySelector("svg[role='img']");
    expect(svg!.getAttribute("aria-label")).toBe("Treemap");
  });

  it("renders cell labels", () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} width={320} height={200} />
    );
    expect(
      container.querySelectorAll(".vf-chart-treemap__label").length
    ).toBeGreaterThan(0);
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} width={320} height={200} className="my-tree" />
    );
    expect(
      container.querySelector(".vf-chart-treemap")!.classList.contains("my-tree")
    ).toBe(true);
  });

  it("renders with tile=binary", () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} tile="binary" width={320} height={200} />
    );
    expect(
      container.querySelectorAll(".vf-chart-treemap__cell").length
    ).toBe(4);
  });

  it("renders with tile=dice", () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} tile="dice" width={320} height={200} />
    );
    expect(
      container.querySelectorAll(".vf-chart-treemap__cell").length
    ).toBe(4);
  });

  it("renders with tile=slice-dice", () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} tile="slice-dice" width={320} height={200} />
    );
    expect(
      container.querySelectorAll(".vf-chart-treemap__cell").length
    ).toBe(4);
  });

  it("uses custom colorForGroup function", () => {
    const { container } = renderWithTheme(
      <TreeMap
        data={data}
        width={320}
        height={200}
        colorForGroup={(g) => (g === "alpha" ? "#ff0000" : "#00ff00")}
      />
    );
    const cells = container.querySelectorAll(".vf-chart-treemap__cell");
    expect(cells.length).toBe(4);
  });

  it("suppresses labels when labelMinArea is very large", () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} width={320} height={200} labelMinArea={999999} />
    );
    // No labels should render because area is too small
    expect(
      container.querySelectorAll(".vf-chart-treemap__label").length
    ).toBe(0);
  });

  it("renders with custom valueFormat", () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} width={320} height={200} valueFormat={(v) => `$${v}`} />
    );
    expect(container.querySelector(".vf-chart-treemap")).toBeTruthy();
  });

  it("renders deep nesting (3 levels)", () => {
    const deepData = {
      name: "root",
      children: [
        {
          name: "level1",
          children: [
            {
              name: "level2",
              children: [
                { name: "leaf", value: 10 },
              ],
            },
          ],
        },
      ],
    };
    const { container } = renderWithTheme(
      <TreeMap data={deepData} width={320} height={200} />
    );
    expect(
      container.querySelectorAll(".vf-chart-treemap__cell").length
    ).toBe(1);
  });

  it("uses leaf color when provided", () => {
    const coloredData = {
      name: "root",
      children: [
        { name: "a", value: 10, color: "#ff0000" },
        { name: "b", value: 20 },
      ],
    };
    const { container } = renderWithTheme(
      <TreeMap data={coloredData} width={320} height={200} />
    );
    const cells = container.querySelectorAll(".vf-chart-treemap__cell");
    expect(cells[0]!.getAttribute("fill")).not.toBe(cells[1]!.getAttribute("fill"));
  });
});
