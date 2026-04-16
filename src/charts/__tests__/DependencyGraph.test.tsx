import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { DependencyGraph } from "../DependencyGraph";

const nodes = [
  { id: "build" },
  { id: "test" },
  { id: "lint" },
  { id: "ship", group: "release" },
];
const edges = [
  { source: "test", target: "build" },
  { source: "lint", target: "build" },
  { source: "ship", target: "test" },
  { source: "ship", target: "lint" },
];

describe("DependencyGraph", () => {
  it("renders one node group per input", () => {
    const { container } = renderWithTheme(
      <DependencyGraph nodes={nodes} edges={edges} />
    );
    expect(
      container.querySelectorAll(".vf-chart-dep-graph__node").length
    ).toBe(nodes.length);
  });

  it("renders 3 orthogonal segments per edge", () => {
    const { container } = renderWithTheme(
      <DependencyGraph nodes={nodes} edges={edges} />
    );
    // Each edge decomposes into 3 line segments to support
    // per-segment obstruction overlays.
    expect(
      container.querySelectorAll(".vf-chart-dep-graph__edge").length
    ).toBe(edges.length * 3);
  });

  it("renders no errors and at least one label", () => {
    const { container } = renderWithTheme(
      <DependencyGraph nodes={nodes} edges={edges} />
    );
    expect(
      container.querySelectorAll(".vf-chart-dep-graph__label").length
    ).toBeGreaterThan(0);
  });

  it("renders title and description", () => {
    const { getByText } = renderWithTheme(
      <DependencyGraph
        nodes={nodes}
        edges={edges}
        title="CI Pipeline"
        description="Build dependencies"
      />
    );
    expect(getByText("CI Pipeline")).toBeTruthy();
    expect(getByText("Build dependencies")).toBeTruthy();
  });

  it("uses the default aria-label", () => {
    const { container } = renderWithTheme(
      <DependencyGraph nodes={nodes} edges={edges} />
    );
    const svg = container.querySelector(".vf-chart-dep-graph__svg");
    expect(svg!.getAttribute("aria-label")).toBe("Dependency graph");
  });

  it("uses custom accessibleLabel", () => {
    const { container } = renderWithTheme(
      <DependencyGraph
        nodes={nodes}
        edges={edges}
        accessibleLabel="pipeline graph"
      />
    );
    const svg = container.querySelector(".vf-chart-dep-graph__svg");
    expect(svg!.getAttribute("aria-label")).toBe("pipeline graph");
  });

  it("renders with left-right direction", () => {
    const { container } = renderWithTheme(
      <DependencyGraph nodes={nodes} edges={edges} direction="left-right" />
    );
    expect(
      container.querySelectorAll(".vf-chart-dep-graph__node").length
    ).toBe(nodes.length);
  });

  it("renders arrow markers when directed=true (default)", () => {
    const { container } = renderWithTheme(
      <DependencyGraph nodes={nodes} edges={edges} />
    );
    expect(container.querySelector("marker#vf-dep-arrow")).toBeTruthy();
  });

  it("uses node label when provided, id otherwise", () => {
    const labeledNodes = [
      { id: "build", label: "Build Step" },
      { id: "test" },
    ];
    const labeledEdges = [{ source: "test", target: "build" }];
    const { getByText } = renderWithTheme(
      <DependencyGraph nodes={labeledNodes} edges={labeledEdges} />
    );
    expect(getByText("Build Step")).toBeTruthy();
    expect(getByText("test")).toBeTruthy();
  });

  it("handles cycles in the graph without crashing", () => {
    const cyclicNodes = [{ id: "a" }, { id: "b" }];
    const cyclicEdges = [
      { source: "a", target: "b" },
      { source: "b", target: "a" },
    ];
    const { container } = renderWithTheme(
      <DependencyGraph nodes={cyclicNodes} edges={cyclicEdges} />
    );
    expect(
      container.querySelectorAll(".vf-chart-dep-graph__node").length
    ).toBe(2);
  });

  it("directed=false suppresses arrow markers on edge ends", () => {
    const { container } = renderWithTheme(
      <DependencyGraph nodes={nodes} edges={edges} directed={false} />
    );
    const lines = container.querySelectorAll(".vf-chart-dep-graph__edge");
    lines.forEach((line) => {
      expect(line.getAttribute("marker-end")).toBeFalsy();
    });
  });

  it("left-right direction reversal (target left of source)", () => {
    // Target has lower layer, so it'll be placed to the left
    const lrNodes = [{ id: "a" }, { id: "b" }];
    const lrEdges = [{ source: "b", target: "a" }];
    const { container } = renderWithTheme(
      <DependencyGraph
        nodes={lrNodes}
        edges={lrEdges}
        direction="left-right"
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-dep-graph__node").length
    ).toBe(2);
  });

  it("top-down reversal (target above source)", () => {
    const tdNodes = [{ id: "a" }, { id: "b" }];
    const tdEdges = [{ source: "b", target: "a" }];
    const { container } = renderWithTheme(
      <DependencyGraph
        nodes={tdNodes}
        edges={tdEdges}
        direction="top-down"
      />
    );
    expect(
      container.querySelectorAll(".vf-chart-dep-graph__node").length
    ).toBe(2);
  });

  it("selectable=false prevents selection dimming on click", () => {
    const { container } = renderWithTheme(
      <DependencyGraph nodes={nodes} edges={edges} selectable={false} />
    );
    const nodeGroup = container.querySelector(".vf-chart-dep-graph__node");
    fireEvent.click(nodeGroup!);
    // No dimmed class should appear
    expect(
      container.querySelector(".vf-chart-dep-graph__node--dimmed")
    ).toBeFalsy();
  });

  it("onNodeClick fires with the node data", () => {
    const onNodeClick = vi.fn();
    const { container } = renderWithTheme(
      <DependencyGraph nodes={nodes} edges={edges} onNodeClick={onNodeClick} />
    );
    const nodeGroup = container.querySelector(".vf-chart-dep-graph__node")!;
    fireEvent.click(nodeGroup);
    expect(onNodeClick).toHaveBeenCalled();
    expect(onNodeClick.mock.calls[0]![0]).toHaveProperty("id");
  });

  it("handles edge with missing source/target gracefully", () => {
    const badEdges = [{ source: "nonexistent", target: "build" }];
    const { container } = renderWithTheme(
      <DependencyGraph nodes={nodes} edges={badEdges} />
    );
    // Should render nodes but skip bad edge
    expect(
      container.querySelectorAll(".vf-chart-dep-graph__node").length
    ).toBe(nodes.length);
  });
});
