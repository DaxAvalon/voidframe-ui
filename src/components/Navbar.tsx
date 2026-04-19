"use client";

// Phase 8 — Navbar (compound) + TabBar
//
// Navbar is a horizontal top-navigation strip with a brand slot, a center
// links slot, and an actions slot. TabBar is the mobile-app-style bottom
// navigation; keep it a separate compound for semantic clarity.

import {
  createContext,
  forwardRef,
  useContext,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

// ── Navbar ───────────────────────────────────────────────────

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
  sticky?: boolean;
}

const NavbarBase = forwardRef<HTMLElement, NavbarProps>(function Navbar(
  { sticky, className, children, ...props },
  ref
) {
  return (
    <nav
      ref={ref}
      aria-label="Primary"
      className={cx("vf-navbar", sticky && "vf-navbar--sticky", className)}
      {...props}
    >
      {children}
    </nav>
  );
});

function NavbarBrand({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("vf-navbar__brand", className)} {...props} />;
}

function NavbarLinks({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("vf-navbar__links", className)} {...props} />;
}

interface NavbarLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
}

const NavbarLink = forwardRef<HTMLAnchorElement, NavbarLinkProps>(
  function NavbarLink({ active, className, ...props }, ref) {
    return (
      <a
        ref={ref}
        aria-current={active ? "page" : undefined}
        className={cx(
          "vf-navbar__link",
          active && "vf-navbar__link--active",
          className
        )}
        {...props}
      />
    );
  }
);
NavbarLink.displayName = "NavbarLink";

function NavbarActions({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("vf-navbar__actions", className)} {...props} />;
}

/**
 * Brutalist top navigation bar. Slot-based compound layout: `Navbar.Brand`,
 * `Navbar.Links` (with `Navbar.Link` children), and `Navbar.Actions`.
 * Pass `sticky` to pin the bar to the top of the viewport.
 */
export const Navbar = Object.assign(NavbarBase, {
  Brand: NavbarBrand,
  Links: NavbarLinks,
  Link: NavbarLink,
  Actions: NavbarActions,
});

// ── TabBar ───────────────────────────────────────────────────

interface TabBarContextValue {
  value: string;
  setValue: (v: string) => void;
}
const TabBarContext = createContext<TabBarContextValue | null>(null);

export interface TabBarProps
  extends Omit<HTMLAttributes<HTMLElement>, "onChange" | "defaultValue" | "value"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}

const TabBarBase = forwardRef<HTMLElement, TabBarProps>(function TabBar(
  { value, defaultValue, onValueChange, className, children, ...props },
  ref
) {
  const [internal, setInternal] = useState<string>(defaultValue ?? "");
  const current = value ?? internal;
  const setCurrent = (v: string) => {
    if (value === undefined) setInternal(v);
    onValueChange?.(v);
  };
  const ctx = useMemo<TabBarContextValue>(
    () => ({ value: current, setValue: setCurrent }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [current]
  );
  return (
    <TabBarContext.Provider value={ctx}>
      <nav
        ref={ref}
        aria-label="Tab bar"
        className={cx("vf-tabbar", className)}
        {...props}
      >
        {children}
      </nav>
    </TabBarContext.Provider>
  );
});

export interface TabBarItemProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

const TabBarItem = forwardRef<HTMLButtonElement, TabBarItemProps>(
  function TabBarItem(
    { value, icon, badge, disabled, className, children, ...props },
    ref
  ) {
    const ctx = useContext(TabBarContext);
    if (!ctx) throw new Error("TabBar.Item must be inside TabBar");
    const selected = ctx.value === value;
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={selected}
        disabled={disabled}
        className={cx(
          "vf-tabbar__item",
          selected && "vf-tabbar__item--selected",
          className
        )}
        onClick={() => !disabled && ctx.setValue(value)}
        {...props}
      >
        {icon && <span className="vf-tabbar__icon">{icon}</span>}
        <span className="vf-tabbar__label">{children}</span>
        {badge && <span className="vf-tabbar__badge">{badge}</span>}
      </button>
    );
  }
);
TabBarItem.displayName = "TabBarItem";

export const TabBar = Object.assign(TabBarBase, { Item: TabBarItem });
