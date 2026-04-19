"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  CSSProperties,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
} from "react";
import { cx } from "../utils/cx";

export interface SplitButtonAction {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
}

export interface SplitButtonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  label: string;
  onClick: () => void;
  actions: SplitButtonAction[];
  onAction: (key: string) => void;
  variant?: "solid" | "outline" | "ghost" | "subtle";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

const SplitButtonImpl = forwardRef<HTMLDivElement, SplitButtonProps>(
  function SplitButton(
    {
      label,
      onClick,
      actions,
      onAction,
      variant = "outline",
      size = "md",
      disabled,
      loading,
      icon,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [open, setOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const rootRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const isDisabled = disabled || loading;

    // Close on click outside
    useEffect(() => {
      if (!open) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (
          rootRef.current &&
          !rootRef.current.contains(e.target as Node)
        ) {
          setOpen(false);
          setFocusedIndex(-1);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    // Close on Escape
    useEffect(() => {
      if (!open) return;
      const handleEscape = (e: globalThis.KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false);
          setFocusedIndex(-1);
        }
      };
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }, [open]);

    const handleCaretClick = useCallback(() => {
      if (isDisabled) return;
      setOpen((prev) => {
        if (!prev) setFocusedIndex(-1);
        return !prev;
      });
    }, [isDisabled]);

    const handleItemClick = useCallback(
      (action: SplitButtonAction) => {
        if (action.disabled) return;
        onAction(action.key);
        setOpen(false);
        setFocusedIndex(-1);
      },
      [onAction]
    );

    const getNextEnabledIndex = (current: number, delta: number): number => {
      const len = actions.length;
      if (len === 0) return -1;
      let next = current;
      for (let i = 0; i < len; i++) {
        next = (next + delta + len) % len;
        if (!actions[next]?.disabled) return next;
      }
      return -1;
    };

    const handleMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = getNextEnabledIndex(focusedIndex, 1);
        setFocusedIndex(next);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const next = getNextEnabledIndex(focusedIndex, -1);
        setFocusedIndex(next);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (focusedIndex >= 0 && actions[focusedIndex] && !actions[focusedIndex].disabled) {
          handleItemClick(actions[focusedIndex]);
        }
      }
    };

    // Focus the active menu item when focusedIndex changes
    useEffect(() => {
      if (!open || focusedIndex < 0) return;
      const menu = menuRef.current;
      if (!menu) return;
      const items = menu.querySelectorAll<HTMLElement>('[role="menuitem"]');
      items[focusedIndex]?.focus();
    }, [focusedIndex, open]);

    const composedClass = cx(
      "vf-split-button",
      `vf-split-button--${variant}`,
      `vf-split-button--${size}`,
      className
    );

    return (
      <div
        ref={(node) => {
          (rootRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={composedClass}
        style={style}
        {...props}
      >
        <button
          type="button"
          className="vf-split-button__primary"
          onClick={isDisabled ? undefined : onClick}
          aria-disabled={isDisabled || undefined}
          data-disabled={isDisabled ? "true" : undefined}
        >
          {loading ? (
            <span className="vf-split-button__spinner" aria-hidden="true">
              &#x27F3;
            </span>
          ) : icon ? (
            <span className="vf-split-button__icon" aria-hidden="true">
              {icon}
            </span>
          ) : null}
          {label}
        </button>
        <button
          type="button"
          className="vf-split-button__caret"
          onClick={handleCaretClick}
          aria-disabled={isDisabled || undefined}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="More actions"
          data-disabled={isDisabled ? "true" : undefined}
        >
          <span aria-hidden="true">&#x25BC;</span>
        </button>
        {open && (
          <div
            ref={menuRef}
            className="vf-split-button__menu"
            role="menu"
            onKeyDown={handleMenuKeyDown}
          >
            {actions.map((action, i) => (
              <div
                key={action.key}
                role="menuitem"
                tabIndex={action.disabled ? -1 : 0}
                className={cx(
                  "vf-split-button__menu-item",
                  action.danger && "vf-split-button__menu-item--danger",
                  action.disabled && "vf-split-button__menu-item--disabled"
                )}
                aria-disabled={action.disabled || undefined}
                data-focused={focusedIndex === i ? "true" : undefined}
                onClick={() => handleItemClick(action)}
                onMouseEnter={() => setFocusedIndex(i)}
              >
                {action.icon && (
                  <span
                    className="vf-split-button__menu-item-icon"
                    aria-hidden="true"
                  >
                    {action.icon}
                  </span>
                )}
                {action.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);
SplitButtonImpl.displayName = "SplitButton";
export const SplitButton = memo(SplitButtonImpl);
(SplitButton as unknown as { displayName: string }).displayName =
  "SplitButton";
