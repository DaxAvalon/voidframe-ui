import { describe, expect, it, vi } from "vitest";
import { fireEvent, waitFor } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { NetworkGraph } from "../NetworkGraph";

const nodes = [
  { id: "a", label: "Alpha", group: "g1" },
  { id: "b", label: "Beta", group: "g1" },
  { id: "c", label: "Gamma", group: "g2" },
  { id: "d", label: "Delta", group: "g2" },
];

const links = [
  { source: "a", target: "b", value: 2 },
  { source: "b", target: "c" },
  { source: "c", target: "d", label: "edge cd" },
];

// d3-force loads via loadPeer asynchronously, then runs ticks before
// rendering nodes. Use waitFor to retry until the simulation produces nodes.
async function waitForNodes(container: Element, count: number) {
  await waitFor(
    () => {
      expect(
        container.querySelectorAll(".vf-chart-network__node").length
      ).toBe(count);
    },
    { timeout: 2000, interval: 25 }
  );
}

describe("NetworkGraph", () => {
  it("renders the wrapper with the documented class", () => {
    const { container } = renderWithTheme(
      <NetworkGraph nodes={nodes} links={links} width={400} height={300} />
    );
    expect(container.querySelector(".vf-chart-network")).toBeTruthy();
  });

  it("renders the SVG with the documented aria-label", () => {
    const { container } = renderWithTheme(
      <NetworkGraph
        nodes={nodes}
        links={links}
        width={400}
        height={300}
        accessibleLabel="dependency graph"
      />
    );
    const svg = container.querySelector(".vf-chart-network__svg");
    expect(svg).toBeTruthy();
    expect(svg!.getAttribute("aria-label")).toBe("dependency graph");
  });

  it("renders title and description in the header", () => {
    const { getByText } = renderWithTheme(
      <NetworkGraph
        nodes={nodes}
        links={links}
        width={400}
        height={300}
        title="Network"
        description="Force-directed"
      />
    );
    expect(getByText("Network")).toBeTruthy();
    expect(getByText("Force-directed")).toBeTruthy();
  });

  it("renders one node element per input after the simulation kicks off", async () => {
    const { container } = renderWithTheme(
      <NetworkGraph nodes={nodes} links={links} width={400} height={300} />
    );
    await waitForNodes(container, nodes.length);
  });

  it("renders an arrow marker definition when directed=true (default)", () => {
    const { container } = renderWithTheme(
      <NetworkGraph nodes={nodes} links={links} width={400} height={300} />
    );
    expect(container.querySelector("marker#vf-network-arrow")).toBeTruthy();
  });

  it("invokes onNodeClick with the clicked node", async () => {
    const onNodeClick = vi.fn();
    const { container } = renderWithTheme(
      <NetworkGraph
        nodes={nodes}
        links={links}
        width={400}
        height={300}
        onNodeClick={onNodeClick}
      />
    );
    await waitForNodes(container, nodes.length);
    const node = container.querySelector(".vf-chart-network__node");
    expect(node).toBeTruthy();
    fireEvent.click(node!);
    expect(onNodeClick).toHaveBeenCalledTimes(1);
    const arg = onNodeClick.mock.calls[0]![0];
    expect(typeof arg.id).toBe("string");
  });

  it("still renders nodes when selectable=false", async () => {
    const { container } = renderWithTheme(
      <NetworkGraph
        nodes={nodes}
        links={links}
        width={400}
        height={300}
        selectable={false}
      />
    );
    await waitForNodes(container, nodes.length);
  });

  it("renders the SVG when directed=false (no arrow markerEnd)", async () => {
    const { container } = renderWithTheme(
      <NetworkGraph
        nodes={nodes}
        links={links}
        width={400}
        height={300}
        directed={false}
      />
    );
    await waitForNodes(container, nodes.length);
    expect(container.querySelector(".vf-chart-network__svg")).toBeTruthy();
  });

  it("applies custom className to the wrapper", () => {
    const { container } = renderWithTheme(
      <NetworkGraph
        nodes={nodes}
        links={links}
        width={400}
        height={300}
        className="my-custom-class"
      />
    );
    const wrapper = container.querySelector(".vf-chart-network");
    expect(wrapper!.classList.contains("my-custom-class")).toBe(true);
  });

  it("renders link lines after the simulation settles", async () => {
    const { container } = renderWithTheme(
      <NetworkGraph nodes={nodes} links={links} width={400} height={300} />
    );
    await waitForNodes(container, nodes.length);
    const linkLines = container.querySelectorAll(".vf-chart-network__link");
    expect(linkLines.length).toBe(links.length);
  });

  it("renders node labels when label is provided", async () => {
    const { container } = renderWithTheme(
      <NetworkGraph nodes={nodes} links={links} width={400} height={300} />
    );
    await waitForNodes(container, nodes.length);
    const labels = container.querySelectorAll(".vf-chart-network__label");
    expect(labels.length).toBe(nodes.length);
  });

  it("handles nodes with custom radius", async () => {
    const customNodes = [
      { id: "a", label: "Alpha", radius: 12 },
      { id: "b", label: "Beta", radius: 20 },
    ];
    const customLinks = [{ source: "a", target: "b" }];
    const { container } = renderWithTheme(
      <NetworkGraph
        nodes={customNodes}
        links={customLinks}
        width={400}
        height={300}
      />
    );
    await waitForNodes(container, 2);
    const circles = container.querySelectorAll(
      ".vf-chart-network__node circle"
    );
    expect(circles[0]!.getAttribute("r")).toBe("12");
    expect(circles[1]!.getAttribute("r")).toBe("20");
  });

  it("toggles selection when clicking a node twice", async () => {
    const { container } = renderWithTheme(
      <NetworkGraph
        nodes={nodes}
        links={links}
        width={400}
        height={300}
        selectable={true}
      />
    );
    await waitForNodes(container, nodes.length);
    const node = container.querySelector(".vf-chart-network__node")!;
    fireEvent.click(node);
    // After first click, some nodes should be highlighted/dimmed.
    const highlighted = container.querySelectorAll(
      ".vf-chart-network__node--highlighted"
    );
    expect(highlighted.length).toBeGreaterThan(0);
    // Click same node again to deselect.
    fireEvent.click(node);
    const highlightedAfter = container.querySelectorAll(
      ".vf-chart-network__node--highlighted"
    );
    expect(highlightedAfter.length).toBe(0);
  });

  it("clears selection when clicking the SVG surface", async () => {
    const { container } = renderWithTheme(
      <NetworkGraph
        nodes={nodes}
        links={links}
        width={400}
        height={300}
        selectable={true}
      />
    );
    await waitForNodes(container, nodes.length);
    const node = container.querySelector(".vf-chart-network__node")!;
    fireEvent.click(node);
    expect(
      container.querySelectorAll(".vf-chart-network__node--highlighted").length
    ).toBeGreaterThan(0);
    // Click the SVG surface to clear.
    const svg = container.querySelector(".vf-chart-network__svg")!;
    fireEvent.click(svg);
    expect(
      container.querySelectorAll(".vf-chart-network__node--highlighted").length
    ).toBe(0);
  });

  it("uses the default aria-label when none is provided", () => {
    const { container } = renderWithTheme(
      <NetworkGraph nodes={nodes} links={links} width={400} height={300} />
    );
    const svg = container.querySelector(".vf-chart-network__svg");
    expect(svg!.getAttribute("aria-label")).toBe("Network graph");
  });
});
