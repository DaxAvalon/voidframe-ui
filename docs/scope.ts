// Shared scope for every <Playground> on the docs site. Kept as a single
// module so each content page imports from one place and the bundle stays
// tree-shake-friendly for the demo app.
import * as React from "react";
import * as voidframe from "../src";

export const playgroundScope: Record<string, unknown> = {
  ...voidframe,
  React,
  useState: React.useState,
  useEffect: React.useEffect,
  useMemo: React.useMemo,
  useCallback: React.useCallback,
  useRef: React.useRef,
};
