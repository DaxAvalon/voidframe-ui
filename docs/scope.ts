// Shared scope for every <Playground> on the docs site. Kept as a single
// module so each content page imports from one place.
import * as React from "react";
import * as voidframe from "../src";
import * as charts from "../src/charts";
import * as reactflow from "../src/subpaths/reactflow";

export const playgroundScope: Record<string, unknown> = {
  ...voidframe,
  // Charts — spread the full barrel so every chart component is available.
  // D3 peer deps are installed as devDependencies, resolved by Vite.
  ...charts,
  // ReactFlow shells and helpers — the module has no @xyflow/react import,
  // so the node shell renders standalone in the playground.
  ...reactflow,
  // Aliases for components exported under different names
  TokenCounter: (voidframe as any).ChatTokenCounter,
  React,
  useState: React.useState,
  useEffect: React.useEffect,
  useMemo: React.useMemo,
  useCallback: React.useCallback,
  useRef: React.useRef,
};
