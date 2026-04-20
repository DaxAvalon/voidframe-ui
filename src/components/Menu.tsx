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

// ── Menu (root) ───────────────────────────────────────────────

interface MenuContextValue {
  open: boolean;
  setOpen: (o: boolean) => void;
  contentId: string;
  triggerId: string;
  menuRef: React.MutableRefObject<HTMLDivElement | null>;
}

const MenuContext = createContext<MenuContextValue | null>(null);

function useMenu(): MenuContextValue {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("Menu.* must be used inside a <Menu> root");
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

function MenuTrigger({ asChild, children, onClick, ...props }: MenuTriggerProps) {
  const ctx = useMenu();
  const handle = (e: MouseEvent) => {
    ctx.setOpen(!ctx.open);
    onClick?.(e as MouseEvent<HTMLElement>);
  };
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    return cloneElement(child, {
      id: ctx.triggerId,
      "aria-haspopup": "menu",
      "aria-expanded": ctx.open,
      "aria-controls": ctx.contentId,
      onClick: handle,
      ...props,
    });
  }
  return (
    <button
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

// ── Menu.Content ──────────────────────────────────────────────

export interface MenuContentProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

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

export interface MenuItemProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  disabled?: boolean;
  onSelect?: () => void;
  shortcut?: string;
  children?: ReactNode;
}

const MenuItem = forwardRef<HTMLDivElement, MenuItemProps>(function MenuItem(
  { disabled, onSelect, shortcut, children, className, onKeyDown, ...props },
  ref
) {
  const ctx = useMenu();
  const activate = () => {
    if (disabled) return;
    onSelect?.();
    ctx.setOpen(false);
  };
  return (
    <div
      ref={ref}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled || undefined}
      className={cx(
        "vf-menu__item",
        disabled && "vf-menu__item--disabled",
        className
      )}
      onClick={activate}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      }}
      {...props}
    >
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
  children?: ReactNode;
}

const MenuCheckboxItem = forwardRef<HTMLDivElement, MenuCheckboxItemProps>(
  function MenuCheckboxItem(
    { checked, onCheckedChange, disabled, children, className, ...props },
    ref
  ) {
    const toggle = () => {
      if (disabled) return;
      onCheckedChange?.(!checked);
    };
    return (
      <div
        ref={ref}
        role="menuitemcheckbox"
        aria-checked={!!checked}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        className={cx(
          "vf-menu__item",
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
  children?: ReactNode;
}

const MenuRadioItem = forwardRef<HTMLDivElement, MenuRadioItemProps>(
  function MenuRadioItem(
    { value, disabled, children, className, ...props },
    ref
  ) {
    const group = useContext(MenuRadioContext);
    const checked = group?.value === value;
    const choose = () => {
      if (disabled) return;
      group?.setValue(value);
    };
    return (
      <div
        ref={ref}
        role="menuitemradio"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        className={cx(
          "vf-menu__item",
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

function MenuSeparator(props: HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" className="vf-menu__separator" {...props} />;
}

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

function MenuSub({ children }: MenuSubProps) {
  const [open, setOpen] = useState(false);
  return (
    <MenuSubContext.Provider value={{ open, setOpen }}>
      <div className="vf-menu__sub">{children}</div>
    </MenuSubContext.Provider>
  );
}

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
  /** Menu content (Menu.Content children). */
  content: ReactNode;
  children?: ReactNode;
}

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
        <div
          role="menu"
          id={contentId}
          aria-labelledby={triggerId}
          className="vf-menu__content vf-context-menu__content"
          style={{
            position: "fixed",
            left: position.x,
            top: position.y,
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// ── MenuBar ──────────────────────────────────────────────────

export interface MenuBarProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function MenuBar({ children, className, ...props }: MenuBarProps) {
  const barRef = useRef<HTMLDivElement | null>(null);
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
    let currentIdx = triggers.findIndex((el) => el === active || el.contains(active));
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
    <div
      ref={barRef}
      role="menubar"
      className={cx("vf-menubar", className)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </div>
  );
}

export interface MenuBarMenuProps {
  trigger: ReactNode;
  children?: ReactNode;
}

export function MenuBarMenu({ trigger, children }: MenuBarMenuProps) {
  return (
    <MenuRoot>
      <MenuRoot.Trigger data-vf-menubar-trigger="true">
        <span className="vf-menubar__trigger-label">{trigger}</span>
      </MenuRoot.Trigger>
      <MenuRoot.Content>{children}</MenuRoot.Content>
    </MenuRoot>
  );
}
