// Phase 8 — Sidebar (compound)
//
// Vertical navigation container with brand, sections (labeled groups), nav
// items, separators, and a footer slot. Supports a "rail" collapse variant
// that hides labels to just icons.

import {
  createContext,
  forwardRef,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
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
}

function SidebarSection({ label, className, children, ...props }: SidebarSectionProps) {
  const { collapsed } = useContext(SidebarContext);
  return (
    <div className={cx("vf-sidebar__section", className)} {...props}>
      {label && !collapsed && (
        <Label className="vf-sidebar__section-label">{label}</Label>
      )}
      {children}
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

export const Sidebar = Object.assign(SidebarBase, {
  Brand: SidebarBrand,
  Section: SidebarSection,
  Separator: SidebarSeparator,
  Footer: SidebarFooter,
});
