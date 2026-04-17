"use client";

import {
  cloneElement,
  forwardRef,
  isValidElement,
  memo,
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { useControllableState } from "../hooks/useControllableState";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { Portal } from "../primitives/Portal";
import { cx } from "../utils/cx";

export interface PopconfirmProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "default" | "accent" | "danger";
  icon?: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  children: ReactElement;
}

const PopconfirmImpl = forwardRef<HTMLDivElement, PopconfirmProps>(
  function Popconfirm(
    {
      title,
      description,
      onConfirm,
      onCancel,
      confirmLabel = "Confirm",
      cancelLabel = "Cancel",
      confirmVariant = "default",
      icon,
      placement = "top",
      open,
      defaultOpen,
      onOpenChange,
      disabled,
      children,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [isOpen, setIsOpen] = useControllableState<boolean>({
      value: open,
      defaultValue: defaultOpen ?? false,
      onChange: onOpenChange,
      componentName: "Popconfirm",
    });

    const confirmRef = useRef<HTMLButtonElement>(null);

    const close = useCallback(() => {
      setIsOpen(false);
    }, [setIsOpen]);

    const handleTriggerClick = useCallback(() => {
      if (disabled) return;
      setIsOpen(!isOpen);
    }, [disabled, isOpen, setIsOpen]);

    const handleConfirm = useCallback(() => {
      onConfirm();
      close();
    }, [onConfirm, close]);

    const handleCancel = useCallback(() => {
      onCancel?.();
      close();
    }, [onCancel, close]);

    useEscapeKey(close, isOpen);

    // Focus the confirm button when opened
    useEffect(() => {
      if (isOpen) {
        // Delay to allow Portal to mount
        const frame = requestAnimationFrame(() => {
          confirmRef.current?.focus();
        });
        return () => cancelAnimationFrame(frame);
      }
    }, [isOpen]);

    // Clone trigger to attach click handler
    const trigger = isValidElement(children)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          onClick: (e: React.MouseEvent) => {
            handleTriggerClick();
            const childOnClick = (
              children as ReactElement<Record<string, unknown>>
            ).props.onClick as
              | ((e: React.MouseEvent) => void)
              | undefined;
            childOnClick?.(e);
          },
          "aria-haspopup": "dialog",
          "aria-expanded": isOpen,
        })
      : children;

    return (
      <div
        ref={ref}
        className={cx("vf-popconfirm", className)}
        style={style}
        {...props}
      >
        {trigger}
        {isOpen && (
          <Portal>
            <div
              className={cx(
                "vf-popconfirm__overlay",
                `vf-popconfirm__overlay--${placement}`,
                confirmVariant === "danger" && "vf-popconfirm--danger"
              )}
              role="dialog"
              aria-label={title}
            >
              {icon && (
                <span className="vf-popconfirm__icon" aria-hidden="true">
                  {icon}
                </span>
              )}
              <div className="vf-popconfirm__title">{title}</div>
              {description && (
                <div className="vf-popconfirm__description">{description}</div>
              )}
              <div className="vf-popconfirm__actions">
                <button
                  type="button"
                  className="vf-button vf-button--sm vf-button--default"
                  onClick={handleCancel}
                >
                  {cancelLabel}
                </button>
                <button
                  ref={confirmRef}
                  type="button"
                  className={cx(
                    "vf-button vf-button--sm",
                    confirmVariant === "danger"
                      ? "vf-button--danger"
                      : confirmVariant === "accent"
                        ? "vf-button--accent"
                        : "vf-button--default"
                  )}
                  onClick={handleConfirm}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </Portal>
        )}
      </div>
    );
  }
);
PopconfirmImpl.displayName = "Popconfirm";
export const Popconfirm = memo(PopconfirmImpl);
(Popconfirm as unknown as { displayName: string }).displayName = "Popconfirm";
