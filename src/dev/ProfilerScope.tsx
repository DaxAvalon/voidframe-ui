"use client";

import { Profiler, type ReactNode } from "react";
import { recordRender } from "./useRenderProfiler";

export interface ProfilerScopeProps {
  id: string;
  children: ReactNode;
  /** When false, the scope renders children without profiling overhead. */
  enabled?: boolean;
}

export function ProfilerScope({
  id,
  children,
  enabled = true,
}: ProfilerScopeProps) {
  if (!enabled) return <>{children}</>;
  return (
    <Profiler id={id} onRender={recordRender}>
      {children}
    </Profiler>
  );
}
ProfilerScope.displayName = "ProfilerScope";
