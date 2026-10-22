"use client";

// Phase 8 — Navbar (compound) + TabBar
//
// Navbar is a horizontal top-navigation strip with a brand slot, a center
// links slot, and an actions slot. TabBar is the mobile-app-style bottom
// navigation; keep it a separate compound for semantic clarity.

import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useMemo,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { useElementSize } from "../hooks/useElementSize";
import { useIsomorphicLayoutEffect } from "../hooks/useIsomorphicLayoutEffect";
import { Menu, MenuTrigger, MenuContent, MenuRadioGroup, MenuRadioItem } from "./Menu";

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

export interface NavbarLinksProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * `wrap` (default) lets links wrap onto further rows. `menu` keeps one
   * row: links that do not fit move into a "More" menu (a radio group
   * naming the current one), re-measured on resize with hysteresis so the
   * bar does not flap at the threshold.
   */
  overflow?: "wrap" | "menu";
  /** Cap on visible links in `menu` mode regardless of width (also handy in tests). */
  maxVisible?: number;
  /** Label of the overflow trigger. Default "More". */
  moreLabel?: string;
}

/** Width slack required before a link moves back out of the menu (px). */
export const NAVBAR_OVERFLOW_HYSTERESIS = 24;

/**
 * How many leading items fit in `available` px, given each item's width,
 * the gap between items and the width the overflow trigger needs when any
 * item is hidden. `previous` is the current count: growing it requires
 * `hysteresis` px of slack so a bar at the threshold settles.
 */
export function computeVisibleCount(
  widths: number[],
  gap: number,
  available: number,
  moreWidth: number,
  previous: number,
  hysteresis: number = NAVBAR_OVERFLOW_HYSTERESIS
): number {
  const n = widths.length;
  if (n === 0) return 0;
  const used = (count: number) =>
    widths.slice(0, count).reduce((a, w) => a + w, 0) + Math.max(0, count - 1) * gap;
  if (used(n) <= available) return n;
  // Some items hide: reserve room for the trigger.
  const room = available - moreWidth - gap;
  let fit = 0;
  while (fit < n && used(fit + 1) <= room) fit++;
  if (fit > previous) {
    // Only grow when the extra item leaves real slack.
    while (fit > previous && room - used(fit) < hysteresis) fit--;
  }
  return Math.max(0, fit);
}

function labelOf(el: ReactElement<Record<string, unknown>>, index: number): ReactNode {
  const c = el.props.children;
  if (typeof c === "string" || typeof c === "number") return c;
  if (typeof el.props["aria-label"] === "string") return el.props["aria-label"];
  return `Item ${index + 1}`;
}

function NavbarLinks({
  overflow = "wrap",
  maxVisible,
  moreLabel = "More",
  className,
  children,
  ...props
}: NavbarLinksProps) {
  const ref = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const size = useElementSize(ref);
  const items = useMemo(
    () => Children.toArray(children).filter(isValidElement) as ReactElement<Record<string, unknown>>[],
    [children]
  );
  const visibleRef = useRef<number>(items.length);
  const [visible, setVisible] = useState<number>(items.length);

  useIsomorphicLayoutEffect(() => {
    if (overflow !== "menu") return;
    const el = ref.current;
    if (!el) return;
    const nodes = Array.from(el.querySelectorAll<HTMLElement>(":scope > .vf-navbar__item"));
    const widths = nodes.map((n) => n.getBoundingClientRect().width || n.offsetWidth || 0);
    const gap = parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap) || 0;
    const moreWidth = moreRef.current?.getBoundingClientRect().width || 72;
    const available = size.width ?? el.clientWidth;
    let next =
      widths.every((w) => w === 0)
        ? items.length
        : computeVisibleCount(widths, gap, available, moreWidth, visibleRef.current);
    if (maxVisible !== undefined) next = Math.min(next, maxVisible);
    if (next !== visibleRef.current) {
      visibleRef.current = next;
      setVisible(next);
    }
  }, [overflow, size.width, items.length, maxVisible]);

  if (overflow !== "menu") {
    return (
      <div className={cx("vf-navbar__links", className)} {...props}>
        {children}
      </div>
    );
  }

  const shown = items.slice(0, visible);
  const hidden = items.slice(visible);
  const activeIndex = items.findIndex(
    (el) => el.props.active === true || el.props["aria-current"] === "page"
  );
  const hiddenRefs = useRef<(HTMLElement | null)[]>([]);

  return (
    <div
      ref={ref}
      className={cx("vf-navbar__links", "vf-navbar__links--menu", className)}
      data-overflow-count={hidden.length || undefined}
      {...props}
    >
      {shown.map((el, i) => (
        <span key={el.key ?? i} className="vf-navbar__item">
          {el}
        </span>
      ))}
      {hidden.length > 0 && (
        <>
          {/* The overflowed links stay in the DOM, visually hidden, so a menu
              choice can activate the real link (router handlers included). */}
          <span className="vf-navbar__overflow" aria-hidden="true">
            {hidden.map((el, i) => (
              <span
                key={el.key ?? visible + i}
                ref={(node) => {
                  hiddenRefs.current[i] = node;
                }}
                className="vf-navbar__item vf-navbar__item--overflow"
              >
                {el}
              </span>
            ))}
          </span>
          <div ref={moreRef} className="vf-navbar__more">
            <Menu>
              <MenuTrigger asChild>
                <button
                  type="button"
                  className="vf-navbar__more-button"
                  aria-label={`${moreLabel}, ${hidden.length} more`}
                >
                  {moreLabel}
                  <span className="vf-navbar__more-count" aria-hidden="true">{hidden.length}</span>
                </button>
              </MenuTrigger>
              <MenuContent>
                <MenuRadioGroup
                  value={activeIndex >= visible ? String(activeIndex) : undefined}
                  onValueChange={(v: string) => {
                    const idx = Number(v) - visible;
                    const host = hiddenRefs.current[idx];
                    const target = host?.querySelector<HTMLElement>("a, button") ?? host?.firstElementChild;
                    (target as HTMLElement | null)?.click();
                  }}
                >
                  {hidden.map((el, i) => (
                    <MenuRadioItem key={el.key ?? visible + i} value={String(visible + i)}>
                      {labelOf(el, visible + i)}
                    </MenuRadioItem>
                  ))}
                </MenuRadioGroup>
              </MenuContent>
            </Menu>
          </div>
        </>
      )}
    </div>
  );
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
 * `Navbar.Links` (with `Navbar.Link` children; `overflow="menu"` collapses
 * links that do not fit into a "More" menu), and `Navbar.Actions`.
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

/**
 * Mobile-style bottom tab bar. Horizontal row of icon+label tabs, each
 * linked to a route.
 */
export const TabBar = Object.assign(TabBarBase, { Item: TabBarItem });
