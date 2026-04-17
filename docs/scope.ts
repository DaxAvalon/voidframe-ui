// Shared scope for every <Playground> on the docs site. Kept as a single
// module so each content page imports from one place and the bundle stays
// tree-shake-friendly for the demo app.
import * as React from "react";
import * as voidframe from "../src";
// Import OrgChart directly to avoid pulling in the full charts barrel
// (which has d3 peer dependencies that may not be installed).
import { OrgChart } from "../src/charts/OrgChart";

export const playgroundScope: Record<string, unknown> = {
  ...voidframe,
  OrgChart,
  // Aliases for components exported under different names
  TokenCounter: (voidframe as any).ChatTokenCounter,
  React,
  useState: React.useState,
  useEffect: React.useEffect,
  useMemo: React.useMemo,
  useCallback: React.useCallback,
  useRef: React.useRef,
};
