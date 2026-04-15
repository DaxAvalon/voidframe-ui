"use client";

// Phase 10 — LoadingOverlay, SpinnerV2 (variants), Shimmer, ErrorState

import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

// ── LoadingOverlay ──────────────────────────────────────────

export interface LoadingOverlayProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  label?: ReactNode;
  blur?: boolean;
  /** Accent color override (sets --vf-accent). */
  color?: string;
  /** Render the overlay even when not "open" (controlled visibility). */
  children?: ReactNode;
}

export const LoadingOverlay = forwardRef<HTMLDivElement, LoadingOverlayProps>(
  function LoadingOverlay(
    { open = true, label, blur, color, className, style, children, ...props },
    ref
  ) {
    if (!open) return null;
    const merged: CSSProperties = {
      ...(color ? ({ "--vf-accent": color } as CSSProperties) : {}),
      ...style,
    };
    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cx(
          "vf-loading-overlay",
          blur && "vf-loading-overlay--blur",
          className
        )}
        style={merged}
        {...props}
      >
        <div className="vf-loading-overlay__content">
          <SpinnerV2 size={28} />
          {label && <div className="vf-loading-overlay__label">{label}</div>}
          {children}
        </div>
      </div>
    );
  }
);
LoadingOverlay.displayName = "LoadingOverlay";

// ── SpinnerV2 (variants) ────────────────────────────────────

export type SpinnerVariant = "ring" | "dots" | "bars" | "pulse";

export interface SpinnerV2Props extends HTMLAttributes<HTMLDivElement> {
  size?: number;
  variant?: SpinnerVariant;
  color?: string;
  label?: string;
}

export const SpinnerV2 = forwardRef<HTMLDivElement, SpinnerV2Props>(function SpinnerV2(
  { size = 16, variant = "ring", color, label = "Loading", className, style, ...props },
  ref
) {
  const merged: CSSProperties = {
    width: size,
    height: size,
    ...(color ? ({ "--vf-spinner-color": color } as CSSProperties) : {}),
    ...style,
  };
  return (
    <div
      ref={ref}
      role="status"
      aria-label={label}
      className={cx("vf-spinner-v2", `vf-spinner-v2--${variant}`, className)}
      style={merged}
      {...props}
    >
      {variant === "dots" && (
        <>
          <span className="vf-spinner-v2__dot" />
          <span className="vf-spinner-v2__dot" />
          <span className="vf-spinner-v2__dot" />
        </>
      )}
      {variant === "bars" && (
        <>
          <span className="vf-spinner-v2__bar" />
          <span className="vf-spinner-v2__bar" />
          <span className="vf-spinner-v2__bar" />
          <span className="vf-spinner-v2__bar" />
        </>
      )}
      {variant === "pulse" && <span className="vf-spinner-v2__pulse" />}
      {variant === "ring" && (
        <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="var(--vf-spinner-color, currentColor)"
            strokeWidth="2"
            fill="none"
            opacity="0.25"
          />
          <path
            d="M22 12a10 10 0 0 1-10 10"
            stroke="var(--vf-spinner-color, currentColor)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
});
SpinnerV2.displayName = "SpinnerV2";

// ── Shimmer ──────────────────────────────────────────────────

export interface ShimmerProps extends HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  lines?: number;
  rounded?: boolean;
  style?: CSSProperties;
}

export const Shimmer = forwardRef<HTMLDivElement, ShimmerProps>(function Shimmer(
  { width, height = 14, lines = 1, rounded, className, style, ...props },
  ref
) {
  if (lines > 1) {
    return (
      <div
        ref={ref}
        className={cx("vf-shimmer-stack", className)}
        aria-hidden="true"
        style={style}
        {...props}
      >
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cx("vf-shimmer", rounded && "vf-shimmer--rounded")}
            style={{
              width: i === lines - 1 ? "60%" : (width ?? "100%"),
              height,
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      ref={ref}
      className={cx("vf-shimmer", rounded && "vf-shimmer--rounded", className)}
      aria-hidden="true"
      style={{ width, height, ...style }}
      {...props}
    />
  );
});
Shimmer.displayName = "Shimmer";

// ── ErrorState ──────────────────────────────────────────────

export interface ErrorStateProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  error?: Error | string | null;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
}

export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(
  function ErrorState(
    {
      error,
      title = "Something went wrong",
      description,
      icon,
      actions,
      compact,
      className,
      ...props
    },
    ref
  ) {
    const fallbackDesc =
      description ??
      (error instanceof Error ? error.message : typeof error === "string" ? error : null);
    return (
      <div
        ref={ref}
        role="alert"
        className={cx(
          "vf-error-state",
          compact && "vf-error-state--compact",
          className
        )}
        {...props}
      >
        {icon && <div className="vf-error-state__icon" aria-hidden="true">{icon}</div>}
        <div className="vf-error-state__body">
          <div className="vf-error-state__title">{title}</div>
          {fallbackDesc && (
            <div className="vf-error-state__description">{fallbackDesc}</div>
          )}
        </div>
        {actions && <div className="vf-error-state__actions">{actions}</div>}
      </div>
    );
  }
);
ErrorState.displayName = "ErrorState";
