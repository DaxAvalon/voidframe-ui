// Shared scope for every <Playground> on the docs site. Kept as a single
// module so each content page imports from one place.
import * as React from "react";
import * as voidframe from "../src";
import * as charts from "../src/charts";

export const playgroundScope: Record<string, unknown> = {
  ...voidframe,
  // Charts — spread the full barrel so every chart component is available.
  // D3 peer deps are installed as devDependencies, resolved by Vite.
  ...charts,
  // Aliases for components exported under different names
  TokenCounter: (voidframe as any).ChatTokenCounter,
  React,
  useState: React.useState,
  useEffect: React.useEffect,
  useMemo: React.useMemo,
  useCallback: React.useCallback,
  useRef: React.useRef,
};
