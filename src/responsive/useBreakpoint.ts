"use client";

// Phase 16 — useBreakpoint / useResponsive / useDeviceType

import { useEffect, useMemo, useState } from "react";
import {
  BREAKPOINT_ORDER,
  BREAKPOINTS,
  pickResponsive,
  type Breakpoint,
  type Responsive,
} from "./breakpoints";

function safeMatchMedia(query: string): MediaQueryList | null {
  if (typeof window === "undefined" || !window.matchMedia) return null;
  return window.matchMedia(query);
}

/**
 * Returns the active breakpoint for the current viewport. Defaults to
 * `"base"` on the server / pre-hydration.
 */
export function useBreakpoint(): Breakpoint {
  const queries = useMemo(
    () => ({
      sm: `(min-width: ${BREAKPOINTS.sm}px)`,
      md: `(min-width: ${BREAKPOINTS.md}px)`,
      lg: `(min-width: ${BREAKPOINTS.lg}px)`,
      xl: `(min-width: ${BREAKPOINTS.xl}px)`,
      xxl: `(min-width: ${BREAKPOINTS.xxl}px)`,
    }),
    []
  );

  const [active, setActive] = useState<Breakpoint>(() => resolveInitial(queries));

  useEffect(() => {
    const mqls = (Object.keys(queries) as Array<keyof typeof queries>).map(
      (k) => ({ k, mql: safeMatchMedia(queries[k]!) })
    );
    if (mqls.every((m) => !m.mql)) return;
    const update = () => setActive(resolveFromMatchMedia(queries));
    update();
    const listeners: Array<() => void> = [];
    for (const { mql } of mqls) {
      if (!mql) continue;
      const onChange = () => update();
      mql.addEventListener("change", onChange);
      listeners.push(() => mql.removeEventListener("change", onChange));
    }
    return () => listeners.forEach((l) => l());
  }, [queries]);

  return active;
}

function resolveInitial(queries: Record<string, string>): Breakpoint {
  if (typeof window === "undefined") return "base";
  return resolveFromMatchMedia(queries);
}

function resolveFromMatchMedia(queries: Record<string, string>): Breakpoint {
  const matches = (k: string) => safeMatchMedia(queries[k]!)?.matches ?? false;
  if (matches("xxl")) return "xxl";
  if (matches("xl")) return "xl";
  if (matches("lg")) return "lg";
  if (matches("md")) return "md";
  if (matches("sm")) return "sm";
  return "base";
}

/**
 * Collapse a `Responsive<T>` value to the value that applies to the current
 * viewport.
 */
export function useResponsive<T>(value: Responsive<T>): T | undefined {
  const active = useBreakpoint();
  return pickResponsive(value, active);
}

export type DeviceType = "mobile" | "tablet" | "desktop";

/**
 * Coarse device-class detection. Returns one of `"mobile"` / `"tablet"` /
 * `"desktop"` based on the active breakpoint.
 */
export function useDeviceType(): DeviceType {
  const bp = useBreakpoint();
  const idx = BREAKPOINT_ORDER.indexOf(bp);
  if (idx >= BREAKPOINT_ORDER.indexOf("lg")) return "desktop";
  if (idx >= BREAKPOINT_ORDER.indexOf("md")) return "tablet";
  return "mobile";
}
