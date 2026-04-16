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

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <Sankey
        nodes={nodes}
        links={links}
        width={420}
        height={200}
        title="Energy"
        description="Flow diagram"
      />
    );
    expect(getByText("Energy")).toBeTruthy();
    expect(getByText("Flow diagram")).toBeTruthy();
  });

  it("uses the default aria-label", () => {
    const { container } = renderWithTheme(
      <Sankey nodes={nodes} links={links} width={420} height={200} />
    );
    const svg = container.querySelector(".vf-chart-sankey__svg");
    expect(svg!.getAttribute("aria-label")).toBe("Sankey diagram");
  });

  it("uses custom accessibleLabel", () => {
    const { container } = renderWithTheme(
      <Sankey
        nodes={nodes}
        links={links}
        width={420}
        height={200}
        accessibleLabel="flow chart"
      />
    );
    const svg = container.querySelector(".vf-chart-sankey__svg");
    expect(svg!.getAttribute("aria-label")).toBe("flow chart");
  });

  it("uses node label when provided, key otherwise", () => {
    const mixedNodes = [
      { key: "a" },
      { key: "b", label: "Beta" },
      { key: "c" },
    ];
    const mixedLinks = [
      { source: "a", target: "c", value: 5 },
      { source: "b", target: "c", value: 3 },
    ];
    const { container } = renderWithTheme(
      <Sankey nodes={mixedNodes} links={mixedLinks} width={420} height={200} />
    );
    const labels = container.querySelectorAll(".vf-chart-sankey__label");
    const texts = Array.from(labels).map((l) => l.textContent);
    expect(texts).toContain("a");
    expect(texts).toContain("Beta");
  });

  it("renders with different align options", () => {
    const { container } = renderWithTheme(
      <Sankey nodes={nodes} links={links} width={420} height={200} align="left" />
    );
    expect(
      container.querySelectorAll(".vf-chart-sankey__node").length
    ).toBe(nodes.length);
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <Sankey
        nodes={nodes}
        links={links}
        width={420}
        height={200}
        className="my-sankey"
      />
    );
    expect(
      container.querySelector(".vf-chart-sankey")!.classList.contains("my-sankey")
    ).toBe(true);
  });

  it("renders with align=right", () => {
    const { container } = renderWithTheme(
      <Sankey nodes={nodes} links={links} width={420} height={200} align="right" />
    );
    expect(
      container.querySelectorAll(".vf-chart-sankey__node").length
    ).toBe(nodes.length);
  });

  it("renders with align=center", () => {
    const { container } = renderWithTheme(
      <Sankey nodes={nodes} links={links} width={420} height={200} align="center" />
    );
    expect(
      container.querySelectorAll(".vf-chart-sankey__node").length
    ).toBe(nodes.length);
  });

  it("uses per-node color when provided", () => {
    const coloredNodes = [
      { key: "a", color: "#ff0000" },
      { key: "b", color: "#00ff00" },
      { key: "c" },
    ];
    const coloredLinks = [
      { source: "a", target: "c", value: 5 },
      { source: "b", target: "c", value: 3 },
    ];
    const { container } = renderWithTheme(
      <Sankey nodes={coloredNodes} links={coloredLinks} width={420} height={200} />
    );
    const rects = container.querySelectorAll(".vf-chart-sankey__node");
    expect(rects[0]!.getAttribute("fill")).toBe("#ff0000");
    expect(rects[1]!.getAttribute("fill")).toBe("#00ff00");
  });

  it("custom nodeWidth and nodePadding", () => {
    const { container } = renderWithTheme(
      <Sankey
        nodes={nodes}
        links={links}
        width={420}
        height={200}
        nodeWidth={20}
        nodePadding={15}
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-sankey__node").length
    ).toBe(nodes.length);
  });

  it("uses custom valueFormat", () => {
    const { container } = renderWithTheme(
      <Sankey
        nodes={nodes}
        links={links}
        width={420}
        height={200}
        valueFormat={(v) => `$${v}`}
      />
    );
    expect(container.querySelector(".vf-chart-sankey")).toBeTruthy();
  });
});
