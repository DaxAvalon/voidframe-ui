"use client";

import { forwardRef, type HTMLAttributes } from "react";
import type { Orientation } from "../types";

export interface SeparatorProps extends HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation;
  /**
   * When true, the separator is purely visual (role="none") so it doesn't
   * introduce semantics. When false (default), uses role="separator" with
   * aria-orientation.
   */
  decorative?: boolean;
}

/**
 * Headless separator with correct ARIA semantics.
 * Unstyled by default — size/color come from the consumer.
 */
export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(
  function Separator(
    { orientation = "horizontal", decorative = false, style, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : orientation}
        style={style}
        {...props}
      />
    );
  }
);
Separator.displayName = "Separator";
