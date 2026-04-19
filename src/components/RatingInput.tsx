"use client";

// Phase 7.3 — RatingInput
//
// Star-based rating control (count configurable). Supports:
//   - read-only display
//   - half-step selections via `allowHalf`
//   - keyboard navigation (Arrow keys, Home/End)
//   - custom icon renderer (override ★)
//
// ARIA: `role="slider"` with aria-valuemin/max/now/text, since it's a discrete
// value-selection control.

import {
  forwardRef,
  useCallback,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useId } from "../hooks/useId";
import { cx } from "../utils/cx";
import { Label } from "./Text";

export interface RatingInputProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  label?: string;
  /** Number of steps (stars). Default 5. */
  count?: number;
  /** Allow half-step values. */
  allowHalf?: boolean;
  /** Read-only display mode. */
  readOnly?: boolean;
  disabled?: boolean;
  /** Custom icon. Default is a filled/empty star glyph. */
  renderIcon?: (state: { filled: number; index: number }) => ReactNode;
  id?: string;
  style?: CSSProperties;
}

const STAR_FULL = "★";
const STAR_EMPTY = "☆";

export const RatingInput = forwardRef<HTMLDivElement, RatingInputProps>(
  function RatingInput(
    {
      value,
      defaultValue,
      onValueChange,
      label,
      count = 5,
      allowHalf,
      readOnly,
      disabled,
      renderIcon,
      id,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [current, setCurrent] = useControllableState<number>({
      value,
      defaultValue: defaultValue ?? 0,
      onChange: onValueChange,
      componentName: "RatingInput",
    });

    const [hover, setHover] = useState<number | null>(null);
    const controlId = useId(id);
    const labelId = useId();

    const interactive = !readOnly && !disabled;
    const step = allowHalf ? 0.5 : 1;

    const setValueClamped = useCallback(
      (next: number) => {
        const v = Math.max(0, Math.min(count, Math.round(next / step) * step));
        setCurrent(v);
      },
      [count, step, setCurrent]
    );

    const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
      if (!interactive) return;
      if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        setValueClamped(current + step);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        setValueClamped(current - step);
      } else if (e.key === "Home") {
        e.preventDefault();
        setValueClamped(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setValueClamped(count);
      }
    };

    const handleStarClick = (e: ReactMouseEvent<HTMLSpanElement>, idx: number) => {
      if (!interactive) return;
      if (allowHalf) {
        const rect = e.currentTarget.getBoundingClientRect();
        const isLeftHalf = e.clientX - rect.left < rect.width / 2;
        setValueClamped(idx + (isLeftHalf ? 0.5 : 1));
      } else {
        setValueClamped(idx + 1);
      }
    };

    const displayValue = hover ?? current;

    return (
      <div
        ref={ref}
        id={controlId}
        className={cx("vf-rating-input", disabled && "vf-rating-input--disabled", className)}
        style={style}
        {...props}
      >
        {label && (
          <Label id={labelId}>
            {label}
          </Label>
        )}
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={0}
          aria-valuemax={count}
          aria-valuenow={current}
          aria-valuetext={`${current} out of ${count}`}
          aria-readonly={readOnly || undefined}
          aria-disabled={disabled || undefined}
          aria-labelledby={label ? labelId : undefined}
          aria-label={!label ? "Rating" : undefined}
          onKeyDown={handleKey}
          className="vf-rating-input__stars"
        >
          {Array.from({ length: count }).map((_, idx) => {
            const fillLevel = Math.max(0, Math.min(1, displayValue - idx));
            const iconNode = renderIcon ? (
              renderIcon({ filled: fillLevel, index: idx })
            ) : (
              <span className="vf-rating-input__glyph">
                {fillLevel >= 1 ? STAR_FULL : fillLevel >= 0.5 ? "⯨" : STAR_EMPTY}
              </span>
            );
            return (
              <span
                key={idx}
                className={cx(
                  "vf-rating-input__star",
                  fillLevel >= 1 && "vf-rating-input__star--filled",
                  fillLevel > 0 && fillLevel < 1 && "vf-rating-input__star--half"
                )}
                aria-hidden="true"
                data-disabled={!interactive || undefined}
                onClick={(e) => interactive && handleStarClick(e, idx)}
                onMouseEnter={() => interactive && setHover(idx + 1)}
                onMouseMove={(e) => {
                  if (!interactive || !allowHalf) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const isLeftHalf = e.clientX - rect.left < rect.width / 2;
                  setHover(idx + (isLeftHalf ? 0.5 : 1));
                }}
                onMouseLeave={() => setHover(null)}
              >
                {iconNode}
              </span>
            );
          })}
        </div>
      </div>
    );
  }
);
RatingInput.displayName = "RatingInput";
