"use client";

// Phase 8 — AppShell
//
// Opinionated page-level scaffold with optional header, sidebar (collapsible),
// right-panel, main area, and footer. Mobile: sidebar collapses to a drawer.
// Keep it plain CSS grid so it's easy to override.

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { cx } from "../utils/cx";
import {
  AppShellSidebarContext,
  type SidebarCollapseMode,
} from "./appShellContext";

export type { SidebarCollapseMode } from "./appShellContext";

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
  /**
   * What collapsing does on desktop: `"hide"` (default) removes the sidebar
   * column; `"rail"` keeps it at `sidebarRailWidth` and a `Sidebar` inside
   * follows into rail mode (icons only, labels as tooltips) unless its own
   * `collapsed` prop is set. On mobile both modes close the drawer.
   */
  sidebarCollapseMode?: SidebarCollapseMode;
  /** Column width while collapsed in `"rail"` mode. Default 56. */
  sidebarRailWidth?: number | string;
  /**
   * When true, adds a drag handle on the sidebar's trailing edge so users
   * can resize it. The width is reported via `onSidebarWidthChange` and
   * stays within `sidebarMinWidth`/`sidebarMaxWidth`.
   */
  sidebarResizable?: boolean;
  /** Minimum width when resizing (px). Default 180. */
  sidebarMinWidth?: number;
  /** Maximum width when resizing (px). Default 480. */
  sidebarMaxWidth?: number;
  /** Fires on each resize with the new width (px). */
  onSidebarWidthChange?: (width: number) => void;
  /** Height of the header in pixels/CSS value. Default "auto". */
  headerHeight?: number | string;
  /**
   * Size the shell to its parent (`height: 100%`) instead of the viewport
   * (`100vh`). Use inside `VoidframeProvider fill` or any sized container.
   */
  fill?: boolean;
  /** Pad the main area. Default true; `false` for apps with their own panel grid. */
  padded?: boolean;
  /** Main-area padding when `padded`; a number is px. Default `--vf-sp-5`. */
  mainPadding?: number | string;
  /** Main-area overflow. Default `"auto"`; `"hidden"` for panels that scroll themselves. */
  mainOverflow?: "auto" | "hidden" | "visible";
  /** Pad the footer. Default true. */
  footerPadded?: boolean;
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
      sidebarCollapseMode = "hide",
      sidebarRailWidth = 56,
      onSidebarCollapsedChange,
      sidebarResizable,
      sidebarMinWidth = 180,
      sidebarMaxWidth = 480,
      onSidebarWidthChange,
      headerHeight,
      fill = false,
      padded = true,
      mainPadding,
      mainOverflow = "auto",
      footerPadded = true,
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

    // Live-resize state. Seeded from `sidebarWidth` prop, updated on drag.
    const initialWidth =
      typeof sidebarWidth === "number" ? sidebarWidth : 240;
    const [liveWidth, setLiveWidth] = useState<number | null>(
      sidebarResizable ? initialWidth : null
    );
    const draggingRef = useRef(false);

    const onResizerMouseDown = useCallback(
      (startEvent: React.MouseEvent<HTMLDivElement>) => {
        if (!sidebarResizable) return;
        startEvent.preventDefault();
        draggingRef.current = true;
        const startX = startEvent.clientX;
        const startWidth = liveWidth ?? initialWidth;
        const onMove = (e: MouseEvent) => {
          if (!draggingRef.current) return;
          const next = Math.max(
            sidebarMinWidth,
            Math.min(sidebarMaxWidth, startWidth + (e.clientX - startX))
          );
          setLiveWidth(next);
          onSidebarWidthChange?.(next);
        };
        const onUp = () => {
          draggingRef.current = false;
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      },
      [sidebarResizable, liveWidth, initialWidth, sidebarMinWidth, sidebarMaxWidth, onSidebarWidthChange]
    );
    // Clean up any lingering listeners on unmount during an active drag.
    useEffect(() => {
      return () => {
        draggingRef.current = false;
      };
    }, []);

    const toggle = () => {
      const next = !collapsed;
      if (sidebarCollapsed === undefined) setInternalCollapsed(next);
      onSidebarCollapsedChange?.(next);
    };

    const effectiveSidebarWidth =
      sidebarResizable && liveWidth !== null ? liveWidth : sidebarWidth;
    const rail = sidebarCollapseMode === "rail" && collapsed && !isMobile;
    const sbW = isMobile
      ? "0px"
      : rail
        ? sizeToCss(sidebarRailWidth)
        : collapsed
          ? "0px"
          : sizeToCss(effectiveSidebarWidth);
    const toggleLabel =
      sidebarCollapseMode === "rail" && !isMobile
        ? collapsed
          ? "Expand sidebar"
          : "Collapse sidebar"
        : collapsed
          ? "Show sidebar"
          : "Hide sidebar";
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
      height: fill ? "100%" : "100vh",
      ...(mainPadding !== undefined
        ? ({ "--vf-appshell-main-padding": sizeToCss(mainPadding) } as CSSProperties)
        : {}),
      ...style,
    };

    return (
      <AppShellSidebarContext.Provider
        value={{ collapsed, mode: sidebarCollapseMode }}
      >
      <div
        ref={ref}
        className={cx(
          "vf-appshell",
          fill && "vf-appshell--fill",
          !padded && "vf-appshell--unpadded",
          mainOverflow !== "auto" && `vf-appshell--main-${mainOverflow}`,
          !footerPadded && "vf-appshell--footer-unpadded",
          className
        )}
        style={gridStyle}
        data-sidebar-collapsed={collapsed ? "true" : undefined}
        data-sidebar-collapse-mode={sidebarCollapseMode}
        {...props}
      >
        {header && (
          <div className="vf-appshell__header">
            {sidebarCollapsible && sidebar && (
              <button
                type="button"
                className="vf-appshell__sidebar-toggle"
                aria-expanded={!collapsed}
                aria-label={toggleLabel}
                onClick={toggle}
              >
                {collapsed ? "›" : "‹"}
              </button>
            )}
            {header}
          </div>
        )}
        {sidebar && (!collapsed || rail) && !isMobile && (
          <aside
            className={cx(
              "vf-appshell__sidebar",
              rail && "vf-appshell__sidebar--rail"
            )}
            data-collapsed={rail ? "true" : undefined}
          >
            {sidebar}
            {sidebarResizable && !rail && (
              <div
                className="vf-appshell__sidebar-resizer"
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize sidebar"
                onMouseDown={onResizerMouseDown}
              />
            )}
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
        <main className="vf-appshell__main">
          {children}
        </main>
        {rightPanel && (
          <aside className="vf-appshell__rightpanel">
            {rightPanel}
          </aside>
        )}
        {footer && (
          <footer className="vf-appshell__footer">
            {footer}
          </footer>
        )}
      </div>
      </AppShellSidebarContext.Provider>
    );
  }
);
AppShell.displayName = "AppShell";
