"use client";

// Phase 8 — Sidebar (compound)
//
// Vertical navigation container with brand, sections (labeled groups), nav
// items, separators, and a footer slot. Supports a "rail" collapse variant
// that hides labels to just icons.

import {
  createContext,
  forwardRef,
  useContext,
  useId as useReactId,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { useDisclosure } from "../hooks/useDisclosure";
import { Label } from "./Text";

interface SidebarContextValue {
  collapsed: boolean;
}
const SidebarContext = createContext<SidebarContextValue>({ collapsed: false });

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /** When true, collapses labels so only icons remain (rail mode). */
  collapsed?: boolean;
  /**
   * Collapse to rail mode automatically below the `md` breakpoint. Default
   * true. Use `adaptive={false}` when the sidebar is already inside a
   * mobile-aware shell (e.g. AppShell with `drawerMobile`).
   */
  adaptive?: boolean;
  children?: ReactNode;
}

const SidebarBase = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  { collapsed = false, adaptive = true, className, children, ...props },
  ref
) {
  return (
    <SidebarContext.Provider value={{ collapsed }}>
      <aside
        ref={ref}
        aria-label="Sidebar"
        className={cx(
          "vf-sidebar",
          collapsed && "vf-sidebar--collapsed",
          adaptive && "vf-sidebar--adaptive",
          className
        )}
        data-adaptive={adaptive ? "true" : undefined}
        {...props}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  );
});
SidebarBase.displayName = "Sidebar";

function SidebarBrand({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const { collapsed } = useContext(SidebarContext);
  return (
    <div
      className={cx(
        "vf-sidebar__brand",
        collapsed && "vf-sidebar__brand--collapsed",
        className
      )}
      {...props}
    />
  );
}

export interface SidebarSectionProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode;
  /**
   * When true, the section becomes an expand/collapse group with a
   * disclosure triangle on its header. Clicking the label toggles the
   * children visibility. Useful for list-heavy sidebars (conversations,
   * agents, saved searches, etc.).
   */
  collapsible?: boolean;
  /** Initial open state when `collapsible`. Defaults to open. */
  defaultOpen?: boolean;
  /** Controlled open state. When set, overrides `defaultOpen`. */
  open?: boolean;
  /** Fires whenever the open state changes (controlled or uncontrolled). */
  onOpenChange?: (open: boolean) => void;
  /**
   * Optional action slot rendered next to the section label (e.g. a `+`
   * button for "add new conversation"). Positioned on the opposite end of
   * the header; click propagation stops at the action so the toggle isn't
   * triggered alongside the action.
   */
  action?: ReactNode;
}

function SidebarSection({
  label,
  className,
  children,
  collapsible,
  defaultOpen = true,
  open,
  onOpenChange,
  action,
  ...props
}: SidebarSectionProps) {
  const { collapsed } = useContext(SidebarContext);
  const disclosure = useDisclosure({ open, defaultOpen, onOpenChange });
  const showHeader = label !== undefined && !collapsed;
  const showChildren = !collapsible || disclosure.open;
  const reactId = useReactId();
  const contentId = `vf-sidebar-section-${reactId}-content`;
  const labelId = `vf-sidebar-section-${reactId}-label`;

  return (
    <div
      className={cx(
        "vf-sidebar__section",
        collapsible && "vf-sidebar__section--collapsible",
        className
      )}
      data-open={collapsible ? disclosure.open : undefined}
      {...props}
    >
      {showHeader && (
        <div className="vf-sidebar__section-header">
          {collapsible ? (
            <button
              type="button"
              className="vf-sidebar__section-toggle"
              aria-expanded={disclosure.open}
              aria-controls={contentId}
              onClick={disclosure.toggle}
            >
              <span className="vf-sidebar__section-caret" aria-hidden="true">
                {disclosure.open ? "▾" : "▸"}
              </span>
              <Label id={labelId} className="vf-sidebar__section-label">
                {label}
              </Label>
            </button>
          ) : (
            <Label id={labelId} className="vf-sidebar__section-label">
              {label}
            </Label>
          )}
          {action && (
            <span
              className="vf-sidebar__section-action"
              onClick={(e) => e.stopPropagation()}
            >
              {action}
            </span>
          )}
        </div>
      )}
      {showChildren && (
        <div
          id={contentId}
          role={collapsible && label !== undefined ? "region" : undefined}
          aria-labelledby={collapsible && label !== undefined ? labelId : undefined}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function SidebarSeparator(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="separator" className="vf-sidebar__separator" {...props} />
  );
}

function SidebarFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("vf-sidebar__footer", className)} {...props} />;
}

/**
 * Brutalist app-shell side navigation. Compound: compose `Sidebar.Brand`,
 * `Sidebar.Section` (optionally `label`ed), `Sidebar.Separator`, and
 * `Sidebar.Footer` with `NavItem` children. Pass `collapsed` for rail
 * mode (icons only); `adaptive` auto-collapses below the `md` breakpoint.
 */
export const Sidebar = Object.assign(SidebarBase, {
  Brand: SidebarBrand,
  Section: SidebarSection,
  Separator: SidebarSeparator,
  Footer: SidebarFooter,
});
