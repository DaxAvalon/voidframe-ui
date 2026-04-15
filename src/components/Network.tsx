"use client";

// Phase 10 — OfflineBanner + ConnectionStatus

import {
  forwardRef,
  useEffect,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import { useNetworkStatus } from "../hooks/useNetworkStatus";

// ── OfflineBanner ───────────────────────────────────────────

export interface OfflineBannerProps extends HTMLAttributes<HTMLDivElement> {
  message?: ReactNode;
  /** Allow dismissing while still offline. Reappears on next disconnect. */
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const OfflineBanner = forwardRef<HTMLDivElement, OfflineBannerProps>(
  function OfflineBanner(
    { message = "You are offline.", dismissible = true, onDismiss, className, ...props },
    ref
  ) {
    const status = useNetworkStatus();
    const offline = !status.online;
    const [hidden, setHidden] = useState(false);

    // Reset the hidden flag whenever connectivity returns so the next
    // disconnect re-shows the banner.
    useEffect(() => {
      if (!offline) setHidden(false);
    }, [offline]);

    if (!offline || hidden) return null;
    return (
      <div
        ref={ref}
        role="alert"
        aria-live="assertive"
        className={cx("vf-offline-banner", className)}
        {...props}
      >
        <span className="vf-offline-banner__message">{message}</span>
        {dismissible && (
          <button
            type="button"
            className="vf-offline-banner__dismiss"
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
OfflineBanner.displayName = "OfflineBanner";

// ── ConnectionStatus ────────────────────────────────────────

export type ConnectionState =
  | "connected"
  | "connecting"
  | "disconnected"
  | "error";

export interface ConnectionStatusProps extends HTMLAttributes<HTMLSpanElement> {
  status: ConnectionState;
  label?: ReactNode;
}

const STATUS_LABEL: Record<ConnectionState, string> = {
  connected: "Connected",
  connecting: "Connecting",
  disconnected: "Disconnected",
  error: "Connection error",
};

export const ConnectionStatus = forwardRef<HTMLSpanElement, ConnectionStatusProps>(
  function ConnectionStatus({ status, label, className, ...props }, ref) {
    return (
      <span
        ref={ref}
        role="status"
        aria-label={typeof label === "string" ? label : STATUS_LABEL[status]}
        className={cx(
          "vf-connection",
          `vf-connection--${status}`,
          className
        )}
        {...props}
      >
        <span aria-hidden="true" className="vf-connection__dot" />
        <span className="vf-connection__label">{label ?? STATUS_LABEL[status]}</span>
      </span>
    );
  }
);
ConnectionStatus.displayName = "ConnectionStatus";
