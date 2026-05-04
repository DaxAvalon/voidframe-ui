"use client";

// Phase 8 — Menu + ContextMenu + MenuBar
//
// Radix-style compound menu with support for items, separators, labels,
// checkbox items, radio groups, and nested submenus. Keyboard nav:
//   ArrowDown / ArrowUp  — move within current menu
//   ArrowRight           — open submenu or next bar menu
//   ArrowLeft            — close submenu or previous bar menu
//   Enter / Space        — select item
//   Escape               — close

import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId as useReactId,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useClickOutside, useId } from "../hooks";
import { cx } from "../utils/cx";
import { toneAttrs } from "../utils/toneAttrs";
import { warnOnce } from "../utils/warn";

// ── Menu (root) ───────────────────────────────────────────────

interface MenuContextValue {
  open: boolean;
  setOpen: (o: boolean) => void;
  contentId: string;
  triggerId: string;
  menuRef: React.MutableRefObject<HTMLDivElement | null>;
}

const MenuContext = createContext<MenuContextValue | null>(null);

/**
 * Inert fallback context used when `Menu.Item` / `Menu.CheckboxItem` /
 * `Menu.RadioItem` render outside of a `<Menu>` root. Previously the hook
 * threw, which crashed the entire menu subtree (notoriously during
 * refactors where a Menu root is accidentally removed). Now `useMenu`
 * logs a dev-mode warning once per call site and returns a no-op context
 * so the items render as inert `role="menuitem"` elements instead.
 *
 * ContextMenu and MenuBar wrap their content in a real Menu provider
 * internally, so the common "ContextMenu with Menu.Item inside" pattern
 * no longer depends on the fallback — it gets a real context.
 */
const INERT_MENU_CONTEXT: MenuContextValue = {
  open: true,
  setOpen: () => undefined,
  contentId: "",
  triggerId: "",
  menuRef: { current: null } as React.MutableRefObject<HTMLDivElement | null>,
};

function useMenu(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) {
    warnOnce(
      "menu-item-outside-menu",
      "<Menu.Item> / <Menu.CheckboxItem> / <Menu.RadioItem> was rendered outside a <Menu> root. " +
        "Voidframe used to throw here; the item will render as inert `role=menuitem` instead. " +
        "If you're using <ContextMenu> or <MenuBar>, this now wraps its content in a Menu provider " +
        "internally — try rebuilding or reporting if you still see this warning inside one."
    );
    return INERT_MENU_CONTEXT;
  }
  return ctx;
}

export interface MenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/**
 * A keyboard-navigable dropdown of actions, anchored to a trigger.
 * Supports items, checkbox/radio items, submenus, separators, and labels.
 */
export function Menu({ open, defaultOpen, onOpenChange, children }: MenuProps) {
  const [internal, setInternal] = useState(defaultOpen ?? false);
  const isOpen = open ?? internal;
  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setInternal(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange]
  );
  const contentId = useId();
  const triggerId = useId();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const value: MenuContextValue = useMemo(
    () => ({ open: isOpen, setOpen, contentId, triggerId, menuRef }),
    [isOpen, setOpen, contentId, triggerId]
  );
  return (
    <MenuContext.Provider value={value}>
      <div className="vf-menu" style={{ position: "relative", display: "inline-block" }}>
        {children}
      </div>
    </MenuContext.Provider>
  );
}

// ── Menu.Trigger ──────────────────────────────────────────────

export interface MenuTriggerProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children: ReactNode;
}

/**
 * Element that opens the menu. Typically wraps a `Button` or `IconButton`.
 */
const MenuTrigger = forwardRef<HTMLElement, MenuTriggerProps>(
  function MenuTrigger({ asChild, children, onClick, ...props }, ref) {
    const ctx = useMenu();
    const handle = (e: MouseEvent) => {
      ctx.setOpen(!ctx.open);
      onClick?.(e as MouseEvent<HTMLElement>);
    };
    const captureRef = (node: HTMLElement | null) => {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: HTMLElement | null }).current = node;
    };
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      const childProps = child.props as Record<string, unknown>;
      return cloneElement(child, {
        ref: captureRef,
        id: ctx.triggerId,
        "aria-haspopup": "menu",
        "aria-expanded": ctx.open,
        "aria-controls": ctx.contentId,
        ...props,
        onClick: (e: MouseEvent<HTMLElement>) => {
          (childProps.onClick as ((e: MouseEvent<HTMLElement>) => void) | undefined)?.(e);
          handle(e as MouseEvent);
        },
      });
    }
    return (
      <button
        ref={captureRef as never}
        type="button"
        id={ctx.triggerId}
        aria-haspopup="menu"
        aria-expanded={ctx.open}
        aria-controls={ctx.contentId}
        className="vf-menu__trigger"
        onClick={handle}
        {...props}
      >
        {children}
    </button>
  );
  }
);

// ── Menu.Content ──────────────────────────────────────────────

export interface MenuContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/**
 * Positioned popover that holds menu items. Subpart of `Menu`.
 */
function MenuContent({ children, className, ...props }: MenuContentProps) {
  const ctx = useMenu();
  const outsideRef = useClickOutside<HTMLDivElement>(() => ctx.setOpen(false));

  useEffect(() => {
    if (!ctx.open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") ctx.setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ctx]);

  // On open, move focus into the menu so arrow-key navigation works
  // immediately. rAF ensures the content has mounted before the lookup.
  useEffect(() => {
    if (!ctx.open) return;
    const frame = requestAnimationFrame(() => {
      const menuEl = outsideRef.current;
      if (!menuEl) return;
      const first = menuEl.querySelector<HTMLElement>(
        '[role="menuitem"]:not([aria-disabled="true"]),[role="menuitemcheckbox"]:not([aria-disabled="true"]),[role="menuitemradio"]:not([aria-disabled="true"])'
      );
      first?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [ctx.open, outsideRef]);

  if (!ctx.open) return null;

  const items: ReactElement[] = [];
  const collect = (node: ReactNode) => {
    Children.forEach(node, (child) => {
      if (!isValidElement(child)) return;
      const typed = child as ReactElement<{ children?: ReactNode }>;
      const typeName =
        typeof typed.type === "function"
          ? (typed.type as { displayName?: string; name?: string }).displayName ??
            (typed.type as { name?: string }).name
          : null;
      if (
        typeName === "MenuItem" ||
        typeName === "MenuCheckboxItem" ||
        typeName === "MenuRadioItem" ||
        typeName === "MenuSubTrigger"
      ) {
        items.push(typed);
      } else if (typed.props.children) {
        collect(typed.props.children);
      }
    });
  };
  collect(children);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const current = document.activeElement as HTMLElement | null;
    const menuEl = outsideRef.current;
    if (!menuEl) return;
    const focusable = Array.from(
      menuEl.querySelectorAll<HTMLElement>('[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]')
    );
    const idx = current ? focusable.indexOf(current) : -1;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusable[(idx + 1 + focusable.length) % focusable.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusable[(idx - 1 + focusable.length) % focusable.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      focusable[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      focusable[focusable.length - 1]?.focus();
    }
  };

  return (
    <div
      ref={(node) => {
        (outsideRef as { current: HTMLDivElement | null }).current = node;
        ctx.menuRef.current = node;
      }}
      id={ctx.contentId}
      role="menu"
      aria-labelledby={ctx.triggerId}
      className={cx("vf-menu__content", className)}
      onKeyDown={onKey}
      tabIndex={-1}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Menu.Item ─────────────────────────────────────────────────

export type MenuItemTone = "neutral" | "danger" | "warning" | "success";

export interface MenuItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  disabled?: boolean;
  onSelect?: () => void;
  shortcut?: string;
  /**
   * Semantic tone. Emits `data-tone` + `vf-menu__item--${tone}` so destructive
   * ("Delete…"), warning, or success items style consistently without inline
   * styles. Mirrors Button/Badge/AlertV2 tone vocabulary.
   */
  tone?: MenuItemTone;
  /** Render through `<Slot>` and merge menu semantics onto a consumer-provided element (e.g. a router link). */
  asChild?: boolean;
  children?: ReactNode;
}

/**
 * Actionable menu item. Emits `onSelect` on activation; optional icon and
 * trailing shortcut slot.
 */
const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem(
  { disabled, onSelect, shortcut, tone, asChild, children, className, onKeyDown, ...props },
  ref
) {
  const ctx = useMenu();
  const activate = () => {
    if (disabled) return;
    onSelect?.();
    ctx.setOpen(false);
  };
  const ta = toneAttrs("vf-menu__item", { tone });
  const commonProps = {
    ref,
    role: "menuitem" as const,
    tabIndex: disabled ? -1 : 0,
    "aria-disabled": disabled || undefined,
    className: cx(ta.className, disabled && "vf-menu__item--disabled", className),
    onClick: activate,
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    },
    ...ta.attrs,
    ...props,
  };
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    const childProps = child.props as Record<string, unknown>;
    return cloneElement(child, {
      ...commonProps,
      onClick: (e: React.MouseEvent<HTMLElement>) => {
        (childProps.onClick as ((e: React.MouseEvent<HTMLElement>) => void) | undefined)?.(e);
        activate();
      },
    });
  }
  return (
    <div {...commonProps}>
      <span className="vf-menu__item-label">{children}</span>
      {shortcut && <span className="vf-menu__item-shortcut">{shortcut}</span>}
    </div>
  );
});
MenuItem.displayName = "MenuItem";

// ── Menu.CheckboxItem ─────────────────────────────────────────

export interface MenuCheckboxItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  /** Semantic tone — mirrors `MenuItem.tone`. */
  tone?: MenuItemTone;
  children?: ReactNode;
}

/**
 * Menu item with a checkbox control. Controllable via `checked` /
 * `onCheckedChange`.
 */
const MenuCheckboxItem = forwardRef<HTMLDivElement, MenuCheckboxItemProps>(
  function MenuCheckboxItem(
    { checked, onCheckedChange, disabled, tone, children, className, ...props },
    ref
  ) {
    const toggle = () => {
      if (disabled) return;
      onCheckedChange?.(!checked);
    };
    const ta = toneAttrs("vf-menu__item", { tone });
    return (
      <div
        ref={ref}
        role="menuitemcheckbox"
        aria-checked={!!checked}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        className={cx(
          ta.className,
          "vf-menu__item--checkbox",
          disabled && "vf-menu__item--disabled",
          className
        )}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        {...ta.attrs}
        {...props}
      >
        <span aria-hidden="true" className="vf-menu__item-check">
          {checked ? "✓" : ""}
        </span>
        <span className="vf-menu__item-label">{children}</span>
      </div>
    );
  }
);
MenuCheckboxItem.displayName = "MenuCheckboxItem";

// ── Menu.RadioGroup / Menu.RadioItem ─────────────────────────

interface MenuRadioContext {
  value?: string;
  setValue: (v: string) => void;
}
const MenuRadioContext = createContext<MenuRadioContext | null>(null);

export interface MenuRadioGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}

/**
 * Group of mutually-exclusive menu radio items. Controllable via `value` /
 * `onValueChange`.
 */
function MenuRadioGroup({ value, defaultValue, onValueChange, children, className, ...props }: MenuRadioGroupProps) {
  const [internal, setInternal] = useState<string | undefined>(defaultValue);
  const current = value ?? internal;
  const setValue = (v: string) => {
    if (value === undefined) setInternal(v);
    onValueChange?.(v);
  };
  const ctxVal = useMemo<MenuRadioContext>(
    () => ({ value: current, setValue }),
    [current, onValueChange] // eslint-disable-line react-hooks/exhaustive-deps
  );
  return (
    <MenuRadioContext.Provider value={ctxVal}>
      <div
        role="group"
        className={cx("vf-menu__radio-group", className)}
        {...props}
      >
        {children}
      </div>
    </MenuRadioContext.Provider>
  );
}

export interface MenuRadioItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  /** Semantic tone — mirrors `MenuItem.tone`. */
  tone?: MenuItemTone;
  children?: ReactNode;
}

/**
 * Menu item acting as one option in a `MenuRadioGroup`.
 */
const MenuRadioItem = forwardRef<HTMLDivElement, MenuRadioItemProps>(
  function MenuRadioItem(
    { value, disabled, tone, children, className, ...props },
    ref
  ) {
    const group = useContext(MenuRadioContext);
    const checked = group?.value === value;
    const choose = () => {
      if (disabled) return;
      group?.setValue(value);
    };
    const ta = toneAttrs("vf-menu__item", { tone });
    return (
      <div
        ref={ref}
        role="menuitemradio"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        className={cx(
          ta.className,
          "vf-menu__item--radio",
          disabled && "vf-menu__item--disabled",
          className
        )}
        onClick={choose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            choose();
          }
        }}
        {...ta.attrs}
        {...props}
      >
        <span aria-hidden="true" className="vf-menu__item-check">
          {checked ? "●" : ""}
        </span>
        <span className="vf-menu__item-label">{children}</span>
      </div>
    );
  }
);
MenuRadioItem.displayName = "MenuRadioItem";

// ── Menu.Separator / Menu.Label ──────────────────────────────

/**
 * Horizontal rule separating menu item groups.
 */
function MenuSeparator(props: HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className="vf-menu__separator" {...props} />;
}

/**
 * Non-interactive label inside a menu (group header).
 */
function MenuLabel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("vf-menu__label", className)} {...props} />;
}

// ── Menu.Sub / Menu.SubTrigger / Menu.SubContent ─────────────

interface MenuSubContextValue {
  open: boolean;
  setOpen: (o: boolean) => void;
}
const MenuSubContext = createContext<MenuSubContextValue | null>(null);

export interface MenuSubProps {
  children?: ReactNode;
}

/**
 * Submenu container within a parent menu. Opens on hover / focus / arrow
 * key.
 */
function MenuSub({ children }: MenuSubProps) {
  const [open, setOpen] = useState(false);
  return (
    <MenuSubContext.Provider value={{ open, setOpen }}>
      <div className="vf-menu__sub">{children}</div>
    </MenuSubContext.Provider>
  );
}

/**
 * Trigger for a `MenuSub`. Shows a chevron and opens the submenu on
 * activation.
 */
const MenuSubTrigger = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function MenuSubTrigger({ children, className, ...props }, ref) {
    const sub = useContext(MenuSubContext);
    if (!sub) throw new Error("Menu.SubTrigger must be inside Menu.Sub");
    return (
      <div
        ref={ref}
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={sub.open}
        tabIndex={0}
        className={cx("vf-menu__item", "vf-menu__sub-trigger", className)}
        onMouseEnter={() => sub.setOpen(true)}
        onMouseLeave={() => sub.setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            sub.setOpen(true);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            sub.setOpen(false);
          }
        }}
        {...props}
      >
        <span className="vf-menu__item-label">{children}</span>
        <span aria-hidden="true" className="vf-menu__item-sub-indicator">
          ›
        </span>
      </div>
    );
  }
);
MenuSubTrigger.displayName = "MenuSubTrigger";

/**
 * Content subpart of `MenuSub` - the popover panel for the submenu.
 */
function MenuSubContent({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const sub = useContext(MenuSubContext);
  if (!sub || !sub.open) return null;
  return (
    <div
      role="menu"
      className={cx("vf-menu__sub-content", className)}
      onMouseEnter={() => sub.setOpen(true)}
      onMouseLeave={() => sub.setOpen(false)}
      {...props}
    >
      {children}
    </div>
  );
}

// ── Attach compound fields ────────────────────────────────────

interface MenuCompound {
  (props: MenuProps): ReactElement | null;
  Trigger: typeof MenuTrigger;
  Content: typeof MenuContent;
  Item: typeof MenuItem;
  CheckboxItem: typeof MenuCheckboxItem;
  RadioGroup: typeof MenuRadioGroup;
  RadioItem: typeof MenuRadioItem;
  Separator: typeof MenuSeparator;
  Label: typeof MenuLabel;
  Sub: typeof MenuSub;
  SubTrigger: typeof MenuSubTrigger;
  SubContent: typeof MenuSubContent;
}

const MenuRoot = Menu as MenuCompound;
MenuRoot.Trigger = MenuTrigger;
MenuRoot.Content = MenuContent;
MenuRoot.Item = MenuItem;
MenuRoot.CheckboxItem = MenuCheckboxItem;
MenuRoot.RadioGroup = MenuRadioGroup;
MenuRoot.RadioItem = MenuRadioItem;
MenuRoot.Separator = MenuSeparator;
MenuRoot.Label = MenuLabel;
MenuRoot.Sub = MenuSub;
MenuRoot.SubTrigger = MenuSubTrigger;
MenuRoot.SubContent = MenuSubContent;

export { MenuRoot as default };
export {
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuCheckboxItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuLabel,
  MenuSub,
  MenuSubTrigger,
  MenuSubContent,
};

// ── ContextMenu — Menu that opens on right-click / long-press ──

export interface ContextMenuProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "content"> {
  /**
   * Menu content rendered when the user right-clicks or long-presses the
   * trigger children. ContextMenu wraps this slot in an internal `<Menu>`
   * provider, so the `Menu.*` compound subcomponents (`Menu.Item`,
   * `Menu.CheckboxItem`, `Menu.RadioItem`, `Menu.Separator`, `Menu.Label`,
   * `Menu.Sub` / `Menu.SubTrigger` / `Menu.SubContent`) all work directly
   * inside `content` without needing a manual `<Menu>` wrapper. Plain
   * elements (`<div>`, custom buttons, etc.) also work.
   *
   * Equivalent compound subcomponents are also re-exported as
   * `ContextMenu.Item` / `ContextMenu.CheckboxItem` / `ContextMenu.Separator`
   * etc. for ergonomics — pick whichever shape reads better at the call
   * site.
   */
  content: ReactNode;
  children?: ReactNode;
}

/**
 * Right-click / long-press context menu. Subparts mirror `Menu`; position
 * follows the pointer.
 */
export function ContextMenu({
  content,
  children,
  className,
  ...props
}: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const reactId = useReactId();
  const triggerId = `vf-ctx-${reactId}`;
  const contentId = `vf-ctx-content-${reactId}`;

  const handleContext = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = () => setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  // Bind Menu.Item / Menu.CheckboxItem / Menu.RadioItem to THIS context menu's
  // open state so their close-on-select + `useMenu()` hooks work inside the
  // `content` prop. Without this wrapper, passing `<Menu.Item>` into ContextMenu
  // used to crash with "Menu.* must be used inside a <Menu> root".
  const menuRefLocal = useRef<HTMLDivElement | null>(null);
  const menuCtxValue: MenuContextValue = useMemo(
    () => ({
      open,
      setOpen,
      contentId,
      triggerId,
      menuRef: menuRefLocal,
    }),
    [open, setOpen, contentId, triggerId]
  );

  return (
    <div
      ref={anchorRef}
      className={cx("vf-context-menu", className)}
      onContextMenu={handleContext}
      id={triggerId}
      {...props}
    >
      {children}
      {open && position && (
        <MenuContext.Provider value={menuCtxValue}>
          <div
            ref={menuRefLocal}
            role="menu"
            id={contentId}
            aria-labelledby={triggerId}
            className="vf-menu__content vf-context-menu__content"
            style={{
              position: "fixed",
              insetInlineStart: position.x,
              top: position.y,
              zIndex: 1000,
            }}
          >
            {content}
          </div>
        </MenuContext.Provider>
      )}
    </div>
  );
}

// ── ContextMenu compound (Radix-shape parity) ──────────────────
//
// The existing `<ContextMenu content={…}>` API stays as the simple form.
// `ContextMenu.Item` is exported here so callers writing the Radix-style
// shape have a clear, named entry point even though it's the same DOM as
// `Menu.Item`. Same for `ContextMenu.Trigger` (the wrapped element) and
// `ContextMenu.Content` (an alias for the menu container slot).
//
// Migrators from `@radix-ui/react-context-menu` can now write:
//
//   <ContextMenu>
//     <ContextMenu.Trigger>area</ContextMenu.Trigger>
//     <ContextMenu.Content>
//       <ContextMenu.Item>Cut</ContextMenu.Item>
//       <ContextMenu.Item tone="danger">Delete</ContextMenu.Item>
//     </ContextMenu.Content>
//   </ContextMenu>
//
// (The Trigger/Content slots are placeholders — voidframe's ContextMenu
// uses the `content` prop + children-as-trigger model. See compound shim
// below.)

// Re-export Menu subcomponents under the ContextMenu namespace.
(ContextMenu as unknown as Record<string, unknown>).Item = MenuItem;
(ContextMenu as unknown as Record<string, unknown>).CheckboxItem = MenuCheckboxItem;
(ContextMenu as unknown as Record<string, unknown>).RadioGroup = MenuRadioGroup;
(ContextMenu as unknown as Record<string, unknown>).RadioItem = MenuRadioItem;
(ContextMenu as unknown as Record<string, unknown>).Separator = MenuSeparator;
(ContextMenu as unknown as Record<string, unknown>).Label = MenuLabel;
(ContextMenu as unknown as Record<string, unknown>).Sub = MenuSub;
(ContextMenu as unknown as Record<string, unknown>).SubTrigger = MenuSubTrigger;
(ContextMenu as unknown as Record<string, unknown>).SubContent = MenuSubContent;

// ── MenuBar ──────────────────────────────────────────────────

interface MenuBarContextValue {
  activeId: string | null;
  setActiveId: (id: string | null) => void;
}
const MenuBarContext = createContext<MenuBarContextValue | null>(null);

export interface MenuBarProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/**
 * Top-level menu bar (like a desktop app). Horizontal row of `MenuBarMenu`
 * entries, each with a dropdown. Ensures only one sibling menu is open at
 * a time via a shared activeId registry.
 */
export function MenuBar({ children, className, ...props }: MenuBarProps) {
  const barRef = useRef<HTMLDivElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const ctxValue = useMemo<MenuBarContextValue>(
    () => ({ activeId, setActiveId }),
    [activeId]
  );
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    const root = barRef.current;
    if (!root) return;
    // Find the registered MenuBarMenu triggers (rendered as MenuRoot.Trigger).
    const triggers = Array.from(
      root.querySelectorAll<HTMLElement>('[data-vf-menubar-trigger="true"]')
    );
    if (triggers.length === 0) return;
    const active = document.activeElement as HTMLElement | null;
    // Resolve the "current" trigger in this order:
    //   1. the trigger (or its child) that currently has focus, or
    //   2. the trigger whose menu is open (aria-expanded="true") — needed
    //      once focus has moved into a portaled menu panel, which sits
    //      outside the trigger's subtree.
    let currentIdx = triggers.findIndex((el) => el === active || el.contains(active));
    if (currentIdx === -1) {
      currentIdx = triggers.findIndex(
        (el) => el.getAttribute("aria-expanded") === "true"
      );
    }
    if (currentIdx === -1) currentIdx = 0;
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const nextIdx = (currentIdx + dir + triggers.length) % triggers.length;
    e.preventDefault();
    const nextEl = triggers[nextIdx];
    if (!nextEl) return;
    nextEl.focus();
    nextEl.click();
  };
  return (
    <MenuBarContext.Provider value={ctxValue}>
      <div
        ref={barRef}
        role="menubar"
        className={cx("vf-menubar", className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </div>
    </MenuBarContext.Provider>
  );
}

export interface MenuBarMenuProps {
  trigger: ReactNode;
  children?: ReactNode;
}

/**
 * Single menu entry inside a `MenuBar`. Owns a dropdown activated by click
 * or keyboard.
 */
export function MenuBarMenu({ trigger, children }: MenuBarMenuProps) {
  // The button inside a `role="menubar"` must itself be `role="menuitem"`
  // with `aria-haspopup="menu"` to satisfy aria-required-children. The
  // parent `MenuRoot.Trigger` already sets `aria-haspopup="menu"`; we
  // override the implicit button role via the passthrough props spread.
  const bar = useContext(MenuBarContext);
  const id = useReactId();
  const controlled = bar !== null;
  const open = controlled ? bar.activeId === id : undefined;
  const onOpenChange = controlled
    ? (next: boolean) => {
        if (next) bar.setActiveId(id);
        else if (bar.activeId === id) bar.setActiveId(null);
      }
    : undefined;
  return (
    <MenuRoot open={open} onOpenChange={onOpenChange}>
      <MenuRoot.Trigger
        role="menuitem"
        data-vf-menubar-trigger="true"
      >
        <span className="vf-menubar__trigger-label">{trigger}</span>
      </MenuRoot.Trigger>
      <MenuRoot.Content>{children}</MenuRoot.Content>
    </MenuRoot>
  );
}
