"use client";

// Phase 10 — NotificationCenter, BannerAlert, Callout, Quote, Alert (upgrade)

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { toneAttrs } from "../utils/toneAttrs";
import { Label } from "./Text";
import { useMergedRefs } from "../hooks/useMergedRefs";
import { FocusScope } from "../primitives/FocusScope";
import { Portal } from "../primitives/Portal";

// ── NotificationCenter ──────────────────────────────────────

export interface NotificationItem {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  read?: boolean;
  time?: Date | string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
}

export interface NotificationCenterProps extends HTMLAttributes<HTMLDivElement> {
  notifications: NotificationItem[];
  unreadCount?: number;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDismiss?: (id: string) => void;
  renderNotification?: (n: NotificationItem) => ReactNode;
  kind?: "dropdown" | "drawer";
  triggerLabel?: string;
  /**
   * Accent color (hex / CSS color). Themes the unread badge + the
   * unread-row highlight. Defaults to `--vf-danger` so consumers who
   * don't override get a neutral theme-aligned red badge.
   */
  accent?: string;
  /**
   * Force the dropdown anchor side. Defaults to `"start"` which opens
   * below-and-right of the trigger.
   */
  anchor?: "start" | "end";
}

function formatTime(t: Date | string | undefined): string {
  if (!t) return "";
  const d = typeof t === "string" ? new Date(t) : t;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

/**
 * Drawer of grouped notifications with read/unread state, per-item actions,
 * and clear-all.
 */
export const NotificationCenter = forwardRef<HTMLDivElement, NotificationCenterProps>(
  function NotificationCenter(
    {
      notifications,
      unreadCount,
      onMarkRead,
      onMarkAllRead,
      onDismiss,
      renderNotification,
      kind = "dropdown",
      triggerLabel = "Notifications",
      accent,
      anchor = "start",
      className,
      style,
      ...props
    },
    ref
  ) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const mergedRef = useMergedRefs(ref, wrapperRef);

    // Fixed-position coords for the portaled panel, computed from the
    // trigger rect. `right` is used when anchor="end".
    const [panelPos, setPanelPos] = useState<{
      top: number;
      left?: number;
      right?: number;
    } | null>(null);

    const updatePosition = useCallback(() => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (anchor === "end") {
        setPanelPos({ top: r.bottom + 6, right: Math.max(12, window.innerWidth - r.right) });
      } else {
        setPanelPos({ top: r.bottom + 6, left: Math.max(12, r.left) });
      }
    }, [anchor]);

    // The panel lives under document.body, so a single-ref click-outside
    // would treat clicks inside the panel as "outside". Check both nodes.
    useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
        const t = e.target as Node;
        if (wrapperRef.current?.contains(t)) return;
        if (panelRef.current?.contains(t)) return;
        setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Keep the panel anchored across viewport changes while open.
    useEffect(() => {
      if (!open) return;
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }, [open, updatePosition]);

    // Close on Escape while the dialog is open.
    useEffect(() => {
      if (!open) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          setOpen(false);
        }
      };
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }, [open]);
    const unread = unreadCount ?? notifications.filter((n) => !n.read).length;
    const composedStyle = accent
      ? ({ "--vf-accent": accent, ...style } as React.CSSProperties)
      : style;

    return (
      <div
        ref={mergedRef}
        className={cx(
          "vf-notif-center",
          `vf-notif-center--${kind}`,
          anchor === "end" && "vf-notif-center--right",
          className
        )}
        style={composedStyle}
        {...props}
      >
        <button
          ref={triggerRef}
          type="button"
          className="vf-notif-center__trigger"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`${triggerLabel}${unread ? ` (${unread} unread)` : ""}`}
          onClick={() => {
            if (!open) updatePosition();
            setOpen((v) => !v);
          }}
        >
          <svg
            aria-hidden="true"
            className="vf-notif-center__icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="square"
            strokeLinejoin="miter"
          >
            <path d="M6 15V10a6 6 0 0 1 12 0v5l2 3H4z" />
            <path d="M10 21a2 2 0 0 0 4 0" />
          </svg>
          {unread > 0 && (
            <span className="vf-notif-center__badge">{unread}</span>
          )}
        </button>
        {open && panelPos && (
          <Portal>
            <div
              ref={panelRef}
              className="vf-notif-center__float"
              style={{ top: panelPos.top, left: panelPos.left, right: panelPos.right }}
            >
              <FocusScope
                trapped
                loop
                autoFocus
                restoreFocus
                role="dialog"
                aria-label={triggerLabel}
                className="vf-notif-center__panel vf-notif-center__panel--portaled"
              >
            <header className="vf-notif-center__head">
              <Label>{triggerLabel}</Label>
              {onMarkAllRead && unread > 0 && (
                <button
                  type="button"
                  className="vf-notif-center__action"
                  onClick={onMarkAllRead}
                >
                  Mark all read
                </button>
              )}
            </header>
            <ul className="vf-notif-center__list">
              {notifications.length === 0 && (
                <li className="vf-notif-center__empty">No notifications</li>
              )}
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={cx(
                    "vf-notif-center__item",
                    !n.read && "vf-notif-center__item--unread",
                    n.tone && `vf-notif-center__item--${n.tone}`
                  )}
                  onClick={() => onMarkRead?.(n.id)}
                >
                  {renderNotification ? (
                    renderNotification(n)
                  ) : (
                    <>
                      <div className="vf-notif-center__title">{n.title}</div>
                      {n.description && (
                        <div className="vf-notif-center__desc">{n.description}</div>
                      )}
                      {n.time && (
                        <time className="vf-notif-center__time">{formatTime(n.time)}</time>
                      )}
                    </>
                  )}
                  {onDismiss && (
                    <button
                      type="button"
                      data-testid={`vf-notification-dismiss-button-${n.id}`}
                      className="vf-notif-center__dismiss"
                      aria-label={`Dismiss notification`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDismiss(n.id);
                      }}
                    >
                      ×
                    </button>
                  )}
                </li>
              ))}
            </ul>
              </FocusScope>
            </div>
          </Portal>
        )}
      </div>
    );
  }
);
NotificationCenter.displayName = "NotificationCenter";

// ── BannerAlert ─────────────────────────────────────────────

export interface BannerAlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  style?: CSSProperties;
}

/**
 * Full-width banner alert anchored to the top (or bottom) of a layout.
 * Heavier than `Alert`; use for site-wide notices.
 */
export const BannerAlert = forwardRef<HTMLDivElement, BannerAlertProps>(
  function BannerAlert(
    {
      tone = "info",
      dismissible,
      onDismiss,
      action,
      icon,
      className,
      children,
      ...props
    },
    ref
  ) {
    const [hidden, setHidden] = useState(false);
    if (hidden) return null;
    const role = tone === "danger" || tone === "warning" ? "alert" : "status";
    const ta = toneAttrs("vf-banner-alert", { tone });
    return (
      <div
        ref={ref}
        role={role}
        className={cx(ta.className, className)}
        {...ta.attrs}
        {...props}
      >
        {icon && <span className="vf-banner-alert__icon">{icon}</span>}
        <div className="vf-banner-alert__body">{children}</div>
        {action && <div className="vf-banner-alert__action">{action}</div>}
        {dismissible && (
          <button
            type="button"
            data-testid="vf-banner-alert-dismiss-button"
            className="vf-banner-alert__dismiss"
            aria-label="Dismiss"
            onClick={() => {
              setHidden(true);
              onDismiss?.();
            }}
          >
            ×
          </button>
        )}
      </div>
    );
  }
);
BannerAlert.displayName = "BannerAlert";

// ── Callout / InfoBox ──────────────────────────────────────

export interface CalloutProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  icon?: ReactNode;
  title?: ReactNode;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  children?: ReactNode;
}

/**
 * Emphasised inline block with an icon, title, and body. Similar to `Alert`
 * but for editorial / doc-style calls rather than runtime notices.
 */
export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  { icon, title, tone = "info", className, children, ...props },
  ref
) {
  const ta = toneAttrs("vf-callout", { tone });
  return (
    <div
      ref={ref}
      className={cx(ta.className, className)}
      {...ta.attrs}
      {...props}
    >
      {icon && <span className="vf-callout__icon" aria-hidden="true">{icon}</span>}
      <div className="vf-callout__body">
        {title && <div className="vf-callout__title">{title}</div>}
        <div className="vf-callout__content">{children}</div>
      </div>
    </div>
  );
});
Callout.displayName = "Callout";

// ── Quote / Blockquote ─────────────────────────────────────

export interface QuoteProps extends HTMLAttributes<HTMLQuoteElement> {
  cite?: ReactNode;
  source?: ReactNode;
  children?: ReactNode;
}

/**
 * Styled pull-quote block with optional attribution.
 */
export const Quote = forwardRef<HTMLQuoteElement, QuoteProps>(function Quote(
  { cite, source, className, children, ...props },
  ref
) {
  return (
    <blockquote
      ref={ref}
      className={cx("vf-quote", className)}
      cite={typeof cite === "string" ? cite : undefined}
      {...props}
    >
      <p className="vf-quote__body">{children}</p>
      {(cite || source) && (
        <footer className="vf-quote__footer">
          {source && <span className="vf-quote__source">{source}</span>}
          {cite && typeof cite !== "string" && (
            <cite className="vf-quote__cite">{cite}</cite>
          )}
        </footer>
      )}
    </blockquote>
  );
});
Quote.displayName = "Quote";

// ── Alert (upgraded inline alert) ──────────────────────────

export type AlertTone = "neutral" | "info" | "success" | "warning" | "danger";

export interface AlertV2Props extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  tone?: AlertTone;
  icon?: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: ReactNode;
  /**
   * When true, renders the alert body in a monospace font — suitable for CI
   * failure output, stack traces, or JSON payloads pasted into an alert.
   * Mirrors `Card.monospace` / `Dialog.Content.monospace`.
   */
  monospace?: boolean;
  children?: ReactNode;
}

/**
 * Next-gen inline alert with richer layout slots (title, description,
 * actions, icon). Controllable dismissed state; tone mirrors `Alert`.
 */
export const AlertV2 = forwardRef<HTMLDivElement, AlertV2Props>(function AlertV2(
  {
    title,
    tone = "info",
    icon,
    dismissible,
    onDismiss,
    action,
    monospace,
    className,
    children,
    ...props
  },
  ref
) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  const role = tone === "danger" ? "alert" : "status";
  const ta = toneAttrs("vf-alert-v2", { tone });
  return (
    <div
      ref={ref}
      role={role}
      className={cx(ta.className, monospace && "vf-alert-v2--monospace", className)}
      {...ta.attrs}
      {...props}
    >
      {icon && <span className="vf-alert-v2__icon" aria-hidden="true">{icon}</span>}
      <div className="vf-alert-v2__body">
        {title && <div className="vf-alert-v2__title">{title}</div>}
        {children && <div className="vf-alert-v2__content">{children}</div>}
      </div>
      {action && <div className="vf-alert-v2__action">{action}</div>}
      {dismissible && (
        <button
          type="button"
          data-testid="vf-alert-v2-dismiss-button"
          className="vf-alert-v2__dismiss"
          aria-label="Dismiss"
          onClick={() => {
            setHidden(true);
            onDismiss?.();
          }}
        >
          ×
        </button>
      )}
    </div>
  );
});
AlertV2.displayName = "AlertV2";
