import { describe, expect, it } from "vitest";
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
});
