import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Sunburst } from "../Sunburst";

const data = {
  name: "root",
  children: [
    {
      name: "alpha",
      children: [
        { name: "a1", value: 3 },
        { name: "a2", value: 7 },
      ],
    },
    {
      name: "beta",
      children: [
        { name: "b1", value: 4 },
        { name: "b2", value: 6 },
      ],
    },
  ],
};

describe("Sunburst", () => {
  it("renders one slice per non-root descendant", () => {
    const { container } = renderWithTheme(<Sunburst data={data} size={240} />);
    // 2 top-level + 4 leaves = 6 non-root descendants.
    expect(
      container.querySelectorAll(".vf-chart-sunburst__slice").length
    ).toBe(6);
  });

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <Sunburst data={data} size={240} title="Hierarchy" description="Nested" />
    );
    expect(getByText("Hierarchy")).toBeTruthy();
    expect(getByText("Nested")).toBeTruthy();
  });

  it("uses the default aria-label", () => {
    const { container } = renderWithTheme(
      <Sunburst data={data} size={240} />
    );
    const svg = container.querySelector("svg[role='img']");
    expect(svg!.getAttribute("aria-label")).toBe("Sunburst chart");
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <Sunburst data={data} size={240} className="my-sunburst" />
    );
    expect(
      container
        .querySelector(".vf-chart-sunburst")!
        .classList.contains("my-sunburst")
    ).toBe(true);
  });
});
