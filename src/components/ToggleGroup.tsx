"use client";

import {
  forwardRef,
  memo,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { cx } from "../utils/cx";

export interface ToggleGroupItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ToggleGroupProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  items: ToggleGroupItem[];
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (keys: string[]) => void;
  variant?: "default" | "ghost" | "accent";
  size?: "sm" | "md" | "lg";
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  /** When false, prevents deselecting the last active toggle. Default: true. */
  allowEmpty?: boolean;
}

const ToggleGroupImpl = forwardRef<HTMLDivElement, ToggleGroupProps>(
  function ToggleGroup(
    {
      items,
      value,
      defaultValue,
      onValueChange,
      variant = "default",
      size = "md",
      orientation = "horizontal",
      disabled = false,
      allowEmpty = true,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [current, setCurrent] = useControllableState<string[]>({
      value,
      defaultValue: defaultValue ?? [],
      onChange: onValueChange,
      componentName: "ToggleGroup",
    });

    const itemsRef = useRef<Array<HTMLButtonElement | null>>([]);

    const toggle = (key: string) => {
      const isActive = current.includes(key);
      if (isActive) {
        if (!allowEmpty && current.length <= 1) return;
        setCurrent(current.filter((k) => k !== key));
      } else {
        setCurrent([...current, key]);
      }
    };

    const focusItem = (index: number) => {
      const enabledItems = items.reduce<number[]>((acc, item, i) => {
        if (!item.disabled && !disabled) acc.push(i);
        return acc;
      }, []);
      if (enabledItems.length === 0) return;

      // Find the enabled item relative to the given index
      const currentEnabledIdx = enabledItems.indexOf(index);
      if (currentEnabledIdx !== -1) {
        itemsRef.current[index]?.focus();
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      const focusedEl = document.activeElement;
      const currentIdx = itemsRef.current.findIndex((el) => el === focusedEl);
      if (currentIdx === -1) return;

      const isHorizontal = orientation === "horizontal";
      const nextKey = isHorizontal ? "ArrowRight" : "ArrowDown";
      const prevKey = isHorizontal ? "ArrowLeft" : "ArrowUp";

      const enabledIndices = items.reduce<number[]>((acc, item, i) => {
        if (!item.disabled && !disabled) acc.push(i);
        return acc;
      }, []);
      if (enabledIndices.length === 0) return;

      const currentEnabledPos = enabledIndices.indexOf(currentIdx);

      if (e.key === nextKey) {
        e.preventDefault();
        const nextPos =
          currentEnabledPos === -1
            ? 0
            : (currentEnabledPos + 1) % enabledIndices.length;
        const nextIdx = enabledIndices[nextPos]!;
        itemsRef.current[nextIdx]?.focus();
      } else if (e.key === prevKey) {
        e.preventDefault();
        const prevPos =
          currentEnabledPos === -1
            ? enabledIndices.length - 1
            : (currentEnabledPos - 1 + enabledIndices.length) %
              enabledIndices.length;
        const prevIdx = enabledIndices[prevPos]!;
        itemsRef.current[prevIdx]?.focus();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        const item = items[currentIdx];
        if (item && !item.disabled && !disabled) {
          toggle(item.key);
        }
      }
    };

    return (
      <div
        ref={ref}
        role="group"
        className={cx(
          "vf-toggle-group",
          `vf-toggle-group--${variant}`,
          `vf-toggle-group--${size}`,
          orientation === "vertical" && "vf-toggle-group--vertical",
          className
        )}
        style={style}
        onKeyDown={handleKeyDown}
        data-disabled={disabled ? "true" : undefined}
        {...props}
      >
        {items.map((item, i) => {
          const isActive = current.includes(item.key);
          const isDisabled = disabled || !!item.disabled;
          return (
            <button
              key={item.key}
              ref={(el) => {
                itemsRef.current[i] = el;
              }}
              type="button"
              className={cx(
                "vf-toggle-group__item",
                isActive && "vf-toggle-group__item--active"
              )}
              aria-pressed={isActive}
              aria-label={item.label}
              disabled={isDisabled}
              tabIndex={i === 0 ? 0 : -1}
              onClick={() => {
                if (!isDisabled) toggle(item.key);
              }}
            >
              {item.icon && (
                <span aria-hidden="true" className="vf-toggle-group__icon">
                  {item.icon}
                </span>
              )}
              {item.label}
            </button>
          );
        })}
      </div>
    );
  }
);
ToggleGroupImpl.displayName = "ToggleGroup";
export const ToggleGroup = memo(ToggleGroupImpl);
(ToggleGroup as unknown as { displayName: string }).displayName = "ToggleGroup";
