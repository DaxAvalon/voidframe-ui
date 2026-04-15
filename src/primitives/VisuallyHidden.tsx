"use client";

import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from "react";

export const visuallyHiddenStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

/**
 * Visually hides its children while keeping them accessible to assistive tech.
 * Use for icon-only button labels, skip links, form hints, and live regions.
 */
export const VisuallyHidden = forwardRef<HTMLSpanElement, VisuallyHiddenProps>(
  function VisuallyHidden({ children, style, ...props }, ref) {
    return (
      <span ref={ref} style={{ ...visuallyHiddenStyle, ...style }} {...props}>
        {children}
      </span>
    );
  }
);
VisuallyHidden.displayName = "VisuallyHidden";
