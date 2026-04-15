"use client";

// Phase 8 — ScrollArea
//
// Native overflow container with Voidframe-styled custom scrollbar. Uses
// CSS-only styling so content still scrolls naturally with keyboard/touch/
// trackpad. No JS-driven virtual scrollbar (those fight trackpad inertia).

import {
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
} from "react";
import { cx } from "../utils/cx";

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  /** Explicit height. Accepts any CSS length. Default is auto. */
  height?: number | string;
  maxHeight?: number | string;
  width?: number | string;
  /** Horizontal scrolling. */
  orientation?: "vertical" | "horizontal" | "both";
  /** When to show the scroll thumb. */
  type?: "auto" | "always" | "hover";
  style?: CSSProperties;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  function ScrollArea(
    {
      height,
      maxHeight,
      width,
      orientation = "vertical",
      type = "auto",
      className,
      style,
      ...props
    },
    ref
  ) {
    const merged: CSSProperties = {
      ...(height !== undefined && {
        height: typeof height === "number" ? `${height}px` : height,
      }),
      ...(maxHeight !== undefined && {
        maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
      }),
      ...(width !== undefined && {
        width: typeof width === "number" ? `${width}px` : width,
      }),
      ...style,
    };
    return (
      <div
        ref={ref}
        className={cx(
          "vf-scroll-area",
          `vf-scroll-area--${orientation}`,
          `vf-scroll-area--${type}`,
          className
        )}
        style={merged}
        {...props}
      />
    );
  }
);
ScrollArea.displayName = "ScrollArea";
