"use client";

import {
  createContext,
  forwardRef,
  memo,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useId } from "../hooks/useId";
import { DismissableLayer } from "../primitives/DismissableLayer";
import { FocusScope } from "../primitives/FocusScope";
import { Portal } from "../primitives/Portal";
import { Presence } from "../primitives/Presence";
import type { ToastType } from "../types";
import { cx } from "../utils/cx";
import { deprecatedComponent } from "../utils/deprecate";
import { warn } from "../utils/warn";
import { Label } from "./Text";

const TOAST_VAR: Record<ToastType, string> = {
  info: "var(--vf-info)",
  success: "var(--vf-success)",
  warning: "var(--vf-warning)",
  danger: "var(--vf-danger)",
};

// ── Tabs ──────────────────────────────────────────────────────
// Compound dot-notation API: Tabs / Tabs.List / Tabs.Trigger / Tabs.Panel.
// WAI-ARIA tablist semantics with arrow-key / Home / End navigation and
// proper aria-controls / aria-labelledby wiring between triggers & panels.

type TabsOrientation = "horizontal" | "vertical";

interface TabsContextValue {
  value: string;
  setValue: (next: string) => void;
  baseId: string;
  orientation: TabsOrientation;
  accent?: string;
  register: (value: string, el: HTMLButtonElement | null) => void;
  focusValue: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);
function useTabs(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used inside <Tabs>.`);
  }
  return ctx;
}

export interface TabsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: TabsOrientation;
  /** Accent color for the active trigger (sets `--vf-accent`). */
  accent?: string;
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Tabbed navigation with WAI-ARIA tablist semantics and arrow-key / Home /
 * End navigation. Compound API: compose `Tabs.List` with `Tabs.Trigger`s
 * and `Tabs.Panel`s. Controlled via `value`+`onValueChange` or uncontrolled
 * via `defaultValue`.
 */
const TabsRoot = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  {
    value,
    defaultValue,
    onValueChange,
    orientation = "horizontal",
    accent,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const [current, setCurrent] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? "",
    onChange: onValueChange,
    componentName: "Tabs",
  });
  const baseId = useId();
  const refs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const register = useCallback(
    (v: string, el: HTMLButtonElement | null) => {
      if (el) refs.current.set(v, el);
      else refs.current.delete(v);
    },
    []
  );
  const focusValue = useCallback((v: string) => {
    refs.current.get(v)?.focus();
  }, []);
  const ctx = useMemo<TabsContextValue>(
    () => ({
      value: current,
      setValue: setCurrent,
      baseId,
      orientation,
      accent,
      register,
      focusValue,
    }),
    [current, setCurrent, baseId, orientation, accent, register, focusValue]
  );
  const composedStyle: CSSProperties = {
    ...(accent ? ({ "--vf-accent": accent } as CSSProperties) : {}),
    ...style,
  };
  return (
    <TabsContext.Provider value={ctx}>
      <div
        ref={ref}
        className={cx(
          "vf-tabs",
          `vf-tabs--${orientation}`,
          className
        )}
        style={composedStyle}
        data-orientation={orientation}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
});
TabsRoot.displayName = "Tabs";

export interface TabsListProps extends HTMLAttributes<HTMLDivElement> {
  /** Accessible label for the tablist. Strongly recommended. */
  "aria-label"?: string;
}

const TabsList = forwardRef<HTMLDivElement, TabsListProps>(function TabsList(
  { className, onKeyDown, children, ...props },
  ref
) {
  const ctx = useTabs("Tabs.List");
  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    const isHorizontal = ctx.orientation === "horizontal";
    const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
    const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";
    if (
      e.key !== nextKey &&
      e.key !== prevKey &&
      e.key !== "Home" &&
      e.key !== "End"
    )
      return;
    const list = e.currentTarget;
    const triggers = Array.from(
      list.querySelectorAll<HTMLButtonElement>(
        '[role="tab"]:not([data-disabled="true"])'
      )
    );
    if (triggers.length === 0) return;
    const active = document.activeElement as HTMLButtonElement | null;
    const idx = active ? triggers.indexOf(active) : -1;
    let target: HTMLButtonElement | undefined;
    if (e.key === "Home") target = triggers[0];
    else if (e.key === "End") target = triggers[triggers.length - 1];
    else if (e.key === nextKey)
      target = triggers[(idx + 1) % triggers.length] ?? triggers[0];
    else
      target = triggers[(idx - 1 + triggers.length) % triggers.length] ?? triggers[0];
    if (!target) return;
    e.preventDefault();
    const nextValue = target.getAttribute("data-value");
    if (nextValue) ctx.setValue(nextValue);
    target.focus();
  };
  return (
    <div
      ref={ref}
      role="tablist"
      aria-orientation={ctx.orientation}
      className={cx("vf-tabs__list", className)}
      onKeyDown={handleKey}
      {...props}
    >
      {children}
    </div>
  );
});
TabsList.displayName = "Tabs.List";

export interface TabsTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "onClick"> {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger(
    { value, disabled, className, children, ...props },
    ref
  ) {
    const ctx = useTabs("Tabs.Trigger");
    const selected = ctx.value === value;
    const tabId = `${ctx.baseId}-tab-${value}`;
    const panelId = `${ctx.baseId}-panel-${value}`;
    const handleRef = (el: HTMLButtonElement | null) => {
      ctx.register(value, el);
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = el;
    };
    return (
      <button
        ref={handleRef}
        type="button"
        role="tab"
        id={tabId}
        aria-controls={panelId}
        aria-selected={selected}
        aria-disabled={disabled || undefined}
        data-value={value}
        data-state={selected ? "active" : "inactive"}
        data-disabled={disabled ? "true" : undefined}
        tabIndex={selected ? 0 : -1}
        disabled={disabled}
        onClick={() => {
          if (!disabled) ctx.setValue(value);
        }}
        className={cx(
          "vf-tabs__trigger",
          selected && "vf-tabs__trigger--active",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = "Tabs.Trigger";

export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  /** Keep panel mounted when inactive (preserves state). Default false. */
  keepMounted?: boolean;
}

const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(function TabsPanel(
  { value, keepMounted, className, children, ...props },
  ref
) {
  const ctx = useTabs("Tabs.Panel");
  const selected = ctx.value === value;
  if (!selected && !keepMounted) return null;
  const tabId = `${ctx.baseId}-tab-${value}`;
  const panelId = `${ctx.baseId}-panel-${value}`;
  return (
    <div
      ref={ref}
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      hidden={!selected || undefined}
      tabIndex={0}
      data-state={selected ? "active" : "inactive"}
      className={cx("vf-tabs__panel", className)}
      {...props}
    >
      {selected ? children : null}
    </div>
  );
});
TabsPanel.displayName = "Tabs.Panel";

/**
 * Keyboard-navigable tablist. Arrow keys cycle within the list, Home/End
 * jump to first/last, Tab leaves the list. Controllable via `active` /
 * `onChange`; uncontrolled via `defaultActive`.
 */
export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Trigger: TabsTrigger,
  Panel: TabsPanel,
});

// ── Collapsible ───────────────────────────────────────────────

export interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Caret color (sets `--vf-accent`). */
  accent?: string;
  style?: CSSProperties;
}

/**
 * Single expand/collapse region. Controllable via `open` / `onOpenChange`;
 * uncontrolled via `defaultOpen`. `Collapsible.Trigger` toggles,
 * `Collapsible.Content` holds the panel.
 */
export const Collapsible = forwardRef<HTMLDivElement, CollapsibleProps>(
  function Collapsible(
    { title, children, open, defaultOpen = false, onOpenChange, accent, className, style, ...props },
    ref
  ) {
    const [isOpen, setIsOpen] = useControllableState<boolean>({
      value: open,
      defaultValue: defaultOpen,
      onChange: onOpenChange,
      componentName: "Collapsible",
    });
    const triggerId = useId();
    const contentId = useId();
    const composedStyle: CSSProperties = accent
      ? ({ "--vf-accent": accent, ...style } as CSSProperties)
      : (style ?? {});
    return (
      <div ref={ref} className={cx("vf-collapsible", className)} style={composedStyle} {...props}>
        <button
          id={triggerId}
          type="button"
          className="vf-collapsible__trigger"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls={contentId}
        >
          <span aria-hidden="true" className="vf-collapsible__caret">
            ▼
          </span>
          {title}
        </button>
        {isOpen && (
          <div
            id={contentId}
            role="region"
            aria-labelledby={triggerId}
            className="vf-collapsible__content"
          >
            {children}
          </div>
        )}
      </div>
    );
  }
);
Collapsible.displayName = "Collapsible";

// ── Modal ─────────────────────────────────────────────────────
// Backed by Portal + FocusScope + DismissableLayer for the full a11y
// contract: focus trap, focus restore, Escape, click-outside.

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onDismiss: () => void;
  /** Accessible name. Highly recommended. */
  title?: string;
  width?: string | number;
  /** Enable enter/exit animations. Default true. */
  motion?: boolean;
  /** Go full-screen below the `md` breakpoint. Default true. */
  adaptive?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Props-driven modal overlay with backdrop + centered panel. Portaled,
 * focus-trapped, Escape- and click-outside-dismissable. Controlled via
 * `open` / `onDismiss`. Prefer the compound `Dialog` for new code.
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onDismiss,
    title,
    width = "480px",
    motion = true,
    adaptive = true,
    children,
    className,
    style,
    ...props
  },
  ref
) {
  warn(
    Boolean(
      title ||
        (props as Record<string, unknown>)["aria-label"] ||
        (props as Record<string, unknown>)["aria-labelledby"]
    ),
    "<Modal> requires a `title` or `aria-label`/`aria-labelledby` for accessibility."
  );

  const inner = (
    <div
      className="vf-modal__backdrop"
      onClick={(e) => {
        // Clicking the backdrop itself (not the panel) closes.
        if (e.target === e.currentTarget) onDismiss();
      }}
    >
      <DismissableLayer onDismiss={onDismiss}>
        <FocusScope
          ref={ref as never}
          trapped
          autoFocus
          restoreFocus
          loop
          className={cx(
            "vf-modal__panel",
            adaptive && "vf-modal__panel--adaptive",
            className
          )}
          style={{ width, ...style }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          data-adaptive={adaptive ? "true" : undefined}
          {...(props as HTMLAttributes<HTMLDivElement>)}
        >
          {title && (
            <div className="vf-modal__head">
              <Label style={{ fontSize: "var(--vf-font-sm)", color: "var(--vf-text-0)" }}>
                {title}
              </Label>
              <button
                type="button"
                className="vf-modal__close"
                onClick={onDismiss}
                aria-label="Close"
              >
                ×
              </button>
            </div>
          )}
          {children}
        </FocusScope>
      </DismissableLayer>
    </div>
  );

  // motion={false} → use the original conditional-render path, no Presence.
  if (!motion) {
    if (!open) return null;
    return <Portal>{inner}</Portal>;
  }

  return (
    <Portal>
      <Presence present={open}>{inner}</Presence>
    </Portal>
  );
});
Modal.displayName = "Modal";

// ── Toast ─────────────────────────────────────────────────────
// role="alert" for danger (assertive), role="status" for everything
// else (polite) — matches screen-reader expectations for urgency.

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  message: string;
  type?: ToastType;
  visible?: boolean;
  onDismiss?: () => void;
  style?: CSSProperties;
}

/**
 * Transient popup notification for async feedback. For 1.0+ use the
 * module-level `toast` API (`toast.success`, `toast.info`, `toast.warning`,
 * `toast.danger`, `toast.promise`) with a `Toaster` mounted near the app
 * root.
 *
 * @deprecated Use `Toaster` + `toast()` from `voidframe` instead.
 */
export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { message, type = "info", visible = true, onDismiss, className, style, ...props },
  ref
) {
  deprecatedComponent("Toast", "Toaster", "v1.1");
  if (!visible) return null;
  const composedStyle: CSSProperties = {
    ["--vf-toast-color" as never]: TOAST_VAR[type],
    ...style,
  };
  const role = type === "danger" ? "alert" : "status";
  const ariaLive = type === "danger" ? "assertive" : "polite";
  return (
    <div
      ref={ref}
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={cx("vf-toast", className)}
      style={composedStyle}
      {...props}
    >
      <span aria-hidden="true" className="vf-toast__dot">
        ●
      </span>
      <span className="vf-toast__msg">{message}</span>
      {onDismiss && (
        <button
          type="button"
          className="vf-toast__dismiss"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
});
Toast.displayName = "Toast";

// ── Kbd ───────────────────────────────────────────────────────

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  /** Combo string (e.g. "Cmd+K"). Use children for single-key form. */
  keys?: string;
  style?: CSSProperties;
}

const KbdImpl = forwardRef<HTMLElement, KbdProps>(function Kbd(
  { keys, children, className, style, ...props },
  ref
) {
  return (
    <kbd
      ref={ref as never}
      className={cx("vf-kbd", className)}
      style={style}
      {...props}
    >
      {children ?? keys}
    </kbd>
  );
});
KbdImpl.displayName = "Kbd";
/**
 * Renders a keyboard shortcut label (e.g. `Cmd`+`K`). Accepts an array of
 * tokens for multi-key chords.
 */
export const Kbd = memo(KbdImpl);
(Kbd as unknown as { displayName: string }).displayName = "Kbd";
