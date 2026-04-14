// Phase 8 — Navigation extensions:
//   CursorPagination, ScrollSpy, BackToTop, Shortcut, TreeNav, UserMenu
//
// Small atoms that round out the navigation family.

import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

// ── CursorPagination ─────────────────────────────────────────

export interface CursorPaginationProps extends HTMLAttributes<HTMLDivElement> {
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  loading?: boolean;
  prevLabel?: string;
  nextLabel?: string;
}

export const CursorPagination = forwardRef<HTMLDivElement, CursorPaginationProps>(
  function CursorPagination(
    {
      hasPrev,
      hasNext,
      onPrev,
      onNext,
      loading,
      prevLabel = "Previous",
      nextLabel = "Next",
      className,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx("vf-cursor-pagination", className)}
        {...props}
      >
        <button
          type="button"
          className="vf-button vf-cursor-pagination__prev"
          disabled={!hasPrev || loading}
          onClick={onPrev}
          aria-label={prevLabel}
        >
          ‹ {prevLabel}
        </button>
        <button
          type="button"
          className="vf-button vf-cursor-pagination__next"
          disabled={!hasNext || loading}
          onClick={onNext}
          aria-label={nextLabel}
        >
          {nextLabel} ›
        </button>
      </div>
    );
  }
);
CursorPagination.displayName = "CursorPagination";

// ── ScrollSpy ────────────────────────────────────────────────

interface ScrollSpyContextValue {
  activeId: string | null;
  onItemClick: (target: string) => void;
}
const ScrollSpyContext = createContext<ScrollSpyContextValue | null>(null);

export interface ScrollSpyProps extends HTMLAttributes<HTMLDivElement> {
  /** Offset from top of viewport considered "active". Default 96 px. */
  offset?: number;
  /** Smooth scroll when clicking an item. Default true. */
  smooth?: boolean;
  children?: ReactNode;
}

const ScrollSpyBase = forwardRef<HTMLDivElement, ScrollSpyProps>(
  function ScrollSpy(
    { offset = 96, smooth = true, className, children, ...props },
    ref
  ) {
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const handler = () => {
        // Find all elements with id that are referenced by any ScrollSpy.Item.
        const sections = Array.from(document.querySelectorAll<HTMLElement>("[id]"));
        let bestId: string | null = null;
        let bestTop = -Infinity;
        for (const el of sections) {
          const top = el.getBoundingClientRect().top - offset;
          if (top <= 0 && top > bestTop) {
            bestTop = top;
            bestId = el.id;
          }
        }
        setActiveId(bestId);
      };
      handler();
      window.addEventListener("scroll", handler, { passive: true });
      window.addEventListener("resize", handler);
      return () => {
        window.removeEventListener("scroll", handler);
        window.removeEventListener("resize", handler);
      };
    }, [offset]);

    const onItemClick = useCallback(
      (target: string) => {
        if (typeof document === "undefined") return;
        const el = document.getElementById(target);
        if (!el) return;
        el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      },
      [smooth]
    );

    const ctx = useMemo<ScrollSpyContextValue>(
      () => ({ activeId, onItemClick }),
      [activeId, onItemClick]
    );
    return (
      <ScrollSpyContext.Provider value={ctx}>
        <div ref={ref} className={cx("vf-scrollspy", className)} {...props}>
          {children}
        </div>
      </ScrollSpyContext.Provider>
    );
  }
);

function ScrollSpyList({ className, ...props }: HTMLAttributes<HTMLUListElement>) {
  return <ul className={cx("vf-scrollspy__list", className)} {...props} />;
}

export interface ScrollSpyItemProps extends HTMLAttributes<HTMLLIElement> {
  target: string;
  children?: ReactNode;
}

function ScrollSpyItem({
  target,
  className,
  children,
  ...props
}: ScrollSpyItemProps) {
  const ctx = useContext(ScrollSpyContext);
  const active = ctx?.activeId === target;
  return (
    <li
      className={cx(
        "vf-scrollspy__item",
        active && "vf-scrollspy__item--active",
        className
      )}
      {...props}
    >
      <button
        type="button"
        className="vf-scrollspy__link"
        aria-current={active ? "true" : undefined}
        onClick={() => ctx?.onItemClick(target)}
      >
        {children}
      </button>
    </li>
  );
}

export const ScrollSpy = Object.assign(ScrollSpyBase, {
  List: ScrollSpyList,
  Item: ScrollSpyItem,
});

// ── BackToTop ────────────────────────────────────────────────

export interface BackToTopProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Scroll threshold (pixels) before the button becomes visible. Default 300. */
  threshold?: number;
  position?: "bottom-right" | "bottom-left";
  label?: string;
}

export const BackToTop = forwardRef<HTMLButtonElement, BackToTopProps>(
  function BackToTop(
    { threshold = 300, position = "bottom-right", label = "Back to top", className, ...props },
    ref
  ) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      if (typeof window === "undefined") return;
      const handler = () => setVisible(window.scrollY > threshold);
      handler();
      window.addEventListener("scroll", handler, { passive: true });
      return () => window.removeEventListener("scroll", handler);
    }, [threshold]);

    return (
      <button
        ref={ref}
        type="button"
        className={cx(
          "vf-back-to-top",
          `vf-back-to-top--${position}`,
          visible && "vf-back-to-top--visible",
          className
        )}
        aria-label={label}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        hidden={!visible}
        {...props}
      >
        ↑
      </button>
    );
  }
);
BackToTop.displayName = "BackToTop";

// ── Shortcut / Kbd ──────────────────────────────────────────

function isMacLike(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

const KEY_ALIASES_MAC: Record<string, string> = {
  mod: "⌘",
  cmd: "⌘",
  ctrl: "⌃",
  alt: "⌥",
  shift: "⇧",
  enter: "⏎",
  tab: "⇥",
  escape: "⎋",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
};
const KEY_ALIASES_PC: Record<string, string> = {
  mod: "Ctrl",
  cmd: "Ctrl",
  ctrl: "Ctrl",
  alt: "Alt",
  shift: "Shift",
  enter: "Enter",
  tab: "Tab",
  escape: "Esc",
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
};

export interface ShortcutProps extends HTMLAttributes<HTMLSpanElement> {
  /** Plus-separated keys e.g. "mod+k" or "shift+enter". */
  keys: string;
}

export const Shortcut = forwardRef<HTMLSpanElement, ShortcutProps>(
  function Shortcut({ keys, className, ...props }, ref) {
    const table = isMacLike() ? KEY_ALIASES_MAC : KEY_ALIASES_PC;
    const parts = keys.split("+").map((k) => k.trim().toLowerCase());
    const rendered = parts.map((p, i) => (
      <kbd key={i} className="vf-kbd vf-shortcut__key">
        {table[p] ?? p.toUpperCase()}
      </kbd>
    ));
    return (
      <span
        ref={ref}
        className={cx("vf-shortcut", className)}
        aria-label={`Keyboard shortcut: ${keys}`}
        {...props}
      >
        {rendered}
      </span>
    );
  }
);
Shortcut.displayName = "Shortcut";

// ── TreeNav ─────────────────────────────────────────────────

export interface TreeNavItem {
  id: string;
  label: ReactNode;
  href?: string;
  children?: TreeNavItem[];
}

export interface TreeNavProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  items: TreeNavItem[];
  activeId?: string;
  onSelect?: (id: string) => void;
  defaultExpanded?: string[];
}

export const TreeNav = forwardRef<HTMLDivElement, TreeNavProps>(function TreeNav(
  { items, activeId, onSelect, defaultExpanded = [], className, ...props },
  ref
) {
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(defaultExpanded)
  );
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderItem = (item: TreeNavItem, depth: number): ReactNode => {
    const hasChildren = !!item.children?.length;
    const isExpanded = expanded.has(item.id);
    const isActive = item.id === activeId;
    return (
      <li key={item.id} className="vf-treenav__node">
        <div
          className={cx(
            "vf-treenav__row",
            isActive && "vf-treenav__row--active"
          )}
          style={{ paddingInlineStart: `${8 + depth * 16}px` }}
        >
          {hasChildren && (
            <button
              type="button"
              className="vf-treenav__disclosure"
              aria-label={isExpanded ? "Collapse" : "Expand"}
              onClick={() => toggle(item.id)}
            >
              {isExpanded ? "▾" : "▸"}
            </button>
          )}
          {item.href ? (
            <a
              className="vf-treenav__link"
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              onClick={(e) => {
                if (onSelect) {
                  e.preventDefault();
                  onSelect(item.id);
                }
              }}
            >
              {item.label}
            </a>
          ) : (
            <button
              type="button"
              className="vf-treenav__link"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onSelect?.(item.id)}
            >
              {item.label}
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <ul className="vf-treenav__children">
            {item.children!.map((c) => renderItem(c, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div
      ref={ref}
      className={cx("vf-treenav", className)}
      role="tree"
      {...props}
    >
      <ul className="vf-treenav__root">
        {items.map((item) => renderItem(item, 0))}
      </ul>
    </div>
  );
});
TreeNav.displayName = "TreeNav";

// ── UserMenu ────────────────────────────────────────────────

interface UserMenuContextValue {
  open: boolean;
  setOpen: (o: boolean) => void;
}
const UserMenuContext = createContext<UserMenuContextValue | null>(null);

export interface UserMenuProps extends HTMLAttributes<HTMLDivElement> {
  user: { name: string; email?: string; avatar?: ReactNode };
  children?: ReactNode;
}

const UserMenuBase = forwardRef<HTMLDivElement, UserMenuProps>(
  function UserMenu({ user, children, className, ...props }, ref) {
    const [open, setOpen] = useState(false);
    const ctx = useMemo<UserMenuContextValue>(() => ({ open, setOpen }), [open]);
    return (
      <UserMenuContext.Provider value={ctx}>
        <div
          ref={ref}
          className={cx("vf-user-menu", className)}
          {...props}
        >
          <button
            type="button"
            className="vf-user-menu__trigger"
            aria-haspopup="menu"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {user.avatar && (
              <span className="vf-user-menu__avatar">{user.avatar}</span>
            )}
            <span className="vf-user-menu__name">{user.name}</span>
          </button>
          {open && (
            <div role="menu" className="vf-user-menu__content">
              {user.email && (
                <div className="vf-user-menu__email">{user.email}</div>
              )}
              {Children.map(children, (child) => {
                if (!isValidElement(child)) return child;
                const el = child as ReactElement<{ onClick?: (e: unknown) => void }>;
                return cloneElement(el, {
                  onClick: (e: unknown) => {
                    el.props.onClick?.(e);
                    setOpen(false);
                  },
                });
              })}
            </div>
          )}
        </div>
      </UserMenuContext.Provider>
    );
  }
);

export interface UserMenuItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

const UserMenuItem = forwardRef<HTMLButtonElement, UserMenuItemProps>(
  function UserMenuItem({ className, ...props }, ref) {
    return (
      <button
        ref={ref}
        role="menuitem"
        type="button"
        className={cx("vf-user-menu__item", className)}
        {...props}
      />
    );
  }
);
UserMenuItem.displayName = "UserMenuItem";

function UserMenuSeparator(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div role="separator" className="vf-user-menu__separator" {...props} />
  );
}

export const UserMenu = Object.assign(UserMenuBase, {
  Item: UserMenuItem,
  Separator: UserMenuSeparator,
});

// Re-export for consumers that treat anchors as nav links inside TreeNav.
export type { AnchorHTMLAttributes, CSSProperties };
