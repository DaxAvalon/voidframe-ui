"use client";

// Phase 8 — Sidebar (compound)
//
// Vertical navigation container with brand, sections (labeled groups), nav
// items, separators, and a footer slot. Supports a "rail" collapse variant:
// item labels, badges, section labels and the brand text are hidden, icons
// are centred, and each NavItem shows its label as a tooltip and exposes it
// as its accessible name.

import {
  forwardRef,
  useContext,
  useId as useReactId,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { useDisclosure } from "../hooks/useDisclosure";
import { Label } from "./Text";
import {
  SidebarContext,
  type NavItemActiveStyle,
  type SidebarLabels,
} from "./sidebarContext";
import { useAppShellSidebar } from "./appShellContext";

export type { SidebarLabels, NavItemActiveStyle } from "./sidebarContext";
export { useSidebarContext } from "./sidebarContext";

export interface SidebarProps extends HTMLAttributes<HTMLElement> {
  /**
   * Rail mode: labels, badges, section labels and the brand text are hidden,
   * icons are centred, and every `NavItem` inside shows its label as a
   * tooltip and uses it as its accessible name. Inside an `AppShell` with
   * `sidebarCollapseMode="rail"` this follows the shell's collapse state
   * when left undefined.
   */
  collapsed?: boolean;
  /**
   * How rail mode presents item labels: `"hidden"` (default, icon only) or
   * `"vertical"` (rotated text under the icon).
   */
  labels?: SidebarLabels;
  /**
   * Default `activeStyle` for every `NavItem` inside: `"fill"` (background
   * plus accent edge, the default) or `"edge"` (accent edge only).
   */
  activeStyle?: NavItemActiveStyle;
  /**
   * Value handed to every `NavItem visible` predicate inside (roles, feature
   * flags, permissions), so role-gated items decide in one place.
   */
  navContext?: unknown;
  /**
   * Collapse to rail mode automatically below the `md` breakpoint. Default
   * true. Use `adaptive={false}` when the sidebar is already inside a
   * mobile-aware shell (e.g. AppShell with `drawerMobile`).
   */
  adaptive?: boolean;
  children?: ReactNode;
}

const SidebarBase = forwardRef<HTMLElement, SidebarProps>(function Sidebar(
  {
    collapsed: collapsedProp,
    labels = "hidden",
    activeStyle,
    navContext,
    adaptive = true,
    className,
    children,
    ...props
  },
  ref
) {
  const shell = useAppShellSidebar();
  const collapsed =
    collapsedProp ?? (shell?.mode === "rail" ? shell.collapsed : false);
  return (
    <SidebarContext.Provider value={{ collapsed, labels, activeStyle, navContext }}>
      <aside
        ref={ref}
        aria-label="Sidebar"
        className={cx(
          "vf-sidebar",
          collapsed && "vf-sidebar--collapsed",
          collapsed && labels === "vertical" && "vf-sidebar--labels-vertical",
          adaptive && "vf-sidebar--adaptive",
          className
        )}
        data-adaptive={adaptive ? "true" : undefined}
        data-collapsed={collapsed ? "true" : undefined}
        {...props}
      >
        {children}
      </aside>
    </SidebarContext.Provider>
  );
});

export interface SidebarBrandProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Compact mark shown in rail mode in place of the text (`children`). The
   * text keeps its place in the DOM for the accessible name; without an
   * `icon` the text stays visible, centred and clipped to the rail.
   */
  icon?: ReactNode;
}

function SidebarBrand({
  icon,
  className,
  children,
  ...props
}: SidebarBrandProps) {
  const { collapsed } = useContext(SidebarContext);
  return (
    <div
      className={cx(
        "vf-sidebar__brand",
        collapsed && "vf-sidebar__brand--collapsed",
        icon && "vf-sidebar__brand--has-icon",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="vf-sidebar__brand-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="vf-sidebar__brand-text">{children}</span>
    </div>
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
 * mode (icons only, labels as tooltips and accessible names; `labels=
 * "vertical"` keeps rotated text); `adaptive` auto-collapses below the
 * `md` breakpoint.
 */
export const Sidebar = Object.assign(SidebarBase, {
  Brand: SidebarBrand,
  Section: SidebarSection,
  Separator: SidebarSeparator,
  Footer: SidebarFooter,
});
