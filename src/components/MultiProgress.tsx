"use client";

import { forwardRef, memo } from "react";
import type { CSSProperties, HTMLAttributes } from "react";
import { cx } from "../utils/cx";

export interface MultiProgressItem {
  key: string;
  label: string;
  value: number;
  max?: number;
  status?: "active" | "success" | "error" | "paused" | "pending";
  description?: string;
  tone?: "default" | "success" | "danger" | "warning" | "info";
}

export interface MultiProgressProps extends HTMLAttributes<HTMLDivElement> {
  items: MultiProgressItem[];
  size?: "sm" | "md" | "lg";
  showValues?: boolean;
  animated?: boolean;
  striped?: boolean;
  onCancel?: (key: string) => void;
  compact?: boolean;
  style?: CSSProperties;
}

const STATUS_ICONS: Record<string, string> = {
  success: "\u2713",
  error: "\u2717",
  paused: "\u23F8",
};

const MultiProgressImpl = forwardRef<HTMLDivElement, MultiProgressProps>(
  function MultiProgress(
    {
      items,
      size = "md",
      showValues = true,
      animated = true,
      striped = false,
      onCancel,
      compact = false,
      className,
      style,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx(
          "vf-multi-progress",
          `vf-multi-progress--${size}`,
          compact && "vf-multi-progress--compact",
          !animated && "vf-multi-progress--static",
          className
        )}
        style={style}
        {...props}
      >
        {items.map((item) => {
          const max = item.max ?? 100;
          const clamped = Math.min(Math.max(item.value, 0), max);
          const pct = max > 0 ? (clamped / max) * 100 : 0;
          const status = item.status ?? "active";
          const tone = item.tone ?? "default";
          const statusIcon = STATUS_ICONS[status];

          return (
            <div
              key={item.key}
              className={cx(
                "vf-multi-progress__item",
                `vf-multi-progress__item--${status}`,
                `vf-multi-progress__item--${tone}`
              )}
            >
              <div className="vf-multi-progress__header">
                <span className="vf-multi-progress__label">{item.label}</span>
                <span className="vf-multi-progress__meta">
                  {statusIcon && (
                    <span
                      className="vf-multi-progress__status"
                      aria-label={status}
                    >
                      {statusIcon}
                    </span>
                  )}
                  {showValues && (
                    <span className="vf-multi-progress__value">
                      {Math.round(pct)}%
                    </span>
                  )}
                  {onCancel && (
                    <button
                      type="button"
                      className="vf-multi-progress__cancel"
                      aria-label={`Cancel ${item.label}`}
                      onClick={() => onCancel(item.key)}
                    >
                      &times;
                    </button>
                  )}
                </span>
              </div>
              <div
                className="vf-multi-progress__bar"
                role="progressbar"
                aria-valuenow={clamped}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-label={item.label}
              >
                <div
                  className={cx(
                    "vf-multi-progress__fill",
                    striped &&
                      status === "active" &&
                      "vf-multi-progress__fill--striped"
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {item.description && (
                <span className="vf-multi-progress__description">
                  {item.description}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);
MultiProgressImpl.displayName = "MultiProgress";
/**
 * Stacked segmented progress bar representing parts-of-a-whole across
 * categories.
 */
export const MultiProgress = memo(MultiProgressImpl);
(MultiProgress as unknown as { displayName: string }).displayName =
  "MultiProgress";
