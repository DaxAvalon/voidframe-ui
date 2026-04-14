import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

export interface SkipToContentProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Fragment or ID of the main content target. */
  href: string;
  children?: ReactNode;
}

/**
 * Keyboard-only skip link. Hidden visually until focused (Tab as the first
 * interactive element on the page), then renders as a prominent button.
 * Jumps focus to the target (typically `<main id="main">`).
 *
 * Place as the first element inside your page root.
 */
export const SkipToContent = forwardRef<HTMLAnchorElement, SkipToContentProps>(
  function SkipToContent({ href, children = "Skip to main content", className, ...props }, ref) {
    return (
      <a
        ref={ref}
        href={href}
        className={cx("vf-skip-to-content", className)}
        {...props}
      >
        {children}
      </a>
    );
  }
);
SkipToContent.displayName = "SkipToContent";
