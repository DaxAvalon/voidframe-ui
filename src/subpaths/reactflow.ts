// Per-category tree-shaking subpath. Voidframe theme bridge for
// `@xyflow/react`. Consumers who use ReactFlow + voidframe import
// this subpath to scope voidframe tokens onto ReactFlow primitives.
//
//   import { VoidframeReactFlowTheme } from "voidframe-ui/reactflow";
//
// `@xyflow/react` is declared as an optional peer dep — install it
// alongside voidframe-ui only if you actually use ReactFlow.

export {
  VoidframeReactFlowTheme,
  useVoidframeReactFlowStyles,
  FlowNode,
  ReactFlowNodeShell,
  flowKindColor,
  flowKindSlot,
  flowKindColorValue,
  FLOW_DASH,
  FLOW_KIND_SLOTS,
} from "../components/ReactFlowTheme";
export type {
  VoidframeReactFlowThemeProps,
  VoidframeReactFlowStyles,
  FlowNodeProps,
  FlowNodeState,
  FlowDash,
  FlowEdgeStyleOptions,
} from "../components/ReactFlowTheme";

// Token access for props that need a concrete colour string.
export { readToken, readTokens } from "../utils/readToken";
export type { ReadTokenOptions } from "../utils/readToken";
export { useVoidframeTokens } from "../hooks/useVoidframeTokens";
export type { UseVoidframeTokensOptions } from "../hooks/useVoidframeTokens";

// Deterministic layouts for graphs that have no stored positions.
export {
  layeredLayout,
  forceLayout,
  computeLayers,
  seededRandom,
} from "../charts/layout/graph";
export type {
  GraphLayoutNode,
  GraphLayoutEdge,
  GraphPosition,
  LayeredLayoutOptions,
  LayeredLayoutResult,
  ForceLayoutOptions,
} from "../charts/layout/graph";
