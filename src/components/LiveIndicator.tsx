"use client";

import { forwardRef, memo } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils/cx";

export interface LiveIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "typing" | "recording" | "active" | "live";
  label?: string;
  avatar?: string | ReactNode;
  size?: "sm" | "md";
  animated?: boolean;
  style?: CSSProperties;
}

const LiveIndicatorImpl = forwardRef<HTMLDivElement, LiveIndicatorProps>(
  function LiveIndicator(
    {
      variant = "typing",
      label,
      avatar,
      size = "md",
      animated = true,
      className,
      style,
      ...props
    },
    ref
  ) {
    const renderAvatar = () => {
      if (!avatar) return null;
      if (typeof avatar === "string") {
        return (
          <img
            src={avatar}
            alt=""
            className="vf-live-indicator__avatar"
            aria-hidden="true"
          />
        );
      }
      return (
        <span className="vf-live-indicator__avatar" aria-hidden="true">
          {avatar}
        </span>
      );
    };

    const renderIndicator = () => {
      switch (variant) {
        case "typing":
          return (
            <span className="vf-live-indicator__dots" aria-hidden="true">
              <span className="vf-live-indicator__dot" />
              <span className="vf-live-indicator__dot" />
              <span className="vf-live-indicator__dot" />
            </span>
          );
        case "recording":
          return (
            <span
              className="vf-live-indicator__pulse vf-live-indicator__pulse--recording"
              aria-hidden="true"
            />
          );
        case "active":
          return (
            <span
              className="vf-live-indicator__pulse vf-live-indicator__pulse--active"
              aria-hidden="true"
            />
          );
        case "live":
          return (
            <>
              <span
                className="vf-live-indicator__pulse vf-live-indicator__pulse--live"
                aria-hidden="true"
              />
              <span className="vf-live-indicator__live-text">LIVE</span>
            </>
          );
        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={cx(
          "vf-live-indicator",
          `vf-live-indicator--${variant}`,
          `vf-live-indicator--${size}`,
          !animated && "vf-live-indicator--static",
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={
          label ??
          (variant === "typing"
            ? "Typing"
            : variant === "recording"
              ? "Recording"
              : variant === "active"
                ? "Active"
                : "Live")
        }
        style={style}
        {...props}
      >
        {renderAvatar()}
        {renderIndicator()}
        {label && (
          <span className="vf-live-indicator__label">{label}</span>
        )}
      </div>
    );
  }
);
LiveIndicatorImpl.displayName = "LiveIndicator";
export const LiveIndicator = memo(LiveIndicatorImpl);
(LiveIndicator as unknown as { displayName: string }).displayName =
  "LiveIndicator";
