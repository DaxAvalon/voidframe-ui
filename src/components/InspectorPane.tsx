"use client";

// InspectorPane — a persistent, non-modal side pane: a header with a title,
// optional actions and a close control, a body that scrolls on its own, and
// an optional footer. Use it as `AppShell rightPanel`, inside a
// `ResizablePanel`, or beside a canvas.

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import { Button } from "./Button";

export interface InspectorPaneProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Heading element for the title. Default `h2`. */
  titleAs?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  /** Buttons rendered in the header before the close control. */
  actions?: ReactNode;
  /** Shows a close control that calls it. */
  onClose?: () => void;
  /** Accessible name of the close control. Default "Close panel". */
  closeLabel?: string;
  /** Pinned under the scrolling body. */
  footer?: ReactNode;
  /** Remove the body padding, for canvases and lists that pad themselves. */
  padded?: boolean;
  /** Fixed width; by default the pane fills its container. */
  width?: number | string;
  children?: ReactNode;
}

export const InspectorPane = forwardRef<HTMLElement, InspectorPaneProps>(function InspectorPane(
  {
    title,
    subtitle,
    titleAs: TitleTag = "h2",
    actions,
    onClose,
    closeLabel = "Close panel",
    footer,
    padded = true,
    width,
    className,
    style,
    children,
    "aria-label": ariaLabel,
    ...props
  },
  ref
) {
  return (
    <aside
      ref={ref}
      className={cx("vf-inspector", !padded && "vf-inspector--unpadded", className)}
      style={width !== undefined ? { width, flex: "none", ...style } : style}
      aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)}
      {...props}
    >
      <header className="vf-inspector__header">
        <div className="vf-inspector__heading">
          <TitleTag className="vf-inspector__title">{title}</TitleTag>
          {subtitle && <div className="vf-inspector__subtitle">{subtitle}</div>}
        </div>
        {(actions || onClose) && (
          <div className="vf-inspector__actions">
            {actions}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                aria-label={closeLabel}
                onClick={onClose}
                className="vf-inspector__close"
              >
                ×
              </Button>
            )}
          </div>
        )}
      </header>
      <div className="vf-inspector__body">{children}</div>
      {footer && <footer className="vf-inspector__footer">{footer}</footer>}
    </aside>
  );
});
InspectorPane.displayName = "InspectorPane";
