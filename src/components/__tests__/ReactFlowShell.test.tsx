import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderWithTheme } from "../../testing/renderWithTheme";
import {
  FlowNode,
  FLOW_DASH,
  flowKindColor,
  flowKindSlot,
  useVoidframeReactFlowStyles,
} from "../ReactFlowTheme";
import { readToken, readTokens } from "../../utils/readToken";
import { useVoidframeTokens } from "../../hooks/useVoidframeTokens";
import { computeLayers, forceLayout, layeredLayout } from "../../charts/layout/graph";
import { mockReactFlow } from "../../testing/mockReactFlow";

describe("FlowNode", () => {
  it("renders kind, title, body, mono and a kind-coloured rail with data-state", () => {
    renderWithTheme(
      <FlowNode kind="service" title="billing-api" mono="svc/billing" rail state="highlighted" data-testid="n">
        Handles invoices
      </FlowNode>
    );
    const node = screen.getByTestId("n");
    expect(node).toHaveAttribute("data-state", "highlighted");
    expect(node.querySelector(".vf-flow-node__kind")?.textContent).toBe("service");
    expect(node.querySelector(".vf-flow-node__title")?.textContent).toBe("billing-api");
    expect(node.querySelector(".vf-flow-node__body")?.textContent).toBe("Handles invoices");
    expect(node.querySelector(".vf-flow-node__mono")?.textContent).toBe("svc/billing");
    const rail = node.querySelector(".vf-flow-node__rail") as HTMLElement;
    expect(rail.style.background).toBe(flowKindColor("service"));
  });

  it("maps React Flow's selected flag to data-state=selected and renders handles", () => {
    renderWithTheme(
      <FlowNode title="a" selected handles={<span data-testid="h" className="react-flow__handle" />} data-testid="n" />
    );
    expect(screen.getByTestId("n")).toHaveAttribute("data-state", "selected");
    expect(screen.getByTestId("h")).toBeInTheDocument();
  });

  it("an explicit state wins over selected; no state attribute otherwise", () => {
    renderWithTheme(<FlowNode title="a" selected state="danger" data-testid="n" />);
    expect(screen.getByTestId("n")).toHaveAttribute("data-state", "danger");
    renderWithTheme(<FlowNode title="b" data-testid="m" />);
    expect(screen.getByTestId("m")).not.toHaveAttribute("data-state");
  });

  it("accepts a colour string or a node for the rail", () => {
    renderWithTheme(<FlowNode title="a" rail="var(--vf-red)" data-testid="n" />);
    const rail = screen.getByTestId("n").querySelector(".vf-flow-node__rail") as HTMLElement;
    expect(rail.style.background).toBe("var(--vf-red)");
    renderWithTheme(<FlowNode title="b" rail={<i data-testid="bar" />} data-testid="m" />);
    expect(screen.getByTestId("bar")).toBeInTheDocument();
  });
});

describe("flowKindColor", () => {
  it("is stable for strings, positional for ordered kinds, cycling for numbers", () => {
    expect(flowKindColor("service")).toBe(flowKindColor("service"));
    expect(flowKindColor("service")).toMatch(/^var\(--vf-chart-[1-8]\)$/);
    expect(flowKindSlot("db", ["service", "db", "queue"])).toBe(2);
    expect(flowKindSlot("unknown", ["service", "db"])).toBe(flowKindSlot("unknown"));
    expect(flowKindSlot(0)).toBe(1);
    expect(flowKindSlot(8)).toBe(1);
    expect(flowKindSlot(9)).toBe(2);
    expect(flowKindSlot(-1)).toBe(8);
  });
});

describe("useVoidframeReactFlowStyles", () => {
  it("returns edge, label and panel styles with dash presets", () => {
    let styles: ReturnType<typeof useVoidframeReactFlowStyles> | null = null;
    function Probe() {
      styles = useVoidframeReactFlowStyles();
      return null;
    }
    render(<Probe />);
    expect(styles!.edgeStyle()).toMatchObject({ stroke: "var(--vf-border-3)", strokeWidth: 1.5 });
    expect(styles!.edgeStyle("db", { dash: "dashed", width: 2, dimmed: true })).toMatchObject({
      stroke: flowKindColor("db"),
      strokeDasharray: FLOW_DASH.dashed,
      strokeWidth: 2,
      opacity: 0.35,
    });
    expect(styles!.edgeLabelStyle.fill).toBe("var(--vf-text-1)");
    expect(styles!.edgeLabelBgStyle.fill).toBe("var(--vf-bg-2)");
    expect(styles!.panel.background).toBe("var(--vf-bg-2)");
    expect(styles!.dash.dotted).toBe("2 3");
  });
});

describe("readToken / useVoidframeTokens", () => {
  it("reads custom properties from the element's computed style and falls back when unset", () => {
    const el = document.createElement("div");
    el.style.setProperty("--vf-probe", "rgb(1, 2, 3)");
    document.body.appendChild(el);
    const value = readToken("--vf-probe", { element: el });
    // happy-dom resolves inline custom properties; a DOM that doesn't yields "".
    expect(value === "rgb(1, 2, 3)" || value === "").toBe(true);
    expect(readToken("probe-unset", { element: el, fallback: "#000" })).toBe("#000");
    expect(readTokens(["a", "b"], { element: el, fallbacks: { a: "x" } })).toEqual({ a: "x", b: "" });
    el.remove();
  });

  it("the hook returns fallbacks first and re-reads on a theme attribute change", async () => {
    const reads: string[] = [];
    const spy = vi.spyOn(window, "getComputedStyle").mockImplementation(
      () =>
        ({
          getPropertyValue: (name: string) => {
            reads.push(name);
            return document.documentElement.getAttribute("data-vf-theme") === "light" ? "#fff" : "#000";
          },
        }) as unknown as CSSStyleDeclaration
    );
    const seen: string[] = [];
    function Probe() {
      const t = useVoidframeTokens(["bg-0"], { fallbacks: { "bg-0": "pending" } });
      seen.push(t["bg-0"]);
      return <span data-testid="v">{t["bg-0"]}</span>;
    }
    render(<Probe />);
    expect(seen[0]).toBe("pending");
    await screen.findByText("#000");
    expect(reads).toContain("--vf-bg-0");
    document.documentElement.setAttribute("data-vf-theme", "light");
    await screen.findByText("#fff");
    document.documentElement.removeAttribute("data-vf-theme");
    spy.mockRestore();
  });
});

describe("graph layouts", () => {
  const nodes = [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }];
  const edges = [
    { source: "a", target: "b" },
    { source: "a", target: "c" },
    { source: "b", target: "d" },
    { source: "c", target: "d" },
  ];

  it("computeLayers places roots at 0 and breaks cycles", () => {
    const layers = computeLayers(nodes, edges);
    expect([...layers.entries()]).toEqual([["a", 0], ["b", 1], ["c", 1], ["d", 2]]);
    const cyc = computeLayers([{ id: "x" }, { id: "y" }], [
      { source: "x", target: "y" },
      { source: "y", target: "x" },
    ]);
    expect(cyc.get("y")).toBe(1);
    expect(cyc.get("x")).toBe(2);
  });

  it("layeredLayout is deterministic and centres narrower layers", () => {
    const a = layeredLayout(nodes, edges, { nodeWidth: 100, nodeHeight: 40, layerGap: 60, siblingGap: 20 });
    const b = layeredLayout(nodes, edges, { nodeWidth: 100, nodeHeight: 40, layerGap: 60, siblingGap: 20 });
    expect([...a.positions]).toEqual([...b.positions]);
    expect(a.width).toBe(220);
    expect(a.height).toBe(240);
    expect(a.positions.get("a")).toEqual({ x: 60, y: 0 });
    expect(a.positions.get("b")).toEqual({ x: 0, y: 100 });
    expect(a.positions.get("c")).toEqual({ x: 120, y: 100 });
    expect(a.positions.get("d")).toEqual({ x: 60, y: 200 });
    const lr = layeredLayout(nodes, edges, { direction: "left-right" });
    expect(lr.positions.get("b")!.x).toBe(lr.positions.get("c")!.x);
    expect(lr.positions.get("d")!.x).toBeGreaterThan(lr.positions.get("b")!.x);
  });

  it("barycenter ordering reduces crossings and keeps a stable tiebreak", () => {
    const n = [{ id: "r1" }, { id: "r2" }, { id: "l1" }, { id: "l2" }];
    const e = [
      { source: "r1", target: "l2" },
      { source: "r2", target: "l1" },
    ];
    const out = layeredLayout(n, e, { order: "barycenter" });
    expect(out.positions.get("l2")!.x).toBeLessThan(out.positions.get("l1")!.x);
    const input = layeredLayout(n, e);
    expect(input.positions.get("l1")!.x).toBeLessThan(input.positions.get("l2")!.x);
  });

  it("forceLayout is deterministic for a seed and differs across seeds", () => {
    const p1 = forceLayout(nodes, edges, { seed: 7, iterations: 50 });
    const p2 = forceLayout(nodes, edges, { seed: 7, iterations: 50 });
    const p3 = forceLayout(nodes, edges, { seed: 8, iterations: 50 });
    expect([...p1]).toEqual([...p2]);
    expect([...p1]).not.toEqual([...p3]);
    for (const { x, y } of p1.values()) {
      expect(Number.isFinite(x) && Number.isFinite(y)).toBe(true);
    }
    expect(forceLayout([], []).size).toBe(0);
  });
});

describe("mockReactFlow", () => {
  it("renders nodes through nodeTypes, edges, and forwards clicks", () => {
    const rf = mockReactFlow();
    const onNodeClick = vi.fn();
    const nodeTypes = {
      service: (p: { data: Record<string, unknown>; selected: boolean }) =>
        createElement(FlowNode, { title: String(p.data.name), selected: p.selected, "data-testid": "shell" } as never),
    };
    render(
      createElement(
        rf.ReactFlow,
        {
          nodes: [
            { id: "1", type: "service", data: { name: "api" }, selected: true },
            { id: "2", data: { label: "plain" } },
          ],
          edges: [{ id: "e", source: "1", target: "2", label: "calls" }],
          nodeTypes,
          onNodeClick,
        },
        createElement(rf.Controls, null),
        createElement(rf.MiniMap, null),
        createElement(rf.Panel, { position: "top-left" }, "legend")
      )
    );
    expect(screen.getAllByTestId("rf-node")).toHaveLength(2);
    expect(screen.getByTestId("shell")).toHaveAttribute("data-state", "selected");
    expect(screen.getByText("plain")).toBeInTheDocument();
    expect(screen.getByTestId("rf-edge")).toHaveTextContent("calls");
    expect(screen.getByTestId("rf-controls")).toBeInTheDocument();
    expect(screen.getByText("legend")).toBeInTheDocument();
    fireEvent.click(screen.getByText("plain"));
    expect(onNodeClick).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ id: "2" }));
    expect(rf.instance.getNodes()).toHaveLength(2);
    rf.instance.fitView({ padding: 0.2 });
    expect(rf.instance.calls).toContainEqual({ method: "fitView", args: [{ padding: 0.2 }] });
    expect(rf.Position.Top).toBe("top");
  });
});
