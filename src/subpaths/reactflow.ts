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
} from "../components/ReactFlowTheme";
export type { VoidframeReactFlowThemeProps } from "../components/ReactFlowTheme";
