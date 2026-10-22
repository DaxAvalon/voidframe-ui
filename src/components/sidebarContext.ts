"use client";

// Shared between Sidebar (provider) and NavItem (consumer) so a nav item
// knows when it sits in a collapsed rail and should drop its label, show a
// tooltip and expose the label as its accessible name. Lives in its own
// module so Navigation.tsx and Sidebar.tsx do not import each other.

import { createContext, useContext } from "react";

export type SidebarLabels = "hidden" | "vertical";
export type NavItemActiveStyle = "fill" | "edge";

export interface SidebarContextValue {
  /** True while the sidebar is in rail mode. */
  collapsed: boolean;
  /** How rail mode presents item labels. */
  labels: SidebarLabels;
  /** Default active-item treatment for every NavItem inside. */
  activeStyle?: NavItemActiveStyle;
  /** Passed to `NavItem visible` predicates (roles, flags). */
  navContext?: unknown;
}

export const SidebarContext = createContext<SidebarContextValue>({
  collapsed: false,
  labels: "hidden",
});

/** Read the enclosing Sidebar's state; the default is an expanded sidebar. */
export function useSidebarContext(): SidebarContextValue {
  return useContext(SidebarContext);
}
