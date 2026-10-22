import { describe, expect, it } from "vitest";
import { waitFor } from "@testing-library/react";
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
  it("renders one cell per leaf node", async () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} width={320} height={200} />
    );
    await waitFor(() =>
      expect(container.querySelector("svg[role='img']")).toBeTruthy()
    );
    expect(
      container.querySelectorAll(".vf-chart-treemap__cell").length
    ).toBe(4);
  });

  it("respects the chosen tile algorithm", async () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} tile="slice" width={320} height={200} />
    );
    await waitFor(() =>
      expect(container.querySelector("svg[role='img']")).toBeTruthy()
    );
    // Same leaf count, different geometry — we just verify it renders.
    expect(
      container.querySelectorAll(".vf-chart-treemap__cell").length
    ).toBe(4);
  });

  it("renders title and description", async () => {
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

  it("uses the default aria-label", async () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} width={320} height={200} />
    );
    await waitFor(() =>
      expect(container.querySelector("svg[role='img']")).toBeTruthy()
    );
    const svg = container.querySelector("svg[role='img']");
    expect(svg!.getAttribute("aria-label")).toBe("Treemap");
  });

  it("renders cell labels", async () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} width={320} height={200} />
    );
    await waitFor(() =>
      expect(container.querySelector("svg[role='img']")).toBeTruthy()
    );
    expect(
      container.querySelectorAll(".vf-chart-treemap__label").length
    ).toBeGreaterThan(0);
  });

  it("applies custom className", async () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} width={320} height={200} className="my-tree" />
    );
    await waitFor(() =>
      expect(container.querySelector("svg[role='img']")).toBeTruthy()
    );
    expect(
      container.querySelector(".vf-chart-treemap")!.classList.contains("my-tree")
    ).toBe(true);
  });

  it("renders with tile=binary", async () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} tile="binary" width={320} height={200} />
    );
    await waitFor(() =>
      expect(container.querySelector("svg[role='img']")).toBeTruthy()
    );
    expect(
      container.querySelectorAll(".vf-chart-treemap__cell").length
    ).toBe(4);
  });

  it("renders with tile=dice", async () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} tile="dice" width={320} height={200} />
    );
    await waitFor(() =>
      expect(container.querySelector("svg[role='img']")).toBeTruthy()
    );
    expect(
      container.querySelectorAll(".vf-chart-treemap__cell").length
    ).toBe(4);
  });

  it("renders with tile=slice-dice", async () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} tile="slice-dice" width={320} height={200} />
    );
    await waitFor(() =>
      expect(container.querySelector("svg[role='img']")).toBeTruthy()
    );
    expect(
      container.querySelectorAll(".vf-chart-treemap__cell").length
    ).toBe(4);
  });

  it("uses custom colorForGroup function", async () => {
    const { container } = renderWithTheme(
      <TreeMap
        data={data}
        width={320}
        height={200}
        colorForGroup={(g) => (g === "alpha" ? "#ff0000" : "#00ff00")}
      />
    );
    await waitFor(() =>
      expect(container.querySelector("svg[role='img']")).toBeTruthy()
    );
    const cells = container.querySelectorAll(".vf-chart-treemap__cell");
    expect(cells.length).toBe(4);
  });

  it("suppresses labels when labelMinArea is very large", async () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} width={320} height={200} labelMinArea={999999} />
    );
    await waitFor(() =>
      expect(container.querySelector("svg[role='img']")).toBeTruthy()
    );
    // No labels should render because area is too small
    expect(
      container.querySelectorAll(".vf-chart-treemap__label").length
    ).toBe(0);
  });

  it("renders with custom valueFormat", async () => {
    const { container } = renderWithTheme(
      <TreeMap data={data} width={320} height={200} valueFormat={(v) => `$${v}`} />
    );
    await waitFor(() =>
      expect(container.querySelector("svg[role='img']")).toBeTruthy()
    );
    expect(container.querySelector(".vf-chart-treemap")).toBeTruthy();
  });

  it("renders deep nesting (3 levels)", async () => {
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
    await waitFor(() =>
      expect(container.querySelector("svg[role='img']")).toBeTruthy()
    );
    expect(
      container.querySelectorAll(".vf-chart-treemap__cell").length
    ).toBe(1);
  });

  it("uses leaf color when provided", async () => {
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
    await waitFor(() =>
      expect(container.querySelector("svg[role='img']")).toBeTruthy()
    );
    const cells = container.querySelectorAll(".vf-chart-treemap__cell");
    expect(cells[0]!.getAttribute("fill")).not.toBe(cells[1]!.getAttribute("fill"));
  });
});
