"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useRef,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useId } from "../hooks/useId";
import { cx } from "../utils/cx";
import { Label } from "./Text";

export interface NumberStepperProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  /** Increment/decrement amount. Default: 1. */
  step?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  readOnly?: boolean;
  /** Custom display formatter, e.g. `(v) => "$" + v`. */
  formatValue?: (value: number) => string;
  label?: string;
  /** Show value as text only (no editable input). */
  hideInput?: boolean;
}

/**
 * Numeric input with +/- buttons. Thinner than `NumberInput` for table cells
 * and toolbars.
 */
export const NumberStepper = memo(
  forwardRef<HTMLDivElement, NumberStepperProps>(function NumberStepper(
    {
      value,
      defaultValue,
      onValueChange,
      min,
      max,
      step = 1,
      size = "md",
      disabled,
      readOnly,
      formatValue,
      label,
      hideInput,
      className,
      ...props
    },
    ref,
  ) {
    const [current, setCurrent] = useControllableState<number>({
      value,
      defaultValue: defaultValue ?? min ?? 0,
      onChange: onValueChange,
      componentName: "NumberStepper",
    });

    const labelId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [draft, setDraft] = useState<string | null>(null);

    const clamp = useCallback(
      (v: number): number => {
        let n = v;
        if (min !== undefined) n = Math.max(min, n);
        if (max !== undefined) n = Math.min(max, n);
        return n;
      },
      [min, max],
    );

    const increment = () => {
      if (disabled || readOnly) return;
      setCurrent(clamp(current + step));
    };

    const decrement = () => {
      if (disabled || readOnly) return;
      setCurrent(clamp(current - step));
    };

    const atMin = min !== undefined && current <= min;
    const atMax = max !== undefined && current >= max;

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (disabled || readOnly) return;
      if (e.key === "ArrowUp") {
        e.preventDefault();
        increment();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        decrement();
      }
    };

    const handleBlur = () => {
      if (draft === null) return;
      const parsed = Number(draft);
      if (isNaN(parsed)) {
        setDraft(null);
        return;
      }
      setCurrent(clamp(parsed));
      setDraft(null);
    };

    const displayValue = formatValue ? formatValue(current) : String(current);

    return (
      <div
        ref={ref}
        className={cx(
          "vf-number-stepper",
          `vf-number-stepper--${size}`,
          disabled && "vf-number-stepper--disabled",
          className,
        )}
        {...props}
      >
        {label && <Label id={labelId}>{label}</Label>}
        <div className="vf-number-stepper__controls">
          <button
            type="button"
            className="vf-number-stepper__decrement"
            aria-label="Decrement"
            disabled={disabled || atMin}
            onClick={decrement}
          >
            −
          </button>
          {hideInput ? (
            <span
              className="vf-number-stepper__value"
              role="spinbutton"
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={current}
              aria-valuetext={formatValue ? displayValue : undefined}
              aria-labelledby={label ? labelId : undefined}
              tabIndex={disabled ? undefined : 0}
              onKeyDown={handleKeyDown}
            >
              {displayValue}
            </span>
          ) : (
            <input
              ref={inputRef}
              className="vf-number-stepper__value"
              role="spinbutton"
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={current}
              aria-valuetext={formatValue ? displayValue : undefined}
              aria-labelledby={label ? labelId : undefined}
              type="text"
              inputMode="numeric"
              value={draft !== null ? draft : displayValue}
              disabled={disabled}
              readOnly={readOnly}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
            />
          )}
          <button
            type="button"
            className="vf-number-stepper__increment"
            aria-label="Increment"
            disabled={disabled || atMax}
            onClick={increment}
          >
            +
          </button>
        </div>
      </div>
    );
  }),
);
NumberStepper.displayName = "NumberStepper";
