// Phase 16 — Show / Hide
//
// CSS-based to avoid SSR hydration flash. The subtree uses
// `display: contents` when visible and `display: none` when hidden, so no
// extra wrapper box is inserted in the layout.

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import type { Breakpoint } from "./breakpoints";

type VisibilityBreakpoint = Exclude<Breakpoint, "base">;

export interface ShowProps extends HTMLAttributes<HTMLDivElement> {
  /** Show only at and above this breakpoint. */
  above?: VisibilityBreakpoint;
  /** Show only below this breakpoint. */
  below?: VisibilityBreakpoint;
  /** Show only within the given inclusive range. */
  between?: [VisibilityBreakpoint, VisibilityBreakpoint];
  children?: ReactNode;
}

export const Show = forwardRef<HTMLDivElement, ShowProps>(function Show(
  { above, below, between, className, children, ...props },
  ref
) {
  const classes = visibilityClasses({ above, below, between, mode: "show" });
  return (
    <div
      ref={ref}
      className={cx("vf-visibility", ...classes, className)}
      {...props}
    >
      {children}
    </div>
  );
});
Show.displayName = "Show";

export interface HideProps extends HTMLAttributes<HTMLDivElement> {
  above?: VisibilityBreakpoint;
  below?: VisibilityBreakpoint;
  between?: [VisibilityBreakpoint, VisibilityBreakpoint];
  children?: ReactNode;
}

export const Hide = forwardRef<HTMLDivElement, HideProps>(function Hide(
  { above, below, between, className, children, ...props },
  ref
) {
  const classes = visibilityClasses({ above, below, between, mode: "hide" });
  return (
    <div
      ref={ref}
      className={cx("vf-visibility", ...classes, className)}
      {...props}
    >
      {children}
    </div>
  );
});
Hide.displayName = "Hide";

function visibilityClasses(args: {
  above?: VisibilityBreakpoint;
  below?: VisibilityBreakpoint;
  between?: [VisibilityBreakpoint, VisibilityBreakpoint];
  mode: "show" | "hide";
}): string[] {
  const classes: string[] = [];
  const { above, below, between, mode } = args;
  if (above) classes.push(`vf-${mode}--above-${above}`);
  if (below) classes.push(`vf-${mode}--below-${below}`);
  if (between) {
    classes.push(`vf-${mode}--between-${between[0]}-${between[1]}`);
  }
  return classes;
}
