"use client";

import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useId } from "../hooks/useId";
import { DismissableLayer } from "../primitives/DismissableLayer";
import { FocusScope } from "../primitives/FocusScope";
import { Portal } from "../primitives/Portal";
import { Presence } from "../primitives/Presence";
import type { ToastType } from "../types";
import { cx } from "../utils/cx";
import { warn } from "../utils/warn";
import { Button } from "./Button";
import { Label } from "./Text";

const TOAST_VAR: Record<ToastType, string> = {
  info: "var(--vf-info)",
  success: "var(--vf-success)",
  warning: "var(--vf-warning)",
  danger: "var(--vf-danger)",
};

// ── Tabs ──────────────────────────────────────────────────────
// role=tablist on the bar, role=tab on triggers; arrow-key nav via
// the shared handler. Panels are consumer-owned.

export interface TabItem {
  key: string;
  label: string;
}

export interface TabsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
  accent?: string;
  /** Accessible label for the tablist. */
  "aria-label"?: string;
  style?: CSSProperties;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { tabs, active, onChange, accent, className, style, ...props },
  ref
) {
  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = tabs.findIndex((t) => t.key === active);
    if (idx === -1) return;
    let nextIdx = idx;
    if (e.key === "ArrowRight") nextIdx = (idx + 1) % tabs.length;
    else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") nextIdx = 0;
    else if (e.key === "End") nextIdx = tabs.length - 1;
    else return;
    e.preventDefault();
    const nextKey = tabs[nextIdx]?.key;
    if (nextKey) onChange(nextKey);
  };
  return (
    <div
      ref={ref}
      className={cx("vf-tabs", className)}
      style={style}
      role="tablist"
      onKeyDown={handleKey}
      {...props}
    >
      {tabs.map((tab) => {
        const selected = active === tab.key;
        return (
          <Button
            key={tab.key}
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            active={selected}
            onClick={() => onChange(tab.key)}
            accent={accent}
            variant={accent ? "accent" : "default"}
          >
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
});
Tabs.displayName = "Tabs";

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
  onClose: () => void;
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

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onClose,
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
    <DismissableLayer
      onDismiss={onClose}
      className="vf-modal__backdrop"
    >
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
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        )}
        {children}
      </FocusScope>
    </DismissableLayer>
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

export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { message, type = "info", visible = true, onDismiss, className, style, ...props },
  ref
) {
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

export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
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
Kbd.displayName = "Kbd";
