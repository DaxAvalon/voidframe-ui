"use client";

// Phase 18 — HydrationBoundary
//
// Defers rendering of heavy client-only subtrees until after first paint
// so server HTML and client HTML match exactly. Wraps children in a
// `useEffect`-gated boundary that renders `fallback` during SSR and on
// the very first client render, then swaps to the real tree.

import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface HydrationBoundaryProps {
  /** Rendered on the server and until the first client render lands. */
  fallback?: ReactNode;
  /** Real children, rendered only after hydration. */
  children?: ReactNode;
}

/**
 * Suspends a subtree from SSR. Useful for components that inherently
 * can't render server-side (canvas, measurements, time-of-day) without
 * introducing hydration mismatches.
 */
export function HydrationBoundary({
  fallback = null,
  children,
}: HydrationBoundaryProps) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setHydrated(true);
  }, []);
  return <>{hydrated ? children : fallback}</>;
}
