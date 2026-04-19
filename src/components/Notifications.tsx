"use client";

// Phase 10 — NotificationCenter, BannerAlert, Callout, Quote, Alert (upgrade)

import {
  forwardRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { Label } from "./Text";
import { useClickOutside } from "../hooks";
import { useMergedRefs } from "../hooks/useMergedRefs";

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
    const outsideRef = useClickOutside<HTMLDivElement>(() => setOpen(false));
    const mergedRef = useMergedRefs(ref, outsideRef);
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
          type="button"
          className="vf-notif-center__trigger"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-label={`${triggerLabel}${unread ? ` (${unread} unread)` : ""}`}
          onClick={() => setOpen(!open)}
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
        {open && (
          <div
            role="dialog"
            aria-label={triggerLabel}
            className="vf-notif-center__panel"
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
          </div>
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
    return (
      <div
        ref={ref}
        role={role}
        className={cx("vf-banner-alert", `vf-banner-alert--${tone}`, className)}
        {...props}
      >
        {icon && <span className="vf-banner-alert__icon">{icon}</span>}
        <div className="vf-banner-alert__body">{children}</div>
        {action && <div className="vf-banner-alert__action">{action}</div>}
        {dismissible && (
          <button
            type="button"
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

export const Callout = forwardRef<HTMLDivElement, CalloutProps>(function Callout(
  { icon, title, tone = "info", className, children, ...props },
  ref
) {
  return (
    <aside
      ref={ref}
      className={cx("vf-callout", `vf-callout--${tone}`, className)}
      {...props}
    >
      {icon && <span className="vf-callout__icon" aria-hidden="true">{icon}</span>}
      <div className="vf-callout__body">
        {title && <div className="vf-callout__title">{title}</div>}
        <div className="vf-callout__content">{children}</div>
      </div>
    </aside>
  );
});
Callout.displayName = "Callout";

// ── Quote / Blockquote ─────────────────────────────────────

export interface QuoteProps extends HTMLAttributes<HTMLQuoteElement> {
  cite?: ReactNode;
  source?: ReactNode;
  children?: ReactNode;
}

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
  children?: ReactNode;
}

export const AlertV2 = forwardRef<HTMLDivElement, AlertV2Props>(function AlertV2(
  {
    title,
    tone = "info",
    icon,
    dismissible,
    onDismiss,
    action,
    className,
    children,
    ...props
  },
  ref
) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  const role = tone === "danger" ? "alert" : "status";
  return (
    <div
      ref={ref}
      role={role}
      className={cx("vf-alert-v2", `vf-alert-v2--${tone}`, className)}
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
