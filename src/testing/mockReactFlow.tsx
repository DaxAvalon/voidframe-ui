// mockReactFlow — a stand-in for `@xyflow/react` in unit tests.
//
// React Flow measures nodes with ResizeObserver and renders into a canvas-
// sized viewport, neither of which test DOMs provide, so components that
// render a graph are hard to test without the real library. This factory
// returns a module shape with the commonly used exports so a test can do:
//
//   vi.mock("@xyflow/react", () => mockReactFlow());
//
// `ReactFlow` renders every node through `nodeTypes[node.type]` (or a
// default label) inside `[data-testid="rf-node"]` elements, lists edges as
// `[data-testid="rf-edge"]` elements, and forwards `onNodeClick` /
// `onEdgeClick` / `onPaneClick`. `Controls`, `MiniMap`, `Background`,
// `Panel` and `Handle` render inert placeholders. Hooks return stable
// objects whose functions are no-ops that record calls.

import {
  createElement,
  useCallback,
  useState,
  type CSSProperties,
  type FC,
  type MouseEvent,
  type ReactNode,
} from "react";

export interface MockFlowNode {
  id: string;
  type?: string;
  position?: { x: number; y: number };
  data?: Record<string, unknown>;
  selected?: boolean;
  [key: string]: unknown;
}

export interface MockFlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: ReactNode;
  [key: string]: unknown;
}

export interface MockReactFlowProps {
  nodes?: MockFlowNode[];
  edges?: MockFlowEdge[];
  nodeTypes?: Record<string, FC<MockNodeProps>>;
  edgeTypes?: Record<string, FC<Record<string, unknown>>>;
  onNodeClick?: (event: MouseEvent, node: MockFlowNode) => void;
  onEdgeClick?: (event: MouseEvent, edge: MockFlowEdge) => void;
  onPaneClick?: (event: MouseEvent) => void;
  onNodesChange?: (changes: unknown[]) => void;
  onEdgesChange?: (changes: unknown[]) => void;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

/** Props the mock passes to custom node components (a subset of `NodeProps`). */
export interface MockNodeProps {
  id: string;
  type: string;
  data: Record<string, unknown>;
  selected: boolean;
  dragging: boolean;
  isConnectable: boolean;
  positionAbsoluteX: number;
  positionAbsoluteY: number;
  width?: number;
  height?: number;
  zIndex: number;
  draggable: boolean;
  selectable: boolean;
  deletable: boolean;
}

export interface MockReactFlowInstance {
  fitView: (...args: unknown[]) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (zoom: number) => void;
  setCenter: (x: number, y: number) => void;
  getNodes: () => MockFlowNode[];
  getEdges: () => MockFlowEdge[];
  getNode: (id: string) => MockFlowNode | undefined;
  getEdge: (id: string) => MockFlowEdge | undefined;
  setNodes: (nodes: MockFlowNode[] | ((n: MockFlowNode[]) => MockFlowNode[])) => void;
  setEdges: (edges: MockFlowEdge[] | ((e: MockFlowEdge[]) => MockFlowEdge[])) => void;
  screenToFlowPosition: (p: { x: number; y: number }) => { x: number; y: number };
  flowToScreenPosition: (p: { x: number; y: number }) => { x: number; y: number };
  getViewport: () => { x: number; y: number; zoom: number };
  setViewport: (v: { x: number; y: number; zoom: number }) => void;
  /** Every call made on the instance, for assertions. */
  calls: Array<{ method: string; args: unknown[] }>;
}

export interface MockReactFlowOptions {
  /** Initial viewport returned by `useReactFlow().getViewport()`. */
  viewport?: { x: number; y: number; zoom: number };
}

/**
 * Build a mock module for `@xyflow/react`. Call inside `vi.mock` /
 * `jest.mock`. The returned `instance` is shared by every `useReactFlow()`
 * call so tests can assert on `fitView` etc.
 */
export function mockReactFlow(options: MockReactFlowOptions = {}) {
  let nodesStore: MockFlowNode[] = [];
  let edgesStore: MockFlowEdge[] = [];
  let viewport = options.viewport ?? { x: 0, y: 0, zoom: 1 };
  const calls: MockReactFlowInstance["calls"] = [];
  const record =
    <A extends unknown[]>(method: string, impl?: (...args: A) => void) =>
    (...args: A) => {
      calls.push({ method, args });
      impl?.(...args);
    };

  const instance: MockReactFlowInstance = {
    fitView: record("fitView"),
    zoomIn: record("zoomIn"),
    zoomOut: record("zoomOut"),
    zoomTo: record("zoomTo", (zoom: number) => {
      viewport = { ...viewport, zoom };
    }),
    setCenter: record("setCenter"),
    getNodes: () => nodesStore,
    getEdges: () => edgesStore,
    getNode: (id) => nodesStore.find((n) => n.id === id),
    getEdge: (id) => edgesStore.find((e) => e.id === id),
    setNodes: record("setNodes", (next) => {
      nodesStore = typeof next === "function" ? next(nodesStore) : next;
    }),
    setEdges: record("setEdges", (next) => {
      edgesStore = typeof next === "function" ? next(edgesStore) : next;
    }),
    screenToFlowPosition: (p) => ({ x: (p.x - viewport.x) / viewport.zoom, y: (p.y - viewport.y) / viewport.zoom }),
    flowToScreenPosition: (p) => ({ x: p.x * viewport.zoom + viewport.x, y: p.y * viewport.zoom + viewport.y }),
    getViewport: () => viewport,
    setViewport: record("setViewport", (v) => {
      viewport = v;
    }),
    calls,
  };

  const ReactFlow: FC<MockReactFlowProps> = ({
    nodes = [],
    edges = [],
    nodeTypes = {},
    onNodeClick,
    onEdgeClick,
    onPaneClick,
    children,
    className,
    style,
  }) => {
    nodesStore = nodes;
    edgesStore = edges;
    return createElement(
      "div",
      {
        "data-testid": "rf-root",
        className: ["react-flow", className].filter(Boolean).join(" "),
        style,
        onClick: onPaneClick,
      },
      createElement(
        "div",
        { className: "react-flow__nodes", "data-testid": "rf-nodes" },
        nodes.map((node) => {
          const type = node.type ?? "default";
          const Custom = nodeTypes[type];
          const content = Custom
            ? createElement(Custom, {
                id: node.id,
                type,
                data: node.data ?? {},
                selected: Boolean(node.selected),
                dragging: false,
                isConnectable: true,
                positionAbsoluteX: node.position?.x ?? 0,
                positionAbsoluteY: node.position?.y ?? 0,
                zIndex: 0,
                draggable: true,
                selectable: true,
                deletable: true,
              })
            : createElement("div", { className: "react-flow__node-default" }, String(node.data?.label ?? node.id));
          return createElement(
            "div",
            {
              key: node.id,
              "data-testid": "rf-node",
              "data-id": node.id,
              "data-type": type,
              className: ["react-flow__node", `react-flow__node-${type}`, node.selected ? "selected" : null]
                .filter(Boolean)
                .join(" "),
              onClick: (e: MouseEvent) => {
                e.stopPropagation();
                onNodeClick?.(e, node);
              },
            },
            content
          );
        })
      ),
      createElement(
        "div",
        { className: "react-flow__edges", "data-testid": "rf-edges" },
        edges.map((edge) =>
          createElement(
            "div",
            {
              key: edge.id,
              "data-testid": "rf-edge",
              "data-id": edge.id,
              "data-source": edge.source,
              "data-target": edge.target,
              className: "react-flow__edge",
              onClick: (e: MouseEvent) => {
                e.stopPropagation();
                onEdgeClick?.(e, edge);
              },
            },
            edge.label ?? null
          )
        )
      ),
      children
    );
  };
  ReactFlow.displayName = "MockReactFlow";

  const placeholder = (name: string, className: string): FC<Record<string, unknown>> => {
    const Mock: FC<Record<string, unknown>> = (props) =>
      createElement(
        "div",
        { "data-testid": `rf-${name.toLowerCase()}`, className, style: props.style as CSSProperties | undefined },
        props.children as ReactNode
      );
    Mock.displayName = `Mock${name}`;
    return Mock;
  };

  const Handle: FC<Record<string, unknown>> = (props) =>
    createElement("div", {
      "data-testid": "rf-handle",
      "data-type": props.type,
      "data-position": props.position,
      "data-id": props.id,
      className: ["react-flow__handle", props.className].filter(Boolean).join(" "),
    });
  Handle.displayName = "MockHandle";

  const Position = { Left: "left", Top: "top", Right: "right", Bottom: "bottom" } as const;
  const MarkerType = { Arrow: "arrow", ArrowClosed: "arrowclosed" } as const;

  function useNodesState<N extends MockFlowNode>(initial: N[]) {
    const [nodes, setNodes] = useState<N[]>(initial);
    const onNodesChange = useCallback(() => undefined, []);
    return [nodes, setNodes, onNodesChange] as const;
  }
  function useEdgesState<E extends MockFlowEdge>(initial: E[]) {
    const [edges, setEdges] = useState<E[]>(initial);
    const onEdgesChange = useCallback(() => undefined, []);
    return [edges, setEdges, onEdgesChange] as const;
  }

  return {
    ReactFlow,
    ReactFlowProvider: (({ children }: { children?: ReactNode }) => createElement("div", null, children)) as FC<{
      children?: ReactNode;
    }>,
    Controls: placeholder("Controls", "react-flow__controls"),
    MiniMap: placeholder("MiniMap", "react-flow__minimap"),
    Background: placeholder("Background", "react-flow__background"),
    Panel: placeholder("Panel", "react-flow__panel"),
    Handle,
    Position,
    MarkerType,
    useReactFlow: () => instance,
    useNodesState,
    useEdgesState,
    useNodes: () => nodesStore,
    useEdges: () => edgesStore,
    useStore: <T,>(selector: (s: Record<string, unknown>) => T) => selector({ nodes: nodesStore, edges: edgesStore }),
    addEdge: (edge: MockFlowEdge, edges: MockFlowEdge[]) => [...edges, edge],
    applyNodeChanges: (_changes: unknown[], nodes: MockFlowNode[]) => nodes,
    applyEdgeChanges: (_changes: unknown[], edges: MockFlowEdge[]) => edges,
    /** The shared `useReactFlow()` instance, for assertions. */
    instance,
  };
}

export type MockReactFlowModule = ReturnType<typeof mockReactFlow>;
