import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Sankey } from "../Sankey";

const nodes = [
  { key: "a", label: "A" },
  { key: "b", label: "B" },
  { key: "c", label: "C" },
  { key: "d", label: "D" },
];
const links = [
  { source: "a", target: "c", value: 5 },
  { source: "b", target: "c", value: 3 },
  { source: "c", target: "d", value: 7 },
];

describe("Sankey", () => {
  it("renders one node rect and one link path per input", () => {
    const { container } = renderWithTheme(
      <Sankey nodes={nodes} links={links} width={420} height={200} />
    );
    expect(
      container.querySelectorAll(".vf-chart-sankey__node").length
    ).toBe(nodes.length);
    expect(
      container.querySelectorAll(".vf-chart-sankey__link").length
    ).toBe(links.length);
  });

  it("renders a node label per node", () => {
    const { container } = renderWithTheme(
      <Sankey nodes={nodes} links={links} width={420} height={200} />
    );
    expect(
      container.querySelectorAll(".vf-chart-sankey__label").length
    ).toBe(nodes.length);
  });
});
