"use client";

// Phase 8 — AppShell
//
// Opinionated page-level scaffold with optional header, sidebar (collapsible),
// right-panel, main area, and footer. Mobile: sidebar collapses to a drawer.
// Keep it plain CSS grid so it's easy to override.

import {
  forwardRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { cx } from "../utils/cx";

export interface AppShellProps extends HTMLAttributes<HTMLDivElement> {
  header?: ReactNode;
  sidebar?: ReactNode;
  rightPanel?: ReactNode;
  footer?: ReactNode;
  /** Width of the sidebar. Default 240. */
  sidebarWidth?: number | string;
  /** Width of the right panel. Default 320. */
  rightPanelWidth?: number | string;
  /** When true, exposes a collapse toggle to hide the sidebar. */
  sidebarCollapsible?: boolean;
  /** Initial collapsed state for the sidebar. */
  sidebarDefaultCollapsed?: boolean;
  /** Controlled sidebar collapsed state. */
  sidebarCollapsed?: boolean;
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  /** Height of the header in pixels/CSS value. Default "auto". */
  headerHeight?: number | string;
  /** Viewport width at which the sidebar becomes a mobile overlay drawer. Default 768. */
  mobileBreakpoint?: number;
  children?: ReactNode;
  style?: CSSProperties;
}

function sizeToCss(n: number | string): string {
  return typeof n === "number" ? `${n}px` : n;
}

/**
 * The top-level layout shell combining a sidebar, header, and main content area.
 * Provides a consistent application chrome with configurable sizing for each region.
 */
export const AppShell = forwardRef<HTMLDivElement, AppShellProps>(
  function AppShell(
    {
      header,
      sidebar,
      rightPanel,
      footer,
      sidebarWidth = 240,
      rightPanelWidth = 320,
      sidebarCollapsible,
      sidebarDefaultCollapsed,
      sidebarCollapsed,
      onSidebarCollapsedChange,
      headerHeight,
      mobileBreakpoint = 768,
      children,
      className,
      style,
      ...props
    },
    ref
  ) {
    const isMobile = useMediaQuery(`(max-width: ${mobileBreakpoint}px)`);
    const [internalCollapsed, setInternalCollapsed] = useState<boolean>(
      sidebarDefaultCollapsed ?? false
    );
    const collapsed = sidebarCollapsed ?? internalCollapsed;

    const toggle = () => {
      const next = !collapsed;
      if (sidebarCollapsed === undefined) setInternalCollapsed(next);
      onSidebarCollapsedChange?.(next);
    };

    const sbW = isMobile || collapsed ? "0px" : sizeToCss(sidebarWidth);
    const rpW = rightPanel ? sizeToCss(rightPanelWidth) : "0px";
    const hH = headerHeight !== undefined ? sizeToCss(headerHeight) : "auto";

    const gridStyle: CSSProperties = {
      display: "grid",
      gridTemplateColumns: `${sbW} 1fr ${rpW}`,
      gridTemplateRows: `${hH} 1fr auto`,
      gridTemplateAreas: `
        "header header header"
        "sidebar main rightpanel"
        "footer footer footer"
      `,
      minHeight: "100vh",
      ...style,
    };

    return (
      <div
        ref={ref}
        className={cx("vf-appshell", className)}
        style={gridStyle}
        {...props}
      >
        {header && (
          <div
            className="vf-appshell__header"
            style={{ gridArea: "header" }}
          >
            {sidebarCollapsible && sidebar && (
              <button
                type="button"
                className="vf-appshell__sidebar-toggle"
                aria-expanded={!collapsed}
                aria-label={collapsed ? "Show sidebar" : "Hide sidebar"}
                onClick={toggle}
              >
                {collapsed ? "›" : "‹"}
              </button>
            )}
            {header}
          </div>
        )}
        {sidebar && !collapsed && !isMobile && (
          <aside
            className="vf-appshell__sidebar"
            style={{ gridArea: "sidebar" }}
          >
            {sidebar}
          </aside>
        )}
        {sidebar && isMobile && !collapsed && (
          <>
            <div
              className="vf-appshell__mobile-backdrop"
              onClick={toggle}
              aria-hidden="true"
            />
            <aside className="vf-appshell__sidebar--mobile">
              {sidebar}
            </aside>
          </>
        )}
        <main
          className="vf-appshell__main"
          style={{ gridArea: "main" }}
        >
          {children}
        </main>
        {rightPanel && (
          <aside
            className="vf-appshell__rightpanel"
            style={{ gridArea: "rightpanel" }}
          >
            {rightPanel}
          </aside>
        )}
        {footer && (
          <footer
            className="vf-appshell__footer"
            style={{ gridArea: "footer" }}
          >
            {footer}
          </footer>
        )}
      </div>
    );
  }
);
AppShell.displayName = "AppShell";
