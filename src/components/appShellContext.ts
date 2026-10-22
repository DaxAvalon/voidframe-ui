"use client";

// Lets a Sidebar inside AppShell follow the shell's collapse state when the
// shell is in `sidebarCollapseMode="rail"`, without the consumer wiring the
// `collapsed` prop through by hand.

import { createContext, useContext } from "react";

export type SidebarCollapseMode = "hide" | "rail";

export interface AppShellSidebarContextValue {
  collapsed: boolean;
  mode: SidebarCollapseMode;
}

export const AppShellSidebarContext =
  createContext<AppShellSidebarContextValue | null>(null);

export function useAppShellSidebar(): AppShellSidebarContextValue | null {
  return useContext(AppShellSidebarContext);
}
