"use client";

import { forwardRef, useState } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { useClickOutside } from "../hooks";
import { useMergedRefs } from "../hooks/useMergedRefs";
import { DismissableLayer } from "../primitives/DismissableLayer";
import { FocusScope } from "../primitives/FocusScope";
import { Portal } from "../primitives/Portal";
import { Presence } from "../primitives/Presence";
import type { Side, ToastType } from "../types";
import { cx } from "../utils/cx";
import { warn } from "../utils/warn";
import { deprecatedComponent } from "../utils/deprecate";
import { Button } from "./Button";
import { Label } from "./Text";

const ALERT_VAR: Record<ToastType, string> = {
  info: "var(--vf-info)",
  success: "var(--vf-success)",
  warning: "var(--vf-warning)",
  danger: "var(--vf-danger)",
};

// ── Drawer ────────────────────────────────────────────────────
// Portal + FocusScope + DismissableLayer for full a11y.

export interface DrawerProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: "left" | "right";
  width?: string | number;
  /** Enable enter/exit animations. Default true. */
  motion?: boolean;
  /** Expand to full-width below the `md` breakpoint. Default true. */
  adaptive?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

/** @deprecated Use `DrawerV2` from `voidframe` instead. Will be removed in v1.1. */
export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
  {
    open,
    onClose,
    title,
    side = "right",
    width = "360px",
    motion = true,
    adaptive = true,
    children,
    className,
    style,
    ...props
  },
  ref
) {
  deprecatedComponent("Drawer", "DrawerV2", "v1.1");
  warn(
    Boolean(
      title ||
        (props as Record<string, unknown>)["aria-label"] ||
        (props as Record<string, unknown>)["aria-labelledby"]
    ),
    "<Drawer> requires a `title` or `aria-label`/`aria-labelledby` for accessibility."
  );

  const inner = (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="vf-drawer"
      {...props}
    >
      <div
        className="vf-drawer__backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <DismissableLayer onDismiss={onClose}>
        <FocusScope
          trapped
          autoFocus
          restoreFocus
          loop
          className={cx(
            "vf-drawer__panel",
            `vf-drawer__panel--${side}`,
            adaptive && "vf-drawer__panel--adaptive",
            className
          )}
          style={{ width, ...style }}
          data-adaptive={adaptive ? "true" : undefined}
        >
          <div className="vf-drawer__head">
            {title && (
              <Label style={{ fontSize: "var(--vf-font-sm)", color: "var(--vf-text-0)" }}>
                {title}
              </Label>
            )}
            <button
              type="button"
              className="vf-drawer__close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="vf-drawer__body">{children}</div>
        </FocusScope>
      </DismissableLayer>
    </div>
  );

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
Drawer.displayName = "Drawer";

// ── Dropdown ──────────────────────────────────────────────────

export interface DropdownMenuItem {
  label: string;
  onClick?: () => void;
  divider?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  danger?: boolean;
}

export interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  trigger: ReactNode;
  items: DropdownMenuItem[];
  align?: "left" | "right";
  style?: CSSProperties;
}

/** @deprecated Use `Menu` from `voidframe` instead. Will be removed in v1.1. */
export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(
  { trigger, items, align = "left", className, style, ...props },
  ref
) {
  deprecatedComponent("Dropdown", "Menu", "v1.1");
  const [open, setOpen] = useState(false);
  const clickOutsideRef = useClickOutside<HTMLDivElement>(() => setOpen(false));
  const mergedRef = useMergedRefs(ref, clickOutsideRef);
  return (
    <div
      ref={mergedRef}
      className={cx("vf-dropdown", className)}
      style={style}
      {...props}
    >
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div role="menu" className={cx("vf-dropdown__menu", `vf-dropdown__menu--${align}`)}>
          {items.map((item, i) => {
            if (item.divider) {
              return <div key={i} role="separator" className="vf-dropdown__separator" />;
            }
            return (
              <div
                key={i}
                role="menuitem"
                className="vf-dropdown__item"
                data-disabled={item.disabled ? "true" : undefined}
                data-danger={item.danger ? "true" : undefined}
                tabIndex={item.disabled ? -1 : 0}
                onClick={
                  item.disabled
                    ? undefined
                    : () => {
                        item.onClick?.();
                        setOpen(false);
                      }
                }
                onKeyDown={
                  item.disabled
                    ? undefined
                    : (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          item.onClick?.();
                          setOpen(false);
                        }
                      }
                }
              >
                {item.icon && <span className="vf-dropdown__item-icon">{item.icon}</span>}
                {item.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
Dropdown.displayName = "Dropdown";

// ── Popover ───────────────────────────────────────────────────

export interface PopoverProps extends HTMLAttributes<HTMLDivElement> {
  trigger: ReactNode;
  children?: ReactNode;
  on?: "click" | "hover";
  position?: Side;
  width?: string | number;
  style?: CSSProperties;
}

/** @deprecated Use `PopoverV2` from `voidframe` instead. Will be removed in v1.1. */
export const Popover = forwardRef<HTMLDivElement, PopoverProps>(function Popover(
  { trigger, children, on = "click", position = "bottom", width = "240px", className, style, ...props },
  ref
) {
  deprecatedComponent("Popover", "PopoverV2", "v1.1");
  const [show, setShow] = useState(false);
  const clickOutsideRef = useClickOutside<HTMLDivElement>(() => {
    if (on === "click") setShow(false);
  });
  const mergedRef = useMergedRefs(ref, clickOutsideRef);
  const hoverBinds =
    on === "hover"
      ? { onMouseEnter: () => setShow(true), onMouseLeave: () => setShow(false) }
      : {};
  return (
    <div
      ref={mergedRef}
      className={cx("vf-popover", className)}
      style={style}
      {...hoverBinds}
      {...props}
    >
      <div onClick={on === "click" ? () => setShow(!show) : undefined}>{trigger}</div>
      {show && (
        <div
          className={cx("vf-popover__panel", `vf-popover__panel--${position}`)}
          style={{ width }}
        >
          {children}
        </div>
      )}
    </div>
  );
});
Popover.displayName = "Popover";

// ── Alert ─────────────────────────────────────────────────────

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  type?: ToastType;
  title?: string;
  children?: ReactNode;
  onDismiss?: () => void;
  style?: CSSProperties;
}

/** @deprecated Use `AlertV2` from `voidframe` instead. Will be removed in v1.1. */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { type = "info", title, children, onDismiss, className, style, ...props },
  ref
) {
  deprecatedComponent("Alert", "AlertV2", "v1.1");
  const composedStyle: CSSProperties = {
    ["--vf-alert-color" as never]: ALERT_VAR[type],
    ...style,
  };
  const role = type === "danger" ? "alert" : "status";
  return (
    <div
      ref={ref}
      role={role}
      className={cx("vf-alert", className)}
      style={composedStyle}
      {...props}
    >
      <div className="vf-alert__row">
        <div style={{ flex: 1 }}>
          {title && <div className="vf-alert__title">{title}</div>}
          <div className="vf-alert__body">{children}</div>
        </div>
        {onDismiss && (
          <button
            type="button"
            className="vf-alert__dismiss"
            onClick={onDismiss}
            aria-label="Dismiss"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
});
Alert.displayName = "Alert";

// ── ConfirmDialog ─────────────────────────────────────────────
// role="alertdialog" + Portal + FocusScope + DismissableLayer.
// Auto-focuses the Cancel button (safer default).

export interface ConfirmDialogProps extends HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  /** Enable enter/exit animations. Default true. */
  motion?: boolean;
  style?: CSSProperties;
}

/** @deprecated Use `ConfirmDialogV2` from `voidframe` instead. Will be removed in v1.1. */
export const ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>(
  function ConfirmDialog(
    {
      open,
      onConfirm,
      onCancel,
      title = "CONFIRM",
      message,
      confirmLabel = "CONFIRM",
      cancelLabel = "CANCEL",
      danger,
      motion = true,
      className,
      style,
      ...props
    },
    ref
  ) {
    deprecatedComponent("ConfirmDialog", "ConfirmDialogV2", "v1.1");
    const inner = (
      <DismissableLayer onDismiss={onCancel} className="vf-modal__backdrop">
        <FocusScope
          ref={ref as never}
          trapped
          autoFocus
          restoreFocus
          loop
          className={cx("vf-confirm__panel", className)}
          style={style}
          role="alertdialog"
          aria-modal="true"
          aria-label={title}
          {...(props as HTMLAttributes<HTMLDivElement>)}
        >
          <Label className="vf-confirm__title">{title}</Label>
          {message && <div className="vf-confirm__msg">{message}</div>}
          <div className="vf-confirm__actions">
            <Button onClick={onCancel}>{cancelLabel}</Button>
            <Button
              variant="solid"
              accent={danger ? "var(--vf-danger)" : "var(--vf-green)"}
              onClick={onConfirm}
            >
              {confirmLabel}
            </Button>
          </div>
        </FocusScope>
      </DismissableLayer>
    );

    if (!motion) {
      if (!open) return null;
      return <Portal>{inner}</Portal>;
    }

    return (
      <Portal>
        <Presence present={open}>{inner}</Presence>
      </Portal>
    );
  }
);
ConfirmDialog.displayName = "ConfirmDialog";
