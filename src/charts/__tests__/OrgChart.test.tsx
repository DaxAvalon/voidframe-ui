import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";
import { OrgChart, type OrgChartNode } from "../OrgChart";

const singleNode: OrgChartNode = {
  id: "ceo",
  label: "CEO",
  description: "Chief Executive",
};

const treeData: OrgChartNode = {
  id: "ceo",
  label: "CEO",
  description: "Chief Executive",
  children: [
    {
      id: "cto",
      label: "CTO",
      description: "Technology",
      children: [
        { id: "eng1", label: "Engineer 1" },
        { id: "eng2", label: "Engineer 2" },
      ],
    },
    {
      id: "cfo",
      label: "CFO",
      description: "Finance",
      children: [{ id: "acc1", label: "Accountant" }],
    },
  ],
};

describe("OrgChart", () => {
  // 1. Renders root node with label
  it("renders root node with label", () => {
    const { container } = renderWithTheme(<OrgChart data={singleNode} />);
    expect(container.querySelector(".vf-org-chart__node-label")).toBeTruthy();
    expect(
      container.querySelector(".vf-org-chart__node-label")!.textContent
    ).toBe("CEO");
  });

  // 2. Renders child nodes connected to root
  it("renders child nodes connected to root", () => {
    const { container } = renderWithTheme(<OrgChart data={treeData} />);
    const nodes = container.querySelectorAll(".vf-org-chart__node");
    // root + 2 children + 3 grandchildren = 6
    expect(nodes.length).toBe(6);
    // At least 5 connectors (parent->child edges)
    const connectors = container.querySelectorAll(".vf-org-chart__connector");
    expect(connectors.length).toBeGreaterThanOrEqual(5);
  });

  // 3. Multi-level hierarchy (3 levels)
  it("renders multi-level hierarchy (3 levels)", () => {
    const { container } = renderWithTheme(<OrgChart data={treeData} />);
    // Verify all 3 levels render: CEO, CTO+CFO, Engineer1+Engineer2+Accountant
    expect(container.querySelector(".vf-org-chart__node-label")!.textContent).toBe("CEO");
    const allLabels = Array.from(
      container.querySelectorAll(".vf-org-chart__node-label")
    ).map((el) => el.textContent);
    expect(allLabels).toContain("CEO");
    expect(allLabels).toContain("CTO");
    expect(allLabels).toContain("Engineer 1");
  });

  // 4. Default top-down direction
  it("defaults to top-down direction", () => {
    const { container } = renderWithTheme(<OrgChart data={treeData} />);
    // In top-down mode, root node should be at the top (y=0)
    const firstNode = container.querySelector(".vf-org-chart__node");
    const transform = firstNode!.getAttribute("transform");
    // Root starts at y=0
    expect(transform).toMatch(/translate\(\d+(\.\d+)?,\s*0\)/);
  });

  // 5. direction="left-right" changes layout
  it("direction='left-right' changes layout", () => {
    const { container } = renderWithTheme(
      <OrgChart data={treeData} direction="left-right" />
    );
    // In left-right mode, root should be at x=0
    const firstNode = container.querySelector(".vf-org-chart__node");
    const transform = firstNode!.getAttribute("transform");
    expect(transform).toMatch(/translate\(0,/);
  });

  // 6. Custom renderNode renders custom content
  it("renders custom content via renderNode", () => {
    const { container } = renderWithTheme(
      <OrgChart
        data={singleNode}
        renderNode={(node) => (
          <div data-testid="custom-node">{node.label}</div>
        )}
      />
    );
    const foreignObj = container.querySelector("foreignObject");
    expect(foreignObj).toBeTruthy();
    expect(container.querySelector("[data-testid='custom-node']")).toBeTruthy();
  });

  // 7. onNodeClick fires with node data
  it("onNodeClick fires with node data", () => {
    const onClick = vi.fn();
    const { container } = renderWithTheme(
      <OrgChart data={treeData} onNodeClick={onClick} />
    );
    const nodeGroup = container.querySelector(".vf-org-chart__node");
    fireEvent.click(nodeGroup!);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick.mock.calls[0]![0]).toHaveProperty("id", "ceo");
    expect(onClick.mock.calls[0]![0]).toHaveProperty("label", "CEO");
  });

  // 8. Collapsible: toggle hides children
  it("collapsible toggle hides children", () => {
    const { container } = renderWithTheme(<OrgChart data={treeData} />);
    // Initially all 6 nodes visible
    expect(container.querySelectorAll(".vf-org-chart__node").length).toBe(6);

    // Click collapse toggle on root (CEO)
    const toggles = container.querySelectorAll(
      ".vf-org-chart__collapse-toggle"
    );
    expect(toggles.length).toBeGreaterThan(0);
    fireEvent.click(toggles[0]!);

    // After collapsing root, only root should be visible
    expect(container.querySelectorAll(".vf-org-chart__node").length).toBe(1);
  });

  // 9. Expand reveals children
  it("expand reveals children after collapse", () => {
    const { container } = renderWithTheme(
      <OrgChart data={treeData} defaultExpandedIds={["ceo"]} />
    );
    // Only CEO, CTO, CFO visible (CTO and CFO not expanded)
    expect(container.querySelectorAll(".vf-org-chart__node").length).toBe(3);

    // Find and click the CTO toggle to expand
    const toggles = container.querySelectorAll(
      ".vf-org-chart__collapse-toggle"
    );
    // CTO toggle: click it to expand
    const ctoToggle = toggles[1]; // second toggle is CTO's
    fireEvent.click(ctoToggle!);

    // Now CTO's children should appear
    expect(container.querySelectorAll(".vf-org-chart__node").length).toBe(5);
  });

  // 10. Controlled expandedIds
  it("respects controlled expandedIds", () => {
    const onChange = vi.fn();
    const { container } = renderWithTheme(
      <OrgChart
        data={treeData}
        expandedIds={["ceo"]}
        onExpandChange={onChange}
      />
    );
    // Only CEO + direct children visible (CTO/CFO not expanded)
    expect(container.querySelectorAll(".vf-org-chart__node").length).toBe(3);

    // Click toggle - should call onChange but not change displayed state
    const toggles = container.querySelectorAll(
      ".vf-org-chart__collapse-toggle"
    );
    fireEvent.click(toggles[0]!);
    expect(onChange).toHaveBeenCalled();
  });

  // 11. Uncontrolled defaultExpandedIds
  it("uses defaultExpandedIds for initial state", () => {
    const { container } = renderWithTheme(
      <OrgChart data={treeData} defaultExpandedIds={["ceo", "cto"]} />
    );
    // CEO + CTO + CFO + eng1 + eng2 = 5 (CFO not expanded)
    expect(container.querySelectorAll(".vf-org-chart__node").length).toBe(5);
  });

  // 12. collapsible={false} hides toggles
  it("collapsible={false} hides collapse toggles", () => {
    const { container } = renderWithTheme(
      <OrgChart data={treeData} collapsible={false} />
    );
    expect(
      container.querySelectorAll(".vf-org-chart__collapse-toggle").length
    ).toBe(0);
  });

  // 13. Connector styles
  it.each(["straight", "curved", "step"] as const)(
    "renders %s connectors",
    (connStyle) => {
      const { container } = renderWithTheme(
        <OrgChart data={treeData} connectorStyle={connStyle} />
      );
      const connectors = container.querySelectorAll(
        `.vf-org-chart__connector--${connStyle}`
      );
      expect(connectors.length).toBeGreaterThan(0);
    }
  );

  // 14. Zoom controls
  it("zoom controls change zoom level", () => {
    const { container } = renderWithTheme(<OrgChart data={treeData} />);
    const zoomIn = container.querySelector(
      "[aria-label='Zoom in']"
    ) as HTMLButtonElement;
    const zoomOut = container.querySelector(
      "[aria-label='Zoom out']"
    ) as HTMLButtonElement;
    expect(zoomIn).toBeTruthy();
    expect(zoomOut).toBeTruthy();

    const svg = container.querySelector(".vf-org-chart__svg") as SVGSVGElement;
    const initialScale = svg.style.transform;

    fireEvent.click(zoomIn!);
    const afterZoomIn = svg.style.transform;
    expect(afterZoomIn).not.toBe(initialScale);

    fireEvent.click(zoomOut!);
    // After zoom out it should be back to approximately initial
    const afterZoomOut = svg.style.transform;
    expect(afterZoomOut).toBe(initialScale);
  });

  // 15. Sizes
  it.each(["sm", "md"] as const)("renders with size=%s", (sz) => {
    const { container } = renderWithTheme(
      <OrgChart data={treeData} size={sz} />
    );
    expect(
      container.querySelector(`.vf-org-chart--${sz}`)
    ).toBeTruthy();
  });

  // 16. Single node without children renders without connectors
  it("single node (no children) renders without connectors", () => {
    const { container } = renderWithTheme(<OrgChart data={singleNode} />);
    expect(container.querySelectorAll(".vf-org-chart__node").length).toBe(1);
    expect(
      container.querySelectorAll(".vf-org-chart__connector").length
    ).toBe(0);
    expect(
      container.querySelectorAll(".vf-org-chart__collapse-toggle").length
    ).toBe(0);
  });

  // 17. A11y
  it("passes a11y audit", async () => {
    const { container } = renderWithTheme(<OrgChart data={treeData} />);
    await expectNoA11yViolations(container);
  });
});
