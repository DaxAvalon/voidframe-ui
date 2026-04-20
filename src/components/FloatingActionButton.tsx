"use client";

import {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils/cx";

export interface FABAction {
  key: string;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

export interface FloatingActionButtonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onClick"> {
  icon: ReactNode;
  label?: string;
  onClick?: () => void;
  actions?: FABAction[];
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "outline";
  offset?: { bottom?: number; right?: number; left?: number };
  style?: CSSProperties;
}

const FloatingActionButtonImpl = forwardRef<
  HTMLDivElement,
  FloatingActionButtonProps
>(function FloatingActionButton(
  {
    icon,
    label,
    onClick,
    actions,
    position = "bottom-right",
    size = "md",
    variant = "outline",
    offset,
    className,
    style,
    ...props
  },
  ref
) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleButtonClick = useCallback(() => {
    if (actions && actions.length > 0) {
      setOpen((prev) => !prev);
    } else {
      onClick?.();
    }
  }, [actions, onClick]);

  const handleActionClick = useCallback(
    (action: FABAction) => {
      action.onClick();
      setOpen(false);
    },
    []
  );

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Only apply sub-keys of `offset` that make sense for the current
  // anchor `position` — e.g. `bottom-right` should not honor `left`.
  const allowLeft = position === "bottom-left";
  const allowRight = position === "bottom-right";
  const allowBottom = true; // all supported positions anchor to bottom
  const composedStyle: CSSProperties = {
    ...(allowBottom && offset?.bottom !== undefined
      ? { "--vf-fab-bottom": `${offset.bottom}px` }
      : {}),
    ...(allowRight && offset?.right !== undefined
      ? { "--vf-fab-right": `${offset.right}px` }
      : {}),
    ...(allowLeft && offset?.left !== undefined
      ? { "--vf-fab-left": `${offset.left}px` }
      : {}),
    ...style,
  } as CSSProperties;

  return (
    <div
      ref={(node) => {
        (containerRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={cx(
        "vf-fab",
        `vf-fab--${position}`,
        `vf-fab--${size}`,
        `vf-fab--${variant}`,
        className
      )}
      style={composedStyle}
      {...props}
    >
      {open && actions && actions.length > 0 && (
        <div className="vf-fab__speed-dial" role="menu">
          {actions.map((action) => (
            <div key={action.key} className="vf-fab__action">
              <span className="vf-fab__action-label">{action.label}</span>
              <button
                type="button"
                className="vf-fab__action-button"
                aria-label={action.label}
                role="menuitem"
                onClick={() => handleActionClick(action)}
              >
                {action.icon}
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        className="vf-fab__button"
        aria-label={label ?? "Floating action"}
        aria-expanded={actions && actions.length > 0 ? open : undefined}
        aria-haspopup={actions && actions.length > 0 ? "menu" : undefined}
        onClick={handleButtonClick}
      >
        <span className="vf-fab__icon" aria-hidden="true">
          {icon}
        </span>
        {label && <span className="vf-fab__label">{label}</span>}
      </button>
    </div>
  );
});
FloatingActionButtonImpl.displayName = "FloatingActionButton";
/**
 * Fixed-position circular action button (material-style FAB). Anchored to a
 * corner; supports an optional expanded action tray.
 */
export const FloatingActionButton = memo(FloatingActionButtonImpl);
(FloatingActionButton as unknown as { displayName: string }).displayName =
  "FloatingActionButton";
